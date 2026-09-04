#!/usr/bin/env node
/* Validates the board files under data/ against the contract in AGENTS.md.
   No dependencies. Run before pushing any change to the data:

     node scripts/validate.mjs
*/
import { readFileSync } from "node:fs";

const errors = [];
const err = m => errors.push(m);

const FILES = {
  meta:        "../data/meta.json",
  partners:    "../data/partners/partners.json",
  stages:      "../data/partners/stages.json",
  workstreams: "../data/plan/workstreams.json",
  tasks:       "../data/plan/tasks.json",
  milestones:  "../data/plan/milestones.json",
  columns:     "../data/plan/columns.json",
  events:      "../data/events/events.json",
  investors:   "../data/investors/investors.json",
  activity:    "../data/activity/activity.json"
};

const db = {};
for (const [key, rel] of Object.entries(FILES)){
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8"));
  } catch (e) {
    console.error(rel.replace("../", "") + " missing or does not parse: " + e.message);
    process.exit(1);
  }
  if (key === "meta") Object.assign(db, parsed);
  else db[key] = parsed;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = s => typeof s === "string" && DATE.test(s);
const isDateOrEmpty = s => s === "" || s === undefined || isDate(s);

// meta
if (!db.meta || typeof db.meta !== "object") err("meta missing");
else {
  if (!Number.isInteger(db.meta.revision) || db.meta.revision < 1)
    err("meta.revision must be an integer >= 1 (got " + db.meta.revision + ")");
  if (!isDate(db.meta.updated)) err("meta.updated must be YYYY-MM-DD");
}

for (const key of ["partners", "workstreams", "tasks", "milestones", "columns", "stages", "events", "investors"])
  if (!Array.isArray(db[key])) err(key + " must be an array");
if (Array.isArray(db.columns) && !db.columns.length) err("columns must not be empty");
if (db.activity !== undefined && !Array.isArray(db.activity)) err("activity must be an array");

if (errors.length){ report(); }

const uniq = (list, what) => {
  const seen = new Set();
  for (const x of list){
    if (!x.id) err(what + " entry with no id: " + JSON.stringify(x).slice(0, 60));
    else if (seen.has(x.id)) err("duplicate " + what + " id: " + x.id);
    seen.add(x.id);
  }
  return seen;
};

const CATS = ["carrier","capital","donor","dfi","operator","digital","data","verifier","public","advisor","network"];
const STAGES = (db.stages || []).map(s => s.id);
const STATUSES = (db.columns || []).map(c => c.id);
const KINDS = ["comment","change","finding","question","handoff"];
const REFTYPES = ["partner","task","milestone","board","event","investor"];

