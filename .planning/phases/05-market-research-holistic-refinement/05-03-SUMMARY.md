---
phase: 05-market-research-holistic-refinement
plan: 03
subsystem: skills
tags: [pesquisar-mercado, websearch, webfetch, playwright, gupy, linkedin, portais-br, vagas-json, resumo-json, profilehints]

# Dependency graph
requires:
  - phase: 05-01
    provides: lista de portais BR aprovados com queries e instruções de sessão autenticada
  - phase: 05-02
    provides: roles-map.json com faixas salariais e âncoras de mercado BR
provides:
  - skill /pesquisar-mercado com 7 steps completos em .agents/skills/pesquisar-mercado/SKILL.md
  - output dual por execução: {slug}-{date}-vagas.json e {slug}-{date}-resumo.json em DATA_PATH/research/
  - profileHints estruturados (qualifications como ProfileItem[]) prontos para o /refinar-perfil
affects:
  - 05-04 (evolução do /refinar-perfil — consome o -resumo.json gerado por esta skill)
  - 05-06 (piloto end-to-end — primeira execução real da skill)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Skill /pesquisar-mercado com 7 steps conversacionais seguindo o padrão .agents/skills/"
    - "Output dual: vagas brutas (-vagas.json) + resumo executivo com profileHints (-resumo.json)"
    - "Salvamento via node -e (não heredoc) para evitar problemas de escape com aspas e newlines"
    - "Validação de path traversal via path.resolve() + startsWith(researchDir) antes de escrever"
    - "Sanitização de slug: aceitar apenas [a-z0-9-], rejeitar .., /, \\ e espaços"
    - "Detecção de sessão autenticada via ls sessions/ sem logar conteúdo do arquivo"

key-files:
  created:
    - .agents/skills/pesquisar-mercado/SKILL.md
  modified: []

key-decisions:
  - "Symlink strategy: .claude/skills e .cursor/skills apontam para .agents/skills — arquivo físico único, sem duplicação real"
  - "companySize: 'desconhecido' sempre incluído mesmo em filtros restritivos (benefício da dúvida)"
  - "qualifications em profileHints como ProfileItem[] ({ text, required }) — não string[] — para compatibilidade com JobProfile (D-01)"
  - "suggestedExperienceLevel restrito aos valores válidos do JobProfile: < 1 ano | 1-3 anos | 3-5 anos | 5-10 anos | > 10 anos"
  - "Busca nacional por padrão (sem restrição geográfica nas queries) — filtro de porte faz a âncora de qualidade"

patterns-established:
  - "Skill com output dual: arquivo bruto de evidências + arquivo de resumo/hints para consumo downstream"
  - "Verificação de colisão de nome no mesmo dia com sufixo -2, -3 antes de -vagas/-resumo"
  - "Guardrail de privacidade documentado no Notes for Agent: nunca logar credenciais, nunca persistir PII de candidatos"

requirements-completed: [IA-01, IA-02, IA-03]

# Metrics
duration: 5min
completed: 2026-04-22
---

# Phase 5 Plan 03: Skill /pesquisar-mercado Summary

**Skill /pesquisar-mercado criada com 7 steps, output dual vagas.json+resumo.json, filtro de porte de empresa, sessões autenticadas via Playwright MCP e guardrails de privacidade documentados**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-22T12:21:32Z
- **Completed:** 2026-04-22T12:26:00Z
- **Tasks:** 2 de 2
- **Files created:** 1 (arquivo físico — .agents/; .claude/ e .cursor/ são symlinks para o mesmo arquivo)

## Accomplishments

- Skill `/pesquisar-mercado` criada com 7 steps completos: escopo conversacional, detecção de sessões autenticadas, WebSearch/Playwright nos 5 portais aprovados, WebFetch das descrições, extração + filtro de porte, salvar vagas.json, gerar resumo.json + profileHints, exibir resultado
- Output dual documentado com schemas completos: `{slug}-{date}-vagas.json` (vagas brutas com stack[], behaviors[], archetype) e `{slug}-{date}-resumo.json` (summary executivo + profileHints com qualifications como ProfileItem[])
- Guardrails de segurança implementados: sanitização de slug `[a-z0-9-]`, validação de path traversal via `path.resolve()`, privacidade de arquivos de sessão (ls sem logar conteúdo), proibição de PII de candidatos

## Task Commits

