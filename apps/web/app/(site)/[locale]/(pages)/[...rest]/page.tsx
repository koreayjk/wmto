import { notFound } from "next/navigation";

// 정의되지 않은 주소는 모두 이 페이지로 들어와 404 화면(not-found.tsx)을 보여 줍니다.
export default function CatchAll() {
  notFound();
}
