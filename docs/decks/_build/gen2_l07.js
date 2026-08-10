// L07 v2 — Reliability
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L07-script.md"));
const D = createDeck({ lesson: 7, week: 4, fileTitle: "Reliability: fallback, деградація і circuit breaker", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "Reliability: fallback,\nдеградація і circuit breaker",
  lead: "Провайдер ляже. Питання не «чи», а «що побачить користувач, коли це станеться». Будуємо план Б — і влаштовуємо власний інцидент, бо mock уміє падати на замовлення.",
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Зробити збій значенням", "виклик у функції, де помилка — не виняток"],
   ["Побудувати fallback-ланцюг", "спробуй наступного, лічильник переходів"],
   ["Віддати ввічливу заглушку", "замість 500-ки, з чесним 503 у лозі"],
   ["Влаштувати інцидент", "__fail_503 і довести: збій коштує мілісекунди"],
   ["Зібрати circuit breaker", "із half-open · опційно"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 1.9, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b, tone: i === 4 ? "warn" : "card" }));
}

{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","Падіння має бути керованим"],["02","Retry ≠ fallback"],["03","Збій як значення"],
   ["04","Fallback-ланцюг"],["05","Право на повтор і лавина"],["06","Сходинки деградації"],
   ["07","Помилки мають бути швидкими"],["08","Circuit breaker · опційно"],["09","Слід у метриках"],
   ["10","Лабораторна"],["11","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "08" ? "warn" : (i < 5 ? "acc" : "card") }));
  D.band(s, { x: MX, y: 6.4, w: 12.1, h: 0.62, tone: "card", text: "Reliability — не «щоб не падало». Падатиме. Щоб падіння було керованим." });
}

{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb", kicker: "Шість слів сьогоднішнього уроку",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.3, items: [
    { term: "retry", def: "ще раз туди само — на минущих збоях, обов'язково з паузою" },
    { term: "fallback", def: "в інше місце: інша модель за оголошеним порядком" },
    { term: "backoff", def: "пауза перед повтором; jitter розсинхронізує натовп" },
    { term: "graceful degradation", def: "чесна відповідь нижчої якості замість помилки" },
    { term: "circuit breaker", def: "після кількох збоїв перестає стукати в мертвий сервіс" },
    { term: "half-open", def: "пробний запит: чи ожив провайдер" },
  ] });
  D.band(s, { x: MX, y: 4.95, w: 12.1, h: 0.85, tone: "card", text: "Кожне побачимо в коді — тут вони лише щоб не спотикатися." });
}

{
  const s = D.slide({ num: "01", title: "Чужа інфраструктура: падіння має бути керованим", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.0, w: 12.1, h: 0.8, size: 11, items: [
    { label: "стрибки latency" }, { label: "429 у пік", tone: "warn" }, { label: "5xx на боці провайдера", tone: "crit" }, { label: "зміни API" }] });
  s.addText("це не аномалії — це нормальний режим роботи інтернету",
    { x: MX, y: 2.95, w: 12, h: 0.3, fontFace: F.body, fontSize: 12, italic: true, color: P.soft, margin: 0 });
  D.tile(s, { x: MX, y: 3.5, w: 5.85, h: 1.7, title: "Reliability — не «щоб не падало»",
    body: "план Б · ввічлива відмова в найгіршому разі · сліди в метриках", tone: "good" });
  D.tile(s, { x: 6.87, y: 3.5, w: 5.85, h: 1.7, title: "Тихі смерті",
    body: "найгірші збої не дають 5xx: схема «запит-відповідь» їх не ловить у принципі", tone: "crit" });
  D.band(s, { x: MX, y: 5.45, w: 12.1, h: 0.95, tone: "acc", label: "Навіщо цей шар",
    text: "До сьогодні будь-який збій провайдера означав 500-ку користувачу. Сьогодні між ними стає план Б." });
}

