# The tested parameters {#daisy-params}

Thirty two parameters of the Daisy reference are run by the workbench. Each was tested with the Daisy program before it was offered, and its default is the value of the program.

## Irrigation subsoil permanent of Bioclimate

Long term irrigation below soil surface.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | irrigation subsoil permanent |
| Type | number |
| Unit | mm/h |
| Default | 0 |
| Sensitivity run | no |

## Litter water storage of Bioclimate

Intercepted water on litter.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | litter water storage |
| Type | number |
| Unit | mm |
| Default | 0 |
| Sensitivity run | no |

## Noofintervals of Bioclimate

Number of vertical intervals in which we partition the canopy.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | NoOfIntervals |
| Type | integer |
| Unit | n/a |
| Default | 30 |
| Sensitivity run | yes |

## Canopy water storage of Bioclimate

Intercepted water on canopy.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | canopy water storage |
| Type | number |
| Unit | mm |
| Default | 0 |
| Sensitivity run | no |

## Max svat iterations of Bioclimate

Max number of svat iterations before giving up on cobvergence.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | max svat iterations |
| Type | integer |
| Unit | n/a |
| Default | 100 |
| Sensitivity run | no |

## Max svat absolute difference of Bioclimate

Maximum absolute difference in svat ea values for convergence.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | max svat absolute difference |
| Type | number |
| Unit | mm/h |
| Default | 0.01 |
| Sensitivity run | no |

## Maxtdiff of Bioclimate

Largest temperature difference for convergence. 19.1. BASE                                                                       111

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | maxTdiff |
| Type | number |
| Unit | K |
| Default | 0.02 |
| Sensitivity run | no |

## Maxediff of Bioclimate

Largest humidity difference for convergence.

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | maxEdiff |
| Type | number |
| Unit | Pa |
| Default | 1 |
| Sensitivity run | no |

## Min sun angle of Bioclimate

Minimum sun angle above ground for some 'raddist' and 'svat' models. The 'DPF' raddist model will zero radiation if the angle is below this, and the

| Item | Value |
|:--|:--|
| Topic | 19 |
| Component | Bioclimate |
| Key | min sun angle |
| Type | number |
| Unit | rad |
| Default | 0.0628319 |
| Sensitivity run | no |

## Max sink total of Chemistry

Maximum allowed sink term as a fraction of total content. If variable timesteps are enabled, Daisy will try to scale down the timestep in

| Item | Value |
|:--|:--|
| Topic | 24 |
| Component | Chemistry |
| Key | max sink total |
| Type | number |
| Unit | dimensionless |
| Default | 0.5 |
| Sensitivity run | no |

## Max sink solute of Chemistry

Maximum allowed sink term as a fraction of solute content. If variable timesteps are enabled, Daisy will try to scale down the timestep

| Item | Value |
|:--|:--|
| Topic | 24 |
| Component | Chemistry |
| Key | max sink solute |
| Type | number |
| Unit | dimensionless |
| Default | 0.9 |
| Sensitivity run | no |

## Max sink secondary of Chemistry

Maximum allowed sink term as a fraction of secondary domain content. If variable timesteps are enabled, Daisy will try to scale down the timestep

| Item | Value |
|:--|:--|
| Topic | 24 |
| Component | Chemistry |
| Key | max sink secondary |
| Type | number |
| Unit | dimensionless |
| Default | 1.5 |
| Sensitivity run | no |

## Min sink total of Chemistry

24.9. NONE                                                                     147 Always allow this fraction of total content to be removed by sink term.

| Item | Value |
|:--|:--|
| Topic | 24 |
| Component | Chemistry |
| Key | min sink total |
| Type | number |
| Unit | dimensionless |
| Default | 0.01 |
| Sensitivity run | no |

## L of Drain

Distance between pipes.

| Item | Value |
|:--|:--|
| Topic | 37 |
| Component | Drain |
| Key | L |
| Type | number |
| Unit | cm |
| Default | 1800 |
| Sensitivity run | no |

## Rad of Drain

Inner radius of drain pipes.

| Item | Value |
|:--|:--|
| Topic | 37 |
| Component | Drain |
| Key | rad |
| Type | number |
| Unit | cm |
| Default | 3.5 |
| Sensitivity run | no |

## K aquitard of Groundwater

Conductivity of the aquitard.

| Item | Value |
|:--|:--|
| Topic | 45 |
| Component | Groundwater |
| Key | K aquitard |
| Type | number |
| Unit | cm/h |
| Default | 0.001 |
| Sensitivity run | yes |

## Z aquitard of Groundwater

