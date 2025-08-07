"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl bg-white/98 backdrop-blur-md z-50 rounded-full shadow-lg p-2">
      <div className="flex justify-between items-center px-6 py-3">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-bold text-text-primary">Re:cord</span>
          <span className="text-primary">*</span>
        </Link>
        
        <div className="hidden md:flex gap-8 items-center">
          <Link href="#" className="text-text-primary hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="#" className="text-text-primary hover:text-primary transition-colors">
            Templates
          </Link>
          <Link href="#" className="text-text-primary hover:text-primary transition-colors">
            Learn
          </Link>
          <Link href="#" className="text-text-primary hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>
        
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-text-primary hover:text-primary transition-colors">
            대시보드
          </Link>
          <Link href="/login" className="text-text-primary hover:text-primary transition-colors">
            로그인
          </Link>
          <Button asChild>
            <Link href="/signup">시작하기</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}