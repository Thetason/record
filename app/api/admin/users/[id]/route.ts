import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 권한 체크
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'block':
        // 사용자 차단 (role을 'blocked'로 변경)
        await prisma.user.update({
          where: { id: params.id },
          data: { 
            role: 'blocked',
            // 모든 세션 종료
            sessions: {
              deleteMany: {}
            }
          }
        })
        
        console.log(`Admin ${admin.id} blocked user ${params.id}`)
        return NextResponse.json({ success: true, message: '사용자가 차단되었습니다' })

      case 'unblock':
        // 차단 해제
        await prisma.user.update({
          where: { id: params.id },
          data: { role: 'user' }
        })
        
        console.log(`Admin ${admin.id} unblocked user ${params.id}`)
        return NextResponse.json({ success: true, message: '차단이 해제되었습니다' })

      case 'reset-password':
        // 임시 비밀번호 생성
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'
        const hashedPassword = await bcrypt.hash(tempPassword, 10)
        
        await prisma.user.update({
          where: { id: params.id },
          data: { 
            password: hashedPassword,
            // 다음 로그인 시 비밀번호 변경 요구 플래그 설정 가능
          }
        })
        
        console.log(`Admin ${admin.id} reset password for user ${params.id}`)
        return NextResponse.json({ 
          success: true, 
          message: '비밀번호가 초기화되었습니다',
          tempPassword // 실제로는 이메일로 발송해야 함
        })

      case 'delete-reviews':
        // 모든 리뷰 삭제
        await prisma.review.deleteMany({
          where: { userId: params.id }
        })
        
        console.log(`Admin ${admin.id} deleted all reviews for user ${params.id}`)
        return NextResponse.json({ success: true, message: '모든 리뷰가 삭제되었습니다' })

      case 'change-plan':
        // 플랜 변경
        const { plan } = body
        await prisma.user.update({
          where: { id: params.id },
          data: { 
            plan,
            reviewLimit: plan === 'free' ? 50 : -1
          }
        })
        
        console.log(`Admin ${admin.id} changed plan for user ${params.id} to ${plan}`)
        return NextResponse.json({ success: true, message: '플랜이 변경되었습니다' })

      case 'promote-admin':
        // 관리자 권한 부여
        await prisma.user.update({
          where: { id: params.id },
          data: { role: 'admin' }
        })
        
        console.log(`Admin ${admin.id} promoted user ${params.id} to admin`)
        return NextResponse.json({ success: true, message: '관리자 권한이 부여되었습니다' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 권한 체크
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    // 최고 관리자만 사용자 삭제 가능
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admin can delete users' }, { status: 403 })
    }

    // 사용자 및 관련 데이터 모두 삭제
    await prisma.user.delete({
      where: { id: params.id }
    })

    console.log(`Super admin ${admin.id} deleted user ${params.id}`)

    return NextResponse.json({ success: true, message: '사용자가 삭제되었습니다' })
  } catch (error) {
    console.error('User delete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}