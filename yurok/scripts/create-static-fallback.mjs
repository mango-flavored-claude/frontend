import { copyFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const rawBasePath = process.env.VITE_BASE_PATH?.trim() ?? '';
const basePath = rawBasePath && rawBasePath !== '/'
  ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}/`
  : '/';

// GitHub Pages uses 404.html as the SPA entry for direct visits to nested routes.
await copyFile(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));

// Netlify and Cloudflare Pages understand this SPA fallback file.
await writeFile(
  resolve(distDir, '_redirects'),
  `/* ${basePath}index.html 200\n`,
  'utf8',
);
