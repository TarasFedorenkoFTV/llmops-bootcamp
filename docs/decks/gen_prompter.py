# -*- coding: utf-8 -*-
"""Перезашиває режисерські сценарії docs/decks/L*-video.md у docs/prompter.html.

Навіщо: суфлер тримає копію сценаріїв усередині сторінки, щоб працювати на
пристрої без репозиторію — телефон чи планшет під камерою. Після кожної
правки LNN-video.md копію треба оновити цим скриптом.

Джерело — саме режисерські файли, а не LNN-script.md: у них точна межа
«# Відео 1/2», сегменти запису з оцінкою часу, імена цільових файлів і
рядки-вказівки, які вголос не читаються.

    python docs/decks/gen_prompter.py

Ідемпотентний: підмінює лише вміст блоку <script id="lessons">, решти
сторінки не торкається. Запускати можна з будь-якої директорії.
"""
import glob
import re
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))          # <repo>/docs/decks -> <repo>
PAGE = os.path.join(REPO, "docs", "prompter.html")
OPEN_TAG = '<script type="application/json" id="lessons">'
CLOSE_TAG = "</script>"


def load_checker():
    """docs/check_speech.py як модуль — щоб метрики в суфлері рахувалися тим
    самим кодом, що й у перевірці. Інакше числа в двох місцях розійдуться:
    у JavaScript \\b працює лише для латиниці й на кирилиці не спрацьовує."""
    import importlib.util
    p = os.path.join(REPO, "docs", "check_speech.py")
    spec = importlib.util.spec_from_file_location("check_speech", p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def segment_metrics(check, text):
    """{назва сегмента: {words, dash, contrast}} — по тих самих правилах."""
    lines = text.replace("\r", "").split("\n")
    marks = [i for i, l in enumerate(lines)
             if re.match(r"^##\s+.*Сегмент\s+\d+", l.strip(), re.I)]
    out = {}
    for k, i in enumerate(marks):
        end = marks[k + 1] if k + 1 < len(marks) else len(lines)
        name = re.sub(r"\s*\([^)]*\)\s*$", "", lines[i].lstrip("# ").strip())
        out[name] = check.metrics(lines[i + 1:end])
    return out


def main():
    scripts = sorted(glob.glob(os.path.join(HERE, "L*-video.md")))
    if not scripts:
        sys.exit("не знайдено жодного L*-video.md у " + HERE)
    if not os.path.exists(PAGE):
        sys.exit("немає сторінки суфлера: " + PAGE)

    check = load_checker()
    lessons = []
    for path in scripts:
        lid = os.path.basename(path).split("-")[0]
        text = io.open(path, encoding="utf-8").read()
        title = text.split("\n", 1)[0].lstrip("# ")
        for pre in ("Сценарій запису · ", "Сценарій начитки · "):
            title = title.replace(pre, "")
        title = title.strip()
        lessons.append({"id": lid, "title": title, "text": text,
                        "style": segment_metrics(check, text)})

    # "<" -> <, щоб жодне </script у начитці не закрило блок
    payload = json.dumps(lessons, ensure_ascii=False).replace("<", "\\u003c")

    html = io.open(PAGE, encoding="utf-8").read()
    start = html.find(OPEN_TAG)
    if start < 0:
        sys.exit("у сторінці немає блоку " + OPEN_TAG + " — генерувати нічого")
    body = start + len(OPEN_TAG)
    end = html.find(CLOSE_TAG, body)
    if end < 0:
        sys.exit("блок lessons не закритий — сторінка пошкоджена")

    was = len(html[body:end].encode("utf-8"))
    html = html[:body] + payload + html[end:]
    io.open(PAGE, "w", encoding="utf-8", newline="\n").write(html)

    print("уроків: %d" % len(lessons))
    for l in lessons:
        print("  %s · %s" % (l["id"], l["title"]))
    print("начитки: %.0f КБ (було %.0f КБ) -> %s"
          % (len(payload.encode("utf-8")) / 1024, was / 1024,
             os.path.relpath(PAGE, REPO)))


if __name__ == "__main__":
    main()
