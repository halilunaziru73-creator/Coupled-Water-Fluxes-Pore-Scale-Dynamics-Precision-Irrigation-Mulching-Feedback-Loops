---
title: "SWAFL Desktop: Complete Technical Manual"
subtitle: "Step by step use, every control and trigger, every layer and simulation, and the governing equations behind every output"
author: "Naziru Halilu"
date: "Version 1.1.0"
documentclass: report
geometry: margin=2.2cm
fontsize: 10pt
toc: true
toc-depth: 3
numbersections: true
colorlinks: true
linkcolor: blue
urlcolor: blue
header-includes:
  - \usepackage{amsmath,amssymb,booktabs,longtable,array,float,caption,graphicx,xcolor}
  - \definecolor{swaflblue}{RGB}{10,36,106}
  - \makeatletter
  - \renewcommand{\maketitle}{\begin{titlepage}\centering\vspace*{1.6cm}{\includegraphics[width=7.2cm]{images/logo_cover.png}\par}\vspace{1.4cm}{\color{swaflblue}\fontsize{34}{40}\selectfont\bfseries SWAFL Desktop\par}\vspace{0.4cm}{\color{swaflblue}\Large Complete Technical Manual\par}\vspace{1.0cm}{\rule{0.5\textwidth}{0.6pt}\par}\vspace{0.8cm}{\large Soil Water Atmosphere Field Loop workbench\par}\vspace{0.3cm}{\large Version 1.1.0\par}\vspace{2.2cm}{\large Step by step use, every control and trigger,\par every layer and simulation, and the equations\par behind every output\par}\vfill{\large\bfseries Naziru Halilu\par}\vspace{0.4cm}{\small Coupled Water Fluxes, Pore Scale Dynamics, Precision Irrigation and Mulching Feedback Loops\par}\vspace{1.2cm}\end{titlepage}\setcounter{page}{1}}
  - \makeatother
  - \floatplacement{figure}{H}
  - \usepackage{tocloft}
  - \cftsetpnumwidth{2.3em}
  - \cftsetrmarg{4.6em}
  - \setlength{\cftchapnumwidth}{2.4em}
  - \setlength{\cftsecindent}{2.4em}
  - \setlength{\cftsecnumwidth}{3.4em}
  - \setlength{\cftsubsecindent}{5.8em}
  - \setlength{\cftsubsecnumwidth}{4.4em}
  - \usepackage{fvextra}
  - \DefineVerbatimEnvironment{Highlighting}{Verbatim}{breaklines,commandchars=\\\{\}}
  - \usepackage{enumitem}
  - \setlist{itemsep=1pt,topsep=2pt}
  - \renewcommand{\labelitemii}{\textbullet}
  - \renewcommand{\labelitemiv}{\textbullet}
  - \setlength{\parskip}{3pt}
  - \renewcommand{\arraystretch}{1.12}
  - \AtBeginEnvironment{longtable}{\footnotesize}
---

# About this manual {-}

This manual documents **SWAFL Desktop**, the Soil Water Atmosphere Field Loop decision-support workbench that accompanies the repository *Coupled Water Fluxes, Pore-Scale Dynamics, Precision Irrigation and Mulching Feedback Loops*. It is written for three readers: a farmer or adviser who wants to use the screens, a student who wants to know what each picture means, and a scientist who wants to know exactly which equation produced each number.

**How the manual is organised.** This is the manual of version 1.1.0. It follows the manual of version 1.0 chapter by chapter, with every picture taken again from version 1.1.0 and every numbered arrow placed on the item it names in the new interface, and it adds the chapters and screens of the new release. The manual of version 1.0 stays in the repository (`docs/SWAFL_Manual.pdf`).

1. Chapters 1 to 3 install the program and explain the window and every control.
2. Chapters 4 to 5 explain the clock (dates) and the two computing engines that sit under every layer.
3. Chapters 6 to 10 document each *layer* of the Layers panel: what it designs or shows, how the picture is generated, and the governing equations.
4. Chapters 11 to 13 document the three irrigation design layers (surface, drip, sprinkler) in full, including the irrigation schedule and the "When to irrigate" message.
5. Chapters 14 to 16 document the dashboard, step-by-step workflows, exports and troubleshooting.
6. Chapter 17 states the validity limits.
7. Chapters 18 to 24 document the additions of version 1.1: running a design and finding the most efficient inputs, weather data (your own file or the online weather of a place), the real field on the map (satellite indices, image analysis of the satellite photo, water sources and the choice of the irrigation system), the crop library and the crop water requirement, the seasonal data, the reports, and every change from version 1.0.
8. Chapter 25 is the screenshot atlas. It shows every screen of the workbench (all layers, every section of the three design layers, the menus, the toolbox, the Properties panel, the Dashboard and the dialogs of version 1.1) from the program itself, and prints under each screenshot every equation that the screen draws on, with its number, source chapter and provenance. A reverse index gives, for every numbered equation, the screens that use it.
9. Chapters 26 to 36 document the Daisy workbench: the overview of its five groups of tabs, every screen with numbered arrows (Your data, Ask a question, the 27 best combinations, Look at results with the figures of real Daisy runs, Build and test, Learn), the 107 reference topics, the tested parameters, the factors and responses of the experiments, the Daisy library as it comes with the program, and the weather of the bundled stations.
10. The appendices give symbols, control value lists, data sets, the provenance ledger, the references and the reference of all numbered equations.

**A note on honesty of the equations.** SWAFL mixes three kinds of computation, and the manual labels them so that nothing is over-claimed. Every numbered equation carries its label directly beneath it, and the provenance ledger in the appendices lists them all:

| Label | Meaning |
|:--|:--|
| **[Literature]** | A published relation implemented as written, cited to its source. |
| **[Data-driven]** | Obtained by interpolating or scaling the 10,190 Daisy simulations (Appendix C of the repository), not computed from a closed-form law. |
| **[Engineered]** | A parameterisation chosen for the workbench (for drawing, for speed, or because no closed form exists). Stated explicitly with its constants so that it can be audited, but not presented as a physical law. |

**Where the simulation model is named.** The program itself shows results only; the simulation model behind them (Daisy, 10,190 runs on ten soils) is described in this manual.

**Units.** Unless stated, depths are in mm, lengths in m, suction in cm of water (1 cm $\approx$ 0.0980665 kPa), flows in L s$^{-1}$ or m$^3$ min$^{-1}$ as marked on the screen, times in min or h, and areas in ha.

\newpage
