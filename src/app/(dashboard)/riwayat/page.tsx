"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { History, Search, Eye, X, Receipt } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import toast from "react-hot-toast";

interface Transaction {
  id: number;
  invoice_no: string;
  date: string;
  total: number;
  payment_method: string;
  payment_amount: number;
  status: string;
  customer: { name: string } | null;
  user: { name: string } | null;
  _count: { tb_transaction_details: number };
}

function formatRp(n: number) {
  return Number(n).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

export default function RiwayatPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<{ tx: Transaction; items: any[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const limit = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/riwayat", { params: { page, limit, search, status } });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (tx: Transaction) => {
    setDetailLoading(true);
    setDetail({ tx, items: [] });
    try {
      const res = await axios.get(`/api/transaksi/${tx.id}`);
      const items = res.data.tb_transaction_details?.map((d: any) => ({
        product_name: d.product?.name ?? "-",
        qty: d.qty,
        price: Number(d.price),
        subtotal: Number(d.subtotal),
      })) ?? [];
      setDetail({ tx, items });
    } catch {
      toast.error("Gagal memuat detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <History size={20} className="text-purple-400" /> Riwayat Transaksi
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString("id-ID")} transaksi</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-glass pl-9" placeholder="Cari invoice atau pelanggan..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-glass w-44 cursor-pointer" value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="batal">Batal</option>
        </select>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden">
        {loading ? <PageSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-glass">
              <thead>
                <tr>
                  <th>Invoice</th><th>Tanggal</th><th>Pelanggan</th>
                  <th>Items</th><th>Total</th><th>Metode</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-slate-500">
                    <Receipt size={36} className="mx-auto mb-3 opacity-30" />Tidak ada data
                  </td></tr>
                ) : data.map((tx) => (
                  <tr key={tx.id}>
                    <td><span className="font-mono text-cyan-400 text-xs">{tx.invoice_no}</span></td>
                    <td className="text-xs">{format(new Date(tx.date), "d MMM yyyy HH:mm", { locale: id })}</td>
                    <td>{tx.customer?.name ?? <span className="text-slate-600">Umum</span>}</td>
                    <td><span className="badge badge-slate">{tx._count.tb_transaction_details} item</span></td>
                    <td className="font-semibold text-white">{formatRp(tx.total)}</td>
                    <td><span className={`badge ${tx.payment_method === "tunai" ? "badge-cyan" : "badge-purple"}`}>{tx.payment_method}</span></td>
                    <td><span className={`badge ${tx.status === "selesai" ? "badge-green" : "badge-red"}`}>{tx.status}</span></td>
                    <td>
                      <button onClick={() => openDetail(tx)} className="btn-secondary py-1.5 px-3 text-xs">
                        <Eye size={13} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <p className="text-xs text-slate-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30">← Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </motion.div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white">Detail Transaksi</h3>
                <p className="font-mono text-cyan-400 text-sm">{detail.tx.invoice_no}</p>
              </div>
              <button onClick={() => setDetail(null)} className="btn-secondary p-2"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              <div><p className="text-slate-500 text-xs mb-1">Tanggal</p>
                <p className="text-white">{format(new Date(detail.tx.date), "d MMMM yyyy HH:mm", { locale: id })}</p></div>
              <div><p className="text-slate-500 text-xs mb-1">Pelanggan</p>
                <p className="text-white">{detail.tx.customer?.name ?? "Umum"}</p></div>
              <div><p className="text-slate-500 text-xs mb-1">Metode Bayar</p>
                <span className={`badge ${detail.tx.payment_method === "tunai" ? "badge-cyan" : "badge-purple"}`}>{detail.tx.payment_method}</span></div>
              <div><p className="text-slate-500 text-xs mb-1">Status</p>
                <span className={`badge ${detail.tx.status === "selesai" ? "badge-green" : "badge-red"}`}>{detail.tx.status}</span></div>
            </div>
            <div className="border border-white/08 rounded-xl overflow-hidden mb-5">
              {detailLoading ? (
                <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Memuat detail...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/08 bg-white/02">
                      <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Produk</th>
                      <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Qty</th>
                      <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Harga</th>
                      <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item, i) => (
                      <tr key={i} className="border-b border-white/04">
                        <td className="py-2 px-3 text-slate-300">{item.product_name}</td>
                        <td className="py-2 px-3 text-center text-slate-400">{item.qty}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{formatRp(item.price)}</td>
                        <td className="py-2 px-3 text-right text-white font-medium">{formatRp(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/03 border border-white/06">
              <div><p className="text-slate-500 text-xs">Total Bayar</p>
                <p className="text-white font-bold text-lg">{formatRp(detail.tx.total)}</p></div>
              <div className="text-right"><p className="text-slate-500 text-xs">Kembalian</p>
                <p className="text-green-400 font-bold">{formatRp(detail.tx.payment_amount - detail.tx.total)}</p></div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
