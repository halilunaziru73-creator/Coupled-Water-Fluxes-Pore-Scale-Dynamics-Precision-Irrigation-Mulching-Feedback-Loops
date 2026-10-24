# Release 1.1: design runs, weather, virtual farm, crops and seasonal records

Release 1.1 adds four groups of layers and three workbench functions. Every new layer follows the controls of the Properties panel (soil, tillage, crop, mulch, rainfall, warming, irrigation method, trigger, sensor depth and nitrogen) and is redrawn when any of them changes.

## The layers

The Layers panel lists, in order: **Irrigation design** (surface, drip, sprinklers, each with its *Virtual farm simulation*), **Irrigation control**, **Mulch and evaporation**, **Soil structure and tillage**, **Field water balance**, **Seasonal records: Daisy data** (Y1, W1, N4), **Crops** (C1) and **Feedback loops**. The working date and the year are set only in Properties, Scenario (every year from 1980 to 2100); no year strip or date slider sits under the drawings.

## Running an irrigation design

Opening a design layer does not start it. Set the inputs at the top of the layer, then press **Run simulation** (in the drawing, on the bar under it, or on the dashboard Design tab). Until the run, and after any change of an input or of a Properties control, the results are hidden behind a panel that says why, so nothing moves while the inputs are being set.

**Inputs.** Every number is a value box. A click opens a picker with the exact value, its unit (for example m, km or ft for lengths; L/s, m³/h or L/min for flows; ha, m² or acre for areas; kPa, bar, m of water or psi for pressure) and a drop-down of values across the allowed range. The allowed range is shown; a value outside it is set to the nearest limit. Choices such as the system, intake, cutoff, emitter or sprinkler type are buttons; the crop is a drop-down of all crops.

**Most efficient inputs.** *Find the most efficient inputs* searches the inputs that matter most (surface: inflow, cutoff rule, cutback and the run length, the field being split into two to four runs when that helps; drip: emitter flow, spacing and interval; sprinklers: nozzle, pressure and spacing) for the highest application efficiency with the root zone at least 95 % refilled, shows the combination on the Design tab and applies it with *Apply these inputs and run*. The present inputs take part in the search: when none of the combinations tried does better, the Design tab says that the present inputs are already the most efficient and offers nothing to apply.

**Dashboard.** The Design tab gives the efficiencies, uniformity, times and volumes of the last run, the best combination and a warning when a surface stream cannot reach the end of the field in a practical time. The Charts tab of a design layer draws the hydrograph (inflow, infiltration and runoff), the advance, cut-off and recession times along the field, the infiltrated depth against the required depth, the times of the irrigation (tL, ts, tco, tr) and where the water goes; for drip and sprinklers the hydrograph at the pump (the zones or sets run one after the other at the zone flow) and the times of the irrigation (run time of a zone or set, the whole field and, for drip, the interval); for drip the head and emitter flow along the lateral; for sprinklers the soil intake rate against the application rate and the sorted depths caught. Every dashboard block has a header: click it to hide or show the block.

**Field sketch.** View or Tools, *Field sketch to design*: click the corners of the field on the grid (choose the size of a grid square), mark the water source, give the slope and the system. The area, run length, width and mainline length become the inputs of the design layer, which opens ready to run. *Compare the irrigation systems on this field* lists the three systems side by side.

## Weather data

File (or Tools, or Properties, Scenario) → **Import weather data** reads a daily weather file: CSV or TXT (comma, semicolon, tab or space separated), Excel (XLSX, XLS, ODS), a Daisy weather file (DWF) or a Daisy daily log (DLF). A Daisy setup file (DAI) holds no weather itself: the program names the weather file it uses, and that file is the one to import. The columns are found by their names: a date (or year, month and day, or year and day of year), daily rainfall (mm, or inches when the header says so) and, if present, daily reference evapotranspiration. Without it, reference ET is computed from the daily maximum and minimum temperature (Hargreaves, at the latitude given in the dialog) or from mean temperature and global radiation (Makkink). Hourly files are summed to days.

**Online weather for a location** finds a place by name (or takes its latitude and longitude) and gets its measured daily weather for the last twenty years and the forecast for the next sixteen days. If the service cannot be reached, the current weather stays in use and the Messages tab says so.

