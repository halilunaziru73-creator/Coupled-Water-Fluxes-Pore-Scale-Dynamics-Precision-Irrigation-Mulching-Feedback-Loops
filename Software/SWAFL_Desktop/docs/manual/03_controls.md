# Every control, value by value

All model inputs live in the **Properties** panel (far right). Each group can be collapsed; **+** and **−** in the panel header expand or collapse all. Every slider is an *index* into a list of discrete values, because every value in the lists corresponds to a set of Daisy simulations (Chapter 5). The number shown beside the slider is the value the index stands for.

## Scenario

| Control | Values | Default | What it does |
|:--|:--|:--|:--|
| **Ready-made case** | seven cases (Section 3.8) | — | Replaces many controls at once, as one undoable step. |
| **Weather year** | *typical year*, *dry year*, *wet year*, 1980 … 1999 | typical | Chooses which of the twenty recorded growing seasons the *detail* layers (V1, V2 "1994 detail", Field balance year animation) draw. The 20-year totals do not change. |
| **Date in the season** | any calendar date | today | The working date. Sets the day displayed in the drawings, the Dashboard "On …" tile, and the first day of the irrigation schedule (Chapter 4). |

## Soil and field

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Soil** | Sand, Loamy Sand, Sandy Loam, Coarse Sand, Coarse Loam, Loam, Silt Loam, Sandy Clay Loam, Clay Loam, Silty Clay Loam (S01–S10) | Coarse Loam | Selects the soil's measured texture, its van Genuchten parameters $(\alpha, n)$ (Table 5.3), the baseline Daisy run, plant-available water per cm (`AWC`), and the trigger anchor. Re-computes every layer. |
| **Tillage** | Conventional / Reduced / No-till | Conventional | Sets the initial pore index $p_0$ (1.00, 0.72, 0.42) and therefore the starting structure of the topsoil (Section 8.1). |
| **Crop** | Cereal/Oilseed, Legume, Vegetable | Cereal/Oilseed | Chooses the crop calendar, the root depth limit and the yield scaling factor (1.0, 0.55, 2.3). Only the cereal rotation is a simulated crop; the other two are *illustrative scalings* and are labelled so (Section 5.1). |
| **Structural consolidation rate** | 0.001, 0.0025, 0.005, 0.01, 0.02 d$^{-1}$ | 0.001 | The rate $\tau_c$ at which conventionally tilled pores close (Eq. 8.1). Does not affect no-till. |

## Mulch

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Material** | Rice husk, Wheat straw, Wood chips, Sawdust, Grass clippings, Black plastic film | Wheat straw | Sets *both* sliders below to typical values for the material and the drawn layer thickness (Table 3.1). |
| **Strength (vapour-flux factor)** $\varphi$ | 0.1, 0.2, … 1.0 | **1.0 (no mulch)** | The fraction of the bare-soil vapour flux that passes the mulch. 1.0 means bare; 0.1 means the flux is cut by 90 %. |
| **Interception capacity** | 0.5, 1, 2, 4 mm | 1 mm | Water the mulch can hold and lose before it reaches the soil. |

Table 3.1. Mulch materials as defined in the engine.

| Material | $\varphi$ | capacity (mm) | drawn thickness (relative) |
|:--|:--:|:--:|:--:|
| Rice husk | 0.5 | 2 | 1.0 |
| Wheat straw | 0.4 | 4 | 1.35 |
| Wood chips | 0.3 | 2 | 1.7 |
| Sawdust | 0.6 | 1 | 0.9 |
| Grass clippings | 0.7 | 4 | 1.2 |
| Black plastic film | 0.1 | 0.5 | 0.25 |

The material buttons only *set* the sliders. Moving a slider afterwards keeps the material for drawing but uses the slider value for the calculation. Any $\varphi \ge 0.95$ is treated as "no mulch" in the drawings.

## Weather and climate

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Rainfall scale** | $\times$0.5, 0.6, … 1.4 | $\times$1.0 | Multiplies the baseline annual rainfall (`rain_base`) and selects the matching Daisy runs. |
| **Temperature shift** | −1.0, −0.5, 0, +0.5, … +3.5 °C | 0 °C | Selects the warming runs (E11) and changes the evaporative demand in the engine (Eq. 5.26). |

