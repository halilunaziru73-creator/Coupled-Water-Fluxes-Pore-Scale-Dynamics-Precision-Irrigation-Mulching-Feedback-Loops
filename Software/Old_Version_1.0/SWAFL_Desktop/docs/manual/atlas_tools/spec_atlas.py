# markers on the drawing-area crops: (x%, y%, text). Keys are the capture names (without suffix).
D={}
def S(n,*m): D[n]=list(m)
S('45_field',
 (19,27,'Precipitation arrow, P: annual value from Eqs. 5.4 to 5.12 (Average year); daily value from the rainfall generator, Eqs. 5.15 and 5.16 (Day by day).'),
 (52,21,'Transpiration arrow, T: Eqs. 5.4 to 5.12 (annual) and Eqs. 5.21 to 5.25 (daily).'),
 (68,22,'Soil evaporation arrow, E: Eqs. 5.4 to 5.12 (annual) and Eqs. 5.21 to 5.26 (daily).'),
 (87,24,'Interception arrow, E_other: the closure term of Eq. 5.12.'),
 (38,53,'Sensor tag: depletion f of the sensor layer against the trigger f_T, Eq. 5.3 (Engine 2 layer j_s).'),
 (70,49,'Roots (depth and density): Eqs. 5.19 and 5.20.'))
S('46_spac',
 (70,20,'Water potential of the air, psi_air = 135.5 ln RH: Eq. 7.5.'),
 (70,27,'Leaf potential, psi_leaf: Eq. 7.4.'),
 (70,46,'Stem and root-surface potentials, psi_stem and psi_root: Eqs. 7.2 and 7.3.'),
 (70,53,'Root-zone soil potential from the layer suctions: Eq. 7.1 (inverse of Eq. 5.3), with Eqs. 5.1 and 5.2 for the conductivity.'),
 (20,47,'Sensor at 20 cm: the suction of layer j_s, Eq. 7.1.'))
S('47_v2',
 (22,17,'Daily suction at the 20 cm sensor: stored Daisy series (data-driven, no equation).'),
 (75,19,'Trigger h_T (dashed red line), set by the slider; the share of the root zone beyond it is Eq. 7.6.'),
 (45,48,'Heat strip: geometric mean suction of each growing season, text under Eq. 7.6.'))
S('48_v1',
 (22,17,'Daily suction at 20 cm, irrigated (blue) and rainfed (orange): stored Daisy series (data-driven).'),
 (75,19,'Trigger h_T (red dashed line), set in Properties; days beyond it are counted by Eq. 6.1.'),
 (30,48,'Growing-season days beyond the trigger for each year, N_y(h_T): Eq. 6.1.'),
 (30,72,'"Irrigation removes 39 % of the days": X = 100(1 - N_irr / N_rainfed), Eq. 6.2.'),
 (37,81,'Annual result at these settings (irrigation, yield, drainage): Engine 1, Eqs. 5.4 to 5.12.'))
S('49_n1',
 (15,34,'Soil column: each layer coloured by its depletion f, Eq. 5.3 (red = beyond the trigger).'),
 (38,34,'Critical depletion f* = 0.45, the same for every soil (Eq. 5.3).'),
 (63,21,'Soil-specific trigger suction h(f*), the inverse of the van Genuchten curve: Eq. 6.3.'),
 (63,25,'Net irrigation per event Z_n = f AWC R_max: Eq. 6.4.'),
 (50,68,'Relative yield at the trigger, Y_rel (Eq. 6.5) and the trigger suction (Eq. 6.3) for the selected soil.'))
S('50_v3',
 (25,25,'Modelled thin section of the topsoil; the share of open pores follows the pore index p(t), Eq. 8.1.'),
 (88,40,'Pore-size classes from the retention curve, theta(h): Eqs. 8.3 and 8.4 (capillary radius).'),
 (50,63,'The same place under the three tillage systems; pore space 0.82, 0.61 and 0.42 from Eq. 8.1.'),
 (30,76,'Relative pore space after tillage, p(t) = p_c + (p_0 - p_c) exp(-tau_c t): Eq. 8.1.'))
