"""Paper 4, the three software screens of the figure 'fig:soft': hand-placed numbered callouts
(written to figures/annot/p4_fig-soft_<k>.png and results/annot_p4.json) and the equations behind each screen
(results/p4_soft_equations.json), which the supplement prints under every picture."""
import os, json
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
SH = os.path.join(ROOT, 'Manuscripts/figures/shots_jpg'); AN = os.path.join(ROOT, 'Manuscripts/figures/annot'); os.makedirs(AN, exist_ok=True)
RED = (178, 34, 34)
def font(sz):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
def draw(src, out, items, scale=1.0):
    im = Image.open(os.path.join(SH, src)).convert('RGB')
    if scale != 1: im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    d = ImageDraw.Draw(im); r = max(11, int(im.width / 70)); F = font(int(r * 1.15)); w = max(2, r // 5)
    for n, (pt, off, _) in enumerate(items, 1):
        x, y = pt[0] * scale, pt[1] * scale; cx, cy = x + off[0] * scale, y + off[1] * scale
        d.line([(x, y), (cx, cy)], fill=RED, width=w); d.ellipse([x - w * 1.5, y - w * 1.5, x + w * 1.5, y + w * 1.5], fill=RED)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill='white', outline=RED, width=w)
        d.text((cx, cy), str(n), fill=RED, font=F, anchor='mm')
    im.save(os.path.join(AN, out), quality=92)
    return [t for *_, t in items]
# ------------------------------------------------------------------ screen 1: root-zone depletion and the trigger law
S1 = [((100, 300), (-60, 20), 'The soil column of the chosen soil (coarse loam) from 0 to 100\\,cm, coloured by its water content on the day shown; the roots are drawn to their depth.'),
      ((120, 135), (-55, -45), 'The sensor at 20\\,cm (green dot). Its box reads the suction of the day (114\\,cm), the trigger (471\\,cm) and the critical suction $h^*$ of $f^*=0.45$ (387\\,cm) for this soil.'),
      ((190, 280), (40, 60), 'The depletion gauge: $f=0$ at field capacity (FC, top) to $f=1$ at the wilting point (WP, bottom). The blue fill is the water left on the day.'),
      ((190, 198), (-40, 10), 'The red line $f^*$: the depletion beyond which the simulated yield falls by more than 5 %; the same 0.45 for every soil.'),
      ((205, 209), (35, 18), 'The trigger (purple dot) at depletion 0.50. Dragging it moves the trigger; it sits below the red line, so this setting stresses the crop before irrigating.'),
      ((300, 77), (40, -40), 'Header of the right panel: each soil gets its own trigger for the same depletion, because the same depletion is reached at a different suction in every soil.'),
      ((290, 118), (-55, -5), 'One soil row (sand): the suction at which this soil reaches the same depletion, the simulated irrigation of a year with that trigger and the days from field capacity to the trigger, ``151\\,cm, 278\\,mm, 8 d to trigger\'\'.'),
      ((404, 100), (0, -45), 'The red column $f^*=0.45$; the circle on each row marks where the trigger of the left panel lies on that soil\'s depletion scale.'),
      ((466, 118), (22, -28), 'Yield boxes (Mg/ha): the simulated yield with that soil\'s trigger. Equal yields across soils are the point of soil-specific triggers.'),
      ((70, 383), (-45, 30), 'The diagnosis in words: the trigger, the critical point, the season totals and how fast the soil dries (2.4 % of its available water a day; trigger reached in about 21 days).')]
L1 = draw('real_trigger_law.jpg', 'p4_fig-soft_0.png', S1, scale=2.0)
E1 = [r'Depletion of a soil at suction $h$ (0 at field capacity, 1 at the wilting point): $f(h)=\dfrac{S_e(100)-S_e(h)}{S_e(100)-S_e(15\,849)}$, with $S_e(h)=[1+(\alpha h)^n]^{-(1-1/n)}$; 100\,cm is field capacity and 15\,849\,cm ($pF=4.2$) the wilting point.',
      r'Critical suction of a soil for the common depletion $f^*=0.45$: $S_e^*=S_e(100)-f^*[S_e(100)-S_e(15\,849)]$, then $h^*=\alpha^{-1}\bigl[(S_e^*)^{-1/m}-1\bigr]^{1/n}$, $m=1-1/n$. For coarse loam this gives 387\,cm, the number in the sensor box.',
      r'The trigger of a soil for depletion $f_t$ is found the same way with $f_t$ in place of $f^*$ (471\,cm for $f_t=0.50$); the program solves $f(h)=f_t$ by bisection on $\log_{10}h$.',
      r'Readily available water: $\mathrm{RAW}=f_t\cdot\mathrm{TAW}$, with $\mathrm{TAW}$ the available water of the root zone (144\,mm here).',
      r'Days from field capacity to the trigger: $t=f_t\,\mathrm{TAW}/ET_c$; for coarse loam $0.50\times144/3.4\approx21$\,days, as written in the diagnosis.',
      r'The reach of the article decides whether the trigger can ever be read: if $h_t>h_c$ (\cref{eq:s-hc}) the crop cannot dry the soil to the trigger and the trigger is blind.']
