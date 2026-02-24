import productService from "./products.service.js";

export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct({
            storeId: req.context.storeId,
            ...req.body,
        });
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const products = await productService.getProducts({
            storeId: req.context.storeId,
        });
        res.json(products);
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct({
            storeId: req.context.storeId,
            productId: req.params.id,
            updates: req.body,
        });
        res.json(product);
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const result = await productService.deleteProduct({
            storeId: req.context.storeId,
            productId: req.params.id,
        });
        res.json(result);
    } catch (err) {
        next(err);
    }
};
