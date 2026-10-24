# Files, exports and troubleshooting

## What can be saved

| Item | Menu / toolbox | File | Contents |
|:--|:--|:--|:--|
| Report | *File ▸ Save report as PDF (choose the layers)…*, Ctrl+Shift+P, toolbar *Report* | `SWAFL_full_report_<soil>_<date>.pdf` | The layers you ticked, each with your inputs, its key numbers and its full drawing (Chapter 23) |
| Picture of the window | *File ▸ Export ▸ Picture of the window (PNG)*, Ctrl+E | `SWAFL_<layer>.png` | The whole drawing of the open layer, top to bottom |
| Yearly results | *File ▸ Export ▸ Yearly results (CSV)* | `SWAFL_yearly_results.csv` | Two comment lines with soil, tillage, crop, mulch and method; then `Year, Rain_mm, Irrigation_mm, Drainage_mm, Evaporation_mm, Transpiration_mm` |
| Design results | *File ▸ Export ▸ Design results (CSV)* | `SWAFL_design_<id>.csv` | Two columns `Quantity,Value`: every number the open design layer computed |
| Project | *File ▸ Save project* | `SWAFL_project.swafl` | JSON: app name and version, the open layer, the state, the year and the date |
| Virtual farm video | *Record video (20 s)* on the farm | `SWAFL_virtual_farm_<date>.webm` | Twenty seconds of the farm, from two days before the next irrigation |
| Print | *File ▸ Print / save this view as PDF*, Ctrl+P | PDF | The open layer through the system print dialog |

In the yearly CSV, *Year* is the index 1–20 of the 20-year run starting at the calendar year shown on the Charts tab; the values are the annual sums of Eq. (14.5), rounded to 0.01 mm. In the design CSV the quantity names are the internal names of the model (for example `Ea`, `Es`, `dp`, `ro` for the surface layer; `Eu`, `gross`, `t` for drip; `CU`, `DU`, `AR`, `T` for sprinkler); the efficiencies are fractions (0–1).

The imported weather is not stored in the project file; import it again after opening a project, or keep the file beside the project.

## Troubleshooting

| Problem | Fix |
|:--|:--|
| "Running scripts is disabled" in PowerShell | Use a Command Prompt terminal, or run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or type `cmd /c npm install`. |
| `npm` is not recognised | Install Node.js, then close and reopen the terminal. |
| `ENOENT … package.json not found` | You are in the wrong folder; the zip makes a folder inside a folder. `cd` into the one that contains `package.json`. |
| Install or build is slow or fails inside OneDrive | Copy the project to `C:\SWAFL_Desktop` and run it there. |
| "Windows protected your PC" | Click *More info ▸ Run anyway* (the app is not code-signed). |
| The window still shows version 1.0 | An old `SWAFL.exe` is still on the Desktop or pinned. Delete it and run `BUILD_AND_INSTALL_SWAFL.bat` again: the build removes the old `dist` folder first and the program clears its cache on start. |
| White or empty window | Wait 10 seconds (the engine loads), then *Refresh ▸ Reload simulation engine*. Close any second SWAFL window. |
| A design shows *Run the design* instead of results | The inputs or a setting changed since the last run. Press **Run simulation**. |
| The virtual farm asks to run a design | The farm follows the last run of its design (Chapter 20). Press **Run the … design now**. |
| A design layer shows "the stream does not reach the end" | The cut-off time is shorter than the advance time: increase the cut-off or the inflow (Eq. 11.16), or shorten the run. |
| $E_a$ is low and runoff is high (sprinklers) | The application rate is above the soil intake: reduce the nozzle or the pressure, widen the spacing (Chapter 13). |
| A weather file is refused | Read the message: the file needs a date column (or year, month and day) and a rain column with their names in a header row. A Daisy setup file (`.dai`) holds no weather: the message names the weather file it uses; import that file (Chapter 19). |
| The online weather is not reachable | The computer is offline or the service does not answer. The current weather stays in use; try again later or import a file. |

If a problem remains, open an issue on the project page, and attach the `.swafl` file and the text of the *Messages* tab.
