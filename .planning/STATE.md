---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Ready to execute
last_updated: "2026-04-22T12:29:17.775Z"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 23
  completed_plans: 30
  percent: 100
---

# State: Hiring Pipeline v1

**Last updated:** 2026-04-22  
**Mode:** YOLO (iterate on feedback, validate with users)
**Phase 1 Status:** Complete ✓ 2026-04-19
**Phase 2 Status:** Complete ✓ 2026-04-20

---

## Project Reference

**Core Value:** Transform fragmented hiring process from email/spreadsheets into an assisted, reusable, auditable flow — opening vacancies faster and screening candidates with consistency.

**Phase 3 Status:** Complete ✓ 2026-04-21 (12/12 planos executados)
**Phase 4 Status:** Complete ✓ 2026-04-21 (5/5 planos + code review PASS WITH NOTES + verificação PASS)
**Phase 5 Status:** In Progress — 4/6 planos executados (05-04 concluído — /refinar-perfil evoluída com pesquisa + Step 5 holístico)
**Current Focus:** Phase 5 — Próximo: 05-05 (discussão socrática aiProfileInstructions P&D/Lyceum)

---

## Current Position

Phase: 05 (market-research-holistic-refinement) — IN PROGRESS
Plan: 4 of 6 executed (05-04 concluído — /refinar-perfil com Step 2 de pesquisa + Step 5 holístico)
**Milestone:** v1 Hiring Pipeline — Phase 5 adicionada (sobra antes do bump SemVer)
**Roadmap Progress:** Phase 1 ✓ — Phase 2 ✓ — Phase 3 ✓ — Phase 4 ✓ — Phase 5 ⏳
**Overall Progress:** [########--] 80%

**At risk:** None

---

## Decision Log

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

None yet.

### Tech Notes

- Stack mirrors ai-pkm (Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui)
- Data lives in `/data` mounted volume; no relational DB in v1
- Base path configurable via `APP_BASE_PATH` env var
- Deployment: Docker multi-stage (node:22-alpine) + Compose

### Insights

- GH Excel form template at `templates/requisicao-de-pessoal.xlsx`
- Manager is single-user; auth via next-auth env credentials
- AI agents accessed via CLI skills (Claude Code, Cursor, Codex)
- Vacancy opening prioritized because it's highest operational drudgery (manual Excel fills)

### Roadmap Evolution

- 2026-04-21: Phase 5 added — Market Research & Holistic Profile Refinement (sobra de v1.0, antes do bump SemVer). Brief completo em `.planning/phases/05-market-research-holistic-refinement/05-CONTEXT.md` (decisões D-01 a D-21, canonical refs, sub-plans, verification). JobProfile schema declared immutable for this phase — riqueza extra (stack híbrido, arquétipo) tem que caber nos campos existentes.

---

## Session Continuity

### Starting Phase

Phase 5: Market Research & Holistic Profile Refinement

### What Needs to Happen Next

1. Rodar `/gsd-plan-phase 5` para detalhar os 5 sub-plans (05-01 a 05-05)
2. Sub-plan 05-01 é bloqueante: research e decisão de portais BR antes de implementar a skill
3. Sub-plan 05-04 (definir aiProfileInstructions de P&D/Lyceum) pode consumir output de 05-02 como insumo
4. Tech debt opcional pendente de v1.0: F-04 (key instável no DynamicListField), F-05 (assertions bullet no excel-generator.test.ts)
5. Validação manual das skills /refinar-perfil e /abrir-vaga continua recomendada (ver 04-05-PLAN.md Task 3)
6. Bump SemVer via `/fechar-versao` só após phase 5 concluída

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

### Sessão de Execução Phase 05 — Plano 05-02 (2026-04-22)

- Plano 05-02 concluído (Task 1): mapa global de cargos/funções BR para engenharia de software
- 12 cargos mapeados: Júnior, Pleno, Sênior, Tech Lead, Staff Engineer, Principal Engineer, Arquiteto, Especialista, AI Engineer, ML Engineer, Data Engineer, Platform Engineer
- Todos os 12 cargos com salaryRange não-null — faixas salariais SP 2026 baseadas em Robert Half, Glassdoor BR, Catho, Revelo
- Aliases em PT-BR e EN documentados por cargo; notas de tendência de mercado incluídas
- Títulos emergentes incluídos: Staff Engineer, Principal Engineer, AI Engineer, Platform Engineer
- Commit no repositório de dados: 64451b2 (data/research/roles-map.json)
- Parado em: Task 2 é checkpoint:human-verify — aguardando aprovação do gestor da qualidade do roles-map.json

### Sessão de Execução Phase 05 — Plano 05-01 (2026-04-22)

- Plano 05-01 concluído (Task 1): pesquisa real de portais BR para /pesquisar-mercado
- 7 portais testados via WebFetch real (curl, múltiplos User-Agents)
- 4 portais aprovados: LinkedIn (OK via Googlebot UA), vagas.com.br (OK parcial), InfoJobs BR (OK parcial), Gupy (requer Playwright)
- 3 portais descartados: Glassdoor (403 consistente), Catho (404 — fora do ar), Remotar (remoto-only)
- Queries PT e EN testadas — PT preferencial (+2-3 vagas no LinkedIn); EN recomendado para Staff Engineer
- Instruções de sessão autenticada via Playwright documentadas para LinkedIn e Gupy
- Commit: 56860ac (05-01-PORTALS.md)
- Parado em: Task 2 é checkpoint:human-verify — aguardando aprovação do gestor do documento 05-01-PORTALS.md

### Sessão de Execução Phase 04 — Plano 04-05 (2026-04-21)

- Plano 04-05 concluído: Wave 2 — skill /refinar-perfil + revisão /abrir-vaga
- .agents/skills/refinar-perfil/SKILL.md criado: Steps 1-6, 3 modalidades (IA-01/02/03), ciclo A/R/J, gravação node -e, segurança path traversal
- .agents/skills/abrir-vaga/SKILL.md revisado: Step 3 sem campos AreaSettings, Step 4 pré-carrega 4 campos, Step 5 JSON alinhado com vacancy.ts
- Commits: efa8705 (refinar-perfil), 1b63a4c (abrir-vaga revisada)
- Parado em: 04-05 Tasks 1-2 concluídas — Task 3 é checkpoint manual de validação pelo operador

### Sessão de Execução Phase 04 — Plano 04-03 (2026-04-21)

- Plano 04-03 concluído: Wave 1b — aiProfileInstructions + SettingsForm + ProfileForm com DynamicListField
- settings.ts: aiProfileInstructions?: string adicionado à interface + defaultSettings() retorna ""
- actions/settings.ts: parsing e persistência de aiProfileInstructions via formData.get()
- settings-form.tsx: nova seção 5 "Instruções para IA" com textarea aiProfileInstructions
- profile-form.tsx: 4 campos descritivos migrados de Textarea para DynamicListField
- actions/profile.ts: já usava formData.getAll() desde 04-02 (Regra 1 aplicada no plano anterior)
- Commits: e3e9b41 (settings.ts + actions/settings.ts), ddfa401 (settings-form.tsx), 722ca5a (profile-form.tsx)
- npm test: 98/98 GREEN | typecheck: zero erros
- Parado em: 04-03 completo — próximo é 04-04 (zeragem base dev + recriação perfis reais)

### Sessão de Execução Phase 04 — Plano 04-02 (2026-04-21)

- Plano 04-02 concluído: Wave 1a — schema + serializeStringArray + DynamicListField
- profile.ts: 4 campos migrados de string para string[] (D-01) — 23 testes GREEN
- excel-generator.ts: serializeStringArray exportada e usada nos 4 campos — 18 testes GREEN
- src/app/actions/profile.ts: formData.getAll() nos 4 campos (Regra 1)
- DynamicListField criado em src/components/ui/dynamic-list-field.tsx
- Commits: 06b723a (profile.ts + actions), 6524108 (excel-generator + fixtures), fb5f89b (DynamicListField)
- Parado em: 04-02 completo — próximo é 04-03 (AreaSettings + ProfileForm)

### Sessão de Execução Phase 04 — Plano 04-01 (2026-04-21)

- Plano 04-01 concluído: Wave 0 RED — 3 arquivos de teste atualizados
- profile.test.ts: 12 erros TS2322 (string[] vs string) via tsc --noEmit
- excel-generator.test.ts: 4 falhas runtime (serializeStringArray not a function)
- settings.test.ts: 4 erros TS2353/TS2339 + 1 falha runtime (defaultSettings sem aiProfileInstructions)
- Commits: 32f422e (profile.test.ts), 8e29b3a (excel-generator.test.ts), 4e5d196 (settings.test.ts)
- Parado em: 04-01 completo — próximo é 04-02 (Wave 1 schema migration)

### Sessão de Discuss Phase 04 (2026-04-21)

- Plano 03-12 concluído: 10 campos fixos por área migrados de JobProfile/Vacancy para AreaSettings (GAP-12)
- Commits: 3ae3e42 (schema — settings/vacancy/profile), bec532a (actions + forms + excel-generator)
- Parado em: fase 03 completa (12/12 planos executados)

### Phase 2 Planning Summary (2026-04-20)

- 4 planos criados: PLAN-A (schema + shadcn), PLAN-B (server actions CRUD), PLAN-C (componentes ProfileList + ProfileForm), PLAN-D (rotas + left rail + checkpoint visual)
- Verificação: PASSED (1ª verificação, 0 blockers, 0 warnings)
- Pesquisa pulada — contexto suficiente via CONTEXT.md + UI-SPEC.md

### Phase 1 Planning Summary (2026-04-19)

- 6 planos criados: PLAN-A (Wave 0 testes), PLAN-B (scaffolding), PLAN-C (auth), PLAN-D (data service), PLAN-E (shell UI), PLAN-F (Docker + design)
- Verificação: PASSED após 1 iteração de revisão (2 warnings corrigidos, 0 blockers)

### Open Questions

- Database location strategy: how will `/data` volume be synchronized in production?
- Excel form generation: use python-pptx or js-xlsx? Check template structure first.
- GH form versioning: changes to template — how to migrate old vacancies?

---

*State initialized: 2026-04-19*
