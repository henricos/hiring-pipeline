---
phase: 6
slug: guided-profile-creation-skill
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | CRIA-01 | — | N/A (CLI skill — no web surface) | manual | skill invocation | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | CRIA-02 | — | N/A | manual | skill invocation | ✅ | ⬜ pending |
| 06-01-03 | 01 | 1 | CRIA-03 | — | path traversal via path.resolve() + startsWith() | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/criar-perfil.test.ts` — stubs para CRIA-01, CRIA-02, CRIA-03 (estrutura do stub gerado, validação de path traversal)

*Note: A skill em si é um SKILL.md (não código TypeScript), mas o utilitário de escrita JSON pode ter testes unitários.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Análise de força de mercado exibe classificação correta (forte/médio/fraco/nicho) | CRIA-02 | Requer WebSearch ao vivo + julgamento de classificação | Rodar `/criar-perfil` com um título conhecido (ex: "Desenvolvedor Frontend Sênior") e verificar classificação exibida |
| Gestor pode confirmar ou abortar após ver análise | CRIA-01, CRIA-02 | Fluxo interativo conversacional | Rodar skill, verificar que a confirmação é necessária antes da persistência |
| Perfil persistido é legível pelo `/refinar-perfil` | CRIA-03 | Requer end-to-end com duas skills | Criar perfil via `/criar-perfil`, depois rodar `/refinar-perfil` e verificar que o perfil aparece na lista |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
