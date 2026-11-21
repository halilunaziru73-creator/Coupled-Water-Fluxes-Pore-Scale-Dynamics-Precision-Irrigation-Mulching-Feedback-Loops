from h import *
k=4
lead(k,"close and audit a water balance; distinguish verification, calibration and validation; compute the bias, mean absolute error, root-mean-square error, coefficient of determination, Nash--Sutcliffe efficiency and index of agreement of a model against data; estimate the uncertainty of a mean and of a regression slope; and state what a one-dimensional model study does and does not claim.")
rng=np.random.default_rng(11)
b=''
b+=sec('Introduction: why a model needs an audit')
b+=P(r"A model is a set of equations that has been put in a computer. Whether its results can be trusted is not a matter of how many equations it has but of what has been checked. An \kw{audit} is a set of such checks. The simplest and the hardest is the closure of the mass balance: what enters the root zone must equal what leaves it plus the change of storage. A model whose balance does not close is losing or creating water, and any saving computed from it is partly an artefact. After closure, the model is compared with data, the comparison is summarised by a few statistics, the uncertainty of the summary is stated, and the limits of what was done are written down. This chapter gives the tools for each of these steps.")
b+=sec('Verification, calibration and validation')
b+=P(r"Three words are often mixed up. \kw{Verification} asks whether the equations have been solved correctly (is the code right? does it conserve mass? does it reproduce an analytic solution?). \kw{Calibration} adjusts uncertain parameters so that the model fits a set of observations. \kw{Validation} compares the calibrated model with observations \emph{not} used in the calibration. A model that has been verified and calibrated but not validated is a fitted curve; one that has been validated against data from a different site and season is a tested model. In this book the Daisy runs are verified by the balance audit (Chapter~\ref{chap:04}), the application's engines are verified against Daisy (Chapter~8), and no field validation is claimed.")
b+=sec('Goodness-of-fit statistics')
b+=P(r"Let $O_i$ be $n$ observations (or the reference results) with mean $\bar O$ and $P_i$ the corresponding model values. The commonly used measures are the \kw{bias} $\bar e=\frac1n\sum(P_i-O_i)$, the \kw{mean absolute error} $\mathrm{MAE}=\frac1n\sum|P_i-O_i|$, the \kw{root-mean-square error} $\mathrm{RMSE}=\sqrt{\frac1n\sum(P_i-O_i)^2}$, the \kw{coefficient of determination} $R^2$ of the regression of $P$ on $O$, the \kw{Nash--Sutcliffe efficiency}",
 eqn(r"\mathrm{NSE}=1-\frac{\sum_i(O_i-P_i)^2}{\sum_i(O_i-\bar O)^2},\label{eq:nse}"),
 r"which is 1 for a perfect model and 0 when the model is no better than the mean of the observations, and the \kw{index of agreement} $d=1-\sum(P_i-O_i)^2/\sum(|P_i-\bar O|+|O_i-\bar O|)^2$ of Willmott, bounded between 0 and 1. No single measure is enough: $R^2$ ignores bias, RMSE is in the units of the data but hides the pattern, and NSE punishes outliers.")
