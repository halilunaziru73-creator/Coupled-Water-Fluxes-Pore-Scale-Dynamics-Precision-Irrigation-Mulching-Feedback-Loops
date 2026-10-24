\appendix

# Symbols and units {-}

Table A.1. Symbols used in this manual, grouped by chapter of first use. Units are SI-derived as shown; $[\,-\,]$ is dimensionless.

| Symbol | Meaning | Unit |
|:--|:--|:--|
| $\theta$, $\theta_r$, $\theta_s$ | Volumetric water content; residual; saturated | m$^3$ m$^{-3}$ |
| $\theta_{fc}$, $\theta_{wp}$ | Water content at field capacity; at wilting point | m$^3$ m$^{-3}$ |
| $h$, $\psi$ | Soil-water suction (positive); matric potential | cm; kPa |
| $\alpha$, $n$, $m$ | van Genuchten parameters ($m=1-1/n$) | cm$^{-1}$, [–], [–] |
| $K_s$, $K(h)$ | Saturated and unsaturated hydraulic conductivity | mm h$^{-1}$ |
| $\mathrm{AWC}$ | Plant-available water capacity | mm cm$^{-1}$ |
| $f$, $f_T$ | Relative depletion of the sensor layer; trigger depletion | [–] |
| $R_{\max}$, $R_d$ | Maximum and present rooting depth | cm |
| $P$, $I$, $E$, $T$, $D$ | Rain, irrigation, soil evaporation, transpiration, drainage | mm d$^{-1}$ or mm a$^{-1}$ |
| $E_0$ | Atmospheric evaporative demand | mm d$^{-1}$ |
| $\mathrm{ET}_{\mathrm{pk}}$ | Peak 5-day mean of $E+T$ | mm d$^{-1}$ |
| $k_t$ | Calibrated transpiration coefficient of Engine 2 | [–] |
| $Z_n$ | Required (net) depth per irrigation | mm |
| $Z(\tau)$, $F(t)$ | Cumulative infiltration (Kostiakov; Green–Ampt) | mm |
| $k$, $A$ | Kostiakov intake constants | mm min$^{-A}$; [–] |
| $\psi_f$ | Wetting-front suction | mm |
| $L$, $S$, $w$, $n$ | Field length; slope; spacing or width; Manning roughness | m; %; m; s m$^{-1/3}$ |
| $q$, $Q$ | Unit and total inflow | L s$^{-1}$ m$^{-1}$, L s$^{-1}$ |
| $t_x$, $t_L$, $t_{co}$, $\tau$ | Advance time; time to end; cut-off time; opportunity time | min |
| $\sigma_y$, $\sigma_z$ | Surface and subsurface shape factors | [–] |
| $E_a$, $E_s$ | Application and storage efficiency | [–] or % |
| $\mathrm{DP}$, $\mathrm{RO}$, $\mathrm{WD}$ | Deep percolation, runoff, wind drift and interception fractions | [–] |
| $\mathrm{CU}$, $\mathrm{DU}$, $E_u$ | Christiansen uniformity; distribution uniformity; emission uniformity | [–] or % |
| $S_e$, $S_l$, $L_L$, $H_0$, $D$ | Emitter spacing; lateral spacing; lateral length; inlet head; inside diameter | m, m, m, m, mm |
| $c_v$, $x$ | Emitter coefficient of variation; flow exponent | [–] |
| $r$, $a$, $u$ | Bulb radius; aspect ratio; upper semi-axis ratio | mm, [–], [–] |
| $d$, $P$, $h_s$, $R$ | Nozzle diameter; pressure; pressure head; wetted radius | mm, kPa, m, m |
| $S_s$, $S_l$ | Sprinkler spacing along and between laterals | m |
| $u$ | Wind speed | m s$^{-1}$ |
| $\mathrm{AR}$ | Mean gross application rate | mm h$^{-1}$ |
| $C$ | Hazen–Williams roughness coefficient | [–] |
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

The annual meta-model (Engine 1) is built on the following Daisy 7.1 run sets of the study (Chapter 5, Table 5.1): E2, E3, E4, E5 (300 runs), E7, E11, E13 and E14. The study as a whole comprises 10,190 simulation runs in 17 experiments, available from the project repository (`Results/` and `Software/` folders). The 20-year weather record (1980–1999) is the baseline of the study; the projections to 2100 are analogue-year scenarios (Chapter 4).

# Provenance ledger of the numbered equations {-}

All 134 numbered equations are labelled in the text and listed here: 38 **[Literature]**, 18 **[Data-driven]** and 78 **[Engineered]**. A **[Literature]** label means the relation is the published one; it does not mean that SWAFL has been validated in the field. The surface, drip and sprinkler design relations marked in Paper 3 were tested against published worked examples; nothing has been tested against field measurements.

