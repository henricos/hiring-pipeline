---
phase: 01-foundation-authentication
plan: A
subsystem: test-infrastructure
tags: [vitest, tdd, wave-0, red-phase]
dependency_graph:
  requires: []
  provides:
    - vitest.config.ts — configuração do framework de testes
    - src/__tests__/auth.test.ts — contrato de autenticação e isValidCallback
    - src/__tests__/base-path.test.ts — contrato de base path helpers
    - src/__tests__/env.test.ts — contrato de validação de env vars
    - src/__tests__/data-service.test.ts — contrato do serviço de dados
    - src/__tests__/next-config.test.ts — contrato do next.config.ts
    - src/__tests__/container-packaging.test.ts — contrato do Dockerfile e .dockerignore
  affects:
    - PLAN-B (scaffolding instala dependências para os testes rodarem)
    - PLAN-C (auth.test.ts valida src/lib/auth.ts)
    - PLAN-D (data-service.test.ts valida src/lib/data-service.ts)
    - PLAN-E (auth.test.ts bloco isValidCallback valida src/components/login-form.tsx)
    - PLAN-F (container-packaging.test.ts valida Dockerfile e .dockerignore)
tech_stack:
  added:
    - vitest 3.2.4 (framework de testes — configurado, dependência instalada no PLAN-B)
    - jsdom (ambiente de testes para componentes React)
    - "@vitejs/plugin-react" (plugin Vitest para JSX/TSX)
  patterns:
    - TDD Red-Green-Refactor — Wave 0 é a fase RED; Waves 1-2 são GREEN
    - vi.mock para isolar dependências de módulos em testes unitários
    - import dinâmico em testes de módulos com efeitos colaterais (env, data-service)
key_files:
  created:
    - vitest.config.ts
    - src/__tests__/auth.test.ts
    - src/__tests__/base-path.test.ts
    - src/__tests__/env.test.ts
    - src/__tests__/data-service.test.ts
    - src/__tests__/next-config.test.ts
    - src/__tests__/container-packaging.test.ts
  modified: []
decisions:
  - "Mantida mensagem de erro literal do base-path.ts (Exemplo: /pkm) nos testes de base-path — o código copiado do ai-pkm usa essa string; os testes refletem o contrato real do módulo"
  - "Bloco isValidCallback em auth.test.ts usa stub inline que lança exceção — garante RED determinístico sem depender de import de módulo inexistente"
  - "next-config.test.ts adiciona testes ENV e standalone além do analog ai-pkm — cobertura mais completa do contrato"
metrics:
  duration: "140 segundos"
  completed_date: "2026-04-19"
  tasks_completed: 3
  files_created: 7
  files_modified: 0
---

# Phase 01 Plan A: Infraestrutura de Testes (Wave 0) Summary

**One-liner:** Configuração Vitest com jsdom + 6 stubs de teste em RED determinístico cobrindo auth, base-path, env, data-service, next-config e container-packaging.

## O Que Foi Feito

Wave 0 completa: infraestrutura de testes criada para habilitar feedback automatizado nas Waves 1 e 2. Todos os stubs importam módulos que ainda não existem — as falhas são esperadas (RED) e indicam que o framework está funcionando corretamente.

### Arquivos Criados

| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `vitest.config.ts` | Configura Vitest com jsdom, alias `@/` e include pattern `src/__tests__/**` | Criado |
| `src/__tests__/auth.test.ts` | ACC-01/02/03 (matcher de rotas, credenciais, JWT) + bloco isValidCallback (RED stub) | Criado |
| `src/__tests__/base-path.test.ts` | normalizeBasePath e withBasePath com valores `/hiring-pipeline` | Criado |
| `src/__tests__/env.test.ts` | RUN-01, ENV-01/02/03 com DATA_PATH (sem PKM_PATH, sem INDEX_PATH) | Criado |
| `src/__tests__/data-service.test.ts` | validateDataPath e ensureSubdir com mock `DATA_PATH: /tmp/test-data-service` | Criado |
| `src/__tests__/next-config.test.ts` | basePath dinâmico, standalone output, env vars NEXT_PUBLIC de build | Criado |
| `src/__tests__/container-packaging.test.ts` | USER nextjs, DATA_PATH, data-local no .dockerignore (sem PKM/index) | Criado |

## Status da Execução npm test

