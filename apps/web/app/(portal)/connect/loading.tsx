/** 화면을 옮길 때 데이터가 오기 전에 바로 보이는 뼈대 화면 */
export default function Loading() {
  const card = "cbezel";
  return (
    <div className="space-y-4" aria-busy="true" aria-label="loading">
      <div className="mb-8 mt-2 h-10 w-56 animate-pulse rounded-full bg-black/[0.06]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className={card}>
          <div className="cbezel-in space-y-3 p-7">
            <div className="h-3 w-24 animate-pulse rounded-full bg-black/[0.06]" />
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-black/[0.06]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-black/[0.05]" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-black/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}
