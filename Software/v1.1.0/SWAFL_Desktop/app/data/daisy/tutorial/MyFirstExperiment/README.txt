My first Daisy experiment (SWAFL tutorial)

Common/            files that every run reads
  my-soil.dai        the soil horizons and the soil column
  my-management.dai  the crop, fertiliser, tillage and irrigation
  my-logs.dai        which results are written
  Daily-1965-2000.dwf the daily weather (Taastrup, Denmark)
run-rainfed/run.dai     run 1: spring barley without irrigation
run-irrigated/run.dai   run 2: the same with irrigation when the soil is dry

To run (Windows): open a command window in a run folder and type
  "C:\Program Files\Daisy\bin\daisy.cmd" run.dai
or press Run in the SWAFL set-up editor. Each run writes its .dlf logs into its own folder.
Load both folders in SWAFL (Daisy model, Log plots, Add a folder) and compare them in Run comparison.
