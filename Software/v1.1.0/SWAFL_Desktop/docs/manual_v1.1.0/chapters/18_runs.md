# Running a design and finding the most efficient inputs

Version 1.1 changes how the three irrigation designs are used. Their inputs are set first, and nothing is computed while you type; the results, charts, design table, schedule and soil-water film appear only when you press **Run simulation**. This chapter describes the run, the value boxes, the field size, the search for the most efficient inputs, the field sketch and the comparison of the three systems.

## The run

When a design layer opens, its inputs are drawn as usual and, below them, the results are replaced by the **Run the design** box:

![The surface design before a run: the inputs are set, the results wait for the run.](images/atlas11/ui_u14_design_before_run.jpg){width=100%}

* **Run simulation** computes the design with the inputs above it. The run animates the irrigation from its start to its end (the time is shown on the playback bar, for example *irrigation time 0 of 314 min*), and then holds the finished state.
* **Find the most efficient inputs** searches the inputs for the highest application efficiency (Section 18.4), puts the best combination into the value boxes and runs it.
* The play button under the drawing is labelled **Run simulation** in the design layers and does the same.

The last run stays valid until something that changes the result changes: a value box, a chip of the design (system, emitter, placement, sprinkler type, layout, run-time mode, mulch, crop, field size), or a setting of Properties other than the irrigation method (soil, tillage, consolidation, crop, mulch, rain, temperature, trigger, sensor depth, nitrogen, year or date). The box then returns with the reason, for example *The settings in Properties changed: the results wait for a new run*. The Design and Charts tabs of the dashboard follow the same rule.

Formally, a run stores the key $\kappa_{\mathrm{run}}$ of the state with which it was made; the results are shown only while

$$
\kappa(\text{state now}) = \kappa_{\mathrm{run}},\qquad \kappa = \bigl(\text{every Properties control except the irrigation method},\ \text{weather mode}\bigr),
\tag{18.0}
$$

*Provenance (Eq. 18.0):* **[Engineered]**: bookkeeping of the run.

and no input of the design has been changed since.

## Value boxes and units

Every input of a design is a value box. Clicking it opens a small window:

![The value window of a surface-design input: exact value, unit, list of the allowed range.](images/atlas11/ui_u15_value_window.jpg){width=100%}

* type the exact value, in the unit chosen beside it;
* or pick a value from the list, which runs across the allowed range;
* lengths can be given in m, km or ft; flows in L/s, m³/h or L/min (emitter flow in L/h or L/s); areas in ha, m² or acre; pressures in kPa, bar, m of water or psi; pressure heads in m, kPa, bar or ft; times in min or h; spacings in m or cm.

The value is kept exactly as typed (2.13 stays 2.13); it is not rounded to a step of the list, and the design runs on it. You may type any value up to the physical limits of the system: for example a run of 5 to 3000 m, an inflow up to 300 L/s per m, an emitter flow up to 100 L/h, a pressure up to 1200 kPa. The list covers only the usual range. A value beyond the physical limits is set to the nearest limit, and the window gives both ranges. The value is converted to the unit of the model, $x_{\mathrm{model}} = x_{\mathrm{typed}}\,c_u$, with $c_u$ the factor of the chosen unit (for example 1000 for km, 1/3.6 for m³/h to L/s, 9.80665 for m of water to kPa).

## Field size: an area, or a length and a width

The drip and sprinkler designs need the area to irrigate and the length of the laterals. The row **Field size** offers two ways of giving them:

* **Area in hectares**, type the area; the lateral length is its own value box.
* **Length and width**, type the length and the width of the field in metres. The area and the lateral length then follow, and the lateral-length box is greyed out with the note *from the field length*:

$$
A_f=\frac{L\,W}{10^4}\ \ [\mathrm{ha}],\qquad L_{\mathrm{lat}}=\mathrm{clip}\Bigl(\frac{L}{\lceil L/L_{\max}\rceil};\ L_{\min},\ L_{\max}\Bigr),
\tag{18.1}
$$

*Provenance (Eq. 18.1):* **[Engineered]**: geometry; laterals longer than $L_{\max}$ are split into equal runs from a central submain.

with $L_{\min}=20$ m and $L_{\max}=300$ m for drip laterals and $L_{\min}=40$ m and $L_{\max}=500$ m for sprinkler laterals. The number of laterals follows from the width, $n_l=\lfloor W_f/S_l\rfloor$ with $W_f=A_f\cdot10^4/L_{\mathrm{lat}}$ (Eq. 12.20 and its sprinkler analogue in Chapter 13), and with it the zones, the pipes and the pump.

