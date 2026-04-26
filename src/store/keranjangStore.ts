import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface KeranjangState {
  items: CartItem[];
  customerId: number | null;
  paymentMethod: "tunai" | "kartu" | "qris";
  paymentAmount: number;
  discount: number;
  taxRate: number;

  addItem: (item: Omit<CartItem, "qty" | "subtotal">) => void;
  removeItem: (product_id: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  setCustomer: (id: number | null) => void;
  setPaymentMethod: (method: "tunai" | "kartu" | "qris") => void;
  setPaymentAmount: (amount: number) => void;
  setDiscount: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  getChange: () => number;
  getItemCount: () => number;
  getPointsEarned: () => number;
}

export const useKeranjangStore = create<KeranjangState>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      paymentMethod: "tunai",
      paymentAmount: 0,
      discount: 0,
      taxRate: 0.11, // 11% PPN

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === item.product_id
          );
          if (existing) {
            if (existing.qty >= item.stock) return state;
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
      setPaymentMethod: (method) => {
        const total = get().getTotal();
        set({ 
          paymentMethod: method,
          paymentAmount: (method === "kartu" || method === "qris") ? total : get().paymentAmount
        });
      },
      setPaymentAmount: (amount) => set({ paymentAmount: amount }),
      setDiscount: (amount) => set({ discount: amount }),
      setTaxRate: (rate) => set({ taxRate: rate }),

      clearCart: () =>
        set({
          items: [],
          customerId: null,
          paymentMethod: "tunai",
          paymentAmount: 0,
          discount: 0,
          taxRate: 0.11,
        }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.subtotal, 0),

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        return subtotal * get().taxRate;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTaxAmount();
        const discount = get().discount;
        return Math.max(subtotal + tax - discount, 0);
      },

      getChange: () => {
        const total = get().getTotal();
        const paid = get().paymentAmount;
        return Math.max(paid - total, 0);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),

      getPointsEarned: () => {
        const total = get().getTotal();
        // 1 poin per 10.000 belanja
        return Math.floor(total / 10000);
      },
    }),
    { name: "keranjang-lej" }
  )
);
