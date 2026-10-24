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

## Use and export

*Use this field in the sketch and the designs* makes the demarcated field the sketch (true lengths, centre coordinates kept), and *Irrigation layout* draws its system on the map. *Online weather of this field* downloads the daily weather of the centre of the field and runs the program on it. The report has a **title, an author and an organisation**, a **resolution of 96, 150, 300 or 600 dpi** and a format:

* **PDF (A4)**: page 1, the map of the chosen index (continuous, zones or land cover) on the satellite photo, cut to the field, with the irrigation layout, a grid of latitude and longitude in degrees, minutes and seconds, north arrow and scale bar, the area, perimeter, centre and corner coordinates, the table of the indices and the zones; page 2, the indices side by side with their spread and what they say together; page 3 (after an image analysis or a site analysis), the land cover, the soil, the slope, the water sources on the map with the advice, and the ranking of the systems. The title, author, coordinates and keywords are also in the properties of the PDF.
* **PNG (A4)**, one image per page, with the resolution written in the file so that it prints at the chosen dpi.
* **GeoJSON** (the field polygon in WGS 84 with the area, the author and the means of the indices) and **CSV** (the corners and every statistic), for a GIS or a spreadsheet.

Every page carries its sources: photo © Esri, Maxar, Earthstar Geographics; map and water features © OpenStreetMap contributors; contains modified Copernicus Sentinel data; Copernicus DEM; ISRIC SoilGrids.

![The field report, page 1: NDVI of Sentinel-2 on the photo, the coordinates, the indices and the zones (test data).](images/ui/real_report_p1.jpg){width=82%}

![The field report, page 2: the five indices.](images/ui/real_report_p2.jpg){width=82%}

![The field report, page 3: the land cover, the soil, the slope, the water sources and the systems (test data).](images/ui/real_report_p3.jpg){width=82%}
