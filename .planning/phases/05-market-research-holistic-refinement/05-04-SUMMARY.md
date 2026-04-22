---
phase: 05-market-research-holistic-refinement
plan: "04"
subsystem: skills/refinar-perfil
tags: [skill, ai, market-research, holistic-review, refinar-perfil]
dependency_graph:
  requires:
    - "05-03 (skill /pesquisar-mercado — output -resumo.json consumido pelo Step 2)"
  provides:
    - "/refinar-perfil evoluída com Step 2 de pesquisa, prompts de 3 contextos e Step 5 holístico"
  affects:
    - "05-06 (piloto end-to-end usa a skill evoluída)"
tech_stack:
  added: []
  patterns:
    - "Três contextos empilhados (aiProfileInstructions + pesquisa + perfil) nos prompts de IA"
    - "Padrão [A]plicar/[I]gnorar/[J]ustar reutilizado no Step 5 holístico"
    - "Hard links entre .agents/skills/, .claude/skills/ e .cursor/skills/ — arquivo físico único"
key_files:
  created: []
  modified:
    - ".agents/skills/refinar-perfil/SKILL.md"
decisions:
  - "Carregar apenas o -resumo.json (não o -vagas.json) — arquivo de vagas é auditoria/histórico"
  - "marketResearch=null mantém fluxo original sem degradação (retrocompatibilidade garantida)"
  - "Step 5 holístico opera sobre perfil pós-ciclo A/R/J em memória — gravação real só no Step 6"
  - "IA usa apenas os 4 campos descritivos do JobProfile ao aplicar sugestões (D-01 imutável)"
metrics:
  duration: "~4 minutos"
  completed: "2026-04-22"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 05 Plan 04: Evolução /refinar-perfil — Pesquisa de Mercado + Step Holístico — Summary

**One-liner:** Skill `/refinar-perfil` evoluída com carregamento opcional de `*-resumo.json` no Step 2, prompts de três contextos empilhados (aiProfileInstructions + pesquisa + perfil) nos Steps 3-4, e novo Step 5 de revisão holística com 4 tipos de incoerência e padrão [A/I/J].

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Evoluir Step 2 — listagem de pesquisas e carregamento do -resumo.json | 5bd2658 | .agents/skills/refinar-perfil/SKILL.md |
| 2 | Inserir Step 5 holístico e renumerar Steps 5→6 e 6→7 | 5bd2658 | .agents/skills/refinar-perfil/SKILL.md |

Nota: As duas tasks foram agrupadas em um único commit pois modificam o mesmo arquivo e o estado final é atômico (o arquivo precisa ter Steps 5-7 consistentes para funcionar).

## O Que Foi Feito

### Task 1: Step 2 Evoluído

O Step 2 ("Carregar Perfil e Contexto de Área") foi renomeado para "Carregar Perfil, Contexto de Área e Pesquisa de Mercado" e ganhou:

- **Listagem de pesquisas disponíveis** via `node -e` que lê `$DATA_PATH/research/*-resumo.json`, ordena por data decrescente e exibe data legível (hoje / ontem / N dias atrás)
- **Seleção por número ou Enter para pular** — retrocompatível: `marketResearch = null` mantém exatamente o fluxo original
- **Carregamento exclusivo do `-resumo.json`** com validação de path traversal via `path.resolve()` — o `-vagas.json` não é carregado (é arquivo de auditoria/histórico)
- **Resumo ampliado** ao final do Step 2 exibe: perfil, contexto de área E pesquisa de mercado carregada (ou "(não carregada)")

Os prompts dos Steps 3-4 foram atualizados para suportar **três contextos empilhados** quando `marketResearch` não é null:
1. System prompt 1 (fixo): `aiProfileInstructions`
2. System prompt 2 (variável): `marketResearch.profileHints` + `summary.trends`
3. System prompt 3: perfil atual sendo refinado
4. Instrução de priorização com guardrail: expressar riqueza do mercado dentro dos 4 campos do JobProfile — nunca inventar campos novos (D-01)

### Task 2: Step 5 Holístico + Renumeração

Novo **Step 5: Revisão Holística** inserido entre o ciclo A/R/J (Step 4) e a gravação (antigo Step 5, agora Step 6):

