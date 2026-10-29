# CI Design + Build — website

- `/` — clickable prototype (English, client edits applied). Single file: `index.html`.
- `/design/` — homepage DESIGN (hero + 13 blocks). Static: `index.html`, `css/site.css`, `js/site.js`, `assets/`.
  Sources used to build it are in `design/src/` (`build.sh` concatenates head.css + blocks_v5.css + brand.css + v7.css → css/site.css; tpl_head.html + blocks_v7.html → index.html).
- `/design/archive/` — earlier concept explorations (v1–v4) and draft inner pages.

Deploys: Vercel, two projects from this repo — prototype (root) and design (`design/` root directory).
