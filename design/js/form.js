/* CI · the inquiry form as a pop-up. Every button that leads to Contact opens it (the footer's and the menu's "Contact" still lead to the page).
   The form is the site's own; the fields are the client's (copy, 2nd round).
   TO CONNECT (not done yet): send() must post the data to an endpoint of the site that creates an item on the client's monday.com board
   (monday API, create_item) — it needs the client's API token, the board id and the column of every field. Until then nothing is sent anywhere. */
(function(){
  'use strict';
  var FIELDS = [
    {two: [{l: 'Name', n: 'name', t: 'text', ac: 'name', req: 1}, {l: 'Email', n: 'email', t: 'email', ac: 'email', req: 1}]},
    {two: [{l: 'Phone', n: 'phone', t: 'tel', ac: 'tel'}, {l: 'Primary Residence / Project Location', n: 'location', t: 'text', ac: 'off'}]},
    {l: 'Property Status', n: 'status', o: ['I own the property', 'Under contract', 'Considering a property', 'Searching']},
    {l: 'Project Type', n: 'type', o: ['Full-home renovation', 'Partial renovation', 'New residence', 'Furnishing a completed home', 'Wellness integration']},
    {l: 'CI Service of Interest', n: 'service', o: ['CI Turnkey', 'CI Core', 'CI Curated', 'CI Wellness (add-on)', 'Not sure yet']},
    {l: 'Target Timeline', n: 'timeline', o: ['As soon as possible', 'Within 3 months', '3–6 months', '6–12 months', 'Not sure yet']},
    {l: 'How Did You Hear About CI?', n: 'source', o: ['Referral', 'Broker / Real estate agent', 'Instagram', 'Google search', 'Press / Media', 'Other']},
    {l: 'Tell Us About Your Project', n: 'project', area: 1}
  ];
  var root = document.documentElement, box = null, last = null;
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function input(f){ var id = 'fm-' + f.n;
    return '<div class="fmf-r"><label for="' + id + '">' + esc(f.l) + '</label><input id="' + id + '" name="' + f.n + '" type="' + f.t + '" autocomplete="' + f.ac + '"' + (f.req ? ' required' : '') + '></div>'; }
  function row(f){
    if (f.two) return '<div class="fmf-2">' + f.two.map(input).join('') + '</div>';
    if (f.area) return '<div class="fmf-r"><label for="fm-' + f.n + '">' + esc(f.l) + '</label><textarea id="fm-' + f.n + '" name="' + f.n + '" rows="4"></textarea></div>';
    return '<div class="fmf-r" role="group" aria-label="' + esc(f.l) + '"><span class="fmf-n">' + esc(f.l) + '</span><div class="fmf-c">' +
      f.o.map(function(o){ return '<label><input type="radio" name="' + f.n + '" value="' + esc(o) + '">' + esc(o) + '</label>'; }).join('') + '</div></div>';
  }
  function build(){
    box = document.createElement('div'); box.className = 'fmo'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Project inquiry');
    box.innerHTML = '<div class="fmo-l"><div><p class="fmo-k">Begin Your Better Life</p><h2 class="t60">Tell Us About<br>Your Vision</h2>' +
      '<p class="t20">Whether you are reimagining a residence you own, considering a new property, furnishing a newly completed home, or exploring wellness and in-home longevity, your next chapter begins here</p>' +
      '<p class="t20">Share what you know today. We’ll guide you through the rest</p></div>' +
      '<div class="fmo-d"><span>215 W Huron Street<br>Suite 1<br>Chicago, IL 60654</span><span><a href="tel:+13122792776">312 279 2776</a><br>Chicago + South Florida</span></div></div>' +
      '<div class="fmo-r"><form class="fmf" novalidate>' + FIELDS.map(row).join('') +
      '<div class="fmf-s"><button class="r3btn" type="submit"><span class="t">Submit<br>Project Inquiry</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></button></div></form>' +
      '<div class="fmf-ok" aria-live="polite"><h2 class="t60">Thank You</h2><p class="t20">A member of our team will review your inquiry personally and be in touch with the right next step</p></div></div>' +
      '<button class="fmo-x" type="button" aria-label="Close"><i></i><i></i></button>';
    document.body.appendChild(box);
    box.querySelector('.fmo-x').addEventListener('click', close);
    var form = box.querySelector('form');
    form.addEventListener('change', function(e){ var t = e.target; if (t.type !== 'radio') return;
      [].forEach.call(form.querySelectorAll('input[name="' + t.name + '"]'), function(i){ i.parentNode.classList.toggle('on', i.checked); }); });
    form.addEventListener('input', function(e){ var r = e.target.closest('.fmf-r'); if (r) r.classList.remove('bad'); });
    form.addEventListener('submit', function(e){ e.preventDefault(); var bad = null, data = {};
      [].forEach.call(form.elements, function(el){ if (!el.name) return; var r = el.closest('.fmf-r');
        if (el.type === 'radio'){ if (el.checked) data[el.name] = el.value; return; }
        var v = el.value.trim(), ok = !el.required || !!v; if (ok && el.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        r.classList.toggle('bad', !ok); if (!ok && !bad) bad = el; if (v) data[el.name] = v; });
      if (bad){ bad.focus(); return; }
      send(data); box.classList.add('sent'); box.querySelector('.fmo-r').scrollTop = 0; });
  }
  function send(data){ /* the connection to monday.com goes here — see the note at the top */ }
  function open(e){
    if (e) e.preventDefault(); if (!box) build(); last = document.activeElement; root.classList.remove('mn-open');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ root.classList.add('fm-open'); box.querySelector('.fmo-x').focus(); }); });
  }
  function close(){ if (!root.classList.contains('fm-open')) return; root.classList.remove('fm-open'); if (last && last.focus) last.focus();
    if (box.classList.contains('sent')) setTimeout(function(){ box.classList.remove('sent'); var f = box.querySelector('form'); f.reset(); [].forEach.call(f.querySelectorAll('.on'), function(l){ l.classList.remove('on'); }); }, 700); }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href], [data-form]'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (!a.hasAttribute('data-form') && !/(^|\/)contact\.html$/.test(h)) return;
    if (a.closest('.ch-ftr, .mn')) return;
    open(e);
  }, true);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  window.addEventListener('wheel', function(e){ if (root.classList.contains('fm-open')) e.stopImmediatePropagation(); }, {capture: true, passive: true});
  window.__form = {open: open, close: close};
})();
