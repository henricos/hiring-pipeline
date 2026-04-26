import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

// Mock do modulo env antes de qualquer importacao que o use
vi.mock("@/lib/env", () => ({
  env: { DATA_PATH: "/tmp/test-research-repository" },
}));

// Mock do modulo fs para controlar chamadas ao filesystem
vi.mock("fs");

// Importacao dinamica apos os mocks
const { JsonResearchRepository } = await import(
  "@/lib/repositories/research-repository"
);

describe("JsonResearchRepository", () => {
  let repo: InstanceType<typeof JsonResearchRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new JsonResearchRepository();
  });

  // ─── listByProfileId ────────────────────────────────────────────────────────

  it("listByProfileId retorna pesquisas ordenadas por data decrescente", async () => {
    // Arrange: dois dias distintos, cada um com vagas.json e resumo.json
    vi.mocked(fs.existsSync).mockReturnValue(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(fs.readdirSync) as any).mockReturnValue([
      "2026-04-24-vagas.json",
      "2026-04-24-resumo.json",
      "2026-04-23-vagas.json",
      "2026-04-23-resumo.json",
    ]);

    // Act
    const results = await repo.listByProfileId(
      "2386bf16-4519-409c-9188-45068255df75"
    );

    // Assert: 2 objetos Research, 2026-04-24 antes de 2026-04-23
    expect(results).toHaveLength(2);
    expect(results[0].date).toBe("2026-04-24");
    expect(results[1].date).toBe("2026-04-23");
    expect(results[0].vagasFile).toBe("2026-04-24-vagas.json");
    expect(results[0].resumoFile).toBe("2026-04-24-resumo.json");
  });

  it("listByProfileId consolida arquivos com sufixo -2 no mesmo dia", async () => {
    // Arrange: colisao de data — dois arquivos vagas no mesmo dia
    vi.mocked(fs.existsSync).mockReturnValue(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(fs.readdirSync) as any).mockReturnValue([
      "2026-04-24-vagas.json",
      "2026-04-24-resumo.json",
      "2026-04-24-2-vagas.json",
    ]);

    // Act
    const results = await repo.listByProfileId(
      "2386bf16-4519-409c-9188-45068255df75"
    );

    // Assert: apenas 1 Research object para 2026-04-24
    expect(results).toHaveLength(1);
    expect(results[0].date).toBe("2026-04-24");
  });

  it("listByProfileId retorna array vazio quando diretorio nao existe (ENOENT)", async () => {
    // Arrange: readdirSync lanca ENOENT
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      const error = new Error("ENOENT: no such file or directory") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    });

    // Act
    const results = await repo.listByProfileId(
      "2386bf16-4519-409c-9188-45068255df75"
    );

    // Assert
    expect(results).toEqual([]);
  });

  it("listByProfileId rejeita profileId com path traversal (../)", async () => {
    // Threat T-08-01: validacao de profileId contra ataque de path traversal
    await expect(
      repo.listByProfileId("../../../etc/passwd")
    ).rejects.toThrow(/inv[aá]lido/i);
  });

  // ─── getVagas ───────────────────────────────────────────────────────────────

  it("getVagas retorna conteudo JSON parseado do arquivo de vagas", async () => {
    // Arrange: conteudo fixture do vagas.json
    const fixture = {
      profileId: "2386bf16-4519-409c-9188-45068255df75",
      profileTitle: "Desenvolvedor Java Senhor",
      jobs: [
        {
          title: "Pessoa Desenvolvedora Backend Java SR",
          company: "Banco Bradesco",
          stack: ["Java 21", "Spring Boot 3", "Kafka"],
        },
      ],
    };
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(fixture));

    // Act
    const result = await repo.getVagas(
      "2386bf16-4519-409c-9188-45068255df75",
      "2026-04-24"
    );

    // Assert: objeto identico ao fixture
    expect(result).toEqual(fixture);
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].title).toBe("Pessoa Desenvolvedora Backend Java SR");
  });

  it("getVagas retorna null quando arquivo nao existe", async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // Act
    const result = await repo.getVagas(
      "2386bf16-4519-409c-9188-45068255df75",
      "2026-04-24"
    );

    // Assert
    expect(result).toBeNull();
  });

  // ─── getResumo ──────────────────────────────────────────────────────────────

  it("getResumo retorna conteudo JSON com todos os campos do resumo", async () => {
    // Arrange: conteudo fixture completo do resumo.json
    const fixture = {
      profileId: "2386bf16-4519-409c-9188-45068255df75",
      profileTitle: "Desenvolvedor Java Senhor",
      baseName: "2026-04-24",
      summary: {
        commonTitles: ["Desenvolvedor Java Senhor", "Backend Java SR"],
        titleAliases: ["Java Developer SR"],
        stackFrequency: { Java: 15, "Spring Boot": 13, Kafka: 9 },
        emergingStack: ["Quarkus", "Micronaut"],
        salaryRange: null,
        commonBehaviors: ["Protagonismo tecnico"],
        commonChallenges: ["Sistemas de alta carga"],
        archetypes: [{ name: "arquiteto tecnico", count: 9 }],
        trends: ["Java 17 como versao padrao"],
        redFlags: [],
      },
      salaryGuide: {
        min: 10000,
        max: 18000,
        sources: [{ portal: "Robert Half", year: 2025 }],
      },
      profileHints: {
        responsibilities: ["Projetar microsservicos em Java"],
        qualifications: [{ text: "5+ anos de Java", required: true }],
        behaviors: ["Protagonismo tecnico"],
        challenges: ["Alta carga no setor financeiro"],
        suggestedTitle: "Desenvolvedor Java Senhor",
        suggestedExperienceLevel: "5-10 anos",
      },
    };
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(fixture));

    // Act
    const result = await repo.getResumo(
      "2386bf16-4519-409c-9188-45068255df75",
      "2026-04-24"
    );

    // Assert: todos os campos do resumo presentes
    expect(result).toEqual(fixture);
    expect(result.summary.commonTitles).toHaveLength(2);
    expect(result.summary.stackFrequency).toHaveProperty("Java", 15);
    expect(result.salaryGuide.sources[0].portal).toBe("Robert Half");
    expect(result.profileHints.qualifications[0].required).toBe(true);
  });

  it("getResumo retorna null quando arquivo nao existe (T-08-03: sem crash em JSON malformado)", async () => {
    // Arrange: existsSync false — nao deve crashar
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // Act
    const result = await repo.getResumo(
      "2386bf16-4519-409c-9188-45068255df75",
      "2026-04-24"
    );

    // Assert
    expect(result).toBeNull();
  });
});
