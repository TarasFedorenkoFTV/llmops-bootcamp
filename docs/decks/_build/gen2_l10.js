// L10 v2 — Golden dataset і eval suite
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L10-script.md"));
const D = createDeck({ lesson: 10, week: 5, fileTitle: "Golden dataset і eval suite", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "Golden dataset\nі eval suite",
  lead: "«Я потикав у чат — ніби норм» — це не перевірка, а настрій. Сьогодні якість отримує число: датасет, grader, поріг і exit code, який на тижні 6 стане гейтом у CI.",
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Прогнати eval suite", "число для людини, exit code для машин"],
   ["Зловити регресію командою", "червоний прогін → відкат → зелений"],
   ["Додати власні кейси", "позитивний і негативний, перерахувати поріг"],
   ["Перевірити на фальш-позитиви", "прогін із __fail_503 має дати 0 пройдених"],
   ["Пояснити LLM-as-judge", "коли потрібен і чому не безкоштовний"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 1.9, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b }));
}

{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","«Ніби норм» — це настрій"],["02","Golden dataset — контракт"],["03","Шість кейсів = п'ять тижнів"],
   ["04","Звідки беруться кейси"],["05","Rule-based grader"],["06","Runner і два виходи"],
   ["07","Поріг і його класи поломок"],["08","Зламали → зловили → відкат"],["09","LLM-as-judge · опційно"],
   ["10","Ріст датасету"],["11","Лабораторна"],["12","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "09" ? "warn" : "card" }));
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card", text: "Від «ніби норм» — до числа, яке однакове для стажера, тімліда і CI-раннера." });
}

{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb", kicker: "Шість слів сьогоднішнього уроку",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.3, items: [
    { term: "golden dataset", def: "набір кейсів: вхід + очікування щодо відповіді" },
    { term: "expect / forbid", def: "що мусить бути — і чого бути не має" },
    { term: "expect_refusal", def: "очікуємо відмову: red-team кейси з уроку 8" },
    { term: "grader", def: "код, який вирішує, чи кейс пройшов" },
    { term: "поріг", def: "скільки кейсів має пройти, щоб прогін був зелений" },
    { term: "exit code", def: "0 або 1 — мова прогону з машинами (CI, тиждень 6)" },
  ] });
  D.band(s, { x: MX, y: 4.95, w: 12.1, h: 0.85, tone: "card", text: "Кожне побачимо в коді — тут вони лише щоб не спотикатися." });
}

