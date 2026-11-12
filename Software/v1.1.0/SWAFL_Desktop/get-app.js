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
    run('npx electron-builder --win nsis -c.win.signAndEditExecutable=false');
  }
} catch (e) { console.error('\nBuild failed. Read the message above (see README: Troubleshooting). If you typed npm run get_app, the name is get-app (a hyphen).'); process.exit(1); }

// One file only: dist/SWAFL.exe. Double-click it once: the setup window opens (welcome, for you only or for everyone, licence, folder, Install, Finish; no administrator rights for you only);
// it installs SWAFL, puts it on the Desktop and in the Start menu, and starts it. From then on use the SWAFL shortcut: the program opens at once.
const exe = path.join(__dirname, 'dist', 'SWAFL.exe');
if (!fs.existsSync(exe)) { console.error('SWAFL.exe was not created. Check the messages above.'); process.exit(1); }
// keep only the one file in dist, so there is nothing else to choose from
try { fs.readdirSync(path.join(__dirname, 'dist')).forEach(n => { if (n !== 'SWAFL.exe') fs.rmSync(path.join(__dirname, 'dist', n), { recursive: true, force: true }); }); } catch (e) { }
let desktop = path.join(os.homedir(), 'Desktop');
try { desktop = execSync('powershell -NoProfile -Command "[Environment]::GetFolderPath(\'Desktop\')"').toString().trim() || desktop; } catch (e) { }
try { fs.copyFileSync(exe, path.join(desktop, 'SWAFL.exe')); console.log('\nSWAFL.exe (the one file) is also on your Desktop: ' + path.join(desktop, 'SWAFL.exe')); } catch (e) { console.log('\nSWAFL.exe is here: ' + exe); }
console.log('Starting the setup of SWAFL ' + require('./package.json').version + ' ...');
spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
console.log('\nDone. Follow the setup window (Next, Install, Finish); choosing for you only needs no administrator rights. Afterwards open it from the SWAFL icon on the Desktop or in the Start menu.');
