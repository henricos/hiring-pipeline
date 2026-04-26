import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
// RED: importar componente que nao existe ainda — falhara ate Wave 1 criar o arquivo
import { ProfileDetailVagas } from "@/components/profile/profile-detail-vagas";

// ─── Fixtures ────────────────────────────────────────────────────────────────

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

const mockVagasDia24 = [
  {
    title: "Pessoa Desenvolvedora Backend Java SR",
    company: "Banco Bradesco",
    companySize: "grande",
    stack: ["Java 21", "Spring Boot 3", "Kafka"],
    snippet:
      "Desenvolvimento e manutencao de microsservicos Java com alta performance.",
  },
];

const mockVagasDia23 = [
  {
    title: "Engenheiro de Software Java SR",
    company: "Itau Unibanco",
    companySize: "grande",
    stack: ["Java 17", "GraalVM", "AWS"],
    snippet: "Modernizacao de sistemas legados com continuidade operacional.",
  },
];

// ─── Testes (RED — ProfileDetailVagas nao existe ainda) ──────────────────────
// Cobrem VIZ-01 (lista de pesquisas) e VIZ-03 (selecao de pesquisa anterior)

describe("ProfileDetailVagas", () => {
  it("renderiza empty state quando researches e vazio (D-07)", () => {
    render(<ProfileDetailVagas researches={[]} allVagas={{}} />);

    // Assert: mensagem de empty state visivel (D-07)
    expect(screen.getByText(/Nenhuma pesquisa de mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/pesquisar-mercado/i)).toBeInTheDocument();
  });

  it("renderiza lista de pesquisas em ordem cronologica reversa (D-05, VIZ-01)", () => {
    render(<ProfileDetailVagas researches={mockResearches} allVagas={{}} />);

    // Assert: datas visiveis; 2026-04-24 deve aparecer antes de 2026-04-23
    const dates = screen.getAllByText(/2026-04-2[34]/);
    expect(dates[0].textContent).toContain("2026-04-24");
    expect(dates[1].textContent).toContain("2026-04-23");
  });

  it("vagas da unica pesquisa sao exibidas diretamente sem interacao (D-06, VIZ-01)", () => {
    // Com 1 pesquisa, selectedDate é inicializado com researches[0].date
    // e as vagas são exibidas imediatamente, sem necessidade de clique.
    const singleResearch = [mockResearches[0]];
    const allVagas = { "2026-04-24": mockVagasDia24 };
    render(<ProfileDetailVagas researches={singleResearch} allVagas={allVagas} />);

    // Assert: vagas visíveis imediatamente
    expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
    expect(screen.getByText("Banco Bradesco")).toBeInTheDocument();
  });

  it("selecionar pesquisa diferente via dropdown atualiza lista de vagas (VIZ-03)", () => {
    const allVagas = {
      "2026-04-24": mockVagasDia24,
      "2026-04-23": mockVagasDia23,
    };
    render(<ProfileDetailVagas researches={mockResearches} allVagas={allVagas} />);

    // Act: mudar o select de data para 2026-04-23
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2026-04-23" } });

    // Assert: vagas da data 2026-04-23 agora visiveis
    expect(screen.getByText("Engenheiro de Software Java SR")).toBeInTheDocument();
    expect(screen.queryByText("Pessoa Desenvolvedora Backend Java SR")).not.toBeInTheDocument();
  });

  it("exibe card de vaga com title, company, stack e snippet (D-06)", () => {
    const allVagas = { "2026-04-24": mockVagasDia24 };
    render(
      <ProfileDetailVagas
        researches={[mockResearches[0]]}
        allVagas={allVagas}
        defaultExpanded="2026-04-24"
      />
    );

    // Assert: todos os campos da vaga visiveis no card expandido
    expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
    expect(screen.getByText("Banco Bradesco")).toBeInTheDocument();
    expect(screen.getByText("Java 21")).toBeInTheDocument();
    expect(screen.getByText(/Desenvolvimento e manutencao/i)).toBeInTheDocument();
  });
});
