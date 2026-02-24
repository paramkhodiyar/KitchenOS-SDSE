import api from "./api";

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    minStock: number;
    isActive: boolean;
    category?: string;
}

export const getProducts = async () => {
    const response = await api.get<Product[]>("/products");
    return response.data;
};

export const createProduct = async (data: Partial<Product>) => {
    const response = await api.post<Product>("/products", data);
    return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};
