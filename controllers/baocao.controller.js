import Baocao from "../models/baocao.model.js";

export const addBaoCao = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const { id } = req.params;
        const { loaiBaoCao, noiDung } = req.body;

        if (!loaiBaoCao || !noiDung) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const newBaocao = new Baocao({
            idNguoiDung: idND,
            idSanPham: id,
            loaiBaoCao,
            noiDung,
        });

        await newBaocao.save();
        res.status(201).json({ message: "Thêm báo cáo thành công!", baocao: newBaocao });
    } catch (error) {
        console.error("Lỗi khi thêm báo cáo:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const getAllExport = async (req, res) => {
    try {
        const baocaoList = await Baocao.find(
            { trangThai: "Chờ xử lý" }, 
            "noiDung loaiBaoCao trangThai createdAt updatedAt"
        )
            .populate("idNguoiDung", "tenNguoiDung")
            .populate("idSanPham", "tenSP");

        const formattedList = baocaoList.map(baocao => ({
            ...baocao.toObject(),
            createdAt: new Date(baocao.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            updatedAt: new Date(baocao.updatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        }));

        res.status(200).json(formattedList);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách báo cáo:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


export const addReportFromSupport = async (req, res) => {
    try {
        const idsupp = req.nguoidung._id;
        const { loaiBaoCao, noiDung } = req.body;

        if (!loaiBaoCao || !noiDung) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const newBaocao = new Baocao({
            idNguoiDung: idsupp,
            loaiBaoCao,
            noiDung,
        });

        await newBaocao.save();
        res.status(201).json({ message: "Thêm báo cáo từ hỗ trợ thành công!", baocao: newBaocao });
    } catch (error) {
        console.error("Lỗi khi thêm báo cáo từ hỗ trợ:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


export const updateReport= async (req, res) => {
    try {
        const { id } = req.params;
        const { trangThai, phanHoi } = req.body;

        const baoCao = await Baocao.findByIdAndUpdate(
            id,
            { trangThai, phanHoi },
            { new: true, runValidators: true }
        );

        if (!baoCao) {
            return res.status(404).json({ message: "Không tìm thấy báo cáo" });
        }

        res.json({ message: "Cập nhật thành công", baoCao });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

export const getRepliedReports = async (req, res) => {
    try {
        const idNguoiDung = req.nguoidung._id; 

        const baocaoList = await Baocao.find(
            { idNguoiDung, trangThai: "Đã phản hồi" }, 
            "noiDung loaiBaoCao trangThai createdAt updatedAt phanHoi"
        )
        .populate("idNguoiDung", "tenNguoiDung")
        .populate("idSanPham", "tenSP");

        const formattedList = baocaoList.map(baocao => ({
            ...baocao.toObject(),
            tenSanPham: baocao.idSanPham ? baocao.idSanPham.tenSP : null,
            createdAt: new Date(baocao.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            updatedAt: new Date(baocao.updatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        }));

        res.status(200).json(formattedList);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách báo cáo đã phản hồi:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};
