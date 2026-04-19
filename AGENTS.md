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

## Workflow de desenvolvimento

Este projeto opera com um workflow determinado chamado **GSD (Get Shit Done)**. Skills do GSD estão instaladas e definem como o trabalho é planejado e executado. Antes de implementar qualquer feature, verifique se existe fase correspondente no roadmap. Se não existir, sinalize ao operador antes de prosseguir.

## Nomenclatura de arquivos

Todos os arquivos e pastas do projeto seguem `kebab-case`.

Correto: `job-profile.ts`, `vacancy-form.tsx`, `data-layer.ts`
Incorreto: `jobProfile.ts`, `VacancyForm.tsx`, `data_layer.ts`

## Commits

**Nunca faça commits automáticos.** Sempre que precisar commitar, use a skill de commit instalada no projeto e aguarde autorização explícita do operador antes de executar. Isso se aplica a qualquer agente e em qualquer situação, inclusive durante fluxos do GSD.

## Versionamento

Ao criar ou atualizar artefatos de planning, respeite a convenção de versionamento: milestones usam `vMAJOR.MINOR` e a versão da aplicação usa SemVer completo `MAJOR.MINOR.PATCH`.

O fluxo operacional de release está documentado na skill `/fechar-versao`.