{
  const s = D.slide({ num: "02", title: "Retry ≠ fallback: словник рішень", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [3.1, 4.5, 4.5], rowH: 0.62, size: 11.5,
    head: ["", "retry", "fallback"],
    rows: [
      { cells: ["Що робить", "ще раз туди само", "в інше місце: інша модель"] },
      { cells: ["Коли доречний", "минущі збої: мережевий глюк, 429", "провайдер лежить або деградує"] },
      { cells: ["Обов'язкові атрибути", "backoff і бюджет спроб", "явний порядок ланцюга"] },
      { cells: ["Головний ризик", "DDoS власного провайдера", "непомітна різниця якості моделей"], tone: "crit" },
    ] });
  D.band(s, { x: MX, y: 4.85, w: 12.1, h: 1.55, tone: "acc",
    text: "Retry в коді курсу свідомо не будуємо: на mock «ще раз туди само» і «в інше місце» дають той самий результат. Порядок правильний — спершу fallback, і бюджет часу на все разом." });
}

{
  const s = D.slide({ num: "02", title: "Backoff: фіксований, експоненційний, jitter", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 12.1, h: 0.85, gap: 0.14, items: [
    { label: "Фіксований", body: "«чекай секунду» — найпростіший; на масовому збої всі клієнти повертаються синхронно", tone: "warn" },
    { label: "Експоненційний", body: "кожна наступна спроба чекає довше — трафік згасає замість наростання" },
    { label: "Jitter", body: "випадковий зсув паузи розсинхронізовує натовп: без нього друга хвиля добиває вижилих", tone: "good" },
  ] });
  D.band(s, { x: MX, y: 5.1, w: 12.1, h: 1.3, tone: "crit", label: "Типова помилка",
    text: "Retry без backoff і без бюджету: провайдер повернув 429 «пригальмуйте» — а ви у відповідь потроїли трафік. Ваш власний код став другою половиною інциденту." });
}

{
  const s = D.slide({ num: "03", title: "Розтин: збій стає значенням, а не винятком", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.6, size: 11.5, lines: [
    [{ t: "// один виклик через gateway; ok=false, якщо збій або статус >= 400", c: P.dim }],
    [{ t: "static async Task<(bool ok, string answer, string? tool,", c: "82AAFF" }],
    [{ t: "        int pt, int ct, int status)> CallGateway(…)", c: "82AAFF" }],
    [{ t: "{", c: P.darktext }],
    [{ t: "    try {", c: P.darktext }],
    [{ t: "        if (status >= 400) return (false, \"\", null, 0, 0, status);", c: "F78C6C" }],
    [{ t: "        return (true, answer, tool, pt, ct, status);", c: "C3E88D" }],
    [{ t: "    } catch { return (false, \"\", null, 0, 0, 0); }", c: "F78C6C" }],
    [{ t: "}", c: P.darktext }],
  ] });
  [["Значення, не виняток", "виклик стає рішенням, а не аварією"],
   ["Ланцюги стають можливими", "результат перевіряється, а не ловиться catch'ем"],
   ["status: 0", "мережа не відповіла взагалі — окрема чесна категорія"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 4.75, w: 3.85, h: 1.5, badge: i + 1, title: t, body: b, tone: "good" }));
}

{
  const s = D.slide({ num: "04", title: "Fallback-ланцюг: спробуй наступного", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.35, size: 11.5, lines: [
    [{ t: "// [W4] fallback: пробуємо по черзі", c: P.dim }],
    [{ t: 'var chain = defaultModel == "mock" ? new[] { model, "mock" }', c: "82AAFF" }],
    [{ t: '                                   : new[] { model, "azure-gpt-4o" };', c: "82AAFF" }],
    [{ t: "for (int i = 0; i < chain.Length && !ok; i++) {", c: P.darktext }],
    [{ t: "    if (i > 0) Interlocked.Increment(ref stats.Fallbacks);", c: "F78C6C" }],
    [{ t: "    var res = await CallGateway(http, gateway, chain[i], …);", c: P.darktext }],
    [{ t: "    if (res.ok) { ok = true; model = chain[i]; answer = res.answer; }", c: "C3E88D" }],
    [{ t: "}", c: P.darktext }],
  ] });
  [["Лічильник переходів", "fallback, що спрацював непомітно, — замаскована проблема"],
   ["У лозі — реальна модель", "model = chain[i]: інакше аналітика тижня 2 бреше"],
   ["Межа стенда — чесна", "на mock другий елемент — той самий mock", "warn"],
  ].forEach(([t, b, tone], i) => D.tile(s, { x: MX + i * 4.05, y: 4.5, w: 3.85, h: 1.75, badge: i + 1, title: t, body: b, tone: tone || "card" }));
}