uniq(db.columns, "column");
uniq(db.stages, "stage");
if (Array.isArray(db.stages)){
  if (!db.stages.some(s => !s.terminal)) err("stages must include at least one pipeline stage");
  for (const st of db.stages) if (!st.label) err("stage " + st.id + " has no label");
}
for (const c of db.columns){
  if (!c.title) err("column " + c.id + " has no title");
  if (c.color && !/^#[0-9a-fA-F]{6}$/.test(c.color)) err("column " + c.id + " colour is not a hex value: " + c.color);
}

const partnerIds = uniq(db.partners, "partner");
const wsIds = uniq(db.workstreams, "workstream");
uniq(db.tasks, "task");
const msIds = uniq(db.milestones, "milestone");
const taskIds = new Set(db.tasks.map(t => t.id));

for (const p of db.partners){
  if (!p.name) err("partner " + p.id + " has no name");
  if (!CATS.includes(p.cat)) err("partner " + p.id + " has unknown cat: " + p.cat);
  if (!STAGES.includes(p.stage))
    err("partner " + p.id + " is at stage '" + p.stage + "', which does not exist (have: " + STAGES.join(", ") + ")");
  if (!isDateOrEmpty(p.nextDate)) err("partner " + p.id + " nextDate is not YYYY-MM-DD or empty");
  if (!isDateOrEmpty(p.lastDate)) err("partner " + p.id + " lastDate is not YYYY-MM-DD or empty");
}

for (const t of db.tasks){
  if (!t.title) err("task " + t.id + " has no title");
  if (!wsIds.has(t.ws)) err("task " + t.id + " references unknown workstream: " + t.ws);
  if (!STATUSES.includes(t.status))
    err("task " + t.id + " is in column '" + t.status + "', which does not exist (have: " + STATUSES.join(", ") + ")");
  if (!isDateOrEmpty(t.start)) err("task " + t.id + " start is not a date");
  if (!isDateOrEmpty(t.due)) err("task " + t.id + " due is not a date");
  if (isDate(t.start) && isDate(t.due) && t.start > t.due)
    err("task " + t.id + " starts after it is due (" + t.start + " > " + t.due + ")");
  if (t.partner && !partnerIds.has(t.partner))
    err("task " + t.id + " references unknown partner: " + t.partner);
  if (t.labels !== undefined && !Array.isArray(t.labels))
    err("task " + t.id + " labels must be an array");
  if (t.order !== undefined && typeof t.order !== "number")
    err("task " + t.id + " order must be a number");
}

for (const m of db.milestones){
  if (!isDate(m.date)) err("milestone " + m.id + " date is not YYYY-MM-DD");
  if (typeof m.hit !== "boolean") err("milestone " + m.id + " hit must be boolean");
}

const eventIds = uniq(db.events, "event");
for (const ev of db.events){
  if (!ev.name) err("event " + ev.id + " has no name");
  if (!isDate(ev.start)) err("event " + ev.id + " start is not YYYY-MM-DD");
  if (!isDateOrEmpty(ev.end)) err("event " + ev.id + " end is not YYYY-MM-DD or empty");
  if (isDate(ev.start) && isDate(ev.end) && ev.start > ev.end)
    err("event " + ev.id + " ends before it starts (" + ev.start + " > " + ev.end + ")");
  if (ev.partner && !partnerIds.has(ev.partner))
    err("event " + ev.id + " references unknown partner: " + ev.partner);
  if (ev.link && !/^https?:\/\//i.test(ev.link))
    err("event " + ev.id + " link must start with http:// or https:// (got: " + ev.link + ")");
}

const ITYPES = ["insurtech","reinsurer","ils","climate","dfi","fintech","crypto_rwa","crypto","growth","sovereign","bank","strategic"];
const ITIERS = ["A","B","C"];
const ISTAGES = ["identified","researched","approached","meeting","diligence","term_sheet","committed","passed","parked"];
const investorIds = uniq(db.investors, "investor");
for (const i of db.investors){
  if (!i.name) err("investor " + i.id + " has no name");
  if (!ITYPES.includes(i.type)) err("investor " + i.id + " has unknown type: " + i.type);
  if (!ITIERS.includes(i.tier)) err("investor " + i.id + " has unknown tier: " + i.tier);
  if (!ISTAGES.includes(i.stage)) err("investor " + i.id + " has unknown stage: " + i.stage);
  if (!isDateOrEmpty(i.nextDate)) err("investor " + i.id + " nextDate is not YYYY-MM-DD or empty");
  if (!isDateOrEmpty(i.lastDate)) err("investor " + i.id + " lastDate is not YYYY-MM-DD or empty");
}

for (const e of db.activity || []){
  const tag = "activity " + (e.id || "(no id)");
  if (!e.actor) err(tag + " has no actor");
  if (!["human","agent"].includes(e.actorKind)) err(tag + " actorKind must be human|agent");
  if (!KINDS.includes(e.kind)) err(tag + " has unknown kind: " + e.kind);
  if (e.refType !== undefined && !REFTYPES.includes(e.refType)) err(tag + " has unknown refType: " + e.refType);
  if (e.at && isNaN(Date.parse(e.at))) err(tag + " at is not a parseable timestamp");
  if (e.refType === "partner" && e.ref && !partnerIds.has(e.ref)) err(tag + " references unknown partner " + e.ref);
  if (e.refType === "task" && e.ref && !taskIds.has(e.ref)) err(tag + " references unknown task " + e.ref);
  if (e.refType === "milestone" && e.ref && !msIds.has(e.ref)) err(tag + " references unknown milestone " + e.ref);
  if (e.refType === "event" && e.ref && !eventIds.has(e.ref)) err(tag + " references unknown event " + e.ref);
  if (e.refType === "investor" && e.ref && !investorIds.has(e.ref)) err(tag + " references unknown investor " + e.ref);
}

report();

function report(){
  if (errors.length){
    console.error("INVALID — " + errors.length + " problem" + (errors.length === 1 ? "" : "s") + ":\n");
    for (const e of errors) console.error("  · " + e);
    process.exit(1);
  }
  const counts = ["partners","tasks","milestones","events","investors"].map(k => db[k].length + " " + k).join(", ") +
    ", columns " + db.columns.map(c => c.title).join(" → ");
  console.log("valid — revision " + db.meta.revision + ", " + counts + ", " +
    (db.activity || []).length + " activity entries, across " + Object.keys(FILES).length + " files");
  process.exit(0);
}
