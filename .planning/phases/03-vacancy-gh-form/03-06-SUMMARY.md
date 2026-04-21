---
phase: 03-vacancy-gh-form
plan: "06"
subsystem: vacancy-ui
tags: [gap-closure, ui, status-management, server-actions]
dependency_graph:
  requires: ["03-01", "03-02", "03-03", "03-04", "03-05"]
  provides: ["vacancy-status-select", "change-vacancy-status-action"]
  affects: ["vacancy-list", "vacancy-edit-page"]
tech_stack:
  added: []
  patterns: ["radix-select-client-component", "server-action-with-enum-guard"]
key_files:
  created:
    - src/components/vacancy/vacancy-status-select.tsx
  modified:
    - src/components/vacancy/vacancy-list.tsx
    - src/app/actions/vacancy.ts
    - src/app/(shell)/vacancies/[id]/edit/page.tsx
decisions:
  - "Botão único de formulário GH sempre usa ?regen=1 — simplifica UX e evita confusão entre Gerar e Regenerar"
  - "VacancyStatusSelect sempre visível na edição (sem condicional de status) — qualquer status pode ser alterado"
  - "Guard de validação VACANCY_STATUSES.includes(newStatus) adicionado na action (T-03-06-01)"
metrics:
  duration: "~8 min"
  completed_date: "2026-04-21"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
---

# Phase 03 Plan 06: Gap Closure UI — Status Select e Botão Único GH

**One-liner:** Remoção do botão ChevronRight da lista de vagas, adição de Select completo de status na edição via Server Action, e consolidação dos dois botões de formulário GH em um único com ?regen=1.

## Objective

Fechar GAP-01, GAP-02 e GAP-03: remover controles de status da lista (onde não devem estar), substituir o botão de reversão por um Select completo na edição, e consolidar os dois botões de formulário GH em um único botão.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | GAP-01 — Remover botão de avanço de status da lista | da751cb | src/components/vacancy/vacancy-list.tsx |
| 2 | GAP-02 + GAP-03 — changeVacancyStatus + VacancyStatusSelect + refatorar edição | 729965b | src/app/actions/vacancy.ts, src/components/vacancy/vacancy-status-select.tsx, src/app/(shell)/vacancies/[id]/edit/page.tsx |

## GAPs Fechados

- **GAP-01:** Lista `/vacancies` não exibe mais botão ChevronRight de avanço de status. Apenas Editar e Excluir.
- **GAP-02:** Action `changeVacancyStatus(id, newStatus)` adicionada em vacancy.ts. Permite alterar para qualquer dos 3 estados válidos.
- **GAP-03:** Página de edição exibe `VacancyStatusSelect` sempre visível (sem condicional), e tem exatamente um botão "Gerar formulário GH" com `?regen=1`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Guard de validação de status na action changeVacancyStatus**
- **Found during:** Task 2 (threat model T-03-06-01)
- **Issue:** O threat model indicava disposição `mitigate` para o caso de valor de status arbitrário vindo do cliente
- **Fix:** Adicionado guard `if (!VACANCY_STATUSES.includes(newStatus)) return;` no início de `changeVacancyStatus` antes de qualquer operação de persistência
- **Files modified:** src/app/actions/vacancy.ts
- **Commit:** 729965b

Fora isso: plano executado exatamente como escrito.

## Known Stubs

Nenhum. Todos os componentes estão conectados a dados reais via Server Actions e repositório.

## Threat Flags

Nenhum novo surface identificado além do já documentado no threat model do plano.

## Self-Check: PASSED

- [x] src/components/vacancy/vacancy-list.tsx — sem ChevronRight, sem advanceVacancyStatus
- [x] src/components/vacancy/vacancy-status-select.tsx — arquivo criado
- [x] src/app/actions/vacancy.ts — changeVacancyStatus definida com guard
- [x] src/app/(shell)/vacancies/[id]/edit/page.tsx — VacancyStatusSelect presente, Regenerar ausente, regen=1 presente
- [x] Commits da751cb e 729965b existem no histórico
- [x] npx tsc --noEmit sem erros novos (erros pré-existentes em profile-list.tsx não introduzidos por este plano)