{
  const s = D.slide({ num: "05", title: "Право на повтор: не кожну операцію можна ретраїти", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [4.2, 3.0, 4.9], rowH: 0.62, size: 11.5,
    head: ["операція", "повторювати?", "умова"],
    rows: [
      { cells: ["Виклик моделі", "так", "немає побічних ефектів, крім вартості"], tone: "good" },
      { cells: ["Читання через інструмент", "так", "read-only за визначенням"], tone: "good" },
      { cells: ["Дія, що змінює стан", "тільки з ключем", "без ключа повтор — це дубль, а не наполегливість"], tone: "warn" },
      { cells: ["Дія без ідемпотентності", "ні", "краще чесно віддати помилку людині, ніж вгадувати"], tone: "crit" },
    ] });
  D.band(s, { x: MX, y: 4.85, w: 12.1, h: 1.45, tone: "good", label: "Принцип",
    text: "Право на ретрай визначається не типом помилки, а природою операції. Найпідліший випадок — таймаут: відповіді немає, а дія могла статися." });
}

{
  const s = D.slide({ num: "05", title: "Retry storm: ваша стійкість добиває провайдера", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.05, w: 12.1, h: 0.8, size: 10.5, items: [
    { label: "усі отримали помилку", tone: "warn" }, { label: "усі повторюють одночасно", tone: "crit" },
    { label: "друга хвиля", tone: "crit" }, { label: "провайдер не встає", tone: "crit" }] });
  [["Експоненційна пауза", "замість «одразу ще раз»: кожна спроба чекає довше"],
   ["Джитер", "випадковий розкид — інакше всі повторюють у ті самі мілісекунди"],
   ["Стеля спроб + breaker", "після кількох поспіль перестаєте стукати"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 3.25, w: 3.85, h: 1.75, badge: i + 1, title: t, body: b, tone: "good" }));
  D.band(s, { x: MX, y: 5.25, w: 12.1, h: 1.15, tone: "crit", label: "Типова помилка",
    text: "Ретрай без паузи «бо швидко треба»: на 429 три негайні спроби потроюють трафік саме тоді, коли вас просили пригальмувати. 429 уже сказав, що робити: почекати." });
}

{
  const s = D.slide({ num: "06", title: "Деградація має сходинки", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [1.0, 6.3, 4.8], rowH: 0.58, size: 11.5,
    head: ["#", "що віддаємо", "що втрачає користувач"],
    rows: [
      { cells: ["1", "відповідь основної моделі з інструментами", "нічого"] },
      { cells: ["2", "відповідь іншої моделі (урок 3)", "можливо, трохи іншу манеру"], tone: "acc" },
      { cells: ["3", "відповідь моделі без звернень до зовнішніх систем", "актуальні дані"] },
      { cells: ["4", "раніше згенеровану відповідь на схоже питання (урок 5)", "свіжість і персоналізацію"] },
      { cells: ["5", "ввічливе «спробуйте згодом» + шлях до людини", "відповідь узагалі"], tone: "acc" },
    ] });
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 0.9, tone: "good",
    text: "Сходинки 2 і 5 — core цього тижня: між ними лежить уся різниця між «впало» і «деградувало»." });
}

{
  const s = D.slide({ num: "06", title: "Остання лінія — це UX-рішення", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.05, size: 12, lines: [
    [{ t: "if (!ok) {", c: "82AAFF" }],
    [{ t: '    answer = "Вибачте, тимчасові проблеми на нашому боці. ', c: "C3E88D" }],
    [{ t: '             Спробуйте, будь ласка, трохи згодом.";', c: "C3E88D" }],
    [{ t: "    status = (status == 200 || status == 0) ? 503 : status;", c: "F78C6C" }],
    [{ t: "}", c: "82AAFF" }],
  ] });
  D.tile(s, { x: MX, y: 3.95, w: 5.85, h: 1.6, title: "Текст — для людини",
    body: "ввічливе, чесне повідомлення; чат живий, жодного стек-трейса", tone: "good" });
  D.tile(s, { x: 6.87, y: 3.95, w: 5.85, h: 1.6, title: "Статус — для машин",
    body: "у лог їде 503, а не 200 «щоб не лякати»: інакше моніторинг бачить здорову систему", tone: "crit" });
  D.band(s, { x: MX, y: 5.75, w: 12.1, h: 0.65, tone: "acc",
    text: "Дві аудиторії, два повідомлення — з одного місця в коді." });
}

