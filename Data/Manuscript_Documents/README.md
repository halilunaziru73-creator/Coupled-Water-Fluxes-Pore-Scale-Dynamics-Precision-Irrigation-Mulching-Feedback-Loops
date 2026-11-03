# Manuscript documents and the code of their figures

For each of the four manuscripts this folder holds the paper as an editable **Word document** (`.docx`) and **one Python file that regenerates every figure of that paper**. The Python file is the proof of the data analysis: it reads the archived Daisy ensemble ([`Data/Comprehensive_Summary`](../Comprehensive_Summary), [`Data/daisy_ensemble.csv.gz`](../daisy_ensemble.csv.gz)) and the archived results, runs the figure scripts of the paper one by one, and lists every figure file that it wrote. The PDFs stay where they are, in [`Manuscripts/pdf`](../../Manuscripts/pdf).

| Paper | Word document | Supplementary Material (Word) | Python file with all the figures |
|:--|:--|:--|:--|
| **4** The Reach of Suction-Triggered Irrigation and the Marginal Fate of Irrigation Water with Closed Forms from the van Genuchten-Mualem Parameters | [Paper4_Reach_of_a_Suction_Trigger_and_Fate_of_Irrigation.docx](Paper4_Reach_of_a_Suction_Trigger_and_Fate_of_Irrigation.docx) | [Paper4_Supplementary_Derivations_Data_Mechanisms.docx](Paper4_Supplementary_Derivations_Data_Mechanisms.docx) | [Paper4_all_figures.py](Paper4_all_figures.py) |
| **1** Soil Hydraulic Memory and the Recoverability of Evaporation Savings and the Closure of the Water Balance in a Simulation Study with Daisy | [Paper1_Hydraulic_Memory_and_Water_Balance_Closure.docx](Paper1_Hydraulic_Memory_and_Water_Balance_Closure.docx) | [Paper1_Supplementary_Derivations_Data_Mechanisms.docx](Paper1_Supplementary_Derivations_Data_Mechanisms.docx) | [Paper1_all_figures.py](Paper1_all_figures.py) |
| **2** Modeling Soil-Water-Atmosphere Interactions for Irrigation Scheduling and Design | [Paper2_Modeling_Soil_Water_Atmosphere_Irrigation.docx](Paper2_Modeling_Soil_Water_Atmosphere_Irrigation.docx) | [Paper2_Supplementary_Derivations_Data_Mechanisms.docx](Paper2_Supplementary_Derivations_Data_Mechanisms.docx) | [Paper2_all_figures.py](Paper2_all_figures.py) |
| **3** Soil-Water Modelling and Decision Support through a Graphical User Interface for the Daisy Model | [Paper3_Soil_Water_Modelling_DSS_and_Daisy_User_Interface.docx](Paper3_Soil_Water_Modelling_DSS_and_Daisy_User_Interface.docx) | [Paper3_Supplementary_Derivations_Data_Mechanisms.docx](Paper3_Supplementary_Derivations_Data_Mechanisms.docx) | [Paper3_all_figures.py](Paper3_all_figures.py) |
| **5** (standalone) The software stack: languages, libraries, techniques and tools | [Supplementary5_Software_Languages_Libraries_Tools.docx](Supplementary5_Software_Languages_Libraries_Tools.docx) | | |

## Run the figures of one paper

```bash
python3 -m pip install -r Manuscripts/reproducibility/requirements_all.txt   # Python 3.13
python3 Data/Manuscript_Documents/Paper4_all_figures.py ./work_paper4          # any paper, any work folder
```

Each file builds a working copy of the folder layout in the work folder you give, so **nothing in the repository is changed**. It prints `ok` or `FAILED` for every figure script, writes a log per script, and ends with the list of figure files and the script that wrote each. Paper 3 also needs Node.js only for the checks of the designs, not for its figures. Paper 4 takes about one minute; Papers 1 to 3 take a few minutes.

## What each Python file does

1. finds the repository from its own location (it works from any folder inside the repository);
2. copies the analysis scripts, the archived intermediate results and the interface screenshots into the work folder;
3. rebuilds the data table from the ensemble when the paper needs it;
4. runs the figure scripts of the paper in the order of the paper, each in its own process, so one failure is shown and does not hide the others;
5. lists every figure written (PNG, PDF, SVG).

## Notes

* The Word files are made from the LaTeX source by [`Manuscripts/tex/make_docx.py`](../../Manuscripts/tex/make_docx.py) with pandoc: equations are Word equations, citations are resolved from `refs.bib` and the figures are embedded. They are for editing and review; the PDF is the typeset record.
* The versions of the packages that produced the numbers are in [`Manuscripts/reproducibility/requirements.txt`](../../Manuscripts/reproducibility/requirements.txt); the full list of packages is in [`requirements_all.txt`](../../Manuscripts/reproducibility/requirements_all.txt).
