"use client";

import type { Research } from "@/lib/repositories/research-repository";

const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mb-4";

interface ResearchSummaryData {
  commonTitles?: string[];
  titleAliases?: string[];
  stackFrequency?: Record<string, number>;
  salaryRange?: { min: number; max: number } | null;
  salarySource?: string | null;
  emergingStack?: string[];
  commonBehaviors?: string[];
  commonChallenges?: string[];
  archetypes?: Array<{ name: string; count?: number } | string>;
  trends?: string[];
  redFlags?: string[];
}

interface SalaryGuide {
  min: number;
  max: number;
  currency?: string;
  sources?: Array<{ portal: string; year: number }>;
}

interface ProfileHints {
  responsibilities?: string[];
  qualifications?: Array<{ text: string; required: boolean }>;
  behaviors?: string[];
  challenges?: string[];
  suggestedTitle?: string;
  suggestedExperienceLevel?: string;
}

interface ResumoContent {
  profileId?: string;
  profileTitle?: string;
  baseName?: string;
  summary?: ResearchSummaryData;
  salaryGuide?: SalaryGuide | null;
  profileHints?: ProfileHints;
}

type ResearchWithResumo = Research & {
  resumoContent?: ResumoContent;
};

interface ProfileDetailResumoProps {
  researches: ResearchWithResumo[];
}

function renderArchetype(arch: { name: string; count?: number } | string): string {
  if (typeof arch === "string") return arch;
  if (arch.count) return `${arch.name} (${arch.count} menções)`;
  return arch.name;
}

export function ProfileDetailResumo({ researches }: ProfileDetailResumoProps) {
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

  const MARKET_SEPARATOR = "Dados secundários de mercado:";
  const vagasSalaryLine: string | null = summary?.salarySource
    ? (summary.salarySource.split(MARKET_SEPARATOR)[0] ?? "")
        .replace(/\.\s*$/, "")
        .trim() || null
    : null;
  const marketSources: string[] = summary?.salarySource?.includes(MARKET_SEPARATOR)
    ? (summary.salarySource.split(MARKET_SEPARATOR)[1] ?? "")
        .split(";")
        .map((s) => s.trim().replace(/\.\s*$/, ""))
        .filter(Boolean)
    : [];

  const sortedStack = summary?.stackFrequency
    ? Object.entries(summary.stackFrequency).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )
    : [];

  const sortedArchetypes = summary?.archetypes
    ? summary.archetypes
        .slice()
        .sort((a, b) => {
          const countA = typeof a === "string" ? 0 : (a.count ?? 0);
          const countB = typeof b === "string" ? 0 : (b.count ?? 0);
          return countB - countA;
        })
    : [];

  const hasSalaryInfo =
    salaryGuide || summary?.salaryRange || summary?.salarySource;

  return (
    <div className="space-y-8">
      {researches.length > 1 && (
        <p className="text-label-sm text-on-surface/60">
          Resumo de: {mostRecent.date}
        </p>
      )}

      {/* Faixa Salarial */}
      {hasSalaryInfo && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Faixa Salarial</h3>
          <div className="space-y-6">

            {/* Bloco 1: Das Vagas */}
            {(vagasSalaryLine || summary?.salaryRange) && (
              <div>
                <p className="text-label-sm font-semibold uppercase tracking-[0.05em] text-on-surface/60 mb-2">
                  Das Vagas
                </p>
                <ul className="space-y-1">
                  {vagasSalaryLine && (
                    <li className="text-body-md text-on-surface flex gap-3">
                      <span className="shrink-0">•</span>
                      <span>{vagasSalaryLine}</span>
                    </li>
                  )}
                  {summary?.salaryRange && (
                    <li className="text-body-md text-on-surface flex gap-3">
                      <span className="shrink-0">•</span>
                      <span>
                        Faixa: R${" "}
                        {(summary.salaryRange.min / 1000).toFixed(1)}k – R${" "}
                        {(summary.salaryRange.max / 1000).toFixed(1)}k
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Bloco 2: Pesquisa de Mercado */}
            {(marketSources.length > 0 ||
              (salaryGuide?.sources && salaryGuide.sources.length > 0)) && (
              <div>
                <p className="text-label-sm font-semibold uppercase tracking-[0.05em] text-on-surface/60 mb-2">
                  Pesquisa de Mercado
                </p>
                <ul className="space-y-1">
                  {salaryGuide?.sources?.map((source, idx) => (
                    <li key={idx} className="text-body-md text-on-surface flex gap-3">
                      <span className="shrink-0">•</span>
                      <span>
                        {source.portal} {source.year}: R${" "}
                        {(salaryGuide.min / 1000).toFixed(1)}k – R${" "}
                        {(salaryGuide.max / 1000).toFixed(1)}k
                      </span>
                    </li>
                  ))}
                  {marketSources.map((source, idx) => (
                    <li key={idx} className="text-body-md text-on-surface flex gap-3">
                      <span className="shrink-0">•</span>
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
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

      {/* Stack Frequência */}
      {sortedStack.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Stack Frequência</h3>
          <div className="space-y-2">
            {sortedStack.map(([tech, count]) => (
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
        </section>
      )}

      {/* Arquétipos */}
      {sortedArchetypes.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Arquétipos</h3>
          <ul className="space-y-1">
            {sortedArchetypes.map((arch, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{renderArchetype(arch)}</span>
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

      {/* Responsabilidades Sugeridas */}
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

      {/* Qualificações Sugeridas */}
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
