---
phase: 04-ai-assisted-profile-refinement
plan: "05"
subsystem: skills
tags: [cli-skill, ai, profile-refinement, vacancy, settings]

requires:
  - phase: 04-04
    provides: 3 perfis reais com schema string[], settings.json com aiProfileInstructions, base dev zerada
  - phase: 04-03
    provides: AreaSettings com aiProfileInstructions, schema GAP-12 consolidado

provides:
  - Skill /refinar-perfil com fluxo completo de 6 steps (Steps 1-6)
  - 3 modalidades: sugerir requisitos (IA-01), melhorar descrições (IA-02), refinar tudo (IA-03)
  - Ciclo Aceitar/Rejeitar/Ajustar por campo (antes/depois)
  - Skill /abrir-vaga revisada — campos AreaSettings removidos do Step 3 e JSON Step 5, adicionados ao Step 4

affects: [fase-05-candidate-shortlist, skills/refinar-perfil, skills/abrir-vaga]

tech-stack:
  added: []
  patterns:
    - "Skill CLI: frontmatter YAML + fluxo em markdown com Steps numerados"
    - "Gravação de JSON via node -e (não heredoc) para evitar problemas de escape"
    - "Segurança de path traversal: IDs somente da lista do ls, nunca de input livre"
    - "Contexto de IA via aiProfileInstructions injetado como system prompt"

key-files:
  created:
    - .agents/skills/refinar-perfil/SKILL.md
  modified:
    - .agents/skills/abrir-vaga/SKILL.md

key-decisions:
  - "node -e para gravação de JSON — heredoc tem problemas com aspas simples/duplas em conteúdo (D-12)"
  - "IDs de perfil somente da lista do ls — nunca aceitar UUID digitado pelo gestor (T-04-W2-01)"
  - "campos AreaSettings (costCenter, workSchedule, workMode, travelRequired) removidos do Step 3 e JSON de /abrir-vaga; pré-carregados no Step 4 (D-18)"
  - "aiProfileInstructions injetado como system context antes de qualquer sugestão da IA (D-16)"

patterns-established:
  - "Skill com menu de modalidades: menu numérico → ramificação de campos processados"
  - "Fluxo antes/depois por campo: exibir ANTES → gerar sugestão → exibir DEPOIS → Aceitar/Rejeitar/Ajustar"

requirements-completed: [IA-01, IA-02, IA-03]

duration: 10min
completed: 2026-04-21
---

# Phase 4 Plan 05: Skill /refinar-perfil + revisão /abrir-vaga

**Skill /refinar-perfil criada com fluxo conversacional de 6 steps, 3 modalidades de IA e ciclo antes/depois por campo; /abrir-vaga auditada e corrigida contra schemas pós-GAP-12.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-04-21T20:48:00Z
- **Tasks:** 2/2 (Task 3 é checkpoint manual — aguarda validação do operador)
- **Files modified:** 2

## Accomplishments

### Task 1 — Skill /refinar-perfil criada

Novo arquivo `.agents/skills/refinar-perfil/SKILL.md` com fluxo completo:

- **Step 1:** lista perfis via `ls $DATA_PATH/profiles/` e exibe numerados para seleção
- **Step 2:** carrega JSON do perfil + settings.json; exibe resumo com `aiProfileInstructions`
- **Step 3:** menu de 3 modalidades (sugerir requisitos, melhorar descrições, refinar tudo)
- **Step 4:** ciclo antes/depois por campo com Aceitar / Rejeitar / Ajustar iterativo
- **Step 5:** confirma resumo de alterações + grava via `node -e` (não heredoc)
- **Step 6:** confirma conclusão com próximas ações

Segurança implementada: IDs somente da lista do `ls` — nunca de input livre do gestor (T-04-W2-01).

### Task 2 — /abrir-vaga revisada contra schemas pós-GAP-12 (D-18)

Arquivo `.agents/skills/abrir-vaga/SKILL.md` corrigido:

- **Step 3:** removidos campos interativos de `costCenter`, `workSchedule`, `workMode`, `travelRequired`
- **Step 4:** adicionados os 4 campos como pré-carregados via `settings.json`
- **Step 5:** template JSON da vaga sem os 4 campos de AreaSettings (alinhado com `src/lib/vacancy.ts`)
- **Notes:** nova nota explicando migração GAP-12
- **Rodapé:** Updated marcado com data e referência D-18

## Commits

| Hash | Descrição |
|------|-----------|
| efa8705 | feat(04-05): criar skill /refinar-perfil com fluxo completo de 6 steps |
| 1b63a4c | feat(04-05): revisar /abrir-vaga contra schemas pós-GAP-12 (D-18) |

## Deviations from Plan

None - plano executado exatamente como escrito.

## Known Stubs

None — skills são documentação de fluxo (markdown). Nenhum dado hardcoded ou placeholder de renderização.

## Threat Flags

Nenhuma nova superfície de segurança introduzida além das documentadas no threat model do plano (T-04-W2-01 a T-04-W2-05).

## Checkpoint Pendente

**Task 3** é checkpoint `human-verify` — requer validação manual do operador:
- Executar `/refinar-perfil` em sessão real e confirmar fluxo antes/depois + gravação JSON
- Executar `/abrir-vaga` e confirmar que Step 3 não coleta costCenter/workSchedule/workMode/travelRequired

Ver instruções completas em `04-05-PLAN.md` Task 3.

## Self-Check: PASSED

- `.agents/skills/refinar-perfil/SKILL.md` — FOUND
- `.agents/skills/abrir-vaga/SKILL.md` — FOUND (modificado)
- Commit efa8705 — FOUND
- Commit 1b63a4c — FOUND
