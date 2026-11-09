# `\texorpdfstring{\chapicon{partgreen}{☷}}{}`{=latex}Reference of every layer: controls, properties and data sources

This chapter gathers, for each layer of the *Layers* panel, three things in the same order: the **controls** on the layer itself, the **Properties** that move it, and the **data sources** behind its numbers. Whatever you set in Properties reaches every layer, the dashboard, the report and the irrigation designs, because they all read the same set of inputs. Press **Run simulation** in the bar under the picture to compute a layer after a change.

## The Properties that every layer shares

| Group of Properties | What you set | Layers it moves |
|---|---|---|
| Scenario | Ready made case, year, date in the season, weather source (built in record, imported file, online weather of a place) | all |
| Soil and field | Soil (nine classes), tillage (conventional, reduced, no till), structural consolidation rate | soil, mulch, control, seasonal, crop, designs |
| Crop | One list of 48 crops: field crops, vegetables, trees, vines and palms | field, seasonal, crop, designs |
| Mulch | Material, strength (vapour flux factor), interception capacity | mulch, loops, field, seasonal |
| Weather and climate | Rainfall scale, temperature shift | all that use the weather |
| Projection | Seasons projected after the last simulated one (none, 10 or 20 years), warming per decade, rainfall change per decade | the seasonal layers, the dashboard charts of the seasons, the yearly figure of the Charts tab |
| Irrigation | Method, decision horizon, crop in the decision, soil water on the date, field area, accumulated salt, salinity of the water, critical depletion, trigger and sensor depth | control, designs, field, seasonal |
| Nutrients | Nitrogen rate as a percentage of the standard | seasonal (nitrogen budget), feedback loops |
| Design shortcuts | Opens the design of the chosen method, the field sketch with its pipes, and the three designs | designs |

The toolbar **Date** is the key date: the working year, the red bar of every year chart, the season shown and the irrigation advice all follow it.

## Irrigation design: surface, drip and sprinkler with pipes

**Controls.** Every number of the drawing is a value box: click it to open a picker with the exact value, its unit (metres or kilometres, litres per second or cubic metres per hour, hectares or square metres) and a list of values across the allowed range. **Run simulation** computes the design; **Find the most efficient inputs** searches the inputs for the highest application efficiency; *Optimise surface* applies the best surface design; the tabs **Results, Design, Charts, Figure, Messages** show the numbers, the inputs, the hydrograph and depth charts, the picture and the log. The sprinkler layer draws the pipe network (source, pump, filter, fertigation, valve, mainline, submain, laterals) with the diameter, length, flow, speed and head loss of each pipe.


**How it is generated.** Surface: the intake of your soil is built from its texture (Saxton and Rawls to Green and Ampt to Kostiakov), the inflow is turned into a flow depth by Manning, the advance by a volume balance, and the cut off time, depths, efficiencies and uniformity follow from the advance and the intake (Chapter 11). Drip: the emitter flow along the lateral comes from the head loss of the lateral (Hazen and Williams, Keller and Karmeli); the water of one emitter fills a wetted bulb whose volume is the water divided by the water the soil can still store, and whose shape depends on the soil (narrow and deep in sand, wide and shallow in clay loam, Eq. 12.11); the part of the bulb below the roots, the evaporation from its wet surface and the water stored in the root zone give the efficiencies (Chapter 12). Sprinkler: the application rate and the overlap of the heads, the wind and evaporation losses, and the pipe sizes from the flow and the allowed speed (Chapter 13). In all three the crop water need comes from the crop library and the weather.

**Properties.** Soil, crop, method (which decides the design layer), field area (the same area in the three designs), salt, trigger and weather. The drip depth of the method sets the depth of the laterals. The mainline length, the mainline and submain diameters and the lateral diameter can come from the field sketch (see below).

**Data sources.** Intake from the soil: Saxton and Rawls pedotransfer functions to Green and Ampt to Kostiakov. Flow in the inlet: Manning. Advance and recession: volume balance (Walker and Skogerboe). Pipe friction: Hazen and Williams, with C = 140 for the main and submain and 150 for the laterals. Standard pipe diameters from 32 to 315 mm. Crop water: FAO paper 56 (Allen and others, 1998). Weather: the weather in use.

### Designing the pipes in the field sketch

The field sketch (**Tools, Field sketch to design**) has pipe tools beside the tools for greenhouses, beds, irrigated areas and plants. Choose **Mainline pipe**, **Submain pipe** or **Lateral pipe**, click the points of the route and double click (or press Enter) to finish; a list of diameters (in mm) appears while a pipe tool is chosen and changes every pipe of that kind. Place a **Valve**, **Pump**, **Filter** or **Tank** with one click. Every pipe shows its diameter and length on the drawing.

