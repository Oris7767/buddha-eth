#!/usr/bin/env node

/**
 * Post-build script: Generates a complete, standard sitemap.xml for Buddha.eth Gazette.
 * Referencing VedicVN's SEO architecture:
 *  1. Define static core pages (homepage, bookmarks, etc.)
 *  2. Fetch all published posts from Supabase REST API (or local data fallback)
 *  3. Merge into XML sitemap with dynamic lastmod, changefreq, and priority
 *  4. Write to dist/sitemap.xml and public/sitemap.xml
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

const BASE_URL = process.env.URL || 'https://buddha-eth.netlify.app';

// 1. Read .env if present
if (!process.env.VITE_SUPABASE_URL && existsSync(join(rootDir, '.env'))) {
  try {
    const envContent = readFileSync(join(rootDir, '.env'), 'utf8');
    for (const line of envContent.split('\n')) {
      const match = line.trim().match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch {}
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const STATIC_ENTRIES = [
  { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
  { loc: `${BASE_URL}/bookmarks`, changefreq: 'weekly', priority: '0.6' }
];

async function fetchPostsFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('placeholder')) {
    return null;
  }

  const url = `${SUPABASE_URL}/rest/v1/posts?select=slug,created_at,updated_at,status&status=eq.published&order=created_at.desc`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function getFallbackPosts() {
  try {
    // Read samplePosts.ts
    const sampleFilePath = join(rootDir, 'src', 'data', 'samplePosts.ts');
    if (existsSync(sampleFilePath)) {
      const content = readFileSync(sampleFilePath, 'utf8');
      const slugs = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
      return slugs.map(slug => ({
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
  } catch {}
  return [];
}

const TODAY = new Date().toISOString().split('T')[0];

function buildSitemap(posts, newestPostDate) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];

  const seen = new Set();

  // Static pages
  for (const page of STATIC_ENTRIES) {
    if (seen.has(page.loc)) continue;
    seen.add(page.loc);

    const lastmod = page.loc === `${BASE_URL}/` && newestPostDate ? newestPostDate : TODAY;

    lines.push(
      '  <url>',
      `    <loc>${escapeXml(page.loc)}</loc>`,
      `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      '  </url>'
    );
  }

  // Blog posts
  for (const post of posts) {
    if (!post.slug) continue;
    const loc = `${BASE_URL}/post/${post.slug}`;
    if (seen.has(loc)) continue;
    seen.add(loc);

    const rawDate = post.updated_at || post.created_at || TODAY;
    const lastmod = String(rawDate).split('T')[0].slice(0, 10);

    lines.push(
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
      '    <changefreq>monthly</changefreq>',
      '    <priority>0.8</priority>',
      '  </url>'
    );
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

async function main() {
  console.log('\n🗺️ [generate-sitemap] Generating SEO sitemap.xml...');

  let posts = [];
  try {
    const remotePosts = await fetchPostsFromSupabase();
    if (remotePosts && remotePosts.length > 0) {
      posts = remotePosts;
      console.log(`  ✅ Fetched ${posts.length} published posts from Supabase`);
    } else {
      posts = getFallbackPosts();
      console.log(`  ℹ️  Using ${posts.length} local posts (Supabase not configured or empty)`);
    }
  } catch (err) {
    console.warn(`  ⚠️  Supabase fetch failed (${err.message}). Using local posts.`);
    posts = getFallbackPosts();
  }

  let newestDate = TODAY;
  if (posts.length > 0) {
    const dates = posts
      .map(p => (p.updated_at || p.created_at || '').split('T')[0])
      .filter(Boolean)
      .sort()
      .reverse();
    if (dates.length > 0) newestDate = dates[0];
  }

  const sitemapXml = buildSitemap(posts, newestDate);

  // Write to dist/
  if (existsSync(distDir)) {
    writeFileSync(join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
    console.log(`  ✅ Written to ${join(distDir, 'sitemap.xml')}`);
  }

  // Also write to public/ so git and dev server have it
  if (existsSync(publicDir)) {
    writeFileSync(join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
    console.log(`  ✅ Synced to ${join(publicDir, 'sitemap.xml')}`);
  }

  console.log(`  📊 Generated ${STATIC_ENTRIES.length} static routes + ${posts.length} articles = ${STATIC_ENTRIES.length + posts.length} URLs`);
  console.log('✨ [generate-sitemap] Done!\n');
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
