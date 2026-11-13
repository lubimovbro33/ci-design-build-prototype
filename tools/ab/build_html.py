import re
D='/home/claude/ci-design-build-prototype/design/'
idx=open(D+'index.html',encoding='utf-8').read()
cover=open('/home/claude/ab/cover_svg.html').read()
# reuse cursor + menu + header from the homepage, with page links
blk=idx[idx.index('<div class="cur"'):idx.index('</header>')+len('</header>')]
blk=blk.replace('<a href="#about"><i class="sq"></i><span class="t">About Us</span></a>','<a href="about.html" aria-current="page"><i class="sq"></i><span class="t">About Us</span></a>')
blk=blk.replace('href="#projects"','href="index.html#projects"').replace('href="#suite"','href="index.html#suite"').replace('href="#faq"','href="index.html#faq"').replace('href="#cta">Contact','href="#a-cta">Contact')
blk=blk.replace('<a href="#"><span class="t">About Us</span></a>','<a href="about.html" aria-current="page"><span class="t">About Us</span></a>')
blk=blk.replace('<a class="wm" href="#">','<a class="wm" href="index.html">')
blk=blk.replace('<a class="cta-blk" href="#cta">','<a class="cta-blk" href="#a-cta">')
ftr=idx[idx.index('<footer class="ch ch-ftr" id="footer">'):idx.index('</footer>')+len('</footer>')]
ftr=ftr.replace('<a class="ft-logo" href="#">','<a class="ft-logo" href="index.html">').replace('<a href="#">About Us</a>','<a href="about.html">About Us</a>').replace('href="#faq"','href="index.html#faq"').replace('<a href="#">Contact</a>','<a href="#a-cta">Contact</a>')

def btn(label, cls='fill'):
    return f'<a class="blk {cls} a-blk" href="#a-cta"><span class="t">{label}</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></a>'

LOADS=['Architecture','Engineering','Design','Trades','Approvals','Materials','Schedules','Budgets','Procurement','Installation']
PAIRS=[('Lighting','Materials','Lighting shapes how materials are experienced.'),
       ('Millwork','Furniture','Millwork informs furniture scale.'),
       ('Technology','Architecture','Technology is woven into architecture.'),
       ('Wellness','Planning','Wellness is considered in planning.'),
       ('Art','Proportion','Art responds to proportion.'),
       ('Procurement','Schedule','Procurement drives the schedule.')]
LIFE=[('Routines','kitchen_w.jpg'),('Family','dining_w.jpg'),('Collections','shelf_w.jpg'),('Habits','bust_day.jpg'),('Entertaining style','wine_w.jpg'),('Need for privacy','bed_night_w.jpg'),('Relationship with wellness','sheers.jpg'),('Plans for the future','aerial.jpg')]
DISC=['Architecture','Interior Design','Construction','Project Management','Procurement','Furnishings','Art','Wellness','Installation','Move-In + Onboarding']
TEAM=[('Michael Miller','Founder · <span class="ph">[Title]</span>'),('<span class="ph">[Name]</span>','<span class="ph">[Title]</span>'),('<span class="ph">[Name]</span>','<span class="ph">[Title]</span>'),('<span class="ph">[Name]</span>','<span class="ph">[Title]</span>')]
PRIN=[('Listen First','Your life is the starting point.'),
      ('Think as One','Design and construction, aligned from day one.'),
      ('Make It Personal','Bespoke means the home could only belong to the person it was created for.'),
      ('Design for Life','Beauty matters. So do comfort, wellness, functionality, longevity, and performance.'),
      ('Respect the Details','The smallest decisions often determine how exceptional the whole feels.'),
      ('Communicate Clearly','Context, transparency, and confidence at every step.'),
      ('Take Responsibility','Turnkey means we own the outcome. Completely.')]
EXP=['Communicating openly.','Explaining every decision.','Respecting your time.','Owning the outcome.','Bringing solutions to every challenge.']

