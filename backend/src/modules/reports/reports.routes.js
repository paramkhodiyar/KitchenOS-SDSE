import express from "express";
import {
    getRevenueReport,
    getOrderReport,
    getStockReport,
} from "./reports.controller.js";

import requireRole from "../../middleware/requireRole.middleware.js";

const router = express.Router();

router.get("/revenue", requireRole("OWNER"), getRevenueReport);
router.get("/orders", requireRole("OWNER"), getOrderReport);
router.get("/stock", requireRole("OWNER"), getStockReport);

export default router;