S('51_v7',
 (30,10,'Blue bar: effect of tillage on drainage, Delta_till = D(conventional) - D(no-till): Eq. 8.5.'),
 (30,41,'Orange bar: effect of the consolidation rate on drainage, Delta_cons: Eq. 8.5.'),
 (85,35,'Scatter of each effect against clay content with the least-squares fit: Eq. 8.6.'),
 (14,66,'"Leading driver": the larger of Delta_till and Delta_cons for the selected soil, Eq. 8.5.'))
S('52_r1',
 (60,20,'Heat map of relative root density by depth and day: Eq. 5.20.'),
 (60,23,'Rooting depth through the season (black line): Eq. 5.18.'),
 (60,53,'Heat map of water uptake per layer, u_i(d): Eqs. 5.21 to 5.23.'),
 (52,76,'Root systems drawn on six dates from the same density: Eqs. 5.19 and 5.20.'),
 (50,82,'Depth holding half of the uptake, z_p: Eq. 8.7.'))
S('53_v4',
 (20,22,'Bare-soil reference: Engine 1 at mulch factor 1, Eq. 5.4.'),
 (45,29,'Selected mulch (strength phi, capacity c): the input of Eq. 9.1.'),
 (50,50,'Evaporation, transpiration, irrigation, drainage and nitrogen leaching of bare soil, your mulch and the strongest mulch: Eqs. 5.4, 5.7, 5.9 and 5.10.'),
 (35,76,'Differences between bare soil and the selected mulch, Delta E, Delta I, Delta D: Eq. 9.1.'))
S('54_v6',
 (15,20,'Matrix of soil evaporation E(phi, c) for each mulch factor and interception capacity: Eq. 5.4.'),
 (70,15,'Matrix of drainage D(tillage, consolidation rate): Eq. 5.9.'),
 (45,60,'Evaporation against mulch factor for four capacities: Eq. 5.4.'),
 (92,59,'Red dot: your current setting.'),
 (30,86,'"Mulch removes 31 % of bare-soil evaporation": Eq. 9.1.'))
S('55_e1',
 (30,10,'Atmospheric demand under mulch and canopy, e_0 = e_0,b phi (1 - 0.4 c): Eq. 5.26.'),
 (88,15,'Evaporation rate against time since wetting, stage 1 then stage 2: Eq. 9.2.'),
 (88,38,'Cumulative water lost since wetting, Q(t): Eq. 9.3.'),
 (35,50,'Section of soil: dry layer depth (Eq. 9.4) and water-filled pores from the capillary rule (Eq. 8.4) with the suction profile of Eq. 9.5.'),
 (70,62,'Panel with the stage, the rate now and the water lost so far: Eqs. 9.2 and 9.3.'))
S('56_n2',
 (60,30,'Evaporation saved, irrigation saved, extra drainage and extra transpiration against rainfall scale: Eq. 9.6.'),
 (88,12,'Rainfall at which drainage overtakes the irrigation saved: from the curves of Eq. 9.6.'),
 (50,54,'Where each mm of evaporation saved goes (irrigation, drainage, transpiration, storage): Eq. 9.7.'),
 (50,66,'The sentence under the picture is built from the shares of Eq. 9.7.'))
S('57_n3',
 (15,50,'Rainfall columns: evaporation and drainage of Engine 1 at each rainfall scale, Eqs. 5.4 and 5.9.'),
 (10,53,'Colour bar under each column: regime index I = (E - D) / max(1, E + D): Eq. 9.8.'),
 (45,64,'Regime map over rainfall scale and mulch factor: Eq. 9.8 in every cell.'),
 (15,63,'Red box: your current setting on the map.'),
 (35,84,'"Now: evaporation, drainage, index": Eq. 9.8 at the current setting.'))