loads=''.join(f'<span class="ld" style="--i:{i}"><i class="sq"></i><span>{w}</span></span>' for i,w in enumerate(LOADS))
ring=''
for j,(a,b,s) in enumerate(PAIRS):
    ring+=f'<span class="rw" data-k="{j}" style="--a:{j}">{a}</span>'
for j,(a,b,s) in enumerate(PAIRS):
    ring+=f'<span class="rw" data-k="{j+6}" style="--a:{j+6}">{b}</span>'
pairs=''.join(f'<p class="a-say rs" data-j="{j}">{s}</p>' for j,(a,b,s) in enumerate(PAIRS))
life_w=''.join(f'<span class="sw" data-i="{i}">{w}.</span>' for i,(w,_) in enumerate(LIFE))
life_p=''.join(f'<img class="lp" data-i="{i}" src="assets/img2/{f}" alt="" loading="lazy" decoding="async">' for i,(_,f) in enumerate(LIFE))
disc=''.join(f'<span class="dw">{w}</span><i class="sq"></i>' for w in DISC)
team=''.join(f'''<article class="tc" tabindex="0" data-cursor="Flip"><div class="tc-in">
<div class="tc-f"><span class="tc-ph">Portrait</span><div class="tc-nm"><b>{n}</b><span>{t}</span></div><i class="sq"></i></div>
<div class="tc-b"><b>{n}</b><p><span class="ph">[Two or three lines about this person, from the client.]</span></p><i class="sq"></i></div>
</div></article>''' for n,t in TEAM)
prin=''.join(f'<div class="pr" data-i="{i}"><i class="slab"></i><span class="pn">{i+1:02d}</span><b class="pt">{n}</b><span class="pl">{l}</span></div>' for i,(n,l) in reversed(list(enumerate(PRIN))))
exp=''.join(f'<li data-i="{i}"><span class="xn">{w}</span></li>' for i,w in enumerate(EXP))

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

<!-- ================================================================== 01 COVER · the title is built: construction lines, the letters drawn, then filled from the ground up -->
<section class="a-cover" id="a-top">
  <div class="cv-grid" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="cv-top">
    <p class="a-say cv-say m0"><span class="lbx">About Us</span>CI was built around one belief: an extraordinary home begins with an extraordinary understanding of the person living in it <span class="t2">— their lifestyle, their wellness, their vision for how they want to live.</span></p>
    <div class="cv-side m0">
      <p class="a-p">We bring architecture, interior design, construction, furnishings, art, wellness, project management, and move-in together to create one integrated residential experience.</p>
      {btn('Begin<br>Your<br>Better Life','line')}
    </div>
  </div>
  <h1 class="cv-h1"><span class="sr">Building You a Better Life</span>
    <span class="cv-gd" aria-hidden="true"><i data-y="0"></i><i data-y="1"></i><i data-y="2"></i><i data-y="3"></i></span>
    {cover}
  </h1>
</section>

<!-- ================================================================== 02 OUR STORY · listening: many voices, one clear line -->
<section class="a-sc a-story" id="a-story" style="--len:460">
  <div class="a-pin">
    <canvas class="st-cv" id="stCv" aria-hidden="true"></canvas>
    <div class="st-vals" id="stVals" aria-hidden="true"><span>Exceptional quality</span><span>Complete accountability</span><span>Transparent communication</span><span>Thoughtful client education</span><span>The project as a whole</span></div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".0 .06 .26 .32">Built by Listening<br>to Our Clients</h2>
      <p class="a-say m a-ab" data-k=".06 .14 .26 .32" style="--w:820">CI was built on what our clients needed most <span class="t2">— and had never been given.</span></p>
      <div class="st-ones m a-at" data-k=".32 .38 .56 .6">
        <p class="a-big"><span>One team</span> that communicates.</p>
        <p class="a-big"><span>One firm</span> that takes responsibility.</p>
        <p class="a-big"><span>One integrated process</span> that moves with intelligence from the first conversation to the finished home.</p>
      </div>
      <p class="a-p m a-ab" data-k=".6 .66 .78 .82" style="--w:620">We structured CI around the values we heard most clearly: exceptional quality, complete accountability, transparent communication, thoughtful client education, and a team capable of seeing — and delivering — the project as a whole.</p>
      <h3 class="a-h2 m a-at st-end" data-k=".82 .9 2 2">Your time is your<br>most valuable asset.<br><span class="t2">Our CI process is<br>built to protect it.</span></h3>
      <p class="a-p m a-ab a-q3" data-k=".88 .95 2 2" style="--w:420">That principle has shaped CI from the beginning. It shapes every project today.</p>
    </div>
  </div>
