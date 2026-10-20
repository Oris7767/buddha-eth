import React, { useState } from 'react';
import { 
  PenLine, 
  Sun, 
  Moon, 
  BookOpen, 
  Search, 
  User as UserIcon, 
  LogOut,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { AuthUser, signOut } from '../lib/supabase';

interface HeaderProps {
  currentView: 'home' | 'post' | 'editor' | 'admin' | 'bookmarks' | 'about';
  onNavigate: (view: 'home' | 'post' | 'editor' | 'admin' | 'bookmarks' | 'about', slug?: string) => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onOpenSupabaseModal?: () => void;
  isSupabaseConnected?: boolean;
  theme: 'light' | 'sepia' | 'dark';
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bookmarksCount: number;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  theme,
  onThemeChange,
  searchQuery,
  onSearchChange,
  bookmarksCount,
  onSignOut
}) => {
  const [showSearch, setShowSearch] = useState(false);

  // Formatted current date in Vietnamese
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="site-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Top Utility Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.78rem',
        padding: '0.4rem 0',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{today}</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span>Ấn bản Số 142 • Hà Nội & Sài Gòn</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span style={{ fontStyle: 'italic' }}>"Veritas vos liberabit" — Chân lý giải phóng con người</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Social Links on Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem' }}>
              <a
                href="https://x.com/buddhaa_eth"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span>X: <strong>@buddhaa_eth</strong></span>
              </a>
              <span style={{ opacity: 0.4 }}>•</span>
              <a
                href="https://t.me/Buddha_eth"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span>Telegram: <strong>@Buddha_eth</strong></span>
              </a>
              <span style={{ opacity: 0.4 }}>•</span>
              <a
                href="https://www.threads.com/@buddhaa.eth"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span>Threads: <strong>@buddhaa.eth</strong></span>
              </a>
            </div>

            {/* Reading Mode Theme Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px', borderRadius: '4px' }}>
              <button
                onClick={() => onThemeChange('light')}
                title="Giao diện Ban ngày (Ivory)"
                style={{
                  padding: '3px 7px',
                  borderRadius: '3px',
                  background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                  color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              >
                Trắng
              </button>
              <button
                onClick={() => onThemeChange('sepia')}
                title="Giao diện Giấy cổ (Sepia)"
                style={{
                  padding: '3px 7px',
                  borderRadius: '3px',
                  background: theme === 'sepia' ? 'var(--bg-card)' : 'transparent',
                  color: theme === 'sepia' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              >
                Giấy cũ
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                title="Giao diện Mực đêm (Dark)"
                style={{
                  padding: '3px 7px',
                  borderRadius: '3px',
                  background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                  color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              >
                Mực đêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classic Newspaper Masthead */}
      <div className="container" style={{ textAlign: 'center', padding: '1.75rem 1rem 1rem 1rem' }}>
        <p style={{
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--accent-primary)',
          marginBottom: '0.35rem'
        }}>
          Tạp Chí Khảo Luận • @buddhaa_eth
        </p>

        <h1 
          onClick={() => onNavigate('home')}
          style={{
            fontFamily: 'var(--font-serif-display)',
            fontSize: 'clamp(2.5rem, 6.5vw, 4.4rem)',
            letterSpacing: '-0.025em',
            fontWeight: 900,
            cursor: 'pointer',
            margin: '0.2rem 0',
            lineHeight: 1.05
          }}
        >
          BUDDHA.ETH GAZETTE
        </h1>

        <p style={{
          fontFamily: 'var(--font-serif-heading)',
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          fontSize: '1.05rem',
          marginTop: '0.3rem'
        }}>
          Khảo luận Triết học Cổ điển, Chiêm tinh Vệ Đà & Bản đồ Tâm thức
        </p>

        {/* Double Border Masthead Rule */}
        <div className="newspaper-masthead-rule" />

        {/* Primary Navigation Menu */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.35rem 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: currentView === 'home' ? 700 : 500,
                fontSize: '0.9rem',
                color: currentView === 'home' ? 'var(--accent-primary)' : 'var(--text-primary)',
                borderBottom: currentView === 'home' ? '2px solid var(--accent-primary)' : 'none',
                paddingBottom: '3px'
              }}
            >
              Trang Chủ
            </button>

            <button
              onClick={() => onNavigate('bookmarks')}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: currentView === 'bookmarks' ? 700 : 500,
                fontSize: '0.9rem',
                color: currentView === 'bookmarks' ? 'var(--accent-primary)' : 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Bookmark size={15} />
              <span>Đã Lưu ({bookmarksCount})</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: currentView === 'about' ? 700 : 500,
                fontSize: '0.9rem',
                color: currentView === 'about' ? 'var(--accent-primary)' : 'var(--text-primary)',
                borderBottom: currentView === 'about' ? '2px solid var(--accent-primary)' : 'none',
                paddingBottom: '3px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <UserIcon size={15} />
              <span>Về Tác Giả</span>
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('admin')}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: currentView === 'admin' ? 700 : 500,
                  fontSize: '0.9rem',
                  color: currentView === 'admin' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <SlidersHorizontal size={15} />
                <span>Quản Lý Bài Viết (Admin)</span>
              </button>
            )}
          </div>

          {/* Right Action Icons: Search, Write, User Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search Input Toggle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {showSearch ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.85rem',
                      width: '180px',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    onClick={() => { setShowSearch(false); onSearchChange(''); }}
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  title="Tìm kiếm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.4rem 0.6rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Search size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Tìm kiếm</span>
                </button>
              )}
            </div>

            {/* Write / Editor Button (Admin only) */}
            {currentUser && (
              <button
                onClick={() => onNavigate('editor')}
                className="btn-classic-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
              >
                <PenLine size={15} />
                <span>Viết Bài Mới</span>
              </button>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  title={`Đã đăng nhập: ${currentUser.name}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <UserIcon size={16} />
                  <span>{currentUser.name}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    onSignOut();
                  }}
                  title="Đăng xuất"
                  style={{ color: 'var(--text-muted)', padding: '4px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-classic-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
