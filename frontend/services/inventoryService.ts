import api from "./api";

export interface RawMaterial {
    id: string;
    name: string;
    status: "AVAILABLE" | "LOW" | "OUT";
    overrideUntil?: string;
}

export const getRawMaterials = async () => {
    const response = await api.get<RawMaterial[]>("/inventory/raw-material");
    return response.data;
};

export const updateRawMaterialStatus = async (id: string, status: string, overrideUntil?: string) => {
    const response = await api.put<RawMaterial>(`/inventory/raw-material/${id}`, {
        status,
        overrideUntil,
    });
    return response.data;
};

export const createRawMaterial = async (name: string) => {
    const response = await api.post<RawMaterial>("/inventory/raw-material", { name });
    return response.data;
};

export const updateRawMaterial = async (id: string, name: string) => {
    const response = await api.patch<RawMaterial>(`/inventory/raw-material/${id}`, { name });
    return response.data;
};

export const deleteRawMaterial = async (id: string) => {
    const response = await api.delete(`/inventory/raw-material/${id}`);
    return response.data;
};
