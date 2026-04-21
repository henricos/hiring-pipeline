# Phase 4: AI-Assisted Profile Refinement - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Dois entregáveis principais, em ordem:

1. **Refatoração de schema:** Os campos descritivos do perfil (`responsibilities`, `qualifications`, `behaviors`, `challenges`) migram de `string` para `string[]`. Inclui migração de dados existentes (ou zeragem da base via `data/examples`), atualização do schema TypeScript, UI e Excel generator.

2. **Skill `/refinar-perfil`:** CLI skill de IA que abre um perfil existente, oferece menu de modalidades (sugerir requisitos/habilidades, melhorar descrição, refinar tudo) e conduz sessão conversacional de sugestão com antes/depois por campo. Grava o JSON atualizado em `DATA_PATH/profiles/` ao final.

3. **Revisão de `/abrir-vaga`:** Auditar e atualizar a skill existente (Phase 3) contra os schemas e campos atuais — a skill foi escrita antes das refatorações de campos da Phase 3 (AreaSettings migration, workSchedule, etc.). Validar em cenário real.

**Em escopo:** refatoração de string→array nos 4 campos descritivos, zeragem/migração de dados de desenvolvimento, `/refinar-perfil` (IA-01, IA-02, IA-03), campo "Instruções para IA" em settings (web app + JSON), revisão da `/abrir-vaga`.

**Fora de escopo:** integração nativa de LLM na web app (IA v2), sugestões automáticas em tempo real no formulário, shortlist de candidatos.

</domain>

<decisions>
## Implementation Decisions

### Wave 0 — Refatoração de Schema

- **D-01:** Os campos `responsibilities`, `qualifications`, `behaviors`, `challenges` em `JobProfile` migram de `string` para `string[]`. Cada linha de texto (bullet) vira um item do array.
- **D-02:** Estratégia de dados: **zerar a base de desenvolvimento** (remover profiles/, vacancies/, settings.json existentes) e recriar a partir dos arquivos em `data/examples/` (3 XLSXs de exemplo reais: cientista-dados, dev-frontend-pleno, dev-java-pleno). Não converter JSONs antigos.
- **D-03:** O planejamento deve **começar por esta refatoração** antes de implementar qualquer skill de IA. A `/refinar-perfil` pressupõe campos como arrays.
- **D-04:** A UI dos campos descritivos muda de `<Textarea>` para um componente de lista dinâmica (inputs por item com adicionar/remover). Claude decide a implementação do componente seguindo padrões shadcn/ui existentes.
- **D-05:** O Excel generator (excel-generator.ts) precisa ser atualizado para serializar `string[]` → texto com bullets ao preencher as células do template. Formato: `- item1\n- item2\n...`

### Escopo das Skills

- **D-06:** Skill única `/refinar-perfil` — um comando com menu interno de modalidades. Não há skills separadas por tarefa.
- **D-07:** Seleção de perfil: agente lista os perfis disponíveis e o gestor escolhe (igual ao padrão da `/abrir-vaga`).
- **D-08:** Após selecionar o perfil, o agente oferece menu de modalidades:
  1. Sugerir requisitos/habilidades (IA-01)
  2. Melhorar descrição/textareas (IA-02)
  3. Refinar tudo (IA-01 + IA-02 em sequência)

### Fluxo de Sugestão e Aceitação

- **D-09:** Apresentação: **antes/depois por campo** — o agente exibe o conteúdo atual vs. o conteúdo sugerido para cada campo relevante, um de cada vez.
- **D-10:** Por campo, o gestor tem 3 opções: **Aceitar** (substitui pelo sugerido) / **Rejeitar** (mantém o original) / **Pedir ajuste** (descreve em linguagem natural o que quer diferente — agente itera e apresenta nova versão).
- **D-11:** Em "Sugerir requisitos/habilidades" (IA-01): o agente pode sugerir substituição completa do campo (não apenas adições). O gestor decide aceitar ou rejeitar.
- **D-12:** Após todas as sugestões serem resolvidas, o agente grava o JSON atualizado diretamente em `DATA_PATH/profiles/{id}.json`. Sem arquivo de patch separado.
- **D-13:** Sem backup explícito — o repositório de dados é git, o histórico de versões está disponível via `git log`.

### Contexto P&D/Lyceum para IA

- **D-14:** Campo novo em `settings.json` (e na página web de Configurações): **"Instruções para IA montar perfil"** — textarea onde o gestor escreve instruções diretas para a IA, como se estivesse instruindo um assistente: contexto da área, produtos, linguagem preferida, o que priorizar em candidatos, jargões internos, etc.
- **D-15:** Este campo aparece na página `/settings` existente da web app como novo textarea (Phase 4 inclui este update de UI).
- **D-16:** A skill `/refinar-perfil` lê `DATA_PATH/settings.json` antes de gerar sugestões e injeta o conteúdo do campo como contexto no prompt da IA.

### Revisão da `/abrir-vaga`

- **D-17:** A skill `/abrir-vaga` (implementada na Phase 3) deve ser revisada e validada na Phase 4, **após** o `/refinar-perfil` estar funcionando.
- **D-18:** Escopo da revisão: auditar o SKILL.md contra os schemas TypeScript atuais de `Vacancy` e `AreaSettings` (campos migrados para AreaSettings na Phase 3, novo campo `workSchedule`, etc.). Corrigir discrepâncias. Executar em cenário real com pelo menos uma vaga completa.

