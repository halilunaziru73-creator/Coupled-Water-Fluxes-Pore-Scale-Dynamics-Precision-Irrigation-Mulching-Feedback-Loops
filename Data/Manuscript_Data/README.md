# The data of the four manuscripts

This folder holds [`SWAFL_Manuscripts_Data.xlsx`](SWAFL_Manuscripts_Data.xlsx), one Excel workbook with the data used in all four papers, and this map of how every table and figure is made. Both are written by [`make_workbook.py`](make_workbook.py).

| Sheet | Content |
|:--|:--|
| `Table_Figure_Map` | every table and figure of each paper: script, input, output (the tables below) |
| `Experiments` | one row per Daisy experiment (`Data/Comprehensive_Summary/00_SUMMARY_ALL_EXPERIMENTS.csv.gz`) |
| `Ensemble_runs` | the run table of Papers 1 to 3 (`Data/daisy_ensemble.csv.gz`, 10 190 runs) |
| `All_runs_summary` | one row per run with the settings read from each set-up file (`00_summary_all_simulations.csv.gz`; Paper 4 and the data table of all papers) |
| `R_*` | each result file of the analysis scripts (`Manuscripts/results`); JSON flattened to key and value |
| `D_*` | the derived tables of `Results/07_Derived_Data_Tables` |

The analysis scripts are in [`Manuscripts/reproducibility`](../../Manuscripts/reproducibility); `run_all.sh` there regenerates the results of Papers 1 to 3, and `analysis/p4_reach.py` and `analysis/data_overview.py` those of Paper 4 and of the data table and figure shared by all four papers. Screen captures of the software are not regenerated.

## Paper 1 - Soil hydraulic memory and water-balance closure

