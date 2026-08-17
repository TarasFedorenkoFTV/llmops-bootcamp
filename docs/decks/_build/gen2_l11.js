// L11 v2 — CI/CD quality gates
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L11-script.md"));
const D = createDeck({ lesson: 11, week: 6, fileTitle: "CI/CD quality gates, canary і rollback", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "CI/CD quality gates,\ncanary і rollback",
  lead: "Зміна промпта — це реліз, повторюємо ми з другого уроку. Сьогодні вона нарешті проходить релізний процес: eval-гейт на кожен PR, який фізично не пускає регресію в main.",
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Увімкнути eval-гейт", "на кожен PR, із доказом «червоний → зелений»"],
   ["Налаштувати protection", "required check = job eval, а не workflow"],
   ["Записати rollback-критерії", "умови, хто смикає, якою командою"],
   ["Пояснити порядок деплою", "читач їде перед писарем"],
   ["Відрізнити відкат від flag", "і сказати, коли який"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 1.9, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b }));
}

{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","Ручні перевірки не виживають"],["02","Гейт = eval + exit code + CI"],["03","Розтин eval-gate.yml"],
   ["04","CI ≠ локальна машина"],["05","Червоне — подарунок"],["06","Порядок викочування"],
   ["07","Flag, артефакти, механічні перевірки"],["08","Canary · опційно"],["09","Rollback-критерії"],
   ["10","Лабораторна"],["11","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "08" ? "warn" : "card" }));
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card", text: "Від «не забути прогнати» — до кнопки merge, яка заблокована, поки якість червона." });
}

{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb", kicker: "Шість слів сьогоднішнього уроку",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.3, items: [
    { term: "quality gate", def: "перевірка, без якої зміна не потрапляє в main" },
    { term: "required check", def: "перевірка, позначена обов'язковою — увага до назви" },
    { term: "branch protection", def: "правила: що має статися перед мержем" },
    { term: "canary", def: "викочування на частку трафіку перед повним релізом" },
    { term: "feature flag", def: "вимикач поведінки без деплою" },
    { term: "rollback-критерії", def: "умови відкату, записані до пожежі" },
  ] });
  D.band(s, { x: MX, y: 4.95, w: 12.1, h: 0.85, tone: "card", text: "Кожне побачимо в конфізі — тут вони лише щоб не спотикатися." });
}

{
  const s = D.slide({ num: "01", title: "Чому ручний запуск eval не виживає", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.95, w: 5.85, h: 1.8, title: "Поки запуск ручний",
    body: "п'ятниця, дедлайн, «та я ж одне слово поміняв» — найгірші регресії приходять саме так", tone: "crit" });
  D.tile(s, { x: 6.87, y: 1.95, w: 5.85, h: 1.8, title: "Гейт у CI",
    body: "PR зі зламаним промптом фізично не мержиться: кнопка заблокована, а не «хтось пильний»", tone: "good" });
  D.band(s, { x: MX, y: 4.0, w: 12.1, h: 1.2, tone: "acc",
    text: "Промпт остаточно стає кодом — з рев'ю і заблокованим мержем." });
  D.band(s, { x: MX, y: 5.35, w: 12.1, h: 1.05, tone: "good", label: "Принцип",
    text: "Усе, що тримається на «не забути», буде забуто. Перевірки запускає механізм." });
}

{
  const s = D.slide({ num: "02", title: "Гейт = ваш eval + exit code + CI", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.1, w: 12.1, h: 0.85, size: 10, items: [
    { label: "PR відкрито" }, { label: "стек у CI" }, { label: "очікування готовності" },
    { label: "run.py → 0/1", tone: "acc" }, { label: "merge дозволено", tone: "good" }] });
  D.tile(s, { x: MX, y: 3.3, w: 5.85, h: 1.75, title: "Майже нічого не пишемо",
    body: "run.py повертає 0/1 (урок 10), стек — одна команда (урок 1), поріг обраний і обґрунтований", tone: "good" });
  D.tile(s, { x: 6.87, y: 3.3, w: 5.85, h: 1.75, title: "Цінність — у «кожен PR»",
    body: "той самий прогін, що руками, — тепер завжди: промпт, роутер, навіть «я тільки README»", tone: "acc" });
  D.band(s, { x: MX, y: 5.25, w: 12.1, h: 1.15, tone: "card",
    text: "CI лише виконує у чистому середовищі те, що ви вже вміли робити руками. Нового коду майже немає — з'являється невідворотність." });
}

