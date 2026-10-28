## Deterministic phenotyping layer

### What the layer is

**P1 Deterministic phenotyping** (its own group *Phenotyping*, the last in the list of layers, button *Deterministic phenotyping*) is a virtual phenotyping experiment. One plant of the chosen crop grows day by day for 140 days after emergence in the soil, tillage, weather and rain of the project, twice, side by side: **well-watered** and **drought**. Everything the books on phenotyping let a person measure with a camera, a thermal camera, an X-ray scanner or a rhizotron is read from the simulated plant, and it can be moved: the day is chosen with the play bar or by clicking or dragging on any chart, and the plant and its roots are turned with the mouse.

The layer is **deterministic**. It has no random numbers: the same controls always give the same plant, so a change in a chart is always caused by the control that was moved. The weather of the season is built from the climate of the project (cool and humid), a warm season, or a hot and dry season, with the project rain or a rain-out shelter.

The layer is **connected to the Properties panel**: the crop and its library values (height, basal coefficient, rooting depth, sowing day), the soil, the weather and the date, the mulch (vapour-flux factor and interception), the irrigation (method, trigger suction, sensor depth, dose and efficiency), the nitrogen rate and the salt of the water all reach the plant. The **date of the toolbar** (the date control that also drives the soil trigger, set to today when the program opens) sets the season: the plant, the weather of that season, the day shown and the **drought outlook** all follow it, and changing the date computes the layer again without pressing the button. The header shows the date, and the time of day when the date is today (the model itself steps by whole days). Nothing is shown before it is computed: the layer opens with **Run simulation**, and it shows no default figure.

The layer is made for four tasks of a phenotyping programme:

1. **Quantify temporal changes in plant structure and function**: height, projected shoot area, convex hull, solidity, senescence, leaf water content, leaf potential, canopy temperature and root traits, each as a curve through the season and as a table of readouts.
2. **Investigate the relations between photosynthetic carbon assimilation, carbon allocation and the growth of roots and shoots**: the carbon section.
3. **Relate root development and stress responses to what is seen above ground**: the section *Roots from the plant above ground*, with twelve genotypes run under the same drought.
4. **Contribute experimental data to the parameterisation and validation of functional-structural plant models**: your own measurements can be loaded, compared, used to calibrate the model and exported.

*Provenance of the layer:* the forms of the equations are from the literature listed in the section *Equations* of this chapter. The two books that were the starting point define the **traits** (what is measured and how it is calculated); they do not give growth equations. The constants of the four species and the seven genotypes are typical, editable defaults of this layer. They are not data of an experiment, and no figure of this chapter is a measurement: each figure is the screen of the layer for the run named in its caption.

### The controls

![Set up the experiment. Maize, warm season, rain-out shelter, pulse of drought from day 40 for 28 days at 30 % of the plant-available water, reference genotype, Coarse Loam, conventional tillage.](images/pheno/p1_setup.png){width=85%}

**Run simulation.** The button is **under the inputs**, after the last control of the section *Set up the experiment* (the other layers of the window, whose inputs are in the Properties panel, have their own **Run simulation** bar at the top, Chapter 18). A layer shows its figures only after the button is pressed for the present controls; when a control changes, the bar asks to run again. The Play button of the toolbar does the same. **Every section of the layer has a triangle on its title: click it to collapse or expand the section**, so that a long page can be read part by part.

Once run, every control re-runs the model, and every chart answers it.

| Control | What it changes in the model |
|---|---|
| Crop (a box with all the crops of the library, scrolled with the wheel or the bar; it sets the crop of the project) | height, basal crop coefficient and rooting depth of the crop of the library (Eq. P.15); the crop is run as the model species nearest in kind |
| Modelled as (maize, sorghum, wheat, common bean) | thermal time, leaf number, radiation use, light extinction, height, root axes, stomatal and turgor constants |
| Genotype (reference, deep rooting, shallow and dense, stay-green, water saver, water spender, osmotic adjuster) | angle of the axes, lateral density, stay-green, stomatal threshold, osmotic adjustment, hydraulic resistance, carbon to roots |
| Drought (pulse and recovery, terminal, intermittent, none) | the water that the drought treatment is held at, in time |
| Season starts | the first day of the season: automatic, the planting day of the project, or the date of the toolbar (the section *Drought stress calendar* explains each) |
| Climate and rain | temperature, radiation, vapour pressure deficit, reference evapotranspiration, rain |
| Left plant (project irrigation, well-watered bench, rainfed) | the treatment of the left plant: the irrigation of the project made by the sensor rule, a bench held wet, or the rain only; the right plant is always the drought |
| Drought starts, length, water held | day of onset, duration and the level of the stress, in per cent of the plant-available water (defaults 45 days, 35 days, 15 %) |
| Extra warming | temperature added to the whole season |
| Root angle, lateral root density, root vigour, carbon share to roots | root system architecture and the carbon it receives |
| Stay-green, stomata close at, osmotic adjustment | senescence delay, the leaf potential at which half of the stomatal opening is lost, the turgor kept in dry soil |
| Growing area per plant | the ground area of one plant, which sets the leaf area index, the light caught and the water of the column |

The **soil, the tillage and the consolidation rate** are those of the project (the V3 layer): the bulk density, the strength of the soil and therefore the growth of the roots follow the soil texture, the tillage system and the structural consolidation rate (Eq. 8.1).

### Plant and roots, side by side

![Plant and roots on day 62 (2 July) in the camera view: the shoot with the leaves of the model, the soil column with the root system of the same day. Left well-watered, right drought.](images/pheno/p2_twin_rgb.png){width=85%}

The shoot is a life-like rendering of the simulation, not a photograph: blades with a shaded surface, midrib and veins, leaf sheaths and nodes on the stem, wheat with its tillers, and the ear of maize, the spike of wheat, the panicle of sorghum or the pods of the bean, which fill as the grain mass of the model grows. Leaves that wilt (low water content) droop and pale, and the senescent part of a blade turns yellow and then brown from the tip. The arch of the leaves of maize and sorghum is drawn a little wider than the model's own geometry so that the blades can be seen; the numbers do not change. The picture is drawn from the leaf geometry of the model: each leaf has an insertion height, an azimuth, an elevation, a length, a width and a stay-green fraction, so the **projected shoot area**, the **convex hull** and the **solidity** that are printed above the plants are those of what is drawn. The roots are the segments of the root architecture model grown up to the day, turned by the rotation of the view. Four views show the same plant:

* **Camera (RGB)**: green leaves that turn brown with senescence, roots as a rhizotron sees them.
* **Thermal camera**: each leaf has the temperature of its energy balance, from 4 K below to 10 K above the air.
* **X-ray tomography**: roots in white as a scanner shows them.
* **Soil water**: the relative plant-available water of each layer with the roots on it.

