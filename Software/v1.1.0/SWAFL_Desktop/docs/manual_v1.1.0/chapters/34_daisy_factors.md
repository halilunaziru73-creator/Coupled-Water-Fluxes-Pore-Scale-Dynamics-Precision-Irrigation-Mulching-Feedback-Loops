# The factors and responses of the Experiments tab {#daisy-factors}

The Experiments tab offers 53 factors. Each has levels that are tried, a range that is accepted, and words that make the tab propose it when the question is typed in words. Fourteen responses are measured in every run.

## Responses

| Response | Unit | Better when |
|:--|:--|:--|
| Yield | Mg DM/ha | higher |
| Irrigation | mm/season | lower |
| Evapotranspiration | mm/season | not ranked |
| Percolation below 100 cm | mm/season | lower |
| Nitrate leached below 100 cm | kg N/ha/season | lower |
| Denitrification | kg N/ha/season | lower |
| Irrigation efficiency | kg grain per m3 | higher |
| Rain | mm/season | not ranked |
| Water-stress days at harvest | days | lower |
| Nitrogen-stress days at harvest | days | lower |
| Irrigation water-use efficiency (yield gain over the rainfed reference per mm) | kg DM per ha per mm | higher |
| Deep-percolation fraction of rain + irrigation | % | lower |
| Partial factor productivity of nitrogen | kg DM per kg N | higher |
| Nitrate leached as a share of N applied | % | lower |

## Factors

### Rain, factor on the weather

| Item | Value |
|:--|:--|
| Key | precip |
| Unit | n/a |
| Kind | num |
| Levels tried | 0.6, 0.8, 1, 1.2, 1.4 |
| Accepted range | 0.4 to 1.6 |
| Needs irrigation | no |
| Words | rain, rainfall, precipitation, wetter, drier, dry year, wet year, drought |

### Temperature shift

| Item | Value |
|:--|:--|
| Key | temp |
| Unit | C |
| Kind | num |
| Levels tried | 0, 1, 2, 3 |
| Accepted range | -4 to 8 |
| Needs irrigation | no |
| Words | temperature, warming, warmer, hotter, cooler, climate change, heat |

### Nitrogen fertiliser, factor on the rotation

| Item | Value |
|:--|:--|
| Key | nfac |
| Unit | n/a |
| Kind | num |
| Levels tried | 0.4, 0.7, 1, 1.3 |
| Accepted range | 0 to 2 |
| Needs irrigation | no |
| Words | nitrogen, fertiliser, fertilizer, n rate, n dose, leaching, nitrate, pollution |

### Irrigation

| Item | Value |
|:--|:--|
| Key | irrig |
| Unit | n/a |
| Kind | cat |
| Levels tried | 0, 1 |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | irrigation, irrigate, irrigated, rainfed |

### Water per irrigation

| Item | Value |
|:--|:--|
| Key | mm |
| Unit | mm |
| Kind | num |
| Levels tried | 10, 20, 30, 45 |
| Accepted range | 2 to 60 |
| Needs irrigation | yes |
| Words | dose, amount, depth of water, mm per, water per irrigation |

### Duration of one irrigation

| Item | Value |
|:--|:--|
| Key | hours |
| Unit | h |
| Kind | num |
| Levels tried | 3, 6, 12, 24 |
| Accepted range | 1 to 48 |
| Needs irrigation | yes |
| Words | duration, hours, how long, slow, intensity |

### Irrigation trigger (soil suction)

| Item | Value |
|:--|:--|
| Key | trig |
| Unit | cm |
| Kind | num |
| Levels tried | -100, -200, -300, -600, -1000 |
| Accepted range | -10000 to -50 |
| Needs irrigation | yes |
| Words | trigger, threshold, suction, tensiometer, pressure, when to irrigate |

### Sensor depth

| Item | Value |
|:--|:--|
| Key | z |
| Unit | cm |
| Kind | num |
| Levels tried | 10, 20, 30, 50 |
| Accepted range | 5 to 100 |
| Needs irrigation | yes |
| Words | sensor, sensor depth, probe, installation depth, where to put the sensor |

### Irrigation method

| Item | Value |
|:--|:--|
| Key | method |
| Unit | n/a |
| Kind | cat |
| Levels tried | overhead, surface, drip |
| Accepted range | n/a |
| Needs irrigation | yes |
| Words | method, sprinkler, overhead, drip, surface irrigation, furrow, flood |

### Drip depth

