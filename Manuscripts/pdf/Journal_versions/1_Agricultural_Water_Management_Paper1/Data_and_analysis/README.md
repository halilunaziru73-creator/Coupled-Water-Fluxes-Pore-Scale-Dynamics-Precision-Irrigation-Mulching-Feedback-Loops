# Data and analysis of the article

*Soil hydraulic memory, the recoverability of evaporation savings and the closure of the water balance (Agricultural Water Management)*

Every figure and table of the article can be traced here to the numbers it shows.

* `figures/Figure_N_*.csv`: every point drawn in Figure N, one row per point, with the panel, its title, the axis labels, the kind of mark (line, scatter, bar, error bar, band, cell of a map), the series name and the values (`x`, `y`, `y_low`/`y_high` for bars, error bars and bands; `x_category`/`y_category` give the label of a categorical axis, e.g. the soil). The rows were recorded while the original script drew the figure, so they are exactly what is plotted.
* `figures/Figure_N_*__<result file>`: the result tables the figure was drawn from.
* `tables/Table_N_*.csv`: every table of the article.
* `replot_from_csv.py`: redraws every figure from the CSV files alone into `replot/` (`python3 replot_from_csv.py`; needs pandas and matplotlib).
* `analysis/`: the original analysis: the Daisy ensemble (`data/daisy_ensemble.csv.gz`, 10 190 runs, 10 041 valid), all scripts, the archived results and `run_original.sh`, which runs it again.

## Figures

