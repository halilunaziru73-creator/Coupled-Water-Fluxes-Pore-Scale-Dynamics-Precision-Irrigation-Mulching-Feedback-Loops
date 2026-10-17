# SWAFL user guide

## 1. The workbench
* **Layers** – the project tree. Groups: *Field water balance*, *Irrigation control*, *Soil structure and tillage*, *Mulch and evaporation*, *Feedback loops*, *Irrigation design*. Click a layer to open it in a tab. Under **Irrigation design** every layer has sub-layers (the sections of the design drawing); click one to jump to it. `+` / `−` expand or collapse everything.
* **Processing Toolbox** – type in the search box (e.g. `drip`, `export`, `baseline`) and double-click a tool to run it.
* **Properties** – all inputs, grouped and collapsible. Changes apply instantly to the drawing and the dashboard. `Ctrl+Z` undoes a setting.
* **Dashboard** – *Results* (soil evaporation, transpiration, drainage, irrigation, yield, efficiency, nitrogen leaching…), *Design* (efficiencies, uniformity, times, volumes of the design you have open), *Charts* (20 weather years), *Messages* (log). Double-click the tab strip to collapse the dashboard; drag the splitters to resize any panel.

## Working date
The **Date** box in the toolbar (also in Properties → Scenario) moves the whole workbench to that date, from 1980 to 2100. 1980–1999 is the baseline record; later dates, including today, are projected from the baseline weather year you choose (typical, dry, wet or a single year). The status bar always shows the working date. **Today** jumps back to the current date.

## 2. Running a simulation
1. Choose a **Ready-made case** (Properties → Scenario, or Tools → Ready-made cases).
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

## 5. Files
* **Save project** – all settings in a `.swafl` file; **Open project** restores it.
* **Export** – picture (PNG), yearly results (CSV), design results (CSV). **Print** gives a PDF.

## 6. Keyboard shortcuts
`Ctrl+N/O/S` new/open/save · `Ctrl+Z/Y` undo/redo · `F5` run/pause · `Shift+F5` restart · `F6` refresh · `Ctrl+B` baseline · `Ctrl+E` picture · `Ctrl+P` print · `Ctrl+F` find a tool · `F1` help · `F11` full screen.

## 7. Help and source
Repository: <https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops>
