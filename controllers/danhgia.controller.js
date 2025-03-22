import Danhgia from "../models/danhgia.model.js"; 
import Donhang from "../models/donhang.model.js"; 
import Sanpham from "../models/sanpham.model.js"; 

export const themDanhGia = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const { idDonHang, sanPhamDanhGia } = req.body;

        console.log("Nội dung body đánh giá:", req.body);

        if (!sanPhamDanhGia || sanPhamDanhGia.length === 0 || !idDonHang) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin đánh giá!" });
        }

        const donHang = await Donhang.findById(idDonHang);
        if (!donHang) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        if (donHang.idDanhGia && donHang.idDanhGia.length > 0) {
            return res.status(400).json({ message: "Đơn hàng đã có đánh giá!" });
        }

        const danhGiaIds = await Promise.all(
            sanPhamDanhGia.map(async (sp) => {
                const danhGia = new Danhgia({
                    idDonHang: idDonHang,
                    khachHangId: idND,
                    idSanPham: sp.idSP._id,
                    soSao: sp.soSao || 5,
                    noiDung: sp.noiDung || "",
                    tenLoai: sp.phanLoai.tenLoai,
                });
                const danhGiaLuu = await danhGia.save();

                const sanPham = await Sanpham.findById(sp.idSP._id);
                if (!sanPham) {
                    return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
                }

                sanPham.dsDanhGia.push(danhGiaLuu._id);
                sanPham.tongSoSao += sp.soSao;
                sanPham.tongSoDanhGia++;
                await sanPham.save();

                return danhGiaLuu._id;
            })
        );

        donHang.idDanhGia = danhGiaIds;
        await donHang.save();

        res.status(201).json({
            message: "Đánh giá đã được thêm thành công!",
            idDanhGia: danhGiaIds
        });
    } catch (error) {
        console.error("Lỗi khi thêm đánh giá:", error);
        res.status(500).json({ message: "Lỗi server!", error });
    }
};


