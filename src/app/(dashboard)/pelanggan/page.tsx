"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Edit2, Trash2, X, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Customer } from "@/types";
import toast from "react-hot-toast";

// Validation Schema
const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function PelangganPage() {
  // --- States ---
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; edit?: Customer }>({ open: false });
  const [saving, setSaving] = useState(false);

  // --- Form Hook ---
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- Derived State ---
  const filteredData = useMemo(() => {
    const query = search.toLowerCase();
    return data.filter((item) => 
      item.name.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.address?.toLowerCase().includes(query)
    );
  }, [search, data]);

  // --- Handlers ---
  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get("/api/pelanggan");
      setData(res.data);
    } catch {
      toast.error("Gagal memuat data pelanggan");
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    reset({ name: "", phone: "", address: "" });
    setModal({ open: true });
  };

  const openEdit = (item: Customer) => {
    reset({ name: item.name, phone: item.phone ?? "", address: item.address ?? "" });
    setModal({ open: true, edit: item });
  };

  const closeModal = () => setModal({ open: false });

  const onSubmit = async (form: CustomerForm) => {
    setSaving(true);
    try {
      if (modal.edit) {
        await axios.put(`/api/pelanggan/${modal.edit.id}`, form);
        toast.success("Pelanggan diperbarui");
      } else {
        await axios.post("/api/pelanggan", form);
        toast.success("Pelanggan ditambahkan");
      }
      closeModal();
      fetchData();
    } catch {
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Customer) => {
    if (!confirm(`Hapus pelanggan "${item.name}"?`)) return;
    try {
      await axios.delete(`/api/pelanggan/${item.id}`);
      toast.success("Pelanggan dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus pelanggan");
    }
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users size={20} className="text-green-400" /> Data Pelanggan
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{data.length} pelanggan terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </motion.div>

      {/* Search Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            className="input-glass pl-9" 
            placeholder="Cari nama, telepon, atau alamat..."
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <PageSkeleton />
        ) : filteredData.length === 0 ? (
          <EmptyState 
            icon={<Users size={40} />} 
            title="Belum ada pelanggan" 
            description="Klik tombol Tambah Pelanggan untuk mulai" 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-glass">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Telepon</th>
                  <th>Alamat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <motion.tr 
                    key={item.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="text-slate-600 text-xs">{i + 1}</td>
                    <td className="text-white font-medium">{item.name}</td>
                    <td>{item.phone ?? <span className="text-slate-600">-</span>}</td>
                    <td className="max-w-xs truncate">{item.address ?? <span className="text-slate-600">-</span>}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="btn-secondary py-1.5 px-3 text-xs">
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(item)} className="btn-danger py-1.5 px-3 text-xs">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal Section */}
      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">{modal.edit ? "Edit Pelanggan" : "Tambah Pelanggan"}</h3>
                <button onClick={closeModal} className="btn-secondary p-2"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label-glass">Nama Pelanggan *</label>
                  <input {...register("name")} className="input-glass" placeholder="Masukkan nama..." />
                  {errors.name && <p className="error-text">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label-glass">Nomor Telepon</label>
                  <input {...register("phone")} className="input-glass" placeholder="08xx..." />
                </div>
                <div>
                  <label className="label-glass">Alamat</label>
                  <textarea 
                    {...register("address")} 
                    rows={3} 
                    className="input-glass resize-none" 
                    placeholder="Alamat lengkap..." 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    <Save size={15} /> {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
