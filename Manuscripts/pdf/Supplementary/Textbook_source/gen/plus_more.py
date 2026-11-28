"""Writes extra/moreNN.tex for every chapter: FURTHER EXERCISES (multi-step problems whose answers are computed
here), ESSAY QUESTIONS, EXERCISES IN SWAFL (tasks in the program, with the manual chapter of each) and, where the
chapter has none, OBJECTIVE TYPE QUESTIONS with their answers."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from plus_lib import *

def r(x, d=3):
    s = f(x, d); return s if s.startswith('$') else '$' + s + '$' if '\\times' in s else s

E, ES, SW, OB = {}, {}, {}, {}
# =================================================================== Chapter 1 (pore geometry) key 00
k = '00'
h1 = cap_h(30e-6) * 100; h2 = cap_h(3e-6) * 100
Q = math.pi * (50e-6) ** 4 * (9810 * 1.0) / (8 * 1.002e-3 * 1.0)
kc = (0.2e-3) ** 2 * 0.40 ** 3 / (180 * 0.60 ** 2); Kkc = kc * 9810 / 1.002e-3 * 86400 * 100
b = 0.2e-3; qc = 9810 * b ** 3 / (12 * 1.002e-3) * 0.01 * 86400
dsdo = 0.30 ** (10 / 3) / 0.50 ** 2
E[k] = [
 'A sandy loam has pores of equivalent radius 30 $\\mu$m and 3 $\\mu$m. (a) Find the suction at which each empties ($\\gamma=0.0728$ N\\,m$^{-1}$, $\\beta=0$). (b) Express both in pF. (c) Which of the two still holds water at field capacity (100 cm)?\\exans{(a) %.0f cm, %.0f cm; (b) pF %.2f, %.2f; (c) the 3 $\\mu$m pore}' % (h1, h2, math.log10(h1), math.log10(h2)),
 'Water flows through a single straight tube of radius 50 $\\mu$m and length 1 m under a head difference of 1 m ($\\mu=1.002\\times10^{-3}$ Pa\\,s). (a) Find the discharge by Hagen--Poiseuille. (b) By what factor does it change if the radius is halved? (c) How many tubes of 25 $\\mu$m carry the same flow as one of 50 $\\mu$m?\\exans{(a) %s m$^3$\\,s$^{-1}$; (b) 1/16; (c) 16}' % ('$' + f(Q) + '$'),
 'A packing of uniform sand grains of diameter 0.2 mm has porosity 0.40. (a) Find the intrinsic permeability by Kozeny--Carman with $c=180$, $k=d^2\\phi^3/[180(1-\\phi)^2]$. (b) Convert it to a saturated conductivity in cm\\,d$^{-1}$. (c) By what factor does $k$ fall if compaction reduces $\\phi$ to 0.35?\\exans{(a) %s m$^2$; (b) %.0f cm\\,d$^{-1}$; (c) %.2f}' % ('$' + f(kc) + '$', Kkc, (0.35 ** 3 / 0.65 ** 2) / (0.40 ** 3 / 0.60 ** 2)),
 'A clay soil cracks into planar cracks of aperture 0.2 mm, one crack per 10 cm of horizontal distance. Using the cubic law, find the flux per unit area through the cracks under a unit gradient (cm\\,d$^{-1}$), and compare it with the matrix conductivity of 1.7 cm\\,d$^{-1}$.\\exans{%.0f cm\\,d$^{-1}$; about %.0f times the matrix}' % (qc * 100, qc * 100 / 1.7),
 'A loam of porosity 0.50 holds $\\theta=0.20$. (a) Find the relative diffusivity of gases by Millington and Quirk. (b) After rain $\\theta=0.40$: find it again. (c) By what factor has the diffusion of oxygen fallen?\\exans{(a) %.4f; (b) %.5f; (c) %.0f}' % (dsdo, 0.10 ** (10 / 3) / 0.25, dsdo / (0.10 ** (10 / 3) / 0.25)),
]
ES[k] = ['Explain, with the Young--Laplace law, why the retention curve of a soil can be read as a distribution of pore sizes. What assumptions does this reading make, and where does it fail?',
 'Discuss the role of throats and bodies in the hysteresis of soil water. Why is the drying curve above the wetting curve, and what does this mean for the reading of a tensiometer after rain?',
 'Compare the bundle-of-capillaries model with a network model of the pores. Which properties of a real soil can the network explain that the bundle cannot?',
 'Describe how tillage, compaction, roots and earthworms change the geometry of the pore space, and how each change appears in the retention and the conductivity curves.',
 'Explain the two stages of evaporation from a bare soil in terms of the pore sizes. Why does a mulch save most water in soils with a long characteristic length?',
 'Why does the conductivity of a soil fall by many orders of magnitude while its water content falls by only a factor of two or three? Base your answer on the fourth-power law of flow in a pore.']
SW[k] = [('8', 'Open the layer \\emph{Soil structure and tillage} and choose the sand and then the silty clay loam. For each, read the saturated water content and sketch the retention curve that the layer draws. Which soil has the wider range of pore sizes?', 'the silty clay loam (smaller $n$), whose curve falls gradually over several decades of suction'),
 ('8', 'In the same layer move the \\emph{Structural consolidation rate} to its smallest and largest value and run. Record how the drainage and the evaporation of the year change, and explain the change with the pore picture of this chapter.', 'faster consolidation removes the large pores made by tillage, so the drainage of the loosened layer falls'),
 ('9', 'Open \\emph{Mulch and evaporation} and watch the pore picture and the drying front during \\emph{Play}. Note the day on which stage 2 begins on the bare soil, with and without mulch.', 'stage 2 begins later under the mulch; the drying front stays near the surface'),
 ('7', 'In \\emph{Soil, plant and air} compare the water potential of the soil, the root, the leaf and the air on a hot day. Which step has the largest drop, and why?', 'the step from the leaf to the air, which is far larger than all the others')]
# =================================================================== Chapter 2 (soil water) key 01
k = '01'
def thetaS(h, a, n, tr, ts): return tr + (ts - tr) * Se(h, a, n)
fc = thetaS(100, 0.075, 1.89, 0.065, 0.41); wp = thetaS(15849, 0.075, 1.89, 0.065, 0.41)
E[k] = ['A field of 6 ha of the sandy loam ($\\alpha=0.075$ cm$^{-1}$, $n=1.89$, $\\theta_r=0.065$, $\\theta_s=0.41$) has a root zone of 0.7 m. (a) Find $\\theta$ at field capacity (100 cm) and at the wilting point (15\\,849 cm). (b) Find $\\TAW$ in mm. (c) With $p=0.5$ and $ET_c=5.5$ mm\\,d$^{-1}$, find the interval and the volume of each irrigation at an efficiency of 0.8.\\exans{(a) %.3f, %.3f; (b) %.0f mm; (c) %.1f d, %.0f m$^3$}' % (fc, wp, 700 * (fc - wp), 0.5 * 700 * (fc - wp) / 5.5, 0.5 * 700 * (fc - wp) / 0.8 * 10 * 6),
 'Tensiometers at 30 and 60 cm read suctions of 250 and 120 cm (datum at the surface). (a) Find the total heads. (b) In which direction does water flow? (c) If $K=0.05$ cm\\,d$^{-1}$ in this range, find the flux.\\exans{(a) $-280$ and $-180$ cm; (b) upward; (c) 0.17 cm\\,d$^{-1}$ upward}',
 'For the loam ($\\alpha=0.036$, $n=1.56$) find the suction at which $S_e=0.5$, and the pore radius that is just full there.\\exans{%.0f cm; %.1f $\\mu$m}' % ((0.5 ** (-1 / m_(1.56)) - 1) ** (1 / 1.56) / 0.036, cap_r((0.5 ** (-1 / m_(1.56)) - 1) ** (1 / 1.56) / 0.036 / 100) * 1e6),
 'A rainfed year on a loam gives $P=640$, $T=290$, $E_s=170$, $E_o=55$, $D=110$ and $Q=8$ mm. (a) Find $\\Delta S$. (b) An irrigation of 150 mm is added; the extra water is 40 per cent transpired, 35 per cent evaporated and 25 per cent drained. Find the new $T$, $E_s+E_o$ and $D$.\\exans{(a) $+7$ mm; (b) 350, 277.5, 147.5 mm}',
 'By how much does $K_r$ of the sand ($\\alpha=0.145$, $n=2.68$) fall between 50 and 300 cm? Compare with the loam over the same range.\\exans{sand: factor %s; loam: factor %s}' % ('$' + f(Kr(50, 0.145, 2.68) / Kr(300, 0.145, 2.68), 2) + '$', '$' + f(Kr(50, 0.036, 1.56) / Kr(300, 0.036, 1.56), 2) + '$')]
ES[k] = ['Field capacity and wilting point are conventions, not constants of the soil. Discuss what each convention assumes and how the choice of the suctions changes the computed available water.',
 'Explain the components of the soil-water potential and show which of them drive flow in the soil, which drive uptake by roots, and which matter in a saline soil.',
 'Compare three methods of measuring soil water (gravimetric, TDR, tensiometer). For each, state what is measured, what is inferred, and the main sources of error.',
 'Discuss the meaning of the van Genuchten parameters $\\alpha$ and $n$ in terms of the pores, and show how each changes the available water and the conductivity of a soil.',
 'Why is the conductivity of an unsaturated soil not a constant? Explain the consequences for irrigation of a sand and of a clay.',
 'Write the water balance of a root zone and discuss which of its terms are measured, which are modelled and which are obtained as a residual. What are the dangers of the residual?']
SW[k] = [('7', 'Open \\emph{Field balance} (the home layer) for the loam. Set \\emph{Rainfall scale} to 0.6, 1.0 and 1.4 and run. Tabulate rain, irrigation, transpiration, evaporation and drainage, and check that each year closes.', 'drainage rises much faster than transpiration as the rain rises'),
 ('7', 'In \\emph{Profile evolution} press \\emph{Play} and follow the wetting front after an irrigation. Estimate its depth after one and after three days.', 'the front slows as it deepens, as the conductivity of the drier soil below is low'),
 ('3', 'Change the soil in the Properties panel from the loam to the sand and back. Note how the readily available water reported on the Dashboard changes.', 'the sand holds a small fraction of the available water of the loam'),
 ('14', 'On the Dashboard open the \\emph{Charts} tab and download the yearly water balance as a CSV file. Compute $\\Delta S$ for one year by hand and compare with the program.', 'the difference is below 1 mm')]
OB[k] = None
# =================================================================== Chapter 3 (flow, roots, Daisy) key 02
k = '02'
E[k] = ['A column of loam 50 cm long is saturated and ponded with 5 cm of water; the outflow is free at the bottom. (a) Find the gradient. (b) With $K_s=25$ cm\\,d$^{-1}$, find the flux. (c) How long does 30 mm take to pass?\\exans{(a) 1.1; (b) 27.5 cm\\,d$^{-1}$; (c) 2.6 h}',
 'In Green--Ampt infiltration $i=K_s(1+\\psi_f\\Delta\\theta/F)$. A loam has $K_s=1.0$ cm\\,h$^{-1}$, wetting-front suction $\\psi_f=11$ cm and $\\Delta\\theta=0.3$. Find the infiltration rate when 1, 3 and 10 cm have infiltrated.\\exans{4.3, 2.1, 1.33 cm\\,h$^{-1}$}',
 'The Feddes function has $h_1=10$, $h_2=25$, $h_3=400$ and $h_4=8000$ cm. Find $\\alpha_s$ at 15, 200, 1000 and 5000 cm (linear in $h$ between the points).\\exans{0.333, 1.0, %.3f, %.3f}' % ((8000 - 1000) / 7600, (8000 - 5000) / 7600),
 'A root zone of 80 cm has roots distributed exponentially with $\\lambda=25$ cm. What fraction of the uptake comes from the top 20 cm and from the bottom 30 cm when the soil is wet everywhere?\\exans{%.2f; %.2f}' % ((1 - math.exp(-0.8)) / (1 - math.exp(-3.2)), (math.exp(-2) - math.exp(-3.2)) / (1 - math.exp(-3.2))),
 'A Daisy run of 20 years at daily steps logs 14 files with an average of 12 columns. How many numbers does it write? If the comprehensive summary keeps the means of each column over the 20 years, how many numbers per run remain?\\exans{about 1.2 million; 168}']
ES[k] = ['Derive the Richards equation from Darcy\'s law and the conservation of mass, and explain the assumptions that make it valid in the vadose zone.',
 'Describe how Daisy represents root water uptake. How do the root density, the soil conductivity and the atmospheric demand together determine the uptake from each layer?',
 'Explain how the hydraulic properties of a soil enter Daisy, and discuss why the choice of retention model matters less in the wet range than in the dry range.',
 'Discuss the strengths and limits of a one-dimensional model such as Daisy for irrigation by drip, where the flow is two- or three-dimensional.',
 'Explain the role of the lower boundary condition (free drainage, groundwater, drains) in a simulation of irrigation, and give an example of a wrong conclusion that a wrong boundary can cause.',
 'How does a modeller check that a long simulation is credible? Discuss the balances, the comparison with data and the sensitivity tests.']
SW[k] = [('25', 'Open the Daisy workbench and the process map. Click the boxes of root water uptake and soil water and read their descriptions. List the inputs that each box needs.', 'uptake needs the root density, the suction and the potential transpiration'),
 ('28', 'In \\emph{Experiments and scenarios} choose an irrigation scenario for the loam and look at the plan of the runs before starting. How many runs does it hold, and which factors are varied?', 'the plan lists every run with its factors and the budget'),
 ('30', 'After a run, open \\emph{Results and analysis} and the plot of soil water suction (pF) over depth and time. Identify a dry summer and the wetting by irrigation.', 'the pF rises in summer in the upper layers and falls after each irrigation'),
 ('7', 'In \\emph{Profile evolution} compare the profile of the loam and of the sand two days after the same rain. Explain the difference with the Richards equation.', 'the sand drains faster and holds less water near the surface')]
# =================================================================== Chapter 4 (triggers) key 03
k = '03'
hcs = {s: hc(SOILS[s][1], SOILS[s][2]) for s in SOILS}
E[k] = ['For the sandy loam S05 ($\\alpha=0.075$, $n=1.89$) and $\\kappa=3.47\\times10^{-10}$: (a) find the exponent $E=2n+\\ell(n-1)$ with $\\ell=0.5$; (b) find the reach $h_c$; (c) find the largest safe trigger $h_c/2$; (d) does a 600 cm trigger fire?\\exans{(a) %.3f; (b) %.0f cm; (c) %.0f cm; (d) yes}' % (2 * 1.89 + 0.5 * 0.89, hcs['S05'], hcs['S05'] / 2),
 'By what factor does the reach of the sand change if $\\kappa$ is ten times larger? And of the silty clay loam? Explain the difference.\\exans{sand %.2f, silty clay loam %.2f (smaller); the exponent $1/E$ is larger for small $n$}' % (10 ** (-1 / (2 * 2.68 + 0.5 * 1.68)), 10 ** (-1 / (2 * 1.23 + 0.5 * 0.23))),
 'An irrigation of 25 mm on a soil whose drained share follows $\\eta_D=0.3(1-e^{-d/4})$ is given (a) in one event, (b) in five events of 5 mm. Find the water drained in each case.\\exans{(a) %.1f mm; (b) %.1f mm}' % (25 * 0.3 * (1 - math.exp(-25 / 4)), 25 * 0.3 * (1 - math.exp(-5 / 4))),
 'A loam (memory fate $\\phi_D=0.29$) releases 40 mm of stored water during a dry spell. How much of it drains, and how much is available to the crop and to evaporation? Repeat for the sand ($\\phi_D=0.85$).\\exans{loam 11.6 and 28.4 mm; sand 34 and 6 mm}',
 'A sensor at 20 cm in the loam fires at 300 cm. The root zone of 0.6 m has $\\theta_{fc}=0.242$ and $\\theta=0.170$ at 300 cm. With $ET_c=5$ mm\\,d$^{-1}$ and an efficiency of 0.85, find the interval, the net and the gross depth.\\exans{8.6 d; 43 mm; 51 mm}']
ES[k] = ['Explain what the reach of a suction trigger is, why it exists, and why it depends on the shape of the conductivity curve rather than on the saturated conductivity.',
 'A farmer uses the same 300 cm trigger on all his fields. Discuss the consequences on a sand, a loam and a clay, using the reaches of the ten soils.',
 'Discuss the meaning of the memory fate of drainage and the rate-competition law. Why should one constant describe ten very different soils?',
 'Explain the fate of an irrigation millimetre. Why is it important to compare an irrigated run with the rainfed run of the same soil and years?',
 'Small doses drain less. Discuss the physical reason, the evidence of this study and the practical limits of very small doses.',
 'Why is a fixed trigger suction not a good rule for all soils, and what rule does this chapter propose instead? Discuss its advantages and its limits.']
SW[k] = [('6', 'Open \\emph{Sensor and trigger}. For the sand, set the trigger to 150, 300 and 600 cm and run \\emph{All 20 years}. Record the irrigation and the yield. At which trigger does the irrigation stop?', 'the sand is never irrigated above its reach of about 200 cm'),
 ('6', 'In the same layer, drag the purple trigger marker on the loam from 100 to 1000 cm and watch the next irrigation date and the depletion. Relate the interval to the readily available water.', 'the interval grows with the trigger until the crop is stressed'),
 ('6', 'Open \\emph{Trigger law} and read the depletion of the root zone at the trigger for three soils. Check that a single depletion fraction near 0.45 to 0.5 describes them.', 'the triggers of all soils collapse onto one depletion fraction'),
 ('18', 'Use the search for the most efficient inputs on the drip layer of the loam with the trigger free. Which trigger does the search choose, and how does it compare with the reach?', 'the chosen trigger lies well inside the reach')]
# =================================================================== Chapter 5 (auditing) key 04
k = '04'
E[k] = ['Five yearly drainage values from Daisy are 150, 210, 95, 180, 130 mm and from a simple model 165, 190, 120, 170, 150 mm. Find the RMSE, the bias and the Nash--Sutcliffe efficiency.\\exans{%s}' % (lambda o, p: '%.1f mm; %+.1f mm; %.2f' % (math.sqrt(sum((a - b) ** 2 for a, b in zip(p, o)) / 5), sum(a - b for a, b in zip(p, o)) / 5, 1 - sum((a - b) ** 2 for a, b in zip(p, o)) / sum((b - sum(o) / 5) ** 2 for b in o)))([150, 210, 95, 180, 130], [165, 190, 120, 170, 150]),
 'A water balance gives inputs of 755 mm and outputs of 742 mm with a storage rise of 4 mm. Find the residual and the relative closure error. Is it acceptable if the tolerance is 1 per cent of the inputs?\\exans{9 mm; 1.2 per cent; no}',
 'Of 10\\,190 runs, 149 failed. What fraction is valid? If failures were concentrated in one experiment of 740 runs with 120 failures, what fraction of that experiment failed, and why does it matter for the conclusions?\\exans{0.985; 0.162; the failures are not random}',
 'A law has an in-sample RMSE of 0.03 and a leave-one-soil-out RMSE of 0.12. A second law has 0.05 and 0.06. Which should be used, and why?\\exans{the second; the first is overfitted}',
 'Split the mean squared error of a model with $\\overline O=300$, $\\overline P=285$, $s_O=60$, $s_P=50$ and $r=0.9$ into bias, scale and scatter.\\exans{225, 16, 684; MSE 925}']
ES[k] = ['What does it mean to audit a model? Describe the steps of the audit of the water balance in this book and what each step can and cannot reveal.',
 'Discuss the unattributed term of the water balance: how it arises, how it was detected and why it matters for the interpretation of evaporation savings.',
 'Compare in-sample fit with leave-one-out prediction. Why is the second the stronger test of a law, and when can even it mislead?',
 'Explain why failed runs should be kept and analysed rather than deleted. Give examples of what failures can teach about a model.',
 'Discuss the difference between verification and validation of a model and give one example of each from SWAFL.',
 'A compact law reproduces evapotranspiration of an ensemble with high skill. Discuss what such a law is useful for and where it must not be used.']
SW[k] = [('14', 'Run the field balance of the loam and open the \\emph{Messages} tab of the Dashboard. Note every warning about the closure of the balance and explain it.', 'no warning when the balance closes within 1 mm'),
 ('30', 'In the Daisy results open \\emph{Processes, plots, balance and tests} for one experiment and read the mass balance of water and nitrogen.', 'the residuals are small compared with the fluxes'),
 ('30', 'Open \\emph{Why a run gave no results} for an experiment with a failed run and find the line of the set-up that caused it.', 'the cause is located at a line of the set-up file'),
 ('22', 'Open \\emph{Full water balance} in the seasonal data and check the closure of three seasons by hand.', 'each season closes within rounding')]
# =================================================================== Chapter 6 (ET) key 05
k = '05'
E[k] = ['A maize crop has $K_{c,ini}=0.3$, $K_{c,mid}=1.2$, $K_{c,end}=0.6$, with stages of 25, 40, 45 and 30 days. Find $K_c$ on days 10, 45, 90 and 125.\\exans{0.30, 0.75, 1.20, 0.90}',
 'With $ET_0=5.5$ mm\\,d$^{-1}$ on day 90 of the crop above, $\\TAW=140$ mm, $p=0.55$ and a depletion of 100 mm, find $K_s$ and the actual water use.\\exans{%.3f; %.2f mm\\,d$^{-1}$}' % ((140 - 100) / (0.45 * 140), (140 - 100) / (0.45 * 140) * 1.2 * 5.5),
 'Over a season a crop uses 420 mm out of a potential 560 mm. With $K_y=1.25$ and $Y_m=11$ Mg\\,ha$^{-1}$, find the expected yield and the water productivity of the actual water use.\\exans{%.2f Mg\\,ha$^{-1}$; %.2f kg\\,m$^{-3}$}' % (11 * (1 - 1.25 * (1 - 420 / 560)), 11000 * (1 - 1.25 * (1 - 420 / 560)) / 4200),
 'The evaporation from a bare soil in stage 2 follows $E=\\beta\\sqrt t$ with $\\beta=4$ mm\\,d$^{-1/2}$. How much evaporates in the first 4 days and in the next 5 days of stage 2?\\exans{8 mm; 4 mm}',
 'A crop with $K_c=1.05$ on a day with $ET_0=6.2$ mm\\,d$^{-1}$ is irrigated by a drip system that wets 40 per cent of the surface. If soil evaporation is proportional to the wetted fraction and is 15 per cent of $ET_c$ under full wetting, how much is saved per day?\\exans{0.59 mm}']
ES[k] = ['Explain the physical basis of the Penman--Monteith equation and why it is preferred to empirical equations for irrigation scheduling.',
 'Discuss the single and the dual crop coefficient methods. When does the separation of soil evaporation from transpiration matter?',
 'Explain how water stress reduces transpiration and yield. Why is the response of yield to water not linear for all crops?',
 'Discuss the crop library of SWAFL: what information each crop carries and how a change of crop changes the other layers.',
 'Compare the crop coefficients of a crop grown under drip and under sprinkler irrigation, and explain the difference.',
 'Why is evaporation from the soil surface a target of water saving, and what are the limits of such savings?']
SW[k] = [('21', 'Open \\emph{Crop water requirement} and choose maize, then wheat. Compare the $K_c$ curves and the seasonal water need.', 'maize has a higher mid-season $K_c$ and a later peak'),
 ('21', 'In the same layer change the planting date by one month and record the change of the seasonal requirement.', 'a later planting shifts the peak into the hotter period'),
 ('19', 'Import a weather file or use \\emph{The weather of a place} for your own town and compare $ET_0$ with the benchmark record.', 'the reference demand reflects your climate'),
 ('22', 'Open \\emph{Reliability over 20 seasons} and read the years in which the crop was stressed. Relate them to the weather of those years.', 'stress years coincide with dry, hot seasons')]
# =================================================================== Chapter 7 (design math) key 06
k = '06'
hf = 10.67 * 300 * 0.02 ** 1.852 / (130 ** 1.852 * 0.15 ** 4.87)
E[k] = ['A main of 300 m and 150 mm diameter carries 20 L\\,s$^{-1}$ (Hazen--Williams $C=130$). (a) Find the friction loss. (b) The outlet is 4 m higher than the pump and needs 25 m of pressure: find the pump head (add 10 per cent for local losses).\\exans{(a) %.2f m; (b) %.1f m}' % (hf, 1.1 * hf + 4 + 25),
 'The pump of the previous exercise has an efficiency of 0.70. Find the power. How much energy does it use to apply 50 mm to 5 ha?\\exans{%.1f kW; %.0f kWh}' % (9810 * 0.02 * (1.1 * hf + 29) / 0.7 / 1000, 9810 * 0.02 * (1.1 * hf + 29) / 0.7 / 1000 * (2500 / 0.02 / 3600)),
 'A Kostiakov--Lewis intake $Z=k\\tau^a+f_0\\tau$ has $k=0.008$ m\\,min$^{-a}$, $a=0.4$ and $f_0=0.0001$ m\\,min$^{-1}$. Find the depth infiltrated in 60 and 240 min.\\exans{%.1f mm; %.1f mm}' % (1000 * (0.008 * 60 ** 0.4 + 0.0001 * 60), 1000 * (0.008 * 240 ** 0.4 + 0.0001 * 240)),
 'Manning: a furrow carries 1.5 L\\,s$^{-1}$ on a slope of 0.003 with $n=0.04$. For a trapezoid with bottom 0.1 m and side slope 1, the flow depth is 0.08 m. Find the area, the wetted perimeter, the velocity by Manning and the discharge it gives.\\exans{%s}' % (lambda A, P: '0.0144 m$^2$; %.3f m; %.3f m\\,s$^{-1}$; %.1f L\\,s$^{-1}$' % (P, (A / P) ** (2 / 3) * 0.003 ** 0.5 / 0.04, 1000 * A * (A / P) ** (2 / 3) * 0.003 ** 0.5 / 0.04))(0.1 * 0.08 + 0.08 ** 2, 0.1 + 2 * 0.08 * math.sqrt(2)),
 'A field 300 m by 200 m receives a gross depth of 70 mm in a set of 12 h. Find the flow needed. How many sets of 1 ha can a supply of 40 L\\,s$^{-1}$ irrigate in 7 days of 24 h, at 70 mm each?\\exans{97.2 L\\,s$^{-1}$; 34 sets}']
ES[k] = ['Explain the energy equation for flow in pipes, and how the friction and local losses set the size of a pump.',
 'Compare the Kostiakov, Kostiakov--Lewis and Green--Ampt descriptions of infiltration. What does each represent physically, and when is each appropriate?',
 'Discuss how weather data are put on the twenty-year grid of SWAFL, and the errors that can arise when a short or incomplete record is used.',
 'Explain what satellite vegetation indices can and cannot tell about the water status of a field.',
 'Discuss the choice of an irrigation system for a field: which properties of the soil, the water source, the crop and the farm decide between surface, drip and sprinkler?',
 'Why are uniformity and efficiency different measures? Show with an example how a uniform system can still be inefficient.']
SW[k] = [('20', 'Find your farm on the satellite map, demarcate it and read the vegetation and water indices. Comment on the variation within the field.', 'the indices vary with soil and crop cover'),
 ('20', 'Add a water source and let the program propose an irrigation system for the field. Record the proposal and the reasons it gives.', 'the proposal depends on the slope, the soil and the source'),
 ('19', 'Import a weather file of your own and switch back to the benchmark record. Compare the yearly rain and the reference evapotranspiration.', 'the comparison shows how your climate differs'),
 ('18', 'Enter the field size as a length and a width and as an area, and check that the design layers give the same volumes.', 'the volumes agree')]
# =================================================================== Chapter 8 (tour) key 07
k = '07'
E[k] = ['A project uses the loam with a 300 cm trigger. Give the sequence of layers you would open to answer: (a) how much water is saved by a mulch; (b) where the saved water goes; (c) whether the saving reduces irrigation.\\exans{(a) Mulch against bare soil; (b) Fate of saved water; (c) Field balance with and without mulch}',
 'The Dashboard reports a yield of 6.1 Mg\\,ha$^{-1}$, irrigation 140 mm and rainfed yield 4.3 Mg\\,ha$^{-1}$. Find the irrigation water use efficiency in kg\\,m$^{-3}$.\\exans{1.29 kg\\,m$^{-3}$}',
 'A layer shows 20 years of results. If each year has 365 daily values for 8 variables, how many values does the layer draw? Why does the Dashboard show annual means instead?\\exans{58\\,400; to keep the reading clear}',
 'Two layers give the drainage of the same soil as 160 and 175 mm. List three reasons that may explain the difference.\\exans{different engines, inputs or periods}',
 'Explain, with numbers, how the change of soil from the loam ($\\TAW=150$ mm) to the sand ($\\TAW=60$ mm) changes the interval between irrigations at $ET_c=5$ mm\\,d$^{-1}$ and $p=0.5$.\\exans{15 d to 6 d}']
ES[k] = ['Describe the organisation of SWAFL into layers. Why is a layered organisation useful for teaching and for decision making?',
 'Explain how the layers share one project and how a change in one layer appears in another.',
 'Compare the answers of the layers with those of a new Daisy run. When is each the right tool?',
 'Discuss the role of the Dashboard as the common output of all layers.',
 'Why does each number on the screen carry its equation? Discuss the value of equation traceability for students and for advisers.',
 'Choose one layer and describe how you would use it to advise a farmer, step by step.']
SW[k] = [('2', 'Open SWAFL and the welcome dialog; start a new project and open each group of the Layers panel in turn. List the layers of each group.', 'the groups and layers listed in the manual'),
 ('3', 'Change three Properties (soil, crop, trigger) and observe which layers redraw.', 'every layer that depends on the property redraws'),
 ('14', 'Open the four tabs of the Dashboard and describe what each shows for the field balance.', 'results, design, charts and messages'),
 ('16', 'Export the results of one layer and open them in a spreadsheet.', 'the exported file holds the values shown on screen')]
# =================================================================== Chapter 9 (engines) key 08
k = '08'
E[k] = ['A baseline drainage of 120 mm is changed by $+35$ mm by a trigger and by $-12$ mm by a mulch in their own experiments. Find the drainage composed by differences.\\exans{143 mm}',
 'Engine 1 predicts 1000 held-out runs with RMSE 18 mm for drainage, whose standard deviation is 70 mm. Find the fraction of the variance explained (approximately $1-RMSE^2/s^2$).\\exans{0.93}',
 'Engine 2 solves the Richards equation with layers of 2 cm over 1.5 m and a time step of 10 min. How many layer-steps does it compute in a season of 150 days?\\exans{1.62 million}',
 'A composed yield is $Y_0\\times1.10\\times0.95\\times1.07$ with $Y_0=5.2$ Mg\\,ha$^{-1}$. Find the yield and the overall ratio.\\exans{5.81 Mg\\,ha$^{-1}$; 1.118}',
 'A layer is re-anchored: its predictions were 6 per cent too high on average. If the shipped prediction of a yield is 6.36 Mg\\,ha$^{-1}$, what is the re-anchored value?\\exans{6.0 Mg\\,ha$^{-1}$}']
ES[k] = ['Explain the principle of Engine 1. Why can composition by ratios and differences reproduce a complex model, and where does it fail?',
 'Describe Engine 2 and the numerical solution of the Richards equation. What controls its accuracy and its speed?',
 'Discuss the held-out test of an engine. What does it show, and what can it not show?',
 'Explain how the Dashboard reports the results of the engines, and why the messages tab matters.',
 'Compare a meta-model with the model it imitates, using SWAFL and Daisy as the example.',
 'Discuss the danger of extrapolation with an engine built from an ensemble.']
SW[k] = [('5', 'Run the same field balance with Engine 1 and with Engine 2. Compare the drainage and the evaporation and explain the difference.', 'the two engines agree closely on annual totals'),
 ('14', 'Read the \\emph{Design} tab of the Dashboard for the drip layer and identify which numbers come from which equation.', 'each number names its equation'),
 ('18', 'Run a design and watch the value window of an input. Change the input through its full range and record the result.', 'the result changes smoothly with the input'),
 ('22', 'Project the seasons after the last simulated one and comment on the reliability of the projection.', 'the projection carries the uncertainty of the record')]
# =================================================================== Chapter 10 (structure, mulch, loops) key 09
k = '09'
E[k] = ['A tilled layer has $\\phi_0=0.58$, $\\phi_c=0.46$ and $\\tau_c=45$ days. Find the porosity after 15, 45 and 120 days, and the time to lose 90 per cent of the gain.\\exans{%.3f, %.3f, %.3f; %.0f d}' % (0.46 + 0.12 * math.exp(-15 / 45), 0.46 + 0.12 * math.exp(-1), 0.46 + 0.12 * math.exp(-120 / 45), 45 * math.log(10)),
 'A mulch saves 80 mm of evaporation in a season on the loam ($\\psi_D=0.47$) and 50 mm on the sand ($\\psi_D=0.71$). Find the recoverable water on each soil.\\exans{42.4 mm; 14.5 mm}',
 'A crop residue of 4 cm with tortuosity 2 lies over a wet soil. Find its resistance ($D_v=2.5\\times10^{-5}$ m$^2$\\,s$^{-1}$) and the fraction of evaporation remaining with $r_a=60$ and with $r_a=200$ s\\,m$^{-1}$.\\exans{3200 s\\,m$^{-1}$; 0.018; 0.059}',
 'A feedback loop has the links $+0.6$, $-0.5$ and $+0.4$. Find the gain, its sign and the amplification of a first perturbation.\\exans{$-0.12$; negative; 0.89}',
 'In the regime map, the drainage share of saved water is 0.3 at a rain scale of 0.6 and 0.8 at 1.4. Assuming a linear change, at which rain scale is half of the saved water drained?\\exans{0.92}']
ES[k] = ['Explain how tillage and consolidation change the hydraulic properties of a soil, and how these changes affect irrigation.',
 'Discuss the physics of evaporation under a mulch. Why does the saving depend on the soil and on the rain?',
 'Explain the fate of the water saved by mulch and why a saving is not a gain until it is judged against a closed balance.',
 'Describe the regime map and what its regions mean for a farmer who wants to save water.',
 'Discuss the feedback loops between climate, management, soil water, crop and nitrogen shown in SWAFL. Which are positive and which negative?',
 'Root structure changes the reach of the crop. Discuss how a deeper or denser root system changes the trigger and the dose.']
SW[k] = [('8', 'Open \\emph{Tillage and structure}; compare no-till and tillage for the loam and record the drainage and the evaporation.', 'tillage raises the infiltration and changes the drainage'),
 ('9', 'Open \\emph{Mulch control}; vary the mulch strength from 0 to the maximum and record the saving of evaporation.', 'the saving rises and then levels off'),
 ('9', 'Open \\emph{Fate of saved water} and \\emph{Regime map}; find the rain scale at which most of the saving drains.', 'in wet climates most of the saving drains'),
 ('10', 'Open \\emph{Feedback loops}; follow the seven effects and write the sentence under the picture in your own words.', 'each effect has a sign and a size')]
# =================================================================== Chapter 11 (phenotyping) key 10
k = '10'
E[k] = ['A plant crown has semi-axes 0.35, 0.30 and 0.45 m. Find the ellipsoid volume. After drought the horizontal axes fall by 20 per cent: find the new volume and the fall.\\exans{%.3f m$^3$; %.3f m$^3$; 36 per cent}' % (4 / 3 * math.pi * 0.35 * 0.30 * 0.45, 4 / 3 * math.pi * 0.28 * 0.24 * 0.45),
 'A ring of 8 cameras surrounds a plant. Find the angle between neighbouring views. If each camera sees $\\pm30^\\circ$ about its axis, how many cameras see each point of the outer crown?\\exans{45$^\\circ$; one or two (overlap $15^\\circ$)}',
 'A leaf rolls when its water potential falls below $-1.2$ MPa. Convert this to a suction in cm of water and in pF.\\exans{12\\,232 cm; pF 4.09}',
 'The deterministic plant gains 3.5 g of dry matter per day when well watered and 2.1 g under drought. Over 140 days, find the final masses if both start at 0.5 g and the drought begins on day 60.\\exans{490.5 g and 378.5 g}',
 'A scan has a point spacing of 2 mm. How many points cover a leaf of 300 cm$^2$?\\exans{7500}']
ES[k] = ['Explain what phenotyping is and why a virtual, deterministic phenotyping experiment is useful for teaching.',
 'Describe the steps of a three-dimensional scan, from the views to the measured traits.',
 'Discuss how drought appears in the traits of a plant and how a scanner can detect it before yield falls.',
 'Compare the deterministic and the volumetric phenotyping layers: what each computes and how they are linked.',
 'Discuss the limits of a virtual scanner compared with a real one.',
 'How could phenotyping data be used to set an irrigation trigger?']
SW[k] = [('8', 'Open \\emph{Deterministic phenotyping}; run the well-watered and the drought plants side by side and record the height and leaf area at day 70 and day 140.', 'the drought plant is smaller and rolls its leaves'),
 ('8', 'Open \\emph{Volumetric phenotyping}; follow the scan step by step and note the number of views and the registration.', 'the views are joined into one cloud'),
 ('8', 'Change the soil from the loam to the sand and repeat the phenotyping. Explain the difference with the water held by each soil.', 'the plant on the sand is stressed earlier'),
 ('8', 'Change the mulch and the tillage and observe the effect on the plant.', 'mulch delays the stress')]
# =================================================================== Chapter 12 (surface) key 11
k = '11'
E[k] = ['Advance to the end of a border takes 90 min, the cut-off is at 240 min and recession is uniform in 15 min. With $Z=0.006\\tau^{0.45}$ (m, min), find the depths at the head and the tail and the distribution uniformity (tail over mean of head and tail).\\exans{%.1f mm; %.1f mm; %.2f}' % (1000 * 0.006 * 255 ** 0.45, 1000 * 0.006 * 165 ** 0.45, (0.006 * 165 ** 0.45) / ((0.006 * 255 ** 0.45 + 0.006 * 165 ** 0.45) / 2)),
 'A furrow of 250 m receives 1.2 L\\,s$^{-1}$ for 6 h; the furrow spacing is 0.75 m. Find the gross depth applied. If 55 mm is stored in the root zone, find the application efficiency.\\exans{138 mm; 0.40}',
 'Find the flow area, wetted perimeter and hydraulic radius of a furrow with bottom 0.15 m, side slope 1.5 and depth 0.1 m.\\exans{0.030 m$^2$; 0.511 m; 0.059 m}',
 'Using $Z=0.0045\\tau^{0.5}$ (m, min), find the opportunity time needed for 75 mm, and the cut-off time if the advance takes 140 min and the required depth must be reached at the tail (neglect recession).\\exans{278 min; 418 min}',
 'A set lasts at most 48 hours. How many sets are needed to irrigate 60 furrows of 250 m with 1.5 L\\,s$^{-1}$ each from a supply of 30 L\\,s$^{-1}$, with 8 h per set?\\exans{3 sets of 20 furrows; 24 h}']
ES[k] = ['Describe the phases of a surface irrigation (advance, wetting, depletion, recession) and how each affects uniformity.',
 'Explain the volume-balance method of computing the advance, and its main assumption.',
 'Discuss the choice between furrow, border and basin irrigation for a given soil and slope.',
 'Explain why the intake of the soil is the most uncertain input of a surface design, and how SWAFL estimates it from the texture.',
 'Discuss the trade-off between the application efficiency and the uniformity in surface irrigation.',
 'Explain how cut-back and surge flow improve a furrow irrigation.']
SW[k] = [('11', 'Open \\emph{Surface irrigation design} in \\emph{Your soil} mode for the loam. Record the intake, the advance time, the cut-off and the efficiencies.', 'the design table lists them'),
 ('11', 'Use \\emph{Best inflow}; compare the efficiency at the best inflow with half and double that inflow.', 'the efficiency is highest near the best inflow'),
 ('11', 'Read the tornado chart of the sensitivity. Which input changes the efficiency most?', 'usually the intake or the inflow'),
 ('11', 'Read the irrigation schedule and the message \\emph{When to irrigate}. Check the next date against the sensor and the trigger.', 'the date follows the depletion')]
# =================================================================== Chapter 13 (drip) key 12
k = '12'
hfd = 10.67 * 80 * (160 / 1000 / 3600) ** 1.852 / (140 ** 1.852 * 0.016 ** 4.87)
Fd = 1 / 2.852 + 1 / 160 + math.sqrt(0.852) / (6 * 80 ** 2)
E[k] = ['A lateral of 80 m, inside diameter 16 mm, carries 80 emitters of 2 L\\,h$^{-1}$. Find the friction loss with the Christiansen factor ($C=140$).\\exans{%.2f m}' % (hfd * Fd),
 'An emitter has $q=kH^{x}$ with $q=2.0$ L\\,h$^{-1}$ at 10 m and $x=0.5$. Find $q$ at 8 m and 12 m and the variation of the flow over this range of head.\\exans{%.2f and %.2f L\\,h$^{-1}$; %.0f per cent}' % (2 * math.sqrt(0.8), 2 * math.sqrt(1.2), 100 * (2 * math.sqrt(1.2) - 2 * math.sqrt(0.8)) / 2),
 'A drip block has 2400 emitters of 2 L\\,h$^{-1}$. Find the flow of the block in m$^3$\\,h$^{-1}$ and in L\\,s$^{-1}$. If the crop needs 4 mm\\,d$^{-1}$ on 0.6 ha, how long must the block run per day at an efficiency of 0.9?\\exans{4.8 m$^3$\\,h$^{-1}$; 1.33 L\\,s$^{-1}$; 5.6 h}',
 'Find $EU$ for emitters with $C_v=0.07$, two per plant, and $q_{\\min}/q_{\\mathrm{avg}}=0.9$.\\exans{%.1f per cent}' % (100 * (1 - 1.27 * 0.07 / math.sqrt(2)) * 0.9),
 'A wetted bulb in a sandy loam has a radius of 0.35 m at the surface. What emitter spacing gives a continuous strip with 20 per cent overlap?\\exans{0.56 m}']
ES[k] = ['Explain the hydraulics of a drip lateral and how the length, the diameter and the slope determine the uniformity.',
 'Discuss the wetted bulb: what controls its shape and why it matters for the spacing of emitters and for the crop.',
 'Compare drip and sprinkler irrigation in terms of evaporation, drainage and salinity.',
 'Explain emission uniformity and how manufacturing variation and pressure variation combine.',
 'Discuss the design of a drip system for a whole farm: blocks, mains, filtration and the pump.',
 'Why does drip irrigation not always save water at the scale of a basin?']
SW[k] = [('12', 'Open \\emph{Drip irrigation design}; for the loam and the sand, record the bulb radius and depth for the same emitter.', 'the sand bulb is narrower and deeper'),
 ('12', 'Change the lateral length in steps of 20 m and record the emission uniformity. Find the longest acceptable lateral.', 'the uniformity falls with length'),
 ('12', 'Use \\emph{To size a pump} and record the head and the power for the farm.', 'the pump head includes friction and pressure'),
 ('18', 'Compare the three systems on this field and record which one the program prefers and why.', 'the comparison lists water, energy and uniformity')]
# =================================================================== Chapter 14 (sprinkler) key 13
k = '13'
qn = 0.95 * math.pi * 0.002 ** 2 * math.sqrt(2 * 9.81 * 35 * 1000 / 9810 * 10 / 10 * 1)
E[k] = ['A nozzle of 4 mm ($C_d=0.95$) works at 350 kPa. Find the discharge and the application rate on a $12\\times12$ m spacing.\\exans{%s m$^3$\\,h$^{-1}$; %.1f mm\\,h$^{-1}$}' % ('%.2f' % (0.95 * math.pi * 0.002 ** 2 * math.sqrt(2 * 9.81 * 350000 / 9810) * 3600), 0.95 * math.pi * 0.002 ** 2 * math.sqrt(2 * 9.81 * 350000 / 9810) * 3600 / 144 * 1000),
 'Catch cans collect 9, 11, 10, 12, 8, 10, 11, 9, 13, 7 mm. Find Christiansen\'s CU and the low-quarter distribution uniformity (mean of the lowest quarter over the mean).\\exans{%.0f per cent; %.2f}' % ((lambda d: 100 * (1 - sum(abs(x - sum(d) / len(d)) for x in d) / (len(d) * sum(d) / len(d))))([9, 11, 10, 12, 8, 10, 11, 9, 13, 7]), (7 + 8 + 9 * 0.5) / 2.5 / 10),
 'Wind drift and evaporation lose 12 per cent of the water and the distribution efficiency is 0.85. Find the application efficiency and the gross depth for a net 30 mm.\\exans{0.75; 40 mm}',
 'A soil has a basic intake of 8 mm\\,h$^{-1}$. What is the largest nozzle discharge on an $18\\times18$ m spacing that avoids runoff?\\exans{2.59 m$^3$\\,h$^{-1}$}',
 'Ideal jet range: find $v_0^2\\sin2\\vartheta/g$ for $v_0=25$ m\\,s$^{-1}$ at $25^\\circ$, and compare with a measured wetted radius of 18 m.\\exans{%.1f m; drag and break-up cut it to less than half}' % (25 ** 2 * math.sin(math.radians(50)) / 9.81)]
ES[k] = ['Explain the overlap of sprinkler patterns and why the spacing must change with the wind.',
 'Discuss the losses of sprinkler irrigation (drift, evaporation, runoff) and how each is reduced.',
 'Explain the maximum allowable application rate and why it depends on the soil, the slope and the cover.',
 'Compare set, travelling and centre-pivot sprinklers for a farm of your choice.',
 'Explain the ten textbook checks of the sprinkler layer and what each guards against.',
 'Why can a sprinkler with high uniformity still cause runoff?']
SW[k] = [('13', 'Open \\emph{Sprinkler design and pipes}; for one nozzle record the discharge, the wetted radius and the application rate at three pressures.', 'discharge rises as the square root of pressure'),
 ('13', 'Change the wind speed and record the uniformity and the drift loss.', 'uniformity falls and drift rises with wind'),
 ('13', 'Use \\emph{To reduce runoff} on the silt loam and record the change the program proposes.', 'a lower application rate'),
 ('13', 'Read the ten textbook checks and verify one of them by hand.', 'the hand value agrees within 2 per cent')]
# =================================================================== Chapter 15 (drainage) key 14
k = '14'
L2 = (8 * 1.2 * 2.0 * 0.6 + 4 * 1.2 * 0.36) / 0.010
E[k] = ['Find the drain spacing by Hooghoudt for $K=1.2$ m\\,d$^{-1}$, $d_e=2.0$ m, $h=0.6$ m and $q=10$ mm\\,d$^{-1}$.\\exans{%.1f m}' % math.sqrt(L2),
 'Repeat the previous exercise with $d_e=1.0$ m and comment on the effect of the depth of the impermeable layer.\\exans{%.1f m}' % math.sqrt((8 * 1.2 * 1.0 * 0.6 + 4 * 1.2 * 0.36) / 0.010),
 'With the spacing of the first exercise, $\\mu=0.06$ and $D=2.3$ m, find the reaction factor of Glover--Dumm and the time for the water table to fall to a quarter of its height.\\exans{%.3f d$^{-1}$; %.1f d}' % (math.pi ** 2 * 1.2 * 2.3 / (0.06 * L2), math.log(1.16 / 0.25) / (math.pi ** 2 * 1.2 * 2.3 / (0.06 * L2))),
 'A drain of 100 mm diameter at a slope of 0.002 must carry the discharge of a field of 300 m by 40 m at 10 mm\\,d$^{-1}$. Find the discharge in L\\,s$^{-1}$.\\exans{1.39 L\\,s$^{-1}$}',
 'Irrigation water of salinity 1.2 dS\\,m$^{-1}$ is applied to a crop tolerating 4 dS\\,m$^{-1}$ in the drainage water. Find the leaching requirement $LR=EC_i/EC_d$ and the gross depth for a net 500 mm.\\exans{0.30; 714 mm}']
ES[k] = ['Explain the Hooghoudt equation and the meaning of the equivalent depth.',
 'Discuss the steady and the unsteady approaches to drain design, and when each is appropriate.',
 'Explain why drainage and irrigation must be designed together in arid regions.',
 'Discuss controlled drainage and its benefits for water and nitrogen.',
 'Explain the leaching requirement and its link to the salinity of the irrigation water.',
 'Discuss how the same drains behave in the ten soils of the study.']
SW[k] = [('13A', 'Open \\emph{Drainage design}; record the spacing for the loam and for the clay loam at the same design flow.', 'the clay loam needs closer drains'),
 ('13A', 'Change the design flow from 5 to 15 mm\\,d$^{-1}$ and plot the spacing.', 'the spacing falls roughly as $1/\\sqrt q$'),
 ('13A', 'Read the water table through the season and find the wettest period.', 'the table is highest after the winter rain'),
 ('13A', 'Read \\emph{The same drains in every soil} and rank the soils by the depth of the water table.', 'the fine soils keep the highest table')]
# =================================================================== Daisy process map, chapters 16-18 (keys 15-17)
k = '15'
E[k] = ['Using the data of the net-radiation example of this chapter, find $R_n$ if the sunshine falls to 4 h (same day and temperatures).\\exans{%s}' % (lambda: (lambda Rs, Rso: '%.2f MJ\\,m$^{-2}$\\,d$^{-1}$' % (0.77 * Rs - 4.903e-9 * (298.26 ** 4 + 292.26 ** 4) / 2 * (0.34 - 0.14 * math.sqrt(2.1)) * (1.35 * Rs / Rso - 0.35)))((0.25 + 0.5 * 4 / 15.725) * 40.2146, 0.752 * 40.2146))(),
 'A soil has a thermal diffusivity of $3\\times10^{-7}$ m$^2$\\,s$^{-1}$. Find the daily damping depth and the depth at which the daily amplitude is one tenth of the surface amplitude.\\exans{%.3f m; %.2f m}' % (math.sqrt(2 * 3e-7 / (2 * math.pi / 86400)), math.log(10) * math.sqrt(2 * 3e-7 / (2 * math.pi / 86400))),
 'A canopy with $L=4$ stores 0.2 mm per unit leaf area. Of a 10 mm rain, how much is intercepted and how much reaches the soil? Of five rains of 2 mm, separated by drying?\\exans{0.8 and 9.2 mm; 4.0 and 6.0 mm}',
 'A snowpack of 120 mm water equivalent melts with $C_m=4$ mm\\,$^\\circ$C$^{-1}$\\,d$^{-1}$ at 5 $^\\circ$C. How long does it last? How much drains below a root zone that can store 60 mm more?\\exans{6 d; 60 mm}',
 'Find the capillary rise from a water table at 120 cm for a soil with $K_s=20$ cm\\,d$^{-1}$ and $a=0.03$ cm$^{-1}$.\\exans{%.2f mm\\,d$^{-1}$}' % (10 * 20 * math.exp(-3.6) / (1 - math.exp(-3.6)))]
ES[k] = ['Explain the process map of Daisy and the four kinds of line. How does the map help to read a simulation?',
 'Describe the chain from the weather to the potential evapotranspiration of the crop and the soil in Daisy.',
 'Discuss the water stores above the soil (snow, canopy, litter, pond) and the order in which they are filled and emptied.',
 'Explain how heat moves in the soil and why the soil temperature matters for water and nitrogen.',
 'Discuss the role of biopores and drains in the water balance of a field.',
 'Compare four equations of the reference evapotranspiration and discuss when each should be used.']
SW[k] = [('25', 'Open the Daisy process map and click every box of the weather, water and heat part. For each, write the equation it uses.', 'each box opens its description and equation'),
 ('19', 'Use \\emph{The weather of a place} to download the weather of your town and check the radiation and temperature.', 'the record covers the twenty-year grid'),
 ('30', 'Open the plot of the soil temperature of a run and read the annual amplitude at two depths.', 'the amplitude falls with depth'),
 ('30', 'Read the water balance of a run in the raw output and close it for one year.', 'the residual is small')]
k = '16'
E[k] = ['A crop with $T_b=5$ $^\\circ$C needs 1500 $^\\circ$C\\,d to maturity. With mean temperatures of 14 $^\\circ$C in May, 18 in June, 21 in July and 20 in August (31, 30, 31, 31 days), on which month does it mature?\\exans{in August (%.0f $^\\circ$C\\,d by the end of July)}' % (9 * 31 + 13 * 30 + 16 * 31),
 'Find the leaf area that intercepts 90 per cent of the light with $k=0.5$ and with $k=0.8$.\\exans{%.2f; %.2f}' % (math.log(10) / 0.5, math.log(10) / 0.8),
 'A maize crop with RUE 3.8 g\\,MJ$^{-1}$ intercepts 85 per cent of 11 MJ\\,m$^{-2}$\\,d$^{-1}$ of PAR for 70 days. Find the dry matter produced and the grain yield with a harvest index of 0.5.\\exans{%.0f g\\,m$^{-2}$; %.1f Mg\\,ha$^{-1}$}' % (3.8 * 0.85 * 11 * 70, 3.8 * 0.85 * 11 * 70 * 0.5 / 100),
 'A crop of 1200 g\\,m$^{-2}$ has $c_m=0.012$ g\\,g$^{-1}$\\,d$^{-1}$ at 25 $^\\circ$C and $Q_{10}=2$. Find the maintenance respiration at 18 $^\\circ$C.\\exans{%.1f g\\,m$^{-2}$\\,d$^{-1}$}' % (0.012 * 1200 * 2 ** (-0.7)),
 'A soybean crop ($K_y=0.85$) receives 70 per cent of its seasonal water need. With $Y_m=3.5$ Mg\\,ha$^{-1}$, find $Y_a$.\\exans{%.2f Mg\\,ha$^{-1}$}' % (3.5 * (1 - 0.85 * 0.3))]
ES[k] = ['Describe the chain of stores of the crop in Daisy, from the light to the harvested organ.',
 'Explain thermal time and why it is a better clock for a crop than calendar days.',
 'Discuss the light-response curve of a leaf and why a canopy is more efficient than its leaves.',
 'Explain maintenance and growth respiration and the effect of warming on the carbon budget of a crop.',
 'Discuss how water stress enters the crop model and how it is expressed in yield.',
 'Explain the management column of the process map and how sowing, fertilisation, irrigation and harvest enter a simulation.']
SW[k] = [('25', 'Click every box of the crop part of the Daisy process map and list the stores and the flows of carbon.', 'leaves, stems, storage organ and roots'),
 ('30', 'Open the dry matter of the organs of a run and read the harvest index of three years.', 'the harvest index varies with the season'),
 ('21', 'Change the crop of the project and compare the crop water requirement.', 'each crop has its own $K_c$ curve'),
 ('28', 'Design a Daisy experiment that varies the sowing date over four levels and run it.', 'the yield changes with the sowing date')]
k = '17'
E[k] = ['Fresh manure has $k=0.05$ d$^{-1}$ at 20 $^\\circ$C. Find its half-life at 20 $^\\circ$C and at 10 $^\\circ$C ($Q_{10}=2$).\\exans{13.9 d; 27.7 d}',
 'Clover residues (C:N 15) of 3 t DM\\,ha$^{-1}$ (42 per cent C) decompose fully with $e=0.4$ and $CN_m=8$. Find the net N released.\\exans{%.0f kg N\\,ha$^{-1}$}' % (1260 / 15 - 1260 * 0.4 / 8),
 'A herbicide has $K_{oc}=100$ L\\,kg$^{-1}$; the soil has 1.5 per cent organic carbon, $\\rho_b=1.4$ kg\\,L$^{-1}$, $\\theta=0.25$ and drains 250 mm\\,yr$^{-1}$. Find $K_d$, $R$ and the time to travel 1 m.\\exans{1.5 L\\,kg$^{-1}$; 9.4; 9.4 yr}',
 'A field drains 180 mm at 15 mg NO$_3$-N\\,L$^{-1}$. Find the N leached and the mean nitrate concentration in mg NO$_3$\\,L$^{-1}$.\\exans{27 kg N\\,ha$^{-1}$; 66 mg NO$_3$\\,L$^{-1}$}',
 'Nitrification follows first-order kinetics with $k=0.1$ d$^{-1}$. How long does it take to nitrify 90 per cent of an ammonium application?\\exans{23 d}']
ES[k] = ['Explain the pools of organic matter in Daisy and the meaning of their decay rates.',
 'Discuss mineralisation and immobilisation and the role of the C:N ratio of residues.',
 'Explain the processes of nitrate loss (leaching, denitrification) and how irrigation affects each.',
 'Describe the transport of a pesticide through the soil and the factors that decide whether it reaches the groundwater.',
 'Discuss nitrous oxide emission from irrigated soils and how it could be reduced.',
 'Explain how the nitrogen balance of a field is closed and checked.']
SW[k] = [('22', 'Open \\emph{Nitrogen budget} and read the leaching of the wettest and the driest year.', 'leaching is largest in the wettest year'),
 ('28', 'Design a Daisy experiment with three nitrogen rates and run it; compare the leaching.', 'leaching rises with the rate'),
 ('30', 'Open the results of the chemical scenario and read the pesticide leached.', 'most is degraded near the surface'),
 ('25', 'Click every box of the nitrogen part of the process map and list the processes.', 'mineralisation, nitrification, denitrification, leaching, uptake')]
# =================================================================== Atlas and research (keys 19-22), worked solutions (18)
k = '18'
E[k] = ['For each of the ten soils, is a 600 cm trigger inside the reach? List the soils for which it never fires.\\exans{sand and loamy sand}',
 'Using the table of readily available water, rank the soils by the interval between irrigations at $ET_c=5$ mm\\,d$^{-1}$.\\exans{sand shortest, silt loam longest}',
 'Find the pore radius that is just full at pF 3.0 and at pF 4.2.\\exans{1.5 $\\mu$m; 0.094 $\\mu$m}',
 'For the loam, find $S_e$ and $K_r$ at 1000 cm.\\exans{%.4f; %s}' % (Se(1000, 0.036, 1.56), '$' + f(Kr(1000, 0.036, 1.56)) + '$'),
 'Convert 300 cm of suction to kPa, bar and pF.\\exans{29.4 kPa; 0.294 bar; 2.48}']
ES[k] = ['Choose two soils of contrasting texture and compare their worked solutions step by step. What do the differences mean for irrigation?',
 'Explain how the reference tables of this chapter can be used to design an irrigation schedule without a computer.',
 'Discuss the accuracy of the reference tables and when a full computation is needed instead.',
 'Explain the link between the pore radius, the suction and the pF.',
 'Discuss the reach of the trigger for the ten soils and what it means for advice to farmers.',
 'Write a one-page guide to irrigating the loam, using only the tables of this chapter.']
SW[k] = [('6', 'For each of the ten soils set a 300 cm trigger and record whether the crop is irrigated; compare with the table of this chapter.', 'sand and loamy sand are not irrigated'),
 ('11', 'Check the surface design of the loam against the worked solution of this chapter.', 'the values agree'),
 ('13A', 'Check the drain spacing of the worked example in the drainage layer.', 'the spacing agrees within rounding'),
 ('12', 'Check the lateral loss of the worked example in the drip layer.', 'the loss agrees within rounding')]
OB[k] = ('The reach of a 300 cm trigger is exceeded on\\opt{the loam}{the sand}{the clay loam}{the silt loam}\n\\item 1 mm of water on 1 ha equals\\opt{1 m$^3$}{10 m$^3$}{100 m$^3$}{1000 m$^3$}\n\\item The pore that is just full at pF 2 has a radius of about\\opt{1.5 $\\mu$m}{15 $\\mu$m}{150 $\\mu$m}{1.5 mm}\n\\item In the Hooghoudt equation the flow below the drains depends on\\opt{$h^2$}{$d\\,h$}{$L$}{$q^2$}\n\\item Christiansen\'s factor for many outlets is close to\\opt{0.25}{0.35}{0.5}{1.0}', '1.\\ (b),\\quad 2.\\ (b),\\quad 3.\\ (b),\\quad 4.\\ (b),\\quad 5.\\ (b)')
for k in ['19', '20', '21', '22']:
    pass
E['19'] = ['Using the rate-competition law, find the $K_s$ at which the memory fate of drainage is 0.1, 0.5 and 0.9.\\exans{7.9, 71.5, 643 cm\\,d$^{-1}$}',
 'The memory fates of a soil are $\\phi_D=0.29$, $\\phi_T=0.58$, $\\phi_E=0.04$. What is the remainder, and what does it represent?\\exans{0.09; runoff and storage change}',
 'A figure on a log axis shows points at 10, 100 and 1000. Are they equally spaced? What ratio does one decade represent?\\exans{yes; a factor of 10}',
 'Compute the RMSE and the bias of the predictions 0.30, 0.55, 0.12 against observations 0.25, 0.60, 0.10.\\exans{0.042; $+0.007$}',
 'A recoverable fraction is $1-\\psi_D$. Find it for $\\psi_D=0.31$ and 0.71, and the recovered water of a saving of 120 mm.\\exans{0.69 and 0.29; 82.8 and 34.8 mm}']
E['20'] = ['Using the fates of the sandy loam (0.638 transpired), find the irrigation needed to add 100 mm of transpiration.\\exans{157 mm}',
 'For a plateau of 0.3 and a dose scale of 4 mm, find the dose at which the drained share is half the plateau.\\exans{2.8 mm}',
 'A loop of gain 0.4 amplifies a first change of 5 per cent. Find the final change. What gain would double the first change?\\exans{8.3 per cent; 0.5}',
 'Irrigation raises the yield from 4.2 to 6.6 Mg\\,ha$^{-1}$ with 180 mm. Find the irrigation water use efficiency.\\exans{1.33 kg\\,m$^{-3}$}',
 'Nitrate leaching rises from 25 to 41 kg N\\,ha$^{-1}$ when 150 mm of irrigation are added. Find the leaching per 100 mm of irrigation.\\exans{10.7 kg N\\,ha$^{-1}$}']
E['21'] = ['A log gives a storage organ dry matter of 7.2 Mg DM\\,ha$^{-1}$. Find the yield at 14 per cent moisture.\\exans{8.37 Mg\\,ha$^{-1}$}',
 'Close the balance: $P=540$, $I=120$, $T=290$, $E_s=150$, $E_o=45$, $D=160$, $Q=5$ mm, $\\Delta S=-6$ mm.\\exans{residual 16 mm: a term is missing}',
 'A daily log of 20 years has how many rows? An hourly log?\\exans{7305; 175\\,320}',
 'Convert 0.85 g\\,cm$^{-3}$ to kg\\,m$^{-3}$ and 12 kg N\\,ha$^{-1}$ to g N\\,m$^{-2}$.\\exans{850 kg\\,m$^{-3}$; 1.2 g\\,m$^{-2}$}',
 'The transpiration efficiency is 2.1 kg DM\\,m$^{-3}$ and the transpiration 280 mm. Find the dry matter.\\exans{5.88 Mg\\,ha$^{-1}$}']
E['22'] = ['How many runs does a two-level full factorial of eight factors need per soil? A Latin hypercube of 50 runs covers each factor in how many strata?\\exans{256; 50}',
 'A bootstrap of 4999 resamples gives the 2.5 and 97.5 percentiles of a constant. Which resamples (by rank) are these?\\exans{the 125th and the 4875th}',
 'In leave-one-soil-out validation of ten soils, how many fits are made, and on how many soils is each fitted?\\exans{10; 9}',
 'Two laws have LOSO RMSE 0.058 and 0.111. By what percentage is the first better?\\exans{48 per cent}',
 'A constant has the interval 58 to 105 around 71.5. Is the interval symmetric? Find the distances below and above.\\exans{no; 13.5 and 33.5}']
for k in ['19', '20', '21', '22']:
    ES[k] = {'19': ['Explain how to read a figure of the atlas critically, using one figure of this chapter as an example.',
                    'Discuss the rate-competition law: its form, its evidence and its limits.',
                    'Explain the difference between a memory fate and a loss fate.',
                    'Discuss what the coupled fluxes of the study show about the closure of the water balance.',
                    'Explain why the recoverable fraction differs between soils.',
                    'Choose one figure of this chapter and write the paragraph of a paper that describes it.'],
             '20': ['Discuss the three novel contributions of the study and the evidence for each.',
                    'Explain the fate of an irrigation millimetre and its use for advice.',
                    'Discuss the dose law and the rule of dosing against the daily use of the crop.',
                    'Explain the feedback loops of the study and how they could change under a warmer climate.',
                    'Discuss the coupling of irrigation and nitrogen leaching.',
                    'Write a short synthesis of the irrigation results for a farmer.'],
             '21': ['Describe the structure of the Daisy output and how it is read into SWAFL.',
                    'Discuss the checks that must be made before a log is used.',
                    'Explain why daily figures are drawn only from some experiments.',
                    'Discuss the conversion of dry matter into yield and water productivity.',
                    'Explain how a failed run is recognised and what can be learnt from it.',
                    'Describe how you would present the output of a Daisy experiment in a report.'],
             '22': ['Describe the design of the simulation experiments of the study and the reasons for each design.',
                    'Discuss leave-one-out validation and why it is the main test of the laws of this book.',
                    'Explain the bootstrap and what its intervals mean.',
                    'Discuss the verification of SWAFL against textbook examples and held-out runs.',
                    'Explain how the studies of the project fit together into one argument.',
                    'Choose one study and write a critical review of its methods and conclusions.']}[k]
    SW[k] = {'19': [('7', 'Reproduce the field balance of the sand and the silty clay loam and compare the drainage.', 'the sand drains far more'),
                    ('6', 'Reproduce the reach of the sand in \\emph{Sensor and trigger}.', 'no irrigation above about 200 cm'),
                    ('9', 'Reproduce the fate of saved water for two soils.', 'the sand drains most of the saving'),
                    ('16', 'Export the data of one figure and draw it again in a spreadsheet.', 'the figure is reproduced')],
             '20': [('6', 'Reproduce the irrigation of E2 for the loam at four triggers.', 'irrigation falls with the trigger'),
                    ('12', 'Reproduce the effect of dose on drainage in the drip layer.', 'small doses drain less'),
                    ('10', 'Reproduce the feedback loops of a warmer climate.', 'the loops change sign in dry years'),
                    ('22', 'Read the nitrogen budget of the irrigated and the rainfed field.', 'irrigation raises leaching')],
             '21': [('30', 'Open the raw output of a run and identify the header, names, units and rows.', 'as in the figure of this chapter'),
                    ('30', 'Open the efficiency indices of an experiment and compute one by hand.', 'the hand value agrees'),
                    ('30', 'Find where the results are saved and open one log file in a text editor.', 'the folder holds every log'),
                    ('30', 'Open \\emph{Why a run gave no results} and explain one failure.', 'the line of the set-up is shown')],
             '22': [('28', 'Design a Daisy experiment with a Latin hypercube of 20 runs and inspect the plan.', 'each factor is sampled in 20 strata'),
                    ('29', 'Open the best combinations and choose one for your field.', 'the plan of the combination is shown'),
                    ('30', 'Read the interactions of an experiment and identify the strongest.', 'usually between water and nitrogen'),
                    ('18', 'Use the search for the most efficient inputs and compare with the best combination of Daisy.', 'the two agree in direction')]}[k]

OBJ_MISSING = {'15': ('The reference evapotranspiration of FAO-56 is the demand of\\opt{bare soil}{a well-watered grass}{open water}{a forest}\n\\item The daily damping depth of a moist soil is of the order of\\opt{1 mm}{1 cm}{10 cm}{1 m}\n\\item The degree-day factor of snowmelt is about\\opt{0.1}{3}{30}{300} mm\\,$^\\circ$C$^{-1}$\\,d$^{-1}$\n\\item Capillary rise from a water table falls with depth\\opt{linearly}{exponentially}{not at all}{as $\\sqrt L$}\n\\item The factor 0.408 in the Penman--Monteith equation converts\\opt{kPa to mm}{MJ\\,m$^{-2}$ to mm}{K to $^\\circ$C}{m\\,s$^{-1}$ to km\\,d$^{-1}$}', '1.\\ (b),\\quad 2.\\ (c),\\quad 3.\\ (b),\\quad 4.\\ (b),\\quad 5.\\ (b)'),
               '16': ('Thermal time counts degrees\\opt{below $T_b$}{above $T_b$}{above 30 $^\\circ$C}{at night only}\n\\item A canopy with $kL=3$ intercepts about\\opt{50}{75}{95}{100} per cent of the light\n\\item A $Q_{10}$ of 2 means the rate\\opt{halves per 10 $^\\circ$C}{doubles per 10 $^\\circ$C}{doubles per 1 $^\\circ$C}{is constant}\n\\item $K_y>1$ means the yield falls\\opt{slower}{as fast as}{faster than}{independently of} the water use\n\\item The conversion efficiency of growth is about\\opt{0.2}{0.5}{0.72}{1.0}', '1.\\ (b),\\quad 2.\\ (c),\\quad 3.\\ (b),\\quad 4.\\ (c),\\quad 5.\\ (c)'),
               '17': ('The critical C:N ratio above which residues immobilise nitrogen is about\\opt{5}{20}{80}{200}\n\\item The retardation factor of a non-sorbed solute is\\opt{0}{1}{2}{$\\rho_b/\\theta$}\n\\item Denitrification is favoured by\\opt{a dry soil}{a well-aerated soil}{a wet soil}{a frozen soil}\n\\item 50 mg NO$_3$\\,L$^{-1}$ equals about\\opt{3.5}{11.3}{25}{50} mg N\\,L$^{-1}$\n\\item The half-life of a first-order process with $k=0.1$ d$^{-1}$ is\\opt{0.69 d}{6.9 d}{10 d}{69 d}', '1.\\ (b),\\quad 2.\\ (b),\\quad 3.\\ (c),\\quad 4.\\ (b),\\quad 5.\\ (b)'),
               '21': ('A Daisy log file has the extension\\opt{.dai}{.dlf}{.csv}{.log}\n\\item The yield at 15 per cent moisture of 6 Mg DM\\,ha$^{-1}$ is\\opt{5.1}{6.0}{7.06}{6.9} Mg\\,ha$^{-1}$\n\\item A residual of 20 mm in a yearly balance indicates\\opt{a good closure}{a missing term}{a wet year}{a dry year}\n\\item A daily log over 20 years has about\\opt{365}{7300}{20\\,000}{175\\,000} rows\n\\item Transpiration efficiency is expressed in\\opt{kg\\,m$^{-3}$}{mm}{kg\\,ha$^{-1}$}{dimensionless}', '1.\\ (b),\\quad 2.\\ (c),\\quad 3.\\ (b),\\quad 4.\\ (b),\\quad 5.\\ (a)'),
               '22': ('A two-level full factorial of six factors has\\opt{12}{36}{64}{720} runs\n\\item In leave-one-soil-out validation of ten soils each fit uses\\opt{1}{5}{9}{10} soils\n\\item A bootstrap draws soils\\opt{without replacement}{with replacement}{in order}{once each}\n\\item A Latin hypercube samples each factor\\opt{at two levels}{once in each stratum}{at random only}{at its mean}\n\\item An overfitted law has\\opt{a low LOSO error}{a low in-sample error and a high LOSO error}{no parameters}{a high in-sample error}', '1.\\ (c),\\quad 2.\\ (c),\\quad 3.\\ (b),\\quad 4.\\ (b),\\quad 5.\\ (b)')}
OB.update({k: v for k, v in OBJ_MISSING.items()})

MAN = 'https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/raw/main/Software/v1.1.0/SWAFL_Desktop/docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf'
for k in sorted(E):
    s = ['\\backhead{FURTHER EXERCISES}{khred}', '\\begin{exlist}'] + ['\\item ' + x for x in E[k]] + ['\\end{exlist}',
         '\\backhead{ESSAY QUESTIONS}{khred}', '{\\small\\itshape Answer each question in about one page, with equations, a sketch and at least one number from this chapter.}\\par\\vspace{3pt}', '\\begin{exlist}'] + ['\\item ' + x for x in ES[k]] + ['\\end{exlist}',
         '\\dykband{EXERCISES IN SWAFL}',
         '{\\small Open SWAFL (desktop or online) with the benchmark project. The chapter of the \\href{%s}{SWAFL manual} that explains each task is given in brackets; record your values in a table and compare them with what is expected (\\emph{Check}).}\\par\\vspace{3pt}' % MAN,
         '\\begin{exlist}'] + ['\\item {\\color{khblue}[Manual, Chapter %s]} %s\\par\\noindent{\\small\\itshape Check: %s.}' % (c, t, chk) for c, t, chk in SW[k]] + ['\\end{exlist}']
    if OB.get(k):
        q, a = OB[k]
        s += ['\\backhead{OBJECTIVE TYPE QUESTIONS}{khred}', '\\begin{exlist}', '\\item ' + q, '\\end{exlist}', '\\objkey{%s}' % a]
    write('more' + k, '\n'.join(s) + '\n')
print('written', sorted(E))
