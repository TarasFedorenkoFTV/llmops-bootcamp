// L01 v2 — візуальна перебірка за регламентом Neoversity
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L01-script.md"));
const D = createDeck({ lesson: 1, week: 1, fileTitle: "LLMOps і архітектура production LLM-системи", notes: N });
const { P, F, W, MX } = D;

// ─── S1 титул ───
D.titleSlide({
  title: "LLMOps і архітектура\nproduction LLM-системи",
  lead: "Від «API відповів 200» до системи, якою можна керувати. Сьогодні розберемо об'єкт керування, піднімемо каркас капстоуна — і чесно зламаємо його.",
  notes: N(),
});

// ─── S2 learning outcomes ───
// ─── АВТОР ТА ВИКЛАДАЧ (шаблон, сл. 11) ───
D.authorSlide({
  name: "Тарас\nФедоренко",
  role: "Senior Backend / AI Engineer у Creatio · автор курсу LLMOps у Neoversity",
  bullets: [
    "8+ років в IT — від QA Automation до Backend та AI Engineering у production",
    "Стояв біля витоків Creatio.ai — флагманського AI-напряму українського єдинорога Creatio: впроваджував LLM-фічі ще до мейнстріму GenAI",
    "Наскрізно побудував RAG/Q&A систему: від .NET API до Python ML на LangChain, з OpenAI / Azure OpenAI та Elasticsearch як vector store",
    "Основна експертиза — LLMOps: надійність, масштабування, моніторинг і security AI-сервісів у production",
    "Досвід у класичному ML (рекомендації, sequence prediction, scikit-learn / xgboost) і у full-stack розробці",
  ],
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "Шість дій, які перевірите руками вже сьогодні",
    notes: N() });
  const items = [
    ["Підняти стек", "одна команда — п'ять компонентів"],
    ["Намалювати шлях", "UI → сервіс → адаптер → mock → лог"],
    ["Читати відповідь", "finish_reason і usage, не лише текст"],
    ["Пояснити недетермінізм", "чому temperature=0 не рятує"],
    ["Назвати сліпі зони", "дві відмови повз моніторинг"],
    ["Знайти запит у лозі", "і сказати, яких полів бракує"],
  ];
  items.forEach(([tt, bb], i) => D.tile(s, {
    x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 2.30, w: 3.85, h: 2.05,
    badge: i + 1, title: tt, body: bb, tone: "card",
  }));
}

// ─── S3 карта уроку ───
{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb",
    notes: N() });
  const map = [
    ["01", "200 ≠ production"], ["02", "Анатомія виклику"], ["03", "Токени і три ціни"],
    ["04", "Недетермінізм і латентність"], ["05", "П'ять способів зламатися"], ["06", "Стек: вирішує vs виконує"],
    ["07", "Unified log"], ["08", "Mock-провайдер"], ["09", "Реальний ключ · опційно"],
    ["10", "Лабораторна"], ["11", "Антипатерни"],
  ];
  map.forEach(([n, t], i) => {
    const x = MX + (i % 3) * 4.05, y = 1.8 + Math.floor(i / 3) * 1.15;
    // тонується лише опційний блок — як на карті уроку в решті 11 колод.
    // Фіолетова заливка перших п'яти плиток читалася як дефект: цей поділ
    // трапляється один раз за курс, ніде не повторюється й нічого не вчить.
    D.tile(s, { x, y, w: 3.85, h: 0.95, badge: n, title: t, tone: n === "09" ? "warn" : "card" });
  });
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card",
    text: "Перші п'ять блоків — об'єкт керування. Наступні — каркас, який ви будуватимете шість тижнів." });
}

// ─── КАРТА КУРСУ ПО ТИЖНЯХ (шаблон, сл. 13) ───
{
  const s = D.slide({ title: "Курс складається з шести тижнів", pill: "absorb",
    kicker: "Кожен тиждень — два уроки; кожен наступний шар лягає на той самий контур керування",
    notes: N() });
  [["Тиждень 1", "Основа + промпти", "архітектура production LLM-системи · промпт як артефакт"],
   ["Тиждень 2", "Routing + cost", "мультипровайдерний gateway · токеноміка і cost attribution"],
   ["Тиждень 3", "Кеш + tools", "точний і semantic cache · tool calls, коли модель діє"],
   ["Тиждень 4", "Надійність + безпека", "fallback і circuit breaker · guardrails і human-in-the-loop"],
   ["Тиждень 5", "Observability + evals", "метрики LLM-систем · golden dataset і eval suite"],
   ["Тиждень 6", "CI + фінал", "quality gates, canary і rollback · operating model"],
  ].forEach(([wk, name, body], i) => {
    const y = 2.30 + i * 0.76;
    s.addShape("roundRect", { x: MX, y, w: 1.62, h: 0.56, rectRadius: 0.28,
      fill: { color: P.accsolid }, line: { type: "none" } });
    s.addText(wk, { x: MX, y, w: 1.62, h: 0.56, align: "center", valign: "middle",
      fontFace: F.mono, fontSize: 9.5, bold: true, color: P.onink, margin: 0 });
    s.addShape("roundRect", { x: 2.44, y, w: 10.28, h: 0.56, rectRadius: 0.1,
      fill: { color: P.cardbg }, line: { color: P.line, width: 1 } });
    s.addText([{ text: name + "   ", options: { bold: true, color: P.ink } },
               { text: body, options: { color: P.soft } }],
      { x: 2.68, y, w: 9.8, h: 0.56, fontFace: F.body, fontSize: 11.5, valign: "middle", margin: 0 });
  });
}

