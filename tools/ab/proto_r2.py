import re, sys
P='/home/claude/proto-r2/index.html'
s=open(P,encoding='utf-8').read()
IDS=['home','about','wellness','services','turnkey','core','curated','portfolio','project','brokers','partnerships','news','article','contact']
log=[]
def page_bounds(pid):
    a=s.index(f'id="p-{pid}"'); a=s.rfind('<',0,a)
    nx=[s.find(f'id="p-{q}"',a+20) for q in IDS]; nx=[n for n in nx if n>a+20]
    b=s.rfind('<',0,min(nx)) if nx else s.index('</main>')
    return a,b
def sec_bounds(pg, tag):
    i=pg.index(f'<span class="tag">{tag}</span>'); a=pg.rfind('<section',0,i); b=pg.index('</section>',i)+len('</section>'); return a,b
def edit(pid, tag, pairs):
    global s
    a,b=page_bounds(pid); pg=s[a:b]
    sa,sb=sec_bounds(pg,tag); sc=pg[sa:sb]
    for pat,rep in pairs:
        sc2,n=re.subn(pat, lambda m: rep, sc, count=1, flags=re.S)
        if n!=1: print('MISS', pid, tag, pat[:70]); sys.exit(1)
        sc=sc2
    pg=pg[:sa]+sc+pg[sb:]; s=s[:a]+pg+s[b:]; log.append(f'{pid} / {tag}')
def E(x): return re.escape(x)
BODY7=r'(?<=<div style="grid-column:7/13" class="body m">).*?(?=</div>)'

# ---------------- ABOUT (client's second round: "BEGIN HERE FOR NEW EDITS")
edit('about','05 · The CI Standard',[
 (E('<h2>Quality as the Signature Point</h2><p class="lead">Luxury is often described through materials.<br>We see it differently.</p>'),
  '<h2>Quality Is Our Signature</h2><p class="lead">At CI, luxury is precision: every detail considered, every element in harmony.</p>'),
 (BODY7,'\n<p>Quality is what closes precisely. What feels effortless. What you notice the moment you walk in, and what you never have to think about because it simply works.</p>\n<p>It is the relationship between concept to completion.<br>Between the drawing and the finished detail.<br>Between what we promise and what we deliver.</p>\n<p>Design, construction, service, and communication: we hold each to the same concierge-level standard, because each one shapes how you live in your home.</p>\n')])
edit('about','07 · Our Team',[
 (E('<h2>One Vision From Design Through Construction</h2><p class="lead">A CI project is shaped by many areas of expertise working toward one outcome.</p>'),
  '<h2>One Vision. One Team. Design Through Construction.</h2><p class="lead">Every CI project is shaped by an in-house team of specialists, all working toward one outcome: your home.</p>'),
 (E('Architecture · Interior design · Construction · Project management · Procurement · Furnishings · Art · Wellness · Installation · Move in + Onboarding'),
  'Architecture · Interior Design · Construction · Project Management · Procurement · Furnishings · Art · Wellness · Installation · Move-In + Onboarding'),
 (r'(?<=<div class="body m">)\s*<p>The value is not simply.*?(?=</div>)',
  '\n<p>Our strength is connection. Every discipline works side by side under one roof, so design intent, technical requirements, construction, selections, and finishing move forward as one.</p>\n<p><strong>That is the CI turnkey experience: one team, fully aligned, from the first sketch to taking you through to move in.</strong></p>\n')])
edit('about','08 · The CI Experience',[
 (E('<h2>High-End Service Without the Attitude</h2><p class="lead">We take the work seriously.<br>We do not believe the process needs to feel intimidating.</p>'),
  '<h2>The Art of a Seamless Experience</h2><p class="lead">We take the work seriously, and we make the experience enjoyable.</p>'),
 (r'(?<=<div style="grid-column:8/13" class="body m">).*?(?=</div>)',
  '\n<p>Our role is to make a complex undertaking feel clear, collaborative, and effortless for you.</p>\n<p>That means communicating openly. Explaining every decision. Respecting your time. Owning the outcome. Bringing solutions to every challenge.</p>\n<p>We save our clients an average of 20% of their project time.</p>\n<p><strong>This is CI concierge-level service.</strong></p>\n')])
