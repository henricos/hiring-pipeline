---
phase: 03-vacancy-gh-form
plan: "12"
subsystem: settings-schema-migration
tags: [gap-closure, schema, forms, excel-generator, gap-12]
dependency_graph:
  requires: [03-10]
  provides: [area-settings-unified-fields]
  affects: [excel-generator, vacancy-form, profile-form, settings-form]
tech_stack:
  added: []
  patterns: [field-migration-to-shared-config, optional-fields-backward-compat]
key_files:
  created: []
  modified:
    - src/lib/settings.ts
    - src/lib/vacancy.ts
    - src/lib/profile.ts
    - src/lib/excel-generator.ts
    - src/app/actions/settings.ts
    - src/app/actions/vacancy.ts
    - src/app/actions/profile.ts
    - src/components/settings/settings-form.tsx
    - src/components/vacancy/vacancy-form.tsx
    - src/components/profile/profile-form.tsx
decisions:
  - "Campos de idioma, infra e dados fixos de vaga movidos para AreaSettings como opcionais — JSONs existentes continuam válidos sem migração de dados"
  - "LanguageLevel importado em settings.ts de profile.ts (sem dependência circular — settings não é importado por profile)"
  - "applyCheckboxGroups recebe settings como 4º parâmetro — assinatura da função atualizada"
  - "requestType e experienceLevel preservados lendo de vacancy/profile — não são fixos por área"
metrics:
  duration_minutes: 9
  completed_date: "2026-04-21"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 10
---

# Phase 03 Plan 12: Migração de Campos Fixos por Área para AreaSettings — Summary

**One-liner:** Migração de 10 campos fixos por área (idiomas, infra, centro de custo, modalidade, horário) de JobProfile/Vacancy para AreaSettings com retrocompatibilidade via campos opcionais.

## What Was Built

Campos que têm valor fixo por área (a mesma equipe sempre usa o mesmo centro de custo, modalidade, nível de inglês, etc.) foram movidos de `JobProfile` e `Vacancy` para `AreaSettings`. Isso elimina retrabalho de preenchimento em cada perfil e vaga criados.

### Mudanças de Schema (Task 1)

**src/lib/settings.ts** — `AreaSettings` expandida com 10 novos campos:
- Idiomas: `englishLevel`, `spanishLevel`, `otherLanguage`, `otherLanguageLevel`
- Conteúdo: `additionalInfo`
- Infraestrutura: `systemsRequired`, `networkFolders`
- Dados de vaga: `costCenter`, `workSchedule`, `workScheduleOther`, `travelRequired`, `workMode`

**src/lib/vacancy.ts** — `costCenter`, `workSchedule`, `workScheduleOther`, `travelRequired`, `workMode` tornados opcionais (`?`). `createDefaultVacancy` não os inicializa mais.

**src/lib/profile.ts** — `englishLevel`, `spanishLevel`, `otherLanguage`, `otherLanguageLevel`, `additionalInfo`, `systemsRequired`, `networkFolders` tornados opcionais (`?`).

### Atualizações de Formulários e Lógica (Task 2)

**settings-form.tsx** — 3 novas seções: Idiomas, Infraestrutura, Dados Fixos da Vaga.

**vacancy-form.tsx** — removidos: costCenter, workSchedule (+ workScheduleOther), workMode, travelRequired. Faixa salarial exibida individualmente.

**profile-form.tsx** — removidos: inglês, espanhol, outro idioma (Seção 2), informações complementares, sistemas necessários, pastas de rede (ex-Seção 4 virou comentário). Seção de Observações Internas renumerada.

**actions/settings.ts** — `updateSettings` extrai e salva todos os 10 novos campos.

**actions/vacancy.ts** — `createVacancy` e `updateVacancy` não mais leem/escrevem campos migrados.

**actions/profile.ts** — `extractProfileData` não mais inclui campos migrados no retorno.

**excel-generator.ts** — `cellValues` lê idiomas/infra/dados-de-vaga de `settings.*`. `applyCheckboxGroups` recebe `settings` como 4º parâmetro; workMode, workSchedule, englishLevel, spanishLevel leem de settings. `requestType` e `experienceLevel` preservados lendo de vacancy/profile.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Erros de tipo TS em onValueChange dos selects de idioma**
- **Found during:** Task 2 — compilação TypeScript
- **Issue:** `useState<LanguageLevel>` gerava incompatibilidade com `onValueChange: (value: string) => void` do Select do shadcn
- **Fix:** Adicionado `import type { LanguageLevel }` e cast `(v) => setEnglishLevel(v as LanguageLevel)` para inglês e espanhol
- **Files modified:** `src/components/settings/settings-form.tsx`
- **Commit:** bec532a

## Known Stubs

Nenhum. Todos os campos novos estão conectados: form → action → settings.json → excel-generator.

## Threat Flags

Nenhum novo surface de segurança introduzido. Todos os campos são lidos de FormData interno, sem novos endpoints de rede.

## Self-Check: PASSED

Todos os 10 arquivos modificados existem no filesystem. Commits `3ae3e42` (Task 1) e `bec532a` (Task 2) verificados no histórico git. Compilação TypeScript passa sem erros novos (apenas 2 erros pré-existentes em `profile-list.tsx` fora do escopo deste plano).
