"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Crown, User, UserCircle, Menu } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/store/useSidebarStore";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  produk: "Produk",
  kategori: "Kategori",
  stok: "Stok Masuk",
  transaksi: "Transaksi (POS)",
  riwayat: "Riwayat Transaksi",
  prediksi: "Prediksi Penjualan",
  pelanggan: "Pelanggan",
  suplier: "Suplier",
  user: "Manajemen User",
};

interface HeaderProps {
  userName: string;
  userLevel: string;
}

export function Header({ userName, userLevel }: HeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg) => ({
    label: breadcrumbMap[seg] ?? seg,
    href: "/" + seg,
  }));

  const getAvatarStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return {
          bg: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500",
          shadow: "shadow-amber-500/40",
          ring: "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-[#030014]",
          icon: <Crown size={18} className="text-white drop-shadow-md" strokeWidth={2.5} />,
          textRole: "text-amber-400",
        };
      case "karyawan":
      case "kasir":
        return {
          bg: "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600",
          shadow: "shadow-cyan-500/40",
          ring: "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[#030014]",
          icon: <User size={18} className="text-white drop-shadow-md" strokeWidth={2.5} />,
          textRole: "text-cyan-400",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-slate-400 to-slate-600",
          shadow: "shadow-slate-500/30",
          ring: "ring-1 ring-slate-500/50 ring-offset-1 ring-offset-[#030014]",
          icon: <UserCircle size={18} className="text-white drop-shadow-md" strokeWidth={2.5} />,
          textRole: "text-slate-400",
        };
    }
  };

  const avatar = getAvatarStyles(userLevel);
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);

  return (
    <header className="sticky top-0 z-20 px-4 md:px-6 py-4 border-b border-cyan-500/20 backdrop-blur-xl bg-[#030014]/80 flex items-center justify-between gap-4 shadow-lg shadow-cyan-500/10">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobile}
          className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-cyan-300/70 font-semibold">Toko LEJ</span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-slate-600" />
            <span className={i === crumbs.length - 1 ? "text-white font-medium" : "text-slate-400"}>
              {crumb.label}
            </span>
          </span>
        ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium text-white tabular-nums">
            {mounted ? format(now, "HH:mm:ss") : "--:--:--"}
          </span>
          <span className="text-xs text-slate-500">
            {mounted ? format(now, "EEEE, d MMMM yyyy", { locale: id }) : ""}
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3.5 pl-5 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              {userName}
            </p>
            <p className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${avatar.textRole}`}>
              {userLevel}
            </p>
          </div>
          <div 
            className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer ${avatar.bg} ${avatar.shadow} ${avatar.ring}`}
            title={`${userName} - ${userLevel}`}
          >
            {avatar.icon}
          </div>
        </div>
      </div>
    </header>
  );
}
