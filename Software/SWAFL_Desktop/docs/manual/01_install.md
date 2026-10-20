# Installing and starting SWAFL

## What you receive

SWAFL Desktop is a self-contained Electron program. The simulation engine is one HTML file (`app/engine/engine.html`) that the program serves to itself on a local port, so **no internet connection is needed once it is installed**. Three ways of running it are provided.

| Route | Who it suits | Steps |
|:--|:--|:--|
| **A. Windows program** | Most users | Download `SWAFL.exe` from the repository's *Releases* page and double-click it. |
| **B. Online workbench** | No install at all | Open the "Online workbench" link in the repository README (it points to `Software/SWAFL_Desktop/app/index.html` on GitHub Pages) in any modern browser. |
| **C. From source** | Developers | `npm install`, then `npm start` (desktop) or `npm run web` (browser). |

## Route A — the Windows program, step by step

1. Open the repository's **Releases** page and choose the latest release (v1.0.0).
2. Under *Assets*, click **SWAFL.exe**. Your browser downloads a single file of about 180 MB.
3. Double-click **SWAFL.exe**. If Windows SmartScreen shows "Windows protected your PC", click **More info** and then **Run anyway**. (The program is not code-signed; this warning is expected for unsigned programs.)
4. The splash screen appears for a few seconds while the engine loads, then the *Welcome to SWAFL* window opens. Click **Close**.
5. The workbench opens on the **Field balance** layer for today's date.

## Route C — from source

```
git clone https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops.git
cd Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/SWAFL_Desktop
npm install
npm start          # desktop window
npm run web        # the same program in a browser tab on http://127.0.0.1:5199
```

Alternatively, double-click `START_SWAFL.bat` (desktop) or `START_SWAFL_WEB.bat` (browser). `BUILD_AND_INSTALL_SWAFL.bat` builds the installer, and `get-app.js` builds, copies the program to the Desktop and starts it.

## Requirements

* Windows 10 or 11 (64-bit) for `SWAFL.exe`; any current Chrome, Edge, Firefox or Safari for the online workbench.
* A screen of at least 1280 $\times$ 720 px. The layout is designed for 1600 $\times$ 900 and scales down by hiding panels you do not need (Section 2.5).
* About 400 MB of free memory. The 20-year daily simulation is computed in the program; no server is involved.

## First-run check

After start-up, verify three things: (i) the status bar at the bottom reads *Ready*; (ii) the dashboard on the right shows *On* followed by today's date with numbers in the tiles; (iii) clicking **Surface irrigation design** in the Layers panel opens a drawing with a border strip. If the drawing area stays blank, see Chapter 16.

![The workbench on first start (Surface irrigation design layer, today's date). Left: Layers and Processing Toolbox. Centre: the drawing. Right of the drawing: Results dashboard. Far right: Properties. The numbered arrows point to 1 the layer in the Layers tree, 2 the drawing area, 3 the Play button of the playback bar, 4 the Results tab of the Dashboard and 5 the Scenario section of Properties.](images/wb/wb_sid.jpg){width=100%}
