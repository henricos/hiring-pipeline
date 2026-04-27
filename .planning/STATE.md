---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: — Profile-Anchored Market Research
status: executing
last_updated: "2026-04-27T16:16:19.185Z"
last_activity: 2026-04-27
progress:
  total_phases: 8
  completed_phases: 6
  total_plans: 31
  completed_plans: 41
  percent: 100
---

# State: Hiring Pipeline v1.1

**Last updated:** 2026-04-25  
**Mode:** YOLO (iterate on feedback, validate with users)
**v1.0 Status:** Complete ✓ 2026-04-25 (5 phases, 100%)

---

## Project Reference

**Core Value:** Transform fragmented hiring process from email/spreadsheets into an assisted, reusable, auditable flow — opening vacancies faster and screening candidates with consistency.

**Phase 3 Status:** Complete ✓ 2026-04-21 (12/12 planos executados)
**Phase 4 Status:** Complete ✓ 2026-04-21 (5/5 planos + code review PASS WITH NOTES + verificação PASS)
**Phase 5 Status:** Complete ✓ 2026-04-25 (6/6 planos executados — piloto end-to-end validado)
**Phase 6 Status:** Complete ✓ 2026-04-26 (1/1 plano executado — skill /criar-perfil criada)
**Phase 7 Status:** Complete ✓ 2026-04-26 (3/3 planos executados — /pesquisar-mercado ancorado, /refinar-perfil corrigido, legados migrados e convertidos)
**Phase 8 Status:** Complete ✓ 2026-04-26 (4/4 planos — ResearchRepository, Server Actions, componentes UI, página detalhe + navegação)
**Phase 9 Status:** Planned ✓ 2026-04-27 (6 planos em 2 waves — verificação passou na 2ª iteração)
**Current Focus:** Phase 09 — pequenos-ajustes-p-s-v1-1-1

---

## Current Position

Phase: 09
Plan: Not started
Status: Executing Phase 09
Last activity: 2026-04-27

**Progress bar:** `[x] [x] [x] [~]` (3/4 phases — Phase 9 pronta para execução)

**At risk:** None

---

## v1.1 Roadmap

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 6. Guided Profile Creation Skill | Manager can create market-validated minimal profile from a job title via `/criar-perfil` | CRIA-01, CRIA-02, CRIA-03 | Complete ✓ 2026-04-26 |
| 7. Profile-Anchored Market Research | Research files anchored to profile ID, salary ranges in resumo, accumulate by date, `/atualizar-roles-map` deprecated | PESQ-01, PESQ-02, PESQ-03, PESQ-04 | Complete ✓ 2026-04-26 |
| 8. Market Research Frontend | Profile screen with tabs (Perfil / Vagas / Resumo de Mercado) showing anchored research | VIZ-01, VIZ-02, VIZ-03 | Complete ✓ 2026-04-26 |
| 9. Pequenos ajustes pós-v1.1.1 | Ajustes de continuidade após release v1.1.1 | TBD | Context captured ✓ 2026-04-27 |

---

## Decision Log

### Phase 8 — Correção de UX pós-release (v1.1.1, 2026-04-27)

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-27 | Rota `/profiles/[id]/edit` **removida permanentemente** | A fase 8 criou uma página de detalhe read-only separada da edição. O feedback de UX identificou que o fluxo correto é uma única tela com abas — não duas rotas. A rota `/edit` é obsoleta e não deve ser recriada. | **Active — não reverter** |
| 2026-04-27 | Componente `ProfileDetailPerfil` **removido permanentemente** | Era o modo read-only da aba Perfil. Substituído pelo `ProfileForm` diretamente na aba. Recriar este componente introduz regressão de UX. | **Active — não reverter** |
| 2026-04-27 | Clique na linha da lista de perfis **removido** | O `onClick` do row navegava para `/profiles/[id]`. Com a unificação, o lápis (único ponto de entrada) já navega para lá. O clique no row era redundante e confuso. | **Active — não reverter** |
| 2026-04-27 | Aba "Vagas" renomeada para "Vagas do Mercado" | Distingue claramente pesquisa de mercado de vagas internas abertas. | Active |
| 2026-04-27 | Faixa Salarial: dois blocos separados ("Das Vagas" e "Pesquisa de Mercado") | `salaryGuide` é null em todos os perfis reais; os dados salariais estão em `summary.salarySource` como string rica. O campo `salarySource` é parseado automaticamente pelo separador `"Dados secundários de mercado:"`. | Active |

