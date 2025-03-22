import Cuahang from "../models/cuahang.model.js";
import Nguoidung from "../models/nguoidung.model.js";
import Quangcao from "../models/quangcao.model.js";
import {v2 as cloudinary} from 'cloudinary'

export const themQuangCao = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const { loaiQuangCao, hinhAnh, tieuDe, noiDung, ngayBatDau, ngayKetThuc} = req.body;

        if (!loaiQuangCao || !hinhAnh || !tieuDe || !noiDung || !ngayBatDau || !ngayKetThuc) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const nguoiDung = await Nguoidung.findById(idND)
        if(nguoiDung.vaiTro != "seller"){
            return res.status(401).json({ error: "Bạn không có quyền thêm quảng cáo" });
        }


        let linkAnh = hinhAnh; 

        if (hinhAnh) {
            try {
                const uploadResult = await cloudinary.uploader.upload(hinhAnh);
                linkAnh = uploadResult.secure_url;
            } catch (uploadError) {
                console.log("Lỗi upload ảnh quảng cáo:", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh quảng cáo lên Cloudinary" });
            }
        }

        const cuaHang = await Cuahang.findOne({ idNguoiDung: idND })

        const newQuangCao = new Quangcao({
            idCuaHang: cuaHang._id,
            loaiQuangCao,
            linkAnh,
            tieuDe,
            noiDung,
            ngayBatDau,
            ngayKetThuc
        });

        await newQuangCao.save();
        res.status(201).json({ message: "Thêm quảng cáo thành công!", quangcao: newQuangCao });
    } catch (error) {
        console.error("Lỗi khi thêm quảng cáo:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const themQuangCaoAdmin = async (req, res) => {
    try {
        const { loaiQuangCao, hinhAnh, tieuDe, noiDung, ngayBatDau, ngayKetThuc} = req.body;

        if (!loaiQuangCao || !hinhAnh || !tieuDe || !noiDung || !ngayBatDau || !ngayKetThuc) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        let linkAnh = hinhAnh; 

        if (hinhAnh) {
            try {
                const uploadResult = await cloudinary.uploader.upload(hinhAnh);
                linkAnh = uploadResult.secure_url;
            } catch (uploadError) {
                console.log("Lỗi upload ảnh quảng cáo:", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh quảng cáo lên Cloudinary" });
            }
        }

        const newQuangCao = new Quangcao({
            loaiQuangCao,
            linkAnh,
            tieuDe,
            noiDung,
            ngayBatDau,
            ngayKetThuc
        });

        await newQuangCao.save();
        res.status(201).json({ message: "Thêm quảng cáo thành công!", quangcao: newQuangCao });
    } catch (error) {
        console.error("Lỗi khi thêm quảng cáo:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const layQuangCao = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const cuaHang = await Cuahang.findOne({ idNguoiDung: idND });
        if (!cuaHang) {
            return res.status(404).json({ success: false, message: "Cửa hàng không tồn tại" });
        }
        const quangCao = await Quangcao.find({idCuaHang: cuaHang._id});
        res.status(200).json(quangCao);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

export const layQuangCaoAdmin = async (req, res) => {
    try {
        const quangCao = await Quangcao.find({ loaiQuangCao: "Hệ Thống" });
        res.status(200).json(quangCao);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

export const layQuangCaoADangDienRa = async (req, res) => {
    try {
        const quangCao = await Quangcao.find({ trangThai: "Đang diễn ra", loaiQuangCao: "Hệ Thống" });
        res.status(200).json(quangCao);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

export const layQuangCaoDangDienRaCuaCuaHang = async (req, res) => {
    try {
        const { id } = req.params;
        const quangCao = await Quangcao.find({ 
            idCuaHang: id, 
            trangThai: "Đang diễn ra" 
        });

        if (!quangCao || quangCao.length === 0) {
            return res.status(200).json({ success: false, message: "Không có quảng cáo nào đang diễn ra cho cửa hàng này" });
        }

        res.status(200).json(quangCao);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


export const suaQuangCao = async (req, res) => {
    try {
        const { id } = req.params;
        const { loaiQuangCao, hinhAnh, tieuDe, noiDung, ngayBatDau, ngayKetThuc, trangThai } = req.body;

        if (!loaiQuangCao || !tieuDe || !noiDung || !ngayBatDau || !ngayKetThuc || !trangThai) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        let linkAnh = hinhAnh; 
        if (hinhAnh) {
            try {
                const uploadResult = await cloudinary.uploader.upload(hinhAnh);
                linkAnh = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Lỗi upload ảnh:", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh lên Cloudinary!" });
            }
        }

        const quangCao = await Quangcao.findById(id);
        if (!quangCao) {
            return res.status(404).json({ error: "Quảng cáo không tồn tại!" });
        }

        // Cập nhật thông tin quảng cáo
        quangCao.loaiQuangCao = loaiQuangCao;
        quangCao.linkAnh = linkAnh || quangCao.linkAnh;
        quangCao.tieuDe = tieuDe;
        quangCao.noiDung = noiDung;
        quangCao.ngayBatDau = ngayBatDau;
        quangCao.ngayKetThuc = ngayKetThuc;
        quangCao.trangThai = trangThai;

        await quangCao.save();
        res.status(200).json({ message: "Cập nhật quảng cáo thành công!", quangcao: quangCao });
    } catch (error) {
        console.error("Lỗi khi sửa quảng cáo:", error);
        res.status(500).json({ error: "Lỗi server!" });
    }
};

export const xoaQuangCao = async (req, res) => {
    try {
        const { id } = req.params;

        const quangCao = await Quangcao.findById(id);
        if (!quangCao) {
            return res.status(404).json({ error: "Quảng cáo không tồn tại!" });
        }

        await Quangcao.findByIdAndDelete(id);
        res.status(200).json({ message: "Xóa quảng cáo thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa quảng cáo:", error);
        res.status(500).json({ error: "Lỗi server!" });
    }
};
