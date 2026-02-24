import { Router } from "express";
import {
    createRawMaterial,
    getRawMaterials,
    updateRawMaterialStatus,
    updateRawMaterial,
    deleteRawMaterial
} from "./rawMaterial.controller.js";

const router = Router();

router.post("/raw-material", createRawMaterial);
router.patch("/raw-material/:id/status", updateRawMaterialStatus);
router.put("/raw-material/:id", updateRawMaterialStatus);
router.patch("/raw-material/:id", updateRawMaterial);
router.delete("/raw-material/:id", deleteRawMaterial);
router.get("/raw-material", getRawMaterials);

export default router;