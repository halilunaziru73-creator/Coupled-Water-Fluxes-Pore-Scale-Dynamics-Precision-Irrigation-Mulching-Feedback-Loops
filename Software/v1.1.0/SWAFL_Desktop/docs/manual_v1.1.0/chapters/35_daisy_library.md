# The Daisy library {#daisy-library}

This chapter lists the entries of the Daisy library that come with the program and that the Library tab reads: 63 horizons, 84 crops, 79 fertilisers, 35 chemicals, 82 actions, 55 programs and 176 log types. The values are those of the library files; nothing is estimated.

## Soil horizons

Each horizon has its texture, its organic matter and its hydraulic parameters. Hydraulics follow the van Genuchten and Mualem model: the water content is the residual content plus the range between saturated and residual content times the effective saturation, and the conductivity follows from the same parameters. The water content and the conductivity at six suctions are calculated from the parameters of the library with these equations, to show the shape of each horizon.

| Horizon | Parent | Clay % | Silt % | Sand % | Humus % | C/N | Bulk density |
|:--|:--|--:|--:|--:|--:|--:|--:|
| Ap_JB1 | USDA3 | 3.9 | 6.4 | 87 | 2.8 | 14.2 | 1.45 |
| Ap_JB2 | USDA3 | 4.4 | 13 | 80 | 2.7 | 12.8 | 1.42 |
| Ap_JB3 | USDA3 | 6.8 | 13.5 | 76.9 | 2.8 | 13.3 | 1.44 |
| Ap_JB4 | USDA3 | 7.9 | 21.5 | 68 | 2.7 | 11.6 | 1.41 |
| Ap_JB5 | USDA3 | 12.3 | 22 | 63.1 | 2.5 | 12.8 | 1.51 |
| Ap_JB6 | USDA3 | 12.4 | 24.9 | 60.1 | 2.5 | 11 | 1.53 |
| Ap_JB7 | USDA3 | 17.5 | 25.8 | 54.2 | 2.4 | 10.4 | 1.54 |
| B_JB1 | USDA3 | 3.8 | 3.5 | 91.8 | 0.9 | 12.2 | 1.5 |
| B_JB2 | USDA3 | 4.1 | 10.1 | 84.9 | 0.96 | 12.5 | 1.45 |
| B_JB3 | USDA3 | 6.8 | 11.3 | 80.9 | 1.04 | 11 | 1.55 |
| B_JB4 | USDA3 | 7.1 | 19.4 | 72.7 | 0.84 | 12.2 | 1.51 |
| B_JB5 | USDA3 | 11.9 | 16.2 | 71.4 | 0.51 | 9.9 | 1.62 |
| B_JB6 | USDA3 | 12.5 | 21.8 | 65.2 | 0.52 | 8.1 | 1.64 |
| B_JB7 | USDA3 | 20 | 22 | 57.5 | 0.41 | 7.5 | 1.68 |
| C_JB1 | USDA3 | 2.9 | 2 | 94.9 | 0.2 | n/a | 1.56 |
| C_JB2 | USDA3 | 3.4 | 5.9 | 90.5 | 0.2 | n/a | 1.55 |
| C_JB3 | USDA3 | 7.5 | 11.5 | 80.7 | 0.21 | n/a | 1.63 |
| C_JB4 | USDA3 | 8 | 18.6 | 73.1 | 0.3 | n/a | 1.65 |
| C_JB5 | USDA3 | 14.9 | 22.1 | 62.9 | 0.24 | n/a | 1.79 |
| C_JB6 | USDA3 | 13.3 | 23.8 | 62.6 | 0.22 | n/a | 1.72 |
| C_JB7 | USDA3 | 19.8 | 23.8 | 56.2 | 0.21 | n/a | 1.73 |
| mini | default | n/a | n/a | n/a | n/a | n/a | n/a |
| Ap | default | 7.9 | 21.5 | 68 | 2.7 | 11.6 | 1.41 |
| B | default | 7.1 | 19.4 | 72.7 | 0.84 | 12.2 | 1.51 |
| C | default | 8 | 18.6 | 73.1 | 0.3 | n/a | 1.65 |
| Orh(g)_Valecov_PG | default | 0.141 | 0.407 | 0.452 | 0.022 | 8.6 | 1.514 |
| E(g)_Valecov_PG | default | 0.186 | 0.373 | 0.441 | 0.005 | 8.6 | 1.586 |
| E(g)/Ig_Valecov_PG | default | 0.218 | 0.31 | 0.472 | 0.003 | 8.6 | 1.593 |
| Ig_Valecov_PG | default | 0.214 | 0.272 | 0.515 | 0.002 | 8.6 | 1.649 |
| Pg_Valecov_PG | default | 0.199 | 0.192 | 0.609 | 0.001 | 8.6 | 1.64 |
| Askov Ap | ISSS4 | 0.113 | 0.277 | n/a | 0.026 | 11 | 1.55 |
| Askov B | ISSS4 | 0.235 | 0.253 | n/a | 0.005 | 11 | 1.48 |
| Askov C | ISSS4 | 0.244 | 0.283 | n/a | 0.005 | 11 | 1.57 |
| Jyndevad Ap | ISSS4 | 0.038 | 0.072 | n/a | 0.023 | 13 | 1.472 |
| Jyndevad C | ISSS4 | 0.028 | 0.023 | n/a | 0.004 | 13 | 1.469 |
| Foulum AP | ISSS4 | 0.115 | 0.11 | n/a | 0.023 | 11.2 | 1.45 |
| Foulum B | ISSS4 | 0.149 | 0.101 | n/a | 0.005 | 11.3 | 1.45 |
| Foulum C | ISSS4 | 0.164 | 0.106 | n/a | 0.002 | 9.1 | 1.55 |
| Taastrup Ap | USDA3 | 0.107 | 0.222 | 0.671 | 0.024 | n/a | 1.45 |
| Taastrup plow pan | USDA3 | 0.148 | 0.214 | 0.638 | 0.016 | n/a | 1.78 |
| Taastrup Bt | USDA3 | 0.222 | 0.195 | 0.583 | 0.016 | n/a | 1.66 |
| Taastrup C | USDA3 | 0.207 | 0.235 | 0.558 | 0.01 | n/a | 1.69 |
| Taastrup drain canyon | ISSS4 | 0.213 | 0.19 | n/a | 0.014 | n/a | 1.65 |
| WP1 IT CER 2005 L50 | default | 0.19 | 0.502 | 0.308 | 0.0121 | 10.2 | 1.2 |
| WP1 IT CER 2005 L100 | default | 0.16 | 0.357 | 0.483 | 0.0079 | 10.4 | 1.35 |
| Ap_JB1_Cosby | ISSS4 | 3.9 | 6.4 | n/a | 2.7 | 14.2 | n/a |
| C_JB1_Cosby | ISSS4 | 2.9 | 2 | n/a | 0.2 | n/a | n/a |
| Ap_JB1_hypres | Ap_JB1_Cosby | n/a | n/a | n/a | n/a | n/a | 1.45 |
| C_JB1_hypres | Ap_JB1_Cosby | n/a | n/a | n/a | n/a | n/a | 1.56 |
| Jadorna 2004 | USDA3 | 0.03 | 0.3 | 0.67 | 0.028 | 11.65 | 1.5 |
| Jaddeep 2004 | USDA3 | 0.03 | 0.36 | 0.61 | 0.0047 | 8.87 | 1.48 |
| Jaddeeper 2004 | USDA3 | 0.06 | 0.17 | 0.77 | 0.003 | n/a | n/a |
| Jaddeepest 2004 | USDA3 | 0.06 | 0.06 | 0.88 | 0.001 | n/a | n/a |
| A | USDA3 | 18.9 | 42.7 | 38.4 | 4.4 | n/a | 1.6 |
| Aor Most7 | default | 0.2 | 0.65 | 0.15 | 0.0302 | 6 | 1.35 |
| B Most7 | default | 0.18 | 0.66 | 0.16 | 0.025 | 6 | 1.44 |
| C Most7 | default | 0.21 | 0.64 | 0.15 | 0.0121 | 8 | 1.35 |
| D Most7 | default | 0.21 | 0.65 | 0.14 | 0.0101 | 8 | 1.43 |
| S Most7 | default | 0.15 | 0.54 | 0.31 | 0.0081 | 8 | 1.43 |
| Ap_plowing | Ap | n/a | n/a | n/a | n/a | n/a | n/a |
| Jyn_15h | ISSS4 | 0.036 | 0.047 | n/a | 0.023 | 14.8 | 1.52 |
| KarJyn_B | ISSS4 | 0.044 | 0.013 | n/a | 0.011 | 16.9 | 1.51 |
| KarJyn_C | USDA3 | 0.043 | 0.008 | 0.946 | 0.003 | 13.3 | 1.58 |

### Horizon Ap_JB1

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.062 |
| n | 1.445 |
| K_sat | 5.037 |
| Theta_sat | 0.395 |
| Theta_res | 0 |
| l | -0.973 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.393 | 2.56 |
| 1 | 10 | 0.349 | 0.468 |
| 2 | 100 | 0.172 | 0.00503 |
| 2.5 | 316.228 | 0.105 | 0.000315 |
| 3 | 1000 | 0.063 | 1.88e-05 |
| 4.2 | 15848.9 | 0.018 | 2.12e-08 |

### Horizon Ap_JB2

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.054 |
| n | 1.382 |
| K_sat | 3.514 |
| Theta_sat | 0.412 |
| Theta_res | 0 |
| l | -0.922 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.410 | 1.6 |
| 1 | 10 | 0.373 | 0.31 |
| 2 | 100 | 0.211 | 0.00418 |
| 2.5 | 316.228 | 0.139 | 0.00028 |
| 3 | 1000 | 0.090 | 1.77e-05 |
| 4.2 | 15848.9 | 0.031 | 2.27e-08 |

### Horizon Ap_JB3

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.057 |
| n | 1.337 |
| K_sat | 3.135 |
| Theta_sat | 0.406 |
| Theta_res | 0 |
| l | -1.461 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.404 | 1.22 |
| 1 | 10 | 0.368 | 0.225 |
| 2 | 100 | 0.221 | 0.00411 |
| 2.5 | 316.228 | 0.152 | 0.000356 |
| 3 | 1000 | 0.104 | 2.93e-05 |
| 4.2 | 15848.9 | 0.041 | 7.09e-08 |

### Horizon Ap_JB4

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.048 |
| n | 1.304 |
| K_sat | 2.469 |
| Theta_sat | 0.42 |
| Theta_res | 0 |
| l | -1.492 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.418 | 0.908 |
| 1 | 10 | 0.389 | 0.185 |
| 2 | 100 | 0.253 | 0.0041 |
| 2.5 | 316.228 | 0.183 | 0.000373 |
| 3 | 1000 | 0.129 | 3.19e-05 |
| 4.2 | 15848.9 | 0.056 | 8.32e-08 |

### Horizon Ap_JB5

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.05 |
| n | 1.251 |
| K_sat | 1.7699 |
| Theta_sat | 0.391 |
| Theta_res | 0 |
| l | -2.386 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.389 | 0.504 |
| 1 | 10 | 0.364 | 0.0984 |
| 2 | 100 | 0.255 | 0.00304 |
| 2.5 | 316.228 | 0.194 | 0.000364 |
| 3 | 1000 | 0.146 | 4.14e-05 |
| 4.2 | 15848.9 | 0.073 | 2.17e-07 |

### Horizon Ap_JB6

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.044 |
| n | 1.246 |
| K_sat | 1.469 |
| Theta_sat | 0.386 |
| Theta_res | 0 |
| l | -2.365 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.384 | 0.429 |
| 1 | 10 | 0.363 | 0.0904 |
| 2 | 100 | 0.260 | 0.00303 |
| 2.5 | 316.228 | 0.201 | 0.000365 |
| 3 | 1000 | 0.152 | 4.13e-05 |
| 4.2 | 15848.9 | 0.077 | 2.12e-07 |

### Horizon Ap_JB7

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.048 |
| n | 1.204 |
| K_sat | 1.351 |
| Theta_sat | 0.386 |
| Theta_res | 0 |
| l | -3.197 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.384 | 0.295 |
| 1 | 10 | 0.364 | 0.0576 |
| 2 | 100 | 0.274 | 0.00226 |
| 2.5 | 316.228 | 0.220 | 0.000319 |
| 3 | 1000 | 0.175 | 4.31e-05 |
| 4.2 | 15848.9 | 0.100 | 3.39e-07 |

### Horizon B_JB1

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.082 |
| n | 1.58 |
| K_sat | 3.756 |
| Theta_sat | 0.377 |
| Theta_res | 0 |
| l | -0.335 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.374 | 2.22 |
| 1 | 10 | 0.308 | 0.296 |
| 2 | 100 | 0.110 | 0.000944 |
| 2.5 | 316.228 | 0.057 | 3.22e-05 |
| 3 | 1000 | 0.029 | 1.07e-06 |
| 4.2 | 15848.9 | 0.006 | 2.95e-10 |

### Horizon B_JB2

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.069 |
| n | 1.458 |
| K_sat | 2.662 |
| Theta_sat | 0.405 |
| Theta_res | 0 |
| l | -0.3 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.402 | 1.34 |
| 1 | 10 | 0.351 | 0.202 |
| 2 | 100 | 0.164 | 0.00114 |
| 2.5 | 316.228 | 0.098 | 4.94e-05 |
| 3 | 1000 | 0.058 | 2.04e-06 |
| 4.2 | 15848.9 | 0.016 | 9.45e-10 |

### Horizon B_JB3

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.071 |
| n | 1.388 |
| K_sat | 2.433 |
| Theta_sat | 0.409 |
| Theta_res | 0 |
| l | -0.937 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.406 | 1.02 |
| 1 | 10 | 0.357 | 0.153 |
| 2 | 100 | 0.188 | 0.00157 |
| 2.5 | 316.228 | 0.122 | 0.000103 |
| 3 | 1000 | 0.078 | 6.48e-06 |
| 4.2 | 15848.9 | 0.027 | 8.28e-09 |

### Horizon B_JB4

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.058 |
| n | 1.349 |
| K_sat | 1.737 |
| Theta_sat | 0.395 |
| Theta_res | 0 |
| l | -0.717 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.393 | 0.696 |
| 1 | 10 | 0.357 | 0.119 |
| 2 | 100 | 0.209 | 0.00143 |
| 2.5 | 316.228 | 0.142 | 9.2e-05 |
| 3 | 1000 | 0.096 | 5.58e-06 |
| 4.2 | 15848.9 | 0.037 | 6.48e-09 |

### Horizon B_JB5

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.066 |
| n | 1.274 |
| K_sat | 1.118 |
| Theta_sat | 0.362 |
| Theta_res | 0 |
| l | -1.504 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.360 | 0.315 |
| 1 | 10 | 0.328 | 0.048 |
| 2 | 100 | 0.212 | 0.00085 |
| 2.5 | 316.228 | 0.157 | 7.71e-05 |
| 3 | 1000 | 0.115 | 6.69e-06 |
| 4.2 | 15848.9 | 0.054 | 1.84e-08 |

### Horizon B_JB6

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.054 |
| n | 1.249 |
| K_sat | 0.9584 |
| Theta_sat | 0.36 |
| Theta_res | 0 |
| l | -1.574 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.358 | 0.26 |
| 1 | 10 | 0.334 | 0.0454 |
| 2 | 100 | 0.231 | 0.000986 |
| 2.5 | 316.228 | 0.177 | 9.43e-05 |
| 3 | 1000 | 0.133 | 8.5e-06 |
| 4.2 | 15848.9 | 0.067 | 2.54e-08 |

### Horizon B_JB7

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.053 |
| n | 1.169 |
| K_sat | 0.618 |
| Theta_sat | 0.352 |
| Theta_res | 0 |
| l | -2.809 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.350 | 0.0972 |
| 1 | 10 | 0.333 | 0.0165 |
| 2 | 100 | 0.260 | 0.000523 |
| 2.5 | 316.228 | 0.217 | 6.58e-05 |
| 3 | 1000 | 0.180 | 7.86e-06 |
| 4.2 | 15848.9 | 0.113 | 4.59e-08 |

### Horizon C_JB1

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.085 |
| n | 1.721 |
| K_sat | 4.046 |
| Theta_sat | 0.355 |
| Theta_res | 0 |
| l | 1.18 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.353 | 2.78 |
| 1 | 10 | 0.280 | 0.271 |
| 2 | 100 | 0.075 | 6.93e-05 |
| 2.5 | 316.228 | 0.033 | 5.16e-07 |
| 3 | 1000 | 0.014 | 3.7e-09 |
| 4.2 | 15848.9 | 0.002 | 2.61e-14 |

### Horizon C_JB2

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.08 |
| n | 1.557 |
| K_sat | 2.288 |
| Theta_sat | 0.37 |
| Theta_res | 0 |
| l | 1.188 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.367 | 1.3 |
| 1 | 10 | 0.306 | 0.133 |
| 2 | 100 | 0.115 | 0.000106 |
| 2.5 | 316.228 | 0.061 | 1.46e-06 |
| 3 | 1000 | 0.032 | 1.91e-08 |
| 4.2 | 15848.9 | 0.007 | 5.63e-13 |

### Horizon C_JB3

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.075 |
| n | 1.37 |
| K_sat | 1.213 |
| Theta_sat | 0.354 |
| Theta_res | 0 |
| l | 0.24 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.351 | 0.465 |
| 1 | 10 | 0.308 | 0.0556 |
| 2 | 100 | 0.165 | 0.000273 |
| 2.5 | 316.228 | 0.109 | 1.12e-05 |
| 3 | 1000 | 0.072 | 4.38e-07 |
| 4.2 | 15848.9 | 0.026 | 1.77e-10 |

### Horizon C_JB4

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.056 |
| n | 1.325 |
| K_sat | 1.0773 |
| Theta_sat | 0.354 |
| Theta_res | 0 |
| l | -0.191 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.352 | 0.402 |
| 1 | 10 | 0.322 | 0.0662 |
| 2 | 100 | 0.197 | 0.000668 |
| 2.5 | 316.228 | 0.138 | 3.72e-05 |
| 3 | 1000 | 0.096 | 1.93e-06 |
| 4.2 | 15848.9 | 0.039 | 1.52e-09 |

### Horizon C_JB5

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.043 |
| n | 1.187 |
| K_sat | 0.472 |
| Theta_sat | 0.317 |
| Theta_res | 0 |
| l | -1.605 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.316 | 0.0948 |
| 1 | 10 | 0.302 | 0.0179 |
| 2 | 100 | 0.235 | 0.00049 |
| 2.5 | 316.228 | 0.193 | 5.02e-05 |
| 3 | 1000 | 0.157 | 4.75e-06 |
| 4.2 | 15848.9 | 0.094 | 1.56e-08 |

### Horizon C_JB6

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.046 |
| n | 1.223 |
| K_sat | 0.6246 |
| Theta_sat | 0.3382 |
| Theta_res | 0 |
| l | -0.983 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.337 | 0.156 |
| 1 | 10 | 0.319 | 0.0286 |
| 2 | 100 | 0.234 | 0.0006 |
| 2.5 | 316.228 | 0.185 | 5.15e-05 |
| 3 | 1000 | 0.144 | 4.08e-06 |
| 4.2 | 15848.9 | 0.078 | 8.76e-09 |

### Horizon C_JB7

Parent USDA3, defined in lib/dk-horizon.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.047 |
| n | 1.16 |
| K_sat | 0.4588 |
| Theta_sat | 0.3385 |
| Theta_res | 0 |
| l | -2.255 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.337 | 0.0701 |
| 1 | 10 | 0.323 | 0.0123 |
| 2 | 100 | 0.259 | 0.00037 |
| 2.5 | 316.228 | 0.219 | 4.26e-05 |
| 3 | 1000 | 0.183 | 4.58e-06 |
| 4.2 | 15848.9 | 0.117 | 2.06e-08 |

### Horizon mini

Parent default, defined in lib/mini.dai. Hydraulic model n/a.

| Parameter | Value |
|:--|:--|

### Horizon Ap

Parent default, defined in sample/DrainDrying.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.048 |
| n | 1.304 |
| Theta_sat | 0.42 |
| Theta_res | 0 |
| K_sat | 2.469 |
| l | -1.492 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.418 | 0.908 |
| 1 | 10 | 0.389 | 0.185 |
| 2 | 100 | 0.253 | 0.0041 |
| 2.5 | 316.228 | 0.183 | 0.000373 |
| 3 | 1000 | 0.129 | 3.19e-05 |
| 4.2 | 15848.9 | 0.056 | 8.32e-08 |

### Horizon B

Parent default, defined in sample/DrainDrying.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.058 |
| n | 1.349 |
| Theta_sat | 0.395 |
| Theta_res | 0 |
| K_sat | 1.737 |
| l | -0.717 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.393 | 0.696 |
| 1 | 10 | 0.357 | 0.119 |
| 2 | 100 | 0.209 | 0.00143 |
| 2.5 | 316.228 | 0.142 | 9.2e-05 |
| 3 | 1000 | 0.096 | 5.58e-06 |
| 4.2 | 15848.9 | 0.037 | 6.48e-09 |

### Horizon C

Parent default, defined in sample/DrainDrying.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| alpha | 0.056 |
| n | 1.325 |
| K_sat | 1.0773 |
| Theta_sat | 0.354 |
| Theta_res | 0 |
| l | -0.191 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.352 | 0.402 |
| 1 | 10 | 0.322 | 0.0662 |
| 2 | 100 | 0.197 | 0.000668 |
| 2.5 | 316.228 | 0.138 | 3.72e-05 |
| 3 | 1000 | 0.096 | 1.93e-06 |
| 4.2 | 15848.9 | 0.039 | 1.52e-09 |

### Horizon Orh(g)_Valecov_PG

Parent default, defined in sample/cz-soil.dai. Hydraulic model M_BaC_Bimodal.

| Parameter | Value |
|:--|:--|
| K_sat | 1 |
| K_b | 0.2 |
| Theta_sat | 0.449 |
| Theta_b | 0.395 |
| Theta_res | 0.004 |
| h_b | -10 |
| lambda | 0.112 |

### Horizon E(g)_Valecov_PG

Parent default, defined in sample/cz-soil.dai. Hydraulic model M_BaC_Bimodal.

| Parameter | Value |
|:--|:--|
| K_sat | 0.89 |
| K_b | 0.18 |
| Theta_sat | 0.423 |
| Theta_b | 0.386 |
| Theta_res | 0 |
| h_b | -10 |
| lambda | 0.117 |

### Horizon E(g)/Ig_Valecov_PG

Parent default, defined in sample/cz-soil.dai. Hydraulic model M_BaC_Bimodal.

| Parameter | Value |
|:--|:--|
| K_sat | 0.75 |
| K_b | 0.15 |
| Theta_sat | 0.417 |
| Theta_b | 0.385 |
| Theta_res | 0 |
| h_b | -10 |
| lambda | 0.107 |

### Horizon Ig_Valecov_PG

Parent default, defined in sample/cz-soil.dai. Hydraulic model M_BaC_Bimodal.

| Parameter | Value |
|:--|:--|
| K_sat | 0.58 |
| K_b | 0.12 |
| Theta_sat | 0.384 |
| Theta_b | 0.366 |
| Theta_res | 0 |
| h_b | -10 |
| lambda | 0.117 |

### Horizon Pg_Valecov_PG

Parent default, defined in sample/cz-soil.dai. Hydraulic model M_BaC_Bimodal.

| Parameter | Value |
|:--|:--|
| K_sat | 0.48 |
| K_b | 0.1 |
| Theta_sat | 0.383 |
| Theta_b | 0.364 |
| Theta_res | 0 |
| h_b | -10 |
| lambda | 0.17 |

### Horizon Askov Ap

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| Theta_sat | 0.392 |
| alpha | 0.0385 |
| n | 1.211 |
| K_sat | 7.52 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.391 | 1.87 |
| 1 | 10 | 0.374 | 0.357 |
| 2 | 100 | 0.286 | 0.00602 |
| 2.5 | 316.228 | 0.229 | 0.000388 |
| 3 | 1000 | 0.181 | 2.21e-05 |
| 4.2 | 15848.9 | 0.101 | 2.08e-08 |

### Horizon Askov B

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| Theta_sat | 0.445 |
| alpha | 0.2605 |
| n | 1.135 |
| K_sat | 14.5 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.435 | 0.492 |
| 1 | 10 | 0.378 | 0.0154 |
| 2 | 100 | 0.286 | 9.77e-05 |
| 2.5 | 316.228 | 0.245 | 6.77e-06 |
| 3 | 1000 | 0.210 | 4.61e-07 |
| 4.2 | 15848.9 | 0.145 | 7.25e-10 |

### Horizon Askov C

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| Theta_sat | 0.401 |
| alpha | 0.057 |
| n | 1.131 |
| K_sat | 5 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.399 | 0.498 |
| 1 | 10 | 0.382 | 0.0652 |
| 2 | 100 | 0.314 | 0.001 |
| 2.5 | 316.228 | 0.273 | 7.66e-05 |
| 3 | 1000 | 0.236 | 5.43e-06 |
| 4.2 | 15848.9 | 0.164 | 8.84e-09 |

### Horizon Jyndevad Ap

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model "B_BaC".

| Parameter | Value |
|:--|:--|
| Theta_res | 0.036 |
| Theta_sat | 0.435 |
| lambda | 0.446 |
| h_b | -8.4 |
| K_sat | 6.76e-05 |

### Horizon Jyndevad C

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model "B_BaC".

| Parameter | Value |
|:--|:--|
| Theta_res | 0.017 |
| Theta_sat | 0.443 |
| lambda | 0.687 |
| h_b | -8.7 |
| K_sat | 0.000178 |

### Horizon Foulum AP

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 2.995 |
| Theta_sat | 0.46 |
| Theta_res | 0 |
| alpha | 0.05334 |
| n | 1.287 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.458 | 0.974 |
| 1 | 10 | 0.424 | 0.153 |
| 2 | 100 | 0.278 | 0.00136 |
| 2.5 | 316.228 | 0.203 | 6.66e-05 |
| 3 | 1000 | 0.147 | 2.99e-06 |
| 4.2 | 15848.9 | 0.066 | 1.65e-09 |

### Horizon Foulum B

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 1.796 |
| Theta_sat | 0.386 |
| Theta_res | 0 |
| alpha | 0.0398 |
| n | 1.2585 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.385 | 0.576 |
| 1 | 10 | 0.365 | 0.113 |
| 2 | 100 | 0.261 | 0.00158 |
| 2.5 | 316.228 | 0.199 | 8.83e-05 |
| 3 | 1000 | 0.149 | 4.37e-06 |
| 4.2 | 15848.9 | 0.073 | 2.95e-09 |

### Horizon Foulum C

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 1.038 |
| Theta_sat | 0.345 |
| Theta_res | 0 |
| alpha | 0.0283 |
| n | 1.22 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.344 | 0.308 |
| 1 | 10 | 0.333 | 0.0736 |
| 2 | 100 | 0.262 | 0.00173 |
| 2.5 | 316.228 | 0.210 | 0.000116 |
| 3 | 1000 | 0.165 | 6.56e-06 |
| 4.2 | 15848.9 | 0.090 | 5.83e-09 |

### Horizon Taastrup Ap

Parent USDA3, defined in sample/dk-soil.dai. Hydraulic model n/a.

| Parameter | Value |
|:--|:--|

### Horizon Taastrup plow pan

Parent USDA3, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| Theta_sat | 0.339353 |
| alpha | 0.0465371 |
| n | 1.19395 |
| K_sat | * 0.5, 0.0925 |
| l | -2.92948 |

### Horizon Taastrup Bt

Parent USDA3, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| l | -4.0323 |
| n | 1.14768 |
| alpha | 0.0565146 |
| K_sat | * 0.5, 0.537042 |
| Theta_sat | 0.356969 |

### Horizon Taastrup C

Parent USDA3, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| Theta_sat | 0.348314 |
| alpha | 0.0476257 |
| n | 1.15336 |
| K_sat | 1.5 |
| l | -3.60322 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.347 | 0.214 |
| 1 | 10 | 0.332 | 0.0392 |
| 2 | 100 | 0.269 | 0.00155 |
| 2.5 | 316.228 | 0.228 | 0.000221 |
| 3 | 1000 | 0.192 | 3e-05 |
| 4.2 | 15848.9 | 0.126 | 2.37e-07 |

### Horizon Taastrup drain canyon

Parent ISSS4, defined in sample/dk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0 |
| Theta_sat | 0.36384 |
| alpha | 0.0351307 |
| n | 1.14609 |
| K_sat | 0.526775 |
| l | -3.62743 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.363 | 0.0803 |
| 1 | 10 | 0.352 | 0.0172 |
| 2 | 100 | 0.295 | 0.000809 |
| 2.5 | 316.228 | 0.254 | 0.000118 |
| 3 | 1000 | 0.216 | 1.6e-05 |
| 4.2 | 15848.9 | 0.144 | 1.24e-07 |

### Horizon WP1 IT CER 2005 L50

Parent default, defined in sample/it-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 1.96 |
| Theta_res | 0.01 |
| Theta_sat | 0.5 |
| alpha | 0.0623 |
| n | 1.306 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.497 | 0.646 |
| 1 | 10 | 0.453 | 0.0885 |
| 2 | 100 | 0.284 | 0.000607 |
| 2.5 | 316.228 | 0.206 | 2.76e-05 |
| 3 | 1000 | 0.148 | 1.17e-06 |
| 4.2 | 15848.9 | 0.069 | 5.65e-10 |

### Horizon WP1 IT CER 2005 L100

Parent default, defined in sample/it-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 1.239 |
| Theta_res | 0.01 |
| Theta_sat | 0.45 |
| alpha | 0.0636 |
| n | 1.327 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.447 | 0.439 |
| 1 | 10 | 0.405 | 0.0598 |
| 2 | 100 | 0.245 | 0.000366 |
| 2.5 | 316.228 | 0.174 | 1.56e-05 |
| 3 | 1000 | 0.123 | 6.21e-07 |
| 4.2 | 15848.9 | 0.056 | 2.59e-10 |

### Horizon Ap_JB1_Cosby

Parent ISSS4, defined in sample/pedo-soil.dai. Hydraulic model Cosby_et_al.

| Parameter | Value |
|:--|:--|

### Horizon C_JB1_Cosby

Parent ISSS4, defined in sample/pedo-soil.dai. Hydraulic model Cosby_et_al.

| Parameter | Value |
|:--|:--|

### Horizon Ap_JB1_hypres

Parent Ap_JB1_Cosby, defined in sample/pedo-soil.dai. Hydraulic model hypres.

| Parameter | Value |
|:--|:--|

### Horizon C_JB1_hypres

Parent Ap_JB1_Cosby, defined in sample/pedo-soil.dai. Hydraulic model hypres.

| Parameter | Value |
|:--|:--|

### Horizon Jadorna 2004

Parent USDA3, defined in sample/pl-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| l | 0.5 |
| n | 1.36188 |
| alpha | 0.0308718 |
| K_sat | 0.6 |
| Theta_sat | 0.397147 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.396 | 0.308 |
| 1 | 10 | 0.378 | 0.0835 |
| 2 | 100 | 0.251 | 0.00122 |
| 2.5 | 316.228 | 0.172 | 5.32e-05 |
| 3 | 1000 | 0.115 | 1.97e-06 |
| 4.2 | 15848.9 | 0.042 | 6.52e-10 |

### Horizon Jaddeep 2004

Parent USDA3, defined in sample/pl-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| l | 1.1338 |
| n | 1.43343 |
| alpha | 0.0319665 |
| K_sat | 0.19 |
| Theta_sat | 0.41415 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.413 | 0.114 |
| 1 | 10 | 0.392 | 0.0318 |
| 2 | 100 | 0.238 | 0.000263 |
| 2.5 | 316.228 | 0.150 | 6.92e-06 |
| 3 | 1000 | 0.092 | 1.52e-07 |
| 4.2 | 15848.9 | 0.028 | 1.43e-11 |

### Horizon Jaddeeper 2004

Parent USDA3, defined in sample/pl-soil.dai. Hydraulic model Cosby_et_al.

| Parameter | Value |
|:--|:--|

### Horizon Jaddeepest 2004

Parent USDA3, defined in sample/pl-soil.dai. Hydraulic model Cosby_et_al.

| Parameter | Value |
|:--|:--|

### Horizon A

Parent USDA3, defined in sample/safir-site.dai. Hydraulic model n/a.

| Parameter | Value |
|:--|:--|

### Horizon Aor Most7

Parent default, defined in sample/sk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0.08 |
| Theta_sat | 0.4237 |
| alpha | 0.04611 |
| n | 1.17693 |
| K_sat | 1 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.422 | 0.178 |
| 1 | 10 | 0.407 | 0.0286 |
| 2 | 100 | 0.336 | 0.000447 |
| 2.5 | 316.228 | 0.293 | 3.09e-05 |
| 3 | 1000 | 0.254 | 1.93e-06 |
| 4.2 | 15848.9 | 0.187 | 2.29e-09 |

### Horizon B Most7

Parent default, defined in sample/sk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0.0709 |
| Theta_sat | 0.3766 |
| alpha | 0.0157 |
| n | 1.1258 |
| K_sat | 1.02 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.376 | 0.169 |
| 1 | 10 | 0.373 | 0.0482 |
| 2 | 100 | 0.345 | 0.00254 |
| 2.5 | 316.228 | 0.317 | 0.000261 |
| 3 | 1000 | 0.286 | 2.06e-05 |
| 4.2 | 15848.9 | 0.224 | 3.62e-08 |

### Horizon C Most7

Parent default, defined in sample/sk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0.0324 |
| Theta_sat | 0.4089 |
| alpha | 0.0172 |
| n | 1.1514 |
| K_sat | 0.95 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.408 | 0.201 |
| 1 | 10 | 0.403 | 0.0572 |
| 2 | 100 | 0.360 | 0.00267 |
| 2.5 | 316.228 | 0.319 | 0.000249 |
| 3 | 1000 | 0.276 | 1.81e-05 |
| 4.2 | 15848.9 | 0.193 | 2.64e-08 |

### Horizon D Most7

Parent default, defined in sample/sk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0.0406 |
| Theta_sat | 0.4196 |
| alpha | 0.0359 |
| n | 1.1447 |
| K_sat | 0.75 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.419 | 0.11 |
| 1 | 10 | 0.407 | 0.0205 |
| 2 | 100 | 0.347 | 0.000455 |
| 2.5 | 316.228 | 0.305 | 3.59e-05 |
| 3 | 1000 | 0.266 | 2.5e-06 |
| 4.2 | 15848.9 | 0.192 | 3.73e-09 |

### Horizon S Most7

