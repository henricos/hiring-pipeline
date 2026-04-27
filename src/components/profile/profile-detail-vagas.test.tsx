import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileDetailVagas } from "@/components/profile/profile-detail-vagas";

// ─── Fixtures ────────────────────────────────────────────────────────────────
// Nota: fixture com 2 pesquisas mantida intencionalmente para testar que apenas
// a mais recente é exibida (D-32, D-34). O teste antigo "renderiza lista de
// pesquisas em ordem cronologica reversa" dependia de ambas as datas estarem
// visíveis no DOM via <select> — substituído pelo teste "renderiza apenas a
// pesquisa mais recente" que verifica a AUSÊNCIA das vagas antigas.

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

// ─── Testes — alinhados à nova UI read-only da mais recente (D-32..D-34, D-37) ──

describe("ProfileDetailVagas", () => {
  it("renderiza empty state quando researches e vazio (D-07)", () => {
    render(<ProfileDetailVagas researches={[]} allVagas={{}} />);
    expect(screen.getByText(/Nenhuma pesquisa de mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/pesquisar-mercado/i)).toBeInTheDocument();
  });

  it("renderiza apenas a pesquisa mais recente (D-32, D-34)", () => {
    const allVagas = {
      "2026-04-24": mockVagasDia24,
      "2026-04-23": mockVagasDia23,
    };
    render(<ProfileDetailVagas researches={mockResearches} allVagas={allVagas} />);

    // Vagas da mais recente (24) visíveis
    expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
    // Vagas da anterior (23) NÃO visíveis (sem switcher — D-34)
    expect(screen.queryByText("Engenheiro de Software Java SR")).not.toBeInTheDocument();

    // Sem combobox — switcher foi removido (D-34)
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("exibe a data da pesquisa sempre, mesmo com 1 unica pesquisa (D-33)", () => {
    const singleResearch = [mockResearches[0]];
    const allVagas = { "2026-04-24": mockVagasDia24 };
    render(<ProfileDetailVagas researches={singleResearch} allVagas={allVagas} />);

    // Data visível mesmo com 1 pesquisa (D-33)
    expect(screen.getByText(/Pesquisa de:\s*2026-04-24/i)).toBeInTheDocument();
  });

  it("vagas da unica pesquisa sao exibidas diretamente (D-06, VIZ-01)", () => {
    const singleResearch = [mockResearches[0]];
    const allVagas = { "2026-04-24": mockVagasDia24 };
    render(<ProfileDetailVagas researches={singleResearch} allVagas={allVagas} />);

    expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
    expect(screen.getByText("Banco Bradesco")).toBeInTheDocument();
  });

  it("exibe card de vaga com title, company, stack e snippet (D-06)", () => {
    const allVagas = { "2026-04-24": mockVagasDia24 };
    render(
      <ProfileDetailVagas
        researches={[mockResearches[0]]}
        allVagas={allVagas}
      />
    );

    expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
    expect(screen.getByText("Banco Bradesco")).toBeInTheDocument();
    expect(screen.getByText("Java 21")).toBeInTheDocument();
    expect(screen.getByText(/Desenvolvimento e manutencao/i)).toBeInTheDocument();
  });
});
