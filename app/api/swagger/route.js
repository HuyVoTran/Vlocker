import { NextResponse } from 'next/server';

// -   **Authentication (`/api/auth/...`)**
//     -   `POST /register`: Đăng ký tài khoản mới cho cư dân.
//     -   `POST /forgot-password`: Gửi email yêu cầu đặt lại mật khẩu.
//     -   `POST /reset-password`: Cập nhật mật khẩu mới với token hợp lệ.
// -   **User Profile (`/api/profile`)**
//     -   `GET`: Lấy thông tin cá nhân, thống kê và hoạt động gần đây của người dùng đang đăng nhập.
//     -   `PATCH`: Cập nhật thông tin cá nhân hoặc đổi mật khẩu.
// -   **Manager (`/api/lockers/manager/...`)**
//     -   `GET /dashboard`: Lấy dữ liệu thống kê cho trang Dashboard của quản lý.
//     -   `GET /booked`: Lấy danh sách tất cả các tủ đang được thuê.
//     -   `PATCH /cancel`: Hủy một lượt đặt tủ.
// -   **Reports (`/api/reports`)**
//     -   `GET`: Lấy danh sách báo cáo (Quản lý thấy tất cả, Cư dân chỉ thấy của mình).
//     -   `POST`: Cư dân tạo một báo cáo mới.
//     -   `PATCH`: Quản lý cập nhật trạng thái của một báo cáo.
// -   **Notifications (`/api/notifications`)**
//     -   `GET`, `POST`, `PATCH`, `DELETE`: Các hành động CRUD để quản lý thông báo.
// -   **Contact (`/api/contact`)**
//     -   `POST`: Xử lý form liên hệ và gửi email.

export async function GET() {
  return NextResponse.json({
    openapi: '3.0.0',
    info: {
      title: 'VLocker API',
      version: '1.0.0',
      description: 'API Documentation cho hệ thống VLocker',
    },
    paths: {
      // 🔐 AUTH
      '/api/auth/register': {
        post: {
          summary: 'Đăng ký tài khoản mới cho cư dân',
          tags: ['Authentication'],
        },
      },
      '/api/auth/forgot-password': {
        post: {
          summary: 'Gửi email yêu cầu đặt lại mật khẩu',
          tags: ['Authentication'],
        },
      },
      '/api/auth/reset-password': {
        post: {
          summary: 'Cập nhật mật khẩu mới với token hợp lệ',
          tags: ['Authentication'],
        },
      },

      // 👤 PROFILE
      '/api/profile': {
        get: {
          summary: 'Lấy thông tin cá nhân và thống kê người dùng',
          tags: ['User Profile'],
        },
        patch: {
          summary: 'Cập nhật thông tin cá nhân hoặc đổi mật khẩu',
          tags: ['User Profile'],
        },
      },

      // 🧑‍💼 MANAGER
      '/api/lockers/manager/dashboard': {
        get: {
          summary: 'Lấy dữ liệu Dashboard cho quản lý',
          tags: ['Manager'],
        },
      },
      '/api/lockers/manager/booked': {
        get: {
          summary: 'Lấy danh sách tất cả các tủ đang được thuê',
          tags: ['Manager'],
        },
      },
      '/api/lockers/manager/cancel': {
        patch: {
          summary: 'Hủy một lượt đặt tủ',
          tags: ['Manager'],
        },
      },

      // 📝 REPORTS
      '/api/reports': {
        get: {
          summary:
            'Lấy danh sách báo cáo (quản lý thấy tất cả, cư dân chỉ thấy của mình)',
          tags: ['Reports'],
        },
        post: {
          summary: 'Cư dân tạo một báo cáo mới',
          tags: ['Reports'],
        },
        patch: {
          summary: 'Quản lý cập nhật trạng thái báo cáo',
          tags: ['Reports'],
        },
      },

      // 🔔 NOTIFICATIONS
      '/api/notifications': {
        get: {
          summary: 'Lấy danh sách thông báo',
          tags: ['Notifications'],
        },
        post: {
          summary: 'Tạo thông báo mới',
          tags: ['Notifications'],
        },
        patch: {
          summary: 'Cập nhật thông báo',
          tags: ['Notifications'],
        },
        delete: {
          summary: 'Xóa thông báo',
          tags: ['Notifications'],
        },
      },

      // 📩 CONTACT
      '/api/contact': {
        post: {
          summary: 'Xử lý form liên hệ và gửi email',
          tags: ['Contact'],
        },
      },
    },
  });
}
