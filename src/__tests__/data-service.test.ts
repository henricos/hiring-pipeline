import fs from "fs";
import { describe, test, expect, vi, afterEach } from "vitest";

vi.mock("../lib/env", () => ({
  env: { DATA_PATH: "/tmp/test-data-service" },
}));

describe("data-service", () => {
  afterEach(() => {
    vi.resetModules();
    if (fs.existsSync("/tmp/test-data-service")) {
      fs.rmSync("/tmp/test-data-service", { recursive: true });
    }
  });

  test("validateDataPath: encerra processo quando DATA_PATH não existe", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { validateDataPath } = await import("../lib/data-service");
    expect(() => validateDataPath()).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("DATA_PATH");
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("ensureSubdir: cria subpasta automaticamente se não existir", async () => {
    fs.mkdirSync("/tmp/test-data-service", { recursive: true });
    const { ensureSubdir } = await import("../lib/data-service");
    const result = ensureSubdir("profiles");
    expect(result).toBe("/tmp/test-data-service/profiles");
    expect(fs.existsSync("/tmp/test-data-service/profiles")).toBe(true);
  });

  test("ensureSubdir: idempotente — não falha se subpasta já existe", async () => {
    fs.mkdirSync("/tmp/test-data-service/vacancies", { recursive: true });
    const { ensureSubdir } = await import("../lib/data-service");
    expect(() => ensureSubdir("vacancies")).not.toThrow();
  });
});
