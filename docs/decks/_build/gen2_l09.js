// L09 v2 — Observability
const path = require("path");
const { createDeck, notesFrom } = require("./deck_lib2");
const SRC = process.env.DECKS_DIR || path.join(__dirname, "..");
const N = notesFrom(path.join(SRC, "L09-script.md"));
const D = createDeck({ lesson: 9, week: 5, fileTitle: "Observability для LLM-систем", notes: N });
const { P, F, MX } = D;

D.titleSlide({
  title: "Observability\nдля LLM-систем",
  lead: "Uptime зелений, користувачі нещасні. Сьогодні консоль оживає повністю: p95 і error rate з власного лога, cache-hit і fallback з лічильників — і вміння бачити інциденти без жодної помилки.",
  notes: N(),
});

{
  const s = D.slide({ title: "Що ви зможете після уроку", pill: "absorb", kicker: "П'ять дій, які перевірите руками", notes: N() });
  [["Порахувати p95 і error rate", "одним SQL по власному логу"],
   ["Оживити всі шість плиток", "цифри звірені з SQL"],
   ["Пояснити, чому p95", "а не середнє — і чому перцентилі не усереднюються"],
   ["Відтворити тихий інцидент", "fallback росте без жодного 500 користувачу"],
   ["Сформулювати SLO", "і порахувати тижневий бюджет помилок"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.95 + Math.floor(i / 3) * 2.30, w: 3.85, h: 2.05, badge: i + 1, title: t, body: b }));
}

{
  const s = D.slide({ title: "Маршрут на сьогодні", pill: "absorb", notes: N() });
  [["01","Тихі інциденти й чотири виміри"],["02","Лог-рядок = джерело всього"],["03","p95, не середнє"],
   ["04","Розтин /observability"],["05","/providers і шість плиток"],["06","Тренд важливіший за снапшот"],
   ["07","SLI, SLO, бюджет помилок"],["08","Таксономія помилок · опційно"],["09","Трейс, спани, PII в лозі"],
   ["10","У продукті чи індустріальний стек"],["11","Лабораторна"],["12","Антипатерни"],
  ].forEach(([n, t], i) => D.tile(s, { x: MX + (i % 3) * 4.05, y: 1.8 + Math.floor(i / 3) * 1.15, w: 3.85, h: 0.95,
      badge: n, title: t, tone: n === "08" ? "warn" : "card" }));
  D.band(s, { x: MX, y: 6.32, w: 12.1, h: 0.44, tone: "card", text: "Від «усе зелене» — до системи, у якій видно те, що не дає помилок." });
}

{
  const s = D.slide({ title: "Терміни, якими користуватимемось", pill: "absorb", kicker: "Шість слів сьогоднішнього уроку",
    notes: N() });
  D.terms(s, { x: MX, y: 1.95, w: 12.1, cols: 3, rowH: 1.62, items: [
    { term: "p95", def: "час, у який вкладаються 95% запитів — досвід найневдаліших" },
    { term: "error rate", def: "частка запитів, що завершилися не-200" },
    { term: "cache-hit / fallback", def: "власні лічильники з уроків 5 і 7" },
    { term: "SLI / SLO", def: "показник, який міряємо — і цільове значення" },
    { term: "бюджет помилок", def: "скільки невдач дозволено в межах SLO" },
    { term: "тихий інцидент", def: "збій без жодної помилки користувачу" },
  ] });
  D.band(s, { x: MX, y: 5.62, w: 12.1, h: 0.85, tone: "card", text: "Кожне побачимо в коді — тут вони лише щоб не спотикатися." });
}

// ─── РОЗДІЛЮВАЧ · теорія ───
{
  D.divider({ big: "ТЕОРІЯ", sub: "10 блоків — дивимось і розбираємось, руками поки не робимо", notes: N() });
}

