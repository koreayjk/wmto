# WMTO 디자인 기준

밝고 단정한 신뢰감. 흰 바탕, 청록 단일 악센트, 같은 계열의 옅은 회색.

## 토큰 (`app/globals.css`)
- 글자 `--ink #16181d`, 보조 글자 `--ink-soft #565d68`
- 바탕 `--paper #fff`, 옅은 면 `--paper-deep #f4f7f6`, 강조 면 `--tint #e8f2ef`
- 악센트 `--accent #0e6a5b` (hover `#0a5548`), 선 `--line #e2e8e6`
- 글꼴 Pretendard 단일 (명조 계열 사용 안 함)

## 규칙
- 테마는 라이트 하나로 고정 (어두운 면 없음). 어두운 면이 필요하면 악센트 면만 사용
- 모양: 버튼·칩·메뉴는 알약(`rounded-full`), 입력란은 12px, 컨테이너는 이중 테두리(`Bezel`). 바깥 틀 2rem(모바일 1.5rem), 안쪽은 틀 두께만큼 작은 동심 곡선
- 메뉴는 화면 위에서 떠 있는 유리 알약. 모바일은 전체 화면 메뉴로 펼쳐지고 링크가 차례로 올라옴. `backdrop-blur`는 고정 요소(메뉴)에만 사용
- 주요 버튼은 오른쪽에 아이콘 원이 들어간 형태(`Button`). 눌리면 살짝 줄고(`active:scale-[0.98]`), 호버하면 아이콘이 비스듬히 움직임
- 그림자는 악센트 색을 띤 넓고 옅은 그림자. 짙은 검정 그림자와 회색 1px 테두리 카드는 쓰지 않음
- 모션 곡선은 `--ease: cubic-bezier(0.32, 0.72, 0, 1)` 하나. `linear`, `ease-in-out` 금지. `transform`과 `opacity`만 움직임. `prefers-reduced-motion`에서는 모두 정지
- 구간 여백은 `py-24 md:py-36` 이상으로 넉넉하게
- 섹션 위 작은 라벨(eyebrow), 번호 라벨, 장식 점, 스크롤 안내, em-dash 사용 금지
- 연속된 구간은 레이아웃 형태를 바꾼다: 분할(Split), 단(Columns), 타일(Tiles), 사실 묶음(Facts), 목록(Rows), 벤토
- 폼 오류는 폼 맨 위 요약에 표시하고 포커스를 옮김
- 사진은 `lib/photos.ts` 에서 교체. 없으면 단정한 자리표시가 보임. 출처는 `docs/photo-credits.md`
- 회원 앱(`/connect`)과 관리자(`/admin`)는 업무 화면이라 표현보다 가독성이 우선: 같은 색·글꼴을 쓰되 알약 버튼·이중 테두리는 쓰지 않음

## 공통 컴포넌트 (`components/ui.tsx`)
Button, TextLink, PageHero, Section, Split, Rows, Bullets, Steps, Facts, Columns, Tiles, FinalCta, Bezel(`components/Bezel.tsx`)
