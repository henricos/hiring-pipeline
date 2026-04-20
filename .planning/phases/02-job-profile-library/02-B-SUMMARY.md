---
phase: 02-job-profile-library
plan: B
subsystem: profile-repository
tags: [repository-pattern, server-actions, typescript, json-persistence]
dependency_graph:
  requires:
    - src/lib/profile.ts (Plan A — tipos JobProfile e generateProfileId)
    - src/lib/data-service.ts (Phase 1 — ensureSubdir)
    - src/lib/base-path.ts (Phase 1 — withBasePath)
  provides:
    - src/lib/repositories/profile-repository.ts — interface + implementação JSON + singleton
    - src/app/actions/profile.ts — 5 server actions CRUD delegando ao repositório
  affects:
    - src/components/profile/profile-form.tsx (Plan C — importa createProfile, updateProfile)
    - src/app/(shell)/profiles/page.tsx (Plan C — importa listProfiles)
    - src/app/(shell)/profiles/[id]/edit/page.tsx (Plan C — importa getProfile, updateProfile)
tech_stack:
  added: []
  patterns:
    - Repository pattern — interface ProfileRepository como contrato de substituição futura
    - Server actions delegam exclusivamente ao repositório; sem fs.* nas actions
    - redirect() fora de try/catch (NEXT_REDIRECT é exceção interna do Next.js)
    - Erros de IO retornados como { error: string } sem stack trace exposto
    - Validação de path traversal no profilePath (id não pode conter .., /, \\)
key_files:
  created:
    - src/lib/repositories/profile-repository.ts
    - src/app/actions/profile.ts
  modified: []
decisions:
  - "JsonProfileRepository.profilePath valida IDs antes de construir o path — previne T-02B-01 (path traversal)"
  - "JSON.parse dentro de try/catch em list/findById — arquivos corrompidos são ignorados silenciosamente (T-02B-05)"
  - "redirect() posicionado fora de try/catch em createProfile, updateProfile, deleteProfile — padrão Next.js"
  - "extractProfileData() centraliza extração e validação de FormData — evita duplicação nas 2 actions mutantes"
metrics:
  duration: "~3 minutos"
  completed: "2026-04-20T11:22:13Z"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-04
  - PROF-05
---

# Phase 02 Plan B: Repository Pattern + Server Actions CRUD — Summary

**One-liner:** Interface `ProfileRepository` + `JsonProfileRepository` persistindo em JSON com singleton, e 5 server actions CRUD que delegam exclusivamente ao repositório sem acesso direto ao fs.

## O Que Foi Feito

Criação da camada de repositório para perfis de vaga seguindo o padrão estabelecido na decisão de arquitetura do projeto (STATE.md 2026-04-20). A interface `ProfileRepository` define o contrato de substituição futura (JSON → banco de dados); a `JsonProfileRepository` persiste em `DATA_PATH/profiles/{id}.json`. As server actions em `profile.ts` delegam 100% da I/O ao singleton `profileRepository` — nenhuma chamada a `fs.*` nas actions.

## Tarefas Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|---------|
| B-1 | Criar ProfileRepository interface e JsonProfileRepository | 1aac166 | profile-repository.ts |
| B-2 | Criar server actions CRUD delegando ao repository | a67a38c | profile.ts |

## Critérios de Sucesso

- [x] `ProfileRepository` interface exportada com métodos list, findById, save, delete
- [x] `JsonProfileRepository` implementa a interface persistindo em DATA_PATH/profiles/{id}.json
- [x] `profileRepository` singleton exportado e pronto para uso pelas server actions
- [x] `createProfile()` delega para `profileRepository.save()` e redireciona para /profiles
- [x] `updateProfile()` carrega via `findById`, mescla campos, salva via `save()`
- [x] `deleteProfile()` delega para `profileRepository.delete()`
- [x] `listProfiles()` delega para `profileRepository.list()`
- [x] `getProfile()` delega para `profileRepository.findById()`
- [x] Erros de IO capturados e retornados como `{ error: string }` — sem stack trace exposto
- [x] Nenhuma chamada a `fs.*` dentro de `src/app/actions/profile.ts`
- [x] `npx tsc --noEmit` passa sem erros

## Desvios do Plano

Nenhum — plano executado exatamente como escrito.

## Stubs Conhecidos

Nenhum. Ambos os arquivos são código funcional sem dados mockados ou placeholders.

## Threat Flags

Nenhuma superfície nova além do que está no threat model do plano. As mitigações T-02B-01 (path traversal) e T-02B-05 (JSON.parse) estão implementadas conforme especificado.

## Self-Check: PASSED

Arquivos criados verificados:
- `/home/henrico/github/henricos/hiring-pipeline/src/lib/repositories/profile-repository.ts` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/app/actions/profile.ts` — FOUND

Commits verificados:
- `1aac166` feat(02-B): criar ProfileRepository interface e JsonProfileRepository — FOUND
- `a67a38c` feat(02-B): criar server actions CRUD delegando ao repository — FOUND
