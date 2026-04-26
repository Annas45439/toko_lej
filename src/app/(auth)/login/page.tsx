"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Store, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import TrueFocus from "@/components/TrueFocus/TrueFocus";
import Plasma from "@/components/Plasma/Plasma";
import LogoImg from "@/../public/app-logo.png";

const schema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        toast.error("Username atau password salah!");
      } else {
        toast.success("Login berhasil! Selamat datang 👋");
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Plasma Background */}
      <div className="absolute inset-0 z-0">
        <Plasma
          color="#06b6d4"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.9}
          mouseInteractive={true}
        />
      </div>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 group cursor-pointer">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative mb-6 group"
          >
            <img 
              src={LogoImg.src} 
              alt="Logo" 
              className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-transform duration-500 group-hover:scale-110" 
            />
          </motion.div>
          <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <TrueFocus 
              sentence="TOKO LEJ"
              manualMode={false}
              blurAmount={4}
              borderColor="#22d3ee"
              glowColor="rgba(34, 211, 238, 0.5)"
              animationDuration={0.8}
              pauseBetweenAnimations={0.5}
              className="text-4xl font-black tracking-[0.15em] uppercase text-white leading-none drop-shadow-md"
            />
          </div>
          <p className="text-xs font-mono tracking-[0.3em] text-slate-400 uppercase mt-4 text-center">
            Lestari Eka Jaya — Sistem Informasi
          </p>
        </div>

        {/* Card */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl p-8"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Masuk ke Akun Anda</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium">Username</label>
              <input
                {...register("username")}
                type="text"
                placeholder="Masukkan username"
                autoComplete="username"
                className="input-glass w-full"
              />
              <AnimatePresence>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {errors.username.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="input-glass w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] text-white font-extrabold text-sm uppercase tracking-widest hover:from-[#22d3ee] hover:to-[#3b82f6] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] mt-6 border border-white/20"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © tj nyeni asolole 
        </p>
      </motion.div>
    </div>
  );
}
