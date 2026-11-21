from x09 import mk,Q
from h import *
import math
from scipy.optimize import brentq
# ---- ch10 phenotyping
# water-use traits: WUE, transpiration efficiency, stomatal conductance via PM
cult=[('G1',9.8,455,0.42,31.0),('G2',10.6,490,0.45,29.5),('G3',8.9,410,0.40,33.0),('G4',11.2,540,0.43,28.5),('G5',10.1,445,0.47,30.5)]
rows=[]
for n,y,et,hi,d in cult:
    wp=y*1000/(et*10);rows.append([n,'%.1f'%y,'%.0f'%et,'%.2f'%wp,'%.2f'%hi,'%.1f'%d])
tab=tabl(['Genotype','Yield (Mg/ha)','$ET_a$ (mm)','WP (kg/m$^3$)','HI','Canopy temp. (C)'],rows,'Five genotypes in a managed-stress trial.','lrrrrr')
best=max(cult,key=lambda c:c[1]/c[2])
Tc=[c[4] for c in cult];Ta=34.0
cwsi=lambda T:(T-(Ta-3.0))/((Ta+4.0)-(Ta-3.0))
tab2=tabl(['Genotype','$T_c$ (C)','CWSI'],[[c[0],'%.1f'%c[4],'%.2f'%cwsi(c[4])] for c in cult],'Crop water stress index from canopy temperature ($T_a=34$ C, lower limit $T_a-3$, upper limit $T_a+4$).','lrr')
mk(10,"define phenotyping traits for water use; compute water productivity, harvest index and a crop water stress index; rank genotypes under managed stress; and plan the volumetric scan and the plot design of a trial.",
 [('Introduction: why phenotype water use',[Q(r"Phenotyping is the measurement of the traits of a plant in its environment. For water use the useful traits are the yield, the water used, the way the canopy takes and loses water, and the way it responds to stress. The application treats phenotyping as a layer on top of the balance: the balance supplies the water, the trait tables supply the response of each genotype, and the comparison of genotypes is made on the same water.")]),
  ('Traits and indices',[Q(r"The main traits are the \emph{water productivity} $WP=Y/ET_a$, the \emph{harvest index} $HI=Y/B$ (grain over biomass), the \emph{transpiration efficiency} $TE=B/T$, the \emph{stomatal conductance} $g_s$ and the \emph{canopy temperature} $T_c$. The last gives the \kw{crop water stress index}"),
   eqn(r"CWSI=\frac{(T_c-T_a)-(T_c-T_a)_{LL}}{(T_c-T_a)_{UL}-(T_c-T_a)_{LL}},\quad 0\le CWSI\le1,"),
   Q(r"where LL and UL are the non-stressed and fully stressed baselines. A well-watered canopy runs 2 to 4 C below the air; a stressed one runs above it.")]),
  ('Experimental design',[Q(r"A trial is a set of plots in which genotype is the factor and the other conditions are the same. The \emph{randomised complete block} design gives every genotype one plot in every block, so that gradients of soil and slope are removed from the comparison. With $g$ genotypes and $r$ blocks the degrees of freedom of the error are $(g-1)(r-1)$, and the standard error of a genotype mean is $s/\sqrt r$. A trial of 20 genotypes in 4 blocks has 76 error degrees of freedom and 80 plots."),
   Q(r"The least significant difference at $p=0.05$ is $LSD=t_{0.05,\nu}\sqrt{2s^2/r}$; with $s=0.6$ Mg\,ha$^{-1}$, $r=4$, $t\approx2.0$: $LSD=%.2f$ Mg\,ha$^{-1}$."%(2.0*math.sqrt(2*0.36/4)))]),
  ('Volumetric scan and image traits',[Q(r"The application's scan reads a series of images or point-cloud slices of a plant and returns the volume of the canopy and of the root system. The biomass is estimated by $B=\rho_{v}V$ where $\rho_v$ is the volumetric dry density (kg\,m$^{-3}$) of the tissue. A canopy volume of 0.18 m$^3$ per plant at $\rho_v=18$ kg\,m$^{-3}$ gives $B=%.2f$ kg per plant; at 5 plants\,m$^{-2}$ the biomass is %.1f Mg\,ha$^{-1}$."%(0.18*18,0.18*18*5*10))]),
 ],
 'Design project 10: ranking genotypes in a managed-stress trial','sec:proj10',
 [Q(r"\textbf{Brief.} Five genotypes were grown in a stress trial. Their yield, seasonal evapotranspiration, harvest index and canopy temperature at midday are in the table. The task is to rank them by water productivity and stress index and to recommend the genotype for a water-scarce scheme."),],
 tab+tab2+Q(r"\textbf{Reading.} The highest water productivity is %s at %.2f kg\,m$^{-3}$. The canopy of G3 is the warmest (CWSI %.2f), a sign of the stomata closing early; G4 yields most but uses most water. For a scheme where water is the limit, rank by WP, then confirm it with the CWSI: the genotype with the best WP and a low stress index is the safest."%(best[0],best[1]*100/best[2],cwsi(33.0))),
 [(r"WP for 9.5 Mg/ha at 460 mm.","%.2f"%(9500/4600)),(r"CWSI for $T_c=31$, $T_a=34$ with limits $-3$, $+4$.","%.2f"%cwsi(31.0)),(r"HI for grain 5.2, biomass 12.","%.2f"%(5.2/12)),(r"Error d.f. for 12 genotypes, 3 blocks.","22"),(r"LSD for $s=0.8$, $r=3$, $t=2.1$.","%.2f"%(2.1*math.sqrt(2*0.64/3))),(r"Biomass from $V=0.25$ m$^3$, $\rho_v=15$.","%.2f kg"%(0.25*15)),(r"TE for $B=1.8$ kg, $T=720$ L.","%.1f g/kg"%(1800/720)),(r"Why randomise blocks?","to remove gradients"),(r"State two traits of a drought-tolerant genotype.","low CWSI; high WP"),(r"What does a CWSI of 1 mean?","fully stressed")],
 [r"Why compare genotypes on the same water?",r"What is the harvest index?",r"How is canopy temperature turned into a stress index?",r"Why is a randomised complete block used?",r"What does the volumetric scan measure?",r"What limits the use of WP alone?",r"What is transpiration efficiency?",r"How many plots has 20 genotypes by 4 blocks?"],
 [(r"WP is",["$Y/ET_a$","$ET_a/Y$","$Y\\cdot ET$","$B/Y$"],0),(r"A CWSI near 0",["no stress","full stress","dead crop","no sun"],0),(r"HI is",["grain/biomass","biomass/grain","water/grain","none"],0),(r"Blocks remove",["gradients","genotypes","weather","yield"],0),(r"Hot canopy means",["stress","no stress","rain","nothing"],0),(r"LSD uses",["$t$ and $s$","wind","slope","RH"],0),(r"Scan returns",["volume","price","rain","salt"],0),(r"TE is",["$B/T$","$T/B$","$Y/I$","$P/E$"],0),(r"Plots = g times",["r","s","t","p"],0),(r"Best for water-scarce schemes",["highest WP","highest ET","lowest HI","largest canopy"],0)])
print('ok10')
