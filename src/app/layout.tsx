import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}