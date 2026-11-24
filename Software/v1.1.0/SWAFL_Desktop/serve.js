// Tiny static server shared by the desktop app (main.js) and the browser fallback (npm run web).
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const TEXT = /^\.(html|js|css|json|svg|md|txt|csv|dai|dlf|dwf)$/i, GZ = new Map(); let GZB = 0;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

function createServer(root) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p === '/') p = '/index.html';
    if (/SWAFL_Manual(_v1\.1\.0)?\.pdf$/i.test(p)) { const m11 = path.join(__dirname, 'docs', 'manual_v1.1.0', 'SWAFL_Manual_v1.1.0.pdf'), mf = fs.existsSync(m11) ? m11 : path.join(__dirname, 'docs', 'SWAFL_Manual.pdf'); return fs.readFile(mf, (e2, b2) => { if (e2) { res.writeHead(404); return res.end('Manual not found'); } res.writeHead(200, { 'Content-Type': 'application/pdf' }); res.end(b2); }); }
    const f = path.normalize(path.join(root, p));
    if (!f.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    // files are served with a validator (ETag) so that the window asks "has it changed?" and gets a short answer, and text files are
    // sent compressed (and the compressed copy is kept): the start and every reload of the workbench move far less data
    fs.stat(f, (er, st) => {
      if (er || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
      const ext = path.extname(f).toLowerCase(), tag = '"' + st.size.toString(16) + '-' + Math.floor(st.mtimeMs).toString(16) + '"';
      const hd = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'ETag': tag, 'Last-Modified': st.mtime.toUTCString() };
      if (req.headers['if-none-match'] === tag) { res.writeHead(304, hd); return res.end(); }
      const gz = TEXT.test(ext) && st.size > 1024 && /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''));
      if (gz) { const c = GZ.get(f); if (c && c.tag === tag) { res.writeHead(200, Object.assign({}, hd, { 'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' })); return res.end(c.buf); } }
      fs.readFile(f, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('Not found'); }
        if (!gz) { res.writeHead(200, hd); return res.end(buf); }
        zlib.gzip(buf, { level: 6 }, (e2, z) => {
          if (e2) { res.writeHead(200, hd); return res.end(buf); }
          GZ.set(f, { tag, buf: z }); GZB += z.length; if (GZB > 80e6) { GZ.clear(); GZB = 0; }
          res.writeHead(200, Object.assign({}, hd, { 'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' })); res.end(z);
        });
      });
    });
  });
}
function listen(root, port = 0) {
  return new Promise((resolve, reject) => { const s = createServer(root); s.once('error', reject); s.listen(port, '127.0.0.1', () => resolve({ server: s, port: s.address().port })); });
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