![Thermal camera view of the same day. The drought plant is warmer, its leaves are redder and the soil on its side is drier.](images/pheno/p2_twin_thermal.png){width=85%}

![X-ray view of the same day.](images/pheno/p2_twin_xray.png){width=85%}

![Soil water view of the same day: the plant-available water of every 15 cm layer (blue is at field capacity, brown is dry) with the roots.](images/pheno/p2_twin_soil.png){width=85%}

The **root scans through the season** show the drought plant (or the well-watered plant, by the two chips) on four days: at the top the scanner image of the root system, at the bottom the reconstruction with the first order axes, the second order laterals and the soil volume.

![Root scans of the drought plant on days 35, 70, 104 and 139.](images/pheno/p3_scans.png){width=85%}

### Season film, from sowing to maturity

![The season film: both plants and their roots on eight dates from sowing to maturity, with the time series below. Wheat, project climate, day 62 marked.](images/pheno/p2b_film.png){width=85%}

The section shows the whole life of the two plants at once. Two rows of eight pictures (the project plant above, the drought plant below) show the shoot and the roots on days 0, 20, 40, 60, 79, 99, 119 and 139 after emergence, each with its date, at one common scale, so that the growth can be compared from picture to picture. The picture nearest to the day shown has a blue frame; click a picture to go to that day. **Play the season** grows both plants from the first day to the last (the speeds are *Slow*, *Normal* and *Fast*: 28, 14 and 6 seconds for the season); **Pause** stops, and **Start** returns to the first day. Below the pictures, six time series (plant height, projected shoot area, green leaf area index, root depth, leaf water content and the water of the root zone) run through the whole season for both plants. Each line is solid up to the day shown and faint after it, with the stress and recovery bands behind them; click or drag on any chart to move the day.

### Traits through time

![Traits through time, four sets (shoot, water status, carbon, roots). The coloured bands are the stress (orange) and the recovery (blue); the dashed line is the day shown; the values at the right are well-watered / drought of that day.](images/pheno/p4_series.png){width=85%}

Click or drag on any chart to move the day. The four sets are:

* **Shoot**: plant height, projected shoot area, solidity, senescence index.
* **Water status**: leaf water potential, relative water content, stomatal conductance, canopy temperature depression, crop water stress index.
* **Carbon**: assimilation, the share to roots, dry mass.
* **Roots**: root length, depth, the depths of 50 % and 95 % of the length.

The observations that you load are drawn on the same charts as squares.

### Water: demand, supply and where the roots take it

![Water: transpiration, soil evaporation, rain and water applied, the plant-available water of every layer with the front of the roots, and the water taken by each layer.](images/pheno/p5_water.png){width=85%}

The top chart shows what the canopy asks for (the potential transpiration), what it transpires in each treatment and what the soil surface loses. The two heat maps show the plant-available water of each layer through the season with the root front as a white line; the bars at the right show how much each layer gave on the day. The table gives the season totals of transpiration, soil evaporation, water in and drainage below 1.2 m, so that the water balance of every treatment is closed. In this run the well-watered plant transpired 334 mm and the drought plant 237 mm.

The path of the water is the one of the soil-plant-atmosphere chain. The uptake of a layer is its conductance (root length, fine roots, hydraulic conductivity of the soil at its water content) times the potential difference between the soil and the root collar. The collar potential is solved every day so that the layers together give the demand; when the soil dries, the conductivities fall, the leaf potential falls, the stomata close and the canopy warms. This chain is the reason why the thermal camera and the leaf water content respond to the drought before the height does.

### Carbon: assimilation, allocation, root and shoot growth

![Carbon: dry mass of roots, leaves, stems and reserves, and grain for both treatments; the assimilation against the growth of the roots; and the delay between them.](images/pheno/p6_carbon.png){width=85%}

The upper charts stack the dry mass of the plant parts. The lower left chart draws the daily **assimilation** as bars and the **growth of the root length** as a line. The lower right chart is the correlation between the fluctuation of the daily root growth and the assimilation of the days before, with the delay on the x axis: a bar at one day means that the carbon of one day gives roots one day later. In this run the best delay is one day in both treatments (r = 0.84 for the well-watered plant and 0.70 for the drought plant).

The carbon of the roots is a share of the daily growth. The share rises when the water is short (the functional equilibrium of Brouwer, 1963, and Davidson, 1969), the share of the leaves follows the stage, and the grain is filled after flowering. The root system of the model uses the carbon that arrives, so a day with little light gives a smaller root growth the next day. The ratio of the root mass to the shoot mass is printed under the charts (0.19 and 0.26 on day 70).

### Soil structure and tillage: what the root tips meet

![Bulk density, penetration resistance and root length density by depth.](images/pheno/p7_soil.png){width=85%}

The soil of the layer is the soil of the project. The **bulk density** of each 15 cm layer follows the texture and the tillage: the topsoil is loosened by tillage and settles with the consolidation rate of the V3 layer, and a plough pan lies below the working depth. The **penetration resistance** $Q$ rises steeply with the density and rises further when the soil is dry; the elongation of a root tip is reduced by a factor that falls from 1 to 0 around $Q = 2.5$ MPa. The right chart shows where the root length ends up. A change of the tillage, of the consolidation rate or of the soil changes the depth reached by 95 % of the roots (D95), and with it the water that the plant can use.

### Roots from the plant above ground

![Twelve genotypes run under the same drought. Each plot relates one shoot trait to the root trait chosen above it, the lower chart shows how well each shoot trait predicts the roots day by day, and the table gives the drought tolerance of the twelve genotypes.](images/pheno/p8_above.png){width=85%}

The panel runs twelve genotypes (angle of the axes 26, 44 and 62 degrees, vigour 0.8 and 1.2, stay-green 0.1 and 0.7; all other traits as in the reference) under the drought that is set, and relates **a root trait** (depth of 95 % of the roots, root length, share of the roots below 60 cm, or grain mass) to **four shoot traits** that a camera sees: canopy temperature depression, senescence index, relative water content and projected shoot area. The red diamond is the plant of the layer, estimated from its own shoot trait with the regression of the panel and compared with the model. The lower chart is the share of the variation explained by each shoot trait on each day ($r^2$): it shows **when** a measurement taken above ground carries information about the roots. In this run, on day 70, the projected shoot area is the best trait for the depth of the roots ($r^2$ = 0.86), measured as the mean of a window of five days around the day.

The table gives the **drought susceptibility index** of Fischer and Maurer (1978) and the **stress tolerance index** of Fernandez (1992) of the twelve genotypes, computed from their grain mass with and without stress.

### Roots day by day

![The profile of the chosen day and the roots through the season. Wheat, project climate, day 70.](images/pheno/p3b_rootday.png){width=85%}

