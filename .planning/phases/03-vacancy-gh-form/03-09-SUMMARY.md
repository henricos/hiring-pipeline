---
phase: 03-vacancy-gh-form
plan: "09"
subsystem: excel-generator
tags: [adm-zip, xlsx, vml, ctrlprops, checkboxes, excel-generator]

# Dependency graph
requires:
  - phase: 03-vacancy-gh-form
    plan: "08"
    provides: "toExcelDate() e mapeamento openedAt no CELL_MAPPING"
provides:
  - "CHECKBOX_GROUPS com mapeamento canônico workMode/requestType/experienceLevel/englishLevel/spanishLevel → ctrlPropN"
  - "setCtrlPropChecked() — modifica estado checked de um ctrlProp no ZIP"
  - "applyCheckboxGroups() — limpa resíduos e marca opção correta em todos os grupos de checkbox"
  - "generateVacancyForm agora chama applyCheckboxGroups() antes de zip.writeZip()"
affects: [03-10, excel-generator, vml-checkboxes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reset-before-set: sempre limpar allGroup antes de marcar o target — previne resíduos de uso anterior"
    - "Falha silenciosa em ctrlProp ausente: getEntry() retorna null → return early sem lançar erro"

key-files:
  created: []
  modified:
    - src/lib/excel-generator.ts

key-decisions:
  - "Limpar TODOS os ctrlProps do allGroup antes de marcar qualquer um — previne acúmulo de estados residuais"
  - "ctrlPropName é sempre hardcoded em CHECKBOX_GROUPS (nunca de input externo) — T-03-09-01 accept"
  - "Fluente em inglês/espanhol usa célula de texto (U37/U39) via CELL_MAPPING — sem checkbox correspondente"
  - "ctrlProp36/38/40 para espanhol são shapes duplicados sobrepostos — incluídos no allGroup para limpeza"

patterns-established:
  - "CheckboxGroup interface: options (valor → ctrlProp | null) + allGroup (todos para limpar)"
  - "setCtrlPropChecked usa regex para inserir/remover atributo checked= sem parser XML"

requirements-completed: [VAG-03]

# Metrics
duration: 12min
completed: 2026-04-21
---

# Phase 03 Plan 09: Checkboxes VML Summary

**Lógica de reset e marcação dos checkboxes VML via ctrlProps para workMode, requestType, experienceLevel, englishLevel e spanishLevel — eliminando resíduos do template**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-21T12:19:00Z
- **Completed:** 2026-04-21T12:31:55Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Implementadas funções `setCtrlPropChecked()` e `applyCheckboxGroups()` em `excel-generator.ts`
- Mapeamento canônico `CHECKBOX_GROUPS` com 5 grupos (68 ctrlProps) derivado de inspeção do template
- `generateVacancyForm()` agora chama `applyCheckboxGroups()` antes de `zip.writeZip()`, garantindo que checkboxes residuais do template sejam sempre limpos antes de marcar a opção correta
- GAPs GAP-07, GAP-09 e GAP-10 fechados

## Task Commits

Aguardando aprovação do operador via `/commit-push` (regra AGENTS.md).

1. **Task 1: Implementar applyCheckboxGroups() e integrar ao generateVacancyForm()** - pendente commit `feat(03-09)`

## Files Created/Modified

- `src/lib/excel-generator.ts` — adicionadas `interface CheckboxGroup`, `const CHECKBOX_GROUPS`, `function setCtrlPropChecked()`, `function applyCheckboxGroups()`; chamada `applyCheckboxGroups()` inserida dentro de `generateVacancyForm()` antes de `zip.writeZip()`

## Decisions Made

- Usar regex simples (`replace`) para manipular o atributo `checked="Checked"` no XML — suficiente para o formato fixo do ctrlProp sem necessidade de parser XML completo
- `allGroup` inclui ctrlProp36/38/40 no grupo espanhol (shapes duplicados sobrepostos no template) para garantir limpeza completa
- Falha silenciosa quando ctrlProp não encontrado no ZIP — evita quebra total por template com versão diferente

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

## Issues Encountered

- Erro pré-existente de TypeScript em `src/components/profile/profile-list.tsx` (linha 30 — TS2362/TS2363) confirmado via `git stash` como anterior a este plano — fora do escopo (não introduzido por estas mudanças).

## User Setup Required

Nenhum — nenhuma configuração de serviço externo necessária.

## Next Phase Readiness

- Plano 03-10 pode prosseguir: workSchedule (horário de trabalho) ainda usa apenas célula de texto, pode precisar de tratamento similar
- `generateVacancyForm` agora cobre: datas (03-08), checkboxes VML (03-09) — célula sheet1.xml + ctrlProps

---
*Phase: 03-vacancy-gh-form*
*Completed: 2026-04-21*
