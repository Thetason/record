"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Share1Icon,
  CheckIcon,
  CalendarIcon,
  BarChartIcon,
  QuoteIcon,
  InstagramLogoIcon,
  Link2Icon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  DownloadIcon
} from "@radix-ui/react-icons"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface Review {
  id: string
  platform: string
  business: string
  content: string
  author: string
  reviewDate: string
  verified: boolean
  verifiedAt?: string | null
  verifiedBy?: string | null
  originalUrl?: string | null
  imageUrl?: string | null
}

interface ProfileData {
  id: string
  username: string
  name: string
  profession: string
  bio: string
  avatar: string
  coverImage: string
  totalReviews: number
  platforms: string[]
  reviews: Review[]
  experience: string
  location: string
  specialties: string[]
  certifications: string[]
  socialLinks: {
    instagram?: string
    website?: string
  }
  plan?: 'free' | 'premium' | 'pro' // 요금제 정보
  // 커스터마이징 설정
  theme?: string
  layout?: string
  bgImage?: string
  bgColor?: string
  accentColor?: string
  introVideo?: string
  customCss?: string
}

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [copied, setCopied] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeReview, setActiveReview] = useState<Review | null>(null)
  const [coverError, setCoverError] = useState(false)
  const [isEmbedMode, setIsEmbedMode] = useState(false)

  useEffect(() => {
    // Check for embed mode
    const params = new URLSearchParams(window.location.search)
    setIsEmbedMode(params.get('embed') === 'true')
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setCoverError(false)
  }, [profile.coverImage])

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ${profile.profession}`,
          text: `${profile.totalReviews}개의 리뷰로 증명하는 실력`,
          url: url
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const filteredReviews = selectedPlatform === "all" 
    ? profile.reviews 
    : profile.reviews.filter(r => r.platform === selectedPlatform)

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 9)

  const platformColors: Record<string, string> = {
    네이버: "from-green-500 to-green-600",
    카카오: "from-yellow-400 to-yellow-500",
    카카오맵: "from-yellow-400 to-yellow-500",
    구글: "from-blue-500 to-blue-600",
    인스타: "from-purple-500 to-pink-500",
    인스타그램: "from-purple-500 to-pink-500",
    당근: "from-orange-400 to-orange-500",
    'Re:cord': "from-[#FF6B35] to-[#F97316]"
  }

  const platformIcons: Record<string, string> = {
    네이버: "N",
    카카오: "K",
    카카오맵: "K",
    구글: "G",
    인스타: "I",
    인스타그램: "I",
    당근: "D",
    'Re:cord': "R"
  }

  // Embed mode: Simplified layout for iframe embedding
  if (isEmbedMode) {
    return (
      <div className="min-h-screen bg-white">
        {/* Compact Profile Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              {profile.profession && (
                <p className="text-sm text-white/80">{profile.profession}</p>
              )}
              <p className="text-xs text-white/60 mt-1">{profile.totalReviews}개의 리뷰</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid - Compact */}
        <div className="p-4">
          {/* Platform Filter */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex bg-gray-100 rounded-full p-1 text-xs">
              <button
                onClick={() => setSelectedPlatform("all")}
                className={`px-3 py-1 rounded-full transition-all ${
                  selectedPlatform === "all"
                    ? "bg-white shadow-sm font-medium"
                    : "text-gray-600"
                }`}
              >
                전체
              </button>
              {profile.platforms.slice(0, 4).map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    selectedPlatform === platform
                      ? "bg-white shadow-sm font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-3">
            {filteredReviews.slice(0, 6).map((review) => (
              <Card key={review.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${(platformColors[review.platform] ?? 'from-gray-400 to-gray-500')} flex items-center justify-center text-white text-xs font-bold`}>
                        {platformIcons[review.platform] ?? review.platform.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{review.business}</p>
                        <p className="text-xs text-gray-500">{review.platform}</p>
                      </div>
                    </div>
                    {review.verified && (
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {review.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{review.author}</span>
                    <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View Full Profile Link */}
          <div className="mt-6 text-center">
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#FF6B35] hover:text-[#E55A2B] font-medium"
            >
              전체 프로필 보기 →
            </a>
          </div>

          {/* Watermark for Free Plan */}
          {profile.plan === 'free' && (
            <div className="mt-6 pt-4 border-t text-center">
              <a 
                href="/?ref=widget" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF6B35] transition-colors"
              >
                <span>Powered by</span>
                <span className="font-bold">Re:cord</span>
                <span className="text-[#FF6B35]">*</span>
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-xl shadow-lg" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
            <Button 
              onClick={handleShare}
              size="sm"
              className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#E55A2B] hover:to-[#D54A1B] text-white shadow-lg"
            >
              {copied ? (
                <>
                  <CheckIcon className="mr-2" />
                  복사됨!
                </>
              ) : (
                <>
                  <Share1Icon className="mr-2" />
                  공유하기
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="relative h-[25vh] md:h-[30vh] overflow-hidden">
        {/* Cover Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/70 z-10" />
          {profile.coverImage && !coverError ? (
            <Image
              src={profile.coverImage}
              alt=""
              fill
              className="object-cover"
              priority
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1f2937] via-[#2d3a4b] to-[#111827]" />
          )}
        </div>

        {/* Profile Content */}
        <div className="relative z-20 h-full flex items-center pb-4 md:pb-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      width={160}
                      height={160}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Verified Badge */}
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                  <CheckIcon className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center md:text-left flex-1"
              >
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {profile.name}
                </h1>
                {(profile.profession || profile.experience) && (
                  <p className="text-lg md:text-xl text-white/90 mb-3 flex items-center gap-2 justify-center md:justify-start">
                    {profile.profession && <span>{profile.profession}</span>}
                    {profile.profession && profile.experience && <span>·</span>}
                    {profile.experience && <span>{profile.experience}</span>}
                  </p>
                )}
                <p className="text-white/80 max-w-2xl mb-4">
                  {profile.bio}
                </p>
                
                {/* Social Links */}
                <div className="flex gap-3 justify-center md:justify-start">
                  {profile.socialLinks.instagram && (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 backdrop-blur-md p-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <InstagramLogoIcon className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 backdrop-blur-md p-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Link2Icon className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20"
              >
                <p className="text-xs uppercase tracking-wide text-white/70 mb-1">총 리뷰</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{profile.totalReviews}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Certifications */}
      {(profile.specialties?.length > 0 || profile.certifications?.length > 0) && (
        <section className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialties */}
              {profile.specialties?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5 text-[#FF6B35]" />
                    전문 분야
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 text-[#FF6B35] rounded-full text-sm font-medium border border-orange-100"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.certifications?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    자격 & 인증
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-sm font-medium border border-green-100"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              고객이 남긴 <span className="text-[#FF6B35]">진짜 리뷰</span>
            </h2>
            <p className="text-gray-600 text-base">
              {profile.totalReviews}개의 리뷰가 실력을 증명합니다
            </p>
          </div>

          {/* Platform Filter */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white rounded-full shadow-lg p-1">
              <button
                onClick={() => setSelectedPlatform("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedPlatform === "all"
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                전체
              </button>
              {profile.platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedPlatform === platform
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border border-gray-200 overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-xl">
                  {review.imageUrl && (
                    <div className="relative h-40 overflow-hidden bg-black/5 group">
                      <Image
                        src={review.imageUrl}
                        alt={`${review.author} 리뷰 이미지`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 2}
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveImage(review.imageUrl as string)
                          setActiveReview(review)
                        }}
                        className="absolute right-3 bottom-3 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700 shadow transition hover:bg-white"
                      >
                        이미지 확대
                      </button>
                    </div>
                  )}

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${(platformColors[review.platform] ?? 'from-gray-400 to-gray-500')} flex items-center justify-center text-white font-bold shadow-lg`}>
                          {platformIcons[review.platform] ?? review.platform.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{review.business}</p>
                          <p className="text-xs text-gray-500">{review.platform}</p>
                        </div>
                      </div>
                      {review.verified && (
                        <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckIcon className="w-3 h-3" />
                          인증됨
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <QuoteIcon className="absolute -top-2 -left-2 w-8 h-8 text-gray-100" />
                      <p className="pl-4 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                        {review.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span className="font-medium text-gray-700">{review.author}</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    </div>

                    {review.originalUrl && (
                      <div className="pt-2 border-t border-gray-100">
                        <a
                          href={review.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-[#FF6B35] hover:text-[#E55A2B] font-medium"
                        >
                          <Link2Icon className="w-4 h-4" /> 원본 리뷰 보기
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {filteredReviews.length > 9 && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllReviews(prev => !prev)}
                className="border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-all"
              >
                {showAllReviews ? '리뷰 접기' : '더 많은 리뷰 보기'}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            나도 리뷰 포트폴리오 만들기
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            {profile.name}님처럼 당신의 실력을 리뷰로 증명하세요
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-[#FF6B35] hover:bg-gray-100 shadow-2xl text-lg px-8 py-6"
            >
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Watermark for Free Plan */}
      {profile.plan === 'free' && (
        <section className="py-8 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border-y border-orange-100">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <span>Powered by</span>
                <span className="font-bold text-[#FF6B35]">Re:cord</span>
                <span className="text-[#FF6B35]">*</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                나도 이런 리뷰 포트폴리오 만들고 싶다면?
              </h3>
              
              <p className="text-gray-600 text-sm md:text-base">
                Re:cord로 흩어진 리뷰를 한곳에 모아 전문성을 증명하세요. 
                <br className="hidden md:block" />
                가입 후 바로 20개의 리뷰를 무료로 관리할 수 있습니다.
              </p>
              
              <Link href="/?ref=watermark" target="_blank">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#E55A2B] hover:to-[#D54A1B] text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-base md:text-lg px-8 py-6 rounded-full"
                >
                  무료로 내 리뷰 포트폴리오 만들기 →
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500">
                신용카드 등록 없이 바로 시작 가능 · 3분 만에 완성
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
              <span className="text-sm text-gray-500">
                - 프로페셔널의 성장을 기록합니다
              </span>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Re:cord. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      </div>

      <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && (setActiveImage(null), setActiveReview(null))}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {activeReview ? `${activeReview.platform} · ${activeReview.business}` : '리뷰 첨부 이미지'}
            </DialogTitle>
          </DialogHeader>
          {activeImage && (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              doubleClick={{ mode: "zoomIn" }}
              wheel={{ step: 0.1 }}
              pinch={{ step: 5 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="relative">
                  {/* 컨트롤 버튼 */}
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => zoomIn()}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ZoomInIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => zoomOut()}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ZoomOutIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => resetTransform()}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ResetIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = activeImage
                        link.download = `review-image-${Date.now()}.jpg`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 이미지 영역 */}
                  <TransformComponent
                    wrapperClass="!w-full !h-[70vh] overflow-hidden rounded-xl border bg-gray-100"
                    contentClass="!w-full !h-full flex items-center justify-center"
                  >
                    <Image
                      src={activeImage}
                      alt="리뷰 첨부 이미지 확대"
                      width={1200}
                      height={800}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  </TransformComponent>

                  {/* 사용 안내 */}
                  <div className="mt-3 text-center text-sm text-gray-500">
                    💡 드래그로 이동 · 더블클릭/휠로 확대/축소 · 핀치 제스처 지원
                  </div>
                </div>
              )}
            </TransformWrapper>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
