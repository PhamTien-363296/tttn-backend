import Giaodich from "../models/giaodich.model.js";
import Donhang from "../models/donhang.model.js";
import Nguoidung from "../models/nguoidung.model.js";

export const themGiaoDich = async (req, res) => {
    try {
        const {
            idDonHang,
            soTien,
            dongTien,
            loaiGiaoDich,
            thongTinGiaoDich,
        } = req.body;
        // const idND = req.nguoidung._id;

        if (!idDonHang || !soTien || !dongTien || !loaiGiaoDich || !thongTinGiaoDich) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
        }

        const donHang = await Donhang.findById(idDonHang);
        if (!donHang) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        const idND = donHang.khachHangId;

        const newGiaoDich = new Giaodich({
            idDonHang,
            idNguoiDungGD: idND,
            soTien,
            dongTien,
            loaiGiaoDich,
            thongTinGiaoDich,
            trangThai: "Đã xử lý",
            noiDung: "Giao dịch từ đơn hàng " + idDonHang,
        });

        const savedGiaoDich= await newGiaoDich.save();

        donHang.idGiaoDich = savedGiaoDich._id;
        await donHang.save();

        return res.status(201).json({
            message: "Giao dịch đã được thêm thành công!",
            giaoDichId: savedGiaoDich._id
        });
    } catch (error) {
        console.error("Lỗi khi thêm giao dịch:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

export const getGiaoDichById = async (req, res) => {
    try {
        const { id } = req.params;
        const giaodich = await Giaodich.findById(id);
        if (!giaodich) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        }

        res.status(200).json({ giaodich });
    } catch (error) {
        console.error("Lỗi khi lấy giao dịch:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const themYeuCauRutTien = async (req, res) => {
    try {
        const {
            soTien,
            thongTinRutTien,
        } = req.body;
        const idND = req.nguoidung._id;

        if (!soTien || !thongTinRutTien ) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
        }

        if(soTien < 0 || soTien > 1000000000){
            return res.status(400).json({ message: "Số tiền không hợp lệ!" });
        }

        const nguoiDung = await Nguoidung.findById(idND);
        if (!nguoiDung) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        if(nguoiDung.soDuTien <= 0){
            return res.status(400).json({ message: "Số dư tài khoản không đủ!" });
        }

        if(nguoiDung.soDuTien < soTien){
            return res.status(400).json({ message: "Số dư tài khoản không đủ!" });
        }

        const newGiaoDich = new Giaodich({
            idNguoiDungGD: idND,
            soTien,
            dongTien: "Trừ",
            loaiGiaoDich: "Rút tiền",
            thongTinRutTien,
            trangThai: "Chờ xử lý",
            noiDung: "Yêu cầu rút tiền từ tài khoản " + idND + " với số tiền " + soTien + " VND",
        });

        const savedGiaoDich= await newGiaoDich.save();

        nguoiDung.dsGiaoDich = savedGiaoDich._id;
        nguoiDung.soDuTien -= soTien;
        await nguoiDung.save();

        return res.status(201).json({
            message: "Giao dịch đã được thêm thành công!",
            giaoDichId: savedGiaoDich._id
        });
    } catch (error) {
        console.error("Lỗi khi thêm giao dịch:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

export const getTatCaGiaoDichThanhToan = async (req, res) => {
    try {
        const giaodich = await Giaodich.find({loaiGiaoDich: "Thanh toán"}).populate("idNguoiDungGD", "tenNguoiDung").populate("idDonHang", "maDonHang").sort({ createdAt: -1 });
        if (!giaodich) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        }

        res.status(200).json(giaodich);
    } catch (error) {
        console.error("Lỗi khi lấy giao dịch:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
}

export const getGiaoDichRutTienByNguoiDungId = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const giaodich = await Giaodich.find({ idNguoiDungGD: idND, loaiGiaoDich: "Rút tiền" });
        if (!giaodich) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        }

        res.status(200).json(giaodich);
    } catch (error) {
        console.error("Lỗi khi lấy giao dịch:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const getTatCaGiaoDichRutTien = async (req, res) => {
    try {
        const giaodich = await Giaodich.find({ loaiGiaoDich: "Rút tiền" })
            .populate("idNguoiDungGD", "tenNguoiDung")
            .populate("nguoiXuLy", "tenAdmin")
            .sort({ createdAt: -1 }) 
        
        if (!giaodich) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        }

        res.status(200).json(giaodich);
    } catch (error) {
        console.error("Lỗi khi lấy giao dịch:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const updateGiaoDich = async (req, res) => {
    try {
        const { id } = req.params;
        const idAdmin = req.admin._id;
        const { trangThai } = req.body;
        console.log("idAdmin", idAdmin);
        const giaodich = await Giaodich.findById(id);
        if (!giaodich) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        }

        giaodich.trangThai = trangThai;
        giaodich.nguoiXuLy = idAdmin;
        await giaodich.save();

        res.status(200).json({ message: "Cập nhật giao dịch thành công!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật giao dịch:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

