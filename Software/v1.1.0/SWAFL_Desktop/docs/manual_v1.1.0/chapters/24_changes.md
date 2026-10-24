# What changed from version 1.0 to version 1.1

## The window

* The program, its title bar, the status bar and the About window show **1.1.0**. The build removes any older program before building, and the program clears its cache on start, so an old version cannot be shown by mistake.
* The **Layers panel** has a new order: Irrigation design, Irrigation control, Mulch and evaporation, Soil structure and tillage, Field water balance, Seasonal data, Crops, Feedback loops. The short codes of the layers (S2, V1, N4, …) are gone; layers are named by their names only.
* The **year strip** and the date bar under the drawings are gone; the year (1980–2100) and the date are set in Properties and on the toolbar.
* The **dashboard** is laid out like the Properties panel and every block folds on its own; the Charts tab draws the hydrograph, the times of the irrigation and where the water goes for each design (Chapter 14).
* **Properties**: the *Weather of years after 1999* selector and the explanatory notes under it, under the consolidation rate and under the design shortcuts have gone; their content is in this manual. *Weather source* chooses the built-in record, an imported file or the online weather.
* The name of the simulation model is no longer shown anywhere in the program; badges that said so now say *Simulated*.
* Labels are drawn after the pictures and moved apart when they would overlap; text near the edge of a drawing is moved inwards instead of being cut; long drawings take their full height at once.
* On screens narrower than 1500 pixels the docks give way so that the drawing keeps its size; the drawing always fits the window, nothing is cut off on the right.
* The selected layer is marked in light blue; the Play/Pause button is small.
* The first block of the Results tab gives the key numbers of the open layer (Chapter 14).
* Layers that play by changing a setting (each soil in turn, rainfall from dry to wet) wait for **Play** in the program, so Properties and the dashboard keep your values.

## The designs

* Inputs are **value boxes** with exact values, units and a list of the allowed range (Section 18.2).
* **Nothing runs while you type**: results appear after **Run simulation** and are withdrawn when an input or a setting changes (Section 18.1).
* **Find the most efficient inputs**, with your present inputs competing (Section 18.4); the surface search also tries shorter runs.
* **Field size** as an area or as a length and a width, for drip and sprinklers (Section 18.3).
* The **field sketch** is a guided drawing: corners you drag, side lengths you type, the source and the inlet, the pipe layout drawn as you choose, and seven steps of questions (field, water, crop, soil, system, running, summary) (Chapter 20). **Compare the irrigation systems** (Section 18.7).
* Each design ends with a **film of the soil water** covering the days ahead and the rest of the season. Every day is coloured by its phase (irrigation, rain, comfortable, nearing the trigger, stress, near wilting, no crop). The film shows the root zone drying towards the trigger and, without irrigation, towards the wilting point, and gives the totals and the share of days in each phase (Chapter 20). The schedule takes its depths and times from the design.
* The seasonal layers have **one dashboard chart per part of the layer**, with how each quantity varies over the twenty seasons (Chapter 14).
* *Trigger law* and *Mulch against bare soil* stand still until **Play**; the season plays at two days a second.
* Values may be typed up to the **physical limits** of the system, beyond the usual range of the list (Section 18.2).
* A surface set lasts at most 48 hours; when the inflow is too small for the soil, the design says so (Chapter 11).
* The surface layer iterates the advance exponent in the steady-intake term (Chapter 11); the slow-advance cases of the textbook example are now within 2 %.

## The data and the models

* **Weather**: import of daily weather files and the online weather of a place, with every layer following (Chapter 19).
* **Crops**: 48 crops with their FAO-56 coefficients; the *Crop water requirement* layer (Chapter 21).
* **Seasonal data**: the twenty seasons of the simulations, following every setting (Chapter 22).
* **Sensor records** follow every setting and every soil by the delta method (Eq. 6.4a).
* **Sand and loamy sand** now respond to the trigger, the sensor depth and the method (Eq. 5.12a).
* The water balance of every crop closes (the limit on evapotranspiration was raised from 2,000 to 5,000 mm).
* Yield is in Mg/ha for the simulated cereal and in per cent of the potential for a library crop, with differences in *% points*.

## Reports

* The report asks which layers to include, all ticked to start with; notes and drawings continue on the next pages; designs are drawn complete (Chapter 23).

## The field on the map

* The field sketch has a hand to move the drawing, zoom in and out (buttons and mouse wheel), *Fit*, and a north arrow and scale bar that follow the zoom.
* *Tools ▸ Field on the map…* finds the farm (place search, coordinates, satellite image, Google Earth), demarcates it on the image, computes NDVI, EVI, SAVI, NDRE and NDWI of the demarcated field from Sentinel-2 or simulated by SWAFL, and exports the report (PDF or PNG at 96 to 600 dpi, with coordinates and authorship), GeoJSON and CSV (Chapter 20).
* The virtual farm simulation has been removed; the real field on the map (Chapter 20) takes its place.
* The Trigger law block of the Dashboard shows the current soil as a table, its season chart and the advice with each condition ticked.
* The index map is cut exactly to the demarcated outline on the real map and follows every change of the outline; it shows continuous colours or five management zones with their areas, two indices side by side, the value under the cursor, and the irrigation layout of the sketch.
* The soil-water film of every design follows the season of the crop in Properties (starting at its next sowing when the working date has no crop), gives the advice of when to plant over the whole year, and each design has the weather line with the button for the online weather of the farm.
* The field map makes a variable-rate irrigation map (zones of net depth from the satellite indices and the simulation, editable, exported as a prescription), the ephemeral gully risk with the predicted gullies (terrain threshold and a ridge and valley filter of the photo) and the soil loss (RUSLE); the Soil hydraulic drivers dashboard is complete.
* The field map reads the season of the real field from twelve months of Sentinel-2 (curves, change, trend, stability and monitoring zones); the variable-rate irrigation simulates every zone with its own soil (SoilGrids), its observed cover and the SWAFL model and weather of the farm, giving each zone its dates and depths; the erosion uses the daily rain of the weather in use, the runoff on that soil and the cover of every month seen by Sentinel-2.
* The irrigation schedule of every design is the FAO-56 plan of the farm: the crop coefficient Kc of every day times the reference evapotranspiration of the weather in use, the rain, the roots and the soil, the trigger, the mulch, and the net depth, efficiency and run time of the design (Eq. 18.4). The film, the schedule, the season rows of the designs, the Dashboard and the zone-by-zone irrigation of the field map use it, and every control changes it.
* The field map keeps every computed map as a layer (*Maps of this field*) to show again without computing; the site keeps its results when the window is opened again; the map moves to a water source only on **Show**.
* The Soil hydraulic drivers layer shows its whole height, down to the notes under the soil profiles.
* The web explorer of the repository is built from the engine of version 1.1.0 (tools/build_explorer.py).
