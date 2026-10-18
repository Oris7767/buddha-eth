#!/usr/bin/env node

/**
 * Post-build script: Generates route-specific static HTML files
 * with complete SEO meta tags, Open Graph, Twitter cards, and Schema.org JSON-LD.
 * Referencing VedicVN's crawler prerender strategy.
 *
 * Flat file strategy:
 *   /post/:slug -> dist/post-:slug.html
 *   Netlify rewrites: /post/:slug -> /post-:slug.html (HTTP 200, clean URL, no redirects)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

const BASE_URL = 'https://classical-gazette.netlify.app';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80';

// Read .env if present
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

async function fetchPosts() {
  if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('placeholder')) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/posts?select=*&status=eq.published&order=created_at.desc`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('  ⚠️  Could not fetch posts from Supabase REST API:', err.message);
    }
  }

  // Fallback to sample posts
  try {
    const sampleFilePath = join(rootDir, 'src', 'data', 'samplePosts.ts');
    if (existsSync(sampleFilePath)) {
      const tsCode = readFileSync(sampleFilePath, 'utf8');
      // Simple parse of initial posts
      const jsonStart = tsCode.indexOf('INITIAL_POSTS: Post[] = [');
      if (jsonStart !== -1) {
        // Extract array via regex
        const matches = [...tsCode.matchAll(/title:\s*['"]([^'"]+)['"][\s\S]*?slug:\s*['"]([^'"]+)['"][\s\S]*?excerpt:\s*['"]([^'"]+)['"][\s\S]*?cover_image:\s*['"]([^'"]+)['"]/g)];
        return matches.map((m, idx) => ({
          id: 'post-' + (idx + 1),
          title: m[1],
          slug: m[2],
          excerpt: m[3],
          cover_image: m[4],
          author_name: 'Buddha.eth',
          created_at: new Date().toISOString()
        }));
      }
    }
  } catch {}
  return [];
}

function injectMetaAndContent(templateHtml, post) {
  let html = templateHtml;
  const canonicalUrl = `${BASE_URL}/post/${post.slug}`;
  const pageTitle = `${post.seo_title || post.title} | BUDDHA.ETH GAZETTE`;
  const pageDescription = post.seo_description || post.excerpt || 'Khảo luận Triết học Cổ điển, Chiêm tinh Nội môn & Bản đồ Tâm thức';
  const pageImage = post.cover_image || DEFAULT_IMAGE;

  // 1. Replace <title>
  html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);

  // 2. Replace meta description
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${pageDescription}" />`);
  html = html.replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${pageTitle}" />`);

  // 3. Replace canonical
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

  // 4. Replace OG tags
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${pageTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${pageDescription}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${pageImage}" />`);

  // 5. Replace Twitter tags
  html = html.replace(/<meta property="twitter:url" content=".*?" \/>/i, `<meta property="twitter:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="twitter:title" content=".*?" \/>/i, `<meta property="twitter:title" content="${pageTitle}" />`);
  html = html.replace(/<meta property="twitter:description" content=".*?" \/>/i, `<meta property="twitter:description" content="${pageDescription}" />`);
  html = html.replace(/<meta property="twitter:image" content=".*?" \/>/i, `<meta property="twitter:image" content="${pageImage}" />`);

  // 6. Inject Schema.org Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'headline': post.title,
    'description': pageDescription,
    'image': pageImage,
    'author': {
      '@type': 'Person',
      'name': post.author_name || 'Buddha.eth',
      'url': 'https://x.com/buddhaa_eth'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'BUDDHA.ETH GAZETTE',
      'logo': {
        '@type': 'ImageObject',
        'url': DEFAULT_IMAGE
      }
    },
    'datePublished': post.created_at,
    'dateModified': post.updated_at || post.created_at
  };

  const schemaScript = `\n    <!-- Schema.org BlogPosting -->\n    <script type="application/ld+json">\n    ${JSON.stringify(articleSchema, null, 2)}\n    </script>`;
  html = html.replace('</head>', `${schemaScript}\n  </head>`);

  // 7. Inject Noscript / Fallback Content for Crawlers
  const noscriptContent = `
    <noscript>
      <article style="max-width: 740px; margin: 40px auto; padding: 20px; font-family: Georgia, serif; line-height: 1.8;">
        <h1>${post.title}</h1>
        <p><em>${post.excerpt || ''}</em></p>
        <p>Tác giả: <strong>${post.author_name || 'Buddha.eth'}</strong> • Ngày đăng: ${post.created_at ? post.created_at.split('T')[0] : ''}</p>
        <hr style="margin: 20px 0;" />
        <div>${post.content || ''}</div>
      </article>
    </noscript>
  `;
  html = html.replace('<div id="root"></div>', `<div id="root">${noscriptContent}</div>`);

  return html;
}

function generate404Html() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Không tìm thấy bài viết | BUDDHA.ETH GAZETTE</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    body {
      font-family: 'Newsreader', Georgia, serif;
      background-color: #FDFBF7;
      color: #1C1917;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E7E0D3;
      padding: 3rem 2rem;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 3.5rem; margin: 0 0 0.5rem 0; color: #9A3412; }
    h2 { font-size: 1.35rem; margin-bottom: 1rem; }
    p { color: #78716C; line-height: 1.6; margin-bottom: 2rem; font-size: 1rem; }
    a {
      display: inline-block;
      padding: 0.65rem 1.5rem;
      background: #1C1917;
      color: #FDFBF7;
      text-decoration: none;
      font-family: sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    a:hover { background: #9A3412; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404</h1>
    <h2>Không tìm thấy bản thảo</h2>
    <p>Bài viết bạn đang tìm kiếm không tồn tại, đã đổi đường dẫn hoặc đã được chuyển vào kho lưu trữ nội bộ.</p>
    <a href="/">Trở về Tòa Soạn</a>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('\n📄 [generate-static-pages] Pre-rendering static HTML for web crawlers & SEO...');

  if (!existsSync(distDir)) {
    console.error(`[ERROR] dist directory not found: ${distDir}`);
    process.exit(1);
  }

  const templatePath = join(distDir, 'index.html');
  if (!existsSync(templatePath)) {
    console.error(`[ERROR] dist/index.html not found!`);
    process.exit(1);
  }

  const template = readFileSync(templatePath, 'utf8');
  const posts = await fetchPosts();

  let generated = 0;
  for (const post of posts) {
    if (!post.slug) continue;
    const flatFileName = `post-${post.slug}.html`;
    const outputPath = join(distDir, flatFileName);

    const prerenderedHtml = injectMetaAndContent(template, post);
    writeFileSync(outputPath, prerenderedHtml, 'utf8');
    console.log(`  ✅ Generated /${flatFileName} for /post/${post.slug}`);
    generated++;
  }

  // Generate .404.html for Netlify
  const notFoundPath = join(distDir, '.404.html');
  writeFileSync(notFoundPath, generate404Html(), 'utf8');
  console.log(`  ✅ Generated /.404.html`);

  console.log(`  📊 Pre-rendered ${generated} article pages for Googlebot and social previews`);
  console.log('✨ [generate-static-pages] Done!\n');
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