{
  const s = D.slide({ num: "07", title: "Помилки мають бути швидкими", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 1.1, size: 13, lines: [
    [{ t: "# gateway/litellm-config.yaml", c: P.dim }],
    [{ t: "num_retries: 0", c: "C3E88D" }, { t: "   # тепер ви знаєте, навіщо", c: P.dim }],
  ] });
  D.band(s, { x: MX, y: 3.25, w: 12.1, h: 1.3, tone: "crit", label: "Приховані ретраї в кількох шарах",
    text: "Бюджети часу перемножуються: два ретраї в адаптері × два в сервісі × таймаут — і «швидка відмова» триває пів хвилини." });
  D.band(s, { x: MX, y: 4.7, w: 12.1, h: 1.0, tone: "good",
    text: "Reliability-логіка живе в одному місці — у вашому сервісі: видима, залогована, керована." });
  s.addText("Перевірте сьогодні в лабі: збій має коштувати мілісекунди.",
    { x: MX, y: 5.9, w: 12, h: 0.4, fontFace: F.body, fontSize: 13, italic: true, bold: true, color: P.ink, margin: 0 });
}

{
  const s = D.slide({ num: "08", title: "Circuit breaker: перестати стукати в мертве", pill: "absorb", opt: true, notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.05, size: 12, lines: [
    [{ t: "// [W4 · опційно] 3 збої поспіль → open на 30 с", c: P.dim }],
    [{ t: "var br = breakers.GetOrAdd(chain[i], _ => new Breaker());", c: "82AAFF" }],
    [{ t: "if (br.OpenUntil > now)", c: "82AAFF" }],
    [{ t: "    continue;            ", c: "F78C6C" }, { t: "// у провайдера навіть не питаємо", c: P.dim }],
  ] });
  D.tile(s, { x: MX, y: 3.9, w: 5.85, h: 1.65, title: "Навіщо",
    body: "перестати витрачати час користувача на виклик, який майже напевно впаде", tone: "good" });
  D.tile(s, { x: 6.87, y: 3.9, w: 5.85, h: 1.65, title: "Breaker окремий на модель",
    body: "інакше збій однієї моделі закриває доступ до здорових", tone: "acc" });
  D.band(s, { x: MX, y: 5.75, w: 12.1, h: 0.65, tone: "warn",
    text: "Половина сенсу breaker'а спрямована назовні: ви перестаєте добивати провайдера, який і так лежить." });
}

{
  const s = D.slide({ num: "08", title: "Три стани — і чому half-open обов'язковий", pill: "absorb", opt: true, notes: N() });
  D.states(s, { x: MX + 1.5, y: 2.2, items: [
    { label: "closed", sub: "усе працює", tone: "good", edge: "3 збої" },
    { label: "open", sub: "не питаємо зовсім", tone: "crit", edge: "~30 с" },
    { label: "half-open", sub: "один пробний запит", tone: "warn" },
  ] });
  D.band(s, { x: MX, y: 4.6, w: 12.1, h: 1.25, tone: "crit", label: "Без half-open — самостріл",
    text: "Breaker відкрився і не має способу перевірити, чи провайдер ожив: система лишається деградованою після того, як усе полагодилося." });
  D.band(s, { x: MX, y: 5.95, w: 12.1, h: 0.62, tone: "acc",
    text: "Ціна відкритого circuit: здорове питання миттєво отримує заглушку — деградація без збою." });
}