edit('about','09 · Our Principles',[
 (E("<p>The client's life is the starting point.</p>"),'<p>Your life is the starting point.</p>'),
 (E('<p>Design and construction perform better when they communicate from the beginning.</p>'),'<p>Design and construction, aligned from day one.</p>'),
 (E('<p>Clients deserve context, transparency, and confidence throughout the process.</p>'),'<p>Context, transparency, and confidence at every step.</p>'),
 (E('<p>A turnkey experience only works when someone owns the outcome.</p>'),'<p>Turnkey means we own the outcome. Completely.</p>')])

# ---------------- SOLUTIONS
edit('services','01 · Hero',[
 (r'<p class="eyebrow">CI Ways of Work</p><h1>Choose the Level of Support That Fits Your Project</h1>','<p class="eyebrow">CI Solutions</p><h1>The CI Solution That Fits Your Life</h1>'),
 (r'(?<=<div class="body small">)<p>Every project requires.*?(?=</div>)','<p>Every client, every residence, and every vision is different.</p><p>CI offers three ways to work together, led by CI Turnkey, our complete concierge-level experience. Each carries the same standard of quality.</p>')])
edit('services','02 · CI Turnkey',[
 (r'<p class="body m">CI Turnkey is the most complete.*?</p>','<div class="body m"><p>The complete CI experience, and the fullest expression of how we work.</p><p>Architecture. Interior Design. Construction. Project Management. Procurement. Furnishings. Art. Wellness. Installation. Move-In + Onboarding.</p><p>One team, one roof, every detail covered. We move you in, teach you your home, and hand you the keys to the life waiting on the other side. That is concierge-level service, start to finish.</p></div>')])
edit('services','03 · CI Core',[
 (r'<p class="body m">CI Core brings.*?</p>','<div class="body m"><p>A core transformation of your residence: architecture + design, and construction + project management.</p><p>Expert guidance, comprehensive oversight, and tailored attention from start to finish.</p></div>')])
edit('services','04 · CI Curated',[
 (r'<p class="body m">CI Curated expands.*?</p>','<div class="body m"><p>Interior design featuring furnishings, finishes, art, and styling.</p><p>From bespoke pieces to thoughtful details, every element is tailored to reflect your lifestyle. A highly personalized layer of design.</p></div>')])
edit('services','05 · CI Wellness',[
 (E('<p class="eyebrow idx"><b>04 / 04</b> Add-on · pairs with any solution</p>'),'<p class="eyebrow idx"><b>04 / 04</b> Signature Enhancement · Elevates any CI solution</p>'),
 (E('<h2>CI Wellness + In Home Longevity</h2>'),'<h2>CI Wellness + In-Home Longevity</h2>'),
 (r'<p class="body m">An integrated wellness approach.*?</p>','<div class="body m"><p>A science-based approach to living younger, longer.</p><p>Light, air, water, sleep, recovery, materials, and technology, integrated into your architecture and interiors from day one and tailored to how you want to feel every day.</p></div>')])

# ---------------- PORTFOLIO
edit('portfolio','01 · Hero',[
 (E('<h1>Homes Shaped by the People Who Live in Them</h1>'),'<h1>Homes as Unique as the People Who Live in Them</h1>'),
 (r'<p class="lead" style="font-size:1.1rem">A CI project begins with a client—not a signature style.</p><p class="body small">.*?</p>',
  '<p class="lead" style="font-size:1.1rem">Every CI home begins with you: your routines, your collections, your ambitions, your way of living.</p><p class="body small">Explore residences brought to life through one integrated team, each a true reflection of the people who call it home.</p>')])
edit('portfolio','02 · Featured Projects',[(E('<h2>Signature CI Projects</h2>'),'<h2>Signature CI Residences</h2>')])
edit('portfolio','03 · Our Approach Behind Every Project',[
 (r'<h2>Different Homes. One Standard of Thinking.</h2><div class="body m">.*?</div>','<h2>Every Home Unique. One CI Standard.</h2><div class="body m"><p>Every residence speaks its own architectural language, because every client lives differently.</p><p>What unites them is the CI process.</p></div>'),
 (E('<h4>Understand deeply.</h4>'),'<h4>Discover deeply.</h4>'),(E('<h4>Design intentionally.</h4>'),'<h4>Define clearly.</h4>'),
 (E('<h4>Coordinate early.</h4>'),'<h4>Design intentionally.</h4>'),(E('<h4>Finish completely.</h4>'),'<h4>Deliver completely.</h4>'),
 (E('<p class="lead">The result should never feel imposed.<br>It should feel inevitable.</p>'),'<p class="lead">The result feels effortless, as if your home could only ever have been yours.</p>')])
