# `\texorpdfstring{\chapicon{partpurple}{✎}}{}`{=latex}Learn the Daisy files: Common, .dai files and a sample experiment {#daisy-learn}

This chapter teaches how a Daisy experiment is made by hand, file by file, with a complete sample experiment that you can download from the program (*Daisy model, Documentation, Learn the Daisy files, Download the sample experiment*). Every file is printed in full. The labels `;<1>`, `;<2>` ... at the ends of the lines are explained in the table under each file; in the program the same labels are drawn as orange numbers. The sample has two runs, spring barley without and with irrigation, on the Taastrup weather of 1990 to 1996. Both were run with Daisy 7.1.14 for this manual: each finishes with a water balance error of 0.0 mm, and their logs come with the sample.

The grammar follows chapters 2 to 6 of the Daisy Program Reference Manual (concepts, nomenclature, the file parser, log files and error messages). The program also has the whole reference manual (*Reference manual* tab) and the Model builder, which writes any definition from a form.

## How a Daisy experiment is laid out

A Daisy experiment is a folder. The files that every run shares go into **Common**; each run has a folder of its own with one file, **run.dai**, which reads the common files and sets what is special about that run. Daisy writes the results of a run (the logs, **.dlf** files) into the folder of the run. This is how the Experiments tab of SWAFL writes its folders too.

```text
MyFirstExperiment/                  <1> the experiment folder
  Common/                           <2> what every run reads
    my-soil.dai                     <3> soil horizons and the soil column
    my-management.dai               <4> crop, fertiliser, tillage and irrigation
    my-logs.dai                     <5> which results are written
    Daily-1965-2000.dwf             <6> the daily weather
  run-rainfed/                      <7> run 1
    run.dai                             reads Common, sets weather, column, management, period
    Annual-Harvest.dlf, Daily-Theta.dlf ...  <8> the logs Daisy writes here
  run-irrigated/                        run 2: the same, with irrigation (one line differs)
    run.dai
    *.dlf
```


Table: The parts of an experiment folder.

| Label | Part | What it is |
|:--:|:--|:--|
| <1> | MyFirstExperiment/ | One folder for the experiment. Give it a name without spaces. |
| <2> | Common/ | The files every run shares. A run reads them with `(path "../Common" &old)`. |
| <3> | my-soil.dai | Soil: `defhorizon` for each layer and `defcolumn` for the profile. |
| <4> | my-management.dai | Management: `defaction` for the season, the fertiliser and the irrigation. |
| <5> | my-logs.dai | The output list: which logs, when, into which .dlf file. |
| <6> | *.dwf | The weather, a Daisy weather file. SWAFL writes one from online weather or from your own file in Input data. |
| <7> | run-rainfed/run.dai | One run: the only file in its folder before it runs. |
| <8> | *.dlf | The logs: tables of results with a header, read by Log plots, Mass balance and Run comparison. |


### Making an experiment, step by step

1. Make the folder `MyFirstExperiment` with a folder `Common` inside it.
2. Write the soil, `Common/my-soil.dai`: copy the file below, or build the horizons in the Model builder (component *horizon*) and the column (component *column*) and press *Save as .dai*.
3. Write the management, `Common/my-management.dai`, and the logs, `Common/my-logs.dai`.
4. Put a weather file in `Common`: the bundled one, one written by *Input data* from the online weather of your place, or your own.
5. Make a folder for each run with its `run.dai`. Copy the folder and change one line for each new run.
6. Run Daisy in each run folder (below), load the folders in *Log plots* and compare two runs in *Run comparison*.

The *Experiments* tab writes such a folder for you from a design (factors and their levels) and runs it; the next section shows what it writes.


## The grammar of a .dai file

A set-up file is a list of brackets. Each bracket starts with a name and holds values. Text after a semicolon is a comment that Daisy ignores. Numbers carry their unit in square brackets, text is in double quotes, and a bracket can hold other brackets.