{
  const s = D.slide({ num: "09", title: "Слід у метриках: інцидент без сліду повториться", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 12.1, h: 0.8, gap: 0.14, items: [
    { label: "fallback_events", body: "лічильник переходів росте з кожним спрацюванням ланцюга", tone: "acc" },
    { label: "статуси збоїв", body: "503, 429, 0 лежать у лозі поруч зі звичайними 200" },
    { label: "заглушка деградації", body: "пише чесний статус, а не 200 — інакше метрики брешуть" },
  ] });
  D.band(s, { x: MX, y: 4.78, w: 12.1, h: 1.15, tone: "good",
    text: "«Скільки запитів пішло через fallback минулої п'ятниці?» — питання, з якого починається і постмортем, і розмова з провайдером про SLA." });
  D.band(s, { x: MX, y: 6.08, w: 12.1, h: 0.62, tone: "card",
    text: "На тижні 5 усе це стане плитками консолі — сьогодні досить, що цифри існують і ростуть правильно." });
}

// ─── дві сучасні поправки до бюджету часу (доважок блоку 09) ───
{
  const s = D.slide({ num: "09", title: "Дві сучасні поправки до бюджету часу", pill: "absorb",
    kicker: "Яких не було в епоху «одна модель — одна відповідь»", notes: N() });
  D.tile(s, { x: MX, y: 2.15, w: 5.85, h: 1.95, badge: 1, title: "Режим мислення — інший порядок часу",
    body: "секунди замість сотень мілісекунд: таймаут під швидкий режим «падає» на легітимно повільній відповіді", tone: "warn" });
  D.tile(s, { x: 6.87, y: 2.15, w: 5.85, h: 1.95, badge: 2, title: "Ліміти стали багатовимірними",
    body: "не лише запити на хвилину: токени на хвилину, окремі квоти на «думаючі» моделі й кешовані токени", tone: "warn" });
  D.band(s, { x: MX, y: 4.4, w: 12.1, h: 1.05, tone: "crit",
    text: "429 приходить не тому, що «багато запитів», а тому, що ви вибрали токен-квоту." });
  D.band(s, { x: MX, y: 5.65, w: 12.1, h: 1.0, tone: "good", label: "Висновок",
    text: "Бюджет часу — властивість маршруту, а не константа сервісу: ставиться там само, де ухвалюється рішення про модель." });
}

