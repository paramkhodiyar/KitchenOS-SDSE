import api from "./api";

export interface RevenueData {
    totalRevenue: number;
    dailyRevenue: {
        date: string;
        revenue: number;
    }[];
}

export interface OrderData {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    recentTrends: {
        date: string;
        count: number;
    }[];
}

export interface StockData {
    lowStockItems: number;
    outOfStockItems: number;
    totalItems: number;
    items: {
        id: string;
        name: string;
        stock: number | null;
        status: string;
    }[];
}

export const getRevenueReport = async (from?: Date, to?: Date) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from.toISOString());
    if (to) params.append("to", to.toISOString());

    const response = await api.get<RevenueData>(`/reports/revenue?${params.toString()}`);
    return response.data;
};

export const getOrderReport = async (from?: Date, to?: Date) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from.toISOString());
    if (to) params.append("to", to.toISOString());

    const response = await api.get<OrderData>(`/reports/orders?${params.toString()}`);
    return response.data;
};

export const getStockReport = async () => {
    const response = await api.get<StockData>("/reports/stock");
    return response.data;
};
