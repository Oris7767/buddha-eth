import React, { useState, useEffect } from 'react';
import { Post, Comment } from '../types/blog';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Clock, 
  Eye, 
  Check, 
  MessageSquare, 
  Send,
  Type,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { fetchComments, addComment } from '../lib/supabase';

interface ArticleDetailProps {
  post: Post;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  theme: 'light' | 'sepia' | 'dark';
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  post,
  onBack,
  isBookmarked,
  onToggleBookmark,
  theme,
  onThemeChange
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [copied, setCopied] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Dynamic SEO Update
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${post.seo_title || post.title} | The Classical Gazette`;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', post.seo_description || post.excerpt);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Load comments
    fetchComments(post.id).then(setComments);

    return () => {
      document.title = originalTitle;
    };
  }, [post]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await addComment({
        post_id: post.id,
        author_name: commentName.trim(),
        author_email: commentEmail.trim() || undefined,
        content: commentText.trim()
      });
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(post.created_at));

  // Render markdown with DOMPurify
  const rawHtml = marked.parse(post.content || '') as string;
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  // Font size multiplier
  const fontSizeStyle = fontSize === 'normal' ? '1.18rem' : fontSize === 'large' ? '1.32rem' : '1.45rem';

  return (
    <div style={{ position: 'relative', paddingBottom: '5rem' }}>
      {/* Fixed Reading Progress Bar */}
      <div 
        className="reading-progress-bar" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Floating / Sticky Reading Controls Bar */}
      <div style={{
        position: 'sticky',
        top: '0',
        zIndex: 50,
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.65rem 0',
        backdropFilter: 'blur(8px)',
        opacity: 0.98
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onBack}
            className="btn-classic-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={16} />
            <span>Trở về Trang Chủ</span>
          </button>

          {/* Reader Preferences (Font Size, Themes, Bookmark, Share) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Font Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: '3px' }}>
              <button
                onClick={() => setFontSize('normal')}
                title="Cỡ chữ Chuẩn"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: fontSize === 'normal' ? 700 : 400,
                  color: fontSize === 'normal' ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                title="Cỡ chữ Vừa"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.85rem',
                  fontWeight: fontSize === 'large' ? 700 : 400,
                  color: fontSize === 'large' ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                title="Cỡ chữ Lớn"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.95rem',
                  fontWeight: fontSize === 'huge' ? 700 : 400,
                  color: fontSize === 'huge' ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                A++
              </button>
            </div>

            {/* Reading Mode Theme */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', border: '1px solid var(--border-subtle)', borderRadius: '3px', padding: '2px' }}>
              <button
                onClick={() => onThemeChange('light')}
                title="Giao diện Ban ngày"
                style={{
                  padding: '3px 6px',
                  borderRadius: '2px',
                  background: theme === 'light' ? 'var(--bg-secondary)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => onThemeChange('sepia')}
                title="Giao diện Giấy cũ"
                style={{
                  padding: '3px 6px',
                  borderRadius: '2px',
                  background: theme === 'sepia' ? 'var(--bg-secondary)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                <Coffee size={14} />
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                title="Giao diện Mực đêm"
                style={{
                  padding: '3px 6px',
                  borderRadius: '2px',
                  background: theme === 'dark' ? 'var(--bg-secondary)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                <Moon size={14} />
              </button>
            </div>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(post.id)}
              title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
              style={{
                padding: '6px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              title="Sao chép liên kết chia sẻ"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '6px 10px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                fontSize: '0.8rem',
                color: copied ? 'var(--accent-primary)' : 'var(--text-primary)'
              }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reading Column */}
      <article className="container" style={{ maxWidth: 'var(--article-width)', marginTop: '2.5rem' }}>
        {/* Header Metadata */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="badge-category">{post.category}</span>
            <span style={{ color: 'var(--text-faint)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              {post.read_time} phút đọc
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif-display)',
            fontSize: 'clamp(2.25rem, 4.2vw, 3.4rem)',
            lineHeight: 1.16,
            marginBottom: '1.25rem',
            color: 'var(--text-primary)'
          }}>
            {post.title}
          </h1>

          <p style={{
            fontFamily: 'var(--font-serif-heading)',
            fontSize: '1.25rem',
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            maxWidth: '680px',
            margin: '0 auto 1.75rem auto'
          }}>
            {post.excerpt}
          </p>

          {/* Author Card & Date */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            {post.author_avatar && (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {post.author_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {post.author_role || 'Cộng tác viên biên tập'} • {formattedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Cover Image */}
        {post.cover_image && (
          <figure style={{ margin: '2rem 0 3rem 0' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px'
            }}>
              <img
                src={post.cover_image}
                alt={post.title}
                style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <figcaption style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: '0.65rem'
            }}>
              Hình ảnh tư liệu chuyên đề của The Classical Gazette
            </figcaption>
          </figure>
        )}

        {/* Article Body Content */}
        <div 
          className="article-body"
          style={{ fontSize: fontSizeStyle }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                Từ khóa:
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="badge-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '1.75rem',
          marginTop: '3rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {post.author_avatar && (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
              Về tác giả: {post.author_name}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              {post.author_role || 'Nhà nghiên cứu văn hóa và khảo cứu tư tưởng độc lập.'} Bài viết được phản biện và xuất bản theo tiêu chuẩn biên tập của The Classical Gazette.
            </p>
          </div>
        </div>

        {/* Discussion / Comments Section */}
        <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '3px double var(--border-strong)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
            <MessageSquare size={22} color="var(--accent-primary)" />
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.6rem', margin: 0 }}>
              Diễn Đàn Thảo Luận ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          <form 
            onSubmit={handleCommentSubmit}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '2.5rem'
            }}
          >
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-serif-heading)' }}>
              Đóng góp góc nhìn của bạn
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn An"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email (không công khai)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Nội dung bình luận *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Chia sẻ quan điểm, phản biện hoặc câu hỏi của bạn với tác giả..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingComment}
              className="btn-classic-primary"
            >
              <Send size={15} />
              <span>{isSubmittingComment ? 'Đang gửi...' : 'Gửi Ý Kiến Bình Luận'}</span>
            </button>
          </form>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {comments.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                Chưa có bình luận nào. Hãy là người đầu tiên khai mở cuộc đối thoại văn minh này!
              </p>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment.id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {comment.author_name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(comment.created_at))}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-line' }}>
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  );
};
