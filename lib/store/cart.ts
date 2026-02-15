import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image?: string;
    quantity: number;
    maxStock: number;
    sellerId: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    const newQuantity = Math.min(
                        existingItem.quantity + item.quantity,
                        existingItem.maxStock
                    );
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id ? { ...i, quantity: newQuantity } : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, item] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                const { items } = get();
                const item = items.find((i) => i.id === id);
                if (!item) return;

                const newQuantity = Math.max(0, Math.min(quantity, item.maxStock));
                if (newQuantity === 0) {
                    set({ items: items.filter((i) => i.id !== id) });
                } else {
                    set({
                        items: items.map((i) =>
                            i.id === id ? { ...i, quantity: newQuantity } : i
                        ),
                    });
                }
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