Parent default, defined in sample/sk-soil.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| Theta_res | 0.0158 |
| Theta_sat | 0.3569 |
| alpha | 0.0203 |
| n | 1.1579 |
| K_sat | 0.5 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.356 | 0.106 |
| 1 | 10 | 0.350 | 0.028 |
| 2 | 100 | 0.306 | 0.00109 |
| 2.5 | 316.228 | 0.266 | 9.48e-05 |
| 3 | 1000 | 0.227 | 6.63e-06 |
| 4.2 | 15848.9 | 0.153 | 9.18e-09 |

### Horizon Ap_plowing

Parent Ap, defined in sample/test-colloids.dai. Hydraulic model original.

| Parameter | Value |
|:--|:--|
| K_sat | 0.0001 |

### Horizon Jyn_15h

Parent ISSS4, defined in sample/test-prd.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 125 |
| Theta_sat | 0.438 |
| Theta_res | 0.061 |
| alpha | 0.056 |
| n | 1.76 |
| l | 0.5 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.437 | 98.5 |
| 1 | 10 | 0.391 | 22.3 |
| 2 | 100 | 0.161 | 0.0261 |
| 2.5 | 316.228 | 0.103 | 0.000313 |
| 3 | 1000 | 0.079 | 3.54e-06 |
| 4.2 | 15848.9 | 0.063 | 7.41e-11 |

### Horizon KarJyn_B

Parent ISSS4, defined in sample/test-prd.dai. Hydraulic model M_vG.

| Parameter | Value |
|:--|:--|
| K_sat | 110.8 |
| Theta_sat | 0.43 |
| Theta_res | 0.043 |
| alpha | 0.069 |
| n | 1.87 |
| l | 0.5 |

| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |
|--:|--:|--:|--:|
| 0 | 1 | 0.429 | 90.1 |
| 1 | 10 | 0.364 | 16.2 |
| 2 | 100 | 0.114 | 0.00721 |
| 2.5 | 316.228 | 0.069 | 6.14e-05 |
| 3 | 1000 | 0.053 | 5.04e-07 |
| 4.2 | 15848.9 | 0.044 | 4.93e-12 |

### Horizon KarJyn_C

Parent USDA3, defined in sample/test-prd.dai. Hydraulic model n/a.

| Parameter | Value |
|:--|:--|

\newpage

## Fertilisers

| Fertiliser | Parent | Dry matter | Total N | Total C | NH4 share | Volatilisation |
|:--|:--|--:|--:|--:|--:|--:|
| kvaeg_gylle | slurry | 0.103 | 0.053 | 0.4 | 0.6 | 0.15 |
| kvaeg_staldgoedning | slurry | 0.196 | 0.027 | 0.4 | 0.251 | 0.15 |
| kvaeg_ajle | slurry | 0.033 | 0.162 | 0.4 | 0.9 | 0.15 |
| kvaeg_dybstroelse | slurry | 0.289 | 0.025 | 0.4 | 0.267 | 0.15 |
| slagtesvin_gylle | slurry | 0.054 | 0.09 | 0.4 | 0.75 | 0.15 |
| slagtesvin_staldgoedning | slurry | 0.23 | 0.039 | 0.4 | 0.349 | 0.15 |
| slagtesvin_ajle | slurry | 0.02 | 0.18 | 0.4 | 0.899 | 0.15 |
| slagtesvin_dybstroelse | slurry | 0.33 | 0.035 | 0.4 | 0.25 | 0.15 |
| soer_gylle | slurry | 0.05 | 0.101 | 0.4 | 0.75 | 0.15 |
| soer_staldgoedning | slurry | 0.23 | 0.037 | 0.4 | 0.35 | 0.15 |
| soer_ajle | slurry | 0.025 | 0.237 | 0.4 | 0.9 | 0.15 |
| soer_dybstroelse | slurry | 0.33 | 0.022 | 0.4 | 0.25 | 0.15 |
| slagtekyllinger_dybstroelse | slurry | 0.484 | 0.077 | 0.4 | 0.3 | 0.15 |
| hoens_gylle | slurry | 0.12 | 0.053 | 0.4 | 0.651 | 0.15 |
| hoens_staldgoedning | slurry | 0.4 | 0.053 | 0.4 | 0.35 | 0.15 |
| hoens_dybstroelse | slurry | 0.633 | 0.122 | 0.4 | 0.3 | 0.15 |
| kalkuner_dybstroelse | slurry | 0.48 | 0.126 | 0.4 | 0.3 | 0.15 |
| aender_gaes_dybstroelse | slurry | 0.35 | 0.079 | 0.4 | 0.3 | 0.15 |
| mink_raev_staldgoedning | slurry | 0.25 | 0.044 | 0.4 | 0.45 | 0.15 |
| mink_raev_gylle | slurry | 0.065 | 0.066 | 0.4 | 0.699 | 0.15 |
| hest_dybstroelse | slurry | 0.26 | 0.032 | 0.4 | 0.25 | 0.15 |
| faar_geder_dybstroelse | slurry | 0.346 | 0.034 | 0.4 | 0.25 | 0.15 |
| spildevandsslam | slurry | 0.141 | 0.304 | 0.4 | 0.292 | 0.15 |
| komposteret_husholdningsaffald | slurry | 0.5 | 0.019 | 0.4 | 0.107 | 0.15 |
| kartoffelfrugtsaft | slurry | 0.02 | 0.055 | 0.4 | 0.5 | 0.15 |
| novogro_slam | slurry | 0.035 | 0.031 | 0.4 | 0.1 | 0.15 |
| novogro-30_slam | slurry | 0.3 | 0.02 | 0.4 | 0.1 | 0.15 |
| pressesaft_groentpillefabrik | slurry | 0.012 | 0.031 | 0.4 | 0.1 | 0.15 |
| svinegylle_usepareret | slurry | 0.061 | 0.12 | 0.4 | 0.78 | 0.15 |
| svinegylle_separeret_tyk | slurry | 0.245 | 0.048 | 0.4 | 0.322 | 0.15 |
| svinegylle_separeret_tynd | slurry | 0.023 | 0.278 | 0.4 | 0.864 | 0.15 |
| kvaeggylle_usepareret | slurry | 0.059 | 0.056 | 0.4 | 0.628 | 0.15 |
| kvaeggylle_separeret_tyk | slurry | 0.185 | 0.03 | 0.4 | 0.291 | 0.15 |
| kvaeggylle_separeret_tynd | slurry | 0.03 | 0.097 | 0.4 | 0.672 | 0.15 |
| Ammonia | mineral | n/a | n/a | n/a | 1 | n/a |
| AmmoniumNitrate | mineral | n/a | n/a | n/a | 0.5 | n/a |
| Nitrate | mineral | n/a | n/a | n/a | 0 | n/a |
| N25S | mineral | n/a | n/a | n/a | 0.508 | n/a |
| NPK01 | mineral | n/a | n/a | n/a | 0.53 | n/a |
| NPK02 | mineral | n/a | n/a | n/a | 0.57 | n/a |
| NP | mineral | n/a | n/a | n/a | 0.65 | n/a |
| CalciumNitrate | mineral | n/a | n/a | n/a | 0.08 | n/a |
| slurry | organic | n/a | n/a | n/a | n/a | 0 |
| cattle_slurry | slurry | 0.059 | 0.1 | 0.375 | 0.7 | n/a |
| pig_slurry | slurry | 0.059 | 0.1 | 0.375 | 0.7 | n/a |
| manure | slurry | n/a | n/a | n/a | n/a | n/a |
| cattle_manure | manure | 0.059 | 0.1 | 0.375 | 0.7 | n/a |
| pig_manure | manure | 0.059 | 0.1 | 0.375 | 0.7 | n/a |
| horse_manure | manure | 0.297 | 0.014 | 0.375 | 0.25 | 0 |
| Foulum_slurry | slurry | 0.0341 | 0.0615 | 0.323 | 0.57 | n/a |
| pigcz01_slurry | pig_slurry | 0.0249 | 0.1242 | 0.41017 | 0.88106 | 0.017 |
| pigcz02_slurry | pig_slurry | 0.0565 | 0.0853 | 0.41017 | 0.615475 | 0.017 |
| pigcz03_slurry | pig_slurry | 0.0584 | 0.08621 | 0.418 | 0.554 | 0.017 |
| pigcz04_slurry | pig_slurry | 0.05335 | 0.0552 | 0.4025 | 0.35688 | 0.017 |
| pigcz05_slurry | pig_slurry | 0.0729 | 0.056775 | 0.41 | 0.51387 | 0.017 |
| pig_farmyard_manurecz01 | pig_manure | 0.2401 | 0.0355 | 0.316 | 0.33651 | 0.065 |
| pig_farmyard_manurecz02 | pig_manure | 0.211 | 0.0419 | 0.365787 | 0.26084 | 0.065 |
| pig_farmyard_manurecz03 | pig_manure | 0.3215 | 0.03471 | 0.316 | 0.15552 | 0.065 |
| pig_farmyard_manurecz04 | pig_manure | 0.2332 | 0.0542 | 0.3317 | 0.58191 | 0.065 |
| pig_farmyard_manurecz05 | pig_manure | 0.19625 | 0.057 | 0.35875 | 0.55 | 0.065 |
| cattle_manurecz | pig_manure | 0.24 | n/a | n/a | n/a | n/a |
| cattle_dungwatercz | pigcz03_slurry | 0.02 | n/a | n/a | n/a | n/a |
| calcium_nitratecz | mineral | n/a | n/a | n/a | 0 | n/a |
| amonium_sulphatecz | mineral | n/a | n/a | n/a | 1 | n/a |
| ureacz | mineral | n/a | n/a | n/a | 1 | n/a |
| DAM390cz | mineral | n/a | n/a | n/a | 0.75 | n/a |
| LAV27cz | mineral | n/a | n/a | n/a | 0.5 | n/a |
| LA33cz | mineral | n/a | n/a | n/a | 0.5 | n/a |
| NPK11-12-12cz | mineral | n/a | n/a | n/a | 0.5 | n/a |
| NP26-14cz | mineral | n/a | n/a | n/a | 0.5 | n/a |
| NP20-20cz | mineral | n/a | n/a | n/a | 0.5 | n/a |
| KAS | mineral | n/a | n/a | n/a | 0.5 | n/a |
| N15B | mineral | n/a | n/a | n/a | 0.06 | n/a |
| N46 | mineral | n/a | n/a | n/a | 1 | n/a |
| NP 12-23-0 | mineral | n/a | n/a | n/a | 0.57 | n/a |
| NPK 14-3-18 | mineral | n/a | n/a | n/a | 0.54 | n/a |
| NS 24-7 | mineral | n/a | n/a | n/a | 0.5 | n/a |
| cattleJad_manure04 | organic | 0.243 | 0.01895 | 0.235 | 0.077 | 0.15 |
| jynd2005_slurry | slurry | 0.025 | 0.196 | 0.4 | 0.77 | n/a |

\newpage

## Chemicals

### Chemical PFAS

Parent default, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| decompose_rate | 0 |
| canopy_dissipation_rate | 0 |
| canopy_washoff_coefficient | 1 |
| crop_uptake_reflection_factor | 1 |

### Chemical PFOS

Parent PFAS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| cite | Gauthier2024 |
| description | Aqueous diffusion coefficient from Table 1 |
| molar_mass | 550.13 |
| diffusion_coefficient | 5.27e-06 |
| adsorption | cite Brusseau2021x, description KOC and Kclay estimates from Jakobsen et al. (2025). KAWI calculated from equation in Figure 5 from Brusseau & Van Glubt (2021), K_AWI 0.0151, K_OC 604, K_clay 63 |

### Chemical PFOS_Guo

Parent PFOS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| adsorption | cite guo2020mathematical, description a and b from section 4 'Data and Parameters' in Guo et al. (2020). KOC and Kclay estimated from Jakobsen et al. (2025), a 0.0034, b 0.107, K_OC 604, K_clay 63 |

### Chemical PFOA

Parent PFAS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| cite | Gauthier2024 |
| description | Aqueous diffusion coefficient from Table 1 |
| molar_mass | 414.07 |
| diffusion_coefficient | 5.46e-06 |
| adsorption | cite Brusseau2021x, description KOC and Kclay estimates from Jakobsen et al., (2025). KAWI calculated from equation in Figure 5 from Brusseau & Van Glubt (2021), K_AWI 0.00337, K_OC 91, K_clay 4 |

### Chemical PFOA_Guo

Parent PFOA, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| adsorption | cite Constanza2019x, description a and b from Constanza et al. (2019) Table S1. KOC and Kclay estimated from Jakobsen et al. (2025), a 0.0116, b 0.033, K_OC 91, K_clay 4 |

### Chemical PFHxA

Parent PFAS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| cite | Gauthier2024 |
| description | Aqueous diffusion coefficient from Table 1 |
| molar_mass | 314.05 |
| diffusion_coefficient | 5.93e-06 |
| adsorption | cite Brusseau2021x, description KOC and Kclay estimates from Jakobsen et al., (2025). KAWI calculated from equation in Figure 5 from Brusseau & Van Glubt (2021), K_AWI 0.000196, K_OC 14, K_clay 5 |

### Chemical PFPeA

Parent PFAS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| cite | Gauthier2024 |
| description | Aqueous diffusion coefficient from Table 1 |
| molar_mass | 264.05 |
| diffusion_coefficient | 6.33e-06 |
| adsorption | cite Brusseau2021x, description KOC and Kclay estimates from Jakobsen et al., (2025). KAWI calculated from equation in Figure 5 from Brusseau & Van Glubt (2021), K_AWI 7.09e-05, K_OC 55, K_clay 8 |

### Chemical PFBS

Parent PFAS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| cite | Gauthier2024 |
| description | Aqueous diffusion coefficient from Table 1 |
| molar_mass | 338.19 |
| diffusion_coefficient | 6.79e-06 |
| adsorption | cite Brusseau2021x, description KOC and Kclay estimates from Jakobsen et al., (2025). KAWI calculated from equation in Figure 5 from Brusseau & Van Glubt (2021), K_AWI 0.000294, K_OC 9, K_clay 11 |

### Chemical PFBA

Parent PFAS, from lib/PFAS.dai.

| Parameter | Value |
|:--|:--|
| cite | Gauthier2024 |
| description | Aqueous diffusion coefficient from Table 1 |
| molar_mass | 214.04 |
| diffusion_coefficient | 6.73e-06 |
| adsorption | cite Brusseau2021x, description KOC and Kclay estimates from Jakobsen et al., (2025). KAWI calculated from equation in Figure 5 from Brusseau & Van Glubt (2021), K_AWI 2.36e-05, K_OC 3, K_clay 9 |

### Chemical solid

Parent default, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|
| crop_uptake_reflection_factor | 1 |
| canopy_dissipation | 0 |
| canopy_washoff_coefficient | 1 |
| diffusion_coefficient | 1 |
| adsorption | full |
| decompose | 0 |

### Chemical classic

Parent default, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|
| cite | focusgw2002 |
| decompose_depth_factor | (-105, 0); (-95, 0.3); (-65, 0.3); (-55, 0.5); (-35, 0.5); (-25, 1); (0, 1) |
| canopy_dissipation | 0.0083 |
| canopy_washoff_coefficient | 1 |
| crop_uptake_reflection_factor | 1 |
| diffusion_coefficient | 4.6e-06 |

### Chemical pesticide

Parent FOCUS, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|

### Chemical fungicide

Parent pesticide, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|

### Chemical herbicide

Parent pesticide, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|

### Chemical insecticide

Parent pesticide, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|

### Chemical metabolite

Parent FOCUS, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|

### Chemical Tracer

Parent default, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|
| canopy_dissipation | 0 |
| canopy_washoff_coefficient | 1 |
| crop_uptake_reflection_factor | 1 |
| decompose | 0 |
| diffusion_coefficient | 1.8e-05 |
| adsorption | none |

### Chemical colloid

Parent default, from lib/chemistry-base.dai.

| Parameter | Value |
|:--|:--|
| canopy_dissipation | 0 |
| canopy_washoff_coefficient | 1 |
| diffusion_coefficient | 1e-12 |
| decompose | 0 |

### Chemical Atrazine

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| crop_uptake_reflection_factor | 0.8 |
| decompose | 7e-05 |
| diffusion_coefficient | 8e-06 |
| adsorption | K_clay 7 |

### Chemical Bentazon

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 40 |
| adsorption | K_OC 34 |

### Chemical IPU

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 29 |
| adsorption | K_OC 100 |

### Chemical MCPP

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 7 |
| adsorption | K_OC 20 |

### Chemical Pendimethalin

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 0.0004 |
| adsorption | K_OC 16000 |

### Chemical Ioxynil

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 10 |
| adsorption | K_OC 350 |

### Chemical 2,4-D

Parent herbicide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 10 |
| adsorption | K_OC 20 |

### Chemical Heptachlor

Parent insecticide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 300 |
| adsorption | K_OC 24000 |

### Chemical DDT

Parent insecticide, from lib/chemistry.dai.

| Parameter | Value |
|:--|:--|
| decompose | 2000 |
| adsorption | K_OC 2000000 |

### Chemical common

Parent default, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|
| canopy_dissipation_rate | 0.0083 |
| canopy_washoff_coefficient | 1 |
| crop_uptake_reflection_factor | 1 |
| diffusion_coefficient | 4.6e-06 |

### Chemical pesticide

Parent common, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|

### Chemical herbicide

Parent pesticide, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|

### Chemical colloid

Parent common, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|
| diffusion_coefficient | 4.6e-06 |
| decompose_rate | 0 |

### Chemical Pendimethalin-base

Parent herbicide, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|
| decompose_rate | 0.0004 |

### Chemical Pendimethalin

Parent Pendimethalin-base, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|
| adsorption | none |

### Chemical Pendimethalin-immobile

Parent Pendimethalin-base, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|
| adsorption | full |

### Chemical Pendimethalin-colloid

Parent Pendimethalin-base, from sample/test-colloids.dai.

| Parameter | Value |
|:--|:--|
| adsorption | none |
| diffusion_coefficient | 4.6e-06 |

\newpage

## Crops

### Crop Beet; V1

Parent sold, defined in lib/beet-old.dai. Beet; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 385 |
| DSRate1 | 0.00087 |
| DSRate2 | 0.00087 |
| DS_Emr | 0.01 |
| DS_reset | false |
| TempEff1 | (0, 0); (100, 100) |
| TempEff2 | (0, 0); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 3 |
| TLim2 | 8 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 4.6 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 1.39 |
| alpha | 1 |
| beta | 1.3043 |
| SpLAI | 0.011 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.6 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 150 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.52, 0.2); (2, 0.2) |
| SOrg | (0, 0); (0.78, 0.6); (2, 0.6) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_SOrg | (0, 0.85); (2, 0.85) |
| E_Leaf | (0, 0.83); (2, 0.83) |
| r_Root | (0, 0.065); (2, 0.065) |
| r_SOrg | (0, 0.005); (2, 0.005) |
| r_Leaf | (0, 0.03); (2, 0.03) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.02 |
| PtLeafCnc | (0, 0.055); (0.026, 0.053); (0.052, 0.052); (0.078, 0.05); (0.104, 0.048); (0.13, 0.047); (0.157, 0.045); (0.183, 0.044); (0.209, 0.043); (0.235, 0.041); (0.261, 0.04) |
| PtRootCnc | (0, 0.02); (0.026, 0.019); (0.052, 0.019); (0.078, 0.018); (0.104, 0.018); (0.13, 0.017); (0.157, 0.017); (0.183, 0.016); (0.209, 0.016); (0.235, 0.015); (0.261, 0.015) |
| PtSOrgCnc | (0, 0.03); (0.026, 0.027); (0.052, 0.024); (0.078, 0.022); (0.104, 0.019); (0.13, 0.017); (0.157, 0.015); (0.183, 0.013); (0.209, 0.012); (0.235, 0.011); (0.261, 0.01) |
| CrLeafCnc | (0, 0.035); (0.026, 0.033); (0.052, 0.03); (0.078, 0.028); (0.104, 0.026); (0.13, 0.024); (0.157, 0.023); (0.183, 0.021); (0.209, 0.02); (0.235, 0.018); (0.261, 0.017) |
| CrRootCnc | (0, 0.012); (0.026, 0.012); (0.052, 0.011); (0.078, 0.011); (0.104, 0.01); (0.13, 0.01); (0.157, 0.009); (0.183, 0.009); (0.209, 0.009); (0.235, 0.008); (0.261, 0.008) |
| CrSOrgCnc | (0, 0.012); (0.026, 0.012); (0.052, 0.011); (0.078, 0.011); (0.104, 0.01); (0.13, 0.01); (0.157, 0.009); (0.183, 0.009); (0.209, 0.009); (0.235, 0.008); (0.261, 0.008) |
| NfLeafCnc | (0, 0.017); (0.026, 0.016); (0.052, 0.015); (0.078, 0.014); (0.104, 0.014); (0.13, 0.013); (0.157, 0.012); (0.183, 0.012); (0.209, 0.011); (0.235, 0.011); (0.261, 0.01) |
| NfRootCnc | (0, 0.01); (0.026, 0.009); (0.052, 0.009); (0.078, 0.008); (0.104, 0.008); (0.13, 0.007); (0.157, 0.007); (0.183, 0.006); (0.209, 0.006); (0.235, 0.005); (0.261, 0.005) |
| NfSOrgCnc | (0, 0.01); (0.026, 0.009); (0.052, 0.009); (0.078, 0.008); (0.104, 0.008); (0.13, 0.007); (0.157, 0.007); (0.183, 0.006); (0.209, 0.006); (0.235, 0.005); (0.261, 0.005) |

**Harvest**

| Parameter | Value |
|:--|:--|
| At | -0.0072 |
| Bt | 0.69 |
| beta | 0.075 |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| C_Leaf | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Beetroot

Parent default, defined in lib/beetroot.dai. Beetroot

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 1 |
| EmrTSum | 330 |
| DSRate1 | 0.0085 |
| TempEff1 | (0, 0.01); (5, 0.5); (20, 1); (25, 0.5) |
| PhotEff1 | (1, 0); (8, 1); (12, 1); (24, 1) |
| DSRate2 | 0.007 |
| TempEff2 | (0, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.055 |
| TempEff | (0, 0.01); (5, 0.01); (10, 0.75); (20, 1); (35, 1); (40, 0.9); (45, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.2 |
| SpLAIfac | (0, 1); (1, 1) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.025 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| LeafAIMod | (0, 1); (0.12, 1); (0.33, 0.74); (0.95, 0.47) |
| PARref | 0.06 |
| PARext | 0.68 |
| EPext | 0.5 |
| HvsWStem | (0, 1); (1, 2) |
| HvsDS | (0, 0); (0.5, 35); (2, 35) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.16 |
| PenPar2 | 6 |
| MaxPen | 180 |
| Rad | 0.05 |
| h_wp | -15000 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.3); (0.2, 0.2); (0.4, 0.2); (0.6, 0.2); (0.85, 0.15); (1.1, 0.1) |
| Leaf | (0, 0.6); (0.2, 0.4); (0.4, 0.35); (0.6, 0.3); (0.85, 0.125); (1.1, 0) |
| Stem | (0, 0); (1.1, 0) |
| RSR | (0, 0.5); (1, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.75 |
| r_SOrg | 0.005 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.2, 0); (0.4, 0.01); (0.6, 0.01); (0.85, 0.015); (1.1, 0.09); (2, 0.1) |
| RtDR | (0.2, 0); (0.6, 0); (0.95, 0); (1, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.007) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.005) |
| PtLeafCnc | (0, 0.035); (1, 0.03); (2, 0.03) |
| CrLeafCnc | (0, 0.02); (1, 0.015); (2, 0.01) |
| NfLeafCnc | (0, 0.0075); (1, 0.005); (2, 0.005) |
| PtStemCnc | (0, 0.035); (1, 0.03); (2, 0.03) |
| CrStemCnc | (0, 0.02); (1, 0.01); (2, 0.01) |
| NfStemCnc | (0, 0.0075); (1, 0.005); (2, 0.005) |
| PtSOrgCnc | (0, 0.025); (1, 0.02); (2, 0.02) |
| CrSOrgCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| NfSOrgCnc | (0, 0.005); (1, 0.005); (2, 0.005) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -15 |

### Crop Broccoli

Parent default, defined in lib/broccoli.dai. Broccoli

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 2 |
| EmrTSum | 175 |
| DSRate1 | 0.027 |
| TempEff1 | (0, 0); (7, 0); (16, 1); (18, 1); (30, 0) |
| PhotEff1 | (0, 0); (8, 1); (16, 1); (24, 0.8) |
| DSRate2 | 0.05 |
| TempEff2 | (0, 0); (7, 0); (16, 1); (18, 1); (30, 0) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.6 |
| Qeff | 0.045 |
| TempEff | (0, 0); (15, 1); (25, 1); (40, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |
| SpLAIfac | (0, 3); (0.2, 1.5); (0.4, 1.25); (0.6, 1); (2, 1) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.0165 |
| SpSOrgAI | 0.00165 |
| SpStemAI | 0 |
| LAIDist0 | 0, 0.1, 1 |
| LAIDist1 | 0.1, 0.2, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| PARrel | 0.05 |
| HvsDS | (0, 0); (1, 50); (2, 50) |
| HvsWStem | (0, 0.1); (100, 1) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 5 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.05 |
| h_wp | -15000 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.1, 0.4); (0.15, 0.1); (0.4, 0.1); (0.8, 0.1); (1, 0.1); (1.5, 0.1); (2, 0.1) |
| Leaf | (0, 0.85); (0.1, 0.7); (0.15, 0.8); (0.4, 0.75); (0.8, 0.65); (1, 0.45); (1.5, 0.2); (2, 0.05) |
| Stem | (0, 0.15); (0.1, 0.3); (0.15, 0.2); (0.4, 0.25); (0.8, 0.35); (1, 0.5); (1.5, 0.5); (2, 0.15) |
| RSR | (0, 1); (1, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_SOrg | 0.025 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 1 |
| LfDR | (0, 0); (0.5, 0); (0.6, 0); (1, 0); (1.5, 0.005); (2, 0.01) |
| RtDR | (0, 0); (0.3, 0); (0.6, 0); (1, 0.01); (1.5, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.025); (1, 0.0225); (2, 0.0225) |
| CrRootCnc | (0, 0.02); (1, 0.0175); (2, 0.0175) |
| NfRootCnc | (0, 0.0125); (1, 0.01); (2, 0.01) |
| PtLeafCnc | (0, 0.065); (1, 0.06); (2, 0.06) |
| CrLeafCnc | (0, 0.045); (1, 0.0425); (2, 0.0425) |
| NfLeafCnc | (0, 0.02); (1, 0.0175); (2, 0.0175) |
| PtStemCnc | (0, 0.045); (1, 0.0425); (2, 0.0425) |
| CrStemCnc | (0, 0.025); (1, 0.0225); (2, 0.0225) |
| NfStemCnc | (0, 0.0125); (1, 0.01); (2, 0.01) |
| PtSOrgCnc | (0, 0.06); (1, 0.0575); (2, 0.0575) |
| CrSOrgCnc | (0, 0.0525); (1, 0.05); (2, 0.05) |
| NfSOrgCnc | (0, 0.0225); (1, 0.02); (2, 0.02) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |

### Crop Broccoli - transplanted

Parent Broccoli, defined in lib/broccoli.dai. Broccoli - transplanted

**Devel**

| Parameter | Value |
|:--|:--|
| DS | 0.1 |

**Prod**

| Parameter | Value |
|:--|:--|
| CH2OPool | 0.05 |
| NCrop | 0.02 |
| WLeaf | 0.175 |
| WRoot | 0.25 |
| WStem | 0.075 |

**Root**

| Parameter | Value |
|:--|:--|
| Depth | 5 |

**Harvest**

| Parameter | Value |
|:--|:--|
| production_delay | 14 |

### Crop Brussels sprouts

Parent default, defined in lib/brusselssprouts.dai. Brussels sprouts

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 2 |
| EmrTSum | 250 |
| DSRate1 | 0.0044 |
| TempEff1 | (0, 0.01); (11, 1); (19, 1); (32, 0.01) |
| PhotEff1 | (0, 0); (8, 1); (16, 1); (24, 0.8) |
| DSRate2 | 0.007 |
| TempEff2 | (0, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.8 |
| Qeff | 0.045 |
| TempEff | (0, 0.01); (11, 1); (19, 1); (30, 0.7); (35, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |
| SpLAIfac | (0, 3); (0.15, 1.5); (0.3, 1.25); (0.45, 1); (1, 1) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.008 |
| SpSOrgAI | 0.0008 |
| SpStemAI | 0 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| PARrel | 0.05 |
| HvsDS | (0, 0); (0.7, 70); (2, 70) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 5 |
| PenPar1 | 0.15 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.05 |
| h_wp | -15000 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.1, 0.35); (0.15, 0.15); (0.25, 0.15); (0.35, 0.15); (0.4, 0.15); (0.5, 0.15); (0.75, 0.12); (1, 0.1) |
| Leaf | (0, 0.95); (0.1, 0.9); (0.25, 0.85); (0.3, 0.75); (0.35, 0.7); (0.4, 0.6); (0.5, 0.6); (0.75, 0.1); (1, 0.05) |
| Stem | (0, 0.05); (0.1, 0.1); (0.25, 0.15); (0.3, 0.25); (0.35, 0.3); (0.4, 0.4); (0.5, 0.4); (0.75, 0.1); (1, 0.05) |
| RSR | (0, 0.5); (1, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_SOrg | 0.02 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 1 |
| LfDR | (0, 0); (0.5, 0); (0.6, 0); (1, 0.007) |
| RtDR | (0, 0); (0.3, 0); (0.6, 0); (1, 0.005) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.0175); (2, 0.0175) |
| CrRootCnc | (0, 0.01); (1, 0.0075); (2, 0.0075) |
| NfRootCnc | (0, 0.0075); (1, 0.005); (2, 0.005) |
| PtLeafCnc | (0, 0.065); (1, 0.05); (2, 0.05) |
| CrLeafCnc | (0, 0.03); (1, 0.0275); (2, 0.0275) |
| NfLeafCnc | (0, 0.015); (1, 0.012); (2, 0.012) |
| PtStemCnc | (0, 0.065); (1, 0.05); (2, 0.05) |
| CrStemCnc | (0, 0.03); (1, 0.0275); (2, 0.0275) |
| NfStemCnc | (0, 0.015); (1, 0.012); (2, 0.012) |
| PtSOrgCnc | (0, 0.065); (1, 0.05); (2, 0.05) |
| CrSOrgCnc | (0, 0.03); (1, 0.0275); (2, 0.0275) |
| NfSOrgCnc | (0, 0.015); (1, 0.012); (2, 0.012) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |

### Crop Brussels sprouts - transplanted

Parent Brussels sprouts, defined in lib/brusselssprouts.dai. Brussels sprouts - transplanted

**Devel**

| Parameter | Value |
|:--|:--|
| DS | 0.1 |

**Prod**

| Parameter | Value |
|:--|:--|
| CH2OPool | 0.05 |
| NCrop | 0.02 |
| WLeaf | 0.225 |
| WRoot | 0.25 |
| WStem | 0.025 |

**Root**

| Parameter | Value |
|:--|:--|
| Depth | 5 |

**Harvest**

| Parameter | Value |
|:--|:--|
| production_delay | 14 |

### Crop Celeriac

Parent default, defined in lib/celeriac.dai. Celeriac

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 1 |
| EmrTSum | 350 |
| DSRate1 | 0.005 |
| TempEff1 | (0, 0.01); (5, 0.5); (15, 1); (22, 1); (28, 0.5) |
| PhotEff1 | (0, 0.4); (8, 1); (16, 1); (24, 0.8) |
| DSRate2 | 0.007 |
| TempEff2 | (0, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4.3 |
| Qeff | 0.045 |
| TempEff | (0, 0.01); (5, 0.01); (15, 1); (22, 1); (35, 0.8); (40, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |
| SpLAIfac | (0, 1); (1, 1) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LeafAIMod | (0, 1); (0.2, 1); (0.4, 0.44); (1, 0.44) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.68 |
| EPext | 0.5 |
| HvsWStem | (0, 0.1); (50, 1) |
| HvsDS | (0, 0); (0.5, 45); (2, 45) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 5 |
| PenPar1 | 0.038 |
| PenPar2 | 5 |
| MaxPen | 48 |
| Rad | 0.05 |
| h_wp | -15000 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.35, 0.25); (0.55, 0.1); (0.7, 0.06); (1.1, 0) |
| Leaf | (0, 0.75); (0.35, 0.55); (0.55, 0.35); (0.7, 0.25); (0.85, 0.15); (1.1, 0) |
| Stem | (0, 0.25); (0.35, 0.2); (0.55, 0.15); (0.7, 0.1); (0.85, 0.05); (1.1, 0) |
| RSR | (0, 0.5); (1, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_SOrg | 0.01 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.19, 0); (0.2, 0.025); (0.25, 0.005); (0.55, 0.005); (0.85, 0.011); (1.1, 0.01); (2, 0.1) |
| RtDR | (0.19, 0); (0.2, 0.01); (0.25, 0); (0.35, 0); (0.55, 0.005); (1.1, 0.005); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (0.5, 0.02); (1, 0.02); (2, 0.02) |
| CrRootCnc | (0, 0.01); (0.5, 0.01); (1, 0.01); (2, 0.01) |
| NfRootCnc | (0, 0.007); (0.5, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.045); (0.5, 0.04); (1, 0.03); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (0.5, 0.025); (1, 0.015); (2, 0.015) |
| NfLeafCnc | (0, 0.01); (0.5, 0.0075); (1, 0.005); (2, 0.005) |
| PtStemCnc | (0, 0.045); (0.5, 0.04); (1, 0.03); (2, 0.03) |
| CrStemCnc | (0, 0.03); (0.5, 0.025); (1, 0.015); (2, 0.015) |
| NfStemCnc | (0, 0.01); (0.5, 0.0075); (1, 0.005); (2, 0.005) |
| PtSOrgCnc | (0, 0.0375); (0.5, 0.035); (1, 0.03); (2, 0.03) |
| CrSOrgCnc | (0, 0.0225); (0.5, 0.02); (1, 0.015); (2, 0.015) |
| NfSOrgCnc | (0, 0.0075); (0.5, 0.005); (1, 0.005); (2, 0.005) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -10 |

### Crop Celeriac - transplanted

Parent Celeriac, defined in lib/celeriac.dai. Celeriac - transplanted

**Devel**

| Parameter | Value |
|:--|:--|
| DS | 0.2 |

**Prod**

| Parameter | Value |
|:--|:--|
| CH2OPool | 0.5 |
| NCrop | 0.25 |
| WLeaf | 1.75 |
| WRoot | 2.5 |
| WStem | 0.75 |

**Root**

| Parameter | Value |
|:--|:--|
| Depth | 7 |

**Harvest**

| Parameter | Value |
|:--|:--|
| production_delay | 21 |

### Crop Froegraes

Parent default, defined in lib/dk-grass.dai. Froegraes

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.022 |
| TempEff1 | (-10, 0.01); (0, 0.01); (20, 0.9); (25, 1); (35, 1.2) |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.028 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |
| defined_until_ds | 2. |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.9 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Qeff | 0.05 |
| DSEff | (0, 1); (0.3, 1); (1, 1); (2, 1) |
| Fm | 2.5 |
| TempEff | (-20, 0.0001); (5, 0.0001); (10, 0.9); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.025 |
| HvsDS | (0, 1); (1, 30); (2, 30) |
| LeafAIMod | (0); (2, 1) |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.6, 1); (2, 0) |
| StemPhotEff | 0.2 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| IntcpCap | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 60 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |
| Root | (0, 0.5); (0.33, 0.25); (0.53, 0.2); (1, 0); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.56); (0.95, 0.36); (1.14, 0) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.44); (0.95, 0.64); (1.14, 0.62); (1.45, 0.3); (2, 0.05) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.57 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0 |
| ReMobilDS | 1.38 |
| ReMobilRt | 0.1 |
| LfDR | (0.09, 0); (0.1, 0); (0.35, 0); (1, 0.02); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |
| Large_RtDR | 0.05 |
| IntDSRelRtRes | 0.2 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (0.6, 0.06); (1, 0.04); (2, 0.02) |
| CrLeafCnc | (0, 0.04); (0.6, 0.04); (1, 0.03); (2, 0.015) |
| NfLeafCnc | (0, 0.004); (0.6, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.025); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.02); (1, 0.012); (2, 0.006) |
| NfStemCnc | (0, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (2, 0.014) |
| TLLeafEff | (0, 0.9); (2, 0.9) |
| TLRootEff | (0, 0.1); (2, 0.1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | CROP-SLOW |
| Stem | CROP-SLOW |
| Leaf | CROP-SLOW |
| SOrg | CROP-SLOW initial_fraction 0 |
| Root | CROP-SLOW |
| DSmax | 3 |
| DSnew | 0.2 |

### Crop Graes

Parent Froegraes, defined in lib/dk-grass.dai. Graes

**Devel**

| Parameter | Value |
|:--|:--|
| PhotEff1 | (0, 0.1); (10, 0); (11, 0); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| DSEff | (0, 0.68); (0.3, 0.68); (1, 0.68); (2, 0.68) |
| Fm | 2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |

**Root**

| Parameter | Value |
|:--|:--|
| MxNH4Up | 1.2e-07 |
| MxNO3Up | 1.2e-08 |

### Crop Red fescue

Parent Froegraes, defined in lib/dk-grass.dai. Red fescue

cite: redfescue.

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.022 |
| TempEff1 | (-10, 0.01); (0, 0.01); (20, 0.9); (25, 1); (35, 1.2) |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.028 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |
| defined_until_ds | 2. |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Qeff | 0.05 |
| Fm | 2.16 |
| DSEff | (0, 0.5); (0.3, 0.6); (1, 1); (2, 1) |
| TempEff | (-20, 0.0001); (5, 0.0001); (10, 0.9); (25, 1); (35, 0.01); (50, 0) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.05); (0.6, 0.05); (1, 0.04); (2, 0.02) |
| CrLeafCnc | (0, 0.04); (0.6, 0.03); (1, 0.02); (2, 0.015) |
| NfLeafCnc | (0, 0.004); (0.6, 0.004); (2, 0.004) |

### Crop Silomajs

Parent default, defined in lib/dk-maize.dai. Silomajs

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 300 |
| DS_Emr | 0.01 |
| DSRate1 | 0.016 |
| TempEff1 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |
| PhotEff1 | 0. 0.9, 12. 1, 14. 0.95, 16. 0.9, 24. 0.9 |
| DSRate2 | 0.021 |
| TempEff2 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 5 |
| DSEff | (0, 1); (0.3, 1); (1, 1); (2, 1) |
| Qeff | 0.04 |
| TempEff | (-20, 0.001); (6, 0.1); (10, 1); (15, 1); (20, 1) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.25 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.01 |
| LeafAIMod | (0, 1); (2, 1) |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.6, 0); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.6, 0); (2, 0) |
| SOrgPhotEff | 0.2 |
| LAIDist0 | 0, 1, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.8 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.2, 50); (0.5, 150); (1, 200); (2, 200) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 100 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 9e-09 |
| MxNO3Up | 9e-09 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.67, 0.35); (1.37, 0.1); (1.6, 0.1); (2, 0.05) |
| Leaf | (0.35, 0.7); (0.67, 0.5); (1, 0.15); (1.18, 0.05); (1.85, 0.05); (2, 0.05) |
| Stem | (0.35, 0.3); (0.67, 0.5); (1, 0.85); (1.18, 0.05); (1.8, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.68 |
| r_Root | 0.015 |
| r_Leaf | 0.025 |
| r_Stem | 0.01 |
| r_SOrg | 0.03 |
| ShldResC | 0 |
| ReMobilDS | 1.4 |
| ReMobilRt | 0.02 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.5 |
| LfDR | (0, 0); (0.1, 0); (1.5, 0.005); (2, 0.005) |
| RtDR | (0, 0); (0.2, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.005) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.004) |
| PtLeafCnc | (0, 0.044); (0.367, 0.044); (0.5, 0.04); (1, 0.03); (1.5, 0.02); (1.8, 0.018) |
| CrLeafCnc | (0, 0.01); (0.367, 0.01); (0.5, 0.009); (1, 0.008); (1.5, 0.008); (1.8, 0.008) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0.838, 0.02); (1.057, 0.015); (1.244, 0.014) |
| CrStemCnc | (0.838, 0.01); (1.057, 0.01); (1.244, 0.008) |
| NfStemCnc | (0.838, 0.004); (1.057, 0.004); (1.244, 0.004) |
| PtSOrgCnc | (1.057, 0.02); (1.244, 0.018); (2, 0.018) |
| CrSOrgCnc | (1.057, 0.016); (1.244, 0.012); (2, 0.012) |
| NfSOrgCnc | (1.057, 0.014); (1.244, 0.01); (2, 0.01) |

