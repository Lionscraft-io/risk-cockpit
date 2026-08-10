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

## Tasks bridged from the workforce board

The [workforce board](https://github.com/toniilein/workforce) is the other
kanban — personal and company work, one markdown file per task. Any task there
labelled **`risk`** appears in this board's columns, in a distinct blue-violet,
carrying a `workforce` chip and its source id.

They are **shown here and changed there.** Bridged cards cannot be dragged or
edited in this desk — clicking one opens the workforce board. Nothing is copied
between the two repositories, so they cannot drift out of step: the bridge reads
the other board's files directly.

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

The bridge is cached and refreshed at most every ten minutes; it is never
load-bearing, so if the other repository is unreachable the board simply shows
your own tasks.

---

**Data:** [`data/plan/tasks.json`](../../data/plan/tasks.json) — the same file the Plan uses ·
**See also:** [Plan](../plan/) · [Activity](../activity/)
