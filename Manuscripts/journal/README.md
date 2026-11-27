# Journal versions of the manuscripts

Each article is within the limits of its journal and follows its rules; everything else from the full manuscripts (`../pdf/Paper1` to `Paper4`) is published with it as **Supplementary Material S1**, complete and in the order of the article, so no information is lost. The submission packages are in [`../pdf/Journal_versions`](../pdf/Journal_versions).

| Article | Journal | Article file | Length | Supplementary Material S1 |
|---|---|---|---|---|
| Soil Hydraulic Memory and the Recoverability of Evaporation Savings and the Closure of the Water Balance (Paper 1) | Agricultural Water Management | `AWM_Paper1.pdf` | about 7,300 words with captions, 10 figures, 10 tables, 95 references | `Supplementary_AWM_Paper1.pdf` (complete text) |
| The Reach of Suction-Triggered Irrigation and the Marginal Fate of Irrigation Water (Paper 4) | Agricultural Water Management | `AWM_Paper4.pdf` | about 5,200 words, 5 figures, 4 tables, 45 references | `Supplementary_AWM_Paper4.pdf` (complete text) |
| SWAFL: An open desktop application for equation-traceable irrigation scheduling and design with a graphical interface to the Daisy model (Papers 2 and 3 merged) | SoftwareX | `SoftwareX_SWAFL.pdf` | about 2,500 words with captions (limit 3,000), 6 multi-panel figures (limit 6) built from the software screenshots of the presentation, 5 highlights, 62 references | `Supplementary_SoftwareX_SWAFL.pdf` (complete text of Papers 2 and 3, merged section by section) |

Supplementary Material S2 of each article is the existing derivations, data and mechanisms PDF in `../pdf/Supplementary`.

## Journal rules applied

* **Both journals**: Elsevier `elsarticle` class (official copy from github.com/STM-Document-Engineering/elsarticle), line numbers, title, affiliations, corresponding author, abstract, keywords, CRediT authorship contribution statement, declaration of competing interest, funding, data availability, acknowledgements, supplementary material statement. The declaration of generative AI use is to be added by the author.
* **Agricultural Water Management**: research article in the order Introduction, Materials and methods, Results, Discussion, Conclusions, Appendix; 5 highlights of at most 85 characters; abstract under 250 words; Harvard (author–year) references; double-spaced review layout.
* **SoftwareX** (original software publication): title in the journal's style (*Name: An …*), highlights, an abstract that describes the software without simulation results, code metadata and software metadata tables; sections Motivation and significance, Software description (architecture, functionalities), Illustrative examples, Impact, Conclusions; at most 3,000 words and 6 figures; numbered references.
* **Supplementary Material S1**: the complete manuscript, with sections, figures, tables and equations numbered S1, S2, … so they cannot be confused with those of the article.
* **No new results**: tables and figures of the articles are copied verbatim from the full manuscripts, and every number in the article text was checked against them.

## Rebuild

```
python3 build.py     # the three articles, from src/
python3 full.py      # the three Supplementary Material S1 files, from ../tex
```

## Before submitting (to do by the author)

1. Check the references: many entries in `refs.bib` were entered from memory and their DOIs were never verified.
2. Add the declaration of generative AI use.
3. SoftwareX asks on acceptance for the described code version in its GitHub organisation (ElsevierSoftwareX); prepare a tagged release `v1.1.0`. Daisy is bundled under its own licence.
4. Upload the graphical abstracts from `../graphical_abstracts`.
5. Check the author guides of both journals on the day of submission.
