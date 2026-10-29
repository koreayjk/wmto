// 모든 화면 문구는 이 파일에서 관리합니다. 영어 버전은 en.ts 를 같은 형태로 추가하세요.
// 용어·금액은 docs/00-wmto-overview.md 를 따릅니다.

const verse = {
  ko: "주는 것이 받는 것보다 복이 있다",
  en: "It is more blessed to give than to receive.",
  ref: "행 20:35",
  refEn: "Acts 20:35 (ESV)",
  // 화면별 표기: 푸터 한 줄, 사진 배너(큰 글/작은 글)
  footer: "주는 것이 받는 것보다 복이 있다 (행 20:35)",
  bandTitle: "\u201CIt is more blessed to give than to receive.\u201D",
  bandCaption: "주는 것이 받는 것보다 복이 있다 (행 20:35)",
};

export const ko = {
  site: {
    tagline: "자립선교 비즈니스 네트워크",
    skip: "본문으로 건너뛰기",
    manifestDescription: "WMTO 자립선교 비즈니스 네트워크 회원 앱",
    name: "WMTO 자립선교 비즈니스 네트워크",
    short: "WMTO",
    description:
      "크리스천 사업가가 가르치고, 선교사가 일어서는 자립선교 비즈니스 네트워크",
    footerLine: "IM선교회와 함께",
    contact: "문의: /apply?type=contact",
    privacy: "개인정보 처리방침",
  },
  verse,
  nav: {
    items: [
      { href: "/about", label: "About" },
      { href: "/mentor", label: "사업가" },
      { href: "/partner", label: "선교사" },
      { href: "/sponsor", label: "후원" },
      { href: "/camp", label: "캠프" },
      { href: "/stories", label: "스토리" },
      { href: "/events", label: "일정" },
    ],
    cta: { href: "/apply?type=observe", label: "참관 신청" },
    menu: "메뉴",
    close: "닫기",
    main: "주 메뉴",
    mobile: "모바일 메뉴",
    switchTo: "English",
    switchLabel: "Switch to English",
  },
  footer: { fund: "순환 기금", contact: "문의" },
  common: { select: "선택", home: "처음으로" },
  meta: {
    about: "About",
    mentor: "사업가 (Mentor)",
    partner: "선교사 (Partner)",
    sponsor: "후원자 (Sponsor)",
    camp: "필리핀 훈련 캠프",
    fund: "순환 기금",
    stories: "스토리",
    events: "일정",
    apply: "신청·문의",
    privacy: "개인정보 처리방침",
  },
  alts: {
    hero: "카페에서 커피 머신 앞에 선 사업가",
    base: "필리핀 선교본부",
  },
  labels: { step: "{n}단계", mission: "미션 {n}", week: "{n}주차", marquee: "WMTO의 네 가지 핵심 가치" },
  notFound: {
    title: "찾으시는 페이지가 없습니다",
    body: "주소가 바뀌었거나 삭제된 페이지일 수 있습니다. 처음 화면에서 다시 찾아보세요.",
    home: "처음으로",
    contact: "문의하기",
  },
  privacy: {
    title: "개인정보 처리방침",
    draft: "초안입니다.",
    draftNote: "운영 주체와 법무 확인 후 확정 문구로 교체해 주세요.",
    items: [
      "수집 항목: 이름, 이메일, 연락처, 거주 국가, 신청 시 입력하신 내용",
      "이용 목적: 신청 접수, 상담 및 안내, 모임·캠프 운영",
      "보관 기간: 목적 달성 시까지 (삭제를 요청하시면 지체 없이 파기)",
      "문의: 신청·문의 페이지를 통해 연락해 주세요.",
    ],
  },

  home: {
    hero: {
      eyebrow: "WMTO 자립선교 비즈니스 네트워크",
      title: "크리스천 사업가가 가르치고,\n선교사가 일어섭니다",
      sub: "당신의 사업 경험이 선교사의 자립이 되고, 그 자립이 멈추지 않는 선교가 됩니다.",
      verse: "More Blessed to Give - 주는 것이 받는 것보다 복이 있다 (행 20:35)",
      buttons: [
        { label: "사업가이신가요?", href: "/mentor" },
        { label: "선교사이신가요?", href: "/partner" },
        { label: "후원하고 싶으신가요?", href: "/sponsor" },
      ],
    },
    problem: {
      title: "후원만으로는 멈추지 않는 선교를 만들 수 없습니다",
      body: "많은 선교사님들이 후원이 줄어들 때마다 사역을 내려놓을 고민을 합니다. 선교지에 필요한 것은 더 많은 후원금이 아니라, 스스로 일어설 수 있는 힘입니다.",
    },
    solution: {
      title: "세 사람이 함께 세우는 자립 선교",
      items: [
        { name: "사업가", en: "Mentor", text: "가진 기술과 경험을 전합니다" },
        { name: "후원자", en: "Sponsor", text: "시작할 수 있는 길을 엽니다" },
        { name: "선교사", en: "Partner", text: "배우고, 시작하고, 일어섭니다" },
      ],
    },
    how: {
      title: "한 사람의 경험이 한 선교지를 세웁니다",
      body: "20년째 카페를 운영하는 김 대표는 필리핀 캠프에서 2주간 커피 사업을 가르쳤습니다. 캄보디아의 이 선교사님은 그곳에서 배우고, 순환 기금 300만 원으로 작은 카페를 열었습니다. 1년 후, 카페는 현지 청년들이 모이는 사역의 공간이 되었고, 이 선교사님이 갚은 기금은 다음 선교사님의 시작이 되었습니다.",
      note: "이해를 돕기 위한 예시입니다",
      flow: [
        "온라인 모임",
        "필리핀 훈련 캠프",
        "1:1 멘토링",
        "자립",
        "다음 선교사의 멘토",
      ],
      // docs/00-wmto-overview.md 7~9장의 내용
      steps: [
        { name: "온라인 모임", text: "격주 60분. 선교사의 현장 보고를 듣고 사업가의 강의를 나눕니다.", detail: "처음 오시는 분도 부담 없이 참관할 수 있습니다. 가입하기 전에 한 번 들어와 분위기를 보세요.", points: ["60초 자기소개로 서로 얼굴을 익힙니다", "선교사가 현장 이야기를 직접 전합니다", "사업가가 한 가지 주제로 강의합니다"] },
        { name: "필리핀 훈련 캠프", text: "연 2회, 3주간 선교본부에서 선교지에 맞는 사업을 배우고 계획서를 완성합니다.", detail: "현직 크리스천 사업가들이 직접 와서 가르칩니다. 선교지에서 바로 쓸 기술을 손으로 익힙니다.", points: ["1주차 기초: 가격, 회계, 고객", "2주차 전문 트랙: 선택한 분야를 집중 실습", "3주차 사업 계획서 완성, 발표, 순환 기금 신청"] },
        { name: "1:1 멘토링", text: "월 1회, 사업가 한 분이 선교사 한 분과 끝까지 동행합니다.", detail: "한 번의 강의로 끝나지 않습니다. 사업을 시작한 뒤에도 곁에서 묻고 답하며 함께 걷습니다.", points: ["월 1회 만나 사업의 진행을 함께 점검합니다", "만날 때마다 멘토링 기록을 남깁니다", "순환 기금을 받을 때도 담당 멘토가 동행합니다"] },
        { name: "자립", text: "사업 수입으로 사역을 이어 갈 수 있게 됩니다. 순환 기금은 매출의 일부로 갚습니다.", detail: "첫 매출이 생기면 2차 지원과 판로 연결이 이어집니다. 부담이 되지 않도록 갚는 방식도 사정에 맞춥니다.", points: ["순환 기금은 무이자이고, 매출의 일부(5~10%)로 갚습니다", "사업이 어려워지면 사정을 살펴 상환을 면제할 수 있습니다", "자립 리포트로 한 달의 걸음을 함께 나눕니다"] },
        { name: "다음 선교사의 멘토", text: "자립한 선교사가 다음 선교사를 세웁니다. 갚은 기금도 다음 시작이 됩니다.", detail: "한 사람의 자립이 한 번으로 끝나지 않고 다음 사람에게 이어집니다.", points: ["갚은 기금은 다음 선교사의 시작 자금이 됩니다", "자립한 선교사는 다음 선교사의 멘토로 참여합니다", "기금이 흘러간 내역은 투명하게 공개합니다"] },
      ],
    },
    camp: {
      title: "필리핀에서 배우고, 선교지에서 시작합니다",
      body: "연 2회, 3주간 필리핀 선교본부에서 집중 훈련이 열립니다. 현직 크리스천 사업가들이 직접 와서 비즈니스, 마케팅, 디지털, 미용·요리 등 선교지에서 바로 쓸 수 있는 기술을 가르칩니다.",
      cta: { label: "캠프 자세히 보기", href: "/camp" },
    },
    fund: {
      title: "한 번의 후원이 계속 흐릅니다",
      body: "캠프를 수료한 선교사님은 무이자 창업 자금을 지원받습니다. 사업이 자리 잡은 후 갚은 기금은 다음 선교사님의 시작이 됩니다. 당신의 후원은 한 사람에서 멈추지 않습니다.",
      cta: { label: "순환 기금 보기", href: "/fund" },
    },
    mentor: {
      title: "어떤 사업을 하시든, 함께할 자리가 있습니다",
      body: "가르칠 기술이 있다면 기술을, 사업을 운영해 오셨다면 경영 노하우를, 거래처가 있다면 판로를, 전문 지식이 있다면 자문을 나눠 주십시오. 당신이 이미 가진 것이 가장 큰 선교 자원입니다.",
      cta: { label: "사업가로 동참하기", href: "/mentor" },
    },
    partner: {
      title: "\"제가 사업을 할 수 있을까요?\" 그 질문에서 시작하셔도 됩니다",
      body: "경험이 없어도, 아이템이 없어도, 자금이 없어도 괜찮습니다. 아이템 찾기부터 첫 매출까지 전문 사업가가 곁에서 함께합니다. WMTO는 선교사님의 자립을 위해 끝까지 최선을 다해 돕겠습니다.",
      cta: { label: "자립 상담 신청", href: "/apply?type=partner_consult" },
    },
    trust: {
      title: "믿고 함께하실 수 있도록",
      items: [
        {
          name: "운영",
          text: "크리스천 사업가 운영위원회가 이끌고, IM선교회와 함께 세워갑니다",
        },
        {
          name: "훈련 거점",
          text: "숙소와 강의실을 갖춘 필리핀 선교본부",
          photo: true,
        },
        {
          name: "재정",
          text: "모든 후원금과 순환 기금 사용 내역을 투명하게 공개합니다",
        },
      ],
      board: "운영위원",
      boardPlaceholder: "운영위원 소개가 준비 중입니다",
    },
    faq: {
      title: "자주 묻는 질문",
      items: [
        {
          q: "제 업종도 참여할 수 있나요?",
          a: "네. 기술 전수뿐 아니라 경영 코칭, 판로 연결, 전문 자문으로 어떤 업종이든 함께하실 수 있습니다.",
        },
        {
          q: "시간을 많이 내야 하나요?",
          a: "격주 60분 온라인 모임이 기본이며, 캠프와 멘토링은 가능한 만큼 참여하시면 됩니다.",
        },
        {
          q: "선교사님 사업이 실패하면 어떻게 되나요?",
          a: "멘토가 끝까지 동행하며, 부득이한 경우 사정을 살펴 기금 상환을 면제할 수 있습니다.",
        },
        {
          q: "후원금은 어디에 쓰이나요?",
          a: "선교사 캠프 참가비·항공료와 창업 순환 기금에 쓰이며, 사용 내역은 정기적으로 보고됩니다.",
        },
        {
          q: "선교사님은 비용을 내야 하나요?",
          a: "부담이 되지 않는 선에서 일부만 부담하시고, 나머지는 후원으로 지원합니다.",
        },
      ],
    },
    final: {
      title: "1기 필리핀 훈련 캠프,\n함께 시작할 분들을 찾습니다",
      body: "먼저 와서 보세요. 격주 온라인 모임에 부담 없이 참관하실 수 있습니다.",
      buttons: [
        { label: "온라인 모임 참관 신청", href: "/apply?type=observe" },
        { label: "자립 상담 신청", href: "/apply?type=partner_consult" },
        { label: "후원하기", href: "/sponsor" },
      ],
    },
  },

  about: {
    top: { title: "More Blessed to Give", sub: "주는 것이 받는 것보다 복이 있다 - 사도행전 20:35" },
    who: {
      title: "크리스천 사업가들이 세운 자립 선교 네트워크",
      body: "WMTO(Work Mission Tentmaking Organization)는 하나님께 받은 사업의 지혜와 경험을 선교지에 흘려보내기 위해 모인 크리스천 사업가, 선교사, 후원자들의 공동체입니다.",
    },
    vision: {
      title: "모든 선교사가 스스로 일어서는 선교",
      body: "우리는 선교사님들이 후원의 크기에 사역이 흔들리지 않고, 선교지에서 스스로 일어서서 복음을 오래 전하는 미래를 꿈꿉니다.",
    },
    mission: {
      title: "배우고, 시작하고, 자립하도록",
      items: [
        "크리스천 사업가의 기술과 경험을 선교사에게 전합니다",
        "필리핀 훈련 캠프로 선교지에 맞는 사업을 준비시킵니다",
        "순환 기금으로 시작을 돕고, 멘토링으로 끝까지 동행합니다",
        "자립한 선교사가 다음 선교사를 세우는 선순환을 만듭니다",
      ],
    },
    different: {
      title: "얻기 위해서가 아니라, 주기 위해 모입니다",
      body: "많은 비즈니스 네트워크가 더 많이 얻기 위해 모입니다. WMTO는 이미 받은 것을 나누기 위해 모입니다. 그러나 주는 자에게도 복이 있습니다. 같은 마음의 사업가들과의 신뢰, 선교의 열매를 직접 보는 기쁨, 사업을 사명으로 바라보는 새로운 눈이 그것입니다.",
    },
    values: {
      title: "핵심 가치",
      items: [
        { name: "Give", text: "가진 것을 기꺼이 나눕니다" },
        { name: "Walk With", text: "가르치고 끝까지 동행합니다" },
        { name: "Pass It On", text: "받은 은혜를 다음 사람에게 흘려보냅니다" },
        { name: "Transparency", text: "모든 재정과 열매를 투명하게 나눕니다" },
      ],
    },
    three: {
      title: "함께하는 세 사람",
      items: [
        { name: "사업가 (Mentor)", text: "경험을 전하는 크리스천 사업가" },
        { name: "선교사 (Partner)", text: "자립을 향해 걷는 선교사" },
        { name: "후원자 (Sponsor)", text: "길을 여는 후원자" },
      ],
    },
    ops: {
      title: "운영",
      body: "WMTO는 크리스천 사업가들이 운영위원회를 이끌고, IM선교회와 함께 세워갑니다. 한국에서 시작하여 미주와 아시아로 챕터를 넓혀갑니다.",
    },
    final: {
      title: "이 비전에 함께하시겠습니까?",
      buttons: [
        { label: "가르치고 싶어요", href: "/mentor" },
        { label: "후원하고 싶어요", href: "/sponsor" },
        { label: "자립을 시작하고 싶어요", href: "/partner" },
      ],
    },
  },

  mentor: {
    top: {
      title: "당신의 경험이\n선교사의 내일이 됩니다",
      sub: "크리스천 사업가로서 걸어온 길, 그 자체가 선교지에 가장 필요한 자원입니다.",
    },
    why: {
      title: "선교지에 필요한 건 설교만이 아닙니다",
      body: "가격을 정하는 법, 손님을 모으는 법, 장부를 쓰는 법. 당신에게는 당연한 것들이 선교사님에게는 자립의 첫걸음입니다. 수십 년의 시행착오를 몇 시간의 강의로 나눌 수 있다면, 그것은 어떤 후원보다 오래 남는 선물입니다.",
    },
    ways: {
      title: "어떤 사업을 하시든, 함께할 자리가 있습니다",
      sub: "가르칠 기술이 없어도 괜찮습니다. 사업을 해오신 그 경험 자체가 필요합니다.",
      items: [
        {
          name: "기술 전수",
          en: "Skill Mentor",
          text: "미용, 요리·제빵, 커피, 공예, 사진·영상, 홈페이지 제작 등 선교지에서 바로 시작할 수 있는 기술을 가르칩니다. 필리핀 캠프의 강사로 섬깁니다.",
        },
        {
          name: "경영 코칭",
          en: "Business Coach",
          text: "회계, 가격 책정, 마케팅, 고객·직원 관리, 사업 계획. 업종과 관계없이 사업을 운영해 본 모든 분이 하실 수 있습니다.",
        },
        {
          name: "판로 연결",
          en: "Channel Partner",
          text: "선교지에서 만든 커피와 수공예품을 구매하고, 유통하고, 거래처에 소개해 주십시오. 강의보다 강력한 도움이 됩니다.",
        },
        {
          name: "전문 자문",
          en: "Advisor",
          text: "법률, 세무, 무역, 의료 등 전문 지식이 필요할 때 상담으로 돕습니다.",
        },
      ],
      closing:
        "가입하실 때 원하시는 방식을 선택하시면, 꼭 맞는 선교사님과 연결해 드립니다.",
    },
    how: {
      title: "당신의 시간에 맞춰 함께합니다",
      items: [
        { name: "격주 온라인 모임 (60분)", text: "선교사 현장 보고와 강의" },
        { name: "월 1회 오프라인 모임", text: "사업가들의 교제와 실습" },
        { name: "1:1 멘토링 (월 1회)", text: "선교사 한 분과 동행" },
        {
          name: "필리핀 훈련 캠프 (1~2주)",
          text: "Skill Mentor와 Business Coach가 직접 가서 가르치는 기술 선교",
        },
        { name: "연 1회 글로벌 컨퍼런스", text: "" },
      ],
    },
    gain: {
      title: "주는 자가 받는 복",
      items: [
        "같은 마음을 가진 크리스천 사업가들과의 신뢰 네트워크",
        "내 경험이 한 가정의 자립으로 열매 맺는 것을 직접 보는 기쁨",
        "선교지와 연결된 새로운 사업 기회",
        "사업을 사명으로 바라보는 새로운 관점",
      ],
    },
    stages: {
      title: "씨앗에서 열매까지",
      items: [
        { name: "Seed", text: "오리엔테이션과 함께 시작합니다" },
        { name: "Sower", text: "선교사 한 분의 멘토가 됩니다" },
        { name: "Harvester", text: "선교사의 자립에 함께합니다" },
        { name: "Elder", text: "챕터를 이끌고 다음 멘토를 세웁니다" },
      ],
    },
    fee: {
      title: "회비",
      labels: ["회비", "순환 기금"],
      lines: ["가입비 20만 원 · 연회비 70만 원", "회비의 30%는 선교사 창업 순환 기금으로 적립됩니다"],
    },
    final: {
      title: "먼저 와서 보세요",
      body: "가입 전, 온라인 모임에 한 번 참관해 보세요. 선교사님들의 이야기를 직접 들어보시면 됩니다.",
      buttons: [
        { label: "온라인 모임 참관 신청", href: "/apply?type=observe" },
        { label: "Mentor 가입 문의", href: "/apply?type=mentor_join" },
        { label: "나에게 맞는 참여 방식 상담", href: "/apply?type=mentor_join" },
      ],
    },
  },

  partner: {
    top: {
      title: "선교사님, 이제\n혼자 버티지 않으셔도 됩니다",
      sub: "자립 선교의 길, WMTO가 처음부터 끝까지 함께 걷겠습니다.",
    },
    empathy: {
      title: "\"제가 사업을 할 수 있을까요?\"",
      body: "많은 선교사님들이 같은 질문을 하십니다. 사업은 배워본 적이 없고, 실패하면 사역까지 흔들릴까 두렵습니다. 그 마음, 충분히 압니다. 그래서 WMTO가 있습니다.",
    },
    assure: {
      title: "누구나 할 수 있습니다. 혼자 하지 않기 때문입니다",
      items: [
        { name: "경험이 없어도 괜찮습니다", text: "기초부터 가르칩니다" },
        { name: "아이템이 없어도 괜찮습니다", text: "함께 찾습니다" },
        { name: "자금이 없어도 괜찮습니다", text: "순환 기금이 있습니다" },
        { name: "막히면 물어볼 곳이 있습니다", text: "전담 멘토가 동행합니다" },
      ],
    },
    stages: {
      title: "한 걸음씩, 부담 없이",
      items: [
        { name: "Ready", text: "나에게 맞는 사업을 찾고 준비합니다 (아카데미 무료)", detail: "처음에는 아이템도 계획도 없어도 됩니다. 아카데미 영상으로 사업의 기본부터 천천히 익힙니다.", points: ["아카데미 온라인 강의는 무료입니다", "나에게 맞는 사업 아이템을 함께 찾습니다", "격주 온라인 모임에서 사업가들을 만납니다"] },
        { name: "Launch", text: "필리핀 캠프에서 배우고 사업을 시작합니다 (멘토 배정, 순환 기금 신청)", detail: "3주 캠프를 마치면 담당 멘토가 정해지고, 사업 계획서를 심사받아 창업 자금을 신청할 수 있습니다.", points: ["필리핀 캠프 3주: 기초, 전문 트랙, 계획서 완성", "담당 멘토가 배정되어 끝까지 동행합니다", "순환 기금 100만~500만 원을 신청합니다 (무이자, 심사 후)"] },
        { name: "Growing", text: "첫 매출이 생기고 사업이 자랍니다 (2차 지원, 판로 연결)", detail: "첫 매출이 생기면 사업이 더 자라도록 한 걸음 더 돕습니다.", points: ["2차 지원으로 사업을 넓혀 갑니다", "시장과 손님을 만나는 판로를 연결합니다", "거치 기간이 지나면 매출의 일부(5~10%)로 조금씩 갚습니다"] },
        { name: "Self-Sustaining", text: "자립을 이루고 다음 선교사의 멘토가 됩니다", detail: "사업 수입으로 사역을 이어 갈 수 있게 되었습니다. 이제는 받은 도움을 다음 사람에게 돌려줍니다.", points: ["사업 수입으로 사역을 지속합니다", "다음 선교사의 멘토로 참여합니다", "갚은 기금이 다음 선교사의 시작이 됩니다"] },
      ],
    },
    camp: {
      title: "필리핀에서 배우고, 선교지에서 시작하세요",
      body: "현직 크리스천 사업가들이 직접 와서 가르칩니다. 비즈니스 기초, 마케팅, 블로그·홈페이지 제작, 미용, 요리 등 선교지에서 바로 쓸 수 있는 기술을 집중적으로 배웁니다.",
    },
    cost: {
      title: "부담은 최소로, 책임은 함께",
      items: [
        { name: "연회비", text: "10만 원 (후원자 대납 가능)" },
        { name: "캠프 본인 부담", text: "25~40만 원 - 항공료·숙식비 나머지는 후원으로 지원" },
        { name: "창업 자금", text: "순환 기금 100만~500만 원 무이자 (거치 6~12개월, 매출에 따라 상환)" },
      ],
      note: "사업이 어려워지면 사정을 살펴 상환을 면제할 수 있습니다",
    },
    promise: {
      title: "WMTO의 약속",
      body: "선교사님의 자립은 선교의 지속입니다. 우리는 선교사님이 일어서실 때까지, 그리고 다른 선교사님을 세우실 때까지 최선을 다해 돕겠습니다.",
    },
    final: {
      title: "상담부터 시작하세요",
      body: "아직 아무것도 정하지 않으셔도 됩니다. 지금 상황을 나누는 것이 첫걸음입니다.",
      buttons: [
        { label: "자립 상담 신청", href: "/apply?type=partner_consult" },
        { label: "온라인 모임 참관", href: "/apply?type=observe" },
      ],
    },
  },

  sponsor: {
    top: {
      title: "당신의 후원이\n한 사람에서 멈추지 않습니다",
      sub: "선교사가 일어서고, 그 선교사가 또 다른 선교사를 세웁니다. 그 시작에 함께해 주세요.",
    },
    why: {
      title: "생활비가 아닌, 일어설 힘을 후원합니다",
      body: "기존 후원은 선교사님의 오늘을 지킵니다. WMTO 후원은 선교사님의 내일을 세웁니다. 배우고, 시작하고, 자립하도록 돕는 후원은 시간이 지날수록 열매가 커집니다.",
    },
    ways: {
      title: "마음에 맞는 방법으로 함께하세요",
      items: [
        { name: "선교사 1:1 후원", text: "한 선교사님의 캠프 참가비와 항공료를 지원합니다 (1인 약 150만~250만 원)" },
        { name: "캠프 장학금", text: "필리핀 훈련 캠프 운영 전체를 돕습니다 (자유 금액)" },
        { name: "순환 기금", text: "수료 선교사의 창업 자금이 되어, 상환 후 다음 선교사에게 다시 흘러갑니다" },
        { name: "정기 후원", text: "매월 1만 원부터, 꾸준히 함께합니다" },
      ],
    },
    cycle: {
      title: "한 번의 후원, 계속되는 열매",
      body: "순환 기금으로 사업을 시작한 선교사님이 자립하면, 상환금은 다음 선교사님의 시작이 됩니다. 당신의 후원 100만 원이 세 번, 네 번 흘러 여러 선교지를 세웁니다.",
    },
    report: {
      title: "후원의 열매를 직접 보실 수 있습니다",
      items: [
        "후원한 선교사님의 훈련·창업·자립 소식을 정기적으로 전해드립니다",
        "재정 사용 내역을 투명하게 공개합니다",
        "연례 컨퍼런스에 초청하며, 원하시면 필리핀 캠프 현장 방문도 가능합니다",
      ],
    },
    church: {
      title: "교회가 함께하면 더 멀리 갑니다",
      body: "교회 선교부가 소속 선교사님을 WMTO 과정에 추천하고 후원할 수 있습니다. 파송한 선교사님의 자립까지 함께 지켜보세요.",
    },
    final: {
      title: "오늘, 한 선교사님의\n시작이 되어 주세요",
      // 1단계에서는 온라인 결제 없이 두 버튼 모두 후원 문의 폼으로 연결
      buttons: [
        { label: "후원하기", href: "/apply?type=sponsor_inquiry" },
        { label: "후원 상담 문의", href: "/apply?type=sponsor_inquiry" },
      ],
    },
  },

  camp: {
    top: {
      title: "필리핀에서 배우고,\n선교지에서 시작합니다",
      sub: "현직 크리스천 사업가들이 직접 가르치는 자립 선교 집중 훈련 캠프",
    },
    intro: {
      title: "배움, 실습, 그리고 동역자를 얻는 시간",
      body: "WMTO 훈련 캠프는 필리핀 선교본부에서 열립니다. 선교사님들은 현장에서 바로 쓸 수 있는 기술을 배우고, 함께 걸어갈 멘토를 만나고, 자신만의 사업 계획을 완성해 돌아갑니다.",
    },
    overview: {
      title: "캠프 개요",
      items: [
        { name: "장소", text: "필리핀 선교본부 (숙소·강의실 완비)" },
        { name: "일정", text: "연 2회 (상반기 · 하반기)" },
        { name: "기간", text: "3주 집중 과정" },
        { name: "대상", text: "자립 선교를 준비하는 선교사님 (Ready·Launch 단계)" },
      ],
    },
    weeks: {
      title: "3주 흐름 (예시)",
      items: [
        { name: "1주차 · 기초", text: "자립 선교의 비전, 사업의 기본(가격, 회계, 고객)", detail: "처음 사업을 해 보는 분도 따라올 수 있도록 가장 기본이 되는 것부터 함께 배웁니다.", points: ["자립 선교의 비전과 사업의 마음가짐", "가격을 정하고 돈을 기록하는 법", "고객을 만나고 이야기하는 법"] },
        { name: "2주차 · 전문 트랙", text: "선택한 분야 집중 실습", detail: "내가 선교지에서 하려는 사업에 맞는 트랙을 골라, 현직 사업가 강사와 손으로 익힙니다.", points: ["비즈니스, 마케팅, 디지털, 기술(미용, 요리·제빵, 커피 등) 중 선택", "강사가 옆에서 바로 보고 고쳐 줍니다", "선교지에서 실제로 쓸 수 있는 기술에 집중합니다"] },
        { name: "3주차 · 시작 준비", text: "사업 계획서 완성, 멘토와 발표·피드백, 순환 기금 신청", detail: "3주의 마지막에는 내 사업을 직접 설명하고, 시작할 준비를 갖춘 채 선교지로 돌아갑니다.", points: ["사업 계획서를 완성합니다", "멘토 앞에서 발표하고 피드백을 받습니다", "순환 기금을 신청하고 담당 멘토와 연결됩니다"] },
      ],
    },
    tracks: {
      title: "선교지에서 바로 쓸 수 있는 기술",
      items: [
        { name: "비즈니스", text: "사업 계획, 회계, 가격 책정, 소규모 창업" },
        { name: "마케팅", text: "SNS 홍보, 온라인 판매, 브랜드 만들기" },
        { name: "디지털", text: "블로그·홈페이지 제작, 사진·영상 편집" },
        { name: "기술", text: "미용, 요리·제빵, 커피 등 (강사 구성에 따라 확대)" },
      ],
    },
    teachers: {
      title: "현장에서 검증된 사업가들이 가르칩니다",
      body: "강사는 모두 WMTO의 Skill Mentor와 Business Coach입니다. 실제로 사업을 일궈온 크리스천 사업가들이 1~2주씩 자비로 와서 자신의 경험을 나눕니다. 캠프가 끝난 후에도 멘토로 계속 동행합니다.",
    },
    cost: {
      title: "비용",
      items: [
        { name: "본인 부담", text: "25~40만 원" },
        { name: "항공료·숙식비 나머지", text: "후원으로 지원" },
      ],
    },
    after: {
      title: "캠프가 끝이 아니라 시작입니다",
      items: [
        "1:1 멘토 배정, 월 1회 온라인 멘토링",
        "순환 기금 신청 자격 (100만~500만 원, 무이자)",
        "격주 온라인 모임으로 동기 선교사들과 계속 연결",
      ],
    },
    support: {
      partner: { who: "선교사님", label: "캠프 참가 신청", href: "/apply?type=camp_apply" },
      mentor: {
        who: "사업가님",
        text: "당신의 기술로 1~2주, 선교지를 섬기세요",
        label: "강사로 지원하기",
        href: "/apply?type=camp_instructor",
      },
    },
  },

  fund: {
    top: { title: "받은 은혜를\n다음 선교사에게" },
    body: "순환 기금(Pass-It-On Fund)은 캠프를 수료한 선교사님의 창업을 돕는 무이자 기금입니다. 사업이 자리 잡은 후 갚은 기금은 다음 선교사님의 시작이 됩니다.",
    termsTitle: "조건",
    terms: [
      { name: "지원 금액", text: "1차 100만~500만 원" },
      { name: "이자", text: "무이자" },
      { name: "거치 기간", text: "6~12개월" },
      { name: "상환", text: "매출의 5~10%, 2~3년에 걸쳐" },
      { name: "동행", text: "담당 멘토가 함께합니다" },
    ],
    safetyTitle: "안전장치",
    safety: [
      "사업 실패 시 사정을 살펴 상환 면제 가능",
      "상환 실적이 있으면 2차 지원 신청 가능",
    ],
    status: {
      title: "순환 현황",
      text: "이 기금으로 세워진 선교사 ○명 · 지금까지 흘러간 기금 ○원",
      note: "실제 데이터는 추후 연결됩니다",
    },
    cta: { label: "순환 기금 후원하기", href: "/apply?type=sponsor_inquiry" },
  },

  stories: {
    title: "열매 이야기",
    empty: "아직 등록된 이야기가 없습니다. 곧 첫 열매 이야기를 전해드리겠습니다.",
    observeCta: "온라인 모임 참관 신청",
    finalTitle: "다음 이야기의 주인공이 되어 주세요",
    finalBody: "사업가로, 선교사로, 후원자로 함께해 주세요.",
    finalButtons: [
      { label: "사업가로 동참하기", href: "/mentor" },
      { label: "자립 상담 신청", href: "/apply?type=partner_consult" },
    ],
    emptyTitle: "첫 열매 이야기를 준비하고 있습니다",
    emptyBody: "실제 사례가 생기면 이곳에 전해드립니다. 그 전에 격주 온라인 모임에서 선교사님들의 이야기를 직접 들어 보세요.",
    example: "예시",
  },

  events: {
    title: "함께 모이는 시간",
    empty: "지금 등록된 개별 일정은 없습니다. 아래 정기 모임을 확인해 주세요.",
    observe: "참관 신청",
    zoom: "Zoom 링크",
    finalTitle: "먼저 와서 보세요",
    finalBody: "격주 온라인 모임에 부담 없이 참관하실 수 있습니다.",
    finalButtons: [
      { label: "온라인 모임 참관 신청", href: "/apply?type=observe" },
      { label: "문의하기", href: "/apply?type=contact" },
    ],
    regularTitle: "정기 모임",
    // docs/00-wmto-overview.md 7~8장
    regular: [
      { name: "격주 온라인 모임", text: "60분. 60초 자기소개, 선교사 현장 보고, 사업가 강의로 진행합니다." },
      { name: "월 1회 오프라인 모임", text: "챕터별로 만나 교제하고 실습 워크숍을 함께합니다." },
      { name: "필리핀 훈련 캠프", text: "연 2회, 3주 집중 과정. 선교지에 맞는 사업을 준비합니다." },
      { name: "글로벌 컨퍼런스", text: "연 1회. 챕터와 나라를 넘어 한자리에 모입니다." },
    ],
    types: {
      online: "온라인 모임",
      offline: "오프라인 모임",
      camp: "캠프",
      conference: "컨퍼런스",
    },
  },

  apply: {
    title: "신청·문의",
    sub: "남겨주시면 확인 후 연락드리겠습니다.",
    typeLabel: "문의 유형",
    types: {
      observe: { title: "온라인 모임 참관 신청", name: "온라인 모임 참관" },
      mentor_join: { title: "사업가 가입 문의", name: "사업가 가입 문의" },
      partner_consult: { title: "자립 상담 신청", name: "자립 상담" },
      camp_apply: { title: "캠프 참가 신청", name: "캠프 참가" },
      camp_instructor: { title: "캠프 강사 지원", name: "캠프 강사 지원" },
      sponsor_inquiry: { title: "후원 문의", name: "후원 문의" },
      contact: { title: "일반 문의", name: "일반 문의" },
    },
    fields: {
      name: "이름",
      email: "이메일",
      phone: "연락처",
      country: "거주 국가",
      message: "메시지",
      role: "역할",
      preferredSchedule: "희망 일정",
      businessName: "회사명",
      industry: "업종",
      contributionTypes: "기여 방식 (복수 선택)",
      missionField: "사역 국가·지역",
      sendingOrg: "파송 기관",
      businessIdea: "생각 중인 사업 (선택)",
      track: "희망 트랙",
      teachableFields: "가르칠 수 있는 분야",
      availability: "참여 가능 기간",
      sponsorType: "후원자 유형",
      churchName: "교회명",
      interestedKinds: "관심 후원 방식 (복수 선택)",
    },
    options: {
      role: { mentor: "사업가", partner: "선교사", sponsor: "후원자" },
      contribution: {
        skill: "기술 전수",
        coach: "경영 코칭",
        channel: "판로 연결",
        advisor: "전문 자문",
      },
      sponsorType: { individual: "개인", church: "교회" },
      sponsorKind: {
        one_to_one: "선교사 1:1 후원",
        camp: "캠프 장학금",
        fund: "순환 기금",
        monthly: "정기 후원",
      },
      track: {
        business: "비즈니스",
        marketing: "마케팅",
        digital: "디지털",
        skill: "기술",
      },
    },
    consent: "개인정보 수집·이용에 동의합니다 (필수)",
    consentHelp:
      "수집 항목: 이름, 이메일, 연락처, 거주 국가 및 입력하신 내용 / 목적: 신청 접수와 안내 / 보관: 목적 달성 시까지",
    select: "선택",
    errorTitle: "제출하지 못했습니다",
    submit: "보내기",
    submitting: "보내는 중…",
    thanks: {
      title: "감사합니다",
      body: "신청이 접수되었습니다. 확인 후 입력하신 이메일로 연락드리겠습니다.",
      back: "처음으로",
    },
    errors: {
      generic: "전송 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
      required: "필수 항목을 확인해 주세요.",
      email: "이메일 형식을 확인해 주세요.",
      consent: "개인정보 수집·이용에 동의해 주세요.",
    },
  },

  admin: {
    title: "관리자",
    login: "로그인",
    logout: "로그아웃",
    notAdmin: "관리자 권한이 없는 계정입니다.",
    applications: "신청 목록",
    events: "일정 관리",
    stories: "스토리 관리",
  },

  connect: {
    appName: "WMTO Connect",
    nav: { home: "홈", events: "일정", mentoring: "멘토링", report: "리포트", more: "더보기", profile: "내 정보" },
    login: {
      title: "로그인",
      sub: "가입 승인된 이메일로 로그인 링크를 보내드립니다.",
      email: "이메일",
      send: "로그인 링크 받기",
      sent: "메일을 확인해 주세요. 가입된 이메일이라면 로그인 링크가 도착합니다.",
      invalidLink: "링크가 만료되었거나 올바르지 않습니다. 다시 요청해 주세요.",
      inactive: "아직 활성화되지 않은 계정입니다. 승인 후 이용하실 수 있습니다.",
      notMember: "홈페이지에서 신청하신 뒤 승인되면 앱을 이용하실 수 있습니다.",
      apply: "참관·가입 신청하기",
    },
    greeting: "님, 안녕하세요",
    stageTitle: "나의 성장 단계",
    stageNames: {
      seed: "Seed", sower: "Sower", harvester: "Harvester", elder: "Elder",
      ready: "Ready", launch: "Launch", growing: "Growing", self_sustaining: "Self-Sustaining",
    },
    stageDesc: {
      seed: "오리엔테이션과 함께 시작합니다", sower: "선교사 한 분의 멘토가 됩니다",
      harvester: "선교사의 자립에 함께합니다", elder: "챕터를 이끌고 다음 멘토를 세웁니다",
      ready: "나에게 맞는 사업을 찾고 준비합니다", launch: "캠프에서 배우고 사업을 시작합니다",
      growing: "첫 매출이 생기고 사업이 자랍니다", self_sustaining: "자립을 이루고 다음 선교사의 멘토가 됩니다",
    },
    contribution: { skill: "기술 전수", coach: "경영 코칭", channel: "판로 연결", advisor: "전문 자문" },
    myMentor: "담당 멘토",
    noMentor: "아직 담당 멘토가 배정되지 않았습니다. 곧 연결해 드리겠습니다.",
    myMentees: "내 멘티 선교사",
    noMentees: "아직 배정된 선교사가 없습니다. 운영위원회가 곧 연결해 드립니다.",
    lastMentoring: "최근 멘토링",
    noMentoringYet: "기록 없음",
    latestReport: "최근 자립 리포트",
    noReportYet: "아직 없음",
    nextEvent: "다음 모임",
    noEvent: "예정된 모임이 없습니다.",
    join: "입장하기",
    reportDue: "이번 달 자립 리포트를 작성해 주세요",
    reportDone: "이번 달 자립 리포트 제출 완료",
    writeReport: "리포트 쓰기",
    sponsorHome: "후원 소식과 내역은 다음 단계에서 제공됩니다. 그동안 모임 일정은 일정 탭에서 확인하실 수 있습니다.",
    events: {
      title: "모임 일정",
      empty: "예정된 모임이 없습니다.",
      checkIn: "출석 체크",
      checkedIn: "출석 완료",
      checkInHint: "시작 30분 전부터 출석 체크가 가능합니다.",
      past: "지난 모임",
    },
    mentoring: {
      title: "멘토링 기록",
      empty: "아직 기록이 없습니다.",
      newTitle: "새 기록 작성",
      matching: "멘티 선교사",
      heldAt: "진행 일시 (한국 시간)",
      duration: "진행 시간 (분)",
      content: "나눈 내용",
      nextSteps: "다음에 할 것 (선택)",
      prayer: "기도제목 (선택)",
      save: "기록 저장",
      withMentor: "멘토",
      minutes: "분",
      noMatching: "배정된 멘티가 있어야 기록을 작성할 수 있습니다.",
    },
    report: {
      title: "자립 리포트",
      monthTitle: "월간 리포트",
      month: "대상 월",
      revenue: "이번 달 매출",
      currency: "통화",
      selfReliance: "자립도 (1 매우 낮음 ~ 5 매우 높음)",
      difficulties: "어려움",
      prayer: "기도제목",
      save: "저장",
      saved: "저장되었습니다.",
      history: "지난 리포트",
      empty: "아직 제출된 리포트가 없습니다.",
      menteeReports: "멘티 선교사 리포트",
      revenueLabel: "매출",
      reliance: "자립도",
    },
    profile: {
      title: "내 정보",
      save: "저장",
      saved: "저장되었습니다.",
      role: "역할",
      stage: "성장 단계",
      logout: "로그아웃",
      language: "언어",
      install: "홈 화면에 추가하면 앱처럼 사용할 수 있습니다.",
    },
    more: {
      title: "더보기",
      items: {
        matching: { name: "멘토 요청", text: "필요한 분야의 사업가에게 도움을 요청합니다" },
        requests: { name: "매칭 요청함", text: "나를 필요로 하는 선교사를 확인합니다" },
        referrals: { name: "리퍼럴", text: "사업가에게 고객을 소개하고 받은 소개를 확인합니다" },
        thanks: { name: "감사 편지", text: "고마운 마음을 전하고 받은 편지를 읽습니다" },
        academy: { name: "아카데미", text: "강의 영상 라이브러리" },
        growth: { name: "활동·성장", text: "이번 달 나눔과 성장 단계 기록" },
        profile: { name: "내 정보", text: "연락처와 프로필을 수정합니다" },
      },
    },
    growth: {
      title: "활동·성장",
      thisMonth: "이번 달 나눔",
      note: "점수는 순위가 아니라, 걸어온 길을 돌아보는 참고입니다.",
      scoreLabel: "활동 점수",
      labels: {
        attendance: "모임 출석", mentoring: "멘토링", reports: "자립 리포트",
        referrals: "보낸 리퍼럴", letters: "감사 편지", matchings: "진행 중인 동행",
      },
      history: "성장 기록",
      noHistory: "아직 단계 변경 기록이 없습니다.",
      suggestion: "다음 단계 기준을 충족했어요",
      suggestionNote: "운영위원회 승인 후 반영됩니다.",
    },
    request: {
      title: "멘토 요청",
      new: "도움이 필요한 분야",
      message: "어떤 도움이 필요하신가요?",
      send: "요청 보내기",
      mine: "내 요청",
      empty: "아직 보낸 요청이 없습니다.",
      status: { pending: "기다리는 중", accepted: "연결됨", cancelled: "취소됨" },
      cancel: "취소",
      incomingTitle: "매칭 요청함",
      incomingEmpty: "지금 맡을 수 있는 요청이 없습니다. 프로필의 기여 방식과 맞는 요청만 보입니다.",
      accept: "맡겠습니다",
      acceptHint: "수락하면 이 선교사와 매칭되고, 멘토링 기록을 쓸 수 있습니다.",
    },
    referral: {
      title: "리퍼럴",
      new: "고객 소개하기",
      receiver: "받을 사업가",
      client: "소개할 고객·업체",
      contact: "연락처 (선택)",
      note: "소개 내용",
      send: "소개 보내기",
      received: "받은 소개",
      sent: "보낸 소개",
      empty: "아직 소개가 없습니다.",
      noMentors: "소개를 보낼 다른 사업가가 아직 없습니다.",
      status: { sent: "전달됨", contacted: "연락함", closed: "마무리" },
      update: "상태 변경",
      from: "보낸 분",
      to: "받는 분",
    },
    thanks: {
      title: "감사 편지",
      write: "편지 쓰기",
      to: "받는 멘토",
      body: "전하고 싶은 마음",
      send: "편지 보내기",
      sent: "보낸 편지",
      received: "받은 편지",
      empty: "아직 편지가 없습니다.",
      noMentor: "담당 멘토가 배정되면 감사 편지를 쓸 수 있습니다.",
      newBadge: "새 편지",
    },
    academy: {
      title: "아카데미",
      empty: "등록된 강의가 아직 없습니다.",
      watch: "시청하기",
      uncategorized: "기타",
    },
    side: { network: "네트워크", activity: "활동", report: "리포트", learn: "배우기" },
    dash: {
      chartTitle: "최근 6개월의 나눔",
      chartNote: "숫자는 순위가 아니라, 걸어온 길을 돌아보는 기록입니다.",
      chartUnit: "{n}건",
      chartAria: "월별 나눔 기록",
      statsTitle: "이번 달",
      upcoming: "다가오는 모임",
      seeAll: "전체 보기",
      profileTitle: "프로필을 채워 주세요",
      profileHint: "서로를 더 잘 알 수 있도록 아래 항목을 채워 주세요.",
      profileCta: "내 정보 수정",
      profileFields: {
        phone: "연락처", country: "거주 국가", business_name: "사업체 이름", industry: "업종", contribution_types: "기여 방식",
        mission_field: "선교지", sending_org: "파송 기관", business_idea: "사업 아이디어", sponsor_type: "후원자 유형", church_name: "교회 이름",
      },
      shortcuts: "바로가기",
      sc: {
        report: "자립 리포트 쓰기", mentoring: "멘토링 기록", growth: "나눔·성장 보기",
        referral: "고객 소개하기", thanks: "감사 편지", academy: "강의 보기",
      },
    },
    sponsor: {
      group: "후원",
      navGiving: "후원 내역", navNews: "선교사 소식", navFund: "순환 기금",
      giving: {
        title: "후원 내역",
        sub: "함께해 주신 마음이 선교사님의 자립으로 이어집니다.",
        total: "누적 후원", thisYear: "올해 후원", partners: "후원 중인 선교사", gifts: "후원 횟수",
        since: "{d}부터 함께해 주고 계십니다",
        list: "내역", general: "선교회 전체 사역",
        empty: "아직 후원 내역이 없습니다. 후원에 참여하시면 이곳에서 사용 내역과 열매를 확인하실 수 있습니다.",
        kinds: { one_to_one: "선교사 1:1 후원", camp: "캠프 장학금", fund: "순환 기금", monthly: "정기 후원" },
        receiptNote: "기부금 영수증은 준비되는 대로 이곳에서 내려받으실 수 있습니다.",
      },
      news: {
        title: "선교사 소식",
        sub: "후원하신 선교사님의 걸음을 전해 드립니다.",
        empty: "후원하신 선교사님이 생기면 이곳에 소식이 모입니다. 선교사 1:1 후원으로 한 분의 걸음에 함께해 보세요.",
        stage: "성장 단계", reliance: "자립도", prayer: "기도제목", noReport: "아직 이번 달 소식이 없습니다.",
        given: "지금까지 후원", stageUp: "{d}에 다음 단계로 올라갔어요", report: "{m} 소식",
        relianceLabels: ["", "막 시작했어요", "걸음을 떼고 있어요", "자리를 잡아 가요", "꾸준히 자라고 있어요", "스스로 서 있어요"],
      },
      fund: {
        title: "순환 기금 흐름",
        sub: "빌려드린 기금이 갚아져서 다음 선교사님의 시작이 되고 있습니다.",
        lent: "빌려드린 기금", repaid: "갚아 주신 기금", reflowed: "다음 선교사에게 다시 흘러간 기금",
        started: "시작한 선교사", active: "진행 중인 대여", ratio: "상환 비율",
        note: "모든 기금 사용 내역은 투명하게 공개합니다. 선교사님의 개인 정보는 보호됩니다.",
        empty: "아직 기금 대여 내역이 없습니다. 첫 선교사님이 사업을 시작하면 이곳에 흐름이 보입니다.",
        people: "{n}명", loans: "{n}건",
      },
      home: {
        newsLine: "후원하신 선교사님의 새 소식이 {n}건 있어요", newsCta: "소식 보기",
        latest: "최근 소식", fundTitle: "순환 기금", fundLine: "갚아 주신 기금 {a} 중 {b}이 다음 선교사님의 시작이 되었습니다.",
        giveHint: "선교사 1:1 후원을 시작하시면 이곳에서 선교사님의 소식을 받아 보실 수 있습니다.",
      },
    },
    demo: {
      title: "WMTO Connect 체험하기",
      sub: "사업가, 선교사, 후원자의 화면을 가상 데이터로 둘러보세요.",
      points: [
        "로그인이나 가입 없이 버튼 한 번으로 들어갑니다.",
        "안에서 위쪽 막대의 사업가, 선교사, 후원자를 눌러 모드를 바꿔 볼 수 있습니다.",
        "사업가 50명, 선교사 20명의 가상 활동(매칭, 멘토링 기록, 리퍼럴, 감사 편지, 후원)이 들어 있습니다.",
        "읽기 전용입니다. 무엇을 눌러도 저장되거나 바뀌지 않습니다.",
      ],
      entering: "입장하는 중…",
      enter: "체험 시작하기",
      note: "모든 이름과 내용은 시연을 위한 가상 데이터입니다.",
      empty: "아직 데모 데이터가 준비되지 않았습니다. 관리자에게 문의해 주세요.",
      failed: "데모를 열지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
      bar: "체험 중 (읽기 전용)",
      modes: "보기 모드",
      exit: "나가기",
    },
    today: {
      title: "오늘 할 일",
      report: "이번 달 자립 리포트를 아직 쓰지 않았어요", reportCta: "리포트 쓰기",
      event: "곧 모임이 시작돼요", eventCta: "모임 보기",
      requests: "도움을 기다리는 매칭 요청이 있어요", requestsCta: "요청 보기",
      unread: "읽지 않은 감사 편지가 도착했어요", unreadCta: "편지 읽기",
      mentoring: "한 달 넘게 멘토링 기록이 없는 동행이 있어요", mentoringCta: "기록 남기기",
      thanks: "도움 받은 일을 한 줄로 전해 보세요", thanksCta: "감사 편지 쓰기",
      rest: "오늘 꼭 할 일은 없어요. 평안한 하루 되세요.",
    },
    pending: { requests: "새 매칭 요청", unread: "읽지 않은 감사 편지", requestsLine: "새 매칭 요청 {n}건", unreadLine: "읽지 않은 감사 편지 {n}통" },
    select: "선택",
    emailError: "이메일을 확인해 주세요.",
    errors: { generic: "저장 중 문제가 생겼습니다. 다시 시도해 주세요." },
  },

  photo: {
    placeholder: "사진 자리",
  },
};

export type Messages = typeof ko;
