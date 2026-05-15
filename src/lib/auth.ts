import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "./prisma"
import { verifyPassword } from "./password"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string
        const password = credentials?.password as string

        if (!username || !password) return null

        console.log("[auth] login attempt:", username)

        const user = await prisma.tb_users.findFirst({
          where: { username },
        })

        console.log("[auth] user found:", user ? `${user.username} (${user.level})` : "not found")

        if (!user) return null
        const passwordValid = await verifyPassword(password, user.password)
        if (!passwordValid) {
          console.log("[auth] password mismatch. DB:", user.password)
          return null
        }

        return {
          id: String(user.id),
          name: user.username,
          email: `${user.username}@toko-lej.com`,
          level: user.level,
          username: user.username,
        }
      },
    }),
  ],
})
