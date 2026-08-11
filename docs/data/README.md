# Data and sync

**This repository is the database.** The board lives under
[`data/`](../../data/), one file per section, and every change is a single
commit. Git history is the audit trail.

| File | Holds |
| --- | --- |
| [`data/meta.json`](../../data/meta.json) | Revision and facility metadata |
| [`data/partners/partners.json`](../../data/partners/partners.json) | The CRM |
| [`data/plan/workstreams.json`](../../data/plan/workstreams.json) | The ten workstreams |
| [`data/plan/tasks.json`](../../data/plan/tasks.json) | Every task |
| [`data/plan/milestones.json`](../../data/plan/milestones.json) | Milestones — currently empty |
| [`data/activity/activity.json`](../../data/activity/activity.json) | The shared log |

Each holds the bare array — no wrapper — so a file can be read on its own.

---

## One store, one door

There is exactly **one source of truth** (the files above on `main`) and
exactly **one write path**: the desk's backend, `server/proxy.mjs`, running at
the desk's Replit address. It holds the GitHub token server-side and turns
every save — from a browser or from an agent — into a single atomic commit.

Anything served anywhere else (the GitHub Pages copy) is **read-only**. It
still shows the board, but edits stay in that browser. This is deliberate:
earlier versions let browsers commit directly with their own GitHub tokens and
ran a second backend with its own store. Two write paths and two stores meant
the board could silently fork depending on where you looked — so now there is
one door, and everything goes through it.

## How a save works

1. The desk reads the board through the backend on load
2. Your edits are held in the browser and batched — a burst of edits becomes
   **one commit**, not one per keystroke
3. It is **one commit touching only what changed** — editing a partner writes
   `partners.json`, `activity.json` and `meta.json`, and leaves the plan files
   alone. The backend goes through git's blob → tree → commit → ref API rather
   than file-by-file writes, because several separate writes would leave the
   board briefly inconsistent
4. Moving the branch is the **compare-and-swap**: it only succeeds if nobody
   committed in between. On rejection the desk re-reads, merges, and retries once

**The activity log always merges by id union**, so no comment or agent finding
is ever lost in a collision. Ordinary fields are last-write-wins.

A 30-second poll picks up what other people and agents committed — adopted
silently when you have nothing unpushed, offered via a banner when you do. It
never overwrites your work without asking.

## The chip in the top bar

| Chip | Meaning |
| --- | --- |
| `live · rev N` | Reading the board; saves commit automatically |
| `password needed` | You have edits but no team password — set it under **Data** |
| `read-only` | This copy has no backend (e.g. the Pages copy) — edits stay local |
| `saving…` | Your edits are being committed |
| `update available` | The board moved on since your copy. The banner offers **Load the board** or **Push mine anyway** |
| `offline` | Backend unreachable; working from this browser's copy and reconnecting on its own |

Offline is a working state, not an error: edits are kept and pushed when the
connection returns.

## Writing from the browser

Reading is public. To change the board you need the **team password**:

1. Open the desk at its Replit address (the backend's own origin — the desk
   auto-detects it)
2. Desk → **Data** → paste the password into **Password**

That is the whole setup. No GitHub token ever touches a browser: it lives only
on the server, so a leaked password lets someone edit the board but never touch
the repository directly.

**You enter it once per browser.** It is kept in that browser's local storage
and survives reloads and restarts, so it is prefilled next time you open
**Data**.

### Setting up another browser or phone without retyping it

Open **Data → Copy setup link**. That produces a link with the password in its
fragment. Open it once on the other device — phone, laptop, another browser —
and that browser is configured permanently. The desk absorbs the password and
**wipes it out of the address bar immediately**, so it does not sit in the tab
or show up in a screenshot.

Two things to understand about that link:

- **It is the credential.** Anyone who opens it can edit the board. Send it to
  yourself, or to someone you would hand the password to — not into a group chat
- The fragment (everything after `#`) is **never sent to any server**. It does
  land in that browser's history, which is why it gets wiped from the bar on
  arrival

Storing the link, or the password itself, in a password manager is the tidiest
way to keep it to hand.

## The shape of the data

Assembled from the files above:

```jsonc
{
  "version": 1,                                    // data/meta.json
  "meta": { "org", "facility", "product", "revision", "updated" },
  "partners":    [ … ],   // id, name, cat, country, why, ask, stage, owner, contact, next, nextDate, notes
  "workstreams": [ … ],   // id (WS1…), name, layer, lead
  "tasks":       [ … ],   // id, ws, title, owner, start, due, status, partner
  "milestones":  [ … ],   // id, name, date, hit, note
  "activity":    [ … ]    // id, at, actor, actorKind, kind, refType, ref, body, to
}
```

Formally described in [`data/schema.json`](../data/schema.json), and enforced by
a zero-dependency validator that also checks what a schema cannot — referential
integrity, date ordering, id uniqueness:

```bash
node scripts/validate.mjs
```

Run it before committing any change to the data.

`meta.revision` only ever moves forward, and is how every open browser notices
the board moved.

## Where else data lives

| Thing | What it is |
| --- | --- |
| The files under `data/` | **The database.** One live copy |
| Your browser's storage | Your cache plus any unpushed edits |
| `server/desk-local.json` | Throwaway file from running the local dev server. Gitignored |

## Agents

Agents use the same two doors as everyone else — the backend's `PUT /api/board`
with the app password, or plain git — under the same discipline. The contract
is [AGENTS.md](../AGENTS.md).

---

## Running the backend

`server/proxy.mjs` has zero dependencies. Three environment variables:

```bash
GITHUB_TOKEN=github_pat_…  APP_PASSWORD=some-phrase  node server/proxy.mjs
```

The token is a fine-grained PAT scoped to this one repository with
**Contents: read and write** — nothing else. The password is what people and
agents send instead of a token.

The backend is stateless: it stores nothing, and the repo remains the only
database. If it goes down, reads keep working from Pages and writes simply
wait.

**Without `GITHUB_TOKEN` it is a development server**: saves are written to the
`data/` files in your checkout and nothing reaches GitHub — edit the board
freely, then read the diff. The desk says so: the chip reads `working copy`,
in amber rather than green.
