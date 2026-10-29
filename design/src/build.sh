#!/bin/bash
set -e
cd /home/claude/hero
cat /tmp/css_head8.css site/css/blocks_v5.css site/css/brand.css site/css/v7.css site/css/v12.css > site/css/site.css
cat /tmp/tpl_head9.html site/blocks_v7.html > site/template.html
python3 - <<'PY'
t=open('site/template.html').read(); c=open('site/_c_path.txt').read().strip(); tp=open('site/_t_path.txt').read().strip()
open('site/index.html','w').write(t.replace('__C_PATH__',c).replace('__T_PATH__',tp))
PY
mkdir -p site/src && cp /tmp/css_head8.css site/src/head.css && cp /tmp/tpl_head9.html site/src/tpl_head.html && cp build.sh site/src/build.sh && cp site/blocks_v7.html site/src/blocks_v7.html && cp site/css/brand.css site/src/brand.css && cp site/css/blocks_v5.css site/src/blocks_v5.css && cp site/css/v7.css site/src/v7.css && cp site/css/v12.css site/src/v12.css && cp src/hero_v14.js src/hero_v13.js src/hero_v12.js src/hero_v11.js src/hero_v10.js src/hero_v8.js src/hero_v8.css src/yode.js site/src/
echo built: $(wc -c < site/css/site.css) css, $(wc -c < site/index.html) html