S('58_v5',
 (97,19,'Arrow 1, temperature step: Engine 1 (Eqs. 5.4 to 5.12) re-evaluated; arrow width from Eq. 10.1.'),
 (78,26,'Arrow 3, stronger mulch: change in evaporation and irrigation, Eqs. 5.4, 5.7 and 9.1.'),
 (55,50,'Arrow 5, nitrate cost of drainage, kappa_N: Eq. 10.2.'),
 (40,67,'List of the change produced by one step of each control; widths of the arrows: Eq. 10.1.'))
# surface design
S('00_sid',
 (20,11,'DSS badge: soil, root zone, trigger and yearly irrigation come from the Engine 1 and 2 results (Eqs. 5.1 to 5.12, 5.27).'),
 (9,25,'"Start from": in Your soil mode intake, Z_n and the best inflow are derived from the soil, Eqs. 11.1 to 11.7, 5.27 and 11.22.'),
 (9,41,'Intake "From my soil": Saxton-Rawls, Green-Ampt and Kostiakov, Eqs. 11.1 to 11.7.'),
 (12,50,'Cut-off "Es = 1": cut-off time t_co, Eq. 11.16.'),
 (30,56,'Field length L, slope S, inflow q and Manning n: the inputs of Eqs. 11.8 and 11.9.'))
S('01_sid_layout_in_plan',
 (6,22,'Supply canal: inflow q enters the strip (flow area A_0 from Manning, Eq. 11.8).'),
 (50,24,'Strip in plan: front position x(t) from Eq. 11.9; colours show infiltrated depth Z(x) against Z_n, Eq. 11.17.'),
 (50,36,'Field length L (input).'),
 (35,43,'Legend dry / short / filled / excess: classes of Z(x) against Z_n, Eq. 11.17.'))
S('02_sid_longitudinal_section',
 (22,22,'Z_n line: required depth from the DSS (Eq. 5.27) drawn as depth of wetted soil.'),
 (14,28,'Z_0: depth infiltrated at the inlet, Eq. 11.17.'),
 (92,27,'Z_L: depth infiltrated at the tail, Eq. 11.17.'),
 (66,25,'EXCESS: water below the Z_n line is lost to deep percolation, V_dp of Eq. 11.18.'),
 (66,75,'Infiltrated volume V_inf (tile at the foot), Eq. 11.18.'))
S('03_sid_hydrograph',
 (30,35,'Green: infiltration I(t): Eq. 11.20.'),
 (60,28,'Orange: runoff R(t) with its recession after cut-off: Eqs. 11.20 and 11.21.'),
 (10,25,'Blue: water stored on the surface: Eq. 11.21.'),
 (73,16,'Cut-off time t_co: Eq. 11.16.'),
 (35,14,'t_L: advance time to the tail, Eq. 11.9.'))
S('04_sid_cross_section_at_the_inlet',
 (10,36,'Sheet depth and flow area A_0 from Manning: Eq. 11.8.'),
 (88,24,'Z_n depth: the required depth Z_n as a depth of wetted soil (storage of Eq. 11.4).'),
 (45,60,'Intake curve Z = k tau^A fitted to Green-Ampt: Eqs. 11.5 to 11.7.'),
 (30,66,'t_st: time to infiltrate the required depth, Eq. 11.15.'),
 (10,70,'Ks, psi_f and Delta theta of the soil: Eqs. 11.2 to 11.4.'))
S('05_sid_advance_and_opportunity_time',
 (40,20,'Opportunity time tau = t_co - t_x: Eq. 11.17.'),
 (65,29,'Advance curve x(t) from the volume balance: Eq. 11.9.'),
 (82,31,'t_L: time for the front to reach the tail.'),
 (70,11,'Cut-off 314 min = t_st + t_L: Eqs. 11.15 and 11.16.'))
S('06_sid_infiltrated_depth_along_the_field_agains',
 (13,15,'Z_0: depth at the inlet, Eq. 11.17.'),
 (88,26,'Z_L: depth at the tail, Eq. 11.17.'),
 (50,25,'Z_n: required depth, Eq. 5.27.'),
 (35,19,'Indigo: depth above Z_n, lost to deep percolation, V_dp of Eq. 11.18.'),
 (50,35,'Green: water stored in the root zone, V_st of Eq. 11.18.'))
