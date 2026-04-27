---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: "04"
subsystem: ui-components
tags: [textarea, dynamic-list-field, profile-item-field, resize-none, ux]
dependency_graph:
  requires: []
  provides: [textarea-multi-line-content-descriptivo]
  affects: [profile-form, dynamic-list-field, profile-item-field]
tech_stack:
  added: []
  patterns: [textarea-nativo-html, resize-none-tailwind, items-start-alignment]
key_files:
  created: []
  modified:
    - src/components/ui/dynamic-list-field.tsx
    - src/components/ui/profile-item-field.tsx
decisions:
  - "D-14: textarea rows=2 aplicado em ambos os componentes"
  - "D-15: resize-none garante altura uniforme entre cards"
  - "D-17: label completo Obrigatório/Diferencial preservado sem abreviação"
  - "D-18: Enter quebra linha no textarea; submit permanece via botão Salvar"
  - "D-19: items-start no container flex para alinhar topo do textarea com botões"
metrics:
  duration_minutes: 5
  completed_date: "2026-04-27"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 09 Plan 04: Textareas Multi-Linha em Conteúdo Descritivo — Summary

**One-liner:** Substituição de `<Input>` por `<textarea rows={2} resize-none>` nos componentes `DynamicListField` e `ProfileItemField`, garantindo caixas de altura uniforme nas 4 sub-seções de Conteúdo Descritivo do perfil.

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Trocar Input por textarea em dynamic-list-field.tsx | c720fdb | src/components/ui/dynamic-list-field.tsx |
| 2 | Trocar Input por textarea em profile-item-field.tsx | 691ee69 | src/components/ui/profile-item-field.tsx |

## O Que Foi Feito

### Task 1 — dynamic-list-field.tsx

- Removido import `import { Input } from "@/components/ui/input"` (não mais utilizado).
- Substituído `<Input>` por `<textarea rows={2} resize-none px-3 py-2 text-body-md text-on-surface border border-input rounded-sm>` com `INPUT_CLASS` preservado para manter look-and-feel do design system.
- Container `<div className="flex gap-2">` atualizado para `flex gap-2 items-start` — alinha o topo do botão de remover com o topo do textarea.
- Hidden input `<input type="hidden" name={name} value={item.value} />` preservado intacto (contrato FormData não alterado).

### Task 2 — profile-item-field.tsx

- Removido import `import { Input } from "@/components/ui/input"`.
- Substituído `<Input>` por `<textarea rows={2}>` com mesmas classes da Task 1 para uniformidade visual.
- Container `<div className="flex gap-2 items-center">` atualizado para `flex gap-2 items-start`.
- Botão `Obrigatório/Diferencial` preservado com label completo (D-17 — sem abreviação O/D).
- Hidden inputs `name` e `${name}_required` preservados intactos (contrato de arrays paralelos da server action mantido).

## Critérios de Sucesso

- [x] Ambos os componentes usam `<textarea rows={2}>` com `resize-none`.
- [x] Imports de `Input` removidos dos dois arquivos.
- [x] Container flex usa `items-start` em ambos.
- [x] Label "Obrigatório/Diferencial" preservado em `profile-item-field.tsx`.
- [x] `npm run typecheck` verde (0 erros).
- [x] `npm test` verde (135/135 testes passam).

## Deviations from Plan

Nenhum — plano executado exatamente como especificado.

**Nota sobre lint:** `npm run lint` falha no worktree com erro pré-existente ("Invalid project directory provided, no such directory: .../lint") — problema de ambiente do worktree, não causado pelas alterações. Confirmado que o erro ocorre tanto antes quanto depois das mudanças via `git stash`.

## Known Stubs

Nenhum — implementação completa sem placeholders.

## Threat Flags

Nenhum — nenhuma nova superfície de segurança introduzida. Textareas seguem o fluxo existente para FormData com escape automático do React.

## Self-Check: PASSED

- [x] `src/components/ui/dynamic-list-field.tsx` — modificado, commit c720fdb confirmado.
- [x] `src/components/ui/profile-item-field.tsx` — modificado, commit 691ee69 confirmado.
- [x] Commits existem: `git log --oneline` confirma c720fdb e 691ee69 na branch `worktree-agent-a6151aeede4f7906c`.
