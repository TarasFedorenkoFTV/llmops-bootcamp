// L04 v2 — Токеноміка і cost attribution
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L04-script.md"));
const D = createDeck({ lesson: 4, week: 2, fileTitle: "Токеноміка і cost attribution", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "Токеноміка\nі cost attribution",
  lead: "«Скільки коштує наш AI?» — питання, на яке більшість команд відповідає рахунком наприкінці місяця. Це запізно. Сьогодні система знатиме вартість кожного запиту в момент відповіді.",
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Завести прайс у сервісі", "поруч із Route(), де ухвалюється рішення"],
   ["Порахувати вартість запиту", "у момент відповіді, а не в рахунку"],
   ["Показати різницю SELECT'ом", "ескалація дорожча за FAQ"],
   ["Оживити плитку вартості", "GET /cost із бюджетом поруч"],
   ["Розкласти витрати", "за моделлю, днем і версією промпта"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 2.30, w: 3.85, h: 2.05, badge: i + 1, title: t, body: b }));
}

{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","Рахунок як спосіб дізнатися"],["02","Usage — джерело правди"],["03","Прайс у control plane"],
   ["04","Розрахунок: три рядки"],["05","Звернення ≠ виклик"],["06","Атрибуція важливіша за суму"],
   ["07","GET /cost і бюджет"],["08","Routing × cost"],["09","Budget-політика · опційно"],
   ["10","Лабораторна"],["11","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "09" ? "warn" : "card" }));
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card", text: "Від «дізналися з рахунку» — до цифри, яка з'являється разом із відповіддю." });
}

{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb", kicker: "Шість слів сьогоднішнього уроку",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.62, items: [
    { term: "usage", def: "prompt_tokens (вхід) і completion_tokens (вихід) у відповіді" },
    { term: "прайс", def: "ціни за 1k токенів, окремо вхідних і вихідних" },
    { term: "cost_usd", def: "поле лога з порахованою вартістю запиту" },
    { term: "атрибуція", def: "розклад витрат за моделлю, днем, версією промпта" },
    { term: "звернення ≠ виклик", def: "одне питання — до чотирьох походів у модель" },
    { term: "бюджет", def: "цифра, з якою порівнюється сьогоднішня витрата" },
  ] });
  D.band(s, { x: MX, y: 5.62, w: 12.1, h: 0.85, tone: "card", text: "Кожне побачимо в коді — тут вони лише щоб не спотикатися." });
}

// ─── РОЗДІЛЮВАЧ · теорія ───
{
  D.divider({ big: "ТЕОРІЯ", sub: "9 блоків — дивимось і розбираємось, руками поки не робимо", notes: N() });
}

{
  const s = D.slide({ num: "01", title: "Рахунок як спосіб дізнатися про катастрофу", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.1, w: 12.1, h: 0.85, size: 11, items: [
    { label: "фіча злітає", tone: "good" }, { label: "рахунок ×10", tone: "crit" },
    { label: "археологія: хто? на чому?", tone: "warn" }, { label: "лог мовчить", tone: "crit" }] });
  D.tile(s, { x: MX, y: 3.35, w: 5.85, h: 1.75, title: "Вартість — не константа",
    body: "залежить від моделі, контексту, поведінки користувачів і склейки промпта" });
  D.tile(s, { x: 6.87, y: 3.35, w: 5.85, h: 1.75, title: "Оцінювання якості теж коштує",
    body: "LLM-as-judge — такі самі токени; не рахувати = недооцінити рахунок", tone: "warn" });
  D.band(s, { x: MX, y: 5.35, w: 12.1, h: 1.0, tone: "good", label: "Принцип",
    text: "Рахується все, що ходить у модель: запити, ретраї, класифікатори, evals." });
}

