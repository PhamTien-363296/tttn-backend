import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { capNhat, layNguoiDungQuaId, layNguoiDungTN, layYeuThich, updateThongTinGiaoHang, yeuThich } from "../controllers/nguoidung.controller.js";
const router = express.Router()

router.patch("/capnhat/yeuthich/:id",protectRoute,yeuThich);
router.get("/lay/yeuthich",protectRoute,layYeuThich)

router.put("/capnhat/thongtinGiaoHang",protectRoute,updateThongTinGiaoHang);
router.get("/tatca", protectRoute, layNguoiDungTN);
router.patch("/update",protectRoute,capNhat)
router.get("/lay/:id",protectRoute,layNguoiDungQuaId)

export default router