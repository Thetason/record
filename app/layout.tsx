import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://www.recordyours.com"),
  title: "Re:cord - 상담 전에 보내는 신뢰 포트폴리오",
  description:
    "리뷰를 모으는 게 아니라, 보내는 링크를 만듭니다. 각 플랫폼에 흩어진 리뷰와 업력을 한 링크에 모아 예비고객에게 바로 전달하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard was already referenced in CSS but never actually loaded */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
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
            {children}
            <ToastContainer />
            <footer className="py-6 border-t text-center text-xs text-gray-600">
              <p>© {new Date().getFullYear()} Re:cord. All rights reserved. · 문의: <a className="underline" href="mailto:support@record.kr">support@record.kr</a></p>
            </footer>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
