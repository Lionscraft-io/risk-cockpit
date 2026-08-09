# Working on this board as an agent

The board is `data/desk.json` in this repository. **Git is the database** —
every change is a commit, every commit is attributable, and the history is the
audit trail. There is no server to be up or down.

If you are an agent — Claude Code, another framework, a script, anything — this
file is your contract. Three ways in:

| Access | For | Auth |
| --- | --- | --- |
| **MCP** — GitHub's hosted server at `https://api.githubcopilot.com/mcp/` | MCP-capable agents. Nothing to install or deploy | GitHub PAT or OAuth |
| **REST** — GitHub Contents API | Any agent or script that can make an HTTP request | GitHub PAT |
| **Git** — clone, edit, push or PR | Bulk or reviewed changes | Repo access |

All three touch the same file, so they interleave safely as long as you follow
§2. Reading is public and needs no token.

---

## 1. Access

### MCP — nothing to run

GitHub hosts the MCP server; point your client at it with a token and the repo
becomes a set of typed tools. For Claude Code:

```bash
claude mcp add github --transport http https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer <your-github-pat>"
```

Then read and write `data/desk.json` on `Lionscraft-io/risk-cockpit` with the
file tools it exposes. Use a **fine-grained** PAT scoped to this one repository
with **Contents: read and write** — nothing else.

### REST — GitHub Contents API

```bash
# read, public, no token
curl https://raw.githubusercontent.com/Lionscraft-io/risk-cockpit/main/data/desk.json

# read with the sha you need in order to write
curl -H "Authorization: Bearer $GH_PAT" \
  https://api.github.com/repos/Lionscraft-io/risk-cockpit/contents/data/desk.json

# write: base64 content plus the sha you just read
curl -X PUT -H "Authorization: Bearer $GH_PAT" \
  https://api.github.com/repos/Lionscraft-io/risk-cockpit/contents/data/desk.json \
  -d '{"message":"...","content":"<base64>","sha":"<sha from the read>","branch":"main"}'
```

### Git — clone and push

Normal git. Run `node scripts/validate.mjs` before pushing; external agents open
a pull request rather than pushing to `main`.

---

## 2. Writing safely

Same rules whichever route you take:

1. **Re-read immediately before writing.** Never write from a copy fetched
   earlier in your run
2. **Increment `meta.revision` by exactly 1** and set `meta.updated` to today
   (`YYYY-MM-DD`). Open browsers use the revision to notice the board moved
3. **Union the activity log by `id`** with what you just read, before writing.
   Someone else's comment must never vanish because you held an older copy
4. **Pass the `sha`** you read (REST/MCP). That makes the write
   compare-and-swap: if anyone committed in between, GitHub rejects it with
   `409`. Re-read, merge again, retry — never force
5. **Append at least one activity entry** describing what you did (§4)

The desk UI follows exactly these rules, so agents and people can work at the
same time with no coordinator.

---

## 3. The data contract

`data/desk.json`:

```jsonc
{
  "version": 1,
  "meta": { "org", "facility", "product", "revision": 1, "updated": "YYYY-MM-DD" },
  "partners":    [ Partner ],
  "workstreams": [ Workstream ],
  "tasks":       [ Task ],
  "milestones":  [ Milestone ],
  "activity":    [ Event ]
}
```

### Partner

| Field | Notes |
| --- | --- |
| `id` | `p01`-style. Stable. Never reuse |
| `name` | Organisation, not a person |
| `cat` | One of `carrier` `capital` `donor` `dfi` `operator` `digital` `data` `verifier` `public` |
| `country` | ISO-ish short code |
| `why` | One sentence: why this organisation specifically |
| `ask` | What we want *from them* |
| `stage` | `identified` → `researched` → `approached` → `meeting` → `mou_sent` → `mou_signed` → `active`, plus `parked` / `declined` |
| `owner` | Person on our side. May be empty |
| `contact` | Person on their side. May be empty |
| `next`, `nextDate` | The next move and when it is due |
| `notes` | Free text. **Treat as the human's space — append, never rewrite** |
| `seeded` | Present means it is a research target, not a relationship. Remove it once real |

### Task

`id`, `ws` (workstream id), `title`, `owner`, `start`, `due` (both `YYYY-MM-DD`),
`status` (`todo` `doing` `blocked` `done`), `partner` (partner id or `""`).

`start` must not be after `due`. Both drive the timeline.

### Milestone

`id`, `name`, `date`, `hit` (boolean), `note`.

### Event — the activity log

```jsonc
{
  "id": "e_ab12cd",
  "at": "2026-08-08T19:42:00.000Z",   // ISO 8601, UTC
  "actor": "partner-researcher",       // your name. Be consistent run to run
  "actorKind": "agent",                // "agent" | "human"
  "kind": "finding",                   // see below
  "refType": "partner",                // "partner" | "task" | "milestone" | "board"
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
- **Never delete a partner, task or milestone.** Move partners to `parked` or
  `declined`; that is what those stages are for
- **`notes` belongs to the humans.** Put your findings in the log, not over
  someone's notes
- **Do not invent facts about real organisations.** Every seeded partner is a
  *research target* someone picked as plausible. If you cannot verify something,
  say so in the log rather than writing it into the record as though it were known
- **Do not add contact details for named individuals.** Roles and functions are
  fine; personal data is not, and this repo is public
- **Keep ids stable.** Things reference each other by id

---

## 6. Guardrails for anything you write

These come from `docs/master-narrative.md` and they are not stylistic
preferences — outreach that breaks them actively damages the pitch.

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

with open("data/desk.json") as f:          # re-read immediately before editing
    db = json.load(f)

p = next(p for p in db["partners"] if p["id"] == "p40")
p["stage"] = "researched"
p.pop("seeded", None)

db["activity"].append({
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

db["meta"]["revision"] += 1
db["meta"]["updated"] = datetime.date.today().isoformat()

with open("data/desk.json", "w") as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
    f.write("\n")
```

Then `node scripts/validate.mjs`, commit, and push or open a PR.

The same edit over REST or MCP is the read → modify → write-with-sha cycle in §2.
