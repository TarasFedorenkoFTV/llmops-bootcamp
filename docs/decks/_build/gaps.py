# -*- coding: utf-8 -*-
"""Порожнина внизу білої картки — де сітка не дотягнута.

Запуск:  python gaps.py            (шукає колоди на два рівні вище)
         python gaps.py <шлях>     (інша тека з L*.pptx)

Що міряє: від найнижчого контентного елемента до 6.92" — рівня, з якого
починаються лого й номер слайда. Зазор понад 1.2" читається як незакінчений
слайд; медіана по колодах ~0.5". Обкладинки, розділювачі й фінал не рахуються:
там порожнина навмисна.
"""
import zipfile, glob, re, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
EMU = 914400.0
CARD_BOTTOM = 7.28
LOGO_TOP = 6.92          # нижче — лого й номер, контенту там бути не має
rows = []
D = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "")
for p in sorted(glob.glob(os.path.join(D, "L*.pptx"))):
    z = zipfile.ZipFile(p)
    sl = sorted([s for s in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", s)],
                key=lambda s: int(re.search(r"\d+", s.split("/")[-1]).group()))
    for i, s in enumerate(sl, 1):
        d = z.read(s).decode()
        if "11713464" not in d:          # немає білої картки -> обкладинка/розділювач/фінал
            continue
        bottom, top, n, title = 0.0, 99.0, 0, ""
        for m in re.finditer(r"<p:(sp|graphicFrame|pic)>(.*?)</p:\1>", d, re.S):
            b, kind = m.group(2), m.group(1)
            if kind == "pic" or "<a:fld" in b:
                continue
            off = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>', b)
            ext = re.search(r'<a:ext cx="(\d+)" cy="(\d+)"/>', b)
            if not (off and ext):
                continue
            y = int(off.group(2)) / EMU
            h = int(ext.group(2)) / EMU
            w = int(ext.group(1)) / EMU
            if kind == "graphicFrame" and "<a:tbl>" in b:
                r = [int(x) for x in re.findall(r'<a:tr h="(\d+)"', b)]
                if r:
                    h = sum(r) / EMU
            if abs(w - 12.81) < .02 and abs(h - 7.07) < .02:
                continue                  # сама картка
            t = " ".join(re.findall(r"<a:t(?:\s[^>]*)?>(.*?)</a:t>", b, re.S)).strip()
            if y < 1.0 and not title and t:
                title = t
            if y >= 1.6:                  # контентна зона, нижче шапки
                bottom = max(bottom, y + h)
                top = min(top, y)
                n += 1
        if n:
            rows.append((LOGO_TOP - bottom, os.path.basename(p)[:-5], i, title[:38], top, bottom, n))
rows.sort(reverse=True)
print(f"{'зазор':>6}  {'слайд':10} {'верх':>5} {'низ':>5} {'фігур':>5}  заголовок")
for g, f, i, t, top, bot, n in rows[:26]:
    print(f"{g:6.2f}\"  {f}-{i:02d}  {top:5.2f} {bot:5.2f} {n:5}  {t}")
big = [r for r in rows if r[0] > 0.80]
print(f"\nконтентних слайдів: {len(rows)}")
print(f"із зазором понад 0.80\": {len(big)}   понад 1.20\": {len([r for r in rows if r[0] > 1.20])}")
print(f"медіанний зазор: {sorted(r[0] for r in rows)[len(rows)//2]:.2f}\"")
