import React, { useState } from 'react';
import { Database, Check, AlertCircle, ExternalLink, X, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert('Vui lòng nhập cả Supabase URL và Anon Public Key!');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      // Save config
      saveSupabaseConfig(url, anonKey);
      const client = getSupabaseClient();
      
      if (!client) {
        throw new Error('Không thể khởi tạo kết nối Supabase client!');
      }

      // Quick ping test
      const { data, error } = await client.from('posts').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // If table doesn't exist yet, it's still a valid connection to Supabase!
        if (error.message.includes('relation "public.posts" does not exist')) {
          setTestStatus('success');
          onConfigUpdated();
          return;
        }
        throw new Error(error.message);
      }

      setTestStatus('success');
      onConfigUpdated();
    } catch (err: any) {
      console.error('Supabase test failed:', err);
      setTestStatus('error');
      setErrorMessage(err.message || 'Kết nối thất bại. Vui lòng kiểm tra lại URL và Anon Key.');
    }
  };

  const handleResetToLocal = () => {
    localStorage.removeItem('classical_gazette_supabase_config');
    setUrl('');
    setAnonKey('');
    setTestStatus('idle');
    onConfigUpdated();
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
        maxWidth: '560px',
        padding: '2rem',
        boxShadow: 'var(--shadow-paper)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{
            padding: '8px',
            backgroundColor: 'rgba(154, 52, 18, 0.1)',
            borderRadius: '4px',
            color: 'var(--accent-primary)'
          }}>
            <Database size={22} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.45rem', margin: 0 }}>
              Cấu Hình Cơ Sở Dữ Liệu Supabase
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Đồng bộ bài viết và bình luận trực tiếp vào PostgreSQL Cloud
            </p>
          </div>
        </div>

        <div className="newspaper-rule-single" />

        <form onSubmit={handleTestAndSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Project URL
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Lấy trong Supabase Dashboard → Settings → API → Project URL
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Anon / Public Key
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Khóa API công khai anon key an toàn dùng cho frontend
            </span>
          </div>

          {/* Status Alert */}
          {testStatus === 'success' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #15803D',
              color: '#15803D',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <Check size={18} />
              <span>Kết nối Supabase thành công! Dữ liệu bài viết sẽ được lưu trực tiếp vào đám mây.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #B91C1C',
              color: '#B91C1C',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Lỗi kết nối:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Quick Notice about Schema */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '0.85rem',
            borderRadius: '4px',
            fontSize: '0.82rem',
            marginBottom: '1.5rem',
            lineHeight: 1.5
          }}>
            <strong>Lưu ý quan trọng:</strong> File khởi tạo bảng và bảo mật RLS đã được tạo sẵn tại{' '}
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>supabase/schema.sql</code>. Bạn chỉ cần copy nội dung file đó vào <strong>SQL Editor</strong> trên Supabase Dashboard và bấm <em>Run</em>!
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleResetToLocal}
              style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
            >
              Chuyển về Chế độ Cục bộ (Offline)
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-classic-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={testStatus === 'testing'}
                className="btn-classic-primary"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                {testStatus === 'testing' ? 'Đang kết nối...' : 'Lưu & Kết Nối'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
