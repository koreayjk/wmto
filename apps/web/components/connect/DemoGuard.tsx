"use client";

import { useEffect, useState } from "react";

/**
 * 체험 모드에서는 저장이 되지 않으므로, 폼을 보내는 순간 에러 대신 안내를 보여 줍니다.
 * data-demo-allow 가 붙은 폼(언어 변경, 로그아웃)은 그대로 보냅니다.
 */
export function DemoGuard({ message }: { message: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLElement | null;
      if (!form || form.closest("[data-demo-allow]") || !form.closest("main")) return;
      e.preventDefault();
      e.stopPropagation();
      setShown(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShown(false), 5000);
    };
    document.addEventListener("submit", onSubmit, true);
    return () => { document.removeEventListener("submit", onSubmit, true); clearTimeout(timer); };
  }, []);
  if (!shown) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-md rounded-2xl bg-ink px-5 py-4 text-sm leading-relaxed text-white shadow-2xl lg:bottom-8">
      {message}
    </div>
  );
}
