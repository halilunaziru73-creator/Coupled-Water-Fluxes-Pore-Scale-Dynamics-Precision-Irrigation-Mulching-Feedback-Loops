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
* **Hand, zoom in and out, Fit:** the hand button moves the drawing; the right or middle mouse button, or Shift and drag, also move it in any mode. **+** and **−**, or the mouse wheel over the grid, zoom in and out around the cursor (10 % to 1200 %). **Fit** shows the whole field. The scale bar and the north arrow stay on the screen and follow the zoom.
* **Locate on the map:** opens the field on the satellite map (Section 18.6), to find the farm, demarcate it on the image and compute its vegetation and water indices.

![The sketch zoomed in, with the hand, zoom and map buttons.](images/ui/sketch_zoom.jpg){width=100%}

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

## The field on the map: satellite, vegetation and water indices, report

*Tools ▸ Field on the map…*, or **Locate on the map** in the field sketch, opens the field on a satellite image.

![The field on the map: an irregular field demarcated with six corners, its NDVI cut exactly to the outline, the legend on the map (index, date, colour scale and spread of the field), the irrigation layout, and the value under the cursor. The screenshot was taken without internet; with internet the satellite image fills the background.](images/ui/fieldmap_indices.jpg){width=100%}

**1. Find the farm.** Type a village, town or district and press *Find* (place search of Open-Meteo, the same as for the online weather), or type the latitude and longitude and press *Go*. If the online weather of a place is in use, the map opens there. The background is the satellite image (Esri World Imagery, with place names), the satellite image with roads and names, or the map (OpenStreetMap); it needs the internet. **Open in Google Earth** opens Google Earth on the centre of the field, to look at it in 3D.

**2. Demarcate the field.** In *Demarcate* mode, click the corners of the field on the image. Drag a corner to move it; right-click a corner to remove it; *Undo point* and *Clear* work as in the sketch. The *Hand* moves the map; **+** and **−** or the mouse wheel zoom; *Fit the field* shows the whole field. *Place my sketch here* puts the field of the sketch, at its true size, on the centre of the map. The panel gives the area, the perimeter and the centre, in decimal degrees and in degrees, minutes and seconds (WGS 84). On the sphere of radius $R = 6\,378\,137$ m,

$$
A=\frac{R^2}{2}\Bigl|\sum_i(\lambda_{i+1}-\lambda_i)\bigl(2+\sin\varphi_i+\sin\varphi_{i+1}\bigr)\Bigr|,\qquad
P=\sum_i 2R\arcsin\sqrt{\sin^2\tfrac{\Delta\varphi}{2}+\cos\varphi_i\cos\varphi_{i+1}\sin^2\tfrac{\Delta\lambda}{2}},
\tag{18.4}
$$

*Provenance (Eq. 18.4):* **[Literature]**: spherical polygon area (Chamberlain and Duquette, 2007) and the haversine distance; $\varphi$ latitude, $\lambda$ longitude in radians.

The bar of steps above the map shows what is done (with a tick) and what comes next: the field demarcated, the index on the map, the irrigation layout on the map, the report.

**3. Compute the indices of the field.** The indices are computed only for the demarcated field, on cells of 10 m (Sentinel-2) or down to 2 m (simulated), and only after the field has at least three corners. Two sources:

* **Sentinel-2 L2A satellite** (open data, Copernicus, through the Element 84 Earth Search catalogue): the least cloudy scene over the field in the last *Look back* days with less than *Clouds below* % cloud. The bands B02 (blue), B04 (red), B05 (red edge), B08 (NIR) and B11 (SWIR) are read only over the field; cloud, cloud shadow, snow and no-data cells are removed with the scene classification (SCL). This needs the internet; without it the program says so and uses the simulated indices.
* **Simulated by SWAFL**, on the working date or at the peak of the crop: each cell mixes the reflectance of the crop and of the soil by the crop cover $c$ of the daily model, $\rho=c\,\rho_{\mathrm{veg}}+(1-c)\,\rho_{\mathrm{soil}}$. The soil is darker when its top layer is wet; the canopy reflects less NIR and more SWIR when the crop is stressed (sensor depletion beyond the trigger) and less red edge when nitrogen is short; the water of each cell varies across the field with the uniformity of the design (CU, $E_u$).