For the chosen day the section draws the **root length density by depth** of the two plants (bars), the water of each layer (blue strip) and the depth of 95 % of the roots (dashed line). Six series follow the roots through the season, each with a cursor on the day: the root length of the plant, the deepest root tip, the depth of 95 % of the root length (D95), the growth of the roots per day, the share of the carbon that goes to the roots, and the root to shoot ratio. Click or drag on any chart to move the day; the numbers on the right of each title are the two plants on that day. The sentence under the charts reads the day: the root length, depth and growth of both plants, the new carbon they received, and the shoot measurements of the same day.

### Phenotype and genotype: prediction

![The predicted phenotype of each genotype under the drought, and the genotype called from the plant above ground. Wheat, project climate, reference genotype.](images/pheno/p8b_genome.png){width=85%}

The section has two parts. **1. Predicted phenotype**: every genotype of the library is run under the same weather, soil and drought; the table gives height, shoot area, grain, D95, root length, water use efficiency and the tolerance (grain under drought divided by grain of the left plant). **2. Genotype called from the plant above ground**: the genotype of the plant is hidden, five traits of the shoot (height, area, senescence, leaf water content and canopy temperature depression through the days) are compared with the same traits of each genotype, and the bars give the weight of each genotype (Eq. P.21). The genetic constants of the called genotype (root angle, lateral density, stay-green, stomatal threshold, osmotic adjustment, carbon to roots) and the roots predicted below ground follow. When measurements are loaded (section *Your measurements*), they replace the model plant as the thing that is called. The call is a ranking of the library, not a genome sequence: the layer predicts the **genotype of the library** (the set of trait constants) and its phenotype.

### SWAFL data: the Daisy runs of the project against this plant

![The plant against the Daisy runs of the soil and controls of the project, after the fit. Wheat, project climate.](images/pheno/p10_swafl.png){width=85%}

The repository holds 10,190 Daisy simulations (*Data/Comprehensive_Summary*). The section compares the plant with the runs of the soil and the controls of the project, in terms that do not depend on the length of the season: the **relative yield** (share of the best yield of the soil, from the trigger experiment E2), the **transpiration share** of the evapotranspiration, and the **effect of the mulch on soil evaporation** (E7 and E14, 1000 runs of mulch, rain and capacity). The three charts are the nitrogen response (E13, which gives the nitrogen factor of the plant), the trigger response (E2, with the plant as green dots) and the mulch and rain runs (E14). **Fit the plant to the SWAFL data** searches the radiation use efficiency, the water use coefficient and the root conductance (a coordinate search of at most 45 runs, within 0.6 to 1.6, 0.5 to 2.2 and 0.25 to 4 times the species values) that minimise the squared difference to the three numbers and to the E2 curve (Eq. P.20). **Reset the fit** returns to the species constants. The fit is a calibration to the Daisy tables: the plant is a different model, and for a climate far from that of the Daisy runs (the warm season, for example) the agreement is weaker; the comparison is most meaningful in the project climate with the archetype nearest to the crop. When a limit of the search is reached the message says so.

### Quantified traits of the run

![The readouts of a phenotyping experiment for the two treatments, with the change under drought.](images/pheno/p9_traits.png){width=85%}

The table lists 26 traits: the final height, the largest projected shoot area, the day the shoot area reaches half of its largest, the fastest relative growth of the shoot area, the fastest biomass gain, the largest green leaf area index, the stay-green day, the green leaf area over the season, the lowest leaf water content and potential and the highest crop water stress index in the stress period, the canopy temperature depression of the stress period, the water used (transpiration, soil evaporation, water in), dry mass, grain, harvest index, transpiration efficiency, water use efficiency, root depth and length, the depths of 50 % and 95 % of the root length, the share of roots below 60 cm and the root to shoot ratio. The column *change* is the relative change under drought, or the difference when the value of the well-watered plant is small.

### Drought outlook from the date of the toolbar

![The drought outlook on 15 June 2026, day 45 after emergence. Wheat, project climate, model weather (no weather file imported), after the fit to the SWAFL data.](images/pheno/p11_outlook.png){width=85%}

This section is a second drought experiment, tied to the calendar. The first (*Traits through time*) holds the right plant at a set level of water for a set time. The outlook instead lets the plant take the rain that falls: it grows the plant from sowing to **the date in the toolbar** (the *Date* control, with *Today*), and then to maturity on three futures. Change the date and the section is computed again.

**What the screen shows.**

1. The header gives the date, the day after emergence, and the weather used: how many days of the season are recorded, how many are the days of the forecast, and how many are a future. For the future, it names the three years of the record that were used.
2. Three charts run over the whole season, each with a dashed line on the date. The black line is the season up to the date; the red, blue and green lines are the dry, typical and wet futures. The light blue band marks the days of the forecast. The first chart is the **water of the root zone** (per cent of the plant-available water of the layers that the roots have reached) with the stress level $1-p$ of FAO-56; the second is the **plant response** $T_{act}/T_p$ averaged over seven days; the third is the **rain from the date**, added up.
3. A table for the rainfed plant gives, for each future, the rain to maturity, the rain of the next 14 days, the days with the root zone below the stress level, the lowest root zone water, the grain, the share of the grain of the irrigated plant, and the **drought risk** (low, moderate, high or severe; Eq. P.26).
4. A second table gives the plant irrigated by the rule of the project (method, trigger, sensor depth, dose and efficiency of the Properties panel) under the same weather: the date and depth of the next watering, the number of waterings and the water to maturity, the grain, and its share of the grain of a plant held well watered.
5. A paragraph in words reads the result for the date, including the first day on which the root zone of the dry future falls below the stress level, and the next watering.

**The two buttons.** *Show this date in the plant* moves the day of every other section (the plant and roots, the roots day by day, the traits) to the date of the toolbar. *Start the drought pulse on this date* makes the held-water drought of the first experiment begin on the date of the toolbar. Opening the layer also shows the day of the date when the date falls inside the season, so that the plant and its roots are those of the day.

**Where the weather comes from.** With an imported weather (*Tools*, a file or the online weather of the farm) the days up to the date are the recorded rain, evapotranspiration and temperature; the days that follow are the forecast rows when they exist (the online weather brings 16 days), and then the future years (Eq. P.24 and P.25). Without an imported weather the layer uses the model weather of the project climate, with no record and no forecast, and the three futures differ by the rain only (0.4, 1 and 1.6 times). The text of the header says which case applies.

