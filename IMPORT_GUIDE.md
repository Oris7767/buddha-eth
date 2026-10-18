# IMPORT GUIDE — Đưa bài từ X vào web

Nguồn: `~/Documents/x-archive-buddhaa/raw/full_buddhaa_eth_20261018.json`
(5.401 tweet cào từ @buddhaa_eth, 2023-09 → 2026-10)

## Chạy lại import

```bash
python3 scripts/import_tweets.py ~/Documents/x-archive-buddhaa/raw/full_buddhaa_eth_20261018.json
```

Sinh ra 3 file:

| File | Dùng để |
|---|---|
| `public/archive-posts.json` | Chế độ không có Supabase — web tự fetch và merge vào danh sách bài |
| `supabase/seed_posts.sql` | Import vào Supabase thật (SQL Editor → Run) |
| `IMPORT_REPORT.md` | Thống kê + top bài tương tác cao |

Cờ tuỳ chọn:
- `--include-trading` — gồm cả 1.013 bài trading thuần (mặc định bỏ)
- `--include-short-other` — gồm cả bài ngắn ngoài chủ đề (mặc định bỏ)

## Logic xử lý

1. **Gộp thread**: tweet nối tiếp của cùng tác giả (qua `in_reply_to`) → 1 bài duy nhất.
   2.222 chuỗi từ 5.401 tweet.
2. **Lọc nhiễu**: bỏ bài < 120 ký tự, bài promo/airdrop/scam, bài trading thuần.
3. **Phân loại** theo từ khoá → 3 chuyên mục có sẵn của site:
   - `Chiêm Tinh Nội Môn` — 78 bài
   - `Triết Học & Tỉnh Thức` — 184 bài (tổng 292, phần còn lại là draft)
   - `Chu Kỳ Vũ Trụ & Thời Cuộc` — 107 bài (chiêm tinh + thị trường)
4. **Duyệt tự động**: bài "đủ tầm" → `published`; còn lại → `draft` (nằm trong Admin chờ duyệt).
   Hiện: **369 published / 154 draft**.
5. **Slug** tiếng Việt không dấu, unique; **created_at** = ngày tweet gốc → web tự sắp xếp đúng lịch sử.

## Đã sửa kèm trong app

- `src/lib/supabase.ts`: khi chưa cấu hình Supabase, `fetchAllPosts()` merge thêm `archive-posts.json`
  (chỉ lấy `status = published`). `fetchPostBySlug` cũng tra trong archive.
- `src/App.tsx`: **fix bug lọc chuyên mục** — trước đây so sánh slug (`chiem-tinh-noi-mon`)
  với tên có dấu (`Chiêm Tinh Nội Môn`) nên không bao giờ khớp. Giờ map slug → name trước.

## Đưa lên Supabase

1. Supabase Dashboard → SQL Editor → New query
2. Dán `supabase/schema.sql` → Run (nếu chưa có bảng)
3. Dán `supabase/seed_posts.sql` → Run (1.5MB, ~2-3 phút)
4. `.env`: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

⚠️ Policy `Allow authenticated manage posts` đang là `USING (true)` — **ai có anon key cũng
insert/update/delete được**. Trước khi deploy thật nên siết lại về `auth.role() = 'authenticated'`.

## Chạy thử

```bash
npm run dev        # http://localhost:5173
npm run build      # kiểm tra type + bundle
npx vite preview --port 4173
```
