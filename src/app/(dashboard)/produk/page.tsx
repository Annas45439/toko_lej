"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { ModalForm } from "@/components/shared/ModalForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Product, Category, Unit } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak valid"),
  buy_price: z.coerce.number().min(0, "Harga beli tidak valid"),
  stock: z.coerce.number().min(0),
  min_stock: z.coerce.number().min(0),
  category_id: z.coerce.number().min(1, "Pilih kategori"),
  unit_id: z.coerce.number().min(1, "Pilih satuan"),
});
type FormData = z.infer<typeof schema>;

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock === 0) return <span className="badge-red">HABIS</span>;
  if (stock <= minStock) return <span className="badge-orange">HAMPIR HABIS</span>;
  return <span className="badge-green">AMAN</span>;
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchAll = async () => {
    try {
      const [p, c, u] = await Promise.all([
        axios.get("/api/produk"),
        axios.get("/api/kategori"),
        axios.get("/api/satuan"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
      setUnits(u.data);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    reset({ name: "", price: 0, buy_price: 0, stock: 0, min_stock: 5, category_id: 0, unit_id: 0 });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    reset({
      name: p.name, price: p.price, buy_price: p.buy_price,
      stock: p.stock, min_stock: p.min_stock,
      category_id: p.category_id, unit_id: p.unit_id,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editProduct) {
        await axios.put(`/api/produk/${editProduct.id}`, data);
        toast.success("Produk berhasil diperbarui");
      } else {
        await axios.post("/api/produk", data);
        toast.success("Produk berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await axios.delete(`/api/produk/${deleteProduct.id}`);
      toast.success("Produk dihapus");
      setDeleteProduct(null);
      fetchAll();
    } catch { toast.error("Gagal menghapus produk"); }
  };

  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.category_id === Number(filterCat) : true;
    return matchSearch && matchCat;
  }), [products, search, filterCat]);

  const columns: ColumnDef<Product>[] = [
    { header: "No", cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: "name", header: "Nama Produk", cell: (i) => <span className="font-medium text-white">{i.getValue() as string}</span> },
    { accessorKey: "category.name", header: "Kategori", cell: (i) => <span className="text-slate-400">{i.row.original.category?.name ?? "-"}</span> },
    { accessorKey: "unit.name", header: "Satuan", cell: (i) => <span className="text-slate-400">{i.row.original.unit?.name ?? "-"}</span> },
    {
      accessorKey: "price", header: "Harga Jual",
      cell: (i) => <span className="text-cyan-400 font-mono text-sm">
        {Number(i.getValue()).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
      </span>,
    },
    {
      accessorKey: "buy_price", header: "Harga Beli",
      cell: (i) => <span className="text-slate-400 font-mono text-sm">
        {Number(i.getValue()).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
      </span>,
    },
    {
      accessorKey: "stock", header: "Stok",
      cell: (i) => <span className="font-semibold text-white">{i.getValue() as number}</span>,
    },
    {
      header: "Status",
      cell: ({ row }) => <StockBadge stock={row.original.stock} minStock={row.original.min_stock} />,
    },
    {
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row.original)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setDeleteProduct(row.original)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package size={22} className="text-cyan-400" /> Manajemen Produk
          </h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} produk terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..." className="input-glass w-full pl-9" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-glass min-w-[160px]">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl p-5">
        {loading ? <LoadingSkeleton rows={8} /> : <DataTable data={filtered} columns={columns} />}
      </div>

      {/* Modal Add/Edit */}
      <ModalForm isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editProduct ? "Edit Produk" : "Tambah Produk"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-glass">Nama Produk</label>
            <input {...register("name")} className="input-glass w-full" placeholder="Nama produk" />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Kategori</label>
              <select {...register("category_id")} className="input-glass w-full">
                <option value={0}>Pilih kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="error-text">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="label-glass">Satuan</label>
              <select {...register("unit_id")} className="input-glass w-full">
                <option value={0}>Pilih satuan</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.unit_id && <p className="error-text">{errors.unit_id.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Harga Jual (Rp)</label>
              <input {...register("price")} type="number" min={0} className="input-glass w-full" />
              {errors.price && <p className="error-text">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label-glass">Harga Beli (Rp)</label>
              <input {...register("buy_price")} type="number" min={0} className="input-glass w-full" />
              {errors.buy_price && <p className="error-text">{errors.buy_price.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Stok Awal</label>
              <input {...register("stock")} type="number" min={0} className="input-glass w-full" />
            </div>
            <div>
              <label className="label-glass">Stok Minimum</label>
              <input {...register("min_stock")} type="number" min={0} className="input-glass w-full" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Menyimpan..." : editProduct ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </ModalForm>

      {/* Delete Confirm Modal */}
      <ModalForm isOpen={!!deleteProduct} onClose={() => setDeleteProduct(null)}
        title="Konfirmasi Hapus" size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <p className="text-slate-300">Hapus produk <b className="text-white">{deleteProduct?.name}</b>?</p>
          <p className="text-slate-500 text-sm">Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteProduct(null)} className="btn-ghost flex-1">Batal</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
              Hapus
            </button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
