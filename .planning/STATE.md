# State: Hiring Pipeline v1

**Last updated:** 2026-04-20  
**Mode:** YOLO (iterate on feedback, validate with users)
**Phase 1 Status:** Complete ✓ 2026-04-19
**Phase 2 Status:** Complete ✓ 2026-04-20

---

## Project Reference

**Core Value:** Transform fragmented hiring process from email/spreadsheets into an assisted, reusable, auditable flow — opening vacancies faster and screening candidates with consistency.

**Phase 3 Status:** Ready to execute (5 plans)
**Current Focus:** Phase 3 (Vacancy Opening & GH Form Generation)

---

## Current Position

**Milestone:** v1 Hiring Pipeline  
**Roadmap Progress:** Phase 1 ✓ — Phase 2 ✓ — Phase 3 (Vacancy & GH Form) a planejar  
**Overall Progress:** [######----] 50%

**At risk:** None (early stage)

---

## Decision Log

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

---

## Session Continuity

### Starting Phase
Phase 3: Vacancy Opening & GH Form Generation

### What Needs to Happen Next
1. `/gsd-discuss-phase 3` — Discutir e definir contexto da Phase 3 antes de planejar (recomendado)
2. `/gsd-plan-phase 3` — Planejar abertura de vagas, modelo de dados e geração do Excel GH
3. Validar critérios de sucesso (formulário Excel preenchido pronto para email, lista de vagas abertas)

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