| Item | Value |
|:--|:--|
| Key | dfrom |
| Unit | cm |
| Kind | set |
| Levels tried | {'label': 'drip 5-10 cm', 'set': {'method': 'drip', 'dfrom': 5, 'dto': 10}}, {'label': 'drip 10-20 cm', 'set': {'method': 'drip', 'dfrom': 10, 'dto': 20}}, {'label': 'drip 15-25 cm', 'set': {'method': 'drip', 'dfrom': 15, 'dto': 25}}, {'label': 'drip 20-30 cm', 'set': {'method': 'drip', 'dfrom': 20, 'dto': 30}} |
| Accepted range | n/a |
| Needs irrigation | yes |
| Words | drip depth, buried drip, subsurface drip |

### Water limit per crop season

| Item | Value |
|:--|:--|
| Key | limit |
| Unit | mm |
| Kind | num |
| Levels tried | 0, 60, 120, 240 |
| Accepted range | 0 to 1000 |
| Needs irrigation | yes |
| Words | limit, deficit, water limit, quota, restricted, scarce water, allowance |

### Irrigation window

| Item | Value |
|:--|:--|
| Key | w1 |
| Unit | n/a |
| Kind | set |
| Levels tried | {'label': 'Apr 1 minus Oct 1', 'set': {'w1': '04-01', 'w2': '10-01'}}, {'label': 'May 1 minus Oct 1', 'set': {'w1': '05-01', 'w2': '10-01'}}, {'label': 'Jun 1 minus Oct 1', 'set': {'w1': '06-01', 'w2': '10-01'}}, {'label': 'Apr 1 minus Jun 1', 'set': {'w1': '04-01', 'w2': '06-01'}} |
| Accepted range | n/a |
| Needs irrigation | yes |
| Words | timing, window, season of irrigation, when in the season, start date |

### Maximum rooting depth

| Item | Value |
|:--|:--|
| Key | root |
| Unit | cm |
| Kind | num |
| Levels tried | 30, 60, 90, 120, 150 |
| Accepted range | 20 to 200 |
| Needs irrigation | no |
| Words | root, rooting depth, roots |

### Soil

| Item | Value |
|:--|:--|
| Key | soil |
| Unit | n/a |
| Kind | cat |
| Levels tried | usda:sand, usda:sandyloam, loam, usda:siltloam, usda:clayloam |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | soil, soils, texture, sand, loam, clay, silt |

### Weather station

| Item | Value |
|:--|:--|
| Key | station |
| Unit | n/a |
| Kind | cat |
| Levels tried | course, it-bologna, dk-foulum |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | station, site, location, climate of, bologna, foulum, jyndevad, valecov, jadwisin, bratislava, taastrup, mediterranean |

### Tillage

| Item | Value |
|:--|:--|
| Key | till |
| Unit | n/a |
| Kind | cat |
| Levels tried | plowing, rotavation, none |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | tillage, plough, plow, plowing, ploughing, rotavat, no-till, no till, cultivation |

### Type of mineral fertiliser

| Item | Value |
|:--|:--|
| Key | ntype |
| Unit | n/a |
| Kind | cat |
| Levels tried | N25S, AmmoniumNitrate, Ammonia, Nitrate |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | fertiliser type, fertilizer type, ammonium nitrate, ammonia, urea, form of nitrogen |

### Fertiliser date, shift in days

| Item | Value |
|:--|:--|
| Key | ntime |
| Unit | days |
| Kind | num |
| Levels tried | -14, 0, 14, 28 |
| Accepted range | -60 to 60 |
| Needs irrigation | no |
| Words | fertiliser timing, fertilizer timing, when to fertili, split application, delay the fertili |

### Evapotranspiration model

| Item | Value |
|:--|:--|
| Key | bio |
| Unit | n/a |
| Kind | cat |
| Levels tried | auto, default |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | evapotranspiration model, penman, fao56, bioclimate, energy balance |

### Radiation, factor on the weather

| Item | Value |
|:--|:--|
| Key | radscale |
| Unit | n/a |
| Kind | num |
| Levels tried | 0.9, 1, 1.1 |
| Accepted range | 0.5 to 1.5 |
| Needs irrigation | no |
| Words | radiation, cloud, sunshine, solar |

### Irrigation intensity (constant flux)

| Item | Value |
|:--|:--|
| Key | flux |
| Unit | mm/h |
| Kind | num |
| Levels tried | 0.05, 0.1, 0.5, 2 |
| Accepted range | 0.01 to 20 |
| Needs irrigation | yes |
| Words | flux, intensity, mm per hour, mm/h, constant depth |