{
  const s = D.slide({ num: "01", title: "Тихі інциденти: все зелене — все погано", pill: "absorb", notes: N() });
  [["Якість просіла", "після зміни промпта — HTTP 200"],
   ["Вартість ×3", "хтось зламав ключ кешу — HTTP 200"],
   ["Трафік поповз на слабшу", "працює fallback — HTTP 200"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 1.9, w: 3.85, h: 1.6, badge: i + 1, title: t, body: b, tone: "crit" }));
  D.flow(s, { x: MX, y: 3.85, w: 12.1, h: 0.78, size: 11, items: [
    { label: "доступність" }, { label: "latency" }, { label: "вартість", tone: "acc" }, { label: "якість / поведінка", tone: "acc" }] });
  s.addText("перші два виміри знайомі з веб-сервісів; другі два — власне LLMOps",
    { x: MX, y: 4.75, w: 12, h: 0.3, fontFace: F.body, fontSize: 11.5, italic: true, color: P.faint, margin: 0 });
  D.band(s, { x: MX, y: 5.25, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо цей шар",
    text: "Механізми чотирьох тижнів працюють — сьогодні вони стають видимими цифрами." });
}

{
  const s = D.slide({ num: "02", title: "Один лог-рядок — джерело всього", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 0.85, size: 12.5, lines: [
    [{ t: "requests: request_id · model · prompt_version · latency_ms · tokens · cost_usd · status", c: P.codeKey }],
  ] });
  [["Трейс", "за request_id відновлюється шлях: яка модель, яка версія, скільки тривало"],
   ["Метрика", "p95 по latency_ms, error rate як частка не-200, сума cost_usd"],
   ["Аудит", "хто, коли, якою версією, з яким результатом"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 3.1, w: 3.85, h: 1.75, badge: i + 1, title: t, body: b, tone: "acc" }));
  D.band(s, { x: MX, y: 5.05, w: 12.1, h: 1.35, tone: "good",
    text: "Ніякої магії: жодного окремого «стека спостережуваності» для ядра — SQL по таблиці, яку ви й так пишете. Лог, закладений заздалегідь, — різниця між «подивімось» і «даних немає»." });
}

{
  const s = D.slide({ num: "02", title: "Новий зріз = нова колонка, не нова система", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 7.4, colW: [2.6, 2.4, 2.4], rowH: 0.6, size: 11.5,
    head: ["зріз", "груп", "агрегувати?"],
    rows: [
      { cells: ["моделі", "одиниці", "так"], tone: "good" },
      { cells: ["версії промпта", "десятки", "так"], tone: "good" },
      { cells: ["тенанти", "сотні", "вже на межі"], tone: "warn" },
      { cells: ["user_id", "мільйони", "ні — лише для трейсів"], tone: "crit" },
    ] });
  D.band(s, { x: 8.35, y: 1.9, w: 4.37, h: 3.0, tone: "acc", label: "Принцип",
    text: "Колонка в момент події — безкоштовний GROUP BY. Через місяць — даних уже немає." });
  D.band(s, { x: MX, y: 5.2, w: 12.1, h: 1.15, tone: "card",
    text: "Зріз по тенантах — додайте tenant_id у лог-рядок у момент запиту." });
}