Thickness of the aquitard. The aquitard begins below the bottommost soil horizon.

| Item | Value |
|:--|:--|
| Topic | 45 |
| Component | Groundwater |
| Key | Z aquitard |
| Type | number |
| Unit | cm |
| Default | 200 |
| Sensitivity run | yes |

## Table of Groundwater

Groundwater level. Positive numbers indicate free drainage.

| Item | Value |
|:--|:--|
| Topic | 45 |
| Component | Groundwater |
| Key | table |
| Type | number |
| Unit | cm |
| Default | 1 |
| Sensitivity run | no |

## K nh4 of OrganicMatter

Maximal immobilization rate for ammonium.

| Item | Value |
|:--|:--|
| Topic | 60 |
| Component | OrganicMatter |
| Key | K NH4 |
| Type | number |
| Unit | h-1  |
| Default | 0.020833 |
| Sensitivity run | yes |

## K no3 of OrganicMatter

Maximal immobilization rate for nitrate.

| Item | Value |
|:--|:--|
| Topic | 60 |
| Component | OrganicMatter |
| Key | K NO3 |
| Type | number |
| Unit | h-1  |
| Default | 0.020833 |
| Sensitivity run | yes |

## Co2 threshold of OrganicMatter

Turnover rate above which pools will contribute to 'CO2 fast'.

| Item | Value |
|:--|:--|
| Topic | 60 |
| Component | OrganicMatter |
| Key | CO2 threshold |
| Type | number |
| Unit | h-1  |
| Default | 0.0001 |
| Sensitivity run | yes |

## Min am c of OrganicMatter

Minimal amount of carbon in AOM ensuring it is not removed.

| Item | Value |
|:--|:--|
| Topic | 60 |
| Component | OrganicMatter |
| Key | min AM C |
| Type | number |
| Unit | g C/m2  |
| Default | 0.5 |
| Sensitivity run | yes |

## Min am n of OrganicMatter

Minimal amount of nitrogen in AOM ensuring it is not removed.

| Item | Value |
|:--|:--|
| Topic | 60 |
| Component | OrganicMatter |
| Key | min AM N |
| Type | number |
| Unit | g N/m2  |
| Default | 0.05 |
| Sensitivity run | no |

## Temperature change rate of Surface

Relative change of surface temperature. If you set this to a negative value, surface temperature will reflect temperature of incomming water or ponded

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | temperature change rate |
| Type | number |
| Unit | h-1  |
| Default | 0.5 |
| Sensitivity run | yes |

## Epfactor of Surface

The autumn value can be lower, due to muching. With a crop factor of 1.2 a combined Kc of 1.15 is reached at LAI=5. See also [Kjaersgaard et al., 2008]

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | EpFactor |
| Type | number |
| Unit | dimensionless |
| Default | 0.6 |
| Sensitivity run | yes |

## Albedo dry of Surface

Albedo of dry soil (pF >= 3)

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | albedo dry |
| Type | number |
| Unit | dimensionless |
| Default | 0.15 |
| Sensitivity run | no |

## Albedo wet of Surface

Albedo of wet soil (pf <= 1.7)

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | albedo wet |
| Type | number |
| Unit | dimensionless |
| Default | 0.08 |
| Sensitivity run | no |

## Detentioncapacity of Surface

Amount of ponding the surface can retain. If ponding in any part of the surface is above this, exceed will runoff.

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | DetentionCapacity |
| Type | number |
| Unit | mm |
| Default | 1000 |
| Sensitivity run | no |

## Reservoirconstant of Surface

Fraction of ponding above DetentionCapacity that runoffs each hour.

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | ReservoirConstant |
| Type | number |
| Unit | h-1  |
| Default | 1 |
| Sensitivity run | yes |

## Localdetentioncapacity of Surface

Amount of ponding the surface can retain locally. If ponding in any part of the surface is above this, exceed will be distributed to the rest of the surface.

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | LocalDetentionCapacity |
| Type | number |
| Unit | mm |
| Default | 10 |
| Sensitivity run | no |

## Z mixing of Surface

Depth of mixing layer in the top of the soil. The mixing layer affect exchange between soil coloids, soil water and the surface, especially in connection with

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | z mixing |
| Type | number |
| Unit | cm |
| Default | 0.1 |
| Sensitivity run | yes |

## R mixing of Surface

Resistance to mixing inorganic compounds between soil and ponding. Log Variables

| Item | Value |
|:--|:--|
| Topic | 87 |
| Component | Surface |
| Key | R mixing |
| Type | number |
| Unit | h/mm |
| Default | 1000000000 |
| Sensitivity run | yes |

