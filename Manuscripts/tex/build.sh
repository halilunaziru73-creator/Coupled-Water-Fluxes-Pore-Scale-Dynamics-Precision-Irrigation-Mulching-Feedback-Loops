#!/bin/bash
# Usage: bash build.sh p1|p2|p3   (XeLaTeX + BibTeX; fonts: Carlito or fallback; figures from ../figures)
cd "$(dirname "$0")"; export TEXINPUTS=./:
n=$1
xelatex -interaction=nonstopmode $n.tex >/dev/null 2>&1; bibtex $n 2>&1 | grep -iE "warning|error" | head -20
xelatex -interaction=nonstopmode $n.tex >/dev/null 2>&1; xelatex -interaction=nonstopmode $n.tex 2>&1 | grep -E "^!|undefined|Output written|Overfull \\\\hbox \(([3-9][0-9]|[0-9]{3})" | head -20
