# Exports, files and troubleshooting

## What can be saved

| Item | Menu / toolbox | File | Contents |
|:--|:--|:--|:--|
| Picture of the window | *File ▸ Export ▸ Picture of the window (PNG)*, Ctrl+E, toolbar *Picture* | `SWAFL_<layer>.png` | The drawing canvas of the open layer |
| Yearly results | *File ▸ Export ▸ Yearly results (CSV)*, toolbar *Results* | `SWAFL_yearly_results.csv` | Two comment lines with soil, tillage, crop, mulch and method; then columns `Year, Rain_mm, Irrigation_mm, Drainage_mm, Evaporation_mm, Transpiration_mm` |
| Design results | *File ▸ Export ▸ Design results (CSV)* | `SWAFL_design_<id>.csv` | Two columns `Quantity,Value`: every number the open design layer computed |
| Project | *File ▸ Save project* | `SWAFL_project.swafl` | JSON: app name and version, the open layer, the state, the year and the date |
| Print | *File ▸ Print*, Ctrl+P | PDF | The open layer |

In the yearly CSV, *Year* is the index 1–20 of the 20-year run starting at the calendar year shown on the Charts tab; the values are the annual sums of Eq. (14.5), rounded to 0.01 mm. In the design CSV the quantity names are the internal names of the model (for example `Ea`, `Es`, `dp`, `ro` for the surface layer; `Eu`, `gross`, `t` for drip; `CU`, `DU`, `AR`, `T` for sprinkler); the efficiencies are fractions (0–1).

## Troubleshooting

| Problem | Fix |
|:--|:--|
| "Running scripts is disabled" in PowerShell | Use a Command Prompt terminal, or run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or type `cmd /c npm install`. |
| `npm` is not recognised | Install Node.js, then close and reopen VS Code. |
| `ENOENT … package.json not found` | You are in the wrong folder; the zip makes a folder inside a folder. `cd` into the one that contains `package.json`. |
| Install or build is slow or fails inside OneDrive | Copy the project to `C:\SWAFL_Desktop` and run it there. |
| "Windows protected your PC" | Click *More info ▸ Run anyway* (the app is not code-signed). |
| Build error about symbolic links or permissions | Turn on Windows Developer Mode or run the terminal as Administrator; repeat `npm run get-app`. |
| Download of Electron fails | Check internet, VPN and firewall; delete `node_modules` and run `npm install` again. |
| White or empty window | Wait 10 seconds (the engine loads), then *Refresh ▸ Reload simulation engine*. Close any second SWAFL window. |
| A design layer shows "the stream does not reach the end" | The cut-off time is shorter than the advance time: increase the cut-off or the inflow (Eq. 11.16). |
| Efficiency $E_a$ is low and runoff is high (sprinkler) | The application rate is above the soil intake: reduce the nozzle or pressure, widen the spacing (Chapter 13, "The soil intake, ponding and runoff"). |
| The Design tab says to open a design layer | Open one of the three layers under *Irrigation design*. |

If a problem remains, open an issue on the project page, and attach the `.swafl` file and the text of the *Messages* tab.
