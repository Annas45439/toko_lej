"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Package, ShoppingCart, AlertTriangle, Users,
  TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { DashboardStats } from "@/types";

function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({
  label, value, icon, color, delay,
}: {
  label: string; value: number; icon: React.ReactNode;
  color: string; delay: number;
}) {
  const count = useCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 hover-glow group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        <ArrowUpRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-3xl font-bold text-white tabular-nums">{count.toLocaleString("id-ID")}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 rounded-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {typeof p.value === "number"
              ? p.value.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 rounded-xl text-sm">
        <p className="text-slate-400 mb-1 text-xs">{label}</p>
        <p className="font-semibold text-cyan-400">{payload[0].value} unit terjual</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/dashboard")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  const userName = session?.user?.name ?? "User";
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Selamat datang, <span className="gradient-text">{userName}</span>! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {format(now, "EEEE, d MMMM yyyy", { locale: id })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Produk" value={stats?.totalProducts ?? 0}
          icon={<Package size={22} className="text-cyan-400" />}
          color="bg-cyan-500/10" delay={0}
        />
        <StatCard
          label="Transaksi Hari Ini" value={stats?.todayTransactions ?? 0}
          icon={<ShoppingCart size={22} className="text-purple-400" />}
          color="bg-purple-500/10" delay={0.1}
        />
        <StatCard
          label="Stok Hampir Habis" value={stats?.lowStockCount ?? 0}
          icon={<AlertTriangle size={22} className="text-orange-400" />}
          color="bg-orange-500/10" delay={0.2}
        />
        <StatCard
          label="Total Pelanggan" value={stats?.totalCustomers ?? 0}
          icon={<Users size={22} className="text-green-400" />}
          color="bg-green-500/10" delay={0.3}
        />
      </div>

      {/* Low stock alert */}
      {(stats?.lowStockCount ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300"
        >
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Peringatan Stok!</p>
            <p className="text-xs text-orange-400 mt-0.5">
              Ada <b>{stats?.lowStockCount}</b> produk dengan stok di bawah batas minimum. Segera lakukan restok.
            </p>
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Penjualan 6 Bulan Terakhir</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.salesChart ?? []}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total Penjualan"
                stroke="#06b6d4" strokeWidth={2} fill="url(#salesGrad)" dot={{ fill: "#06b6d4", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Top 5 Produk Terlaris (Bulan Ini)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.topProducts ?? []} layout="vertical">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="total_qty" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-5"
      >
        <h2 className="text-sm font-semibold text-white mb-4">Transaksi Terbaru</h2>
        {!stats?.recentTransactions?.length ? (
          <p className="text-slate-500 text-sm text-center py-8">Belum ada transaksi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-white/5">
                  <th className="text-left pb-2 font-medium">Invoice</th>
                  <th className="text-left pb-2 font-medium">Pelanggan</th>
                  <th className="text-left pb-2 font-medium">Total</th>
                  <th className="text-left pb-2 font-medium">Metode</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-left pb-2 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-cyan-400 text-xs">{t.invoice_no}</td>
                    <td className="py-3 text-slate-300">{t.customer?.name ?? "Umum"}</td>
                    <td className="py-3 text-white font-semibold">
                      {Number(t.total).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.payment_method === "tunai"
                          ? "bg-cyan-500/15 text-cyan-400"
                          : "bg-purple-500/15 text-purple-400"
                      }`}>
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === "selesai"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {format(new Date(t.date), "d MMM HH:mm", { locale: id })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