The weather is put on the twenty-year grid of the program (the last twenty complete years; fewer years are repeated in turn, and missing days of rain are filled from the same day of another year). Then the daily model takes the rain of each day and the evaporative demand of each day from its reference ET; the crop water balance takes the same daily rain and reference ET; and the annual model takes the rainfall and the demand of the new climate through its rainfall and warming controls, at the nearest simulated step (the report of the import says when the climate lies outside the simulated range). Properties, Scenario, **Weather source** switches between the recorded weather of the simulations, the imported file and the online weather; the choices of a file or online weather become active only after the data are loaded. The first time the File menu opens, the program offers to bring in weather data.

## Virtual farm simulation

The virtual farm (under each design layer, *Virtual farm simulation*, or the *Virtual farm simulation* button on the view bar of every layer) draws a field in perspective with the water moving from the source to the plants. The farm runs its own clock; when you leave it, the working date and the irrigation method of the project return to what they were before. Six layouts are available:

| Layout | Head works drawn | Water on the field |
|:--|:--|:--|
| Furrow | canal from the reservoir, lifting gate, siphons | advance front along each furrow, tail-water ditch with the runoff share |
| Basin | canal, gate | sheet of water filling each basin |
| Border strip | canal, gate, siphons | sheet advancing down each strip, tail water |
| Sprinkler | well, pump, filters, fertiliser tank, mainline, control valve | rotating sprays with wind drift |
| Surface drip | well, pump, filters, fertiliser tank, mainline, control valve | emitters and wet spots along the laterals |
| Subsurface drip | as surface drip | buried laterals and wetted bands below the surface |

**The gate or valve follows the predicted schedule.** The daily model (Engine 2, chapter 5) predicts the dates and depths of irrigation for the present settings. The board at the gate lists the next four irrigations with the hours the gate or valve stays open; tap a line to jump to that date. During an irrigation the gate is lifted (or the valve opened) and water flows; between irrigations it is closed. *Farmer opens the valve* shows a farmer walking to the gate; *Automatic controller* shows a controller box wired to the soil-water sensor, whose lamp lights when the trigger is reached.

**Below the farm** are three panels: (i) a cross-section through the field showing the water in each soil layer of the daily model, the wetting front, the roots of the chosen crop and the sensor; (ii) the predicted schedule for the next 30 days (rain, irrigation, valve open, sensor depletion and trigger); (iii) the fate of the next irrigation (stored in the root zone, deep percolation, surface runoff, evaporation and drift), taken from the surface (S2), drip (S3) or sprinkler (S4) design of the same layout.

**Record video (20 s)** records the farm for 20 seconds and saves it as a WebM film.

![Virtual farm simulation: furrow layout, gate on the predicted schedule, the farmer at the gate.](images/v11/farm.jpg){width=100%}

## Crops and C1 Crop water requirement

Properties → Crop lists the Daisy cereal rotation (simulated) and 48 library crops in five groups:

| Group | Crops |
|:--|:--|
| Staple food crops | cassava, yam, rice (paddy), maize, sorghum, millet, cowpea, wheat, potato |
| Cash and oil crops | groundnut, soybean, cotton, mustard, green gram, chickpea, oil palm, cocoa |
| Vegetables | tomato, onion, cabbage, sweet pepper |
| Trees, vines and palms | table and wine grapes, kiwi, blueberry, hop, citrus, olive, apple, pear, cherry, peach, apricot, almond, walnut, pistachio, pecan, hazelnut, pomegranate, fig, persimmon, avocado, mango, guava, date palm, coconut, papaya, cherimoya |

The crop coefficients of the staple and cash crops are: cassava 0.30 / 0.80 / 0.30, yam 0.50 / 1.10 / 0.85, rice 1.05 / 1.20 / 0.90, maize 0.30 / 1.20 / 0.60, sorghum 0.30 / 1.00 / 0.55, millet 0.30 / 1.00 / 0.30, cowpea 0.40 / 1.05 / 0.50, groundnut 0.40 / 1.15 / 0.60, soybean 0.40 / 1.15 / 0.50, oil palm 0.90 / 0.95 / 0.95, cocoa 1.00 / 1.05 / 1.05 (initial / mid-season / end). The former legume and vegetable categories, which only multiplied the cereal yield, are removed; projects saved with them open with soybean and tomato. Each library crop carries crop coefficients for the initial, mid-season and late stages, stage lengths, height, maximum rooting depth, the depletion fraction $p$ and the yield-response factor $K_y$; tree and vine crops have several planting densities (ground cover and height).

