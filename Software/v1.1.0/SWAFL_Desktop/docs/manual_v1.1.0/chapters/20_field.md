# The real field: satellite indices, image analysis, water sources and the irrigation system

*Tools ▸ Field on the map…*, or **Locate on the map** in the field sketch, opens the field on the real map. There you find the farm, demarcate the field, and the program reads the real field from open data:

* the **vegetation and water indices** NDVI, EVI, SAVI, NDRE and NDWI from the **Sentinel-2** satellite (Copernicus);
* an **image analysis (computer vision) of the satellite photo** of the field: its land cover (dense and sparse vegetation, bare soil, water, buildings and roads, shadow) and the visible-band indices VARI, GLI, ExG and NGRDI;
* **the site**: the water features around the field (OpenStreetMap), water seen in the photo, the ground elevation and slope (Copernicus DEM), and the soil texture (SoilGrids);
* **suggestions**: where to take the water from, and which irrigation system suits the field, with the reasons.

Everything is computed for the demarcated outline only, after it is drawn, and follows the outline when you change it. All of it needs the internet; without it the program says what it could not reach and uses the simulated indices of SWAFL.

> The pictures of this chapter were made without internet, on a generated test image and test answers of the open-data services, so that every path of the program could be shown. On your computer the real satellite photo and the real data of your field appear in the same places.

![The field on the map with its real Sentinel-2 NDVI cut to the outline, the legend on the map (index, date, scale, spread of the field), the irrigation layout and the value under the cursor (test image).](images/ui/real_s2_ndvi.jpg){width=100%}

## Finding and demarcating the field

**Find the farm.** Type a village, town or district and press *Find* (place search of Open-Meteo, the same as for the online weather), or type the latitude and longitude and press *Go*. If the online weather of a place is in use, the map opens there. The background is the satellite image (Esri World Imagery, with place names), the satellite image with roads and names, or the map (OpenStreetMap). **Open in Google Earth** opens Google Earth on the centre of the field, to look at it in 3D.

**2. Demarcate the field.** In *Demarcate* mode, click the corners of the field on the image. Drag a corner to move it; right-click a corner to remove it; *Undo point* and *Clear* work as in the sketch. The *Hand* moves the map; **+** and **−** or the mouse wheel zoom; *Fit the field* shows the whole field. *Place my sketch here* puts the field of the sketch, at its true size, on the centre of the map. The panel gives the area, the perimeter and the centre, in decimal degrees and in degrees, minutes and seconds (WGS 84). On the sphere of radius $R = 6\,378\,137$ m,

$$
A=\frac{R^2}{2}\Bigl|\sum_i(\lambda_{i+1}-\lambda_i)\bigl(2+\sin\varphi_i+\sin\varphi_{i+1}\bigr)\Bigr|,\qquad
P=\sum_i 2R\arcsin\sqrt{\sin^2\tfrac{\Delta\varphi}{2}+\cos\varphi_i\cos\varphi_{i+1}\sin^2\tfrac{\Delta\lambda}{2}},
\tag{20.1}
$$

*Provenance (Eq. 20.1):* **[Literature]**: spherical polygon area (Chamberlain and Duquette, 2007) and the haversine distance; $\varphi$ latitude, $\lambda$ longitude in radians.

The bar of steps above the map shows what is done (with a tick) and what comes next: the field demarcated, the index on the map, the irrigation layout on the map, the report.

## The indices of the field

Choose the data and press **Compute the indices of the field**:

| Data | What it gives |
|:--|:--|
| **Real data, automatic** (the default) | The Sentinel-2 indices of the most recent clear scene, and the image analysis of the satellite photo (land cover). If Sentinel-2 cannot be read, the indices of the photo; if neither, the simulated indices. The message under the button says what was used and what could not be reached. |
| Sentinel-2 only | NDVI, EVI, SAVI, NDRE and NDWI. |
| Satellite photo only | The land cover and VARI, GLI, ExG and NGRDI. |
| Simulated by SWAFL | No internet needed (below). |

