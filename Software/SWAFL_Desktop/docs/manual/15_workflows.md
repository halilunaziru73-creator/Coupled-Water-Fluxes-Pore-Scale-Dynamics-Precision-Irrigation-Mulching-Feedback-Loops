# Worked workflows

Each workflow is a complete sequence of clicks, the numbers to expect, and the equations behind them.

## Workflow 1: How much does straw mulch save?

1. *Tools ▸ Ready-made cases ▸ Present* (or set soil Coarse Loam, tillage reduced, crop cereal/oilseed, mulch none, method Surface).
2. Press **Baseline** (Ctrl+B). The ten tiles of the 20-year block are stored.
3. In Properties ▸ Mulch choose **Straw**, then set *Soil cover* (VFF) to 0.8. Read the arrows: soil evaporation falls (green), irrigation falls (green), yield changes slightly.
4. Open *Field balance* and press Run to see the evaporation bar shrink.

*Why:* straw has CAP $=4$ mm storage and a thermal-resistance weight 0.4 (Table 3.1); the cover fraction scales the evaporation and the interception of Engine 2 (Section 5.2, "Infiltration, redistribution and drainage" and "Transpiration, evaporation"). The saving reported in the tile *Irrigation without mulch* minus *Irrigation* is the mulch effect on the whole-year balance.

## Workflow 2: When should I irrigate?

1. Set the working date to today and choose the case.
2. Open *Irrigation design ▸ Surface irrigation design* (or Drip or Sprinkler) and scroll to the *Irrigation schedule*; the first row is the next irrigation date. The *When to irrigate* message at the end repeats it with the mean interval.
3. Move the **Trigger** slider drier (e.g. $-300\to-1000$ cm of suction): the interval lengthens and the number of irrigations falls (Eq. 6.3 shifts $f_T$).
4. Move the **Sensor depth** to see how the date changes: a shallow sensor dries first and triggers earlier.

## Workflow 3: Design a border strip for a loam

1. Set the soil to Loam; open *Surface irrigation design*; *Start from: Your soil*; *System: Border*.
2. The layer computes $K_s$, $\psi_f$ and the Kostiakov constants (Eqs. 11.1–11.7); read $R^2$.
3. Set the length to your field (e.g. 200 m). The inflow is chosen automatically (Eq. 11.22 for furrows, the $E_aE_s$ optimum for borders).
4. Read $E_a$ and $E_s$ in the result section. If $E_a<85$ % open the design table and tap the green row; the sliders move to it.
5. Read the tornado chart: if $A$ or $k$ dominate, the soil intake is the main uncertainty, so measure it in the field.

## Workflow 4: Choose and size a drip system

1. Choose the crop (vegetable $\to$ $S_l=1.5$ m), the soil and the emitter (inline).
2. Lateral length: increase until $E_u$ turns amber (Eq. 12.7).
3. *Placement*: compare *Surface*, *25 cm* and *45 cm*: buried drip loses less to evaporation (Eq. 12.15) but a bulb that is too deep loses water below the roots (Eq. 12.14).
4. Set $A_f$ and $Q_s$; read zones, TDH and kW from the layout block (Eqs. 12.20–12.23).
5. Tap the best row of the design table to apply it.

## Workflow 5: Check a sprinkler against the course rules

1. Choose the soil and the slope (e.g. Sandy Loam, 3 %); the banner states the allowed rate (Table 13.3).
2. Choose *Impact*; set pressure and spacing; read CU and the application rate.
3. Open the ten checks (Section "The ten textbook checks"); fix the red ones in the order the text names.
4. Compare the system chips (solid-set, hand-move, pivot, linear, gun) and their efficiency ranges.

## Workflow 6: A warmer, drier future

1. Set the date to 2050-07-01; choose *dry* as the weather year; set the temperature offset (+2 °C) and rainfall factor (0.8).
2. Pin the baseline *before* you change the scenario, so the arrows show the climate-change effect.
3. Check the *Charts* tab: irrigation rises and drainage falls.
4. Remember these are scenarios (Chapter 17).

## Workflow 7: Save, share and reproduce

Save the project (*File ▸ Save project*) after each case, export the yearly CSV and the design CSV, and note the version number shown in the status bar. Reopen the `.swafl` to restore the state exactly.