// ─── S4 глосарій (pre-training) ───
{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb",
    kicker: "Шість слів, які сьогодні звучатимуть постійно — щоб вони не відволікали",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.62, items: [
    { term: "токен", def: "частинка тексту, якою модель міряє вхід і вихід; у них рахується рахунок" },
    { term: "системний промпт", def: "інструкція, як поводитись; їде в кожному запиті" },
    { term: "finish_reason", def: "чому модель зупинилася: завершила, вперлася в стелю, просить інструмент" },
    { term: "usage", def: "токени входу й виходу — єдине джерело правди про гроші" },
    { term: "контур керування", def: "control plane: шар, що ухвалює рішення, а не виконує виклик" },
    { term: "mock-провайдер", def: "фейкова модель: падає на замовлення, реагує на промпт" },
  ] });
  D.band(s, { x: MX, y: 5.62, w: 12.1, h: 0.85, tone: "card",
    text: "Кожне розберемо на місці — тут лише щоб не спотикатися." });
}

// ─── РОЗДІЛЮВАЧ · теорія ───
{
  D.divider({ big: "ТЕОРІЯ", sub: "9 блоків — дивимось і розбираємось, руками поки не робимо", notes: N() });
}

// ─── S5 · 01 проблема ───
{
  const s = D.slide({ num: "01", title: "Чому демо за день — а прод ніколи?", pill: "absorb",
    notes: N() });
  D.stat(s, { x: MX, y: 1.8, w: 3.5, h: 1.75, value: "200 OK", label: "усе, що каже вам HTTP", tone: "good", size: 38 });
  D.stat(s, { x: MX, y: 3.75, w: 3.5, h: 1.75, value: "0 / 4", label: "відповіді на операційні питання", tone: "crit", size: 44 });
  const q = [
    ["Гроші", "скільки коштує тиждень — і хто помітить"],
    ["Надійність", "провайдер ліг на 20 хвилин у робочий час"],
    ["Якість", "«маленька» правка промпта без компіляції"],
    ["Видимість", "«бот верзе дурниці», а графіки зелені"],
  ];
  q.forEach(([tt, bb], i) => D.tile(s, {
    x: 4.55 + (i % 2) * 4.3, y: 1.8 + Math.floor(i / 2) * 1.95, w: 4.1, h: 1.75,
    badge: i + 1, title: tt, body: bb, tone: "card" }));
  D.band(s, { x: 4.55, y: 5.85, w: 8.17, h: 0.62, tone: "crit", text: "Класичний моніторинг на ці питання сліпий." });
}

// ─── S5 · 01 чотири властивості ───
{
  const s = D.slide({ num: "01", title: "Чотири властивості, яких немає у звичайних сервісів", pill: "absorb",
    notes: N() });
  const props = [
    ["Недетермінізм", "той самий вхід — різний вихід"],
    ["Оплата за токен", "ціна залежить від поведінки, не від кількості"],
    ["Регресії без коміта", "промпт або снапшот моделі — без деплою"],
    ["Чужа інфраструктура", "ваш uptime залежить від чужого"],
  ];
  props.forEach(([tt, bb], i) => D.tile(s, { x: MX + i * 3.08, y: 1.75, w: 2.9, h: 1.72, badge: i + 1, title: tt, body: bb, tone: "acc" }));
  D.band(s, { x: MX, y: 3.8, w: 12.1, h: 1.25, tone: "card", label: "Теза курсу",
    text: "LLMOps — це експлуатація моделі як production-сервісу." });
  D.flow(s, { x: MX, y: 5.4, w: 12.1, h: 0.66, size: 11, items: [
    { label: "W1 промпти", tone: "acc" }, { label: "W2 гроші" }, { label: "W3 кеш і дії" },
    { label: "W4 надійність" }, { label: "W5 видимість" }, { label: "W6 гейт" }] });
  s.addText("Кожен тиждень закриває одне питання — механізмом, а не порадою.",
    { x: MX, y: 6.3, w: 12, h: 0.3, fontFace: F.body, fontSize: 11.5, italic: true, color: P.faint, margin: 0 });
}

