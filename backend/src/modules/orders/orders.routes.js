import express from "express";
import {
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    getKitchenOrders,
    getOrders,
} from "./orders.controller.js";

const router = express.Router();

router.get("/kitchen", getKitchenOrders);
router.get("/", getOrders);
router.post("/", createOrder);
router.post("/:orderId/items", addItemToOrder);
router.patch("/:orderId/status", updateOrderStatus);

export default router;
