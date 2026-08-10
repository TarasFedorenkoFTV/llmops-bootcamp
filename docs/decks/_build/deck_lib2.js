// deck_lib2.js — візуальний каркас колод LLMOps Bootcamp v2
// Регламент Neoversity: §2 Multimedia (кожен концептуальний слайд несе смислову візуалізацію),
// §5.1 ієрархія (один акцент), §5.2 мінімум тексту, §5.3 data-ink, §6.1 потік зліва направо.
// Начитка НЕ вбудовується в pptx — збирається в окремий сценарій LNN-script.md.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const P = {
  bg: "F6F7F9", card: "FFFFFF", ink: "1B1D23", soft: "565C6B", faint: "8A90A0",
  line: "E4E6EC", acc: "4038C4", accbg: "ECEBFB", accsoft: "C9C5F2",
  good: "177245", goodbg: "E9F3EE", warn: "9A5B12", warnbg: "F8F0E2",
  crit: "B3261E", critbg: "F9E9E8", dark: "14161C", darktext: "E8E9ED", dim: "6A7385",
};
const F = { body: "Calibri", mono: "Courier New" };
const W = 13.333, H = 7.5, MX = 0.62;
const WEEKS = ["W1 Основа + промпти", "W2 Routing + cost", "W3 Кеш + tools", "W4 Надійність + безпека", "W5 Observability + evals", "W6 CI + фінал"];
const TONE = {
  acc:  { bg: P.accbg,  fg: P.acc },
  good: { bg: P.goodbg, fg: P.good },
  warn: { bg: P.warnbg, fg: P.warn },
  crit: { bg: P.critbg, fg: P.crit },
  card: { bg: P.card,   fg: P.ink },
};

