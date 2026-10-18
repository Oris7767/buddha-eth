export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  read_time: number; // in minutes
  views_count: number;
  
  // SEO Meta
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