{
  const s = D.slide({ num: "03", title: "p95, не середнє", pill: "absorb", notes: N() });
  D.stat(s, { x: MX, y: 1.9, w: 3.9, h: 1.35, value: "≈ 1.1 с", label: "середнє — «прийнятно»", tone: "good", size: 30 });
  D.stat(s, { x: 4.72, y: 1.9, w: 3.9, h: 1.35, value: "p95", label: "досвід найневдаліших", tone: "crit", size: 30 });
  D.stat(s, { x: 8.82, y: 1.9, w: 3.9, h: 1.35, value: "p99", label: "найгірший відсоток", tone: "warn", size: 30 });
  // Розподіл із довгим хвостом. Уся суть перцентилів у формі: середнє сидить біля
  // піка, а скарги живуть у хвості праворуч. Трьома цифрами цього не показати.
  {
    const base = 4.58, maxH = 0.76, x0 = MX + 0.1, pitch = 0.42, bw = 0.34;
    const hs = [0.14, 0.34, 0.60, 0.84, 1.0, 0.94, 0.80, 0.66, 0.54, 0.43, 0.35, 0.29, 0.24,
                0.20, 0.17, 0.15, 0.13, 0.11, 0.10, 0.09, 0.08, 0.07, 0.06, 0.05, 0.05, 0.04];
    hs.forEach((h, i) => {
      const hh = maxH * h;
      s.addShape("rect", { x: x0 + i * pitch, y: base - hh, w: bw, h: hh,
        fill: { color: P.accsoft }, line: { type: "none" } });
    });
    const mark = (i, color, label) => {
      const mx = x0 + i * pitch + bw / 2;
      s.addShape("line", { x: mx, y: base - maxH - 0.16, w: 0, h: maxH + 0.16,
        line: { color, width: 1.5, dashType: "dash" } });
      s.addText(label, { x: mx - 0.8, y: base - maxH - 0.42, w: 1.6, h: 0.24, align: "center",
        fontFace: F.mono, fontSize: 9, bold: true, color, margin: 0 });
    };
    mark(4, P.good, "середнє");
    mark(19, P.crit, "p95");
    s.addText("час відповіді →", { x: x0, y: base + 0.06, w: 4, h: 0.22,
      fontFace: F.mono, fontSize: 8.5, color: P.faint, charSpacing: 1, margin: 0 });
  }
  D.band(s, { x: MX, y: 4.98, w: 12.1, h: 0.78, tone: "crit", label: "Типова помилка",
    text: "Середня latency згладить і сплеск, і деградацію. Алерти — на перцентилі." });
  D.band(s, { x: MX, y: 5.9, w: 12.1, h: 0.78, tone: "acc",
    text: "Перцентилі не усереднюються: середнє від двох p95 — не p95 за дві години." });
}

{
  const s = D.slide({ num: "04", title: "Розтин: GET /observability", pill: "absorb", notes: N() });
  D.code(s, { x: MX, y: 1.9, w: 12.1, h: 2.15, size: 11.5, lines: [
    [{ t: "SELECT count(*),", c: P.codeKey }],
    [{ t: "  COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0),", c: P.darktext }],
    [{ t: "  COALESCE(AVG(CASE WHEN status <> '200' THEN 1.0 ELSE 0 END) * 100, 0)", c: P.darktext }],
    [{ t: "FROM requests WHERE created_at::date = CURRENT_DATE;", c: P.codeKey }],
  ] });
  D.tile(s, { x: MX, y: 4.3, w: 5.85, h: 1.75, title: "З бази: requests · p95 · error rate",
    body: "переживають рестарт, історичні — по них видно тренд", tone: "good" });
  D.tile(s, { x: 6.87, y: 4.3, w: 5.85, h: 1.75, title: "З пам'яті: cache-hit · fallback",
    body: "швидкі, але обнуляються з рестартом; кожен ребілд сервісу = рестарт", tone: "warn" });
  s.addText("COALESCE — не косметика: на порожній таблиці агрегати дають NULL, і свіжий стек віддає 500 ще до першого запиту.",
    { x: MX, y: 6.2, w: 12.1, h: 0.35, fontFace: F.body, fontSize: 11.5, italic: true, color: P.soft, margin: 0 });
}

{
  const s = D.slide({ num: "05", title: "Плитка — це відповідь на питання", pill: "absorb", notes: N() });
  D.table(s, { x: MX, y: 1.9, w: 12.1, colW: [3.0, 5.4, 3.7], rowH: 0.54, size: 11.5,
    head: ["плитка", "операційне питання", "звідки цифра"],
    rows: [
      { cells: ["Requests today", "яке навантаження зараз?", "count по лозі"] },
      { cells: ["Вартість сьогодні", "скільки палимо і чи в бюджеті?", "сума cost_usd (урок 4)"], tone: "acc" },
      { cells: ["p95 latency", "що бачать найневдаліші користувачі?", "перцентиль по лозі"] },
      { cells: ["Error rate", "яка частка запитів ламається?", "частка не-200"] },
      { cells: ["Cache-hit %", "чи окупається кеш?", "лічильники (урок 5)"], tone: "acc" },
      { cells: ["Fallback", "чи живемо ми на плані Б?", "лічильник (урок 7)"] },
    ] });
  // таблиця вище: y=1.90 + 7 рядків × 0.54 = низ 5.68 — плашка мусить бути нижче
  D.band(s, { x: MX, y: 5.8, w: 12.1, h: 0.9, tone: "good", label: "Принцип",
    text: "Кожен елемент вітрини відповідає на питання, яке хтось справді ставить. Плитка без питання — прикраса, яку перестають помічати." });
}

