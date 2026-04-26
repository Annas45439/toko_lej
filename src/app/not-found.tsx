"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "#030712" }}>
      <div className="bg-mesh" />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AlertCircle size={64} className="mx-auto text-purple-500 opacity-60" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-8xl font-black mb-4"
          style={{
            background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-semibold text-slate-300 mb-2"
        >
          Halaman Tidak Ditemukan
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 text-sm mb-8"
        >
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/dashboard" className="btn-primary inline-flex">
            <Home size={16} /> Kembali ke Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
