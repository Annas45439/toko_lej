import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const userName = session.user?.name ?? "User";
  const userLevel = ((session.user as any)?.level ?? "kasir") as "admin" | "kasir";

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">

      {/* Modern dotted pattern instead of heavy grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <Sidebar userLevel={userLevel} userName={userName} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header userName={userName} userLevel={userLevel} />
        <main className="flex-1 overflow-y-auto custom-scroll p-6 relative z-10">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15,15,45,0.95)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#06b6d4", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </div>
  );
}
