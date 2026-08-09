#!/usr/bin/env node
/* Risk Cockpit API — the live backend for the desk.
 *
 * One JSON document (the "desk") plus a revision counter, served over REST.
 * The contract agents write against is documented in AGENTS.md; the desk UI
 * speaks the same contract.
 *
 * Storage:
 *   DATABASE_URL set     → Postgres, single-row jsonb table. The durable home.
 *   DATABASE_URL absent  → local file ./desk-local.json, for development only.
 *
 * Env:
 *   PORT         listen port (default 8787)
 *   DATABASE_URL Postgres connection string (Replit provides this)
 *   WRITE_TOKEN  bearer token required on every write
 *
 * Zero dependencies in file mode; `pg` is loaded only when DATABASE_URL is set.
 */
import http from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 8787;
const TOKEN = process.env.WRITE_TOKEN || "";
const PG_URL = process.env.DATABASE_URL || "";
const LOCAL_FILE = join(dirname(fileURLToPath(import.meta.url)), "desk-local.json");
const SEED_URL = "https://lionscraft-io.github.io/risk-cockpit/data/desk.json";

const KINDS = ["comment", "change", "finding", "question", "handoff"];
const REFTYPES = ["partner", "task", "milestone", "board"];
const ARRAYS = ["partners", "tasks", "milestones", "workstreams", "activity"];

/* ── Storage ─────────────────────────────────────────────────────────── */

let pool = null;

async function initStore(){
  if (PG_URL){
    const { default: pg } = await import("pg");
    /* Managed Postgres (Replit, Neon, …) often presents a certificate Node
       will not verify. Accept it for the database connection only — never
       process-wide via NODE_TLS_REJECT_UNAUTHORIZED. */
    const local = /localhost|127\.0\.0\.1/.test(PG_URL);
    pool = new pg.Pool({
      connectionString: PG_URL,
      ssl: local ? undefined : { rejectUnauthorized: false }
    });
    await pool.query(
      "CREATE TABLE IF NOT EXISTS desk_store (id int PRIMARY KEY, doc jsonb NOT NULL)");
    console.log("storage: postgres");
  } else {
    console.log("storage: local file (development only) — " + LOCAL_FILE);
  }
  if (!(await loadDesk())) await seed();
}

async function loadDesk(){
  if (pool){
    const r = await pool.query("SELECT doc FROM desk_store WHERE id = 1");
    return r.rows.length ? r.rows[0].doc : null;
  }
  if (!existsSync(LOCAL_FILE)) return null;
  try { return JSON.parse(readFileSync(LOCAL_FILE, "utf8")); } catch { return null; }
}

async function storeDesk(doc){
  if (pool){
    await pool.query(
      "INSERT INTO desk_store (id, doc) VALUES (1, $1) " +
      "ON CONFLICT (id) DO UPDATE SET doc = $1", [doc]);
  } else {
    writeFileSync(LOCAL_FILE, JSON.stringify(doc, null, 2) + "\n");
  }
}

async function seed(){
  /* Prefer the repo's own copy — this server normally runs from a clone of the
     repo. Fall back to the public Pages URL. */
  let doc = null;
  const local = join(ROOT, "data", "desk.json");
  if (existsSync(local)){
    try { doc = JSON.parse(readFileSync(local, "utf8")); } catch {}
  }
  if (!doc){
    const res = await fetch(SEED_URL);
    if (!res.ok) throw new Error("seed fetch failed: HTTP " + res.status);
    doc = await res.json();
  }
  if (!Array.isArray(doc.activity)) doc.activity = [];
  await storeDesk(doc);
  console.log("seeded desk at revision " + doc.meta.revision +
    " (" + doc.partners.length + " partners, " + doc.tasks.length + " tasks)");
}

/* ── The desk UI, served from the repo checkout ──────────────────────── */

const HTML_PATH = join(ROOT, "lionscraft-platform.html");
function readHtml(){
  try { return readFileSync(HTML_PATH, "utf8"); } catch { return null; }
}

/* ── HTTP plumbing ───────────────────────────────────────────────────── */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,PUT,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-max-age": "86400"
};
const send = (res, code, obj, headers) =>
  { res.writeHead(code, Object.assign({"content-type": "application/json"}, CORS, headers)); res.end(JSON.stringify(obj)); };
const authed = req => TOKEN && (req.headers.authorization || "") === "Bearer " + TOKEN;

