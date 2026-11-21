import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
from matplotlib.collections import PatchCollection
from matplotlib.colors import LinearSegmentedColormap
rng=np.random.default_rng(11)
W,H=1000,1470
# random disc packing by dart throwing with decreasing radius
discs=[]
def ok(x,y,r):
    for (a,b,c) in discs:
        if (a-x)**2+(b-y)**2<(c+r+5)**2: return False
    return True
for r in (46,36,28,22,17,13,10):
    tries=0
    while tries<9000:
        x=rng.uniform(-20,W+20);y=rng.uniform(-20,H+20);tries+=1
        if ok(x,y,r): discs.append((x,y,r))
discs=np.array(discs)
fig=plt.figure(figsize=(W/100,H/100),dpi=200);ax=fig.add_axes([0,0,1,1]);ax.set_xlim(0,W);ax.set_ylim(0,H);ax.axis('off')
# background: pore space, dark
yy=np.linspace(0,1,400)[:,None]*np.ones((1,300))
bg=LinearSegmentedColormap.from_list('b',['#031c2e','#06405a','#0a7f8c'])
ax.imshow(yy,extent=[0,W,0,H],cmap=bg,aspect='auto',zorder=0,origin='lower')
# wetting front noisy
xs=np.linspace(0,W,200);front=H*0.50+60*np.sin(xs/90)+35*np.sin(xs/37+1)+rng.normal(0,6,200).cumsum()*0.15
fr=lambda x:np.interp(x,xs,front)
# water pools in pore space below front
ax.fill_between(xs,0,front,color='#1aa6d8',alpha=.55,zorder=1)
ax.fill_between(xs,0,front-140,color='#0b6fb3',alpha=.55,zorder=1)
earth=['#d9b48a','#c99a6a','#b8825a','#a46a45','#e6c9a2','#8d5a3b','#cfa578']
pc=[];cols=[]
for (x,y,r) in discs:
    t=rng.integers(0,len(earth));c=earth[t]
    wet=y<fr(x)
    pc.append(Circle((x,y),r));cols.append(c)
col=PatchCollection(pc,facecolors=cols,edgecolors='#3b2616',linewidths=.6,zorder=3)
ax.add_collection(col)
# highlights
for (x,y,r) in discs:
    ax.add_patch(Circle((x-r*.32,y+r*.32),r*.38,fc='white',alpha=.14,ec='none',zorder=4))
    d=y-fr(x)
    if -90<d<60 and r>8:   # water films around grains near the front
        ax.add_patch(Circle((x,y),r+4.5,fc='none',ec='#7fe0ff',lw=2.6,alpha=.9,zorder=2))
    if d<-90:  # fully wet: darker blue tint on grains
        ax.add_patch(Circle((x,y),r,fc='#0b5fa5',alpha=.30,ec='none',zorder=4))
# flow arrows
for x0 in (180,420,640,860):
    ax.annotate('',xy=(x0,fr(x0)-170),xytext=(x0,fr(x0)+40),arrowprops=dict(arrowstyle='-|>',color='#ffe28a',lw=3,mutation_scale=28),zorder=6)
# dark scrims for text
sc=(np.linspace(0,1,300)**0.55)[:,None]*np.ones((1,10))
ax.imshow(sc,extent=[0,W,H*0.42,H],cmap=LinearSegmentedColormap.from_list('s',[(0,0,0,0),(0.01,0.09,0.16,.97)]),aspect='auto',zorder=7,origin='lower',vmin=0,vmax=1)
sc2=np.linspace(0,1,200)[:,None]*np.ones((1,10))
ax.imshow(sc2,extent=[0,W,0,H*0.2],cmap=LinearSegmentedColormap.from_list('s',[(0.01,0.09,0.16,.97),(0,0,0,0)]),aspect='auto',zorder=7,origin='lower')
fig.savefig('/tmp/kh/fig/cover_art.png',dpi=200)
