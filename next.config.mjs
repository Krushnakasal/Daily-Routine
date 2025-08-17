/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // pdf.worker.min.js ला asset/resource म्हणून handle करा
    config.module.rules.push({
      test: /pdf\.worker\.min\.js$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
