# Every control, value by value

All model inputs live in the **Properties** panel (far right). Each group can be collapsed; **+** and **−** in the panel header expand or collapse all. The sliders are *indices* into lists of discrete values, because every value in the lists corresponds to a set of simulations (Chapter 5). The number shown beside a slider is the value the index stands for. The inputs of the three irrigation designs are not in Properties: they are the value boxes inside each design layer (Chapters 11–13 and 18).

![The Properties panel, with every group open (the arrows point to the groups; Chapter 25).](images/atlas11/ui_u06_properties_page.jpg){width=45%}

## Scenario

| Control | Values | Default | What it does |
|:--|:--|:--|:--|
| **Ready-made case** | seven cases (Section 3.8) | — | Replaces many controls at once, as one undoable step. |
| **Year** | 1980 … 2100 | the current year | The calendar year of the working date. Years 1980–1999 use the recorded weather of that year; later years use the typical year of the record, or your own weather when it covers the year (Chapter 4 and Chapter 19). |
| **Date in the season** | any calendar date | today | The working date: the day drawn, the "On …" block of the dashboard and the first day of every irrigation schedule. |
| **Weather source** | Built-in weather record; Imported weather file; Online weather of a location | built-in | Which daily weather every layer uses. The second and third choices become active only after you have imported a file or fetched the weather of a place (Chapter 19). |
| **Import weather… / Online weather…** | buttons | | Open the two weather dialogs. |

## Soil and field

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Soil** | Sand, Loamy Sand, Sandy Loam, Coarse Sand, Coarse Loam, Loam, Silt Loam, Sandy Clay Loam, Clay Loam, Silty Clay Loam | Coarse Loam | Selects the soil's texture, its van Genuchten parameters $(\alpha, n)$ (Table 5.3), the baseline run, plant-available water per cm (`AWC`) and the trigger anchor. Re-computes every layer and cancels the last run of every design. |
| **Tillage** | Conventional / Reduced / No-till | Conventional | Sets the initial pore index $p_0$ (1.00, 0.72, 0.42) and therefore the starting structure of the topsoil (Section 8.1). |
| **Crop** | the simulated cereal/oilseed rotation and the 48 crops of the library, in the groups *Staple food crops* (9), *Cash and oil crops* (8), *Vegetables* (4) and *Trees, vines and palms* (27) | Cereal/Oilseed | Chooses the crop calendar, the crop coefficients, the root depth, the depletion fraction and the yield response (Chapter 21). The cereal rotation is the simulated crop; the library crops are transferred from it with their FAO-56 crop coefficients (Section 21.4). |
| **Structural consolidation rate** | 0.001, 0.0025, 0.005, 0.01, 0.02 d$^{-1}$ | 0.001 | The rate $\tau_c$ at which conventionally tilled pores close (Eq. 8.1). In the simulations it changes the results of the five finer soils (loam to silty clay loam, up to about 6 mm a year of drainage and 14 kg N/ha of leaching); in the five coarser soils every rate gives the same result. |

## Mulch

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Material** | Rice husk, Wheat straw, Wood chips, Sawdust, Grass clippings, Black plastic film | Wheat straw | Sets both sliders below to typical values for the material and the drawn layer thickness (Table 3.1). |
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

The material only *sets* the sliders. Moving a slider afterwards keeps the material for drawing but uses the slider value for the calculation. Any $\varphi \ge 0.95$ is treated as "no mulch" in the drawings.

## Weather and climate

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Rainfall scale** | $\times$0.5, 0.6, … 1.4 | $\times$1.0 | Multiplies the baseline annual rainfall and selects the matching runs. When weather is imported, it is set to the step nearest to the ratio of the imported to the recorded annual rain (Eq. 19.4). |
| **Temperature shift** | −1.0, −0.5, 0, +0.5, … +3.5 °C | 0 °C | Selects the warming runs and changes the evaporative demand (Eq. 5.26). When weather is imported, it is set to the step whose demand is nearest the imported reference evapotranspiration (Eq. 19.5). |

## Irrigation

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Method** | Surface; Overhead; Drip 10–20 cm; Drip 20–30 cm; Drip 40–50 cm; Drip 50–60 cm | Surface | Selects the irrigation run set and, in the day-by-day engine, where each dose is placed (Section 5.2). |
| **Trigger (sensor suction)** | −50, −75, −100, −150, −200, −250, **−300**, −350, −400, −500, −600, −700, −800, −1000, −1200, −1500, −2000, −3000, −5000, −10000 cm | −300 cm | Irrigation starts when the soil at the sensor depth is as dry as this suction. A *less negative* number means wetter, more frequent irrigation. |
| **Sensor depth** | 5, 10, 15, … 100 cm (20 values) | 20 cm | Depth of the simulated tensiometer that is compared with the trigger. |

