\appendix

# Symbols and units {-}

Table A.1. Symbols used in this manual, grouped by chapter of first use. Units are SI-derived as shown; $[\,-\,]$ is dimensionless.

| Symbol | Meaning | Unit |
|:--|:--|:--|
| $\theta$, $\theta_r$, $\theta_s$ | Volumetric water content; residual; saturated | m$^3$ m$^{-3}$ |
| $\theta_{fc}$, $\theta_{wp}$ | Water content at field capacity; at wilting point | m$^3$ m$^{-3}$ |
| $h$, $\psi$ | Soil-water suction (positive); matric potential | cm; kPa |
| $\alpha$, $n$, $m$ | van Genuchten parameters ($m=1-1/n$) | cm$^{-1}$, [1], [1] |
| $K_s$, $K(h)$ | Saturated and unsaturated hydraulic conductivity | mm h$^{-1}$ |
| $\mathrm{AWC}$ | Plant-available water capacity | mm cm$^{-1}$ |
| $f$, $f_T$ | Relative depletion of the sensor layer; trigger depletion | [1] |
| $R_{\max}$, $R_d$ | Maximum and present rooting depth | cm |
| $P$, $I$, $E$, $T$, $D$ | Rain, irrigation, soil evaporation, transpiration, drainage | mm d$^{-1}$ or mm a$^{-1}$ |
| $E_0$ | Atmospheric evaporative demand | mm d$^{-1}$ |
| $\mathrm{ET}_{\mathrm{pk}}$ | Peak 5-day mean of $E+T$ | mm d$^{-1}$ |
| $k_t$ | Calibrated transpiration coefficient of Engine 2 | [1] |
| $Z_n$ | Required (net) depth per irrigation | mm |
| $Z(\tau)$, $F(t)$ | Cumulative infiltration (Kostiakov; Green and Ampt) | mm |
| $k$, $A$ | Kostiakov intake constants | mm min$^{-A}$; [1] |
| $\psi_f$ | Wetting-front suction | mm |
| $L$, $S$, $w$, $n$ | Field length; slope; spacing or width; Manning roughness | m; %; m; s m$^{-1/3}$ |
| $q$, $Q$ | Unit and total inflow | L s$^{-1}$ m$^{-1}$, L s$^{-1}$ |
| $t_x$, $t_L$, $t_{co}$, $\tau$ | Advance time; time to end; cut-off time; opportunity time | min |
| $\sigma_y$, $\sigma_z$ | Surface and subsurface shape factors | [1] |
| $E_a$, $E_s$ | Application and storage efficiency | [1] or % |
| $\mathrm{DP}$, $\mathrm{RO}$, $\mathrm{WD}$ | Deep percolation, runoff, wind drift and interception fractions | [1] |
| $\mathrm{CU}$, $\mathrm{DU}$, $E_u$ | Christiansen uniformity; distribution uniformity; emission uniformity | [1] or % |
| $S_e$, $S_l$, $L_L$, $H_0$, $D$ | Emitter spacing; lateral spacing; lateral length; inlet head; inside diameter | m, m, m, m, mm |
| $c_v$, $x$ | Emitter coefficient of variation; flow exponent | [1] |
| $r$, $a$, $u$ | Bulb radius; aspect ratio; upper semi-axis ratio | mm, [1], [1] |
| $d$, $P$, $h_s$, $R$ | Nozzle diameter; pressure; pressure head; wetted radius | mm, kPa, m, m |
| $S_s$, $S_l$ | Sprinkler spacing along and between laterals | m |
| $u$ | Wind speed | m s$^{-1}$ |
| $\mathrm{AR}$ | Mean gross application rate | mm h$^{-1}$ |
| $C$ | Hazen and Williams roughness coefficient | [1] |
| $J$ | Hydraulic gradient | m m$^{-1}$ |
| $\mathrm{TDH}$, $H_{\mathrm{man}}$ | Total dynamic head; manometric head | m |
| $A_f$, $Q_s$ | Irrigated area; farm supply | ha; L s$^{-1}$ |

# Control value lists {-}

Table B.1. Index lists behind the Properties controls (defaults in bold). All other controls are described with their ranges in Chapter 3.

| Control | Values |
|:--|:--|
| Trigger (sensor suction) | −50, −75, −100, −150, −200, −250, **−300**, −350, −400, −500, −600, −700, −800, −1000, −1200, −1500, −2000, −3000, −5000, −10000 cm |
| Sensor depth | 5, 10, 15, …, 100 cm (20 values), default **20** cm |
| Nitrogen rate | 10, 25, 40, 55, 70, 85, 100, 115, 130, 150 |
| Mulch storage capacity (CAP) | 0.5, 1, 2, 4 mm |
| Rainfall factor | 0.5 to 1.4 |
| Temperature offset | −1 to +3.5 °C |
| Mulch strength (vapour-flux factor) | 0.1 to 1.0 (1.0 = bare soil) |
| Structural consolidation rate | 0.001, 0.0025, 0.005, 0.01, 0.02 d$^{-1}$ |
| Crop | the simulated cereal/oilseed rotation and the 48 library crops of Table 21.2 |

Table B.2. Mulch materials (thermal weight / storage capacity in mm): husk 0.5 / 2, straw 0.4 / 4, chips 0.3 / 2, sawdust 0.6 / 1, grass 0.7 / 4, plastic 0.1 / 0.5.

# Simulation data sets {-}

The annual meta-model (Engine 1) is built on the following Daisy 7.1 run sets of the study (Chapter 5, Table 5.1): E2, E3, E4, E5 (300 runs), E7, E11, E13 and E14. The study as a whole comprises 10,190 simulation runs in 17 experiments, available from the project repository (`Results/` and `Software/` folders). The 20-year weather record (1980 to 1999) is the baseline of the study; the projections to 2100 are analogue-year scenarios (Chapter 4).

# Provenance ledger of the numbered equations {-}

All 134 numbered equations are labelled in the text and listed here: 38 **[Literature]**, 18 **[Data-driven]** and 78 **[Engineered]**. A **[Literature]** label means the relation is the published one; it does not mean that SWAFL has been validated in the field. The surface, drip and sprinkler design relations marked in Paper 3 were tested against published worked examples; nothing has been tested against field measurements.