**Sentinel-2 L2A** (Copernicus open data). The catalogue of Element 84 Earth Search is searched for the scenes over the field of the last *Look back* days with less than *Clouds below* % cloud over the tile; if it cannot be reached, the catalogue of Microsoft Planetary Computer is used. The most recent scenes are tried in turn until one is clear over the field. The bands B02 (blue), B04 (red), B05 (red edge), B08 (NIR) and B11 (SWIR) are read for the field only (cloud-optimised GeoTIFF, in the UTM zone of the scene), the offset of processing baseline 4 is removed, and cloud, cloud shadow, snow and no-data pixels are left out with the scene classification (SCL). Each cell of 10 m inside the outline gets

$$
\begin{aligned}
\mathrm{NDVI}&=\frac{\rho_N-\rho_R}{\rho_N+\rho_R}, &
\mathrm{EVI}&=2.5\,\frac{\rho_N-\rho_R}{\rho_N+6\rho_R-7.5\rho_B+1}, &
\mathrm{SAVI}&=\frac{(1+L)(\rho_N-\rho_R)}{\rho_N+\rho_R+L},\ L=0.5,\\
\mathrm{NDRE}&=\frac{\rho_N-\rho_{RE}}{\rho_N+\rho_{RE}}, &
\mathrm{NDWI}&=\frac{\rho_N-\rho_{SW}}{\rho_N+\rho_{SW}}.
\end{aligned}
\tag{20.2}
$$

*Provenance (Eq. 20.2):* **[Literature]**: Rouse et al. (1974), Huete et al. (2002), Huete (1988), Barnes et al. (2000), Gao (1996). NDWI after Gao is also called NDMI.

| Index | Bands | What it follows |
|:--|:--|:--|
| NDVI | Red, NIR | Drought tracking, baseline crop health |
| EVI | Blue, Red, NIR | Resists saturation in thick canopies (dense crops) |
| SAVI | Red, NIR, soil factor $L$ | Removes the soil background (dry land, early crop) |
| NDRE | Red edge, NIR | Deep canopy; nitrogen management, precision farming |
| NDWI (NDMI) | NIR, SWIR | Water inside the canopy; crop water stress, fire risk |

**The satellite photo** (Esri World Imagery, about 0.3 to 1 m per pixel; the capture date varies by place). The photo of the field is put together from its tiles at the finest zoom that fits about 1700 pixels across; tiles without imagery are left out. Its pixels have only red, green and blue, so it gives the visible-band indices (shadows left out), averaged over the cells of the field:

$$
\mathrm{VARI}=\frac{G-R}{G+R-B},\qquad
\mathrm{GLI}=\frac{2G-R-B}{2G+R+B},\qquad
\mathrm{ExG}=2g-r-b\ \ \Bigl(r=\tfrac{R}{R+G+B},\dots\Bigr),\qquad
\mathrm{NGRDI}=\frac{G-R}{G+R}.
\tag{20.3}
$$

*Provenance (Eq. 20.3):* **[Literature]**: Gitelson et al. (2002), Louhaichi et al. (2001), Woebbecke et al. (1995), Tucker (1979).

![The indices read from the real satellite photo: VARI cut to the field, with the table of VARI, GLI, ExG and NGRDI (test image).](images/ui/real_photo_vari.jpg){width=100%}

**The land cover: image analysis of the photo.** Every pixel of the photo is described by six features: its brightness $L$, saturation $S$, excess green $\mathrm{ExG}$, $\mathrm{VARI}$, blueness $b-(r+g)/2$ and texture (the standard deviation of the brightness over a $5\times5$ window). The pixels are grouped into seven groups by *k*-means clustering of the standardised features (k-means++ start, 14 iterations), and each group is named from its mean features:

$$
\text{class}=\begin{cases}
\text{shadow} & L<0.10\\
\text{water} & (b-\tfrac{r+g}{2}>0.025,\ \mathrm{ExG}<0.03,\ L<0.55)\ \text{or}\ (L<0.2,\ \text{smooth},\ \mathrm{ExG}<0.02)\\
\text{dense vegetation} & \mathrm{ExG}>0.085\ \text{or}\ \mathrm{VARI}>0.16\\
\text{sparse vegetation} & \mathrm{ExG}>0.035\ \text{or}\ \mathrm{VARI}>0.05\\
\text{buildings, roads} & (S<0.13,\ L>0.45)\ \text{or}\ (\text{rough},\ S<0.2)\\
\text{bare soil} & \text{otherwise}
\end{cases}
\tag{20.4}
$$

