import mongoose from "mongoose";

const danhgiaSchema = new mongoose.Schema(
    {
        soSao: { type: Number },
        noiDung: { type: String },
        idDonHang: { type: mongoose.Schema.Types.ObjectId, ref: "Donhang" },
        idSanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Sanpham" },
        khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: "Nguoidung" },
        tenLoai: { type: String },
        // hinhAnh: { type: String }
    },
    {
        timestamps: true
    }
);

const Danhgia = mongoose.model("Danhgia", danhgiaSchema, "Danhgia");

export default Danhgia;
