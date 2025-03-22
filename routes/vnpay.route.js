import express from "express"
import { themThanhtoan, layThanhtoan } from '../controllers/vnpay.controller.js'

const router = express.Router()

router.post("/create_payment_url", themThanhtoan)
router.get("/vnpay_return", layThanhtoan)

export default router