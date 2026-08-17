// L03 v2 — Мультипровайдерний gateway і маршрутизація
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L03-script.md"));
const D = createDeck({ lesson: 3, week: 2, fileTitle: "Мультипровайдерний gateway і маршрутизація моделей", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "Мультипровайдерний gateway\nі маршрутизація моделей",
  lead: "Одна модель на все — найдорожчий і найкрихкіший спосіб жити. Сьогодні сервіс навчиться обирати модель під задачу, а додати провайдера коштуватиме рядків у YAML, а не рефакторингу.",
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Написати Route()", "роутер на десять рядків: ескалації — окремо"],
   ["Пояснити межу ролей", "рішення в сервісі, виконання в адаптері"],
   ["Додати провайдера", "одним YAML-блоком, без зміни коду"],
   ["Розрізнити alias і snapshot", "і пояснити, чому модель пінять"],
   ["Записати fallback-порядок", "політика, що оживе на тижні 4"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 1.9, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b }));
}

{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","Три біди однієї моделі"],["02","Сервіс вирішує, адаптер виконує"],["03","Розтин конфіга; alias vs snapshot"],
   ["04","Route(): одна точка рішення"],["05","Маршрут за задачею"],["06","Ціна самого рішення"],
   ["07","Fallback-порядок як політика"],["08","Додати провайдера без коду"],["09","Tier-система · опційно"],
   ["10","Лабораторна"],["11","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "09" ? "warn" : "card" }));
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card", text: "Від «одна модель на все» — до розведеного трафіку, який видно в базі." });
}

{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb",
    kicker: "Шість слів сьогоднішнього уроку", notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.3, items: [
    { term: "gateway-адаптер", def: "єдиний вихід до провайдерів: виклик, ключі, згладжування API" },
    { term: "роутер · Route()", def: "точка рішення в сервісі: повідомлення → ім'я моделі" },
    { term: "alias", def: "рухома назва «остання версія сімейства»" },
    { term: "snapshot", def: "зафіксована версія з датою чи ідентифікатором" },
    { term: "fallback-порядок", def: "оголошена черга моделей на випадок збою (механізм — W4)" },
    { term: "tier", def: "рівень обслуговування: які питання яку модель отримують" },
  ] });
  D.band(s, { x: MX, y: 4.95, w: 12.1, h: 0.85, tone: "card", text: "Кожне розберемо на місці — тут вони лише щоб не спотикатися." });
}

// ─── РОЗДІЛЮВАЧ · теорія ───
{
  D.divider({ big: "ТЕОРІЯ", sub: "9 блоків — дивимось і розбираємось, руками поки не робимо", notes: N() });
}

{
  const s = D.slide({ num: "01", title: "Три біди однієї моделі", pill: "absorb", notes: N() });
  [["Гроші", "різниця між дешевою і сильною на масовому трафіку — порядок вартості, не «трохи дорожче»", "crit"],
   ["Залежність", "один провайдер — одна точка відмови, яка вам не належить; плану Б не існує теоретично", "crit"],
   ["Несумісність у дрібницях", "«сумісні за стандартом» провайдери розходяться в деталях полів", "warn"],
  ].forEach(([t, b, tone], i) => D.tile(s, { x: MX + i * 4.05, y: 1.9, w: 3.85, h: 2.05, badge: i + 1, title: t, body: b, tone }));
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.5, tone: "acc", label: "Навіщо цей шар",
    text: "Маршрутизація — перший механізм тижня «гроші»: вона розводить трафік за задачами, і саме на ній тримається все, що рахуватимемо наступного уроку." });
}

