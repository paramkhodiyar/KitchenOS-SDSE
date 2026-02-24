import api from "./api";

export interface SetupPayload {
    storeName: string;
    ownerPin: string;
    cashierPin: string;
    kitchenPin: string;
}

export const setupStore = async (payload: SetupPayload) => {
    const response = await api.post<{ storeCode: string }>("/auth/setup", payload);
    return response.data;
};

export const resetPin = async (targetRole: "CASHIER" | "KITCHEN", newPin: string) => {
    const response = await api.post("/auth/reset-pin", { targetRole, newPin });
    return response.data;
};
