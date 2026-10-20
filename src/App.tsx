import React, { useState, useEffect } from 'react';
import { Post } from './types/blog';
import { 
  fetchAllPosts, 
  getCurrentUser, 
  getSupabaseConfig, 
  AuthUser 
} from './lib/supabase';
import { Header } from './components/Header';
import { FeaturedHero } from './components/FeaturedHero';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { PostEditor } from './components/PostEditor';
import { AdminDashboard } from './components/AdminDashboard';
import { SupabaseModal } from './components/SupabaseModal';
import { AuthModal } from './components/AuthModal';
import { AuthorPage } from './components/AuthorPage';
import { Footer } from './components/Footer';
import { INITIAL_CATEGORIES } from './data/samplePosts';
import { Bookmark, Sparkles, Filter, PenLine, BookOpen } from 'lucide-react';
import './App.css';

const STORAGE_KEY_BOOKMARKS = 'classical_gazette_bookmarks';
const STORAGE_KEY_THEME = 'classical_gazette_theme';

export function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'post' | 'editor' | 'admin' | 'bookmarks' | 'about'>('home');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User & Modals
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Bookmarks & Themes
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  // Load initial configurations
  useEffect(() => {
    // 1. Theme
    const savedTheme = (localStorage.getItem(STORAGE_KEY_THEME) as any) || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Bookmarks
    try {
      const savedBm = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (savedBm) setBookmarks(JSON.parse(savedBm));
    } catch (err) {
      console.warn('Failed to parse bookmarks:', err);
    }

    // 3. User session
    setCurrentUser(getCurrentUser());

    // 4. Supabase connection status
    const cfg = getSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);

    // 5. Load posts
    loadPosts();

    // 6. Check URL slug on load
    const path = window.location.pathname;
    if (path.startsWith('/post/')) {
      const slug = path.replace('/post/', '');
      if (slug) {
        setSelectedSlug(slug);
        setCurrentView('post');
      }
    } else if (path === '/gioi-thieu' || path === '/gioi-thieu/') {
      setCurrentView('about');
    }
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'sepia' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
      return updated;
    });
  };

  const handleNavigate = (view: 'home' | 'post' | 'editor' | 'admin' | 'bookmarks' | 'about', slug?: string) => {
    if ((view === 'editor' || view === 'admin') && !currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setCurrentView(view);
    if (view === 'post' && slug) {
      setSelectedSlug(slug);
      window.history.pushState({}, '', `/post/${slug}`);
    } else if (view === 'about') {
      setSelectedSlug(null);
      setEditingPost(null);
      window.history.pushState({}, '', '/gioi-thieu');
    } else if (view === 'home') {
      setSelectedSlug(null);
      setEditingPost(null);
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadPost = (slug: string) => {
    handleNavigate('post', slug);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleWriteNew = () => {
    setEditingPost(null);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handlePostSaved = (savedPost: Post) => {
    loadPosts();
    handleNavigate('post', savedPost.slug);
  };

  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Find currently open post
  const currentPost = selectedSlug ? posts.find((p) => p.slug === selectedSlug) || null : null;

  // Filtered posts for home / catalog
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const featuredPost = publishedPosts.find((p) => p.featured) || publishedPosts[0];

  const activeCategoryName =
    INITIAL_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || '';
  const filteredPosts = publishedPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      post.category.toLowerCase().includes(activeCategoryName.toLowerCase());
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Bookmarked posts
  const bookmarkedPosts = posts.filter((p) => bookmarks.includes(p.id));

  return (
    <div className="app-wrapper">
      {/* Site Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        theme={theme}
        onThemeChange={handleThemeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bookmarksCount={bookmarks.length}
        onSignOut={() => {
          setCurrentUser(null);
          handleNavigate('home');
        }}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* VIEW 1: POST DETAIL READING VIEW */}
        {currentView === 'post' && currentPost && (
          <ArticleDetail
            post={currentPost}
            onBack={() => handleNavigate('home')}
            isBookmarked={bookmarks.includes(currentPost.id)}
            onToggleBookmark={handleToggleBookmark}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        )}

        {/* VIEW 2: POST EDITOR (WORDPRESS-STYLE) */}
        {currentView === 'editor' && (
          currentUser ? (
            <PostEditor
              initialPost={editingPost}
              currentUser={currentUser}
              onBack={() => handleNavigate('admin')}
              onPostSaved={handlePostSaved}
            />
          ) : (
            <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2rem', marginBottom: '1rem' }}>
                Yêu Cầu Đăng Nhập Quản Trị
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Khu vực soạn thảo bài viết chỉ dành riêng cho tác giả @buddhaa_eth.
              </p>
              <button onClick={() => setIsAuthOpen(true)} className="btn-classic-primary">
                Đăng Nhập Quản Trị Viên
              </button>
            </div>
          )
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          currentUser ? (
            <AdminDashboard
              posts={posts}
              onWriteNew={handleWriteNew}
              onEditPost={handleEditPost}
              onViewPost={handleReadPost}
              onPostDeleted={handlePostDeleted}
              onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
              isSupabaseConnected={isSupabaseConnected}
            />
          ) : (
            <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2rem', marginBottom: '1rem' }}>
                Yêu Cầu Đăng Nhập Quản Trị
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Bảng điều khiển tòa soạn chỉ dành riêng cho tác giả @buddhaa_eth.
              </p>
              <button onClick={() => setIsAuthOpen(true)} className="btn-classic-primary">
                Đăng Nhập Quản Trị Viên
              </button>
            </div>
          )
        )}

        {/* VIEW 4: BOOKMARKS VIEW */}
        {currentView === 'bookmarks' && (
          <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                Tủ Sách Cá Nhân
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.5rem', margin: '0.3rem 0' }}>
                Bài Viết Đã Lưu ({bookmarkedPosts.length})
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Các tác phẩm bạn đã đánh dấu để đọc chậm và chiêm nghiệm
              </p>
            </div>

            {bookmarkedPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <Bookmark size={40} style={{ color: 'var(--text-faint)', marginBottom: '1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-serif-heading)', fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                  Tủ sách của bạn đang trống
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Khi bắt gặp một bài viết tâm đắc trên trang chủ, hãy nhấn biểu tượng chiếc cờ (bookmark) để lưu lại vào đây.
                </p>
                <button onClick={() => handleNavigate('home')} className="btn-classic-primary">
                  Khám phá các bài viết
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2.5rem'
              }}>
                {bookmarkedPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    onReadPost={handleReadPost}
                    isBookmarked={true}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: HOME FRONT PAGE */}
        {currentView === 'about' && (
          <AuthorPage onBack={() => handleNavigate('home')} />
        )}

        {currentView === 'home' && (
          <div className="container" style={{ padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
            {/* Featured Hero Story (only if no active search) */}
            {!searchQuery && featuredPost && selectedCategory === 'all' && (
              <FeaturedHero
                post={featuredPost}
                onReadPost={handleReadPost}
                isBookmarked={bookmarks.includes(featuredPost.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {/* Category Filter Pills & Section Title */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.25rem',
              borderBottom: '2px solid var(--border-strong)',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.85rem', margin: 0 }}>
                  {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : 'Các Chuyên Mục Khảo Luận'}
                </h2>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.8rem',
                      fontWeight: selectedCategory === cat.slug ? 700 : 500,
                      padding: '0.35rem 0.85rem',
                      borderRadius: '3px',
                      backgroundColor: selectedCategory === cat.slug ? 'var(--text-primary)' : 'var(--bg-secondary)',
                      color: selectedCategory === cat.slug ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Newspaper 3-Column Grid + Sidebar Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 280px',
              gap: '3rem',
              alignItems: 'start'
            }}>
              {/* Left Column: Articles Grid */}
              <div>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Đang xếp chữ và tải bài viết từ kho lưu trữ...
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed var(--border-subtle)' }}>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Không có bài viết nào khớp với tiêu chí tìm kiếm.
                    </p>
                    <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="btn-classic-secondary">
                      Xem tất cả bài viết
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2.5rem'
                  }}>
                    {filteredPosts.map((post) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                        onReadPost={handleReadPost}
                        isBookmarked={bookmarks.includes(post.id)}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Editorial Sidebar */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Publication Manifesto Box */}
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    Tôn Chỉ Tòa Soạn
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', margin: '0.35rem 0 0.75rem 0' }}>
                    Triết Luận & Chiêm Tinh
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                    Nơi tập hợp các bài viết sâu sắc từ @buddhaa_eth. Tĩnh tâm nhìn lại vận mệnh, chu kỳ vũ trụ và sự tiến hóa của tâm thức qua lăng kính triết học cổ đại và chiêm tinh học nội môn.
                  </p>
                </div>

                {/* Author Quick Box (if logged in) OR Official Channels (if public reader) */}
                {currentUser ? (
                  <div style={{
                    border: '2px solid var(--text-primary)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                      <PenLine size={18} />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Khu Vực Quản Trị</span>
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.2rem', marginBottom: '0.35rem' }}>
                      Xin chào, {currentUser.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                      Bạn đang đăng nhập với quyền Quản trị viên.
                    </p>
                    <button
                      onClick={() => handleNavigate('editor')}
                      className="btn-classic-primary"
                      style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem' }}
                    >
                      Soạn Bài Viết Mới
                    </button>
                    <button
                      onClick={() => handleNavigate('admin')}
                      className="btn-classic-secondary"
                      style={{ width: '100%', padding: '0.5rem' }}
                    >
                      Quản Lý Bài Viết
                    </button>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      Kênh Chính Thức
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', margin: '0.35rem 0 0.75rem 0' }}>
                      Theo Dõi @buddhaa_eth
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                      Khảo luận chiêm tinh, chu kỳ vận hành và triết học cổ điển được cập nhật trực tiếp tại:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <a
                        href="https://x.com/buddhaa_eth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classic-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.55rem', fontSize: '0.85rem' }}
                      >
                        <span>𝕏: <strong>@buddhaa_eth</strong></span>
                      </a>
                      <a
                        href="https://t.me/Buddha_eth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classic-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.55rem', fontSize: '0.85rem' }}
                      >
                        <span>Telegram: <strong>@Buddha_eth</strong></span>
                      </a>
                      <a
                        href="https://www.threads.com/@buddhaa.eth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classic-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.55rem', fontSize: '0.85rem' }}
                      >
                        <span>Threads: <strong>@buddhaa.eth</strong></span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Popular Tags Cloud */}
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <h4 style={{ fontFamily: 'var(--font-serif-heading)', fontSize: '1.15rem', marginBottom: '0.85rem' }}>
                    Chủ Đề Tiêu Biểu
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['Triết Học', 'Typography', 'Đọc Sách', 'Supabase', 'Netlify', 'Jamstack', 'Mỹ Thuật', 'Tĩnh Lặng'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSearchQuery(t)}
                        className="badge-tag"
                        style={{ cursor: 'pointer' }}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Site Footer */}
      <Footer
        onSelectCategory={setSelectedCategory}
      />

      {/* Supabase Configuration Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConfigUpdated={() => {
          setIsSupabaseConnected(getSupabaseConfig().isConfigured);
          loadPosts();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          handleNavigate('editor');
        }}
      />
    </div>
  );
}

export default App;
