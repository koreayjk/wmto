"use client";

import { useRef, useState } from "react";

/** 증명사진 올리기: 고른 사진을 브라우저에서 480px 정사각형으로 줄여 올립니다. */
export function AvatarUploader({ action, preview, hasPhoto, name, labels }: {
  hasPhoto: boolean;
  action: (fd: FormData) => void | Promise<void>;
  preview: React.ReactNode;
  name: string;
  labels: { choose: string; change: string; hint: string; busy: string };
}) {
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const bmp = await createImageBitmap(file);
      const s = Math.min(bmp.width, bmp.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 480;
      canvas.getContext("2d")!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 480, 480);
      const blob: Blob = await new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail()), "image/jpeg", 0.85));
      const dt = new DataTransfer();
      dt.items.add(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      e.target.files = dt.files;
      setLocal(URL.createObjectURL(blob));
      form.current?.requestSubmit();
    } catch {
      setBusy(false);
    }
  }

  return (
    <form ref={form} action={action} className="flex items-center gap-5">
      <span className="relative">
        {local ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={local} alt="" width={88} height={88} className="h-[88px] w-[88px] rounded-full object-cover ring-1 ring-black/5" />
        ) : preview}
      </span>
      <span>
        <input ref={input} type="file" name="photo" accept="image/*" className="sr-only" onChange={onPick} aria-label={name} />
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="cbtn cbtn-quiet cbtn-sm disabled:opacity-60">
          {busy ? labels.busy : hasPhoto || local ? labels.change : labels.choose}
        </button>
        <span className="mt-2 block text-xs text-soft">{labels.hint}</span>
      </span>
    </form>
  );
}
