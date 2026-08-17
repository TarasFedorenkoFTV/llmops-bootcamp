# -*- coding: utf-8 -*-
"""Аудит контрасту тексту в колодах (WCAG 2.1).

Рахує КОЖЕН текстовий ран проти його справжньої поверхні, а не проти
припущеного фону. Поверхня визначається так:
  1) власна заливка фігури, якщо є;
  2) інакше — найближча ЗАЛИТА фігура нижче в z-порядку, що накриває ран;
  3) інакше — фонове зображення майстра, і саме в тій його ділянці, де лежить
     ран (фон градієнтний: одне й те саме біле слово читається по-різному
     ліворуч і праворуч, тож середнє по фону тут нічого не доводить —
     беремо НАЙГІРШИЙ піксель під боксом).
Поріг: 4.5:1 для звичайного тексту, 3:1 для великого (>=18pt, або >=14pt bold).
"""
import re, sys, io, os, zipfile
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
EMU = 914400.0
W, H = 13.333, 7.5

try:
    import numpy as np
    from PIL import Image
except ImportError:
    print("Потрібні pillow і numpy: python -m pip install pillow numpy")
    sys.exit(2)


def lum(hexc):
    c = [int(hexc[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def ratio(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + .05) / (b + .05)


def bg_lum_map(path):
    """Карта яскравості фонового зображення (для «найгіршого пікселя»)."""
    a = np.array(Image.open(path).convert("RGB")).astype(np.float32) / 255
    lin = np.where(a <= .04045, a / 12.92, ((a + .055) / 1.055) ** 2.4)
    return .2126 * lin[:, :, 0] + .7152 * lin[:, :, 1] + .0722 * lin[:, :, 2]


HERE = os.path.dirname(os.path.abspath(__file__))
BGMAP = {}
BGSIZE = {}          # розмір файлу ассета -> тип фону
for key, fn in (("content", "neo-bg-content.jpg"),
                ("cover", "neo-bg-cover.jpg"),
                ("dark", "neo-bg-dark.jpg")):
    p = os.path.join(HERE, "assets", fn)
    if os.path.exists(p):
        BGMAP[key] = bg_lum_map(p)
        BGSIZE[os.path.getsize(p)] = key


def worst_bg_lum(kind, x, y, w, h):
    m = BGMAP.get(kind)
    if m is None:
        return 0.0                      # чорний фон як запасний варіант
    ph, pw = m.shape
    x0, x1 = int(max(0, x) / W * pw), int(min(W, x + w) / W * pw)
    y0, y1 = int(max(0, y) / H * ph), int(min(H, y + h) / H * ph)
    if x1 <= x0 or y1 <= y0:
        return float(m.mean())
    return float(m[y0:y1, x0:x1].max())   # найсвітліший піксель = найгірший для білого


def shapes(xml):
    """Фігури в z-порядку: бокс, заливка, текстові рани."""
    out = []
    for m in re.finditer(r"<p:(sp|graphicFrame|pic)>(.*?)</p:\1>", xml, re.S):
        body, kind = m.group(2), m.group(1)
        off = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>', body)
        ext = re.search(r'<a:ext cx="(\d+)" cy="(\d+)"/>', body)
        if not off or not ext:
            continue
        box = (int(off.group(1)) / EMU, int(off.group(2)) / EMU,
               int(ext.group(1)) / EMU, int(ext.group(2)) / EMU)
        # Заливку шукаємо ТІЛЬКО в <p:spPr>, і то з вирізаними <a:ln> — інакше
        # за «заливку» сходить колір рамки, а в graphicFrame (де spPr порожній) —
        # узагалі перший-ліпший колір тексту в таблиці. Саме на цьому аудит
        # видав 456 фальшивих падінь: «білий текст на заливці #C9C4D6».
        fill = None
        sp = re.search(r"<p:spPr\b.*?</p:spPr>", body, re.S)
        if sp:
            clean = re.sub(r"<a:ln[A-Z]?\b.*?</a:ln[A-Z]?>", "", sp.group(0), flags=re.S)
            f = re.search(r"<a:solidFill><a:srgbClr val=\"(\w{6})\"", clean)
            fill = f.group(1).upper() if f else None
        runs = []
        # У graphicFrame (таблиці) текст лежить у клітинках, і кожна має ВЛАСНУ
        # заливку. Якщо збирати його ще й як звичайні рани, той самий текст
        # перевіряється двічі, причому вдруге — проти підкладки під таблицею.
        # Саме через це аудит показував «білий текст на білій підкладці» для
        # шапки таблиці, яка насправді лежить на чорній клітинці.
        is_tbl = kind == "graphicFrame" and "<a:tbl>" in body
        for r in ([] if is_tbl else re.finditer(r"<a:r>(.*?)</a:r>", body, re.S)):
            rb = r.group(1)
            t = "".join(re.findall(r"<a:t(?:\s[^>]*)?>(.*?)</a:t>", rb, re.S)).strip()
            if not t:
                continue
            col = re.search(r"<a:solidFill><a:srgbClr val=\"(\w{6})\"", rb)
            sz = re.search(r'sz="(\d+)"', rb)
            bold = 'b="1"' in rb
            runs.append(dict(t=t, color=(col.group(1).upper() if col else None),
                             size=(int(sz.group(1)) / 100 if sz else 18), bold=bold))
        # клітинки таблиць мають власні заливки
        cells = []
        if kind == "graphicFrame" and "<a:tbl>" in body:
            rows = [int(r) for r in re.findall(r'<a:tr h="(\d+)"', body)]
            if rows:
                box = (box[0], box[1], box[2], sum(rows) / EMU)
            for tc in re.finditer(r"<a:tc[ >](.*?)</a:tc>", body, re.S):
                cb = tc.group(1)
                # Заливка клітинки — в <a:tcPr>, але ПІСЛЯ блоків рамок
                # (<a:lnL>, <a:lnR>…). Без їх вирізання за фон клітинки сходив
                # колір бордюру таблиці.
                tcpr = cb.split("<a:tcPr")[-1] if "<a:tcPr" in cb else ""
                tcpr = re.sub(r"<a:ln[A-Z]?\b.*?</a:ln[A-Z]?>", "", tcpr, flags=re.S)
                cf = re.search(r"<a:solidFill><a:srgbClr val=\"(\w{6})\"", tcpr)
                for r in re.finditer(r"<a:r>(.*?)</a:r>", cb, re.S):
                    rb = r.group(1)
                    t = "".join(re.findall(r"<a:t(?:\s[^>]*)?>(.*?)</a:t>", rb, re.S)).strip()
                    if not t:
                        continue
                    col = re.search(r"<a:solidFill><a:srgbClr val=\"(\w{6})\"", rb)
                    sz = re.search(r'sz="(\d+)"', rb)
                    cells.append(dict(t=t, color=(col.group(1).upper() if col else None),
                                      size=(int(sz.group(1)) / 100 if sz else 18),
                                      bold='b="1"' in rb,
                                      fill=(cf.group(1).upper() if cf else None)))
        out.append(dict(box=box, fill=fill, runs=runs, cells=cells, kind=kind))
    return out


def covers(outer, inner):
    ox, oy, ow, oh = outer
    ix, iy, iw, ih = inner
    return (ox - .02 <= ix and oy - .02 <= iy and
            ox + ow + .02 >= ix + iw and oy + oh + .02 >= iy + ih)


def master_kind(z, slide_name):
    """content чи cover — за фоновим зображенням майстра цього слайда."""
    n = re.search(r"slide(\d+)\.xml", slide_name).group(1)
    try:
        rel = z.read(f"ppt/slides/_rels/slide{n}.xml.rels").decode()
        lay = re.search(r"slideLayouts/(slideLayout\d+)\.xml", rel).group(1)
        lrel = z.read(f"ppt/slideLayouts/_rels/{lay}.xml.rels").decode()
        mst = re.search(r"slideMasters/(slideMaster\d+)\.xml", lrel).group(1)
        mrel = z.read(f"ppt/slideMasters/_rels/{mst}.xml.rels").decode()
        imgs = re.findall(r'Target="\.\./media/(image\d+\.\w+)"', mrel)
        # Тип фону визначаємо ТОЧНИМ розміром файлу ассета, а не порогом: фонів
        # три (контент / обкладинка з «N» / фінал без неї), і поріг «більше за
        # 95 КБ» їх уже не розрізняв.
        for i in imgs:
            k = BGSIZE.get(z.getinfo("ppt/media/" + i).file_size)
            if k:
                return k
    except Exception:
        pass
    return "content"


bad = []
total = 0
for path in sys.argv[1:]:
    z = zipfile.ZipFile(path)
    name = os.path.basename(path)
    slides = sorted([s for s in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", s)],
                    key=lambda s: int(re.search(r"\d+", s.split("/")[-1]).group()))
    for i, sl in enumerate(slides, 1):
        kind = master_kind(z, sl)
        sh = shapes(z.read(sl).decode())
        for j, s in enumerate(sh):
            def check(txt, color, size, bold, box, surface_hex, surface_desc):
                global total
                total += 1
                fg = lum(color or "FFFFFF")
                bl = lum(surface_hex) if surface_hex else worst_bg_lum(kind, *box)
                cr = ratio(fg, bl)
                need = 3.0 if (size >= 18 or (size >= 14 and bold)) else 4.5
                if cr < need:
                    bad.append(f"{name} сл.{i}: {cr:.2f}:1 (треба {need}) — "
                               f"#{color or 'FFFFFF'} на {surface_desc} — «{txt[:40]}»")
            # поверхня для звичайних ранів
            surf, desc = s["fill"], None
            if surf:
                desc = f"власній заливці #{surf}"
            else:
                for k in range(j - 1, -1, -1):
                    if sh[k]["fill"] and covers(sh[k]["box"], s["box"]):
                        surf, desc = sh[k]["fill"], f"підкладці #{sh[k]['fill']}"
                        break
            if not surf:
                desc = f"фоні ({kind}, найгірший піксель)"
            for r in s["runs"]:
                check(r["t"], r["color"], r["size"], r["bold"], s["box"], surf, desc)
            for c in s["cells"]:
                cs = c["fill"] or surf
                check(c["t"], c["color"], c["size"], c["bold"], s["box"], cs,
                      f"клітинці #{cs}" if cs else f"фоні ({kind})")

print("\n".join(bad) if bad else "ЧИСТО: усі рани проходять WCAG")
print(f"— перевірено ранів: {total}, нижче порога: {len(bad)}")