// ─── S6 · 02 що летить у модель ───
{
  const s = D.slide({ num: "02", title: "Анатомія виклику: що летить у модель", pill: "absorb",
    notes: N() });
  D.code(s, { x: MX, y: 1.75, w: 6.1, h: 2.75, size: 11.5, lines: [
    [{ t: "{", c: P.darktext }],
    [{ t: '  "model"', c: P.codeKey }, { t: ': "mock",', c: P.codeStr }],
    [{ t: '  "messages"', c: P.codeKey }, { t: ": [", c: P.darktext }],
    [{ t: '    {"role":"system", "content":"…"},', c: P.codeStr }],
    [{ t: '    {"role":"user",   "content":"…"}', c: P.codeStr }],
    [{ t: "  ]", c: P.darktext }],
    [{ t: "}", c: P.darktext }],
    [{ t: "// саме це шле service/Program.cs", c: P.dim }],
  ] });
  D.band(s, { x: MX, y: 4.75, w: 6.1, h: 1.0, tone: "warn",
    text: "Модель не має пам'яті: історію привозите ви — тому довгий діалог дорожчає лінійно." });
  D.layers(s, { x: 7.1, y: 1.75, w: 5.62, h: 0.92, gap: 0.14, items: [
    { label: "temperature", body: "свобода вибору токена — тримають низькою", tone: "card" },
    { label: "max_tokens", body: "стеля довжини = стеля вартості виклику", tone: "card" },
    { label: "response_format", body: "строгий JSON, який валідує провайдер", tone: "card" },
  ] });
  s.addText("system — це той промпт, який наступного уроку переїде в реєстр.",
    { x: 7.1, y: 4.9, w: 5.6, h: 0.4, fontFace: F.body, fontSize: 12, italic: true, color: P.acc, margin: 0 });
}

// ─── S7 · 02 що повертається ───
{
  const s = D.slide({ num: "02", title: "Що повертається: не тільки текст", pill: "absorb",
    notes: N() });
  D.table(s, { x: MX, y: 1.75, w: 7.5, colW: [1.75, 2.9, 2.85], rowH: 0.62, size: 11.5,
    head: ["finish_reason", "що означає", "що робити"],
    rows: [
      { cells: ["stop", "модель завершила думку", "нормальний випадок"] },
      { cells: ["length", "вдарилась у max_tokens", "збій формату: не кешувати, не показувати"], tone: "crit" },
      { cells: ["tool_calls", "просить інструмент (урок 6)", "текст може бути порожнім"] },
      { cells: ["content_filter", "зрізав фільтр провайдера", "окрема категорія в метриках"] },
    ] });
  D.band(s, { x: 8.35, y: 1.75, w: 4.37, h: 2.05, tone: "crit", label: "Типова помилка",
    text: "Читати лише content: обрізана відповідь виглядає успішною — 200, текст є, метрики зелені." });
  D.band(s, { x: 8.35, y: 4.05, w: 4.37, h: 1.75, tone: "acc", label: "Третє поле — usage",
    text: "Вхідні · вихідні · кеш провайдера. Єдине джерело правди про гроші (урок 4)." });
  s.addText("Mock віддає лише stop і tool_calls — гілку length перевіряємо юніт-тестом.",
    { x: MX, y: 5.1, w: 7.4, h: 0.4, fontFace: F.body, fontSize: 11.5, italic: true, color: P.soft, margin: 0 });
}

// ─── S8 · 03 токени ───
{
  const s = D.slide({ num: "03", title: "Три ціни в одному виклику", pill: "absorb",
    notes: N() });
  D.stat(s, { x: MX, y: 1.75, w: 3.6, h: 1.6, value: "≈ 4 симв.", label: "один токен англійською (≈¾ слова)", tone: "card", size: 32 });
  D.stat(s, { x: MX, y: 3.5, w: 3.6, h: 1.6, value: "дорожче", label: "той самий зміст українською", tone: "crit", size: 32 });
  s.addText("Операційне рішення: якою мовою тримати системний промпт, що їде в кожному запиті.",
    { x: MX, y: 5.25, w: 3.6, h: 0.9, fontFace: F.body, fontSize: 11.5, color: P.soft, valign: "top", margin: 0 });
  D.bars(s, { x: 4.6, y: 2.05, w: 8.12, labelW: 2.2, noteW: 3.05, rowH: 0.55, gap: 0.32, rows: [
    { label: "Кеш провайдера", value: 1, note: "різко нижча ставка", tone: "good" },
    { label: "Вхідні", value: 2.2, note: "промпт та історія — найдешевші", tone: "acc" },
    { label: "Вихідні", value: 6, note: "у кілька разів дорожчі", tone: "crit" },
  ] });
  s.addText("схематично: порядок величин, а не точні коефіцієнти — прайс розбираємо в уроці 4",
    { x: 4.6, y: 4.5, w: 8.12, h: 0.3, fontFace: F.body, fontSize: 10, italic: true, color: P.faint, margin: 0 });
  D.band(s, { x: 4.6, y: 5.0, w: 8.12, h: 1.4, tone: "good", label: "Принцип",
    text: "Без окремих вхідних і вихідних токенів цифра вартості вигадана." });
}

// ─── S9 · 04 недетермінізм ───
{
  const s = D.slide({ num: "04", title: "temperature = 0 — це не детермінізм", pill: "absorb",
    notes: N() });
  const r = [["Пакети", "склад пакета впливає на арифметику"], ["Плаваюча точка", "обчислення не асоціативні"], ["Снапшоти", "назва та сама — модель оновлена"]];
  r.forEach(([tt, bb], i) => D.tile(s, { x: MX + i * 4.05, y: 1.8, w: 3.85, h: 1.45, badge: i + 1, title: tt, body: bb, tone: "card" }));
  D.flow(s, { x: MX, y: 3.6, w: 12.1, h: 0.7, size: 11.5, items: [
    { label: "той самий запит", tone: "acc" }, { label: "temperature = 0" }, { label: "інші слова у відповіді", tone: "crit" }] });
  D.band(s, { x: MX, y: 4.85, w: 12.1, h: 1.35, tone: "good", label: "Принцип",
    text: "Перевіряємо властивості, а не рядки: expect і forbid, не «дорівнює»." });
}