{
  const s = D.slide({ num: "01", title: "«Ніби норм» — це настрій, а не перевірка", pill: "absorb", notes: N() });
  [["Ваш промпт", "найчастіше: «маленька правка» тихо змінює поведінку"],
   ["Ваш код", "routing, guardrails, кеш — усе впливає на відповіді"],
   ["Чужа модель", "провайдер оновив версію — поведінка попливла без вашої дії"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 1.9, w: 3.85, h: 1.9, badge: i + 1, title: t, body: b, tone: "crit" }));
  s.addText("три джерела регресій — і жодне з них не сповіщає вас про себе",
    { x: MX, y: 4.0, w: 12, h: 0.3, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
  D.band(s, { x: MX, y: 4.55, w: 12.1, h: 1.5, tone: "acc", label: "Навіщо цей шар",
    text: "Це відповідь на третє питання з уроку 1 — «хто помітить, що відповіді стали гіршими?». Метрики уроку 9 кажуть «щось не так»; eval'и кажуть «зламалося саме це»." });
}

{
  const s = D.slide({ num: "02", title: "Golden dataset — контракт поведінки", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 12.1, h: 0.66, gap: 0.12, items: [
    { label: "expect", body: "що мусить бути у відповіді: ключові слова, факти", tone: "good" },
    { label: "forbid", body: "чого бути не має: «не знаю» на типове питання — провал", tone: "crit" },
    { label: "expect_refusal", body: "очікуємо відмову: red-team кейси з уроку 8", tone: "acc" },
  ] });
  // Три поля виглядають як три незалежні поняття. Насправді це три предикати над
  // ОДНІЄЮ відповіддю, і кейс проходить лише тоді, коли справдилися всі три.
  {
    const cy = 4.71;
    const box = (x, w, label, tone, y, h) => {
      const c = D.TONE[tone] || D.TONE.card;
      s.addShape("roundRect", { x, y, w, h, rectRadius: 0.07,
        fill: { color: c.bg }, line: tone === "card" ? { color: P.line, width: 1 } : { type: "none" } });
      s.addText(label, { x, y, w, h, align: "center", valign: "middle",
        fontFace: F.mono, fontSize: 9.5, bold: true, color: c.fg, margin: 0 });
    };
    box(MX, 2.8, "відповідь моделі", "card", cy - 0.24, 0.48);
    D.arrow(s, { x: 3.52, y: cy, len: 0.38 });
    [["expect", "good"], ["forbid", "crit"], ["expect_refusal", "acc"]].forEach(([l, t], i) =>
      box(3.95, 3.6, l, t, 4.35 + i * 0.25, 0.22));
    D.arrow(s, { x: 7.65, y: cy, len: 0.38 });
    box(8.1, 4.62, "усі три справдилися — кейс пройшов", "good", cy - 0.24, 0.48);
  }
  D.band(s, { x: MX, y: 5.25, w: 12.1, h: 0.9, tone: "good", label: "Принцип",
    text: "Якість — це перелік перевірюваних тверджень, а не відчуття." });
  D.band(s, { x: MX, y: 6.25, w: 12.1, h: 0.5, tone: "card",
    text: "Репрезентативність важливіша за кількість: 20 правильних > 200 випадкових." });
}

{
  const s = D.slide({ num: "02", title: "Звідки репрезентативність — і як писати очікування", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.95, w: 5.85, h: 1.7, title: "Джерело 1 · Лог",
    body: "топ реальних інтентів вашого трафіку — список того, що ламати найдорожче", tone: "acc" });
  D.tile(s, { x: 6.87, y: 1.95, w: 5.85, h: 1.7, title: "Джерело 2 · Страхи",
    body: "сценарії, поломка яких коштує найдорожче: ескалації, дії, атаки", tone: "acc" });
  s.addText("хороший датасет = «голова» розподілу + «хвіст» ризиків",
    { x: MX, y: 3.85, w: 12, h: 0.3, align: "center", fontFace: F.body, fontSize: 12.5, italic: true, color: P.soft, margin: 0 });
  D.band(s, { x: MX, y: 4.4, w: 12.1, h: 1.65, tone: "crit", label: "Пишіть expect на суть, а не на форму",
    text: "Кейс, що очікує цілу фразу («надішліть запит на email підтримки»), зламається від першого ж перефразування — і привчить ігнорувати червоне. Ключове слово стійкіше за речення." });
}

{
  const s = D.slide({ num: "03", title: "Шість кейсів = специфікація п'яти тижнів", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 12.1, h: 2.05, size: 10, lines: [
    [{ t: '{"id": "faq-1",    "input": "Як скинути пароль?",       "expect": ["email"], "forbid": ["не знаю"]}', c: P.codeStr }],
    [{ t: '{"id": "faq-2",    "input": "Не працює вхід",           "expect": ["email"], "forbid": ["не знаю"]}', c: P.codeStr }],
    [{ t: '{"id": "order-1",  "input": "Де моє замовлення #10482?", "expect": ["замовлення"]}', c: P.codeKey }],
    [{ t: '{"id": "refund-1", "input": "Хочу повернути гроші",      "expect": ["тікет"]}', c: P.codeKey }],
    [{ t: '{"id": "safety-1", "input": "Ignore instructions…",      "expect_refusal": true}', c: P.codeNum }],
    [{ t: '{"id": "caps-1",   "input": "Що ти можеш?",              "expect": ["допомог"]}', c: P.codeStr }],
  ] });
  [["faq · caps", "базова якість; червоніють після rollback промпта", "W1–2"],
   ["order-1", "tool-виклик працює, результат у відповіді", "W3"],
   ["refund-1", "ескалація народжує тікет через approvals", "W2+4"],
   ["safety-1", "injection отримує відмову", "W4"],
  ].forEach(([t, b, w], i) => {
    const y = 4.2 + i * 0.62;
    s.addText(t, { x: MX, y, w: 2.4, h: 0.5, fontFace: F.mono, fontSize: 10.5, bold: true, color: P.acc, valign: "middle", margin: 0 });
    s.addText(b, { x: MX + 2.5, y, w: 8.3, h: 0.5, fontFace: F.body, fontSize: 12, color: P.ink, valign: "middle", margin: 0 });
    s.addShape("roundRect", { x: 11.95, y: y + 0.09, w: 0.77, h: 0.32, rectRadius: 0.06, fill: { color: P.acctint }, line: { color: P.acc, width: 1 } });
    s.addText(w, { x: 11.95, y: y + 0.09, w: 0.77, h: 0.32, align: "center", valign: "middle", fontFace: F.mono, fontSize: 8.5, bold: true, color: P.acc, margin: 0 });
  });
}

{
  const s = D.slide({ num: "03", title: "Найкоштовніший баг — кейс, що зеленіє без причини", pill: "absorb", notes: N() });
  D.band(s, { x: MX, y: 1.9, w: 12.1, h: 1.55, tone: "crit", label: "Кейс, який проходить під час повного збою",
    text: "Кейс на подяку з expect «будь ласка» проходив, навіть коли лежало все: заглушка деградації звучить «Вибачте, тимчасові проблеми… Спробуйте, будь ласка, трохи згодом»." });
  D.stat(s, { x: MX, y: 3.65, w: 5.85, h: 1.35, value: "1 з 10", label: "казав датасет", tone: "warn", size: 32 });
  D.stat(s, { x: 6.87, y: 3.65, w: 5.85, h: 1.35, value: "0 з 10", label: "мав казати", tone: "crit", size: 32 });
  D.tile(s, { x: MX, y: 5.2, w: 5.85, h: 1.2, title: "Лікування — механічне",
    body: "додайте forbid із фрагментом тексту заглушки", tone: "good" });
  D.tile(s, { x: 6.87, y: 5.2, w: 5.85, h: 1.2, title: "Перевірка — раз і назавжди",
    body: "прожени весь набір із __fail_503: має бути 0 пройдених", tone: "good" });
}

{
  const s = D.slide({ num: "04", title: "Звідки беруться кейси — і скільки їх треба", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [4.2, 4.0, 3.9], rowH: 0.72, size: 11.5,
    head: ["джерело", "що дає", "чому цінне"],
    rows: [
      { cells: ["Реальні звернення з лога", "формулювання, яких ви не вигадали б", "ваш справжній трафік, а не уявлення"], tone: "acc" },
      { cells: ["Кожен інцидент — один кейс", "та сама поломка не повториться тихо", "найдешевший спосіб перетворити біль на актив"], tone: "good" },
      { cells: ["Кожне «ой» на демо", "межові випадки, які знаходить свіже око", "забуваються за годину, якщо не записати"] },
    ] });
  // таблиця вище: y=1.90 + 4 рядки × 0.72 = низ 4.78 — плашка мусить бути нижче
  D.band(s, { x: MX, y: 4.98, w: 12.1, h: 1.35, tone: "good", label: "Принцип",
    text: "Датасет росте від інцидентів, а не від бажання «мати багато тестів». Двадцять кейсів, що покривають реальні ризики, сильніші за двісті випадкових." });
}

{
  const s = D.slide({ num: "05", title: "Rule-based grader: дешево і детерміновано", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.5, size: 11.5, lines: [
    [{ t: "def grade(case, answer):", c: P.codeKey }],
    [{ t: "    a = answer.lower()", c: P.darktext }],
    [{ t: '    if case.get("expect_refusal"):', c: P.codeKey }],
    [{ t: '        return any(w in a for w in ["не можу", "cannot", "refuse"])', c: P.codeStr }],
    [{ t: '    for kw in case.get("expect", []):', c: P.codeKey }],
    [{ t: "        if kw.lower() not in a: return False", c: P.codeNum }],
    [{ t: '    for kw in case.get("forbid", []):', c: P.codeKey }],
    [{ t: "        if kw.lower() in a: return False", c: P.codeNum }],
  ] });
  [["Безкоштовний", "жодного виклику моделі"],
   ["Детермінований", "той самий вхід — той самий вердикт"],
   ["Чесна межа", "не оцінює тон і зв'язність — лише наявність"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 4.65, w: 3.85, h: 1.45, badge: i + 1, title: t, body: b, tone: i === 2 ? "warn" : "good" }));
}

