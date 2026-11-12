/* Plain words: what the terms of SWAFL and of the Daisy workbench mean, in a few easy words.
   1. Help > Plain words opens the list, with a search box.
   2. Any short label of the program that is a term of the list (a table cell, a field name, a button) gets its explanation as a hint when the pointer rests on it. */
'use strict';
(() => {
  // [name, regular expression of the label, explanation]
  const T = [
    ['Field capacity (FC)', '^(field capacity|FC)\\b', 'The water a soil keeps after the extra water has drained away, about two days after a good rain or irrigation. The soil is "full" for the crop.'],
    ['Wilting point (WP)', '^(wilting point|permanent wilting point|WP)\\b', 'The water that is still in the soil when the crop can no longer take any of it. The crop wilts and does not recover.'],
    ['Available water (AW, TAW)', '^(available water|plant.available water|AW|TAW|AWC)\\b', 'The water between field capacity and the wilting point: the part of the soil water that the crop can use. TAW is the total in the root zone, AWC is mm of water per cm of soil.'],
    ['Readily available water (RAW)', '^(readily available|RAW)\\b', 'The first part of the available water, which the crop takes without stress. After it is used the crop starts to suffer.'],
    ['Depletion', '^depletion\\b', 'How much of the available water has been used, from 0 (soil full, at field capacity) to 1 (soil dry, at the wilting point).'],
    ['Critical depletion f*', '^(critical (stress|depletion)|f\\*|f =)', 'The depletion at which the crop starts to be stressed, for example 0.45 means that 45 % of the available water is used. Irrigation should start before it.'],
    ['Trigger', '^(trigger|irrigation trigger|irrigate when)\\b', 'The rule that starts an irrigation: the soil suction (or depletion) at the sensor at which you irrigate.'],
    ['Suction (cm)', '^(suction|soil suction|matric potential|potential)\\b', 'How strongly the soil holds its water, in cm of water. A wet soil has a small number (about 100 cm), a dry soil a large one (1,000 cm and more). It is what a tensiometer reads.'],
    ['pF', '^pF\\b', 'The suction written as a power of ten: pF 2 is 100 cm, pF 3 is 1,000 cm, pF 4.2 is the wilting point.'],
    ['Evapotranspiration (ET)', '^(evapotranspiration|ET0|ETo|ETc|ET\\b)', 'The water lost to the air from the soil (evaporation) and through the leaves (transpiration), in mm per day. ET0 is for a standard grass, ETc is for your crop.'],
    ['Crop coefficient Kc', '^(Kc|crop coefficient)\\b', 'The number that turns the water use of standard grass (ET0) into the water use of your crop at its stage of growth: ETc = Kc times ET0.'],
    ['Stress factor Ks', '^(Ks|stress factor)\\b', 'A number from 1 (no stress) down to 0 (the crop stops taking water) that lowers the crop water use when the soil is too dry.'],
    ['Drainage', '^(drainage|deep percolation|percolation)\\b', 'Water that moves below the roots and is lost to the crop. It can carry nitrate with it.'],
    ['Runoff', '^(runoff|run.off)\\b', 'Water that runs over the soil surface and does not enter the soil.'],
    ['Water content (theta)', '^(theta|θ|water content)\\b', 'The share of the soil volume that is water, in % by volume or m3 per m3.'],
    ['Porosity', '^(porosity|pore space)\\b', 'The share of the soil volume that is pores (air and water) and not solid.'],
    ['Pore index', '^pore index\\b', 'A number from 0 (tight soil) to 1 (loose, freshly tilled soil) that SWAFL uses to describe how open the topsoil is. Tillage raises it and the soil settles back with time.'],
    ['Consolidation', '^(consolidation|structural consolidation|time consolidation)\\b', 'How fast a tilled soil settles and its large pores close again, per day. A high rate closes the cracks sooner.'],
    ['Tillage', '^(tillage|conventional|reduced|no.till)\\b', 'How the soil is worked before sowing: conventional (plowed), reduced (lighter) or no-till (not worked).'],
    ['Mulch', '^mulch\\b', 'A cover on the soil (straw, plastic and others) that cuts evaporation and warms or cools the soil.'],
    ['Hydraulic conductivity (Ksat)', '^(Ksat|K_sat|K_s|hydraulic conductivity|saturated conductivity)', 'How easily water moves through the soil when it is full, in cm per day or mm per hour. Sand is high, clay is low.'],
    ['van Genuchten parameters', '^(van Genuchten|alpha|vg_)', 'The numbers of the equation that describes how much water the soil holds at each suction: alpha (where the soil starts to drain) and n (how sharply it drains).'],
    ['Richards equation', '^Richards', 'The physical equation of water flow in soil that the model solves in every layer and every time step.'],
    ['Soil texture', '^(texture|soil texture|sand|silt|clay)\\b', 'The mix of sand, silt and clay of the soil, in %. The soil textural triangle names the class.'],
    ['Mg/ha', '^(Mg/ha|Mg ha)', 'Megagrams per hectare, the same as tonnes per hectare (t/ha). 1 Mg/ha is 100 g per m2.'],
    ['kg N/ha', '^kg N', 'Kilograms of nitrogen per hectare.'],
    ['Nitrate leaching', '^(nitrate|leach)', 'Nitrate that is washed below the roots with the drainage water. It is lost to the crop and can reach the groundwater.'],
    ['Denitrification', '^denitrif', 'The loss of nitrate as gas (N2 and N2O) from wet soil.'],
    ['Mineralisation', '^mineralis', 'The release of mineral nitrogen from the organic matter of the soil.'],
    ['Fertiliser N25S', '^N25S', 'The standard mineral fertiliser of the farm in the Daisy examples (25 % nitrogen with sulphur).'],
    ['K_OC (sorption)', '^(K_?OC|sorption)', 'How strongly a chemical sticks to the organic carbon of the soil, in L per kg. A high number means it moves slowly with the water.'],
    ['Half-life (DT50)', '^(half.life|DT.?50)', 'The days after which half of a chemical in the soil has been broken down.'],
    ['GUS index', '^GUS', 'A leaching score of a pesticide from its half-life and sorption: above 2.8 it is likely to leach, below 1.8 it is not.'],
    ['FAO-56', '^(FAO.?56|Penman)', 'The standard method of the FAO to compute the reference evapotranspiration from temperature, radiation, wind and humidity.'],
    ['Hargreaves', '^Hargreaves', 'A simple equation for the reference evapotranspiration from the temperature only. SWAFL uses it when the weather service gives no wind or humidity.'],
    ['Application efficiency (Ea)', '^(application efficiency|Ea\\b|efficiency)', 'The share of the water applied that is stored in the root zone and useful to the crop.'],
    ['Distribution uniformity (DU, CU)', '^(uniformity|DU\\b|CU\\b|distribution uniformity|Christiansen)', 'How evenly the water is spread over the field. 100 % is perfectly even; below about 75 % some of the field gets too little.'],
    ['Advance and opportunity time', '^(advance|opportunity time)', 'In surface irrigation: the time the water takes to run along the field (advance) and the time it stays on the soil at each point to infiltrate (opportunity time).'],
    ['Hydrograph', '^hydrograph', 'The flow of water in time: how the inflow, the flow along the field or the outflow changes during an irrigation.'],
    ['Emitter, lateral', '^(emitter|lateral)', 'In drip irrigation the emitter is the dripper that releases the water and the lateral is the pipe that carries it along the row.'],
    ['Hydraulic grade line (HGL)', '^(hydraulic grade|HGL)', 'The line that shows the pressure of the water along a pipe. It falls with the friction in the pipe.'],
    ['DSS', '^(DSS|decision support)', 'Decision support system: the layers of SWAFL that turn the results of the model into advice (when to irrigate, how much, which design).'],
    ['Daisy', '^Daisy\\b', 'The soil, plant and atmosphere model of the University of Copenhagen that SWAFL runs: water, heat, nitrogen, carbon and crop growth in the soil column.'],
    ['Factor and level', '^(factor|level)s?\\b', 'In an experiment a factor is one thing you change (for example the trigger) and its levels are the values you try (for example 100, 200 and 300 cm).'],
    ['Factorial design', '^(factorial|full factorial)', 'Every level of every factor is combined with every level of the others. Three factors with three levels each give 27 runs.'],
    ['Paired design', '^paired', 'The first levels of all factors are used together, then the second levels and so on, so the factors move in step.'],
    ['One at a time (OAT)', '^(OAT|one at a time|one.at.a.time)', 'Each factor is changed alone while the others stay at their usual value. It shows what each factor does with few runs.'],
    ['Run', '^runs?\\b', 'One simulation of the model with one set of values of the factors.'],
    ['Log', '^logs?\\b', 'The file in which Daisy writes the results of a run, one line for each day or each month.'],
    ['Spin-up (warm-up years)', '^(spin|warm.up)', 'The first years of a run that are not counted, so that the soil water and nitrogen settle before the results are read.'],
    ['RMSE', '^RMSE', 'Root mean square error: the typical size of the difference between the model and the measurement, in the unit of the measurement. Smaller is better.'],
    ['NSE (Nash and Sutcliffe)', '^(NSE|Nash)', 'A score of how well the model follows the measurement: 1 is perfect, 0 is no better than the average of the measurements.'],
    ['Bioclimate', '^bioclimate', 'The part of Daisy that handles the weather above the soil: radiation, evaporation from the canopy and transpiration.'],
    ['Reference manual (Daisy)', '^(Daisy reference|reference manual)', 'The manual of the Daisy program that describes every model and parameter. The Experiments tab takes its combinations from it.']
  ];
  const RX = T.map(t => { try { return new RegExp(t[1], 'i'); } catch (e) { return null; } });
  function tipFor(txt) { txt = String(txt || '').replace(/\s+/g, ' ').trim(); if (!txt || txt.length > 70) return ''; for (let i = 0; i < T.length; i++) if (RX[i] && RX[i].test(txt)) return T[i][0] + ': ' + T[i][2]; return ''; }
  const done = new WeakSet(); let timer = null;
  function scan(root) {
    const els = (root || document.body).querySelectorAll('td,th,label,b,strong,summary,h4,h5,.lbl,.pnote,.dzchip,button,span'); let n = 0;
    for (const el of els) {
      if (n > 1200) break; if (done.has(el)) continue; done.add(el); n++;
      if (el.title || el.children.length || el.closest('#engineHost,canvas,script,style')) continue;
      const t = tipFor(el.textContent); if (t) el.title = t;
    }
  }
  function later() { if (timer) return; timer = setTimeout(() => { timer = null; try { scan(); } catch (e) { } }, 700); }
  function start() { try { new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); later(); } catch (e) { } }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function open() {
    const U = (typeof UI !== 'undefined') ? UI : window.UI; if (!U || !U.modal) return;
    U.modal({ title: 'Glossary of terms', icon: 'book', width: 'min(760px,94vw)', html: '<p class="pnote" style="margin:0 0 6px">' + T.length + ' terms of SWAFL and of the Daisy workbench in a few easy words. Rest the pointer on any of these terms in the program and the same words appear as a hint.</p><input id="glQ" type="search" placeholder="Search a term, for example field capacity or Mg/ha" style="width:100%;box-sizing:border-box;padding:6px 8px;margin-bottom:8px"><div id="glL" style="max-height:60vh;overflow:auto"></div>' });
    const L = document.getElementById('glL'), Q = document.getElementById('glQ');
    const draw = () => { const q = Q.value.trim().toLowerCase(); L.innerHTML = T.filter(t => !q || (t[0] + ' ' + t[2]).toLowerCase().indexOf(q) >= 0).map(t => '<div style="padding:5px 2px;border-bottom:1px solid #D8D2BE"><b>' + esc(t[0]) + '</b><div>' + esc(t[2]) + '</div></div>').join('') || '<p class="pnote">No term matches. Try a shorter word.</p>'; };
    Q.oninput = draw; draw(); Q.focus();
  }
  window.Glossary = { terms: T, tipFor, open, scan };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
