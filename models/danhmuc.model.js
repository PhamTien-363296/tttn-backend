import mongoose from "mongoose";

const danhmucSchema = new mongoose.Schema(
    {
        tenDM: {
            type: String,
            required: true,
            unique: true
        },
        dsSanPham: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Sanpham",
                default: []
            }
        ],
        anhDM:{
            type: String,
        }
    },
    {
        timestamps: true
    }
);

const Danhmuc = mongoose.model("Danhmuc", danhmucSchema, "Danhmuc");

export default Danhmuc;
