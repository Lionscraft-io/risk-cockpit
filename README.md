# Lionscraft — Partner & Facility Desk

Working infrastructure for the **programmable risk transfer** project: partner CRM,
facility project plan, kanban board, outreach material generator, and the narrative
reference that keeps everything on-message.

The application is a single self-contained HTML file. The live data lives in a
small API service; this repo is the code home, the agent contract, and the
fallback data store.

```
lionscraft-platform.html    the entire application
data/desk.json              backup snapshot of the dataset (the API is live truth)
data/schema.json            formal shape of the dataset
scripts/validate.mjs        zero-dependency validator (node scripts/validate.mjs)
AGENTS.md                   the contract for agents working on the board
index.html                  redirect so the Pages root serves the desk
docs/master-narrative.md    source of truth for the story and the guardrails
```

| Where | What |
| --- | --- |
| https://lionscraft-io.github.io/risk-cockpit/ | The desk (GitHub Pages) |
| https://risk-cockpit-api.replit.app | Live backend: same desk at `/`, REST at `/api/…`, MCP at `/mcp` |

The desk connects to the backend automatically from either host. With the API
up, saves push live and everyone sees each other's changes within seconds;
with it down, the desk falls back to the git-file flow described below.
Writing (from the UI or by an agent) needs the team write token — kept in the
Replit Secrets pane, entered once under **Data** in the desk.

---

## Running it

Open the file in any browser:

```bash
open -a "Google Chrome" lionscraft-platform.html
```

It is also published as a private artifact on claude.ai so the team can reach it
from a link. Both copies are the same file — see **Data and the two copies** below
for what that means in practice.

---

## What's in it

| Tab | What it does |
| --- | --- |
| **Overview** | Pipeline funnel, coverage by partner type, next moves, tasks due, milestones |
| **Partners** | 36 target organisations across nine partner types, seven-stage pipeline, per-partner ask and next move |
| **Plan** | Nine workstreams mapped to the product stack — as a list, or as a drag-and-drop Gantt |
| **Board** | Every task by state, drag between columns, filter by workstream / owner / text |
| **Outreach** | Eight formats (cold intro, warm intro, follow-up, MoU, agenda, one-pager, concept note, deck spine), tailored per partner type |
| **Narrative** | The five-level hierarchy, six facility layers, guardrails, language bank, failure modes |

### Tabs are addressable

The open tab lives in the URL, so a refresh keeps you where you were, the back
button works, and you can link someone straight to a view:

```
…/lionscraft-platform.html#partners
…/lionscraft-platform.html#plan/gantt
…/lionscraft-platform.html#board
```

The Pages root carries the fragment through the redirect, so
`…/risk-cockpit/#board` works too.

### On a phone

The desk is usable on a phone, not just shrunk to fit:

- The partner table becomes stacked cards with labelled fields — six columns
  never scan sideways well
- The board shows one column per screen with snap scrolling, swiped between
- The timeline stays a timeline, with a narrower month scale; bars and milestones
  are still draggable by touch (`touch-action: none` on the handles)
- Inputs are 16px so iOS stops zooming in when you focus one
- The theme toggle is hidden below 560px and the OS preference applies

Watch for horizontal page scroll when adding anything wide. `.grid > *` carries
`min-width: 0` for exactly this reason: without it a wide scroller inside a grid
child sizes the whole track to its content and the page slides sideways.

### The hierarchy the whole thing is built around

Never invert it — it is the most common way this story breaks.

1. **Architecture** — programmable risk transfer *(this is the company)*
2. **Application** — disaster and resilience finance
3. **Product** — Response-Linked ART
4. **Sector** — critical infrastructure / telecoms
5. **Implementation** — Sri Lanka telecom resilience facility *(the wedge, not the company)*

### Seeded data is not real relationships

The 36 partner organisations are **research targets** derived from the partner types
in the narrative, all sitting at stage `Identified`. Swiss Re, ADB, Dialog Axiata and
the rest are there because they are the obvious people to approach — not because
anyone has spoken to them. Verify the right entity and entry point before using any
of it in outreach.

---

## How the data works

The API holds the live document and its `meta.revision` counter. The desk
connects on load: saves push automatically (debounced, merged), and a 20-second
poll picks up what other people and agents changed — adopted silently when you
have nothing unpushed, offered via banner when you do. Conflicting pushes
retry once against the fresh server state; the activity log always merges by id
union, so nothing anyone said is ever lost, while data fields are
last-write-wins.