*Provenance (Eq. 20.4):* **[Engineered]**: classical computer vision (colour indices, texture, *k*-means, rules) and a $3\times3$ majority filter; not a trained neural network. The shares and areas are those of the pixels inside the outline.

Choose *Land cover read from the photo* under *Show on the map* to see it; the table gives the area and share of each cover. Buildings, roads and water inside the outline are worth leaving out of the irrigated area.

![The land cover read from the photo, cut to the field, with the area of each cover in the legend (test image).](images/ui/real_cover.jpg){width=78%}

**Simulated by SWAFL** (no internet), on the working date or at the peak of the crop: each cell mixes the reflectance of the crop and of the soil by the crop cover $c$ of the daily model, $\rho=c\,\rho_{\mathrm{veg}}+(1-c)\,\rho_{\mathrm{soil}}$; the soil is darker when wet, the canopy reflects less NIR and more SWIR under stress and less red edge when nitrogen is short; vigour and soil water vary in patches of 25 to 40 m tied to the ground, and the wetting falls from the inlet end to the tail with the uniformity of the design. **[Engineered]**.

The table gives, for each index, the mean, the 10 and 90 % values, the minimum and maximum over the field, and what the mean means. Click a row to show that index on the map.

**The index follows your outline.** The colours are cut exactly to the outline and laid over the real map. When you add, drag or remove a corner, the simulated indices are computed again at once; satellite and photo data are read again when you press *Compute*.

**What the map shows.**

* *Continuous colours* or *Management zones (5 classes)*: the zones split the values of the field by natural breaks (Jenks), drawn from the field smoothed over about 9 m so that each zone is a patch you can manage. The table under the indices gives, for each zone, its range, mean, area (ha) and share of the field.
* *Smooth* (interpolated between cells) or *Pixels* (each cell as measured, 10 m for Sentinel-2).
* *Compare with*: a second index side by side; the two maps move and zoom together.
* The legend in the lower left corner of the map gives the index, the date and the source, the colour scale (or the zones with their area), the spread of the field as a histogram and the mean. Click its dark title to fold it.
* Move the mouse over the field: the line under the map gives the coordinates and the value of the index at that point, its reading and its zone (and the value of the second index when two are shown).
* *Irrigation layout* draws the system of the field sketch on the map: the furrows, borders, basins, drip laterals or sprinklers (light lines; one in every few when they are very close), the submain or head ditch along the edge that holds the inlet (thick blue), the mainline from the water source **W** to the inlet (dashed), and the inlet (yellow square). It appears after *Use this field in the sketch and the designs* (or *Place my sketch here*), and it follows the outline when you move a corner. Choose the system, the spacing and the source in the sketch.


![Management zones of NDVI (simulated, without internet).](images/ui/fieldmap_zones.jpg){width=78%}

![Two indices side by side (simulated, without internet).](images/ui/fieldmap_compare.jpg){width=78%}

## The site: water sources and the irrigation system

**Analyse the site (real open data)** reads, around the demarcated field:

* the **water features** within 3 km from OpenStreetMap (Overpass API): rivers, streams, canals, ditches and drains, lakes, ponds and reservoirs, wells, boreholes, springs and water points;
* **water seen in the photo** within 1.5 km: groups of water pixels of the image analysis (Eq. 20.4) larger than about 600 m², not already mapped;
* the **ground elevation** (Copernicus DEM GLO-90, through Open-Meteo) on a grid over the field, at its corners and at the nearest point of each source;
* the **soil** at the centre of the field from ISRIC SoilGrids (sand, silt, clay and organic carbon, 0 to 60 cm), with its USDA texture class. **Use the nearest SWAFL soil** sets the soil of the project to the soil of the program closest in sand and clay.

The slope of the field is that of the plane fitted to the elevations by least squares,

$$
z=a+b\,x+c\,y,\qquad s=100\sqrt{b^2+c^2}\ \ [\%],
\tag{20.5}
$$

