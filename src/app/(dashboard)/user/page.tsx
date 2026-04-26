"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { UserCog, Plus, Search, Edit2, Trash2, X, Save, Eye, EyeOff, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { AppUser } from "@/types";
import toast from "react-hot-toast";

// Validation Schema
const userSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: "Password minimal 6 karakter",
  }),
  level: z.enum(["admin", "kasir"]),
});

type UserForm = z.infer<typeof userSchema>;

export default function UserPage() {
  // --- States ---
  const [data, setData] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; edit?: AppUser }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // --- Form Hook ---
  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- Derived State (Search Filter) ---
  const filteredData = useMemo(() => {
    const query = search.toLowerCase();
    return data.filter((d) => d.username.toLowerCase().includes(query));
  }, [search, data]);

  // --- Handlers ---
  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get("/api/user");
      setData(res.data);
    } catch {
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    reset({ username: "", password: "", level: "kasir" });
    setModal({ open: true });
    setShowPwd(false);
  };

  const openEdit = (item: AppUser) => {
    reset({ username: item.username, password: "", level: item.level });
    setModal({ open: true, edit: item });
    setShowPwd(false);
  };

  const closeModal = () => setModal({ open: false });

  const onSubmit = async (form: UserForm) => {
    // Extra validation for new user
    if (!modal.edit && !form.password) {
      setError("password", { message: "Password wajib untuk user baru" });
      return;
    }

    setSaving(true);
    try {
      if (modal.edit) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await axios.put(`/api/user/${modal.edit.id}`, payload);
        toast.success("User diperbarui");
      } else {
        await axios.post("/api/user", form);
        toast.success("User ditambahkan");
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AppUser) => {
    const confirmMsg = `Hapus user "@${item.username}"? Tindakan ini tidak dapat dibatalkan.`;
    if (!confirm(confirmMsg)) return;

    try {
      await axios.delete(`/api/user/${item.id}`);
      toast.success("User dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCog size={20} className="text-red-400" /> Manajemen User
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{data.length} user terdaftar — hanya admin</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Tambah User
        </button>
      </motion.div>

      {/* Search Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            className="input-glass pl-9" 
            placeholder="Cari username..."
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
            icon={<UserCog size={40} />} 
            title="Belum ada user" 
            description="Tambahkan user pertama" 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-glass">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td className="text-slate-600 text-xs">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {item.username.charAt(0)}
                        </div>
                        <span className="text-white font-medium">@{item.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.level === "admin" ? "badge-red" : "badge-cyan"} flex items-center gap-1 w-fit`}>
                        <Shield size={10} />
                        {item.level === "admin" ? "Admin" : "Kasir"}
                      </span>
                    </td>
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

      {/* Form Modal */}
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
                <h3 className="font-bold text-white">{modal.edit ? "Edit User" : "Tambah User"}</h3>
                <button onClick={closeModal} className="btn-secondary p-2"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label-glass">Username *</label>
                  <input {...register("username")} className="input-glass" placeholder="username_login" />
                  {errors.username && <p className="error-text">{errors.username.message}</p>}
                </div>
                
                <div>
                  <label className="label-glass">
                    Password {modal.edit && <span className="text-slate-600">(kosongkan jika tidak diubah)</span>}
                  </label>
                  <div className="relative">
                    <input 
                      {...register("password")} 
                      type={showPwd ? "text" : "password"}
                      className="input-glass pr-10" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="error-text">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="label-glass">Role *</label>
                  <select {...register("level")} className="input-glass cursor-pointer">
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                  </select>
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
