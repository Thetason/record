-- Seed data for Re:cord development and testing
-- This file contains sample data for profiles and reviews

-- Insert sample profiles (using specific UUIDs for consistency)
INSERT INTO profiles (id, username, name, bio, profession, avatar_url, is_public) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'designer_kim',
  '김디자이너',
  '10년 경력의 UI/UX 디자이너입니다. 사용자 중심의 디자인으로 더 나은 경험을 만들어갑니다.',
  'UI/UX 디자이너',
  'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'developer_park',
  '박개발자',
  '풀스택 개발자로 React, Node.js를 주로 사용합니다. 깔끔한 코드와 성능 최적화에 관심이 많습니다.',
  '풀스택 개발자',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'marketer_lee',
  '이마케터',
  '디지털 마케팅 전문가입니다. 데이터 기반 마케팅으로 ROI 향상에 집중합니다.',
  '디지털 마케팅 전문가',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'writer_choi',
  '최작가',
  '콘텐츠 작가 및 카피라이터입니다. 브랜드의 목소리를 찾아 전달하는 일을 합니다.',
  '콘텐츠 작가',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'photo_jung',
  '정사진가',
  '전문 사진작가입니다. 인물, 제품, 이벤트 촬영을 전문으로 합니다.',
  '사진작가',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150',
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample reviews for designer_kim
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '스타트업 대표 A',
  '우리 앱의 UI/UX를 완전히 새롭게 디자인해주셨습니다. 사용자 피드백이 정말 좋아졌어요. 전문성과 센스가 뛰어나신 분입니다.',
  5,
  '크몽',
  'https://kmong.com',
  1,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '쇼핑몰 운영자 B',
  '로고부터 전체 브랜딩까지 맡겨드렸는데 기대 이상의 결과물을 받았습니다. 소통도 원활하고 수정 요청도 빠르게 반영해주셨어요.',
  5,
  '숨고',
  'https://soomgo.com',
  2,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '마케팅팀 C',
  '배너 디자인 작업을 의뢰했는데 다양한 시안을 제공해주시고 세심한 부분까지 신경써주셨습니다. 또 협업하고 싶습니다.',
  4,
  '네이버',
  'https://naver.com',
  3,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '프리랜서 D',
  '웹사이트 리뉴얼 프로젝트에서 함께 작업했습니다. 디자인 퀄리티가 정말 높고 일정 관리도 완벽했어요.',
  5,
  '당근마켓',
  'https://daangn.com',
  4,
  true
);

-- Insert sample reviews for developer_park
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  'IT 스타트업 E',
  'React와 Node.js로 전체 시스템을 구축해주셨습니다. 코드 품질이 높고 성능도 우수합니다. 유지보수도 쉽게 작성해주셨어요.',
  5,
  '크몽',
  'https://kmong.com',
  1,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '온라인몰 F',
  '쇼핑몰 개발을 맡겨드렸는데 요구사항을 정확히 파악하고 구현해주셨습니다. 버그도 거의 없고 속도도 빨라요.',
  4,
  '숨고',
  'https://soomgo.com',
  2,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '서비스 기획자 G',
  'API 개발부터 프론트엔드까지 전체적으로 담당해주셨습니다. 기술적인 제안도 많이 해주시고 협업이 즐거웠어요.',
  5,
  '구글',
  'https://google.com',
  3,
  true
);

-- Insert sample reviews for marketer_lee
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440003',
  '패션 브랜드 H',
  '인스타그램 마케팅을 맡겨드렸는데 팔로워와 매출이 모두 크게 증가했습니다. 데이터 분석도 체계적으로 해주세요.',
  5,
  '카카오',
  'https://kakao.com',
  1,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '음식점 사장 I',
  '구글 광고와 네이버 마케팅을 전체적으로 관리해주셨습니다. ROI가 정말 좋아졌어요. 추천합니다!',
  4,
  '네이버',
  'https://naver.com',
  2,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '뷰티 업체 J',
  'SNS 마케팅 전략부터 실행까지 원스톱으로 해주셨습니다. 브랜드 인지도가 많이 올라갔어요.',
  5,
  '당근마켓',
  'https://daangn.com',
  3,
  true
);

-- Insert sample reviews for writer_choi
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440004',
  '스타트업 K',
  '홈페이지 카피라이팅을 맡겨드렸는데 브랜드 톤앤매너를 완벽하게 잡아주셨습니다. 고객 반응이 정말 좋아요.',
  5,
  '크몽',
  'https://kmong.com',
  1,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '제조업체 L',
  '제품 소개서와 브로슈어 작성을 의뢰했습니다. 전문적이면서도 이해하기 쉽게 써주셨어요.',
  4,
  '숨고',
  'https://soomgo.com',
  2,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '마케팅 에이전시 M',
  '다양한 캠페인 카피를 작성해주셨습니다. 창의적이고 임팩트 있는 문구들로 성과가 좋았어요.',
  5,
  '구글',
  'https://google.com',
  3,
  true
);

-- Insert sample reviews for photo_jung
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440005',
  '웨딩업체 N',
  '제품 촬영을 맡겨드렸는데 퀄리티가 정말 높습니다. 조명과 구도가 전문적이고 보정도 자연스러워요.',
  5,
  '카카오',
  'https://kakao.com',
  1,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '카페 사장 O',
  '매장 인테리어 촬영을 해주셨는데 공간이 훨씬 멋있게 나왔어요. SNS 반응이 폭발적입니다!',
  5,
  '네이버',
  'https://naver.com',
  2,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '이벤트 기획사 P',
  '기업 행사 촬영을 맡겨드렸습니다. 중요한 순간들을 놓치지 않고 잘 담아주셨어요. 프로페셔널합니다.',
  4,
  '당근마켓',
  'https://daangn.com',
  3,
  true
);

-- Add some additional reviews to show variety
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '중소기업 Q',
  '앱 전체 디자인 리뉴얼 프로젝트였는데 사용자 경험이 크게 개선되었습니다. 매우 만족합니다.',
  5,
  '카카오',
  'https://kakao.com',
  5,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '에듀테크 R',
  '학습 플랫폼 개발을 해주셨는데 성능도 좋고 사용하기도 편해요. 기술적인 조언도 많이 해주셨습니다.',
  4,
  '네이버',
  'https://naver.com',
  4,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '의료기기 S',
  'B2B 마케팅이 어려웠는데 전문적인 전략으로 좋은 결과를 얻었습니다. 데이터 분석이 특히 인상적이었어요.',
  5,
  '크몽',
  'https://kmong.com',
  4,
  true
);

-- Insert a few reviews with lower ratings for realism
INSERT INTO reviews (user_id, reviewer_name, review_text, rating, source, external_link, display_order, is_visible) VALUES
(
  '550e8400-e29b-41d4-a716-446655440004',
  '소상공인 T',
  '전반적으로 만족하지만 소통에서 아쉬움이 있었습니다. 결과물은 좋았어요.',
  3,
  '당근마켓',
  'https://daangn.com',
  4,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '개인 U',
  '프로필 촬영을 받았는데 기대했던 것보다는 아쉬웠습니다. 하지만 나쁘지 않았어요.',
  3,
  '숨고',
  'https://soomgo.com',
  4,
  true
);

-- Update some statistics
SELECT 'Seed data inserted successfully. Sample profiles and reviews created.' as result;