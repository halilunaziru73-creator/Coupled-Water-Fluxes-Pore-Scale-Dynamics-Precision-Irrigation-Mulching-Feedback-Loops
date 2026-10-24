#!/bin/sh
# Build the SWAFL 1.1.0 manual (one PDF) from chapters/ (needs pandoc, xelatex and node).
#   the pictures: images/atlas11 (made by tools/atlas11.py from the 1.0 atlas and the captures of tools/new_capture.py)
cd "$(dirname "$0")"
export TEXINPUTS=./tex:
python3 tools/build_single.py
pandoc build/*.md -o SWAFL_Manual_v1.1.0.pdf --pdf-engine=xelatex --resource-path=. -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono"
pdfinfo SWAFL_Manual_v1.1.0.pdf | grep Pages
