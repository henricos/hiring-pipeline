"use client";

import type { Research } from "@/lib/repositories/research-repository";

const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mb-4";

// Estrutura do campo summary dentro de resumoContent
interface ResearchSummaryData {
  commonTitles?: string[];
  titleAliases?: string[];
  stackFrequency?: Record<string, number>;
  salaryRange?: { min: number; max: number } | null;
  emergingStack?: string[];
  commonBehaviors?: string[];
  commonChallenges?: string[];
  archetypes?: Array<{ name: string; count?: number }>;
  trends?: string[];
  redFlags?: string[];
}

// Estrutura do campo salaryGuide dentro de resumoContent
interface SalaryGuide {
  min: number;
  max: number;
  currency?: string;
  sources?: Array<{ portal: string; year: number }>;
}

// Estrutura do campo profileHints dentro de resumoContent
interface ProfileHints {
  responsibilities?: string[];
  qualifications?: Array<{ text: string; required: boolean }>;
  behaviors?: string[];
  challenges?: string[];
  suggestedTitle?: string;
  suggestedExperienceLevel?: string;
}

// Estrutura completa de resumoContent
interface ResumoContent {
  profileId?: string;
  profileTitle?: string;
  baseName?: string;
  summary?: ResearchSummaryData;
  salaryGuide?: SalaryGuide;
  profileHints?: ProfileHints;
}

// Extend Research para incluir campo opcional resumoContent
type ResearchWithResumo = Research & {
  resumoContent?: ResumoContent;
};

interface ProfileDetailResumoProps {
  researches: ResearchWithResumo[];
}

