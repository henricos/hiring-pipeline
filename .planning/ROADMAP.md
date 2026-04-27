# Roadmap: Hiring Pipeline v1

**Defined:** 2026-04-19  
**Granularity:** Standard (5-8 phases)  
**Coverage:** 14/14 v1 requirements mapped ✓

---

## Phases

- [x] **Phase 1: Foundation & Authentication** - Project scaffolding, Docker setup, single-user auth ✓ 2026-04-19
- [x] **Phase 2: Job Profile Library** - Create, maintain, and search reusable job templates ✓ 2026-04-20
- [x] **Phase 3: Vacancy Opening & GH Form Generation** - Open vacancies from profiles and auto-generate Excel form ✓ 2026-04-21
- [x] **Phase 4: AI-Assisted Profile Refinement** - AI suggestions for skills, requirements, and descriptions (via CLI/skills) ✓ 2026-04-21
- [x] **Phase 5: Market Research & Holistic Profile Refinement** - Skill /pesquisar-mercado, pasta data/research/, evolução do /refinar-perfil com contexto de mercado + revisão holística, e definição do aiProfileInstructions de P&D/Lyceum ✓ 2026-04-25

---

### Milestone v1.1 — Profile-Anchored Market Research

- [x] **Phase 6: Guided Profile Creation Skill** - Skill `/criar-perfil` com validação de força do título no mercado e geração de perfil mínimo com valores-base ✓ 2026-04-26
- [x] **Phase 7: Profile-Anchored Market Research** - Refatoração de `/pesquisar-mercado` para ancorar arquivos ao ID do perfil, unificar com roles-map e acumular pesquisas por data ✓ 2026-04-26
- [x] **Phase 8: Market Research Frontend** - Tela de perfil com abas (Perfil / Vagas / Resumo de Mercado) exibindo pesquisas ancoradas ao perfil ✓ 2026-04-26
- [ ] **Phase 9: Pequenos ajustes pós-v1.1.1** - Ajustes de continuidade após release v1.1.1 (escopo a planejar)

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

**UI hint**: yes

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

**Plans:** 6/6 plans executed

Plans:
- [x] 05-01-PLAN.md — Wave 1 (checkpoint): Research portais BR + queries default + instruções sessão autenticada — produz 05-01-PORTALS.md (bloqueia 05-03)
- [x] 05-02-PLAN.md — Wave 2 (checkpoint): Mapa global de cargos/funções — data/research/roles-map.json com títulos + faixas salariais BR (independente)
- [x] 05-03-PLAN.md — Wave 3: Skill `/pesquisar-mercado` — 3 arquivos (.agents/ + .claude/ + .cursor/), 7 steps, dual-file output, filtro porte, sessões autenticadas
- [x] 05-04-PLAN.md — Wave 4: Evolução `/refinar-perfil` — Step 2 com pesquisa opcional + prompts 3 contextos + Step 5 holístico (renumera Steps 5→6, 6→7) ✓ 2026-04-22
- [x] 05-05-PLAN.md — Wave 4 (checkpoint): Discussão socrática aiProfileInstructions P&D/Lyceum + persistência via /settings + template de reuso ✓ 2026-04-25
- [x] 05-06-PLAN.md — Wave 5 (checkpoint): Piloto end-to-end — /pesquisar-mercado → /refinar-perfil → /abrir-vaga → Excel ✓ 2026-04-25

**Context:** `.planning/phases/05-market-research-holistic-refinement/05-CONTEXT.md` (brief completo com decisões D-01 a D-26, canonical refs, sub-plans e verification)

---

### Phase 6: Guided Profile Creation Skill

**Goal:** Manager can create a market-validated minimal profile from just a job title, with AI-powered market strength analysis, via skill `/criar-perfil`

**Depends on:** Phase 5

**Requirements:** CRIA-01, CRIA-02, CRIA-03

**Success Criteria** (what must be TRUE):
1. Manager can invoke `/criar-perfil` with only a job title and receive a market strength analysis before confirming creation
2. Manager can confirm or abort profile creation after reviewing the market analysis
3. Confirmed profile is persisted in `data/profiles/` with all fields pre-populated with market reference values (not empty)
4. Created profile is immediately ready for further refinement via `/refinar-perfil` without requiring manual field population

**Plans:** 1 plan

Plans:
- [x] 06-01-PLAN.md — Wave 1: Skill /criar-perfil — normalização de título + análise de força de mercado + persistência de stub ✓ 2026-04-26

---

### Phase 7: Profile-Anchored Market Research

**Goal:** Market research files are anchored to the profile ID, accumulate across dates without overwriting, and include salary ranges — making `/atualizar-roles-map` obsolete

