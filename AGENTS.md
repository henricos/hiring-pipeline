# Instruções para Agentes de IA

Regras obrigatórias para qualquer IA (IDEs como Cursor, CLIs como Claude Code ou Codex CLI, ou qualquer orquestrador) operando neste repositório. Siga sem exceção.

## Leitura de contexto

Antes de iniciar qualquer tarefa de implementação, leia:

1. **`.planning/PROJECT.md`** — visão atual e contexto do produto
2. **`.planning/REQUIREMENTS.md`** — requisitos ativos
3. **`.planning/ROADMAP.md`** — fases e estado de execução

## Idioma

Este repositório adota uma política de idioma híbrida:

- **Estrutura do projeto** (nomes de pastas, arquivos de código, configs, nomes de documentos técnicos): **inglês**
- **Conteúdo escrito** (textos, commits, mensagens ao usuário, comunicação no chat): **português do Brasil (`pt-BR`)**

Exceções admissíveis: jargões tecnológicos globais enraizados que soem artificiais em português, como `frontend`, `pipeline`, `shortlist`, `middleware`, ou trechos de código exatos.

## Estratégia de IA agnóstica

Este repositório adota uma estratégia agnóstica de ferramenta para suportar múltiplas IAs sem duplicar instruções.

**Fontes de verdade editáveis:**
- `AGENTS.md` — regras operacionais comuns a qualquer agente
- `.agents/skills/` — implementações padronizadas dos fluxos operacionais

Arquivos de compatibilidade como `CLAUDE.md` e diretórios de ferramenta são apenas apontamentos para essas fontes de verdade. Nunca edite os apontamentos diretamente.

**Como cada ferramenta carrega as instruções e as skills:**
- **Claude Code** — carrega as regras por meio de `CLAUDE.md`, que inclui `@AGENTS.md`; skills via `.claude/skills/`, que aponta para `.agents/skills/`
- **Cursor** — lê `AGENTS.md` como arquivo nativo de instruções; skills via `.cursor/skills/`, que aponta para `.agents/skills/`
- **Codex CLI / outras ferramentas** — leem `AGENTS.md` diretamente; skills lidas de `.agents/skills/`

## Desenvolvimento guiado por especificação (SDD)

Este projeto usa **GSD** como sistema de operação. Qualquer feature nova começa com discussão e especificação antes do código:

- `/gsd-discuss-phase` — contexto e alinhamento antes de planejar
- `/gsd-plan-phase` — plano atômico em `PLAN.md`
- `/gsd-execute-phase` — execução
- `/gsd-verify-work` — verificação dos entregáveis

Antes de implementar qualquer feature, verifique se existe fase correspondente no roadmap. Se não existir, sinalize ao operador antes de prosseguir.

## Nomenclatura de arquivos

Todos os arquivos e pastas do projeto seguem `kebab-case`.

Correto: `job-profile.ts`, `vacancy-form.tsx`, `data-layer.ts`
Incorreto: `jobProfile.ts`, `VacancyForm.tsx`, `data_layer.ts`

## Commits

**Nunca faça commits automáticos.** Antes de qualquer commit, avise o operador e aguarde aprovação explícita. Use sempre a skill `/commit-push` para criar commits neste repositório — ela aplica o estilo Conventional Commits em `pt-BR` e aguarda aprovação humana.

Isso se aplica a qualquer agente, incluindo fluxos GSD (`/gsd-discuss-phase`, `/gsd-plan-phase`, `/gsd-execute-phase` e similares): mesmo que o workflow instrua a commitar artefatos de planejamento, o agente deve propor o commit e aguardar aprovação, usando `/commit-push`.

## Rastreabilidade

Sem arquivos de log de IA; auditoria exclusivamente via mensagem de commit Git.

## Versionamento

Ao criar ou atualizar artefatos de planning, respeite a convenção de versionamento: milestones usam `vMAJOR.MINOR` e a versão da aplicação usa SemVer completo `MAJOR.MINOR.PATCH`.

O fluxo operacional de release está documentado na skill `/fechar-versao`.