O=np.array([312,355,298,401,377,330,289,362.]);Pm=np.array([320,349,305,390,385,338,280,371.])
e=Pm-O;nse=1-((O-Pm)**2).sum()/((O-O.mean())**2).sum()
d=1-((Pm-O)**2).sum()/((abs(Pm-O.mean())+abs(O-O.mean()))**2).sum()
r2=np.corrcoef(O,Pm)[0,1]**2
b+=ex(r"A model predicts the annual evapotranspiration (mm) of eight years: observed 312, 355, 298, 401, 377, 330, 289, 362; predicted 320, 349, 305, 390, 385, 338, 280, 371. Compute the bias, MAE, RMSE, $R^2$, NSE and $d$.",
 r"Errors $P-O$: "+', '.join('%d'%x for x in e)+r". Bias $=%.2f$ mm; MAE $=%.2f$ mm; RMSE $=\sqrt{%.2f}=%.2f$ mm. Mean of $O$ is $%.2f$; $\sum(O-\bar O)^2=%.0f$ and $\sum(O-P)^2=%.0f$, so $\mathrm{NSE}=1-%.0f/%.0f=%.3f$. Correlation gives $R^2=%.3f$; $d=%.3f$ \ans The model is nearly unbiased (under 1 mm) and its error is about 2.5 per cent of the mean; NSE of 0.97 says that it explains almost all the variance of the eight years."%(e.mean(),abs(e).mean(),(e**2).mean(),math.sqrt((e**2).mean()),O.mean(),((O-O.mean())**2).sum(),((O-Pm)**2).sum(),((O-Pm)**2).sum(),((O-O.mean())**2).sum(),nse,r2,d),'Statistics of a model against data')
b+=sec('Closing the water balance')
b+=P(r"For a run of $y$ years the balance of Chapter~1 gives, for each year, the residual $R=P+I-ET-D-Q-\Delta S$ (with $ET=T+E_s+E_o$). A model that conserves mass has $R=0$ to numerical precision. Where $R\ne0$ the audit classifies the cause: a flux that is not reported, a storage that is not counted (snow, ponds, litter, the mulch layer) or a numerical error. The \emph{unattributed evaporative term} of the studies is such a residual that is systematically positive in the mulch experiments: it is evaporation from the mulch layer that the standard output does not count. The balance is the basis of the claim that a saving in one flux is a gain in another, so it is audited first.")
b+=sec('Uncertainty of a mean and of a slope')
b+=P(r"A mean of $n$ values with standard deviation $s$ has a standard error $s/\sqrt n$ and a 95 per cent confidence interval $\bar x\pm t_{0.975,n-1}s/\sqrt n$. A regression slope $b$ of $y$ on $x$ has standard error $s_b=s_e/\sqrt{\sum(x-\bar x)^2}$ with $s_e$ the residual standard deviation, and the interval $b\pm t\,s_b$. When the distribution is not normal or the statistic is awkward, the \kw{bootstrap} resamples the data with replacement many times and reads the interval from the percentiles of the statistic. An ensemble of simulations has no sampling noise in the usual sense (the same inputs give the same output), so the intervals describe the spread over soils and years, not experimental error; this is stated in every table that quotes them.")
x=np.array([1.,2,3,4,5,6,7,8]);y=np.array([2.1,3.9,6.2,7.8,10.1,12.2,13.8,16.1])
bb,aa=np.polyfit(x,y,1);res=y-(aa+bb*x);se=math.sqrt((res**2).sum()/(len(x)-2));sb=se/math.sqrt(((x-x.mean())**2).sum());t=2.447
b+=ex(r"The data $(x,y)$ are $(1,2.1),(2,3.9),(3,6.2),(4,7.8),(5,10.1),(6,12.2),(7,13.8),(8,16.1)$. Fit a line, find the standard error of the slope and its 95 \% interval ($t_{0.975,6}=2.447$).",
 r"$\bar x=4.5$, $\sum(x-\bar x)^2=42$. Slope $b=%.4f$, intercept $a=%.4f$. Residual standard deviation $s_e=\sqrt{\sum e^2/6}=%.4f$; $s_b=%.4f/\sqrt{42}=%.4f$. The interval is $%.4f\pm2.447\times%.4f=[%.3f,\,%.3f]$ \ans"%(bb,aa,se,se,sb,bb,sb,bb-t*sb,bb+t*sb),'Slope and its interval')
