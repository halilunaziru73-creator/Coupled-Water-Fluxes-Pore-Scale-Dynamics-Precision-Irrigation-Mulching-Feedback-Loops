# The 107 reference topics {#daisy-topics}

The Model and documentation tab and the references of the experiment combinations follow the 107 topics of the Daisy program reference manual. For each topic this chapter gives its purpose, its sections, and the questions of the workbench that touch it.

## Topic 1: Introduction

What the manual is: a complete reference to all components and models Daisy provides, with their parameters, state variables and log variables, generated automatically from the code and listed alphabetically in part II. It is not an introduction to the model, a tutorial or a programmers manual.

## Topic 2: Concepts

Components, models and parameterizations: a component is a group of exchangeable models (for example crop, bioclimate, soil horizon), a model is one implementation, and a parameterization is a model with chosen attribute values. Attributes can be optional, have defaults, and be log variables.

## Topic 3: Nomenclature

Having covered the concepts, it is now possible to explain the nomenclature used in part II of the manual. As already explained, each library component has its own chapter, while all the fixed components are collected in chapter 107. All the library component chapters start with a short explanation of the purpose of that component. Each model (including those models that are part of a fixed component) has its own section. Here, we will explain how to read the content of these sections. This is best done with an exa

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 3.1 | Name and Description | The name of the section is 'fertilize', which is the name you have to specify in the | n/a |
| 3.2 | Sample | The next element in the section is a sample, which shows the format recognized by | n/a |
| 3.3 | The Attribute List | After the sample comes a list with information about each attribute in the model. | n/a |
| 3.4 | Submodels | Sometimes it is useful to combine attributes in a model into groups. One example | n/a |

## Topic 4: The file parser model

This section describes Daisy setup files. A Daisy setup file is read by the 'file' model of the 'parser' component, hence the strange name.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 4.1 | Types and Formatting | There are a few general rules for the formatting accepted by the 'file' parser. | n/a |
| 4.2 | Declaring new parameters | You can declare new parameters most places where you can specify parameter val- | n/a |
| 4.3 | Referring to parameters | Instead of a parameter value, you can specify the name of another parameter. | n/a |
| 4.4 | Toplevel | A Daisy setup file consist of definitions of parameterizations and a small number of | n/a |

## Topic 5: Log File Generation

The value of the 'output' attribute should be a sequence of log component parame- terizations. Each parameterization should specify some state or log variables to be output during the simulation. The 'log.dai' file contains a number of standard log parameterizations, for example 'Crop Production', which will write information about the development and production of any crops in the field to a file named 'crop prod.dlf' located in the directory specified by the 'directory' attribute, or, by default, the directory wh

## Topic 6: Error Messages

Sometimes the simulation will fail to run for some reason or another. In these cases, Daisy will attempt to give an error message, which hopefully will give some indication of what went wrong. There are zillions of situations where Daisy might give some error message, in the following we describe some of them.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 6.1 | Parser errors | If the format of the setup files is wrong, for example if there are missing parentheses | n/a |
| 6.2 | Completeness checks | After parsing the setup files, Daisy will check that all the required parameters and | n/a |
| 6.3 | Consistency checks | After checking that all the required attributes are there, Daisy will create the sim- | n/a |
| 6.4 | Runtime exceptions | Now Daisy is ready to run the simulation. However, some errors are too hard to find | Exception |
| 6.5 | Assertion failures | During debugging, a lot of 'assert' statements have been added to the code. Each | n/a |
| 6.6 | Program errors | Sometimes we can get errors that aren't even caught by the assertions, they can | n/a |

## Topic 7: ABAproduction

The 'ABAproduction' component calculates the prod of ABA in soil.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 7.1 | none | No ABA production. | n/a |
| 7.2 | root | ABA production based on production in roots. | n/a |
| 7.3 | soil | ABA production based on soil location. | n/a |
| 7.4 | uptake | ABA production based on concentration in water uptake. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 8: AOM

A single Added Organic Matter pool. Used by Harvesting @ Root (see 107.7, page 595) , and Bioincorporation @ AOM (see 107.11, page 605) . < component (N N ...) (C C ...) (heat factor heat factor ) (water factor water factor ) (turnover turnover ) (efficiency efficiency ...) (C per N C per N ...) (fractions fractions ...) (initial C per N initial C per N ) (initial fraction initial fraction ) (top C 0 [g C/cm2 ]) (top N 0 [g N/cm2 ]) >  N : number [g N/cm3 ] soil cells Optional state variable Nitrogen in each soil

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 8.1 | AOM-DIRECT | Third AOM pool of already decomposed material. | n/a |
| 8.2 | AOM-FAST | Fast AOM pool parameterization by Sander Bruun. See also [Bruun et al., 2003] | n/a |
| 8.3 | CROP-FAST | A 'AOM-FAST' model (see 8.2, page 54) build into Daisy. | n/a |
| 8.4 | AOM-SLOW | Slow AOM pool parameterization by Sander Bruun. See also [Bruun et al., 2003] | n/a |
| 8.5 | AOM-SLOW-BIOINCORPORATION | A 'AOM-SLOW' model (see 8.4, page 55) build into Daisy. | n/a |
| 8.6 | AOM-SLOW-OLD | A 'AOM-SLOW' model (see 8.4, page 55) build into Daisy. | n/a |
| 8.7 | CROP-SLOW | A 'AOM-SLOW' model (see 8.4, page 55) build into Daisy. | n/a |
| 8.8 | Ryegrass-SLOW | A 'CROP-SLOW' model (see 8.7, page 55) defined in 'ryegrass.dai'. | n/a |
| 8.9 | Wclover-SLOW | A 'CROP-SLOW' model (see 8.7, page 55) defined in 'wclover.dai'. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 9: AWI

Estimate area of air-water interface. < component       > Log Variables  area: number [cm2 /cm3 ] soil cells Air-Water interface area.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 9.1 | Brusseau2023 | Estimate AWI area from water and median particle size (Equation 5). See also | n/a |
| 9.2 | Costanza2008x | Estimate AWI area from water and median particle size (Equation 1 and 2). See | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 10: ClayOM

Find the effect of clay on organic matter processing.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 10.1 | biomod | Clay influence on organic matter from BIOMOD project. All SMB pools are af- | a |
| 10.2 | old | Traditional clay influence on organic matter. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 11: MV Crop

Description of a crop for use by the MARKVAND model.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 11.1 | default | Standard MARKVAND crop model. | L ge, L gm, L ym, S Le, S Lm, z xA, z m |

**Related theme.** the crop: growth, roots and water use.

## Topic 12: MV Soil

Description of a soil for use by the MARKVAND model.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 12.1 | default | Standard MARKVAND soil model. | z o, Theta fo, Theta wo, Theta fu, Theta wu, C e, c e, k qb |

**Related theme.** water and heat movement in the soil.

## Topic 13: SMB

A single Soil MicroBiological pool. < component (N N ...) (C C ...) (heat factor heat factor ) (water factor water factor ) (turnover turnover ) (efficiency efficiency ...) (C per N C per N ...) (fractions fractions ...) (initial C per N initial C per N ) (maintenance maintenance ) >  N : number [g N/cm3 ] soil cells Optional state variable Nitrogen in each soil interval.  C : number [g C/cm3 ] soil cells Optional state variable Carbon in each soil interval.  heat factor : plf [dg C → <none>] Optional parameter

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 13.1 | SMB-FAST | Fast SMB pool parameterization. | n/a |
| 13.2 | SMB-FAST-2000 | A 'SMB-FAST' model (see 13.1, page 66) build into Daisy. | n/a |
| 13.3 | SMB-SLOW | Slow SMB pool parameterization. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 14: SOM

A single Soil Organic Matter pool. < component (N N ...) (C C ...) (heat factor heat factor ) (water factor water factor ) (turnover turnover ) (efficiency efficiency ...) (C per N C per N ...) (fractions fractions ...) (initial C per N initial C per N ) >  N : number [g N/cm3 ] soil cells Optional state variable Nitrogen in each soil interval.  C : number [g C/cm3 ] soil cells Optional state variable Carbon in each soil interval.  heat factor : plf [dg C → <none>] Optional parameter Heat factor. If empty, use d

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 14.1 | SOM-FAST | Fast SOM pool parameterization by Sander Bruun. See also [Bruun et al., 2003] | n/a |
| 14.2 | SOM-FAST-OLD | A 'SOM-FAST' model (see 14.1, page 68) build into Daisy. | n/a |
| 14.3 | SOM-INERT | Inert SOM pool parameterization. | n/a |
| 14.4 | SOM-SLOW | Slow SOM pool parameterization by Sander Bruun. See also [Bruun et al., 2003] | n/a |
| 14.5 | SOM-SLOW-OLD | A 'SOM-SLOW' model (see 14.4, page 68) build into Daisy. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 15: action

The 'action' component represents management on different abstraction levels, from a single tillage operation to strategies of how to manage a farm. Typically, but not necessarily, the high level management strategies are build by combining low level management operations.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 15.1 | BBCH | Management according to external BBCH scale. | crop, file, from, to, from start, to start, do, when |
| 15.2 | assert | Assert that condition is true, if not, stop the simulation. | condition, message |
| 15.3 | at | Do action at specific time. | month, day, do |
| 15.4 | cond | Perform the actions associated with the first true condition in the list. | clauses, condition, actions |
| 15.5 | crop | Manage a specific crop or multicrop. | spray, month, day, name, amount, secondary, crop, date |
| 15.6 | emerge | Force a crop to emerge. | crop |
| 15.7 | error | Write a error message to the user. | message |
| 15.8 | extern | Select an external scope, and perform action. | scope, action |
| 15.9 | extern fertigation | Continiues irrigation with mineral nitrogen mix. | volume, surface, scope, from, to |
| 15.10 | extern subsoil | Subsoil irrigation controlled externally. | volume, scope, from, SOLETE, to, constituents |
| 15.11 | fertilize base | Shared parameters for all fertilize actions. | am, equivalent weight, minimum weight, precision, target, from, to |
| 15.12 | fertilize | A 'fertilize base' model (see 15.11, page 80) build into Daisy. | am, from, SOLETE, to, LETE |
| 15.13 | incorporate fertilizer | A 'fertilize base' model (see 15.11, page 80) build into Daisy. | am, volume |
| 15.14 | harvest base | Common parameters for harvest operations. | crop, combine, stub, stem, sorg |
| 15.15 | cut | A 'harvest base' model (see 15.14, page 81) build into Daisy. | n/a |
| 15.16 | harvest | A 'harvest base' model (see 15.14, page 81) build into Daisy. | n/a |
| 15.17 | if | If the condition is true, perform the first action, otherwise perform the second | then, else |
| 15.18 | irrigate base | Shared parameter for irrigate actions. | solute, name, value, hours, days, remaining time, temperature |
| 15.19 | irrigate overhead | A 'irrigate base' model (see 15.18, page 82) build into Daisy. | n/a |
| 15.20 | irrigate subsoil | A 'irrigate base' model (see 15.18, page 82) build into Daisy. | volume, from, SOLETE, to |
| 15.21 | irrigate surface | A 'irrigate base' model (see 15.18, page 82) build into Daisy. | n/a |
| 15.22 | markvand | Irrigate the field according to MARKVAND scheduling. | solute, name, value, dt, T sum, map, Daisy, MARKVAND |
| 15.23 | message | Write a message to the user. | message |
| 15.24 | mix | Mix soil content down to the specified depth. The effect is that nitrogen, water, | depth, random roughness, penetration, surface loose |
| 15.25 | disk harrowing | A 'mix' model (see 15.24, page 86) defined in 'tillage.dai'. | n/a |
| 15.26 | rotavation | A 'mix' model (see 15.24, page 86) defined in 'tillage.dai'. | n/a |
| 15.27 | seed bed preparation | A 'mix' model (see 15.24, page 86) defined in 'tillage.dai'. | n/a |
| 15.28 | stubble cultivation | A 'mix' model (see 15.24, page 86) defined in 'tillage.dai'. | n/a |
| 15.29 | nil | This action does nothing, always done. | n/a |
| 15.30 | panic | Write a error message to the user and stop the simulation. | message |
| 15.31 | pluck | Pluck a crop. Unlike the 'harvest' operation, this allows you to pluck selected parts | crop, stem, sorg |
| 15.32 | progn | Perform all the specified actions in the sequence listed. All the actions will be | actions |
| 15.33 | remove litter | Remove organic matter from soil surface. | n/a |
| 15.34 | remove solute | Remove a specific chemical from the field. | n/a |
| 15.35 | repeat | Perform all of the specified action. When done, repeat the action. The action may | repeat, do |
| 15.36 | restore SOM | Restore the content of the soil organic matter pools. | n/a |
| 15.37 | sequence | Perform all the specified actions in the sequence listed. Each action is performed | do |
| 15.38 | activity | A 'sequence' model (see 15.37, page 88) build into Daisy. | n/a |
| 15.39 | set porosity | Set the porosity of the horizon at the specified depth. To get useful results, you | depth, porosity |
| 15.40 | set surface detention capacity | Set amount of ponding the surface can retain. | height |
| 15.41 | sorption table | Print a sorption table for all chemicals. | Theta, start, intervals |
| 15.42 | sow base | Shared sowing parameters. | row position, row width, plant distance, plant position |
| 15.43 | sow | A 'sow base' model (see 15.42, page 89) build into Daisy. | crop |
| 15.44 | plant | A 'sow' model (see 15.43, page 90) build into Daisy. | n/a |
| 15.45 | sow name | A 'sow base' model (see 15.42, page 89) build into Daisy. | crop |
| 15.46 | sow object | A 'sow base' model (see 15.42, page 89) build into Daisy. | crop |
| 15.47 | spray | Spray a chemical (typically a pesticide) on the field. | amount |
| 15.48 | spray surface | Spray a chemical (typically a pesticide) on the field below the canopy. | amount |
| 15.49 | stop | Stop the simulation. | n/a |
| 15.50 | store SOM | Store the content of the soil organic matter pools. | n/a |
| 15.51 | swap | Swap two soil layers. The top layer start at the surface and goes down to 'middle', | depth, random roughness, middle |
| 15.52 | plowing | A 'swap' model (see 15.51, page 92) defined in 'tillage.dai'. | n/a |
| 15.53 | t | This action does nothing, never done. | n/a |
| 15.54 | table | Read management actions from a Daisy data file. | file, emerge, harvest, volume, missing, tag, dim line, enable irrigation |
| 15.55 | wait | Wait until the specified condition is true. | condition |
| 15.56 | wait mm dd | Wait until a specific month and day in the year. | month, day |
| 15.57 | wait period | Waits the specified period. | hours, days, end time |
| 15.58 | wait days | A 'wait period' model (see 15.57, page 95) build into Daisy. | n/a |
| 15.59 | wait hours | A 'wait period' model (see 15.57, page 95) build into Daisy. | n/a |
| 15.60 | warning | Write a warning to the user. | message |
| 15.61 | while | Perform all the specified actions in the sequence listed, but in the same timestep. | actions |
| 15.62 | with-column | Perform actions on a specific column. | column, actions |

