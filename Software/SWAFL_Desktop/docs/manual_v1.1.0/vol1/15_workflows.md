# Worked workflows

Each workflow is a complete sequence of clicks, what to expect, and the equations behind it.

## Workflow 1: How much does straw mulch save?

1. Properties ▸ Scenario ▸ *Ready-made case* ▸ *Default* (Coarse Loam, bare, normal climate).
2. Press **Pin** above the dashboard (Ctrl+B). The tiles of the 20-year block are stored.
3. In Properties ▸ Mulch choose **Wheat straw**; the strength becomes 0.4 and the capacity 4 mm. Read the arrows: soil evaporation falls (green), irrigation falls (green).
4. Open *Mulch and evaporation ▸ Fate of saved water* to see where the saved water goes (less irrigation, more drainage, more transpiration).

*Why:* the strength $\varphi$ scales the vapour flux through the mulch, and the capacity the water the mulch holds (Chapter 9); *Irrigation without mulch* minus *Irrigation* is the saving on the whole-year balance.

## Workflow 2: When should I irrigate?

1. Set the working date to today and choose the soil and crop.
2. Open *Irrigation design ▸ Surface irrigation design* (or drip, or sprinklers), set the inputs and press **Run simulation**. Scroll to the *Irrigation schedule*: the first row is the next irrigation date; the *When to irrigate* message at the end repeats it with the mean interval.
3. Change the **Trigger** in Properties to a drier value (for example $-300\to-1000$ cm): the run is cancelled; run again: the interval lengthens and the number of irrigations falls (Eq. 6.3 shifts $f_T$).
4. Change the **Sensor depth**: a shallow sensor dries first and triggers earlier.

## Workflow 3: Design a border strip for a loam

1. Set the soil to Loam; open *Surface irrigation design*; *Start from: Your soil*; *System: Border*.
2. Type the run length of your field in the *Field length* box (for example 200 m), the width and the slope.
3. Press **Run simulation**. Read $E_a$ and $E_s$ in *Result*, and the hydrograph and the times on the Charts tab.
4. Press **Find the most efficient inputs**. The search tries inflows, cut-off rules, cutbacks and shorter runs (Section 18.4); if it finds a better combination, the Design tab offers **Apply these inputs and run**.
5. Read the sensitivity chart: if the intake constants dominate, the soil intake is the main uncertainty, so measure it in the field.

## Workflow 4: Choose and size a drip system

1. Choose the crop, the soil and the emitter (inline).
2. *Field size*: **Length and width**; type the length and width of the field. The area and the lateral length follow (Eq. 18.1).
3. *Placement*: compare *Surface*, *25 cm* and *45 cm*: each change cancels the run; run each and compare $E_a$ and the losses.
4. Set the farm supply $Q_s$; read zones, pump head and power in the layout block (Eqs. 12.20–12.23), and the pump hydrograph on the Charts tab.
5. Open the *Virtual farm simulation* of the drip design to watch one irrigation in the field and its 3D water fate (Chapter 20).

## Workflow 5: Check a sprinkler against the course rules

1. Choose the soil and the slope (for example Sandy Loam, 3 %); the banner states the allowed rate (Table 13.3).
2. Choose *Impact sprinkler*; set the nozzle, the pressure and the spacing in their value boxes; press **Run simulation**; read CU and the application rate.
3. Open *Does your design pass?*; fix the red checks in the order the text names; run again.
4. Compare the system chips (solid-set, hand-move, center pivot, linear-move, travelling gun) and their efficiency ranges.

## Workflow 6: My own weather, a warmer future

1. *File ▸ Import weather data* and choose your daily weather file, or *File ▸ Online weather for a location* (Chapter 19). Every layer now runs on it; Properties shows *Imported weather file* (or *Online weather of a location*) as the weather source.
2. Pin the baseline.
3. Set the temperature shift to +2 °C and the rainfall scale to ×0.8. The arrows show the effect of the change on your own climate.
4. Switch back to *Built-in weather record* in Properties ▸ Scenario at any time: your earlier rainfall and temperature settings return.

## Workflow 7: A report for a client

1. *File ▸ Save report as PDF (choose the layers)…*.
2. Untick the groups you do not need (for example *Seasonal data* and *Feedback loops*), keep the irrigation design and the virtual farm.
3. **Make the PDF**, choose where to save it. Each layer gets your inputs, its key numbers and its full drawing; long drawings continue on the next pages, cut at their section headings (Chapter 23).

## Workflow 8: Save, share and reproduce

Save the project (*File ▸ Save project*) after each case, export the yearly CSV and the design CSV, and note the version shown in the status bar (*SWAFL 1.1.0*). Reopen the `.swafl` file to restore the state exactly.