{
  const s = D.slide({ num: "02", title: "Usage — єдине джерело правди", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 6.3, h: 1.35, size: 13, lines: [
    [{ t: '"usage"', c: P.codeKey }, { t: ": { ", c: P.darktext }, { t: '"prompt_tokens"', c: P.codeKey }, { t: ": 184,", c: P.darktext }],
    [{ t: "          ", c: P.darktext }, { t: '"completion_tokens"', c: P.codeKey }, { t: ": 46 }", c: P.darktext }],
  ] });
  D.band(s, { x: MX, y: 3.45, w: 6.3, h: 1.1, tone: "acc", text: "вартість = токени × ціна моделі, окремо вхідні й вихідні" });
  D.tile(s, { x: 7.25, y: 1.9, w: 5.47, h: 1.35, title: "Вихідні дорожчі", body: "провайдери тарифікують їх у кілька разів вище", tone: "warn" });
  D.tile(s, { x: 7.25, y: 3.45, w: 5.47, h: 1.1, title: "prompt_tokens домінують", body: "історія та інструкції важать більше за відповідь" });
  D.band(s, { x: MX, y: 4.85, w: 12.1, h: 1.35, tone: "card", label: "Mock повертає реалістичний usage",
    text: "Оцінює токени за довжиною тексту (~4 символи на токен) — механіка тренується без ключа і без витрат; з реальним провайдером зміняться лише цифри у прайсі." });
}

{
  const s = D.slide({ num: "02", title: "Скільки коштує ваша мова", pill: "absorb",
    kicker: "Українською той самий зміст дорожчий: кирилиця гірше представлена в токенізаторах", notes: N() });
  [["Мова системного промпта", "він їде в кожному запиті — довжина множиться на весь трафік"],
   ["Скільки історії тягнути", "контекст оплачується повторно на кожному кроці"],
   ["Де тримати довгі інструкції", "стабільне — на початок промпта, щоб підхопив кеш префікса"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 2.05, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b, tone: "acc" }));
  // Порівняння в токенах: твердження «українською дорожче» лишається абстрактним,
  // поки не видно двох смуг поруч. Тут різниця читається як довжина, а не як число.
  s.addText("той самий зміст, дві мови — у токенах", { x: MX, y: 3.78, w: 12.1, h: 0.24,
    fontFace: F.mono, fontSize: 9, bold: true, color: P.faint, charSpacing: 1.5, margin: 0 });
  D.bars(s, { x: MX, y: 4.06, w: 12.1, labelW: 2.5, noteW: 4.6, rowH: 0.46, gap: 0.2, rows: [
    { label: "English", value: 8, note: "8 токенів", tone: "good" },
    { label: "Українською", value: 19, note: "19 токенів — та сама фраза", tone: "crit" },
  ] });
  D.band(s, { x: MX, y: 5.3, w: 12.1, h: 1.2, tone: "crit", label: "Типова помилка",
    text: "Економія на промпті — у межах найдешевшої ставки; зміна моделі — різниця в разах." });
}

{
  const s = D.slide({ num: "03", title: "Прайс живе в control plane", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 7.4, h: 2.0, size: 11.5, lines: [
    [{ t: "// [W2] прайс за 1k токенів (in, out) — навчальні числа", c: P.dim }],
    [{ t: "var prices = new Dictionary<string, (decimal In, decimal Out)>", c: P.codeKey }],
    [{ t: "{", c: P.darktext }],
    [{ t: '  ["mock-mini"]   = (0.00015m, 0.0006m),', c: P.codeStr }],
    [{ t: '  ["mock-strong"] = (0.0025m,  0.01m),', c: P.codeStr }],
    [{ t: "};", c: P.darktext }],
  ] });
  D.stat(s, { x: 8.35, y: 1.9, w: 2.1, h: 2.0, value: "×16", label: "strong дорожча за mini", tone: "crit", size: 34 });
  D.stat(s, { x: 10.62, y: 1.9, w: 2.1, h: 2.0, value: "×4", label: "вихідні дорожчі за вхідні", tone: "warn", size: 34 });
  D.band(s, { x: MX, y: 4.15, w: 12.1, h: 1.0, tone: "acc",
    text: "Рішення визначають пропорції, не абсолютні цифри — тому routing і є важелем." });
  D.band(s, { x: MX, y: 5.35, w: 12.1, h: 1.0, tone: "card", label: "Чому поруч із Route()",
    text: "Прайс біля точки рішення: ціна — параметр вибору, не бухгалтерська довідка." });
}

