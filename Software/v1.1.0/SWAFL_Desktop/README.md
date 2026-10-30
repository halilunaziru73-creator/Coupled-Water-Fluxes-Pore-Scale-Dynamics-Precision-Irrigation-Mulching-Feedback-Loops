<p align="center"><img src="app/assets/logo-wordmark.svg" alt="SWAFL" width="360"></p>

<p align="center"><b>Download the SWAFL manual (PDF):</b> <a href="https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Software/v1.1.0/SWAFL_Desktop/docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf">version 1.1.0, this version</a> · <a href="https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0">online workbench</a></p>

<p align="center"><img src="docs/swafl_workbench.png" alt="SWAFL Desktop 1.1.0: the drip irrigation design with the soil water of the days ahead" width="900"></p>

# SWAFL — Soil Water, Atmosphere, Feedback and Layout workbench

SWAFL is built on 10,190 simulations of the [Daisy model](https://github.com/daisy-model), the soil-plant-atmosphere model developed at the University of Copenhagen, and includes a graphical workbench for running that model.

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

## Weather options

SWAFL does not depend on one weather record. The user chooses the weather of the whole project, and every layer, the dashboard and the Daisy runs follow it: (1) the built-in benchmark record (Taastrup, Denmark); (2) the bundled Daisy stations Taastrup, Foulum, Jyndevad (Denmark), Bologna (Italy), Jadwisin (Poland), Bratislava (Slovakia) and Valecov (Czech Republic), and the Daisy sample stations of other sites; (3) the user's own file (CSV, TXT, Excel, Daisy DWF, DLF or DAI); (4) online weather of any place on Earth from the Open-Meteo archive (checked for complete years); (5) DMI open data with the user's own free key. Any working date from 1980 to 2100 can be typed in the toolbar. The 10,190 archived runs used one fixed weather, Taastrup 1980 to 1999, so that the experiments are comparable; that is a choice of the experiment, not a limit of the software.

## Download the software (Windows)

**Windows app:** version 1.1.0 is run from source with the steps below, or online.

> Windows may show a SmartScreen warning because the app is not code-signed: click **More info**, then **Run anyway**.

**Prefer to build it yourself?** Use the options below.

**Option A - one paste in VS Code** (needs [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com); restart VS Code after installing them). Open `Terminal -> New Terminal` and paste:

```
git clone https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops.git
cd Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops\Software\v1.1.0\SWAFL_Desktop
npm.cmd install
npm.cmd run get-app
```

It downloads the app, builds `SWAFL.exe`, puts it on your Desktop and starts it. Next time just double-click **SWAFL** on the Desktop. Use `npm.cmd` (not `npm`) so PowerShell never blocks it. To update later: `git pull` in the `Software\v1.1.0\SWAFL_Desktop` folder, then `npm.cmd run get-app`.

**Option B - download the zip:** [SWAFL_Desktop.zip](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Software/v1.1.0/SWAFL_Desktop.zip). Extract it, open the inner `SWAFL_Desktop` folder (the one that contains `package.json`) in VS Code and run `npm.cmd install` then `npm.cmd run get-app`.

**Nothing to install - open the full SWAFL workbench online:** [https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0](https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0) (works in any browser, no server, no Node). Prefer the small explorer? [SWAFL web explorer](https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Results/04_Interactive_Charts/10_SWAFL_Fused_Explorer.html).

## No Node.js or npm on the computer? Double-click

Windows: double-click `START_SWAFL.bat` (the desktop program) or `START_SWAFL_WEB.bat` (in the browser). Mac: double-click `START_SWAFL.command` or `START_SWAFL_WEB.command`. Each looks for Node.js on the computer (the usual install folders too, so "npm is not recognised" no longer stops it) and, if it finds none, downloads a portable copy of about 30 to 40 MB into `tools/node`, which changes nothing else on the computer. The first start also downloads Electron once, so it needs the internet.

On a Mac, if the file will not open ("permission denied" or "unidentified developer"), open Terminal in this folder and type `chmod +x *.command tools/*.sh`, then right-click the file, choose Open, and confirm once. The Daisy program that comes with SWAFL is a Windows program: on a Mac the SWAFL layers, the scenarios setup and the experiment designs work, and Daisy itself runs only if you point SWAFL to a Daisy 7.1 built for the Mac (Daisy tab, Choose Daisy), or you save the experiment folder as a zip and run it on a Windows computer or a Linux/Mac with Daisy installed. `npm run dist:mac` builds a Mac app when run on a Mac.

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
docs/manual_v1.1.0/                  manual of version 1.1.0 (SWAFL_Manual_v1.1.0.pdf)
```

The program zip does not contain the manual PDF (42 MB); download it from the link at the top and put it in a folder called `Manual` next to the program, and F1 opens it from there. Without it, F1 opens the copy on GitHub. See [docs/USER_GUIDE.md](docs/USER_GUIDE.md) for the step-by-step guide and [docs/manual_v1.1.0](docs/manual_v1.1.0/README.md) for the manual of version 1.1.0 (one PDF, in the chapters of the 1.0 manual with every screenshot taken again from version 1.1.0 and the new chapters added). Author: Naziru Halilu. MIT licence.

## Troubleshooting

| Problem | Fix |
|---|---|
| "running scripts is disabled" (PowerShell) | Use a **Command Prompt** terminal, or `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or `cmd /c npm install` |
| `npm` not recognised | Install Node.js LTS, then restart VS Code |
| `ENOENT ... package.json` | Wrong folder: the zip makes a folder inside a folder; `cd` into the one showing `package.json` |
| `spawn ...daisy-7.1.xx-Windows-python3.13.exe EACCES`, or *Daisy gave no results (code -1)* | The Daisy **installer** was chosen as the program. Daisy is built into SWAFL (folder `daisy`): choose nothing. To use your own installation pick `bin\daisy-bin.exe`, never the installer |
| Slow/failed install in OneDrive | Copy the project to `C:\SWAFL_Desktop` and run there |
| "Windows protected your PC" | More info → Run anyway (app is not code-signed) |
| `Missing script: "get_app"` | Fixed in this version: `npm run get-app`, `npm run get_app` and `npm run getapp` all work. If you still see the message, the folder holds an older `package.json`: unzip the new zip into a new folder |
| `Cannot create symbolic link : A required privilege is not held by the client` (electron-builder, `winCodeSign`, `libcrypto.dylib`) | Windows does not let a normal user make symbolic links, and the build unpacks a signing tool that contains two. `npm run get-app` now retries by itself without that tool, so just run it again. Or enable **Developer Mode** (Settings, System, For developers) and delete `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`, or run the terminal as Administrator |
| Electron download fails | Check internet/VPN, delete `node_modules`, run `npm install` again |
| White window | Wait ~10 s, then Refresh → Reload simulation engine |
| No results visible | Press **Larger** on the Dashboard tab bar, choose the Results tab |
