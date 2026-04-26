"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Tag, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { ModalForm } from "@/components/shared/ModalForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Category } from "@/types";

export default function KategoriPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    try {
      const r = await axios.get("/api/kategori");
      setData(r.data);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ name: "", description: "" }); setModalOpen(true); };
  const openEdit = (item: Category) => { setEditItem(item); setForm({ name: item.name, description: item.description ?? "" }); setModalOpen(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nama wajib diisi"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await axios.put("/api/kategori", { id: editItem.id, ...form });
        toast.success("Kategori diperbarui");
      } else {
        await axios.post("/api/kategori", form);
        toast.success("Kategori ditambahkan");
      }
      setModalOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error ?? "Gagal"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await axios.delete("/api/kategori", { data: { id: deleteItem.id } });
      toast.success("Kategori dihapus"); setDeleteItem(null); fetch();
    } catch { toast.error("Gagal menghapus"); }
  };

  const filtered = data.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnDef<Category>[] = [
    { header: "No", cell: ({ row }) => row.index + 1, size: 60 },
    { accessorKey: "name", header: "Nama Kategori", cell: (i) => <span className="font-medium text-white">{i.getValue() as string}</span> },
    { accessorKey: "description", header: "Deskripsi", cell: (i) => <span className="text-slate-400">{(i.getValue() as string) ?? "-"}</span> },
    { header: "Jumlah Produk", cell: ({ row }) => <span className="text-cyan-400 font-semibold">{row.original._count?.tb_products ?? 0}</span> },
    {
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row.original)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Edit2 size={14} /></button>
          <button onClick={() => setDeleteItem(row.original)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Tag size={22} className="text-purple-400" /> Kategori Produk</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> Tambah Kategori</button>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kategori..." className="input-glass w-full max-w-xs" />
        {loading ? <LoadingSkeleton rows={5} /> : <DataTable data={filtered} columns={columns} />}
      </div>

      <ModalForm isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Kategori" : "Tambah Kategori"} size="sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label-glass">Nama Kategori</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass w-full" placeholder="Contoh: Minuman" />
          </div>
          <div>
            <label className="label-glass">Deskripsi (opsional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass w-full resize-none" rows={3} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Menyimpan..." : editItem ? "Update" : "Simpan"}</button>
          </div>
        </form>
      </ModalForm>

      <ModalForm isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Hapus Kategori" size="sm">
        <div className="text-center space-y-4">
          <p className="text-slate-300">Hapus kategori <b className="text-white">{deleteItem?.name}</b>?</p>
          <p className="text-slate-500 text-xs">Produk yang menggunakan kategori ini tidak akan terhapus.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteItem(null)} className="btn-ghost flex-1">Batal</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">Hapus</button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
