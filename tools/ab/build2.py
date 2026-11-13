D='/home/claude/ci-design-build-prototype/design/'
idx=open(D+'index.html',encoding='utf-8').read()
cover=open('/home/claude/ab/cover_svg.html').read()
cta=open('/home/claude/ab/cta_svg.html').read()
blk=idx[idx.index('<div class="cur"'):idx.index('</header>')+len('</header>')]
blk=blk.replace('<a href="#about"><i class="sq"></i><span class="t">About Us</span></a>','<a href="about.html" aria-current="page"><i class="sq"></i><span class="t">About Us</span></a>')
blk=blk.replace('href="#projects"','href="index.html#projects"').replace('href="#suite"','href="index.html#suite"').replace('href="#faq"','href="index.html#faq"').replace('href="#cta">Contact','href="#a-cta">Contact')
blk=blk.replace('<a href="#"><span class="t">About Us</span></a>','<a href="about.html" aria-current="page"><span class="t">About Us</span></a>')
blk=blk.replace('<a class="wm" href="#">','<a class="wm" href="index.html">').replace('<a class="cta-blk" href="#cta">','<a class="cta-blk" href="#a-cta">')
_f0=idx.index('<footer class="ch ch-ftr" id="footer">'); ftr=idx[_f0:idx.index('</footer>', _f0)+len('</footer>')]
ftr=ftr.replace('<a class="ft-logo" href="#">','<a class="ft-logo" href="index.html">').replace('<a href="#">About Us</a>','<a href="about.html">About Us</a>').replace('href="#faq"','href="index.html#faq"').replace('<a href="#">Contact</a>','<a href="#a-cta">Contact</a>')

def btn(label, cls='fill', extra=''):
    return f'<a class="blk {cls} a-blk{extra}" href="#a-cta"><span class="t">{label}</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></a>'

LOADS=['Architecture','Engineering','Design','Trades','Approvals','Materials','Schedules','Budgets','Procurement','Installation']
PAIRS=[('Lighting','Materials','Lighting shapes how materials are experienced.'),
       ('Millwork','Furniture','Millwork informs furniture scale.'),
       ('Technology','Architecture','Technology is woven into architecture.'),
       ('Wellness','Planning','Wellness is considered in planning.'),
       ('Art','Proportion','Art responds to proportion.'),
       ('Procurement','Schedule','Procurement drives the schedule.')]
LIFE=[('Routines','kitchen_w.jpg'),('Family','dining_w.jpg'),('Collections','shelf_w.jpg'),('Habits','bust_day.jpg'),('Entertaining style','living3_w.jpg'),('Need for privacy','bed_night_w.jpg'),('Relationship with wellness','sheers.jpg'),('Plans for the future','aerial.jpg')]
DISC=['Architecture','Interior Design','Construction','Project Management','Procurement','Furnishings','Art','Wellness','Installation','Move-In + Onboarding']
PRIN=[('Listen First','Your life is the starting point.'),
      ('Think as One','Design and construction, aligned from day one.'),
      ('Make It Personal','Bespoke means the home could only belong to the person it was created for.'),
      ('Design for Life','Beauty matters. So do comfort, wellness, functionality, longevity, and performance.'),
      ('Respect the Details','The smallest decisions often determine how exceptional the whole feels.'),
      ('Communicate Clearly','Context, transparency, and confidence at every step.'),
      ('Take Responsibility','Turnkey means we own the outcome. Completely.')]

loads=''.join(f'<span class="ld"><i class="sq"></i><span>{w}</span></span>' for w in LOADS)
pairs_w=''.join(f'<div class="pp" data-j="{j}"><span class="pa">{a}</span><span class="pb">{b}</span></div>' for j,(a,b,s) in enumerate(PAIRS))
pairs_s=''.join(f'<p class="a-say rs" data-j="{j}">{s}</p>' for j,(a,b,s) in enumerate(PAIRS))
life_w=''.join(f'<span class="sw" data-i="{i}">{w}.</span>' for i,(w,_) in enumerate(LIFE))
life_p=''.join(f'<img data-i="{i}" src="assets/img2/{f}" alt="" loading="lazy" decoding="async">' for i,(_,f) in enumerate(LIFE))
disc=''.join(f'<span class="dw">{w.replace(" ","\u00a0")}</span>' for w in DISC)
prin=''.join(f'<div class="pr" data-i="{i}"><span class="pn">{i+1:02d}</span><b class="pt">{n}</b><span class="pl">{l}</span></div>' for i,(n,l) in enumerate(PRIN))

