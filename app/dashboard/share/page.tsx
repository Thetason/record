'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import * as htmlToImage from 'html-to-image'
import {
  Share2,
  Copy,
  Download,
  MessageCircle,
  Instagram,
  Link as LinkIcon,
  QrCode,
  Smartphone,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav'

export default function SharePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [messageCopied, setMessageCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const resolveBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin.replace(/\/$/, '')
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
    }
    return ''
  }

  useEffect(() => {
    if (!session?.user) return

    const baseUrl = resolveBaseUrl()
    if (!baseUrl) return

    const slug = session.user.username || session.user.id
    const url = `${baseUrl}/${slug}`
    setProfileUrl(url)

    void QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#221A24',
        light: '#FFFFFF',
      },
    }).then(setQrCodeUrl)
  }, [session, status])

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMessage = async () => {
    const message = `소개 전에 이 링크 먼저 봐주세요.\n대표 후기와 작업 분위기를 한 번에 볼 수 있어요.\n${profileUrl}`
    await navigator.clipboard.writeText(message)
    setMessageCopied(true)
    setTimeout(() => setMessageCopied(false), 2000)
  }

  const handleDownloadQR = async () => {
    if (!qrRef.current) return

    setLoading(true)
    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current)
      const link = document.createElement('a')
      link.download = `record-qr-${session?.user?.username || 'profile'}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('QR 다운로드 실패:', error)
    }
    setLoading(false)
  }

  const handleKakaoShare = () => {
    try {
      const baseUrl = resolveBaseUrl()
      const kakaoWindow = typeof window !== 'undefined'
        ? (window as Window & typeof globalThis & {
            Kakao?: {
              isInitialized: () => boolean
              init: (key?: string) => void
              Share: {
                sendDefault: (payload: unknown) => void
              }
            }
          })
        : null

      if (kakaoWindow?.Kakao) {
        if (!kakaoWindow.Kakao.isInitialized()) {
          kakaoWindow.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY)
        }

        kakaoWindow.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${session?.user?.name}님의 대표 프로필`,
            description: '대표 후기와 작업 분위기를 한 링크에서 확인하세요',
            imageUrl: `${baseUrl}/og-image.png`,
            link: {
              mobileWebUrl: profileUrl,
              webUrl: profileUrl,
            },
          },
          buttons: [
            {
              title: '프로필 보기',
              link: {
                mobileWebUrl: profileUrl,
                webUrl: profileUrl,
              },
            },
          ],
        })
      } else {
        alert('카카오톡 공유를 바로 열 수 없어 링크를 먼저 복사해둘게요.')
        void handleCopyLink()
      }
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      alert('카카오톡 공유 중 오류가 발생했습니다. 링크를 복사해서 보내주세요.')
    }
  }

  const handleInstagramCopy = async () => {
    await navigator.clipboard.writeText(profileUrl)
    alert('링크가 복사되었습니다. 인스타그램 또는 스레드 프로필에 붙여넣어주세요.')
    window.open('https://www.instagram.com/', '_blank')
  }

  const shareOptions = [
    {
      name: '링크 복사',
      icon: LinkIcon,
      action: handleCopyLink,
      color: 'bg-gray-100',
      description: '가장 빠른 기본 동작',
    },
    {
      name: '소개 멘트 복사',
      icon: Copy,
      action: handleCopyMessage,
      color: 'bg-orange-100',
      description: '카톡, 문자, DM에 바로 붙여넣기',
    },
    {
      name: '카카오톡',
      icon: MessageCircle,
      action: handleKakaoShare,
      color: 'bg-yellow-100',
      description: '상담 전에 바로 보내기',
    },
    {
      name: '인스타·스레드',
      icon: Instagram,
      action: handleInstagramCopy,
      color: 'bg-pink-100',
      description: '프로필 웹사이트 칸에 넣기',
    },
  ]

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] pb-20 md:pb-8">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900 md:text-3xl">
            링크 공유
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
            고객에게 보내는 순간도 복잡할 필요가 없습니다. 링크 하나와 짧은 멘트만 있으면 충분합니다.
          </p>
        </div>

        <Card className="rounded-[30px] border border-[#eadfd7] bg-white shadow-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Public Link</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.04em] text-slate-900 md:text-2xl">
                  이 링크 하나를 보내면 됩니다.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  고객은 여기서 이름, 대표 리뷰, 작업 분위기, 상담 버튼을 한 번에 봅니다.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full bg-[#221A24] px-5 text-white hover:bg-[#3a2d3d]" onClick={handleCopyLink}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {copied ? '복사 완료' : '링크 복사'}
                </Button>
                <Button variant="outline" className="rounded-full border-[#d8cfc8]" asChild>
                  <Link href={profileUrl} target="_blank">
                    새 탭에서 열기
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#eadfd7] bg-[#fcfaf8] px-4 py-3 text-sm font-medium text-slate-700">
              {profileUrl}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="rounded-[28px] border border-[#eadfd7] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR 코드
              </CardTitle>
              <CardDescription>
                명함, 안내문, 새 샵 소개 카드에 바로 붙일 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={qrRef} className="flex flex-col items-center rounded-3xl border border-[#eadfd7] bg-[#fcfaf8] p-6">
                {qrCodeUrl && (
                  <>
                    <Image src={qrCodeUrl} alt="QR Code" width={192} height={192} className="h-48 w-48" />
                    <p className="mt-4 text-sm font-medium text-slate-700">@{session.user.username || session.user.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Re:cord 대표 링크</p>
                  </>
                )}
              </div>
              <Button onClick={handleDownloadQR} className="mt-4 w-full bg-[#FF6B35] hover:bg-[#E55A2B]" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'QR 코드 생성 중...' : 'QR 코드 다운로드'}
              </Button>
              <div className="mt-4 space-y-2">
                <Badge variant="outline" className="w-full justify-center border-[#eadfd7] bg-white text-slate-600">
                  <Smartphone className="mr-1 h-3 w-3" />
                  오프라인 안내물에 붙이기
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-[#eadfd7] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                바로 쓰는 공유 동작
              </CardTitle>
              <CardDescription>
                가장 많이 쓰는 전송 행동만 남겼습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className={`rounded-xl p-2 ${option.color}`}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {option.name === '소개 멘트 복사' && messageCopied
                        ? '소개 멘트 복사 완료'
                        : option.name}
                    </p>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-[28px] border border-[#eadfd7] bg-[#fff7f3] shadow-sm">
          <CardContent className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Share Check</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">
              설명보다 먼저, 신뢰가 보여야 합니다.
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#eadfd7] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">1. 이름이 보이게</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">고객이 누구 링크인지 바로 알아야 합니다.</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd7] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">2. 후기 먼저</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">설명보다 대표 후기 1개가 먼저 설득합니다.</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd7] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">3. 상담 버튼 연결</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">클릭 후 어디로 갈지 명확해야 전환이 납니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav />
    </div>
  )
}
