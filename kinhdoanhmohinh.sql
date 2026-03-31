-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 31, 2026 lúc 07:50 AM
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
(1, '1_1.jpeg', 1),
(2, '1_2.jpeg', 1),
(3, '1_3.jpeg', 1),
(4, '1_4.jpeg', 1),
(5, '1_5.jpeg', 1),
(6, '2_1.jpeg', 2),
(7, '2_2.jpeg', 2),
(8, '2_3.jpeg', 2),
(9, '2_4.jpeg', 2),
(10, '3_1.jpeg', 3),
(11, '3_2.jpeg', 3),
(12, '3_3.jpeg', 3),
(13, '3_4.jpeg', 3),
(14, '3_5.jpeg', 3),
(15, '3_6.jpeg', 3),
(16, '4_1.jpeg', 4),
(17, '4_2.jpeg', 4),
(18, '4_3.jpeg', 4),
(19, '4_4.jpeg', 4),
(20, '4_5.jpeg', 4),
(21, '4_6.jpeg', 4),
(22, '4_7.jpeg', 4),
(23, '5_1.jpeg', 5),
(24, '5_2.jpeg', 5),
(25, '5_3.jpeg', 5),
(26, '5_4.jpeg', 5),
(27, '5_5.jpeg', 5),
(28, '5_6.jpeg', 5);

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
(1, 1, 'Gameprize', NULL),
(2, 1, 'Mô hình scale', NULL),
(3, 1, 'Mô hình Chibi', NULL),
(4, 1, 'Mô hình lắp ráp', NULL),
(5, 1, 'Action figure', NULL),
(6, 2, 'Nedoroid Nam', NULL),
(7, 2, 'Nendoroid nữ', NULL),
(8, 4, 'Pre-order 2026', NULL),
(9, 4, 'Pre-order 2027', NULL);

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

--
-- Đang đổ dữ liệu cho bảng `chitietdonhang`
--

