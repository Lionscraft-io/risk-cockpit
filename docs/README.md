# Documentation

One folder per tab of the desk, mirroring what you click.

**The desk:** https://lionscraft-io.github.io/risk-cockpit/

---

## The tabs

One flat row across the top.

| | What it covers |
| --- | --- |
| **[Overview](overview/)** | One derived card per tab — the landing page |
| **[Partners](partners/)** | The CRM: eleven partner types, ten stages, and the 15 records in play |
| **[Plan](plan/)** | The work grouped by workstream, and the draggable timeline |
| **[Board](board/)** | The same cards by state — the working view |
| **[Events](events/)** | Meetings and conferences, with dates |
| **[Activity](activity/)** | The shared log, and how agents talk to each other through it |

Three tabs were removed on 2026-08-11. **Outreach** generated eight draft
formats per partner type — what it knew is kept as reference in
[partners/by-type.md](partners/by-type.md). **Narrative** rendered the master
brief in the app; the brief itself is untouched and still lives in
[narrative/](narrative/) — only the tab went. The original **Overview** went
too, along with a short-lived CRM/Project switch — and a new Overview came back
the same day as the plain per-tab digest above.

## Underneath

| | What it covers |
| --- | --- |
| **[Data and sync](data/)** | Git as the database, how a save becomes a commit, the status chip, the write token |
| **[Development](development/)** | How the single HTML file is organised, conventions, the validator, the optional server |
| **[AGENTS.md](../AGENTS.md)** | The contract for agents working on the board |

---

## The hierarchy everything hangs from

Never invert it — it is the most common way this story breaks.

1. **Architecture** — programmable risk transfer *(this is the company)*
2. **Application** — disaster and resilience finance
3. **Product** — Response-Linked ART
4. **Sector** — critical infrastructure / telecoms
5. **Implementation** — Sri Lanka telecom resilience facility *(the wedge, not the company)*