The surface design is given by its run length and width directly (*Field length L*, *Field width*), and its area is their product.

![The drip design with the field given by its length and width.](images/ui/drip_dims.jpg){width=100%}

## The search for the most efficient inputs

**Find the most efficient inputs** (in the Run box, on the Design tab, or Tools ▸ *Find the most efficient design inputs*) tries a grid of the inputs that matter most and keeps the one with the highest score

$$
s = E_a - 3\,\max\bigl(0,\ 0.95-E_s\bigr) + \begin{cases} 0 & \text{surface}\\ 0.05\,E_u & \text{drip}\\ 0.05\,\mathrm{CU} - 2\,R_o & \text{sprinkler}\end{cases}
\tag{18.2}
$$

*Provenance (Eq. 18.2):* **[Engineered]**: the application efficiency, with a penalty when the root zone is refilled to less than 95 % (an efficient design that leaves the crop short is not efficient) and a small reward for uniformity.

| Design | Grid tried |
|:--|:--|
| Surface | 11 inflows spaced geometrically across the allowed range, $q_i=q_{\min}(q_{\max}/q_{\min})^{i/10}$; the cut-off rules *when the tail is filled* and *at 85 % of the length*; cutback to 100, 75 or 50 % of the inflow; and the run length $L/n$ for $n=1$ to 4 (the field split into $n$ runs, each at least the shortest length of the system). |
| Drip | emitter flow 1, 1.6, 2, 3, 4 or 8 L/h; emitter spacing 0.3, 0.5, 0.75 or 1 m; interval 1 to 4 days. |
| Sprinkler | five nozzle diameters and four pressures across the range of the sprinkler type; for each, a square spacing of $0.4$ to $0.65$ times the wetted diameter. |

**Your present inputs take part in the search.** A combination is recommended only when its score is higher than the score of your present inputs; otherwise the Design tab says *Already the most efficient: your present inputs* and offers nothing to apply. The search takes about 0.1 to 3.5 s and stops after that time.

Applying a combination writes its values into the value boxes, so you can see and change each of them, and runs the design.

## The field sketch

*View* or *Tools ▸ Field sketch to design…* opens a window with a grid on the left and the questions on the right.

**On the grid.** A red crosshair follows the mouse and gives its position in metres.

* **Field corners:** click to place a corner. Click near a side to add a corner on it, drag a corner to move it, and double-click a corner to remove it.
* **Side lengths:** each side shows its length just outside the field. Click a length to type it exactly; the next corner moves along the side, and the grid changes its scale if the field no longer fits.
* **Water source:** in this mode, click where the water is and drag the blue marker to move it.
* **Inlet:** in this mode, drag the yellow square along the edge of the field to where the pipe or the canal enters.
* **Grid square:** sets the scale, from 1 to 100 m per square.
* **Hand, zoom in and out, Fit:** the hand button moves the drawing; the right or middle mouse button, or Shift and drag, also move it in any mode. **+** and **−**, or the mouse wheel over the grid, zoom in and out around the cursor (10 % to 1200 %). **Fit** shows the whole field. The scale bar and the north arrow stay on the screen and follow the zoom.
* **Locate on the map:** opens the field on the satellite map (Chapter 20), to find the farm, demarcate it on the image and compute its vegetation and water indices.

![The sketch zoomed in, with the hand, zoom and map buttons.](images/ui/sketch_zoom.jpg){width=100%}

**Greenhouses, beds, areas to irrigate, exclusions, plants and traps.** Beside the modes above, the sketch has six more tools for drawing what is on the field. Choose the tool, then click on the grid (the buttons are in the row above the grid):

| Tool | How to draw it | What it is used for |
|:---------------|:------------------------------|:------------------------------------------|
| Greenhouse | Click two opposite corners | A greenhouse or polytunnel, drawn as a blue rectangle with its ribs; its area is written inside. |
| Plant bed | Click two opposite corners | A raised or ploughed bed, drawn as a brown rectangle with its rows; its area is written inside. |
| Area to irrigate | Click the corners; double-click, or click the first corner again, to close | The part of the field that the design must irrigate (green). |
| No-irrigation zone | Click the corners; double-click, or click the first corner again, to close | A part that is left dry, such as a track, a building, a pond or a rock outcrop (red, dashed). |
| Plant | Click the place | One plant or tree (a green circle). |
| Monitoring trap | Click the place | One trap or monitoring post (a purple triangle). |

Double-click on a drawn object, with its tool chosen, to remove it. *Undo* (Ctrl+Z) and *Redo* (Ctrl+Y) go back and forward through every change of the drawing, one step at a time: a corner placed, a corner moved, an object added or removed, and *Clear*. Press *Escape* or choose another tool to stop an area you have not closed.