1. **Task 1: Criar .agents/skills/pesquisar-mercado/SKILL.md (fonte de verdade)** — `ecce4f3` (feat)
2. **Task 2: Apontamentos .claude/ e .cursor/** — incluídos via symlink (mesmo arquivo físico do Task 1)

## Files Created/Modified

- `.agents/skills/pesquisar-mercado/SKILL.md` — fonte de verdade da skill com 7 steps, 5 portais aprovados (Gupy/Playwright, LinkedIn/Googlebot, vagas.com.br, InfoJobs, Catho/Playwright), schemas completos de vagas.json e resumo.json, filtro de porte D-26, sessões autenticadas D-25, guardrails de privacidade

## Decisions Made

- **Symlink strategy confirmada:** `.claude/skills` e `.cursor/skills` são symlinks para `.agents/skills` — o "arquivo de apontamento" é o mesmo arquivo físico. Não há duplicação real de conteúdo. O padrão do AGENTS.md ("apontamentos") se manifesta via symlink no filesystem do projeto.
- **companySize: "desconhecido" incluído em filtros restritivos:** benefício da dúvida — heurística de porte pode errar e excluir vagas relevantes de empresas não identificadas.
- **qualifications como ProfileItem[]:** obrigatoriedade de `{ text: string, required: boolean }` (não string[]) reforçada na skill para compatibilidade com o schema imutável do JobProfile (D-01).

## Deviations from Plan

### Observação sobre apontamentos

O plan especificava criação de arquivos de apontamento curtos em `.claude/skills/` e `.cursor/skills/`. Na prática, `.claude/skills` e `.cursor/skills` são **symlinks para `.agents/skills`** — portanto ao criar `.agents/skills/pesquisar-mercado/SKILL.md`, os três "arquivos" passam a existir simultaneamente no filesystem apontando para o mesmo conteúdo físico. Não há como criar apontamentos de conteúdo diferente nessa estrutura.

Este é o design intencional do AGENTS.md: "`.claude/skills/`, que aponta para `.agents/skills/`". A verificação `test -f .claude/skills/pesquisar-mercado/SKILL.md` retorna verdadeiro. Todos os critérios de aceitação da Task 2 são satisfeitos.

**Impacto:** Nenhum — comportamento idêntico ao esperado. Os três paths funcionam corretamente.

## Issues Encountered

- Hook automatizado de write tentou expandir o texto de apontamento curto com o conteúdo completo da fonte de verdade durante edições intermediárias. Resolvido ao entender que `.claude/skills` e `.cursor/skills` são symlinks — nenhum arquivo separado é necessário.

## Next Phase Readiness

- Skill `/pesquisar-mercado` pronta para uso — 05-06 pode executar o piloto end-to-end
- 05-04 pode evoluir o `/refinar-perfil` referenciando o schema de `-resumo.json` documentado nesta skill
- Pasta `data/research/` será criada automaticamente pela skill no primeiro uso via `node -e mkdir -p`

---

## Self-Check

Verificação dos artefatos:

- `.agents/skills/pesquisar-mercado/SKILL.md` — FOUND (commit ecce4f3)
- `.claude/skills/pesquisar-mercado/SKILL.md` — acessível via symlink (mesmo arquivo físico)
- `.cursor/skills/pesquisar-mercado/SKILL.md` — acessível via symlink (mesmo arquivo físico)
- `grep -c "### Step" .agents/skills/pesquisar-mercado/SKILL.md` = 7 ✓
- `grep "vagas.json" .agents/skills/pesquisar-mercado/SKILL.md` — match encontrado ✓
- `grep "resumo.json" .agents/skills/pesquisar-mercado/SKILL.md` — match encontrado ✓
- `grep "sessions/" .agents/skills/pesquisar-mercado/SKILL.md` — match encontrado ✓
- `grep "médias+" .agents/skills/pesquisar-mercado/SKILL.md` — match encontrado ✓
- `grep "node -e" .agents/skills/pesquisar-mercado/SKILL.md` — match encontrado ✓
- `grep ".." .agents/skills/pesquisar-mercado/SKILL.md` — path traversal documentado ✓
- Seção `## Notes for Agent` presente ✓
- Seção `## Troubleshooting` presente ✓

## Self-Check: PASSED

---
*Phase: 05-market-research-holistic-refinement*
*Completed: 2026-04-22*
