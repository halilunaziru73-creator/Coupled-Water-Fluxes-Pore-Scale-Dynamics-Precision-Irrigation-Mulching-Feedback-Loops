import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import numpy as np
from scipy.spatial import ConvexHull
O=[];w=O.append
rng=np.random.default_rng(11)
w(r"""\section{Fit to the Daisy data and genotype call (P.20, P.21)}""")
rows=[];J=0
items=[("relative yield",0.86,0.90,0.05),("transpiration share",0.52,0.55,0.05),("mulch effect on $E$",0.31,0.28,0.06),("E2 point 1",0.97,1.00,0.04),("E2 point 2",0.93,0.95,0.04),("E2 point 3",0.88,0.90,0.04),("E2 point 4",0.74,0.80,0.05),("E2 point 5",0.55,0.50,0.06)]
for nm,m,r,t in items:
    z=((m-r)/t)**2;J+=z;rows.append([nm,f"{m:.2f}",f"{r:.2f}",f"{t:.2f}",f"{z:.3f}"])
body=r"""The plant is compared with the Daisy runs by the objective $J(\theta)=\sum_k\bigl((m_k(\theta)-r_k)/\tau_k\bigr)^2$ over the relative yield, the transpiration share $\tau=T/(T+E_s)$, the mulch effect and five points of the E2 curve. The multipliers $\theta=(f_{\rm RUE},f_{kte},f_{qG})$ are searched one at a time with a step that is halved when no move helps. Using the assumed model values $m_k$, Daisy values $r_k$ and tolerances $\tau_k$ of Table~\ref{tab:J}, compute $J$.

\textbf{Solution.} Each term is $((m-r)/\tau)^2$. For the relative yield: $(0.86-0.90)/0.05=-0.8$, squared $0.64$. Summing the eight terms gives"""
body+=f" $J={J:.3f}$."+r""" A one-parameter search tries $f_{\rm RUE}\to1.1f_{\rm RUE}$ and keeps the change if $J$ falls; if neither $\pm$ step helps the step is halved, within the bounds 0.6 to 1.6 (RUE), 0.5 to 2.2 ($k_{te}$) and 0.25 to 4 ($q_G$), in at most 45 model runs."""
body+=tab(["Target","Model $m$","Daisy $r$","$\\tau$","$((m-r)/\\tau)^2$"],rows,"Objective of the fit to the Daisy data.","tab:J")
body+=r"""\textbf{Reading.} The largest contributions are the points where the model departs by more than its tolerance; the sum is the quantity that the search minimises. A value of $J$ near the number of targets (8) means the model is off by about one tolerance on average."""
w(ex("objective of the fit (P.20)",body))
# P.21
obs=np.array([[1.0,0.5],[1.2,0.6],[1.5,0.4]])  # not used
dist={'G1':0.40,'G2':0.55,'G3':0.20,'G4':0.90,'G5':1.60}
dmin=min(dist.values());Tt=0.03+0.25*dmin
wts={g:math.exp(-(d-dmin)/Tt) for g,d in dist.items()};S=sum(wts.values())
rows=[[g,f"{d:.2f}",f"{d-dmin:.2f}",f"{wts[g]:.4f}",f"{wts[g]/S:.3f}"] for g,d in dist.items()]
body=r"""The genotype call weights each genotype by $p_g\propto\exp\bigl(-(d_g-d_{\min})/(0.03+0.25d_{\min})\bigr)$, with $d_g$ the mean squared difference between its traits and the observed traits in units of the trait spread. Five genotypes have distances $0.40,0.55,0.20,0.90,1.60$ (assumed). Find the probabilities.

\textbf{Solution.} $d_{\min}=0.20$, so the temperature is $0.03+0.25(0.20)=0.08$. The weights are $e^{-(d-0.20)/0.08}$: for $d=0.40$, $e^{-2.5}=0.0821$; for $d=0.55$, $e^{-4.375}=0.0126$; $d=0.20$ gives 1; $d=0.90$ gives $e^{-8.75}=1.6\times10^{-4}$; $d=1.60$ gives $2.8\times10^{-7}$. The sum is """+f"{S:.4f}"+r""", so the probabilities are in Table~\ref{tab:geno}."""
body+=tab(["Genotype","$d_g$","$d_g-d_{\\min}$","Weight","$p_g$"],rows,"Genotype call.","tab:geno")
body+=r"""The call is confident (about 91 per cent for G3) because the best distance is much smaller than the next; had the distances been $0.20$ and $0.22$ the weights would be $1$ and $0.78$ and the call would be uncertain. The temperature grows with $d_{\min}$, so a poor best fit never gives a sharp call."""
w(ex("genotype probabilities (P.21)",body))
# P.22
Ap,Ah=420.0,560.0
geno=[("G1",5.1,6.8),("G2",4.2,7.1),("G3",5.6,6.2),("G4",3.1,5.9)]
Ysb=np.mean([g[1] for g in geno]);Ypb=np.mean([g[2] for g in geno])
rows=[[g,ys,yp,f"{(1-ys/yp)/(1-Ysb/Ypb):.3f}",f"{ys*yp/Ypb**2:.3f}"] for g,ys,yp in geno]
body=f"""The projected shoot area of a plant is $A_{{\\rm proj}}={Ap:.0f}$ cm$^2$ and the convex hull around the leaves is $A_{{\\rm hull}}={Ah:.0f}$ cm$^2$. Four genotypes have grain under stress $Y_s$ and without stress $Y_p$ (Mg ha$^{{-1}}$, assumed) as in Table~\\ref{{tab:dsi}}. Compute the solidity, the drought susceptibility index DSI $=(1-Y_s/Y_p)/(1-\\bar Y_s/\\bar Y_p)$ and the stress tolerance index STI $=Y_sY_p/\\bar Y_p^2$.

\\textbf{{Solution.}} Solidity $=A_{{\\rm proj}}/A_{{\\rm hull}}={Ap/Ah:.3f}$. The means are $\\bar Y_s={Ysb:.3f}$, $\\bar Y_p={Ypb:.3f}$, so $1-\\bar Y_s/\\bar Y_p={1-Ysb/Ypb:.4f}$. For G2: $1-4.2/7.1=0.4085$, DSI $=0.4085/{1-Ysb/Ypb:.4f}={(1-4.2/7.1)/(1-Ysb/Ypb):.3f}$; STI $=4.2\\times7.1/{Ypb:.3f}^2={4.2*7.1/Ypb**2:.3f}$."""
body+=tab(["Genotype","$Y_s$","$Y_p$","DSI","STI"],rows,"Drought susceptibility and stress tolerance indices.","tab:dsi")
body+=r"""\textbf{Reading.} DSI above 1 means the genotype loses more than the mean under stress (G2, G4); below 1 it is more tolerant (G3). STI rewards genotypes that are high in both environments: here G1 and G3 have the highest values."""
w(ex("solidity, DSI and STI (P.22)",body))
# P.23 root D95
z=np.arange(7.5,120,15);L=np.array([420,300,210,140,90,60,35,15.0])[:len(z)]
cum=np.cumsum(L)/L.sum()
k95=int(np.argmax(cum>=0.95))
# interpolate
zi=np.interp(0.95,np.r_[0,cum],np.r_[0,15*np.arange(1,len(z)+1)])
body=r"""Root length (cm) in the eight layers of 15 cm is $420,300,210,140,90,60,35,15$ (assumed). Find the depth $D_{95}$ at which the cumulative length reaches 95 per cent of the total, the root length density RLD $=L/(A\Delta z)$ of the top layer for a ground area $A=900$ cm$^2$, and the root-to-shoot ratio for $W_{\rm root}=18$ g and $W_{\rm shoot}=62$ g.

\textbf{Solution.} Total $=1270$ cm. Cumulative shares: """+", ".join(f"{c:.3f}" for c in cum)+f""". The 95 per cent mark lies in layer {k95+1} (cumulative {cum[k95-1]:.3f} before it and {cum[k95]:.3f} after); by linear interpolation inside the layer, $D_{{95}}={zi:.1f}$ cm. RLD of the top layer $=420/(900\\times15)=0.0311$ cm cm$^{{-3}}$. Root-to-shoot ratio $=18/62=0.290$."""
w(ex("depth of 95 per cent of the roots (P.23)",body))
w(r"""\section{The drought outlook and the stress calendar (P.24 to P.28)}""")
# P.25
S=[412,388,455,301,517,366,298,470,405,342,380,436,290,501,352,421,330,399,463,377]
ys=np.argsort(S)
body=r"""Each of the 20 years of the weather has the rain of the days that have no forecast, $S_i=\sum_{k\in\rm future}P_i(k)$ (mm), $412,388,455,301,517,366,298,470,405,342,380,436,290,501,352,421,330,399,463,377$ (assumed). Find the dry, typical and wet analogue years $i_{\rm dry}=\arg\min S_i$, $i_{\rm wet}=\arg\max S_i$ and $i_{\rm typ}=$ median.

\textbf{Solution.} The minimum is $"""+f"{min(S)}$ (year {int(np.argmin(S))+1}), the maximum {max(S)} (year {int(np.argmax(S))+1}). The sorted values are "+", ".join(map(str,sorted(S)))+f"; with 20 values the median is the mean of the 10th and 11th, $({sorted(S)[9]}+{sorted(S)[10]})/2={np.median(S):.1f}$ mm, and the typical year is the one nearest to it: year {int(np.argmin(abs(np.array(S)-np.median(S))))+1} ($S={S[int(np.argmin(abs(np.array(S)-np.median(S))))]}$). The three futures are real years of the record, so each has its own dry spells in the order in which they happened; they are not a forecast."
w(ex("analogue years (P.25)",body))
# P.26-27
a=[0.62,0.55,0.48,0.40,0.38,0.44,0.52,0.36,0.33,0.37,0.50,0.60,0.58,0.46,0.39,0.35]
p=0.55;thr=1-p
Ks=[min(1,x/(1-p)) for x in a]
s=[1 if x<thr else 0 for x in a]
# fill gaps<=2
filled=s[:]
i=0
idx=[k for k,v in enumerate(s) if v]
# find runs
runs=[];start=None
for k,v in enumerate(s):
    if v and start is None: start=k
    if not v and start is not None: runs.append((start,k-1));start=None
