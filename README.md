# Lionscraft — Partner & Facility Desk

Working infrastructure for the **programmable risk transfer** project. The desk
splits in two: a **CRM** for partners and where each MoU stands, and a
**Project** side holding the facility plan, the kanban board, the shared
activity log and the narrative reference.

### **→ [Open the desk](https://lionscraft-io.github.io/risk-cockpit/)**

Reading needs nothing — no login, no setup.

---

## Documentation

**[docs/](docs/)** — one folder per tab, mirroring what you click:

**CRM** — [Overview](docs/overview/) · [Partners](docs/partners/)
**Project** — [Plan](docs/plan/) · [Board](docs/board/) ·
[Activity](docs/activity/) · [Narrative](docs/narrative/)

Underneath: [Data and sync](docs/data/) · [Development](docs/development/) ·
[AGENTS.md](AGENTS.md)

## How it is built

The desk is a **single self-contained HTML file** — no build step, no
dependencies, no framework. **This repository is the database**: the board lives
under [`data/`](data/) — one file per section — every change is a commit, and git history
is the audit trail. Nothing is hosted beyond GitHub Pages serving static files.

Agents read and write the same file through GitHub's own hosted MCP server, its
Contents API, or plain git — nothing to deploy. See [AGENTS.md](AGENTS.md).

```
lionscraft-platform.html    the entire application
data/                       the board, one file per section
  meta.json                 revision and facility metadata
  partners/partners.json    the CRM
  plan/                     workstreams, tasks, milestones
  activity/activity.json    the shared log
data/schema.json            the assembled shape
scripts/validate.mjs        validator (node scripts/validate.mjs)
AGENTS.md                   contract for agents working on the board
docs/                       documentation, one folder per tab
server/                     optional self-hosted API — nothing uses it by default
```

## Two things to know before using it

**The 11 records are real, but the entities are not all confirmed.** Several
hold a group name — *Sumitomo Insurance*, *Sri Lanka* — rather than the entity
that actually signs. Those open questions sit in each partner's thread on the
[Activity](docs/activity/) tab. Confirm the entity before approaching anyone.

**The repository is public.** The board, the narrative and every activity entry
are world-readable and permanently in git history — including the `advisor` and
`network` records, which name **private individuals**. See
[Partners](docs/partners/) before adding a person.