**Fluxo de navegação canônico (v1.1.1+):**

```
/profiles  →  ícone lápis  →  /profiles/[id]  (3 abas: Perfil=edit, Vagas do Mercado, Resumo)
                               aba Perfil  →  salvar  →  /profiles
```

### Phase 5 Decisions (05-04)

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-22 | Carregar apenas o -resumo.json no Step 2 (não o -vagas.json) | vagas.json é arquivo de auditoria/histórico; resumo.json contém profileHints estruturados prontos para injeção no prompt — D-11 | Active |
| 2026-04-22 | marketResearch=null mantém fluxo original sem degradação | Retrocompatibilidade garantida — pular pesquisa funciona exatamente como antes (apenas System prompt 1) | Active |
| 2026-04-22 | Step 5 holístico opera sobre perfil pós-A/R/J em memória | Gravação real só no Step 6 após confirmação explícita do gestor — mesma proteção já existente no fluxo | Active |
| 2026-04-22 | IA usa apenas os 4 campos do JobProfile ao aplicar sugestões do holístico | D-01 imutável — nunca inventar campos novos; riqueza do mercado expressada dentro dos campos existentes | Active |

### Phase 5 Decisions (05-03)

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-22 | Skill /pesquisar-mercado com output dual vagas.json + resumo.json | Separar evidências brutas (auditoria/histórico) de resumo executivo (consumido por /refinar-perfil) — D-05 | Active |
| 2026-04-22 | .claude/skills e .cursor/skills são symlinks para .agents/skills — arquivo único | Não há "apontamentos" separados: qualquer arquivo criado em .agents/skills/ já é acessível nos três paths automaticamente | Active |
| 2026-04-22 | companySize "desconhecido" sempre incluído mesmo em filtros restritivos | Heurística de porte pode errar; benefício da dúvida evita perder vagas relevantes de empresas não identificadas — D-26 | Active |
| 2026-04-22 | qualifications em profileHints como ProfileItem[] ({ text, required }) | Compatibilidade obrigatória com schema imutável do JobProfile (D-01); não quebrar downstream do /refinar-perfil | Active |

### Phase 5 Decisions (05-02)

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-22 | roles-map.json com 12 cargos (acima do mínimo de 10) | Cobertura completa do espectro Júnior→Principal + roles emergentes (AI Engineer, Platform Engineer) | Active |
| 2026-04-22 | Todos os 12 cargos com salaryRange não-null | Fontes públicas (Robert Half, Glassdoor BR, Catho, Revelo) disponíveis para todos os níveis | Active |
| 2026-04-22 | Campo `methodology` adicionado ao JSON raiz | Transparência sobre cálculo das faixas (percentil 25-75 CLT mensal bruta) — não viola schema D-24 | Active |
| 2026-04-22 | Glassdoor BR bloqueado (WebFetch) — dados via guias salariais públicos | Conforme documentado em 05-01-PORTALS.md; dados salariais obtidos via consolidação de fontes públicas | Active |

### Phase 5 Decisions (05-01)

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-22 | LinkedIn aprovado via User-Agent Googlebot | Retorna 22-25 vagas na SERP e descrições completas sem autenticação; Chrome UA causa redirect para login | Active |
| 2026-04-22 | Gupy requer Playwright/sessão autenticada | Lista de vagas 100% client-side JS + JWT; sem endpoint público anônimo | Active |
| 2026-04-22 | Glassdoor descartado — 403 consistente | Bloqueado em todas as variações testadas (4 URLs, 3 User-Agents) | Active |
| 2026-04-22 | Catho descartado — fora do ar | Domínio retorna 404 em qualquer URL em abril/2026 | Active |
| 2026-04-22 | Query PT preferencial para LinkedIn | +2-3 vagas vs EN; Staff Engineer como exceção (quase exclusivamente EN no mercado BR) | Active |

