# From Daisy to the SWAFL project {#daisy-flow}

Daisy calculates; the SWAFL project decides. The Daisy workbench is therefore arranged as one path that begins with the data of the site and ends in the layers of the SWAFL project, and every step of it is connected to the next. This chapter shows the path, the hand-over of the results, and the two layers of the SWAFL project that read real Daisy runs.

## The guided path

The tabs are grouped as the work goes: **Input data** (Input data, Parameter library), **Experiments** (Experiments, Scenarios), **Results and analysis** (Process map, Log plots, Mass balance, Run comparison), **Decision support** (To the SWAFL layers), **Model development** (Set-up editor, Model builder, Soil column, Response curves, Calibration) and **Documentation** (Reference manual, Model and documentation). The nine tabs of the guided path carry their step number, 1 to 9 from left to right; holding the mouse over any tab tells what it is for.

A bar above each tab on the path shows the step (for example *Step 3 of 9*), what the step is for, and two buttons: **Back** goes to the step before and **Next** to the step after, each named on the button. Under it, a yellow line **What to do here** gives the three things to do on that tab, in order; **Hide tips** folds these lines on every tab, and **Show what to do here** brings them back. The tabs can still be opened in any order. Tabs outside the path show the bar *Tool*, with a button that returns to the last step of the path that was open.

| Step | Tab | What is done there |
|--:|:--|:--|
| 1 | Input data | Set the weather and the soil of your site once, or look at a weather station or bring online weather of any place. Every simulation uses them. |
| 2 | Parameter library | Browse the soils, crops, fertilisers and chemicals of Daisy (this step can be skipped). |
| 3 | Experiments | Design your own set of runs from the factors of the model, or load a ready one. |
| 4 | Scenarios | Or choose a ready-made question and run it. |
| 5 | Process map | See the processes behind the results. |
| 6 | Log plots | Load your own files or use the output of your runs, then plot any quantity. |
| 7 | Mass balance | Check that inputs, outputs and content agree. |
| 8 | Run comparison | Compare two runs against the smallest meaningful level. |
| 9 | To the SWAFL layers | Take the results to the layers of the SWAFL project, which turn them into decisions. |

![The tabs with the step numbers of the guided path, the bar of the step and the line What to do here.](images/daisy11/dz_tips_01.jpg){width=100%}

### The guided path: step 1, Input data

The path begins with the data of the site. Each tab shows a bar above its content with the step, its purpose, and the buttons Back and Next. The tabs can still be opened in any order from the row of tabs; the bar only shows where the tab lies on the path.