S('07_sid_performance_indices_and_the_water_balanc',
 (20,14,'Application efficiency E_a = V_st / V_app: Eq. 11.19.'),
 (50,19,'Storage efficiency E_s = V_st / V_req: Eq. 11.19.'),
 (14,25,'Deep percolation DP and runoff RO as shares of the applied volume: Eq. 11.19.'),
 (50,35,'Uniformity CU after Christiansen: Eq. 11.19.'),
 (50,51,'Volumes applied, stored, percolated and run off: Eq. 11.18.'))
S('08_sid_design_table',
 (20,13,'Row 0: your current layout; its score is Eq. 11.23.'),
 (25,23,'Candidate moves in cut-off time, Eq. 11.16, then inflow (Eq. 11.22), cutback and length.'),
 (30,56,'Winning design: E_a of at least 85 % with E_s of at least 80 %, chosen by the score of Eq. 11.23.'))
S('09_sid_what_the_efficiency_is_most_sensitive_to',
 (25,14,'Tornado bar: change in E_a (Eq. 11.19) when this input moves by 10 to 30 %.'),
 (90,14,'Size of the change in percentage points.'),
 (42,40,'Green raises E_a, red lowers it.'))
S('10_sid_what_this_means_for_the_season_and_the_f',
 (80,13,'Irrigations in a season, n_ev = sum I / Z_n: Eq. 11.24.'),
 (80,19,'Gross depth per irrigation, Z_g = Z_n / E_a: Eq. 11.24.'),
 (80,31,'Units run at once, Q_s / q: Eq. 11.24.'),
 (80,36,'Sets and hours per irrigation: Eq. 11.24.'))
S('11_sid_irrigation_schedule',
 (25,14,'Dates: from the Engine 2 irrigation record of the analogue year (Eqs. 4.1 and 4.2).'),
 (60,14,'Net mm, I_k: the DSS irrigation depth that day.'),
 (80,14,'Pumped mm = I_k / E_a: Eq. 11.24.'),
 (92,14,'Run time of one round: Eq. 11.24.'))
S('12_sid_intervals_efficiency_and_the_advice_in_s',
 (75,35,'Sensor trigger: depletion f_T, Eqs. 5.3 and 5.27.'),
 (75,38,'Irrigations in the season: n_ev, Eq. 11.24.'),
 (88,47,'Application efficiency E_a: Eq. 11.19.'),
 (88,53,'Time per round: Eq. 11.24.'),
 (30,63,'"When to irrigate": a message assembled from the schedule and from E_a and E_s (Eqs. 11.19 and 11.24).'))
# drip
S('13_drip',
 (10,8,'DSS badge: soil, root depth, trigger and crop need come from Engines 1 and 2.'),
 (50,22,'Emitter type sets the discharge exponent x: Eqs. 12.4 and 12.5.'),
 (63,26,'Emitter depth z_d sets the bulb geometry: Eq. 12.10.'),
 (50,34,'Emitter and lateral spacing, S_e and S_l: area served by one emitter, Eq. 12.17.'),
 (40,43,'Emitter flow q at the inlet head H_0: Eq. 12.4.'),
 (85,35,'Inlet pressure head H_0: Eqs. 12.3 and 12.4.'))
S('14_drip_soil_moisture_around_the_emitter',
 (20,22,'Bulb under the driest 10 % of emitters (low quantile of Eq. 12.16).'),
 (50,22,'Bulb under the average emitter: Eqs. 12.10 to 12.12.'),
 (80,22,'Bulb under the wettest 10 % of emitters (high quantile of Eq. 12.16).'),
 (75,52,'Where the water goes: stored, deep percolation (Eq. 12.14) and evaporation (Eq. 12.15).'),
 (20,57,'Soil water today from the DSS profile.'))
