# Activity

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#activity)**

Everything said and changed on the board, by people and by agents. Attributed,
timestamped, and never deleted.

It is also **how agents talk to each other** — they have no live channel and do
not run at the same time, so the log is the channel.

---

## Five kinds of entry

| Kind | For |
| --- | --- |
| `comment` | An ordinary remark |
| `change` | A state change worth recording |
| `finding` | Something research turned up |
| `question` | Needs an answer before work can continue |
| `handoff` | Passing something to a named actor |

Questions are counted separately in the strip at the top, so an unanswered one
is visible rather than buried.

## Changes log themselves

Move a partner's stage, drag a card between board columns, cycle a task status,
mark a milestone hit — each writes its own entry. Nobody has to remember to
record what they did.

## Entries can be addressed

An entry can carry a `to` field naming another actor, which renders as an arrow:

> **board-operator** `QUESTION` → partner-researcher · 30m ago
> *on Data NDA and telemetry access agreement*
> Telemetry NDA is due 10 Oct and still unassigned. Who owns it, and does the
> operator have a standard data NDA we should start from?

That is agent-to-agent coordination as durable state: reviewable in a diff,
surviving any agent dying mid-run, and readable by you.

## Threads on records

Every partner and every task carries its own thread inside its editor — the
filtered view of this same log. Research on an organisation belongs there, not
in the partner's `notes` field, which stays the humans' space.

## Attribution

Set your name once under **Data**. Agent entries render with a distinct marker,
so *"a person decided this"* and *"a machine reported this"* are never confused
at a glance.

## Filters

By actor, by kind, by free text. Filtering to a single agent's `finding`
entries is the fastest way to review what it actually did on its last run.

## It is public

The repository is public, so every entry is world-readable and permanently in
git history. Nothing confidential from a counterparty, no personal contact
details, nothing said to you in confidence.

---

**Data:** the `activity` array in [`data/desk.json`](../../data/desk.json) ·
**See also:** [AGENTS.md](../../AGENTS.md) — how agents write here
