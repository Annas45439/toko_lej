"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Plus, Minus, X, CreditCard,
  Banknote, Printer, RefreshCw, CheckCircle, QrCode, Tag, Percent
} from "lucide-react";
import toast from "react-hot-toast";
import { useKeranjangStore } from "@/store/keranjangStore";
import { Product, Customer } from "@/types";
import { ModalForm } from "@/components/shared/ModalForm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function TransaksiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const store = useKeranjangStore();

  useEffect(() => {
    Promise.all([
      axios.get("/api/produk"),
      axios.get("/api/pelanggan"),
      axios.get("/api/kategori"),
    ]).then(([p, c, k]) => {
      setProducts(p.data);
      setCustomers(c.data);
      setCategories(k.data);
    }).catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.category_id === filterCat : true;
    return matchSearch && matchCat;
  });

  const handlePay = async () => {
    if (store.items.length === 0) return;
    const total = store.getTotal();
    if (store.paymentMethod === "tunai" && store.paymentAmount < total) {
      toast.error("Nominal bayar kurang dari total"); return;
    }
    setPaying(true);
    try {
      const res = await axios.post("/api/transaksi", {
        customer_id: store.customerId,
        subtotal: store.getSubtotal(),
        discount_amount: store.discount,
        tax_amount: store.getTaxAmount(),
        total: store.getTotal(),
        points_earned: store.getPointsEarned(),
        payment_method: store.paymentMethod,
        payment_amount: store.paymentMethod === "tunai" ? store.paymentAmount : store.getTotal(),
        change_amount: store.paymentMethod === "tunai" ? store.getChange() : 0,
        items: store.items.map((i) => ({
          product_id: i.product_id,
          qty: i.qty,
          price: i.price,
        })),
      });
      setReceipt(res.data);
      toast.success("Transaksi berhasil! 🎉");
      store.clearCart();
      // refresh products
      axios.get("/api/produk").then((r) => setProducts(r.data));
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? "Gagal memproses transaksi");
    } finally { setPaying(false); }
  };

  const handlePrintPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#0f0f2d" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a7");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height / canvas.width) * w;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`${receipt?.invoice_no}.pdf`);
  };

  const total = store.getTotal();
  const change = store.getChange();

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-4">
      {/* LEFT: Catalog */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search + Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..." className="input-glass w-full pl-9" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filterCat ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
            Semua
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCat === c.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pb-2">
              {filtered.map((p) => {
                const inCart = store.items.find((i) => i.product_id === p.id);
                const soldOut = p.stock === 0;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => !soldOut && store.addItem({ product_id: p.id, name: p.name, price: p.price, stock: p.stock })}
                    disabled={soldOut}
                    whileHover={!soldOut ? { scale: 1.02 } : {}}
                    whileTap={!soldOut ? { scale: 0.98 } : {}}
                    className={`glass-card rounded-xl p-4 text-left transition-all relative ${
                      soldOut ? "opacity-50 cursor-not-allowed" : "hover:border-cyan-500/30 cursor-pointer"
                    } ${inCart ? "border-cyan-500/40 bg-cyan-500/5" : ""}`}
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {inCart.qty}
                      </div>
                    )}
                    <p className="text-sm font-medium text-white line-clamp-2 mb-2">{p.name}</p>
                    <p className="text-cyan-400 font-semibold text-sm">
                      {p.price.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        p.stock === 0 ? "bg-red-500/20 text-red-400" :
                        p.stock <= p.min_stock ? "bg-orange-500/20 text-orange-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        Stok: {p.stock}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-80 flex-shrink-0 flex flex-col glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={18} className="text-cyan-400" />
            Keranjang
            {store.items.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                {store.getItemCount()}
              </span>
            )}
          </h2>
          <button onClick={() => store.clearCart()} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
          <AnimatePresence>
            {store.items.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-slate-500">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Keranjang kosong</p>
              </motion.div>
            ) : (
              store.items.map((item) => (
                <motion.div key={item.product_id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} className="glass-card rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-medium text-white line-clamp-2 flex-1">{item.name}</p>
                    <button onClick={() => store.removeItem(item.product_id)}
                      className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => store.updateQty(item.product_id, item.qty - 1)}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="text-white text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button onClick={() => store.updateQty(item.product_id, item.qty + 1)}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-cyan-400 text-xs font-semibold">
                      {item.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Customer */}
          <select value={store.customerId ?? ""} onChange={(e) => store.setCustomer(e.target.value ? Number(e.target.value) : null)}
            className="input-glass w-full text-sm">
            <option value="">Pelanggan Umum</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Payment Method */}
          <div className="flex gap-2">
            <button onClick={() => store.setPaymentMethod("tunai")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                store.paymentMethod === "tunai" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}>
              <Banknote size={14} /> Tunai
            </button>
            <button onClick={() => store.setPaymentMethod("kartu")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                store.paymentMethod === "kartu" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}>
              <CreditCard size={14} /> Kartu
            </button>
            <button onClick={() => store.setPaymentMethod("qris")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                store.paymentMethod === "qris" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}>
              <QrCode size={14} /> QRIS
            </button>
          </div>

          {/* Discount Input */}
          <div className="relative">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              value={store.discount || ""}
              onChange={(e) => store.setDiscount(Number(e.target.value))}
              placeholder="Diskon (Rp)"
              className="input-glass w-full pl-9 text-xs"
            />
          </div>

          {/* Payment Amount (tunai only) */}
          {store.paymentMethod === "tunai" && (
            <div>
              <input
                type="number"
                value={store.paymentAmount || ""}
                onChange={(e) => store.setPaymentAmount(Number(e.target.value))}
                placeholder="Nominal bayar (Rp)"
                className="input-glass w-full text-sm"
                min={0}
              />
              {store.paymentAmount > 0 && (
                <p className="text-xs text-green-400 mt-1 font-semibold">
                  Kembalian: {change.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          )}

          {/* Breakdown */}
          <div className="space-y-1 text-xs border-t border-white/10 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{store.getSubtotal().toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>PPN (11%)</span>
              <span>{store.getTaxAmount().toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</span>
            </div>
            {store.discount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Diskon</span>
                <span>-{store.discount.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</span>
              </div>
            )}
            {store.customerId && (
              <div className="flex justify-between text-amber-400 font-medium">
                <span>Poin Didapat</span>
                <span>+{store.getPointsEarned()} Poin</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <span className="text-slate-400 text-sm font-bold">TOTAL</span>
            <span className="text-xl font-bold text-cyan-400">
              {store.getTotal().toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={store.items.length === 0 || paying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {paying ? "Memproses..." : <><CheckCircle size={18} /> BAYAR</>}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ModalForm isOpen={!!receipt} onClose={() => setReceipt(null)} title="Struk Transaksi" size="md">
        {receipt && (
          <div className="space-y-4">
            <div ref={receiptRef} className="bg-[#0f0f2d] rounded-xl p-6 space-y-4">
              <div className="text-center border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">Toko Lestari Eka Jaya</h3>
                <p className="text-xs text-slate-400">Jl. Contoh No. 1, Kota</p>
                <p className="text-xs text-slate-500 mt-1">
                  {format(new Date(receipt.date), "d MMMM yyyy · HH:mm", { locale: id })}
                </p>
                <p className="font-mono text-cyan-400 text-sm mt-2">{receipt.invoice_no}</p>
              </div>

              <div className="space-y-2">
                {receipt.tb_transaction_details?.map((d: any) => (
                  <div key={d.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">{d.product?.name} x{d.qty}</span>
                    <span className="text-white font-mono">
                      {Number(d.subtotal).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total</span>
                  <span className="text-white font-bold">
                    {Number(receipt.total).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Bayar</span>
                  <span className="text-white">
                    {Number(receipt.payment_amount).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Kembalian</span>
                  <span className="text-green-400 font-semibold">
                    {Number(receipt.change ?? 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Metode</span>
                  <span className="text-purple-400 capitalize">{receipt.payment_method}</span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-600 pt-2">Terima kasih telah berbelanja!</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReceipt(null)} className="btn-ghost flex-1">Tutup</button>
              <button onClick={handlePrintPDF} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Printer size={16} /> Print Struk
              </button>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}
