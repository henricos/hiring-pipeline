import { describe, it, expect } from "vitest";
import {
  generateVacancyId,
  createDefaultVacancy,
  VACANCY_STATUSES,
  REQUEST_TYPES,
  WORK_SCHEDULES,
  WORK_MODES,
  type Vacancy,
} from "@/lib/vacancy";

describe("generateVacancyId()", () => {
  it("retorna UUID v4 válido", () => {
    const id = generateVacancyId();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });

  it("gera IDs diferentes em chamadas consecutivas (colisão-seguro)", () => {
    const id1 = generateVacancyId();
    const id2 = generateVacancyId();
    expect(id1).not.toBe(id2);
  });
});

describe("createDefaultVacancy()", () => {
  it("retorna objeto conforme a interface Vacancy", () => {
    const profileId = "profile-123";
    const vacancy = createDefaultVacancy(profileId);
    expect(vacancy).toHaveProperty("id");
    expect(vacancy).toHaveProperty("profileId", profileId);
    expect(vacancy).toHaveProperty("status", "Aberta");
    expect(vacancy.openedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  });

  it("id da vaga padrão é UUID v4 válido", () => {
    const vacancy = createDefaultVacancy("p-1");
    expect(vacancy.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("quantidade padrão é 1", () => {
    const vacancy = createDefaultVacancy("p-1");
    expect(vacancy.quantity).toBe(1);
  });

  it("pode ser tipada como Vacancy sem erros de TypeScript", () => {
    const vacancy: Vacancy = createDefaultVacancy("p-1");
    expect(vacancy).toBeDefined();
  });
});

describe("VACANCY_STATUSES", () => {
  it("contém todos os valores de VacancyStatus", () => {
    expect(VACANCY_STATUSES).toContain("Aberta");
    expect(VACANCY_STATUSES).toContain("Em andamento");
    expect(VACANCY_STATUSES).toContain("Encerrada");
  });

  it("tem exatamente 3 itens", () => {
    expect(VACANCY_STATUSES).toHaveLength(3);
  });
});

describe("REQUEST_TYPES", () => {
  it("contém todos os valores de RequestType", () => {
    expect(REQUEST_TYPES).toContain("Recrutamento interno");
    expect(REQUEST_TYPES).toContain("Recrutamento externo");
  });

  it("tem exatamente 2 itens", () => {
    expect(REQUEST_TYPES).toHaveLength(2);
  });
});

describe("WORK_SCHEDULES", () => {
  it("contém todos os valores de WorkSchedule", () => {
    expect(WORK_SCHEDULES).toContain("Das 08h às 17h");
    expect(WORK_SCHEDULES).toContain("Das 09h às 18h");
    expect(WORK_SCHEDULES).toContain("Outro");
  });

  it("tem exatamente 3 itens", () => {
    expect(WORK_SCHEDULES).toHaveLength(3);
  });
});

describe("WORK_MODES", () => {
  it("contém todos os valores de WorkMode", () => {
    expect(WORK_MODES).toContain("Presencial");
    expect(WORK_MODES).toContain("Remoto");
    expect(WORK_MODES).toContain("Híbrido");
  });

  it("tem exatamente 3 itens", () => {
    expect(WORK_MODES).toHaveLength(3);
  });
});
