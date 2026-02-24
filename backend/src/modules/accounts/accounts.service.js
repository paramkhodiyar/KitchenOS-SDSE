import prisma from "../../config/prisma.js";

/**
 * Record income when order is completed
 */
const recordOrderIncome = async ({
    storeId,
    orderId,
    accountId,
}) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
    });

    if (!order) {
        throw { status: 404, message: "Order not found" };
    }


    const existing = await prisma.transaction.findUnique({
        where: { orderId },
    });

    if (existing) {
        throw {
            status: 409,
            message: "Transaction already exists for this order",
        };
    }

    const account = await prisma.account.findFirst({
        where: { id: accountId, storeId },
    });

    if (!account) {
        throw { status: 404, message: "Account not found" };
    }

    return prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                storeId,
                accountId,
                orderId,
                type: "INCOME",
                amount: order.total,
                note: `Order ${order.id}`,
            },
        });

        await tx.account.update({
            where: { id: accountId },
            data: {
                balance: {
                    increment: order.total,
                },
            },
        });

        return transaction;
    });
};

/**
 * Record an expense / refund
 */
const recordExpense = async ({
    storeId,
    accountId,
    amount,
    note,
}) => {
    if (amount <= 0) {
        throw { status: 400, message: "Amount must be positive" };
    }

    const account = await prisma.account.findFirst({
        where: { id: accountId, storeId },
    });

    if (!account) {
        throw { status: 404, message: "Account not found" };
    }

    return prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                storeId,
                accountId,
                type: "EXPENSE",
                amount,
                note,
            },
        });

        await tx.account.update({
            where: { id: accountId },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });

        return transaction;
    });
};

/**
 * Get account balances
 */
const getAccounts = async ({ storeId }) => {
    return prisma.account.findMany({
        where: { storeId },
        orderBy: { name: "asc" },
    });
};
/**
 * Create a new account (OWNER)
 */
const createAccount = async ({ storeId, name, type }) => {
    if (!name || !type) {
        throw { status: 400, message: "Name and type are required" };
    }

    const allowedTypes = ["CASH", "UPI"];
    if (!allowedTypes.includes(type)) {
        throw { status: 400, message: "Invalid account type" };
    }

    const existing = await prisma.account.findFirst({
        where: {
            storeId,
            type,
        },
    });

    if (existing) {
        throw {
            status: 409,
            message: "Account of this type already exists",
        };
    }

    return prisma.account.create({
        data: {
            storeId,
            name,
            type,
            balance: 0,
        },
    });
};


export default {
    recordOrderIncome,
    recordExpense,
    getAccounts,
    createAccount,
};
