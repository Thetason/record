"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Share1Icon, 
  CheckIcon, 
  StarFilledIcon,
  CalendarIcon,
  BarChartIcon,
  QuoteIcon,
  VercelLogoIcon,
  InstagramLogoIcon,
  Link2Icon
} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { VerificationBadge } from "@/components/ui/verification-badge"
import { ReportDialog } from "@/components/report-dialog"

interface Review {
  id: string
  platform: string
  business: string
  rating: number
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
  averageRating: number
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  const platformColors: { [key: string]: string } = {
    "네이버": "from-green-500 to-green-600",
    "카카오": "from-yellow-400 to-yellow-500",
    "구글": "from-blue-500 to-blue-600",
    "인스타": "from-purple-500 to-pink-500"
  }

  const platformIcons: { [key: string]: string } = {
    "네이버": "N",
    "카카오": "K",
    "구글": "G",
    "인스타": "I"
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
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Cover Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 z-10" />
          <Image
            src={profile.coverImage || "/images/default-cover.jpg"}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Profile Content */}
        <div className="relative z-20 h-full flex items-end pb-8 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      width={160}
                      height={160}
                      className="object-cover"
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
                className="flex gap-4"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 text-center border border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {profile.totalReviews}
                  </div>
                  <div className="text-sm text-white/80">총 리뷰</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 text-center border border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center justify-center">
                    {profile.averageRating}
                    <StarFilledIcon className="w-6 h-6 ml-1 text-yellow-400" />
                  </div>
                  <div className="text-sm text-white/80">평균 평점</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Certifications */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Specialties */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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

            {/* Certifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              고객이 남긴 <span className="text-[#FF6B35]">진짜 리뷰</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {profile.totalReviews}개의 리뷰가 실력을 증명합니다
            </p>
          </div>

          {/* Platform Filter */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-full shadow-lg p-1">
              <button
                onClick={() => setSelectedPlatform("all")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
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
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
                  {/* Platform Badge */}
                  <div className={`h-1 bg-gradient-to-r ${platformColors[review.platform]}`} />
                  
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platformColors[review.platform]} flex items-center justify-center text-white font-bold shadow-lg`}>
                          {platformIcons[review.platform]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.business}</p>
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

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <StarFilledIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? "text-yellow-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold">{review.rating}.0</span>
                    </div>

                    {/* Content */}
                    {review.imageUrl && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 group/image relative">
                        <img
                          src={review.imageUrl}
                          alt={`${review.author} 리뷰 이미지`}
                          className="w-full h-56 object-cover transition-transform duration-300 group-hover/image:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImage(review.imageUrl as string)
                            setActiveReview(review)
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity text-white text-sm font-medium"
                          aria-label="리뷰 이미지 크게 보기"
                        >
                          이미지 확대 보기
                        </button>
                      </div>
                    )}

                    <div className="relative mb-4">
                      <QuoteIcon className="absolute -top-2 -left-2 w-8 h-8 text-gray-100" />
                      <p className="text-gray-700 line-clamp-4 relative z-10 pl-4">
                        {review.content}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                      <span className="font-medium">{review.author}</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    </div>

                    {review.originalUrl && (
                      <div className="mt-3">
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {activeReview ? `${activeReview.platform} · ${activeReview.business}` : '리뷰 첨부 이미지'}
            </DialogTitle>
          </DialogHeader>
          {activeImage && (
            <div className="w-full overflow-hidden rounded-xl border">
              <img src={activeImage} alt="리뷰 첨부 이미지 확대" className="w-full h-auto" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