`npm test` não pôde ser executado nesta wave porque `package.json` e as dependências npm (vitest, @vitejs/plugin-react, jsdom) ainda não foram instaladas — isso ocorre no PLAN-B (Wave 1, scaffolding Next.js).

Comportamento esperado após PLAN-B:
- Vitest inicializa sem crash de configuração
- Testes falham com "Cannot find module '../lib/auth'" e similares (RED esperado)
- Após Waves 1-2 implementarem os módulos, os testes passam (GREEN)

## Desvios do Plano

### Ajuste de mensagem de erro em base-path.test.ts

**Tipo:** Fidelidade ao contrato do módulo (não é desvio do plano — é seguir o PATTERNS.md)

O PATTERNS.md especifica que a mensagem de erro do `normalizeBasePath` usa `"/pkm"` como exemplo literal no código-fonte copiado do ai-pkm. Os testes em `base-path.test.ts` verificam essa mensagem exata. Portanto:

```typescript
// Correto — mensagem literal do código-fonte base-path.ts:
expect(() => normalizeBasePath("hiring-pipeline"))
  .toThrow('APP_BASE_PATH inválido: o valor deve começar com "/". Exemplo: "/pkm".');
```

Isso é intencional: o código `base-path.ts` (copiado sem alterações do ai-pkm) tem `/pkm` hardcoded na mensagem de exemplo. O teste verifica o contrato real do módulo.

### next-config.test.ts — testes adicionais

Adicionados 2 testes além do analog ai-pkm:
- Verificação de `NEXT_PUBLIC_APP_VERSION` e `NEXT_PUBLIC_GIT_HASH` em `config.env`
- Verificação explícita de `output: "standalone"`

Motivação: o plan especifica que next-config deve verificar `output standalone` e env vars de build — o analog ai-pkm não cobria esses casos explicitamente.

## Known Stubs

| Stub | Arquivo | Linha | Motivo |
|------|---------|-------|--------|
| `isValidCallback` stub inline lança exceção | `src/__tests__/auth.test.ts` | ~90 | Função real em `src/components/login-form.tsx` implementada no PLAN-E (Wave 2) |
| `import("../lib/auth")` — módulo inexistente | `src/__tests__/auth.test.ts` | ~47 | Módulo criado no PLAN-C (Wave 1) |
| `import("../lib/base-path")` — módulo inexistente | `src/__tests__/base-path.test.ts` | ~3 | Módulo criado no PLAN-C (Wave 1) |
| `import("../lib/env")` — módulo inexistente | `src/__tests__/env.test.ts` | ~43 | Módulo criado no PLAN-C (Wave 1) |
| `import("../lib/data-service")` — módulo inexistente | `src/__tests__/data-service.test.ts` | ~22 | Módulo criado no PLAN-D (Wave 1) |
| `import("../../next.config")` — arquivo inexistente | `src/__tests__/next-config.test.ts` | ~26 | Arquivo criado no PLAN-B (Wave 1) |
| `Dockerfile` e `.dockerignore` inexistentes | `src/__tests__/container-packaging.test.ts` | ~29,37 | Arquivos criados no PLAN-F (Wave 2) |

Todos esses stubs são intencionais — Wave 0 é a fase RED do ciclo TDD.

## Threat Surface Scan

Nenhuma nova superfície de segurança introduzida. Os arquivos criados são exclusivamente de configuração de testes (sem endpoints, sem auth paths, sem acesso a filesystem em produção). Os mocks usam credenciais fictícias conforme T-1-W0-02 (aceito no threat model).

## Self-Check: PASSED

Arquivos verificados:
- `vitest.config.ts` — FOUND
- `src/__tests__/auth.test.ts` — FOUND (contém DATA_PATH, não PKM_PATH)
- `src/__tests__/base-path.test.ts` — FOUND (contém normalizeBasePath e withBasePath)
- `src/__tests__/env.test.ts` — FOUND (contém DATA_PATH, hiring-pipeline, sem INDEX_PATH)
- `src/__tests__/data-service.test.ts` — FOUND (contém validateDataPath e ensureSubdir)
- `src/__tests__/next-config.test.ts` — FOUND
- `src/__tests__/container-packaging.test.ts` — FOUND (contém USER nextjs, DATA_PATH, data-local)

Commits verificados:
- `2ca5483` — chore(01-A): adiciona vitest.config.ts
- `b32550b` — test(01-A): adiciona stubs auth, base-path, env
- `6a4b643` — test(01-A): adiciona stubs data-service, next-config, container-packaging