### Crop Silomajs; Foulum

Parent Silomajs, defined in lib/dk-maize.dai. Silomajs; Foulum

cite: redfescue.

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 180 |
| DSRate1 | 0.02 |
| DSRate2 | 0.021 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 6.5 |
| DSEff | (0, 1); (0.3, 1); (1, 1); (2, 0.6) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.02 |
| LeafAIMod | (0, 0.35); (0.4, 0.45); (0.5, 0.5); (0.6, 0.55); (0.7, 0.58); (0.8, 0.62); (0.9, 0.75); (1.05, 0.9); (1.08, 1); (1.11, 1.05); (1.2, 1.08); (1.3, 1.1); (1.4, 1.1); (1.5, 1.1); (1.6, 1); (1.7, 0.9); (1.8, 0.5); (2, 0.4) |

**Root**

| Parameter | Value |
|:--|:--|
| MxNH4Up | 8e-08 |
| MxNO3Up | 8e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |
| Root | (0, 0.6); (0.67, 0.3); (1.37, 0.1); (1.6, 0.1); (2, 0.05) |
| Leaf | (0.35, 0.63); (0.49, 0.54); (0.67, 0.34); (0.9, 0.32); (1, 0.3); (1.11, 0.3); (1.2, 0.1); (1.3, 0); (1.8, 0); (2, 0) |
| Stem | (0.35, 0.37); (0.49, 0.46); (0.67, 0.66); (0.9, 0.68); (1, 0.7); (1.11, 0); (1.2, 0); (1.3, 0); (1.8, 0); (2, 0) |

**Prod**

| Parameter | Value |
|:--|:--|
| E_Leaf | 0.75 |
| E_Stem | 0.78 |
| E_SOrg | 0.8 |
| r_Root | 0.01 |
| r_Leaf | 0.01 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.007) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.005) |
| PtLeafCnc | (0, 0.027); (0.367, 0.028); (0.5, 0.029); (0.8, 0.03); (0.9, 0.031); (1, 0.034); (1.1, 0.034); (1.2, 0.034); (1.3, 0.034); (1.4, 0.03); (1.5, 0.025); (1.8, 0.015) |
| CrLeafCnc | (0, 0.009); (0.367, 0.009); (0.5, 0.009); (0.8, 0.009); (0.9, 0.009); (1, 0.01); (1.1, 0.015); (1.2, 0.017); (1.3, 0.01); (1.4, 0.009); (1.5, 0.009); (1.8, 0.009) |
| NfLeafCnc | (0, 0.004); (0.8, 0.004); (0.9, 0.004); (1, 0.006); (1.1, 0.008); (1.2, 0.009); (1.3, 0.006); (1.4, 0.004); (1.5, 0.004); (1.8, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.022); (0.367, 0.022); (0.5, 0.022); (0.8, 0.022); (0.9, 0.022); (1, 0.018); (1.1, 0.018); (1.2, 0.016); (1.3, 0.012); (1.4, 0.011); (1.5, 0.01) |
| CrStemCnc | (0, 0.01); (0.367, 0.01); (0.5, 0.01); (0.8, 0.01); (0.9, 0.01); (1, 0.008); (1.1, 0.008); (1.2, 0.008); (1.3, 0.008); (1.4, 0.008); (1.5, 0.008) |
| NfStemCnc | (0, 0.004); (0.367, 0.004); (0.5, 0.004); (0.8, 0.004); (0.9, 0.004); (1, 0.004); (1.1, 0.004); (1.2, 0.004); (1.3, 0.004); (1.4, 0.004); (1.5, 0.004) |
| PtSOrgCnc | (1.057, 0.02); (1.244, 0.015); (2, 0.012) |
| CrSOrgCnc | (1.057, 0.016); (1.244, 0.012); (2, 0.011) |
| NfSOrgCnc | (1.057, 0.014); (1.244, 0.01); (2, 0.01) |

### Crop Aert

Parent default, defined in lib/dk-pea.dai. Aert

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.027 |
| TempEff1 | (0, 0); (4, 0.01); (19, 1); (24, 1); (3000, 0.01) |
| PhotEff1 | (0, 0.1); (11, 0.1); (16, 1); (20, 1.2); (240, 1.2) |
| DSRate2 | 0.027 |
| TempEff2 | (0, 0); (16, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.5 |
| DSEff | (0, 1); (0.3, 0.88); (1, 0.85); (2, 0.85) |
| Qeff | 0.04 |
| TempEff | (-20, 0.001); (0, 0.01); (5, 0.4); (10, 0.7); (15, 0.9); (20, 1); (25, 1); (30, 0.9); (35, 0.8); (40, 0.5); (45, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.033 |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.2, 0); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.8, 0); (2, 0) |
| SOrgPhotEff | 0.2 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARrel | 0.02 |
| PARref | 0.06 |
| PARext | 0.55 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| IntcpCap | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 85 |
| rootdens | SpRtLength 30, DensRtTip 0.1 |
| Rad | 0.035 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.75, 0.6); (0.91, 0.05); (2, 0.005) |
| Leaf | (0, 0.82); (0.25, 0.82); (0.51, 0.7); (1, 0.3); (1.2, 0); (2, 0) |
| Stem | (0, 0.18); (0.25, 0.18); (0.51, 0.3); (1, 0.2); (1.2, 0.1); (1.5, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.57 |
| r_Root | 0.025 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.1 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.5 |
| LfDR | (0, 0); (1.5, 0.01); (2, 0.03) |
| RtDR | (0, 0); (0.8, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| DS_fixate | 0.2 |
| fixate_factor | 0.8 |
| TLLeafEff | (1.09, 1); (2, 1) |
| PtRootCnc | (0, 0.02); (0.27, 0.02); (1.93, 0.02) |
| CrRootCnc | (0, 0.015); (0.27, 0.015); (1.93, 0.015) |
| NfRootCnc | (0, 0.01); (0.27, 0.01); (1.93, 0.01) |
| PtLeafCnc | (0, 0.06); (1, 0.06); (1.5, 0.025); (1.8, 0.02) |
| CrLeafCnc | (0, 0.02); (1, 0.02); (1.5, 0.016); (1.8, 0.012) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (1.5, 0.004); (1.8, 0.004) |
| PtStemCnc | (0, 0.03); (1, 0.025); (1.5, 0.015); (1.8, 0.011) |
| CrStemCnc | (0, 0.01); (1, 0.01); (1.5, 0.01); (1.8, 0.01) |
| NfStemCnc | (0, 0.004); (1, 0.004); (1.5, 0.004); (1.8, 0.004) |
| PtSOrgCnc | (0, 0.034); (1, 0.034); (2, 0.034) |
| CrSOrgCnc | (0, 0.02); (1, 0.02); (2, 0.02) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.81 |
| EconomicYield_N | 0.92 |

### Crop Rug

Parent default, defined in lib/dk-rye.dai. Rug

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.02 |
| TempEff1 | -10. 0.01 |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.025 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.33 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| DSEff | (0, 1); (0.3, 1); (1, 0.92); (2, 0.9) |
| Qeff | 0.05 |
| TempEff | (-20, 0); (4, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.025 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| PARrel | 0.05 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 100 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 7.3e-08 |
| MxNO3Up | 7.3e-09 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.25); (1, 0.05); (2, 0) |
| Leaf | (0, 0.7); (0.33, 0.65); (0.43, 0.6); (0.53, 0.55); (0.62, 0.4); (0.77, 0.18); (0.95, 0.05); (1.14, 0); (1.38, 0); (2, 0) |
| Stem | (0, 0.3); (0.33, 0.35); (0.43, 0.4); (0.53, 0.45); (0.62, 0.6); (0.77, 0.75); (0.95, 0.07); (1.14, 0.04); (1.38, 0.02); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0 |
| LfDR | (0, 0); (0.05, 0.01); (0.2, 0); (0.25, 0.01); (0.9, 0.03); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.011); (1, 0.011); (2, 0.01) |
| CrRootCnc | (0, 0.009); (1, 0.009); (2, 0.008) |
| NfRootCnc | (0, 0.006); (1, 0.006); (2, 0.006) |
| PtLeafCnc | (0.34, 0.055); (0.5, 0.032); (1.28, 0.025); (1.52, 0.021); (1.93, 0.017) |
| CrLeafCnc | (0.34, 0.02); (0.5, 0.019); (1.28, 0.018); (1.52, 0.016); (1.93, 0.013) |
| NfLeafCnc | (0.34, 0.006); (0.5, 0.006); (1.28, 0.0055); (1.52, 0.005); (1.93, 0.005) |
| PtStemCnc | (0.5, 0.018); (1.12, 0.01); (1.28, 0.006); (1.53, 0.0055); (1.93, 0.0055) |
| CrStemCnc | (0.5, 0.0054); (1.12, 0.0039); (1.28, 0.0033); (1.53, 0.0031); (1.93, 0.0025) |
| NfStemCnc | (0.5, 0.002); (1.12, 0.002); (1.28, 0.002); (1.53, 0.002); (1.93, 0.002) |
| PtSOrgCnc | (1.12, 0.014); (2, 0.014) |
| CrSOrgCnc | (1.12, 0.012); (2, 0.012) |
| NfSOrgCnc | (1.12, 0.01); (2, 0.01) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Vaarbyg

Parent default, defined in lib/dk-sbarley.dai. Vaarbyg

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.032 |
| TempEff1 | (0, 0); (4, 0.01); (19, 1); (24, 1); (30, 0.01) |
| PhotEff1 | (0, 0.1); (11, 0.1); (16, 1); (20, 1.2); (24, 1.2) |
| DSRate2 | 0.021 |
| TempEff2 | (0, 0); (16, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4.4 |
| DSEff | (0, 1); (0.3, 1); (1, 1); (2, 1) |
| Qeff | 0.04 |
| TempEff | -20. 0.001 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.038 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 75); (2, 75) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 90 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 1.3e-07 |
| MxNO3Up | 1.3e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.65); (0.51, 0.55); (0.72, 0.15); (0.95, 0.05); (2, 0) |
| Leaf | (0, 1); (0.25, 0.7); (0.51, 0.55); (0.6, 0.5); (0.72, 0.23); (0.83, 0.01); (0.95, 0); (2, 0) |
| Stem | (0, 0); (0.25, 0.3); (0.51, 0.45); (0.6, 0.5); (0.72, 0.77); (0.83, 0.99); (0.95, 0.65); (1.51, 0); (2, 0) |
| RSR | (0, 0.5); (0.75, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.7 |
| LfDR | (0, 0); (0.5, 0); (1.2, 0.01); (2, 0.08) |
| RtDR | (0, 0); (0.2, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.02) |
| CrLeafCnc | (0, 0.03); (1, 0.02); (2, 0.01) |
| NfLeafCnc | (0, 0.006); (1, 0.006); (2, 0.006) |
| PtStemCnc | (0, 0.02); (1, 0.012); (2, 0.006) |
| CrStemCnc | (0, 0.01); (1, 0.008); (2, 0.005) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.017); (1, 0.017); (2, 0.017) |
| CrSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |
| NfSOrgCnc | (0, 0.011); (1, 0.011); (2, 0.011) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Vinterbyg

Parent default, defined in lib/dk-wbarley.dai. Vinterbyg

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 200 |
| DS_Emr | 0.01 |
| DSRate1 | 0.025 |
| TempEff1 | -10. 0.01 |
| PhotEff1 | (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.03 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.25 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| DSEff | (0, 1); (0.3, 1); (1, 0.95); (2, 0.94) |
| Qeff | 0.05 |
| TempEff | (-20, 0); (2, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 100 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 1e-07 |
| MxNO3Up | 1e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.25); (1, 0.05); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.75); (0.62, 0.56); (0.77, 0.2); (0.95, 0.09); (1.14, 0.05); (1.38, 0); (2, 0) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.25); (0.62, 0.44); (0.77, 0.8); (0.95, 0.55); (1.14, 0.4); (1.38, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.05, 0.01); (0.2, 0); (0.25, 0.01); (0.9, 0.03); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.02) |
| CrLeafCnc | (0, 0.03); (1, 0.02); (2, 0.01) |
| NfLeafCnc | (0, 0.006); (1, 0.006); (2, 0.006) |
| PtStemCnc | (0, 0.02); (1, 0.014); (2, 0.007) |
| CrStemCnc | (0, 0.01); (1, 0.008); (2, 0.005) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.017); (1, 0.017); (2, 0.017) |
| CrSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |
| NfSOrgCnc | (0, 0.012); (1, 0.012); (2, 0.012) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Vinterraps

Parent default, defined in lib/dk-wrape.dai. Vinterraps

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 180 |
| DS_Emr | 0.01 |
| DSRate1 | 0.03 |
| TempEff1 | -10. 0.01, 20. 0.9, 25. 1, 35. 1.2 |
| PhotEff1 | 10. 0.29, 11. 0.55, 12. 0.75, 13. 0.89, 14. 1, 15. 1.08, 16. 1.14, 17. 1.18, 24. 1.18 |
| DSRate2 | 0.025 |
| TempEff2 | 10. 0.14, 15. 0.66, 20. 1, 25. 1.23 |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.33 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 5 |
| DSEff | (0, 1); (0.3, 1); (1, 0.91); (2, 0.87) |
| Qeff | 0.05 |
| TempEff | -20. 0, 2. 0, 10. 1, 25. 1, 35. 0.01, 50. 0 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.25 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.02 |
| LeafAIMod | (0); (2, 1) |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.6, 1); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.4, 1); (2, 0) |
| SOrgPhotEff | 0.25 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.7 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.34, 5); (0.45, 10); (0.69, 50); (1, 160); (2, 160) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 1e-08 |
| MxNO3Up | 1e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.25); (0.66, 0.15); (1, 0.07); (2, 0.07) |
| Leaf | (0, 0.95); (0.33, 0.95); (0.43, 0.9); (0.53, 0.75); (0.62, 0.56); (0.77, 0.14); (0.95, 0.06); (1.14, 0.04); (1.18, 0); (2, 0) |
| Stem | (0, 0.05); (0.33, 0.05); (0.43, 0.1); (0.53, 0.25); (0.62, 0.44); (0.77, 0.6); (0.95, 0.48); (1.14, 0.18); (1.18, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.5 |
| r_Root | 0.015 |
| r_Leaf | 0.06 |
| r_Stem | 0.01 |
| r_SOrg | 0.03 |
| ShldResC | 0 |
| ReMobilDS | 1.18 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.09, 0); (0.1, 0.01); (0.15, 0.005); (1, 0.005); (1.05, 0.2); (1.2, 0.1); (1.25, 0.05); (2, 0.02) |
| RtDR | (0.6, 0); (1.7, 0); (2, 0.005) |
| ExfoliationFac | 0.9 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0.33, 0.033); (0.41, 0.02); (0.58, 0.023); (1.4, 0.01); (2, 0.01) |
| CrRootCnc | (0.33, 0.008); (0.41, 0.008); (0.58, 0.008); (1.4, 0.008); (2, 0.008) |
| NfRootCnc | (0.33, 0.007); (0.41, 0.007); (0.58, 0.007); (1.4, 0.007); (2, 0.007) |
| PtLeafCnc | (0.33, 0.06); (0.41, 0.06); (0.65, 0.06); (0.8, 0.06); (1.09, 0.05); (1.4, 0.03); (2, 0.025) |
| CrLeafCnc | (0.33, 0.044); (0.41, 0.044); (0.65, 0.044); (0.8, 0.044); (1.09, 0.04); (1.4, 0.022); (2, 0.02) |
| NfLeafCnc | (0.33, 0.004); (0.41, 0.004); (0.65, 0.004); (0.8, 0.004); (1.09, 0.004); (1.4, 0.004); (2, 0.004) |
| PtStemCnc | (0.65, 0.05); (0.8, 0.035); (1.09, 0.016); (1.6, 0.008); (2, 0.008) |
| CrStemCnc | (0.65, 0.03); (0.8, 0.02); (1.09, 0.008); (1.6, 0.006); (2, 0.006) |
| NfStemCnc | (0.65, 0.004); (0.8, 0.004); (1.09, 0.004); (1.6, 0.004); (2, 0.004) |
| PtSOrgCnc | (1.09, 0.045); (1.4, 0.024); (2, 0.022) |
| CrSOrgCnc | (1.09, 0.03); (1.4, 0.019); (2, 0.018) |
| NfSOrgCnc | (1.09, 0.004); (1.4, 0.004); (2, 0.004) |
| TLLeafEff | (1.09, 1); (1.4, 1); (2, 1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.58 |
| EconomicYield_N | 0.82 |

### Crop Vinterhvede

Parent default, defined in lib/dk-wwheat.dai. Vinterhvede

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.026 |
| TempEff1 | (-10, 0.01); (0, 0.01); (20, 0.9); (25, 1); (35, 1.2) |
| PhotEff1 | (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.025 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.25 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 5 |
| DSEff | (0, 1); (0.3, 1); (1, 0.86); (2, 0.81) |
| Qeff | 0.05 |
| TempEff | (-20, 0); (4, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| PARrel | 0.05 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 80); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 100 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 7.4e-09 |
| MxNO3Up | 7.4e-09 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.5); (1, 0.05); (2, 0) |
| Leaf | (0, 0.7); (0.4, 0.7); (0.55, 0.7); (0.62, 0.5); (0.77, 0.2); (0.95, 0.1); (1.38, 0.05); (2, 0) |
| Stem | (0, 0.3); (0.4, 0.3); (0.55, 0.3); (0.62, 0.5); (0.77, 0.8); (0.95, 0.9); (1.2, 0.25); (1.38, 0.08); (2, 0) |
| RSR | (0, 0.5); (1, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.016 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.4 |
| ReMobilDS | 1.5 |
| ReMobilRt | 0.03 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.7 |
| LfDR | (0, 0); (0.1, 0); (0.25, 0); (0.5, 0.01); (0.9, 0.01); (1.2, 0.02); (1.8, 0.05); (2, 0.05) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.011); (1, 0.011); (2, 0.01) |
| CrRootCnc | (0, 0.009); (1, 0.009); (2, 0.008) |
| NfRootCnc | (0, 0.006); (1, 0.006); (2, 0.006) |
| PtLeafCnc | (0.34, 0.06); (0.5, 0.034); (1.28, 0.031); (1.52, 0.0268); (1.93, 0.0184) |
| CrLeafCnc | (0.34, 0.02); (0.5, 0.02); (1.28, 0.02); (1.52, 0.018); (1.93, 0.0153) |
| NfLeafCnc | (0.34, 0.006); (0.5, 0.006); (1.28, 0.006); (1.52, 0.006); (1.93, 0.006) |
| PtStemCnc | (0.5, 0.018); (1.12, 0.0115); (1.28, 0.0083); (1.53, 0.0075); (1.93, 0.006) |
| CrStemCnc | (0.5, 0.0054); (1.12, 0.0039); (1.28, 0.0033); (1.53, 0.0031); (1.93, 0.0025) |
| NfStemCnc | (0.5, 0.002); (1.12, 0.002); (1.28, 0.002); (1.53, 0.002); (1.93, 0.002) |
| PtSOrgCnc | (1.12, 0.019); (2, 0.019) |
| CrSOrgCnc | (1.12, 0.014); (2, 0.014) |
| NfSOrgCnc | (1.12, 0.011); (2, 0.011) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Potato; SCRI - AArhus

Parent default, defined in lib/earlypotato.dai. Potato; SCRI - AArhus

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 425 |
| DS_Emr | 0.01 |
| DSRate1 | 0.07 |
| TempEff1 | (2, 0); (13, 1); (19, 1); (29, 0) |
| PhotEff1 | (12, 1); (16, 1) |
| DSRate2 | 0.009 |
| TempEff2 | (2, 0); (13, 1); (19, 1); (29, 0) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3 |
| DSEff | (0, 1.2); (0.3, 1.2); (1, 1); (1.6, 0.75); (2, 0.75) |
| Qeff | 0.045 |
| TempEff | (3, 0.01); (10, 0.75); (15, 1); (20, 1); (26, 0.75); (33, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.033 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.5 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 20); (1.25, 35) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 20 |
| PenPar1 | 0.3 |
| PenPar2 | 4 |
| MaxPen | 50 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |
| rootdens | SpRtLength 200, DensRtTip 0.2 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.2); (1, 0.2); (1.36, 0) |
| Leaf | (0, 0.95); (1, 0.75); (1.05, 0.2); (1.25, 0.18); (1.6, 0) |
| Stem | (0, 0.05); (1, 0.25); (1.05, 0.5); (1.25, 0.2); (1.6, 0.03); (2, 0) |
| RSR | (0, 0.5); (0.75, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.72 |
| E_Leaf | 0.66 |
| E_Stem | 0.72 |
| E_SOrg | 0.85 |
| r_Root | 0.01 |
| r_Leaf | 0.03 |
| r_Stem | 0.015 |
| r_SOrg | 0.0045 |
| ShldResC | 0.1 |
| ReMobilDS | 1.5 |
| ReMobilRt | 0.01 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (1.6, 0); (1.75, 0.02); (2, 0.1) |
| RtDR | (0, 0); (1.6, 0); (2, 0) |
| ExfoliationFac | 0 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.06); (1.25, 0.05); (2, 0.035) |
| CrLeafCnc | (0, 0.045); (1, 0.045); (1.25, 0.04); (2, 0.03) |
| NfLeafCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| PtStemCnc | (0, 0.04); (1, 0.04); (1.6, 0.016); (2, 0.013) |
| CrStemCnc | (0, 0.012); (1.25, 0.012); (2, 0.01) |
| NfStemCnc | (0, 0.004); (2, 0.004) |
| PtSOrgCnc | (1, 0.02); (1.25, 0.015); (2, 0.012) |
| CrSOrgCnc | (1, 0.008); (1.25, 0.008); (2, 0.0075) |
| NfSOrgCnc | (1, 0.004); (2, 0.004) |
| TLLeafEff | (1.09, 1); (2, 1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -10 |

### Crop Early potato

Parent Potato; SCRI - AArhus, defined in lib/earlypotato.dai. Early potato

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 275 |
| DS_Emr | 0.01 |
| DSRate1 | 0.059 |
| TempEff1 | (7, 0.01); (18, 1); (29, 0.01) |
| PhotEff1 | (0, 0); (8, 1); (16, 1); (24, 0.9) |
| DSRate2 | 0.0225 |
| TempEff2 | (7, 0); (18, 1); (29, 0) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.2 |
| DSEff | (0, 1); (0.3, 1); (1, 1); (1.6, 1); (2, 1) |
| Qeff | 0.045 |
| TempEff | (3, 0.01); (12, 0.75); (15, 1); (20, 1); (26, 0.75); (33, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.024 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.65 |
| EPext | 0.5 |
| HvsDS | (0, 0); (1, 60); (2.1, 60) |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.37, 0.32); (0.83, 0.09); (1, 0); (1.14, 0); (1.35, 0); (1.57, 0); (2.1, 0) |
| Leaf | (0, 0.77); (0.37, 0.67); (0.83, 0.39); (1, 0.23); (1.14, 0.1); (1.35, 0); (1.57, 0); (2.1, 0) |
| Stem | (0, 0.16); (0.37, 0.15); (0.83, 0.16); (1, 0.16); (1.14, 0.15); (1.35, 0.02); (1.57, 0); (2.1, 0) |
| RSR | (0, 0.5); (0.75, 0.5); (2, 0.25) |

### Crop Early white cabbage - transplanted

Parent White cabbage - transplanted, defined in lib/earlywhitecabbage.dai. Early white cabbage - transplanted

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 2 |
| DSRate1 | 0.013 |
| TempEff1 | (0, 0); (3, 0); (13, 1); (18, 1); (26, 0) |
| PhotEff1 | (0, 0); (8, 1); (16, 1); (24, 0.8) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 6.5 |
| Qeff | 0.048 |
| TempEff | (0, 0.01); (10, 1); (20, 1); (25, 0.8); (35, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.018 |
| SpSOrgAI | 0.0018 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.3); (0.15, 0.15); (0.3, 0.15); (0.5, 0.1); (0.75, 0.1); (1, 0.1); (1.1, 0.1) |
| Leaf | (0, 0.8); (0.15, 0.65); (0.3, 0.5); (0.5, 0.3); (0.75, 0.2); (1, 0.1); (1.1, 0.1) |
| Stem | (0, 0.2); (0.15, 0.35); (0.3, 0.25); (0.5, 0.25); (0.75, 0.15); (1, 0.1); (1.1, 0.1) |
| RSR | (0, 0.5); (1, 0.25) |

### Crop Fodder Beet

Parent default, defined in lib/fodderbeet.dai. Fodder Beet

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 250 |
| DS_Emr | 0.01 |
| DSRate1 | 0.005 |
| TempEff1 | -1. 0, 20. 1, 25. 0.5 |
| PhotEff1 | 1. 0, 12. 1, 16. 1, 24. 1 |
| DSRate2 | 0.007 |
| TempEff2 | 30. 1 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.5 |
| Qeff | 0.056 |
| TempEff | 5. 0, 10. 0.75, 20. 1, 30. 1, 40. 0.01, 50. 0 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.17 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.011 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.67 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.02, 4); (0.08, 10); (0.14, 30); (0.21, 40); (0.27, 55) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 200 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.25); (0.08, 0.2); (0.14, 0.1); (0.27, 0.07); (0.34, 0.06) |
| Leaf | (0, 0.8); (0.18, 0.8); (0.2, 0.2); (0.25, 0.2); (0.35, 0.15) |
| Stem | (0, 0); (1.1, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.66 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.2, 0); (0.25, 0.01); (0.8, 0.01); (1, 0.02); (2, 0.1) |
| RtDR | (0.2, 0); (0.5, 0.01); (2, 0.01) |
| ExfoliationFac | 0 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.005) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.004) |
| PtLeafCnc | (0, 0.06); (0.1, 0.05); (0.125, 0.045); (0.2, 0.04); (0.3, 0.04); (0.4, 0.04); (0.5, 0.04) |
| CrLeafCnc | (0, 0.03); (0.1, 0.03); (0.2, 0.03); (0.3, 0.02); (0.8, 0.02) |
| NfLeafCnc | (0, 0.01); (0.1, 0.01); (0.2, 0.01); (0.3, 0.01); (0.8, 0.01) |
| PtStemCnc | (0, 0.02); (2, 0.02) |
| CrStemCnc | (0, 0.01); (2, 0.01) |
| NfStemCnc | (0, 0.004); (2, 0.004) |
| PtSOrgCnc | (0.1, 0.025); (0.2, 0.018); (0.3, 0.013); (0.4, 0.011); (0.5, 0.011) |
| CrSOrgCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| NfSOrgCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| TLLeafEff | (1.09, 1); (2, 1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -15 |

### Crop Grass; V1

Parent old, defined in lib/grass-old.dai. Grass; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DSRate1 | 0.00145 |
| DSRate2 | 0.00145 |
| DS_Emr | 0.01 |
| DS_reset | true |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 4 |
| TLim2 | 10 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 4.7 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 1000 |
| alpha | 3 |
| beta | 1.87 |
| SpLAI | 0.017 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.6 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 70 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.2); (2, 0.2) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (0, 0.7); (2, 0.7) |
| r_Root | (0, 0.065); (2, 0.065) |
| r_Leaf | (0, 0.04); (2, 0.04) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.02 |
| PtLeafCnc | (0, 0.055); (0.044, 0.052); (0.087, 0.049); (0.131, 0.046); (0.175, 0.043); (0.218, 0.041); (0.262, 0.038); (0.305, 0.036); (0.349, 0.034); (0.393, 0.032); (0.436, 0.03) |
| PtRootCnc | (0, 0.02); (0.044, 0.019); (0.087, 0.019); (0.131, 0.018); (0.175, 0.018); (0.218, 0.017); (0.262, 0.017); (0.305, 0.016); (0.349, 0.016); (0.393, 0.015); (0.436, 0.015) |
| CrLeafCnc | (0, 0.035); (0.044, 0.034); (0.087, 0.033); (0.131, 0.032); (0.175, 0.031); (0.218, 0.03); (0.262, 0.029); (0.305, 0.028); (0.349, 0.027); (0.393, 0.026); (0.436, 0.025) |
| CrRootCnc | (0, 0.008); (0.044, 0.008); (0.087, 0.008); (0.131, 0.008); (0.175, 0.008); (0.218, 0.008); (0.262, 0.008); (0.305, 0.008); (0.349, 0.008); (0.393, 0.008); (0.436, 0.008) |
| NfLeafCnc | (0, 0.015); (0.044, 0.014); (0.087, 0.013); (0.131, 0.012); (0.175, 0.012); (0.218, 0.011); (0.262, 0.01); (0.305, 0.01); (0.349, 0.009); (0.393, 0.009); (0.436, 0.008) |
| NfRootCnc | (0, 0.008); (0.044, 0.007); (0.087, 0.007); (0.131, 0.006); (0.175, 0.006); (0.218, 0.006); (0.262, 0.005); (0.305, 0.005); (0.349, 0.005); (0.393, 0.004); (0.436, 0.004) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0 |
| CStem | -4.242e+43 |
| CSOrg | -4.242e+43 |
| alpha | -4.242e+43 |
| beta | 0.075 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| DSmax | 3 |
| DSnew | 0.07 |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Grass to grain

