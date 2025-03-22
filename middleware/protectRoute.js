import Nguoidung from '../models/nguoidung.model.js'
import jwt from "jsonwebtoken"


export const protectRoute = async (req,res,next)=>{
    try{
        let token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({error:"Bạn cần đăng nhập trước"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({error:"không xác thực : token không hợp lệ"})
        }
        const nguoidung = await Nguoidung.findById(decoded.idNguoidung).select("-matKhau")
        if(!nguoidung){
            return res.status(401).json({error:"Không tìm thấy người dùng"})
        }
        req.nguoidung = nguoidung
        next()
    } catch(error){
        console.log("Lỗi protectRoute ",error.message)
        return res.status(500).json({error:" Lỗi 500" })
    }
}
