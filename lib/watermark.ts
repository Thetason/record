export async function addWatermark(
  imageDataUrl: string,
  watermarkText: string = 'Re:cord 검증됨'
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 이미지 데이터 URL 유효성 검사
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      reject(new Error('Invalid image data URL'));
      return;
    }

    if (!imageDataUrl.startsWith('data:image/')) {
      reject(new Error('Invalid image format'));
      return;
    }

    const img = new Image();
    
    // 타임아웃 설정 (10초)
    const timeout = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      
      try {
        // 이미지 크기 유효성 검사
        if (img.width <= 0 || img.height <= 0 || img.width > 4000 || img.height > 4000) {
          reject(new Error('Invalid image dimensions'));
          return;
        }

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

        // 워터마크 스타일 설정 (이미지 크기에 따라 동적 조절)
        const fontSize = Math.max(12, Math.min(24, img.width / 25));
        const padding = Math.max(10, fontSize * 0.8);

        // 메인 워터마크 텍스트
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const text = watermarkText || 'Re:cord 검증됨';
        const metrics = ctx.measureText(text);
        const x = img.width - padding;
        const y = img.height - padding;

        // 반투명 배경 추가
        const bgPadding = 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
          x - metrics.width - bgPadding,
          y - fontSize - bgPadding,
          metrics.width + bgPadding * 2,
          fontSize + bgPadding * 2
        );

        // 텍스트 그리기 (테두리 + 채우기)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeText(text, x, y);
        
        ctx.fillStyle = 'rgba(255, 107, 53, 0.9)';
        ctx.fillText(text, x, y);

        // 타임스탬프 추가
        const timestamp = new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        const timestampFontSize = Math.max(10, fontSize * 0.6);
        ctx.font = `${timestampFontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        const timestampY = y - fontSize - 5;
        ctx.fillText(timestamp, x, timestampY);

        // 결과 반환 (품질 최적화)
        const result = canvas.toDataURL('image/jpeg', 0.9);
        resolve(result);
        
      } catch (error) {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error('Watermark processing failed'));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image'));
    };

    // CORS 설정
    img.crossOrigin = 'anonymous';
    img.src = imageDataUrl;
  });
}

export async function addSimpleWatermark(
  imageDataUrl: string,
  username: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 입력 유효성 검사
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      reject(new Error('Invalid image data URL'));
      return;
    }

    if (!imageDataUrl.startsWith('data:image/')) {
      reject(new Error('Invalid image format'));
      return;
    }

    if (!username || typeof username !== 'string' || username.length > 50) {
      reject(new Error('Invalid username'));
      return;
    }

    const img = new Image();
    
    // 타임아웃 설정
    const timeout = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      
      try {
        // 이미지 크기 검증
        if (img.width <= 0 || img.height <= 0 || img.width > 4000 || img.height > 4000) {
          reject(new Error('Invalid image dimensions'));
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 심플한 워터마크 (더 깔끔한 디자인)
        const fontSize = Math.max(12, Math.min(20, img.width / 30));
        const padding = Math.max(8, fontSize * 0.6);
        
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const cleanUsername = username.replace(/[^a-zA-Z0-9가-힣]/g, '');
        const text = `@${cleanUsername} • Re:cord`;
        const metrics = ctx.measureText(text);
        const x = img.width - padding;
        const y = img.height - padding;

        // 배경 박스 (더 투명하고 세련된 디자인)
        const bgPadding = 6;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
          x - metrics.width - bgPadding,
          y - fontSize - bgPadding,
          metrics.width + bgPadding * 2,
          fontSize + bgPadding * 2
        );

        // 텍스트 그리기
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillText(text, x, y);

        // 결과 반환
        const result = canvas.toDataURL('image/jpeg', 0.9);
        resolve(result);
        
      } catch (error) {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error('Simple watermark processing failed'));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image'));
    };

    img.crossOrigin = 'anonymous';
    img.src = imageDataUrl;
  });
}

// 워터마크 브라우저 호환성 검사
export function isWatermarkSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return !!(canvas && ctx && ctx.measureText);
  } catch {
    return false;
  }
}