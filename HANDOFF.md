# CI Design + Build — передача сесії (13.11.2026)

Цей документ — точка входу для нової сесії. Як почати:
1. Відкрий нову сесію, прикріплену до проєкту **«CI DSGN BLD»**.
2. Напиши: «Прочитай `claude/ci-handoff-2026-11-13.md` і продовжуй проєкт CI».
3. Якщо потрібні робочі скрипти (експорт у Figma, генератори сторінок) — вони на GitHub у гілці **`tools`** (див. розділ 7).

Стара сесія (цей чат) лишається відкритою за посиланням: https://claude.ai/code/session_0117HZEeKusXN3UNmPD9FEqi

---

## 1. Правила роботи (діють завжди)
- **Відповідати українською** (прохання 12.11, 20:52).
- E-mail користувача — приватний: не передавати в зовнішні сервіси без дозволу.
- Нічого не надсилати від імені користувача — тільки чернетки / переклади.
- Кожна витрата кредитів Weave / Figma AI — лише після явного «так».
- **Логотип CI ніколи не перемальовувати** — тільки офіційні файли й компонент Logo у Figma (набір 82:265).
- Не змінювати домени й аліаси Vercel. Не обходити заблоковану мережу.
- Не діяти в чужих акаунтах і браузерах (Chrome дизайнерки «Browser 2304d226» — не використовувати; класифікатор це блокує).
- Не переписувати погоджений клієнтом текст.
- Коміти закінчувати рядками:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` і `Claude-Session: https://claude.ai/code/session_0117HZEeKusXN3UNmPD9FEqi` (у новій сесії — посилання на нову сесію).
- Правила дизайну (без золота поза інтро, без чорних вуалей на фото, без рамок на фото, повнокольоровий дрібний текст тощо) — у `claude/ci-design-lessons.md`.

## 2. Код і посилання
- GitHub: **lubimovbro33/ci-design-build-prototype** (усі гілки на GitHub синхронні з локальними).
- Гілки:
  - `main` — сайт знято (порожня сторінка), ci-design.vercel.app зараз пустий.
  - `wip` (bfd5e48) — головна сторінка, дизайн.
  - `about` (d6703c7) — `wip` + сторінка **About** (v1, «метафорична»). Ще не злита в `wip`.
  - `proto-r2` (9f0e208) — прототип v6 з **другим раундом правок клієнта** (тексти з вкладки «Lola + Mike Full Copy Edits»).
  - `type`, `v10`, `v9`, `v15-intro`, `before` — проміжні версії; `figx` — тимчасова гілка для експорту (зараз = `about`, порожня від payload).
  - `tools` — робочі скрипти (див. розділ 7).
- Vercel (команда lubimovbros-projects):
  - проєкт **ci-design** (корінь `design/`): прев'ю гілок `https://ci-design-git-<гілка>-lubimovbros-projects.vercel.app` (захищені — відкриваються з Vercel-логіном або share-посиланням через Vercel MCP).
  - About: https://ci-design-git-about-lubimovbros-projects.vercel.app/about.html
  - проєкт **ci-design-build-prototype** (корінь репозиторію): прототип із правками клієнта — https://ci-design-build-prototype-git-proto-r2-lubimovbros-projects.vercel.app

## 3. Figma (файл CI, orHHlBPwgjLYV3VZG67BHY)
https://www.figma.com/design/orHHlBPwgjLYV3VZG67BHY/CI
- **«Дизайн · 1920 — Головна, дизайн-система, About»** (427:98) — головне з останньої сесії:
  - «Головна · 1920» (433:106): одне полотно 1920, 31 екран (сцени прокрутки розкладені по кроках), справжні фото.
  - «Дизайн-система · CI Design + Build» (429:98): шрифти, 28 текстових стилів «CI · Site/…», змінні «CI · Site tokens» (кольори, розміри), сітка «Grid 1920 · quarters», лінії, кнопки-компоненти, рух, логотип. Під нею — секція «Компоненти сайту» (шапка, рейка розділів).
  - «About · 1920» (433:356): 28 екранів сторінки About.
- **«Prototype — Pages (EN)»** (389:99) — 16 сторінок прототипу (з правками клієнта, тільки англійська), auto layout, 55 стилів «Prototype/…»; **«Prototype — Components»** (389:98).
- Старіші: «Главная · v12 (из кода)» (207:98), «Brand — CI DSGN», «Design System» (80:98, логотип 82:265), матеріали клієнта, «Storyboard — Intro v15».
- **Шрифт у Figma:** Trade Gothic через API недоступний → там, де на сайті Trade Gothic, у Figma стоїть замінник **Encode Sans Expanded**. Щоб поставити справжній: встановити OTF з брендбуку (папка CI Fonts) на Mac і запустити плагін `~/Downloads/CI-Figma-Trade-Gothic-plugin/` (Plugins → Development → Import plugin from manifest).