// ─── S10 · 04 латентність ───
{
  const s = D.slide({ num: "04", title: "Латентність: час залежить від довжини відповіді", pill: "absorb",
    notes: N() });
  // діаграма: смуга часу з двох частин
  s.addText("КОРОТКА ВІДПОВІДЬ", { x: MX, y: 1.75, w: 3, h: 0.28, fontFace: F.mono, fontSize: 9.5, bold: true, color: P.faint, charSpacing: 1, margin: 0 });
  s.addShape("roundRect", { x: MX, y: 2.1, w: 2.2, h: 0.6, rectRadius: 0.08, fill: { color: P.acctint }, line: { color: P.acc, width: 1 } });
  s.addText("час до 1-го токена", { x: MX, y: 2.1, w: 2.2, h: 0.6, align: "center", valign: "middle", fontFace: F.body, fontSize: 10.5, color: P.acc, margin: 0 });
  s.addShape("roundRect", { x: MX + 2.25, y: 2.1, w: 1.5, h: 0.6, rectRadius: 0.08, fill: { color: P.accsolid }, line: { type: "none" } });
  s.addText("генерація", { x: MX + 2.25, y: 2.1, w: 1.5, h: 0.6, align: "center", valign: "middle", fontFace: F.body, fontSize: 10.5, bold: true, color: "FFFFFF", margin: 0 });

  s.addText("ТРИ АБЗАЦИ — ТА САМА МОДЕЛЬ, ТОЙ САМИЙ ПРОВАЙДЕР", { x: MX, y: 3.1, w: 7, h: 0.28, fontFace: F.mono, fontSize: 9.5, bold: true, color: P.faint, charSpacing: 1, margin: 0 });
  s.addShape("roundRect", { x: MX, y: 3.45, w: 2.2, h: 0.6, rectRadius: 0.08, fill: { color: P.acctint }, line: { color: P.acc, width: 1 } });
  s.addText("час до 1-го токена", { x: MX, y: 3.45, w: 2.2, h: 0.6, align: "center", valign: "middle", fontFace: F.body, fontSize: 10.5, color: P.acc, margin: 0 });
  s.addShape("roundRect", { x: MX + 2.25, y: 3.45, w: 6.6, h: 0.6, rectRadius: 0.08, fill: { color: P.accsolid }, line: { type: "none" } });
  s.addText("генерація: послідовно, токен за токеном", { x: MX + 2.25, y: 3.45, w: 6.6, h: 0.6, align: "center", valign: "middle", fontFace: F.body, fontSize: 11, bold: true, color: "FFFFFF", margin: 0 });
  s.addText("схематично: співвідношення часток, не виміряні значення",
    { x: MX, y: 4.12, w: 12.1, h: 0.3, fontFace: F.body, fontSize: 10.5, italic: true, color: P.faint, margin: 0 });

  D.band(s, { x: MX, y: 4.55, w: 12.1, h: 1.3, tone: "crit", label: "Типова помилка",
    text: "p95 росте і від довших відповідей, і від проблем провайдера." });
  s.addText([{ text: "time-to-first-token", options: { fontFace: F.mono, bold: true, color: P.acc } },
             { text: " — метрика для інтерфейсів, де відповідь друкується на очах. Стрімінг — свідомо за межами курсу.", options: { color: P.soft } }],
    { x: MX, y: 6.0, w: 12.1, h: 0.5, fontFace: F.body, fontSize: 12, valign: "top", margin: 0 });
}

// ─── S11 · 05 таксономія відмов ───
{
  const s = D.slide({ num: "05", title: "П'ять способів зламатися — і сліпа зона моніторингу", pill: "absorb",
    notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.75, w: 5.85, h: 3.55, rectRadius: 0.12, fill: { color: P.goodbg }, line: { color: P.good, width: 1 } });
  s.addText("МОНІТОРИНГ БАЧИТЬ", { x: MX + 0.25, y: 1.95, w: 5.35, h: 0.3, fontFace: F.mono, fontSize: 10, bold: true, color: P.good, charSpacing: 1.5, margin: 0 });
  [["429", "вичерпана квота"], ["5xx", "інцидент провайдера"], ["таймаут", "відповідь після того, як пішов користувач"]].forEach(([k, v], i) => {
    const y = 2.45 + i * 0.88;
    s.addShape("roundRect", { x: MX + 0.25, y, w: 1.35, h: 0.5, rectRadius: 0.08, fill: { color: P.card }, line: { type: "none" } });
    s.addText(k, { x: MX + 0.25, y, w: 1.35, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 11.5, bold: true, color: P.good, margin: 0 });
    s.addText(v, { x: MX + 1.75, y, w: 3.85, h: 0.5, fontFace: F.body, fontSize: 12, color: P.ink, valign: "middle", margin: 0 });
  });
  s.addShape("roundRect", { x: 6.87, y: 1.75, w: 5.85, h: 3.55, rectRadius: 0.12, fill: { color: P.critbg }, line: { color: P.crit, width: 1 } });
  s.addText("НЕ БАЧИТЬ У ПРИНЦИПІ", { x: 7.12, y: 1.95, w: 5.35, h: 0.3, fontFace: F.mono, fontSize: 10, bold: true, color: P.crit, charSpacing: 1.5, margin: 0 });
  [["200 + сміття", "обрізана, порожня або не-JSON відповідь"], ["200 + тихо гірше", "новий снапшот моделі або правка промпта"]].forEach(([k, v], i) => {
    const y = 2.45 + i * 1.35;
    s.addShape("roundRect", { x: 7.12, y, w: 5.35, h: 1.15, rectRadius: 0.1, fill: { color: P.card }, line: { type: "none" } });
    s.addText(k, { x: 7.34, y: y + 0.14, w: 5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.crit, margin: 0 });
    s.addText(v, { x: 7.34, y: y + 0.58, w: 5, h: 0.5, fontFace: F.body, fontSize: 12, color: P.soft, margin: 0 });
  });
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 0.85, tone: "card",
    text: "Дві праві категорії ловить лише власний лог і гейт якості." });
}

