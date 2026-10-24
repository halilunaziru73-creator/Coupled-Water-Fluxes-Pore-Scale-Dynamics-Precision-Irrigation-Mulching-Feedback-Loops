# SWAFL user guide

> **Manual of version 1.1.0 (PDF, 511 pages):** [SWAFL_Manual_v1.1.0.pdf](manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf) — opens with F1. The manual of version 1.0: [SWAFL_Manual.pdf](SWAFL_Manual.pdf) (https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/blob/main/Software/SWAFL_Desktop/docs/SWAFL_Manual.pdf) covers installation, every control and trigger, every layer and design simulation, the governing equations with citations, the dashboard, workflows and troubleshooting. The Markdown sources are in [manual/](manual/) (rebuild with `manual/build.sh`).


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

## 1. The workbench
* **Layers** – the project tree. Groups: *Field water balance*, *Irrigation control*, *Soil structure and tillage*, *Mulch and evaporation*, *Feedback loops*, *Irrigation design*. Click a layer to open it in a tab. Under **Irrigation design** every layer has sub-layers (the sections of the design drawing); click one to jump to it. `+` / `−` expand or collapse everything.
* **Processing Toolbox** – type in the search box (e.g. `drip`, `export`, `baseline`) and double-click a tool to run it.
* **Properties** – all inputs, grouped and collapsible. Changes apply instantly to the drawing and the dashboard. `Ctrl+Z` undoes a setting.
* **Dashboard** – *Results* (soil evaporation, transpiration, drainage, irrigation, yield, efficiency, nitrogen leaching…), *Design* (efficiencies, uniformity, times, volumes of the design you have open), *Charts* (20 weather years), *Messages* (log). Double-click the tab strip to collapse the dashboard; drag the splitters to resize any panel.

## Seeing the whole drawing
The drawing is fitted to the window automatically. Short scenes (for example Field balance) show completely with no scrolling. Very tall scenes (the irrigation designs) fit the width and use the view buttons to jump to a section. Press **Focus** (toolbar or `F9`) to hide all panels and see the whole drawing as large as possible; press `F9` again to restore them. *View → Drawing at full width* switches off the fit.

## Working date
The **Date** box in the toolbar (also in Properties → Scenario) moves the whole workbench to that date, from 1980 to 2100. 1980–1999 is the baseline record; later dates, including today, are projected from the baseline weather year you choose (typical, dry, wet or a single year). The status bar always shows the working date. **Today** jumps back to the current date.

## 2. Running a simulation
1. Choose a **Ready-made case** (Properties → Scenario, or Tools → Ready-made cases). The **Year** (1980 to 2100) and the **Date** are set in Properties → Scenario.
2. Press **Run** (`F5`). The season plays day by day; drag the slider to any date, or pick a weather year.
3. Change soil, tillage, mulch, rainfall, temperature, irrigation method, trigger or nitrogen in Properties.
4. **20-year run** shows all years in the Charts tab.

## 3. Comparing options
Press **Baseline** (`Ctrl+B`) to store the current results. Every Results card then shows the change (green = better, red = worse). *Clear* removes the baseline.

## 4. Irrigation design
Open **Irrigation design** in Layers.
* **Surface** – border/furrow/basin layout, advance and recession, hydrograph, infiltration, performance indices, design table, optimiser (*Tools → Optimise surface layout*).
* **Drip** – emitter soil moisture, lateral hydraulics, layout and infrastructure, results.
* **Sprinklers and pipes** – layout in plan, sprinkler and jet, water pattern and overlap, catch-can test, **pipe sizing, pump and hydraulic grade line**, **infrastructure layout (source, pump, filter, mainline, valves, submain, laterals)**, design checks.

Use the **view bar** above the drawing (*Layout design · Simulation · Pipes and pump · Infrastructure layout · Results · Design checks · Design table*) to jump between parts. Click and drag in the drawing to change lengths, spacing and times.

