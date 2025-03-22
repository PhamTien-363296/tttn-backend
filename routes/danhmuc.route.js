import express from "express"
import {addDanhMuc, getDanhMuc, suaDanhMuc} from '../controllers/danhmuc.controller.js'

const router = express.Router()

router.post("/them", addDanhMuc)
router.get("/lay", getDanhMuc)
router.patch("/sua/:id", suaDanhMuc)

export default router