| Eq. | Label | Basis |
|:-:|:--|:--|
| 4.1 | Engineered | calendar bookkeeping and choice of analogue year; no physical law |
| 4.2 | Engineered | calendar bookkeeping and choice of analogue year; no physical law |
| 5.1 | Literature | van Genuchten (1980) |
| 5.2 | Literature | Mualem (1976) with van Genuchten (1980) |
| 5.3 | Literature | standard definition of plant-available water between field capacity and wilting point |
| 5.4 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.5 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.6 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.7 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.8 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.9 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.10 | Data-driven | ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits |
| 5.11 | Data-driven | set-specific corrections from the Daisy run sets; clip bounds engineered |
| 5.12 | Engineered | closure constraint and bounds chosen for the workbench |
| 5.13 | Engineered | canopy curves, parameters chosen for the workbench; not a measured leaf-area record |
| 5.14 | Engineered | canopy curves, parameters chosen for the workbench; not a measured leaf-area record |
| 5.15 | Engineered | stochastic rain and interception generator; the exponential wet-day depth is a standard weather-generator form, the constants are chosen |
| 5.16 | Engineered | stochastic rain and interception generator; the exponential wet-day depth is a standard weather-generator form, the constants are chosen |
| 5.17 | Engineered | tipping-bucket redistribution with a chosen coefficient |
| 5.18 | Engineered | rooting rules with constants chosen for the workbench |
| 5.19 | Engineered | rooting rules with constants chosen for the workbench |
| 5.20 | Engineered | rooting rules with constants chosen for the workbench |
| 5.21 | Engineered | demand partitioning with chosen weights and a calibration factor |
| 5.22 | Engineered | demand partitioning with chosen weights and a calibration factor |
| 5.23 | Engineered | demand partitioning with chosen weights and a calibration factor |
| 5.24 | Data-driven | scaling of the daily series to the Engine 1 twenty-year means |
| 5.25 | Literature | water-balance identity |
| 5.26 | Engineered | atmosphere factor with chosen constants |
| 5.27 | Literature | readily available water as in FAO-56 practice, with an engineered clip |
| 6.1 | Data-driven | counts over the simulated daily series |
| 6.2 | Data-driven | counts over the simulated daily series |
| 6.3 | Literature | inverse of the van Genuchten curve, solved by bisection |
| 6.4 | Literature | same relation as Eq. (5.27) without the clip |
| 6.5 | Data-driven | ratio of Daisy run-set E2 yields |
| 7.1 | Literature | inverse of Eq. (5.3); the 30 cm floor is engineered |
| 7.2 | Engineered | series-resistance chain after van den Honert (1948); resistance values chosen for the workbench |
| 7.3 | Engineered | series-resistance chain after van den Honert (1948); resistance values chosen for the workbench |
| 7.4 | Engineered | series-resistance chain after van den Honert (1948); resistance values chosen for the workbench |
| 7.5 | Literature | Nobel (2009) |
| 7.6 | Engineered | indicator defined for the workbench |
| 8.1 | Engineered | exponential relaxation with chosen constants |
| 8.2 | Engineered | porosity relation with chosen coefficients |
| 8.3 | Literature | van Genuchten (1980) |
| 8.4 | Literature | Young-Laplace (Jurin) capillary law |
| 8.5 | Data-driven | differences of Daisy run-set E5 results |
| 8.6 | Data-driven | ordinary least squares applied to Daisy results |
| 8.7 | Engineered | diagnostic defined for the workbench |
| 9.1 | Data-driven | differences and ratios of Daisy run-set E14 and E11 results |
| 9.2 | Engineered | two-stage evaporation of the type described by Ritchie (1972) and Philip, with parameters chosen for the workbench |
| 9.3 | Engineered | two-stage evaporation of the type described by Ritchie (1972) and Philip, with parameters chosen for the workbench |
| 9.4 | Engineered | drying-front geometry chosen for drawing |
| 9.5 | Engineered | drying-front geometry chosen for drawing |
| 9.6 | Data-driven | differences and ratios of Daisy run-set E14 and E11 results |
| 9.7 | Data-driven | differences and ratios of Daisy run-set E14 and E11 results |
| 9.8 | Engineered | index defined for the workbench |
| 10.1 | Engineered | drawing rule |
| 10.2 | Data-driven | one-step differences of Daisy results |
| 11.1 | Literature | Saxton and Rawls (2006), implemented as written |
| 11.2 | Literature | Saxton and Rawls (2006), implemented as written |
| 11.3 | Engineered | rational-polynomial approximation of a Rawls-type suction |
| 11.4 | Engineered | initial and wetted water contents chosen for the workbench |
| 11.5 | Literature | Green and Ampt (1911) |
| 11.6 | Literature | Kostiakov (1932) |
| 11.7 | Literature | ordinary least squares on the log-log plot |
| 11.8 | Literature | Manning (1891) |
| 11.9 | Literature | volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3) |
| 11.10 | Literature | volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3) |
| 11.11 | Literature | volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3) |
| 11.12 | Engineered | alternative advance models set by worked examples and course notes |
| 11.13 | Engineered | alternative advance models set by worked examples and course notes |
| 11.15 | Literature | inversion of the Kostiakov law |
| 11.16 | Engineered | cut-off rules chosen as design options |
| 11.17 | Literature | standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997) |
| 11.18 | Literature | standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997) |
| 11.19 | Literature | standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997) |
| 11.20 | Engineered | hydrograph shapes chosen for drawing; volume conserving |
| 11.21 | Engineered | hydrograph shapes chosen for drawing; volume conserving |
| 11.22 | Engineered | search limit; the furrow stream limit follows Criddle et al. (1956) |
| 11.23 | Engineered | optimisation score and seasonal bookkeeping chosen for the workbench |
| 11.24 | Engineered | optimisation score and seasonal bookkeeping chosen for the workbench |
| 12.1 | Engineered | depth and demand rules chosen for the workbench |
| 12.2 | Engineered | depth and demand rules chosen for the workbench |
| 12.3 | Literature | Hazen and Williams (1905) |
| 12.4 | Literature | Keller and Karmeli (1974) emitter law |
| 12.5 | Engineered | pressure-compensating emitter model with chosen constants |
| 12.6 | Literature | definitions of mean and minimum discharge |
| 12.7 | Literature | Keller and Karmeli (1974) |
| 12.8 | Engineered | combined spread chosen to drive the bulb quantiles |
| 12.9 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.10 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.11 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.12 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.13 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.14 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.15 | Engineered | wetted-bulb geometry and loss partition; constants chosen for the workbench |
| 12.16 | Engineered | five-quantile delivery and run-time rules chosen for the workbench |
| 12.17 | Literature | definition of the requirement over the area served by one emitter |
| 12.18 | Engineered | five-quantile delivery and run-time rules chosen for the workbench |
| 12.19 | Engineered | five-quantile delivery and run-time rules chosen for the workbench |
| 12.20 | Engineered | layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice |
| 12.21 | Engineered | layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice |
| 12.22 | Engineered | Christiansen-type reduction with a chosen factor 0.4 |
| 12.23 | Engineered | layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice |
| 12.24 | Engineered | layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice |
| 12.25 | Engineered | layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice |
| 12.26 | Engineered | layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice |
| 13.1 | Engineered | depression storage reduction with slope |
| 13.2 | Literature | Torricelli orifice equation |
| 13.3 | Engineered | range law of the Keller and Bliesner (1990) form; the impact coefficient 1.35 is the published value and is verified against their worked example (Paper 3); the coefficients of the other types and the angle function are chosen |
| 13.4 | Engineered | pattern and wind shapes chosen to reproduce published qualitative patterns |
| 13.5 | Engineered | pattern and wind shapes chosen to reproduce published qualitative patterns |
| 13.6 | Literature | overlap by superposition of single-sprinkler patterns |
| 13.7 | Literature | Christiansen (1942) |
| 13.8 | Engineered | loss and ponding rules chosen for the workbench |
| 13.9 | Engineered | loss and ponding rules chosen for the workbench |
| 13.10 | Engineered | loss and ponding rules chosen for the workbench |
| 13.11 | Literature | efficiency and distribution uniformity of Merriam and Keller (1978) |
| 13.12 | Engineered | run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified |
| 13.13 | Engineered | run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified |
| 13.14 | Engineered | run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified |
| 13.15 | Engineered | run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified |
| 13.16 | Engineered | run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified |
| 13.17 | Literature | Blasius friction law for smooth pipe |
| 13.18 | Literature | 20 % rule of Keller and Bliesner (1990) |
| 13.19 | Engineered | head and sets bookkeeping |
| 13.20 | Literature | hydraulic power definition |
| 13.21 | Engineered | head and sets bookkeeping |
| 13.22 | Literature | Christiansen reduction factor with Hazen-Williams exponent |
| 13.23 | Engineered | head and sets bookkeeping |
| 14.1 | Engineered | bookkeeping of Engine 2 series |
| 14.2 | Engineered | bookkeeping of Engine 2 series |
| 14.3 | Literature | water-balance identity |
| 14.4 | Engineered | bookkeeping of Engine 2 series |
| 14.5 | Engineered | bookkeeping of Engine 2 series |

# References {-}

Abrahamsen, P., and Hansen, S. (2000). Daisy: an open soil-crop-atmosphere system model. *Environmental Modelling & Software* 15(3), 313 to 330.

Allen, R. G., and Pereira, L. S. (2009). Estimating crop coefficients from fraction of ground cover and height. *Irrigation Science* 28, 17 to 34.

Allen, R. G., Pereira, L. S., Raes, D., and Smith, M. (1998). *Crop evapotranspiration: guidelines for computing crop water requirements*. FAO Irrigation and Drainage Paper 56. FAO, Rome.

Barnes, E. M., Clarke, T. R., Richards, S. E., et al. (2000). Coincident detection of crop water stress, nitrogen status and canopy density using ground-based multispectral data. *Proceedings of the 5th International Conference on Precision Agriculture*, Bloomington, MN.

Barnes, R., Lehman, C., and Mulla, D. (2014). Priority-flood: an optimal depression-filling and watershed-labeling algorithm for digital elevation models. *Computers & Geosciences* 62, 117 to 127.

Bausch, W. C., and Neale, C. M. U. (1987). Crop coefficients derived from reflected canopy radiation: a concept. *Transactions of the ASAE* 30, 703 to 709.

Blasius, H. (1913). Das Ähnlichkeitsgesetz bei Reibungsvorgängen in Flüssigkeiten. *Forschungsarbeiten auf dem Gebiete des Ingenieurwesens* 131.

Brouwer, C., Prins, K., Kay, M., and Heibloem, M. (1988). *Irrigation water management: irrigation methods*. FAO Training Manual 9. FAO, Rome.

Burt, C. M., Clemmens, A. J., Strelkoff, T. S., Solomon, K. H., Bliesner, R. D., Hardy, L. A., Howell, T. A., and Eisenhauer, D. E. (1997). Irrigation performance measures: efficiency and uniformity. *Journal of Irrigation and Drainage Engineering* 123(6), 423 to 442.

Carsel, R. F., and Parrish, R. S. (1988). Developing joint probability distributions of soil water retention characteristics. *Water Resources Research* 24(5), 755 to 769.

Chamberlain, R. G., and Duquette, W. H. (2007). *Some algorithms for polygons on a sphere*. JPL Publication 07-03, Jet Propulsion Laboratory, Pasadena.

Christiansen, J. E. (1942). *Irrigation by sprinkling*. University of California Agricultural Experiment Station Bulletin 670.

Criddle, W. D., Davis, S., Pair, C. H., and Shockley, D. G. (1956). *Methods for evaluating irrigation systems*. USDA Soil Conservation Service, Agriculture Handbook 82.

Elliott, R. L., and Walker, W. R. (1982). Field evaluation of furrow infiltration and advance functions. *Transactions of the ASAE* 25(2), 396 to 400.

Frangi, A. F., Niessen, W. J., Vincken, K. L., and Viergever, M. A. (1998). Multiscale vessel enhancement filtering. *MICCAI'98*, Lecture Notes in Computer Science 1496, 130 to 137.

Gao, B.-C. (1996). NDWI: a normalized difference water index for remote sensing of vegetation liquid water from space. *Remote Sensing of Environment* 58, 257 to 266.

Gitelson, A. A., Kaufman, Y. J., Stark, R., and Rundquist, D. (2002). Novel algorithms for remote estimation of vegetation fraction. *Remote Sensing of Environment* 80, 76 to 87.

Green, W. H., and Ampt, G. A. (1911). Studies on soil physics: 1. The flow of air and water through soils. *Journal of Agricultural Science* 4(1), 1 to 24.

Hazen, A., and Williams, G. S. (1905). *Hydraulic tables*. John Wiley & Sons, New York.

Hillel, D. (1998). *Environmental soil physics*. Academic Press, San Diego.

Huete, A. R. (1988). A soil-adjusted vegetation index (SAVI). *Remote Sensing of Environment* 25, 295 to 309.

Huete, A., Didan, K., Miura, T., Rodriguez, E. P., Gao, X., and Ferreira, L. G. (2002). Overview of the radiometric and biophysical performance of the MODIS vegetation indices. *Remote Sensing of Environment* 83, 195 to 213.

Jurin, J. (1718). An account of some experiments shown before the Royal Society; with an enquiry into the cause of the ascent and suspension of water in capillary tubes. *Philosophical Transactions* 30(355), 739 to 747.

Keller, J., and Bliesner, R. D. (1990). *Sprinkle and trickle irrigation*. Van Nostrand Reinhold, New York.

Keller, J., and Karmeli, D. (1974). Trickle irrigation design parameters. *Transactions of the ASAE* 17(4), 678 to 684.

Kostiakov, A. N. (1932). On the dynamics of the coefficient of water-percolation in soils and on the necessity of studying it from a dynamic point of view for purposes of amelioration. *Transactions of the 6th Committee of the International Society of Soil Science*, Part A, 17 to 21.

Louhaichi, M., Borman, M. M., and Johnson, D. E. (2001). Spatially located platform and aerial photography for documentation of grazing impacts on wheat. *Geocarto International* 16, 65 to 70.

Manning, R. (1891). On the flow of water in open channels and pipes. *Transactions of the Institution of Civil Engineers of Ireland* 20, 161 to 207.

Merriam, J. L., and Keller, J. (1978). *Farm irrigation system evaluation: a guide for management*. Utah State University, Logan.

Moore, I. D., and Wilson, J. P. (1992). Length-slope factors for the Revised Universal Soil Loss Equation: simplified method of estimation. *Journal of Soil and Water Conservation* 47, 423 to 428.

Mualem, Y. (1976). A new model for predicting the hydraulic conductivity of unsaturated porous media. *Water Resources Research* 12(3), 513 to 522.

Nobel, P. S. (2009). *Physicochemical and environmental plant physiology*, 4th ed. Academic Press, Amsterdam.

Philip, J. R. (1957). Evaporation, and moisture and heat fields in the soil. *Journal of Meteorology* 14(4), 354 to 366.

