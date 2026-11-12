# Installing and starting SWAFL

## What you receive

SWAFL Desktop is a self-contained Electron program. The simulation engine is one HTML page (`app/engine/engine.html`) with a few script files beside it, which the program serves to itself on a local port, so **no internet connection is needed once it is installed**. The internet is used only if you ask for the online weather of a location (Chapter 19). Four ways of running it are provided.

| Route | Who it suits | Steps |
|:--|:--|:--|
| **A. Build and install on Windows** | Most users | Unzip `SWAFL_Desktop.zip`, double-click `BUILD_AND_INSTALL_SWAFL.bat`. |
| **B. Windows program** | Users who received `SWAFL.exe` | Double-click `SWAFL.exe`. |
| **C. From source** | Developers | `npm install`, then `npm start` (desktop) or `npm run web` (browser). |
| **D. Online, nothing to install** | Anyone with a browser | Open the online workbench (link below). |

## Daisy comes with SWAFL: nothing to choose {#daisy-built-in}

The Daisy program (version 7.1.14, the folder `daisy` next to the program, about 47 MB with its library) is part of SWAFL. You never choose a file. When a run starts, SWAFL finds Daisy by itself, in this order:

1. The folder `daisy` that comes with SWAFL (next to the program, or in the resources of the installed program).
2. Its own copy in the folder of the user (`%LOCALAPPDATA%\SWAFL\Daisy-7.1.14`): SWAFL makes this copy by itself a few seconds after it starts, so Daisy is still found when the program is moved.
3. A Daisy installed on the computer: any folder of Program Files whose name has *daisy* in it.
4. The Daisy installer, if you have downloaded it (daisy-7.1.14-Windows-python3.13.exe, in Downloads, on the Desktop or in OneDrive): SWAFL runs it once, silently. Windows asks for permission once, because the installer needs it; after that Daisy is found as in 3.

Only if all four fail does a message say that Daisy is missing, with the places looked at; unzip the whole SWAFL zip again into a folder of your own. The Scenarios tab shows where Daisy was found (*Daisy is ready: ...*). *Use another Daisy program* (a small link there) is for experts who want another version; if you choose the installer there, it is run, not refused.


## What is inside SWAFL.exe: one file, nothing to install {#exe-inside}

`SWAFL.exe` is the one file to use. You double click it once: it installs SWAFL for you without a single question, adds the SWAFL icon to the Desktop and the Start menu, and starts it; afterwards you open SWAFL from that icon, and it opens at once. It needs no administrator rights, no Node.js, no Python and no network, because everything the program uses is packed inside the one file. It is made from four parts.

| Part inside the file | What it is |
|---|---|
| The Electron runtime | The window, the menus and the engine of the screen (the same code that runs in a browser) |
| The SWAFL application | The shell, the two simulation engines, the design modules, the library of 48 crops, the soil classes and the built in weather record, all written in JavaScript |
| The Daisy 7.1.14 program with its library | About 47 MB, run from its own folder inside the package; the installer that the Daisy site offers is never needed |
| The manual | This manual as a PDF, opened with F1 or from a Manual button at the page of the layer in use |

When the file starts, it unpacks itself to a temporary folder of your account and opens the window from that copy. A few seconds later SWAFL keeps its own copy of Daisy in the folder of the user (see the list above), so Daisy is still found if the temporary folder is cleared or the file is moved. Your projects, runs and reports are saved to files that you choose, never into the package. Only the optional online services (online weather, satellite images, soil and terrain of a field) need a connection; every other number is computed on your computer, so a single file on a computer that is not connected still gives you the field, the designs, Daisy, the decision layers and this manual.

## Route A: build and install, step by step

1. Install **Node.js** (the LTS version) from nodejs.org if it is not already installed. Close and reopen any terminal afterwards.
2. Unzip `SWAFL_Desktop.zip` to a short path outside cloud-synchronised folders, for example `C:\SWAFL_Desktop`. The zip contains a folder `SWAFL_Desktop`; the folder you work in is the one that contains `package.json`.
3. Double-click **`BUILD_AND_INSTALL_SWAFL.bat`**. It installs the packages, builds the program and puts **SWAFL** on the Desktop. The first build downloads Electron and takes a few minutes.
4. Start **SWAFL** from the Desktop. The title bar reads *SWAFL 1.1.0*. If Windows SmartScreen shows "Windows protected your PC", click **More info** and then **Run anyway** (the program is not code-signed).

