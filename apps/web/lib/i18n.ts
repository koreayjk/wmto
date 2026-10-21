import { ko, type Messages } from "@/messages/ko";

export type Locale = "ko";
export const defaultLocale: Locale = "ko";

const catalogs: Record<Locale, Messages> = { ko };

// 영어 추가 시: messages/en.ts 를 만들고 Locale 과 catalogs 에 등록한 뒤
// 라우팅(예: /en)에서 locale 을 넘겨주면 됩니다.
export function getMessages(locale: Locale = defaultLocale): Messages {
  return catalogs[locale];
}
