import { create } from 'zustand';

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: number;
  setTableNumber: (n: number) => void;
  addItem: (item: { itemId: string; name: string; price: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableNumber: 0,
  setTableNumber: (n) => set({ tableNumber: n }),
  addItem: (item) => {
    const existing = get().items.find((i) => i.itemId === item.itemId);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] });
    }
  },
  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.itemId !== itemId) });
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.itemId === itemId ? { ...i, quantity } : i
      ),
    });
  },
  clearCart: () => set({ items: [], tableNumber: 0 }),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
