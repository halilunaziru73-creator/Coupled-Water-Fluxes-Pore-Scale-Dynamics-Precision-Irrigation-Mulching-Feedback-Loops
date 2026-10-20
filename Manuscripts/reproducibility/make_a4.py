"""Scale each Figure 1 PDF to an exact A4-landscape page (297 x 210 mm).
The three Figure 1 canvases are drawn with a 297:210 aspect ratio; this step sets the
page boxes so that the typeset manuscripts place them full-page on A4 landscape."""
import os, sys
from pypdf import PdfReader, PdfWriter
root = os.environ.get("SWAFL_MS", ".")
for p, n in [("p1", "fig01_framework"), ("p2", "fig01_pipeline"), ("p3", "fig01_architecture")]:
    src = os.path.join(root, "fig", p, n + ".pdf")
    if not os.path.exists(src):
        print("missing", src); continue
    pg = PdfReader(src).pages[0]
    pg.scale_to(841.89, 595.28)
    mb = pg.mediabox
    for b in ("cropbox", "trimbox", "bleedbox", "artbox"):
        setattr(pg, b, mb)
    w = PdfWriter(); w.add_page(pg); w.write(src.replace(".pdf", "_A4.pdf"))
    print("ok", n + "_A4.pdf")
