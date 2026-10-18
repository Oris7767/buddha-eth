import { Post } from '../types/blog';

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Tất cả bài viết', slug: 'all' },
  { id: 'cat-2', name: 'Chiêm Tinh Nội Môn', slug: 'chiem-tinh-noi-mon' },
  { id: 'cat-3', name: 'Triết Học & Tỉnh Thức', slug: 'triet-hoc-tinh-thuc' },
  { id: 'cat-4', name: 'Tâm Lý Học Chiều Sâu', slug: 'tam-ly-hoc-chieu-sau' },
  { id: 'cat-5', name: 'Chu Kỳ Vũ Trụ & Thời Cuộc', slug: 'chu-ky-vu-tru-thoi-cuoc' }
];
