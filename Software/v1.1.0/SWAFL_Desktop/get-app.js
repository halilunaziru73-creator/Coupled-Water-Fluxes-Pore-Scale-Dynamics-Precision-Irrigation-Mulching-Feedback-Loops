// One command: build SWAFL.exe, put a copy on your Desktop and start it.   Usage:  npm run get-app
const { execSync, spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

function run(cmd) { console.log('\n> ' + cmd + '\n'); execSync(cmd, { stdio: 'inherit', cwd: __dirname }); }

try {
  if (process.platform !== 'win32') console.log('Note: this builds for Windows; on other systems use "npm start".');
  const ver = require('./package.json').version;
  console.log('Building SWAFL ' + ver);
  // remove the previous build so an old SWAFL.exe can never be copied by mistake
  try { fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true }); } catch (e) {}
  if (!fs.existsSync(path.join(__dirname, 'daisy', 'bin', 'daisy-bin.exe'))) console.log('\nNote: the folder daisy (the Daisy program that comes with SWAFL) is missing, so the built SWAFL will not run Daisy by itself. Unzip the whole SWAFL zip again.\n');
  // the manual PDF is too large for the small download: fetch it once so that it is packed into SWAFL.exe (Windows 10 and later have curl)
  try {
    const mp = path.join(__dirname, 'docs', 'manual_v1.1.0', 'SWAFL_Manual_v1.1.0.pdf');
    if (!fs.existsSync(mp)) {
      console.log('Fetching the manual (53 MB, once) ...'); fs.mkdirSync(path.dirname(mp), { recursive: true });
      execSync('curl -L -f -s -o "' + mp + '.part" "https://raw.githubusercontent.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/main/Software/v1.1.0/SWAFL_Desktop/docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf"', { stdio: 'inherit' });
      if (fs.statSync(mp + '.part').size > 1e6) fs.renameSync(mp + '.part', mp); else fs.rmSync(mp + '.part', { force: true });
    }
  } catch (e) { console.log('The manual could not be fetched now (offline?). SWAFL will fetch it the first time you press F1.'); try { fs.rmSync(path.join(__dirname, 'docs', 'manual_v1.1.0', 'SWAFL_Manual_v1.1.0.pdf.part'), { force: true }); } catch (e2) {} }
  if (!fs.existsSync(path.join(__dirname, 'node_modules', 'electron-builder'))) run('npm install');
  try { run('npm run dist'); }
  catch (e1) {
    // on Windows without administrator rights or Developer Mode the signing tools cannot be unpacked ("Cannot create symbolic link ... A required privilege is not held by the client"); the program does not need them
    console.log('\nThe build stopped (often "Cannot create symbolic link", a Windows privilege). Trying again without the code-signing tools, which SWAFL does not need ...');
    try { fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true }); } catch (e) {}
    run('npx electron-builder --win portable nsis dir -c.win.signAndEditExecutable=false');
  }
} catch (e) { console.error('\nBuild failed. Read the message above (see README: Troubleshooting). If you typed npm run get_app, the name is get-app (a hyphen).'); process.exit(1); }

const exe = path.join(__dirname, 'dist', 'SWAFL.exe'), setup = path.join(__dirname, 'dist', 'SWAFL-Setup.exe'), unp = path.join(__dirname, 'dist', 'win-unpacked');
if (!fs.existsSync(exe) && !fs.existsSync(path.join(unp, 'SWAFL.exe'))) { console.error('SWAFL.exe was not created. Check the messages above.'); process.exit(1); }

// Desktop folder (works with OneDrive-redirected desktops too)
let desktop = path.join(os.homedir(), 'Desktop');
try { desktop = execSync('powershell -NoProfile -Command "[Environment]::GetFolderPath(\'Desktop\')"').toString().trim() || desktop; } catch (e) {}

// The program is installed once as an unpacked folder and started from a shortcut: it opens at once.
// (The single-file SWAFL.exe unpacks the whole program, Daisy and the manual included, into a temporary folder at every start, which takes a long time.)
let started = false;
if (fs.existsSync(path.join(unp, 'SWAFL.exe'))) {
  try {
    const home = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'SWAFL');
    fs.rmSync(home, { recursive: true, force: true }); fs.cpSync(unp, home, { recursive: true });
    const lnk = path.join(desktop, 'SWAFL.lnk'), target = path.join(home, 'SWAFL.exe');
    execSync('powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut(\'' + lnk + '\'); $s.TargetPath=\'' + target + '\'; $s.WorkingDirectory=\'' + home + '\'; $s.IconLocation=\'' + target + ',0\'; $s.Save()"');
    try { const old = path.join(desktop, 'SWAFL.exe'); if (fs.existsSync(old)) fs.rmSync(old, { force: true }); } catch (e) {}   // the slow single-file copy of an earlier build
    console.log('\nSWAFL installed in: ' + home + '\nShortcut on your Desktop: ' + lnk); spawn(target, [], { detached: true, stdio: 'ignore' }).unref(); started = true;
  } catch (e) { console.log('\nThe quick installation did not complete (' + e.message + '). Using the single-file SWAFL.exe instead.'); }
}
if (!started) {
  const target = path.join(desktop, 'SWAFL.exe');
  try { fs.copyFileSync(exe, target); console.log('\nSWAFL.exe copied to your Desktop: ' + target); spawn(target, [], { detached: true, stdio: 'ignore' }).unref(); }
  catch (e) { console.log('\nCould not copy to the Desktop. Your app is here: ' + exe); spawn(exe, [], { detached: true, stdio: 'ignore' }).unref(); }
}
if (fs.existsSync(setup)) console.log('Installer (Start menu + shortcut): ' + setup);
console.log('\nDone: SWAFL ' + require('./package.json').version + '. From now on just double-click SWAFL on your Desktop - no code needed.');
