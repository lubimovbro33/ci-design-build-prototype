/* CI Design + Build — shared shell: preloader, header, menu, cursor, footer, reveal utilities.
   Exposes window.CI = {smoother, qs, qa, fine, reduce, onReady(fn)} for page scripts. */
(function(){
var d=document,W=window,qs=function(s,c){return(c||d).querySelector(s)},qa=function(s,c){return[].slice.call((c||d).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
var CI=W.CI={qs:qs,qa:qa,fine:fine,reduce:reduce,smoother:null,_r:[],onReady:function(f){CI._r.push(f)}};
if(!W.gsap||!W.ScrollTrigger){d.body.classList.remove('lock');var p0=qs('#pl');if(p0)p0.style.display='none';return}
gsap.registerPlugin(ScrollTrigger);if(W.ScrollSmoother)gsap.registerPlugin(ScrollSmoother);if(W.Flip)gsap.registerPlugin(Flip);
var params=new URLSearchParams(location.search);
var smoother=CI.smoother=(!reduce&&W.ScrollSmoother&&!params.has('nosmooth'))?ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:1.3,effects:true,smoothTouch:.1}):null;
var menu=qs('#menu'),top=qs('#top'),side=qs('#sidecta'),conc=qs('#conc');

/* preloader */
var pl=qs('#pl'),plN=qs('#plN'),plBar=qs('#plBar');
if(pl){for(var i=0;i<10;i++){var s=d.createElement('div');s.className='s';s.style.left=(i*10)+'%';s.style.width='10.2%';pl.insertBefore(s,pl.firstChild)}}
function intro(){d.body.classList.remove('lock');
  gsap.timeline().to('#pl .in',{opacity:0,y:-20,duration:.4,ease:'power2.in'})
    .to('#pl .s',{yPercent:-100,duration:1,ease:'power4.inOut',stagger:{each:.045,from:'center'}},'-=.1')
    .set(pl,{display:'none'}).add(function(){CI._r.forEach(function(f){f()});CI._r=[];CI.ready=true;ScrollTrigger.refresh()},'-=.7')
    .from('.top',{y:-20,opacity:0,duration:.8,ease:'power3.out'},'-=.6');
}
if(!pl||reduce||params.has('nopl')||sessionStorage.getItem('ci-pl')){if(pl)pl.style.display='none';d.body.classList.remove('lock');CI.ready=true;requestAnimationFrame(function(){CI._r.forEach(function(f){f()});CI._r=[]})}
else{try{sessionStorage.setItem('ci-pl','1')}catch(e){}var o={v:0};gsap.to(o,{v:100,duration:1.1,ease:'power2.inOut',onUpdate:function(){plN.textContent=String(Math.round(o.v)).padStart(3,'0');plBar.style.width=o.v+'%'},onComplete:intro})}

/* header / side CTA / concierge chip */
ScrollTrigger.create({start:0,end:'max',onUpdate:function(st){var y=st.scroll();top.classList.toggle('solid',y>60);if(side)side.classList.toggle('on',y>innerHeight*.9);if(conc)conc.classList.toggle('on',!CI._footOn&&y>innerHeight*.9)}});
if(conc){ScrollTrigger.create({trigger:'#foot',start:'top 85%',end:'bottom top',onToggle:function(s){CI._footOn=s.isActive;if(s.isActive)conc.classList.remove('on')}})}

/* cursor */
var cur=qs('#cur');
if(fine&&cur){var cx=-50,cy=-50;addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY});
  gsap.ticker.add(function(){cur.style.transform='translate('+cx+'px,'+cy+'px)'});
  d.addEventListener('mouseover',function(e){var el=e.target.closest('a,button,summary,[data-cur]');if(!el)return;var l=el.getAttribute('data-cur');if(l){cur.setAttribute('data-l',l);cur.classList.add('lab')}else cur.classList.add('big')});
  d.addEventListener('mouseout',function(e){if(e.target.closest('a,button,summary,[data-cur]'))cur.classList.remove('big','lab')});
}

