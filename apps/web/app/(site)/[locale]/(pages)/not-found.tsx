import { Button } from "@/components/ui";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale";

export default async function NotFound() {
  const m = getMessages(await getRequestLocale()).notFound;
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 md:py-40">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="display mt-3 text-[2rem] sm:text-5xl">{m.title}</h1>
      <p className="mt-5 max-w-xl text-lg text-soft">{m.body}</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/">{m.home}</Button>
        <Button href="/apply?type=contact" variant="ghost">{m.contact}</Button>
      </div>
    </section>
  );
}
