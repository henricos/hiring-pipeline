---
phase: 03-vacancy-gh-form
plan: "04"
subsystem: vacancy-download
tags: [api-route, excel, download, skill, auth]
dependency_graph:
  requires: ["03-01", "03-02", "03-03", "03-05"]
  provides: ["excel-download-route", "abrir-vaga-skill"]
  affects: ["vacancy-edit-page"]
tech_stack:
  added: []
  patterns: ["next-api-route-binary-response", "file-cache-pattern", "asChild-link-button"]
key_files:
  created:
    - src/app/api/vacancies/[id]/form/route.ts
    - .agents/skills/abrir-vaga/SKILL.md
  modified:
    - src/app/(shell)/vacancies/[id]/edit/page.tsx
    - .planning/ROADMAP.md
decisions:
  - "Usado new Response() nativo (não NextResponse) para retornar binários — compatível com Next.js App Router"
  - "Button com asChild + <a> para botões de download — padrão shadcn sem duplicação de elemento DOM"
  - "Cache de Excel em DATA_PATH/forms/{id}-requisicao.xlsx com force regen via ?regen=1"
  - "Skill VAG-02 implementada como CLI externa — sem integração nativa na web app (D-01)"
metrics:
  duration: "~10 min"
  completed: "2026-04-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 2
---

# Phase 03 Plan 04: Route Handler Excel Download + Skill Abrir Vaga — Summary

Route handler GET `/api/vacancies/[id]/form` com auth, cache e geração de Excel via `generateVacancyForm()`, botões de download na página de edição de vaga, e skill conversacional `/abrir-vaga` para abertura de vagas via CLI.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar route handler GET /api/vacancies/[id]/form | 174f543 | src/app/api/vacancies/[id]/form/route.ts |
| 2 | Adicionar botões de download e criar skill /abrir-vaga | 0217f4b | edit/page.tsx, .agents/skills/abrir-vaga/SKILL.md |
| 3 | Marcar Phase 3 como completa no ROADMAP | 2cfdd7f | .planning/ROADMAP.md |

## What Was Built

### Route Handler (`src/app/api/vacancies/[id]/form/route.ts`)

- Autenticação via `auth()` no início — retorna 401 se não autenticado (T-03-12)
- Busca vacancy + settings em paralelo, profile sequencial após confirmar vacancy existe
- Retorna 404 com mensagem genérica se vaga ou perfil não encontrado (T-03-13)
- Cache em `DATA_PATH/forms/{id}-requisicao.xlsx` — evita regeneração desnecessária
- Force regen via query param `?regen=1` (D-09, D-10)
- Resposta binária com `new Response()` nativo e headers `Content-Disposition: attachment`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Página de Edição (`src/app/(shell)/vacancies/[id]/edit/page.tsx`)

- Seção "Formulário GH" adicionada após o formulário principal
- Botão "Gerar formulário GH" → `/api/vacancies/{id}/form` (abre em nova aba)
- Botão "Regenerar" → `/api/vacancies/{id}/form?regen=1` (abre em nova aba)
- Padrão `Button asChild` com `<a>` — compatível com shadcn/radix sem aninhamento inválido

### Skill `/abrir-vaga` (`.agents/skills/abrir-vaga/SKILL.md`)

- Fluxo conversacional em 6 passos: listar perfis → carregar perfil+settings → coletar dados da vaga → pré-preencher com settings → gerar JSON → confirmar
- Coleta todos os campos Group 2 (tipo, quantidade, financeiro, flags booleanas, horário, modalidade, data)
- Pré-preenche Group 3 a partir de `settings.json` (gestor, padrinho, reporte imediato/mediato)
- Salva JSON em `DATA_PATH/vacancies/{uuid}.json` via CLI
- Direciona gestor à web app para visualizar e gerar Excel
- Notas para o agente: tom conversacional, sem integração web (D-01), referências D-02
- Troubleshooting para cenários comuns

### ROADMAP Atualizado

- Phase 3 marcada como `[x] ✓ 2026-04-20` na lista de fases
- 03-04-PLAN.md marcado como concluído
- Tabela de progresso: `5/5 | Complete | 2026-04-20`

## Deviations from Plan

### Auto-adjustments

**1. [Rule 2 - Missing functionality] ROADMAP atualizado com 5/5 plans (não 4 plans)**
- **Found during:** Task 3
- **Issue:** O plan mencionava "4 plans" mas o ROADMAP já tinha 5 plans (03-01 a 03-05). O plan 03-05 foi criado separadamente para o Excel generator.
- **Fix:** Tabela de progresso atualizada para 5/5 refletindo a realidade do projeto. A requirement "Plans: 4 plans" do plan foi interpretada como "todos os plans concluídos" e não como contagem literal.
- **Files modified:** .planning/ROADMAP.md

**2. [Rule 2 - Correctness] Erros TS pré-existentes em profile-list.tsx não corrigidos**
- **Found during:** Task 1 (verificação TypeScript)
- **Issue:** `profile-list.tsx` tem 2 erros TS pré-existentes não relacionados à tarefa
- **Decision:** Fora do escopo desta wave — registrado como item diferido
- **Files modified:** nenhum (out-of-scope)

Nenhuma outra desvio do plano.

## Threat Surface Scan

Ameaças mapeadas no threat model do plano:

| Threat | Status |
|--------|--------|
| T-03-12: Unauthenticated Excel download | Mitigado — `auth()` retorna 401 se não autenticado |
| T-03-13: Error messages leak file paths | Mitigado — mensagens genéricas ao cliente, detalhes no console |
| T-03-14: DoS via repeated regen | Aceito — single-user, controlled environment |
| T-03-15: Skill saves malicious JSON | Aceito — manager runs in own terminal (trusted) |

Nenhuma nova superfície de ataque introduzida além do threat model.

## Known Stubs

Nenhum stub identificado. Todos os campos são conectados a dados reais via repositórios.

## Self-Check

### Files exist:
- [x] `src/app/api/vacancies/[id]/form/route.ts` — criado
- [x] `.agents/skills/abrir-vaga/SKILL.md` — criado
- [x] `src/app/(shell)/vacancies/[id]/edit/page.tsx` — modificado
- [x] `.planning/ROADMAP.md` — modificado

### Commits exist:
- [x] 174f543 — feat(03-04): criar route handler GET /api/vacancies/[id]/form
- [x] 0217f4b — feat(03-04): adicionar botões de download e criar skill /abrir-vaga
- [x] 2cfdd7f — docs(03-04): marcar Phase 3 como completa no ROADMAP

## Self-Check: PASSED
