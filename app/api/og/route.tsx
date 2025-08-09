import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// 폰트 로딩 임시 비활성화
// const fontBold = fetch(
//   new URL('../../../public/fonts/Pretendard-Bold.woff', import.meta.url)
// ).then((res) => res.arrayBuffer())

// const fontRegular = fetch(
//   new URL('../../../public/fonts/Pretendard-Regular.woff', import.meta.url)
// ).then((res) => res.arrayBuffer())

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')
    
    // 프로필 데이터 가져오기
    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/profile/${username}`
    )
    const profile = await profileRes.json()

    // const fontBoldData = await fontBold
    // const fontRegularData = await fontRegular

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '30px',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: 'white',
                fontWeight: 'bold',
                marginBottom: '24px',
              }}
            >
              {profile.name?.charAt(0) || 'R'}
            </div>

            {/* Name & Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              {profile.name || '프로필'}
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: '#666',
                marginBottom: '32px',
              }}
            >
              {profile.profession || '전문가'}
            </p>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#FF6B35',
                  }}
                >
                  {profile.totalReviews || 0}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#666',
                  }}
                >
                  리뷰
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#FF6B35',
                  }}
                >
                  {profile.averageRating || 0}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#666',
                  }}
                >
                  평점
                </span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                }}
              >
                Re:cord
              </span>
              <span
                style={{
                  fontSize: '24px',
                  color: '#FF6B35',
                }}
              >
                *
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // fonts: [
        //   {
        //     name: 'Pretendard',
        //     data: fontBoldData,
        //     style: 'normal',
        //     weight: 700,
        //   },
        //   {
        //     name: 'Pretendard',
        //     data: fontRegularData,
        //     style: 'normal',
        //     weight: 400,
        //   },
        // ],
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
          }}
        >
          <div
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Re:cord
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}