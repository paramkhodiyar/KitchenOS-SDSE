import orderService from "./orders.service.js";

export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder({
            storeId: req.context.storeId,
        });

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

export const addItemToOrder = async (req, res, next) => {
    try {
        const result = await orderService.addItemToOrder({
            storeId: req.context.storeId,
            orderId: req.params.orderId,
            productId: req.body.productId,
            quantity: req.body.quantity,
            override: req.body.override ?? false,
            overrideReason: req.body.overrideReason ?? null,
            role: req.context.role,
        });

        if (result.requiresOverride) {
            return res.status(409).json({
                requiresOverride: true,
                warnings: result.warnings,
            });
        }

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await orderService.updateOrderStatus({
            storeId: req.context.storeId,
            orderId: req.params.orderId,
            status: req.body.status,
        });

        res.json(order);
    } catch (err) {
        next(err);
    }
};

export const getKitchenOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getKitchenOrders({
            storeId: req.context.storeId,
        });
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getOrders({
            storeId: req.context.storeId,
        });
        res.json(orders);
    } catch (err) {
        next(err);
    }
};