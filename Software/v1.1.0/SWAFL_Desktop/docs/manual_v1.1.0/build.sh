#!/bin/sh
# Build the SWAFL 1.1.0 manual (one PDF) from chapters/ (needs pandoc, xelatex and node).
#   the pictures: images/atlas11 (made by tools/atlas11.py from the 1.0 atlas and the captures of tools/new_capture.py)
cd "$(dirname "$0")"
export TEXINPUTS=./tex:
python3 tools/build_single.py
pandoc build/*.md -o SWAFL_Manual_v1.1.0.pdf --pdf-engine=xelatex --resource-path=. -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono"
# keep the PDF small enough to open from GitHub on any device (pictures at 170 dpi; needs Ghostscript, skipped without it)
if command -v gs >/dev/null 2>&1; then
  gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 -dDownsampleColorImages=true -dColorImageResolution=170 -dColorImageDownsampleType=/Bicubic -dAutoFilterColorImages=false -dColorImageFilter=/DCTEncode -dJPEGQ=82 -dDownsampleGrayImages=true -dGrayImageResolution=170 -dDetectDuplicateImages=true -dPreserveAnnots=true -sOutputFile=build/small.pdf SWAFL_Manual_v1.1.0.pdf && mv build/small.pdf SWAFL_Manual_v1.1.0.pdf
fi
pdfinfo SWAFL_Manual_v1.1.0.pdf | grep Pages; ls -la SWAFL_Manual_v1.1.0.pdf
