import express from "express";
import { layTinNhan, guiTinNhan } from "../controllers/tinnhan.controller.js";
import { protectRoute } from "../middleware/protectRoute.js"

const router = express.Router();

router.get("/:id", protectRoute, layTinNhan);
router.post("/gui/:id", protectRoute, guiTinNhan);

export default router;