// Inlines the model, the teardown renderer, the logos and the app into one HTML page.
//   dist/index.html       standalone page (GitHub Pages, and iconic-fab.com/voron/trident/r2/), which
//                         loads the model from dist/model-<hash>.bin (gzip) next to it
//   build/artifact.html   same page without the document skeleton and with the model inlined,
//                         for a claude.ai preview
// Usage: npm run build:page
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const safeJson = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16));
const dataUri = (file, type) => `data:${type};base64,` + fs.readFileSync(path.join(root, file)).toString('base64');

const REPO_URL = 'https://github.com/mairisskuja/voron-trident-r2-interactive-manual';
const CANONICAL = 'https://iconic-fab.com/voron/trident/r2/';

const model = JSON.parse(read('build/model.json'));
const bin = read('build/model.bin.gz.b64');
const worker = [
  read('tools/teardown/assets/geometry.js'),
  read('tools/teardown/assets/sheet.js'),
  read('tools/teardown/assets/projection.js'),
  read('src/export-worker.js')
].join('\n;\n');
const app = read('src/app.js');
if (app.includes('</script')) throw Error('app.js must not contain a closing script tag');

const template = read('src/page.html')
  .replace('<!--MODEL_META-->', () => safeJson(model))
  // The teardown renderer is MIT: its notice travels with the inlined copy.
  .replace('<!--WORKER_SRC-->', () => safeJson('/* teardown renderer, Copyright (c) 2026 Jakub Krehel, MIT License */\n' + worker))
  .replace('<!--APP-->', () => app)
  .replaceAll('<!--VORON_STRIPES_SRC-->', () => dataUri('src/assets/Stripes_Logo.svg', 'image/svg+xml'))
  .replaceAll('<!--LOGO_SRC-->', () => dataUri('src/assets/iconic_fab_logo.svg', 'image/svg+xml'))
  .replaceAll('<!--REPO_URL-->', REPO_URL);
const page = template.replace('<!--MODEL_BIN-->', () => bin);
fs.mkdirSync(path.join(root, 'build'), {recursive: true});
fs.writeFileSync(path.join(root, 'build/artifact.html'), page);

// The website copy fetches the model as a binary file named by its content, so a new model
// never meets a cached old one.
const gz = Buffer.from(bin, 'base64');
const binName = `model-${crypto.createHash('sha256').update(gz).digest('hex').slice(0, 10)}.bin`;
const sitePage = template.replace('<script type="text/plain" id="model-bin"><!--MODEL_BIN--></script>', `<script type="text/plain" id="model-bin" data-src="${binName}"></script>`);
if (sitePage === template) throw Error('page.html: model-bin script not found');

// Title, meta, fonts and styles go in <head>; everything from the canvas on is the body.
const split = sitePage.indexOf('<canvas');
if (split < 0) throw Error('page.html must contain the #view canvas');
const head = sitePage.slice(0, split).trim().replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n?/, '');
const body = sitePage.slice(split);
const standalone = `<!doctype html>
<!-- VORON Trident R2 interactive manual. Independent community project by Mairis Skuja (Iconic FAB),
     not affiliated with or endorsed by VORON Design. GPL-3.0. Source and credits: ${REPO_URL} -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="canonical" href="${CANONICAL}">
<link rel="icon" href="${dataUri('src/assets/Stripes_Logo.svg', 'image/svg+xml')}" type="image/svg+xml">
${head}
<style>[hidden]{display:none!important}body{margin:0}</style>
</head>
<body>
${body}
</body>
</html>
`;
const distDir = path.join(root, 'dist');
fs.mkdirSync(distDir, {recursive: true});
for (const f of fs.readdirSync(distDir)) if (/^model-[0-9a-f]+\.bin$/.test(f) && f !== binName) fs.unlinkSync(path.join(distDir, f));
fs.writeFileSync(path.join(distDir, binName), gz);
fs.writeFileSync(path.join(distDir, 'index.html'), standalone);
console.log(`dist/index.html ${(standalone.length / 1048576).toFixed(2)} MB, dist/${binName} ${(gz.length / 1048576).toFixed(2)} MB`);
