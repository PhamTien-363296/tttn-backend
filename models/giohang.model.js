import mongoose from "mongoose";

const giohangSchema = new mongoose.Schema(
    {
        idND: { type: mongoose.Schema.Types.ObjectId, ref: "Nguoidung", required: true },
        sanPhams: [
            {
                idCH: { type: mongoose.Schema.Types.ObjectId, ref: "Cuahang", required: true },
                sanPhamChiTiet: [
                    {
                        idSP: { type: mongoose.Schema.Types.ObjectId, ref: "Sanpham", required: true },
                        idLoai: { type: String, required: true },
                        soLuong: { type: Number, required: true, min: 1 },
                        checked: { type: Boolean, default: false },
                    }
                ]
            }
        ]
    },
    { timestamps: true }
);

const Giohang = mongoose.model("Giohang", giohangSchema, "Giohang");

export default Giohang;
