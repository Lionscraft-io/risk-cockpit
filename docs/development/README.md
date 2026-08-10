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

**Markup** — a fixed shell: top bar, nav rail, `#view`, drawer, toast.

**`<script>`** — reference data (stages, partner categories, outreach
templates), the `SEED` fallback, the GitHub sync layer, and one render function
per tab.

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

## The optional server

`server/index.mjs` is a small REST backend with the same data contract —
Postgres when `DATABASE_URL` is set, a local file otherwise. **Nothing uses it
by default**; the desk talks to GitHub directly. It is kept for anyone who later
wants a real backend with instant multi-user sync.

Run it:

```bash
WRITE_TOKEN=<any-string> node server/index.mjs
```

It serves the desk at `/` and the API under `/api/…`, and the desk auto-detects
that it is being served by its own backend.

**Without `GITHUB_TOKEN` it is a development server**: saves are written to the
`data/` files in your checkout and nothing reaches GitHub. That is deliberate —
you can edit the board freely and read the diff — but it does mean changes stay
on your machine until you commit them. The desk says so: the chip reads
`working copy`, in amber rather than green.

Give it a `GITHUB_TOKEN` and the same server commits to the real repository
instead. Dependencies are vendored, so a bare
checkout plus `node` is a running server — no install step.

`Dockerfile` and `render.yaml` deploy it to any container host or to Render with
its own Postgres. Both are untested in production; the GitHub-native path is the
supported one.

## Publishing

Push to `main`. GitHub Pages rebuilds in about a minute.

The desk is also publishable as a claude.ai artifact from the same file. That
copy cannot reach GitHub's API, so it reads its embedded `SEED` and is a
demo, not a working board.