if start is not None: runs.append((start,len(s)-1))
merged=[]
for r in runs:
    if merged and r[0]-merged[-1][1]-1<=2: merged[-1]=(merged[-1][0],r[1])
    else: merged.append(r)
kept=[r for r in merged if r[1]-r[0]+1>=2]
rows=[[k+1,f"{x:.2f}",f"{min(1,x/(1-p)):.3f}","stress" if x<thr else "-"] for k,x in enumerate(a)]
txt="; ".join(f"days {ka+1} to {kb+1} ($n={kb-ka+1}$, $a_{{\\min}}={min(a[ka:kb+1]):.2f}$, mean $K_s={np.mean([min(1,x/(1-p)) for x in a[ka:kb+1]]):.3f}$)" for ka,kb in kept)
body=f"""The root-zone water is $a=\\sum f_i\\theta_i/\\sum f_i$, the FAO-56 stress coefficient is $K_s=\\min(1,a/(1-p))$ and a day is a stress day if $a<1-p$ ($p=0.55$ for maize and wheat). The root-zone values of 16 days are in Table~\\ref{{tab:ks}}. Find the stress days, join gaps of at most 2 days, and report the periods (kept if $n_j\\ge2$) with $a_{{\\min}}$ and mean $K_s$.

\\textbf{{Solution.}} The threshold is $1-p={thr:.2f}$. Stress days: those with $a<0.45$. The raw runs are {', '.join(f'[{r[0]+1},{r[1]+1}]' for r in runs)}. Gaps of at most 2 days are filled, which merges these into {', '.join(f'[{r[0]+1},{r[1]+1}]' for r in merged)}. Periods kept: {txt}."""
body+=tab(["Day","$a$","$K_s$","Stress"],rows,"Root-zone water and the stress coefficient.","tab:ks")
w(ex("periods of drought stress (P.26, P.27)",body))
body=r"""The risk class is set by $R=Y_{\rm rainfed}/Y_{\rm irrigated}$: low if $R\ge0.90$, moderate if $0.75\le R<0.90$, high if $0.50\le R<0.75$, severe below 0.50. For a dry future the rainfed grain is $3.1$ Mg ha$^{-1}$ and the irrigated $6.4$; typical $5.6/6.4$; wet $6.2/6.4$. Classify them, and compute the root measures of one period (P.28): root growth $\Delta L_k=(0.8,0.7,0.5,0.4)$ cm d$^{-1}\times$ plant against the bench plant $(1.0,1.0,1.0,0.9)$, deepest root $D=62$ cm against bench $70$ cm, and root lengths $L_i=(120,90,70,40,20)$ cm in layers with $\theta_i=(0.7,0.55,0.45,0.30,0.25)$.

\textbf{Solution.} $R=3.1/6.4=0.484$: severe; $5.6/6.4=0.875$: moderate; $6.2/6.4=0.969$: low. P.28: $G=100(0.8+0.7+0.5+0.4)/(1.0+1.0+1.0+0.9)=100(2.4)/(3.9)=61.5$ per cent (the roots grew about 62 per cent as much as the watered plant); $\Delta D=70-62=8$ cm shallower; layers with $\theta<0.5$ are layers 3, 4, 5: $F=100(70+40+20)/(120+90+70+40+20)=100(130)/340=38.2$ per cent of the root length lies in layers holding less than half of their plant-available water."""
w(ex("risk class and what the roots suffer (P.26, P.28)",body))
# ============ P2 volumetric
w(r"""\section{Volumetric phenotyping (P2): rebuilding the scan}
Layer P2 measures the plant of P1 as a three-dimensional scanner would: views from a turning camera, calibration spheres, registration, a voxel cloud and traits.
""")
# Kabsch 2D
sph=np.array([[0.35*math.cos(a),0.35*math.sin(a)] for a in np.radians([0,60,120,180,240,300])])
th=math.radians(60);Rm=np.array([[math.cos(th),-math.sin(th)],[math.sin(th),math.cos(th)]])
t=np.array([0.020,-0.010])
obs=sph@Rm.T+t+rng.normal(0,0.001,sph.shape)
# use spheres 0,1,2,3 seen by both
idx=[0,1,2,3]
A=obs[idx];B=sph[idx]
ca=A.mean(0);cb=B.mean(0)
H=(A-ca).T@(B-cb);U,Sg,Vt=np.linalg.svd(H);d=np.sign(np.linalg.det(Vt.T@U.T))
Rh=Vt.T@np.diag([1,d])@U.T;th_h=math.degrees(math.atan2(Rh[1,0],Rh[0,0]));th_true=-60
th_h=th_h  # rotation to bring A back to B
that=cb-Rh@ca
res=(Rh@A.T).T+that-B
rmse=math.sqrt((res**2).sum(1).mean())
body=f"""A calibration ring of six spheres of centres at radius $0.35$ m and angles $0,60,\\dots,300$\\textdegree\\ is seen by view 2 turned by $60$\\textdegree\\ and shifted by $(0.020,-0.010)$ m, with centre-fit noise of $1$ mm. Four spheres (those at $0,60,120,180$\\textdegree) are seen by both views. Estimate the rigid transform from view 2 back to view 1 (Procrustes/Kabsch) and its error.

\\textbf{{Solution.}} 1. Centroids: of the four observed centres $c_A=({ca[0]:.4f},{ca[1]:.4f})$ m, of the reference centres $c_B=({cb[0]:.4f},{cb[1]:.4f})$ m. 2. Cross-covariance $H=\\sum(A_i-c_A)(B_i-c_B)^T$; its singular value decomposition $H=U\\Sigma V^T$ gives the rotation $R=V\\,\\mathrm{{diag}}(1,\\det(VU^T))U^T$, with $\\det(VU^T)=+1$ here so that $R$ is a proper rotation. 3. The rotation angle is ${th_h:.2f}$\\textdegree\\ (truth: $-60$\\textdegree\\ to undo the turn), an error of ${abs(th_h-th_true):.3f}$\\textdegree. 4. Translation $t=c_B-Rc_A=({that[0]:.4f},{that[1]:.4f})$ m. 5. The residual after alignment has RMS ${rmse*1000:.2f}$ mm, about the centre-fit noise of 1 mm. At the crown radius of $0.4$ m the angle error moves a point by $0.4\\times{math.radians(abs(th_h-th_true)):.5f}={0.4*math.radians(abs(th_h-th_true))*1000:.2f}$ mm."""
w(ex("joining two views by the spheres",body))
rows=[]
dth=0.3;r=0.4
for k in range(1,7):
    rows.append([k,f"{k*dth:.2f}",f"{r*math.radians(k*dth)*1000:.2f}",f"{r*math.radians(dth)*math.sqrt(k)*1000:.2f}"])