**Related theme.** management.

**Combinations of the Experiments tab that use this topic.** Overhead, surface or drip irrigation; Overhead, surface or drip irrigation; Overhead, surface or drip irrigation; Irrigation and nitrogen together; Irrigation and nitrogen together; When to irrigate: the trigger and the depth of the sensor; How much and how fast: dose and duration; How much and how fast: dose and duration; Nitrogen fertiliser, irrigated and rainfed; The irrigation season and a limit on water; Slow or fast irrigation: a constant water flux; Slow or fast irrigation: a constant water flux; When the fertiliser is applied and how much; When the fertiliser is applied and how much; Warming with and without irrigation; Tillage and the time and form of the fertiliser; Tillage and the time and form of the fertiliser; Deficit irrigation: a water limit against the trigger; Tillage against fertiliser form; Tillage against fertiliser form.

## Topic 16: adsorption

This component describes the adsorption of a chemical to the soil, which among other things affects how large a fraction can be transported with the water.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 16.1 | Freundlich | M = rho K C ref (C / C ref)m + Theta C. Formula from FOCUS page 93. See also | m, K clay |
| 16.2 | Guo2020 | Linear sorption with K awi estimated from Equation 11. See also [Guo et al., 2020] | K clay, a, b |
| 16.3 | Langmuir | M = rho (my max C) / ((1/K) + C) + Theta C | n/a |
| 16.4 | Python | Adsorption defined in user specified Python module. | module, extra |
| 16.5 | air | Henry's law, fixed ratio between concentration in air and water. See also [?] | K wa |
| 16.6 | full | Full adsorption. Used for non-solutes, fully adsorped in the soil. | n/a |
| 16.7 | linear | M = rho K C + Theta C | K clay |
| 16.8 | NH4 | A 'linear' model (see 16.7, page 100) build into Daisy. | n/a |
| 16.9 | NH4 Hansen | A 'linear' model (see 16.7, page 100) build into Daisy. | n/a |
| 16.10 | none | No adsorption. Used for solutes that are not adsorped to the soil. | n/a |
| 16.11 | vS S | Double langmuir description of NH4-N sorption to clay. See also [Van Schouwenburg and Schuffelen, 1963] | S edge, K edge |
| 16.12 | vS S Hansen | A 'vS S' model (see 16.11, page 101) build into Daisy. | n/a |
| 16.13 | vS S Styczen | A 'vS S' model (see 16.11, page 101) build into Daisy. | n/a |
| 16.14 | vS S old | Buggy implementation included as vS S before Daisy 6.47. Included here as refer- | n/a |

**Related theme.** chemicals and their sorption.

## Topic 17: am

The 'am' component describes various kinds of fertilizer and other added matter such as crop residues. In particular, it describes how they decompose.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 17.1 | base | Common attributes for all added organic matter models. | name, creation, crop, part, om |
| 17.2 | initial | A 'base' model (see 17.1, page 103) build into Daisy. | layers, weight |
| 17.3 | organic | A 'base' model (see 17.1, page 103) build into Daisy. | weight, NH4 fraction, volatilization, NO3 fraction |
| 17.4 | root | A 'base' model (see 17.1, page 103) build into Daisy. | depth, dist, weight |
| 17.5 | state | A 'base' model (see 17.1, page 103) build into Daisy. | n/a |
| 17.6 | mineral | Mineral fertilizer. | weight, NH4 fraction, volatilization |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 18: average

Find the average of two numbers.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 18.1 | arithmetic | Arithmetic average '(a+b)/2'. | n/a |
| 18.2 | geometric | Geometric average 'sqrt(a*b)'. | n/a |
| 18.3 | harmonic | Harmonic average '2ab/(a+b)'. | n/a |

## Topic 19: bioclimate

The 'bioclimate' component is responsible for distributing the water and energy provided by the weather component among the crops and soil for a given column.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 19.1 | base | Common parameters for all bioclimate parameterizations. | cloudiness, net radiation, pet, raddist, svat, deposition, NoOfIntervals, production stress |
| 19.2 | default | A 'base' model (see 19.1, page 109) build into Daisy. | n/a |
| 19.3 | FAO56 daily | A 'default' model (see 19.2, page 115) build into Daisy. | n/a |
| 19.4 | FAO56 hourly | A 'default' model (see 19.2, page 115) build into Daisy. | n/a |
| 19.5 | SSOC | A 'default' model (see 19.2, page 115) build into Daisy. | n/a |

**Related theme.** weather, radiation and evapotranspiration.

**Parameters that the workbench runs for this topic.** irrigation subsoil permanent, litter water storage, NoOfIntervals, canopy water storage, max svat iterations, max svat absolute difference, maxTdiff, maxEdiff, min sun angle.

## Topic 20: biopore

A single class of biopores. < component (density density ) (height start height start ) (height end height end ) (diameter diameter ) >  density: number component (see chapter 59) Biopore density [cm−2 ] as a function of 'x' [cm].  height start: number [cm] Parameter Biopores starts at this depth (a negative number).  height end : number [cm] Parameter Biopores ends at this depth (a negative number).  diameter : number [cm] Parameter Biopore diameter. Log Variables  S : number [cm3 /cm3 /h] soil cells Total st

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 20.1 | drain | Biopores that ends in the drain pipes. | pipe position, value, name |
| 20.2 | matrix | Biopores that ends in the matrix. | solute, name, value, debug, xplus, h bottom, max iterations, Theta |

**Related theme.** water and heat movement in the soil.

## Topic 21: boolean

Generic representation of booleans. Used by IntegerCondClause @ condition (see 107.28, page 626) , and Stringer- CondClause @ condition (see 107.29, page 626) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 21.1 | false | Always false. | n/a |
| 21.2 | not | True if and only if the operand is not true. | operands |
| 21.3 | numbers | Base class for boolean expressions involving numbers. | operands |
| 21.4 | < | A 'numbers' model (see 21.3, page 121) build into Daisy. | n/a |
| 21.5 | <= | A 'numbers' model (see 21.3, page 121) build into Daisy. | n/a |
| 21.6 | > | A 'numbers' model (see 21.3, page 121) build into Daisy. | n/a |
| 21.7 | >= | A 'numbers' model (see 21.3, page 121) build into Daisy. | n/a |
| 21.8 | operands | Base class for boolean expressions involving multiple boolean operands. | operands |
| 21.9 | and | A 'operands' model (see 21.8, page 122) build into Daisy. | n/a |
| 21.10 | or | A 'operands' model (see 21.8, page 122) build into Daisy. | n/a |
| 21.11 | string-equal | True iff the supplied strings are identical. | values |
| 21.12 | true | Always true. | n/a |
| 21.13 | xor | True if and only if one operand is true, and one false. | operands |

## Topic 22: bound

Specify one end of an interval boundary.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 22.1 | finite | Finite interval bound. | n/a |
| 22.2 | full | Maximum value for the interval boundary. | n/a |
| 22.3 | none | No boundary specified. | n/a |
| 22.4 | state | Bound used for checkpoints. | type |
| 22.5 | empty | A 'state' model (see 22.4, page 123) build into Daisy. | n/a |

## Topic 23: chemical

This component should, for a specific chemical (typically a pesticide), provide a description of the properties of interest to Daisy.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 23.1 | base | Read chemical properties as normal Daisy parameters. | adsorption, value, molar mass, solubility, canopy dissipation, surface decompose, litter decompose, litter diffusion |
| 23.2 | FOCUS | A 'base' model (see 23.1, page 125) build into Daisy. | alpha, Value description |
| 23.3 | metabolite | A 'FOCUS' model (see 23.2, page 135) defined in 'chemistry-base.dai'. | n/a |
| 23.4 | pesticide | A 'FOCUS' model (see 23.2, page 135) defined in 'chemistry-base.dai'. | n/a |
| 23.5 | fungicide | A 'pesticide' model (see 23.4, page 137) defined in 'chemistry-base.dai'. | n/a |
| 23.6 | herbicide | A 'pesticide' model (see 23.4, page 137) defined in 'chemistry-base.dai'. | n/a |
| 23.7 | 2,4-D | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.8 | Atrazine | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.9 | Bentazon | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.10 | IPU | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.11 | Ioxynil | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.12 | MCPP | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.13 | Pendimethalin | A 'herbicide' model (see 23.6, page 137) defined in 'chemistry.dai'. | n/a |
| 23.14 | insecticide | A 'pesticide' model (see 23.4, page 137) defined in 'chemistry-base.dai'. | n/a |
| 23.15 | DDT | A 'insecticide' model (see 23.14, page 138) defined in 'chemistry.dai'. | n/a |
| 23.16 | Heptachlor | A 'insecticide' model (see 23.14, page 138) defined in 'chemistry.dai'. | n/a |
| 23.17 | default | A 'base' model (see 23.1, page 125) build into Daisy. | n/a |
| 23.18 | PFAS | A 'default' model (see 23.17, page 139) defined in 'PFAS.dai'. | n/a |
| 23.19 | PFBA | A 'PFAS' model (see 23.18, page 141) defined in 'PFAS.dai'. | n/a |
| 23.20 | PFBS | A 'PFAS' model (see 23.18, page 141) defined in 'PFAS.dai'. | n/a |
| 23.21 | PFHxA | A 'PFAS' model (see 23.18, page 141) defined in 'PFAS.dai'. | n/a |
| 23.22 | PFOA | A 'PFAS' model (see 23.18, page 141) defined in 'PFAS.dai'. | n/a |
| 23.23 | PFOA Guo | A 'PFOA' model (see 23.22, page 142) defined in 'PFAS.dai'. | n/a |
| 23.24 | PFOS | A 'PFAS' model (see 23.18, page 141) defined in 'PFAS.dai'. | n/a |
| 23.25 | PFOS Guo | A 'PFOS' model (see 23.24, page 142) defined in 'PFAS.dai'. | n/a |
| 23.26 | PFPeA | A 'PFAS' model (see 23.18, page 141) defined in 'PFAS.dai'. | n/a |
| 23.27 | Tracer | A 'default' model (see 23.17, page 139) defined in 'chemistry-base.dai'. | n/a |
| 23.28 | classic | A 'default' model (see 23.17, page 139) defined in 'chemistry-base.dai'. | n/a |
| 23.29 | colloid | A 'default' model (see 23.17, page 139) defined in 'chemistry-base.dai'. | n/a |
| 23.30 | solid | A 'default' model (see 23.17, page 139) defined in 'chemistry-base.dai'. | n/a |
| 23.31 | nutrient | A 'base' model (see 23.1, page 125) build into Daisy. | n/a |
| 23.32 | C | A 'nutrient' model (see 23.31, page 143) build into Daisy. | n/a |
| 23.33 | DOC | A 'C' model (see 23.32, page 143) build into Daisy. | n/a |
| 23.34 | N | A 'nutrient' model (see 23.31, page 143) build into Daisy. | n/a |
| 23.35 | DON | A 'N' model (see 23.34, page 143) build into Daisy. | n/a |
| 23.36 | MIN | A 'N' model (see 23.34, page 143) build into Daisy. | n/a |
| 23.37 | NH4 | A 'MIN' model (see 23.36, page 143) build into Daisy. | n/a |
| 23.38 | NO3 | A 'MIN' model (see 23.36, page 143) build into Daisy. | n/a |

**Related theme.** chemicals and their sorption.

## Topic 24: chemistry

Pesticides and other chemicals.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 24.1 | default | Handle chemicals and reactions. | reaction, trace |
| 24.2 | DOM | A 'default' model (see 24.1, page 145) build into Daisy. | n/a |
| 24.3 | N | A 'default' model (see 24.1, page 145) build into Daisy. | n/a |
| 24.4 | PFAS | A 'default' model (see 24.1, page 145) defined in 'PFAS.dai'. | n/a |
| 24.5 | Tracer | A 'default' model (see 24.1, page 145) defined in 'chemistry.dai'. | n/a |
| 24.6 | colloid | A 'default' model (see 24.1, page 145) defined in 'chemistry.dai'. | n/a |
| 24.7 | pesticides | A 'default' model (see 24.1, page 145) defined in 'chemistry.dai'. | n/a |
| 24.8 | multi | Handle multile chemistries. | combine, ignore, trace |
| 24.9 | none | A 'multi' model (see 24.8, page 146) build into Daisy. | n/a |
| 24.10 | nutrient | A 'multi' model (see 24.8, page 146) build into Daisy. | n/a |

**Related theme.** chemicals and their sorption.

**Parameters that the workbench runs for this topic.** max sink total, max sink solute, max sink secondary, min sink total.

## Topic 25: cloudiness

