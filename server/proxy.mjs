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
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT      = Number(process.env.PORT) || 8788;
const GH_TOKEN  = process.env.GITHUB_TOKEN || "";
const PASSWORD  = process.env.APP_PASSWORD || "";
const REPO      = process.env.REPO || "Lionscraft-io/risk-cockpit";
const BRANCH    = process.env.BRANCH || "main";
const GH_API    = process.env.GH_API || "https://api.github.com";

/* The desk itself, from this checkout — so the deployed URL shows the board
   rather than an API error, and that copy talks to its own origin. */
const HTML = join(dirname(fileURLToPath(import.meta.url)), "..", "lionscraft-platform.html");

const FILES = [
  {key:"meta",        path:"data/meta.json",              wrap:true},
  {key:"partners",    path:"data/partners/partners.json"},
  {key:"workstreams", path:"data/plan/workstreams.json"},
  {key:"tasks",       path:"data/plan/tasks.json"},
  {key:"milestones",  path:"data/plan/milestones.json"},
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

const headCommit = () =>
  ghJson("/repos/" + REPO + "/commits/" + BRANCH + "?per_page=1", {}, "head").then(c => c.sha);

async function readBoard(){
  const parts = await Promise.all(FILES.map(f =>
    ghJson("/repos/" + REPO + "/contents/" + f.path + "?ref=" + BRANCH, {}, f.path)
      .then(m => JSON.parse(Buffer.from(m.content, "base64").toString("utf8")))));
  const doc = {};
  FILES.forEach((f, i) => { if (f.wrap) Object.assign(doc, parts[i]); else doc[f.key] = parts[i]; });
  if (!Array.isArray(doc.activity)) doc.activity = [];
  return doc;
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
const authed = req =>
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
      return send(res, 200, {ok: true, repo: REPO, configured: !!GH_TOKEN && !!PASSWORD});

    if (req.method === "GET" && (path === "/" || path === "/lionscraft-platform.html")){
      let html;
      try { html = readFileSync(HTML, "utf8"); }
      catch { return send(res, 503, {error: "desk_unavailable", detail: "lionscraft-platform.html not found beside the server"}); }
      res.writeHead(200, Object.assign({"content-type": "text/html; charset=utf-8"}, CORS));
      return res.end(html);
    }

    if (req.method === "GET" && path === "/api/board"){
      if (!GH_TOKEN) return send(res, 500, {error: "server_misconfiguration", detail: "GITHUB_TOKEN not set"});
      const [head, desk] = await Promise.all([headCommit(), readBoard()]);
      return send(res, 200, {revision: desk.meta.revision, head, desk});
    }

    if (req.method === "PUT" && path === "/api/board"){
      if (!GH_TOKEN || !PASSWORD)
        return send(res, 500, {error: "server_misconfiguration", detail: "GITHUB_TOKEN or APP_PASSWORD not set"});
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
  console.log("risk-cockpit proxy on 0.0.0.0:" + PORT + " → " + REPO + "@" + BRANCH);
  if (!GH_TOKEN)  console.log("  WARNING: GITHUB_TOKEN not set — reads and writes will fail");
  if (!PASSWORD)  console.log("  WARNING: APP_PASSWORD not set — writes are disabled");
});