{
  const s = D.slide({ num: "02", title: "Сервіс вирішує. Адаптер виконує.", pill: "absorb", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.8, w: 5.85, h: 1.9, rectRadius: 0.12, fill: { color: P.accsolid }, line: { type: "none" } });
  s.addText("ВИРІШУЄ", { x: MX + 0.3, y: 1.98, w: 5.2, h: 0.3, fontFace: F.mono, fontSize: 10.5, bold: true, color: "C9C5F2", charSpacing: 2, margin: 0 });
  s.addText("Сервіс", { x: MX + 0.3, y: 2.3, w: 5.2, h: 0.5, fontFace: F.body, fontSize: 24, bold: true, color: "FFFFFF", margin: 0 });
  s.addText("яку модель викликати — код, який можна прочитати, протестувати й залогувати", { x: MX + 0.3, y: 2.85, w: 5.2, h: 0.7, fontFace: F.body, fontSize: 12, color: "DEDAF8", valign: "top", margin: 0 });
  s.addShape("roundRect", { x: 6.87, y: 1.8, w: 5.85, h: 1.9, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  s.addText("ВИКОНУЄ", { x: 7.17, y: 1.98, w: 5.2, h: 0.3, fontFace: F.mono, fontSize: 10.5, bold: true, color: P.faint, charSpacing: 2, margin: 0 });
  s.addText("Адаптер", { x: 7.17, y: 2.3, w: 5.2, h: 0.5, fontFace: F.body, fontSize: 24, bold: true, color: P.ink, margin: 0 });
  s.addText("формат помилок, автентифікація, ліміти на поля — нормалізує адаптер", { x: 7.17, y: 2.85, w: 5.2, h: 0.7, fontFace: F.body, fontSize: 12, color: P.soft, valign: "top", margin: 0 });
  D.band(s, { x: MX, y: 3.95, w: 5.85, h: 1.9, tone: "good", label: "Принцип",
    text: "Рішення — це код. Конфіг чужого інструмента — орендоване рішення." });
  D.band(s, { x: 6.87, y: 3.95, w: 5.85, h: 1.9, tone: "crit", label: "Типова помилка",
    text: "Віддати роутинг адаптеру: механізми переносяться, прапорці — ні." });
}

{
  const s = D.slide({ num: "03", title: "Розтин конфіга: дві «моделі» на одному mock", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 7.0, h: 3.5, size: 11, lines: [
    [{ t: "model_list:", c: P.codeKey }],
    [{ t: "  - model_name: ", c: P.darktext }, { t: "mock-mini", c: P.codeStr }],
    [{ t: "    litellm_params:", c: P.codeKey }],
    [{ t: "      model: openai/mock", c: P.darktext }],
    [{ t: "      api_base: http://mock-provider:9000/v1", c: P.darktext }],
    [{ t: "  - model_name: ", c: P.darktext }, { t: "mock-strong", c: P.codeStr }],
    [{ t: "    litellm_params:   ", c: P.codeKey }, { t: "# той самий mock", c: P.dim }],
    [{ t: "      model: openai/mock", c: P.darktext }],
    [{ t: "litellm_settings:", c: P.codeKey }],
    [{ t: "  drop_params: true", c: P.darktext }],
    [{ t: "  num_retries: 0    ", c: P.darktext }, { t: "# збої йдуть у сервіс", c: P.dim }],
  ] });
  D.tile(s, { x: 7.9, y: 1.85, w: 4.82, h: 1.1, title: "Той самий mock — навмисно", body: "механіка роутингу справжня, рахунок нульовий" });
  D.tile(s, { x: 7.9, y: 3.05, w: 4.82, h: 1.1, title: "drop_params: true", body: "відкидає поля, яких провайдер не приймає", tone: "good" });
  D.tile(s, { x: 7.9, y: 4.25, w: 4.82, h: 1.1, title: "num_retries: 0", body: "збої долітають до сервісу — він і вирішує", tone: "warn" });
  D.band(s, { x: MX, y: 5.65, w: 12.1, h: 0.72, tone: "card", text: "Реальний ключ змінить лише праві частини YAML — код сервісу не побачить різниці." });
}

{
  const s = D.slide({ num: "03", title: "«Модель» за назвою — не та сама модель", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 1.62, title: "Alias — «остання версія сімейства»",
    body: "автоматично отримуєте покращення — і небезпечно тихі зміни поведінки", tone: "warn" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 1.62, title: "Snapshot — зафіксована версія",
    body: "не змінюється під вами, але й не оновлюється сама — і колись її виведуть з обігу", tone: "good" });
  // Відмінність тут часова: snapshot прибитий до точки, alias їде за часом.
  // Двома картками цього не видно — видно на шкалі з кількома випусками.
  {
    const ty = 4.12, nh = 0.36, nw = 2.3;
    s.addShape("line", { x: MX + 0.2, y: ty + nh / 2, w: 11.5, h: 0, line: { color: P.line, width: 1 } });
    ["…-0301", "…-0613", "…-1106"].forEach((name, i) => {
      const nx = MX + 0.5 + i * 3.9;
      s.addShape("roundRect", { x: nx, y: ty, w: nw, h: nh, rectRadius: 0.07,
        fill: { color: i === 2 ? P.acctint : P.card }, line: { color: P.line, width: 1 } });
      s.addText(name, { x: nx, y: ty, w: nw, h: nh, align: "center", valign: "middle",
        fontFace: F.mono, fontSize: 10, color: P.ink, margin: 0 });
    });
    s.addText("snapshot — ви прибиті сюди", { x: MX + 0.5, y: ty + nh + 0.06, w: 3.6, h: 0.24,
      fontFace: F.mono, fontSize: 9, bold: true, color: P.good, margin: 0 });
    s.addText("alias — ви завжди тут, і воно рухається", { x: MX + 7.9, y: ty + nh + 0.06, w: 4.2, h: 0.24,
      align: "right", fontFace: F.mono, fontSize: 9, bold: true, color: P.warn, margin: 0 });
    s.addText("час →", { x: MX + 0.2, y: ty - 0.28, w: 2, h: 0.22,
      fontFace: F.mono, fontSize: 8.5, color: P.faint, charSpacing: 1, margin: 0 });
  }
  D.band(s, { x: MX, y: 4.92, w: 12.1, h: 1.15, tone: "warn", label: "Лайфхак",
    text: "Той самий принцип, що з образами контейнерів: у прод не котять latest. Ми і gateway пінимо за digest'ом, а не за рухомим тегом." });
  D.band(s, { x: MX, y: 6.2, w: 12.1, h: 0.55, tone: "acc", text: "Правило production: у конфізі — snapshot; оновлення версії — окрема свідома зміна." });
}

{
  const s = D.slide({ num: "04", title: "Route(): роутер на десять рядків", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.85, w: 12.1, h: 2.35, size: 11.5, lines: [
    [{ t: "// [W2] routing: ескалація → сильна, решта → дешева", c: P.dim }],
    [{ t: "static string Route(string message, string def) {", c: P.codeKey }],
    [{ t: '  if (def != "mock") return def;   ', c: P.darktext }, { t: "// реальний ключ", c: P.dim }],
    [{ t: "  var u = message.ToLowerInvariant();", c: P.darktext }],
    [{ t: '  bool escalation = u.Contains("поверн") || u.Contains("терміново")', c: P.darktext }],
    [{ t: '                 || u.Contains("refund")  || u.Contains("скарг");', c: P.darktext }],
    [{ t: '  return escalation ? "mock-strong" : "mock-mini";', c: P.codeStr }],
    [{ t: "}", c: P.codeKey }],
  ] });
  D.flow(s, { x: MX, y: 4.55, w: 12.1, h: 0.8, size: 11.5, items: [
    { label: "повідомлення" }, { label: "маркери ескалації", tone: "acc" }, { label: "mock-strong", tone: "crit" }] });
  D.band(s, { x: MX, y: 5.6, w: 12.1, h: 0.8, tone: "good",
    text: "MODEL — лише дефолт: жорстке ім'я моделі зникло зі шляху рішення й лишилося в одному місці." });
}

{
  const s = D.slide({ num: "04", title: "Що ще каже цей код — до того, як вкусить", pill: "absorb", notes: N() });
  [["Чиста функція = дешеві тести", "рядок на вході, ім'я моделі на виході: десяток assert'ів без стека й бази", "good"],
   ["Конфлікти маркерів", "сумнів — на користь дорожчого: «дякую, але хочу повернути гроші» їде на strong", "card"],
   ["Маркери двомовні", "«поверн» і «refund» навмисно: у проді словники розповзаються по мовах", "warn"],
  ].forEach(([t, b, tone], i) => D.tile(s, { x: MX + i * 4.05, y: 1.9, w: 3.85, h: 2.0, badge: i + 1, title: t, body: b, tone }));
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.5, tone: "acc", label: "З одним реальним ключем роутер вироджується",
    text: "Щойно MODEL не «mock», Route() повертає задану модель — другої в конфізі немає. Це чесний стан контуру з одним провайдером, а не «роутинг вимкнули»." });
}

