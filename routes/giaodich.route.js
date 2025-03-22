import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { getGiaoDichById, getGiaoDichRutTienByNguoiDungId, getTatCaGiaoDichRutTien, getTatCaGiaoDichThanhToan, themGiaoDich, themYeuCauRutTien, updateGiaoDich } from "../controllers/giaodich.controller.js"
import { protectAdmin } from "../middleware/protectAdmin.js"
import { get } from "mongoose"
const router = express.Router()

router.post("/them", themGiaoDich)
router.get("/lay/:id", getGiaoDichById)

router.post("/them-ruttien", protectRoute, themYeuCauRutTien)
router.get("/lay-tatca-thanhtoan", getTatCaGiaoDichThanhToan)
router.get("/lay-ruttien",protectRoute, getGiaoDichRutTienByNguoiDungId)
router.get("/lay-tatca-ruttien", getTatCaGiaoDichRutTien)

router.patch("/capnhat/:id",protectAdmin, updateGiaoDich)

export default router