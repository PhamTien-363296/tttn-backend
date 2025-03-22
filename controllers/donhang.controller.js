import Donhang from "../models/donhang.model.js";
import Giohang from "../models/giohang.model.js"; 
import Cuahang from "../models/cuahang.model.js"; 
import Sanpham from "../models/sanpham.model.js"; 

import moment from "moment";
import Nguoidung from "../models/nguoidung.model.js";

export const taoMaDonHang = async () => {
    const ngayHienTai = moment().format("YYYYMMDD");
    
    // Đếm số đơn hàng đã có trong ngày
    const count = await Donhang.countDocuments({
        ngayDat: { 
            $gte: moment().startOf("day").toDate(), 
            $lt: moment().endOf("day").toDate()
        }
    });

    const soThuTu = String(count + 1).padStart(4, "0"); // Tăng số và định dạng (001, 002,...)
    
    const maDonHang = `DH${ngayHienTai}${soThuTu}`;
    return maDonHang;
};

export const themDonHang = async (req, res) => {
    try {
        const {
            thongTinGiaoHang,
            dsSanPham,
            tongTienHang,
            luuY,
            phiVanChuyen,
            phuongThucThanhToan,
            tongTienThanhToan,
            cuaHangId,
        } = req.body;
        const idND = req.nguoidung._id;
        console.log(dsSanPham);


        if (!thongTinGiaoHang || !dsSanPham || !tongTienHang || !phuongThucThanhToan || !tongTienThanhToan || !cuaHangId) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
        }

        if (!Array.isArray(dsSanPham) || dsSanPham.length === 0) {
            return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ!" });
        }

        const maDonHang = await taoMaDonHang();

        const newOrder = new Donhang({
            maDonHang,
            thongTinGiaoHang,
            dsSanPham,
            tongTienHang,
            luuY,
            phiVanChuyen,
            phuongThucThanhToan,
            tongTienThanhToan,
            cuaHangId,
            khachHangId: idND,
            ngayDat: new Date(),
        });

        const savedOrder = await newOrder.save();

        const giohang = await Giohang.findOne({ idND });

        if (!giohang) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại!" });
        }

        // Lọc lại từng cửa hàng
        giohang.sanPhams = giohang.sanPhams.map((cuaHang) => {
            if (cuaHang.idCH.toString() === cuaHangId.toString()) {
                // Giữ lại các sản phẩm không có trong dsSanPham
                cuaHang.sanPhamChiTiet = cuaHang.sanPhamChiTiet.filter(
                    (sp) => !dsSanPham.some(
                        (item) => item.idSP.toString() === sp.idSP.toString() &&
                                item.phanLoai.idPL === sp.idLoai
                    )
                );
            }
            return cuaHang;
        }).filter(cuaHang => cuaHang.sanPhamChiTiet.length > 0); // Xóa cửa hàng nếu không còn sản phẩm

        await giohang.save();

        for (const item of dsSanPham) {
            const sanPham = await Sanpham.findById(item.idSP);
            if (!sanPham) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
            }
            sanPham.dsDonHang.push(savedOrder._id); // Thêm ID đơn hàng vào sản phẩm
            await sanPham.save(); // Lưu lại thay đổi
        }

        return res.status(201).json({
            message: "Đơn hàng đã được tạo thành công!",
            donhang: savedOrder
        });
    } catch (error) {
        console.error("Lỗi khi thêm đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

export const layDonHangTheoNguoiDung = async (req, res) => {
    try {
        const idND = req.nguoidung._id;

        const donHangs = await Donhang.find({ khachHangId: idND })
        .sort({ ngayDat: -1 })
        .populate({
            path: "cuaHangId",
            select: "tenCH _id"
        })
        .populate({
            path: "dsSanPham.idSP",
            select: "_id tenSP dsAnhSP"
        });


        if (donHangs.length === 0) {
            return res.status(404).json({ message: "Người dùng chưa có đơn hàng nào!" });
        }

        return res.status(200).json({
            message: "Lấy danh sách đơn hàng thành công!",
            donHangs
        });
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

export const layDonHangTheoCuaHang = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const { filter, page = 1, limit = 10 } = req.query;

        const cuaHang = await Cuahang.findOne({ idNguoiDung: idND }).select("_id");
        if (!cuaHang) {
            return res.status(404).json({ message: "Người dùng không sở hữu cửa hàng nào!" });
        }

        const cuaHangId = cuaHang._id;

        let filterStage = { cuaHangId };
        if (filter) {
            const trangThaiMap = {
                choxacnhan: "Chờ xác nhận",
                cholayhang: "Chờ lấy hàng",
                chogiaohang: "Chờ giao hàng",
                hoanthanh: "Hoàn thành",
                dahuy: "Đã hủy"
            };
            if (trangThaiMap[filter]) {
                filterStage.trangThai = trangThaiMap[filter];
            }
        }

        const tong = await Donhang.countDocuments(filterStage);
        const tongPage = Math.ceil(tong / limit);

        const donHangs = await Donhang.find(filterStage)
            .sort({ ngayDat: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select("_id maDonHang ngayDat thongTinGiaoHang.hoVaTen thongTinGiaoHang.sdt tongTienThanhToan trangThai");

        return res.status(200).json({
            message: "Lấy danh sách đơn hàng thành công!",
            tongDonHang: tong,
            tongPage,
            donHangs
        });
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

export const layDonHangTheoId = async (req, res) => {
    try {
        const { id } = req.params;

        const donHang = await Donhang.findById(id).populate("dsSanPham.idSP", "tenSP")

        if (!donHang) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
        }

        return res.status(200).json(donHang);
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

export const capNhatTrangThaiDonHang = async (req, res) => {
    try {
        const { id } = req.params;
        const { trangThai } = req.body;
        const idND = req.nguoidung._id;

        const donHang = await Donhang.findById(id);
        if (!donHang) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
        }

        const nguoiDung = await Nguoidung.findById(idND);
        if (!nguoiDung) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (trangThai === "Hoàn thành" && donHang.trangThai !== "Hoàn thành") {
            for (const item of donHang.dsSanPham) {
                const sanPham = await Sanpham.findById(item.idSP);
                if (!sanPham) continue;

                sanPham.phanLoai.forEach((loai) => {
                    if (loai.idPL === item.phanLoai.idPL) {
                        loai.khoHang -= item.soLuong;
                        loai.daBan = (loai.daBan || 0) + item.soLuong;
                    }
                });

                await sanPham.save();
            }

            nguoiDung.soDuTien += donHang.tongTienHang;
            nguoiDung.nguonTien.push({
                loaiTien: "Cộng",
                soTien: donHang.tongTienHang,
                ngay: Date.now(),
                noidung: `Thanh toán của đơn hàng ${donHang.maDonHang}`,
            });
            await nguoiDung.save();

        }

        donHang.trangThai = trangThai;
        await donHang.save();

        res.status(200).json({ message: "Cập nhật trạng thái thành công!", donHang });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};
