-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 06, 2026 lúc 04:45 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `kinhdoanhmohinh`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `anhmohinh`
--

CREATE TABLE `anhmohinh` (
  `MaAnh` int(11) NOT NULL,
  `LinkAnh` varchar(255) NOT NULL,
  `MaMoHinh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `anhmohinh`
--

INSERT INTO `anhmohinh` (`MaAnh`, `LinkAnh`, `MaMoHinh`) VALUES
(1, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/403/846/products/41-2d3f68da-5c47-47df-897e-396e24000bf4.jpg?v=1720165493723', 1),
(2, 'https://takishop.vn/wp-content/uploads/2019/03/fig642-luffy-gear-5-den-tron-1-1.jpg', 2),
(3, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/403/846/products/41-2d3f68da-5c47-47df-897e-396e24000bf4.jpg?v=1720165493723', 5),
(4, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/403/846/products/gd55-1.jpg?v=1712744243857', 6),
(5, 'https://bizweb.dktcdn.net/100/418/981/products/z5280779639400-18b34ca0cf1d85d771bcf5ba44c48ff8.jpg?v=1711290708500', 7);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `anhtintuc`
--

CREATE TABLE `anhtintuc` (
  `MaAnh` int(11) NOT NULL,
  `LinkAnh` varchar(255) DEFAULT NULL,
  `MaTT` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baohanh`
--

CREATE TABLE `baohanh` (
  `MaPBH` int(11) NOT NULL,
  `MaDH` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietbaohanh`
--

CREATE TABLE `chitietbaohanh` (
  `MaPBH` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `NgayBatDau` date DEFAULT NULL,
  `NgayKetThuc` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdanhmuc`
--

CREATE TABLE `chitietdanhmuc` (
  `MaChiTietDM` int(11) NOT NULL,
  `MaDM` int(11) NOT NULL,
  `TenChiTietDM` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietdanhmuc`
--

INSERT INTO `chitietdanhmuc` (`MaChiTietDM`, `MaDM`, `TenChiTietDM`, `MoTa`) VALUES
(1, 1, 'Master Grade (MG) 1/100', 'Tỷ lệ 1/100, có khung xương trong cực chi tiết'),
(2, 1, 'Real Grade (RG) 1/144', 'Tỷ lệ 1/144, nhỏ nhưng chi tiết ngang MG'),
(3, 2, 'Scale Figure 1/7', 'Mô hình tĩnh tỷ lệ chuẩn 1/7'),
(4, 1, 'One Piece', NULL),
(5, 1, 'Dragon Ball', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdoanchat`
--

CREATE TABLE `chitietdoanchat` (
  `MaTN` int(11) NOT NULL,
  `MaPC` int(11) DEFAULT NULL,
  `NguoiGui` varchar(50) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `NhanDienYDinh` varchar(100) DEFAULT NULL,
  `ThoiGianGui` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietdoanchat`
--

INSERT INTO `chitietdoanchat` (`MaTN`, `MaPC`, `NguoiGui`, `NoiDung`, `NhanDienYDinh`, `ThoiGianGui`) VALUES
(1, 1, 'User', 'Shop cho mình hỏi giá con Barbatos với', 'Hoi_Gia_Va_Ton_Kho', '2026-03-24 08:51:50'),
(2, 1, 'Bot', 'Dạ mẫu Barbatos Lupus Rex bản thường giá 1.250.000đ ạ.', 'Tra_Loi_Gia', '2026-03-24 08:51:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `MaDH` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `SoLuong` int(11) DEFAULT NULL CHECK (`SoLuong` > 0),
  `DonGiaBan` decimal(12,2) DEFAULT NULL CHECK (`DonGiaBan` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietgiohang`
--

CREATE TABLE `chitietgiohang` (
  `MaGH` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `SoLuong` int(11) DEFAULT NULL CHECK (`SoLuong` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietkhuyenmai`
--

CREATE TABLE `chitietkhuyenmai` (
  `MaKM` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `ChietKhau` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietkhuyenmai`
--

INSERT INTO `chitietkhuyenmai` (`MaKM`, `MaMoHinh`, `ChietKhau`) VALUES
(2, 3, 10.00),
(2, 4, 10.00),
(2, 5, 10.00),
(5, 5, 10.00),
(5, 7, 5.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietphieunhap`
--

CREATE TABLE `chitietphieunhap` (
  `MaPN` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `SoLuong` int(11) DEFAULT NULL CHECK (`SoLuong` > 0),
  `DonGiaNhap` decimal(12,2) DEFAULT NULL CHECK (`DonGiaNhap` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `MaDG` int(11) NOT NULL,
  `MaKH` int(11) DEFAULT NULL,
  `MaMoHinh` int(11) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `SoSao` int(11) DEFAULT NULL CHECK (`SoSao` >= 1 and `SoSao` <= 5),
  `ThoiGianDG` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmuc`
--

CREATE TABLE `danhmuc` (
  `MaDM` int(11) NOT NULL,
  `TenDM` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmuc`
--

INSERT INTO `danhmuc` (`MaDM`, `TenDM`, `MoTa`) VALUES
(1, 'Gundam (Gunpla)', 'Mô hình robot lắp ráp mecha'),
(2, 'Anime Figure', 'Mô hình tĩnh nhân vật Anime cao cấp'),
(3, 'Figure', 'Mô hình nhân vật tĩnh'),
(4, 'Model Kit', 'Mô hình lắp ráp');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

CREATE TABLE `donhang` (
  `MaDH` int(11) NOT NULL,
  `MaKH` int(11) DEFAULT NULL,
  `MaNV` int(11) DEFAULT NULL,
  `NgayLapDon` datetime DEFAULT NULL,
  `TongTien` decimal(12,2) DEFAULT NULL CHECK (`TongTien` >= 0),
  `ThanhTien` decimal(12,2) DEFAULT NULL CHECK (`ThanhTien` >= 0),
  `TrangThaiDonHang` varchar(50) DEFAULT NULL,
  `TenNguoiNhan` varchar(100) DEFAULT NULL,
  `SDTNguoiNhan` varchar(15) DEFAULT NULL,
  `DiaChiGiao` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `donhang`
--

INSERT INTO `donhang` (`MaDH`, `MaKH`, `MaNV`, `NgayLapDon`, `TongTien`, `ThanhTien`, `TrangThaiDonHang`, `TenNguoiNhan`, `SDTNguoiNhan`, `DiaChiGiao`) VALUES
(12345, NULL, NULL, '2026-03-20 00:00:00', NULL, NULL, 'Chờ xác nhận đóng gói', NULL, NULL, NULL),
(56789, NULL, NULL, '2026-03-22 00:00:00', NULL, NULL, 'Đang giao cho đơn vị vận chuyển', NULL, NULL, NULL),
(789251, NULL, NULL, '2026-03-23 00:00:00', NULL, NULL, 'Đã giao thành công', NULL, NULL, NULL),
(789252, 1, 1, '2026-03-30 10:30:00', 1700000.00, 1700000.00, 'Đã giao', 'Nguyễn Văn A', '0901234567', 'Số 1, Đường Cầu Giấy, Hà Nội'),
(789253, 2, 1, '2026-03-31 14:15:00', 5500000.00, 4950000.00, 'Đang xử lý', 'Trần Thị B', '0987654321', 'Quận 1, TP. Hồ Chí Minh'),
(789254, 1, 1, '2026-03-30 10:30:00', 1700000.00, 1700000.00, 'Đã giao', 'Nguyễn Văn A', '0901234567', 'Số 1, Đường Cầu Giấy, Hà Nội'),
(789255, 2, 1, '2026-03-31 14:15:00', 5500000.00, 4950000.00, 'Đang xử lý', 'Trần Thị B', '0987654321', 'Quận 1, TP. Hồ Chí Minh');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giohang`
--

CREATE TABLE `giohang` (
  `MaGH` int(11) NOT NULL,
  `MaKH` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `giohang`
--

INSERT INTO `giohang` (`MaGH`, `MaKH`) VALUES
(1, 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hangsanxuat`
--

CREATE TABLE `hangsanxuat` (
  `MaHSX` int(11) NOT NULL,
  `TenHSX` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hangsanxuat`
--

INSERT INTO `hangsanxuat` (`MaHSX`, `TenHSX`) VALUES
(1, 'Bandai Namco'),
(2, 'Megahouse'),
(3, 'Good Smile Company'),
(4, 'Bandai Spirits'),
(5, 'Banpresto'),
(6, 'MegaHouse');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khachhang`
--

CREATE TABLE `khachhang` (
  `MaKH` int(11) NOT NULL,
  `TenKH` varchar(100) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `MaTK` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `khachhang`
--

INSERT INTO `khachhang` (`MaKH`, `TenKH`, `Email`, `DiaChi`, `SDT`, `MaTK`) VALUES
(1, 'Nguyễn Văn Khách', 'khachhang1@gmail.com', '123 Đường Cầu Giấy, Hà Nội', '0901234567', 2),
(2, 'Nguyễn Văn A', 'nva@gmail.com', 'Số 1, Đường Cầu Giấy, Hà Nội', '0901234567', NULL),
(3, 'Trần Thị B', 'ttb@gmail.com', 'Quận 1, TP. Hồ Chí Minh', '0987654321', NULL),
(4, 'Nguyễn Văn A', 'nva@gmail.com', 'Số 1, Đường Cầu Giấy, Hà Nội', '0901234567', NULL),
(5, 'Trần Thị B', 'ttb@gmail.com', 'Quận 1, TP. Hồ Chí Minh', '0987654321', NULL),
(6, 'Nguyễn Văn A', 'nva@gmail.com', 'Số 1, Đường Cầu Giấy, Hà Nội', '0901234567', NULL),
(7, 'Trần Thị B', 'ttb@gmail.com', 'Quận 1, TP. Hồ Chí Minh', '0987654321', NULL),
(8, 'Nguyễn Văn A', 'nva@gmail.com', 'Số 1, Đường Cầu Giấy, Hà Nội', '0901234567', NULL),
(9, 'Trần Thị B', 'ttb@gmail.com', 'Quận 1, TP. Hồ Chí Minh', '0987654321', NULL),
(10, 'admin1111', NULL, NULL, NULL, 8);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khuyenmai`
--

CREATE TABLE `khuyenmai` (
  `MaKM` int(11) NOT NULL,
  `TenKM` varchar(100) NOT NULL,
  `ThoiGianBD` datetime DEFAULT NULL,
  `ThoiGianKT` datetime DEFAULT NULL,
  `LoaiKM` varchar(50) DEFAULT NULL,
  `DieuKien` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `khuyenmai`
--

INSERT INTO `khuyenmai` (`MaKM`, `TenKM`, `ThoiGianBD`, `ThoiGianKT`, `LoaiKM`, `DieuKien`) VALUES
(1, 'Siêu Sale Mùa Hè', '2026-06-01 00:00:00', '2026-06-30 00:00:00', 'Giảm 10%', 'Áp dụng cho mọi đơn hàng'),
(2, 'Flash Sale Miku', '2026-03-30 00:00:00', '2026-04-05 00:00:00', 'Giảm tiền mặt', 'Áp dụng cho dòng Figure Miku'),
(3, 'Siêu Sale Mùa Hè', '2026-06-01 00:00:00', '2026-06-30 00:00:00', 'Giảm 10%', 'Áp dụng cho mọi đơn hàng'),
(4, 'Flash Sale Miku', '2026-03-30 00:00:00', '2026-04-05 00:00:00', 'Giảm tiền mặt', 'Áp dụng cho dòng Figure Miku'),
(5, 'Siêu Sale Mùa Hè', '2026-04-01 00:00:00', '2026-06-30 00:00:00', 'Giảm 10%', 'Áp dụng cho mọi đơn hàng'),
(6, 'Flash Sale Miku', '2026-03-30 00:00:00', '2026-04-05 00:00:00', 'Giảm tiền mặt', 'Áp dụng cho dòng Figure Miku');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsublockchain`
--

CREATE TABLE `lichsublockchain` (
  `MaBanGhi` int(11) NOT NULL,
  `MaMoHinhVL` int(11) DEFAULT NULL,
  `DiaChiSmartContract` varchar(255) NOT NULL,
  `MaToken` varchar(100) NOT NULL,
  `MaGiaoDich` varchar(255) NOT NULL,
  `LinkQR` varchar(255) DEFAULT NULL,
  `ThoiGianGhiNhan` datetime DEFAULT NULL,
  `LoaiSuKien` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mohinh`
--

CREATE TABLE `mohinh` (
  `MaMoHinh` int(11) NOT NULL,
  `TenMH` varchar(255) NOT NULL,
  `MaHSX` int(11) DEFAULT NULL,
  `MaDM` int(11) DEFAULT NULL,
  `MaChiTietDM` int(11) DEFAULT NULL,
  `ChatLieu` varchar(100) DEFAULT NULL,
  `DonGia` decimal(12,2) NOT NULL CHECK (`DonGia` >= 0),
  `TrangThai` varchar(50) DEFAULT NULL,
  `ThongTinChiTiet` text DEFAULT NULL,
  `AnhDaiDien` varchar(255) DEFAULT NULL,
  `KichThuoc` varchar(50) DEFAULT NULL,
  `NgayPhatHanh` date DEFAULT NULL,
  `LoaiHinhBan` varchar(50) DEFAULT NULL,
  `TienCocToiThieu` decimal(12,2) DEFAULT NULL CHECK (`TienCocToiThieu` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mohinh`
--

INSERT INTO `mohinh` (`MaMoHinh`, `TenMH`, `MaHSX`, `MaDM`, `MaChiTietDM`, `ChatLieu`, `DonGia`, `TrangThai`, `ThongTinChiTiet`, `AnhDaiDien`, `KichThuoc`, `NgayPhatHanh`, `LoaiHinhBan`, `TienCocToiThieu`) VALUES
(1, 'Gundam Barbatos Lupus Rex', 1, 1, 1, 'Nhựa PS, ABS', 1250000.00, 'Đang bán', 'Gundam form cuối của Mikazuki Augus trong Iron-Blooded Orphans', NULL, NULL, NULL, NULL, NULL),
(2, 'Figure Gojo Satoru - Hollow Purple', 2, 2, 3, 'PVC, ABS', 3500000.00, 'Đang bán', 'Figure Gojo thi triển chiêu thức Tử từ Jujutsu Kaisen', NULL, NULL, NULL, NULL, NULL),
(3, 'Monkey D. Luffy - Gear 5 Special Edition', 1, 1, 1, 'Nhựa PVC cao cấp', 1200000.00, 'Sẵn hàng', 'Mô hình Luffy trạng thái Thức tỉnh Gear 5 cực đẹp từ series One Piece.', NULL, '20cm', NULL, 'Có sẵn', NULL),
(4, 'Roronoa Zoro - Wano Country Katanas', 2, 1, 1, 'PVC/ABS', 850000.00, 'Sẵn hàng', 'Zoro tam kiếm phái tại vùng đất Wano.', NULL, '18cm', NULL, 'Có sẵn', NULL),
(5, 'Monkey D. Luffy - Gear 4 Special Edition', NULL, NULL, NULL, 'Nhựa PVC cao cấp', 900000.00, 'Sẵn hàng', 'Mô hình Luffy form Gear 5 siêu ngầu, chi tiết sắc nét.', NULL, NULL, NULL, NULL, NULL),
(6, 'Mô hình Gundam Barbatos Lupus Rex', NULL, NULL, NULL, 'Nhựa ABS, PVC', 850000.00, 'Sẵn hàng', 'Gundam Barbatos tỷ lệ 1/144 cực nét, khớp nối linh hoạt.', NULL, NULL, NULL, NULL, NULL),
(7, 'Roronoa Zoro - Phiên bản Wano Kuni', NULL, NULL, NULL, 'Nhựa PVC', 500000.00, 'Sẵn hàng', 'Mô hình Zoro vác kiếm cực chất trong Arc Wano.', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhacungcap`
--

CREATE TABLE `nhacungcap` (
  `MaNCC` int(11) NOT NULL,
  `TenNCC` varchar(100) NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhanvien`
--

CREATE TABLE `nhanvien` (
  `MaNV` int(11) NOT NULL,
  `TenNV` varchar(100) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `MaTK` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nhanvien`
--

INSERT INTO `nhanvien` (`MaNV`, `TenNV`, `Email`, `DiaChi`, `SDT`, `MaTK`) VALUES
(1, 'Nguyễn Thế Phong', 'phong.nv@gmail.com', 'Hà Đông, Hà Nội', '0911222333', 2),
(2, 'Nguyễn Thế Phong', 'phong.nv@gmail.com', 'Hà Đông, Hà Nội', '0911222333', 2),
(3, 'Nguyễn Thế Phong', 'phong.nv@gmail.com', 'Hà Đông, Hà Nội', '0911222333', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phanloai`
--

CREATE TABLE `phanloai` (
  `MaPhanLoai` int(11) NOT NULL,
  `ChiTietPhanLoai` varchar(100) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `DonGia` decimal(12,2) NOT NULL CHECK (`DonGia` >= 0),
  `SoLuong` int(11) DEFAULT 0 CHECK (`SoLuong` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phanloai`
--

INSERT INTO `phanloai` (`MaPhanLoai`, `ChiTietPhanLoai`, `MaMoHinh`, `DonGia`, `SoLuong`) VALUES
(1, 'Bản Thường (Không kèm Base)', 1, 1250000.00, 15),
(2, 'Bản Đặc Biệt (Kèm Action Base)', 1, 1450000.00, 5),
(3, 'Bản Tiêu Chuẩn', 2, 3500000.00, 2),
(4, 'Bản Tiêu Chuẩn', 1, 1200000.00, 10),
(5, 'Bản Premium LED', 1, 1850000.00, 3),
(6, 'Bản Nobox', 1, 950000.00, 5),
(7, 'Mặc định', 2, 850000.00, 15);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phienchat`
--

CREATE TABLE `phienchat` (
  `MaPC` int(11) NOT NULL,
  `MaKH` int(11) DEFAULT NULL,
  `ThoiGianBD` datetime DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phienchat`
--

INSERT INTO `phienchat` (`MaPC`, `MaKH`, `ThoiGianBD`, `TrangThai`) VALUES
(1, 1, '2026-03-24 08:51:50', 'Đã kết thúc');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phieunhap`
--

CREATE TABLE `phieunhap` (
  `MaPN` int(11) NOT NULL,
  `NgayNhap` datetime DEFAULT NULL,
  `MaNV` int(11) DEFAULT NULL,
  `MaNCC` int(11) DEFAULT NULL,
  `TongTienNhap` decimal(12,2) DEFAULT NULL CHECK (`TongTienNhap` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phuongthucthanhtoan`
--

CREATE TABLE `phuongthucthanhtoan` (
  `MaPT` int(11) NOT NULL,
  `TenPhuongThuc` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quyen`
--

CREATE TABLE `quyen` (
  `MaQuyen` int(11) NOT NULL,
  `TenQuyen` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quyen`
--

INSERT INTO `quyen` (`MaQuyen`, `TenQuyen`) VALUES
(1, 'Quản trị viên'),
(2, 'Khách hàng');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanphamvatly`
--

CREATE TABLE `sanphamvatly` (
  `MaMoHinhVL` int(11) NOT NULL,
  `MaMoHinh` int(11) DEFAULT NULL,
  `MaVach_Serial` varchar(100) NOT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `Is_Minted` tinyint(1) DEFAULT 0,
  `MaDH` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoan`
--

CREATE TABLE `taikhoan` (
  `MaTK` int(11) NOT NULL,
  `TenDN` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `MaQuyen` int(11) DEFAULT NULL,
  `AnhDaiDien` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`MaTK`, `TenDN`, `MatKhau`, `Email`, `MaQuyen`, `AnhDaiDien`) VALUES
(1, 'admin_shop', '123456', 'admin@shopmohinh.com', 1, NULL),
(2, 'khachhang_01', '123456', 'khachhang1@gmail.com', 2, NULL),
(8, 'admin1111', '$2b$10$dVkenKS05CjK50Pq3Ysnu.Fi3sveslSl9dBOGE9D.UOpdobNa0yA.', 'toan@gmail.com', 2, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanhtoan`
--

CREATE TABLE `thanhtoan` (
  `MaTT` int(11) NOT NULL,
  `MaPT` int(11) DEFAULT NULL,
  `MaDH` int(11) DEFAULT NULL,
  `NgayThanhToan` datetime DEFAULT NULL,
  `SoTienGiaoDich` decimal(12,2) DEFAULT NULL,
  `LoaiGiaoDich` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tintuc`
--

CREATE TABLE `tintuc` (
  `MaTT` int(11) NOT NULL,
  `NoiDung` text DEFAULT NULL,
  `MaNV` int(11) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vanchuyen`
--

CREATE TABLE `vanchuyen` (
  `MaVC` int(11) NOT NULL,
  `MaDH` int(11) DEFAULT NULL,
  `ThongTinVC` varchar(255) DEFAULT NULL,
  `DonViVC` varchar(100) DEFAULT NULL,
  `PhiVanChuyen` decimal(12,2) DEFAULT NULL CHECK (`PhiVanChuyen` >= 0),
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `anhmohinh`
--
ALTER TABLE `anhmohinh`
  ADD PRIMARY KEY (`MaAnh`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `anhtintuc`
--
ALTER TABLE `anhtintuc`
  ADD PRIMARY KEY (`MaAnh`),
  ADD KEY `MaTT` (`MaTT`);

--
-- Chỉ mục cho bảng `baohanh`
--
ALTER TABLE `baohanh`
  ADD PRIMARY KEY (`MaPBH`),
  ADD KEY `MaDH` (`MaDH`);

--
-- Chỉ mục cho bảng `chitietbaohanh`
--
ALTER TABLE `chitietbaohanh`
  ADD PRIMARY KEY (`MaPBH`,`MaMoHinh`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `chitietdanhmuc`
--
ALTER TABLE `chitietdanhmuc`
  ADD PRIMARY KEY (`MaChiTietDM`),
  ADD KEY `MaDM` (`MaDM`);

--
-- Chỉ mục cho bảng `chitietdoanchat`
--
ALTER TABLE `chitietdoanchat`
  ADD PRIMARY KEY (`MaTN`),
  ADD KEY `MaPC` (`MaPC`);

--
-- Chỉ mục cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`MaDH`,`MaMoHinh`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `chitietgiohang`
--
ALTER TABLE `chitietgiohang`
  ADD PRIMARY KEY (`MaGH`,`MaMoHinh`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `chitietkhuyenmai`
--
ALTER TABLE `chitietkhuyenmai`
  ADD PRIMARY KEY (`MaKM`,`MaMoHinh`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  ADD PRIMARY KEY (`MaPN`,`MaMoHinh`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`MaDG`),
  ADD KEY `MaKH` (`MaKH`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`MaDM`);

--
-- Chỉ mục cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`MaDH`),
  ADD KEY `MaKH` (`MaKH`),
  ADD KEY `MaNV` (`MaNV`);

--
-- Chỉ mục cho bảng `giohang`
--
ALTER TABLE `giohang`
  ADD PRIMARY KEY (`MaGH`),
  ADD KEY `MaKH` (`MaKH`);

--
-- Chỉ mục cho bảng `hangsanxuat`
--
ALTER TABLE `hangsanxuat`
  ADD PRIMARY KEY (`MaHSX`);

--
-- Chỉ mục cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  ADD PRIMARY KEY (`MaKH`),
  ADD KEY `MaTK` (`MaTK`);

--
-- Chỉ mục cho bảng `khuyenmai`
--
ALTER TABLE `khuyenmai`
  ADD PRIMARY KEY (`MaKM`);

--
-- Chỉ mục cho bảng `lichsublockchain`
--
ALTER TABLE `lichsublockchain`
  ADD PRIMARY KEY (`MaBanGhi`),
  ADD UNIQUE KEY `MaGiaoDich` (`MaGiaoDich`),
  ADD KEY `MaMoHinhVL` (`MaMoHinhVL`);

--
-- Chỉ mục cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  ADD PRIMARY KEY (`MaMoHinh`),
  ADD KEY `MaHSX` (`MaHSX`),
  ADD KEY `MaDM` (`MaDM`),
  ADD KEY `MaChiTietDM` (`MaChiTietDM`);

--
-- Chỉ mục cho bảng `nhacungcap`
--
ALTER TABLE `nhacungcap`
  ADD PRIMARY KEY (`MaNCC`);

--
-- Chỉ mục cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD PRIMARY KEY (`MaNV`),
  ADD KEY `MaTK` (`MaTK`);

--
-- Chỉ mục cho bảng `phanloai`
--
ALTER TABLE `phanloai`
  ADD PRIMARY KEY (`MaPhanLoai`),
  ADD KEY `MaMoHinh` (`MaMoHinh`);

--
-- Chỉ mục cho bảng `phienchat`
--
ALTER TABLE `phienchat`
  ADD PRIMARY KEY (`MaPC`),
  ADD KEY `MaKH` (`MaKH`);

--
-- Chỉ mục cho bảng `phieunhap`
--
ALTER TABLE `phieunhap`
  ADD PRIMARY KEY (`MaPN`),
  ADD KEY `MaNV` (`MaNV`),
  ADD KEY `MaNCC` (`MaNCC`);

--
-- Chỉ mục cho bảng `phuongthucthanhtoan`
--
ALTER TABLE `phuongthucthanhtoan`
  ADD PRIMARY KEY (`MaPT`);

--
-- Chỉ mục cho bảng `quyen`
--
ALTER TABLE `quyen`
  ADD PRIMARY KEY (`MaQuyen`);

--
-- Chỉ mục cho bảng `sanphamvatly`
--
ALTER TABLE `sanphamvatly`
  ADD PRIMARY KEY (`MaMoHinhVL`),
  ADD UNIQUE KEY `MaVach_Serial` (`MaVach_Serial`),
  ADD KEY `MaMoHinh` (`MaMoHinh`),
  ADD KEY `MaDH` (`MaDH`);

--
-- Chỉ mục cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`MaTK`),
  ADD KEY `MaQuyen` (`MaQuyen`);

--
-- Chỉ mục cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD PRIMARY KEY (`MaTT`),
  ADD KEY `MaPT` (`MaPT`),
  ADD KEY `MaDH` (`MaDH`);

--
-- Chỉ mục cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  ADD PRIMARY KEY (`MaTT`),
  ADD KEY `MaNV` (`MaNV`);

--
-- Chỉ mục cho bảng `vanchuyen`
--
ALTER TABLE `vanchuyen`
  ADD PRIMARY KEY (`MaVC`),
  ADD KEY `MaDH` (`MaDH`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `anhmohinh`
--
ALTER TABLE `anhmohinh`
  MODIFY `MaAnh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `anhtintuc`
--
ALTER TABLE `anhtintuc`
  MODIFY `MaAnh` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `baohanh`
--
ALTER TABLE `baohanh`
  MODIFY `MaPBH` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chitietdanhmuc`
--
ALTER TABLE `chitietdanhmuc`
  MODIFY `MaChiTietDM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `chitietdoanchat`
--
ALTER TABLE `chitietdoanchat`
  MODIFY `MaTN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `MaDG` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `MaDM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `MaDH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=789256;

--
-- AUTO_INCREMENT cho bảng `giohang`
--
ALTER TABLE `giohang`
  MODIFY `MaGH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `hangsanxuat`
--
ALTER TABLE `hangsanxuat`
  MODIFY `MaHSX` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  MODIFY `MaKH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `khuyenmai`
--
ALTER TABLE `khuyenmai`
  MODIFY `MaKM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `lichsublockchain`
--
ALTER TABLE `lichsublockchain`
  MODIFY `MaBanGhi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  MODIFY `MaMoHinh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `nhacungcap`
--
ALTER TABLE `nhacungcap`
  MODIFY `MaNCC` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  MODIFY `MaNV` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `phanloai`
--
ALTER TABLE `phanloai`
  MODIFY `MaPhanLoai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `phienchat`
--
ALTER TABLE `phienchat`
  MODIFY `MaPC` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `phieunhap`
--
ALTER TABLE `phieunhap`
  MODIFY `MaPN` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `phuongthucthanhtoan`
--
ALTER TABLE `phuongthucthanhtoan`
  MODIFY `MaPT` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `quyen`
--
ALTER TABLE `quyen`
  MODIFY `MaQuyen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `sanphamvatly`
--
ALTER TABLE `sanphamvatly`
  MODIFY `MaMoHinhVL` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  MODIFY `MaTK` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `MaTT` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  MODIFY `MaTT` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vanchuyen`
--
ALTER TABLE `vanchuyen`
  MODIFY `MaVC` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `anhmohinh`
--
ALTER TABLE `anhmohinh`
  ADD CONSTRAINT `anhmohinh_ibfk_1` FOREIGN KEY (`MaMoHinh`) REFERENCES `mohinh` (`MaMoHinh`);

--
-- Các ràng buộc cho bảng `anhtintuc`
--
ALTER TABLE `anhtintuc`
  ADD CONSTRAINT `anhtintuc_ibfk_1` FOREIGN KEY (`MaTT`) REFERENCES `tintuc` (`MaTT`);

--
-- Các ràng buộc cho bảng `baohanh`
--
ALTER TABLE `baohanh`
  ADD CONSTRAINT `baohanh_ibfk_1` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`);

--
-- Các ràng buộc cho bảng `chitietbaohanh`
--
ALTER TABLE `chitietbaohanh`
  ADD CONSTRAINT `chitietbaohanh_ibfk_1` FOREIGN KEY (`MaPBH`) REFERENCES `baohanh` (`MaPBH`),
  ADD CONSTRAINT `chitietbaohanh_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `chitietdanhmuc`
--
ALTER TABLE `chitietdanhmuc`
  ADD CONSTRAINT `chitietdanhmuc_ibfk_1` FOREIGN KEY (`MaDM`) REFERENCES `danhmuc` (`MaDM`);

--
-- Các ràng buộc cho bảng `chitietdoanchat`
--
ALTER TABLE `chitietdoanchat`
  ADD CONSTRAINT `chitietdoanchat_ibfk_1` FOREIGN KEY (`MaPC`) REFERENCES `phienchat` (`MaPC`);

--
-- Các ràng buộc cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`),
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `chitietgiohang`
--
ALTER TABLE `chitietgiohang`
  ADD CONSTRAINT `chitietgiohang_ibfk_1` FOREIGN KEY (`MaGH`) REFERENCES `giohang` (`MaGH`),
  ADD CONSTRAINT `chitietgiohang_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `chitietkhuyenmai`
--
ALTER TABLE `chitietkhuyenmai`
  ADD CONSTRAINT `chitietkhuyenmai_ibfk_1` FOREIGN KEY (`MaKM`) REFERENCES `khuyenmai` (`MaKM`),
  ADD CONSTRAINT `chitietkhuyenmai_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `mohinh` (`MaMoHinh`);

--
-- Các ràng buộc cho bảng `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  ADD CONSTRAINT `chitietphieunhap_ibfk_1` FOREIGN KEY (`MaPN`) REFERENCES `phieunhap` (`MaPN`),
  ADD CONSTRAINT `chitietphieunhap_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `mohinh` (`MaMoHinh`);

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  ADD CONSTRAINT `donhang_ibfk_2` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`);

--
-- Các ràng buộc cho bảng `giohang`
--
ALTER TABLE `giohang`
  ADD CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`);

--
-- Các ràng buộc cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  ADD CONSTRAINT `khachhang_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`);

--
-- Các ràng buộc cho bảng `lichsublockchain`
--
ALTER TABLE `lichsublockchain`
  ADD CONSTRAINT `lichsublockchain_ibfk_1` FOREIGN KEY (`MaMoHinhVL`) REFERENCES `sanphamvatly` (`MaMoHinhVL`);

--
-- Các ràng buộc cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  ADD CONSTRAINT `mohinh_ibfk_1` FOREIGN KEY (`MaHSX`) REFERENCES `hangsanxuat` (`MaHSX`),
  ADD CONSTRAINT `mohinh_ibfk_2` FOREIGN KEY (`MaDM`) REFERENCES `danhmuc` (`MaDM`),
  ADD CONSTRAINT `mohinh_ibfk_3` FOREIGN KEY (`MaChiTietDM`) REFERENCES `chitietdanhmuc` (`MaChiTietDM`);

--
-- Các ràng buộc cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD CONSTRAINT `nhanvien_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`);

--
-- Các ràng buộc cho bảng `phanloai`
--
ALTER TABLE `phanloai`
  ADD CONSTRAINT `phanloai_ibfk_1` FOREIGN KEY (`MaMoHinh`) REFERENCES `mohinh` (`MaMoHinh`);

--
-- Các ràng buộc cho bảng `phienchat`
--
ALTER TABLE `phienchat`
  ADD CONSTRAINT `phienchat_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`);

--
-- Các ràng buộc cho bảng `phieunhap`
--
ALTER TABLE `phieunhap`
  ADD CONSTRAINT `phieunhap_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  ADD CONSTRAINT `phieunhap_ibfk_2` FOREIGN KEY (`MaNCC`) REFERENCES `nhacungcap` (`MaNCC`);

--
-- Các ràng buộc cho bảng `sanphamvatly`
--
ALTER TABLE `sanphamvatly`
  ADD CONSTRAINT `sanphamvatly_ibfk_1` FOREIGN KEY (`MaMoHinh`) REFERENCES `mohinh` (`MaMoHinh`),
  ADD CONSTRAINT `sanphamvatly_ibfk_2` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`);

--
-- Các ràng buộc cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`MaQuyen`) REFERENCES `quyen` (`MaQuyen`);

--
-- Các ràng buộc cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD CONSTRAINT `thanhtoan_ibfk_1` FOREIGN KEY (`MaPT`) REFERENCES `phuongthucthanhtoan` (`MaPT`),
  ADD CONSTRAINT `thanhtoan_ibfk_2` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`);

--
-- Các ràng buộc cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  ADD CONSTRAINT `tintuc_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`);

--
-- Các ràng buộc cho bảng `vanchuyen`
--
ALTER TABLE `vanchuyen`
  ADD CONSTRAINT `vanchuyen_ibfk_1` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
