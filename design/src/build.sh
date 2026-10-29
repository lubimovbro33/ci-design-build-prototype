#!/bin/bash
set -e
cd /home/claude/hero
cat /tmp/css_head3.css site/css/blocks_v5.css site/css/brand.css site/css/v7.css > site/css/site.css
cat /tmp/tpl_head3.html site/blocks_v7.html > site/index.html
cp site/index.html site/template.html
mkdir -p site/src && cp /tmp/css_head3.css site/src/head.css && cp /tmp/tpl_head3.html site/src/tpl_head.html && cp build.sh site/src/build.sh && cp site/blocks_v7.html site/src/blocks_v7.html && cp site/css/brand.css site/src/brand.css && cp site/css/blocks_v5.css site/src/blocks_v5.css && cp site/css/v7.css site/src/v7.css
echo built: $(wc -c < site/css/site.css) css, $(wc -c < site/index.html) html