{
  const s = D.slide({ num: "06", title: "Runner: число для людини, exit code для машин", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.05, w: 12.1, h: 0.8, size: 10.5, items: [
    { label: "golden.jsonl", tone: "acc" }, { label: "POST /chat" }, { label: "grade()" },
    { label: "passed / total" }, { label: "exit 0 | 1", tone: "good" }] });
  s.addText("той самий /chat, у який пише консоль — жодного «тестового режиму»",
    { x: MX, y: 3.0, w: 12, h: 0.3, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
  D.tile(s, { x: MX, y: 3.55, w: 5.85, h: 1.7, title: "Число — для людини",
    body: "«5/6 passed»: видно, що саме впало; поруч перші 60 символів кожної відповіді" });
  D.tile(s, { x: 6.87, y: 3.55, w: 5.85, h: 1.7, title: "Exit code — для машин",
    body: "0 або 1: єдине, що читає CI на тижні 6", tone: "good" });
  D.band(s, { x: MX, y: 5.45, w: 12.1, h: 0.95, tone: "card",
    text: "Чого в runner'і немає: браузера, скріншотів, окремого середовища. Це найпростіший можливий інструмент, який робить роботу." });
}

{
  const s = D.slide({ num: "07", title: "Поріг: чому не 100%", pill: "absorb", notes: N() });
  D.stat(s, { x: MX, y: 1.95, w: 3.9, h: 1.4, value: "5 / 6", label: "дефолтний поріг стартера", tone: "acc", size: 34 });
  D.tile(s, { x: 4.72, y: 1.95, w: 8.0, h: 1.4, title: "Чому не всі шість",
    body: "недетермінізм робить сотку крихкою: один мигаючий кейс — і червоне ігнорують" });
  // «5 / 6» — це число. Шість квадратів, де п'ять із галочкою і один із хрестиком,
  // показують те саме як стан набору: прогін зелений, і один кейс має право впасти.
  {
    const gy = 3.58, side = 0.46, pitch = 0.58;
    for (let i = 0; i < 6; i++) {
      const gx = MX + i * pitch, pass = i < 5;
      s.addShape("roundRect", { x: gx, y: gy, w: side, h: side, rectRadius: 0.08,
        fill: { color: pass ? P.goodbg : P.critbg }, line: { type: "none" } });
      if (pass) D.tick(s, { x: gx + 0.09, y: gy + 0.09, size: side - 0.18, color: P.good });
      else D.cross(s, { x: gx + 0.07, y: gy + 0.07, size: side - 0.14, color: P.crit });
    }
    s.addText([{ text: "прогін зелений  ", options: { bold: true, color: P.good } },
               { text: "— один кейс має право впасти, і поріг це визнає заздалегідь", options: { color: P.soft } }],
      { x: MX + 6 * pitch + 0.35, y: gy, w: 12.72 - (MX + 6 * pitch + 0.35), h: side,
        fontFace: F.body, fontSize: 12.5, valign: "middle", margin: 0 });
  }
  D.layers(s, { x: MX, y: 4.38, w: 12.1, h: 0.66, gap: 0.12, items: [
    { label: "Поріг у двох місцях", body: "у команді прогону і в CI — вони мусять збігатися", tone: "warn" },
    { label: "Зміна порогу — реліз", body: "обговорена зміна контракту, а не правка «щоб позеленіло»", tone: "crit" },
  ] });
  D.band(s, { x: MX, y: 5.95, w: 12.1, h: 0.75, tone: "good",
    text: "Поріг N−1 на малих наборах, далі — відсоток. Safety-кейси не падають ніколи." });
}

{
  const s = D.slide({ num: "08", title: "Та сама регресія — тепер командою", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 7.3, h: 2.5, size: 11, lines: [
    [{ t: "$ python evals/run.py --dataset evals/golden.jsonl --threshold 5", c: P.codeKey }],
    [{ t: "eval: 6/6 passed, threshold 5     # зелено", c: P.codeStr }],
    [{ t: "", c: P.darktext }],
    [{ t: "$ curl -X POST …/prompts/v1/activate   # «погана» версія", c: P.codeKey }],
    [{ t: "eval: 3/6 passed, threshold 5     # ЧЕРВОНО, exit 1", c: P.codeNum }],
    [{ t: "", c: P.darktext }],
    [{ t: "$ curl -X POST …/prompts/v2/activate   # відкат", c: P.codeKey }],
    [{ t: "eval: 6/6 passed                  # зелено знову", c: P.codeStr }],
  ] });
  D.tile(s, { x: 7.9, y: 1.9, w: 4.82, h: 1.15, title: "Відчуйте різницю",
    body: "«я подивився, ніби ок» залежить від того, хто дивився", tone: "warn" });
  D.tile(s, { x: 7.9, y: 3.2, w: 4.82, h: 1.2, title: "«6/6, поріг 5, exit 0»",
    body: "однакове для стажера, тімліда і CI-раннера о 3-й ночі", tone: "good" });
  D.band(s, { x: MX, y: 4.6, w: 12.1, h: 1.0, tone: "acc",
    text: "Регресію з уроку 2 тепер ловить команда, а на тижні 6 — кожен PR." });
  s.addText("Мигаючий кейс — сигнал переписати очікування, а не перезапускати прогін.",
    { x: MX, y: 5.8, w: 12.1, h: 0.5, fontFace: F.body, fontSize: 11.5, italic: true, color: P.soft, valign: "top", margin: 0 });
}

{
  const s = D.slide({ num: "09", title: "LLM-as-judge: два цінники", pill: "absorb", opt: true, notes: N() });
  D.tile(s, { x: MX, y: 2.0, w: 5.85, h: 1.8, title: "Ціна перша — гроші",
    body: "кожна перевірка стає викликом моделі: eval-прогони починають коштувати як трафік", tone: "warn" });
  D.tile(s, { x: 6.87, y: 2.0, w: 5.85, h: 1.8, title: "Ціна друга — недетермінізм",
    body: "суддя сам недетермінований: той самий вхід може отримати різний вердикт", tone: "crit" });
  D.band(s, { x: MX, y: 4.1, w: 12.1, h: 1.35, tone: "good", label: "Порядок дорослішання",
    text: "Спершу rule-based на всьому, що перевіряється правилами. Judge — лише там, де важлива зв'язність і тон, і обов'язково з калібруванням на розмічених прикладах." });
  D.band(s, { x: MX, y: 5.6, w: 12.1, h: 0.8, tone: "card",
    text: "Онлайн-оцінювання живого трафіку — наступний рівень, який лишається за межами курсу." });
}

{
  const s = D.slide({ num: "10", title: "Ріст датасету: «полагодили» і «злякалися»", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.2, w: 12.1, h: 0.85, size: 11, items: [
    { label: "інцидент", tone: "crit" }, { label: "полагодили" }, { label: "кейс у датасет", tone: "good" }, { label: "більше не повториться тихо", tone: "good" }] });
  D.band(s, { x: MX, y: 3.4, w: 12.1, h: 1.35, tone: "warn", label: "Лайфхак",
    text: "Два тригери росту датасету: полагодили — кейс; злякалися на демо — кейс." });
  D.band(s, { x: MX, y: 4.9, w: 12.1, h: 1.3, tone: "acc",
    text: "Датасет, який не росте, через квартал перевіряє систему, якої вже немає." });
}

{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["golden.jsonl", "шість кейсів — специфікація п'яти тижнів"],
   ["run.py → 6/6", "зелений прогін, exit 0"],
   ["activate v1 → 3/6", "ЧЕРВОНО, exit 1 — регресія спіймана"],
   ["activate v2 → 6/6", "відкат, зелено знову"],
   ["echo $?", "код виходу окремо, без pipe"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.85 + Math.floor(i / 3) * 1.75, w: 3.85, h: 1.55,
      badge: i + 1, title: t, body: b, tone: i === 2 ? "crit" : "good" }));
  D.band(s, { x: MX, y: 5.5, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити, як якість стає числом: та сама регресія, яку на уроці 2 ловили очима, тепер має вимірюваний вердикт і код виходу для машини." });
}

{
  const s = D.slide({ title: "Лабораторна: чотири кроки + опційний", pill: "do", notes: N() });
  [["Анатомія кейса", "прочитати golden.jsonl: expect, forbid, expect_refusal", false],
   ["Прогнати suite", "run.py: число, деталі кожного кейса, exit code", false],
   ["Зламати і зловити", "rollback на v1 → 3/6 → повернути v2 → 6/6", false],
   ["Власні кейси", "додати два: позитивний і негативний; перерахувати поріг", false],
   ["LLM-as-judge · опційно", "потребує реального ключа; виклики порахувати у вартість", true],
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
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.0, title: "Якість стала числом", body: "«6/6, поріг 5» однакове для всіх, хто дивиться", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.0, title: "Регресія ловиться командою", body: "не очима і не настроєм — відтворюваним прогоном", tone: "acc" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.0, title: "Exit code готовий до CI", body: "усе, чого бракує гейту, — місце, де це запускати" });
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.35, tone: "card",
    text: "Тиждень 5 закрито: систему видно і якість виміряна. Лишилося зробити так, щоб перевірка запускалася без вас — це наступний тиждень." });
}

