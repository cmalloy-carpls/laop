import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@laop/db", "@laop/contracts"],
};

export default config;