S('15_drip_uniformity_along_the_lateral',
 (35,13,'Emitter flow q_j along the lateral: Eq. 12.4.'),
 (60,18,'Pressure head h_j along the lateral, falling with friction: Eq. 12.3.'),
 (60,11,'Emission uniformity E_u: Eq. 12.7.'),
 (60,19,'Head loss in the lateral, sum of h_f: Eq. 12.3.'))
S('16_drip_how_the_wetted_bulb_grows_with_the_run_t',
 (60,21,'Bulb width (green) and depth (indigo) against time: Eqs. 12.10 to 12.12.'),
 (75,15,'Root-zone depth R_max, against which the bulb depth gives deep percolation: Eq. 12.14.'),
 (85,10,'Lateral spacing S_l: the bulbs merge when the width reaches it, P_w of Eq. 12.13.'))
S('17_drip_result_for_this_design',
 (10,9,'Application efficiency E_a: Eq. 12.19.'),
 (45,9,'Root-zone refilled E_s: Eq. 12.19.'),
 (80,9,'Emission uniformity E_u: Eq. 12.7.'),
 (10,17,'Deep percolation: Eq. 12.14.'),
 (45,17,'Surface evaporation: Eq. 12.15.'),
 (80,17,'Gross depth per irrigation: Eqs. 12.17 and 12.18.'))
S('18_drip_layout_and_infrastructure',
 (35,12,'Source, pump, filter and valves: pump power from the head of Eq. 12.23.'),
 (35,32,'Laterals across the field, N_L = field width / S_l: Eq. 12.20.'),
 (35,58,'Head along the flow path: TDH of Eq. 12.23.'),
 (30,80,'Pipe table: smallest commercial diameter, losses by Eq. 12.22 (Hazen-Williams, Eq. 12.3).'),
 (80,53,'Zones, laterals and emitters: Eq. 12.20.'))
S('19_drip_design_table',
 (45,14,'Row 0: your current design; its score is Eq. 12.26.'),
 (75,11,'Column E_a: Eq. 12.19.'),
 (30,17,'Target reached: score = min(E_a, 1) - 2.5 max(0, 0.9 - E_s), Eq. 12.26.'))
S('20_drip_what_the_efficiency_is_most_sensitive_to',
 (65,11,'Tornado bar: change in E_a (Eq. 12.19) when the run time moves by 25 to 30 %.'),
 (88,11,'Size of the change in percentage points.'))
S('21_drip_what_this_means_for_the_season_and_the_f',
 (70,10,'Irrigations in a season, n_ev = y_I / Z_n: Eq. 12.24.'),
 (80,12,'Gross depth per irrigation: Eq. 12.24.'),
 (60,20,'System flow per hectare: Eq. 12.24.'),
 (70,23,'Sets and hours: Eq. 12.25.'))
S('22_drip_irrigation_schedule',
 (25,14,'Dates from the Engine 2 irrigation record.'),
 (50,17,'Pumped mm = I_k / E_a: Eq. 12.24.'),
 (72,17,'Run time: Eq. 12.18 (automatic run time).'))
S('23_drip_intervals_efficiency_and_the_advice_in_s',
 (80,45,'Sensor trigger: Eqs. 5.3 and 5.27.'),
 (92,56,'Application efficiency E_a: Eq. 12.19.'),
 (50,69,'"When to irrigate": message built from the schedule and from E_a and E_s.'))
# sprinkler
S('24_spr',
 (90,30,'Selected soil: intake K and A and the maximum allowable application rate, Eq. 13.9 and the course table.'),
 (65,40,'Wind speed u: Eqs. 13.5 and 13.8.'),
 (45,48,'Banner: application rate against the maximum allowed, Eqs. 13.9 and 13.10.'),
 (20,71,'Nozzle diameter d: Eqs. 13.2 and 13.3.'),
 (70,71,'Operating pressure P gives the head h = P / 9.81: Eq. 13.2.'),
 (22,76,'Trajectory angle alpha: f_alpha in Eq. 13.3.'),
 (25,81,'Spacing between laterals S_l: Eq. 13.6.'))
