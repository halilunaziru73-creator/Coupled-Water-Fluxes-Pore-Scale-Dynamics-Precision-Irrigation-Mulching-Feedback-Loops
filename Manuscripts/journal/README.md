# Journal versions of the manuscripts

The complete manuscripts (the same text as the PDFs in `../pdf`), in the format of the journals they are aimed at. Nothing is cut: every section, the list of symbols, every figure, table, equation and appendix is kept in the order of the full manuscript. Only the format changes.

| Paper | Journal | File | Pages |
|---|---|---|---|
| 1. Soil Hydraulic Memory and the Recoverability of Evaporation Savings and the Closure of the Water Balance in a Simulation Study with Daisy | Agricultural Water Management | `AWM_Paper1.pdf` | 127 |
| 4. The Reach of Suction-Triggered Irrigation and the Marginal Fate of Irrigation Water with Closed Forms from the van Genuchten–Mualem Parameters | Agricultural Water Management | `AWM_Paper4.pdf` | 37 |
| 2 + 3. SWAFL Desktop: equation-traceable irrigation scheduling and design with a graphical workbench for the Daisy model | SoftwareX | `SoftwareX_SWAFL.pdf` | 201 |

Copies, saved under their titles, are in `../pdf/Journal_versions`. The page counts are larger than the full PDFs because the review format of the journals is double spaced.

## What changes from the full manuscripts

* Elsevier `elsarticle` class (official copy from github.com/STM-Document-Engineering/elsarticle), review layout with line numbers.
* Journal front matter: title, author and affiliations, corresponding author, abstract, keywords; highlights for the two Agricultural Water Management papers; code and software metadata tables for the SoftwareX paper.
* Declarations under the names Elsevier uses: *CRediT authorship contribution statement* and *Declaration of competing interest* (texts unchanged). The declaration of generative AI use is to be added by the author before submission.
* References: Harvard (author–year) for Agricultural Water Management, numbered for SoftwareX.
* **Papers 2 and 3 merged section by section.** Introduction of Paper 2 followed by that of Paper 3; architecture and the coupled system of Paper 2; Materials and methods of Paper 2 with those of Paper 3 as Section 4.7; Results of Paper 2 with those of Paper 3 as Section 5.5; Discussion of Paper 2 with that of Paper 3 as Section 6.7; both conclusions; both sets of availability statements, contributions and appendices. Every sentence of both papers is kept. The one label shared by both papers is renamed in Paper 3's part.

Completeness was checked line by line against the sources in `../tex`. The only lines that differ are the renamed declaration headings and Paper 3's section headings, now one level down.

## Rebuild

```
python3 full.py
```
It reads `../tex`, writes the three `.tex` files here and compiles them with XeLaTeX and BibTeX. Any later edit to the full manuscripts is carried over by running it again.

## Before submitting (to do by the author)

1. **Length.** The full texts are far beyond SoftwareX's limit (about 3,000 words and 6 figures) and long for Agricultural Water Management. Editors may ask for shortening or for parts to move to the Supplementary Material.
2. **Check the references.** Many references in `refs.bib` were entered from memory and their DOIs were never verified.
3. **SoftwareX code repository.** On acceptance SoftwareX asks for the code version described to be placed in its GitHub organisation (ElsevierSoftwareX); prepare a tagged release `v1.1.0`.
4. **Daisy licence.** Daisy is bundled with the Windows program under its own licence.
5. **Graphical abstracts** are in `../graphical_abstracts`; upload them as separate files.
6. **Declaration of generative AI use**: add it before submission.
7. **Check the author guides** of both journals on the day of submission.
