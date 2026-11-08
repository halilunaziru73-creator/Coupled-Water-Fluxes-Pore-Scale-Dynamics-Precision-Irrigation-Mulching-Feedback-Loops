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
// the copy of the bundled Daisy that SWAFL keeps for itself in the folder of the user: found even when the program runs from a temporary folder
const OWN = () => path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.local', 'share'), 'SWAFL', 'Daisy-7.1.14');
const ownExe = () => path.join(OWN(), 'bin', isWin ? 'daisy-bin.exe' : 'daisy');
const isFile = f => { try { return fs.statSync(f).isFile(); } catch (e) { return false; } };
function bundledDir() { for (const f of bundled()) if (isFile(f) && !isInstaller(f)) { const d = path.basename(path.dirname(f)).toLowerCase() === 'bin' ? path.dirname(path.dirname(f)) : path.dirname(f); if (isFile(path.join(d, 'lib', 'crop.dai')) || isFile(f)) return d; } return null; }
// copies the bundled Daisy (the folder daisy next to the program) once into the folder of the user, so that Daisy is always there
function provision() { try { if (isFile(ownExe()) && isFile(path.join(OWN(), 'lib', 'crop.dai'))) return ownExe(); const src = bundledDir(); if (!src) return null; fs.mkdirSync(OWN(), { recursive: true }); fs.cpSync(src, OWN(), { recursive: true, force: true }); return isFile(ownExe()) ? ownExe() : null; } catch (e) { return null; } }
// an installed Daisy of any version: every folder of Program Files (and of the user's programs) whose name has "daisy" in it
function installed() { const out = []; if (!isWin) return out; [process.env['ProgramFiles'], process.env['ProgramFiles(x86)'], process.env['ProgramW6432'], process.env['LOCALAPPDATA'] && path.join(process.env['LOCALAPPDATA'], 'Programs'), 'C:\\'].filter(Boolean).forEach(pf => { let es = []; try { es = fs.readdirSync(pf, { withFileTypes: true }); } catch (e) { return; } es.filter(e => e.isDirectory() && /daisy/i.test(e.name)).forEach(e => EXES.forEach(x => { out.push(path.join(pf, e.name, 'bin', x)); out.push(path.join(pf, e.name, x)); })); }); return out; }
// the Daisy installer the user has downloaded (daisy-7.1.14-Windows-python3.13.exe): in Downloads, on the Desktop (OneDrive too), or next to SWAFL
function findInstaller() { if (!isWin) return null; const h = os.homedir(), dirs = [path.join(h, 'Downloads'), path.join(h, 'Desktop'), path.join(h, 'Documents'), __dirname, path.dirname(process.execPath), process.resourcesPath].filter(Boolean); try { fs.readdirSync(h).filter(n => /^OneDrive/i.test(n)).forEach(n => ['Downloads', 'Desktop', 'Documents', ''].forEach(s => dirs.push(path.join(h, n, s)))); } catch (e) { }
  const found = []; dirs.forEach(d => { try { fs.readdirSync(d).forEach(n => { if (/^daisy-[\d.]+-win(dows)?.*\.exe$/i.test(n)) { const f = path.join(d, n); try { found.push({ f, t: fs.statSync(f).mtimeMs }); } catch (e) { } } }); } catch (e) { } }); found.sort((a, b) => b.t - a.t); return found.length ? found[0].f : null; }
// runs the installer once, silently, in its usual folder (Windows asks for permission once: the installer needs it), then finds the program it installed
function runInstaller(f) { return new Promise(res => { if (!isWin || !f) return res(null); const ps = 'Start-Process -FilePath ' + JSON.stringify(f).replace(/"/g, "'") + ' -ArgumentList \'/S\' -Verb RunAs -Wait'; const p = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: true }); p.on('error', () => res(null)); p.on('close', () => { const e = installed().concat(allCandidates()).find(x => isFile(x) && !isInstaller(x)); res(e || null); }); }); }
function findExe(saved) { const list = bundled().concat([ownExe()]).concat(saved ? [saved] : []).concat(installed()).concat(allCandidates()); for (const f of list) { try { if (f && !isInstaller(f) && fs.statSync(f).isFile()) return f; } catch (e) { } } return null; }
// every place looked at, for the message when Daisy is not found
function looked() { return Array.from(new Set(bundled().concat([ownExe()]).concat(installed()))).slice(0, 14); }
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
    try { os.setPriority(p.pid, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) { }   // the runs work in the background: the window and the rest of the computer stay quick
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
module.exports = { isInstaller, findExe, homeFor, version, runJob, clean, EXE, candidates, provision, findInstaller, runInstaller, looked, ownDir: OWN };
