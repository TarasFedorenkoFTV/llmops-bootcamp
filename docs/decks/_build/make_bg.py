# -*- coding: utf-8 -*-
"""Складає два брендові фони (контентний і обкладинковий) з ассетів офіційного
шаблону Neoversity і кладе їх у assets/.

Запуск:  python make_bg.py "<шлях до Шаблон презентації Neoversity (White).pptx>"

Головне про складання: <a:srcRect> обрізає ДЖЕРЕЛО, потім результат вписується
в рамку, і лише ТОДІ <a:xfrm rot> крутить розміщену фігуру. Якщо крутити до
обрізки, у кадр потрапляє інший фрагмент image3 — саме там лежать зелений,
бірюзовий і жовтий, яких у шаблоні на екрані немає.

Перезапускати треба лише при зміні самого шаблону: результат уже лежить
в assets/ і входить у колоди через МАЙСТЕР-слайди.
"""
import zipfile, re, io, sys, os
from PIL import Image
import numpy as np
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
if len(sys.argv) < 2:
    sys.exit(__doc__)
TPL = sys.argv[1]
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
z = zipfile.ZipFile(TPL)
TW, TH = 10.0, 5.625
OW, OH = 13.333, 7.5
PX = 1920
PY = int(round(PX * OH / OW))
K = PX / TW

# Найтемніший текст, що лежить прямо на фоні (P.faint #9A94AA), має яскравість
# 0.309. Щоб він давав 4.5:1, яскравість фону під ним не може перевищувати
# 0.309/4.5 - 0.05 ≈ 0.0298. Це стеля, і міряти її треба ПІСЛЯ запису в JPEG:
# квантування піднімає окремі пікселі, тож усередині тиснемо з запасом.
T_MAX = 0.0298


def lumap(a):
    lin = np.where(a <= .04045, a / 12.92, ((a + .055) / 1.055) ** 2.4)
    return .2126 * lin[:, :, 0] + .7152 * lin[:, :, 1] + .0722 * lin[:, :, 2]


def place(canvas, fname, x, y, w, h, alpha, crop, rot):
    im = Image.open(io.BytesIO(z.read('ppt/media/' + fname))).convert('RGBA')
    W0, H0 = im.size
    l, t, r, b = [c / 100000.0 for c in crop]
    im = im.crop((int(round(max(0, l) * W0)), int(round(max(0, t) * H0)),
                  int(round(W0 - max(0, r) * W0)), int(round(H0 - max(0, b) * H0))))
    im = im.resize((max(1, int(round(w * K))), max(1, int(round(h * K)))), Image.LANCZOS)
    if rot % 360:
        im = im.rotate(-rot, expand=False, resample=Image.BICUBIC)
    if alpha < 100:
        a = np.array(im)
        a[:, :, 3] = (a[:, :, 3].astype(np.float32) * alpha / 100).astype(np.uint8)
        im = Image.fromarray(a)
    canvas.alpha_composite(im, (int(round(x * K)), int(round(y * K))))


def rolloff(raw, ceil):
    """Компресія ВЕРХІВ із коліном: тіні лишаються точно як були, стеля
    яскравості асимптотично тримається під ceil. Плаский серпанок гасив би й
    тіні — градієнт втрачав би глибину, хоч темні ділянки тексту не мішають."""
    a = np.array(raw).astype(np.float32) / 255
    L = lumap(a)
    knee = 0.5 * ceil
    Lp = np.where(L <= knee, L, knee + (ceil - knee) * (1 - np.exp(-(L - knee) / (ceil - knee))))
    f = np.where(L > 1e-6, (Lp / np.maximum(L, 1e-6)) ** (1 / 2.4), 1.0)
    return Image.fromarray((np.clip(a * f[:, :, None], 0, 1) * 255 + .5).astype(np.uint8))


def build(spec, out):
    c = Image.new('RGBA', (PX, PY), (0, 0, 0, 255))
    for s in spec:
        place(c, *s)
    raw = c.convert('RGB')
    before = lumap(np.array(raw).astype(np.float32) / 255).max()
    ceil = T_MAX
    for _ in range(24):                       # добираємо стелю під JPEG
        rolloff(raw, ceil).save(os.path.join(S, out), quality=93)
        got = lumap(np.array(Image.open(os.path.join(S, out)).convert('RGB')).astype(np.float32) / 255)
        if got.max() <= T_MAX:
            break
        ceil *= 0.93
    px = np.array(Image.open(os.path.join(S, out)).convert('RGB'))
    cr = 1.05 / (got + .05)
    g = px[:, :, 1].astype(int)
    greenish = ((g - px[:, :, 0]) > 18) & ((g - px[:, :, 2]) > 18) & (g > 60)
    q = (px // 48 * 48).reshape(-1, 3)
    keys, cnt = np.unique(q, axis=0, return_counts=True)
    o = np.argsort(-cnt)[:5]
    print(f"\n{out}: стеля {before:.4f} -> {got.max():.4f} (межа {T_MAX}), "
          f"сер.яскр {px.mean():.0f}, білий {cr.min():.1f}:1, "
          f"найтемніший текст #9A94AA {(0.3092+.05)/(got.max()+.05):.2f}:1, "
          f"зелено-жовтих {greenish.mean()*100:.2f}%")
    for k in o:
        print(f"      #{keys[k][0]:02X}{keys[k][1]:02X}{keys[k][2]:02X} {cnt[k]/cnt.sum()*100:5.1f}%")


WM = ("image1.png", 0.00, 0.04, 10.00, 5.54, 49, (0, 0, 0, 0), 0)
BORD = ("image2.png", 0.00, 0.00, 4.67, 5.62, 40, (43763, 45691, 0, 0), 0)
VIO10 = ("image3.png", 0.00, 0.00, 10.00, 5.62, 64, (0, 43722, 0, 0), -180)
VIO942 = ("image3.png", 0.00, 0.00, 9.42, 5.62, 64, (0, 43722, 0, 0), -180)
GLOW = ("image2.png", 6.14, 1.64, 3.86, 3.98, 86, (0, 0, 29933, 42096), 0)

# Контентний фон — як CUSTOM_7: чистий градієнт без вордмарка. Вордмарк у шаблоні
# стоїть лише на розріджених слайдах-заявах (14, 38, 39), а не під щільним контентом.
build([BORD, VIO10], "neo-bg-content.jpg")
# Обкладинка й підсумок розріджені, тож саме там доречні вордмарк (CUSTOM_3)
# і бордовий акцент праворуч (CUSTOM_1).
build([BORD, VIO942, GLOW, WM], "neo-bg-cover.jpg")
