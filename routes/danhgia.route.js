import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { themDanhGia } from "../controllers/danhgia.controller.js"
const router = express.Router()

router.post("/them",protectRoute, themDanhGia);

export default router