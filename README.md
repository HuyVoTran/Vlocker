<!-- 
cd vlocker 
npm run dev

git pull

git add .
git commit -m "Fix revalidateOnFocus"
git push

Password@12345
-->

# VLocker - Ứng Dụng Quản Lý Tủ Khóa Dành Cho Chung Cư

<br>

**Mục tiêu:** Dự án VLocker được xây dựng nhằm **số hóa** và **tối ưu hóa** quy trình quản lý tủ khóa cá nhân, chuyển đổi mô hình quản lý thủ công sang tự động hóa hoàn toàn.

1.  **Tăng cường Bảo mật:** Cung cấp quy trình giao nhận hàng hóa an toàn, đặc biệt cho kịch bản Shipper bỏ đồ, đảm bảo chỉ người thanh toán mới có thể mở tủ.
2.  **Phân quyền Rõ ràng:** Xây dựng hai vai trò Người dùng chính (**Dân cư** và **Quản lý**) với các quyền hạn truy cập và thao tác riêng biệt.
3.  **Tự động hóa Thanh toán:** Xử lý việc tính toán chi phí lưu trữ theo thời gian thực (5k/ngày) và tích hợp cổng thanh toán để kích hoạt mở khóa.

<br>

**Vấn đề mà dự án giải quyết:**
1.  **An ninh & Mất mát Tài sản:** Loại bỏ rủi ro mất mát hoặc nhầm lẫn tài sản khi gửi tạm, do hệ thống khóa cứng tủ sau khi xác nhận bỏ đồ vào.
2.  **Quản lý Thủ công:** Thay thế việc ghi chép sổ sách và theo dõi trạng thái tủ bằng tay, dễ sai sót, bằng một Dashboard trực quan.
3.  **Quy trình Giao nhận Cứng nhắc:** Cho phép người dùng linh hoạt quản lý việc mở/đóng tủ từ xa (hoặc qua ứng dụng) khi vắng nhà, giúp việc giao nhận hàng hóa trở nên dễ dàng và không cần mặt đối mặt.
4.  **Thiếu Lịch sử & Thống kê:** Cung cấp khả năng theo dõi lịch sử thuê tủ, trạng thái sử dụng hiện tại và các báo cáo thống kê quan trọng cho Quản lý.

<br>

**Đối tượng sử dụng:** Dân cư / Quản lý của một Chung Cư

**Demo:** [VLocker - Vercel](vlocker.vercel.app) 

## First Design
<p align="center"><img src="README\FirstDesign.png" alt="First Desgin">
<br><i>Chú thích: Bản design đầu tiên từ Figma</i></p>

## Tính Năng Chính
### Người Dùng:
- Đăng Ký / Đăng Nhập / Quên Mật Khẩu / Đăng Xuất
- Trang chủ
- Trang Dashboard
- Trang profile
- Trang báo cáo
- Trang liên hệ
- Lịch sử tủ

### Dân cư:
- Dashboard (Xem nhanh danh sách tủ của bản thân, danh sách tủ trống)
- Xem tủ cá nhân (Quản lý, khóa, thanh toán)
- Xem tủ trống (Đăng ký)

### Quản lý:
- Dashboard (Thống kê tất cả tủ, xem nhanh danh sách tủ của cả dân cư, danh sách tủ trống)
- Thống kê tủ (Quản lý)
- Xem tủ trống

## User Flow
<p align="center"><img src="README\VLocker-UserFlow-User.drawio.png" alt="Đặt Tủ & Khóa Tủ">
<br><i>Chú thích: User Flow - Đặt Tủ & Khóa Tủ (Trường hợp shipper giao hàng)</i></p>

<p align="center"><img src="README\VLocker-UserFlow-User2.drawio.png" alt="Mở Khóa Tủ">
<br><i>Chú thích: User Flow - Mở Khóa Tủ (Thanh toán tiền thuê mới được mở khóa)</i></p>

## Admin Flow
<p align="center"><img src="README\VLocker-UserFlow-Admin.drawio.png" alt="Xem Thống Kê & Kiểm Tra Tủ">
<br><i>Chú thích: Admin Flow - Xem Thống Kê & Kiểm Tra Tủ</i></p>

## Use-case Diagram

## System Architecture

## Database

## API Documentation

## Công Nghệ Đã Sử Dụng
- Frontend: React / NextJS / TailwindCSS
- Backend: NextJS / MongooseDB
- Database: MongoDB
- Tools: Figma / Git / Github / Visual Code ...

## Hướng Dẫn Cài Đặt & Chạy Thử Dự Án
### Yêu cầu:
- Cài đặt npm
- Thêm biến môi trường .env
- ...

```bash
npm install

git clone ...
cd D:/project
npm install
```

```bash
# Dependencies
npm install next@16.0.3 react@19.2.0 react-dom@19.2.0 axios dotenv nodemailer next-auth mongoose bcryptjs lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-alert-dialog @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-avatar @radix-ui/react-label @radix-ui/react-separator
```

```bash
# Dev dependencies
npm install -D tailwindcss@^4 @tailwindcss/postcss eslint@^9 eslint-config-next@16.0.3 @types/node@^20 @types/react@^19 @types/react-dom@^19 @types/nodemailer concurrently
```

```bash
npm run dev
```

## Cấu Trúc Thư Mục

## Testing

## Bảo Mật
- Hash password
- Validation input
- NextAuth

## Author
- **Trần Võ Huy (Salvio Tran)**
- Email:
  - Công việc: Huy.2374802010192@vanlanguni.vn 
  - Cá nhân: Huyvo0911@gmail.com
- Github: github.com/HuyVoTran

*Đồ án nhằm mục đích học tập, không có ý định tác động đến tổ chức / cá nhân nào.*