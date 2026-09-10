# -*- coding: utf-8 -*-
"""Пост-обробка звуку відеосегмента: тембр, гучність, запас по піках.

    python docs/normalize.py "C:/.../2026-09-10 19-12-44.mp4"
    python docs/normalize.py *.mp4                 # пачкою
    python docs/normalize.py --no-eq файл.mp4      # без корекції тембру

Робить три речі, кожна з причиною (деталі — docs/RECORDING_SETUP.md §6):

1. EQ під мікрофон стенда: -4 dB на 230 Гц (бубніння від proximity effect
   боом-мікрофона за 5 см) і +5 dB на 2.8 кГц (провал у смузі розбірливості
   на 10 dB). Числа підігнані під конкретний мікрофон: зміниться мікрофон -
   переміряти смуги (§5) і перерахувати.
2. Гучність до -16 LUFS у ДВА проходи. Однопрохідний loudnorm тримає
   integrated лише приблизно, бо не знає матеріалу заздалегідь.
3. Лімітер на -3 dBFS ПІСЛЯ loudnorm. Його TP - орієнтир, а не межа, і
   AAC-кодек додає до true peak до двох децибел на гучних транзієнтах.
   Без лімітера на реальному семихвилинному сегменті виходило -0.7 dBTP
   замість -1.5; з ним - рівно -1.6.

Відео не перекодовується (-c:v copy), тож прогін швидкий і картинка
не страждає. Результат: <ім'я>-norm.mp4 поруч із джерелом.
"""
import glob
import os
import re
import subprocess
import sys

TARGET_I = -16.0     # LUFS, стандарт для навчального відео й подкастів
TARGET_TP = -3.0     # орієнтир для loudnorm; фактичну межу тримає лімітер
TARGET_LRA = 11.0
LIMIT = 0.708        # -3 dBFS у лінійній шкалі, як того хоче alimiter

EQ = ("equalizer=f=230:t=q:w=1.2:g=-4,"
      "equalizer=f=2800:t=q:w=0.9:g=5,"
      "acompressor=threshold=-20dB:ratio=3:attack=6:release=60")

CANDIDATES = [
    os.environ.get("FFMPEG"),
    "ffmpeg",
]
CANDIDATES += sorted(glob.glob(os.path.expandvars(
    r"%LOCALAPPDATA%\CapCut\Apps\*\ffmpeg.exe")), reverse=True)


def find_ffmpeg():
    for c in CANDIDATES:
        if not c:
            continue
        try:
            subprocess.run([c, "-version"], capture_output=True, check=True)
            return c
        except (OSError, subprocess.CalledProcessError):
            continue
    sys.exit("ffmpeg не знайдено. Постав його або вкажи шлях у змінній FFMPEG. "
             r"Підійде й той, що йде з CapCut: %LOCALAPPDATA%\CapCut\Apps\<версія>\ffmpeg.exe")


FF = find_ffmpeg()


def run(args):
    return subprocess.run([FF, "-hide_banner", *args],
                          capture_output=True, text=True, errors="ignore").stderr


def measure(path, chain):
    """Прохід 1: що на вході — щоб прохід 2 знав, на скільки піднімати."""
    log = run(["-i", path, "-af",
               chain + f",loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}"
                        ":print_format=json", "-f", "null", "-"])
    m = dict(re.findall(
        r'"(input_i|input_tp|input_lra|input_thresh|target_offset)"\s*:\s*"([-0-9.]+|-?inf)"', log))
    if len(m) < 5:
        raise RuntimeError("не вдалось заміряти вхід:\n" + log[-500:])
    return m


def verify(path):
    s = run(["-i", path, "-af", "loudnorm=print_format=summary", "-f", "null", "-"])
    v = run(["-i", path, "-af", "volumedetect", "-f", "null", "-"])
    grab = lambda pat, src: (re.search(pat, src).group(1) if re.search(pat, src) else "?")
    return {
        "I": grab(r"Input Integrated:\s*(\S+)", s),
        "TP": grab(r"Input True Peak:\s*(\S+)", s),
        "LRA": grab(r"Input LRA:\s*(\S+)", s),
        "peak": grab(r"max_volume: (\S+)", v),
    }


def process(src, use_eq=True):
    base, ext = os.path.splitext(src)
    if base.endswith("-norm"):
        print("  пропускаю (це вже результат):", os.path.basename(src))
        return
    out = base + "-norm" + ext
    chain = EQ if use_eq else "acompressor=threshold=-20dB:ratio=3:attack=6:release=60"

    print(os.path.basename(src))
    m = measure(src, chain)
    # це рівень уже після EQ і компресора, а не сирого файлу — саме його
    # й треба знати проходу 2
    print("  після EQ: %s LUFS, true peak %s dBTP" % (m["input_i"], m["input_tp"]))

    ln = (f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}"
          f":measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
          f":offset={m['target_offset']}")
    err = run(["-y", "-loglevel", "error", "-i", src,
               "-af", f"{chain},{ln},alimiter=limit={LIMIT}:level=disabled",
               "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", out])
    if err.strip():
        print("  ffmpeg:", err.strip()[:300])
        return

    r = verify(out)
    mb = os.path.getsize(out) / 1024 / 1024
    ok_i = abs(float(r["I"]) - TARGET_I) <= 0.5
    ok_tp = float(r["TP"]) <= -1.0
    print("  вихід: %s LUFS, true peak %s dBTP, LRA %s, пік %s dB, %.0f МБ  %s"
          % (r["I"], r["TP"], r["LRA"], r["peak"], mb,
             "OK" if (ok_i and ok_tp) else "УВАГА: поза нормою"))
    if mb > 500:
        print("  УВАГА: файл більший за 500 МБ — регламент вимагає стиснення")


def main():
    args = [a for a in sys.argv[1:] if a != "--no-eq"]
    use_eq = "--no-eq" not in sys.argv[1:]
    files = [f for a in args for f in (glob.glob(a) or [a])]
    if not files:
        sys.exit(__doc__)
    for f in files:
        if not os.path.exists(f):
            print("немає файлу:", f)
            continue
        process(f, use_eq)


if __name__ == "__main__":
    main()