S('25_spr_layout_in_plan',
 (7,13,'Wind arrow: wind lengthens and shifts the pattern, Eq. 13.5.'),
 (50,25,'Overlapping spray patterns: sum over neighbours, Eq. 13.6, with the radial profile of Eq. 13.4.'),
 (87,40,'Wetted radius R: Eq. 13.3.'),
 (5,40,'Spacing along the lateral S_s.'),
 (75,18,'Colour shows infiltrated depth against Z_n: Eq. 13.11.'))
S('26_spr_along_the_lateral',
 (10,11,'Sprinkler positions.'),
 (10,15,'Z_n: required depth, Eq. 5.27.'),
 (60,28,'Infiltrated depth in each cell, Z_k: Eq. 13.11.'),
 (92,34,'Root-zone depth (94 cm).'),
 (15,70,'Soil water today from the DSS profile.'))
S('27_spr_soil_intake_against_the_application_rate',
 (25,17,'Soil intake rate K t^(A-1) (Kostiakov): Eq. 13.9.'),
 (25,24,'Applied rate a = 60 times the mean depth: Eq. 13.7.'),
 (65,18,'Ponding starts after t_p: Eq. 13.9.'),
 (70,24,'Runoff share: Eqs. 13.9 and 13.10.'),
 (70,26,'Surface storage S_d: Eq. 13.1.'))
S('28_spr_result_for_this_design',
 (10,8,'Application efficiency E_a: Eq. 13.11.'),
 (45,8,'Root-zone refilled E_s: Eq. 13.11.'),
 (80,8,'Christiansen CU: Eq. 13.7.'),
 (10,17,'Runoff: Eqs. 13.9 and 13.10.'),
 (45,17,'Deep percolation: Eq. 13.11.'),
 (80,17,'Drift, evaporation and interception: Eqs. 13.8 and 13.10.'))
S('29_spr_does_your_design_pass_the_course_checks',
 (20,11,'Spacing along the lateral S_s <= k R_w: Eqs. 13.13 and 13.14.'),
 (14,15,'Wind below 16 km/h: Eq. 13.13.'),
 (20,22,'Lateral head loss <= 20 % of the head: Eq. 13.18.'),
 (22,25,'Whole field done within the interval T: Eqs. 13.14 to 13.16.'),
 (70,18,'Christiansen CU >= 85 %: Eq. 13.7.'),
 (68,22,'Mainline gradient J < 0.05: Eq. 13.17.'))
S('30_spr_kinds_of_sprinkler_system',
 (20,16,'System type (solid-set selected): sets the efficiency range of the course table.'),
 (62,28,'This design\'s E_a against the course range: Eq. 13.11.'),
 (50,40,'Field plan to scale: laterals and sets, Eq. 13.21.'))
S('31_spr_the_sprinkler',
 (69,30,'"Yours": head h = P / 9.81 and discharge q (Eq. 13.2), throw R (Eq. 13.3).'),
 (65,33,'Formulas q = c d^2 sqrt(h) and R = k_r h^0.25: Eqs. 13.2 and 13.3.'),
 (85,18,'Pressure classes (low, medium, high): table, no equation.'))
S('32_spr_the_jet',
 (45,12,'Trajectory angle alpha: f_alpha(alpha) in Eq. 13.3.'),
 (65,35,'Throw radius R_w: Eq. 13.3.'),
 (88,19,'Throw against angle, best near 29 degrees: Eq. 13.3.'),
 (50,41,'Drift and evaporation loss w_d: Eq. 13.8.'),
 (80,18,'Wind speed u: Eqs. 13.5 and 13.8.'))
S('33_spr_the_water_pattern_of_one_sprinkler_and_h',
 (20,20,'Radial profile of one sprinkler, p(x): Eq. 13.4, skewed by the wind of Eq. 13.5.'),
 (65,22,'Sum over neighbouring sprinklers, a(x, y): Eq. 13.6; the dashed line is the mean rate.'),
 (35,33,'Christiansen coefficient of the whole pattern: Eq. 13.7.'),
 (20,55,'One sprinkler seen from above with three spokes of catch cans.'))
