const DESC = {
  'Yield of each crop, season by season': 'Grain or storage organ yield of each crop of the rotation in each year for the run chosen in the list above, in Mg dry matter per hectare.',
  'Where does the nitrogen go?': 'The nitrogen balance of the run: what is applied, taken up by the crop, leached, denitrified and left in the soil.',
  'Nitrate in the soil solution': 'Nitrate concentration of the soil solution against depth and time.',
  'Annual water balance': 'Rain, irrigation, evapotranspiration, drainage below the root zone and the change in soil water, summed for each year.',
  'Yield by crop: runs compared': 'The mean yield of each crop in every ticked run, side by side.',
  'Nitrogen: runs compared': 'Nitrate leached, denitrification and nitrogen uptake of the runs side by side.',
  'Response to the nitrogen rate': 'Yield and nitrate leaching against the fertiliser rate across the runs.',
  'Yield through the years: runs compared': 'The yield of each year in every run, to show how much of a difference is steady and how much depends on the weather of the year.',
  'Water content through the soil profile': 'Soil water content against depth and time, from the daily log of Daisy.',
  'Soil water suction (pF)': 'Soil water suction on the pF scale against depth and time; irrigation triggers act on this quantity.',
  'Crop growth: leaf area and stress': 'Leaf area index with the water and nitrogen stress of the crop through the seasons.',
  'Water balance: runs compared': 'Irrigation, evapotranspiration and drainage of the runs side by side.',
  'Fate of the chemical, season by season': 'How much of the chemical is in the soil, decayed, leached or taken up in each season.',
  'Chemical concentration through the soil profile': 'The concentration of the chemical against depth and time.',
  'Chemical fate: runs compared': 'The fate of the chemical in the runs side by side: mobile tracer, sorbed and quickly decaying chemical.'
};
const SC = {
  irrigation: ['Yield of each crop, season by season', 'Annual water balance', 'Water content through the soil profile', 'Soil water suction (pF)', 'Crop growth: leaf area and stress', 'Yield by crop: runs compared', 'Water balance: runs compared', 'Yield through the years: runs compared'],
  nitrogen: ['Yield of each crop, season by season', 'Where does the nitrogen go?', 'Nitrate in the soil solution', 'Annual water balance', 'Yield by crop: runs compared', 'Nitrogen: runs compared', 'Response to the nitrogen rate', 'Yield through the years: runs compared'],
  climate: ['Yield of each crop, season by season', 'Annual water balance', 'Crop growth: leaf area and stress', 'Water content through the soil profile', 'Yield by crop: runs compared', 'Water balance: runs compared', 'Nitrogen: runs compared', 'Yield through the years: runs compared'],
  chemical: ['Fate of the chemical, season by season', 'Chemical concentration through the soil profile', 'Annual water balance', 'Chemical fate: runs compared', 'Yield through the years: runs compared'],
  soil: ['Yield of each crop, season by season', 'Annual water balance', 'Water content through the soil profile', 'Soil water suction (pF)', 'Nitrate in the soil solution', 'Yield by crop: runs compared', 'Water balance: runs compared', 'Nitrogen: runs compared', 'Yield through the years: runs compared']
};
const NAME = { irrigation: 'irrigation', nitrogen: 'nitrogen', climate: 'climate', chemical: 'chemical', soil: 'soil' };
const specs = [];
Object.keys(SC).forEach(sc => {
  specs.push({ id: 'dz_res_' + sc + '_00', ch: 'results', sec: sc, fresh: true, full: false, title: 'Results of the ' + sc + ' question: the table of means',
    intro: 'The ' + sc + ' question was run on the built-in farm for the years 1990 to 1993 with the built-in Taastrup weather. After the run the results appear under the options: a list that chooses the run to look at, three buttons, a table of the mean per season and the figures.',
    run: async (p, c) => { await c.open('scen:' + sc); await p.fill('#dzSPanel [data-o="start"]', '1990'); await p.fill('#dzSPanel [data-o="stop"]', '1993'); await p.click('#dzSRun'); await p.waitForFunction(() => /Daisy ran/i.test(document.getElementById('dzSRes').innerText), null, { timeout: 500000 }); await c.wait(2000); await p.evaluate(() => { const h = [...document.querySelectorAll('#dzSRes h3')][0]; h.scrollIntoView({ block: 'start' }); }); await c.wait(300); },
    marks: [{ s: '#dzSPick', t: 'Run to look at', d: 'Chooses the run whose single run figures are drawn.' }, { s: '#dzSRep', t: 'Save report', d: 'Saves all results and figures as one HTML report.' }, { s: '#dzSAdd', t: 'Put the logs in the Files list', d: 'Keeps the Daisy logs of the runs in the Files tab for the plot and balance tabs.' }, { s: '#dzSEd', t: 'Open the set-up in the editor', d: 'Opens the Daisy set-up of the run in the Set-up editor.' }, { s: '#dzSRes table', t: 'Mean per season', d: 'The mean of each result over the seasons, one column for each run.' }] });
  SC[sc].forEach((t, i) => specs.push({ id: 'dz_res_' + sc + '_' + String(i + 1).padStart(2, '0'), ch: 'results', sec: sc, full: false, title: t + ' (' + sc + ')', intro: DESC[t] || '',
    run: async (p, c) => { await p.evaluate(i => { const e = document.querySelector('#dzSRes [data-png="' + i + '"]'); e.scrollIntoView({ block: 'start' }); document.getElementById('dzBody').scrollTop -= 20; }, i); await c.wait(400); },
    marks: [{ s: '#dzSRes [data-png="' + i + '"]', t: 'Picture (PNG)', d: 'Saves this figure as a picture with its source line.' }, { s: '#dzSRes canvas[data-c="' + i + '_0"]', t: 'Figure', d: DESC[t] || '', at: 'center' }] }));
});
module.exports = specs;
