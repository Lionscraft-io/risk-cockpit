# Data and sync

**This repository is the database.** The board lives under
[`data/`](../../data/), one file per section, and every change is a commit. Git
history is the audit trail. There is no server to be up or down.

| File | Holds |
| --- | --- |
| [`data/meta.json`](../../data/meta.json) | Revision and facility metadata |
| [`data/partners/partners.json`](../../data/partners/partners.json) | The CRM |
| [`data/plan/workstreams.json`](../../data/plan/workstreams.json) | The nine workstreams |
| [`data/plan/tasks.json`](../../data/plan/tasks.json) | Every task |
| [`data/plan/milestones.json`](../../data/plan/milestones.json) | The six milestones |
| [`data/activity/activity.json`](../../data/activity/activity.json) | The shared log |

Each holds the bare array — no wrapper — so a file can be read on its own.

---

## How a save works

1. The desk reads all six files on load and assembles them
2. Your edits are held in the browser and batched — a burst of edits becomes
   **one commit**, not one per keystroke
3. It is **one commit touching only what changed** — editing a partner writes
   `partners.json`, `activity.json` and `meta.json`, and leaves the plan files
   alone. This goes through git's blob → tree → commit → ref API rather than
   file-by-file writes, because several separate writes would leave the board
   briefly inconsistent
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

**You enter it once per browser.** It is kept in that browser's local storage
and survives reloads and restarts, so it is prefilled next time you open
**Data**.

### Setting up another browser or phone without retyping it

Open **Data → Copy setup link**. That produces a link with the token in its
fragment. Open it once on the other device — phone, laptop, another browser —
and that browser is configured permanently. The desk absorbs the token and
**wipes it out of the address bar immediately**, so it does not sit in the tab
or show up in a screenshot.

Two things to understand about that link:

- **It is the credential.** Anyone who opens it can edit the board. Send it to
  yourself, or to someone you would hand the token to — not into a group chat
- The fragment (everything after `#`) is **never sent to any server**, so the
  token does not appear in GitHub's logs. It does land in that browser's
  history, which is why it gets wiped from the bar on arrival

Storing the link, or the token itself, in a password manager is the tidiest
way to keep it to hand.

Choosing **No expiration** on GitHub makes it permanent; a dated expiry means
re-entering it when it lapses. No expiration is reasonable here given the token
is scoped to one repository's contents, but it is a real trade-off: a leaked
token stays valid until you revoke it.

The token is never committed. Scope it exactly as above so its blast radius is
one repository's files, and revoke it on GitHub if it leaks — git history means
any damage is recoverable.

Fine-grained tokens on an org repo may show as `Pending` until an org owner
approves them.

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
| `server/desk-local.json` | Throwaway file from running the optional local server. Gitignored |

## Agents

Agents read and write the same file, with the same discipline — through
GitHub's hosted MCP server, the Contents API, or plain git. The contract is
[AGENTS.md](../AGENTS.md).
