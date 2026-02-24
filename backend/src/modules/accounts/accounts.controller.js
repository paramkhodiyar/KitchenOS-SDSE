import accountsService from "./accounts.service.js";

/**
 * Record income for completed order
 */
export const recordOrderIncome = async (req, res, next) => {
    try {
        const transaction = await accountsService.recordOrderIncome({
            storeId: req.context.storeId,
            orderId: req.body.orderId,
            accountId: req.body.accountId,
        });

        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

/**
 * Record expense / refund
 */
export const recordExpense = async (req, res, next) => {
    try {
        const transaction = await accountsService.recordExpense({
            storeId: req.context.storeId,
            accountId: req.body.accountId,
            amount: req.body.amount,
            note: req.body.note,
        });

        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

/**
 * List accounts & balances
 */
export const getAccounts = async (req, res, next) => {
    try {
        const accounts = await accountsService.getAccounts({
            storeId: req.context.storeId,
        });

        res.json(accounts);
    } catch (err) {
        next(err);
    }
};

export const createAccount = async (req, res, next) => {
    try {
        const account = await accountsService.createAccount({
            storeId: req.context.storeId,
            name: req.body.name,
            type: req.body.type,
        });

        res.status(201).json(account);
    } catch (err) {
        next(err);
    }
};