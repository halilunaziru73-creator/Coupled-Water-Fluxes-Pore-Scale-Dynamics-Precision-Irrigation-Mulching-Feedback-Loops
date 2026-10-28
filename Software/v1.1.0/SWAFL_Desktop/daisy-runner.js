/* Runs the Daisy program for SWAFL: finds it, writes the set-up into a work folder, runs it and returns the logs that were written.
   Used by the desktop app (main.js) and by tools/build_daisy_examples.js. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawn, spawnSync } = require('child_process');

const isWin = process.platform === 'win32';
const EXE = isWin ? 'daisy.exe' : 'daisy';
// the program of Daisy 7.1.x for Windows is bin\daisy-bin.exe (daisy.cmd only starts it); the one in SWAFL (folder daisy next to the app) is that file
const EXES = isWin ? ['daisy-bin.exe', 'daisy.exe'] : ['daisy'];
// the file that the Daisy site offers for download, daisy-7.1.14-Windows-python3.13.exe, is the INSTALLER: it asks for administrator rights and cannot be run as the program
const isInstaller = f => { const b = path.basename(String(f || '')).toLowerCase(); return /^daisy-[\d.]+-(windows|win)/.test(b) || /setup|install/.test(b) && /daisy/.test(b); };

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
function allCandidates() { const out = []; candidates().forEach(c => { out.push(c); if (isWin && path.basename(c).toLowerCase() === EXE) EXES.forEach(n => { if (n !== EXE) out.push(path.join(path.dirname(c), n)); }); }); return out; }
// the bundled program first, then the one saved from an earlier choice (never an installer), then the usual places
function bundled() { const out = []; [__dirname, path.dirname(process.execPath), process.resourcesPath, path.join(__dirname, '..')].filter(Boolean).forEach(b => ['daisy', 'Daisy'].forEach(n => EXES.forEach(x => { out.push(path.join(b, n, 'bin', x)); out.push(path.join(b, n, x)); }))); return out; }
function findExe(saved) { const list = bundled().concat(saved ? [saved] : []).concat(allCandidates()); for (const f of list) { try { if (f && !isInstaller(f) && fs.statSync(f).isFile()) return f; } catch (e) { } } return null; }
// the folder that holds lib/ and sample/ (DAISYHOME)
function homeFor(exe) {
  const d = path.dirname(exe), c = [path.join(d, '..', 'share', 'daisy'), path.join(d, '..'), path.join(d, '..', 'lib', 'daisy'), d, '/usr/share/daisy'];
  for (const x of c) { try { if (fs.statSync(path.join(x, 'lib', 'crop.dai')).isFile()) return path.resolve(x); } catch (e) { } }
  return null;
}
function version(exe) { try { const r = spawnSync(exe, ['-v'], { env: envFor(exe), timeout: 15000, encoding: 'utf8' }); return ((r.stdout || '') + (r.stderr || '')).split('\n').find(l => /version/i.test(l)) || ''; } catch (e) { return ''; } }
function envFor(exe) { const e = Object.assign({}, process.env), h = homeFor(exe); if (h) e.DAISYHOME = h; if (isWin && /daisy-bin\.exe$/i.test(exe)) { const d = path.dirname(exe); e.PYTHONHOME = d; e.PYTHONNOUSERSITE = '1'; delete e.PYTHONPATH; e.PATH = d + path.delimiter + (e.PATH || e.Path || ''); } return e; }

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
    p.on('error', e => { clearTimeout(to); if (e && e.code === 'EACCES') e.message = 'Windows would not run ' + exe + ' (EACCES). This is what happens when the file is the Daisy installer (daisy-7.1.x-Windows-...exe), which needs administrator rights. SWAFL has Daisy built in, so choose nothing, or choose bin\\daisy-bin.exe of an installed Daisy.'; reject(e); });
    p.on('close', code => {
      clearTimeout(to); const logs = {};
      try { fs.readdirSync(wd).forEach(n => { if (/\.(dlf|csv)$/i.test(n) || /^daisy\.log$/.test(n)) { const s = fs.statSync(path.join(wd, n)); if (s.size < 80e6) logs[n] = fs.readFileSync(path.join(wd, n), 'utf8'); } }); } catch (e) { }
      resolve({ code, out: out.slice(-30000), err: err.slice(-30000), dir, logs, seconds: (Date.now() - t0) / 1000 });
    });
  });
}
function clean(dir) { try { if (dir && dir.indexOf('swafl-daisy-') >= 0) fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { } }
module.exports = { isInstaller, findExe, homeFor, version, runJob, clean, EXE, candidates };