For a library crop the program runs a daily root-zone water balance on the same 20 weather years as the Daisy simulations: the crop water need is $ET_c = K_c\,ET_0$, the soil is refilled to field capacity when the depletion reaches the trigger, and the relative yield follows $1-Y_a/Y_m = K_y\,(1-ET_a/ET_c)$. The Daisy results of the cereal are then transferred to the crop by the ratio of the two balances (irrigation, transpiration, evaporation and drainage), so that every other layer responds to the crop. The bar under the drawing states which model is in use. Yield of a library crop is shown as a percentage of the potential.

The layer **C1 Crop water requirement** shows the crop's tiles (water need, water used, net and gross irrigation, number of irrigations, relative yield, water below the root zone, stress days), the $K_c$ curve with the stage bands and the daily water need, the root-zone depletion with the irrigations and rain of the selected year, and a table of every crop on the present soil ranked by net irrigation. Tap a row to select that crop.

![C1 Crop water requirement.](images/v11/crop.jpg){width=100%}

## Daily records that follow the settings (V1, V2)

The 20-year sensor record (V1) and the season profiles (V2) start from your Daisy daily output, which exists for the coarse loam and the coarse sand at the standard settings (conventional tillage, bare soil, surface irrigation, trigger −300 cm at 20 cm, cereal, unscaled rain, no warming, full nitrogen). For any other soil or setting the daily model is run twice, at your settings and at the standard settings, and the difference in depletion of available water at the sensor depth is added day by day to the Daisy record, which is then converted to suction with the van Genuchten curve of your soil. The real weather sequence of the record is kept, and every control moves the traces.

## Seasonal records: Daisy data (Y1, W1, N4)

These layers use the per-year output of 1 003 Daisy runs (experiments E00, E02, E03, E04, E05 and E07, 20 years each), extracted from the complete simulation output by `tools/make_peryear.py`. The run matching the present settings is selected automatically (mulch, method, trigger, sensor depth, tillage and consolidation rate).

* **Y1 Reliability over 20 seasons**: yield, irrigation, drainage, nitrogen leaching, water-stress days and water productivity of each year; a reliability table (median, 10 % and 90 % years) and exceedance curves.
* The Daisy run gives the year-to-year pattern; controls that its experiment does not vary (crop, rainfall scale, warming and nitrogen rate) are applied by the response of the annual model, so that the 20-year mean of every series equals the annual result at your settings.
* **W1 Full water balance**: the water balance of each year as stacked bars; the evapotranspiration split into transpiration, soil evaporation, canopy evaporation, litter evaporation, evaporation of ponded water and snow evaporation, which together close ET to within 1.1 mm; potential and actual evapotranspiration; the infiltration path (matrix and macropores) and drainage.
* **N4 Nitrogen budget**: fertiliser, mineralisation, plant uptake, denitrification, volatilisation and leaching per year, with leaching against drainage.

![W1 Full water balance.](images/v11/wb2.jpg){width=100%}

## Consolidation rate

In your Daisy runs (E5) the consolidation rate of the tilled layer changes the results only in the five finer soils (loam to silty clay loam: up to 6 mm/yr of drainage and 14 kg N/ha of leaching); in the five coarser soils all rates give the same result, and the program shows the same.

## Workbench functions

* **F1** opens this manual directly (Help → *Manual (PDF)*, or the book button on the toolbar).
* **Save full report as PDF** (File menu, *Report* toolbar button, `Ctrl+Shift+P`) builds the complete report of every layer end to end (inputs, results, key numbers and pictures of each layer) and asks where to save it. *Report of chosen layers* lets you pick the parts.
* **Speed**: every frame paints only the part of the sheet on the screen; pictures, prints and reports always paint the whole sheet.
* **Long layers** are fitted to their content: the drawing grows to show every panel and the centre window scrolls to the end of the layer.

## Correction of the surface layer (release 1.1.0)

In release 1.0.0 the infiltration of the steady-intake term $f_0$ during advance was divided by $(1+r)$ with a fixed advance exponent $r=0.55$ (Eq. 11.9). Release 1.1.0 uses the iterated advance exponent of the volume-balance solution. With the correction the shipped layer reproduces the 13 advance times of the FAO-45 border examples within $-0.2$ to $+0.5$ % (before: $-2.2$ to $+2.9$ %) and the eight advance times of Example 6.1 within $-0.2$ to $+1.8$ % (before: up to $-29$ % when advance is slow). Results with the pure Kostiakov law ($f_0=0$) are unchanged.
