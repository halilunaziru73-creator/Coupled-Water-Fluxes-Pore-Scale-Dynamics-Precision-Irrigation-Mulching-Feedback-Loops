/* Runs the Daisy program for SWAFL: finds it, writes the set-up into a work folder, runs it and returns the logs that were written.
   Used by the desktop app (main.js) and by tools/build_daisy_examples.js. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawn, spawnSync } = require('child_process');

const isWin = process.platform === 'win32';
const EXE = isWin ? 'daisy.exe' : 'daisy';

function candidates() {
  const c = [];
  if (process.env.DAISY_EXE) c.push(process.env.DAISY_EXE);
  // a Daisy program put next to the app (works with no installation and no network): daisy/bin/daisy[.exe] or daisy/daisy[.exe], beside the app or in its resources
  [__dirname, path.dirname(process.execPath), process.resourcesPath, path.join(__dirname, '..')].filter(Boolean).forEach(b => ['daisy', 'Daisy'].forEach(n => { c.push(path.join(b, n, 'bin', EXE)); c.push(path.join(b, n, EXE)); }));
  (process.env.PATH || '').split(path.delimiter).forEach(d => { if (d) c.push(path.join(d, EXE)); });
  if (isWin) {
    const pf = [process.env['ProgramFiles'], process.env['ProgramFiles(x86)'], process.env['LOCALAPPDATA'], 'C:\\'].filter(Boolean);
    pf.forEach(p => { ['Daisy', 'daisy', 'Daisy 7.1.14', 'Daisy-7.1.14', 'Daisy\\bin', 'daisy\\bin', 'Programs\\Daisy', 'Programs\\Daisy\\bin'].forEach(s => c.push(path.join(p, s, EXE))); });
    const h = os.homedir(); ['Downloads', 'Documents', 'Desktop', ''].forEach(s => ['daisy', 'Daisy'].forEach(n => { c.push(path.join(h, s, n, 'bin', EXE)); c.push(path.join(h, s, n, EXE)); }));
  } else {
    ['/usr/bin', '/usr/local/bin', '/opt/daisy/bin', '/opt/homebrew/bin', '/Applications/daisy/bin', '/Applications/Daisy.app/Contents/MacOS'].forEach(d => c.push(path.join(d, EXE)));
    c.push(path.join(os.homedir(), 'daisy', 'bin', EXE));
  }
  return c;
}
function findExe(saved) { const list = (saved ? [saved] : []).concat(candidates()); for (const f of list) { try { if (f && fs.statSync(f).isFile()) return f; } catch (e) { } } return null; }
// the folder that holds lib/ and sample/ (DAISYHOME)
function homeFor(exe) {
  const d = path.dirname(exe), c = [path.join(d, '..', 'share', 'daisy'), path.join(d, '..'), path.join(d, '..', 'lib', 'daisy'), d, '/usr/share/daisy'];
  for (const x of c) { try { if (fs.statSync(path.join(x, 'lib', 'crop.dai')).isFile()) return path.resolve(x); } catch (e) { } }
  return null;
}
function version(exe) { try { const r = spawnSync(exe, ['-v'], { env: envFor(exe), timeout: 15000, encoding: 'utf8' }); return ((r.stdout || '') + (r.stderr || '')).split('\n').find(l => /version/i.test(l)) || ''; } catch (e) { return ''; } }
function envFor(exe) { const e = Object.assign({}, process.env), h = homeFor(exe); if (h) e.DAISYHOME = h; return e; }

function walk(dir, base, out) { fs.readdirSync(dir, { withFileTypes: true }).forEach(e => { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, base + e.name + '/', out); else out.push(base + e.name); }); return out; }

/* job: { main:'Run/Runfile.dai', files:{ 'Common/x.dai': text, ... }, copyDir: path to a folder copied to workDir/Common (not overriding job.files), prefix, logPattern }
   returns { code, out, err, dir, logs:{ name: text }, seconds } */
function runJob(job, opt) {
  opt = opt || {};
  return new Promise((resolve, reject) => {
    const exe = opt.exe; if (!exe) return reject(new Error('the Daisy program was not found'));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'swafl-daisy-')); const t0 = Date.now();
    try {
      if (job.copyDir) { const cd = path.join(dir, 'Common'); fs.mkdirSync(cd, { recursive: true }); fs.readdirSync(job.copyDir).forEach(n => { const s = path.join(job.copyDir, n); if (fs.statSync(s).isFile()) fs.copyFileSync(s, path.join(cd, n)); }); }
      Object.keys(job.files).forEach(f => { const p = path.join(dir, f); if (path.resolve(p).indexOf(path.resolve(dir)) !== 0) throw new Error('bad file name ' + f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, job.files[f], 'utf8'); });
    } catch (e) { return reject(e); }
    const main = path.join(dir, job.main), wd = path.dirname(main); let out = '', err = '';
    const p = spawn(exe, [path.basename(main)], { cwd: wd, env: envFor(exe) });
    const to = setTimeout(() => { try { p.kill(); } catch (e) { } }, opt.timeoutMs || 1800000);
    p.stdout.on('data', d => { out += d; if (opt.onOut) opt.onOut(String(d)); }); p.stderr.on('data', d => { err += d; if (opt.onOut) opt.onOut(String(d)); });
    p.on('error', e => { clearTimeout(to); reject(e); });
    p.on('close', code => {
      clearTimeout(to); const logs = {};
      try { fs.readdirSync(wd).forEach(n => { if (/\.(dlf|csv)$/i.test(n) || /^daisy\.log$/.test(n)) { const s = fs.statSync(path.join(wd, n)); if (s.size < 80e6) logs[n] = fs.readFileSync(path.join(wd, n), 'utf8'); } }); } catch (e) { }
      resolve({ code, out: out.slice(-30000), err: err.slice(-30000), dir, logs, seconds: (Date.now() - t0) / 1000 });
    });
  });
}
function clean(dir) { try { if (dir && dir.indexOf('swafl-daisy-') >= 0) fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { } }
module.exports = { findExe, homeFor, version, runJob, clean, EXE, candidates };
