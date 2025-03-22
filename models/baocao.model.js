import mongoose from "mongoose";

const baocaoSchema = new mongoose.Schema(
    {
        idNguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: "Nguoidung", required: true },
        idSanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Sanpham" },
        loaiBaoCao: { type: String, required: true },
        noiDung: { type: String, required: true },
        trangThai: { type: String, required: true, default: "Chờ xử lý" },
        phanHoi: { type: String }
    },
    {
        timestamps: true
    }
);

const Baocao = mongoose.model("Baocao", baocaoSchema, "Baocao");

export default Baocao;
