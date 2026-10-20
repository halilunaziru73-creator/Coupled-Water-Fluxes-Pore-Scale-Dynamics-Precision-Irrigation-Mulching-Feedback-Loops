# Shared stock-and-flow figure style (same as P3 Fig. 1)
import numpy as np, matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import patches
plt.rcParams.update({'font.family':'Carlito','mathtext.fontset':'custom','mathtext.rm':'Carlito','mathtext.it':'Carlito:italic','mathtext.bf':'Carlito:bold','mathtext.fallback':'stixsans'})
BLK='#000000'; GRY='#8c8c8c'; RED='#C0392B'
WAT='#9ECBEB'; GRN='#78C257'; BEI='#EADFC2'; OCH='#CC8E1F'; HEX='#C9E7B0'; LG='#D9F2E3'; DRV='#3B82C4'
FS=7.0; LW=1.3
ax=None
YLO=0
STIP_BG='#DCE8F4'; STIP_DOT='#7F9FC6'
def setup(W,H,figw):
    global ax
    fig=plt.figure(figsize=(figw,figw*H/W),facecolor='white'); ax=fig.add_axes([0,0,1,1]); ax.set_xlim(0,W); ax.set_ylim(0,H); ax.axis('off'); return fig
def txt(x,y,s,fs=FS,ha='center',va='center',c=BLK,**k): ax.text(x,y,s,fontsize=fs,ha=ha,va=va,fontweight='bold',color=c,zorder=8,linespacing=1.12,**k)
def lab(x,y,s,fs=FS-0.6,ha='center',c=BLK,**k): ax.text(x,y,s,fontsize=fs,ha=ha,va='center',fontweight='bold',color=c,zorder=8,linespacing=1.1,bbox=dict(fc='white',ec='none',pad=0.4,alpha=0.85),**k)
def sbox(x0,y0,x1,y1,s,fc=WAT,fs=FS,two=None,r=1.3,lw=LW,fsz=None):
    ax.add_patch(patches.FancyBboxPatch((x0,y0),x1-x0,y1-y0,boxstyle=f'round,pad=0,rounding_size={r}',fc=fc,ec=BLK,lw=lw,zorder=3))
    if two:
        ax.add_patch(patches.FancyBboxPatch((x0,y0),(x1-x0)*two[0],y1-y0,boxstyle=f'round,pad=0,rounding_size={r}',fc=two[1],ec='none',zorder=3.2))
        ax.add_patch(patches.FancyBboxPatch((x0,y0),x1-x0,y1-y0,boxstyle=f'round,pad=0,rounding_size={r}',fc='none',ec=BLK,lw=lw,zorder=3.4))
    txt((x0+x1)/2,(y0+y1)/2,s,fs)
def hexa(x0,y0,x1,y1,s,fc=HEX,fs=FS-0.4,d=None):
    d=d or min(2.2,(y1-y0)/2)
    pts=[(x0,(y0+y1)/2),(x0+d,y1),(x1-d,y1),(x1,(y0+y1)/2),(x1-d,y0),(x0+d,y0)]
    ax.add_patch(patches.Polygon(pts,closed=True,fc=fc,ec=BLK,lw=1.2,zorder=3)); txt((x0+x1)/2,(y0+y1)/2,s,fs)
def circ(x,y,r,s='',fc=WAT,fs=FS):
    ax.add_patch(patches.Circle((x,y),r,fc=fc,ec=BLK,lw=1.2,zorder=3))
    if s: txt(x,y,s,fs)
def flow(pts,kind='solid',lw=LW,ms=8,head=True):
    col={'solid':BLK,'out':BLK,'info':BLK,'grey':GRY,'greyd':GRY,'loop':RED}[kind]
    ls={'solid':'-','out':(0,(4,2.6)),'info':(0,(1,2.2)),'grey':'-','greyd':(0,(4.5,2.8)),'loop':(0,(4,2.4))}[kind]
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    ax.plot(xs[:-1] if len(pts)>2 else xs,ys[:-1] if len(pts)>2 else ys,color=col,lw=lw,ls=ls,zorder=6,solid_capstyle='butt')
    if len(pts)>2: ax.plot(xs[-2:],ys[-2:],color=col,lw=lw,ls=ls,zorder=6,solid_capstyle='butt')
    if head:
        (x1,y1),(x2,y2)=pts[-2],pts[-1]
        ax.annotate('',xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle='-|>,head_width=0.22,head_length=0.5',color=col,lw=0.1,shrinkA=0,shrinkB=0,mutation_scale=ms*1.3),zorder=7)