html=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>About Us — CI Design + Build</title>
<meta name="robots" content="noindex">
<link rel="preload" href="assets/fonts/tg-ext-bold.woff" as="font" type="font/woff" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zalando+Sans+Expanded:wght@400;500;600&family=Zalando+Sans+SemiExpanded:wght@400;700&display=swap">
<link rel="stylesheet" href="css/site.css">
<link rel="stylesheet" href="css/chapters.css">
<link rel="stylesheet" href="css/type.css">
<link rel="stylesheet" href="css/polish.css">
<link rel="stylesheet" href="css/v10.css">
<link rel="stylesheet" href="css/about.css">
<script>(function(){{var d=document.documentElement,m=window.matchMedia,c=m&&m('(pointer: coarse)').matches;if(c||/[?&]lite/.test(location.search))d.classList.add('lite');}})();</script>
</head>
<body class="about ready">
{blk}

<main class="ab" id="ab">

<!-- ============================================================ 01 COVER · the title is built: construction lines → drawn letters → filled from the ground up -->
<section class="a-cover" id="a-top">
  <div class="cv-grid" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="cv-top">
    <p class="a-say cv-say m0"><span class="lbx">About Us</span>CI was built around one belief: an extraordinary home begins with an extraordinary understanding of the person living in it — their lifestyle, their wellness, their vision for how they want to live.</p>
    <div class="cv-side m0"><p class="a-p">We bring architecture, interior design, construction, furnishings, art, wellness, project management, and move-in together to create one integrated residential experience.</p></div>
  </div>
  <h1 class="cv-h1"><span class="sr">Building You a Better Life</span>
    <span class="cv-gd" aria-hidden="true"><i data-y="0"></i><i data-y="1"></i><i data-y="2"></i><i data-y="3"></i></span>
    {cover}
  </h1>
</section>

<!-- ============================================================ 02 OUR STORY · what was heard: the finish board, then three times "one" -->
<section class="a-sc a-story" id="a-story" style="--len:300">
  <div class="a-pin">
    <figure class="st-ph" id="stPh" aria-hidden="true"><img src="assets/pr/palette.webp" alt="" loading="lazy" decoding="async"></figure>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k="0 .05 .3 .34">Built by Listening<br>to Our Clients</h2>
      <p class="a-say m a-ab" data-k=".05 .12 .3 .34" style="--w:760">CI was built on what our clients needed most — and had never been given.</p>
      <div class="st-rows m a-at" data-k=".34 .35 .72 .76">
        <div class="st-r" data-k=".36 .42 2 2"><b class="a-xl" data-fx="ch">One team</b><span class="a-say">that communicates.</span></div>
        <div class="st-r" data-k=".44 .5 2 2"><b class="a-xl" data-fx="ch">One firm</b><span class="a-say">that takes responsibility.</span></div>
        <div class="st-r" data-k=".52 .58 2 2"><b class="a-xl" data-fx="ch">One integrated process</b><span class="a-say">that moves with intelligence from the first conversation to the finished home.</span></div>
      </div>
      <p class="a-p m a-ab a-q3" data-k=".6 .66 .72 .76" style="--w:620">We structured CI around the values we heard most clearly: exceptional quality, complete accountability, transparent communication, thoughtful client education, and a team capable of seeing — and delivering — the project as a whole.</p>
      <h3 class="a-h2 m a-at" data-k=".78 .86 2 2">Your time is your<br>most valuable asset.<br><span class="t2">Our CI process is<br>built to protect it.</span></h3>
      <p class="a-p m a-ab a-q3" data-k=".86 .93 2 2" style="--w:420">That principle has shaped CI from the beginning. It shapes every project today.</p>
    </div>
  </div>
</section>