{
  const s = D.slide({ num: "05", title: "Маршрут — за задачею, не за текстом-в-лоб", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 12.1, h: 0.9, gap: 0.16, items: [
    { label: "Наш рівень", body: "маркери в тексті: дешево, прозоро, зрозуміло на розборі; ламається на перефразуванні" },
    { label: "Доросліше", body: "тенант, фіча, пріоритет клієнта, ліміт бюджету — текст лише один із сигналів", tone: "acc" },
    { label: "Режим мислення", body: "та сама модель у глибокому режимі коштує в рази більше — вмикати за явним критерієм", tone: "warn" },
  ] });
  D.band(s, { x: MX, y: 5.2, w: 12.1, h: 1.2, tone: "good", label: "Принцип",
    text: "Дешеве — дешевій моделі, складне — сильній, рішення — задокументоване. Якщо не можете пояснити маршрут словами, у вас не політика, а випадковість." });
}

{
  const s = D.slide({ num: "06", title: "Скільки коштує саме рішення", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [3.6, 4.0, 4.5], rowH: 0.6, size: 11.5,
    head: ["спосіб вирішити", "що додає до кожного запиту", "коли доречний"],
    rows: [
      { cells: ["Правила / маркери в тексті", "частки мілісекунди, нуль токенів", "класів мало, описуються словником — наш випадок"], tone: "good" },
      { cells: ["Дешева модель-класифікатор", "додатковий виклик: латентність і токени", "словники розповзлися по мовах, класів більше трьох"] },
      { cells: ["Класифікація за схожістю", "виклик за векторами + сховище й індекс", "класів десятки і вони змінюються без релізу"] },
    ] });
  D.band(s, { x: MX, y: 4.6, w: 12.1, h: 1.3, tone: "acc",
    text: "Арифметика проста: якщо рішення коштує дорожче за різницю між моделями — воно не окупається. Починайте з найдешевшого способу і ускладнюйте за сигналом." });
}

