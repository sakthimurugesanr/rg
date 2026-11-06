import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('out');
const port = Number(process.env.PORT || 3100);
const host = process.env.HOST || '127.0.0.1';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.xml': 'application/xml' };

await stat(path.join(root, 'index.html')).catch(() => { console.error('Build the website first with npm run build.'); process.exit(1); });
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file).catch(() => null); }
    let status = 200;
    if (!info?.isFile()) { status = 404; file = path.join(root, '404.html'); info = await stat(file); }
    res.writeHead(status, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': status === 200 && pathname.startsWith('/_next/static/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch { if (!res.headersSent) res.writeHead(400); res.end(); }
});
server.listen(port, host, () => console.log(`R.G. Traders: http://${host}:${port}`));
server.on('error', error => { console.error(error.message); process.exit(1); });
