# Phase 6: Guided Profile Creation Skill - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 06-guided-profile-creation-skill
**Areas discussed:** Fonte dos valores-base, Normalização do título, Escopo da análise de força, Preview antes de confirmar

---

## Fonte dos valores-base

| Option | Description | Selected |
|--------|-------------|----------|
| LLM + roles-map + aiProfileInstructions | IA gera conteúdo usando título + contexto P&D + faixas do roles-map. Rápido, sem portais externos. | |
| Busca de mercado ao vivo | Roda /pesquisar-mercado internamente. Mais rico, mas lento e duplica Phase 7. | |
| Template fixo por nível | Templates pré-definidos por senioridade. Previsível mas genérico. | |
| Placeholder simples uniforme | Todos os campos descritivos recebem um placeholder. Zero LLM. Criação em segundos. | ✓ |

**User's choice:** Placeholder simples uniforme — criação rápida porque o fluxo real é `/pesquisar-mercado` + `/refinar-perfil` em seguida. Campos descritivos com texto indicando que ainda não foram preenchidos.

**Notes:** Usuário sinalizou que vê `/criar-perfil` como step de entrada rápido, não como gerador de conteúdo. O valor está no título validado + ID do perfil criado.

---

## Normalização do título

| Option | Description | Selected |
|--------|-------------|----------|
| Propor título normalizado para confirmação | Skill sugere título de mercado normalizado e aguarda confirmação antes de criar. | ✓ |
| Usar o título como digitado | Sem normalização — perfil criado com o texto exato do input. | |

**User's choice:** Propor título normalizado para confirmação.

**Follow-up — nível de senioridade:**

| Option | Description | Selected |
|--------|-------------|----------|
| Inferir do título e exibir junto | Nível detectado automaticamente, exibido na mesma tela do título para confirmação conjunta. | ✓ |
| Perguntar o nível separadamente | Step separado para confirmar o nível após o título. | |

**Notes:** Título normalizado + nível inferido exibidos juntos numa única tela de confirmação. Menos fricção.

---

## Escopo da análise de força

| Option | Description | Selected |
|--------|-------------|----------|
| Score + roles-map + WebSearch rápida | *(opção descartada após esclarecimento — roles-map será descontinuado na Phase 7)* | |
| WebSearch rápida + classificação | 1-2 queries WebSearch para estimar demanda; IA classifica forte/médio/fraco/nicho; sugere alternativas se fraco. ~30s. | ✓ |
| LLM puro (sem busca) | Avaliação baseada em conhecimento de treinamento. Instantâneo, sem portais. | |
| Análise rica completa | Similar a /pesquisar-mercado enxuto. 5-15 min. | |

**Notes:** Usuário não reconhecia a referência ao `roles-map.json`. Após esclarecimento de que ele será descontinuado na Phase 7, optou por WebSearch rápida como única fonte de sinal de mercado para esta phase.

---

## Preview antes de confirmar

| Option | Description | Selected |
|--------|-------------|----------|
| Título + nível + análise de força | Preview enxuto: título normalizado + nível + classificação de força + alternativas (se fraco). Campos placeholder não exibidos. | ✓ |
| Preview completo dos campos | Exibe todos os campos incluindo placeholders. Redundante dado que o gestor já sabe que estarão em branco. | |

**User's choice:** Preview enxuto — título + nível + análise de força.

---

## Claude's Discretion

- Wording exato do texto placeholder nos campos descritivos
- Número e texto das queries WebSearch para análise de força
- Formato visual da tela de confirmação
- Thresholds de contagem de vagas para classificar forte/médio/fraco/nicho

## Deferred Ideas

- Integração direta com `/pesquisar-mercado` no mesmo fluxo (future phase)
- Análise de força com faixas salariais via `-resumo.json` por perfil (após Phase 7)
