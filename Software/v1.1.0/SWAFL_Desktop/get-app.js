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
  if (!fs.existsSync(path.join(__dirname, 'node_modules', 'electron-builder'))) run('npm install');
  try { run('npm run dist'); }
  catch (e1) {
    // on Windows without administrator rights or Developer Mode the signing tools cannot be unpacked ("Cannot create symbolic link ... A required privilege is not held by the client"); the program does not need them
    console.log('\nThe build stopped (often "Cannot create symbolic link", a Windows privilege). Trying again without the code-signing tools, which SWAFL does not need ...');
    try { fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true }); } catch (e) {}
    run('npx electron-builder --win portable nsis -c.win.signAndEditExecutable=false');
  }
} catch (e) { console.error('\nBuild failed. Read the message above (see README: Troubleshooting). If you typed npm run get_app, the name is get-app (a hyphen).'); process.exit(1); }

const exe = path.join(__dirname, 'dist', 'SWAFL.exe'), setup = path.join(__dirname, 'dist', 'SWAFL-Setup.exe');
if (!fs.existsSync(exe)) { console.error('SWAFL.exe was not created. Check the messages above.'); process.exit(1); }

// Desktop folder (works with OneDrive-redirected desktops too)
let desktop = path.join(os.homedir(), 'Desktop');
try { desktop = execSync('powershell -NoProfile -Command "[Environment]::GetFolderPath(\'Desktop\')"').toString().trim() || desktop; } catch (e) {}
const target = path.join(desktop, 'SWAFL.exe');
try { fs.copyFileSync(exe, target); console.log('\nSWAFL.exe copied to your Desktop: ' + target); spawn(target, [], { detached: true, stdio: 'ignore' }).unref(); }
catch (e) { console.log('\nCould not copy to the Desktop. Your app is here: ' + exe); spawn(exe, [], { detached: true, stdio: 'ignore' }).unref(); }
if (fs.existsSync(setup)) console.log('Installer (Start menu + shortcut): ' + setup);
console.log('\nDone: SWAFL ' + require('./package.json').version + '. From now on just double-click SWAFL on your Desktop - no code needed.');