**What it is and is not.** The three futures are real years of the weather record placed after the date, so each keeps the dry spells and the evaporative demand of that year. They show what a dry, an ordinary and a wet rest of the season would do to this plant; they are not a forecast of the weather. The risk class depends on the root conductance of the model: run **Fit the plant to the SWAFL data** first (section *SWAFL data*), because with the default constants the model plant is limited by the flow of water into the root more than by the water of the soil, and the grain of the rainfed plant then changes little with the rain. In the figure the fit was run before the capture.

### Drought stress calendar: dates and what it does to the roots

![The drought stress calendar of the rainfed wheat plant on the typical future, from 1 May 2026. The dark line is the date of the toolbar.](images/pheno/p12_stress.png){width=85%}

This section turns the outlook into a calendar. It answers two questions for the plant of the project: **on which dates is it in drought stress**, and **what does that do to its roots**. It uses the same season, weather, soil and Properties inputs as the rest of the layer, so it changes when the date of the toolbar, the weather, the soil, the crop or the irrigation of the project changes.

**What the screen shows.**

1. Two rows of chips choose the plant (the rainfed plant, or the plant irrigated by the rule of the project) and the future after the date of the toolbar (dry, typical or wet).
2. Three bars, one for each future, run over the whole season and carry the dates on their axis. A red part is a period of drought stress that is still ahead, a grey part is a period that has passed, and the dark line is the date of the toolbar. The bar of the chosen future has a dark frame.
3. A table lists every period of drought stress of the chosen future with its **dates** (from and to, and "now" when the period is under way on the date of the toolbar), its length in days, the **growth stage** (vegetative, flowering or grain filling), the lowest water of the root zone, the mean ratio of transpiration to demand ($T/T_p$), and four readings of what the roots suffer: the root length they grow in the period against the roots of a well watered plant under the same weather, the depth of the roots at the end of the period against that plant (a minus sign is shallower, a plus sign deeper), and the share of the root length that sits in layers holding less than half of their plant-available water on the driest day of the period. The colour of the first column tells past (grey), now (orange) and ahead (red).
4. A paragraph in words reads the result: the number of days and of periods, the next period and how many days away it is, and the worst period with its dates and its effect on the roots.

**How a period is found.** A day is a day of stress when the water of the root zone is below the level at which transpiration starts to fall (Eq. P.26). Days of stress that are no more than two days apart form one period, and a period shorter than two days is dropped (Eq. P.27). Each period is compared with a **well watered bench plant** that is grown on the same weather, so the difference in the roots is the effect of the water and not of the weather (Eq. P.28).

**Where the dates come from.** The first day of the season is set by the control *Season starts* in the section *Set up the experiment*. *Automatic* uses the planting day of the Properties panel when the date of the toolbar falls inside that season, and otherwise sows on the date of the toolbar, so that the calendar always starts on a real date and reaches maturity after it. *Planting day of the project* always uses the planting day of the Properties panel, so the season can lie wholly in the past or wholly ahead. *On the date of the toolbar* sows on that date. Every chart of the layer has its dates on the horizontal axis and a dark line on the date of the toolbar, and the dates of the table are those of the same calendar. The days up to the date of the toolbar use the recorded weather when a weather file or the online weather is loaded (*Tools*); the days after it use the forecast and then the three futures of the outlook.

**Reading the roots.** In the figure the roots of the rainfed plant grow as much as or more than the watered roots during the first periods, because a plant in dry soil sends a larger share of its carbon to the roots and so keeps growing downwards, but in the last periods, after grain filling has begun, they make no growth at all with or without water. The share of the root length in dry layers is high from the first period, because the top layers dry first and most of the roots are there. These are the results of the model with the constants of the species; they are not measurements.

### Your measurements: compare, calibrate and export

The last section brings experimental data to the model:

* **Load observations (CSV)**: a file with the column `day` (days after emergence), a column `treatment` (`ww` or `dr`) and any of `height`, `area`, `solidity`, `senescence`, `rwc`, `ctd`. **Download a template** writes an empty file with the columns that are read. The points appear as squares in the time series.
* The table of **errors** gives for each trait and treatment the number of points, the root mean square error, the bias and the Nash and Sutcliffe efficiency.
* **Calibrate the model** searches the radiation use efficiency, the stomatal threshold and the stay-green delay that reduce the squared error of all loaded traits (a coordinate search, one model run per frame, at most 40 runs). **Reset calibration** returns to the values of the genotype.
* **Export the results (CSV)** writes the daily traits of both treatments (height, area, solidity, senescence, water content and potential, canopy temperature depression, crop water stress index, leaf area, assimilation, root share, root depth and length, D95, transpiration and soil evaporation), as input for a functional-structural plant model or for a statistical package.

### Moving about the layer

A bar of buttons stays at the top of the window while the page is scrolled (*Set up*, *Plants*, *Season film*, *Roots by day*, *Root scans*, *Traits*, *Water*, *Carbon*, *Soil*, *Roots and shoot*, *Genotype*, *Trait table*, *SWAFL data*, *Outlook*, *Stress calendar*, and *My data*). A button jumps to its section, and the section at the top of the window is marked. The title of every section has a triangle: click it to collapse or expand the section, or use *Collapse all* and *Expand all* at the top. The text of a hint never runs off the edge of the window: a long hint is cut into lines.

### Equations

The section The layer shows no equations on the screen: they are all in this manual, numbered P.1 to P.28 in the order in which the model uses them on each day. This section explains each one: what it computes, the symbols and their units, where its result appears in the layer, and where it comes from. The model is deterministic: it contains no random numbers. A table at the end of the section gives the index. Symbols: $d$ day after emergence, $T$ air temperature (°C), $\mathrm{LAI}$ leaf area index (m² m⁻²), $\psi$ water potential (MPa or cm of suction as stated), $T_p$ potential transpiration (mm d⁻¹), $z$ depth (cm), $\Delta z=15$ cm the thickness of a soil layer, $N=140$ days.

#### Development, weather and light (P.1 to P.5)

**P.1 Thermal time.** The development of the plant is measured in degree days, not in calendar days:

$$
d_g=\max\bigl(0,\;\min(T,\;T_{opt}+6)-T_{base}\bigr),\qquad \mathrm{GDD}(d)=\sum_{i\le d}d_g(i).
\tag{P.1}
$$

$T_{base}$ and $T_{opt}$ are the base and optimum temperatures of the species (maize 8 and 30, wheat 0 and 20, bean 10 and 25 °C). The stage is $\mathrm{GDD}/\mathrm{GDD}_{flowering}$ before flowering and $\mathrm{GDD}/\mathrm{GDD}_{maturity}$ after it. It sets the leaf number, the start of grain filling and the end of the season. *Appears in:* the stage and the leaf count of every chart. *Source:* the degree-day method in common use in crop models (Ritchie and NeSmith, 1991).

**P.2 Weather of the day.** The reference evapotranspiration of the day is that of FAO-56 (Allen et al., 1998):

