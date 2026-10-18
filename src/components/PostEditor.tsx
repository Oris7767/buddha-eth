import React, { useState, useEffect } from 'react';
import { Post } from '../types/blog';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Columns, 
  Edit3, 
  CheckCircle, 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  Tag as TagIcon, 
  Folder, 
  HelpCircle,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  Code,
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { createPost, updatePost, AuthUser } from '../lib/supabase';
import { INITIAL_CATEGORIES } from '../data/samplePosts';

interface PostEditorProps {
  initialPost?: Post | null;
  currentUser: AuthUser;
  onBack: () => void;
  onPostSaved: (post: Post) => void;
}

// Preset cover images for editorial vibes
const COVER_PRESETS = [
  { name: 'Sách & Trầm Tư', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Thư Viện Cổ', url: 'https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Máy Đánh Chữ', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bút Mực & Bản Thảo', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bàn Làm Việc Tác Giả', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cà Phê Sáng & Nhật Báo', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80' }
];

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  currentUser,
  onBack,
  onPostSaved
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || COVER_PRESETS[0].url);
  const [category, setCategory] = useState(initialPost?.category || 'Văn Hóa & Tri Thức');
  const [tagsInput, setTagsInput] = useState(initialPost?.tags?.join(', ') || 'Triết Học, Tiểu Luận');
  const [status, setStatus] = useState<'published' | 'draft'>(initialPost?.status || 'published');
  
  // SEO Inspector fields
  const [seoTitle, setSeoTitle] = useState(initialPost?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seo_description || '');
  const [seoKeywords, setSeoKeywords] = useState(initialPost?.seo_keywords || '');

  // UI state
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!isSlugManual && title) {
      const generated = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  }, [title, isSlugManual]);

  // Insert markdown helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = prefix + (selectedText || 'văn bản') + suffix;
    const updated = before + replacement + after;
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 7));
    }, 10);
  };

  // Word count & read time calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 220));

  // SEO Score calculation
  const effectiveSeoTitle = seoTitle || title;
  const effectiveSeoDesc = seoDescription || excerpt;
  const titleScore = effectiveSeoTitle.length >= 40 && effectiveSeoTitle.length <= 70 ? 100 : effectiveSeoTitle.length > 0 ? 60 : 0;
  const descScore = effectiveSeoDesc.length >= 100 && effectiveSeoDesc.length <= 160 ? 100 : effectiveSeoDesc.length > 0 ? 65 : 0;
  const contentScore = wordCount >= 300 ? 100 : wordCount > 100 ? 70 : 30;
  const overallSeoScore = Math.round((titleScore * 0.35) + (descScore * 0.35) + (contentScore * 0.3));

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung bài viết!');
      return;
    }

    setIsSaving(true);
    const tagsArray = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      let savedPost: Post;
      if (initialPost?.id) {
        const res = await updatePost(initialPost.id, {
          title,
          slug: slug || 'bai-viet-' + Date.now(),
          excerpt: excerpt || content.substring(0, 150) + '...',
          content,
          cover_image: coverImage,
          category,
          tags: tagsArray,
          status,
          read_time: estimatedReadTime,
          seo_title: seoTitle || title,
          seo_description: seoDescription || excerpt,
          seo_keywords: seoKeywords
        });
        savedPost = res || { ...initialPost, title, content };
      } else {
        savedPost = await createPost({
          title,
          slug: slug || 'bai-viet-' + Date.now(),
          excerpt: excerpt || content.substring(0, 150) + '...',
          content,
          cover_image: coverImage,
          category,
          tags: tagsArray,
          status,
          author_name: currentUser.name || 'Ban Biên Tập',
          author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          author_role: 'Chủ bút The Classical Gazette',
          read_time: estimatedReadTime,
          views_count: 0,
          seo_title: seoTitle || title,
          seo_description: seoDescription || excerpt,
          seo_keywords: seoKeywords,
          featured: false
        });
      }

      setSaveSuccess(true);

      // Trigger celebratory confetti on publishing!
      if (status === 'published') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setTimeout(() => {
        setSaveSuccess(false);
        onPostSaved(savedPost);
      }, 1000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Lỗi lưu bài viết: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const previewHtml = DOMPurify.sanitize(marked.parse(content || '*Chưa có nội dung soạn thảo...*') as string);

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Top Action Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.75rem 0',
        backdropFilter: 'blur(8px)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBack}
              className="btn-classic-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {initialPost ? 'Chỉnh sửa bản in:' : 'Soạn thảo bản in mới:'}
              </span>
              <span style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '3px',
                fontWeight: 600,
                backgroundColor: status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: status === 'published' ? '#15803D' : '#A16207'
              }}>
                {status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}
              </span>
            </div>
          </div>

          {/* Center: View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '4px' }}>
            <button
              onClick={() => setViewMode('edit')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'edit' ? 600 : 400,
                background: viewMode === 'edit' ? 'var(--bg-card)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <Edit3 size={14} /> Soạn thảo
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'split' ? 600 : 400,
                background: viewMode === 'split' ? 'var(--bg-card)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <Columns size={14} /> Chia đôi
            </button>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'preview' ? 600 : 400,
                background: viewMode === 'preview' ? 'var(--bg-card)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <Eye size={14} /> Xem trước
            </button>
          </div>

          {/* Right: Save & Publish Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="published">Xuất bản công khai</option>
              <option value="draft">Lưu bản nháp</option>
            </select>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-classic-primary"
              style={{ padding: '0.5rem 1.25rem' }}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle size={16} />
                  <span>Đã Lưu!</span>
                </>
              ) : isSaving ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>{status === 'published' ? 'Lưu & Đăng Bài' : 'Lưu Bản Nháp'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Editor + SEO/Settings Inspector */}
      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Main Editing Column */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            {/* Title Input */}
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết uy nghi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                fontFamily: 'var(--font-serif-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                border: 'none',
                borderBottom: '2px solid var(--border-subtle)',
                borderRadius: 0,
                padding: '0.5rem 0',
                marginBottom: '1rem',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />

            {/* Slug row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>Đường dẫn (slug):</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>/post/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(e.target.value);
                }}
                placeholder="duong-dan-bai-viet"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  padding: '0.2rem 0.5rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  flex: 1
                }}
              />
            </div>

            {/* Excerpt / Lead Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Lời dẫn (Excerpt - hiển thị ngoài trang chủ và trên thẻ chia sẻ mạng xã hội)
              </label>
              <textarea
                rows={2}
                placeholder="Tóm tắt nội dung chính trong 1-2 câu sâu sắc..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-serif-heading)', fontSize: '1.05rem', resize: 'vertical' }}
              />
            </div>

            {/* Formatting Toolbar (WordPress-style) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexWrap: 'wrap',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderBottom: 'none',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0'
            }}>
              <button onClick={() => insertFormatting('**', '**')} title="In đậm (Bold)" style={{ padding: '6px', borderRadius: '3px' }}>
                <Bold size={15} />
              </button>
              <button onClick={() => insertFormatting('*', '*')} title="In nghiêng (Italic)" style={{ padding: '6px', borderRadius: '3px' }}>
                <Italic size={15} />
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <button onClick={() => insertFormatting('## ')} title="Tiêu đề mục 2 (H2)" style={{ padding: '6px', borderRadius: '3px', fontWeight: 700, fontSize: '0.8rem' }}>
                H2
              </button>
              <button onClick={() => insertFormatting('### ')} title="Tiêu đề mục 3 (H3)" style={{ padding: '6px', borderRadius: '3px', fontWeight: 700, fontSize: '0.8rem' }}>
                H3
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <button onClick={() => insertFormatting('> ')} title="Trích dẫn nổi bật (Blockquote)" style={{ padding: '6px', borderRadius: '3px' }}>
                <Quote size={15} />
              </button>
              <button onClick={() => insertFormatting('- ')} title="Danh sách gạch đầu dòng" style={{ padding: '6px', borderRadius: '3px' }}>
                <List size={15} />
              </button>
              <button onClick={() => insertFormatting('```\n', '\n```')} title="Khối mã (Code Block)" style={{ padding: '6px', borderRadius: '3px' }}>
                <Code size={15} />
              </button>
              <button onClick={() => insertFormatting('\n---\n')} title="Đường kẻ ngang phân cách" style={{ padding: '6px', borderRadius: '3px' }}>
                <Minus size={15} />
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {wordCount} từ • ~{estimatedReadTime} phút đọc
              </span>
            </div>

            {/* Content Area / Split View */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
              gap: '1.5rem',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              minHeight: '480px'
            }}>
              {/* Markdown Editor */}
              {viewMode !== 'preview' && (
                <textarea
                  id="post-content-textarea"
                  rows={20}
                  placeholder="Bắt đầu soạn thảo bài viết bằng Markdown hoặc gõ văn bản tự nhiên...&#10;&#10;## Đặt câu hỏi cốt lõi&#10;Trình bày các luận điểm với sự mạch lạc và trầm tĩnh."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '480px',
                    padding: '1.25rem',
                    fontFamily: 'var(--font-serif-body)',
                    fontSize: '1.08rem',
                    lineHeight: 1.7,
                    border: 'none',
                    resize: 'vertical',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
              )}

              {/* Live Preview */}
              {viewMode !== 'edit' && (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderLeft: viewMode === 'split' ? '1px solid var(--border-subtle)' : 'none',
                  overflowY: 'auto',
                  maxHeight: '650px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                    Xem trước bản in (Live Preview)
                  </div>
                  <div 
                    className="article-body"
                    style={{ fontSize: '1.1rem' }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Inspector Panel (WordPress-like Document & SEO Settings) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* SEO Inspector Widget */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                  <Globe size={16} color="var(--accent-primary)" />
                  <span>Thước Đo Chuẩn SEO</span>
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: overallSeoScore >= 80 ? 'rgba(34, 197, 94, 0.15)' : overallSeoScore >= 50 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: overallSeoScore >= 80 ? '#15803D' : overallSeoScore >= 50 ? '#A16207' : '#B91C1C'
                }}>
                  {overallSeoScore}/100 Điểm
                </span>
              </div>

              {/* Google Search Result Preview */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DFE1E5',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#202124', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#202124', fontWeight: 500 }}>classical-gazette.netlify.app</span>
                  <span style={{ color: '#70757a' }}>› post › {slug || 'bai-viet'}</span>
                </div>
                <div style={{ color: '#1a0dab', fontSize: '1rem', fontWeight: 500, lineHeight: 1.3, marginBottom: '3px' }}>
                  {effectiveSeoTitle || 'Tiêu Đề Bài Viết Chuẩn SEO'}
                </div>
                <div style={{ color: '#4d5156', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {effectiveSeoDesc || 'Mô tả tóm lược bài viết sẽ xuất hiện trên kết quả tìm kiếm của Google và khi chia sẻ trên mạng xã hội...'}
                </div>
              </div>

              {/* SEO Title Input */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <label style={{ fontWeight: 600 }}>Tiêu đề SEO</label>
                  <span style={{ color: effectiveSeoTitle.length > 60 ? '#B91C1C' : 'var(--text-muted)' }}>
                    {effectiveSeoTitle.length}/60 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Để trống sẽ lấy tiêu đề chính"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* SEO Meta Description */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <label style={{ fontWeight: 600 }}>Thẻ mô tả (Meta Description)</label>
                  <span style={{ color: effectiveSeoDesc.length > 160 ? '#B91C1C' : 'var(--text-muted)' }}>
                    {effectiveSeoDesc.length}/160 ký tự
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Mô tả hấp dẫn giúp tăng tỉ lệ nhấp (CTR)..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Focus Keywords */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Từ khóa chính (Focus Keywords)
                </label>
                <input
                  type="text"
                  placeholder="triết học, tiểu luận, văn hóa..."
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Document Attributes Widget */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Folder size={16} />
                <span>Phân Loại & Thẻ</span>
              </h4>

              {/* Category Picker */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Chuyên mục chính
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {INITIAL_CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Gắn thẻ (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Triết Học, Sách, Mỹ Học..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Cover Image Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Ảnh bìa bản in (Cover Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                />

                {/* Quick Presets */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Ảnh mẫu phong cách cổ điển:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: coverImage === preset.url ? 'var(--text-primary)' : 'var(--bg-secondary)',
                        color: coverImage === preset.url ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        borderRadius: '2px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {coverImage && (
                  <div style={{ marginTop: '0.75rem', border: '1px solid var(--border-subtle)', padding: '2px' }}>
                    <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