Parent default, defined in lib/grass.dai. Grass to grain

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.022 |
| TempEff1 | (-10, 0.01); (0, 0.01); (20, 0.9); (25, 1); (35, 1.2) |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.028 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |
| defined_until_ds | 2. |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.9 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Qeff | 0.05 |
| Fm | 2.16 |
| TempEff | (-20, 0.0001); (5, 0.0001); (10, 0.9); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.025 |
| HvsDS | (0, 1); (1, 30); (2, 30) |
| LeafAIMod | (0); (2, 1) |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.6, 1); (2, 0) |
| StemPhotEff | 0.2 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| IntcpCap | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 70 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |
| Root | (0, 0.5); (0.33, 0.25); (0.53, 0.2); (1, 0); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.56); (0.95, 0.36); (1.14, 0) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.44); (0.95, 0.64); (1.14, 0.62); (1.45, 0.3); (2, 0.05) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.57 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0 |
| ReMobilDS | 1.38 |
| ReMobilRt | 0.1 |
| LfDR | (0.09, 0); (0.1, 0); (0.35, 0); (1, 0.02); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |
| Large_RtDR | 0.05 |
| IntDSRelRtRes | 0.2 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.03); (2, 0.02) |
| CrLeafCnc | (0, 0.03); (1, 0.02); (2, 0.015) |
| NfLeafCnc | (0, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (2, 0.014) |
| TLLeafEff | (0, 0.9); (2, 0.9) |
| TLRootEff | (0, 0.1); (2, 0.1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | CROP-SLOW |
| Stem | CROP-SLOW |
| Leaf | CROP-SLOW |
| SOrg | CROP-SLOW initial_fraction 0 |
| Root | CROP-SLOW |
| DSmax | 3 |
| DSnew | 0.2 |

### Crop Grass

Parent Grass to grain, defined in lib/grass.dai. Grass to grain

**Devel**

| Parameter | Value |
|:--|:--|
| PhotEff1 | (0, 0.1); (10, 0); (11, 0); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |

### Crop Grass

Parent default, defined in lib/grass2.dai. Grass

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.022 |
| TempEff1 | (-10, 0.01); (0, 0.01); (20, 0.9); (25, 1); (35, 1.2) |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.028 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.99 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 2.16 |
| Qeff | 0.036 |
| TempEff | (-20, 0); (5, 0); (10, 0.9); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.02 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 40); (2, 40) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 70 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.55); (0.33, 0.5); (0.53, 0.5); (1, 0.3); (1.5, 0.1); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.75); (0.62, 0.65); (0.77, 0.3); (0.95, 0.5); (1.14, 0.2); (1.38, 0.2); (2, 0.1) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.25); (0.62, 0.35); (0.77, 0.7); (0.95, 0.5); (1.14, 0.8); (1.38, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.005 |
| r_Leaf | 0.02 |
| r_Stem | 0.005 |
| r_SOrg | 0.005 |
| ShldResC | 0.1 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.1, 0); (0.35, 0); (1, 0.02); (2, 0.2) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.007); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.03); (2, 0.02) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

### Crop Maize

Parent default, defined in lib/maize.dai. Maize

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 300 |
| DS_Emr | 0.01 |
| DSRate1 | 0.024 |
| TempEff1 | 0. 0, 6. 0, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |
| PhotEff1 | 0. 0.9, 12. 1, 14. 0.95, 16. 0.9, 24. 0.9 |
| DSRate2 | 0.015 |
| TempEff2 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 6 |
| Qeff | 0.04 |
| TempEff | (-20, 0.001); (6, 0.1); (10, 1); (15, 1); (20, 1) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.25 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.01 |
| LeafAIMod | (0, 1); (2, 1) |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.6, 0); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.6, 0); (2, 0) |
| SOrgPhotEff | 0.2 |
| LAIDist0 | 0, 1, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.8 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.2, 50); (0.5, 150); (1, 200); (2, 200) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.67, 0.35); (1.37, 0.1); (1.6, 0.1); (2, 0.05) |
| Leaf | (0.35, 0.7); (0.67, 0.5); (1, 0.15); (1.18, 0.05); (1.85, 0.05); (2, 0.05) |
| Stem | (0.35, 0.3); (0.67, 0.5); (1, 0.85); (1.18, 0.05); (1.8, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.68 |
| r_Root | 0.015 |
| r_Leaf | 0.025 |
| r_Stem | 0.01 |
| r_SOrg | 0.03 |
| ShldResC | 0.35 |
| ReMobilDS | 1.4 |
| ReMobilRt | 0.02 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.5 |
| LfDR | (0, 0); (0.1, 0); (1.5, 0.005); (2, 0.005) |
| RtDR | (0, 0); (0.2, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.005) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.004) |
| PtLeafCnc | (0, 0.044); (0.367, 0.044); (0.5, 0.04); (1, 0.03); (1.5, 0.018); (1.8, 0.015) |
| CrLeafCnc | (0, 0.01); (0.367, 0.01); (0.5, 0.009); (1, 0.008); (1.5, 0.008); (1.8, 0.008) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0.838, 0.02); (1.057, 0.014); (1.244, 0.011) |
| CrStemCnc | (0.838, 0.01); (1.057, 0.01); (1.244, 0.008) |
| NfStemCnc | (0.838, 0.004); (1.057, 0.004); (1.244, 0.004) |
| PtSOrgCnc | (1.057, 0.02); (1.244, 0.015); (2, 0.015) |
| CrSOrgCnc | (1.057, 0.016); (1.244, 0.012); (2, 0.012) |
| NfSOrgCnc | (1.057, 0.014); (1.244, 0.01); (2, 0.01) |

### Crop Pioneer Maize

Parent default, defined in lib/maize.dai. Pioneer Maize

cite: vries-maize.

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.0265 |
| TempEff1 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |
| PhotEff1 | 0. 0.9, 12. 1, 14. 0.95, 16. 0.9, 24. 0.9 |
| DSRate2 | 0.017 |
| TempEff2 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 6 |
| Qeff | 0.04 |
| TempEff | -20. 0.001, 0. 0.01, 5. 0.01, 10. 0.1, 15. 0.5, 20. 0.8, 25. 1, 35. 1, 40. 0.9, 45. 0.75, 50. 0.07 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.13 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.03 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.2, 50); (0.5, 150); (1, 200); (2, 200) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.67, 0.25); (1.37, 0); (1.6, 0); (2, 0) |
| Leaf | (0, 0.95); (0.35, 0.59); (0.67, 0.2); (1, 0.12); (1.18, 0.09); (1.37, 0); (2, 0) |
| Stem | (0, 0.05); (0.35, 0.41); (0.67, 0.66); (1, 0.64); (1.18, 0.31); (1.37, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.68 |
| r_Root | 0.015 |
| r_Leaf | 0.016 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.35 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.1, 0); (1.5, 0.005); (2, 0.1) |
| RtDR | (0, 0); (0.2, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.005) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.004) |
| PtLeafCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrLeafCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrStemCnc | (0, 0.03); (1, 0.02); (2, 0.02) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | CROP-SLOW |
| Stem | CROP-SLOW |
| Leaf | CROP-SLOW |
| SOrg | CROP-SLOW |
| Root | CROP-SLOW |
| DSmax | 0.8 |
| DSnew | 0.2 |

### Crop Ikuwala Maize

Parent Maize, defined in lib/maize.dai. Ikuwala Maize

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 300 |
| DSRate1 | 0.02 |
| DSRate2 | 0.02 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.3 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.03 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARext | 0.56 |

**Prod**

| Parameter | Value |
|:--|:--|
| ShldResC | 0.3 |
| LfDR | (0, 0); (0.1, 0); (1.4, 0.01); (1.8, 0.1); (2, 0.2) |
| ExfoliationFac | 0 |

**Partit**

| Parameter | Value |
|:--|:--|
| Stem | (0, 0.3); (0.35, 0.3); (0.67, 0.5); (1, 0.64); (1.18, 0.31); (1.37, 0.3); (2, 0.1) |

### Crop Silage Maize

Parent Maize, defined in lib/maize.dai. Silage Maize

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 300 |
| DS_Emr | 0.01 |
| DSRate1 | 0.016 |
| TempEff1 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |
| PhotEff1 | 0. 0.9, 12. 1, 14. 0.95, 16. 0.9, 24. 0.9 |
| DSRate2 | 0.021 |
| TempEff2 | 0. 0.3, 10. 0.3, 15. 0.75, 25. 1, 35. 1.2 |

**Prod**

| Parameter | Value |
|:--|:--|
| ShldResC | 0 |

### Crop Onion

Parent default, defined in lib/onion.dai. Onion

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 1 |
| EmrTSum | 270 |
| DSRate1 | 0.01625 |
| TempEff1 | (0, 0); (5, 0); (25, 1) |
| PhotEff1 | (0, 0); (12, 0); (15, 1); (24, 1) |
| DSRate2 | 0.01 |
| TempEff2 | (0, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.3 |
| Qeff | 0.045 |
| TempEff | (0, 0.01); (6, 0.01); (20, 1); (25, 1); (31, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.25 |
| SpLAIfac | (0, 1); (1, 1) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.1 |
| LeafAIMod | (0, 1); (0.07, 1); (0.12, 0.405); (0.25, 0.2775); (0.9, 0.15) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0, 1 |
| PARref | 0.06 |
| PARext | 0.5 |
| EPext | 0.5 |
| HvsWStem | (0, 0.1); (1, 1) |
| HvsDS | (0, 0); (0.4, 50); (1, 50) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 5 |
| PenPar1 | 0.02 |
| PenPar2 | 0 |
| MaxPen | 30 |
| Rad | 0.05 |
| h_wp | -15000 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.2, 0.3); (0.4, 0.1); (0.6, 0.05); (0.8, 0.05); (1, 0) |
| Leaf | (0, 0.75); (0.2, 0.55); (0.4, 0.4); (0.6, 0); (0.8, 0); (1, 0) |
| Stem | (0, 0.2); (0.2, 0.15); (0.4, 0.05); (0.6, 0); (0.8, 0); (1, 0) |
| RSR | (0, 0.5); (1, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_SOrg | 0.0025 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.2, 0); (0.6, 0); (0.8, 0.03); (1, 0.1) |
| RtDR | (0.2, 0); (0.6, 0); (0.8, 0.01); (1, 0.02) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.024); (0.25, 0.022); (1, 0.02) |
| CrRootCnc | (0, 0.012); (0.25, 0.011); (1, 0.01) |
| NfRootCnc | (0, 0.009); (0.25, 0.008); (1, 0.007) |
| PtLeafCnc | (0, 0.05); (0.25, 0.0375); (1, 0.025) |
| CrLeafCnc | (0, 0.03); (0.25, 0.021); (1, 0.012) |
| NfLeafCnc | (0, 0.02); (0.25, 0.0135); (1, 0.007) |
| PtStemCnc | (0, 0.05); (0.25, 0.0375); (1, 0.025) |
| CrStemCnc | (0, 0.03); (0.25, 0.021); (1, 0.012) |
| NfStemCnc | (0, 0.02); (0.25, 0.0135); (1, 0.007) |
| PtSOrgCnc | (0, 0.045); (0.25, 0.0325); (1, 0.02) |
| CrSOrgCnc | (0, 0.03); (0.25, 0.0225); (1, 0.015) |
| NfSOrgCnc | (0, 0.015); (0.25, 0.011); (1, 0.007) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -5 |

### Crop Onion - planting of sets

Parent Onion, defined in lib/onion_plantingofsets.dai. Onion - planting of sets

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DSRate1 | 0.017 |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.6 |
| WSOrg | 20 |
| CH2OPool | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4.1 |
| Qeff | 0.046 |

### Crop Pea; V1

Parent old, defined in lib/pea-old.dai. Pea; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DSRate1 | 0.00137 |
| DSRate2 | 0.00137 |
| DS_Emr | 0.01 |
| DS_reset | false |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 4 |
| TLim2 | 10 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 5.1 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 0.724 |
| alpha | 1.4 |
| beta | 0.551 |
| SpLAI | 0.018 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 60 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.92, 0.1); (2, 0.1) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (0, 0.6); (2, 0.6) |
| r_Root | (0.92, 0.1); (0.9201, 0.05) |
| r_Leaf | (0, 0.02); (2, 0.02) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 1 |
| DS_fixate | 0.207 |
| PtLeafCnc | (0.276, 0.034); (0.512, 0.032); (0.749, 0.03); (0.985, 0.029); (1.222, 0.027); (1.458, 0.026); (1.695, 0.024); (1.931, 0.023) |
| PtRootCnc | (0.276, 0.045); (0.512, 0.04); (0.749, 0.036); (0.985, 0.032); (1.222, 0.029); (1.458, 0.026); (1.695, 0.023); (1.931, 0.021) |
| CrLeafCnc | (0.276, 0.034); (0.512, 0.032); (0.749, 0.03); (0.985, 0.029); (1.222, 0.027); (1.458, 0.026); (1.695, 0.024); (1.931, 0.023) |
| CrRootCnc | (0.276, 0.045); (0.512, 0.04); (0.749, 0.036); (0.985, 0.032); (1.222, 0.029); (1.458, 0.026); (1.695, 0.023); (1.931, 0.021) |
| NfLeafCnc | (0.276, 0.01); (0.512, 0.009); (0.749, 0.009); (0.985, 0.008); (1.222, 0.007); (1.458, 0.007); (1.695, 0.006); (1.931, 0.006) |
| NfRootCnc | (0.276, 0.011); (0.512, 0.01); (0.749, 0.009); (0.985, 0.008); (1.222, 0.008); (1.458, 0.007); (1.695, 0.007); (1.931, 0.006) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0.55 |
| CStem | 0.0085 |
| CSOrg | 0.0038 |
| alpha | 0.25 |
| beta | 0.125 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Pea

Parent default, defined in lib/pea.dai. Pea

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.027 |
| TempEff1 | (0, 0); (4, 0.01); (19, 1); (24, 1); (30, 0.01) |
| PhotEff1 | (0, 0.1); (11, 0.1); (16, 1); (20, 1.2); (24, 1.2) |
| DSRate2 | 0.027 |
| TempEff2 | (0, 0); (16, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.04 |
| TempEff | (-20, 0.001); (0, 0.01); (5, 0.4); (10, 0.7); (15, 0.9); (20, 1); (25, 1); (30, 0.9); (35, 0.8); (40, 0.5); (45, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.033 |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.2, 0); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.8, 0); (2, 0) |
| SOrgPhotEff | 0.2 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARrel | 0.02 |
| PARref | 0.06 |
| PARext | 0.55 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| IntcpCap | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 85 |
| rootdens | SpRtLength 30, DensRtTip 0.1 |
| Rad | 0.035 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.75, 0.6); (0.91, 0.05); (2, 0.005) |
| Leaf | (0, 0.82); (0.25, 0.82); (0.51, 0.7); (1, 0.3); (1.2, 0); (2, 0) |
| Stem | (0, 0.18); (0.25, 0.18); (0.51, 0.3); (1, 0.2); (1.2, 0.1); (1.5, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.57 |
| r_Root | 0.025 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.1 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.5 |
| LfDR | (0, 0); (1.5, 0.01); (2, 0.03) |
| RtDR | (0, 0); (0.8, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| DS_fixate | 0.2 |
| fixate_factor | 0.8 |
| TLLeafEff | (1.09, 1); (2, 1) |
| PtRootCnc | (0, 0.02); (0.27, 0.02); (1.93, 0.02) |
| CrRootCnc | (0, 0.015); (0.27, 0.015); (1.93, 0.015) |
| NfRootCnc | (0, 0.01); (0.27, 0.01); (1.93, 0.01) |
| PtLeafCnc | (0, 0.06); (1, 0.06); (1.5, 0.025); (1.8, 0.02) |
| CrLeafCnc | (0, 0.02); (1, 0.02); (1.5, 0.016); (1.8, 0.012) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (1.5, 0.004); (1.8, 0.004) |
| PtStemCnc | (0, 0.03); (1, 0.025); (1.5, 0.015); (1.8, 0.011) |
| CrStemCnc | (0, 0.01); (1, 0.01); (1.5, 0.01); (1.8, 0.01) |
| NfStemCnc | (0, 0.004); (1, 0.004); (1.5, 0.004); (1.8, 0.004) |
| PtSOrgCnc | (0, 0.034); (1, 0.034); (2, 0.034) |
| CrSOrgCnc | (0, 0.02); (1, 0.02); (2, 0.02) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.81 |
| EconomicYield_N | 0.92 |

### Crop Green Pea

Parent Pea, defined in lib/pea.dai. Green Pea

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 1 |
| EconomicYield_N | 1 |

### Crop Potato; V1

Parent sold, defined in lib/potato-old.dai. Potato; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 485 |
| DSRate1 | 0.000909 |
| DSRate2 | 0.000909 |
| DS_Emr | 0.01 |
| DS_reset | false |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 4 |
| TLim2 | 10 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 5.1 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 1.545 |
| alpha | 0.3 |
| beta | 0.454 |
| SpLAI | 0.017 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.6 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 150 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.57, 0.05); (2, 0.05) |
| SOrg | (0, 0); (0.636, 0.85); (2, 0.85) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_SOrg | (0, 0.85); (2, 0.85) |
| E_Leaf | (0, 0.72); (2, 0.72) |
| r_Root | (0, 0.065); (2, 0.065) |
| r_SOrg | (0, 0.003); (2, 0.003) |
| r_Leaf | (0, 0.03); (2, 0.03) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 1 |
| PtLeafCnc | (0.364, 0.055); (0.491, 0.053); (0.618, 0.052); (0.745, 0.05); (0.873, 0.048); (1, 0.047); (1.127, 0.045); (1.255, 0.044); (1.382, 0.043); (1.509, 0.041); (1.636, 0.04) |
| PtRootCnc | (0.364, 0.02); (0.491, 0.019); (0.618, 0.019); (0.745, 0.018); (0.873, 0.018); (1, 0.017); (1.127, 0.017); (1.255, 0.016); (1.382, 0.016); (1.509, 0.015); (1.636, 0.015) |
| PtSOrgCnc | (0.364, 0.035); (0.491, 0.033); (0.618, 0.03); (0.745, 0.028); (0.873, 0.026); (1, 0.024); (1.127, 0.023); (1.255, 0.021); (1.382, 0.02); (1.509, 0.018); (1.636, 0.017) |
| CrLeafCnc | (0.364, 0.035); (0.491, 0.033); (0.618, 0.03); (0.745, 0.028); (0.873, 0.026); (1, 0.024); (1.127, 0.023); (1.255, 0.021); (1.382, 0.02); (1.509, 0.018); (1.636, 0.017) |
| CrRootCnc | (0.364, 0.012); (0.491, 0.012); (0.618, 0.011); (0.745, 0.011); (0.873, 0.01); (1, 0.01); (1.127, 0.009); (1.255, 0.009); (1.382, 0.009); (1.509, 0.008); (1.636, 0.008) |
| CrSOrgCnc | (0.364, 0.015); (0.491, 0.014); (0.618, 0.013); (0.745, 0.012); (0.873, 0.012); (1, 0.011); (1.127, 0.01); (1.255, 0.01); (1.382, 0.009); (1.509, 0.009); (1.636, 0.008) |
| NfLeafCnc | (0.364, 0.017); (0.491, 0.016); (0.618, 0.015); (0.745, 0.014); (0.873, 0.014); (1, 0.013); (1.127, 0.012); (1.255, 0.012); (1.382, 0.011); (1.509, 0.011); (1.636, 0.01) |
| NfRootCnc | (0.364, 0.01); (0.491, 0.009); (0.618, 0.009); (0.745, 0.008); (0.873, 0.008); (1, 0.007); (1.127, 0.007); (1.255, 0.006); (1.382, 0.006); (1.509, 0.005); (1.636, 0.005) |
| NfSOrgCnc | (0.364, 0.01); (0.491, 0.009); (0.618, 0.009); (0.745, 0.008); (0.873, 0.008); (1, 0.007); (1.127, 0.007); (1.255, 0.006); (1.382, 0.006); (1.509, 0.005); (1.636, 0.005) |

**Harvest**

| Parameter | Value |
|:--|:--|
| At | -0.0072 |
| Bt | 0.69 |
| beta | 0.075 |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| C_Leaf | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Potato; Koege

Parent default, defined in lib/potato.dai. Potato; Koege

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.007 |
| TempEff1 | -1. 0, 20. 1, 25. 0.5 |
| PhotEff1 | 1. 0, 12. 1, 16. 1, 24. 1 |
| DSRate2 | 0.007 |
| TempEff2 | 30. 1 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.8 |
| Qeff | 0.056 |
| TempEff | 5. 0, 10. 0.75, 20. 1, 30. 1, 40. 0.01, 50. 0 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.17 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.015 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsWStem | (0, 9999); (1, 9999) |
| HvsDS | (0, 1); (1, 40); (2, 40) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 70 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.4); (0.35, 0.1); (0.52, 0.1); (1.1, 0) |
| Leaf | (0, 0.7); (0.35, 0.36); (0.52, 0.08); (0.7, 0.07); (0.86, 0.05); (1.1, 0) |
| Stem | (0, 0.3); (0.35, 0.13); (0.52, 0.13); (0.7, 0.1); (0.86, 0.05); (1.1, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.2, 0); (0.25, 0.01); (0.8, 0.01); (1, 0.02); (2, 0.1) |
| RtDR | (0.2, 0); (0.5, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.005) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.004) |
| PtLeafCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrLeafCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrStemCnc | (0, 0.03); (1, 0.02); (2, 0.02) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| CrSOrgCnc | (0, 0.008); (1, 0.008); (2, 0.008) |
| NfSOrgCnc | (0, 0.005); (1, 0.005); (2, 0.005) |

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | CROP-SLOW |
| Stem | CROP-SLOW |
| Leaf | CROP-SLOW |
| SOrg | CROP-SLOW |
| Root | CROP-SLOW |
| DSmax | 0.8 |
| DSnew | 0.2 |
| sorg_height | -10 |

### Crop Potato; SCRI

Parent default, defined in lib/potato.dai. Potato; SCRI

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 425 |
| DS_Emr | 0.01 |
| DSRate1 | 0.07 |
| TempEff1 | (2, 0); (13, 1); (19, 1); (29, 0) |
| PhotEff1 | (12, 1); (16, 1) |
| DSRate2 | 0.009 |
| TempEff2 | (2, 0); (13, 1); (19, 1); (29, 0) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3 |
| DSEff | (0, 1.2); (0.3, 1.2); (1, 1); (1.6, 0.75); (2, 0.75) |
| Qeff | 0.045 |
| TempEff | (3, 0.01); (10, 0.75); (15, 1); (20, 1); (26, 0.75); (33, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.033 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.5 |
| EPext | 0.5 |
| HvsWStem | (0, 9999); (1, 9999) |
| HvsDS | (0, 1); (1, 20); (1.25, 35) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 20 |
| PenPar1 | 0.3 |
| PenPar2 | 4 |
| MaxPen | 50 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |
| rootdens | SpRtLength 200, DensRtTip 0.2 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.2); (1, 0.2); (1.36, 0) |
| Leaf | (0, 0.95); (1, 0.75); (1.05, 0.2); (1.25, 0.18); (1.6, 0) |
| Stem | (0, 0.05); (1, 0.25); (1.05, 0.5); (1.25, 0.2); (1.6, 0.03); (2, 0) |
| RSR | (0, 0.5); (0.75, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.72 |
| E_Leaf | 0.66 |
| E_Stem | 0.72 |
| E_SOrg | 0.85 |
| r_Root | 0.01 |
| r_Leaf | 0.03 |
| r_Stem | 0.015 |
| r_SOrg | 0.0045 |
| ShldResC | 0.1 |
| ReMobilDS | 1.5 |
| ReMobilRt | 0.01 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (1.6, 0); (1.75, 0.02); (2, 0.1) |
| RtDR | (0, 0); (1.6, 0); (2, 0) |
| ExfoliationFac | 0 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.06); (1.25, 0.05); (2, 0.035) |
| CrLeafCnc | (0, 0.045); (1, 0.045); (1.25, 0.04); (2, 0.03) |
| NfLeafCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| PtStemCnc | (0, 0.04); (1, 0.04); (1.6, 0.016); (2, 0.013) |
| CrStemCnc | (0, 0.012); (1.25, 0.012); (2, 0.01) |
| NfStemCnc | (0, 0.004); (2, 0.004) |
| PtSOrgCnc | (1, 0.02); (1.25, 0.015); (2, 0.012) |
| CrSOrgCnc | (1, 0.008); (1.25, 0.008); (2, 0.0075) |
| NfSOrgCnc | (1, 0.004); (2, 0.004) |
| TLLeafEff | (1.09, 1); (2, 1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -10 |

### Crop Potato; FertOrgaNic

Parent Potato; SCRI, defined in lib/potato.dai. Potato; FertOrgaNic

**Devel**

| Parameter | Value |
|:--|:--|
| DSRate1 | 0.06 |
| DSRate2 | 0.009 |

**Root**

| Parameter | Value |
|:--|:--|
| PenPar1 | 0.06 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.2); (1, 0.2); (1.36, 0) |
| Leaf | (0, 0.95); (1, 0.8); (1.05, 0.3); (1.25, 0.25); (1.4, 0) |
| Stem | (0, 0.05); (1, 0.2); (1.05, 0.45); (1.25, 0.05); (1.4, 0) |
| RSR | (0, 0.5); (0.75, 0.5); (2, 0.25) |
| nitrogen_stress_limit | 0.01 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.2 |
| SpLAIfac | (0, 100); (1, 100) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.02 |
| LeafAIMod | (1.5, 1); (2, 0.3) |

**Prod**

| Parameter | Value |
|:--|:--|
| LfDR | (0, 0); (1.5, 0); (1.6, 0.02); (2, 0.1) |
| ExfoliationFac | 0 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.06); (1, 0.05); (1.3, 0.04); (1.5, 0.025); (2, 0.02) |
| CrLeafCnc | (0, 0.045); (1, 0.04); (1.3, 0.03); (1.5, 0.02); (2, 0.01) |
| NfLeafCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| PtStemCnc | (0, 0.04); (1, 0.035); (1.3, 0.02); (1.5, 0.01); (2, 0.01) |
| CrStemCnc | (0, 0.02); (1, 0.015); (1.3, 0.01); (1.5, 0.005); (2, 0.005) |
| PtSOrgCnc | (0, 0.02); (1.3, 0.015); (2, 0.01) |
| CrSOrgCnc | (0, 0.008); (1.3, 0.008); (2, 0.007) |
| NH4_root_min | 1e-08 |
| NO3_root_min | 1e-08 |

### Crop Potato; Agria

Parent Potato; FertOrgaNic, defined in lib/potato.dai. Potato; Agria

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 260 |
| TempEff1 | (6.4, 0); (12, 1.9); (18, 0.4); (33, 0) |
| TempEff2 | (2, 0); (13, 1); (19, 1); (29, 1) |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.2); (1, 0.2); (1.36, 0) |
| Leaf | (0, 0.95); (1, 0.8); (1.05, 0.3); (1.25, 0.25); (1.4, 0) |
| Stem | (0, 0.05); (1, 0.2); (1.05, 0.15); (1.25, 0.02); (1.4, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.5 |

### Crop Potato; Folva

Parent Potato; FertOrgaNic, defined in lib/potato.dai. Potato; Folva

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 330 |
| DSRate1 | 0.055 |
| DSRate2 | 0.011 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4.8 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.5 |
| SpLAIfac | (0, 100); (1, 100) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.02 |
| LeafAIMod | (1.5, 1.1); (2, 0.3) |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.2); (1, 0.2); (1.36, 0) |
| Leaf | (0, 0.95); (1, 0.8); (1.05, 0.2); (1.25, 0.15); (1.35, 0) |
| Stem | (0, 0.05); (1, 0.2); (1.05, 0.35); (1.25, 0); (1.35, 0) |
| nitrogen_stress_limit | 0.01 |

**Prod**

| Parameter | Value |
|:--|:--|
| LfDR | (0, 0); (1.48, 0); (2, 0.1) |
| ExfoliationFac | 0 |

**Root**

| Parameter | Value |
|:--|:--|
| PenPar1 | 0.06 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.06); (1, 0.05); (1.3, 0.04); (1.5, 0.025); (2, 0.02) |
| CrLeafCnc | (0, 0.045); (1, 0.04); (1.3, 0.03); (1.5, 0.02); (2, 0.01) |
| NfLeafCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| PtStemCnc | (0, 0.04); (1, 0.035); (1.3, 0.02); (1.5, 0.01); (2, 0.01) |
| CrStemCnc | (0, 0.02); (1, 0.015); (1.3, 0.01); (1.5, 0.005); (2, 0.005) |
| PtSOrgCnc | (0, 0.02); (1.3, 0.015); (2, 0.01) |
| CrSOrgCnc | (0, 0.008); (1.3, 0.008); (2, 0.007) |
| NH4_root_min | 1e-08 |
| NO3_root_min | 1e-08 |

### Crop Potato; Triada

Parent Potato; FertOrgaNic, defined in lib/potato.dai. Potato; Triada

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 330 |
| TempEff2 | (15, 0.7); (20, 1.6); (25, 0.7) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 5 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.4 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.015 |
| LeafAIMod | (1, 1); (2, 0.62) |

**CrpN**

| Parameter | Value |
|:--|:--|
| NH4_root_min | 3e-05 |
| NO3_root_min | 3e-05 |

**Partit**

| Parameter | Value |
|:--|:--|
| Leaf | (0, 0.95); (1, 0.9); (1.05, 0.4); (1.25, 0.28); (1.4, 0) |
| Stem | (0, 0.05); (1, 0.1); (1.05, 0.35); (1.25, 0.02); (1.4, 0) |

**water_stress_effect**

| Parameter | Value |
|:--|:--|
| y_half | 0.75 |

### Crop Potato

Parent Potato; Folva, defined in lib/potato.dai. Potato; Folva

### Crop Rye

Parent default, defined in lib/rye.dai. Rye

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.02 |
| TempEff1 | -10. 0.01 |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.025 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.33 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.05 |
| TempEff | (-20, 0); (4, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| PARrel | 0.05 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.25); (1, 0.05); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.75); (0.62, 0.56); (0.77, 0.2); (0.95, 0.09); (1.14, 0); (1.38, 0); (2, 0) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.25); (0.62, 0.44); (0.77, 0.8); (0.95, 0.64); (1.14, 0.52); (1.38, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0 |
| LfDR | (0, 0); (0.05, 0.01); (0.2, 0); (0.25, 0.01); (0.9, 0.03); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.012); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.009) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0.34, 0.06); (0.5, 0.036); (1.28, 0.033); (1.52, 0.0288); (1.93, 0.0194) |
| CrLeafCnc | (0.34, 0.021); (0.5, 0.021); (1.28, 0.021); (1.52, 0.019); (1.93, 0.0183) |
| NfLeafCnc | (0.34, 0.008); (0.5, 0.008); (1.28, 0.008); (1.52, 0.008); (1.93, 0.008) |
| PtStemCnc | (0.5, 0.02); (1.12, 0.0125); (1.28, 0.0093); (1.53, 0.0085); (1.93, 0.0057) |
| CrStemCnc | (0.5, 0.0064); (1.12, 0.0049); (1.28, 0.0043); (1.53, 0.0041); (1.93, 0.0035) |
| NfStemCnc | (0.5, 0.003); (1.12, 0.003); (1.28, 0.003); (1.53, 0.003); (1.93, 0.003) |
| PtSOrgCnc | (1.12, 0.025); (2, 0.03) |
| CrSOrgCnc | (1.12, 0.015); (2, 0.015) |
| NfSOrgCnc | (1.12, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Ryegrass

Parent default, defined in lib/ryegrass.dai. Ryegrass

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 50 |
| DS_Emr | 0.01 |
| DSRate1 | 0.022 |
| TempEff1 | (-4, 0.02); (6, 0.2); (13, 0.7); (20, 1); (29, 1.2); (35, 1.2) |
| PhotEff1 | (0, 0.005); (11, 0.29); (12, 0.55); (13, 0.75); (15, 1); (16, 1); (17, 1.1); (18, 1.14); (20, 1.18); (28, 1.18) |
| DSRate2 | 0.02 |
| TempEff2 | (-4, 0.02); (5, 0.2); (14, 0.7); (20, 1); (29, 1.2); (35, 1.2) |
| defined_until_ds | 2. |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.33 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Qeff | 0.065 |
| Fm | 3.9 |
| TempEff | (-20, 0.0001); (1, 0.01); (4.5, 0.5); (7.5, 0.875); (8, 0.92); (10, 0.97); (12, 1); (16, 1); (20, 1); (23, 0.97); (29, 0.9); (33, 0.8); (35, 0.1); (37, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.3 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.014 |
| HvsDS | (0, 1); (0.2, 5); (0.4, 8.5); (0.6, 20); (1, 30); (1.3, 35); (2, 35) |
| LeafAIMod | (0, 1); (1, 1); (2, 0.7) |
| SpStemAI | 0.0035 |
| StemAIMod | (0, 1); (1, 1); (2, 0.7) |
| StemPhotEff | 0.7 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.3, 0.8 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| EpFac | 1 |
| IntcpCap | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 2 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 100 |
| rootdens | SpRtLength 108, DensRtTip 0.1 |
| Rad | 0.01 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| RSR | (0, 0.7); (1, 0.5); (2, 0.4) |
| Root | (0, 0.8); (0.33, 0.6); (0.53, 0.45); (1, 0.45); (2, 0.35) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.53, 0.83); (0.73, 0.56); (0.95, 0.35); (1.14, 0.28); (1.45, 0.23); (2, 0.2) |
| Stem | (0, 0.1); (0.33, 0.15); (0.53, 0.17); (0.73, 0.44); (0.95, 0.65); (1.14, 0.68); (1.45, 0.77); (2, 0.8) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.04 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.57 |
| r_Root | 0.01 |
| r_Leaf | 0.03 |
| r_Stem | 0.005 |
| r_SOrg | 0.005 |
| ShldResC | 0.1 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| LfDR | (0, 0); (0.5, 0.025); (2, 0.05) |
| RtDR | (0, 0); (0.5, 0.025); (2, 0.03) |
| Large_RtDR | 0.05 |
| RtDR_T_factor | (-5, 0); (5, 1) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.02) |
| CrRootCnc | (0, 0.015); (1, 0.012); (2, 0.0075) |
| NfRootCnc | (0, 0.012); (2, 0.001) |
| PtLeafCnc | (0, 0.04); (1, 0.03); (2, 0.025) |
| CrLeafCnc | (0, 0.02); (1, 0.015); (2, 0.012) |
| NfLeafCnc | (0, 0.015); (2, 0.01) |
| PtStemCnc | (0, 0.02); (1, 0.018); (2, 0.015) |
| CrStemCnc | (0, 0.015); (1, 0.01); (2, 0.01) |
| NfStemCnc | (0, 0.01); (2, 0.008) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (2, 0.014) |
| TLLeafEff | (0, 0.9); (2, 0.9) |
| TLRootEff | (0, 0.6); (2, 0.6) |

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | Ryegrass-SLOW |
| Stem | Ryegrass-SLOW |
| Leaf | Ryegrass-SLOW |
| SOrg | () |
| Root | () |
| DSmax | 2 |
| cut_delay | (1500, 1); (2000, 20); (7000, 45) |

