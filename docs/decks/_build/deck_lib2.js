// deck_lib2.js — візуальний каркас колод LLMOps Bootcamp · шаблон Neoversity
// Джерело стилю: офіційний шаблон «Neoversity (White)», майстер 2 (брендований).
// Відтворено СТРУКТУРУ шаблону, не лише палітру. У шаблоні 42 слайди, з них 8
// службові (інструкція, бібліотека 3D-ассетів, каркаси схем), решта 34 — приклади:
//   • 16 — темний градієнт з ОДНИМ великим заголовком (розділювачі);
//   • 11 — БІЛА КАРТКА 91% площі з чорним текстом (змістові слайди);
//   •  5 — чорне полотно з білими плитками або таблицею;
//   •  2 — темний фон із білим текстом-визначенням.
// Тобто зі 18 змістових слайдів 11 — біла картка. Звідси:
//   • контентні слайди — біла картка, чорний текст; плашки НА ній чорні з білим
//     текстом (сл. 16), акцентні — суцільний #5A05F4 з білим (сл. 10, 15),
//     смуги-виноски — білі рядки з тонкою рамкою (сл. 13, 40, 41);
//   • обкладинка й підсумок — темний градієнт із ассетів шаблону, білим по темному;
//   • зелений і червоний — ТОЧКОВО, лише «правильно / помилка», кольором підпису;
//   • кожна пара «текст на тлі» перевірена на контраст >= 4.5:1(_build/contrast.py);
//   • дві палітри (P — картка, DK — темні слайди): та сама роль вимагає
//     протилежної яскравості на білому й на чорному, одним ключем не покрити.
// Начитка НЕ вбудовується в pptx — збирається в окремий сценарій LNN-script.md.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
// ── КОНТЕНТНІ СЛАЙДИ: біла картка ─────────────────────────────────────────
// Архетип шаблону, а не наш вибір: із 18 змістових слайдів шаблону 11 — біла
// картка 91% площі з ЧОРНИМ текстом (сл. 10, 11, 13, 15, 16, 20, 21, 22, 29,
// 31, 34), і сама інструкція шаблону (сл. 1) каже прямо: «використовуйте чорний
// колір для основного шрифту». Плашки лежать НА картці — чорні з білим текстом
// (сл. 16) або білі рядки з тонкою рамкою поряд із фіолетовим чипом (сл. 13, 40).
// Раніше я тримав увесь контент на градієнті, бо XML-детектор не бачив заливок
// через schemeClr і нарахував білих карток 7 із 42 замість фактичних.
const P = {
  cardbg: "FFFFFF",                     // полотно картки
  ink: "000000", soft: "434343", faint: "6B6B6B", line: "D9D9D9",
  // ДВА РІЗНІ сенси, які раніше сиділи в одному ключі:
  //   plate — плашка-блок: ЧОРНА з білим текстом (шаблон, сл. 16);
  //   card  — нейтральна панель, яку генератори малюють самі: на білій картці це
  //           БІЛИЙ рядок із тонкою рамкою (шаблон, сл. 13, 40, 41).
  // Поки ключ був один, темний текст генераторів лягав на чорну заливку.
  plate: "000000", card: "FFFFFF",
  acc: "5A05F4", accsolid: "5A05F4", acctint: "EDE7FD", accsoft: "5A05F4",
  blue: "1A4FBF", bluetint: "1A4FBF",
  good: "106B41", crit: "B3261E",
  // Текст ПОВЕРХ темних плашок і в коді. Ключі окремі саме тому, що та сама
  // «другорядна» роль вимагає протилежної яскравості на білому й на чорному.
  onink: "FFFFFF", onsoft: "E9E4F7",
  ongood: "3FCF8E", oncrit: "FF6B6B", onblue: "6BA0F8", onacc: "A98BFF",
  // Семантика на чорній плашці лишається кольором ПІДПИСУ, не заливкою.
  // Поверхня для виносок, які генератори малюють самотужки: світла нейтральна
  // (не зелена й не червона — саме через колірні заливки й були зауваження),
  // а сигнал дає колір підпису. Заливки в усіх трьох однакові НАВМИСНО.
  goodbg: "F5F3FA", warnbg: "F5F3FA", critbg: "F5F3FA", warn: "1A4FBF",
  rowlite: "F5F3FA",                    // підсвітка рядка таблиці — нейтральна
  codebg: "0A0810", darktext: "D8D4E4", dim: "9A94AA",
  codeKey: "A98BFF", codeStr: "6BA0F8", codeNum: "C9C4D6",
};
// ── ОБКЛАДИНКА Й ПІДСУМОК: лишаються на темному градієнті ─────────────────
// Ті самі ролі, але вивернуті: на чорному потрібні світлі барви. Тримаємо їх
// окремо, бо інакше один P.acc мусив би бути водночас читним на білому й на
// чорному, а це неможливо.
const DK = {
  ink: "FFFFFF", sub: "C4B3F5", acc: "A98BFF", soft: "8F72E6",
  panel: "000000", line: "5E4F85", solid: "5A05F4",
};
const F = { body: "Montserrat", mono: "Courier New", display: "Unbounded" };
const W = 13.333, H = 7.5, MX = 0.62;

