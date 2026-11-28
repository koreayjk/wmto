import dict from "./demo-en.json";

/**
 * 영어 화면에서 데모 데이터(한국어로 저장된 가상 회원·사업장·기록)를 영어로 바꿔 보여 줍니다.
 * 데이터베이스 값은 그대로 두고, 읽어 온 응답의 문자열 중 데모 사전에 정확히 일치하는 것만 바꿉니다.
 * 사람 이름은 데모 성·이름 목록에 있는 것만 로마자로 바꿉니다. 실제 회원의 글은 건드리지 않습니다.
 */
const SURNAMES: Record<string, string> = {
  김: "Kim", 이: "Lee", 박: "Park", 최: "Choi", 정: "Jung", 강: "Kang", 조: "Cho", 윤: "Yoon", 장: "Jang", 임: "Lim",
  한: "Han", 오: "Oh", 서: "Seo", 신: "Shin", 권: "Kwon", 황: "Hwang", 안: "Ahn", 송: "Song", 류: "Ryu", 홍: "Hong",
};
const GIVENS = ["민준","서연","지훈","하은","도윤","수빈","예준","지우","현우","채원","주원","소영","태양","은지","성민","유진","동현","미래","재현","나연","승우","혜진","준서","다은","시우","가영","건우","보람","영호","지은","상훈","민서","진우","세린","태호","은서","용준","하린","기범","소희"];

const L = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const V = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const T = ["","k","k","k","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"];

function romanizeSyllables(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) { out += ch; continue; }
    out += L[Math.floor(c / 588)] + V[Math.floor((c % 588) / 28)] + T[c % 28];
  }
  return out;
}


// 나라·시도·구 이름(조합 문구 안에서 쓰입니다). 시·도 이름 단독은 입력칸 값과 같아서 바꾸지 않습니다.
const COUNTRIES: Record<string, string> = {가나:"Ghana",과테말라:"Guatemala",나이지리아:"Nigeria",네팔:"Nepal",대한민국:"South Korea",도미니카공화국:"Dominican Republic",동티모르:"Timor-Leste",라오스:"Laos",러시아:"Russia",마다가스카르:"Madagascar",말라위:"Malawi",말레이시아:"Malaysia",모로코:"Morocco",모잠비크:"Mozambique",몽골:"Mongolia",미국:"USA",미얀마:"Myanmar",방글라데시:"Bangladesh",베트남:"Vietnam",볼리비아:"Bolivia",불가리아:"Bulgaria",브라질:"Brazil",세네갈:"Senegal",스리랑카:"Sri Lanka",아이티:"Haiti",에콰도르:"Ecuador",에티오피아:"Ethiopia",요르단:"Jordan",우간다:"Uganda",우즈베키스탄:"Uzbekistan",우크라이나:"Ukraine",이집트:"Egypt",인도:"India",인도네시아:"Indonesia",일본:"Japan",잠비아:"Zambia",중국:"China",짐바브웨:"Zimbabwe",카자흐스탄:"Kazakhstan",캄보디아:"Cambodia",캐나다:"Canada",케냐:"Kenya",콜롬비아:"Colombia",콩고민주공화국:"DR Congo",키르기스스탄:"Kyrgyzstan",탄자니아:"Tanzania",태국:"Thailand",튀르키예:"Türkiye",파키스탄:"Pakistan",파푸아뉴기니:"Papua New Guinea",페루:"Peru",피지:"Fiji",필리핀:"Philippines",호주:"Australia",한국:"Korea",미주:"Americas"};
const REGIONS: Record<string, string> = {서울:"Seoul",경기도:"Gyeonggi-do",강원도:"Gangwon-do",경상남도:"Gyeongsangnam-do",경상북도:"Gyeongsangbuk-do",전라남도:"Jeollanam-do",전라북도:"Jeollabuk-do",충청남도:"Chungcheongnam-do",충청북도:"Chungcheongbuk-do",제주도:"Jeju-do",광주:"Gwangju",대구:"Daegu",대전:"Daejeon",부산:"Busan",인천:"Incheon",울산:"Ulsan",세종:"Sejong"};
const DISTRICTS: Record<string, string> = {강남구:"Gangnam-gu",강동구:"Gangdong-gu",강서구:"Gangseo-gu",고양시:"Goyang",달라스:"Dallas",마닐라:"Manila",마포구:"Mapo-gu",부천시:"Bucheon",북구:"Buk-gu",서초구:"Seocho-gu",성남시:"Seongnam",성북구:"Seongbuk-gu",송파구:"Songpa-gu",수성구:"Suseong-gu",수영구:"Suyeong-gu",수원시:"Suwon",시드니:"Sydney",시애틀:"Seattle",안양시:"Anyang",연수구:"Yeonsu-gu",영등포구:"Yeongdeungpo-gu",용인시:"Yongin",유성구:"Yuseong-gu",전주시:"Jeonju",제주시:"Jeju City",창원시:"Changwon",천안시:"Cheonan",춘천시:"Chuncheon",토론토:"Toronto",해운대구:"Haeundae-gu",유성:"Yuseong",강남:"Gangnam",해운대:"Haeundae"};
const PHRASES: [string, string][] = [
  ["오늘 저녁 온라인 모임", "Tonight's Online Gathering"], ["격주 온라인 모임", "Biweekly Online Gathering"], ["오프라인 모임", "Offline Gathering"], ["온라인 모임", "Online Gathering"],
  ["선교사 기도 모임", "Missionary Prayer Meeting"], ["글로벌 컨퍼런스", "Global Conference"], ["정기 모임", "Regular Gathering"], ["모임 장소", "Meeting Place"], ["훈련 캠프", "Training Camp"], ["선교본부", "Mission Base"],
  ["[데모]", "[Demo]"], ["텐트", "Tent"], ["온라인", "Online"],
];
const REGION_VALUES = new Set(Object.keys(REGIONS));
const PLACES: [string, string][] = [...Object.entries({ ...COUNTRIES, ...REGIONS, ...DISTRICTS })].sort((a, b) => b[0].length - a[0].length);
const PH: [string, string][] = [...PHRASES].sort((a, b) => b[0].length - a[0].length);
const HAN_RE = /[가-힣]/;