```lisp
;; a comment: Daisy ignores everything after a semicolon   ;<1>
(dry_bulk_density 1.45 [g/cm^3])     ; an attribute: name, value, unit   ;<2>
(description "Ploughed topsoil")      ; a text value, in double quotes   ;<3>
(topsoil true)                        ; a boolean: true or false   ;<4>
(horizons (-30 [cm] "My Ap")           ; a list of pairs   ;<5>
          (-100 [cm] "My Bt"))
(water_factor (0.8 0.0) (0.9 0.2) (1.0 1.0))   ; a PLF: x y pairs of a piecewise linear function   ;<6>
(defhorizon "My C" "My Bt"              ; a definition: def + component, the new name, the model it builds on   ;<7>
  (humus 0.005 []))                     ; then only the attributes that differ
(input file "crop.dai")                 ; read another file (the library of crops)   ;<8>
(path "../Common" &old)                 ; where to look for files; &old keeps the old search path   ;<9>
```

Table: The labels of the grammar example.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `a comment` | A comment: everything after ; is ignored. ;; and ;;; are used for headings. |
| <2> | `(dry_bulk_density` | An attribute: (name value [unit]). The unit must be one Daisy knows; [] means no unit (a fraction). |
| <3> | `(description` | A string (text) value, always in double quotes. |
| <4> | `(topsoil true)` | A boolean value: true or false. |
| <5> | `(horizons` | A list: brackets inside a bracket. Here pairs of a depth and a horizon name. |
| <6> | `(water_factor` | A PLF (piecewise linear function): pairs of x and y. |
| <7> | `(defhorizon "My C"` | A definition: def followed by the component (horizon, column, crop, action, log...), the new name, and the model or earlier definition it builds on. Only the attributes that differ are written. |
| <8> | `(input file` | input file reads another set-up file, as if its text stood here. |
| <9> | `(path` | path sets the folders where Daisy looks for files. &old keeps the folders it already had, such as its own library. |


Table: The kinds of value (reference manual, chapter 4).

| Kind | Written as | Example |
|:--|:--|:--|
| number | a number and its unit in square brackets; `[]` for a fraction | `(K_sat 0.5 [cm/h])`, `(clay 0.12 [])` |
| integer | a whole number | `(time 1990 1 1)` |
| boolean | `true` or `false` | `(topsoil true)` |
| string | text in double quotes | `(description "Ploughed topsoil")` |
| PLF | pairs of numbers: a piecewise linear function | `(water_factor (0.8 0.0) (0.9 0.2) (1.0 1.0))` |
| list | several values or brackets in one attribute | `(horizons (-30 [cm] "My Ap") (-100 [cm] "My Bt"))` |
| component | the name of a model, with its own attributes in brackets | `(hydraulic hypres (topsoil true))` |
| definition | `def` + component, a new name, the model it builds on, then the attributes | `(defhorizon "My C" "My Bt" (humus 0.005 []))` |


## The soil: Common/my-soil.dai

The soil is built from horizons (the layers of the profile), and a column puts them together and adds the processes of the soil: water flow, the bottom boundary, organic matter and nitrogen.

