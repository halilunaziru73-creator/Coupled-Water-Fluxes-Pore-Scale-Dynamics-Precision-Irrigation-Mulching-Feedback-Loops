# Reproducibility package

Regenerates every number and figure in the three manuscripts from the archived Daisy ensemble, and checks the result automatically.

1. *Soil Hydraulic Memory and the Recoverability of Evaporation Savings* (P1)
2. *Auditing Water-Balance Closure in a Soil-Plant Model with Interpretable Machine Learning* (P2)
3. *Modeling Soil–Water–Atmosphere Interactions for Irrigation Scheduling and Design* (P3)

## Quick start

```bash
cd Manuscripts/reproducibility
python3 -m pip install -r requirements.txt          # Python 3.13
npm install -g playwright                           # Node >= 22, plus a Chromium build (see "Browser")
bash run_all.sh ./work                              # ~15-20 min; writes only inside ./work
```

`run_all.sh` prints `ok` or `FAILED` per step, then runs two checks:

* `compare_results.py` compares every regenerated JSON in `work/out` with the archived reference in `../results` (default relative tolerance 1e-6).
* `audit_numbers.py` recomputes the headline numbers printed in the manuscripts (rate-law parameter and its intervals, LOSO errors, ET-law skill, singular values, Spearman range, mass closure, surface-irrigation errors, sprinkler diameter, run counts) and flags any value that does not round to the printed one.

## What is in this folder

| Path | Content |
|---|---|
| `data/daisy_ensemble.csv.gz` | all 10 190 Daisy runs (32 columns). 10 041 have `valid == 1`; 149 are numerical failures kept for the failure analysis in P2. Round trip to the working pickle verified exact. |
| `analysis/` | analysis and figure scripts (Python). Paths are relative to the environment variable `SWAFL_MS` (the work directory). |
| `p3_js/` | verification scripts for SWAFL Desktop (Node.js + Playwright, driving the engine in headless Chromium). |
| `lib/` | `wsmodel.js`, `model.js` (stand-alone surface and drip models used for the independent comparison) and `engine_v1_pre_correction.html` (the first release of the engine, needed only to regenerate the "version 1" rows of the sprinkler, drip and surface tables). |
| `intermediates/` | three small arrays used by figure scripts whose generating code was not kept as a script (see "Limits"). |
| `make_data.py`, `make_e12.py` | rebuild the working pickle and the E12 input table of the Engine 1 held-out test from the CSV. |
| `compare_results.py`, `audit_numbers.py` | the two checks above. |
| `CHECKSUMS.sha256` | SHA-256 of every file in this folder (and of the engine under test). `sha256sum -c CHECKSUMS.sha256` |
| `requirements.txt` | pinned versions. |

The engine under test is `Software/SWAFL_Desktop/app/engine/engine.html` of the repository (override with `SWAFL_ENGINE`).

## Determinism

* Every stochastic step has a fixed seed: NumPy `default_rng` seeds 20261018 (P1 core), 7 (P1 stats), 2026 (P1 rate law), 5 (P1 robustness), 1 (P2), and `random_state=i` for the 500 pair bootstraps; gradient-boosting benchmarks use `random_state=0`. (Before this package was assembled the gradient-boosting seed was left at its default, which can switch on random early stopping for tables above 10 000 rows; fixing it changed the scores only in the fifth decimal.) Monte-Carlo draws inside the engine use a hash-seeded generator, so engine outputs are identical between runs.
* `PYTHONHASHSEED=0` and single-threaded BLAS are set by `run_all.sh`. Results were regenerated on one machine; agreement with the archived numbers is to 1e-6 relative (see the comparison output). Bit-identical output on other CPUs or BLAS builds is not guaranteed; the manuscripts quote 2-3 significant digits.

## Where each manuscript number comes from

