#!/bin/sh
# Build the three volumes of the SWAFL 1.1.0 manual (needs pandoc and xelatex).
#   1. capture the screens:  node tools/capture.js <raw> ui|default|crops|soils   (the program served on 127.0.0.1:5199)
#   2. cut and write:         python3 tools/gen_v11.py <raw>
#   3. this script:           sh build.sh
cd "$(dirname "$0")"
export TEXINPUTS=./tex:
pandoc vol1/*.md -o SWAFL_Manual_v1.1.0_Vol1_Guide.pdf --pdf-engine=xelatex --resource-path=. -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono"
pandoc vol2.md -o SWAFL_Manual_v1.1.0_Vol2_Atlas.pdf --pdf-engine=xelatex --resource-path=. -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono"
pandoc vol3.md -o SWAFL_Manual_v1.1.0_Vol3_Atlas_by_soil_and_crop.pdf --pdf-engine=xelatex --resource-path=. -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono"
for f in SWAFL_Manual_v1.1.0_*.pdf; do echo "$f: $(pdfinfo "$f" 2>/dev/null | grep Pages)"; done
