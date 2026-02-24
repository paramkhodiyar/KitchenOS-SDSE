import prisma from "../../config/prisma.js";
import availabilityService from "../inventory/availability.service.js";

const createOrder = async ({ storeId }) => {
    return prisma.order.create({
        data: {
            storeId,
            status: "PENDING",
            total: 0,
        },
    });
};

const addItemToOrder = async ({
    storeId,
    orderId,
    productId,
    quantity,
    override = false,
    overrideReason = null,
    role = "CASHIER",
}) => {
    if (quantity <= 0) {
        throw { status: 400, message: "Quantity must be positive" };
    }

    const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
    });

    if (!order) {
        throw { status: 404, message: "Order not found" };
    }

    if (order.status !== "PENDING") {
        throw { status: 400, message: "Cannot modify order in current state" };
    }

    const product = await prisma.product.findFirst({
        where: { id: productId, storeId, isActive: true },
    });

    if (!product) {
        throw { status: 404, message: "Product not available" };
    }

    const availability = await availabilityService.checkProductAvailability({
        storeId,
        productId,
    });

    if (availability.overrideRequired && !override) {
        return {
            requiresOverride: true,
            warnings: availability.warnings,
        };
    }


    const orderItem = await prisma.orderItem.create({
        data: {
            orderId,
            productId,
            quantity,
            price: product.price,
        },
    });


    await prisma.order.update({
        where: { id: orderId },
        data: {
            total: {
                increment: product.price * quantity,
            },
        },
    });

    if (override) {
        for (const warning of availability.warnings) {
            if (warning.type === "RAW_MATERIAL_OUT") {
                await prisma.overrideLog.create({
                    data: {
                        storeId,
                        productId,
                        rawMaterialId: warning.rawMaterialId,
                        role,
                        reason: overrideReason,
                    },
                });
            }
        }
    }

    return {
        success: true,
        orderItem,
    };
};


const updateOrderStatus = async ({ storeId, orderId, status }) => {
    const allowed = ["PREPARING", "READY", "COMPLETED", "CANCELLED"];

    if (!allowed.includes(status)) {
        throw { status: 400, message: "Invalid order status" };
    }

    const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
    });

    if (!order) {
        throw { status: 404, message: "Order not found" };
    }

    return prisma.order.update({
        where: { id: orderId },
        data: { status },
    });
};
const getKitchenOrders = async ({ storeId }) => {
    return prisma.order.findMany({
        where: {
            storeId,
            status: {
                in: ["PENDING", "PREPARING"],
            },
        },
        orderBy: {
            createdAt: "asc",
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
};

const getOrders = async ({ storeId }) => {
    return prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
};

export default {
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    getKitchenOrders,
    getOrders,
};
