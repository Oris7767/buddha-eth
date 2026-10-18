import React, { useEffect, useState } from 'react';
import { Post } from '../types/blog';
import { 
  PenLine, 
  Trash2, 
  Edit3, 
  Eye, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Database,
  ArrowUpRight,
  RotateCcw,
  ArchiveRestore
} from 'lucide-react';
import { deletePost, updatePost, getHiddenPostIds, getArchivePosts, unhidePost, restoreAllHiddenPosts } from '../lib/supabase';

interface AdminDashboardProps {
  posts: Post[];
  onWriteNew: () => void;
  onEditPost: (post: Post) => void;
  onViewPost: (slug: string) => void;
  onPostDeleted: (id: string) => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  posts,
  onWriteNew,
  onEditPost,
  onViewPost,
  onPostDeleted,
  onOpenSupabaseModal,
  isSupabaseConnected
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [hiddenPosts, setHiddenPosts] = useState<Post[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    (async () => {
      const ids = getHiddenPostIds();
      if (!ids.length) {
        setHiddenPosts([]);
        return;
      }
      const all = await getArchivePosts(true);
      const set = new Set(ids);
      setHiddenPosts(all.filter((p) => set.has(p.id)));
    })();
  }, []);

  const handleRestore = (id: string) => {
    unhidePost(id);
    setHiddenPosts((prev) => prev.filter((p) => p.id !== id));
    window.location.reload();
  };

  const handleRestoreAll = () => {
    restoreAllHiddenPosts();
    setHiddenPosts([]);
    window.location.reload();
  };

  const handleExportHidden = () => {
    const ids = getHiddenPostIds();
    const blob = new Blob([JSON.stringify(ids, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deleted-post-ids.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculations
  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = !adminSearch || 
      p.title.toLowerCase().includes(adminSearch.toLowerCase()) || 
      p.category.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (post: Post) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}" không? Hành động này không thể hoàn tác.`)) {
      await deletePost(post.id);
      onPostDeleted(post.id);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    const updated = await updatePost(post.id, { status: nextStatus });
    if (updated) {
      window.location.reload();
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.5rem',
        borderBottom: '3px double var(--border-strong)',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            Tòa Soạn & Biên Tập
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.25rem', marginTop: '0.2rem' }}>
            Bảng Quản Trị Bài Viết
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Quản lý kho bài, cập nhật thẻ SEO, duyệt xuất bản và kiểm tra dữ liệu lưu trữ
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenSupabaseModal}
            className="btn-classic-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Database size={16} />
            <span>{isSupabaseConnected ? 'Supabase: Đang kết nối' : 'Cấu hình Supabase'}</span>
          </button>

          <button
            onClick={onWriteNew}
            className="btn-classic-primary"
            style={{ padding: '0.6rem 1.35rem' }}
          >
            <Plus size={16} />
            <span>Viết Bài Mới</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TỔNG SỐ BÀI VIẾT</span>
            <FileText size={16} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.2rem', fontWeight: 700, margin: '0.4rem 0 0.1rem 0' }}>
            {totalPosts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Các bài trong tòa soạn</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>ĐÃ XUẤT BẢN</span>
            <CheckCircle size={16} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.2rem', fontWeight: 700, margin: '0.4rem 0 0.1rem 0', color: '#15803D' }}>
            {publishedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hiển thị trên website</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A16207', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>BẢN NHÁP</span>
            <Clock size={16} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.2rem', fontWeight: 700, margin: '0.4rem 0 0.1rem 0', color: '#A16207' }}>
            {draftCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang được hoàn thiện</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>LƯỢT ĐỌC (VIEWS)</span>
            <TrendingUp size={16} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.2rem', fontWeight: 700, margin: '0.4rem 0 0.1rem 0', color: 'var(--accent-primary)' }}>
            {totalViews}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tương tác của độc giả</div>
        </div>
      </div>

      {/* Thùng rác — bài đã xoá (có thể khôi phục) */}
      {hiddenPosts.length > 0 && (
        <div
          style={{
            border: '1px dashed var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.9rem 1.1rem',
            marginBottom: '1.75rem',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
              <ArchiveRestore size={16} />
              <strong>{hiddenPosts.length}</strong> bài đã xoá khỏi website
            </span>
            <span style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowHidden((v) => !v)}
                className="btn-classic-secondary"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
              >
                {showHidden ? 'Ẩn danh sách' : 'Xem danh sách'}
              </button>
              <button
                onClick={handleRestoreAll}
                className="btn-classic-secondary"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={14} /> Khôi phục tất cả
              </button>
              <button
                onClick={handleExportHidden}
                className="btn-classic-secondary"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
              >
                Tải ID
              </button>
            </span>
          </div>

          {showHidden && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0.9rem 0 0 0' }}>
              {hiddenPosts.map((p) => (
                <li
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>{p.created_at.slice(0, 10)}</span>
                    {p.title}
                  </span>
                  <button
                    onClick={() => handleRestore(p.id)}
                    className="btn-classic-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    Khôi phục
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Status Tab Filters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '3px',
              backgroundColor: filterStatus === 'all' ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: filterStatus === 'all' ? 'var(--bg-primary)' : 'var(--text-secondary)'
            }}
          >
            Tất cả ({totalPosts})
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '3px',
              backgroundColor: filterStatus === 'published' ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: filterStatus === 'published' ? 'var(--bg-primary)' : 'var(--text-secondary)'
            }}
          >
            Đã Xuất Bản ({publishedCount})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '3px',
              backgroundColor: filterStatus === 'draft' ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: filterStatus === 'draft' ? 'var(--bg-primary)' : 'var(--text-secondary)'
            }}
          >
            Bản Nháp ({draftCount})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, chuyên mục..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Table of Articles */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Bài Viết</th>
              <th style={{ padding: '0.85rem 1rem' }}>Chuyên Mục</th>
              <th style={{ padding: '0.85rem 1rem' }}>Trạng Thái</th>
              <th style={{ padding: '0.85rem 1rem' }}>Lượt Xem</th>
              <th style={{ padding: '0.85rem 1rem' }}>Ngày Tạo</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Không tìm thấy bài viết nào phù hợp. Hãy viết một bài viết mới!
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', maxWidth: '340px' }}>
                    <div 
                      onClick={() => onEditPost(post)}
                      style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: '3px' }}
                    >
                      {post.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      /post/{post.slug}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge-category">{post.category}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleToggleStatus(post)}
                      title="Nhấn để đổi trạng thái"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        backgroundColor: post.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: post.status === 'published' ? '#15803D' : '#A16207'
                      }}
                    >
                      {post.status === 'published' ? '● Đã Xuất Bản' : '○ Bản Nháp'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {post.views_count || 0}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(post.created_at))}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        onClick={() => onViewPost(post.slug)}
                        title="Xem bài viết ngoài trang chủ"
                        style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '3px' }}
                      >
                        <ArrowUpRight size={16} />
                      </button>
                      <button
                        onClick={() => onEditPost(post)}
                        title="Chỉnh sửa bài viết"
                        style={{ padding: '6px', color: 'var(--accent-primary)', borderRadius: '3px' }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        title="Xóa bài viết"
                        style={{ padding: '6px', color: '#B91C1C', borderRadius: '3px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
