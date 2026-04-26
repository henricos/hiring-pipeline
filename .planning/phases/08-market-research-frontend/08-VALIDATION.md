---
phase: 8
slug: market-research-frontend
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 + @testing-library/react 16.3.0 |
| **Config file** | vitest.config.ts (existente) |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test:watch` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test:watch`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 0 | VIZ-01 | — | N/A | unit | `npm run test -- src/lib/repositories/research-repository.test.ts` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 0 | VIZ-01 | — | N/A | unit | `npm run test -- src/components/profile/profile-detail-vagas.test.tsx` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 0 | VIZ-02 | — | N/A | unit | `npm run test -- src/components/profile/profile-detail-resumo.test.tsx` | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 0 | VIZ-03 | — | N/A | integration | `npm run test -- src/components/profile/profile-detail-vagas.test.tsx -t "select previous research"` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | VIZ-01,VIZ-02,VIZ-03 | T-path | path traversal guard em ResearchRepository | unit | `npm run test -- src/lib/repositories/research-repository.test.ts` | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | VIZ-01 | — | N/A | unit | `npm run test -- src/components/profile/profile-detail-tabs.test.tsx` | ❌ W0 | ⬜ pending |
| 08-03-02 | 03 | 2 | VIZ-02 | — | N/A | unit | `npm run test -- src/components/profile/profile-detail-resumo.test.tsx` | ❌ W0 | ⬜ pending |
| 08-03-03 | 03 | 2 | VIZ-03 | — | N/A | integration | `npm run test -- src/components/profile/profile-detail-vagas.test.tsx -t "expand inline"` | ❌ W0 | ⬜ pending |
| 08-04-01 | 04 | 3 | VIZ-01,VIZ-02,VIZ-03 | — | N/A | unit | `npm run test -- src/app/\(shell\)/profiles/\[id\]/page.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/repositories/research-repository.test.ts` — stubs para VIZ-01, VIZ-02, VIZ-03 (listByProfileId, getVagas, getResumo)
- [ ] `src/components/profile/profile-detail-tabs.test.tsx` — cobertura de navegação entre abas (VIZ-01, VIZ-02, VIZ-03)
- [ ] `src/components/profile/profile-detail-perfil.test.tsx` — renderização leitura de perfil, omissão de campos vazios
- [ ] `src/components/profile/profile-detail-vagas.test.tsx` — lista de pesquisas, expansão inline, seleção de pesquisa anterior (VIZ-01, VIZ-03)
- [ ] `src/components/profile/profile-detail-resumo.test.tsx` — stackFrequency ranqueado, salaryGuide com atribuição, empty state (VIZ-02)
- [ ] `src/app/(shell)/profiles/[id]/page.test.tsx` — Server Component renderiza sem erro, notFound() com id inválido
- [ ] Fixtures: mock filesystem com dados de research em `data/research/{profileId}/` para testes de repositório

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Click no card da lista navega para /profiles/[id] | VIZ-01 | Navegação de rota no browser | Abrir /profiles, clicar no body do card (não nos botões) — deve abrir detalhe com abas |
| Expansão inline de vagas na aba Vagas | VIZ-03 | Interação de accordion no browser | Na aba Vagas, clicar em uma linha de pesquisa — deve expandir vagas brutas abaixo da linha |
| Seletor de data na aba Resumo com múltiplas pesquisas | VIZ-02 | Requer múltiplas pesquisas reais | Abrir perfil com 2+ pesquisas, trocar data no seletor — dados de mercado devem atualizar |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