Poggio, L., de Sousa, L. M., Batjes, N. H., et al. (2021). SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty. *SOIL* 7, 217 to 240.

Renard, K. G., and Freimund, J. R. (1994). Using monthly precipitation data to estimate the R-factor in the revised USLE. *Journal of Hydrology* 157, 287 to 306.

Richardson, C. W., Foster, G. R., and Wright, D. A. (1983). Estimation of erosion index from daily rainfall amount. *Transactions of the ASAE* 26, 153 to 156.

Ritchie, J. T. (1972). Model for predicting evaporation from a row crop with incomplete cover. *Water Resources Research* 8(5), 1204 to 1213.

Rouse, J. W., Haas, R. H., Schell, J. A., and Deering, D. W. (1974). Monitoring vegetation systems in the Great Plains with ERTS. *Third ERTS Symposium*, NASA SP-351, 309 to 317.

Saxton, K. E., and Rawls, W. J. (2006). Soil water characteristic estimates by texture and organic matter for hydrologic solutions. *Soil Science Society of America Journal* 70(5), 1569 to 1578.

Sharpley, A. N., and Williams, J. R. (1990). *EPIC, Erosion/Productivity Impact Calculator: 1. Model documentation*. USDA Technical Bulletin 1768.

Tucker, C. J. (1979). Red and photographic infrared linear combinations for monitoring vegetation. *Remote Sensing of Environment* 8, 127 to 150.

USDA-NRCS (1986). *Urban hydrology for small watersheds*. Technical Release 55 (TR-55), Washington, DC.

van den Honert, T. H. (1948). Water transport in plants as a catenary process. *Discussions of the Faraday Society* 3, 146 to 153.

van der Knijff, J. M., Jones, R. J. A., and Montanarella, L. (1999). *Soil erosion risk assessment in Italy*. European Soil Bureau, JRC Ispra.

van Genuchten, M. Th. (1980). A closed-form equation for predicting the hydraulic conductivity of unsaturated soils. *Soil Science Society of America Journal* 44(5), 892 to 898.

Vandaele, K., Poesen, J., Govers, G., and van Wesemael, B. (1996). Geomorphic threshold conditions for ephemeral gully incision. *Geomorphology* 16, 161 to 173.

Walker, W. R., and Skogerboe, G. V. (1987). *Surface irrigation: theory and practice*. Prentice-Hall, Englewood Cliffs, NJ.

Woebbecke, D. M., Meyer, G. E., Von Bargen, K., and Mortensen, D. A. (1995). Color indices for weed identification under various soil, residue, and lighting conditions. *Transactions of the ASAE* 38, 259 to 269.


# Equation reference {-}

This appendix prints every numbered equation of the program in full, in the order of the chapters, with its provenance and the layers of the program that draw on it. The equations added in version 1.1 (Eqs. 5.12a, 6.4a and those of Chapters 14, 18 to 23) are printed in their chapters.

**Eq. 4.1**: dates


```{=latex}
\fitmath{4.1}{k_{\mathrm{start}} = 365\,a + d_{\mathrm{oy}}, \qquad
\text{date}(k) = \text{1 Jan of year } \bigl(Y_0 + \lfloor k/365\rfloor - a\bigr) + \bigl(k - 365\lfloor k/365\rfloor\bigr)\ \text{days},}
```


*Provenance (Eq. 4.1):* **[Engineered]**: calendar bookkeeping and choice of analogue year; no physical law.

**Eq. 4.2**: dates


```{=latex}
\fitmath{4.2}{a = \begin{cases}
\mathrm{argsort}_y\,(P_{\mathrm{thr},y})_{[10]} & \text{typical (median, 11th smallest of 20)}\\
\arg\min_y P_{\mathrm{thr},y} & \text{dry}\\
\arg\max_y P_{\mathrm{thr},y} & \text{wet}\\
Y_0 - 1980 & 1980\le Y_0\le 1999
\end{cases}}
```


*Provenance (Eq. 4.2):* **[Engineered]**: calendar bookkeeping and choice of analogue year; no physical law.

**Eq. 5.1**: engine


```{=latex}
\fitmath{5.1}{S_e(h) = \Bigl[\,1 + (\alpha |h|)^{n}\Bigr]^{-m},\quad m = 1 - \tfrac{1}{n}, \qquad
\theta(h) = \theta_r + (\theta_s - \theta_r)\,S_e(h)}
```


*Provenance (Eq. 5.1):* **[Literature]**: van Genuchten (1980).

**Eq. 5.2**: engine


```{=latex}
\fitmath{5.2}{K_r(S_e) = S_e^{\,1/2}\Bigl[\,1 - \bigl(1 - S_e^{\,1/m}\bigr)^{m}\Bigr]^{2}.}
```


*Provenance (Eq. 5.2):* **[Literature]**: Mualem (1976) with van Genuchten (1980).

**Eq. 5.3**: engine


```{=latex}
\fitmath{5.3}{f(h) \;=\; \frac{S_e(100) - S_e(|h|)}{S_e(100) - S_e(15\,849)},
\qquad f_{\mathrm{used}} = \min\{1,\max\{0, f\}\}.}
```


*Provenance (Eq. 5.3):* **[Literature]**: standard definition of plant-available water between field capacity and wilting point.

**Eq. 5.4**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.5**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.6**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.7**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.8**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.9**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.10**: engine


```{=latex}
\fitmath{}{\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}}
```


*Provenance (Eq. 5.4 to 5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2 to E14); the clip bounds are engineered limits.

**Eq. 5.11**: engine


```{=latex}
\fitmath{5.11}{Q \leftarrow Q\ \mathrm{clip}\Bigl(\tfrac{r_\kappa.Q}{r_{\kappa_0}.Q};\,0.05,\,6\Bigr)\ \ (Q\in\{E,T,ET,I,Y\}),\qquad
D \leftarrow D + (r_\kappa.D - r_{\kappa_0}.D),\quad N_L \leftarrow N_L + (r_\kappa.N - r_{\kappa_0}.N).}
```


*Provenance (Eq. 5.11):* **[Data-driven]**: set-specific corrections from the Daisy run sets; clip bounds engineered.

**Eq. 5.12**: engine


```{=latex}
\fitmath{5.12}{\begin{gathered}
ET \in [\,P + I - D - 30,\ P + I - D + 15\,]\ \text{(if not, } ET\ \text{is clipped and } E, T \text{ are scaled by the same factor)},\\
E_{\mathrm{other}} = \max(0,\ ET - T - E),\qquad \Delta S = P + I - ET - D,\qquad
\mathrm{IE} = \frac{100\,Y}{I}\ \ [\mathrm{kg\ m^{-3}}].
\end{gathered}}
```


*Provenance (Eq. 5.12):* **[Engineered]**: closure constraint and bounds chosen for the workbench.

**Eq. 5.13**: engine


```{=latex}
\fitmath{5.13}{c_{\text{spring}}(d) = \frac{1}{1 + \exp\bigl(-(d - d_{\mathrm{mid}})/s\bigr)},\quad s = 13\ (\text{vegetable } 8),}
```


*Provenance (Eq. 5.13):* **[Engineered]**: canopy curves, parameters chosen for the workbench; not a measured leaf-area record.

**Eq. 5.14**: engine


```{=latex}
\fitmath{5.14}{c_{\text{winter}}(d) = \begin{cases}0.08 + 0.12\,\min\{1,(d-d_{\mathrm{sow}})/60\} & d < d_{\mathrm{pk}} - 90\\[2pt] 0.2 + \dfrac{0.8}{1 + \exp\bigl(-(d - d_{\mathrm{pk}} + 45)/12\bigr)} & \text{otherwise}\end{cases}}
```


*Provenance (Eq. 5.14):* **[Engineered]**: canopy curves, parameters chosen for the workbench; not a measured leaf-area record.

**Eq. 5.15**: engine


```{=latex}
\fitmath{5.15}{R = \min\bigl\{70,\ \mu_0\,\gamma_y\,(-\ln U)\bigr\},\qquad U\sim\mathrm{Uniform}(0,1),}
```


*Provenance (Eq. 5.15):* **[Engineered]**: stochastic rain and interception generator; the exponential wet-day depth is a standard weather-generator form, the constants are chosen.

**Eq. 5.16**: engine


```{=latex}
\fitmath{5.16}{I_c = \mu_0 \ln\!\frac{1}{r},\qquad r = \frac{\max\{40,\ P - P_{\mathrm{other}}\}}{P},
\qquad T_f = \max\{0,\,R - I_c\}.}
```


*Provenance (Eq. 5.16):* **[Engineered]**: stochastic rain and interception generator; the exponential wet-day depth is a standard weather-generator form, the constants are chosen.

**Eq. 5.17**: engine


```{=latex}
\fitmath{5.17}{q_{i} = 0.08\,(w_{i+1} - w_i),\qquad w_i \leftarrow w_i + q_i,\ \ w_{i+1}\leftarrow w_{i+1} - q_i,}
```


*Provenance (Eq. 5.17):* **[Engineered]**: tipping-bucket redistribution with a chosen coefficient.

**Eq. 5.18**: engine


```{=latex}
\fitmath{5.18}{R_{\max} = \mathrm{clip}\Bigl(R_{c}\,(0.85 + 0.3\,\mathrm{sand})\bigl[1 + 0.12\log_{10}(|h_T|/300)\bigr]\bigl[1 - 0.18\,\tfrac{N-100}{100}\bigr];\ 25,\ 100\Bigr)\ \mathrm{cm},}
```


*Provenance (Eq. 5.18):* **[Engineered]**: rooting rules with constants chosen for the workbench.

**Eq. 5.19**: engine


```{=latex}
\fitmath{5.19}{R_d \leftarrow \max\Bigl\{R_d,\ \min\bigl\{R_{\max}\,\mathrm{clip}\bigl(\tfrac{c-0.04}{0.96};0,1\bigr)^{0.8},\ R_{\max},\ R_d + 1.7\,(0.35 + \bar s_{\mathrm{wet}})\,\kappa\bigr\}\Bigr\},}
```


*Provenance (Eq. 5.19):* **[Engineered]**: rooting rules with constants chosen for the workbench.

**Eq. 5.20**: engine


```{=latex}
\fitmath{5.20}{\rho_i \propto \exp\!\Bigl(-\frac{z_i}{\lambda R_d + 8}\Bigr)\bigl(0.45 + 0.9\,s_i\bigr)\Bigl[1 + 3\,e^{-((z_i - z_d)/12)^2}\Bigr]_{\text{drip only}},\quad z_i\le R_d,\qquad \sum_i \rho_i = 1,}
```


