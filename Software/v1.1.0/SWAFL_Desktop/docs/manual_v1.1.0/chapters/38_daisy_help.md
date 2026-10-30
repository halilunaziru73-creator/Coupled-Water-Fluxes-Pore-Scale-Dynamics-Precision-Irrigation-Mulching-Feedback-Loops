# Limits, messages and glossary of the Daisy workbench {#daisy-help}

## What the workbench can and cannot do

| Question | Answer |
|:--|:--|
| Which runs need the Daisy program? | The scenarios, the experiments, the Processes figures that are drawn from a new run, the set-up editor run and the calibration against the program. They need the desktop app. Daisy 7.1.14 comes with SWAFL (the folder `daisy`), so nothing has to be installed. |
| The run says *spawn ...daisy-7.1.xx-Windows-python3.13.exe EACCES*, or *Daisy gave no results (code -1)* | The file chosen as the Daisy program was the Daisy **installer** (the file that is downloaded from the Daisy site). An installer asks for administrator rights, so Windows refuses to run it as the program (EACCES). Choose nothing: SWAFL uses its own Daisy. If you want your own installation, run the installer once, then in *Choose the Daisy program* pick `bin\daisy-bin.exe` in the folder where it installed Daisy (for example `C:\Program Files\Daisy\bin\daisy-bin.exe`). This version of SWAFL ignores an installer that was chosen earlier, and says so when the installer is chosen. |
| Which tools work without it? | The soil column, the process curves, the denitrification calibration, the Plot, Mass balance and Compare tabs for logs that are loaded, the Library and the Weather stations tabs. |
| Does the web version run Daisy? | No. A web page cannot start a program on the computer. The web version draws the tools above and shows the screens; the runs are made in the desktop app. |
| How many parameters can be varied? | Thirty two parameters of the Daisy reference are tested and can be varied in an experiment, together with the factors of the farm such as rain, temperature, irrigation trigger and fertiliser. The other parameters of the 107 topics are described but not varied. |
| Which years can be simulated? | Daisy starts one year after the first year of the weather. A weather record of at least six years is therefore needed. |
| Is online weather complete? | Only complete years up to last year are asked for. A request that ends in the current year is refused by the weather service. |
| What are the sources of online weather? | Daily data of the Open-Meteo archive, which is based on the ERA5 reanalysis. They are checked before use and the checks are shown. |

## Messages and what to do

| Message | Meaning | What to do |
|:--|:--|:--|
| No data to draw from yet | The Process map tab has no run to read. | Press Run Daisy with my data and all process logs, run a scenario, or load logs in Files. |
| Not used: radiation is not in the data | The weather has no radiation column, and the latitude is not known. | Give the place in Input data, so that the latitude is found, or type the latitude. |
| Ask for at least six years | The weather record is too short for Daisy. | Choose a longer period of years. |
| No connection to the weather service | The internet is not reachable. | Use a weather file in Input data, or try again when online. |
| The weather service answered HTTP 400 | The request was refused, for example because it ended after the last complete year. | Choose a last year before the current year. |
| Daisy is not available here | The program is not found or the web version is open. | Open the desktop app and choose the Daisy program once in Scenarios. |

## Glossary

**Action.** A management operation of a set-up, such as sowing, tillage, fertilising or irrigation.

**Biopore.** A channel in the soil, made by roots or worms, through which water and solutes move faster than through the soil matrix.

**Bioclimate.** The part of Daisy that shares energy and water between canopy, litter, snow, pond and soil.

**Calibration.** The search for parameter values that bring the results of the model close to measurements or to results of another model.

**Combination.** A set of factors that the Start from the Daisy reference list offers to compare, with the reason it is offered.

**Component.** A named part of the Daisy model with its own parameters, such as a crop, a horizon or a log.

**Design.** The plan of an experiment: one factor at a time, factorial, Latin hypercube or another plan.

**Experiment.** A set of runs that differ in chosen factors, designed and run together.

**Factor.** A quantity that is changed from run to run, with the levels that are tried.

**Field capacity.** The water content that a soil holds against drainage, near pF 2.

**Horizon.** A layer of the soil profile with its own texture and hydraulic properties.

**Log.** A file in which Daisy writes the values of chosen variables through time; the extension is dlf.

**Mass balance.** The check that what enters a system, what leaves it and what it holds agree.

**pF.** The common logarithm of the suction of soil water in cm. Field capacity is near pF 2 and the wilting point at pF 4.2.

**Process.** A part of the model drawn in the map of the Process map tab, such as soil water or nitrate.

**Response.** A result measured in every run, such as yield, irrigation or nitrate leached.

**Richards equation.** The equation of water movement in unsaturated soil, solved by the soil column and by Daisy.

**Raw output.** The files Daisy wrote in a run, exactly as written: the logs (.dlf), the .csv files and daisy.log. SWAFL keeps them in Documents / SWAFL Daisy runs and gives them for download under the figures.

**Scenario.** A ready question about the built-in farm with the runs that answer it.

**Set-up.** The file, with the extension dai, that describes a whole simulation.

**Trigger.** The soil water potential at which irrigation starts.

**van Genuchten and Mualem model.** The description of the retention and conductivity curves of a soil used by the horizons of the library.

**Weather station.** A weather file in the Daisy format, with the extension dwf.

**Wilting point.** The water content at which plants cannot take up water, near pF 4.2.
