import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    tenAdmin: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    matKhau: { type: String }, 
    phanQuyen: { 
      type: [String], 
      required: true,
      enum: [ "CERTIFIER","INSPECTOR","SUPER_AM"]
    },
    trangThai: { 
      type: String, 
      required: true, 
      enum: ["active", "inactive", "suspended"], 
      default: "active" 
    },
    address:{
      type: String
    }
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema, "Admin");

export default Admin;
