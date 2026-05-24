-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 26, 2026 lúc 11:10 AM
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
(28, '5_6.jpeg', 5),
(29, '6_1.jpeg', 6),
(30, '6_2.jpeg', 6),
(31, '6_3.jpeg', 6),
(32, '6_4.jpeg', 6),
(33, '1776874512370-534480749.png', 7),
(34, '1776874512375-988433345.png', 7),
(35, '1776874512382-220631516.png', 7),
(42, '1776875133214-179650335.png', 10),
(43, '1776875133222-607412315.png', 10),
(44, '1776875133226-488718843.png', 10),
(45, '1776876025269-523430965.png', 11),
(46, '1776876025275-804579443.png', 11),
(47, '1776876025280-79938812.png', 11),
(48, '1776941560112-455044755.png', 11),
(50, '1776941582551-96092868.png', 11),
(51, '1777114516730-788651980.jpg', 12),
(52, '1777193159099-264871611.jpg', 13),
(53, '1777193159103-414246568.jpg', 13),
(54, '1777193159104-755348314.jpg', 13),
(55, '1777193159105-772158674.jpg', 13),
(56, '1777193159106-954219215.jpg', 13),
(57, '1777193159107-86199064.jpg', 13),
(58, '1777193159108-394082728.jpg', 13),
(59, '1777193159110-517812724.jpg', 13),
(60, '1777193159111-536212970.jpg', 13),
(61, '1777193159113-218633798.jpg', 13),
(62, '1777193715789-847652579.jpg', 14),
(63, '1777193715790-945176788.jpg', 14),
(64, '1777193715790-670510830.jpg', 14),
(65, '1777193715791-339233523.jpg', 14),
(66, '1777193715792-202857114.jpg', 14),
(67, '1777193715793-113520797.jpg', 14),
(68, '1777193715795-718364906.jpg', 14),
(69, '1777193715796-825008330.jpg', 14),
(70, '1777193715799-117833314.jpg', 14),
(71, '1777193715800-519914899.jpg', 14);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `anhtintuc`
--