</section>

<!-- ================================================================== 03 WHY CI EXISTS · stress, in the engineer's sense: the loads, the sag, and the support that takes them -->
<section class="a-sc a-load" id="a-why" style="--len:480">
  <div class="a-pin">
    <svg class="ld-svg" id="ldSvg" aria-hidden="true"><path class="beam" id="ldBeam"/><path class="col" id="ldCol"/><g id="ldTh"></g><path class="sup" id="ldSup"/></svg>
    <div class="ld-ws" id="ldWs" aria-hidden="true">{loads}</div>
    <div class="ld-ci" id="ldCi" aria-hidden="true"></div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".0 .05 .36 .4">Taking the Stress<br>Out of Renovation</h2>
      <p class="a-say m a-ab" data-k=".03 .1 .2 .24" style="--w:900">Creating your home should be one of the most rewarding experiences of your life. <span class="t2">CI is built to make sure it is.</span></p>
      <p class="a-p m a-ab" data-k=".24 .3 .36 .4" style="--w:640">A significant residence involves countless moving parts — architecture, engineering, design, trades, approvals, materials, schedules, budgets, procurement, and installation — all interconnected, all requiring expert coordination.</p>
      <h3 class="a-h2 m a-at" data-k=".42 .5 .68 .72">CI exists to make<br>that feel effortless.</h3>
      <p class="a-p m a-ab" data-k=".56 .62 .68 .72" style="--w:640">One central team guides the entire journey — communicating what matters, anticipating what comes next, and managing every detail with the precision and care your home deserves.</p>
      <p class="a-say m a-at" data-k=".76 .84 2 2" style="--w:900">You bring the vision. You make the decisions that shape it.</p>
      <p class="a-say m a-ab a-q2" data-k=".84 .92 2 2" style="--w:900;--ind:0"><span class="t2">We handle everything required to bring it to life.</span></p>
    </div>
  </div>
</section>

<!-- ================================================================== 04 THE CI MODEL · a round table: every pair speaks through the same centre -->
<section class="a-sc a-model" id="a-model" style="--len:440">
  <div class="a-pin">
    <div class="rg" id="rg" aria-hidden="true">
      <svg class="rg-svg" id="rgSvg"><circle class="ring" id="rgRing"/><g id="rgCh"></g></svg>
      <i class="rg-c"></i>
      {ring}
    </div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".0 .05 .7 .74">One Team.<br>Complete<br>Responsibility.</h2>
      <p class="a-say m a-ab" data-k=".04 .1 .14 .17" style="--w:620">Every element of your home is in conversation with the next <span class="t2">— done by one team.</span></p>
      <div class="rs-w a-ab">{pairs}</div>
      <p class="a-say m a-ab" data-k=".74 .8 .86 .89" style="--w:640">At CI, the team responsible for designing these relationships <span class="t2">is the same team responsible for executing them.</span></p>
      <h3 class="a-h2 m a-at" data-k=".76 .82 2 2">That connectivity<br>is what elevates<br>the outcome.</h3>
      <p class="a-p m a-ab" data-k=".89 .95 2 2" style="--w:560">Every decision is made with the whole in view — informed by what came before it and intentional about what comes next. The result is a home where every detail belongs, because every detail was considered as part of one coordinated vision.</p>
    </div>
  </div>
</section>