/** 사전에 없는 조합 문구("[데모] 서울 1텐트 정기 모임 3" 등)를 부분 번역해, 한글이 하나도 남지 않을 때만 돌려줍니다. */
function compose(s: string): string | null {
  if (REGION_VALUES.has(s)) return null; // 시·도 단독 값은 입력칸 값이라 그대로 둡니다
  if (COUNTRIES[s]) return COUNTRIES[s];
  if (DISTRICTS[s]) return DISTRICTS[s];
  let t = s.replace(/(\d+)텐트/g, "Tent $1").replace(/(\d+)기/g, "Cohort $1").replace(/(\d+)주/g, "$1 weeks");
  for (const [k, v] of PH) t = t.split(k).join(v);
  for (const [k, v] of PLACES) t = t.split(k).join(v);
  return HAN_RE.test(t) ? null : t;
}

const STREETS: Record<string, string> = { 테헤란로: "Teheran-ro", 서초대로: "Seocho-daero", 월드컵북로: "World Cup buk-ro", 올림픽로: "Olympic-ro", 공항대로: "Gonghang-daero", 영등포로: "Yeongdeungpo-ro", 동소문로: "Dongsomun-ro", 천호대로: "Cheonho-daero" };
const BIZ_PREFIX = new Set(["온유", "새벽", "소망", "감람", "다윗", "은혜", "푸른", "나눔", "믿음", "샘물"]);
const givenSet = new Set(GIVENS);
const cache = new Map<string, string>();

export function translateDemo(s: string): string {
  const hit = (dict as Record<string, string>)[s];
  if (hit) return hit;
  if (s.length === 3 && SURNAMES[s[0]] && givenSet.has(s.slice(1))) {
    const g = romanizeSyllables(s.slice(1));
    return `${SURNAMES[s[0]]} ${g[0].toUpperCase()}${g.slice(1)}`;
  }
  // 사업장 주소: 서울특별시 {구} {도로} {번지}
  const ad = /^서울특별시 (\S+) (\S+) (\d+)$/.exec(s);
  if (ad && DISTRICTS[ad[1]] && STREETS[ad[2]]) return `${ad[3]} ${STREETS[ad[2]]}, ${DISTRICTS[ad[1]]}, Seoul`;
  // 데모 소개글·키워드 템플릿
  const intro = /^(.+) 분야에서 정직과 신뢰로 고객을 섬깁니다\.$/.exec(s);
  if (intro) { const ind = (dict as Record<string, string>)[intro[1]]; if (ind) return `Serving clients in ${ind} with honesty and trust.`; }
  const kw = /^(.+), 신뢰, 소개$/.exec(s);
  if (kw) { const ind = (dict as Record<string, string>)[kw[1]]; if (ind) return `${ind}, trust, referrals`; }
  // 사업장 이름: "접두어 + 업종"(예: 푸른 사진·영상 스튜디오)
  const sp = s.indexOf(" ");
  if (sp > 0) {
    const pre = (dict as Record<string, string>)[s.slice(0, sp)];
    const rest = (dict as Record<string, string>)[s.slice(sp + 1)];
    if (pre && rest && BIZ_PREFIX.has(s.slice(0, sp))) return `${pre} ${rest}`;
  }
  return compose(s) ?? s;
}

/** 표시 전용(입력칸 값이 아닌 곳): 시·도 이름 단독도 영어로 바꿉니다. */
export const displayEn = (s: string): string => REGIONS[s] ?? translateDemo(s);

const HAN = /[가-힣]/;
function walk(v: unknown): unknown {
  if (typeof v === "string") return HAN.test(v) ? (cache.get(v) ?? (cache.set(v, translateDemo(v)), cache.get(v))) : v;
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x)]));
  return v;
}

/** supabase-js 가 쓰는 fetch 를 감싸 JSON 응답의 데모 문자열을 영어로 바꿉니다(읽기 응답 전용). */
export function englishDemoFetch(inner: typeof fetch = fetch): typeof fetch {
  return async (input, init) => {
    const res = await inner(input, init);
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("json")) return res;
    const text = await res.text();
    const h = new Headers(res.headers); h.delete("content-length"); h.delete("content-encoding");
    const out = (body: string) => new Response(body, { status: res.status, statusText: res.statusText, headers: h });
    if (!HAN.test(text)) return out(text);
    try { return out(JSON.stringify(walk(JSON.parse(text)))); } catch { return out(text); }
  };
}
