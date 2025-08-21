'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import * as htmlToImage from 'html-to-image';
import { 
  Share2, 
  Copy, 
  Download, 
  Mail, 
  MessageCircle,
  Instagram,
  Link,
  QrCode,
  CheckCircle2,
  Smartphone,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SharePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      // 프로필 URL 생성
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://record-rho.vercel.app';
      const url = `${baseUrl}/${session.user.username || session.user.id}`;
      setProfileUrl(url);

      // QR 코드 생성
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).then(setQrCodeUrl);
    }
  }, [session]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    
    setLoading(true);
    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);
      const link = document.createElement('a');
      link.download = `record-qr-${session?.user?.username || 'profile'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('QR 다운로드 실패:', error);
    }
    setLoading(false);
  };

  const handleKakaoShare = () => {
    try {
      // Kakao SDK 로드 체크
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
        }

        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${session?.user?.name}님의 리뷰 프로필`,
            description: '진짜 고객 리뷰를 한 곳에서 확인하세요',
            imageUrl: 'https://record-rho.vercel.app/og-image.png',
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
        });
      } else {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('카카오톡 공유 실패:', error);
      alert('카카오톡 공유 중 오류가 발생했습니다.');
    }
  };

  const handleEmailSignature = async () => {
    try {
      const signature = `
<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; max-width: 400px;">
  <tr>
    <td style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
      <div style="color: white;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">${session?.user?.name || '사용자'}</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">고객 리뷰 프로필</p>
        <a href="${profileUrl}" style="display: inline-block; padding: 8px 16px; background: white; color: #667eea; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
          내 리뷰 보기 →
        </a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 10px; text-align: center;">
      <p style="font-size: 12px; color: #666;">
        Powered by <a href="https://record-rho.vercel.app" style="color: #667eea; text-decoration: none;">Re:cord</a>
      </p>
    </td>
  </tr>
</table>`;

      await navigator.clipboard.writeText(signature);
      alert('이메일 서명이 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  const shareOptions = [
    {
      name: '링크 복사',
      icon: Link,
      action: handleCopyLink,
      color: 'bg-gray-100',
      description: '프로필 링크를 클립보드에 복사'
    },
    {
      name: '카카오톡',
      icon: MessageCircle,
      action: handleKakaoShare,
      color: 'bg-yellow-100',
      description: '카카오톡으로 공유하기'
    },
    {
      name: '인스타그램',
      icon: Instagram,
      action: () => window.open(`https://www.instagram.com/`),
      color: 'bg-pink-100',
      description: '스토리나 프로필에 링크 추가'
    },
    {
      name: '이메일 서명',
      icon: Mail,
      action: handleEmailSignature,
      color: 'bg-blue-100',
      description: 'HTML 이메일 서명 생성'
    },
  ];

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          공유 & 마케팅 도구
        </h1>
        <p className="text-gray-600">
          프로필을 다양한 방법으로 공유하고 홍보하세요
        </p>
      </div>

      {/* Profile URL Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>내 프로필 주소</CardTitle>
          <CardDescription>이 링크를 통해 프로필에 접속할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
            />
            <Button onClick={handleCopyLink} variant={copied ? 'default' : 'outline'}>
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  복사
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR 코드
            </CardTitle>
            <CardDescription>
              오프라인에서 쉽게 프로필을 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={qrRef}
              className="bg-white p-6 rounded-lg border flex flex-col items-center"
            >
              {qrCodeUrl && (
                <>
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  <p className="mt-4 text-sm font-medium text-gray-700">
                    @{session.user.username || session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Re:cord 리뷰 프로필</p>
                </>
              )}
            </div>
            <Button 
              onClick={handleDownloadQR} 
              className="w-full mt-4"
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'QR 코드 생성 중...' : 'QR 코드 다운로드'}
            </Button>
            <div className="mt-4 space-y-2">
              <Badge variant="outline" className="w-full justify-center">
                <Smartphone className="w-3 h-3 mr-1" />
                명함에 인쇄
              </Badge>
              <Badge variant="outline" className="w-full justify-center">
                <Globe className="w-3 h-3 mr-1" />
                매장 스티커 제작
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              공유 방법
            </CardTitle>
            <CardDescription>
              다양한 채널로 프로필을 홍보하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`p-2 rounded-lg ${option.color}`}>
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.name}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Marketing Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💡 마케팅 팁</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">명함에 QR 코드</h4>
              <p className="text-sm text-gray-600">
                명함 뒷면에 QR 코드를 인쇄하여 오프라인에서도 쉽게 리뷰를 보여주세요
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2">SNS 프로필 링크</h4>
              <p className="text-sm text-gray-600">
                인스타그램 프로필이나 카카오톡 상태 메시지에 링크를 추가하세요
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">이메일 서명 활용</h4>
              <p className="text-sm text-gray-600">
                모든 이메일에 자동으로 리뷰 프로필이 포함되어 신뢰도를 높일 수 있어요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Kakao SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}