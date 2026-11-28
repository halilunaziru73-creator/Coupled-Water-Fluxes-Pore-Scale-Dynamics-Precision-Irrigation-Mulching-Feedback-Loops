#!/bin/sh
# Runs the original analysis of this article again from the Daisy ensemble (data/daisy_ensemble.csv.gz, 10 190 runs).
# Writes into ./work; every figure is redrawn in work/fig and its point data in work/plotdata.  About 10 minutes.
set -e; cd "$(dirname "$0")"; W="$PWD/work"; mkdir -p "$W/out" "$W/analysis" "$W/fig/p1" "$W/fig/p2" "$W/fig/p3" "$W/plotdata"
cp scripts/*.py "$W/analysis/"; cp load.py "$W/"; cp intermediates/* "$W/out/"
export SWAFL_MS="$W" PYTHONHASHSEED=0 OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MPLBACKEND=Agg PLOTDATA_DIR="$W/plotdata" PYTHONPATH="$PWD/plotdata"
python3 make_data.py
for s in p1_core p1_stats p1_mech p1_omega p1_rate_law p1_figs_a p1_figs_b p1_figs_c p1_figs_d p1_figs_e p1_fig1_new p2_a p2_laws p2_R p2_et p2_dpf p2_figs p2_figs2; do
  python3 "$W/analysis/$s.py" > "$W/out/log_$s.txt" 2>&1 && echo "ok $s" || echo "FAILED $s (see work/out/log_$s.txt)"; done
python3 compare_results.py "$W/out" results 1e-6 | tail -3     # the regenerated numbers against the archived numbers of the article
