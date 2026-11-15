# Volumetric phenotyping

**P2 Volumetric phenotyping** is the second layer of the group *Phenotyping* in the Layers panel (after P1, Deterministic phenotyping). It measures the plant of P1 the way a three dimensional scanner measures a real plant: a camera turns round the plant, every view is a partial cloud of points, the views are joined with calibration spheres, the cloud is cleaned and the **height, crown, volume, leaf area and number of leaves** are measured and compared with the model. Everything is simulated from the plant that P1 grows, so that the scan, the soil, the weather and the irrigation of the project are one chain.

> **The chain:** soil, tillage and mulch → water in the root zone → weather and irrigation → leaf water and leaf rolling (P1) → the plant that grows → **the scan** → volume, crown, leaves → the decision.

## Before you start

1. Open the layer: *Layers → Phenotyping → Volumetric phenotyping*. The layer needs the run of P1; if the page asks for it, press **Run simulation** (the run bar is the same as for every layer).
2. Choose the crop and the soil in Properties as usual. The plant that is scanned is the crop of the project, grown on the soil, tillage, mulch, irrigation and weather that are set there.
3. Choose when the season starts with **Season starts** (section 1 of the page; the control is shared with P1): *on the date of the toolbar*, *planting day of the project* (the whole season of the crop is simulated; the default of the layer), or *automatic*.
4. Press **Play** in the bar at the bottom of the page to move through the season, or drag its slider to a day. Every date in the page has the day after emergence and the real date with the year.

## The scan, step by step (the moving simulation)

Section **2b Watch the scan, step by step** plays the whole scan as a short film that can be paused, stepped and repeated. The six steps on the right of the picture light up one after the other, with a progress bar:

| Step | What moves | What it means |
|---|---|---|
| 1. The plant stands in the rig | the plant, the six calibration spheres, the ground ring | the plant of P1 on the chosen day; the spheres are the reference points of the rig |
| 2. The camera turns round the plant | a camera on the ring turns by one view (360 / number of views degrees) at a time; the points of each view appear from the ground to the top, in the colour of the view | each view sees only one side of the plant; each view arrives in its own frame (its own turn, shift and scale), so the views do not fit yet |
| 3. The spheres are found in every view | a yellow ring marks every sphere that the camera sees | the centre of each sphere is fitted by least squares or by the enhanced RANSAC; at least three spheres must be seen in common by two views |
| 4. The views are joined | the views move one after the other into the frame of view 1 | the spheres give the first alignment (self-registration), ICP refines it on the points of the plants |
| 5. The cloud is cleaned in voxels | the coloured views fade into one cloud in natural colour | the points are placed in voxels and isolated points are removed |
| 6. The plant is measured | a yellow line for the height, a blue ring for the crown, and a table that fills row by row | height, crown width, canopy volume, leaf area and leaf count of the scan, next to the model of P1 |

Controls under the picture: **Play / Pause**, **Restart**, **Step** back and forward (one step at a time), **slow / normal / fast**, and **Loop** (the film starts again after a short pause). A click on a step of the list, or on the progress bar, jumps to it. When the film is paused the picture can be turned with the mouse like the other point clouds. While the season is playing, the film follows the day on the bar: the plant that is scanned grows.

## The page, section by section

