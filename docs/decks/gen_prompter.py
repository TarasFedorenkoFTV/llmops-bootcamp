# -*- coding: utf-8 -*-
"""Перезашиває начитки docs/decks/L*-script.md у docs/prompter.html.

Навіщо: суфлер тримає копію начиток усередині сторінки, щоб працювати на
пристрої без репозиторію — телефон чи планшет під камерою. Після кожної
правки LNN-script.md копію треба оновити цим скриптом.

    python docs/decks/gen_prompter.py

Ідемпотентний: підмінює лише вміст блоку <script id="lessons">, решти
сторінки не торкається. Запускати можна з будь-якої директорії.
"""
import glob
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))          # <repo>/docs/decks -> <repo>
PAGE = os.path.join(REPO, "docs", "prompter.html")
OPEN_TAG = '<script type="application/json" id="lessons">'
CLOSE_TAG = "</script>"


def main():
    scripts = sorted(glob.glob(os.path.join(HERE, "L*-script.md")))
    if not scripts:
        sys.exit("не знайдено жодного L*-script.md у " + HERE)
    if not os.path.exists(PAGE):
        sys.exit("немає сторінки суфлера: " + PAGE)

    lessons = []
    for path in scripts:
        lid = os.path.basename(path).split("-")[0]
        text = io.open(path, encoding="utf-8").read()
        title = text.split("\n", 1)[0].replace("# Сценарій начитки · ", "").strip()
        lessons.append({"id": lid, "title": title, "text": text})

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