| Item | How it is made | Script(s) | Input | Output |
|:--|:--|:--|:--|:--|
| Table 1 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Figure 1 | Figure drawn by the script from the input data | Manuscripts/reproducibility/make_a4.py; Manuscripts/reproducibility/analysis/p2_figs.py; Manuscripts/reproducibility/analysis/p2_fig1_new.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig01_pipeline_A4.pdf |
| Table 2 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Table 3 | Table typed from the result file (27 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Figure 2 | Figure drawn by the script from the input data | Manuscripts/reproducibility/make_a4.py; Manuscripts/reproducibility/analysis/p1_figs_d.py; Manuscripts/reproducibility/analysis/p1_fig1_new.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig01_framework_A4.pdf |
| Figure 3 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_a.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig02_hydraulics.pdf |
| Table 4 | Table written by the script (tex/data_table.tex) | Manuscripts/reproducibility/analysis/data_overview.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz |  |
| Figure 4 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/data_overview.py | Data/daisy_ensemble.csv.gz (10 190 runs) | data/fig_data_overview.pdf |
| Table 5 | Table typed in the manuscript from the result files of the script | p2_robust.py; p2_robust.js | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Table 6 | Table typed from the result file (11 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/p3_js/e1_heldout.js; Manuscripts/reproducibility/analysis/p3_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12_pred.json |
| Figure 5 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_figfail.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/figS_failed.pdf |
| Table 7 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Figure 6 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_a.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig03_memory_grid.pdf |
| Figure 7 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_b.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig04_fates.pdf |
| Table 8 | Table typed from the result file (55 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py; p1_core.py; p1_core.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Figure 8 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_b.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig05_predictors.pdf |
| Figure 9 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_b.py; p1_rate_law.py; p1_rate_law.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig06_mechanism.pdf |
| Table 9 | Table typed from the result file (8 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py; p1_rate_law.py; p1_rate_law.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Figure 10 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_c.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig08_replication.pdf |
| Figure 11 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_d.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig10_robustness.pdf |
| Table 10 | Table typed from the result file (14 of its numbers found there) | p1_stats.py; p1_figs_d.py; p1_rank.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Results/07_Derived_Data_Tables/pareto_runs.csv |
| Figure 12 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_c.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig07_modifiers.pdf |
| Table 11 | Table typed from the result file (8 of its numbers found there) | Manuscripts/reproducibility/analysis/p1_figs_c.py; p1_modifiers.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p1_modifiers.json |
| Figure 13 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_e.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig11_e11_surface.pdf |
| Table 12 | Table typed from the result file (7 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Figure 14 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_figs.py; p2_a.py; p2_laws.py; p2_a.js; p2_laws.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig02_invariants.pdf |
| Table 13 | Table typed from the result file (34 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Figure 15 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_figs.py; p2_R.py; p2_R.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig03_hidden_term.pdf |
| Table 14 | Table typed from the result file (22 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/analysis/p1_core.py; p2_robust.py; p2_robust.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p1_core.json |
| Figure 16 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_fig4.py; Manuscripts/reproducibility/analysis/p2_figs.py; p2_a.py; p2_pca.js; p2_pca_sens.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig04_manifold.pdf |
| Table 15 | Table typed in the manuscript from the result files of the script | p2_a.py; p2_figs.py; p2_fig4.py; p2_pca.js; p2_pca_sens.js | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Figure 17 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_fig7.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig07_fates_by_soil.pdf |
| Figure 18 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_figs2.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig05_ET_law.pdf |
| Table 16 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Table 17 | Table typed from the result file (18 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/make_e12.py; Manuscripts/reproducibility/audit_numbers.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12.json |
| Table 18 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Table 19 | Table typed from the result file (12 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Table 20 | Table typed from the result file (3 of its numbers found there) | Manuscripts/reproducibility/analysis/p4_reach.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p4_tableA1_reach.csv |
| Table 21 | Table typed from the result file (23 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py; p2_et.py; p2_dpf.py; p2_figs2.py; p2_nested.py; p2_et.js; p2_dpf.js; p2_etlaw.js; p2_nested.js; p2_s02_excl.py; p2_s02_excl.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Table 22 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Figure 19 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p2_fig6.py; p2_laws2.py; p2_laws2.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p2/fig06_compensation.pdf |
| Table 23 | Table typed from the result file (19 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/analysis/p2_fig6.py; Manuscripts/reproducibility/analysis/p2_laws2.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p2_laws2.json |
| Table 24 | Table typed from the result file (24 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/make_e12.py; Manuscripts/reproducibility/audit_numbers.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12.json |
| Figure 20 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_fig14_ens.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig14_ensemble_structure.pdf |
| Figure 21 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_fig13_time.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig13_time_management.pdf |
| Figure 22 | Figure drawn by the script from the input data | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/analysis/p1_fig12_drivers.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig12_drivers.pdf |
| Table 25 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Table 26 | Table typed from the result file (8 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/p3_js/e1_heldout.js; Manuscripts/reproducibility/analysis/p3_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12_pred.json |
| Figure 23 | Figure drawn by the script from the input data | Manuscripts/reproducibility/fig_vg_check.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig15_vg_check.pdf |
| Figure 24 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/real_evap_pore.jpg; shots_jpg/real_evap_flux_cells.jpg; shots_jpg/real_tillage_micro.jpg |
| Figure 25 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p1_figs_c.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p1/fig09_recoverable.pdf |
| Table 27 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Table 28 | Table typed from the result file (34 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/analysis/p1_core.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p1_core.json |

## Paper 2 - Soil-water-atmosphere modelling for irrigation

| Item | How it is made | Script(s) | Input | Output |
|:--|:--|:--|:--|:--|
| Table 1 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Figure 1 | Figure drawn by the script from the input data | Manuscripts/reproducibility/make_a4.py; Manuscripts/reproducibility/analysis/p3_figs.py; Manuscripts/reproducibility/analysis/p3_fig01_workflow_v9.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig01_architecture_A4.pdf |
| Table 2 | Table typed from the result file (10 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/p3_js/e1_heldout.js; Manuscripts/reproducibility/analysis/p3_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12_pred.json |
| Table 3 | Table typed from the result file (5 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Table 4 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Table 5 | Table written by the script (tex/data_table.tex) | Manuscripts/reproducibility/analysis/data_overview.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz |  |
| Figure 2 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/data_overview.py | Data/daisy_ensemble.csv.gz (10 190 runs) | data/fig_data_overview.pdf |
| Table 6 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Table 7 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Table 8 | Table typed from the result file (11 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/p3_js/e1_heldout.js; Manuscripts/reproducibility/analysis/p3_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12_pred.json |
| Table 9 | Table typed from the result file (39 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py; swa_vars.js; p3_swa_vars.js; p3_swa_fig.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Table 10 | Table typed from the result file (15 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/p3_js/e1_heldout.js; Manuscripts/reproducibility/analysis/p3_figs.py; swa_vars.js; p3_swa_vars.js; p3_swa_fig.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12_pred.json |
| Table 11 | Table typed from the result file (36 of its numbers found there) | Manuscripts/reproducibility/p3_js/swa_vars.js; Manuscripts/reproducibility/analysis/p3_swa_fig.py; p3_swa_vars.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p3_swa_vars.json |
| Figure 3 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_swa_fig.py; swa_vars.js; p3_swa_vars.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig04_swa_state.pdf |
| Figure 4 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p3/fig_views_A.jpg |
| Figure 5 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p3/fig_views_B.jpg |
| Figure 6 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p3/fig_views_C.jpg |
| Table 12 | Table typed from the result file (11 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/p3_js/e1_heldout.js; Manuscripts/reproducibility/analysis/p3_figs.py; Results/08_Scripts/novel.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12_pred.json |
| Figure 7 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_sens_fig.py; e1_sens.js; l_sens.js; p3_e1_sens.js; p3_l_sens.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig08_sensitivity.pdf |
| Table 13 | Table typed from the result file (22 of its numbers found there) | Manuscripts/reproducibility/audit_numbers.py; Manuscripts/reproducibility/analysis/p3_figs.py; lib/wsmodel.js; v_surface.js; p3_surface.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/p3_ws61.csv |
| Figure 8 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig03_ws_verification.pdf |
| Table 14 | Table typed from the result file (11 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/make_e12.py; Manuscripts/reproducibility/audit_numbers.py; v_border.js; p3_border.js; v_sprinkler.js; run_spr.js; p3_sprinkler.js; spr_out.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12.json |
| Table 15 | Table typed from the result file (15 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/make_e12.py; Manuscripts/reproducibility/audit_numbers.py; e1_heldout.js; e12.js; e12_pred.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12.json |
| Figure 9 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_figs.py; make_e12.py; e1_heldout.js; e12.js; e12_pred.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig05_engine1_heldout.pdf |
| Figure 10 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_figs.py; e2_closure.js; e2_grid.js; p3_e2_closure.js; p3_e2_grid.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig06_engine2.pdf |
| Figure 11 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_figs.py; Manuscripts/reproducibility/analysis/p3_lit_figs.py; v_drip.js; run_drip.js; p3_drip_swafl.js; drip_out.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig07_drip.pdf |
| Figure 12 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p3_lit_figs.py; run_fao.js; fao_out.js; v_sprinkler.js; run_spr.js; p3_sprinkler.js; spr_out.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p3/fig09_literature.pdf |
| Table 16 | Table typed from the result file (4 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py; v_drip.js; p3_drip_swafl.js; drip_out.js | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Figure 13 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/wb_plot_views.png |
| Figure 14 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/real_trigger_law.jpg; shots_jpg/real_mulch_bare.jpg; shots_jpg/real_root_structure.jpg; shots_jpg/real_drip_design.jpg |
| Figure 15 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_field.jpg; shots_jpg/layer_spac.jpg |
| Figure 16 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_v1.jpg; shots_jpg/layer_v2.jpg |
| Figure 17 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_n1.jpg |
| Figure 18 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_v3.jpg; shots_jpg/layer_v7.jpg |
| Figure 19 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_r1.jpg |
| Figure 20 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_e1.jpg; shots_jpg/layer_v4.jpg |
| Figure 21 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_v6.jpg; shots_jpg/layer_n2.jpg |
| Figure 22 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_n3.jpg; shots_jpg/layer_v5.jpg |
| Figure 23 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_sid.jpg; shots_jpg/sid_sec_long.jpg |
| Figure 24 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/sid_sec_sched.jpg; shots_jpg/sid_sec_table.jpg |
| Figure 25 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_drip.jpg; shots_jpg/drip_sec_layout.jpg |
| Figure 26 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/drip_sec_lateral.jpg; shots_jpg/drip_sec_result.jpg |
| Figure 27 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/drip_sec_table.jpg |
| Figure 28 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/layer_spr.jpg; shots_jpg/spr_sec_checks.jpg |
| Figure 29 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/spr_sec_intake.jpg; shots_jpg/dash_design.jpg |
| Figure 30 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/dash_results.jpg; shots_jpg/dash_charts.jpg |
| Figure 31 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/dash_messages.jpg |
| Figure 32 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/real_field_balance_charts.jpg; shots_jpg/real_crop_water.jpg |
| Figure 33 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/real_tillage_flux.jpg |

## Paper 3 - SWAFL Desktop suite, Daisy workbench and bridge

| Item | How it is made | Script(s) | Input | Output |
|:--|:--|:--|:--|:--|
| Figure 1 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_architecture.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p6/fig01_system.pdf |
| Table 1 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Figure 2 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/zaria_ndvi.jpg; shots_jpg/zaria_scenes.jpg; shots_jpg/real_sketch.jpg |
| Figure 3 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/zaria_terrain.jpg; shots_jpg/zaria_gndvi_water.jpg; shots_jpg/zaria_rusle.jpg; shots_jpg/zaria_available_water.jpg |
| Figure 4 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/zaria_vri_depth.jpg; shots_jpg/zaria_matric_potential.jpg |
| Figure 5 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p6/fig03_pheno_figures.jpg |
| Figure 6 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/real_season_film.jpg |
| Figure 7 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_architecture.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p4/fig01_workbench.pdf |
| Figure 8 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p4/fig02a_process_map.png |
| Figure 9 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p4/fig02b_soil_column.png |
| Figure 10 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/wb_step1_input.jpg; shots_jpg/wb_step2_library.jpg; shots_jpg/wb_step4_scenarios.jpg; shots_jpg/wb_step6_logplots.jpg; shots_jpg/wb_step9_layers.jpg; shots_jpg/wb_tool_setup_editor.jpg; shots_jpg/wb_tool_calibrate.jpg; shots_jpg/wb_tool_learn_files.jpg |
| Figure 11 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/zaria_main_feedback.jpg |
| Figure 12 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_schematics.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p5/fig01_bridge.pdf |
| Table 2 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Table 3 | Table written by the script (tex/data_table.tex) | Manuscripts/reproducibility/analysis/data_overview.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz |  |
| Figure 13 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/data_overview.py | Data/daisy_ensemble.csv.gz (10 190 runs) | data/fig_data_overview.pdf |
| Table 4 | Table typed from the result file (13 of its numbers found there) | Manuscripts/reproducibility/p3_js/run_drip.js; Manuscripts/reproducibility/analysis/p3_lit_figs.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/drip_out.json |
| Table 5 | Table typed in the manuscript from the result files of the script | p4_design_sizes.js; out_p4_design.js | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Figure 14 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_data.py; p4_design_fidelity.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p4/fig03_fidelity.pdf |
| Table 6 | Table typed from the result file (5 of its numbers found there) | Manuscripts/reproducibility/run_all.sh; Manuscripts/reproducibility/make_e12.py; Manuscripts/reproducibility/audit_numbers.py; p4_richards.js; p4_richards_ref.py | Data/daisy_ensemble.csv.gz (10 190 runs) | Manuscripts/results/e12.json |
| Figure 15 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_data.py; p4_richards.js; p4_richards_ref.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p4/fig04_richards.pdf |
| Figure 16 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_data.py; p5_bridge_checks.js | Data/daisy_ensemble.csv.gz (10 190 runs) | p4/fig05_denitrification.pdf |
| Table 7 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Table 8 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Table 9 | Descriptive table (definitions, design, parameters or tests); no computation | - |  |  |
| Figure 17 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_data.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p5/fig04_economics.pdf |
| Figure 18 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | p5/fig02_flowfigures.jpg |
| Figure 19 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/ui_layers_tree.jpg; shots_jpg/ui_field_panel1.jpg; shots_jpg/ui_field_panel2.jpg |
| Figure 20 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/wb_summary_effects.jpg; shots_jpg/wb_every_log_lai.jpg |
| Figure 21 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/wb_why_failed.jpg; shots_jpg/wb_all_outputs.jpg |
| Table 10 | Table typed in the manuscript from the result files of the script | (see the reproducibility appendix of the paper) | Data/daisy_ensemble.csv.gz (10 190 runs) |  |
| Figure 22 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_data.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p6/fig04_pheno.pdf |
| Figure 23 | Figure drawn by the script from the input data | Manuscripts/reproducibility/p456/p456_figs_data.py | Data/daisy_ensemble.csv.gz (10 190 runs) | p6/fig05_crops.pdf |

## Paper 4 - Reach of a suction trigger and fate of irrigation

| Item | How it is made | Script(s) | Input | Output |
|:--|:--|:--|:--|:--|
| Figure 1 | Schematic drawn by the script with numbers from the results | Manuscripts/reproducibility/analysis/p4_concept.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | paper4/fig1_concept.pdf; numbers Manuscripts/results/p4_numbers.json |
| Table 1 | Table written by the script (tex/data_table.tex) | Manuscripts/reproducibility/analysis/data_overview.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz |  |
| Figure 2 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/data_overview.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | data/fig_data_overview.pdf |
| Figure 3 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p4_reach.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | paper4/fig2_curves_reach.pdf; data Manuscripts/results/p4_tableA1_reach.csv |
| Table 2 | Table written by the script | Manuscripts/reproducibility/analysis/p4_reach.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | Manuscripts/results/p4_table2_laws.csv (sheet R_p4_table2_laws) |
| Figure 4 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p4_reach.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | paper4/fig3_trigger_reach.pdf; data Manuscripts/results/p4_fig3_trigger_runs.csv, p4_tableA1_reach.csv |
| Figure 5 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p4_reach.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | paper4/fig4_marginal_fate.pdf; data Manuscripts/results/p4_fig4a_fate_by_soil.csv, p4_fig4b_fate_by_method.csv |
| Figure 6 | Figure drawn by the script from the input data | Manuscripts/reproducibility/analysis/p4_reach.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | paper4/fig5_dose.pdf; data Manuscripts/results/p4_fig5_dose.csv |
| Figure 7 | Screen capture of SWAFL Desktop 1.1.0 (not regenerated) | - |  | shots_jpg/real_trigger_law.jpg; zaria_matric_potential.jpg; wb_step3_experiments.jpg |
| Table 3 | Descriptive table (claims and the evidence cited in the text); no computation | - |  |  |
| Table 4 | Table written by the script | Manuscripts/reproducibility/analysis/p4_reach.py | Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz | Manuscripts/results/p4_tableA1_reach.csv (sheet R_p4_tableA1_reach) |
| Table 5 | Descriptive table (this map in short); no computation | - |  |  |

