## SWAFL Desktop 1.1.0 (latest)

The current version of the SWAFL soil-water and irrigation decision-support suite.

**What is new since 1.0**
- Graphical Daisy workbench: guided nine-step path, 17 prepared experiments, process map, soil column, response curves and calibration, with Daisy bundled for Windows
- Connection of Daisy to the decision layers (decision table, chemical budget)
- Library of 48 crops and deterministic virtual phenotyping (well watered and drought)
- Field sketch and the field on the map (Sentinel-2 indices, satellite image analysis, water sources)
- Weather is a choice of several sources: built-in benchmark record, bundled Daisy stations (Denmark, Italy, Poland, Slovakia, Czech Republic), your own file (CSV, Excel, DWF, DLF, DAI), online weather of any place, and DMI open data
- Working date from 1980 to 2100

**Assets**
- `SWAFL_Desktop.zip`: source of version 1.1.0. On Windows, unzip, install Node.js LTS, then run `npm.cmd install` and `npm.cmd run get-app` in the inner `SWAFL_Desktop` folder; it builds `SWAFL.exe`, puts it on the Desktop and starts it. Or double-click `START_SWAFL.bat`.
- `SWAFL_Manual_v1.1.0.pdf`: the user manual.
- Online workbench (no install): https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0

A prebuilt `SWAFL.exe` is not attached to 1.1.0. Windows may show a SmartScreen warning for a self-built app because it is not code-signed: click More info, then Run anyway. The older 1.0.0 release remains available below for reference.