<!-- ============================================================ 03 WHY CI + THE CI MODEL · loads on one beam; one support takes them; the level line then carries every conversation -->
<section class="a-sc a-load" id="a-why" style="--len:540">
  <div class="a-pin">
    <svg class="ld-svg" id="ldSvg" aria-hidden="true"><path class="beam" id="ldBeam"/><path class="col" id="ldCol"/><g id="ldTh"></g><path class="sup" id="ldSup"/></svg>
    <div class="ld-ws" id="ldWs" aria-hidden="true">{loads}</div>
    <div class="ld-ci" id="ldCi" aria-hidden="true"></div>
    <div class="pw" id="pw" aria-hidden="true">{pairs_w}</div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k="0 .04 .2 .23">Taking the Stress<br>Out of Renovation</h2>
      <p class="a-say m a-ab" data-k=".02 .07 .11 .13" style="--w:860">Creating your home should be one of the most rewarding experiences of your life. CI is built to make sure it is.</p>
      <p class="a-p m a-ab" data-k=".13 .17 .2 .23" style="--w:640">A significant residence involves countless moving parts — architecture, engineering, design, trades, approvals, materials, schedules, budgets, procurement, and installation — all interconnected, all requiring expert coordination.</p>
      <h3 class="a-h2 m a-at" data-k=".24 .3 .37 .4">CI exists to make<br>that feel effortless.</h3>
      <p class="a-p m a-ab" data-k=".29 .33 .37 .4" style="--w:620">One central team guides the entire journey — communicating what matters, anticipating what comes next, and managing every detail with the precision and care your home deserves.</p>
      <p class="a-say m a-at" data-k=".41 .45 .51 .53" style="--w:860">You bring the vision. You make the decisions that shape it.</p>
      <p class="a-say m a-ab ld-end" data-k=".45 .49 .51 .53" style="--w:780;--ind:0"><span class="t2">We handle everything required to bring it to life.</span></p>
      <p class="a-say m a-ab" data-k=".54 .58 .61 .63" style="--w:620">Every element of your home is in conversation with the next — done by one team.</p>
      <div class="rs-w a-ab">{pairs_s}</div>
      <h3 class="a-h2 m a-at" data-k=".88 .92 2 2">That connectivity<br>is what elevates<br>the outcome.</h3>
      <p class="a-say m a-ab" data-k=".87 .91 .94 .96" style="--w:700">At CI, the team responsible for designing these relationships is the same team responsible for executing them.</p>
      <p class="a-p m a-ab" data-k=".95 .99 2 2" style="--w:600">Every decision is made with the whole in view — informed by what came before it and intentional about what comes next. The result is a home where every detail belongs, because every detail was considered as part of one coordinated vision.</p>
    </div>
  </div>
</section>

<!-- ============================================================ 04 THE CI STANDARD · the drawing, the model in register under it, the finished room; then the room as a sheet with its title block -->
<section class="a-sc a-qual" id="a-standard" style="--len:360">
  <div class="a-pin">
    <div class="ql-f" id="qlF" aria-hidden="true">
      <img class="ql-clay" src="assets/proc/clay.webp" alt="" loading="lazy" decoding="async">
      <div class="ql-ph"><img src="assets/proc/day.webp" alt="" loading="lazy" decoding="async"></div>
      <svg class="ql-ln" id="qlLn" viewBox="0 0 1600 899" preserveAspectRatio="xMidYMid slice"></svg>
      <i class="ql-cut" id="qlCut"><i class="sq"></i></i>
    </div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k="0 .04 .26 .3">Quality Is<br>Our Signature</h2>
      <p class="a-say m a-ab" data-k=".04 .09 .14 .17" style="--w:780">At CI, luxury is precision: every detail considered, every element in harmony.</p>
      <p class="a-p m a-ab" data-k=".17 .21 .26 .3" style="--w:560">Quality is what closes precisely. What feels effortless. What you notice the moment you walk in, and what you never have to think about because it simply works.</p>
      <div class="ql-tb m a-ab" data-k=".74 .75 2 2">
        <p class="a-p ql-c0" data-k=".9 .96 2 2">Design, construction, service, and communication: we hold each to the same concierge-level standard, because each one shapes how you live in your home.</p>
        <p class="ql-c" data-k=".76 .82 2 2">It is the relationship between concept to completion.</p>
        <p class="ql-c" data-k=".8 .86 2 2">Between the drawing and the finished detail.</p>
        <p class="ql-c" data-k=".84 .9 2 2">Between what we promise and what we deliver.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================ 05 FOR YOU · "your …" rolls through a life until it becomes "yours." -->
<section class="a-sc a-life" id="a-you" style="--len:360">
  <div class="a-pin">
    <div class="lf-ph" id="lfPh" aria-hidden="true">{life_p}</div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k="0 .04 .12 .15">For the Life<br>You’re Building</h2>
      <p class="a-say m a-ab" data-k=".03 .08 .12 .15" style="--w:760">Our clients define our work. We study how you live + want to live before we decide how your home should look.</p>
      <div class="lf-sl" id="lfSl"><span class="lf-y">Your<span class="lf-s">s.</span></span><span class="lf-w" id="lfW">{life_w}</span></div>
      <p class="a-p m a-ab a-q3" data-k=".84 .9 2 2" style="--w:560">The most meaningful homes are an expression of the person living in them — designed around a specific life, a specific way of being, a specific vision for what home should feel like.</p>
    </div>
  </div>
</section>