{
  const s = D.slide({ num: "05", title: "GET /providers: статус не має права брехати", pill: "absorb", notes: N() });
  D.states(s, { x: MX + 1.8, y: 2.1, items: [
    { label: "ok", sub: "перший успішний виклик", tone: "good", edge: "N збоїв" },
    { label: "degraded", sub: "поспіль збої в ланцюзі", tone: "warn" },
  ] });
  D.tile(s, { x: MX, y: 4.3, w: 5.85, h: 1.6, title: "Джерело вже є",
    body: "лічильник збоїв fallback-ланцюга з тижня 4; у кого є breaker — його готовий стан", tone: "acc" });
  D.band(s, { x: 6.87, y: 4.3, w: 5.85, h: 1.6, tone: "crit", label: "Пастка кешу",
    text: "Breaker оновлюється лише на реальних викликах — «down» триває довше за проблему." });
  D.band(s, { x: MX, y: 6.05, w: 12.1, h: 0.62, tone: "card",
    text: "Статус, прибитий до «ok», — брехня рівно в момент, коли правда потрібна." });
}

{
  const s = D.slide({ num: "06", title: "Тренд важливіший за снапшот", pill: "absorb", notes: N() });
  [["fallback росте щогодини", "основна модель деградує, а ви «не бачите» — відповіді ж ідуть"],
   ["cache-hit падає тиждень", "зламали ключ правкою або змінився профіль трафіку"],
   ["розподіл поїхав на strong", "або ескалацій більше, або роутер зламаний — бюджет горить удвічі"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 1.95, w: 3.85, h: 1.55, badge: i + 1, title: t, body: b, tone: "warn" }));
  // Слайд про динаміку, показаний статикою. Три спарклайни під картками дають
  // те, чого текст дати не може: напрямок. Знімок «зараз» цього не містить.
  {
    const base = 4.46, maxH = 0.62, bw = 0.28, pitch = 0.42;
    [[0.15, 0.22, 0.3, 0.42, 0.55, 0.7, 0.86, 1.0],
     [1.0, 0.92, 0.8, 0.66, 0.5, 0.38, 0.26, 0.16],
     [0.2, 0.3, 0.28, 0.45, 0.6, 0.72, 0.88, 1.0],
    ].forEach((series, col) => {
      const cx = MX + col * 4.05 + 0.2;
      series.forEach((v, i) => {
        const hh = maxH * v;
        s.addShape("rect", { x: cx + i * pitch, y: base - hh, w: bw, h: hh,
          fill: { color: P.warn }, line: { type: "none" } });
      });
      s.addShape("line", { x: cx, y: base + 0.02, w: 8 * pitch - (pitch - bw), h: 0,
        line: { color: P.line, width: 1 } });
    });
    s.addText("той самий знімок «зараз» — три різні історії", { x: MX, y: base + 0.08, w: 12.1, h: 0.22,
      fontFace: F.mono, fontSize: 8.5, color: P.faint, charSpacing: 1, margin: 0 });
  }
  D.band(s, { x: MX, y: 4.86, w: 12.1, h: 1.15, tone: "acc", label: "Анатомія алерту — чотири обов'язкові частини",
    text: "метрика (error rate) + поріг (понад 5%) + тривалість (протягом 15 хвилин) + адресат (хто прокидається). Тривалість пропускають найчастіше — і отримують сирену на кожен чих." });
  D.band(s, { x: MX, y: 6.16, w: 12.1, h: 0.55, tone: "card", text: "Снапшот каже «зараз погано». Тренд каже «стає гірше» — і дає час." });
}

