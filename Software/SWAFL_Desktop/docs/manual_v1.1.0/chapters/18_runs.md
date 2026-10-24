# Running a design and finding the most efficient inputs

Version 1.1 changes how the three irrigation designs are used. Their inputs are set first, and nothing is computed while you type; the results, charts, design table, schedule and virtual farm appear only when you press **Run simulation**. This chapter describes the run, the value boxes, the field size, the search for the most efficient inputs, the field sketch and the comparison of the three systems.

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

* **Area in hectares** — type the area; the lateral length is its own value box.
* **Length and width** — type the length and the width of the field in metres. The area and the lateral length then follow, and the lateral-length box is greyed out with the note *from the field length*:

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

**Your present inputs take part in the search.** A combination is recommended only when its score is higher than the score of your present inputs; otherwise the Design tab says *Already the most efficient: your present inputs* and offers nothing to apply. The search takes about 0.1–3.5 s and stops after that time.

Applying a combination writes its values into the value boxes, so you can see and change each of them, and runs the design.

## The field sketch

*View* or *Tools ▸ Field sketch to design…* opens a window with a grid on the left and the questions on the right.

**On the grid.** A red crosshair follows the mouse and gives its position in metres.

* **Field corners:** click to place a corner. Click near a side to add a corner on it, drag a corner to move it, and double-click a corner to remove it.
* **Side lengths:** each side shows its length just outside the field. Click a length to type it exactly; the next corner moves along the side, and the grid changes its scale if the field no longer fits.
* **Water source:** in this mode, click where the water is and drag the blue marker to move it.
* **Inlet:** in this mode, drag the yellow square along the edge of the field to where the pipe or the canal enters.
* **Grid square:** sets the scale, from 1 to 100 m per square.

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

Each design layer (surface, drip and sprinklers) ends with a film of the soil water: **Soil water in the days ahead (DSS)**. It plays the daily model day by day, from the working date to the next irrigation and a few days after it. Click it to pause or play.

* **Left: the profile of the day.** The water content of each layer of the real soil, 0 to 100 cm, with lines at the wilting point, the trigger and field capacity, the depth of the roots and the sensor.
* **Right: the days.** The share of the available water left in the root zone, and at the sensor, against the trigger; the band marks the day the sensor reaches the trigger. A dashed red line shows what would happen **without that irrigation**: the root zone dries on, day after day, with the weather of the record, until it reaches the wilting point.
* **Below: the day in words.** The date, the crop, the water left, the sensor against the trigger, the date and depth of the next irrigation of the design, and the date the wilting point would be reached without it.

The water left in the root zone on day $d$ is the mean over the layers within the roots, $\bar s(d)$, where $s=(\theta-\theta_{wp})/(\theta_{fc}-\theta_{wp})$. Without the irrigation the depletion follows the FAO-56 root-zone balance:

$$
D_r(d+1)=\mathrm{clip}\bigl(D_r(d)+ET(d)\,[0.35+0.65\,K_s]-0.8\,P(d);\ 0,\ \mathrm{TAW}\bigr),\qquad K_s=\min\Bigl(1,\frac{\mathrm{TAW}-D_r}{0.5\,\mathrm{TAW}}\Bigr),
\tag{18.4}
$$

*Provenance (Eq. 18.4):* **[Literature]** with **[Engineered]** constants: FAO-56 water stress coefficient with $p=0.5$. $\mathrm{TAW}=\mathrm{AWC}\,z_r$, and $ET$ and $P$ are the evapotranspiration and rain of the daily model. The wilting point is reached when $D_r\ge 0.97\,\mathrm{TAW}$.

The schedule under the film takes its dates from the daily model and its depths and times from the design.

## Comparing the three systems

*Tools ▸ Compare the irrigation systems on this field* computes the surface, drip and sprinkler designs with the inputs they have now, on the same soil, crop and trigger, and lists their application efficiency, root zone filled, deep percolation, runoff or evaporation and the time per irrigation side by side.

![The comparison of the three systems.](images/atlas11/ui_u13_compare.jpg){width=100%}
