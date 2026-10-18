import React, { useState } from 'react';
import { User, Lock, Mail, X, Sparkles, ShieldCheck } from 'lucide-react';
import { signIn, AuthUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await signIn(email.trim(), password.trim() || undefined);
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    const res = await signIn('editor@gazette.press');
    if (res.user) {
      onLoginSuccess(res.user);
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28, 25, 23, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        boxShadow: 'var(--shadow-paper)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            Ban Quản Trị Tòa Soạn
          </span>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.75rem', margin: '0.25rem 0' }}>
            Đăng Nhập Biên Tập
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Đăng nhập để soạn thảo, biên dịch và xuất bản bài viết trực tiếp
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #B91C1C',
            color: '#B91C1C',
            borderRadius: '4px',
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Tòa Soạn
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="editor@gazette.press"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Mật khẩu Supabase Auth (Tùy chọn)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-classic-primary"
            style={{ width: '100%', padding: '0.65rem', marginBottom: '1rem' }}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <span style={{ position: 'relative', backgroundColor: 'var(--bg-card)', padding: '0 0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            HOẶC
          </span>
        </div>

        {/* 1-Click Fast Demo Login for instant testing */}
        <button
          onClick={handleDemoLogin}
          type="button"
          disabled={isLoading}
          className="btn-classic-secondary"
          style={{
            width: '100%',
            padding: '0.65rem',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={16} color="var(--accent-primary)" />
          <span>Vào Thử Ngay Với Quyền Tổng Biên Tập</span>
        </button>
      </div>
    </div>
  );
};
