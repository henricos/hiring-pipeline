---
phase: 02-job-profile-library
plan: A
subsystem: profile-schema
tags: [typescript, shadcn, schema, types]
dependency_graph:
  requires: []
  provides:
    - src/lib/profile.ts — tipos e constantes para perfis de vaga
    - src/components/ui/select.tsx — componente Select shadcn
    - src/components/ui/textarea.tsx — componente Textarea shadcn
    - src/components/ui/alert-dialog.tsx — componente AlertDialog shadcn
  affects:
    - src/app/actions/profile.ts (Plan B — importa JobProfile e generateProfileId)
    - src/components/profile/profile-form.tsx (Plan C — importa constantes dos selects)
tech_stack:
  added:
    - shadcn/ui Select (radix-ui)
    - shadcn/ui Textarea (radix-ui)
    - shadcn/ui AlertDialog (radix-ui)
  patterns:
    - Tipos union TypeScript para restrição compile-time de valores válidos
    - Constantes de array tipadas para selects
    - ID gerado via timestamp + random (colisão-seguro em single-user)
key_files:
  created:
    - src/lib/profile.ts
    - src/components/ui/select.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/alert-dialog.tsx
    - src/__tests__/profile.test.ts
  modified: []
decisions:
  - "generateProfileId usa formato profile-{timestamp}-{random7chars} — simples e colisão-seguro para single-user"
  - "Arquivo profile.ts sem use server — importável por client e server components"
metrics:
  duration: "~8 minutos"
  completed: "2026-04-20T11:16:50Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
  tests_written: 20
  tests_passing: 20
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-05
---

# Phase 02 Plan A: Schema de Tipos e Componentes shadcn — Summary

**One-liner:** Tipos union TypeScript para todos os campos do formulário GH + três componentes shadcn instalados sem customização.

## O Que Foi Feito

Instalação dos três componentes shadcn ausentes (Select, Textarea, AlertDialog) e criação do arquivo `src/lib/profile.ts` com o schema completo de tipos e constantes para perfis de vaga.

## Tarefas Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|---------|
| A-1 | Instalar componentes shadcn ausentes | a3cd86b | select.tsx, textarea.tsx, alert-dialog.tsx |
| A-2 (RED) | Testes do schema de perfil (TDD) | 6f5a5f4 | profile.test.ts |
| A-2 (GREEN) | Criar src/lib/profile.ts | ae8091b | profile.ts |

## Critérios de Sucesso

- [x] `src/components/ui/select.tsx` existe — instalado pelo shadcn CLI
- [x] `src/components/ui/textarea.tsx` existe — instalado pelo shadcn CLI
- [x] `src/components/ui/alert-dialog.tsx` existe — instalado pelo shadcn CLI
- [x] `src/lib/profile.ts` exporta `JobProfile`, `ExperienceLevel`, `EducationLevel`, `PostGraduateLevel`, `CertificationLevel`, `LanguageLevel`
- [x] `src/lib/profile.ts` exporta `EXPERIENCE_LEVELS`, `EDUCATION_LEVELS`, `POST_GRADUATE_LEVELS`, `CERTIFICATION_LEVELS`, `LANGUAGE_LEVELS`
- [x] `src/lib/profile.ts` exporta `generateProfileId`
- [x] `npx tsc --noEmit` passa sem erros
- [x] 20 testes passam (vitest)

## Desvios do Plano

Nenhum — plano executado exatamente como escrito.

## Stubs Conhecidos

Nenhum. O arquivo `src/lib/profile.ts` é puro schema de tipos e constantes — sem dados mockados ou placeholders.

## Threat Flags

Nenhuma superfície nova além do que está no threat model do plano.

## Self-Check: PASSED

Arquivos criados verificados:
- `/home/henrico/github/henricos/hiring-pipeline/src/lib/profile.ts` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/components/ui/select.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/components/ui/textarea.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/components/ui/alert-dialog.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/__tests__/profile.test.ts` — FOUND

Commits verificados:
- `a3cd86b` feat(02-A): instalar componentes shadcn — FOUND
- `6f5a5f4` test(02-A): add failing tests — FOUND
- `ae8091b` feat(02-A): criar schema de tipos — FOUND
