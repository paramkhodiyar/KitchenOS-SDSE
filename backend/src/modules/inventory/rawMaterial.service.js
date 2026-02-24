import prisma from "../../config/prisma.js";

const createRawMaterial = async ({ storeId, name }) => {
    if (!name || !name.trim()) {
        throw { status: 400, message: "Raw material name is required" };
    }

    const existing = await prisma.rawMaterial.findFirst({
        where: {
            storeId,
            name: name.trim(),
        },
    });

    if (existing) {
        throw { status: 409, message: "Raw material already exists" };
    }

    return prisma.rawMaterial.create({
        data: {
            storeId,
            name: name.trim(),
            status: "AVAILABLE",
        },
    });
};

const updateStatus = async ({
    storeId,
    rawMaterialId,
    status,
    overrideUntil,
}) => {
    const material = await prisma.rawMaterial.findFirst({
        where: {
            id: rawMaterialId,
            storeId,
        },
    });

    if (!material) {
        throw { status: 404, message: "Raw material not found" };
    }

    if (!["AVAILABLE", "LOW", "OUT"].includes(status)) {
        throw { status: 400, message: "Invalid status" };
    }

    return prisma.rawMaterial.update({
        where: { id: rawMaterialId },
        data: {
            status,
            overrideUntil: overrideUntil ?? null,
        },
    });
};

const normalizeStatuses = async (storeId) => {
    const now = new Date();

    await prisma.rawMaterial.updateMany({
        where: {
            storeId,
            status: "OUT",
            overrideUntil: {
                lte: now,
            },
        },
        data: {
            status: "LOW",
            overrideUntil: null,
        },
    });
};

const getAllRawMaterials = async ({ storeId }) => {
    await normalizeStatuses(storeId);

    return prisma.rawMaterial.findMany({
        where: { storeId },
        orderBy: { name: "asc" },
    });
};

const updateRawMaterial = async ({ storeId, rawMaterialId, name }) => {
    if (!name || !name.trim()) {
        throw { status: 400, message: "Name is required" };
    }

    const material = await prisma.rawMaterial.findFirst({
        where: { id: rawMaterialId, storeId },
    });

    if (!material) {
        throw { status: 404, message: "Raw material not found" };
    }

    const duplicate = await prisma.rawMaterial.findFirst({
        where: { storeId, name: name.trim(), NOT: { id: rawMaterialId } },
    });

    if (duplicate) {
        throw { status: 409, message: "Raw material name already exists" };
    }

    return prisma.rawMaterial.update({
        where: { id: rawMaterialId },
        data: { name: name.trim() },
    });
};

const deleteRawMaterial = async ({ storeId, rawMaterialId }) => {
    const material = await prisma.rawMaterial.findFirst({
        where: { id: rawMaterialId, storeId },
    });

    if (!material) {
        throw { status: 404, message: "Raw material not found" };
    }

    await prisma.rawMaterial.delete({
        where: { id: rawMaterialId },
    });

    return { success: true };
};

export default {
    createRawMaterial,
    updateStatus,
    getAllRawMaterials,
    updateRawMaterial,
    deleteRawMaterial,
};