*Provenance (Eq. 5.20):* **[Engineered]**: rooting rules with constants chosen for the workbench.

**Eq. 5.21**: engine


```{=latex}
\fitmath{5.21}{E_d = E_{\mathrm{yr}}\,\frac{w(\mathrm{doy})}{\sum_{k=0}^{364} w(k)}\,(1 - 0.3\,c),\qquad w(\mathrm{doy}) = 0.35 + 0.65\cdot\tfrac12\Bigl[1 + \sin\tfrac{2\pi(\mathrm{doy} - 100)}{365}\Bigr],}
```


*Provenance (Eq. 5.21):* **[Engineered]**: demand partitioning with chosen weights and a calibration factor.

**Eq. 5.22**: engine


```{=latex}
\fitmath{5.22}{T_d = k_t\,T_{\mathrm{yr}}\,\frac{c(d)}{\bar C},\qquad \bar C = \tfrac{1}{20}\sum_{\text{20 yr}} c,}
```


*Provenance (Eq. 5.22):* **[Engineered]**: demand partitioning with chosen weights and a calibration factor.

**Eq. 5.23**: engine


```{=latex}
\fitmath{5.23}{q^{T}_i = T_d\,\frac{\rho_i\,a_i}{\sum_j \rho_j a_j},\qquad a_i = \mathrm{clip}\Bigl(\frac{s_i - 0.15}{0.6};\,0,\,1\Bigr),}
```


*Provenance (Eq. 5.23):* **[Engineered]**: demand partitioning with chosen weights and a calibration factor.

**Eq. 5.24**: engine


```{=latex}
\fitmath{5.24}{S_P = \frac{P}{\overline{P_{\mathrm{sim}}}},\quad
S_{\mathrm{thr}} = \frac{P - P_{\mathrm{other}}}{\overline{T_{f,\mathrm{sim}}}},\quad
S_E = \frac{E}{\overline{E_{\mathrm{sim}}}},\quad
S_T = \frac{T}{\overline{T_{\mathrm{sim}}}},\quad
S_D = \frac{D}{\overline{D_{\mathrm{sim}}}},}
```


*Provenance (Eq. 5.24):* **[Data-driven]**: scaling of the daily series to the Engine 1 twenty-year means.

**Eq. 5.25**: engine


```{=latex}
\fitmath{5.25}{\Delta S_d = T_f + I - E - T - D.}
```


*Provenance (Eq. 5.25):* **[Literature]**: water-balance identity.

**Eq. 5.26**: engine


```{=latex}
\fitmath{5.26}{E_{0,\mathrm{bare}} = 4.2\,(1 + 0.07\,\Delta T)\,\frac{0.35 + 0.65\cdot\tfrac12[1 + \sin(2\pi(\mathrm{doy}-100)/365)]}{0.675}\,\mathrm{clip}\bigl(1 - 0.12(\rho-1);\,0.85,\,1.12\bigr)\sqrt{\gamma_y}\ \ \mathrm{mm\,d^{-1}},}
```


*Provenance (Eq. 5.26):* **[Engineered]**: atmosphere factor with chosen constants.

**Eq. 5.27**: engine


```{=latex}
\fitmath{5.27}{Z_n = \mathrm{clip}\bigl(f_T\cdot \mathrm{AWC}\cdot R_{\max};\ 25,\ 150\bigr)\ \mathrm{mm}\qquad(\text{surface; drip and sprinkler use their own limits})}
```


*Provenance (Eq. 5.27):* **[Literature]**: readily available water as in FAO-56 practice, with an engineered clip.

**Eq. 6.1**: control


```{=latex}
\fitmath{6.1}{N_y(h_T) = \#\bigl\{\,d \in \text{growing season of year } y : h_d > h_T\,\bigr\}\quad(183\ \text{days from 1 April}),}
```


*Provenance (Eq. 6.1):* **[Data-driven]**: counts over the simulated daily series.

**Eq. 6.2**: control


```{=latex}
\fitmath{6.2}{X = 100\Bigl(1 - \frac{\bar N_{\mathrm{irr}}}{\bar N_{\mathrm{rainfed}}}\Bigr),\qquad \bar N = \tfrac{1}{20}\sum_{y} N_y.}
```


*Provenance (Eq. 6.2):* **[Data-driven]**: counts over the simulated daily series.

**Eq. 6.3**: control


```{=latex}
\fitmath{6.3}{h(f) = \Bigl\{\,h : f(h) = f\,\Bigr\},}
```


*Provenance (Eq. 6.3):* **[Literature]**: inverse of the van Genuchten curve, solved by bisection.

**Eq. 6.4**: control


```{=latex}
\fitmath{6.4}{Z_n = f\cdot \mathrm{AWC}\cdot R_{\max}\quad[\mathrm{mm}]}
```


*Provenance (Eq. 6.4):* **[Literature]**: same relation as Eq. (5.27) without the clip.

**Eq. 6.5**: control


```{=latex}
\fitmath{6.5}{Y_{\mathrm{rel}} = \frac{Y(h_T)}{\max_{h}\,Y(h)},}
```


*Provenance (Eq. 6.5):* **[Data-driven]**: ratio of Daisy run-set E2 yields.

**Eq. 7.1**: field


```{=latex}
\fitmath{7.1}{h_i = \max\{30,\ h(f_i)\},\qquad f_i = 1 - s_i,\qquad
\psi_{\mathrm{soil},i} = -h_i\cdot 9.807\times10^{-5}\ \mathrm{MPa\ cm^{-1}}.}
```


*Provenance (Eq. 7.1):* **[Literature]**: inverse of Eq. (5.3); the 30 cm floor is engineered.

**Eq. 7.2**: field


```{=latex}
\fitmath{}{\begin{aligned}
R_{\mathrm{soil}} &= 0.03\,\max\{K_r,\,0.002\}^{-0.55}, \quad R_{\mathrm{root}} = 0.10,\quad R_{\mathrm{xyl}} = 0.05,\quad R_{\mathrm{leaf}} = 0.08 &&(7.2)\\
\psi_{\mathrm{root}} &= \psi_{RZ} - a\,E\,R_{\mathrm{soil}}, \qquad
\psi_{\mathrm{stem}} = \psi_{\mathrm{root}} - a\,E\,R_{\mathrm{root}}, &&(7.3)\\
\psi_{\mathrm{leaf}} &= \mathrm{clip}\bigl(\psi_{\mathrm{stem}} - a\,E\,(R_{\mathrm{xyl}} + R_{\mathrm{leaf}});\ -3.2,\ 0\bigr), &&(7.4)
\end{aligned}}
```


*Provenance (Eq. 7.2 to 7.4):* **[Engineered]**: series-resistance chain after van den Honert (1948); resistance values chosen for the workbench.

**Eq. 7.3**: field


```{=latex}
\fitmath{}{\begin{aligned}
R_{\mathrm{soil}} &= 0.03\,\max\{K_r,\,0.002\}^{-0.55}, \quad R_{\mathrm{root}} = 0.10,\quad R_{\mathrm{xyl}} = 0.05,\quad R_{\mathrm{leaf}} = 0.08 &&(7.2)\\
\psi_{\mathrm{root}} &= \psi_{RZ} - a\,E\,R_{\mathrm{soil}}, \qquad
\psi_{\mathrm{stem}} = \psi_{\mathrm{root}} - a\,E\,R_{\mathrm{root}}, &&(7.3)\\
\psi_{\mathrm{leaf}} &= \mathrm{clip}\bigl(\psi_{\mathrm{stem}} - a\,E\,(R_{\mathrm{xyl}} + R_{\mathrm{leaf}});\ -3.2,\ 0\bigr), &&(7.4)
\end{aligned}}
```


*Provenance (Eq. 7.2 to 7.4):* **[Engineered]**: series-resistance chain after van den Honert (1948); resistance values chosen for the workbench.

**Eq. 7.4**: field


```{=latex}
\fitmath{}{\begin{aligned}
R_{\mathrm{soil}} &= 0.03\,\max\{K_r,\,0.002\}^{-0.55}, \quad R_{\mathrm{root}} = 0.10,\quad R_{\mathrm{xyl}} = 0.05,\quad R_{\mathrm{leaf}} = 0.08 &&(7.2)\\
\psi_{\mathrm{root}} &= \psi_{RZ} - a\,E\,R_{\mathrm{soil}}, \qquad
\psi_{\mathrm{stem}} = \psi_{\mathrm{root}} - a\,E\,R_{\mathrm{root}}, &&(7.3)\\
\psi_{\mathrm{leaf}} &= \mathrm{clip}\bigl(\psi_{\mathrm{stem}} - a\,E\,(R_{\mathrm{xyl}} + R_{\mathrm{leaf}});\ -3.2,\ 0\bigr), &&(7.4)
\end{aligned}}
```


*Provenance (Eq. 7.2 to 7.4):* **[Engineered]**: series-resistance chain after van den Honert (1948); resistance values chosen for the workbench.

**Eq. 7.5**: field


```{=latex}
\fitmath{7.5}{\psi_{\mathrm{air}} = \frac{R\,T}{V_w}\,\ln \mathrm{RH} \;\approx\; 135.5\,\ln\mathrm{RH}\ \ \mathrm{MPa}}
```


*Provenance (Eq. 7.5):* **[Literature]**: Nobel (2009).

**Eq. 7.6**: field


```{=latex}
\fitmath{7.6}{\mathrm{share} = \frac{\sum_{i:\ z_i\le 60\,\mathrm{cm},\ h_i>h_T}\Delta z_i}{\sum_{i:\ z_i\le 60\,\mathrm{cm}}\Delta z_i},}
```


*Provenance (Eq. 7.6):* **[Engineered]**: indicator defined for the workbench.

**Eq. 8.1**: structure


```{=latex}
\fitmath{8.1}{p(t) = p_c + (p_0 - p_c)\,e^{-\tau_c t},\qquad p_0 = 1.00\ (\text{conventional}),\ 0.72\ (\text{reduced}),}
```


*Provenance (Eq. 8.1):* **[Engineered]**: exponential relaxation with chosen constants.

**Eq. 8.2**: structure


```{=latex}
\fitmath{8.2}{\phi = \mathrm{clip}\bigl(0.36 + 0.0016\,\mathrm{clay} + 0.0009\,\mathrm{silt};\ 0.34,\ 0.50\bigr),\qquad
\theta_r = 0.01 + 0.0006\,\mathrm{clay},}
```


*Provenance (Eq. 8.2):* **[Engineered]**: porosity relation with chosen coefficients.

**Eq. 8.3**: structure


```{=latex}
\fitmath{8.3}{\theta(h) = \theta_r + (\phi - \theta_r)\,S_e(h).}
```


