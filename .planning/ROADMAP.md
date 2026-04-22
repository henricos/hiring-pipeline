# Roadmap: Hiring Pipeline v1

**Defined:** 2026-04-19  
**Granularity:** Standard (5-8 phases)  
**Coverage:** 14/14 v1 requirements mapped ✓

---

## Phases

- [x] **Phase 1: Foundation & Authentication** - Project scaffolding, Docker setup, single-user auth ✓ 2026-04-19
- [x] **Phase 2: Job Profile Library** - Create, maintain, and search reusable job templates ✓ 2026-04-20
- [ ] **Phase 3: Vacancy Opening & GH Form Generation** - Open vacancies from profiles and auto-generate Excel form
- [x] **Phase 4: AI-Assisted Profile Refinement** - AI suggestions for skills, requirements, and descriptions (via CLI/skills) ✓ 2026-04-21
- [ ] **Phase 5: Market Research & Holistic Profile Refinement** - Skill /pesquisar-mercado, pasta data/research/, evolução do /refinar-perfil com contexto de mercado + revisão holística, e definição do aiProfileInstructions de P&D/Lyceum

---

## Phase Details

### Phase 1: Foundation & Authentication

**Goal:** Secure the application and establish deployment infrastructure

**Depends on:** Nothing (first phase)

**Requirements:** APP-01, APP-02

**Success Criteria** (what must be TRUE):
1. Application starts and requires login before accessing any features
2. Manager can authenticate with credentials from environment variables
3. Application accessible at configurable base path (default `/hiring-pipeline`)
4. Docker build completes with multi-stage process (production-ready image created)

**Plans:** 6 plans

Plans:
- [x] 01-PLAN-A.md — Wave 0: Infraestrutura de testes (vitest.config.ts + 6 stubs de teste) ✓ 2026-04-19
- [x] 01-PLAN-B.md — Wave 1: Scaffolding (package.json, next.config.ts, globals.css, fonts, lib/ utilitários) ✓ 2026-04-19
- [x] 01-PLAN-C.md — Wave 1: Auth (env.ts, auth.ts, actions/auth.ts, route handler) ✓ 2026-04-19
- [x] 01-PLAN-D.md — Wave 1: Data service (data-service.ts, .gitignore, .env.local.example) ✓ 2026-04-19
- [x] 01-PLAN-E.md — Wave 2: Shell UI (AppShell, LeftRail, LoginPage, LoginForm, ShellLayout) ✓ 2026-04-19
- [x] 01-PLAN-F.md — Wave 2: Docker + Design assets (Dockerfile, compose.yaml, DESIGN.md, referencias UI) ✓ 2026-04-19

---

### Phase 2: Job Profile Library

**Goal:** Manager can create, maintain, and search reusable job profile templates with full metadata

**Depends on:** Phase 1

**Requirements:** PROF-01, PROF-02, PROF-03, PROF-04, PROF-05

**Success Criteria** (what must be TRUE):
1. Manager can create a job profile with title, description, responsibilities, and internal notes
2. Manager can define required/desired requirements, technical skills, behavioral competencies, and evaluation criteria
3. Manager can list all profiles (search deferred — D-06)
4. Manager can edit existing profile and persist changes
5. Job profile includes external-facing job description text for publication

**Plans:** 4 plans

Plans:
- [x] 02-PLAN-A.md — Wave 1: shadcn components (select, textarea, alert-dialog) + schema src/lib/profile.ts ✓ 2026-04-20
- [x] 02-PLAN-B.md — Wave 2: Server actions CRUD (createProfile, updateProfile, deleteProfile, listProfiles, getProfile) ✓ 2026-04-20
- [x] 02-PLAN-C.md — Wave 3: Componentes UI (ProfileList com empty state + delete dialog, ProfileForm com 5 seções e campos condicionais) ✓ 2026-04-20
- [x] 02-PLAN-D.md — Wave 4: Rotas de páginas (/profiles, /profiles/new, /profiles/[id]/edit) + left rail habilitado + checkpoint visual ✓ 2026-04-20

**UI hint:** yes

---

### Phase 3: Vacancy Opening & GH Form Generation

**Goal:** Manager can open vacancies from profiles and auto-generate HR submission form

**Depends on:** Phase 2

**Requirements:** VAG-01, VAG-02, VAG-03, VAG-04

**Success Criteria** (what must be TRUE):
1. Manager can create vacancy by selecting profile template and adding vacancy-specific data (quantity, salary, cost center, urgency, project)
2. Manager can provide vacancy details via natural language through conversational agent
3. System generates completed GH Excel form (.xlsx) ready to email to HR
4. Manager can view list of open vacancies with current status
5. Manager can track vacancy progression from open through closure

**Plans:** 12 plans

Plans:
- [x] 03-01-PLAN.md — Wave 1: Data layer (Vacancy schema, VacancyRepository, Badge + adm-zip install, unit tests)
- [x] 03-02-PLAN.md — Wave 2: Server actions + repositories (vacancy CRUD, SettingsRepository, AreaSettings)
- [x] 03-03-PLAN.md — Wave 3: UI components e rotas (/vacancies, /settings, VacancyForm, VacancyList, SettingsForm, left-rail)
- [x] 03-04-PLAN.md — Wave 4: Route handler download + Skill /abrir-vaga (VAG-02)
- [x] 03-05-PLAN.md — Wave 2: Excel generator (adm-zip cirúrgico, escapeXml, generateVacancyForm, testes)
- [x] 03-06-PLAN.md — Wave 3 (gap): UI fixes — remover botão de status da lista, Select de status na edição, botão único de formulário GH
- [x] 03-07-PLAN.md — Wave 3 (gap): Mapeamento Excel corrigido — inspeção via AdmZip dos exemplos, CELL_MAPPING atualizado, testes validados
- [x] 03-08-PLAN.md — Wave 1 (gap): Formatação de datas DD/MM/YYYY + data de abertura no Excel (GAP-06, GAP-08) ✓ 2026-04-21
- [x] 03-09-PLAN.md — Wave 1 (gap): Checkboxes VML — limpeza de resíduos do template + marcação correta (GAP-07, GAP-09, GAP-10) ✓ 2026-04-21
- [x] 03-10-PLAN.md — Wave 2 (gap): workSchedule — campo workScheduleOther, checkbox correto no Excel (GAP-05) ✓ 2026-04-21
- [x] 03-11-PLAN.md — Wave 1 (gap): Layout UI — seções Status e Formulário GH side by side no card (GAP-11)
- [x] 03-12-PLAN.md — Wave 3 (gap): Migrar campos fixos de perfil/vaga para Configurações da Área (GAP-12) ✓ 2026-04-21