### Crop Spring Barley; V1

Parent old, defined in lib/sbarley-old.dai. Spring Barley; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 160 |
| DSRate1 | 0.00129 |
| DSRate2 | 0.00129 |
| DS_Emr | 0.01 |
| DS_reset | false |
| TempEff1 | (0, 0); (100, 100) |
| TempEff2 | (0, 0); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 4 |
| TLim2 | 10 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 4.65 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 0.58 |
| alpha | 3 |
| beta | 1.87 |
| SpLAI | 0.02 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (1.067, 0.15); (2, 0.15) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (0, 0.72); (2, 0.72) |
| r_Root | (1.55, 0.065); (1.5501, 0.015) |
| r_Leaf | (1.55, 0.015); (1.5501, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.4 |
| PtRootCnc | (0.258, 0.0179); (0.387, 0.0164); (0.516, 0.015); (0.645, 0.0138); (0.774, 0.0127); (0.903, 0.0116); (1.032, 0.0106); (1.161, 0.0098) |
| CrRootCnc | (0.258, 0.0129); (0.387, 0.012); (0.516, 0.0112); (0.645, 0.0104); (0.774, 0.0097); (0.903, 0.009); (1.032, 0.0084); (1.161, 0.0078) |
| NfRootCnc | (0.258, 0.01); (0.387, 0.0095); (0.516, 0.009); (0.645, 0.0085); (0.774, 0.0081); (0.903, 0.0077); (1.032, 0.0073); (1.161, 0.0069) |
| PtLeafCnc | (0.258, 0.0493); (0.387, 0.0402); (0.516, 0.0328); (0.645, 0.0267); (0.774, 0.0218); (0.903, 0.0177); (1.032, 0.0145); (1.161, 0.0118) |
| CrLeafCnc | (0.258, 0.0297); (0.387, 0.0252); (0.516, 0.0215); (0.645, 0.0183); (0.774, 0.0155); (0.903, 0.0132); (1.032, 0.0112); (1.161, 0.0095) |
| NfLeafCnc | (0.258, 0.0198); (0.387, 0.017); (0.516, 0.0145); (0.645, 0.0124); (0.774, 0.0107); (0.903, 0.0091); (1.032, 0.0078); (1.161, 0.0067) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0.5 |
| CStem | 0.0065 |
| CSOrg | 0.00215 |
| alpha | 0.8 |
| beta | 0.09 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Spring Barley

Parent default, defined in lib/sbarley.dai. Spring Barley

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.032 |
| TempEff1 | (0, 0); (4, 0.01); (19, 1); (24, 1); (30, 0.01) |
| PhotEff1 | (0, 0.1); (11, 0.1); (16, 1); (20, 1.2); (24, 1.2) |
| DSRate2 | 0.021 |
| TempEff2 | (0, 0); (16, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.5 |
| Qeff | 0.04 |
| TempEff | -20. 0.001 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.031 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 75); (2, 75) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.65); (0.51, 0.55); (0.72, 0.15); (0.95, 0.05); (2, 0) |
| Leaf | (0, 1); (0.25, 0.7); (0.51, 0.55); (0.6, 0.5); (0.72, 0.23); (0.83, 0.01); (0.95, 0); (2, 0) |
| Stem | (0, 0); (0.25, 0.3); (0.51, 0.45); (0.6, 0.5); (0.72, 0.77); (0.83, 0.99); (0.95, 1); (1.51, 0); (2, 0) |
| RSR | (0, 0.5); (0.75, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.7 |
| LfDR | (0, 0); (0.5, 0); (1.2, 0.01); (2, 0.08) |
| RtDR | (0, 0); (0.2, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.03); (2, 0.02) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Spring Barley; Foulum

Parent Spring Barley, defined in lib/sbarley.dai. Spring Barley; Foulum

**Devel**

| Parameter | Value |
|:--|:--|
| DSRate2 | 0.025 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.023 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.7, 1); (2, 0) |
| SOrgPhotEff | 0.5 |

**Prod**

| Parameter | Value |
|:--|:--|
| CH2OReleaseRate | 0.03 |
| ShldResC | 0.4 |
| ReMobilDS | 1 |
| ReMobilRt | 0.05 |
| ExfoliationFac | 0.7 |
| LfDR | (0, 0); (1, 0); (1.2, 0.02); (1.3, 0.08); (2, 0.1) |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.65); (0.51, 0.55); (0.72, 0.15); (0.95, 0.02); (2, 0) |
| Leaf | (0, 1); (0.25, 0.7); (0.51, 0.55); (0.6, 0.5); (0.72, 0.23); (0.83, 0.01); (0.95, 0); (2, 0) |
| Stem | (0, 0); (0.25, 0.3); (0.51, 0.45); (0.6, 0.5); (0.72, 0.77); (0.83, 0.99); (0.95, 1); (1.21, 0); (2, 0) |
| RSR | (0, 0.5); (0.75, 0.25); (2, 0.25) |

**Root**

| Parameter | Value |
|:--|:--|
| MxNH4Up | 5e-07 |
| MxNO3Up | 2.5e-07 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.06); (0.8, 0.04); (2, 0.02) |
| CrLeafCnc | (0, 0.03); (0.8, 0.03); (2, 0.015) |
| NfLeafCnc | (0, 0.004); (0.8, 0.004); (2, 0.004) |
| PtStemCnc | (0.5, 0.06); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0.5, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0.5, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

### Crop Sugar Beet

Parent default, defined in lib/sbeet.dai. Sugar Beet

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.007 |
| TempEff1 | (-1, 0); (0, 0.01); (5, 0.5); (20, 1); (25, 0.5) |
| PhotEff1 | (1, 0); (12, 1); (16, 1); (24, 1) |
| DSRate2 | 0 |
| TempEff2 | (0, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 3.8 |
| Qeff | 0.056 |
| TempEff | (-20, 0); (5, 0); (10, 0.75); (20, 1); (30, 1); (40, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.17 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.015 |
| LAIDist0 | 0, 1, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 40); (2, 40) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 200 |
| SpRtLength | 100 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.4); (0.35, 0.1); (0.52, 0.1); (1.1, 0) |
| Leaf | (0, 0.7); (0.35, 0.36); (0.52, 0.08); (0.7, 0.07); (0.86, 0.05); (1.1, 0) |
| Stem | (0, 0.3); (0.35, 0.13); (0.52, 0.13); (0.7, 0.1); (0.86, 0.05); (1.1, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.09, 0); (0.1, 0.01); (0.15, 0.01); (1, 0.02); (2, 0.1) |
| RtDR | (0, 0); (0.2, 0); (0.5, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.03); (2, 0.02) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

### Crop Spring Rape; V1

Parent old, defined in lib/srape-old.dai. Spring Rape; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 110 |
| DSRate1 | 0.0011 |
| DSRate2 | 0.0011 |
| DS_Emr | 0.01 |
| DS_reset | false |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 6 |
| TLim2 | 12 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 4.32 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 0.5 |
| alpha | 1.2 |
| beta | 0.44 |
| SpLAI | 0.018 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (1, 0.15); (2, 0.15) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (0, 0.65); (2, 0.65) |
| r_Root | (1, 0.065); (1.0001, 0.015) |
| r_Leaf | (1, 0.025); (1.0001, 0.015) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.02 |
| PtLeafCnc | (0.306, 0.07); (0.419, 0.061); (0.533, 0.054); (0.647, 0.047); (0.761, 0.042); (0.875, 0.036); (0.989, 0.032); (1.103, 0.028); (1.217, 0.025); (1.331, 0.022); (1.444, 0.019) |
| PtRootCnc | (0.306, 0.02); (0.419, 0.019); (0.533, 0.017); (0.647, 0.016); (0.761, 0.015); (0.875, 0.014); (0.989, 0.013); (1.103, 0.012); (1.217, 0.011); (1.331, 0.011); (1.444, 0.01) |
| CrLeafCnc | (0.306, 0.03); (0.419, 0.027); (0.533, 0.024); (0.647, 0.022); (0.761, 0.019); (0.875, 0.017); (0.989, 0.016); (1.103, 0.014); (1.217, 0.012); (1.331, 0.011); (1.444, 0.01) |
| CrRootCnc | (0.306, 0.013); (0.419, 0.012); (0.533, 0.012); (0.647, 0.011); (0.761, 0.011); (0.875, 0.01); (0.989, 0.01); (1.103, 0.009); (1.217, 0.009); (1.331, 0.008); (1.444, 0.008) |
| NfLeafCnc | (0.306, 0.02); (0.419, 0.018); (0.533, 0.016); (0.647, 0.015); (0.761, 0.013); (0.875, 0.012); (0.989, 0.011); (1.103, 0.01); (1.217, 0.009); (1.331, 0.008); (1.444, 0.007) |
| NfRootCnc | (0.306, 0.01); (0.419, 0.01); (0.533, 0.009); (0.647, 0.009); (0.761, 0.009); (0.875, 0.008); (0.989, 0.008); (1.103, 0.008); (1.217, 0.008); (1.331, 0.007); (1.444, 0.007) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0.3 |
| CStem | 0.0045 |
| CSOrg | 0.00375 |
| alpha | 1 |
| beta | 0.1 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| DSmax | 0 |
| DSnew | 0 |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Spring Rape

Parent default, defined in lib/srape.dai. Spring Rape

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 125 |
| DS_Emr | 0.01 |
| DSRate1 | 0.035 |
| TempEff1 | (0, 0); (4, 0.01); (19, 1); (24, 1); (30, 0.01) |
| PhotEff1 | 11. 0.1 |
| DSRate2 | 0.0225 |
| TempEff2 | 16. 1 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.05 |
| TempEff | -20. 0, 6. 0.001, 12. 1, 25. 1, 35. 0.01, 50. 0 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.025 |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.5, 1); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.4, 1); (2, 0) |
| SOrgPhotEff | 0.25 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.7 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 50); (2, 80) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.65); (0.51, 0.55); (0.72, 0.15); (0.95, 0.05); (2, 0) |
| Leaf | (0, 0.9); (0.25, 0.8); (0.51, 0.7); (0.6, 0.6); (0.72, 0.4); (0.83, 0.2); (0.95, 0.1); (1.51, 0.1); (2, 0) |
| Stem | (0, 0.1); (0.25, 0.2); (0.51, 0.3); (0.6, 0.4); (0.72, 0.6); (0.83, 0.8); (0.95, 0.9); (1.1, 0.5); (1.2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.5 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.03 |
| ShldResC | 0.3 |
| ReMobilDS | 1.18 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.25, 0); (0.5, 0.005); (1, 0.01); (1.05, 0.03); (1.1, 0.03) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.005); (2, 0.01) |
| ExfoliationFac | 0.9 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.06); (2, 0.06) |
| CrLeafCnc | (0, 0.044); (1, 0.044); (2, 0.044) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0.65, 0.05); (0.8, 0.035); (1, 0.02); (1.6, 0.01); (2, 0.008) |
| CrStemCnc | (0.65, 0.03); (0.8, 0.02); (1.09, 0.01); (1.6, 0.008); (2, 0.006) |
| NfStemCnc | (0.65, 0.004); (0.8, 0.004); (1.09, 0.004); (1.6, 0.004); (2, 0.004) |
| PtSOrgCnc | (1.09, 0.05); (1.4, 0.025); (2, 0.025) |
| CrSOrgCnc | (1.09, 0.037); (1.4, 0.02); (2, 0.02) |
| NfSOrgCnc | (1.09, 0.004); (1.4, 0.004); (2, 0.004) |
| TLLeafEff | (1.09, 1); (1.4, 1); (2, 1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.58 |
| EconomicYield_N | 0.82 |

### Crop Sugar Beet

Parent default, defined in lib/sugarbeet.dai. Sugar Beet

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 325 |
| DS_Emr | 0.01 |
| DSRate1 | 0.005 |
| TempEff1 | -1. 0, 20. 1, 25. 0.5 |
| PhotEff1 | 3. 0, 8. 1, 16. 1, 24. 1 |
| DSRate2 | 0.007 |
| TempEff2 | 30. 1 |
| defined_until_ds | 0.8 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 7 |
| Qeff | 0.056 |
| TempEff | 5. 0, 10. 0.75, 20. 1, 30. 1, 40. 0.01, 50. 0 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.17 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.012 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0.1, 0.8, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.02, 4); (0.08, 10); (0.14, 30); (0.21, 40); (0.27, 55) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.2 |
| PenPar2 | 4 |
| MaxPen | 200 |
| Rad | 0.05 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.25); (0.08, 0.2); (0.14, 0.1); (0.27, 0.07); (0.34, 0.06) |
| Leaf | (0, 0.7); (0.35, 0.3); (0.52, 0.08); (0.7, 0.07); (0.86, 0.05); (1.1, 0) |
| Stem | (0, 0); (1, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.66 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.05 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.2, 0); (0.25, 0.01); (0.8, 0.01); (1, 0); (2, 0) |
| RtDR | (0.2, 0); (0.5, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.005) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.004) |
| PtLeafCnc | (0, 0.04); (1, 0.035); (2, 0.02) |
| CrLeafCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrStemCnc | (0, 0.03); (1, 0.02); (2, 0.02) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.01); (1, 0.01); (2, 0.01) |
| CrSOrgCnc | (0, 0.008); (1, 0.008); (2, 0.008) |
| NfSOrgCnc | (0, 0.005); (1, 0.005); (2, 0.005) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |
| sorg_height | -15 |

### Crop Spring Wheat

Parent default, defined in lib/swheat.dai. Spring Wheat

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.04 |
| TempEff1 | (0, 0); (4, 0.01); (19, 1); (24, 1); (30, 0.01) |
| PhotEff1 | (0, 0.1); (11, 0.1); (16, 1); (20, 1.2); (24, 1.2) |
| DSRate2 | 0.025 |
| TempEff2 | (0, 0); (16, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.05 |
| TempEff | (-20, 0.001); (0, 0.01); (5, 0.4); (10, 0.7); (15, 0.9); (20, 1); (25, 1); (30, 0.9); (35, 0.8); (40, 0.5); (45, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.031 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.65); (0.51, 0.55); (0.72, 0.15); (0.95, 0.05); (2, 0) |
| Leaf | (0, 0.82); (0.25, 0.7); (0.51, 0.55); (0.6, 0.5); (0.72, 0.23); (0.83, 0.01); (0.95, 0); (2, 0) |
| Stem | (0, 0.18); (0.25, 0.3); (0.51, 0.45); (0.6, 0.5); (0.72, 0.77); (0.83, 0.99); (0.95, 1); (1.51, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.016 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.5, 0.02); (1, 0.01); (2, 0.2) |
| RtDR | (0, 0); (0.2, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.03); (2, 0.02) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

### Crop Winter Barley; V1

Parent old, defined in lib/wbarley-old.dai. Winter Barley; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 80 |
| DSRate1 | 0.00163 |
| DSRate2 | 0.00163 |
| DS_Emr | 0.01 |
| DS_reset | true |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 4 |
| TLim2 | 10 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 3.67 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 0.53 |
| alpha | 1.8 |
| beta | 1.1755 |
| SpLAI | 0.014 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.608, 0.1); (2, 0.1) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (0, 0.72); (2, 0.72) |
| r_Root | (0.898, 0.065); (0.8981, 0.015) |
| r_Leaf | (0.898, 0.015); (0.8981, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.4 |
| PtLeafCnc | (0.163, 0.05); (0.347, 0.04); (0.531, 0.031); (0.714, 0.025); (0.898, 0.02); (1.082, 0.016); (1.265, 0.013) |
| PtRootCnc | (0.163, 0.018); (0.347, 0.016); (0.531, 0.015); (0.714, 0.013); (0.898, 0.012); (1.082, 0.011); (1.265, 0.01) |
| CrLeafCnc | (0.163, 0.03); (0.347, 0.025); (0.531, 0.021); (0.714, 0.017); (0.898, 0.014); (1.082, 0.012); (1.265, 0.01) |
| CrRootCnc | (0.163, 0.013); (0.347, 0.012); (0.531, 0.011); (0.714, 0.01); (0.898, 0.009); (1.082, 0.009); (1.265, 0.008) |
| NfLeafCnc | (0.163, 0.02); (0.347, 0.017); (0.531, 0.014); (0.714, 0.012); (0.898, 0.01); (1.082, 0.008); (1.265, 0.007) |
| NfRootCnc | (0.163, 0.01); (0.347, 0.009); (0.531, 0.009); (0.714, 0.008); (0.898, 0.008); (1.082, 0.007); (1.265, 0.007) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0.45 |
| CStem | 0.0065 |
| CSOrg | 0.00215 |
| alpha | 0.8 |
| beta | 0.09 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| DSmax | 0 |
| DSnew | 0 |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Winter Barley

Parent default, defined in lib/wbarley.dai. Winter Barley

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 200 |
| DS_Emr | 0.01 |
| DSRate1 | 0.025 |
| TempEff1 | -10. 0.01 |
| PhotEff1 | (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.03 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.25 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.05 |
| TempEff | (-20, 0); (2, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 100); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.25); (1, 0.05); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.75); (0.62, 0.56); (0.77, 0.2); (0.95, 0.09); (1.14, 0.05); (1.38, 0); (2, 0) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.25); (0.62, 0.44); (0.77, 0.8); (0.95, 0.64); (1.14, 0.62); (1.38, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.05, 0.01); (0.2, 0); (0.25, 0.01); (0.9, 0.03); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.03); (2, 0.02) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Winter Barley; Koge

Parent default, defined in lib/wbarley.dai. Winter Barley; Koge

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 200 |
| DS_Emr | 0.01 |
| DSRate1 | 0.022 |
| TempEff1 | -10. 0.01 |
| PhotEff1 | (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.028 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.85 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4 |
| Qeff | 0.05 |
| TempEff | (-20, 0); (2, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| PARrel | 0.07 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 90); (2, 90) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.32, 0.5); (0.6, 0.25); (1, 0); (2, 0) |
| Leaf | (0, 0.9); (0.19, 0.83); (0.26, 0.85); (0.45, 0.82); (0.6, 0.32); (0.86, 0.15); (1, 0.26); (1.26, 0); (1.5, 0); (2, 0) |
| Stem | (0, 0.1); (0.19, 0.17); (0.26, 0.15); (0.45, 0.18); (0.6, 0.68); (0.86, 0.85); (1, 0.34); (1.26, 0.27); (1.5, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.75 |
| LfDR | (0.9, 0); (1.2, 0.03); (2, 0.15) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.02); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.008); (2, 0.008) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0, 0.06); (1, 0.04); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.03); (2, 0.02) |
| NfLeafCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.01) |
| CrStemCnc | (0, 0.01); (1, 0.01); (2, 0.006) |
| NfStemCnc | (0, 0.004); (1, 0.004); (2, 0.004) |
| PtSOrgCnc | (0, 0.024); (1, 0.024); (2, 0.024) |
| CrSOrgCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfSOrgCnc | (0, 0.014); (1, 0.014); (2, 0.014) |

### Crop Winter Barley; Foulum

Parent Winter Barley, defined in lib/wbarley.dai. Winter Barley; Foulum

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| ShldResC | 0.3 |
| ReMobilDS | 1.2 |
| ReMobilRt | 0.05 |
| Large_RtDR | 0.05 |
| LfDR | (0, 0); (0.05, 0.01); (0.2, 0); (0.25, 0.01); (0.9, 0.03); (2, 0.1) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.012); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.009) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0.34, 0.06); (0.5, 0.036); (1.28, 0.032); (1.52, 0.0288); (1.93, 0.0194) |
| CrLeafCnc | (0.34, 0.021); (0.5, 0.021); (1.28, 0.021); (1.52, 0.019); (1.93, 0.0183) |
| NfLeafCnc | (0.34, 0.008); (0.5, 0.008); (1.28, 0.008); (1.52, 0.008); (1.93, 0.008) |
| PtStemCnc | (0.5, 0.02); (1.12, 0.0125); (1.28, 0.0093); (1.53, 0.0085); (1.93, 0.0085) |
| CrStemCnc | (0.5, 0.0064); (1.12, 0.006); (1.28, 0.006); (1.53, 0.006); (1.93, 0.006) |
| NfStemCnc | (0.5, 0.004); (1.12, 0.004); (1.28, 0.004); (1.53, 0.004); (1.93, 0.004) |
| PtSOrgCnc | (1.12, 0.015); (2, 0.023) |
| CrSOrgCnc | (1.12, 0.014); (2, 0.017) |
| NfSOrgCnc | (1.12, 0.013); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Wclover

Parent default, defined in lib/wclover.dai. v.30 Developed by Henning Hoegh Jensen

min_light_fraction: 0.01.

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 50 |
| DS_Emr | 0.05 |
| DSRate1 | 0.025 |
| TempEff1 | (0, 0.001); (4, 0.005); (11, 0.35); (17, 0.7); (20, 0.8); (32, 1); (39, 1.2) |
| PhotEff1 | (0, 0.1); (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.02 |
| TempEff2 | (0, 0.001); (5, 0.015); (14, 0.4); (20, 0.8); (24, 0.9); (29, 1); (39, 1.2) |
| defined_until_ds | 2 |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.33 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Qeff | 0.06 |
| Fm | 1.8 |
| TempEff | (-20, 0.0001); (6.5, 0.1); (8, 0.3); (12, 0.8); (16, 1); (20, 1); (33, 1); (37, 0.03); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.3 |
| SpLAIfac | (0, 100); (1, 100) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.0175 |
| HvsDS | (0, 1); (0.25, 5); (0.4, 8); (0.7, 16); (1, 22); (2, 30) |
| LeafAIMod | (0, 1); (1, 1); (2, 0.75) |
| SpStemAI | 0.003 |
| StemAIMod | (0, 1); (1, 1); (2, 1) |
| StemPhotEff | 1 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.6, 0.9 |
| PARref | 0.06 |
| PARext | 0.7 |
| EPext | 0.8 |
| EpFac | 1 |
| IntcpCap | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 2 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 100 |
| rootdens | SpRtLength 90, DensRtTip 0.1 |
| Rad | 0.014 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 1e-11 |
| MxNO3Up | 1e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| RSR | (0, 0.5); (1, 0.3); (2, 0.2) |
| Root | (0, 0.95); (0.33, 0.95); (0.53, 0.85); (1, 0.75); (2, 0.5) |
| Leaf | (0, 0.65); (0.33, 0.55); (0.43, 0.5); (0.63, 0.4); (0.95, 0.25); (1.2, 0.2); (1.45, 0.12); (2, 0) |
| Stem | (0, 0.35); (0.33, 0.45); (0.43, 0.5); (0.63, 0.6); (0.95, 0.75); (1.2, 0.7); (1.45, 0.6); (2, 0) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.04 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.57 |
| r_Root | 0.025 |
| r_Leaf | 0.03 |
| r_Stem | 0.005 |
| r_SOrg | 0.005 |
| ShldResC | 0.3 |
| ReMobilDS | 1 |
| ReMobilRt | 0.1 |
| LfDR | (0, 0); (0.8, 0.004); (1, 0.01); (1.4, 0.1); (2, 0.25) |
| RtDR | (0, 0); (0.5, 0); (0.7, 0.01); (2, 0.15) |
| Large_RtDR | 0.03 |
| RtDR_T_factor | (0, 0); (5, 1) |

**CrpN**

| Parameter | Value |
|:--|:--|
| DS_fixate | 0.1 |
| DS_cut_fixate | 0.15 |
| fixate_factor | 0.02 |
| PtRootCnc | (0, 0.025); (1, 0.025); (2, 0.025) |
| CrRootCnc | (0, 0.015); (1, 0.013); (2, 0.011) |
| NfRootCnc | (0, 0.008); (2, 0.008) |
| PtLeafCnc | (0, 0.048); (1, 0.046); (2, 0.043) |
| CrLeafCnc | (0, 0.035); (1, 0.035); (2, 0.035) |
| NfLeafCnc | (0, 0.03); (2, 0.03) |
| PtStemCnc | (0, 0.02); (1, 0.02); (2, 0.02) |
| CrStemCnc | (0, 0.016); (1, 0.016); (2, 0.016) |
| NfStemCnc | (0, 0.015); (1, 0.015); (2, 0.015) |
| PtSOrgCnc | (0, 0.03); (1, 0.03); (2, 0.03) |
| CrSOrgCnc | (0, 0.028); (1, 0.028); (2, 0.028) |
| NfSOrgCnc | (0, 0.022); (2, 0.022) |
| TLLeafEff | (0, 0.9); (2, 0.9) |
| TLRootEff | (0, 0.1); (2, 0.1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | Wclover-SLOW |
| Stem | Wclover-SLOW |
| Leaf | Wclover-SLOW |
| SOrg | Wclover-SLOW initial_fraction 0.9 |
| Root | Wclover-SLOW |
| DSmax | 2 |
| DSnew | 0.27 |
| cut_delay | (500, 10); (1000, 35); (2000, 45); (7000, 75) |

### Crop White cabbage

Parent default, defined in lib/whitecabbage.dai. White cabbage

**Devel**

| Parameter | Value |
|:--|:--|
| defined_until_ds | 1.1 |
| EmrTSum | 200 |
| DSRate1 | 0.0061 |
| TempEff1 | (0, 0); (5, 0); (15, 1); (20, 1); (28, 0) |
| PhotEff1 | (0, 0); (8, 1); (16, 1); (24, 0.8) |
| DSRate2 | 0.007 |
| TempEff2 | (0, 1); (30, 1) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 4.4 |
| Qeff | 0.045 |
| TempEff | (0, 0.01); (5, 0.01); (15, 1); (20, 1); (25, 0.8); (35, 0.01) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |
| SpLAIfac | (0, 3); (0.15, 1.5); (0.3, 1.25); (0.45, 1); (1, 1) |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.012 |
| SpSOrgAI | 0.0012 |
| SpStemAI | 0 |
| LAIDist0 | 0, 0.1, 1 |
| LAIDist1 | 0, 0.1, 1 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |
| PARrel | 0.05 |
| HvsDS | (0, 0); (0.6, 50); (1, 50) |
| HvsWStem | (0, 0.1); (100, 1) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 5 |
| PenPar1 | 0.21 |
| PenPar2 | 4 |
| MaxPen | 240 |
| Rad | 0.05 |
| h_wp | -15000 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 3.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.3); (0.15, 0.15); (0.3, 0.15); (0.5, 0.1); (0.75, 0.1); (1, 0.1); (1.1, 0.1) |
| Leaf | (0, 0.8); (0.15, 0.65); (0.3, 0.45); (0.5, 0.25); (0.75, 0.15); (1, 0.05); (1.1, 0.05) |
| Stem | (0, 0.2); (0.15, 0.35); (0.3, 0.2); (0.5, 0.2); (0.75, 0.1); (1, 0.05); (1.1, 0.05) |
| RSR | (0, 0.5); (1, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_SOrg | 0.025 |
| r_Root | 0.015 |
| r_Leaf | 0.03 |
| r_Stem | 0.01 |
| ShldResC | 0.3 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 1 |
| LfDR | (0, 0); (0.5, 0); (0.75, 0); (1, 0.01) |
| RtDR | (0, 0); (0.5, 0); (0.75, 0); (1, 0.005) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.03); (1, 0.02); (2, 0.02) |
| CrRootCnc | (0, 0.015); (1, 0.01); (2, 0.01) |
| NfRootCnc | (0, 0.01); (1, 0.0075); (2, 0.0075) |
| PtLeafCnc | (0, 0.04); (1, 0.03); (2, 0.03) |
| CrLeafCnc | (0, 0.03); (1, 0.015); (2, 0.015) |
| NfLeafCnc | (0, 0.0125); (1, 0.01); (2, 0.01) |
| PtStemCnc | (0, 0.04); (1, 0.03); (2, 0.03) |
| CrStemCnc | (0, 0.03); (1, 0.015); (2, 0.015) |
| NfStemCnc | (0, 0.0125); (1, 0.01); (2, 0.01) |
| PtSOrgCnc | (0, 0.03); (1, 0.025); (2, 0.025) |
| CrSOrgCnc | (0, 0.0175); (1, 0.015); (2, 0.015) |
| NfSOrgCnc | (0, 0.01); (1, 0.0075); (2, 0.0075) |

**Harvest**

| Parameter | Value |
|:--|:--|
| DSmax | 0 |

### Crop White cabbage - transplanted

Parent White cabbage, defined in lib/whitecabbage.dai. White cabbage - transplanted

**Devel**

| Parameter | Value |
|:--|:--|
| DS | 0.1 |

**Prod**

| Parameter | Value |
|:--|:--|
| CH2OPool | 0.05 |
| NCrop | 0.02 |
| WLeaf | 0.28 |
| WRoot | 0.1 |
| WStem | 0.12 |

**Root**

| Parameter | Value |
|:--|:--|
| Depth | 5 |

**Harvest**

| Parameter | Value |
|:--|:--|
| production_delay | 14 |

### Crop Winter Rape; V1

Parent old, defined in lib/wrape-old.dai. Winter Rape; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 175 |
| DSRate1 | 0.00129 |
| DSRate2 | 0.00129 |
| DS_Emr | 0.01 |
| DS_reset | true |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 2 |
| TLim2 | 6 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 3.22 |
| DSinit | 0.07 |
| WLfInit | 20 |
| DS1 | 0.516 |
| alpha | 1.8 |
| beta | 1.096 |
| SpLAI | 0.0092 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 4 |
| PenPar1 | 0.2 |
| PenPar2 | 2 |
| MaxPen | 130 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.011 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.4); (0.338, 0.25); (2, 0.25) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (1.032, 0.65); (1.033, 0.55) |
| r_Root | (1.032, 0.065); (1.033, 0.03) |
| r_Leaf | (1.032, 0.025); (1.033, 0.015) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.02 |
| PtLeafCnc | (0.065, 0.055); (0.227, 0.047); (0.389, 0.04); (0.551, 0.034); (0.713, 0.029); (0.876, 0.025); (1.038, 0.021); (1.2, 0.018) |
| PtRootCnc | (0.065, 0.03); (0.227, 0.028); (0.389, 0.026); (0.551, 0.024); (0.713, 0.022); (0.876, 0.021); (1.038, 0.019); (1.2, 0.018) |
| CrLeafCnc | (0.065, 0.032); (0.227, 0.029); (0.389, 0.027); (0.551, 0.024); (0.713, 0.022); (0.876, 0.02); (1.038, 0.019); (1.2, 0.017) |
| CrRootCnc | (0.065, 0.015); (0.227, 0.015); (0.389, 0.014); (0.551, 0.014); (0.713, 0.013); (0.876, 0.013); (1.038, 0.012); (1.2, 0.012) |
| NfLeafCnc | (0.065, 0.01); (0.227, 0.009); (0.389, 0.009); (0.551, 0.008); (0.713, 0.007); (0.876, 0.007); (1.038, 0.006); (1.2, 0.006) |
| NfRootCnc | (0.065, 0.01); (0.227, 0.009); (0.389, 0.009); (0.551, 0.008); (0.713, 0.007); (0.876, 0.007); (1.038, 0.006); (1.2, 0.006) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0.35 |
| CStem | 0.0092 |
| CSOrg | 0.00365 |
| alpha | 1 |
| beta | 0.1 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| DSmax | 0 |
| DSnew | 0 |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Winter Rape

Parent default, defined in lib/wrape.dai. Winter Rape

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 180 |
| DS_Emr | 0.01 |
| DSRate1 | 0.03 |
| TempEff1 | -10. 0.01, 20. 0.9, 25. 1, 35. 1.2 |
| PhotEff1 | 10. 0.29, 11. 0.55, 12. 0.75, 13. 0.89, 14. 1, 15. 1.08, 16. 1.14, 17. 1.18, 24. 1.18 |
| DSRate2 | 0.025 |
| TempEff2 | 10. 0.14, 15. 0.66, 20. 1, 25. 1.23 |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.33 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 6 |
| Qeff | 0.05 |
| TempEff | -20. 0, 2. 0, 10. 1, 25. 1, 35. 0.01, 50. 0 |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.25 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.02 |
| LeafAIMod | (0); (2, 1) |
| SpStemAI | 0.005 |
| StemAIMod | (0, 1); (1.6, 1); (2, 0) |
| StemPhotEff | 0.2 |
| SpSOrgAI | 0.005 |
| SOrgAIMod | (0, 1); (1.4, 1); (2, 0) |
| SOrgPhotEff | 0.25 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.7 |
| EPext | 0.5 |
| HvsDS | (0, 1); (0.34, 5); (0.45, 10); (0.69, 50); (1, 160); (2, 160) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.25); (0.66, 0.15); (1, 0.07); (2, 0.07) |
| Leaf | (0, 0.95); (0.33, 0.95); (0.43, 0.9); (0.53, 0.75); (0.62, 0.56); (0.77, 0.2); (0.95, 0.09); (1.14, 0.05); (1.18, 0); (2, 0) |
| Stem | (0, 0.05); (0.33, 0.05); (0.43, 0.1); (0.53, 0.25); (0.62, 0.44); (0.77, 0.8); (0.95, 0.64); (1.14, 0.22); (1.18, 0); (2, 0) |
| RSR | (0, 0.5); (1, 0.25); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.2 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.5 |
| r_Root | 0.015 |
| r_Leaf | 0.06 |
| r_Stem | 0.01 |
| r_SOrg | 0.03 |
| ShldResC | 0 |
| ReMobilDS | 1.18 |
| ReMobilRt | 0.1 |
| Large_RtDR | 0.05 |
| LfDR | (0.09, 0); (0.1, 0.01); (0.15, 0.005); (1, 0.005); (1.05, 0.2); (1.2, 0.1); (1.25, 0.05); (2, 0.02) |
| RtDR | (0.6, 0); (1.7, 0); (2, 0.005) |
| ExfoliationFac | 0.9 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0.33, 0.033); (0.41, 0.02); (0.58, 0.023); (1.4, 0.01); (2, 0.01) |
| CrRootCnc | (0.33, 0.008); (0.41, 0.008); (0.58, 0.008); (1.4, 0.008); (2, 0.008) |
| NfRootCnc | (0.33, 0.007); (0.41, 0.007); (0.58, 0.007); (1.4, 0.007); (2, 0.007) |
| PtLeafCnc | (0.33, 0.06); (0.41, 0.06); (0.65, 0.06); (0.8, 0.06); (1.09, 0.06); (1.4, 0.035); (2, 0.03) |
| CrLeafCnc | (0.33, 0.044); (0.41, 0.044); (0.65, 0.044); (0.8, 0.044); (1.09, 0.044); (1.4, 0.026); (2, 0.023) |
| NfLeafCnc | (0.33, 0.004); (0.41, 0.004); (0.65, 0.004); (0.8, 0.004); (1.09, 0.004); (1.4, 0.004); (2, 0.004) |
| PtStemCnc | (0.65, 0.05); (0.8, 0.035); (1.09, 0.02); (1.6, 0.011); (2, 0.008) |
| CrStemCnc | (0.65, 0.03); (0.8, 0.02); (1.09, 0.01); (1.6, 0.008); (2, 0.006) |
| NfStemCnc | (0.65, 0.004); (0.8, 0.004); (1.09, 0.004); (1.6, 0.004); (2, 0.004) |
| PtSOrgCnc | (1.09, 0.05); (1.4, 0.025); (2, 0.025) |
| CrSOrgCnc | (1.09, 0.037); (1.4, 0.02); (2, 0.02) |
| NfSOrgCnc | (1.09, 0.004); (1.4, 0.004); (2, 0.004) |
| TLLeafEff | (1.09, 1); (1.4, 1); (2, 1) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.58 |
| EconomicYield_N | 0.82 |

