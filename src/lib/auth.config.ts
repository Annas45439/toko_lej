import type { NextAuthConfig } from "next-auth"

// Edge-compatible config — dipakai oleh middleware.ts SAJA
// Provider dan Prisma ada di auth.ts (Node.js runtime)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // Izinkan semua halaman api/auth
      if (pathname.startsWith("/api/auth")) return true

      // Halaman login
      if (pathname.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl))
        return true
      }

      // Redirect ke login jika belum login
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      // Halaman admin-only
      const adminOnly = ["/prediksi", "/user"]
      const isAdminRoute = adminOnly.some((r) => pathname.startsWith(r))
      if (isAdminRoute && (auth?.user as any)?.level !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.level = (user as any).level
        token.username = (user as any).username ?? user.name
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).level = token.level
        ;(session.user as any).username = token.username
        session.user.name = token.username as string
      }
      return session
    },
  },
  providers: [], // Providers didefinisikan di auth.ts (non-edge)
}
