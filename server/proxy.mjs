#!/usr/bin/env node
/* Risk Cockpit write proxy.
 *
 * The board lives in GitHub. This holds the GitHub token so browsers never
 * need one: a person signs in with a short app password, and the proxy makes
 * the commit on their behalf. Reads are public and need nothing.
 *
 * The desk keeps working without this — GitHub Pages still serves the board
 * read-only — so an outage here costs writes, not the whole thing.
 *
 * Env:
 *   PORT           listen port (default 8788)
 *   GITHUB_TOKEN   fine-grained PAT, Contents: read and write on REPO
 *   APP_PASSWORD   what people type into the desk instead of a GitHub token
 *   REPO           owner/name             (default Lionscraft-io/risk-cockpit)
 *   BRANCH         branch to commit to    (default main)
 *   GH_API         GitHub API base        (override only for testing)
 *
 * No dependencies.
 */
import http from "node:http";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const PORT      = Number(process.env.PORT) || 8788;
const GH_TOKEN  = process.env.GITHUB_TOKEN || "";
const PASSWORD  = process.env.APP_PASSWORD || "";
const REPO      = process.env.REPO || "Lionscraft-io/risk-cockpit";
const BRANCH    = process.env.BRANCH || "main";
const GH_API    = process.env.GH_API || "https://api.github.com";

/* The other kanban. Tasks there labelled BRIDGE_LABEL are surfaced on this
   board. Fetched here rather than in the browser: no CORS, no per-viewer rate
   limit, and one request instead of one per task file. */
const BRIDGE_REPO  = process.env.BRIDGE_REPO  || "toniilein/workforce";
const BRIDGE_DIR   = process.env.BRIDGE_DIR   || "tasks";
const BRIDGE_LABEL = process.env.BRIDGE_LABEL || "risk";
/* Writing back needs a token that can write to the OTHER repo. Usually the
   same one, scoped to both; BRIDGE_TOKEN lets it be a separate one. */
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN || process.env.GITHUB_TOKEN || "";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* The desk itself. When this server can reach GitHub it serves the repo's own
   copy of the page, cached for a minute — the UI visitors get always matches
   the repository, even if this deployment's checkout has fallen behind. The
   checkout's copy is the fallback when GitHub cannot be reached, and the only
   source in development mode. */
const HTML = join(ROOT, "lionscraft-platform.html");

/* With no GitHub token this reads and writes the checkout's own data/ files
   instead of committing. That is development mode: run it, open it, edit the
   board, and inspect what changed with `git diff` — no credentials, and no way
   to touch the real repository by accident. */
const LOCAL = !GH_TOKEN;

const FILES = [
  {key:"meta",        path:"data/meta.json",              wrap:true},
  {key:"partners",    path:"data/partners/partners.json"},
  {key:"stages",      path:"data/partners/stages.json"},
  {key:"workstreams", path:"data/plan/workstreams.json"},
  {key:"tasks",       path:"data/plan/tasks.json"},
  {key:"milestones",  path:"data/plan/milestones.json"},
  {key:"columns",     path:"data/plan/columns.json"},
  {key:"events",      path:"data/events/events.json"},
  {key:"investors",   path:"data/investors/investors.json"},
  {key:"activity",    path:"data/activity/activity.json"}
];

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,PUT,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-max-age": "86400"
};
const send = (res, code, obj) => {
  res.writeHead(code, Object.assign({"content-type": "application/json"}, CORS));
  res.end(JSON.stringify(obj));
};

const gh = (path, opts) => fetch(GH_API + path, Object.assign({}, opts, {
  headers: Object.assign({
    "accept": "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "authorization": "Bearer " + GH_TOKEN,
    "user-agent": "risk-cockpit-proxy"
  }, (opts && opts.headers) || {})
}));

