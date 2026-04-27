---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: "05"
subsystem: ui-components
tags: [profile-detail-resumo, archetypes, stack-frequency, salary, schema-audit, tdd]
dependency_graph:
  requires: []
  provides: [barras-stack-frequencia, fix-archetypes-schema, salary-note-url-render]
  affects: [profile-detail-resumo, profile-detail-tabs]
tech_stack:
  added: []
  patterns: [css-puro-barras-horizontais, conditional-render, schema-canônico, tdd-red-green]
key_files:
  created: []
  modified:
    - src/components/profile/profile-detail-resumo.tsx
    - src/components/profile/profile-detail-resumo.test.tsx
decisions:
  - "D-21: barras horizontais em CSS puro — sem chart library (relative/absolute/overflow-hidden)"
  - "D-22: largura = (count / maxCount) * 100%, mínimo 8% para evitar invisibilidade"
  - "D-23: nome da tech + contagem menções visíveis em cada linha (não substituir texto pela barra)"
  - "D-25: Stack Emergente preservada como lista de strings — sem barra (sem count)"
  - "D-27: tipo Archetype usa campo 'archetype' (não 'name'); percentage? opcional"
  - "D-28: formato 'arquétipo — N menções (P%)' quando count e percentage presentes"
  - "D-30: salaryRange.note renderizado quando presente; sources[].url como <a target=_blank>"
  - "D-31: fixture de teste migrada para schema canônico — sem inventar campos"
metrics:
  duration_minutes: 20
  completed_date: "2026-04-27"
  tasks_completed: 4
  tasks_total: 4
  files_modified: 2
---

# Phase 09 Plan 05: Barras Horizontais, Fix Arquétipos e Auditoria de Schema — Summary

**One-liner:** Barras horizontais CSS puro para Stack Frequência (D-20..D-25), correção do bug `arch.name → arch.archetype` com suporte a `percentage` (D-26..D-29), auditoria e alinhamento de tipos ao schema canônico (D-30), e render condicional de `salaryRange.note` e `salaryGuide.sources[].url` (D-30 render-now) — 10 testes novos, 140 passando, sem regressões.

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1–4 (integrado) | Barras Stack Frequência + fix arquétipos + auditoria schema + render note/url | 2a1714d | src/components/profile/profile-detail-resumo.tsx, src/components/profile/profile-detail-resumo.test.tsx |

> Nota: As 4 tasks foram executadas em um único commit pois todos os changes estão nos mesmos 2 arquivos e foram implementados em conjunto para consistência de tipos e testes.

## O Que Foi Feito

### Task 1 — Fix arquétipos: tipo + renderArchetype + mock de teste (D-26..D-31)

- Tipo `archetypes` atualizado: `Array<{ archetype: string; count?: number; percentage?: number } | string>` — elimina campo `name` inexistente no schema canônico.
- `renderArchetype` reescrita para ler `arch.archetype`. Formatos:
  - Com `count` e `percentage`: `"<archetype> — <count> menções (<percentage>%)"`
  - Com `count` apenas: `"<archetype> — <count> menções"`
  - Só `archetype`: `"<archetype>"`
  - String solta: passthrough.
- Fixture `mockResumoContent.summary.archetypes` migrada de `name:` para `archetype:` com `percentage` adicionado.
- Novo teste cobre D-28: verifica formato `"arquiteto tecnico — 9 menções (50%)"`.

### Task 2 — Barras horizontais CSS puro para Stack Frequência (D-20..D-25)

- `maxStackCount` calculado como `sortedStack[0][1]` (item top-1 já ordenado desc) com `Math.max(1, ...)` anti-divisão-por-zero.
- Bloco `stack-item` redesenhado com `relative/overflow-hidden` + `<div absolute bg-tertiary/20>` para a barra + `<div relative>` sobreposto com nome+contagem visíveis (D-23).
- Largura: `Math.max(8, (count / maxStackCount) * 100)%` — mínimo de 8% para itens com count baixo.
- Stack Emergente preservada como lista simples (D-25 — sem count quantitativo).
- 2 novos testes: "renderiza Stack Frequência como barras horizontais (D-20, D-21)" e "largura da barra é proporcional a count/maxCount (D-22)".

### Task 3 — Auditoria colateral do schema do summary (D-30)