### Crop Winter Wheat; V1

Parent old, defined in lib/wwheat-old.dai. Winter Wheat; V1

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DSRate1 | 0.00114 |
| DSRate2 | 0.00114 |
| DS_Emr | 0.01 |
| DS_reset | true |
| TempEff1 | (0, 1); (100, 100) |
| TempEff2 | (0, 1); (100, 100) |
| PhotEff1 | (0, 1); (1, 1) |

**Vernal**

| Parameter | Value |
|:--|:--|
| required | false |
| DSLim1 | 0 |
| DSLim2 | 0 |
| TaLim | 0 |
| TaSum | 0 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| TLim1 | 4 |
| TLim2 | 10 |

**Canopy**

| Parameter | Value |
|:--|:--|
| InitGrowth | 4.66 |
| DSinit | 0.07 |
| WLfInit | 30 |
| DS1 | 0.514 |
| alpha | 1.8 |
| beta | 1.1428 |
| SpLAI | 0.014 |
| HvsDS | (0, 1); (1, 100); (2, 100) |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| EPext | 0.5 |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| SpRtLength | 0.1 |
| DensRtTip | 0.1 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 0 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-08 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.6); (0.8, 0.1); (2, 0.1) |

**Resp**

| Parameter | Value |
|:--|:--|
| E_Root | (0, 0.54); (2, 0.54) |
| E_Leaf | (0, 0.72); (2, 0.72) |
| r_Root | (0.914, 0.065); (0.9141, 0.015) |
| r_Leaf | (0.914, 0.015); (0.9141, 0.008) |

**CrpN**

| Parameter | Value |
|:--|:--|
| SeedN | 0.4 |
| PtLeafCnc | (0.114, 0.05); (0.229, 0.043); (0.343, 0.038); (0.457, 0.033); (0.571, 0.028); (0.686, 0.024); (0.8, 0.021); (0.914, 0.018); (1.029, 0.016); (1.143, 0.014); (1.257, 0.012) |
| PtRootCnc | (0.114, 0.018); (0.229, 0.017); (0.343, 0.016); (0.457, 0.015); (0.571, 0.014); (0.686, 0.013); (0.8, 0.013); (0.914, 0.012); (1.029, 0.011); (1.143, 0.011); (1.257, 0.01) |
| CrLeafCnc | (0.114, 0.03); (0.229, 0.027); (0.343, 0.024); (0.457, 0.022); (0.571, 0.019); (0.686, 0.017); (0.8, 0.016); (0.914, 0.014); (1.029, 0.012); (1.143, 0.011); (1.257, 0.01) |
| CrRootCnc | (0.114, 0.013); (0.229, 0.012); (0.343, 0.012); (0.457, 0.011); (0.571, 0.011); (0.686, 0.01); (0.8, 0.01); (0.914, 0.009); (1.029, 0.009); (1.143, 0.008); (1.257, 0.008) |
| NfLeafCnc | (0.114, 0.02); (0.229, 0.018); (0.343, 0.016); (0.457, 0.015); (0.571, 0.013); (0.686, 0.012); (0.8, 0.011); (0.914, 0.01); (1.029, 0.009); (1.143, 0.008); (1.257, 0.007) |
| NfRootCnc | (0.114, 0.01); (0.229, 0.01); (0.343, 0.009); (0.457, 0.009); (0.571, 0.009); (0.686, 0.008); (0.8, 0.008); (0.914, 0.008); (1.029, 0.008); (1.143, 0.007); (1.257, 0.007) |

**Harvest**

| Parameter | Value |
|:--|:--|
| index | 0.45 |
| CStem | 0.0065 |
| CSOrg | 0.00215 |
| alpha | 0.8 |
| beta | 0.09 |
| Stem | (); () |
| Leaf | (); () |
| SOrg | (); () |
| Root | (); () |
| DSmax | 0 |
| DSnew | 0 |
| C_Stem | 0.42 |
| C_SOrg | 0.42 |
| C_Root | 0.42 |

EpFac: 1.

IntcpCap: 0.5.

### Crop Winter Wheat

Parent default, defined in lib/wwheat.dai. Winter Wheat

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 100 |
| DS_Emr | 0.01 |
| DSRate1 | 0.026 |
| TempEff1 | (-10, 0.01); (0, 0.01); (20, 0.9); (25, 1); (35, 1.2) |
| PhotEff1 | (10, 0.29); (11, 0.55); (12, 0.75); (13, 0.89); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.025 |
| TempEff2 | (0, 0); (10, 0.14); (15, 0.66); (20, 1); (25, 1.23) |

**Vernal**

| Parameter | Value |
|:--|:--|
| DSLim | 0.25 |
| TaLim | 5 |
| TaSum | -50 |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 5 |
| Qeff | 0.05 |
| TempEff | (-20, 0); (4, 0); (10, 1); (25, 1); (35, 0.01); (50, 0) |

**Seed**

| Parameter | Value |
|:--|:--|
| DSLAI05 | 0.15 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.022 |
| LAIDist0 | 0, 0, 1 |
| LAIDist1 | 0, 0.2, 0.9 |
| PARref | 0.06 |
| PARext | 0.6 |
| PARrel | 0.05 |
| EPext | 0.5 |
| HvsDS | (0, 1); (1, 80); (2, 100) |

**Root**

| Parameter | Value |
|:--|:--|
| DptEmr | 10 |
| PenPar1 | 0.25 |
| PenPar2 | 4 |
| MaxPen | 120 |
| Rad | 0.005 |
| h_wp | -15000 |
| Rxylem | 10 |
| MxNH4Up | 2.5e-07 |
| MxNO3Up | 2.5e-07 |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.5); (1, 0.05); (2, 0) |
| Leaf | (0, 0.7); (0.4, 0.7); (0.55, 0.7); (0.62, 0.5); (0.77, 0.2); (0.95, 0.1); (1.38, 0.05); (2, 0) |
| Stem | (0, 0.3); (0.4, 0.3); (0.55, 0.3); (0.62, 0.5); (0.77, 0.8); (0.95, 0.9); (1.2, 0.5); (1.38, 0.1); (2, 0) |
| RSR | (0, 0.5); (1, 0.5); (2, 0.25) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| E_Root | 0.69 |
| E_Leaf | 0.68 |
| E_Stem | 0.66 |
| E_SOrg | 0.7 |
| r_Root | 0.015 |
| r_Leaf | 0.016 |
| r_Stem | 0.01 |
| r_SOrg | 0.01 |
| ShldResC | 0.4 |
| ReMobilDS | 1.5 |
| ReMobilRt | 0.03 |
| Large_RtDR | 0.05 |
| ExfoliationFac | 0.7 |
| LfDR | (0, 0); (0.1, 0); (0.25, 0); (0.5, 0.01); (0.9, 0.01); (1.2, 0.02); (1.8, 0.05); (2, 0.05) |
| RtDR | (0, 0); (0.6, 0); (1.2, 0.01); (2, 0.01) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.012); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.009) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0.34, 0.06); (0.5, 0.036); (1.28, 0.033); (1.52, 0.0288); (1.93, 0.0194) |
| CrLeafCnc | (0.34, 0.021); (0.5, 0.021); (1.28, 0.021); (1.52, 0.019); (1.93, 0.0183) |
| NfLeafCnc | (0.34, 0.008); (0.5, 0.008); (1.28, 0.008); (1.52, 0.008); (1.93, 0.008) |
| PtStemCnc | (0.5, 0.02); (1.12, 0.0125); (1.28, 0.0093); (1.53, 0.0085); (1.93, 0.0057) |
| CrStemCnc | (0.5, 0.0064); (1.12, 0.0049); (1.28, 0.0043); (1.53, 0.0041); (1.93, 0.0035) |
| NfStemCnc | (0.5, 0.003); (1.12, 0.003); (1.28, 0.003); (1.53, 0.003); (1.93, 0.003) |
| PtSOrgCnc | (1.12, 0.025); (2, 0.03) |
| CrSOrgCnc | (1.12, 0.015); (2, 0.015) |
| NfSOrgCnc | (1.12, 0.014); (2, 0.014) |

**Harvest**

| Parameter | Value |
|:--|:--|
| EconomicYield_W | 0.8 |
| EconomicYield_N | 0.94 |

### Crop Winter Wheat; Foulum

Parent Winter Wheat, defined in lib/wwheat.dai. Winter Wheat; Foulum

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 200 |
| DSRate1 | 0.022 |

**Canopy**

| Parameter | Value |
|:--|:--|
| SpLAI | 0.021 |
| LeafAIMod | (0.63, 1); (1.13, 0.85); (1.25, 0.76) |
| PARrel | 0.07 |
| HvsDS | (0, 1); (1, 80); (2, 80) |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.33, 0.5); (0.53, 0.25); (1, 0.05); (2, 0) |
| Leaf | (0, 0.9); (0.33, 0.85); (0.43, 0.83); (0.53, 0.75); (0.62, 0.56); (0.77, 0.2); (0.95, 0.09); (1.14, 0.05); (1.38, 0); (2, 0) |
| Stem | (0, 0.1); (0.33, 0.15); (0.43, 0.17); (0.53, 0.25); (0.62, 0.44); (0.77, 0.8); (0.95, 0.64); (1.14, 0.32); (1.38, 0); (2, 0) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | 0.4 |
| ReMobilDS | 1.1 |
| ReMobilRt | 0.15 |
| ExfoliationFac | 0.9 |
| LfDR | (0.9, 0); (1.2, 0.05); (1.8, 0.05); (2, 0.1) |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0, 0.012); (1, 0.012); (2, 0.01) |
| CrRootCnc | (0, 0.01); (1, 0.01); (2, 0.009) |
| NfRootCnc | (0, 0.007); (1, 0.007); (2, 0.007) |
| PtLeafCnc | (0.34, 0.06); (0.5, 0.036); (1.28, 0.032); (1.52, 0.0288); (1.93, 0.0194) |
| CrLeafCnc | (0.34, 0.021); (0.5, 0.021); (1.28, 0.021); (1.52, 0.019); (1.93, 0.0183) |
| NfLeafCnc | (0.34, 0.008); (0.5, 0.008); (1.28, 0.008); (1.52, 0.008); (1.93, 0.008) |
| PtStemCnc | (0.5, 0.02); (1.12, 0.0125); (1.28, 0.0093); (1.53, 0.0085); (1.93, 0.0085) |
| CrStemCnc | (0.5, 0.0064); (1.12, 0.006); (1.28, 0.006); (1.53, 0.006); (1.93, 0.006) |
| NfStemCnc | (0.5, 0.004); (1.12, 0.004); (1.28, 0.004); (1.53, 0.004); (1.93, 0.004) |
| PtSOrgCnc | (1.12, 0.015); (2, 0.023) |
| CrSOrgCnc | (1.12, 0.014); (2, 0.017) |
| NfSOrgCnc | (1.12, 0.013); (2, 0.014) |

### Crop Winter Wheat JG

Parent Winter Wheat, defined in lib/wwheat.dai. Winter Wheat JG

cite: gyldengren2020effects.

**Devel**

| Parameter | Value |
|:--|:--|
| DSRate1 | 0.032 |
| TempEff1 | (0, 0); (2, 0.06); (7, 0.21); (12, 0.4); (16, 0.59); (20, 0.8); (24, 0.95); (28, 1); (32, 0.91); (34, 0.79); (35, 0.71); (40, 0.05) |
| PhotEff1 | (0, 0); (6, 0.05); (10, 0.1); (11, 0.2); (12, 0.35); (13, 0.8); (14, 1); (15, 1.08); (16, 1.14); (17, 1.18); (24, 1.18) |
| DSRate2 | 0.048 |
| TempEff2 | (0, 0); (4, 0.03); (8, 0.1); (12, 0.21); (15, 0.31); (18, 0.46); (22, 0.79); (24, 0.89); (27, 0.97); (32, 1); (34, 0.98); (35, 0.95); (40, 0.65) |

**LeafPhot**

| Parameter | Value |
|:--|:--|
| Fm | 6 |
| TempEff | (0, 0); (4, 0.25); (8, 0.55); (12, 0.95); (16, 1.3); (20, 1.6); (24, 1.9); (28, 2); (32, 1.82); (34, 1.58); (35, 1.42); (40, 0.1) |
| DSEff | (0, 1); (0.3, 1); (0.4, 1); (0.8, 1); (1, 1); (1.3, 0.85); (1.7, 0.75); (2, 0.7) |

**Seed**

| Parameter | Value |
|:--|:--|
| DM_fraction | 87 |
| C_fraction | 45 |
| N_fraction | 2 |
| T_factor | (20, 100) |
| rate | 0.4 |

**Root**

| Parameter | Value |
|:--|:--|
| PenPar1 | 1 |
| PenPar2 | 0 |
| MaxPen | 175 |
| NO3_uptake | F_relative 10 |
| PenWaterFac | (0, 1); (0.989, 1); (0.99, 0); (1, 0) |

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | -1 |
| LfDR | (0, 0); (0.1, 0); (0.25, 0); (0.5, 0.015); (0.9, 0.025); (1.3, 0.05); (1.7, 0.06); (2, 0.08) |
| RtDR | (0, 0); (0.6, 0.005); (1, 0.02); (2, 0.03) |

**Canopy**

| Parameter | Value |
|:--|:--|
| LeafAIMod | (0, 1.3); (0.5, 1); (0.9, 0.8); (2, 0.8) |
| HvsDS | (0, 1); (1, 80); (2, 90) |

**Partit**

| Parameter | Value |
|:--|:--|
| Root | (0, 0.5); (0.28, 0.45); (0.5, 0.4); (1, 0); (2, 0) |
| Leaf | (0.1, 0.72); (0.28, 0.58); (0.5, 0.53); (0.65, 0.4); (0.85, 0.25); (0.95, 0.25); (1.1, 0); (1.35, 0); (2, 0) |
| Stem | (0.1, 0.28); (0.28, 0.42); (0.5, 0.47); (0.65, 0.6); (0.85, 0.75); (0.95, 0.62); (1.1, 0.38); (1.35, 0.18); (1.5, 0); (2, 0) |
| NNI_crit | 1.4 |
| NNI_inc | 0.65 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtRootCnc | (0.19, 0.025); (0.47, 0.026); (0.77, 0.019); (1.2, 0.015); (2, 0.014) |
| CrRootCnc | (0.19, 0.017); (0.47, 0.019); (0.77, 0.016); (1.2, 0.012); (2, 0.009) |
| NfRootCnc | (0.19, 0.009); (1.2, 0.003); (2, 0.003) |
| PtLeafCnc | (0.19, 0.051); (0.47, 0.049); (0.77, 0.045); (1, 0.038); (2, 0.021) |
| CrLeafCnc | (0.19, 0.039); (0.47, 0.037); (0.77, 0.03); (1, 0.025); (2, 0.014) |
| NfLeafCnc | (0.19, 0.01); (0.47, 0.01); (0.77, 0.007); (1, 0.006); (2, 0.005) |
| PtStemCnc | (0.19, 0.038); (0.47, 0.036); (0.77, 0.021); (1, 0.015); (2, 0.011) |
| CrStemCnc | (0.19, 0.023); (0.47, 0.014); (0.77, 0.009); (1, 0.007); (2, 0.006) |
| NfStemCnc | (0.19, 0.01); (0.47, 0.007); (0.77, 0.004); (1, 0.002); (2, 0.002) |
| PtSOrgCnc | (1, 0.017); (2, 0.0175) |
| CrSOrgCnc | (1, 0.0125); (2, 0.0125) |
| NfSOrgCnc | (1, 0.0005); (2, 0.0005) |

### Crop no stress Barley

Parent Spring Barley, defined in sample/DrainDrying.dai. no stress Barley

enable_N_stress: false.

water_stress_effect: none.

### Crop Clovercz

Parent Pea, defined in sample/cz-management.dai. Clovercz

### Crop Oatcz

Parent Rye, defined in sample/cz-management.dai. Oatcz

### Crop Triticale

Parent Rye, defined in sample/cz-management.dai. Triticale

### Crop Rye-grasscz

Parent Grass to grain, defined in sample/cz-management.dai. Rye-grasscz

### Crop Mustardcz

Parent Winter Rape, defined in sample/cz-management.dai. Mustardcz

### Crop Potato; CER

Parent Potato; Agria, defined in sample/it-management.dai. Potato; CER

### Crop Potato; Folva; SAFIR

Parent Potato; Folva, defined in sample/safir-common.dai. Potato; Folva; SAFIR

enable_N_stress: false.

water_stress_effect: none.

**Root**

| Parameter | Value |
|:--|:--|
| ABAprod | Fulai Liu uptake |
| MaxWidth | 1.5 |

LeafPhot: Potato Farquhar.

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | -1 |

**Seed**

| Parameter | Value |
|:--|:--|
| rate | 0.3 |
| DM_fraction | 0.2 |
| C_fraction | 0.4676 |
| N_fraction | 2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| LeafAIMod | (0, 2.2); (0.4, 1.1); (1.5, 1.1); (2, 0.3) |

### Crop SiteCrop

Parent Potato; Folva; SAFIR, defined in sample/safir-site.dai. SiteCrop

Devel: original.

Canopy: True.

Root: True.

LeafPhot: original.

Partit: True.

CrpN: True.

### Crop Lettuce

Parent Potato, defined in sample/safir-site.dai. 

### Crop Maize_SK

Parent Maize, defined in sample/sk-management.dai. Maize_SK

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 200 |
| DSRate1 | 0.019 |
| DSRate2 | 0.017 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.038); (0.5, 0.038); (1, 0.03); (1.5, 0.018); (1.8, 0.015); (2, 0.013) |
| CrLeafCnc | (0, 0.01); (0.367, 0.01); (0.5, 0.009); (1, 0.008); (2, 0.008) |

### Crop Spring Barley_SK

Parent Spring Barley, defined in sample/sk-management.dai. Spring Barley_SK

**Devel**

| Parameter | Value |
|:--|:--|
| DSRate1 | 0.035 |
| DSRate2 | 0.025 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.04); (1, 0.04); (2, 0.03) |

### Crop Winter Wheat_SK

Parent Winter Wheat, defined in sample/sk-management.dai. Winter Wheat_SK

**Devel**

| Parameter | Value |
|:--|:--|
| EmrTSum | 150 |
| DSRate1 | 0.017 |
| DSRate2 | 0.025 |

**CrpN**

| Parameter | Value |
|:--|:--|
| PtLeafCnc | (0, 0.05); (0.5, 0.035); (1.28, 0.033); (1.52, 0.025); (2, 0.012) |
| CrLeafCnc | (0, 0.021); (0.5, 0.021); (1.28, 0.021); (1.52, 0.015); (2, 0.01) |

### Crop NewSB

Parent Spring Barley, defined in sample/test-organic.dai. Spring Barley

**Harvest**

| Parameter | Value |
|:--|:--|
| Dead | NewSB-SLOW |
| Stem | NewSB-SLOW |
| Leaf | NewSB-SLOW |
| SOrg | NewSB-SLOW |
| Root | NewSB-SLOW |

### Crop Potato; Folva; ABA

Parent Potato; Folva, defined in sample/test-prd.dai. Potato; Folva; ABA

enable_N_stress: false.

water_stress_effect: none.

**Root**

| Parameter | Value |
|:--|:--|
| ABAprod | Fulai Liu uptake |

LeafPhot: Potato.

**Prod**

| Parameter | Value |
|:--|:--|
| NCrop | -1 |

**Seed**

| Parameter | Value |
|:--|:--|
| rate | 0.3 |
| DM_fraction | 0.2 |
| C_fraction | 0.4676 |
| N_fraction | 2 |

**Canopy**

| Parameter | Value |
|:--|:--|
| LeafAIMod | (0, 2.2); (0.4, 1.1); (1.5, 1.1); (2, 0.3) |

### Crop Potato; Folva; PRD

Parent Potato; Folva; ABA, defined in sample/test-prd.dai. Potato; Folva; PRD

**Root**

| Parameter | Value |
|:--|:--|
| rootdens | row_position 50, row_distance 1 |
| MaxWidth | 1.5 |

### Crop Potato; Exp

Parent Potato; Folva; PRD, defined in sample/test-prd.dai. Potato; Exp

\newpage

## Actions

An action is a management operation of a set-up: sowing, tillage, fertilising, irrigation and so on. The text of each action is shown as it is defined in the library.

### Action OpenMI_fertigation

Parent extern_fertigation, from lib/OpenMI.dai.

```
(defaction
  OpenMI_fertigation
  extern_fertigation
  "Control fertigation through OpenMI."
  (surface "Surface Irrigation")
  (overhead "Overhead Irrigation")
  (subsoil "Subsoil Irrigation")
  (NO3 "NO3 input")
  (NH4 "NH4 input"))
```

### Action MARKVAND

Parent markvand, from lib/markvand.dai.

```
(defaction
  MARKVAND
  markvand ;;"Markvand map for standard crops."
  (map
    ("Beet; V1" "roer")
    ("Silomajs" "majs")
    ("Aert" "aerter")
    ("Vaarbyg" "vaarbyg")
    ("Fodder Beet" "roer")
    ("Maize" "majs")
    ("Pioneer Maize" "majs")
    ("Silage Maize" "majs")
    ("Pea" "aerter")
    ("Green Pea" "aerter")
    ("Pea; V1" "aerter")
    ("Potato; Koege" "kartofler; sildige")
    ("Potato; SCRI" "kartofler; sildige")
    ("Potato" "kartofler; sildige")
    ("Potato; V1" "kartofler; sildige")
    ("Spring Barley" "vaarbyg")
    ("Spring Barley; Foulum" "vaarbyg")
    ("Spring Barley; V1" "vaarbyg")
    ("Spring Rape" "vaarraps")
    ("Spring Rape; V1" "vaarraps")
    ("Sugar Beet" "roer")
    ("Winter Barley" "vinterbyg")
    ("Winter Wheat" "vinterhvede")
    ("Winter Rape" "vinterraps")
    ("Winter Rye" "vinterrug")))
```

### Action plowing

Parent swap, from lib/tillage.dai.

```
(defaction plowing swap (middle -9.0) (depth -18.0))
```

### Action rotavation

Parent mix, from lib/tillage.dai.

```
(defaction rotavation mix -15.0)
```

### Action disk_harrowing

Parent mix, from lib/tillage.dai.

```
(defaction disk_harrowing mix -10.0 (penetration 0.8))
```

### Action stubble_cultivation

Parent mix, from lib/tillage.dai.

```
(defaction stubble_cultivation mix -8.0 (penetration 0.6))
```

### Action seed_bed_preparation

Parent mix, from lib/tillage.dai.

```
(defaction seed_bed_preparation mix -8.0)
```

### Action Barley no stress

Parent activity, from sample/DrainDrying.dai.

```
(defaction
  "Barley no stress"
  activity
  (wait_mm_dd 4 02)
  (plowing)
  (wait_mm_dd 4 05)
  (seed_bed_preparation)
  (sow "no stress Barley")
  (wait_mm_dd 08 25)
  (harvest "no stress Barley" (stub 8 [cm]) (stem 0.70)))
```

### Action MyMan

Parent activity, from sample/OpenMI_management.dai.

```
(defaction
  MyMan
  activity
  (wait (at 1987 3 20 1))
  (plowing)
  (wait (at 1987 4 5 1))
  (progn (sow "Grass") (sow "Spring Barley"))
  (wait (at 1987 9 5 1))
  (harvest "Spring Barley")
  (wait (at 1987 10 10 1))
  (harvest
    "Grass"
    (stub 8.0 [cm]) ;Leave 8 cm stub.
    (stem 1.00 [])) ;Harvest everything above stub.)
```

### Action WW with PFAS cont slurry

Parent activity, from sample/PFAS-sample.dai.

```
(defaction
  "WW with PFAS cont slurry"
  activity
  (wait_mm_dd 09 10)
  (seed_bed_preparation)
  (sow "Winter Wheat")
  (wait_mm_dd 03 20)
  (fertilize ("pig_slurry" (volatilization 10 [%]) (weight 40 [T w.w./ha])) (to -1 [cm]))
  (irrigate_subsoil 0.1 [mm/h] (hours 1) (to -1 [cm]) (solute (PFBA 0.0001 [ppm]))) ;; PFAS added together with slurry using subsoil irrigation function (Estimate based on 'Jensen et al. 2025: PFAS i restprodukter til landbrugsmÃ¦ssig anvendelse').
  (wait (or (crop_ds_after "Winter Wheat" 2.0) (mm_dd 9 1)))
  (harvest "Winter Wheat" (stub 8 [cm]) (stem 0.0) (leaf 0.0))
  (wait_mm_dd 9 02)
  (plowing))
```

### Action WW with PFAS cont irrigation

Parent activity, from sample/PFAS-sample.dai.

```
(defaction
  "WW with PFAS cont irrigation"
  activity
  (wait
    (and
      (after_mm_dd 05 01)
      (before_mm_dd 09 01)
      (not (soil_water_pressure_above (height -25 [cm]) (potential -300 [cm])))))
  (irrigate_overhead 10 [mm/h] (hours 3) (solute (PFOS 5.1e-6 [ppm]) (PFOA 7e-6 [ppm]))) ;; Wastewater effluent contaminated with PFAS. Estimate from 'Simulating PFAS transport in effluent-irrigated farmland usingPRZM5, LEACHM, and HYDRUS-1D models' https://doi.org/10.1002/jeq2.20639
  (wait_days 3))
```

### Action PFAS cont WW

Parent activity, from sample/PFAS-sample.dai.

```
(defaction
  "PFAS cont WW"
  activity
  (while "WW with PFAS cont slurry" (repeat "WW with PFAS cont irrigation")))
```

### Action harrowing

Parent mix, from sample/cz-management.dai.

```
(defaction harrowing mix -7.0)
```

### Action roller

Parent mix, from sample/cz-management.dai.

```
(defaction roller mix -2.0)
```

### Action sweep

Parent mix, from sample/cz-management.dai.

```
(defaction sweep mix -10.0)
```

### Action ridging

Parent mix, from sample/cz-management.dai.

```
(defaction ridging mix -5.0)
```

### Action haulm_destruction

Parent mix, from sample/cz-management.dai.

```
(defaction haulm_destruction mix -2.0)
```

### Action surface_levelling

Parent mix, from sample/cz-management.dai.

```
(defaction surface_levelling mix -10.0)
```

### Action manual_burrying_drip_lines

Parent mix, from sample/cz-management.dai.

```
(defaction manual_burrying_drip_lines mix -5.0)
```

### Action manual_removal_of_drip_lines

Parent mix, from sample/cz-management.dai.

```
(defaction manual_removal_of_drip_lines mix -5.0)
```

### Action WP1 CZ RISWC 2004 WARMUP

Parent activity, from sample/cz-management.dai.