### Running a design
Opening a design layer does not start it. Click a value box to type the exact value with its unit (m or km, L/s or m³/h, ha or m² ...) or pick a value from the drop-down, then press **Run simulation**. After any change the results wait for the next run. **Find the most efficient inputs** searches and applies the inputs with the highest application efficiency. The dashboard **Design** tab shows the results of the run and the best combination; the **Charts** tab shows the hydrograph, the advance, cut-off and recession times, the infiltrated depth along the field and where the water goes. **View → Field sketch to design** turns a drawing of your field into the design inputs; **Tools → Compare the irrigation systems** lists the three systems side by side.

### Weather data
**File → Import weather data** reads a daily weather file (CSV, TXT, Excel, Daisy DWF or DLF). **File → Online weather for a location** gets the last twenty years and the 16-day forecast of a place. The whole program then runs on that weather; **Properties → Scenario → Weather source** switches back to the recorded weather of the simulations at any time.

### Virtual farm (under each design layer, and the button on the view bar of every layer)
A farm drawn in perspective with the water moving from the source to the plants for all six layouts: **furrow, basin,
border strip** (canal, lifting gate, siphons, tail-water ditch), **sprinkler, surface drip and subsurface drip** (well,
pump, filters, fertiliser tank, mainline, control valve, laterals). The gate or valve opens and closes on the dates of
the schedule predicted by the daily model (board at the gate: the next four irrigations and the hours open; tap one to
jump to it). Choose **Farmer opens the valve** or **Automatic controller** (sensor cable, controller and LED).
Below the farm: a cross-section showing where the water goes in the soil layers, the 30-day predicted schedule
(rain, irrigation, valve open, sensor depletion and trigger) and the fate of the next irrigation (stored in the root
zone, deep percolation, runoff, evaporation and drift) from the S2, S3 or S4 design. **Record video (20 s)** saves a
WebM film of the farm. Every control (soil, crop, mulch, rain, warming, trigger, sensor depth, method) changes the farm.

## 4a. Crops
Properties → Crop lists the Daisy cereal rotation (simulated) and 48 library crops in five groups: staple food crops (cassava, yam, rice, maize, sorghum, millet, cowpea, wheat, potato), cash and oil crops (groundnut, soybean, cotton, mustard, green gram, chickpea, oil palm, cocoa), vegetables (tomato, onion, cabbage, sweet pepper) and 27 trees, vines and palms. Each carries its crop coefficients (initial, mid-season, end), stage lengths, height, rooting depth, depletion fraction and yield-response factor; trees have planting densities. For library crops the Daisy cereal results are transferred to the crop with a daily FAO-56 root-zone balance on the same 20 weather years, and yield is shown as a percentage of the potential. The bar under the drawing says which model is used. **C1 Crop water requirement** shows
the Kc curve, the crop water use, the root-zone depletion and a table of all crops ranked by net irrigation (tap a row
to select the crop).

## 4b. Seasonal records: Daisy data
**Y1 Reliability over 20 seasons**, **W1 Full water balance** and **N4 Nitrogen budget** show every simulated year
(1 003 Daisy runs with 20 years each, from `Data/Comprehensive_Summary`): yield, irrigation, drainage and leaching by
year, exceedance curves, the full evapotranspiration split (transpiration, soil, canopy, litter, ponded-water and snow
evaporation) and the nitrogen inputs and losses.

## 5. Files
* **Save project** – all settings in a `.swafl` file; **Open project** restores it.
* **Export** – picture (PNG), yearly results (CSV), design results (CSV). **Print** gives a PDF.
* **Save full report as PDF** (`Ctrl+Shift+P`, File menu or the *Report* toolbar button) – the whole report of every layer, saved where you choose.

## 6. Keyboard shortcuts
`Ctrl+N/O/S` new/open/save · `Ctrl+Z/Y` undo/redo · `F5` run/pause · `Shift+F5` restart · `F6` refresh · `Ctrl+B` baseline · `Ctrl+E` picture · `Ctrl+P` print · `Ctrl+F` find a tool · `F1` opens the manual (PDF) · `Ctrl+Shift+P` full report as PDF · `F11` full screen.

## 7. Help and source
Repository: <https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops>