**Sand and loamy sand.** In the simulations of these two soils the sensor-triggered runs at the reference trigger of −300 cm at 20 cm never irrigate, because the coarse soil drains past the sensor before it dries to that suction. A ratio to zero is undefined, so for these soils the irrigation of another trigger, sensor depth or method is added to the reference amount as the difference of the two simulated amounts (Eq. 5.12a). At −50 cm the sand then receives 400 mm a year instead of the reference 278 mm.

**Trigger mode (Trigger law layer).** The slider above applies one suction to every soil (*common* mode). The **Trigger law** layer offers an *own* mode, in which each soil gets the suction that corresponds to a soil-independent depletion fraction $f^\ast$ (default 0.45): see Chapter 6.

## Nutrients

| Control | Values | Default | Effect |
|:--|:--|:--|:--|
| **Nitrogen rate** | 10, 25, 40, 55, 70, 85, **100**, 115, 130, 150 % of the standard rate | 100 % | Selects the nitrogen runs; changes yield and nitrogen leaching and, slightly, the maximum rooting depth (Eq. 5.18). |

## Ready-made cases

| # | Case | Changes |
|:-:|:--|:--|
| 0 | Default: Coarse Loam, bare, normal climate | all defaults |
| 1 | Dry year on Sand, no mulch | Sand; rain $\times$0.6; +1 °C |
| 2 | Wheat straw mulch on Loam, drip 10 to 20 cm | Loam; straw; drip 10–20 |
| 3 | Wet year on Silty Clay Loam, no-till | Silty Clay Loam; no-till; rain $\times$1.3 |
| 4 | Hot year (+3 °C), tomato on Sandy Loam | Sandy Loam; tomato; +3 °C |
| 5 | Plastic film, deep drip 40 to 50 cm, Clay Loam | Clay Loam; plastic; drip 40–50 |
| 6 | Low nitrogen (40 %), cowpea on Silt Loam | Silt Loam; cowpea; N 40 % |

Every case first resets the controls to their defaults and then applies its changes, so cases never accumulate.

## Design shortcuts

The last group of Properties opens the three designs (*Surface design, Drip design, Sprinklers and pipes*) and runs **Optimise surface**, which searches the surface design for the inflow and cut-off with the highest application efficiency at the present field.

## Change-by-change: what each control moves

"Run set" means that the response is read from the simulations (Chapter 5); "engine" means that the day-by-day model of Section 5.3 responds as well.

| Control changed | Annual outputs (20-year means) | Day-by-day layers and schedules | Design layers |
|:--|:--|:--|:--|
| Soil | all (baseline run for that soil) | $\mathrm{AWC}$, $(\alpha,n)$, trigger anchor $\Rightarrow$ dates, depths | intake ($k$, $A$) via Saxton–Rawls and Green–Ampt; $Z_n$; the sprinkler maximum rate |
| Tillage, consolidation | drainage, evaporation, yield | pore index in the structure layers | surface storage $S_d$ of the sprinkler design |
| Crop | yield, transpiration, evaporation (Section 21.4) | crop calendar, $K_c$, $R_{\max}$, cover | peak $ET_c$, $Z_n$, row spacing |
| Mulch $\varphi$, capacity | evaporation, irrigation, drainage, yield | evaporation term | interception loss of the sprinklers |
| Rain scale | all | rain amount per event | — |
| Temperature | evaporation, transpiration, irrigation, yield | $E_0$ and seasonal weight | air temperature in the wind drift (Eq. 13.9) |
| Method | irrigation, drainage, yield | dose placement | the design that belongs to the method |
| Trigger | irrigation, yield, drainage | **dates of irrigation** | $Z_n$ (as $f_T\cdot \mathrm{AWC}\cdot R_{\max}$) |
| Sensor depth | irrigation, yield | **dates of irrigation** | — |
| Nitrogen | yield, N leaching | $R_{\max}$ | — |
| Weather source | through the nearest rain and temperature steps | **every daily value** | the crop water requirement and the schedules |
| Date and year | none | **which day is shown; first date in the schedule** | the schedule table |
