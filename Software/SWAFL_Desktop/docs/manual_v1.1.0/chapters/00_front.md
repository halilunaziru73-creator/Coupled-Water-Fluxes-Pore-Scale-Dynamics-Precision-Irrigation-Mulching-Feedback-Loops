---
title: "SWAFL Desktop 1.1.0 — User Guide and Technical Reference"
subtitle: "Volume 1 of 3: installing, every window and control, every layer and design, the weather, the virtual farm, the crops, the reports, and the governing equations behind every output"
author: "Naziru Halilu"
date: "Version 1.1.0"
documentclass: report
geometry: a4paper,margin=2cm
fontsize: 10pt
toc: true
toc-depth: 2
numbersections: true
colorlinks: true
linkcolor: blue
urlcolor: blue
header-includes:
  - \usepackage{amsmath,amssymb,booktabs,longtable,array,float,caption}
  - \floatplacement{figure}{H}
  - \usepackage{tocloft}
  - \cftsetpnumwidth{2.3em}
  - \cftsetrmarg{4.6em}
  - \setlength{\cftchapnumwidth}{2.4em}
  - \setlength{\cftsecindent}{2.4em}
  - \setlength{\cftsecnumwidth}{3.4em}
  - \usepackage{fvextra}
  - \DefineVerbatimEnvironment{Highlighting}{Verbatim}{breaklines,commandchars=\\\{\}}
  - \usepackage{enumitem}
  - \setlist{itemsep=1pt,topsep=2pt}
  - \setlength{\parskip}{3pt}
  - \renewcommand{\arraystretch}{1.12}
  - \AtBeginEnvironment{longtable}{\footnotesize}
---

# About this manual {-}

This is the manual of **SWAFL Desktop 1.1.0**, the Soil–Water–Atmosphere–Field–Loop decision-support workbench of the repository *Coupled Water Fluxes, Pore-Scale Dynamics, Precision Irrigation and Mulching Feedback Loops*. It replaces nothing: the manual of version 1.0 stays in the repository (`docs/SWAFL_Manual.pdf`) for readers of that version. Every picture in this manual was taken from version 1.1.0.

**The three volumes.**

| Volume | Contents |
|:--|:--|
| **1. User guide and technical reference** (this volume) | Installing; the window, menus and every control; the clock; the two computing engines; every layer and the three irrigation designs with their equations; the dashboard; the weather data; the virtual farm; the crop library and the crop water requirement; the seasonal data; reports; workflows; validity limits; appendices with the symbols, the provenance ledger and the complete reference of the 134 numbered equations. |
| **2. Screenshot atlas at the default settings** | Every screen of the program: the window, the eight menus, every dialog, the Properties panel, the dashboard tabs, and every layer drawn from top to bottom, cut into page-size parts, each followed by the full text of every equation that the layer draws on. |
| **3. Screenshot atlas by soil and by crop** | Every layer drawn for each of the ten soils, the three irrigation designs and their virtual farms for each soil, and the crop water requirement for each crop of the library. |

**How this volume is organised.**

1. Chapters 1–4 install the program and explain the window, every control and the clock.
2. Chapter 5 explains the two computing engines under every layer.
3. Chapters 6–10 document the layers of the Layers panel; chapters 11–13 the three irrigation designs.
4. Chapters 14–17 cover the dashboard, worked workflows, files and troubleshooting, and the validity limits.
5. Chapters 18–24 cover what is new in version 1.1: running a design and finding the most efficient inputs, weather data, the virtual farm, the crop library and the crop water requirement, the seasonal data, reports, and a list of every change from version 1.0.
6. The appendices give the symbols, the control values, the data sets, the provenance ledger, the references and the equation reference.

**A note on honesty of the equations.** SWAFL mixes three kinds of computation, and the manual labels them so that nothing is over-claimed. Every numbered equation carries its label directly beneath it:

| Label | Meaning |
|:--|:--|
| **[Literature]** | A published relation implemented as written, cited to its source. |
| **[Data-driven]** | Obtained by interpolating or scaling the 10,190 Daisy simulations that stand behind the program, not computed from a closed-form law. |
| **[Engineered]** | A parameterisation chosen for the workbench (for drawing, for speed, or because no closed form exists), stated with its constants so that it can be audited, but not presented as a physical law. |

**Where the simulation model is named.** The program itself shows results only. The simulation model behind them (Daisy, 10,190 runs in seventeen experiments on ten soils) is described here, in Chapter 5 and in the appendices, and not on the screens.

**Units.** Unless stated, depths are in mm, lengths in m, suction in cm of water (1 cm $\approx$ 0.0980665 kPa), flows in L s$^{-1}$ or L h$^{-1}$ as marked on the screen, times in min or h, and areas in ha.

\newpage
