# Experiments and scenarios: ask a question {#daisy-ask}

The second group answers a question by running Daisy: five ready scenarios and a free design of experiments.

## Scenarios

Each scenario is a question about the built-in farm. Its runs differ only in the option that the question is about.

| Scenario | Question | Runs compared |
|:--|:--|:--|
| irrigation | Irrigation: does it pay off, and what does it cost the soil? | Rainfed; Irrigated |
| nitrogen | Nitrogen: how much fertiliser, how much leaching? | No fertiliser (control); Half the fertiliser; Standard fertiliser; 30 % more fertiliser; 50 % more fertiliser |
| climate | Climate: warmer, drier or wetter | Weather file as it is; Warmer by 2 C; Drier (rain x 0.7); Warmer and drier; Wetter (rain x 1.3) |
| chemical | A pesticide or tracer: sorption and degradation | Mobile tracer (no sorption, no decay); Sorbing (K_OC 100); Sorbing and degrading (K_OC 100, half-life 30 d) |
| soil | Soil: how much does texture matter? | Sand; Loam |

### The options of a scenario

| Option | Meaning | Kind |
|:--|:--|:--|
| soil | Soil | select |
| start | First year | number |
| stop | Last year | number |
| precip | Rain, factor on the weather file | number |
| temp | Temperature offset (C) | number |
| nfac | Nitrogen fertiliser, factor on the rotation | number |
| irrig | Irrigation | select |
| trig | Irrigate when the potential at 20 cm drops below (cm) | number |
| mm | Water per irrigation (mm) | number |
| station | Weather of | select |
| method | Irrigation method | select |
| z | Sensor depth (cm) | number |
| hours | Duration of one irrigation (hours) | number |
| dfrom | Drip from depth (cm) | number |
| dto | Drip to depth (cm) | number |
| limit | Water limit per crop season (mm, 0 = none) | number |
| w1 | Irrigation window opens (month-day) | text |
| w2 | Irrigation window closes (month-day) | text |
| root | Maximum rooting depth (cm, 0 = soil default) | number |
| koc | Sorption of the chemical, K_OC (L/kg) | number |
| half | Half-life of the chemical in soil (days, 0 = none) | number |
| flux | Application rate of irrigation (mm/h, 0 = from dose and duration) | number |
| waitd | Days between irrigations | number |
| spin | Warm-up years before the results are counted | number |
| till | Tillage before sowing | select |
| ntype | Fertiliser | select |
| ntime | Fertiliser dates moved by (days) | number |
| bio | Evapotranspiration model (Bioclimate) | select |
| radscale | Global radiation, scale | number |
| pmonths | Rain scale per month (12 numbers, Jan to Dec; blank = none) | text |

\newpage

### Scenarios: choose the question

The Scenarios tab starts with the questions that the built-in farm can answer: water, nitrogen, climate, a chemical and soil. Two more cards lead to your own set-up and to two tools that need no Daisy program.