INSERT INTO `chitietdonhang` (`MaDH`, `MaMoHinh`, `SoLuong`, `DonGiaBan`) VALUES
(1, 6, 1, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietgiohang`
--

CREATE TABLE `chitietgiohang` (
  `MaGH` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `SoLuong` int(11) DEFAULT NULL CHECK (`SoLuong` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietgiohang`
--

INSERT INTO `chitietgiohang` (`MaGH`, `MaMoHinh`, `SoLuong`) VALUES
(1, 4, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietkhuyenmai`
--

CREATE TABLE `chitietkhuyenmai` (
  `MaKM` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `ChietKhau` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Cấu trúc bảng cho bảng `chitiettrangthai`
--

CREATE TABLE `chitiettrangthai` (
  `MaDH` int(11) NOT NULL,
  `MaTrangThai` int(11) NOT NULL,
  `Thoigian` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitiettrangthai`
--

INSERT INTO `chitiettrangthai` (`MaDH`, `MaTrangThai`, `Thoigian`) VALUES
(1, 1, '2026-03-31 11:14:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietyeuthich`
--

CREATE TABLE `chitietyeuthich` (
  `MaYeuThich` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL
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
(1, 'Mô hình', NULL),
(2, 'Nendoroid', NULL),
(3, 'Nhồi bông', NULL),
(4, 'PRE-ORDER', NULL),
(5, 'Phụ kiện khác', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucyeuthich`
--

CREATE TABLE `danhmucyeuthich` (
  `MaYeuThich` int(11) NOT NULL,
  `MaKH` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 1, NULL, '2026-03-31 11:14:01', 1500000.00, NULL, 'Chờ Duyệt', 'Phùng Đức Thắng', '0336384289', 'HP');

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
(1, 1);

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
(1, 'GoodSmileCompany'),
(2, 'Gift+'),
(3, 'Furyu'),
(4, 'SEGA'),
(5, 'BANDAI'),
(6, 'Max Factory'),
(7, 'Hobby stock');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khachhang`
--

CREATE TABLE `khachhang` (
  `MaKH` int(11) NOT NULL,
  `TenKH` varchar(100) NOT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `MaTK` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `khachhang`
--

INSERT INTO `khachhang` (`MaKH`, `TenKH`, `DiaChi`, `SDT`, `MaTK`) VALUES
(1, 'Phùng Đức Thắng', 'HP', '0336384289', 1);

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
(1, 'Mô Hình Nendoroid Lancer/Mélusine - Nendoroid 2190 Fate/Grand Order', 1, 2, 7, 'PVC', 1700000.00, 'Còn Hàng', ' ', '1_1.jpeg', '10 cm', NULL, 'Bình thường', 1000000.00),
(2, 'Mô Hình Ruler/Mélusine - Fate/Grand Order Ver 1/6 Scale Figure Chính Hãng (GSC)', 1, 1, 2, 'PVC', 3900000.00, 'Còn Hàng', ' ', '2_1.jpeg', '10 cm', NULL, 'Bình thường', 1500000.00),
(3, 'Mô Hình Hatsune Miku - Hatsune Miku EXPO 10th Anniversary Ver. - 1/7 Scale Figure Chính Hãng (Hobby Stock)', 7, 1, 2, 'PVC', 5500000.00, 'Còn Hàng', ' ', '3_1.jpeg', '25,5 cm', NULL, 'Có sẵn', 1500000.00),
(4, 'Mô Hình Hatsune Miku Happy 16th Birthday Ver. 1/7 Figure (GSC)', 1, 1, 2, 'PVC', 5400000.00, 'Còn Hàng', ' ', '4_1.jpeg', '31 cm', NULL, 'Có sẵn', 2000000.00),
(5, 'Mô hình Hatsune Miku - Sakura Hanami Outfit Ver Scale 1/6 Figure Chính Hãng (GSC)', 1, 1, 2, 'PVC', 5500000.00, 'Còn Hàng', ' ', '5_1.jpeg', '28 cm', NULL, 'Có sẵn', 2000000.00);

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
  `DiaChi` varchar(255) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `MaTK` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 'NONE', 1, 1700000.00, 5),
(2, 'NONE', 2, 3900000.00, 5),
(3, 'NONE', 3, 5500000.00, 5),
(4, 'NONE', 4, 5400000.00, 5),
(5, 'NONE', 5, 5500000.00, 5),
(6, 'Hộp xấu', 1, 1500000.00, 2);

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
(1, 'Quản lý'),
(2, 'Nhân viên bán hàng'),
(3, 'Khách hàng');

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
(1, 'thangphung', '$2b$10$ZcapazA31TUXal2kOkpWEOqAxdQ2nF4yNDpbqzsgE5bXMb/OMTo7C', 'thang@gmail.com', 3, 'avatar_TK1_1774929370442.png');

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
-- Cấu trúc bảng cho bảng `trangthai`
--

CREATE TABLE `trangthai` (
  `MaTrangThai` int(11) NOT NULL,
  `TenTrangThai` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `trangthai`
--

INSERT INTO `trangthai` (`MaTrangThai`, `TenTrangThai`) VALUES
(1, 'Chờ Duyệt'),
(2, 'Chờ xử lý'),
(3, 'Đang vận chuyển'),
(4, 'Đã giao'),
(5, 'Đã hủy');

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
-- Chỉ mục cho bảng `chitiettrangthai`
--
ALTER TABLE `chitiettrangthai`
  ADD PRIMARY KEY (`MaDH`,`MaTrangThai`),
  ADD KEY `MaTrangThai` (`MaTrangThai`);

--
-- Chỉ mục cho bảng `chitietyeuthich`
--
ALTER TABLE `chitietyeuthich`
  ADD PRIMARY KEY (`MaYeuThich`,`MaMoHinh`),
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
-- Chỉ mục cho bảng `danhmucyeuthich`
--
ALTER TABLE `danhmucyeuthich`
  ADD PRIMARY KEY (`MaYeuThich`),
  ADD KEY `MaKH` (`MaKH`);

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
-- Chỉ mục cho bảng `trangthai`
--
ALTER TABLE `trangthai`
  ADD PRIMARY KEY (`MaTrangThai`);

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
  MODIFY `MaAnh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
  MODIFY `MaChiTietDM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `chitietdoanchat`
--
ALTER TABLE `chitietdoanchat`
  MODIFY `MaTN` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `MaDG` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `MaDM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `danhmucyeuthich`
--
ALTER TABLE `danhmucyeuthich`
  MODIFY `MaYeuThich` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `MaDH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `giohang`
--
ALTER TABLE `giohang`
  MODIFY `MaGH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `hangsanxuat`
--
ALTER TABLE `hangsanxuat`
  MODIFY `MaHSX` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  MODIFY `MaKH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `khuyenmai`
--
ALTER TABLE `khuyenmai`
  MODIFY `MaKM` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lichsublockchain`
--
ALTER TABLE `lichsublockchain`
  MODIFY `MaBanGhi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  MODIFY `MaMoHinh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `nhacungcap`
--
ALTER TABLE `nhacungcap`
  MODIFY `MaNCC` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  MODIFY `MaNV` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `phanloai`
--
ALTER TABLE `phanloai`
  MODIFY `MaPhanLoai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `phienchat`
--
ALTER TABLE `phienchat`
  MODIFY `MaPC` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `MaQuyen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `sanphamvatly`
--
ALTER TABLE `sanphamvatly`
  MODIFY `MaMoHinhVL` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  MODIFY `MaTK` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- AUTO_INCREMENT cho bảng `trangthai`
--
ALTER TABLE `trangthai`
  MODIFY `MaTrangThai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- Các ràng buộc cho bảng `chitiettrangthai`
--
ALTER TABLE `chitiettrangthai`
  ADD CONSTRAINT `chitiettrangthai_ibfk_1` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`),
  ADD CONSTRAINT `chitiettrangthai_ibfk_2` FOREIGN KEY (`MaTrangThai`) REFERENCES `trangthai` (`MaTrangThai`);

--
-- Các ràng buộc cho bảng `chitietyeuthich`
--
ALTER TABLE `chitietyeuthich`
  ADD CONSTRAINT `chitietyeuthich_ibfk_1` FOREIGN KEY (`MaYeuThich`) REFERENCES `danhmucyeuthich` (`MaYeuThich`),
  ADD CONSTRAINT `chitietyeuthich_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `danhmucyeuthich`
--
ALTER TABLE `danhmucyeuthich`
  ADD CONSTRAINT `danhmucyeuthich_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`);

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