**UI hint:** yes

---

### Phase 4: AI-Assisted Profile Refinement

**Goal:** AI agents augment profile creation with intelligent suggestions and improvements (via CLI/skills — sem integração nativa na web app no v1)

**Depends on:** Phase 2

**Requirements:** IA-01, IA-02, IA-03

**Success Criteria** (what must be TRUE):
1. Manager can request AI suggestions for requirements and skills based on job title and context
2. Manager can request AI improvements to job description writing
3. AI suggestions contextualize to P&D/Lyceum business area norms and language
4. Manager can accept, reject, or refine AI suggestions before saving to profile

**Plans:** 2/5 plans executed

Plans:
- [x] 04-01-PLAN.md — Wave 0: Testes RED (atualizar profile.test.ts, excel-generator.test.ts, settings.test.ts para string[] e aiProfileInstructions) ✓ 2026-04-21
- [x] 04-02-PLAN.md — Wave 1: Schema + ExcelGenerator + DynamicListField (profile.ts migrado, serializeStringArray, componente de lista dinâmica)
- [x] 04-03-PLAN.md — Wave 1: Settings + ProfileForm + Actions (aiProfileInstructions, DynamicListField no formulário, getAll() na action) ✓ 2026-04-21
- [x] 04-04-PLAN.md — Wave 1: Zeragem da base dev + recriação de perfis reais (D-02 — checkpoint operador) ✓ 2026-04-21
- [x] 04-05-PLAN.md — Wave 2: Skills CLI — criar /refinar-perfil + revisar /abrir-vaga (IA-01, IA-02, IA-03, D-18) ✓ 2026-04-21 (checkpoint manual pendente)

---

### Phase 5: Market Research & Holistic Profile Refinement

**Goal:** Extend the AI-assisted refinement capability with market research context and holistic coherence review, and seed the P&D/Lyceum area with a robust `aiProfileInstructions` value. JobProfile schema remains immutable in this phase — all richness (hybrid stack, archetype, market tier) must fit into existing fields via prompt intelligence.

**Depends on:** Phase 4

**Requirements:** Evolution of IA-01, IA-02, IA-03 (no new requirements mapped; this is a v1.0 "sobra" / leftover phase)

**Success Criteria** (what must be TRUE):
1. A `/pesquisar-mercado` skill exists and produces structured JSONs in `data/research/` with `summary` + `profileHints` blocks
2. `/refinar-perfil` can load an existing market research file as variable context alongside `aiProfileInstructions` and uses it in suggestion prompts
3. `/refinar-perfil` performs a holistic coherence review (new Step 5) before saving, flagging inconsistencies across the 4 profile fields
4. The P&D/Lyceum area has a well-articulated `aiProfileInstructions` value persisted via `/settings`
5. Piloto executado: perfil Senior P&D (Java + Python + TS) gerado end-to-end pelo fluxo completo, respeitando o schema imutável do JobProfile

**Plans:** 5 plans

Plans:
- [ ] 05-01-PLAN.md — Wave 1 (checkpoint): Research e decisão de portais BR + queries default — investiga cobertura real e produz 05-01-PORTALS.md (bloqueia 05-02)
- [ ] 05-02-PLAN.md — Wave 2: Skill `/pesquisar-mercado` — 3 arquivos (.agents/ + .claude/ + .cursor/), 6 steps, schema D-07, guardrails D-08
- [ ] 05-03-PLAN.md — Wave 3: Evolução `/refinar-perfil` — Step 2 com pesquisa opcional + Step 5 holístico + renumeração Step 5→6
- [ ] 05-04-PLAN.md — Wave 3 (checkpoint): Discussão socrática aiProfileInstructions P&D/Lyceum + persistência via /settings + template de reuso
- [ ] 05-05-PLAN.md — Wave 4 (checkpoint): Piloto end-to-end — /pesquisar-mercado → /refinar-perfil → /abrir-vaga → Excel

**Context:** `.planning/phases/05-market-research-holistic-refinement/05-CONTEXT.md` (brief completo com decisões D-01 a D-23, canonical refs, sub-plans e verification)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 6/6 | Complete | 2026-04-19 |
| 2. Job Profile Library | 4/4 | Complete | 2026-04-20 |
| 3. Vacancy & GH Form | 12/12 | Complete | 2026-04-21 |
| 4. AI-Assisted Profiles | 5/5 | Complete | 2026-04-21 |
| 5. Market Research & Holistic Refinement | 0/5 | Planned | — |

---

*Roadmap created: 2026-04-19*
*Phase 1 planned: 2026-04-19*
*Phase 2 planned: 2026-04-20*
*Phase 3 planned: 2026-04-20*
*Phase 3 gap closure planned: 2026-04-20*
*Phase 4 planned: 2026-04-21*
*Phase 5 added: 2026-04-21*
*Phase 5 planned: 2026-04-21*
