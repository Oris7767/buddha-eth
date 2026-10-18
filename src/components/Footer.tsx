import React from 'react';
import { ArrowUp, Send } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/samplePosts';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '3px double var(--border-strong)',
      padding: '4rem 0 2.5rem 0',
      color: 'var(--text-secondary)',
      fontSize: '0.9rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Col 1: Colophon & About */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              BUDDHA.ETH GAZETTE
            </h3>
            <p style={{ lineHeight: 1.6, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Không gian lưu trữ và xuất bản các khảo luận về Triết học Cổ điển, Chiêm tinh học Nội môn và Bản đồ Tâm thức của @buddhaa_eth.
            </p>
            <div style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              "Như trên trời, dưới đất cũng vậy (As above, so below) — Vạn vật tương liên trong vũ trụ đồng điệu."
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif-heading)', fontSize: '1.1rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
              Các Chuyên Mục
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>› {cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Social & Communities (X, Telegram, Threads) */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif-heading)', fontSize: '1.1rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
              Kênh Kết Nối & Mạng Xã Hội
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* X (Twitter) */}
              <li>
                <a
                  href="https://x.com/buddhaa_eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter): <strong>@buddhaa_eth</strong></span>
                </a>
              </li>

              {/* Telegram */}
              <li>
                <a
                  href="https://t.me/Buddha_eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  <Send size={15} color="var(--accent-primary)" />
                  <span>Telegram: <strong>@Buddha_eth</strong></span>
                </a>
              </li>

              {/* Threads */}
              <li>
                <a
                  href="https://www.threads.com/@buddhaa.eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.001 2c-5.523 0-10 4.477-10 10 0 4.991 3.657 9.128 8.438 9.878v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.344 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" style={{ display: 'none' }} />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                    <path d="M15.5 11.5c-.2-1.8-1.5-3-3.5-3-2.3 0-4 1.8-4 4.3 0 2.3 1.7 4.2 4.1 4.2 1.5 0 2.8-.7 3.4-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  </svg>
                  <span>Threads: <strong>@buddhaa.eth</strong></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Dispatch */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif-heading)', fontSize: '1.1rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
              Thư Khảo Luận Định Kỳ
            </h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Nhận những bài tiểu luận chọn lọc trực tiếp qua hộp thư vào sáng Chủ Nhật hàng tuần.
            </p>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input
                type="email"
                placeholder="email@cuaban.com"
                style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              />
              <button
                onClick={() => alert('Cảm ơn bạn đã đăng ký nhận bản tin của Buddha.eth Gazette!')}
                className="btn-classic-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '2rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 BUDDHA.ETH GAZETTE. Mọi bài viết phản ánh góc nhìn và chiêm nghiệm độc lập.
          </div>

          <button
            onClick={scrollToTop}
            className="btn-classic-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            <ArrowUp size={14} />
            <span>Đầu Trang</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
