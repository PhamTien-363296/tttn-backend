import express from "express"
import { createAdmin, getCertifiers, getMeAdmin, loginAdmin, loginCertifier, logoutAdmin } from "../controllers/admin.controller.js"
import { protectAdmin } from "../middleware/protectAdmin.js"
const router = express.Router()


router.post("/login",loginAdmin)
router.post("/certifier-login",loginCertifier)
router.get("/getme",protectAdmin,getMeAdmin)
router.post("/create-admin",protectAdmin ,createAdmin);
router.post("/logout", logoutAdmin);

router.get("/lay/certifier",getCertifiers)

export default router