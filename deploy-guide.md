# 리코드(Re:cord) 배포 가이드

## 1. Vercel 배포 (추천) - 5분 완료

### 준비사항
1. GitHub 계정
2. Vercel 계정 (GitHub로 가입 가능)

### 배포 단계

#### Step 1: GitHub에 코드 업로드
```bash
# 프로젝트 디렉토리에서
git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/recode-project.git
git push -u origin main
```

#### Step 2: Vercel 배포
1. [vercel.com](https://vercel.com) 접속
2. "Import Project" 클릭
3. GitHub 저장소 선택
4. 환경변수 설정:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   DATABASE_URL=your-database-url
   GOOGLE_VISION_API_KEY=your-api-key (선택)
   ```
5. "Deploy" 클릭

#### Step 3: 데이터베이스 설정
**옵션 A: Vercel Postgres (무료)**
- Vercel 대시보드 > Storage > Create Database
- Postgres 선택
- 자동으로 DATABASE_URL 설정됨

**옵션 B: Supabase (무료)**
```bash
# Supabase에서 프로젝트 생성 후
# Connection string 복사
# Vercel 환경변수에 DATABASE_URL 추가
```

**옵션 C: PlanetScale (무료 티어)**
```bash
# PlanetScale에서 데이터베이스 생성
# Connection string 복사
# Vercel 환경변수에 추가
```

### Prisma 설정 변경
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // SQLite에서 변경
  url      = env("DATABASE_URL")
}
```

### 배포 후 마이그레이션
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로덕션 마이그레이션
vercel env pull .env.production
npx prisma migrate deploy
```

---

## 2. Netlify 배포 (대안)

### 설정 파일 추가
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 배포
1. [netlify.com](https://netlify.com) 접속
2. GitHub 연결
3. 환경변수 설정
4. Deploy

---

## 3. Railway 배포 (풀스택 간편)

### 장점
- 데이터베이스 자동 제공
- 한 곳에서 모든 관리

### 배포
1. [railway.app](https://railway.app) 접속
2. "Deploy from GitHub" 선택
3. PostgreSQL 추가
4. 환경변수 자동 설정
5. Deploy

---

## 4. 자체 서버 배포 (VPS)

### 저렴한 VPS 옵션
- **Vultr**: $6/월
- **DigitalOcean**: $6/월
- **Linode**: $5/월
- **Oracle Cloud**: 무료 (제한적)

### 설정 스크립트
```bash
# Ubuntu 서버 기준
sudo apt update
sudo apt install nodejs npm nginx

# PM2 설치 (프로세스 관리)
npm install -g pm2

# 프로젝트 클론
git clone your-repo
cd recode-project
npm install
npm run build

# PM2로 실행
pm2 start npm --name "recode" -- start
pm2 save
pm2 startup

# Nginx 설정
sudo nano /etc/nginx/sites-available/recode
```

### Nginx 설정
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. 도메인 연결

### 도메인 구매
- **Namecheap**: $8/년
- **Cloudflare**: $8/년
- **가비아**: 15,000원/년

### DNS 설정
```
A Record: @ -> Vercel IP
CNAME: www -> cname.vercel-dns.com
```

---

## 환경변수 체크리스트

### 필수
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=생성방법: openssl rand -base64 32
DATABASE_URL=postgresql://...
```

### 선택
```env
GOOGLE_VISION_API_KEY=OCR 기능용
```

---

## 배포 전 체크리스트

- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] Prisma 마이그레이션 실행
- [ ] 빌드 에러 없음 확인
- [ ] HTTPS 설정 (자동)

---

## 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 먼저 테스트
npm run build
npm run start
```

### 데이터베이스 연결 실패
- DATABASE_URL 형식 확인
- SSL 설정 확인 (?sslmode=require)

### 세션 문제
- NEXTAUTH_URL이 실제 도메인과 일치하는지 확인
- NEXTAUTH_SECRET 설정 확인

---

## 추천 배포 순서

1. **개발/테스트**: Vercel 무료 플랜
2. **정식 런칭**: Vercel Pro ($20/월) 또는 자체 서버
3. **스케일링**: AWS/GCP + CDN

---

## 비용 비교

| 서비스 | 월 비용 | 특징 |
|--------|---------|------|
| Vercel | 무료~$20 | 가장 쉬움, 자동 스케일링 |
| Netlify | 무료~$19 | Vercel 대안 |
| Railway | $5~$20 | DB 포함 |
| VPS | $5~$10 | 완전 제어 |
| AWS | $20~$100+ | 엔터프라이즈 |

---

## 지금 바로 시작하기

```bash
# 1. GitHub에 푸시
git add .
git commit -m "Ready for deployment"
git push

# 2. Vercel 가입
# 3. Import & Deploy
# 4. 5분 후 라이브! 🎉
```