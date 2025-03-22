import mongoose from "mongoose";

const sanphamSchema = new mongoose.Schema(
    {
        tenSP: { type: String, required: true },
        moTaSP: { type: String },
        idDM: { type: mongoose.Schema.Types.ObjectId, ref: "Danhmuc", required: true },
        idCH: { type: mongoose.Schema.Types.ObjectId, ref: "Cuahang", required: true },
        yeuThich: { type: Number, default: 0 },
        phanLoai: [
            {
                idPL: { type: String, required: true }, 
                tenLoai: { type: String, required: true },
                giaLoai: { type: Number, required: true },
                donVi: { type: String, required: true },
                khuyenMai: { type: Number, default: 0 },
                khoHang: { type: Number, default: 0 },
                daBan: { type: Number, default: 0 },
            }
        ],
        trangThai: { type: String, default: "Chờ xác nhận" },
        luotXem: { type: Number, default: 0 },
        dsAnhSP: { type: String },
        certify_image:{type: String},
        nguonGoc: { type: String },
        tongSoSao: { type: Number, default: 0 },
        tongSoDanhGia: { type: Number, default: 0 },
        dsDanhGia: [{ type: mongoose.Schema.Types.ObjectId, ref: "Danhgia", default: [] }],
        dsDonHang: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donhang", default: [] }],
        addressNguoiDuyet:{type: String},
        idNguoiDuyet: { type: mongoose.Schema.Types.ObjectId, ref: "Admin"},

        ngaySX: { type: Date }, 
        loaiTrong: { type: String },  //

        ngayTH: { type: Date}, 

        ngayDG: { type: Date}, 
        hanSX: { type: Date}, 

        batchId: { type: String },
        nguyenNhanTC:{type: String},
        certifier:{type: String}
    },
    {
        timestamps: true
    }
);

const Sanpham = mongoose.model("Sanpham", sanphamSchema, "Sanpham");

export default Sanpham;
