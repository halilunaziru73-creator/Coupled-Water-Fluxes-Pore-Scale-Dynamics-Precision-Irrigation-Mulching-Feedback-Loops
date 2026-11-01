# The factors and responses of the Experiments tab {#daisy-factors}

The Experiments tab offers 58 factors. Each has levels that are tried, a range that is accepted, and words that make the tab propose it when the question is typed in words. Fourteen responses are measured in every run.

## Responses

| Response | Unit | Better when |
|:--|:--|:--|
| Yield | Mg DM/ha | higher |
| Irrigation | mm/season | lower |
| Evapotranspiration | mm/season | not ranked |
| Percolation below 100 cm | mm/season | lower |
| Nitrate leached below 100 cm | kg N/ha/season | lower |
| Denitrification | kg N/ha/season | lower |
| Irrigation efficiency | kg grain per m3 | higher |
| Rain | mm/season | not ranked |
| Water-stress days at harvest | days | lower |
| Nitrogen-stress days at harvest | days | lower |
| Irrigation water-use efficiency (yield gain over the rainfed reference per mm) | kg DM per ha per mm | higher |
| Deep-percolation fraction of rain + irrigation | % | lower |
| Partial factor productivity of nitrogen | kg DM per kg N | higher |
| Nitrate leached as a share of N applied | % | lower |

## Factors

Each row of *What will be tested* is one factor: one thing that changes between the runs. The text under the row says what the factor is; *more* opens where Daisy reads it, the typical values, what to type and what changes in the results. This chapter gives the same for all 63 factors.

### How to fill in a row

A number factor has a box with its values, separated by commas, and a note after it: the unit and *allowed a to b*. Each value is one **level**: the runs combine the levels of every row. Three rows of the Experiments tab as an example:

| Row as it appears | What to type | What it means |
|:----------|:------------|:--------------------|
| OrganicMatter original: min AM N, g N/m2 · allowed 0 to 0.5 | 0.025, 0.05, 0.1 | The same limit for nitrogen: an added organic matter pool with less nitrogen than this is merged into the soil. Typical: 0.025 to 0.1 g N per m² (default 0.05 g N/m², that is 0.5 kg N/ha). The workbench allows 0 to 0.5. |
| Surface: DetentionCapacity, mm · allowed 0 to 50 | 2.5, 5, 10 | The water depth that can stand (pond) on the field before the excess runs off. Typical: 2 to 10 mm for an arable field (rough, ploughed land holds more); the workbench allows 0 to 50. |
| Surface: LocalDetentionCapacity, mm · allowed 0 to 100 | 5, 10, 20 | The water that can pond in one part (patch) of the field before the excess spreads to the rest of the field. Typical: 5 to 20 mm (default 10); the workbench allows 0 to 100. |

*Allowed* is what the box accepts: from 0 to ten times the value the farm uses (or the Daisy default when the farm sets none). It is a guard against typing errors, not a limit of Daisy, and the sensible values are much narrower: they are given as *Typical* for every factor below. A value outside the box range is moved to its nearest end.

A choice factor (a soil, a fertiliser, a tillage, a crop of the library) has a list with a search box: tick the choices to compare. Every ticked choice is one level.

### The number of runs

Under the rows: *How to combine* (every combination, one thing at a time, or the values in pairs), *number of runs*, *if there are more, choose*, *seed* and *rainfed references*. The number of runs is the number Daisy makes, the rainfed references included, and it is never exceeded:

1. The combinations are counted (for every combination: the product of the numbers of levels).
2. When they fit, every combination is run.
3. When there are more, as many as fit are chosen in the way set:
    - **balanced**: every value used about equally often.
    - **at random (with the seed)**.
    - **evenly spaced through the list of combinations**.
    - **the first ones in the list, in order**.
4. Irrigation factors need a rainfed reference for every soil and weather of the chosen runs, so the gain of irrigation is measured against the same soil and weather. They count as runs: with references the runs come in pairs, and an odd number gives one run fewer. Untick *rainfed references* to get exactly the number set.
5. The same plan and seed always give the same runs. *See the runs* lists them and counts how often each value is used.

The balanced choice is a Latin hypercube over the levels: each level of each factor is used in about the same number of runs, and the levels are mixed at random between the factors, so a small number of runs still covers every value. *My experiments* keeps the number, the way of choosing and the seed of every experiment, and shows how many runs each gives.

### All factors at a glance