When the API is unreachable, the desk falls back to `data/desk.json` from the
repo and the git publish flow below — nothing stops working, it just stops
being live.

### What the chip in the top bar means

| Chip | State |
| --- | --- |
| `live · rev N` | Connected to the backend; saves push automatically. |
| `token needed` | Backend reachable but this browser can't write — set the token under **Data**. |
| `saving…` | Your edits are on their way to the backend. |
| `rev N · in sync` | Git mode: your copy matches `data/desk.json`. |
| `rev N · unpublished` | Git mode: you have edits not in the repo yet. |
| `update available` | The shared version moved on since your copy was taken. A banner offers **Load shared version** or **Keep mine** — it never overwrites your work silently. |
| `local copy` | No shared source reachable; the embedded seed is standing in. |

### Agents

Agents are first-class users of the same board — REST or MCP against the API,
git as fallback, one shared write token, every action logged to the activity
feed. The full contract is [AGENTS.md](AGENTS.md).

The sync state is tracked separately from the data itself, in
`localStorage['lionscraft-desk-sync']` as `{base, dirty}` — `base` is the shared
revision your copy branched from, `dirty` is whether you have edited since.
Comparing `base` against the revision in the fetched file is what detects a stale
copy. `Keep mine` advances `base` without touching your data, so you are told
about the *next* revision but not nagged about one you have already decided on.

### Publishing a change

1. **Data → Copy as revision N+1** — stamps the data with the next revision and
   today's date, and copies it
2. Paste over `data/desk.json`, commit, push
3. Everyone else sees the update banner on their next reload

The revision only ever moves forward, and the app refuses to consider itself in
sync with a revision it has not actually seen.

### Where the shared fetch does and doesn't work

| Where | Shared data |
| --- | --- |
| **GitHub Pages** — the team link | ✅ works, this is the canonical home |
| **Opening the file directly** (`file://`) | ⚠️ browser-dependent; Chrome blocks the fetch, and the app falls back to the embedded seed and says `local copy` |
| **claude.ai artifact** | ❌ only the HTML file is published, so there is no `data/desk.json` to fetch — falls back to the seed |

Work on the Pages link. The other two are convenience copies.

### The embedded seed

`SEED` inside the HTML is the offline fallback, not the source of truth.
`data/desk.json` was generated from it and the two will drift as real data
accumulates — that is expected. Regenerate the JSON from the seed only when
bootstrapping a fresh dataset, never to "sync" it back.

---

## Working on the file

It is one file, in three parts:

- **`<style>`** — design tokens on `:root`, redefined for dark theme via
  `prefers-color-scheme` and again for the explicit `data-theme` toggle. Style
  through the tokens, never inside the media query.
- **markup** — a fixed shell: top bar, nav rail, `#view`, drawer, toast
- **`<script>`** — reference data (stages, partner categories, templates), the
  `SEED` object, a tiny store over `localStorage`, and one render function per tab

Conventions worth keeping:

- Every view is a function returning an HTML string; `render()` swaps `#view`
  and calls the matching `wire*()` for anything needing event listeners
- All user-supplied text goes through `esc()`
- Dates are plain `YYYY-MM-DD` strings, compared as strings; timeline maths runs in
  UTC via `toMs()` / `shiftDays()` so a viewer's timezone can never shift a bar.
  `TODAY` is the viewer's real local calendar date, so "overdue" stays honest
  without anyone editing a constant
- `save()` marks the copy unpublished; `save(true)` is for the sync machinery only,
  which manages that flag itself
- Adding a field to tasks or partners means: add it to `SEED`, to the drawer form,
  and add a backfill for data saved before it existed (see `backfillStarts`) —
  people will be carrying older copies in their browsers

### Redeploying the published artifact

Ask Claude Code to republish `lionscraft-platform.html`. The artifact URL is tied to
that exact file path — **renaming the file mints a new URL and orphans the old one.**

---

## Still open

Deliberately unresolved, and the narrative is designed to survive all of them:
legal form of facilities, when an SPV is required, wrapper choice, jurisdiction,
custody model, investor eligibility, tranche structures, trigger design, regulatory
treatment, how much sits on-chain, outcome-verification standards, pricing
methodology, basis-risk management, and which functions Lionscraft performs
directly versus through regulated partners.
