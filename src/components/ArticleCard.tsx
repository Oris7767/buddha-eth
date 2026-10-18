import React from 'react';
import { Post } from '../types/blog';
import { Clock, Eye, Bookmark } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
  onReadPost: (slug: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  onReadPost,
  isBookmarked,
  onToggleBookmark
}) => {
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(post.created_at));

  return (
    <article 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: '1.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative'
      }}
    >
      <div>
        {/* Thumbnail Image */}
        {post.cover_image && (
          <div 
            onClick={() => onReadPost(post.slug)}
            style={{
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              marginBottom: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '4px'
            }}
          >
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '210px',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        )}

        {/* Category & Date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="badge-category">{post.category}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onReadPost(post.slug)}
          style={{
            fontFamily: 'var(--font-serif-display)',
            fontSize: '1.45rem',
            lineHeight: 1.25,
            marginBottom: '0.65rem',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p style={{
          fontFamily: 'var(--font-serif-body)',
          fontSize: '1.02rem',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {post.excerpt}
        </p>
      </div>

      {/* Card Footer: Metadata & Bookmark */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '1px dashed var(--border-subtle)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{post.author_name}</span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={13} /> {post.read_time}m
          </span>
          {post.views_count > 0 && (
            <>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <Eye size={13} /> {post.views_count}
              </span>
            </>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(post.id);
          }}
          title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
          style={{
            padding: '4px',
            color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderRadius: '2px'
          }}
        >
          <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
};
