## Deterministic phenotyping layer

### What the layer is

**P1 Deterministic phenotyping** (group *Soil structure and tillage*, button *Deterministic phenotyping*) is a virtual phenotyping experiment. One plant of the chosen crop grows day by day for 140 days after emergence in the soil, tillage, weather and rain of the project, twice, side by side: **well-watered** and **drought**. Everything the books on phenotyping let a person measure with a camera, a thermal camera, an X-ray scanner or a rhizotron is read from the simulated plant, and it can be moved: the day is chosen with the play bar or by clicking or dragging on any chart, and the plant and its roots are turned with the mouse.

The layer is **deterministic**. It has no random numbers: the same controls always give the same plant, so a change in a chart is always caused by the control that was moved. The weather of the season is built from the climate of the project (cool and humid), a warm season, or a hot and dry season, with the project rain or a rain-out shelter.

The layer is made for four tasks of a phenotyping programme:

1. **Quantify temporal changes in plant structure and function**: height, projected shoot area, convex hull, solidity, senescence, leaf water content, leaf potential, canopy temperature and root traits, each as a curve through the season and as a table of readouts.
2. **Investigate the relations between photosynthetic carbon assimilation, carbon allocation and the growth of roots and shoots**: the carbon section.
3. **Relate root development and stress responses to what is seen above ground**: the section *Roots from the plant above ground*, with twelve genotypes run under the same drought.
4. **Contribute experimental data to the parameterisation and validation of functional-structural plant models**: your own measurements can be loaded, compared, used to calibrate the model and exported.

*Provenance of the layer:* the forms of the equations are from the literature listed in the section *Equations*. The two books that were the starting point define the **traits** (what is measured and how it is calculated); they do not give growth equations. The constants of the four species and the seven genotypes are typical, editable defaults of this layer. They are not data of an experiment, and no figure of this chapter is a measurement: each figure is the screen of the layer for the run named in its caption.

### The controls

![Set up the experiment. Maize, warm season, rain-out shelter, pulse of drought from day 40 for 28 days at 30 % of the plant-available water, reference genotype, Coarse Loam, conventional tillage.](images/pheno/p1_setup.png){width=85%}

Every control re-runs the model, and every chart answers it.

| Control | What it changes in the model |
|---|---|
| Crop (maize, sorghum, wheat, common bean) | thermal time, leaf number, radiation use, light extinction, height, root axes, stomatal and turgor constants |
| Genotype (reference, deep rooting, shallow and dense, stay-green, water saver, water spender, osmotic adjuster) | angle of the axes, lateral density, stay-green, stomatal threshold, osmotic adjustment, hydraulic resistance, carbon to roots |
| Drought (pulse and recovery, terminal, intermittent, none) | the water that the drought treatment is held at, in time |
| Climate and rain | temperature, radiation, vapour pressure deficit, reference evapotranspiration, rain |
| Drought starts, length, water held | day of onset, duration and the level of the stress, in per cent of the plant-available water |
| Extra warming | temperature added to the whole season |
| Root angle, lateral root density, root vigour, carbon share to roots | root system architecture and the carbon it receives |
| Stay-green, stomata close at, osmotic adjustment | senescence delay, the leaf potential at which half of the stomatal opening is lost, the turgor kept in dry soil |
| Growing area per plant | the ground area of one plant, which sets the leaf area index, the light caught and the water of the column |

The **soil, the tillage and the consolidation rate** are those of the project (the V3 layer): the bulk density, the strength of the soil and therefore the growth of the roots follow the soil texture, the tillage system and the structural consolidation rate (Eq. 8.1).

### Plant and roots, side by side

![Plant and roots on day 70 (10 July) in the camera view: the shoot with the leaves of the model, the soil column with the root system of the same day. Left well-watered, right drought.](images/pheno/p2_twin_rgb.png){width=85%}

The shoot is drawn from the leaf geometry of the model: each leaf has an insertion height, an azimuth, an elevation, a length, a width and a stay-green fraction, so the **projected shoot area**, the **convex hull** and the **solidity** that are printed above the plants are those of what is drawn. The roots are the segments of the root architecture model grown up to the day, turned by the rotation of the view. Four views show the same plant:

* **Camera (RGB)**: green leaves that turn brown with senescence, roots as a rhizotron sees them.
* **Thermal camera**: each leaf has the temperature of its energy balance, from 4 K below to 10 K above the air.
* **X-ray tomography**: roots in white as a scanner shows them.
* **Soil water**: the relative plant-available water of each layer with the roots on it.

