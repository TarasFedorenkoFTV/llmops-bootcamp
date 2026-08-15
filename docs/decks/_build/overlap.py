# -*- coding: utf-8 -*-
"""Детектор накладань і виходів за межі слайда (за геометрією OOXML)."""
import re, sys, io, zipfile, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
EMU = 914400.0
W, H = 13.333, 7.5

def boxes(xml):
    out = []
    # форми та graphicFrame (таблиці): беремо xfrm верхнього рівня елемента
    for m in re.finditer(r"<p:(sp|graphicFrame|pic)>(.*?)</p:\1>", xml, re.S):
        body = m.group(2)
        off = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>', body)
        ext = re.search(r'<a:ext cx="(\d+)" cy="(\d+)"/>', body)
        if not off or not ext:
            continue
        x, y = int(off.group(1)) / EMU, int(off.group(2)) / EMU
        w, h = int(ext.group(1)) / EMU, int(ext.group(2)) / EMU
        # УВАГА: для таблиць pptxgenjs пише <a:ext cy> = рівно 1.00in незалежно від
        # реальної висоти. Через це детектор міряв кожну таблицю як один дюйм і
        # НЕ БАЧИВ наїздів таблиці на те, що стоїть під нею. Реальна висота — сума
        # висот рядків (rowH у PowerPoint є мінімумом, але pptxgenjs віддає саме її).
        if m.group(1) == "graphicFrame" and "<a:tbl>" in body:
            rows = [int(r) for r in re.findall(r'<a:tr h="(\d+)"', body)]
            if rows:
                h = sum(rows) / EMU
        txt = " ".join(re.findall(r"<a:t(?:\s[^>]*)?>(.*?)</a:t>", body, re.S)).strip()
        # чи має форма заливку (фон) — тоді текст поверх неї це норма
        filled = bool(re.search(r"<a:solidFill>", body.split("<p:txBody>")[0] if "<p:txBody>" in body else body))
        out.append(dict(x=x, y=y, w=w, h=h, txt=txt, filled=filled, kind=m.group(1)))
    return out

def inter(a, b):
    dx = min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"])
    dy = min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"])
    return max(0, dx) * max(0, dy)

problems = []
for path in sys.argv[1:]:
    z = zipfile.ZipFile(path)
    name = os.path.basename(path)
    slides = sorted([s for s in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml", s)],
                    key=lambda s: int(re.search(r"\d+", s.split("/")[-1]).group()))
    for i, sl in enumerate(slides, 1):
        bs = boxes(z.read(sl).decode())
        for b in bs:
            if b["x"] < -0.02 or b["y"] < -0.02 or b["x"] + b["w"] > W + 0.02 or b["y"] + b["h"] > H + 0.02:
                problems.append(f"{name} сл.{i}: за межами слайда — '{b['txt'][:34]}' "
                                f"({b['x']:.2f},{b['y']:.2f} {b['w']:.2f}x{b['h']:.2f})")
        # накладання: текст×текст і підкладка×текст (підкладка = залита фігура)
        txts = [b for b in bs if b["txt"] or b["filled"]]
        for j in range(len(txts)):
            for k in range(j + 1, len(txts)):
                a, b = txts[j], txts[k]
                ov = inter(a, b)
                if ov <= 0.02:
                    continue
                small = min(a["w"] * a["h"], b["w"] * b["h"])
                # текст поверх власної підкладки — норма (одна з форм без тексту або повністю вкладена)
                contained = (a["x"] >= b["x"] - .02 and a["y"] >= b["y"] - .02 and
                             a["x"] + a["w"] <= b["x"] + b["w"] + .02 and a["y"] + a["h"] <= b["y"] + b["h"] + .02) or \
                            (b["x"] >= a["x"] - .02 and b["y"] >= a["y"] - .02 and
                             b["x"] + b["w"] <= a["x"] + a["w"] + .02 and b["y"] + b["h"] <= a["y"] + a["h"] + .02)
                if contained:
                    continue
                if ov / small > 0.10:
                    problems.append(f"{name} сл.{i}: перекриття {ov/small*100:.0f}% — "
                                    f"'{a['txt'][:26]}' × '{b['txt'][:26]}'")
print("\n".join(problems) if problems else "ЧИСТО: накладань і виходів за межі не знайдено")
print(f"— перевірено файлів: {len(sys.argv)-1}")