```
(defaction
  "WP1 CZ RISWC 2004 WARMUP"
  activity ;;1991 Spring Barley Jarek with Clover Chlumecky (as pea) ; FD 16/11/04: Spring barley is not modelled, clover only remains
  (wait (mm_dd 4 3)) ; fertilize  200 kg SA 21%/ha (=amonia) 
  (fertilize (amonium_sulphatecz (weight 48.0 [kg N/ha])))
  (wait (mm_dd 4 4))
  (seed_bed_preparation)
  (wait (mm_dd 4 6)) ;(sow "Spring Barley") operation made inactive by FD 16/11/04
  (sow "Clovercz") ;(wait (mm_dd 4 7)) ;(harrowing) operation made inactive FD 16/11/04
  (wait (mm_dd 6 6)) ;(spray MCPA 640 [g/ha])  ;; = in Herbicide Aminex Pur (2,0 l/ha)(320g MCPA/l) ;fertilize CO(NH2)2=urea (46% N-mineral)
  (fertilize (ureacz (weight 17.0 [kg N/ha]))) ;(wait (mm_dd 6 29)) ;(spray Propiconazole 125 [g/ha])  ;; = in Fungicide Tilt 250 EC (0,5 l/ha)(250g Propiconazole/l)
  (wait (mm_dd 8 18)) ;(harvest "Spring Barley" (stem 0)(leaf 0)(sorg 0.95)) operation made inactive by FD 16/11/04
  (harvest "Clovercz" (stub 10.0 [cm]) (stem 1.0)) ;;1992 Clover Chlumecky (as pea) + rye-grass 20 kg/ha (as grass)+ oats 20 kg/ha (as rye) ;FD 16/11/04: rye-grass is not modelled, oats only remains
  (wait (mm_dd 4 7)) ;(sow "Rye-grasscz") operation made inactive by FD 16/11/04
  (sow "Oatcz") ;(fertilize (mocuvka=stale? (weight xx.x [kg N/ha]))) !!!!!
  (fertilize (cattle_dungwatercz (weight 20.0 [Mg w.w./ha]))) ;(plowing) operation made inactive FD 16/11/04
  (wait (mm_dd 4 8)) ; fertilize  100 kg LAV 27%/ha (=amonium nitrate) 
  (fertilize (LAV27cz (weight 27.0 [kg N/ha])))
  (wait (mm_dd 6 10)) ;(harvest "Clovercz" (stub 10.0 [cm])(stem 1.0)) operation made inactive by FD 16/1104
  (wait (mm_dd 6 11)) ; fertilize  100 kg LAV 27%/ha (=amonium nitrate) 
  (fertilize (LAV27cz (weight 27.0 [kg N/ha])))
  (wait (mm_dd 8 20)) ;(harvest "Clovercz" (stub 10.0 [cm])(stem 1.0)) operation made inactive by FD 16/11/04
  (harvest "Oatcz" (stub 10.0 [cm]) (stem 1.0) (sorg 0.95)) ;operation added by FD 16/11/04
  (wait (mm_dd 9 1))
  (plowing)
  (wait (mm_dd 9 14)) ; fertilize  300 kg SA 21%/ha (=ammonia) 
  (fertilize (amonium_sulphatecz (weight 63.0 [kg N/ha])))
  (sow "Winter Barley") ;(wait (mm_dd 9 16)) ;(spray Chlortoluron 2000 [g/ha])  ;; = in Herbicide Dicuran 80 WP (2,5 kg/ha)(80% Chlortoluron) ;;1993 Winter Barley Borvina 240 kg/ha ;(wait (mm_dd 4 27)) ;(spray MCPA 960 [g/ha])  ;; = in Herbicide Aminex Pur (3,0 l/ha)(320g MCPA/l) ;(spray Chlorsulfuron 4.5 [g/ha])  ;; = in Herbicide Glean 75 WG (6,0 g/ha)(75% Chlorsulfuron)
  (wait (mm_dd 5 17)) ; fertilize  xx kg LA 33%/ha - the dose estimated by FD
  (fertilize (LA33cz (weight 50.0 [kg N/ha])))
  (wait (mm_dd 7 25))
  (harvest "Winter Barley" (stem 0.95) (leaf 0.95) (sorg 0.95))
  (wait (mm_dd 7 28))
  (fertilize (cattle_manurecz (weight 35.0 [T w.w./ha])))
  (wait (mm_dd 7 29))
  (plowing)
  (wait (mm_dd 7 30))
  (disk_harrowing)
  (seed_bed_preparation)
  (wait (mm_dd 8 1)) ; ferttilize  300 kg LA 33%/ha
  (fertilize (LA33cz (weight 99.0 [kg N/ha])))
  (wait (mm_dd 8 2)) ; sow mustard (=winter rape)
  (sow "Mustardcz") ;(roller) operation made inactive by FD 16/10/04 ;(wait (mm_dd 10 22)) ;(harvest "Mustardcz" (stem 0.00)(leaf 0.00)(sorg 0.00)) made inactive by FD 16/11/04
  (wait (mm_dd 11 5))
  (plowing) ;;1994 Potato; RISWC Karin 2500 kg/ha
  (wait (mm_dd 4 19))
  (sweep)
  (wait (mm_dd 4 22)) ;fertilize 730kg Simferta (N:P:K=11:12:12)=80,3kgN+88kgP2O5+88kgK2O
  (fertilize (NPK11-12-12cz (weight 80.3 [kg N/ha])))
  (wait (mm_dd 4 26))
  (seed_bed_preparation)
  (wait (mm_dd 4 27))
  (sow "Potato; Agria") ;(wait (mm_dd 5 13))  ;(harrowing) ;vlaceni sitovymi branami operation made inactive FD 16/11/04 ;(wait (mm_dd 5 18))  ;(stubble_cultivation) ;podmitka naslepo bez vlaceni (ruska plecka) ; the previous operation was made inactive by FD 16/11/04 ;(wait (mm_dd 6 2))  ;(ridging) operation made inactive FD 16/11/04 ;(wait (mm_dd 6 3))  ;(harrowing) ;vlaceni operation made inactive FD 16/11/04  ;(wait (mm_dd 6 13))  ;(ridging) operation made inactive FD 16/11/04 ;(wait (mm_dd 6 22))  ;(ridging) operation made inactive FD 16/11/04 ;(wait (mm_dd 7 12)) ;(spray Cymoxanil 80 [g/ha])  ;(spray Oxadixyl 200 [g/ha])  ;(spray Mancozeb 1400 [g/ha])  ;; = in Fungicide Ripost M (2,5 kg/ha)(3,2% Cymoxanilu, 8% Oxadixylu a 56% Mancozebu) ;(spray Deltamethrin 10 [g/ha])  ;; = in Insecticide Decis EW 50 (0,2 l/ha)(50 g/l Deltamethrinu) ;(wait (mm_dd 8 2)) ;(spray Oxadixyl 200 [g/ha])  ;(spray Mancozeb 1400 [g/ha])  ;; = in Fungicide Sandofan M (2,5 kg/ha)(8% Oxadixylu a 56% Mancozebu) ;(wait (mm_dd 8 16)) ;(spray Fentin acetat 270 [g/ha])  ;(spray Maneb 75 [g/ha])  ;; = in Fungicide Brestan 60 WP (0,5 kg/ha)(54% Fentin acetatu a 15% Manebu) ;(wait (mm_dd 8 2)) ;(spray Fentin acetat 324 [g/ha])  ;(spray Maneb 90 [g/ha])  ;; = in Fungicide Brestan 60 WP (0,6 kg/ha)(54% Fentin acetatu a 15% Manebu)
  (wait (mm_dd 10 4))
  (harvest "Potato; Agria" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 11 12))
  (plowing) ;;1995 Spring Barley Akcent 180 kg/ha with Clover Start 20kg/ha (=spring rape) ;FD 16/11/04: spring barley not modelled, clover only remains
  (wait (mm_dd 4 8)) ;fertilize 500kg Simferta NPK (N:P:K=11:12,4:12,4)=55kgN+62kgP2O5+62kgK2O
  (fertilize (NPK11-12-12cz (weight 55.0 [kg N/ha])))
  (seed_bed_preparation)
  (wait (mm_dd 4 9)) ;(sow "Spring Barley") operation made inactive by FD 16/11/04
  (sow "Clovercz") ;(wait (mm_dd 4 10)) ;(harrowing) operation made inactive by FD 16/10/04
  (wait (mm_dd 6 4)) ;(spray MCPA 640 [g/ha])  ;; = in Herbicide Aminex Pur (2,0 l/ha)(320g MCPA/l) ;fertilize 60 kg DAM 390/ha (30%) 75%ammonia
  (fertilize (DAM390cz (weight 18.0 [kg N/ha])))
  (wait (mm_dd 8 11)) ;(harvest "Spring Barley" (stem 0)(leaf 0)(sorg 0.95)) made inactive FD 16/11/04
  (wait (mm_dd 9 30))
  (harvest "Clovercz" (stub 10.0 [cm]) (stem 1.0)) ;;1996 Clover Start (=pea)+ pea 20 kg/ha + rye-grass - jílek (=grass) 30 kg/ha ; rygrass and clover not modelled, pea only remains)
  (wait (mm_dd 4 10))
  (sow "Pea") ;(sow "Rye-grasscz") operation made inactive by FD 16/11/04 ;(wait (mm_dd 4 11))  ;(roller) operation made inactive by FD 16/11/04 ;(wait (mm_dd 5 28)) ;(harvest "Clovercz" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04 ;(harvest "Pea" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04 ;(harvest "Rye-grasscz" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04 ;(wait (mm_dd 7 23)) ; (harvest "Clovercz" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04 ; (harvest "Pea" (stub 10.0 [cm])(stem 1.0))made inactive by FD 16/11/04 ; (harvest "Rye-grasscz" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04
  (wait (mm_dd 9 24)) ; (harvest "Clovercz" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04
  (harvest "Pea" (stub 10.0 [cm]) (stem 1.0) (sorg 0.80)) ; sorg added by FD 16/11/04 ; (harvest "Rye-grasscz" (stub 10.0 [cm])(stem 1.0)) made inactive by FD 16/11/04
  (wait (mm_dd 9 25))
  (plowing)
  (wait (mm_dd 9 28)) ;fertilize 600kg Simferta NPK (N:P:K=11:12,4:12,4)=66kgN+74,4kgP2O5+74,4kgK2O
  (fertilize (NPK11-12-12cz (weight 66.0 [kg N/ha])))
  (seed_bed_preparation)
  (wait (mm_dd 9 29))
  (sow "Winter Wheat") ; WW Hana 220 kg/ha ;(wait (mm_dd 9 30)) ;(roller) operation made inactive by FD 16/11/04 ;(spray Trifluralin 720 [g/ha])  ;; = in Herbicide Synfloran 48 EC (1,5 l/ha)(480g Trifluralinu/l) ;;1997 Winter Wheat Hana 220 kg/ha 
  (wait (mm_dd 3 15)) ;fertilize 300kg LAV 27% = 81 kg N/ha
  (fertilize (LAV27cz (weight 81.0 [kg N/ha]))) ;(wait (mm_dd 4 23))  ;(spray Prochloraz 675 [g/ha])  ;; = in Fungicide Sportak HF (1,5 l/ha)(450g Prochlorazu/l)   ;(spray Chlormequat-chlorin 720 [g/ha])  ;; = in RR Retacel extra R68 (1,0 l/ha)(720g Chl./l)    ;(wait (mm_dd 4 28))  ;(spray Isoproturon 1000 [g/ha])  ;; = in Herbicide Arelon 500 Fw (2,0 l/ha)(500g Isoproturonu/l)   ;(spray Fluroxypyr 150 [g/ha])  ;; = in Herbicide Starane 250 EC (0,6 l/ha)(250g Fluroxyryru/l)
  (wait (mm_dd 5 31)) ;fertilize 300kg LAV 27% = 81 kg N/ha
  (fertilize (LAV27cz (weight 81.0 [kg N/ha]))) ;(wait (mm_dd 6 11))  ;(spray Epoxiconazole 50.4 [g/ha])  ;(spray Fenpropimorph 150 [g/ha])  ;; = in Fungicide Tango Super (0,6 l/ha)(84g Epoxiconazole/ha + 250g Fenpropimorphu/l)  
  (wait (mm_dd 8 19))
  (harvest "Winter Wheat" (stem 0) (leaf 0) (sorg 0.95))
  (wait (mm_dd 8 28))
  (stubble_cultivation) ;podmitka
  (wait (mm_dd 9 2))
  (sweep)
  (harrowing)
  (disk_harrowing) ;smykování a vláèení
  (wait (mm_dd 9 12))
  (fertilize (cattle_manurecz (weight 35.0 [T w.w./ha])))
  (wait (mm_dd 9 13))
  (plowing) ;;1998 Potato; RISWC Rosela 3000 kg/ha
  (wait (mm_dd 4 12))
  (disk_harrowing)
  (wait (mm_dd 4 25)) ;fertilize 800kg Simferta (N:P:K=11:12,4:12,4)=88kgN+99,2kgP2O5+99,2kgK2O
  (fertilize (NPK11-12-12cz (weight 88.0 [kg N/ha])))
  (wait (mm_dd 4 27))
  (seed_bed_preparation)
  (wait (mm_dd 4 28))
  (sow "Potato; Agria") ;(wait (mm_dd 5 14)) ;(spray Terbuthylazine 210 [g/ha])  ;(spray Terbutryn 490 [g/ha])  ;; = in Herbicide Topogard 50 WP (1,4 kg/ha)(15% Terbuthylazinu, 35% Terbutynu) ;(spray Clomazone 48 [g/ha])  ;; = in Herbicide Command 4 EC (0,1 l/ha)(480 g/l Clomazone) ;(wait (mm_dd 6 8)) ;(spray Mancozeb 1600 [g/ha])  ;; = in Fungicide Novozir NM 80 (2,0 kg/ha)(80% Mancozebu) ;(wait (mm_dd 6 22)) ;(spray Mancozeb 1600 [g/ha])  ;(spray Metalaxyl 200 [g/ha])  ;; = in Fungicide Ridomil MZ 72 WP (2,5 kg/ha)(64% Mancozebu a 8% Metalaxylu) ;(wait (mm_dd 7 5)) ;(spray Mancozeb 1600 [g/ha])  ;(spray Metalaxyl 200 [g/ha])  ;; = in Fungicide Ridomil MZ 72 WP (2,5 kg/ha)(64% Mancozebu a 8% Metalaxylu) ;(wait (mm_dd 7 19)) ;(spray Fentin acetat 270 [g/ha])  ;(spray Maneb 75 [g/ha])  ;; = in Fungicide Brestan 60 WP (0,5 kg/ha)(54% Fentin acetatu a 15% Manebu)
  (wait (mm_dd 9 10))
  (harvest "Potato; Agria" (stem 0.00) (leaf 0.00) (sorg 0.95)) ;;1999 Spring Barley Primus 200 kg/ha 
  (wait (mm_dd 4 29)) ;fertilize 250kg NP (Norsk Hydro) (N:P=26:14)=65kgN+35kgP2O5 (fertilize (AmmoniumNitrate (weight 88.0 [kg N/ha])))
  (fertilize (NP26-14cz (weight 65.0 [kg N/ha])))
  (seed_bed_preparation) ;(stop)
  (wait (mm_dd 4 30))
  (sow "Spring Barley") ;(wait (mm_dd 4 31)) corrected by FD 16/11/04 - see the following line: ;(wait (mm_dd 5 1)) ;(roller) operation made inactive by FD 16/11/04 ;(wait (mm_dd 5 13)) ;(spray Dicamba 79.1 [g/ha])  ;(spray Triasulfuron 4.9 [g/ha])  ;; = in Herbicide Lintur 70 WG (120 g/ha)(65,9% Dicamba a 4,1% Triasulfuron)
  (wait (mm_dd 6 4)) ;fertilize 111,11 kg LAV 27% = 30 kg N/ha
  (fertilize (LAV27cz (weight 30.0 [kg N/ha]))) ;(wait (mm_dd 6 8))  ;(spray Propiconazole 125 [g/ha])  ;; = in Fungicide Tilt 250 EC (0,5 l/ha)(250g Propiconazole/l)  
  (wait (mm_dd 6 28)) ;fertilize 111,11 kg LAV 27% = 30 kg N/ha
  (fertilize (LAV27cz (weight 30.0 [kg N/ha])))
  (wait (mm_dd 8 3))
  (harvest "Spring Barley" (stem 0) (leaf 0) (sorg 0.95))
  (plowing)
  (wait (mm_dd 8 23))
  (seed_bed_preparation) ;this line was added by FD 16/11/04
  (sow "Winter Rape") ;Pronto 4,8 kg/ha (hybrid) ;(wait (mm_dd 8 24)) ;(spray Metazachlor 400 [g/ha])  ;; = in Herbicide Butisan 400 SC (1,5 l/ha)(400 g/l Metazachloru) ;(spray Clomazone 48 [g/ha])  ;; = in Herbicide Command 4 EC (0,1 l/ha)(480 g/l Clomazone) ; 2000 Winter Rape Pronto 4,8 kg/ha (hybrid)
  (wait (mm_dd 4 6)) ;fertilize 180,0 kg LAV 27% = 48,6 kg N/ha
  (fertilize (LAV27cz (weight 48.6 [kg N/ha])))
  (wait (mm_dd 4 14)) ;(spray Chlorpyrifos 300 [g/ha])  ;(spray Cypermethrin 30 [g/ha])  ;; = in Insecticide Nurelle D (0,6 l/ha)(500 g/l Chlorpyrifosu a 50 g/l Cypermethrinu)
  (wait (mm_dd 4 16)) ;fertilize 210,0 kg LAV 27% = 56,5 kg N/ha
  (fertilize (LAV27cz (weight 56.5 [kg N/ha])))
  (wait (mm_dd 4 26)) ;(spray Deltamethrin 2.5 [g/ha])  ;; = in Insecticide Decis Flow 2,5 EW (0,1 l/ha)(25 g/l Deltamethrinu) ;fertilize 120 l DAM390 30%/ha 75%ammonia
  (fertilize (DAM390cz (weight 36.0 [kg N/ha])))
  (wait (mm_dd 7 23))
  (harvest "Winter Rape" (stem 0) (leaf 0) (sorg 0.95))
  (wait (mm_dd 7 27))
  (stubble_cultivation) ;podmítka
  (wait (mm_dd 9
```

### Action SBarley w. MF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "SBarley w. MF"
  activity
  (wait_mm_dd 3 05)
  (fertilize (N25S (weight 115 [kg N/ha])))
  (plowing)
  (wait_mm_dd 4 05)
  (seed_bed_preparation)
  (sow "Spring Barley")
  (wait (or (crop_ds_after "Spring Barley" 2.0) (mm_dd 08 20)))
  (harvest "Spring Barley" (stub 8 [cm]) (stem 0.70)))
```

### Action SBarley w. OF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "SBarley w. OF"
  activity
  (wait_mm_dd 3 05)
  (fertilize ("pig_slurry" (volatilization 5 [%]) (weight 28 [T w.w./ha])) (to -1 [cm]))
  (plowing)
  (wait_mm_dd 4 05)
  (seed_bed_preparation)
  (sow "Spring Barley")
  (wait (or (crop_ds_after "Spring Barley" 2.0) (mm_dd 08 20)))
  (harvest "Spring Barley" (stub 8 [cm]) (stem 0.70)))
```

### Action WWheat w. MF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WWheat w. MF"
  activity
  (wait_mm_dd 09 10)
  (seed_bed_preparation)
  (sow "Winter Wheat")
  (wait_mm_dd 04 05)
  (fertilize (N25S (weight 060 [kg N/ha])))
  (wait_mm_dd 05 05)
  (fertilize (N25S (weight 100 [kg N/ha])))
  (wait (or (crop_ds_after "Winter Wheat" 2.0) (mm_dd 9 1)))
  (harvest "Winter Wheat" (stub 8 [cm]) (stem 0.0) (leaf 0.0))
  (wait_mm_dd 9 02)
  (plowing))
```

### Action WWheat w. OF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WWheat w. OF"
  activity
  (wait_mm_dd 09 10)
  (seed_bed_preparation)
  (sow "Winter Wheat")
  (wait_mm_dd 03 20)
  (fertilize ("pig_slurry" (volatilization 10 [%]) (weight 40 [T w.w./ha])) (to -1 [cm]))
  (wait (or (crop_ds_after "Winter Wheat" 2.0) (mm_dd 9 1)))
  (harvest "Winter Wheat" (stub 8 [cm]) (stem 0.0) (leaf 0.0))
  (wait_mm_dd 9 02)
  (plowing))
```

### Action WBarley w. MF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WBarley w. MF"
  activity
  (wait_mm_dd 9 01)
  (plowing)
  (wait_mm_dd 9 10)
  (seed_bed_preparation)
  (sow "Winter Barley")
  (wait_mm_dd 3 25)
  (fertilize (N25S (weight 60 [kg N/ha])))
  (wait_mm_dd 4 25)
  (fertilize (N25S (weight 81 [kg N/ha])))
  (wait (or (crop_ds_after "Winter Barley" 2.0) (mm_dd 8 9)))
  (harvest "Winter Barley" (stub 8 [cm]) (stem 0.0) (leaf 0.0)))
```

### Action WBarley w. MF & OF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WBarley w. MF & OF"
  activity
  (wait_mm_dd 9 01)
  (plowing)
  (wait_mm_dd 9 10)
  (seed_bed_preparation)
  (sow "Winter Barley")
  (wait_mm_dd 3 25)
  (fertilize (N25S (weight 68 [kg N/ha])))
  (wait_mm_dd 4 20)
  (fertilize ("pig_slurry" (volatilization 10 [%]) (weight 20 [T w.w./ha])) (to -1 [cm]))
  (wait (or (crop_ds_after "Winter Barley" 2.0) (mm_dd 8 9)))
  (harvest "Winter Barley" (stub 8 [cm])))
```

### Action WBarley w. OF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WBarley w. OF"
  activity
  (wait_mm_dd 9 01)
  (plowing)
  (wait_mm_dd 9 10)
  (seed_bed_preparation)
  (sow "Winter Barley")
  (wait_mm_dd 3 25)
  (fertilize ("pig_slurry" (volatilization 10 [%]) (weight 37 [T w.w./ha])) (to -1 [cm]))
  (wait (or (crop_ds_after "Winter Barley" 2.0) (mm_dd 8 9)))
  (harvest "Winter Barley" (stub 8 [cm])))
```

### Action WRape w. MF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WRape w. MF"
  activity
  (wait_mm_dd 8 15)
  (plowing)
  (wait_mm_dd 8 20)
  (fertilize (N25S (weight 25 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Winter Rape")
  (wait_mm_dd 3 05)
  (fertilize (N25S (weight 130 [kg N/ha])))
  (wait (or (crop_ds_after "Winter Rape" 2.0) (mm_dd 8 9)))
  (harvest "Winter Rape" (stub 8 [cm]) (stem 0.0) (leaf 0.0)))
```

### Action WRape w. OF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "WRape w. OF"
  activity
  (wait_mm_dd 8 15)
  (fertilize ("pig_slurry" (volatilization 5 [%]) (weight 20 [T w.w./ha])) (to -1 [cm]))
  (plowing)
  (wait_mm_dd 8 20)
  (seed_bed_preparation)
  (sow "Winter Rape")
  (wait_mm_dd 3 05)
  (fertilize ("pig_slurry" (volatilization 10 [%]) (weight 26 [T w.w./ha])) (to -1 [cm]))
  (wait (or (crop_ds_after "Winter Rape" 2.0) (mm_dd 8 9)))
  (harvest "Winter Rape" (stub 8 [cm]) (stem 0.0) (leaf 0.0)))
