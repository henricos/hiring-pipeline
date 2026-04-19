# Roadmap: Hiring Pipeline v1

**Defined:** 2026-04-19  
**Granularity:** Standard (5-8 phases)  
**Coverage:** 14/14 v1 requirements mapped ✓

---

## Phases

- [ ] **Phase 1: Foundation & Authentication** - Project scaffolding, Docker setup, single-user auth
- [ ] **Phase 2: Job Profile Library** - Create, maintain, and search reusable job templates
- [ ] **Phase 3: AI-Assisted Profile Refinement** - AI suggestions for skills, requirements, and descriptions
- [ ] **Phase 4: Vacancy Opening & GH Form Generation** - Open vacancies from profiles and auto-generate Excel form

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

**Plans:** TBD

---

### Phase 2: Job Profile Library

**Goal:** Manager can create, maintain, and search reusable job profile templates with full metadata

**Depends on:** Phase 1

**Requirements:** PROF-01, PROF-02, PROF-03, PROF-04, PROF-05

**Success Criteria** (what must be TRUE):
1. Manager can create a job profile with title, description, responsibilities, and internal notes
2. Manager can define required/desired requirements, technical skills, behavioral competencies, and evaluation criteria
3. Manager can list all profiles and search by title or keyword
4. Manager can edit existing profile and persist changes
5. Job profile includes external-facing job description text for publication

**Plans:** TBD

**UI hint:** yes

---

### Phase 3: AI-Assisted Profile Refinement

**Goal:** AI agents augment profile creation with intelligent suggestions and improvements

**Depends on:** Phase 2

**Requirements:** IA-01, IA-02, IA-03

**Success Criteria** (what must be TRUE):
1. Manager can request AI suggestions for requirements and skills based on job title and context
2. Manager can request AI improvements to job description writing
3. AI suggestions contextualize to P&D/Lyceum business area norms and language
4. Manager can accept, reject, or refine AI suggestions before saving to profile

**Plans:** TBD

---

### Phase 4: Vacancy Opening & GH Form Generation

**Goal:** Manager can open vacancies from profiles and auto-generate HR submission form

**Depends on:** Phase 2

**Requirements:** VAG-01, VAG-02, VAG-03, VAG-04

**Success Criteria** (what must be TRUE):
1. Manager can create vacancy by selecting profile template and adding vacancy-specific data (quantity, salary, cost center, urgency, project)
2. Manager can provide vacancy details via natural language through conversational agent
3. System generates completed GH Excel form (.xlsx) ready to email to HR
4. Manager can view list of open vacancies with current status
5. Manager can track vacancy progression from open through closure

**Plans:** TBD

**UI hint:** yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 0/? | Not started | — |
| 2. Job Profile Library | 0/? | Not started | — |
| 3. AI-Assisted Profiles | 0/? | Not started | — |
| 4. Vacancy & GH Form | 0/? | Not started | — |

---

*Roadmap created: 2026-04-19*
