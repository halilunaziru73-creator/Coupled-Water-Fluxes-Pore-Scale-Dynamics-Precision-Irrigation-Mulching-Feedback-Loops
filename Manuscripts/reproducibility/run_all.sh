#!/usr/bin/env bash
# Regenerate every numerical result and figure of the three manuscripts from the archived Daisy ensemble.
# Usage:  bash run_all.sh [WORKDIR]      (default WORKDIR=./work; nothing outside it is modified)
# Needs:  Python >= 3.13 with requirements.txt; Node >= 22 with `playwright` and Chromium (set CHROMIUM or edit p3_js/*.js);
#         the repository layout (Software/SWAFL_Desktop/app/engine/engine.html is the engine under test).
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
W="$(mkdir -p "${1:-$HERE/work}" && cd "${1:-$HERE/work}" && pwd)"
export SWAFL_MS="$W" PYTHONHASHSEED=0 OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 MPLBACKEND=Agg
export NODE_PATH="${NODE_PATH:-$(npm root -g 2>/dev/null)}"
mkdir -p "$W/out" "$W/analysis" "$W/fig/p1" "$W/fig/p2" "$W/fig/p3" "$W/fig/shots"
cp "$HERE"/analysis/*.py "$W/analysis/"; cp "$HERE/load.py" "$W/"; cp "$HERE"/intermediates/* "$W/out/"
cp "$HERE"/../figures/shots/*.png "$W/fig/shots/"   # archived interface screenshots (not regenerated), used by the layer montage
FAIL=0
step() { local t="$1"; shift; if "$@" >"$W/out/log_$t.txt" 2>&1; then echo "ok      $t"; else echo "FAILED  $t (see out/log_$t.txt)"; FAIL=$((FAIL+1)); fi; }
py() { step "$1" python3 "$W/analysis/$1.py"; }
js() { step "js_$1" node "$HERE/p3_js/$1.js"; }
step make_data python3 "$HERE/make_data.py"
echo "--- Paper 1 ---";  for s in p1_core p1_stats p1_mech p1_omega p1_rate_law p1_figs_a p1_figs_b p1_figs_c p1_figs_d p1_figs_e p1_fig12_drivers p1_fig13_time p1_fig14_ens p1_fig1_new; do py $s; done
echo "--- Paper 2 ---";  for s in p2_a p2_laws p2_laws2 p2_R p2_et p2_dpf p2_nested p2_b p2_figs p2_figs2 p2_fig4 p2_fig6 p2_fig7 p2_figfail p2_fig1_new p2_s02_excl p2_robust; do py $s; done
echo "--- Paper 3 ---"
step make_e12 python3 "$HERE/make_e12.py"
for s in v_surface v_surface_shipped v_border v_drip v_sprinkler bench e1_heldout e1_sens e2_closure e2_grid l_sens run_drip run_fao run_spr swa_vars; do js $s; done
for s in p3_figs p3_lit_figs p3_sens_fig p3_swa_fig p3_fig01_workflow_v9; do py $s; done
step make_a4 python3 "$HERE/make_a4.py"
echo "--- Checks ---"
python3 "$HERE/compare_results.py" "$W/out" "$HERE/../results" 1e-6 | tail -22 || FAIL=$((FAIL+1))
python3 "$HERE/audit_numbers.py" "$W/out" | tail -4 || FAIL=$((FAIL+1))
echo "steps failed: $FAIL"
