import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    '*',
    '10.0.0.128', // 允许跨域访问的域名
    'localhost', 
    'local-origin.dev', 
    '*.local-origin.dev'
  ],
  serverExternalPackages: ["mongoose"],
  //允许的图片来源
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "img.clerk.com"
      },
      {
        protocol: 'https',
        hostname: "images.clerk.dev"
      },
      {
        protocol: 'https',
        hostname: "uploadthing.com"
      },
      {
        protocol: 'https',
        hostname: "placehold.co"
      }
    ]
  }
};

export default nextConfig;
