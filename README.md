# ParkingApp 🚗

Ứng dụng di động tìm kiếm và gợi ý bãi đỗ xe thông minh, được xây dựng bằng **React Native** và **Expo**.

## 🌟 Tính năng chính
- **Bản đồ trực quan (MapView)**: Hiển thị vị trí người dùng và các bãi đỗ xe trên bản đồ.
- **Gợi ý thông minh (Recommendation)**: Đề xuất các bãi đỗ xe phù hợp nhất dựa trên vị trí, khoảng cách và các dịch vụ đi kèm.
- **Danh sách bãi đỗ (Parking List)**: Xem danh sách các bãi đỗ xe lân cận.
- **Xác thực người dùng (Authentication)**: Đăng nhập, Đăng ký.
- **Đa ngôn ngữ & Cài đặt**: Hỗ trợ chuyển đổi ngôn ngữ trong ứng dụng, cấu hình cá nhân.
- **Giao diện Themes (Sáng/Tối)**: Hệ thống Theme linh hoạt giúp mang lại trải nghiệm UI nhất quán.
- **Dữ liệu giả lập phong phú**: Tích hợp sẵn dữ liệu các bãi đỗ xe tại TP.HCM kèm theo giá vé, đánh giá, chỗ trống, tính năng (Sạc xe điện, có mái che,...).

## 🛠 Công nghệ sử dụng
- **React Native** (0.81.5)
- **Expo** (~54.0.33)
- **TypeScript**
- **React Navigation** (v6) - Quản lý điều hướng, luồng màn hình.
- **Styled Components** - Tạo kiểu và UI dễ bảo trì.
- **Async Storage** - Lưu trữ trạng thái và thiết lập.
- **Expo Vector Icons** (Ionicons) - Quản lý Icon đẹp mắt.

## 📁 Cấu trúc thư mục dự án (Directory Structure)
```
ParkingApp/
├── App.tsx             # Entry point chứa logic điều hướng chính (Tabs, Menu)
├── app.json            # Cấu hình ứng dụng Expo (App name, icon, splash screen)
├── package.json        # Chứa thông tin các dependencies
├── data/
│   └── mockData.ts     # Dữ liệu giả lập bãi đỗ xe và thuật toán tính khoảng cách (Toạ độ)
├── src/
│   ├── components/     # Các UI Component UI dùng chung
│   ├── contexts/       # React Context: AuthContext (Xác thực), ThemeContext (Giao diện, Đa ngôn ngữ)
│   ├── screens/        # Các màn hình chính: MapView, ParkingList, Recommendation, Login, Register, SettingsModal,...
│   ├── services/       # Các dịch vụ logic chính, ví dụ: ParkingService (API giả lập lấy bãi đỗ xe)
│   ├── styles/         # Style chung dùng lại (common, header, recommend,...)
│   ├── types/          # Định nghĩa kiểu dữ liệu TypeScript dùng chung 
│   ├── utils/          # Các file tiện ích (như translations - ngôn ngữ đa dạng)
│   ├── constants/      # Khai báo biến cố định (nếu có)
│   ├── hooks/          # Các custom hooks React (nếu có)
│   └── navigation/     # Config các bộ điều hướng (Stack, Bottom Tabs,...)
└── assets/             # Chứa hình ảnh, icon, font của ứng dụng
```

## 🚀 Hướng dẫn cài đặt và khởi chạy (Getting Started)

1. **Yêu cầu môi trường**:
   - Cài đặt `Node.js`.
   - Cài đặt ứng dụng **Expo Go** trên thiết bị di động (Android / iOS) HOẶC thiết lập Android Emulator / iOS Simulator.

2. **Cài đặt thư viện**:
   Di chuyển vào thư mục dự án và chạy lệnh sau để tải đầy đủ dependencies:
   ```bash
   npm install
   ```

3. **Chạy ứng dụng**:
   Khởi động máy chủ Expo:
   ```bash
   npm start
   ```
   Sau khi màn hình terminal hiển thị mã QR:
   - **Đối với thiết bị thật**: Mở ứng dụng **Expo Go** trên điện thoại và quét mã QR.
   - **Tham số dùng phím tắt trong terminal**: 
     - Nhấn phím `a` để chạy trên Android Emulator.
     - Nhấn phím `i` để chạy trên iOS Simulator.
     - Nhấn phím `w` để chạy thử bản web (nếu được hỗ trợ).

## 📝 Nhật ký cập nhật
- Dự án hiện đang khởi tạo hệ thống cơ bản với Authentication Flow và Main Flow (Tìm bãi đỗ xe, Gợi ý, Danh sách).