$$
\mathrm{ET}_0=\frac{0.408\,\Delta\,(R_n-G)+\gamma\,\dfrac{900}{T+273}\,u_2\,(e_s-e_a)}{\Delta+\gamma\,(1+0.34\,u_2)} .
\tag{P.2}
$$

$\Delta$ is the slope of the saturation vapour pressure curve (kPa °C⁻¹), $R_n$ the net radiation (MJ m⁻² d⁻¹), $G$ the soil heat flux (taken as zero on a daily step), $\gamma$ the psychrometric constant (kPa °C⁻¹), $u_2$ the wind at 2 m (m s⁻¹), and $e_s-e_a$ the vapour pressure deficit (kPa). The temperature, radiation and rain of the day come from the climate chosen in the layer (a sum of sines on the climate of the project) or from the imported weather (days of a file or of the online weather). With imported days, $\mathrm{ET}_0$ and the mean temperature are those of the file, plus the extra warming set in the layer. *Appears in:* every water chart, the demand curve, the canopy temperature and the outlook.

**P.3 Light interception.** The share of the light that the canopy catches follows Monsi and Saeki (1953):

$$
f_i=1-e^{-k\,\mathrm{LAI}}.
\tag{P.3}
$$

$k$ is the light extinction coefficient of the species (0.5 to 0.65). *Appears in:* the carbon section and the leaf area charts.

**P.4 Biomass from light.** The dry matter made on a day is limited by the light caught (Monteith, 1977):

$$
dW_{rad}=\mathrm{RUE}\;f_T\;f_N\;f_{sal}\;\mathrm{PAR}\;f_i .
\tag{P.4}
$$

$\mathrm{RUE}$ is the radiation use efficiency (g MJ⁻¹ of PAR), $f_T$ the beta temperature function of Yin et al. (1995) of the species, $f_N$ the nitrogen factor (P.18), $f_{sal}$ the salt factor (P.19), and $\mathrm{PAR}$ the photosynthetically active radiation of the day (MJ m⁻²). The fit to the SWAFL data (P.20) multiplies $\mathrm{RUE}$ by a factor between 0.6 and 1.6.

**P.5 Biomass from water.** The dry matter is also limited by the water that the plant transpires (Tanner and Sinclair, 1983):

$$
dW_{wat}=\frac{k_{te}}{\mathrm{VPD}}\,T_{act},\qquad dW=\min\bigl(dW_{rad},\,dW_{wat}\bigr).
\tag{P.5}
$$

$k_{te}$ is the transpiration efficiency coefficient of the species (Pa, 5.5 to 10), $\mathrm{VPD}$ the mean vapour pressure deficit of the day and $T_{act}$ the transpiration of the day (mm). Growth is the smaller of the two. *Appears in:* the carbon section and the traits (dry mass, transpiration efficiency).

#### Soil, water and the root (P.6 to P.10)

**P.6 Soil water.** The soil of the project is divided into eight layers of 15 cm (120 cm in all). The retention curve and the conductivity are the van Genuchten (1980) and Mualem functions:

$$
\theta(h)=\theta_r+\frac{\theta_s-\theta_r}{\bigl[1+(\alpha h)^n\bigr]^{m}},\qquad K(\theta)=K_s\,S_e^{\,l}\Bigl[1-\bigl(1-S_e^{1/m}\bigr)^m\Bigr]^2,\qquad m=1-\frac1n .
\tag{P.6}
$$

$\theta_r,\theta_s$ are the residual and saturated water contents, $\alpha$ and $n$ the shape parameters of the soil of the project, $K_s$ the saturated conductivity, $S_e$ the relative saturation and $l=0.5$. Soil evaporation has two stages after Ritchie (1972): at the potential rate while the surface is wet, then in proportion to the square root of time. Water that infiltrates fills a layer to field capacity and passes the excess to the next one; the excess of the last layer is the drainage. *Appears in:* the water heat maps and the water balance.

**P.7 Root water uptake.** Each layer gives water in proportion to the root length it holds and to the difference between its water potential and that of the root (Gardner, 1960; Feddes et al., 1978):

$$
S(z)=G(z)\,\bigl(\psi_{soil}(z)-\psi_{root}\bigr),\qquad G(z)=L_{root}(z)\,f_{fine}\,K(h)\,q_G,\qquad \sum_z S(z)=T_p\,g_s .
\tag{P.7}
$$

$L_{root}$ is the root length of the layer (cm), $f_{fine}$ the share of fine roots, $K(h)$ the conductivity of the soil at its suction, and $q_G$ the conductance of the root surface (default 0.1; the fit to the SWAFL data may change it by 0.25 to 4 times). The root potential $\psi_{root}$ is found every day by bisection so that the uptake equals the demand $T_p\,g_s$. The reduction of uptake by wet and dry soil follows the stress function of Feddes. *Appears in:* the bars at the right of the water section and the root water of the layers.

**P.8 Leaf water.** The leaf potential follows from the flow through the plant (van den Honert, 1948), and the leaf water content from the pressure and volume curve:

$$
\psi_{leaf}=\psi_{root}-r\,\frac{T_{act}}{\mathrm{LAI}},\qquad \psi=\frac{\pi_0}{\mathrm{RWC}}+P(\mathrm{RWC}),\qquad P(\mathrm{RWC})=-\pi_0\,\frac{\mathrm{RWC}-\mathrm{RWC}_{tlp}}{1-\mathrm{RWC}_{tlp}} .
\tag{P.8}
$$

$r$ is the hydraulic resistance of the plant (set by the genotype), $\pi_0$ the osmotic potential at full turgor (lowered by the osmotic adjustment), $\mathrm{RWC}$ the relative water content and $\mathrm{RWC}_{tlp}$ the content at which turgor is lost. The second equation is solved for $\mathrm{RWC}$ from $\psi_{leaf}$. *Appears in:* the water status traits (leaf potential, water content, turgor).

**P.9 Stomata.** The stomatal opening is a logistic function of the leaf potential (Jarvis, 1976):

$$
g_s=\frac{1}{1+e^{-b\,(\psi_{leaf}-\psi_{50})}} .
\tag{P.9}
$$

$\psi_{50}$ is the leaf potential at which half of the opening is lost (the control *Stomata close at*) and $b$ the steepness. The transpiration demand is multiplied by $g_s$. A genotype that closes its stomata early (the *water saver*) has a $\psi_{50}$ closer to zero.

**P.10 Expansion.** The growth of the leaf area and of the height is proportional to the turgor above a yield threshold (Lockhart, 1965):

$$
\frac{1}{V}\frac{dV}{dt}=\phi\,\max(0,\,P-Y).
\tag{P.10}
$$

