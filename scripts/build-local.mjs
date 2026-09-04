#!/usr/bin/env node
/* Builds a standalone copy of the desk with the current board baked in.

     node scripts/build-local.mjs [out.html]

   The result opens from disk — no server, no GitHub. It shows the board as
   it was at build time; edits made in it stay in that browser and go
   nowhere. Each build gets its own storage key, so opening a newer build
   never shows an older build's edits. Default output: lionscraft-desk-local.html
   in the repo root, which .gitignore leaves out. */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = p => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const meta = rd("data/meta.json");
const board = Object.assign({}, meta, {
  partners:    rd("data/partners/partners.json"),
  stages:      rd("data/partners/stages.json"),
  workstreams: rd("data/plan/workstreams.json"),
  tasks:       rd("data/plan/tasks.json"),
  milestones:  rd("data/plan/milestones.json"),
  columns:     rd("data/plan/columns.json"),
  events:      rd("data/events/events.json"),
  investors:   rd("data/investors/investors.json"),
  activity:    rd("data/activity/activity.json")
});

let html = readFileSync(join(ROOT, "lionscraft-platform.html"), "utf8");

const a = html.indexOf("const SEED = {");
const b = html.indexOf("/* ══ Store", a);
if (a < 0 || b < 0) throw new Error("could not find the SEED block");
const end = html.lastIndexOf("};", b) + 2;
const rev = board.meta.revision;
html = html.slice(0, a)
  + "/* Built by scripts/build-local.mjs from the board at revision " + rev + " on " + new Date().toISOString().slice(0, 10) + ". */\n"
  + "const SEED = " + JSON.stringify(board) + ";"
  + html.slice(end);

const keyLine = 'const KEY = "lionscraft-desk-v1";';
if (!html.includes(keyLine)) throw new Error("could not find the storage key");
html = html.replace(keyLine, 'const KEY = "lionscraft-desk-local-r' + rev + '";');

const out = resolve(process.argv[2] || join(ROOT, "lionscraft-desk-local.html"));
writeFileSync(out, html);
console.log("wrote " + out + " — revision " + rev + ", " + board.partners.length + " partners, " + board.investors.length + " investors, " + board.activity.length + " log entries, " + (html.length / 1024 | 0) + " KB");
