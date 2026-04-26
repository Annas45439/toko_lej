"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Tag, ArrowDownToLine,
  ShoppingCart, History, TrendingUp, Users, Truck,
  UserCog, LogOut, ChevronLeft, ChevronRight, Store, UsersRound,
  Crown, User, UserCircle, X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebarStore } from "@/store/useSidebarStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/produk", label: "Produk", icon: <Package size={20} /> },
  { href: "/kategori", label: "Kategori", icon: <Tag size={20} />, adminOnly: true },
  { href: "/stok", label: "Stok Masuk", icon: <ArrowDownToLine size={20} /> },
  { href: "/transaksi", label: "Transaksi (POS)", icon: <ShoppingCart size={20} /> },
  { href: "/riwayat", label: "Riwayat", icon: <History size={20} /> },
  { href: "/prediksi", label: "Prediksi", icon: <TrendingUp size={20} />, adminOnly: true },
  { href: "/pelanggan", label: "Pelanggan", icon: <Users size={20} /> },
  { href: "/suplier", label: "Suplier", icon: <Truck size={20} /> },
  { href: "/user", label: "Manajemen User", icon: <UserCog size={20} />, adminOnly: true },
  { href: "/team", label: "Our Team", icon: <UsersRound size={20} /> },
];

interface SidebarProps {
  userLevel: "admin" | "kasir";
  userName: string;
}

export function Sidebar({ userLevel, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebarStore();

  const getAvatarStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return {
          bg: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500",
          shadow: "shadow-amber-500/40",
          ring: "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-[#030014]",
          icon: <Crown size={14} className="text-white drop-shadow-md" strokeWidth={2.5} />,
        };
      case "karyawan":
      case "kasir":
        return {
          bg: "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600",
          shadow: "shadow-cyan-500/40",
          ring: "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[#030014]",
          icon: <User size={14} className="text-white drop-shadow-md" strokeWidth={2.5} />,
        };
      default:
        return {
          bg: "bg-gradient-to-br from-slate-400 to-slate-600",
          shadow: "shadow-slate-500/30",
          ring: "ring-1 ring-slate-500/50 ring-offset-1 ring-offset-[#030014]",
          icon: <UserCircle size={14} className="text-white drop-shadow-md" strokeWidth={2.5} />,
        };
    }
  };

  const avatar = getAvatarStyles(userLevel);

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || userLevel === "admin"
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 72 : 240,
          x: typeof window !== "undefined" && window.innerWidth < 768 && !isMobileOpen ? -240 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed md:sticky top-0 left-0 h-screen flex flex-col sidebar-glass z-50 transition-transform md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ overflow: "hidden" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 group cursor-pointer transition-all relative">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.5)] transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent z-10" />
            <img src="/app-logo.png" alt="Logo" className="w-8 h-8 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex flex-col justify-center"
              >
                <p className="text-xl font-black tracking-widest uppercase text-white leading-none drop-shadow-md" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  TOKO LEJ
                </p>
                <p className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase mt-1">
                  Lestari Eka Jaya
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button for mobile */}
          <button 
            onClick={closeMobile}
            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scroll">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="block" onClick={() => {
              if (window.innerWidth < 768) closeMobile();
            }}>
              <div className="relative group">
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 overflow-hidden ${
                    isActive
                      ? "bg-slate-800/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.05)] border border-cyan-400/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={`flex-shrink-0 relative z-10 ${isActive ? "text-cyan-400" : ""}`}>
                    {item.icon}
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-l-xl shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    />
                  )}
                </motion.div>

                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-2 py-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${avatar.bg} ${avatar.shadow} ${avatar.ring}`}>
                {avatar.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 truncate">
                  {userName}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                  {userLevel}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle (Desktop Only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass-card border border-white/20 items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all z-40 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
    </>
  );
}
