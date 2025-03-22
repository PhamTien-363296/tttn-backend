import mongoose from "mongoose";

const donhangSchema = new mongoose.Schema(
    {
        maDonHang: { type: String },
        thongTinGiaoHang: {
            hoVaTen: { type: String, required: true },
            sdt: { type: String, required: true },
            diaChi: { type: String, required: true },
        },
        dsSanPham: [
            {
                idSP: { type: mongoose.Schema.Types.ObjectId, ref: "Sanpham", required: true },
                phanLoai: {
                    idPL: { type: String },
                    tenLoai: { type: String, required: true },
                    giaLoai: { type: Number, required: true },
                    khuyenMai: { type: Number, default: 0 },
                },
                soLuong: { type: Number, required: true }
            }
        ],
        tongTienHang: { type: Number, required: true },
        luuY: { type: String, default: "" },
        phiVanChuyen: { type: Number, required: true },
        phuongThucThanhToan: { type: String, required: true },
        tongTienThanhToan: { type: Number, required: true },
        trangThai: { type: String, required: true, default: "Chờ xác nhận" },
        cuaHangId: { type: mongoose.Schema.Types.ObjectId, ref: "Cuahang", required: true },
        khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: "Nguoidung", required: true },
        ngayDat: { type: Date, default: Date.now },
        ngayHoanThanh: { type: Date },
        idGiaoDich: { type: mongoose.Schema.Types.ObjectId, ref: "Giaodich" },
        idVanChuyen: { type: mongoose.Schema.Types.ObjectId, ref: "Vanchuyen" },
        idDanhGia: [{ type: mongoose.Schema.Types.ObjectId, ref: "Danhgia" }],
    },
    {
        timestamps: true
    }
);

const Donhang = mongoose.model("Donhang", donhangSchema, "Donhang");

export default Donhang;
