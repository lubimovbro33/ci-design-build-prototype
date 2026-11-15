# The inner pages — how they are made

Every page after the homepage and About is generated; do not edit `design/*.html` of those pages by hand.

- `content.json` — the client's copy, 2nd round, parsed from the single-file prototype by `parse.py` (one-off; its source path is local).
- `build.py` — the shell (head, menu, header, footer, rail) and the block builders (cover film, steps film, flowing Swiss blocks, closing block).
- `pages.py` — the pages themselves: which copy, which photographs, which blocks. `python3 tools/site/pages.py` writes them into `design/`.
- `wire.py` — wires the links of `index.html` and `about.html` to the real pages and sets their menu photographs.
- `verify.py` — checks that every sentence of the client's copy stands on its page word for word.

The kit: `design/css/inner.css`, `design/js/inner.js`. Photographs: `design/assets/ph/` (exported from the client's archive at 2560 px / 1600 px).
