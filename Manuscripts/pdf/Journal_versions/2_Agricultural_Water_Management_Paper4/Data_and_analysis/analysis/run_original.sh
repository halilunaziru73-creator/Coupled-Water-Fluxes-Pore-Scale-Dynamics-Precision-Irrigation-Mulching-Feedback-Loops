#!/bin/sh
# The reach and the fate of irrigation water: the result tables in results/ (p4_*.csv, p4_numbers.json) were computed by
# scripts/p4_reach.py from the Daisy ensemble; the figure of kappa (Figure 4) is redrawn here from them.
set -e; cd "$(dirname "$0")"; mkdir -p work/plotdata
export MPLBACKEND=Agg PLOTDATA_DIR="$PWD/work/plotdata" PYTHONPATH="$PWD/plotdata"
python3 - <<'EOF'
import runpy, os, sys
# p4_kappa.py reads ../../results relative to the repository; point it at the copy in this folder
src = open('scripts/p4_kappa.py').read().replace("ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))", "ROOT = None")
src = src.replace("RES = os.path.join(ROOT, 'Manuscripts/results'); OUT = os.path.join(ROOT, 'Manuscripts/figures/paper4')", "RES = 'results'; OUT = 'work'")
exec(compile(src, 'p4_kappa.py', 'exec'))
EOF
echo "work/fig6_kappa.pdf and work/plotdata/fig6_kappa.csv written"
