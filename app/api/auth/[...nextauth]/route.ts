import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-simple"

// Vercel Edge Runtime 대신 Node.js Runtime 사용
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }