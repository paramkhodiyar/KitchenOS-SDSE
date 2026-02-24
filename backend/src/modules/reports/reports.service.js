import prisma from "../../config/prisma.js";

const getRevenueReport = async ({ storeId, from, to }) => {
    const where = {
        storeId,
        createdAt: {
            gte: from,
            lte: to,
        },
    };

    const income = await prisma.transaction.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
    });

    const expense = await prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
    });

    const byAccount = await prisma.transaction.groupBy({
        by: ["accountId"],
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
    });

    return {
        totalRevenue: (income._sum.amount || 0) + (expense._sum.amount || 0),
        totalRevenue: income._sum.amount || 0,
        totalIncome: income._sum.amount || 0,
        totalExpense: expense._sum.amount || 0,
        net: (income._sum.amount || 0) - (expense._sum.amount || 0),
        byAccount,
        dailyRevenue: await getDailyRevenue(storeId, from, to),
    };
};

const getDailyRevenue = async (storeId, from, to) => {

    const txs = await prisma.transaction.findMany({
        where: {
            storeId,
            type: "INCOME",
            createdAt: { gte: from, lte: to }
        },
        select: { createdAt: true, amount: true }
    });

    const map = {};
    txs.forEach(t => {
        const date = t.createdAt.toISOString().split('T')[0];
        map[date] = (map[date] || 0) + t.amount;
    });

    return Object.entries(map).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
}

const getOrderReport = async ({ storeId, from, to }) => {
    const orders = await prisma.order.findMany({
        where: {
            storeId,
            createdAt: {
                gte: from,
                lte: to,
            },
        },
        include: {
            items: true,
        },
        orderBy: { createdAt: 'asc' }
    });

    const completed = orders.filter(o => o.status === "COMPLETED");
    const cancelled = orders.filter(o => o.status === "CANCELLED");

    const totalOrders = orders.length;
    const avgOrderValue =
        completed.length === 0
            ? 0
            : completed.reduce((s, o) => s + o.total, 0) / completed.length;

    const itemMap = {};
    const dateMap = {};

    orders.forEach(order => {

        order.items.forEach(item => {
            itemMap[item.productId] =
                (itemMap[item.productId] || 0) + item.quantity;
        });


        const date = order.createdAt.toISOString().split('T')[0];
        dateMap[date] = (dateMap[date] || 0) + 1;
    });

    const recentTrends = Object.entries(dateMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalOrders,
        completedOrders: completed.length,
        cancelledOrders: cancelled.length,
        averageOrderValue: avgOrderValue,
        topItems: itemMap,
        recentTrends,
    };
};

const getStockReport = async ({ storeId }) => {
    const rawMaterials = await prisma.rawMaterial.findMany({
        where: { storeId },
    });

    const products = await prisma.product.findMany({
        where: { storeId, isActive: true },
    });

    const items = [];


    rawMaterials.forEach(rm => {
        items.push({
            id: rm.id,
            name: rm.name,
            stock: null,
            status: rm.status,
            type: 'RAW_MATERIAL'
        });
    });


    products.forEach(p => {
        let status = 'AVAILABLE';
        if (p.stock <= 0) status = 'OUT';
        else if (p.stock <= p.minStock) status = 'LOW';

        items.push({
            id: p.id,
            name: p.name,
            stock: p.stock,
            status: status,
            type: 'PRODUCT'
        });
    });

    const lowStockItems = items.filter(i => i.status === 'LOW').length;
    const outOfStockItems = items.filter(i => i.status === 'OUT').length;

    return {
        lowStockItems,
        outOfStockItems,
        totalItems: items.length,
        items
    };
};

export default {
    getRevenueReport,
    getOrderReport,
    getStockReport,
};