/* menu (prototype behaviour) */
var burger=qs('#burger'),svcT=qs('#svcToggle'),svcL=qs('#svcList');
function setMenu(o){menu.classList.toggle('open',o);menu.setAttribute('aria-hidden',o?'false':'true');burger.setAttribute('aria-expanded',o?'true':'false');if(smoother)smoother.paused(o);if(o){gsap.fromTo('.menu .links a',{y:30,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',stagger:.04,delay:.3})}else{svcL.classList.remove('show');svcT.classList.remove('on')}}
burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
qs('#menuClose').addEventListener('click',function(){setMenu(false)});
svcT.addEventListener('click',function(e){e.preventDefault();var o=!svcL.classList.contains('show');svcL.classList.toggle('show',o);svcT.classList.toggle('on',o);svcT.setAttribute('aria-expanded',o?'true':'false')});
qa('.menu a').forEach(function(a){if(a!==svcT)a.addEventListener('click',function(){setMenu(false)})});
addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
CI.setMenu=setMenu;

/* generic reveals */
CI.onReady(function(){
  qa('.cap .l').forEach(function(l){gsap.from(l,{scaleX:0,transformOrigin:'left',duration:1.2,ease:'power3.out',scrollTrigger:{trigger:l,start:'top 95%'}})});
  qa('.rv').forEach(function(el,i){gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'power3.out',delay:(+el.getAttribute('data-d')||0),scrollTrigger:{trigger:el,start:'top 88%'}})});
  qa('[data-lines]').forEach(function(h){gsap.from(qa('.ln>span',h),{yPercent:110,stagger:.07,duration:1,ease:'power3.out',scrollTrigger:{trigger:h,start:'top 85%'}})});
  qa('[data-words]').forEach(function(p){var words=p.textContent.trim().split(/\s+/);p.innerHTML=words.map(function(w){return '<span class="wd">'+w+'</span>'}).join(' ');
    gsap.fromTo(qa('.wd',p),{opacity:.14},{opacity:1,stagger:.04,ease:'none',scrollTrigger:{trigger:p,start:'top 80%',end:'bottom 45%',scrub:true}})});
});

/* footer */
CI.onReady(function(){
  var fmq=qs('#fmq');if(fmq){var mx=0,vel=0,on=false;
    ScrollTrigger.create({trigger:'#foot',start:'top bottom',end:'bottom top',onToggle:function(s){on=s.isActive},onUpdate:function(s){vel=s.getVelocity()}});
    gsap.ticker.add(function(){if(!on)return;mx-=.6+Math.min(10,Math.abs(vel)/400);vel*=.9;var w=fmq.scrollWidth/2;if(-mx>w)mx+=w;fmq.style.transform='translate3d('+mx.toFixed(1)+'px,0,0)'})}
  function clocks(){qa('[data-tz]').forEach(function(el){try{el.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:el.getAttribute('data-tz')}).format(new Date())+' local time'}catch(e){}});
    var c=qs('#concT');if(c){try{c.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Chicago'}).format(new Date())}catch(e){}}}
  clocks();setInterval(clocks,20000);
  var wm=qs('#fwm');if(wm){var ls=qa('span',wm);
    gsap.from(ls,{yPercent:100,duration:1.2,stagger:.06,ease:'power4.out',scrollTrigger:{trigger:wm,start:'top 98%'}});
    if(fine){wm.addEventListener('mousemove',function(e){ls.forEach(function(l){var r=l.getBoundingClientRect(),dx=Math.abs(e.clientX-(r.left+r.width/2)),v=Math.max(0,1-dx/(r.width*1.1));l.classList.toggle('hot',v>.35);gsap.to(l,{yPercent:-v*9,duration:.5,ease:'power3.out',overwrite:'auto'})})});
      wm.addEventListener('mouseleave',function(){ls.forEach(function(l){l.classList.remove('hot');gsap.to(l,{yPercent:0,duration:.8,ease:'power3.out',overwrite:'auto'})})})}}
  gsap.from('#foot .where > span',{y:20,opacity:0,stagger:.08,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:'#foot .fgrid',start:'top 85%'}});
  gsap.from('#foot .cols > div',{y:16,opacity:0,stagger:.08,duration:1,ease:'power3.out',scrollTrigger:{trigger:'#foot .fgrid',start:'top 85%'}});
  var tt=qs('#toTop');if(tt)tt.addEventListener('click',function(e){e.preventDefault();if(smoother)smoother.scrollTo(0,true);else scrollTo({top:0,behavior:'smooth'})});
  if(conc)conc.addEventListener('click',function(e){var t=qs('#cta');if(!t)return;e.preventDefault();if(smoother)smoother.scrollTo(t,true,'top top');else t.scrollIntoView({behavior:'smooth'})});
  /* round CTA magnet */
  qa('.rcta').forEach(function(rc){if(!fine)return;rc.addEventListener('mousemove',function(e){var r=rc.getBoundingClientRect();gsap.to(rc,{x:(e.clientX-r.left-r.width/2)*.35,y:(e.clientY-r.top-r.height/2)*.35,duration:.4,ease:'power3.out'})});rc.addEventListener('mouseleave',function(){gsap.to(rc,{x:0,y:0,duration:1,ease:'elastic.out(1,.4)'})})});
  /* hash scroll */
  if(location.hash){var tg=qs(location.hash);if(tg)setTimeout(function(){if(smoother)smoother.scrollTo(tg,true,'top top');else tg.scrollIntoView()},400)}
});
addEventListener('load',function(){ScrollTrigger.refresh()});if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){ScrollTrigger.refresh()});
})();