| Group | Factor | Unit | Typical values |
|:------|:----------|:----|:--------------|
| Weather and climate | Rain, factor on the weather | n/a | 0.6 (very dry) to 1.4 (very wet); 1 is the weather as it is. |
| Weather and climate | Temperature shift | C | 0 (as it is) to +4 °C; negative values cool. |
| Weather and climate | Radiation, factor on the weather | n/a | 0.8 to 1.2. |
| Weather and climate | Seasonal rain pattern | n/a | The patterns offered. |
| Weather and climate | Weather station | n/a | Each station is a climate: Taastrup and Foulum (Denmark, humid), Bologna (Italy, dry summers). |
| Weather and climate | Evapotranspiration model | n/a | FAO-56 Penman-Monteith (daily) is the standard. |
| Nitrogen and tillage | Nitrogen fertiliser, factor on the rotation | n/a | 0 (no fertiliser) to 1.6. |
| Nitrogen and tillage | Type of mineral fertiliser | n/a | N25S (the farm), AmmoniumNitrate, Nitrate, Ammonia, CalciumNitrate; 72 slurries and manures. |
| Nitrogen and tillage | Fertiliser date, shift in days | days | -21 to +28 days. |
| Nitrogen and tillage | Tillage | n/a | plowing (the farm), rotavation, disk_harrowing, stubble_cultivation, none. |
| Nitrogen and tillage | Soil consolidation after tillage (time consolidation) | per day | 0.001 (slow) to 0.02 per day (fast). |
| Irrigation | Irrigation | n/a | rainfed, irrigated. |
| Irrigation | Water per irrigation | mm | 10 to 45 mm; light soils take small doses, heavy soils larger ones. |
| Irrigation | Duration of one irrigation | h | 1 to 24 h. |
| Irrigation | Irrigation intensity (constant flux) | mm/h | 0.05 to 2 mm/h. |
| Irrigation | Irrigation trigger (soil suction) | cm | -100 cm (very wet, pF 2) to -1000 cm (dry, pF 3); -300 cm is common. |
| Irrigation | Sensor depth | cm | 10 to 60 cm; inside the main root zone. |
| Irrigation | Irrigation method | n/a | overhead, surface, drip. |
| Irrigation | Drip depth | cm | 5-10, 10-20, 20-30 cm. |
| Irrigation | Water limit per crop season | mm | 60 to 240 mm (deficit irrigation); 0 for none. |
| Irrigation | Irrigation window | n/a | April to October in the north; shorter windows save water. |
| Soil and crop | Soil | n/a | The 12 USDA textures, the built-in loam and sand, and 63 horizons of the Daisy library. |
| Soil and crop | Maximum rooting depth | cm | 30 (shallow soil) to 150 cm. |
| Soil and crop | Crop of the Daisy library, grown every year | n/a | 84 crops of the library. |
| Soil and crop | Saturated hydraulic conductivity K_sat of every horizon (van Genuchten-Mualem), factor | times the soil value | 0.1 to 10 times; K_sat varies more than tenfold within one texture class. |
| Soil and crop | van Genuchten alpha (inverse air-entry pressure) of every horizon, factor | times the soil value | 0.5 to 2 times. |
| Soil and crop | van Genuchten n (pore-size distribution) of every horizon, factor on n - 1 | times the soil value | 0.7 to 1.3 times. |
| Soil and crop | Saturated water content Theta_sat (porosity) of every horizon, factor | times the soil value | 0.9 to 1.1 times. |
| Soil and crop | Mualem tortuosity l of every horizon, added | added to the soil value | -2 to +2 around the soil value (0.5 in Mualem 1976; fitted values are often negative). |
| Chemicals | Chemical of the Daisy library (pesticide, PFAS, tracer) | n/a | 35 chemicals of the library. |
| Chemicals | Sorption of the chemical, K_OC | L/kg | 0 (moves with water) to 1000 L/kg (strongly held). |
| Chemicals | Half-life of the chemical | days | 5 to 200 days. |
| The Daisy library | Management of the Daisy library (whole managements and single operations) | n/a | 82 actions of the library. |
| The Daisy library | Program of the Daisy library, run as it comes with Daisy | n/a | 55 programs. |
| Daisy reference, Bioclimate | NoOfIntervals | n/a | 10 to 60; 30 is the default. |
| Daisy reference, Bioclimate | max svat iterations | n/a | 50 to 200. |
| Daisy reference, Bioclimate | max svat absolute difference | mm/h | 0.005 to 0.02 mm/h. |
| Daisy reference, Bioclimate | maxTdiff | K | 0.01 to 0.05 K. |
| Daisy reference, Bioclimate | maxEdiff | Pa | 0.5 to 2 Pa. |
| Daisy reference, Bioclimate | min sun angle | rad | 0.03 to 0.13 rad (2 to 7 degrees). |
| Daisy reference, Chemistry original | max sink total | dimensionless | 0.25 to 1. |
| Daisy reference, Chemistry original | max sink solute | dimensionless | 0.5 to 1. |
| Daisy reference, Chemistry original | max sink secondary | dimensionless | 1 to 3. |
| Daisy reference, Chemistry original | min sink total | dimensionless | 0.005 to 0.02. |
| Daisy reference, Drain lateral | L | cm | 10 to 40 m (1000 to 4000 cm). |
| Daisy reference, Drain lateral | rad | cm | 2.5 to 7 cm. |
| Daisy reference, Groundwater aquitard | K aquitard | cm/h | 0.0001 (tight clay) to 0.01 cm/h. |
| Daisy reference, Groundwater aquitard | Z aquitard | cm | 50 to 500 cm. |
| Daisy reference, Groundwater static | table | cm | -100 to -300 cm for a real table; 1 for free drainage. |
| Daisy reference, OrganicMatter original | K NH4 | h-1 | 0.01 to 0.04 per hour (default 0.0208). |
| Daisy reference, OrganicMatter original | K NO3 | h-1 | 0.01 to 0.04 per hour (default 0.0208). |
| Daisy reference, OrganicMatter original | CO2 threshold | h-1 | 0.00005 to 0.0002 per hour. |
| Daisy reference, OrganicMatter original | min AM C | g C/m2 | 0.25 to 1 g C per m² (default 0.5). |
| Daisy reference, OrganicMatter original | min AM N | g N/m2 | 0.025 to 0.1 g N per m² (default 0.05 g N/m², that is 0.5 kg N/ha). The workbench allows 0 to 0.5. |
| Daisy reference, Surface | temperature change rate | h-1 | 0.25 to 1 per hour. |
| Daisy reference, Surface | EpFactor | dimensionless | 0.4 to 1 (default 0.6). |
| Daisy reference, Surface | albedo dry | dimensionless | 0.1 to 0.3 (light soils higher). |
| Daisy reference, Surface | albedo wet | dimensionless | 0.05 to 0.15. |
| Daisy reference, Surface | DetentionCapacity | mm | 2 to 10 mm for an arable field (rough, ploughed land holds more); the workbench allows 0 to 50. |
| Daisy reference, Surface | ReservoirConstant | h-1 | 1 (slow) to 60 per hour. |
| Daisy reference, Surface | LocalDetentionCapacity | mm | 5 to 20 mm (default 10); the workbench allows 0 to 100. |
| Daisy reference, Surface | z mixing | cm | 0.05 to 0.2 cm. |
| Daisy reference, Surface | R mixing | h/mm | Very large values (1e9 h/mm) mean almost no mixing. |

### Weather and climate

#### Rain, factor on the weather

A factor on every rain of the weather file: 0.8 is 20 % less rain, 1.2 is 20 % more. The days with rain stay the same; each amount is multiplied.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | PrecipCorrect in the (weather ...) of the run file. |
| Typical values | 0.6 (very dry) to 1.4 (very wet); 1 is the weather as it is. |
| Levels offered | 0.6, 0.8, 1, 1.2, 1.4 |
| Box accepts | 0.4 to 1.6 n/a |
| What to type | Several factors separated by commas, for example 0.7, 0.85, 1, 1.15. |
| What changes | Drainage and nitrate leaching follow rain most strongly; yield follows it on sandy soils without irrigation; irrigation need falls as rain rises. |
| Needs irrigation | no |
| Words that propose it | rain, rainfall, precipitation, wetter, drier, dry year, wet year, drought |

#### Temperature shift

Degrees added to every daily temperature of the weather file (a simple climate change).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | TempOffset in the (weather ...) of the run file. |
| Typical values | 0 (as it is) to +4 °C; negative values cool. |
| Levels offered | 0, 1, 2, 3 |
| Box accepts | -4 to 8 C |
| What to type | Degrees, for example 0, 1, 2, 3. |
| What changes | Faster crop development (earlier ripening, often lower yield of cereals), more evapotranspiration and faster turnover of organic matter (more mineral nitrogen). |
| Needs irrigation | no |
| Words that propose it | temperature, warming, warmer, hotter, cooler, climate change, heat |

#### Radiation, factor on the weather

A factor on the global radiation of the weather file.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | GlobRadScale in the (weather ...) of the run file. |
| Typical values | 0.8 to 1.2. |
| Levels offered | 0.9, 1, 1.1 |
| Box accepts | 0.5 to 1.5 n/a |
| What to type | Factors, for example 0.9, 1, 1.1. |
| What changes | Photosynthesis, potential evapotranspiration and the soil surface temperature. |
| Needs irrigation | no |
| Words that propose it | radiation, cloud, sunshine, solar |

#### Seasonal rain pattern

