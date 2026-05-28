-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 20, 2026 lúc 05:56 PM
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
-- Cấu trúc bảng cho bảng `mohinh`
--

CREATE TABLE `mohinh` (
  `MaMoHinh` int(11) NOT NULL,
  `MaVach_Serial` varchar(100) DEFAULT NULL,
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
  `Is_Minted` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mohinh`
--

INSERT INTO `mohinh` (`MaMoHinh`, `MaVach_Serial`, `TenMH`, `MaHSX`, `MaDM`, `MaChiTietDM`, `ChatLieu`, `DonGia`, `TrangThai`, `ThongTinChiTiet`, `AnhDaiDien`, `KichThuoc`, `NgayPhatHanh`, `LoaiHinhBan`, `TienCocToiThieu`, `Is_Minted`) VALUES
(1, 'SN-001-NEN-MELUSINE', 'Mô Hình Nendoroid Lancer/Mélusine - Nendoroid 2190 Fate/Grand Order', 1, 2, 7, 'PVC', 1700000.00, 'Còn Hàng', ' ', '1_1.jpeg', '10 cm', NULL, 'Bình thường', 1000000.00, 1),
(2, 'SN-002-SCL-MELUSINE', 'Mô Hình Ruler/Mélusine - Fate/Grand Order Ver 1/6 Scale Figure Chính Hãng (GSC)', 1, 1, 2, 'PVC', 3900000.00, 'Còn Hàng', ' ', '2_1.jpeg', '10 cm', NULL, 'Bình thường', 1500000.00, 1),
(3, NULL, 'Mô Hình Hatsune Miku - Hatsune Miku EXPO 10th Anniversary Ver. - 1/7 Scale Figure Chính Hãng (Hobby Stock)', 7, 1, 2, 'PVC', 5500000.00, 'Còn Hàng', ' ', '3_1.jpeg', '25,5 cm', NULL, 'Có sẵn', 1500000.00, 0),
(4, NULL, 'Mô Hình Hatsune Miku Happy 16th Birthday Ver. 1/7 Figure (GSC)', 1, 1, 2, 'PVC', 5400000.00, 'Còn Hàng', ' ', '4_1.jpeg', '31 cm', NULL, 'Có sẵn', 2000000.00, 0),
(5, NULL, 'Mô hình Hatsune Miku - Sakura Hanami Outfit Ver Scale 1/6 Figure Chính Hãng (GSC)', 1, 1, 2, 'PVC', 5500000.00, 'Còn Hàng', ' ', '5_1.jpeg', '28 cm', NULL, 'Có sẵn', 2000000.00, 0);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  ADD PRIMARY KEY (`MaMoHinh`),
  ADD UNIQUE KEY `MaVach_Serial` (`MaVach_Serial`),
  ADD KEY `MaHSX` (`MaHSX`),
  ADD KEY `MaDM` (`MaDM`),
  ADD KEY `MaChiTietDM` (`MaChiTietDM`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  MODIFY `MaMoHinh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `mohinh`
--
ALTER TABLE `mohinh`
  ADD CONSTRAINT `mohinh_ibfk_1` FOREIGN KEY (`MaHSX`) REFERENCES `hangsanxuat` (`MaHSX`),
  ADD CONSTRAINT `mohinh_ibfk_2` FOREIGN KEY (`MaDM`) REFERENCES `danhmuc` (`MaDM`),
  ADD CONSTRAINT `mohinh_ibfk_3` FOREIGN KEY (`MaChiTietDM`) REFERENCES `chitietdanhmuc` (`MaChiTietDM`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
