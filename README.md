# Coupled Water Fluxes and Pore-Scale Dynamics under Joint Precision Irrigation and Evaporation-Control Mulching: Mapping Non-Linear Soil–Atmosphere Feedback Loops

Results of 10,190 Daisy soil–plant–atmosphere simulations (10 soils, 17 experiments, 1980–2000 Taastrup and 1994–2005 Bologna weather) analysing how precision irrigation (trigger, sensor depth, dose, method) and evaporation control (mulch) jointly shape soil water fluxes, pore-structure-mediated dynamics, yield and nitrate leaching.

![Soil pore structure gates management controllability](Results/00_Key_Synthesis_Figure/Soil_pore_structure_gates_management_controllability.png)

**Key synthesis.** How strongly management can steer drainage depends on soil pore structure. Controllability of drainage by the irrigation trigger, dose, method, N/water pathway and mulch rises with plant-available water (Spearman ρ +0.79 to +0.95 across 10 soils); soil structure is the only lever that works the other way (ρ −0.58). On coarse sands the irrigation levers barely move drainage at all.

## Repository structure

| Folder | Contents |
|---|---|
| `Results/00_Key_Synthesis_Figure` | The integrating figure above |
| `Results/00_Novel_Contributions` | Three further synthesis figures (N1 trigger law, N2 fate of saved evaporation, N3 feedback regime map) |
| `Results/01_Charts_50` | 50 charts in 8 themes: system & forcing, pore-scale proxies, coupled fluxes, irrigation control, mulching, non-linear feedbacks, nitrogen, synthesis |
| `Results/02_Additional_Figures` | 13 figures: texture triangle, pore domains, seasonal envelopes, evaporation decline, model structure, PCA, random forest, validation, … |
| `Results/03_Excel_Analysis` | `Results_Analysis.xlsx`: all runs + 8 analysis sheets with live formulas and native charts |
| `Results/04_Interactive_Charts` | 8 interactive HTML pages (start with `index.html`) |
| `Results/05_Videos` | 5 MP4 animations (sensor, profiles, tillage, mulch, feedback trajectories) |
| `Results/06_3D_Project` | Moving 3D model of the system (MP4) and an interactive 3D version |
| `Results/07_Derived_Data_Tables` | Effect sizes, elasticities, Pareto-optimal runs, controllability tables |
| `Results/08_Scripts` | Python code that produced every figure |
| `Results/Figure_Catalogue.csv` | Title, caption and data source of every figure |

## Key quantitative results (coarse loam unless stated)

- +1 °C → +46 mm irrigation/yr and +57 mm ET/yr
- +1 % rain → −3.0 mm irrigation/yr
- Mulch savings are convex in mulch strength; each mm of evaporation saved saves ≈ 0.6–0.9 mm of irrigation
- Irrigation → drainage 0.21 mm/mm; drainage → nitrate leaching 1.06 kg N/mm
- 170 Pareto-optimal runs (maximum irrigation efficiency, minimum drainage and N-leaching fractions)

## Methods notes

- Model: Daisy 7.1 (University of Copenhagen), 1-D, Richards equation, van Genuchten–Mualem hydraulics; WEPP dynamic structure model for tillage/consolidation effects.
- 149 runs flagged as solver failures are excluded from all analyses. IE and IWUE are reported only where irrigation ≥ 20 mm/yr.
- Daisy is Darcy-scale: "pore-scale dynamics" are represented through proxies (pore-size distribution from n and α, K(Se), dynamic bulk density).
- Daily and per-year figures use 36 re-simulated setups; they reproduce the batch results within 2 % (median < 0.3 %).

## Viewing

Figures are PNG (220 dpi). Interactive pages work offline; keep `plotly.min.js` in the same folder. With GitHub Pages enabled on this repository, the interactive charts can also be opened online.
