// Tiny static server shared by the desktop app (main.js) and the browser fallback (npm run web).
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

function createServer(root) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p === '/') p = '/index.html';
    if (/SWAFL_Manual\.pdf$/i.test(p)) { const m11 = path.join(__dirname, 'docs', 'manual_v1.1.0', 'SWAFL_Manual_v1.1.0_Vol1_Guide.pdf'), mf = fs.existsSync(m11) ? m11 : path.join(__dirname, 'docs', 'SWAFL_Manual.pdf'); return fs.readFile(mf, (e2, b2) => { if (e2) { res.writeHead(404); return res.end('Manual not found'); } res.writeHead(200, { 'Content-Type': 'application/pdf' }); res.end(b2); }); }
    const f = path.normalize(path.join(root, p));
    if (!f.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store, max-age=0' });
      res.end(buf);
    });
  });
}
function listen(root, port = 0) {
  return new Promise(resolve => { const s = createServer(root); s.listen(port, '127.0.0.1', () => resolve({ server: s, port: s.address().port })); });
}
module.exports = { listen };

if (require.main === module) {
  const root = path.join(__dirname, 'app');
  listen(root, Number(process.env.PORT) || 5173).then(({ port }) => {
    const url = 'http://127.0.0.1:' + port + '/';
    console.log('SWAFL is running in your browser:  ' + url);
    console.log('Keep this window OPEN while you use SWAFL. Close it (or press Ctrl+C) to stop.');
    try {
      const cp = require('child_process');
      if (process.platform === 'win32') cp.exec('start "" "' + url + '"');
      else if (process.platform === 'darwin') cp.exec('open "' + url + '"');
      else cp.exec('xdg-open "' + url + '"');
    } catch (e) {}
  });
}
