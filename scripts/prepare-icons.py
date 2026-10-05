"""One-off: copy the icons Atif's Figma export used into public/icons, minified.

Duplicate exports of the same glyph at different sizes are merged into one file;
SVGs scale. Run again only when an icon is added:  python scripts/prepare-icons.py
"""
import re
from pathlib import Path

SRC = Path("E:/Projects-2026/Closingly-landing-page/public/assets")
OUT = Path("public/icons")
ICONS = {
    "copy": "a1720",
    "ai-draft": "3881a",
    "ai-chat": "150ff",
    "grip": "11e00",
    "check-badge": "517a9",
    "checkbox-on": "cc13c",
    "cursor": "964ce",
}

def num(m):
    v = float(m.group(0))
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s

for name, src in ICONS.items():
    svg = (SRC / f"{src}.svg").read_text(encoding="utf-8")
    used = set(re.findall(r"url\(#([^)]+)\)", svg))
    svg = re.sub(r'\sid="([^"]*)"', lambda m: m.group(0) if m.group(1) in used else "", svg)
    svg = re.sub(r'\s(preserveAspectRatio|overflow|style)="[^"]*"', "", svg)
    svg = re.sub(r"-?\d+\.\d+", num, svg)
    svg = re.sub(r">\s+<", "><", svg).strip()
    (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")
    print(name, len(svg))


# The video-call toolbar in "How it works": eight fragments of the export
# composed into one drawing, in the coordinates of the 290x163 call frame.
def inner(src):
    svg = (SRC / f"{src}.svg").read_text(encoding="utf-8")
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    body = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", svg.strip())
    return vb, body

def place(src, x, y, w, h, extra=""):
    vb, body = inner(src)
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{vb}" overflow="visible"{extra}>{body}</svg>'

cc = re.search(r"d: '([^']+)', width: ([\d.]+), height: ([\d.]+), upm: (\d+)", Path("assets-src/fonts/cc-path.ts").read_text(encoding="utf-8"))
cc_d, cc_upm = cc.group(1), int(cc.group(4))
X0, Y0 = 58.92, 138.31
parts = [
    place("ab3a9", 58.92, 138.31, 172.35, 19.10),
    place("f0042", 66.29, 143.37, 4.613, 6.911),
    place("096d2", 88.85, 144.29, 7.34, 4.84),
    f'<rect x="112.99" y="144.75" width="7.364" height="5.063" rx="0.921" fill="none" stroke="#fff" stroke-width="0.46"/>',
    f'<path transform="translate(114.38 144.98) scale({3.912 / cc_upm:.6e})" d="{cc_d}" fill="#fff"/>',
    place("b41fb", 138.13, 143.37, 5.409, 6.903),
    place("9a57a", 161.09, 144.06, 7.824, 5.983),
    place("0e958", 188.69, 143.83, 0.929, 6.207),
    f'<g transform="rotate(135 217.4 146.86)">{place("04f97", 217.4 - 4.165, 146.86 - 4.172, 8.33, 8.345)}</g>',
]
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} {Y0} 172.35 19.1" width="172.35" height="19.1">{"".join(parts)}</svg>'
used = set(re.findall(r"url\(#([^)]+)\)", svg))
svg = re.sub(r'\sid="([^"]*)"', lambda m: m.group(0) if m.group(1) in used else "", svg)
svg = re.sub(r'\s(preserveAspectRatio|style)="[^"]*"', "", svg)
svg = re.sub(r"-?\d+\.\d{3,}", num, svg)
svg = re.sub(r">\s+<", "><", svg).strip()
(OUT / "call-controls.svg").write_text(svg, encoding="utf-8")
print("call-controls", len(svg))
