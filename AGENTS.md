# Working on this board as an agent

The board lives under `data/` in this repository, one file per section.
**Git is the database** — every change is a commit, every commit is
attributable, and the history is the audit trail. There is no server to be up
or down.

| File | Holds |
| --- | --- |
| `data/meta.json` | `{version, meta}` — including `meta.revision` |
| `data/partners/partners.json` | the partner array |
| `data/plan/workstreams.json` | the workstream array |
| `data/plan/tasks.json` | the task array |
| `data/plan/milestones.json` | the milestone array |
| `data/events/events.json` | the event array |
| `data/investors/investors.json` | the investor array |
| `data/activity/activity.json` | the activity log |

Each file holds the bare array (or object, for `meta.json`) — no wrapper.

If you are an agent — Claude Code, another framework, a script, anything — this
file is your contract. Two doors in, and only two:

| Access | For | Auth |
| --- | --- | --- |
| **Proxy** — `PUT /api/board` on the desk's backend | The normal way. One request, one atomic commit | The app password |
| **Git** — clone, edit, push or PR | Bulk or reviewed changes | Repo access |

Both end at the same single commit on `main`, so they interleave safely as long
as you follow §2. Reading is public and needs no token.

**There is no third door.** Never write the files one at a time through the
GitHub Contents API or MCP file tools — several `PUT`s in a row leave the
board briefly inconsistent (partners updated, the log entry describing it
missing), and a reader in between sees a torn board. Never hold a GitHub token
in a browser. And there is no other backend: the old Postgres API was removed
precisely because a second store forks the truth.

---

## 1. Access

### Proxy — the normal way

The desk's backend (`server/proxy.mjs`, running at the desk's Replit address)
holds the GitHub token. You send the app password and the whole board in one
request; it makes the atomic commit for you.

```bash
# read — the head sha is your compare-and-swap token
curl https://<desk-host>/api/board
# → {"revision": 15, "head": "<sha>", "desk": {…}}

# write — re-read immediately before this, merge, then send
curl -X PUT -H "Authorization: Bearer $APP_PASSWORD" \
  -H "content-type: application/json" \
  https://<desk-host>/api/board \
  -d '{"desk": <the full document>, "head": "<sha from the read>", "actor": "your-name"}'
```

A `409` means someone committed in between: take the `desk` and `head` from the
response, re-apply your change on top, retry once. The read-modify-write rules
in §2 apply exactly.

### Git — clone and push

Normal git. Run `node scripts/validate.mjs` before pushing; external agents open
a pull request rather than pushing to `main`.

If you cannot use the proxy and cannot push, write through the git data API as
**one commit**: create a blob per changed file, build a tree on the current
head, create one commit, then move the branch ref. Moving the ref fails if
anyone committed in between, which is the compare-and-swap. Re-read, merge
again, retry once. Never force.

---

## 2. Writing safely

Same rules whichever route you take:

1. **Re-read immediately before writing.** Never write from a copy fetched
   earlier in your run
2. **Increment `meta.revision` by exactly 1** and set `meta.updated` to today
   (`YYYY-MM-DD`). Open browsers use the revision to notice the board moved
3. **Union the activity log by `id`** with what you just read, before writing.
   Someone else's comment must never vanish because you held an older copy
4. **Make it compare-and-swap.** Through the proxy: pass the `head` you read,
   and a `409` means re-read, merge again, retry once. Through git: parent your
   commit on the head you read, and let the ref update fail if it moved.
   Either way — never force
5. **Append at least one activity entry** describing what you did (§4)

The desk UI follows exactly these rules, so agents and people can work at the
same time with no coordinator.

---

## 3. The data contract

The assembled document, across the files listed above:

```jsonc
{
  "version": 1,
  "meta": { "org", "facility", "product", "revision": 1, "updated": "YYYY-MM-DD" },
  "partners":    [ Partner ],
  "workstreams": [ Workstream ],
  "tasks":       [ Task ],
  "milestones":  [ Milestone ],
  "events":      [ CalendarEvent ],
  "investors":   [ Investor ],
  "activity":    [ Event ]
}
```

### Partner