### Foundational Decisions

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-19 | 4-phase structure (Foundation → Profiles → Vacancies → AI) | Requirements naturally separate into 4 coherent delivery capabilities; Phase 3 (Vacancy/Excel) delivers highest operational value first; Phase 4 (AI via CLI) comes after | Active |
| 2026-04-20 | Swap Phase 3↔4 — Vacancy/Excel antes de AI | IA no v1 é 100% via CLI/skills (sem UI nativa); gerar Excel é valor imediato e independente de IA | Active |
| 2026-04-19 | JSON persistence over SQLite | Portability between machines via git; allows version control of hiring data | Active |
| 2026-04-19 | CLI external agents for AI (v1) | Validates hiring workflows quickly without native LLM integration complexity; Agent SDK integrates in v2 | Active |
| 2026-04-19 | Defer candidate management to v2 | v1 focuses on vacancy opening (higher operational pain); candidate screening deferred to v2 | Active |
| 2026-04-20 | Repository pattern for data layer | `ProfileRepository` interface + `JsonProfileRepository` in `src/lib/repositories/`; server actions never call `fs.*` directly — swap to DB = new implementation only, zero changes in actions or components | Active |
| 2026-04-20 | `/data` folder structure: table=folder, record=file | `data/profiles/` (Phase 2), `data/vacancies/` (Phase 4), `data/templates/` (move template — Phase 4 chore) | Active |
| 2026-04-20 | Excel template move to `data/templates/` | Template is sensitive operational data; Phase 4 will read from `data/templates/requisicao-de-pessoal.xlsx` and write generated file to OS temp dir for download — not committed to main repo | Pending (Phase 4) |

---

## Accumulated Context

### Blocking Issues

None.

### Tech Notes

- Stack mirrors ai-pkm (Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui)
- Data lives in `/data` mounted volume; no relational DB in v1
- Base path configurable via `APP_BASE_PATH` env var
- Deployment: Docker multi-stage (node:22-alpine) + Compose
- `.claude/skills` and `.cursor/skills` are symlinks to `.agents/skills` — single source of truth

### v1.1 Context

- Phase 6 (`/criar-perfil`): nova skill — fluxo nome → análise de força no mercado → geração de perfil mínimo com campos preenchidos com valores-base. Perfil gerado fica pronto para refinamento via `/refinar-perfil`.
- Phase 7 (ancoragem `/pesquisar-mercado`): arquivos passam a incluir `profileId` no path ou no conteúdo; `-resumo.json` absorve faixas salariais do roles-map; pesquisas acumulam por data; `/atualizar-roles-map` descontinuada.
- Phase 8 (frontend): tela `/profiles/[id]` ganha abas — "Perfil" (formulário de edição), "Vagas do Mercado" (lista de pesquisas vinculadas ao perfil), "Resumo de Mercado" (conteúdo do `-resumo.json` mais recente + seletor de pesquisas anteriores).
  - **v1.1.1 — DESIGN CANÔNICO:** a aba "Perfil" É o formulário de edição (`ProfileForm`). Não existe modo read-only separado nem rota `/profiles/[id]/edit`. Ver Decision Log abaixo.

### Insights

- GH Excel form template at `templates/requisicao-de-pessoal.xlsx`
- Manager is single-user; auth via next-auth env credentials
- AI agents accessed via CLI skills (Claude Code, Cursor, Codex)
- Vacancy opening prioritized because it's highest operational drudgery (manual Excel fills)

### Roadmap Evolution

- 2026-04-21: Phase 5 added — Market Research & Holistic Profile Refinement (sobra de v1.0, antes do bump SemVer). Brief completo em `.planning/phases/05-market-research-holistic-refinement/05-CONTEXT.md` (decisões D-01 a D-21, canonical refs, sub-plans, verification). JobProfile schema declared immutable for this phase — riqueza extra (stack híbrido, arquétipo) tem que caber nos campos existentes.
- 2026-04-25: v1.1 roadmap defined — Phases 6-8 covering CRIA, PESQ, VIZ requirement groups (10 requirements total, 100% mapped).
- 2026-04-27: Phase 9 added — Pequenos ajustes pós-v1.1.1 (continuidade do milestone v1.1 após release patch v1.1.1; escopo a detalhar em /gsd-plan-phase 9).

---

## Session Continuity

### Starting Phase

Phase 9: Pequenos ajustes pós-v1.1.1 (contexto capturado, aguarda planejamento)

### What Needs to Happen Next

