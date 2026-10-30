# From Daisy to the SWAFL project {#daisy-flow}

Daisy calculates; the SWAFL project decides. The Daisy workbench is therefore arranged as one path that begins with the data of the site and ends in the layers of the SWAFL project, and every step of it is connected to the next. This chapter shows the path, the hand-over of the results, and the two layers of the SWAFL project that read real Daisy runs.

## The guided path

A bar above each tab on the path shows the step (for example *Step 5 of 11*), what the step is for, and two buttons: **Back** goes to the step before and **Next** to the step after, each named on the button. The tabs can still be opened in any order from the row of tabs; the bar only shows where a tab lies on the path. Tabs outside the path (Set-up editor, Soil column, Process curves, Calibrate, and Model and documentation) show the bar *Tool*, with a button that returns to the last step of the path that was open.

| Step | Tab | What is done there |
|--:|:--|:--|
| 1 | Input data | Set the weather and the soil of your site once. Every simulation uses them. |
| 2 | Weather stations | Look at a weather record, or bring online weather of any place. |
| 3 | Library | Browse the soils, crops, fertilisers and chemicals of Daisy (this step can be skipped). |
| 4 | Files | Load the logs of earlier Daisy runs (this step can be skipped). |
| 5 | Scenarios | Choose a question and run it. |
| 6 | Experiments | Or design your own set of runs from the factors of the model. |
| 7 | Processes | See the processes behind the results. |
| 8 | Plot | Plot any quantity of a run. |
| 9 | Mass balance | Check that inputs, outputs and content agree. |
| 10 | Run comparison | Compare two runs against the smallest meaningful level. |
| 11 | To the SWAFL layers | Take the results to the layers of the SWAFL project, which turn them into decisions. |

### The guided path: step 1, Input data

The path begins with the data of the site. Each tab shows a bar above its content with the step, its purpose, and the buttons Back and Next. The tabs can still be opened in any order from the row of tabs; the bar only shows where the tab lies on the path.

![The guided path: step 1, Input data. Screen 123 of the Daisy workbench.](images/daisy11/dz_flow_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Where you are.** Step 1 of 11. The first step has no Back button.
2. **What to do here.** Set the weather and the soil of your site once.
3. **Next.** Goes to Weather stations.

\newpage

### The guided path: step 5, Scenarios

Step 5 is where a question is chosen and run. After the run the results are drawn under the question, and Next leads on to Experiments, Processes and the other ways of looking at the results.

![The guided path: step 5, Scenarios. Screen 124 of the Daisy workbench.](images/daisy11/dz_flow_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Where you are.** The number of the step on the guided path and the number of steps.
2. **What to do here.** The name of the step and one sentence on what it is for.
3. **Back.** Returns to the step before, with the name of that step.
4. **Next.** Goes on to the step after, with the name of that step.

\newpage

### The guided path: step 8, Plot

Plot draws any quantity of a run. The bar shows that three steps remain on the path: Mass balance, Run comparison, and the hand-over to the SWAFL project.

![The guided path: step 8, Plot. Screen 125 of the Daisy workbench.](images/daisy11/dz_flow_03.jpg){width=100% height=17cm}

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

1. **Step 11 of 11.** The last step of the path.
2. **Open in the SWAFL project.** Opens the layer that matches the question you ran last.
3. **Daisy decision table.** Yield, water and nitrate of every run, answer by answer.
4. **Chemical fate.** Decay, crop uptake, leaching, runoff and what stays in the soil.
5. **Nitrogen budget.** Supply, uptake and losses of nitrogen, season by season.
6. **Reliability over 20 seasons.** How steady the result is from year to year.

\newpage

## What is passed to the SWAFL project

When a scenario has been run in Scenarios, the workbench reads the logs of its runs (the annual harvest, the annual water and nitrogen fluxes at the surface and at 100 cm, and for the chemical scenario the annual and daily tracer logs) and passes a summary of each run to the layers of the SWAFL project: the yield, the water drained below the root zone, the nitrate leached, and for a chemical the decay, the crop uptake, the leaching, the runoff and the amount that stays in the soil, season by season. The layers then show **your** runs, with the weather and the soil you set, and say so in a line under the title. There are no ready-made figures: until the question has been run, a layer says *No Daisy run yet* and shows nothing else, and a figure is left out when the run it needs has not been made.

The soil of the run is matched to the soil of the project when the names agree (for example, the sand and the loam of the scenarios are the sand and the loam of the project), and the project is set to that soil when you press a button of the last step.

## The two layers that read Daisy runs

The group **Decision support (SWAFL layers)**, inside **Daisy model** in the Layers panel, has the layers *C2 Chemical fate* and *D1 Daisy decision table*. They are drawn like every other layer, and they open from the last step of the path. Each shows in its first lines the weather, the soil and the years of the run it is drawn from.

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

## What to expect and what not

The layers are summaries of real Daisy runs, not new calculations: a number in a layer is a number of a Daisy log, or a sum or a mean of such numbers, and the line under the title says which runs it comes from. The weather and the soil are those of the run, so for another climate run the question again in Scenarios with the weather of the project or online weather of the place.