edit('portfolio','05 · Final CTA',[
 (E('<p>Your project should not begin with copying an image.</p><p>It should begin with a conversation about your life.</p>'),'<p>Inspiration is where it starts. Your life is what shapes it.</p><p>Every CI home begins with a conversation about you: how you live, and how you want to live next.</p>')])

# ---------------- CONTACT
edit('contact','01 · Hero',[
 (E("<h1>Let's Talk About What's Next</h1>"),"<h1>Let's Begin Your Next Chapter</h1>"),
 (r'<p class="lead" style="font-size:1.1rem">Every CI project begins with a conversation.</p><div class="body small">.*?</div>',
  '<p class="lead" style="font-size:1.1rem">Every CI home begins with a conversation.</p><div class="body small"><p>Tell us about your residence, your vision, and how you want life at home to feel. From there, our team will guide you through every step, with concierge-level care from day one.</p></div>'),
 (r'data-scroll="inquiry">Tell Us About Your Project','data-scroll="inquiry">Bring Your Vision to Life')])
edit('contact','02 · Start Your Project + 03 · Contact Information',[
 (r'>Tell Us About Your Project</h2>','>Tell Us About Your Vision</h2>'),
 (r'(?<=<div class="body m">)<p>Whether you are renovating.*?(?=</div>)','<p>Whether you are reimagining a residence you own, considering a new property, furnishing a newly completed home, or exploring wellness and in-home longevity, your next chapter begins here.</p><p>Share what you know today. We’ll guide you through the rest.</p><p>A member of our team will review your inquiry personally and be in touch with the right next step.</p>'),
 (r'<div class="f"><label for="f-scope">Estimated Project Scope</label>.*?</select></div>\s*','')])
edit('contact','04 · What Happens Next?',[
 (E('<h2>A Clear Start to a Complex Project</h2>'),'<h2>A Seamless Start, Guided by CI</h2>'),
 (r'<h4>We Review Your Inquiry</h4><p>.*?</p>','<h4>We Review</h4><p>Our team personally reviews your inquiry to understand your residence, scope, timing, and vision.</p>'),
 (r"<h4>We Connect</h4><p>.*?</p>",'<h4>We Connect</h4><p>We schedule an introductory conversation within 48 hours.</p>'),
 (r'<h4>We Listen</h4><p>.*?</p>','<h4>We Listen</h4><p>We discuss your lifestyle, priorities, property, and how you want to live in your home.</p>'),
 (r'<h4>We Define the Right Path</h4><p>.*?</p>','<h4>We Define Your Path</h4><p>Together, we identify the right CI solution and outline your next steps.</p>'),
 (r'<p class="lead mt1" style="max-width:60ch">You do not need to know.*?</p>','<p class="lead mt1" style="max-width:60ch">Turnkey, Core, or Curated: finding your fit is part of the CI experience.</p>')])

edit('contact','05 · Final Statement',[
 (E('<h2 class="display">A Better Home Starts With a Better Process</h2>'),'<h2 class="display">A Better Life Starts With a Better Home.</h2>'),
 (E('data-scroll="inquiry">Bring Your Vision to Life</a>'),'data-scroll="inquiry">Begin Your Better Life</a>')])

# ---------------- BROKER PROGRAM
edit('brokers','01 · Hero',[
 (E('<h1>Help Your Client See What a Property Could Become</h1>'),'<h1>Help Your Clients See What a Property Could Become</h1>'),
 (E('<p class="lead">The right property is not always the finished property.</p>'),'<p class="lead">Every property holds potential. CI helps your clients see it.</p>'),
 (r'(?<=<div class="body small">).*?(?=</div>)','<p>We partner with luxury real estate professionals to reveal a residence’s full potential, guide clients from acquisition through transformation, and connect them with one integrated turnkey team the moment they are ready.</p><p>For you, a trusted partner who elevates every listing and every deal.<br>For your clients, a seamless, concierge-level path from purchase to move-in.</p>')])
edit('brokers','02 · Why Brokers Partner With CI',[
 (E('<h2>Because Renovation Questions Can Become Real-Estate Questions</h2>'),'<h2>Turn Hesitation Into Vision</h2>'),
 (BODY7,'<p>A buyer may love the building but question the layout. Love the location but not the interiors. See the potential but wonder what it would take.</p><p>CI gives you a design-build perspective at the moment it matters most, helping clients see beyond what exists today to what their home could become.</p><p>You introduce more than a contractor. You introduce one turnkey team handling architecture, design, construction, furnishings, and move-in: the complete path from property to home.</p>')])