<!-- ================================================================== 05 THE CI STANDARD · the drawing and the finished detail, in register -->
<section class="a-sc a-qual" id="a-standard" style="--len:480">
  <div class="a-pin">
    <div class="ql-f" id="qlF" aria-hidden="true">
      <img class="ql-clay" src="assets/proc/clay.webp" alt="" loading="lazy" decoding="async">
      <div class="ql-ph"><img src="assets/proc/day.webp" alt="" loading="lazy" decoding="async"></div>
      <svg class="ql-ln" id="qlLn" viewBox="0 0 1600 899" preserveAspectRatio="xMidYMid slice"></svg>
      <i class="ql-cut" id="qlCut"><i class="sq"></i></i>
    </div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".0 .05 .42 .48">Quality Is<br>Our Signature</h2>
      <p class="a-say m a-ab" data-k=".04 .1 .2 .24" style="--w:780">At CI, luxury is precision: <span class="t2">every detail considered, every element in harmony.</span></p>
      <p class="a-p m a-ab" data-k=".24 .3 .4 .46" style="--w:560">Quality is what closes precisely. What feels effortless. What you notice the moment you walk in, and what you never have to think about because it simply works.</p>
      <div class="ql-card m a-ab a-q3c" data-k=".5 .56 2 2">
        <p class="ql-l" data-k=".5 .56 2 2">It is the relationship between concept to completion.</p>
        <p class="ql-l" data-k=".62 .68 2 2">Between the drawing and the finished detail.</p>
        <p class="ql-l" data-k=".74 .8 2 2">Between what we promise and what we deliver.</p>
        <p class="ql-p" data-k=".86 .92 2 2">Design, construction, service, and communication: we hold each to the same concierge-level standard, because each one shapes how you live in your home.</p>
        <i class="sq"></i>
      </div>
    </div>
  </div>
</section>

<!-- ================================================================== 06 DESIGNED AROUND YOU · "your …" until it becomes "yours" -->
<section class="a-sc a-life" id="a-you" style="--len:520">
  <div class="a-pin">
    <div class="lf-ph" id="lfPh" aria-hidden="true">{life_p}</div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".0 .05 .14 .18">For the Life<br>You’re Building</h2>
      <p class="a-say m a-ab" data-k=".03 .09 .14 .18" style="--w:760">Our clients define our work. <span class="t2">We study how you live + want to live before we decide how your home should look.</span></p>
      <div class="lf-sl" id="lfSl"><span class="lf-y">Your<span class="lf-s">s.</span></span><span class="lf-w" id="lfW">{life_w}</span></div>
      <p class="a-p m a-ab a-q3" data-k=".8 .86 2 2" style="--w:560">The most meaningful homes are an expression of the person living in them — designed around a specific life, a specific way of being, a specific vision for what home should feel like.</p>
    </div>
  </div>
</section>

<!-- ================================================================== 07 OUR TEAM · ten disciplines on one line, under one roof -->
<section class="a-team" id="a-team">
  <div class="tm-head">
    <h2 class="a-h2 rv">One Vision. One Team.<br>Design Through<br>Construction.</h2>
    <p class="a-say rv" style="--w:760">Every CI project is shaped by an in-house team of specialists, <span class="t2">all working toward one outcome: your home.</span></p>
  </div>
  <div class="tm-roof" id="tmRoof" aria-label="Disciplines"><div class="tm-run" id="tmRun">{disc}{disc}</div></div>
  <div class="tm-mid">
    <p class="a-p rv" style="--w:560">Our strength is connection. Every discipline works side by side under one roof, so design intent, technical requirements, construction, selections, and finishing move forward as one.</p>
    <p class="a-say rv" style="--w:900">That is the CI turnkey experience: one team, fully aligned, <span class="t2">from the first sketch to taking you through to move in.</span></p>
  </div>
  <div class="tm-cards">{team}</div>
</section>

