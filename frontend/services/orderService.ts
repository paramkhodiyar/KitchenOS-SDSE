import api from "./api";

export interface Product {
    name: string;
}

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
    total: number;
    createdAt: string;
    storeCode: string; // pseudo
    items: OrderItem[];
    // We might add transaction info later
}

export const createOrder = async () => {
    const response = await api.post<Order>("/orders");
    return response.data;
};

export const addItemToOrder = async (orderId: string, productId: string, quantity: number, override = false) => {
    const response = await api.post(`/orders/${orderId}/items`, {
        productId,
        quantity,
        override,
    });
    return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, {
        status,
    });
    return response.data;
};

export const getKitchenOrders = async () => {
    const response = await api.get<Order[]>("/orders/kitchen");
    return response.data;
};

export const getOrders = async () => {
    const response = await api.get<Order[]>("/orders");
    return response.data;
};
