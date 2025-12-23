import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  scope: process.env.NEXT_PUBLIC_SW_SCOPE ?? "/",
  register: false,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/store"],
};

export default withSerwist(nextConfig);