$V$ is the area (or the height), $P$ the turgor pressure (MPa), $Y$ the yield threshold and $\phi$ the extensibility. Because $P$ falls before photosynthesis does, expansion slows first, which is why the shoot area and the height slow before the carbon gain does.

#### Temperature, carbon and the root system (P.11 to P.14)

**P.11 Canopy temperature.** From the energy balance of the leaf (Jackson et al., 1981):

$$
T_c-T_a=\frac{r_a R_n}{\rho c_p}\,\frac{\gamma^*}{\Delta+\gamma^*}-\frac{\mathrm{VPD}}{\Delta+\gamma^*},\qquad \gamma^*=\gamma\Bigl(1+\frac{r_c}{r_a}\Bigr),\qquad \mathrm{CWSI}=\frac{dT-dT_{low}}{dT_{up}-dT_{low}} .
\tag{P.11}
$$

$T_c$ is the canopy and $T_a$ the air temperature, $r_a$ and $r_c$ the aerodynamic and canopy resistances (s m⁻¹; $r_c$ rises when the stomata close), $\rho c_p$ the volumetric heat capacity of air, and $dT=T_c-T_a$. The lower limit $dT_{low}$ is that of a fully transpiring canopy and the upper limit $dT_{up}$ that of a non-transpiring one. The canopy temperature depression is $T_a-T_c$. *Appears in:* the thermal view, the canopy temperature depression and the crop water stress index.

**P.12 Carbon allocation.** The carbon made is shared between leaf, stem, root and grain. The share to the roots rises when water is short and falls with the stage (functional equilibrium: Brouwer, 1963; Davidson, 1969):

$$
f_r=\mathrm{clip}\Bigl[\bigl(f_{r0}+(f_{rA}-f_{r0})\,\mathrm{stage}\bigr)\,c_{root}\,\bigl(1+0.9\,w_s\bigr),\;0.03,\;0.7\Bigr],\qquad w_s=1-\frac{T_{act}}{T_p}.
\tag{P.12}
$$

$f_{r0}$ and $f_{rA}$ are the share of the species at emergence and at flowering (wheat 0.42 and 0.07), $w_s$ the water stress of the day (0 when the plant transpires what it demands), and $c_{root}$ the control *Carbon share to roots* times the genotype. The shoot takes the rest; after flowering the grain is filled from the new carbon and from the reserves of the stem. *Appears in:* the carbon section and the root to shoot ratio.

**P.13 Root architecture.** The roots are built with the rules of ArchiSimple (Pagès et al., 2014): axes leave at the set angle with gravitropism; laterals of the first and of the second order leave at a density per cm; each tip grows at a rate set by soil temperature, soil strength (P.14) and soil water, and the carbon share (P.12) sets how much root there is to build:

$$
\frac{dl}{dt}=e_0\;2^{(T_s-20)/10}\;\frac{e}{e_0}(Q)\;f_w\;f_{age},\qquad f_w=\mathrm{clip}\Bigl(\frac{\theta_{rel}-0.06}{0.5},\,0.05,\,1\Bigr).
\tag{P.13}
$$

where $e_0$ is the elongation rate of the axis or lateral (cm d⁻¹, from the species and the genotype), $T_s$ the soil temperature (°C, factor limited to 0.05 to 1.8), $e/e_0$ the relative elongation of P.14 at the layer of the tip, $\theta_{rel}$ the relative plant-available water of the layer, and $f_{age}$ a slowing with the age of the tip. The result is the root length, the depth, the depths of 50 % and 95 % of the length, and the three-dimensional picture of the scan. *Appears in:* the root scans and the roots day by day.

**P.14 Soil strength.** The resistance that a root tip meets, and the relative elongation that remains, are

$$
Q=0.5\,e^{4.5\,(\rho_b-1.3)}\,\bigl(1+(1-S)\bigr),\qquad \frac{e}{e_0}=\frac{1}{1+(Q/2.5)^3} .
\tag{P.14}
$$

$\rho_b$ is the bulk density (g cm⁻³) of the layer, set by the texture, the tillage and the consolidation rate of the V3 layer; $S$ is the relative water content of the layer and $Q$ the resistance in MPa. At $Q=2.5$ MPa the elongation is halved. *Appears in:* the section on soil structure and tillage.

#### The Properties panel reaches the plant (P.15 to P.19)

**P.15 Project crop.** The height, the basal crop coefficient and the rooting depth of the plant are those of the crop library of the Properties panel:

$$
K_{cb}=K_{c,mid}-0.05,\qquad z_{root}=z_{root}^{library},\qquad d_{sow}=d_{plant}.
\tag{P.15}
$$

The species of the model (maize, sorghum, wheat or common bean) is the one nearest in kind to the crop of the project, and the day of sowing is the planting day of the project, so that the date on the screen is the calendar date of the season. *Appears in:* the note under the controls and all dates.

**P.16 Project irrigation.** Every day the suction $h_s$ of the layer at the sensor depth is read. If $h_s\ge h_{trig}$ and the days since the last event are at least the minimum interval of the method, the root zone is refilled to field capacity, at most the dose of the method, and the water applied is the gross depth:

$$
d_{net}=\min\Bigl(\sum_z(\theta_{fc}-\theta_z)\,\Delta z,\;D_{max}\Bigr),\qquad I=\frac{d_{net}}{E_a} .
\tag{P.16}
$$

The minimum intervals are 2, 3 and 1 days, the largest doses $D_{max}$ 35, 60 and 10 mm, and the efficiencies $E_a$ 0.75, 0.60 and 0.90 for the sprinkler, the surface and the drip methods. A drip line waters only when the layer at the drip depth is at least 12 % depleted. The trigger and the sensor depth are those of the Properties panel. *Appears in:* the left plant (*Project irrigation*) and every irrigation event of the outlook.

**P.17 Mulch.** The mulch lowers soil evaporation and keeps the first millimetres of a rain from the soil:

$$
E_p'=f_m\,E_p,\qquad P'=\max(0,\,P-C_m).
\tag{P.17}
$$

$f_m$ is the vapour-flux factor of the mulch of the Properties panel and $C_m$ its interception capacity (mm per event). The effect on soil evaporation is compared with the Daisy runs in the SWAFL data section.

**P.18 Nitrogen.** The radiation use is multiplied by the nitrogen factor taken from the Daisy runs E13 of the soil of the project:

$$
f_N=\frac{Y(N)}{Y(100\ \mathrm{kg\ N\ ha^{-1}})} .
\tag{P.18}
$$

$Y(N)$ is the mean yield of the Daisy runs at the nitrogen rate $N$ of the Properties panel (interpolated between the rates simulated).

**P.19 Salt.** The solution of the root zone, of volume $V$ (twice the plant-available water of the column), takes the salt of the irrigation water $EC_w$ and of the rain, and loses it in the drainage $D$; growth is reduced above the threshold of Maas and Hoffman (1977), and the soil potential gets an osmotic term:

