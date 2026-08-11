# Partners

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#partners)**

The CRM. Every organisation needed to build the first facilities — plus the
people helping us reach them — what we want from each, and where the
conversation has got to.

---

## The list is 11 real records

The 36 seeded research targets that used to sit here were removed on
2026-08-10 — none had been contacted. They remain in git history.

| Stage | Who |
| --- | --- |
| MoU signed | Hakuhodo Key3 |
| MoU sent | Sumitomo Insurance · Sumitomo Web3 · Mobily · Aon |
| Aligning MoU | Asian Development Bank · Vodafone |
| Researched | Sri Lanka |
| Identified | Roland Voggenhauer · Seena Foroutan · Siva Balasuriyar |

The last three are people, not counterparties — see the two person types
below. This table goes stale the moment a stage moves; the
[Overview](../overview/) is derived from the data and cannot, so trust it over
this.

**Confirm the legal entity before approaching anyone.** Several hold a
group name rather than the signing entity: *Sumitomo Insurance* could be Mitsui
Sumitomo or Sumitomo Life; *Sri Lanka* is a placeholder until it is clear which
body signs. Those questions are open in each partner's thread.

## The partner types

Nine drawn from *How partners can help* in the narrative brief, plus two added
later for people.

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
| `advisor` | Individuals who give us counsel — on the structure, the market, or how to run at this |
| `network` | Individuals who open a door — to capital, to a counterparty, to a room |

The last two are the odd ones out, and deliberately last: every other type is
an institution with a balance sheet, a mandate or a licence, and holds an
organisation in `name`. These hold a **person**.

They are kept apart because **what you ask for is different**. An advisor
tells you what is wrong with the thing; a network contact tells you who to
show it to. Asking one for the other wastes both. What to ask each type is
written down in [by-type.md](by-type.md): the advisor entry opens with *"what
is the weakest part of this as you see it?"*, the network entry with *"who are
the two or three people you would actually put this in front of?"*

The type is not decoration. The hook, the ask and the discovery questions for
an operator are entirely different from those for a reinsurer — see
[by-type.md](by-type.md), which carries all eleven.

It used to drive an **Outreach** tab that generated drafts from these. That tab
was removed on 2026-08-11 as unused; only the label is read by the app now.

## The stages

```
Identified → Researched → Approached → Meeting held →
Aligning MoU → MoU sent → MoU signed → Active
```

Plus two exits: **Parked** (right partner, wrong moment) and **Declined**.

**Aligning MoU** is the one that covers real negotiation — you are talking, and
working out what the agreement will actually say. Before it, *Meeting held* means
a conversation happened; after it, *MoU sent* means the agreed text is with them
to sign. Without it, the whole of that negotiation had nowhere to sit.

Nothing is ever deleted — a partner that goes nowhere is parked or declined, so
the record of having tried survives.

### The stages are yours

They are data — [`data/partners/stages.json`](../../data/partners/stages.json) —
so adding or renaming one needs no code change. Order is the pipeline, and three
flags carry the meaning the counts depend on:

| Flag | What it means |
| --- | --- |
| `engaged` | From here on, a real conversation has started. Drives *Past first meeting* on the Overview and *Engaged* per partner type |
| `committed` | Something is signed. Drives *MoU signed or active* |
| `terminal` | Out of the pipeline — not counted as in play, and drawn separately |


## What a record holds

| Field | Notes |
| --- | --- |
| `name` | The organisation — except `advisor` and `network` records, which name a person |
| `cat` | One of the eleven types above |
| `country` | Short code |
| `why` | One sentence: why *this* organisation specifically |
| `ask` | What we want **from them** — the single most useful field on the record |
| `stage` | Where the conversation stands |
| `owner` | Who on our side is carrying it |
| `contact` | Who on their side, if known |
| `next` / `nextDate` | The next move and when it is due |
| `notes` | Free text. Agents are told to leave this alone and put findings in the thread instead |

## This repository is public

Anyone can read
[`partners.json`](../../data/partners/partners.json) without logging in, and
git keeps every version of it forever — deleting a record later does not
remove it from history.

For the organisations that is mostly fine: that Aon is being approached about
a resilience facility is not a secret worth keeping. For `advisor` and
`network` records it is a different question, because those name **private
individuals** who never agreed to appear here, alongside a note about what
they are expected to do for us. Before adding a person, decide deliberately
whether it should be public.

If it should not, the options are: hold the person in a private note and keep
only a role on the board, make the repository private and accept that the
hosted desk stops working, or keep the record but drop the characterising
text.

## Working with it

**Filter** by stage, type, or free text. The count next to the filters tells you
how much of the list you are looking at.

**Click any row** to open the editor. Changing the stage writes an entry to the
[Activity](../activity/) log automatically, so the history of a relationship
accumulates without anyone maintaining it.

**Each partner has a thread** at the bottom of its editor — comments, findings,
questions, visible to everyone including agents. This is where research belongs.

## Filling in the real list

The fastest path is to say what you know and let it be written for you:
*"Dialog Axiata — met them, Priya in network ops, wants restoration cost data by
the 20th, I own it."* That is a stage change, a contact, a next move with a
date, an owner, and a log entry.

---

**Data:** [`data/partners/partners.json`](../../data/partners/partners.json) ·
**See also:** [What to ask each type](by-type.md) · [Activity](../activity/) · [Data and sync](../data/)