async function ghJson(path, opts, what){
  const res = await gh(path, opts);
  if (!res.ok){
    const detail = await res.text().catch(() => "");
    const err = new Error(what + ": HTTP " + res.status + " " + detail.slice(0, 200));
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/* Local equivalents of the three GitHub operations. The "head" is a content
   hash, which gives the same compare-and-swap behaviour as a commit sha. */
const localRead = f => JSON.parse(readFileSync(join(ROOT, f.path), "utf8"));
const localHead = () =>
  createHash("sha1").update(FILES.map(f => readFileSync(join(ROOT, f.path), "utf8")).join("\0"))
    .digest("hex");

const headCommit = () => LOCAL
  ? Promise.resolve(localHead())
  : ghJson("/repos/" + REPO + "/commits/" + BRANCH + "?per_page=1", {}, "head").then(c => c.sha);

async function readBoard(){
  if (LOCAL){
    const doc = {};
    FILES.forEach(f => { const v = localRead(f); if (f.wrap) Object.assign(doc, v); else doc[f.key] = v; });
    if (!Array.isArray(doc.activity)) doc.activity = [];
    return doc;
  }
  const parts = await Promise.all(FILES.map(f =>
    ghJson("/repos/" + REPO + "/contents/" + f.path + "?ref=" + BRANCH, {}, f.path)
      .then(m => JSON.parse(Buffer.from(m.content, "base64").toString("utf8")))));
  const doc = {};
  FILES.forEach((f, i) => { if (f.wrap) Object.assign(doc, parts[i]); else doc[f.key] = parts[i]; });
  if (!Array.isArray(doc.activity)) doc.activity = [];
  return doc;
}

/* Serve the desk page. Deployed: the repo's current copy, cached for a
   minute, so the UI can never drift from the data it writes. Development
   mode (or GitHub unreachable): the checkout's own copy. */
let htmlCache = {at: 0, text: null};
async function readHtml(){
  const local = () => { try { return readFileSync(HTML, "utf8"); } catch { return null; } };
  if (LOCAL) return local();
  if (htmlCache.text && Date.now() - htmlCache.at < 60000) return htmlCache.text;
  try {
    const m = await ghJson("/repos/" + REPO + "/contents/lionscraft-platform.html?ref=" + BRANCH, {}, "desk page");
    const text = Buffer.from(m.content, "base64").toString("utf8");
    htmlCache = {at: Date.now(), text};
    return text;
  } catch (e) {
    return htmlCache.text || local();
  }
}

/* One commit for the whole save. Writing files one at a time would leave the
   board briefly inconsistent — partners updated, the log entry describing it
   missing — so this goes blob -> tree -> commit -> move the branch. Moving the
   branch is the compare-and-swap: it fails if anyone committed in between. */
async function commitBoard(doc, parent, who){
  const current = await readBoard();
  const changed = FILES.filter(f => {
    const before = f.wrap ? {version:current.version || 1, meta:current.meta} : current[f.key];
    const after  = f.wrap ? {version:doc.version || 1, meta:doc.meta}         : doc[f.key];
    return JSON.stringify(before) !== JSON.stringify(after);
  });
  if (!changed.length) return {revision: doc.meta.revision, head: parent, unchanged: true};

  if (LOCAL){
    for (const f of changed){
      const content = JSON.stringify(f.wrap ? {version:doc.version || 1, meta:doc.meta} : doc[f.key], null, 2) + "\n";
      mkdirSync(dirname(join(ROOT, f.path)), {recursive: true});
      writeFileSync(join(ROOT, f.path), content);
    }
    console.log("wrote revision " + doc.meta.revision + " (" + (who || "unattributed") +
      ") to the working tree — " + changed.map(f => f.path).join(", "));
    return {revision: doc.meta.revision, head: localHead(), files: changed.length, local: true};
  }

  const tree = await Promise.all(changed.map(async f => {
    const content = JSON.stringify(f.wrap ? {version:doc.version || 1, meta:doc.meta} : doc[f.key], null, 2) + "\n";
    const blob = await ghJson("/repos/" + REPO + "/git/blobs", {
      method:"POST", headers:{"content-type":"application/json"},
      body: JSON.stringify({content: Buffer.from(content, "utf8").toString("base64"), encoding:"base64"})
    }, "blob " + f.path);
    return {path: f.path, mode: "100644", type: "blob", sha: blob.sha};
  }));

  const newTree = await ghJson("/repos/" + REPO + "/git/trees", {
    method:"POST", headers:{"content-type":"application/json"},
    body: JSON.stringify({base_tree: parent, tree})
  }, "tree");

  const commit = await ghJson("/repos/" + REPO + "/git/commits", {
    method:"POST", headers:{"content-type":"application/json"},
    body: JSON.stringify({
      message: "Desk: revision " + doc.meta.revision + (who ? " (" + who + ")" : ""),
      tree: newTree.sha, parents: [parent]
    })
  }, "commit");

  const ref = await gh("/repos/" + REPO + "/git/refs/heads/" + BRANCH, {
    method:"PATCH", headers:{"content-type":"application/json"},
    body: JSON.stringify({sha: commit.sha, force: false})
  });
  if (!ref.ok){
    const err = new Error("ref not fast-forward");
    err.conflict = true;
    throw err;
  }
  console.log("committed revision " + doc.meta.revision +
    " (" + (who || "unattributed") + ") — " + changed.map(f => f.path).join(", "));
  return {revision: doc.meta.revision, head: commit.sha, files: changed.length};
}

/* YAML frontmatter, only as much as the other board actually uses. */
function frontmatter(text){
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)){
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}
const labelsOf = v => String(v || "").replace(/^\[|\]$/g, "").split(",")
  .map(x => x.trim().replace(/^["']|["']$/g, "").toLowerCase()).filter(Boolean);

/* Keyed on the other repository's head commit rather than a timer: check the
   head often (one cheap call), but only re-read the task files when something
   there actually changed. */
let bridgeCache = {head: null, at: 0, tasks: []};
/* Per-file, keyed on the blob sha the listing gives us, so a change to one task
   costs one read rather than re-reading the whole directory. */
const bridgeFiles = new Map();
async function readBridge(){
  const headers = {"accept": "application/vnd.github+json", "user-agent": "risk-cockpit-proxy"};
  if (BRIDGE_TOKEN) headers.authorization = "Bearer " + BRIDGE_TOKEN;

  if (bridgeCache.head && Date.now() - bridgeCache.at < 10000) return bridgeCache.tasks;
  try {
    const h = await fetch(GH_API + "/repos/" + BRIDGE_REPO + "/commits/" + "main?per_page=1", {headers});
    if (h.ok){
      const head = (await h.json()).sha;
      if (head && head === bridgeCache.head){
        bridgeCache.at = Date.now();
        return bridgeCache.tasks;
      }
      bridgeCache.head = head;
    }
  } catch (e) { if (bridgeCache.head) return bridgeCache.tasks; }
  const res = await fetch(GH_API + "/repos/" + BRIDGE_REPO + "/contents/" + BRIDGE_DIR, {headers});
  if (!res.ok) throw new Error("bridge listing: HTTP " + res.status);
  const listing = await res.json();
  if (!Array.isArray(listing)) throw new Error("bridge listing: " + (listing.message || "unexpected"));
  const files = listing.filter(f => f.name.endsWith(".md"));
  /* Through the contents API rather than the raw CDN: the same call works
     whether the other repository is public or private, and it carries the
     token. Raw would silently return nothing for a private repo. */
  /* A failed file read must not quietly shrink the list — that reads as "the
     task was removed" when it means "we could not look". Rate limiting makes
     this likely without a token: one call per file against 60 an hour. */
  const rawHeaders = Object.assign({}, headers, {accept: "application/vnd.github.raw"});
  let fetched = 0;
  const texts = await Promise.all(files.map(async f => {
    const hit = bridgeFiles.get(f.path);
    if (hit && hit.sha === f.sha) return hit.text;
    const r = await fetch(GH_API + "/repos/" + BRIDGE_REPO + "/contents/" + f.path, {headers: rawHeaders});
    if (!r.ok){
      const limited = r.status === 403 && r.headers.get("x-ratelimit-remaining") === "0";
      throw new Error(limited
        ? "GitHub rate limit reached reading " + BRIDGE_REPO +
          (BRIDGE_TOKEN ? "" : " — without a token GitHub allows 60 calls an hour")
        : "could not read " + f.path + ": HTTP " + r.status);
    }
    const text = await r.text();
    bridgeFiles.set(f.path, {sha: f.sha, text});
    fetched++;
    return text;
  }));
  if (fetched) console.log("bridge: re-read " + fetched + " of " + files.length + " task files");

  const tasks = [];
  texts.forEach((text, i) => {
    const fm = frontmatter(text);
    if (!fm || !labelsOf(fm.labels).includes(BRIDGE_LABEL)) return;
    const sourceId = fm.id || files[i].name.replace(/\.md$/, "");
    tasks.push({
      id: "wf:" + sourceId, sourceId,
      title: fm.title || files[i].name,
      status: fm.status || "",
      owner: fm.assignee || "",
      due: /^\d{4}-\d{2}-\d{2}$/.test(fm.due || "") ? fm.due : "",
      bridged: true
    });
  });
  bridgeCache = {head: bridgeCache.head, at: Date.now(), tasks};
  return tasks;
}

/* Rewrite one key in the frontmatter, touching nothing else — not the body,
   not the other keys, not the line endings. If the key is absent it is added
   at the end of the block rather than the file being restructured. */
function setFrontmatterKey(text, key, value){
  const m = text.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!m) return null;
  const [, open, block, close] = m;
  const eol = block.includes("\r\n") ? "\r\n" : "\n";
  const lines = block.split(/\r?\n/);
  let found = false;
  const next = lines.map(line => {
    const i = line.indexOf(":");
    if (i > 0 && line.slice(0, i).trim() === key){ found = true; return key + ": " + value; }
    return line;
  });
  if (!found) next.push(key + ": " + value);
  return open + next.join(eol) + close + text.slice(m[0].length);
}

const readBody = req => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on("data", d => {
    size += d.length;
    if (size > 5 * 1024 * 1024){ reject(new Error("too_large")); req.destroy(); return; }
    chunks.push(d);
  });
  req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  req.on("error", reject);
});

/* Constant-time-ish comparison, so the password cannot be guessed a character
   at a time by timing the response. */
function sameSecret(a, b){
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
/* In development mode with no password configured, writes are open — there is
   nothing to protect, since it can only touch this working tree. */
const authed = req => (LOCAL && !PASSWORD) ||
  sameSecret((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), PASSWORD);

let writing = Promise.resolve();
const serialized = fn => {
  const p = writing.then(fn, fn);
  writing = p.catch(() => {});
  return p;
};

http.createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  try {
    if (req.method === "OPTIONS"){ res.writeHead(204, CORS); res.end(); return; }

    /* Never touches GitHub: a health check must not fail because a rate limit
       was hit or a token expired. */
    if (req.method === "GET" && path === "/healthz")
      return send(res, 200, {
        ok: true, repo: REPO,
        configured: !!GH_TOKEN && !!PASSWORD,
        /* "open" means development mode with no password — the desk can write
           without asking for one. */
        auth: (LOCAL && !PASSWORD) ? "open" : "password",
        local: LOCAL
      });

    if (req.method === "GET" && (path === "/" || path === "/lionscraft-platform.html")){
      const html = await readHtml();
      if (!html) return send(res, 503, {error: "desk_unavailable", detail: "lionscraft-platform.html could not be read from GitHub or the checkout"});
      res.writeHead(200, Object.assign({"content-type": "text/html; charset=utf-8"}, CORS));
      return res.end(html);
    }

    if (req.method === "GET" && path === "/api/bridge"){
      try {
        return send(res, 200, {repo: BRIDGE_REPO, label: BRIDGE_LABEL, tasks: await readBridge()});
      } catch (e) {
        /* Never fatal, and never a shorter list than we last knew to be true:
           showing fewer cards would read as "those were removed". */
        return send(res, 200, {
          repo: BRIDGE_REPO, label: BRIDGE_LABEL,
          tasks: bridgeCache.tasks || [], stale: true, error: String(e.message || e)
        });
      }
    }

    if (req.method === "PUT" && path === "/api/bridge"){
      if (!LOCAL && !PASSWORD)
        return send(res, 500, {error: "server_misconfiguration", detail: "APP_PASSWORD not set"});
      if (!authed(req)) return send(res, 401, {error: "unauthorized"});
      if (!BRIDGE_TOKEN)
        return send(res, 501, {error: "bridge_read_only",
          detail: "No token that can write to " + BRIDGE_REPO + ". Set BRIDGE_TOKEN, or scope GITHUB_TOKEN to both repositories."});

      let body;
      try { body = JSON.parse(await readBody(req)); }
      catch (e) { return send(res, 400, {error: "bad_json"}); }
      const sourceId = String(body.id || "").replace(/^wf:/, "");
      const status = String(body.status || "").trim();
      if (!/^[A-Za-z0-9._-]+$/.test(sourceId)) return send(res, 400, {error: "bad_id"});
      if (!status) return send(res, 400, {error: "status_required"});

      return serialized(async () => {
        const file = BRIDGE_DIR + "/" + sourceId + ".md";
        const h = {
          "accept": "application/vnd.github+json",
          "authorization": "Bearer " + BRIDGE_TOKEN,
          "user-agent": "risk-cockpit-proxy",
          "x-github-api-version": "2022-11-28"
        };
        try {
          const cur = await fetch(GH_API + "/repos/" + BRIDGE_REPO + "/contents/" + file, {headers: h});
          if (!cur.ok) return send(res, cur.status === 404 ? 404 : 502,
            {error: "bridge_read_failed", detail: "HTTP " + cur.status + " on " + file});
          const meta = await cur.json();
          const text = Buffer.from(meta.content, "base64").toString("utf8");
          const next = setFrontmatterKey(text, "status", status);
          if (next === null) return send(res, 422, {error: "no_frontmatter", detail: file});
          if (next === text) return send(res, 200, {id: sourceId, status, unchanged: true});

          const put = await fetch(GH_API + "/repos/" + BRIDGE_REPO + "/contents/" + file, {
            method: "PUT", headers: Object.assign({"content-type": "application/json"}, h),
            body: JSON.stringify({
              message: sourceId + ": status → " + status + " (from the risk board)",
              content: Buffer.from(next, "utf8").toString("base64"),
              sha: meta.sha, branch: "main"
            })
          });
          if (!put.ok){
            const detail = await put.text().catch(() => "");
            return send(res, put.status === 403 ? 403 : 502,
              {error: "bridge_write_failed", detail: "HTTP " + put.status + " " + detail.slice(0, 160)});
          }
          bridgeCache = {head: null, at: 0, tasks: []};   // force a re-read
          console.log("bridge: " + sourceId + " → " + status);
          return send(res, 200, {id: sourceId, status});
        } catch (e) {
          return send(res, 502, {error: "bridge_write_failed", detail: String(e.message || e)});
        }
      });
    }

    if (req.method === "GET" && path === "/api/board"){
      const [head, desk] = await Promise.all([headCommit(), readBoard()]);
      return send(res, 200, {revision: desk.meta.revision, head, desk});
    }

    if (req.method === "PUT" && path === "/api/board"){
      if (!LOCAL && !PASSWORD)
        return send(res, 500, {error: "server_misconfiguration", detail: "APP_PASSWORD not set"});
      if (!authed(req)) return send(res, 401, {error: "unauthorized"});

      let body;
      try { body = JSON.parse(await readBody(req)); }
      catch (e) { return send(res, e.message === "too_large" ? 413 : 400, {error: e.message === "too_large" ? "too_large" : "bad_json"}); }

      const doc = body.desk;
      if (!doc || !Array.isArray(doc.partners) || !Array.isArray(doc.tasks) || !Array.isArray(doc.activity))
        return send(res, 400, {error: "bad_board"});

      return serialized(async () => {
        try {
          const head = await headCommit();
          if (body.head && body.head !== head){
            const desk = await readBoard();
            return send(res, 409, {error: "conflict", head, revision: desk.meta.revision, desk});
          }
          const out = await commitBoard(doc, head, body.actor);
          return send(res, 200, out);
        } catch (e) {
          if (e.conflict){
            const [head, desk] = await Promise.all([headCommit(), readBoard()]);
            return send(res, 409, {error: "conflict", head, revision: desk.meta.revision, desk});
          }
          console.error(e);
          return send(res, e.status === 401 || e.status === 403 ? 502 : 500,
            {error: "github_error", detail: String(e.message || e)});
        }
      });
    }

    send(res, 404, {error: "not_found"});
  } catch (e) {
    console.error(e);
    send(res, 500, {error: "internal", detail: String(e.message || e)});
  }
}).listen(PORT, "0.0.0.0", () => {
  if (LOCAL){
    console.log("risk-cockpit — development mode on http://127.0.0.1:" + PORT);
    console.log("  the board reads and writes " + join(ROOT, "data") + " — nothing reaches GitHub");
    console.log("  changes show up in `git diff`" + (PASSWORD ? "" : "; writes need no password here"));
  } else {
    console.log("risk-cockpit proxy on 0.0.0.0:" + PORT + " → " + REPO + "@" + BRANCH);
    if (!PASSWORD) console.log("  WARNING: APP_PASSWORD not set — writes are disabled");
  }
});