S('34_spr_layouts',
 (20,13,'Your layout: S_s <= k R_w and S_l <= 1.5 R_w, Eq. 13.14.'),
 (18,27,'Area per sprinkler and application rate: Eq. 13.7.'),
 (80,13,'Triangular layout: every second lateral shifted by S_s / 2, Eq. 13.6.'),
 (50,32,'Wind factor k: Eq. 13.13.'))
S('35_spr_what_wind_and_soil_allow',
 (30,16,'Step line of the wind factor k: Eq. 13.13.'),
 (35,25,'"Yours": your wind speed and spacing.'),
 (80,20,'Maximum allowable application rate by soil and slope (course table), used in Eqs. 13.9 and 13.13.'))
S('36_spr_catch_can_test',
 (22,20,'Catch cans: depth a_k in each can from the pattern of Eq. 13.6.'),
 (60,31,'CU from the cans = 1 - sum |a_k - mean| / (n mean): Eq. 13.7.'),
 (68,22,'Cans sorted from driest to wettest, with the mean depth.'))
S('37_spr_soil_water_as_a_reservoir',
 (30,22,'Root-zone store drawn down by ET_c and refilled every T days.'),
 (50,19,'Refill at Z_n from the DSS: Eq. 5.27.'),
 (92,19,'Gross depth Z_G = Z_n / E_a: Eq. 13.15.'),
 (75,34,'Set time t = Z_G / r: Eq. 13.15.'),
 (30,40,'Laterals running together, days to finish and inflow: Eq. 13.16.'))
S('38_spr_pipes_pump_and_the_hydraulic_grade_line_',
 (30,13,'Gradient J of the pipe (Blasius form): Eq. 13.17.'),
 (20,17,'Lateral pipe: smallest standard diameter meeting the loss limit, Eq. 13.18.'),
 (70,17,'Mainline: gradient below 0.05, Eq. 13.17.'),
 (50,36,'Head along the flow path to the pump, H_man: Eq. 13.19.'),
 (25,53,'Pump power: Eq. 13.20.'))
S('39_spr_layout_and_infrastructure',
 (30,12,'Source, pump, filter, fertigation and valves in order.'),
 (35,25,'Laterals, N_L = field length / S_l, and laterals running together: Eq. 13.21.'),
 (35,58,'Head along the flow path: Eqs. 13.19 and 13.22.'),
 (80,60,'Lateral head loss with the Christiansen factor F_m: Eq. 13.22.'),
 (20,80,'Pipe table: Eq. 13.18.'))
S('40_spr_design_table',
 (50,14,'Row 0: your current design (pressure, nozzle, spacing, run time, E_a, E_s).'),
 (80,11,'Column E_a: Eq. 13.11.'),
 (63,11,'Run time T: Eq. 13.12.'),
 (22,18,'Target reached: E_a of at least 85 % with CU of at least 85 %, Eqs. 13.7 and 13.11.'))
S('41_spr_what_the_efficiency_is_most_sensitive_to',
 (65,11,'Tornado bar: change in E_a (Eq. 13.11) when the input moves.'),
 (65,15,'Pressure: second most sensitive input.'),
 (70,36,'Green raises E_a, red lowers it.'))
S('42_spr_what_this_means_for_the_season_and_the_f',
 (80,10,'Irrigations in a season: Eq. 13.23.'),
 (80,13,'Gross depth per irrigation: Eq. 13.23.'),
 (70,17,'One sprinkler discharge q: Eq. 13.2.'),
 (80,21,'Sprinklers for the farm area, N_s: Eq. 13.21.'),
 (80,24,'Sets and run time: Eqs. 13.12 and 13.21.'))
S('43_spr_irrigation_schedule',
 (13,14,'Dates from the Engine 2 irrigation record.'),
 (50,14,'Pumped mm = I_k / E_a: Eq. 13.23.'),
 (70,14,'Run time of one round: Eq. 13.12.'))
