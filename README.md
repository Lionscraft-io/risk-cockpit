# Lionscraft — Partner & Facility Desk

Working infrastructure for the **programmable risk transfer** project: partner CRM,
facility project plan, kanban board, outreach material generator, and the narrative
reference that keeps everything on-message.

The application is a single self-contained HTML file and **this repository is
the database**: the board lives in `data/desk.json`, every change is a commit,
and git history is the audit trail. Nothing is deployed or hosted beyond GitHub
Pages serving a static file.

```
lionscraft-platform.html    the entire application
data/desk.json              backup snapshot of the dataset (the API is live truth)
data/schema.json            formal shape of the dataset
scripts/validate.mjs        zero-dependency validator (node scripts/validate.mjs)
AGENTS.md                   the contract for agents working on the board
index.html                  redirect so the Pages root serves the desk
docs/master-narrative.md    source of truth for the story and the guardrails
```

**The desk:** https://lionscraft-io.github.io/risk-cockpit/

Reading needs nothing. To make changes, paste a GitHub token once under
**Data** — a fine-grained PAT scoped to this repository with *Contents: read and
write*. Saves then commit straight to `data/desk.json`, and everyone else's
desk picks them up within half a minute.

`server/` holds an optional self-hosted API with the same contract, kept for
anyone who wants a real backend later. Nothing uses it by default.

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

`data/desk.json` holds the board and a `meta.revision` counter. The desk reads
it on load and commits back to it on save — batched, so a burst of edits
becomes one commit rather than one per keystroke.

Writes are compare-and-swap: the desk passes the blob `sha` it read, so if
anyone committed in between GitHub rejects the write and the desk re-reads,
merges and retries. The activity log always merges by id union, so no comment
or agent finding is ever lost; ordinary fields are last-write-wins.

A 30-second poll picks up what other people and agents committed — adopted
silently when you have nothing unpushed, offered via banner when you do. If
GitHub is unreachable the desk says `offline`, keeps working from the browser's
copy, reconnects on its own, and pushes what you did while away.

### What the chip in the top bar means

| Chip | State |
| --- | --- |
| `live · rev N` | Reading the board; saves commit automatically. |
| `token needed` | You have edits but no GitHub token — set one under **Data**. |
| `saving…` | Your edits are being committed. |
| `update available` | The board moved on since your copy. A banner offers **Load the board** or **Push mine anyway** — it never overwrites your work silently. |
| `offline` | GitHub unreachable; working from this browser's copy and reconnecting. |

### Agents

Agents are first-class users of the same board, through GitHub's own hosted MCP
server, the Contents API, or plain git — nothing to deploy. Every action lands
in the activity feed. The full contract is [AGENTS.md](AGENTS.md).

The sync state is tracked separately from the data itself, in
`localStorage['lionscraft-desk-sync']` as `{base, dirty}` — `base` is the shared
revision your copy branched from, `dirty` is whether you have edited since.
Comparing `base` against the revision in the fetched file is what detects a stale
copy. `Keep mine` advances `base` without touching your data, so you are told
about the *next* revision but not nagged about one you have already decided on.

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