Changes the rain of chosen months only (for example a drier summer and a wetter winter).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The weather file is rewritten month by month before the run. |
| Typical values | The patterns offered. |
| Levels offered | dry summer (rain x0.7 Jun-Aug), dry spring (rain x0.7 Mar-May), wet winter (rain x1.3 Dec-Feb) |
| What to type | Tick the patterns. |
| What changes | Summer patterns change yield and irrigation; winter patterns change drainage and leaching. |
| Needs irrigation | no |
| Words that propose it | seasonal, dry summer, dry spring, wet winter, monthly rain, drought in summer |

#### Weather station

The weather file of the run: a built-in station, the weather of your SWAFL project or your own file.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The .dwf in Common/ read by (weather default ...). |
| Typical values | Each station is a climate: Taastrup and Foulum (Denmark, humid), Bologna (Italy, dry summers). |
| Levels offered | course, it-bologna, dk-foulum |
| What to type | Tick the stations to compare. |
| What changes | Everything: rain, temperature, radiation and their timing. |
| Needs irrigation | no |
| Words that propose it | station, site, location, climate of, bologna, foulum, jyndevad, valecov, jadwisin, bratislava |

#### Evapotranspiration model

The model of evapotranspiration Daisy uses (the bioclimate).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (Bioclimate ...) of the column. |
| Typical values | FAO-56 Penman-Monteith (daily) is the standard. |
| Levels offered | auto, default |
| What to type | Tick the models to compare. |
| What changes | Potential and actual evapotranspiration, hence soil water, irrigation need and drainage. |
| Needs irrigation | no |
| Words that propose it | evapotranspiration model, penman, fao56, bioclimate, energy balance |

### Nitrogen and tillage

#### Nitrogen fertiliser, factor on the rotation

A factor on every fertiliser dose of the rotation: 1 is the farm, 0.5 half the nitrogen, 1.3 thirty per cent more.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The (fertilize ... (weight N [kg N/ha])) actions in the rotation file of Common/. |
| Typical values | 0 (no fertiliser) to 1.6. |
| Levels offered | 0.4, 0.7, 1, 1.3 |
| Box accepts | 0 to 2 n/a |
| What to type | Factors, for example 0, 0.5, 1, 1.5. |
| What changes | Yield rises then levels off; nitrate leaching rises steeply above the economic optimum. |
| Needs irrigation | no |
| Words that propose it | nitrogen, fertiliser, fertilizer, n rate, n dose, leaching, nitrate, pollution |

#### Type of mineral fertiliser

The kind of mineral fertiliser (or slurry) given at every fertilisation of the rotation.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The first word of (fertilize (<type> ...)) in the rotation file; slurries come from dk-fertilizer.dai. |
| Typical values | N25S (the farm), AmmoniumNitrate, Nitrate, Ammonia, CalciumNitrate; 72 slurries and manures. |
| Levels offered | N25S, AmmoniumNitrate, Ammonia, Nitrate |
| What to type | Tick the types. A slurry is given with the same total nitrogen as the mineral fertiliser. |
| What changes | Ammonia volatilisation, nitrification and leaching; slurries also add organic carbon and nitrogen to the soil. |
| Needs irrigation | no |
| Words that propose it | fertiliser type, fertilizer type, ammonium nitrate, ammonia, urea, form of nitrogen |

#### Fertiliser date, shift in days

Moves every fertilisation of the rotation by this many days (negative: earlier).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The (wait_mm_dd ...) before each (fertilize ...) in the rotation file. |
| Typical values | -21 to +28 days. |
| Levels offered | -14, 0, 14, 28 |
| Box accepts | -60 to 60 days |
| What to type | Days, for example -14, 0, 14. |
| What changes | Early: more leaching before the crop takes it up. Late: nitrogen stress in spring. |
| Needs irrigation | no |
| Words that propose it | fertiliser timing, fertilizer timing, when to fertili, split application, delay the fertili |

#### Tillage

The tillage operation done before sowing.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The tillage action of the rotation (plowing, rotavation, disk_harrowing, stubble_cultivation) or none. |
| Typical values | plowing (the farm), rotavation, disk_harrowing, stubble_cultivation, none. |
| Levels offered | plowing, rotavation, none |
| What to type | Tick the operations. |
| What changes | Mixing of residues and organic matter, the loosening of the topsoil (with consolidation) and so infiltration and evaporation. |
| Needs irrigation | no |
| Words that propose it | tillage, plough, plow, plowing, ploughing, rotavat, no-till, no till, cultivation |

#### Soil consolidation after tillage (time consolidation)

How fast the topsoil loosened by tillage settles back (consolidation rate).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | time_consolidation in the tillage of the column (soil structure dynamics). |
| Typical values | 0.001 (slow) to 0.02 per day (fast). |
| Levels offered | 0.001, 0.01, 0.02 |
| Box accepts | 0.0005 to 0.05 per day |
| What to type | Rates, for example 0.001, 0.01, 0.02. |
| What changes | The water holding and conductivity of the tilled layer in the weeks after tillage. |
| Needs irrigation | no |
| Words that propose it | consolidation, time consolidation, soil structure, structure dynamics, wepp, shp, hydraulic properties in time, settling |

### Irrigation

#### Irrigation

Whether the crop is irrigated at all.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | An (irrigate ...) action in the management, or none. |
| Typical values | rainfed, irrigated. |
| Levels offered | 0, 1 |
| What to type | Tick one or both. |
| What changes | The difference between the two is the gain from irrigation. |
| Needs irrigation | no |
| Words that propose it | irrigation, irrigate, irrigated, rainfed |

#### Water per irrigation

The water given at each irrigation event.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Written as a rate times a duration in (irrigate_overhead/surface/subsoil <rate> [mm/h] (hours <h>)): 30 mm in 3 h is 10 mm/h. Above 20 mm/h the hours are lengthened, because Daisy solves the water flow better at moderate rates. |
| Typical values | 10 to 45 mm; light soils take small doses, heavy soils larger ones. |
| Levels offered | 10, 20, 30, 45 |
| Box accepts | 2 to 60 mm |
| What to type | Millimetres per event, for example 10, 20, 30. |
| What changes | Large doses on sand drain below the roots (deep percolation and leaching); small doses need more events. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | dose, amount, depth of water, mm per, water per irrigation |

#### Duration of one irrigation

How long one irrigation event lasts.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (hours <h>) of the irrigate action; the rate is the dose divided by the hours. |
| Typical values | 1 to 24 h. |
| Levels offered | 3, 6, 12, 24 |
| Box accepts | 1 to 48 h |
| What to type | Hours, for example 3, 6, 12. |
| What changes | Long, slow events infiltrate better and run off less. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | duration, hours, how long, slow, intensity |

#### Irrigation intensity (constant flux)

A constant irrigation intensity instead of events (mm per hour, continuously while irrigating).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The rate of the irrigate action. |
| Typical values | 0.05 to 2 mm/h. |
| Levels offered | 0.05, 0.1, 0.5, 2 |
| Box accepts | 0.01 to 20 mm/h |
| What to type | Rates, for example 0.1, 0.5, 1. |
| What changes | Low intensities imitate drip; high ones may pond. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | flux, intensity, mm per hour, mm/h, constant depth |

