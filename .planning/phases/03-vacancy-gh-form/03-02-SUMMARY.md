---
phase: 03-vacancy-gh-form
plan: "02"
subsystem: business-logic
tags: [server-actions, vacancy-crud, settings, repository, tdd]
dependency_graph:
  requires: ["03-01"]
  provides: [vacancy-server-actions, settings-server-action, settings-repository, left-rail-nav]
  affects: [src/app/actions, src/lib, src/components/shell]
tech_stack:
  added: []
  patterns:
    - "server actions com useFormState (prevState + formData)"
    - "singleton repository para arquivo único (não coleção)"
    - "formatError helper para erros tipados"
    - "redirect() fora do try/catch para compatibilidade com Next.js"
key_files:
  created:
    - src/lib/settings.ts
    - src/lib/repositories/settings-repository.ts
    - src/app/actions/vacancy.ts
    - src/app/actions/settings.ts
    - src/__tests__/settings.test.ts
  modified:
    - src/components/shell/left-rail.tsx
decisions:
  - "redirect() sem withBasePath — consistência com profile.ts existente; Next.js basePath nativo trata o prefixo"
  - "settings-repository escreve direto em DATA_PATH sem ensureSubdir — settings.json fica na raiz do DATA_PATH, não em subpasta"
  - "advanceVacancyStatus em vez de advanceStatus — nome mais descritivo e consistente com o domínio"
metrics:
  duration: "~3 minutos"
  completed_date: "2026-04-20"
  tasks_completed: 4
  files_created: 5
  files_modified: 1
---

# Phase 03 Plan 02: Business Logic Layer (Server Actions) Summary

**One-liner:** Camada de lógica de negócio com 5 server actions (CRUD de vagas + status + settings) e AreaSettings com repositório singleton JSON.

## What Was Built

### Task 1: AreaSettings schema e repositório

- `src/lib/settings.ts` — Interface `AreaSettings` com 5 campos do Grupo 3 (D-05, D-06): managerName, godfather, immediateReport, mediateReport, teamComposition. `defaultSettings()` retorna strings vazias.
- `src/lib/repositories/settings-repository.ts` — `JsonSettingsRepository` com apenas `get()` e `save()` (sem list/delete — settings é singleton, não coleção). `get()` retorna defaults se `settings.json` não existir.

### Task 2: Server actions de vagas (CRUD)

- `src/app/actions/vacancy.ts` — 4 server actions:
  - `createVacancy`: valida profileId via `profileRepository.findById()`, extrai campos do Grupo 2, gera UUID via `generateVacancyId()`, persiste via `vacancyRepository.save()`
  - `updateVacancy`: preserva `openedAt`, `closedAt`, `id`, `profileId`, `status`; atualiza somente campos editáveis
  - `deleteVacancy`: exclusão idempotente via `vacancyRepository.delete()`
  - `advanceVacancyStatus`: transição Aberta → Em andamento → Encerrada; define `closedAt` ao encerrar (D-12)

### Task 3: Settings server action e left rail

- `src/app/actions/settings.ts` — `updateSettings` salva todos os 5 campos via `settingsRepository.save()`; sem redirect (permanece na página — padrão D-05)
- `src/components/shell/left-rail.tsx` — Vagas habilitada (`disabled: true → false`); Configurações adicionada com `href=/settings` e ícone `Settings` do lucide-react

### Task 4: Testes para settings

- `src/__tests__/settings.test.ts` — 4 testes passando:
  - `defaultSettings` retorna 5 strings vazias
  - `get()` retorna defaults quando arquivo não existe
  - `save()` + `get()` persistem e recuperam dados corretamente
  - `save()` grava JSON com indentação de 2 espaços em `DATA_PATH/settings.json`

## Commits

| Commit | Task | Descrição |
|--------|------|-----------|
| `694fa5e` | Task 1 | feat(03-02): definir AreaSettings e JsonSettingsRepository |
| `d5c66a9` | Task 2 | feat(03-02): implementar server actions de vagas (CRUD e status) |
| `f20e1b7` | Task 3 | feat(03-02): implementar updateSettings e habilitar Vagas/Configurações no left rail |
| `9c00fb7` | Task 4 | test(03-02): testes para AreaSettings e SettingsRepository |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Diretório de teste faltando para settings-repository**
- **Found during:** Task 4 (RED — testes falhando com ENOENT)
- **Issue:** `save()` lançava `ENOENT` porque `/tmp/test-settings/` não existia. O `ProfileRepository` usa `ensureSubdir()` que cria o diretório automaticamente, mas `settings-repository` grava direto em `DATA_PATH` (correto para prod, onde `DATA_PATH` sempre existe). Nos testes, o diretório precisa ser criado.
- **Fix:** `beforeEach` nos testes cria o diretório com `fs.mkdirSync(..., { recursive: true })` antes de limpar o arquivo.
- **Files modified:** `src/__tests__/settings.test.ts`
- **Commit:** `9c00fb7`

**2. [Rule 2 - Consistency] redirect() sem withBasePath**
- **Found during:** Task 2
- **Issue:** O plano especificava `withBasePath()` nos redirects, mas o `profile.ts` existente usa `redirect()` sem basePath. O `next.config.ts` configura `basePath` nativamente no Next.js, portanto o framework trata o prefixo automaticamente.
- **Fix:** Seguido o padrão existente do projeto — `redirect("/vacancies")` sem `withBasePath()`.
- **Files modified:** `src/app/actions/vacancy.ts`

## Known Stubs

Nenhum stub identificado. Todos os server actions têm lógica real conectada aos repositórios.

## Threat Flags

Nenhuma nova superfície de ataque introduzida além do que estava no `<threat_model>` do plano:
- Validação T-03-02 implementada em `createVacancy` e `updateVacancy` (quantity >= 1, campos obrigatórios)
- T-03-01 (path traversal em vacancyPath) implementado na Wave 1 — reutilizado aqui

## Self-Check: PASSED

Arquivos criados verificados:
- `src/lib/settings.ts` — existe
- `src/lib/repositories/settings-repository.ts` — existe
- `src/app/actions/vacancy.ts` — existe
- `src/app/actions/settings.ts` — existe
- `src/__tests__/settings.test.ts` — existe (4 testes passando)
- `src/components/shell/left-rail.tsx` — modificado (Vagas habilitada, Configurações adicionada)

Commits verificados: `694fa5e`, `d5c66a9`, `f20e1b7`, `9c00fb7` — todos presentes no log.