```

### Action Maize w. MF & OF

Parent activity, from sample/dk-management.dai.

```
(defaction
  "Maize w. MF & OF"
  activity
  (wait_mm_dd 4 05)
  (fertilize
    ("cattle_slurry" (volatilization 5 [%]) (weight 50 [T w.w./ha]))
    (to -1 [cm]))
  (plowing)
  (wait_mm_dd 4 20)
  (fertilize (Ammonia (weight 100 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Silage Maize")
  (wait_mm_dd 10 1)
  (harvest "Silage Maize" (stub 8 [cm])))
```

### Action Pea w. no F

Parent activity, from sample/dk-management.dai.

```
(defaction
  "Pea w. no F"
  activity
  (wait_mm_dd 3 31)
  (plowing)
  (wait_mm_dd 4 05)
  (seed_bed_preparation)
  (sow "Pea")
  (wait (or (crop_ds_after "Pea" 2.0) (mm_dd 8 15)))
  (harvest "Pea" (sorg 0.99) (leaf 0.01) (stem 0.01) (stub 10 [cm])))
```

### Action SBarley & Pea

Parent activity, from sample/dk-management.dai.

```
(defaction
  "SBarley & Pea"
  activity
  (wait_mm_dd 3 05)
  (fertilize (N25S (weight 60 [kg N/ha])))
  (plowing)
  (wait_mm_dd 4 05)
  (seed_bed_preparation)
  (progn (sow "Spring Barley") (sow "Pea"))
  (wait_mm_dd 7 05)
  (progn (harvest "Spring Barley" (stub 8 [cm])) (harvest "Pea" (stub 8 [cm]))))
```

### Action Sowing Grass

Parent activity, from sample/dk-management.dai.

```
(defaction
  "Sowing Grass"
  activity
  (wait_mm_dd 8 20)
  (fertilize
    ("cattle_slurry" (volatilization 5 [%]) (weight 20 [T w.w./ha]))
    (to -1 [cm]))
  (plowing)
  (wait_mm_dd 09 01)
  (seed_bed_preparation)
  (sow "Grass")
  (wait_mm_dd 10 10)
  (harvest "Grass" (stub 8 [cm]) (stem 0.00) (leaf 0.00)))
```

### Action Grass - 4 cuts

Parent activity, from sample/dk-management.dai.

```
(defaction
  "Grass - 4 cuts"
  activity
  (wait_mm_dd 03 15)
  (fertilize (AmmoniumNitrate (weight 100 [kg N/ha])))
  (wait_mm_dd 05 25)
  (harvest "Grass" (stub 8 [cm]) (stem 0.90) (leaf 0.90))
  (wait_days 1)
  (fertilize (AmmoniumNitrate (weight 100 [kg N/ha])))
  (wait_mm_dd 07 01)
  (harvest "Grass" (stub 8 [cm]) (stem 0.80) (leaf 0.80))
  (wait_days 1)
  (fertilize (AmmoniumNitrate (weight 75 [kg N/ha])))
  (wait_mm_dd 08 10)
  (harvest "Grass" (stub 8 [cm]) (stem 0.80) (leaf 0.80))
  (wait_days 1)
  (fertilize (AmmoniumNitrate (weight 50 [kg N/ha])))
  (wait_mm_dd 10 10)
  (harvest "Grass" (stub 8 [cm]) (stem 0.80) (leaf 0.80)))
```

### Action Grass for cutting - 2y

Parent activity, from sample/dk-management.dai.

```
(defaction
  "Grass for cutting - 2y"
  activity
  "Sowing Grass"
  "Grass - 4 cuts"
  "Grass - 4 cuts")
```

### Action SBarley w. catch crop

Parent activity, from sample/dk-management.dai.

```
(defaction
  "SBarley w. catch crop"
  activity
  (wait_mm_dd 3 05)
  (fertilize (N25S (weight 115 [kg N/ha])))
  (plowing)
  (wait_mm_dd 4 05)
  (seed_bed_preparation)
  (sow "Spring Barley")
  (wait_mm_dd 7 05)
  (sow "Grass")
  (wait (or (crop_ds_after "Spring Barley" 2.0) (mm_dd 08 20)))
  (harvest "Spring Barley" (stub 8 [cm]) (stem 0.70)))
```

### Action Potato Management

Parent activity, from sample/dk-management.dai.

```
(defaction
  "Potato Management"
  activity
  (wait_mm_dd 04 24)
  (fertilize (N25S (weight 160 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Potato; SCRI")
  (wait_mm_dd 10 22)
  (harvest "Potato; SCRI" (stem 0.0) (leaf 0.0)))
```

### Action harrowing

Parent mix, from sample/dk-veg-man.dai.

```
(defaction "harrowing" mix -15 (penetration 0.8))
```

### Action irrigation

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "irrigation"
  activity
  (wait (not (soil_water_pressure_above (height -20.0 [cm]) (potential -300 [cm]))))
  (irrigate_overhead 10 [mm/h] (hours 3))
  (wait_days 2))
```

### Action irrigation onion

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "irrigation onion"
  activity
  (wait (not (soil_water_pressure_above (height -10.0 [cm]) (potential -250 [cm]))))
  (irrigate_overhead 10 [mm/h] (hours 2))
  (wait_days 1))
```

### Action Beetroot management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Beetroot management"
  activity
  (wait_mm_dd 4 1)
  (plowing)
  (wait_mm_dd 5 20)
  (fertilize (KAS (weight 40 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Beetroot")
  (wait_mm_dd 6 10)
  (while (wait_mm_dd 6 23) (repeat "irrigation"))
  (fertilize (KAS (weight 95 [kg N/ha])))
  (while (wait_mm_dd 8 15) (repeat "irrigation"))
  (fertilize (N15B (weight 30 [kg N/ha])))
  (while (wait_mm_dd 10 8) (repeat "irrigation"))
  (harvest "Beetroot" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0)))
```

### Action Broccoli - transplanted management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Broccoli - transplanted management"
  activity
  (wait_mm_dd 4 1)
  (plowing)
  (wait_mm_dd 06 05)
  (fertilize (KAS (weight 85 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Broccoli - transplanted")
  (while (wait_mm_dd 07 01) (repeat "irrigation"))
  (fertilize ("NPK 14-3-18" (weight 85 [kg N/ha])))
  (while (wait_mm_dd 07 21) (repeat "irrigation"))
  (fertilize (N15B (weight 40 [kg N/ha])))
  (while
    (wait (or (crop_ds_after "Broccoli - transplanted" 1.8 []) (mm_dd 10 15)))
    (repeat "irrigation"))
  (harvest "Broccoli - transplanted" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0)))
```

### Action Brussels sprouts management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Brussels sprouts management"
  activity
  (wait_mm_dd 04 25)
  (fertilize (KAS (weight 105 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Brussels sprouts")
  (while (wait_mm_dd 6 21) (repeat "irrigation"))
  (fertilize (KAS (weight 50 [kg N/ha])))
  (while (wait_mm_dd 7 31) (repeat "irrigation"))
  (fertilize (KAS (weight 50 [kg N/ha])))
  (while (wait_mm_dd 10 1) (repeat "irrigation")) ;(wait_mm_dd 10 15) ;(fertilize (N46 (weight 25 [kg N/ha])))
  (wait_mm_dd 12 15)
  (harvest "Brussels sprouts" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0)))
```

### Action Brussels sprouts - transplanted management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Brussels sprouts - transplanted management"
  activity
  (wait_mm_dd 05 07)
  (fertilize (KAS (weight 130 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Brussels sprouts - transplanted")
  (while (wait_mm_dd 6 21) (repeat "irrigation"))
  (fertilize (KAS (weight 50 [kg N/ha])))
  (while (wait_mm_dd 7 31) (repeat "irrigation"))
  (fertilize (KAS (weight 50 [kg N/ha])))
  (while (wait_mm_dd 10 1) (repeat "irrigation"))
  (wait_mm_dd 12 01)
  (harvest
    "Brussels sprouts - transplanted"
    (stub 0.0 [cm])
    (sorg 1.0)
    (stem 0.0)
    (leaf 0.0)))
```

### Action Celeriac - transplanted management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Celeriac - transplanted management"
  activity
  (wait_mm_dd 4 1)
  (plowing)
  (wait_mm_dd 5 5)
  (fertilize (KAS (weight 100 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Celeriac - transplanted")
  (while (wait_mm_dd 6 30) (repeat "irrigation"))
  (fertilize (KAS (weight 70 [kg N/ha])))
  (while (wait_mm_dd 8 15) (repeat "irrigation"))
  (fertilize (N15B (weight 50 [kg N/ha])))
  (while (wait_mm_dd 10 15) (repeat "irrigation"))
  (harvest "Celeriac - transplanted" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0)))
```

### Action Early potato management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Early potato management"
  activity
  (wait_mm_dd 04 15)
  (fertilize ("NPK 14-3-18" (weight 130 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Early potato")
  (wait_mm_dd 06 01)
  (while
    (wait
      (or
        (and
          (crop_ds_after "Early potato" 1.1 [])
          (crop_dm_over "Early potato" 4650 [kg DM/ha] (height 0 [cm])))
        (mm_dd 08 01)))
    (repeat "irrigation"))
  (if
    (crop_ds_after "Early potato" 0.1 [])
    (harvest "Early potato" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0))))
```

### Action Onion management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Onion management"
  activity
  (wait_mm_dd 04 12)
  (fertilize ("NP 12-23-0" (weight 45 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Onion")
  (wait_mm_dd 05 15)
  (fertilize (KAS (weight 45 [kg N/ha])))
  (while (wait_mm_dd 06 15) (repeat "irrigation onion"))
  (fertilize ("NPK 14-3-18" (weight 30 [kg N/ha])))
  (while (wait_mm_dd 08 15) (repeat "irrigation onion"))
  (while
    (wait (or (crop_ds_after "Onion" 0.85 []) (mm_dd 09 01)))
    (repeat "irrigation onion"))
  (wait (or (crop_ds_after "Onion" 0.85 []) (mm_dd 09 15)))
  (harvest "Onion" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0)))
```

### Action Onion - planting of sets management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Onion - planting of sets management"
  activity
  (wait_mm_dd 04 01)
  (fertilize ("NP 12-23-0" (weight 45 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Onion - planting of sets")
  (wait_mm_dd 04 15) ;;04 15
  (while (wait_mm_dd 05 05) (repeat "irrigation onion"))
  (fertilize ("KAS" (weight 55 [kg N/ha])))
  (while (wait_mm_dd 06 05) (repeat "irrigation onion"))
  (fertilize ("NPK 14-3-18" (weight 30 [kg N/ha])))
  (while (wait_mm_dd 07 20) (repeat "irrigation onion"))
  (while
    (wait (or (crop_ds_after "Onion - planting of sets" 0.85 []) (mm_dd 08 15)))
    (repeat "irrigation onion"))
  (wait (or (crop_ds_after "Onion - planting of sets" 0.85 []) (mm_dd 09 01)))
  (harvest "Onion - planting of sets" (stub 0.0 [cm]) (sorg 1.0) (stem 0.0) (leaf 0.0)))
```

### Action White cabbage - transplanted management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "White cabbage - transplanted management"
  activity
  (wait_mm_dd 05 01)
  (fertilize (KAS (weight 125 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "White cabbage - transplanted")
  (while (wait_mm_dd 06 21) (repeat "irrigation"))
  (fertilize ("NPK 14-3-18" (weight 75 [kg N/ha])))
  (while (wait_mm_dd 7 31) (repeat "irrigation"))
  (fertilize ("NS 24-7" (weight 50 [kg N/ha])))
  (while (wait_mm_dd 10 01) (repeat "irrigation"))
  (wait (or (crop_ds_after "White cabbage - transplanted" 0.85 []) (mm_dd 10 25)))
  (harvest
    "White cabbage - transplanted"
    (stub 0.0 [cm])
    (sorg 1.0)
    (stem 0.0)
    (leaf 0.0)))
```

### Action Early white cabbage - transplanted management

Parent activity, from sample/dk-veg-man.dai.

```
(defaction
  "Early white cabbage - transplanted management"
  activity
  (wait_mm_dd 04 01)
  (fertilize (KAS (weight 150 [kg N/ha])))
  (harrowing)
  (seed_bed_preparation)
  (sow "Early white cabbage - transplanted")
  (while (wait_mm_dd 04 25) (repeat "irrigation"))
  (fertilize ("NPK 14-3-18" (weight 50 [kg N/ha])))
  (while (wait_mm_dd 05 20) (repeat "irrigation"))
  (while
    (wait (or (crop_ds_after "Early white cabbage - transplanted" 0.8 []) (mm_dd 07 01)))
    (repeat "irrigation"))
  (harvest
    "Early white cabbage - transplanted"
    (stub 0.0 [cm])
    (sorg 1.0)
    (stem 0.0)
    (leaf 0.0)))
```

### Action none

Parent activity, from sample/genweather.dai.

```
(defaction none activity)
```

### Action irrigate_30_tensiometer_overhead

Parent activity, from sample/irrigation.dai.

```
(defaction
  irrigate_30_tensiometer_overhead
  activity ;; An irrigation strategy based on a tensiometer. ;; If the soil water pressure at 20 cm depth gets below -300 cm in the ;; period between the first of May and the first of September, apply 10 ;; mm/h overhead irrigation for 3 hours, for a total of 30 mm.  Then wait ;; two days to give the irrigated water a chance to reach the ;; tensiometer. ;; ;; We wait until all these conditions are true:
  (wait
    (and
      (after_mm_dd 5 1) ;After May the first.
      (before_mm_dd 8 1) ;Before August the first. ;; Potential below -300 cm at 20 cm depth.
      (not (soil_water_pressure_above (height -20.0 [cm]) (potential -300 [cm]))))) ;; Overhead irrigation of 10 mm/h for 3 hours.
  (irrigate_overhead 10 [mm/h] (hours 3)) ;; Wait two days to allow water to reach the tensiometer.
  (wait_days 2))
```

### Action irrigate_30_content_overhead

Parent activity, from sample/irrigation.dai.

```
(defaction
  irrigate_30_content_overhead
  activity ;; An irrigation strategy based on a soil water content. ;; If the soil contain less than 60 mm water from the surface down to 50 ;; cm deprn, in the period between the first of May and the first of ;; September, apply 10 mm/h overhead irrigation for 3 hours, for a total ;; of 30 mm.  Then wait one day to give the irrigated water a chance to ;; enter the soil. ;; We wait until all these conditions are true:
  (wait
    (and
      (after_mm_dd 5 1) ;After May the first.
      (before_mm_dd 8 1) ;Before August the first. ;; Less than 60 mm water in the top half meter of the soil.
      (not (soil_water_content_above 60 [mm] (from 0 [cm]) (to -50 [cm]))))) ;; Overhead irrigation of 10 mm/h for 3 hours.
  (irrigate_overhead 10 [mm/h] (hours 3)) ;; Wait one day to allow water to reach the tensiometer.
  (wait_days 1))
```

### Action it_irrigate_crop

Parent activity, from sample/it-management.dai.

```
(defaction
  it_irrigate_crop
  activity
  (wait (and (after_mm_dd 5 10) (before_mm_dd 7 15)))
  (irrigate_overhead 25)
  (wait_days 15))
```

### Action WP1 IT 2005 warmup

Parent activity, from sample/it-management.dai.

```
(defaction
  "WP1 IT 2005 warmup"
  activity ;;StartTime 96
  (wait (mm_dd 10 25))
  (sow "Winter Wheat") ;;Grano Standard 97
  (wait (mm_dd 3 31))
  (fertilize (AmmoniumNitrate (weight 75.0 [kg N/ha])))
  (wait (mm_dd 7 10))
  (harvest "Winter Wheat" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 8 15))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 10 25))
  (sow "Winter Wheat") ;;Grano Standard 98
  (wait (mm_dd 3 31))
  (fertilize (AmmoniumNitrate (weight 75.0 [kg N/ha])))
  (wait (mm_dd 7 10))
  (harvest "Winter Wheat" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 8 15))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 11 15))
  (disk_harrowing) ;;Patata Modified (Tomato 99)
  (wait (mm_dd 4 15))
  (seed_bed_preparation)
  (wait (mm_dd 5 15))
  (sow "Potato; CER")
  (fertilize (Nitrate (weight 40.0 [kg N/ha])))
  (wait (mm_dd 5 30))
  (fertilize (Nitrate (weight 40.0 [kg N/ha])))
  (wait (mm_dd 6 15))
  (fertilize (Nitrate (weight 40.0 [kg N/ha])))
  (while
    (wait (mm_dd 7 15))
    (activity
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop))
  (wait (mm_dd 8 25))
  (harvest "Potato; CER" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 8 30))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 10 20))
  (seed_bed_preparation) ;;Bietola Standard (00)
  (wait (mm_dd 2 5))
  (seed_bed_preparation)
  (wait (mm_dd 2 20))
  (sow "Sugar Beet")
  (wait (mm_dd 2 21))
  (fertilize (AmmoniumNitrate (weight 75.0 [kg N/ha])))
  (wait (mm_dd 4 15))
  (fertilize (AmmoniumNitrate (weight 75.0 [kg N/ha])))
  (wait (mm_dd 7 10))
  (irrigate_overhead 50)
  (wait (mm_dd 9 25))
  (harvest "Sugar Beet" (stem 0) (leaf 0) (sorg 0.95))
  (wait (mm_dd 9 30))
  (wait trafficable)
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 10 20))
  (seed_bed_preparation)
  (wait (mm_dd 10 25))
  (sow "Winter Wheat") ;;Grano Standard 01
  (wait (mm_dd 3 31))
  (fertilize (AmmoniumNitrate (weight 75.0 [kg N/ha])))
  (wait (mm_dd 7 10))
  (harvest "Winter Wheat" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 8 15))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 11 15))
  (disk_harrowing) ;;Pea Modified (Sojabeen) 02
  (wait (mm_dd 5 1))
  (sow "Pea")
  (fertilize (Nitrate (weight 60.0 [kg N/ha])))
  (wait (mm_dd 9 20))
  (harvest "Pea" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 9 30))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 11 15))
  (disk_harrowing) ;;Patata Standard 03
  (wait (mm_dd 2 15))
  (seed_bed_preparation)
  (wait (mm_dd 3 1))
  (sow "Potato; CER") ;;(wait (mm_dd 3 1)) ;;(ridge (R_crust 0 [h]) ;;(switch 0.333) ;;(z (30) [cm]))
  (wait (mm_dd 3 15))
  (fertilize (AmmoniumNitrate (weight 100.0 [kg N/ha])))
  (wait (mm_dd 4 15))
  (fertilize (AmmoniumNitrate (weight 100.0 [kg N/ha])))
  (while
    (wait (mm_dd 7 15))
    (activity
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop
      it_irrigate_crop))
  (wait (mm_dd 7 25))
  (harvest "Potato; CER" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 8 30))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing)
  (wait (mm_dd 10 20))
  (seed_bed_preparation)
  (wait (mm_dd 10 25))
  (sow "Winter Wheat") ;;Grano Standard 04
  (wait (mm_dd 3 31))
  (fertilize (AmmoniumNitrate (weight 75.0)))
  (wait (mm_dd 7 10))
  (harvest "Winter Wheat" (stem 0.00) (leaf 0.00) (sorg 0.95))
  (wait (mm_dd 8 15))
  (plowing)
  (wait (mm_dd 10 15))
  (disk_harrowing))
```

### Action Maize_99

Parent activity, from sample/pl-management.dai.

```
(defaction
  Maize_99
  activity
  (wait_mm_dd 4 20)
  (fertilize (AmmoniumNitrate (weight 70 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Maize")
  (wait (or (crop_ds_after "Maize" 2.0) (mm_dd 9 25)))
  (harvest "Maize" (stub 8 [cm]) (stem 1.00 []) (leaf 1.00 []))
  (wait_mm_dd 9 27)
  (stubble_cultivation))
```

### Action Potato_00

Parent activity, from sample/pl-management.dai.

```
(defaction
  Potato_00
  activity
  (wait_mm_dd 10 23)
  (fertilize ("cattleJad_manure04" (weight 25 [Mg w.w./ha])))
  (plowing)
  (wait_mm_dd 4 15)
  (fertilize (AmmoniumNitrate (weight 90 [kg N/ha])))
  (wait_mm_dd 4 19)
  (seed_bed_preparation)
  (sow "Potato; Triada")
  (wait (or (crop_ds_after "Potato; IHAR 2004" 2.0 []) (mm_dd 9 10)))
  (harvest "Potato; IHAR 2004" (stem 0.00 []) (leaf 0.00 []))
  (wait_mm_dd 9 23))
```

### Action SWheat_01

Parent activity, from sample/pl-management.dai.

```
(defaction
  SWheat_01
  activity
  (wait_mm_dd 11 12)
  (plowing)
  (wait_mm_dd 4 03)
  (fertilize (AmmoniumNitrate (weight 20 [kg N/ha])))
  (wait_mm_dd 4 06)
  (seed_bed_preparation)
  (sow "Spring Wheat")
  (wait (or (crop_ds_after "Spring Wheat" 2.0) (mm_dd 8 12)))
  (harvest "Spring Wheat" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation))
```

### Action WWheat_02

Parent activity, from sample/pl-management.dai.

```
(defaction
  WWheat_02
  activity
  (wait_mm_dd 9 20)
  (fertilize (AmmoniumNitrate (weight 24 [kg N/ha])))
  (wait_mm_dd 9 28)
  (seed_bed_preparation)
  (sow "Winter Wheat")
  (wait_mm_dd 5 21)
  (fertilize (AmmoniumNitrate (weight 46 [kg N/ha])))
  (wait (or (crop_ds_after "Winter Wheat" 2.0) (mm_dd 8 03)))
  (harvest "Winter Wheat" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation))
```

### Action SWheat_03

Parent activity, from sample/pl-management.dai.

```
(defaction
  SWheat_03
  activity
  (wait_mm_dd 11 06)
  (plowing)
  (wait_mm_dd 4 10)
  (fertilize (AmmoniumNitrate (weight 20 [kg N/ha])))
  (wait_mm_dd 4 12)
  (seed_bed_preparation) ;7/2-06 cto; Because Spring wheat else don't give any yield
  (sow ("Spring Wheat" (Canopy (SpLAIfac (0.0 100) (1.0 100))))) ;;(sow "Spring Wheat")
  (wait_mm_dd 4 29)
  (fertilize (AmmoniumNitrate (weight 68 [kg N/ha])))
  (wait (or (crop_ds_after "Spring Wheat" 2.0) (mm_dd 8 10)))
  (harvest "Spring Wheat" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation))
```

### Action WP1 PL 2004 warmup

Parent activity, from sample/pl-management.dai.

```
(defaction
  "WP1 PL 2004 warmup"
  activity
  Maize_99
  Potato_00
  SWheat_01
  WWheat_02
  SWheat_03)
```

### Action Lettuce_management

Parent activity, from sample/safir-site.dai.

```
(defaction
  Lettuce_management
  activity
  (wait_mm_dd 10 18)
  (plowing)
  (wait_mm_dd 4 18)
  (seed_bed_preparation)
  (wait_mm_dd 5 5)
  (sow ("Lettuce"))
  (wait_mm_dd 7 21)
  (fertilize (mineral (weight 89.68 [kg N/ha]) (NH4_fraction 0.5 [])))
  (wait_mm_dd 8 1)
  (fertilize (mineral (weight 89.68 [kg N/ha]) (NH4_fraction 0.5 [])))
  (wait_mm_dd 8 18)
  (fertilize (mineral (weight 89.68 [kg N/ha]) (NH4_fraction 0.5 [])))
  (wait_mm_dd 9 25)
  (harvest "Lettuce"))
```

### Action warmup

Parent n/a, from sample/safir-site.dai.

```
(defaction warmup (Lettuce_management))
```

### Action Crop_management

Parent activity, from sample/safir-site.dai.

```
(defaction
  Crop_management
  activity
  (wait_mm_dd 10 18)
  (plowing)
  (wait_mm_dd 4 18)
  (seed_bed_preparation)
  (wait_mm_dd 5 5)
  (sow ("SiteCrop") (seed 2765 [kg w.w./ha]) (plant_distance 0.30 [m]))
  (wait_mm_dd 9 25)
  (harvest "SiteCrop"))
```

### Action irrigation_subsoil_full

Parent activity, from sample/safir-site.dai.

```
(defaction
  irrigation_subsoil_full
  activity
  "Fully irrigated soil."
  (wait_mm_dd 7 21 (hour 10))
  (progn
    (irrigate_subsoil
      2.6
      [mm/h]
      (remaining_time 5.0 [h])
      (solute (NO3 1.725 [kg N/ha/mm]) (NH4 1.725 [kg N/ha/mm]))
      (volume left-drip))
    (irrigate_subsoil
      2.6
      [mm/h]
      (remaining_time 5.0 [h])
      (solute (NO3 1.725 [kg N/ha/mm]) (NH4 1.725 [kg N/ha/mm]))
      (volume right-drip)))
  (wait_mm_dd 7 26 (hour 10))
  (progn
    (irrigate_subsoil 2.6 [mm/h] (remaining_time 5.0 [h]) (volume left-drip))
    (irrigate_subsoil 2.6 [mm/h] (remaining_time 5.0 [h]) (volume right-drip)))
  (wait_mm_dd 7 28 (hour 10))
  (progn
    (irrigate_subsoil 2.75 [mm/h] (remaining_time 5.0 [h]) (volume left-drip))
    (irrigate_subsoil 2.75 [mm/h] (remaining_time 5.0 [h]) (volume right-drip)))
  (wait_mm_dd 8 1 (hour 10))
  (progn
    (irrigate_subsoil
      2.6
      [mm/h]
      (remaining_time 5.0 [h])
      (solute (NO3 1.725 [kg N/ha/mm]) (NH4 1.725 [kg N/ha/mm]))
      (volume left-drip))
    (irrigate_subsoil
      2.6
      [mm/h]
      (remaining_time 5.0 [h])
      (solute (NO3 1.725 [kg N/ha/mm]) (NH4 1.725 [kg N/ha/mm]))
      (volume right-drip)))
  (wait_mm_dd 8 18 (hour 10))
  (progn
    (irrigate_subsoil
      2.6
      [mm/h]
      (remaining_time 5.0 [h])
      (solute (NO3 1.725 [kg N/ha/mm]) (NH4 1.725 [kg N/ha/mm]))
      (volume left-drip))
    (irrigate_subsoil
      2.6
      [mm/h]
      (remaining_time 5.0 [h])
      (solute (NO3 1.725 [kg N/ha/mm]) (NH4 1.725 [kg N/ha/mm]))
      (volume right-drip))))
```

### Action irrigation_subsoil_PRD_left

Parent activity, from sample/safir-site.dai.

```
(defaction
  irrigation_subsoil_PRD_left
  activity
  "PRD irrigated soil, left side."
  (wait_mm_dd 7 21 (hour 10))
  (irrigate_subsoil
    3
    [mm/h]
    (remaining_time 6.0 [h])
    (solute (NO3 1.25 [kg N/ha/mm]) (NH4 1.25 [kg N/ha/mm]))
    (volume left-drip))
  (wait_mm_dd 7 28 (hour 10))
  (irrigate_subsoil 3.5 [mm/h] (remaining_time 2.0 [h]) (volume left-drip))
  (wait_mm_dd 8 1 (hour 10))
  (irrigate_subsoil
    2.7
    [mm/h]
    (remaining_time 4.0 [h])
    (solute (NO3 2.076 [kg N/ha/mm]) (NH4 2.076 [kg N/ha/mm]))
    (volume left-drip))
  (wait_mm_dd 8 11 (hour 10))
  (irrigate_subsoil
    2.7
    [mm/h]
    (remaining_time 4.0 [h])
    (solute (NO3 2.076 [kg N/ha/mm]) (NH4 2.076 [kg N/ha/mm]))
    (volume left-drip)))
```

### Action irrigation_subsoil_PRD_right

Parent activity, from sample/safir-site.dai.

```
(defaction
  irrigation_subsoil_PRD_right
  activity
  "PRD irrigated soil, right side."
  (wait_mm_dd 7 21 (hour 10))
  (irrigate_subsoil
    3
    [mm/h]
    (remaining_time 6.0 [h])
    (solute (NO3 1.25 [kg N/ha/mm]) (NH4 1.25 [kg N/ha/mm]))
    (volume right-drip))
  (wait_mm_dd 7 26 (hour 10))
  (irrigate_subsoil 3 [mm/h] (remaining_time 6.0 [h]) (volume right-drip))
  (wait_mm_dd 8 1 (hour 10))
  (irrigate_subsoil
    2.7
    [mm/h]
    (remaining_time 4.0 [h])
    (solute (NO3 2.076 [kg N/ha/mm]) (NH4 2.076 [kg N/ha/mm]))
    (volume right-drip))
  (wait_mm_dd 8 11 (hour 10))
  (irrigate_subsoil
    2.7
    [mm/h]
    (remaining_time 4.0 [h])
    (solute (NO3 2.076 [kg N/ha/mm]) (NH4 2.076 [kg N/ha/mm]))
    (volume right-drip)))
```

### Action SBeet_management

Parent activity, from sample/sk-management.dai.

```
(defaction
  SBeet_management
  activity
  (wait_mm_dd 3 18)
  (fertilize ("cattle_manure" (weight 40 [T w.w./ha])) (to -5 [cm]))
  (wait_mm_dd 3 21)
  (seed_bed_preparation)
  (sow "Sugar Beet")
  (wait_mm_dd 5 12)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 5 20)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 6 1)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 7 3)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 8 10)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 8 12)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 8 15)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 8 18)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Sugar Beet" 2.0) (mm_dd 10 31)))
  (harvest "Sugar Beet" (leaf 0.00 []))
  (disk_harrowing)
  (wait_days 2)
  (plowing))
```

### Action SBarley_94

Parent activity, from sample/sk-management.dai.

```
(defaction
  SBarley_94
  activity
  (wait_mm_dd 3 29)
  (fertilize (AmmoniumNitrate (weight 70 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Spring Barley_SK")
  (wait_mm_dd 5 31)
  (irrigate_overhead 2 [mm/h] (hours 15))
  (wait_mm_dd 6 8)
  (irrigate_overhead 2 [mm/h] (hours 15))
  (wait_mm_dd 6 15)
  (irrigate_overhead 2 [mm/h] (hours 15))
  (wait (or (crop_ds_after "Spring Barley_SK" 2.0) (mm_dd 8 15)))
  (harvest "Spring Barley_SK" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation))
```

### Action WWheat_95

Parent activity, from sample/sk-management.dai.

```
(defaction
  WWheat_95
  activity
  (wait_mm_dd 8 21)
  (rotavation)
  (wait_mm_dd 10 1)
  (fertilize (AmmoniumNitrate (weight 40 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Winter Wheat_SK")
  (wait_mm_dd 3 1)
  (wait trafficable)
  (fertilize (AmmoniumNitrate (weight 50 [kg N/ha])))
  (wait_mm_dd 5 2)
  (fertilize (AmmoniumNitrate (weight 30 [kg N/ha])))
  (wait_mm_dd 5 22)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Winter Wheat_SK" 2.0) (mm_dd 8 31)))
  (harvest "Winter Wheat_SK" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation)
  (wait_mm_dd 10 1)
  (plowing))
```

### Action Maize_1996

Parent activity, from sample/sk-management.dai.

```
(defaction
  Maize_1996
  activity
  (wait_mm_dd 4 20)
  (fertilize (AmmoniumNitrate (weight 120 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Maize_SK")
  (wait_mm_dd 6 2)
  (irrigate_overhead 2 [mm/h] (hours 15))
  (wait_mm_dd 6 10)
  (irrigate_overhead 2 [mm/h] (hours 20))
  (wait_mm_dd 7 17)
  (irrigate_overhead 2 [mm/h] (hours 15))
  (wait_mm_dd 7 21)
  (irrigate_overhead 2 [mm/h] (hours 15))
  (wait (or (crop_ds_after "Maize_SK" 2.0) (mm_dd 10 10)))
  (harvest "Maize_SK" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation)
  (wait_mm_dd 10 15)
  (fertilize ("cattle_manure" (weight 40 [T w.w./ha])) (to -5 [cm])))
```

### Action Maize_1997

Parent activity, from sample/sk-management.dai.

```
(defaction
  Maize_1997
  activity
  (wait_mm_dd 4 21)
  (fertilize (AmmoniumNitrate (weight 80 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Maize_SK")
  (wait_mm_dd 5 12)
  (fertilize (AmmoniumNitrate (weight 40 [kg N/ha])))
  (wait_mm_dd 6 1)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 10)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 25)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 8 7)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 8 8)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 8 14)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 8 16)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Maize_SK" 2.0) (mm_dd 10 5)))
  (harvest "Maize_SK" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (wait_mm_dd 10 6)
  (fertilize (AmmoniumNitrate (weight 40 [kg N/ha])))
  (stubble_cultivation)
  (wait_days 2)
  (rotavation))
```

### Action SBarley_98

Parent activity, from sample/sk-management.dai.

```
(defaction
  SBarley_98
  activity
  (wait_mm_dd 3 31)
  (fertilize (AmmoniumNitrate (weight 60 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Spring Barley_SK")
  (wait_mm_dd 5 5)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 5 11)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 5 21)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 5 28)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 5)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 20)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Spring Barley_SK" 2.0) (mm_dd 8 15)))
  (harvest "Spring Barley_SK" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation)
  (wait_mm_dd 10 1)
  (rotavation))
```

### Action Pea_99

Parent activity, from sample/sk-management.dai.

```
(defaction
  Pea_99
  activity
  (wait_mm_dd 3 15)
  (fertilize (AmmoniumNitrate (weight 30 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Pea")
  (wait_mm_dd 5 6)
  (irrigate_overhead 2 [mm/h] (hours 12))
  (wait_mm_dd 5 24)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait_mm_dd 5 30)
  (irrigate_overhead 2 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Pea" 2.0) (mm_dd 8 15)))
  (harvest "Pea" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation)
  (wait_mm_dd 10 15)
  (fertilize ("cattle_manure" (weight 40 [T w.w./ha])) (to -5 [cm])))
```

### Action Maize_2000

Parent activity, from sample/sk-management.dai.

```
(defaction
  Maize_2000
  activity
  (wait_mm_dd 4 21)
  (fertilize (AmmoniumNitrate (weight 120 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Maize_SK")
  (wait_mm_dd 5 10)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 2)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 12)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 20)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 7 1)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 7 9)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 7 20)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 8 10)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 8 18)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 8 25)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Maize_SK" 2.0) (mm_dd 10 01)))
  (harvest "Maize_SK" (stub 8 [cm]) (stem 0.00 []) (leaf 0.00 []))
  (stubble_cultivation))
```

### Action S_Barley_01

Parent activity, from sample/sk-management.dai.

```
(defaction
  S_Barley_01
  activity
  (wait_mm_dd 3 15)
  (fertilize (AmmoniumNitrate (weight 50 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Spring Barley_SK")
  (wait_mm_dd 4 30)
  (fertilize (AmmoniumNitrate (weight 30 [kg N/ha])))
  (wait_mm_dd 5 10)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 5 21)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 3)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 12)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Spring Barley_SK" 2.0) (mm_dd 8 31)))
  (harvest "Spring Barley_SK" (stub 8 [cm]) (stem 1.00 []) (leaf 1.00 []))
  (stubble_cultivation))
```

### Action W_Wheat_02

Parent activity, from sample/sk-management.dai.

```
(defaction
  W_Wheat_02
  activity
  (wait_mm_dd 8 21)
  (rotavation)
  (wait_mm_dd 10 1)
  (fertilize (AmmoniumNitrate (weight 30 [kg N/ha])))
  (seed_bed_preparation)
  (sow "Winter Wheat_SK")
  (wait_mm_dd 3 15)
  (wait trafficable)
  (fertilize (AmmoniumNitrate (weight 60 [kg N/ha])))
  (wait_mm_dd 5 10)
  (fertilize (AmmoniumNitrate (weight 30 [kg N/ha])))
  (wait_mm_dd 5 12)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 5 22)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 5 31)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait_mm_dd 6 20)
  (irrigate_overhead 3 [mm/h] (hours 10))
  (wait (or (crop_ds_after "Winter Wheat_SK" 2.0) (mm_dd 8 31)))
  (harvest "Winter Wheat_SK" (stub 8 [cm]) (stem 1.00 []) (leaf 1.00 []))
  (stubble_cultivation)
  (wait_mm_dd 10 1)
  (plowing))
```

### Action WP1 SK 2003 warmup

Parent activity, from sample/sk-management.dai.

```
(defaction
  "WP1 SK 2003 warmup"
  activity
  SBeet_management
  SBarley_94
  WWheat_95
  Maize_1996
  Maize_1997
  SBarley_98
  Pea_99
  Maize_2000
  S_Barley_01
  W_Wheat_02)
```

### Action sow_Spring_Barley

Parent n/a, from sample/test-aba.dai.

```
(defaction
  sow_Spring_Barley
  (sow
    ("Spring Barley"
      (enable_N_stress false) ;; ABA production in roots is affected by soil water potential.
      (Root (ABAprod "Fulai Liu uptake")) ;; Stomata conductivity is affected by ABA. ;; Doesn't work right now.
      (LeafPhot
        FC_C3
        (Xn 6e-3 [mol/mol/s])
        (Stomatacon Leuning (m 11 []) (b 0.01 [mol/m^2/s]) (beta 1555311.743 [cm^3/g]))
        (TempEff (0 1) (100 1))))))
```

### Action MyMan

Parent activity, from sample/test-organic.dai.

```
(defaction
  MyMan
  activity
  (wait (at 1987 3 20 1))
  (plowing)
  (wait (at 1987 4 4 1))
  (fertilize (mineral (weight 100.0 [kg N/ha]) (NH4_fraction 0.5 [])))
  (wait (at 1987 4 5 1))
  (sow "NewSB")
  (wait (or (crop_ds_after "NewSB" 2.0) (at 1987 9 5 1)))
  (harvest "NewSB"))
```

### Action DK 2005 PRD

Parent activity, from sample/test-prd.dai.

```
(defaction
  "DK 2005 PRD"
  activity ;; Virtual experiment with PRD based on FertOrgaNic treatment 3.
  (wait (mm_dd 12 2))
  (plowing)
  (wait (mm_dd 4 7))
  (fertilize (jynd2005_slurry (weight 12.73)) (from 0) (to -10))
  (wait (mm_dd 4 8))
  (seed_bed_preparation)
  (wait (mm_dd 4 11))
  (sow ("Potato; Exp") (seed 2765 [kg w.w./ha]) (row_width 1 [m])) ;; Watering left side.
  (wait (mm_dd 5 28))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 5 29))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 5 30))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 1))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 3))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 9))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 10))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 11))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l]))) ;; Watering right side.
  (wait (mm_dd 6 17))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 21))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 22))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 24))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 25))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 2)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l]))) ;; Watering left side.
  (wait (mm_dd 6 27))
  (irrigate_subsoil
    2.133
    [mm/h]
    (hours 3)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 28))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 29))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 6 30))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 1))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 3))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 5))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 7))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 9))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l]))) ;; Watering right side.
  (wait (mm_dd 7 11))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 12))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 13))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 14))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 3)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 15))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 18))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 20))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 22))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume right-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l]))) ;; Watering left side.
  (wait (mm_dd 7 25))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 7 28))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 8 1))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 8 5))
  (irrigate_subsoil
    2
    [mm/h]
    (hours 1)
    (volume left-drip)
    (solute (NH4 0 [mg N/l]) (NO3 0 [mg N/l])))
  (wait (mm_dd 8 15))
  (harvest "Potato; Exp" (stem 0.00) (leaf 0.00) (sorg 1.00)))
```

## Programs

| Name | Parent | File |
|:--|:--|:--|
| Common | Daisy | sample/DrainDrying.dai |
| Drainage test | Common | sample/DrainDrying.dai |
| Drying test | Common | sample/DrainDrying.dai |
| main | batch | sample/DrainDrying.dai |
| JB1_PFAS | Daisy | sample/PFAS-sample.dai |
| Oak | Daisy | sample/afforestation.dai |
| Andeby | Daisy | sample/batch.dai |
| Andeby Cosby | Andeby | sample/batch.dai |
| Andeby HYPRES | Andeby | sample/batch.dai |
| Cosby et.al. vs. HYPRES | batch | sample/batch.dai |
| RefSim | Daisy | sample/checkpoint-1988-4-1+1.dai |
| RefSim Checkpoint | RefSim | sample/checkpoint-1988-4-1+1.dai |
| WP1 CZ RISWC 2004 | Daisy | sample/cz-sample.dai |
| GenWeather | Daisy | sample/genweather.dai |
| main | write | sample/heat-properties.dai |
| WP1 IT CER 2005 | Daisy | sample/it-sample.dai |
| WP1 PL IHAR 2004 | Daisy | sample/pl-sample.dai |
| MyMatch | rootmatch | sample/rootmatch.dai |
| Safir | Daisy | sample/safir-common.dai |
| Field-2006 | Safir | sample/safir-site.dai |
| Crop-Subsoil-Full | Field-2006 | sample/safir-site.dai |
| Crop-Subsoil-PRD | Field-2006 | sample/safir-site.dai |
| main | write | sample/sample-heat.dai |
| WP1 SK RIIDLE 2003 | Daisy | sample/sk-sample.dai |
| RefSim | Daisy | sample/test-cp.dai |
| MySim | Daisy | sample/test-minimize.dai |
| MyOpt | minimize | sample/test-minimize.dai |
| MySim | Daisy | sample/test-organic.dai |
| convert | post-process | sample/test-post.dai |
| print_it | write | sample/test-python.dai |
| RefSim | Daisy | sample/test-refman.dai |
| SCN1 | RefSim Checkpoint | sample/test-scn.dai |
| SCN2 | RefSim Checkpoint | sample/test-scn.dai |
| scenarios | batch | sample/test-scn.dai |
| Base | Daisy | sample/test-spawn.dai |
| N-A-S | Base | sample/test-spawn.dai |
| N-A-W | Base | sample/test-spawn.dai |
| N-A-P | Base | sample/test-spawn.dai |
| N-J-S | Base | sample/test-spawn.dai |
| N-J-W | Base | sample/test-spawn.dai |
| N-J-P | Base | sample/test-spawn.dai |
| N-F-S | Base | sample/test-spawn.dai |
| N-F-W | Base | sample/test-spawn.dai |
| N-F-P | Base | sample/test-spawn.dai |
| W-A-S | Base | sample/test-spawn.dai |
| W-A-W | Base | sample/test-spawn.dai |
| W-A-P | Base | sample/test-spawn.dai |
| W-J-S | Base | sample/test-spawn.dai |
| W-J-W | Base | sample/test-spawn.dai |
| W-J-P | Base | sample/test-spawn.dai |
| W-F-S | Base | sample/test-spawn.dai |
| W-F-W | Base | sample/test-spawn.dai |
| W-F-P | Base | sample/test-spawn.dai |
| all | spawn | sample/test-spawn.dai |
| AndebyFarm | Daisy | sample/test.dai |

## Log types

| Name | Parent | File |
|:--|:--|:--|
| OpenMI_output | extern | lib/OpenMI.dai |
| Lower_boundary_output | OpenMI_output | lib/OpenMI.dai |
| Crop_soil_content | OpenMI_output | lib/OpenMI.dai |
| Soil Content 0-10 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 10-20 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 20-30 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 30-40 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 40-50 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 50-60 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 60-70 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 70-80 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 80-90 cm | Total Soil Content | lib/log-old.dai |
| Soil Content 90-100 cm | Total Soil Content | lib/log-old.dai |
| Hourly Water Flux | Matrix Water Flux | lib/log-old.dai |
| Daily Water Flux | Hourly Water Flux | lib/log-old.dai |
| Soil Nitrate Concentration | column | lib/log-old.dai |
| Soil Water NO3 Concentration | column | lib/log-old.dai |
| Root Zone Water Balance 0-100 cm | Root Zone Water Balance | lib/log-old.dai |
| N Balance 0-100 cm | N Balance | lib/log-old.dai |
| Monthly N Balance 100 cm | N Balance 0-100 cm | lib/log-old.dai |
| Soil Chemical | Soil Chemicals | lib/log-old.dai |
| Soil Chemicals 0-100 cm | Soil Chemicals | lib/log-old.dai |
| Soil Chemical 0-100 cm | Soil Chemical | lib/log-old.dai |
| Harvest | harvest | lib/log-old.dai |
| Evapotranspiration | simple | lib/log-old.dai |
| Surface Water Balance | column | lib/log-old.dai |
| column | table | lib/log-std.dai |
| crop | column | lib/log-std.dai |
| chemical | column | lib/log-std.dai |
| biopore | column | lib/log-std.dai |
| Crop | crop | lib/log-std.dai |
| Field water balance | balance | lib/log-std.dai |
| Field water | column | lib/log-std.dai |
| Soil water balance | balance | lib/log-std.dai |
| Biopore water balance | balance | lib/log-std.dai |
| Matrix water balance | balance | lib/log-std.dai |
| Soil water | column | lib/log-std.dai |
| Field nitrogen balance | balance | lib/log-std.dai |
| Field mineral nitrogen balance | balance | lib/log-std.dai |
| Field crop nitrogen balance | balance | lib/log-std.dai |
| Field organic nitrogen balance | balance | lib/log-std.dai |
| Field nitrogen | column | lib/log-std.dai |
| N_balance | balance | lib/log-std.dai |
| Soil NO3- balance | N_balance | lib/log-std.dai |
| Soil NH4+ balance | N_balance | lib/log-std.dai |
| Soil mineral-N balance | N_balance | lib/log-std.dai |
| Soil organic-N balance | N_balance | lib/log-std.dai |
| Soil N balance | N_balance | lib/log-std.dai |
| Soil nitrogen | column | lib/log-std.dai |
| Field chemical | chemical | lib/log-std.dai |
| Soil chemical balance | balance | lib/log-std.dai |
| Biopore chemical balance | balance | lib/log-std.dai |
| Matrix chemical balance | balance | lib/log-std.dai |
| Soil chemical | chemical | lib/log-std.dai |
| Total Soil Content | column | lib/log.dai |
| Soil N Residuals | column | lib/log.dai |
| Soil C Residuals | column | lib/log.dai |
| NO3 Root Uptake | column | lib/log.dai |
| NH4 Root Uptake | column | lib/log.dai |
| Soil NO3 Concentration | column | lib/log.dai |
| Soil NO3-N Concentration | column | lib/log.dai |
| Soil NH4-N Concentration | column | lib/log.dai |
| Soil NH4-N Content | column | lib/log.dai |
| Soil Temperature | column | lib/log.dai |
| Soil Water Potential | column | lib/log.dai |
| Soil Water Potential (pF) | column | lib/log.dai |
| Soil Water Sink | column | lib/log.dai |
| Soil Hydraulic Conductivity (log10) | column | lib/log.dai |
| Soil Heat Conductivity | column | lib/log.dai |
| Soil Heat Capacity | column | lib/log.dai |
| Soil Ice | column | lib/log.dai |
| Soil Ice Buffer | column | lib/log.dai |
| Preferential Water Flux | column | lib/log.dai |
| Matrix Water Flux | column | lib/log.dai |
| Preferential Chemical Transport | chemical | lib/log.dai |
| Matrix Chemical Transport | chemical | lib/log.dai |
| Preferential NO3 Transport | column | lib/log.dai |
| Preferential NH4 Transport | column | lib/log.dai |
| Evapotranspiration | simple | lib/log.dai |
| Surface water balance2 | n/a | lib/log.dai |
| Surface Water Balance | column | lib/log.dai |
| Denitrification | column | lib/log.dai |
| Soil Heat Balance | column | lib/log.dai |
| Snow | column | lib/log.dai |
| Surface Chemicals | chemical | lib/log.dai |
| Chemical Content | chemical | lib/log.dai |
| Chemical Concentration | chemical | lib/log.dai |
| Chemical Content Secondary | Chemical Content | lib/log.dai |
| Chemical Concentration Secondary | Chemical Concentration | lib/log.dai |
| reaction | column | lib/log.dai |
| Chemistry | reaction | lib/log.dai |
| Weather | column | lib/log.dai |
| Crop Photosynthesis | crop | lib/log.dai |
| Crop Production | crop | lib/log.dai |
| Forced LAI | crop | lib/log.dai |
| Simple Crop Production | crop | lib/log.dai |
| Old Crop Production | column | lib/log.dai |
| Vegetation | column | lib/log.dai |
| Permanent Vegetation | column | lib/log.dai |
| Root Density | crop | lib/log.dai |
| Root form parameter | crop | lib/log.dai |
| Bioclimate | column | lib/log.dai |
| PMSW | column | lib/log.dai |
| SSOC | column | lib/log.dai |
| Groundwater | column | lib/log.dai |
| Bioincorporation | column | lib/log.dai |
| aom | column | lib/log.dai |
| AOM | aom | lib/log.dai |
| AOM Pools | aom | lib/log.dai |
| Organic Matter | column | lib/log.dai |
| DOM Pools | column | lib/log.dai |
| pool | column | lib/log.dai |
| DOM Pool N Balance | balance | lib/log.dai |
| DOM Pool C Balance | balance | lib/log.dai |
| DOM Pool | pool | lib/log.dai |
| DOM-N | pool | lib/log.dai |
| DOM-C | pool | lib/log.dai |
| Drain Sink Water | column | lib/log.dai |
| Biopore Drain Sink Water | column | lib/log.dai |
| Drain Sink NO3 | column | lib/log.dai |
| Drain Sink NH4 | column | lib/log.dai |
| Soil Water Content | column | lib/log.dai |
| Fertilizer | column | lib/log.dai |
| Fertilizer Yearly | Fertilizer | lib/log.dai |
| Crop Carbon Balance | simple | lib/log.dai |
| Litter Carbon Balance | simple | lib/log.dai |
| Soil Carbon Balance | simple | lib/log.dai |
| Total Carbon Balance | simple | lib/log.dai |
| C Input | simple | lib/log.dai |
| Carbon Balance | crop | lib/log.dai |
| Tertiary biopores water | biopore | lib/log.dai |
| Matrix to biopores | column | lib/log.dai |
| Biopores to matrix | column | lib/log.dai |
| Surface water | balance | lib/log.dai |
| Snow water | balance | lib/log.dai |
| Canopy water | balance | lib/log.dai |
| Litter water | balance | lib/log.dai |
| Ponded water | balance | lib/log.dai |
| Surface water | column | lib/log.dai |
| Colloids balance | balance | lib/log.dai |
| Colloids pool balance | balance | lib/log.dai |
| Colloids | column | lib/log.dai |
| Failure | column | lib/log.dai |
| LeafPhot | crop | lib/log.dai |
| Stomatacon | LeafPhot | lib/log.dai |
| Time | column | lib/log.dai |
| Drain lateral | column | lib/log.dai |
| biopore-chemical | chemical | lib/log.dai |
| Biopore content | balance | lib/log.dai |
| Biopore chemical | biopore-chemical | lib/log.dai |
| Biopore water | biopore | lib/log.dai |
| M2B | biopore | lib/log.dai |
| B2M | biopore | lib/log.dai |
| Crop uptake | crop | lib/log.dai |
| QtTime | Qt | lib/ui-Qt.dai |
| AWI | column | sample/PFAS-sample.dai |
| Afforestation | column | sample/afforestation.dai |
| SoilpH | column | sample/afforestation.dai |
| DailyWeather | table | sample/genweather.dai |
| MinMaxWeather | table | sample/genweather.dai |
| HourlyWeather | table | sample/genweather.dai |
| Sample water content | column | sample/log-sample.dai |
| Root zone water | crop | sample/safir-common.dai |
| TDR | crop | sample/safir-site.dai |
| ABAExtraction | crop | sample/test-aba.dai |
| H2OExtraction | crop | sample/test-aba.dai |
| ABACrop | crop | sample/test-aba.dai |
| Colloid bound sorption | balance | sample/test-colloids.dai |
| Colloid bound | balance | sample/test-colloids.dai |
| Colloid bound | chemical | sample/test-colloids.dai |
| compare | Rsqr | sample/test-minimize.dai |
| ABAExtraction | crop | sample/test-prd.dai |
| H2OExtraction | crop | sample/test-prd.dai |
| ABACrop | crop | sample/test-prd.dai |
| Root form GP2D | crop | sample/test-prd.dai |
| Root zone water | crop | sample/test-prd.dai |

