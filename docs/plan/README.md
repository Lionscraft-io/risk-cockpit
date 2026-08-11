# Plan

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#plan)** ·
**[Timeline →](https://lionscraft-io.github.io/risk-cockpit/#plan/gantt)**

Nine workstreams, thirty-nine tasks, six milestones — the work of getting the
Sri Lanka telecom resilience facility from a narrative to a bound instrument.

Two views of the same data: **List** and **Timeline**.

---

## The MoUs are work, not a summary

Every MoU in flight is also a **card**, in the workstream marked for it —
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

## The nine workstreams

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

## The six milestones

1. **Operator MoU signed** — lead operator committed to co-design, telemetry access, candidate response commitments
2. **Term sheet v1 issued** — risk, layers, capital, triggers and obligations described well enough to quote against
3. **Capital indication received** — non-binding appetite from at least one risk carrier and one investor
4. **Regulatory pathway confirmed** — wrapper and jurisdiction settled
5. **Sponsor funding secured** — premium support or grant committed for the first period
6. **Facility go-live decision** — bind or rebuild

Click a milestone to mark it hit. That writes to the [Activity](../activity/) log.

## List view

Workstreams with a progress bar each. Click a status chip to cycle it
`To do → Doing → Blocked → Done`; click a row to open the task editor.

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

The seeded plan runs from August 2026 to a go-live decision in June 2027. Those
dates were derived from the sequence the work has to happen in, not from
anyone's commitment. Drag them into shape as reality arrives — that is what the
timeline is for.

---

**Data:** [`data/plan/`](../../data/plan/) — `workstreams.json`, `tasks.json`,
`milestones.json` ·
**See also:** [Board](../board/) — the same tasks by state
