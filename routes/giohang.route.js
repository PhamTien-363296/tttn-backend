import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { addGiohang, getGiohangTheoId, updateChonSPGiohang, updateSoLuongGiohang, xoaSanPhamGiohang } from "../controllers/giohang.controller.js";
const router = express.Router()

router.post("/them",protectRoute,addGiohang)
router.get("/lay",protectRoute,getGiohangTheoId)
router.put("/capnhat", protectRoute, updateSoLuongGiohang);
router.delete("/xoa", protectRoute, xoaSanPhamGiohang);
router.put("/capnhat/chonSP", protectRoute, updateChonSPGiohang);

export default router