*Provenance (Eq. 20.5):* **[Literature]**: least-squares plane; $x$, $y$ in metres east and north of the centre. The direction the ground falls to is that of $-(b,c)$.

![The site analysed: the water sources on the map (the best one joined to the field), the soil, the slope, the advice on the water and the ranking of the systems (test data).](images/ui/real_site.jpg){width=100%}

**Where to take the water from.** Each source gets a score

$$
\mathrm{score}=B_{\mathrm{type}}-30\,[\text{seasonal}]-\min\!\bigl(45,\ d/60\bigr)-\min\!\bigl(20,\ 0.8\,\Delta z\bigr),
\tag{20.6}
$$

*Provenance (Eq. 20.6):* **[Engineered]**: $B$ = 92 river, 90 canal, 86 reservoir, 82 lake, 74 borehole, 70 well, 62 pond, 60 spring, 58 stream, 50 water seen in the photo, 42 ditch, 30 drain; $d$ the distance from the field edge (m); $\Delta z$ the lift from the source to the highest point of the field (m), not counted for wells, whose water table depth is not mapped.

The advice names the best surface source within 1.5 km (with its distance, direction and lift, or *by gravity*); without one, a borehole at the edge of the field when wells are mapped nearby, or a hydrogeological survey first. **Use** puts the source into the field sketch, at its place, with its kind and lift, so the mainline length and the pump head go into the designs.

**Which irrigation system suits this field.** Each system starts from a base score and gains or loses points for the conditions of the field, after the FAO and USDA guidance for choosing an irrigation system:

| System | Gains | Loses |
|:--|:--|:--|
| Basins | level ground ($s\le0.3$ %), clay, large surface supply, rice, orchards | slope over 1 %, sand over 65 %, groundwater only, irregular shape |
| Border strips | slope 0.1 to 2 %, loam to clay loam, close-growing crops, surface supply | slope over 2 %, sand, groundwater only, irregular shape, relief to level |
| Furrows | slope 0.2 to 3 %, row crops, surface supply | slope over 3 %, sand, close-growing crops, irregular shape |
| Sprinklers | rolling ground (2 to 15 %), light soil, close-growing crops, irregular shape, borehole supply | slope over 20 %, heavy clay, tall trees, level fields with plenty of surface water |
| Drip | sandy soil, scarce or pumped water, slopes, row crops and orchards | close-growing crops, very large fields, hard surfaces in the outline |

The table lists each system with its score, the reasons, and the application efficiency of the SWAFL design of that system as it stands. **Use** sets the system (and the slope of the site) in the field sketch; then *Turn the sketch into the design* and run it.

## The maps of this field, as layers

Every map computed for the demarcated field is kept as a layer in the panel **Maps of this field** at the top right of the map: the five indices and the management zones of the index shown, the land cover read from the photo, the four maps of the season (monitoring zones, change, trend, stability), the irrigation depth and date of each zone, the ephemeral gullies and the soil loss, and, on top, the water sources and the irrigation layout. Click a layer to show it again: nothing is computed again. The layers stay when the window is closed and opened again (with the results of the site), and go only when the outline of the field changes. Click the dark title to fold the panel.

In the list of water sources of the site, the map moves to a source only when its **Show** button is pressed (the mouse passing over the list leaves the map where it is); **Use** sets the source in the sketch and the design.

![The maps of this field as layers, after the indices, the site, the season, the zone-by-zone irrigation and the erosion were computed (test data).](images/ui/fm_layers.jpg){width=88%}

## The season of the field, and the precision maps

Section 4 of the panel reads the season of the real field and makes the precision maps from it and from the SWAFL simulation of the farm. Every map is a choice of *Show on the map* and a layer of *Maps of this field*, has its legend on the map, gives its values under the cursor, and goes into the report (a page for the season and the irrigation, a page for the erosion).

### The season seen by Sentinel-2

**Read the season (Sentinel-2, 12 months)** searches the Sentinel-2 L2A scenes of the last twelve months over the field (clouds below 60 % over the tile), keeps the least cloudy scene of each month, and reads its red, NIR and SWIR bands and its scene classification cell by cell (10 m), leaving out cloud, shadow and no-data cells. A scene with less than 30 % of the field clear is dropped. For every date the panel gives the share of the field that is clear, the NDVI and NDMI of the field and the NDVI of each monitoring zone, and a chart shows the curves.

