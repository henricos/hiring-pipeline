# State: Hiring Pipeline v1

**Last updated:** 2026-04-19  
**Mode:** YOLO (iterate on feedback, validate with users)

---

## Project Reference

**Core Value:** Transform fragmented hiring process from email/spreadsheets into an assisted, reusable, auditable flow — opening vacancies faster and screening candidates with consistency.

**Current Focus:** Phase 1 (Foundation & Auth)

---

## Current Position

**Milestone:** v1 Hiring Pipeline  
**Roadmap Progress:** 0/4 phases started  
**Overall Progress:** [---] 0%

**At risk:** None (early stage)

---

## Decision Log

### Foundational Decisions

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-04-19 | 4-phase structure (Foundation → Profiles → AI → Vacancies) | Requirements naturally separate into 4 coherent delivery capabilities; Phase 3 (AI) enhances Phase 2, Phase 4 depends on Phase 2 | Active |
| 2026-04-19 | JSON persistence over SQLite | Portability between machines via git; allows version control of hiring data | Active |
| 2026-04-19 | CLI external agents for AI (v1) | Validates hiring workflows quickly without native LLM integration complexity; Agent SDK integrates in v2 | Active |
| 2026-04-19 | Defer candidate management to v2 | v1 focuses on vacancy opening (higher operational pain); candidate screening deferred to v2 | Active |

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
Phase 1: Foundation & Authentication

### What Needs to Happen Next
1. `/gsd-plan-phase 1` — Decompose Foundation phase into executable plans
2. Implement auth, Docker setup, base Next.js app structure
3. Validate Phase 1 success criteria (login required, base path works, Docker builds)
4. Transition to Phase 2

### Open Questions
- Database location strategy: how will `/data` volume be synchronized in production?
- Excel form generation: use python-pptx or js-xlsx? Check template structure first.
- GH form versioning: changes to template — how to migrate old vacancies?

---

*State initialized: 2026-04-19*