The Summary step lists the pipe network: for each pipe the diameter, length, flow, speed and friction loss (Hazen and Williams), whether the speed is good (too fast above 1.5 m/s in the main and submain and 2 m/s in a lateral, very slow below 0.3 m/s), and the pump head the network asks for (lift, friction, and the working head and fittings) with the power at 65 % efficiency. **Turn the sketch into the design** hands the drawn mainline length, the mainline and submain diameters and, for drip, the lateral diameter to the design, which then uses them in place of its own sizing; its layout then says "sketch" beside the mainline.

## Irrigation control: sensor and trigger, trigger law

**Controls.** The sensor and the trigger are sliders in Properties (trigger suction and sensor depth); the layer plays the season by itself and **Play** and **Stop** control it. The soil row and the shaded band mark the soil only, not the chart beside it.


**How it is generated.** The soil column is the daily soil water model of the program; the sensor reads the suction of the layer at its depth from the retention curve of the soil; the trigger is a suction (or a depletion fraction of the available water, with the critical depletion f of the crop), and an irrigation is called on the day the sensor passes it. The yield, irrigation and drainage of each soil at each trigger are the results of the Daisy experiments, read by the model (Chapter 6).

**Properties.** Soil, trigger, sensor depth, critical depletion, crop, mulch, weather.

**Data sources.** The Daisy experiments on the trigger (E2) and on the sensor depth (E3) for the nine soils; the retention curve of each soil (Saxton and Rawls); the weather in use.

## Mulch and evaporation: mulch against bare soil, mulch control, evaporation, fate of saved water, regime map

**Controls.** The mulch sliders (strength, capacity) and the material list in Properties; the sliders of the layer for the physics of evaporation; Play, Stop and the year clicks.


**How it is generated.** The mulch lowers the vapour flux from the soil by the strength you set and holds a depth of rain (the capacity) that evaporates from the mulch. The effect on evaporation, drainage, irrigation and yield is the ratio of the Daisy runs with and without the mulch, taken from the grid of mulch strength, rain and capacity, and moved by the temperature grid (Chapter 9).

**Properties.** Mulch group, soil, tillage, rainfall scale, temperature shift.

**Data sources.** The Daisy experiments on the mulch (E14 and E7) over strength, rainfall and capacity; the temperature and rainfall grid (E11); the equations of vapour diffusion and surface resistance given in the chapter of the layer.

## Soil structure and tillage: tillage and structure, soil hydraulic drivers, root structure

**Controls.** The tillage buttons and the consolidation slider in Properties; click a soil row of the table to select it (the highlight covers the soil table only); Play and Stop for the consolidation in time.


**How it is generated.** Tillage sets the pore index of the topsoil and the consolidation rate says how fast it re settles; the drainage, evaporation and yield of each tillage and rate are the Daisy results for the nine soils, and the soil table ranks the soils by the effect of each driver (Chapter 8).

**Properties.** Soil, tillage, structural consolidation rate, crop.

**Data sources.** The Daisy experiment on tillage and consolidation (E5); the hydraulic parameters of the nine soils (Saxton and Rawls, with the Daisy parameters of the soil classes); root distribution of the crop kind of the library.

## Deterministic phenotyping

**Controls.** The sowing mode, species, genotype and climate lists of the layer, its sliders and its Run button.


**How it is generated.** Each genotype is a set of traits; the crop model grows canopy, roots and yield day by day on the weather and the soil water, and the table reports the traits that result. The same inputs always give the same output (Chapter 8b).

**Properties.** Soil, tillage, rainfall, temperature and the weather in use.

**Data sources.** The phenotyping models of the program (crop growth, canopy, roots and traits) driven by the weather in use; the traits typed into the layer.

## Field water balance: field balance, soil plant and air, profile evolution

**Controls.** The control bar under the drawing (play, stop, speed, the year and the day), the click on a year bar to move the clock, and the decision panel of Properties (horizon, crop in the decision, soil water on the date, field area).


**How it is generated.** Rain and irrigation enter, the crop and the soil evaporate and transpire, the rest drains or runs off; the soil water is stepped one day at a time, the crop follows the crop library, and the picture is drawn from the day on the clock (Chapter 7).

**Properties.** Every group of Properties.

**Data sources.** The daily simulation of the program (soil water, crop, mulch and irrigation) on the weather in use; the soil and crop libraries; the irrigation advice uses the area to give volumes.

## Seasonal data: reliability over the seasons, full water balance, nitrogen budget

**Controls.** Click a bar to move the clock to that year; the red bar is the year on the clock. Hover a bar for its value. Dashed lines are the rainfed runs. **Seasons projected** in Properties (none, 10 or 20) adds seasons after the last simulated one.

**Projection.** Seasons after the twenty simulated ones are drawn lighter, right of a dashed line marked *projection*, on the calendar that follows the working date. Each projected season is one of the twenty simulated seasons, taken in a fixed random order, and moved by the climate trend of Properties: the warming per decade (default +0.3 °C) raises the reference evapotranspiration by 3.5 % per degree, which raises irrigation and crop water use and lowers yield by 2 % per degree; the rainfall change per decade (default 0 %) scales the rain and, through it, the drainage, the nitrate leached and the irrigation. The means, the 10 to 90 % range and the reliability figures always use the twenty simulated seasons only. A projection shows where the setting is heading; it is not a weather forecast.