$$
V\frac{dC}{dt}=I\,EC_w+0.05\,P-D\,C,\quad EC_e=\frac C2,\quad f_{sal}=1-\frac{s}{100}\max\bigl(0,EC_e-EC_{th}\bigr),\quad \psi_{soil}'=\psi_{soil}-0.036\,EC_e .
\tag{P.19}
$$

$C$ is the salt concentration (dS m⁻¹), $EC_e$ the electrical conductivity of the saturation extract, $EC_{th}$ and $s$ the threshold (dS m⁻¹) and the slope (% per dS m⁻¹) of the crop (from the salt tolerance table of the project), and $\psi$ in MPa.

#### The SWAFL data (P.20 and P.21)

**P.20 Against the SWAFL data.** The plant is compared with the Daisy runs of the soil and the controls (E2, E7, E13 and E14, Chapter 27) in numbers that do not depend on the length of the season:

$$
Y_{rel}=\frac{Y_{plant}}{Y_{well\text{-}watered}},\qquad \tau=\frac{T}{T+E_s},\qquad J(\theta)=\sum_k\Bigl(\frac{m_k(\theta)-r_k}{\tau_k}\Bigr)^2 .
\tag{P.20}
$$

$Y_{rel}$ is the relative yield, $\tau$ the share of the evapotranspiration that is transpiration, $m_k$ the model and $r_k$ the Daisy value of the relative yield, the transpiration share, the mulch effect and the five points of the E2 curve, and $\tau_k$ their tolerances. The multipliers $\theta=(f_{RUE},f_{kte},f_{qG})$ of the radiation use, the water use coefficient and the root conductance are searched one at a time, with a step that is halved when no move helps, within 0.6 to 1.6, 0.5 to 2.2 and 0.25 to 4 times the species values, in at most 45 runs.

**P.21 Genotype call.** For each genotype $g$ of the library, the distance to the observed traits $o$ is the mean squared difference in units of the spread $\sigma_i$ of each trait over the days $t$, and the weight is a softmax whose temperature grows with the best distance:

$$
d_g=\frac{1}{nT}\sum_{i,t}\Bigl(\frac{x_{g,i,t}-o_{i,t}}{\sigma_i}\Bigr)^2,\qquad p_g\propto\exp\Bigl(-\frac{d_g-d_{min}}{0.03+0.25\,d_{min}}\Bigr).
\tag{P.21}
$$

Five traits (shoot area, senescence, leaf water content, canopy temperature depression, height) are used. The observed traits are those of your measurements when they are loaded, else those of the drought plant of the layer with its genotype hidden. The weights add to 1.

#### Traits and roots read out (P.22 and P.23)

**P.22 Traits read out.** The projected shoot area is the area of the leaves seen from the side, the convex hull is the smallest convex polygon around them, and the solidity is their ratio (Lorence and Medina-Jimenez, 2022). The senescence index is the senescent share of the leaf area, and the canopy temperature depression is $T_a-T_c$. The drought susceptibility index of Fischer and Maurer (1978) and the stress tolerance index of Fernandez (1992) compare the grain with stress $Y_s$ and without $Y_p$ of each genotype with the means of the set:

$$
\mathrm{solidity}=\frac{A_{proj}}{A_{hull}},\qquad \mathrm{DSI}=\frac{1-Y_s/Y_p}{1-\bar Y_s/\bar Y_p},\qquad \mathrm{STI}=\frac{Y_s\,Y_p}{\bar Y_p^{\,2}} .
\tag{P.22}
$$

**P.23 Root day.** The depth of 95 % of the root length is the depth where the cumulative length reaches 95 % of the total, the root growth of the day is the new root length, and the root to shoot ratio uses the dry mass of the day:

$$
\int_0^{D_{95}}L(z)\,dz=0.95\int_0^{\infty}L(z)\,dz,\qquad \frac{dL_{root}}{dt},\qquad \frac{W_{root}}{W_{shoot}},\qquad \mathrm{RLD}(z)=\frac{L(z)}{A\,\Delta z} .
\tag{P.23}
$$

$\mathrm{RLD}$ is the root length density (cm cm⁻³) of the bars of the section *Roots day by day*; $A$ is the ground area of one plant.

#### The drought outlook and the stress calendar (P.24 to P.28)

**P.24 Weather of the outlook.** Day $k$ of the season has the date $t_k=t_{start}+k$ days, where $t_{start}$ is the date of sowing in the year in which the date of the toolbar $t_0$ falls in the season. Each day takes its rain $P$, reference evapotranspiration $\mathrm{ET}_0$ and temperature $T$ from the first of these that exists:

$$
(P,\mathrm{ET}_0,T)_k=\begin{cases}\text{record of the day} & t_k\le t_0\ \text{(recorded)}\\ \text{row of the forecast} & t_k>t_0\ \text{and a row exists}\\ \text{analogue year } i_s,\ \text{same day of the year} & \text{otherwise (future } s)\end{cases}
\tag{P.24}
$$

The analogue year gives $P$ and $\mathrm{ET}_0$; the temperature is the mean of the record for that day of the year. Days up to $t_0$ with no record are filled from the typical year. Without an imported weather the model weather is used, and the rain of the days after $t_0$ is multiplied by 0.4, 1 and 1.6 (and $\mathrm{ET}_0$ by 1.08, 1 and 0.95) for the dry, typical and wet future.

**P.25 Analogue years.** For each year $i$ of the 20 years of the weather in use, the rain of the days that have no forecast is added:

$$
S_i=\sum_{k\in\text{future}}P_{i}(k),\qquad i_{dry}=\arg\min_i S_i,\quad i_{wet}=\arg\max_i S_i,\quad i_{typ}=\mathrm{median}.
\tag{P.25}
$$

The three futures are real years of the record, so each has the rain and the evaporative demand of one year, with their dry spells in the order in which they happened. They are not a forecast of the weather beyond the days of the forecast.

**P.26 Root zone water and drought risk.** The water of the root zone is the mean of the relative plant-available water $\theta_i$ of the layers that the roots have reached, each weighted by the part $f_i$ of the layer above the deepest root. A day is a day of stress when it falls below the readily available water of FAO-56 (Allen et al., 1998):

$$
a=\frac{\sum_i f_i\,\theta_i}{\sum_i f_i},\qquad K_s^{FAO}=\min\Bigl(1,\frac{a}{1-p}\Bigr),\qquad \text{stress day if } a<1-p,\qquad R=\frac{Y_{rainfed}}{Y_{irrigated}} .
\tag{P.26}
$$

