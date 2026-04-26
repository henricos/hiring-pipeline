import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
// RED: importar componente que nao existe ainda — falhara ate Wave 1 criar o arquivo
import { ProfileDetailResumo } from "@/components/profile/profile-detail-resumo";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockResumoContent = {
  profileId: "2386bf16-4519-409c-9188-45068255df75",
  profileTitle: "Desenvolvedor Java Senior",
  baseName: "2026-04-24",
  summary: {
    commonTitles: [
      "Desenvolvedor Java Senior",
      "Backend Java SR",
      "Engenheiro de Software Java SR",
    ],
    titleAliases: ["Java Developer SR", "Senior Java Engineer"],
    stackFrequency: {
      Java: 15,
      "Spring Boot": 13,
      Kafka: 9,
      Docker: 9,
      Kubernetes: 8,
      AWS: 7,
      Go: 2,
    },
    emergingStack: ["Quarkus", "Micronaut"],
    salaryRange: null,
    commonBehaviors: [
      "Protagonismo tecnico",
      "Code review e mentoria",
      "Trabalho em equipes ageis",
    ],
    commonChallenges: [
      "Sistemas de alta carga",
      "Modernizacao de sistemas legados",
    ],
    archetypes: [
      { name: "arquiteto tecnico", count: 9 },
      { name: "especialista", count: 4 },
      { name: "engenheiro de produto", count: 2 },
    ],
    trends: [],
    redFlags: [],
  },
  salaryGuide: {
    min: 10000,
    max: 18000,
    sources: [{ portal: "Robert Half", year: 2025 }],
  },
  profileHints: {
    responsibilities: ["Projetar microsservicos em Java"],
    qualifications: [{ text: "5+ anos de Java", required: true }],
    behaviors: ["Protagonismo tecnico"],
    challenges: ["Alta carga no setor financeiro"],
    suggestedTitle: "Desenvolvedor Java Senior",
    suggestedExperienceLevel: "5-10 anos",
  },
};

const mockResearches = [
  {
    profileId: "2386bf16-4519-409c-9188-45068255df75",
    date: "2026-04-24",
    baseName: "2026-04-24",
    vagasFile: "2026-04-24-vagas.json",
    resumoFile: "2026-04-24-resumo.json",
    resumoContent: mockResumoContent,
  },
];

// ─── Testes (RED — ProfileDetailResumo nao existe ainda) ─────────────────────
// Cobrem VIZ-02 (stackFrequency ranqueado, salaryGuide com atribuicao)

describe("ProfileDetailResumo", () => {
  it("renderiza empty state quando researches e vazio (D-12, VIZ-02)", () => {
    render(<ProfileDetailResumo researches={[]} />);

    // Assert: mensagem de empty state visivel (D-12)
    expect(screen.getByText(/Nenhum resumo de mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/pesquisar-mercado/i)).toBeInTheDocument();
  });

  it("renderiza stackFrequency ordenado por contagem decrescente (D-10, VIZ-02)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);

    // Assert: Java (15) aparece antes de Go (2) na lista ranqueada
    const stackItems = screen.getAllByTestId("stack-item");
    expect(stackItems[0]).toHaveTextContent("Java");
    expect(stackItems[stackItems.length - 1]).toHaveTextContent("Go");
  });

  it("renderiza salaryGuide com atribuicao de fonte (D-11, VIZ-02)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);

    // Assert: "Robert Half 2025" visivel com faixa salarial (D-11)
    expect(screen.getByText(/Robert Half/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  it("renderiza secoes commonTitles, commonBehaviors, commonChallenges (D-09, VIZ-02)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);

    // Assert: tres secoes visiveis com listas
    expect(screen.getByText(/Titulos Comuns/i)).toBeInTheDocument();
    expect(screen.getByText("Desenvolvedor Java Senior")).toBeInTheDocument();
    expect(screen.getByText(/Comportamentos Comuns/i)).toBeInTheDocument();
    expect(screen.getByText("Protagonismo tecnico")).toBeInTheDocument();
    expect(screen.getByText(/Desafios Comuns/i)).toBeInTheDocument();
    expect(screen.getByText("Sistemas de alta carga")).toBeInTheDocument();
  });

  it("renderiza archetypes ordenados por contagem decrescente (D-09, VIZ-02)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);

    // Assert: archetypes visiveis com contagens
    expect(screen.getByText(/arquiteto tecnico/i)).toBeInTheDocument();
    expect(screen.getByText(/especialista/i)).toBeInTheDocument();
    expect(screen.getByText(/engenheiro de produto/i)).toBeInTheDocument();

    // Verificar que arquiteto tecnico (9) aparece antes de especialista (4)
    const archetypeElements = screen.getAllByText(/\d+ menções/i);
    const arquitetoIndex = archetypeElements.findIndex((el) =>
      el.closest("li")?.textContent?.includes("arquiteto tecnico")
    );
    const especialistaIndex = archetypeElements.findIndex((el) =>
      el.closest("li")?.textContent?.includes("especialista")
    );
    expect(arquitetoIndex).toBeLessThan(especialistaIndex);
  });
});
