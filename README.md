# CareerZone - Cổng Thông Tin Nhà Tuyển Dụng

Ứng dụng web dành cho nhà tuyển dụng trên nền tảng CareerZone, cho phép đăng tin tuyển dụng, quản lý ứng viên và tổ chức phỏng vấn.

## 📋 Tổng Quan

CareerZone Recruiter là cổng thông tin dành riêng cho doanh nghiệp và nhà tuyển dụng. Ứng dụng cung cấp đầy đủ công cụ để quản lý quy trình tuyển dụng từ đăng tin, sàng lọc hồ sơ đến phỏng vấn và tuyển dụng.

## 🚀 Tính Năng

### Dashboard
- Tổng quan hoạt động tuyển dụng
- Thống kê số lượng tin đăng, ứng viên, phỏng vấn
- Biểu đồ phân tích hiệu quả tuyển dụng
- Thông báo và nhắc nhở quan trọng

### Quản Lý Tin Tuyển Dụng
- Tạo tin tuyển dụng với form chi tiết
- Chỉnh sửa và cập nhật tin đăng
- Quản lý trạng thái tin (nháp, chờ duyệt, đang tuyển, đã đóng)
- Gia hạn và đẩy tin lên top
- Xem thống kê lượt xem, lượt ứng tuyển

### Quản Lý Ứng Viên
- Xem danh sách ứng viên theo từng tin tuyển dụng
- Lọc và tìm kiếm ứng viên
- Xem chi tiết hồ sơ và CV
- Đánh giá và ghi chú ứng viên
- Chuyển trạng thái ứng viên (mới, đang xem xét, phỏng vấn, đạt, không đạt)
- Shortlist ứng viên tiềm năng

### Lên Lịch Phỏng Vấn
- Tạo lịch phỏng vấn với ứng viên
- Quản lý slot phỏng vấn
- Gửi email mời phỏng vấn tự động
- Phỏng vấn video trực tuyến
- Nhắc nhở lịch phỏng vấn

### Quản Lý Công Ty
- Cập nhật thông tin công ty
- Upload logo và hình ảnh
- Mô tả văn hóa công ty
- Quản lý địa điểm làm việc

### Thanh Toán & Gói Dịch Vụ
- Xem và nạp xu
- Lịch sử giao dịch
- Hóa đơn điện tử

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React v19 |
| Build Tool | Vite + SWC |
| State Management | Redux Toolkit, TanStack Query |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Forms | React Hook Form + Zod |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Icons | Lucide React |
| Date | date-fns |

## 📁 Cấu Trúc Dự Án

```
fe-recruiter/
├── src/
│   ├── components/       # React components
│   │   ├── common/       # Components dùng chung
│   │   ├── company/      # Quản lý công ty
│   │   ├── home/         # Trang chủ
│   │   ├── interviews/   # Quản lý phỏng vấn
│   │   ├── jobs/         # Quản lý tin tuyển dụng
│   │   └── ui/           # shadcn/ui components
│   ├── constants/        # Enum và hằng số
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Layout components
│   │   ├── DashboardLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── lib/              # Thư viện tiện ích
│   ├── pages/            # Các trang chính
│   │   ├── Dashboard.jsx
│   │   ├── Jobs.jsx
│   │   ├── Applications.jsx
│   │   ├── Interviews.jsx
│   │   ├── Company.jsx
│   │   ├── Billing.jsx
│   │   └── Auth/
│   ├── redux/            # Redux store
│   │   └── authSlice.js
│   ├── routes/           # Cấu hình routing
│   │   └── AppRouter.jsx
│   ├── services/         # API clients
│   │   ├── apiClient.js
│   │   ├── jobService.js
│   │   ├── applicationService.js
│   │   └── companyService.js
│   └── App.jsx           # Component chính
├── .env.example          # Mẫu biến môi trường
├── package.json
└── vite.config.js
```

## 🚦 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js**: v18 trở lên
- **pnpm**: Package manager (khuyến nghị)

### Các Bước Cài Đặt

1. **Di chuyển vào thư mục**:
   ```bash
   cd fe-recruiter
   ```

2. **Cài đặt dependencies**:
   ```bash
   pnpm install
   ```

3. **Cấu hình môi trường**:
   ```bash
   copy .env.example .env
   ```
   
   Cập nhật các biến môi trường:

4. **Chạy development server**:
   ```bash
   pnpm run dev
   ```
   
   Ứng dụng sẽ mở tại `http://localhost:4000`

## 📦 Build Production

Tạo bản build cho production:

```bash
pnpm run build
```

Output sẽ nằm trong thư mục `dist`.

## 📚 Scripts Có Sẵn

| Script | Mô tả |
|--------|-------|
| `pnpm run dev` | Chạy development server |
| `pnpm run build` | Build cho production |
| `pnpm run preview` | Preview bản build |
| `pnpm run lint` | Kiểm tra linting |

## 🎨 UI Components

Dự án sử dụng shadcn/ui - bộ component được xây dựng trên Radix UI:

- **DataTable**: Bảng dữ liệu với sorting, filtering, pagination
- **Form**: Form với validation
- **Dialog**: Modal và popup
- **Select**: Dropdown select
- **Tabs**: Tab navigation
- **Card**: Container thông tin
- **Badge**: Status indicators
- **Calendar**: Chọn ngày
- **Toast**: Thông báo

## 🔧 State Management

### Redux Toolkit
- **authSlice**: Trạng thái xác thực recruiter

### TanStack Query
- Quản lý server state
- Cache danh sách jobs, applications
- Optimistic updates khi thay đổi trạng thái

## 📱 Responsive Design

Ứng dụng được thiết kế responsive cho:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🤝 Đóng Góp

### Quy Trình Đóng Góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mô tả tính năng"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho CareerZone Platform.