*Provenance (Eq. 8.3):* **[Literature]**: van Genuchten (1980).

**Eq. 8.4**: structure


```{=latex}
\fitmath{8.4}{r_c = \frac{2\,\sigma\cos\gamma}{\rho_w\, g\, h} \;\approx\; \frac{0.149\ \mathrm{cm^2}}{h}\quad(\mathrm{or}\ r_c[\mathrm{mm}] \approx 1.49/h[\mathrm{cm}]),}
```


*Provenance (Eq. 8.4):* **[Literature]**: Young-Laplace (Jurin) capillary law.

**Eq. 8.5**: structure


```{=latex}
\fitmath{8.5}{\Delta_{\mathrm{till}}(s) = D_s(\mathrm{conv},\tau^\ast) - D_s(\mathrm{notill},\tau^\ast),\qquad
\Delta_{\mathrm{cons}}(s) = D_s(\mathrm{till}^\ast,\tau_{\mathrm{fast}}) - D_s(\mathrm{till}^\ast,\tau_{\mathrm{slow}}),}
```


*Provenance (Eq. 8.5):* **[Data-driven]**: differences of Daisy run-set E5 results.

**Eq. 8.6**: structure


```{=latex}
\fitmath{8.6}{\hat\Delta = a + b\,c,\qquad b = \frac{\sum_s (c_s - \bar c)(\Delta_s - \bar\Delta)}{\sum_s (c_s - \bar c)^2},\quad a = \bar\Delta - b\,\bar c .}
```


*Provenance (Eq. 8.6):* **[Data-driven]**: ordinary least squares applied to Daisy results.

**Eq. 8.7**: structure


```{=latex}
\fitmath{8.7}{z_p = k_p\,\Delta z,\qquad k_p = \min\Bigl\{k :\ \frac{\sum_{i\le k} U_i}{\sum_{i} U_i} \ge p\Bigr\},\qquad U_i=\sum_{d\in\text{year}}u_i(d),\quad p = 0.5,\ 0.9,}
```


*Provenance (Eq. 8.7):* **[Engineered]**: diagnostic defined for the workbench.

**Eq. 9.1**: mulch


```{=latex}
\fitmath{9.1}{\Delta E = E_{1.0} - E_{\varphi},\qquad
\Delta I = I_{1.0} - I_{\varphi},\qquad
\Delta D = D_{\varphi} - D_{1.0},}
```


*Provenance (Eq. 9.1):* **[Data-driven]**: differences and ratios of Daisy run-set E14 and E11 results.

**Eq. 9.2**: mulch


```{=latex}
\fitmath{9.2}{t_1 = \frac{Q_1 - q_0}{e_0},\qquad
e(t) = \begin{cases} e_0, & t \le t_1\\[3pt] \dfrac{e_0}{\sqrt{1 + (t - t_1)/\tau}}, & t > t_1\end{cases}}
```


*Provenance (Eq. 9.2):* **[Engineered]**: two-stage evaporation of the type described by Ritchie (1972) and Philip, with parameters chosen for the workbench.

**Eq. 9.3**: mulch


```{=latex}
\fitmath{9.3}{Q(t) = q_0 + \begin{cases} e_0\,t, & t \le t_1\\[3pt] (Q_1 - q_0) + 2\,e_0\,\tau\Bigl(\sqrt{1 + (t - t_1)/\tau} - 1\Bigr), & t > t_1\end{cases}}
```


*Provenance (Eq. 9.3):* **[Engineered]**: two-stage evaporation of the type described by Ritchie (1972) and Philip, with parameters chosen for the workbench.

**Eq. 9.4**: mulch


```{=latex}
\fitmath{9.4}{\ell(t) = \min\Bigl\{60,\ \frac{Q(t) - Q_1}{\Delta\theta}\Bigr\}\ \mathrm{mm}\quad (Q > Q_1),}
```


*Provenance (Eq. 9.4):* **[Engineered]**: drying-front geometry chosen for drawing.

**Eq. 9.5**: mulch


```{=latex}
\fitmath{9.5}{\log_{10}h(z) = \log_{10}h_s + \bigl(\log_{10}h_i - \log_{10}h_s\bigr)\bigl(1 - e^{-(z-\ell)/\lambda}\bigr)\quad (z \ge \ell),\qquad h = 10^{5}\ \mathrm{cm\ for}\ z<\ell.}
```


*Provenance (Eq. 9.5):* **[Engineered]**: drying-front geometry chosen for drawing.

**Eq. 9.6**: mulch


```{=latex}
\fitmath{9.6}{\begin{aligned}
\Delta E(\rho) &= E_{1.0}(\rho) - E_{\varphi^\ast}(\rho), & \Delta I(\rho) &= I_{1.0}(\rho) - I_{\varphi^\ast}(\rho),\\
\Delta D(\rho) &= D_{\varphi^\ast}(\rho) - D_{1.0}(\rho), & \Delta T(\rho) &= T_{\varphi^\ast}(\rho) - T_{1.0}(\rho),
\end{aligned}}
```


*Provenance (Eq. 9.6):* **[Data-driven]**: differences and ratios of Daisy run-set E14 and E11 results.

**Eq. 9.7**: mulch


```{=latex}
\fitmath{9.7}{f_I = \frac{\max\{\Delta I,0\}}{\max\{\Delta E,0.1\}},\ f_D = \frac{\max\{\Delta D,0\}}{\max\{\Delta E,0.1\}},\ f_T = \frac{\max\{\Delta T,0\}}{\max\{\Delta E,0.1\}},\ f_{\mathrm{rest}} = \max\{0,\ 1 - f_I - f_D - f_T\}.}
```


*Provenance (Eq. 9.7):* **[Data-driven]**: differences and ratios of Daisy run-set E14 and E11 results.

**Eq. 9.8**: mulch


```{=latex}
\fitmath{9.8}{\mathcal{I} = \frac{E - D}{\max\{1,\ E + D\}},\qquad
\text{regime} = \begin{cases}
\text{evaporation-dominated} & \mathcal I > +0.05\\
\text{drainage-dominated} & \mathcal I < -0.05\\
\text{on the boundary} & |\mathcal I|\le 0.05
\end{cases}}
```


*Provenance (Eq. 9.8):* **[Engineered]**: index defined for the workbench.

**Eq. 10.1**: loops


```{=latex}
\fitmath{10.1}{w_k = 5 + \mathrm{clip}(\mu_k;\,0,\,4).}
```


*Provenance (Eq. 10.1):* **[Engineered]**: drawing rule.

**Eq. 10.2**: loops


```{=latex}
\fitmath{10.2}{\kappa_{N} = \frac{N_L^{(\mathrm{rain\ step})} - N_L}{D^{(\mathrm{rain\ step})} - D} \quad [\mathrm{kg\ N\ ha^{-1}\ mm^{-1}}],}
```


*Provenance (Eq. 10.2):* **[Data-driven]**: one-step differences of Daisy results.

**Eq. 11.1**: surface


```{=latex}
\fitmath{11.1}{\begin{aligned}
\theta_{1500,t} &= -0.024\,S + 0.487\,C + 0.006\,\mathrm{OM} + 0.005\,S\,\mathrm{OM} - 0.013\,C\,\mathrm{OM} + 0.068\,S\,C + 0.031,\\
\theta_{1500} &= \theta_{1500,t} + \bigl(0.14\,\theta_{1500,t} - 0.02\bigr),\\
\theta_{33,t} &= -0.251\,S + 0.195\,C + 0.011\,\mathrm{OM} + 0.006\,S\,\mathrm{OM} - 0.027\,C\,\mathrm{OM} + 0.452\,S\,C + 0.299,\\
\theta_{33} &= \theta_{33,t} + \bigl(1.283\,\theta_{33,t}^{2} - 0.374\,\theta_{33,t} - 0.015\bigr),
\end{aligned}}
```


*Provenance (Eq. 11.1):* **[Literature]**: Saxton and Rawls (2006), implemented as written.

**Eq. 11.2**: surface


```{=latex}
\fitmath{11.2}{\begin{aligned}
\theta_{(S-33),t} &= 0.278\,S + 0.034\,C + 0.022\,\mathrm{OM} - 0.018\,S\,\mathrm{OM} - 0.027\,C\,\mathrm{OM} - 0.584\,S\,C + 0.078,\\
\theta_{(S-33)} &= \theta_{(S-33),t} + \bigl(0.636\,\theta_{(S-33),t} - 0.107\bigr),\qquad
\theta_{s} = \theta_{33} + \theta_{(S-33)} - 0.097\,S + 0.043,\\
B &= \frac{\ln 1500 - \ln 33}{\ln\theta_{33} - \ln\theta_{1500}},\qquad \lambda = \frac1B,\qquad
K_s = 1930\,(\theta_s - \theta_{33})^{\,3-\lambda}.
\end{aligned}}
```


*Provenance (Eq. 11.2):* **[Literature]**: Saxton and Rawls (2006), implemented as written.

**Eq. 11.3**: surface


```{=latex}
\fitmath{11.3}{\psi_f = \frac{10}{\alpha}\,\frac{0.046\,m + 2.07\,m^{2} + 19.5\,m^{3}}{1 + 4.7\,m + 16\,m^{2}}.}
```


*Provenance (Eq. 11.3):* **[Engineered]**: rational-polynomial approximation of a Rawls-type suction.

**Eq. 11.4**: surface


```{=latex}
\fitmath{11.4}{\theta_0 = \theta_{fc} - f_T\,(\theta_{fc} - \theta_{wp}),\qquad
\Delta\theta = \max\{0.05,\ 0.95\,\theta_s - \theta_0\}.}
```


*Provenance (Eq. 11.4):* **[Engineered]**: initial and wetted water contents chosen for the workbench.

**Eq. 11.5**: surface


```{=latex}
\fitmath{11.5}{F - \psi_f\,\Delta\theta\,\ln\!\Bigl(1 + \frac{F}{\psi_f\,\Delta\theta}\Bigr) = K_s\,\frac{t}{60}\quad(t\ \text{in min}),}
```


*Provenance (Eq. 11.5):* **[Literature]**: Green and Ampt (1911).

**Eq. 11.6**: surface


```{=latex}
\fitmath{11.6}{Z(\tau) = k\,\tau^{A}\qquad (Z\ \text{in m},\ \tau\ \text{in min}),}
```


*Provenance (Eq. 11.6):* **[Literature]**: Kostiakov (1932).

**Eq. 11.7**: surface


```{=latex}
\fitmath{11.7}{A = \frac{\sum (x_i - \bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2},\quad
\ln k = \bar y - A\,\bar x,\qquad x_i=\ln\tau_i,\ y_i=\ln\bigl(F(\tau_i)/1000\bigr),}
```


