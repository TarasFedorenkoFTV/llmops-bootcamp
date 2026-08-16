// deck_lib2.js — візуальний каркас колод LLMOps Bootcamp · шаблон Neoversity
// Джерело стилю: офіційний шаблон «Neoversity (White)», майстер 2 (брендований).
//   • фон — брендовий градієнт із ассетів шаблону, у МАЙСТЕР-слайді (один раз);
//   • контент лежить прямо на градієнті, білим по темному — як на 32 з 42
//     слайдів шаблону; біла картка там використовується лише на 7, тож від неї
//     відмовились: із нею слайд читався як білий із рамкою, а не як шаблон;
//   • акцент — фіолетовий #5A05F4 (суцільні панелі) і #C9A6FF (текст на темному);
//   • кожна пара «текст на тлі» перевірена на контраст >= 4.5:1;
//   • лого Neoversity — біла версія, унизу зліва; вордмарк — на обкладинках.
// Начитка НЕ вбудовується в pptx — збирається в окремий сценарій LNN-script.md.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// Палітра Neoversity — ТЕМНА тема, як у шаблоні: контент лежить прямо на
// градієнті, білим по темному. Кольори виведені з брендового фіолета
// #5A05F4; кожна пара «текст на тлі» перевірена на контраст >= 4.5:1.
const P = {
  bg: "0E0B14", card: "17141F", ink: "FFFFFF", soft: "AFA9BE", faint: "8A82A0", line: "2E2A3A",
  acc: "C9A6FF", accsolid: "5A05F4", acctint: "1C1140", accsoft: "9B7BE8",
  good: "5FD6A0", goodbg: "102A20", warn: "E8A857", warnbg: "2A2010", crit: "FF7B7B", critbg: "2E1418",
  codebg: "12101A", darktext: "D8D4E4", dim: "8A82A0",
  // підсвітка коду — окремі ключі, бо раніше ці кольори були захардкоджені
  // в кожному gen-файлі й не пережили б жодної зміни теми
  codeKey: "C9A6FF", codeStr: "7FD9A6", codeNum: "F0B36B",
  cover: "0E0B14", coverGlow: "3A1189", coverInk: "FFFFFF", coverSub: "C9B8FB",
};
const F = { body: "Montserrat", mono: "Courier New" };
const W = 13.333, H = 7.5, MX = 0.62;

// ── метрики Montserrat SemiBold/Bold для заголовків ──────────────────────────
// Ширини глифів (1/1000 em) для символів, що трапляються в заголовках. Потрібні,
// щоб ЗНАТИ на етапі генерації, чи заголовок переноситься на другий рядок:
// бокс заголовка має фіксовану висоту + valign:middle, тож 2-рядковий заголовок
// росте ВНИЗ і накриває те, що стоїть під ним на фіксованому y (кікер, маркер).
// Перевірено: збігається з кернінговим виміром PowerPoint на всіх 264 заголовках.
const TITLE_W = (() => {
  // формат: символ + РІВНО 4 цифри ширини (є глифи ширші за 1000: m, Ш, Щ, —)
  const src = " 0283%0877'0230(0357)0358+0599,0262-0386.0262/0392006791039230592505958066090637:0262=0599?0589A0766B0765C0733E0671F0639G0771H0808I0328K0740L0604M0955O0844P0732R0735S0638T0618U0788X0714_0500a0617b0690c0591d0692e0631f0387g0700h0691i0301j0307k0660l0301m1049n0691o0655p0690q0690r0431s0531t0435u0687v0598x0595y0598«0568»0568×0599І0335А0799Б0738В0745Г0593Д0831З0656К0735Л0799М0963Н0817О0842П0812Р0724С0726Т0637У0724Ч0749Ш1098Щ1130Я0734а0604б0673в0622г0514д0701е0643ж0913з0563и0710й0710к0642л0666м0815н0694о0654п0685р0694с0592т0535у0614ф0849х0592ц0704ч0634ш0971щ0971ь0605ю0903я0628є0592і0305ї0301—1000≠0599";
  const m = Object.create(null);
  for (let i = 0; i + 4 < src.length + 1; i += 5) m[src[i]] = +src.slice(i + 1, i + 5);
  return m;
})();
const TITLE_SIZE = 24;
// Реальний крок рядка Montserrat у PowerPoint (winAscent+winDescent = 1.379 em),
// зміряний на рендері: 69 px при 144 ppi = 0.479 in для 24 pt.
const TITLE_LINE = (1109 + 270) / 1000 * TITLE_SIZE / 72;
// На скільки зсувати все під заголовком за КОЖЕН додатковий рядок: бокс росте вниз
// на пів рядка, але 0.045" «повітря» під останнім рядком у ньому вже було —
// стільки становив зазор між низом літер і плашкою в однорядковому випадку.
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
const TONE = {
  acc:  { bg: P.acctint, fg: P.acc },
  good: { bg: P.goodbg, fg: P.good },
  warn: { bg: P.warnbg, fg: P.warn },
  crit: { bg: P.critbg, fg: P.crit },
  card: { bg: P.card,   fg: P.ink },
};

