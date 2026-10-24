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

## The designs

* Inputs are **value boxes** with exact values, units and a list of the allowed range (Section 18.2).
* **Nothing runs while you type**: results appear after **Run simulation** and are withdrawn when an input or a setting changes (Section 18.1).
* **Find the most efficient inputs**, with your present inputs competing (Section 18.4); the surface search also tries shorter runs.
* **Field size** as an area or as a length and a width, for drip and sprinklers (Section 18.3).
* **Field sketch** and **Compare the irrigation systems** (Sections 18.5–18.6).
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