### Claude's Discretion

- Componente de lista dinâmica para os campos descritivos na UI — implementar usando padrões shadcn/ui existentes.
- Estrutura do system prompt da `/refinar-perfil` — como injetar o contexto P&D e o perfil atual.
- Fluxo exato de como "/refinar tudo" sequencia entre IA-01 e IA-02.
- Ordem de apresentação dos campos quando o agente refina vários de uma vez.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema e Dados

- `src/lib/profile.ts` — Schema atual de `JobProfile`. Campos a migrar: `responsibilities`, `qualifications`, `behaviors`, `challenges` (string → string[]).
- `src/lib/vacancy.ts` — Schema de `Vacancy` — referência para a revisão do `/abrir-vaga`.
- `src/lib/settings.ts` — Schema de `AreaSettings` — referência para adicionar campo `aiProfileInstructions: string`.
- `src/lib/repositories/profile-repository.ts` — Padrão de repositório JSON a seguir.
- `src/lib/excel-generator.ts` — Gerador de Excel a atualizar para serializar string[] → bullets.

### Skills Existentes

- `.agents/skills/abrir-vaga/SKILL.md` — Skill existente a revisar na Wave 2. Referência de padrão para a nova `/refinar-perfil`.

### Dados de Exemplo

- `data/examples/cientista-dados.xlsx` — Exemplo real para criar perfil de cientista de dados.
- `data/examples/dev-frontend-pleno.xlsx` — Exemplo real para criar perfil de dev frontend pleno.
- `data/examples/dev-java-pleno.xlsx` — Exemplo real para criar perfil de dev Java pleno.

### Design System e Padrões

- `DESIGN.md` — Especificação visual (No-Line Rule, surface hierarchy, 8px grid).
- `.planning/phases/03-vacancy-gh-form/03-CONTEXT.md` — Padrões e decisões da Phase 3.
- `.planning/phases/02-job-profile-library/02-CONTEXT.md` — Padrões de formulário e lista estabelecidos na Phase 2.

### Requirements

- `.planning/REQUIREMENTS.md` — IA-01, IA-02, IA-03.
- `.planning/PROJECT.md` — Constraint: IA v1 via CLI externo; IA v2 = Agent SDK (próxima onda).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/lib/repositories/profile-repository.ts` — CRUD JSON para profiles. A refatoração de schema impacta `save()` e `findById()`.
- `src/lib/settings.ts` + `src/lib/repositories/settings-repository.ts` — Adicionar `aiProfileInstructions` aqui.
- `src/components/ui/` — Componentes shadcn disponíveis. Novo componente de lista dinâmica para campos descritivos deve seguir os padrões instalados.
- `.agents/skills/abrir-vaga/SKILL.md` — Padrão de skill conversacional: lê DATA_PATH, lista opções, coleta dados, grava JSON. `/refinar-perfil` segue o mesmo padrão.

### Established Patterns

- **Skills CLI:** Frontmatter YAML (name, description, command) + fluxo de execução em markdown. Persistência em `DATA_PATH/`.
- **Server Actions:** criar/editar via server actions (src/app/actions/).
- **No-Line Rule:** separação por tonalidade de superfície.
- **Kebab-case:** todos os arquivos e pastas.
- **Formulário em página única:** seções com delimitação visual, sem abas.

### Integration Points

- `src/lib/profile.ts` — Migrar `string` → `string[]` nos 4 campos descritivos.
- `src/lib/settings.ts` — Adicionar campo `aiProfileInstructions?: string`.
- `src/app/(shell)/settings/` — Adicionar textarea "Instruções para IA" na página de Configurações.
- `src/lib/excel-generator.ts` — Serializar `string[]` → `"- item1\n- item2\n..."` nos campos afetados.
- `src/app/(shell)/profiles/` — Atualizar formulário de perfil (ProfileForm) para lista dinâmica nos 4 campos.
- `.agents/skills/refinar-perfil/SKILL.md` — Novo arquivo a criar.

</code_context>

<specifics>
## Specific Ideas

- O campo "Instruções para IA montar perfil" em settings deve ser uma textarea de texto livre — o gestor escreve como se estivesse instruindo um assistente humano. Sem templates pré-definidos.
- Para recriar a base de desenvolvimento: usar os 3 arquivos XLSX em `data/examples/` para criar os perfis iniciais via `/refinar-perfil` ou preenchimento manual — garante que os dados de dev sejam "reais" e validem o fluxo completo.
- A revisão do `/abrir-vaga` deve incluir execução real com uma vaga do zero — não apenas leitura do código.

</specifics>

<deferred>
## Deferred Ideas

- Integração nativa de LLM na web app (sugestões em tempo real no formulário) — IA v2, próximo milestone.
- Sugestões automáticas ao criar perfil novo (sem precisar invocar skill) — IA v2.
- `/abrir-vaga` com IA para sugerir/validar dados da vaga durante a entrevista — avaliar pós-validação da Phase 4.

</deferred>

---

*Phase: 04-ai-assisted-profile-refinement*
*Context gathered: 2026-04-21*