// ── метрики Unbounded для заголовків ───────────────────────────────────────
// Ширини глифів (1/1000 em) для символів, що трапляються в заголовках. Потрібні,
// щоб ЗНАТИ на етапі генерації, чи заголовок переноситься на другий рядок:
// бокс має фіксовану висоту + valign:middle, тож 2-рядковий заголовок росте ВНИЗ
// і накриває те, що стоїть під ним на фіксованому y (кікер, маркер формату).
// Unbounded помітно ширший за Montserrat: 2-рядкових стало 134 з 264 замість 91.
const TITLE_W = (() => {
  // формат: символ + РІВНО 4 цифри ширини (в Unbounded є глифи ширші за 1000)
  const src = " 0265%1211'0229(0331)0331+0620,0261-0351.0258/0421008931047130804507758085490825:0294=0620?0653A0899B0847C0912D0896E0766F0740G0946H0910I0300K0832L0738M1177O0948P0779R0811S0803T0784U0862X0793_0482a0787b0784c0724d0788e0710f0538g0779h0736i0268j0268k0685l0268m1155n0743o0764p0786q0786r0506s0691t0555u0732v0714w1099x0646y0715«0619»0619×0620І0300А0899Б0809В0847Г0625Д1010З0810К0832Л0972М1177Н0910О0948П0906Р0779С0912Т0784У0848Ф1238Ч0842Ш1336Щ1409Я0822а0787б0769в0713г0529д0827е0710ж1100з0667и0782й0782к0683л0794м0947н0748о0764п0744р0786с0724т0626у0715ф1269х0646ц0797ч0693ш1124щ1183ь0662ю1029я0701є0726і0268ї0268—1162≠0620";
  const m = Object.create(null);
  for (let i = 0; i + 4 < src.length + 1; i += 5) m[src[i]] = +src.slice(i + 1, i + 5);
  return m;
})();
const TITLE_SIZE = 24;
// Крок рядка Unbounded у PowerPoint: winAscent+winDescent = 1548/1000 em.
const TITLE_LINE = 1548 / 1000 * TITLE_SIZE / 72;
// Зсув усього під заголовком за КОЖЕН додатковий рядок: бокс росте вниз на пів
// рядка, мінус 0.045" «повітря», що в ньому вже було.
const TITLE_DROP = TITLE_LINE / 2 - 0.045;

// Скільки рядків займе заголовок у боксі шириною avail (дюйми).
function titleLines(text, avail) {
  const wid = (s) => {
    let t = 0;
    for (const ch of s) t += TITLE_W[ch] !== undefined ? TITLE_W[ch] : 600;
    return t / 1000 * TITLE_SIZE / 72;
  };
  let n = 0;
  for (const para of String(text).split("\n")) {
    let cur = "", k = 1;
    for (const word of para.split(" ")) {
      const t = cur ? cur + " " + word : word;
      if (wid(t) <= avail || !cur) cur = t; else { k++; cur = word; }
    }
    n += k;
  }
  return n;
}
// Права межа заголовків: 8.10" ≈ 61% ширини. Це комфортна довжина рядка для 24 pt
// Montserrat (~55-60 знаків); ширші заголовки читаються гірше з задніх рядів.
// (Раніше межу виводили з «зони під відео експерта» у правому куті — відеовставок
// у колодах немає, тож зона скасована, а значення лишилося як типографське.)
const TITLE_R = 8.10;
const WEEKS = ["W1 Основа + промпти", "W2 Routing + cost", "W3 Кеш + tools", "W4 Надійність + безпека", "W5 Observability + evals", "W6 CI + фінал"];
// Тони на білій картці: плашка ЧОРНА (акцентна — фіолетова), текст білий,
// а семантику несе колір ПІДПИСУ на цій плашці. Заливки кольором немає взагалі —
// саме через неї раніше з'являлися зелені, червоні й коричневі плашки.
// Семантичні барви для елементів на БІЛОМУ тлі — темні варіанти тих самих
// ролей (світлі читаються лише на чорній плашці).
const TONE_ON_CARD = { good: P.good, warn: P.blue, crit: P.crit, acc: P.acc };
const TONE = {
  // Акцентна плитка — ЧОРНА з фіолетовим підписом, а не суцільно фіолетова.
  // У шаблоні суцільний #5A05F4 — це ОДИН акцентний блок на слайд (сл. 10, 15)
  // і чипи (сл. 13, 40), а плитки-блоки чорні (сл. 16). Коли tone:"acc" (а його
  // 160 вживань) заливався фіолетом, слайд ставав фіолетовою стіною.
  // Суцільний фіолет лишився за band() — тією самою «однією смугою».
  acc:  { bg: P.plate,    fg: P.onacc,  edge: null },
  good: { bg: P.plate,    fg: P.ongood, edge: null },
  warn: { bg: P.plate,    fg: P.onblue, edge: null },
  crit: { bg: P.plate,    fg: P.oncrit, edge: null },
  card: { bg: P.plate,    fg: P.onink,  edge: null },
};

