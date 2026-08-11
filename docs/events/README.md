# Events

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#events)**

Meetings, conferences and roundtables, with dates.

---

## What it holds

Two lists: **Coming up**, grouped by month with a countdown on each, and **Been
and gone** underneath. An event is over once its *last* day has passed, so a
two-day conference stays under *Coming up* on its second morning rather than
dropping off at midnight. The next one up is highlighted — it is the only one
anybody is actually asking about.

Each row is a calendar tile, the name, one meta line, and the countdown. The
meta line is deliberately one type treatment for everything on it — time,
place, and the partner chip. The first version mixed the monospace data font,
the small-caps label style and two body sizes inside a single row, which read
as noise.

| Field | Notes |
| --- | --- |
| `name` | What it is |
| `start` / `end` | `YYYY-MM-DD`. Leave `end` empty for a single day |
| `time` | Free text — `09:00–10:30`. Not parsed |
| `location` | Free text |
| `link` | Optional. Must start with `http://` or `https://`; shown as the bare host |
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

| When | What | Where | Link |
| --- | --- | --- | --- |
| 20 Aug 2026 | HT Digital & Aon Roundtable, 09:00–10:30 | Aon Centre, London | — |
| 24 Aug 2026 | Scott Petty meeting | London | — |
| 8–9 Sep 2026 | Digital Insurance CEE | Warsaw | [digital-insurance-cee.com](https://www.digital-insurance-cee.com/) |
| 21–24 Sep 2026 | ADB Business Opportunities Fair (BOF), 09:00–17:30 | ADB HQ, Manila | [adb.org](https://www.adb.org/news/events/business-opportunities-fair-2026) |

Two were researched and confirmed against their own sites; both links were
checked live. The ADB venue and opening hours came from that page rather than
from anyone here. The Scott Petty meeting is private, and the HT Digital & Aon
roundtable has no public listing — not on Aon's own events pages either — so it
is treated as invite-only. Its full street address sits in the record's notes.

**The Scott Petty date was contested and is now settled at 24 August.** Task
`t102` said 27–28 August and was moved to match. `LC-013` on the
[workforce board](https://github.com/toniilein/workforce) still reads 27 Aug —
it lives in the other repository and has to be changed there.

---

**Data:** [`data/events/events.json`](../../data/events/events.json) ·
**See also:** [Partners](../partners/) · [Board](../board/)
