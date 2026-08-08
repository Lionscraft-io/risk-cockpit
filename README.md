# Lionscraft — Partner & Facility Desk

Working infrastructure for the **programmable risk transfer** project: partner CRM,
facility project plan, kanban board, outreach material generator, and the narrative
reference that keeps everything on-message.

The whole application is a single self-contained HTML file. No build step, no
dependencies, no server.

```
lionscraft-platform.html    the entire application
docs/master-narrative.md    source of truth for the story and the guardrails
```

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

## Data and the two copies

Data lives in the browser's `localStorage`, keyed `lionscraft-desk-v1`. Storage is
per-origin, which has one consequence worth understanding:

**The local file and the published link keep separate copies.** Edits made at
`file://…` do not appear at `claude.ai/…`, and vice versa. Pick one as the place
work actually happens.

There is no shared multi-user database — the artifact runtime does not offer one.
The sync path is manual and deliberate:

1. Whoever made changes opens **Data → Copy JSON** (or **Export JSON** on the
   published version)
2. That JSON becomes the new master, committed to this repo
3. The artifact is redeployed from the updated file, and everyone reloads

Handling changes this way means every version of the truth is in git history.

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
  UTC via `toMs()` / `shiftDays()` so a viewer's timezone can never shift a bar
- `TODAY` is a constant, not `new Date()` — change it in one place
- Adding a field to tasks or partners means: add it to `SEED`, to the drawer form,
  and add a backfill for data saved before it existed (see `backfillStarts`)

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
