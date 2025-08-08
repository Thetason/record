"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="mt-32 min-h-screen flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        {/* Hero Content */}
        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            리뷰는 누군가의 기억입니다.
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-text-primary mb-6">
            여러분의 서비스로 기뻐한 순간,<br/>
            <span className="text-[#FF6B35]">그 감정이 남긴 소중한 기록.</span>
          </p>
          <p className="text-xl text-text-secondary mb-4">
            <strong>Re:cord</strong>는 그 기억이 잊히지 않도록,<br/>
            흩어진 리뷰를 한 곳에 모아드립니다.
          </p>
          <p className="text-lg text-text-secondary mb-10">
            여러 플랫폼에 흩어진 리뷰를 한 곳에,<br/>
            <strong>Re:cord</strong>로 당신의 이야기를 완성하세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="px-8 py-4 bg-[#FF6B35] hover:bg-[#E55A2B]">
              Re:cord 시작하기
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4">
              데모 보기
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex">
              {['김', '이', '박', '최'].map((name, index) => (
                <div 
                  key={index} 
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm -ml-2 first:ml-0 border-2 border-white"
                >
                  {name}
                </div>
              ))}
            </div>
            <p className="text-text-secondary text-sm">
              &ldquo;프리랜서를 위한 가장 정직한&rdquo; 나만의 리뷰 포트폴리오
            </p>
          </div>
        </div>

        {/* Profile Preview */}
        <ProfilePreview />
      </div>
    </section>
  );
}

function ProfilePreview() {
  return (
    <div className="relative">
      <div className="absolute -top-5 -right-5 bg-[#FF6B35] text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
        🔴 실시간 프로필
      </div>
      
      <Card className="max-w-md mx-auto p-8">
        <CardContent className="p-0">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-[#FF6B35]">
              김
            </div>
            <h3 className="text-xl font-bold mb-1">김서연</h3>
            <p className="text-text-secondary mb-1">요가 강사</p>
            <p className="text-[#FF6B35] text-sm">re-cord.kr/seoyeon</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-text-light text-xs mb-1">총 리뷰</p>
              <p className="text-2xl font-bold text-[#FF6B35]">107개</p>
            </div>
            <div className="text-center">
              <p className="text-text-light text-xs mb-1">평균 별점</p>
              <p className="text-2xl font-bold text-[#FF6B35]">4.9</p>
            </div>
            <div className="text-center">
              <p className="text-text-light text-xs mb-1">추천율</p>
              <p className="text-2xl font-bold text-[#FF6B35]">98%</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">네이버 33개</span>
            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs">카카오 21개</span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">구글 24개</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">크몽 29개</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-end mb-2">
              <span className="text-green-600 text-xs font-semibold">마인드홈 스튜디오</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-2">
              &ldquo;서연 선생님의 요가 수업은 제 연습을 완전히 바꿔놓았어요. 세부적인 부분까지 신경 써주시고 개인 맞춤형 접근법으로 예상보다 훨씬 빠르게 발전할 수 있었습니다.&rdquo;
            </p>
            <p className="text-text-light text-xs text-right">네이버 리뷰</p>
          </div>

          <Button variant="outline" className="w-full">
            더보기 ↓
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}