# WMTO 디자인 기준

밝고 단정한 신뢰감. 흰 바탕, 청록 단일 악센트, 같은 계열의 옅은 회색.

## 토큰 (`app/globals.css`)
- 글자 `--ink #16181d`, 보조 글자 `--ink-soft #565d68`
- 바탕 `--paper #fff`, 옅은 면 `--paper-deep #f4f7f6`, 강조 면 `--tint #e8f2ef`
- 악센트 `--accent #0e6a5b` (hover `#0a5548`), 선 `--line #e2e8e6`
- 글꼴 Pretendard 단일 (명조 계열 사용 안 함)

## 규칙
- 테마는 라이트 하나로 고정 (어두운 면 없음). 어두운 면이 필요하면 악센트 면만 사용
- 모서리: 컨트롤(버튼·입력·칩) `rounded-lg`, 컨테이너(카드·사진·패널) `rounded-2xl`
- 섹션 위 작은 라벨(eyebrow), 번호 라벨, 장식 점, 스크롤 안내, em-dash 사용 금지
- 연속된 구간은 레이아웃 형태를 바꾼다: 분할(Split), 단(Columns), 타일(Tiles), 사실 묶음(Facts), 목록(Rows)
- 모션은 첫 화면 진입(`.rise`)과 구간 제목 등장(`Reveal`)만. `prefers-reduced-motion` 에서는 모두 정지
- 사진은 `lib/photos.ts` 에서 교체. 없으면 단정한 자리표시가 보임

## 공통 컴포넌트 (`components/ui.tsx`)
Button, TextLink, PageHero, Section, Split, Rows, Bullets, Steps, Facts, Columns, Tiles, FinalCta
