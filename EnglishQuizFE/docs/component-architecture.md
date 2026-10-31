# Frontend Component Architecture (EnglishQuizFE)

## 1. Cấu Trúc Thư Mục
```
src/
├── api/
│   └── axiosClient.js          # Axios Interceptor trung tâm
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Thanh điều hướng chính
│   │   └── Footer.jsx          # Chân trang thông tin
│   ├── common/                 # Các component dùng chung (Loading, Modal, Badge)
│   ├── student/                # Các component của Role Student (Dev 1)
│   ├── teacher/                # Các component của Role Teacher (Dev 2)
│   └── admin/                  # Các component của Role Admin (Dev 3)
├── context/
│   └── AuthContext.js          # Quản lý phiên đăng nhập và User state
├── pages/
│   ├── Homepage.jsx            # Trang chủ Base (đã hoàn thiện)
│   ├── LoginPage.jsx           # Trang Đăng nhập
│   ├── RegisterPage.jsx        # Trang Đăng ký
│   ├── StudentPage.jsx         # Không gian học viên
│   ├── TeacherPage.jsx         # Không gian giáo viên
│   └── AdminPage.jsx           # Không gian quản trị
└── styles/
    └── theme.css               # Biến CSS, màu sắc, bóng đổ, gradient
```

## 2. Quy Tắc Phối Hợp Cho 3 Developers
1. **Trang Chủ (Base)**: Đã được tạo hoàn chỉnh tại `src/pages/Homepage.jsx` và `src/App.jsx`.
2. **Ghép Nối Màn Hình Mới**:
   - Dev 1 đặt các component của Student vào `src/components/student/` và trang chính `src/pages/StudentPage.jsx`.
   - Dev 2 đặt các component của Teacher vào `src/components/teacher/` và trang chính `src/pages/TeacherPage.jsx`.
   - Dev 3 đặt các component của Admin vào `src/components/admin/` và trang chính `src/pages/AdminPage.jsx`.
3. **Thư viện Styling**: Sử dụng `react-bootstrap` kết hợp với biến CSS trong `theme.css` và thư viện icon đồng bộ `react-icons`.

