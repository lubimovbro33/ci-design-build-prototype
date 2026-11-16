# The inner pages — how they are made

Every page after the homepage and About is generated; do not edit `design/*.html` of those pages by hand.

- `content.json` — the client's copy, 2nd round, parsed from the single-file prototype by `parse.py` (one-off; its source path is local).
- `build.py` — the shell (head, menu, header, footer, rail) and the block builders (cover film, steps film, flowing Swiss blocks, closing block).
- `pages.py` — the pages themselves: which copy, which photographs, which blocks. `python3 tools/site/pages.py` writes them into `design/`.
- `wire.py` — wires the links of `index.html` and `about.html` to the real pages and sets their menu photographs.
- `verify.py` — checks that every sentence of the client's copy stands on its page word for word.

The kit: `design/css/inner.css`, `design/js/inner.js`. Photographs: `design/assets/ph/` (exported from the client's archive at 2560 px / 1600 px).

**The separator (the designer, 16.11).** Items of one line are never set apart by a small dot. One device for the whole site: a square 8 × 8 of the blue `#96A8BF`, 10 from the word before it and 10 before the next (`.sqr` in `design/css/r3.css`; her frame `435:4477`, «Of the day ■ At home»). In the generator write such a line with `sqr([...])`; a plain " · " in the copy or in the data becomes a `.sqr` row when the page is written (`squares()` in `build.py`), and a dot left between two elements stops the build. `wire.py` stops the same way on `index.html` and `about.html` (`nodots()`).
