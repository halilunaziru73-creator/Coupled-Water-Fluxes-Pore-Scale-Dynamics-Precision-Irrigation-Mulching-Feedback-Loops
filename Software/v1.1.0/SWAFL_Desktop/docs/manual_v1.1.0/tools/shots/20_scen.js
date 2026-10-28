const opts = (extra) => [{ s: '[data-o="soil"]', t: 'Soil', d: 'The soil profile of the run: the built-in loam or sand, or your own soil when it is set in My data.' }].concat(extra || []);
const strip = [{ s: '#dzStripWx', t: 'Weather for all runs', d: 'The one weather choice of every Daisy simulation: the weather of the SWAFL project when one is loaded, the built-in Taastrup weather, a built-in station, online weather or a file.' }];
const runBtns = [{ s: '#dzSRun', t: 'Run Daisy', d: 'Runs every ticked simulation and draws the figures.' }, { s: '#dzSRst', t: 'Standard options', d: 'Puts every option back to its standard value.' }, { s: '#dzSSave', t: 'Save the Daisy files', d: 'Saves the set-up files of the first ticked run, to run Daisy anywhere.' }];
const runsBox = [{ s: '.dzvars', t: 'Runs compared', d: 'Each ticked run is one Daisy simulation; the figures compare them.' }, { s: '#dzSInt', t: 'What I am interested in', d: 'Tick the processes of Fig. 1 whose figures should be drawn as well, or write them in words.' }];
module.exports = [
  { id: 'dz_scen_01', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: choose the question',
    intro: 'The Scenarios tab starts with the questions that the built-in farm can answer: water, nitrogen, climate, a chemical and soil. Two more cards lead to your own set-up and to two tools that need no Daisy program.',
    run: async (p, c) => { await c.open('scen'); },
    marks: [{ s: '[data-sc="irrigation"]', t: 'Irrigation question', d: 'Does irrigation pay off, and what does it cost the soil.' }, { s: '[data-sc="nitrogen"]', t: 'Nitrogen question', d: 'How much fertiliser, how much leaching.' }, { s: '[data-sc="climate"]', t: 'Climate question', d: 'A warmer, drier or wetter climate.' }, { s: '[data-sc="chemical"]', t: 'Chemical question', d: 'Sorption and degradation of a pesticide or tracer.' }, { s: '[data-sc="soil"]', t: 'Soil question', d: 'How much does texture matter.' }, { s: '[data-sc="own"]', t: 'Your own work', d: 'Run a set-up of your own or draw the figures of logs you loaded.' }, { s: '[data-tab="richards"]', t: 'Soil column', d: 'A built-in tool that needs no Daisy program.' }, { s: '[data-tab="deni"]', t: 'Process curves', d: 'A built-in tool that draws any Daisy function.' }] },
  { id: 'dz_scen_02', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: irrigation',
    intro: 'The irrigation question compares rainfed and irrigated crops of the built-in rotation. The trigger is the potential at 20 cm below which the overhead irrigation starts; the water per irrigation is fixed.',
    run: async (p, c) => { await c.open('scen:irrigation'); },
    marks: opts([{ s: '[data-o="trig"]', t: 'Trigger', d: 'Irrigation starts when the soil water potential at 20 cm drops below this value (cm).' }, { s: '[data-o="mm"]', t: 'Water per irrigation', d: 'Depth of water applied each time (mm).' }, { s: '[data-o="precip"]', t: 'Rain factor', d: 'Multiplies the rain of the weather file (1 leaves it as recorded).' }, { s: '[data-o="temp"]', t: 'Temperature offset', d: 'Added to every daily temperature (degrees Celsius).' }, { s: '[data-o="start"]', t: 'First year', d: 'First year of the simulation; it must lie at least one year after the start of the weather.' }]).concat(strip, runsBox, runBtns) },
  { id: 'dz_scen_03', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: nitrogen',
    intro: 'The nitrogen question compares three fertiliser levels, with or without irrigation, on the built-in rotation. It reports yield, nitrate leached, denitrification and the nitrogen balance.',
    run: async (p, c) => { await c.open('scen:nitrogen'); },
    marks: opts([{ s: '[data-o="irrig"]', t: 'Irrigation', d: 'Rainfed or irrigated.' }, { s: '[data-o="precip"]', t: 'Rain factor', d: 'Multiplies the rain of the weather file.' }, { s: '[data-o="temp"]', t: 'Temperature offset', d: 'Added to the daily temperatures.' }]).concat(strip, runsBox, runBtns) },
  { id: 'dz_scen_04', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: climate',
    intro: 'The climate question runs the same farm under the weather as it is and under a warmer, a drier, a warmer and drier and a wetter weather.',
    run: async (p, c) => { await c.open('scen:climate'); },
    marks: opts([{ s: '[data-o="irrig"]', t: 'Irrigation', d: 'Rainfed or irrigated.' }, { s: '[data-o="start"]', t: 'First year', d: 'First year of the runs.' }]).concat(strip, runsBox, runBtns) },
  { id: 'dz_scen_05', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: a pesticide or tracer',
    intro: 'The chemical question follows a chemical applied to the soil: a mobile tracer, a strongly sorbed chemical and a quickly decaying one. It shows how much leaves the root zone and how much stays in the soil.',
    run: async (p, c) => { await c.open('scen:chemical'); },
    marks: opts([{ s: '[data-o="precip"]', t: 'Rain factor', d: 'Multiplies the rain of the weather file.' }]).concat(strip, runsBox, runBtns) },
  { id: 'dz_scen_06', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: soil texture',
    intro: 'The soil question runs the same crops, weather and management on the built-in sand and loam, and shows water holding, drainage, yield and nitrate.',
    run: async (p, c) => { await c.open('scen:soil'); },
    marks: [{ s: '[data-o="irrig"]', t: 'Irrigation', d: 'Rainfed or irrigated.' }, { s: '[data-o="trig"]', t: 'Trigger', d: 'Potential at 20 cm that starts irrigation.' }, { s: '[data-o="nfac"]', t: 'Fertiliser factor', d: 'Multiplies the fertiliser of the rotation.' }].concat(strip, runsBox, runBtns) },
  { id: 'dz_scen_07', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: your own work',
    intro: 'This card leads to the set-up editor, where a .dai file of your own is run, and to the figures that are drawn from logs you have loaded.',
    run: async (p, c) => { await c.open('scen'); await p.click('[data-sc="own"]'); await c.wait(900); },
    marks: [{ s: 'h3', t: 'Heading', d: 'The work you bring: a set-up of your own or logs of earlier runs.' }, { s: 'button', t: 'First action', d: 'Opens the matching tab.' }] },
  { id: 'dz_scen_08', ch: 'ask', sec: 'Scenarios', title: 'Scenarios: processes to draw as well',
    intro: 'Under the runs a list of the processes of Fig. 1 of the Daisy paper can be ticked, or described in words. Daisy then writes the logs these figures need.',
    run: async (p, c) => { await c.open('scen:irrigation'); await p.evaluate(() => { const e = document.getElementById('dzSInt'); e.scrollIntoView({ block: 'start' }); }); await c.wait(400); },
    marks: [{ s: '#dzSInt', t: 'Processes of Fig. 1', d: 'Weather, snow, canopy, soil water, biopores, drains, heat and ice, nitrate, ammonium, organic matter, carbon, denitrification, photosynthesis and crop growth.' }, { s: '#dzSIntText', t: 'In words', d: 'Write for example snow and soil temperature in winter; the matching processes are ticked.' }, { s: '#dzSRun', t: 'Run Daisy', d: 'Runs the simulations and draws the standard figures and these.' }] }
];
