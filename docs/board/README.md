# Board

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#board)**

The same tasks as the [Plan](../plan/), arranged by state instead of by
workstream. This is the working view — the one to open on a Monday.

---

## Five columns

```
Backlog  →  Weekly  →  Focus  →  Review  →  Done
```

**Backlog** is everything not yet committed to. **Weekly** is what you have
taken on for the week. **Focus** is what is being worked on right now. **Review**
is done but waiting on someone else's eyes. The same vocabulary as the
[workforce board](https://github.com/toniilein/workforce), so the two can share
tasks.

**Drag a card between columns** to change its status. It saves immediately, and
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

## Cards are sorted by due date

Within each column, soonest first. The top of *To do* is therefore what to pick
up next, and the top of *Doing* is what should be finishing.

Cards can carry **labels**. A task labelled `risk` is one meant to appear on the
workforce board too.

Each card shows the workstream code, the owner, the due date (red when overdue),
and any linked partner — so *"Data NDA and telemetry access agreement · Dialog
Axiata · 10 Oct"* reads without opening anything.

## On a phone

One column fills the screen and you swipe between them, with the next column
peeking at the edge. Cards stay fully readable rather than being squeezed into
four narrow columns.

---

**Data:** [`data/plan/tasks.json`](../../data/plan/tasks.json) — the same file the Plan uses ·
**See also:** [Plan](../plan/) · [Activity](../activity/)