#### Irrigation trigger (soil suction)

The soil water suction at the sensor that starts an irrigation (more negative is drier soil).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The irrigation waits for (not (soil_water_pressure_above (height -<z> [cm]) (potential <trig> [cm]))) in the irrigation action of the rotation file. |
| Typical values | -100 cm (very wet, pF 2) to -1000 cm (dry, pF 3); -300 cm is common. |
| Levels offered | -100, -200, -300, -600, -1000 |
| Box accepts | -10000 to -50 cm |
| What to type | Negative centimetres of water, for example -150, -300, -600. |
| What changes | Wetter triggers give more irrigation and drainage and less water stress. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | trigger, threshold, suction, tensiometer, pressure, when to irrigate |

#### Sensor depth

The depth of the soil moisture sensor that triggers irrigation.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (height -<z> [cm]) of the soil_water_pressure_above condition. |
| Typical values | 10 to 60 cm; inside the main root zone. |
| Levels offered | 10, 20, 30, 50 |
| Box accepts | 5 to 100 cm |
| What to type | Depths in cm, for example 10, 20, 30. |
| What changes | Shallow sensors react fast and irrigate often; deep ones react late. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | sensor, sensor depth, probe, installation depth, where to put the sensor |

#### Irrigation method

How the water is applied.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | irrigate_overhead (on the canopy), irrigate_surface (on the soil) or irrigate_subsoil (drip, in a depth range). |
| Typical values | overhead, surface, drip. |
| Levels offered | overhead, surface, drip |
| What to type | Tick the methods. |
| What changes | Overhead water is partly intercepted and evaporated; drip avoids this and wets the root zone directly. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | method, sprinkler, overhead, drip, surface irrigation, furrow, flood |

#### Drip depth

The depth range where drip water is given.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (from -a [cm]) (to -b [cm]) of irrigate_subsoil. |
| Typical values | 5-10, 10-20, 20-30 cm. |
| Levels offered | drip 5-10 cm, drip 10-20 cm, drip 15-25 cm, drip 20-30 cm |
| What to type | Tick the ranges. |
| What changes | Deeper drip loses less to evaporation but may wet below young roots. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | drip depth, buried drip, subsurface drip |

#### Water limit per crop season

The most water that may be given in one crop season (0 is no limit).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The irrigation action is allowed limit / dose times per season (an (activity ...) of that many events instead of (repeat ...)). |
| Typical values | 60 to 240 mm (deficit irrigation); 0 for none. |
| Levels offered | 0, 60, 120, 240 |
| Box accepts | 0 to 1000 mm |
| What to type | Millimetres per season, for example 0, 60, 120. |
| What changes | Water saved against yield lost: the basis of deficit irrigation. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | limit, deficit, water limit, quota, restricted, scarce water, allowance |

#### Irrigation window

The dates between which irrigation is allowed.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (after_mm_dd ...) and (before_mm_dd ...) in the wait of the irrigation action. |
| Typical values | April to October in the north; shorter windows save water. |
| Levels offered | Apr 1 - Oct 1, May 1 - Oct 1, Jun 1 - Oct 1, Apr 1 - Jun 1 |
| What to type | Tick the windows. |
| What changes | Early or late water mostly drains; the window should cover flowering and grain filling. |
| Needs irrigation | yes: the runs are irrigated, with a rainfed reference |
| Words that propose it | timing, window, season of irrigation, when in the season, start date |

### Soil and crop

#### Soil

The soil profile of the column.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The horizons and the (defcolumn ...) written in Common/ (UserSoil.dai) or the built-in loam of the farm. |
| Typical values | The 12 USDA textures, the built-in loam and sand, and 63 horizons of the Daisy library. |
| Levels offered | usda:sand, usda:sandyloam, loam, usda:siltloam, usda:clayloam |
| What to type | Tick the soils to compare. |
| What changes | Water holding (yield without irrigation), drainage and leaching, the right irrigation dose. |
| Needs irrigation | no |
| Words that propose it | soil, soils, texture, sand, loam, clay, silt |

#### Maximum rooting depth

The deepest the roots may grow (0: the depth of the crop file).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (MaxRootingDepth <cm> [cm]) of the soil in ResFarm.dai: the soil limits how deep any crop roots. |
| Typical values | 30 (shallow soil) to 150 cm. |
| Levels offered | 30, 60, 90, 120, 150 |
| Box accepts | 20 to 200 cm |
| What to type | Centimetres, for example 60, 90, 120. |
| What changes | Deeper roots reach more water and nitrate: higher yield without irrigation, less leaching. |
| Needs irrigation | no |
| Words that propose it | root, rooting depth, roots |

#### Crop of the Daisy library, grown every year

One crop of the Daisy library grown every year instead of the rotation of the farm.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | A (defaction ... (sow "<crop>") ... (harvest ...)) written in the rotation file. |
| Typical values | 84 crops of the library. |
| Levels offered | n/a |
| What to type | Tick the crops. |
| What changes | Yield, water use and nitrogen uptake of each crop on the same soil and weather. |
| Needs irrigation | no |
| Words that propose it | crop of the library, any crop, grow every year, monoculture |

#### Saturated hydraulic conductivity K_sat of every horizon (van Genuchten-Mualem), factor

Multiplies the saturated hydraulic conductivity K_sat of every horizon of the built-in soil: how fast the saturated soil conducts water.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (hydraulic M_vG ... (K_sat <cm/h>)) of every horizon in ResFarm.dai (built-in loam and sand; own soils use HYPRES). |
| Typical values | 0.1 to 10 times; K_sat varies more than tenfold within one texture class. |
| Levels offered | 0.25, 1, 4 |
| Box accepts | 0.01 to 100 times the soil value |
| What to type | Factors, for example 0.25, 1, 4. |
| What changes | Higher K_sat: faster infiltration, less runoff and ponding, more and earlier drainage and leaching; lower: wetter topsoil, more runoff and denitrification. |
| Needs irrigation | no |
| Words that propose it | ksat, k_sat, saturated conductivity, hydraulic conductivity, permeability, sensitivity |

#### van Genuchten alpha (inverse air-entry pressure) of every horizon, factor

Multiplies alpha of the van Genuchten retention curve of every horizon (1/alpha is roughly the air-entry pressure).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (hydraulic M_vG ... (alpha <cm^-1>)) of every horizon in ResFarm.dai. |
| Typical values | 0.5 to 2 times. |
| Levels offered | 0.5, 1, 2 |
| Box accepts | 0.1 to 10 times the soil value |
| What to type | Factors, for example 0.5, 1, 2. |
| What changes | Larger alpha: the soil drains at smaller suctions, holds less water at field capacity, less plant-available water and more drainage. |
| Needs irrigation | no |
| Words that propose it | alpha, van genuchten, air entry, retention curve, sensitivity |

