import { photos, type PhotoKey } from "@/lib/photos";
import { getMessages } from "@/lib/i18n";

/** 풀블리드 배경 사진. 사진이 없으면 자리표시 그라데이션. 부모는 relative + overflow-hidden. */
export function Photo({
  name,
  alt = "",
  drift = false,
  overlay = "bg-night/45",
  showLabel = true,
}: {
  name: PhotoKey;
  alt?: string;
  drift?: boolean;
  overlay?: string;
  showLabel?: boolean;
}) {
  const src = photos[name];
  return (
    <div className="absolute inset-0" aria-hidden={alt === ""}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={`h-full w-full object-cover ${drift ? "drift" : ""}`} />
      ) : (
        <div className={`photo-fallback h-full w-full ${drift ? "drift" : ""}`}>
          {showLabel && process.env.NODE_ENV !== "production" && (
            <span className="absolute bottom-3 right-4 text-[11px] tracking-widest text-white/40">
              {getMessages().photo.placeholder} · {name}
            </span>
          )}
        </div>
      )}
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}