*Provenance (Eq. 11.7):* **[Literature]**: ordinary least squares on the log-log plot.

**Eq. 11.8**: surface


```{=latex}
\fitmath{11.8}{Q = \frac{1}{n}\,A\,R_h^{2/3}\,S^{1/2},\qquad R_h=\frac{A}{P}.}
```


*Provenance (Eq. 11.8):* **[Literature]**: Manning (1891).

**Eq. 11.9**: surface


```{=latex}
\fitmath{11.9}{Q\,t = \sigma_y\,A_0\,x + \sigma_z\,k\,t^{A}\,w\,x
\ \Longrightarrow\ x(t) = \frac{Q\,t}{\sigma_y A_0 + \sigma_z\,k\,t^{A}\,w}.}
```


*Provenance (Eq. 11.9):* **[Literature]**: volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3).

**Eq. 11.10**: surface


```{=latex}
\fitmath{11.10}{\sigma_z = \frac{A + r\,(1 - A) + 1}{(1 + A)(1 + r)},}
```


*Provenance (Eq. 11.10):* **[Literature]**: volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3).

**Eq. 11.11**: surface


```{=latex}
\fitmath{11.11}{r = \frac{\ln 2}{\ln (t_L / t_{L/2})},}
```


*Provenance (Eq. 11.11):* **[Literature]**: volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3).

**Eq. 11.12**: surface


```{=latex}
\fitmath{11.12}{t_x(x)=t_L\Bigl(\frac{x}{L}\Bigr)^{1/r}\quad\text{(given advance)},\qquad t_x(x)=c\,q^{-q_e}\,x^{x_e}\quad\text{(field advance)}.}
```


*Provenance (Eq. 11.12):* **[Engineered]**: alternative advance models set by worked examples and course notes.

**Eq. 11.13**: surface


```{=latex}
\fitmath{11.13}{t_L = (1 + 0.15\,A)\,\frac{A_0 L}{Q} + \Bigl(\frac{\sigma_F\,k\,w\,L}{Q}\Bigr)^{\frac{1}{1-A}},\qquad
\sigma_F = \frac{\pi A (1 - A)}{\sin(\pi A)},\qquad t_x(x) = t_{V}(x)\,\frac{t_L}{t_{V}(L)},}
```


*Provenance (Eq. 11.13):* **[Engineered]**: alternative advance models set by worked examples and course notes.

**Eq. 11.15**: surface


```{=latex}
\fitmath{11.15}{t_{st} = \Bigl(\frac{Z_n}{k}\Bigr)^{1/A}.}
```


*Provenance (Eq. 11.15):* **[Literature]**: inversion of the Kostiakov law.

**Eq. 11.16**: surface


```{=latex}
\fitmath{11.16}{t_{co} = \begin{cases}
t_L + t_{st} & \text{“}E_s=1\text{”: the tail receives exactly } Z_n\\
t_x(0.85\,L) + t_{st} & \text{“85 \% of L”}\\
t_{co}^{\,\mathrm{set}} & \text{“Manual”}
\end{cases}}
```


*Provenance (Eq. 11.16):* **[Engineered]**: cut-off rules chosen as design options.

**Eq. 11.17**: surface


```{=latex}
\fitmath{11.17}{Z(x) = k\,\bigl[t_{co} - t_x(x)\bigr]^{A},\quad Z_0 = k\,t_{co}^{A}\ (\text{inlet}),\qquad Z_L = k\,(t_{co}-t_L)^{A}\ (\text{tail}).}
```


*Provenance (Eq. 11.17):* **[Literature]**: standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997).

**Eq. 11.18**: surface


```{=latex}
\fitmath{11.18}{\begin{aligned}
V_{\mathrm{app}} &= Q\,t_{co}\quad\bigl(\text{with cutback } c_b<1:\ Q\,t_L + c_b\,Q\,(t_{co}-t_L)\bigr), & V_{\mathrm{req}} &= Z_n\,L\,w,\\
V_{\mathrm{inf}} &= w\!\int_0^L Z\,dx, & V_{\mathrm{st}} &= w\!\int_0^L \min(Z, Z_n)\,dx,\\
V_{\mathrm{dp}} &= w\!\int_0^L \max(Z-Z_n,0)\,dx, & V_{\mathrm{df}} &= w\!\int_0^L \max(Z_n - Z,0)\,dx,\\
V_{\mathrm{ro}} &= \max(V_{\mathrm{app}} - V_{\mathrm{inf}},\ 0).
\end{aligned}}
```


*Provenance (Eq. 11.18):* **[Literature]**: standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997).

**Eq. 11.19**: surface


```{=latex}
\fitmath{11.19}{E_a = \frac{V_{\mathrm{st}}}{V_{\mathrm{app}}},\quad
E_s = \frac{V_{\mathrm{st}}}{V_{\mathrm{req}}},\quad
\mathrm{DP} = \frac{V_{\mathrm{dp}}}{V_{\mathrm{app}}},\quad
\mathrm{RO} = \frac{V_{\mathrm{ro}}}{V_{\mathrm{app}}},\quad
\mathrm{CU} = 100\Bigl(1 - \frac{\tfrac{1}{N+1}\sum_{i=0}^{N}|Z_i-\bar Z|}{\bar Z}\Bigr)\ \%.}
```


*Provenance (Eq. 11.19):* **[Literature]**: standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997).

**Eq. 11.20**: surface


```{=latex}
\fitmath{11.20}{V_c(t) = w\sum_i k\,\bigl[\min(t,t_{co}) - \bar t_{x,i}\bigr]_{+}^{A}\,\Delta x\ \cdot s_c,\qquad
s_c = \frac{V_{\mathrm{inf}}}{V_c(t_{co})},\qquad I(t)=\frac{dV_c}{dt},}
```


*Provenance (Eq. 11.20):* **[Engineered]**: hydrograph shapes chosen for drawing; volume conserving.

**Eq. 11.21**: surface


```{=latex}
\fitmath{11.21}{R(t) = \frac{2V_s}{t_r}\Bigl(1 - \frac{t - t_{co}}{t_r}\Bigr),\quad t_{co}<t<t_{co}+t_r.}
```


*Provenance (Eq. 11.21):* **[Engineered]**: hydrograph shapes chosen for drawing; volume conserving.

**Eq. 11.22**: surface


```{=latex}
\fitmath{11.22}{q_{\max} = \min\Bigl\{q_{\max}^{\mathrm{sys}},\ \frac{0.04}{S}\cdot\frac{1000}{60}\Bigr\}\ \mathrm{L\,s^{-1}}\quad(S\ \text{in \%}),}
```


*Provenance (Eq. 11.22):* **[Engineered]**: search limit; the furrow stream limit follows Criddle et al. (1956).

**Eq. 11.23**: surface


```{=latex}
\fitmath{11.23}{\mathrm{score} = \min(E_a,1) - 3\max(0,\,0.8 - E_s) - 3\,[c_b<1]\,\max(0,\,0.05 - \mathrm{RO}) - 5\max(0,\,E_a-1).}
```


*Provenance (Eq. 11.23):* **[Engineered]**: optimisation score and seasonal bookkeeping chosen for the workbench.

**Eq. 11.24**: surface


```{=latex}
\fitmath{11.24}{\begin{aligned}
n_{\mathrm{ev}} &= \sum I\,/\,Z_n, & Z_g &= \frac{V_{\mathrm{app}}}{L\,w}\times1000\ \ (\mathrm{mm}), & Z_{\mathrm{season}} &= n_{\mathrm{ev}}\,Z_g,\\
N_{0M} &= \frac{Q_s}{q}, & N_{\mathrm{units}} &= \frac{W_f}{w},\quad N_{\mathrm{sets}}=\max\Bigl(1,\frac{N_{\mathrm{units}}}{N_{0M}}\Bigr), & T_{\mathrm{tot}} &= \frac{N_{\mathrm{sets}}\,t_{co}}{60}\ \ (\mathrm h),
\end{aligned}}
```


*Provenance (Eq. 11.24):* **[Engineered]**: optimisation score and seasonal bookkeeping chosen for the workbench.

**Eq. 12.1**: drip


```{=latex}
\fitmath{12.1}{Z_n = \min\bigl\{Z_{n}^{\mathrm{DSS}},\ \max(4,\ \mathrm{ET}_{\mathrm{pk}}\,\Delta t)\bigr\}\ \ \mathrm{mm},}
```


*Provenance (Eq. 12.1):* **[Engineered]**: depth and demand rules chosen for the workbench.

**Eq. 12.2**: drip


```{=latex}
\fitmath{12.2}{\mathrm{ET}_{\mathrm{pk}} = \mathrm{clip}\Bigl\{\max_d \tfrac15\sum_{j=0}^{4}\bigl(E_{d+j}+T_{d+j}\bigr);\ 2.5,\ 9\Bigr\}.}
```


*Provenance (Eq. 12.2):* **[Engineered]**: depth and demand rules chosen for the workbench.

**Eq. 12.3**: drip


```{=latex}
\fitmath{12.3}{h_{f,j} = \frac{10.67\,S_e\,Q_j^{1.852}}{C^{1.852}\,D^{4.871}},\qquad Q_j=\sum_{i\ge j+1} q_i\ \ (\mathrm{m^3\,s^{-1}}),\quad D\ \text{in m}.}
```


*Provenance (Eq. 12.3):* **[Literature]**: Hazen and Williams (1905).

**Eq. 12.4**: drip


```{=latex}
\fitmath{12.4}{q_j = q\Bigl(\frac{h_j}{H_0}\Bigr)^{x}\quad(\text{non-compensating; } h_j/H_0\ge0.01),}
```


*Provenance (Eq. 12.4):* **[Literature]**: Keller and Karmeli (1974) emitter law.

**Eq. 12.5**: drip


```{=latex}
\fitmath{12.5}{q_j = \begin{cases} q\bigl[1 + 0.04\,(h_j-H_0)/H_0\bigr], & h_j\ge H_{\min},\\[2pt] q\,\bigl(\max(h_j,0.1)/H_{\min}\bigr)^{0.5}, & h_j<H_{\min},\end{cases}}
```


*Provenance (Eq. 12.5):* **[Engineered]**: pressure-compensating emitter model with chosen constants.

**Eq. 12.6**: drip


```{=latex}
\fitmath{12.6}{\bar q = \frac{1}{N+1}\sum_{j=0}^{N} q_j,\qquad q_{\min}=\min_j q_j,\qquad
Q_{\mathrm{lat}} = \frac{N\,\bar q}{3600}\ \ (\mathrm{L\,s^{-1}}),}
```