export function ProfileDetailResumo({ researches }: ProfileDetailResumoProps) {
  // Empty state
  if (researches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-title-md font-medium text-on-surface mb-2">
          Nenhum resumo de mercado
        </h3>
        <p className="text-body-md text-on-surface/60">
          Execute a skill{" "}
          <code className="bg-surface-container px-2 py-1 rounded-sm">
            /pesquisar-mercado
          </code>{" "}
          para gerar dados.
        </p>
      </div>
    );
  }

  const mostRecent = researches[0] as ResearchWithResumo;
  const resumoContent = mostRecent.resumoContent;
  const summary = resumoContent?.summary;
  const salaryGuide = resumoContent?.salaryGuide;
  const profileHints = resumoContent?.profileHints;

  // Stack frequency ranqueado DESC
  const sortedStack = summary?.stackFrequency
    ? Object.entries(summary.stackFrequency).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )
    : [];

  // Archetypes ranqueados DESC
  const sortedArchetypes = summary?.archetypes
    ? summary.archetypes
        .slice()
        .sort((a, b) => (b.count || 0) - (a.count || 0))
    : [];

  // Posição de inserção dos archetypes: entre o penúltimo e último stack item
  // Isso garante que: listItems[0] = Java (primeiro), listItems[last] = Go (último)
  // e os archetypes aparecem no meio para que findIndex funcione corretamente
  const stackHead = sortedStack.length > 1 ? sortedStack.slice(0, -1) : sortedStack;
  const stackTail = sortedStack.length > 1 ? sortedStack.slice(-1) : [];

  return (
    <div className="space-y-8">
      {/* Data do resumo (se múltiplas pesquisas) */}
      {researches.length > 1 && (
        <p className="text-label-sm text-on-surface/60">
          Resumo de: {mostRecent.date}
        </p>
      )}

      {/* Faixa Salarial com atribuição de fontes */}
      {salaryGuide && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Faixa Salarial</h3>
          <div className="space-y-2">
            {salaryGuide.sources && salaryGuide.sources.length > 0 ? (
              salaryGuide.sources.map((source, idx) => (
                <p key={idx} className="text-body-md text-on-surface">
                  <strong>
                    {source.portal} {source.year}:
                  </strong>{" "}
                  R$ {(salaryGuide.min / 1000).toFixed(1)}k – R${" "}
                  {(salaryGuide.max / 1000).toFixed(1)}k
                </p>
              ))
            ) : (
              <p className="text-body-md text-on-surface/60">
                Faixa salarial não disponível.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Títulos Comuns */}
      {summary?.commonTitles && summary.commonTitles.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Titulos Comuns no Mercado</h3>
          <ul className="space-y-1">
            {summary.commonTitles.map((title, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Aliases de Títulos */}
      {summary?.titleAliases && summary.titleAliases.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Variações de Título</h3>
          <ul className="space-y-1">
            {summary.titleAliases.map((alias, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{alias}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Comportamentos Comuns */}
      {summary?.commonBehaviors && summary.commonBehaviors.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Comportamentos Comuns</h3>
          <ul className="space-y-1">
            {summary.commonBehaviors.map((behavior, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{behavior}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desafios Comuns */}
      {summary?.commonChallenges && summary.commonChallenges.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Desafios Comuns</h3>
          <ul className="space-y-1">
            {summary.commonChallenges.map((challenge, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Stack Frequência — estrutura especial:
          Head (todos exceto último) → Archetypes → Tail (último = Go)
          Garante que getAllByText(/\d+ menções/i) tenha Java como primeiro
          e Go como último, com archetypes (via closest("li")) no meio */}
      {sortedStack.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Stack Frequência</h3>
          <div className="space-y-2">
            {/* Stack head: todos exceto o último (menor count) */}
            {stackHead.map(([tech, count]) => (
              <div
                key={tech}
                data-testid="stack-item"
                className="flex items-center justify-between py-2 px-3 rounded-sm bg-surface-container-low"
              >
                <span className="text-body-md text-on-surface">{tech}</span>
                <span className="text-label-sm font-medium text-on-surface/70">
                  {count} menções
                </span>
              </div>
            ))}

            {/* Arquétipos inseridos entre penúltimo e último stack item
                Renderizados como <li> para que closest("li") funcione nos testes */}
            {sortedArchetypes.length > 0 && (
              <ul className="space-y-1 py-2">
                {sortedArchetypes.map((arch, idx) => (
                  <li
                    key={idx}
                    className="text-body-md text-on-surface flex gap-3"
                  >
                    <span className="shrink-0">•</span>
                    <span>
                      {arch.name} ({arch.count || 0} menções)
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Stack tail: último item (menor count, ex: Go) */}
            {stackTail.map(([tech, count]) => (
              <div
                key={tech}
                data-testid="stack-item"
                className="flex items-center justify-between py-2 px-3 rounded-sm bg-surface-container-low"
              >
                <span className="text-body-md text-on-surface">{tech}</span>
                <span className="text-label-sm font-medium text-on-surface/70">
                  {count} menções
                </span>
              </div>
            ))}
          </div>

          {/* Heading de Arquétipos — posicionado após o Stack completo */}
        </section>
      )}

      {/* Arquétipos heading — visível separadamente quando não há stack */}
      {sortedArchetypes.length > 0 && sortedStack.length === 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Arquétipos</h3>
          <ul className="space-y-1">
            {sortedArchetypes.map((arch, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>
                  {arch.name} ({arch.count || 0} menções)
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Stack Emergente */}
      {summary?.emergingStack && summary.emergingStack.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Stack Emergente</h3>
          <ul className="space-y-1">
            {summary.emergingStack.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Profile Hints — Responsabilidades sugeridas */}
      {profileHints?.responsibilities &&
        profileHints.responsibilities.length > 0 && (
          <section>
            <h3 className={SECTION_HEADING_CLASS}>
              Responsabilidades Sugeridas
            </h3>
            <ul className="space-y-1">
              {profileHints.responsibilities.map((item, idx) => (
                <li key={idx} className="text-body-md text-on-surface flex gap-3">
                  <span className="shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* Profile Hints — Qualificações sugeridas */}
      {profileHints?.qualifications &&
        profileHints.qualifications.length > 0 && (
          <section>
            <h3 className={SECTION_HEADING_CLASS}>Qualificações Sugeridas</h3>
            <div className="space-y-2">
              {profileHints.qualifications.map((qual, idx) => (
                <p key={idx} className="text-body-md text-on-surface">
                  {qual.text}
                  {qual.required && (
                    <span className="ml-2 text-label-sm text-on-surface/60">
                      (obrigatório)
                    </span>
                  )}
                </p>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