edit('brokers','03 · From Property to Finished Home',[
 (E('<h2>A More Connected Client Journey</h2>'),'<h2>One Seamless Client Journey</h2>'),
 (r'<h4>Property</h4><p>.*?</p>','<h4>Property</h4><p>You identify the right opportunity.</p>'),
 (r'<h4>Possibility</h4><p>.*?</p>','<h4>Possibility</h4><p>CI reveals the residence’s potential, shaped around your client’s lifestyle and priorities.</p>'),
 (r'<h4>Acquisition</h4><p>.*?</p>','<h4>Acquisition</h4><p>Your client moves forward with clarity and a vision for what the home will become.</p>'),
 (r'<h4>Design \+ Build</h4><p>.*?</p>','<h4>Design + Build</h4><p>One integrated CI team takes the transformation from concept through completion.</p>'),
 (r'<h4>Completion</h4><p>.*?</p>','<h4>Move-In</h4><p>With CI Turnkey, furnishings, art, wellness, installation, and onboarding are all delivered. Your client walks into a finished home.</p>')])
edit('brokers','04 · How CI Helps You Close More Deals',[
 (r'<h4>Renovation Perspective</h4><p>.*?</p>','<h4>Renovation Perspective</h4><p>Show buyers the full potential of every residence.</p>'),
 (r'<h4>A Trusted Next Step</h4><p>.*?</p>','<h4>A Trusted Next Step</h4><p>Hand clients directly to one established turnkey team from the moment they acquire.</p>'),
 (r'<h4>Fewer Unanswered Questions</h4><p>.*?</p>','<h4>Confidence at Every Decision</h4><p>Expert answers on layout, construction, and personalization, turning hesitation into commitment.</p>'),
 (r'<h4>Concierge-Level Continuity</h4><p>.*?</p>','<h4>Concierge-Level Continuity</h4><p>Extend your client experience well beyond the closing table.</p>'),
 (r'<h4>A Partner Who Protects the Relationship</h4><p>.*?</p>','<h4>A Partner Who Honors the Relationship</h4><p>The client relationship begins with you. CI is here to strengthen it.</p>')])
edit('brokers','05 · What Your Clients Receive',[
 (r'<h2>One Team After the Keys</h2><p class="k">Depending on their needs, clients can access:</p>','<h2>One Team, From Keys to Move-In</h2>'),
 (E('Architecture · Interior design · Construction · Project management · Furnishings · Art advisory · Wellness integration · Procurement · Installation · Turnkey completion'),
  'Architecture · Interior Design · Construction · Project Management · Procurement · Furnishings · Art Advisory · Wellness + In-Home Longevity · Installation · Move-In + Onboarding'),
 (r'(?<=<div class="body m">)<p>They do not have to begin.*?(?=</div>)','<p>Your clients begin their new chapter with one integrated team already in place: one point of contact, one seamless process, and concierge-level service from the first walkthrough to the first night home.</p><p><strong>Their path is already clear.</strong></p>')])
edit('brokers','06 · Why This Strengthens Your Business',[
 (BODY7,'<p>Luxury real estate is built on relationships that last well beyond closing.</p><p>When your client asks, “Who can help us transform this?” you’ll already have the answer.</p><p>A CI partnership gives you another way to create value, build trust, and stay connected through one of the most important chapters in your client’s life.</p><p><strong>A relationship built for the long term.</strong></p>')])
edit('brokers','07 · Final CTA',[
 (r'<p class="body small">If your clients are considering.*?</p>','<p class="body small">When your client finds a property with potential, bring CI into the conversation. Together, we’ll turn it into the home they’ve envisioned.</p>')])

# ---------------- PARTNERSHIPS
edit('partnerships','01 · Hero',[
 (E('<p class="lead">The most exceptional homes are rarely shaped by one perspective alone.</p>'),'<p class="lead">Exceptional homes are shaped by exceptional collaboration.</p>'),
 (r'(?<=<div class="body small">).*?(?=</div>)','<p>CI partners with leaders across real estate, wellness, lifestyle, technology, design, and luxury residential products. We bring world-class expertise into every project while serving as your single point of coordination.</p>')])
