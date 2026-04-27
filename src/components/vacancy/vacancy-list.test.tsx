import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VacancyList } from "@/components/vacancy/vacancy-list";
import type { Vacancy } from "@/lib/vacancy";
import type { JobProfile } from "@/lib/profile";

// ─── Mocks do Next.js ────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <a href={href} {...rest}>{children}</a>,
}));

vi.mock("@/app/actions/vacancy", () => ({
  deleteVacancy: vi.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProfile: JobProfile = {
  id: "profile-001",
  title: "Desenvolvedor Backend Pleno",
  suggestedTitle: "Backend Developer",
  experienceLevel: "3-5 anos",
  educationLevel: "Superior completo",
  postGraduateLevel: "Não exigido",
  certifications: "Não",
  responsibilities: [],
  qualifications: [],
  behaviors: [],
  challenges: [],
  createdAt: "2026-04-01T10:00:00.000Z",
  updatedAt: "2026-04-01T10:00:00.000Z",
};

const mockVacancy: Vacancy = {
  id: "vacancy-abc123",
  profileId: "profile-001",
  status: "Aberta",
  requestType: "Recrutamento externo",
  quantity: 2,
  salaryRange: "R$ 8.000 - R$ 12.000",
  confidential: false,
  budgeted: true,
  headcountIncrease: false,
  expectedHireDate: "2026-05-01",
  openedAt: "2026-04-10T14:00:00.000Z",
};

const profileMap = new Map<string, JobProfile>([[mockProfile.id, mockProfile]]);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Testes: presença e ordem dos botões de ação ───────────────────────────────

describe("VacancyList — botão Download", () => {
  it("renderiza botão Download para cada vaga na lista", () => {
    render(
      <VacancyList
        vacancies={[mockVacancy]}
        profiles={profileMap}
        apiPrefix=""
      />
    );

    const downloadBtn = screen.getByRole("link", {
      name: /baixar formulário gh da vaga desenvolvedor backend pleno/i,
    });
    expect(downloadBtn).toBeInTheDocument();
  });

  it("botão Download aponta para /api/vacancies/{id}/form sem ?regen=1 (D-10)", () => {
    render(
      <VacancyList
        vacancies={[mockVacancy]}
        profiles={profileMap}
        apiPrefix=""
      />
    );

    const downloadLink = screen
      .getByRole("link", {
        name: /baixar formulário gh da vaga/i,
      })
      .closest("a");

    expect(downloadLink).toHaveAttribute(
      "href",
      "/api/vacancies/vacancy-abc123/form"
    );
    expect(downloadLink?.getAttribute("href")).not.toContain("regen");
  });

  it("botão Download inclui atributo download (D-13 — <a> cru, não <Link>)", () => {
    render(
      <VacancyList
        vacancies={[mockVacancy]}
        profiles={profileMap}
        apiPrefix=""
      />
    );

    const downloadLink = screen
      .getByRole("link", {
        name: /baixar formulário gh da vaga/i,
      })
      .closest("a");

    expect(downloadLink).toHaveAttribute("download");
  });

  it("apiPrefix é prefixado corretamente na URL do Download (D-12)", () => {
    render(
      <VacancyList
        vacancies={[mockVacancy]}
        profiles={profileMap}
        apiPrefix="/hiring-pipeline"
      />
    );

    const downloadLink = screen
      .getByRole("link", {
        name: /baixar formulário gh da vaga/i,
      })
      .closest("a");

    expect(downloadLink).toHaveAttribute(
      "href",
      "/hiring-pipeline/api/vacancies/vacancy-abc123/form"
    );
  });

  it("apiPrefix default vazio quando prop não fornecida (retrocompatibilidade)", () => {
    render(
      <VacancyList vacancies={[mockVacancy]} profiles={profileMap} />
    );

    const downloadLink = screen
      .getByRole("link", {
        name: /baixar formulário gh da vaga/i,
      })
      .closest("a");

    expect(downloadLink).toHaveAttribute(
      "href",
      "/api/vacancies/vacancy-abc123/form"
    );
  });

  it("ordem dos botões: Download vem antes de Edit e Delete (D-11)", () => {
    const { container } = render(
      <VacancyList
        vacancies={[mockVacancy]}
        profiles={profileMap}
        apiPrefix=""
      />
    );

    // Pega o container de ações
    const actionDiv = container.querySelector(".flex.gap-1.shrink-0");
    expect(actionDiv).not.toBeNull();

    const buttons = actionDiv!.querySelectorAll("button, a");
    // Primeiro botão/link deve ser o Download (aria-label contém "Baixar")
    expect(buttons[0]).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Baixar")
    );
  });

  it("todos os 3 botões de ação são renderizados: Download, Edit, Delete", () => {
    render(
      <VacancyList
        vacancies={[mockVacancy]}
        profiles={profileMap}
        apiPrefix=""
      />
    );

    expect(
      screen.getByRole("link", { name: /baixar formulário gh da vaga/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /editar vaga/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /excluir vaga/i })
    ).toBeInTheDocument();
  });
});
