import { Resend } from 'resend';

// Resend 클라이언트 초기화
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// 이메일 템플릿
const emailTemplates = {
  welcome: (name: string) => ({
    subject: '🎉 Re:cord에 오신 것을 환영합니다!',
    html: `
      <div style="font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Re:cord</h1>
          <p style="color: #666; margin-top: 10px;">전문가용 후기 자산 관리 플랫폼</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">안녕하세요, ${name}님! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Re:cord 가입을 진심으로 환영합니다!<br><br>
            이제 여러 플랫폼에 흩어진 후기를 한 곳에 모으고,<br>
            내 이름의 신뢰 페이지로 정리해보세요.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px;">
            <h3 style="color: #1a1a1a; font-size: 16px; margin-top: 0;">🚀 시작하기</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>첫 후기 업로드하기</li>
              <li>신뢰 페이지 정리하기</li>
              <li>공개 링크 공유하기</li>
            </ul>
          </div>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            대시보드로 이동
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 14px;">
          <p>도움이 필요하신가요? <a href="${process.env.NEXTAUTH_URL}/support" style="color: #3b82f6;">고객센터</a></p>
          <p style="margin-top: 20px;">© 2025 Re:cord. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  resetPassword: (name: string, resetUrl: string) => ({
    subject: '🔐 비밀번호 재설정 요청',
    html: `
      <div style="font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Re:cord</h1>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">비밀번호 재설정</h2>
          <p style="color: #666; line-height: 1.6;">
            안녕하세요, ${name}님!<br><br>
            비밀번호 재설정을 요청하셨습니다.<br>
            아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 40px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              비밀번호 재설정하기
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            이 링크는 24시간 동안 유효합니다.<br>
            본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.
          </p>
        </div>
      </div>
    `
  }),
  
  reviewNotification: (name: string, reviewCount: number) => ({
    subject: `📊 이번 주 ${reviewCount}개의 새로운 리뷰가 추가되었습니다`,
    html: `
      <div style="font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2>안녕하세요, ${name}님!</h2>
        <p>이번 주에 ${reviewCount}개의 리뷰가 추가되었습니다.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard">대시보드에서 확인하기</a>
      </div>
    `
  })
};

type EmailTemplate = 'welcome' | 'resetPassword' | 'reviewNotification'

interface EmailDataMap {
  welcome: { name: string }
  resetPassword: { name: string; resetUrl: string }
  reviewNotification: { name: string; reviewCount: number }
}

type EmailPayload<T extends EmailTemplate> = EmailDataMap[T]

// 이메일 발송 함수
export async function sendEmail<T extends EmailTemplate>(
  to: string,
  template: T,
  data: EmailPayload<T>
) {
  // Resend API 키가 없는 경우 콘솔에만 출력 (개발 환경)
  if (!resend) {
    console.log('📧 이메일 발송 (개발 모드):', {
      to,
      template,
      data
    });
    return { success: true, mock: true };
  }

  try {
    let emailContent: { subject: string; html: string };
    
    switch (template) {
      case 'welcome':
        emailContent = emailTemplates.welcome((data as EmailDataMap['welcome']).name);
        break;
      case 'resetPassword': {
        const resetData = data as EmailDataMap['resetPassword']
        emailContent = emailTemplates.resetPassword(resetData.name, resetData.resetUrl);
        break;
      }
      case 'reviewNotification': {
        const notificationData = data as EmailDataMap['reviewNotification']
        emailContent = emailTemplates.reviewNotification(notificationData.name, notificationData.reviewCount);
        break;
      }
      default:
        throw new Error('Invalid email template');
    }

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Re:cord <noreply@record.kr>',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    const message = error instanceof Error ? error.message : 'Unknown email error'
    return { success: false, error: message };
  }
}

// 대량 이메일 발송 (뉴스레터 등)
export async function sendBulkEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  html: string
) {
  if (!resend) {
    console.log('📧 대량 이메일 발송 (개발 모드):', {
      recipientCount: recipients.length,
      subject
    });
    return { success: true, mock: true };
  }

  try {
    // Resend는 batch API를 지원하므로 한 번에 여러 이메일 발송 가능
    const results = await Promise.all(
      recipients.map(recipient => 
        resend.emails.send({
          from: process.env.EMAIL_FROM || 'Re:cord <noreply@record.kr>',
          to: recipient.email,
          subject,
          html: html.replace('{{name}}', recipient.name),
        })
      )
    );

    return { success: true, data: results };
  } catch (error) {
    console.error('대량 이메일 발송 실패:', error);
    return { success: false, error };
  }
}
