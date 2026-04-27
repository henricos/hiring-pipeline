---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 02
subsystem: api
tags: [xlsx, excel, tmpdir, route-handler, nextjs, nodejs]

# Dependency graph
requires:
  - phase: 03-vacancy-excel
    provides: "Rota GET /api/vacancies/[id]/form e gerador de Excel já existentes"
provides:
  - "Rota GET /api/vacancies/[id]/form reescrita para usar os.tmpdir() com nome único por request"
  - "Cleanup pós-stream via fs.unlinkSync (best-effort)"
  - "Cache de xlsx eliminado (geração incondicional)"
  - "Botão 'Gerar formulário GH' sem ?regen=1"
affects:
  - 09-03-vacancy-list-download-button

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "node:os.tmpdir() para arquivos temporários em vez de DATA_PATH (compatível com containers read-only)"
    - "randomUUID() para nomes únicos por request (sem colisão, sem path traversal)"
    - "Cleanup best-effort com try/catch após readFileSync (arquivo em memória, tmp limpo)"

key-files:
  created:
    - src/__tests__/vacancy-form-route.test.ts
  modified:
    - src/app/api/vacancies/[id]/form/route.ts
    - src/app/(shell)/vacancies/[id]/edit/page.tsx

key-decisions:
  - "os.tmpdir() como destino do xlsx gerado — zero dependência de DATA_PATH gravável (D-05)"
  - "Cache eliminado — generateVacancyForm chamado incondicionalmente a cada request (D-04)"
  - "?regen=1 removido do caller (/vacancies/[id]/edit) — no-op não mais necessário (D-07)"
  - "fs.unlinkSync em try/catch após readFileSync — cleanup best-effort sem bloquear response (D-08)"

patterns-established:
  - "Rota de download: escreve em os.tmpdir(), lê em memória, deleta, retorna Buffer — padrão para novos downloads"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-04-27
---

# Phase 9 Plano 02: Excel tmp storage Summary

**Rota GET /api/vacancies/[id]/form refatorada para escrever xlsx em os.tmpdir() com randomUUID, eliminando dependência de DATA_PATH (read-only em produção) e cache**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-27T15:47:53Z
- **Completed:** 2026-04-27T15:53:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Rota de download do formulário Excel agora funciona em containers com DATA_PATH read-only
- Cache de xlsx eliminado — cada request gera um arquivo novo com nome único (vacancy-{id}-{uuid}.xlsx)
- Cleanup pós-stream implementado: arquivo deletado do /tmp após ser lido em memória
- Botão "Gerar formulário GH" na página de edição atualizado (sem ?regen=1)
- 7 novos testes cobrindo todos os comportamentos da rota (TDD completo: RED → GREEN)

## Task Commits

Cada task foi commitada atomicamente:

1. **TDD RED — Testes para rota form** - `699cc2b` (test)
2. **Task 1: Reescrever rota GET para os.tmpdir()** - `7eb9cd3` (feat)
3. **Task 2: Remover ?regen=1 do botão de edit** - `77afd56` (feat)

_Nota: Task 1 seguiu fluxo TDD — commit RED separado, depois commit GREEN com implementação e testes atualizados._

## Files Created/Modified

- `src/app/api/vacancies/[id]/form/route.ts` — Rota reescrita: os.tmpdir() + randomUUID + geração incondicional + cleanup pós-stream; import ensureSubdir removido
- `src/__tests__/vacancy-form-route.test.ts` — 7 testes TDD cobrindo: sem DATA_PATH, formato do nome, geração incondicional, ?regen=1 ignorado, unlinkSync, status 200, status 401
- `src/app/(shell)/vacancies/[id]/edit/page.tsx` — Link do botão atualizado: `?regen=1` removido

## Decisions Made

- **D-04 aplicado:** Cache eliminado — sem `if (!fs.existsSync(outputPath) || forceRegen)`
- **D-05 aplicado:** `os.tmpdir()` com `randomUUID()` como destino do xlsx — zero hardcode de path
- **D-06 respeitado:** Nenhuma nova env var adicionada; `compose.yaml` e `Dockerfile` não tocados
- **D-07 aplicado:** `?regen=1` removido do único caller; `forceRegen` e `url.searchParams` eliminados
- **D-08 (Claude Discretion):** `fs.unlinkSync` em `try/catch` após `readFileSync` — arquivo já em memória, tmp limpo imediatamente

## Deviations from Plan

Nenhum — plano executado exatamente como especificado.

## Issues Encountered

- `npm run lint` falha com "Invalid project directory provided, no such directory: .../lint" — problema pré-existente no ambiente (Next.js v16 + ESLint v9 sem `eslint.config.js`), não causado por este plano. Typecheck (tsc) e testes (vitest) passam sem problemas.

## User Setup Required

Nenhuma — nenhuma configuração externa necessária.

## Next Phase Readiness

- Plano 09-03 pode prosseguir: botão de download no card da lista de vagas usa a mesma rota `/api/vacancies/{id}/form` agora corrigida (sem `?regen=1`, conforme D-10/D-07)
- 142 testes passando, sem regressões

## Threat Surface

Nenhuma superfície nova detectada além do que está no threat model do plano:

| Flag | Avaliação |
|------|-----------|
| T-09-02-01 (Tampering) | Mitigado: `id` vem do router do Next (sanitizado); usado como prefixo, não como path |
| T-09-02-02 (Info Disclosure) | Mitigado: cleanup imediato com `fs.unlinkSync` após `readFileSync` |
| T-09-02-03 (DoS) | Aceito: sem rate-limit (estado atual do app, single-user, arquivo ~50KB) |
| T-09-02-04 (Path Traversal) | Mitigado: `randomUUID()` + `path.join(os.tmpdir(), ...)` previne `../` |

---
*Phase: 09-pequenos-ajustes-p-s-v1-1-1*
*Completed: 2026-04-27*
