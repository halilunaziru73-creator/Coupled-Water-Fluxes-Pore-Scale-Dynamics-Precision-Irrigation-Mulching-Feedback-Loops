# The best combinations {#daisy-combos}

Start from the Daisy reference offers 27 combinations of factors that the Daisy reference manual makes worth comparing. Each is shown as it opens in the Experiments tab, with the reason it is offered and the place of the reference manual where its parameters are described.

### Overhead, surface or drip irrigation

The manual has three ways to apply water: over the canopy, on the soil surface, and into a soil volume. Run the three with the same trigger and dose, so only the way of applying water differs.

![Overhead, surface or drip irrigation. Screen 30 of the Daisy workbench.](images/daisy11/dz_combo_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation method.** Varied over overhead, surface, drip.
2. **Soil.** Varied over usda:sand, loam.
3. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
4. **How to combine.** Every combination, one thing at a time, or the values paired in order.
5. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
6. **Size of the experiment.** The number of runs and the time they take on this computer.
7. **Run all.** Runs every combination, several at a time.

\newpage

### Irrigation and nitrogen together

Water moves nitrate and decides how much of the fertiliser the crop can use. Irrigation against rainfed, at three fertiliser doses, shows whether more water raises the yield only when the nitrogen is there, and what it costs in nitrate below the roots.

![Irrigation and nitrogen together. Screen 31 of the Daisy workbench.](images/daisy11/dz_combo_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation.** Varied over 0, 1.
2. **Nitrogen fertiliser, factor on the rotation.** Varied over 0.5, 1, 1.25.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### When to irrigate: the trigger and the depth of the sensor

Irrigation starts when "soil water pressure above" is not true: the potential (cm) and the height (cm) are its two parameters. The potentials run from near field capacity to well before wilting for this soil texture; the depths stay inside the rooting depth of 100 cm.

![When to irrigate: the trigger and the depth of the sensor. Screen 32 of the Daisy workbench.](images/daisy11/dz_combo_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation trigger (soil suction).** Varied over -150, -300, -600.
2. **Sensor depth.** Varied over 10, 30, 60.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### How much and how fast: dose and duration

The water application speed is a parameter in mm/h (default 2 mm/h) and the irrigation lasts a number of hours. The pairs below keep the speed of the manual (2 mm/h) while the dose grows, so the answer is the effect of the dose and not of the speed.

![How much and how fast: dose and duration. Screen 33 of the Daisy workbench.](images/daisy11/dz_combo_04.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Water per irrigation.** Varied over 10, 20, 30, 40.
2. **Duration of one irrigation.** Varied over 5, 10, 15, 20.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Nitrogen fertiliser, irrigated and rainfed

Fertiliser is applied as an amount in kg N/ha. Scaling the rotation between half and one and a quarter of its dose, with and without irrigation, shows the dose where yield stops rising and the nitrate leached below the roots starts to climb.

![Nitrogen fertiliser, irrigated and rainfed. Screen 34 of the Daisy workbench.](images/daisy11/dz_combo_05.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Nitrogen fertiliser, factor on the rotation.** Varied over 0.5, 0.75, 1, 1.25.
2. **Irrigation.** Varied over 0, 1.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### A drier, wetter or warmer year

The weather file gives precipitation and air temperature to every model of the column. Scaling the rain and adding a warming to the same record shows how much the yield and the water use move with the weather, with the soil and the management unchanged.

![A drier, wetter or warmer year. Screen 35 of the Daisy workbench.](images/daisy11/dz_combo_06.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Rain, factor on the weather.** Varied over 0.8, 1, 1.2.
2. **Temperature shift.** Varied over 0, 2.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### The irrigation season and a limit on water

The irrigation of a crop is tested between a from date and a to date and can be given an amount. Start dates and a seasonal limit show how much of the yield is bought by the first and the last irrigations.

![The irrigation season and a limit on water. Screen 36 of the Daisy workbench.](images/daisy11/dz_combo_07.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation window.** Varied over Apr 1 minus Oct 1, May 1 minus Oct 1, Jun 1 minus Sep 1.
2. **Water limit per crop season.** Varied over 60, 120, 240.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Which soil needs the most water

A horizon gets its hydraulic properties from the hypres model by default, from the sand, silt, clay, humus and bulk density. Rainfed and irrigated runs on several textures show where irrigation pays.

![Which soil needs the most water. Screen 37 of the Daisy workbench.](images/daisy11/dz_combo_08.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Soil.** Varied over usda:sand, usda:sandyloam, loam, usda:siltloam, usda:clayloam.
2. **Irrigation.** Varied over 0, 1.
3. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
4. **How to combine.** Every combination, one thing at a time, or the values paired in order.
5. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
6. **Size of the experiment.** The number of runs and the time they take on this computer.
7. **Run all.** Runs every combination, several at a time.

\newpage

### Slow or fast irrigation: a constant water flux

Daisy applies irrigation at a rate in mm/h, so a slow rate keeps the water in the topsoil and a fast one can run off or percolate. The rates below keep the same dose per irrigation, so only the speed of application differs.

![Slow or fast irrigation: a constant water flux. Screen 38 of the Daisy workbench.](images/daisy11/dz_combo_09.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation intensity (constant flux).** Varied over 0.1, 0.5, 2.
2. **Soil.** Varied over usda:sand, loam.
3. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
4. **How to combine.** Every combination, one thing at a time, or the values paired in order.
5. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
6. **Size of the experiment.** The number of runs and the time they take on this computer.
7. **Run all.** Runs every combination, several at a time.

\newpage

### Sensor depth against rooting depth

The tensiometer that triggers irrigation sits at one depth, while the roots take water from the whole root zone. A sensor above or below most of the roots triggers too early or too late; crossing the sensor depth with the rooting depth shows where it matters.

![Sensor depth against rooting depth. Screen 39 of the Daisy workbench.](images/daisy11/dz_combo_10.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Sensor depth.** Varied over 10, 30, 50.
2. **Maximum rooting depth.** Varied over 40, 80, 120.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### When the fertiliser is applied and how much

The fertilize action is placed on a date. Moving it two weeks earlier or later, at three doses, shows how much nitrate is exposed to the rain before the crop takes it up.

![When the fertiliser is applied and how much. Screen 40 of the Daisy workbench.](images/daisy11/dz_combo_11.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Fertiliser date, shift in days.** Varied over -14, 0, 14.
2. **Nitrogen fertiliser, factor on the rotation.** Varied over 0.7, 1, 1.3.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Warming with and without irrigation

A warmer year raises the evapotranspiration and shortens the crop cycle. Warming of 0 to 3 degrees, rainfed and irrigated, shows how much of the loss irrigation can give back.

![Warming with and without irrigation. Screen 41 of the Daisy workbench.](images/daisy11/dz_combo_12.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Temperature shift.** Varied over 0, 1.5, 3.
2. **Irrigation.** Varied over 0, 1.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Tillage and the time and form of the fertiliser

The tillage action (plowing, rotavation, or none) mixes the residues and the topsoil; the fertiliser is taken from the fertilizer library by name, and the date can be moved. These three decide how much nitrate is exposed to leaching.

![Tillage and the time and form of the fertiliser. Screen 42 of the Daisy workbench.](images/daisy11/dz_combo_13.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Tillage.** Varied over plowing, rotavation, none.
2. **Fertiliser date, shift in days.** Varied over -14, 0, 14.
3. **Type of mineral fertiliser.** Varied over N25S, AmmoniumNitrate, Ammonia.
4. **Soil.** Varied over usda:sand, loam.
5. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
6. **How to combine.** Every combination, one thing at a time, or the values paired in order.
7. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
8. **Size of the experiment.** The number of runs and the time they take on this computer.
9. **Run all.** Runs every combination, several at a time.

\newpage

### Evapotranspiration model and radiation

Daisy can take the reference evapotranspiration from the weather file (FAO56) or compute it from the energy balance, and the radiation can be scaled. The runs show how much of the answer depends on that choice.

![Evapotranspiration model and radiation. Screen 43 of the Daisy workbench.](images/daisy11/dz_combo_14.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Evapotranspiration model.** Varied over auto, default.
2. **Radiation, factor on the weather.** Varied over 0.9, 1, 1.1.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### A dry summer, a dry spring or a wet winter

The weather component can scale the precipitation month by month (twelve factors). Taking 30 percent of the rain from the summer or the spring, or adding 30 percent in the winter, shows which part of the year matters for yield and for leaching.

![A dry summer, a dry spring or a wet winter. Screen 44 of the Daisy workbench.](images/daisy11/dz_combo_15.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Seasonal rain pattern.** Varied over dry summer (rain x0.7 Jun-Aug), dry spring (rain x0.7 Mar-May), wet winter (rain x1.3 Dec-Feb).
2. **Irrigation.** Varied over 0, 1.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Sorption and half-life of a chemical

A chemical has a sorption coefficient (K_OC, L/kg) and a decomposition rate; the two decide whether it stays in the topsoil or reaches the depth where it is counted as leached.

![Sorption and half-life of a chemical. Screen 45 of the Daisy workbench.](images/daisy11/dz_combo_16.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Sorption of the chemical, K_OC.** Varied over 0, 50, 500.
2. **Half-life of the chemical.** Varied over 15, 90.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Deficit irrigation: a water limit against the trigger

A crop can be given a limited amount of water in the season, and irrigation starts only when the soil water pressure is below the trigger. A strict trigger with a small limit, against a lax trigger with a large limit, shows whether the same water gives more yield when it is saved for the dry spell.

![Deficit irrigation: a water limit against the trigger. Screen 46 of the Daisy workbench.](images/daisy11/dz_combo_17.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation trigger (soil suction).** Varied over -150, -300, -600.
2. **Water limit per crop season.** Varied over 60, 120, 240.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Rooting depth of the crop

The crop model has a maximum rooting depth, which decides how much of the soil water and nitrate the roots can reach. Shallow to deep roots, rainfed and irrigated, show how much of a water shortage a deeper root zone absorbs.

![Rooting depth of the crop. Screen 47 of the Daisy workbench.](images/daisy11/dz_combo_18.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Maximum rooting depth.** Varied over 30, 60, 90, 120.
2. **Irrigation.** Varied over 0, 1.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### The same farm under other climates

The weather component reads a file for one place. Running the same soil, crops and management with the weather of several places shows how much of the result belongs to the climate.

![The same farm under other climates. Screen 48 of the Daisy workbench.](images/daisy11/dz_combo_19.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Weather station.** Varied over course, it-bologna, dk-foulum.
2. **Irrigation.** Varied over 0, 1.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Tillage against fertiliser form

The tillage action mixes residues and topsoil; the fertilizer library holds several forms of mineral nitrogen. Crossing the two shows whether the form of the nitrogen matters more under one tillage than another.

![Tillage against fertiliser form. Screen 49 of the Daisy workbench.](images/daisy11/dz_combo_20.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Tillage.** Varied over plowing, rotavation, none.
2. **Type of mineral fertiliser.** Varied over N25S, AmmoniumNitrate, Ammonia.
3. **Soil.** Varied over usda:sand, loam.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### The numerical settings of the bioclimate model

NoOfIntervals: Number of vertical intervals in which we partition the canopy; max svat iterations: Max number of svat iterations before giving up on cobvergence; max svat absolute difference [mm/h]: Maximum absolute difference in svat ea values for convergence. Each is varied from half to double the value the farm uses; NoOfIntervals moved the yield, water or nitrogen in the test.

![The numerical settings of the bioclimate model. Screen 50 of the Daisy workbench.](images/daisy11/dz_combo_21.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Bioclimate: NoOfIntervals (Daisy reference, chapter 19).** Varied over 15, 30, 60.
2. **Bioclimate: max svat iterations (Daisy reference, chapter 19).** Varied over 50, 100, 200.
3. **Bioclimate: max svat absolute difference (Daisy reference, chapter 19).** Varied over 0.005, 0.01, 0.02.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### The groundwater and the aquitard below the profile: aquitard

K aquitard [cm/h]: Conductivity of the aquitard; Z aquitard [cm]: Thickness of the aquitard. The aquitard begins below the bottommost soil horizon. Each is varied from half to double the value the farm uses; K aquitard, Z aquitard moved the yield, water or nitrogen in the test.

![The groundwater and the aquitard below the profile: aquitard. Screen 51 of the Daisy workbench.](images/daisy11/dz_combo_22.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Groundwater aquitard: K aquitard (Daisy reference, chapter 45).** Varied over 0.0005, 0.001, 0.002.
2. **Groundwater aquitard: Z aquitard (Daisy reference, chapter 45).** Varied over 100, 200, 400.
3. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
4. **How to combine.** Every combination, one thing at a time, or the values paired in order.
5. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
6. **Size of the experiment.** The number of runs and the time they take on this computer.
7. **Run all.** Runs every combination, several at a time.

\newpage

### Turnover of organic matter and the mineral nitrogen it releases

K NH4 [h-1 ]: Maximal immobilization rate for ammonium; K NO3 [h-1 ]: Maximal immobilization rate for nitrate; CO2 threshold [h-1 ]: Turnover rate above which pools will contribute to 'CO2 fast'. Each is varied from half to double the value the farm uses; K NH4, K NO3, CO2 threshold moved the yield, water or nitrogen in the test.

![Turnover of organic matter and the mineral nitrogen it releases. Screen 52 of the Daisy workbench.](images/daisy11/dz_combo_23.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **OrganicMatter original: K NH4 (Daisy reference, chapter 60).** Varied over 0.01042, 0.02083, 0.04167.
2. **OrganicMatter original: K NO3 (Daisy reference, chapter 60).** Varied over 0.01042, 0.02083, 0.04167.
3. **OrganicMatter original: CO2 threshold (Daisy reference, chapter 60).** Varied over 0.00005, 0.0001, 0.0002.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Water at the soil surface: runoff and evaporation

temperature change rate [h-1 ]: Relative change of surface temperature. If you set this to a negative value, surface temperature will reflect temperature of incomming water or ponded; EpFactor [dimensionless]: The autumn value can be lower, due to muching. With a crop factor of 1.2 a combined Kc of 1.15 is reached at LAI=5. See also [Kjaersgaard et al., 2008]; ReservoirConstant [h-1 ]: Fraction of ponding above DetentionCapacity that runoffs each hour. Each is varied from half to double the value the farm uses; temperature change rate, EpFactor, ReservoirConstant moved the yield, water or nitrogen in the test.

![Water at the soil surface: runoff and evaporation. Screen 53 of the Daisy workbench.](images/daisy11/dz_combo_24.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Surface: temperature change rate (Daisy reference, chapter 87).** Varied over 0.25, 0.5, 1.
2. **Surface: EpFactor (Daisy reference, chapter 87).** Varied over 0.3, 0.6, 1.2.
3. **Surface: ReservoirConstant (Daisy reference, chapter 87).** Varied over 30, 60, 120.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### The limits on the chemistry sink terms

max sink total [dimensionless]: Maximum allowed sink term as a fraction of total content. If variable timesteps are enabled, Daisy will try to scale down the timestep in; max sink solute [dimensionless]: Maximum allowed sink term as a fraction of solute content. If variable timesteps are enabled, Daisy will try to scale down the timestep; max sink secondary [dimensionless]: Maximum allowed sink term as a fraction of secondary domain content. If variable timesteps are enabled, Daisy will try to scale down the timestep. Each is varied from half to double the value the farm uses; none of them moved yield, water or nitrogen in the test, so the effect shows in the process itself.

![The limits on the chemistry sink terms. Screen 54 of the Daisy workbench.](images/daisy11/dz_combo_25.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Chemistry original: max sink total (Daisy reference, chapter 24).** Varied over 0.25, 0.5, 1.
2. **Chemistry original: max sink solute (Daisy reference, chapter 24).** Varied over 0.45, 0.9, 1.8.
3. **Chemistry original: max sink secondary (Daisy reference, chapter 24).** Varied over 0.75, 1.5, 3.
4. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
5. **How to combine.** Every combination, one thing at a time, or the values paired in order.
6. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
7. **Size of the experiment.** The number of runs and the time they take on this computer.
8. **Run all.** Runs every combination, several at a time.

\newpage

### Pipe drainage

L [cm]: Distance between pipes; rad [cm]: Inner radius of drain pipes. Each is varied from half to double the value the farm uses; none of them moved yield, water or nitrogen in the test, so the effect shows in the process itself.

![Pipe drainage. Screen 55 of the Daisy workbench.](images/daisy11/dz_combo_26.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Drain lateral: L (Daisy reference, chapter 37).** Varied over 900, 1800, 3600.
2. **Drain lateral: rad (Daisy reference, chapter 37).** Varied over 1.75, 3.5, 7.
3. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
4. **How to combine.** Every combination, one thing at a time, or the values paired in order.
5. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
6. **Size of the experiment.** The number of runs and the time they take on this computer.
7. **Run all.** Runs every combination, several at a time.

\newpage

### The groundwater and the aquitard below the profile: static

table [cm]: Groundwater level. Positive numbers indicate free drainage. Each is varied from half to double the value the farm uses; none of them moved yield, water or nitrogen in the test, so the effect shows in the process itself.

![The groundwater and the aquitard below the profile: static. Screen 56 of the Daisy workbench.](images/daisy11/dz_combo_27.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Groundwater static: table (Daisy reference, chapter 45).** Varied over 0.5, 1, 2.
2. **Add something to change.** Adds a further factor, grouped by Irrigation, Nitrogen and tillage, Weather and climate, Soil and crop, and Chemicals.
3. **How to combine.** Every combination, one thing at a time, or the values paired in order.
4. **At most.** The largest number of runs; a spread of the combinations is chosen when there are more.
5. **Size of the experiment.** The number of runs and the time they take on this computer.
6. **Run all.** Runs every combination, several at a time.

\newpage

## All combinations in one table

| Group | Combination | Reference | Why |
|:--|:--|:--|:--|
| Irrigation | Overhead, surface or drip irrigation | 15.19, 15.20, 15.21 | The manual has three ways to apply water: over the canopy, on the soil surface, and into a soil volume. Run the three with the same trigger and dose, so only the way of applying water differs. |
| Nitrogen | Irrigation and nitrogen together | 15.5, 15.12 | Water moves nitrate and decides how much of the fertiliser the crop can use. Irrigation against rainfed, at three fertiliser doses, shows whether more water raises the yield only when the nitrogen is there, and what it costs in nitrate below the roots. |
| Irrigation | When to irrigate: the trigger and the depth of the sensor | 28.39, 15.5 | Irrigation starts when "soil water pressure above" is not true: the potential (cm) and the height (cm) are its two parameters. The potentials run from near field capacity to well before wilting for this soil texture; the depths stay inside the rooting depth of 100 cm. |
| Irrigation | How much and how fast: dose and duration | 15.5, 15.18 | The water application speed is a parameter in mm/h (default 2 mm/h) and the irrigation lasts a number of hours. The pairs below keep the speed of the manual (2 mm/h) while the dose grows, so the answer is the effect of the dose and not of the speed. |
| Nitrogen | Nitrogen fertiliser, irrigated and rainfed | 15.12 | Fertiliser is applied as an amount in kg N/ha. Scaling the rotation between half and one and a quarter of its dose, with and without irrigation, shows the dose where yield stops rising and the nitrate leached below the roots starts to climb. |
| Climate | A drier, wetter or warmer year | 25.7, 107.26 | The weather file gives precipitation and air temperature to every model of the column. Scaling the rain and adding a warming to the same record shows how much the yield and the water use move with the weather, with the soil and the management unchanged. |
| Irrigation | The irrigation season and a limit on water | 15.5 | The irrigation of a crop is tested between a from date and a to date and can be given an amount. Start dates and a seasonal limit show how much of the yield is bought by the first and the last irrigations. |
| Soil and crop | Which soil needs the most water | 47, 48.16 | A horizon gets its hydraulic properties from the hypres model by default, from the sand, silt, clay, humus and bulk density. Rainfed and irrigated runs on several textures show where irrigation pays. |
| Irrigation | Slow or fast irrigation: a constant water flux | 15.5, 15.18 | Daisy applies irrigation at a rate in mm/h, so a slow rate keeps the water in the topsoil and a fast one can run off or percolate. The rates below keep the same dose per irrigation, so only the speed of application differs. |
| Irrigation | Sensor depth against rooting depth | 28.39, 29.1, 72 | The tensiometer that triggers irrigation sits at one depth, while the roots take water from the whole root zone. A sensor above or below most of the roots triggers too early or too late; crossing the sensor depth with the rooting depth shows where it matters. |
| Nitrogen | When the fertiliser is applied and how much | 15.12, 15.3 | The fertilize action is placed on a date. Moving it two weeks earlier or later, at three doses, shows how much nitrate is exposed to the rain before the crop takes it up. |
| Climate | Warming with and without irrigation | 25.7, 15.5 | A warmer year raises the evapotranspiration and shortens the crop cycle. Warming of 0 to 3 degrees, rainfed and irrigated, shows how much of the loss irrigation can give back. |
| Nitrogen | Tillage and the time and form of the fertiliser | 15.3, 15.12 | The tillage action (plowing, rotavation, or none) mixes the residues and the topsoil; the fertiliser is taken from the fertilizer library by name, and the date can be moved. These three decide how much nitrate is exposed to leaching. |
| Climate | Evapotranspiration model and radiation | 25.7, 107.26 | Daisy can take the reference evapotranspiration from the weather file (FAO56) or compute it from the energy balance, and the radiation can be scaled. The runs show how much of the answer depends on that choice. |
| Climate | A dry summer, a dry spring or a wet winter | 103, 25.7 | The weather component can scale the precipitation month by month (twelve factors). Taking 30 percent of the rain from the summer or the spring, or adding 30 percent in the winter, shows which part of the year matters for yield and for leaching. |
| Chemicals | Sorption and half-life of a chemical | 23 | A chemical has a sorption coefficient (K_OC, L/kg) and a decomposition rate; the two decide whether it stays in the topsoil or reaches the depth where it is counted as leached. |
| Irrigation | Deficit irrigation: a water limit against the trigger | 15.5, 28.39 | A crop can be given a limited amount of water in the season, and irrigation starts only when the soil water pressure is below the trigger. A strict trigger with a small limit, against a lax trigger with a large limit, shows whether the same water gives more yield when it is saved for the dry spell. |
| Soil and crop | Rooting depth of the crop | 29.1, 72 | The crop model has a maximum rooting depth, which decides how much of the soil water and nitrate the roots can reach. Shallow to deep roots, rainfed and irrigated, show how much of a water shortage a deeper root zone absorbs. |
| Climate | The same farm under other climates | 103 | The weather component reads a file for one place. Running the same soil, crops and management with the weather of several places shows how much of the result belongs to the climate. |
| Nitrogen | Tillage against fertiliser form | 15.3, 15.12, 17 | The tillage action mixes residues and topsoil; the fertilizer library holds several forms of mineral nitrogen. Crossing the two shows whether the form of the nitrogen matters more under one tillage than another. |
| Parameters | The numerical settings of the bioclimate model (topic 19) | 19 | NoOfIntervals: Number of vertical intervals in which we partition the canopy; max svat iterations: Max number of svat iterations before giving up on cobvergence; max svat absolute difference [mm/h]: Maximum absolute difference in svat ea values for convergence. Each is varied from half to double the value the farm uses; NoOfIntervals moved the yield, water or nitrogen in the test. |
| Parameters | The groundwater and the aquitard below the profile: aquitard (topic 45) | 45 | K aquitard [cm/h]: Conductivity of the aquitard; Z aquitard [cm]: Thickness of the aquitard. The aquitard begins below the bottommost soil horizon. Each is varied from half to double the value the farm uses; K aquitard, Z aquitard moved the yield, water or nitrogen in the test. |
| Parameters | Turnover of organic matter and the mineral nitrogen it releases (topic 60) | 60 | K NH4 [h-1 ]: Maximal immobilization rate for ammonium; K NO3 [h-1 ]: Maximal immobilization rate for nitrate; CO2 threshold [h-1 ]: Turnover rate above which pools will contribute to 'CO2 fast'. Each is varied from half to double the value the farm uses; K NH4, K NO3, CO2 threshold moved the yield, water or nitrogen in the test. |
| Parameters | Water at the soil surface: runoff and evaporation (topic 87) | 87 | temperature change rate [h-1 ]: Relative change of surface temperature. If you set this to a negative value, surface temperature will reflect temperature of incomming water or ponded; EpFactor [dimensionless]: The autumn value can be lower, due to muching. With a crop factor of 1.2 a combined Kc of 1.15 is reached at LAI=5. See also [Kjaersgaard et al., 2008]; ReservoirConstant [h-1 ]: Fraction of ponding above DetentionCapacity that runoffs each hour. Each is varied from half to double the value the farm uses; temperature change rate, EpFactor, ReservoirConstant moved the yield, water or nitrogen in the test. |
| Parameters | The limits on the chemistry sink terms (topic 24) | 24 | max sink total [dimensionless]: Maximum allowed sink term as a fraction of total content. If variable timesteps are enabled, Daisy will try to scale down the timestep in; max sink solute [dimensionless]: Maximum allowed sink term as a fraction of solute content. If variable timesteps are enabled, Daisy will try to scale down the timestep; max sink secondary [dimensionless]: Maximum allowed sink term as a fraction of secondary domain content. If variable timesteps are enabled, Daisy will try to scale down the timestep. Each is varied from half to double the value the farm uses; none of them moved yield, water or nitrogen in the test, so the effect shows in the process itself. |
| Parameters | Pipe drainage (topic 37) | 37 | L [cm]: Distance between pipes; rad [cm]: Inner radius of drain pipes. Each is varied from half to double the value the farm uses; none of them moved yield, water or nitrogen in the test, so the effect shows in the process itself. |
| Parameters | The groundwater and the aquitard below the profile: static (topic 45) | 45 | table [cm]: Groundwater level. Positive numbers indicate free drainage. Each is varied from half to double the value the farm uses; none of them moved yield, water or nitrogen in the test, so the effect shows in the process itself. |

## The plan of each combination

### Overhead, surface or drip irrigation

Design: factorial. Factors: method with overhead, surface, drip; soil with usda:sand, loam.

### Irrigation and nitrogen together

Design: factorial. Factors: irrig with 0, 1; nfac with 0.5, 1, 1.25; soil with usda:sand, loam.

### When to irrigate: the trigger and the depth of the sensor

Design: factorial. Factors: trig with -150, -300, -600; z with 10, 30, 60; soil with usda:sand, loam.

### How much and how fast: dose and duration

Design: paired. Factors: mm with 10, 20, 30, 40; hours with 5, 10, 15, 20; soil with usda:sand, loam.

### Nitrogen fertiliser, irrigated and rainfed

Design: factorial. Factors: nfac with 0.5, 0.75, 1, 1.25; irrig with 0, 1; soil with usda:sand, loam.

### A drier, wetter or warmer year

Design: factorial. Factors: precip with 0.8, 1, 1.2; temp with 0, 2; soil with usda:sand, loam.

### The irrigation season and a limit on water

Design: factorial. Factors: window with {'label': 'Apr 1 minus Oct 1', 'set': {'w1': '04-01', 'w2': '10-01'}}, {'label': 'May 1 minus Oct 1', 'set': {'w1': '05-01', 'w2': '10-01'}}, {'label': 'Jun 1 minus Sep 1', 'set': {'w1': '06-01', 'w2': '09-01'}}; limit with 60, 120, 240; soil with usda:sand, loam.

### Which soil needs the most water

Design: factorial. Factors: soil with usda:sand, usda:sandyloam, loam, usda:siltloam, usda:clayloam; irrig with 0, 1.

### Slow or fast irrigation: a constant water flux

Design: factorial. Factors: flux with 0.1, 0.5, 2; soil with usda:sand, loam.

### Sensor depth against rooting depth

Design: factorial. Factors: z with 10, 30, 50; root with 40, 80, 120; soil with usda:sand, loam.

### When the fertiliser is applied and how much

Design: factorial. Factors: ntime with -14, 0, 14; nfac with 0.7, 1, 1.3; soil with usda:sand, loam.

### Warming with and without irrigation

Design: factorial. Factors: temp with 0, 1.5, 3; irrig with 0, 1; soil with usda:sand, loam.

### Tillage and the time and form of the fertiliser

Design: factorial. Factors: till with plowing, rotavation, none; ntime with -14, 0, 14; ntype with N25S, AmmoniumNitrate, Ammonia; soil with usda:sand, loam.

### Evapotranspiration model and radiation

Design: factorial. Factors: bio with auto, default; radscale with 0.9, 1, 1.1; soil with usda:sand, loam.

### A dry summer, a dry spring or a wet winter

Design: factorial. Factors: season with {'label': 'dry summer (rain x0.7 Jun-Aug)', 'set': {'pmonths': '1 1 1 1 1 0.7 0.7 0.7 1 1 1 1'}}, {'label': 'dry spring (rain x0.7 Mar-May)', 'set': {'pmonths': '1 1 0.7 0.7 0.7 1 1 1 1 1 1 1'}}, {'label': 'wet winter (rain x1.3 Dec-Feb)', 'set': {'pmonths': '1.3 1.3 1 1 1 1 1 1 1 1 1 1.3'}}; irrig with 0, 1; soil with usda:sand, loam.

### Sorption and half-life of a chemical

Design: factorial. Factors: koc with 0, 50, 500; half with 15, 90; soil with usda:sand, loam.

### Deficit irrigation: a water limit against the trigger

Design: factorial. Factors: trig with -150, -300, -600; limit with 60, 120, 240; soil with usda:sand, loam.

### Rooting depth of the crop

Design: factorial. Factors: root with 30, 60, 90, 120; irrig with 0, 1; soil with usda:sand, loam.

### The same farm under other climates

Design: factorial. Factors: station with course, it-bologna, dk-foulum; irrig with 0, 1; soil with usda:sand, loam.

### Tillage against fertiliser form

Design: factorial. Factors: till with plowing, rotavation, none; ntype with N25S, AmmoniumNitrate, Ammonia; soil with usda:sand, loam.

### The numerical settings of the bioclimate model (topic 19)

Design: oat. Factors: p_Bioclimate/NoOfIntervals with 15, 30, 60; p_Bioclimate/max_svat_iterations with 50, 100, 200; p_Bioclimate/max_svat_absolute_difference with 0.005, 0.01, 0.02.

### The groundwater and the aquitard below the profile: aquitard (topic 45)

Design: factorial. Factors: p_Groundwater/aquitard/K_aquitard with 0.0005, 0.001, 0.002; p_Groundwater/aquitard/Z_aquitard with 100, 200, 400.

### Turnover of organic matter and the mineral nitrogen it releases (topic 60)

Design: oat. Factors: p_OrganicMatter/original/K_NH4 with 0.01042, 0.02083, 0.04167; p_OrganicMatter/original/K_NO3 with 0.01042, 0.02083, 0.04167; p_OrganicMatter/original/CO2_threshold with 5e-05, 0.0001, 0.0002.

### Water at the soil surface: runoff and evaporation (topic 87)

Design: oat. Factors: p_Surface/temperature_change_rate with 0.25, 0.5, 1; p_Surface/EpFactor with 0.3, 0.6, 1.2; p_Surface/ReservoirConstant with 30, 60, 120.

### The limits on the chemistry sink terms (topic 24)

Design: oat. Factors: p_Chemistry/original/max_sink_total with 0.25, 0.5, 1; p_Chemistry/original/max_sink_solute with 0.45, 0.9, 1.8; p_Chemistry/original/max_sink_secondary with 0.75, 1.5, 3.

### Pipe drainage (topic 37)

Design: factorial. Factors: p_Drain/lateral/L with 900, 1800, 3600; p_Drain/lateral/rad with 1.75, 3.5, 7.

### The groundwater and the aquitard below the profile: static (topic 45)

Design: factorial. Factors: p_Groundwater/static/table with 0.5, 1, 2.

