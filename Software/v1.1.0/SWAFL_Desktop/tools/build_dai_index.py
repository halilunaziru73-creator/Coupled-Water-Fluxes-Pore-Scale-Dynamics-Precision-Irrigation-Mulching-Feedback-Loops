"""Collects every Daisy set-up file (.dai) that the set-up editor offers, and writes its index.
   python3 tools/build_dai_index.py <path of the Daisy clone (for sample/)>
   Sources (copied unchanged): daisy/lib/*.dai (the library that the bundled Daisy reads), <clone>/sample/*.dai,
   app/data/daisy/scenarios/common/*.dai (the SWAFL farm), the two daisypy examples (io-sample, optim-template)."""
import os, re, shutil, json, sys, glob
H=os.path.dirname(os.path.abspath(__file__))+'/..'; D=H+'/app/data/daisy'
clone=sys.argv[1] if len(sys.argv)>1 else '/home/claude/daisy-model/daisy'
G_START,G_CROP,G_SOIL,G_FERT,G_CHEM,G_ACT,G_LOG,G_EX,G_MAN,G_SPEC,G_LIB='1 Start here: the SWAFL farm','2 Crops','3 Soils and soil horizons','4 Fertilisers and manure','5 Chemicals and pesticides','6 Tillage and irrigation','7 Output logs','8 Complete example set-ups','9 Management of example farms','10 Special topics and tests','11 Library index files'
M={ # file -> (group, title, what it is)
'swafl/ArableFarmRotation.dai':(G_START,'Arable farm rotation','The farm of the SWAFL runs: spring and winter barley, winter rape and winter wheat, rainfed.'),
'swafl/ArableFarmRotation_withirrigation.dai':(G_START,'Arable farm rotation with irrigation','The same rotation with the irrigation of the SWAFL experiments.'),
'swafl/ResFarm.dai':(G_START,'Soil and column of the farm','The ResFarm soil, the column, the weather link and free drainage.'),
'swafl/OutputLog.dai':(G_START,'Output logs of the farm','The logs that every SWAFL run writes (yield, water, nitrogen).'),
'lib/dk-horizon.dai':(G_SOIL,'Danish soil horizons JB1 to JB7','Soil horizons with van Genuchten hydraulics, texture and humus.'),
'sample/dk-soil.dai':(G_SOIL,'Danish soils','Complete soil profiles built from the horizons (Askov, Jyndevad, Foulum and others).'),
'sample/it-soil.dai':(G_SOIL,'Italian soils','Soil profiles of the Italian sample.'),
'sample/pl-soil.dai':(G_SOIL,'Polish soil','Soil profile of the Polish sample.'),
'sample/cz-soil.dai':(G_SOIL,'Czech soil','Soil profile of the Czech sample.'),
'sample/sk-soil.dai':(G_SOIL,'Slovak soil','Soil profile of the Slovak sample.'),
'sample/pedo-soil.dai':(G_SOIL,'Soil from pedotransfer functions','A JB1 soil whose hydraulics come from pedotransfer functions.'),
'sample/init-soil.dai':(G_SOIL,'Initial soil water and nitrogen','How to set the starting contents of the soil.'),
'lib/fertilizer.dai':(G_FERT,'Fertilisers (general)','Mineral fertilisers and manures with their nitrogen fractions.'),
'lib/dk-fertilizer.dai':(G_FERT,'Danish fertilisers and slurries','Danish manure and slurry types.'),
'lib/markvand.dai':(G_FERT,'Field water and irrigation water','Water types for irrigation, with their nitrate content.'),
'lib/chemistry-base.dai':(G_CHEM,'Chemicals: standard definitions','The basic chemical definitions that the others build on.'),
'lib/chemistry.dai':(G_CHEM,'Pesticides','Standard pesticides with decay and sorption.'),
'lib/PFAS.dai':(G_CHEM,'PFAS compounds','Ways of defining PFAS compounds.'),
'sample/PFAS-sample.dai':(G_CHEM,'PFAS transport sample','A set-up that simulates PFAS transport.'),
'lib/tillage.dai':(G_ACT,'Tillage operations','Ploughing, harrowing and other soil operations.'),
'sample/irrigation.dai':(G_ACT,'Irrigation strategies','Tensiometer and content triggers of irrigation.'),
'sample/DrainDrying.dai':(G_ACT,'Drainage and drying of a soil','Two set-ups that test how a soil drains and dries.'),
'lib/log.dai':(G_LOG,'Log files (all kinds)','The log types that Daisy can write: yield, water, nitrogen, soil, weather.'),
'lib/log-std.dai':(G_LOG,'Standard logs','The standard daily and annual logs.'),
'lib/log-old.dai':(G_LOG,'Old log definitions','Log definitions of older versions, kept for old set-ups.'),
'lib/ui-Qt.dai':(G_LOG,'Logs for the Qt interface','Logs used by the former Daisy window program.'),
'sample/log-sample.dai':(G_LOG,'Sample log files','A small set-up that writes sample logs.'),
'sample/sample.dai':(G_EX,'Small sample set-up','A small complete set-up built from the sample files.'),
'sample/test.dai':(G_EX,'Tutorial set-up','The set-up used in the Daisy tutorial.'),
'sample/test-refman.dai':(G_EX,'Set-up for the reference manual','A short set-up that uses the Daisy libraries.'),
'sample/cz-sample.dai':(G_EX,'Czech sample','A complete Czech set-up (FertOrgaNic project).'),
'sample/it-sample.dai':(G_EX,'Italian sample','A complete Italian set-up.'),
'sample/pl-sample.dai':(G_EX,'Polish sample','A complete Polish set-up (FertOrgaNic project).'),
'sample/sk-sample.dai':(G_EX,'Slovak sample','A complete Slovak set-up.'),
'sample/safir-site.dai':(G_EX,'SAFIR field site','A site set-up of the SAFIR project.'),
'sample/safir-common.dai':(G_EX,'SAFIR common calibration','Calibrations common to the SAFIR sites.'),
'sample/afforestation.dai':(G_EX,'Afforestation','A forest planted on arable land.'),
'sample/batch.dai':(G_EX,'Batch runs','How to run many set-ups in a batch.'),
'sample/dk-management.dai':(G_MAN,'Danish crop management','Sowing, fertilising, irrigation and harvest of common Danish crops.'),
'sample/dk-veg-man.dai':(G_MAN,'Danish vegetable management','Management of vegetables, Aarhus County 2004/2005.'),
'sample/it-management.dai':(G_MAN,'Italian management','Management for 1996 to 2004.'),
'sample/pl-management.dai':(G_MAN,'Polish management','Management of the Polish sample.'),
'sample/cz-management.dai':(G_MAN,'Czech management','Management of the Czech sample.'),
'sample/sk-management.dai':(G_MAN,'Slovak management','Management of the Slovak sample.'),
'sample/OpenMI_management.dai':(G_MAN,'Management through OpenMI','Management imported from another model through OpenMI.'),
'lib/vegetation.dai':(G_LIB,'Permanent vegetation','Parameters of permanent vegetation.'),
'lib/crop.dai':(G_LIB,'All crops (index)','Includes the current crop files.'),
'lib/crop-old.dai':(G_LIB,'Old crops (index)','Includes the old crop parameterisations.'),
'lib/dk-crop.dai':(G_LIB,'Danish crops (index)','Includes the Danish crop files.'),
'lib/all.dai':(G_LIB,'Everything (index)','Includes all standard Daisy parameterisations.'),
'lib/mini.dai':(G_LIB,'MiniDaisy defaults','Default parameters of the small MiniDaisy.'),
'lib/OpenMI.dai':(G_LIB,'OpenMI exchange items','Input and output items for coupling through OpenMI.'),
'tools/optim-template.dai':(G_SPEC,'Template for calibration','A set-up with {placeholders} that the optimiser fills.'),
'tools/io-sample.dai':(G_SPEC,'Sample for file reading','A small set-up used to test the reading of .dai files.'),
'sample/heat-properties.dai':(G_SPEC,'Heat properties of the soil','Thermal properties and their options.'),
'sample/sample-heat.dai':(G_SPEC,'Soil heat sample','A set-up with soil heat and ice.'),
'sample/genweather.dai':(G_SPEC,'Generated weather','Automatic generation of weather files.'),
'sample/test-prd.dai':(G_SPEC,'Partial root-zone drying','Irrigation of half of the root zone at a time.'),
'sample/test-colloids.dai':(G_SPEC,'Colloids','Transport of colloids in the soil.'),
'sample/test-aba.dai':(G_SPEC,'Abscisic acid (ABA)','Plant signal of drying soil.'),
'sample/test-minimize.dai':(G_SPEC,'Automatic calibration','Daisy minimises the error of a parameter.'),
'sample/test-organic.dai':(G_SPEC,'New organic matter template','A new organic matter model.'),
'sample/test-GP2D.dai':(G_SPEC,'Root density in two dimensions','The GP2D root density program.'),
'sample/rootmatch.dai':(G_SPEC,'Root measurements','Compares root measurements with Daisy.'),
'sample/test-python.dai':(G_SPEC,'Python inside Daisy','Calls a Python function from Daisy.'),
'sample/test-post.dai':(G_SPEC,'Post-processing of logs','Converts .dlf files after a run.'),
'sample/test-spawn.dai':(G_SPEC,'Spawning runs','Runs scenarios from a running set-up.'),
'sample/test-cp.dai':(G_SPEC,'Checkpoint','Writes a checkpoint of the whole state.'),
'sample/test-scn.dai':(G_SPEC,'Scenario from a checkpoint','Starts from the checkpoint of test-cp.'),
'sample/checkpoint-1988-4-1+1.dai':(G_SPEC,'Example checkpoint','A saved state of a simulation, for a hot start.'),
'sample/OpenMI_simple.dai':(G_SPEC,'Two columns through OpenMI','Two bare-soil columns coupled through OpenMI.'),
}
for f in sorted(os.listdir(H+'/daisy/lib')):
    if f.endswith('.dai') and 'lib/'+f not in M:
        txt=open(H+'/daisy/lib/'+f,errors='ignore').read(); names=list(dict.fromkeys(n.strip(';') for n in re.findall(r'\(defcrop\s+"?([^"()]+?)"?\s+\S',txt)))
        old='-old' in f; M['lib/'+f]=(G_CROP,('Old ' if old else '')+f[:-4].replace('-old','').replace('_',' ').replace('-',' ').capitalize()+(' (old)' if False else ''),('Crop parameters: '+', '.join(names[:4])+(' and more' if len(names)>4 else '')+'.') if names else 'Crop parameters.')
