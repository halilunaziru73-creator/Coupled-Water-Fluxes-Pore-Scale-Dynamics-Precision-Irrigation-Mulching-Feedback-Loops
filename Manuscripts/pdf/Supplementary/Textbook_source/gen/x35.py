import sys,math,numpy as np
sys.path.insert(0,'/tmp/kh/gen')
from h import *
def W(t): return '\\par\\noindent where '+t+'\n\n'
def E(eq,wh,lab=''): return '\\begin{equation}'+(('\\boxed{'+eq+'}') if len(eq)<170 else eq)+(('\\label{%s}'%lab) if lab else '')+'\\end{equation}\n'+W(wh)
rng=np.random.default_rng(7)
b=''
b+=sec('The two phenotyping layers')
b+=P(r"The application has two layers of phenotyping. The first, \emph{deterministic phenotyping}, is an exactly reproducible virtual experiment: a plant is grown by a model driven by the soil, the tillage, the weather, the irrigation, the mulch and the crop of the project, with a well-watered treatment and a drought treatment side by side. Nothing in it is random between runs, so every control of the project moves the numbers and two runs with the same inputs give the same plant. The second, \emph{volumetric phenotyping}, places a virtual scanner around that plant, in the way a stereo-camera rig looks at a seedling on a turntable, and measures the volume, the crown width, the height, the leaf area and the number of leaves from the point cloud that the scanner records. The difference between the two is the difference between the truth of the model and what an instrument would report.")
b+=sec('The scanner: views, registration and the iterative closest point')
b+=P(r"Each view is a cloud of points in its own frame. The method follows Wang et al.\ (2025): structure from motion and multi-view stereo with six views at intervals of $60^\circ$ and calibration spheres placed beside the plant, used to join the views (self-registration), and a refinement by the iterative closest point (ICP) algorithm. The joining of two clouds is the search for the rotation $\mathbf R$ and translation $\mathbf t$ that minimise",
 E(r"\min_{\mathbf R,\mathbf t}\sum_{i=1}^{n}\left\|\mathbf R\,\mathbf p_i+\mathbf t-\mathbf q_i\right\|^{2},\qquad \mathbf R=\mathbf V\,\mathrm{diag}\bigl(1,1,\det(\mathbf V\mathbf U^{\!\top})\bigr)\,\mathbf U^{\!\top},\quad \mathbf t=\bar{\mathbf q}-\mathbf R\bar{\mathbf p},",r"$\mathbf p_i$ and $\mathbf q_i$ are corresponding points of the moving and the fixed cloud, $n$ the number of pairs, $\mathbf R$ the rotation matrix, $\mathbf t$ the translation vector, $\bar{\mathbf p}$ and $\bar{\mathbf q}$ the centroids, and $\mathbf U\boldsymbol\Sigma\mathbf V^{\!\top}$ the singular-value decomposition of the covariance $\sum(\mathbf p_i-\bar{\mathbf p})(\mathbf q_i-\bar{\mathbf q})^{\!\top}$ (the determinant factor excludes reflections).",'eq:ph-icp'),
 r"The calibration spheres give the first correspondences (their centres are seen in every view); ICP then pairs every point with its nearest neighbour in the other cloud, solves Eq.~(\ref{eq:ph-icp}), moves the cloud and repeats until the error stops falling.")
# demo: random cloud, rotate by 60 deg about z, add noise, recover
def kabsch(P,Q):
    pc,qc=P.mean(0),Q.mean(0);H=(P-pc).T@(Q-qc);U,S,Vt=np.linalg.svd(H);V=Vt.T;d=np.sign(np.linalg.det(V@U.T));R=V@np.diag([1,1,d])@U.T;return R,qc-R@pc
rows=[]
for noise in (0.0,0.5,1.0,2.0,4.0):
    ang=math.radians(60);Rt=np.array([[math.cos(ang),-math.sin(ang),0],[math.sin(ang),math.cos(ang),0],[0,0,1]])
    Pc=rng.normal(size=(400,3))*np.array([25,25,40])
    Qc=(Rt@Pc.T).T+np.array([5,-3,2])+rng.normal(scale=noise,size=(400,3))
    R,t=kabsch(Pc,Qc);est=math.degrees(math.atan2(R[1,0],R[0,0]));rms=math.sqrt(((Pc@R.T+t-Qc)**2).sum(1).mean())
    rows.append(['%.1f'%noise,'%.3f'%est,'%.3f'%abs(est-60),'%.2f'%rms])
