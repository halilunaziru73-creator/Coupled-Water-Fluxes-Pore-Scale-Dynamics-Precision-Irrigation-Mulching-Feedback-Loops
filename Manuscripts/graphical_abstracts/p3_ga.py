import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
import p_style as S
from p_style import *
import pandas as pd
FG=__import__('os').environ.get('SWAFL_MS','.')+'/fig/'; O=__import__('os').environ.get('SWAFL_MS','.')+'/out/'
W,H=130,104
S.YLO=-14
fig=S.setup(W,H-S.YLO,6.1); ax=S.ax; ax.set_zorder(20)
S.bands(W,H,60.5,lx=39)
chip(2,66,34,102,'Inputs','soil: $\\theta_s$, $K_s$, retention\ncrop · weather · $E_0$\ntrigger $h^{\\ast}$ · sensor depth\ndesign: $L$, $S_0$, $n$, $q$, $D$\nmethod: surface · drip · sprinkler',fs=FS-0.9)
XS=[38,59,80,101]; WW=21
ST=['Engine 1\nannual targets','Engine 2\ndaily step','Design layers\nsurface · drip\nsprinkler','Decision\ndose · date\nspacing']
for x,t in zip(XS,ST): hexa(x,86,x+WW,102,t,fs=FS-0.9,d=2.4)
for i in range(3): flow([(XS[i]+WW,94),(XS[i+1],94)])
flow([(34,94),(38,94)],'info')
OU=['10,190 Daisy runs\nheld-out $\\rho$ 0.64–0.97','water balance\nclosed to 0.1 %','closed-form, checked\nagainst textbook','134 equations,\neach with provenance']
for x,t in zip(XS,OU):
    sbox(x,66,x+WW,80,t,fc=LG,fs=FS-1.4,r=1.1); flow([(x+WW/2,86),(x+WW/2,80)])
por,_=pore_pack(2,26,34,57,0.9,1.6,seed=33,fine=800)
flow([(8,67),(8,57.6)],'solid',lw=LW); flow([(26,57.6),(26,67)],'info',lw=LW)
lab(10,63.2,'weather in',fs=FS-1.6,ha='left'); lab(28,63.2,'$K_s$, $\\theta(\\psi)$',fs=FS-1.6,ha='left')
txt(18,23.4,'Ten soils (pore network)',FS-0.9)
lab(18,18.4,'Saxton–Rawls hydraulics\nfeed both engines and the\ndesign layers',fs=FS-1.7)
# (a) verification against published references
a=inset(fig,W,H,60,42,81,55.5)
a.set_visible(False)
a=inset(fig,W,H,56,42,83,55.5)
rows=['Surface (16 qty)','FAO-45 advance','Drip vs Christiansen','Sprinkler diameter']
a.set_yticks(range(4)); a.set_yticklabels(rows,fontsize=4.8,fontweight='bold'); a.invert_yaxis()
a.barh(0,1.81,height=0.5,color=HEX,ec='black',lw=0.7); a.plot([0.08],[0],marker='D',color='black',ms=2.6)
a.barh(1,5.1,left=-2.2,height=0.5,color=HEX,ec='black',lw=0.7)
a.barh(2,0.01,height=0.5,color=HEX,ec='black',lw=0.7); a.barh(3,1,height=0.5,color=HEX,ec='black',lw=0.7)
a.axvline(0,color='black',lw=0.8); a.set_xlim(-4,6.5); a.set_xlabel('relative error (%)',fontsize=5.4,fontweight='bold',labelpad=1)
a.text(2.2,3,'+1',fontsize=4.6,fontweight='bold',va='center')
a.text(2.1,0,'max 1.81 (median 0.08)',fontsize=4.4,fontweight='bold',va='center'); a.text(3.4,1,'−2.2…+2.9',fontsize=4.4,fontweight='bold',va='center',ha='left'); a.text(0.6,2,'0.01',fontsize=4.4,fontweight='bold',va='center')
txt(70,57.4,'Design layers against references',FS-1.3)
# (b) spearman by target
d=pd.read_csv(O+'p3_e1_heldout.csv'); d=d[d.set=='all']
nm={'ET_mm':'ET','irrigation_mm':'irrigation','drainage_1m_mm':'drainage','yield_Mg_ha':'yield','transpiration_mm':'transpiration','soil_evap_mm':'soil evap.','N_leached_kg_ha':'N leached'}
d=d.assign(l=d['var'].map(nm)).sort_values('rho')
b=inset(fig,W,H,106,42,127,55.5)
b.barh(range(len(d)),d.rho,color=[HEX if r>0.8 else BEI for r in d.rho],ec='black',lw=0.7,height=0.62)
b.set_yticks(range(len(d))); b.set_yticklabels(d.l,fontsize=4.8,fontweight='bold'); b.set_xlim(0,1.15); b.set_xlabel('Spearman $\\rho$ (1,000 held out)',fontsize=5.0,fontweight='bold',labelpad=1)
for i,r in enumerate(d.rho): b.text(r+0.02,i,'%.2f'%r,va='center',fontsize=4.6,fontweight='bold')
txt(106,57.4,'Engine 1 ranks scenarios',FS-1.3)
# (c) provenance
c=inset(fig,W,H,52,12,68,28); c.axis('off')
cnt=[38,18,78]; cols=[WAT,OCH,HEX]; labs=['Literature','Data-driven','Engineered']
w_,t_=c.pie(cnt,colors=cols,startangle=90,counterclock=False,wedgeprops=dict(width=0.42,ec='black',lw=0.8),radius=1.0)
c.text(0,0,'134',ha='center',va='center',fontsize=8,fontweight='bold')
for (n_,l_,x_,y_) in [(38,'Literature 38',-1.05,-1.0),(18,'Data-driven 18',1.0,0.95),(78,'Engineered 78',1.1,-0.9)]:
    pass
c.legend(w_,['Literature 38','Data-driven 18','Engineered 78'],fontsize=4.6,frameon=False,loc='center left',bbox_to_anchor=(1.05,0.5),handlelength=1,labelspacing=0.3,prop=dict(weight='bold',size=4.6))
txt(66,31.6,'Provenance of numbered equations',FS-1.3)
# (d) limitations
sbox(90,12,127,28,'Engine 2 does not reproduce\nEngine 1 irrigation in sand and\nloamy sand at dry triggers\n\nNo field validation yet;\nfew published examples',fc='#FBE9E7',fs=FS-1.7,r=1.1)
txt(108.5,31.6,'Stated limits',FS-1.3,c=RED)
sbox(38,0.6,127,5.0,'an auditable instrument: every number tied to an equation, a source and a re-runnable check',fc=LG,fs=FS-1.4,r=1.0)
# ---- relationships and reading order
flow([(34.6,48),(39.4,48)],'info')
flow([(84,48.5),(92,48.5)],'info')
for x,y,n in [(2.2,101.4,1),(2.2,56.4,2),(46.4,57.0,'A'),(94.0,57.0,'B'),(46.4,29.8,'C'),(92.4,29.8,'D')]: dot(x,y,n)
legend(2,-13.2,127,-3.4,chip_label='Input · red mark = reading order')
fig.savefig(FG+'p3/ga_p3.png',dpi=420,facecolor='white'); fig.savefig(FG+'p3/ga_p3.pdf',facecolor='white')
print('ok')
