import { photos, photoPosition, type PhotoKey } from "@/lib/photos";
import { getMessages } from "@/lib/i18n";

/** 부모를 가득 채우는 사진. 부모는 relative + overflow-hidden. 사진이 없으면 자리표시. */
export function Photo({ name, alt = "", priority = false }: { name: PhotoKey; alt?: string; priority?: boolean }) {
  const src = photos[name];
  return (
    <div className="absolute inset-0" aria-hidden={alt === ""}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
          style={{ objectPosition: photoPosition[name] ?? "50% 50%" }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="photo-fallback h-full w-full">
          {process.env.NODE_ENV !== "production" && (
            <span className="absolute bottom-3 right-4 text-[11px] text-ink/40">
              {getMessages().photo.placeholder} / {name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** 비율이 고정된 사진 프레임 */
export function PhotoFrame({ name, ratio = "aspect-[4/3]", alt, className = "" }: { name: PhotoKey; ratio?: string; alt?: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${ratio} ${className}`}>
      <Photo name={name} alt={alt} />
    </div>
  );
}
