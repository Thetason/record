import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { parse } from 'csv-parse/sync'

export async function POST(req: NextRequest) {
  try {
    // 인증 체크
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // FormData에서 파일 추출
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다' },
        { status: 400 }
      )
    }

    // 파일 타입 체크
    const fileName = file.name.toLowerCase()
    const isCSV = fileName.endsWith('.csv')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    
    if (!isCSV && !isExcel) {
      return NextResponse.json(
        { error: 'CSV 또는 Excel 파일만 지원됩니다' },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    // 파일 내용 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    let reviews: any[] = []
    
    if (isCSV) {
      // CSV 파싱
      const text = buffer.toString('utf-8')
      reviews = parse(text, {
        columns: true,
        skip_empty_lines: true,
        bom: true, // BOM 처리
        relax_quotes: true
      })
    } else {
      // Excel 파싱
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      reviews = XLSX.utils.sheet_to_json(firstSheet)
    }

    // 데이터 검증 및 정규화
    const validReviews = []
    const errors = []
    
    for (let i = 0; i < reviews.length; i++) {
      const row = reviews[i]
      const rowNumber = i + 2 // 헤더 제외하고 카운트
      
      // 필수 필드 체크
      const platform = row['플랫폼'] || row['platform'] || row['Platform']
      const business = row['업체명'] || row['business'] || row['Business']
      const content = row['내용'] || row['content'] || row['Content'] || row['리뷰내용']
      const author = row['작성자'] || row['author'] || row['Author'] || '익명'
      const rating = parseInt(row['평점'] || row['rating'] || row['Rating'] || '5')
      
      if (!platform || !business || !content) {
        errors.push(`${rowNumber}행: 필수 정보가 누락되었습니다 (플랫폼, 업체명, 내용)`)
        continue
      }
      
      // 날짜 파싱
      let reviewDate = row['날짜'] || row['date'] || row['Date'] || row['작성일']
      if (reviewDate) {
        // 다양한 날짜 형식 처리
        if (typeof reviewDate === 'number') {
          // Excel 날짜 형식 (숫자)
          reviewDate = new Date((reviewDate - 25569) * 86400 * 1000)
        } else {
          reviewDate = new Date(reviewDate)
        }
        
        if (isNaN(reviewDate.getTime())) {
          reviewDate = new Date() // 파싱 실패 시 현재 날짜
        }
      } else {
        reviewDate = new Date()
      }
      
      validReviews.push({
        platform,
        business,
        content,
        author,
        rating: Math.min(5, Math.max(1, rating)), // 1-5 범위로 제한
        reviewDate,
        userId: session.user.id,
        isVerified: false,
        verifiedBy: 'bulk_upload'
      })
    }
    
    // 유효한 리뷰가 없으면 에러
    if (validReviews.length === 0) {
      return NextResponse.json(
        { 
          error: '유효한 리뷰가 없습니다',
          details: errors 
        },
        { status: 400 }
      )
    }
    
    // 데이터베이스에 일괄 저장
    const created = await prisma.review.createMany({
      data: validReviews,
      skipDuplicates: true
    })
    
    return NextResponse.json({
      success: true,
      message: `${created.count}개의 리뷰가 성공적으로 추가되었습니다`,
      total: reviews.length,
      created: created.count,
      skipped: reviews.length - created.count,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { 
        error: '일괄 업로드 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}