{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["__fail_503 → заглушка", "ввічлива відмова замість 500-ки", "good"],
   ["той самий маркер удруге", "збій коштує мілісекунди", "good"],
   ["перехід fallback — у діфі коду", "лічильник на цьому тижні не віддається нічим", "warn"],
   ["опц.: 3 × __fail_503 → open", "здорове питання миттєво отримує заглушку", "crit"],
   ["опц.: пауза ~5 с → probe", "звичайне питання закриває circuit", "warn"],
  ].forEach(([t, b, tone], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.85 + Math.floor(i / 3) * 1.75, w: 3.85, h: 1.55, badge: i + 1, title: t, body: b, tone }));
  D.band(s, { x: MX, y: 5.5, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити спроєктовану відмову наживо: збій — не 500 і не вісім секунд, а швидка ввічлива заглушка зі слідом у лозі. І ціну відкритого circuit — деградацію навіть здорових питань." });
}

{
  const s = D.slide({ title: "Лабораторна: три кроки + опційний", pill: "do", notes: N() });
  [["Побудувати ланцюг", "CallGateway + цикл по chain + лічильник переходів", false],
   ["Довести інцидент до дна", "__fail_503 → заглушка з 503 у лозі, а не 500 користувачу", false],
   ["Перевірити слід", "статуси і лічильник fallback ростуть правильно", false],
   ["Circuit breaker · опційно", "3 збої → open на 30 с, обов'язково з half-open", true],
  ].forEach(([t, b, opt], i) => {
    const y = 2.1 + i * 1.0;
    s.addShape("ellipse", { x: MX, y, w: 0.5, h: 0.5, fill: { color: opt ? P.warn : P.acc }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F.mono, fontSize: 13, bold: true, color: "FFFFFF", margin: 0 });
    s.addText([{ text: t + "  ", options: { bold: true, fontSize: 14, color: opt ? P.warn : P.ink } },
               { text: b, options: { fontSize: 12, color: P.soft } }],
      { x: MX + 0.68, y, w: 11.4, h: 0.5, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

{
  const s = D.slide({ title: "Що це довело", pill: "connect", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.0, title: "Збій швидкий", body: "мілісекунди замість восьми секунд прихованих ретраїв", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.0, title: "Користувач бачить ввічливість", body: "заглушка замість 500-ки — чат живий", tone: "acc" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.0, title: "Система бачить правду", body: "503 у лозі й лічильник переходів, а не «все добре»" });
  D.band(s, { x: MX, y: 4.35, w: 12.1, h: 1.35, tone: "warn", label: "Межа стенда — чесна",
    text: "Успішний fallback «основна впала — резерв відповів» на mock показати неможливо: обидва елементи ланцюга — той самий mock. Перехід дивимось у діфі коду." });
}

{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 2.05, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, items: [
    "__fail_503 дає ввічливу заглушку, не 500",
    "збій швидкий — мілісекунди, а не секунди",
    "у лозі чесний 503 і лічильник переходів",
    "поясню retry, fallback і breaker одним реченням",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 4.25, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Retry без паузи і без стелі", "ваш код стає другою половиною інциденту"],
   ["Заглушка зі статусом 200", "моніторинг бачить здорову систему, коли всі бачать вибачення"],
   ["Ретраї в кількох шарах одразу", "бюджети часу перемножуються — «швидка відмова» на пів хвилини"],
   ["Breaker без half-open", "система лишається деградованою після того, як усе полагодилося"],
   ["Fallback без лічильника", "проблема, що спрацювала непомітно, повертається більшою"],
  ].forEach(([t, b], i) => {
    const y = 1.95 + i * 0.95;
    s.addShape("roundRect", { x: MX, y, w: 12.1, h: 0.8, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.22, y: y + 0.19, w: 0.42, h: 0.42, fill: { color: P.critbg }, line: { type: "none" } });
    s.addText("✕", { x: MX + 0.22, y: y + 0.19, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: F.body, fontSize: 13, bold: true, color: P.crit, margin: 0 });
    s.addText([{ text: t + "   ", options: { bold: true, fontSize: 13, color: P.ink } },
               { text: b, options: { fontSize: 11.5, color: P.soft } }],
      { x: MX + 0.8, y, w: 11.1, h: 0.8, fontFace: F.body, valign: "middle", margin: 0 });
  });
}

{
  const s = D.slide({ title: "Домашнє завдання", pill: "do", notes: N() });
  D.tile(s, { x: MX, y: 1.9, w: 5.85, h: 2.4, title: "Обов'язково — без здачі",
    body: "• закріпити лабу: __fail_503 → fallback → ввічлива заглушка\n\n• переконатися, що збій швидкий і лишає чесний статус у лозі\n\n• проговорити свою драбину деградації" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 2.4, title: "Опційно", tone: "warn",
    body: "• circuit breaker: 3 збої → open на 30 с, обов'язково з half-open (пробний запит раз на ~5 с) — інакше сам собі влаштуєш outage" });
  s.addShape("roundRect", { x: MX, y: 4.6, w: 12.1, h: 1.6, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("ДЗ тижня 4 — після наступного уроку", { x: MX + 0.3, y: 4.8, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
  s.addText("Тиждень об'єднує надійність і безпеку: сьогоднішній fallback із деградацією вже у вас в руках, після наступного уроку додасться черга підтверджень для незворотних дій — і тиждень здається одним PR.",
    { x: MX + 0.3, y: 5.25, w: 11.5, h: 0.8, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
}

D.closingSlide({
  summary: [
    "reliability — не «щоб не падало», а щоб падіння було керованим",
    "збій — значення, а не виняток: тільки так будуються ланцюги",
    "retry і fallback вирішують різні задачі; порядок — спершу fallback",
    "деградація має сходинки, а остання з них — UX-рішення з чесним статусом",
    "інцидент без сліду в метриках повториться",
  ],
  nextTitle: "Наступний крок → Урок 8 · Safety, guardrails і human-in-the-loop",
  nextBody: "Система переживає збій провайдера. Наступного уроку — про збої іншого роду: коли шкоду завдає не інфраструктура, а зміст. Injection, витік даних і незворотні дії, які мусить підтвердити людина — та сама «дірка», яку ми лишили відкритою на уроці 6.",
  notes: N(),
});

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L07.pptx"), path.join(OUT, "L07-script.md"));
