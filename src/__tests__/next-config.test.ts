import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

async function loadNextConfig(overrides: Partial<NodeJS.ProcessEnv> = {}) {
  Object.keys(process.env).forEach((key) => {
    if (!(key in originalEnv)) delete process.env[key];
  });
  Object.assign(process.env, originalEnv, {
    APP_VERSION: "9.9.9-test",
    NEXT_PUBLIC_GIT_HASH: "abcdef1",
  });

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  });

  vi.resetModules();

  const module = await import("../../next.config");

  return module.default;
}

afterEach(() => {
  Object.keys(process.env).forEach((key) => {
    if (!(key in originalEnv)) delete process.env[key];
  });
  Object.assign(process.env, originalEnv);
  vi.resetModules();
});

describe("next.config contract", () => {
  it("usa APP_BASE_PATH como fonte explícita do basePath", async () => {
    const config = await loadNextConfig({ APP_BASE_PATH: "/hiring-pipeline" });

    expect(config.basePath).toBe("/hiring-pipeline");
  });

  it("não hardcoda /hiring-pipeline quando APP_BASE_PATH está ausente", async () => {
    const config = await loadNextConfig({ APP_BASE_PATH: undefined });

    expect(config.basePath).toBeUndefined();
  });

  it("normaliza APP_BASE_PATH antes de expor o basePath do framework", async () => {
    const config = await loadNextConfig({ APP_BASE_PATH: "/hiring-pipeline/" });

    expect(config.basePath).toBe("/hiring-pipeline");
  });

  it("expõe NEXT_PUBLIC_APP_VERSION e NEXT_PUBLIC_GIT_HASH via env de build", async () => {
    const config = await loadNextConfig({ APP_BASE_PATH: "/hiring-pipeline" });

    expect(config.env?.NEXT_PUBLIC_APP_VERSION).toBe("9.9.9-test");
    expect(config.env?.NEXT_PUBLIC_GIT_HASH).toBe("abcdef1");
  });

  it("usa output standalone para empacotamento em container", async () => {
    const config = await loadNextConfig({ APP_BASE_PATH: "/hiring-pipeline" });

    expect(config.output).toBe("standalone");
  });
});