From the series every cell gets:

$$
z_{i,t}=\frac{\mathrm{NDVI}_{i,t}-\overline{\mathrm{NDVI}}_t}{\sigma_t},\qquad \text{stability}_i=\frac1{n_i}\sum_t z_{i,t},\qquad \Delta_i=\mathrm{NDVI}_{i,t_n}-\mathrm{NDVI}_{i,t_{n-1}},
\tag{20.7}
$$

*Provenance (Eq. 20.7):* **[Literature]**: the standardised index of each date against the field, as in yield-stability and management-zone delineation from image series.

and the trend of the last three scenes (least squares, per 30 days). The **monitoring zones** (3 to 6) group the cells whose standardised series behaved alike over the season (*k*-means on the series, ordered from the weakest to the strongest), so a zone is a part of the field that was weaker or stronger on every date, not on one. The maps: *monitoring zones*, *change since the previous scene*, *trend of the last scenes* and *stability over the season*. The text says by how much the field changed since the previous scene, the share of the field that declined, and how far the weakest and strongest zones stood from the field over the season.

![The season read from Sentinel-2: the monitoring zones on the map, the curves of the field and of each zone, the table of the dates (test data).](images/ui/mon_zones.jpg){width=100%}

### Variable-rate irrigation, simulated zone by zone

**Variable-rate irrigation, zone by zone** runs each zone through the FAO-56 daily root-zone balance with:

* **its soil**: SoilGrids at the centre of the zone (sand and clay), the nearest soil of SWAFL and its available water $\mathrm{AWC}_z$;
* **its observed cover**: the crop development of the SWAFL daily model, scaled by the zone's cover from its last NDVI against the field, $f_{c,z}(t)=\min\bigl(1,\ c(t)\,f_{c}(\mathrm{NDVI}_z)/\overline{f_c}\bigr)$ with $f_c=(\mathrm{NDVI}-0.15)/0.7$, and the crop coefficient $K_c=K_{c,ini}+(K_{c,mid}-K_{c,ini})\,K_d$, $K_d=\min(1,\,1.5f_c,\,f_c^{0.5})$ (Allen and Pereira, 2009), with the coefficients of the crop in Properties;
* **the farm of the simulation**: the roots of every day, the trigger, the depletion fraction and the past irrigations of the irrigation plan of Chapter 18 (Eq. 18.4), the season of the decision of Chapter 18, and the application efficiency of the design in use;
* **the weather in use**: the daily reference ET and rain (the online weather of the farm with its forecast, a weather file, or the recorded weather).

The balance starts 45 days before the decision with the water of the SWAFL model on that day:

$$
D_{r,z}(t+1)=D_{r,z}(t)+K_{c,z}(t)\,K_{s}\,ET_0(t)-\bigl(P(t)-RO(t)\bigr)-I(t),\qquad I_z(t)=D_{r,z}(t)\ \text{when}\ f_{c,z}>0.2\ \text{and}\ D_{r,z}\ge f_T\,\mathrm{AWC}_z\,z_r(t),
\tag{20.8}
$$

*Provenance (Eq. 20.8):* **[Literature]** FAO-56 root-zone balance (Allen et al., 1998) with the trigger and irrigation rule of the SWAFL daily model; $RO=0.3(P-35)$ above 35 mm as in the crop balance of Chapter 21.

So every zone gets its own **dates and depths**: the table gives its soil and AWC, its cover now (NDVI, NDMI, $K_c$), the water left in its root zone, its next irrigation (date, net and gross mm) and the irrigations of the next 60 days. The maps show the depth of the next irrigation of each zone or its date. The text names the zone that needs water first and the one that needs it last, and compares the volume with the single depth of the SWAFL model of the whole field. The depths can be changed with **−** and **+**; **Prescription GeoJSON** (every cell with its zone, date, net and gross rate, AWC and NDVI) and **Zones and dates CSV** (the zones and every irrigation date of each zone) go to the controller or a GIS. Without the season, the zones are classes of the index of one date.