`START_SWAFL.bat` starts the program from the source folder without building it, and `START_SWAFL_WEB.bat` opens the same program in your browser from your own computer. On a Mac the same two files are `START_SWAFL.command` and `START_SWAFL_WEB.command`. None of them needs Node.js or npm to be installed: each looks for Node.js on the computer (also in the usual install folders, which is where "npm is not recognised" came from) and otherwise downloads a portable copy of about 30 to 40 MB into the folder `tools/node`, which changes nothing else. On a Mac, if a file will not open, type `chmod +x *.command tools/*.sh` in Terminal in that folder and open the file once with a right click and Open. The Daisy program that comes with SWAFL is a Windows program; on a Mac everything else works, and Daisy runs when SWAFL is pointed to a Daisy built for the Mac.

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

**The command is not found.** The script is called `get-app`, with a hyphen, and `npm run get_app` and `npm run getapp` do the same. If npm answers *Missing script: "get_app"*, the folder holds an older `package.json`: unzip the new zip into a new folder and run the command there.

**The message "Cannot create symbolic link : A required privilege is not held by the client".** It appears during the step *packaging* of the build, after the line that downloads `winCodeSign`, and it names the files `libcrypto.dylib` and `libssl.dylib`. The build tool unpacks a code-signing package that contains two symbolic links, and Windows allows a normal user to create symbolic links only when Developer Mode is on or the terminal runs as Administrator. The program does not need code signing, so there are three ways out, in this order:

1. Run `npm run get-app` again. This version of the script notices the error, deletes the unfinished `dist` folder and builds again with the signing step switched off, so the build finishes without any change of settings. The program that results works in the same way; only the file properties of `SWAFL.exe` carry no icon and version signature.
2. Turn on **Developer Mode** (Settings, System, For developers), delete the folder `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`, and run the command again.
3. Open the terminal with **Run as administrator**, go to the folder that holds `package.json`, and run the command again.

**A folder in OneDrive.** The same build is slower and sometimes fails when the folder is inside a cloud-synchronised folder (for example `C:\Users\name\OneDrive\...`), because the synchroniser locks files while the build writes them. Unzip to a short path such as `C:\SWAFL_Desktop` and build there.

**Other messages.** *Running scripts is disabled* (PowerShell): use a Command Prompt, or run `cmd /c npm install`. *npm is not recognised*: install Node.js (LTS) and open a new terminal. *ENOENT, package.json*: the zip makes a folder inside a folder, so go into the inner one. *Electron download fails*: check the connection or VPN, delete `node_modules` and run `npm install` again.

**Daisy.** The Daisy 7.1.14 program for Windows is inside the zip (the folder `daisy`), is built into the program by the build and starts by itself when a Daisy run is asked for. Do not download or choose the Daisy installer (`daisy-7.1.14-Windows-python3.13.exe`): it is not the program, it asks for administrator rights, and choosing it as the program gives the message *spawn ... EACCES* and runs that end with *Daisy gave no results (code -1)*.

## Requirements

* Windows 10 or 11 (64-bit) for the built program; any current Chrome, Edge or Firefox for the browser route.
* A screen of at least 1280 $\times$ 720 px. The layout is designed for 1600 $\times$ 900; panels can be hidden (View menu) or the drawing shown alone (*Focus view*, F9).
* About 400 MB of free memory. The 20-year daily simulation is computed in the program; no server is involved.

## First-run check

After start-up, verify three things: (i) the status bar at the bottom reads *Ready* and ends with *SWAFL 1.1.0*; (ii) the Results tab of the dashboard shows *On* followed by today's date with numbers below; (iii) clicking **Surface irrigation design** in the Layers panel opens the design with its inputs and a *Run the design* box. If the drawing area stays blank, see Chapter 16.

![The workbench on first start: the Field balance layer for today's date. Left: Layers and Processing Toolbox. Centre: the drawing. Right of the drawing: the dashboard. Far right: Properties.](images/atlas11/ui_u01_workbench.jpg){width=100%}
