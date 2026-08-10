# Lionscraft — Partner & Facility Desk

Working infrastructure for the **programmable risk transfer** project: partner
CRM, facility plan, kanban board, shared activity log, outreach material, and
the narrative reference that keeps everything on-message.

### **→ [Open the desk](https://lionscraft-io.github.io/risk-cockpit/)**

Reading needs nothing — no login, no setup.

---

## Documentation

**[docs/](docs/)** — one folder per tab, mirroring what you click:

[Overview](docs/overview/) · [Partners](docs/partners/) · [Plan](docs/plan/) ·
[Board](docs/board/) · [Activity](docs/activity/) · [Outreach](docs/outreach/) ·
[Narrative](docs/narrative/)

Underneath: [Data and sync](docs/data/) · [Development](docs/development/) ·
[AGENTS.md](AGENTS.md)

## How it is built

The desk is a **single self-contained HTML file** — no build step, no
dependencies, no framework. **This repository is the database**: the board lives
in [`data/desk.json`](data/desk.json), every change is a commit, and git history
is the audit trail. Nothing is hosted beyond GitHub Pages serving static files.

Agents read and write the same file through GitHub's own hosted MCP server, its
Contents API, or plain git — nothing to deploy. See [AGENTS.md](AGENTS.md).

```
lionscraft-platform.html    the entire application
data/desk.json              the board — partners, tasks, milestones, activity
data/schema.json            its formal shape
scripts/validate.mjs        validator (node scripts/validate.mjs)
AGENTS.md                   contract for agents working on the board
docs/                       documentation, one folder per tab
server/                     optional self-hosted API — nothing uses it by default
```

## Two things to know before using it

**The 36 partners are research targets, not relationships.** Every seeded record
sits at *Identified* and carries a `seeded` flag. Swiss Re, ADB, Dialog Axiata
and the rest are there because they are the obvious organisations to approach —
not because anyone has spoken to them.

**The repository is public.** The board, the narrative and every activity entry
are world-readable and permanently in git history.