{
  const s = D.slide({ num: "06", title: "Один користувач — один маршрут", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.1, w: 12.1, h: 0.8, size: 11, items: [
    { label: "питання 1 → сильна", tone: "crit" }, { label: "питання 2 → дешева", tone: "warn" }, { label: "питання 3 → сильна", tone: "crit" }] });
  s.addText("співрозмовник у користувача змінюється посеред розмови", { x: MX, y: 3.05, w: 12, h: 0.3, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
  D.band(s, { x: MX, y: 3.6, w: 12.1, h: 1.35, tone: "good", label: "Лікування",
    text: "Маршрут стабільний у межах сесії: вибір за хешем розмови, не на кожну репліку." });
  D.band(s, { x: MX, y: 5.15, w: 12.1, h: 1.25, tone: "crit", label: "Типова помилка",
    text: "Роутинг за випадковим числом: непередбачувано і невідтворювано." });
}

{
  const s = D.slide({ num: "06", title: "«У нас одна модель» — усе одно є що маршрутизувати", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [2.8, 4.6, 4.7], rowH: 0.66, size: 11.5,
    head: ["що маршрутизуємо", "приклад рішення", "що дає"],
    rows: [
      { cells: ["max_tokens", "коротка відповідь на FAQ, довга на скаргу", "стеля вартості на клас запиту"] },
      { cells: ["temperature", "мінімальна для довідкових, вища для формулювань", "передбачуваність там, де потрібна"] },
      { cells: ["Версія промпта", "ескалації — свій промпт, FAQ — свій", "той самий реєстр з уроку 2"] },
      { cells: ["Набір інструментів", "read-only для загальних, повний для авторизованих", "менша поверхня для injection"] },
    ] });
  D.band(s, { x: MX, y: 5.4, w: 12.1, h: 1.0, tone: "card",
    text: "Маршрутизація — не про кількість провайдерів, а про те, що рішення про виклик ухвалюється свідомо." });
}

{
  const s = D.slide({ num: "07", title: "Fallback-порядок: політика, яку сьогодні оголосимо", pill: "absorb", notes: N() });
  D.flow(s, { x: MX + 1.5, y: 2.2, w: 9.3, h: 0.9, size: 12.5, items: [
    { label: "mock-strong", tone: "acc" }, { label: "mock-mini", tone: "good" }] });
  s.addText("у разі збою сильної — краще відповісти дешевшою, ніж не відповісти взагалі",
    { x: MX, y: 3.3, w: 12.1, h: 0.35, align: "center", fontFace: F.body, fontSize: 12.5, italic: true, color: P.soft, margin: 0 });
  D.tile(s, { x: MX, y: 3.95, w: 5.85, h: 1.85, title: "Сьогодні рішення, на W4 механізм",
    body: "чергу фіксуємо поруч із роутером і обговорюємо з командою: політика без механізму — текст, механізм без політики — імпровізація", tone: "acc" });
  D.tile(s, { x: 6.87, y: 3.95, w: 5.85, h: 1.85, title: "Один словник імен",
    body: "routing і fallback читають той самий конфіг: ім'я поза конфігом — джерело нічних сюрпризів", tone: "good" });
}

{
  const s = D.slide({ num: "08", title: "Додати провайдера — без зміни коду", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 1.9, size: 12, lines: [
    [{ t: "  - model_name: ", c: P.darktext }, { t: "azure-gpt-4o", c: P.codeStr }],
    [{ t: "    litellm_params:", c: P.codeKey }],
    [{ t: "      model: azure/gpt-4o", c: P.darktext }],
    [{ t: "      api_base: os.environ/AZURE_API_BASE", c: P.darktext }],
    [{ t: "      api_key:  os.environ/AZURE_API_KEY", c: P.darktext }],
  ] });
  D.flow(s, { x: MX, y: 4.15, w: 12.1, h: 0.78, size: 11.5, items: [
    { label: "+ блок у YAML", tone: "good" }, { label: "+ рядок у Route()" }, { label: "код виклику не змінився", tone: "acc" }] });
  D.band(s, { x: MX, y: 5.2, w: 12.1, h: 1.2, tone: "warn", label: "Лайфхак",
    text: "Називайте моделі за роллю, а не за брендом: mock-mini, mock-strong. Тоді заміна провайдера — правка конфіга, а не пошук імені по всьому коду." });
}

{
  const s = D.slide({ num: "09", title: "Третій маршрут: tier-система", pill: "absorb", opt: true, notes: N() });
  [["FAQ-tier", "типові питання: найдешевша модель або заготовлені відповіді"],
   ["Standard-tier", "звичайний діалог: робоча модель"],
   ["Escalation-tier", "скарги, повернення, юридично чутливе: найсильніша"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 2.0, w: 3.85, h: 1.5, badge: i + 1, title: t, body: b, tone: "acc" }));
  // Три рівні — не перелік, а сходинка за вартістю. Однакові картки подають їх
  // як рівноцінні варіанти; сходинка показує, що вибір коштує різних грошей.
  {
    const base = 4.4;
    // Смуга — дані, тож заливається семантичним кольором (світла нейтральна
    // поверхня виносок тут зробила б три однакові чипи). Підпис — УНИЗУ смуги,
    // на спільній лінії: різною лишається тільки висота, яка й означає вартість.
    // По центру смуги він стрибав за висотою і читався як збите вирівнювання.
    [[0.26, P.good, "найдешевша"], [0.44, P.acc, "робоча"],
     [0.62, P.blue, "найсильніша"]].forEach(([h, bg, lbl], i) => {
      const x = MX + i * 4.05;
      s.addShape("roundRect", { x, y: base - h, w: 3.85, h, rectRadius: 0.06,
        fill: { color: bg }, line: { type: "none" } });
      s.addText(lbl, { x, y: base - 0.26, w: 3.85, h: 0.26, align: "center", valign: "middle",
        fontFace: F.mono, fontSize: 9.5, bold: true, color: P.onink, margin: 0 });
    });
    s.addText("вартість запиту →", { x: MX, y: base + 0.06, w: 5, h: 0.22,
      fontFace: F.mono, fontSize: 8.5, color: P.faint, charSpacing: 1, margin: 0 });
  }
  D.tile(s, { x: MX, y: 4.85, w: 5.85, h: 1.35, title: "Механічно — дешево", body: "ще одна гілка в Route() і ще одне ім'я в конфізі" });
  D.tile(s, { x: 6.87, y: 4.85, w: 5.85, h: 1.35, title: "Змістовно — вправа на політику", body: "де межі між рівнями і як захистити рішення цифрами з лога", tone: "warn" });
}

// ─── РОЗДІЛЮВАЧ · практика ───
{
  D.divider({ big: "ПРАКТИКА", sub: "стенд наживо — і чесна межа того, що він доводить",
    pill: "Лабораторна: чотири частини + опційна", notes: N() });
}

{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["конфіг gateway", "mock-mini і mock-strong — дві «моделі» на одному mock"],
   ["Route() у сервісі", "точка рішення на десять рядків"],
   ["питання обох типів", "звичайні + ескалації («поверніть гроші, терміново»)"],
   ["розподіл у БД", "SELECT model, count(*) FROM requests GROUP BY model"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 2) * 6.25, y: 1.9 + Math.floor(i / 2) * 1.8, w: 6.05, h: 1.6, badge: i + 1, title: t, body: b, tone: "good" }));
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити перший операційний доказ, що routing працює: не «код написаний», а «трафік розведений». Різниця між цими формулюваннями і є темою уроку." });
}