{
  const s = D.slide({ num: "03", title: "Прайс — живі дані, і цін уже не дві, а три", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 1.65, title: "Застарілі ціни — систематична помилка",
    body: "не разовий баг, а викривлення всіх рішень, які ви ухвалюєте за цифрами", tone: "crit" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 1.65, title: "Кешовані вхідні токени",
    body: "незмінний префікс промпта на повторних викликах — у рази дешевший", tone: "good" });
  D.bars(s, { x: MX + 0.4, y: 3.85, w: 11.3, labelW: 2.6, noteW: 2.6, rowH: 0.5, gap: 0.24, rows: [
    { label: "кешовані вхідні", value: 1, note: "у рази дешевші", tone: "good" },
    { label: "вхідні", value: 2.2, note: "базова ставка", tone: "acc" },
    { label: "вихідні", value: 6, note: "найдорожчі", tone: "crit" },
  ] });
  D.band(s, { x: MX, y: 5.85, w: 12.1, h: 0.85, tone: "warn", label: "Не плутати з кешем відповідей (W3)",
    text: "Кеш відповідей прибирає виклик цілком; кеш префікса здешевлює виклик зсередини. Вони складаються, а не конкурують." });
}

{
  const s = D.slide({ num: "04", title: "Розрахунок: три рядки після відповіді", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 1.9, size: 12, lines: [
    [{ t: "// [W2] cost: tokens * ціна моделі", c: P.dim }],
    [{ t: "decimal? costUsd = prices.TryGetValue(model, out var pr)", c: P.codeKey }],
    [{ t: "    ? Math.Round(promptTokens / 1000m * pr.In", c: P.darktext }],
    [{ t: "                + completionTokens / 1000m * pr.Out, 6)", c: P.darktext }],
    [{ t: "    : null;", c: P.codeNum }],
  ] });
  D.tile(s, { x: MX, y: 4.05, w: 5.85, h: 1.75, title: "null, а не нуль",
    body: "нуль — брехня «запит був безкоштовний»; null — чесне «не знаємо», яке легко знайти запитом", tone: "crit" });
  D.tile(s, { x: 6.87, y: 4.05, w: 5.85, h: 1.75, title: "Округлення до 6 знаків",
    body: "збігається з типом колонки NUMERIC(10,6); неузгоджене округлення дає розбіжність із рахунком", tone: "good" });
}

{
  const s = D.slide({ num: "05", title: "Один запит користувача — це не один виклик моделі", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.05, w: 12.1, h: 0.8, size: 11, items: [
    { label: "ретрай (урок 7)" }, { label: "fallback (урок 7)", tone: "warn" }, { label: "tool-цикл (урок 6)" }, { label: "класифікатор (уроки 3 і 8)" }] });
  D.stat(s, { x: MX, y: 3.2, w: 3.9, h: 1.5, value: "1 → 4", label: "одне питання — до чотирьох викликів і чотирьох рядків лога", tone: "crit", size: 34 });
  D.band(s, { x: 4.72, y: 3.2, w: 8.0, h: 1.5, tone: "warn",
    text: "AVG по рядках рахує виклик, а не звернення — помилка завжди в бік «дешево»." });
  D.band(s, { x: MX, y: 5.0, w: 12.1, h: 1.35, tone: "good", label: "Принцип: ключ звернення ≠ ключ виклику",
    text: "Групуйте за зверненням, не за рядком лога — інакше цифра занижена." });
}