**Depends on:** Phase 6

**Requirements:** PESQ-01, PESQ-02, PESQ-03, PESQ-04

**Success Criteria** (what must be TRUE):
1. Running `/pesquisar-mercado` for a profile generates files named with the profile ID (e.g., `{profileId}-{date}-vagas.json`) in a profile-specific folder or with explicit `profileId` field
2. The `-resumo.json` output includes salary ranges and market data for the specific role (previously only in roles-map)
3. Running `/pesquisar-mercado` twice for the same profile produces two dated files — no previous research is overwritten
4. `/atualizar-roles-map` skill is documented as legacy/deprecated with migration note pointing to `/pesquisar-mercado`

**Plans:** 3 plans

Plans:
- [x] 07-01-PLAN.md — Wave 1: Refatorar /pesquisar-mercado — selecao de perfil, subpastas research/{profileId}/, step de guias salariais obrigatorio (salaryGuide) ✓ 2026-04-26
- [x] 07-02-PLAN.md — Wave 1: Corrigir /refinar-perfil discovery recursivo + deprecar /atualizar-roles-map ✓ 2026-04-26
- [x] 07-03-PLAN.md — Wave 2 (checkpoint): Migracao de arquivos legados para nova estrutura + conversao completa de schema ✓ 2026-04-26

---

### Phase 8: Market Research Frontend

**Goal:** Profile detail screen exposes market research data through tabs, allowing the manager to browse current and historical research results without leaving the profile view

**Depends on:** Phase 7

**Requirements:** VIZ-01, VIZ-02, VIZ-03

**Success Criteria** (what must be TRUE):
1. Profile detail page renders three tabs: "Perfil", "Vagas", and "Resumo de Mercado"
2. "Vagas" tab lists all research runs anchored to the profile (date, role, job count) in reverse-chronological order
3. "Resumo de Mercado" tab displays the most recent `-resumo.json` content: salary ranges, analysis, and profileHints
4. Manager can select a past research entry in the "Vagas" tab and view its full data

**Plans:** 4 plans

Plans:
- [x] 08-01-PLAN.md — Wave 0: Test stubs (RED) — criar arquivos de teste com casos failing para VIZ-01, VIZ-02, VIZ-03 (Nyquist contract) ✓ 2026-04-26
- [x] 08-02-PLAN.md — Wave 1: Data layer — ResearchRepository (interface + JsonResearchRepository), Server Actions de pesquisa ✓ 2026-04-26
- [x] 08-03-PLAN.md — Wave 2: Components — Tabs component install (shadcn), ProfileDetailTabs, ProfileDetailPerfil, ProfileDetailVagas, ProfileDetailResumo ✓ 2026-04-26
- [x] 08-04-PLAN.md — Wave 3: Page + navigation — /profiles/[id]/page.tsx Server Component async, ajuste cirúrgico em profile-list.tsx (click → /[id] não /edit) ✓ 2026-04-26

**UI hint**: yes

---

### Phase 9: Pequenos ajustes pós-v1.1.1

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 8
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 9 to break down)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 6/6 | Complete | 2026-04-19 |
| 2. Job Profile Library | 4/4 | Complete | 2026-04-20 |
| 3. Vacancy & GH Form | 12/12 | Complete | 2026-04-21 |
| 4. AI-Assisted Profiles | 5/5 | Complete | 2026-04-21 |
| 5. Market Research & Holistic Refinement | 6/6 | Complete | 2026-04-25 |
| 6. Guided Profile Creation Skill | 1/1 | Complete | 2026-04-26 |
| 7. Profile-Anchored Market Research | 3/3 | Complete | 2026-04-26 |
| 8. Market Research Frontend | 4/4 | Complete | 2026-04-26 |
| 9. Pequenos ajustes pós-v1.1.1 | 0/0 | Not planned | — |

---

*Roadmap created: 2026-04-19*
*Phase 1 planned: 2026-04-19*
*Phase 2 planned: 2026-04-20*
*Phase 3 planned: 2026-04-20*
*Phase 3 gap closure planned: 2026-04-20*
*Phase 4 planned: 2026-04-21*
*Phase 5 added: 2026-04-21*
*Phase 5 planned: 2026-04-21*
*Phase 5 replanned: 2026-04-22 (6 planos — expandido de 5 para 6 com roles-map como plano dedicado 05-02)*
*v1.1 phases (6-8) added: 2026-04-25*
*Phase 6 planned: 2026-04-25*
*Phase 7 planned: 2026-04-26*
*Phase 8 planned: 2026-04-26*
*Phase 9 added: 2026-04-27 (continuidade v1.1 — ajustes pós-v1.1.1)*
