#!/bin/sh
# The verification figure (Figure 5) of the software article is drawn by scripts/p3_figs.py from the results of the
# verification runs of the engine (results/p3_*.json, e12*.json), which come from Manuscripts/reproducibility/p3_js (Node.js).
set -e; cd "$(dirname "$0")"; W="$PWD/work"; mkdir -p "$W/out" "$W/fig/p3" "$W/plotdata"; cp intermediates/* "$W/out/"; cp -f results/* "$W/out/"
export SWAFL_MS="$W" MPLBACKEND=Agg PLOTDATA_DIR="$W/plotdata" PYTHONPATH="$PWD/plotdata"
python3 scripts/p3_figs.py > work/log_p3_figs.txt 2>&1 || true   # its last figures (montages of screenshots) are not part of this article
ls work/fig/p3/fig03_ws_verification.pdf work/fig/p3/fig05_engine1_heldout.pdf && echo "Figure 5a and 5b redrawn in work/fig/p3, their point data in work/plotdata"