| Result | Script -> output |
|---|---|
| Memory fates, loss fates (P1 Tables 3-4) | `p1_core.py` -> `p1_core.json`, `p1_table.csv` |
| Rank statistics, permutation tests (P1 Table 5) | `p1_stats.py` -> `p1_table2.csv`; `p1_figs_d.py` -> `p1_rank.json` |
| Rate-competition law: q*, R^2, bootstrap and jackknife intervals, LOSO table (P1 Section 4.3, Table 6) | `p1_rate_law.py` -> `p1_rate_law.json` |
| Earlier two-parameter variant; logistic-in-n LOO RMSE 0.111 (P1 caution) | `p1_mech.py` -> `p1_mech.json` |
| Modifiers (P1) | `p1_figs_c.py` -> `p1_modifiers.json` |
| Linear invariants, SVD, permutation null, closure (P2) | `p2_a.py`, `p2_laws.py` -> `p2_a.json`, `p2_laws.json` |
| Unattributed term R (P2) | `p2_R.py` -> `p2_R.json` |
| clr-PCA and its sensitivity (P2) | `p2_a.py`, `p2_figs.py`, `p2_fig4.py` -> `p2_pca.json`, `p2_pca_sens.json` |
| Sparse laws and benchmarks (P2) | `p2_et.py`, `p2_dpf.py`, `p2_figs2.py`, `p2_nested.py` -> `p2_et.json`, `p2_dpf.json`, `p2_etlaw.json`, `p2_nested.json` |
| Surface irrigation vs. FAO-45 and Walker examples (P3) | `v_surface.js`, `v_border.js`, `run_fao.js`; `p3_figs.py` -> `p3_surface.json`, `p3_ws61.csv` |
| Drip (Hazen-Williams) comparison (P3) | `v_drip.js`, `run_drip.js` -> `p3_drip_swafl.json`, `drip_out.json` |
| Sprinkler: nozzle, wetted diameter, spacing (P3) | `v_sprinkler.js`, `run_spr.js` -> `p3_sprinkler.json`, `spr_out.json` |
| Engine 1 versus Daisy, held-out E12 (P3) | `make_e12.py`, `e1_heldout.js` -> `e12.json`, `e12_pred.json` |
| Engine 1 sensitivity; Engine 2 closure and grid (P3) | `e1_sens.js`, `e2_closure.js`, `e2_grid.js`, `l_sens.js` -> `p3_*.json` |
| Figure 1 of each paper (A4 landscape canvas) | `p1_fig1_new.py`, `p2_fig1_new.py`, `p3_fig01_workflow_v9.py`, then `make_a4.py` |

## Limits (stated plainly)

* **No field validation.** All Daisy runs are simulations; the verification in P3 compares SWAFL Desktop with published worked examples and with Daisy. The package reproduces the computations, not the agreement of any model with measurements.
* **Daisy itself is not re-run.** The ensemble is archived output of Daisy. Re-running it requires the Daisy executable and the setup files, which are not part of this package; the exact Daisy release used is not recorded in these files and should be added to the dataset record before submission.
* **Three intermediate arrays are archived, not regenerated** (`intermediates/`): `p1_e11.pkl` (E11 grid summary for a P1 figure), `p3_drip_cmp.npy` and `drip_scatter.npy` (drip solver comparison for P3 figures). Their generating code was run interactively and was not kept. They feed figures only; no number in the text depends on them.
* **Application screenshots.** The layer montage (P3 Figure 2) and the interface figures are screenshots of SWAFL Desktop taken by hand; `p3_figs.py` reports a failed step for the montage when these are absent.
* **Stochastic components.** Seeds are fixed (above); a different NumPy, SciPy or scikit-learn version can change random streams or solver paths.
* **Browser.** `p3_js/*.js` launch `/opt/pw-browsers/chromium`; set another path in the first line of each script if needed (Playwright 1.56.0 was used).
* **Fonts.** Figures use the Carlito font if installed (fallback DejaVu Sans), which changes only text widths.

## Versions used

Python 3.13.16; NumPy 2.5.3; SciPy 1.18.1; pandas 3.0.5; scikit-learn 1.9.1; Matplotlib 3.11.2; Node.js 22.22.0; Playwright 1.56.0 with Chromium. Typesetting: XeLaTeX and BibTeX.
