# Live Profile Preservation

기준 날짜: 2026-04-02  
목적: 실제 운영 중인 공개 프로필, 특히 `syb2020` 같은 founder proof 프로필을 실수로 잃지 않기 위한 보존 기준

---

## 1. 보존 대상

현재 기준으로 반드시 보존해야 하는 라이브 프로필:

- `syb2020`

이 프로필은 단순 데모가 아니라 `실사용 founder proof profile`로 취급한다.

즉:

- 홈의 기본 데모가 `stylist-demo`로 바뀌어도 유지한다.
- 헤어디자이너 wedge 전략과 별개로 운영 자산으로 남긴다.
- username 재사용, 초기화, 덮어쓰기 대상으로 취급하지 않는다.

---

## 2. 운영 원칙

1. 프로덕션 DB에서 `syb2020` row를 삭제하지 않는다.
2. username `syb2020`는 예약어처럼 취급한다.
3. 데모 시드나 실험 스크립트는 프로덕션에서 실행하지 않는다.
4. 로컬/스모크 환경에서 복원이 필요하면 공개 프로필 동기화 스크립트를 사용한다.

현재 스크립트는 이미 프로덕션 실행을 막는다.

- `scripts/setup-demo-data.ts`
- `scripts/sync-public-profile.ts`

---

## 3. 복원 경로

라이브 공개 프로필을 로컬/스모크 DB로 다시 가져오는 가장 빠른 방법:

```bash
npm run preserve:syb2020:smoke
```

개발 DB로 가져오려면:

```bash
npm run preserve:syb2020:dev
```

이 명령은 아래 주소의 공개 프로필 JSON을 읽어서 안전한 로컬 DB로만 동기화한다.

- `https://www.recordyours.com/api/profile/syb2020?increment=false`

---

## 4. 전략과의 관계

현재 go-to-market wedge는 `헤어디자이너 first`다.

하지만 `syb2020`는 전략에서 제거해야 할 예외가 아니라:

- founder의 실제 사용 사례
- 라이브 운영 증거
- 향후 인접 직군 확장 가능성을 보여주는 proof

로 본다.

즉:

- 시장 진입 메시지는 헤어디자이너 중심으로 간다.
- 라이브 founder profile은 별도 자산으로 유지한다.

---

## 5. 지금 확인된 사실

2026-04-02 기준으로 아래가 확인되었다.

- `https://www.recordyours.com/syb2020` 공개 페이지가 살아 있다.
- `npm run preserve:syb2020:smoke`로 smoke DB 복원이 성공했다.
- 동기화 기준 리뷰 수는 `22개`, 이미지 리뷰 수는 `9개`였다.

이 문서는 `syb2020`를 앞으로도 실사용 보존 자산으로 취급하기 위한 기준 문서다.
