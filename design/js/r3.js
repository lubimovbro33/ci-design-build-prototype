/* r3 (13.11) */
(function(){
  /* 06 Service Suite — its title has a screen of its own; the scroll hands the stage over to the stack */
  var pin = document.getElementById('suPin'), st = pin && pin.querySelector('.su-stage'), last = -1;
  /* the bars over the content: soft blur behind the chapter rail and behind the header's logo and buttons (shown with the rail) */
  var chap = document.querySelector('.chap'), root = document.documentElement, railOn = null;
  ['r3-rb', 'r3-hb l', 'r3-hb r'].forEach(function(c){ var d = document.createElement('div'); d.className = c; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); });
  function tick(){
    if (st){ var r = pin.getBoundingClientRect(), vh = window.innerHeight, d = r.height - vh;
      var p = d > 4 ? Math.max(0, Math.min(1, -r.top / d)) : 1, k = p.toFixed(3);
      if (k !== last){ last = k; st.style.setProperty('--sp', k); } }
    var on = !!(chap && chap.classList.contains('show')); if (on !== railOn){ railOn = on; root.classList.toggle('rail-on', on); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