// ─── S12 · 06 шлях запиту ───
{
  const s = D.slide({ num: "06", title: "Стек капстоуна: шлях запиту", pill: "absorb",
    notes: N() });
  D.flow(s, { x: MX, y: 2.35, w: 12.1, h: 0.9, size: 11.5, items: [
    { label: "Користувач" }, { label: "Chat UI" }, { label: "Сервіс · контур керування", tone: "acc", w: 3.0 },
    { label: "Gateway-адаптер" }, { label: "Модель / mock" }] });
  // гілка лога вниз від сервісу
  D.arrow(s, { x: 6.3, y: 3.35, len: 0.9, dir: "down", color: P.good, dashed: true });
  s.addShape("roundRect", { x: 5.25, y: 4.3, w: 2.1, h: 0.62, rectRadius: 0.1, fill: { color: P.goodbg }, line: { color: P.good, width: 1 } });
  s.addText("Лог у БД", { x: 5.25, y: 4.3, w: 2.1, h: 0.62, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12, bold: true, color: P.good, margin: 0 });
  D.code(s, { x: MX, y: 5.35, w: 5.6, h: 0.72, size: 13, lines: [[{ t: "docker compose up", c: P.codeStr }, { t: "  # п'ять компонентів", c: P.dim }]] });
  D.band(s, { x: 6.6, y: 5.35, w: 6.12, h: 0.72, tone: "card",
    text: "Ті самі ролі ви зустрінете в будь-якому проді — незалежно від інструментів." });
}

// ─── S13 · 06 п'ять компонентів ───
{
  const s = D.slide({ num: "06", title: "П'ять компонентів — і ваші стосунки з ними", pill: "absorb",
    notes: N() });
  D.layers(s, { x: MX, y: 1.8, w: 12.1, h: 0.72, gap: 0.12, items: [
    { label: "Chat UI + консоль", body: "обличчя системи — користуєтесь, не змінюєте" },
    { label: "Сервіс", body: "контур керування: модель, кеш, fallback, вартість — тут уся ваша робота", tone: "acc" },
    { label: "Gateway-адаптер", body: "єдиний вихід до провайдерів — конфігуруєте список моделей" },
    { label: "База", body: "лог, реєстр промптів, вартість — читаєте і розширюєте" },
    { label: "Mock-провайдер", body: "керована «модель» для тестів і симуляції збоїв" },
  ] });
  D.band(s, { x: MX, y: 6.15, w: 12.1, h: 0.62, tone: "card",
    text: "Права колонка чесно ділить стек: що ви будуєте — і чим просто користуєтесь." });
}

