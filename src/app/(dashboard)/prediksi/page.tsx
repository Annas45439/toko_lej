"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TrendingUp, Brain, BarChart2, AlertCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import toast from "react-hot-toast";

interface PrediksiResult {
  historical: { month: string; total: number }[];
  predictions: { month: string; predicted: number; lower: number; upper: number }[];
  slope: number;
  intercept: number;
  r2: number;
  trend: "naik" | "turun" | "stabil";
  mape: number;
}

function formatRp(n: number) {
  return Number(n).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 rounded-xl text-sm border-white/10">
        <p className="text-slate-400 mb-2 text-xs font-semibold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-medium" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? formatRp(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PrediksiPage() {
  const [data, setData] = useState<PrediksiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState(3);

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/prediksi?periods=${p}`);
      setData(res.data);
    } catch {
      toast.error("Gagal menghitung prediksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(periods); }, []);

  const handlePeriodChange = (p: number) => {
    setPeriods(p);
    fetchData(p);
  };

  const chartData = data
    ? [
        ...data.historical.map((h) => ({ month: h.month, aktual: h.total, prediksi: undefined })),
        ...data.predictions.map((p) => ({ month: p.month, aktual: undefined, prediksi: p.predicted, lower: p.lower, upper: p.upper })),
      ]
    : [];

  const trendColor = data?.trend === "naik" ? "text-green-400" : data?.trend === "turun" ? "text-red-400" : "text-yellow-400";
  const trendBg = data?.trend === "naik" ? "bg-green-500/10 border-green-500/20" : data?.trend === "turun" ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20";

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Brain size={20} className="text-cyan-400" /> Prediksi Penjualan
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Linear Regression berbasis data penjualan historis</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">Prediksi ke depan:</span>
          {[1, 2, 3, 6].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                periods === p
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                  : "btn-secondary"
              }`}
            >
              {p} bln
            </button>
          ))}
        </div>
      </motion.div>

      {!data ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4 opacity-60" />
          <p className="text-slate-400">Data penjualan tidak cukup untuk prediksi.</p>
          <p className="text-slate-600 text-sm mt-1">Minimal 3 bulan data diperlukan.</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Trend Penjualan",
                value: data.trend.toUpperCase(),
                sub: "Arah pergerakan penjualan",
                icon: <TrendingUp size={20} className={trendColor} />,
                extra: <span className={`badge ${trendBg} ${trendColor} mt-2`}>{data.trend}</span>,
              },
              {
                label: "Koefisien R²",
                value: (data.r2 * 100).toFixed(1) + "%",
                sub: "Akurasi model regresi",
                icon: <BarChart2 size={20} className="text-purple-400" />,
              },
              {
                label: "MAPE",
                value: data.mape.toFixed(1) + "%",
                sub: "Rata-rata error prediksi",
                icon: <AlertCircle size={20} className="text-orange-400" />,
              },
              {
                label: "Data Training",
                value: data.historical.length + " bln",
                sub: "Periode historis digunakan",
                icon: <Brain size={20} className="text-cyan-400" />,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 hover-glow"
              >
                <div className="flex items-center gap-2 mb-3">{card.icon}<p className="text-xs text-slate-500">{card.label}</p></div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-600 mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Grafik Penjualan & Prediksi</h2>
            <p className="text-xs text-slate-500 mb-6">Garis putus-putus = proyeksi prediksi</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                <ReferenceLine x={data.historical[data.historical.length - 1]?.month}
                  stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" label={{ value: "Sekarang", fill: "#64748b", fontSize: 10 }} />
                <Line type="monotone" dataKey="aktual" name="Aktual" stroke="#06b6d4"
                  strokeWidth={2.5} dot={{ fill: "#06b6d4", r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="prediksi" name="Prediksi" stroke="#8b5cf6"
                  strokeWidth={2} strokeDasharray="6 3" dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 2, stroke: "#030712" }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Prediction Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/05">
              <h2 className="text-sm font-semibold text-white">Detail Prediksi Per Bulan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-glass">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th>Prediksi Penjualan</th>
                    <th>Batas Bawah</th>
                    <th>Batas Atas</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {data.predictions.map((p, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}>
                      <td className="font-medium text-white">{p.month}</td>
                      <td className="font-bold text-purple-300">{formatRp(p.predicted)}</td>
                      <td className="text-slate-500">{formatRp(p.lower)}</td>
                      <td className="text-slate-500">{formatRp(p.upper)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-white/05 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.max(20, 100 - i * 15)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{Math.max(20, 100 - i * 15)}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Model info */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-5 border-cyan-500/10"
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Info Model</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-slate-600 text-xs">Persamaan Regresi</p>
                <p className="text-white font-mono text-xs mt-1">y = {data.slope.toFixed(0)}x + {data.intercept.toFixed(0)}</p></div>
              <div><p className="text-slate-600 text-xs">Slope (Δ per bulan)</p>
                <p className={`font-semibold mt-1 ${data.slope > 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.slope > 0 ? "+" : ""}{formatRp(data.slope)}</p></div>
              <div><p className="text-slate-600 text-xs">R² Score</p>
                <p className="text-purple-400 font-semibold mt-1">{(data.r2 * 100).toFixed(2)}%</p></div>
              <div><p className="text-slate-600 text-xs">Metode</p>
                <p className="text-cyan-400 font-semibold mt-1">Ordinary Least Squares</p></div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