![Scenarios: choose the question. Screen 14 of the Daisy workbench.](images/daisy11/dz_scen_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation question.** Does irrigation pay off, and what does it cost the soil.
2. **Nitrogen question.** How much fertiliser, how much leaching.
3. **Climate question.** A warmer, drier or wetter climate.
4. **Chemical question.** Sorption and degradation of a pesticide or tracer.
5. **Soil question.** How much does texture matter.
6. **Your own work.** Run a set-up of your own or draw the figures of logs you loaded.
7. **Soil column.** A built-in tool that needs no Daisy program.
8. **Process curves.** A built-in tool that draws any Daisy function.

\newpage

### Scenarios: the 24 questions, and one more run from the library {#daisy-scen-list}

The Scenarios tab holds 24 questions in five themes: water, nitrogen, soil, crop and climate, and chemicals. *Find a question* filters the cards by a word (drip, slurry, PFAS, clay, maize). Each card says how many runs it compares and, when its runs differ in one option, how many choices of the parameter library can be added. The five questions of the earlier version are kept as they were; the others vary one option each over the values of the parameter library:

| Theme | Question | Runs compared | One more run from |
|:----|:----------|:--------------|:------|
| Water | Irrigation: does it pay off, and what does it cost the soil? | Rainfed; Irrigated | n/a |
| Water | Irrigation method: overhead, surface or drip? | Rainfed (reference); Overhead (sprinkler); Surface; Drip at 10-20 cm | 3 choices of the library |
| Water | When to irrigate: the trigger suction | Wet: -150 cm (pF 2.2); Moist: -300 cm (pF 2.5); Drier: -600 cm (pF 2.8); Dry: -1000 cm (pF 3) | any value |
| Water | How much water per irrigation? | 10 mm per event; 20 mm per event; 30 mm per event; 45 mm per event | any value |
| Water | Deficit irrigation: a water limit per season | Rainfed; At most 60 mm a season; At most 120 mm a season; At most 240 mm a season; No limit | any value |
| Water | Where to put the soil moisture sensor? | Sensor at 10 cm; Sensor at 20 cm; Sensor at 40 cm; Sensor at 60 cm | any value |
| Nitrogen | Nitrogen: how much fertiliser, how much leaching? | No fertiliser (control); Half the fertiliser; Standard fertiliser; 30 % more fertiliser; 50 % more fertiliser | any value |
| Nitrogen | Which mineral fertiliser? | N25S (the farm); Ammonium nitrate; Calcium nitrate; Nitrate; Ammonia | 79 choices of the library |
| Nitrogen | Mineral fertiliser or slurry and manure? | Mineral (N25S); Cattle slurry; Pig slurry (fattening pigs); Cattle deep litter; Poultry manure | 79 choices of the library |
| Nitrogen | When to fertilise? | 3 weeks earlier; 1 week earlier; As the farm; 2 weeks later; 4 weeks later | any value |
| Soil | Soil: how much does texture matter? | Sand; Loam | 73 choices of the library |
| Soil | Eight soil textures (USDA) | Sand; Loamy sand; Sandy loam; Loam; Silt loam; Sandy clay loam; Clay loam; Silty clay loam | 73 choices of the library |
| Soil | Danish soil classes JB1 to JB7 of the library | JB1 (Ap_JB1); JB2 (Ap_JB2); JB3 (Ap_JB3); JB4 (Ap_JB4); JB5 (Ap_JB5); JB6 (Ap_JB6); JB7 (Ap_JB7) | 73 choices of the library |
| Soil | Tillage: plough, rotavate, harrow or none | Ploughing (the farm); Rotavation; Disk harrowing; Stubble cultivation; No tillage | 6 choices of the library |
| Soil | How deep can the roots go? | Roots to 40 cm; Roots to 70 cm; Roots to 100 cm; Roots to 150 cm | any value |
| Soil | The aquitard below the profile | Tight: K 0.0002 cm/h; The farm: K 0.001 cm/h; Leaky: K 0.005 cm/h | any value |
| Crop and climate | Climate: warmer, drier or wetter | Weather file as it is; Warmer by 2 C; Drier (rain x 0.7); Warmer and drier; Wetter (rain x 1.3) | n/a |
| Crop and climate | Which crop? One crop of the library every year | Spring barley; Winter wheat; Silage maize; Potato; Sugar beet; Grass | 84 choices of the library |
| Crop and climate | The same farm in other climates of Europe | Taastrup, Denmark; Foulum, Denmark; Jadwisin, Poland; Valecov, Czechia; Bratislava, Slovakia; Bologna, Italy | 8 choices of the library |
| Crop and climate | Sunnier or cloudier | Cloudier (radiation x 0.85); As it is; Sunnier (radiation x 1.15) | any value |
| Chemicals | A pesticide or tracer: sorption and degradation | Mobile tracer (no sorption, no decay); Sorbing (K_OC 100); Sorbing and degrading (K_OC 100, half-life 30 d) | 35 choices of the library |
| Chemicals | Pesticides of the Daisy library | Bentazon; MCPP (mecoprop); Atrazine; Isoproturon (IPU); Pendimethalin; 2,4-D | 35 choices of the library |
| Chemicals | PFAS: the forever chemicals | PFOS; PFOA; PFHxA; PFBS; PFBA | 35 choices of the library |
| Chemicals | How strongly the chemical is held (K_OC) | K_OC 0 L/kg; K_OC 10 L/kg; K_OC 50 L/kg; K_OC 200 L/kg; K_OC 1000 L/kg | any value |

**Add a run.** In the panel of a question with a varied option, the row *Add a run* offers every other value of that option: a list with a search box for a choice of the library (79 fertilisers and slurries, 84 crops, 35 chemicals, 73 soils, 8 weather stations), or a number box for a number option (with the range it accepts). *Add* makes one more run with that value and every other option as set above; it is ticked like the others and run with them. *Remove the added runs* takes them out again.

**The library in a run.** A run that uses a slurry, a chemical or a crop of the library reads the file of the library inside its rotation file, after the files the rotation reads itself (fertilizer.dai, crop.dai, tillage.dai) and before its own definitions, which use it. The copy of the file in Common/ leaves out what the run already reads, because Daisy stops on a definition made twice. All 24 questions were run with Daisy 7.1.14 and give their logs.

![The 24 questions of the Scenarios tab in their five themes.](images/daisy13/scen_cards.jpg){width=100%}

\newpage

### Scenarios: irrigation

The irrigation question compares rainfed and irrigated crops of the built-in rotation. The trigger is the potential at 20 cm below which the overhead irrigation starts; the water per irrigation is fixed.

![Scenarios: irrigation. Screen 15 of the Daisy workbench.](images/daisy11/dz_scen_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Soil.** The soil profile of the run: the built-in loam or sand, or your own soil when it is set in Input data.
2. **Trigger.** Irrigation starts when the soil water potential at 20 cm drops below this value (cm).
3. **Water per irrigation.** Depth of water applied each time (mm).
4. **Rain factor.** Multiplies the rain of the weather file (1 leaves it as recorded).
5. **Temperature offset.** Added to every daily temperature (degrees Celsius).
6. **First year.** First year of the simulation; it must lie at least one year after the start of the weather.
7. **Weather for all runs.** The one weather choice of every Daisy simulation: the weather of the SWAFL project when one is loaded, the built-in Taastrup weather, a built-in station, online weather or a file.
8. **Runs compared.** Each ticked run is one Daisy simulation; the figures compare them.
9. **What I am interested in.** Tick the processes of Fig. 1 whose figures should be drawn as well, or write them in words.
10. **Run Daisy.** Runs every ticked simulation and draws the figures.
11. **Standard options.** Puts every option back to its standard value.
12. **Save the Daisy files.** Saves the set-up files of the first ticked run, to run Daisy anywhere.

\newpage

### Scenarios: nitrogen

The nitrogen question compares three fertiliser levels, with or without irrigation, on the built-in rotation. It reports yield, nitrate leached, denitrification and the nitrogen balance.

![Scenarios: nitrogen. Screen 16 of the Daisy workbench.](images/daisy11/dz_scen_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Soil.** The soil profile of the run: the built-in loam or sand, or your own soil when it is set in Input data.
2. **Irrigation.** Rainfed or irrigated.
3. **Rain factor.** Multiplies the rain of the weather file.
4. **Temperature offset.** Added to the daily temperatures.
5. **Weather for all runs.** The one weather choice of every Daisy simulation: the weather of the SWAFL project when one is loaded, the built-in Taastrup weather, a built-in station, online weather or a file.
6. **Runs compared.** Each ticked run is one Daisy simulation; the figures compare them.
7. **What I am interested in.** Tick the processes of Fig. 1 whose figures should be drawn as well, or write them in words.
8. **Run Daisy.** Runs every ticked simulation and draws the figures.
9. **Standard options.** Puts every option back to its standard value.
10. **Save the Daisy files.** Saves the set-up files of the first ticked run, to run Daisy anywhere.

\newpage

### Scenarios: climate

The climate question runs the same farm under the weather as it is and under a warmer, a drier, a warmer and drier and a wetter weather.

![Scenarios: climate. Screen 17 of the Daisy workbench.](images/daisy11/dz_scen_04.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Soil.** The soil profile of the run: the built-in loam or sand, or your own soil when it is set in Input data.
2. **Irrigation.** Rainfed or irrigated.
3. **First year.** First year of the runs.
4. **Weather for all runs.** The one weather choice of every Daisy simulation: the weather of the SWAFL project when one is loaded, the built-in Taastrup weather, a built-in station, online weather or a file.
5. **Runs compared.** Each ticked run is one Daisy simulation; the figures compare them.
6. **What I am interested in.** Tick the processes of Fig. 1 whose figures should be drawn as well, or write them in words.
7. **Run Daisy.** Runs every ticked simulation and draws the figures.
8. **Standard options.** Puts every option back to its standard value.
9. **Save the Daisy files.** Saves the set-up files of the first ticked run, to run Daisy anywhere.

\newpage

### Scenarios: a pesticide or tracer

The chemical question follows a chemical applied to the soil: a mobile tracer, a strongly sorbed chemical and a quickly decaying one. It shows how much leaves the root zone and how much stays in the soil.

![Scenarios: a pesticide or tracer. Screen 18 of the Daisy workbench.](images/daisy11/dz_scen_05.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Soil.** The soil profile of the run: the built-in loam or sand, or your own soil when it is set in Input data.
2. **Rain factor.** Multiplies the rain of the weather file.
3. **Weather for all runs.** The one weather choice of every Daisy simulation: the weather of the SWAFL project when one is loaded, the built-in Taastrup weather, a built-in station, online weather or a file.
4. **Runs compared.** Each ticked run is one Daisy simulation; the figures compare them.
5. **What I am interested in.** Tick the processes of Fig. 1 whose figures should be drawn as well, or write them in words.
6. **Run Daisy.** Runs every ticked simulation and draws the figures.
7. **Standard options.** Puts every option back to its standard value.
8. **Save the Daisy files.** Saves the set-up files of the first ticked run, to run Daisy anywhere.

\newpage

### Scenarios: soil texture

The soil question runs the same crops, weather and management on the built-in sand and loam, and shows water holding, drainage, yield and nitrate.

![Scenarios: soil texture. Screen 19 of the Daisy workbench.](images/daisy11/dz_scen_06.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Irrigation.** Rainfed or irrigated.
2. **Trigger.** Potential at 20 cm that starts irrigation.
3. **Fertiliser factor.** Multiplies the fertiliser of the rotation.
4. **Weather for all runs.** The one weather choice of every Daisy simulation: the weather of the SWAFL project when one is loaded, the built-in Taastrup weather, a built-in station, online weather or a file.
5. **Runs compared.** Each ticked run is one Daisy simulation; the figures compare them.
6. **What I am interested in.** Tick the processes of Fig. 1 whose figures should be drawn as well, or write them in words.
7. **Run Daisy.** Runs every ticked simulation and draws the figures.
8. **Standard options.** Puts every option back to its standard value.
9. **Save the Daisy files.** Saves the set-up files of the first ticked run, to run Daisy anywhere.

\newpage

### Scenarios: your own work

This card leads to the set-up editor, where a .dai file of your own is run, and to the figures that are drawn from logs you have loaded.

![Scenarios: your own work. Screen 20 of the Daisy workbench.](images/daisy11/dz_scen_07.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Heading.** The work you bring: a set-up of your own or logs of earlier runs.
2. **First action.** Opens the matching tab.

\newpage

### Scenarios: processes to draw as well

Under the runs a list of the processes of Fig. 1 of the Daisy paper can be ticked, or described in words. Daisy then writes the logs these figures need.

![Scenarios: processes to draw as well. Screen 21 of the Daisy workbench.](images/daisy11/dz_scen_08.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Processes of Fig. 1.** Weather, snow, canopy, soil water, biopores, drains, heat and ice, nitrate, ammonium, organic matter, carbon, denitrification, photosynthesis and crop growth.
2. **In words.** Write for example snow and soil temperature in winter; the matching processes are ticked.
3. **Run Daisy.** Runs the simulations and draws the standard figures and these.

\newpage

## Experiments

Experiments is the free design. Runs are chosen from the factors, the plan is made as a one at a time, factorial, Latin hypercube or other design, and the runs are listed in order of preference.

### Experiments: the starting screen

The Experiments tab turns a question into a set of Daisy runs. You can write the question, start from a ready made combination of the Daisy reference, choose a topic of the reference or bring set-ups of your own.

![Experiments: the starting screen. Screen 22 of the Daisy workbench.](images/daisy11/dz_exp_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Weather for all runs.** The weather of every simulation, shared with Scenarios and Processes.
2. **Your question.** Write what you want to find out in your own words.
3. **Make a plan.** Reads the question and proposes the factors, the levels and the design.
4. **Online AI.** Optional: an online AI reads the question first; each plan it gives is checked against what Daisy can vary.
5. **Best combinations.** Ready made experiments worked out from the Daisy reference.
6. **By topic.** The 107 topics of the Daisy reference, each leading to experiments.
7. **Import.** Bring an experiment folder, set-ups, weather, soil tables or logs.
8. **My experiments.** The list of experiments that are run or saved together.

\newpage

### Experiments: best combinations to start with

The list holds 27 combinations in groups: Irrigation, Nitrogen, Climate, Soil and crop, Chemicals and Parameters. Each shows the topics of the reference it draws on. Choosing one shows why it is worth running; the tick boxes select several to add at once.

![Experiments: best combinations to start with. Screen 23 of the Daisy workbench.](images/daisy11/dz_exp_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Tick box.** Ticks the combination so that several can be added together.
2. **Combination.** A combination with the topics of the Daisy reference it draws on.
3. **Load this experiment.** Loads the plan of the chosen combination for checking and running.
4. **Add to my experiments.** Adds the chosen combination to the list of experiments without loading it.
5. **Add the ticked.** Adds every ticked combination, each as an experiment of its own.

\newpage

### Experiments: the topics of the Daisy reference

The second tab lists the 107 topics of the Daisy reference manual in three parts. A topic shows its models, the parameters that Daisy accepts for experiments and the related experiments. The size of the experiment is set before loading.

![Experiments: the topics of the Daisy reference. Screen 24 of the Daisy workbench.](images/daisy11/dz_exp_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Levels per parameter.** How many values of each parameter are tested.
2. **How to combine.** Every combination, one thing at a time, or paired.
3. **At most.** The largest number of runs.
4. **List of topics.** Scroll the list; a star marks a topic that has its own experiments.
5. **Previous and next.** Moves through the topics in order.
6. **Add.** Adds the experiment to my experiments.
7. **Load.** Loads the experiment for checking and running.

\newpage

### Experiments: a topic with parameters you can vary

Topics whose parameters Daisy accepts show them with a tick box. Each parameter was tested in Daisy; the levels are fractions of the value the farm uses.

![Experiments: a topic with parameters you can vary. Screen 25 of the Daisy workbench.](images/daisy11/dz_exp_04.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Parameter.** Tick one or several parameters to vary.
2. **Topic details.** The introduction of the topic, its parameters and the models it lists.

\newpage

### Experiments: import data and set-ups

The third tab brings in what you already have: an experiment folder as a zip, Daisy set-up files, weather, soil tables or logs. Each goes where it is used; set-ups are run as experiments.

![Experiments: import data and set-ups. Screen 26 of the Daisy workbench.](images/daisy11/dz_exp_05.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Choose a folder.** Reads every Daisy file of a folder.

\newpage

### Experiments: the plan before running

Loading a combination fills the plan: what changes, the values tested, how they are combined, the weather and soil, the years and the results saved. The size of the experiment is shown before anything is run.

![Experiments: the plan before running. Screen 27 of the Daisy workbench.](images/daisy11/dz_exp_06.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Source of the plan.** Where the plan comes from: the reference manual, your request or the built-in planner.
2. **Values tested.** The values can be typed over; the allowed range is shown beside them.
3. **Remove.** Takes the row out of the experiment.
4. **Add something to change.** Adds a further factor.
5. **How to combine.** Every combination, one thing at a time, or paired.
6. **At most.** The largest number of runs.
7. **Results saved.** How much Daisy writes: yearly totals only, with harvest, with daily values, or everything.
8. **Size.** Number of runs and the time they take.

\newpage

### Experiments: what each row means, and the number of runs {#daisy-exp-rows}

Under every row of *What will be tested* a sentence says what the factor is; for a parameter of the Daisy reference it also gives the Daisy default and the value of the farm. *more* opens four lines: where Daisy reads the value (the line of the run file or of the rotation), the typical values, what to type, and what changes in the results. The note after a number box, *allowed a to b*, is what the box accepts (0 to ten times the value used), not a limit of Daisy; the typical values are much narrower. Chapter \ref{daisy-factors} gives the same for every factor.

![Three rows with their explanations: the minimum nitrogen of an added organic matter pool, the detention capacity of the surface and the trigger of the irrigation.](images/daisy13/exp_help.jpg){width=100%}

**The number of runs.** The box *number of runs* is the number of runs Daisy makes, the rainfed references included, and it is never exceeded. When the values give more combinations, the runs are chosen in the way set in *if there are more, choose*: balanced (each value used about equally often: a Latin hypercube over the levels), at random, evenly spaced through the list, or the first ones in the list. The *seed* fixes the choice: the same plan and seed always give the same runs. *rainfed references* adds a rainfed run for every soil and weather of the irrigated runs; untick it to get exactly the number set. The line under the form says how many runs there are, how many combinations they come from and how they were chosen; *See the runs* lists them and counts how often each value is used.

![The number of runs: 40 of 288 combinations, chosen in a balanced way, with the count of every value.](images/daisy13/exp_count.jpg){width=100%}

\newpage

### Experiments: the folder before it is saved, in colour {#daisy-exp-folder}

*Save the experiment folder (.zip)* and *Save the ticked as one folder (.zip)* first show the folder: the tree on the left, the file on the right. Every file opens in an editor with the colours of VS Code (Dark+ or Light+, button *light* / *dark*): comments green, keywords blue, names of parameters light blue, numbers light green, text in quotes orange, units teal, definitions purple. Line numbers, *find* (Ctrl+F), *wrap*, the cursor position and, for a .dai file, the check of the brackets are in the bars above and below. Change the text and press *Save changes* (Ctrl+S): the zip then holds the changed file, and the file is marked *changed* in the tree. *undo all* returns to the text as it was opened, *download* saves the one file, and *open in set-up editor* opens a .dai file in the Set-up editor.

![The folder of an experiment: a run file in the colours of VS Code.](images/daisy13/exp_folder.jpg){width=100%}

**The README of the folder** says how the folder was made:

1. *HOW THE COMBINATIONS WERE MADE*: the way of combining, the number of combinations (for example 3 x 2 x 4 x 3 x 4 = 288), the number of runs set, how many were chosen and in which way, with the seed, and the rainfed references.
2. *HOW EACH .dai FILE IS MADE*: one run file per combination from the same template; the weather, soil, rotation and output files read with (input file "../Common/..."); each value written where Daisy reads it; files that several runs share written once in Common/ and named after the values they carry.
3. *WHERE EACH VALUE IS WRITTEN*: for every factor, two runs that differ in that factor only, and the lines that change between them, in the run file and inside the Common file it points to (for example (irrigate_overhead 3.333 [mm/h] (hours 3)) against (irrigate_overhead 6.667 [mm/h] (hours 3)) for 10 and 20 mm).
4. *HOW THE DATA REACH EVERY RUN*: the weather (one .dwf in Common/; rain, temperature and radiation factors as PrecipCorrect, TempOffset and GlobRadScale in the run file), the soil, the crops, the output and the relative paths.

*runs.csv* lists every run folder with the value of every factor. A rainfed reference is named after the soil and weather it belongs to.

5. *HOW THE FOLDER AND THE CODE ARE ARRANGED*: the tree of the folder, and the run file of one run explained part by part with its line numbers: the comments, each (input file ...) and what that Common file holds, the unit of the radiation, the weather with its factors, the description and log prefix, the management, the column with the parameters the run varies, and the dates.

**How a .dai file is created and how everything is called.** Every README (of the experiment and of each run) starts with *IN SHORT*, four plain sentences, and then gives two sections in easy steps. *HOW THIS .dai FILE WAS CREATED*: (1) the values you chose, (2) the combinations and the choice with its seed, (3) the template of the farm, (4) each value of the run and where Daisy reads it, (5) the shared files written once in Common/, (6) the comments, description and log prefix. *HOW EVERYTHING IS CALLED WHEN DAISY RUNS IT*: a tree with the real names of the run, read from top to bottom:

```
daisy overhead_Built_in_loam.dai
 |-- reads ../Common/..._Rotation_..._overhead.dai
 |     |-- reads tillage.dai, crop.dai, fertilizer.dai (Daisy library)
 |     `-- defines the actions "sbarley_A_F_R" ... "irrigate_30_tensiometer_overhead", "A_F_R"
 |-- reads ../Common/..._ResFarm.dai: the horizons and the column "ResFarm 1D; Free drainage"
 |-- reads ../Common/..._OutputLog_annual.dai: the logs Annual-Harvest.dlf ...
 |-- (weather default "...dwf"): the weather of every day
 |-- (defcolumn "SWAFL column" "ResFarm 1D; Free drainage"): uses the column defined above
 |-- (manager ... (repeat "A_F_R")): calls the action "A_F_R" every year
 |-- (column "SWAFL column"): calls the column defined above
 `-- simulates hour by hour from 1980 01 01 to 2000 04 1, writes <run>-<log>.dlf
```

A name must be defined before it is called, so the files in Common/ come first.

**Every run folder has its own README_run.txt**: the values of the run (and which factors stay at the value of the farm), its place in the design (run 4 of 8, made from 6 of 6 combinations, chosen how and with which seed), its rainfed reference, the files of the folder, its run file explained line by line, the Common files it reads with what differs in them from the other runs, and how to run it alone on Linux, macOS or Windows. When several experiments are saved as one folder, *README_experiments.txt* lists every experiment with what it changes, how its values were combined and how many runs were chosen, and draws the arrangement of the whole folder. Both the folder window and the editor have a *Full screen* button (Esc leaves it).

![The README in the light colours.](images/daisy13/exp_readme.jpg){width=100%}

\newpage

### Experiments: weather, soil and years of the experiment

The weather list of an experiment follows the choice at the top of the tab and offers the built-in stations as well. The soil, the years and what is saved are set beside it.

![Experiments: weather, soil and years of the experiment. Screen 28 of the Daisy workbench.](images/daisy11/dz_exp_07.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Weather.** Online weather of my area, the weather of the SWAFL project, my weather, or a built-in station.
2. **Place.** The place whose weather is read from the internet.
3. **Get the weather.** Reads and checks the weather of the place.
4. **Soil.** The soil of the experiment when it is not a factor.
5. **Years.** First and last year of every run.
6. **Use my data.** Uses the weather and soil given in Input data when they are set.

\newpage

### Experiments: my experiments, ordered and ticked

Experiments are added to a list in the order of preference. Each has its own name, design and largest number of runs; only the ticked ones are run, from the top down, or saved together in one folder.

![Experiments: my experiments, ordered and ticked. Screen 29 of the Daisy workbench.](images/daisy11/dz_exp_08.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Run.** Ticks the experiments that are run or saved.
2. **Name.** The name of the experiment; it becomes the name of its folder.
3. **Combinations.** The design of this experiment on its own.
4. **At most.** The largest number of runs of this experiment.
5. **Move up.** Moves the experiment earlier in the list.
6. **Run the ticked.** Runs the ticked experiments one after another.
7. **Save as one folder.** Saves the ticked experiments as E1, E2 and so on in one zip.
8. **Save as plan.** Saves the ticked plans as one JSON file.

\newpage

