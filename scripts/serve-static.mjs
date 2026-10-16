import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';
const root = resolve(process.argv[2]),
  port = Number(process.argv[3]);
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    let target = resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(`${root}/`)) {
      response.writeHead(403).end();
      return;
    }
    if (statSync(target).isDirectory()) target += '/index.html';
    response
      .writeHead(200, {
        'Content-Type': types[extname(target)] ?? 'application/octet-stream',
      })
      .end(readFileSync(target));
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`Serving ${root} on ${port}`));
