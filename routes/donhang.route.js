import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { capNhatTrangThaiDonHang, layDonHangTheoCuaHang, layDonHangTheoId, layDonHangTheoNguoiDung, themDonHang } from "../controllers/donhang.controller.js"
const router = express.Router()

router.post("/them",protectRoute, themDonHang)
router.get("/lay/theonguoidung",protectRoute, layDonHangTheoNguoiDung)
router.get("/lay/theocuahang",protectRoute,layDonHangTheoCuaHang)
router.get("/lay/theoid/:id",layDonHangTheoId)
router.put("/capnhat/:id",protectRoute,capNhatTrangThaiDonHang)

export default router