**How it is generated.** For each soil the Daisy runs hold twenty years of rain, irrigation, evaporation, transpiration, drainage, yield and nitrogen. Your settings move these years by the ratio of the annual model at your settings against its reference; for a library crop the daily FAO balance of that crop replaces them season by season (Chapter 22).

**Properties.** Every group; crop and weather move the seasons most.

**Data sources.** The yearly values of the Daisy reference runs (irrigated and rainfed) for each soil, held in the program for the twenty seasons; the ratios of the annual model between your settings and the reference; the crop library for a library crop (daily FAO paper 56 balance, season by season).

## Crops: crop water requirement

**Controls.** The crop list, the year and the dates; the crop curve and the daily balance of the season in the picture.


**How it is generated.** The crop coefficient curve of the crop (initial, mid and end values over four growth stages) multiplies the reference evapotranspiration of each day; rain, soil storage and the depletion fraction give the irrigation need and the stress (Chapter 21).

**Properties.** Crop, soil, trigger, weather, salt, method.

**Data sources.** The crop library of 48 crops: crop coefficients, stage lengths, height, rooting depth, depletion fraction and yield response factor (FAO papers 56 and 33, and a field study of daily crop water requirement with the FAO Penman and Monteith evapotranspiration); the weather in use. Crops not tabulated take the default of their group and say so.

## Feedback loops

**Controls.** The sliders of mulch, rain and temperature in Properties and the click on an arrow of the loop to read its effect.


**How it is generated.** Seven effects of the mulch (on evaporation, temperature, drainage, nitrogen, structure, roots and yield) are computed as ratios of the Daisy runs and shown as loops that feed each other (Chapter 10).

**Properties.** Mulch, weather and climate, soil, nitrogen, crop.

**Data sources.** The Daisy experiments E14 and E11 (mulch, rain, capacity, temperature) and the annual model built on them.

## Daisy model workbench

**Controls.** The tabs of the workbench (data, library, experiments, scenarios, process map, log plots, mass balance, comparison, set up editor, model builder, soil column, denitrification, learning, documentation, reference manual); every tab has a **Manual p. N** button. The Set up editor opens the folders and files of the library, formats, saves and runs; a very large file or an output log (.dlf, .dwf, .csv) is sent to Log plots instead of the editor, so the editor never has to draw it.


**How it is generated.** The Daisy tabs write the files of a Daisy run (set up, weather, soil, management), run Daisy on the desktop (or save the folder to run elsewhere), and read its logs for the figures; the decision support layers are built from the logs of your own runs (Chapters 26 to 38).

**Properties.** The Daisy tabs read the weather and the soil of the project when you press *Use the project*; the Decision support layers (chemical fate, decision table, water balance, nitrogen balance, yield risk, chemicals and drinking water, trade offs, return of irrigation, nitrous oxide) read the runs you made. Their year charts also carry the projection of Properties.

**Data sources.** The Daisy model (Hansen and others, 2012) and its reference manual; the parameter library (63 soil horizons, 84 crops, 79 fertilisers, 35 chemicals, 82 managements, 55 programs, 176 logs); the weather files and the runs you produce.

## Weather, field and map data

| Source | Used for | How it is reached |
|---|---|---|
| Built in benchmark record, 1980 to 1999, projected to 2100 | the default weather of every layer | inside the program |
| Imported weather file (CSV, Excel, DWF or DLF) | your own field weather | Import weather in Properties |
| Open-Meteo forecast, archive and geocoding | online weather of a place, twenty years of measured weather and the forecast | Online weather in Properties |
| Esri World Imagery, OpenStreetMap | the map and the satellite picture of the field | Field on the map |
| Sentinel 2 L2A (Microsoft Planetary Computer, Element 84) | vegetation and water indices of the field | Field on the map |
| SoilGrids 2.0 (ISRIC) | the soil of the field and its retention curves | Field on the map |
| ESA WorldCover 2021, Overpass (OpenStreetMap) | land cover, roads, water sources near the field | Field on the map |
| Open-Meteo elevation, terrain tiles | the slope and the terrain of the field | Field on the map |

Online sources need a connection; every other number of the program is computed on your computer.

## Drip wetting by soil

The wetted bulb of the drip design depends on the soil: the shape factor of Eq. 12.11 rises with the saturated conductivity, so a sand wets a narrow, deep bulb and a clay loam a wide, shallow one, and the volume of the bulb is the water of the emitter divided by the water the soil can store. Choose another soil in Properties and run the design to compare.

## Ending a pipe in the field sketch

While a pipe tool is chosen, a pipe ends when you click its last point again (the dead end), when you click on any other pipe (it joins that pipe at the point clicked), or when you double click or press Enter.
