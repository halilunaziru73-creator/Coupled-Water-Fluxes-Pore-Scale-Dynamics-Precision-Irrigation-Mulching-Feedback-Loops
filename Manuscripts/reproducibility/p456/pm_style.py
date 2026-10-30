"""Drawing helpers in the style of the Daisy process map (rounded pastel boxes, flux pills, two-tone pools, elbow arrows, legend)."""
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import patches
plt.rcParams.update({'font.family':'Liberation Serif','pdf.fonttype':42})
K={'blue':('#B5CCE6','#5A7BA6'),'pill':('#C9DBEF','#6E8FBA'),'green':('#BFE3A5','#5E9440'),'beige':('#E6DEC8','#8F8466'),'brown':('#C98A1E','#8A6A2A')}
NOFILL=False
DK='#1E1E1E'; YEL='#D9B84A'; HAT='#8AA0C0'
def canvas(w,h,size):
    fig=plt.figure(figsize=size); ax=fig.add_axes([0,0,1,1]); ax.set_xlim(0,w); ax.set_ylim(0,h); ax.axis('off')
    ax.add_patch(patches.FancyBboxPatch((1,1),w-2,h-2,boxstyle='round,pad=0,rounding_size=1.2',fc='white',ec='#CFCFC9',lw=1.0,zorder=0)); return fig,ax
def rbox(ax,x,y,w,h,text,kind='blue',fs=7,two=None,bold=True,r=1.0):
    fc,ec=K[kind]
    if NOFILL:
        ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={r}',fc='none',ec=ec if kind!='pill' else K['blue'][1],lw=2.0,zorder=3))
        ax.text(x+w/2,y+h/2,text,ha='center',va='center',fontsize=fs,fontweight='bold' if bold else 'normal',color=DK,zorder=6,linespacing=1.12); return
    if two:  # two-tone pool: left colour, right beige
        base=patches.FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={r}',fc=K['beige'][0],ec='none',zorder=3); ax.add_patch(base)
        left=patches.Rectangle((x,y),w*two,h,fc=fc,ec='none',zorder=3.2); ax.add_patch(left); left.set_clip_path(base)
        ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={r}',fc='none',ec=ec,lw=0.9,zorder=3.4))
    else:
        ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={r}',fc=fc,ec=ec,lw=0.9,zorder=3))
    ax.text(x+w/2,y+h/2,text,ha='center',va='center',fontsize=fs,fontweight='bold' if bold else 'normal',color=DK,zorder=6,linespacing=1.12)
def pill(ax,x,y,w,h,text,fs=5.8): rbox(ax,x,y,w,h,text,'pill',fs=fs,r=0.9)
def line(ax,pts,kind='solid',arrow=True,both=False):
    ls={'solid':'-','dash':(0,(3.5,2)),'dot':(0,(1,1.6)),'dashdot':(0,(4,1.5,1,1.5)),'thick':'-'}[kind]; lw=1.9 if kind=='thick' else 0.9
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    if len(pts)>2 or not arrow: ax.plot(xs[:-1] if arrow else xs,ys[:-1] if arrow else ys,color=DK,lw=lw,ls=ls,zorder=5,solid_capstyle='butt')
    if arrow:
        p,q=pts[-2],pts[-1]
        if len(pts)>2: p=pts[-2]
        ax.add_patch(patches.FancyArrowPatch(p,q,arrowstyle='<|-|>' if both else '-|>',mutation_scale=7,lw=lw,color=DK,ls=ls,zorder=5,shrinkA=0,shrinkB=0))
def node(ax,x,y,r=1.3): ax.add_patch(patches.Circle((x,y),r,fc='#6E9BD0',ec='#3E6BA0',lw=0.8,zorder=6))
def txt(ax,x,y,s,fs=6,ha='center',st='italic',c=DK,rot=0): ax.text(x,y,s,fontsize=fs,color=c,ha=ha,va='center',style=st,zorder=7,rotation=rot)
def horizon(ax,y,x0=3,x1=197): ax.plot([x0,x1],[y,y],color=YEL,lw=1.0,ls=(0,(1,1.6)),zorder=2)
def legend(ax,x,y,step=3.7,w=14):
    items=[('solid','Inputs and movement of data within a part'),('dash','Outputs'),('dot','Exchange of information within a part'),('thick','Movement of data between parts'),('dashdot','Exchange of information between parts')]
    for k,(kd,t) in enumerate(items):
        yy=y-k*step; ls={'solid':'-','dash':(0,(3.5,2)),'dot':(0,(1,1.6)),'dashdot':(0,(4,1.5,1,1.5)),'thick':'-'}[kd]
        ax.plot([x,x+w],[yy,yy],color=DK,lw=1.9 if kd=='thick' else 0.9,ls=ls,zorder=5); txt(ax,x+w+2,yy,t,fs=5.9,ha='left',st='normal')
def hatch(ax,y,text,x0=3,x1=197):
    import numpy as np
    for xx in np.arange(x0,x1,2.6): ax.plot([xx,xx+1.8],[y-1.2,y+1.2],color=HAT,lw=0.8,zorder=2)
    ax.text((x0+x1)/2,y,text,ha='center',va='center',fontsize=5.8,fontfamily='Liberation Serif',color=DK,zorder=7,bbox=dict(fc='white',ec='none',pad=1.2))