### Seasonal rain pattern

| Item | Value |
|:--|:--|
| Key | pmonths |
| Unit | n/a |
| Kind | set |
| Levels tried | {'label': 'dry summer (rain x0.7 Jun-Aug)', 'set': {'pmonths': '1 1 1 1 1 0.7 0.7 0.7 1 1 1 1'}}, {'label': 'dry spring (rain x0.7 Mar-May)', 'set': {'pmonths': '1 1 0.7 0.7 0.7 1 1 1 1 1 1 1'}}, {'label': 'wet winter (rain x1.3 Dec-Feb)', 'set': {'pmonths': '1.3 1.3 1 1 1 1 1 1 1 1 1 1.3'}} |
| Accepted range | n/a |
| Needs irrigation | no |
| Words | seasonal, dry summer, dry spring, wet winter, monthly rain, drought in summer |

### Sorption of the chemical, K_OC

| Item | Value |
|:--|:--|
| Key | koc |
| Unit | L/kg |
| Kind | num |
| Levels tried | 0, 50, 100, 500 |
| Accepted range | 0 to 5000 |
| Needs irrigation | no |
| Words | sorption, koc, pesticide, chemical, tracer, herbicide |

### Half-life of the chemical

| Item | Value |
|:--|:--|
| Key | half |
| Unit | days |
| Kind | num |
| Levels tried | 0, 15, 30, 90 |
| Accepted range | 0 to 2000 |
| Needs irrigation | no |
| Words | half-life, half life, degradation, decay, persistence |

### Bioclimate: NoOfIntervals (Daisy reference, chapter 19)

| Item | Value |
|:--|:--|
| Key | p_Bioclimate/NoOfIntervals |
| Unit | n/a |
| Kind | num |
| Levels tried | 15, 23, 30, 45, 60 |
| Accepted range | 0 to 300 |
| Needs irrigation | no |
| Words | bioclimate noofintervals, noofintervals of bioclimate, noofintervals |

### Bioclimate: max svat iterations (Daisy reference, chapter 19)

| Item | Value |
|:--|:--|
| Key | p_Bioclimate/max_svat_iterations |
| Unit | n/a |
| Kind | num |
| Levels tried | 50, 75, 100, 150, 200 |
| Accepted range | 0 to 1000 |
| Needs irrigation | no |
| Words | bioclimate max svat iterations, max_svat_iterations of bioclimate, max svat iterations, max_svat_iterations |

### Bioclimate: max svat absolute difference (Daisy reference, chapter 19)

| Item | Value |
|:--|:--|
| Key | p_Bioclimate/max_svat_absolute_difference |
| Unit | mm/h |
| Kind | num |
| Levels tried | 0.005, 0.0075, 0.01, 0.015, 0.02 |
| Accepted range | 0 to 0.1 |
| Needs irrigation | no |
| Words | bioclimate max svat absolute difference, max_svat_absolute_difference of bioclimate, max svat absolute difference, max_svat_absolute_difference |

### Bioclimate: maxTdiff (Daisy reference, chapter 19)

| Item | Value |
|:--|:--|
| Key | p_Bioclimate/maxTdiff |
| Unit | K |
| Kind | num |
| Levels tried | 0.01, 0.015, 0.02, 0.03, 0.04 |
| Accepted range | 0 to 0.2 |
| Needs irrigation | no |
| Words | bioclimate maxtdiff, maxtdiff of bioclimate, maxtdiff |

### Bioclimate: maxEdiff (Daisy reference, chapter 19)

| Item | Value |
|:--|:--|
| Key | p_Bioclimate/maxEdiff |
| Unit | Pa |
| Kind | num |
| Levels tried | 0.5, 0.75, 1, 1.5, 2 |
| Accepted range | 0 to 10 |
| Needs irrigation | no |
| Words | bioclimate maxediff, maxediff of bioclimate, maxediff |

### Bioclimate: min sun angle (Daisy reference, chapter 19)

| Item | Value |
|:--|:--|
| Key | p_Bioclimate/min_sun_angle |
| Unit | rad |
| Kind | num |
| Levels tried | 0.03142, 0.04712, 0.06283, 0.09425, 0.1257 |
| Accepted range | 0 to 0.6283 |
| Needs irrigation | no |
| Words | bioclimate min sun angle, min_sun_angle of bioclimate, min sun angle, min_sun_angle |

### Chemistry original: max sink total (Daisy reference, chapter 24)

