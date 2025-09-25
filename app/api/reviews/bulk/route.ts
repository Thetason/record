import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { parse } from 'csv-parse/sync'

type ReviewRow = Record<string, unknown>

interface BulkReview {
  platform: string
  business: string
  content: string
  author: string
  reviewDate: Date
  userId: string
  isVerified: boolean
  verifiedBy: string
}

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

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    // 파일 내용 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    let reviews: ReviewRow[] = []
    
    if (isCSV) {
      // CSV 파싱 - 다양한 인코딩 지원
      let text = ''
      try {
        // UTF-8 시도
        text = buffer.toString('utf-8')
        // BOM 제거
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1)
        }
      } catch (error) {
        console.warn('CSV UTF-8 디코딩 실패, 다른 인코딩 시도', error)
        try {
          // EUC-KR 시도 (Node.js 기본 지원하지 않아 대체 방식 사용)
          text = buffer.toString('latin1')
        } catch (fallbackError) {
          console.warn('CSV latin1 디코딩 실패, UTF-8 재시도 사용', fallbackError)
          text = buffer.toString('utf-8')
        }
      }

      // CSV 파싱 옵션 개선
      reviews = parse(text, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_quotes: true,
        trim: true,
        skip_records_with_error: true,
        relax_column_count: true
      }) as ReviewRow[]
    } else {
      // Excel 파싱 - 옵션 개선
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false,
        raw: false
      })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      reviews = XLSX.utils.sheet_to_json(firstSheet, {
        defval: '',
        raw: false,
        dateNF: 'yyyy-mm-dd'
      }) as ReviewRow[]
    }

    console.log(`파싱된 리뷰 수: ${reviews.length}`)

    // 컬럼명 매핑 강화
    const getColumnValue = (row: ReviewRow, columnNames: string[]): unknown => {
      for (const name of columnNames) {
        if (Object.prototype.hasOwnProperty.call(row, name)) {
          const value = row[name]
          if (value !== undefined && value !== null) {
            const normalized = typeof value === 'string' ? value.trim() : value
            if (!(typeof normalized === 'string' && normalized.length === 0)) {
              return value
            }
          }
        }
      }
      return undefined
    }

    const getColumnText = (row: ReviewRow, columnNames: string[]): string | undefined => {
      const value = getColumnValue(row, columnNames)
      if (value === undefined || value === null) {
        return undefined
      }
      const text = String(value).trim()
      return text.length > 0 ? text : undefined
    }

    // 데이터 검증 및 정규화
    const validReviews: BulkReview[] = []
    const errors: string[] = []
    const duplicateCheck = new Set<string>()
    
    for (let i = 0; i < reviews.length; i++) {
      const row = reviews[i]
      const rowNumber = i + 2 // 헤더 제외하고 카운트
      
      try {
        // 필수 필드 추출 - 다양한 컬럼명 지원
        const platform = getColumnText(row, [
          '플랫폼', 'platform', 'Platform', 'PLATFORM',
          '사이트', 'site', 'Site', 'source', 'Source'
        ])
        
        const business = getColumnText(row, [
          '업체명', 'business', 'Business', 'BUSINESS',
          '상호', '업체', '사업자명', 'company', 'Company',
          '매장명', 'store', 'Store', 'shop', 'Shop'
        ])
        
        const content = getColumnText(row, [
          '내용', 'content', 'Content', 'CONTENT',
          '리뷰내용', '리뷰', 'review', 'Review', 'REVIEW',
          '후기', '평가', 'comment', 'Comment', 'text', 'Text'
        ])
        
        const author = getColumnText(row, [
          '작성자', 'author', 'Author', 'AUTHOR',
          '고객명', '이름', 'name', 'Name', 'customer', 'Customer',
          '닉네임', 'nickname', 'user', 'User'
        ]) || '익명'
        
        // 필수 필드 체크
        if (!platform || !business || !content) {
          errors.push(`${rowNumber}행: 필수 정보가 누락되었습니다 (플랫폼: ${platform || '없음'}, 업체명: ${business || '없음'}, 내용: ${content ? '있음' : '없음'})`)
          continue
        }

        // 내용 길이 체크
        if (content.length < 5) {
          errors.push(`${rowNumber}행: 리뷰 내용이 너무 짧습니다 (최소 5자 이상)`)
          continue
        }

        if (content.length > 2000) {
          errors.push(`${rowNumber}행: 리뷰 내용이 너무 깁니다 (최대 2000자)`)
          continue
        }
        
        // 날짜 파싱 개선
        let reviewDate = new Date()
        const dateValue = getColumnValue(row, [
          '날짜', 'date', 'Date', 'DATE',
          '작성일', '등록일', '리뷰일', 'created', 'createdAt',
          'reviewDate', 'review_date'
        ])

        if (dateValue) {
          if (dateValue instanceof Date) {
            reviewDate = dateValue
          } else if (typeof dateValue === 'number' || (typeof dateValue === 'string' && !Number.isNaN(Number(dateValue)))) {
            const excelDate = Number(dateValue)
            if (!Number.isNaN(excelDate) && excelDate > 25569) {
              reviewDate = new Date((excelDate - 25569) * 86400 * 1000)
            }
          } else if (typeof dateValue === 'string') {
            const dateStr = dateValue.trim()
            const dateFormats = [
              /(\d{4})-(\d{1,2})-(\d{1,2})/,
              /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
              /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
              /(\d{1,2})-(\d{1,2})-(\d{4})/,
              /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
              /(\d{1,2})\/(\d{1,2})\/(\d{4})/
            ]

            let parsed = false
            for (const format of dateFormats) {
              if (format.test(dateStr)) {
                const date = new Date(dateStr)
                if (!Number.isNaN(date.getTime())) {
                  reviewDate = date
                  parsed = true
                  break
                }
              }
            }

            if (!parsed) {
              const fallbackDate = new Date(dateStr)
              if (!Number.isNaN(fallbackDate.getTime())) {
                reviewDate = fallbackDate
              }
            }
          }
        }

        // 중복 체크 (플랫폼 + 업체 + 내용 해시)
        const duplicateKey = `${platform.toLowerCase()}-${business.toLowerCase()}-${content.substring(0, 50).toLowerCase()}`
        if (duplicateCheck.has(duplicateKey)) {
          errors.push(`${rowNumber}행: 중복된 리뷰입니다`)
          continue
        }
        duplicateCheck.add(duplicateKey)

        validReviews.push({
          platform: platform.trim(),
          business: business.trim(),
          content: content.trim(),
          author: author.trim(),
          reviewDate,
          userId: session.user.id,
          isVerified: false,
          verifiedBy: 'bulk_upload'
        })
        
      } catch (rowError) {
        console.error(`Row ${rowNumber} processing error:`, rowError)
        errors.push(`${rowNumber}행: 데이터 처리 중 오류 발생 - ${rowError instanceof Error ? rowError.message : '알 수 없는 오류'}`)
      }
    }
    
    console.log(`유효한 리뷰 수: ${validReviews.length}, 오류 수: ${errors.length}`)
    
    // 유효한 리뷰가 없으면 에러
    if (validReviews.length === 0) {
      return NextResponse.json(
        { 
          error: '유효한 리뷰가 없습니다',
          details: errors.slice(0, 10), // 최대 10개까지만 표시
          totalErrors: errors.length
        },
        { status: 400 }
      )
    }
    
    // 배치 크기로 나누어 처리 (성능 최적화)
    const batchSize = 100
    let totalCreated = 0
    const processingErrors: string[] = []
    
    for (let i = 0; i < validReviews.length; i += batchSize) {
      const batch = validReviews.slice(i, i + batchSize)
      
      try {
        const result = await prisma.review.createMany({
          data: batch,
          skipDuplicates: true
        })
        totalCreated += result.count
      } catch (batchError) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, batchError)
        processingErrors.push(`배치 ${Math.floor(i/batchSize) + 1} 처리 실패: ${batchError instanceof Error ? batchError.message : '알 수 없는 오류'}`)
      }
    }
    
    const skipped = validReviews.length - totalCreated
    
    return NextResponse.json({
      success: true,
      message: `${totalCreated}개의 리뷰가 성공적으로 추가되었습니다`,
      total: reviews.length,
      valid: validReviews.length,
      created: totalCreated,
      skipped,
      validationErrors: errors.length,
      processingErrors: processingErrors.length,
      errors: [...errors.slice(0, 5), ...processingErrors].slice(0, 10), // 최대 10개 오류만 표시
      summary: {
        totalProcessed: reviews.length,
        validReviews: validReviews.length,
        successfullyCreated: totalCreated,
        duplicatesSkipped: skipped,
        validationErrors: errors.length,
        processingErrors: processingErrors.length
      }
    })
    
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { 
        error: '일괄 업로드 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
      },
      { status: 500 }
    )
  }
}