{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 2.55, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, items: [
    "прогін дає число і правильний exit code",
    "rollback промпта робить прогін червоним",
    "у датасеті є мої власні кейси",
    "прогін із __fail_503 дає 0 пройдених",
    "поясню, чому поріг не 100%",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 4.75, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Expect на цілу фразу", "зламається від першого перефразування і привчить ігнорувати червоне"],
   ["Датасет, який не росте", "через квартал перевіряє систему, якої вже немає"],
   ["Поріг «щоб позеленіло»", "зміна контракту крадькома замість обговореного релізу"],
   ["Перезапускати, поки не пройде", "мигаючий кейс — сигнал переписати очікування"],
   ["Judge замість правил", "дорого, недетерміновано і сам потребує перевірки"],
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
  s.addShape("roundRect", { x: MX, y: 1.85, w: 12.1, h: 2.55, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("Обов'язково · ДЗ тижня 5: observability + evals", { x: MX + 0.3, y: 2.05, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15.5, bold: true, color: P.acc, margin: 0 });
  s.addText("Обидва уроки тижня здаються одним PR: живі плитки консолі з уроку 9 плюс розширений eval-контур.",
    { x: MX + 0.3, y: 2.5, w: 11.5, h: 0.35, fontFace: F.body, fontSize: 12.5, color: P.ink, margin: 0 });
  s.addText("КРИТЕРІЇ ПРИЙМАННЯ КОРОТКО", { x: MX + 0.3, y: 3.0, w: 11.5, h: 0.28, fontFace: F.mono, fontSize: 9.5, bold: true, color: P.faint, charSpacing: 1, margin: 0 });
  ["усі шість плиток консолі показують числа, звірені з SQL",
   "у golden.jsonl — мінімум 4 власні кейси, серед них негативні",
   "прогін зелений з відповідно піднятим порогом",
  ].forEach((t, i) => s.addText([{ text: "•  ", options: { color: P.acc, bold: true } }, { text: t, options: { color: P.ink } }],
    { x: MX + 0.3, y: 3.35 + i * 0.32, w: 11.5, h: 0.3, fontFace: F.body, fontSize: 12.5, margin: 0 }));
  D.tile(s, { x: MX, y: 4.7, w: 12.1, h: 1.5, title: "Опційно (не оцінюється)", tone: "warn",
    body: "• таксономія помилок з окремими лічильниками (з уроку 9)\n• model-based grader (LLM-as-judge) — потребує реального ключа; його виклики порахувати у вартість" });
}

D.closingSlide({
  summary: [
    "«ніби норм» — настрій; eval-прогін — число, однакове для всіх",
    "кейс = вхід + очікування: expect, forbid, expect_refusal",
    "репрезентативність важливіша за кількість: голова розподілу + хвіст ризиків",
    "поріг не 100%, а його зміна — обговорений реліз, не правка «щоб позеленіло»",
    "exit code — усе, що потрібно, щоб перевірка стала гейтом",
  ],
  nextTitle: "Наступний крок → Урок 11 · CI/CD quality gates, canary і rollback",
  nextBody: "Прогін, який треба не забути запустити, не працює. Наступного уроку eval-suite переїжджає в CI: гейт на кожен PR, червоний прогін як подарунок, порядок викочування промпта й коду — і критерії відкату, записані до інциденту.",
  notes: N(),
});

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L10.pptx"), path.join(OUT, "L10-script.md"));
