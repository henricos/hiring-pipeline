---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 03
subsystem: ui
tags: [vacancy-list, download-button, xlsx, lucide, base-path, nextjs, react]

# Dependency graph
requires:
  - phase: 09-02
    provides: "Rota GET /api/vacancies/[id]/form reescrita para os.tmpdir() sem cache (D-04/D-05)"
provides:
  - "Botão Download no card de vagas: <a href download> envolto em Button asChild"
  - "Prop apiPrefix em VacancyList propagada do Server Component pai (page.tsx)"
  - "Ordem de botões: [Download] [Edit] [Delete] (D-11)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Button asChild + <a download> para trigger de download de arquivo binário (sem <Link> do Next)"
    - "apiPrefix como prop opcional com default '' — retrocompatibilidade em testes e SSR"
    - "normalizeBasePath + env.APP_BASE_PATH no Server Component pai, prop injetada no Client Component"

key-files:
  created:
    - src/components/vacancy/vacancy-list.test.tsx
  modified:
    - src/components/vacancy/vacancy-list.tsx
    - src/app/(shell)/vacancies/page.tsx

key-decisions:
  - "apiPrefix como prop opcional (default '') — Client Component não pode importar env diretamente (D-12)"
  - "Trigger via <a href download>, não <Link> do Next — browser precisa de <a> cru para attachment download (D-13)"
  - "URL sem ?regen=1 — rota 09-02 já regenera incondicionalmente (D-10)"
  - "Ordem [Download][Edit][Delete] — ações destrutivas por último (D-11)"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-04-27
---

# Phase 9 Plano 03: Botão Download na Lista de Vagas — Summary

**Botão Download adicionado a cada card de vaga em /vacancies via `<a href download>` apontando para `/api/vacancies/{id}/form`, com apiPrefix propagado do Server Component pai**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-27T16:02:00Z
- **Completed:** 2026-04-27T16:10:25Z
- **Tasks:** 1 (TDD: RED commit + GREEN commit)
- **Files modified:** 3

## Accomplishments

- Botão Download presente em cada card de `/vacancies` na ordem `[Download] [Edit] [Delete]` (D-11)
- Trigger via `<a href download>` cru — browser dispara download de attachment corretamente (D-13)
- URL sem `?regen=1` — aproveita a rota do 09-02 que regenera incondicionalmente (D-10)
- `aria-label` descritivo: "Baixar formulário GH da vaga {title}" (D-12)
- `apiPrefix` propagado do Server Component pai (`page.tsx`) via `normalizeBasePath + env.APP_BASE_PATH`
- Padrão visual idêntico aos botões Edit e Delete: `Button ghost icon 40x40`
- 7 novos testes TDD cobrindo: presença, href, atributo download, apiPrefix, ordem de botões
- 155 testes passando sem regressões; typecheck verde

## Task Commits

Cada task foi commitada atomicamente:

1. **TDD RED — Testes para botão Download em vacancy-list** - `5660f10` (test)
2. **Task 1: Implementar botão Download e prop apiPrefix** - `2b2e6ca` (feat)

_Nota: Task 1 seguiu fluxo TDD — commit RED separado, depois commit GREEN com implementação e testes corrigidos (fixture de tipos ajustado para schema correto de Vacancy/JobProfile)._

## Files Created/Modified

- `src/components/vacancy/vacancy-list.tsx` — Import `Download` de lucide; prop `apiPrefix?: string`; botão Download inserido como primeiro filho da div de ações
- `src/app/(shell)/vacancies/page.tsx` — Imports `env` e `normalizeBasePath`; cálculo de `apiPrefix`; prop passada para `<VacancyList>`
- `src/components/vacancy/vacancy-list.test.tsx` — 7 testes TDD: presença, href sem regen, atributo download, apiPrefix, ordem D-11, 3 botões

## Decisions Made

- **D-09 aplicado:** Botão Download adicionado ao card de `/vacancies`
- **D-10 aplicado:** URL sem `?regen=1` — rota 09-02 já garante geração incondicional
- **D-11 aplicado:** Ordem `[Download] [Edit] [Delete]`
- **D-12 aplicado:** Padrão visual `Button ghost icon 40x40`, ícone `Download` lucide, `aria-label` descritivo
- **D-13 aplicado:** `<a href download>` cru, não `<Link>` do Next
- **Claude's Discretion (D-12):** aria-label padronizado como "Baixar formulário GH da vaga {title}" — consistente com "Editar vaga {title}" e "Excluir vaga {title}"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixture de tipos do teste incompatível com schema real**

- **Found during:** Fase GREEN (typecheck após testes passarem)
- **Issue:** Fixture `mockProfile` usava `experienceLevel: "mid"` (não está no union type `ExperienceLevel`) e omitia campos obrigatórios de `Vacancy` (`requestType`, `salaryRange`, `confidential`, `budgeted`, `headcountIncrease`, `expectedHireDate`)
- **Fix:** Corrigido para `experienceLevel: "3-5 anos"` e campos obrigatórios de `Vacancy` adicionados ao fixture
- **Files modified:** `src/components/vacancy/vacancy-list.test.tsx`
- **Commit:** `2b2e6ca` (incluído no commit GREEN)

**2. [Rule 1 - Bug] Mock do next/link não propagava props extras (aria-label)**

- **Found during:** Fase GREEN (1 teste falhando após 6 passarem)
- **Issue:** O mock de `next/link` aceitava apenas `href` e `children`, descartando props extras. O Radix Slot propaga `aria-label` do `<Button asChild>` para o `<Link>`, mas o mock perdia esse atributo — impossibilitando `getByRole("link", { name: /editar vaga/i })`
- **Fix:** Mock atualizado para aceitar `...rest` e spread no `<a>` renderizado
- **Files modified:** `src/components/vacancy/vacancy-list.test.tsx`
- **Commit:** `2b2e6ca` (incluído no commit GREEN)

## Known Stubs

Nenhum — botão Download está devidamente conectado à rota `/api/vacancies/[id]/form` que retorna o xlsx real.

## Threat Surface

Nenhuma superfície nova além do que está no threat model do plano:

| Flag | Avaliação |
|------|-----------|
| T-09-03-01 (Info Disclosure) | Aceito: rota requer auth; listar IDs em href é OK — página visível apenas pós-login |
| T-09-03-02 (XSS) | Aceito: `vacancy.id` é UUID; `apiPrefix` vem de env validado; sem HTML cru |

## Self-Check

- [x] `src/components/vacancy/vacancy-list.test.tsx` — criado e presente
- [x] `src/components/vacancy/vacancy-list.tsx` — modificado (3 ocorrências de `Download`, botão inserido)
- [x] `src/app/(shell)/vacancies/page.tsx` — modificado (`apiPrefix` calculado e passado)
- [x] Commits `5660f10` (RED) e `2b2e6ca` (GREEN) existem no histórico
- [x] 155 testes passando sem regressões
- [x] typecheck verde

## Self-Check: PASSED

---
*Phase: 09-pequenos-ajustes-p-s-v1-1-1*
*Completed: 2026-04-27*