edit('partnerships','02 · Why This Partnership Model Matters',[
 (r'<h2>Specialized Expertise Without a Fragmented Experience</h2><p class="lead">.*?</p>','<h2>World-Class Expertise. One Seamless Experience.</h2><p class="lead">Our integrated model means knowing exactly when to bring the right expertise into the room, and how to orchestrate it.</p>'),
 (BODY7,'<p>CI partnerships extend what we offer our clients while preserving what matters most: continuity, accountability, and one clear team guiding the whole.</p><p>We partner with people and companies who share our standards for quality, innovation, service, and thoughtful execution.</p><p><strong>Together, we build a trusted ecosystem around every client.</strong></p>')])
edit('partnerships','03 · What This Means for Our Clients',[
 (E('<p class="lead">Our partnerships can give clients:</p>'),''),
 (r'(?<=<div class="index">).*?(?=</div>\s*<p class="body m">)','\n<div class="row"><span class="n">01</span><h4>Exclusive access to trusted specialists and industry leaders</h4></div>\n<div class="row"><span class="n">02</span><h4>Expertise that extends beyond traditional design-build</h4></div>\n<div class="row"><span class="n">03</span><h4>Informed product, technology, and wellness decisions</h4></div>\n<div class="row"><span class="n">04</span><h4>Seamless communication and continuity across your project</h4></div>\n<div class="row"><span class="n">05</span><h4>Innovative solutions tailored to your home</h4></div>\n<div class="row"><span class="n">06</span><h4>One CI team orchestrating every relationship</h4></div>\n'),
 (r'<p class="body m">You gain specialized expertise.*?</p>','<p class="body m"><strong>You gain world-class expertise. We manage every detail.</strong></p>')])
edit('partnerships','04 · How We Work Together',[
 (E('<p class="lead">Every collaboration is different.</p>'),'<p class="lead">Every collaboration is unique.</p>'),
 (BODY7,'<p>A broker introduces CI before a client purchases. A wellness expert shapes how a client wants to live. A technology partner brings a sophisticated lighting environment to life. A specialized vendor provides essentials for sleep, water, workspace and comfort.</p><p>CI integrates that expertise into the architecture, interiors, construction, and client experience.</p><p><strong>Our partners bring depth. CI orchestrates the whole.</strong></p>')])
edit('partnerships','05 · Partnerships in Practice — Broker Partnerships',[
 (BODY7,'<p>Luxury real estate and residential design go hand in hand. The right vision can define the purchase itself.</p><p>CI partners with leading luxury real estate professionals before, during, and after acquisition. We help clients see beyond a residence’s current condition to everything it could become.</p><p>After closing, your client transitions seamlessly into one established turnkey team for architecture, design, construction, furnishings, and move-in.</p><p><strong>For brokers, an extension of the concierge-level experience you already provide.<br>For clients, one connected journey from the right property to the right home.</strong></p>'),
 (r'(?<=<h3>Carrie McCormick</h3><div class="body m small">).*?(?=</div>)','<p>CI’s partnership with Carrie McCormick is built on a shared belief: exceptional client service extends well beyond the transaction.</p><p>When a residence offers the right location, architecture, or potential, CI helps transform it into a true reflection of the buyer. Together, we give clients the confidence to move from acquisition to a home that’s entirely their own.</p>'),
 (r"(?<=<h3>Jameson Sotheby's International Realty</h3><div class=\"body m small\">).*?(?=</div>)",'<p>CI’s partnership with Jameson Sotheby’s International Realty unites two disciplines devoted to life’s most significant residential decisions.</p><p>Luxury buyers are investing in more than a property. They’re investing in what it can become.</p><p>By pairing world-class real estate expertise with CI’s architecture, interior design, construction, and turnkey capabilities, clients gain one seamless path from purchase to move-in, with their team already in place.</p>')])
