// Runs before every build. Copies the builder images referenced in
// src/content/projects/*.md onto our own site, resized for the web.
// If a download fails, the page falls back to loading the builder's original.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src/content/projects';
const OUT = 'public/assets/p';
const MANIFEST = 'src/asset-manifest.json';
const UA = 'Mozilla/5.0 (compatible; TeamJabbarSiteBuild/1.0; +https://teamjabbar.com)';

const exists = (p) => access(p).then(() => true, () => false);

const urls = new Set();
for (const file of await readdir(SRC)) {
  if (!file.endsWith('.md')) continue;
  const front = (await readFile(path.join(SRC, file), 'utf8')).split(/^---$/m)[1] ?? '';
  if (/^draft:\s*true/m.test(front)) continue;
  for (const m of front.matchAll(/https?:\/\/[^\s"'\],]+/g)) urls.add(m[0]);
}

// Team photos and the hero photo listed in src/site.ts
for (const m of (await readFile('src/site.ts', 'utf8')).matchAll(/https:\/\/(?:ik\.imagekit\.io)\/[^\s"'\],]+/g)) urls.add(m[0]);

await mkdir(OUT, { recursive: true });
const manifest = {};
let ok = 0, failed = 0;

async function one(url) {
  const name = createHash('sha1').update(url).digest('hex').slice(0, 14) + '.webp';
  const file = path.join(OUT, name);
  try {
    if (!(await exists(file))) {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const input = Buffer.from(await res.arrayBuffer());
      await sharp(input).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
    }
    const meta = await sharp(file).metadata();
    manifest[url] = { src: '/assets/p/' + name, w: meta.width, h: meta.height };
    ok++;
  } catch (err) {
    failed++;
    console.warn('[assets] could not copy', url, '-', err.message);
  }
}

const queue = [...urls];
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await one(queue.shift()); }));
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`[assets] ${ok} copied, ${failed} left on the builder's server, ${urls.size} total`);
