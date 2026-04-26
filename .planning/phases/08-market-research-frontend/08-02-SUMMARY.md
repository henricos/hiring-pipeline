---
phase: 08-market-research-frontend
plan: "02"
subsystem: database
tags: [repository-pattern, filesystem, json, server-actions, path-traversal-guard]

# Dependency graph
requires:
  - phase: 08-01
    provides: "Testes RED para ResearchRepository (8 testes Wave 0)"
provides:
  - "Interface ResearchRepository com listByProfileId(), getVagas(), getResumo()"
  - "Classe JsonResearchRepository com path traversal guard e fallback silencioso"
  - "Singleton researchRepository exportado"
  - "Server Actions getResearchesByProfileId(), getVagasForDate(), getResumoForDate()"
affects:
  - 08-03-wave2-components
  - 08-04-wave3-page

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Repository pattern: interface + JsonImpl + singleton (análogo ao ProfileRepository)"
    - "Path traversal guard: rejeitar profileId com '..', '/', '\\' antes de construir path"
    - "Silent fallback: catch retorna [] ou null, nunca lança exceções em métodos de leitura"
    - "Server Actions delegam ao repository sem lógica adicional"

key-files:
  created:
    - src/lib/repositories/research-repository.ts
    - src/app/actions/research.ts
  modified: []

key-decisions:
  - "researchPath() valida profileId antes de chamar ensureSubdir() — ponto único de defesa contra T-08-01"
  - "Regex (?:-\\d+)? captura sufixos opcionais (-2, -3) consolidando múltiplos arquivos do mesmo dia em um único Research"
  - "listByProfileId usa fs.existsSync() antes de readdirSync() para retorno mais direto de [] sem lançar ENOENT"
  - "Server Actions sem try/catch: repository já trata erros silenciosamente — duplicar catch seria ruído"

patterns-established:
  - "ResearchRepository: mesma estrutura do ProfileRepository — futuro swap para DB exige apenas nova implementação da interface"
  - "Agrupamento por data via Map<string, Research>: primeiro arquivo do dia cria entrada; subsequentes atualizam vagasFile/resumoFile"

requirements-completed: [VIZ-01, VIZ-02, VIZ-03]

# Metrics
duration: 8min
completed: 2026-04-26
---

# Phase 08 Plan 02: Market Research Frontend — Camada de Dados Summary

**ResearchRepository com path traversal guard, regex de consolidacao por data e 3 Server Actions delegando ao singleton — 8 testes Wave 0 passando (GREEN)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-26T15:57:00Z
- **Completed:** 2026-04-26T15:58:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `JsonResearchRepository` implementado com padrao exato do `ProfileRepository` — interface, implementacao JSON e singleton
- Path traversal guard em `researchPath()` rejeita profileId com `..`, `/`, `\\` (mitiga T-08-01)
- Regex `^(\d{4}-\d{2}-\d{2})(?:-\d+)?-(vagas|resumo)\.json$` consolida arquivos com sufixo (-2, -3) no mesmo dia em um unico objeto `Research`
- Fallback silencioso: `listByProfileId` retorna `[]` se diretorio nao existe; `getVagas`/`getResumo` retornam `null` em erro (mitiga T-08-02 e T-08-03)
- 3 Server Actions em `research.ts` com `"use server"` — delegacao pura ao repository sem logica adicional
- Todos os 8 testes de Wave 0 passam GREEN

## Task Commits

1. **Task 01: ResearchRepository (interface + JsonResearchRepository)** - `af0b43f` (feat)
2. **Task 02: Server Actions research.ts** - `f28b5f4` (feat)

## Files Created/Modified

- `src/lib/repositories/research-repository.ts` — Interface `Research`, interface `ResearchRepository`, classe `JsonResearchRepository`, singleton `researchRepository`
- `src/app/actions/research.ts` — 3 Server Actions: `getResearchesByProfileId()`, `getVagasForDate()`, `getResumoForDate()`

## Decisions Made

- `researchPath()` valida `profileId` antes de delegar a `ensureSubdir()` — ponto unico e centralizado de defesa contra path traversal
- Regex com grupo opcional `(?:-\d+)?` consolida arquivos com sufixo do mesmo dia; sem esse grupo, "2026-04-24-2-vagas.json" criaria entrada duplicada de data invalida
- `fs.existsSync(dir)` antes de `readdirSync` em `listByProfileId` — mais direto que capturar ENOENT no catch (ambos funcionam; existsSync e semanticamente mais claro)
- Server Actions sem try/catch proprio — repository e a camada que absorve erros; adicionar catch nas actions seria ruido sem beneficio

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

## Issues Encountered

Nenhum — implementacao direta seguindo o padrao do `ProfileRepository`.

## User Setup Required

Nenhum — sem configuracao externa necessaria.

## Known Stubs

Nenhum — ambos os arquivos entregam implementacao funcional completa. Os testes Wave 0 confirmam comportamento correto.

## Threat Flags

Nenhum — ameacas T-08-01, T-08-02 e T-08-03 do threat model foram todas endereçadas conforme planejado.

## Next Phase Readiness

- `researchRepository` singleton pronto para importacao por componentes Wave 2
- `getResearchesByProfileId()`, `getVagasForDate()`, `getResumoForDate()` prontos para uso em `page.tsx` Wave 3
- Nenhum bloqueador identificado

---

## Self-Check

- [x] `src/lib/repositories/research-repository.ts` existe
- [x] `src/app/actions/research.ts` existe
- [x] Commit `af0b43f` existe (Task 01)
- [x] Commit `f28b5f4` existe (Task 02)
- [x] 8/8 testes Wave 0 passando GREEN

## Self-Check: PASSED

---
*Phase: 08-market-research-frontend*
*Completed: 2026-04-26*