// ─── S14 · 06 вирішує / виконує ───
{
  const s = D.slide({ num: "06", title: "Сервіс вирішує. Адаптер виконує.", pill: "absorb",
    notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.8, w: 5.85, h: 2.15, rectRadius: 0.12, fill: { color: P.accsolid }, line: { type: "none" } });
  s.addText("ВИРІШУЄ", { x: MX + 0.3, y: 2.0, w: 5.2, h: 0.35, fontFace: F.mono, fontSize: 11, bold: true, color: "C9C5F2", charSpacing: 2, margin: 0 });
  s.addText("Сервіс", { x: MX + 0.3, y: 2.35, w: 5.2, h: 0.55, fontFace: F.body, fontSize: 26, bold: true, color: "FFFFFF", margin: 0 });
  s.addText("яку модель · чи кеш · чи fallback · скільки коштувало", { x: MX + 0.3, y: 2.95, w: 5.2, h: 0.8, fontFace: F.body, fontSize: 12.5, color: "DEDAF8", valign: "top", margin: 0 });
  s.addShape("roundRect", { x: 6.87, y: 1.8, w: 5.85, h: 2.15, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  s.addText("ВИКОНУЄ", { x: 7.17, y: 2.0, w: 5.2, h: 0.35, fontFace: F.mono, fontSize: 11, bold: true, color: P.faint, charSpacing: 2, margin: 0 });
  s.addText("Gateway-адаптер", { x: 7.17, y: 2.35, w: 5.2, h: 0.55, fontFace: F.body, fontSize: 26, bold: true, color: P.ink, margin: 0 });
  s.addText("виклик · згладжування API · зберігання ключів", { x: 7.17, y: 2.95, w: 5.2, h: 0.8, fontFace: F.body, fontSize: 12.5, color: P.soft, valign: "top", margin: 0 });
  D.band(s, { x: MX, y: 4.2, w: 5.85, h: 1.85, tone: "good", label: "Принцип",
    text: "Ключ живе тільки в gateway — інакше контуру керування немає." });
  D.band(s, { x: 6.87, y: 4.2, w: 5.85, h: 1.85, tone: "crit", label: "Типова помилка",
    text: "Рішення в адаптері — ви клікаєте прапорці, а не будуєте механізм." });
  s.addText("Інструменти змінюються — механізми лишаються.",
    { x: MX, y: 6.25, w: 12, h: 0.35, fontFace: F.body, fontSize: 12.5, italic: true, bold: true, color: P.ink, margin: 0 });
}

// ─── S15 · 07 unified log ───
{
  const s = D.slide({ num: "07", title: "Unified log: рядок, з якого виростає весь курс", pill: "absorb",
    notes: N() });
  D.code(s, { x: MX, y: 1.8, w: 12.1, h: 1.0, size: 13, lines: [
    [{ t: "request_id · model · ", c: P.darktext }, { t: "prompt_version", c: P.codeNum }, { t: " · latency_ms · prompt_tokens · completion_tokens · ", c: P.darktext }, { t: "cost_usd", c: P.codeNum }, { t: " · status", c: P.darktext }],
  ] });
  s.addText("підсвічені поля сьогодні порожні — це ваша робота на два тижні",
    { x: MX, y: 2.9, w: 12, h: 0.3, fontFace: F.body, fontSize: 11.5, italic: true, color: P.faint, margin: 0 });
  // впорядковано за тижнем: рядок читається як план курсу, а не врозбій
  const grow = [["prompt_version", "«що зламалось учора о 19:40»", "W1"], ["model", "розподіл трафіку, доказ routing", "W2"],
                ["tokens · cost_usd", "вартість, бюджет, алерти", "W2"], ["latency_ms · status", "p95, error rate, сліди інцидентів", "W4–5"],
                ["весь рядок разом", "метрики консолі, гейти якості", "W5–6"]];
  grow.forEach(([f, v, w], i) => {
    const y = 3.35 + i * 0.6;
    s.addText(f, { x: MX, y, w: 2.9, h: 0.5, fontFace: F.mono, fontSize: 11, bold: true, color: P.acc, valign: "middle", margin: 0 });
    D.arrow(s, { x: MX + 3.0, y: y + 0.25, len: 0.55 });
    s.addText(v, { x: MX + 3.7, y, w: 7.2, h: 0.5, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "middle", margin: 0 });
    s.addShape("roundRect", { x: 11.95, y: y + 0.09, w: 0.77, h: 0.32, rectRadius: 0.06, fill: { color: P.acctint }, line: { color: P.acc, width: 1 } });
    s.addText(w, { x: 11.95, y: y + 0.09, w: 0.77, h: 0.32, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: true, color: P.acc, margin: 0 });
  });
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "good", text: "Немає лога — немає операцій." });
}

// ─── S16 · 08 mock ───
{
  const s = D.slide({ num: "08", title: "Mock: керовані збої + чутливість до промпта", pill: "absorb",
    notes: N() });
  s.addText("СУПЕРСИЛА 1 · ПАДАЄ НА ЗАМОВЛЕННЯ", { x: MX, y: 1.75, w: 6, h: 0.3, fontFace: F.mono, fontSize: 10, bold: true, color: P.faint, charSpacing: 1.5, margin: 0 });
  [["__fail_503", "провайдер лежить", "W4", "crit"], ["__fail_429", "вичерпані ліміти", "урок 7", "crit"],
   ["__delay", "стрибок latency", "W4–5", "warn"], ["__garbage", "беззмістовна відповідь", "ДЗ W5", "warn"]].forEach(([m, v, w, tone], i) => {
    const y = 2.2 + i * 0.72, c = tone === "crit" ? P.crit : P.warn, bg = tone === "crit" ? P.critbg : P.warnbg;
    s.addShape("roundRect", { x: MX, y, w: 1.75, h: 0.55, rectRadius: 0.08, fill: { color: bg }, line: { type: "none" } });
    s.addText(m, { x: MX, y, w: 1.75, h: 0.55, align: "center", valign: "middle", fontFace: F.mono, fontSize: 11, bold: true, color: c, margin: 0 });
    s.addText(v, { x: MX + 1.9, y, w: 3.0, h: 0.55, fontFace: F.body, fontSize: 12, color: P.ink, valign: "middle", margin: 0 });
    s.addText(w, { x: MX + 4.95, y, w: 1.05, h: 0.55, fontFace: F.mono, fontSize: 10, color: P.faint, valign: "middle", margin: 0 });
  });
  s.addText("Надійність, яку тренують лише на реальних інцидентах, — це сподівання.",
    { x: MX, y: 5.2, w: 6, h: 0.6, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, valign: "top", margin: 0 });
  s.addText("СУПЕРСИЛА 2 · РЕАГУЄ НА ПРОМПТ", { x: 7.1, y: 1.75, w: 5.6, h: 0.3, fontFace: F.mono, fontSize: 10, bold: true, color: P.faint, charSpacing: 1.5, margin: 0 });
  D.flow(s, { x: 7.1, y: 2.2, w: 5.62, h: 0.62, size: 11, items: [
    { label: "промпт v2", tone: "good" }, { label: "відповідь по суті" }] });
  D.flow(s, { x: 7.1, y: 3.15, w: 5.62, h: 0.62, size: 11, items: [
    { label: "промпт зламано", tone: "crit" }, { label: "«не знаю»" }] });
  D.band(s, { x: 7.1, y: 4.1, w: 5.62, h: 1.5, tone: "acc",
    text: "Регресію промпта видно автоматично: зламали — почервоніло." });
  D.band(s, { x: 7.1, y: 5.75, w: 5.62, h: 1.05, tone: "card", label: "Чому це переноситься на прод",
    text: "Механіка контуру однакова; міняється лише «мозок» на іншому кінці дроту." });
}

