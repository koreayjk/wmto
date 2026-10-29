"use client";

import { useFormStatus } from "react-dom";

/** 눌렀을 때 바로 "처리 중" 표시를 보여 주는 제출 버튼 */
export function PendingButton({ children, pending: label, className = "" }: { children: React.ReactNode; pending: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} aria-busy={pending} className={`${className} disabled:cursor-wait disabled:opacity-70`}>
      {pending ? label : children}
    </button>
  );
}