![The sketch with an area to irrigate, a no-irrigation zone, a greenhouse, a plant bed, plants and traps.](images/ui/sketch_objects.jpg){width=100%}

The line under the grid sums what is drawn: the hectares to irrigate and the number of areas, the square metres excluded, the number and area of greenhouses and beds, and the numbers of plants and traps. The same line appears in the summary of the seventh question as *Drawn on the field*.

**The area that is irrigated.** When the design is filled from the sketch, the area it uses is the sum of the areas to irrigate. If none is drawn, it is the area of the field less the no-irrigation zones. This area sets the area of the surface, drip and sprinkler designs, and therefore the volume, the pumping time and the cost of the run.

While you draw, the window draws the layout of the system you choose:

* furrows, borders or basins;
* drip laterals at the row spacing;
* sprinkler laterals with the sprinklers and their wetted circles;
* the submain or head ditch along the inlet end;
* the mainline from the source to the inlet, with its length.

**The questions**, in seven steps (*Next question* and *Back* move through them; the step buttons jump):

1. *Field:* length and width (*Make a rectangle of this size*), ground slope, and the direction in which the ground falls.
2. *Water:* where the water comes from (well, borehole, canal, river, pond or tank), the lift to the field, the flow the source can give, and the hours a day you can irrigate.
3. *Crop:* the crop, the row spacing and the plant spacing.
4. *Soil:* the soil, and whether there is a compact layer below the topsoil.
5. *System:* border strips, furrows, basins, drip or sprinklers; whether the laterals run along the field or across it; for drip, the depth of the laterals and the emitter; for sprinklers, the system, the sprinkler and the two spacings.
6. *Running:* how often to irrigate (drip), and whether the farmer or an automatic controller opens the valves.
7. *Summary:* everything that will be set.

The sketch gives

$$
A=\tfrac12\Bigl|\sum_i (x_i y_{i+1}-x_{i+1}y_i)\Bigr|,\qquad L_{\mathrm{run}} = \max_{\text{along the longest side}} - \min,\qquad W = \text{extent across it},
\tag{18.3}
$$

*Provenance (Eq. 18.3):* **[Literature]**: shoelace formula and projection on the direction of the longest side.

and the mainline length from the source to the inlet. Here $L_{\mathrm{run}}$ is measured along the direction of the laterals: along the longest side, or across it.

**Turn the sketch into the design** sets the crop and the soil in Properties and fills the chosen design:

* *Surface:* the system, the run length, the field width, the slope and the farm supply, and the furrow spacing (from the rows).
* *Drip:* the lateral length, the lateral spacing (the rows), the emitter spacing (the plants), the field length and width, the supply, the interval, the placement and the emitter.
* *Sprinklers:* the area, the slope, the supply, the two spacings, the sprinkler, the system and the lateral length.

It also sets the mainline length, the lift, the source, the hours a day, the compact layer and the operator of the valves. Then it opens the design, which waits for **Run simulation**.

![The field sketch.](images/atlas11/ui_u12_sketch.jpg){width=100%}

## The soil water in the days ahead

Each design layer (surface, drip and sprinklers) ends with a film of the soil water: **Soil water in the days ahead (DSS)**. It plays day by day; click it to pause or play.

**How the dates and depths are computed.** The film and the schedule under it come from one FAO-56 daily root-zone balance of the farm (Allen et al., 1998), the *irrigation plan*:

* the **crop water use** of every day, $ET_c=K_c\,ET_0$: $K_c$ from the four-stage curve of the crop in Properties (its stages, $K_{c,ini}$, $K_{c,mid}$ and $K_{c,end}$, its sowing date and, for trees, its density; Chapter 21), or $0.3+0.85\,c$ from the crop cover $c$ for the simulated cereal rotation; the part of $K_c$ that is evaporation from the bare ground between the plants, $0.8\,\min(K_c,1)(1-c)$, is cut by the mulch to its vapour-flux fraction;
* the **reference evapotranspiration $ET_0$ and the rain** of every day of the weather in use: the online weather of the farm with its 16-day forecast, a weather file, or the recorded weather, with the rainfall scale and the temperature shift of Properties;
* the **root zone**: the roots of every day of the daily model (Chapter 5) and the available water of the soil, $\mathrm{TAW}=\mathrm{AWC}\,z_r$;
* the **trigger** of the soil (Chapter 6) and the **design**: its net depth per irrigation $Z_n$, its pumped depth and its run time.

