-- Tạo Database
CREATE DATABASE KinhDoanhMoHinh;
GO
USE KinhDoanhMoHinh;
GO
DROP DATABASE KinhDoanhMoHinh;

-- 1. Bảng Quyền
CREATE TABLE Quyen (
    MaQuyen INT PRIMARY KEY IDENTITY(1,1),
    TenQuyen NVARCHAR(50) NOT NULL
);
GO

-- 2. Bảng Tài khoản
CREATE TABLE TaiKhoan (
    MaTK INT PRIMARY KEY IDENTITY(1,1),
    TenDN VARCHAR(50) NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    Email NVARCHAR(100),
    MaQuyen INT,
    AnhDaiDien NVARCHAR(100),
    FOREIGN KEY (MaQuyen) REFERENCES Quyen(MaQuyen)
);
GO

-- 3. Bảng Khách hàng
CREATE TABLE KhachHang (
    MaKH INT PRIMARY KEY IDENTITY(1,1),
    TenKH NVARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    DiaChi NVARCHAR(255),
    SDT VARCHAR(15),
    MaTK INT,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);
GO

-- 4. Bảng Nhân viên
CREATE TABLE NhanVien (
    MaNV INT PRIMARY KEY IDENTITY(1,1),
    TenNV NVARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    DiaChi NVARCHAR(255),
    SDT VARCHAR(15),
    MaTK INT,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);
GO

-- 5. Bảng Hãng sản xuất
CREATE TABLE HangSanXuat (
    MaHSX INT PRIMARY KEY IDENTITY(1,1),
    TenHSX NVARCHAR(100) NOT NULL
);
GO

-- 6. Bảng Danh mục
CREATE TABLE DanhMuc (
    MaDM INT PRIMARY KEY IDENTITY(1,1),
    TenDM NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(MAX)
);
GO

-- 7. Bảng Chi tiết Danh mục
CREATE TABLE ChiTietDanhMuc (
    MaChiTietDM INT PRIMARY KEY IDENTITY(1,1),
    MaDM INT NOT NULL,
    TenChiTietDM NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(MAX),
    FOREIGN KEY (MaDM) REFERENCES DanhMuc(MaDM)
);
GO

-- 8. Bảng Mô hình (Sản phẩm danh mục)
CREATE TABLE MoHinh (
    MaMoHinh INT PRIMARY KEY IDENTITY(1,1),
    TenMH NVARCHAR(255) NOT NULL,
    MaHSX INT,
    MaDM INT,
    MaChiTietDM INT NULL,
    ChatLieu NVARCHAR(100),
    DonGia DECIMAL(12,2) NOT NULL CHECK (DonGia >= 0),
    TrangThai NVARCHAR(50),
    ThongTinChiTiet NVARCHAR(MAX),
    AnhDaiDien VARCHAR(255),
    KichThuoc NVARCHAR(50),
    NgayPhatHanh DATE,
    LoaiHinhBan NVARCHAR(50), -- In-stock hoặc Pre-order
    TienCocToiThieu DECIMAL(12,2) CHECK (TienCocToiThieu >= 0),
    FOREIGN KEY (MaHSX) REFERENCES HangSanXuat(MaHSX),
    FOREIGN KEY (MaDM) REFERENCES DanhMuc(MaDM),
    FOREIGN KEY (MaChiTietDM) REFERENCES ChiTietDanhMuc(MaChiTietDM)
);
GO