| Figure | What it shows | Data | Made by |
|---|---|---|---|
| 1 | Conceptual and analytical framework. Antecedent storage released from the root zone can leave as drainage, soil evaporation, transpiration or other evaporation (memory fates φ, estimated from E9). An imposed change in evaporative loss is offset by … | conceptual diagram (no data) | `analysis/p1_fig1_new.py` |
| 2 | (a) Memory fates φ of released antecedent storage (E9; error bars: bootstrap 95 % CI for drainage). (b) Loss fates ψ_D (drainage) and ψ_I (irrigation) of an evaporation-factor increase (E16). (c) Drainage share of the evaporation saving from mulch (E7). … | `figures/Figure_2_fig04_fates.csv`, `figures/Figure_2_fig04_fates__p1_core.json`, `figures/Figure_2_fig04_fates__p1_table.csv` | `analysis/p1_figs_b.py` |
| 3 | Relationship between the memory fate φ_D (E9) and four soil-level predictors: (a) van Genuchten n, (b) log_10K_s (eight soils), (c) to 1 m, (d) effective saturation at 100 cm. Spearman ρ given in each panel. | `figures/Figure_3_fig05_predictors.csv`, `figures/Figure_3_fig05_predictors__p1_core.json`, `figures/Figure_3_fig05_predictors__p1_table2.csv` | `analysis/p1_figs_b.py` |
| 4 | Rate-competition law. (a) φ_D against K_s with the fitted curve K_s/(K_s+q^*); crosses mark implied K_s for S01 and S02. (b) Leave-one-soil-out predictions against observations (RMSE 0.058). (c) LOSO RMSE of each predictor of φ_D (asterisk: eight soils; … | `figures/Figure_4_fig06_mechanism.csv`, `figures/Figure_4_fig06_mechanism__p1_rate_law.json`, `figures/Figure_4_fig06_mechanism__p1_mech.json` | `analysis/p1_figs_b.py` |
| 5 | Cross-experiment transfer. (a) ψ_D from E16 against φ_D from E9; (b) ψ_D from the mulch lattice E7 against φ_D; (c) E7 against E16. Each point is a soil, coloured by n (as in Fig. 3). | `figures/Figure_5_fig08_replication.csv`, `figures/Figure_5_fig08_replication__p1_rank.json` | `analysis/p1_figs_c.py` |
| 6 | Modifiers of the drainage share ψ_D in E16. Each line is a soil (colour: n); (a) rainfall scale, (b) warming, (c) trigger suction, (d) irrigation dose. | `figures/Figure_6_fig07_modifiers.csv`, `figures/Figure_6_fig07_modifiers__p1_modifiers.json` | `analysis/p1_figs_c.py` |
| 7 | Climate surface of the drainage share ψ_D for coarse loam (S01) from the E11 lattice. (a) ψ_D over rain scale and warming (white contours), (b) ψ_D against P for selected warming levels, (c) ψ_D against warming for selected rain scales. | `figures/Figure_7_fig11_e11_surface.csv` | `analysis/p1_figs_e.py` |
| 8 | Linear invariants. (a) Singular values of the seven-flux matrix for the real data and for column-permuted data. (b) Coefficients of the smallest right singular vector (scaled so c_ET=-1) with bootstrap intervals. (c) Storage residual Δ S/W by experiment: … | `figures/Figure_8_fig02_invariants.csv`, `figures/Figure_8_fig02_invariants__p2_a.json`, `figures/Figure_8_fig02_invariants__p2_laws.json` | `analysis/p2_figs.py` |
| 9 | The unattributed term R. (a) R and canopy evaporation in E4 by irrigation method. (b) R against annual rain in E9 (rainfed, light points), with the linear fit and the ten E0 baselines. | `figures/Figure_9_fig03_hidden_term.csv`, `figures/Figure_9_fig03_hidden_term__p2_R.json` | `analysis/p2_figs.py` |
| 10 | Compact ET law. (a) Leave-one-experiment-out predictions of the three-term law versus Daisy ET. (b) Gradient-boosting benchmark. (c) Fitted coefficients across the 17 LOEO folds. (d) LOEO MAPE by experiment. (e) The law at I=200 mm for four soils (grey … | `figures/Figure_10_fig05_ET_law.csv`, `figures/Figure_10_fig05_ET_law__p2_et.json`, `figures/Figure_10_fig05_ET_law__p2_etlaw.json` | `analysis/p2_figs2.py` |

## Tables

| Table | Caption | Data |
|---|---|---|
| 1 | Experiments of the ensemble used in this paper. "Valid" counts exclude runs that failed to complete. Experiments marked * are the primary ones for the diagnostics defined here. | `tables/Table_1_Experiments_of_the_ensemble_used_in_this.csv` (18 rows) |
| 2 | Soil set. n and α: effective van Genuchten parameters; : total available water to 1 m used in the project documentation; (100): effective saturation at 100 cm suction from Eq. (1). | `tables/Table_2_Soil_set_n_and_effective_van_Genuchten_p.csv` (11 rows) |
| 3 | Memory fates (E9) and loss fates (E16, E7) by soil. φ_D,φ_T,φ_E_s: drainage, transpiration and soil-evaporation shares of released antecedent storage; ψ_D, ψ_I: drainage and irrigation shares of … | `tables/Table_3_Memory_fates_E9_and_loss_fates_E16_E7_by.csv` (11 rows) |
| 4 | Leave-one-soil-out (LOSO) predictive error of φ_D by predictor. | `tables/Table_4_Leave_one_soil_out_LOSO_predictive_error.csv` (11 rows) |
| 5 | Rank associations among soil-level diagnostics (n=10 soils). CI: percentile bootstrap. | `tables/Table_5_Rank_associations_among_soil_level_diagn.csv` (6 rows) |
| 6 | Paired effects of E16 factors on the drainage share ψ_D of an evaporation change. "Up" counts soils in which ψ_D is higher at the second level. p: exact two-sided sign test across soils. | `tables/Table_6_Paired_effects_of_E16_factors_on_the_dra.csv` (6 rows) |
| 7 | Sparse laws and benchmark. cross-validated R^2 on the log scale. Selected terms in order of selection. | `tables/Table_7_Sparse_laws_and_benchmark_cross_validate.csv` (8 rows) |
| 8 | Drainage share of the change of evaporation in the mulch experiment E7 (20 combinations per soil), computed against the closed non-transpiration term E_nt=ET-T (as in the memory analysis) and … | `tables/Table_8_Drainage_share_of_the_change_of_evaporat.csv` (11 rows) |
| 9 | Qualitative reading of the diagnostics for management. ρ_R from E16 (Table 3); "mulch" column from E7. | `tables/Table_9_Qualitative_reading_of_the_diagnostics_f.csv` (4 rows) |
| A.10 | Closure of the loss fates. Δ: mean paired change in non-transpirational evapotranspiration for E_p=0.3→1.2 (mm yr^-1); ψ_D,ψ_I,ψ_T: shares; : their sum (the remainder is storage and runoff); span … | `tables/Table_A.10_Closure_of_the_loss_fates_mean_paired_ch.csv` (11 rows) |

## Running the analysis again

```
cd analysis
python3 -m pip install -r requirements.txt
sh run_original.sh
```

Seeds are fixed (see `scripts/` and `Manuscripts/reproducibility/README_REPRODUCE.md` of the repository), so the numbers come out the same as in `analysis/results`.
