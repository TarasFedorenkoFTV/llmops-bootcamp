# -*- coding: utf-8 -*-
"""Зашиває всі начитки docs/decks/LNN-script.md у суфлер.

Причина: суфлер найкраще працює на окремому пристрої під камерою (телефон,
планшет), а там немає диска з репозиторієм — кнопка «Файл» безкорисна саме
там, де вона найпотрібніша. Тому текст їде разом зі сторінкою.
"""
import glob
import io
import json
import os
import re

REPO = r"D:\Taras\llmops-bootcamp"
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prompter.html")

# ---------------------------------------------------------------- начитки
lessons = []
for path in sorted(glob.glob(os.path.join(REPO, "docs", "decks", "L*-script.md"))):
    lid = os.path.basename(path).split("-")[0]
    text = io.open(path, encoding="utf-8").read()
    first = text.split("\n", 1)[0]
    title = first.replace("# Сценарій начитки · ", "").strip()
    lessons.append({"id": lid, "title": title, "text": text})

# < екрануємо, щоб жодне </script у тексті не закрило блок
payload = json.dumps(lessons, ensure_ascii=False).replace("<", "\\u003c")
print("уроків: %d, JSON: %.0f КБ" % (len(lessons), len(payload.encode("utf-8")) / 1024))

html = io.open(SRC, encoding="utf-8").read()

# ------------------------------------------- 1. замінити зразок на всі уроки
start = html.index('<script type="text/plain" id="sample">')
end = html.index("</script>", start) + len("</script>")
html = html[:start] + '<script type="application/json" id="lessons">' + payload + "</script>" + html[end:]

# ------------------------------------------------- 2. контроли вибору уроку
controls = '''<div class="pick">
    <select id="lesson" title="Урок"></select>
    <div class="seg" role="group" aria-label="Частина уроку">
      <button data-seg="all" aria-pressed="true">Усе</button>
      <button data-seg="theory" aria-pressed="false">Теорія</button>
      <button data-seg="practice" aria-pressed="false">Практика</button>
    </div>
  </div>

  <div class="readout">'''
html = html.replace('<div class="readout">', controls, 1)

# ------------------------------------------------------------- 3. стилі
css = '''
  .pick { display: flex; align-items: center; gap: 8px; }
  #lesson {
    font-family: var(--cond);
    font-size: 12.5px;
    color: var(--speech);
    background: var(--ground);
    border: 1px solid var(--edge);
    border-radius: 3px;
    padding: 6px 8px;
    max-width: 260px;
  }
  .seg { display: flex; }
  .seg button {
    border-radius: 0;
    border-right-width: 0;
    padding: 6px 9px;
  }
  .seg button:first-child { border-radius: 3px 0 0 3px; }
  .seg button:last-child { border-radius: 0 3px 3px 0; border-right-width: 1px; }
  .seg button[aria-pressed="true"] {
    background: var(--amber);
    border-color: var(--amber);
    color: var(--ground);
  }

  /* ------------------------------------------------------- вставка */'''
html = html.replace("\n  /* ------------------------------------------------------- вставка */", css, 1)

# ------------------------------------------------ 4. load() більше не пише текст
html = html.replace("""      render();
    });
    store({ text: text, name: name || "Начитка", offset: 0 });
  }""", """      render();
    });
    store({ offset: 0 });
  }""", 1)