| Field | Notes |
| --- | --- |
| `id` | `p01`-style. Stable. Never reuse |
| `name` | Organisation — except `advisor` and `network` records, which name a person |
| `cat` | One of `carrier` `capital` `donor` `dfi` `operator` `digital` `data` `verifier` `public` `advisor` `network` |
| `country` | ISO-ish short code |
| `why` | One sentence: why this organisation specifically |
| `ask` | What we want *from them* |
| `stage` | Read `data/partners/stages.json` — the stages are data, not a fixed list. Currently `identified` → `researched` → `approached` → `meeting` → `aligning` → `mou_sent` → `mou_signed` → `active`, plus `parked` / `declined` |
| `owner` | Person on our side. May be empty |
| `contact` | Person on their side. May be empty |
| `next`, `nextDate` | The next move and when it is due |
| `notes` | Free text. **Treat as the human's space — append, never rewrite** |
| `seeded` | Present means it is a research target, not a relationship. Remove it once real |

### Task

`id`, `ws` (workstream id), `title`, `owner`, `start`, `due` (both `YYYY-MM-DD`),
`status`, `partner` (partner id or `""`).

**`status` must be a column id from `data/plan/columns.json`** — the columns are
data and can be renamed or added to from the UI. They are currently `backlog`
`weekly` `focus` `review` `done`. The old `todo` / `doing` / `blocked` set is
gone; writing one now produces a task that renders in no column and fails
`scripts/validate.mjs`.

`start` must not be after `due`. Both drive the timeline.

### Milestone

`id`, `name`, `date`, `hit` (boolean), `note`.

### CalendarEvent — the diary

`id`, `name`, `start`, `end` (both `YYYY-MM-DD`; `end` may be empty for a single
day), `time` (free text such as `09:00–10:30`, not parsed), `location`,
`partner` (partner id or `""`), `notes`.

`end` must not be before `start`. Named CalendarEvent here only to keep it
apart from the activity Event below — in the data it is just `events`.

### Investor — the raise

`id`, `name`, `type` (`insurtech` `reinsurer` `ils` `climate` `dfi` `fintech`
`crypto_rwa` `crypto` `growth` `sovereign` `bank` `strategic`), `geo`, `tier`
(`A` in the space and writes this stage · `B` in the space, wrong stage or type ·
`C` adjacent, no insurance thesis), `writes` (what stage they write, free text),
`thesis` (why they fit us), `evidence` (**dated** proof they have backed this kind
of product — keep it dated), `precedents` (their portfolio companies in the
space, free text), `warm` (the path in), `ask` (what to ask for), `stage`
(`identified` → `researched` → `approached` → `meeting` → `diligence` →
`term_sheet` → `committed`, plus `passed` / `parked`), `owner`, `contact`,
`next`, `nextDate`, `lastDate`, `notes`, `source` (where the record came from).

Evidence with no date is an opinion. If you cannot date it, say so in the log.
No personal names from third-party fundraising files: firm names only.

### Event — the activity log

```jsonc
{
  "id": "e_ab12cd",
  "at": "2026-08-08T19:42:00.000Z",   // ISO 8601, UTC
  "actor": "partner-researcher",       // your name. Be consistent run to run
  "actorKind": "agent",                // "agent" | "human"
  "kind": "finding",                   // see below
  "refType": "partner",                // "partner" | "task" | "milestone" | "event" | "investor" | "board"
  "ref": "p40",                        // id, or "" for the board generally
  "body": "…",                         // what you actually want to say
  "to": "board-operator"               // optional: directed at a named actor
}
```

`kind` is one of:

| kind | Use it for |
| --- | --- |
| `comment` | Ordinary remark |
| `change` | A state change worth recording |
| `finding` | Something research turned up |
| `question` | You need an answer before the work can continue |
| `handoff` | You are passing something to a named actor |

---

## 4. How agents communicate

Agents do not run at the same time and do not hold connections. **The activity
log is the channel** — the API just makes reading and writing it immediate
(a commit, or the MCP file tools).

- To tell another agent something, append an event with `to` set to their name
- To ask a person something, append a `question` — it surfaces in the Activity
  tab with an open-questions count, so it is visible rather than buried
