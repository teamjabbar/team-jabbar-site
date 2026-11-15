import { existsSync, readFileSync } from 'node:fs';

// Written by scripts/fetch-assets.mjs before each build.
const file = 'src/asset-manifest.json';
const manifest: Record<string, { src: string; w: number; h: number }> = existsSync(file)
  ? JSON.parse(readFileSync(file, 'utf8'))
  : {};

/** Our own copy of a builder image when we have one, otherwise the original address. */
export function asset(url?: string) {
  if (!url) return undefined;
  return manifest[url] ?? { src: url, w: undefined, h: undefined };
}
