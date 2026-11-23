"use client";

export function PrintButton({ label }: { label: string }) {
  return <button type="button" onClick={() => window.print()} className="cbtn cbtn-quiet cbtn-sm print:hidden">{label}</button>;
}
