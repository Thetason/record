import nodemailer from 'nodemailer'

// 이메일 서비스 설정
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  if (!transporter) {
    console.warn('Email service not configured')
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Preview:')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('Content:', text || html)
    }
    return { success: true, messageId: 'mock-' + Date.now() }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Re:cord" <${process.env.SMTP_FROM || 'noreply@record.kr'}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 회원가입 인증 이메일
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Re:cord 이메일 인증',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Re:cord 회원가입을 환영합니다!</h2>
        <p>아래 버튼을 클릭하여 이메일을 인증해주세요:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 4px;">이메일 인증하기</a>
        <p style="margin-top: 20px; color: #666;">이 링크는 24시간 동안 유효합니다.</p>
      </div>
    `,
  })
}

// 비밀번호 재설정 이메일
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Re:cord 비밀번호 재설정',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>비밀번호 재설정</h2>
        <p>비밀번호를 재설정하려면 아래 버튼을 클릭해주세요:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 4px;">비밀번호 재설정</a>
        <p style="margin-top: 20px; color: #666;">이 링크는 1시간 동안 유효합니다.</p>
        <p style="color: #666;">만약 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해주세요.</p>
      </div>
    `,
  })
}

// 결제 완료 이메일
export async function sendPaymentSuccessEmail(email: string, plan: string, amount: number) {
  return sendEmail({
    to: email,
    subject: 'Re:cord 결제 완료',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>결제가 완료되었습니다!</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>플랜:</strong> ${plan}</p>
          <p><strong>결제 금액:</strong> ${amount.toLocaleString()}원</p>
        </div>
        <p>이제 Re:cord의 모든 기능을 사용하실 수 있습니다.</p>
        <p>문의사항이 있으시면 support@record.kr로 연락주세요.</p>
      </div>
    `,
  })
}