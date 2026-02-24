import authService from "./auth.service.js";
export const setUp = async (req, res, next) => {
    try {
        const { storeName, ownerPin, cashierPin, kitchenPin } = req.body;

        const result = await authService.setupStore({
            storeName,
            ownerPin,
            cashierPin,
            kitchenPin,
        });

        return res.status(200).json({
            storeCode: result.storeCode,
        });
    } catch (err) {
        next(err);
    }
};
export const unlock = async (req, res, next) => {
    try {
        const { storeCode, pin, mode } = req.body;

        const result = await authService.unlock({
            storeCode,
            pin,
            mode,
        });

        return res.status(200).json({
            token: result.token,
            role: result.role,
            storeName: result.storeName,
        });
    } catch (err) {
        next(err);
    }
};

export const resetPin = async (req, res, next) => {
    try {
        const { targetRole, newPin } = req.body;
        const storeId = req.context.storeId;

        const result = await authService.resetPin({
            storeId,
            targetRole,
            newPin,
        });

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