| Eq. | Label | Basis |
|:-:|:--|:--|
| 4.1 | Engineered | calendar bookkeeping and choice of analogue year; no physical law |
| 4.2 | Engineered | calendar bookkeeping and choice of analogue year; no physical law |
| 5.1 | Literature | van Genuchten (1980) |
| 5.2 | Literature | Mualem (1976) with van Genuchten (1980) |
| 5.3 | Literature | standard definition of plant-available water between field capacity and wilting point |
| 5.4 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
| 5.5 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
| 5.6 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
| 5.7 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
| 5.8 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
| 5.9 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
| 5.10 | Data-driven | ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits |
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
| 8.4 | Literature | Young--Laplace (Jurin) capillary law |
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
| 11.7 | Literature | ordinary least squares on the log--log plot |
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
| 13.22 | Literature | Christiansen reduction factor with Hazen--Williams exponent |
| 13.23 | Engineered | head and sets bookkeeping |
| 14.1 | Engineered | bookkeeping of Engine 2 series |
| 14.2 | Engineered | bookkeeping of Engine 2 series |
| 14.3 | Literature | water-balance identity |
| 14.4 | Engineered | bookkeeping of Engine 2 series |
| 14.5 | Engineered | bookkeeping of Engine 2 series |

# References {-}

Abrahamsen, P., and Hansen, S. (2000). Daisy: an open soil-crop-atmosphere system model. *Environmental Modelling & Software* 15(3), 313–330.

Allen, R. G., Pereira, L. S., Raes, D., and Smith, M. (1998). *Crop evapotranspiration: guidelines for computing crop water requirements*. FAO Irrigation and Drainage Paper 56. FAO, Rome.

Blasius, H. (1913). Das Ähnlichkeitsgesetz bei Reibungsvorgängen in Flüssigkeiten. *Forschungsarbeiten auf dem Gebiete des Ingenieurwesens* 131.

Burt, C. M., Clemmens, A. J., Strelkoff, T. S., Solomon, K. H., Bliesner, R. D., Hardy, L. A., Howell, T. A., and Eisenhauer, D. E. (1997). Irrigation performance measures: efficiency and uniformity. *Journal of Irrigation and Drainage Engineering* 123(6), 423–442.

Carsel, R. F., and Parrish, R. S. (1988). Developing joint probability distributions of soil water retention characteristics. *Water Resources Research* 24(5), 755–769.

Christiansen, J. E. (1942). *Irrigation by sprinkling*. University of California Agricultural Experiment Station Bulletin 670.

Criddle, W. D., Davis, S., Pair, C. H., and Shockley, D. G. (1956). *Methods for evaluating irrigation systems*. USDA Soil Conservation Service, Agriculture Handbook 82.

Elliott, R. L., and Walker, W. R. (1982). Field evaluation of furrow infiltration and advance functions. *Transactions of the ASAE* 25(2), 396–400.

Green, W. H., and Ampt, G. A. (1911). Studies on soil physics: 1. The flow of air and water through soils. *Journal of Agricultural Science* 4(1), 1–24.

Hazen, A., and Williams, G. S. (1905). *Hydraulic tables*. John Wiley & Sons, New York.

Hillel, D. (1998). *Environmental soil physics*. Academic Press, San Diego.

Jurin, J. (1718). An account of some experiments shown before the Royal Society; with an enquiry into the cause of the ascent and suspension of water in capillary tubes. *Philosophical Transactions* 30(355), 739–747.

Keller, J., and Bliesner, R. D. (1990). *Sprinkle and trickle irrigation*. Van Nostrand Reinhold, New York.

Keller, J., and Karmeli, D. (1974). Trickle irrigation design parameters. *Transactions of the ASAE* 17(4), 678–684.

Kostiakov, A. N. (1932). On the dynamics of the coefficient of water-percolation in soils and on the necessity of studying it from a dynamic point of view for purposes of amelioration. *Transactions of the 6th Committee of the International Society of Soil Science*, Part A, 17–21.

Manning, R. (1891). On the flow of water in open channels and pipes. *Transactions of the Institution of Civil Engineers of Ireland* 20, 161–207.

Merriam, J. L., and Keller, J. (1978). *Farm irrigation system evaluation: a guide for management*. Utah State University, Logan.

Mualem, Y. (1976). A new model for predicting the hydraulic conductivity of unsaturated porous media. *Water Resources Research* 12(3), 513–522.

Nobel, P. S. (2009). *Physicochemical and environmental plant physiology*, 4th ed. Academic Press, Amsterdam.

Philip, J. R. (1957). Evaporation, and moisture and heat fields in the soil. *Journal of Meteorology* 14(4), 354–366.

Ritchie, J. T. (1972). Model for predicting evaporation from a row crop with incomplete cover. *Water Resources Research* 8(5), 1204–1213.

Saxton, K. E., and Rawls, W. J. (2006). Soil water characteristic estimates by texture and organic matter for hydrologic solutions. *Soil Science Society of America Journal* 70(5), 1569–1578.

van den Honert, T. H. (1948). Water transport in plants as a catenary process. *Discussions of the Faraday Society* 3, 146–153.

van Genuchten, M. Th. (1980). A closed-form equation for predicting the hydraulic conductivity of unsaturated soils. *Soil Science Society of America Journal* 44(5), 892–898.

Walker, W. R., and Skogerboe, G. V. (1987). *Surface irrigation: theory and practice*. Prentice-Hall, Englewood Cliffs, NJ.


# Equation reference {-}

This appendix prints every numbered equation of the program in full, in the order of the chapters, with its provenance and the layers of the program that draw on it. The equations added in version 1.1 (Eqs. 5.12a, 6.4a and those of Chapters 14, 18–23) are printed in their chapters.

{{EQREF}}