{
  const s = D.slide({ num: "07", title: "Скільки — це нормально: SLI, SLO, бюджет помилок", pill: "absorb", notes: N() });
  D.layers(s, { x: MX, y: 1.95, w: 12.1, h: 0.68, gap: 0.12, items: [
    { label: "SLI", body: "показник, який ви міряєте: частка успішних відповідей, p95 latency" },
    { label: "SLO", body: "цільове значення, про яке домовилися: «99% успішних», «p95 ≤ 3 с»", tone: "acc" },
    { label: "Бюджет помилок", body: "1% невдач дозволено: 10 000 звернень = 100 невдач на тиждень", tone: "good" },
  ] });
  // Unit-chart: 100 квадратів = 100% звернень, один червоний = увесь бюджет помилок.
  // Чесний масштаб без спотворення (Tufte): «1%» словами і «ось цей один квадрат»
  // сприймаються по-різному, і саме друге змушує ставитися до бюджету серйозно.
  {
    const gx = MX, gy = 4.42, cell = 0.13, pitch = 0.175, cols = 20;
    for (let i = 0; i < 100; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      s.addShape("rect", { x: gx + c * pitch, y: gy + r * pitch, w: cell, h: cell,
        fill: { color: i === 99 ? P.crit : P.goodbg }, line: { type: "none" } });
    }
    const gw = cols * pitch - (pitch - cell);
    s.addText([{ text: "100 звернень", options: { bold: true, color: P.good } },
               { text: "  ·  один червоний квадрат — увесь ваш тижневий бюджет невдач", options: { color: P.soft } }],
      { x: gx + gw + 0.45, y: gy + 0.05, w: 12.72 - (gx + gw + 0.45), h: 0.4,
        fontFace: F.body, fontSize: 12.5, valign: "middle", margin: 0 });
    s.addText("на 10 000 звернень на тиждень це 100 невдач — і вони закінчуються швидше, ніж здається",
      { x: gx + gw + 0.45, y: gy + 0.48, w: 12.72 - (gx + gw + 0.45), h: 0.4,
        fontFace: F.body, fontSize: 11.5, italic: true, color: P.faint, valign: "middle", margin: 0 });
  }
  D.band(s, { x: MX, y: 5.45, w: 12.1, h: 0.75, tone: "good", label: "Принцип",
    text: "«Uptime 99.9%» — марна обіцянка. Робочий SLI — частка змістовних відповідей." });
  D.band(s, { x: MX, y: 6.28, w: 12.1, h: 0.45, tone: "warn",
    text: "Ваш лог його поки не порахує: заглушка пише той самий 503." });
}

{
  const s = D.slide({ num: "07", title: "Алерт — це прохання прокинутися", pill: "absorb", notes: N() });
  [["Симптом, не причина", "«частка успішних упала» — будити завжди; «429 зросло» — причина, будити нечесно"],
   ["«Прокинутися» ≠ «подивитися вранці»", "будити — лише те, що шкодить зараз; решта — черга завдань"],
   ["Кожен алерт має інструкцію", "спрацював — що робити першим? Це runbook останнього уроку"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 1.95, w: 3.85, h: 1.95, badge: i + 1, title: t, body: b, tone: "acc" }));
  D.band(s, { x: MX, y: 4.3, w: 12.1, h: 1.35, tone: "crit", label: "Типова помилка",
    text: "Окремі 5xx і таймаути — нормальний фон. Алерт — на відхилення в часі." });
  D.band(s, { x: MX, y: 5.8, w: 12.1, h: 0.6, tone: "card",
    text: "Мітки — тільки осяжні. User_id живе в лозі, не в метриках." });
}

{
  const s = D.slide({ num: "08", title: "Таксономія помилок: категорія визначає дію", pill: "absorb", opt: true, notes: N() });
  D.table(s, { x: MX, y: 2.1, w: 12.1, colW: [3.4, 4.4, 4.3], rowH: 0.56, size: 11.5,
    head: ["категорія", "приклад", "що робити"],
    rows: [
      { cells: ["429 провайдера", "вичерпані ліміти", "розводити трафік, домовлятися про квоту"], tone: "warn" },
      { cells: ["timeout інструмента", "зовнішня система не відповіла", "перевіряти інтеграцію, не модель"] },
      { cells: ["відмова guardrail", "injection або заборонений вміст", "це успіх захисту, а не збій"], tone: "good" },
    ] });
  D.band(s, { x: MX, y: 4.55, w: 12.1, h: 1.2, tone: "acc",
    text: "Один лічильник «помилки» змішує три різні світи. Окремі лічильники за причинами перетворюють цифру на маршрут дій." });
}

