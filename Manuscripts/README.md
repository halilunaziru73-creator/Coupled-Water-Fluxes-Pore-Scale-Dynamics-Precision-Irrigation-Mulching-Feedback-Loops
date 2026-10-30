# Manuscripts

Four manuscript drafts on soil water, irrigation and the [Daisy model](https://github.com/daisy-model) (developed at the University of Copenhagen) (xelatex + bibtex; `tex/build.sh p1|p2|p3|p4`):

1. **Soil Hydraulic Memory, the Recoverability of Evaporation Savings and the Closure of the Water Balance** (`pdf/Paper1_*`): two analyses of the same 10,190-run ensemble that depend on each other. Hydraulic memory and the rate-competition law say how much of an evaporation saving stays in the root zone; the audit of the water balance (a blind linear-invariant search with a permutation null, an unattributed term of 30 % of ET, a three-term ET law) says which outputs of the model can carry that conclusion. The two are joined: against the reported soil evaporation alone, the drainage share of an evaporation change differs by more than 0.1 in six of ten soils and changes sign in two.
2. **Modeling Soil–Water–Atmosphere Interactions for Irrigation Scheduling and Design** (`pdf/Paper2_*`): the software paper of the engines. It sets out the coupled soil–water–atmosphere system (compartments, state variables, fluxes), a ledger of 134 numbered equations with their origin, the meta-model, the daily model and the closed-form design modules for surface, drip and sprinkler irrigation, their verification against published sources and held-out simulations, and the interface of version 1.1.0.
3. **A Graphical Workbench and a Verified Bridge for the Daisy Model** (`pdf/Paper3_*`): a request in plain words becomes a design that is checked against what Daisy can vary; the guided path, 17 prepared experiments, the decision base from the Daisy reference manual, the process map, the soil column and calibration; the bridge that hands Daisy runs to the decision layers under one rule of origin; and the tests of each part, including the defect that the test of the denitrification function found.
4. **SWAFL Desktop 1.1.0: the whole suite** (`pdf/Paper4_*`): 22 layers, weather as a choice of five sources, field sketch, Sentinel-2 indices, terrain, gully and soil-loss tools, zone-by-zone irrigation, 48 crops, deterministic phenotyping, and what was and was not tested.

Earlier drafts had six papers; the two analyses of Paper 1 and the workbench and bridge of Paper 3 were merged so that each paper carries one complete argument. Papers 1 and 2 were revised for release 1.1.0 (data statement, regenerated numbers, companion-paper pointer; the only changed number is the Engine 2 closure maximum, 0.78 to 0.70 %, because the application now runs on the date of the toolbar).

Figures in `figures/` (`shots/` full-resolution interface captures, `shots_jpg/` the compressed copies of the version 1.1.0 interface typeset in the software paper), analysis scripts in `reproducibility/analysis/`, numeric outputs in `results/`. The raw run table and the Zenodo link are in the top-level [`Data`](../Data) folder.

* `graphical_abstracts/` holds the graphical abstracts (kept out of the manuscript PDFs).
* `reproducibility/` is a self-contained package that regenerates every number and figure from the archived Daisy ensemble (`bash run_all.sh`), with pinned versions, fixed seeds, SHA-256 checksums and automatic comparison against the reported values. Start with `reproducibility/README_REPRODUCE.md`.
* Figure 1 of each manuscript uses a brown, orange, pink, rust and purple scheme; data figures use the Okabe-Ito palette.

**Status / caveats.** Drafts. No funding was received. References beyond the author's list were entered from memory; DOIs not independently verified. No field validation is claimed; negative results are reported in the text.

Papers 3 and 4: Daisy could not be run in the environment used (no end-to-end Daisy test); the satellite and open-data services were not reachable (test data only); no field validation; new references were entered from memory and their DOIs are not verified.
