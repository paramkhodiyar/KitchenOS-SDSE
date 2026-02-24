import express from "express";
import { unlock, resetPin, setUp } from "./auth.controller.js";

import requireRole from "../../middleware/requireRole.middleware.js";

const router = express.Router();

router.post("/setup", setUp);
router.post("/unlock", unlock);
router.post("/reset-pin", requireRole("OWNER"), resetPin);


export default router;
