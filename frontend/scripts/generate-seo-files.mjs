import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(__dirname, '..');
const publicDir = resolve(__dirname, '../public');
const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFiles() {
  const loaded = {};

  for (const fileName of envFiles) {
    const filePath = resolve(projectDir, fileName);
    if (!existsSync(filePath)) continue;

    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = parseEnvValue(trimmed.slice(separatorIndex + 1));
      loaded[key] = value;
    }
  }

  return loaded;
}

const fileEnv = loadEnvFiles();
const rawSiteUrl = process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL || 'https://your-domain.com';
const siteUrl = rawSiteUrl.replace(/\/+$/, '');
const hasConfiguredSiteUrl = Boolean(process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL);

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
];

function absoluteUrl(path) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
}

const robots = `User-agent: *
Allow: /
Disallow: /loved
Disallow: /product-loved
Disallow: /admin
Disallow: /login
Disallow: /register

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

const sitemapItems = staticPages
  .map(
    (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems}
</urlset>
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, 'robots.txt'), robots);
writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap);

if (!hasConfiguredSiteUrl) {
  console.warn('VITE_SITE_URL is not set. SEO files were generated with https://your-domain.com.');
}
