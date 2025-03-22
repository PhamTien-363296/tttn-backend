import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwtAdmin; 

    if (!token) {
      return res.status(401).json({ error: "Bạn cần đăng nhập trước" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    if (!decoded) {
      return res.status(401).json({ error: "Token không hợp lệ" });
    }

    console.log("Decoded token:", decoded); 

    const admin = await Admin.findById(decoded.idAdmin).select("-matKhau"); 
    if (!admin) {
      return res.status(401).json({ error: "Không tìm thấy admin" });
    }

    if (admin.trangThai !== "active") {
      return res.status(403).json({ error: "Tài khoản của bạn bị vô hiệu hóa" });
    }

    req.admin = admin; 
    next();
  } catch (error) {
    console.log("Lỗi protectAdmin:", error.message);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