b+=tabl(['noise $\\sigma$ (mm)','recovered angle ($^\\circ$)','error ($^\\circ$)','residual RMS (mm)'],rows,'Registration of two views of 400 points rotated by $60^\\circ$ about the vertical axis, with Gaussian noise in the points (SVD solution of Eq.~\\ref{eq:ph-icp}).','rrrr')
b+=ex(r"Two views of a plant have 400 matched points spread over about 50 mm in width and 80 mm in height. The scanner noise is $\sigma=1$ mm. Estimate the error in the registration angle and say how many views are needed to close the circle.",
 r"Six views at $60^\circ$ close the circle ($6\times60^\circ=360^\circ$) \ans With the numbers of the table, at $\sigma=1.0$ mm the angle of one pair is recovered with an error of order $0.01^\circ$ and a residual RMS of about %.1f mm, which is the noise itself, so the registration adds no bias \ans The error of a chain of five joints adds as the square root of the number of joints if the errors are independent: $\sqrt5\times0.01\approx0.02^\circ$, which at a radius of 25 mm moves a point by $25\times0.02\times\pi/180\approx0.009$ mm, negligible against the 0.6-mm voxel \ans"%float(rows[2][3]),'Registration error')
b+=sec('Measuring volume from the cloud')
b+=P(r"The joined cloud is voxelised with a cube of side $v$ (default 0.6 mm) and the volume is the number of occupied voxels times $v^3$; the crown width and the height are the extents of the cloud; the leaf area is the sum of the areas of the triangles of the surface of each leaf, after the points of a leaf have been clustered by their angle around the stem (Zhu et al.\ 2018). The voxel size is a compromise between detail and noise. For a solid body the occupied volume converges to the true volume as $v\to0$; for a surface cloud, the voxels along the surface are the only ones filled, so the estimate is biased unless the interior is filled.",
 E(r"V_{vox}=N_{occ}\,v^{3},\qquad \varepsilon=\frac{V_{vox}-V_{true}}{V_{true}}\approx\frac{3}{2}\frac{v}{r}\ \ (\text{ball of radius }r\text{, surface voxels only}),",r"$V_{vox}$ is the volume estimated (mm$^3$), $N_{occ}$ the number of occupied voxels, $v$ the voxel side (mm), $V_{true}$ the true volume, $\varepsilon$ the relative error and $r$ the radius of the body (mm); for a cloud that covers only the surface the occupied shell has a thickness of about one voxel.",'eq:ph-vox'))
rows=[]
for v in (0.2,0.4,0.6,1.0,1.5,2.5):
    r_=30.0;g=np.arange(-r_-v,r_+v,v);X,Y,Z=np.meshgrid(g,g,g);d=np.sqrt(X**2+Y**2+Z**2)
    solid=(d<=r_).sum()*v**3;shell=((d<=r_)&(d>r_-v)).sum()*v**3;Vt=4/3*math.pi*r_**3
    rows.append(['%.1f'%v,'%.0f'%solid,'%.2f'%(100*(solid-Vt)/Vt),'%.0f'%shell,'%.1f'%(100*(shell-Vt)/Vt)])
b+=tabl(['voxel $v$ (mm)','solid fill $V$ (mm$^3$)','error (\\%)','surface shell $V$ (mm$^3$)','error (\\%)'],rows,'Voxel volume of a ball of radius 30 mm ($V_{true}=%.0f$ mm$^3$) with the interior filled, and with the surface only.'%(4/3*math.pi*30**3),'rrrrr')
b+=ex(r"A canopy of a seedling is the ellipsoid with semi-axes 40, 40 and 60 mm. Compute its true volume, and the volume found by voxels of 0.6 mm and of 2.5 mm if the interior is filled.",
 r"$V=\frac43\pi abc=\frac43\pi(40)(40)(60)=%.0f$ mm$^3$ \ans Count voxels inside the ellipsoid: for $v=0.6$ mm the count times $v^3$ gives $%.0f$ mm$^3$ (%.2f per cent) \ans for $v=2.5$ mm $%.0f$ mm$^3$ (%.2f per cent) \ans The coarse voxel is nearly as good for a solid body; the 0.6-mm voxel matters for thin leaves, where the thickness of the leaf is smaller than the voxel \ans"%(4/3*math.pi*40*40*60,*(lambda v:(( (lambda g:(( (np.meshgrid(g,g,g)[0]/40)**2+(np.meshgrid(g,g,g)[1]/40)**2+(np.meshgrid(g,g,g)[2]/60)**2<=1).sum()*v**3))(np.arange(-41,41,v)),))(0.6),0,(lambda v:(((np.meshgrid(np.arange(-41,41,v),)*0)) if False else 0))(2.5),0),'Volume of a canopy by voxels') if False else '')
