import prisma from "../../config/prisma.js";

const createProduct = async ({ storeId, name, price, stock, minStock }) => {
    if (price < 0 || stock < 0 || minStock < 0) {
        throw { status: 400, message: "Price and stock cannot be negative" };
    }

    const existing = await prisma.product.findFirst({
        where: {
            storeId,
            name: name.trim(),
        },
    });

    if (existing) {
        throw { status: 409, message: "Product with this name already exists" };
    }

    const product = await prisma.product.create({
        data: {
            storeId,
            name: name.trim(),
            price,
            stock,
            minStock,
        },
    });

    return product;
};

const getProducts = async ({ storeId }) => {
    return prisma.product.findMany({
        where: { storeId },
        orderBy: { name: "asc" },
    });
};

const updateProduct = async ({ storeId, productId, updates }) => {
    if (
        updates.price !== undefined && updates.price < 0 ||
        updates.stock !== undefined && updates.stock < 0 ||
        updates.minStock !== undefined && updates.minStock < 0
    ) {
        throw { status: 400, message: "Invalid product values" };
    }

    const product = await prisma.product.findFirst({
        where: { id: productId, storeId },
    });

    if (!product) {
        throw { status: 404, message: "Product not found" };
    }

    if (updates.name) {
        const duplicate = await prisma.product.findFirst({
            where: {
                storeId,
                name: updates.name.trim(),
                NOT: { id: productId },
            },
        });

        if (duplicate) {
            throw { status: 409, message: "Product name already exists" };
        }
    }

    return prisma.product.update({
        where: { id: productId },
        data: updates,
    });
};

const deleteProduct = async ({ storeId, productId }) => {
    const product = await prisma.product.findFirst({
        where: { id: productId, storeId },
    });

    if (!product) {
        throw { status: 404, message: "Product not found" };
    }

    await prisma.product.delete({
        where: { id: productId },
    });

    return { success: true };
};

export default {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
};
