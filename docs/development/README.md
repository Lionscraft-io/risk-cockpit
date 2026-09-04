# Working on the code

The desk is one self-contained HTML file — no build step, no dependencies, no
framework. Open it, edit it, reload.

```bash
open -a "Google Chrome" lionscraft-platform.html
```

---

## How the file is organised

Three parts inside `lionscraft-platform.html`:

**`<style>`** — design tokens on `:root`, redefined for dark theme via
`prefers-color-scheme` and again for the explicit `data-theme` toggle. Style
through the tokens, never inside the media query.

**Markup** — a fixed shell: top bar, nav, `#view`, drawer, toast. The nav
renders itself from `VIEWS`, so adding a tab is one array entry.

The nav is one flat row under the top bar at every width. It used to be a 198px
sidebar on desktop, which cost the board a column's worth of space; it was then
briefly split into CRM and Project halves, dropped once the CRM half held a
single tab. `#view` carries a `data-view` attribute so the board can be wider
than the reading views, which keep a comfortable measure.

Page headers are a title and nothing else — the eyebrow lines and descriptions
were stripped on 2026-08-11. A tool that explains itself on every screen is
explaining itself to someone who already knows.

**`<script>`** — reference data (stages, partner categories), the `SEED`
fallback, the GitHub sync layer, and one render function per tab.

## Conventions worth keeping

- Every view is a function returning an HTML string. `render()` swaps `#view`
  and calls the matching `wire*()` for anything needing event listeners
- All user-supplied text goes through `esc()`
- Dates are plain `YYYY-MM-DD` strings compared as strings; timeline maths runs
  in UTC via `toMs()` / `shiftDays()` so a viewer's timezone can never shift a
  bar by a day
- `TODAY` is the viewer's real local calendar date, so "overdue" stays honest
  without anyone editing a constant
- `save()` marks the copy unpushed and queues a commit; `save(true)` is for the
  sync machinery only, which manages that flag itself
- Adding a field to tasks or partners means: add it to `SEED`, to the drawer
  form, and add a backfill for data saved before it existed (see
  `backfillStarts`) — people carry older copies in their browsers

## Layout traps

- Wide content gets `overflow-x: auto` on its own container so the page body
  never scrolls sideways
- `.grid > *` carries `min-width: 0`. Without it, a wide scroller inside a grid
  child sizes the whole track to its content and the whole page slides sideways
- The page declares `<meta charset="utf-8">` in its first bytes. The content is
  full of em-dashes; without the declaration it mojibakes on any host that
  doesn't send a charset

## Validating data changes

```bash
node scripts/validate.mjs
```

Checks structure, enums, referential integrity (tasks pointing at real
workstreams and partners), date ordering, and id uniqueness. No dependencies.

## The server — the one backend

`server/proxy.mjs` is the desk's only backend. It holds the GitHub token
server-side, so browsers never see one: a person signs in with a short app
password, and the proxy turns each save into a single atomic commit on the
repo (blobs → tree → commit → move the branch; moving the branch is the
compare-and-swap). It also serves the desk page itself — deployed, it serves
the repo's current copy, so the UI can never drift from the data it writes.

Run it:

```bash
node server/proxy.mjs
```

It serves the desk at `/` and the API under `/api/…`, and the desk auto-detects
that it is being served by its own backend.

**Without `GITHUB_TOKEN` it is a development server**: saves are written to the
`data/` files in your checkout and nothing reaches GitHub. That is deliberate —
you can edit the board freely and read the diff — but it does mean changes stay
on your machine until you commit them. The desk says so: the chip reads
`working copy`, in amber rather than green.

Give it `GITHUB_TOKEN` (fine-grained PAT, Contents: read and write on this one
repo) and `APP_PASSWORD` (what people type into the desk) and the same server
commits to the real repository. The proxy has zero dependencies, so a bare
checkout plus `node` is a running server — no install step.

`Dockerfile` deploys it to any container host. The Replit deployment runs the
same file and is the desk's public editing address; the GitHub Pages copy is
read-only by design.

There used to be a second backend (`server/index.mjs`, Postgres) that kept its
own copy of the board — a fork of the truth. It was removed; git history has it
if anyone ever needs the reference.

## A standalone copy

```bash
node scripts/build-local.mjs            # → lionscraft-desk-local.html
node scripts/build-local.mjs ~/Desktop/desk.html
```

Bakes the current board into the page's `SEED` and gives the copy its own
storage key, so it opens from disk with no server and no GitHub, and a newer
build never shows an older build's edits. It is a snapshot: the board as it
was at build time, and anything edited in it stays in that browser.

`lionscraft-desk-local.html` in the repo root is that snapshot, committed, so
it can be downloaded from the Pages site as one file:

https://lionscraft-io.github.io/risk-cockpit/lionscraft-desk-local.html

It goes stale the moment the board moves. Refresh it by running the build and
committing the result; the commit message should say which revision it holds.

## Publishing

Push to `main`. GitHub Pages rebuilds in about a minute.

The desk is also publishable as a claude.ai artifact from the same file. That
copy cannot reach GitHub's API, so it reads its embedded `SEED` and is a
demo, not a working board.