// Лого Neoversity як data-URI (незалежно від cwd). Дві версії: біла — для
// темних обкладинок, чорна — для білої картки, де біла була б невидима.
const logoAsset = (name) => {
  try { return "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "assets", name)).toString("base64"); }
  catch (e) { return null; }
};
const LOGO = logoAsset("neoversity-logo-white.png");
const LOGO_DARK = logoAsset("neoversity-logo.png");
// Фото автора. Немає файлу — слайд усе одно збереться, з боксом «фото», рівно
// як заготовка в шаблоні. Підтримуються jpg і png.
const AUTHOR = logoAsset("author.jpg") || logoAsset("author.png");

// Брендові фони — зібрані з ассетів самого шаблону Neoversity, по одному на тип
// слайда, як у шаблоні (там під кожен тип свій готовий фон):
//   • content — лейаут CUSTOM_3: вордмарк NEOVERSITY + бордове й фіолетове світіння;
//   • cover   — лейаут CUSTOM_1: те саме плюс бордовий акцент праворуч.
// ВАЖЛИВО про складання: <a:srcRect> обрізає ДЖЕРЕЛО, потім результат вписується
// в рамку, і лише тоді <a:xfrm rot> крутить розміщену фігуру. Якщо крутити до
// обрізки, видно інший фрагмент image3 — саме там лежать зелений, бірюзовий і
// жовтий, яких у шаблоні на екрані немає. Живуть у МАЙСТЕР-слайдах, а не на
// кожному слайді: pptxgenjs не дедуплікує зображення.
const bgAsset = (name) => {
  try { return "image/jpeg;base64," + fs.readFileSync(path.join(__dirname, "assets", name)).toString("base64"); }
  catch (e) { return null; }
};
const BG = bgAsset("neo-bg-content.jpg");
const BG_COVER = bgAsset("neo-bg-cover.jpg");
const BG_DARK = bgAsset("neo-bg-dark.jpg");   // фінал: той самий фон без скляної «N»

function notesFrom(scriptPath) {
  const raw = fs.readFileSync(scriptPath, "utf8");
  const heads = [...raw.matchAll(/\r?\n## Слайд \d+ · ([^\n]*)\r?\n/g)].map(m => m[1].trim());
  const blocks = raw.split(/\r?\n## Слайд \d+ · [^\n]*\r?\n/).slice(1).map(s => s.trim());
  let i = 0;
  const next = () => {
    if (i >= blocks.length) throw new Error(`${path.basename(scriptPath)}: блоків начитки (${blocks.length}) менше, ніж слайдів`);
    return blocks[i++];
  };
  next.file = path.basename(scriptPath);
  next.total = blocks.length;
  next.used = () => i;
  next.heads = heads;
  return next;
}

function createDeck({ lesson, week, fileTitle, notes: reader }) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "LLMOps Bootcamp";
  pres.title = `Урок ${lesson} · ${fileTitle}`;
  // Два майстри — по одному на тип фону, як у шаблоні. Фон лежить у майстрі,
  // тож кожне зображення потрапляє у файл рівно один раз (на майстер).
  pres.defineSlideMaster({
    title: "NEO",
    background: { color: "000000" },
    objects: BG ? [{ image: { x: 0, y: 0, w: W, h: H, data: BG } }] : [],
  });
  pres.defineSlideMaster({
    title: "NEO_COVER",
    background: { color: "000000" },
    objects: BG_COVER ? [{ image: { x: 0, y: 0, w: W, h: H, data: BG_COVER } }] : [],
  });
  // Окремий майстер для фіналу: там текст іде на всю ширину і ліг би на хром «N».
  pres.defineSlideMaster({
    title: "NEO_DARK",
    background: { color: "000000" },
    objects: BG_DARK ? [{ image: { x: 0, y: 0, w: W, h: H, data: BG_DARK } }] : [],
  });
  const newSlide = () => pres.addSlide({ masterName: "NEO" });
  const newCoverSlide = () => pres.addSlide({ masterName: "NEO_COVER" });
  const newDarkSlide = () => pres.addSlide({ masterName: "NEO_DARK" });
  const script = [];
  let idx = 0;

  const t = (name) => TONE[name] || TONE.card;

  // Геометрія білої картки — виміряна з рендера шаблону (сл. 15, 16, 20, 34):
  // x 0.26…13.07, y 0.21…7.28, тобто 91% площі слайда.
  const CARD = { x: 0.26, y: 0.21, w: 12.81, h: 7.07, r: 0.28 };
  function card(s) {
    s.addShape("roundRect", { x: CARD.x, y: CARD.y, w: CARD.w, h: CARD.h,
      rectRadius: CARD.r, fill: { color: P.cardbg }, line: { type: "none" } });
  }
  // лого внизу зліва — чорна версія, бо картка біла
  function logo(s) {
    if (LOGO_DARK) s.addImage({ data: LOGO_DARK, x: MX, y: 6.92, w: 1.13, h: 0.35 });
  }
  // вордмарк на темних слайдах
  function wordmark(s, color = DK.ink) {
    s.addText("NEOVERSITY", { x: MX, y: 0.42, w: 6, h: 0.3, fontFace: F.body, fontSize: 12, bold: true, color, charSpacing: 4, margin: 0 });
  }
  // темний фіолетовий фон для обкладинок; глибину дають контурні рамки титулу
  // (fill:none, без тексту) — тож детектор накладань їх не рахує.
  // Обкладинки лишаються на градієнті майстра — окрема заливка більше не потрібна.
  function coverBg() {}

  // ─────────────────────────── каркаси слайдів ───────────────────────────
  function titleSlide({ title, lead, notes }) {
    const s = newCoverSlide(); idx++;
    coverBg(s);
    wordmark(s);
    // Праворуч — скляна «N» із ассетів шаблону (сл. 9 і 42). Вона впечена у фон
    // обкладинки, тож окремої фігури тут немає. Раніше на цьому місці стояли
    // мої власні концентричні рамки — у шаблоні такого елемента не існує.
    s.addText(`ТИЖДЕНЬ ${week} · УРОК ${lesson} З 12`, { x: MX, y: 1.7, w: 8, h: 0.3, fontFace: F.mono, fontSize: 12, bold: true, color: DK.sub, charSpacing: 3, margin: 0 });
    s.addText(title, { x: MX, y: 2.15, w: 9.0, h: 2.0, fontFace: F.display, fontSize: 36, color: DK.ink, valign: "top", lineSpacingMultiple: 1.02, margin: 0 });
    s.addText(lead, { x: MX, y: 4.5, w: 8.4, h: 1.2, fontFace: F.body, fontSize: 15, color: DK.sub, lineSpacingMultiple: 1.2, margin: 0 });
    let cx = MX;
    WEEKS.forEach((label, i) => {
      const on = i === week - 1, cw = 0.3 + label.length * 0.079;
      s.addShape("roundRect", { x: cx, y: 6.35, w: cw, h: 0.34, rectRadius: 0.17, fill: on ? { color: DK.solid } : { type: "none" }, line: on ? { type: "none" } : { color: DK.soft, width: 1, transparency: 40 } });
      s.addText(label, { x: cx, y: 6.35, w: cw, h: 0.34, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: on, color: on ? "FFFFFF" : DK.sub, margin: 0 });
      cx += cw + 0.12;
    });
    pushNotes(s, notes);
    script.push({ n: idx, title, notes });
    return s;
  }

  // ── РОЗДІЛЮВАЧ ─────────────────────────────────────────────────────────────
  // Архетип шаблону, найчастіший серед його прикладів: 16 із 34 — темний
  // градієнт з ОДНИМ великим заголовком (сл. 14, 25, 28, 32, 36–39, 42).
  // Типографіка виміряна зі шаблону: Unbounded, великими, 65 pt (рівно як
  // «ПРАКТИКА» на сл. 28), ліворуч від MX, у середній смузі слайда; знизу —
  // короткий підпис 15 pt і за потреби фіолетовий чип «що далі» (сл. 38).
  // Ні номера слайда, ні лого — у шаблонних розділювачах їх немає.
  // 65 pt тримає всі три наші слова: найдовше «РЕФЛЕКСІЯ» = 6.67" із 12.10".
  function divider({ big, sub, pill, notes }) {
    const s = newDarkSlide(); idx++;
    wordmark(s);
    s.addText(big, { x: MX, y: 2.72, w: 12.10, h: 1.50, fontFace: F.display,
      fontSize: 65, color: DK.ink, valign: "middle", margin: 0 });
    if (sub) {
      s.addText(sub, { x: MX, y: 4.40, w: 9.60, h: 0.52, fontFace: F.body,
        fontSize: 15, color: DK.sub, valign: "top", margin: 0 });
    }
    if (pill) {
      const label = "→  " + pill;
      const pw = Math.min(9.4, 0.70 + label.length * 0.098);
      s.addShape("roundRect", { x: MX, y: 5.22, w: pw, h: 0.52, rectRadius: 0.26,
        fill: { color: DK.solid }, line: { type: "none" } });
      s.addText(label, { x: MX, y: 5.22, w: pw, h: 0.52, align: "center", valign: "middle",
        fontFace: F.body, fontSize: 13, bold: true, color: DK.ink, margin: 0 });
    }
    pushNotes(s, notes);
    script.push({ n: idx, title: big, notes });
    return s;
  }

  // ── АВТОР ТА ВИКЛАДАЧ ──────────────────────────────────────────────────────
  // Архетип шаблону, сл. 11: біла картка на ~54% ліворуч (ім'я великим, роль,
  // лінійка, булети біографії) і темний закруглений бокс під фото праворуч, на
  // градієнті. Якщо файлу фото немає — бокс лишається з підписом «фото», рівно
  // як заготовка в самому шаблоні.
  function authorSlide({ name, role, bullets, notes }) {
    const s = newSlide(); idx++;
    const CW = 7.18;                                    // 54% ширини, як у шаблоні
    s.addShape("roundRect", { x: CARD.x, y: CARD.y, w: CW, h: CARD.h,
      rectRadius: CARD.r, fill: { color: P.cardbg }, line: { type: "none" } });
    s.addText(name, { x: 0.85, y: 0.70, w: CW - 1.1, h: 1.10, fontFace: F.display,
      fontSize: 34, color: P.ink, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
    s.addText(role, { x: 0.85, y: 1.90, w: CW - 1.1, h: 0.60, fontFace: F.body,
      fontSize: 14.5, color: P.soft, valign: "top", lineSpacingMultiple: 1.15, margin: 0 });
    s.addShape("line", { x: 0.85, y: 2.62, w: CW - 1.7, h: 0, line: { color: P.line, width: 1 } });
    const top = 2.90, gap = (CARD.y + CARD.h - 0.55 - top) / bullets.length;
    bullets.forEach((b, i) => {
      const yy = top + i * gap;
      s.addShape("ellipse", { x: 0.88, y: yy + 0.16, w: 0.11, h: 0.11, fill: { color: P.acc }, line: { type: "none" } });
      s.addText(b, { x: 1.18, y: yy, w: CW - 1.45, h: gap - 0.10, fontFace: F.body,
        fontSize: 11.5, color: P.ink, valign: "top", lineSpacingMultiple: 1.12, margin: 0 });
    });
    // Фото праворуч. Бокс КВАДРАТНИЙ — це теж геометрія шаблону (сл. 21 і 22:
    // 4.96×4.96" у позиції y 1.27), і саме вона дозволяє поставити квадратний
    // портрет без кадрування. У шаблоні є чотири пропорції боксів під фото
    // (0.84, 1.00, 2.12, 3.77) — беремо ту, що пасує до наявного фото.
    const px = 7.79, py = 1.27, pw = 4.96, ph = 4.96;
    if (AUTHOR) {
      s.addImage({ data: AUTHOR, x: px, y: py, w: pw, h: ph, rounding: false });
    } else {
      s.addShape("roundRect", { x: px, y: py, w: pw, h: ph, rectRadius: 0.24,
        fill: { color: DK.panel }, line: { color: DK.line, width: 1 } });
      s.addText("фото", { x: px, y: py, w: pw, h: ph, align: "center", valign: "middle",
        fontFace: F.body, fontSize: 15, color: DK.sub, margin: 0 });
    }
    pushNotes(s, notes);
    script.push({ n: idx, title: "Автор та викладач", notes });
    return s;
  }

  // ── ДЯКУЮ ──────────────────────────────────────────────────────────────────
  // Шаблон, сл. 42: одне слово на темному градієнті, Unbounded 73 pt.
  function thanksSlide({ notes }) {
    const s = newDarkSlide(); idx++;
    wordmark(s);
    s.addText("ДЯКУЮ", { x: MX, y: 3.10, w: 12.10, h: 1.60, fontFace: F.display,
      fontSize: 73, color: DK.ink, valign: "middle", margin: 0 });
    pushNotes(s, notes);
    script.push({ n: idx, title: "ДЯКУЮ", notes });
    return s;
  }

  // Начитку СВІДОМО не кладемо в панель нотаток PowerPoint: вона живе окремим
  // текстовим файлом LNN-script.md поруч із LNN.pptx (пише save() нижче).
  // Так .pptx лишається чистим файлом для показу, а текст виступу редагується
  // й читається окремо, без відкривання презентації.
  function pushNotes() { /* навмисно порожньо — див. LNN-script.md */ }

  function slide({ num, title, kicker, pill, opt, notes }) {
    const s = newSlide(); idx++;
    card(s);                       // біла картка 91% — полотно контентного слайда
    let x = MX;
    if (num) {
      s.addText(num, { x, y: 0.44, w: 0.7, h: 0.6, align: "left", valign: "middle", fontFace: F.mono, fontSize: 26, bold: true, color: P.acc, margin: 0 });
      x += 0.78;
    }
    s.addText(title, { x, y: 0.42, w: TITLE_R - x, h: 0.66, fontFace: F.display, fontSize: TITLE_SIZE, color: P.ink, valign: "middle", margin: 0 });
    // Бокс заголовка — фіксовані 0.66" з valign:middle, тож 2-рядковий заголовок
    // росте вниз на пів рядка. Усе, що нижче, зсуваємо на цю саму величину,
    // інакше плашка маркера (малюється ПІСЛЯ тексту) зрізає хвости літер р/у/ф/ц/j.
    const tDrop = (titleLines(title, TITLE_R - x) - 1) * TITLE_DROP;
    let ty = 1.12 + tDrop;
    if (kicker) {
      // Montserrat ширший за Calibri: довгий кікер переноситься на 2 рядки —
      // маркер ставимо під фактичний низ кікера, а не на фіксовану висоту.
      const kLines = String(kicker).length > 74 ? 2 : 1;
      const ky = 1.1 + tDrop;
      s.addText(kicker, { x, y: ky, w: TITLE_R - x, h: kLines * 0.24 + 0.04, fontFace: F.body, fontSize: 13, color: P.soft, valign: "top", lineSpacingMultiple: 1.0, margin: 0 });
      ty = ky + kLines * 0.24 + 0.05;
    }
    // маркер формату — маленька фіолетова плашка під заголовком (ліворуч, поза відео-зоною)
    let mx = x;
    const marker = (label, fg, bg, edge) => {
      const pw = 0.28 + label.length * 0.095;
      s.addShape("roundRect", { x: mx, y: ty, w: pw, h: 0.28, rectRadius: 0.14, fill: { color: bg },
        line: edge ? { color: edge, width: 1 } : { type: "none" } });
      s.addText(label, { x: mx, y: ty, w: pw, h: 0.28, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: true, color: fg, charSpacing: 1, margin: 0 });
      mx += pw + 0.12;
    };
    if (pill) {
      // Три маркери формату на БІЛІЙ картці: контурний фіолет → суцільний
      // фіолет → контурний синій. Три способи подачі всередині брендової
      // палітри замість трьох чужих барв (було фіолет/зелений/коричневий).
      const map = {
        absorb:  ["ТЕОРІЯ",    P.acc,    P.cardbg,   P.acc],
        do:      ["ПРАКТИКА",  P.onink,  P.accsolid, null],
        connect: ["РЕФЛЕКСІЯ", P.blue,   P.cardbg,   P.blue],
      };
      const m = map[pill]; if (m) marker(m[0], m[1], m[2], m[3]);
    }
    if (opt) marker("ОПЦІЙНО", P.soft, P.cardbg, P.line);
    logo(s);
    // Номер — усередині картки, темним: картка займає 91%, тож поза нею місця
    // для нього немає, а світлий номер на білому був би невидимий.
    s.slideNumber = { x: W - 1.05, y: 6.94, w: 0.4, h: 0.3, fontFace: F.mono, fontSize: 8.5, color: P.faint };
    pushNotes(s, notes);
    script.push({ n: idx, title, notes });
    return s;
  }

  function closingSlide({ summary, nextTitle, nextBody, notes }) {
    const s = newDarkSlide(); idx++;
    coverBg(s);
    wordmark(s);
    s.addText(`ПІДСУМОК УРОКУ ${lesson}`, { x: MX, y: 0.95, w: 8, h: 0.3, fontFace: F.mono, fontSize: 11, bold: true, color: DK.sub, charSpacing: 3, margin: 0 });
    summary.forEach((txt, i) => {
      const y = 1.5 + i * 0.72;
      s.addShape("ellipse", { x: MX, y: y + 0.1, w: 0.16, h: 0.16, fill: { color: DK.solid }, line: { type: "none" } });
      s.addText(txt, { x: MX + 0.34, y, w: 11.4, h: 0.6, fontFace: F.body, fontSize: 15, color: DK.ink, valign: "top", lineSpacingMultiple: 1.1, margin: 0 });
    });
    const y0 = 1.5 + summary.length * 0.72 + 0.35;
    s.addShape("roundRect", { x: MX, y: y0, w: 12.1, h: H - y0 - 0.7, rectRadius: 0.14, fill: { color: DK.panel }, line: { color: DK.line, width: 1 } });
    s.addText(nextTitle, { x: MX + 0.28, y: y0 + 0.22, w: 11.5, h: 0.35, fontFace: F.body, fontSize: 15, bold: true, color: DK.acc, margin: 0 });
    s.addText(nextBody, { x: MX + 0.28, y: y0 + 0.62, w: 11.5, h: H - y0 - 1.55, fontFace: F.body, fontSize: 12.5, color: DK.ink, valign: "top", lineSpacingMultiple: 1.15, margin: 0 });
    pushNotes(s, notes);
    script.push({ n: idx, title: "Підсумок і наступний крок", notes });
    return s;
  }

  // ─────────────────────────── смислові примітиви ───────────────────────────

  function stat(s, { x, y, w, h = 1.5, value, label, tone = "card", size = 40 }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: c.edge ? { color: c.edge, width: 1 } : { type: "none" } });
    s.addText(value, { x: x + 0.16, y: y + 0.12, w: w - 0.32, h: h * 0.52, fontFace: F.body, fontSize: size, bold: true, color: c.fg, valign: "middle", margin: 0 });
    s.addText(label, { x: x + 0.16, y: y + h * 0.58, w: w - 0.32, h: h * 0.36, fontFace: F.body, fontSize: 11.5, color: P.onsoft, valign: "top", margin: 0 });
  }

  function tile(s, { x, y, w, h, badge, title, body, tone = "card" }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: c.edge ? { color: c.edge, width: 1 } : { type: "none" } });
    let ty = y + 0.2;
    if (badge !== undefined) {
      // Кружок номера — завжди суцільний брендовий фіолет: це нумерація, а не
      // семантика. Раніше він фарбувався в колір тону, і на зеленому тоні
      // виходив зелений кружок із майже нечитним темним номером.
      s.addShape("ellipse", { x: x + 0.22, y: ty, w: 0.42, h: 0.42, fill: { color: P.accsolid }, line: { type: "none" } });
      s.addText(String(badge), { x: x + 0.22, y: ty, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12, bold: true, color: "FFFFFF", margin: 0 });
    }
    const tx = badge !== undefined ? x + 0.78 : x + 0.22;
    s.addText(title, { x: tx, y: ty - 0.03, w: w - (tx - x) - 0.22, h: 0.48, fontFace: F.body, fontSize: 14.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
    if (body) s.addText(body, { x: x + 0.22, y: ty + 0.55, w: w - 0.44, h: h - (ty - y) - 0.72, fontFace: F.body, fontSize: 12, color: P.onsoft, valign: "top", lineSpacingMultiple: 1.08, margin: 0 });
  }

  function arrow(s, { x, y, len, color = P.accsoft, dir = "right", dashed = false }) {
    if (dir === "right") {
      s.addShape("line", { x, y, w: len - 0.12, h: 0, line: { color, width: 1.25, dashType: dashed ? "dash" : "solid" } });
      s.addShape("triangle", { x: x + len - 0.16, y: y - 0.075, w: 0.16, h: 0.15, rotate: 90, fill: { color }, line: { type: "none" } });
    } else {
      s.addShape("line", { x, y, w: 0, h: len - 0.12, line: { color, width: 1.25, dashType: dashed ? "dash" : "solid" } });
      s.addShape("triangle", { x: x - 0.075, y: y + len - 0.16, w: 0.15, h: 0.16, rotate: 180, fill: { color }, line: { type: "none" } });
    }
  }

  function flow(s, { x, y, w, items, h = 0.72, size = 12 }) {
    const gap = 0.5;
    const total = items.reduce((a, it) => a + (it.w || 0), 0);
    const auto = (w - gap * (items.length - 1) - total) / items.filter(it => !it.w).length;
    let cx = x;
    items.forEach((it, i) => {
      const bw = it.w || auto;
      const c = t(it.tone || "card");
      s.addShape("roundRect", { x: cx, y, w: bw, h, rectRadius: 0.1, fill: { color: c.bg }, line: c.edge ? { color: c.edge, width: 1 } : { type: "none" } });
      s.addText(it.label, { x: cx + 0.06, y, w: bw - 0.12, h, align: "center", valign: "middle", fontFace: F.mono, fontSize: size, bold: !!it.tone, color: c.fg, margin: 0 });
      if (it.sub) s.addText(it.sub, { x: cx, y: y + h + 0.04, w: bw, h: 0.3, align: "center", fontFace: F.body, fontSize: 10, color: P.faint, margin: 0 });  // на картці, тож темний
      cx += bw;
      if (i < items.length - 1) { arrow(s, { x: cx + 0.1, y: y + h / 2, len: gap - 0.2, color: P.accsoft, dashed: items[i + 1].dashed }); cx += gap; }
    });
  }

  function bars(s, { x, y, w, rows, labelW = 2.4, noteW = 3.5, rowH = 0.55, gap = 0.3 }) {
    const barMax = w - labelW - noteW - 0.5;
    const max = Math.max(...rows.map(r => r.value));
    rows.forEach((r, i) => {
      const yy = y + i * (rowH + gap), c = t(r.tone || "acc");
      s.addText(r.label, { x, y: yy, w: labelW - 0.18, h: rowH, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "middle", align: "left", margin: 0 });
      // Смуга й підпис лежать на БІЛІЙ картці, тож беруть темний варіант тону:
      // c.fg — це колір тексту на ЧОРНІЙ плашці (білий), тут він був би невидимий.
      const bc = TONE_ON_CARD[r.tone || "acc"] || P.acc;
      s.addShape("roundRect", { x: x + labelW, y: yy + rowH * 0.18, w: Math.max(0.15, barMax * r.value / max), h: rowH * 0.64, rectRadius: 0.05, fill: { color: bc }, line: { type: "none" } });
      s.addText(r.note, { x: x + labelW + barMax + 0.25, y: yy, w: noteW, h: rowH, fontFace: F.body, fontSize: 11.5, bold: true, color: bc, valign: "middle", margin: 0 });
    });
  }

  function states(s, { x, y, items, r = 1.05 }) {
    const gap = (items.length > 2) ? 1.35 : 1.8;
    let cx = x;
    items.forEach((it, i) => {
      const c = t(it.tone || "card");
      s.addShape("ellipse", { x: cx, y, w: r, h: r, fill: { color: c.bg }, line: { type: "none" } });
      s.addText(it.label, { x: cx, y, w: r, h: r, align: "center", valign: "middle", fontFace: F.mono, fontSize: 10.5, bold: true, color: c.fg, margin: 0 });
      if (it.sub) s.addText(it.sub, { x: cx - 0.35, y: y + r + 0.06, w: r + 0.7, h: 0.5, align: "center", fontFace: F.body, fontSize: 10.5, color: P.soft, margin: 0 });  // на картці
      cx += r;
      if (i < items.length - 1) {
        arrow(s, { x: cx + 0.08, y: y + r / 2, len: gap - 0.16, color: P.acc });
        if (items[i].edge) s.addText(items[i].edge, { x: cx, y: y + r / 2 - 0.42, w: gap, h: 0.34, align: "center", fontFace: F.mono, fontSize: 9.5, color: P.acc, margin: 0 });
        cx += gap;
      }
    });
    return cx;
  }

  function layers(s, { x, y, w, items, h = 0.66, gap = 0.12 }) {
    items.forEach((it, i) => {
      const yy = y + i * (h + gap), c = t(it.tone || "card");
      s.addShape("roundRect", { x, y: yy, w, h, rectRadius: 0.1, fill: { color: c.bg }, line: c.edge ? { color: c.edge, width: 1 } : { type: "none" } });
      s.addText(it.label, { x: x + 0.24, y: yy, w: w * 0.34, h, fontFace: F.body, fontSize: 13.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
      s.addText(it.body, { x: x + 0.24 + w * 0.34, y: yy, w: w * 0.62 - 0.24, h, fontFace: F.body, fontSize: 11.5, color: P.onsoft, valign: "middle", margin: 0 });
    });
  }

  function timeline(s, { x, y, w, marks }) {
    s.addShape("line", { x, y, w, h: 0, line: { color: P.accsoft, width: 2 } });
    marks.forEach((m, i) => {
      const mx = x + w * (i / (marks.length - 1));
      const c = t(m.tone || "acc");
      const tc = TONE_ON_CARD[m.tone || "acc"] || P.acc;   // на білій картці
      s.addShape("ellipse", { x: mx - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: tc }, line: { type: "none" } });
      s.addText(m.time, { x: mx - 0.75, y: y - 0.62, w: 1.5, h: 0.3, align: "center", fontFace: F.mono, fontSize: 10.5, bold: true, color: tc, margin: 0 });
      s.addText(m.label, { x: mx - 0.95, y: y + 0.2, w: 1.9, h: 0.7, align: "center", fontFace: F.body, fontSize: 11, color: P.soft, valign: "top", margin: 0 });  // на картці
    });
  }

  // смуга-акцент: акцентна — суцільний фіолет + білий текст (сигнатура Neoversity)
  // Повторювані типи плашок отримують іконку в кружечку — візуальний якір,
  // за яким тип зчитується без читання підпису.
  const BAND_ICONS = [["ПРИНЦИП", "◆"], ["ТИПОВА ПОМИЛКА", "✕"], ["ПОРАДА", "★"], ["НАВІЩО", "?"]];
  function band(s, { x, y, w, h = 1.05, label, text, tone = "acc" }) {
    const solid = tone === "acc";
    const c = t(tone);
    // Не-акцентна смуга на білій картці — БІЛИЙ рядок із тонкою рамкою
    // (архетип шаблону, сл. 13/40/41), а не чорна плашка: чорних плашок на
    // слайді вже достатньо, і смуга-виноска мусить читатися як другорядна.
    const bg = solid ? P.accsolid : P.cardbg;
    const bodyColor = solid ? P.onink : P.ink;
    const labelColor = solid ? P.onink : (tone === "card" ? P.soft : TONE_ON_CARD[tone] || P.soft);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: bg }, line: solid ? { type: "none" } : { color: tone === "card" ? P.line : (TONE_ON_CARD[tone] || P.line), width: 1 } });
    const up = label ? label.toUpperCase() : "";
    const icon = BAND_ICONS.find(([k]) => up.startsWith(k));
    const ix = icon ? 0.50 : 0; // зсув тексту праворуч під іконку
    if (icon) {
      const d = 0.34, iy = y + h / 2 - d / 2;
      const circleFill = solid ? P.onink : (tone === "card" ? P.soft : TONE_ON_CARD[tone] || P.soft);
      const glyphColor = solid ? P.accsolid : "FFFFFF";
      s.addShape("ellipse", { x: x + 0.20, y: iy, w: d, h: d, fill: { color: circleFill }, line: { type: "none" } });
      s.addText(icon[1], { x: x + 0.20, y: iy, w: d, h: d, align: "center", valign: "middle", fontFace: "Arial", fontSize: 12, bold: true, color: glyphColor, margin: 0 });
    }
    if (label) s.addText(label.toUpperCase(), { x: x + 0.24 + ix, y: y + 0.14, w: w - 0.48 - ix, h: 0.24, fontFace: F.mono, fontSize: 9.5, bold: true, color: labelColor, charSpacing: 1.5, margin: 0 });
    s.addText(text, { x: x + 0.24 + ix, y: y + (label ? 0.42 : 0.16), w: w - 0.48 - ix, h: h - (label ? 0.56 : 0.32), fontFace: F.body, fontSize: 13, color: bodyColor, valign: "middle", lineSpacingMultiple: 1.12, margin: 0 });
  }

  function terms(s, { x, y, w, items, cols = 3, rowH = 1.15 }) {
    const cw = (w - (cols - 1) * 0.22) / cols;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const xx = x + col * (cw + 0.22), yy = y + row * (rowH + 0.22);
      s.addShape("roundRect", { x: xx, y: yy, w: cw, h: rowH, rectRadius: 0.1, fill: { color: P.cardbg }, line: { color: P.line, width: 1 } });
      s.addText(it.term, { x: xx + 0.2, y: yy + 0.12, w: cw - 0.4, h: 0.34, fontFace: F.mono, fontSize: 12.5, bold: true, color: P.acc, valign: "middle", margin: 0 });
      s.addText(it.def, { x: xx + 0.2, y: yy + 0.46, w: cw - 0.4, h: rowH - 0.58, fontFace: F.body, fontSize: 11.5, color: P.soft, valign: "top", lineSpacingMultiple: 1.05, margin: 0 });
    });
  }

  function code(s, { x, y, w, h, lines, size = 12 }) {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: P.codebg }, line: { color: P.line, width: 1 } });
    const runs = [];
    lines.forEach((ln, i) => ln.forEach((sg, j) =>
      runs.push({ text: sg.t, options: { fontFace: F.mono, fontSize: size, color: sg.c || P.darktext, breakLine: j === ln.length - 1 && i < lines.length - 1 } })));
    s.addText(runs, { x: x + 0.24, y: y + 0.16, w: w - 0.48, h: h - 0.32, valign: "top", lineSpacingMultiple: 1.3, margin: 0 });
  }

  function table(s, { x, y, w, head, rows, colW, rowH, size = 11.5 }) {
    // Шапка — ФІОЛЕТОВА, а не чорна. Чорна зливалася з рядком-акцентом (теж
    // чорним), і той читався як друга шапка: так було в 9 таблицях із 18.
    const data = [head.map(h => ({ text: h, options: { fontFace: F.mono, fontSize: 9, bold: true,
      color: P.onink, fill: { color: P.accsolid }, charSpacing: 1, align: "center" } }))];
    // Рядок-акцент — світла нейтральна підсвітка + ТЕМНИЙ семантичний текст.
    // Жорстка чорна заливка перебивала і шапку, і сусідні рядки; логіка та сама,
    // що для виносок: поверхня нейтральна, сигнал несе колір підпису.
    const semantic = (name) => (name ? (TONE_ON_CARD[name] || P.ink) : null);
    rows.forEach(r => data.push(r.cells.map((cText, i) => {
      const c = semantic((r.cellTones && r.cellTones[i]) || r.tone);
      return { text: cText, options: Object.assign({ fontSize: size, bold: i === 0 },
        { color: c || P.ink }, c ? { fill: { color: P.rowlite } } : {}) };
    })));
    s.addTable(data, { x, y, w, colW, rowH, border: { pt: 0.5, color: P.line }, fontFace: F.body, valign: "middle", fill: { color: P.cardbg }, margin: 0.08 });
  }

  // ✓ і ✕ (U+2713 / U+2715) ВІДСУТНІ і в Montserrat, і в Courier New — PowerPoint
  // підставляв чужу гарнітуру (тонкі волосяні штрихи не в стилі бренду). Малюємо
  // їх двома повернутими прямокутниками: гарнітурної залежності немає взагалі.
  function tick(s, { x, y, size = 0.28, color = P.acc }) {
    const k = size / 0.28, cx = x + size / 2, cy = y + size / 2, th = 0.030 * k;
    const seg = (len, mx, my, rot) => s.addShape("rect", {
      x: cx + mx * k - (len * k) / 2, y: cy + my * k - th / 2, w: len * k, h: th,
      rotate: rot, fill: { color }, line: { type: "none" },
    });
    seg(0.0636, -0.0395, 0.0275, 45);   // коротке плече, вниз-праворуч
    seg(0.1328, 0.0255, -0.0010, -50);  // довге плече, вгору-праворуч
  }

  function cross(s, { x, y, size = 0.42, color = P.crit }) {
    const cx = x + size / 2, cy = y + size / 2, len = size * 0.46, th = size * 0.082;
    [45, -45].forEach(rot => s.addShape("rect", {
      x: cx - len / 2, y: cy - th / 2, w: len, h: th,
      rotate: rot, fill: { color }, line: { type: "none" },
    }));
  }

  // `h` — висота, на яку рядки розкладаються РІВНОМІРНО. Без неї крок фіксований
  // 0.62", і тоді список тулиться вгорі панелі: на «Перевір себе» з чотирьох
  // пунктів це давало 2.3" порожнини під ним. Крок мусить залежати від
  // кількості пунктів, бо в різних уроках їх від чотирьох до шести.
  function checklist(s, { x, y, w, h, items, cols = 1, size = 12.5 }) {
    const per = Math.ceil(items.length / cols), cw = w / cols;
    const pitch = h ? h / per : 0.62;
    const box = Math.max(0.42, Math.min(0.72, pitch - 0.10));
    const bs = 0.28;                                     // чекбокс
    items.forEach((it, i) => {
      const col = Math.floor(i / per), row = i % per;
      const xx = x + col * cw, yy = y + row * pitch + (pitch - box) / 2;
      const by = yy + (box - bs) / 2;
      s.addShape("roundRect", { x: xx, y: by, w: bs, h: bs, rectRadius: 0.06, fill: { color: P.cardbg }, line: { color: P.acc, width: 1 } });
      tick(s, { x: xx, y: by, size: bs, color: P.acc });
      s.addText(it, { x: xx + 0.42, y: yy, w: cw - 0.6, h: box, fontFace: F.body, fontSize: size, color: P.ink, valign: "middle", margin: 0 });
    });
  }

  function assertNotesAligned() {
    if (!reader) return;
    if (reader.used() !== reader.total) {
      const extra = reader.total - reader.used();
      throw new Error(
        `${reader.file}: блоків начитки ${reader.total}, слайдів ${reader.used()}. ` +
        (extra > 0
          ? `Зайвих блоків: ${extra} — вони мовчки зсунули б начитку і обрізали хвіст. ` +
            `Останні прочитані: «${(reader.heads[reader.used() - 1] || "?")}»; ` +
            `перший невикористаний: «${(reader.heads[reader.used()] || "?")}». ` +
            `Або додайте слайд під цей блок, або злийте його з сусіднім.`
          : `Бракує блоків — допишіть начитку для решти слайдів.`));
    }
    const drift = [];
    reader.heads.forEach((h, k) => {
      const want = String((script[k] || {}).title || "").replace(/\s*\n\s*/g, " ");
      if (h && want && h !== want) drift.push(`  блок ${k + 1}: у .md «${h}» → слайд «${want}»`);
    });
    if (drift.length) {
      console.warn(`УВАГА ${reader.file}: заголовки ${drift.length} блок(ів) не збігаються з назвами слайдів.`);
      console.warn("Це нормально, якщо ви щойно перейменували слайд; і це зсув, якщо ні:");
      drift.slice(0, 8).forEach(d => console.warn(d));
    }
  }

  function save(deckPath, scriptPath) {
    assertNotesAligned();
    const md = [`# Сценарій начитки · Урок ${lesson} · ${fileTitle}`, "",
      `Слайдів: ${script.length}. Начитка: ${script.reduce((a, s) => a + (s.notes || "").split(/\s+/).filter(Boolean).length, 0)} слів.`,
      "", "---", ""];
    script.forEach(sl => {
      md.push(`## Слайд ${sl.n} · ${String(sl.title).replace(/\s*\n\s*/g, " ")}`, "", (sl.notes || "_(без начитки)_"), "");
    });
    fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
    fs.writeFileSync(scriptPath, md.join("\n"), "utf8");
    return pres.writeFile({ fileName: deckPath }).then(() => console.log("OK: " + deckPath + "  +  " + scriptPath));
  }

  return { pres, P, F, W, H, MX, TONE, titleSlide, slide, divider, authorSlide, thanksSlide, closingSlide,
           stat, tile, arrow, flow, bars, states, layers, timeline, band, code, table, checklist, terms,
           tick, cross, save };
}

module.exports = { createDeck, notesFrom, P, F, W, H, MX };