*Provenance (Eq. 12.6):* **[Literature]**: definitions of mean and minimum discharge.

**Eq. 12.7**: drip


```{=latex}
\fitmath{12.7}{E_u = \mathrm{clip}\Bigl\{\Bigl(1 - \frac{1.27\,c_v}{\sqrt{n_e}}\Bigr)\frac{q_{\min}}{\bar q};\ 0.3,\ 1\Bigr\}.}
```


*Provenance (Eq. 12.7):* **[Literature]**: Keller and Karmeli (1974).

**Eq. 12.8**: drip


```{=latex}
\fitmath{12.8}{\sigma_q = \sqrt{c_v^{2} + \sigma_P^{2}},\qquad
\sigma_P^{2} = \frac{1}{N+1}\sum_{j=0}^{N}\Bigl(\frac{q_j}{\bar q}-1\Bigr)^{2}.}
```


*Provenance (Eq. 12.8):* **[Engineered]**: combined spread chosen to drive the bulb quantiles.

**Eq. 12.9**: drip


```{=latex}
\fitmath{12.9}{\Delta\theta = \max\{0.03,\ f_T\,(\theta_{fc}-\theta_{wp})\}.}
```


*Provenance (Eq. 12.9):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.10**: drip


```{=latex}
\fitmath{12.10}{\rho(z) = r\,\sqrt{1 - \zeta^{2}},\qquad
\zeta = \begin{cases} (z - z_d)/(a\,r), & z\ge z_d,\\ (z_d - z)/(u\,r), & z<z_d,\end{cases}\qquad \rho=0\ \text{for}\ |\zeta|\ge1.}
```


*Provenance (Eq. 12.10):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.11**: drip


```{=latex}
\fitmath{12.11}{a = \mathrm{clip}\Bigl\{\Bigl[0.7 + 1.6\Bigl(\frac{K_s}{K_s+15}\Bigr)^{1.1}\Bigr]\sqrt{\mathrm{clip}\bigl(2/q;\ 0.7,\ 1.4\bigr)};\ 0.75,\ 2.4\Bigr\}}
```


*Provenance (Eq. 12.11):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.12**: drip


```{=latex}
\fitmath{12.12}{V_w = \int \pi\,\rho(z)^{2}\,dz,}
```


*Provenance (Eq. 12.12):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.13**: drip


```{=latex}
\fitmath{12.13}{P_w = \mathrm{clip}\Bigl\{\frac{2r}{1000\,S_l};\ 0,\ 1\Bigr\}.}
```


*Provenance (Eq. 12.13):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.14**: drip


```{=latex}
\fitmath{12.14}{V_{\mathrm{dp}}^{(1)} = V\,\frac{\int_{z>R_{\max}}\pi\rho^{2}\,dz}{V_w},}
```


*Provenance (Eq. 12.14):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.15**: drip


```{=latex}
\fitmath{12.15}{V_{\mathrm{ev}} = \min\bigl\{0.5\,V,\ \pi\rho(0)^{2}\cdot10^{-6}\cdot 2E_0\bigr\}\quad(\text{L},\ \text{area in m}^{2},\ E_0\ \text{in mm d}^{-1}),}
```


*Provenance (Eq. 12.15):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Eq. 12.16**: drip


```{=latex}
\fitmath{12.16}{V_i = \max\bigl\{0.02\,\bar V,\ \bar V\,(1+\sigma_q z_i)\bigr\},\qquad \bar V=\bar q\,t,}
```


*Provenance (Eq. 12.16):* **[Engineered]**: five-quantile delivery and run-time rules chosen for the workbench.

**Eq. 12.17**: drip


```{=latex}
\fitmath{12.17}{V_{\mathrm{req}} = Z_n\,S_e\,S_l\ \ (\mathrm L),\qquad
V_{\mathrm{st},i}=\min\{V_{\mathrm{root},i},\ V_{\mathrm{req}}\},\qquad V_{\mathrm{ex},i} = V_{\mathrm{root},i}-V_{\mathrm{st},i}.}
```


*Provenance (Eq. 12.17):* **[Literature]**: definition of the requirement over the area served by one emitter.

**Eq. 12.18**: drip


```{=latex}
\fitmath{12.18}{t = \mathrm{clip}\Bigl\{\frac{V_{\mathrm{req}}}{\bar q\,E_u};\ 0.05,\ 96\Bigr\}\ \ \mathrm h.}
```


*Provenance (Eq. 12.18):* **[Engineered]**: five-quantile delivery and run-time rules chosen for the workbench.

**Eq. 12.19**: drip


```{=latex}
\fitmath{12.19}{E_a = \frac{\langle V_{\mathrm{st}}\rangle}{\langle V\rangle},\quad
E_s = \frac{\langle V_{\mathrm{st}}\rangle}{V_{\mathrm{req}}},\quad
\mathrm{DP} = \frac{\langle V_{\mathrm{dp}}^{(1)}+V_{\mathrm{ex}}\rangle}{\langle V\rangle},\quad
\mathrm{EV} = \frac{\langle V_{\mathrm{ev}}\rangle}{\langle V\rangle},\quad
Z_{\mathrm{gross}}=\frac{\bar V}{S_eS_l},}
```


*Provenance (Eq. 12.19):* **[Engineered]**: five-quantile delivery and run-time rules chosen for the workbench.

**Eq. 12.20**: drip


```{=latex}
\fitmath{12.20}{W_f=\frac{10^{4}A_f}{L_L},\quad N_L=\Bigl\lfloor \frac{W_f}{S_l}\Bigr\rfloor,\quad
n_{\mathrm{zone}}=\Bigl\lceil \frac{N_L\,Q_{\mathrm{lat}}}{Q_s}\Bigr\rceil,\quad
n_{l}=\Bigl\lceil\frac{N_L}{n_{\mathrm{zone}}}\Bigr\rceil,\quad Q_z=n_l\,Q_{\mathrm{lat}},}
```


*Provenance (Eq. 12.20):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

**Eq. 12.21**: drip


```{=latex}
\fitmath{12.21}{D\in\{32,40,50,63,75,90,110,125,160,200,250,315\}\ \mathrm{mm}}
```


*Provenance (Eq. 12.21):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

**Eq. 12.22**: drip


```{=latex}
\fitmath{12.22}{h_{f,sm}=0.4\,\frac{10.67\,L_{sm}\,Q_z^{1.852}}{C^{1.852}D_{sm}^{4.871}},\qquad
h_{f,m}=\frac{10.67\,L_m\,Q_z^{1.852}}{C^{1.852}D_m^{4.871}}.}
```


*Provenance (Eq. 12.22):* **[Engineered]**: Christiansen-type reduction with a chosen factor 0.4.

**Eq. 12.23**: drip


```{=latex}
\fitmath{12.23}{\mathrm{TDH} = z_{\mathrm{lift}} + H_0 + h_{f,sm} + h_{f,m} + 9\ \mathrm m,\qquad
P = \frac{\rho g\,Q_z\,\mathrm{TDH}}{\eta} = \frac{9.81\,(Q_z/1000)\,\mathrm{TDH}}{0.65}\ \ \mathrm{kW}.}
```


*Provenance (Eq. 12.23):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

**Eq. 12.24**: drip


```{=latex}
\fitmath{12.24}{n_{\mathrm{ev}}=\frac{y_I}{Z_n},\quad
Z_{\mathrm{season}} = n_{\mathrm{ev}}\,Z_{\mathrm{gross}},\quad
q_{ha}=\frac{q}{3600}\,\frac{10^{4}}{S_eS_l}\ \ (\mathrm{L\,s^{-1}\,ha^{-1}}),}
```


*Provenance (Eq. 12.24):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

**Eq. 12.25**: drip


```{=latex}
\fitmath{12.25}{n_{\mathrm{set}}=\Bigl\lceil \frac{q_{ha}A_f}{Q_s}\Bigr\rceil,\qquad
t_{\mathrm{round}}=n_{\mathrm{set}}\,t,\qquad
H_{\mathrm{pump}}=n_{\mathrm{ev}}\,t_{\mathrm{round}},\qquad
E_{\mathrm{kWh}}=H_{\mathrm{pump}}\,P.}
```


*Provenance (Eq. 12.25):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

**Eq. 12.26**: drip


```{=latex}
\fitmath{12.26}{\mathrm{score} = \min(E_a,1) - 2.5\,\max(0,\ 0.9 - E_s),}
```


*Provenance (Eq. 12.26):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

**Eq. 13.1**: sprinkler


```{=latex}
\fitmath{13.1}{S_{d}^{\mathrm{eff}} = \frac{\max(0,S_d)}{1+0.25\,S}\qquad(S\ \text{in \%}).}
```


*Provenance (Eq. 13.1):* **[Engineered]**: depression storage reduction with slope.

**Eq. 13.2**: sprinkler


```{=latex}
\fitmath{13.2}{q = 0.95\,A_n\sqrt{2g\,h}\times6\times10^{4}\ \ (\mathrm{L\,min^{-1}}),\qquad A_n=\pi\Bigl(\frac{d}{2000}\Bigr)^{2}\ \mathrm{m^2},}
```


*Provenance (Eq. 13.2):* **[Literature]**: Torricelli orifice equation.

**Eq. 13.3**: sprinkler


```{=latex}
\fitmath{13.3}{R = c_R\sqrt{d\,h}\;f_\alpha(\alpha),\qquad
f_\alpha(\alpha)=\Bigl[\frac{\max\{0.05,\ \sin(3.1\,\alpha)\}}{0.9763}\Bigr]^{0.45},}
```


*Provenance (Eq. 13.3):* **[Engineered]**: range law of the Keller and Bliesner (1990) form; the impact coefficient 1.35 is the published value and is verified against their worked example (Paper 3); the coefficients of the other types and the angle function are chosen.

**Eq. 13.4**: sprinkler


```{=latex}
\fitmath{13.4}{\hat p(x)=\begin{cases}
1-x^{m}, & \text{impact } (m=1.3),\ \text{gun } (m=1),\\
(0.5+0.5x)(1-x^{6}), & \text{rotating spray (ring)},\\
(0.55+0.45x)(1-x^{5}), & \text{micro-sprinkler (ring-2)},
\end{cases}\qquad \hat p=0\ \text{for}\ x\ge1.}
```


*Provenance (Eq. 13.4):* **[Engineered]**: pattern and wind shapes chosen to reproduce published qualitative patterns.

**Eq. 13.5**: sprinkler


```{=latex}
\fitmath{13.5}{R_e(\theta)=R\,\mathrm{clip}\{1+0.022\,u\cos\theta;\ 0.7,\ 1.4\},\qquad \text{shift}=0.03\,u\,R,}
```


