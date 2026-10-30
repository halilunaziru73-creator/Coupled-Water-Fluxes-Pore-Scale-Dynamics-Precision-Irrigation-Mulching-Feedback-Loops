# Highlights

Three to five bullets per manuscript, at most 85 characters each (journal limit). They are kept here, separate from the manuscript PDFs.

## Paper 1: Soil Hydraulic Memory and the Recoverability of Evaporation Savings

* Hydraulic memory: a dimensionless diagnostic of how soil pores route saved water
* Memory fate spans 0.02 to 0.85 across ten soils and follows pore-size parameter n
* One-parameter rate-competition law predicts drainage of unseen soils (RMSE 0.058)
* The recoverable share of an evaporation saving is soil- and climate-specific
* Two soil properties give planners a discount for evaporation-saving claims

## Paper 2: Auditing Water-Balance Closure in a Soil-Plant Model with Interpretable Machine Learning

* A blind pipeline recovers the water-balance law against a permutation null
* Closure audit exposes an unreported evapotranspiration term of about 30% of ET
* Hand-checkable three-term ET law matches gradient boosting (LOEO R2 0.898)
* Positive control, null model and regime-wise validation define a discovery protocol
* Sparse laws come with a stated domain of validity, not as universal constants

## Paper 3: Modeling Soil–Water–Atmosphere Interactions for Irrigation Scheduling and Design

* Every output of an offline irrigation tool is tied to a numbered equation
* 134 equations carry provenance labels: 38 literature, 18 data-driven, 78 engineered
* Meta-model of 10,190 Daisy runs ranks held-out scenarios (Spearman 0.64-0.97)
* Surface, drip and sprinkler design reproduce FAO-45 and textbook examples within 3%
* One command re-runs every check; 10^5 scenario sweeps take about 2 s

## Paper 4: A Graphical Workbench for the Daisy Model

* A guided nine-step path takes a user from question to a Daisy run
* 17 prepared experiments, 53 factors and a process map of 14 processes
* Soil column solver tested against independent reference solutions
* Calibration by sequential, CMA-ES and Bayesian search
* Seven weather files and Daisy 7.1.14 are bundled for Windows

## Paper 5: Connecting Daisy to SWAFL

* Daisy output logs are parsed into decision tables and chemical budgets
* Eight of ten SWAFL soils map to Daisy soils; two are flagged unmapped
* Daisy layers show only live runs, never stored results as if new
* The denitrification function now reproduces 792 stored Daisy outputs
* Weather of the SWAFL project returns to Daisy through one path

## Paper 6: SWAFL Desktop 1.1.0, the Whole Suite

* One offline application from field sketch and Sentinel-2 to irrigation design
* All 22 layers open and run without a script error
* 48 crops, 110 combinations; 13 evergreen entries flagged for a low mid-season Kc
* Deterministic phenotyping is repeatable and closes soil water to 4e-5 mm
* Drought pulse cuts grain 14 to 42 % across seven genotypes