![Thermal camera view of the same day. The drought plant is warmer, its leaves are redder and the soil on its side is drier.](images/pheno/p2_twin_thermal.png){width=85%}

![X-ray view of the same day.](images/pheno/p2_twin_xray.png){width=85%}

![Soil water view of the same day: the plant-available water of every 15 cm layer (blue is at field capacity, brown is dry) with the roots.](images/pheno/p2_twin_soil.png){width=85%}

The **root scans through the season** show the drought plant (or the well-watered plant, by the two chips) on four days: at the top the scanner image of the root system, at the bottom the reconstruction with the first order axes, the second order laterals and the soil volume.

![Root scans of the drought plant on days 35, 70, 104 and 139.](images/pheno/p3_scans.png){width=85%}

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

### Quantified traits of the run

![The readouts of a phenotyping experiment for the two treatments, with the change under drought.](images/pheno/p9_traits.png){width=85%}

The table lists 26 traits: the final height, the largest projected shoot area, the day the shoot area reaches half of its largest, the fastest relative growth of the shoot area, the fastest biomass gain, the largest green leaf area index, the stay-green day, the green leaf area over the season, the lowest leaf water content and potential and the highest crop water stress index in the stress period, the canopy temperature depression of the stress period, the water used (transpiration, soil evaporation, water in), dry mass, grain, harvest index, transpiration efficiency, water use efficiency, root depth and length, the depths of 50 % and 95 % of the root length, the share of roots below 60 cm and the root to shoot ratio. The column *change* is the relative change under drought, or the difference when the value of the well-watered plant is small.

### Your measurements: compare, calibrate and export

The last section brings experimental data to the model:

* **Load observations (CSV)**: a file with the column `day` (days after emergence), a column `treatment` (`ww` or `dr`) and any of `height`, `area`, `solidity`, `senescence`, `rwc`, `ctd`. **Download a template** writes an empty file with the columns that are read. The points appear as squares in the time series.
* The table of **errors** gives for each trait and treatment the number of points, the root mean square error, the bias and the Nash and Sutcliffe efficiency.
* **Calibrate the model** searches the radiation use efficiency, the stomatal threshold and the stay-green delay that reduce the squared error of all loaded traits (a coordinate search, one model run per frame, at most 40 runs). **Reset calibration** returns to the values of the genotype.
* **Export the results (CSV)** writes the daily traits of both treatments (height, area, solidity, senescence, water content and potential, canopy temperature depression, crop water stress index, leaf area, assimilation, root share, root depth and length, D95, transpiration and soil evaporation), as input for a functional-structural plant model or for a statistical package.

### Equations

The equations are solved every day for each treatment, in this order. Symbols: $T$ temperature, $\mathrm{LAI}$ leaf area index, $\psi$ water potential, $T_p$ potential transpiration.

**Thermal time and weather.** The development stage is the sum of $d_g=\max(0,\min(T,T_{opt}+6)-T_{base})$ over the thermal time of flowering and of maturity. The reference evapotranspiration is FAO-56 Penman and Monteith (Allen et al., 1998) from the temperature, radiation, wind and vapour pressure of the climate in use.

**Light and biomass.** Light interception follows Monsi and Saeki (1953), biomass Monteith (1977) with the beta temperature function of Yin, and the water limit Tanner and Sinclair (1983); growth is the smaller of the two:

$$
f_i = 1-e^{-k\,\mathrm{LAI}},\qquad dW_{rad}=\mathrm{RUE}\,f_T\,\mathrm{PAR}\,f_i,\qquad dW_{wat}=\frac{k_{te}}{\mathrm{VPD}}\,T .
\tag{P.1}
$$

**Soil water.** The retention curve and the conductivity of the soil are the van Genuchten (1980) and Mualem functions of the soil of the project, in layers of 15 cm to 120 cm; soil evaporation follows the two stages of Ritchie.

**Root water uptake.** Each layer gives (Gardner, 1960; Feddes et al., 1978)

$$
S(z)=G(z)\,\bigl(\psi_{soil}(z)-\psi_{root}\bigr),\qquad G(z)=L_{root}(z)\,f_{fine}\,K\!\left(h\right),\qquad \textstyle\sum S = T_p\,g_s ,
\tag{P.2}
$$