Calculate cloudiness from meterological data.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 25.1 | clear sky | Calculate based on clear sky radiation: a * Si / Si0 + 1 minus a where Si is global | cloudiness, a, Value description |
| 25.2 | ASCE | A 'clear sky' model (see 25.1, page 149) build into Daisy. | Kt |
| 25.3 | Taastrup | A 'ASCE' model (see 25.2, page 150) build into Daisy. | n/a |
| 25.4 | FAO56 | A 'clear sky' model (see 25.1, page 149) build into Daisy. | n/a |
| 25.5 | Kjaersgaard | A 'FAO56' model (see 25.4, page 151) build into Daisy. | n/a |
| 25.6 | const | The cloudiness never changes. | cloudiness |
| 25.7 | weather | Use value from weather file. | cloudiness |

**Related theme.** weather, radiation and evapotranspiration.

**Combinations of the Experiments tab that use this topic.** A drier, wetter or warmer year; Warming with and without irrigation; Evapotranspiration model and radiation; A dry summer, a dry spring or a wet winter.

## Topic 26: column

A 'column' is an one-dimensional vertical description of the soil/crop/atmosphere system. The column component contains most of the other processes in Daisy as submodels. < component (area 1 [m2 ]) (location) >  area: number [m2 ] State variable (default 1) Area covered by this column. When logging multiple columns, the values are weighted by relative area.  location: submodel (see section 4.1.7) sequence Submodel (default: an empty sequence) Location of this column. The meaning depends on the number of point in

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 26.1 | default | Hansen et.al. 1990. with generic movement in soil. | Irrigation, SoilHeat, scope, Surface, Movement, Vegetation, Bioclimate, Drain |

## Topic 27: condedge

Find the hydraulic conductivity between two cells.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 27.1 | arithmetic | Use the arithmetic average of the conductivity in the two cells. | n/a |
| 27.2 | geometric | Geometric average 'sqrt(a*b)'. | n/a |
| 27.3 | harmonic | Use harmonic average of the conductivity of the two cells. This corresponds to using | n/a |
| 27.4 | pressure | Pressure dependent average of the two cells. Use harmonic average of the conductiv- | allow sideways, h lim |

**Related theme.** water and heat movement in the soil.

## Topic 28: condition

A 'condition' component tests the state of the simulation, like whether the water pressure in a specific depth is above a given threshold. Logic conditions like 'and' and 'or' can be used for testing whether multiple conditions are fulfilled simultane- ously. Used by select component when (see 80, page 429) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 28.1 | BBCH after | True after specified BBCH. | crop, file, start, bbch |
| 28.2 | TSum above | Test if the temperature sum is above the specified value The temperature sum is | TSum limit, reset mday, reset month |
| 28.3 | and | True iff all the listed conditions are true. The conditions are tested in the sequence | operands |
| 28.4 | trafficable | A 'and' model (see 28.3, page 160) defined in 'tillage.dai'. | n/a |
| 28.5 | check | Test if a boolean expression is true. | n/a |
| 28.6 | crop dm over | True iff the crop has reached the specified amount of dry matter. | crop, weight, height |
| 28.7 | crop dm sorg over | True iff the storage organ has reached the specified amount of dry matter. | crop, weight |
| 28.8 | crop ds after | True iff the crop has reached development stage 'ds'. | crop, ds |
| 28.9 | crop stage after | True iff the crop has reached development stage 'stage'. | crop, stage |
| 28.10 | daily | True at the end of each day. | n/a |
| 28.11 | daily air temperature above | Test if the daily air is warmer than the specified temperature. | temperature |
| 28.12 | daily precipitation above | Test if the daily precipitation is warmer than the specified value. | precipitation |
| 28.13 | every | Matches simulation with fixed time intervals. | seconds, minutes, hours, days, microseconds, next |
| 28.14 | extern | Test if a boolean expression is true,using extern log. | scope |
| 28.15 | false | Always false. | n/a |
| 28.16 | finished | True iff the simulation has finished. | n/a |
| 28.17 | hour | True, at the specified hour. | at |
| 28.18 | hourly | True at the end of each hour. | n/a |
| 28.19 | if | If the first condition is true, return the value of the second condition, else return | then, else |
| 28.20 | mday | True, at the specified day in the month. | at |
| 28.21 | microsecond | True, at the specified microsecond. | at |
| 28.22 | minute | True, at the specified minute. | at |
| 28.23 | minutely | True at the end of each minute. | n/a |
| 28.24 | mm dd base | Conditions based on month and day. | month, day, minute |
| 28.25 | after mm dd | A 'mm dd base' model (see 28.24, page 164) build into Daisy. | n/a |
| 28.26 | before mm dd | A 'mm dd base' model (see 28.24, page 164) build into Daisy. | n/a |
| 28.27 | mm dd | A 'mm dd base' model (see 28.24, page 164) build into Daisy. | n/a |
| 28.28 | month | True, at the specified month. | at |
| 28.29 | monthly | True at the end of each month. | n/a |
| 28.30 | not | True iff the operand is not true. | n/a |
| 28.31 | or | True iff any of the listed conditions are true. The conditions are tested in the | operands |
| 28.32 | periodic | True if move than a specified walltime has passed since last time it was true. | n/a |
| 28.33 | running | True iff the simulation is still running. | n/a |
| 28.34 | second | True, at the specified second. | at |
| 28.35 | secondly | True at the end of each second. | n/a |
| 28.36 | soil inorganic N above | Test if the soil contains more mineral nitrogen than the specified amount. | amount, from, to |
| 28.37 | soil temperature above | Test if the soil is warmer than the specified temperature. | height, temperature |
| 28.38 | soil water content above | Test if the soil contains more water than the specified amount. | from, to |
| 28.39 | soil water pressure above | Test if the soil is wetter than the specified pressure potential. | height |
| 28.40 | time | Conditions based on a specific time. | time |
| 28.41 | after | A 'time' model (see 28.40, page 167) build into Daisy. | n/a |
| 28.42 | at | A 'time' model (see 28.40, page 167) build into Daisy. | n/a |
| 28.43 | before | A 'time' model (see 28.40, page 167) build into Daisy. | n/a |
| 28.44 | timestep | Add a timestep to a condition. It is true whenever 'operand' is true, but will let | timestep |
| 28.45 | true | Always true. | n/a |
| 28.46 | walltime | True if move than a specified walltime has passed since last time it was true. | seconds, minutes, hours, days, microseconds |
| 28.47 | weekly | True at the end of each week. | n/a |
| 28.48 | with | Test condition for specific column. | where, condition |
| 28.49 | yday | True, at the specified julian day. | at |
| 28.50 | year | True, at the specified year. | at |
| 28.51 | yearly | True at the end of each year. | n/a |

**Related theme.** management.

**Combinations of the Experiments tab that use this topic.** When to irrigate: the trigger and the depth of the sensor; Sensor depth against rooting depth; Deficit irrigation: a water limit against the trigger.

## Topic 29: crop

The 'crop' component simulates a specific crop on the field, typically averaged over one square meter, not individual plants. Of particular interest is water and nitrogen uptake at different depths, and the vertical leaf area distribution, which are used for competition with other crops.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 29.1 | default | Standard Daisy crop model. Hansen, 1999. | Harvest, Root, Canopy, last time, sow time, emerge time, flowering time, ripe time |
| 29.2 | Beetroot | A 'default' model (see 29.1, page 171) defined in 'beetroot.dai'. | n/a |
| 29.3 | Broccoli | A 'default' model (see 29.1, page 171) defined in 'broccoli.dai'. | n/a |
| 29.4 | Broccoli minus transplanted | A 'Broccoli' model (see 29.3, page 173) defined in 'broccoli.dai'. | n/a |
| 29.5 | Brussels sprouts | A 'default' model (see 29.1, page 171) defined in 'brusselssprouts.dai'. | n/a |
| 29.6 | Brussels sprouts minus transplanted | A 'Brussels sprouts' model (see 29.5, page 173) defined in 'brusselssprouts.dai'. | n/a |
| 29.7 | Celeriac | A 'default' model (see 29.1, page 171) defined in 'celeriac.dai'. | n/a |
| 29.8 | Celeriac minus transplanted | A 'Celeriac' model (see 29.7, page 174) defined in 'celeriac.dai'. | n/a |
| 29.9 | Fodder Beet | A 'default' model (see 29.1, page 171) defined in 'fodderbeet.dai'. | n/a |
| 29.10 | Grass to grain | A 'default' model (see 29.1, page 171) defined in 'grass.dai'. | n/a |
| 29.11 | Grass | A 'Grass to grain' model (see 29.10, page 174) defined in 'grass.dai'. | n/a |
| 29.12 | Maize | A 'default' model (see 29.1, page 171) defined in 'maize.dai'. | n/a |
| 29.13 | Ikuwala Maize | A 'Maize' model (see 29.12, page 174) defined in 'maize.dai'. | n/a |
| 29.14 | Silage Maize | A 'Maize' model (see 29.12, page 174) defined in 'maize.dai'. | n/a |
| 29.15 | Onion | A 'default' model (see 29.1, page 171) defined in 'onion.dai'. | n/a |
| 29.16 | Onion minus planting of sets | A 'Onion' model (see 29.15, page 174) defined in 'onion plantingofsets.dai'. | n/a |
| 29.17 | Pea | A 'default' model (see 29.1, page 171) defined in 'pea.dai'. | n/a |
| 29.18 | Green Pea | A 'Pea' model (see 29.17, page 174) defined in 'pea.dai'. | n/a |
| 29.19 | Pioneer Maize | A 'default' model (see 29.1, page 171) defined in 'maize.dai'. | n/a |
| 29.20 | Potato; Koege | A 'default' model (see 29.1, page 171) defined in 'potato.dai'. | n/a |
| 29.21 | Potato; SCRI | A 'default' model (see 29.1, page 171) defined in 'potato.dai'. | n/a |
| 29.22 | Potato; FertOrgaNic | A 'Potato; SCRI' model (see 29.21, page 175) defined in 'potato.dai'. | n/a |
| 29.23 | Potato; Agria | A 'Potato; FertOrgaNic' model (see 29.22, page 175) defined in 'potato.dai'. | n/a |
| 29.24 | Potato; Folva | A 'Potato; FertOrgaNic' model (see 29.22, page 175) defined in 'potato.dai'. | n/a |
| 29.25 | Potato | A 'Potato; Folva' model (see 29.24, page 175) defined in 'potato.dai'. | n/a |
| 29.26 | Potato; Triada | A 'Potato; FertOrgaNic' model (see 29.22, page 175) defined in 'potato.dai'. | n/a |
| 29.27 | Potato; SCRI minus AArhus | A 'default' model (see 29.1, page 171) defined in 'earlypotato.dai'. | n/a |
| 29.28 | Early potato | A 'Potato; SCRI minus AArhus' model (see 29.27, page 176) defined in 'earlypotato.dai'. | n/a |
| 29.29 | Rye | A 'default' model (see 29.1, page 171) defined in 'rye.dai'. | n/a |
| 29.30 | Ryegrass | A 'default' model (see 29.1, page 171) defined in 'ryegrass.dai'. | n/a |
| 29.31 | Spring Barley | A 'default' model (see 29.1, page 171) defined in 'sbarley.dai'. | n/a |
| 29.32 | Spring Barley; Foulum | A 'Spring Barley' model (see 29.31, page 176) defined in 'sbarley.dai'. | n/a |
| 29.33 | Spring Rape | A 'default' model (see 29.1, page 171) defined in 'srape.dai'. | n/a |
| 29.34 | Spring Wheat | A 'default' model (see 29.1, page 171) defined in 'swheat.dai'. | n/a |
| 29.35 | Sugar Beet | A 'default' model (see 29.1, page 171) defined in 'sugarbeet.dai'. | n/a |
| 29.36 | Wclover | A 'default' model (see 29.1, page 171) defined in 'wclover.dai'. | n/a |
| 29.37 | White cabbage | A 'default' model (see 29.1, page 171) defined in 'whitecabbage.dai'. | n/a |
| 29.38 | White cabbage minus transplanted | A 'White cabbage' model (see 29.37, page 177) defined in 'whitecabbage.dai'. | n/a |
| 29.39 | Early white cabbage minus transplanted | A 'White cabbage minus transplanted' model (see 29.38, page 177) defined in 'early- | n/a |
| 29.40 | Winter Barley | A 'default' model (see 29.1, page 171) defined in 'wbarley.dai'. | n/a |
| 29.41 | Winter Barley; Foulum | A 'Winter Barley' model (see 29.40, page 177) defined in 'wbarley.dai'. | n/a |
| 29.42 | Winter Barley; Koge | A 'default' model (see 29.1, page 171) defined in 'wbarley.dai'. | n/a |
| 29.43 | Winter Rape | A 'default' model (see 29.1, page 171) defined in 'wrape.dai'. | n/a |
| 29.44 | Winter Wheat | A 'default' model (see 29.1, page 171) defined in 'wwheat.dai'. | n/a |
| 29.45 | Winter Wheat JG | A 'Winter Wheat' model (see 29.44, page 177) defined in 'wwheat.dai'. | n/a |
| 29.46 | Winter Wheat; Foulum | A 'Winter Wheat' model (see 29.44, page 177) defined in 'wwheat.dai'. | n/a |
| 29.47 | simple | Forced growth crop model. | Root, Canopy, LAIvsDay, T sum, day, spring, root am, N b |

**Related theme.** the crop: growth, roots and water use.

**Combinations of the Experiments tab that use this topic.** Sensor depth against rooting depth; Rooting depth of the crop.

## Topic 30: cstage

Crop phenological stage. The 'default' crop model uses a continius development stage [-1:2] in order to track the phenological age of a crop. The 'cstage' library allows translation of the internal model to other phenological models.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 30.1 | table | A table mapping Daisy DS to other model. | table, value, message |
| 30.2 | BBCH | A 'table' model (see 30.1, page 181) build into Daisy. | n/a |
| 30.3 | Daisy | A 'table' model (see 30.1, page 181) build into Daisy. | n/a |

**Related theme.** the crop: growth, roots and water use.

