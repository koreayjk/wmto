import Link from "next/link";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { PageTitle } from "@/components/connect/ui";

export default async function More() {
  const locale = await getPortalLocale();
  const { me } = await requireMe();
  const m = getMessages(locale).connect.more;
  const it = m.items;
  const links: { href: string; name: string; text: string }[] = [];
  if (me.role === "partner") links.push({ href: "/connect/matching", ...it.matching }, { href: "/connect/thanks", ...it.thanks });
  if (me.role === "mentor") links.push({ href: "/connect/matching", ...it.requests }, { href: "/connect/referrals", ...it.referrals }, { href: "/connect/thanks", ...it.thanks });
  links.push({ href: "/connect/academy", ...it.academy });
  if (me.role === "mentor" || me.role === "partner") links.push({ href: "/connect/growth", ...it.growth });
  links.push({ href: "/connect/profile", ...it.profile });
  return (
    <div>
      <PageTitle>{m.title}</PageTitle>
      <ul className="divide-y divide-line border-y border-line">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between gap-4 py-5">
              <span>
                <span className="block font-display text-lg font-semibold">{l.name}</span>
                <span className="text-sm text-soft">{l.text}</span>
              </span>
              <span aria-hidden className="text-clay">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
