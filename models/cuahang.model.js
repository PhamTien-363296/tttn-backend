import mongoose from "mongoose";

const cuahangSchema = new mongoose.Schema(
    {
        tenCH: { type: String, required: true },
        anhCH: { type: String },
        moTaCH: { type: String },
        idNguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: "Nguoidung", required: true },
        dsQuangCao: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quangcao", default: [] }],
        dsSanPham: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sanpham", default: [] }],
        diaChiCH: { type: String, required: true },
        trangThaiCH: { type: String, default: "Chờ xác nhận" },
        nguyenNhanTC: { type: String },
        emailCH: { type: String, required: true },
        soDienThoaiCH: { type: String, required: true },
        cidChungNhan: { type: String, required: true },
        thongTinThue: {
            loaiHinhKD: { type: String, required: true },
            diaChiDK: { type: String, required: true },
            emailHD: { type: String, required: true },
            maSoThue: { type: String, required: true }
        },
        thongTinDinhDanh: {
            loaiThe: { type: String, required: true },
            hinhChup: { type: String, required: true },
            soDinhDanh: { type: String, required: true },
            hoVaTen: { type: String, required: true }
        }
    },
    {
        timestamps: true
    }
);

const Cuahang = mongoose.model("Cuahang", cuahangSchema, "Cuahang");

export default Cuahang;