## Topic 31: daisy/soil/soil.h

pH of soil. < component       > Log Variables  pH : number [pH] soil cells Current pH of soil.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 31.1 | neutral | A soil with a constant pH of 7. | n/a |
| 31.2 | year | A soil with a constant pH of 7. | pH depth |

**Related theme.** water and heat movement in the soil.

## Topic 32: denprod

Find products (gasses) produced by denitrification.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 32.1 | Parton1996 | Find N2O from denitrification based on WFPS, NO3, and CO2. | N2O |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 33: deposition

Deposition of inorganic material from atmosphere. < component       > Log Variables  deposit: submodel (see section 4.1.7) sequence Total atmospheric deposition. <    name value    >    Log Variables, value: number [g/cm2 /h] Value for chemical., name: string (see section 4.1.5) Name of chemical.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 33.1 | const | Constant deposition in time interval. | before, wet, name, value, dry |
| 33.2 | weather | Rely solely on weather model for deposition. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 34: depth

Depth below soil surface.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 34.1 | PLF | Linear interpolation of depth. | table, time, value |
| 34.2 | const | Constant depth. | value |
| 34.3 | deep | A 'const' model (see 34.2, page 189) build into Daisy. | n/a |
| 34.4 | extern | Look up depth in an scope. | value, initial value |
| 34.5 | file | Linear interpolation of depth read from file. | file |
| 34.6 | season | Linear interpolation of depth within a year. | season |
| 34.7 | table | Linear interpolation of depth read from file. | file, offset, missing, tag, dim line |

## Topic 35: difrad

The 'difrad' component should calculate the diffuse radiation from meterological data.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 35.1 | BRL | Diffuse radiation calculation based on the model of Ridley et al., 2010. Last pre- | n/a |
| 35.2 | DPF | Diffuse radiation calculated using the model of De Pury and Farquhar, 1997. See | a, Value description, fa |
| 35.3 | weather | Diffuse radiation using weather data. | n/a |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 36: domsorp

Sorption and desorption of DOM to SOM.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 36.1 | default | Transformation between two soil chemicals. | transform |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 37: drain

Lateral transport of water.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 37.1 | lateral | Pipe drainage. See also [Hooghoudt, 1940] | L, height, pipe position, eq depth, pipe outlet |
| 37.2 | none | No lateral transport. | n/a |

**Related theme.** water and heat movement in the soil.

**Parameters that the workbench runs for this topic.** L, rad.

## Topic 38: draineqd

Find the equilibrium drain depth for the Hooghoudt drainage model.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 38.1 | MolenWesseling | Equivalent depth calculated with model by van der Molen and Wesseling. See also | n/a |
| 38.2 | Moody | Equivalent depth calculated with model by Moody. See also [Moody, 1966] | n/a |
| 38.3 | Wesseling | Equivalent depth calculated with model by Wesseling. See also [Wesseling, 1973] | n/a |
| 38.4 | none | No modifications. See also [Hooghoudt, 1940] | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 39: equilibrium

Find equilibrium between two soil chemicals.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 39.1 | Langmuir | A = (my max B) / (K + B) | n/a |
| 39.2 | goal A | Attempt to maintain A at at fixed level. | goal A, A solute, B solute |
| 39.3 | linear | A=KB | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 40: exchange

A named value to exchange with external models. < component (name name ) >  name: string (see section 4.1.5) Parameter Name of value to exchange.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 40.1 | name | Exchange a string value. | value |
| 40.2 | number | Exchange a numeric value. | value, dimension |

## Topic 41: format

Text formatting component.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 41.1 | LaTeX | Format text as LaTeX. | n/a |

## Topic 42: function

Pure function of one parameter.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 42.1 | P96CO2 | A function [kg C/ha/d → <none>] build into Daisy. | n/a |
| 42.2 | P96NO3 | A function [ug N/g → <none>] build into Daisy. | n/a |
| 42.3 | P96WFPS | A function [<fraction> → <none>] build into Daisy. | n/a |
| 42.4 | Python | A function [? → ?] build into Daisy. | name, module |
| 42.5 | T scale | A base function [dg C → <none>] build into Daisy. | n/a |
| 42.6 | T min | A 'T scale' function [dg C → <none>] (see 42.5, page 209) build into Daisy. | n/a |
| 42.7 | T min 15 | A 'T min' function [dg C → <none>] (see 42.6, page 209) build into Daisy. | n/a |
| 42.8 | T nit | A 'T scale' function [dg C → <none>] (see 42.5, page 209) build into Daisy. | n/a |
| 42.9 | const | A function [? → ?] build into Daisy. | value |
| 42.10 | plf | A function [? → ?] build into Daisy. | n/a |

## Topic 43: ghf

Ground heat flux.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 43.1 | FAO56 | Equation 45 and 46. Ground heat flux is 10 % of Rn during day, and 50 % of Rn | n/a |
| 43.2 | const | The ground heat flux never changes. | G |
| 43.3 | none | A 'const' model (see 43.2, page 213) build into Daisy. | n/a |
| 43.4 | old | Based soil numeric cell 0 and 1. The model used in Daisy 6.08 and earlier, should | n/a |
| 43.5 | surface | Based on flux through soil surface. Calculated from previous timestep. | n/a |
| 43.6 | weather | Use value from weather file. | n/a |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 44: gnuplot

Plot a graph with gnuplot.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 44.1 | common | Common parameters. | extra, where, title, device, canvas, size, y |
| 44.2 | profile | A 'common' model (see 44.1, page 215) build into Daisy. | column |
| 44.3 | soil | A 'common' model (see 44.1, page 215) build into Daisy. | file, top, min, dimension, bottom, type, left, right |
| 44.4 | time | A 'common' model (see 44.1, page 215) build into Daisy. | source, begin, ymin, y2min |
| 44.5 | vector | A 'common' model (see 44.1, page 215) build into Daisy. | file, top, dimension, begin, bottom, left, right, missing |
| 44.6 | xy | A 'common' model (see 44.1, page 215) build into Daisy. | source, ymin, y2min, xmin, x2min |
| 44.7 | multi | Generate multiple graphs for the gnuplot command file. | before, graph |

## Topic 45: groundwater

The 'groundwater' component is responsible for specifying the groundwater table at each timestep.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 45.1 | common | All groundwater models can log height. | height |
| 45.2 | aquitard | A 'common' model (see 45.1, page 225) build into Daisy. | pressure table |
| 45.3 | deep | A 'common' model (see 45.1, page 225) build into Daisy. | n/a |
| 45.4 | extern | A 'common' model (see 45.1, page 225) build into Daisy. | table, initial table |
| 45.5 | file | A 'common' model (see 45.1, page 225) build into Daisy. | file, offset |
| 45.6 | fixed | A 'common' model (see 45.1, page 225) build into Daisy. | table |
| 45.7 | flux | A 'common' model (see 45.1, page 225) build into Daisy. | n/a |
| 45.8 | lysimeter | A 'common' model (see 45.1, page 225) build into Daisy. | n/a |
| 45.9 | source | A 'common' model (see 45.1, page 225) build into Daisy. | source, offset |
| 45.10 | static | A 'common' model (see 45.1, page 225) build into Daisy. | table, obsolete |

**Related theme.** water and heat movement in the soil.

**Parameters that the workbench runs for this topic.** K aquitard, Z aquitard, table.

## Topic 46: heatrect

Heat transport in rectangular grid.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 46.1 | Mollerup | Finite volume solution to heat transfer by Mikkel Mollerup. | debug |
| 46.2 | linear | Linear temperature interpolation between top and bottom. | n/a |
| 46.3 | none | No heat transport. | n/a |
| 46.4 | top | Soil temperature is equal to upper boundary. This can be used for a poorly isolated | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 47: horizon

