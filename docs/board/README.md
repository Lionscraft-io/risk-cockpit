# Board

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#board)**

The same tasks as the [Plan](../plan/), arranged by state instead of by
workstream. This is the working view — the one to open on a Monday.

---

## The columns are yours

```
Backlog  →  Weekly  →  Focus  →  Review  →  Done
```

They are **data, not code** — [`data/plan/columns.json`](../../data/plan/columns.json) —
so you change them from the board itself, no edit to the source:

| Action | How |
| --- | --- |
| Rename | click the title and type — it saves as you type |
| Recolour, reorder, remove | the `⋯` on the column header |
| Add a column | the `+` at the right edge of the board |
| Add a task | `+ Add a task` at the foot of any column |

A column's colour drives its dot and the left edge of its cards. The **last
column means done** — tasks there are struck through and drop out of the open
counts — so ordering carries meaning, not just layout.

Removing a column moves its tasks to the first one rather than losing them, and
says so before it does it.

**Backlog** is everything not yet committed to. **Weekly** is what you have
taken on for the week. **Focus** is what is being worked on right now. **Review**
is done but waiting on someone else's eyes. The same vocabulary as the
[workforce board](https://github.com/toniilein/workforce), so the two can share
tasks.

**Drag a card between columns** to change its status, **or within a column** to
reorder it — a line shows where it will land. Dragging writes an explicit
position, so hand-ordering sticks; anything never dragged still falls back to
soonest due date, which means a fresh column reads sensibly without anyone
arranging it. It saves immediately, and
the change appears everywhere else: struck through in the plan list, recoloured
on the timeline, and recorded in the [Activity](../activity/) log.

Click a card to open the full editor.

## The strip at the top

| | What it counts |
| --- | --- |
| **In view** | Tasks matching your current filters |
| **Focus** | What is being worked on right now |
| **Review** | Finished but waiting on someone |
| **Overdue** | Past due and not done. Turns red |
| **Unassigned** | Open tasks with no owner |

**Unassigned** is the number that matters most early on. A plan where every task
is unassigned is a wish list.

## Filters

By workstream, by owner (including *Unassigned*), and free text. You will want these once the list grows.

## Order

Within a column, cards you have dragged keep the position you gave them.
Everything else sits in due-date order, soonest first.

Cards can carry **labels**. A task labelled `risk` is one meant to appear on the
workforce board too.

Each card shows the workstream code, the owner, the due date (red when overdue),
and any linked partner — so *"Data NDA and telemetry access agreement · Dialog
Axiata · 10 Oct"* reads without opening anything.

## On a phone

One column fills the screen and you swipe between them, with the next column
peeking at the edge. Cards stay fully readable rather than being squeezed into
four narrow columns.

## MoU cards

Every MoU in flight appears as a card, carrying an `MoU` chip and the partner's
stage. They are derived from the partner records rather than stored, so the
board and the CRM cannot disagree: *Aligning MoU* sits in **Focus**, *MoU sent*
in **Review** — it is with them and you are waiting — and *signed* in **Done**.

Dragging one moves the partner's stage. Columns that mean nothing for an
agreement are refused rather than guessed at. Clicking opens the partner.

## Tasks bridged from the workforce board

The [workforce board](https://github.com/toniilein/workforce) is the other
kanban — personal and company work, one markdown file per task. Any task there
labelled **`risk`** appears in this board's columns, in a distinct blue-violet,
carrying a `workforce` chip and its source id.

**Drag one and its status changes over there.** The backend rewrites the
`status:` line in that task's markdown file and commits it to the workforce
repository — nothing else in the file is touched, not the other keys, not the
body. Clicking a bridged card opens the workforce board.

Nothing is copied between the repositories, so they cannot drift: this board
reads and writes the other one's files directly.

Writing back needs a token that can write to **both** repositories — either
`GITHUB_TOKEN` scoped to each, or a separate `BRIDGE_TOKEN`. Without one the
bridge stays readable and a drag is refused with a message saying so, rather
than appearing to work.

To bridge a task, add the label in its frontmatter over there:

```yaml
---
id: LC-013
title: Create slides for Scott Petty VF CTO for Sri Lanka pilot
status: focus
assignee: Adi
due: 2026-08-27
labels: risk
---
```

Both boards share the same status vocabulary, so a bridged task lands in the
matching column. Workforce also has an **`admin`** status this board does not —
those tasks appear in Backlog with their real status shown on the card, rather
than being silently relabelled.

### Keeping it current

The backend watches the other repository's head commit — one cheap call — and
only re-reads task files when something there actually changed, then only the
files whose contents differ. A card moved on workforce shows here within about
half a minute.

**Reading it needs a GitHub token in practice.** Unauthenticated, GitHub allows
60 API calls an hour, and a first read costs one per task file — enough to
exhaust the budget and leave the bridge stale. With a token the limit is 5000.

Running locally, set `BRIDGE_TOKEN` rather than `GITHUB_TOKEN`: the bridge gets
its token while the board keeps writing to your working tree instead of
committing to the real repository.

```bash
BRIDGE_TOKEN=github_pat_… node server/proxy.mjs
```

If a read fails the board keeps showing the last good list and says so, rather
than showing a shorter one — fewer cards would read as "those were removed"
when it means "we could not look".

---

**Data:** [`data/plan/tasks.json`](../../data/plan/tasks.json) — the same file the Plan uses ·
**See also:** [Plan](../plan/) · [Activity](../activity/)
