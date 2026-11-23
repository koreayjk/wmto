"use client";

import { useRef, useState } from "react";

/** 1:1 인증 사진: 고른 사진을 브라우저에서 1280px 이내로 줄여 폼에 담습니다. */
export function ProofPhotoInput({ name, required, labels }: { name: string; required?: boolean; labels: { choose: string; change: string; hint: string } }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bmp.width * k); canvas.height = Math.round(bmp.height * k);
      canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const blob: Blob = await new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail()), "image/jpeg", 0.82));
      const dt = new DataTransfer();
      dt.items.add(new File([blob], "proof.jpg", { type: "image/jpeg" }));
      e.target.files = dt.files;
      setPreview(URL.createObjectURL(blob));
    } catch { /* 원본 그대로 전송 */ }
  }

  return (
    <div>
      <input ref={input} type="file" name={name} accept="image/*" capture="environment" required={required} className="sr-only" onChange={onPick} />
      <button type="button" onClick={() => input.current?.click()} className="flex w-full items-center gap-4 rounded-2xl bg-tint px-4 py-3 text-left">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-2xl text-soft ring-1 ring-black/5">＋</span>
        )}
        <span><b className="block text-sm font-medium">{preview ? labels.change : labels.choose}</b><span className="mt-0.5 block text-xs leading-relaxed text-soft">{labels.hint}</span></span>
      </button>
    </div>
  );
}