body=r"""The transforms are chained to view 1: $R_0,\ R_0R_1,\ R_0R_1R_2,\dots$, so that the error of each link adds. If every link has a turn error of $\delta=0.3$\textdegree\ (a calibrated rig), compute the accumulated angle and the displacement at a point $0.4$ m from the axis for views $1$ to $6$; compare with the case of independent random errors that add in quadrature.

\textbf{Solution.} If the errors are all of the same sign the angle after $k$ links is $k\delta$ and the displacement is $r\,k\delta$ (in radians). For $k=6$: $1.8$\textdegree\ $=0.0314$ rad, displacement $0.4\times0.0314=12.6$ mm. If the link errors are independent with standard deviation $\delta$, the accumulated standard deviation is $\sqrt k\,\delta$, $0.73$\textdegree, so $5.1$ mm at $k=6$ (Table~\ref{tab:chain}). The last views drift most; the ICP refinement on the joined cloud is there to reduce this."""
body+=tab(["View $k$","Worst case (deg)","Worst case (mm)","Random (mm)"],rows,"Accumulated registration error at 0.4 m.","tab:chain")
w(ex("accumulated registration error",body))
# voxel traits
n=60000
u=rng.normal(size=(n,3));u/=np.linalg.norm(u,axis=1)[:,None]
a_,b_,c_=0.15,0.15,0.30
pts=u*np.array([a_,b_,c_])+np.array([0,0,c_])
vs=0.02
vox=np.unique(np.floor(pts/vs).astype(int),axis=0)
nvox=len(vox)
# truth surface area ellipsoid (prolate) approx Knud Thomsen
p_=1.6075;Sarea=4*math.pi*(((a_*b_)**p_+(a_*c_)**p_+(b_*c_)**p_)/3)**(1/p_)
LA=nvox*vs**2/1.5
V_true=4/3*math.pi*a_*b_*c_
# occupied cubes volume (filled interior): count voxels whose centre inside
g=np.arange(-0.2,0.2,vs);Z=np.arange(0,0.65,vs)
X,Y,Zg=np.meshgrid(g+vs/2,g+vs/2,Z+vs/2,indexing='ij')
inside=((X/a_)**2+(Y/b_)**2+((Zg-c_)/c_)**2)<=1
Vcube=inside.sum()*vs**3
ht=np.percentile(pts[:,2],99.8)
hull=ConvexHull(pts[:,:2]);
# crown width: longest span of hull vertices
hv=pts[hull.vertices,:2];cw=max(np.linalg.norm(p-q) for p in hv for q in hv)
body=f"""A plant is modelled as a prolate ellipsoid with semi-axes $a=b=0.15$ m and $c=0.30$ m, standing on the ground (centre at $z=0.30$ m). A scan of 60,000 points is placed in voxels of $v=0.02$ m. The application measures: height = 99.8th percentile of $z$; crown width = longest horizontal span of the convex hull; canopy volume = occupied cubes; leaf area = surface voxels $\\times v^2/1.5$. Compute them and compare with the truth.

\\textbf{{Solution.}} Height: the 99.8th percentile of the point heights is {ht:.3f} m (truth $0.600$ m; the percentile discards the top 0.2 per cent of points, so it is slightly below the apex). Crown width: the hull of the points projected on the ground has longest span {cw:.3f} m (truth $2a=0.300$ m). Volume: the true volume is $\\tfrac43\\pi abc={V_true*1e3:.2f}$ litres ({V_true:.5f} m$^3$); counting the cubes of $0.02$ m whose centres lie inside gives {inside.sum()} cubes, $V={Vcube*1e3:.2f}$ litres, an error of {100*(Vcube/V_true-1):+.1f} per cent. Leaf area: the cloud occupies {nvox} surface voxels, so $LA={nvox}\\times0.02^2/1.5={LA:.3f}$ m$^2$ against the true surface of the ellipsoid {Sarea:.3f} m$^2$ (Knud Thomsen approximation), a ratio of {LA/Sarea:.2f}. The factor 1.5 is the application's convention; the voxel count depends on the voxel size (a coarse voxel counts the thickness of the leaf), as the manual states. The leaf area index for a ground area of $0.25$ m$^2$ is $LAI=LA/A={LA/0.25:.2f}$."""
w(ex("height, crown, volume and leaf area from a voxel cloud",body))
# voxel size dependence
rows=[]
for v in [0.01,0.02,0.04,0.08]:
    vx=len(np.unique(np.floor(pts/v).astype(int),axis=0))
    rows.append([v,vx,f"{vx*v*v/1.5:.3f}",f"{vx*v*v/1.5/Sarea:.2f}"])
