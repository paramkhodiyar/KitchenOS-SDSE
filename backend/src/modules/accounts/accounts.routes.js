import express from "express";
import {
    recordOrderIncome,
    recordExpense,
    getAccounts,
    createAccount,
} from "./accounts.controller.js";

const router = express.Router();

router.post("/income", recordOrderIncome);
router.post("/expense", recordExpense);
router.get("/", getAccounts);
router.post("/", createAccount);

export default router;