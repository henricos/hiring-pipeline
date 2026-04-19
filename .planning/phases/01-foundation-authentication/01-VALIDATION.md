---
phase: 1
slug: foundation-authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` (copiar do ai-pkm) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run typecheck` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-auth-01 | auth | 1 | APP-01 | T-1-01 | Credenciais validadas contra AUTH_USERNAME/AUTH_PASSWORD | unit | `npm test -- auth` | ❌ W0 | ⬜ pending |
| 1-auth-02 | auth | 1 | APP-01 | T-1-01 | Matcher do middleware cobre rotas protegidas e exclui assets | unit | `npm test -- auth` | ❌ W0 | ⬜ pending |
| 1-auth-03 | auth | 1 | APP-01 | T-1-02 | Login bem-sucedido cria sessão JWT | unit | `npm test -- auth` | ❌ W0 | ⬜ pending |
| 1-bp-01 | base-path | 1 | APP-02 | — | `normalizeBasePath` normaliza `/hiring-pipeline` corretamente | unit | `npm test -- base-path` | ❌ W0 | ⬜ pending |
| 1-bp-02 | base-path | 1 | APP-02 | — | `withBasePath` compõe paths com prefixo correto | unit | `npm test -- base-path` | ❌ W0 | ⬜ pending |
| 1-env-01 | infra | 1 | APP-01 | T-1-05 | Env vars ausentes: processo encerra com mensagem clara | unit | `npm test -- env` | ❌ W0 | ⬜ pending |
| 1-data-01 | infra | 1 | APP-01 | T-1-04 | DATA_PATH inexistente: `validateDataPath()` lança erro | unit | `npm test -- data-service` | ❌ W0 | ⬜ pending |
| 1-data-02 | infra | 1 | APP-01 | — | `ensureSubdir` cria subpastas automaticamente | unit | `npm test -- data-service` | ❌ W0 | ⬜ pending |
| 1-docker-01 | infra | 2 | — | T-1-06 | Dockerfile tem standalone output + USER nextjs + EXPOSE 3000 | unit (file contract) | `npm test -- container` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — copiar do ai-pkm
- [ ] `src/__tests__/auth.test.ts` — adaptar de `ai-pkm/src/__tests__/auth.test.ts`
- [ ] `src/__tests__/base-path.test.ts` — adaptar de `ai-pkm/src/__tests__/with-base-path.test.ts`
- [ ] `src/__tests__/env.test.ts` — adaptar de `ai-pkm/src/__tests__/env.test.ts`
- [ ] `src/__tests__/data-service.test.ts` — novo (testar `validateDataPath` e `ensureSubdir`)
- [ ] `src/__tests__/next-config.test.ts` — adaptar de `ai-pkm/src/__tests__/next-config.test.ts`
- [ ] `src/__tests__/container-packaging.test.ts` — adaptar de `ai-pkm/src/__tests__/container-packaging.test.ts`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Docker build completa sem erros | APP-02 | Requer Docker daemon disponível | `docker build -t hiring-pipeline .` deve terminar exit 0 |
| Login na UI com credenciais corretas redireciona para home | APP-01 | UI interaction não automatizável em CI | Abrir `/hiring-pipeline/login`, inserir credenciais válidas, verificar redirect |
| Login com credenciais erradas exibe mensagem genérica | APP-01 | UI interaction | Inserir credenciais inválidas, verificar mensagem sem revelar campo errado |
| Rail colapsa/expande ao clicar no toggle | — | UI interaction | Clicar no botão de toggle; verificar alternância de labels/ícones |
| Base path `/hiring-pipeline` retorna 200 | APP-02 | Requer servidor rodando | `curl http://localhost:3000/hiring-pipeline/login` → HTTP 200 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
