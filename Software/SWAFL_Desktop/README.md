<p align="center"><img src="app/assets/logo-wordmark.svg" alt="SWAFL" width="360"></p>

# SWAFL — Soil Water, Atmosphere, Feedback and Layout workbench

A desktop application (Windows `SWAFL.exe`) for coupled water fluxes, pore-scale dynamics, precision irrigation and mulching feedback loops, with **surface, drip and sprinkler design** (layout drawings, pipe network, pump and hydraulic grade line, design checks).
It runs the same simulation engine as the web explorer, inside a classic engineering workbench (grey 3-D chrome, white data tree, task tabs and status bar):

| Area | What it holds |
|---|---|
| **Menu bar** | File · Edit · View · Tools · Refresh · Review · Run · Help (`F1` opens the manual; File → *Save full report as PDF*) |
| **Toolbar** | New / open / save, undo / redo, Run, Restart, 20-year run, Refresh, Baseline, Picture, design shortcuts |
| **Layers** (left, top) | Click a layer to open it; click a sub-layer to jump to that part of the drawing |
| **Processing Toolbox** (left, bottom) | Searchable ready-to-run tools: simulations, ready-made cases, design, compare, export |
| **Simulation window** (centre) | Document tabs, view bar (Layout design · Simulation · Pipes and pump · Results …) and the live drawing |
| **Properties** (right) | Every input: scenario, soil, tillage, crop, mulch, climate, irrigation, nitrogen |
| **Dashboard** (bottom) | Results, Design results, 20-year Charts, Messages |

## Download the software (Windows)

**[Download SWAFL.exe for Windows](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/releases/latest/download/SWAFL.exe)** (180 MB, no installation: double-click to run) · [all releases](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/releases/latest)

> Windows may show a SmartScreen warning because the app is not code-signed: click **More info**, then **Run anyway**.

**Prefer to build it yourself?** Use the options below.

**Option A - one paste in VS Code** (needs [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com); restart VS Code after installing them). Open `Terminal -> New Terminal` and paste:

```
git clone https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops.git
cd Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops\Software\SWAFL_Desktop
npm.cmd install
npm.cmd run get-app
```

It downloads the app, builds `SWAFL.exe`, puts it on your Desktop and starts it. Next time just double-click **SWAFL** on the Desktop. Use `npm.cmd` (not `npm`) so PowerShell never blocks it. To update later: `git pull` in the `Software\SWAFL_Desktop` folder, then `npm.cmd run get-app`.

**Option B - download the zip:** [SWAFL_Desktop.zip](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Software/SWAFL_Desktop.zip). Extract it, open the inner `SWAFL_Desktop` folder (the one that contains `package.json`) in VS Code and run `npm.cmd install` then `npm.cmd run get-app`.

**Nothing to install - open the full SWAFL workbench online:** [https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/SWAFL_Desktop/app/index.html?v=1.1.0](https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/SWAFL_Desktop/app/index.html?v=1.1.0) (works in any browser, no server, no Node). Prefer the small explorer? [SWAFL web explorer](https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Results/04_Interactive_Charts/10_SWAFL_Fused_Explorer.html).

## Run it in VS Code (3 commands)

1. Install **Node.js 18+** from <https://nodejs.org>.
2. Open this folder in VS Code (`File → Open Folder…`), open the terminal (`Ctrl+\``) and run:

```bash
npm install        # downloads Electron (once)
npm start          # opens the SWAFL window
```

## One command: build the app, put it on your Desktop, start it

```bash
npm install
npm run get-app
```

(or double-click `BUILD_AND_INSTALL_SWAFL.bat`). Afterwards just double-click **SWAFL** on your Desktop, with no code.

## Make the downloadable `SWAFL.exe`

On **Windows**:

```bash
npm run dist
```

Result in `dist/`:

* `SWAFL.exe` – portable, double-click to run (no install)
* `SWAFL-Setup.exe` – installer with desktop shortcut

Without a Windows PC: push this folder to GitHub — the workflow `.github/workflows/build-exe.yml` builds `SWAFL.exe` on a Windows runner. Open the repository's **Actions** tab → *Build SWAFL.exe* → download the artifact (or the file attached to a Release when you push a tag such as `v1.0.0`).

## Use it in a browser (no Electron)

```bash
npm run web      # only for developers; everyone else: use the online link above
```

## Project layout

```
main.js  preload.js  serve.js        Electron main process, secure bridge, local static server
app/index.html                       workbench window
app/css/swafl.css classic.css        workbench palette and classic 3-D theme
app/js/bridge.js                     talks to the simulation engine
app/js/ui.js layers.js toolbox.js props.js dashboard.js main.js
app/engine/engine.html               the SWAFL simulation engine
app/engine/crops.js                  crop library (FAO-56 Kc, stages, roots, Ky; field, tree, vine and bush crops)
app/engine/peryear.js                per-year Daisy balances of 1 003 runs (built by tools/make_peryear.py)
app/engine/plus_core.js              crop water balance, crop drawings, auto-fit of long views, F1 manual
app/engine/plus_layers.js            year-by-year, full water balance, nitrogen budget, crop water layers
app/engine/farm.js                   virtual farm: source to plants, gate/valve on the predicted schedule, video
app/engine/inputs.js                 design inputs as value boxes with units, Run simulation, most efficient inputs, design charts
app/engine/weather.js                weather import (CSV, Excel, DWF, DLF) and online daily weather with forecast
app/engine/vendor/xlsx.full.min.js   spreadsheet reader for Excel weather files (SheetJS, Apache 2.0 licence)
app/js/weatherui.js sketch.js        weather dialogs; field sketch to design and comparison of the systems
tools/make_peryear.py                extracts the per-year data from Data/Comprehensive_Summary
app/assets/                          logo (SVG/PNG)
build/icon.ico icon.png              application icon
docs/USER_GUIDE.md                   how to use SWAFL
docs/manual_v1.1.0/                  manual of version 1.1.0 (SWAFL_Manual_v1.1.0.pdf, 511 pages)
docs/SWAFL_Manual.pdf                manual of version 1.0 (sources in docs/manual/)
```

See [docs/USER_GUIDE.md](docs/USER_GUIDE.md) for the step-by-step guide and [docs/manual_v1.1.0](docs/manual_v1.1.0/README.md) for the manual of version 1.1.0 (one PDF of 511 pages, in the chapters of the 1.0 manual with every screenshot taken again from version 1.1.0 and the new chapters added; the manual of version 1.0 stays in [docs/SWAFL_Manual.pdf](docs/SWAFL_Manual.pdf)). Author: Naziru Halilu. MIT licence.

## Troubleshooting

| Problem | Fix |
|---|---|
| "running scripts is disabled" (PowerShell) | Use a **Command Prompt** terminal, or `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or `cmd /c npm install` |
| `npm` not recognised | Install Node.js LTS, then restart VS Code |
| `ENOENT ... package.json` | Wrong folder: the zip makes a folder inside a folder; `cd` into the one showing `package.json` |
| Slow/failed install in OneDrive | Copy the project to `C:\SWAFL_Desktop` and run there |
| "Windows protected your PC" | More info → Run anyway (app is not code-signed) |
| Build error about symlinks/permissions | Enable Windows Developer Mode or run the terminal as Administrator |
| Electron download fails | Check internet/VPN, delete `node_modules`, run `npm install` again |
| White window | Wait ~10 s, then Refresh → Reload simulation engine |
| No results visible | Press **Larger** on the Dashboard tab bar, choose the Results tab |