-- 8.5 Bảng phân loại mô hình (
CREATE TABLE Phanloai (
    MaPhanLoai INT PRIMARY KEY IDENTITY(1,1),
    ChiTietPhanLoai NVARCHAR(100) NOT NULL,
    MaMoHinh INT NOT NULL,
    DonGia DECIMAL(12,2) NOT NULL CHECK (DonGia >= 0),
    SoLuong INT DEFAULT 0 CHECK (SoLuong >= 0),
    FOREIGN KEY (MaMoHinh) REFERENCES MoHinh(MaMoHinh)
);
GO

-- 9. Bảng Ảnh mô hình
CREATE TABLE AnhMoHinh (
    MaAnh INT PRIMARY KEY IDENTITY(1,1),
    LinkAnh VARCHAR(255) NOT NULL,
    MaMoHinh INT,
    FOREIGN KEY (MaMoHinh) REFERENCES MoHinh(MaMoHinh)
);
GO

-- 10. Bảng Nhà cung cấp
CREATE TABLE NhaCungCap (
    MaNCC INT PRIMARY KEY IDENTITY(1,1),
    TenNCC NVARCHAR(100) NOT NULL,
    SDT VARCHAR(15),
    DiaChi NVARCHAR(255)
);
GO

-- 11. Bảng Phiếu nhập
CREATE TABLE PhieuNhap (
    MaPN INT PRIMARY KEY IDENTITY(1,1),
    NgayNhap DATETIME,
    MaNV INT,
    MaNCC INT,
    TongTienNhap DECIMAL(12,2) CHECK (TongTienNhap >= 0),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (MaNCC) REFERENCES NhaCungCap(MaNCC)
);
GO

-- 12. Bảng Chi tiết phiếu nhập
CREATE TABLE ChiTietPhieuNhap (
    MaPN INT,
    MaMoHinh INT,
    SoLuong INT CHECK (SoLuong > 0),
    DonGiaNhap DECIMAL(12,2) CHECK (DonGiaNhap >= 0),
    PRIMARY KEY (MaPN, MaMoHinh),
    FOREIGN KEY (MaPN) REFERENCES PhieuNhap(MaPN),
    FOREIGN KEY (MaMoHinh) REFERENCES MoHinh(MaMoHinh)
);
GO

-- 13. Bảng Giỏ hàng
CREATE TABLE GioHang (
    MaGH INT PRIMARY KEY IDENTITY(1,1),
    MaKH INT,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);
GO

-- 14. Bảng Chi tiết giỏ hàng
CREATE TABLE ChiTietGioHang (
    MaGH INT,
    MaMoHinh INT,
    SoLuong INT CHECK (SoLuong > 0),
    PRIMARY KEY (MaGH, MaMoHinh),
    FOREIGN KEY (MaGH) REFERENCES GioHang(MaGH),
    FOREIGN KEY (MaMoHinh) REFERENCES PhanLoai(MaPhanLoai)
);
GO

-- 15. Bảng Đơn hàng
CREATE TABLE DonHang (
    MaDH INT PRIMARY KEY IDENTITY(1,1),
    MaKH INT,
    MaNV INT,
    NgayLapDon DATETIME,
    TongTien DECIMAL(12,2) CHECK (TongTien >= 0),
    ThanhTien DECIMAL(12,2) CHECK (ThanhTien >= 0),
    TrangThaiDonHang NVARCHAR(50),
    TenNguoiNhan NVARCHAR(100),
    SDTNguoiNhan VARCHAR(15),
    DiaChiGiao NVARCHAR(255),
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);
GO

-- 16. Bảng Chi tiết đơn hàng
CREATE TABLE ChiTietDonHang (
    MaDH INT,
    MaMoHinh INT,
    SoLuong INT CHECK (SoLuong > 0),
    DonGiaBan DECIMAL(12,2) CHECK (DonGiaBan >= 0),
    PRIMARY KEY (MaDH, MaMoHinh),
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH),
    FOREIGN KEY (MaMoHinh) REFERENCES PhanLoai(MaPhanLoai)
);
GO

-- 17. Bảng Phương thức thanh toán
CREATE TABLE PhuongThucThanhToan (
    MaPT INT PRIMARY KEY IDENTITY(1,1),
    TenPhuongThuc NVARCHAR(100) NOT NULL
);
GO

-- 18. Bảng Thanh toán (Lịch sử các lần chuyển tiền của đơn)
CREATE TABLE ThanhToan (
    MaTT INT PRIMARY KEY IDENTITY(1,1),
    MaPT INT,
    MaDH INT,
    NgayThanhToan DATETIME,
    SoTienGiaoDich DECIMAL(12,2), 
    LoaiGiaoDich NVARCHAR(50), 
    FOREIGN KEY (MaPT) REFERENCES PhuongThucThanhToan(MaPT),
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH)
);
GO

-- 19. Bảng Khuyến mãi
CREATE TABLE KhuyenMai (
    MaKM INT PRIMARY KEY IDENTITY(1,1),
    TenKM NVARCHAR(100) NOT NULL,
    ThoiGianBD DATETIME,
    ThoiGianKT DATETIME,
    LoaiKM NVARCHAR(50),
    DieuKien NVARCHAR(255)
);
GO

-- 20. Bảng Chi tiết khuyến mãi
CREATE TABLE ChiTietKhuyenMai (
    MaKM INT,
    MaMoHinh INT,
    ChietKhau DECIMAL(5,2),
    PRIMARY KEY (MaKM, MaMoHinh),
    FOREIGN KEY (MaKM) REFERENCES KhuyenMai(MaKM),
    FOREIGN KEY (MaMoHinh) REFERENCES MoHinh(MaMoHinh)
);
GO

-- 21. Bảng Tin tức
CREATE TABLE TinTuc (
    MaTT INT PRIMARY KEY IDENTITY(1,1),
    NoiDung NVARCHAR(MAX),
    MaNV INT,
    TrangThai NVARCHAR(50),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);