## 4. Що зроблено в цій сесії (12–13.11)
1. **About us** — зроблена «метафорична» сторінка (v1). Після критики арт-директора — v2, але вона «занадто скучна» → **повернута v1** (гілка `about`). Генератори: `ab/build_html.py` (v1), `ab/build2.py` (v2, не використовується).
2. **Правки клієнта, 2-й раунд** внесені в прототип (`proto-r2`, скрипт `ab/proto_r2.py`). Для розділу з двома варіантами заголовка обрано «The Art of a Seamless Experience»; додано рядок про 20 %.
3. **Прототип → Figma** (лише EN), чисті шари, auto layout, компоненти.
4. **Головна + About → Figma у 1920** одним полотном + **дизайн-система** (усе виміряно з коду при 1920; на сайті розміри = значення × 100vw/1920).
5. Розбір шрифтів (див. розділ 5).

## 5. Відкрите питання: шрифти (важливо)
- **Брендбук клієнта (CI DSGN Guideline 2025):** Trade Gothic LT Std Extended / Bold Extended.
- **Зараз на сайті суміш:**
  - Zalando Sans Expanded — заголовки H2 і великі написи, підписи, кнопки-блоки, CTA в шапці, рейка розділів;
  - Zalando Sans SemiExpanded — основний текст і ліди;
  - Trade Gothic — заголовок обкладинки «Redefining the Art of Living» (Bold 111), у Hero + Story три фрази (34, капс), «This is turnkey.» (55), текст історії (17), індекси 01/02/03; список проєктів у Projects (15); цитата (45) і підписи (16) у Reviews; велика кнопка в CTA (Bold 30); pill-кнопки (Bold 10); e-mail у футері.
- **Погодження з клієнтом на перехід на Zalando — немає в жодних записах.** Zalando прийшов 09.11 із макета у Figma (прохання «шрифти мають бути ідентичні Figma»). При цьому Zalando Sans Expanded раніше використовувався як **тимчасовий замінник** Trade Gothic у Figma (через API) — тож міг потрапити в макети випадково.
- **Наступний крок:** уточнити в дизайнерки / клієнта, який шрифт фірмовий для сайту. Далі або привести весь сайт до Trade Gothic (файли вже на сайті: `design/assets/fonts/tg-ext*.woff`), або все до Zalando.

## 6. Інші незакриті пункти
- Статус погодження прототипу клієнтом — у записах не підтверджено, уточнити.
- About (`about`) ще не злита в `wip`.
- Папка для дизайнера «CI Design + Build — для дизайнера» у ~/Downloads (без фото/відео) — README не дописаний (користувач перейшов до інших задач).
- Старі пункти з `claude/ci-website-prototype-status.md`: мобільне меню, заміна плейсхолдерів, коли клієнт назве проєкти.
- У Figma на «Page 1», кадр 6 — 7 текстових шарів лишилися в Zalando (стара примітка з `ci-figma-client-materials.md`).

## 7. Робочі скрипти (гілка `tools` на GitHub)
У новій сесії папки `/home/claude/...` вже не буде. Щоб відновити:
```
git clone https://github.com/lubimovbro33/ci-design-build-prototype.git /home/claude/ci-design-build-prototype
cd /home/claude/ci-design-build-prototype && git fetch origin tools
git worktree add /home/claude/tools-src origin/tools
cp -r /home/claude/tools-src/tools/fig /home/claude/fig
cp -r /home/claude/tools-src/tools/ab  /home/claude/ab
```
- `fig/` — експорт сайту в Figma: `figx19.js` (DOM → payload), `extract19.py` (Playwright 1920, автопошук кроків сцен), `assemble19.py` (SVG-пакети), `builder19.js` (збірка у Figma), `gfroute.py` + `fig/gf/` (локальні Zalando для Playwright), `sheet19.py` (контакт-листи); старіші `figx.js` / `extract.py` / `assemble.py` / `builder_lib.js` (експорт 1440 від 05.11); `proto/` — експорт прототипу (run_extract.py → normalize.py → lib2.js); `z/inf.js` — інфлейтер для base64-пакетів у use_figma.
- `ab/` — генератори сторінки About і скрипт правок прототипу.
- Як саме проходить експорт (і транспорт через вбудований браузер, бо контейнер не бачить figma.com) — у `claude/ci-figma-design-1920-design-system.md` та `claude/ci-figma-prototype-export.md`.

## 8. Карта документів проєкту
- `ci-website-prototype-status.md` — загальний статус і історія головної (v3–v15).
- `ci-design-lessons.md` — правила дизайну від користувача + курс; `ci-design-lessons-dmd-course.md`.
- `ci-copy-doc-1-original.md`, `ci-copy-doc-2-client-edits.md` — тексти й правки клієнта.
- `ci-hero-2026-11-09.md`, `ci-chapters-v8.md`, `ci-v10-…`, `ci-v11-…`, `ci-mobile-v1.md`, `ci-story-blocks-2-3.md` — історія блоків головної.
- `ci-figma-design-1920-design-system.md` — експорт 1920 + дизайн-система (токени, як повторити).
- `ci-figma-prototype-export.md` — прототип у Figma.
- `ci-figma-homepage-export.md` — експорт 1440 від 05.11.
- `ci-figma-client-materials.md` — матеріали клієнта у Figma, нюанс зі шрифтом.
- `ci-materials-archive.md`, `ci-hero-interiors-selection.md`, `ci-v15-intro-facade-approved.md`, `ci-handoff-2026-11-02-hero-edits.md` — матеріали, фото, інтро.
