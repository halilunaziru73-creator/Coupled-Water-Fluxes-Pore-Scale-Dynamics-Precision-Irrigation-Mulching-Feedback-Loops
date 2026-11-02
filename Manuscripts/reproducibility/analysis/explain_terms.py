# Terms of the equations developed by the author: (symbol, meaning, unit, where the value comes from, what happens when it rises)
TERMS = {
's4': [
 (r'Reach of a suction trigger, $\hc=\alpha^{-1}(m^2/\kappa)^{1/[2n+\ell(n-1)]}$', [
  (r'$\hc$', 'reach: the driest suction a crop can impose at the sensor; the output', 'cm', 'computed', '--'),
  (r'$\alpha$', 'inverse of the suction at which the soil starts to drain', 'cm$^{-1}$', 'retention curve of the soil (Table A1)', r'$\hc$ falls in proportion ($\hc\propto1/\alpha$)'),
  (r'$n$', 'pore-size uniformity: large in sands, small in clays', '--', 'retention curve of the soil', r'$\hc$ falls steeply (the exponent grows)'),
  (r'$m$', r'$1-1/n$, the second shape parameter', '--', 'from $n$', r'$\hc$ rises slightly'),
  (r'$\ell$', 'pore-connectivity (tortuosity) exponent of Mualem', '--', 'conventional value 0.5', r'$\hc$ falls (conductivity collapses faster)'),
  (r'$\kappa$', 'relative conductivity at which the crop stops drying the soil', '--', r'fitted once to all soils ($3.47\times10^{-10}$)', r'$\hc$ falls'),
  (r'$E=2n+\ell(n-1)$', r'slope of $\log K_r$ against $\log h$ at the dry end', '--', r'from $n$ and $\ell$', r'$\hc$ falls')]),
 (r'Reach-scaled trigger, $x=\htr/\hc$', [
  (r'$\htr$', 'trigger suction set on the controller', 'cm', 'user or table', 'the trigger moves toward the reach'),
  (r'$x$', 'trigger as a fraction of the reach; irrigation ends near $x=0.5$ to 1', '--', 'computed', 'less irrigation; none for $x>1$')]),
 (r'Marginal fate, $\eta_X=\sum(X-X_0)/\sum I$', [
  (r'$I$', 'irrigation of a run, 20-year mean', 'mm\\,yr$^{-1}$', 'run table', '--'),
  (r'$X$', 'a flux of the irrigated run: $T$, $E_s$, $E_o$ or $D$', 'mm\\,yr$^{-1}$', 'run table', r'$\eta_X$ rises'),
  (r'$X_0$', 'the same flux of the rainfed twin (same soil and weather)', 'mm\\,yr$^{-1}$', 'experiment E0', r'$\eta_X$ falls'),
  (r'$\eta_X$', 'share of each irrigation millimetre that becomes $X$', '--', 'computed', '--')]),
 (r'Dose law, $\eta_D=\eta_\infty(1-e^{-d/d_D})$', [
  (r'$d$', 'irrigation depth per event', 'mm', 'design of the schedule', r'$\eta_D$ rises toward $\eta_\infty$'),
  (r'$\eta_\infty$', 'share of a large dose that drains (plateau)', '--', 'fitted per soil (0.10 to 0.45)', r'$\eta_D$ rises at every dose'),
  (r'$d_D$', 'dose scale: 63\\,\\% of the plateau is reached at $d=d_D$', 'mm', 'fitted per soil (about 4)', r'$\eta_D$ falls at small doses')]),
 (r'Sensor lag, $\Pi_\tau=\tau/t_i$ and $\delta h\simeq r\tau/C(h)$', [
  (r'$\tau$', 'relaxation time of the water content toward the retention curve', 'h', 'measured (not in Daisy)', r'$\Pi_\tau$ and $\delta h$ rise'),
  (r'$t_i$', 'interval between irrigations', 'h or d', 'schedule', r'$\Pi_\tau$ falls'),
  (r'$r$', 'drying rate of the equilibrium water content', 'h$^{-1}$', 'crop demand', r'$\delta h$ rises'),
  (r'$C(h)$', r'water capacity $-\dd\theta/\dd h$', 'cm$^{-1}$', 'retention curve', r'$\delta h$ falls')])],
's1': [
 (r'Memory fate, $\phi_x$ (pooled within-rainfall slope of flux $x$ on $\bar R$)', [
  (r'$\bar R$', r'storage release $\ET+D-P_r-I$ of a run', 'mm\\,yr$^{-1}$', 'run table (E9)', '--'),
  (r'$P$', 'rainfall scale that defines a group of runs', '--', 'design of E9', '--'),
  (r'$x_c$', 'a flux ($T$, $E_s$, $D$, other) of run $c$', 'mm\\,yr$^{-1}$', 'run table', '--'),
  (r'$\phi_x$', 'share of a released millimetre that leaves by $x$', '--', 'computed; the four add to 1', '--')]),
 (r'Rate-competition law, $\phi_D=K_s/(K_s+q^\ast)$', [
  (r'$K_s$', 'saturated conductivity of the soil', 'cm\\,d$^{-1}$', 'literature (eight soils)', r'$\phi_D$ rises toward 1'),
  (r'$q^\ast$', 'effective withdrawal rate by roots and surface', 'cm\\,d$^{-1}$', 'fitted once (71.5)', r'$\phi_D$ falls')]),
 (r'Recoverable share, $\rho_R=1-\psi_D$', [
  (r'$\psi_D$', 'share of an evaporation saving that drains', '--', 'paired runs of E16 or E7', r'$\rho_R$ falls'),
  (r'$\rho_R$', 'share of the saving recovered as transpiration or less irrigation', '--', 'computed', '--')]),
 (r'Discovered balance, $\mathbf c=(c_{P_r},c_I,c_{\ET},c_D)$', [
  (r'$\mathbf F$', 'matrix of centred 20-year fluxes, one row per run', 'mm\\,yr$^{-1}$', 'run table', '--'),
  (r'$\mathbf c$', 'right singular vector with the smallest singular value', '--', 'singular-value decomposition', '--'),
  (r'$R$', r'unattributed evapotranspiration $\ET-T-E_s-E_c$', 'mm\\,yr$^{-1}$', 'run table', 'the departure of $\\mathbf c$ from $\\pm1$ grows')]),
 (r'Compact ET law, $\ln\ET=2.503+0.646\ln W-0.299n+0.029\ln(1+I)$', [
  (r'$W$', 'water input $P_r+I$', 'mm\\,yr$^{-1}$', 'run table', r'$\ET$ rises with elasticity 0.65'),
  (r'$n$', 'van~Genuchten shape parameter of the soil', '--', 'soil table', r'$\ET$ falls (more drainage)'),
  (r'$I$', 'irrigation', 'mm\\,yr$^{-1}$', 'run table', r'$\ET$ rises slightly beyond its part of $W$')])],
's2': [
 (r'Soil-specific trigger, $h^\ast=\alpha^{-1}([S_e(100)-f^\ast\{S_e(100)-S_e(15\,849)\}]^{-1/m}-1)^{1/n}$', [
  (r'$f^\ast$', 'chosen depletion of the plant-available water', '--', 'agronomy (0.45)', r'$h^\ast$ rises (drier trigger)'),
  (r'$S_e(100)$', 'effective saturation at field capacity', '--', 'retention curve', r'$h^\ast$ shifts'),
  (r'$S_e(15\,849)$', 'effective saturation at the wilting point', '--', 'retention curve', r'$h^\ast$ shifts'),
  (r'$\alpha$, $n$, $m$', 'van~Genuchten parameters', 'cm$^{-1}$, --, --', 'soil table', 'see the reach equations'),
  (r'$h^\ast$', r'suction at which the soil has used $f^\ast$ of its water', 'cm', 'computed', '--')]),
 (r'Interception store, $I_c=\mu_0\ln(1/r)$', [
  (r'$\mu_0$', 'mean daily rain on rain days', 'mm', 'weather', r'$I_c$ rises in proportion'),
  (r'$r$', 'throughfall fraction of the annual model', '--', 'Engine 1', r'$I_c$ falls')]),
 (r'Two-stage evaporation, $Q(t)=Q_1+2e_0\tau_E(\sqrt{1+(t-t_1)/\tau_E}-1)$', [
  (r'$e_0$', 'evaporative demand (stage-1 rate)', 'mm\\,d$^{-1}$', 'weather', '$Q$ rises'),
  (r'$Q_1$', 'cumulative evaporation at the end of stage 1', 'mm', 'soil texture', 'stage 1 lasts longer'),
  (r'$t_1$', 'end of stage 1', 'd', '$(Q_1-q_0)/e_0$', '--'),
  (r'$\tau_E$', 'transition time of stage 2', 'd', 'soil', 'stage 2 decays more slowly')])],
's3': [
 (r'Rule of origin, show$(v)\iff$ source$(v)\in$ Daisy runs', [
  (r'$v$', 'a value drawn in a Daisy layer', '--', 'bridge', '--'),
  (r'source$(v)$', 'log file and line the value was read from', '--', 'bridge', 'the value is drawn or not')]),
 (r'Run budget, $N=\min(\prod n_i,B)$', [
  (r'$n_i$', 'number of levels of factor $i$', '--', 'design', 'more combinations'),
  (r'$B$', 'budget of runs set by the user', 'runs', 'user', 'more runs, up to the factorial'),
  (r'$N$', 'runs made', 'runs', 'computed', '--')]),
 (r'Soil-hydraulic factors', [
  (r'$f_k$', 'multiplier of $K_s$ of every horizon', '--', 'experiment design', 'faster drainage'),
  (r'$f_a$', 'multiplier of $\\alpha$', '--', 'experiment design', 'earlier air entry'),
  (r'$f_n$', 'multiplier of $n-1$', '--', 'experiment design', 'more uniform pores'),
  (r'$f_t$, $\delta\ell$', 'multiplier of $\\theta_s$, shift of $\\ell$', '--', 'experiment design', 'more storage; faster conductivity decline')])]}