GO

-- 22. Bảng Ảnh tin tức
CREATE TABLE AnhTinTuc (
    MaAnh INT PRIMARY KEY IDENTITY(1,1),
    LinkAnh VARCHAR(255),
    MaTT INT,
    FOREIGN KEY (MaTT) REFERENCES TinTuc(MaTT)
);
GO

-- 23. Bảng Bảo hành
CREATE TABLE BaoHanh (
    MaPBH INT PRIMARY KEY IDENTITY(1,1),
    MaDH INT,
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH)
);
GO

-- 24. Bảng Chi tiết bảo hành
CREATE TABLE ChiTietBaoHanh (
    MaPBH INT,
    MaMoHinh INT,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    PRIMARY KEY (MaPBH, MaMoHinh),
    FOREIGN KEY (MaPBH) REFERENCES BaoHanh(MaPBH),
    FOREIGN KEY (MaMoHinh) REFERENCES PhanLoai(MaPhanLoai)
);
GO

-- 25. Bảng Đánh giá
CREATE TABLE DanhGia (
    MaDG INT PRIMARY KEY IDENTITY(1,1),
    MaKH INT,
    MaMoHinh INT,
    NoiDung NVARCHAR(MAX),
    SoSao INT CHECK (SoSao >= 1 AND SoSao <= 5),
    ThoiGianDG DATETIME,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaMoHinh) REFERENCES PhanLoai(MaPhanLoai)
);
GO

-- 26. Bảng Vận chuyển
CREATE TABLE VanChuyen (
    MaVC INT PRIMARY KEY IDENTITY(1,1),
    MaDH INT,
    ThongTinVC NVARCHAR(255),
    DonViVC NVARCHAR(100),
    PhiVanChuyen DECIMAL(12,2) CHECK (PhiVanChuyen >= 0),
    GhiChu NVARCHAR(MAX),
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH)
);
GO

-- 27. Bảng Sản phẩm vật lý (Các hộp mô hình cụ thể trong kho)
CREATE TABLE SanPhamVatLy (
    MaMoHinhVL INT PRIMARY KEY IDENTITY(1,1),
    MaMoHinh INT,
    MaVach_Serial VARCHAR(100) UNIQUE NOT NULL,
    TrangThai NVARCHAR(50),
    Is_Minted BIT DEFAULT 0,
    MaDH INT NULL,
    FOREIGN KEY (MaMoHinh) REFERENCES MoHinh(MaMoHinh),
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH)
);
GO

-- 28. Bảng Lịch sử Blockchain (Truy xuất nguồn gốc cho từng SPVL)
CREATE TABLE LichSuBlockchain (
    MaBanGhi INT PRIMARY KEY IDENTITY(1,1),
    MaMoHinhVL INT,
    DiaChiSmartContract VARCHAR(255) NOT NULL,
    MaToken VARCHAR(100) NOT NULL,
    MaGiaoDich VARCHAR(255) UNIQUE NOT NULL, 
    LinkQR VARCHAR(255),
    ThoiGianGhiNhan DATETIME,
    LoaiSuKien VARCHAR(50), 
    FOREIGN KEY (MaMoHinhVL) REFERENCES SanPhamVatLy(MaMoHinhVL)
);
GO

-- 29. Bảng Phiên chat (AI Chatbot)
CREATE TABLE PhienChat (
    MaPC INT PRIMARY KEY IDENTITY(1,1),
    MaKH INT,
    ThoiGianBD DATETIME,
    TrangThai NVARCHAR(50),
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);
GO

-- 30. Bảng Chi tiết đoạn chat (AI Chatbot)
CREATE TABLE ChiTietDoanChat (
    MaTN INT PRIMARY KEY IDENTITY(1,1),
    MaPC INT,
    NguoiGui VARCHAR(50), 
    NoiDung NVARCHAR(MAX),
    NhanDienYDinh NVARCHAR(100),
    ThoiGianGui DATETIME,
    FOREIGN KEY (MaPC) REFERENCES PhienChat(MaPC)
);
GO
--THÊM Dữ liệu
INSERT INTO Quyen (TenQuyen) VALUES (N'Quản lý');
INSERT INTO Quyen (TenQuyen) VALUES (N'Nhân viên bán hàng');
INSERT INTO Quyen (TenQuyen) VALUES (N'Khách hàng');
GO