{
  const s = D.slide({ num: "02", title: "Червоний прогін сам по собі merge не блокує", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 7.4, h: 0.66, gap: 0.12, items: [
    { label: "Settings → Branches", body: "у репозиторії, де живе ваш main" },
    { label: "Add branch protection", body: "захищаємо гілку main", tone: "acc" },
    { label: "Require status checks", body: "перевірка стає обов'язковою", tone: "acc" },
    { label: "Вибрати чек eval", body: "саме job, не workflow", tone: "crit" },
  ] });
  // Чотири кроки налаштування — це інструкція. Ланцюг показує, ЩО з чим зчеплене:
  // protection блокує мерж лише тоді, коли посилається на job, який справді біжить.
  D.flow(s, { x: MX, y: 5.05, w: 7.4, h: 0.46, size: 9, items: [
    { label: "PR" }, { label: "job eval", tone: "acc" },
    { label: "protection", tone: "good" }, { label: "merge", tone: "crit" },
  ] });
  D.band(s, { x: 8.35, y: 1.95, w: 4.37, h: 2.4, tone: "crit", label: "Пастка: job, а не workflow",
    text: "У списку — назва job (eval), а не workflow. Неіснуючий чек нічого не блокує." });
  D.band(s, { x: 8.35, y: 4.5, w: 4.37, h: 1.15, tone: "warn", label: "Безкоштовний план",
    text: "на приватному репозиторії protection може бути недоступний — перевірте заздалегідь." });
  D.band(s, { x: MX, y: 5.75, w: 12.1, h: 0.65, tone: "card",
    text: "Перевірте гейт спробою мержу червоного PR." });
}

{
  const s = D.slide({ num: "03", title: "Розтин eval-gate.yml: кожен крок — граблі", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 7.5, h: 3.55, size: 10.5, lines: [
    [{ t: "- name: Up stack        ", c: P.codeKey }, { t: "# без UI — для evals не потрібен", c: P.dim }],
    [{ t: "  run: docker compose up -d --build service", c: P.darktext }],
    [{ t: "- name: Wait for service", c: P.codeKey }],
    [{ t: "  run: for i in $(seq 1 40); do", c: P.darktext }],
    [{ t: "         if curl -sf localhost:8080/health; then exit 0; fi", c: P.darktext }],
    [{ t: "         sleep 5", c: P.darktext }],
    [{ t: "       done; docker compose logs; exit 1", c: P.darktext }],
    [{ t: "- name: Wait for gateway   ", c: P.codeKey }, { t: "# холодний LiteLLM: 500", c: P.dim }],
    [{ t: "- name: Evals", c: P.codeKey }],
    [{ t: "  run: python evals/run.py --dataset evals/golden.jsonl \\", c: P.darktext }],
    [{ t: "         --threshold 5", c: P.darktext }],
    [{ t: "- name: Logs on failure   ", c: P.codeKey }, { t: "# if: failure()", c: P.dim }],
    [{ t: "- name: Down              ", c: P.codeKey }, { t: "# if: always()", c: P.dim }],
  ] });
  [["без UI", "збірка фронтенду в CI — марні хвилини"],
   ["if curl; then", "а не curl && — bash -e вб'є крок на першій невдачі"],
   ["wait gateway", "окреме очікування: холодний адаптер дає 500"],
   ["logs on failure", "червоний без логів — загадка; з логами — діагноз"],
   ["down · always()", "прибрати за собою навіть після падіння"],
  ].forEach(([t, b], i) => {
    const y = 1.95 + i * 0.72;
    s.addText(t, { x: 8.2, y, w: 4.5, h: 0.32, fontFace: F.mono, fontSize: 10.5, bold: true, color: P.acc, margin: 0 });
    s.addText(b, { x: 8.2, y: y + 0.3, w: 4.5, h: 0.4, fontFace: F.body, fontSize: 11, color: P.soft, margin: 0 });
  });
  D.band(s, { x: MX, y: 5.65, w: 12.1, h: 0.75, tone: "acc",
    text: "--threshold — частина датасету, а не константа шаблону: поріг оновлюється разом із набором кейсів." });
}

