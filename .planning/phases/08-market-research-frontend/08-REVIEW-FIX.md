---
phase: 08-market-research-frontend
fixed_at: 2026-04-26T00:00:00Z
review_path: .planning/phases/08-market-research-frontend/08-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 8: Code Review Fix Report

**Fixed at:** 2026-04-26
**Source review:** .planning/phases/08-market-research-frontend/08-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (1 Critical, 4 Warning)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: Path traversal no parâmetro `date` em `getVagas` e `getResumo`

**Files modified:** `src/lib/repositories/research-repository.ts`
**Commit:** 4789d91
**Applied fix:** Adicionado método privado `validateDate(date: string): void` em `JsonResearchRepository` que lança erro se o valor não corresponder a `/^\d{4}-\d{2}-\d{2}(?:-\d+)?$/`. O método é chamado no início de `getVagas` e `getResumo`, antes de qualquer operação de filesystem, bloqueando valores como `"../../../../etc/shadow"`.

---

### WR-01: Resumo de Mercado e Vagas sempre em branco em produção

**Files modified:** `src/app/(shell)/profiles/[id]/page.tsx`, `src/components/profile/profile-detail-tabs.tsx`
**Commit:** 99b7aad
**Applied fix:** `page.tsx` agora pré-carrega os dados de vagas e resumo no servidor usando `Promise.all` sobre todas as pesquisas, construindo `allVagas: Record<string, any[]>` e `researchesWithResumo` (com `resumoContent` embutido). Ambos são passados para `ProfileDetailTabs`. Em `profile-detail-tabs.tsx`, o tipo `ResearchWithResumo = Research & { resumoContent?: any }` foi adicionado para aceitar o campo enriquecido e propagá-lo corretamente ao `ProfileDetailResumo`.

---

### WR-02: `deleteProfile` não é `await`-ado dentro de `startTransition`

**Files modified:** `src/components/profile/profile-list.tsx`
**Commit:** f5e0eeb
**Applied fix:** Callback de `startTransition` convertido de síncrono para `async`, com `await deleteProfile(deleteTarget.id)` — suportado pelo React 19. Garante que erros da server action sejam propagados e que `isPending` reflita o ciclo completo da operação.

---

### WR-03: `baseName` nunca é populado em `listByProfileId`

**Files modified:** `src/lib/repositories/research-repository.ts`
**Commit:** 89208f2
**Applied fix:** Na criação de cada entrada no `Map`, `baseName` agora é derivado do nome do arquivo removendo o sufixo `-(vagas|resumo).json` via `.replace(/-(vagas|resumo)\.json$/, "")`. Exemplos: `"2026-04-24-vagas.json"` → `"2026-04-24"`, `"2026-04-24-2-vagas.json"` → `"2026-04-24-2"`.

---

### WR-04: Teste `profile-detail-vagas.test.tsx` — asserção acidental

**Files modified:** `src/components/profile/profile-detail-vagas.test.tsx`
**Commit:** f7f8bb9
**Applied fix:** O teste "clicar em uma linha de pesquisa" agora usa `singleResearch = [mockResearches[0]]` (1 item) ao invés de `mockResearches` (2 itens). Com 1 pesquisa, o componente renderiza `<div>` clicáveis em vez de `<select>`, exercendo o caminho de código correto. Foi adicionado comentário explicando que `selectedDate` é inicializado com `researches[0].date` por padrão, portanto as vagas já estão visíveis — o clique confirma que o handler executa sem erro.

---

_Fixed: 2026-04-26_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
