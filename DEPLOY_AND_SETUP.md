# BUDDHA.ETH GAZETTE — HƯỚNG DẪN KẾT NỐI SUPABASE & DEPLOY NETLIFY

Chào mừng bạn đến với **BUDDHA.ETH GAZETTE** — Tạp chí khảo luận triết học cổ điển và chiêm tinh học nội môn của @buddhaa_eth, được xây dựng chuẩn SEO, kết hợp cơ sở dữ liệu Supabase và hạ tầng Netlify.

---

## 1. Triết lý Thiết Kế & Hạn chế "AI Slop"
Hệ thống được xây dựng dựa trên nguyên tắc **UI/UX Pro Max** và **Editorial Typography**:
- **Không dùng các chi tiết generic của AI**: Loại bỏ gradient tím/neon rẻ tiền, không dùng icon emoji (dùng 100% SVG Lucide), không lồng thẻ chồng thẻ vô nghĩa.
- **Font chữ có chân (Serif) chuẩn mực**: 
  - Tiêu đề & Masthead: `Playfair Display` và `Cormorant Garamond` uy nghi, tao nhã.
  - Nội dung bài viết: `Newsreader` và `Lora` tối ưu hóa cho trải nghiệm đọc dài (Measure: 65-75 ký tự, Leading: 1.75).
- **Quy chuẩn trang báo in**: Đường viền đôi (`border-double`), chữ hoa đầu dòng (Drop-cap), thanh tiến độ đọc (Reading Progress), 3 chế độ màu giấy (Ban ngày Ivory, Giấy cũ Sepia, Mực đêm Midnight).

---

## 2. Kết Nối Cơ Sở Dữ Liệu Supabase

Ứng dụng hỗ trợ 2 cách kết nối linh hoạt:

### Cách 1: Cấu hình trực tiếp trên giao diện web (Khuyên dùng khi bắt đầu)
1. Bấm vào nút **"Cấu hình Supabase"** hoặc icon cơ sở dữ liệu trên thanh tiện ích trên cùng.
2. Dán **Project URL** và **Anon Public Key** từ Supabase Dashboard của bạn.
3. Bấm **"Lưu & Kết Nối"**. Hệ thống sẽ tự động kiểm tra kết nối ngay lập tức!
*(Lưu ý: Nếu chưa nhập key, ứng dụng vẫn hoạt động 100% trơn tru ở chế độ Local Storage để bạn viết và trải nghiệm bài viết).*

### Cách 2: Thiết lập qua biến môi trường `.env`
Tạo file `.env` ở thư mục gốc:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Chạy SQL Migration Khởi Tạo Bảng & Storage Bucket:
Toàn bộ mã SQL cho bài viết, bình luận và Supabase Storage (`blog-images`) đã được tạo sẵn tại file `supabase/schema.sql`. Bạn chỉ cần:
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) -> Chọn dự án của bạn.
2. Vào mục **SQL Editor** -> Bấm **New query**.
3. Dán toàn bộ nội dung trong [supabase/schema.sql](file:///Users/kimssa/Documents/I%20have%201M%20Capital/buddhas-eth/supabase/schema.sql) và bấm **Run**.

*(Lệnh SQL trên sẽ tự động tạo bảng `posts`, `comments` và Storage Bucket `blog-images` ở chế độ Public với đầy đủ chính sách phân quyền RLS).*

---

## 3. Trình Soạn Thảo WordPress-style, Tải Ảnh Lên Supabase & SEO
- **Tải ảnh lên Supabase**:
  - **Ảnh bìa bài viết**: Bấm nút **"Tải ảnh từ máy lên Supabase"** ở thanh điều khiển bên phải.
  - **Ảnh trong thân bài**: Bấm nút **"Tải & Chèn Ảnh"** trên thanh công cụ soạn thảo, hoặc trực tiếp **dán ảnh từ clipboard (Ctrl+V / Cmd+V)** ngay trong khung soạn thảo!
  - Ảnh tự động được lưu trữ tại bucket `blog-images` trên Supabase Storage và phân phát qua CDN tốc độ cao.

- **Soạn thảo trực tiếp**: Bấm nút **"Viết Bài Mới"** trên menu.
- **Chế độ xem linh hoạt**: Hỗ trợ xem Soạn thảo, Xem chia đôi (Split view), và Xem trước bản in.
- **Thước đo SEO thời gian thực (SEO Inspector)**:
  - Giả lập hiển thị kết quả tìm kiếm trên Google (Google SERP Snippet Preview).
  - Tự động đo độ dài tiêu đề (40-60 ký tự), độ dài thẻ mô tả (120-160 ký tự), đếm số từ và tính thời gian đọc.
  - Tự sinh slug tiếng Việt chuẩn SEO (loại bỏ dấu và ký tự đặc biệt).
  - Pháo giấy hoa chúc mừng (confetti) khi xuất bản bài viết thành công.

---

## 4. Hướng Dẫn Deploy Lên Netlify

Dự án đã được tạo sẵn file cấu hình [netlify.toml](file:///Users/kimssa/Documents/I%20have%201M%20Capital/buddhas-eth/netlify.toml) và file `public/_redirects`.

### Cách 1: Deploy qua GitHub (Tự động CI/CD)
1. Đẩy mã nguồn lên repository GitHub của bạn:
   ```bash
   git add .
   git commit -m "feat: initial editorial blog release"
   git push origin main
   ```
2. Đăng nhập [Netlify](https://app.netlify.com/) -> Chọn **Add new site** -> **Import an existing project** -> Chọn repo GitHub vừa tạo.
3. Cấu hình bản dựng (Netlify sẽ tự động nhận diện từ `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Vào mục **Site configuration** -> **Environment variables** -> Thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Bấm **Deploy Site**!

### Cách 2: Deploy bằng Netlify CLI (Thủ công tức thì)
```bash
npx netlify-cli deploy --prod --dir=dist
```
