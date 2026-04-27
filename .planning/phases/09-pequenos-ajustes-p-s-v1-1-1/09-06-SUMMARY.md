---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: "06"
subsystem: ui-components
tags: [profile-detail-vagas, profile-detail-resumo, multi-pesquisa, switcher, ux-simplificacao, tdd]
dependency_graph:
  requires: [09-05-resumo-bars-and-archetype-fix]
  provides: [ui-read-only-pesquisa-mais-recente, data-sempre-visivel-vagas, data-sempre-visivel-resumo]
  affects: [profile-detail-vagas, profile-detail-resumo, profile-detail-tabs]
tech_stack:
  added: []
  patterns: [ui-read-only, condicional-removida, tdd-green-refactor]
key_files:
  created: []
  modified:
    - src/components/profile/profile-detail-vagas.tsx
    - src/components/profile/profile-detail-vagas.test.tsx
    - src/components/profile/profile-detail-resumo.tsx
    - src/components/profile/profile-detail-tabs.test.tsx
decisions:
  - "D-32: default em ambas as abas = pesquisa mais recente — comportamento mantido"
  - "D-33: data exibida sempre em ambas as abas, incondicionalmente"
  - "D-34: switcher (<select> + selectedDate) removido de profile-detail-vagas.tsx"
  - "D-35: pesquisas históricas continuam no repo separado montado em /data — zero limpeza"
  - "D-37: testes do switcher removidos/atualizados; nenhum teste cobre código removido"
metrics:
  duration_minutes: 12
  completed_date: "2026-04-27"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 4
---

# Phase 09 Plan 06: Simplificação UX Multi-pesquisa — Summary

**One-liner:** Remoção do switcher `<select>` de profile-detail-vagas (D-34), exibição incondicional da data em ambas as abas (D-33), e atualização da suite de testes para refletir a nova UI read-only da pesquisa mais recente (D-37) — 148 testes passando, sem regressões.

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Tornar data sempre visível em profile-detail-resumo.tsx (D-33) | a2c7ef0 | src/components/profile/profile-detail-resumo.tsx |
| 2 | Remover switcher de profile-detail-vagas.tsx — read-only da mais recente (D-32, D-33, D-34) | 38b3062 | src/components/profile/profile-detail-vagas.tsx |
| 3 | Atualizar testes de profile-detail-vagas removendo asserts do switcher (D-37) | f21542a | src/components/profile/profile-detail-vagas.test.tsx, src/components/profile/profile-detail-tabs.test.tsx |

## O Que Foi Feito

### Task 1 — Exibição incondicional da data em profile-detail-resumo.tsx (D-33)

- Removida condicional `researches.length > 1` do bloco `"Resumo de: {date}"`.
- Data agora exibida sempre, independente do número de pesquisas.
- Comentário inline documenta decisão D-33 (Phase 9 / Item 7).
- 10 testes existentes em `profile-detail-resumo.test.tsx` continuam passando.

### Task 2 — Remoção do switcher de profile-detail-vagas.tsx (D-32, D-33, D-34)

- Removidos: `import { useState }`, estado `selectedDate`, prop `defaultExpanded`, bloco `<select>` condicional (linhas 55-76 do original).
- Componente passa a ler diretamente `researches[0]` (mais recente, array já ordenado desc pelo server).
- Header `"Pesquisa de: {mostRecent.date}"` exibido sempre (D-33), substituindo a lógica condicional anterior.
- Empty state preservado (`researches.length === 0`).
- Estado "pesquisa existe mas allVagas[date] está vazio" preservado (`"Nenhuma vaga encontrada para {date}."`)
- Prop `defaultExpanded` removida da interface — não faz mais sentido sem switcher.
- Nenhum caller em `src/` (excluindo testes) passava `defaultExpanded` — confirmado via grep.
- Comentário JSDoc documenta D-32..D-34 e D-35.

### Task 3 — Atualização da suite de testes (D-37)

- Removido `import { fireEvent }` — não mais necessário.
- Removido teste `"selecionar pesquisa diferente via dropdown atualiza lista de vagas (VIZ-03)"` — código coberto foi removido (D-34).
- Removido teste `"renderiza lista de pesquisas em ordem cronologica reversa (D-05, VIZ-01)"` — dependia das datas estarem visíveis via `<select>`; substituído pelo teste "renderiza apenas a pesquisa mais recente" que verifica a AUSÊNCIA de vagas antigas e a AUSÊNCIA do combobox (proteção de regressão oposta — T-09-06-03 mitigado).
- Adicionado teste `"exibe a data da pesquisa sempre, mesmo com 1 unica pesquisa (D-33)"`.
- Removido `defaultExpanded` das chamadas de render nos testes.
- **Auto-fix (Regra 1):** `profile-detail-tabs.test.tsx` tinha asserção `getByText("2026-04-24")` que dependia da data aparecer como opção do `<select>`. Com a nova UI, a data aparece em `"Pesquisa de: 2026-04-24"`. Asserção atualizada para `/Pesquisa de:\s*2026-04-24/i`.

## Critérios de Sucesso

- [x] Data sempre visível na aba Resumo de Mercado (D-33).
- [x] Switcher (`<select>`) removido da aba Vagas do Mercado (D-34).
- [x] UI da aba Vagas é read-only da pesquisa mais recente (D-32).
- [x] Testes atualizados — nenhum teste cobre código removido; novos testes protegem D-32/D-33/D-34 (D-37).
- [x] Nenhuma alteração em `data/research/` (D-35).
- [x] 148/148 testes passando (sem regressões).
- [x] `npm run typecheck` verde (0 erros).

## Deviations from Plan

### Auto-fixed Issues

**1. [Regra 1 - Bug] Teste em profile-detail-tabs.test.tsx dependia do `<select>` removido**

- **Encontrado durante:** Task 3
- **Problema:** `profile-detail-tabs.test.tsx` linha 46 usava `getByText("2026-04-24")` esperando a data como texto standalone — originalmente vinha da opção `<option>` do `<select>`. Após remoção do switcher, a data aparece apenas dentro de `"Pesquisa de: 2026-04-24"`, causando falha do teste.
- **Correção:** Asserção atualizada para regex `/Pesquisa de:\s*2026-04-24/i` — alinhada ao novo padrão visual.
- **Arquivos modificados:** `src/components/profile/profile-detail-tabs.test.tsx`
- **Commit:** f21542a (incluído junto à Task 3)

## Known Stubs

Nenhum — implementação completa. Todos os dados renderizados vêm diretamente de `researches[0]` e `allVagas[mostRecent.date]`.

## Threat Flags

Nenhum. As strings renderizadas (`title`, `company`, `snippet`, `stack[]`, `date`) passam pelo escape automático do React (sem `dangerouslySetInnerHTML`). A remoção do switcher reduz superfície de estado mutável no lado cliente (T-09-06-02: pesquisas históricas continuam no filesystem mas não são mais expostas via UI — aceito por D-35). T-09-06-03 mitigado: novo teste afirma `queryByRole("combobox") === null`, protegendo regressão na direção oposta.

## Self-Check: PASSED

- [x] `src/components/profile/profile-detail-resumo.tsx` — modificado, commit a2c7ef0 confirmado.
- [x] `src/components/profile/profile-detail-vagas.tsx` — modificado, commit 38b3062 confirmado.
- [x] `src/components/profile/profile-detail-vagas.test.tsx` — modificado, commit f21542a confirmado.
- [x] `src/components/profile/profile-detail-tabs.test.tsx` — modificado, commit f21542a confirmado.
- [x] `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-06-SUMMARY.md` — criado.
- [x] 148/148 testes passando.
