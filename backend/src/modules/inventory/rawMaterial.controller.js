import rawMaterialService from "./rawMaterial.service.js";

export const createRawMaterial = async (req, res, next) => {
    try {
        const material = await rawMaterialService.createRawMaterial({
            storeId: req.context.storeId,
            name: req.body.name,
        });
        res.status(201).json(material);
    } catch (err) {
        next(err);
    }
};

export const updateRawMaterialStatus = async (req, res, next) => {
    try {
        const material = await rawMaterialService.updateStatus({
            storeId: req.context.storeId,
            rawMaterialId: req.params.id,
            status: req.body.status,
            overrideUntil: req.body.overrideUntil,
        });
        res.json(material);
    } catch (err) {
        next(err);
    }
};

export const getRawMaterials = async (req, res, next) => {
    try {
        const materials = await rawMaterialService.getAllRawMaterials({
            storeId: req.context.storeId,
        });
        res.json(materials);
    } catch (err) {
        next(err);
    }
};

export const updateRawMaterial = async (req, res, next) => {
    try {
        const material = await rawMaterialService.updateRawMaterial({
            storeId: req.context.storeId,
            rawMaterialId: req.params.id,
            name: req.body.name,
        });
        res.json(material);
    } catch (err) {
        next(err);
    }
};

export const deleteRawMaterial = async (req, res, next) => {
    try {
        await rawMaterialService.deleteRawMaterial({
            storeId: req.context.storeId,
            rawMaterialId: req.params.id,
        });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
