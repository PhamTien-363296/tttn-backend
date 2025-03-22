import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { layQuangCao, layQuangCaoADangDienRa, layQuangCaoAdmin, layQuangCaoDangDienRaCuaCuaHang, suaQuangCao, themQuangCao, themQuangCaoAdmin, xoaQuangCao } from "../controllers/quangcao.controller.js"
const router = express.Router()

router.post("/them", protectRoute, themQuangCao)
router.post("/admin/them", themQuangCaoAdmin)

router.get("/lay", protectRoute, layQuangCao )
router.get("/admin/lay", layQuangCaoAdmin)
router.get("/admin/lay/dangdienra", layQuangCaoADangDienRa )
router.get("/lay/dangdienra/:id", layQuangCaoDangDienRaCuaCuaHang )

router.put("/capnhat/:id", suaQuangCao )
router.delete("/xoa/:id", xoaQuangCao )

export default router