- To pick up work, **read the log first**. Everything another agent found, asked
  or handed over is there, and it is the only thing that is

This is slower than a message bus and far more durable: every exchange is
attributable, timestamped, reviewable in a diff, and survives any agent dying
mid-run.

### Rules that keep the log trustworthy

- **Append only.** Never edit or delete an existing entry, including your own
- **Never write as someone else.** `actor` is you. `actorKind` is `agent`
- **Say what you did, not that you did something.** "Dialog's disaster-response
  function reports into Network Operations, not CSR" is useful. "Researched
  Dialog" is not
- **Answer questions addressed to you**, or say why you cannot

---

## 5. Rules for changing data

- **Preserve fields you do not understand.** Round-trip the JSON; do not rebuild
  objects from scratch. A field you drop is data someone loses
- **Never delete a partner, task or milestone on your own initiative.** Move
  partners to `parked` or `declined`; that is what those stages are for. Removal
  happens only when a human asks for it directly — as with the 36 seeded research
  targets cleared on 2026-08-10, recorded in the activity log
- **`notes` belongs to the humans.** Put your findings in the log, not over
  someone's notes
- **Do not invent facts about real organisations.** A partner record is what
  someone actually knows, not what is plausible. If you cannot verify something,
  say so in the log rather than writing it into the record as though it were known
- **Do not add contact details for named individuals.** Roles and functions are
  fine; personal data is not, and this repo is public
- **Keep ids stable.** Things reference each other by id

---

## 6. Guardrails for anything you write

These come from `docs/narrative/` and they are not stylistic
preferences — anything written that breaks them actively damages the pitch.

- **Never lead with blockchain, crypto, tokenisation or "on-chain."** Lead with
  the financial function: programmable financial rights, digital capital states,
  machine-readable obligations
- **Never caricature insurance.** "Insurance only gives money" is false and
  insulting to the people we are asking for capacity. The defensible claim is
  that most instruments define the financial protection and settlement, and
  Response-Linked ART explores making more of the downstream purpose intrinsic
- **Never claim AI makes contractual decisions.** Contracts and accountable
  parties decide; AI helps administer, interpret and evidence
- **Never present the future as already built.** Separate what exists from what
  the architecture may enable
- **Never collapse the hierarchy.** Programmable risk transfer is the company;
  disaster finance is the first application; Response-Linked ART is the first
  product; Sri Lanka telecom is the first implementation and *not* the company

If you are unsure whether a draft breaches these, it probably does. Log a
`question` instead of shipping it.

---

## 7. What is public

Everything you write — every log entry, every commit message — is world-readable
and permanently in git history. Do not write anything into this repo that should
not be public: no personal contact details, no confidential terms from a
counterparty, no credentials, nothing said to you in confidence.

---

## 8. A minimal write, end to end

```bash
git clone git@github.com:Lionscraft-io/risk-cockpit.git && cd risk-cockpit
```

```python
import json, datetime, uuid

# re-read immediately before editing
partners = json.load(open("data/partners/partners.json"))
activity = json.load(open("data/activity/activity.json"))
meta     = json.load(open("data/meta.json"))

p = next(p for p in partners if p["id"] == "p40")
p["stage"] = "researched"
p.pop("seeded", None)

activity.append({
    "id": "e_" + uuid.uuid4().hex[:6],
    "at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "actor": "partner-researcher",
    "actorKind": "agent",
    "kind": "finding",
    "refType": "partner",
    "ref": "p40",
    "body": "Disaster-response function reports into Network Operations, not CSR. "
            "Route the approach through the network side.",
})

meta["meta"]["revision"] += 1
meta["meta"]["updated"] = datetime.date.today().isoformat()

for path, obj in [("data/partners/partners.json", partners),
                  ("data/activity/activity.json", activity),
                  ("data/meta.json", meta)]:
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")
```

Then `node scripts/validate.mjs`, commit, and push or open a PR.

The same edit through the proxy is: re-read `/api/board`, apply the change,
`PUT` it back with the `head` you read — one request, one commit.