function createDeck({ lesson, week, fileTitle }) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "LLMOps Bootcamp";
  pres.title = `Урок ${lesson} · ${fileTitle}`;
  const FOOTER = `SupportGW · LLMOps Bootcamp · Урок ${lesson} з 12`;
  const script = [];           // {n, title, notes}
  let idx = 0;

  const t = (name) => TONE[name] || TONE.card;

  // ─────────────────────────── каркаси слайдів ───────────────────────────
  function titleSlide({ title, lead, notes }) {
    const s = pres.addSlide(); idx++;
    s.background = { color: P.acc };
    // геометричний мотив: контур керування (концентричні рамки), не декор — знак теми
    for (let i = 0; i < 3; i++) {
      s.addShape("roundRect", { x: 9.75 + i * 0.42, y: 1.55 + i * 0.42, w: 3.1 - i * 0.84, h: 3.1 - i * 0.84,
        rectRadius: 0.16, fill: { type: "none" }, line: { color: "FFFFFF", width: 1, transparency: i === 0 ? 78 : i === 1 ? 62 : 40 } });
    }
    s.addText(`ТИЖДЕНЬ ${week} · УРОК ${lesson} З 12`, { x: MX + 0.3, y: 1.55, w: 8, h: 0.3, fontFace: F.mono, fontSize: 12, bold: true, color: P.accsoft, charSpacing: 3, margin: 0 });
    s.addText(title, { x: MX + 0.3, y: 2.0, w: 8.9, h: 2.0, fontFace: F.body, fontSize: 40, bold: true, color: "FFFFFF", valign: "top", margin: 0 });
    s.addText(lead, { x: MX + 0.3, y: 4.15, w: 8.4, h: 1.15, fontFace: F.body, fontSize: 15, color: "DEDAF8", margin: 0 });
    let cx = MX + 0.3;
    WEEKS.forEach((label, i) => {
      const on = i === week - 1, cw = 0.3 + label.length * 0.079;
      s.addShape("roundRect", { x: cx, y: 5.95, w: cw, h: 0.34, rectRadius: 0.17, fill: on ? { color: "FFFFFF" } : { color: P.acc }, line: on ? { type: "none" } : { color: "8A83DC", width: 1 } });
      s.addText(label, { x: cx, y: 5.95, w: cw, h: 0.34, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: on, color: on ? P.acc : "CFCBF4", margin: 0 });
      cx += cw + 0.12;
    });
    script.push({ n: idx, title, notes });
    return s;
  }

  function slide({ num, title, kicker, pill, opt, notes }) {
    const s = pres.addSlide(); idx++;
    s.background = { color: P.bg };
    let x = MX;
    if (num) {
      s.addText(num, { x, y: 0.42, w: 0.62, h: 0.62, align: "left", valign: "middle", fontFace: F.mono, fontSize: 26, bold: true, color: P.accsoft, margin: 0 });
      x += 0.72;
    }
    s.addText(title, { x, y: 0.4, w: W - x - 3.0, h: 0.66, fontFace: F.body, fontSize: 25, bold: true, color: P.ink, valign: "middle", margin: 0 });
    if (kicker) s.addText(kicker, { x, y: 1.10, w: W - x - 3.0, h: 0.32, fontFace: F.body, fontSize: 13, color: P.soft, valign: "top", margin: 0 });
    let bx = W - MX;
    if (pill) {
      const map = { absorb: ["ТЕОРІЯ", P.accbg, P.acc], do: ["ПРАКТИКА", P.goodbg, P.good], connect: ["РЕФЛЕКСІЯ", P.warnbg, P.warn] };
      const [lab, bg, fg] = map[pill], pw = 1.25;
      bx -= pw;
      s.addShape("roundRect", { x: bx, y: 0.58, w: pw, h: 0.3, rectRadius: 0.15, fill: { color: bg }, line: { type: "none" } });
      s.addText(lab, { x: bx, y: 0.58, w: pw, h: 0.3, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: true, color: fg, charSpacing: 1, margin: 0 });
    }
    if (opt) {
      const pw = 1.05; bx -= pw + 0.12;
      s.addShape("roundRect", { x: bx, y: 0.58, w: pw, h: 0.3, rectRadius: 0.15, fill: { color: P.warnbg }, line: { type: "none" } });
      s.addText("ОПЦІЙНО", { x: bx, y: 0.58, w: pw, h: 0.3, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, bold: true, color: P.warn, charSpacing: 1, margin: 0 });
    }
    s.addText(FOOTER, { x: MX, y: H - 0.44, w: 6, h: 0.3, fontFace: F.mono, fontSize: 8.5, color: P.faint, margin: 0 });
    s.slideNumber = { x: W - 0.95, y: H - 0.44, w: 0.4, h: 0.3, fontFace: F.mono, fontSize: 8.5, color: P.faint };
    script.push({ n: idx, title, notes });
    return s;
  }

  function closingSlide({ summary, nextTitle, nextBody, notes }) {
    const s = pres.addSlide(); idx++;
    s.background = { color: P.acc };
    s.addText(`ПІДСУМОК УРОКУ ${lesson}`, { x: MX + 0.3, y: 0.85, w: 8, h: 0.3, fontFace: F.mono, fontSize: 11, bold: true, color: P.accsoft, charSpacing: 3, margin: 0 });
    summary.forEach((txt, i) => {
      const y = 1.4 + i * 0.72;
      s.addShape("ellipse", { x: MX + 0.3, y: y + 0.1, w: 0.16, h: 0.16, fill: { color: "FFFFFF" }, line: { type: "none" } });
      s.addText(txt, { x: MX + 0.62, y, w: 11.4, h: 0.6, fontFace: F.body, fontSize: 15, color: "FFFFFF", valign: "top", margin: 0 });
    });
    const y0 = 1.4 + summary.length * 0.72 + 0.35;
    s.addShape("roundRect", { x: MX + 0.3, y: y0, w: 11.7, h: H - y0 - 0.85, rectRadius: 0.14, fill: { color: "FFFFFF" }, line: { type: "none" } });
    s.addText(nextTitle, { x: MX + 0.55, y: y0 + 0.22, w: 11.2, h: 0.35, fontFace: F.body, fontSize: 15, bold: true, color: P.acc, margin: 0 });
    s.addText(nextBody, { x: MX + 0.55, y: y0 + 0.62, w: 11.2, h: H - y0 - 1.5, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "top", margin: 0 });
    s.addText(FOOTER, { x: MX + 0.3, y: H - 0.45, w: 6, h: 0.3, fontFace: F.mono, fontSize: 8.5, color: "B4AEEC", margin: 0 });
    script.push({ n: idx, title: "Підсумок і наступний крок", notes });
    return s;
  }

  // ─────────────────────────── смислові примітиви ───────────────────────────

  // велика цифра — §5.1: найважливіше найбільше
  function stat(s, { x, y, w, h = 1.5, value, label, tone = "card", size = 40 }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: tone === "card" ? { color: P.line, width: 1 } : { type: "none" } });
    s.addText(value, { x: x + 0.16, y: y + 0.12, w: w - 0.32, h: h * 0.52, fontFace: F.body, fontSize: size, bold: true, color: c.fg, valign: "middle", margin: 0 });
    s.addText(label, { x: x + 0.16, y: y + h * 0.58, w: w - 0.32, h: h * 0.36, fontFace: F.body, fontSize: 11.5, color: tone === "card" ? P.soft : c.fg, valign: "top", margin: 0 });
  }

  // плитка з номером/гліфом у колі — §5.4 колір функціональний
  function tile(s, { x, y, w, h, badge, title, body, tone = "card" }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: tone === "card" ? { color: P.line, width: 1 } : { type: "none" } });
    let ty = y + 0.2;
    if (badge !== undefined) {
      s.addShape("ellipse", { x: x + 0.22, y: ty, w: 0.42, h: 0.42, fill: { color: c.fg }, line: { type: "none" } });
      s.addText(String(badge), { x: x + 0.22, y: ty, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12, bold: true, color: c.bg === P.card ? "FFFFFF" : c.bg, margin: 0 });
    }
    const tx = badge !== undefined ? x + 0.78 : x + 0.22;
    s.addText(title, { x: tx, y: ty - 0.03, w: w - (tx - x) - 0.22, h: 0.48, fontFace: F.body, fontSize: 14.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
    if (body) s.addText(body, { x: x + 0.22, y: ty + 0.55, w: w - 0.44, h: h - (ty - y) - 0.72, fontFace: F.body, fontSize: 12, color: tone === "card" ? P.soft : P.ink, valign: "top", margin: 0 });
  }

  // стрілка: лінія + трикутна голова (надійніше за arrowType у рендерерах)
  function arrow(s, { x, y, len, color = P.faint, dir = "right", dashed = false }) {
    if (dir === "right") {
      s.addShape("line", { x, y, w: len - 0.12, h: 0, line: { color, width: 1.25, dashType: dashed ? "dash" : "solid" } });
      s.addShape("triangle", { x: x + len - 0.16, y: y - 0.075, w: 0.16, h: 0.15, rotate: 90, fill: { color }, line: { type: "none" } });
    } else {
      s.addShape("line", { x, y, w: 0, h: len - 0.12, line: { color, width: 1.25, dashType: dashed ? "dash" : "solid" } });
      s.addShape("triangle", { x: x - 0.075, y: y + len - 0.16, w: 0.15, h: 0.16, rotate: 180, fill: { color }, line: { type: "none" } });
    }
  }

  // потік зліва направо — §6.1
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
      if (i < items.length - 1) { arrow(s, { x: cx + 0.1, y: y + h / 2, len: gap - 0.2, dashed: items[i + 1].dashed }); cx += gap; }
    });
  }

  // порівняльні смуги — §5.3 Tufte: різницю показуємо довжиною, а не таблицею цифр
  function bars(s, { x, y, w, rows, labelW = 2.4, noteW = 3.5, rowH = 0.55, gap = 0.3 }) {
    const barMax = w - labelW - noteW - 0.5;
    const max = Math.max(...rows.map(r => r.value));
    rows.forEach((r, i) => {
      const yy = y + i * (rowH + gap), c = t(r.tone || "acc");
      s.addText(r.label, { x, y: yy, w: labelW - 0.18, h: rowH, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "middle", align: "right", margin: 0 });
      s.addShape("roundRect", { x: x + labelW, y: yy + rowH * 0.18, w: Math.max(0.15, barMax * r.value / max), h: rowH * 0.64, rectRadius: 0.05, fill: { color: c.fg }, line: { type: "none" } });
      s.addText(r.note, { x: x + labelW + barMax + 0.25, y: yy, w: noteW, h: rowH, fontFace: F.body, fontSize: 11.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
    });
  }

  // машина станів: кола + підписані переходи
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

  // шари стека — вертикальна побудова згори вниз
  function layers(s, { x, y, w, items, h = 0.66, gap = 0.12 }) {
    items.forEach((it, i) => {
      const yy = y + i * (h + gap), c = t(it.tone || "card");
      s.addShape("roundRect", { x, y: yy, w, h, rectRadius: 0.1, fill: { color: c.bg }, line: it.tone ? { type: "none" } : { color: P.line, width: 1 } });
      s.addText(it.label, { x: x + 0.24, y: yy, w: w * 0.34, h, fontFace: F.body, fontSize: 13.5, bold: true, color: c.fg, valign: "middle", margin: 0 });
      s.addText(it.body, { x: x + 0.24 + w * 0.34, y: yy, w: w * 0.62 - 0.24, h, fontFace: F.body, fontSize: 11.5, color: it.tone ? P.ink : P.soft, valign: "middle", margin: 0 });
    });
  }

  // таймлайн з мітками
  function timeline(s, { x, y, w, marks }) {
    s.addShape("line", { x, y, w, h: 0, line: { color: P.line, width: 2 } });
    marks.forEach((m, i) => {
      const mx = x + w * (i / (marks.length - 1));
      const c = t(m.tone || "acc");
      s.addShape("ellipse", { x: mx - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: c.fg }, line: { type: "none" } });
      s.addText(m.time, { x: mx - 0.75, y: y - 0.62, w: 1.5, h: 0.3, align: "center", fontFace: F.mono, fontSize: 10.5, bold: true, color: c.fg, margin: 0 });
      s.addText(m.label, { x: mx - 0.95, y: y + 0.2, w: 1.9, h: 0.7, align: "center", fontFace: F.body, fontSize: 11, color: P.soft, valign: "top", margin: 0 });
    });
  }

  // смуга-акцент: одна теза на всю ширину
  function band(s, { x, y, w, h = 1.05, label, text, tone = "acc" }) {
    const c = t(tone);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: c.bg }, line: { type: "none" } });
    if (label) s.addText(label.toUpperCase(), { x: x + 0.24, y: y + 0.14, w: w - 0.48, h: 0.24, fontFace: F.mono, fontSize: 9.5, bold: true, color: c.fg, charSpacing: 1.5, margin: 0 });
    s.addText(text, { x: x + 0.24, y: y + (label ? 0.42 : 0.16), w: w - 0.48, h: h - (label ? 0.56 : 0.32), fontFace: F.body, fontSize: 13, color: P.ink, valign: "middle", margin: 0 });
  }

  // §2 Pre-training: терміни уроку до основного матеріалу
  function terms(s, { x, y, w, items, cols = 3, rowH = 1.15 }) {
    const cw = (w - (cols - 1) * 0.22) / cols;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const xx = x + col * (cw + 0.22), yy = y + row * (rowH + 0.22);
      s.addShape("roundRect", { x: xx, y: yy, w: cw, h: rowH, rectRadius: 0.1, fill: { color: P.card }, line: { color: P.line, width: 1 } });
      s.addText(it.term, { x: xx + 0.2, y: yy + 0.12, w: cw - 0.4, h: 0.34, fontFace: F.mono, fontSize: 12.5, bold: true, color: P.acc, valign: "middle", margin: 0 });
      s.addText(it.def, { x: xx + 0.2, y: yy + 0.46, w: cw - 0.4, h: rowH - 0.58, fontFace: F.body, fontSize: 11.5, color: P.soft, valign: "top", margin: 0 });
    });
  }

  function code(s, { x, y, w, h, lines, size = 12 }) {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: P.dark }, line: { type: "none" } });
    const runs = [];
    lines.forEach((ln, i) => ln.forEach((sg, j) =>
      runs.push({ text: sg.t, options: { fontFace: F.mono, fontSize: size, color: sg.c || P.darktext, breakLine: j === ln.length - 1 && i < lines.length - 1 } })));
    s.addText(runs, { x: x + 0.24, y: y + 0.16, w: w - 0.48, h: h - 0.32, valign: "top", lineSpacingMultiple: 1.3, margin: 0 });
  }

  function table(s, { x, y, w, head, rows, colW, rowH, size = 11.5 }) {
    const data = [head.map(h => ({ text: h, options: { fontFace: F.mono, fontSize: 9, bold: true, color: P.faint, fill: { color: "FAFAFC" }, charSpacing: 1 } }))];
    rows.forEach(r => data.push(r.cells.map((cText, i) => {
      const ct = (r.cellTones && r.cellTones[i]) ? t(r.cellTones[i]) : null;
      const c = ct || (r.tone ? t(r.tone) : null);
      return { text: cText, options: Object.assign({ fontSize: size },
        i === 0 ? { bold: true, color: c ? c.fg : P.ink } : { color: ct ? ct.fg : P.ink },
        c ? { fill: { color: c.bg } } : {}) };
    })));
    s.addTable(data, { x, y, w, colW, rowH, border: { pt: 0.5, color: P.line }, fontFace: F.body, valign: "middle", fill: { color: P.card }, margin: 0.08 });
  }

  function checklist(s, { x, y, w, items, cols = 1 }) {
    const per = Math.ceil(items.length / cols), cw = w / cols;
    items.forEach((it, i) => {
      const col = Math.floor(i / per), row = i % per;
      const xx = x + col * cw, yy = y + row * 0.62;
      s.addShape("roundRect", { x: xx, y: yy + 0.06, w: 0.28, h: 0.28, rectRadius: 0.06, fill: { color: P.goodbg }, line: { color: P.good, width: 1 } });
      s.addText("✓", { x: xx, y: yy + 0.06, w: 0.28, h: 0.28, align: "center", valign: "middle", fontFace: F.body, fontSize: 10, bold: true, color: P.good, margin: 0 });
      s.addText(it, { x: xx + 0.42, y: yy, w: cw - 0.6, h: 0.42, fontFace: F.body, fontSize: 12.5, color: P.ink, valign: "middle", margin: 0 });
    });
  }

  function save(deckPath, scriptPath) {
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
           stat, tile, arrow, flow, bars, states, layers, timeline, band, code, table, checklist, terms, save };
}

module.exports = { createDeck, P, F, W, H, MX };
