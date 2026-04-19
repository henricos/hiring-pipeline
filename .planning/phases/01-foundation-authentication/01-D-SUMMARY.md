---
phase: 01-foundation-authentication
plan: D
subsystem: data-layer
tags: [data-service, json-persistence, env-config, gitignore]
dependency_graph:
  requires: [01-PLAN-A, 01-PLAN-B]
  provides: [data-service.ts, .gitignore, .env.local.example]
  affects: [src/lib/data-service.ts]
tech_stack:
  added: []
  patterns: [fail-fast-validation, idempotent-mkdir, fs-existsSync]
key_files:
  created:
    - src/lib/data-service.ts
    - src/lib/env.ts
    - src/__tests__/data-service.test.ts
    - .env.local.example
  modified:
    - .gitignore
decisions:
  - "validateDataPath usa fs.existsSync (não fs.accessSync) — retorna boolean, não lança exceção"
  - "env.ts placeholder criado neste worktree; implementação completa vem do PLAN-C"
  - "node_modules vinculado via symlink ao worktree de scaffolding para rodar testes"
metrics:
  duration: "~10min"
  completed: "2026-04-19"
  tasks_completed: 2
  files_changed: 5
---

# Phase 1 Plan D: Data Service & Env Config Summary

Camada de persistência JSON implementada com `validateDataPath()` e `ensureSubdir()` usando fs nativo do Node.js com padrão fail-fast na inicialização e criação idempotente de subdiretórios.

## Tarefas Executadas

| Tarefa | Nome | Commit | Arquivos |
|--------|------|--------|---------|
| D-1 | Implementar data-service.ts | 4ff013e | src/lib/data-service.ts, src/lib/env.ts, src/__tests__/data-service.test.ts |
| D-2 | Criar .gitignore e .env.local.example | 93e4298 | .gitignore, .env.local.example |

## Resultado dos Testes

```
npm test -- data-service

 RUN  v3.2.4

 ✓ src/__tests__/data-service.test.ts (3 tests) 26ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  17:53:11
   Duration  1.04s
```

Testes GREEN:
- DS-01: `validateDataPath` encerra com `process.exit(1)` quando DATA_PATH não existe no filesystem
- DS-02: `ensureSubdir("profiles")` cria `/tmp/test-data-service/profiles` e retorna caminho absoluto
- DS-03: `ensureSubdir("vacancies")` é idempotente — não lança quando diretório já existe

## Confirmação D-14 Respeitado

`validateDataPath()` NÃO chama `fs.mkdirSync()` em nenhum ponto — apenas `fs.existsSync()` seguido de `process.exit(1)` caso o diretório não exista. A raiz DATA_PATH deve ser criada pelo operador ou montada via bind mount antes do startup da aplicação.

## Env Vars Documentados (.env.local.example)

Os 6 env vars da Phase 1 estão documentados com exemplos válidos:

| Env Var | Exemplo | Observação |
|---------|---------|------------|
| AUTH_USERNAME | `gestor` | Credencial do usuário único |
| AUTH_PASSWORD | `senha-segura-minimo-8-chars` | Mínimo 8 caracteres |
| NEXTAUTH_SECRET | `substitua-por-secret-gerado-com-openssl-rand` | Gerar com `openssl rand -base64 32` (mín. 32 chars) |
| NEXTAUTH_URL | `http://localhost:3000/hiring-pipeline` | Deve incluir o base path |
| APP_BASE_PATH | `/hiring-pipeline` | Padrão configurável |
| DATA_PATH | `/caminho/absoluto/para/data-local` | Caminho absoluto obrigatório (validado pelo Zod) |

## Deviações do Plano

### Adições Automáticas

**1. [Regra 3 - Bloqueio] src/lib/env.ts placeholder criado neste worktree**
- **Encontrado durante:** Tarefa D-1
- **Problema:** PLAN-C (que cria env.ts) roda em worktree paralelo separado. O TypeScript e o módulo de mock dos testes precisam que `@/lib/env` exista como módulo válido.
- **Solução:** Criado `src/lib/env.ts` mínimo com o Zod schema correto. Será substituído/sobrescrito pela implementação completa do PLAN-C durante o merge.
- **Arquivos:** src/lib/env.ts
- **Commit:** 4ff013e

**2. [Regra 3 - Bloqueio] Arquivos de scaffolding copiados para worktree**
- **Encontrado durante:** Tarefa D-1
- **Problema:** Worktree `agent-aa1b511b` está no commit `a8b533e` (docs de planning apenas). PLAN-B executa em worktree separado e seus arquivos (package.json, tsconfig.json, vitest.config.ts etc.) não estão neste worktree.
- **Solução:** Arquivos de scaffolding copiados do worktree `agent-a8c815f7`; `node_modules` vinculado via symlink. Esses arquivos não são commitados neste worktree (não são responsabilidade do PLAN-D).
- **Impacto:** Testes executam corretamente; arquivos de scaffolding serão providos pelo PLAN-B no merge final.

## Threat Surface

Nenhuma nova superfície de segurança além do mapeado no threat model do plano:
- T-1-04: DATA_PATH validado como caminho absoluto via Zod schema; subdir vem do código, nunca de input do usuário
- T-1-10: .env.local.example contém apenas valores fictícios — intencionalmente commitado para documentação
- T-1-11: validateDataPath nunca cria a raiz — operador responsável pela criação (D-14)

## Known Stubs

Nenhum stub que impeça os objetivos deste plano.

`src/lib/env.ts` neste worktree é um placeholder mínimo que será sobrescrito pela implementação completa do PLAN-C. Os testes de data-service mockam `../lib/env` via `vi.mock`, portanto o placeholder não afeta a cobertura funcional dos testes DS-01, DS-02, DS-03.

## Self-Check: PASSED

Arquivos criados verificados:
- src/lib/data-service.ts: presente e contém `fs.existsSync`, `process.exit(1)`, `fs.mkdirSync`, `path.join`
- src/lib/env.ts: presente (placeholder)
- src/__tests__/data-service.test.ts: presente
- .env.local.example: presente com 6 env vars
- .gitignore: atualizado com data-local/ e .env.local

Commits verificados:
- 4ff013e: feat(01-D): implementar data-service.ts
- 93e4298: chore(01-D): criar .gitignore e .env.local.example
