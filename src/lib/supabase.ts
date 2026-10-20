import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post, Comment } from '../types/blog';
import { INITIAL_POSTS } from '../data/samplePosts';

const STORAGE_KEY_CONFIG = 'classical_gazette_supabase_config';
const STORAGE_KEY_POSTS = 'classical_gazette_posts';
const STORAGE_KEY_COMMENTS = 'classical_gazette_comments';
const STORAGE_KEY_USER = 'classical_gazette_user';
const STORAGE_KEY_HIDDEN = 'classical_gazette_hidden_posts';
const STORAGE_KEY_OVERRIDES = 'classical_gazette_archive_overrides';

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
    if (data) {
      const parsed: Post[] = JSON.parse(data);
      // Clean out any old mock posts (post-1, post-2, post-3)
      const cleaned = parsed.filter((p) => !['post-1', 'post-2', 'post-3'].includes(p.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (err) {
    console.error('Failed to parse local posts:', err);
  }
  return [];
}

function saveLocalPosts(posts: Post[]): void {
  const cleaned = posts.filter((p) => !['post-1', 'post-2', 'post-3'].includes(p.id));
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(cleaned));
}

// ----------------- XOÁ / SỬA BÀI ARCHIVE NGAY TRÊN WEB -----------------
// Bài cào từ X nằm trong archive-posts.json (file tĩnh). Muốn xoá/sửa mà không đụng
// code, ta lưu danh sách id đã xoá + các field đã sửa vào localStorage của trình duyệt.

export function getHiddenPostIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HIDDEN);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setHiddenPostIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(Array.from(new Set(ids))));
}

export function hidePost(id: string): void {
  setHiddenPostIds([...getHiddenPostIds(), id]);
}

export function unhidePost(id: string): void {
  setHiddenPostIds(getHiddenPostIds().filter((x) => x !== id));
}

export function restoreAllHiddenPosts(): void {
  setHiddenPostIds([]);
}

function getArchiveOverrides(): Record<string, Partial<Post>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveArchiveOverride(id: string, patch: Partial<Post>): void {
  const all = getArchiveOverrides();
  all[id] = { ...all[id], ...patch };
  localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(all));
}

// ----------------- ARCHIVE (bài cào từ X, đóng gói tĩnh) -----------------
let archiveCache: Post[] | null = null;

export async function getArchivePosts(includeHidden = false): Promise<Post[]> {
  if (!archiveCache) {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}archive-posts.json`);
      if (res.ok) {
        const data = (await res.json()) as Post[];
        archiveCache = data.filter((p) => p.status === 'published');
      } else {
        archiveCache = [];
      }
    } catch (err) {
      console.warn('No archive-posts.json found:', err);
      archiveCache = [];
    }
  }
  if (includeHidden) return archiveCache;
  const hidden = new Set(getHiddenPostIds());
  return archiveCache.filter((p) => !hidden.has(p.id));
}

function mergePosts(archive: Post[], local: Post[]): Post[] {
  const cleanLocal = local.filter((p) => !['post-1', 'post-2', 'post-3'].includes(p.id));
  const hidden = new Set(getHiddenPostIds());
  const overrides = getArchiveOverrides();
  const seen = new Set(cleanLocal.map((p) => p.id));
  const patchedArchive = archive
    .filter((p) => !hidden.has(p.id))
    .map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));
  return [
    ...cleanLocal.filter((p) => !hidden.has(p.id)),
    ...patchedArchive.filter((p) => !seen.has(p.id))
  ];
}

export function getArchiveOverridesSnapshot(): Record<string, Partial<Post>> {
  return getArchiveOverrides();
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

  // Bài archive (id tw-...): lưu đè vào localStorage để giữ thay đổi qua các lần tải
  if (id.startsWith('tw-')) {
    saveArchiveOverride(id, { ...updates, updated_at: new Date().toISOString() });
    return { id, ...updates } as Post;
  }
  return null;
}

export async function deletePost(id: string): Promise<boolean> {
  // Bài archive: ẩn vĩnh viễn trên trình duyệt này (không sửa file JSON)
  if (id.startsWith('tw-')) {
    hidePost(id);
  }

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
  if (!client) {
    return {
      user: null,
      error: 'Cơ sở dữ liệu Supabase chưa được kết nối! Vui lòng cấu hình URL và Anon Key.'
    };
  }

  if (!email || !password) {
    return {
      user: null,
      error: 'Vui lòng nhập đầy đủ Email và Mật khẩu của tài khoản quản trị viên.'
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (data.user) {
      const u: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
        role: 'admin'
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
      return { user: u };
    }
    return { user: null, error: 'Không tìm thấy thông tin tài khoản người dùng.' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Lỗi xác thực hệ thống.' };
  }
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

// ----------------- STORAGE API (SUPABASE STORAGE) -----------------
export interface UploadResult {
  url: string | null;
  error?: string;
}

export async function uploadImageToSupabase(
  file: File,
  folder: 'covers' | 'articles' = 'covers'
): Promise<UploadResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      url: null,
      error: 'Chưa kết nối Supabase! Vui lòng bấm vào "Cấu hình Supabase" ở góc trên để kết nối trước khi tải ảnh.'
    };
  }

  // Kiểm tra định dạng tệp
  if (!file.type.startsWith('image/')) {
    return {
      url: null,
      error: 'Tệp tải lên không hợp lệ. Vui lòng chọn tệp hình ảnh (JPEG, PNG, WEBP, GIF, SVG).'
    };
  }

  // Giới hạn dung lượng tối đa 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      url: null,
      error: 'Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhẹ hơn.'
    };
  }

  try {
    const bucketName = 'blog-images';
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = file.name
      .substring(0, file.name.lastIndexOf('.') || file.name.length)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_')
      .substring(0, 40);

    const filePath = `${folder}/${Date.now()}_${cleanName}.${ext}`;

    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      let errorMsg = error.message;
      if (errorMsg.toLowerCase().includes('bucket not found') || errorMsg.includes('The resource was not found')) {
        errorMsg = `Bucket '${bucketName}' chưa tồn tại trong Supabase Storage. Vui lòng tạo bucket '${bucketName}' (chế độ Public) trong Supabase Dashboard hoặc chạy lại schema.sql.`;
      }
      return { url: null, error: errorMsg };
    }

    const { data: publicData } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { url: null, error: err.message || 'Lỗi ngoại lệ khi tải ảnh lên Supabase' };
  }
}
