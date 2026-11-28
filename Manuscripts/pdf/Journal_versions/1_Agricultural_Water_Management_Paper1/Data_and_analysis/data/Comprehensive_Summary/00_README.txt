Group 1 - summarize_results3.py
Enter EVERY simulation, collect ITS OWN output files and values, experiment by experiment.

    py summarize_results3.py                 (Windows, in the folder that has run_all.py)
    py summarize_results3.py --only E0,E5    (only some experiments)
    py summarize_results3.py --daily         (also the daily files of E0-E7, very large)

How it works
  It walks EVERY folder under ./experiments (or --root). Any folder holding .dlf and/or .dai files
  is entered, whatever the number of .dlf files (0, 9, 14 or more). The .dlf files are grouped by
  the simulation named in their own header (SIMFILE), so each simulation is treated independently,
  even if several simulations wrote into the same folder. A simulation with a .dai but no .dlf is
  listed as "no output files".
  Every simulation folder has its own .dai and its own output files. The file NAMES repeat
  (Annual-FN.dlf, Annual-Harvest.dlf ...) but each file has its own header (SIMFILE, SIM,
  RUN, VERSION, LOGFILE, INTERVAL) and its own values, and some simulations have more output
  files than others. For each experiment, one after the other (E0 baselines first), the script:
    1. enters each simulation folder and opens each of its .dlf files;
    2. keeps EVERY value: every date (row) of every file, every column, with units;
       files of the same simulation are put side by side on the same date
       (e.g. 1981-04-01: Annual-FN, Annual-FN_100cm, Annual-FWater, Annual-SWater ...;
        harvest dates: Annual-Harvest), and each row carries the simulation's own
       SIMFILE, SIM, RUN time and VERSION read from its files;
    3. writes the experiment CSV (all its simulations, one after the other);
    4. writes the experiment SUMMARY (one row per simulation: settings from its .dai, each
       file's header, long-term means and the indexes IE, IWUE, DPF, PFPn, NLF, checks);
    5. goes to the next experiment. At the end: the summary of all 17 experiments.

Output: Comprehensive_Summary/
    E00_Baselines.csv ... E16_Edge_Cases.csv          17 CSVs: all values of all simulations
    Experiment_Summaries/E00_Baselines_SUMMARY.csv    17 CSVs: one row per simulation
    00_SUMMARY_ALL_EXPERIMENTS.csv                    one row per experiment + TOTAL
    00_summary_all_simulations.csv                    the 10,190 summary rows together
    Daily/E00_Baselines_daily.csv ...                 only with --daily

Column names: "<file> | <variable> [unit]", e.g. "Annual-FN | Matrix-Leaching [kg N/ha]".

Indexes (course definitions, long-term TOTALS; harvest year Y matched with the next balance date):
    IE    = sum(yield kg/ha) / sum(irrigation mm * 10)                   [kg/m3]
    IWUE  = (sum yield - sum rainfed yield same soil/years) / (irr*10)   [kg/m3]
    DPF   = sum(drainage below 1 m) / sum(rain + irrigation)             [-]
    PFPn  = sum(yield kg DM/ha) / sum(N fertiliser kg N/ha)              [kg/kg]
    NLF   = sum(N leached below 1 m) / sum(N fertiliser)                 [-]
Status checks: SOLVER_FAILURE (h > +1e4 cm), OUTPUT_FROM_OTHER_SIM (SIMFILE in the file header is
not this folder's .dai), NO RESULTS, not run; identical_output_to = same results as another
simulation of the experiment. Use status = ok for analysis.

Made 2026-10-23 16:32: 10190 simulations, 10041 valid, 149 solver failures, 0 not run, 0 other problems.
