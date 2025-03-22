import express from "express"
import { getAllAdmin, getAllInspector, getAllProduct, getAllProductById, getAllStore } from "../controllers/blockchain.controller.js"

const router = express.Router()


router.get("/all/admin", getAllAdmin)
router.get("/all/inspector", getAllInspector)
router.get("/all/store", getAllStore)
router.get("/all/product", getAllProduct)
router.get("/product/:productId", getAllProductById)


export default router