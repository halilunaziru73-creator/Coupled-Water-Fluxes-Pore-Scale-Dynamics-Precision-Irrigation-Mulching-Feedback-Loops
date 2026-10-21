# 07 Derived Data Tables: how each table is derived from the raw data

Every table in this folder is computed from one raw table: the 20-year mean output of each of the
**10 190 Daisy runs** (one row per run). This page lists that raw output, then shows, table by table, which
runs are selected, which raw columns are used and which formula turns them into the table, with a worked example.

The derivation can be checked in one command. `derive_tables.py` re-derives all seven tables from the raw table
and compares every cell with the archived CSV:

```bash
python3 Results/07_Derived_Data_Tables/derive_tables.py            # derive and compare (all 8 checks agree)
python3 Results/07_Derived_Data_Tables/derive_tables.py --write    # also write *_rederived.csv files
```

Result of the check (all cells agree with the archived tables to within 6e-6 relative difference):

```
ok      effect_sizes.csv                              cells    10  max rel. diff 2.13e-15  NaN mismatches 0
ok      elasticities.csv                              cells    60  max rel. diff 9.28e-13  NaN mismatches 0
ok      pareto_runs.csv (set of run_id)               runs 170 re-derived, 170 archived
ok      pareto_runs.csv (IE, DPF, NLF of each run)    cells   510  max rel. diff 0.00e+00  NaN mismatches 0
ok      production_function_fits.csv                  cells    30  max rel. diff 1.60e-16  NaN mismatches 0
ok      controllability_by_soil_lever_outcome.csv     cells   549  max rel. diff 2.54e-15  NaN mismatches 0
ok      controllability_rho_vs_TAW.csv                cells    28  max rel. diff 1.11e-15  NaN mismatches 0
ok      N1_soil_specific_triggers.csv                 cells    20  max rel. diff 5.63e-06  NaN mismatches 0
8 of 8 checks agree with the archived tables
```

The original scripts that first produced the tables are in [`../08_Scripts`](../08_Scripts) (file and line are given
for each table below). They read the original `summary_all.csv`; `derive_tables.py` does the same steps on the
archived run table.

---

## 1. The raw data

### 1.1 Where it is