#### van Genuchten n (pore-size distribution) of every horizon, factor on n - 1

Scales n - 1 of the van Genuchten curve of every horizon (n stays above 1): the spread of pore sizes.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (hydraulic M_vG ... (n <>)) of every horizon in ResFarm.dai; n becomes 1 + (n - 1) x factor. |
| Typical values | 0.7 to 1.3 times. |
| Levels offered | 0.7, 1, 1.3 |
| Box accepts | 0.3 to 2 times the soil value |
| What to type | Factors, for example 0.7, 1, 1.3. |
| What changes | Larger n: a steeper retention curve (sand-like), less water held at high suction, conductivity falling fast as the soil dries. |
| Needs irrigation | no |
| Words that propose it | van genuchten n, pore size distribution, retention curve, shape parameter, sensitivity |

#### Saturated water content Theta_sat (porosity) of every horizon, factor

Multiplies the saturated water content Theta_sat (about the porosity) of every horizon.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (hydraulic M_vG ... (Theta_sat <>)) of every horizon in ResFarm.dai; kept below 0.7. |
| Typical values | 0.9 to 1.1 times. |
| Levels offered | 0.9, 1, 1.1 |
| Box accepts | 0.6 to 1.5 times the soil value |
| What to type | Factors, for example 0.9, 1, 1.1. |
| What changes | More pore space stores more water: more water for the crop and slower drainage. |
| Needs irrigation | no |
| Words that propose it | theta_sat, porosity, saturated water content, sensitivity |

#### Mualem tortuosity l of every horizon, added

Adds to the Mualem tortuosity-connectivity parameter l of every horizon.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (hydraulic M_vG ... (l <>)) of every horizon in ResFarm.dai. |
| Typical values | -2 to +2 around the soil value (0.5 in Mualem 1976; fitted values are often negative). |
| Levels offered | -1, 0, 1 |
| Box accepts | -4 to 4 added to the soil value |
| What to type | Values added, for example -1, 0, 1. |
| What changes | Higher l: the unsaturated conductivity falls faster as the soil dries, less capillary rise and slower redistribution. |
| Needs irrigation | no |
| Words that propose it | tortuosity, mualem l, connectivity, sensitivity |

### Chemicals

#### Chemical of the Daisy library (pesticide, PFAS, tracer)

A chemical of the Daisy library sprayed with every fertilisation (pesticides, PFAS, tracers).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (defchemical ...) and (spray "<chemical>" ...) in the rotation file. |
| Typical values | 35 chemicals of the library. |
| Levels offered | n/a |
| What to type | Tick the chemicals. |
| What changes | How much is leached, degraded and left in the soil. |
| Needs irrigation | no |
| Words that propose it | pesticide, pfas, atrazine, bentazon, which chemical, herbicide |

#### Sorption of the chemical, K_OC

The sorption of the tracer chemical to organic carbon (K_OC). Higher values hold the chemical in the topsoil.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | (adsorption linear (K_OC <v> [L/kg])) of the chemical. |
| Typical values | 0 (moves with water) to 1000 L/kg (strongly held). |
| Levels offered | 0, 50, 100, 500 |
| Box accepts | 0 to 5000 L/kg |
| What to type | L/kg, for example 0, 50, 500. |
| What changes | Leaching falls steeply as K_OC rises. |
| Needs irrigation | no |
| Words that propose it | sorption, koc, pesticide, chemical, tracer, herbicide |

#### Half-life of the chemical

The half-life of the tracer chemical in the soil (0: it does not decay).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | decompose_rate of the chemical, as ln 2 / half-life. |
| Typical values | 5 to 200 days. |
| Levels offered | 0, 15, 30, 90 |
| Box accepts | 0 to 2000 days |
| What to type | Days, for example 10, 50, 150. |
| What changes | Short half-lives leave little to leach. |
| Needs irrigation | no |
| Words that propose it | half-life, half life, degradation, decay, persistence |

### The Daisy library

#### Management of the Daisy library (whole managements and single operations)

A whole management or a single operation of the Daisy library.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The (defaction ...) of the library read by the run. |
| Typical values | 82 actions of the library. |
| Levels offered | n/a |
| What to type | Tick the managements. |
| What changes | Depends on the management. |
| Needs irrigation | no |
| Words that propose it | management, managements, farm management, action |

#### Program of the Daisy library, run as it comes with Daisy

A program of the Daisy library, run as it comes with Daisy.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | The (defprogram ...) of the library; the run file only calls it. |
| Typical values | 55 programs. |
| Levels offered | n/a |
| What to type | Tick the programs. |
| What changes | Each program is its own simulation. |
| Needs irrigation | no |
| Words that propose it | program, sample program, example run |

### Parameters of the Daisy reference

These 29 parameters were each written into a run and accepted by Daisy 7.1.14 at the default and at half and double that value. Their levels are fractions of the value the farm uses: 0.5, 0.75, 1, 1.5 and 2 times.

#### Bioclimate

##### NoOfIntervals (n/a)

How many layers the canopy is split into for light and energy.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Bioclimate (chapter 19). |
| Daisy default; the farm | 30; not set (the default is used) |
| Typical values | 10 to 60; 30 is the default. |
| Levels offered | 15, 23, 30, 45, 60 |
| Box accepts | 0 to 300 n/a |
| What to type | Whole numbers, for example 15, 30, 60. |
| What changes | A numerical setting: small changes in transpiration; more layers run slower. |
| Needs irrigation | no |
| Daisy reference | chapter 19: Number of vertical intervals in which we partition the canopy. |
| Words that propose it | bioclimate noofintervals, noofintervals of bioclimate, noofintervals |

##### max svat iterations (n/a)

How many times the canopy energy balance (SVAT) may be repeated in a time step before Daisy accepts the result.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Bioclimate (chapter 19). |
| Daisy default; the farm | 100; not set (the default is used) |
| Typical values | 50 to 200. |
| Levels offered | 50, 75, 100, 150, 200 |
| Box accepts | 0 to 1000 n/a |
| What to type | Whole numbers. |
| What changes | A numerical setting: no change to yield, water or nitrogen in the test. |
| Needs irrigation | no |
| Daisy reference | chapter 19: Max number of svat iterations before giving up on convergence. |
| Words that propose it | bioclimate max svat iterations, max_svat_iterations of bioclimate, max svat iterations, max_svat_iterations |

##### max svat absolute difference (mm/h)

The accuracy at which the SVAT evaporation is accepted.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Bioclimate (chapter 19). |
| Daisy default; the farm | 0.01; not set (the default is used) |
| Typical values | 0.005 to 0.02 mm/h. |
| Levels offered | 0.005, 0.0075, 0.01, 0.015, 0.02 |
| Box accepts | 0 to 0.1 mm/h |
| What to type | mm/h. |
| What changes | A numerical setting. |
| Needs irrigation | no |
| Daisy reference | chapter 19: Maximum absolute difference in svat ea values for convergence. |
| Words that propose it | bioclimate max svat absolute difference, max_svat_absolute_difference of bioclimate, max svat absolute difference, max_svat_absolute_difference |

