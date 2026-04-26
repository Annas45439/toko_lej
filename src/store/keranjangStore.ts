import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface KeranjangState {
  items: CartItem[];
  customerId: number | null;
  paymentMethod: "tunai" | "kartu";
  paymentAmount: number;

  addItem: (item: Omit<CartItem, "qty" | "subtotal">) => void;
  removeItem: (product_id: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  setCustomer: (id: number | null) => void;
  setPaymentMethod: (method: "tunai" | "kartu") => void;
  setPaymentAmount: (amount: number) => void;
  clearCart: () => void;

  getTotal: () => number;
  getChange: () => number;
  getItemCount: () => number;
}

export const useKeranjangStore = create<KeranjangState>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      paymentMethod: "tunai",
      paymentAmount: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === item.product_id
          );
          if (existing) {
            if (existing.qty >= item.stock) return state; // max stock
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? {
                      ...i,
                      qty: i.qty + 1,
                      subtotal: (i.qty + 1) * i.price,
                    }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, qty: 1, subtotal: item.price },
            ],
          };
        });
      },

      removeItem: (product_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== product_id),
        }));
      },

      updateQty: (product_id, qty) => {
        if (qty < 1) {
          get().removeItem(product_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id
              ? {
                  ...i,
                  qty: Math.min(qty, i.stock),
                  subtotal: Math.min(qty, i.stock) * i.price,
                }
              : i
          ),
        }));
      },

      setCustomer: (id) => set({ customerId: id }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaymentAmount: (amount) => set({ paymentAmount: amount }),

      clearCart: () =>
        set({
          items: [],
          customerId: null,
          paymentMethod: "tunai",
          paymentAmount: 0,
        }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.subtotal, 0),

      getChange: () => {
        const total = get().getTotal();
        const paid = get().paymentAmount;
        return Math.max(paid - total, 0);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    { name: "keranjang-lej" }
  )
);
