# Graphical abstracts

The graphical abstracts of the three manuscripts are kept here, separate from the manuscript PDFs in `../pdf/`.

| File | Manuscript |
|---|---|
| `ga_p1.pdf` / `ga_p1.png` | Paper 1: Soil Hydraulic Memory and the Recoverability of Evaporation Savings |
| `ga_p2.pdf` / `ga_p2.png` | Paper 2: Auditing Water-Balance Closure in a Soil-Plant Model with Interpretable Machine Learning |
| `ga_p3.pdf` / `ga_p3.png` | Paper 3: A Verified Open-Source Decision-Support Framework for Irrigation Scheduling and Design |
| `Graphical_abstracts_P1-P3.pdf` | the three files above in one PDF |

Suggested captions (for journal submission systems):

* **P1.** Pore-scale sections (sand and silty clay loam) and the rate-competition law phi_D = Ks/(Ks + q*) explain how much of a saved evaporation loss is drained rather than recovered; the recoverable share depends on warming and rainfall. Model-based; the grain packings are schematic two-dimensional sections.
* **P2.** A four-stage discovery pipeline applied to the Daisy ensemble recovers the water-balance law blindly, exposes an unattributed evapotranspiration term and yields a hand-checkable three-term law, with its limits stated against a gradient-boosting benchmark. The grain packing is a schematic two-dimensional soil section.
* **P3.** SWAFL Desktop links soil hydraulics to two engines and three design layers; every equation carries a provenance label, and verification against published references and held-out simulations is reported with its limits. No field validation has been carried out. The grain packing is a schematic two-dimensional soil section.

`p1_ga.py`, `p2_ga.py`, `p3_ga.py` and `p_style.py` draw the figures (Matplotlib; they read result files produced by the reproducibility package, `../reproducibility/`). Note: the soil sections are schematic and are not tomography or measured pore geometry.
