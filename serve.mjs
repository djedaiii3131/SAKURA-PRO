// Aperçu local sans dépendance : node serve.mjs  →  http://localhost:5173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain'};

http
	.createServer((req, res) => {
		let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
		let file = path.join(root, p);
		if (!file.startsWith(root)) return res.writeHead(403).end();
		if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
			if (!p.endsWith('/')) return res.writeHead(301, {Location: p + '/'}).end();
			file = path.join(file, 'index.html');
		}
		// Comme Cloudflare : /badschool -> badschool.html
		if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
		if (!fs.existsSync(file)) return res.writeHead(404, {'Content-Type': 'text/plain'}).end('404');
		const stat = fs.statSync(file);
		const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
		const range = req.headers.range;
		if (range && type === 'video/mp4') {
			const [s, e] = range.replace('bytes=', '').split('-');
			const start = Number(s);
			const end = e ? Number(e) : stat.size - 1;
			res.writeHead(206, {'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': type});
			return fs.createReadStream(file, {start, end}).pipe(res);
		}
		res.writeHead(200, {'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes'});
		fs.createReadStream(file).pipe(res);
	})
	.listen(port, () => console.log(`BadSociety refonte → http://localhost:${port}`));
