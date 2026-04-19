import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("container packaging contract", () => {
  it("enables standalone output in Next.js", () => {
    expect(nextConfig.output).toBe("standalone");
  });

  it("builds a non-root standalone runtime image without dynamic data", () => {
    const dockerfile = readRepoFile("Dockerfile");

    expect(dockerfile).toContain("FROM node:");
    expect(dockerfile).toContain("AS builder");
    expect(dockerfile).toContain("AS runner");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("EXPOSE 3000");
    expect(dockerfile).toContain(".next/standalone");
    expect(dockerfile).toContain(".next/static");
    expect(dockerfile).toContain("AGENTS.md");
    expect(dockerfile).toContain(".agents/skills");
    // DATA_PATH deve aparecer como variável de ambiente no Dockerfile
    expect(dockerfile).toContain("DATA_PATH");
    // Dados não devem ser copiados para dentro da imagem
    expect(dockerfile).not.toMatch(/COPY\s+.*\bdata\b(?!-service)/i);
  });

  it("excludes dynamic and local-only files from the docker build context", () => {
    const dockerignore = readRepoFile(".dockerignore");

    expect(dockerignore).toContain(".git");
    expect(dockerignore).toContain("node_modules");
    expect(dockerignore).toContain(".next");
    expect(dockerignore).toContain(".env");
    // Diretório de dados locais de dev deve ser excluído do contexto Docker
    expect(dockerignore).toContain("data-local");
  });
});
