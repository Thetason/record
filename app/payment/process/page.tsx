'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function PaymentProcessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('결제를 처리중입니다...');

  const subscriptionId = searchParams.get('id');
  const orderId = searchParams.get('orderId');
  const status_param = searchParams.get('status');

  useEffect(() => {
    // 데모 모드: 3초 후 성공 처리
    if (!status_param || status_param === 'demo') {
      setTimeout(() => {
        setStatus('success');
        setMessage('결제가 성공적으로 완료되었습니다!');
        
        // 5초 후 대시보드로 이동
        setTimeout(() => {
          router.push('/dashboard');
        }, 5000);
      }, 3000);
    } else if (status_param === 'success') {
      setStatus('success');
      setMessage('결제가 성공적으로 완료되었습니다!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 5000);
    } else if (status_param === 'failed' || status_param === 'cancelled') {
      setStatus('failed');
      setMessage('결제가 취소되었거나 실패했습니다.');
    }
  }, [status_param, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'processing' && (
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            )}
            {status === 'failed' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'processing' && '결제 처리중'}
            {status === 'success' && '결제 완료'}
            {status === 'failed' && '결제 실패'}
          </CardTitle>
          <CardDescription className="mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'processing' && (
            <div className="text-center text-sm text-gray-500">
              <p>잠시만 기다려주세요...</p>
              <p>결제 확인에 최대 1분이 소요될 수 있습니다.</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ 프리미엄 기능이 활성화되었습니다
                </p>
                <p className="text-xs text-green-600 mt-1">
                  주문번호: {orderId || subscriptionId || 'DEMO-' + Date.now()}
                </p>
              </div>
              <p className="text-center text-sm text-gray-500">
                5초 후 대시보드로 이동합니다...
              </p>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  결제 처리 중 문제가 발생했습니다
                </p>
                <p className="text-xs text-red-600 mt-1">
                  다시 시도하거나 고객센터로 문의해주세요
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push('/pricing')}
                  variant="outline"
                  className="flex-1"
                >
                  다시 시도
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  대시보드로
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <PaymentProcessContent />
    </Suspense>
  );
}