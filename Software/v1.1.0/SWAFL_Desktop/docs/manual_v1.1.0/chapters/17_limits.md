# Validity, limits and honest use

The program is a **teaching and design-exploration tool** built on a research data set. This chapter says what each part can and cannot support.

**Engine 1 (the annual meta-model)** reproduces, by interpolation, the Daisy 7.1 runs it was fitted to (run sets E2, E3, E4, E5, E7, E11, E13 and E14; the study as a whole has 10,190 runs). Within the ranges of the controls it is an *emulator* of those runs: it is not a new physical model, and it does not extrapolate outside the soils, mulches, climates and irrigation methods that were simulated. It was calibrated to one location's weather record (1980–1999) and its projections to 2100 are **scenarios built from analogue years**, not forecasts.

**Engine 2 (the daily bucket model)** is a 40-layer, 1-D, daily water balance. It uses closed-form root, evaporation and transpiration functions with a single calibrated coefficient $k_t$ so that its seasonal transpiration matches Engine 1. It does not solve the Richards equation, has no lateral flow, no runoff on slopes and no water table (upward flow is a redistribution between layers only). Its day-to-day irrigation dates are therefore indicative: use them to compare scenarios, not to schedule a real irrigation to the day.

**Design layers (surface, drip, sprinkler)** are textbook models (Chapters 11–13). They are suitable for teaching, for comparing layouts, and for a first sizing. They are **not a substitute for field evaluation** of intake, advance, pressure and flow, or for a hydraulic design by a qualified engineer. In particular:

* the intake of the soil is derived from texture by pedotransfer functions with their own scatter; measure it in the field for real design;
* the sprinkler pattern is a parametric shape, not a measured catch-can test; the wind-drift loss is a parametric estimate;
* the drip bulb is a geometric simplification of two-dimensional soil water redistribution;
* pump power and pipe sizes use stated allowances (9 m of fittings, 0.65 pump efficiency, $C=140$) that you should replace with your own;
* the "Engineered" items of the label scheme (Section "About this manual") are modelling choices, not published laws.

**Data and reproducibility.** The same inputs and version give the same outputs (no random numbers in the design layers; the rainfall generator and all animations of the engine use a deterministic generator seeded by the soil name). Save the `.swafl` file and the version number with any result you report.

**Your weather (version 1.1).** Imported or online weather drives the daily model and the crop water requirement day by day. The annual model, however, can only move along the simulated steps of rainfall ($\times$0.5–1.4) and warming ($-1$ to +3.5 °C) of the study site (Eqs. 19.4–19.5): a climate far outside those steps (for example a humid tropical climate with 2,000 mm of rain) is represented by the nearest step, and the annual results should then be read as the direction of a change, not as its size. The online forecast covers 16 days; dates after it are the typical year of your record.

**The crop library (version 1.1).** The 48 library crops are not simulated: they are transferred from the simulated cereal rotation by the ratio of two FAO-56 balances (Section 21.4). The transfer is reliable for the water need and the irrigation (which follow from $K_c$ and $ET_0$), less so for drainage and nitrogen, and the yield is a relative yield (FAO-33), not a harvest in tonnes.

**The real field (version 1.1).** Sentinel-2 indices are 10 m pixels of one date and need a scene without cloud over the field. The satellite photo is a mosaic of dates that varies by place and has no near-infrared band, so it gives the visible-band indices and the land cover only; the land cover of Eq. (20.4) is an image analysis by colour and texture, not a trained model, and mistakes dark soil for water or bright soil for roofs now and then. The water sources are those mapped in OpenStreetMap and those seen in the photo; groundwater depth is not known. The DEM is 90 m, so the slope of a small field is approximate. The ranking of the systems is guidance, to be checked on the ground.

**Not included.** The package does not contain a soil-erosion model, a crop-pest model, an economic optimiser, or a groundwater model.

When you cite results from the program, state the version, the case (soil, crop, mulch, method, trigger, date and weather source) and whether the numbers come from Engine 1, Engine 2 or a design layer.