![Variable-rate irrigation simulated zone by zone: the depth of the next irrigation, and the table of soils, cover, water and dates (test data).](images/ui/prec_vri.jpg){width=100%}

### Ephemeral gullies and soil loss

**Ephemeral gullies and soil loss** reads the terrain of the field and 250 m around it from open elevation tiles (AWS Terrain Tiles; about 5 m cells at the equator, from SRTM, Copernicus and national lidar where available), smooths it, fills its sinks (priority flood, Barnes et al., 2014) and gives every cell its D8 flow direction, upslope area $A$ and slope $S$. An ephemeral gully is likely where

$$
G=\frac{S\,A^{0.4}}{0.025}\ \ge 1\qquad (A\ \text{in ha},\ S\ \text{in m/m}),
\tag{20.9}
$$

*Provenance (Eq. 20.9):* **[Literature]**: the topographic threshold of ephemeral gullies in cultivated fields (Vandaele et al., 1996).

From every cell above the threshold with 0.1 ha or more upslope the gully follows the flow lines down the field. Each predicted gully is checked in two ways:

* **in the photo**: a Hessian ridge and valley filter at two scales (Frangi et al., 1998); a gully with a linear feature on 40 % of its cells is *seen in the photo*;
* **in the crop**: the Sentinel-2 season; a gully along which the crop stood more than half a standard deviation below the field over the season (Eq. 20.7) is *seen in the crop*.

Both are drawn in purple. **The rain and the runoff** come from the daily rain of the weather in use (twenty years): the runoff of every day on this soil and this cover by the SCS curve number (TR-55: soil group from the SoilGrids texture, row crop in good condition, bare soil when the NDVI of the month is below 0.3), the runoff a year, the number of runoff events of 10 mm or more a year, and the largest rain of the record with its runoff and the volume it sends down each gully.

**Soil loss (RUSLE)**, $A_s=R\,K\,LS\,C\,P$, with every factor from the farm:

$$
R=0.0483\,P_a^{1.61},\qquad R_m=R\,\frac{\sum_{d\in m,\ P_d\ge12.7}P_d^{1.81}}{\sum_{d,\ P_d\ge12.7}P_d^{1.81}},\qquad C_i=\sum_m\frac{R_m}{R}\,e^{-2\,\mathrm{NDVI}_{i,m}/(1-\mathrm{NDVI}_{i,m})},\qquad LS=\Bigl(\frac{A/w}{22.13}\Bigr)^{0.4}\Bigl(\frac{\sin\beta}{0.0896}\Bigr)^{1.3},
\tag{20.10}
$$

*Provenance (Eq. 20.10):* **[Literature]**: $R$ from the mean annual rain of the series (Renard and Freimund, 1994; $587.8-1.219P_a+0.004105P_a^2$ above 850 mm), shared over the months by the erosive daily rains (exponent of Richardson et al., 1983); $C$ of every cell in every month from the NDVI of the Sentinel-2 scene of that month (van der Knijff et al., 1999), the crop cover of the SWAFL model where a month has no scene; $K$ from the SoilGrids sand, silt, clay and organic carbon of the field (EPIC, Sharpley and Williams, 1990); $LS$ after Moore and Wilson (1992); $P$ chosen in the panel.

A month table gives the share of the erosive rain, the NDVI and the runoff of each month. The advice names the **risk window** (the months when bare soil, NDVI below 0.35, meets a large share of the erosive rain), the gullies and the runoff they carry, the soil loss against the tolerable 2 t/ha/yr, and what to do.

![Ephemeral gully risk with the predicted gullies, the runoff of the rain and the month table (test data).](images/ui/prec_gully.jpg){width=100%}

![Soil loss (RUSLE) with the cover of every month (test data).](images/ui/prec_rusle.jpg){width=78%}

![The report: the season and the variable-rate irrigation (test data).](images/ui/prec_report.jpg){width=82%}

![The report: the erosion (test data).](images/ui/prec_report2.jpg){width=82%}

## Terrain, flow, watershed, soil retention and sensors (section 4b)

Section 4b of the panel reads the terrain of the demarcated field and builds four things from it: the contours and flow lines, the watershed, the maps of the soil retention curves, and the soil water sensors. Everything is computed on the cells of the terrain inside the field, and every map is a layer of *Maps of this field* with its legend on the map.