*Provenance (Eq. 13.5):* **[Engineered]**: pattern and wind shapes chosen to reproduce published qualitative patterns.

**Eq. 13.6**: sprinkler


```{=latex}
\fitmath{13.6}{a(x,y) = \sum_{i,j} p\bigl(x-x_{ij},\,y-y_{ij}\bigr)\quad(\mathrm{mm\,min^{-1}}),\qquad
\bar a=\frac1n\sum_k a_k,}
```


*Provenance (Eq. 13.6):* **[Literature]**: overlap by superposition of single-sprinkler patterns.

**Eq. 13.7**: sprinkler


```{=latex}
\fitmath{13.7}{\mathrm{CU}=1-\frac{\sum_k |a_k-\bar a|}{n\,\bar a}.}
```


*Provenance (Eq. 13.7):* **[Literature]**: Christiansen (1942).

**Eq. 13.8**: sprinkler


```{=latex}
\fitmath{13.8}{w_d=\frac{1}{100}\,\mathrm{clip}\Bigl\{\bigl(1.2+0.5u+0.04u^{2}\bigr)\,F\Bigl(\frac{P}{250}\Bigr)^{0.7}\bigl[1+0.025\,(T_a-20)\bigr]\Bigl[0.6+0.4\,\frac{\sin\alpha}{0.4226}\Bigr];\ 0.5,\ 45\Bigr\}.}
```


*Provenance (Eq. 13.8):* **[Engineered]**: loss and ponding rules chosen for the workbench.

**Eq. 13.9**: sprinkler


```{=latex}
\fitmath{13.9}{t_p=\Bigl(\frac aK\Bigr)^{1/(A-1)},\qquad
F=\begin{cases}\mathrm{sup}, & T\le t_p\\ K\,T^{A}, & T>t_p\end{cases}\qquad
R=\mathrm{sup}-F,\quad \mathrm{RO}=\max(0,R-S_d^{\mathrm{eff}}),\quad I=\mathrm{sup}-\mathrm{RO}.}
```


*Provenance (Eq. 13.9):* **[Engineered]**: loss and ponding rules chosen for the workbench.

**Eq. 13.10**: sprinkler


```{=latex}
\fitmath{13.10}{I_c=\min\{I,\ I_{\mathrm{int}}\},\qquad I_{\mathrm{int}} = 0.6\,\mathrm{CAP}\,[\mathrm{VFF}<0.95] + 1.2\,\mathrm{LAI}_{\mathrm{live}},}
```


*Provenance (Eq. 13.10):* **[Engineered]**: loss and ponding rules chosen for the workbench.

**Eq. 13.11**: sprinkler


```{=latex}
\fitmath{13.11}{\begin{aligned}
E_a &= \frac{\overline{\min(Z_k,Z_n)}}{\mathrm{gross}}, & E_s &= \frac{\overline{\min(Z_k,Z_n)}}{Z_n}, & \mathrm{DU}&=\frac{\overline{Z}_{25}}{\overline{Z}},\\
\mathrm{DP} &= \frac{\overline{\max(Z_k-Z_n,0)}}{\mathrm{gross}}, & \mathrm{RO}&=\frac{\overline{\mathrm{RO}_k}}{\mathrm{gross}}, & \mathrm{WD}&=w_d+\frac{\overline{I_c}}{\mathrm{gross}},
\end{aligned}}
```


*Provenance (Eq. 13.11):* **[Literature]**: efficiency and distribution uniformity of Merriam and Keller (1978).

**Eq. 13.12**: sprinkler


```{=latex}
\fitmath{13.12}{T=\min\{T:\ \overline{Z}_{25}(T)\ge Z_n\},\qquad T\in[1,\,2400]\ \mathrm{min},}
```


*Provenance (Eq. 13.12):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

**Eq. 13.13**: sprinkler


```{=latex}
\fitmath{13.13}{k=\begin{cases}1,&W\le5.5\\0.9,&5.5<W\le13\\0.8,&13<W\le22\\0.7,&W>22.\end{cases}}
```


*Provenance (Eq. 13.13):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

**Eq. 13.14**: sprinkler


```{=latex}
\fitmath{13.14}{S_s\le k\,R_w,\qquad S_l\le1.5\,R_w,\qquad
L_y=\frac{10^{4}A_f}{L_x},\quad N=\lfloor L_x/S_s\rfloor,\quad N_m=\lfloor L_y/S_l\rfloor,}
```


*Provenance (Eq. 13.14):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

**Eq. 13.15**: sprinkler


```{=latex}
\fitmath{13.15}{t_{\mathrm{set}}=\frac{Z_{\mathrm{gross}}}{\mathrm{AR}}\ \ (\mathrm h),\qquad
n_{\mathrm{sets/day}}=\Bigl\lfloor\frac{h_{\mathrm{op}}}{t_{\mathrm{set}}}\Bigr\rfloor,\qquad T_{\mathrm{int}}=\max\Bigl(1,\Bigl\lfloor\frac{Z_n}{\mathrm{ET}_{\mathrm{pk}}}\Bigr\rfloor\Bigr)\ \mathrm{days},}
```


*Provenance (Eq. 13.15):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

**Eq. 13.16**: sprinkler


```{=latex}
\fitmath{13.16}{N_d(n)=\Bigl\lceil\frac{N_m}{n\,n_{\mathrm{sets/day}}}\Bigr\rceil,\qquad Q_{\mathrm{in}}(n)=n\,N\,q_h,}
```


*Provenance (Eq. 13.16):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

**Eq. 13.17**: sprinkler


```{=latex}
\fitmath{13.17}{J=\frac{0.472\,Q^{1.75}}{D^{4.75}}\ \ (\mathrm{m\,m^{-1}};\ Q\ \text{in L h}^{-1},\ D\ \text{in mm}),}
```


*Provenance (Eq. 13.17):* **[Literature]**: Blasius friction law for smooth pipe.

**Eq. 13.18**: sprinkler


```{=latex}
\fitmath{13.18}{h_{f,\mathrm{lat}}=1.1\,F\,J(Q_L,D)\,\bigl(L_x-S_s/2\bigr)\le0.2\,h_s,\qquad Q_L=1000\,N\,q_h,}
```


*Provenance (Eq. 13.18):* **[Literature]**: 20 % rule of Keller and Bliesner (1990).

**Eq. 13.19**: sprinkler


```{=latex}
\fitmath{13.19}{H_{\mathrm{man}} = z_{\mathrm{lift}} + J\,L_{\mathrm{conv}} + J\,L_{\mathrm{main}} + h_s + 0.75\,h_{f,\mathrm{lat}},}
```


*Provenance (Eq. 13.19):* **[Engineered]**: head and sets bookkeeping.

**Eq. 13.20**: sprinkler


```{=latex}
\fitmath{13.20}{P_{\mathrm{CV}} = \frac{1000\,(Q_m/3.6\times10^{6})\,H_{\mathrm{man}}}{75\,\eta},\quad \eta=0.75,\qquad P_{\mathrm{kW}}=0.7355\,P_{\mathrm{CV}},}
```


*Provenance (Eq. 13.20):* **[Literature]**: hydraulic power definition.

**Eq. 13.21**: sprinkler


```{=latex}
\fitmath{13.21}{N_L=\Bigl\lfloor\frac{10^4A_f/L_L}{S_l}\Bigr\rfloor,\quad
n_l=\min\Bigl(N_L,\ \Bigl\lfloor\frac{Q_s}{Q_{\mathrm{lat}}}\Bigr\rfloor\Bigr),\quad
n_{\mathrm{set}}=\Bigl\lceil\frac{N_L}{n_l}\Bigr\rceil,\quad Q_z=n_l Q_{\mathrm{lat}}.}
```


*Provenance (Eq. 13.21):* **[Engineered]**: head and sets bookkeeping.

**Eq. 13.22**: sprinkler


```{=latex}
\fitmath{13.22}{F_m=\frac1{2.852}+\frac1{2N_s}+\frac{\sqrt{0.852}}{6N_s^{2}},\qquad h_{f,\mathrm{lat}}=F_m\,h_{HW}(Q_{\mathrm{lat}},D,L_L),}
```


*Provenance (Eq. 13.22):* **[Literature]**: Christiansen reduction factor with Hazen-Williams exponent.

**Eq. 13.23**: sprinkler


```{=latex}
\fitmath{13.23}{n_{\mathrm{ev}}=\frac{y_I}{Z_n},\qquad n_{\mathrm{sp}}=\mathrm{round}\Bigl(\frac{10^{4}A_f}{S_sS_l}\Bigr),\qquad
Q_{\mathrm{tot}}=\frac{n_{\mathrm{sp}}\,q}{60},\qquad n_{\mathrm{set}}=\Bigl\lceil\frac{Q_{\mathrm{tot}}}{Q_s}\Bigr\rceil,\qquad t_{\mathrm{round}}=\frac{n_{\mathrm{set}}\,T}{60}\ \mathrm h.}
```


*Provenance (Eq. 13.23):* **[Engineered]**: head and sets bookkeeping.

**Eq. 14.1**: dashboard


```{=latex}
\fitmath{14.1}{\mathrm{Rain}=P_k,\quad \mathrm{Irr}=I_k,\quad \mathrm{Evap}=E_k,\quad \mathrm{Transp}=T_k,\quad \mathrm{Drain}=D_k\ \ (\mathrm{mm\,d^{-1}}).}
```


*Provenance (Eq. 14.1):* **[Engineered]**: bookkeeping of Engine 2 series.

**Eq. 14.2**: dashboard


```{=latex}
\fitmath{14.2}{\Sigma X=\sum_{j=1}^{N}X_{k+j},\qquad X\in\{P,I,E,T,D\}.}
```


*Provenance (Eq. 14.2):* **[Engineered]**: bookkeeping of Engine 2 series.

**Eq. 14.3**: dashboard


```{=latex}
\fitmath{14.3}{\Delta S=P+I-E_{\mathrm{int}}-E-T-D,}
```


*Provenance (Eq. 14.3):* **[Literature]**: water-balance identity.

**Eq. 14.4**: dashboard


```{=latex}
\fitmath{14.4}{\Delta_i=x_i-x_i^{\mathrm{pin}},}
```


*Provenance (Eq. 14.4):* **[Engineered]**: bookkeeping of Engine 2 series.

**Eq. 14.5**: dashboard


```{=latex}
\fitmath{14.5}{Y^{(y)}=\sum_{d\in y}X_d,\qquad X\in\{P,I,D,E,T\}.}
```


*Provenance (Eq. 14.5):* **[Engineered]**: bookkeeping of Engine 2 series.


