/* CI · v10 — the menu. The square in the header opens it; the list is on the left, a photograph on the right follows the pointer. */
(function(){
  'use strict';
  var root = document.documentElement, mn = document.getElementById('mn'), btn = document.querySelector('.hdr .menu-sq');
  if (!mn || !btn) return;
  var links = [].slice.call(mn.querySelectorAll('.mn-nav a')), imgs = [].slice.call(mn.querySelectorAll('.mn-ph img')), cur = 0, loaded = false;
  function show(i){ if (i === cur || !imgs[i]) return; imgs[cur].classList.remove('on'); cur = i; imgs[i].classList.add('on'); }
  function open(){
    if (!loaded){ loaded = true; imgs.forEach(function(im){ im.src = im.getAttribute('data-src'); }); }   /* the photographs load on the first opening */
    root.classList.add('mn-open'); mn.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
  }
  function close(){ root.classList.remove('mn-open'); mn.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Menu'); }
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', function(){ if (root.classList.contains('mn-open')) close(); else open(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  links.forEach(function(a, i){ a.style.setProperty('--i', i);
    a.addEventListener('mouseenter', function(){ show(i); }); a.addEventListener('focus', function(){ show(i); }); });
  /* a link that leads somewhere on this page closes the menu; the pages that are not built yet (href="#") leave it open */
  [].forEach.call(mn.querySelectorAll('a[href^="#"]'), function(a){ a.addEventListener('click', function(){ if (a.getAttribute('href').length > 1) close(); }); });
})();