A 'horizon' is a soil type with specific physical properties. It is the responsibility of the 'horizon' component to specify these properties. Used by SoilLayer @ horizon (see 107.19, page 612) , and SoilRegion @ horizon (see 107.20, page 613) . < component (HorHeat HorHeat )                                    ; Has default value. (hydraulic hydraulic )                          ; Default hypres value. (tortuosity tortuosity )                        ; Default linear value. (C per N C per N ) (anisotropy 1 []) (dry b

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 47.1 | BSI3 | A horizon using BSI3 texture classification. | clay, silt, humus, normalize |
| 47.2 | DIN3 | A 'BSI3' model (see 47.1, page 233) build into Daisy. | n/a |
| 47.3 | MIT3 | A 'BSI3' model (see 47.1, page 233) build into Daisy. | n/a |
| 47.4 | BSI7 | A horizon using BSI7 texture classification. | clay, fine silt, medium silt, coarse silt, humus, normalize |
| 47.5 | MIT7 | A 'BSI7' model (see 47.4, page 235) build into Daisy. | n/a |
| 47.6 | DIN5 | A horizon using DIN5 texture classification. | clay, silt, humus, normalize |
| 47.7 | GEUS7 | A horizon using GEUS7 texture classification. | clay, fine silt, medium silt, coarse silt, humus, normalize |
| 47.8 | ISSS3 | A horizon using ISSS3 texture classification. | clay, silt, humus, normalize |
| 47.9 | ISSS4 | A horizon using ISSS4 texture classification. | clay, silt, humus, normalize |
| 47.10 | USDA3 | A horizon using USDA3 texture classification. | clay, silt, humus, normalize |
| 47.11 | FAO3 | A 'USDA3' model (see 47.10, page 242) build into Daisy. | n/a |
| 47.12 | USDA7 | A horizon using USDA7 texture classification. | clay, silt, humus, normalize |
| 47.13 | FAO7 | A 'USDA7' model (see 47.12, page 243) build into Daisy. | n/a |
| 47.14 | USPRA3 | A horizon using USPRA3 texture classification. | clay, silt, humus, normalize |
| 47.15 | USPRA4 | A horizon using USPRA4 texture classification. | clay, silt, humus, normalize |
| 47.16 | numeric | A horizon using explicit texture classification. | humus, fractions, limits, normalize |

**Related theme.** water and heat movement in the soil.

## Topic 48: hydraulic

This component is responsible for specifying the soils hydraulic properties. Used by horizon component hydraulic (see 47, page 231) , and Soil @ Hydraulic (see 107.21, page 613) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 48.1 | B BaC | Brooks and Corey retention curve model with Burdine theory. | Theta sat, lambda, K sat, h, Theta res, h b, p |
| 48.2 | B BaC Bimodal | Brooks and Corey retention curve model with Burdine theory. Bimodal hydraulic | Theta sat, lambda, K sat, Theta res, h b, Theta b, K b |
| 48.3 | B C | Campbell retention curve model with Burdine theory. See also [Campbell, 1974, | b, Theta sat, K sat, h, h b, p |
| 48.4 | B C inverse | Campbell retention curve model with Burdine theory. | Theta sat, K sat, h, Theta fc, Theta wp |
| 48.5 | B vG | van Genuchten retention curve model with Burdine theory. | alpha, Theta sat, K sat, h, Theta res, n |
| 48.6 | Cosby et al | Modified Campbell retention curve model with Burdine theory. Parameters esti- | n/a |
| 48.7 | MACRO | van Genuchten retention curve model with Mualem theory. The near saturated | alpha, Theta sat, K sat, Theta res, h b, Theta b, K b, n |
| 48.8 | M BaC | Brooks and Corey retention curve model with Mualem theory. | Theta sat, lambda, K sat, h, Theta res, h b, p |
| 48.9 | M BaC Bimodal | Brooks and Corey retention curve model with Mualem theory. Bimodal hydraulic | Theta sat, lambda, K sat, Theta res, h b, Theta b, K b |
| 48.10 | M BivG | Bimodal van Genuchten retention curve model with Mualem theory (Durner, 1994). | Theta sat, K sat, h, Theta res |
| 48.11 | M C | Campbell retention curve model with Mualem theory. See also [Campbell, 1974, | b, Theta sat, K sat, h, h b, p |
| 48.12 | M vG | van Genuchten retention curve model with Mualem theory. | alpha, Theta sat, K sat, h, Theta res, n |
| 48.13 | M vG compact | van Genuchten retention curve model with Mualem theory and compaction. | Theta sat, Theta res, ref alpha, ref n, mod alpha, mod n |
| 48.14 | M vGip | Modified van Genuchten retention curve model with Mualem theory. | alpha, Theta sat, K sat, h, Theta res, n, he |
| 48.15 | M vGp | van Genuchten retention curve model with Mualem theory. A p m (h) function is | alpha, Theta sat, K sat, Theta res, n, h m |
| 48.16 | hypres | van Genuchten retention curve model with Mualem theory. Parameters specified | K sat, h, Theta res |
| 48.17 | hyprop | HYPROP-FIT parameters for bimodal van Genuchten retention curve. It includes | alpha, m, ha, a, Value description, Theta sat, K sat, h |
| 48.18 | linear | Hysteresis using linear transformation. | a, b, debug, wet, dry, is wetting, c |
| 48.19 | mod C | Modified Campbell retention curve model with Burdine theory. | b, Theta sat, K sat, h, h b |
| 48.20 | old2 | Reads a file of lines in the format < pF Theta Cw2 K >, where pF is the water | file, M intervals, inc |
| 48.21 | table | Reads a ddf file with column pF Theta Cw2 K. | file, Theta sat, missing, tag, dim line, K sat, Theta res, M intervals |
| 48.22 | wepp | van Genuchten retention curve model with Mualem theory. Parameters specified by | Theta res, time consolidation, average depth, p t, delta pc, crust thickness, day count, R c |
| 48.23 | Styczen | A 'wepp' model (see 48.22, page 267) build into Daisy. | n/a |
| 48.24 | yolo | Yolo soil. Haverkamp et.al., 1977. | M intervals |

**Related theme.** water and heat movement in the soil.

**Combinations of the Experiments tab that use this topic.** Which soil needs the most water.

## Topic 49: integer

Generic representation of integers.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 49.1 | * | Use the product of its operands. | operands |
| 49.2 | + | Use the sum of its operands. | operands |
| 49.3 | minus | Negate integer or subtract integers. With one operand, negates it. With more than | operands |
| 49.4 | cond | Return the value of the first clause whose condition is true. | clauses |
| 49.5 | const | Always give the specified value. | value |
| 49.6 | div | Divide the first operand by the rest. | operands |
| 49.7 | max | Use the largest value of its operands. | operands |
| 49.8 | min | Use the smallest value of its operands. | operands |
| 49.9 | mod | Modulo the first operand by the rest. | operands |
| 49.10 | sqr | Take the square of its argument. | n/a |

## Topic 50: listsum

Condense a list of numbers to a single number.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 50.1 | arithmetic | Arithmetic average of all members of a list. | n/a |
| 50.2 | count | Count all members of a list. | n/a |
| 50.3 | max | The maximum of all members of a list. | n/a |
| 50.4 | min | The minimum of all members of a list. | n/a |
| 50.5 | sum | The sum of all members of a list. | n/a |

## Topic 51: litter

Litter, surface residuals, or mulch below canopy. < component        > Log Variables  cover : number [<fraction>] Fraction of surface area covered by litter.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 51.1 | none | The effect of surface residuals is ignored by the model. | n/a |
| 51.2 | permanent | A permanent litter layer cover the ground, as for example in a forest. | albedo, interception capacity |
| 51.3 | residue | A dynamic litter layer based on applied fertilizer and crop residuals. | albedo, water capacity, extinction coefficent, mass |
| 51.4 | Maize | A 'residue' model (see 51.3, page 275) build into Daisy. | n/a |
| 51.5 | Millet | A 'residue' model (see 51.3, page 275) build into Daisy. | n/a |
| 51.6 | mulch | A 'residue' model (see 51.3, page 275) build into Daisy. | alpha, retention, DOC name, DON name, density, Theta res, particle density, decompose height |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 52: log

Running a simulation is uninteresting, unless you can get access to the results in one way or another. The purpose of the 'log' component is to provide this access. Most 'log' models does this by writing a summary of the state to a log file.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 52.1 | checkpoint | Create a checkpoint of the entire simulation state, suitable for later hot start. | where, when |
| 52.2 | harvest | Create a log of all harvests. | where, print tags, print dimension, WStress, NStress |
| 52.3 | select | Select variables to log. | volume, summary, entries, from, SOLETE, to, OBSOLETE, when |
| 52.4 | extern | A 'select' model (see 52.3, page 283) build into Daisy. | numbers, value, name, where |
| 52.5 | table | A 'select' model (see 52.3, page 283) build into Daisy. | where, missing value, print tags, print dimension, flush |
| 52.6 | column | A 'table' model (see 52.5, page 285) defined in 'log-std.dai'. | column |
| 52.7 | Field nitrogen | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | unit, Deposition, Matrix-Leaching, Biopore-Leaching, Soil-Drain, Biopore-Drain, Surface-Loss, Min-Surface |
| 52.8 | Field water | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | Precipitation, Irrigation, Potential evapotranspiration, Actual evapotranspiration, Matrix percolation, Biopore percolation |
| 52.9 | Soil nitrogen | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | unit, NO3-Matrix-In, NO3-Biopore-In, NO3-Leak-Biopore, NO3-to-Biopores, NO3-from-Biopores, NO3-Soil-Drain, NO3-Indirect-Drain |
| 52.10 | Soil water | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | Matrix infiltration, Matrix percolation, Biopore infiltration, Biopore percolation, Subsoil irrigation, Root extraction, Freezing, Tillage |
| 52.11 | biopore | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | biopore |
| 52.12 | chemical | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | n/a |
| 52.13 | Field chemical | A 'chemical' model (see 52.12, page 295) defined in 'log-std.dai'. | unit, Spray, Deposit, Harvest, Dissipate, Litter Decompose, Litter Transform, Surface Decompose |
| 52.14 | Soil chemical | A 'chemical' model (see 52.12, page 295) defined in 'log-std.dai'. | unit, In-Biopores, Leak-Biopores, Tillage, Drain-Biopores, Drain-Biopores-Indirect, Uptake, Decompose |
| 52.15 | crop | A 'column' model (see 52.6, page 286) defined in 'log-std.dai'. | crop |
| 52.16 | Crop | A 'crop' model (see 52.15, page 298) defined in 'log-std.dai'. | Height, Depth, WStem, WSOrg, WRoot, NStem, NSOrg, NRoot |

## Topic 53: macro

Preferention flow in soil macro pores.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 53.1 | default | The area between 'height start' and 'height end' contains macropores, which are | distribution, height start, pressure initiate, S p |
| 53.2 | none | No macropores. | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 54: mactrans

Macropore transportation of solutes.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 54.1 | default | Solute follows water. | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 55: max exfiltration

Soil limited maximum exfiltration.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 55.1 | Hansen | Darcy formulated for water content with mimimum water at surface. | n/a |
| 55.2 | Theta | Darcy formulated for water content with mimimum water at surface. | h crit |
| 55.3 | gradient | Darcy formulated for water content with mimimum water at surface. | n/a |
| 55.4 | steady-state | Steady state flow from top cell to surface. | h crit |

**Related theme.** water and heat movement in the soil.

## Topic 56: movement

This component handles the movement in the soil. < component (Tertiary Tertiary ) >  Tertiary: tertiary component (see chapter 89) Tertiary (that is, non-matrix) transport method. Log Variables  water failure level : integer The number of the last water transport model to fail. It is -1 if the first model succeded, and 0 if the first model failed but the second succeded.  solute failure level : integer The number of the last solute transport model to fail. It is -1 if the first model succeded, and 0 if the first

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 56.1 | solute | Shared paramaters for handling solutes. | matrix solute |
| 56.2 | rectangle | A 'solute' model (see 56.1, page 307) build into Daisy. | Geometry, pipe outlet, drainpoints, heat |
| 56.3 | vertical | A 'solute' model (see 56.1, page 307) build into Daisy. | Geometry |

**Related theme.** water and heat movement in the soil.

## Topic 57: net radiation

Calculate net radiation from meteorological data.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 57.1 | brunt | Brunt, 1932. Default parameterization by Jensen et.al., 1990. FAO recommenda- | A |
| 57.2 | brutsaert | Brutsaert, 1975 | n/a |
| 57.3 | idso jackson | Idso and Jackson, 1969 | n/a |
| 57.4 | prata | Prata, 1996 | n/a |
| 57.5 | satterlund | Satterlund, 1979 | n/a |
| 57.6 | swinbank | Swinbank, 1963 | n/a |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 58: nitrification

The nitrification process, transforming ammonium into nitrate and nitrous oxide. Used by horizon component Nitrification (see 47, page 231) . < component (N2O fraction 0.02 [<fraction>]) >  N2O fraction: number [<fraction>] Parameter (default 0.02) Fraction of ammonium lost as N2O.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 58.1 | soil | k 10 * M / (k + M). Michaelis-Menten kinetics, with nitrification based on total | n/a |
| 58.2 | solute | k 10 * C / (k + C). Michaelis-Menten kinetics, with nitrification based on ammo- | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 59: number

Generic representation of numbers. Used by select component expr (see 80, page 429) , and biopore component density (see 20, page 117) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 59.1 | * | Use the product of its operands. | operands |
| 59.2 | + | Use the sum of its operands. | operands |
| 59.3 | minus | Negate number or subtract numbers. With one operand, negates it. With more | operands |
| 59.4 | / | Divide the first operand by the rest. | operands |
| 59.5 | apply | Apply function to operand. | function |
| 59.6 | child | Numbers based on another number. | value |
| 59.7 | convert | A 'child' model (see 59.6, page 316) build into Daisy. | value, dimension |
| 59.8 | dim | A 'child' model (see 59.6, page 316) build into Daisy. | value, dimension, warn known |
| 59.9 | identity | A 'child' model (see 59.6, page 316) build into Daisy. | dimension |
| 59.10 | const | Always give the specified value. | value |
| 59.11 | initial zero | A 'const' model (see 59.10, page 317) build into Daisy. | n/a |
| 59.12 | zero gradient | A 'const' model (see 59.10, page 317) build into Daisy. | n/a |
| 59.13 | daisy/soil/soil.h | Find pressure (h) for a given water content (Theta). | horizon, Theta |
| 59.14 | depth | Find soil value at specific depth. | h, column |
| 59.15 | depth K | A 'depth' model (see 59.14, page 318) build into Daisy. | n/a |
| 59.16 | depth Theta | A 'depth' model (see 59.14, page 318) build into Daisy. | n/a |
| 59.17 | exp | Take the exponential of its argument. | n/a |
| 59.18 | fetch | Fetch the value and dimension in the current scope. | name |
| 59.19 | get | Get the value of symbol in the current scope. | name, dimension |
| 59.20 | horizon | Find soil value at specific horizon. | h, horizon |
| 59.21 | soil K | A 'horizon' model (see 59.20, page 319) build into Daisy. | n/a |
| 59.22 | soil Theta | A 'horizon' model (see 59.20, page 319) build into Daisy. | n/a |
| 59.23 | soil heat capacity | A 'horizon' model (see 59.20, page 319) build into Daisy. | n/a |
| 59.24 | soil heat conductivity | A 'horizon' model (see 59.20, page 319) build into Daisy. | n/a |
| 59.25 | if | Select between two numbers depending on a boolean expression. | then, else |
| 59.26 | initial C | Find initial content from concentration. | n/a |
| 59.27 | initial NH4 | A 'initial C' model (see 59.26, page 320) build into Daisy. | n/a |
| 59.28 | initial NO3 | A 'initial C' model (see 59.26, page 320) build into Daisy. | n/a |
| 59.29 | let | Bind symbols in 'clauses' in a new scope, and evaluate 'expr' in that scope. | clauses |
| 59.30 | ln | Take the natural logarithm of its argument. | n/a |
| 59.31 | log10 | Take the base 10 logarithm of its argument. | n/a |
| 59.32 | max | Use the largest value of its operands. | operands |
| 59.33 | min | Use the smallest value of its operands. | operands |
| 59.34 | plf | Look up argumen in a piecewise linear function. | domain, range, points, y |
| 59.35 | pow | Raise 'base' to the power of 'exponent'. | base, exponent |
| 59.36 | solute uptake | Find root nitrogen uptake. | L, value, volume, Theta, Theta sat, PotNUpt |
| 59.37 | solute uptake2 | Find root nitrogen uptake. | L, value, volume, Theta, Theta sat |
| 59.38 | source | Extract information from a time series. | source, begin |
| 59.39 | source average | A 'source' model (see 59.38, page 324) build into Daisy. | n/a |
| 59.40 | source increase | A 'source' model (see 59.38, page 324) build into Daisy. | n/a |
| 59.41 | source sum | A 'source' model (see 59.38, page 324) build into Daisy. | n/a |
| 59.42 | source unique | A 'source' model (see 59.38, page 324) build into Daisy. | n/a |
| 59.43 | sqr | Take the square of its argument. | n/a |
| 59.44 | sqrt | Take the square root of its argument. | n/a |
| 59.45 | x | The value of the symbol 'x' in the current scope. | n/a |

## Topic 60: organic

Turnover of organic matter in the soil.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 60.1 | default | Mineralization and immobilization in soil. See also [Hansen et al., 1991, Bruun et al., 2003] | am, Bioincorporation, domsorp, Value description, where, turnover rate, turnover halftime, smb |
| 60.2 | SOM2000 | A 'default' model (see 60.1, page 327) build into Daisy. | n/a |
| 60.3 | SOM2025 | A 'default' model (see 60.1, page 327) build into Daisy. | n/a |
| 60.4 | none | Ignore all soil organic matter dynamics. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

**Parameters that the workbench runs for this topic.** K NH4, K NO3, CO2 threshold, min AM C, min AM N.

## Topic 61: parser

To start the simulation, many parameters must be specified and state variables must be given an initial value. It is the responsibility of the 'parser' component to read these data from an external source (typically a setup file), and convert them into the internal format. Used by Toplevel @ input (see 107.30, page 626) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 61.1 | file | Read a setup file containing lots of parentheses. | where |

## Topic 62: pet

The 'pet' component should calculate the potential evapotranspiration from mete- orological data, as well as the crop and soil state. < component        > Log Variables  wet: number [mm/h] Potential evapotranspiration for a wet system.  dry: number [mm/h] Potential evapotranspiration for a dry system.  reference evapotranspiration: number [mm/h] Reference evapotranspiration for a dry system.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 62.1 | FAO PM | Potential evopotranspiration using Penman-Monteith. See also [Allen et al., 1998] | use wet, rb |
| 62.2 | FAO PM hourly | Potential evopotranspiration using Penman-Monteith. Modified to work with hourly | use wet, rb |
| 62.3 | Hargreaves | Potential evopotranspiration based on temperature. See also [Hargreaves and Samani, 1985] | n/a |
| 62.4 | Makkink | Potential evopotranspiration using Makkink's Equation. E M = beta M0 + beta M1 | n/a |
| 62.5 | AslyngHansen82 | A 'Makkink' model (see 62.4, page 338) build into Daisy. | n/a |
| 62.6 | Makkink57 | A 'Makkink' model (see 62.4, page 338) build into Daisy. | n/a |
| 62.7 | deBruin87 | A 'Makkink' model (see 62.4, page 338) build into Daisy. | n/a |
| 62.8 | PM | Potential evopotranspiration using Penman-Monteith. | rb |
| 62.9 | makkink | Potential evopotranspiration using Makkink's Equation (old version). | n/a |
| 62.10 | weather | Potential evopotranspiration using weather data. | n/a |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 63: phenology

The development process. < component (DS -1 [DS]) (DAP 0 [d]) (partial day length 0 [h]) (day length 0 [h]) >  DS : number [DS] State variable (default -1) Development stage [-1:2], 0 is emergence, 1 is flowering.  DAP : number [d] State variable (default 0) Days after planting.  partial day length: number [h] State variable (default 0) Number of light hours this day, so far.  day length: number [h] State variable (default 0) Number of light hours yesterday.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 63.1 | TSum | Crop phenology model purely based on temperature sums. The length of emer- | EmrTSum, EmrThrs, VegTSum, VegThrs, RepTSum, RepThrs |
| 63.2 | default | Default crop phenology model. | EmrTSum, DSMature, DSRepeat |

**Related theme.** the crop: growth, roots and water use.

## Topic 64: photosynthesis

Leaf photosynthesis. < component (min PAR 0.1 [W/m2 ]) >  min PAR: number [W/m2 ] Parameter (default 0.1) Minimum PAR at top of canopy for photosynthesis. If radiation is below this amount, photosynthesis will be disabled.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 64.1 | Farquhar | Base parameterization for Farquhar derived photosynthesis models. | Xn, Value description, Ea Gamma, N-dist, Stomatacon, ABA effect, Gamma, gs |
| 64.2 | FC C3 | A 'Farquhar' model (see 64.1, page 345) build into Daisy. | beta, c Vm, Ea Vm, Eda Vm, Ea Jm, Ea ko, Ea kc, theta |
| 64.3 | FC C4 | A 'Farquhar' model (see 64.1, page 345) build into Daisy. | alpha, beta, theta, Q10vm, paab |
| 64.4 | GL | Goudriaan and Laar, 1978. | Fm |

**Related theme.** the crop: growth, roots and water use.

## Topic 65: ponddamp

Dampening affect of ponding on soil erosion from rain.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 65.1 | EUROSEM | KH = exp (-b h) See also [Morgan et al., 1998] | b |
| 65.2 | Hairsine91 | KH = (h / dds)−0 .8 See also [Hairsine and Rose, 1991] | n/a |
| 65.3 | Park82 | KH = 2.7183 * exp (-h / dds) See also [Park et al., 1982] | n/a |
| 65.4 | none | KH = 1.0 | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 66: program

Run a program. Used by Toplevel @ run (see 107.30, page 626) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 66.1 | AM table | Generate a table of fertilizers. | n/a |
| 66.2 | Daisy | The Daisy crop/soil/atmosphere model. See also [Hansen et al., 1990, Hansen, 2002, | harvest, stop, time, column, timestep, exchange, scope, output |
| 66.3 | GP2D | Write root density table using 2D extension to Gerwitz and Page | row position, WRoot, row width, Geometry, soil depth, crop depth, crop width |
| 66.4 | KM2 | Read KM2 precipitation data. | file |
| 66.5 | Osvaldo | Find the modelling error. This is done between one set of measured data and | pars, par width, measured file |
| 66.6 | RS2WG | Prepare data from RainSim to the weather generator. | rshourly origin, wgcycle begin, wgcycle length, rshourly file, rsdaily file, dwfhourly file, hint file, hlim |
| 66.7 | WG2DWF | Prepare data from the weather generator for Daisy. | rshourly origin, wgcycle begin, wgcycle length, wg file, dwfdaily file, monthly file, yearly file, dint file |
| 66.8 | astdump | Generate a dump of the abstract syntax tree. | where |
| 66.9 | batch | Run a sequence of programs. | directory, run |
| 66.10 | cd | Change working directory. | directory |
| 66.11 | cpedata | Manipulate data from Agrovand. | file, value, begin, debug, day, missing, tag, dim line |
| 66.12 | docmodel | Document specific models. | component, format, where, models |
| 66.13 | document | Generate the components part of the reference manual. | format, where, print parameterizations |
| 66.14 | extract | Extract data from a data file. | file, missing, tag, dim line, handle, columns, rows |
| 66.15 | gnuplot | Generate a gnuplot command file. | extra, command file, graph |
| 66.16 | hmovie | Manipulate data from Agrovand. | file, dim, missing, tag, dim line, command file, x min, y min |
| 66.17 | hydraulic | Generate a table of the rentention curve and hydraulic conductivity. | horizon, intervals |
| 66.18 | minimize | Find local minimum for program. | scope, run, parameters, name, value, limit, epsilon |
| 66.19 | nwaps | Nwaps collects results from multiple directories. | file, fractiles, missing, directory, parent directory, scenario, scn sep, success file |
| 66.20 | post-process | Extract a subset of a soil profile log file. | file, top, before, dimension, where, bottom, left, right |
| 66.21 | rootmatch | Match root data with GP2D model. | file, gnuplot, x offset, x start, SpRtLength, DensRtTip, debug, row position |
| 66.22 | spawn | Spawn a number of programs in parallel. | file, program, directory, input directory, exe |
| 66.23 | weather | Weather data from a data file. | file, fractiles, begin |
| 66.24 | write | Write string to file. | where, what |
| 66.25 | wse | Generate a table of the water stress effect. | wse, intervals |

## Topic 67: raddist

The 'raddist' component calculates the radiation distribution in the canopy.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 67.1 | default | Default model of radiation distribution in the canopy. | n/a |
| 67.2 | sun-shade | Sun-shade model of radiation distribution in the canopy. | sigma PAR, sigma NIR, Ps PAR, Ps NIR, Ph PAR, Pcb PAR, Pscb PAR, Pscd PAR |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 68: rainergy

Energy in rain.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 68.1 | Brown87 | Energy as a semi-empirical function of rain intensity. The energy content in the | n/a |
| 68.2 | EUROSEM | Kinetic energy model taking vegetation into account. See also [Morgan et al., 1998] | n/a |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 69: rate

Specify a rate or a halftime. Used by AOM component turnover (see 8, page 53) , SMB component turnover (see 13, page 65) , and SOM component turnover (see 14, page 67) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 69.1 | halftime | A rate specified through the equivalent halftime (rate = ln 2 / halftime). | halftime |
| 69.2 | rate | Specify rate directly. | rate |
| 69.3 | zero | A 'rate' model (see 69.2, page 381) build into Daisy. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 70: reaction

Generic transformations between soil chemicals.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 70.1 | DOM turnover | Turnover of dissolved organic matter. See also [Garnier et al., 2003] | DOC name, DON name, where, efficiency, Value description |
| 70.2 | Python | Python interface for chemical reactions above and below ground. | top, module, extra, in, handle, tag, texture, size |
| 70.3 | adsorption | Maintain equilibrium between solute and sorbed from. | equilibrium, solute, adsorption rate, desorption rate, adsorption source |
| 70.4 | bound release | Release of chemicals bound to colloids from surface soil. | immobile, release |
| 70.5 | colgen | Shared parameter and log variable for colloid generation models. | ponddamp, surface release, dds, D |
| 70.6 | colgen Jarvis99 | A 'colgen' model (see 70.5, page 387) build into Daisy. | rainergy, Ms, As |
| 70.7 | colloid-generation | A 'colgen Jarvis99' model (see 70.6, page 387) defined in 'chemistry-base.dai'. | n/a |
| 70.8 | colgen Morgan98 | A 'colgen' model (see 70.5, page 387) build into Daisy. | rainergy |
| 70.9 | colgen Styczen88 | A 'colgen' model (see 70.5, page 387) build into Daisy. | Ae, MA, MR |
| 70.10 | default | Transformation between two soil chemicals. | transform, A |
| 70.11 | denitrification | Denitrification in soil, (conversion of nitrate to atmospheric nitrogen). | alpha, K fast, alpha fast, redox height, converted fast, potential fast |
| 70.12 | equilibrium | Equilibrium between two soil chemicals. | equilibrium, secondary, surface, A, k BA, primary |
| 70.13 | filter velocity | Filtration of soil colloids. | immobile, mobile, fc primary, fc secondary, F primary, F secondary |
| 70.14 | colloid-filter | A 'filter velocity' model (see 70.13, page 393) defined in 'chemistry-base.dai'. | n/a |
| 70.15 | nitrification | Nitrification. The actual nitrification specification is part of the horizon models, | N2O |
| 70.16 | shoot | Pool based on shoot DM. Generate chemical (M) on canopy up to maximum | crop |
| 70.17 | shoot2 | Pool based on shoot DM. Generate chemical (M) on canopy up to maximum | crop, M pot |
| 70.18 | sorption | Kinetic linear sorption equilibrium. Faster than the 'equilibrium' reaction model, | solute, K clay, Equillibrium parameter, k sorption, k desorption, surface sorption, S sorption |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 71: retention

Specify a retention or a halftime.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 71.1 | PASTIS | Retention curve of Mulch used in PASTIS. h (Theta) = -(-h min)ˆ(1-((Theta minus | n/a |
| 71.2 | exp | Retention curve of Mulch used in Exponential. Theta (h) = exp (k h) (Theta sat | Theta sat, Theta res, h min |

**Related theme.** water and heat movement in the soil.

## Topic 72: root

Root processes.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 72.1 | uptake | Roots that takes up water and nitrogen. | NH4 uptake, NO3 uptake, MaxPen, MaxWidth, h wp, MxNH4Up, MxNO3Up, Rxylem |
| 72.2 | zone | A 'uptake' base model (see 72.1, page 401) build into Daisy. | PenpFFac, PenClayFac, PenWaterFac, PenDSFac |
| 72.3 | classic | A 'zone' model (see 72.2, page 403) build into Daisy. | rootdens |

**Related theme.** the crop: growth, roots and water use.

## Topic 73: rootdens

Root density calculations. < component (SpRtLength 100 [m/g]) >  SpRtLength: number [m/g] Parameter (default 100) Specific root length

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 73.1 | Anders Pedersen | Use exponential function for root density. In this variant of Gerwitz and Page, 'a' | q, a |
| 73.2 | DS Depth | Specify root density as a function of development stage. | entries, density |
| 73.3 | DS Rel | Specify root density as a function of development stage. | entries, density |
| 73.4 | Depth Depth | Specify root density as a function of development stage. | entries, density |
| 73.5 | GP1D | Use exponential function for root density. See also [Gerwitz and Page, 1974] | DensRtTip, DensIgnore, a |
| 73.6 | GP2D | Use exponential function for root density in row crops. | DensRtTip, DensIgnore, debug, row position, row distance |
| 73.7 | Gerwitz+Page74 | Use exponential function for root density. See also [Gerwitz and Page, 1974] | DensRtTip, MinDens, a |
| 73.8 | growth | Dynamic root growth model. | Depth, DensRtTip, row position, row distance, Width, WRoot |
| 73.9 | local | Dynamic root growth model. | Depth, DensRtTip, row position, row distance, Width, neighbor effect, death rate, emerging |

**Related theme.** the crop: growth, roots and water use.

## Topic 74: rubiscoN

Find total amount of Rubisco-N in leaves.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 74.1 | default | Standard estimation of RuBisCo N. | fraction, Value description, offset, subtract Pt |

**Related theme.** the crop: growth, roots and water use.

## Topic 75: rubiscoNdist

The 'rubiscoNdist' component calculates the rubisco N distribution for photosyn- thesis in the canopy.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 75.1 | exp | Boegh et al.(2002) rubisco N-distribution model in the canopy for photosynthesis. | kn |
| 75.2 | expr | expr rubisco N-distribution model in the canopy. | value, obsolete, f photo |
| 75.3 | forced | Forced rubisco capacity distribution model in the canopy. | value, obsolete |
| 75.4 | uniform | Uniform rubisco N-distribution model in the canopy for photosynthesis. | f photo |

**Related theme.** the crop: growth, roots and water use.

## Topic 76: scope

A scope maps names to values.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 76.1 | exchange | Exchange values with an external model. | entries |

## Topic 77: scopesel

A method to choose a scope in a Daisy simulation.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 77.1 | multi | Combine multiple named scopes. | name |
| 77.2 | name | Select named scope. | name |
| 77.3 | null | Select the empty scope. | n/a |

## Topic 78: secondary

Specify secondary domain. The secondary domain consist typically of soil fractures or other inter-aggregate pores small enough to be dominated by capillarity, yet so large that water moves fast enough that the solute equilibrium with the primary domain (typically intra- aggregate pores) can not be maintained. This allows a pulse of water to be move through saturated or near saturated soil without solutes in the new water being mixed with solutes in the old water. The effects are twofold: It allows solutes applied t

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 78.1 | alpha | Shared base class for non-empty secondary domains. | alpha |
| 78.2 | cracks | A 'alpha' model (see 78.1, page 423) build into Daisy. | density, use secondary, aperture |
| 78.3 | pressure | A 'alpha' model (see 78.1, page 423) build into Daisy. | h lim, use secondary |
| 78.4 | none | No secondary domain. | n/a |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 79: seed

Initial growth after emergence. The initial growth process governs the growth of the crop until the point where there is enough leaf area for photosynthesis to take over.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 79.1 | LAI | Initial crop growth is governed by a forced LAI function. | SpLAIfac |
| 79.2 | release | Initial crop growth is governed by carbon released from seeds. | rate, initial weight, DM fraction, C fraction, N fraction |

**Related theme.** the crop: growth, roots and water use.

## Topic 80: select

Select part of state. < component (multi sum) (expr expr ) (flux flux ) (dimension dimension ) (factor 1 [?]) (offset 0 [?]) (accumulate false) (handle handle ) (tag tag ) (when when ) (documentation documentation ) (path path ...) (spec spec ) (interesting content interesting content ) (negate false) >  multi : string (see section 4.1.5) Optional parameter (default 'sum') This option determine how to handle mutiple matches within a timestep. This could be two crops on the same column, or one crop on two columns.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 80.1 | array | Log all members of an array. | n/a |
| 80.2 | quiver | Convert edge flow to node based flow vectors. | n/a |
| 80.3 | value | Log a single numeric value. | n/a |
| 80.4 | content | A 'value' model (see 80.3, page 432) build into Daisy. | height, OBSOLETE, y |
| 80.5 | flow | A 'value' base model (see 80.3, page 432) build into Daisy. | volume, density |
| 80.6 | flow back | A 'flow' model (see 80.5, page 433) build into Daisy. | n/a |
| 80.7 | flow bottom | A 'flow' model (see 80.5, page 433) build into Daisy. | to |
| 80.8 | flux bottom | A 'flow bottom' model (see 80.7, page 433) build into Daisy. | n/a |
| 80.9 | flow front | A 'flow' model (see 80.5, page 433) build into Daisy. | n/a |
| 80.10 | flow left | A 'flow' model (see 80.5, page 433) build into Daisy. | n/a |
| 80.11 | flow right | A 'flow' model (see 80.5, page 433) build into Daisy. | n/a |
| 80.12 | flow top | A 'flow' model (see 80.5, page 433) build into Daisy. | from, OBSOLETE |
| 80.13 | flux top | A 'flow top' model (see 80.12, page 435) build into Daisy. | n/a |
| 80.14 | index | A 'value' model (see 80.3, page 432) build into Daisy. | n/a |
| 80.15 | number | A 'value' model (see 80.3, page 432) build into Daisy. | n/a |
| 80.16 | volume base | A 'value' model (see 80.3, page 432) build into Daisy. | volume, density, space, min, max, sum, density y |
| 80.17 | interval | A 'volume base' model (see 80.16, page 436) build into Daisy. | from, OBSOLETE, to |
| 80.18 | volume | A 'volume base' model (see 80.16, page 436) build into Daisy. | n/a |
| 80.19 | water | A 'volume base' model (see 80.16, page 436) build into Daisy. | h, h ice |
| 80.20 | water interval | A 'water' model (see 80.19, page 439) build into Daisy. | from, OBSOLETE, to |
| 80.21 | water volume | A 'water' model (see 80.19, page 439) build into Daisy. | n/a |

## Topic 81: solute uptake

The 'solute uptake' component calculates uptake of nitrogen through roots.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 81.1 | diffusion | N is transported to the root surface based on diffusion and convection. | alpha, A, D, beta |
| 81.2 | fixed sink | A 'diffusion' model (see 81.1, page 443) build into Daisy. | CRoot |
| 81.3 | variable sink | A 'diffusion' model (see 81.1, page 443) build into Daisy. | Value description, F relative, CRoot, CEst |
| 81.4 | none | No uptake. | n/a |

**Related theme.** the crop: growth, roots and water use.

## Topic 82: solver

A way to solve the matrix equation 'A x = b'.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 82.1 | cxsparse | Solve equation using CXSparse library described in: | n/a |
| 82.2 | none | Don't solve the equation. | n/a |
| 82.3 | ublas | Solve equation using UBLAS lu functions. | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 83: source

Time series, with possible error bars and formatting information.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 83.1 | arithmetic | Read a daisy log, weather or data file. Calculate a single value for each time step, | file, with, timestep, missing, tag, dim line, style, title |
| 83.2 | column | Read a a single column from a Daisy log, weather or data file. | file, with, timestep, dimension, offset, missing, tag, dim line |
| 83.3 | combine | Combine data from multiple sources with a single expression. | source, with, style, title, accumulate |
| 83.4 | merge | Merge multiple timeseries into one. Any errorbars on the original timeseries are | source, with, dimension, style, title, accumulate |

## Topic 84: stomatacon

The 'Stomatacon' component calculates the stomata conductance of water vapour.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 84.1 | WSF | Common water stress effect parameters. | beta, ABA min, delta |
| 84.2 | BB base | A 'WSF' base model (see 84.1, page 455) build into Daisy. | m, b |
| 84.3 | BB | A 'BB base' model (see 84.2, page 455) build into Daisy. | n/a |
| 84.4 | Leuning | A 'BB base' model (see 84.2, page 455) build into Daisy. | Do |
| 84.5 | MNA | A 'WSF' model (see 84.1, page 455) build into Daisy. | alpha, m, b, obsolete, lambda |
| 84.6 | SHA12 | A 'WSF' model (see 84.1, page 455) build into Daisy. | alpha, m, min, lambda |
| 84.7 | SHA14 | A 'WSF' model (see 84.1, page 455) build into Daisy. | alpha, m, lambda |

**Related theme.** the crop: growth, roots and water use.

## Topic 85: string

Generic representation of strings.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 85.1 | cond | Return the value of the first clause whose condition is true. | clauses |
| 85.2 | identity | Return the specified value. | value |
| 85.3 | number | Extract the value of a number. | n/a |
| 85.4 | dimension | A 'number' model (see 85.3, page 459) build into Daisy. | n/a |
| 85.5 | value | A 'number' model (see 85.3, page 459) build into Daisy. | precision |

## Topic 86: summary

Summary reports for log parameterizations. < component (title title ) >  title: string (see section 4.1.5) Optional parameter Title of this summary. By default, use the name of the parameterization.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 86.1 | Rsqr | Calculate coefficient of determination. | measure, time, data, tag, value, print data |
| 86.2 | RsqrW | Calculate coefficient of determination. | measure, time, data, weight, tag, value, print data |
| 86.3 | balance | A summary model providing a balance for a log parameterization. | content, where, precision, input, output, require top |
| 86.4 | Biopore chemical balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.5 | Biopore water balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.6 | Field crop nitrogen balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.7 | Field mineral nitrogen balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.8 | Field nitrogen balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.9 | Field organic nitrogen balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.10 | Field water balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.11 | Matrix chemical balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.12 | Matrix water balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.13 | N balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.14 | Soil N balance | A 'N balance' model (see 86.13, page 464) defined in 'log-std.dai'. | n/a |
| 86.15 | Soil NH4+ balance | A 'N balance' model (see 86.13, page 464) defined in 'log-std.dai'. | n/a |
| 86.16 | Soil NO3- balance | A 'N balance' model (see 86.13, page 464) defined in 'log-std.dai'. | n/a |
| 86.17 | Soil mineral-N balance | A 'N balance' model (see 86.13, page 464) defined in 'log-std.dai'. | n/a |
| 86.18 | Soil organic-N balance | A 'N balance' model (see 86.13, page 464) defined in 'log-std.dai'. | n/a |
| 86.19 | Soil chemical balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.20 | Soil water balance | A 'balance' model (see 86.3, page 462) defined in 'log-std.dai'. | n/a |
| 86.21 | fractiles | Show fractiles for specified tags. | fractiles, tags, first |
| 86.22 | simple | A simple log file summary model. | fetch, where, precision, print sum, sum name |

## Topic 87: surface

Surface processes.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 87.1 | default | Keep track of soil surface. | max exfiltration, Value description, albedo dry, albedo wet, pond section, DetentionCapacity, ReservoirConstant, LocalDetentionCapacity |
| 87.2 | simple | Don't keep track of surface stuff. | n/a |
| 87.3 | const flux | A 'simple' model (see 87.2, page 469) build into Daisy. | n/a |
| 87.4 | none | A 'const flux' model (see 87.3, page 469) build into Daisy. | n/a |
| 87.5 | const pressure | A 'simple' model (see 87.2, page 469) build into Daisy. | pressure |
| 87.6 | source flux | A 'simple' model (see 87.2, page 469) build into Daisy. | source, interpolate |

**Related theme.** water and heat movement in the soil.

**Parameters that the workbench runs for this topic.** temperature change rate, EpFactor, albedo dry, albedo wet, DetentionCapacity, ReservoirConstant, LocalDetentionCapacity, z mixing, R mixing.

## Topic 88: svat

The task of the 'svat' component is to calculate the production stress, given the po- tential evapotranspiration, the actual evaporation from the surface, meteorological data, and the vegetation and soil state.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 88.1 | PMSW | Peter van der Keur's SVAT model. See also [van der Keur et al., 2001] | albedo, z 0s, alpha u, arac, theta c, rcmin const, zeta, f3const |
| 88.2 | SSOC | Sun-Shade Open Canopy. See also [Plauborg et al., 2010] | hypostomatous, max iteration, z 0b, s, lambda, rho a, gamma, T s |
| 88.3 | none | Decoupling surface energy and water balance. Done using reference values and crop | n/a |

**Related theme.** the crop: growth, roots and water use.

## Topic 89: tertiary

Transport of water and solute outside the matrix. Used by movement component Tertiary (see 56, page 307) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 89.1 | biopores | Tertiary domain divided into biopore classes. | active, pressure initiate, classes, pressure limit, active msg, Possible values, none, old dt |
| 89.2 | none | No tertiary transport. | n/a |
| 89.3 | old | Tertiary water and solute movement based on the obsolete 'macro' and 'mactrans' | macro, mactrans |

**Related theme.** water and heat movement in the soil.

## Topic 90: tortuosity

Solutes in the soil can't move the shortest way between two points. The tortuosity factor indicates how far the average solute have moved in absolute coordinates, when it has moved a given distance along the curved line. This component is responsible for calculating the soils tortuosity factor. Used by horizon component tortuosity (see 47, page 231) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 90.1 | M Q | Millington-Quirk. Thetaˆ(7/3) / Theta sat2 . | n/a |
| 90.2 | linear | Linear Impedance factor. a + b Theta. See also [Nye and Tinker, 1977] | a, b |

**Related theme.** water and heat movement in the soil.

## Topic 91: transform

Generic transformations between soil components.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 91.1 | equilibrium | Two soil components reching for equilibrium. | equilibrium, k BA |

**Related theme.** nitrogen, carbon and organic matter.

## Topic 92: transport

Solute transport in primary domain.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 92.1 | Hansen | Solute transport using convection-dispersion. | n/a |
| 92.2 | Mollerup | Coupled vertical and horizontal transport. See Mollerup 2007 for details. | debug, None, Timestep reduction, Streamline diffusion, upstream weight |
| 92.3 | convection | Pure forward calculation of flow except through upper boundary. J[edge] = q[edge] | n/a |
| 92.4 | none | Disable all transport except through boundaries. | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 93: ui

Top level user interface. Used by Toplevel @ ui (see 107.30, page 626) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 93.1 | none | No user unterface. | n/a |
| 93.2 | progress | Write progress on standard output (or standard error). | n/a |

## Topic 94: uifilter

Presentation of data in the user interface.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 94.1 | base | Base filter for the user interface. | n/a |
| 94.2 | raw | A 'base' model (see 94.1, page 493) build into Daisy. | n/a |
| 94.3 | simple | A 'base' model (see 94.1, page 493) build into Daisy. | default, name |

## Topic 95: uiitem

User interface information about a item. < component (name name ) >  name: string (see section 4.1.5) Parameter Name of user interface unit.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 95.1 | raw | Raw item for the user interface. | n/a |

## Topic 96: unit

Specify units of physical quatities. Daisy will recognise both the build-in and user defined units, and convert be- tween different units representing the same physical dimension. This is done by converting to and from the base (usually defined by SI) unit for that dimension.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 96.1 | SI | Base parameterization for all SI based units. | time, length, mass, electric current, thermodynamic temperature, luminous intensity |
| 96.2 | SIfactor | A 'SI' model (see 96.1, page 497) build into Daisy. | n/a |
| 96.4 | % | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.5 | <fraction> | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.6 | <none> | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.7 | A | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.8 | J | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.9 | J/cm2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.10 | J/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.11 | K | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.12 | K−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.13 | K−2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.14 | L/g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.15 | L/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.16 | L/mg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.17 | MJ/d/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.18 | MJ/h/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.19 | MJ/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.20 | MJ/m2 /d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.21 | MJ/m2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.22 | MPa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.23 | MPa−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.24 | Mg DM/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.25 | Mg DM/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.26 | Mg w.w./ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.27 | Mg/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.28 | Pa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.29 | Pa−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.30 | T w.w./ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.31 | W | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.32 | W m−2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.33 | W/cm2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.34 | W/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.35 | Wh/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.36 | ag/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.37 | cd | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.38 | cm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.39 | cm R/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.40 | cm/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.41 | cm/dg C/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.42 | cm/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.43 | cm−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.44 | cm−2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.45 | cm2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.46 | cm2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.47 | cm2 /s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.48 | cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.49 | cm3 H2O/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.50 | cm3 /cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.51 | cm3 /g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.52 | cm3 /ng | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.53 | d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.54 | d−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.55 | erg/cm2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.56 | fg/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.57 | fraction | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.58 | g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.59 | g C/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.60 | g C/cm2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.61 | g C/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.62 | g C/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.63 | g DM/cm2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.64 | g DM/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.65 | g DM/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.66 | g N/cm2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.67 | g N/cm2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.68 | g N/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.69 | g N/l | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.70 | g N/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.71 | g N/m2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.72 | g w.w./m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.73 | g/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.74 | g/cm R/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.75 | g/cm/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.76 | g/cm2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.77 | g/cm2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.78 | g/cm2 /mm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.79 | g/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.80 | g/cm3 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.81 | g/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.82 | g/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.83 | g/ha/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.84 | g/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.85 | g/ha/mm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.86 | g/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.87 | g/l | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.88 | g/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.89 | g/m2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.90 | g/mol | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.91 | h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.92 | hPa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.93 | h−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.94 | ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.95 | hours | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.96 | kJ/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.97 | kPa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.98 | kWh/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.99 | kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.100 | kg C/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.101 | kg C/ha/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.102 | kg C/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.103 | kg DM/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.104 | kg DM/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.105 | kg DM/m3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.106 | kg N/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.107 | kg N/ha/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.108 | kg N/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.109 | kg N/ha/mm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.110 | kg N/ha/y | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.111 | kg m−2 s−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.112 | kg w.w./ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.113 | kg/Pa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.114 | kg/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.115 | kg/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.116 | kg/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.117 | kg/ha/mm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.118 | kg/ha/y | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.119 | kg/m | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.120 | kg/m/s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.121 | kg/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.122 | kg/m2 /s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.123 | kg/m3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.124 | kg/mol | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.125 | kg/s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.126 | kgN/ha/year | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.127 | l/g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.128 | l/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.129 | l/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.130 | l/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.131 | l/mg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.132 | m | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.133 | m s−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.134 | m/s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.135 | mL/g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.136 | mL/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.137 | m−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.138 | m−2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.139 | m−2 kg s−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.140 | m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.141 | m2 /s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.142 | m3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.143 | m3 /cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.144 | m3 /kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.145 | mg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.146 | mg N/kg dry soil | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.147 | mg N/l | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.148 | mg/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.149 | mg/g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.150 | mg/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.151 | mg/ha/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.152 | mg/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.153 | mg/l | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.154 | mg/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.155 | minutes | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.156 | ml/g | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.157 | ml/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.158 | mm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.159 | mm/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.160 | mm/dg C/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.161 | mm/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.162 | mm/s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.163 | mm−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.164 | mmol/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.165 | mmol/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.166 | mmol/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.167 | mmol/m2 /s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.168 | mol | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.169 | mol/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.170 | mol/kg | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.171 | mol/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.172 | mol/m2 /s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.173 | mol/m3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.174 | ng/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.175 | ng/MPa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.176 | ng/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.177 | ng/kPa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.178 | ng/l | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.179 | ng/mm/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.180 | none | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.181 | pg/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.182 | ppm | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.183 | s | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.184 | s−1 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.185 | seconds | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.186 | t/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.187 | ug | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.188 | ug/L | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.189 | ug/L/MPa | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.190 | ug/ha | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.191 | ug/ha/d | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.192 | ug/ha/h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.193 | ug/l | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.194 | ug/m2 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.195 | ug/m2 /h | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.196 | ug/m3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.197 | um | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.198 | umol/cm3 | A 'SIfactor' model (see 96.2, page 498) build into Daisy. | n/a |
| 96.199 | base | A base unit. | n/a |
| 96.200 | <error> | A 'base' model (see 96.199, page 529) build into Daisy. | n/a |
| 96.201 | <unknown> | A 'base' model (see 96.199, page 529) build into Daisy. | n/a |
| 96.202 | dgEast | A 'base' model (see 96.199, page 529) build into Daisy. | n/a |
| 96.203 | dgNorth | A 'base' model (see 96.199, page 529) build into Daisy. | n/a |
| 96.204 | dry soil fraction | A 'base' model (see 96.199, page 529) build into Daisy. | n/a |
| 96.205 | rad | A 'base' model (see 96.199, page 529) build into Daisy. | n/a |
| 96.206 | factor | Connvert to base units by multiplying with a factor. | base |
| 96.207 | dg | A 'factor' model (see 96.206, page 530) build into Daisy. | n/a |
| 96.208 | dgSouth | A 'factor' model (see 96.206, page 530) build into Daisy. | n/a |
| 96.209 | dgWest | A 'factor' model (see 96.206, page 530) build into Daisy. | n/a |
| 96.210 | new dg | A 'factor' model (see 96.206, page 530) build into Daisy. | n/a |
| 96.211 | ppm dry soil | A 'factor' model (see 96.206, page 530) build into Daisy. | n/a |
| 96.212 | offset | Connvert to base units by multiplying factor, then substracting offset. | base, offset |
| 96.213 | dg C | A 'offset' model (see 96.212, page 531) build into Daisy. | n/a |
| 96.214 | dg F | A 'offset' model (see 96.212, page 531) build into Daisy. | n/a |
| 96.215 | pF | log10 (- cmH2O). | n/a |

## Topic 97: uz1d

The 'uz1d' component handles the horizontal water movement in the unsaturated zone soil matrix.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 97.1 | none | Disable transport | n/a |
| 97.2 | richards | A numerical solution to Richard's Equation. | max iterations, K average |

**Related theme.** water and heat movement in the soil.

## Topic 98: uzmodel

The 'uzmodel' component handles the vertical water movement in the unsaturated zone soil matrix.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 98.1 | lr | Use gravitational water movement for wet soil, where h > h fc. There are no water | overflow warn, h fc, z top |
| 98.2 | none | No water movement, and no sink. | n/a |
| 98.3 | richards | A numerical solution to Richard's Equation. | debug, max iterations, K average |
| 98.4 | richards2 | A numerical solution to Richard's Equation. | debug, max iterations, K average, min timestep, low iterations, high iterations |

**Related theme.** water and heat movement in the soil.

## Topic 99: uzrect

2D water movement in a rectangular grid.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 99.1 | Mollerup | A finite volume solution to matrix water transport. See Mollerup 2007 for details. | debug, max iterations, K average, Kedge |
| 99.2 | const | Steady-state water flow. | n/a |
| 99.3 | v+h | Transport water in the matrix in two phases, first vertical, then horizontal. | n/a |

**Related theme.** water and heat movement in the soil.

## Topic 100: vegetation

That green stuff. < component (EpInterchange 0.6 [<fraction>]) >  EpInterchange: number [<fraction>] Parameter (default 0.6) Canopy adsorbtion fraction of unreached potential soil evaporation. Log Variables  N : number [kg N/ha] Current nitrogen content of vegetation.  LAI : number [m2 /m2 ] Total LAI of all crops on this column  LAIvsH : plf [m2 /m2 → cm] Total canopy LAI below given height  height: number [cm] Max crop height in canopy  albedo: number (dimensionless) Another reflection factor  cover : numb

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 100.1 | afforestation | A growing forest. | Root, Canopy, root am, litter am, Albedo, planting time, canopy height, root depth |
| 100.2 | crops | Keep track of all crops on the field. | crops, harvest |
| 100.3 | permanent | Permanent (non-crop) vegetation. | Root, Canopy, Height, litter am, Albedo, N uptake |
| 100.4 | Bush | A 'permanent' model (see 100.3, page 547) defined in 'vegetation.dai'. | n/a |
| 100.5 | Coniferous | A 'permanent' model (see 100.3, page 547) defined in 'vegetation.dai'. | n/a |
| 100.6 | Grass | A 'permanent' model (see 100.3, page 547) defined in 'vegetation.dai'. | n/a |
| 100.7 | Hardwood | A 'permanent' model (see 100.3, page 547) defined in 'vegetation.dai'. | n/a |

**Related theme.** the crop: growth, roots and water use.

## Topic 101: vernalization

Requirement for a cold period before flowering.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 101.1 | default | Temperature sum dependent vernalization. | DSLim, TaLim, TaSum |
| 101.2 | none | No vernalization. | n/a |

**Related theme.** the crop: growth, roots and water use.

## Topic 102: volume

A subset of 3D space. Used by Irrigation @ event volume (see 107.10, page 604) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 102.1 | box | A volume defined by intervals on each axis. By default, the intervals fill the entire | top, bottom, left, right, front |

## Topic 103: weather

A 'wsource' is a source of raw weatherdata.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 103.1 | weather | Weather interface implementation. | snow fraction, Value description, max rain, deposit, value, name, day length, reference evapotranspiration |
| 103.2 | base | A 'weather' base model (see 103.1, page 555) build into Daisy. | T min, AirTemp, Precip, RefEvap, VapPres, RelHum, Latitude, Longitude |
| 103.3 | const | A 'base' model (see 103.2, page 557) build into Daisy. | n/a |
| 103.4 | none | A 'const' model (see 103.3, page 561) build into Daisy. | n/a |
| 103.5 | null | A 'const' model (see 103.3, page 561) build into Daisy. | n/a |
| 103.6 | table | A 'base' model (see 103.2, page 557) build into Daisy. | file, missing, tag, dim line |
| 103.7 | default | A 'table' model (see 103.6, page 562) build into Daisy. | file, missing years, from, to |
| 103.8 | combine | A 'weather' model (see 103.1, page 555) build into Daisy. | entry, source, begin, use, reserve |
| 103.9 | indirect | A 'weather' model (see 103.1, page 555) build into Daisy. | source |
| 103.10 | time | A 'indirect' model (see 103.9, page 567) build into Daisy. | offset, from, to |

**Related theme.** weather, radiation and evapotranspiration.

## Topic 104: wse

The water stress effect on crop growth.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 104.1 | full | Water stress has full effect on crop growth. This means that if there is 50% water | n/a |
| 104.2 | none | Water stress has no effect on plant growth. | n/a |
| 104.3 | partial | Water stress has partial effect on crop growth. | n/a |

**Related theme.** the crop: growth, roots and water use.

## Topic 105: xysource

XY data series.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 105.1 | arithmetic | Read a daisy log, weather or data file. Calculate an x and an y value for each time | file, with, missing, tag, dim line, style, title, y |
| 105.2 | combine | Combine data from multiple time series with a single expression. Data from times | source, with, style, title, y |
| 105.3 | flux | Read a daisy 2d log file, extract flux through line. Values between 'begin' and 'end' | file, with, dimension, begin, missing, tag, dim line, style |
| 105.4 | frequency | Read a daisy log, weather or data file. Plot the frequency of a specific column. | file, with, missing, tag, dim line, style, title, sort |
| 105.5 | inline | A list of x, y pairs. | with, points, style, title, x dimension, y dimension |
| 105.6 | loop | Calculate x and y pairs based on a single variable. | with, begin, style, title, tag, y, step |
| 105.7 | merge | Merge multiple xy data series into one. | source, with, style, title, x dimension, y dimension |
| 105.8 | profile | Plot soil profile. | file, with, dimension, missing, tag, dim line, style, title |
| 105.9 | xycombine | Combine data from multiple time series with a single expression. Data from times | source, with, style, title |

## Topic 106: zone

A subset of 3D space. Used by SoilRegion @ volume (see 107.20, page 613) .

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 106.1 | box | A zone defined by intervals on each axis. By default, the intervals fill the entire | top, bottom, left, right, front |
| 106.2 | polygon | A 2D region defined by points connected by lines. The object is assumed to be | n/a |

## Topic 107: Fixed Components

Fixed components are similar to ordinary component, with the exceptions that there can only be one model, that is, only a single implementation of the component, and that it is not possible to define libraries of standard parameterizations for the model.

| Section | Name | What it covers | Components |
|:--|:--|:--|:--|
| 107.1 | DOM | A single Dissolved Organic Matter pool. | diffusion coefficient, efficiency, fractions, turnover rate, turnover halftime |
| 107.2 | SoluteUptakeResult | Result of the 'solute uptake' number model. | uptake, alpha, D, beta, C root |
| 107.3 | SoluteUptake2Result | Result of the 'solute uptake2' number model. | uptake, alpha, A, D, beta, C root |
| 107.4 | CanopySimple | Simple canopy model. | PARext, NIRext, EPext, IntcpCap, EpFac, Value description, EpFacWet, rs min |
| 107.5 | CanopyStandard | Standard canopy model. | PARext, NIRext, EPext, IntcpCap, EpFac, Value description, EpFacWet, rs min |
| 107.6 | CrpN | Default crop nitrogen parameters. | PtLeafCnc, CrLeafCnc, NfLeafCnc, PtStemCnc, CrStemCnc, NfStemCnc, PtSOrgCnc, CrSOrgCnc |
| 107.7 | Harvesting | Information about what happens to the crop at harvest and cut. | Root, Stem, SOrg, last cut, production delay, cut delay, sorg height, cut stress |
| 107.8 | Partition | Assimilate partitioning in the default crop model. The 'Root' parameter determine | Root, Stem, RSR, max WRoot, NNI crit, NNI inc |
| 107.9 | Production | Crop production in the default crop model. | WRoot, ReMobilRt, StemRes, CH2OReleaseRate, E Root, E Stem, E SOrg, r Root |
| 107.10 | Irrigation | Keep track of active irrigation events. Usually not set explicitly, but may be found | event, solute, name, value, volume, temperature, time left, target |
| 107.11 | Bioincorporation | Biological incorporation of organic matter in soil. | respiration, distribution |
| 107.12 | DOM-Element | A single element in a Dissolved Organic Matter pool. | J tertiary, S p, S drain |
| 107.13 | Fetch | A summary file line. | tag |
| 107.14 | FetchPretty | A summary file line. | tag, name |
| 107.15 | Harvest | Log of all harvests during the simulation. | crop, column, sow time, emerge time, flowering time, ripe time, harvest time, water productivity |
| 107.16 | Geometry1D | A one dimensional discretization of the soil. | zplus |
| 107.17 | GeometryRect | A rectangular discretization of the soil. | zplus, xplus |
| 107.18 | HorHeat | Heat capacity and conductivity per horizon. | intervals, K ice |
| 107.19 | SoilLayer | A location and content of a soil layer. The layers apply to the soil section not | horizon |
| 107.20 | SoilRegion | A location and content of a soil zone. If several zones cover the same soil, the first | volume, horizon |
| 107.21 | Soil | The soil submodel provides the numeric and physical properties of the soil. | horizons, zones, Hydraulic, MaxRootingDepth, dispersivity |
| 107.22 | SoilHeat | Temperature and heat flux in soil. | q lim, value, h frozen, enable ice, ice dt, state, q, conductivity |
| 107.23 | SoilWater | Keep track of water and pressure in the soil matrix. | h, Theta, S permanent, default h, use last, initial h, value, initial Theta |
| 107.24 | Snow | Simulate snow pack on surface. Snow Hydrology , U.S. Corps of Engineers, 1956. | partial day, age, dZs, mtprime, mrprime, rho s, f c, Psa |
| 107.25 | Timestep | Relative time. | seconds, minutes, hours, days, microseconds |
| 107.26 | Weatherdata | Weather data. | T min, AirTemp, Precip, RefEvap, VapPres, RelHum, Latitude, Longitude |
| 107.27 | Time | Year, month, day and hour, minute, second and microsecond. | month, mday, minute, yday, wday |
| 107.28 | IntegerCondClause | If condition is true, return value. | condition, value |
| 107.29 | StringerCondClause | If condition is true, return value. | condition, value |
| 107.30 | Toplevel | The top level syntax for a Daisy setup file. | input, directory, run, path, OBSOLETE, install directory |

**Combinations of the Experiments tab that use this topic.** A drier, wetter or warmer year; Evapotranspiration model and radiation.

