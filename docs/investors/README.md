# Investors

**[Open the tab →](https://lionscraft-io.github.io/risk-cockpit/#investors)**

The investor space for the seed: who has actually funded this kind of product,
tiered by fit for an $8.5M round, each with dated evidence.

---

## Where it came from

Two sources, kept apart by the `source` field on every record.

**A third-party fundraising workbook** (`investor-tracker-all-in-one.xlsx`,
September 2026). Four sheets: a 256-name investor universe from someone else's
raise, 80 crypto funding rounds, and two curated sheets — a 21-name thesis-fit
shortlist and a 16-name approach priority — both built for a **pre-seed**. The
universe and its outreach statuses were deliberately not imported: they are
that project's relationships and that project's market cycle, not ours. The two
curated sheets were imported in full. No personal names from that file were
carried over — firm names only, and warm paths name organisations and events,
never a person.

**Research on 4 September 2026** into who funded the precedents in this
category — Descartes Underwriting, Arbol, FloodFlash, Raincoat, IBISA, Ledger
Investing, Re, OnRe, Birch Hill — and into the insurance-native, climate, DFI,
Japanese and Gulf investors the workbook's own footnote says it lacks.

## The three tiers

| Tier | Meaning |
| --- | --- |
| **A** | Has backed parametric, ILS or on-chain reinsurance, and writes seed. Approach first. |
| **B** | In the space, but wrong stage (growth-only) or wrong type (bank, strategic, retreating). Relationship now, cheque later — or partner rather than investor. |
| **C** | Adjacent crypto and RWA funds with no insurance thesis. Round-fillers. |
| **X** | Checked, and no evidence found of investing in insurance, risk transfer or RWA. Kept so the exclusion is on the record, folded shut at the bottom of the tab. |

The tier answers one question: *would this fund write into an $8.5M seed for
risk infrastructure?* The workbook was tiered for a pre-seed with $300–750k
cheques; re-tiering for the seed moved several names.

## How the order works

The tab groups by tier, and inside a tier the **rank** is set by hand against
one rule, in this order:

1. **A path in through something already on this board** — a partner at MoU
   stage, an event in the diary, a name on the original target list. Warm
   before cold.
2. **Can they lead a round this size?** An $8.5M seed needs a lead; a fund that
   writes $300k follower cheques is useful but not first.
3. **The freshest dated evidence.** A deal in 2026 beats one in 2022.

So MS&AD Ventures ranks first in Tier A not because it is the biggest fund but
because it is the venture arm of a group already at MoU stage; Convective ranks
fourth despite the best thesis fit because the path in is cold. Change a rank
in the editor and say why in the thread — the rule is the point, the number is
just where it lands.

## Links

Each record carries two: the fund's **website**, and the **source** of its
evidence line. Websites were checked live before being added; a fund with no
verified site shows *search ↗* instead, which opens a web search — never a
guessed URL. Evidence sources are the articles the research came from, dated
in the line they support. Records imported from the workbook have no source
link, because the workbook cited screenshots, not URLs.

## What changed against the workbook

- **SiriusPoint** was its "THE strategic slot". Its CEO has since said the group
  is reducing equity stakes in MGAs and going underwriting-first; its last
  venture deal was December 2024. Now Tier B — a capacity partner, not a cheque.
- **MS&AD Ventures** was absent. It is the CVC of the group behind Mitsui
  Sumitomo Insurance, which may be the counterparty on the Sumitomo Insurance
  MoU. Tier A — and warm or cold depending on which Sumitomo house signed.
- **ADB Ventures** was absent. It funds parametric insurtech from Manila under a
  climate mandate, and ADB is already aligning on the facility. Tier A.
- **Anthemis, Convective, Mundi, BlackFin, Buoyant, Munich Re Ventures, Brewer
  Lane, Eos, BlueOrchard** were absent — the insurance-native and climate
  investors the workbook itself says are missing. All Tier A.
- **Anthemis's new insurance fund has Sumitomo Life as an LP**, and **Eos runs
  an insurtech strategy with Twelve Capital**, an ILS manager from the original
  partner target list. Neither link was in the workbook.

## The record

| Field | Notes |
| --- | --- |
| `type` | One of twelve: insurtech, insurer/reinsurer CVC, ILS, climate, DFI, fintech, crypto-RWA, crypto, growth, sovereign, bank, strategic |
| `tier` | A / B / C, as above |
| `writes` | What stage they write, free text |
| `thesis` | Why they fit us — one or two sentences |
| `evidence` | **Dated** proof they have backed this kind of product. Undated evidence is an opinion |
| `precedents` | Their portfolio companies in the space |
| `warm` | The path in — organisations and events, never a person's name |
| `ask` | What to ask them for |
| `stage` | identified → researched → approached → meeting → diligence → term sheet → committed, plus passed / parked |
| `source` | Workbook sheet and rank, or the research date |
| `rank` | Order within the tier, by the rule above. 0 means unranked |
| `year` | The latest dated deal in the evidence line. 0 means undated |
| `link` | The fund's website, checked live. Empty shows a web search |
| `sourceUrl` | Where the evidence line came from |

The list is a decision table: **#**, **Investor** (with its website), the
**Evidence** in full, the **Year** of its latest dated deal, and the **Source**
it came from — so the funds can be compared without opening anything. Click a
row to **read the case** — why they fit, precedents, the path in, the ask — as
paragraphs, with an *Edit* button for the rare change. **Add investor** creates one. Changing the stage writes an
entry to the [Activity](../activity/) log, and each investor has a thread at
the bottom of its profile.

## What it does not do

There is no owner, contact, next move or date on an investor — this is a map
of the space, not a pipeline, and the stage chip alone says whether a
conversation exists. It is not a data room and it does not track terms. It holds no cap-table
maths. Precedents are names, not links — the evidence line says which round
and when, and that is enough to find it. The 256-name universe and the 80
rounds stay in the workbook; ask if you want them imported as a separate
reference list.

---

**Data:** [`data/investors/investors.json`](../../data/investors/investors.json) ·
**See also:** [Partners](../partners/) · [Activity](../activity/)