![The panel of the real field: the indices, the site, the season, and section 4b with the terrain and the soil retention curves (the controls as they appear in the program).](images/ui/field_fg1.jpg){width=46%}

**Automatic.** When the box *Automatic* is ticked, the satellite indices, the terrain, the watershed, the retention maps and the sensor sites are all made once the field is drawn, one after the other, so that a field only has to be demarcated.

**Read the terrain (contours, flow, watershed).** The button reads the elevation of the field and of its surroundings from open elevation tiles; *around the field* (150, 250, 400, 700 or 1000 m) sets how much of the surroundings is read, and a larger window is needed when the catchment of the field reaches the edge. The terrain is smoothed, its sinks are filled by priority flood, and the flow directions and the upslope area are found by the D8 method, the same as in the erosion maps. The line under the button tells how many cells of what size were read and from which source. Then five buttons choose what the map shows:

* *Contours and flow*: contour lines, the direction in which the water moves (white arrows), the channels (blue) and a hillshade. The line *Terrain of the field* gives the lowest and the highest elevation of the window and the interval of the contours.
* *Wetness index*: the topographic wetness index, which is high where water gathers (hollows, the foot of slopes) and low on crests.
* *Watershed*: the catchment and its channel network.
* *3D view*: the terrain as a surface that turns with the mouse (drag to turn, wheel to zoom), coloured by elevation, flow accumulation, wetness index, available water, soil water now or matric potential now, with a slider for the vertical exaggeration (1 to 12), the water running down the flow lines, and the sensors. *Close the 3D view* returns to the map.
* *channels from* (0.05 to 2 ha): the smallest upslope area at which a cell is drawn as a channel.

**The watershed.** *Outlet* is the lowest outlet of the field, or a point that you click on the map (*Click the outlet*). *Delineate the watershed* then finds the catchment draining to it, as a terrain portal does from an elevation model. The table gives

* the area, with the area of the field and the part that drains onto it;
* the perimeter and the longest flow path;
* the relief and the mean slope;
* the length of the channels, the highest Strahler order and the drainage density, in km per km²;
* the time of concentration by the formula of Kirpich (1940).

When the catchment reaches the edge of the terrain that was read, a red note asks for a larger window in *around the field*.

**Soil retention curves, mapped (geostatistics).** The button *Map the retention curves* maps the sand and the clay of the field, and from them the water retention of every cell. The soil comes from SoilGrids; it is varied across the field with the wetness index of the terrain, and the satellite index is used as well when it has been computed. You may type your own soil samples in the box, one per line: latitude, longitude, sand per cent, clay per cent and, if known, organic matter per cent (for example *9.0831, 7.4012, 62, 18*).

* Without samples, the soil is varied with the wetness index as an indicative trend; the two numbers *clay* and *sand*, in points per standard deviation of the wetness index, set how strongly (the box *indicative terrain trend* switches it on or off).
* With samples, sand and clay are mapped by regression kriging: the trend on the wetness index and the satellite index is fitted to the samples when there are enough of them, and the residuals are kriged with a spherical variogram fitted to them.
* The retention curve of every cell follows from the equations of Saxton and Rawls (2006).

The list under the button records every step as it is read and mapped. When it is done, the table *Retention of the field* gives the mean, the 10 per cent and the 90 per cent values of the field capacity, the wilting point, the available water and the days to the trigger (with the depletion fraction, the root depth and the crop evapotranspiration used). A line says when the driest cells reach the trigger and compares it with the average cell and with the DSS, which uses one soil for the whole field. Six buttons put the maps on the field: *Field capacity*, *Wilting point*, *Available water*, *Trigger* (the water content at the critical depletion of the SWAFL decision), *Matric potential now* and *Days to the trigger*. Two charts follow: the retention curves of the cell at the 10 per cent (driest), the median and the 90 per cent (most retentive) of the available water, and of the first three sensors (water content against suction on a log scale, with the point of now marked), and the variogram of the residuals, with its nugget, sill and range, marked as fitted or, when there are too few points to fit, as default.

