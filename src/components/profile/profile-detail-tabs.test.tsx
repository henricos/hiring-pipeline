import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileDetailTabs } from "@/components/profile/profile-detail-tabs";

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

describe("ProfileDetailTabs", () => {
  it("renderiza tres abas: Perfil, Vagas, Resumo de Mercado", () => {
    render(
      <ProfileDetailTabs
        perfilContent={<div>Formulário de edição</div>}
        researches={mockResearches}
      />
    );

    expect(screen.getByRole("tab", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Vagas do Mercado" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resumo de Mercado" })).toBeInTheDocument();
  });

  it("clicar na aba Vagas torna o conteudo de Vagas visivel", () => {
    render(
      <ProfileDetailTabs
        perfilContent={<div>Formulário de edição</div>}
        researches={mockResearches}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Vagas do Mercado" }));

    expect(screen.getByText("2026-04-24")).toBeInTheDocument();
  });

  it("renderiza perfilContent na aba Perfil selecionada por padrao", () => {
    render(
      <ProfileDetailTabs
        perfilContent={<div data-testid="perfil-form">Conteúdo do perfil</div>}
        researches={[]}
      />
    );

    expect(screen.getByTestId("perfil-form")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do perfil")).toBeInTheDocument();
  });
});