$p$ is the depletion fraction below which transpiration is reduced (0.55 for maize, sorghum and wheat, 0.45 for common bean). The risk of drought is classed by $R$, the grain of the rainfed plant divided by the grain of the plant irrigated by the rule of the project, under the same future: low when $R\ge0.90$, moderate when $0.75\le R<0.90$, high when $0.50\le R<0.75$, severe below 0.50. The plant response of the outlook (the ratio $T_{act}/T_p$ averaged over seven days) is the second chart and shows what the model plant does with the water that the soil holds.

**P.27 Periods of drought stress.** Let $s_k=1$ when the root zone water $a_k<1-p$ (Eq. P.26) and $s_k=0$ otherwise. A period is a run of days $[k_a,k_b]$ with $s_k=1$ on its first and last day, in which runs of $s_k=0$ shorter than or equal to $g=2$ days are filled, and it is kept when $k_b-k_a+1\ge 2$:

$$
\text{period }j=[k_a,k_b],\qquad n_j=k_b-k_a+1,\qquad a_j^{min}=\min_{k_a\le k\le k_b}a_k,\qquad \overline{T/T_p}_j=\frac{1}{n_j}\sum_{k=k_a}^{k_b}K_{s,k}.
\tag{P.27}
$$

$K_{s,k}$ is the ratio of the transpiration to the demand of the day. The date of day $k$ is $t_{start}+k$ days. A period is *past* when $k_b$ is before the day of the date of the toolbar, *now* when it holds that day and *ahead* otherwise.

**P.28 What the roots suffer.** Let $\Delta L_k$ be the root length that the plant grows on day $k$, $\Delta L_k^{w}$ that of the well watered bench plant under the same weather, $D_k$ the depth of the deepest root and $L_{i}$, $\theta_i$ the root length and relative plant-available water of layer $i$ on the driest day $k^*$ of the period:

$$
G_j=100\,\frac{\sum_{k_a}^{k_b}\Delta L_k}{\sum_{k_a}^{k_b}\Delta L_k^{w}},\qquad \Delta D_j=D^{w}_{k_b}-D_{k_b},\qquad F_j=100\,\frac{\sum_{i:\ \theta_i<0.5}L_i}{\sum_i L_i}.
\tag{P.28}
$$

$G_j$ is the root growth of the period against the watered plant (below 100 means the roots grew less), $\Delta D_j$ is how much shallower the roots are at the end of the period (negative if they are deeper), and $F_j$ is the share of the root length that lies in layers holding less than half of their plant-available water. $G_j$ is not given when the bench plant itself grows less than 0.4 % of its final root length in the period, because the ratio would mean nothing.

#### Index of the equations

| No. | Computes | In the layer | Source |
|---|---|---|---|
| P.1 | thermal time, stage | all charts | degree days (Ritchie and NeSmith, 1991) |
| P.2 | reference evapotranspiration | water, outlook | Allen et al. (1998) |
| P.3 | light interception | carbon | Monsi and Saeki (1953) |
| P.4, P.5 | biomass from light, from water | carbon, traits | Monteith (1977); Tanner and Sinclair (1983) |
| P.6 | soil water, evaporation | water | van Genuchten (1980); Mualem (1976); Ritchie (1972) |
| P.7 | root water uptake | water, roots | Gardner (1960); Feddes et al. (1978) |
| P.8 to P.10 | leaf water, stomata, expansion | water status | van den Honert (1948); Jarvis (1976); Lockhart (1965) |
| P.11 | canopy temperature, CWSI | thermal view | Jackson et al. (1981) |
| P.12 | carbon allocation | carbon, roots | Brouwer (1963); Davidson (1969) |
| P.13, P.14 | root architecture, soil strength | root scans, soil | Pagès et al. (2014); Eq. 8.1 |
| P.15 to P.19 | crop, irrigation, mulch, nitrogen, salt | set up, traits | FAO-56; SWAFL E13; Maas and Hoffman (1977) |
| P.20 | comparison and fit to SWAFL data | SWAFL data | Daisy runs of the repository |
| P.21 | genotype call | genotype prediction | this layer |
| P.22, P.23 | traits, tolerance indices, root day | traits, roots day by day | Lorence and Medina-Jimenez (2022); Fischer and Maurer (1978); Fernandez (1992) |
| P.24 to P.26 | weather of the outlook, analogue years, root zone water and risk | drought outlook | Allen et al. (1998); this layer |
| P.27 and P.28 | periods of drought stress, root growth, depth and dry share in each period | stress calendar | this layer |

*Provenance (Eq. P.1 to P.28):* **[Literature]**: the forms are from the works cited; **[Engineered]**: the constants of the species and genotypes, the efficiencies, dose limits and minimum intervals of the irrigation methods, the salt volume, the tolerances of the fit, the 12 % depletion of the drip layer, the 0.4, 1 and 1.6 rain factors and the risk classes are typical defaults of this layer; **[Data]**: the nitrogen factor, the trigger curve and the mulch effect are read from the SWAFL Daisy runs.

### Limits

* The model is a **daily, one plant** model. It does not simulate individual photons, the diurnal course of the leaf or the structure of the canopy beyond the leaves of one plant.
* The constants of the species and genotypes are typical values and not the data of a trial. For a real experiment, load the observations and calibrate; the calibration changes three parameters only (radiation use efficiency, stomatal threshold, stay-green). The fit to the SWAFL data changes the radiation use, the water use coefficient and the root conductance, and it can reach the limits of the search.
* The genotype call ranks the genotypes of the library; it is not a sequence of a genome. Only this layer is connected deeply to the crop, soil, weather and irrigation of the Properties panel; the other layers are computed by the engine on the same controls and are shown after **Run simulation**.
* The weather is deterministic (a sum of sines on the climate of the project), so a run is a typical season, not a year of records, except that the project rain can be used.
* The roots are drawn as the projection of the three dimensional system on the plane of the view; the root length, depth and density are those of the three dimensional system.

*References of the layer:* Allen et al. (1998), FAO Irrigation and Drainage Paper 56; Maas and Hoffman (1977); Mualem (1976); Ritchie (1972); Ritchie and NeSmith (1991); Brouwer (1963); Davidson (1969); Feddes et al. (1978); Fernandez (1992); Fischer and Maurer (1978); Gardner (1960); Jackson et al. (1981); Jarvis (1976); Lockhart (1965); Lorence and Medina-Jimenez (eds, 2022), *High-Throughput Plant Phenotyping*, Methods in Molecular Biology 2539, Springer; Monsi and Saeki (1953); Monteith (1977); Pagès et al. (2014); Panguluri and Kumar (eds, 2013), *Phenotyping for Plant Breeding*, Springer; Tanner and Sinclair (1983); van den Honert (1948); van Genuchten (1980); Yin et al. (1995).