An irrigation is due when the root zone has lost the trigger depth $f_T\,\mathrm{TAW}$ or the design depth $Z_n$, whichever is smaller; it puts back $\min(Z_n, D_r)$ (a shorter run when the trigger comes first). The balance starts at the sowing (or 150 days before the working date) from the water of the daily model, so the water of the working date carries the rain and the irrigations before it.

$$
\begin{aligned}D_r(d)&=D_r(d-1)+K_s\,K_c\,ET_0(d)-\bigl(P(d)-RO(d)\bigr)-I(d),\qquad K_s=\min\Bigl(1,\frac{\mathrm{TAW}-D_r}{(1-p)\,\mathrm{TAW}}\Bigr),\\ I(d)&=\min(Z_n,D_r)\quad\text{when}\quad D_r\ge\min(f_T\,\mathrm{TAW},\,Z_n),\end{aligned}
\tag{18.4}
$$

*Provenance (Eq. 18.4):* **[Literature]** FAO-56 root-zone balance and water stress coefficient (Allen et al., 1998), $p=p_0+0.04(5-ET_c)$ with $p_0$ of the crop; runoff $RO=0.3(P-35)$ above 35 mm (none for bunded rice); water above field capacity drains. The irrigation rule is **[Engineered]**.

**The season of your crop.** The crop chosen in Properties is the crop of the decision. When the working date falls in its season, the film runs from the working date to 30 days after the harvest. When the working date has no crop (before sowing or after harvest), the film starts at the **next sowing of that crop** and runs through its whole season, and a yellow note above the film says so; the schedule under the film follows the same season. With the online weather, whose record ends in the present year, the next season is predicted with the weather of the last season of the record, its dates moved on by one year. The crops of the library are sown on their sowing date (Properties), which may be any day of the year; their season may run past 31 December, and the daily model irrigates them whenever they are in the field.

**The weather of the decision.** The banner at the top of every design has a **WEATHER** line: the weather in use (the recorded weather of Taastrup, Denmark, 1980 to 1999; a weather file; or the online weather of a place with the 16-day forecast) and the button **Online weather of the farm…** (or *Change the weather…*), which opens the online-weather window (Chapter 19). The weather of your farm calibrates everything that follows: the soil water of every day, the irrigation dates and depths, the film, the schedule and the planting advice.

* **Left: the profile of the day.** The water content of each layer of the real soil, 0 to 100 cm, with lines at the wilting point, the trigger and field capacity, the depth of the roots and the sensor. The frame and the label below take the colour of the phase of the day.
* **Right: the days, coloured by phase.** The band at the top colours every day: irrigation day (blue), rain over 5 mm (light blue), comfortable (green), nearing the trigger (yellow), crop stress, $K_s<1$ (orange, also shaded across the chart), near the wilting point (red), and no crop (grey). The chart also shows:
  * the water held in the root zone in mm (left axis), against the full level (field capacity over the roots of that day) and the level at which this design irrigates (the trigger, or the design depth when it is smaller); both levels rise and fall with the roots, so the axis changes with the soil and the crop;
  * the water left at the sensor, in % of the available water (right axis), from the profile of the daily model scaled to the root zone of the plan;
  * rain as ticks at the top and drainage as ticks at the bottom;
  * a dashed red line for what would happen **without irrigation from the day shown**: the root zone dries on with the weather of the record until it reaches the wilting point. It starts again from each day of the film.
* **Below: the analysis.**
  * The day in words: the date, the crop, the phase, the water left, and its crop water use, $K_c\times ET_0=ET_c$.
  * The next irrigation after the day shown, with its date, the days to it, the water the root zone has lost by then, the net and pumped depths of this design (and the part that drains, if any), and the date the wilting point would be reached without irrigation from that day. Both are counted again for every day of the film.
  * For the whole span: the number of irrigations and their water, the rain, the crop water use, the drainage, and the share of days in each phase.

Every part of the film is labelled.

* **The profile** has its depth axis (cm) and its water-content axis (% by volume, with the values at the wilting point and at field capacity). Labels mark the wilting point (WP), the trigger and field capacity (FC).
* **The chart** has its axis of the water in the root zone (mm, left), of the water at the sensor (% of available, right) and its axis of dates (the first of each month, with the year at January). The day shown is marked by a line with its date and its water above the chart; arrows mark each irrigation; *next irrigation* names the date and the days to it, and the cross of the wilting point names its date and the days to it without irrigation. These labels move with the film.
* **The colours** are distinct: irrigation dark blue, rain light blue, comfortable green, nearing the trigger yellow, stress orange, near wilting red, no crop grey. The root zone line is dark blue, the sensor purple, the trigger black dashed, the dry-down without irrigation red dotted, the rain ticks blue and the drainage ticks teal.