{
  const s = D.slide({ num: "04", title: "CI — це інше середовище, і воно вас здивує", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.95, w: 5.85, h: 1.9, title: "Сюрприз 1 · bash -e",
    body: "Actions виконує кроки з bash -e: перший невдалий curl убиває крок", tone: "crit" });
  D.tile(s, { x: 6.87, y: 1.95, w: 5.85, h: 1.9, title: "Сюрприз 2 · холодний gateway",
    body: "перший запит дає 500. Локально не видно: поки відкриваєте браузер, адаптер прогрівається", tone: "crit" });
  D.band(s, { x: MX, y: 4.1, w: 12.1, h: 1.2, tone: "acc",
    text: "Два червоні прогони, потім зелений — це не сором, а налагодження гейта." });
  D.band(s, { x: MX, y: 5.45, w: 12.1, h: 0.95, tone: "warn", label: "Лайфхак",
    text: "Гейт треба прогнати на зламаному PR — інакше не знаєте, чи він блокує." });
}

{
  const s = D.slide({ num: "05", title: "Червоний гейт — подарунок", pill: "absorb", notes: N() });
  D.stat(s, { x: MX, y: 1.95, w: 5.85, h: 1.5, value: "секунди", label: "гейт зловив регресію до користувачів", tone: "good", size: 30 });
  D.stat(s, { x: 6.87, y: 1.95, w: 5.85, h: 1.5, value: "дні", label: "те саме через скарги і розслідування", tone: "crit", size: 30 });
  D.band(s, { x: MX, y: 3.65, w: 12.1, h: 1.6, tone: "crit", label: "Типова помилка",
    text: "Один мерж повз червоний гейт — і за місяць його обходять усі." });
  D.band(s, { x: MX, y: 5.4, w: 12.1, h: 1.0, tone: "acc",
    text: "Гейт має бути швидким, стабільним і зрозумілим у падінні." });
}

