import { create } from 'zustand';
import api from '@/services/api';

type Role = 'OWNER' | 'CASHIER' | 'KITCHEN';

interface User {
    role: Role;
    storeId: string;
}

interface AuthState {
    token: string | null;
    role: Role | null;
    storeName: string | null;
    isLoading: boolean;
    login: (storeCode: string, pin: string, mode: Role) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    role: null,
    storeName: null,
    isLoading: true,

    login: async (storeCode, pin, mode) => {
        try {
            set({ isLoading: true });
            const response = await api.post('/auth/unlock', {
                storeCode,
                pin,
                mode,
            });

            const { token, role, storeName } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('storeName', storeName || "");
            }

            set({ token, role, storeName, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('storeName');
        }
        set({ token: null, role: null, storeName: null });
    },

    checkAuth: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role') as Role | null;
            const storeName = localStorage.getItem('storeName');

            if (token && role) {
                set({ token, role, storeName, isLoading: false });
            } else {
                set({ token: null, role: null, storeName: null, isLoading: false });
            }
        }
    },
}));
