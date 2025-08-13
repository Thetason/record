'use client';

import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const reportReasons = [
  { value: 'fake', label: '허위/조작된 리뷰' },
  { value: 'spam', label: '스팸/광고성 리뷰' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'personal', label: '개인정보 노출' },
  { value: 'other', label: '기타' },
];

interface ReportDialogProps {
  reviewId: string;
  onReportSuccess?: () => void;
}

export function ReportDialog({ reviewId, onReportSuccess }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: '신고 사유를 선택해주세요',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '신고 처리 실패');
      }

      toast({
        title: '신고가 접수되었습니다',
        description: '검토 후 조치하겠습니다.',
      });

      setOpen(false);
      setReason('');
      setDescription('');
      
      if (onReportSuccess) {
        onReportSuccess();
      }
    } catch (error: any) {
      toast({
        title: '신고 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
          <Flag className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리뷰 신고하기</DialogTitle>
          <DialogDescription>
            이 리뷰에 문제가 있다면 신고해주세요. 검토 후 적절한 조치를 취하겠습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>신고 사유</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label htmlFor={item.value} className="font-normal cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상세 설명 (선택)</Label>
            <Textarea
              id="description"
              placeholder="신고 사유를 자세히 설명해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !reason}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? '신고 중...' : '신고하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}