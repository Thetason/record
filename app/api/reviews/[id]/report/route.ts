import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { REVIEW_RIGHTS_STATUSES } from '@/lib/review-policy';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { reason, description } = await req.json();

    // 신고 사유 검증
    const validReasons = [
      'fake', // 허위 리뷰
      'spam', // 스팸
      'inappropriate', // 부적절한 내용
      'copyright', // 저작권 침해
      'other' // 기타
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: '유효하지 않은 신고 사유입니다' },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const reporterIp = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

    // 이미 신고한 리뷰인지 확인
    const existingReport = await prisma.report.findFirst({
      where: {
        reviewId: params.id,
        reporterIp,
        status: 'pending'
      },
    });

    if (existingReport) {
      return NextResponse.json({ error: '이미 신고한 리뷰입니다' }, { status: 400 });
    }

    // 신고 생성 + 누적 신고 기준 자동 비공개 처리
    const { report } = await prisma.$transaction(async tx => {
      const created = await tx.report.create({
        data: {
          reviewId: params.id,
          reporterIp,
          reason,
          description: description || null,
          status: 'pending'
        },
      });

      const reportCount = await tx.report.count({
        where: { reviewId: params.id, status: 'pending' }
      });

      if (reportCount >= 3) {
        await tx.review.update({
          where: { id: params.id },
          data: {
            isPublic: false,
            verificationStatus: 'flagged',
            rightsStatus: REVIEW_RIGHTS_STATUSES.BLOCKED
          }
        });
      }

      return { report: created };
    });

    return NextResponse.json({ 
      success: true, 
      message: '신고가 접수되었습니다',
      report 
    });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json(
      { error: '신고 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 리뷰의 신고 내역 조회 (리뷰 소유자만)
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다' }, { status: 404 });
    }

    if (review.user.email !== session.user.email) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      where: { reviewId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: '신고 내역 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
