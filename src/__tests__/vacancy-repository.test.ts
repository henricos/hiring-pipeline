import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";

// Mock env antes de qualquer importação que use env
vi.mock("@/lib/env", () => ({
  env: { DATA_PATH: "/tmp/test-vacancy-repository" },
}));

// Importações dinâmicas após o mock
const { vacancyRepository } = await import(
  "@/lib/repositories/vacancy-repository"
);
const { createDefaultVacancy } = await import("@/lib/vacancy");

describe("VacancyRepository", () => {
  const testDir = path.join("/tmp/test-vacancy-repository", "vacancies");

  beforeEach(() => {
    // Garantir estado limpo entre os testes
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it("save e findById persistem a vaga corretamente", async () => {
    const vacancy = createDefaultVacancy("profile-1");
    await vacancyRepository.save(vacancy);
    const found = await vacancyRepository.findById(vacancy.id);
    expect(found).toEqual(vacancy);
  });

  it("findById retorna null para vaga inexistente", async () => {
    const found = await vacancyRepository.findById("nonexistent");
    expect(found).toBeNull();
  });

  it("list retorna todas as vagas salvas", async () => {
    const v1 = createDefaultVacancy("p1");
    const v2 = createDefaultVacancy("p2");
    await vacancyRepository.save(v1);
    await vacancyRepository.save(v2);
    const list = await vacancyRepository.list();
    expect(list).toHaveLength(2);
  });

  it("list retorna vagas ordenadas por openedAt descendente (mais recente primeiro)", async () => {
    const v1 = createDefaultVacancy("p1");
    v1.openedAt = new Date("2026-04-01").toISOString();
    const v2 = createDefaultVacancy("p2");
    v2.openedAt = new Date("2026-04-05").toISOString();

    await vacancyRepository.save(v1);
    await vacancyRepository.save(v2);

    const list = await vacancyRepository.list();
    expect(list).toHaveLength(2);
    // v2 deve aparecer primeiro (data mais recente)
    expect(list[0].openedAt > list[1].openedAt).toBe(true);
  });

  it("delete remove a vaga", async () => {
    const vacancy = createDefaultVacancy("profile-1");
    await vacancyRepository.save(vacancy);
    await vacancyRepository.delete(vacancy.id);
    const found = await vacancyRepository.findById(vacancy.id);
    expect(found).toBeNull();
  });

  it("delete não lança erro para vaga inexistente", async () => {
    await expect(
      vacancyRepository.delete("nonexistent")
    ).resolves.not.toThrow();
  });

  it("vacancyPath lança erro se o ID contém '..'", async () => {
    await expect(
      vacancyRepository.findById("../etc/passwd")
    ).rejects.toThrow();
  });
});