b+=sec('What a study of this kind can and cannot claim')
b+=P(r"The findings of the studies concern a one-dimensional, matrix-flow model with ten soils, a fixed base case of crop and weather, and a designed set of changes. They say what the model does, with the cause separated from the others by the design; they do not say what a field does. Three limits follow. Matrix flow excludes cracks and macropores. One dimension excludes lateral flow and the heterogeneity of a field. A fixed base case limits the extrapolation to other crops and climates. A claim about the \emph{mechanism} (a saving of evaporation is not a saving of water, because the water is conserved) holds for any soil water model that conserves mass; a claim about the \emph{size} of an effect holds only for the model.")
write(k,'bg',b)
# project: audit of ensemble balances
N=40
P_=rng.normal(600,90,N);I_=np.where(rng.random(N)<0.5,0,rng.normal(150,40,N)).clip(0)
T_=0.38*(P_+I_)+rng.normal(0,12,N);Es=0.26*(P_+I_)+rng.normal(0,10,N);Eo=0.05*(P_+I_)+rng.normal(0,3,N);D_=0.25*(P_+I_)+rng.normal(0,15,N);Q_=0.03*(P_+I_)+rng.normal(0,2,N)
dS=P_+I_-T_-Es-Eo-D_-Q_+rng.normal(0,1.5,N)
Rres=(P_+I_)-(T_+Es+Eo+D_+Q_)-dS
rows=[[i+1,'%.0f'%P_[i],'%.0f'%I_[i],'%.0f'%(T_[i]+Es[i]+Eo[i]),'%.0f'%D_[i],'%.1f'%Q_[i],'%.1f'%dS[i],'%.2f'%Rres[i]] for i in range(8)]
p='\\banner{Design project 4: an audit of the water balance of forty runs}\n'
p+=P(r"\textbf{Brief.} Forty annual runs of a water-balance model are to be audited before their savings are quoted. For each run the output gives $P$, $I$, $ET$, $D$, $Q$ and the change of storage $\Delta S$ (mm). The task is to compute the residual of every run, summarise it, test it against zero and decide whether the model can be used. Table~\ref{tab:audit} shows the first eight runs.",
 r"\textbf{Method.} Residual $R_j=P_j+I_j-ET_j-D_j-Q_j-\Delta S_j$; mean $\bar R$, standard deviation $s_R$, and the $t$ statistic $t=\bar R\sqrt N/s_R$ against the hypothesis $\bar R=0$; maximum $|R|$.")
p+=tabl(['Run','$P$','$I$','$ET$','$D$','$Q$','$\\Delta S$','$R$'],rows,'First eight of the forty runs of the audit, all in mm; the last column is the residual of the balance.')
tt=Rres.mean()*math.sqrt(N)/Rres.std(ddof=1)
p+=P(r"\textbf{Result.} Over the forty runs $\bar R=%.3f$ mm, $s_R=%.3f$ mm, $\max|R|=%.2f$ mm and $t=%.2f$; the 95 per cent interval of the mean is $[%.3f,\,%.3f]$ mm. The mean residual is %s from zero at the 5 per cent level (the critical $t$ for 39 degrees of freedom is 2.02); the largest single residual is %.1f per cent of the mean rainfall."%(Rres.mean(),Rres.std(ddof=1),abs(Rres).max(),tt,Rres.mean()-2.02*Rres.std(ddof=1)/math.sqrt(N),Rres.mean()+2.02*Rres.std(ddof=1)/math.sqrt(N),'not different' if abs(tt)<2.02 else 'different',100*abs(Rres).max()/P_.mean()),
 r"\textbf{Decision.} The residuals are small against the fluxes (a few tenths of a millimetre against hundreds) and have no trend with irrigation; the model conserves water to the precision of its output, and the savings computed from it can be quoted as redistributions of a conserved quantity. Had the residual been systematically positive with the amount of mulch, the same audit would have located an uncounted evaporation, as the unattributed term of this book does.")
