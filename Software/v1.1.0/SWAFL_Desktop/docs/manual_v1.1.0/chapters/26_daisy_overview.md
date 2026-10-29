# The Daisy workbench: overview {#daisy-overview}

The Daisy workbench is the part of SWAFL that runs the Daisy 7.1.14 model, draws its results and tests it. It opens from the button Daisy model of the toolbar. The tabs are in groups that follow what a person does: give the data, ask a question, look at the results, decide in the SWAFL project, and, apart from that path, build and test and learn. A bar above every tab on the path, with the buttons Back and Next, leads through the steps in this order (Chapter 31).

| Group | Tab | What it is for |
|:--|:--|:--|
| Input data | Input data | Set the weather (online stations, a file, the stations bundled with Daisy) and the soil of the site once; every simulation uses them. |
| Input data | Parameter library | Read the horizons, crops, fertilisers and other entries of the Daisy library. |
| Experiments | Experiments | Design your own set of runs from 53 factors, or start from 27 best combinations. |
| Experiments | Scenarios | Five ready questions about water, nitrogen, climate, a chemical and soil. |
| Results and analysis | Process map | A map of the model processes with the figures of each one. |
| Results and analysis | Log plots | Load logs (or take the output of your runs) and draw any column of them. |
| Results and analysis | Mass balance | Check that inputs, outputs and content agree. |
| Results and analysis | Run comparison | Compare two logs against the smallest meaningful level. |
| Decision support | To the SWAFL layers | Take the results to the layers of the SWAFL project that turn them into decisions. |
| Model development | Set-up editor | Edit and run a Daisy set-up file. |
| Model development | Soil column | Solve the Richards equation for a soil column. |
| Model development | Response curves | Draw any function of the Daisy library. |
| Model development | Calibration | Search parameters with three optimisers. |
| Documentation | Model and documentation | The model, the questions and where each is answered, the downloads. |

The chapters that follow take the groups in this order. Every screen is shown with numbered arrows; the list under it says what each arrow points to.

**How the weather is chosen.** The weather of a run is chosen once in the strip at the top of the Scenarios, Experiments and Processes tabs, and its source is set in My data. The choices are the weather of the SWAFL project, the built-in Taastrup weather, one of the bundled stations, online weather of a place and a file of your own. All simulations then use that weather, so a figure and the project always agree.

**What runs where.** The scenarios, experiments, set-up editor and calibration against the Daisy program need the desktop app. Daisy 7.1.14 for Windows comes with SWAFL (the folder `daisy` next to the program) and starts by itself, so nothing has to be installed or downloaded. The soil column, the process curves and the denitrification calibration run in the web version too. The figures of results that are drawn here come from real Daisy runs of the built-in farm for the years 1990 to 1993.

