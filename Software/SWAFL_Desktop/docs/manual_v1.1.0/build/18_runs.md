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

The value is kept exactly as typed (2.13 stays 2.13); it is not rounded to a step of the list, and the design runs on it. A value outside the allowed range is set to the nearest limit, and the window says so. The value is converted to the unit of the model, $x_{\mathrm{model}} = x_{\mathrm{typed}}\,c_u$, with $c_u$ the factor of the chosen unit (for example 1000 for km, 1/3.6 for m³/h to L/s, 9.80665 for m of water to kPa).

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

*View* or *Tools ▸ Field sketch to design…* opens a grid on which you click the corners of your field and the water source. The sketch gives

$$
A=\tfrac12\Bigl|\sum_i (x_i y_{i+1}-x_{i+1}y_i)\Bigr|,\qquad L_{\mathrm{run}} = \max_{\text{along the longest side}} - \min,\qquad W = \text{extent across it},
\tag{18.3}
$$

*Provenance (Eq. 18.3):* **[Literature]**: shoelace formula and projection on the direction of the longest side.

and the mainline length from the source to the nearest corner. **Turn the sketch into the design** fills the run length, width, area, lateral and mainline lengths and the slope of the chosen design (border strips, furrows, basins, drip or sprinklers), opens it and waits for the run.

![The field sketch.](images/atlas11/ui_u12_sketch.jpg){width=100%}

## Comparing the three systems

*Tools ▸ Compare the irrigation systems on this field* computes the surface, drip and sprinkler designs with the inputs they have now, on the same soil, crop and trigger, and lists their application efficiency, root zone filled, deep percolation, runoff or evaporation and the time per irrigation side by side.

![The comparison of the three systems.](images/atlas11/ui_u13_compare.jpg){width=100%}