{
  const s = D.slide({ num: "05", title: "Скільки коштує результат, а не токен", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.95, w: 5.85, h: 1.6, title: "Ціна вирішеного звернення",
    body: "облік по request_id + ознака результату (ескалація сталася чи ні) — і цифра готова", tone: "acc" });
  D.tile(s, { x: 6.87, y: 1.95, w: 5.85, h: 1.6, title: "Мова, зрозуміла керівництву",
    body: "«N звернень на тиждень по X центів — проти Y хвилин оператора»" });
  // Сто звернень діляться на вирішені й ескальовані, і саме друга частина коштує
  // грошей. Поки це текст, дешева модель виглядає вигідною; на смузі — ні.
  {
    const by = 3.86, bh = 0.5, W = 12.1;
    [[0.72, P.good, "72 вирішено ботом  ·  $0.90"],
     [0.28, P.crit, "28 на оператора  ·  $46"],
    ].reduce((cx, [f, bg, lbl]) => {
      s.addShape("rect", { x: cx, y: by, w: W * f, h: bh, fill: { color: bg }, line: { type: "none" } });
      s.addText(lbl, { x: cx, y: by, w: W * f, h: bh, align: "center", valign: "middle",
        fontFace: F.mono, fontSize: 9.5, bold: true, color: P.onink, margin: 0 });
      return cx + W * f;
    }, MX);
    s.addText("сто звернень за день", { x: MX, y: by - 0.28, w: 5, h: 0.22,
      fontFace: F.mono, fontSize: 8.5, color: P.faint, charSpacing: 1, margin: 0 });
  }
  D.band(s, { x: MX, y: 4.66, w: 12.1, h: 1.5, tone: "crit", label: "Як чесно порівняти дешеву модель із сильною",
    text: "Дешева модель, яка вдвічі частіше ескалює на людину, не економить нічого: ви зменшили ціну виклику і збільшили ціну результату. Порівнювати прайси безглуздо — порівнюйте вартість вирішеного звернення." });
}

{
  const s = D.slide({ num: "06", title: "Атрибуція важливіша за суму", pill: "absorb", notes: N() });
  D.stat(s, { x: MX, y: 1.9, w: 3.0, h: 1.5, value: "$400", label: "тривога без дії", tone: "crit", size: 36 });
  D.stat(s, { x: 3.82, y: 1.9, w: 8.9, h: 1.5, value: "$310 — ескалації на strong", label: "третина могла піти на mini: рішення з порахованим ефектом", tone: "good", size: 28 });
  D.code(s, { x: MX, y: 3.6, w: 6.9, h: 1.75, size: 11, lines: [
    [{ t: "-- за моделлю: чи дороге дістається складному?", c: P.dim }],
    [{ t: "SELECT model, count(*), SUM(cost_usd)", c: P.codeKey }],
    [{ t: "  FROM requests GROUP BY model;", c: P.darktext }],
    [{ t: "-- за днем: тренд і сплески", c: P.dim }],
    [{ t: "SELECT created_at::date, SUM(cost_usd) …", c: P.codeKey }],
  ] });
  D.band(s, { x: 7.85, y: 3.6, w: 4.87, h: 1.75, tone: "acc",
    text: "Записали в момент запиту — зріз коштує один GROUP BY. Ні — вже ніколи." });
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 0.85, tone: "crit", label: "Типова помилка",
    text: "Міняти промпт наосліп: спершу зріз по лозі, потім зміна, потім той самий зріз." });
}

