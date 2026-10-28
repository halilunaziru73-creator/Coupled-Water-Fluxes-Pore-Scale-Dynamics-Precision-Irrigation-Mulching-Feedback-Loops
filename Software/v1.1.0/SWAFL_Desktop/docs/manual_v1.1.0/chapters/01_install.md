# Installing and starting SWAFL

## What you receive

SWAFL Desktop is a self-contained Electron program. The simulation engine is one HTML page (`app/engine/engine.html`) with a few script files beside it, which the program serves to itself on a local port, so **no internet connection is needed once it is installed**. The internet is used only if you ask for the online weather of a location (Chapter 19). Four ways of running it are provided.

| Route | Who it suits | Steps |
|:--|:--|:--|
| **A. Build and install on Windows** | Most users | Unzip `SWAFL_Desktop.zip`, double-click `BUILD_AND_INSTALL_SWAFL.bat`. |
| **B. Windows program** | Users who received `SWAFL.exe` | Double-click `SWAFL.exe`. |
| **C. From source** | Developers | `npm install`, then `npm start` (desktop) or `npm run web` (browser). |
| **D. Online, nothing to install** | Anyone with a browser | Open the online workbench (link below). |

## Route A: build and install, step by step

1. Install **Node.js** (the LTS version) from nodejs.org if it is not already installed. Close and reopen any terminal afterwards.
2. Unzip `SWAFL_Desktop.zip` to a short path outside cloud-synchronised folders, for example `C:\SWAFL_Desktop`. The zip contains a folder `SWAFL_Desktop`; the folder you work in is the one that contains `package.json`.
3. Double-click **`BUILD_AND_INSTALL_SWAFL.bat`**. It installs the packages, builds the program and puts **SWAFL** on the Desktop. The first build downloads Electron and takes a few minutes.
4. Start **SWAFL** from the Desktop. The title bar reads *SWAFL 1.1.0*. If Windows SmartScreen shows "Windows protected your PC", click **More info** and then **Run anyway** (the program is not code-signed).

`START_SWAFL.bat` starts the program from the source folder without building it, and `START_SWAFL_WEB.bat` opens the same program in your browser from your own computer.

## Route D: the online workbench

The same program runs online in any current browser, with nothing to install and no server or Node.js:

[SWAFL 1.1.0 online workbench](https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0)

<https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0>

## Route C: from source

```
git clone https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops.git
cd Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop
npm install
npm start          # desktop window
npm run web        # the same program in a tab of your browser
npm run get-app    # build SWAFL.exe, copy it to the Desktop and start it
```

## If the build stops

**The command is not found.** The script is called `get-app`, with a hyphen: `npm run get-app`. Typing `npm run get_app` gives the message *Missing script: "get_app"* and npm suggests the right name.

**The message "Cannot create symbolic link : A required privilege is not held by the client".** It appears during the step *packaging* of the build, after the line that downloads `winCodeSign`, and it names the files `libcrypto.dylib` and `libssl.dylib`. The build tool unpacks a code-signing package that contains two symbolic links, and Windows allows a normal user to create symbolic links only when Developer Mode is on or the terminal runs as Administrator. The program does not need code signing, so there are three ways out, in this order:

1. Run `npm run get-app` again. This version of the script notices the error, deletes the unfinished `dist` folder and builds again with the signing step switched off, so the build finishes without any change of settings. The program that results works in the same way; only the file properties of `SWAFL.exe` carry no icon and version signature.
2. Turn on **Developer Mode** (Settings, System, For developers), delete the folder `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`, and run the command again.
3. Open the terminal with **Run as administrator**, go to the folder that holds `package.json`, and run the command again.

**A folder in OneDrive.** The same build is slower and sometimes fails when the folder is inside a cloud-synchronised folder (for example `C:\Users\name\OneDrive\...`), because the synchroniser locks files while the build writes them. Unzip to a short path such as `C:\SWAFL_Desktop` and build there.

**Other messages.** *Running scripts is disabled* (PowerShell): use a Command Prompt, or run `cmd /c npm install`. *npm is not recognised*: install Node.js (LTS) and open a new terminal. *ENOENT, package.json*: the zip makes a folder inside a folder, so go into the inner one. *Electron download fails*: check the connection or VPN, delete `node_modules` and run `npm install` again.

## Requirements

* Windows 10 or 11 (64-bit) for the built program; any current Chrome, Edge or Firefox for the browser route.
* A screen of at least 1280 $\times$ 720 px. The layout is designed for 1600 $\times$ 900; panels can be hidden (View menu) or the drawing shown alone (*Focus view*, F9).
* About 400 MB of free memory. The 20-year daily simulation is computed in the program; no server is involved.

## First-run check

After start-up, verify three things: (i) the status bar at the bottom reads *Ready* and ends with *SWAFL 1.1.0*; (ii) the Results tab of the dashboard shows *On* followed by today's date with numbers below; (iii) clicking **Surface irrigation design** in the Layers panel opens the design with its inputs and a *Run the design* box. If the drawing area stays blank, see Chapter 16.

![The workbench on first start: the Field balance layer for today's date. Left: Layers and Processing Toolbox. Centre: the drawing. Right of the drawing: the dashboard. Far right: Properties.](images/atlas11/ui_u01_workbench.jpg){width=100%}
