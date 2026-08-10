# Data and sync

**This repository is the database.** The board lives in
[`data/desk.json`](../data/desk.json), every change is a commit, and git history
is the audit trail. There is no server to be up or down.

---

## How a save works

1. The desk reads `data/desk.json` on load
2. Your edits are held in the browser and batched — a burst of edits becomes
   **one commit**, not one per keystroke
3. The commit is **compare-and-swap**: the desk sends back the blob `sha` it
   read, so if anyone committed in between, GitHub rejects the write
4. On rejection the desk re-reads, merges, and retries once

**The activity log always merges by id union**, so no comment or agent finding
is ever lost in a collision. Ordinary fields are last-write-wins.

A 30-second poll picks up what other people and agents committed — adopted
silently when you have nothing unpushed, offered via a banner when you do. It
never overwrites your work without asking.

## The chip in the top bar

| Chip | Meaning |
| --- | --- |
| `live · rev N` | Reading the board; saves commit automatically |
| `token needed` | You have edits but no GitHub token — set one under **Data** |
| `saving…` | Your edits are being committed |
| `update available` | The board moved on since your copy. The banner offers **Load the board** or **Push mine anyway** |
| `offline` | GitHub unreachable; working from this browser's copy and reconnecting on its own |

Offline is a working state, not an error: edits are kept and pushed when the
connection returns.

## Writing from the browser

Reading is public. To commit from the desk you need a GitHub token:

1. **https://github.com/settings/personal-access-tokens/new**
2. **Resource owner:** `Lionscraft-io` *(the repo belongs to the org, not to you
   personally — if this is wrong, the repository will not appear in the list)*
3. **Repository access:** Only select repositories → `risk-cockpit`
4. **Permissions → Repository permissions → Contents: Read and write.** Nothing else
5. Generate, copy the value — GitHub shows it once
6. Desk → **Data** → paste into **Access token**, reload

The token stays in your browser and is never committed. Scope it exactly as
above so its blast radius is one repository's files, and revoke it on GitHub if
it leaks — git history means any damage is recoverable.

Fine-grained tokens on an org repo may show as `Pending` until an org owner
approves them.

## The shape of the data

`data/desk.json`:

```jsonc
{
  "version": 1,
  "meta": { "org", "facility", "product", "revision": 1, "updated": "YYYY-MM-DD" },
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
| `data/desk.json` | **The database.** One live copy |
| Your browser's storage | Your cache plus any unpushed edits |
| `server/desk-local.json` | Throwaway file from running the optional local server. Gitignored |

## Agents

Agents read and write the same file, with the same discipline — through
GitHub's hosted MCP server, the Contents API, or plain git. The contract is
[AGENTS.md](../AGENTS.md).
