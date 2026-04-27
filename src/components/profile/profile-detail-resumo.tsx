"use client";

import type { Research } from "@/lib/repositories/research-repository";

const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mb-4";

// ─── Tipos espelham o schema canônico declarado em
//     .agents/skills/pesquisar-mercado/SKILL.md §6.1 e validados contra
//     data/research/{profileId}/{date}-resumo.json em produção (Phase 9 / D-30, D-31).
//     Princípio: NUNCA inventar campos no tipo nem nos mocks de teste.

interface ResearchSummaryData {
  commonTitles?: string[];
  titleAliases?: string[];
  stackFrequency?: Record<string, number>;
  // D-30: schema canônico inclui campo opcional "note" para contextualizar a faixa
  salaryRange?: { min: number; max: number; note?: string } | null;
  salarySource?: string | null;
  emergingStack?: string[];
  commonBehaviors?: string[];
  commonChallenges?: string[];
  // D-27 (Phase 9 / Item 6): schema canônico de summary.archetypes[] — campo "archetype",
  // count opcional, percentage opcional. Pode também vir como string solta (heurística antiga).
  // Fonte: .agents/skills/pesquisar-mercado/SKILL.md §6.1.
  archetypes?: Array<{ archetype: string; count?: number; percentage?: number } | string>;
  trends?: string[];
  redFlags?: string[];
}

// D-30 (Phase 9, decisão do orquestrador em modo auto):
//   - 'salaryRange.note' e 'sources[].url' → renderizados em Task 4 (custo mínimo, valor alto).
//   - 'sources[].percentiles' / 'currency' / 'location' → DEFERRED (UI mais elaborada — fase futura).
//     Permanecem aqui apenas como tipo opcional para refletir o schema canônico (princípio D-31).
interface SalaryGuide {
  min: number;
  max: number;
  currency?: string;
  location?: string;
  sources?: Array<{
    portal: string;
    year: number;
    url?: string;
    percentiles?: string;
  }>;
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

// D-27 (Phase 9 / Item 6): renderArchetype lê arch.archetype (bug corrigido: campo era "name", schema canônico usa "archetype").
// D-28: inclui percentage quando presente no formato "<archetype> — <count> menções (<percentage>%)".
function renderArchetype(
  arch: { archetype: string; count?: number; percentage?: number } | string
): string {
  if (typeof arch === "string") return arch;
  const name = arch.archetype;
  if (arch.count !== undefined && arch.percentage !== undefined) {
    return `${name} — ${arch.count} menções (${arch.percentage}%)`;
  }
  if (arch.count !== undefined) {
    return `${name} — ${arch.count} menções`;
  }
  return name;
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

  // D-22 (Phase 9 / Item 5): largura proporcional ao item top-1 (já ordenado desc).
  // Math.max(1, ...) evita divisão por zero em estado degenerado.
  const maxStackCount = sortedStack.length > 0 ? Math.max(1, sortedStack[0][1] as number) : 1;

  // D-27 (Phase 9 / Item 6): sort lê apenas "count" — não depende de name/archetype.
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
      {/* D-33 (Phase 9 / Item 7): data exibida sempre, mesmo com 1 pesquisa */}
      <p className="text-label-sm text-on-surface/60">
        Resumo de: {mostRecent.date}
      </p>

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
                  {/* D-30: render condicional de salaryRange.note — string opcional, presente em dados reais */}
                  {summary?.salaryRange?.note && (
                    <li className="text-body-md text-on-surface/60 flex gap-3">
                      <span className="shrink-0">•</span>
                      <span>{summary.salaryRange.note}</span>
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
                        {/* D-30: sources[].url → link <a> para rastreabilidade; ausente → texto puro */}
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-tertiary"
                          >
                            {source.portal} {source.year}
                          </a>
                        ) : (
                          <>{source.portal} {source.year}</>
                        )}
                        : R${" "}
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

      {/* Stack Frequência — D-20..D-24 (Phase 9 / Item 5): barras horizontais CSS puro */}
      {sortedStack.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Stack Frequência</h3>
          <div className="space-y-2">
            {sortedStack.map(([tech, count]) => {
              // D-22: largura computada como (count / maxCount) * 100%
              // Math.max(8, ...) — largura mínima de 8% para não tornar itens com count baixo invisíveis
              const widthPct = Math.max(8, ((count as number) / maxStackCount) * 100);
              return (
                <div
                  key={tech}
                  data-testid="stack-item"
                  className="relative overflow-hidden rounded-sm bg-surface-container-low"
                >
                  {/* Barra: posicionamento absoluto cobrindo o fundo da linha */}
                  <div
                    className="absolute inset-y-0 left-0 bg-tertiary/20"
                    style={{ width: `${widthPct}%` }}
                    aria-hidden="true"
                  />
                  {/* Conteúdo (D-23): nome + contagem visíveis SEMPRE, sobrepostos à barra */}
                  <div className="relative flex items-center justify-between py-2 px-3">
                    <span className="text-body-md text-on-surface">{tech}</span>
                    <span className="text-label-sm font-medium text-on-surface/70">
                      {count} menções
                    </span>
                  </div>
                </div>
              );
            })}
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

      {/* Stack Emergente — D-25: lista simples de strings (sem barra — sem count quantitativo) */}
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
