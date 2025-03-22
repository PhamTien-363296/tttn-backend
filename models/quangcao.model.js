import mongoose from "mongoose";

const quangcaoSchema = new mongoose.Schema(
    {
        idCuaHang: { type: mongoose.Schema.Types.ObjectId, ref: "Cuahang"},
        loaiQuangCao: { type: String, required: true, enum: ["Cửa Hàng", "Hệ Thống"]},
        linkAnh: { type: String, required: true },
        tieuDe: { type: String, required: true },
        noiDung: { type: String, required: true },
        ngayBatDau: { type: Date, required: true },
        ngayKetThuc: { type: Date, required: true },
        trangThai: { type: String, required: true, enum: ["Chưa diễn ra", "Đang diễn ra", "Đã kết thúc"], default: "Chưa diễn ra"}
    },
    {
        timestamps: true
    }
);

const Quangcao = mongoose.model("Quangcao", quangcaoSchema, "Quangcao");

export default Quangcao;