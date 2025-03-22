import Nguoidung from "../models/nguoidung.model.js";
import Giohang from "../models/giohang.model.js";
import Cuahang from "../models/cuahang.model.js";
import Sanpham from "../models/sanpham.model.js";

export const addGiohang = async (req, res) => {
    try {
        const idND = req.nguoidung._id.toString();
        const { idSP, idLoai, soLuong } = req.body;
        console.log(req.body)

        if (!idSP || !soLuong || !idLoai) {
            return res.status(400).json({ message: "Cần cung cấp id sản phẩm, id phân loại và số lượng" });
        }

        const nguoiDung = await Nguoidung.findById(idND);
        if (!nguoiDung) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        const sanPham = await Sanpham.findById(idSP);

        if (!sanPham) {
            return console.log("Không tìm thấy sản phẩm!");
        }

        let giohang = await Giohang.findOne({ idND });

        if (!giohang) {
            giohang = new Giohang({
                idND,
                sanPhams: [{
                    idCH: sanPham.idCH,
                    sanPhamChiTiet: [{
                        idSP,
                        idLoai,
                        soLuong
                    }]
                }]
            });
        } else {
            const indexCH = giohang.sanPhams.findIndex(sp => sp.idCH.toString() === sanPham.idCH.toString());

            if (indexCH !== -1) {
                // Nếu cửa hàng đã có trong giỏ hàng, kiểm tra sản phẩm trong cửa hàng đó
                const indexSP = giohang.sanPhams[indexCH].sanPhamChiTiet.findIndex(
                    sp => sp.idSP.toString() === idSP.toString() && sp.idLoai.toString() === idLoai.toString()
                );

                if (indexSP !== -1) {
                    // Nếu sản phẩm đã tồn tại, cập nhật số lượng
                    giohang.sanPhams[indexCH].sanPhamChiTiet[indexSP].soLuong += soLuong;
                } else {
                    // Nếu sản phẩm chưa có, thêm vào danh sách sản phẩm của cửa hàng đó
                    giohang.sanPhams[indexCH].sanPhamChiTiet.push({ idSP, idLoai, soLuong });
                }
            } else {
                // Nếu cửa hàng chưa có trong giỏ hàng, thêm cửa hàng mới với sản phẩm
                giohang.sanPhams.push({
                    idCH: sanPham.idCH,
                    sanPhamChiTiet: [{ idSP, idLoai, soLuong }]
                });
            }
        }

        await giohang.save();

        res.status(201).json({ message: "Đã thêm sản phẩm vào giỏ hàng", giohang });

    } catch (error) {
        console.log("Lỗi thêm sản phẩm vào giỏ hàng", error.message);
        return res.status(500).json({ error: "Lỗi 500 - Server Error" });
    }
};

export const getGiohangTheoId = async (req, res) => {
    try {
        const idND = req.nguoidung._id.toString();

        const giohang = await Giohang.findOne({ idND })
            .populate({
                path: "sanPhams.idCH",
                select: "tenCH _id"
            })
            .populate({
                path: "sanPhams.sanPhamChiTiet.idSP",
                select: "tenSP phanLoai dsAnhSP idCH"
            });

        if (!giohang) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        res.status(200).json({ giohang });

    } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error.message);
        res.status(500).json({ error: "Lỗi 500 - Server Error" });
    }
};

