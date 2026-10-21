import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/** 헤더·푸터가 있는 공개 페이지 묶음. 404 화면(not-found.tsx)도 이 레이아웃 안에 그려집니다. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