write(k,'proj',p)
Ob=np.array([410,455,390,500,470,430,380,460.]);Pb=np.array([402,470,385,487,479,421,395,449.])
eb=Pb-Ob
exl=[]
exl.append((r"Observed: 20, 25, 30, 35; predicted: 22, 24, 33, 34. Find the bias, MAE and RMSE.","%.2f; %.2f; %.2f"%((np.array([22,24,33,34])-np.array([20,25,30,35])).mean(),abs(np.array([22,24,33,34])-np.array([20,25,30,35])).mean(),math.sqrt(((np.array([22,24,33,34])-np.array([20,25,30,35]))**2).mean()))))
exl.append((r"Compute the NSE of the same data.","%.3f"%(1-((np.array([22,24,33,34])-np.array([20,25,30,35]))**2).sum()/((np.array([20,25,30,35])-27.5)**2).sum())))
exl.append((r"A run has $P=640$, $I=120$, $ET=585$, $D=140$, $Q=8$, $\Delta S=22$ (mm). Find the residual and say whether the balance closes.","$R=%d$ mm; no, 5 mm is missing"%(640+120-585-140-8-22)))
exl.append((r"The mean residual of 25 runs is 0.8 mm with standard deviation 2.0 mm. Is it different from zero at the 5 \% level ($t_{0.975,24}=2.064$)?","t = 2.0; no"))
exl.append((r"Find the 95 \% interval of a mean of 16 values with mean 74 and standard deviation 8 ($t_{0.975,15}=2.131$).","$[%.2f,\\ %.2f]$"%(74-2.131*8/4,74+2.131*8/4)))
exl.append((r"Compute the bias, RMSE and NSE for observed (410, 455, 390, 500, 470, 430, 380, 460) and predicted (402, 470, 385, 487, 479, 421, 395, 449).","%.2f; %.2f; %.3f"%(eb.mean(),math.sqrt((eb**2).mean()),1-(eb**2).sum()/((Ob-Ob.mean())**2).sum())))
exl.append((r"If the NSE of a model is 0, what does it mean? If negative?","as good as the mean; worse than the mean"))
exl.append((r"A slope has $b=0.82$ and standard error 0.05 with 10 degrees of freedom ($t=2.228$). Give the 95 \% interval and say whether $b=1$ is inside it.","$[0.709,\\ 0.931]$; no"))
exl.append((r"A mulch experiment shows a positive residual of +30 mm in the mulched runs and 0 in the bare runs. Where could the water have gone?","uncounted evaporation from the mulch layer"))
exl.append((r"Why does a bootstrap interval need no assumption of normality?","it uses the empirical distribution of the data by resampling"))
write(k,'ex',exercises(exl))
write(k,'dyk',dyk([r"Distinguish verification, calibration and validation.",r"Why is closing the water balance the first test of a model?",r"What does an NSE of 0.97 mean, and what does it not tell you?",r"Why can $R^2$ be high when a model is badly biased?",r"What is a bootstrap interval, and when is it used?",r"Why are the intervals of an ensemble of simulations not experimental errors?",r"What is the unattributed evaporative term, and how was it found?",r"State three limits of a one-dimensional matrix-flow model study."]))
write(k,'obj',obj([
 (r"Calibration means",["checking the code","adjusting parameters to fit data","testing with new data","closing the balance"],1),
 (r"An NSE of 0 means that the model is",["perfect","as good as the mean of the data","useless always","unbiased"],1),
 (r"The 95 \% interval of a mean uses",[r"$s/n$",r"$t\,s/\sqrt n$","$s^2$","$\\bar x^2$"],1),
 (r"A balance that closes has a residual of",["one","zero","the rainfall","the storage"],1),
 (r"RMSE has the units of",["the data","the square of the data","none","percent"],0),
 (r"Validation uses",["the calibration data","independent data","no data","simulated data only"],1),
 (r"The bootstrap resamples",["without replacement","with replacement","never","only the mean"],1),
 (r"Matrix flow excludes",["gravity","cracks and macropores","evaporation","roots"],1),
 (r"The index of agreement $d$ lies between",["$-1$ and 1","0 and 1","0 and 100","$-\\infty$ and $\\infty$"],1),
 (r"A systematic positive residual in mulch runs indicates",["a numerical error only","an uncounted evaporation","a perfect model","excess rain"],1)]))
print('ok4')
