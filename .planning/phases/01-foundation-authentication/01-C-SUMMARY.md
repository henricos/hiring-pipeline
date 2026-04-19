---
phase: 01-foundation-authentication
plan: C
subsystem: authentication
tags: [next-auth, zod-4, credentials, jwt, env-validation, server-action]
dependency_graph:
  requires:
    - PLAN-A (vitest.config.ts e stubs de teste auth.test.ts, env.test.ts)
    - PLAN-B (package.json com next-auth e zod, src/lib/base-path.ts com withBasePath)
  provides:
    - src/lib/env.ts — validação Zod 4 de 6 env vars com process.exit(1) em falha
    - src/lib/auth.ts — next-auth Credentials provider com JWT e trustHost
    - src/app/actions/auth.ts — Server Action authenticate() com proteção de redirect
    - src/app/api/auth/[...nextauth]/route.ts — handlers GET e POST do next-auth
  affects:
    - PLAN-E (shell layout e login form consomem auth e actions/auth.ts)
    - PLAN-F (Dockerfile precisa de env vars DATA_PATH, NEXTAUTH_SECRET etc.)
tech_stack:
  added:
    - next-auth 5.0.0-beta.30 (Credentials provider, JWT strategy, trustHost)
    - zod 4.3.6 (schema validation com error functions — Zod 4 API)
  patterns:
    - Zod 4 error functions: error: (iss) => iss.input === undefined ? "msg" : undefined
    - superRefine para validação cruzada NEXTAUTH_URL.pathname === APP_BASE_PATH
    - Server Action "use server" com useActionState pattern (consumido em PLAN-E)
    - withBasePath(callbackUrl) obrigatório em redirectTo de server actions
    - Relançamento de erros não-AuthError para preservar error boundaries
key_files:
  created:
    - src/lib/env.ts
    - src/lib/auth.ts
    - src/app/actions/auth.ts
    - src/app/api/auth/[...nextauth]/route.ts
  modified: []
decisions:
  - "Stubs isValidCallback em auth.test.ts permanecem RED — são contratos para PLAN-E (login-form.tsx)"
  - "Comparação de string simples em authorize() — aceitável para single-user local (D-21)"
  - "trustHost: true obrigatório para runtime em container/proxy"
metrics:
  duration: "~15 minutos"
  completed: "2026-04-19"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 01 Plan C: Autenticação — env.ts, auth.ts, actions, route handler

**One-liner:** Validação Zod 4 de env vars com fail-fast e next-auth Credentials/JWT para single-user com proteção de open redirect via withBasePath.

## Resultado dos Testes

### npm test -- env: 5/5 GREEN

```
✓ src/__tests__/env.test.ts (5 tests) 124ms
  ✓ RUN-01: chama process.exit(1) com mensagem clara quando DATA_PATH está ausente
  ✓ RUN-01: parse bem-sucedido quando todas as vars obrigatórias estão presentes e sincronizadas
  ✓ ENV-01: falha cedo quando APP_BASE_PATH está ausente
  ✓ ENV-02: falha cedo quando NEXTAUTH_URL está ausente
  ✓ ENV-03: falha cedo quando NEXTAUTH_URL diverge do APP_BASE_PATH
```

### npm test -- auth: ACC-01, ACC-02, ACC-03 GREEN

```
✓ auth middleware > ACC-01: redireciona para /login quando sessão ausente
✓ auth middleware > ACC-02: credenciais validadas contra AUTH_USERNAME e AUTH_PASSWORD env vars
✓ auth middleware > ACC-03: login bem-sucedido cria sessão com cookie httpOnly
```

**Nota:** 4 testes `isValidCallback` permanecem RED intencionalmente — são stubs criados em PLAN-A com comentário explícito "ficará RED até isValidCallback ser implementado em PLAN-E". Esses testes testam a função `isValidCallback` de `login-form.tsx` que será criada em PLAN-E (Wave 2).

## Desvios do Analog ai-pkm

### Adaptações realizadas

**env.ts:**
- Substituído `PKM_PATH` e `INDEX_PATH` por `DATA_PATH` (campo único para dados do hiring pipeline)
- Removido o bloco `superRefine` de validação do `INDEX_PATH` (PKM-específico)
- Mensagem de exemplo atualizada: `APP_BASE_PATH=/hiring-pipeline` em vez de `/pkm`

**Nenhuma alteração em:**
- `auth.ts` — copiado integralmente do analog (lógica idêntica)
- `actions/auth.ts` — copiado integralmente do analog (lógica idêntica)
- `api/auth/[...nextauth]/route.ts` — copiado integralmente (2 linhas)

## Status da Validação Zod 4

Confirmado: todas as `error functions` estão corretas para Zod 4:

```typescript
// Padrão Zod 4 aplicado (NÃO usa required_error do Zod 3):
AUTH_USERNAME: z
  .string({ error: (iss) => (iss.input === undefined ? "AUTH_USERNAME é obrigatório" : undefined) })
  .min(1, "AUTH_USERNAME é obrigatório"),
```

A função `error` retorna `undefined` para tipos inválidos diferentes de `undefined`, deixando a mensagem padrão do Zod ser usada nesses casos. Retorna mensagem em pt-BR apenas quando o campo está ausente (`input === undefined`).

## Commits

| Hash | Descrição |
|------|-----------|
| cb57f3c | feat(01-C): implementa env.ts (Zod 4) e auth.ts (next-auth Credentials) |
| ceee1b9 | feat(01-C): implementa server action authenticate() e route handler next-auth |

## Verificação de Artefatos

| Artefato | Criado | Exportações | Contém |
|----------|--------|-------------|--------|
| src/lib/env.ts | sim | env | DATA_PATH, process.exit(1), Zod 4 error functions |
| src/lib/auth.ts | sim | handlers, auth, signIn, signOut | trustHost: true, strategy: "jwt", pages: { signIn: "/login" } |
| src/app/actions/auth.ts | sim | authenticate | "use server", withBasePath, AuthError, relança não-AuthError |
| src/app/api/auth/[...nextauth]/route.ts | sim | GET, POST | export const { GET, POST } = handlers |

## Known Stubs

| Stub | Arquivo | Linha | Motivo |
|------|---------|-------|--------|
| isValidCallback | src/__tests__/auth.test.ts | 99-101 | Stub intencionalmente RED — contrato para login-form.tsx que será implementado em PLAN-E |

## Self-Check: PASSED

- src/lib/env.ts: FOUND
- src/lib/auth.ts: FOUND
- src/app/actions/auth.ts: FOUND
- src/app/api/auth/[...nextauth]/route.ts: FOUND
- commit cb57f3c: FOUND
- commit ceee1b9: FOUND
