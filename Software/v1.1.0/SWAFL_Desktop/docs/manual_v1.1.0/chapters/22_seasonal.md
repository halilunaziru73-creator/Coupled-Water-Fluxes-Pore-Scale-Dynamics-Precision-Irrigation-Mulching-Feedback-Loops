# Seasonal data: twenty seasons, year by year

The group *Seasonal data* of the Layers panel holds three layers built on the **year-by-year results of the simulations**: the twenty growing seasons of each run, not only their mean. They show how reliable a setting is from one year to the next. In version 1.0 the group was called *Year by year (Daisy data)*; the name of the simulation model has gone from the program and is given here.

## Where the yearly values come from

For each soil the simulations hold the twenty yearly values of rain, irrigation, evaporation, transpiration, drainage, storage change, yield and nitrogen of the reference runs (irrigated and rainfed). A layer reads the run nearest your settings and moves each year by the response of the annual model to your settings,

$$
P_y'=\rho\,P_y,\qquad X_y' = X_y\ \mathrm{clip}\Bigl(\frac{X^{\mathrm{model}}(\text{your settings})}{X^{\mathrm{model}}(\text{reference})};\ 0,\ 6\Bigr)\ \ (X\in\{I,T,E,E_{\mathrm{other}},N_L,Y\}),
$$
$$
D_y'=\begin{cases}D_y\,\dfrac{D^{\mathrm{model}}}{D^{\mathrm{model}}_{\mathrm{ref}}} & \bar D>5,\ D^{\mathrm{model}}_{\mathrm{ref}}>5\\[4pt] D_y+\bigl(D^{\mathrm{model}}-D^{\mathrm{model}}_{\mathrm{ref}}\bigr) & \text{otherwise}\end{cases},\qquad ET_0'=ET_0\,(1+0.035\,\Delta T),
\tag{22.1}
$$

*Provenance (Eq. 22.1):* **[Data-driven]**: the yearly values of the simulations, moved by the ratio (or, for small drainage, the difference) of Engine 1 between your settings and the reference of the run (your mulch, rain ×1.0, no warming, nitrogen 100 %); for a library crop the yield is the relative yield of Eq. (21.5) year by year and the irrigation follows the ratio of the two crop balances of Section 21.4.

so that every year follows the crop, rain, temperature, nitrogen, mulch, trigger and method you set, while keeping the weather sequence of the record. A sentence under each layer names the run used and the adjustment made. The calendar years on the axes end in the working year.

## Reliability over 20 seasons

![Reliability over 20 seasons.](images/atlas11/L_yby_p1.jpg){width=100%}

*Reliability of this setting over the 20 seasons*: the irrigation, drainage, yield (or relative yield) and water stress of each season, with their mean and spread. *How often a given irrigation is exceeded*: the twenty seasonal irrigation amounts sorted into an exceedance curve, so that the amount needed in four years out of five can be read off. Click a year to set the working year to it.

## Full water balance

![Full water balance.](images/atlas11/L_wb2_p1.jpg){width=100%}

*Where the water comes from (up) and where it goes (down)*: the complete balance of each season, $P+I=E+T+E_{\mathrm{other}}+D+\Delta S$, stacked year by year, so that a dry season (high irrigation, little drainage) and a wet season can be told apart at a glance. *Evapotranspiration split into all its parts*: transpiration, soil evaporation, canopy, litter, ponded and snow evaporation (20-year mean). *The atmosphere*: reference demand, potential and actual evapotranspiration, year by year. *How the water enters and leaves the soil*: infiltration through the soil matrix and the macropores, runoff and drainage.

## Nitrogen budget

![Nitrogen budget.](images/atlas11/L_nb_p1.jpg){width=100%}

*Supply (up) against uptake and losses (down)*: fertiliser and mineralisation against crop uptake, leaching, denitrification and volatilisation, season by season; *Nitrogen use (20-year mean)*; and *Nitrate goes where the water goes*: the leaching of every season against its drainage, with the regression line. The slope of that line is printed under the chart: *each extra millimetre of drainage carries … kg N/ha of nitrate*.

\newpage

## The dashboard, the charts and the design layers on screen {#sw-screens}

This chapter shows three screens of version 1.1.0 with numbered arrows, and gives the law or the principle behind every figure that the arrows point to. The screens were captured from the program with the benchmark weather, the soil Coarse Loam and the crop Cereal/Oilseed.

### The dashboard results {#sw-results}

The dashboard is the panel on the right of the layer. It has the colours of the Daisy workbench: a grey ground, cards with a thin border and beige title bars. Every layer fills it only after **Run simulation**; before that it says so and tells where to press the button.

![The Results tab of the layer Field balance after a run.](images/sw11/sw_results.jpg){width=45% height=17cm}

**What the arrows point to.**

