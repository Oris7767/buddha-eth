import { Post } from '../types/blog';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Nghệ Thuật Của Sự Trầm Tĩnh: Tại Sao Đọc Sâu Quan Trọng Giữa Kỷ Nguyên Bội Thực Thông Tin',
    slug: 'nghe-thuat-cua-su-tram-tinh-doc-sau',
    excerpt: 'Khi nhịp độ truyền thông số đẩy con người vào trạng thái tiếp nhận phân mảnh, việc quay trở lại với những trang sách và sự chiêm nghiệm sâu sắc trở thành một hành vi kháng cự đầy phẩm giá.',
    content: `Khi thế giới số tràn ngập những mẩu tin ngắn, những cú vuốt màn hình vô tận và các thuật toán gợi ý kích thích phản xạ tức thời, chúng ta dường như đang đánh mất một trong những năng lực quý giá nhất của con người: **khả năng đọc sâu và trầm tư**.

Đọc sâu (deep reading) không đơn thuần là việc giải mã ký tự trên mặt giấy hay màn hình. Đó là một quá trình tâm thức phức tạp, nơi người đọc đối thoại thầm lặng với tác giả, đặt nghi vấn về những giả định cố hữu, và kết nối những ý niệm rời rạc thành một bức tranh toàn cảnh về bản thể và thời cuộc.

### Sự Xói Mòn Của Tập Trung Tuyến Tính

Trong cuốn tiểu luận *The Shallows*, nhà văn Nicholas Carr đã chỉ ra cách mạng Internet đã tái định hình mạng nơ-ron của não bộ con người như thế nào. Bộ não có tính mềm dẻo (neuroplasticity), nó thích nghi tuyệt vời với bất kỳ công cụ nào mà ta sử dụng thường xuyên. Khi ta quen với việc đọc lướt (skimming), não bộ học cách tìm kiếm phần thưởng dopamine nhanh chóng từ thông tin mới, nhưng đồng thời làm cùn mòn mạch thần kinh dành cho sự suy ngẫm trầm lắng.

> "Một tâm trí liên tục bị phân tâm sẽ không thể thấu thị vẻ đẹp của sự phức tạp; nó chỉ có thể phản ứng với những kích thích bề mặt."

Việc đọc một cuốn sách kinh điển dày hàng trăm trang đòi hỏi ta phải tự nguyện nhẫn nại. Ta không thể ấn phím "tua nhanh" để đón nhận sự thấu hiểu; sự thấu hiểu là thành quả của cả hành trình bước đi chậm rãi qua từng chương hồi.

### Khoảng Lặng Giữa Những Con Chữ

Trong thi pháp cổ điển phương Đông, "khoảng trống" (hư không) mang ý nghĩa then chốt không kém gì nét mực. Tương tự, trong một bài viết giá trị, những khoảng lặng tư tưởng giữa các câu văn chính là nơi độc giả tìm thấy không gian cho chính tâm hồn mình.

1. **Khước từ tính cấp bách giả tạo**: Không phải tin tức giật gân nào cũng cần sự chú ý của bạn ngay trong phút này.
2. **Xây dựng pháo đài tĩnh lặng**: Dành ít nhất 45 phút mỗi sáng sớm hoặc đêm muộn hoàn toàn ngắt kết nối Internet để đọc các văn bản văn học, triết học hoặc nghiên cứu thực thụ.
3. **Ghi chép bằng tay bên lề trang sách**: Bút chì và trang sách mang lại một mối liên hệ xúc giác giúp tư duy neo chặt vào thực tại.

Sự sang trọng đích thực của thế kỷ 21 không phải là tốc độ kết nối hay khối lượng dữ liệu ta gom nhặt, mà là năng lực giữ cho tâm trí mình tự do, sáng rõ và không bị cuốn trôi bởi dòng thác xô bồ ngoài kia.`,
    cover_image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    category: 'Văn Hóa & Tri Thức',
    tags: ['Triết Học', 'Đọc Sách', 'Tĩnh Lặng', 'Tiểu Luận'],
    status: 'published',
    created_at: '2026-10-15T08:30:00Z',
    updated_at: '2026-10-15T08:30:00Z',
    author_name: 'Buddha.eth',
    author_avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
    author_role: 'Khảo luận Triết học, Chiêm tinh & Tâm thức',
    read_time: 6,
    views_count: 2450,
    featured: true,
    seo_title: 'Nghệ Thuật Của Sự Trầm Tĩnh: Đọc Sâu & Tỉnh Thức',
    seo_description: 'Tiểu luận về tầm quan trọng của việc đọc sâu, thiền định và duy trì sự tĩnh lặng của tâm thức giữa kỷ nguyên bùng nổ thông tin số.',
    seo_keywords: 'triết học, chiêm tinh, tỉnh thức, đọc sâu, tâm thức, buddha eth'
  },
  {
    id: 'post-2',
    title: 'Chiêm Tinh Học Nội Môn: Khi Các Hành Tinh Phản Chiếu Vùng Sâu Tiềm Thức',
    slug: 'chiem-tinh-hoc-noi-mon-tiem-thuc-carl-jung',
    excerpt: 'Dưới lăng kính của tâm lý học chiều sâu Carl Jung và triết học cổ đại, bản đồ sao không phải là chiếc lồng số phận định trước, mà là tấm bản đồ dẫn lối sự tiến hóa của linh hồn.',
    content: `Trong nhiều thế kỷ, chiêm tinh học thường bị hiểu lầm thành những lời đoán định số mệnh đơn thuần, hoặc bị thương mại hóa thành 12 cung hoàng đạo trên các trang báo giải trí. Nhưng ở tầng mức nguyên bản và sâu xa nhất — **Chiêm tinh học Nội môn (Esoteric Astrology)** — đây là một hệ thống biểu tượng tâm lý học cổ xưa nhất của nhân loại.

Nhà tâm thần học Thụy Sĩ Carl Gustav Jung từng nhận định rằng: các biểu tượng chiêm tinh chính là sự phóng chiếu của các cổ mẫu (archetypes) từ tầng Vô thức Tập thể (Collective Unconscious).

> "Chiêm tinh đại diện cho tổng hòa của mọi tri thức tâm lý học cổ xưa. Bầu trời không quyết định chúng ta; bầu trời là chiếc gương khổng lồ phản chiếu các xung lực tâm lý đang vận hành bên trong con người."

### Cấu Trúc Năng Lượng Của Các Thiên Thể

Mỗi hành tinh trong bản đồ sao (Natal Chart) tương ứng với một cơ chế tâm thức thiết yếu:

- **Mặt Trời (☉)**: Bản ngã tỉnh thức, ý chí vươn tới sự toàn thiện và mục đích sống cốt lõi (Individuation).
- **Mặt Trăng (☽)**: Thế giới nội tâm, bản năng tự vệ, ký ức tuổi thơ và phản xạ cảm xúc vô thức.
- **Thổ Tinh (♄ Saturn)**: Vị thầy nghiêm khắc của thời gian, nghiệp quả (Karma), ranh giới và cấu trúc cần được tôi luyện qua gian khó.
- **Hải Vương Tinh (♆ Neptune)**: Cõi mộng tưởng, lòng trắc ẩn phổ quát, nhưng cũng là ảo ảnh và sự tan biến của cái tôi.

### Chuyển Hóa Năng Lượng: Từ Nạn Nhân Đến Đấng Sáng Tạo

Khi ta đối diện với một góc chiếu căng thẳng (Square 90° hoặc Opposition 180°), người theo quan điểm định mệnh sẽ cảm thấy bất an. Nhưng người thực hành tỉnh thức sẽ nhận ra đó là một **nguồn điện áp tâm lý (psychological tension)** được vũ trụ sắp đặt để thúc đẩy linh hồn phá vỡ giới hạn cũ.

Một người thấu hiểu chiêm tinh học chân chính không bao giờ dùng ngày sinh để biện minh cho sự buông thả hay bất toàn của mình. Ngược lại, họ dùng nó như một chiếc la bàn soi sáng những góc tối (The Shadow) cần được ôm ấp và hợp nhất.`,
    cover_image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    category: 'Chiêm Tinh Nội Môn',
    tags: ['Chiêm Tinh', 'Carl Jung', 'Tiềm Thức', 'Vũ Trụ', 'Tâm Lý Học'],
    status: 'published',
    created_at: '2026-10-12T14:15:00Z',
    updated_at: '2026-10-12T14:15:00Z',
    author_name: 'Buddha.eth',
    author_avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
    author_role: 'Khảo luận Triết học & Chiêm tinh',
    read_time: 5,
    views_count: 1890,
    featured: false,
    seo_title: 'Chiêm Tinh Học Nội Môn & Tâm Lý Học Chiều Sâu | Buddha.eth',
    seo_description: 'Tiểu luận khảo cứu về Chiêm tinh học nội môn dưới lăng kính Carl Jung, giải mã các hành tinh và sự tiến hóa của tâm thức.',
    seo_keywords: 'chiem tinh noi mon, carl jung, ban do sao, triet hoc vu tru, buddha eth'
  },
  {
    id: 'post-3',
    title: 'Hạ Tầng Tối Thiểu Cho Nhà Xuất Bản Độc Lập: Astro, Supabase và Netlify',
    slug: 'ha-tang-toi-thieu-nha-xuat-ban-doc-lap-supabase-netlify',
    excerpt: 'Không cần hệ thống máy chủ đồ sộ hay các plugin nặng nề, một kiến trúc hiện đại tinh gọn có thể giúp tác giả sở hữu hoàn toàn nội dung và đạt điểm SEO 100 tuyệt đối.',
    content: `Trong nhiều thập kỷ, WordPress đã thống trị thế giới blog cá nhân và xuất bản tin tức. Tuy nhiên, cùng với thời gian, sự phình to của các plugin bên thứ ba, nguy cơ bảo mật thường trực và chi phí duy trì cơ sở dữ liệu cồng kềnh đã khiến không ít tác giả mệt mỏi.

Hôm nay, một hướng tiếp cận mới mẻ và thanh thoát hơn đang mở ra cho các cây bút độc lập: **Hạ tầng Tối giản Không Máy Chủ (Minimalist Serverless Publishing Stack)**.

### Bộ Ba Quyền Lực: Supabase, Jamstack & Netlify

Kiến trúc này phân tách rạch ròi ba nhiệm vụ cốt lõi:

1. **Supabase (Cơ sở dữ liệu & Xác thực)**: Lưu trữ các bài viết, danh mục, bình luận dưới định dạng PostgreSQL thuần khiết. Đi kèm với hệ thống phân quyền Row Level Security (RLS) an toàn và API REST/GraphQL tức thì.
2. **Giao diện Biên tập Trực quan (Editor UI)**: Cho phép tác giả đăng nhập an toàn, soạn thảo bài viết bằng định dạng Markdown giàu biểu cảm, kiểm tra điểm SEO theo thời gian thực và xuất bản ngay tức thì.
3. **Mạng phân phối Toàn cầu Netlify**: Bản dựng tĩnh hoặc máy chủ biên (Edge Functions) phân phối nội dung tới người đọc chỉ trong vài chục mili-giây với chi phí gần như bằng 0.

> "Sự đơn giản đỉnh cao luôn đi đôi với năng lực kiểm soát hoàn toàn dữ liệu của chính mình."

### Lợi Thế Vượt Trội Về SEO

Khi tốc độ tải trang chỉ mất dưới 0.5 giây và mã HTML được cấu trúc chuẩn ngữ nghĩa (semantic HTML5 với schema.org JSON-LD), các con bot thu thập thông tin của Google sẽ lập chỉ mục bài viết gần như tức thì. Bạn không cần bất kỳ plugin SEO cồng kềnh nào để đạt được điểm số Lighthouse xanh rì hoàn hảo.`,
    cover_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    category: 'Công Nghệ & Kỹ Thuật',
    tags: ['Supabase', 'Netlify', 'SEO', 'Jamstack'],
    status: 'published',
    created_at: '2026-10-08T09:00:00Z',
    updated_at: '2026-10-08T09:00:00Z',
    author_name: 'Lê Hoàng Nam',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    author_role: 'Kỹ sư Hạ tầng & Blogger Công nghệ',
    read_time: 4,
    views_count: 2150,
    featured: false,
    seo_title: 'Hạ Tầng Xuất Bản Độc Lập Với Supabase và Netlify',
    seo_description: 'Hướng dẫn xây dựng hệ thống blog siêu nhẹ, tối ưu SEO vượt trội với Supabase và Netlify.',
    seo_keywords: 'supabase blog, netlify deploy, seo toi uu, jamstack blog'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Tất cả bài viết', slug: 'all' },
  { id: 'cat-2', name: 'Chiêm Tinh Nội Môn', slug: 'chiem-tinh-noi-mon' },
  { id: 'cat-3', name: 'Triết Học & Tỉnh Thức', slug: 'triet-hoc-tinh-thuc' },
  { id: 'cat-4', name: 'Tâm Lý Học Chiều Sâu', slug: 'tam-ly-hoc-chieu-sau' },
  { id: 'cat-5', name: 'Chu Kỳ Vũ Trụ & Thời Cuộc', slug: 'chu-ky-vu-tru-thoi-cuoc' }
];