export const updateSoLuongGiohang = async (req, res) => {
    try {
        const idND = req.nguoidung._id.toString();
        const { idSP, idLoai, soLuong } = req.body;

        if (!idSP || !idLoai || !soLuong) {
            return res.status(400).json({ message: "Thiếu thông tin cập nhật giỏ hàng" });
        }

        let giohang = await Giohang.findOne({ idND });

        if (!giohang) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        let updated = false;

        giohang.sanPhams.forEach((cuaHang) => {
            const sanPhamIndex = cuaHang.sanPhamChiTiet.findIndex(
                sp => sp.idSP.toString() === idSP.toString() && sp.idLoai.toString() === idLoai.toString()
            );

            if (sanPhamIndex !== -1) {
                cuaHang.sanPhamChiTiet[sanPhamIndex].soLuong = soLuong;
                updated = true;
            }
        });

        if (!updated) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        }

        giohang.sanPhams = giohang.sanPhams.filter(cuaHang => cuaHang.sanPhamChiTiet.length > 0);

        await giohang.save();
        giohang = await Giohang.findOne({ idND })
            .populate({
                path: "sanPhams.idCH",
                select: "tenCH _id"
            })
            .populate({
                path: "sanPhams.sanPhamChiTiet.idSP",
                select: "tenSP phanLoai dsAnhSP idCH"
            });

        res.status(200).json({ message: "Cập nhật số lượng thành công", giohang });
    } catch (error) {
        console.error("Lỗi cập nhật giỏ hàng:", error.message);
        res.status(500).json({ error: "Lỗi 500 - Server Error" });
    }
};

export const xoaSanPhamGiohang = async (req, res) => {
    try {
        const idND = req.nguoidung._id.toString();
        const { idSP, idLoai } = req.body;

        if (!idSP || !idLoai) {
            return res.status(400).json({ message: "Thiếu thông tin xóa sản phẩm" });
        }

        let giohang = await Giohang.findOne({ idND });

        if (!giohang) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        let deleted = false;

        giohang.sanPhams.forEach((cuaHang) => {
            const sanPhamIndex = cuaHang.sanPhamChiTiet.findIndex(
                sp => sp.idSP.toString() === idSP.toString() && sp.idLoai.toString() === idLoai.toString()
            );

            if (sanPhamIndex !== -1) {
                cuaHang.sanPhamChiTiet.splice(sanPhamIndex, 1);
                deleted = true;
            }
        });

        if (!deleted) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        }

        // Xóa cửa hàng nếu không còn sản phẩm
        giohang.sanPhams = giohang.sanPhams.filter(cuaHang => cuaHang.sanPhamChiTiet.length > 0);

        // Nếu giỏ hàng không còn sản phẩm, xóa luôn giỏ hàng
        if (giohang.sanPhams.length === 0) {
            await Giohang.findOneAndDelete({ idND });
            return res.status(200).json({ message: "Xóa sản phẩm thành công, giỏ hàng trống" });
        }

        await giohang.save();
        giohang = await Giohang.findOne({ idND })
        .populate({
            path: "sanPhams.idCH",
            select: "tenCH _id"
        })
        .populate({
            path: "sanPhams.sanPhamChiTiet.idSP",
            select: "tenSP phanLoai dsAnhSP idCH"
        });
        res.status(200).json({ message: "Xóa sản phẩm thành công", giohang });

    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error.message);
        res.status(500).json({ error: "Lỗi 500 - Server Error" });
    }
};

export const updateChonSPGiohang = async (req, res) => {
    try {
        const idND = req.nguoidung._id.toString();
        const { idSP, idLoai, checked } = req.body;

        if (!idSP || !idLoai) {
            return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
        }

        let giohang = await Giohang.findOne({ idND });

        if (!giohang) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        const sanPham = giohang.sanPhams.find(sp =>
            sp.sanPhamChiTiet.some(ct => ct.idSP.toString() === idSP.toString() && ct.idLoai.toString() === idLoai.toString())
        );

        if (!sanPham) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        }

        sanPham.sanPhamChiTiet.forEach(ct => {
            if (ct.idSP.toString() === idSP.toString() && ct.idLoai.toString() === idLoai.toString()) {
                ct.checked = checked;
            }
        });

        await giohang.save();

        giohang = await Giohang.findOne({ idND })
            .populate({
                path: "sanPhams.idCH",
                select: "tenCH _id"
            })
            .populate({
                path: "sanPhams.sanPhamChiTiet.idSP",
                select: "tenSP phanLoai dsAnhSP idCH"
            });

        res.status(200).json({ message: "Cập nhật sản phẩm thành công", giohang });

    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error.message);
        res.status(500).json({ error: "Lỗi 500 - Server Error" });
    }
};

