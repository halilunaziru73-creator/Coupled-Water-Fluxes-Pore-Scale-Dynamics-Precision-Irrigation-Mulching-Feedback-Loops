#!/bin/sh
# Runs the analysis of this article again from the run summary of the comprehensive data
# (Comprehensive_Summary/00_summary_all_simulations.csv.gz, 10 190 Daisy runs): scripts/p4_reach.py gives every number
# (p4_numbers.json) and Figures 2, 3, 5 and 6, scripts/p4_concept.py Figure 1 and scripts/p4_kappa.py Figure 4.
# Writes into ./work; the point data of every figure go to work/plotdata.  About one minute.
set -e; cd "$(dirname "$0")"; W="$PWD/work"; rm -rf "$W"
mkdir -p "$W/Manuscripts/reproducibility" "$W/Manuscripts/figures/paper4" "$W/Data/Comprehensive_Summary" "$W/plotdata"
cp -r scripts "$W/Manuscripts/reproducibility/analysis"; cp -r results "$W/Manuscripts/results"
cp Comprehensive_Summary/00_summary_all_simulations.csv.gz "$W/Data/Comprehensive_Summary/"
export MPLBACKEND=Agg PYTHONHASHSEED=0 PLOTDATA_DIR="$W/plotdata" PYTHONPATH="$PWD/plotdata"
for s in p4_reach p4_concept p4_kappa; do python3 "$W/Manuscripts/reproducibility/analysis/$s.py" > "$W/log_$s.txt" 2>&1 && echo "ok $s" || echo "FAILED $s (see work/log_$s.txt)"; done
python3 compare_results.py "$W/Manuscripts/results" results 1e-6 | tail -2     # the regenerated numbers against the archived numbers of the article
echo "figures in work/Manuscripts/figures/paper4, their point data in work/plotdata"
