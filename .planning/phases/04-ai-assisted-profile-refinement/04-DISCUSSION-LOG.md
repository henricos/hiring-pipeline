# Phase 4: AI-Assisted Profile Refinement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 04-ai-assisted-profile-refinement
**Areas discussed:** Escopo das Skills, Fluxo de Sugestão, Persistência, Contexto P&D/Lyceum, Schema de Campos Descritivos

---

## Escopo das Skills

| Option | Description | Selected |
|--------|-------------|----------|
| Skill única /refinar-perfil | Menu interno com 3 modalidades | ✓ |
| Skills separadas por tarefa | /sugerir-requisitos e /melhorar-descricao independentes | |
| Skill única com flags | /refinar-perfil --requisitos ou --descricao | |

**User's choice:** Skill única `/refinar-perfil`

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lista os perfis existentes | Igual ao padrão abrir-vaga | ✓ |
| Aceita o ID como argumento | /refinar-perfil {id} | |
| Aceita nome parcial como argumento | /refinar-perfil 'Software Engineer' | |

**User's choice:** Lista os perfis existentes (padrão consistente com abrir-vaga)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Oferece menu de modalidades | 1) Sugerir requisitos, 2) Melhorar descrição, 3) Refinar tudo | ✓ |
| Analisa e sugere automaticamente | Sem menu, agente decide o que melhorar | |

**User's choice:** Menu de modalidades (previsível e controlado)

---

## Fluxo de Sugestão

| Option | Description | Selected |
|--------|-------------|----------|
| Antes / Depois por campo | Mostra texto atual vs. sugerido por campo | ✓ |
| Lista de sugestões adicionais | Itens a adicionar/alterar | |
| Texto completo reescrito | Entrega o campo reescrito de uma vez | |

**User's choice:** Antes/Depois por campo

---

| Option | Description | Selected |
|--------|-------------|----------|
| Aceitar / Rejeitar / Pedir ajuste | Fluxo conversacional completo | ✓ |
| Aceitar / Rejeitar apenas | Binário simples | |

**User's choice:** Aceitar / Rejeitar / Pedir ajuste

---

| Option | Description | Selected |
|--------|-------------|----------|
| Adicionais primeiro | Agente sugere itens novos, não substitui | |
| Pode sugerir substituição completa | Agente entrega versão completa, gestor decide | ✓ |

**User's choice:** Pode sugerir substituição completa

---

## Persistência

| Option | Description | Selected |
|--------|-------------|----------|
| Grava direto no JSON do perfil | Atualiza DATA_PATH/profiles/{id}.json ao final | ✓ |
| Gera arquivo de patch separado | {id}-suggestions.md para revisão manual | |

**User's choice:** Grava direto no JSON

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sem backup explícito | Repositório git cobre o histórico | ✓ |
| Backup antes de gravar | Copia {id}.bak antes de sobrescrever | |

**User's choice:** Sem backup (git é o histórico)

---

## Contexto P&D/Lyceum

| Option | Description | Selected |
|--------|-------------|----------|
| Arquivo editável pelo gestor | DATA_PATH/context.md ou settings.json | |
| Embutido no system prompt da skill | Hardcoded no SKILL.md | |
| Campo em settings.json + UI | "Instruções para IA montar perfil" na página de Configurações | ✓ |

**User's choice:** Campo novo em settings.json com UI na página de Configurações
**Notes:** Usuário quer um campo chamado "Instruções para IA montar perfil" — texto livre, como se estivesse instruindo um assistente. Deve aparecer na página /settings da web app.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Aparece na página de Configurações | Textarea na tela /settings existente | ✓ |
| Editável apenas via JSON | Edição manual do DATA_PATH/settings.json | |

**User's choice:** Aparece na página de Configurações (integra na Phase 4)

---

## Schema de Campos Descritivos

| Option | Description | Selected |
|--------|-------------|----------|
| Refatorar para string[] agora | Migração de schema + UI + Excel generator | ✓ |
| Manter texto livre + convenção de bullets | Documentar padrão, sem refatoração estrutural | |

**User's choice:** Refatorar para string[] agora
**Notes:** O planejamento deve **começar** por esta refatoração. Estratégia de dados: zerar a base de desenvolvimento e recriar a partir dos exemplos em `data/examples/` (3 XLSXs reais). Não converter JSONs antigos defasados.

---

## Escopo: abrir-vaga

**Situação identificada durante a discussão:** `/abrir-vaga` foi implementada na Phase 3 (VAG-02) mas nunca foi testada em uso real. Vários campos foram refatorados após a implementação (AreaSettings migration, workSchedule, etc.) e a skill pode estar desatualizada.

**Decisão:** Incluir na Phase 4 como Wave 2: auditar o SKILL.md contra schemas atuais e executar em cenário real — **após** o `/refinar-perfil` estar pronto e validado.

---

## Claude's Discretion

- Componente de lista dinâmica para campos descritivos na UI
- Estrutura do system prompt da /refinar-perfil
- Fluxo de "Refinar tudo" entre IA-01 e IA-02
- Ordem de campos durante sugestão em lote

## Deferred Ideas

- Integração nativa de LLM na web app — IA v2
- /abrir-vaga com IA para sugerir/validar dados — avaliar pós-Phase 4