1. **Results.** The tab of the key numbers. Design, Charts, Figure and Messages are the other tabs of the same run.
2. **Wider.** Widens the dashboard over the picture; the charts open wide by themselves.
3. **A title bar.** Each card has a title, a small line saying what it is, a button for full screen and a Save menu for the picture and the numbers.
4. **The sentences.** Each sentence gives the numbers of the season in words, in the order of the balance below.
5. **The process chips.** The chips name the processes of the model that produced the numbers; clicking one opens the process in the Daisy workbench.
6. **A value.** The large number is the value of the day shown in the picture, with its unit.
7. **Sensor and trigger.** The first number is the depletion at the sensor, the second the trigger; irrigation starts when the first reaches the second.

**Governing principle.** The annual water balance of the first sentence is the balance of the soil column,

$$
P+I=ET+D+\Delta S,\qquad ET=E_s+E_i+T ,
$$

with rain $P$, irrigation $I$, evapotranspiration $ET$ (soil evaporation, interception and mulch evaporation, transpiration), drainage $D$ and storage change $\Delta S$, all in mm. The small term printed after drainage is $\Delta S$ together with the closing error of the model.

\newpage

### The charts of a layer {#sw-charts}

The Charts tab draws the working season day by day, the water in the root zone against the twenty seasons, and the twenty seasons year by year. The figures follow the style of a journal: a black frame with outward ticks, a light dotted grid, markers on the series, lines and bars with a shared legend, and no panel letters.

![The Charts tab of the layer Field balance.](images/sw11/sw_charts.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Charts.** The tab. The dashboard widens by itself and the figures redraw whenever its width changes.
2. **The legend.** Evaporation $E$, transpiration $T$ and their sum, the evapotranspiration, with the median of the twenty seasons as a dashed line, the canopy cover on the right axis, and the bars for rain and irrigation.
3. **Rain and irrigation.** Bars that hang from the top, on an inverted axis in mm per day, so that the water that arrives is drawn above the water that leaves.
4. **Evapotranspiration.** The black line is $ET=E+T$ per day; its peak is the demand of the crop at full cover.
5. **Canopy cover.** The right axis, from 0 to 1, is the share of the ground covered by the leaves; it sets how the demand is divided between $E$ and $T$.
6. **Root-zone water.** The blue line is the water in the root zone as a share of the available water, with the shaded 10 to 90 % range of the twenty seasons and the dashed median.
7. **The irrigation trigger.** The red dashed line is the share at which irrigation starts.
8. **Irrigation events.** Each triangle at the bottom is a day on which the layer irrigated.

**Governing principles.** The quantities of the figure are

$$
w=\frac{S-S_{WP}}{S_{FC}-S_{WP}},\qquad \text{irrigate when } w\le 1-f ,
$$

where $S$ is the water stored in the root zone, $S_{FC}$ and $S_{WP}$ its value at field capacity and at the wilting point, and $f$ the depletion fraction of the crop (the critical depletion of Properties). The daily demand is the reference evapotranspiration times the crop coefficient, reduced by the water stress coefficient when the root zone is drier than the trigger,

$$
ET_c=K_c\,ET_0,\qquad ET=K_s\,ET_c\ \ (K_s\in[0,1],\ K_s=1\text{ while }w>1-f),
$$

and the canopy cover $c$ divides it: the transpiration $T$ grows with $c$ and the evaporation $E$ of the soil surface falls as the canopy closes, $E+T=ET$. The year by year chart sums these daily values over each season; the means in the legend are the means of the twenty seasons, and the shaded band is the range between the 10th and the 90th percentile. Chapter 5 gives the full equations of the two engines.

\newpage

### An irrigation design layer before the run {#sw-design}

The three irrigation design layers (surface, drip, sprinkler) open with their inputs at the top of the picture. Nothing is computed until the design is run, so that the results never change while the inputs are typed.

![The layer Surface irrigation design before the run.](images/sw11/sw_design.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Whole design.** The first of the views of the layer; the other buttons jump to one part of the picture.
2. **The inputs.** Click a value box to type the exact value or to pick one from the list; buttons choose the system, the intake and the cutoff.
3. **Run simulation.** Computes the design with the inputs above it. In these layers the button is in the picture, in the dashboard and in the header; the bar under the picture shows Pause and Play after the run.
4. **Find the most efficient inputs.** Searches the inputs for the highest application efficiency, applies them and runs the design.
5. **Run / re-run simulation.** The same command in the header of the layer, so that the picture does not need to be scrolled.
6. **The waiting message.** The dashboard says that nothing has been simulated and points to the button.

**Governing principles.** The design of a surface layout balances the volume of water with the time it needs to soak in. With the infiltrated depth $Z(\tau)=k\,\tau^{A}$ (the Kostiakov equation, with $k$ and $A$ fitted to the soil or typed by you) and the required depth $Z_n$, the layer finds the opportunity time $\tau_n$ at which $Z(\tau_n)=Z_n$, and judges the design by the application efficiency and the distribution uniformity,

$$
E_a=\frac{V_{stored}}{V_{applied}},\qquad DU=\frac{Z_{lq}}{Z_{avg}},
$$

where $V_{stored}$ is the water kept in the root zone, $Z_{lq}$ the mean depth of the lowest quarter of the field and $Z_{avg}$ the mean depth. Chapters 11 to 13 give the equations of each system.

\newpage