CREATE TABLE `anhtintuc` (
  `MaAnh` int(11) NOT NULL,
  `LinkAnh` varchar(255) DEFAULT NULL,
  `MaTT` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `anhtintuc`
--

INSERT INTO `anhtintuc` (`MaAnh`, `LinkAnh`, `MaTT`) VALUES
(1, 'https://shopkeycap.com/wp-content/uploads/2021/06/Perfect-Grade-Unleashed-RX-78-2-ft.png', 1),
(2, 'https://file.hstatic.net/1000231532/file/20220206-choi-nendoroid-sao-cho-dung_nshop-hobby11_d577ca1b2adc48418e80fed2291b7c81.jpg', 2),
(3, 'https://i.ytimg.com/vi/Y3BAQabxcTw/maxresdefault.jpg', 3),
(4, 'https://file.hstatic.net/200000462939/article/bao-quan-mo-hinh-pvc_4215ac9e512548edb7ecc62e4337f9ac.jpg', 4),
(5, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8EdqfhHO1MmqYvBjqyF537FJ0LAeWwQqmEQ&s', 5),
(6, 'https://product.hstatic.net/200000462939/product/4399653_7b748166b9c6458eb8c6a1450c3469f6_master.jpeg', 6),
(7, 'https://pos.nvncdn.com/f625c0-33854/art/20250906_DjoKD7Js.jpeg?v=1757140733', 7),
(8, 'https://bizweb.dktcdn.net/100/503/392/products/1-2830abed-41d0-4b6a-a6fc-4b71f827b943.jpg?v=1706807367323', 8),
(9, 'https://khomohinh.com/wp-content/uploads/2023/01/cach-phan-biet-mo-hinh-real-fake-thumb.jpg', 9),
(10, 'https://preview.redd.it/hg-1-144-tx-ff104-gundam-alyzeus-announced-release-date-v0-ive5786le2hg1.jpeg?width=640&crop=smart&auto=webp&s=066fda75065791f116de60557f3afa720aeecef9', 10),
(11, 'https://noithatac.vn/wp-content/uploads/2025/04/tu-trung-bay-mo-hinh-cao-cap-TTB019.jpg', 11),
(12, 'https://preview.redd.it/does-myethos-ever-remake-or-rerelease-figures-my-grail-is-v0-g1ukmmd1m6z41.jpg?width=640&crop=smart&auto=webp&s=d171f1372ef18298e8dfd43c279909aa083b0d7f', 12),
(13, 'https://khomohinh.com/wp-content/uploads/2022/12/top-10-hang-figure-noi-tieng-chat-luong-nhat-o-nhat-ban-hien-nay-1.jpg', 13);

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
(8, 4, 'Pre-order 2026', ''),
(9, 4, 'Pre-order 2027', '');

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
(2, 12, 1, 2000000.00),
(3, 5, 1, 5500000.00),
(4, 1, 1, 1700000.00),
(5, 3, 1, 5500000.00),
(5, 5, 1, 5500000.00);

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
  `MaPhanLoai` int(11) NOT NULL,
  `LoaiGiamGia` varchar(20) DEFAULT 'TienMat',
  `ChietKhau` decimal(12,2) DEFAULT NULL,
  `GiaTriGiamToiDa` decimal(12,2) DEFAULT NULL,
  `SoLuongKM` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietmagiamgia`
--

CREATE TABLE `chitietmagiamgia` (
  `MaGG` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL
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
  `Thoigian` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitiettrangthai`
--

INSERT INTO `chitiettrangthai` (`MaDH`, `MaTrangThai`, `Thoigian`) VALUES
(2, 1, '2026-04-25 16:02:00'),
(3, 1, '2026-04-25 23:55:34'),
(4, 1, '2026-04-26 11:29:35'),
(5, 1, '2026-04-26 15:32:10'),
(5, 2, '2026-04-26 15:34:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietyeuthich`
--

CREATE TABLE `chitietyeuthich` (
  `MaYeuThich` int(11) NOT NULL,
  `MaMoHinh` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietyeuthich`
--

INSERT INTO `chitietyeuthich` (`MaYeuThich`, `MaMoHinh`) VALUES
(2, 11);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `MaDG` int(11) NOT NULL,
  `MaKH` int(11) NOT NULL,
  `MaMH` int(11) NOT NULL,
  `MaPhanLoai` int(11) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `SoSao` int(11) DEFAULT NULL CHECK (`SoSao` >= 1 and `SoSao` <= 5),
  `HinhAnh` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`HinhAnh`)),
  `PhanHoiShop` text DEFAULT NULL,
  `TrangThai` tinyint(4) DEFAULT 1,
  `ThoiGianDG` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `danhgia`
--

INSERT INTO `danhgia` (`MaDG`, `MaKH`, `MaMH`, `MaPhanLoai`, `NoiDung`, `SoSao`, `HinhAnh`, `PhanHoiShop`, `TrangThai`, `ThoiGianDG`) VALUES
(1, 1, 5, 5, 'Mô hình cực kỳ chi tiết, màu sơn sắc nét hơn cả trên ảnh. Khớp cử động mượt mà, đóng gói rất cẩn thận bằng 3 lớp chống sốc. Sẽ tiếp tục ủng hộ FigureCollect!', 5, '[]', 'Cảm ơn bạn đã tin tưởng và ủng hộ FigureCollect. Chúc bạn có những phút giây trưng bày mãn nhãn nhé!', 1, '2026-04-15 21:00:00'),
(2, 1, 5, 5, 'Chất lượng sơn khá tốt, khớp nối linh hoạt. Tuy nhiên hộp bên ngoài bị móp nhẹ một góc trong quá trình vận chuyển, hy vọng lần sau shop lưu ý đơn vị vận chuyển hơn.', 4, '[\"1776276476194-911623985.jpg\",\"1776276476447-101889590.jpeg\",\"1776276476448-300618380.jpg\"]', NULL, 1, '2026-04-16 01:07:56');

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
(4, 'PRE-ORDER', 'Chưa có mô tả'),
(5, 'Phụ kiện khác', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucyeuthich`
--

CREATE TABLE `danhmucyeuthich` (
  `MaYeuThich` int(11) NOT NULL,
  `MaKH` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmucyeuthich`
--

INSERT INTO `danhmucyeuthich` (`MaYeuThich`, `MaKH`) VALUES
(1, 3),
(2, 4);

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
  `TrangThaiThanhToan` varchar(50) DEFAULT NULL,
  `TenNguoiNhan` varchar(100) DEFAULT NULL,
  `SDTNguoiNhan` varchar(15) DEFAULT NULL,
  `DiaChiGiao` varchar(255) DEFAULT NULL,
  `Note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `donhang`
--

INSERT INTO `donhang` (`MaDH`, `MaKH`, `MaNV`, `NgayLapDon`, `TongTien`, `ThanhTien`, `TrangThaiThanhToan`, `TenNguoiNhan`, `SDTNguoiNhan`, `DiaChiGiao`, `Note`) VALUES
(2, 1, NULL, '2026-04-25 16:02:00', 2000000.00, NULL, 'Đã thanh toán', 'thangne', '0336384289', 'HP', NULL),
(3, 4, NULL, '2026-04-25 23:55:34', 5500000.00, NULL, 'Đã thanh toán', 'thang1lannuane', '113', 'HP', NULL),
(4, 4, NULL, '2026-04-26 11:29:35', 1700000.00, NULL, 'Đã thanh toán', 'Phùng Đức Thắng', '113', 'HP', NULL),
(5, 4, NULL, '2026-04-26 15:32:10', 11000000.00, NULL, 'Đã thanh toán', 'Phùng Đức Thắng', '0336384289', 'HP', NULL);

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
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hangsanxuat`
--

CREATE TABLE `hangsanxuat` (
  `MaHSX` int(11) NOT NULL,
  `TenHSX` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hangsanxuat`
--

INSERT INTO `hangsanxuat` (`MaHSX`, `TenHSX`, `MoTa`) VALUES
(1, 'GoodSmileCompany', NULL),
(2, 'Gift+', NULL),
(3, 'Furyu', NULL),
(4, 'SEGA', 'Chưa có mô tả'),
(5, 'BANDAI', NULL),
(6, 'Max Factory', NULL),
(7, 'Hobby stock', NULL),
(8, 'Alter', NULL),
(9, 'Emontoys', NULL);

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
(1, 'Phùng Đức Thắng', 'HP', '0336384289', 2),
(2, 'thangnuane', NULL, NULL, 3),
(3, 'thanglannuane', NULL, NULL, 4),
(4, 'Phùng Đức Thắng', '', '', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khuyenmai`
--

CREATE TABLE `khuyenmai` (
  `MaKM` int(11) NOT NULL,
  `TenKM` varchar(100) NOT NULL,
  `ThoiGianBD` datetime DEFAULT NULL,
  `ThoiGianKT` datetime DEFAULT NULL,
  `TrangThaiHoatDong` tinyint(4) DEFAULT 0
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
-- Cấu trúc bảng cho bảng `logsudungkhuyenmai`
--

CREATE TABLE `logsudungkhuyenmai` (
  `MaLichSu` int(11) NOT NULL,
  `MaKM` int(11) NOT NULL,
  `MaKH` int(11) NOT NULL,
  `MaDH` int(11) NOT NULL,
  `SoTienDaGiam` decimal(12,2) DEFAULT NULL,
  `Thoigiansudung` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `logsudungmagiamgia`
--

CREATE TABLE `logsudungmagiamgia` (
  `MaLichSu` int(11) NOT NULL,
  `MaGG` int(11) NOT NULL,
  `MaKH` int(11) NOT NULL,
  `MaDH` int(11) NOT NULL,
  `SoTienDaGiam` decimal(12,2) DEFAULT NULL,
  `Thoigiansudung` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `magiamgia`
--

CREATE TABLE `magiamgia` (
  `MaGG` int(11) NOT NULL,
  `TenMaGiamGia` varchar(100) NOT NULL,
  `MaVoucher` varchar(20) NOT NULL,
  `SoLuongDungToiDa` int(11) DEFAULT 1,
  `ThoiGianBD` datetime DEFAULT NULL,
  `ThoiGianKT` datetime DEFAULT NULL,
  `MaKH` int(11) DEFAULT NULL,
  `MucGiaToiThieu` decimal(12,2) DEFAULT NULL,
  `TrangThaiHoatDong` tinyint(4) DEFAULT 0,
  `LoaiGiamGia` varchar(20) DEFAULT 'TienMat',
  `ChietKhau` decimal(12,2) DEFAULT NULL,
  `GiaTriGiamToiDa` decimal(12,2) DEFAULT NULL
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
  `TienCocToiThieu` decimal(12,2) DEFAULT NULL CHECK (`TienCocToiThieu` >= 0),
  `HienThi` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mohinh`
--

INSERT INTO `mohinh` (`MaMoHinh`, `TenMH`, `MaHSX`, `MaDM`, `MaChiTietDM`, `ChatLieu`, `DonGia`, `TrangThai`, `ThongTinChiTiet`, `AnhDaiDien`, `KichThuoc`, `NgayPhatHanh`, `LoaiHinhBan`, `TienCocToiThieu`, `HienThi`) VALUES
(1, 'Mô Hình Nendoroid Lancer/Mélusine - Nendoroid 2190 Fate/Grand Order', 1, 2, 7, 'PVC', 1700000.00, 'Còn Hàng', ' ', '1_1.jpeg', '10 cm', NULL, 'Bình thường', 1000000.00, 0),
(2, 'Mô Hình Ruler/Mélusine - Fate/Grand Order Ver 1/6 Scale Figure Chính Hãng (GSC)', 1, 1, 2, 'PVC', 3900000.00, 'Còn Hàng', ' ', '2_1.jpeg', '10 cm', NULL, 'Bình thường', 1500000.00, 0),
(3, 'Mô Hình Hatsune Miku - Hatsune Miku EXPO 10th Anniversary Ver. - 1/7 Scale Figure Chính Hãng (Hobby Stock)', 7, 1, 2, 'PVC', 5500000.00, 'Còn Hàng', ' ', '3_1.jpeg', '25,5 cm', NULL, 'Có sẵn', 1500000.00, 0),
(4, 'Mô Hình Hatsune Miku Happy 16th Birthday Ver. 1/7 Figure (GSC)', 1, 1, 2, 'PVC', 5400000.00, 'Còn Hàng', ' ', '4_1.jpeg', '31 cm', NULL, 'Có sẵn', 2000000.00, 0),
(5, 'Mô hình Hatsune Miku - Sakura Hanami Outfit Ver Scale 1/6 Figure Chính Hãng (GSC)', 1, 1, 2, 'PVC', 5500000.00, 'Chưa phát hành', ' ', '5_1.jpeg', '28 cm', '0000-00-00', 'Có sẵn', 2000000.00, 0),
(6, 'Mô Hình Monkey D. Luffy Gear 4 -Lion Bazooka- - One Piece - Figuarts Zero [EXTRA BATTLE] Figure Chính Hãng (BANDAI SPIRITS)', 1, 1, 2, 'PVC', 2500000.00, 'Pre-order', ' ', '6_1.jpeg', '18 cm', NULL, 'Pre-order', 500000.00, 0),
(7, 'Vector II', 1, 1, 1, 'PVC', 2500000.00, 'Đã phát hành', 'Vector', '1776874512364-670592032.png', 'Trống', '2026-04-21', 'Có sẵn', 1000000.00, 1),
(10, 'Vector I', 1, 1, 1, 'PVC', 2000000.00, 'Đã phát hành', 'Vector', '1776875133207-481387597.png', 'Trống', '2026-04-21', 'Có sẵn', 1000000.00, 1),
(11, 'Vector', 1, 1, 1, 'pvc', 2000000.00, 'Đã phát hành', 'undefined', '1776876025260-771077779.png', 'Trống', '2026-04-14', 'Có sẵn', 1000000.00, 1),
(12, 'Sakuya', 1, 4, 9, 'PVC', 3000000.00, 'Chưa phát hành', 'Sakuya', '1777114516724-8500482.png', 'Trống', '2026-04-23', 'Pre-order', 1000000.00, 0),
(13, 'Mô hình Sakuya Izayoi Scale 1/8 Touhou Project', 8, 4, 8, 'PVC ABS', 5000000.00, 'Chưa phát hành', '', '1777193159098-230988902.jpg', '29 cm', '2026-11-23', 'Pre-order', 1500000.00, 0),
(14, 'Mô hình Sakuya Izayoi Scale 1/7 Touhou Project', 9, 1, 2, '', 8000000.00, 'Đã phát hành', '', '1777193715788-651711138.jpg', '32 cm', '0000-00-00', 'Có sẵn', 2000000.00, 0);

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

--
-- Đang đổ dữ liệu cho bảng `nhanvien`
--

INSERT INTO `nhanvien` (`MaNV`, `TenNV`, `DiaChi`, `SDT`, `MaTK`) VALUES
(1, 'Thắng', 'HP', '0336384289', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phanloai`
--

CREATE TABLE `phanloai` (
  `MaPhanLoai` int(11) NOT NULL,
  `ChiTietPhanLoai` varchar(100) NOT NULL,
  `MaMoHinh` int(11) NOT NULL,
  `DonGia` decimal(12,2) NOT NULL CHECK (`DonGia` >= 0),
  `SoLuong` int(11) DEFAULT 0 CHECK (`SoLuong` >= 0),
  `HienThi` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phanloai`
--

INSERT INTO `phanloai` (`MaPhanLoai`, `ChiTietPhanLoai`, `MaMoHinh`, `DonGia`, `SoLuong`, `HienThi`) VALUES
(1, 'NONE', 1, 1700000.00, 4, 0),
(2, 'NONE', 2, 3900000.00, 5, 0),
(3, 'NONE', 3, 5500000.00, 4, 0),
(4, 'NONE', 4, 5400000.00, 5, 0),
(5, 'NONE', 5, 5500000.00, 3, 0),
(6, 'NONE', 6, 2500000.00, 10, 0),
(7, 'Mặc định', 7, 2000000.00, 3, 1),
(10, 'Mặc định', 10, 2000000.00, 3, 1),
(11, 'Hộp móp', 10, 1500000.00, 1, 1),
(12, 'Mặc định', 11, 2000000.00, 9, 1),
(13, 'Hộp móp', 11, 1800000.00, 1, 1),
(14, 'Mặc định', 12, 3000000.00, 99, 0),
(15, 'Bản đặc biệt deluxe giới hạn', 12, 3500000.00, 20, 1),
(16, 'Mặc định', 13, 5000000.00, 20, 0),
(17, 'Mặc định', 14, 8000000.00, 1, 0);

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

--
-- Đang đổ dữ liệu cho bảng `phuongthucthanhtoan`
--

INSERT INTO `phuongthucthanhtoan` (`MaPT`, `TenPhuongThuc`) VALUES
(1, 'momo'),
(2, 'COD');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quyen`
--

CREATE TABLE `quyen` (
  `MaQuyen` int(11) NOT NULL,
  `TenQuyen` varchar(50) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quyen`
--

INSERT INTO `quyen` (`MaQuyen`, `TenQuyen`, `MoTa`) VALUES
(1, 'Quản lý', NULL),
(2, 'Nhân viên bán hàng', NULL),
(3, 'Khách hàng', NULL);

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

--
-- Đang đổ dữ liệu cho bảng `sanphamvatly`
--

INSERT INTO `sanphamvatly` (`MaMoHinhVL`, `MaMoHinh`, `MaVach_Serial`, `TrangThai`, `Is_Minted`, `MaDH`) VALUES
(1, 1, 'SN-001-NEN-MELUSINE', 'Đã bán', 1, 4);

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
  `AnhDaiDien` varchar(100) DEFAULT NULL,
  `ResetOTP` varchar(10) DEFAULT NULL,
  `OTPExpires` datetime DEFAULT NULL,
  `Bi_khoa` tinyint(4) DEFAULT 0,
  `NgayTao` datetime DEFAULT current_timestamp(),
  `DangNhapCuoi` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`MaTK`, `TenDN`, `MatKhau`, `Email`, `MaQuyen`, `AnhDaiDien`, `ResetOTP`, `OTPExpires`, `Bi_khoa`, `NgayTao`, `DangNhapCuoi`) VALUES
(1, 'thang_staff', '123456', 'thang@gmail.com', 1, NULL, NULL, NULL, 0, '2026-04-19 10:06:18', NULL),
(2, 'thangne', '$2b$10$EKaObWNzazy1X0ULiq4lReZmMbJAkaxTNFayTFS0Ns1CVFrIzDtum', 'thang@gmail.com', 3, NULL, NULL, NULL, 0, '2026-04-19 22:28:04', NULL),
(3, 'thangnuane', '$2b$10$L8g9asoTs7c/v1b0rp11KO..csVNlc0D7n0s3nlnl7wfYgXydWiIO', 'thang@gmail.com', 3, NULL, NULL, NULL, 0, '2026-04-25 23:20:07', NULL),
(4, 'thanglannuane', '$2b$10$LlgPI7q38NBDwzJi8T46FeHPx1BSJKXX0FHjBlvQNs8WZq80vh5eK', 'thang@gmail.com', 3, NULL, NULL, NULL, 0, '2026-04-25 23:21:27', NULL),
(5, 'thang1lannuane', '$2b$10$4kHNZng/EbeLMOQ.WYffE.r.lINx4Ab1irKUk18WfZ82vb0frqFAS', 'thang@gmail.com', 3, 'avatar_TK5_1777135306716.png', NULL, NULL, 0, '2026-04-25 23:22:14', NULL);

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

--
-- Đang đổ dữ liệu cho bảng `thanhtoan`
--

INSERT INTO `thanhtoan` (`MaTT`, `MaPT`, `MaDH`, `NgayThanhToan`, `SoTienGiaoDich`, `LoaiGiaoDich`) VALUES
(1, 1, 2, '2026-04-25 16:02:02', 2000000.00, 'Thanh toán toàn bộ'),
(2, 1, 3, '2026-04-25 23:55:35', 5500000.00, 'Thanh toán toàn bộ'),
(3, 1, 4, '2026-04-26 11:29:36', 1700000.00, 'Thanh toán toàn bộ'),
(4, 1, 5, '2026-04-26 15:32:11', 11000000.00, 'Thanh toán toàn bộ');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tintuc`
--

CREATE TABLE `tintuc` (
  `MaTT` int(11) NOT NULL,
  `NoiDung` longtext DEFAULT NULL,
  `MaNV` int(11) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `TieuDe` varchar(255) NOT NULL,
  `TomTat` text DEFAULT NULL,
  `TheLoai` varchar(100) DEFAULT NULL,
  `NgayDang` datetime DEFAULT current_timestamp(),
  `LuotXem` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tintuc`
--

INSERT INTO `tintuc` (`MaTT`, `NoiDung`, `MaNV`, `TrangThai`, `TieuDe`, `TomTat`, `TheLoai`, `NgayDang`, `LuotXem`) VALUES
(1, 'Bandai đã định nghĩa lại chuẩn mực dòng Perfect Grade với PG Unleashed RX-78-2. Bài viết phân tích chi tiết khung xương, cơ chế LED và trải nghiệm lắp ráp.', 1, 'Đã duyệt', 'PG Unleashed RX-78-2: Đỉnh Cao Cơ Khí', 'Bandai đã định nghĩa lại hoàn toàn chuẩn mực của dòng Perfect Grade. Cùng mổ xẻ từng lớp khung xương và cơ chế LED đỉnh cao của huyền thoại này.', 'Đánh giá chi tiết', '2026-03-31 00:00:00', 320),
(2, 'Danh sách 5 mẫu Nendoroid hiếm nhất đang được săn lùng trên thị trường hiện nay, giá trị tăng cao theo thời gian.', 1, 'Đã duyệt', 'Top 5 Nendoroid hiếm nhất đang bị săn lùng', NULL, 'Thị trường', '2026-03-28 00:00:00', 980),
(3, 'Tổng hợp những điểm nổi bật tại Wonder Festival và dự đoán xu hướng ngành figure trong tương lai.', 1, 'Đã duyệt', 'Wonder Festival: Tương lai ngành figure', NULL, 'Sự kiện', '2026-03-29 00:00:00', 870),
(4, 'Hướng dẫn bảo quản mô hình PVC đúng cách để tránh hiện tượng chảy nhớt và xuống màu theo thời gian.', 1, 'Đã duyệt', 'Bí quyết bảo quản nhựa PVC không bị chảy nhớt', NULL, 'Kiến thức', '2026-03-28 00:00:00', 760),
(5, 'Figure kim loại (Die-cast) đang trở thành xu hướng mới nhờ độ bền và cảm giác cao cấp.', 1, 'Đã duyệt', 'Xu hướng Figure kim loại (Die-cast) lên ngôi', NULL, 'Thị trường', '2026-03-27 00:00:00', 690),
(6, 'Đánh giá chi tiết phiên bản Hatsune Miku Digital Future Edition với hiệu ứng LED và thiết kế trong suốt độc đáo.', 1, 'Đã duyệt', 'Mở hộp Hatsune Miku 1/7 - Digital Future Edition', 'Phiên bản kỷ niệm với hệ thống LED RGB...', 'Anime Figure', '2026-03-26 00:00:00', 621),
(7, 'Phân tích chi tiết mẫu figure Elf Bunny Girl Rabbi với chất liệu cao cấp và độ hoàn thiện ấn tượng.', 1, 'Đã duyệt', 'Nàng Elf Bunny Girl Rabbi – Mỗi đường cong là một cám dỗ', 'Siêu phẩm scale 1/4 từ B-Style...', 'Anime Figure', '2026-03-25 00:00:00', 540),
(8, 'Metal Build EVA-01 mang đến trải nghiệm kết hợp giữa kim loại và thiết kế sinh học độc đáo.', 1, 'Đã duyệt', 'Metal Build Evangelion EVA-01: Có đáng tiền?', 'Sự kết hợp giữa chất liệu kim loại...', 'Mecha & Robot', '2026-03-20 00:00:00', 710),
(9, 'Hướng dẫn phân biệt mô hình thật và hàng giả bằng cách kiểm tra tem, màu sơn và khớp nối.', 1, 'Đã duyệt', 'Phân biệt mô hình thật (Auth) và hàng giả (Bootleg)', 'Hướng dẫn chi tiết cách soi tem seal...', 'Kiến thức', '2026-03-15 00:00:00', 831),
(10, 'Danh sách các mẫu Gundam sẽ phát hành trong quý 3/2026, bao gồm nhiều sản phẩm đáng chú ý.', 1, 'Đã duyệt', 'Lịch phát hành mô hình Gundam (Gunpla) Quý 3/2026', 'Tổng hợp danh sách các mẫu MG, RG...', 'Gundam', '2026-03-10 00:00:00', 900),
(11, 'Hướng dẫn setup tủ trưng bày mô hình với hệ thống LED đẹp mắt và chuyên nghiệp.', 1, 'Đã duyệt', 'Cách setup tủ trưng bày LED chuẩn bảo tàng mini', NULL, 'Kinh nghiệm', '2026-03-01 00:00:00', 1100),
(12, 'Phân tích lý do tại sao các mô hình hiếm lại có giá trị cao trên thị trường.', 1, 'Đã duyệt', 'Tại sao mô hình cũ (Rare) lại có giá trên trời?', NULL, 'Thị trường', '2026-02-28 00:00:00', 1250),
(13, 'Tổng hợp 10 hãng sản xuất mô hình uy tín nhất thế giới hiện nay.', 1, 'Đã duyệt', 'Top 10 hãng sản xuất mô hình uy tín nhất thế giới', NULL, 'Tổng hợp', '2026-02-20 00:00:00', 1400);

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
(1, 'Chờ duyệt'),
(2, 'Đang đóng gói'),
(3, 'Đang vận chuyển'),
(4, 'Đã giao'),
(5, 'Đã hủy'),
(6, 'Đang hoàn hàng');

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
  ADD PRIMARY KEY (`MaKM`,`MaPhanLoai`),
  ADD KEY `MaPhanLoai` (`MaPhanLoai`);

--
-- Chỉ mục cho bảng `chitietmagiamgia`
--
ALTER TABLE `chitietmagiamgia`
  ADD PRIMARY KEY (`MaGG`,`MaMoHinh`),
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
  ADD KEY `MaMH` (`MaMH`),
  ADD KEY `MaPhanLoai` (`MaPhanLoai`);

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
  ADD PRIMARY KEY (`MaHSX`),
  ADD UNIQUE KEY `TenHSX` (`TenHSX`);

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
-- Chỉ mục cho bảng `logsudungkhuyenmai`
--
ALTER TABLE `logsudungkhuyenmai`
  ADD PRIMARY KEY (`MaLichSu`),
  ADD KEY `MaKM` (`MaKM`),
  ADD KEY `MaDH` (`MaDH`),
  ADD KEY `MaKH` (`MaKH`);

--
-- Chỉ mục cho bảng `logsudungmagiamgia`
--
ALTER TABLE `logsudungmagiamgia`
  ADD PRIMARY KEY (`MaLichSu`),
  ADD KEY `MaGG` (`MaGG`),
  ADD KEY `MaDH` (`MaDH`),
  ADD KEY `MaKH` (`MaKH`);

--
-- Chỉ mục cho bảng `magiamgia`
--
ALTER TABLE `magiamgia`
  ADD PRIMARY KEY (`MaGG`),
  ADD UNIQUE KEY `MaVoucher` (`MaVoucher`);

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
  MODIFY `MaAnh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT cho bảng `anhtintuc`
--
ALTER TABLE `anhtintuc`
  MODIFY `MaAnh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `baohanh`
--
ALTER TABLE `baohanh`
  MODIFY `MaPBH` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chitietdanhmuc`
--
ALTER TABLE `chitietdanhmuc`
  MODIFY `MaChiTietDM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `MaDG` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `MaDM` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `danhmucyeuthich`
--
ALTER TABLE `danhmucyeuthich`
  MODIFY `MaYeuThich` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `MaDH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `giohang`
--
ALTER TABLE `giohang`
  MODIFY `MaGH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `hangsanxuat`
--
ALTER TABLE `hangsanxuat`
  MODIFY `MaHSX` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  MODIFY `MaKH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- AUTO_INCREMENT cho bảng `logsudungkhuyenmai`
--
ALTER TABLE `logsudungkhuyenmai`
  MODIFY `MaLichSu` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `logsudungmagiamgia`
--
ALTER TABLE `logsudungmagiamgia`
  MODIFY `MaLichSu` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `magiamgia`
--
ALTER TABLE `magiamgia`
  MODIFY `MaGG` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  MODIFY `MaMoHinh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `nhacungcap`
--
ALTER TABLE `nhacungcap`
  MODIFY `MaNCC` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  MODIFY `MaNV` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `phanloai`
--
ALTER TABLE `phanloai`
  MODIFY `MaPhanLoai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `phieunhap`
--
ALTER TABLE `phieunhap`
  MODIFY `MaPN` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `phuongthucthanhtoan`
--
ALTER TABLE `phuongthucthanhtoan`
  MODIFY `MaPT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `quyen`
--
ALTER TABLE `quyen`
  MODIFY `MaQuyen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `sanphamvatly`
--
ALTER TABLE `sanphamvatly`
  MODIFY `MaMoHinhVL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  MODIFY `MaTK` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `MaTT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  MODIFY `MaTT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `trangthai`
--
ALTER TABLE `trangthai`
  MODIFY `MaTrangThai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  ADD CONSTRAINT `chitietkhuyenmai_ibfk_2` FOREIGN KEY (`MaPhanLoai`) REFERENCES `phanloai` (`MaPhanLoai`);

--
-- Các ràng buộc cho bảng `chitietmagiamgia`
--
ALTER TABLE `chitietmagiamgia`
  ADD CONSTRAINT `chitietmagiamgia_ibfk_1` FOREIGN KEY (`MaGG`) REFERENCES `magiamgia` (`MaGG`),
  ADD CONSTRAINT `chitietmagiamgia_ibfk_2` FOREIGN KEY (`MaMoHinh`) REFERENCES `mohinh` (`MaMoHinh`);

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
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`MaMH`) REFERENCES `mohinh` (`MaMoHinh`),
  ADD CONSTRAINT `danhgia_ibfk_3` FOREIGN KEY (`MaPhanLoai`) REFERENCES `phanloai` (`MaPhanLoai`);

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
-- Các ràng buộc cho bảng `logsudungkhuyenmai`
--
ALTER TABLE `logsudungkhuyenmai`
  ADD CONSTRAINT `logsudungkhuyenmai_ibfk_1` FOREIGN KEY (`MaKM`) REFERENCES `khuyenmai` (`MaKM`),
  ADD CONSTRAINT `logsudungkhuyenmai_ibfk_2` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`),
  ADD CONSTRAINT `logsudungkhuyenmai_ibfk_3` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`);

--
-- Các ràng buộc cho bảng `logsudungmagiamgia`
--
ALTER TABLE `logsudungmagiamgia`
  ADD CONSTRAINT `logsudungmagiamgia_ibfk_1` FOREIGN KEY (`MaGG`) REFERENCES `magiamgia` (`MaGG`),
  ADD CONSTRAINT `logsudungmagiamgia_ibfk_2` FOREIGN KEY (`MaDH`) REFERENCES `donhang` (`MaDH`),
  ADD CONSTRAINT `logsudungmagiamgia_ibfk_3` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`);

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
