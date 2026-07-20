# Production Migration Baseline

현재 저장소에는 PostgreSQL baseline migration이 추가되어 있습니다.

- baseline 경로: `prisma/migrations/20260307160000_baseline/migration.sql`
- lock 파일: `prisma/migrations/migration_lock.toml`

## 왜 필요한가

기존 운영 DB가 `prisma db push`로만 관리되었다면, 이제부터는 `prisma migrate deploy` 기반으로 전환해야 합니다.

## 기존 운영 DB에 적용하는 순서

1. 운영 DB 전체 백업
2. 운영 DB 스키마와 현재 `schema.prisma` 비교
3. 운영 DB가 baseline과 동일하면 baseline을 **적용된 상태로 표시**

```bash
npx prisma migrate resolve --applied 20260307160000_baseline
```

4. 이후 신규 변경부터는 migration 파일 생성 후 배포

```bash
npx prisma migrate dev --name <change-name>
git add prisma/migrations
npx prisma migrate deploy
```

## 주의

- 운영 DB에 이미 같은 테이블이 있는 상태에서 baseline SQL을 그대로 실행하면 충돌할 수 있습니다.
- 기존 운영 DB에는 `migrate resolve --applied`로 baseline을 맞추고, 그 다음 변경부터 `migrate deploy`를 사용해야 합니다.
- 더 이상 운영 배포에서 `prisma db push`를 사용하지 않습니다.
