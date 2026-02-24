import { create } from 'zustand';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: { id: string; name: string; price: number }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product.id);

        if (existing) {
            set({
                items: items.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({
                items: [...items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }],
            });
        }
    },

    removeItem: (productId) => {
        set({
            items: get().items.filter((item) => item.productId !== productId),
        });
    },

    updateQuantity: (productId, delta) => {
        const items = get().items;
        const mapped = items.map((item) => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);

        set({ items: mapped });
    },

    clearCart: () => {
        set({ items: [] });
    },

    total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
}));
