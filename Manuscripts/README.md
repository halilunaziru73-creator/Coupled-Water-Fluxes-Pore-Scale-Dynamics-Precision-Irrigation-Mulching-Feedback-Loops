# Manuscripts

Six manuscript drafts (xelatex + bibtex; `tex/build.sh p1|p2|p3|p4|p5|p6`):

1. **Soil Hydraulic Memory and the Recoverability of Evaporation Savings** (`pdf/Paper1_*`)
2. **Auditing Water-Balance Closure in a Soil-Plant Model with Interpretable Machine Learning** (`pdf/Paper2_*`)
3. **Modeling Soil–Water–Atmosphere Interactions for Irrigation Scheduling and Design** (`pdf/Paper3_*`): the software paper. It sets out the coupled soil–water–atmosphere system (compartments, state variables, fluxes, controls and their relations), evaluates the variables for ten soils, verifies each computing layer and collects all interface screenshots; software information and screenshots appear only in this paper
4. **A Graphical Workbench for the Daisy Model** (`pdf/Paper4_*`): the guided path, 17 prepared experiments, process map, soil column solver and calibration, with tests of the compact designs and of the solver against independent references
5. **Connecting Daisy to SWAFL** (`pdf/Paper5_*`): the log parsers, the decision table, the chemical budget, the soil mapping and the rule that Daisy layers show only live Daisy runs
6. **SWAFL Desktop 1.1.0: the whole suite** (`pdf/Paper6_*`): 22 layers, field sketch, Sentinel-2 indices, zone-by-zone irrigation, 48 crops, deterministic phenotyping, and what was and was not tested

Papers 1 to 3 were revised for release 1.1.0 (data statement, regenerated numbers, companion-paper pointer; the only changed number is the Engine 2 closure maximum, 0.78 to 0.70 %, because the application now runs on the toolbar date). Checks for papers 4 to 6 are in `reproducibility/p456/`.

Figures in `figures/` (`shots/` full-resolution interface captures, `shots_jpg/` the compressed copies typeset in Paper 3), analysis scripts in `reproducibility/analysis/`, numeric outputs in `results/`. The raw run table and the Zenodo link are in the top-level [`Data`](../Data) folder.

* `graphical_abstracts/` holds the graphical abstracts (kept out of the manuscript PDFs).
* `reproducibility/` is a self-contained package that regenerates every number and figure from the archived Daisy ensemble (`bash run_all.sh`), with pinned versions, fixed seeds, SHA-256 checksums and automatic comparison against the reported values. Start with `reproducibility/README_REPRODUCE.md`.
* Figure 1 of each manuscript uses a brown, orange, pink, rust and purple scheme; data figures use the Okabe-Ito palette.

**Status / caveats.** Drafts. No funding was received. References beyond the author's list were entered from memory; DOIs not independently verified. No field validation is claimed; negative results are reported in the text.

Papers 4 to 6: Daisy could not be run in the environment used (no end-to-end Daisy test); the satellite and open-data services were not reachable (test data only); no field validation; new references were entered from memory and their DOIs are not verified.
