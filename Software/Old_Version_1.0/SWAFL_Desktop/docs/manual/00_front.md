---
title: "SWAFL Desktop — Complete Technical Manual"
subtitle: "Step-by-step use, every control and trigger, every layer and simulation, and the governing equations behind every output"
author: "Naziru Halilu"
date: "Version 1.0.0"
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
  - \usepackage{amsmath,amssymb,booktabs,longtable,array,float,caption}
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
  - \setlength{\parskip}{3pt}
  - \renewcommand{\arraystretch}{1.12}
  - \AtBeginEnvironment{longtable}{\footnotesize}
---

# About this manual {-}

This manual documents **SWAFL Desktop**, the Soil–Water–Atmosphere–Field–Loop decision-support workbench that accompanies the repository *Coupled Water Fluxes, Pore-Scale Dynamics, Precision Irrigation and Mulching Feedback Loops*. It is written for three readers: a farmer or adviser who wants to use the screens, a student who wants to know what each picture means, and a scientist who wants to know exactly which equation produced each number.

**How the manual is organised.**

1. Chapters 1–3 install the program and explain the window and every control.
2. Chapters 4–5 explain the clock (dates) and the two computing engines that sit under every layer.
3. Chapters 6–10 document each *layer* of the Layers panel: what it designs or shows, how the picture is generated, and the governing equations.
4. Chapters 11–13 document the three irrigation design layers (surface, drip, sprinkler) in full, including the irrigation schedule and the "When to irrigate" message.
5. Chapters 14–16 document the dashboard, step-by-step workflows, exports and troubleshooting.
6. Chapter 17 states the validity limits.
7. Chapter 18 is a screenshot atlas. It shows every screen of the workbench (all layers, every section of the three design layers, the menus, the toolbox, the Properties panel and the Dashboard) from the program itself, and prints under each screenshot every equation that the screen draws on, with its number, source chapter and provenance. A reverse index gives, for every numbered equation, the screens that use it.
8. The appendices give symbols, control value lists, data sets, the provenance ledger and references.

**A note on honesty of the equations.** SWAFL mixes three kinds of computation, and the manual labels them so that nothing is over-claimed. Every numbered equation carries its label directly beneath it, and the provenance ledger in the appendices lists them all:

| Label | Meaning |
|:--|:--|
| **[Literature]** | A published relation implemented as written, cited to its source. |
| **[Data-driven]** | Obtained by interpolating or scaling the 10,190 Daisy simulations (Appendix C of the repository), not computed from a closed-form law. |
| **[Engineered]** | A parameterisation chosen for the workbench (for drawing, for speed, or because no closed form exists). Stated explicitly with its constants so that it can be audited, but not presented as a physical law. |

**Units.** Unless stated, depths are in mm, lengths in m, suction in cm of water (1 cm $\approx$ 0.0980665 kPa), flows in L s$^{-1}$ or m$^3$ min$^{-1}$ as marked on the screen, times in min or h, and areas in ha.

\newpage
