"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { localeFromPathname, localizeHref } from "@/lib/i18n";

/** 현재 언어에 맞춰 내부 링크에 /en 을 붙여 주는 Link */
export function L({ href, ...rest }: ComponentProps<typeof Link>) {
  const locale = localeFromPathname(usePathname());
  return <Link href={typeof href === "string" ? localizeHref(locale, href) : href} {...rest} />;
}
