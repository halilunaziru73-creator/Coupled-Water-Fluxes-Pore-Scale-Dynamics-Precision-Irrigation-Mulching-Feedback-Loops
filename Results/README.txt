RESULTS ANALYSIS
Coupled water fluxes and pore-scale dynamics under joint irrigation and evaporation (mulch) control:
mapping non-linear soil-atmosphere feedback loops with Daisy
=====================================================================================

WHAT IS IN THIS FOLDER
00_Key_Synthesis_Figure/  The single integrating figure (see KEY SYNTHESIS FIGURE below)
00_Novel_Contributions/   Three further synthesis figures N1-N3 (see below)
01_Charts_50/             The 50 planned charts in 8 themes (A-H), PNG 220 dpi
                          A System, forcing, baseline (1-5)      B Pore-scale proxies, structure (6-13)
                          C Coupled water fluxes (14-23)          D Irrigation control (24-31)
                          E Evaporation control, mulching (32-38) F Non-linear feedbacks (39-45)
                          G Nitrogen coupling (46-48)             H Synthesis (49-50)
02_Additional_Figures/    13 extra figures (X01-X13), incl. versions of your example charts:
                          texture triangle, pore domains, Ksat-type time series, seasonal envelopes,
                          evaporation decline after wetting, model structure with fluxes, root/LAI,
                          correlation matrix, random-forest drivers, validation, PCA, parallel
                          coordinates, variance decomposition
03_Excel_Analysis/        Results_Analysis.xlsx: all 10,190 runs + 8 analysis sheets with live
                          formulas (AVERAGEIFS, SUMIFS, COUNTIFS, SLOPE, LN) and native Excel charts
                          (1,512 formulas, 0 errors after recalculation)
04_Interactive_Charts/    8 interactive HTML pages (open index.html; offline, keep plotly.min.js)
05_Videos/                5 MP4 widget animations (sensor, profiles, tillage 20 yr, mulch, feedback)
06_3D_Project/            3D_Project_animation_1994.mp4 (moving 3D model of the whole project)
                          3D_Project_interactive.html (rotate / zoom / play)
07_Derived_Data_Tables/   effect sizes, elasticities, Pareto runs, production fits, controllability tables
08_Scripts/               Python that made every figure (reproducible)
Figure_Catalogue.csv      title, caption and data source of every figure

DATA AND RULES
* Source: your summary_all.csv (10,190 runs). 149 runs flagged SOLVER_FAILURE are excluded everywhere.
* IE and IWUE are shown only where irrigation >= 20 mm/yr (smaller amounts give meaningless ratios).
* Daily and per-year figures need daily output, which the batch run did not keep for E8-E16 and which
  was not in the results folder. 36 of the same setups were re-run (Daisy 7.1.14) to obtain it:
  E0 (10 soils), E2 coarse loam triggers + coarse sand -300 cm, E4 coarse loam (10 methods),
  E5 coarse loam (3 tillage), E7 coarse loam (2 mulch levels). They reproduce your 7.1.12 results
  within 2 % (median < 0.3 %), see X10.
* "Other evaporation" = Daisy actual ET - (transpiration + soil + canopy evaporation): evaporation of
  ponded water, snow and litter/mulch. Shown so the water balance closes.
* Daisy is 1-D and Darcy-scale: pore-scale dynamics are represented through proxies (pore-size
  distribution from n and alpha, K(Se), WEPP structural change). Present them as such.

KEY QUANTITATIVE RESULTS (coarse loam unless stated)
* +1 deg C  -> +46 mm irrigation/yr and +57 mm ET/yr (E11)
* +1 % rain -> -3.0 mm irrigation/yr (E11)
* mulch: +0.1 vapour flux factor -> +9.8 mm soil evaporation; each mm of evaporation
  saved saves about 0.6-0.9 mm of irrigation (E7/E14; chart 36, Excel Mulch_E14)
* irrigation -> drainage: 0.21 mm per mm irrigated; drainage -> N: 1.06 kg N per mm
* mulch savings are convex (accelerating) in mulch strength (chart 33)
* 170 Pareto-optimal runs (max IE, min drainage and N-leaching fractions), mostly E12, E10, E16

NEW SYNTHESIS FIGURES (00_Novel_Contributions)
N1  Soil-independent trigger law: expressed as root-zone depletion f (fraction of available water used),
    irrigation and yield from 9 irrigated soils x 20 triggers collapse onto single curves
    (R2 0.48 -> 0.75 for irrigation, 0.23 -> 0.70 for yield). Yield falls beyond f* ~ 0.45, consistent with
    the FAO-56 depletion concept; panel d gives the per-soil tensiometer setting (143-729 cm) that reaches f*.
N2  Fate of evaporation saved by mulch (water-balance accounting, residual <= 6 %): in dry conditions it
    becomes less irrigation and more transpiration; in wet conditions most of it (63 % at rain x1.4) drains
    below 1 m. N leaching still falls at every rain level, but the benefit shrinks to about -1 kg N/ha/yr.
N3  Regime map: where losses switch from evaporation- to drainage-dominated (climate vs mulch planes) and
    where drivers interact non-additively (up to 15 % of irrigation at the hot/cold-dry extremes).
These are new syntheses of this dataset. Check the literature before claiming absolute novelty: related
ideas exist (management allowed depletion, FAO-56; similar-media scaling; mulch water-balance studies).

KEY SYNTHESIS FIGURE (00_Key_Synthesis_Figure)
"Soil pore structure gates management controllability"
Question answered: across the seven experiments you set up (E1 dose, E2 trigger, E3 sensor depth, E4 method,
E5 soil-structure dynamics, E6 Mediterranean N/water pathways, E7 mulching), which management lever
actually moves which outcome, on which soil, and does that depend on the soil's pore structure?
* Controllability = 10th-90th percentile range of an outcome across a lever's settings, as % of its median,
  computed for every soil x lever x outcome (yield, IE, drainage fraction, N-leaching fraction).
* Panels a-d: controllability maps with the dominant lever per soil boxed. The trigger threshold is the
  dominant lever for drainage and N leaching on most soils.
* Panel e: the gating relation. Controllability of drainage by trigger, dose, method, N/water pathway
  and mulch rises with plant-available water (Spearman rho +0.79 to +0.95, 10 soils); soil structure is
  the only lever that works the other way (rho -0.58).
* Panel f: on coarse sands the irrigation levers barely move drainage at all; only structure and mulch act.
  In practical terms: tune irrigation scheduling on fine soils, manage structure and surface cover on
  coarse ones.
To our knowledge this soil x lever controllability map has not been published for Daisy in this form,
but it has not been checked against the full literature; related ideas exist (e.g. soil-dependent
irrigation scheduling, sensitivity analyses of crop models). Treat it as a new synthesis of this dataset.