```lisp
;;; my-soil.dai -- the soil of the experiment: three horizons and the soil column
;;; A horizon is one layer of soil; the column stacks the horizons and adds water,
;;; heat, organic matter and nitrogen to them.

;; (1) A horizon: def + component name, its name in quotes, the model it is built on (USDA3),
;;     then its attributes, each as (name value [unit]).
(defhorizon "My Ap" USDA3   ;<1>
  (description "Ploughed topsoil, 0 to 30 cm")
  (clay 0.12 [])(silt 0.25 [])(sand 0.63 [])   ; fractions, they add up to 1   ;<2>
  (humus 0.025 [])                              ; 2.5 % organic matter   ;<3>
  (dry_bulk_density 1.45 [g/cm^3])   ;<4>
  (C_per_N 11.0 [g C/g N])
  (hydraulic hypres (topsoil true)))            ; water retention and conductivity from the HYPRES pedotransfer function   ;<5>

(defhorizon "My Bt" USDA3
  (description "Subsoil with more clay, 30 to 100 cm")
  (clay 0.22 [])(silt 0.20 [])(sand 0.58 [])
  (humus 0.010 [])
  (dry_bulk_density 1.60 [g/cm^3])
  (C_per_N 11.0 [g C/g N])
  (hydraulic hypres (topsoil false)))

;; (2) A horizon can also inherit from another one and change only what differs.
(defhorizon "My C" "My Bt"   ;<6>
  (description "Parent material, 100 to 200 cm")
  (humus 0.005 [])
  (dry_bulk_density 1.65 [g/cm^3]))

;; (3) The column: the whole soil profile of the field.
(defcolumn "My column" default   ;<7>
  (Soil (MaxRootingDepth 120 [cm])              ; roots cannot go deeper   ;<8>
        (border -100 [cm])                      ; fluxes are also logged at this depth
        (horizons (-30  [cm] "My Ap")           ; each pair: the lower boundary and the horizon above it   ;<9>
                  (-100 [cm] "My Bt")
                  (-200 [cm] "My C")))
  (Movement vertical (Tertiary none))           ; one-dimensional water flow, no biopores
  (Groundwater deep)                            ; free drainage at the bottom   ;<10>
  (OrganicMatter original (init (input 3000 [kg C/ha/y]) (end -25 [cm])))   ;<11>
  (Chemistry original   ;<12>
    (combine (N (reaction nitrification
                          (denitrification (water_factor (0.8 0.0) (0.9 0.2) (1.0 1.0))))))))
```

Table: The labels of Common/my-soil.dai.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `(defhorizon "My Ap" USDA3` | A new horizon called My Ap, built on the model USDA3 (texture in USDA classes). Names with spaces go in quotes. |
| <2> | `(clay 0.12` | The texture as fractions of the mineral soil: clay, silt and sand add up to 1. |
| <3> | `(humus 0.025` | Organic matter, as a fraction (0.025 = 2.5 %). |
| <4> | `(dry_bulk_density 1.45` | Dry bulk density in g/cm3. |
| <5> | `(hydraulic hypres` | The water retention and the conductivity come from the HYPRES pedotransfer function. A measured curve is written with (hydraulic M_vG (Theta_sat ...)(alpha ...)(n ...)(K_sat ...)). |
| <6> | `(defhorizon "My C" "My Bt"` | A horizon that inherits everything from My Bt and changes only humus and density. |
| <7> | `(defcolumn "My column" default` | The column, built on the default column model. |
| <8> | `(MaxRootingDepth` | The deepest the roots can reach in this soil. |
| <9> | `(horizons (-30` | The profile: each pair is the lower boundary of a horizon (negative, downwards) and its name. |
| <10> | `(Groundwater deep)` | The bottom boundary: free drainage. Other choices are a groundwater table, an aquitard or a lysimeter. |
| <11> | `(OrganicMatter original` | The soil organic matter pools, started in equilibrium with 3000 kg C/ha of input a year in the top 25 cm. |
| <12> | `(Chemistry original` | Nitrogen: nitrification and denitrification, with the water factor of denitrification as a PLF. |


## The management: Common/my-management.dai

What the farmer does is written as actions. An action can be a list of operations that run one after the other (activity), and it can wait for a date or a condition between them.

