/**
 * WMTO 표는 별도 스키마에 있습니다. SVM 등 다른 서비스와 한 Supabase 프로젝트를 나눠 써도 겹치지 않습니다.
 * Dashboard > Project Settings > API > Exposed schemas 에 같은 이름을 추가해야 합니다.
 */
export const DB_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "wmto";
