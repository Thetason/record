'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Palette, 
  Layout, 
  Image as ImageIcon, 
  Video, 
  Save,
  Eye,
  Smartphone,
  Monitor,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// 테마 옵션
const themes = [
  { id: 'default', name: '기본', colors: { bg: '#ffffff', accent: '#FF6B35' } },
  { id: 'dark', name: '다크', colors: { bg: '#1a1a1a', accent: '#FF6B35' } },
  { id: 'blue', name: '블루', colors: { bg: '#f0f9ff', accent: '#3b82f6' } },
  { id: 'purple', name: '퍼플', colors: { bg: '#faf5ff', accent: '#a855f7' } },
  { id: 'green', name: '그린', colors: { bg: '#f0fdf4', accent: '#22c55e' } },
  { id: 'gradient', name: '그라데이션', colors: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#ffffff' } },
];

// 레이아웃 옵션
const layouts = [
  { id: 'grid', name: '그리드', icon: '⚏', description: '카드 형태로 정렬' },
  { id: 'list', name: '리스트', icon: '☰', description: '목록 형태로 표시' },
  { id: 'card', name: '카드', icon: '▢', description: '큰 카드 형태' },
  { id: 'magazine', name: '매거진', icon: '◫', description: '잡지 스타일' },
];

export default function CustomizePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // 커스터마이징 상태
  const [customization, setCustomization] = useState({
    theme: 'default',
    layout: 'grid',
    bgImage: '',
    bgColor: '#ffffff',
    accentColor: '#FF6B35',
    introVideo: '',
    customCss: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // 기존 설정 불러오기
    if (session?.user) {
      fetchUserSettings();
    }
  }, [session]);

  const fetchUserSettings = async () => {
    try {
      const res = await fetch('/api/users/me');
      const data = await res.json();
      
      if (data) {
        setCustomization({
          theme: data.theme || 'default',
          layout: data.layout || 'grid',
          bgImage: data.bgImage || '',
          bgColor: data.bgColor || '#ffffff',
          accentColor: data.accentColor || '#FF6B35',
          introVideo: data.introVideo || '',
          customCss: data.customCss || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customization)
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCustomization({
        ...customization,
        theme: themeId,
        bgColor: theme.colors.bg,
        accentColor: theme.colors.accent
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            프로필 커스터마이징
          </h1>
          <p className="text-gray-600">
            나만의 개성있는 프로필을 만들어보세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/${session?.user?.username}`, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                저장됨
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {loading ? '저장 중...' : '저장'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 설정 패널 */}
        <div className="space-y-6">
          {/* 테마 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                테마 선택
              </CardTitle>
              <CardDescription>
                프로필의 전체적인 분위기를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      customization.theme === theme.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2">
                      <div 
                        className="w-full h-12 rounded-md border"
                        style={{ 
                          background: theme.colors.bg,
                          borderColor: theme.colors.accent
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 레이아웃 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                레이아웃
              </CardTitle>
              <CardDescription>
                리뷰를 표시할 방식을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {layouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setCustomization({ ...customization, layout: layout.id })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      customization.layout === layout.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{layout.icon}</div>
                    <p className="text-sm font-medium">{layout.name}</p>
                    <p className="text-xs text-gray-500">{layout.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 배경 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                배경 설정
              </CardTitle>
              <CardDescription>
                배경 이미지나 색상을 설정하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bgImage">배경 이미지 URL</Label>
                <Input
                  id="bgImage"
                  placeholder="https://example.com/background.jpg"
                  value={customization.bgImage}
                  onChange={(e) => setCustomization({ ...customization, bgImage: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  프리미엄 기능 • 이미지 URL을 입력하세요
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bgColor">배경색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={customization.bgColor}
                      onChange={(e) => setCustomization({ ...customization, bgColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customization.bgColor}
                      onChange={(e) => setCustomization({ ...customization, bgColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accentColor">강조색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={customization.accentColor}
                      onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customization.accentColor}
                      onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 소개 동영상 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                소개 동영상
              </CardTitle>
              <CardDescription>
                유튜브나 비메오 영상 URL을 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={customization.introVideo}
                onChange={(e) => setCustomization({ ...customization, introVideo: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                프리미엄 기능 • 프로필 상단에 영상이 표시됩니다
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 미리보기 */}
        <div className="lg:sticky lg:top-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>미리보기</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                className={`${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                } border rounded-lg overflow-hidden`}
              >
                {/* 미리보기 컨텐츠 */}
                <div 
                  className="p-6 min-h-[500px]"
                  style={{
                    background: customization.bgImage 
                      ? `url(${customization.bgImage}) center/cover`
                      : customization.bgColor,
                    color: customization.theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                >
                  {/* 헤더 */}
                  <div className="text-center mb-6">
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-4"
                      style={{ backgroundColor: customization.accentColor }}
                    />
                    <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                    <p className="opacity-75">전문가 프로필</p>
                  </div>

                  {/* 동영상 미리보기 */}
                  {customization.introVideo && (
                    <div className="mb-6 bg-black/10 rounded-lg p-8 text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">소개 영상</p>
                    </div>
                  )}

                  {/* 레이아웃 미리보기 */}
                  <div className={`
                    ${customization.layout === 'grid' ? 'grid grid-cols-2 gap-4' : ''}
                    ${customization.layout === 'list' ? 'space-y-3' : ''}
                    ${customization.layout === 'card' ? 'space-y-4' : ''}
                    ${customization.layout === 'magazine' ? 'space-y-6' : ''}
                  `}>
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="bg-white/90 rounded-lg p-4 backdrop-blur"
                        style={{ borderColor: customization.accentColor }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge style={{ backgroundColor: customization.accentColor + '20', color: customization.accentColor }}>
                            플랫폼
                          </Badge>
                          <span className="text-yellow-500">★★★★★</span>
                        </div>
                        <p className="text-sm opacity-75">샘플 리뷰 내용...</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}