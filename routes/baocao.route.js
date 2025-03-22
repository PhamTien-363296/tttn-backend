import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { addBaoCao, addReportFromSupport, getAllExport, getRepliedReports, updateReport } from "../controllers/baocao.controller.js"
const router = express.Router()


router.get("/all", getAllExport)
router.get("/reply/:id",protectRoute ,getRepliedReports)
router.post("/them/:id", protectRoute, addBaoCao)
router.post("/add/:idsupp", protectRoute, addReportFromSupport)
router.patch("/update/:id", updateReport)

export default router