def dot(x,y,n,r=1.6):
    ax.add_patch(patches.Circle((x,y),r,fc=RED,ec='white',lw=0.9,zorder=9)); ax.text(x,y-0.05,str(n),fontsize=7.0,color='white',ha='center',va='center',zorder=10,fontweight='bold')
def chip(x0,y0,x1,y1,t,sub='',fs=FS-1.2,tri=True):
    ax.add_patch(patches.FancyBboxPatch((x0,y0),x1-x0,y1-y0,boxstyle='round,pad=0,rounding_size=0.8',fc='white',ec=DRV,lw=1.2,ls=(0,(4,2.2)),zorder=3))
    if tri: ax.add_patch(patches.Polygon([(x1-2.6,y1-1.3),(x1-0.9,y1-1.3),(x1-1.75,y1-2.8)],closed=True,fc=DRV,ec='none',zorder=6))
    if sub: txt((x0+x1)/2-0.8,y1-1.9,t,fs,c=DRV); txt((x0+x1)/2,y0+(y1-y0-3.2)/2,sub,fs-0.1,c='#222222')
    else: txt((x0+x1)/2-0.8,(y0+y1)/2,t,fs,c=DRV)
def stipple(x0,y0,x1,y1,n=300,seed=7):
    ax.add_patch(patches.Rectangle((x0,y0),x1-x0,y1-y0,fc=STIP_BG,ec='none',zorder=2))
    r=np.random.default_rng(seed); ax.scatter(r.uniform(x0+.5,x1-.5,n),r.uniform(y0+.5,y1-.5,n),s=0.9,color=STIP_DOT,zorder=2.2,lw=0)
    ax.add_patch(patches.Rectangle((x0,y0),x1-x0,y1-y0,fc='none',ec=BLK,lw=LW+0.2,zorder=3))
def legend(x0,y0,x1,y1,fs=FS-1.8,chip_label='Driving variable or control'):
    ax.add_patch(patches.FancyBboxPatch((x0,y0),x1-x0,y1-y0,boxstyle='round,pad=0,rounding_size=0.8',fc='white',ec='#444444',lw=0.8,zorder=3))
    it=[('solid','Flow of water, matter, information'),('out','Outflow from the system'),('info','Information within modules'),('greyd','Information between modules'),('loop','Feedback')]
    n=len(it)+1; w=(x1-x0)/3.0
    for i,(k,t) in enumerate(it+[('chip',chip_label)]):
        c=i%3; r=i//3; x=x0+1.5+c*w; y=y1-2.6-r*(y1-y0-2.0)/2
        if k=='chip': ax.add_patch(patches.Rectangle((x,y-0.8),5,1.6,fc='white',ec=DRV,lw=1.0,ls=(0,(3,1.8)),zorder=6))
        else: flow([(x,y),(x+5,y)],k,head=False,lw=1.1)
        ax.text(x+6.2,y,t,fontsize=fs,ha='left',va='center',fontweight='bold',zorder=8)

def bands(W,H,yg,ylow=0,atm=(65,90),soil=(1.5,None),lx=None):
    """Clear demarcation of the soil: a distinct ground line labelled 'soil surface' (white background kept)."""
    ax.set_xlim(0,W); ax.set_ylim(YLO,H)
    ax.plot([-60,W+60],[yg,yg],color='#B98A4E',lw=2.6,alpha=0.85,zorder=0.5,solid_capstyle='butt')
    ax.text(lx if lx else W-1.2,yg-2.0,'soil surface',fontsize=6.0,ha='center' if lx else 'right',va='center',color='#8A6A3E',fontweight='bold',zorder=0.6,style='italic')
    ax.text(lx if lx else W-1.2,yg-4.8,'soil',fontsize=6.0,ha='center' if lx else 'right',va='center',color='#8A6A3E',fontweight='bold',zorder=0.6)

