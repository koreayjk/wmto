import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 md:py-40">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="display mt-3 text-[2rem] sm:text-5xl">찾으시는 페이지가 없습니다</h1>
      <p className="mt-5 max-w-xl text-lg text-soft">주소가 바뀌었거나 삭제된 페이지일 수 있습니다. 처음 화면에서 다시 찾아보세요.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/">처음으로</Button>
        <Button href="/apply?type=contact" variant="ghost">문의하기</Button>
      </div>
    </section>
  );
}