edit('partnerships','06 · Strategic + Lifestyle Partners',[
 (BODY7,'<p>CI’s work reaches far beyond the residence itself.</p><p>Our strategic partners include leaders in wellness, culture, performance, and lifestyle, each shaping the future of luxury living.</p><p>Together, we bring fresh perspective to every project and stay ahead of how our clients want to live next.</p>'),
 (r'(?<=<h3>BIÂN</h3><div class="body m small">).*?(?=</div>)','<p>Our partnership with BIÂN is built on a shared belief in the power of environment, wellness, and community to elevate quality of life.</p><p>Together, we explore what it truly means to live well, and how the spaces we inhabit can support it every day.</p>'),
 (r'(?<=<h3>Dr. Alka</h3><div class="body m small">).*?(?=</div>)','<p>Through our partnership with Dr. Alka, CI brings a doctor-backed wellness perspective directly into the design of your home.</p><p>Her insight deepens our understanding of your personal health and longevity priorities. CI translates them into architecture, design, lighting, technology, and construction decisions.</p><p><strong>Wellness, made personal, informed, and intentional.</strong></p>'),
 (r'(?<=<h3>Lamborghini</h3><div class="body m small">).*?(?=</div>)','<p>Our partnership with Lamborghini reflects a shared devotion to design, performance, innovation, and precision.</p><p>For CI, these disciplines are inseparable. Exceptional results come from uniting performance and beauty, and from obsessing over every detail until both feel effortless.</p>')])
edit('partnerships','07 · Preferred Vendors + Technology Partners',[
 (E('<h2>Products Are Only as Good as the Way They Are Integrated</h2>'),'<h2>Exceptional Products, Seamlessly Integrated</h2>'),
 (BODY7,'<p>CI partners with premium manufacturers, specialists, and technology leaders chosen for their quality, innovation, reliability, and service.</p><p>We go beyond specification. Every product is integrated into the architecture, infrastructure, controls, and daily experience of your home.</p>'),
 (r'(?<=<h3>Hydrology</h3><div class="body m small">).*?(?=</div>)','<p>Hydrology elevates CI’s approach to bath and water environments. From fixture selection to fully realized bathing experiences, water becomes an essential part of comfort, ritual, and wellness at home.</p>'),
 (r'(?<=<h3>The Luxury Bed Collection</h3><div class="body m small">).*?(?=</div>)','<p>Sleep is one of the most personal experiences your home supports. With The Luxury Bed Collection, CI designs the bedroom around rest itself. The bed, lighting, acoustics, shading, temperature, and materials work together as one restorative environment.</p>'),
 (r'(?<=<h3>Lutron</h3><div class="body m small">).*?(?=</div>)','<p>Light shapes how you experience your home throughout the day. With Lutron, CI integrates sophisticated lighting control and automated shading that feel intuitive and discreet.</p><p><strong>The technology recedes. The experience of home comes forward.</strong></p>')])
edit('partnerships','08 · Shared Vision',[
 (E('<p class="lead">The best collaborations are built around shared standards.</p>'),'<p class="lead">The best collaborations are built on shared standards.</p>'),
 (BODY7,'<p>Quality that endures.<br>Expertise that elevates.<br>Long-term thinking.<br>Service centered on the client.<br>Innovation that enriches how you live.</p><p><strong>Together, we bring exceptional care to every part of the whole.</strong></p>')])
edit('partnerships','09 · The Value of Working Together',[
 (r'<p class="lead">Partnership allows CI.*?</p>','<p class="lead">Partnership expands what’s possible while keeping your experience effortless.</p>'),
 (BODY7,'<p>You gain access to specialists.<br>We orchestrate every detail.</p><p>You benefit from innovation.<br>We make sure it belongs in your home.</p><p>You gain world-class expertise.<br>You keep one central team.</p><p><strong>That is the CI ecosystem.</strong></p>')])
edit('partnerships','10 · Final CTA',[
 (r'<p class="body small">Whether you are beginning.*?</p>','<p class="body small">Whether you’re starting with a property, a design idea, or a new vision for how you want to live, CI builds the team around you.</p>')])

# ---------------- NEWS
edit('news','01 · Hero',[
 (E("<h1>What's Happening at CI</h1>"),'<h1>The Latest From CI</h1>'),
 (r'<p class="lead" style="font-size:1.1rem">Projects\. Perspectives\. Partnerships\. Press\. Ideas shaping how we design and live\.</p><p class="body small">.*?</p>',
  '<p class="lead" style="font-size:1.1rem">Projects. Perspectives. Partnerships. Press.</p><p class="body small">The ideas shaping how we design, build, and live, and how we continue building our clients a better life.</p>')])

s=s.replace('<span>Prototype v5</span>','<span>Prototype v6 · client edits round 2</span>')
open(P,'w',encoding='utf-8').write(s)
print('\n'.join(log)); print(len(log),'sections edited')
