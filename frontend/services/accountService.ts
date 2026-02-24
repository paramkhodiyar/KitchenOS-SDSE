import api from "./api";

export interface Account {
    id: string;
    name: string;
    type: "CASH" | "UPI" | "BANK" | "WALLET";
    balance: number;
}

export const getAccounts = async () => {
    const response = await api.get<Account[]>("/accounts");
    return response.data;
};

export const createAccount = async (name: string, type: string) => {
    const response = await api.post<Account>("/accounts", { name, type });
    return response.data;
};

export const recordIncome = async (orderId: string, accountId: string) => {
    const response = await api.post("/accounts/income", {
        orderId,
        accountId,
    });
    return response.data;
};
