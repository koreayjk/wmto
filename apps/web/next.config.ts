import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 증명사진 업로드(브라우저에서 줄여서 보냄)를 위해 서버 액션 본문 한도를 넉넉히 둡니다.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
