import React from 'react';
import { Post } from '../types/blog';
import { Clock, Eye, Bookmark, Share2 } from 'lucide-react';

interface FeaturedHeroProps {
  post: Post;
  onReadPost: (slug: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  post,
  onReadPost,
  isBookmarked,
  onToggleBookmark
}) => {
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(post.created_at));

  return (
    <article 
      style={{
        padding: '1.5rem 0 2.5rem 0',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '2.5rem'
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'center'
      }}>
        {/* Left Column: Lead Story Copy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <span className="badge-category">{post.category}</span>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Tiêu Điểm Kỳ Này
            </span>
          </div>

          <h2
            onClick={() => onReadPost(post.slug)}
            style={{
              fontFamily: 'var(--font-serif-display)',
              fontSize: 'clamp(2rem, 3.2vw, 2.85rem)',
              lineHeight: 1.18,
              cursor: 'pointer',
              marginBottom: '1.25rem',
              color: 'var(--text-primary)'
            }}
          >
            {post.title}
          </h2>

          <p style={{
            fontFamily: 'var(--font-serif-body)',
            fontSize: '1.2rem',
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem'
          }}>
            {post.excerpt}
          </p>

          {/* Author Byline & Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {post.author_avatar && (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {post.author_name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formattedDate} • {post.read_time} phút đọc
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(post.id);
                }}
                title={isBookmarked ? 'Bỏ lưu' : 'Lưu vào danh sách đọc'}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => onReadPost(post.slug)}
                className="btn-classic-primary"
                style={{ padding: '0.55rem 1.15rem' }}
              >
                Đọc Toàn Văn
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: High Quality Framed Image with Caption */}
        <div>
          <div 
            onClick={() => onReadPost(post.slug)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px'
            }}
          >
            <img
              src={post.cover_image}
              alt={post.title}
              style={{
                width: '100%',
                height: '380px',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
          <p style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            marginTop: '0.5rem',
            textAlign: 'right'
          }}>
            Hình minh họa chuyên đề • BUDDHA.ETH GAZETTE Archive
          </p>
        </div>
      </div>
    </article>
  );
};
