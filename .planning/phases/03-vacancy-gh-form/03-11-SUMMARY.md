---
phase: 03-vacancy-gh-form
plan: "11"
subsystem: ui
tags: [layout, tailwind, vacancy, responsive, grid]

# Dependency graph
requires:
  - phase: 03-vacancy-gh-form
    provides: VacancyForm, VacancyStatusSelect, página edit/page.tsx e new/page.tsx existentes
provides:
  - Layout reestruturado em edit/page.tsx com seção Ações (Status + Formulário GH) side by side em grid responsivo
  - Wrapper bg-surface-container-low em ambas as páginas (edit e new)
  - VacancyForm sem max-w-3xl (constraint de largura delegada às páginas)
affects: [03-vacancy-gh-form]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Container visual com bg-surface-container-low envolvendo formulário + ações"
    - "Grid responsivo grid-cols-1 md:grid-cols-2 para seções de ação lado a lado"
    - "Constraint de largura (max-w-3xl) nas páginas, não nos componentes filhos"

key-files:
  created: []
  modified:
    - src/app/(shell)/vacancies/[id]/edit/page.tsx
    - src/app/(shell)/vacancies/new/page.tsx
    - src/components/vacancy/vacancy-form.tsx

key-decisions:
  - "Remover max-w-3xl do VacancyForm e mover constraint de largura para as páginas pai (padrão de composição mais flexível)"
  - "Usar grid grid-cols-1 md:grid-cols-2 para layout responsivo das seções de ação"

patterns-established:
  - "Padrão de wrapper visual: bg-surface-container-low no container da página, bg-white nos cards internos"

requirements-completed: [VAG-01, VAG-02]

# Metrics
duration: 10min
completed: 2026-04-21
---

# Phase 03 Plan 11: Layout das Páginas de Vaga Summary

**Layout reestruturado em edit/page.tsx com Status e Formulário GH side by side em grid md:grid-cols-2, dentro de container bg-surface-container-low compartilhado com o formulário**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-21T12:38:00Z
- **Completed:** 2026-04-21T12:48:23Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Seções Status da vaga e Formulário GH unificadas em container visual com fundo sutil (bg-surface-container-low)
- Grid responsivo md:grid-cols-2: side by side em telas medias/largas, empilhado em mobile
- Removido max-w-3xl do componente VacancyForm — constraint delegada ao wrapper da página
- new/page.tsx consistente com edit/page.tsx (mesmo wrapper bg-surface-container-low)
- Duas `<section>` soltas fora do card removidas de edit/page.tsx

## Task Commits

Aguardando autorização via /commit-push (regra do projeto — nunca commits automáticos).

## Files Created/Modified
- `src/app/(shell)/vacancies/[id]/edit/page.tsx` — layout reestruturado: VacancyForm + seção Ações (grid 2 colunas) dentro de container bg-surface-container-low; sections antigas removidas
- `src/app/(shell)/vacancies/new/page.tsx` — Suspense envolvido por div bg-surface-container-low rounded-md
- `src/components/vacancy/vacancy-form.tsx` — max-w-3xl substituído por w-full no div raiz

## Decisions Made
- `max-w-3xl` removido do VacancyForm e mantido apenas no `div.w-full.max-w-3xl` das páginas pai. Decisão alinhada ao plano: componente compartilhado não deve impor constraint de largura.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removido max-w-3xl do VacancyForm**
- **Found during:** Task 1 (leitura de vacancy-form.tsx)
- **Issue:** O componente tinha `max-w-3xl` no div raiz, o que conflitaria com o wrapper bg-surface-container-low da página (o componente filho limitaria a largura dentro do container pai)
- **Fix:** Substituído `max-w-3xl` por `w-full` no div raiz do VacancyForm
- **Files modified:** src/components/vacancy/vacancy-form.tsx
- **Verification:** grep "max-w-3xl" não retorna resultados no componente
- **Committed in:** junto ao commit da Task 1 (aguardando /commit-push)

---

**Total deviations:** 1 auto-fixed (Rule 2 — funcionalidade crítica para o layout correto)
**Impact on plan:** Ajuste previsto no plano como verificação condicional. Sem scope creep.

## Issues Encountered

Erros de TypeScript pré-existentes em `src/components/profile/profile-list.tsx` (operação aritmética com tipo inválido) — fora do escopo desta tarefa, não introduzidos por estas alterações.

## Threat Surface Scan

Nenhuma nova superficie de segurança introduzida. Mudanca puramente visual/layout — sem novos endpoints, sem novo acesso a dados, sem alteracoes de autenticacao.

## Known Stubs

Nenhum stub identificado. Os dados de Status (VacancyStatusSelect) e o link do Formulário GH ja estavam conectados a dados reais — apenas reposicionados no layout.

## Next Phase Readiness
- GAP-11 fechado: layout das páginas de vaga corrigido
- Pronto para validacao visual no browser (verificar responsividade e aparencia do container)
- Restam GAPs a verificar conforme registro em 03-08-SUMMARY.md

---
*Phase: 03-vacancy-gh-form*
*Completed: 2026-04-21*