##### maxTdiff (K)

The accuracy of the canopy temperature in the SVAT solution.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Bioclimate (chapter 19). |
| Daisy default; the farm | 0.02; not set (the default is used) |
| Typical values | 0.01 to 0.05 K. |
| Levels offered | 0.01, 0.015, 0.02, 0.03, 0.04 |
| Box accepts | 0 to 0.2 K |
| What to type | Kelvin. |
| What changes | A numerical setting. |
| Needs irrigation | no |
| Daisy reference | chapter 19: Largest temperature difference for convergence. |
| Words that propose it | bioclimate maxtdiff, maxtdiff of bioclimate, maxtdiff |

##### maxEdiff (Pa)

The accuracy of the canopy vapour pressure in the SVAT solution.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Bioclimate (chapter 19). |
| Daisy default; the farm | 1; not set (the default is used) |
| Typical values | 0.5 to 2 Pa. |
| Levels offered | 0.5, 0.75, 1, 1.5, 2 |
| Box accepts | 0 to 10 Pa |
| What to type | Pascal. |
| What changes | A numerical setting. |
| Needs irrigation | no |
| Daisy reference | chapter 19: Largest humidity difference for convergence. |
| Words that propose it | bioclimate maxediff, maxediff of bioclimate, maxediff |

##### min sun angle (rad)

Below this sun angle the radiation models treat the sun as set.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Bioclimate (chapter 19). |
| Daisy default; the farm | 0.0628319; not set (the default is used) |
| Typical values | 0.03 to 0.13 rad (2 to 7 degrees). |
| Levels offered | 0.03142, 0.04712, 0.06283, 0.09425, 0.1257 |
| Box accepts | 0 to 0.6283 rad |
| What to type | Radians. |
| What changes | Only early morning and late evening radiation. |
| Needs irrigation | no |
| Daisy reference | chapter 19: Minimum sun angle above ground for some 'raddist' and 'svat' models. The 'DPF' raddist model will zero radiation if the angle is below this, and the |
| Words that propose it | bioclimate min sun angle, min_sun_angle of bioclimate, min sun angle, min_sun_angle |

#### Chemistry original

##### max sink total (dimensionless)

The largest share of a chemical that one time step may remove (reactions, uptake); above it Daisy shortens the step.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Chemistry original (chapter 24). |
| Daisy default; the farm | 0.5; not set (the default is used) |
| Typical values | 0.25 to 1. |
| Levels offered | 0.25, 0.375, 0.5, 0.75, 1 |
| Box accepts | 0 to 5 dimensionless |
| What to type | Fractions. |
| What changes | A numerical setting for chemicals. |
| Needs irrigation | no |
| Daisy reference | chapter 24: Maximum allowed sink term as a fraction of total content. If variable timesteps are enabled, Daisy will try to scale down the timestep in |
| Words that propose it | chemistry max sink total, max_sink_total of chemistry, max sink total, max_sink_total |

##### max sink solute (dimensionless)

The same for the dissolved part of a chemical.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Chemistry original (chapter 24). |
| Daisy default; the farm | 0.9; not set (the default is used) |
| Typical values | 0.5 to 1. |
| Levels offered | 0.45, 0.675, 0.9, 1.35, 1.8 |
| Box accepts | 0 to 9 dimensionless |
| What to type | Fractions. |
| What changes | A numerical setting. |
| Needs irrigation | no |
| Daisy reference | chapter 24: Maximum allowed sink term as a fraction of solute content. If variable timesteps are enabled, Daisy will try to scale down the timestep |
| Words that propose it | chemistry max sink solute, max_sink_solute of chemistry, max sink solute, max_sink_solute |

##### max sink secondary (dimensionless)

The same for the part in the secondary (slow) domain.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Chemistry original (chapter 24). |
| Daisy default; the farm | 1.5; not set (the default is used) |
| Typical values | 1 to 3. |
| Levels offered | 0.75, 1.125, 1.5, 2.25, 3 |
| Box accepts | 0 to 15 dimensionless |
| What to type | Fractions. |
| What changes | A numerical setting. |
| Needs irrigation | no |
| Daisy reference | chapter 24: Maximum allowed sink term as a fraction of secondary domain content. If variable timesteps are enabled, Daisy will try to scale down the timestep |
| Words that propose it | chemistry max sink secondary, max_sink_secondary of chemistry, max sink secondary, max_sink_secondary |

##### min sink total (dimensionless)

A share that may always be removed, however small the time step.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Chemistry original (chapter 24). |
| Daisy default; the farm | 0.01; not set (the default is used) |
| Typical values | 0.005 to 0.02. |
| Levels offered | 0.005, 0.0075, 0.01, 0.015, 0.02 |
| Box accepts | 0 to 0.1 dimensionless |
| What to type | Fractions. |
| What changes | A numerical setting. |
| Needs irrigation | no |
| Daisy reference | chapter 24: 24.9. NONE 147 Always allow this fraction of total content to be removed by sink term. |
| Words that propose it | chemistry min sink total, min_sink_total of chemistry, min sink total, min_sink_total |

#### Drain lateral

##### L (cm)

The distance between drain pipes.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Drain lateral (chapter 37), used when the column has drains. |
| Daisy default; the farm | 1800; not set (the default is used) |
| Typical values | 10 to 40 m (1000 to 4000 cm). |
| Levels offered | 900, 1350, 1800, 2700, 3600 |
| Box accepts | 0 to 18000 cm |
| What to type | Centimetres, for example 1200, 1800, 2400. |
| What changes | Closer drains lower the water table faster (only with drains in the column). |
| Needs irrigation | no |
| Daisy reference | chapter 37: Distance between pipes. |
| Words that propose it | drain l, l of drain |

##### rad (cm)

The inner radius of the drain pipes.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Drain lateral (chapter 37). |
| Daisy default; the farm | 3.5; not set (the default is used) |
| Typical values | 2.5 to 7 cm. |
| Levels offered | 1.75, 2.625, 3.5, 5.25, 7 |
| Box accepts | 0 to 35 cm |
| What to type | Centimetres. |
| What changes | Only with drains in the column. |
| Needs irrigation | no |
| Daisy reference | chapter 37: Inner radius of drain pipes. |
| Words that propose it | drain rad, rad of drain |

#### Groundwater aquitard

##### K aquitard (cm/h)

The hydraulic conductivity of the low-permeability layer (aquitard) below the soil profile.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Groundwater aquitard (chapter 45); the farm uses 0.001 cm/h. |
| Daisy default; the farm | 0.001; 0.001 |
| Typical values | 0.0001 (tight clay) to 0.01 cm/h. |
| Levels offered | 0.0005, 0.00075, 0.001, 0.0015, 0.002 |
| Box accepts | 0 to 0.01 cm/h |
| What to type | cm/h, for example 0.0005, 0.001, 0.002. |
| What changes | Lower values hold water above the aquitard: wetter subsoil, less drainage, more denitrification. |
| Needs irrigation | no |
| Daisy reference | chapter 45: Conductivity of the aquitard. |
| Words that propose it | groundwater k aquitard, k_aquitard of groundwater, k aquitard, k_aquitard |

