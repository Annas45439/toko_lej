"use client";
import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul di sini setelah ditambahkan.",
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 p-5 rounded-2xl bg-white/5 text-slate-500">
        {icon ?? <PackageSearch size={40} strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
    </motion.div>
  );
}
