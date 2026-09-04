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

The tier answers one question: *would this fund write into an $8.5M seed for
risk infrastructure?* The workbook was tiered for a pre-seed with $300–750k
cheques; re-tiering for the seed moved several names.

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
| `lastDate` / `nextDate` | When we last spoke; when the next move is due |
| `source` | Workbook sheet and rank, or the research date |

Click a row to edit it, **Add investor** to create one. Changing the stage
writes an entry to the [Activity](../activity/) log, and each investor has a
thread at the bottom of its editor.

## What it does not do

It is not a data room and it does not track terms. It holds no cap-table
maths. Precedents are names, not links — the evidence line says which round
and when, and that is enough to find it. The 256-name universe and the 80
rounds stay in the workbook; ask if you want them imported as a separate
reference list.

---

**Data:** [`data/investors/investors.json`](../../data/investors/investors.json) ·
**See also:** [Partners](../partners/) · [Activity](../activity/)
