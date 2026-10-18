import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post, Comment } from '../types/blog';
import { INITIAL_POSTS } from '../data/samplePosts';

const STORAGE_KEY_CONFIG = 'classical_gazette_supabase_config';
const STORAGE_KEY_POSTS = 'classical_gazette_posts';
const STORAGE_KEY_COMMENTS = 'classical_gazette_comments';
const STORAGE_KEY_USER = 'classical_gazette_user';

// Get active configuration (from env or localStorage)
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('placeholder')) {
    return { url: envUrl, anonKey: envKey, isConfigured: true };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, isConfigured: true };
      }
    }
  } catch (err) {
    console.warn('Error reading supabase config from storage:', err);
  }

  return { url: '', anonKey: '', isConfigured: false };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  supabaseInstance = null; // reset client to re-initialize
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

// ----------------- LOCAL STORAGE REPOSITORY (FALLBACK / OFFLINE) -----------------
function getLocalPosts(): Post[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_POSTS);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse local posts:', err);
  }
  // Initialize with initial posts
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
}

function saveLocalPosts(posts: Post[]): void {
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
}

// ----------------- ARCHIVE (bài cào từ X, đóng gói tĩnh) -----------------
let archiveCache: Post[] | null = null;

export async function getArchivePosts(): Promise<Post[]> {
  if (archiveCache) return archiveCache;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}archive-posts.json`);
    if (res.ok) {
      const data = (await res.json()) as Post[];
      archiveCache = data.filter((p) => p.status === 'published');
      return archiveCache;
    }
  } catch (err) {
    console.warn('No archive-posts.json found:', err);
  }
  return [];
}

function mergePosts(archive: Post[], local: Post[]): Post[] {
  const seen = new Set(local.map((p) => p.id));
  return [...local, ...archive.filter((p) => !seen.has(p.id))];
}

// ----------------- POSTS API (SUPABASE WITH FALLBACK) -----------------
export async function fetchAllPosts(): Promise<Post[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Post[];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }
  return mergePosts(await getArchivePosts(), getLocalPosts());
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        // Increment views count safely via RPC (SECURITY DEFINER)
        Promise.resolve(client.rpc('increment_post_views', { target_post_id: data.id })).catch(() => {});
        return data as Post;
      }
    } catch (err) {
      console.warn('Supabase fetch slug failed, falling back to local:', err);
    }
  }

  const posts = mergePosts(await getArchivePosts(), getLocalPosts());
  const found = posts.find((p) => p.slug === slug);
  if (found) {
    found.views_count = (found.views_count || 0) + 1;
    if (!found.id.startsWith('tw-')) saveLocalPosts(posts.filter((p) => !p.id.startsWith('tw-')));
    return found;
  }
  return null;
}

export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  const newPost: Post = {
    ...post,
    id: 'post-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views_count: 0
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('posts').insert([newPost]).select().single();
      if (!error && data) {
        return data as Post;
      }
    } catch (err) {
      console.warn('Supabase insert failed, saving to local storage:', err);
    }
  }

  const posts = getLocalPosts();
  const updated = [newPost, ...posts];
  saveLocalPosts(updated);
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as Post;
      }
    } catch (err) {
      console.warn('Supabase update failed, saving local:', err);
    }
  }

  const posts = getLocalPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates, updated_at: new Date().toISOString() };
    saveLocalPosts(posts);
    return posts[index];
  }
  return null;
}

export async function deletePost(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('posts').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete failed, removing locally:', err);
    }
  }

  const posts = getLocalPosts();
  const filtered = posts.filter((p) => p.id !== id);
  saveLocalPosts(filtered);
  return true;
}

// ----------------- COMMENTS API -----------------
export async function fetchComments(postId: string): Promise<Comment[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as Comment[];
      }
    } catch (err) {
      console.warn('Supabase comments fetch error:', err);
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMENTS);
    const allComments: Comment[] = raw ? JSON.parse(raw) : [];
    return allComments.filter((c) => c.post_id === postId);
  } catch {
    return [];
  }
}

export async function addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
  const newComment: Comment = {
    ...comment,
    id: 'comment-' + Date.now(),
    created_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('comments').insert([newComment]).select().single();
      if (!error && data) return data as Comment;
    } catch (err) {
      console.warn('Supabase comment insert failed, saving local:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY_COMMENTS);
  const allComments: Comment[] = raw ? JSON.parse(raw) : [];
  allComments.push(newComment);
  localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(allComments));
  return newComment;
}

// ----------------- AUTHENTICATION -----------------
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'editor' | 'admin';
}

export async function signIn(email: string, password?: string): Promise<{ user: AuthUser | null; error?: string }> {
  const client = getSupabaseClient();
  if (client && password) {
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const u: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'editor'
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
        return { user: u };
      }
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  }

  // Offline / Demo login mode
  const demoUser: AuthUser = {
    id: 'user-editor-1',
    email: email || 'editor@gazette.press',
    name: email ? email.split('@')[0] : 'Trần Tổng Biên Tập',
    role: 'editor'
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
  return { user: demoUser };
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    return null;
  }
  return null;
}

export function signOut(): void {
  const client = getSupabaseClient();
  if (client) {
    client.auth.signOut().catch(() => {});
  }
  localStorage.removeItem(STORAGE_KEY_USER);
}
