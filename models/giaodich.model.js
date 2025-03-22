import mongoose from "mongoose";

const giaodichSchema = new mongoose.Schema(
    {
        idDonHang: { type: mongoose.Schema.Types.ObjectId, ref: "Donhang", required: false },
        idNguoiDungGD: { type: mongoose.Schema.Types.ObjectId, ref: "Nguoidung" },
        soTien: { type: Number, required: true },
        dongTien: { type: String, required: true, enum: ["Cộng", "Trừ"] },
        loaiGiaoDich: { type: String, required: true, enum: ["Rút tiền", "Thanh toán"] },
        thongTinGiaoDich: {
            maGiaoDich: { type: Number, required: false },
            trangThaiThanhToan: { type: String, required: false },
            loaiThanhToan: { type: String },
            loaiThe: { type: String },
            loaiGiaoDich: { type: String },
            soTien: { type: Number },
            ngayGiaoDich: { type: Date, default: Date.now }
        },
        thongTinRutTien: {
            soTaiKhoan: { type: String, required: false },
            tenNganHang: { type: String, required: false },
            chuTaiKhoan: { type: String, required: false }
        },
        trangThai: { type: String, enum: ["Chờ xử lý", "Đã xử lý", "Đang xử lý", "Từ chối"], default: "Chờ xử lý" },
        noiDung: { type: String },
        nguoiXuLy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    },
    {
        timestamps: true
    }
);

const Giaodich = mongoose.model("Giaodich", giaodichSchema, "Giaodich");

export default Giaodich;