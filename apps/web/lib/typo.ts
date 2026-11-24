/**
 * 한국어 줄바꿈 보정: 한 글자짜리 낱말(한, 두, 새, 내 …)과 다음 낱말 사이, 숫자와 단위 사이를
 * 줄바꿈하지 못하는 공백(NBSP)으로 바꿔 "한 / 분" 처럼 쌩뚱맞게 갈라지지 않게 합니다.
 */
const NBSP = " ";

export function keepKo(s: string): string {
  return s
    // 한 글자 한글 낱말 + 공백 + 다음 낱말
    .replace(/(?<=^|[\s(“"'])([가-힣])[ ]+(?=[^\s])/g, `$1${NBSP}`)
    // 숫자(또는 1:1) + 공백 + 단위·낱말
    .replace(/(\d)[ ]+(?=[가-힣])/g, `$1${NBSP}`)
    // 줄의 마지막 낱말(3글자 이하)은 앞 낱말에 붙여 한 낱말만 덩그러니 남지 않게 합니다
    .replace(/[ ]+([가-힣0-9]{1,3}[.!?]?)$/gm, `${NBSP}$1`)
    // "~ 수 있습니다" 류: 의존명사 수/것/때/중 앞 공백은 앞말에 붙입니다
    .replace(/[ ]+(?=(수|것|때|중|뿐)(?=[\s.,!?)]|$))/g, NBSP);
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export function keepKoDeep<T>(v: T, skip: ReadonlySet<string> = new Set()): T {
  const walk = (x: unknown, key?: string): unknown => {
    if (typeof x === "string") return key && skip.has(key) ? x : keepKo(x);
    if (Array.isArray(x)) return x.map((i) => walk(i, key));
    if (x && typeof x === "object") {
      return Object.fromEntries(Object.entries(x as Record<string, unknown>).map(([k, val]) => [k, walk(val, k)]));
    }
    return x;
  };
  return walk(v) as T;
}
export type { Json };
