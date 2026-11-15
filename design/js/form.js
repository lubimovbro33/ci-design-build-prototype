/* CI · the inquiry form as a pop-up. Every button that leads to Contact opens it (the footer's and the menu's "Contact" still lead to the page).
   The form itself is the client's own monday.com form, taken from their current site; it loads on the first opening. */
(function(){
  'use strict';
  var FORM = 'https://forms.monday.com/forms/embed/5e0e0f2b05735ded06ce747e3bae0dae?r=use1';
  var root = document.documentElement, box = null, last = null;
  function build(){
    box = document.createElement('div'); box.className = 'fmo'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Project inquiry');
    box.innerHTML = '<div class="fmo-l"><div><p class="fmo-k">Contact</p><h2 class="t60">Tell Us About<br>Your Vision</h2>' +
      '<p class="t20">Share what you know today. We’ll guide you through the rest</p><p class="t20">A member of our team will review your inquiry personally and be in touch with the right next step</p></div>' +
      '<div class="fmo-d"><span>215 W Huron Street<br>Suite 1<br>Chicago, IL 60654</span><span><a href="tel:+13122792776">312 279 2776</a><br>Chicago + South Florida</span></div></div>' +
      '<div class="fmo-r"><iframe title="Project inquiry form" src="' + FORM + '"></iframe></div>' +
      '<button class="fmo-x" type="button" aria-label="Close"><i></i><i></i></button>';
    document.body.appendChild(box);
    box.querySelector('.fmo-x').addEventListener('click', close);
  }
  function open(e){
    if (e) e.preventDefault(); if (!box) build(); last = document.activeElement; root.classList.remove('mn-open');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ root.classList.add('fm-open'); box.querySelector('.fmo-x').focus(); }); });
  }
  function close(){ if (!root.classList.contains('fm-open')) return; root.classList.remove('fm-open'); if (last && last.focus) last.focus(); }
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
