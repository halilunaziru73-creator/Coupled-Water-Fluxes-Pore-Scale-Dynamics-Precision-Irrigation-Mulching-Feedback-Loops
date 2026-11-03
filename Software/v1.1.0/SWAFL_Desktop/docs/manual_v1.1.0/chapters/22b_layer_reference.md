# Reference of every layer: controls, properties and data sources

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

**Properties.** Soil, crop, method (which decides the design layer), field area (the same area in the three designs), salt, trigger and weather. The drip depth of the method sets the depth of the laterals. The mainline length, the mainline and submain diameters and the lateral diameter can come from the field sketch (see below).

**Data sources.** Intake from the soil: Saxton and Rawls pedotransfer functions to Green and Ampt to Kostiakov. Flow in the inlet: Manning. Advance and recession: volume balance (Walker and Skogerboe). Pipe friction: Hazen and Williams, with C = 140 for the main and submain and 150 for the laterals. Standard pipe diameters from 32 to 315 mm. Crop water: FAO paper 56 (Allen and others, 1998). Weather: the weather in use.

### Designing the pipes in the field sketch

The field sketch (**Tools, Field sketch to design**) has pipe tools beside the tools for greenhouses, beds, irrigated areas and plants. Choose **Mainline pipe**, **Submain pipe** or **Lateral pipe**, click the points of the route and double click (or press Enter) to finish; a list of diameters (in mm) appears while a pipe tool is chosen and changes every pipe of that kind. Place a **Valve**, **Pump**, **Filter** or **Tank** with one click. Every pipe shows its diameter and length on the drawing.

The Summary step lists the pipe network: for each pipe the diameter, length, flow, speed and friction loss (Hazen and Williams), whether the speed is good (too fast above 1.5 m/s in the main and submain and 2 m/s in a lateral, very slow below 0.3 m/s), and the pump head the network asks for (lift, friction, and the working head and fittings) with the power at 65 % efficiency. **Turn the sketch into the design** hands the drawn mainline length, the mainline and submain diameters and, for drip, the lateral diameter to the design, which then uses them in place of its own sizing; its layout then says "sketch" beside the mainline.

## Irrigation control: sensor and trigger, trigger law

**Controls.** The sensor and the trigger are sliders in Properties (trigger suction and sensor depth); the layer plays the season by itself and **Play** and **Stop** control it. The soil row and the shaded band mark the soil only, not the chart beside it.

**Properties.** Soil, trigger, sensor depth, critical depletion, crop, mulch, weather.

**Data sources.** The Daisy experiments on the trigger (E2) and on the sensor depth (E3) for the nine soils; the retention curve of each soil (Saxton and Rawls); the weather in use.

## Mulch and evaporation: mulch against bare soil, mulch control, evaporation physics, fate of saved water, regime map

**Controls.** The mulch sliders (strength, capacity) and the material list in Properties; the sliders of the layer for the physics of evaporation; Play, Stop and the year clicks.

**Properties.** Mulch group, soil, tillage, rainfall scale, temperature shift.

**Data sources.** The Daisy experiments on the mulch (E14 and E7) over strength, rainfall and capacity; the temperature and rainfall grid (E11); the equations of vapour diffusion and surface resistance given in the chapter of the layer.

## Soil structure and tillage: tillage and structure, soil hydraulic drivers, root structure

**Controls.** The tillage buttons and the consolidation slider in Properties; click a soil row of the table to select it (the highlight covers the soil table only); Play and Stop for the consolidation in time.

**Properties.** Soil, tillage, structural consolidation rate, crop.

**Data sources.** The Daisy experiment on tillage and consolidation (E5); the hydraulic parameters of the nine soils (Saxton and Rawls, with the Daisy parameters of the soil classes); root distribution of the crop kind of the library.

## Deterministic phenotyping

**Controls.** The sowing mode, species, genotype and climate lists of the layer, its sliders and its Run button.

**Properties.** Soil, tillage, rainfall, temperature and the weather in use.

**Data sources.** The phenotyping models of the program (crop growth, canopy, roots and traits) driven by the weather in use; the traits typed into the layer.

## Field water balance: field balance, soil plant and air, profile evolution

**Controls.** The control bar under the drawing (play, stop, speed, the year and the day), the click on a year bar to move the clock, and the decision panel of Properties (horizon, crop in the decision, soil water on the date, field area).

**Properties.** Every group of Properties.

**Data sources.** The daily simulation of the program (soil water, crop, mulch and irrigation) on the weather in use; the soil and crop libraries; the irrigation advice uses the area to give volumes.

## Seasonal data: reliability over the seasons, full water balance, nitrogen budget

**Controls.** Click a bar to move the clock to that year; the red bar is the year on the clock. Hover a bar for its value. Dashed lines are the rainfed runs. **Seasons projected** in Properties (none, 10 or 20) adds seasons after the last simulated one.

**Projection.** Seasons after the twenty simulated ones are drawn lighter, right of a dashed line marked *projection*, on the calendar that follows the working date. Each projected season is one of the twenty simulated seasons, taken in a fixed random order, and moved by the climate trend of Properties: the warming per decade (default +0.3 °C) raises the reference evapotranspiration by 3.5 % per degree, which raises irrigation and crop water use and lowers yield by 2 % per degree; the rainfall change per decade (default 0 %) scales the rain and, through it, the drainage, the nitrate leached and the irrigation. The means, the 10 to 90 % range and the reliability figures always use the twenty simulated seasons only. A projection shows where the setting is heading; it is not a weather forecast.

**Properties.** Every group; crop and weather move the seasons most.

**Data sources.** The yearly values of the Daisy reference runs (irrigated and rainfed) for each soil, held in the program for the twenty seasons; the ratios of the annual model between your settings and the reference; the crop library for a library crop (daily FAO paper 56 balance, season by season).

## Crops: crop water requirement

**Controls.** The crop list, the year and the dates; the crop curve and the daily balance of the season in the picture.

**Properties.** Crop, soil, trigger, weather, salt, method.

**Data sources.** The crop library of 48 crops: crop coefficients, stage lengths, height, rooting depth, depletion fraction and yield response factor (FAO papers 56 and 33, and a field study of daily crop water requirement with the FAO Penman and Monteith evapotranspiration); the weather in use. Crops not tabulated take the default of their group and say so.

## Feedback loops

**Controls.** The sliders of mulch, rain and temperature in Properties and the click on an arrow of the loop to read its effect.

**Properties.** Mulch, weather and climate, soil, nitrogen, crop.

**Data sources.** The Daisy experiments E14 and E11 (mulch, rain, capacity, temperature) and the annual model built on them.

## Daisy model workbench

**Controls.** The tabs of the workbench (data, library, experiments, scenarios, process map, log plots, mass balance, comparison, set up editor, model builder, soil column, denitrification, learning, documentation, reference manual); every tab has a **Manual p. N** button. The Set up editor opens the folders and files of the library, formats, saves and runs; a very large file or an output log (.dlf, .dwf, .csv) is sent to Log plots instead of the editor, so the editor never has to draw it.

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