S('44_spr_intervals_efficiency_and_the_advice_in_s',
 (80,45,'Sensor trigger: Eqs. 5.3 and 5.27.'),
 (95,54,'Application efficiency E_a: Eq. 13.11.'),
 (50,66,'"When to irrigate": message built from the schedule and from E_a and E_s.'))
LETTERS={'58_v5'}
# legends for the screens that are marked from the page structure
U={}
U['u00_welcome']=['The Start button closes the dialog and opens the workbench; the dialog carries no equation.']
U['u01_workbench']=[
 ('L','Layers panel: choose a layer or one of its sections. Every choice is one screen of this atlas.'),
 ('X','Processing Toolbox: run, cases, design, compare and export commands.'),
 ('T','Toolbar with the Date control: the date sets the whole workbench to that day (Eqs. 4.1 and 4.2).'),
 ('D','Drawing area: the picture produced by the equations printed under each screen.'),
 ('R','Dashboard: the numerical results of the same equations (Engine 1, Eqs. 5.4 to 5.12; Engine 2, Eqs. 5.13 to 5.25).'),
 ('C','Properties panel: the controls that move the equations (soil, tillage, mulch, weather, irrigation, nutrients).')]
for t in ['file','edit','view','tools','refresh','review','run','help']:
    U['u02_menu_'+t]=[f'The {t.capitalize()} menu in the menu bar.','Its list of commands.']
U['u03_palette']=['Search box of the command palette (Ctrl+K): type a layer, control or tool and press Enter.']
U['u04_toolbox']=['Simulation: play or pause the season, restart, 20-year run (Engine 2, Eqs. 5.13 to 5.25).',
 'Ready-made cases: load a stored combination of soil, tillage, mulch, weather and irrigation.',
 'Irrigation design: open the surface, drip or sprinkler design layer (Eqs. 11.1 to 13.23).',
 'Compare and review: pin the current results as the baseline (Eqs. 14.4 and 14.5), clear it, show the dashboard.',
 'Export: picture, yearly results (CSV), design results (CSV), project, print.']
U['u07_toolbar']=['Run or pause the season (Engine 2).','Run the 20-year simulation.','Pin results as baseline (Eq. 14.4).',
 'Open a design layer: Surface, Drip or Sprinklers.','Date control: the working date, Eqs. 4.1 and 4.2.']
U['u08_statusbar']=['Layer and section on screen.','Working date.','Soil, tillage, mulch and irrigation method in force.']
U['u05_dash_results']=['Working day: crop, root depth, sensor against trigger (Eq. 5.3), rain, irrigation, evaporation, transpiration and drainage of that day, Eqs. 14.1 to 14.3.',
 'Next 14 days: simulated, not a forecast, from Engine 2.',
 'Whole year: the annual fluxes of Engine 1, Eqs. 5.4 to 5.12, and the closure of Eq. 5.12.',
 'Tabs: Results, Design, Charts and Messages.']
U['u05_dash_design']=['Design tab with a design layer open: efficiencies, uniformity, times and volumes of the system being designed.','Tabs.']
U['u05_dash_charts']=['Rainfall and irrigation for twenty years (Engine 1 annual values, Eqs. 5.4 to 5.12), with the pinned baseline of Eq. 14.5.',
 'Drainage below the root zone, D of Eq. 5.9.','Evaporation and transpiration, E and T of Eqs. 5.4 to 5.12.']
U['u05_dash_messages']=['Message log: engine start and plain-language notices.']
U['u06_properties']=['Scenario: ready-made case, weather year and date (Eqs. 4.1 and 4.2).','Soil and field: soil, tillage, crop and consolidation rate tau_c (Eqs. 5.1, 5.2, 8.1).',
 'Mulch: material, strength phi and interception capacity c (Eqs. 5.4 to 5.10, 9.1).','Weather and climate: rainfall scale rho and temperature shift (Eqs. 5.4 to 5.10).',
 'Irrigation: method, trigger suction h_T and sensor depth (Eqs. 5.3, 5.11, 5.27).','Nutrients: nitrogen rate (Eqs. 5.10, 5.11).']
