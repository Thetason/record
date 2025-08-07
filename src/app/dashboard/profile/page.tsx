"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  HomeIcon, 
  PersonIcon, 
  PlusIcon, 
  BarChartIcon,
  GearIcon,
  ExitIcon,
  ExternalLinkIcon,
  EyeOpenIcon,
  CameraIcon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// 임시 데이터
const mockUser = {
  name: "김서연",
  username: "seoyeon",
  email: "seoyeon@example.com",
  bio: "요가 강사 & 교육 전문가 🧘‍♀️\n마음챙김과 몸의 균형을 통해 일상의 평화를 찾아드립니다.",
  avatar: "김",
  location: "서울, 한국",
  website: "https://seoyeon-yoga.com",
  phone: "010-1234-5678"
}

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: mockUser.name,
    username: mockUser.username,
    email: mockUser.email,
    bio: mockUser.bio,
    location: mockUser.location,
    website: mockUser.website,
    phone: mockUser.phone
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log("Profile update data:", formData)
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert("프로필이 성공적으로 업데이트되었습니다!")
    } catch (error) {
      console.error("Profile update error:", error)
      alert("프로필 업데이트 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const profileUrl = `re-cord.kr/${formData.username}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem icon={<HomeIcon />} label="대시보드" href="/dashboard" />
            <NavItem icon={<BarChartIcon />} label="리뷰 관리" href="/dashboard/reviews" />
            <NavItem icon={<PersonIcon />} label="내 프로필" href="/dashboard/profile" active />
            <NavItem icon={<PlusIcon />} label="리뷰 추가" href="/dashboard/add-review" />
            <NavItem icon={<GearIcon />} label="설정" href="/dashboard/settings" />
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-[#FF6B35]">
                {mockUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mockUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{mockUser.username}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <ExitIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
            <p className="text-gray-600 mt-2">
              공개 프로필 정보를 편집하고 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    다른 사용자에게 보여질 기본 프로필 정보입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">프로필 사진</label>
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">{formData.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="profile-image"
                          />
                          <label
                            htmlFor="profile-image"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <CameraIcon className="w-4 h-4" />
                            사진 변경
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG 파일만 업로드 가능합니다
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        이름 *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="실제 이름을 입력하세요"
                        required
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        사용자명 *
                      </label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="프로필 URL에 사용됩니다"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        공개 프로필 URL: {profileUrl}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        이메일 *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="연락 가능한 이메일"
                        required
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">
                        소개
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="자신을 간단히 소개해주세요..."
                      />
                      <p className="text-xs text-gray-500">
                        {formData.bio.length}/500자
                      </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        위치
                      </label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="예: 서울, 한국"
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">
                        웹사이트
                      </label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://your-website.com"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        연락처
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                      />
                      <p className="text-xs text-gray-500">
                        연락처는 공개되지 않으며, 필요시에만 사용됩니다
                      </p>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({
                          name: mockUser.name,
                          username: mockUser.username,
                          email: mockUser.email,
                          bio: mockUser.bio,
                          location: mockUser.location,
                          website: mockUser.website,
                          phone: mockUser.phone
                        })}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#FF6B35] hover:bg-[#E55A2B]"
                        disabled={isLoading}
                      >
                        {isLoading ? "저장 중..." : "변경사항 저장"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 미리보기</CardTitle>
                  <CardDescription>
                    다른 사용자에게 보여지는 모습입니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-[#FF6B35]">
                      {previewImage ? (
                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        formData.name.charAt(0)
                      )}
                    </div>
                    <h3 className="font-bold text-lg">{formData.name}</h3>
                    <p className="text-gray-600 text-sm">@{formData.username}</p>
                    {formData.location && (
                      <p className="text-gray-500 text-xs mt-1">{formData.location}</p>
                    )}
                  </div>
                  
                  {formData.bio && (
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {formData.bio.slice(0, 100)}{formData.bio.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/${formData.username}`} target="_blank">
                        <EyeOpenIcon className="w-4 h-4 mr-1" />
                        미리보기
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://re-cord.kr/${formData.username}`)
                        alert('링크가 복사되었습니다!')
                      }}
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 리뷰</span>
                      <span className="font-medium">47개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 평점</span>
                      <span className="font-medium">4.8점</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">프로필 조회</span>
                      <span className="font-medium">324회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">이번 달 리뷰</span>
                      <span className="font-medium">12개</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ 
  icon, 
  label, 
  href, 
  active = false 
}: { 
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean 
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
        active 
          ? 'bg-[#FF6B35] text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}