**Use this field in the DSS.** The button sets the soil of the program to the class whose sand and clay are closest to the field means, and the area of the program to the area of the field. Every irrigation design, the trigger and the schedule then follow this field.

![The rest of the panel: the sensors, the optimisation of their sites, and the export of the field report.](images/ui/field_fg2.jpg){width=46%}

**Sensors and the satellite.** Soil water sensors are installed with the mode *Sensors* of the bar above the map, or with the button *Install by clicking on the map*: click inside the field, at the depth chosen in *depth* (10, 20, 30, 45, 60 or 90 cm); click a sensor to remove it. *Undo* takes back the last one and *Remove all* clears them. The terrain must have been read first. The table lists each sensor with its position, depth and the reading in per cent by volume; leave the reading blank and the program models it from the SWAFL water balance (the water left in the root zone on the working date, shifted by the wetness index and by the satellite index of the cell), or type the real reading.

* *Fusion*: the sensors and the satellite are fused by regression kriging. The readings are regressed on the wetness index and the satellite index, the residuals are kriged, and the line under the title gives the regression (in per cent by volume per standard deviation), its R squared and the variogram. The buttons *Soil water map* and *Uncertainty map* show the map of the soil water and its kriging standard deviation.
* *Sensors to place* (2 to 20) and *spread* (0 puts the sensors by the characteristics of the cells, 1 spreads them evenly) set the number and the character of the proposed sites. *Optimise the sites* (after the retention curves have been mapped) groups the cells by k-means in the space of elevation, wetness index, available water, the satellite index and position, and proposes one site for each group, drawn as an orange ring. The table gives the share of the field that each site represents and why it was chosen, and compares the mean kriging deviation with these sites, with your sensors and with the same number placed at random. *Install these sensors* replaces the present ones by the proposed ones.
* *Which sensors can go?* ranks the sensors by the rise of the mean kriging deviation if each is removed, the least useful first, with a *Remove* button for each.
* *Sensors CSV* saves the sensors with their position, depth, reading and modelled value.

## Use and export

Section 5 of the panel is *Use and export*. *Use this field in the sketch and the designs* makes the demarcated field the sketch (true lengths, centre coordinates kept), and *Irrigation layout* draws its system on the map. *Online weather of this field* downloads the daily weather of the centre of the field and runs the program on it. The report has a **title, an author and an organisation**, a **resolution of 96, 150, 300 or 600 dpi** and a format:

* **PDF (A4)**: page 1, the map of the chosen index (continuous, zones or land cover) on the satellite photo, cut to the field, with the irrigation layout, a grid of latitude and longitude in degrees, minutes and seconds, north arrow and scale bar, the area, perimeter, centre and corner coordinates, the table of the indices and the zones; page 2, the indices side by side with their spread and what they say together; page 3 (after an image analysis or a site analysis), the land cover, the soil, the slope, the water sources on the map with the advice, and the ranking of the systems. The title, author, coordinates and keywords are also in the properties of the PDF.
* **PNG (A4)**, one image per page, with the resolution written in the file so that it prints at the chosen dpi.
* **GeoJSON** (the field polygon in WGS 84 with the area, the author and the means of the indices) and **CSV** (the corners and every statistic), for a GIS or a spreadsheet.

The report is made with the boxes *Title*, *Author* and *Organisation* (written on the pages), *Resolution* (the dpi of the pages) and *Format* (PDF A4 or PNG A4); **Export the report** writes it, **GeoJSON** and **CSV** write the field for a GIS or a spreadsheet. *Back to the field sketch* returns to the sketch with the field drawn, and *Close* closes the window.

Every page carries its sources: photo © Esri, Maxar, Earthstar Geographics; map and water features © OpenStreetMap contributors; contains modified Copernicus Sentinel data; Copernicus DEM; ISRIC SoilGrids.

![The field report, page 1: NDVI of Sentinel-2 on the photo, the coordinates, the indices and the zones (test data).](images/ui/real_report_p1.jpg){width=82%}

![The field report, page 2: the five indices.](images/ui/real_report_p2.jpg){width=82%}

![The field report, page 3: the land cover, the soil, the slope, the water sources and the systems (test data).](images/ui/real_report_p3.jpg){width=82%}