out=[]
for k,(g,t,d) in M.items():
    src=k.split('/')[0]; name=os.path.basename(k)
    if src=='lib': s=H+'/daisy/lib/'+name
    elif src=='sample': s=clone+'/sample/'+name
    elif src=='swafl': s=D+'/scenarios/common/'+name
    else: s=D+'/dai/'+name if os.path.exists(D+'/dai/'+name) else D+'/dai/tools/'+name
    if not os.path.exists(s): print('missing',k,s); continue
    dst=D+'/dai/'+k
    os.makedirs(os.path.dirname(dst),exist_ok=True)
    if os.path.abspath(s)!=os.path.abspath(dst): shutil.copyfile(s,dst)
    out.append({'file':name,'path':k,'group':g,'title':t,'desc':d,'bytes':os.path.getsize(dst)})
ix=json.load(open(D+'/index.json')); ix['dai']=sorted(out,key=lambda e:(int(e['group'].split()[0]),e['title'].lower()))
json.dump(ix,open(D+'/index.json','w'),indent=0)
# remove the five flat files of the earlier release (now under lib/, sample/ and tools/)
for f in ['dk-horizon.dai','io-sample.dai','irrigation.dai','optim-template.dai','tillage.dai']:
    p=D+'/dai/'+f
    if os.path.exists(p): os.remove(p)
print(len(out),'files; groups:',sorted({e['group'] for e in out}))