1. Rodar `/gsd-plan-phase 9` para quebrar os 7 itens do CONTEXT.md em planos executáveis
2. Itens 2 e 3 têm dependência sequencial (Item 3 limpa o `?regen=1` que Item 2 desabilitou) — planejar ordem coerente
3. Item 6 inclui auditoria colateral de schema (D-30) — pode crescer durante execução; planejar buffer
4. Após execução completa de Phase 9, decidir se vira release patch (v1.1.2) ou se acumula com mais ajustes para v1.2.0

### Sessão de Discussão Phase 09 — Contexto (2026-04-27)

- Phase 9 adicionada ao roadmap como continuidade do milestone v1.1 (sem novo milestone)
- Contexto capturado via `/gsd-discuss-phase 9` em modo interativo livre (escopo emergente, sem gray-area pré-definidas)
- 7 itens fechados pelo gestor:
  1. Excel: campo "informações adicionais" não respeita `\n` e fica centralizado (template B59 + `xml:space="preserve"`)
  2. Excel: rota falha em prod (DATA_PATH read-only) — eliminar cache + escrever em `os.tmpdir()`, sem env var nova
  3. UI: botão de download no card da `/vacancies` (ordem `[Download] [Edit] [Delete]`)
  4. UI: textareas `rows={2}` + `resize-none` em "Conteúdo Descritivo" (4 sub-seções)
  5. UI: gráfico de barras horizontais em CSS puro pra "Stack Frequência" (sem chart library)
  6. Bug: arquétipos renderizam `undefined (X menções)` — schema mismatch (`name` vs `archetype`); fix de código + teste + auditoria colateral
  7. UX: simplificar multi-pesquisa — sempre mostrar só a mais recente, exibir data sempre, **remover** switcher de Vagas; histórico fica no repo separado montado em `/data`
- Profile concreto onde Item 6 se manifesta: `8b09c8eb-6db0-454b-9abd-4bab1ac2dded`
- Esclarecimento crítico do gestor: `/data` é gitignored neste repo, mas existe **outro repo versionado** montado em `/data` que guarda o histórico — informa decisão de Item 7
- Princípio reforçado durante Item 6: mocks de teste devem refletir schema canônico declarado em `.agents/skills/.../SKILL.md`, não inventar campos
- Artefatos gerados: `09-CONTEXT.md` + `09-DISCUSSION-LOG.md` (commits aguardando autorização do gestor — política `AGENTS.md`)

### Sessão de Execução Phase 06 — Plano 06-01 (2026-04-26)

- Plano 06-01 concluído: skill /criar-perfil criada como fonte de verdade em .agents/skills/criar-perfil/SKILL.md
- 6 steps completos: Step 0 (env), Step 1 (normalização título + inferência nível), Step 2 (WebSearch força de mercado), Step 3 (preview de confirmação), Step 4 (UUID + montar stub), Step 5 (persistir JSON), Step 6 (resultado + próximos passos)
- Acessível automaticamente via .claude/skills/ e .cursor/skills/ (mesmo inode 3698371)
- Tabela de mapeamento senioridade incluída (5 valores válidos do union type ExperienceLevel)
- Classificação de força (forte/médio/fraco/nicho) baseada em WebSearch executado ao vivo — nunca em conhecimento de treinamento
- Preview (Step 3) omite campos placeholder intencionalmente (D-11 do CONTEXT.md)
- Path traversal guard: path.resolve() + startsWith(profilesDir + path.sep) — mesmo padrão de pesquisar-mercado
- node -e com aspas simples em todos os blocos bash (evita expansão de $)
- 109 testes vitest passando — schema JobProfile imutável não foi tocado
- Requirements CRIA-01, CRIA-02, CRIA-03 cobertos

### Sessão de Execução Phase 05 — Plano 05-06 (2026-04-25)

