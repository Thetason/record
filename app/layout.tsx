import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ToastProvider } from "@/lib/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Re:cord - 프리랜서 리뷰 포트폴리오",
  description: "여러 플랫폼의 리뷰를 한 곳에 모아 관리하는 프리랜서 포트폴리오 서비스",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}