# ------------------------------------------------------------------ screen 2: matric potential of the field
S2 = [((150, 700), (-90, -60), 'Legend of the map: matric potential now as suction in kPa on a log scale (33\\,kPa = field capacity, 1\\,500\\,kPa = wilting point); red is dry, blue is wet.'),
      ((950, 410), (-110, 40), 'The field, divided into map cells; each cell has its own retention curve and its own water content now, so the suction varies within the field.'),
      ((1400, 140), (-60, -95), 'Retention of the field: field capacity, wilting point and available water, as the mean of the cells and the 10 % and 90 % cells.'),
      ((1260, 225), (-110, 10), 'Days to the trigger ($f=0.50$, roots 15\\,cm, $ET_c=0.8$\\,mm/day): 6.7 days on average, 3.5 for the driest cells.'),
      ((1500, 410), (40, 110), 'The retention curves of the driest, median and most retentive cells: water content against suction (kPa, log scale), with field capacity and wilting point as vertical lines.'),
      ((1450, 432), (-60, 120), 'The state points: where each of the three cells is today on its curve (the ``now'' lines give the water content and suction).'),
      ((912, 582), (-90, 60), 'The water source chosen for the field (river intake), joined to the field by the dashed line.'),
      ((150, 812), (180, 40), 'The note that the map is an estimate from the SWAFL water balance; sensors placed on the map replace the estimate by measurements.')]
L2 = draw('zaria_matric_potential.jpg', 'p4_fig-soft_1.png', S2)
E2 = [r'Field capacity and wilting point of each cell from its sand $S$, clay $C$ and organic matter $OM$ (fractions, SoilGrids 2.0, 0--60\,cm) by the regressions of Saxton and Rawls (2006): $\theta_{33}$ and $\theta_{1500}$.',
      r'Slope of the retention curve: $\lambda=\dfrac{\ln1500-\ln33}{\ln\theta_{33}-\ln\theta_{1500}}$; for $\psi\ge33$\,kPa, $\theta(\psi)=\theta_{33}\,(\psi/33)^{-\lambda}$.',
      r'Available water $AW=\theta_{33}-\theta_{1500}$, and the trigger water content $\theta_t=\theta_{33}-f\,(\theta_{33}-\theta_{1500})$.',
      r'Matric potential now, the inverse of the curve: $\psi=33\,(\theta/\theta_{33})^{-1/\lambda}$\,kPa, with $\theta$ the water content of the cell from the water balance (or from sensors when installed).',
      r'Days to the trigger: $t=\max\bigl(0,\,(\theta-\theta_t)\,z_r\cdot10/ET_c\bigr)$ with $z_r$ in cm and $ET_c$ in mm/day. With $AW=0.112$, $f=0.5$, $z_r=15$\,cm, $ET_c=0.8$: at field capacity $t=0.5\times0.112\times150/0.8=10.5$\,days; the mean 6.7 days is shorter because the cells are already below field capacity.',
      r'Units: 1\,kPa $\approx$ 10.2\,cm of water, so 33\,kPa $\approx$ 337\,cm and 1\,500\,kPa $\approx$ 15\,300\,cm, the same limits as the suction scale of the article.']
# ------------------------------------------------------------------ screen 3: designing an experiment of Daisy runs
S3 = [((60, 170), (10, -42), 'Step 3 of 9 of the work flow: experiments, between the parameter library (step 2) and the scenarios (step 4).'),
      ((60, 205), (-35, 55), 'What to do here: choose a ready experiment, check the factors and levels, then run all or save the folder.'),
      ((240, 276), (60, 45), 'The weather and soils of every run of the experiment (built-in weather Taastrup, Denmark).'),
      ((235, 374), (-120, 20), 'Best combinations: 27 ready experiments from 17 topics of the Daisy reference manual.'),
      ((140, 438), (-110, 40), 'One ready experiment, ``Overhead, surface or drip irrigation\'\', the comparison of methods used in the article.'),
      ((640, 412), (30, -50), 'Its description: the three methods are run with the same trigger and dose, so only the way of applying water differs.'),
      ((605, 465), (-60, 50), 'Load this experiment: puts its factors and levels in the plan, where rows can be removed or added.'),
      ((70, 738), (-40, -50), 'My experiments: several loaded experiments are run or saved together.'),
      ((1142, 170), (20, 50), 'Link to the page of the Daisy manual that documents these settings (p.\\,605).')]
L3 = draw('wb_step3_experiments.jpg', 'p4_fig-soft_2.png', S3)
E3 = [r'Number of Daisy runs of an experiment with factors of $n_1,n_2,\dots$ levels and a budget $B$: $N=\min\bigl(\prod_i n_i,\,B\bigr)$.',
      r'If $\prod_in_i>B$, a Latin hypercube of $B$ runs is drawn so that each level of factor $i$ is used $\lfloor N/n_i\rfloor$ or $\lceil N/n_i\rceil$ times.',
      r'Every run is one full Daisy simulation; its annual fluxes (transpiration, soil evaporation, drainage, irrigation, yield) are what the article compares between methods with the rainfed twin, $\eta_X=\sum(X-X_0)/\sum I$.']
p = os.path.join(ROOT, 'Manuscripts/results/annot_p4.json'); d = json.load(open(p)) if os.path.exists(p) else {}
d['fig:soft'] = [{'file': '../figures/annot/p4_fig-soft_%d.png' % k, 'labels': [{'kind': 'call', 'text': t} for t in L]} for k, L in enumerate([L1, L2, L3])]
json.dump(d, open(p, 'w'), indent=1)
json.dump({'fig:soft': [E1, E2, E3]}, open(os.path.join(ROOT, 'Manuscripts/results/p4_soft_equations.json'), 'w'), indent=1)
print('fig:soft callouts', [len(L1), len(L2), len(L3)])