# ---------- graphical-abstract helpers ----------
def pore_pack(x0,y0,x1,y1,rmin,rmax,seed=3,fine=0,n_try=6000,label=None):
    """Random polydisperse disc packing (2-D section of a soil): grains tan with outline, pore space = water-blue.
    Returns the pore-area fraction (porosity of the drawn section) and draws a clipped panel in data coords."""
    from matplotlib.patches import Rectangle, Circle
    r=np.random.default_rng(seed); W_=x1-x0; H_=y1-y0
    bg=Rectangle((x0,y0),W_,H_,fc='#BFDDF2',ec='none',zorder=2); ax.add_patch(bg)
    clip=Rectangle((x0,y0),W_,H_,transform=ax.transData)
    pl=[]
    for _ in range(n_try):
        rr=r.uniform(rmin,rmax); x=r.uniform(x0,x1); y=r.uniform(y0,y1)
        if all((x-a)**2+(y-b)**2>=(rr+c+0.12)**2 for a,b,c in pl): pl.append((x,y,rr))
    cols=['#D9C08F','#CDB07A','#E3CFA3','#BFA06B','#B79563']
    for a,b,c in pl:
        for p_ in (Circle((a,b),c,fc=cols[int(r.integers(len(cols)))],ec='#8A6A3E',lw=0.45,zorder=2.4),Circle((a-c*0.25,b+c*0.25),c*0.35,fc='white',ec='none',alpha=0.22,zorder=2.5)):
            ax.add_patch(p_); p_.set_clip_path(clip)
    if fine:   # clay-size particles filling throats
        pts=r.uniform([x0,y0],[x1,y1],(fine,2))
        for a,b in pts:
            if all((a-p)**2+(b-q)**2>(c+0.25)**2 for p,q,c in pl):
                q_=Circle((a,b),0.28,fc='#9C7A4B',ec='none',zorder=2.6); ax.add_patch(q_); q_.set_clip_path(clip)
    A=sum(np.pi*c*c for _,_,c in pl); por=1-A/(W_*H_)
    ax.add_patch(Rectangle((x0,y0),W_,H_,fc='none',ec=BLK,lw=LW,zorder=3))
    return por,pl
def inset(fig,W,H,x0,y0,x1,y1):
    a=fig.add_axes([x0/W,(y0-YLO)/(H-YLO),(x1-x0)/W,(y1-y0)/(H-YLO)],facecolor='white'); a.set_zorder(10)
    for s in ['top','right']: a.spines[s].set_visible(False)
    for s in ['left','bottom']: a.spines[s].set_linewidth(0.9)
    a.tick_params(labelsize=5.4,length=2,width=0.7,pad=1.5)
    for t in a.get_xticklabels()+a.get_yticklabels(): t.set_fontweight('bold')
    return a
def ptitle(x,y,s,fs=FS-0.6,c=BLK): txt(x,y,s,fs,c=c)

def finish_a4(fig,W,H,figw=6.1):
    """Give the canvas the exact A4-landscape proportion (297:210) by padding the shorter side symmetrically; content is unchanged."""
    r=297/210
    xl=(0,W); yl=(YLO,H)
    if (W-xl[0])/(H-yl[0])<r:
        ex=((H-yl[0])*r-W)/2; xl=(-ex,W+ex)
    else:
        ey=((W)/r-(H-yl[0]))/2; yl=(YLO-ey,H+ey)
    ax.set_xlim(*xl); ax.set_ylim(*yl); fig.set_size_inches(figw,figw/r)
# ---------- Figure 1 colour scheme: brown, orange, pink, rust, purple ----------
FIG1_PALETTE={'WAT':'#F4B6CB','GRN':'#F6A247','BEI':'#DDC6AE','OCH':'#CC6B45','HEX':'#D8C7EA','LG':'#FBDDB9','DRV':'#7B4FA0','RED':'#B7410E',
              'STIP_BG':'#FBE4EC','STIP_DOT':'#D07FA3','TXT_OUT':'#8B5A3C'}
def use_fig1_palette():
    import types
    g=globals(); old={k:g[k] for k in FIG1_PALETTE if k in g}
    mp={old[k]:v for k,v in FIG1_PALETTE.items() if k in old}
    for k,v in FIG1_PALETTE.items(): g[k]=v
    for n,f in list(g.items()):
        if isinstance(f,types.FunctionType) and f.__defaults__:
            f.__defaults__=tuple(mp.get(d,d) if isinstance(d,str) else d for d in f.__defaults__)
