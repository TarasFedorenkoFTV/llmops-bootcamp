# -*- coding: utf-8 -*-
"""Перевірка начитки за docs/SPEECH_STYLE.md — числом, а не на слух.

    python docs/check_speech.py docs/decks/L01-video.md
    python docs/check_speech.py docs/decks/L*-video.md
    python docs/check_speech.py --show docs/decks/L01-video.md   # + приклади

Рахує тільки те, що звучить уголос. З підрахунку виключені заголовки,
таблиці, рядки-вказівки (на екрані / камера / курсор / склейка / файл / дія),
маркери [SLIDE], [DEMO], [ZOOM: …] і позначки «Пауза.» — вони не читаються.

Код повернення 1, якщо хоч одна ціль не досягнута: зручно для CI.
"""
import glob
import io
import re
import sys

CUE = re.compile(r"^(на екрані|камера|курсор|склейка|файл|дія)\s*:", re.I)
PAUSE = re.compile(r"^Пауза\.?$", re.I)

# (назва, регулярка, ціль на 1000 слів, пояснення)
RULES = [
    ("тире як пауза", r"\s—\s", 12.0,
     "§161 правопису: лишаємо тільки синтаксичне тире"),
    ("контраст «не X, а Y»", r",\s+а не\b|—\s+(?:а|це)\b|\bЦе не\b|\bне просто\b|\bне\s+\w+,\s+а\b", 2.5,
     "НСТУ 2.7.1: прості речення; заперечення — коли воно і є зміст"),
    ("«І» на початку речення", r"(?:^|(?<=[.!?]\s)|(?<=\n))І\s", 1.5,
     "те саме: конструкція має бути рідкісною"),
    ("штампи-підсилювачі", r"\b(саме тому|саме це|рівно стільки|власне кажучи|як відомо)\b", 1.0,
     "НСТУ 2.7.1: штампи — у будь-якому разі геть"),
]

# терміни, узгоджені з методистом: одне поняття — одна назва (НСТУ 2.7.6)
TERMS = [
    (r"\bурок(?:у|ів|и|ом|а)?\b(?!\s+learned)", "«урок» → «тема»"),
    (r"\bлаб[аиуо]\b", "«лаба» → «лабораторна робота»"),
]


def speech_from_lines(lines):
    """Те саме, але з готового списку рядків — щоб міг використати
    gen_prompter.py і числа в суфлері збігалися з числами тут."""
    out = []
    for line in lines:
        s = line.strip()
        if not s or s.startswith(("#", "|", "---")):
            continue
        if CUE.match(s) or PAUSE.match(s) or re.match(r"^\[.*\]$", s):
            continue
        out.append(s)
    text = "\n".join(out)
    return re.sub(r"\[[^\]]*\]", " ", text)      # вказівки всередині рядка


def speech(path):
    """Рядки, які справді звучать."""
    return speech_from_lines(
        io.open(path, encoding="utf-8").read().replace("\r", "").split("\n"))


def metrics(text_lines):
    """Метрики §1 специфікації для набору рядків: {words, dash, contrast}."""
    body = speech_from_lines(text_lines)
    words = len(re.findall(r"[^\s]+", body))
    out = {"words": words}
    for name, pat, target, _why in RULES[:2]:
        key = "dash" if "тире" in name else "contrast"
        out[key] = round(len(re.findall(pat, body)) * 1000.0 / words, 1) if words else 0.0
    return out


def check(path, show=False):
    body = speech(path)
    words = len(re.findall(r"[^\s]+", body))
    if not words:
        print("%s: нема тексту" % path)
        return True
    sents = [x for x in re.split(r"(?<=[.!?])\s+|\n", body) if x.strip()]

    print("\n%s" % path)
    print("  %d слів мови, %d речень, середнє %.1f слова"
          % (words, len(sents), words / len(sents)))

    ok = True
    for name, pat, target, why in RULES:
        found = re.findall(pat, body)
        per = len(found) * 1000.0 / words
        good = per <= target
        ok = ok and good
        print("  %-26s %6.1f / 1000   ціль ≤ %-5.1f  %s"
              % (name, per, target, "OK" if good else "ПЕРЕВИЩЕНО"))
        if show and not good:
            for m in list(re.finditer(pat, body))[:3]:
                frag = body[max(0, m.start() - 55):m.start() + 55].replace("\n", " ")
                print("      … %s …" % frag.strip())
        if not good:
            print("      %s" % why)

    for pat, msg in TERMS:
        n = len(re.findall(pat, body, re.I))
        if n:
            ok = False
            print("  термінологія: %d × %s" % (n, msg))

    # довжина речень — не ціль, а орієнтир: і надто рівний ритм теж штучний
    avg = words / len(sents)
    if avg > 16:
        print("  УВАГА: середнє речення %.1f слова — для усного тексту довго" % avg)
    long_ = sum(1 for s in sents if len(s.split()) > 30)
    if long_ * 100.0 / len(sents) > 5:
        print("  УВАГА: %.0f%% речень довші за 30 слів" % (long_ * 100.0 / len(sents)))

    return ok


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show = "--show" in sys.argv[1:]
    files = sorted({f for a in args for f in (glob.glob(a) or [a])})
    if not files:
        sys.exit(__doc__)
    allok = True
    for f in files:
        try:
            allok = check(f, show) and allok
        except OSError as e:
            print("не прочитати %s: %s" % (f, e))
            allok = False
    print("\n%s" % ("усі цілі досягнуті" if allok else "є перевищення — див. вище"))
    sys.exit(0 if allok else 1)


if __name__ == "__main__":
    main()
