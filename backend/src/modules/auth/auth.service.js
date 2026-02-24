import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateStoreCode } from "../../utils/storeCode.js";
const PIN_CONFIG = {
    OWNER: {
        field: "ownerPinHash",
        role: "OWNER",
    },
    CASHIER: {
        field: "cashierPinHash",
        role: "CASHIER",
    },
    KITCHEN: {
        field: "kitchenPinHash",
        role: "KITCHEN",
    },
};
const setupStore = async ({
    storeName,
    ownerPin,
    cashierPin,
    kitchenPin,
}) => {
    const existingStore = await prisma.store.findFirst();

    if (existingStore?.isInitialized) {
        throw {
            status: 403,
            message: "Store already initialized",
        };
    }

    const store = await prisma.store.create({
        data: {
            name: storeName,
            storeCode: generateStoreCode(),
            ownerPinHash: await bcrypt.hash(ownerPin, 10),
            cashierPinHash: await bcrypt.hash(cashierPin, 10),
            kitchenPinHash: await bcrypt.hash(kitchenPin, 10),
            isInitialized: true,
        },
    });

    return { storeCode: store.storeCode };
};

const unlock = async ({ storeCode, pin, mode }) => {
    if (!storeCode || !pin || !mode) {
        throw {
            status: 400,
            message: "storeCode, pin and mode are required",
        };
    }

    const config = PIN_CONFIG[mode];

    if (!config) {
        throw {
            status: 400,
            message: "Invalid mode",
        };
    }

    const store = await prisma.store.findUnique({
        where: { storeCode },
    });

    if (!store) {
        throw {
            status: 404,
            message: "Store not found",
        };
    }

    const pinHash = store[config.field];

    if (!pinHash) {
        throw {
            status: 400,
            message: "PIN not configured for this mode",
        };
    }

    const isMatch = await bcrypt.compare(pin, pinHash);

    if (!isMatch) {
        throw {
            status: 401,
            message: "Invalid PIN",
        };
    }

    const token = jwt.sign(
        {
            storeId: store.id,
            role: config.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );

    return {
        token,
        role: config.role,
        storeName: store.name,
    };
};

const resetPin = async ({ storeId, targetRole, newPin }) => {
    if (!storeId || !targetRole || !newPin) {
        throw {
            status: 400,
            message: "storeId, targetRole and newPin are required",
        };
    }

    const config = PIN_CONFIG[targetRole];

    if (!config) {
        throw {
            status: 400,
            message: "Invalid target role",
        };
    }

    const newHash = await bcrypt.hash(newPin, 10);

    await prisma.store.update({
        where: { id: storeId },
        data: {
            [config.field]: newHash,
        },
    });

    return { success: true };
};

export default {
    setupStore,
    unlock,
    resetPin,
};