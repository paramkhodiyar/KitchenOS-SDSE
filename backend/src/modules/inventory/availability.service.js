import prisma from "../../config/prisma.js";

const checkProductAvailability = async ({ storeId, productId }) => {
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            storeId,
            isActive: true,
        },
    });

    if (!product) {
        return {
            sellable: false,
            warnings: [{ type: "PRODUCT_INACTIVE", message: "Item is not available" }],
            overrideRequired: false,
        };
    }

    const rawMaterials = await prisma.rawMaterial.findMany({
        where: { storeId },
    });

    const warnings = [];
    let overrideRequired = false;

    for (const material of rawMaterials) {
        if (material.status === "LOW") {
            warnings.push({
                type: "RAW_MATERIAL_LOW",
                rawMaterialId: material.id,
                message: `${material.name} is marked LOW`,
            });
        }

        if (material.status === "OUT") {
            warnings.push({
                type: "RAW_MATERIAL_OUT",
                rawMaterialId: material.id,
                message: `${material.name} is marked OUT`,
            });
            overrideRequired = true;
        }
    }

    return {
        sellable: true,
        warnings,
        overrideRequired,
    };
};

const checkMenuAvailability = async ({ storeId }) => {
    const products = await prisma.product.findMany({
        where: {
            storeId,
            isActive: true,
        },
        orderBy: { name: "asc" },
    });

    const rawMaterials = await prisma.rawMaterial.findMany({
        where: { storeId },
    });

    return products.map((product) => {
        const warnings = [];
        let overrideRequired = false;

        for (const material of rawMaterials) {
            if (material.status === "LOW") {
                warnings.push({
                    type: "RAW_MATERIAL_LOW",
                    rawMaterialId: material.id,
                    message: `${material.name} is marked LOW`,
                });
            }

            if (material.status === "OUT") {
                warnings.push({
                    type: "RAW_MATERIAL_OUT",
                    rawMaterialId: material.id,
                    message: `${material.name} is marked OUT`,
                });
                overrideRequired = true;
            }
        }

        return {
            productId: product.id,
            productName: product.name,
            sellable: true,
            warnings,
            overrideRequired,
        };
    });
};

export default {
    checkProductAvailability,
    checkMenuAvailability,
};
