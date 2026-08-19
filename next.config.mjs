/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 开启 SWC minify，比 terser 快 7 倍
  swcMinify: true,
  // 生产构建输出压缩
  compress: true,
  // 图片远程域名（Supabase Storage）
  images: {
    formats: ["image/webp"],
  },
  // 生产模式优化 bundle 分析辅助：避免单 chunk 过大
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },
  // 预渲染策略：强制字体文件 preload，避免 FOUC
  poweredByHeader: false,
  generateEtags: true,
  // HTTP 缓存静态资源
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff|woff2|ttf|eot|otf)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
