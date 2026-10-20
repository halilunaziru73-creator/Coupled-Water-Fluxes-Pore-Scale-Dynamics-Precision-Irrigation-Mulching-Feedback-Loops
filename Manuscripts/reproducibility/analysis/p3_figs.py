import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from figstyle import *
import json, numpy as np, pandas as pd
from matplotlib import patches
from PIL import Image
CB='#0072B2'; CD='#D55E00'; CG='#009E73'; CY='#E69F00'
S=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_surface.json'))
# book values (Walker & Skogerboe 1987, Example 6.1)
book={'first':{'Treq':378.73,'tL':{0.10:80.2,0.075:198.6,0.0625:441.6},'Ea':{0.10:65.4,0.075:69.3,0.0625:58.5}},
      'later':{'Treq':868.5,'tL':{0.10:26.2,0.075:36.0,0.0625:46.3,0.05:68.2,0.0375:143.5},'Ea':{0.075:44.2,0.05:64.1,0.0375:79.1}}}
rows=[]
for k in ['first','later']:
    rows.append((k,'Treq',book[k]['Treq'],S[k]['Treq']))
    for r in S[k]['rows']:
        if r['Q'] in book[k]['tL']: rows.append((k,f"tL Q={r['Q']}",book[k]['tL'][r['Q']],r['tL']))
        if r['Q'] in book[k]['Ea']: rows.append((k,f"Ea Q={r['Q']}",book[k]['Ea'][r['Q']],100*r['Ea']))