{
  const s = D.slide({ num: "06", title: "Порядок викочування — частина релізу", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.2, w: 12.1, h: 0.85, size: 11, items: [
    { label: "читач", tone: "acc" }, { label: "писар" }, { label: "прибирання старого" }] });
  s.addText("зелений гейт каже «цей стан здоровий» — він не каже «шлях від старого до нового безпечний»",
    { x: MX, y: 3.15, w: 12.1, h: 0.3, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
  D.layers(s, { x: MX, y: 3.65, w: 12.1, h: 0.72, gap: 0.12, items: [
    { label: "Код і промпт", body: "спершу код, який уміє обидві версії; потім активація нової" },
    { label: "Схема бази", body: "expand → migrate → contract: нова колонка, заповнення, прибирання старої", tone: "acc" },
    { label: "Інструменти", body: "спершу той, хто читає новий формат, потім той, хто його пише" },
  ] });
  D.band(s, { x: MX, y: 6.25, w: 12.1, h: 0.62, tone: "good",
    text: "Правило сумісності: у будь-який момент викочування система має працювати в обох станах." });
}

{
  const s = D.slide({ num: "07", title: "Feature flag і артефакти релізу", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 1.7, title: "Відкат версії промпта",
    body: "активація попередньої версії — секунди, без деплою (урок 2)", tone: "good" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 1.7, title: "Feature flag",
    body: "аварійний вимикач шару: кеш, інструмент, guardrail — вимикається без релізу", tone: "acc" });
  D.flow(s, { x: MX, y: 3.85, w: 12.1, h: 0.75, size: 10.5, items: [
    { label: "код" }, { label: "промпт" }, { label: "датасет" }, { label: "конфіг" }] });
  s.addText("чотири артефакти — один реліз: якщо зміна торкається двох, вона одна зміна, а не дві",
    { x: MX, y: 4.7, w: 12.1, h: 0.3, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
  D.band(s, { x: MX, y: 5.2, w: 12.1, h: 1.2, tone: "crit", label: "Типова помилка",
    text: "Прапорець без плану прибирання: через рік це кладовище мертвих гілок, у якому ніхто не знає, що можна видалити." });
}

// ─── у гейті живуть не тільки evals: механічні перевірки (доважок блоку 07) ───
{
  const s = D.slide({ num: "07", title: "У гейті живуть не тільки evals", pill: "absorb",
    kicker: "Клас поломок, які до моделі навіть не доходять — кілька рядків кожна", notes: N() });
  D.table(s, { x: MX, y: 1.95, w: 12.1, colW: [5.6, 6.5], rowH: 0.58, size: 11.5,
    head: ["перевірка", "що ловить"],
    rows: [
      { cells: ["Шаблон промпта: усі плейсхолдери на місці", "одна одрукована дужка — і в модель їде текст із дужками"] },
      { cells: ["Схеми інструментів — валідний JSON Schema", "зламану схему провайдер відкине вже на проді"] },
      { cells: ["Прайс покриває всі моделі з конфіга", "інакше cost_usd тихо стає null, і облік бреше (урок 4)"] },
      { cells: ["Моделі запінені, а не alias'и", "«регресія без коміта» від оновлення провайдера (урок 3)"] },
      { cells: ["У діфі немає ключів і секретів", "найдорожча помилка з найкоротшим фіксом"], tone: "crit" },
    ] });
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 1.1, tone: "good", label: "Порядок як у піраміді тестів",
    text: "Найдешевше — механічні перевірки конфігів і схем, дорожче — eval-прогін зі стеком, найдорожче — модельні перевірки з реальним ключем. У цьому порядку 80% поломок ловляться за секунди, не піднімаючи жодного контейнера." });
}

{
  const s = D.slide({ num: "08", title: "Canary: частка трафіку замість усього", pill: "absorb", opt: true, notes: N() });
  D.flow(s, { x: MX + 1.0, y: 2.3, w: 10.3, h: 0.85, size: 11.5, items: [
    { label: "90% — стара версія", tone: "good" }, { label: "10% — нова", tone: "warn" }, { label: "порівняння метрик", tone: "acc" }] });
  D.tile(s, { x: MX, y: 3.6, w: 5.85, h: 1.7, title: "Композиція, а не новий механізм",
    body: "routing (урок 3) + реєстр версій (урок 2) + лог (урок 1) — усе вже є" });
  D.tile(s, { x: 6.87, y: 3.6, w: 5.85, h: 1.7, title: "Ділити за користувачем",
    body: "той самий стабільний вибір за ключем, що й для A/B промптів", tone: "acc" });
  D.band(s, { x: MX, y: 5.45, w: 12.1, h: 0.95, tone: "warn",
    text: "Canary без заздалегідь названої метрики порівняння — це просто повільніший спосіб викотити зміну." });
}

{
  const s = D.slide({ num: "09", title: "Rollback-критерії пишуться до пожежі", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.25, size: 12, lines: [
    [{ t: "Відкочуємо, якщо:", c: P.codeKey }],
    [{ t: "  eval pass rate < 5/6         ", c: P.codeNum }, { t: "(прогін після деплою)", c: P.dim }],
    [{ t: "  або fallback_events зростає  ", c: P.codeNum }, { t: "протягом 15 хв", c: P.dim }],
    [{ t: "  або error rate > 5%          ", c: P.codeNum }, { t: "протягом 15 хв", c: P.dim }],
    [{ t: "Хто смикає: черговий, без погоджень.", c: P.codeStr }],
    [{ t: "Як: activate попередньої версії — одна команда.", c: P.codeStr }],
  ] });
  [["Умова", "конкретна метрика і поріг, а не «якщо стане погано»"],
   ["Хто", "названа роль, яка має право смикнути, не питаючи дозволу"],
   ["Чим", "точна команда — щоб виконати її о 3-й ночі без роздумів"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 4.4, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b, tone: "good" }));
  D.band(s, { x: MX, y: 6.15, w: 12.1, h: 0.72, tone: "acc",
    text: "Рішення, ухвалене заздалегідь, виконується за секунди; рішення під час інциденту обговорюється хвилинами." });
}

{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["eval-gate.yml по кроках", "кожен крок — відповідь на конкретні граблі"],
   ["PR зі зламаним промптом", "Actions червоний, merge заблоковано"],
   ["фікс → зелений", "той самий PR стає мержабельним"],
   ["required check у налаштуваннях", "job eval, а не workflow"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 2) * 6.25, y: 1.9 + Math.floor(i / 2) * 1.8, w: 6.05, h: 1.6, badge: i + 1, title: t, body: b, tone: i === 1 ? "crit" : "good" }));
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити, як якість перестає залежати від дисципліни: перевірка, яку ви вміли робити руками, стає умовою мержу — і працює без вас." });
}

