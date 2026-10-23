#!/bin/sh
# Build SWAFL_Manual.pdf from the Markdown chapters (needs pandoc and xelatex).
# If lmodern.sty is missing on your TeX installation, tex/lmodern.sty is an empty stand-in.
cd "$(dirname "$0")"
export TEXINPUTS=./tex:
pandoc 00_front.md 01_install.md 02_window.md 03_controls.md 04_dates.md 05_engine.md 06_control.md 07_field.md 08_structure.md 09_mulch.md 10_loops.md 11_surface.md 12_drip.md 13_sprinkler.md 14_dashboard.md 15_workflows.md 16_exports.md 17_limits.md 19_atlas.md 20_release11.md 18_appendices.md \
  -o SWAFL_Manual.pdf --pdf-engine=xelatex --resource-path=. -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono"
