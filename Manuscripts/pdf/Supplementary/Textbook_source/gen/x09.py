from h import *
from scipy.optimize import brentq
import math
def mk(k,leadtxt,secs,projtitle,projlab,projparas,projtab,exl,dykl,objl):
    lead(k,leadtxt)
    b=''
    for t,paras in secs: b+=sec(t)+P(*paras)
    write(k,'bg',b)
    p='\\banner{%s}\\label{%s}\n'%(projtitle,projlab)+P(*projparas)+projtab
    write(k,'proj',p)
    write(k,'ex',exercises(exl));write(k,'dyk',dyk(dykl));write(k,'obj',obj(objl))
def Q(*a): return ' '.join(a)
# ---------- ch9 structure, tillage, mulch, feedback
# mulch evaporation: Stage I/II (Ritchie)
def evap(U,a,days,ET0=5.0,rain=None):
    cum=0;F=0;out=[]
    for d in range(days):
        if F<U: e=ET0;F+=e
        else: F+=1; e=a*(math.sqrt(F)-math.sqrt(F-1)) if F>U else ET0
        out.append(e)
    return sum(out)
U,a=9.0,3.5
def stage2(t):  # Ritchie: E=a*sqrt(t) after stage1 ending at t1=U/ET0
    t1=U/5.0
    return U+a*(math.sqrt(t)-math.sqrt(t1)) if t>t1 else 5.0*t
base=None
rows2=[]
for name,fr,Um in (('Bare soil',0.0,9.0),('Straw 3 t/ha',0.4,8.0),('Straw 6 t/ha',0.6,7.0),('Plastic film',0.9,5.0)):
    t1=Um/5.0
    E30=(Um+a*(math.sqrt(30)-math.sqrt(t1)))*(1-fr)+0*fr
    rows2.append((name,fr,Um,E30))
b0=rows2[0][3]
tab=tabl(['Cover','Reduction factor','$U$ (mm)','$E_{30}$ (mm)','Saving (mm)','Saving (\\%)'],
 [[n,'%.2f'%f,'%.0f'%u,'%.1f'%e,'%.1f'%(b0-e),'%.0f'%(100*(b0-e)/b0)] for n,f,u,e in rows2],'Thirty-day evaporation from a wetted loam for four surface covers ($ET_0=5$ mm/d, $a=3.5$ mm\\,d$^{-1/2}$).','lrrrrr')