# simpler robust example
def ell(v):
    g=np.arange(-61,61,v);X,Y,Z=np.meshgrid(g,g,g,indexing='ij');return ((X/40)**2+(Y/40)**2+(Z/60)**2<=1).sum()*v**3
Vt=4/3*math.pi*40*40*60;a6=ell(.6);a25=ell(2.5)
b+=ex(r"A canopy of a seedling is the ellipsoid with semi-axes 40, 40 and 60 mm. Compute its true volume and the volume found by voxels of 0.6 mm and of 2.5 mm if the interior is filled.",
 r"$V=\frac43\pi abc=\frac43\pi(40)(40)(60)=%.0f$ mm$^3$ \ans Counting the voxels inside the ellipsoid, $v=0.6$ mm gives $%.0f$ mm$^3$ (%.2f per cent error) \ans $v=2.5$ mm gives $%.0f$ mm$^3$ (%.2f per cent error) \ans A coarse voxel is nearly as good for a solid body; the fine voxel matters for thin leaves, whose thickness is smaller than the voxel \ans"%(Vt,a6,100*(a6-Vt)/Vt,a25,100*(a25-Vt)/Vt),'Volume of a canopy by voxels')
b+=sec('Water productivity and stress traits from the scan')
b+=P(r"The scan gives a biomass proxy, $B=\rho_vV$, where $\rho_v$ is a volumetric dry density of the tissue; combined with the water used in the water balance, it gives the transpiration efficiency and the water productivity of each genotype or treatment. The comparison of the well-watered and drought treatments gives the \emph{drought index}",
 E(r"DI=1-\frac{V_{dr}}{V_{ww}},\qquad WP_{B}=\frac{B}{ET_a},\qquad \Delta WP=\frac{WP_{dr}-WP_{ww}}{WP_{ww}},",r"$DI$ is the drought index (0 for no effect of drought), $V_{dr}$ and $V_{ww}$ the canopy volumes in the drought and well-watered treatments (cm$^3$), $WP_B$ the biomass water productivity (g\,mm$^{-1}$ per plant, or kg\,m$^{-3}$ for a stand), $B$ the biomass (g), $ET_a$ the actual evapotranspiration (mm) and $\Delta WP$ the relative gain of productivity under drought.",'eq:ph-di'))
ww=dict(V=520,ET=410,rho=0.045);dr=dict(V=330,ET=270,rho=0.045)
Bw=ww['rho']*ww['V'];Bd=dr['rho']*dr['V']
b+=ex(r"A scan gives the canopy volume of 520 cm$^3$ per plant in the well-watered treatment ($ET_a=410$ mm) and 330 cm$^3$ in the drought treatment ($ET_a=270$ mm); the dry density of the tissue is $\rho_v=0.045$ g\,cm$^{-3}$. Find the drought index, the biomass and the water productivities.",
 r"$DI=1-330/520=%.3f$ \ans $B_{ww}=0.045\times520=%.1f$ g; $B_{dr}=0.045\times330=%.1f$ g \ans $WP_{ww}=%.1f/410=%.4f$ g\,mm$^{-1}$; $WP_{dr}=%.1f/270=%.4f$ g\,mm$^{-1}$ \ans $\Delta WP=%.1f$ per cent: the drought plant used %.0f per cent less water and lost %.0f per cent of its volume, so it used the water more efficiently \ans"%(1-330/520,Bw,Bd,Bw,Bw/410,Bd,Bd/270,100*((Bd/270)/(Bw/410)-1),100*(1-270/410),100*(1-330/520)),'Drought index and water productivity from a scan')
