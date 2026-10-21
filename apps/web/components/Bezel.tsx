import type { ReactNode } from "react";

/** 이중 테두리 카드. inner 에 면 색(Tailwind 클래스)을 지정한다. */
export function Bezel({ children, inner = "bg-white", className = "", innerClassName = "" }: { children: ReactNode; inner?: string; className?: string; innerClassName?: string }) {
  return (
    <div className={`bezel ${className}`}>
      <div className={`bezel-in ${inner} ${innerClassName}`}>{children}</div>
    </div>
  );
}