// ─── S17 · 09 опційно ───
{
  const s = D.slide({ num: "09", title: "Реальний ключ і розширений стек", pill: "absorb", opt: true,
    notes: N() });
  D.code(s, { x: MX, y: 1.8, w: 12.1, h: 1.65, size: 12.5, lines: [
    [{ t: "cp gateway/.env.example gateway/.env", c: P.codeStr }, { t: "   # вписати ключ", c: P.dim }],
    [{ t: "MODEL=назва-моделі docker compose up", c: P.codeStr }, { t: "   # реальний провайдер", c: P.dim }],
    [{ t: "docker compose --profile advanced up", c: P.codeStr }, { t: "   # + Redis (W3)", c: P.dim }],
  ] });
  D.tile(s, { x: MX, y: 3.75, w: 3.9, h: 1.9, title: "Зміниться", body: "якість відповідей, багатоходовий діалог, цифри вартості", tone: "card" });
  D.tile(s, { x: 4.72, y: 3.75, w: 3.9, h: 1.9, title: "Не зміниться", body: "жоден механізм контуру: routing, лог, кеш, fallback, гейти", tone: "acc" });
  D.band(s, { x: 8.82, y: 3.75, w: 3.9, h: 1.9, tone: "warn", label: "Лайфхак",
    text: "Берете ключ — одразу ставте ліміт витрат у провайдера." });
  s.addText("Радимо не вмикати в перші тижні: на mock видно механіку, а не магію моделі.",
    { x: MX, y: 5.9, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
}

// ─── РОЗДІЛЮВАЧ · практика ───
{
  D.divider({ big: "ПРАКТИКА", sub: "стенд наживо — і чесна межа того, що він доводить",
    pill: "Лабораторна: п'ять кроків + один опційний", notes: N() });
}

// ─── S18 місток до демо ───
{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do",
    notes: N() });
  const fr = [["стек піднявся", "docker compose up --build"], ["чат відповідає", "«Як скинути пароль?»"],
              ["консоль порожня", "«—» у кожній плитці"], ["TODO у коді", "мапа роботи на 6 тижнів"],
              ["рядок у лозі", "таблиця requests"], ["чесний злам", "__fail_503 — і жодного плану Б"]];
  fr.forEach(([tt, bb], i) => D.tile(s, {
    x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.75, w: 3.85, h: 1.55,
    badge: i + 1, title: tt, body: bb, tone: i === 5 ? "crit" : "good" }));
  D.band(s, { x: MX, y: 5.5, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Зафіксувати точку А — стан системи до шарів керування. Порожня консоль і збій без плану Б — не дефект демо, а предмет курсу." });
}

// ─── S19 лаба ───
{
  const s = D.slide({ title: "Лабораторна: п'ять кроків + один опційний", pill: "do",
    notes: N() });
  const st = [["Підняти стек", "docker compose up --build → localhost:4200"],
              ["Оглянути половини", "чат відповідає; консоль — «—» у кожній плитці"],
              ["Прочитати код", "service/Program.cs, /chat згори вниз; знайти TODO(student)"],
              ["Знайти запит у лозі", "SELECT * FROM requests ORDER BY created_at DESC"],
              ["Зламати", "__fail_503 → «сервіс недоступний», плану Б немає"]];
  st.forEach(([tt, bb], i) => {
    const y = 1.8 + i * 0.86;
    s.addShape("ellipse", { x: MX, y, w: 0.5, h: 0.5, fill: { color: P.accsolid }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 13, bold: true, color: "FFFFFF", margin: 0 });
    s.addText([{ text: tt + "  ", options: { bold: true, fontSize: 14, color: P.ink } },
               { text: bb, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.68, y, w: 11.4, h: 0.5, fontFace: F.body, valign: "middle", margin: 0 });
  });
  const yo = 1.8 + 5 * 0.86;
  s.addShape("ellipse", { x: MX, y: yo, w: 0.5, h: 0.5, fill: { color: P.warn }, line: { type: "none" } });
  s.addText("6", { x: MX, y: yo, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 13, bold: true, color: P.warnbg, margin: 0 });
  s.addText([{ text: "Розширений стек · опційно  ", options: { bold: true, fontSize: 14, color: P.warn } },
             { text: "--profile advanced → +Redis → погасити", options: { fontSize: 12, color: P.soft } }],
    { x: MX + 0.68, y: yo, w: 11.4, h: 0.5, fontFace: F.body, valign: "middle", margin: 0 });
}

// ─── РОЗДІЛЮВАЧ · рефлексія ───
{
  D.divider({ big: "РЕФЛЕКСІЯ", sub: "що це довело · перевір себе · антипатерни тижня", notes: N() });
}

// ─── S20 що це довело ───
{
  const s = D.slide({ title: "Що це довело", pill: "connect",
    notes: N() });
  D.tile(s, { x: MX, y: 1.85, w: 3.9, h: 2.1, title: "Система жива", body: "шлях запиту видно наскрізь: UI → сервіс → адаптер → mock → лог", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.85, w: 3.9, h: 2.1, title: "Керування ще немає", body: "консоль «—», prompt_version і cost_usd порожні", tone: "warn" });
  D.tile(s, { x: 8.82, y: 1.85, w: 3.9, h: 2.1, title: "Плану Б немає", body: "__fail_503 → заглушки, деградації і сліду в метриках не існує", tone: "crit" });
  D.flow(s, { x: MX, y: 4.4, w: 12.1, h: 0.7, size: 11, items: [
    { label: "точка А", tone: "crit" }, { label: "промпти" }, { label: "гроші" }, { label: "кеш" },
    { label: "надійність" }, { label: "видимість" }, { label: "точка Б", tone: "good" }] });
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 1.15, tone: "acc",
    text: "Точку Б ви збудуєте самі — шар за шаром, тиждень за тижнем. Сьогоднішній скріншот консолі збережіть: на тижні 6 порівняєте." });
}

// ─── S21 перевір себе ───
{
  const s = D.slide({ title: "Перевір себе", pill: "connect",
    notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 4.00, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, h: 3.20, size: 14, items: [
    "стек піднявся, консоль показує «—»",
    "малюю шлях запиту з пам'яті",
    "знайшов свій рядок у requests",
    "бачив поведінку при збої провайдера",
    "поясню, чому temperature=0 не рятує",
    "назву дві невидимі категорії відмов",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 6.20, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

// ─── S22 антипатерни ───
{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect",
    notes: N() });
  const anti = [["Ключ у коді застосунку", "«потім перенесемо» — не перенесете"],
                ["Демо на одному запиті", "готовність — це чотири питання, а не скріншот"],
                ["«Логи — коли зламається»", "тоді дивитися буде нікуди"],
                ["Три провайдери одразу", "спочатку один контур наскрізь"],
                ["Реальний ключ з першого дня", "на mock видно механіку, там — лише рахунок"]];
  anti.forEach(([tt, bb], i) => {
    const y = 1.85 + i * 0.95;
    s.addShape("roundRect", { x: MX, y, w: 12.1, h: 0.8, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.22, y: y + 0.19, w: 0.42, h: 0.42, fill: { color: P.critbg }, line: { color: P.crit, width: 1 } });
    D.cross(s, { x: MX + 0.22, y: y + 0.19, size: 0.42, color: P.crit });
    s.addText([{ text: tt + "   ", options: { bold: true, fontSize: 14, color: P.ink } },
               { text: bb, options: { fontSize: 12.5, color: P.soft } }],
      { x: MX + 0.8, y, w: 11.1, h: 0.8, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

// ─── S23 ДЗ ───
{
  const s = D.slide({ title: "Домашнє завдання", pill: "do",
    notes: N() });
  D.tile(s, { x: MX, y: 1.85, w: 5.85, h: 2.6, title: "Обов'язково — без здачі", tone: "card",
    body: "• пройти 5 обов'язкових кроків лабораторної\n\n• витримати чек-лист «перевір себе»\n\n• переглянути гайд для студента по діагоналі" });
  D.tile(s, { x: 6.87, y: 1.85, w: 5.85, h: 2.6, title: "Опційно", tone: "warn",
    body: "• підняти розширений профіль стека\n\n• якщо є свій ключ — поставити ліміт витрат у кабінеті провайдера (ключ поки не підключати)" });
  s.addShape("roundRect", { x: MX, y: 4.75, w: 12.1, h: 1.5, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("ДЗ тижня 1 — здається після уроку 2", { x: MX + 0.3, y: 4.95, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
  s.addText("Логування + prompt registry. Тиждень здається одним PR у своєму репозиторії; критерії — у файлі ДЗ після наступного уроку.",
    { x: MX + 0.3, y: 5.4, w: 11.5, h: 0.7, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
}

// ─── S24 фінал ───
D.closingSlide({
  summary: [
    "200 — не «працює»: гроші, надійність, якість і видимість потребують власного контуру",
    "контракт виклику однаковий у всіх: messages, параметри, finish_reason, usage",
    "перевіряємо властивості, а не рядки; latency читаємо разом із довжиною відповіді",
    "сервіс вирішує — адаптер виконує; ключ живе тільки в gateway",
    "unified log — рядок, з якого виростає весь курс",
  ],
  nextTitle: "Наступний крок → Урок 2 · Prompt lifecycle: промпт як production-артефакт",
  nextBody: "Ваш системний промпт захардкоджений у коді — і це остання доба, коли це прийнятно. Далі: версії, promote, rollback і відкат за секунди.",
  notes: N(),
});

// ─── ДЯКУЮ (шаблон, сл. 42) ───
D.thanksSlide({ notes: N() });

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L01.pptx"), path.join(OUT, "L01-script.md"));