{
  const s = D.slide({ num: "09", title: "Трейс і спани: коли одного request_id мало", pill: "absorb", notes: N() });
  D.flow(s, { x: MX, y: 2.05, w: 12.1, h: 0.78, size: 11, items: [
    { label: "request_id", tone: "acc" }, { label: "+ step" }, { label: "+ attempt" }, { label: "шлях запиту відновлено", tone: "good" }] });
  [["Трейс", "усе, що сталося в межах одного звернення користувача"],
   ["Спан", "один крок усередині: виклик, інструмент, guardrail — зі своїм статусом"],
   ["Дерево спанів", "у кожного є батько — видно не лише «що було», а й «що з чого виросло»"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 3.2, w: 3.85, h: 1.75, badge: i + 1, title: t, body: b, tone: "card" }));
  D.band(s, { x: MX, y: 5.25, w: 12.1, h: 1.15, tone: "good", label: "Закладіть відразу",
    text: "Ідентифікатор народжується на вході й стоїть у кожному рядку лога." });
}

// ─── стрімінг: чому лог варто мислити ширше за HTTP (доважок блоку 09) ───
{
  const s = D.slide({ num: "09", title: "Стрімінг змінює самі метрики", pill: "absorb",
    kicker: "Знати заздалегідь дешевше, ніж переробляти лог", notes: N() });
  [["Один час стає трьома", "час до першого токена, повна генерація, час до останнього байта"],
   ["Помилка посеред успіху", "стрім почався з 200 і обірвався: для HTTP гаразд, для користувача — ні"],
   ["Кеш і guardrails складнішають", "кешувати можна лише зібрану відповідь; вихідна перевірка мусить уміти обірвати потік"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 2.1, w: 3.85, h: 1.95, badge: i + 1, title: t, body: b, tone: i === 1 ? "crit" : "card" }));
  // «Один час стає трьома» — це про відрізки на шкалі. Поки вони перелічені
  // словами, вони читаються як три окремі метрики, а не як частини однієї події.
  {
    const ty = 4.28, th = 0.34, x0 = MX + 1.0, w1 = 2.6, w2 = 7.5;
    s.addShape("roundRect", { x: x0, y: ty, w: w1, h: th, rectRadius: 0.06,
      fill: { color: P.acctint }, line: { color: P.acc, width: 1 } });
    s.addText("час до 1-го токена", { x: x0, y: ty, w: w1, h: th, align: "center", valign: "middle",
      fontFace: F.mono, fontSize: 9, bold: true, color: P.acc, margin: 0 });
    s.addShape("roundRect", { x: x0 + w1 + 0.06, y: ty, w: w2, h: th, rectRadius: 0.06,
      fill: { color: P.goodbg }, line: { color: P.good, width: 1 } });
    s.addText("генерація — токен за токеном", { x: x0 + w1 + 0.06, y: ty, w: w2, h: th,
      align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: true, color: P.good, margin: 0 });
    [[x0, "запит"], [x0 + w1, "перший токен"], [x0 + w1 + w2 + 0.06, "останній байт"]]
      .forEach(([mx, lbl], i) => {
        s.addShape("ellipse", { x: mx - 0.05, y: ty + th / 2 - 0.05, w: 0.1, h: 0.1,
          fill: { color: P.ink }, line: { type: "none" } });
        s.addText(lbl, { x: mx - 1.1, y: ty + th + 0.06, w: 2.2, h: 0.22, align: "center",
          fontFace: F.mono, fontSize: 8.5, color: P.faint, margin: 0 });
      });
  }
  D.band(s, { x: MX, y: 5.12, w: 12.1, h: 1.3, tone: "acc", label: "Практичний висновок на сьогодні",
    text: "latency_ms і status — характеристика завершення відповіді, а не код HTTP." });
}

