import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

// Mock env antes de qualquer importação que use env
vi.mock("@/lib/env", () => ({
  env: { DATA_PATH: path.join(os.tmpdir(), "test-excel-generator") },
}));

const { escapeXml, generateVacancyForm } = await import(
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
      responsibilities: "Desenvolver features do produto",
      qualifications: "5+ anos de experiência",
      behaviors: "Trabalho em equipe",
      challenges: "Escalar o sistema",
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
