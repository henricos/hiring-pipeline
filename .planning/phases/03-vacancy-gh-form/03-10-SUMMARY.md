---
phase: 03-vacancy-gh-form
plan: "10"
subsystem: excel-generator, vacancy-form, vacancy-schema
tags: [gap-closure, GAP-05, workSchedule, checkbox, excel]
dependency_graph:
  requires: ["03-09"]
  provides: ["workScheduleOther-field", "workSchedule-checkbox-excel"]
  affects: ["src/lib/vacancy.ts", "src/lib/excel-generator.ts", "src/app/actions/vacancy.ts", "src/components/vacancy/vacancy-form.tsx"]
tech_stack:
  added: []
  patterns: ["conditional-field", "checkbox-group-pattern"]
key_files:
  created: []
  modified:
    - src/lib/vacancy.ts
    - src/app/actions/vacancy.ts
    - src/lib/excel-generator.ts
    - src/components/vacancy/vacancy-form.tsx
decisions:
  - "workScheduleOther mapeado para célula Z18 (igual ao campo workSchedule anterior) — célula preenchida somente quando workSchedule===Outro"
  - "workSchedule removido do CELL_MAPPING direto; substituído por workScheduleOther que é condicional"
  - "ctrlProp3 = Das 08h às 17h; ctrlProp4 = Das 09h às 18h (confirmados na inspeção do template)"
metrics:
  duration: "~10 minutos"
  completed_date: "2026-04-21"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 03 Plan 10: workSchedule completo com campo Outro e checkbox Excel (GAP-05) Summary

**One-liner:** Campo workScheduleOther adicionado ao schema, formulário web exibe input condicional para "Outro", e gerador Excel marca ctrlProp3/4 e preenche Z18 somente quando necessário.

---

## Tasks Executed

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Adicionar workScheduleOther ao schema e actions | a1b3ca1 | src/lib/vacancy.ts, src/app/actions/vacancy.ts |
| 2 | Ajustar formulário web e gerador Excel para workSchedule | ba3e474 | src/components/vacancy/vacancy-form.tsx, src/lib/excel-generator.ts |

---

## What Was Built

### GAP-05: workSchedule com checkboxes corretos no Excel

**Antes (com bug):** Z18 sempre recebia o valor enum de `workSchedule` (ex: "Das 08h às 17h") como texto. Checkboxes ctrlProp3/ctrlProp4 nunca eram controlados — ficavam com resíduo do template.

**Depois (correto):**
- `workSchedule = "Das 08h às 17h"` → ctrlProp3 marcado, ctrlProp4 desmarcado, Z18 vazia
- `workSchedule = "Das 09h às 18h"` → ctrlProp4 marcado, ctrlProp3 desmarcado, Z18 vazia
- `workSchedule = "Outro"` → ambos desmarcados, Z18 = texto de `workScheduleOther`

### Schema

`src/lib/vacancy.ts`: campo `workScheduleOther?: string` adicionado à interface `Vacancy` após `workSchedule`.

### Actions

`src/app/actions/vacancy.ts`:
- `createVacancy`: extrai `workScheduleOther` condicionalmente (somente quando `workSchedule === "Outro"`)
- `updateVacancy`: atualiza `workScheduleOther` condicionalmente (limpa para `undefined` se mudar de "Outro")

### Gerador Excel

`src/lib/excel-generator.ts`:
- `CELL_MAPPING.workSchedule` renomeado para `CELL_MAPPING.workScheduleOther` (Z18)
- `CHECKBOX_GROUPS.workSchedule` adicionado com `ctrlProp3` e `ctrlProp4`
- Bloco `workSchedule` inserido em `applyCheckboxGroups()` antes do bloco `workMode`
- `cellValues[Z18]` preenchido somente quando `vacancy.workSchedule === "Outro"`

### Formulário Web

`src/components/vacancy/vacancy-form.tsx`:
- `useState workScheduleOther` inicializado com `vacancy?.workScheduleOther ?? ""`
- Campo `Input` condicional renderizado somente quando `workSchedule === "Outro"`
- Campo possui `name="workScheduleOther"` para envio pelo FormData

---

## Deviations from Plan

None — plano executado exatamente como especificado.

---

## Known Stubs

None — todos os campos estão devidamente conectados (FormData → action → Vacancy → JSON → Excel).

---

## Threat Surface Scan

Nenhuma nova superfície de rede ou endpoint introduzida. O campo `workScheduleOther` flui por `escapeXml()` antes de ser inserido no XML do sheet (T-03-10-01 mitigado pelo fluxo existente de `cellValues`).

---

## Self-Check

- [x] `src/lib/vacancy.ts` modificado com `workScheduleOther?: string` — FOUND
- [x] `src/app/actions/vacancy.ts` com 5 ocorrências de `workScheduleOther` — FOUND
- [x] `src/lib/excel-generator.ts` com `workScheduleOther`, `ctrlProp3`, `ctrlProp4` — FOUND
- [x] `src/components/vacancy/vacancy-form.tsx` com campo condicional — FOUND
- [x] Commit a1b3ca1 (Task 1) — FOUND
- [x] Commit ba3e474 (Task 2) — FOUND
- [x] TypeScript compila sem erros nos arquivos modificados — PASSED (erros pré-existentes em profile-list.tsx, fora do escopo)

## Self-Check: PASSED