<!-- ================================================================== 08 THE CI EXPERIENCE · a seam that closes until it disappears -->
<section class="a-sc a-exp" id="a-exp" style="--len:420">
  <div class="a-pin">
    <div class="sm" id="sm" aria-hidden="true">
      <div class="sm-l"><span class="sm-a">The Art of a</span><span class="sm-b">The Art of a</span></div>
      <div class="sm-l"><span class="sm-a">Seamless Experience</span><span class="sm-b">Seamless Experience</span></div>
      <i class="sm-seam"></i>
    </div>
    <h2 class="sr">The Art of a Seamless Experience</h2>
    <div class="a-stage">
      <p class="a-say m a-ab" data-k=".3 .36 .46 .5" style="--w:820">We take the work seriously, <span class="t2">and we make the experience enjoyable.</span></p>
      <div class="xp m a-at" data-k=".5 .55 2 2">
        <p class="a-p xp-lead">Our role is to make a complex undertaking feel clear, collaborative, and effortless for you. That means:</p>
        <ol class="xp-l" id="xpL">{exp}</ol>
      </div>
      <div class="xp-20 m a-ab a-q3" data-k=".7 .74 .82 .85"><span class="v">20<sup>%</sup></span><p class="a-p">We save our clients an average of 20% of their project time.</p></div>
      <p class="a-say m a-ab a-q3 xp-end" data-k=".9 .96 2 2" style="--w:700;--ind:0">This is CI concierge-level service.</p>
    </div>
  </div>
</section>

<!-- ================================================================== 09 OUR PRINCIPLES · seven floors, built from the ground up -->
<section class="a-sc a-prin" id="a-principles" style="--len:420">
  <div class="a-pin">
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".0 .05 2 2">What Guides<br>Every CI Project</h2>
      <div class="pr-b" id="prB">{prin}</div>
    </div>
  </div>
</section>

<!-- ================================================================== 10 CTA · a door, opening onto what comes next -->
<section class="a-sc a-cta" id="a-cta" style="--len:260">
  <div class="a-pin">
    <div class="dr" id="dr" aria-hidden="true">
      <div class="dr-room"><img src="assets/night/int_night_poster.jpg" alt="" loading="lazy" decoding="async"></div>
      <div class="dr-leaf"><i class="sq"></i></div>
      <i class="dr-fr"></i>
    </div>
    <div class="a-stage">
      <h2 class="a-h2 m a-at" data-k=".02 .12 2 2">Building<br>What’s Next</h2>
      <p class="a-say m a-ab" data-k=".3 .4 2 2" style="--w:700">Your home holds the next version of your life. <span class="t2">Let’s design it with intention.</span></p>
      <div class="m a-ab a-end" data-k=".5 .6 2 2">{btn('Begin<br>Your<br>Better Life','fill')}</div>
    </div>
  </div>
</section>

</main>

{ftr}

<div class="grain on" aria-hidden="true"></div>
<nav class="chap mono" id="chap" aria-label="Chapters">
  <a href="#a-top" data-ch="a-top"><span>01</span><span class="t">About Us</span><i></i></a>
  <a href="#a-story" data-ch="a-story"><span>02</span><span class="t">Our Story</span><i></i></a>
  <a href="#a-why" data-ch="a-why"><span>03</span><span class="t">Why CI</span><i></i></a>
  <a href="#a-model" data-ch="a-model"><span>04</span><span class="t">The CI Model</span><i></i></a>
  <a href="#a-standard" data-ch="a-standard"><span>05</span><span class="t">Standard</span><i></i></a>
  <a href="#a-you" data-ch="a-you"><span>06</span><span class="t">Around You</span><i></i></a>
  <a href="#a-team" data-ch="a-team"><span>07</span><span class="t">Our Team</span><i></i></a>
  <a href="#a-exp" data-ch="a-exp"><span>08</span><span class="t">Experience</span><i></i></a>
  <a href="#a-principles" data-ch="a-principles"><span>09</span><span class="t">Principles</span><i></i></a>
  <a href="#a-cta" data-ch="a-cta"><span>10</span><span class="t">Contact</span><i></i></a>
</nav>

<script src="js/v10.js"></script>
<script src="js/about.js"></script>
</body>
</html>
'''
open(D+'about.html','w',encoding='utf-8').write(html)
print(len(html))