* **1 · Set up the scan.** The plant (project irrigation or drought), the number of views (1 to 6), the joining (none, spheres, spheres and ICP), the sphere fit (least squares or enhanced RANSAC), the scale (calibrated on the pot or not), the sensor noise, the voxel size, the day and the start of the season.
* **2 · The virtual rig.** The rig from above (the camera on the outer circle, the spheres on the inner ring, the plant seen from above) and from the side (the camera 22° above the plant). Below, **what each view sees**: points of the view and the share of the plant that it covers.
* **2b · Watch the scan, step by step.** The film of the previous section.
* **3 · The point clouds.** One view, the joined views and the plant itself, side by side; drag to turn them. Colour: natural colour, by height, by view, or by the error against the plant.
* **3b · Growth from emergence to the end of the season.** The same rig scans the plant on seven dates (days 10, 30, 50, 70, 90, 115 and 139), all with the same scale, with height and leaf count. The box marks the date nearest to the day on the bar.
* **4 · Joining the views.** For every view: the spheres shared with the view before, the kind of transform, the turn and shift error against the truth, and the ICP error from start to end.
* **5 · Volume and form measured on the joined cloud.** Height, crown width, canopy volume (occupied cubes and slice hull), leaf area, leaf area index, number of leaves and length and width of the mean leaf; each with the model, the error, the scan of the other treatment and the ratio.
* **6 · Where the volume is.** The leaf area over the height of the plant, for both treatments, and the leaves round the stem (histogram of the angle).
* **7 · Through the season.** A scan every 10 days for both treatments as lines, and the scatter of scan against model (height, crown width, leaf area) with the R².
* **8 · What feeds this layer and what it feeds.** The chain from soil to decision (below). A click on a row opens the layer that feeds it.

## The method in detail

1. **The plant and its surface.** The leaves and the stem of P1 on the chosen day are sampled as a cloud of points of the surface (the truth). The number of points is chosen from the size of the plant, so that a seedling and a full canopy are both well resolved.
2. **The rig.** Six calibration spheres on a ring of 28 plant-scales radius; the camera at 22° above the plant on an arm that turns; one view every 360 / views degrees (Wang et al., 2025).
3. **The capture.** For each view a z-buffer keeps only the points that the camera can see (about ±110° round the camera), adds the noise of the sensor (larger at the edges of the leaves) and the frame of the view: a turn, a shift and a scale error of the camera (a few tenths of a percent when the rig is calibrated on the pot, a few percent when it is not).
4. **The spheres.** The centre of each sphere seen by a view is fitted (least squares, sensitive to outliers; or enhanced RANSAC with a dynamic threshold, many candidates and a final Levenberg-Marquardt step).
5. **Self-registration.** Two views that see the same three or more spheres are aligned by the spheres (a rigid transform in the plane, from the centres, by Procrustes); the transforms are chained to view 1 (R0, R0·R1, R0·R1·R2, ...), so the error of each link adds up and the last views drift most.
6. **ICP.** Each view is refined on the cloud already joined (grid nearest neighbours, ten iterations, the nearest 80 % of the pairs).
7. **Voxels and clean-up.** The joined cloud is placed in voxels of the chosen size (finer for small plants) and isolated points are removed.
8. **The traits.** Height: the 99.8th percentile of the vertical axis. Crown width: the longest horizontal span of the convex hull. Canopy volume: the occupied cubes, and the hull of horizontal slices. Leaf area: surface voxels × size² / 1.5. Leaf area index: leaf area over the ground area of the plant. Number of leaves: the peaks of the histogram of the angle of the points round the stem, then split by shape (Zhu et al., 2018). Length and width of the mean leaf: principal axes.
9. **The checks.** The distance between the joined cloud and the plant (cloud to cloud), the error of every view against the truth, and, for every scan day of the season, the scan against the model with its R².

## What to look at, and what to try

* **Fewer views.** Choose 1, 2 or 3 views: the joined cloud has holes, the leaf area and the volume are too small, and with one view there is nothing to join.
* **Joining off.** Choose *None*: the views are only turned by the angle of the arm and the plant is smeared; the cloud-to-cloud distance and the errors of section 4 grow.
* **Sphere fit.** Compare least squares and the enhanced RANSAC: the fit error of the sphere centres is the error of the registration.
* **Scale.** Switch *Not calibrated*: each view has a scale error of up to 4.5 % and the crown and the volume are off.
* **Noise and voxel size.** More noise or larger voxels make the leaf area and the leaf count worse; this is the honest effect of the resolution of a scanner.
* **Drought against project irrigation.** The volumetric stress index (canopy volume of the drought plant over that of the project plant) falls below 1 when the drought plant is smaller.
* **Soil, mulch, irrigation and weather.** Change them in Properties: the plant, the scan, the growth strip and the season charts all change.

## How the layer is connected

