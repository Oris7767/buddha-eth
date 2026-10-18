-- ==============================================================================
-- THE CLASSICAL GAZETTE - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT DEFAULT 'Chung',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_name TEXT NOT NULL DEFAULT 'Ban Biên Tập',
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

-- Indexing for fast search and SEO retrieval
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Anyone can view published posts
CREATE POLICY "Public read published posts"
    ON public.posts FOR SELECT
    USING (status = 'published');

-- Authenticated or anonymous public can read comments
CREATE POLICY "Public read comments"
    ON public.comments FOR SELECT
    USING (true);

-- Anyone can submit comments
CREATE POLICY "Public insert comments"
    ON public.comments FOR INSERT
    WITH CHECK (true);

-- Authenticated users (or service role) can insert/update/delete posts
CREATE POLICY "Allow authenticated manage posts"
    ON public.posts FOR ALL
    USING (true)
    WITH CHECK (true);
