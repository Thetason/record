import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const SITE_TITLE = "Re:cord - 상담 전에 보내는 신뢰 포트폴리오";
const SITE_DESC =
  "리뷰를 모으는 게 아니라, 보내는 링크를 만듭니다. 각 플랫폼에 흩어진 리뷰와 업력을 한 링크에 모아 예비고객에게 바로 전달하세요.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://www.recordyours.com"),
  title: SITE_TITLE,
  description: SITE_DESC,
  // Without these the landing shared to KakaoTalk/DM renders as a bare text
  // card. /api/og with no username returns the brand card.
  openGraph: {
    type: "website",
    siteName: "Re:cord",
    title: SITE_TITLE,
    description: SITE_DESC,
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Don't block pinch-zoom (accessibility); iOS focus-zoom is prevented by
  // keeping form inputs at >=16px instead.
  maximumScale: 5,
  themeColor: "#191f28",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* PWA manifest — enables the Android share-sheet shortcut (캡처 → 공유 → Re:cord) */}
        <link rel="manifest" href="/manifest.json" />
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
            <footer className="border-t border-gray-100 bg-white">
              <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-10 text-center md:flex-row md:justify-between md:text-left">
                <div>
                  <div className="flex items-center justify-center gap-1 md:justify-start">
                    <span className="text-lg font-extrabold tracking-[-0.04em] text-[#191f28]">Re:cord</span>
                    <span className="text-[#FF6B35]">*</span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    © {new Date().getFullYear()} Re:cord · 흩어진 리뷰를 한 줄의 링크로
                  </p>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
                  <Link href="/guide" className="hover:text-gray-900">사용 가이드</Link>
                  <Link href="/pricing" className="hover:text-gray-900">요금 안내</Link>
                  <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
                  <Link href="/privacy" className="hover:text-gray-900">개인정보처리방침</Link>
                  <a className="hover:text-gray-900" href="mailto:support@record.kr">문의</a>
                </nav>
              </div>
            </footer>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
