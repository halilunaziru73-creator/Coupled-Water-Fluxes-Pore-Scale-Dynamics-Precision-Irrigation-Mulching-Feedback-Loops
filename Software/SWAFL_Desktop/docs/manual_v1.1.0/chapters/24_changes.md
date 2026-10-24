# What changed from version 1.0 to version 1.1

## The window

* The program, its title bar, the status bar and the About window show **1.1.0**. The build removes any older program before building, and the program clears its cache on start, so an old version cannot be shown by mistake.
* The **Layers panel** has a new order: Irrigation design, Irrigation control, Mulch and evaporation, Soil structure and tillage, Field water balance, Seasonal data, Crops, Feedback loops. The short codes of the layers (S2, V1, N4, …) are gone; layers are named by their names only.
* The **virtual farm** is no longer a layer of its own: it sits under each design layer and behind the *Virtual farm simulation* button of every view bar (Chapter 20).
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
* The **field sketch** is a guided drawing: corners you drag, side lengths you type, the source and the inlet, the pipe layout drawn as you choose, and seven steps of questions (field, water, crop, soil, system, running, summary) (Section 18.6). **Compare the irrigation systems** (Section 18.7).
* Each design ends with a **film of the soil water** covering the days ahead and the rest of the season. Every day is coloured by its phase (irrigation, rain, comfortable, nearing the trigger, stress, near wilting, no crop). The film shows the root zone drying towards the trigger and, without irrigation, towards the wilting point, and gives the totals and the share of days in each phase (Section 18.6). The schedule takes its depths and times from the design.
* The seasonal layers have **one dashboard chart per part of the layer**, with how each quantity varies over the twenty seasons (Chapter 14).
* *Trigger law* and *Mulch against bare soil* stand still until **Play**; the season plays at two days a second.
* Values may be typed up to the **physical limits** of the system, beyond the usual range of the list (Section 18.2).
* A surface set lasts at most 48 hours; when the inflow is too small for the soil, the design and the farm say so (Chapter 11).
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
* *Tools ▸ Field on the map…* finds the farm (place search, coordinates, satellite image, Google Earth), demarcates it on the image, computes NDVI, EVI, SAVI, NDRE and NDWI of the demarcated field from Sentinel-2 or simulated by SWAFL, and exports the report (PDF or PNG at 96 to 600 dpi, with coordinates and authorship), GeoJSON and CSV (Section 18.6).
* The Virtual farm simulation is a folding block at the bottom of the Dashboard instead of a button on top of every layer.
* The Trigger law block of the Dashboard shows the current soil as a table, its season chart and the advice with each condition ticked.
* The index map is cut exactly to the demarcated outline on the real map and follows every change of the outline; it shows continuous colours or five management zones with their areas, two indices side by side, the value under the cursor, and the irrigation layout of the sketch.
