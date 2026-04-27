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
    // D-30: fixture inclui salaryRange.note para cobertura permanente
    salaryRange: { min: 18000, max: 38000, note: "Faixa de São Paulo capital, regime CLT" },
    commonBehaviors: [
      "Protagonismo tecnico",
      "Code review e mentoria",
      "Trabalho em equipes ageis",
    ],
    commonChallenges: [
      "Sistemas de alta carga",
      "Modernizacao de sistemas legados",
    ],
    // D-29, D-31: mock reflete schema canônico de .agents/skills/pesquisar-mercado/SKILL.md §6.1
    // Campo correto é "archetype" (não "name"); "percentage" opcional do schema canônico.
    archetypes: [
      { archetype: "arquiteto tecnico", count: 9, percentage: 50 },
      { archetype: "especialista", count: 4, percentage: 22 },
      { archetype: "engenheiro de produto", count: 2, percentage: 11 },
    ],
    trends: [],
    redFlags: [],
  },
  // D-30: primeira source tem url para cobertura de link <a>; segunda sem url para cobertura de fallback texto-puro
  salaryGuide: {
    min: 17000,
    max: 35000,
    sources: [
      { portal: "Glassdoor", year: 2025, url: "https://www.glassdoor.com.br/salarios/staff-engineer", percentiles: "P50: R$ 25k" },
      { portal: "Catho", year: 2024 },
    ],
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

// ─── Testes ───────────────────────────────────────────────────────────────────
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

    // Assert: "Glassdoor 2025" visivel com faixa salarial (D-11)
    expect(screen.getByText(/Glassdoor/i)).toBeInTheDocument();
    // Faixa do salaryGuide: R$ 17.0k – R$ 35.0k
    expect(screen.getAllByText(/17/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/35/).length).toBeGreaterThan(0);
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

  it("renderiza archetype com percentage no formato 'X — N menções (P%)' (D-28)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);

    // D-28: formato "arquiteto tecnico — 9 menções (50%)"
    expect(screen.getByText(/arquiteto tecnico\s*—\s*9 menç/i)).toBeInTheDocument();
    expect(screen.getByText(/\(50%\)/)).toBeInTheDocument();
  });

  it("renderiza Stack Frequência como barras horizontais (D-20, D-21)", () => {
    const { container } = render(<ProfileDetailResumo researches={mockResearches} />);

    // Cada stack-item tem o tech name e "X menções" visíveis (D-23)
    const items = screen.getAllByTestId("stack-item");
    expect(items.length).toBe(7); // mock tem 7 entries em stackFrequency
    expect(items[0]).toHaveTextContent("Java");
    expect(items[0]).toHaveTextContent("15 menções");

    // Cada item tem um inner <div> com style.width (a barra)
    items.forEach((item) => {
      const bar = item.querySelector('[style*="width"]');
      expect(bar).not.toBeNull();
    });

    void container; // suppress unused var warning
  });

  it("largura da barra é proporcional a count/maxCount (D-22)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);
    const items = screen.getAllByTestId("stack-item");

    // Java=15 (top), Spring Boot=13, Go=2 (último). maxCount=15.
    const javaBar = items[0].querySelector('[style*="width"]') as HTMLElement;
    const goBar = items[items.length - 1].querySelector('[style*="width"]') as HTMLElement;

    expect(javaBar.style.width).toBe("100%");
    // Go: 2/15 * 100 ≈ 13.3% — acima do mínimo de 8%, mas estritamente menor que Java
    const javaW = parseFloat(javaBar.style.width);
    const goW = parseFloat(goBar.style.width);
    expect(goW).toBeLessThan(javaW);
  });

  it("renderiza salaryRange.note quando presente (D-30)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);
    expect(screen.getByText(/São Paulo capital.*CLT/i)).toBeInTheDocument();
  });

  it("renderiza salaryGuide.sources[i].url como link <a> (D-30)", () => {
    render(<ProfileDetailResumo researches={mockResearches} />);

    // primeira source: Glassdoor com url → vira <a>
    const glassdoorLink = screen.getByRole("link", { name: /Glassdoor 2025/i });
    expect(glassdoorLink).toHaveAttribute("href", expect.stringContaining("glassdoor.com.br"));
    expect(glassdoorLink).toHaveAttribute("target", "_blank");
    expect(glassdoorLink).toHaveAttribute("rel", expect.stringContaining("noopener"));

    // segunda source: Catho sem url → texto puro, não vira <a>
    expect(screen.queryByRole("link", { name: /Catho 2024/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Catho 2024/)).toBeInTheDocument();
  });
});