**In the Dashboard**, the block *Soil water now: the film of this design* follows the film day by day: the date and day of the film, the crop and phase, the water in the root zone (mm and %), the crop water use of the day ($K_c\times ET_0$), the depletion of the root zone against the level at which the design irrigates, the next irrigation (date, days to it, net and pumped depths) and the wilting point without irrigation (date, days to it).

![The soil water in the days ahead: the FAO-56 plan of the drip design for maize, an irrigation day, with the crop water use of the day (Kc × ET0) and the next irrigation.](images/ui/dss_plan.jpg){width=88%}

**When to plant.** Under the film, the chart *When to plant …* gives, for every sowing week of the year, the irrigation the crop needs in a season (bars, mm) and its rain-fed yield (red line, % of potential), from the FAO-56 root-zone balance of the crop library over the 20 years of the weather in use, with your soil, trigger and method. Weeks too cold or too hot for the crop are grey: warm-season crops need a minimum air temperature at sowing and over the season (maize 10 and 14 °C, soybean 10 and 15 °C, tomato 12 and 15 °C, pepper 14 and 17 °C, sorghum 14 and 18 °C, rice, millet, cotton and cassava 15 and 20 °C) and no frost; cool-season crops (wheat, chickpea, mustard, potato, onion, cabbage) a season mean between 5 and 24 °C. The temperatures are those of the weather in use when it has them (online weather, or a file with temperatures), otherwise the typical climate of Taastrup, Denmark, the site of the recorded weather. The best week is the feasible week with the least irrigation (within 10 %) and the highest rain-fed yield; the best window is the run of feasible weeks within 15 % of its need. The text gives the window, the need, the rain-fed yield and the need at your own sowing date; **Sow on … (best)** sets the sowing date in Properties. When no week is warm enough, the warmest window is shown and the text says so. For the simulated cereal rotation, whose dates are fixed, the advice is for wheat from the library (soybean for the legume, tomato for the vegetable) with a button to use that crop. Trees, vines and palms stand all year and have no sowing date.

The Dashboard block *Soil water now* also gives the planting window and the weather in use.

Everything follows the settings. Change the trigger, the sensor depth, the soil, the crop, the mulch, the rain or the weather and the film is computed again.

The phase of a day is set in this order: an irrigation day; a day with no crop; near wilting when the root zone has lost 85 % of its available water; crop stress when $K_s<1$; a rain day (over 5 mm); nearing the trigger when the depletion reaches 80 % of the level at which the design irrigates; otherwise comfortable.

The water left in the root zone on day $d$ is $\mathrm{TAW}-D_r$ of Eq. 18.4. Without irrigation from the day shown, the depletion goes on with the same $K_c\,ET_0$ and rain:

$$
D_r(d+1)=\mathrm{clip}\bigl(D_r(d)+K_c\,ET_0(d)\,[0.35+0.65\,K_s]-(P-RO)(d);\ 0,\ \mathrm{TAW}\bigr),
\tag{18.5}
$$

*Provenance (Eq. 18.5):* **[Literature]** with an **[Engineered]** floor: the crop and the soil keep losing about a third of $ET_c$ as the soil dries. The wilting point is reached when $D_r\ge 0.97\,\mathrm{TAW}$.

**The schedule** under the film lists the next eight irrigations of this design: the date and the days to it, $K_c$ and $ET_c$ of that day, the water the root zone has lost (of its TAW), the net and pumped depths and the run time (shorter when the trigger comes before the design depth), and the gap to the next one. *The season in numbers* gives, for the season of the decision, when to irrigate, the crop water use ($K_c\times ET_0$, with its peak), the rain and its runoff, the irrigations (their number, dates, net and pumped water), the mean, shortest and longest interval, the drainage below the roots, the days of crop stress with the yield as a share of the potential ($1-K_y(1-ET_a/ET_c)$), and the efficiency of the design. The season rows of each design (*Net irrigation in the season*, the gross water and the pumping hours) use the same plan, and so does the zone-by-zone irrigation of the field map (Chapter 20).

![The schedule of the drip design and the season in numbers.](images/ui/dss_schedule.jpg){width=88%}

## Comparing the three systems

*Tools ▸ Compare the irrigation systems on this field* computes the surface, drip and sprinkler designs with the inputs they have now, on the same soil, crop and trigger, and lists their application efficiency, root zone filled, deep percolation, runoff or evaporation and the time per irrigation side by side.

![The comparison of the three systems.](images/atlas11/ui_u13_compare.jpg){width=100%}
