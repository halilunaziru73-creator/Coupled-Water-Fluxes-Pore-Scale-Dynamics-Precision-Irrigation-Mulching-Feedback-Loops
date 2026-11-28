# Journal versions of the manuscripts

Each article is within the limits of its journal and follows its rules; everything else from the full manuscripts (`../pdf/Paper1` to `Paper4`) is published with it as **Supplementary Material S1**, complete and in the order of the article, so no information is lost. The submission packages are in [`../pdf/Journal_versions`](../pdf/Journal_versions).

| Article | Journal | Article file | Length | Supplementary Material S1 |
|---|---|---|---|---|
| Soil Hydraulic Memory and the Recoverability of Evaporation Savings and the Closure of the Water Balance (Paper 1) | Agricultural Water Management | `AWM_Paper1.pdf` | about 7,300 words with captions, 10 figures, 10 tables, 95 references | `Supplementary_AWM_Paper1.pdf` (complete text) |
| The Reach of Suction-Triggered Irrigation and the Marginal Fate of Irrigation Water (Paper 4) | Agricultural Water Management | `AWM_Paper4.pdf` | about 5,300 words, 6 figures, 4 tables, 45 references | `Supplementary_AWM_Paper4.pdf` (complete text) |
| SWAFL: An open desktop application for equation-traceable irrigation scheduling and design with a graphical interface to the Daisy model (Papers 2 and 3 merged) | SoftwareX | `SoftwareX_SWAFL.pdf` | about 2,500 words with captions (limit 3,000), 6 multi-panel figures (limit 6) built from the software screenshots of the presentation, 5 highlights covering every group of layers, the field sketch and the Daisy workbench, 62 references | `Supplementary_SoftwareX_SWAFL.pdf` (complete text of Papers 2 and 3, merged section by section) |

Each package also has a folder **`Data_and_analysis`**, so that every figure and table can be traced to its numbers: `figures/Figure_N_*.csv` holds every point drawn in Figure N (recorded while the original script drew it) and the result tables it was drawn from, `tables/Table_N_*.csv` every table, `replot_from_csv.py` redraws every figure from the CSV files alone, and `analysis/` holds the Daisy ensemble, the scripts and `run_original.sh`, which runs the analysis again. Its `README.md` lists, for each figure and table, the data file and the script.

Supplementary Material S2 of each article is the existing derivations, data and mechanisms PDF in `../pdf/Supplementary`.

## Data and analysis: download

Each package has a folder `Data_and_analysis` (the data of every figure and table, all the data of the study as CSV, the scripts) and the same folder as one zip file:

* Paper 1 (Agricultural Water Management): [download Data_and_analysis.zip](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Manuscripts/pdf/Journal_versions/1_Agricultural_Water_Management_Paper1/Data_and_analysis.zip) · [open the folder](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/tree/main/Manuscripts/pdf/Journal_versions/1_Agricultural_Water_Management_Paper1/Data_and_analysis) · [README](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/blob/main/Manuscripts/pdf/Journal_versions/1_Agricultural_Water_Management_Paper1/Data_and_analysis/README.md)
* Paper 4 (Agricultural Water Management): [download Data_and_analysis.zip](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Manuscripts/pdf/Journal_versions/2_Agricultural_Water_Management_Paper4/Data_and_analysis.zip) · [open the folder](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/tree/main/Manuscripts/pdf/Journal_versions/2_Agricultural_Water_Management_Paper4/Data_and_analysis) · [README](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/blob/main/Manuscripts/pdf/Journal_versions/2_Agricultural_Water_Management_Paper4/Data_and_analysis/README.md)
* SWAFL (SoftwareX): [download Data_and_analysis.zip](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Manuscripts/pdf/Journal_versions/3_SoftwareX_SWAFL/Data_and_analysis.zip) · [open the folder](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/tree/main/Manuscripts/pdf/Journal_versions/3_SoftwareX_SWAFL/Data_and_analysis) · [README](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/blob/main/Manuscripts/pdf/Journal_versions/3_SoftwareX_SWAFL/Data_and_analysis/README.md)

The comprehensive data (every value of every Daisy run, one compressed CSV per experiment): [Data/Comprehensive_Summary](https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/tree/main/Data/Comprehensive_Summary).

## Rebuild

```
python3 build.py     # the three articles, from src/
python3 full.py      # the three Supplementary Material S1 files, from ../tex
python3 data_package.py   # the Data_and_analysis folder of each package (figure data in ../results/plotdata)
```

## Before submitting (to do by the author)

1. Check the references: many entries in `refs.bib` were entered from memory and their DOIs were never verified.
2. Add the declaration of generative AI use.
3. SoftwareX asks on acceptance for the described code version in its GitHub organisation (ElsevierSoftwareX); prepare a tagged release `v1.1.0`. Daisy is bundled under its own licence.
4. Upload the graphical abstracts from `../graphical_abstracts`.
5. Check the author guides of both journals on the day of submission.
