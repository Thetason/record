import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Re:cord - 리뷰는 누군가의 기억입니다",
  description: "여러 플랫폼에 흩어진 리뷰를 한 곳에 모아드립니다. Re:cord로 당신의 이야기를 완성하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h+gopKjg4s1aOtQHOKBEgLQRZk/i6RnUWfxY7FdWaZW5fmZPNIPPeM37g"
          crossOrigin="anonymous"
          async
        ></script>
      </head>
      {/* Use system fonts to avoid remote font fetch during build */}
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {/* Simple onboarding banner */}
            <div className="w-full bg-orange-50 text-orange-900 text-sm px-4 py-2 text-center">
              처음이신가요? 1) 회원가입 2) 프로필 설정 3) 첫 리뷰 업로드 4) 프로필 공유까지 3분!
            </div>
            {children}
            <ToastContainer />
            <footer className="py-6 border-t text-center text-xs text-gray-600">
              <p>© 2024 Re:cord. All rights reserved. · 문의: <a className="underline" href="mailto:support@record.kr">support@record.kr</a></p>
            </footer>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