```lisp
;;; my-management.dai -- what the farmer does: the crop, the fertiliser, the tillage and the irrigation

;; (1) The library files of Daisy that define the crops, the tillage operations and the fertilisers.
(input file "tillage.dai")   ;<1>
(input file "crop.dai")
(input file "fertilizer.dai")

;; (2) One season of spring barley, as a list of operations done one after the other.
(defaction SBarley_rainfed activity   ;<2>
  (wait_mm_dd 3 20) (plowing)                                  ; wait until 20 March, then plough   ;<3>
  (wait_mm_dd 4 5)  (fertilize (N25S (weight 120 [kg N/ha])))  ; 5 April: 120 kg N/ha of mineral fertiliser   ;<4>
  (seed_bed_preparation) (sow "Spring Barley")                 ; prepare the seed bed and sow   ;<5>
  (wait (or (crop_ds_after "Spring Barley" 2.0) (mm_dd 9 1)))  ; wait for maturity (DS 2) or 1 September   ;<6>
  (harvest "Spring Barley" (stub 8 [cm])))                     ; harvest, leaving 8 cm of stubble   ;<7>

;; (3) An irrigation rule: when the soil at 20 cm is drier than -300 cm (pF 2.5)
;;     between 1 May and 1 September, give 30 mm overhead (10 mm/h for 3 hours), then wait two days.
(defaction Irrigate_when_dry activity   ;<8>
  (wait (and (after_mm_dd 5 1)
             (before_mm_dd 9 1)
             (not (soil_water_pressure_above (height -20.0 [cm]) (potential -300 [cm])))))
  (irrigate_overhead 10 [mm/h] (hours 3))   ;<9>
  (wait_days 2))

;; (4) The same season with irrigation: the rule repeats while the barley season runs.
(defaction SBarley_irrigated activity
  (while (SBarley_rainfed) (repeat Irrigate_when_dry)))   ;<10>
```

Table: The labels of Common/my-management.dai.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `(input file "tillage.dai")` | The library files of Daisy that define the tillage operations, the crops and the fertilisers used below. |
| <2> | `(defaction SBarley_rainfed activity` | A new action called SBarley_rainfed: an activity, that is a list of operations done in turn. |
| <3> | `(wait_mm_dd 3 20) (plowing)` | wait_mm_dd waits until a month and day; plowing is a tillage operation of tillage.dai. |
| <4> | `(fertilize (N25S` | Fertilise with the mineral fertiliser N25S of fertilizer.dai, 120 kg N/ha. |
| <5> | `(sow "Spring Barley")` | Sow a crop of crop.dai. The name must be written exactly as there. |
| <6> | `(wait (or (crop_ds_after` | Wait until the crop reaches development stage 2 (maturity) or 1 September, whichever comes first. |
| <7> | `(harvest "Spring Barley"` | Harvest the crop, leaving 8 cm of stubble. |
| <8> | `(defaction Irrigate_when_dry activity` | An irrigation rule with a tensiometer at 20 cm: wait for a dry soil inside the irrigation window. |
| <9> | `(irrigate_overhead 10` | Sprinkle 10 mm/h for 3 hours (30 mm). |
| <10> | `(while (SBarley_rainfed) (repeat Irrigate_when_dry))` | Run the season and, at the same time, repeat the irrigation rule until the season ends. |


## The results: Common/my-logs.dai

