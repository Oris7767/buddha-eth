import React, { useState } from 'react';
import { Lock, Mail, X, Shield } from 'lucide-react';
import { signIn, AuthUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isSupabaseConnected = false,
  onOpenSupabaseModal
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await signIn(email.trim(), password.trim());
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
        padding: '2.25rem',
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
          <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: 'rgba(154, 52, 18, 0.1)', borderRadius: '50%', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
            <Shield size={24} />
          </div>
          <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            Khu Vực Quản Trị
          </span>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.75rem', margin: '0.25rem 0' }}>
            Đăng Nhập Quản Trị Viên
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Xác thực tài khoản Supabase Auth để viết và quản lý bài viết
          </p>
        </div>

        {!isSupabaseConnected && (
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid #CA8A04',
            borderRadius: '4px',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)'
          }}>
            <div style={{ fontWeight: 700, color: '#A16207', marginBottom: '0.35rem' }}>
              ⚠️ Cơ sở dữ liệu Supabase chưa được kết nối
            </div>
            <p style={{ margin: '0 0 0.65rem 0', color: 'var(--text-secondary)' }}>
              Để xác thực và lưu bài viết, bạn cần cung cấp <strong>Project URL</strong> và <strong>Anon Key</strong> từ Supabase Dashboard.
            </p>
            {onOpenSupabaseModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseModal();
                }}
                className="btn-classic-primary"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem' }}
              >
                Nhập Supabase URL & Anon Key
              </button>
            )}
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #B91C1C',
            color: '#B91C1C',
            borderRadius: '4px',
            fontSize: '0.82rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Quản Trị Viên *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="admin@buddha.eth"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Mật Khẩu *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
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
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};
