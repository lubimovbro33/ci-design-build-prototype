/* r3 (13.11): 06 Service Suite — its title has a screen of its own; the scroll hands the stage over to the stack. */
(function(){
  var pin = document.getElementById('suPin'), st = pin && pin.querySelector('.su-stage'); if (!st) return;
  var last = -1;
  function tick(){
    var r = pin.getBoundingClientRect(), vh = window.innerHeight, d = r.height - vh;
    var p = d > 4 ? Math.max(0, Math.min(1, -r.top / d)) : 1, k = p.toFixed(3);
    if (k !== last){ last = k; st.style.setProperty('--sp', k); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
