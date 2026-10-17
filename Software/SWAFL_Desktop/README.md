<p align="center"><img src="app/assets/logo-wordmark.svg" alt="SWAFL" width="360"></p>

# SWAFL — Soil Water, Atmosphere, Feedback and Layout workbench

A desktop application (Windows `SWAFL.exe`) for coupled water fluxes, pore-scale dynamics, precision irrigation and mulching feedback loops, with **surface, drip and sprinkler design** (layout drawings, pipe network, pump and hydraulic grade line, design checks).
It runs the same simulation engine as the web explorer, inside a professional workbench (MIKE Zero / QGIS style):

| Area | What it holds |
|---|---|
| **Menu bar** | File · Edit · View · Tools · Refresh · Review · Run · Help (Help opens this repository) |
| **Toolbar** | New / open / save, undo / redo, Run, Restart, 20-year run, Refresh, Baseline, Picture, design shortcuts |
| **Layers** (left, top) | Click a layer to open it; click a sub-layer to jump to that part of the drawing |
| **Processing Toolbox** (left, bottom) | Searchable ready-to-run tools: simulations, ready-made cases, design, compare, export |
| **Simulation window** (centre) | Document tabs, view bar (Layout design · Simulation · Pipes and pump · Results …) and the live drawing |
| **Properties** (right) | Every input: scenario, soil, tillage, crop, mulch, climate, irrigation, nitrogen |
| **Dashboard** (bottom) | Results, Design results, 20-year Charts, Messages |

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
npm run web      # then open http://127.0.0.1:5173/
```

## Project layout

```
main.js  preload.js  serve.js        Electron main process, secure bridge, local static server
app/index.html                       workbench window
app/css/swafl.css                    MIKE-style light palette
app/js/bridge.js                     talks to the simulation engine
app/js/ui.js layers.js toolbox.js props.js dashboard.js main.js
app/engine/engine.html               the SWAFL simulation engine (single file)
app/assets/                          logo (SVG/PNG)
build/icon.ico icon.png              application icon
docs/USER_GUIDE.md                   how to use SWAFL
```

See [docs/USER_GUIDE.md](docs/USER_GUIDE.md) for the step-by-step guide. Author: Naziru Halilu. MIT licence.

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