| Item | Value |
|:--|:--|
| Key | p_Chemistry/original/max_sink_total |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.25, 0.375, 0.5, 0.75, 1 |
| Accepted range | 0 to 5 |
| Needs irrigation | no |
| Words | chemistry max sink total, max_sink_total of chemistry, max sink total, max_sink_total |

### Chemistry original: max sink solute (Daisy reference, chapter 24)

| Item | Value |
|:--|:--|
| Key | p_Chemistry/original/max_sink_solute |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.45, 0.675, 0.9, 1.35, 1.8 |
| Accepted range | 0 to 9 |
| Needs irrigation | no |
| Words | chemistry max sink solute, max_sink_solute of chemistry, max sink solute, max_sink_solute |

### Chemistry original: max sink secondary (Daisy reference, chapter 24)

| Item | Value |
|:--|:--|
| Key | p_Chemistry/original/max_sink_secondary |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.75, 1.125, 1.5, 2.25, 3 |
| Accepted range | 0 to 15 |
| Needs irrigation | no |
| Words | chemistry max sink secondary, max_sink_secondary of chemistry, max sink secondary, max_sink_secondary |

### Chemistry original: min sink total (Daisy reference, chapter 24)

| Item | Value |
|:--|:--|
| Key | p_Chemistry/original/min_sink_total |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.005, 0.0075, 0.01, 0.015, 0.02 |
| Accepted range | 0 to 0.1 |
| Needs irrigation | no |
| Words | chemistry min sink total, min_sink_total of chemistry, min sink total, min_sink_total |

### Drain lateral: L (Daisy reference, chapter 37)

| Item | Value |
|:--|:--|
| Key | p_Drain/lateral/L |
| Unit | cm |
| Kind | num |
| Levels tried | 900, 1350, 1800, 2700, 3600 |
| Accepted range | 0 to 18000 |
| Needs irrigation | no |
| Words | drain l, l of drain |

### Drain lateral: rad (Daisy reference, chapter 37)

| Item | Value |
|:--|:--|
| Key | p_Drain/lateral/rad |
| Unit | cm |
| Kind | num |
| Levels tried | 1.75, 2.625, 3.5, 5.25, 7 |
| Accepted range | 0 to 35 |
| Needs irrigation | no |
| Words | drain rad, rad of drain |

### Groundwater aquitard: K aquitard (Daisy reference, chapter 45)

| Item | Value |
|:--|:--|
| Key | p_Groundwater/aquitard/K_aquitard |
| Unit | cm/h |
| Kind | num |
| Levels tried | 0.0005, 0.00075, 0.001, 0.0015, 0.002 |
| Accepted range | 0 to 0.01 |
| Needs irrigation | no |
| Words | groundwater k aquitard, k_aquitard of groundwater, k aquitard, k_aquitard |

### Groundwater aquitard: Z aquitard (Daisy reference, chapter 45)

| Item | Value |
|:--|:--|
| Key | p_Groundwater/aquitard/Z_aquitard |
| Unit | cm |
| Kind | num |
| Levels tried | 100, 150, 200, 300, 400 |
| Accepted range | 0 to 2000 |
| Needs irrigation | no |
| Words | groundwater z aquitard, z_aquitard of groundwater, z aquitard, z_aquitard |

### Groundwater static: table (Daisy reference, chapter 45)

| Item | Value |
|:--|:--|
| Key | p_Groundwater/static/table |
| Unit | cm |
| Kind | num |
| Levels tried | 0.5, 0.75, 1, 1.5, 2 |
| Accepted range | 0 to 10 |
| Needs irrigation | no |
| Words | groundwater table, table of groundwater, table |

### OrganicMatter original: K NH4 (Daisy reference, chapter 60)

| Item | Value |
|:--|:--|
| Key | p_OrganicMatter/original/K_NH4 |
| Unit | h-1  |
| Kind | num |
| Levels tried | 0.01042, 0.01562, 0.02083, 0.03125, 0.04167 |
| Accepted range | 0 to 0.2083 |
| Needs irrigation | no |
| Words | organicmatter k nh4, k_nh4 of organicmatter, k nh4, k_nh4 |

### OrganicMatter original: K NO3 (Daisy reference, chapter 60)

| Item | Value |
|:--|:--|
| Key | p_OrganicMatter/original/K_NO3 |
| Unit | h-1  |
| Kind | num |
| Levels tried | 0.01042, 0.01562, 0.02083, 0.03125, 0.04167 |
| Accepted range | 0 to 0.2083 |
| Needs irrigation | no |
| Words | organicmatter k no3, k_no3 of organicmatter, k no3, k_no3 |