mk(9,"explain how structure, tillage and mulch change infiltration and evaporation; compute the two-stage evaporation with a cover factor; estimate bulk density and porosity change by tillage; and describe the feedback loops the application closes between soil, crop and atmosphere.",
 [('Introduction: the soil surface as a control',[Q(r"The surface of a soil is where rain is partitioned into runoff and infiltration and where water leaves as evaporation. Both are controlled by structure (aggregates, pores, crust) and by what covers the soil (residue, mulch, canopy). Tillage and mulch are therefore the farmer's two direct tools on the surface balance. This chapter treats them one after the other and then ties them in the feedback loops of the application, where the state of the soil changes the water balance and the water balance changes the soil in return."),]),
  ('Soil structure and porosity',[Q(r"The total porosity is $\phi=1-\rho_b/\rho_s$ with $\rho_s\approx2.65$ Mg\,m$^{-3}$. Tillage loosens the soil: a topsoil of $\rho_b=1.45$ is brought to 1.20 by ploughing, so $\phi$ rises from %.3f to %.3f. The extra porosity is macro-porosity: it raises the saturated conductivity and the infiltration, but it also dries faster and settles back under rain and traffic, with a half-life of one season or so."%(1-1.45/2.65,1-1.20/2.65)),
   eqn(r"\phi=1-\frac{\rho_b}{\rho_s},\qquad \Delta z=z_0\left(\frac{\rho_{b0}}{\rho_{b1}}-1\right)."),
   Q(r"A layer of $z_0=0.25$ m at $\rho_{b0}=1.45$ loosened to $\rho_{b1}=1.20$ swells by $\Delta z=%.1f$ cm; the same mass of soil takes more room."%(25*(1.45/1.20-1))),]),
  ('Tillage and the surface balance',[Q(r"Four effects of tillage matter for the water balance: the roughness stores water in depressions and delays runoff; the loosened layer raises infiltration; the buried residue changes the cover; the broken capillary continuity cuts the supply to the surface and so reduces the evaporation of the second stage. No-till reverses these: the soil is firmer, residue stays on top, infiltration is held by biopores. The application reads the tillage choice as a set of multipliers on $K_s$, on the surface storage and on the evaporation factor."),
   Q(r"The depression storage is $S_d\approx0.112\,RR+0.031\,RR^2-0.012\,RR\,s$ (mm), with random roughness $RR$ in cm and slope $s$ in per cent. For a ploughed field with $RR=2.5$ cm and $s=2$: $S_d=%.2f$ mm; for a fine seedbed with $RR=0.8$: $S_d=%.2f$ mm."%(0.112*2.5+0.031*6.25-0.012*2.5*2,0.112*0.8+0.031*0.64-0.012*0.8*2)),]),
  ('Mulches: types and effects',[Q(r"Mulches are of three kinds: \emph{organic} (straw, stubble, wood chips), \emph{synthetic} (plastic film, usually black, clear or white) and \emph{mineral} (gravel, sand). Each acts through the same few physical effects: it blocks the vapour path (a resistance in series), reflects or absorbs radiation, and changes the soil temperature. Organic mulches also add organic matter and feed the biology. Plastic films cut the evaporation almost completely but they stop the rain; they must be used with drip irrigation."),
   Q(r"In the model, evaporation under a cover is the bare-soil value multiplied by $(1-f_c)$, where $f_c$ is the cover factor of the mulch, and the stage-one limit $U$ is shortened. Chapter~6 gave the two stages; here we apply them."),]),
  ('Feedback loops',[Q(r"A \emph{feedback loop} is a chain of effects that returns on itself. Three loops are built into the application. (i) \emph{Structure--infiltration}: tillage raises $K_s$, more water infiltrates, the soil is wetter, aggregates slake, the surface seals, $K_s$ falls. (ii) \emph{Mulch--evaporation}: mulch reduces evaporation, the surface stays moist, residue decomposes, the cover thins. (iii) \emph{Water--crop--atmosphere}: stress closes the stomata, transpiration falls, the canopy warms, $ET_0$ demand and the stress rise further. Each loop is a pair of equations coupled by a state variable, and each can be reinforcing (positive) or balancing (negative)."),
   Q(r"A simple discrete model of the first loop is $K_{n+1}=K_n+\alpha(K_{\max}-K_n)-\beta\,R_n K_n$ with rainfall energy $R_n$. Its fixed point is $K^*=\alpha K_{\max}/(\alpha+\beta R)$. With $\alpha=0.02$, $K_{\max}=40$ mm\,h$^{-1}$, $\beta=0.0005$ and $R=60$: $K^*=%.1f$ mm\,h$^{-1}$; with a doubled rainfall energy, $K^*=%.1f$."%(0.02*40/(0.02+0.0005*60),0.02*40/(0.02+0.0005*120))),]),
 ],
 'Design project 9: a mulching and tillage plan for a tomato field','sec:proj9',
 [Q(r"\textbf{Brief.} A drip-irrigated tomato field on a loam (reference $ET_0=5$ mm\,d$^{-1}$, $a=3.5$ mm\,d$^{-1/2}$) is to be planted after four choices of surface cover. The designer compares the evaporation in the first thirty days after a wetting and the water saved. The evaporation after a wetting is $E=U+a(\sqrt{t}-\sqrt{t_1})$ with $t_1=U/ET_0$; with a cover the value is reduced by $(1-f_c)$."),
  ],tab+Q(r"\textbf{Reading the table.} Straw at 6 t\,ha$^{-1}$ saves %.0f mm in thirty days, the plastic film %.0f mm; over a 110-day season at the same rate, plastic could save as much as %.0f mm, equal to the irrigation of three to four rounds. The choice depends on cost, on the rain (film sheds it) and on the disposal of the film."%(b0-rows2[2][3],b0-rows2[3][3],(b0-rows2[3][3])*110/30)),
 [(r"Find $\phi$ for $\rho_b=1.35$.","%.3f"%(1-1.35/2.65)),(r"A 20-cm layer at 1.50 is loosened to 1.25. Swelling?","%.1f cm"%(20*(1.5/1.25-1))),(r"Find $S_d$ for $RR=3$ cm, $s=4$.","%.2f mm"%(0.112*3+0.031*9-0.012*3*4)),(r"Fixed point $K^*$ for $\alpha=0.03$, $K_{max}=30$, $\beta=0.0004$, $R=50$.","%.1f"%(0.03*30/(0.03+0.0004*50))),(r"$E_{30}$ for $U=8$, $a=3$, $ET_0=4$ (no cover).","%.1f mm"%(8+3*(math.sqrt(30)-math.sqrt(2)))),(r"The same with $f_c=0.5$.","%.1f mm"%((8+3*(math.sqrt(30)-math.sqrt(2)))*0.5)),(r"Name two reinforcing and two balancing feedbacks in the soil--crop system.","see text"),(r"State three effects of tillage on the surface balance.","roughness; infiltration; evaporation supply"),(r"Why is plastic film unsuitable with sprinklers?","it sheds the water"),(r"Describe the structure--infiltration loop.","tillage up, slaking down")],
 [r"What is the difference between total porosity and macro-porosity?",r"How does tillage change the surface storage?",r"List three kinds of mulch and one effect of each.",r"Why does mulch shorten stage one?",r"What is a reinforcing feedback?",r"Write the fixed point of the structure--infiltration loop.",r"What does the cover factor $f_c$ do in the model?",r"Why must film be removed after the season?"],
 [(r"$\phi$ is",["$1-\\rho_b/\\rho_s$","$\\rho_b/\\rho_s$","$\\rho_s-\\rho_b$","$\\rho_b\\rho_s$"],0),(r"No-till",["loosens the soil","leaves residue on top","buries residue","stops rain"],1),(r"Plastic film",["adds rain","blocks evaporation","lowers $\\rho_b$","feeds biology"],1),(r"Stage 1 evaporation is limited by",["soil supply","energy","wind","the crop"],1),(r"A balancing loop",["amplifies","opposes change","has no state","is random"],1),(r"The roughness stores",["gas","water in depressions","salt","heat"],1),(r"The cover factor lies in",["[0,1]","[1,2]","[-1,0]","any"],0),(r"Residue decomposes",["never","by biology","only in winter","by plastic"],1),(r"Tillage halves",["always runoff","nothing fixed","gravity","rain"],1),(r"Organic mulch adds",["organic matter","glass","iron","none"],0)])
print('ok9')
