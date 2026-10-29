  /* ================================================================== YODEZEEN text reveal
     measured on yodezeen.com: every character is its own inline span (opacity 0 → 1, expo-out);
     inside a word the LAST character starts first (reversed stagger, ~7 px of scroll per char),
     each word starts at its own offset; the whole thing is scrubbed by scroll (reversible).
     Here: progress p in [0,1] (scroll or time) → per-char opacity. */
  function yodeHash(i){ var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function yodeSplit(el){
    var words = [];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'yw'; var cs = [];
            for (var i = 0; i < p.length; i++) { var c = document.createElement('span'); c.className = 'yc'; c.textContent = p[i]; w.appendChild(c); cs.push(c); }
            words.push(cs); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    var chars = [], wi = 0, STEP = .028, D = .42;
    words.forEach(function(cs){ var base = yodeHash(wi++ + el._yseed) * .45; cs.forEach(function(c, i){ chars.push({el:c, off:base + (cs.length - 1 - i) * STEP}); }); });
    var S = 0; chars.forEach(function(c){ if (c.off > S) S = c.off; }); S += D;
    el._yode = {chars:chars, S:S, D:D, last:-1};
    el.classList.add('split');
  }
  function yodeSet(el, p){
    var y = el._yode; if (!y) return;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    if (p === y.last) return; y.last = p;
    var ps = p * y.S, cs = y.chars;
    for (var i = 0; i < cs.length; i++) {
      var q = (ps - cs[i].off) / y.D; q = q < 0 ? 0 : q > 1 ? 1 : q;
      cs[i].el.style.opacity = q >= 1 ? 1 : (1 - Math.pow(2, -10 * q)).toFixed(3);
    }
    if (p >= 1) el.classList.add('done'); else el.classList.remove('done');
  }
  var yodeSeed = 0;
  qsa('.yode').forEach(function(el){ el._yseed = (yodeSeed += 7); yodeSplit(el); });
  var yodeScroll = qsa('.yode').filter(function(el){ return el.id !== 'title'; });
  function updateYode(vh){
    for (var i = 0; i < yodeScroll.length; i++) {
      var el = yodeScroll[i], r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      yodeSet(el, (vh * .9 - r.top) / (vh * .26));
    }
  }