function readBody(req){
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", d => {
      size += d.length;
      if (size > 5 * 1024 * 1024){ reject(new Error("too_large")); req.destroy(); return; }
      chunks.push(d);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/* Serialize writes so two concurrent requests cannot interleave their
   read-modify-write cycles. */
let writeChain = Promise.resolve();
const serialized = fn => {
  const p = writeChain.then(fn, fn);
  writeChain = p.catch(() => {});
  return p;
};

/* ── Request handling ────────────────────────────────────────────────── */

async function handle(req, res){
  const url = new URL(req.url, "http://x");
  const path = url.pathname;

  if (req.method === "OPTIONS"){ res.writeHead(204, CORS); res.end(); return; }

  /* Health: never touches storage — a deployment health check must not die
     on a cold database. */
  if (req.method === "GET" && path === "/healthz")
    return send(res, 200, { ok: true });

  if (req.method === "GET" && (path === "/" || path === "/lionscraft-platform.html")){
    const html = readHtml();
    if (!html) return send(res, 503, { error: "frontend_unavailable" });
    res.writeHead(200, Object.assign({"content-type": "text/html; charset=utf-8"}, CORS));
    res.end(html);
    return;
  }

  if (req.method === "GET" && (path === "/api/desk" || path === "/data/desk.json")){
    const desk = await loadDesk();
    if (!desk) return send(res, 503, { error: "not_seeded" });
    return path === "/api/desk"
      ? send(res, 200, { revision: desk.meta.revision, desk })
      : send(res, 200, desk);
  }

  if (req.method === "GET" && path === "/api/activity"){
    const desk = await loadDesk();
    if (!desk) return send(res, 503, { error: "not_seeded" });
    const since = url.searchParams.get("since");
    const events = since ? desk.activity.filter(e => (e.at || "") > since) : desk.activity;
    return send(res, 200, { revision: desk.meta.revision, events });
  }

  if (req.method === "PUT" && path === "/api/desk"){
    if (!TOKEN) return send(res, 500, { error: "server_misconfiguration", detail: "WRITE_TOKEN not set" });
    if (!authed(req)) return send(res, 401, { error: "unauthorized" });
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return send(res, e.message === "too_large" ? 413 : 400, { error: e.message === "too_large" ? "too_large" : "bad_json" }); }
    return serialized(async () => {
      const cur = await loadDesk();
      for (const k of ARRAYS)
        if (!Array.isArray(body[k])) return send(res, 400, { error: "missing_" + k });
      if (body.activity.length < cur.activity.length)
        return send(res, 400, { error: "activity_is_append_only" });
      if (!body.meta || body.meta.revision !== cur.meta.revision + 1)
        return send(res, 409, { error: "revision_conflict", current: cur.meta.revision });
      await storeDesk(body);
      console.log("PUT /api/desk → rev " + body.meta.revision);
      return send(res, 200, { revision: body.meta.revision });
    });
  }

  if (req.method === "POST" && path === "/api/activity"){
    if (!TOKEN) return send(res, 500, { error: "server_misconfiguration", detail: "WRITE_TOKEN not set" });
    if (!authed(req)) return send(res, 401, { error: "unauthorized" });
    let e;
    try { e = JSON.parse(await readBody(req)); }
    catch (err) { return send(res, err.message === "too_large" ? 413 : 400, { error: err.message === "too_large" ? "too_large" : "bad_json" }); }
    if (!e || typeof e.actor !== "string" || !e.actor.trim())
      return send(res, 400, { error: "actor_required" });
    return serialized(async () => {
      const desk = await loadDesk();
      const event = {
        id: typeof e.id === "string" && e.id ? e.id : "e_" + randomBytes(4).toString("hex"),
        at: typeof e.at === "string" && !isNaN(Date.parse(e.at)) ? e.at : new Date().toISOString(),
        actor: e.actor.trim(),
        actorKind: e.actorKind === "human" ? "human" : "agent",
        kind: KINDS.includes(e.kind) ? e.kind : "comment",
        refType: REFTYPES.includes(e.refType) ? e.refType : "board",
        ref: typeof e.ref === "string" ? e.ref : "",
        body: typeof e.body === "string" ? e.body : ""
      };
      if (typeof e.to === "string" && e.to) event.to = e.to;
      desk.activity.push(event);
      desk.meta.revision += 1;
      desk.meta.updated = new Date().toISOString().slice(0, 10);
      await storeDesk(desk);
      console.log("POST /api/activity from " + event.actor + " → rev " + desk.meta.revision);
      return send(res, 200, { revision: desk.meta.revision, event });
    });
  }

  send(res, 404, { error: "not_found" });
}

/* ── Boot ────────────────────────────────────────────────────────────── */

/* Listen first, initialize storage second: a deployment health check must get
   its 200 even while the database is still coming up. Until storage is ready,
   data endpoints answer 503 not_seeded and recover on their own — a failed
   init retries rather than leaving a permanently dead process. */
http.createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error(err);
    try { send(res, 500, { error: "internal", detail: String(err.message || err) }); } catch {}
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log("risk-cockpit api listening on 0.0.0.0:" + PORT +
    (TOKEN ? "" : "  — WARNING: WRITE_TOKEN not set, writes disabled"));
});

(async function bootStore(){
  for (let attempt = 1; ; attempt++){
    try { await initStore(); return; }
    catch (err){
      console.error("storage init failed (attempt " + attempt + "): " + (err.message || err));
      await new Promise(r => setTimeout(r, Math.min(30000, attempt * 5000)));
    }
  }
})();
