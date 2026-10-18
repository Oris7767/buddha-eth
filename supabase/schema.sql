-- ==============================================================================
-- BUDDHA.ETH GAZETTE - SUPABASE DATABASE SCHEMA & STRICT RLS POLICIES
-- Chạy script này trong Supabase Dashboard > SQL Editor > New query
-- ==============================================================================

-- 1. Bật Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo Bảng Bài Viết (posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT DEFAULT 'Triết Học & Tỉnh Thức',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_name TEXT NOT NULL DEFAULT 'Buddha.eth',
    author_avatar TEXT,
    author_role TEXT,
    read_time INT DEFAULT 5,
    views_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chỉ mục tối ưu tốc độ truy vấn & SEO
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- 3. Tạo Bảng Bình Luận (comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- 4. Bật Row Level Security (RLS) bảo vệ dữ liệu
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Dọn dẹp các policies cũ nếu chạy lại script
DROP POLICY IF EXISTS "Public read published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admin insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admin update posts" ON public.posts;
DROP POLICY IF EXISTS "Admin delete posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated manage posts" ON public.posts;

DROP POLICY IF EXISTS "Public read comments" ON public.comments;
DROP POLICY IF EXISTS "Public insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admin delete comments" ON public.comments;

-- ==============================================================================
-- 5. CHÍNH SÁCH BẢO MẬT PHÂN QUYỀN (RLS POLICIES)
-- ==============================================================================

-- A. DÀNH CHO BÀI VIẾT (POSTS)
-- ------------------------------------------------------------------------------
-- 1. Độc giả vãng lai (Public/Anon): CHỈ ĐƯỢC ĐỌC các bài đã xuất bản (status = 'published')
CREATE POLICY "Public read published posts"
    ON public.posts
    FOR SELECT
    TO public
    USING (status = 'published');

-- 2. Quản trị viên (Đã đăng nhập Supabase Auth): ĐƯỢC ĐỌC TẤT CẢ (gồm cả bản nháp draft)
CREATE POLICY "Admin view all posts"
    ON public.posts
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Quản trị viên: CHỈ USER ĐÃ ĐĂNG NHẬP MỚI ĐƯỢC TẠO BÀI MỚI (INSERT)
CREATE POLICY "Admin insert posts"
    ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- 4. Quản trị viên: CHỈ USER ĐÃ ĐĂNG NHẬP MỚI ĐƯỢC SỬA BÀI VIẾT (UPDATE)
CREATE POLICY "Admin update posts"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. Quản trị viên: CHỈ USER ĐÃ ĐĂNG NHẬP MỚI ĐƯỢC XÓA BÀI VIẾT (DELETE)
CREATE POLICY "Admin delete posts"
    ON public.posts
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');


-- B. DÀNH CHO BÌNH LUẬN (COMMENTS)
-- ------------------------------------------------------------------------------
-- 1. Ai cũng có thể xem bình luận bài viết
CREATE POLICY "Public read comments"
    ON public.comments
    FOR SELECT
    TO public
    USING (true);

-- 2. Ai cũng có thể gửi bình luận (Tên và nội dung không được rỗng)
CREATE POLICY "Public insert comments"
    ON public.comments
    FOR INSERT
    TO public
    WITH CHECK (length(trim(author_name)) > 0 AND length(trim(content)) > 0);

-- 3. Chỉ Quản trị viên (authenticated) mới có quyền xóa/kiểm duyệt bình luận
CREATE POLICY "Admin delete comments"
    ON public.comments
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');


-- ==============================================================================
-- 6. HÀM TĂNG LƯỢT XEM TỰ ĐỘNG (RPC INCREMENT VIEWS)
-- Cho phép độc giả tăng view_count mà không cần cấp quyền UPDATE cả bài viết
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.increment_post_views(target_post_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = target_post_id;
END;
$$;
