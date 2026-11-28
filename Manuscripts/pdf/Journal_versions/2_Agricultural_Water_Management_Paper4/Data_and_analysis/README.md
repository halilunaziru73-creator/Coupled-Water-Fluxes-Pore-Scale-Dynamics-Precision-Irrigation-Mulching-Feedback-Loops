# Data and analysis of the article

*The reach of suction-triggered irrigation and the marginal fate of irrigation water (Agricultural Water Management)*

Every figure and table of the article can be traced here to the numbers it shows.

* `figures/Figure_N_*.csv`: every point drawn in Figure N, one row per point, with the panel, its title, the axis labels, the kind of mark (line, scatter, bar, error bar, band, cell of a map), the series name and the values (`x`, `y`, `y_low`/`y_high` for bars, error bars and bands; `x_category`/`y_category` give the label of a categorical axis, e.g. the soil). The rows were recorded while the original script drew the figure, so they are exactly what is plotted.
* `figures/Figure_N_*__<result file>`: the result tables the figure was drawn from.
* `tables/Table_N_*.csv`: every table of the article.
* `replot_from_csv.py`: redraws every figure from the CSV files alone into `replot/` (`python3 replot_from_csv.py`; needs pandas and matplotlib).
* `analysis/`: the original analysis: the Daisy ensemble (`data/daisy_ensemble.csv.gz`, 10 190 runs, 10 041 valid), all scripts, the archived results and `run_original.sh`, which runs it again.

## Figures

| Figure | What it shows | Data | Made by |
|---|---|---|---|
| 1 | The two questions. Q1 (right): a trigger h_t fires only if the crop can dry the soil at the sensor to h_t; the reach h_c (dashed) is 199 cm in sand and 9×10^3 cm in loam, so the usual triggers (grey) lie beyond the reach of sand. Q2 (left): the fate of an … | conceptual diagram; its numbers (reach 199 cm and 9 000 cm, fates of E10) are those of Figures 2, 3 and 5 | `analysis/p4_concept.py` |
| 2 | (a) Retention and (b) relative conductivity of the ten soils (Eq. (1), Eq. (2)); circles mark the reach of Eq. (4) and the dashed line the fitted κ=3.5×10^-10; grey: the range of triggers tested. (c) Reach against n for the ten soils, with Eq. (4) for … | `figures/Figure_2_fig2_curves_reach.csv`, `figures/Figure_2_fig2_curves_reach__p4_tableA1_reach.csv`; curves (a, b) computed from α and n of Table A.4 with Eqs. 1-2; circles and panel c: column reach_Eq4_cm of Table A.4 | `analysis/p4_reach.py` |
| 3 | The reach of a suction trigger in experiment E2 (197 runs). (a) Irrigation against the trigger. (b) The same runs against the reach-scaled trigger h_t/h_c, irrigation divided by its soil maximum: every soil stops at h_t/h_c≈0.5 to 1. (c) Predicted reach … | `figures/Figure_3_fig3_trigger_reach__p4_fig3_trigger_runs.csv`, `figures/Figure_3_fig3_trigger_reach__p4_tableA1_reach.csv`; drawn from the result tables below | `analysis/p4_reach.py` |
| 4 | Determination of the constant κ of Eq. (4) from experiment E2. (a) Predicted reach of each soil against the trial value of κ; at the right, the reach observed in Daisy (bars: interval between the last firing and the first non-firing trigger; arrows: only a … | `figures/Figure_4_fig6_kappa.csv`, `figures/Figure_4_fig6_kappa__p4_fig6a_reach_vs_kappa.csv`, `figures/Figure_4_fig6_kappa__p4_fig6b_misfit.csv`, `figures/Figure_4_fig6_kappa__p4_tableA1_reach.csv` | `analysis/p4_kappa.py` |
| 5 | The fate of an irrigation millimetre, Eq. (5). (a) By soil (E10, 744 irrigated runs; sand and loamy sand are never irrigated at the 300 cm trigger of E10), ordered by n. (b) By method, on all soils (E4) and on coarse loam over all rates, doses and rooting … | `figures/Figure_5_fig4_marginal_fate__p4_fig4a_fate_by_soil.csv`, `figures/Figure_5_fig4_marginal_fate__p4_fig4b_fate_by_method.csv`; drawn from the result tables below | `analysis/p4_reach.py` |
| 6 | The dose (E10, all ten windows pooled). (a) Drained share with Eq. (6) per soil. (b) Transpired share. (c) Evaporated share (soil and other evaporation). | `figures/Figure_6_fig5_dose__p4_fig5_dose.csv`; drawn from the result table below | `analysis/p4_reach.py` |

## Tables

| Table | Caption | Data |
|---|---|---|
| 1 | The experiments of the analysis, from Data/Comprehensive_Summary (10190 runs, 10041 valid; 20 years, 1980–1999, of Taastrup weather). Means of the valid runs; Y yield (Mg ha^-1), I irrigation, D … | `tables/Table_1_The_experiments_of_the_analysis_from_Dat.csv` (7 rows) |
| 2 | Closed forms for the reach of a trigger, fitted to the interval-censored reaches of ten soils (E2) and validated leaving one soil out. | `tables/Table_2_Closed_forms_for_the_reach_of_a_trigger.csv` (6 rows) |
| 3 | Rules for the reach of a trigger with and without κ, fitted to the ten soils of E2. | `tables/Table_3_Rules_for_the_reach_of_a_trigger_with_an.csv` (6 rows) |
| A.4 | Observed reach interval (E2) and the predictions of Eq. (4) for the ten soils. Yields in Mg ha^-1. | `tables/Table_A.4_Observed_reach_interval_E2_and_the_predi.csv` (11 rows) |

## Running the analysis again

```
cd analysis
python3 -m pip install -r requirements.txt
sh run_original.sh
```

Seeds are fixed (see `scripts/` and `Manuscripts/reproducibility/README_REPRODUCE.md` of the repository), so the numbers come out the same as in `analysis/results`.
