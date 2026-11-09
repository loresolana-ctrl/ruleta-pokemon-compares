import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'out');
const outputFile = path.join('/Users/lorenzosolana/Desktop/Ruleta-ComparesTCG', 'index.html');

function toB64(filepath, mime) {
  const data = fs.readFileSync(filepath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

const MIME = {
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/truetype',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function mimeFor(fp) {
  return MIME[path.extname(fp).toLowerCase()] ?? 'application/octet-stream';
}

function resolve(href) {
  return path.join(outDir, href.replace(/^\.\//, ''));
}

let html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');

// 1. Remove preload/prefetch link hints (resources will be inlined)
html = html.replace(/<link[^>]+rel=["'](preload|prefetch|modulepreload)["'][^>]*\/?>/g, '');

// 2. Inline stylesheet + base64-encode fonts inside CSS
html = html.replace(
  /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*\/?>/g,
  (_, href) => {
    const fp = resolve(href);
    if (!fs.existsSync(fp)) return '';
    let css = fs.readFileSync(fp, 'utf8');
    css = css.replace(/url\(["']?([^"')]+)["']?\)/g, (m, url) => {
      if (url.startsWith('data:')) return m;
      const fp2 = resolve(url);
      if (fs.existsSync(fp2)) return `url(${toB64(fp2, mimeFor(fp2))})`;
      return m;
    });
    return `<style>${css}</style>`;
  }
);

// 3. Inline all <script src="...">
html = html.replace(
  /<script([^>]*?)\ssrc=["']([^"']+)["']([^>]*)><\/script>/g,
  (_, before, src, after) => {
    const fp = resolve(src);
    if (!fs.existsSync(fp)) return '';
    const content = fs.readFileSync(fp, 'utf8');
    const attrs = (before + after).replace(/\s+/g, ' ').trim();
    return `<script ${attrs}>${content}</script>`;
  }
);

// 4. Base64-encode images in <img src="...">
html = html.replace(
  /<img([^>]*?)\ssrc=["']([^"'#][^"']*)["']([^>]*?)>/g,
  (match, before, src, after) => {
    if (src.startsWith('data:') || src.startsWith('http')) return match;
    const fp = resolve(src);
    if (!fs.existsSync(fp)) return match;
    return `<img${before} src="${toB64(fp, mimeFor(fp))}"${after}>`;
  }
);

// 5. Remove favicon link (not critical, avoids broken request)
html = html.replace(/<link[^>]+rel=["']icon["'][^>]*\/?>/g, '');

fs.writeFileSync(outputFile, html, 'utf8');
const size = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
console.log(`✅ index.html standalone creado — ${size} MB`);