- Plano 05-06 concluído: piloto end-to-end /pesquisar-mercado → /refinar-perfil → /abrir-vaga → Excel
- Escopo piloto: Desenvolvedor Frontend Sênior | SP | médias+ | profundidade média
- Pesquisa gerada: dev-frontend-senior-2026-04-25-vagas.json (15 jobs) + resumo.json (4 campos profileHints)
- Filtro médias+ ativo: 0 vagas de pequenas empresas
- Perfil refinado: Desenvolvedor Frontend Sênior (f12a81a0) — schema D-01 respeitado (string[], ProfileItem[])
- Vaga criada: df1e8fb7 às 22:32:13 UTC; Excel gerado sem erro pela web app
- Checklist CONTEXT.md: 9/10 PASS (item 10 — sufixo -2 — não testado explicitamente no piloto)
- Phase 5 completa: 6/6 planos executados — milestone v1.0 pronto para bump SemVer via /fechar-versao

### Sessão de Execução Phase 05 — Plano 05-05 (2026-04-25)

- Plano 05-05 concluído: aiProfileInstructions da área P&D/Lyceum persistido em settings.json
- Valor validado pelo gestor diretamente via /settings na web app (campo "Instruções para IA montar perfil")
- Conteúdo cobre todos os vetores D-23: stack tri-linguagem (Java mandatório, Python funcional, TS diferencial), cultura POC/experimentação (~50% POCs), IA generativa aplicada (praticamente eliminatório para Sênior+ sem exposição), arquétipo misto (problem-solver autônomo + multiplicador + conector técnico-negócio), 9 red flags documentados
- SUMMARY 05-05 já existia com registro completo da discussão socrática e template reutilizável para outras áreas
- Concluído sem nova discussão socrática — gestor havia refinado e validado o texto anteriormente

### Sessão de Execução Phase 05 — Plano 05-04 (2026-04-22)

- Plano 05-04 concluído: skill /refinar-perfil evoluída com pesquisa de mercado + Step 5 holístico
- Step 2 renomeado para "Carregar Perfil, Contexto de Área e Pesquisa de Mercado"
- Listagem de *-resumo.json ordenados por data desc com data legível (hoje/ontem/N dias atrás)
- Carregamento exclusivo do -resumo.json (não o -vagas.json — arquivo de auditoria/histórico)
- marketResearch registrado em memória para uso nos Steps 3-4 e Step 5 holístico
- Três contextos empilhados: aiProfileInstructions + pesquisa + perfil (quando marketResearch não é null)
- Instrução de priorização com guardrail D-01: expressar riqueza do mercado dentro dos 4 campos existentes
- Retrocompatível: marketResearch=null usa apenas System prompt 1 (fluxo original preservado)
- Novo Step 5: Revisão Holística com 4 tipos de incoerência (Lacuna R×Q, Redundância, Descalibração, Lacuna comportamental)
- Padrão [A]plicar/[I]gnorar/[J]ustar por finding — sem limite de findings — resumo ao final
- Steps antigos 5→6 (Confirmar e Gravar) e 6→7 (Confirmar Conclusão) renumerados — conteúdo preservado
- Apontamentos .claude/skills e .cursor/skills não modificados (mesmo inode — hard links confirmados)
- Commit: 5bd2658 (.agents/skills/refinar-perfil/SKILL.md)
- Concluído sem checkpoints — plano totalmente autônomo (2 tasks, ~4 minutos)

### Sessão de Execução Phase 05 — Plano 05-03 (2026-04-22)

- Plano 05-03 concluído: skill /pesquisar-mercado criada como fonte de verdade em .agents/skills/
- 7 steps completos: escopo conversacional, detecção de sessões autenticadas, WebSearch+Playwright, WebFetch, extração+filtro de porte, salvar vagas.json, gerar resumo.json+profileHints, exibir resultado
- Portais aprovados incorporados: Gupy (Playwright MCP), LinkedIn (Googlebot UA), vagas.com.br, InfoJobs, Catho (Playwright)
- Output dual documentado com schemas completos: {slug}-{date}-vagas.json + {slug}-{date}-resumo.json
- Filtro de porte (D-26) implementado com heurística best-effort documentada
- Guardrails de privacidade: sanitização de slug [a-z0-9-], path traversal via path.resolve(), privacidade de sessões
- Descoberta: .claude/skills e .cursor/skills são symlinks para .agents/skills — arquivo físico único, não duplicação
- Commit: ecce4f3 (.agents/skills/pesquisar-mercado/SKILL.md)
- Concluído sem checkpoints — plano totalmente autônomo

---

*State initialized: 2026-04-19*
*v1.1 state reset: 2026-04-25 — roadmap Phases 6-8 defined*
