import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { JobProfile } from "@/lib/profile";
// RED: importar componente que nao existe ainda — falhara ate Wave 1 criar o arquivo
import { ProfileDetailPerfil } from "@/components/profile/profile-detail-perfil";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function buildProfile(overrides: Partial<JobProfile> = {}): JobProfile {
  return {
    id: "2386bf16-4519-409c-9188-45068255df75",
    title: "Desenvolvedor Java Senior",
    suggestedTitle: "Senior Java Developer",
    experienceLevel: "5-10 anos",
    educationLevel: "Superior completo",
    postGraduateLevel: "Não exigido",
    certifications: "Não",
    responsibilities: [],
    qualifications: [],
    behaviors: [],
    challenges: [],
    createdAt: "2026-04-24T00:00:00.000Z",
    updatedAt: "2026-04-24T00:00:00.000Z",
    ...overrides,
  };
}

// ─── Testes (RED — ProfileDetailPerfil nao existe ainda) ─────────────────────
// Estes testes falharao com erro de importacao ate que o componente seja criado na Wave 1

describe("ProfileDetailPerfil", () => {
  it("renderiza title e suggestedTitle do profile", () => {
    const profile = buildProfile({ title: "Dev Java Sr", suggestedTitle: "Senior Engineer" });
    render(<ProfileDetailPerfil profile={profile} />);

    // Assert: ambos os textos visiveis no DOM
    expect(screen.getByText("Dev Java Sr")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
  });

  it("renderiza secao Responsabilidades quando nao vazia", () => {
    const profile = buildProfile({ responsibilities: ["Arquitetura", "Mentoria"] });
    render(<ProfileDetailPerfil profile={profile} />);

    // Assert: secao Responsabilidades visivel com ambos os itens
    expect(screen.getByText("Responsabilidades")).toBeInTheDocument();
    expect(screen.getByText("Arquitetura")).toBeInTheDocument();
    expect(screen.getByText("Mentoria")).toBeInTheDocument();
  });

  it("omite secao Responsabilidades quando array vazio (D-04)", () => {
    const profile = buildProfile({ responsibilities: [] });
    render(<ProfileDetailPerfil profile={profile} />);

    // Assert: nenhuma secao "Responsabilidades" no DOM
    expect(screen.queryByText("Responsabilidades")).not.toBeInTheDocument();
  });

  it("renderiza Qualificacoes com badge Obrigatorio e Desejavel", () => {
    const profile = buildProfile({
      qualifications: [
        { text: "5+ Java", required: true },
        { text: "Docker", required: false },
      ],
    });
    render(<ProfileDetailPerfil profile={profile} />);

    // Assert: badge "Obrigatorio" para required, "Desejavel" para optional
    expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Desejável")).toBeInTheDocument();
    expect(screen.getByText("5+ Java")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
  });

  it("clicar em Editar navega para /profiles/{id}/edit (D-02)", () => {
    const profile = buildProfile({ id: "test-profile-id" });
    const originalHref = window.location.href;

    render(<ProfileDetailPerfil profile={profile} />);

    // Act: clicar no botao Editar
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));

    // Assert: href atualizado para rota de edicao
    expect(window.location.href).toContain("/profiles/test-profile-id/edit");
  });
});