- Interface `ResearchSummaryData`: `salaryRange` atualizado para `{ min: number; max: number; note?: string } | null` (campo `note` presente em dados reais).
- Interface `SalaryGuide`: adicionados `location?: string`, `url?: string`, `percentiles?: string` a cada source — alinhamento com schema canônico. Campos `currency?` e `location?` adicionados ao nível raiz.
- Comentário-cabeçalho acima das interfaces documenta princípio D-31 (mocks nunca inventam campos).
- Comentário inline documenta campos DEFERRED (`percentiles`, `currency`, `location`) vs render-now (`note`, `url`).
- Auditoria sistemática: `commonTitles`, `titleAliases`, `stackFrequency`, `emergingStack`, `salarySource`, `commonBehaviors`, `commonChallenges`, `trends`, `redFlags` — todos OK com schema canônico (tipos iguais).

### Task 4 — Render condicional de salaryRange.note e salaryGuide.sources[].url (D-30 render-now)

- `salaryRange.note`: renderizado como `<li className="text-on-surface/60">` dentro do bloco "Das Vagas", logo após a linha "Faixa: R$ Xk – R$ Yk".
- `sources[i].url`: quando presente, `{source.portal} {source.year}` vira `<a href={url} target="_blank" rel="noopener noreferrer">`. Quando ausente, fallback texto puro preservado (compat com fixtures antigas).
- `target="_blank" + rel="noopener noreferrer"` — segurança padrão para links externos (T-09-05-01 mitigado).
- Fixture atualizada: `salaryRange` com `note`, `salaryGuide.sources[0]` com `url` e `percentiles`, `salaryGuide.sources[1]` sem `url` (cobre fallback texto-puro).
- 2 novos testes: "renderiza salaryRange.note quando presente (D-30)" e "renderiza salaryGuide.sources[i].url como link `<a>` (D-30)".

## Critérios de Sucesso

- [x] `arch.archetype` lido (não `arch.name`) — bug D-26 corrigido.
- [x] Mock de teste alinhado com schema canônico (`archetype`, `percentage`).
- [x] Stack Frequência renderiza como barras horizontais CSS puro.
- [x] Stack Emergente preservada como lista (D-25).
- [x] Sort desc por count preservado (D-24).
- [x] Tipos auditados contra schema canônico (D-30).
- [x] `salaryRange.note` renderizado quando presente (D-30 render-now).
- [x] `salaryGuide.sources[].url` renderizado como `<a target=_blank>` quando presente (D-30 render-now).
- [x] Campos deferred (`percentiles`, `currency`, `location`) permanecem fora do JSX.
- [x] Sem chart library introduzida (D-21).
- [x] `npm run typecheck` verde (0 erros).
- [x] 140 testes passando; 10 testes novos adicionados; sem regressões.

## Deviations from Plan

Nenhum — plano executado exatamente como especificado. Tasks 1–4 integradas em um único commit por conveniência (mesmo par de arquivos, sem ambiguidade de escopo).

**Nota sobre lint:** `npm run lint` falha no worktree com erro pré-existente ("Invalid project directory provided, no such directory: .../lint") — Next.js 16 removeu o subcomando `lint` do CLI. Problema pré-existente confirmado pela SUMMARY do plano 09-04 e pelo fato de ocorrer antes das alterações.

## Known Stubs

Nenhum — implementação completa. Todos os campos render-now estão conectados ao DOM.

## Threat Flags

Nenhum. A superfície nova (`<a href={source.url} target="_blank">`) é de baixo risco: dados vêm da skill `/pesquisar-mercado` controlada pelo agente, sem PII. `rel="noopener noreferrer"` aplicado conforme T-09-05-01 (mitigação de tabnabbing/XSS). Conteúdo renderizado via React (escape automático — sem `dangerouslySetInnerHTML`).

## Self-Check: PASSED

- [x] `src/components/profile/profile-detail-resumo.tsx` — modificado, commit 2a1714d confirmado.
- [x] `src/components/profile/profile-detail-resumo.test.tsx` — modificado, commit 2a1714d confirmado.
- [x] Commit existe: `git log --oneline` confirma 2a1714d na branch `worktree-agent-a17d73c3fdf4ec34c`.
- [x] 140/140 testes passando.
