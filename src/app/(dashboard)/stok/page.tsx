"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ArrowDownToLine, Search } from "lucide-react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { ModalForm } from "@/components/shared/ModalForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { StockIn, Product, Supplier } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const schema = z.object({
  product_id: z.coerce.number().min(1, "Pilih produk"),
  supplier_id: z.coerce.number().min(1, "Pilih suplier"),
  qty: z.coerce.number().min(1, "Qty minimal 1"),
  buy_price: z.coerce.number().min(0),
  date: z.string().min(1, "Tanggal wajib diisi"),
});
type FormData = { product_id: number; supplier_id: number; qty: number; buy_price: number; date: string };

export default function StokPage() {
  const [history, setHistory] = useState<StockIn[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { date: format(new Date(), "yyyy-MM-dd") },
  });

  const fetchAll = async () => {
    try {
      const [h, p, s] = await Promise.all([
        axios.get("/api/stok"),
        axios.get("/api/produk"),
        axios.get("/api/suplier"),
      ]);
      setHistory(h.data); setProducts(p.data); setSuppliers(s.data);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await axios.post("/api/stok", data);
      toast.success("Stok masuk berhasil dicatat!");
      setModalOpen(false);
      reset({ date: format(new Date(), "yyyy-MM-dd"), qty: 1, buy_price: 0, product_id: 0, supplier_id: 0 });
      fetchAll();
    } catch (e: any) { toast.error(e.response?.data?.error ?? "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const filtered = history.filter((h) =>
    h.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    h.supplier?.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<StockIn>[] = [
    { header: "Tanggal", cell: ({ row }) => <span className="text-slate-300 text-sm">{format(new Date(row.original.date), "d MMM yyyy", { locale: id })}</span> },
    { header: "Produk", cell: ({ row }) => <span className="font-medium text-white">{row.original.product?.name}</span> },
    { header: "Suplier", cell: ({ row }) => <span className="text-slate-400">{row.original.supplier?.name}</span> },
    { header: "Qty", accessorKey: "qty", cell: (i) => <span className="font-semibold text-cyan-400">{i.getValue() as number}</span> },
    {
      header: "Harga Beli",
      cell: ({ row }) => <span className="font-mono text-sm text-slate-300">
        {Number(row.original.buy_price).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
      </span>,
    },
    {
      header: "Total",
      cell: ({ row }) => <span className="font-semibold text-white">
        {(Number(row.original.buy_price) * row.original.qty).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
      </span>,
    },
    { header: "Dicatat Oleh", cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.user?.username}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowDownToLine size={22} className="text-cyan-400" /> Stok Masuk
        </h1>
        <button onClick={() => { reset({ date: format(new Date(), "yyyy-MM-dd") }); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Catat Stok Masuk
        </button>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk/suplier..." className="input-glass w-full pl-9" />
          </div>
        </div>
        {loading ? <LoadingSkeleton rows={6} /> : <DataTable data={filtered} columns={columns} />}
      </div>

      <ModalForm isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Catat Stok Masuk" size="md">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div>
            <label className="label-glass">Produk</label>
            <select {...register("product_id")} className="input-glass w-full">
              <option value={0}>Pilih produk...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
            </select>
            {errors.product_id && <p className="error-text">{errors.product_id.message}</p>}
          </div>
          <div>
            <label className="label-glass">Suplier</label>
            <select {...register("supplier_id")} className="input-glass w-full">
              <option value={0}>Pilih suplier...</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.supplier_id && <p className="error-text">{errors.supplier_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Jumlah (Qty)</label>
              <input {...register("qty")} type="number" min={1} className="input-glass w-full" />
              {errors.qty && <p className="error-text">{errors.qty.message}</p>}
            </div>
            <div>
              <label className="label-glass">Harga Beli (Rp)</label>
              <input {...register("buy_price")} type="number" min={0} className="input-glass w-full" />
            </div>
          </div>
          <div>
            <label className="label-glass">Tanggal</label>
            <input {...register("date")} type="date" className="input-glass w-full" />
            {errors.date && <p className="error-text">{errors.date.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
