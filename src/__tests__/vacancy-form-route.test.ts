/**
 * Testes para a rota GET /api/vacancies/[id]/form
 *
 * Fase 9 / Item 2: rota deve escrever em os.tmpdir() (sem DATA_PATH),
 * gerar o xlsx incondicionalmente (sem cache), e limpar o arquivo pós-stream.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import os from "node:os";
import path from "path";
import fs from "fs";

// Mocks dos módulos antes de importar a rota
vi.mock("fs");

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { email: "gestor@test.com" } }),
}));

vi.mock("@/lib/repositories/vacancy-repository", () => ({
  vacancyRepository: {
    findById: vi.fn().mockResolvedValue({
      id: "vac-001",
      profileId: "prof-001",
      status: "Aberta",
    }),
  },
}));

vi.mock("@/lib/repositories/profile-repository", () => ({
  profileRepository: {
    findById: vi.fn().mockResolvedValue({
      id: "prof-001",
      title: "Desenvolvedor Sênior",
    }),
  },
}));

vi.mock("@/lib/repositories/settings-repository", () => ({
  settingsRepository: {
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/lib/env", () => ({
  env: { DATA_PATH: "/data", APP_BASE_PATH: "/hiring-pipeline" },
}));

vi.mock("@/lib/excel-generator", () => ({
  generateVacancyForm: vi.fn(),
}));

describe("GET /api/vacancies/[id]/form — Phase 9 / D-04..D-08", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fake-xlsx") as never);
    vi.mocked(fs.unlinkSync).mockReturnValue(undefined);
  });

  it("não chama ensureSubdir (sem escrita em DATA_PATH)", async () => {
    const { GET } = await import("@/app/api/vacancies/[id]/form/route");
    const req = new Request("http://localhost/api/vacancies/vac-001/form");
    await GET(req, { params: Promise.resolve({ id: "vac-001" }) });

    // O outputPath gerado nunca deve conter DATA_PATH (/data)
    const { generateVacancyForm } = await import("@/lib/excel-generator");
    const calls = vi.mocked(generateVacancyForm).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);
    const outputPath = calls[0][1] as string;
    expect(outputPath).toContain(os.tmpdir());
    expect(outputPath).not.toContain("/data/forms");
  });

  it("outputPath contém 'vacancy-' + id + UUID (formato esperado)", async () => {
    const { GET } = await import("@/app/api/vacancies/[id]/form/route");
    const req = new Request("http://localhost/api/vacancies/vac-001/form");
    await GET(req, { params: Promise.resolve({ id: "vac-001" }) });

    const { generateVacancyForm } = await import("@/lib/excel-generator");
    const outputPath = vi.mocked(generateVacancyForm).mock.calls[0][1] as string;
    const basename = path.basename(outputPath);
    // Formato: vacancy-{id}-{uuid}.xlsx
    expect(basename).toMatch(/^vacancy-vac-001-[0-9a-f-]{36}\.xlsx$/);
  });

  it("chama generateVacancyForm incondicionalmente (sem verificar existsSync para cache)", async () => {
    // Mesmo com existsSync retornando true, deve gerar
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const { GET } = await import("@/app/api/vacancies/[id]/form/route");
    const req = new Request("http://localhost/api/vacancies/vac-001/form");
    await GET(req, { params: Promise.resolve({ id: "vac-001" }) });

    const { generateVacancyForm } = await import("@/lib/excel-generator");
    expect(vi.mocked(generateVacancyForm)).toHaveBeenCalledTimes(1);
  });

  it("ignora query string ?regen=1 (no-op silencioso — comportamento idêntico sem query)", async () => {
    const { GET } = await import("@/app/api/vacancies/[id]/form/route");

    // Com regen=1
    const reqWithRegen = new Request(
      "http://localhost/api/vacancies/vac-001/form?regen=1"
    );
    const res1 = await GET(reqWithRegen, {
      params: Promise.resolve({ id: "vac-001" }),
    });

    // Ambas as requisições devem retornar 200
    expect(res1.status).toBe(200);

    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fake-xlsx") as never);

    // Sem regen
    const reqSemRegen = new Request(
      "http://localhost/api/vacancies/vac-001/form"
    );
    const res2 = await GET(reqSemRegen, {
      params: Promise.resolve({ id: "vac-001" }),
    });
    expect(res2.status).toBe(200);

    const { generateVacancyForm } = await import("@/lib/excel-generator");
    // generateVacancyForm chamado 1 vez na segunda requisição
    expect(vi.mocked(generateVacancyForm)).toHaveBeenCalledTimes(1);
  });

  it("chama fs.unlinkSync no outputPath após ler o buffer (cleanup best-effort)", async () => {
    const { GET } = await import("@/app/api/vacancies/[id]/form/route");
    const req = new Request("http://localhost/api/vacancies/vac-001/form");
    await GET(req, { params: Promise.resolve({ id: "vac-001" }) });

    expect(vi.mocked(fs.unlinkSync)).toHaveBeenCalledTimes(1);
    const { generateVacancyForm } = await import("@/lib/excel-generator");
    const outputPath = vi.mocked(generateVacancyForm).mock.calls[0][1];
    expect(vi.mocked(fs.unlinkSync)).toHaveBeenCalledWith(outputPath);
  });

  it("retorna resposta 200 com Content-Disposition attachment", async () => {
    const { GET } = await import("@/app/api/vacancies/[id]/form/route");
    const req = new Request("http://localhost/api/vacancies/vac-001/form");
    const response = await GET(req, {
      params: Promise.resolve({ id: "vac-001" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("attachment");
    expect(response.headers.get("Content-Type")).toContain(
      "spreadsheetml.sheet"
    );
  });

  it("retorna 401 quando não autenticado", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    const { GET } = await import("@/app/api/vacancies/[id]/form/route");
    const req = new Request("http://localhost/api/vacancies/vac-001/form");
    const response = await GET(req, {
      params: Promise.resolve({ id: "vac-001" }),
    });

    expect(response.status).toBe(401);
  });
});