body=r"""Repeat the leaf-area measurement for voxel sizes 0.01, 0.02, 0.04 and 0.08 m with the same cloud.

\textbf{Solution.} The number of surface voxels falls roughly as $v^{-2}$ so that $N v^2$ would be constant for a thin surface; a coarser voxel also counts the thickness, so the estimate departs from the true area. Table~\ref{tab:vox} shows the area and its ratio to the true surface """+f"({Sarea:.3f} m$^2$)."
body+=tab(["Voxel (m)","Surface voxels","$LA$ (m$^2$)","$LA$/true"],rows,"Leaf area against voxel size.","tab:vox")
body+=r"""\textbf{Reading.} The estimate is not corrected for the voxel size in the application, and the error shown there is honest about it: a scanner's resolution is part of the measurement."""
w(ex("leaf area against the voxel size",body))
body=r"""The volumetric stress index is $\mathrm{VSI}=V_{\rm drought}/V_{\rm project}$. For a drought plant with canopy volume $18.4$ litres and a project plant with $26.9$ litres (assumed), and for scans every 10 days with volumes (drought, project) of $(2.1,2.3),(5.8,7.2),(11.9,15.8),(18.4,26.9)$ litres, compute the VSI each time and the transpiration per litre of canopy if the drought plant transpired 9.6 L and the project plant 14.2 L by the last date.

\textbf{Solution.} $\mathrm{VSI}=2.1/2.3=0.913$; $5.8/7.2=0.806$; $11.9/15.8=0.753$; $18.4/26.9=0.684$. The drought plant ends 32 per cent smaller. Transpiration per litre of canopy: drought $9.6/18.4=0.522$ L per litre; project $14.2/26.9=0.528$ L per litre; the two are within 1 per cent, so the drought plant is smaller in proportion to the water it used: it did not lose efficiency, it lost size."""
w(ex("volumetric stress index",body))
open('/tmp/book/p2i.tex','w').write("\n".join(O))
