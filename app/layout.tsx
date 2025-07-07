import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ToastProvider } from "@/lib/toast"

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: "Re:cord - 프리랜서 리뷰 포트폴리오",
  description: "여러 플랫폼의 리뷰를 한 곳에 모아 관리하는 프리랜서 포트폴리오 서비스",
  other: {
    'google-fonts': 'https://fonts.googleapis.com/css2?family=Cal+Sans:wght@400;600;700&display=swap'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${manrope.variable} font-sans`}>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}