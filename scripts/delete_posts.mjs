#!/usr/bin/env node

/**
 * XOÁ BÀI VĨNH VIỄN (áp dụng cho MỌI người truy cập, không phải localStorage)
 *
 * Cách dùng:
 *   npm run delete-post -- --id tw-1234567890
 *   npm run delete-post -- --slug ten-bai-viet
 *   npm run delete-post -- --from-file deleted-post-ids.json
 *   npm run delete-post -- --search "từ khoá trong tiêu đề" --dry-run
 *
 * Script này:
 *   1. Xoá bài khỏi public/archive-posts.json (nguồn dữ liệu website thật sự)
 *   2. Ghi id vào public/deleted-post-ids.json (để lần import lại không kéo về)
 *   3. Xoá trang tĩnh dist/post-<slug>.html (nếu đã build)
 *   4. Nếu có Supabase: xoá luôn row tương ứng qua REST API
 *
 * Sau đó chạy: npm run build  → deploy → bài biến mất với tất cả mọi người.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const archivePath = join(rootDir, 'public', 'archive-posts.json');
const deletedPath = join(rootDir, 'public', 'deleted-post-ids.json');
const distDir = join(rootDir, 'dist');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const ids = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--id') ids.push(args[i + 1]);
}
const slug = getArg('--slug');
const search = getArg('--search');
const fromFile = getArg('--from-file');

if (fromFile) {
  const p = existsSync(fromFile) ? fromFile : join(rootDir, fromFile);
  if (!existsSync(p)) {
    console.error(`❌ Không tìm thấy file: ${p}`);
    process.exit(1);
  }
  const list = JSON.parse(readFileSync(p, 'utf8'));
  if (!Array.isArray(list)) {
    console.error('❌ File phải là mảng JSON các id bài viết');
    process.exit(1);
  }
  ids.push(...list);
}

if (!ids.length && !slug && !search) {
  console.log(`
Cách dùng:
  npm run delete-post -- --id tw-1234567890
  npm run delete-post -- --slug ten-bai-viet
  npm run delete-post -- --from-file deleted-post-ids.json
  npm run delete-post -- --search "từ khoá" [--dry-run]
`);
  process.exit(0);
}

const archive = JSON.parse(readFileSync(archivePath, 'utf8'));
const deleted = existsSync(deletedPath) ? JSON.parse(readFileSync(deletedPath, 'utf8')) : [];
const deletedSet = new Set(deleted.map(String));

const targets = archive.filter((p) => {
  if (ids.filter(Boolean).includes(p.id)) return true;
  if (slug && p.slug === slug) return true;
  if (search && (`${p.title} ${p.excerpt || ''}`).toLowerCase().includes(search.toLowerCase())) return true;
  return false;
});

if (!targets.length) {
  console.log('⚠️  Không khớp bài nào. Kiểm tra lại id/slug/từ khoá.');
  process.exit(0);
}

console.log(`\n${dryRun ? '🔍 DRY RUN — ' : ''}Sẽ xoá ${targets.length} bài:\n`);
for (const p of targets) {
  console.log(`  • [${p.status}] ${p.id} — ${p.title.slice(0, 70)}`);
  console.log(`    /post/${p.slug}`);
}

if (dryRun) {
  console.log('\nChạy lại không có --dry-run để xoá thật.');
  process.exit(0);
}

const removeSet = new Set(targets.map((p) => p.id));
const remaining = archive.filter((p) => !removeSet.has(p.id));

writeFileSync(archivePath, JSON.stringify(remaining, null, 2) + '\n');
for (const id of removeSet) deletedSet.add(id);
writeFileSync(deletedPath, JSON.stringify([...deletedSet].sort(), null, 2) + '\n');

// Xoá trang tĩnh đã build
let removedPages = 0;
if (existsSync(distDir)) {
  for (const file of readdirSync(distDir)) {
    if (!file.startsWith('post-') || !file.endsWith('.html')) continue;
    const stem = file.slice(5, -5);
    const hit = targets.some((p) => {
      const expected = p.slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      return stem === expected || stem.includes(expected.slice(0, 50));
    });
    if (hit) {
      unlinkSync(join(distDir, file));
      removedPages++;
    }
  }
}

// Xoá trên Supabase (nếu đã cấu hình) — cần SERVICE ROLE key để vượt RLS
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseNote = 'chưa cấu hình — bỏ qua';
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    const idList = [...removeSet].map((x) => `"${x}"`).join(',');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=in.(${idList})`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal'
      }
    });
    supabaseNote = res.ok ? 'đã xoá row trên Supabase' : `lỗi ${res.status}`;
  } catch (err) {
    supabaseNote = `lỗi: ${err.message}`;
  }
}

console.log(`\n✅ Đã xoá ${targets.length} bài khỏi archive-posts.json`);
console.log(`✅ Ghi ${removeSet.size} id vào deleted-post-ids.json (chống import lại)`);
console.log(`✅ Xoá ${removedPages} trang tĩnh trong dist/`);
console.log(`ℹ️  Supabase: ${supabaseNote}`);
console.log(`\n👉 Chạy \`npm run build\` rồi deploy — bài sẽ biến mất với mọi người truy cập.\n`);