$$
\begin{aligned}
\mathrm{NDVI}&=\frac{\rho_N-\rho_R}{\rho_N+\rho_R}, &
\mathrm{EVI}&=2.5\,\frac{\rho_N-\rho_R}{\rho_N+6\rho_R-7.5\rho_B+1}, &
\mathrm{SAVI}&=\frac{(1+L)(\rho_N-\rho_R)}{\rho_N+\rho_R+L},\ L=0.5,\\
\mathrm{NDRE}&=\frac{\rho_N-\rho_{RE}}{\rho_N+\rho_{RE}}, &
\mathrm{NDWI}&=\frac{\rho_N-\rho_{SW}}{\rho_N+\rho_{SW}}.
\end{aligned}
\tag{18.5}
$$

*Provenance (Eq. 18.5):* **[Literature]**: Rouse et al. (1974), Huete et al. (2002), Huete (1988), Barnes et al. (2000), Gao (1996). The simulated reflectances are **[Engineered]**.

| Index | Bands | What it follows |
|:--|:--|:--|
| NDVI | Red, NIR | Drought tracking, baseline crop health |
| EVI | Blue, Red, NIR | Resists saturation in thick canopies (dense crops) |
| SAVI | Red, NIR, soil factor $L$ | Removes the soil background (dry land, early crop) |
| NDRE | Red edge, NIR | Deep canopy; nitrogen management, precision farming |
| NDWI | NIR, SWIR | Water inside the canopy; crop water stress, fire risk |

The table gives, for each index, the mean, the 10 and 90 % values, the minimum and maximum over the field, and what the mean means. Click a row to show that index on the map.

**The index follows your outline.** The colours are cut exactly to the demarcated outline and laid over the real map. When you add, drag or remove a corner, the simulated indices are computed again at once for the new outline; the pattern of the field stays where it is on the ground, so the new outline only takes in or leaves out part of it. Satellite indices are read again when you press *Compute*. In the simulated field, the crop vigour and the soil water vary in patches of some 25 to 40 m tied to the ground, and the wetting of the design falls from the inlet end (the end nearest the water source of the sketch) to the tail.

**What the map shows.**

* *Continuous colours* or *Management zones (5 classes)*: the zones split the values of the field by natural breaks (Jenks), drawn from the field smoothed over about 9 m so that each zone is a patch you can manage. The table under the indices gives, for each zone, its range, mean, area (ha) and share of the field.
* *Smooth* (interpolated between cells) or *Pixels* (each cell as measured, 10 m for Sentinel-2).
* *Compare with*: a second index side by side; the two maps move and zoom together.
* The legend in the lower left corner of the map gives the index, the date and the source, the colour scale (or the zones with their area), the spread of the field as a histogram and the mean. Click its dark title to fold it.
* Move the mouse over the field: the line under the map gives the coordinates and the value of the index at that point, its reading and its zone (and the value of the second index when two are shown).
* *Irrigation layout* draws the system of the field sketch on the map: the furrows, borders, basins, drip laterals or sprinklers (light lines; one in every few when they are very close), the submain or head ditch along the edge that holds the inlet (thick blue), the mainline from the water source **W** to the inlet (dashed), and the inlet (yellow square). It appears after *Use this field in the sketch and the designs* (or *Place my sketch here*), and it follows the outline when you move a corner. Choose the system, the spacing and the source in the sketch.

![Management zones of NDVI cut to the field, with the zones, their areas and the irrigation layout in the legend (without internet: no satellite image behind).](images/ui/fieldmap_zones.jpg){width=78%}

![Two indices side by side, NDVI and NDRE, the maps moving together.](images/ui/fieldmap_compare.jpg){width=78%}

