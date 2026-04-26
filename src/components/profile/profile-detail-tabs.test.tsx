import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { JobProfile } from "@/lib/profile";
// RED: importar componente que nao existe ainda — falhara ate Wave 1 criar o arquivo
import { ProfileDetailTabs } from "@/components/profile/profile-detail-tabs";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockProfile: JobProfile = {
  id: "2386bf16-4519-409c-9188-45068255df75",
  title: "Desenvolvedor Java Senior",
  suggestedTitle: "Senior Java Developer",
  experienceLevel: "5-10 anos",
  educationLevel: "Superior completo",
  postGraduateLevel: "Nao exigido",
  certifications: "Nao",
  responsibilities: ["Projetar microsservicos", "Code review"],
  qualifications: [
    { text: "5+ anos de Java", required: true },
    { text: "Docker", required: false },
  ],
  behaviors: ["Protagonismo tecnico"],
  challenges: ["Alta carga no setor financeiro"],
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
  {
    profileId: "2386bf16-4519-409c-9188-45068255df75",
    date: "2026-04-23",
    baseName: "2026-04-23",
    vagasFile: "2026-04-23-vagas.json",
    resumoFile: "2026-04-23-resumo.json",
  },
];

// ─── Testes (RED — ProfileDetailTabs nao existe ainda) ────────────────────────
// Estes testes falharao com erro de importacao ate que o componente seja criado na Wave 1

describe("ProfileDetailTabs", () => {
  it("renderiza tres abas: Perfil, Vagas, Resumo de Mercado", () => {
    render(<ProfileDetailTabs profile={mockProfile} researches={mockResearches} />);

    // Assert: 3 botoes de aba com textos corretos
    expect(screen.getByRole("tab", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Vagas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resumo de Mercado" })).toBeInTheDocument();
  });

  it("clicar na aba Vagas torna o conteudo de Vagas visivel", () => {
    render(<ProfileDetailTabs profile={mockProfile} researches={mockResearches} />);

    // Act: clicar na aba Vagas
    fireEvent.click(screen.getByRole("tab", { name: "Vagas" }));

    // Assert: conteudo de vagas visivel (data da pesquisa)
    expect(screen.getByText("2026-04-24")).toBeInTheDocument();
  });

  it("passa profile para ProfileDetailPerfil ao selecionar aba Perfil", () => {
    const profile = { ...mockProfile, title: "Dev Java Unico" };
    render(<ProfileDetailTabs profile={profile} researches={[]} />);

    // Assert: aba Perfil selecionada por padrao — titulo visivel no filho
    expect(screen.getByText("Dev Java Unico")).toBeInTheDocument();
  });
});