##### Z aquitard (cm)

The thickness of the aquitard below the deepest horizon.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Groundwater aquitard (chapter 45); the farm uses 200 cm. |
| Daisy default; the farm | 200; 200 |
| Typical values | 50 to 500 cm. |
| Levels offered | 100, 150, 200, 300, 400 |
| Box accepts | 0 to 2000 cm |
| What to type | Centimetres, for example 100, 200, 400. |
| What changes | A thicker aquitard slows drainage like a lower conductivity. |
| Needs irrigation | no |
| Daisy reference | chapter 45: Thickness of the aquitard. The aquitard begins below the bottommost soil horizon. |
| Words that propose it | groundwater z aquitard, z_aquitard of groundwater, z aquitard, z_aquitard |

#### Groundwater static

##### table (cm)

The depth of a fixed groundwater table (positive numbers mean free drainage).

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Groundwater static (chapter 45). |
| Daisy default; the farm | 1; not set (the default is used) |
| Typical values | -100 to -300 cm for a real table; 1 for free drainage. |
| Levels offered | 0.5, 0.75, 1, 1.5, 2 |
| Box accepts | 0 to 10 cm |
| What to type | Centimetres (negative below the surface). |
| What changes | A shallow table feeds the roots by capillary rise and stops drainage. |
| Needs irrigation | no |
| Daisy reference | chapter 45: Groundwater level. Positive numbers indicate free drainage. |
| Words that propose it | groundwater table, table of groundwater, table |

#### OrganicMatter original

##### K NH4 (h-1)

The highest rate at which microbes take up (immobilise) ammonium from the soil.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | OrganicMatter original (chapter 60). |
| Daisy default; the farm | 0.020833; not set (the default is used) |
| Typical values | 0.01 to 0.04 per hour (default 0.0208). |
| Levels offered | 0.01042, 0.01562, 0.02083, 0.03125, 0.04167 |
| Box accepts | 0 to 0.2083 h-1 |
| What to type | Rates per hour. |
| What changes | More immobilisation: less mineral nitrogen for the crop and for leaching in the short term. |
| Needs irrigation | no |
| Daisy reference | chapter 60: Maximal immobilization rate for ammonium. |
| Words that propose it | organicmatter k nh4, k_nh4 of organicmatter, k nh4, k_nh4 |

##### K NO3 (h-1)

The highest rate at which microbes take up (immobilise) nitrate.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | OrganicMatter original (chapter 60). |
| Daisy default; the farm | 0.020833; not set (the default is used) |
| Typical values | 0.01 to 0.04 per hour (default 0.0208). |
| Levels offered | 0.01042, 0.01562, 0.02083, 0.03125, 0.04167 |
| Box accepts | 0 to 0.2083 h-1 |
| What to type | Rates per hour. |
| What changes | As for ammonium, for nitrate. |
| Needs irrigation | no |
| Daisy reference | chapter 60: Maximal immobilization rate for nitrate. |
| Words that propose it | organicmatter k no3, k_no3 of organicmatter, k no3, k_no3 |

##### CO2 threshold (h-1)

Pools of organic matter that turn over faster than this count as "fast" CO2.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | OrganicMatter original (chapter 60). |
| Daisy default; the farm | 0.0001; not set (the default is used) |
| Typical values | 0.00005 to 0.0002 per hour. |
| Levels offered | 0.00005, 0.000075, 0.0001, 0.00015, 0.0002 |
| Box accepts | 0 to 0.001 h-1 |
| What to type | Rates per hour. |
| What changes | How CO2 is reported (fast and slow), not the total. |
| Needs irrigation | no |
| Daisy reference | chapter 60: Turnover rate above which pools will contribute to 'CO2 fast'. |
| Words that propose it | organicmatter co2 threshold, co2_threshold of organicmatter, co2 threshold, co2_threshold |

##### min AM C (g C/m2)

Added organic matter (AOM: residues, manure) with less carbon than this is merged into the soil organic matter instead of being followed as its own pool.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | OrganicMatter original (chapter 60). |
| Daisy default; the farm | 0.5; not set (the default is used) |
| Typical values | 0.25 to 1 g C per m² (default 0.5). |
| Levels offered | 0.25, 0.375, 0.5, 0.75, 1 |
| Box accepts | 0 to 5 g C/m2 |
| What to type | g C/m² (1 g/m² = 10 kg/ha), for example 0.25, 0.5, 1. |
| What changes | A housekeeping limit of the model: small changes in mineralisation. |
| Needs irrigation | no |
| Daisy reference | chapter 60: Minimal amount of carbon in AOM ensuring it is not removed. |
| Words that propose it | organicmatter min am c, min_am_c of organicmatter, min am c, min_am_c |

##### min AM N (g N/m2)

The same limit for nitrogen: an added organic matter pool with less nitrogen than this is merged into the soil.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | OrganicMatter original (chapter 60). |
| Daisy default; the farm | 0.05; not set (the default is used) |
| Typical values | 0.025 to 0.1 g N per m² (default 0.05 g N/m², that is 0.5 kg N/ha). The workbench allows 0 to 0.5. |
| Levels offered | 0.025, 0.0375, 0.05, 0.075, 0.1 |
| Box accepts | 0 to 0.5 g N/m2 |
| What to type | g N/m², for example 0.025, 0.05, 0.1. |
| What changes | A housekeeping limit: no change in yield, water or nitrogen in the test. |
| Needs irrigation | no |
| Daisy reference | chapter 60: Minimal amount of nitrogen in AOM ensuring it is not removed. |
| Words that propose it | organicmatter min am n, min_am_n of organicmatter, min am n, min_am_n |

#### Surface

##### temperature change rate (h-1)

How fast the soil surface temperature follows the air temperature.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). |
| Daisy default; the farm | 0.5; not set (the default is used) |
| Typical values | 0.25 to 1 per hour. |
| Levels offered | 0.25, 0.375, 0.5, 0.75, 1 |
| Box accepts | 0 to 5 h-1 |
| What to type | Rates per hour. |
| What changes | Soil temperature near the surface, hence early growth and turnover. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Relative change of surface temperature. If you set this to a negative value, surface temperature will reflect temperature of incoming water or ponded |
| Words that propose it | surface temperature change rate, temperature_change_rate of surface, temperature change rate, temperature_change_rate |

##### EpFactor (dimensionless)