// ─── PII в лозі (доважок блоку 09) ───
{
  const s = D.slide({ num: "09", title: "Чого не має бути в лозі", pill: "absorb",
    kicker: "Логувати все — найпростіший спосіб зробити з лога сховище персональних даних", notes: N() });
  [["Повні тіла — не за замовчуванням", "ознак досить: довжина, токени, finish_reason, guardrail, які інструменти"],
   ["Тіла — семпл із терміном життя", "невелика частка, окреме сховище, автоматичне видалення"],
   ["Секрети й ключі — ніколи", "потрапляють через дампи запитів «для дебагу», трейси помилок і повні заголовки"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + i * 4.05, y: 2.1, w: 3.85, h: 2.3, badge: i + 1, title: t, body: b, tone: i === 2 ? "crit" : "card" }));
  D.band(s, { x: MX, y: 4.7, w: 12.1, h: 1.75, tone: "good", label: "Правило для кожного нового поля",
    text: "Усе залоговане ви зобов'язані захищати: лог — база даних, не блокнот." });
}

{
  const s = D.slide({ num: "10", title: "У продукті чи індустріальний стек", pill: "absorb", notes: N() });
  D.tile(s, { x: MX, y: 2.0, w: 5.85, h: 1.95, title: "Обов'язкова доріжка: у продукті",
    body: "метрики живуть усередині системи, поверх власного лога: жодної нової інфраструктури", tone: "acc" });
  D.tile(s, { x: 6.87, y: 2.0, w: 5.85, h: 1.95, title: "Індустріальний стек — надбудова",
    body: "/metrics і зовнішні дашборди піднімаються поруч, коли питання виходять за межі системи", tone: "warn" });
  D.band(s, { x: MX, y: 4.25, w: 12.1, h: 1.2, tone: "warn", label: "Лайфхак",
    text: "Раз на тиждень звіряйте плитку з SQL руками. Розбіжність — це або баг агрегації, або зміна, про яку ви не знали." });
  D.band(s, { x: MX, y: 5.6, w: 12.1, h: 0.8, tone: "card",
    text: "Порядок правильний: спершу видимість у продукті, потім — стек, якщо він справді потрібен." });
}

// ─── РОЗДІЛЮВАЧ · практика ───
{
  D.divider({ big: "ПРАКТИКА", sub: "стенд наживо — і чесна межа того, що він доводить",
    pill: "Лабораторна: чотири кроки + опційний", notes: N() });
}

{
  const s = D.slide({ title: "Зараз ви побачите — і навіщо", pill: "do", notes: N() });
  [["psql-агрегати руками", "count, p95, error rate — одним запитом"],
   ["GET /observability", "ті самі цифри + cache-hit і fallback"],
   ["консоль: усі шість плиток", "живі, з числами замість «—»"],
   ["«детектив»: серія __fail_503", "fallback і error rate ростуть, користувач не бачить 500"],
  ].forEach(([t, b], i) => D.tile(s, { x: MX + (i % 2) * 6.25, y: 1.9 + Math.floor(i / 2) * 1.8, w: 6.05, h: 1.6, badge: i + 1, title: t, body: b, tone: i === 3 ? "crit" : "good" }));
  D.band(s, { x: MX, y: 5.55, w: 12.1, h: 1.15, tone: "acc", label: "Навіщо",
    text: "Побачити, що моніторинг LLM-системи — це SQL по власному лозі плюс кілька лічильників. І навчитися впізнавати тихий інцидент — той, якого не видно в жодному uptime." });
}

