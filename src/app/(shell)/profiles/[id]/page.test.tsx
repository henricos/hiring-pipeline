import { describe, it, expect, vi } from "vitest";
import ProfileDetailPage from "@/app/(shell)/profiles/[id]/page";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/app/actions/profile", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("@/app/actions/research", () => ({
  getResearchesByProfileId: vi.fn(),
  getVagasForDate: vi.fn().mockResolvedValue(null),
  getResumoForDate: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/profile/profile-detail-tabs", () => ({
  ProfileDetailTabs: vi.fn(({ researches }) => (
    <div data-testid="profile-detail-tabs">
      <span data-testid="researches-count">{researches.length}</span>
    </div>
  )),
}));

vi.mock("@/components/profile/profile-form", () => ({
  ProfileForm: vi.fn(() => <div data-testid="profile-form" />),
}));

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

describe("ProfileDetailPage (Server Component)", () => {
  it("renderiza pagina com profile valido e pesquisas", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");

    vi.mocked(getProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(getResearchesByProfileId).mockResolvedValue(mockResearches as any);

    const params = Promise.resolve({ id: "2386bf16-4519-409c-9188-45068255df75" });
    const { render, screen } = await import("@testing-library/react");
    render(await ProfileDetailPage({ params }));

    expect(screen.getByTestId("profile-detail-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("researches-count").textContent).toBe("1");
  });

  it("chama notFound() quando profile nao encontrado", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");
    const { notFound } = await import("next/navigation");

    vi.mocked(getProfile).mockResolvedValue(null);
    vi.mocked(getResearchesByProfileId).mockResolvedValue([]);

    const params = Promise.resolve({ id: "nao-existe" });

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

    expect(screen.getByTestId("researches-count").textContent).toBe("0");
  });

  it("aguarda params assincrono corretamente (Next.js 16 async params)", async () => {
    const { getProfile } = await import("@/app/actions/profile");
    const { getResearchesByProfileId } = await import("@/app/actions/research");

    vi.mocked(getProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(getResearchesByProfileId).mockResolvedValue([]);

    let resolveParams!: (value: { id: string }) => void;
    const params = new Promise<{ id: string }>((resolve) => {
      resolveParams = resolve;
    });

    const renderPromise = ProfileDetailPage({ params });
    resolveParams({ id: "2386bf16-4519-409c-9188-45068255df75" });

    const { render, screen } = await import("@testing-library/react");
    render(await renderPromise);
    expect(screen.getByTestId("profile-detail-tabs")).toBeInTheDocument();
  });
});
