import express from "express"
import { addCuaHang, capNhat, duyetCuaHang, getAllCuaHang, getAnhCH, getCuaHangById, getCuaHangChoXacNhan, getPopularShops, getTatCaCuaHang, theoDoi } from "../controllers/cuahang.controller.js"
import { protectRoute } from "../middleware/protectRoute.js"
import { protectAdmin } from "../middleware/protectAdmin.js"
const router = express.Router()

router.post("/them", protectRoute, addCuaHang)
router.get("/lay/:id", protectRoute , getCuaHangById)
router.get("/lay", protectRoute , getAnhCH)

router.patch("/update-status/:idCuaHang",protectAdmin, duyetCuaHang);

router.get("/laytatca", getAllCuaHang)
router.post("/theodoi/:id", protectRoute, theoDoi)
router.patch("/update",protectRoute,capNhat)

router.get("/popular-shop", getPopularShops)
router.get("/cuahang-choxacnhan", getCuaHangChoXacNhan)
router.get("/laytatca/admin", getTatCaCuaHang)


export default router