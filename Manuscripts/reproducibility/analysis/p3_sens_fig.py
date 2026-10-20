import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from figstyle import *
import json, numpy as np
E=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_e1_sens.json')); L=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_l_sens.json'))
b=E['base']; CB='#0072B2'; CD='#D55E00'; CG='#009E73'; CY='#E69F00'; CP='#CC79A7'
fig,ax=plt.subplots(2,3,figsize=(7.4,5.2))
ORDER=None
def tornado(a,key,title,unit,first):
    global ORDER
    rows=[(f['name'],f['lo'][key]-b[key],f['hi'][key]-b[key],f['labLo'],f['labHi']) for f in E['F']]
    rows=[r for r in rows if r[0] not in ('Irrigation method','Nitrogen rate')]
    rows=[(r[0].replace('Mulch vapour-flux factor','Mulch factor'),)+r[1:] for r in rows]
    if ORDER is None:
        ORDER=[r[0] for r in sorted(rows,key=lambda r:max(abs(r[1]),abs(r[2])))]
    rows.sort(key=lambda r:ORDER.index(r[0]))
    for i,r in enumerate(rows):
        a.barh(i,r[1],color=CB,height=0.62); a.barh(i,r[2],color=CD,height=0.62)
    a.set_yticks(range(len(rows)))
    if first: a.set_yticklabels([f"{r[0]}\n{r[3].replace('x','×').replace('-','−')} | {r[4].replace('x','×').replace('-','−')}" for r in rows],fontsize=5.6,linespacing=1.1)
    else: a.set_yticklabels([])
    a.axvline(0,color='#444',lw=0.7); a.tick_params(axis='x',labelsize=6.5)
    a.set_xlabel(f'$\\Delta$ {title} ({unit}); baseline {b[key]:.0f}',fontsize=6.5)
    lim=max(max(abs(r[1]),abs(r[2])) for r in rows)*1.15; a.set_xlim(-lim,lim)
tornado(ax[0,0],'irr','irrigation','mm yr$^{-1}$',True); panel(ax[0,0],'a',x=-0.62)
tornado(ax[0,1],'drain','drainage','mm yr$^{-1}$',False); panel(ax[0,1],'b',x=-0.08)
from matplotlib.patches import Patch
ax[0,1].legend(handles=[Patch(color=CB,label='first setting'),Patch(color=CD,label='second setting')],frameon=False,fontsize=6,loc='lower left')
S=E['SO']; x=np.arange(10); w=0.4
ax[0,2].bar(x-w/2,[s['irr'] for s in S],w,color=CB,label='Irrigation'); ax[0,2].bar(x+w/2,[s['drain'] for s in S],w,color=CD,label='Drainage')
ax[0,2].set_xticks(x); ax[0,2].set_xticklabels([f"S{i+1:02d}" for i in range(10)],rotation=90,fontsize=6.5); ax[0,2].set_ylabel('mm yr$^{-1}$'); ax[0,2].legend(frameon=False,fontsize=6.5,loc='upper left'); ax[0,2].set_ylim(0,540); panel(ax[0,2],'c',x=-0.2)
# soil order in engine: S01..S10 same order as list
cols=[CB,CG,CY,CP]
def seg(a,d,H0,c,lab):
    x=[r['LL'] for r in d]; y=[r['Eu']*100 for r in d]; ok=[r['hf']/H0<=0.2 for r in d]
    a.plot([xi for xi,o in zip(x,ok) if o],[yi for yi,o in zip(y,ok) if o],color=c,lw=1.5,label=lab)
    xs=[xi for xi,o in zip(x,ok) if not o]; ys=[yi for yi,o in zip(y,ok) if not o]
    if xs: j=ok.index(False); a.plot([x[j-1]]+xs if j>0 else xs,[y[j-1]]+ys if j>0 else ys,color=c,lw=1.0,ls=(0,(2,2)))
for i,D in enumerate([13,16,20,25]):
    d=[r for r in L['drip'] if r['D']==D]; seg(ax[1,0],d,10,cols[i],f'D = {D} mm')
ax[1,0].axhline(90,color='#999',ls=':',lw=0.8); ax[1,0].set_xlabel('Lateral length (m)'); ax[1,0].set_ylabel('Emission uniformity $E_u$ (%)'); ax[1,0].legend(frameon=False,fontsize=6.3,loc='lower left'); ax[1,0].set_ylim(60,100); panel(ax[1,0],'d',x=-0.2)
for i,H in enumerate([6,8,10,14,20]):
    d=[r for r in L['drip2'] if r['H0']==H]; seg(ax[1,1],d,H,plt.cm.viridis(i/4),f'$H_0$ = {H} m')
ax[1,1].axhline(90,color='#999',ls=':',lw=0.8); ax[1,1].set_xlabel('Lateral length (m), D = 16 mm'); ax[1,1].set_ylabel('$E_u$ (%)'); ax[1,1].legend(frameon=False,fontsize=6.3,loc='lower left'); ax[1,1].set_ylim(60,100); panel(ax[1,1],'e',x=-0.2)
for i,P in enumerate([200,300,400]):
    d=[r for r in L['spr'] if r['P']==P]; ax[1,2].plot([r['u'] for r in d],[r['Ea']*100 for r in d],'o-',ms=3,color=[CP,CB,CG][i],lw=1.3,label=f'{P} kPa (CU {d[0]["CU"]*100:.0f}%)')
ax[1,2].set_xlabel('Wind speed (m s$^{-1}$)'); ax[1,2].set_ylabel('Application efficiency $E_a$ (%)'); ax[1,2].legend(frameon=False,fontsize=6.3,loc='center right'); ax[1,2].set_ylim(30,100); panel(ax[1,2],'f',x=-0.2)
fig.tight_layout(w_pad=1.0,h_pad=1.4); save(fig,'fig08_sensitivity','p3')