* **Soil and tillage** decide the water of the root zone, so the plant that is scanned.
* **Weather and irrigation** decide the stress; the drought plant and the project plant are scanned side by side.
* **Leaf water and leaf rolling** (P1) narrow the crown, so the crown width of the scan follows them.
* The **volumetric stress index** is the canopy volume of the drought plant divided by that of the project plant.
* The **transpiration per litre of canopy** joins the water used by the plant to the volume that the scan measures.
* A click on a row of the chain opens the layer that feeds it (soil and tillage, field balance, soil-plant-air path, P1, crop water requirement, seasonal data).

## The real scanners that the layer imitates

The pictures of this section are real equipment and real scans from the literature on three dimensional plant phenotyping. They are given here, and not in the layer, as the documentation of what the virtual rig imitates. They are reproduced for documentation; the rights belong to the authors of the original works (Wang et al., 2025; Zhu et al., 2018, and the works that they cite).

![A real scanning cabin: a potted plant on a platform that moves through a chamber with a lamp panel above, a camera and the safety signs of the laser unit. The virtual rig of the layer replaces the cabin by a ring of calibration spheres and a turning camera.](images/volumetric/fig1_scanner_cabin.png){ width=60% }

![(A) The point cloud of a seedling with the errors that the layer reproduces: point cloud distortion and point cloud drift on single views. (B) The calibration spheres, in different colours, as they appear in the cloud; their centres are the points that join the views.](images/volumetric/fig2_drift_spheres.png){ width=85% }

![Four ways to obtain a point cloud of a plant: (a) laser scanning, (b) structured light with a projector and a camera, (c) feature matching and triangulation from photographs (structure from motion and multi-view stereo), and the newer image-based models: (d) neural radiance fields (volumetric function modelling, point sampling, volume rendering, model optimisation) and (e) 3D Gaussian splatting (initialisation from a sparse cloud, splatting, density control, model optimisation).](images/volumetric/fig3_pipelines.png){ width=85% }

![A ring rig for a whole tree: the plant stands in a measured volume (blue box), and cameras on a ring and on a mast look at it from two heights (the two dashed circles). The virtual rig of the layer has a camera on a turning arm at 22° above the plant.](images/volumetric/fig4_ring_rig.png){ width=55% }

![A scan through the season: (A) plants in the growth facility, (B) the images taken in the cabin on successive dates, (C) the three dimensional reconstruction, (D) skeletonisation and leaf extension, (E) stem tip detection and organ segmentation (stem, ligulated leaves and growing leaves). The season chart of the layer follows the same idea with a scan every 10 days.](images/volumetric/fig5_time_series.png){ width=70% }

![Segmentation of the leaves of one plant in a point cloud: each leaf has its own colour and the stem is dark. The layer counts and measures leaves in the same way (the peaks of the angle round the stem, then the shape; Zhu et al., 2018).](images/volumetric/fig6_leaf_segmentation.png){ width=70% }

![The photograph (above) and the reconstructed point cloud (below) of several species: (a) to (d) small rosette and flowering plants, (e) wheat, (f) a grass, (g) maize and (h) a legume. The reconstruction keeps the form of each plant; the layer scans the plant of Deterministic phenotyping in the same way.](images/volumetric/fig7_species.png){ width=60% }


## Limits

* The scanner is virtual: noise, scale error and the sphere fit are modelled, not measured. The errors shown are those of the model of the scanner, not of a particular camera.
* The leaf area from voxels depends on the voxel size (a coarse voxel counts the thickness of the leaf); the figure is shown so, with its error, and is not corrected.
* Leaves that touch along the same angle are counted as one leaf; the count is best for plants of up to about ten leaves seen from several sides, and it is too high for a full maize canopy.
* The scans are cached for the controls in use; a change of any control scans again (a few tens of milliseconds for one scan).

## References of the layer

Wang Z, Zhang H, Bian L, Zhou L, Ge Y (2025). Accurate plant 3D reconstruction and phenotypic traits extraction via stereo imaging and multi-view point cloud alignment. *Frontiers in Plant Science* 16:1642388.

Zhu F, Thapa S, Gao T, Ge Y, Walia H, Yu H (2018). 3D reconstruction of plant leaves for high-throughput phenotyping. University of Nebraska-Lincoln.