{
  const s = D.slide({ title: "Лабораторна: чотири частини + опційна", pill: "do", notes: N() });
  [["Прочитати конфіг", "gateway/litellm-config.yaml: mock-mini і mock-strong", false],
   ["Написати роутер", "маркери → mock-strong, решта → mock-mini; MODEL лише дефолт", false],
   ["Побачити розподіл", "питання обох типів → SELECT model, count(*) GROUP BY model", false],
   ["Додати «третього» на папері", "YAML-блок + місце у fallback-порядку", false],
   ["Tier-політика · опційно", "межі рівнів + частка трафіку кожного з лога", true],
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
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.0, title: "Трафік розведений", body: "дві моделі, різні лічильники — доказ, а не «код написаний»", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.0, title: "Рішення читається", body: "уся політика в одній функції; кожен вибір — подія в лозі", tone: "acc" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.0, title: "Розширення дешеве", body: "«третій провайдер» = один YAML-блок і нуль рядків коду" });
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.35, tone: "card",
    text: "Це фундамент тижня «Routing + cost»: наступного уроку на те саме поле model ляже вартість кожного запиту — і розподіл трафіку стане розподілом грошей." });
}

{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 2.05, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, items: [
    "звичайне питання і ескалація дають різні моделі",
    "поясню, чому рішення в сервісі, а не в адаптері",
    "додам провайдера, не чіпаючи код сервісу",
    "мій fallback-порядок записаний",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 4.25, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Рішення про модель — у конфізі адаптера", "прапорці не переносяться між інструментами, механізми — так"],
   ["Жорстке ім'я моделі по всьому коду", "заміна провайдера перетворюється на пошук рядків"],
   ["Роутинг за випадковим числом", "непередбачувано для користувача, невідтворювано для вас"],
   ["Alias у проді", "модель оновлюється під вами без жодної вашої дії"],
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
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 2.4, title: "Обов'язково — без здачі",
    body: "• роутер працює: GROUP BY model показує дві моделі\n\n• жорстке ім'я моделі лишилося тільки в точці рішення\n\n• записати свій fallback-порядок — знадобиться на тижні 4" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 2.4, title: "Опційно", tone: "warn",
    body: "• сформулювати tier-політику на три рівні і оцінити по лозі частку трафіку кожного" });
  s.addShape("roundRect", { x: MX, y: 4.6, w: 12.1, h: 1.6, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("ДЗ тижня 2 — після наступного уроку", { x: MX + 0.3, y: 4.8, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
  s.addText("Воно об'єднує routing і cost: сьогоднішня частина вже у вас в руках, після уроку 4 додасться облік вартості — і тиждень здається одним PR. Критерії — у файлі ДЗ після наступного уроку.",
    { x: MX + 0.3, y: 5.25, w: 11.5, h: 0.8, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
}

D.closingSlide({
  summary: [
    "одна модель на все — найдорожчий і найкрихкіший спосіб жити",
    "сервіс вирішує, адаптер виконує: рішення — код, а не прапорець у чужому конфізі",
    "Route() — одна точка рішення; MODEL лишається тільки дефолтом",
    "маршрутизувати можна навіть з однією моделлю: max_tokens, temperature, промпт, інструменти",
    "fallback-порядок оголошуємо сьогодні — механізм з'явиться на тижні 4",
  ],
  nextTitle: "Наступний крок → Урок 4 · Токеноміка і cost attribution",
  nextBody: "Трафік розведений — тепер порахуємо, скільки він коштує. Наступного уроку на поле model ляже вартість кожного запиту: звідки беруться цифри, чому «звернення» дорожче за «виклик» і як за три GROUP BY знайти, куди пішов бюджет.",
  notes: N(),
});

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L03.pptx"), path.join(OUT, "L03-script.md"));