![The guided path: step 1, Input data. Screen 123 of the Daisy workbench.](images/daisy11/dz_flow_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Where you are.** Step 1 of 9. The first step has no Back button.
2. **What to do here.** Set the weather and the soil of your site once.
3. **Next.** Goes to the Parameter library.

\newpage

### The guided path: step 4, Scenarios

Step 4 is where a ready-made question is chosen and run. After the run the results are drawn under the question, and Next leads on to the Process map and the other ways of looking at the results.

![The guided path: step 4, Scenarios. Screen 124 of the Daisy workbench.](images/daisy11/dz_flow_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Where you are.** The number of the step on the guided path and the number of steps.
2. **What to do here.** The name of the step and one sentence on what it is for.
3. **Back.** Returns to the step before, with the name of that step.
4. **Next.** Goes on to the step after, with the name of that step.

\newpage

### The guided path: step 6, Log plots

Log plots draws any quantity of a run. The bar shows that three steps remain on the path: Mass balance, Run comparison, and the hand-over to the SWAFL project.

![The guided path: step 6, Log plots. Screen 125 of the Daisy workbench.](images/daisy11/dz_flow_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Where you are.** The number of the step on the guided path and the number of steps.
2. **What to do here.** The name of the step and one sentence on what it is for.
3. **Back.** Returns to the step before, with the name of that step.
4. **Next.** Goes on to the step after, with the name of that step.

\newpage

### To the SWAFL layers: the last step of the path

The last step takes the results to the layers of the SWAFL project. Daisy calculates; the SWAFL project turns the results into decisions. For each of the five questions the tab offers the layers that answer it, and the button of the question you ran last is highlighted. The runs you made in the session are passed to the layers, so they show your weather and your soil.

![To the SWAFL layers: the last step of the path. Screen 126 of the Daisy workbench.](images/daisy11/dz_flow_04.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Step 9 of 9.** The last step of the path.
2. **Open in the SWAFL project.** Opens the layer that matches the question you ran last.
3. **Daisy decision table.** Yield, water and nitrate of every run, answer by answer.
4. **Chemical fate.** Decay, crop uptake, leaching, runoff and what stays in the soil.
5. **Nitrogen budget.** Supply, uptake and losses of nitrogen, season by season.
6. **Reliability over 20 seasons.** How steady the result is from year to year.

\newpage

## What is passed to the SWAFL project

When a scenario has been run in Scenarios, the workbench reads the logs of its runs (the annual harvest, the annual water and nitrogen fluxes at the surface and at 100 cm, and for the chemical scenario the annual and daily tracer logs) and passes a summary of each run to the layers of the SWAFL project: the yield, the water drained below the root zone, the nitrate leached, and for a chemical the decay, the crop uptake, the leaching, the runoff and the amount that stays in the soil, season by season. The layers then show **your** runs, with the weather and the soil you set, and say so in a line under the title. There are no ready-made figures: until the question has been run, a layer says *No Daisy run yet* and shows nothing else, and a figure is left out when the run it needs has not been made.

The soil of the run is matched to the soil of the project when the names agree (for example, the sand and the loam of the scenarios are the sand and the loam of the project), and the project is set to that soil when you press a button of the last step.

## The layers that read Daisy runs

The group **Decision support (SWAFL layers)**, inside **Daisy model** in the Layers panel, has the layers *C2 Chemical fate*, *D1 Daisy decision table*, *D2 Daisy water balance*, *D3 Daisy nitrogen balance*, *D4 Yield risk and limiting factor*, *D5 Chemicals and drinking water*, *D6 Trade-offs and the best edge*, *D7 The return of irrigation* and *D8 Nitrous oxide and gaseous nitrogen*. They are drawn like every other layer, and they open from the last step of the path. Each shows in its first lines the weather, the soil and the years of the run it is drawn from.

**C2 Chemical fate.** Three buttons at the top choose the chemical: a mobile tracer (no sorption, no decay), a sorbing chemical, and a sorbing chemical that decays with a half-life of 30 days. For the soil in use the layer shows, from top to bottom:

1. *Where the chemical goes in each season*: stacked bars of the applied amount (decayed, taken up by the crop, leached below 2 m, lost by runoff, left in the soil), season by season, with a marker for what was applied plus what was already in the soil.
2. *What happened to the chemical over the seasons*: the totals and a plain statement of the risk (for example that more than 2 per cent of what was applied has passed below 2 m).
3. *A chemical goes where the water goes*: one dot per season, the drainage below 1 m against the amount leached.
4. *Where the chemical sits in the soil*: the concentration of the soil solution against depth, as the mean of all days and as the largest value.
5. *The three chemicals on this soil*: the leached, decayed and crop-taken shares of the applied amount and the amount left at the end, for the three runs side by side.

**D1 Daisy decision table.** For the questions that have been run the layer shows:

1. *Every question, one row for each answer*: rainfed and irrigated; half the fertiliser, the standard rate and 30 per cent more; the weather as it is, warmer by 2 degrees, drier (rain times 0.7), warmer and drier, and wetter (rain times 1.3). The columns are the yield, its change, the irrigation, the evapotranspiration, the drainage, the nitrate lost and the nitrogen taken up by the crop, as means of the seasons. The colour of a cell is green when the answer is better than the standard run and red when it is worse.
2. *What the table says*: three short statements, one for irrigation, one for nitrogen and one for climate, written from the numbers of the table.
3. *Yield season by season* and *Water season by season*: rainfed against irrigated, and rain, drainage and irrigation, for every season.

![The layer C2 Chemical fate of the SWAFL project (from a run of the chemical question on loam).](images/daisy11/swafl_chem.jpg){height=22cm}

![The layer D1 Daisy decision table of the SWAFL project (from the runs of the irrigation, nitrogen and climate questions on loam).](images/daisy11/swafl_dsum.jpg){height=22cm}

The three layers D2 to D4 read every run you made in this session. A row of buttons at the top chooses the run (rainfed, irrigated, half the fertiliser, warmer...), and a table at the bottom puts all the runs side by side; tapping a row of it chooses that run.

**D2 Daisy water balance.** Where the rain and the irrigation go.

1. *Water in and water out, season by season*: two bars for each season, the water that comes in (rain and irrigation) and the water that leaves (evapotranspiration, drainage below 1 m, runoff).
2. *The water balance in numbers*: the means of the seasons and the share of the input taken by each term; the change of the water in the soil, $\Delta S=P+I-ET_a-D-R$; the share of the potential evapotranspiration the crop used, $ET_a/ET_p$; and the water productivity, the yield per cubic metre evapotranspired, $\mathrm{WP}=1000\,Y/(10\,ET_a)$ in kg/m$^3$ with $Y$ in Mg/ha and $ET_a$ in mm (and per cubic metre of rain and irrigation when there is irrigation).
3. A plain statement: much of the water drains below the roots (drainage above 60 % of evapotranspiration), the crop is short of water ($ET_a/ET_p<0.8$), or most of the water is used by the crop.

**D3 Daisy nitrogen balance.** What comes in (fertiliser, deposition, mineralisation of the soil organic matter) and where it goes.

1. *Nitrogen in, season by season*, with a black mark for the crop uptake, and *Nitrogen lost, season by season*: leached below 1 m, denitrified and volatilised.
2. *The nitrogen balance in numbers*: the means of each term; the nitrogen use efficiency, $\mathrm{NUE}=U/(F+D_p)$, the uptake against the fertiliser and the deposition; the surplus $F+D_p-U$; and the nitrate leached for each kilogram of fertiliser.
3. A plain statement of the leaching: low (under 20 kg N/ha a year), moderate (20 to 40) or high (above 40).

**D4 Yield risk and limiting factor.** The mean yield hides the bad seasons.

1. *How likely is a yield?*: the exceedance curve of every run, the share of the seasons in which the yield reaches at least a value. A curve above another is better in every kind of season; crossing curves trade a better mean for more risk.
2. *Water stress and nitrogen stress, season by season*: the stress of the harvest log (the share of the potential production lost), water against nitrogen.
3. *The yield in numbers*: the mean; the yield reached in 9 seasons out of 10 (the 10th percentile), the median and the 90th percentile; the coefficient of variation; the share of seasons with a stress above 0.2; and which factor limits the crop more (one stress more than 1.2 times the other).

![The layer D2 Daisy water balance (test data of three runs).](images/daisy12/layer_dwb.jpg){height=18cm}

![The layer D3 Daisy nitrogen balance (test data of three runs).](images/daisy12/layer_dnb.jpg){height=18cm}

![The layer D4 Yield risk and limiting factor (test data of three runs).](images/daisy12/layer_dyr.jpg){height=18cm}

### D5 to D8: chemicals, trade-offs, the return of irrigation and nitrous oxide

Four more layers read every run of the session, from Scenarios and from Experiments alike: a run of an experiment is passed on as soon as the experiment has run. Each layer lists all runs it can show as buttons at the top, and a tap on any row of its tables or on any dot of its figures shows that run.

**D5 Chemicals and drinking water.** For every run with a chemical (the questions of the theme Chemicals, or an experiment with a chemical of the library):

1. *Dose of the product*: the results are scaled from the dose of the run to 0.1, 0.25, 0.5, 1 or 2 kg/ha a season. With linear sorption and first-order decay, as in these runs, every amount leached is proportional to the dose.
2. *Where each chemical goes*: one bar per chemical, the shares decayed, taken up, harvested or dissipated, lost by runoff, leached and left in the soil.
3. *Mean concentration in the water draining below the root zone*, the flow-weighted mean of all seasons on a log scale, against the limit of 0.1 µg/L for one pesticide and for the sum of 20 PFAS (Directive (EU) 2020/2184), with the number of seasons over the limit:

$$
\bar c=\frac{\sum_t L_t}{\sum_t D_t}\cdot 10^{5}\ \ \mu\mathrm{g\,L^{-1}},\qquad L_t\ \mathrm{in\ kg\,ha^{-1}},\ D_t\ \mathrm{in\ mm}
$$

   (1 mm on 1 ha is 10 000 L). Drainage water is not yet groundwater: dilution and further decay below the root zone usually lower the concentration.
4. *Season by season* for the chosen chemical, with the line of 0.1 µg/L, and a plain statement of what the numbers say.

**D6 Trade-offs and the best edge.** Every run as one point: yield against nitrate leached (the size of a dot is the irrigation), yield against irrigation plus drainage, and yield against N2O. The green line is the best edge (the Pareto front): the runs that no other run beats on both yield and loss. *What matters most* (yield first, balanced, environment first, water saving) sets the weights of a score,

$$
S=\frac{w_Y\,\hat Y+w_N\,(1-\hat N_L)+w_I\,(1-\hat I)+w_G\,(1-\hat G)}{w_Y+w_N+w_I+w_G},
$$

where each hat is the value scaled between the worst and the best run; the runs are ranked by $S$, and the runs on the edge are marked.

**D7 The return of irrigation.** For the irrigated runs against the rainfed run of the same question:

1. *Yield response to irrigation*: yield against the irrigation given, with a quadratic fit $Y=a+bI+cI^2$ when at least three amounts were run. *Price ratio* (the cost of 1 mm of irrigation on 1 ha in kg of crop, from free water to 20 kg) gives the amount that pays, where the slope of the curve equals the price ratio: $I^{*}=(p-b)/(2c)$ for $c<0$.
2. *Where each millimetre of irrigation goes*: the extra evapotranspiration (used by the crop), the extra drainage, the extra runoff and the rest (stored in the soil), as shares of the irrigation, with the marginal water productivity $\Delta Y/I$ in kg per m³.
3. *Season by season*: the gain in yield and the irrigation given each season, and a plain statement.

**D8 Nitrous oxide and gaseous nitrogen.** N2O from denitrification and from nitrification and ammonia volatilised, season by season; the emission factor of every run, $\mathrm{EF}=\mathrm{N_2O\text{-}N}/F$, against the IPCC default of 1 % (IPCC 2019 Refinement); the climate cost, $\mathrm{N_2O\text{-}N}\times 44/28\times 273$ kg CO2-equivalent per ha (GWP100 of IPCC AR6), also per Mg of dry matter harvested; and the table of all runs.

![D5 Chemicals and drinking water, from five runs of the questions Pesticides of the Daisy library and PFAS (Daisy 7.1.14, loam, 1990 to 1993).](images/daisy13/lay_dchx_1.jpg){height=19cm}

![D6 Trade-offs and the best edge, from fourteen runs of the Water, Nitrogen, Soil and Chemicals questions.](images/daisy13/lay_dtrd_1.jpg){height=19cm}

![D7 The return of irrigation, from the runs of the question Deficit irrigation.](images/daisy13/lay_dirr_1.jpg){height=19cm}

![D8 Nitrous oxide and gaseous nitrogen.](images/daisy13/lay_dghg_1.jpg){height=19cm}

The layer C2 Chemical fate now lists every chemical run as well, not only the three runs of the first chemical question.

### To the SWAFL layers: every layer in one place

The last step of the path lists, in three parts: the nine layers that read your Daisy runs, each with the number of your runs it can show and a frame around those that answer the question you ran last; which layer answers which kind of question (water, nitrogen, soil, crop and climate, chemicals, your own experiments), with the questions of each theme; and every layer of the SWAFL project, group by group, with a button to open it.

![To the SWAFL layers: the layers that read your Daisy runs and which layer answers which question.](images/daisy13/dss_layers.jpg){width=100%}

## What to expect and what not

The layers are summaries of real Daisy runs, not new calculations: a number in a layer is a number of a Daisy log, or a sum or a mean of such numbers, and the line under the title says which runs it comes from. The weather and the soil are those of the run, so for another climate run the question again in Scenarios with the weather of the project or online weather of the place.

