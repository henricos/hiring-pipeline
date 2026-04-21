import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

// Mock env antes de qualquer importação que use env
vi.mock("@/lib/env", () => ({
  env: { DATA_PATH: path.join(os.tmpdir(), "test-excel-generator") },
}));

const { escapeXml, generateVacancyForm, serializeStringArray, serializeProfileItems } = await import(
  "@/lib/excel-generator"
);
const { createDefaultVacancy } = await import("@/lib/vacancy");

describe("escapeXml", () => {
  it("escapa ampersand", () => {
    expect(escapeXml("P&D")).toBe("P&amp;D");
  });

  it("escapa less-than e greater-than", () => {
    expect(escapeXml("<test>")).toBe("&lt;test&gt;");
  });

  it("escapa aspas duplas", () => {
    expect(escapeXml('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("escapa aspas simples", () => {
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  it("preserva texto normal sem alteração", () => {
    expect(escapeXml("Hello World 123")).toBe("Hello World 123");
  });

  it("escapa múltiplos caracteres especiais na mesma string", () => {
    expect(escapeXml("P&D / <Lyceum>")).toBe(
      "P&amp;D / &lt;Lyceum&gt;"
    );
  });
});

describe("generateVacancyForm", () => {
  const outputDir = path.join(os.tmpdir(), "test-excel-generator", "forms-test");
  const outputPath = path.join(outputDir, "test-form.xlsx");

  beforeEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath);
    }
    fs.mkdirSync(outputDir, { recursive: true });
  });

  it("lança erro se o template não existir", () => {
    expect(() => {
      generateVacancyForm(
        "/nonexistent/template.xlsx",
        outputPath,
        createDefaultVacancy("p1"),
        {} as any,
        {} as any
      );
    }).toThrow(/Template não encontrado/);
  });

  it("lança erro se sheet1.xml não estiver no template ZIP", async () => {
    // Criar um ZIP válido que não contém sheet1.xml
    const AdmZip = (await import("adm-zip")).default;
    const fakeZipPath = path.join(outputDir, "fake-template.xlsx");
    const zip = new AdmZip();
    zip.addFile("dummy.txt", Buffer.from("not a spreadsheet"));
    zip.writeZip(fakeZipPath);

    expect(() => {
      generateVacancyForm(
        fakeZipPath,
        outputPath,
        createDefaultVacancy("p1"),
        {} as any,
        {} as any
      );
    }).toThrow(/sheet1.xml/);

    fs.rmSync(fakeZipPath);
  });

  // Teste com template real — pulado se o template não estiver disponível
  it("gera arquivo de saída se o template existir", async () => {
    // O template está em DATA_PATH/templates/requisicao-de-pessoal.xlsx
    // Em CI/test sem DATA_PATH configurado, este teste é pulado
    const dataPaths = [
      process.env.DATA_PATH,
      "/home/henrico/github/henricos/hiring-pipeline-data",
      "/data",
    ].filter(Boolean) as string[];

    let templatePath: string | null = null;
    for (const base of dataPaths) {
      const candidate = path.join(base, "templates", "requisicao-de-pessoal.xlsx");
      if (fs.existsSync(candidate)) {
        templatePath = candidate;
        break;
      }
    }

    if (!templatePath) {
      // Template não disponível neste ambiente — pular sem falhar
      console.log(
        "SKIP: template requisicao-de-pessoal.xlsx não disponível neste ambiente"
      );
      return;
    }

    const vacancy = createDefaultVacancy("profile-1");
    const profile = {
      title: "Software Engineer",
      suggestedTitle: "Dev Sênior",
      experienceLevel: "5-10 anos",
      educationLevel: "Superior completo",
      educationCourse: "Ciência da Computação",
      postGraduateLevel: "Desejável",
      certifications: "Não",
      englishLevel: "Avançado",
      spanishLevel: "Básico",
      responsibilities: ["Desenvolver features do produto"],
      qualifications: [{ text: "5+ anos de experiência", required: true }],
      behaviors: ["Trabalho em equipe"],
      challenges: ["Escalar o sistema"],
      additionalInfo: "",
    } as any;
    const settings = {
      managerName: "João Silva",
      godfather: "Maria Santos",
      immediateReport: "Carlos Oliveira",
      mediateReport: "Ana Costa",
      teamComposition: "5 desenvolvedores, 1 PM, 1 designer",
    } as any;

    generateVacancyForm(templatePath, outputPath, vacancy, profile, settings);

    expect(fs.existsSync(outputPath)).toBe(true);
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});

describe("validateCellMapping", () => {
  async function findTemplatePath(): Promise<string | null> {
    const dataPaths = [
      process.env.DATA_PATH,
      "/home/henrico/github/henricos/hiring-pipeline-data",
      "/data",
    ].filter(Boolean) as string[];
    for (const base of dataPaths) {
      const candidate = path.join(base, "templates", "requisicao-de-pessoal.xlsx");
      if (fs.existsSync(candidate)) return candidate;
    }
    return null;
  }

  async function generateAndReadSheet(): Promise<string> {
    const templatePath = await findTemplatePath();
    if (!templatePath) return "";

    const AdmZip = (await import("adm-zip")).default;
    const outPath = path.join(os.tmpdir(), "test-excel-generator", "forms-test", `cell-test-${Date.now()}.xlsx`);
    const vacancy = createDefaultVacancy("p1");
    const profile = {
      title: "TITULO_TESTE_UNICO",
      suggestedTitle: "SUG_TITULO_UNICO",
      educationLevel: "Superior completo",
      educationCourse: "Engenharia",
      postGraduateLevel: "Não",
      englishLevel: "Avançado",
      spanishLevel: "Não exigido",
      responsibilities: ["RESP_UNICA"],
      qualifications: [{ text: "QUAL_UNICA", required: true }],
      behaviors: ["COMP_UNICA"],
      challenges: ["DESAFIO_UNICO"],
      additionalInfo: "",
      systemsRequired: "",
      networkFolders: "",
    } as any;
    const settings = {
      managerName: "GESTOR_UNICO",
      godfather: "PADRINHO_UNICO",
      immediateReport: "IMEDIATO_UNICO",
      mediateReport: "MEDIATO_UNICO",
      teamComposition: "EQUIPE_UNICA",
    } as any;

    generateVacancyForm(templatePath, outPath, vacancy, profile, settings);
    const outZip = new AdmZip(outPath);
    const entry = outZip.getEntry("xl/worksheets/sheet1.xml");
    return entry ? entry.getData().toString("utf-8") : "";
  }

  it("escreve title na célula D6", async () => {
    const xml = await generateAndReadSheet();
    if (!xml) return;
    expect(xml).toContain('r="D6"');
    expect(xml).toContain("TITULO_TESTE_UNICO");
  });

  it("escreve managerName na célula H10", async () => {
    const xml = await generateAndReadSheet();
    if (!xml) return;
    expect(xml).toContain('r="H10"');
    expect(xml).toContain("GESTOR_UNICO");
  });

  it("escreve quantity na célula AD4", async () => {
    const xml = await generateAndReadSheet();
    if (!xml) return;
    expect(xml).toContain('r="AD4"');
  });

  it("escreve responsibilities na célula B44 com formato bullet", async () => {
    const xml = await generateAndReadSheet();
    if (!xml) return;
    expect(xml).toContain('r="B44"');
    expect(xml).toContain("- RESP_UNICA");
  });

  it("escreve teamComposition na célula B27", async () => {
    const xml = await generateAndReadSheet();
    if (!xml) return;
    expect(xml).toContain('r="B27"');
    expect(xml).toContain("EQUIPE_UNICA");
  });
});

describe("serializeStringArray", () => {
  it('retorna "- a\\n- b" para ["a", "b"]', () => {
    expect(serializeStringArray(["a", "b"])).toBe("- a\n- b");
  });
  it("filtra itens vazios", () => {
    expect(serializeStringArray(["a", "", "b"])).toBe("- a\n- b");
  });
  it("retorna string vazia para array vazio", () => {
    expect(serializeStringArray([])).toBe("");
  });
  it("funciona com item único", () => {
    expect(serializeStringArray(["item único"])).toBe("- item único");
  });
});

describe("serializeProfileItems", () => {
  it("separa obrigatórios e opcionais em dois blocos rotulados", () => {
    const items = [
      { text: "TypeScript", required: true },
      { text: "Docker", required: false },
    ];
    const result = serializeProfileItems(items);
    expect(result).toBe("Requisitos:\n- TypeScript\n\nDiferenciais:\n- Docker");
  });

  it("emite apenas o bloco obrigatório quando não há opcionais", () => {
    const items = [
      { text: "React", required: true },
      { text: "Node.js", required: true },
    ];
    const result = serializeProfileItems(items);
    expect(result).toBe("Requisitos:\n- React\n- Node.js");
  });

  it("emite apenas o bloco opcional quando não há obrigatórios", () => {
    const items = [{ text: "Kubernetes", required: false }];
    const result = serializeProfileItems(items);
    expect(result).toBe("Diferenciais:\n- Kubernetes");
  });

  it("usa rótulos customizados quando fornecidos", () => {
    const items = [
      { text: "Java", required: true },
      { text: "SpringBoot", required: false },
    ];
    const result = serializeProfileItems(
      items,
      "Você deve ter:",
      "Seria ótimo se você tiver:"
    );
    expect(result).toContain("Você deve ter:");
    expect(result).toContain("Seria ótimo se você tiver:");
    expect(result).toContain("- Java");
    expect(result).toContain("- SpringBoot");
  });

  it("retorna string vazia para array vazio", () => {
    expect(serializeProfileItems([])).toBe("");
  });

  it("filtra itens com text vazio", () => {
    const items = [
      { text: "React", required: true },
      { text: "", required: true },
    ];
    expect(serializeProfileItems(items)).toBe("Requisitos:\n- React");
  });
});