| File | Rows | Content |
|:--|--:|:--|
| [`Data/daisy_ensemble.csv.gz`](../../Data/daisy_ensemble.csv.gz) | 10 190 | raw run table used here (32 columns, listed below) |
| [`Manuscripts/reproducibility/data/daisy_ensemble.csv.gz`](../../Manuscripts/reproducibility/data/daisy_ensemble.csv.gz) | 10 190 | identical copy used by the manuscript reproducibility package |
| Zenodo, [doi: 10.5281/zenodo.23043626](https://doi.org/10.5281/zenodo.23043626) | 10 190 | complete archive of all runs, raw and derived |

The 17 experiments (E0 to E16) are on ten soils, except E8, E11, E12, E14 and E15, which are on the coarse loam (S01) only.
149 runs are numerical (solver) failures (`valid = 0`); **they are excluded from every table**, which therefore
uses the 10 041 valid runs.

### 1.2 Raw output columns (one row per run, 20-year means, 1980-1999, Taastrup weather)

**Identification and factor levels** (from the run design; factor columns are empty where an experiment does not vary that factor)

| Column | Unit | Meaning |
|:--|:--|:--|
| `experiment`, `exp` | – | experiment name (e.g. `E2_TriggerPressure`) and its code (`E2`) |
| `run_id` | – | unique run identifier |
| `soil` | – | S01_CoarseLoam … S10_SiltyClayLoam |
| `treatment` | – | treatment string that encodes the factor levels (e.g. `conv_tc0.001_Irrigated`, `N100_Deficit600`) |
| `valid` | 0/1 | 1 = run completed; 0 = solver failure (excluded) |
| `pareto` | 0/1 | 1 = run is in `pareto_runs.csv` (table 3 below; a derived flag) |
| `P` | – | rainfall scale (×0.5 … ×1.5) |
| `dT` | °C | temperature shift |
| `Ep` | – | soil-evaporation factor |
| `trig` | cm | irrigation trigger suction (negative) |
| `z` | cm | sensor depth |
| `amt_mm` | mm | irrigation amount per event (E10, E15) |
| `vff` | – | mulch vapour-flux factor (1.0 = bare) |
| `cap` | mm | mulch interception capacity |
| `Nrate` | % | nitrogen rate, per cent of standard |
| `wstrat` | – | water strategy of E13 (e.g. `W04_Surf300`) |
| `root` | cm | prescribed rooting depth (E15) |

**Model output** (Daisy, mean per year)

| Column | Unit | Meaning |
|:--|:--|:--|
| `yield_Mg_ha` | Mg ha⁻¹ | grain or biomass yield |
| `irrigation_mm` | mm yr⁻¹ | irrigation applied |
| `rain_mm` | mm yr⁻¹ | precipitation |
| `drainage_1m_mm` | mm yr⁻¹ | water flux across 1 m depth (negative = net capillary rise) |
| `ET_mm` | mm yr⁻¹ | actual evapotranspiration (total) |
| `transpiration_mm` | mm yr⁻¹ | transpiration |
| `soil_evap_mm` | mm yr⁻¹ | soil evaporation |
| `canopy_evap_mm` | mm yr⁻¹ | evaporation of water intercepted by the canopy |
| `water_stress_d` | d yr⁻¹ | days of crop water stress |
| `N_fertiliser_kg_ha` | kg N ha⁻¹ yr⁻¹ | nitrogen applied |
| `N_leached_kg_ha` | kg N ha⁻¹ yr⁻¹ | nitrate-N leached below 1 m |

**Per-run ratios** (computed from the output columns of the same row)

| Column | Formula | Unit |
|:--|:--|:--|
| `IE_kg_m3` | `yield_Mg_ha × 1000 / (irrigation_mm × 10)`, empty where irrigation is below 20 mm yr⁻¹ (this includes all rainfed runs). It was computed from the unrounded outputs, so the formula applied to the stored, rounded columns agrees to within 0.003 kg m⁻³ | kg m⁻³ |
| `DPF` | `drainage_1m_mm / (rain_mm + irrigation_mm)` | – |
| `NLF` | `N_leached_kg_ha / N_fertiliser_kg_ha` | – |

Example (run `E10_S01_CoarseLoam_A10mm_T06_Apr1-Jun1`): yield 5.918, irrigation 112.495, rain 464.384, drainage 7.785,
N leached 31.03, N applied 229.0, so IE = 5918/1124.95 = **5.261** kg m⁻³, DPF = 7.785/576.879 = **0.0135**,
NLF = 31.03/229.0 = **0.1355**, the values stored in the table.

### 1.3 Additional raw columns of the original run table

The original run table from which the 32-column table was extracted (`summary_all.csv`, read by the scripts in `08_Scripts`) carries these further Daisy outputs, as the rows reproduced in `pareto_runs.csv` show:
`status`, `n_years`, `first_harvest`, `last_harvest`, `N_stress_d` (d yr⁻¹), `irrigation_events` (events in 20 years),
`N_uptake_kg_ha`, `IWUE_kg_m3`, `PFPn_kg_kg` (partial factor productivity of N), `h_max_cm` (largest suction reached),
`rainfed_partner` and `failed`. None of the seven tables depends on them except as passengers in `pareto_runs.csv`.

### 1.4 Columns added during analysis

**Step 0, applied before every table** (these are the only columns that `derive_tables.py` adds, in `load()`):

| Added column | How it is obtained |
|:--|:--|
| `failed` | `valid != 1` (the 149 solver failures) |
| `water` | from `treatment`: `Irrigated` or `Rainfed` (E5) |
| `e6strat` | from `treatment`: N/water pathway of E6 (`N100_Deficit600` → `Deficit600`; baseline rows → empty) |
| `IE_kg_m3` | set to empty where `irrigation_mm < 20` (a ratio of a very small irrigation is not interpreted) |

**Passenger columns of the archived `pareto_runs.csv` only.** The original scripts in `08_Scripts` also attached the
following columns to every run. No table value depends on them; they are carried in `pareto_runs.csv` for reading,
and `derive_tables.py` does not recreate them (it checks the set of Pareto runs and their IE, DPF and NLF):

| Column | How it is obtained |
|:--|:--|
| `other_evap_mm` | `ET_mm − transpiration_mm − soil_evap_mm − canopy_evap_mm`, clipped at 0 (ponded water, snow, litter and mulch; shown so that the balance closes) |
| `E_share`, `WP_ET` | `1 − transpiration_mm/ET_mm`; `yield × 1000 / (ET_mm × 10)` |
| `soil_lab`, `soil_i`, parsed factors (`dose_mm`, `dur_h`, `tc`, `till`, `method`, `intensity`, `window`, `case`) | labels, soil index and factor levels parsed from `treatment` |
| the columns of section 1.3 | carried from the original run table `summary_all.csv` |

### 1.5 What the raw data look like

Three rows of `Data/daisy_ensemble.csv.gz`, shown column by column exactly as stored: a rainfed baseline (E0), the irrigated run
used in the example above (E10) and one of the 149 solver failures (`valid = 0`, excluded from every table). Empty factor
cells mean that the experiment does not vary that factor.

| Column | E0 rainfed, coarse loam | E10 irrigated, coarse loam | E10 solver failure, coarse sand |
|:--|:--|:--|:--|
| `experiment` | E0_Baselines | E10_Amount_Timing_Soil | E10_Amount_Timing_Soil |
| `exp` | E0 | E10 | E10 |
| `run_id` | E0_S01_CoarseLoam_Rainfed | E10_S01_CoarseLoam_A10mm_T06_Apr1-Jun1 | E10_S02_CoarseSand_A10mm_T02_Apr15-Oct1 |
| `soil` | S01_CoarseLoam | S01_CoarseLoam | S02_CoarseSand |
| `treatment` | Rainfed | A10mm_T06_Apr1-Jun1 | A10mm_T02_Apr15-Oct1 |
| `valid` | 1 | 1 | 0 |
| `pareto` | 0 | 1 | 0 |
| `P` | (empty) | (empty) | (empty) |
| `dT` | (empty) | (empty) | (empty) |
| `Ep` | (empty) | (empty) | (empty) |
| `trig` | (empty) | (empty) | (empty) |
| `z` | (empty) | (empty) | (empty) |
| `amt_mm` | (empty) | 10 | 10 |
| `vff` | (empty) | (empty) | (empty) |
| `cap` | (empty) | (empty) | (empty) |
| `Nrate` | (empty) | (empty) | (empty) |
| `wstrat` | (empty) | (empty) | (empty) |
| `root` | (empty) | (empty) | (empty) |
| `yield_Mg_ha` | 2.597 | 5.918 | 3.309 |
| `irrigation_mm` | 0 | 112.495 | 265.989 |
| `rain_mm` | 464.384 | 464.384 | 464.384 |
| `drainage_1m_mm` | 6.1 | 7.785 | 88.703 |
| `ET_mm` | 466.806 | 575.513 | 627.142 |
| `transpiration_mm` | 147.615 | 226.072 | 120.984 |
| `soil_evap_mm` | 146.44 | 169.339 | 325.505 |
| `canopy_evap_mm` | 65.632 | 72.516 | 49.029 |
| `water_stress_d` | 31.013 | 5.88 | 31.166 |
| `N_fertiliser_kg_ha` | 229 | 229 | 229 |
| `N_leached_kg_ha` | 118.935 | 31.03 | 66.195 |
| `IE_kg_m3` | (empty) | 5.261 | 1.244 |
| `DPF` | 0.0131 | 0.0135 | 0.1214 |
| `NLF` | 0.5194 | 0.1355 | 0.2891 |

Runs per experiment in the raw table (all 17 experiments; every derived table uses the valid runs only):

| Experiment | Runs | Valid | Soils | Factor columns that vary |
|:--|--:|--:|--:|:--|
| `E0_Baselines` | 10 | 10 | 10 | set in `treatment` only |
| `E1_Doses` | 200 | 189 | 10 | set in `treatment` only |
| `E2_TriggerPressure` | 200 | 197 | 10 | `trig` |
| `E3_SensorDepth` | 200 | 200 | 10 | `z` |
| `E4_Methods` | 100 | 96 | 10 | set in `treatment` only |
| `E5_SHP_Dynamics` | 300 | 300 | 10 | set in `treatment` only |
| `E6_Mediterranean_Pollution` | 210 | 193 | 10 | `Nrate` |
| `E7_Mulching` | 200 | 200 | 10 | `vff`, `cap` |
| `E8_Rain_Intensity_Moisture` | 1000 | 1000 | 1 | `P`, `trig` |
| `E9_Soil_Moisture_Rain` | 1000 | 987 | 10 | `P`, `trig` |
| `E10_Amount_Timing_Soil` | 1000 | 954 | 10 | `amt_mm` |
| `E11_Temp_Evap_Rain` | 1000 | 1000 | 1 | `P`, `dT`, `Ep` |
| `E12_Sensor_Trigger_Rain` | 1000 | 1000 | 1 | `P`, `trig`, `z` |
| `E13_N_Water_Soil` | 1000 | 975 | 10 | `Nrate`, `wstrat` |
| `E14_Mulch_Rain` | 1000 | 1000 | 1 | `P`, `vff`, `cap` |
| `E15_Method_Depth_Amount` | 1000 | 1000 | 1 | `amt_mm`, `root` |
| `E16_Edge_Cases` | 770 | 740 | 10 | `P`, `Ep`, `trig`, `Nrate` |
| **Total** | **10190** | **10041** | 10 | |


---

## 2. The derived tables

### 2.1 `effect_sizes.csv`: ten one-line effect sizes

*Original:* `08_Scripts/charts_AB.py`, lines 9-27. *Used for:* the numbers on the causal-loop diagram (chart A).

Each value is the slope of an ordinary least-squares line through the valid runs of one experiment, after
fixing the other factors:

| Row | Runs selected | x (raw column) | y (raw column) | Value | Unit |
|:--|:--|:--|:--|--:|:--|
| `T_irr` | E11, `P = 1.0`, `Ep = 0.6` | `dT` | `irrigation_mm` | 45.51 | mm yr⁻¹ per °C |
| `T_ET` | same | `dT` | `ET_mm` | 56.65 | mm yr⁻¹ per °C |
| `P_irr` | E11, `dT = 0`, `Ep = 0.6` | `P × 100` | `irrigation_mm` | −3.02 | mm yr⁻¹ per 1 % rain |
| `Ep_Esoil` | E11, `dT = 0`, `P = 1` | `Ep` | `soil_evap_mm`, slope ÷ 10 | 4.98 | mm yr⁻¹ per 0.1 of the factor |
| `vff_Esoil` | E14, `P = 1` | `vff` | `soil_evap_mm`, slope ÷ 10 | 9.79 | mm yr⁻¹ per 0.1 of the factor |
| `Esoil_irr` | E14, `P = 1` | `soil_evap_mm` | `irrigation_mm` | 0.515 | mm per mm |
| `trig_irr` | E12, `z = 20`, `P = 1` | `trig / −100` | `irrigation_mm` | −8.55 | mm yr⁻¹ per 100 cm drier |
| `irr_D` | E1 + E10, coarse loam | `irrigation_mm` | `drainage_1m_mm` | 0.210 | mm per mm |
| `D_NL` | E13, `Nrate = 100` | `drainage_1m_mm` | `N_leached_kg_ha` | 1.060 | kg N ha⁻¹ per mm |
| `irr_Y` | E1, coarse loam | `irrigation_mm` | `yield_Mg_ha`, slope × 100 | 0.177 | Mg ha⁻¹ per 100 mm |

*Worked example (`T_irr`).* The ten E11 runs at `P = 1.0`, `Ep = 0.6` give irrigation 182.28, 202.20, 228.48, 256.20,
291.96, 327.00, 339.48, 350.52, 358.08 and 378.72 mm yr⁻¹ at `dT` = −1.0, −0.5, … , +3.5 °C; the least-squares slope
of these ten points is **45.51 mm yr⁻¹ per °C**.

### 2.2 `elasticities.csv`: log-log elasticities (10 drivers × 6 outputs)

*Original:* `08_Scripts/charts_EFGH.py`, lines 135-149. *Used for:* chart 41 (elasticity matrix).

1. Select the valid runs of the experiment named in the row (E13 only with `wstrat = W04_Surf300`).
2. Average the output column over all runs at each level of the driver (`groupby(driver).mean()`).
3. Keep levels with a positive mean; require at least three levels.
4. Elasticity = slope of `ln(mean output)` against `ln(|driver level|)`. For temperature the x axis is `dT` itself, so
   that row is a semi-elasticity (fractional change per °C).

Drivers (raw column): rain `P`, temperature `dT`, soil-evaporation factor `Ep` (E11); trigger `trig`, sensor depth `z`
(E12); vapour-flux factor `vff`, interception capacity `cap` (E14); amount per event `amt_mm` (E10); rooting depth `root`
(E15); N rate `Nrate` (E13). Outputs: `irrigation_mm`, `drainage_1m_mm`, `soil_evap_mm`, `transpiration_mm`,
`yield_Mg_ha`, `N_leached_kg_ha`.

*Reading:* "Rain (E11), Irrigation = −0.53" means that 1 % more rain lowers irrigation by about 0.53 %.

### 2.3 `pareto_runs.csv`: the 170 Pareto-optimal runs

*Original:* `08_Scripts/charts_EFGH.py`, lines 272-277. *Used for:* chart 50, the Excel sheet `Pareto`, interactive charts.

1. Valid runs with `irrigation_mm ≥ 20` and non-empty `IE_kg_m3`, `DPF`, `NLF`.
2. A run is **dominated** if another run has IE at least as high, DPF at least as low and NLF at least as low, and is
   strictly better in at least one of the three.
3. The 170 runs that are not dominated are written with all their columns (one row per run; the archived file also
   carries the passenger columns of section 1.4) and `pareto = True`. The same 170 runs carry `pareto = 1` in the raw table.

### 2.4 `production_function_fits.csv`: irrigation production functions per soil

*Original:* `08_Scripts/charts_CD.py`, lines 252-268. *Used for:* chart 30.

1. Valid irrigated runs (`irrigation_mm > 0`) of E1, E2, E3, E4 and E10, per soil.
2. `y0` = yield of the soil's rainfed baseline run in E0 (e.g. coarse loam 2.597 Mg ha⁻¹).
3. Non-linear least squares (`scipy.optimize.curve_fit`, start a = 4, b = 100) of
   **Y = y0 + a (1 − exp(−I/b))** with I = `irrigation_mm`, Y = `yield_Mg_ha`.
4. Columns: `y0` (Mg ha⁻¹), `a_gain` = the yield gain at full irrigation (Mg ha⁻¹), `b_mm` = the irrigation that gives
   63 % of that gain (mm yr⁻¹).

### 2.5 `controllability_by_soil_lever_outcome.csv`: what each management lever can move, per soil

*Original:* `08_Scripts/leverage_calc.py`. *Used for:* the key synthesis figure (panels a-d).

Seven levers, each one experiment: dose (E1), trigger (E2), sensor depth (E3), method (E4), soil structure
(E5, irrigated partners only), N/water pathway (E6, the strategies with a parsed `e6strat`), mulch (E7).
Four outcomes: `yield_Mg_ha`, `IE_kg_m3`, `DPF`, `NLF`.

For every lever × soil × outcome, with v the outcome values of that soil's valid runs in that experiment:

**`lev_pct` = 100 × (90th percentile of v − 10th percentile of v) / |median of v|**

left empty when fewer than four values exist or the median is 0; `n` = number of values used.

*Worked example.* Trigger lever (E2), coarse loam, drainage fraction: the 20 valid runs have DPF from 0.0104 to
0.0976. Their 10th percentile is 0.01069, their 90th percentile 0.06154 and their median 0.01675, so
`lev_pct` = 100 × (0.06154 − 0.01069)/0.01675 = **303.6** with n = 20, the row `Trigger,E2,S01_CoarseLoam,Drainage fraction`.

### 2.6 `controllability_rho_vs_TAW.csv`: does controllability rise with plant-available water?

*Original:* `08_Scripts/key_figure.py`, lines 53-82. *Used for:* key synthesis figure (panel e).

For each outcome (row) and lever (column): Spearman rank correlation, across the ten soils, between `lev_pct`
(table 2.5) and the soil's total available water to 1 m (TAW). TAW is θ(100 cm) − θ(15 849 cm) integrated over the
Daisy Ap (0-25 cm) and Bt (25-100 cm) horizons; only its rank order enters the correlation:
sand < loamy sand < sandy loam < sandy clay loam < coarse sand < loam < coarse loam < clay loam < silty clay loam < silt loam.
Soils with an empty `lev_pct` are omitted from that correlation.
This horizon-integrated order differs from the rounded TAW listed in Paper 1, Table 3 (which places coarse sand below
coarse loam); the archived table was computed with the horizon-integrated order, which `derive_tables.py` uses.

### 2.7 `N1_soil_specific_triggers.csv`: the suction trigger that reaches the same depletion in every soil

*Original:* `08_Scripts/novel.py`, lines 5-60. *Used for:* novel figure N1, panel d; Paper 3, Table 7; SWAFL Desktop layer N1.

1. Depletion of plant-available water at suction h (van Genuchten, field capacity 100 cm, wilting point 15 849 cm):
   f(h) = [Se(100) − Se(h)] / [Se(100) − Se(15 849)],  Se(h) = [1 + (α|h|)ⁿ]^−(1−1/n), with the soil's (α, n).
2. The critical depletion f* = 0.45 is the depletion beyond which the binned median of relative yield (E2, ten soils
   × 20 triggers, `yield_Mg_ha / max yield of the soil`) falls below 0.95.
3. `h_star` = the suction (negative, cm) at which f(h) = 0.45 (root found with Brent's method between 5 and 15 000 cm);
   `f_at_300` = f(300 cm), the depletion that the common −300 cm trigger reaches in that soil.

*Worked example (coarse loam, α = 0.0961 cm⁻¹, n = 1.353).* Se(100) = 0.4443, Se(15 849) = 0.0751, Se(300) = 0.3042,
so f(300) = (0.4443 − 0.3042)/(0.4443 − 0.0751) = **0.3795**, and f(h) = 0.45 at **h = −387 cm**.

---

## 3. Inputs that are not in the run table

| Input | Used by | Where it is given |
|:--|:--|:--|
| effective van Genuchten (α, n) of the ten soils | 2.7 | `derive_tables.py`; Paper 3, Table 7; Paper 1, Table 3 |
| rank order of TAW (Ap + Bt horizons) | 2.6 | `derive_tables.py`; section 2.6 above |
| f* = 0.45 | 2.7 | `08_Scripts/novel.py` (computed from E2), Paper 3 |

All other quantities come from the raw run table alone.
