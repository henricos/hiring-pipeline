import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";
import { normalizeBasePath } from "./src/lib/base-path";

const appVersion =
  process.env.APP_VERSION ?? process.env.npm_package_version ?? packageJson.version;

let gitHash = "dev";
try {
  gitHash =
    process.env.NEXT_PUBLIC_GIT_HASH ??
    execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  // sem git disponível (ex: build em container sem histórico)
  gitHash = process.env.NEXT_PUBLIC_GIT_HASH ?? "dev";
}

const configuredBasePath = process.env.APP_BASE_PATH
  ? normalizeBasePath(process.env.APP_BASE_PATH)
  : undefined;

const nextBasePath =
  configuredBasePath && configuredBasePath !== "/" ? configuredBasePath : undefined;

const nextConfig: NextConfig = {
  basePath: nextBasePath,
  devIndicators: false,
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
};

export default nextConfig;