// Лого Neoversity як data-URI (незалежно від cwd)
const LOGO = (() => {
  try { return "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "assets", "neoversity-logo-white.png")).toString("base64"); }
  catch (e) { return null; }
})();

// Брендовий градієнтний фон — зібраний із самих ассетів шаблону Neoversity
// (image2+image3 поверх чорного). Живе в МАЙСТЕР-слайді, а не на кожному слайді:
// pptxgenjs не дедуплікує зображення (саме тому в колодах лежало 24 копії лого),
// тож фон на кожному слайді роздув би файл до сотень мегабайтів.
const BG = (() => {
  try { return "image/jpeg;base64," + fs.readFileSync(path.join(__dirname, "assets", "neo-bg.jpg")).toString("base64"); }
  catch (e) { return null; }
})();

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
  // Один майстер на всю колоду: чорна основа + градієнт як об'єкт майстра.
  // Так зображення потрапляє у файл рівно один раз.
  pres.defineSlideMaster({
    title: "NEO",
    background: { color: "000000" },
    objects: BG ? [{ image: { x: 0, y: 0, w: W, h: H, data: BG } }] : [],
  });
  const newSlide = () => pres.addSlide({ masterName: "NEO" });
  const script = [];
  let idx = 0;

  const t = (name) => TONE[name] || TONE.card;

  // лого внизу зліва (світлі слайди)
  function logo(s) {
    if (LOGO) s.addImage({ data: LOGO, x: MX, y: H - 0.66, w: 1.62, h: 0.5 });
  }
  // вордмарк на темних слайдах
  function wordmark(s, color = P.coverInk) {
    s.addText("NEOVERSITY", { x: MX, y: 0.42, w: 6, h: 0.3, fontFace: F.body, fontSize: 12, bold: true, color, charSpacing: 4, margin: 0 });
  }
  // темний фіолетовий фон для обкладинок; глибину дають контурні рамки титулу
  // (fill:none, без тексту) — тож детектор накладань їх не рахує.
  // Обкладинки лишаються на градієнті майстра — окрема заливка більше не потрібна.
  function coverBg() {}

  // ─────────────────────────── каркаси слайдів ───────────────────────────
  function titleSlide({ title, lead, notes }) {
    const s = newSlide(); idx++;
    coverBg(s);
    wordmark(s);
    // концентричні рамки — знак «контур керування»
    for (let i = 0; i < 3; i++) {
      s.addShape("roundRect", { x: 9.95 + i * 0.42, y: 1.35 + i * 0.42, w: 3.0 - i * 0.84, h: 3.0 - i * 0.84,
        rectRadius: 0.16, fill: { type: "none" }, line: { color: P.accsoft, width: 1, transparency: i === 0 ? 76 : i === 1 ? 58 : 34 } });
    }
    s.addText(`ТИЖДЕНЬ ${week} · УРОК ${lesson} З 12`, { x: MX, y: 1.7, w: 8, h: 0.3, fontFace: F.mono, fontSize: 12, bold: true, color: P.coverSub, charSpacing: 3, margin: 0 });
    s.addText(title, { x: MX, y: 2.15, w: 9.0, h: 2.0, fontFace: F.body, fontSize: 40, bold: true, color: P.coverInk, valign: "top", lineSpacingMultiple: 1.02, margin: 0 });
    s.addText(lead, { x: MX, y: 4.5, w: 8.4, h: 1.2, fontFace: F.body, fontSize: 15, color: P.coverSub, lineSpacingMultiple: 1.2, margin: 0 });
    let cx = MX;
    WEEKS.forEach((label, i) => {
      const on = i === week - 1, cw = 0.3 + label.length * 0.079;
      s.addShape("roundRect", { x: cx, y: 6.35, w: cw, h: 0.34, rectRadius: 0.17, fill: on ? { color: P.accsolid } : { type: "none" }, line: on ? { type: "none" } : { color: P.accsoft, width: 1, transparency: 40 } });
      s.addText(label, { x: cx, y: 6.35, w: cw, h: 0.34, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: on, color: on ? "FFFFFF" : P.coverSub, margin: 0 });
      cx += cw + 0.12;
    });
    pushNotes(s, notes);
    script.push({ n: idx, title, notes });
    return s;
  }

  // Начитку СВІДОМО не кладемо в панель нотаток PowerPoint: вона живе окремим
  // текстовим файлом LNN-script.md поруч із LNN.pptx (пише save() нижче).
  // Так .pptx лишається чистим файлом для показу, а текст виступу редагується
  // й читається окремо, без відкривання презентації.
  function pushNotes() { /* навмисно порожньо — див. LNN-script.md */ }

  function slide({ num, title, kicker, pill, opt, notes }) {
    const s = newSlide(); idx++;
    let x = MX;
    if (num) {
      s.addText(num, { x, y: 0.44, w: 0.7, h: 0.6, align: "left", valign: "middle", fontFace: F.mono, fontSize: 26, bold: true, color: P.acc, margin: 0 });
      x += 0.78;
    }
    s.addText(title, { x, y: 0.42, w: TITLE_R - x, h: 0.66, fontFace: F.body, fontSize: 24, bold: true, color: P.ink, valign: "middle", margin: 0 });
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
    const marker = (label, bg, fg) => {
      const pw = 0.28 + label.length * 0.095;
      s.addShape("roundRect", { x: mx, y: ty, w: pw, h: 0.28, rectRadius: 0.14, fill: { color: bg }, line: { type: "none" } });
      s.addText(label, { x: mx, y: ty, w: pw, h: 0.28, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: true, color: fg, charSpacing: 1, margin: 0 });
      mx += pw + 0.12;
    };
    if (pill) {
      const map = { absorb: ["ТЕОРІЯ", P.acc, P.acctint], do: ["ПРАКТИКА", P.good, P.goodbg], connect: ["РЕФЛЕКСІЯ", P.warn, P.warnbg] };
      const m = map[pill]; if (m) marker(m[0], m[1], m[2]);
    }
    if (opt) marker("ОПЦІЙНО", P.warnbg, P.warn);
    logo(s);
    s.slideNumber = { x: W - 0.9, y: H - 0.46, w: 0.4, h: 0.3, fontFace: F.mono, fontSize: 8.5, color: P.faint };
    pushNotes(s, notes);
    script.push({ n: idx, title, notes });
    return s;
  }

  function closingSlide({ summary, nextTitle, nextBody, notes }) {
    const s = newSlide(); idx++;
    coverBg(s);
    wordmark(s);
    s.addText(`ПІДСУМОК УРОКУ ${lesson}`, { x: MX, y: 0.95, w: 8, h: 0.3, fontFace: F.mono, fontSize: 11, bold: true, color: P.coverSub, charSpacing: 3, margin: 0 });
    summary.forEach((txt, i) => {
      const y = 1.5 + i * 0.72;
      s.addShape("ellipse", { x: MX, y: y + 0.1, w: 0.16, h: 0.16, fill: { color: P.accsolid }, line: { type: "none" } });
      s.addText(txt, { x: MX + 0.34, y, w: 11.4, h: 0.6, fontFace: F.body, fontSize: 15, color: P.coverInk, valign: "top", lineSpacingMultiple: 1.1, margin: 0 });
    });
    const y0 = 1.5 + summary.length * 0.72 + 0.35;
    s.addShape("roundRect", { x: MX, y: y0, w: 12.1, h: H - y0 - 0.7, rectRadius: 0.14, fill: { color: P.card }, line: { color: P.line, width: 1 } });
    s.addText(nextTitle, { x: MX + 0.28, y: y0 + 0.22, w: 11.5, h: 0.35, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
    s.addText(nextBody, { x: MX + 0.28, y: y0 + 0.62, w: 11.5, h: H - y0 - 1.55, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", lineSpacingMultiple: 1.15, margin: 0 });
    pushNotes(s, notes);
    script.push({ n: idx, title: "Підсумок і наступний крок", notes });
    return s;
  }

  // ─────────────────────────── смислові примітиви ───────────────────────────

  function stat(s, { x, y, w, h = 1.5, value, label, tone = "card", size = 40 }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: tone === "card" ? { color: P.line, width: 1 } : { type: "none" } });
    s.addText(value, { x: x + 0.16, y: y + 0.12, w: w - 0.32, h: h * 0.52, fontFace: F.body, fontSize: size, bold: true, color: c.fg, valign: "middle", margin: 0 });
    s.addText(label, { x: x + 0.16, y: y + h * 0.58, w: w - 0.32, h: h * 0.36, fontFace: F.body, fontSize: 11.5, color: tone === "card" ? P.soft : c.fg, valign: "top", margin: 0 });
  }

  function tile(s, { x, y, w, h, badge, title, body, tone = "card" }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: tone === "card" ? { color: P.line, width: 1 } : { type: "none" } });
    let ty = y + 0.2;
    if (badge !== undefined) {
      s.addShape("ellipse", { x: x + 0.22, y: ty, w: 0.42, h: 0.42, fill: { color: tone === "card" ? P.accsolid : c.fg }, line: { type: "none" } });
      s.addText(String(badge), { x: x + 0.22, y: ty, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12, bold: true, color: tone === "card" ? "FFFFFF" : c.bg, margin: 0 });
    }
    const tx = badge !== undefined ? x + 0.78 : x + 0.22;
    s.addText(title, { x: tx, y: ty - 0.03, w: w - (tx - x) - 0.22, h: 0.48, fontFace: F.body, fontSize: 14.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
    if (body) s.addText(body, { x: x + 0.22, y: ty + 0.55, w: w - 0.44, h: h - (ty - y) - 0.72, fontFace: F.body, fontSize: 12, color: tone === "card" ? P.soft : P.ink, valign: "top", lineSpacingMultiple: 1.08, margin: 0 });
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
      s.addShape("roundRect", { x: cx, y, w: bw, h, rectRadius: 0.1, fill: { color: c.bg }, line: it.tone ? { type: "none" } : { color: P.line, width: 1 } });
      s.addText(it.label, { x: cx + 0.06, y, w: bw - 0.12, h, align: "center", valign: "middle", fontFace: F.mono, fontSize: size, bold: !!it.tone, color: c.fg, margin: 0 });
      if (it.sub) s.addText(it.sub, { x: cx, y: y + h + 0.04, w: bw, h: 0.3, align: "center", fontFace: F.body, fontSize: 10, color: P.faint, margin: 0 });
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
      s.addShape("roundRect", { x: x + labelW, y: yy + rowH * 0.18, w: Math.max(0.15, barMax * r.value / max), h: rowH * 0.64, rectRadius: 0.05, fill: { color: c.fg }, line: { type: "none" } });
      s.addText(r.note, { x: x + labelW + barMax + 0.25, y: yy, w: noteW, h: rowH, fontFace: F.body, fontSize: 11.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
    });
  }

  function states(s, { x, y, items, r = 1.05 }) {
    const gap = (items.length > 2) ? 1.35 : 1.8;
    let cx = x;
    items.forEach((it, i) => {
      const c = t(it.tone || "card");
      s.addShape("ellipse", { x: cx, y, w: r, h: r, fill: { color: c.bg }, line: { color: c.fg, width: 1.5 } });
      s.addText(it.label, { x: cx, y, w: r, h: r, align: "center", valign: "middle", fontFace: F.mono, fontSize: 10.5, bold: true, color: c.fg, margin: 0 });
      if (it.sub) s.addText(it.sub, { x: cx - 0.35, y: y + r + 0.06, w: r + 0.7, h: 0.5, align: "center", fontFace: F.body, fontSize: 10.5, color: P.soft, margin: 0 });
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
      s.addShape("roundRect", { x, y: yy, w, h, rectRadius: 0.1, fill: { color: c.bg }, line: it.tone ? { type: "none" } : { color: P.line, width: 1 } });
      s.addText(it.label, { x: x + 0.24, y: yy, w: w * 0.34, h, fontFace: F.body, fontSize: 13.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
      s.addText(it.body, { x: x + 0.24 + w * 0.34, y: yy, w: w * 0.62 - 0.24, h, fontFace: F.body, fontSize: 11.5, color: it.tone ? P.ink : P.soft, valign: "middle", margin: 0 });
    });
  }

  function timeline(s, { x, y, w, marks }) {
    s.addShape("line", { x, y, w, h: 0, line: { color: P.accsoft, width: 2 } });
    marks.forEach((m, i) => {
      const mx = x + w * (i / (marks.length - 1));
      const c = t(m.tone || "acc");
      s.addShape("ellipse", { x: mx - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: c.fg }, line: { type: "none" } });
      s.addText(m.time, { x: mx - 0.75, y: y - 0.62, w: 1.5, h: 0.3, align: "center", fontFace: F.mono, fontSize: 10.5, bold: true, color: c.fg, margin: 0 });
      s.addText(m.label, { x: mx - 0.95, y: y + 0.2, w: 1.9, h: 0.7, align: "center", fontFace: F.body, fontSize: 11, color: P.soft, valign: "top", margin: 0 });
    });
  }

  // смуга-акцент: акцентна — суцільний фіолет + білий текст (сигнатура Neoversity)
  function band(s, { x, y, w, h = 1.05, label, text, tone = "acc" }) {
    const solid = tone === "acc";
    const c = t(tone);
    const bg = solid ? P.accsolid : c.bg;   // суцільний брендовий фіолет, не світлий текстовий
    const bodyColor = solid ? "FFFFFF" : P.ink;
    const labelColor = solid ? "FFFFFF" : c.fg;
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: bg }, line: tone === "card" ? { color: P.line, width: 1 } : { type: "none" } });
    if (label) s.addText(label.toUpperCase(), { x: x + 0.24, y: y + 0.14, w: w - 0.48, h: 0.24, fontFace: F.mono, fontSize: 9.5, bold: true, color: labelColor, charSpacing: 1.5, margin: 0 });
    s.addText(text, { x: x + 0.24, y: y + (label ? 0.42 : 0.16), w: w - 0.48, h: h - (label ? 0.56 : 0.32), fontFace: F.body, fontSize: 13, color: bodyColor, valign: "middle", lineSpacingMultiple: 1.12, margin: 0 });
  }

  function terms(s, { x, y, w, items, cols = 3, rowH = 1.15 }) {
    const cw = (w - (cols - 1) * 0.22) / cols;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const xx = x + col * (cw + 0.22), yy = y + row * (rowH + 0.22);
      s.addShape("roundRect", { x: xx, y: yy, w: cw, h: rowH, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
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
    const data = [head.map(h => ({ text: h, options: { fontFace: F.mono, fontSize: 9, bold: true, color: P.soft, fill: { color: "1F1B2A" }, charSpacing: 1 } }))];
    rows.forEach(r => data.push(r.cells.map((cText, i) => {
      const ct = (r.cellTones && r.cellTones[i]) ? t(r.cellTones[i]) : null;
      const c = ct || (r.tone ? t(r.tone) : null);
      return { text: cText, options: Object.assign({ fontSize: size },
        i === 0 ? { bold: true, color: c ? c.fg : P.ink } : { color: ct ? ct.fg : P.ink },
        c ? { fill: { color: c.bg } } : {}) };
    })));
    s.addTable(data, { x, y, w, colW, rowH, border: { pt: 0.5, color: P.line }, fontFace: F.body, valign: "middle", fill: { color: P.card }, margin: 0.08 });
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

  function checklist(s, { x, y, w, items, cols = 1 }) {
    const per = Math.ceil(items.length / cols), cw = w / cols;
    items.forEach((it, i) => {
      const col = Math.floor(i / per), row = i % per;
      const xx = x + col * cw, yy = y + row * 0.62;
      s.addShape("roundRect", { x: xx, y: yy + 0.06, w: 0.28, h: 0.28, rectRadius: 0.06, fill: { color: P.acctint }, line: { color: P.acc, width: 1 } });
      tick(s, { x: xx, y: yy + 0.06, size: 0.28, color: P.acc });
      s.addText(it, { x: xx + 0.42, y: yy, w: cw - 0.6, h: 0.42, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "middle", margin: 0 });
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

  return { pres, P, F, W, H, MX, TONE, titleSlide, slide, closingSlide,
           stat, tile, arrow, flow, bars, states, layers, timeline, band, code, table, checklist, terms,
           tick, cross, save };
}

module.exports = { createDeck, notesFrom, P, F, W, H, MX };
