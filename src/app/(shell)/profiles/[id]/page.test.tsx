import { describe, it, expect, vi } from "vitest";
// RED: importar page.tsx que nao existe ainda — falhara ate Wave 2 criar o arquivo
// O Server Component sera criado em Wave 2; este teste valida o contrato da pagina
import ProfileDetailPage from "@/app/(shell)/profiles/[id]/page";

// Mocks de dependencias que serao criadas nas Waves seguintes
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/app/actions/profile", () => ({
  getProfile: vi.fn(),
}));

vi.mock("@/app/actions/research", () => ({
  getResearchesByProfileId: vi.fn(),
  getVagasForDate: vi.fn().mockResolvedValue(null),
  getResumoForDate: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/profile/profile-detail-tabs", () => ({
  ProfileDetailTabs: vi.fn(({ profile, researches }) => (
    <div data-testid="profile-detail-tabs">
      <span data-testid="profile-title">{profile.title}</span>
      <span data-testid="researches-count">{researches.length}</span>
    </div>
  )),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockProfile = {
  id: "2386bf16-4519-409c-9188-45068255df75",
  title: "Dev Java Sr",
  suggestedTitle: "Senior Java Developer",
  experienceLevel: "5-10 anos",
  educationLevel: "Superior completo",
  postGraduateLevel: "Nao exigido",
  certifications: "Nao",
  responsibilities: [],
  qualifications: [],
  behaviors: [],
  challenges: [],
  createdAt: "2026-04-24T00:00:00.000Z",
  updatedAt: "2026-04-24T00:00:00.000Z",
};

const mockResearches = [
  {
    profileId: "2386bf16-4519-409c-9188-45068255df75",
    date: "2026-04-24",
    baseName: "2026-04-24",
    vagasFile: "2026-04-24-vagas.json",
    resumoFile: "2026-04-24-resumo.json",
  },
];

// ─── Testes (RED — page.tsx nao existe ainda) ─────────────────────────────────
// Estes testes falharao com erro de importacao ate que page.tsx seja criado na Wave 2

describe("ProfileDetailPage (Server Component)", () => {
  it("renderiza pagina com profile valido e pesquisas", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");

    vi.mocked(getProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(getResearchesByProfileId).mockResolvedValue(mockResearches as any);

    // Act: renderizar Server Component com params assincrono
    const params = Promise.resolve({ id: "2386bf16-4519-409c-9188-45068255df75" });
    const { render, screen } = await import("@testing-library/react");
    render(await ProfileDetailPage({ params }));

    // Assert: ProfileDetailTabs renderizado com profile e researches
    expect(screen.getByTestId("profile-detail-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("profile-title").textContent).toBe("Dev Java Sr");
  });

  it("chama notFound() quando profile nao encontrado", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");
    const { notFound } = await import("next/navigation");

    vi.mocked(getProfile).mockResolvedValue(null);
    vi.mocked(getResearchesByProfileId).mockResolvedValue([]);

    const params = Promise.resolve({ id: "nao-existe" });

    // Assert: notFound() chamado quando profile e null
    await expect(ProfileDetailPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("exibe profile.title como heading h1", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");

    vi.mocked(getProfile).mockResolvedValue({ ...mockProfile, title: "Dev Java Sr" } as any);
    vi.mocked(getResearchesByProfileId).mockResolvedValue([]);

    const params = Promise.resolve({ id: "2386bf16-4519-409c-9188-45068255df75" });
    const { render, screen } = await import("@testing-library/react");
    render(await ProfileDetailPage({ params }));

    // Assert: h1 contem o titulo do profile
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Dev Java Sr");
  });

  it("renderiza sem erro quando researches e array vazio", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");

    vi.mocked(getProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(getResearchesByProfileId).mockResolvedValue([]);

    const params = Promise.resolve({ id: "2386bf16-4519-409c-9188-45068255df75" });
    const { render, screen } = await import("@testing-library/react");
    render(await ProfileDetailPage({ params }));

    // Assert: ProfileDetailTabs renderizado com researches=[]
    expect(screen.getByTestId("researches-count").textContent).toBe("0");
  });

  it("aguarda params assincrono corretamente (Next.js 16 async params)", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");

    vi.mocked(getProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(getResearchesByProfileId).mockResolvedValue([]);

    // Arrange: params como Promise (padrao Next.js 16 — await params obrigatorio)
    let resolveParams!: (value: { id: string }) => void;
    const params = new Promise<{ id: string }>((resolve) => {
      resolveParams = resolve;
    });

    // Act: iniciar render antes de resolver params
    const renderPromise = ProfileDetailPage({ params });
    resolveParams({ id: "2386bf16-4519-409c-9188-45068255df75" });

    // Assert: pagina renderiza corretamente apos resolver params
    const { render, screen } = await import("@testing-library/react");
    render(await renderPromise);
    expect(screen.getByTestId("profile-detail-tabs")).toBeInTheDocument();
  });
});