-- 2. Thêm dữ liệu cho bảng TaiKhoan
-- Giả sử: Quyền 1 (Admin), Quyền 2 (Nhân viên), Quyền 3 (Khách hàng)
INSERT INTO TaiKhoan (TenDN, MatKhau, Email, MaQuyen) VALUES 
('admin', '123456', 'thang.admin@gmail.com', 1),
('phong', '123456', 'phong.nv@gmail.com', 2),
('toan', '123456', 'toan.nv@gmail.com', 2);
GO

-- Thêm Hãng Sản xuất
INSERT INTO HangSanXuat (TenHSX) VALUES
('GoodSmileCompany'),
('Gift+'),
('Furyu'),
('SEGA'),
('BANDAI'),
('Max Factory'),
('Hobby stock')
GO
-- Thêm danh mục
INSERT INTO DanhMuc (TenDM) VALUES
(N'Mô hình'),
(N'Nendoroid'),
(N'Nhồi bông'),
(N'PRE-ORDER'),
(N'Phụ kiện khác')
GO
-- Thêm chi tiết danh mục
INSERT INTO ChiTietDanhMuc (MaDM, TenChiTietDM) VALUES
(1, N'Gameprize'),
(1, N'Mô hình scale'),
(1, N'Mô hình Chibi'),
(1, N'Mô hình lắp ráp'),
(1, N'Action figure'),
(2, N'Nedoroid Nam'),
(2, N'Nendoroid nữ'),
(4, N'Pre-order 2026'),
(4, N'Pre-order 2027');
GO
-- Thêm mô hình
INSERT INTO MoHinh (TenMH, MaHSX, MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, AnhDaiDien, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCocToiThieu) VALUES
(N'Mô Hình Nendoroid Lancer/Mélusine - Nendoroid 2190 Fate/Grand Order',1,2,7,'PVC',1700000,N'Còn Hàng',' ','1_1.jpeg','10 cm',NULL,N'Bình thường',1000000),
(N'Mô Hình Ruler/Mélusine - Fate/Grand Order Ver 1/6 Scale Figure Chính Hãng (GSC)',1,1,2,'PVC',3900000,N'Còn Hàng',' ','2_1.jpeg','10 cm',NULL,N'Bình thường',1500000),
(N'Mô Hình Hatsune Miku - Hatsune Miku EXPO 10th Anniversary Ver. - 1/7 Scale Figure Chính Hãng (Hobby Stock)',7,1,2,'PVC',5500000,N'Còn Hàng',' ','3_1.jpeg','25,5 cm',NULL,N'Có sẵn',1500000),
(N'Mô Hình Hatsune Miku Happy 16th Birthday Ver. 1/7 Figure (GSC)',1,1,2,'PVC',5400000,N'Còn Hàng',' ','4_1.jpeg','31 cm',NULL,N'Có sẵn',2000000),
(N'Mô hình Hatsune Miku - Sakura Hanami Outfit Ver Scale 1/6 Figure Chính Hãng (GSC)',1,1,2,'PVC',5500000,N'Còn Hàng',' ','5_1.jpeg','28 cm',NULL,N'Có sẵn',2000000)
--(N'Mô Hình Nendoroid Himmel - Nendoroid 2498 Frieren: Pháp Sư Tiễn Táng',1,2,6,'PVC',5,1500000,N'Còn Hàng',' ','1.jpg','10 cm','',N'Bình thường',1000000)
GO
-- Thêm phân loại
INSERT INTO Phanloai (ChiTietPhanLoai, MaMoHinh, DonGia, SoLuong) VALUES
(N'NONE', 1, 1700000, 5),
(N'NONE', 2, 3900000, 5),
(N'NONE', 3, 5500000, 5),
(N'NONE', 4, 5400000, 5),
(N'NONE', 5, 5500000, 5)

GO
-- Thêm ảnh mô hình
INSERT INTO AnhMoHinh(LinkAnh, MaMoHinh) VALUES
('1_1.jpeg',1),
('1_2.jpeg',1),
('1_3.jpeg',1),
('1_4.jpeg',1),
('1_5.jpeg',1),
('2_1.jpeg',2),
('2_2.jpeg',2),
('2_3.jpeg',2),
('2_4.jpeg',2),
('3_1.jpeg',3),
('3_2.jpeg',3),
('3_3.jpeg',3),
('3_4.jpeg',3),
('3_5.jpeg',3),
('3_6.jpeg',3),
('4_1.jpeg',4),
('4_2.jpeg',4),
('4_3.jpeg',4),
('4_4.jpeg',4),
('4_5.jpeg',4),
('4_6.jpeg',4),
('4_7.jpeg',4),
('5_1.jpeg',5),
('5_2.jpeg',5),
('5_3.jpeg',5),
('5_4.jpeg',5),
('5_5.jpeg',5),
('5_6.jpeg',5)
