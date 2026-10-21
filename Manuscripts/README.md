# Manuscripts

Three manuscript drafts (xelatex + bibtex; `tex/build.sh p1|p2|p3`):

1. **Soil Hydraulic Memory and the Recoverability of Evaporation Savings** (`pdf/Paper1_*`)
2. **Auditing Water-Balance Closure in a Soil-Plant Model with Interpretable Machine Learning** (`pdf/Paper2_*`)
3. **Modeling Soil–Water–Atmosphere Interactions for Irrigation Scheduling and Design** (`pdf/Paper3_*`): the software paper. It sets out the coupled soil–water–atmosphere system (compartments, state variables, fluxes, controls and their relations), evaluates the variables for ten soils, verifies each computing layer and collects all interface screenshots; software information and screenshots appear only in this paper

Figures in `figures/` (`shots/` full-resolution interface captures, `shots_jpg/` the compressed copies typeset in Paper 3), analysis scripts in `reproducibility/analysis/`, numeric outputs in `results/`. The raw run table and the Zenodo link are in the top-level [`Data`](../Data) folder.

* `graphical_abstracts/` holds the three graphical abstracts (kept out of the manuscript PDFs).
* `reproducibility/` is a self-contained package that regenerates every number and figure from the archived Daisy ensemble (`bash run_all.sh`), with pinned versions, fixed seeds, SHA-256 checksums and automatic comparison against the reported values. Start with `reproducibility/README_REPRODUCE.md`.
* Figure 1 of each manuscript uses a brown, orange, pink, rust and purple scheme; data figures use the Okabe-Ito palette.

**Status / caveats.** Drafts. Zenodo DOI, ORCID, affiliation, funding and competing-interest fields are placeholders. References beyond the author's list were entered from memory; DOIs not independently verified. No field validation is claimed; negative results are reported in the text.