and $\psi_{root}$ is solved every day by bisection so that the sum of the uptake equals the demand.

**Leaf water and stomata.** The leaf potential follows van den Honert (1948), the leaf water content the pressure and volume curve, and the stomata the logistic of Jarvis (1976):

$$
\psi_{leaf}=\psi_{root}-r\,\frac{T}{\mathrm{LAI}},\qquad \psi=\frac{\pi_0}{\mathrm{RWC}}+P(\mathrm{RWC}),\qquad g_s=\frac{1}{1+e^{-b(\psi_{leaf}-\psi_{50})}} .
\tag{P.3}
$$

**Expansion.** The growth of the leaf area and of the height is proportional to the turgor above the yield threshold (Lockhart, 1965), so that the area and the height slow before photosynthesis does:

$$
\frac{1}{V}\frac{dV}{dt}=\phi\,\max(0,P-Y).
\tag{P.4}
$$

**Canopy temperature.** From the energy balance of the leaf (Jackson et al., 1981):

$$
T_c-T_a=\frac{r_a R_n}{\rho c_p}\frac{\gamma^*}{\Delta+\gamma^*}-\frac{\mathrm{VPD}}{\Delta+\gamma^*},\quad \gamma^*=\gamma\left(1+\frac{r_c}{r_a}\right),\quad \mathrm{CWSI}=\frac{dT-dT_{low}}{dT_{up}-dT_{low}} .
\tag{P.5}
$$

**Allocation.** The share of the carbon that goes to the roots rises when the water is short and falls with the stage (functional equilibrium: Brouwer, 1963; Davidson, 1969); the shoot takes the rest, and the grain is filled after flowering.

**Root architecture.** The root system is built with the rules of ArchiSimple (Pagès et al., 2014): axes at the set angle with gravitropism, laterals of the first and second order at a density per cm, growth set by temperature, soil strength, soil water and the carbon received.

**Soil strength.** The resistance and the relative elongation of a root tip are

$$
Q=0.5\,e^{4.5\,(\rho_b-1.3)}\,\bigl(1+(1-S)\bigr),\qquad \frac{e}{e_0}=\frac{1}{1+(Q/2.5)^3},
\tag{P.6}
$$

with $\rho_b$ the bulk density in g cm$^{-3}$, $S$ the relative water content of the layer and $Q$ in MPa.

**Traits read out.** The projected shoot area is the area of the leaves seen from the side, the convex hull is the smallest convex polygon around them, and the solidity is their ratio (as defined by Lorence and Medina-Jimenez, 2022). The senescence index is the senescent share of the leaf area, the canopy temperature depression is $T_a-T_c$ (a negative value means a canopy warmer than the air), and the drought susceptibility and tolerance indices are those of Fischer and Maurer (1978) and Fernandez (1992).

*Provenance (Eq. P.1 to P.6):* **[Literature]**: the forms are from the works cited; **[Engineered]**: the constants of the species and genotypes are typical defaults of this layer.

### Limits

* The model is a **daily, one plant** model. It does not simulate individual photons, the diurnal course of the leaf or the structure of the canopy beyond the leaves of one plant.
* The constants of the species and genotypes are typical values and not the data of a trial. For a real experiment, load the observations and calibrate; the calibration changes three parameters only (radiation use efficiency, stomatal threshold, stay-green).
* The weather is deterministic (a sum of sines on the climate of the project), so a run is a typical season, not a year of records, except that the project rain can be used.
* The roots are drawn as the projection of the three dimensional system on the plane of the view; the root length, depth and density are those of the three dimensional system.

*References of the layer:* Allen et al. (1998), FAO Irrigation and Drainage Paper 56; Brouwer (1963); Davidson (1969); Feddes et al. (1978); Fernandez (1992); Fischer and Maurer (1978); Gardner (1960); Jackson et al. (1981); Jarvis (1976); Lockhart (1965); Lorence and Medina-Jimenez (eds, 2022), *High-Throughput Plant Phenotyping*, Methods in Molecular Biology 2539, Springer; Monsi and Saeki (1953); Monteith (1977); Pagès et al. (2014); Panguluri and Kumar (eds, 2013), *Phenotyping for Plant Breeding*, Springer; Tanner and Sinclair (1983); van den Honert (1948); van Genuchten (1980); Yin et al. (1995).