{
  const s = D.slide({ num: "07", title: "GET /cost: бюджет поруч із витратою", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 7.2, h: 2.2, size: 11.5, lines: [
    [{ t: "// SELECT COALESCE(SUM(cost_usd), 0) FROM requests", c: P.dim }],
    [{ t: "//  WHERE created_at::date = CURRENT_DATE", c: P.dim }],
    [{ t: "return Results.Json(new {", c: P.codeKey }],
    [{ t: "    today_usd  = Math.Round(today, 4),", c: P.darktext }],
    [{ t: "    budget_usd = 5.0 });", c: P.darktext }],
  ] });
  s.addShape("roundRect", { x: 8.2, y: 1.9, w: 4.52, h: 2.2, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  s.addText("ВАРТІСТЬ СЬОГОДНІ", { x: 8.45, y: 2.1, w: 4.0, h: 0.3, fontFace: F.mono, fontSize: 9.5, bold: true, color: P.faint, charSpacing: 1, margin: 0 });
  s.addText("$0.00 / $5.00", { x: 8.45, y: 2.45, w: 4.0, h: 0.75, fontFace: F.body, fontSize: 30, bold: true, color: P.acc, margin: 0 });
  s.addText("плитка була «—» з уроку 1 — тепер жива", { x: 8.45, y: 3.25, w: 4.0, h: 0.6, fontFace: F.body, fontSize: 11.5, color: P.soft, margin: 0 });
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.0, tone: "warn", label: "Консоль округлює до центів",
    text: "/cost віддає точне значення; на mock плитка часто показує $0.00 — це не баг, а округлення дрібних сум." });
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 0.85, tone: "good",
    text: "Бюджет поруч із витратою перетворює число на сигнал: без нього сума нічого не означає." });
}

{
  const s = D.slide({ num: "08", title: "Routing × cost: важіль стає видимим", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 0.8, size: 12.5, lines: [
    [{ t: "SELECT model, cost_usd FROM requests ORDER BY created_at DESC LIMIT 2;", c: P.codeKey }],
  ] });
  D.bars(s, { x: MX + 0.4, y: 3.0, w: 11.3, labelW: 2.6, noteW: 3.2, rowH: 0.55, gap: 0.3, rows: [
    { label: "FAQ → mock-mini", value: 1, note: "дешевий маршрут", tone: "good" },
    { label: "ескалація → strong", value: 8, note: "помітно дорожче при тій самій довжині", tone: "crit" },
  ] });
  D.band(s, { x: MX, y: 4.55, w: 12.1, h: 1.0, tone: "acc",
    text: "Приберіть роутер — весь трафік піде на strong. Помножте різницю на добовий обсяг: тепер вона порахована, а не відчута." });
  D.band(s, { x: MX, y: 5.75, w: 12.1, h: 0.85, tone: "good", label: "Головний висновок тижня",
    text: "Маршрутизація — не «оптимізація по відчуттю», а рішення з ціною, яку видно в лозі." });
}

{
  const s = D.slide({ num: "09", title: "Budget-політика: що робити при 80%", pill: "absorb", opt: true, notes: N() });
  D.layers(s, { x: MX, y: 2.0, w: 12.1, h: 0.78, gap: 0.16, items: [
    { label: "Алерт", body: "при 80% бюджету — подія в лог; найм'якше і найчастіше достатнє" },
    { label: "Деградація", body: "вище порогу неескалаційний трафік іде на дешевшу модель", tone: "warn" },
    { label: "Відсікання", body: "не-критичні запити отримують заготовлену відповідь без походу в модель", tone: "crit" },
  ] });
  // Три реакції — це не перелік, а драбина на шкалі бюджету. Список подає їх як
  // рівноцінні варіанти; шкала показує, що вмикається послідовно і коли саме.
  {
    const by = 4.88, bh = 0.44, W = 12.1;
    [[0.80, P.good], [0.12, P.warn], [0.08, P.crit]].reduce((cx, [frac, bg]) => {
      s.addShape("rect", { x: cx, y: by, w: W * frac, h: bh, fill: { color: bg }, line: { type: "none" } });
      return cx + W * frac;
    }, MX);
    // Порогові риски — білим по смузі: на власній заливці сегмента вони видні,
    // а семантичним кольором зливалися б із ним.
    [[0.80], [0.92]].forEach(([f]) =>
      s.addShape("line", { x: MX + W * f, y: by - 0.08, w: 0, h: bh + 0.16, line: { color: P.onink, width: 1.5 } }));
    s.addText([{ text: "витрачений бюджет місяця:  ", options: { color: P.faint } },
               { text: "до 80% — норма", options: { color: P.good, bold: true } },
               { text: "   ·   ", options: { color: P.faint } },
               { text: "80% — алерт", options: { color: P.warn, bold: true } },
               { text: "   ·   ", options: { color: P.faint } },
               { text: "92% — деградація", options: { color: P.crit, bold: true } },
               { text: "   ·   ", options: { color: P.faint } },
               { text: "100% — відсікання", options: { color: P.crit, bold: true } }],
      { x: MX, y: by + bh + 0.1, w: 12.1, h: 0.26, fontFace: F.mono, fontSize: 9, margin: 0 });
  }
  D.band(s, { x: MX, y: 5.72, w: 12.1, h: 0.95, tone: "acc", label: "Форма важливіша за механізм",
    text: "Умова на цифрі з лога → зміна поведінки control plane. Це шаблон, у який далі ляжуть і fallback (W4), і гейт якості (W6)." });
}