Daisy writes nothing unless it is told to. The output list names the logs (defined in Daisy's own log.dai), when to write a line, and the file to write it to.

```lisp
;;; my-logs.dai -- which results Daisy writes, how often and into which file (.dlf)
;;; The log names ("harvest", "Field water", "Crop" ...) are defined in Daisy's own log.dai.   ;<3>

(input file "log.dai")   ;<1>

(output   ;<2>
  ;; once a year, on 1 April at midnight (the season runs from April to April)
  ("harvest"       (where "Annual-Harvest.dlf"))
  ("Field water"   (when (and (month 4) (mday 1) (hour 0))) (where "Annual-FWater.dlf"))   ;<4>
  ("Field water"   (when (and (month 4) (mday 1) (hour 0))) (to -100 [cm]) (where "Annual-FWater_100cm.dlf"))   ;<5>
  ("Field nitrogen" (when (and (month 4) (mday 1) (hour 0))) (to -100 [cm]) (where "Annual-FN_100cm.dlf"))
  ;; every day
  ("Crop"               (when daily) (where "Daily-CropProduction.dlf"))   ;<6>
  ("Field water"        (when daily) (where "Daily-FWater.dlf"))
  ("Soil Water Content" (when daily) (where "Daily-Theta.dlf")))
```

Table: The labels of Common/my-logs.dai.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `(input file "log.dai")` | The library of standard logs: harvest, Field water, Field nitrogen, Crop, Soil Water Content and many more. |
| <2> | `(output` | The output list: one entry for each log file. |
| <3> | `("harvest"` | The harvest log writes one line at each harvest: the yield and the stress of the crop. |
| <4> | `(when (and (month 4)` | when: a condition for writing a line; here on 1 April at midnight, so each line is one season. |
| <5> | `(to -100 [cm])` | to: the balance of the soil down to 100 cm only, so the drainage is the flow at 1 m. |
| <6> | `(when daily)` | Write one line every day. |


## The weather: a .dwf file

The weather file has a header of keywords and a table with one line per day (or hour). The header gives the station, its position, the period and fixed values such as the nitrogen deposition; the two lines over the table give the column names and their units.

```text
dwf-0.0 -- Control_WG_daily.txt   ;<1>

# General information about the station itself.
Station: Taastrup   ;<2>
Elevation: 30 m
Longitude: 12 dgEast 
Latitude: 56 dgNorth
TimeZone: 15 dgEast

# Information about the measurement conditions.
Surface: reference
ScreenHeight: 2.0 m

# General information about the available data.
Begin: 1965-01-01   ;<3>
End:   2000-12-31
Timestep: 24 hours

# Fixed deposit values.
NH4WetDep: 0.9 ppm   ;<4>
NH4DryDep: 2.2 kgN/ha/year
NO3WetDep: 0.6 ppm
NO3DryDep: 1.1 kgN/ha/year

TAverage: 8.6 dgC   ;<5>
TAmplitude: 8.6 dgC
MaxTDay: 209 yday

-------------------------------------------------------------------------------------   ;<6>
Year	Month	Day	Precip	T_min	T_max	VapPres	Wind	DiffRad	GlobRad	RefEvap   ;<7>
year	month	day	mm/d	dgC	dgC	hPa	m/s	kWh/d/m^2	kWh/d/m^2	mm/d
1965	1	1	0	-2.36	5.84	6.53	5.16	0.33	0.75	0
... (one line per day follows)
```

Table: The labels of the weather file.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `dwf-0.0` | The first line says that this is a Daisy weather file (dwf) and its version. |
| <2> | `Station:` | Station, elevation, longitude, latitude and time zone. |
| <3> | `Begin:` | The period and the time step of the data. |
| <4> | `NH4WetDep:` | Nitrogen in rain and dry deposition, added every day. |
| <5> | `TAverage:` | The mean and amplitude of the air temperature: they drive the soil temperature at the bottom. |
| <6> | `-----` | A line of dashes ends the header. |
| <7> | `Year` | The column names: date, precipitation, minimum and maximum temperature, vapour pressure, wind, radiation and reference evapotranspiration. |


Any daily weather can be written in this form. *Input data* writes a .dwf file from the online weather of a place (Open-Meteo, ERA5) or from a table of your own (CSV or Excel with date, rain, minimum and maximum temperature and radiation); the Daisy stations of the program are .dwf files too.


## One run: run-rainfed/run.dai

The run file reads the common files and sets everything that belongs to this run: the weather, the column, the management and the period. A second run differs only in what it changes.

```lisp
;;; run-rainfed/run.dai -- one run of the experiment: the files it reads and the settings of this run

(path "../Common" &old)                 ; also look for files in ../Common (&old keeps Daisy's own library)   ;<1>
(input file "my-soil.dai")              ; the soil horizons and the column   ;<2>
(input file "my-management.dai")        ; the crop and the field operations
(input file "my-logs.dai")              ; the results to write

;; the weather file gives radiation in kWh/d/m^2, a unit Daisy does not know: define it (1 kWh/d/m^2 = 41.67 W/m^2)
(defunit [kWh/d/m^2] SIfactor (mass 1) (time -3) (factor 41.67))   ;<3>
(weather default "../Common/Daily-1965-2000.dwf")   ; the daily weather of Taastrup, Denmark   ;<4>

(description "My first experiment: spring barley without irrigation")
(column "My column")                    ; the soil column to simulate   ;<5>
(manager activity (repeat SBarley_rainfed))   ; the management, repeated every year   ;<6>

(time 1990 1 1)                         ; the start of the simulation   ;<7>
(stop 1996 4 1)                         ; the end
(activate_output (after 1991 3 31 23))  ; write the logs only after one year of warm-up   ;<8>
```

Table: The labels of run-rainfed/run.dai.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `(path "../Common" &old)` | Look for files in ../Common as well as in Daisy's library. |
| <2> | `(input file "my-soil.dai")` | Read the soil, the management and the logs. |
| <3> | `(defunit [kWh/d/m^2]` | This weather file gives radiation in kWh/d/m2, which Daisy does not know: the unit is defined (41.67 W/m2). Without it Daisy stops with "No data for GlobRad". |
| <4> | `(weather default` | The weather file of the run. |
| <5> | `(column "My column")` | The soil column to simulate (defined in my-soil.dai). |
| <6> | `(manager activity (repeat SBarley_rainfed))` | The manager: the management action, repeated every year. The irrigated run has SBarley_irrigated here; that is its only difference. |
| <7> | `(time 1990 1 1)` | The start and the end of the simulation (year month day). |
| <8> | `(activate_output` | Start writing logs after one year of warm-up, so the start values of the soil do not count. |


The irrigated run is the same file with two lines changed: its description and the manager, `(manager activity (repeat SBarley_irrigated))`. Making a new run is copying a run folder and changing what the run is about.


## Run it and read the results

Run each run.dai with Daisy (in its own folder), or open the file in the set-up editor and press *Run Daisy* in the desktop app. Each run writes its logs into its folder. The logs of the two runs of this sample are included, so you can read them now.

- Windows: open a command window in `run-rainfed` and type `"C:\Program Files\Daisy\bin\daisy.cmd" run.dai`, then the same in `run-irrigated`.
- SWAFL desktop: open `run.dai` in the set-up editor and press *Run Daisy*, or let the Experiments tab write and run the folders.
- Daisy prints its progress and, at the end, the water balance of the whole run, `Balance (= In - Out - Increase) = 0.0 [mm]`.


Table: What the two runs of the sample give (Daisy 7.1.14). Yield: dry matter of the grain at harvest; the water terms are the seasons from 1 April, from Annual-FWater.dlf.

| Season | Yield rainfed, Mg/ha | Yield irrigated, Mg/ha | Irrigation, mm | Evapotranspiration rainfed, mm | Evapotranspiration irrigated, mm | Percolation rainfed, mm | Percolation irrigated, mm |
|:--|--:|--:|--:|--:|--:|--:|--:|

| 1991 | 5.30 | 5.30 | 120 | 489 | 502 | 183 | 290 |

| 1992 | 5.87 | 5.88 | 180 | 522 | 551 | 280 | 430 |

| 1993 | 5.94 | 5.96 | 150 | 526 | 540 | 98 | 234 |

| 1994 | 5.24 | 5.24 | 150 | 454 | 471 | 106 | 159 |

| 1995 | 6.00 | 6.00 | 180 | 545 | 556 | 9 | 225 |


In this wet climate the irrigation (120 to 180 mm a season) raises evapotranspiration a little but mostly drains through the soil: the percolation below the root zone roughly doubles, while the yield hardly changes. This is the kind of answer an experiment gives. *Load the logs of both runs* in the Learn tab puts the fourteen logs in *Log plots*; *Load them and compare the two runs* opens *Run comparison* with the two water balances (section [Run comparison](#daisy-compare)).


## When Daisy stops: messages and what to do

Daisy checks the file when it reads it (parser errors), before the run (completeness and consistency checks) and while it runs (runtime errors). The message gives the file, the line and the column. Each message below was written by Daisy 7.1.14 when the sample was run with one deliberate mistake. Each message gives the file, the line and the column (`run.dai:14:42`).

Table: Daisy messages, why they come and what to do. Every message was written by Daisy 7.1.14 on the sample with one deliberate mistake.

| Daisy says | Why | What to do |
|:--|:--|:--|
| `run.dai:14:42: Unknown 'crop' model 'Spring Barly' (error)` | A name that is not defined: misspelt, written with other spaces or capitals, or its file is not read. The same message comes for any component (column, horizon, action...). | Write the name exactly as in the library file (crop.dai lists the crops), and read that file with (input file "crop.dai"). |
| `run.dai:13:19: Unknown 'column' model 'My colum' (error)` | The column named in (column "...") is not defined. | Use the name of the defcolumn in my-soil.dai, letter for letter. |
| `run.dai:13:39: Unknown attribute 'dry_bulk_densty', did you miss a ')'? (error)` | An attribute name that the model does not have: misspelt, or a bracket closed too early so it lands in the wrong place. | Check the spelling in the reference manual (or build the model in the Model builder); count the brackets. |
| `run.dai:17:6: Unknown 'integer' model 'stop' (error) ... Unknown attribute 'activate_output', did you miss a ')'?` | A bracket is not closed: (time 1990 1 1 without its ). Daisy reads the next lines as part of it, so the first error is on the line after the mistake. | Look at the line above the first error. The set-up editor checks the brackets as you type. |
| `run.dai:13:52: expected [g/cm^3] got [g/cm3] (error)` | A unit written differently from the one Daisy knows. | Write the unit as the reference manual gives it ([g/cm^3], [cm/h], [kg N/ha]), or define a new one with defunit. |
| `Open 'my-log.dai' failed ... output is missing (error)` | A file named in (input file ...) does not exist in the folder or on the path, so what it defines is missing too. | Check the file name and the (path "../Common" &old) line. |
| `No data for 'GlobRad' (error) / Can't convert 'GlobRad' value of 0.39 [kWh/d/m^2] to [W/m^2] (warning)` | A column of the weather file is in a unit Daisy cannot convert. | Define the unit, as in run.dai: (defunit [kWh/d/m^2] SIfactor (mass 1) (time -3) (factor 41.67)). |
| `Value is -42 but should be >= 0 (error)` | A value outside its allowed range (a consistency check); here a follow-on error of the open bracket above. | The reference manual gives the range of every attribute; fix the first error first. |
| `Balance (= In - Out - Increase) = 0.0 [mm]` | Not an error: the water balance of the whole run, printed at the end. It should be 0.0. | If it is not near zero, use a smaller irrigation rate (mm/h), check the hydraulic parameters, and look at the Mass balance tab. |

Daisy also writes every message into `daisy.log` in the run folder. Warnings (such as a value it cannot convert) do not stop the run but should be read.


## Templates: one file, many runs

For calibration and for experiments with many runs, write the parameter that changes as a placeholder in braces. SWAFL (Calibration, Experiments) and daisypy-optim fill it with a value for each run.

```lisp
;; template: the value of K_sat and of the fertiliser are filled in for each run
(defhorizon "My Ap" USDA3
  (clay 0.12 [])(silt 0.25 [])(sand 0.63 [])(humus 0.025 [])
  (dry_bulk_density 1.45 [g/cm^3])
  (hydraulic M_vG (Theta_res 0.0 []) (Theta_sat 0.40 []) (alpha 0.045 [cm^-1]) (n 1.5 [])
                  (K_sat {Ksat} [cm/h]) (l -1.0 [])))   ;<1>
(defaction SBarley_N activity
  (wait_mm_dd 4 5) (fertilize (N25S (weight {Nrate} [kg N/ha]))))   ;<2>
```

Table: The labels of the template.

| Label | Where | What it does |
|:--:|:--|:--|
| <1> | `{Ksat}` | A placeholder: {name}. Each run replaces it with a number, for example 0.5. The Placeholders panel of the set-up editor lists them and lets you fill them in. |
| <2> | `{Nrate}` | Any value can be a placeholder; the unit stays outside the braces. |

The set-up editor lists the placeholders of a file in its *Placeholders* panel, says what each one means when it stands for an attribute of the reference manual, and fills them in; *Calibration* fills them for every trial of the search.


## The Common folder that the Experiments tab writes

The Experiments and Scenarios tabs write the same kind of folder, so it can be run anywhere and read by hand. The folder of one experiment holds:

```text
MyExperiment/
  Common/
    ArableFarmRotation.dai   the rotation: spring barley, winter barley, winter rape, winter wheat,
                             with the fertiliser and the tensiometer irrigation of the design
    ResFarm.dai              the soils of the project (horizons and columns)
    OutputLog.dai            the logs every run writes (annual and daily)
    UserSoil.dai             your own soil horizons, when you gave them in Input data
    <weather>.dwf            the weather of the runs
    <library files>          the files of the Daisy library a design uses (a crop, a fertiliser,
                             a horizon, a chemical, a management action or a program), copied
                             with the files they read in turn
  <run name>/run.dai         one folder for each run of the design
```

and the `run.dai` of each run has this form (the values are those of the run):

```lisp
;; SWAFL scenario "Irrigation", variant "Irrigated"
(input file "../Common/ArableFarmRotation.dai")
(input file "../Common/ResFarm.dai")
(input file "../Common/OutputLog.dai")
;; the Daisy library used by this run
(path "../Common" &old)
(input file "winterwheat.dai")
(defunit [kWh/d/m^2] SIfactor (mass 1)(time -3)(factor 41.67))
(weather default "../Common/Daily-1965-2000.dwf"
  (PrecipCorrect 1)
  (TempOffset 0))
(description "Irrigation - Irrigated")
(log_prefix "irrigated-")
(manager activity
  (repeat "A_F_R"))
(defcolumn "SWAFL column" "ResFarm column"
  (Bioclimate FAO56_daily))
(column "SWAFL column")
(time 1990 01 01)
(stop 2010 04 1)
(activate_output (after 1991 03 31 23))
;; logs of the Daisy library added to this run
(output &old ("Soil Water Content"))
```

`PrecipCorrect` and `TempOffset` scale the rain and shift the temperature of the weather (the climate factors of a design); `(defcolumn "SWAFL column" "ResFarm column" ...)` builds the column of the run on a column of the project and changes only what the run is about; `(output &old (...))` adds a log to the output list of OutputLog.dai. The Experiments chapter lists every factor and the line it writes.

## A checklist before you run

- Every bracket is closed: the set-up editor says *Brackets and quotes are balanced*.
- Every name you use is defined in a file that is read: crops in crop.dai, fertilisers in fertilizer.dai, tillage in tillage.dai, your own in Common.
- Units are written as the reference manual gives them, and the units of the weather file are known (or defined with `defunit`).
- Clay, silt and sand of each horizon add up to 1; the lowest horizon reaches the bottom of the column.
- `time` is before `stop`, and `activate_output` leaves a year of warm-up.
- The output list writes what you want to read: the annual balances for the water and nitrogen budgets, the daily logs for figures through time.