The factor that turns potential evapotranspiration into potential evaporation from bare soil.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). |
| Daisy default; the farm | 0.6; not set (the default is used) |
| Typical values | 0.4 to 1 (default 0.6). |
| Levels offered | 0.3, 0.45, 0.6, 0.9, 1.2 |
| Box accepts | 0 to 6 dimensionless |
| What to type | Factors, for example 0.4, 0.6, 0.8. |
| What changes | Higher values dry the topsoil faster between crops and before canopy closure. |
| Needs irrigation | no |
| Daisy reference | chapter 87: The autumn value can be lower, due to muching. With a crop factor of 1.2 a combined Kc of 1.15 is reached at LAI=5. See also [Kjaersgaard et al., 2008] |
| Words that propose it | surface epfactor, epfactor of surface, epfactor |

##### albedo dry (dimensionless)

The share of sunlight reflected by dry soil.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). |
| Daisy default; the farm | 0.15; not set (the default is used) |
| Typical values | 0.1 to 0.3 (light soils higher). |
| Levels offered | 0.075, 0.1125, 0.15, 0.225, 0.3 |
| Box accepts | 0 to 1.5 dimensionless |
| What to type | Fractions. |
| What changes | Energy at the soil surface: small effect on evaporation. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Albedo of dry soil (pF >= 3) |
| Words that propose it | surface albedo dry, albedo_dry of surface, albedo dry, albedo_dry |

##### albedo wet (dimensionless)

The share of sunlight reflected by wet soil.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). |
| Daisy default; the farm | 0.08; not set (the default is used) |
| Typical values | 0.05 to 0.15. |
| Levels offered | 0.04, 0.06, 0.08, 0.12, 0.16 |
| Box accepts | 0 to 0.8 dimensionless |
| What to type | Fractions. |
| What changes | As for dry soil. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Albedo of wet soil (pf <= 1.7) |
| Words that propose it | surface albedo wet, albedo_wet of surface, albedo wet, albedo_wet |

##### DetentionCapacity (mm)

The water depth that can stand (pond) on the field before the excess runs off.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). The Daisy default of 1000 mm means no runoff at all; the farm uses 5 mm. |
| Daisy default; the farm | 1000; 5 |
| Typical values | 2 to 10 mm for an arable field (rough, ploughed land holds more); the workbench allows 0 to 50. |
| Levels offered | 2.5, 3.75, 5, 7.5, 10 |
| Box accepts | 0 to 50 mm |
| What to type | Millimetres, for example 2.5, 5, 10. |
| What changes | Smaller values give more surface runoff during heavy rain and less infiltration. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Amount of ponding the surface can retain. If ponding in any part of the surface is above this, exceed will runoff. |
| Words that propose it | surface detentioncapacity, detentioncapacity of surface, detentioncapacity |

##### ReservoirConstant (h-1)

The share of the ponded water above the detention capacity that runs off each hour.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87); the farm uses 60 per hour (all of it at once). |
| Daisy default; the farm | 1; 60 |
| Typical values | 1 (slow) to 60 per hour. |
| Levels offered | 30, 45, 60, 90, 120 |
| Box accepts | 0 to 600 h-1 |
| What to type | Per hour. |
| What changes | Higher values remove ponded water faster. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Fraction of ponding above DetentionCapacity that runoffs each hour. |
| Words that propose it | surface reservoirconstant, reservoirconstant of surface, reservoirconstant |

##### LocalDetentionCapacity (mm)

The water that can pond in one part (patch) of the field before the excess spreads to the rest of the field.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87), for fields split into patches. |
| Daisy default; the farm | 10; not set (the default is used) |
| Typical values | 5 to 20 mm (default 10); the workbench allows 0 to 100. |
| Levels offered | 5, 7.5, 10, 15, 20 |
| Box accepts | 0 to 100 mm |
| What to type | Millimetres, for example 5, 10, 20. |
| What changes | Only with several patches: how water moves between them. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Amount of ponding the surface can retain locally. If ponding in any part of the surface is above this, exceed will be distributed to the rest of the surface. |
| Words that propose it | surface localdetentioncapacity, localdetentioncapacity of surface, localdetentioncapacity |

##### z mixing (cm)

The depth of the thin top layer where soil, soil water and ponded water mix.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). |
| Daisy default; the farm | 0.1; not set (the default is used) |
| Typical values | 0.05 to 0.2 cm. |
| Levels offered | 0.05, 0.075, 0.1, 0.15, 0.2 |
| Box accepts | 0 to 1 cm |
| What to type | Centimetres. |
| What changes | Loss of fertiliser and chemicals to runoff. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Depth of mixing layer in the top of the soil. The mixing layer affect exchange between soil colloids, soil water and the surface, especially in connection with |
| Words that propose it | surface z mixing, z_mixing of surface, z mixing, z_mixing |

##### R mixing (h/mm)

The resistance to the mixing of dissolved compounds between soil and ponded water.

| Item | Value |
|:--------|:--------------------|
| Where Daisy reads it | Surface (chapter 87). |
| Daisy default; the farm | 1000000000; not set (the default is used) |
| Typical values | Very large values (1e9 h/mm) mean almost no mixing. |
| Levels offered | 500000000, 750000000, 1000000000, 1500000000, 2000000000 |
| Box accepts | 0 to 10000000000 h/mm |
| What to type | h/mm. |
| What changes | As for z mixing. |
| Needs irrigation | no |
| Daisy reference | chapter 87: Resistance to mixing inorganic compounds between soil and ponding. |
| Words that propose it | surface r mixing, r_mixing of surface, r mixing, r_mixing |

## The Daisy library, all of it, in the experiments

Everything of the Daisy library can be tested in an experiment. In *Add something to change*, the group **The Daisy library (all of it)** lists, with their numbers:

| What changes | Choices | What a run does with it |
|:--|--:|:--|
| Soil | 63 soil horizons (and the USDA classes) | the texture and humus of the horizon down the profile with HYPRES, or the Daisy horizon itself when its file gives no texture |
| Crop of the Daisy library, grown every year | 84 crops | the crop grown every year with the dates of its template |
| Type of fertiliser | 79 fertilisers | mineral: in place of N25S; organic (slurry, manure): the same nitrogen, as fresh weight from its dry matter and nitrogen |
| Chemical of the Daisy library | 35 chemicals | the chemical followed under the name Tracer, with all its own properties (sorption, decay, uptake) |
| Management of the Daisy library | 82 actions | a whole management replaces the farm rotation; a single operation (harrowing, rolling, ridging...) is done each year in place of the ploughing |
| Program of the Daisy library | 55 programs | the program run as it comes with Daisy, with its own files and weather; the settings of SWAFL do not apply |
| Tillage | the tillage operations | in place of the ploughing |

The long lists have a search box. **Logs of the Daisy library added to every run** (176 logs, with a search box) adds any log of the library to the output of every run. The files of the Daisy samples that a choice needs (and the files they read in turn) are copied into the Common folder of the experiment and read through the path of the run; the files of the Daisy library itself are read from Daisy. In the tab **Parameter library**, every item has the button **Test it in an experiment** (for a log: **Write this log in every run of my experiment**), which puts it in the experiment.

![Experiments: a chemical of the Daisy library as the thing that changes, and a log of the library added to every run.](images/daisy11/dz_exp_library.jpg){width=100%}
