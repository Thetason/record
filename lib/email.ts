import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

// 이메일 발송 방식 선택 (SendGrid 또는 SMTP)
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'

// SendGrid 설정
if (EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// SMTP 설정 (Gmail, Naver 등)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
})

// 이메일 템플릿
const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Re:cord에 오신 것을 환영합니다! 🎉',
    html: `
      <div style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; font-size: 32px; margin: 0;">Re:cord</h1>
          <p style="color: #666; margin-top: 10px;">리뷰는 누군가의 기억입니다</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">안녕하세요, ${name}님! 👋</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Re:cord 가입을 진심으로 환영합니다!<br>
            이제 흩어진 리뷰들을 한 곳에서 관리하고,<br>
            당신만의 리뷰 포트폴리오를 만들어보세요.
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #FF6B35; font-size: 18px; margin-bottom: 15px;">🚀 시작하기</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>첫 리뷰 업로드하기</li>
              <li>프로필 꾸미기</li>
              <li>공개 링크 공유하기</li>
            </ul>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
             style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600;">
            대시보드 바로가기
          </a>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>도움이 필요하시면 언제든 문의해주세요.</p>
          <p>© 2024 Re:cord. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  resetPassword: (name: string, resetLink: string) => ({
    subject: 'Re:cord 비밀번호 재설정 안내',
    html: `
      <div style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; font-size: 32px; margin: 0;">Re:cord</h1>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
          <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">비밀번호 재설정</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            안녕하세요, ${name}님.<br>
            비밀번호 재설정을 요청하셨습니다.<br>
            아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
          </p>
          
          <div style="background: #fff3cd; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ 이 링크는 1시간 동안만 유효합니다.
            </p>
          </div>
          
          <a href="${resetLink}" 
             style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600;">
            비밀번호 재설정하기
          </a>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.
          </p>
        </div>
      </div>
    `
  }),

  reviewRequest: (customerName: string, businessName: string, reviewLink: string) => ({
    subject: `${businessName}에서 리뷰를 요청드립니다 ⭐`,
    html: `
      <div style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">${businessName}</h1>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; padding: 30px;">
          <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">
            안녕하세요, ${customerName}님! 😊
          </h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            저희 서비스를 이용해주셔서 감사합니다.<br>
            고객님의 소중한 리뷰는 저희에게 큰 힘이 됩니다.<br>
            잠시 시간을 내어 리뷰를 남겨주시면 감사하겠습니다.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewLink}" 
               style="display: inline-block; background: #FF6B35; color: white; padding: 15px 40px; 
                      border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
              ⭐ 리뷰 작성하기
            </a>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              리뷰 작성은 1분도 걸리지 않습니다!
            </p>
          </div>
        </div>
      </div>
    `
  })
}

// 이메일 발송 함수
export async function sendEmail(
  to: string,
  templateName: keyof typeof emailTemplates,
  ...args: any[]
) {
  try {
    const template = emailTemplates[templateName](...args)
    const from = process.env.EMAIL_FROM || 'noreply@record.kr'

    if (EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // SendGrid로 발송
      const msg = {
        to,
        from,
        subject: template.subject,
        html: template.html,
      }
      
      await sgMail.send(msg)
      console.log('SendGrid 이메일 발송 성공:', to)
    } else {
      // SMTP로 발송
      const info = await transporter.sendMail({
        from: `"Re:cord" <${from}>`,
        to,
        subject: template.subject,
        html: template.html,
      })
      
      console.log('SMTP 이메일 발송 성공:', info.messageId)
    }
    
    return { success: true }
  } catch (error) {
    console.error('이메일 발송 실패:', error)
    // 개발 환경에서는 에러를 무시하고 성공 처리
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경: 이메일 발송 시뮬레이션')
      return { success: true }
    }
    throw error
  }
}

// 이메일 발송 테스트
export async function testEmailConnection() {
  try {
    if (EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // SendGrid 연결 테스트
      await sgMail.send({
        to: 'test@example.com',
        from: process.env.EMAIL_FROM || 'noreply@record.kr',
        subject: 'Connection Test',
        text: 'Test',
        mailSettings: {
          sandboxMode: {
            enable: true // 실제로 발송하지 않고 테스트만
          }
        }
      })
      return { success: true, provider: 'SendGrid' }
    } else {
      // SMTP 연결 테스트
      await transporter.verify()
      return { success: true, provider: 'SMTP' }
    }
  } catch (error) {
    console.error('이메일 연결 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}