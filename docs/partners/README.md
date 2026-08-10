# Partners

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#partners)**

The CRM. Every organisation needed to build the first facilities, what we want
from each, and where the conversation has got to.

---

## The 36 seeded partners are targets, not relationships

Every seeded record carries `"seeded": true` and sits at stage **Identified**.
Swiss Re, ADB, Dialog Axiata and the rest are there because they are the obvious
organisations to approach — **not because anyone has spoken to them**.

Verify the right legal entity and the right entry point before using any of it
in outreach. The flag disappears from a record as soon as it holds real
information.

## The nine partner types

Drawn from *How partners can help* in the narrative brief.

| Type | Who they are |
| --- | --- |
| `carrier` | Insurers and reinsurers who can carry the catastrophe layer |
| `capital` | ILS funds and investors who take collateralised risk positions |
| `donor` | Philanthropic and public funders who can sponsor protection |
| `dfi` | Multilateral banks and development finance institutions |
| `operator` | Telecom operators whose network is the protected asset |
| `digital` | Regulated issuance, custody and settlement providers |
| `data` | Hazard modelling, telemetry and administration technology |
| `verifier` | Independent parties who evidence what was delivered |
| `public` | Regulators and public bodies whose cooperation the facility needs |

The type is not decoration — it drives the [Outreach](../outreach/) tab. The
hook, the ask, and the discovery questions for an operator are entirely
different from those for a reinsurer.

## The seven stages

```
Identified → Researched → Approached → Meeting held → MoU sent → MoU signed → Active
```

Plus two exits: **Parked** (right partner, wrong moment) and **Declined**.

Nothing is ever deleted — a partner that goes nowhere is parked or declined, so
the record of having tried survives.

## What a record holds

| Field | Notes |
| --- | --- |
| `name` | The organisation, never a person |
| `cat` | One of the nine types above |
| `country` | Short code |
| `why` | One sentence: why *this* organisation specifically |
| `ask` | What we want **from them** — the single most useful field on the record |
| `stage` | Where the conversation stands |
| `owner` | Who on our side is carrying it |
| `contact` | Who on their side, if known |
| `next` / `nextDate` | The next move and when it is due |
| `notes` | Free text. Agents are told to leave this alone and put findings in the thread instead |

## Working with it

**Filter** by stage, type, or free text. The count next to the filters tells you
how much of the list you are looking at.

**Click any row** to open the editor. Changing the stage writes an entry to the
[Activity](../activity/) log automatically, so the history of a relationship
accumulates without anyone maintaining it.

**Each partner has a thread** at the bottom of its editor — comments, findings,
questions, visible to everyone including agents. This is where research belongs.

**"Write outreach for this partner"** jumps to the Outreach tab with that
partner loaded.

## Filling in the real list

The fastest path is to say what you know and let it be written for you:
*"Dialog Axiata — met them, Priya in network ops, wants restoration cost data by
the 20th, I own it."* That is a stage change, a contact, a next move with a
date, an owner, and a log entry.

---

**Data:** the `partners` array in [`data/desk.json`](../../data/desk.json) ·
**See also:** [Outreach](../outreach/) · [Activity](../activity/) · [Data and sync](../data/)
