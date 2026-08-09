import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SiteFooter } from "@/components/ui/site-footer";

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
            <SiteFooter />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
