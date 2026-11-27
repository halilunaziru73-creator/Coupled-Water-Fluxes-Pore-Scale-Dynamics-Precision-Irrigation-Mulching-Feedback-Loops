# Journal versions of the four manuscripts

The four manuscripts, refined to the format of the journals they are aimed at. The full-length versions in `../tex` and `../pdf` are unchanged; they can be submitted as Supplementary Material.

| Paper | Journal | File | Format |
|---|---|---|---|
| 1. Soil hydraulic memory, recoverability of evaporation savings and water-balance closure | Agricultural Water Management | `AWM_Paper1.pdf` | Research article, Harvard references, 5 highlights, 10 figures, 10 tables |
| 4. Reach of suction-triggered irrigation and the marginal fate of irrigation water | Agricultural Water Management | `AWM_Paper4.pdf` | Research article, Harvard references, 5 highlights, 5 figures, 4 tables |
| 2. SWAFL Desktop: equation-traceable engines for irrigation scheduling and design | SoftwareX | `SoftwareX_Paper2.pdf` | Original software publication, code and software metadata, ≤3000 words, 5 figures |
| 3. SWAFL Daisy Workbench: a graphical user interface for Daisy | SoftwareX | `SoftwareX_Paper3.pdf` | Original software publication, code and software metadata, ≤3000 words, 6 figures |

Copies of the PDFs, saved under their titles, are in `../pdf/Journal_versions`.

## What was changed

* **Layout and front matter**: Elsevier's `elsarticle` class (official copy from github.com/STM-Document-Engineering/elsarticle), affiliations, corresponding author, abstract, highlights (Agricultural Water Management: 3–5 bullets of at most 85 characters each), keywords, line numbers.
* **Structure**: Agricultural Water Management papers follow Introduction, Materials and methods, Results, Discussion, Conclusions with numbered subsections (the run-in paragraphs became subsections). SoftwareX papers follow the journal template: Code metadata, Software metadata, Motivation and significance, Software description (architecture, functionalities), Illustrative examples, Impact, Conclusions.
* **Length**: Paper 1 was cut from about 25,000 to about 7,000 words. The failed-run analysis, the per-experiment invariants, the compositional analysis, irrigation compensation, the drivers of hydraulic properties, the hypothesis register, the software section and the novelty table now go to the Supplementary Material. Paper 4 moved the depletion law, the flux diagrams, the controllability figure and the screenshots to the Supplementary Material. Papers 2 and 3 were cut to within the 3,000-word limit of SoftwareX. Paper 2 now covers the engines and design layers, Paper 3 the Daisy workbench and bridge, so the two do not describe the same software twice.
* **Declarations** required by Elsevier: CRediT authorship statement, declaration of competing interest, funding and data availability (the declaration of generative AI use is to be added by the author before submission).
* **References**: Harvard (author–year) for Agricultural Water Management, numbered for SoftwareX, both from `../tex/refs.bib`.
* **No new results**: every table and figure is copied verbatim from the original manuscripts by `build.py`, and every number in the new text was checked automatically against the originals (all found).

## Rebuild

```
python3 build.py                 # all four
python3 build.py AWM_Paper4      # one
```
Sources with `%%PULL` lines are in `src/`; `build.py` writes the expanded `.tex` next to this file and compiles with XeLaTeX and BibTeX.

## Before submitting (to do by the author)

1. **Check the references.** Many references in `refs.bib` were entered from memory and their DOIs were never verified; check each cited entry against the publisher's page.
2. **Two SoftwareX papers on one application.** SoftwareX may treat Papers 2 and 3 as the same software. They were separated (engines and design layers against the Daisy workbench), but if the editor objects, submit Paper 3 to SoftwareX and Paper 2 as a research article (for example to Agricultural Water Management or Computers and Electronics in Agriculture).
3. **SoftwareX code repository.** On acceptance SoftwareX asks for the code version described to be placed in its own GitHub organisation (ElsevierSoftwareX); prepare a tagged release `v1.1.0`.
4. **Daisy licence.** Daisy is bundled with the Windows program under its own licence; state its terms in the submission if the editor asks.
5. **Graphical abstracts and highlights** for Papers 1 to 3 are in `../graphical_abstracts`; upload them as separate files. Highlights are also typeset in each PDF.
6. **Abstract style.** The abstracts keep your choice of no numbers; the highlights carry the key numbers.
7. **Check the author guides** of both journals on the day of submission, as limits can change.
