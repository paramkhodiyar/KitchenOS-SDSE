import { Router } from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./products.controller.js";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;