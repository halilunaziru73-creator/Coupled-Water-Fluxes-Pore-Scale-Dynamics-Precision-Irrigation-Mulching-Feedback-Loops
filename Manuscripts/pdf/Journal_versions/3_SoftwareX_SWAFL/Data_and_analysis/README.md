# Data and analysis of the article

*SWAFL: an open desktop application for equation-traceable irrigation scheduling and design with a graphical interface to the Daisy model (SoftwareX)*

Every figure and table of the article can be traced here to the numbers it shows.

* `figures/Figure_N_*.csv`: every point drawn in Figure N, one row per point, with the panel, its title, the axis labels, the kind of mark (line, scatter, bar, error bar, band, cell of a map), the series name and the values (`x`, `y`, `y_low`/`y_high` for bars, error bars and bands; `x_category`/`y_category` give the label of a categorical axis, e.g. the soil). The rows were recorded while the original script drew the figure, so they are exactly what is plotted.
* `figures/Figure_N_*__<result file>`: the result tables the figure was drawn from.
* `tables/Table_N_*.csv`: every table of the article.
* `replot_from_csv.py`: redraws every figure from the CSV files alone into `replot/` (`python3 replot_from_csv.py`; needs pandas and matplotlib).
* `analysis/`: the original analysis: the Daisy ensemble (`data/daisy_ensemble.csv.gz`, 10 190 runs, 10 041 valid), all scripts, the archived results and `run_original.sh`, which runs it again.

## Figures

| Figure | What it shows | Data | Made by |
|---|---|---|---|
| 1 | Schematic overview of the main processes in SWAFL Desktop. Boxes indicate storages and solid lines flows; dashed black lines are flows out of the system, dotted lines are flows of information and dashed grey lines exchange of information between modules. … | architecture diagram (no data) | `(diagram drawn by hand in analysis/p3_figs.py style; no data)` |
| 2 | The main window of SWAFL: the tree of layers (left), the drawing of the open layer (centre), the dashboard with results, charts and messages (right of centre) and the shared project properties (right). | screenshot of the program | `–` |
| 3 | Scheduling and soil-water layers. (a) Field water balance: precipitation, irrigation, evapotranspiration and drainage beside the soil profile. (b) Fate of the water saved by mulch. (c) Sensor suction every day against the trigger. (d) Trigger law: … | screenshots of the program | `–` |
| 4 | Design layers. (a) Surface irrigation, from the soil to a working layout. (b) Drip: emitters, wetted bulb and uniformity. (c) Sprinklers: nozzle, spacing, wind and soil intake. (d) Subsurface drainage: spacing, depth and pipes. | screenshots of the program | `–` |
| 5a | (a) Surface layer against Example 6.1 of Walker and Skogerboe: advance time, application efficiency and the relative differences of the 16 published quantities. | `figures/Figure_5a_fig03_ws_verification.csv`, `figures/Figure_5a_fig03_ws_verification__p3_surface.json`, `figures/Figure_5a_fig03_ws_verification__p3_ws61.csv` | `analysis/p3_figs.py` |
| 5b | (b) Engine 1 against 1 000 held-out Daisy runs, as shipped (orange) and re-anchored (blue); grey lines are 1:1. | `figures/Figure_5b_fig05_engine1_heldout.csv`, `figures/Figure_5b_fig05_engine1_heldout__e12.json`, `figures/Figure_5b_fig05_engine1_heldout__e12_pred.json` | `analysis/p3_figs.py` |
| 6 | The Daisy workbench. (a) The Daisy process map. (b) Experiments, checked against what Daisy can vary. (c) The experiment folder with its set-ups and the set-up editor. (d) Output pages read from Daisy log files. (e) Decision table: the effect of every … | screenshots of the program | `–` |

## Tables

| Table | Caption | Data |
|---|---|---|
| – | Code metadata | `tables/Code_metadata.csv` (10 rows) |
| – | Software metadata | `tables/Software_metadata.csv` (9 rows) |
| 1 | The three routes from Daisy to a decision. | `tables/Table_1_The_three_routes_from_Daisy_to_a_decisio.csv` (6 rows) |

## Running the analysis again

```
cd analysis
python3 -m pip install -r requirements.txt
sh run_original.sh
```

Seeds are fixed (see `scripts/` and `Manuscripts/reproducibility/README_REPRODUCE.md` of the repository), so the numbers come out the same as in `analysis/results`.