**4. Use and export.** *Use this field in the sketch and the designs* makes the demarcated field the sketch (true lengths, centre coordinates kept); *Back to the field sketch* continues the design. *Online weather of this field* downloads the daily weather of the centre of the field and runs the program on it. The report has a **title, an author and an organisation**, a **resolution of 96, 150, 300 or 600 dpi** and a format:

* **PDF (A4)**, two pages: page 1 with the map of the chosen index (continuous or zones) on the satellite image, cut to the field, with the irrigation layout, a grid of latitude and longitude in degrees, minutes and seconds, the edges of the map in degrees, the north arrow and scale bar, the area, the perimeter, the centre, the coordinates of every corner, the table of the indices and the management zones of the chosen index with their areas; page 2 with the five indices side by side, the spread of each over the field and what the five say together (water stress, nitrogen, evenness). The title, author, coordinates and keywords are also written in the properties of the PDF.
* **PNG (A4)**, one image per page, with the resolution written in the file so that it prints at the chosen dpi.
* **GeoJSON** (the field polygon in WGS 84 with the area, the author and the means of the indices) and **CSV** (the corners and every statistic), for a GIS or a spreadsheet.

Every page carries the sources: imagery © Esri, Maxar, Earthstar Geographics; map © OpenStreetMap contributors; contains modified Copernicus Sentinel data.

![The field report, page 1.](images/ui/fieldmap_report_p1.jpg){width=82%}

![The field report, page 2: the five indices.](images/ui/fieldmap_report_p2.jpg){width=82%}

## The soil water in the days ahead

Each design layer (surface, drip and sprinklers) ends with a film of the soil water: **Soil water in the days ahead (DSS)**. It covers every day from the working date through the next irrigation and the rest of that season, at least 120 days. It plays day by day; click it to pause or play.

* **Left: the profile of the day.** The water content of each layer of the real soil, 0 to 100 cm, with lines at the wilting point, the trigger and field capacity, the depth of the roots and the sensor. The frame and the label below take the colour of the phase of the day.
* **Right: the days, coloured by phase.** The band at the top colours every day: irrigation day (blue), rain over 5 mm (light blue), comfortable (green), nearing the trigger (yellow), beyond the trigger, i.e. stress (orange, also shaded across the chart), near the wilting point (red), and no crop (grey). The chart also shows:
  * the share of the available water left in the root zone and at the sensor, against the trigger;
  * rain as ticks at the top and drainage as ticks at the bottom;
  * a dashed red line for what would happen **without the next irrigation**: the root zone dries on with the weather of the record until it reaches the wilting point.
* **Below: the analysis.**
  * The day in words: the date, the crop, the phase, the water left, and the sensor against the trigger.
  * The next irrigation, with the depth of this design, and the date the wilting point would be reached without it.
  * For the whole span: the number of irrigations, the rain, the evapotranspiration, the drainage, and the share of days in each phase.

Every part of the film is labelled.

* **The profile** has its depth axis (cm) and its water-content axis (% by volume, with the values at the wilting point and at field capacity). Labels mark the wilting point (WP), the trigger and field capacity (FC).
* **The chart** has its axis of the water left in the root zone (%) and its axis of days, and the phase band is named. Arrows and lines mark each irrigation, and the first is labelled *irrigation starts* with its date. The trigger line is labelled with the water left at it, the point where it is reached is marked *trigger reached*, and the wilting point without irrigation is marked with a cross and its date.
* **The colours** are distinct: irrigation dark blue, rain light blue, comfortable green, nearing the trigger yellow, stress orange, near wilting red, no crop grey. The root zone line is dark blue, the sensor purple, the trigger black dashed, the dry-down without irrigation red dotted, the rain ticks blue and the drainage ticks teal.

Everything follows the settings. Change the trigger, the sensor depth, the soil, the crop, the mulch, the rain or the weather and the film is computed again.

The phase of a day is set in this order: an irrigation day; a day with no crop; near wilting when the root zone has lost 85 % of its available water; beyond the trigger when the depletion at the sensor reaches the trigger $f_T$; a rain day (over 5 mm); nearing the trigger when the depletion at the sensor reaches $0.8\,f_T$; otherwise comfortable.

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