{
  const s = D.slide({ title: "Лабораторна: чотири кроки + опційний", pill: "do", notes: N() });
  [["Прочитати workflow", "eval-gate.yml: навіщо кожен крок", false],
   ["Зламати навмисно", "PR зі зіпсованим промптом → червоний прогін", false],
   ["Полагодити", "фікс у тому ж PR → зелений прогін", false],
   ["Увімкнути protection", "required check = job eval; перевірити спробою мержу", false],
   ["Canary-план · опційно", "розподіл 90/10 своїм роутером + метрики порівняння", true],
  ].forEach(([t, b, opt], i) => {
    const y = 2.0 + i * 0.92;
    s.addShape("ellipse", { x: MX, y, w: 0.5, h: 0.5, fill: { color: opt ? P.warn : P.acc }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 13, bold: true, color: opt ? P.warnbg : P.acctint, margin: 0 });
    s.addText([{ text: t + "  ", options: { bold: true, fontSize: 14, color: opt ? P.warn : P.ink } },
               { text: b, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.68, y, w: 11.4, h: 0.5, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

{
  const s = D.slide({ title: "Що це довело", pill: "connect", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.0, title: "Регресія не пройде", body: "червоний прогін блокує merge механічно, а не за домовленістю", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.0, title: "Гейт теж код", body: "два червоні прогони, поки він сам не запрацював, — нормальна історія", tone: "acc" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.0, title: "Відкат — рішення заздалегідь", body: "умови, роль і команда записані до, а не під час інциденту" });
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.35, tone: "card",
    text: "Контур замкнувся: зміна проходить перевірку, перевірка блокує регресію, відкат описаний. Лишилося зібрати це в operating model — останній урок." });
}

{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 2.05, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, items: [
    "в історії Actions є червоний і зелений прогін",
    "merge червоного PR справді заблокований",
    "rollback-критерії записані: умова, хто, чим",
    "поясню, чому читач деплоїться перед писарем",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 4.25, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Мерж повз червоний гейт", "один прецедент — і за місяць гейт обходять усі"],
   ["Protection на неіснуючий чек", "захист, який нічого не блокує, гірший за відсутній"],
   ["Гейт, що триває пів години", "обхід стає раціональним рішенням"],
   ["Feature flag без плану прибирання", "кладовище мертвих гілок через рік"],
   ["Rollback-критерії під час інциденту", "рішення обговорюється, поки користувачі чекають"],
  ].forEach(([t, b], i) => {
    const y = 1.95 + i * 0.95;
    s.addShape("roundRect", { x: MX, y, w: 12.1, h: 0.8, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.22, y: y + 0.19, w: 0.42, h: 0.42, fill: { color: P.critbg }, line: { color: P.crit, width: 1 } });
    D.cross(s, { x: MX + 0.22, y: y + 0.19, size: 0.42, color: P.crit });
    s.addText([{ text: t + "   ", options: { bold: true, fontSize: 13, color: P.ink } },
               { text: b, options: { fontSize: 11.5, color: P.soft } }],
      { x: MX + 0.8, y, w: 11.1, h: 0.8, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

{
  const s = D.slide({ title: "Домашнє завдання", pill: "do", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 2.4, title: "Обов'язково — без здачі",
    body: "• закріпити лабу: червоний і зелений прогін гейта в історії Actions\n\n• записати rollback-критерії для своєї системи\n\n• переконатися, що гейт швидкий і його падіння зрозуміле з логів" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 2.4, title: "Опційно", tone: "warn",
    body: "• canary-план: розподіл 90/10 своїм роутером, метрики порівняння, критерії promote/rollback" });
  s.addShape("roundRect", { x: MX, y: 4.6, w: 12.1, h: 1.6, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("ДЗ тижня 6 — після наступного уроку", { x: MX + 0.3, y: 4.8, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
  s.addText("Фінальне ДЗ збирає все: CI-гейт із сьогоднішньої лаби, інцидент-демо в окремому INCIDENT_RUNBOOK.md і повна збірка системи з чистого клону. Сьогоднішній гейт — його найбільша частина, і вона вже готова.",
    { x: MX + 0.3, y: 5.25, w: 11.5, h: 0.8, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
}

D.closingSlide({
  summary: [
    "усе, що тримається на «не забути», колись буде забуто",
    "гейт = ваш eval + exit code + CI; нового коду майже немає",
    "protection із правильним чеком — інакше захист лише на вигляд",
    "порядок викочування важливіший за сам факт релізу: читач перед писарем",
    "rollback-критерії пишуться до пожежі: умова, роль, команда",
  ],
  nextTitle: "Наступний крок → Урок 12 · Фінал: LLMOps operating model",
  nextBody: "Механізми зібрані й захищені гейтом. Останній урок — про те, як це живе далі: цикл роботи з якістю, розбір інциденту за рунбуком, KPI, які показують керівництву, і чесний план перенесення практик у свою команду.",
  notes: N(),
});

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L11.pptx"), path.join(OUT, "L11-script.md"));