T=pd.DataFrame(rows,columns=['irr','quantity','book','swafl']); T['err_pct']=100*(T.swafl-T.book)/T.book; T.to_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_ws61.csv',index=False); print(T.round(2).to_string()); print('max abs err',T.err_pct.abs().max(),'median',T.err_pct.abs().median())
border=pd.DataFrame([('Treq first',146.4,146.399),('Treq later',162.8,162.230),('Qmax',1.88,1.8832),('tL first Q=0.14, L=360 (approx.)',158,158.677),('A0 (m2)',0.0303,0.03034)],columns=['quantity','book','swafl']); border['err_pct']=100*(border.swafl-border.book)/border.book; border.to_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_border.csv',index=False)
# Fig3 parity
fig,axs=plt.subplots(1,3,figsize=(7.4,2.6))
tl=T[T.quantity.str.startswith('tL')]; ax=axs[0]; ax.loglog(tl.book,tl.swafl,'o',color=CB); ax.plot([20,500],[20,500],color='#999',lw=0.8); ax.minorticks_off(); ax.set_xticks([30,100,300]); ax.set_yticks([30,100,300]); ax.set_xticklabels(['30','100','300']); ax.set_yticklabels(['30','100','300']); ax.set_xlabel('Published advance time $t_L$ (min)'); ax.set_ylabel('SWAFL (min)'); panel(ax,'a',x=-0.25)
ea=T[T.quantity.str.startswith('Ea')]; ax=axs[1]; ax.plot(ea.book,ea.swafl,'o',color=CG); ax.plot([40,85],[40,85],color='#999',lw=0.8); ax.set_xlabel('Published $E_a$ (%)'); ax.set_ylabel('SWAFL (%)'); panel(ax,'b',x=-0.25)
ax=axs[2]; ax.bar(range(len(T)),T.err_pct,color=[CB if q.startswith('tL') else CG if q.startswith('Ea') else CY for q in T.quantity]); ax.axhline(0,color='#666',lw=0.5); ax.set_xticks([]); ax.set_xlabel('Published quantities (n=%d)'%len(T)); ax.set_ylabel('Relative difference (%)'); panel(ax,'c',x=-0.25)
fig.tight_layout(); save(fig,'fig03_ws_verification','p3')
# Fig5: E1 held-out
r=pd.read_json(__import__('os').environ.get('SWAFL_MS','.')+'/out/e12.json'); p=pd.DataFrame(json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/e12_pred.json')))
m=[('ET_mm','et','ET (mm)'),('irrigation_mm','irr','Irrigation (mm)'),('drainage_1m_mm','drain','Drainage (mm)'),('yield_Mg_ha','yield','Yield (Mg ha$^{-1}$)'),('transpiration_mm','transp','Transpiration (mm)'),('soil_evap_mm','evap','Soil evaporation (mm)'),('N_leached_kg_ha','nl','N leached (kg ha$^{-1}$)')]
i0=r[(r.z==20)&(r.trig==-300)&(r.P==1.0)].index[0]
fig,axs=plt.subplots(2,4,figsize=(7.6,3.9)); 
for ax,(k,v,lab),L in zip(axs.ravel(),m,'abcdefg'):
    y=r[k].values.astype(float); x=p[v].values.astype(float)
    ax.scatter(y,x,s=2,alpha=0.35,color=CD,label='as shipped')
    xa=x-(x[i0]-y[i0]) if k in('drainage_1m_mm','N_leached_kg_ha') else x*(y[i0]/x[i0]); ax.scatter(y,xa,s=2,alpha=0.35,color=CB,label='re-anchored')
    lo=min(y.min(),x.min(),xa.min()); hi=max(y.max(),x.max(),xa.max()); ax.plot([lo,hi],[lo,hi],color='#999',lw=0.7); ax.set_xlabel('Daisy '+lab); ax.set_ylabel('Engine 1'); panel(ax,L,x=-0.3,y=1.02)
h_,l_=axs[0,0].get_legend_handles_labels(); axs[1,3].axis('off'); axs[1,3].legend(h_,l_,loc='center',frameon=False,markerscale=4)
fig.tight_layout(); save(fig,'fig05_engine1_heldout','p3')
# Fig6 engine 2
g=pd.DataFrame(json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_e2_grid.json'))); c=pd.DataFrame(json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_e2_closure.json')))
fig,axs=plt.subplots(1,3,figsize=(7.4,2.6))
ax=axs[0]; ax.hist(100*c.relres,bins=20,color='#9ecae1',edgecolor='#444',lw=0.4); ax.set_xlabel('Daily-core closure residual (% of inflow)'); ax.set_ylabel('Scenarios (n=60)'); panel(ax,'a',x=-0.25)
ax=axs[1]; ax.scatter(g.irrT,g.irrS,s=14,color=CB,alpha=0.8); ax.plot([0,550],[0,550],color='#999',lw=0.8); ax.set_xlabel('Engine 1 annual irrigation (mm)'); ax.set_ylabel('Engine 2 mean irrigation (mm)'); panel(ax,'b',x=-0.25)
ax=axs[2]; bad=g[g.soil.str.startswith('S03')]; ax.scatter(g.drT,g.drS,s=14,color=CD,alpha=0.8); ax.plot([0,300],[0,300],color='#999',lw=0.8); ax.set_xlabel('Engine 1 annual drainage (mm)'); ax.set_ylabel('Engine 2 unscaled drainage (mm)'); panel(ax,'c',x=-0.3)
fig.tight_layout(); save(fig,'fig06_engine2','p3')
# Fig7 drip
a=np.load(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_drip_cmp.npy'); rows=[q for q in json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_drip_swafl.json')) if q['Hmin']==0]; H0=np.array([q['H0'] for q in rows])
fig,axs=plt.subplots(1,2,figsize=(7.2,2.7)); ax=axs[0]; ax.loglog(a[:,1],a[:,0],'o',ms=3,color=CB); ax.plot([1e-2,12],[1e-2,12],color='#999',lw=0.8); ax.set_xlabel('Independent converged solver $h_f$ (m)'); ax.set_ylabel('SWAFL lateral solver $h_f$ (m)'); panel(ax,'a',x=-0.2)
ax=axs[1]; fr=a[:,1]/H0; err=100*np.abs(a[:,0]-a[:,1])/np.maximum(a[:,1],1e-6); ax.semilogy(fr,np.maximum(err,1e-4),'o',ms=3,color=CD); ax.axvline(0.2,color='#666',ls='--',lw=0.7); ax.text(0.21,3e-4,'design limit $h_f$=0.2$H_0$',fontsize=6); ax.set_xlabel('$h_f/H_0$'); ax.set_ylabel('Relative difference in $h_f$ (%)'); panel(ax,'b',x=-0.2)
fig.tight_layout(); save(fig,'fig07_drip','p3')
# Fig1 architecture
fig,ax=plt.subplots(figsize=(7.4,3.6)); ax.axis('off'); ax.set_xlim(0,10); ax.set_ylim(0,5)
def box(x,y,w,h,t,c,fs=6.8): ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.03,rounding_size=0.1',fc=c,ec='#444',lw=0.8)); ax.text(x+w/2,y+h/2,t,ha='center',va='center',fontsize=fs)
def arr(x1,y1,x2,y2): ax.annotate('',xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle='-|>',color='#444',lw=1))
box(0.1,3.7,2.8,1.1,'Evidence layer\n10,190 Daisy runs, 17 experiments\n(archived, versioned data)','#D6EAF8'); box(3.6,3.7,2.8,1.1,'Engine 1: annual meta-model\nratio/lookup composition\nEqs. (5.4)-(5.12)','#FCF3CF'); box(7.1,3.7,2.8,1.1,'Engine 2: daily bucket model\nstochastic rain, roots, trigger;\nscaled to Engine 1','#FADBD8')
box(0.1,1.9,2.8,1.3,'Design layers (closed form)\nSurface: volume balance\nDrip: lateral + bulb\nSprinkler: nozzle, pattern, CU','#D5F5E3'); box(3.6,1.9,2.8,1.3,'Equation-traceable dashboard\nTiles = sums of the daily series;\nevery number maps to an equation','#E8DAEF'); box(7.1,1.9,2.8,1.3,'Decision outputs\nSchedule, trigger, design table,\nsensitivity, baseline comparison','#F5CBA7')
box(0.1,0.0,9.8,1.5,'Provenance labels: [Literature] equation from a cited source;\n[Data-driven] constant or table taken from the Daisy ensemble;  [Engineered] heuristic fixed by the developer.\nVerification suite: published worked examples; held-out ensemble runs; closure; independent numerical solvers; run time.','#F4F6F7',6.5)
arr(2.95,4.25,3.55,4.25); arr(6.45,4.25,7.05,4.25); arr(1.5,3.65,1.5,3.25); arr(5.0,3.65,5.0,3.25); arr(8.5,3.65,8.5,3.25); arr(2.95,2.55,3.55,2.55); arr(6.45,2.55,7.05,2.55)
save(fig,'fig01_architecture','p3')
# montage of layers: only the central drawing of each layer (no menus or panels)
from PIL import ImageOps, ImageDraw, ImageFont
def mont(names,labels,out,ncol=3,w=1000,box=(748,325,2400,1785)):
    ims=[Image.open(f'{__import__("os").environ.get("SWAFL_MS",".")}/fig/shots/layer_{n}.png').convert('RGB').crop(box) for n in names]; ims=[ImageOps.expand(i,border=(90,0,0,0),fill=(255,255,255)) for i in ims]; ims=[i.resize((w,int(w*i.height/i.width)),Image.LANCZOS) for i in ims]
    nr=(len(ims)+ncol-1)//ncol; h=ims[0].height; W=ncol*w+(ncol+1)*10; H=nr*h+(nr+1)*10; M=Image.new('RGB',(W,H),(255,255,255))
    d=ImageDraw.Draw(M); f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',34)
    for k,(im,lb) in enumerate(zip(ims,labels)):
        x=10+(k%ncol)*(w+10); y=10+(k//ncol)*(h+10); M.paste(im,(x,y)); d.rectangle([x,y,x+60,y+52],fill=(255,255,255)); d.text((x+10,y+6),lb,fill=(34,34,34),font=f)
    M.save(out,quality=92)
mont(['field','e1','r1','n1','n2','v7'],list('abcdef'),__import__('os').environ.get('SWAFL_MS','.')+'/fig/p3/fig02_layers_montage.png')
print('ok')