<!-- ============================================================ 06 OUR TEAM · ten disciplines as one wall under one roof; from site to home -->
<section class="a-team" id="a-team">
  <div class="tm-head">
    <h2 class="a-h2 rv">One Vision. One Team.<br>Design Through<br>Construction.</h2>
    <p class="a-say rv" style="--w:720">Every CI project is shaped by an in-house team of specialists, all working toward one outcome: your home.</p>
  </div>
  <div class="tm-wall rv" id="tmWall" data-fx="ch">{disc}</div>
  <div class="tm-ph">
    <figure class="tm-a"><img src="assets/pr/site.webp" alt="The CI team on site" loading="lazy" decoding="async"></figure>
    <figure class="tm-b"><img src="assets/pr/after.webp" alt="The finished living room" loading="lazy" decoding="async"></figure>
    <div class="tm-t">
      <p class="a-p rv">Our strength is connection. Every discipline works side by side under one roof, so design intent, technical requirements, construction, selections, and finishing move forward as one.</p>
    </div>
  </div>
  <p class="a-say tm-end rv" style="--w:1000">That is the CI turnkey experience: one team, fully aligned, <span class="t2">from the first sketch to taking you through to move in.</span></p>
</section>

<!-- ============================================================ 07 THE CI EXPERIENCE + OUR PRINCIPLES · a seam that closes until it disappears; then what guides every project -->
<section class="a-sc a-exp" id="a-exp" style="--len:480">
  <div class="a-pin">
    <div class="sm" id="sm" aria-hidden="true">
      <div class="sm-l"><span class="sm-a">The Art of a</span><span class="sm-b">The Art of a</span></div>
      <div class="sm-l"><span class="sm-a">Seamless Experience</span><span class="sm-b">Seamless Experience</span></div>
    </div>
    <h2 class="sr">The Art of a Seamless Experience</h2>
    <div class="a-stage">
      <p class="a-say m a-at" data-k=".24 .28 .45 .48" style="--w:820">We take the work seriously, and we make the experience enjoyable.</p>
      <p class="a-p m a-ab" data-k=".27 .31 .45 .48" style="--w:520">Our role is to make a complex undertaking feel clear, collaborative, and effortless for you.</p>
      <p class="a-say m a-q2 xp-mid" data-k=".3 .36 .45 .48" style="--w:900;--ind:0">That means communicating openly. Explaining every decision. <span class="hl" id="xpHl">Respecting your time.</span> Owning the outcome. Bringing solutions to every challenge.</p>
      <div class="xp-20 m a-ab a-q3" data-k=".37 .4 .45 .48"><span class="v">20<sup>%</sup></span><p class="a-p">We save our clients an average of 20% of their project time.</p></div>
      <h3 class="a-h2 m a-at" data-k=".49 .53 .58 .61">This is CI<br><span class="t2">concierge-level service.</span></h3>
      <h3 class="a-h2 m a-at" data-k=".61 .65 2 2">What Guides<br>Every CI Project</h3>
      <div class="pr-b m" id="prB" data-box data-k=".63 .64 2 2">{prin}</div>
    </div>
  </div>
</section>

<!-- ============================================================ 08 CTA · the bookend: the next title is drawn, not yet built — it fills when you begin -->
<section class="a-sc a-cta" id="a-cta" style="--len:220">
  <div class="a-pin">
    <div class="cv-grid ct-grid" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="a-stage">
      <p class="a-say m a-at" data-k=".3 .4 2 2" style="--w:700">Your home holds the next version of your life. <span class="t2">Let’s design it with intention.</span></p>
      <div class="m a-at a-end ct-btn" data-box data-k=".4 .5 2 2">{btn('Begin<br>Your<br>Better Life','fill',' ct-go')}</div>
    </div>
    <h2 class="cv-h1 ct-h"><span class="sr">Building What’s Next</span>
      <span class="cv-gd" aria-hidden="true"><i data-y="0"></i><i data-y="1"></i><i data-y="2"></i><i data-y="3"></i></span>
      {cta}
    </h2>
  </div>
</section>

</main>

{ftr}

<div class="grain on" aria-hidden="true"></div>
<nav class="chap mono" id="chap" aria-label="Chapters">
  <a href="#a-top" data-ch="a-top"><span>01</span><span class="t">About</span><i></i></a>
  <a href="#a-story" data-ch="a-story"><span>02</span><span class="t">Story</span><i></i></a>
  <a href="#a-why" data-ch="a-why"><span>03</span><span class="t">Why CI</span><i></i></a>
  <a href="#a-standard" data-ch="a-standard"><span>04</span><span class="t">Quality</span><i></i></a>
  <a href="#a-you" data-ch="a-you"><span>05</span><span class="t">For You</span><i></i></a>
  <a href="#a-team" data-ch="a-team"><span>06</span><span class="t">Team</span><i></i></a>
  <a href="#a-exp" data-ch="a-exp"><span>07</span><span class="t">Service</span><i></i></a>
  <a href="#a-cta" data-ch="a-cta"><span>08</span><span class="t">Contact</span><i></i></a>
</nav>

<script src="js/v10.js"></script>
<script src="js/about.js"></script>
</body>
</html>
'''
open(D+'about.html','w',encoding='utf-8').write(html)
print(len(html))