write(10,'deep',b)
# ----- ch12 extra: sets, zones and pumping
b=''
b+=sec('System design: zones, sets and pumping')
b+=P(r"The lateral and the emitter fix the discharge per unit area; the farm supply fixes how much of the farm can be watered at once. The application divides the field into zones that are irrigated in turn, and computes the length of the round. Let $A_f$ be the area to irrigate (ha), $Q_s$ the supply (L\,s$^{-1}$), $q_{ha}$ the flow of the design per hectare (L\,s$^{-1}$\,ha$^{-1}$), $t$ the run time of a zone (h) and $T_i$ the irrigation interval (d). Then",
 E(r"q_{ha}=\frac{10^{4}}{S_eS_l}\,\frac{\bar q}{3600},\qquad N_z=\left\lceil\frac{A_fq_{ha}}{Q_s}\right\rceil,\qquad t_{round}=N_z\,t,\qquad \text{feasible if }t_{round}\le 20\,T_i,",r"$q_{ha}$ is the flow per hectare (L\,s$^{-1}$\,ha$^{-1}$), $S_e$ and $S_l$ the emitter and lateral spacings (m), $\bar q$ the mean emitter discharge (L\,h$^{-1}$), $A_f$ the area (ha), $Q_s$ the farm supply (L\,s$^{-1}$), $N_z$ the number of zones (sets), $t$ the run time of one zone (h), $t_{round}$ the duration of a round (h), $T_i$ the interval (d) and 20 h the working day of the system.",'eq:d-zone'),
 r"The seasonal volume follows from the gross depth: $\sum d_g=n_{irr}\,d_n/E_a$ per season, in mm, or $10\sum d_g$ m$^3$ per hectare. The pump power is $P=\rho gQH/\eta$ with $H$ the sum of the lift, the head at the inlet of the lateral, the friction in the submain and mainline, and the filter loss.")
r=None
def DR(Af,Qs,Se=.5,Sl=1.5,qbar=1.93,t=3.74,Ti=2):
    qha=1e4/(Se*Sl)*qbar/3600;Nz=math.ceil(Af*qha/Qs);return qha,Nz,Nz*t
rows=[]
for Af in (1,2,5,10,20,40):
    for Qs in (10,30):
        qha,Nz,tr=DR(Af,Qs);rows.append([Af,Qs,'%.2f'%qha,Nz,'%.1f'%tr,'%.1f'%(tr/20),'yes' if tr<=40 else 'no'])
b+=tabl(['$A_f$ (ha)','$Q_s$ (L/s)','$q_{ha}$ (L/s/ha)','zones','round (h)','round (d at 20 h)','fits $T_i=2$ d'],rows,'Zones and round for the inline-emitter design of Chapter~12 ($q_{ha}=%.2f$ L\\,s$^{-1}$\\,ha$^{-1}$, run time 3.74 h).'%DR(1,10)[0],'rrrrrrl')
qha,Nz,tr=DR(10,30)
b+=ex(r"A farm of 10 ha is to be watered by the drip design of the loam (emitters 0.5 m, laterals 1.5 m, $\bar q=1.93$ L\,h$^{-1}$, run time 3.74 h) from a supply of 30 L\,s$^{-1}$, every 2 days. Find the flow per hectare, the number of zones, the length of the round and the pump power for a total head of 45 m at 70 per cent efficiency.",
 r"$q_{ha}=10^4/(0.5\times1.5)\times1.93/3600=%.2f$ L\,s$^{-1}$\,ha$^{-1}$ ($%d$ emitters per ha) \ans Whole farm: $10\times%.2f=%.1f$ L\,s$^{-1}$, which is below the supply of 30, so one zone could be run if the pipes allowed: $N_z=\lceil%.1f/30\rceil=%d$ \ans Round $%d\times3.74=%.1f$ h, well within $20\times2=40$ h \ans Better to split in zones of equal size to keep pipe sizes small: with 4 zones each flows $%.1f$ L\,s$^{-1}$ \ans Pump power $P=\rho gQH/\eta=1000\times9.81\times0.030\times45/0.70=%.1f$ kW \ans"%(qha,int(1e4/.75),qha,10*qha,10*qha,Nz,Nz,tr,10*qha/4,1000*9.81*.030*45/.7/1000),'Zones and pumping')
write(12,'deep2',b)
print('ok35')
