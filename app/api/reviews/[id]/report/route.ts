import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        reviewId: id,
        reporterIp,
        status: 'pending'
      },
    });

    if (existingReport) {
      return NextResponse.json({ error: '이미 신고한 리뷰입니다' }, { status: 400 });
    }

    // 신고 생성
    const report = await prisma.report.create({
      data: {
        reviewId: id,
        reporterIp,
        reason,
        description: description || null,
        status: 'pending'
      },
    });

    const totalReports = await prisma.report.count({
      where: { reviewId: id }
    });

    if (totalReports >= 3) {
      await prisma.review.update({
        where: { id },
        data: {
          verificationStatus: 'flagged',
          isVerified: false,
          isPublic: false,
          verificationNote: 'Auto-flagged after repeated public reports.'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: '신고가 접수되었습니다',
      report,
      totalReports
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 리뷰의 신고 내역 조회 (리뷰 소유자만)
    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다' }, { status: 404 });
    }

    if (review.user.email !== session.user.email) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      where: { reviewId: id },
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