# --------------------------------------------- 5. логіка уроків замість старту
old_tail = html[html.index("  // --------------------------------------------------------- старт"):html.rindex("</script>")]
new_tail = '''  // ------------------------------------------------------ вибір уроку
  const LESSONS = JSON.parse(document.getElementById("lessons").textContent);
  const lessonSel = document.getElementById("lesson");
  let segment = "all";

  LESSONS.forEach((l) => {
    const o = document.createElement("option");
    o.value = l.id;
    o.textContent = l.id + " · " + l.title.replace(/^Урок \\d+ · /, "");
    lessonSel.appendChild(o);
  });
  const own = document.createElement("option");
  own.value = "custom";
  own.textContent = "— свій текст —";
  lessonSel.appendChild(own);

  // Межа відео — розділювач ПРАКТИКА (VIDEO_PROMPT.md): до нього Відео 1
  // «Теорія», від нього Відео 2 «Практика».
  function cut(text, seg) {
    if (seg === "all") return text;
    const lines = text.replace(/\\r/g, "").split("\\n");
    const i = lines.findIndex((l) => /^##\\s+Слайд\\s+\\d+\\s*[·—-]\\s*ПРАКТИКА\\s*$/i.test(l.trim()));
    if (i < 0) return text;
    if (seg === "theory") return lines.slice(0, i).join("\\n");
    return lines[0] + "\\n\\n" + lines.slice(i).join("\\n");
  }

  function pick() {
    if (lessonSel.value === "custom") {
      const own = restore().custom;
      load(own || "# Свого тексту ще немає\\n\\nНатисни «Текст» і вставь начитку.", "Свій текст");
      store({ lesson: "custom", segment: segment });
      return;
    }
    const l = LESSONS.find((x) => x.id === lessonSel.value);
    if (!l) return;
    const tail = segment === "theory" ? " · Відео 1 «Теорія»"
               : segment === "practice" ? " · Відео 2 «Практика»" : "";
    load(cut(l.text, segment), l.id + tail);
    store({ lesson: l.id, segment: segment });
  }

  lessonSel.addEventListener("change", pick);
  document.querySelectorAll(".seg button").forEach((b) => {
    b.addEventListener("click", () => {
      segment = b.dataset.seg;
      document.querySelectorAll(".seg button").forEach((x) =>
        x.setAttribute("aria-pressed", String(x === b)));
      pick();
    });
  });

  // --------------------------------------------------------- старт
  const saved = restore();
  if (saved.wpm) { wpmIn.value = saved.wpm; document.getElementById("wpm-out").textContent = saved.wpm; }
  if (saved.size) { sizeIn.value = saved.size; document.getElementById("size-out").textContent = saved.size; }
  reel.style.fontSize = sizeIn.value + "px";

  if (saved.segment) {
    segment = saved.segment;
    document.querySelectorAll(".seg button").forEach((x) =>
      x.setAttribute("aria-pressed", String(x.dataset.seg === segment)));
  }
  lessonSel.value = (saved.lesson && (saved.lesson === "custom" || LESSONS.some((l) => l.id === saved.lesson)))
    ? saved.lesson : "L01";
  pick();

  if (saved.offset) {
    requestAnimationFrame(() => { offset = saved.offset; render(); });
  }
'''
html = html.replace(old_tail, new_tail, 1)

# --------------------------------- 6. свій текст зберігаємо окремим ключем
html = html.replace(
    'if (srcArea.value.trim()) load(srcArea.value, "Вставлений текст");',
    'if (srcArea.value.trim()) { store({ custom: srcArea.value });'
    ' lessonSel.value = "custom"; pick(); }', 1)
html = html.replace(
    'r.onload = () => { load(String(r.result), f.name.replace(/\\.md$/i, "")); pastePane.classList.remove("on"); };',
    'r.onload = () => { store({ custom: String(r.result) }); lessonSel.value = "custom"; pick();'
    ' pastePane.classList.remove("on"); };', 1)
html = html.replace('srcArea.value = restore().text || "";', 'srcArea.value = restore().custom || "";', 1)

# ------------------------------------------- 7. текст у панелі вставки оновити
html = re.sub(
    r'<p>\s*Кнопка <code>Файл</code>.*?</p>',
    '<p>\n      Усі 12 начиток курсу вже всередині — вибери урок у списку вгорі та частину\n'
    '      («Теорія» — до розділювача ПРАКТИКА, «Практика» — від нього). Файл або вставка\n'
    '      потрібні лише для чужого тексту: суфлер розпізнає заголовки <code>## Слайд N · Назва</code>\n'
    '      як точки переходу, а блоки <code>[Ведучому: …]</code> показує окремо й не рахує\n'
    '      в хронометраж, бо вголос вони не читаються.\n    </p>',
    html, count=1, flags=re.S)

io.open(SRC, "w", encoding="utf-8").write(html)
print("готово: %s (%.0f КБ)" % (SRC, os.path.getsize(SRC) / 1024))