## Irrigation

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Method** | Surface; Overhead; Drip 10–20 cm; Drip 20–30 cm; Drip 40–50 cm; Drip 50–60 cm | Surface | Selects the irrigation run set (E4) and, in the day-by-day engine, where each dose is placed (Section 5.2). |
| **Trigger (sensor suction)** | −50, −75, −100, −150, −200, −250, **−300**, −350, −400, −500, −600, −700, −800, −1000, −1200, −1500, −2000, −3000, −5000, −10000 cm | −300 cm | Irrigation starts when the soil at the sensor depth is as dry as this suction. A *less negative* number means wetter, more frequent irrigation. |
| **Sensor depth** | 5, 10, 15, … 100 cm (20 values) | 20 cm | Depth of the simulated tensiometer that is compared with the trigger. |

**Trigger mode (Trigger law layer).** The slider above applies one suction to every soil (*common* mode). The **Trigger law** layer offers an *own* mode, in which each soil gets the suction that corresponds to a soil-independent depletion fraction $f^\ast$ (default 0.45): see Chapter 6.

## Nutrients

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Nitrogen rate** | 10, 25, 40, 55, 70, 85, **100**, 115, 130, 150 % of the standard rate | 100 % | Selects the E13 runs; changes yield and nitrogen leaching and, slightly, the maximum rooting depth (Eq. 5.18). |

## Ready-made cases

| # | Case | Changes |
|:-:|:--|:--|
| 0 | Default: Coarse Loam, bare, normal climate | all defaults |
| 1 | Dry year on Sand, no mulch | Sand; rain $\times$0.6; +1 °C |
| 2 | Wheat straw mulch on Loam, drip 10 to 20 cm | Loam; straw; drip 10–20 |
| 3 | Wet year on Silty Clay Loam, no-till | Silty Clay Loam; no-till; rain $\times$1.3 |
| 4 | Hot year (+3 °C), vegetables on Sandy Loam | Sandy Loam; vegetable; +3 °C |
| 5 | Plastic film, deep drip 40 to 50 cm, Clay Loam | Clay Loam; plastic; drip 40–50 |
| 6 | Low nitrogen (40 %), legume on Silt Loam | Silt Loam; legume; N 40 % |

Every case first resets the controls to their defaults and then applies its changes, so cases never accumulate.

## Design controls (inside the three design layers)

The surface, drip and sprinkler layers each carry their own sliders and chips (field length, slope, inflow, emitter spacing, nozzle size, pipe lengths, and so on). They belong to those layers and are documented in Chapters 11–13 with ranges and defaults. They are connected to the Properties controls above only through the *soil*, the *crop*, the *trigger*, the *sensor depth* and the *date*; changing any of those re-designs the layout automatically.

## Change-by-change: what each control moves

The table lists, for each control, which outputs respond. "Run set" means that the response is read from the Daisy simulations (Chapter 5); "engine" means that the day-by-day bucket model of Section 5.3 responds as well.

| Control changed | Annual outputs (Dashboard, 20-year means) | Day-by-day layers and schedules | Design layers |
|:--|:--|:--|:--|
| Soil | all (baseline run for that soil) | $\mathrm{AWC}$, $(\alpha,n)$, trigger anchor $\Rightarrow$ dates, depths | Intake ($k$, $A$) via Saxton–Rawls and Green–Ampt; $Z_n$; sprinkler maximum rate row |
| Tillage, consolidation | drainage, evaporation, yield (E5 run set) | pore index in V3/E1/R1 | $S_d$ (surface storage) for sprinklers |
| Crop | yield $\times$ factor | crop calendar, $R_{\max}$, cover | peak $ET_c$, $Z_n$ |
| Mulch $\varphi$, capacity | evaporation, irrigation, drainage, yield | evaporation term, depth of the wet-front | interception loss for sprinklers |
| Rain scale | all | rain amount per event, canopy catch $I_c$ | — |
| Temperature | evaporation, transpiration, irrigation, yield | $E_0$ and seasonal weight | $T_{\mathrm{air}}$ in wind drift (Eq. 13.9) |
| Method | irrigation, drainage, yield (E4 run set) | dose placement; drip raises root density near the emitter | — |
| Trigger | irrigation, yield, drainage (E2 run set) | **dates of irrigation** | $Z_n$ (as $f_T\cdot \mathrm{AWC}\cdot R_{\max}$) |
| Sensor depth | irrigation, yield (E3 run set) | **dates of irrigation** | — |
| Nitrogen | yield, N leaching (E13 run set) | $R_{\max}$ | — |
| Date | none | **which day is shown; first date in the schedule** | the schedule table |
