# Data

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.23043626">
    <img src="https://img.shields.io/badge/%E2%86%92%20DATA-Open%20the%20complete%20dataset%20on%20Zenodo-2ea44f?style=for-the-badge&logo=zenodo&logoColor=white" alt="Data on Zenodo" />
  </a>
</p>

**Complete dataset (permanent archive):** Naziru Halilu (2026). *Data_coupled_water_fluxes_pore_scale_dynamics* [Dataset]. Zenodo.
**[https://doi.org/10.5281/zenodo.23043626](https://doi.org/10.5281/zenodo.23043626)**

The Zenodo record holds all 10 190 Daisy runs, raw and derived. This folder holds the raw run table that every result
in the repository is computed from, and lists, with a link, every data file used in the GitHub repository.

---

## 1. Raw data in this folder

| File | Content |
|:--|:--|
| [`daisy_ensemble.csv.gz`](daisy_ensemble.csv.gz) | **The raw run table.** 10 190 Daisy runs (17 experiments, E0 to E16, ten soils, 20 years of Taastrup weather, 1980-1999), one row per run, 32 columns of factor levels and 20-year mean outputs (yield, irrigation, rain, drainage at 1 m, evapotranspiration, transpiration, soil and canopy evaporation, water-stress days, nitrogen applied and leached, and the ratios IE, DPF and NLF). 10 041 runs are valid; 149 are solver failures flagged `valid = 0`. Every column is defined in [`Results/07_Derived_Data_Tables/README.md`](../Results/07_Derived_Data_Tables/README.md#12-raw-output-columns-one-row-per-run-20-year-means-1980-1999-taastrup-weather). |

The file is byte-identical to the copy used by the manuscript reproducibility package
(SHA-256 `f39b2b2e3631a434c1c7b618566d2dc4d33766230d21f94a639e71dacf47532a`).

```python
import pandas as pd
runs = pd.read_csv("Data/daisy_ensemble.csv.gz")
valid = runs[runs.valid == 1]          # 10 041 runs used in every analysis
```

## 1a. Full simulation outputs (`Comprehensive_Summary/`)

[`Comprehensive_Summary/`](Comprehensive_Summary) holds the complete per-run Daisy output of all 17 experiments, one
gzip-compressed CSV per experiment, as summarised from the Daisy log files by
[`summarize_results3.py`](Comprehensive_Summary/summarize_results3.py) (see [`00_README.txt`](Comprehensive_Summary/00_README.txt)).

| File | Content |
|:--|:--|
| `E00_Baselines.csv.gz` … `E16_Edge_Cases.csv.gz` | every log line of every run: the annual water balance (`Annual-FWater`), the nitrogen balance, the harvest and the crop state, per simulated year |
| `00_summary_all_simulations.csv.gz` | one row per run: factor levels and summary outputs, all experiments |
| `00_SUMMARY_ALL_EXPERIMENTS.csv.gz` | the same, aggregated per experiment |
| `Experiment_Summaries/Exx_*_SUMMARY.csv.gz` | the per-run summary of each experiment |

Local computer paths in the original files were shortened to relative paths (`experiments\...`); no other value was changed.

**Consistency with the run table.** The 20-year means of the annual balances closing on 1 April 1981-2000 reproduce the
values of `daisy_ensemble.csv.gz` (largest relative difference below 2 % for every output; per experiment in
[`Software/SWAFL_Desktop/tools/peryear_check.txt`](../Software/SWAFL_Desktop/tools/peryear_check.txt)).

**Evapotranspiration closure.** In these outputs ET equals transpiration + soil evaporation + canopy (intercepted)
evaporation + litter evaporation + evaporation of ponded water + snow evaporation, with a residual of 1.1 mm or less. The
part of ET not attributed to transpiration, soil or canopy evaporation in the run table (about 30 %) is therefore
evaporation of ponded water (21.6 % of ET), litter (7.6 %) and snow (2.7 %).

**Use in the software.** [`Software/SWAFL_Desktop/tools/make_peryear.py`](../Software/SWAFL_Desktop/tools/make_peryear.py)
extracts the year-by-year balances of experiments E00, E02, E03, E04, E05 and E07 (1 003 runs, 20 years each) into
`app/engine/peryear.js`, which drives the year-by-year, full-water-balance, nitrogen-budget and crop-water layers.

## 2. Every data file used in the repository

### 2.1 Raw simulation data

| Data | Location | Used by |
|:--|:--|:--|
| Raw run table (10 190 runs) | [`Data/daisy_ensemble.csv.gz`](daisy_ensemble.csv.gz) | everything below |
| Same table, reproducibility copy | [`Manuscripts/reproducibility/data/daisy_ensemble.csv.gz`](../Manuscripts/reproducibility/data/daisy_ensemble.csv.gz) | `run_all.sh` (Papers 1-3) |
| Same table with analysis sheets (live formulas) | [`Results/03_Excel_Analysis/Results_Analysis.xlsx`](../Results/03_Excel_Analysis/Results_Analysis.xlsx), sheet `Data` | Excel analysis |
| Full per-year outputs of all 17 experiments | [`Data/Comprehensive_Summary/`](Comprehensive_Summary) | software year-by-year layers (`make_peryear.py`) |
| Complete archive, all runs raw and derived | [Zenodo, doi: 10.5281/zenodo.23043626](https://doi.org/10.5281/zenodo.23043626) | – |

### 2.2 Derived data tables (Results)

All seven tables are re-derived from the raw run table by
[`Results/07_Derived_Data_Tables/derive_tables.py`](../Results/07_Derived_Data_Tables/derive_tables.py); the
derivation of each is set out in [`Results/07_Derived_Data_Tables/README.md`](../Results/07_Derived_Data_Tables/README.md).

| Table | Content |
|:--|:--|
| [`effect_sizes.csv`](../Results/07_Derived_Data_Tables/effect_sizes.csv) | ten regression slopes (e.g. +45.5 mm irrigation per °C) |
| [`elasticities.csv`](../Results/07_Derived_Data_Tables/elasticities.csv) | log-log elasticities, 10 drivers × 6 outputs |
| [`pareto_runs.csv`](../Results/07_Derived_Data_Tables/pareto_runs.csv) | the 170 Pareto-optimal runs (max IE, min DPF, min NLF) |
| [`production_function_fits.csv`](../Results/07_Derived_Data_Tables/production_function_fits.csv) | saturating yield-irrigation fits per soil |
| [`controllability_by_soil_lever_outcome.csv`](../Results/07_Derived_Data_Tables/controllability_by_soil_lever_outcome.csv) | 10-90 % range of each outcome per soil and lever |
| [`controllability_rho_vs_TAW.csv`](../Results/07_Derived_Data_Tables/controllability_rho_vs_TAW.csv) | Spearman correlation of controllability with available water |
| [`N1_soil_specific_triggers.csv`](../Results/07_Derived_Data_Tables/N1_soil_specific_triggers.csv) | suction trigger reaching depletion 0.45 in each soil |

### 2.3 Manuscript numerical results

[`Manuscripts/results/`](../Manuscripts/results) holds every number reported in the three manuscripts, each written by
the script named in the manuscript's reproducibility appendix and regenerated by
[`Manuscripts/reproducibility/run_all.sh`](../Manuscripts/reproducibility/run_all.sh).

| Files | Paper | Content |
|:--|:--|:--|
| [`p1_core.json`](../Manuscripts/results/p1_core.json), [`p1_table.csv`](../Manuscripts/results/p1_table.csv), [`p1_table2.csv`](../Manuscripts/results/p1_table2.csv), [`p1_rank.json`](../Manuscripts/results/p1_rank.json), [`p1_rate_law.json`](../Manuscripts/results/p1_rate_law.json), [`p1_mech.json`](../Manuscripts/results/p1_mech.json), [`p1_modifiers.json`](../Manuscripts/results/p1_modifiers.json), [`p1_loso_summary.json`](../Manuscripts/results/p1_loso_summary.json), [`p1_ens_structure.json`](../Manuscripts/results/p1_ens_structure.json) | 1 | memory and loss fates, rank statistics, rate-competition law, modifiers |
| [`p2_a.json`](../Manuscripts/results/p2_a.json), [`p2_laws.json`](../Manuscripts/results/p2_laws.json), [`p2_laws2.json`](../Manuscripts/results/p2_laws2.json), [`p2_R.json`](../Manuscripts/results/p2_R.json), [`p2_pca.json`](../Manuscripts/results/p2_pca.json), [`p2_pca_sens.json`](../Manuscripts/results/p2_pca_sens.json), [`p2_et.json`](../Manuscripts/results/p2_et.json), [`p2_etlaw.json`](../Manuscripts/results/p2_etlaw.json), [`p2_dpf.json`](../Manuscripts/results/p2_dpf.json), [`p2_nested.json`](../Manuscripts/results/p2_nested.json), [`p2_s02_excl.json`](../Manuscripts/results/p2_s02_excl.json), [`p2_robust.json`](../Manuscripts/results/p2_robust.json) | 2 | invariants, unattributed term, compositional PCA, sparse laws |
| [`p3_swa_vars.json`](../Manuscripts/results/p3_swa_vars.json) | 3 | soil–water–atmosphere state and flux variables of the ten soils |
| [`p3_ws61.csv`](../Manuscripts/results/p3_ws61.csv), [`p3_surface.json`](../Manuscripts/results/p3_surface.json), [`p3_surface_shipped.json`](../Manuscripts/results/p3_surface_shipped.json), [`p3_border.json`](../Manuscripts/results/p3_border.json), [`fao_out.json`](../Manuscripts/results/fao_out.json), [`p3_sprinkler.json`](../Manuscripts/results/p3_sprinkler.json), [`spr_out.json`](../Manuscripts/results/spr_out.json), [`p3_drip_swafl.json`](../Manuscripts/results/p3_drip_swafl.json), [`drip_out.json`](../Manuscripts/results/drip_out.json), [`p3_drip_bands2.json`](../Manuscripts/results/p3_drip_bands2.json) | 3 | verification of the surface, sprinkler and drip layers |
| [`e12.json`](../Manuscripts/results/e12.json), [`e12_pred.json`](../Manuscripts/results/e12_pred.json), [`p3_e1_sens.json`](../Manuscripts/results/p3_e1_sens.json), [`p3_e2_closure.json`](../Manuscripts/results/p3_e2_closure.json), [`p3_e2_grid.json`](../Manuscripts/results/p3_e2_grid.json), [`p3_l_sens.json`](../Manuscripts/results/p3_l_sens.json), [`p3_bench.json`](../Manuscripts/results/p3_bench.json) | 3 | annual and daily engines: held-out test, closure, sensitivity, run time |

The figure catalogue of `Results` ([`Figure_Catalogue.csv`](../Results/Figure_Catalogue.csv)) gives the title, caption and data source of every figure.

Three small intermediate arrays used only by figures are in
[`Manuscripts/reproducibility/intermediates/`](../Manuscripts/reproducibility/intermediates).

### 2.4 Data embedded in the software

The SWAFL Desktop engine ([`Software/SWAFL_Desktop/app/engine/engine.html`](../Software/SWAFL_Desktop/app/engine/engine.html))
carries, as JSON, the Daisy result tables it composes (baselines and experiments E2, E3, E4, E5, E7, E11, E13, E14,
E15), the 20-year daily suction record at 20 cm and the 1994 profiles, all taken from the raw data above, and
(`peryear.js`) the per-year balances of 1 003 runs taken from `Comprehensive_Summary/`. It makes no external data call.

## 3. Licence and citation

Data are released with the repository under the [MIT licence](../LICENSE). Please cite the Zenodo record:

> Naziru Halilu. (2026). *Data_coupled_water_fluxes_pore_scale_dynamics* [Dataset]. Zenodo. https://doi.org/10.5281/zenodo.23043626
