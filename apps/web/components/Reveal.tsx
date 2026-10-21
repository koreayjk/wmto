"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

export function Reveal({
  children,
  as: Tag = "div",
  delay,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: 1 | 2 | 3;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} data-delay={delay} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
