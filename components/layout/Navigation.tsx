"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl bg-white/98 backdrop-blur-md z-50 rounded-full shadow-lg p-2">
      <div className="flex justify-between items-center px-6 py-3">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-bold text-text-primary">Re:cord</span>
          <span className="text-primary">*</span>
        </Link>
        
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/stylist-demo" className="text-text-primary hover:text-primary transition-colors">
            샘플 페이지
          </Link>
          <Link href="/guide" className="text-text-primary hover:text-primary transition-colors">
            사용 가이드
          </Link>
          <Link href="/pricing" className="text-text-primary hover:text-primary transition-colors">
            가격
          </Link>
        </div>
        
        <div className="flex gap-4 items-center">
          {session ? (
            <Button asChild>
              <Link href="/dashboard/profile">내 링크</Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-text-primary hover:text-primary transition-colors">
                로그인
              </Link>
              <Button asChild>
                <Link href="/signup">내 링크 만들기</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