### OrganicMatter original: CO2 threshold (Daisy reference, chapter 60)

| Item | Value |
|:--|:--|
| Key | p_OrganicMatter/original/CO2_threshold |
| Unit | h-1  |
| Kind | num |
| Levels tried | 5e-05, 7.5e-05, 0.0001, 0.00015, 0.0002 |
| Accepted range | 0 to 0.001 |
| Needs irrigation | no |
| Words | organicmatter co2 threshold, co2_threshold of organicmatter, co2 threshold, co2_threshold |

### OrganicMatter original: min AM C (Daisy reference, chapter 60)

| Item | Value |
|:--|:--|
| Key | p_OrganicMatter/original/min_AM_C |
| Unit | g C/m2  |
| Kind | num |
| Levels tried | 0.25, 0.375, 0.5, 0.75, 1 |
| Accepted range | 0 to 5 |
| Needs irrigation | no |
| Words | organicmatter min am c, min_am_c of organicmatter, min am c, min_am_c |

### OrganicMatter original: min AM N (Daisy reference, chapter 60)

| Item | Value |
|:--|:--|
| Key | p_OrganicMatter/original/min_AM_N |
| Unit | g N/m2  |
| Kind | num |
| Levels tried | 0.025, 0.0375, 0.05, 0.075, 0.1 |
| Accepted range | 0 to 0.5 |
| Needs irrigation | no |
| Words | organicmatter min am n, min_am_n of organicmatter, min am n, min_am_n |

### Surface: temperature change rate (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/temperature_change_rate |
| Unit | h-1  |
| Kind | num |
| Levels tried | 0.25, 0.375, 0.5, 0.75, 1 |
| Accepted range | 0 to 5 |
| Needs irrigation | no |
| Words | surface temperature change rate, temperature_change_rate of surface, temperature change rate, temperature_change_rate |

### Surface: EpFactor (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/EpFactor |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.3, 0.45, 0.6, 0.9, 1.2 |
| Accepted range | 0 to 6 |
| Needs irrigation | no |
| Words | surface epfactor, epfactor of surface, epfactor |

### Surface: albedo dry (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/albedo_dry |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.075, 0.1125, 0.15, 0.225, 0.3 |
| Accepted range | 0 to 1.5 |
| Needs irrigation | no |
| Words | surface albedo dry, albedo_dry of surface, albedo dry, albedo_dry |

### Surface: albedo wet (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/albedo_wet |
| Unit | dimensionless |
| Kind | num |
| Levels tried | 0.04, 0.06, 0.08, 0.12, 0.16 |
| Accepted range | 0 to 0.8 |
| Needs irrigation | no |
| Words | surface albedo wet, albedo_wet of surface, albedo wet, albedo_wet |

### Surface: DetentionCapacity (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/DetentionCapacity |
| Unit | mm |
| Kind | num |
| Levels tried | 2.5, 3.75, 5, 7.5, 10 |
| Accepted range | 0 to 50 |
| Needs irrigation | no |
| Words | surface detentioncapacity, detentioncapacity of surface, detentioncapacity |

### Surface: ReservoirConstant (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/ReservoirConstant |
| Unit | h-1  |
| Kind | num |
| Levels tried | 30, 45, 60, 90, 120 |
| Accepted range | 0 to 600 |
| Needs irrigation | no |
| Words | surface reservoirconstant, reservoirconstant of surface, reservoirconstant |

### Surface: LocalDetentionCapacity (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/LocalDetentionCapacity |
| Unit | mm |
| Kind | num |
| Levels tried | 5, 7.5, 10, 15, 20 |
| Accepted range | 0 to 100 |
| Needs irrigation | no |
| Words | surface localdetentioncapacity, localdetentioncapacity of surface, localdetentioncapacity |

### Surface: z mixing (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/z_mixing |
| Unit | cm |
| Kind | num |
| Levels tried | 0.05, 0.075, 0.1, 0.15, 0.2 |
| Accepted range | 0 to 1 |
| Needs irrigation | no |
| Words | surface z mixing, z_mixing of surface, z mixing, z_mixing |

### Surface: R mixing (Daisy reference, chapter 87)

| Item | Value |
|:--|:--|
| Key | p_Surface/R_mixing |
| Unit | h/mm |
| Kind | num |
| Levels tried | 500000000, 750000000, 1000000000, 1500000000, 2000000000 |
| Accepted range | 0 to 10000000000 |
| Needs irrigation | no |
| Words | surface r mixing, r_mixing of surface, r mixing, r_mixing |