**4 tipos de incoerência detectados:**
1. **Lacuna R×Q** — responsabilidade cita habilidade/área sem qualificação correspondente
2. **Redundância** — mesmo ponto em responsibilities + qualifications ou behaviors + challenges
3. **Descalibração** — title/experienceLevel desalinhado com nível de complexidade das responsabilidades
4. **Lacuna comportamental** — responsabilidades de liderança/mentoria sem behavior correspondente

**Fluxo por finding:** lista numerada → [A]plicar / [I]gnorar / [J]ustar — mesmo padrão familiar do Step 4. Sem limite de findings. Resumo ao final: "Findings aplicados: N | Ignorados: M | Ajustados: P".

**Renumeração:**
- Step 5 "Confirmar e Gravar" → Step 6 (conteúdo preservado integralmente)
- Step 6 "Confirmar Conclusão" → Step 7 (conteúdo preservado integralmente)

**Notes for Agent** atualizado com:
- Documentação do carregamento exclusivo do -resumo.json
- Comportamento de fallback quando pesquisa não selecionada
- Priorização da pesquisa nos prompts quando presente (com guardrail D-01)
- Step 5 opera sobre perfil pós-A/R/J em memória; gravação real no Step 6
- Padrão [A/I/J] reutilizado (gestor já familiarizado)

**Troubleshooting** ganhou entrada: "IA lista findings irrelevantes na holística" → usar [I]; considerar ajustar aiProfileInstructions.

## Verificação de Critérios

| Critério | Status |
|----------|--------|
| `grep -c "### Step" SKILL.md` = 7 | PASS (7) |
| `grep "### Step 5: Revisão Holística"` retorna match | PASS |
| `grep "### Step 6: Confirmar e Gravar"` retorna match | PASS |
| `grep "### Step 7: Confirmar Conclusão"` retorna match | PASS |
| `grep -c "resumo.json"` >= 2 | PASS (9) |
| `grep -c "dias atrás"` >= 1 | PASS (2) |
| `grep -c "marketResearch"` >= 3 | PASS (9) |
| `grep -c "System prompt\|contextos empilhados"` >= 1 | PASS (11) |
| 4 tipos de incoerência (`Lacuna R×Q\|Redundância\|Descalibração\|Lacunas comportamentais`) >= 3 | PASS (6) |
| `grep -c "\[A\]plicar\|Aplicar sugestão"` >= 2 | PASS (2) |
| `.claude/` e `.cursor/` NÃO modificados | PASS (mesmo inode — hard links) |
| Retrocompatibilidade: marketResearch=null mantém fluxo original | PASS (documentado) |

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

As duas tasks foram consolidadas em um único commit (vs. dois commits separados) porque o arquivo precisava do estado final consistente com 7 steps. Isso não é desvio — é boa prática para commits atômicos.

## Known Stubs

Nenhum. A skill é um documento de instrução (SKILL.md) — não há stubs de código ou dados hardcoded. Os valores `{selectedFile}`, `{title}`, `{N}` etc. são placeholders de template de prompt, não stubs de implementação.

## Threat Flags

Nenhuma superfície nova além do documentado no `<threat_model>` do plano:

- T-05-04-01 (Tampering — profileHints no prompt): mitigado via instrução no Notes for Agent — IA usa apenas os 4 campos do JobProfile ao aplicar sugestões do holístico; nunca inventa campos novos
- T-05-04-02 (Information Disclosure — ls research/): aceito — conteúdo do resumo é de vagas públicas, sem PII de candidatos
- T-05-04-03 (Tampering — [A]plicar no Step 5): aceito — gravação real apenas no Step 6, após confirmação explícita do gestor

## Self-Check: PASSED

- `.agents/skills/refinar-perfil/SKILL.md` existe e foi modificado: CONFIRMADO
- Commit 5bd2658 existe: CONFIRMADO (`git log --oneline -1` = `5bd2658 feat(05-04): evoluir /refinar-perfil...`)
- `.claude/skills/refinar-perfil/SKILL.md` e `.cursor/skills/refinar-perfil/SKILL.md` NÃO foram modificados separadamente (mesmo inode 3572717): CONFIRMADO
- 7 Steps no arquivo final: CONFIRMADO