{
  const s = D.slide({ title: "Лабораторна: чотири кроки + опційний", pill: "do", notes: N() });
  [["Порахувати руками", "psql: count, p95, error rate по сьогоднішньому дню", false],
   ["Оживити /observability", "SQL-агрегати + лічильники в один ендпоінт", false],
   ["Звірити плитки з SQL", "шість плиток показують те саме, що запит", false],
   ["Відтворити «детектива»", "серія __fail_503 → метрики ростуть без 500 користувачу", false],
   ["Таксономія помилок · опційно", "окремі лічильники за причинами", true],
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
  D.tile(s, { x: MX, y: 1.9, w: 3.9, h: 2.35, title: "Моніторинг — це ваш лог", body: "SQL по таблиці, яку ви писали з першого уроку", tone: "good" });
  D.tile(s, { x: 4.72, y: 1.9, w: 3.9, h: 2.35, title: "Плитки відповідають на питання", body: "шість цифр, кожна з приводу, а не для краси", tone: "acc" });
  D.tile(s, { x: 8.82, y: 1.9, w: 3.9, h: 2.35, title: "Тихий інцидент видно", body: "fallback і error rate ростуть, поки uptime зелений", tone: "crit" });
  D.band(s, { x: MX, y: 4.70, w: 12.1, h: 1.75, tone: "card",
    text: "Видимість є. Наступного уроку до неї додається судження: не «скільки запитів», а «чи стали відповіді гіршими» — і це вже перевірки якості." });
}

{
  const s = D.slide({ title: "Перевір себе", pill: "connect", notes: N() });
  s.addShape("roundRect", { x: MX, y: 1.95, w: 12.1, h: 4.00, rectRadius: 0.12, fill: { color: P.card }, line: { color: P.line, width: 1 } });
  D.checklist(s, { x: MX + 0.45, y: 2.3, w: 11.3, cols: 2, h: 3.20, size: 14, items: [
    "усі шість плиток живі й звірені з SQL",
    "поясню, чому алерти на p95, а не на середнє",
    "відтворю тихий інцидент і покажу його в метриках",
    "назву, що додати в лог для зрізу по тенантах",
  ] });
  s.addText("Де завагалися — туди і повертайтеся. Питання — у канал потоку або на Q&A.",
    { x: MX, y: 6.20, w: 12, h: 0.35, fontFace: F.body, fontSize: 12, italic: true, color: P.faint, margin: 0 });
}

{
  const s = D.slide({ title: "Антипатерни тижня", pill: "connect", notes: N() });
  [["Алерт на середню latency", "згладить і сплеск таймаутів, і деградацію провайдера"],
   ["Алерт на кожну помилку", "десять повідомлень щодня і жодної реакції"],
   ["Плитка без питання", "прикраса, яку перестають помічати за тиждень"],
   ["Статус провайдера прибитий до «ok»", "брехня рівно в момент, коли правда потрібна"],
   ["User_id у мітках метрик", "сховище метрик вибухає на кардинальності"],
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
    body: "• закріпити лабу: всі шість плиток живі, звірені з SQL\n\n• відтворити «детектива»: інцидент видно в метриках, користувач не бачить 500\n\n• сформулювати по одному операційному питанню на кожну плитку" });
  D.tile(s, { x: 6.87, y: 1.9, w: 5.85, h: 2.4, title: "Опційно", tone: "warn",
    body: "• таксономія помилок: окремі лічильники за причинами (429 провайдера, timeout інструмента, відмова guardrail)" });
  s.addShape("roundRect", { x: MX, y: 4.6, w: 12.1, h: 1.6, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.acc, width: 1.5 } });
  s.addText("ДЗ тижня 5 — після наступного уроку", { x: MX + 0.3, y: 4.8, w: 11.5, h: 0.4, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
  s.addText("Воно об'єднує спостережуваність і evals: сьогоднішні ендпоінти вже у вас в руках; після наступного уроку додадуться власні eval-кейси в golden dataset — і тиждень здається одним PR.",
    { x: MX + 0.3, y: 5.25, w: 11.5, h: 0.8, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
}

D.closingSlide({
  summary: [
    "найдорожчі інциденти LLM-систем не дають жодної помилки",
    "весь моніторинг ядра — SQL по власному лозі плюс кілька лічильників",
    "p95, а не середнє; перцентилі не усереднюються",
    "плитка існує, лише якщо відповідає на питання, яке хтось ставить",
    "SLO — на те, що відчуває користувач, і має бюджет помилок",
  ],
  nextTitle: "Наступний крок → Урок 10 · Golden dataset і eval suite",
  nextBody: "Ви бачите, що система робить. Але «відповіді стали гіршими» жодна з шести плиток не покаже. Наступний урок дає якості число: golden dataset, grader, поріг і exit code — той самий, що на тижні 6 стане гейтом у CI.",
  notes: N(),
});

// ─── ДЯКУЮ (шаблон, сл. 42) ───
D.thanksSlide({ notes: N() });

const OUT = process.env.DECKS_OUT || SRC;
D.save(path.join(OUT, "L09.pptx"), path.join(OUT, "L09-script.md"));
