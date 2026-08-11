# Plan

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#plan)** ·
**[Timeline →](https://lionscraft-io.github.io/risk-cockpit/#plan/gantt)**

Thirteen workstreams and the live task list — the work of getting the Sri Lanka
telecom resilience facility from a narrative to a bound instrument, plus the
work of building the company that carries it.

Two views of the same data: **List** and **Timeline**.

---

## The MoUs sit here in full

Unlike the [Board](../board/), which summarises them into a strip because seven
cards buried the two real ones, the Plan keeps every MoU in flight under its own
heading. That was never the crowded surface.

Each sits in the workstream marked for it —
*Legal & regulatory* by default, since an MoU is the instrument that carries
rights and obligations. Mark a different workstream with `"mou": true` in
[`workstreams.json`](../../data/plan/workstreams.json) to move them.

They are derived from the partner record, so they have no state of their own:

| Partner stage | Board column |
| --- | --- |
| Aligning MoU | **Focus** — being negotiated |
| MoU sent | **Review** — with them, waiting |
| MoU signed · Active | **Done** |

**Dragging an MoU card moves the partner.** Drop it in Review and that partner
goes to *MoU sent*, logged like any other stage change. The other columns are
refused rather than guessed at — Backlog and Weekly have no meaning for an
agreement, and inventing one would put a stage in the CRM that nobody chose.

Clicking a card opens the partner record.

## The thirteen workstreams

Each maps onto a layer of the product stack, so the plan and the architecture
stay legible against each other.

| | Workstream | Stack layer |
| --- | --- | --- |
| WS1 | Risk & modelling | Layer 1 — Risk and modelling |
| WS2 | Capital & structure | Layer 2 — Financial structure |
| WS3 | Legal & regulatory | Layer 3 — Rights and obligations |
| WS4 | Operator engagement | Layers 3 & 5 — Obligations, evidence |
| WS5 | Digital-asset infrastructure | Layer 4 — Digital asset infrastructure |
| WS6 | Data & evidence | Layer 5 — Data and evidence |
| WS7 | AI administration | Layer 6 — AI administration |
| WS8 | Funding & partnerships | Cross-cutting |
| WS9 | Narrative & materials | Cross-cutting |
| WS11 | Outreach material | Cross-cutting |
| WS12 | Manila invite | Cross-cutting |
| WS13 | UK charity | Cross-cutting |
| WS14 | Tasks | — |

WS1–WS9 each map onto a layer of the product stack. WS11–WS13 do not — they are
named after specific pieces of work rather than layers.

**WS14 Tasks is the holding pen.** Anything whose workstream has not actually
been decided goes here rather than being filed somewhere on a guess. WS1–WS9
are currently all empty for that reason: the work on the board was placed into
them by inference, and it was moved out on 2026-08-11.

WS10 is missing from the sequence because it existed briefly and was removed on
2026-08-11: it was added without being asked for. Ids are not reused.

## Milestones — currently none

Six seeded milestones were cleared on 2026-08-11. They described a later phase
— term sheet, capital indication, regulatory pathway, go-live — while the work
actually in front of the project is getting the MoUs signed. One of them,
*Operator MoU signed*, already contradicted a signed MoU on the board. They
remain in git history.

Add one and it appears as a diamond on the timeline; click it to mark it hit,
which writes to the [Activity](../activity/) log.

## List view

One section per workstream, each with a done count. Click a status chip to cycle it through
the board's columns — `Backlog → Weekly → Focus → Review → Done` — and click a
row to open the task editor.

## Timeline view

A real Gantt across eleven months, with a dashed line marking today and
milestone diamonds in a band under the month scale.

**It is draggable:**

| Gesture | Effect |
| --- | --- |
| Drag a bar sideways | Moves start and due together |
| Drag its left edge | Changes the start only |
| Drag its right edge | Changes the due date only |
| Drag a milestone diamond | Moves that milestone's date |

Everything snaps to whole days, a readout follows the cursor showing the new
dates, and **nothing is written until you let go** — an abandoned drag changes
nothing. Click a bar without moving it and the editor opens instead.

Click a workstream row to collapse it. Bars are coloured by status, and a
dashed outline means past its due date.

## Task fields

`title`, `ws` (which workstream), `owner`, `start`, `due`, `status`, and an
optional linked `partner` — which is what makes "the NDA is blocked on Dialog"
visible in both directions.

`start` must not be after `due`; the validator enforces it.

## The dates are a hypothesis

Only tasks with a due date appear on the timeline. Of the nine currently on the
board, two have one: the Vodafone CTO meeting on 27 Aug and the ADB invite for
Manila on 21 Sept. Both dates are the *event*, not a prep deadline — if the real
deadline is earlier, drag the bar. The other seven carry no date because none
was given, and none was invented for them.

---

**Data:** [`data/plan/`](../../data/plan/) — `workstreams.json`, `tasks.json`,
`milestones.json` ·
**See also:** [Board](../board/) — the same tasks by state