// ─── РОЗДІЛЮВАЧ · практика ───
{
  D.divider({ big: "ПРАКТИКА", sub: "стенд наживо — і чесна межа того, що він доводить",
    pill: "Лабораторна: чотири частини + опційна", notes: N() });
}

{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["прайс у коді сервісу", "mock-mini і mock-strong, чотири числа"],
   ["питання обох типів", "звичайне та ескалація — роутер розводить"],
   ["SELECT model, cost_usd", "в ескалації цифра помітно більша"],
   ["плитка «Вартість сьогодні»", "жива: $… / $5.00 замість «—»"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 2) * 6.25, y: 1.9 + Math.floor(i / 2) * 1.8, w: 6.05, h: 1.6, badge: i + 1, title: t, body: b, tone: "good" }));
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити гроші в момент відповіді, а не в рахунку наприкінці місяця — і вперше побачити важіль роутингу порахованим у доларах." });
}

{
  const s = D.slide({ title: "Лабораторна: чотири частини + опційна", pill: "do", notes: N() });
  [["Завести прайс", "словник цін поруч із Route() у service/Program.cs", false],
   ["Порахувати вартість", "три рядки після відповіді → cost_usd у LogRequest", false],
   ["Перевірити атрибуцію", "GROUP BY model і за днем: цифри сходяться з очікуванням", false],
   ["Оживити /cost", "SUM за сьогодні + бюджет → плитка в консолі", false],
   ["Budget-політика · опційно", "алерт при 80% або деградація на дешевшу модель", true],
  ].forEach(([t, b, opt], i) => {
    const y = 2.0 + i * 0.92;
    s.addShape("ellipse", { x: MX, y, w: 0.5, h: 0.5, fill: { color: opt ? P.warn : P.acc }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 13, bold: true, color: opt ? P.warnbg : P.acctint, margin: 0 });
    s.addText([{ text: t + "  ", options: { bold: true, fontSize: 14, color: opt ? P.warn : P.ink } },
               { text: b, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.68, y, w: 11.4, h: 0.5, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

// ─── РОЗДІЛЮВАЧ · рефлексія ───
{
  D.divider({ big: "РЕФЛЕКСІЯ", sub: "що це довело · перевір себе · антипатерни тижня", notes: N() });
}

{
  const s = D.slide({ title: "Що це довело", pill: "connect", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.35, title: "Гроші видно одразу", body: "cost_usd з'являється разом із відповіддю, а не в рахунку", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.35, title: "Важіль порахований", body: "різниця маршрутів — у доларах, а не у відчуттях", tone: "acc" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.35, title: "Бюджет — сигнал", body: "плитка порівнює витрату з межею, а не показує абстрактну суму" });
  D.band(s, { x: MX, y: 4.70, w: 12.1, h: 1.75, tone: "card",
    text: "Тиждень «Routing + cost» закрито: трафік розведений і порахований. Далі — найдешевший запит із можливих: той, якого не було." });
}

{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 4.00, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, h: 3.20, size: 14, items: [
    "cost_usd заповнений ненульовими значеннями",
    "ескалація дорожча за FAQ — видно SELECT'ом",
    "GET /cost повертає today_usd і budget_usd",
    "поясню, чому звернення ≠ виклик",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 6.20, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Нуль замість null у cost_usd", "«безкоштовний запит» — брехня, яку неможливо знайти запитом"],
   ["AVG по рядках лога", "рахує вартість виклику, а не звернення — завжди в бік «дешево»"],
   ["Прайс у голові або в вікі", "застаріла ціна викривляє всі рішення, а не одне"],
   ["Сума без атрибуції", "«$400 цього місяця» не підказує жодної дії"],
  ].forEach(([t, b], i) => {
    const y = 2.0 + i * 1.0;
    s.addShape("roundRect", { x: MX, y, w: 12.1, h: 0.85, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.22, y: y + 0.21, w: 0.42, h: 0.42, fill: { color: P.critbg }, line: { color: P.crit, width: 1 } });
    D.cross(s, { x: MX + 0.22, y: y + 0.21, size: 0.42, color: P.crit });
    s.addText([{ text: t + "   ", options: { bold: true, fontSize: 13.5, color: P.ink } },
               { text: b, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.8, y, w: 11.1, h: 0.85, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

{
  const s = D.slide({ title: "Домашнє завдання", pill: "do", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.85, w: 12.1, h: 2.55, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("Обов'язково · ДЗ тижня 2: routing + cost", { x: MX + 0.3, y: 2.05, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15.5, bold: true, color: P.acc, margin: 0 });
  s.addText("Обидва уроки тижня здаються одним PR: маршрутизація з уроку 3 плюс сьогоднішній облік вартості.",
    { x: MX + 0.3, y: 2.5, w: 11.5, h: 0.35, fontFace: F.body, fontSize: 12.5, color: P.ink, margin: 0 });
  s.addText("КРИТЕРІЇ ПРИЙМАННЯ КОРОТКО", { x: MX + 0.3, y: 3.0, w: 11.5, h: 0.28, fontFace: F.mono, fontSize: 9.5, bold: true, color: P.faint, charSpacing: 1, margin: 0 });
  ["звичайне питання і ескалація дають різні моделі в requests",
   "cost_usd заповнюється ненульовими значеннями",
   "GET /cost повертає { today_usd, budget_usd } і плитка в консолі жива",
  ].forEach((t, i) => s.addText([{ text: "•  ", options: { color: P.acc, bold: true } }, { text: t, options: { color: P.ink } }],
    { x: MX + 0.3, y: 3.35 + i * 0.32, w: 11.5, h: 0.3, fontFace: F.body, fontSize: 12.5, margin: 0 }));
  D.tile(s, { x: MX, y: 4.7, w: 12.1, h: 1.5, title: "Опційно (не оцінюється)", tone: "warn",
    body: "• budget-політика: при 80% бюджету — алерт у лог або деградація на дешевшу модель\n• третій маршрут — окремий tier для FAQ, ескалацій і «всього іншого»" });
}

D.closingSlide({
  summary: [
    "вартість з'являється в момент відповіді, а не в рахунку наприкінці місяця",
    "usage — єдине джерело правди; вхідні й вихідні токени рахуються окремо",
    "прайс живе поруч із точкою рішення: ціна моделі — вхідний параметр вибору",
    "звернення ≠ виклик: одне питання дає до чотирьох рядків лога",
    "атрибуція важливіша за суму: «$310 на ескалаціях» веде до дії, «$400» — ні",
  ],
  nextTitle: "Наступний крок → Урок 5 · Кешування: точний кеш, метрика і semantic cache",
  nextBody: "Ми навчилися платити менше за той самий трафік. Наступний крок радикальніший: найдешевший запит — той, якого не було. Тиждень 3 починаємо з кешу: коли можна не ходити в модель узагалі і чому кеш без метрики — це віра, а не інженерія.",
  notes: N(),
});

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L04.pptx"), path.join(OUT, "L04-script.md"));
