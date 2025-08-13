export async function addWatermark(
  imageDataUrl: string,
  watermarkText: string = 'Re:cord 검증됨'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // 캔버스 크기 설정
      canvas.width = img.width;
      canvas.height = img.height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0);

      // 워터마크 스타일 설정
      const fontSize = Math.max(16, img.width / 30);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 107, 53, 0.7)'; // 브랜드 컬러 반투명
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;

      // 텍스트 위치 계산 (우측 하단)
      const text = watermarkText;
      const metrics = ctx.measureText(text);
      const x = img.width - metrics.width - 20;
      const y = img.height - 20;

      // 텍스트 그리기 (테두리 + 채우기)
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);

      // 타임스탬프 추가
      const timestamp = new Date().toLocaleDateString('ko-KR');
      const timestampFontSize = fontSize * 0.7;
      ctx.font = `${timestampFontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 107, 53, 0.5)';
      
      const timestampMetrics = ctx.measureText(timestamp);
      const timestampX = img.width - timestampMetrics.width - 20;
      const timestampY = img.height - 20 - fontSize - 5;
      
      ctx.strokeText(timestamp, timestampX, timestampY);
      ctx.fillText(timestamp, timestampX, timestampY);

      // 대각선 워터마크 패턴 추가
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#FF6B35';
      ctx.font = `bold ${fontSize * 1.5}px Arial`;
      ctx.rotate(-45 * Math.PI / 180);

      const pattern = 'Re:cord ';
      const patternWidth = ctx.measureText(pattern).width;
      
      for (let i = -img.height; i < img.width; i += patternWidth * 2) {
        for (let j = -img.width; j < img.height * 2; j += fontSize * 3) {
          ctx.fillText(pattern, i, j);
        }
      }
      
      ctx.restore();

      // 결과 반환
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}

export async function addSimpleWatermark(
  imageDataUrl: string,
  username: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 심플한 워터마크
      const fontSize = Math.max(14, img.width / 40);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;

      const text = `@${username} • Re:cord`;
      const metrics = ctx.measureText(text);
      const padding = 10;
      const x = img.width - metrics.width - padding;
      const y = img.height - padding;

      // 배경 박스
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(
        x - padding/2, 
        y - fontSize - padding/2, 
        metrics.width + padding, 
        fontSize + padding
      );

      // 텍스트
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(text, x, y);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}