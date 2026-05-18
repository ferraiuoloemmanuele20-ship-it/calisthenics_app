#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const command = process.argv[2] || 'dev';
const root = process.cwd();
const base = '/calisthenics_app/';
const outDir = join(root, '.vite-lite-dev');

if (command === 'build') {
  compile(outDir);
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(outDir, dist, { recursive: true });
  if (existsSync(join(root, 'public'))) cpSync(join(root, 'public'), dist, { recursive: true });
  writeFileSync(join(dist, 'index.html'), html(`${base}src/main.js`));
  if (existsSync(join(root, 'src/index.css'))) copyFileSync(join(root, 'src/index.css'), join(dist, 'src/index.css'));
  console.log('vite-lite build complete: dist');
  process.exit(0);
}

compile(outDir);
const hostIndex = process.argv.includes('--host') ? process.argv[process.argv.indexOf('--host') + 1] || '0.0.0.0' : '127.0.0.1';
const port = Number(process.env.PORT || 5173);
createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === base || url.pathname === `${base}index.html`) return send(res, html(`${base}src/main.js`), 'text/html');
  if (url.pathname === '/src/index.css' || url.pathname === `${base}src/index.css`) return sendFile(res, join(root, 'src/index.css'));
  const relativePath = url.pathname.startsWith(base) ? url.pathname.slice(base.length - 1) : url.pathname;
  const file = join(outDir, decodeURIComponent(relativePath));
  if (existsSync(file)) return sendFile(res, file);
  res.writeHead(404);
  res.end('Not found');
}).listen(port, hostIndex, () => console.log(`vite-lite dev server running at http://${hostIndex}:${port}`));

function compile(target) {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const config = join(root, 'tsconfig.emit.json');
  writeFileSync(config, JSON.stringify({
    extends: './tsconfig.app.json',
    compilerOptions: { noEmit: false, outDir: './.vite-lite-dev', rootDir: './', jsx: 'react-jsx' },
    include: ['src', 'vendor-types.d.ts']
  }, null, 2));
  execFileSync('tsc', ['-p', config], { stdio: 'inherit' });
  patchJs(target);
  cpSync(join(root, 'vendor/react'), join(target, 'vendor/react'), { recursive: true });
  cpSync(join(root, 'vendor/react-dom'), join(target, 'vendor/react-dom'), { recursive: true });
  if (existsSync(join(root, 'public'))) cpSync(join(root, 'public'), target, { recursive: true });
}

function patchJs(dir) {
  for (const name of readdirDeep(dir)) {
    if (!name.endsWith('.js')) continue;
    const file = join(dir, name);
    let code = readFileSync(file, 'utf8');
    code = code.replace(/import\s+['"]\.\/index\.css['"];?\n?/g, '');
    code = code.replace(/import\.meta\.env\.BASE_URL/g, JSON.stringify(base));
    code = code.replace(/(from\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g, (_m, start, spec, end) => {
      if (/\.(js|css|json)$/.test(spec)) return `${start}${spec}${end}`;
      return `${start}${spec}.js${end}`;
    });
    writeFileSync(file, code);
  }
}

function* readdirDeep(dir, prefix = '') {
  for (const entry of readdirSync(dir)) {
    const rel = prefix ? `${prefix}/${entry}` : entry;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* readdirDeep(full, rel);
    else yield rel;
  }
}


function html(entry) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Calisthenics" />
    <meta name="application-name" content="Calisthenics Progression Trainer" />
    <meta name="description" content="Adaptive upper-body calisthenics workouts with local progression tracking." />
    <link rel="manifest" href="manifest.webmanifest" />
    <link rel="apple-touch-icon" href="icon.svg" />
    <link rel="icon" type="image/svg+xml" sizes="any" href="icon.svg" />
    <title>Calisthenics Progression Trainer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="${base}src/index.css" />
    <script type="importmap">
      {
        "imports": {
          "react": "${base}vendor/react/index.js",
          "react/jsx-runtime": "${base}vendor/react/jsx-runtime.js",
          "react-dom/client": "${base}vendor/react-dom/client.js"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entry}"></script>
  </body>
</html>`;
}

function sendFile(res, file) {
  const type = mime(file);
  send(res, readFileSync(file), type);
}

function send(res, body, type) {
  res.writeHead(200, { 'content-type': type });
  res.end(body);
}

function mime(file) {
  const extension = extname(file);
  if (extension === '.html') return 'text/html; charset=utf-8';
  if (extension === '.js') return 'text/javascript; charset=utf-8';
  if (extension === '.css') return 'text/css; charset=utf-8';
  if (extension === '.json') return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}
