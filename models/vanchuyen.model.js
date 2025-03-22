import mongoose from "mongoose";

const vanchuyenSchema = new mongoose.Schema(
    {
        hoTenNguoiNhan: { type: String, required: true },
        soDienThoai: { type: String, required: true },
        diaChi: { type: String, required: true },
        ghiChu: { type: String },
        phiVanChuyen: { type: Number, required: true },
        maVanDon: { type: String, unique: true },
        donViVanChuyen: { type: String, required: true },
        trangThaiVanChuyen: { type: String, required: true },
        thoiGianGiaoHangDuKien: { type: Date },
        thoiGianBatDauGiao: { type: Date },
        viTriHienTai: { type: String },
        donHangId: { type: mongoose.Schema.Types.ObjectId, ref: "Donhang", required: true }
    },
    {
        timestamps: true
    }
);

const Vanchuyen = mongoose.model("Vanchuyen", vanchuyenSchema, "Vanchuyen");

export default Vanchuyen;