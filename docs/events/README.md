# Events

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#events)**

Meetings, conferences and roundtables, with dates.

---

## What it holds

Two lists: **Coming up**, soonest first with a countdown, and **Been and gone**
underneath once the last day has passed. A two-day conference stays under
*Coming up* on its second morning rather than dropping off at midnight.

| Field | Notes |
| --- | --- |
| `name` | What it is |
| `start` / `end` | `YYYY-MM-DD`. Leave `end` empty for a single day |
| `time` | Free text — `09:00–10:30`. Not parsed |
| `location` | Free text |
| `partner` | Optional link to a partner record |
| `notes` | Free text |

Click a row to edit it, **Add event** to create one. The validator enforces the
date format, that an event does not end before it starts, and that any linked
partner exists.

## What it does not do

It is a list with dates on it. There is no calendar view, no invitations, no
reminders, and nothing syncs to a real calendar. Events are not linked to tasks
— *"Prepare the Vodafone CTO meeting"* lives on the [Board](../board/) and the
meeting itself lives here, and neither knows about the other.

## Currently in the diary

| When | What | Where |
| --- | --- | --- |
| 20 Aug 2026 | HT Digital & Aon Roundtable, 09:00–10:30 | Aon Centre, London |
| 24 Aug 2026 | Scott Petty meeting | London |
| 8–9 Sep 2026 | digital-insurance-cee | Warsaw |
| 21–24 Sep 2026 | ADB Business Opportunities Fair (BOF) | Manila |

**The Scott Petty date is contested.** This record says 24 August. Task `t102`
on the board and `LC-013` on the workforce board both say 27–28 August. One of
them is wrong and nobody has said which.

---

**Data:** [`data/events/events.json`](../../data/events/events.json) ·
**See also:** [Partners](../partners/) · [Board](../board/)
