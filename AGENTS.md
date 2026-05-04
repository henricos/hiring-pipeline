# Instruções para Agentes de IA

Regras obrigatórias para qualquer IA (IDEs como Cursor, CLIs como Claude Code ou Codex CLI, ou qualquer orquestrador) operando neste repositório. Siga sem exceção.

## Leitura de contexto

Antes de iniciar qualquer tarefa de implementação, familiarize-se com o contexto do projeto. Este projeto segue o framework **GSD (Get Shit Done)** — consulte os artefatos de planning gerados pelo GSD para entender a visão, os requisitos ativos e o estado de execução do roadmap.

## Idioma

Este repositório adota uma política de idioma híbrida:

- **Estrutura do projeto** (nomes de pastas, arquivos de código, configs, nomes de documentos técnicos): **inglês**
- **Conteúdo escrito** (textos, commits, mensagens ao usuário, comunicação no chat): **português do Brasil (`pt-BR`)**

A única exceção admissível são jargões tecnológicos globais enraizados que soem puramente artificiais em português, como `build`, `frontend`, `runtime`, `pipeline`, `deploy`, `compose`, `container`, `workflow`, `shortlist`, `screening`, `middleware`, `hiring` ou trechos de código exatos. Referências externas podem ser capturadas no idioma original; metadados, títulos criados pela IA e textos autorais do sistema continuam em `pt-BR`.

## Estratégia de IA agnóstica

Este repositório adota uma estratégia agnóstica de ferramenta para suportar múltiplas IAs sem duplicar instruções.

**Fontes de verdade editáveis:**

- `AGENTS.md` - regras operacionais comuns a qualquer agente.
- `.agents/skills/` - implementações padronizadas dos fluxos operacionais.

Arquivos de compatibilidade como `CLAUDE.md` e diretórios de ferramenta são apenas apontamentos para essas fontes de verdade. Nunca edite os apontamentos diretamente quando a intenção for mudar regras ou skills.

**Como cada ferramenta carrega as instruções e as skills:**

- **Claude Code** - carrega as regras por meio de `CLAUDE.md`, que inclui `@AGENTS.md`; skills via `.claude/skills`, que aponta para `.agents/skills`.
- **Cursor** - lê `AGENTS.md` como arquivo nativo de instruções; skills via `.cursor/skills`, que aponta para `.agents/skills`.
- **Codex CLI / outras ferramentas** - leem `AGENTS.md` diretamente; skills de `.agents/skills`.

## Workflow de desenvolvimento

Este projeto opera com um workflow determinado chamado **GSD (Get Shit Done)**. Skills do GSD estão instaladas e definem como o trabalho é planejado e executado. Antes de implementar qualquer feature, verifique se existe fase correspondente no roadmap. Se não existir, sinalize ao operador antes de prosseguir.

## Nomenclatura de arquivos

Todos os arquivos e pastas do projeto seguem `kebab-case`.

Correto: `job-profile.ts`, `vacancy-form.tsx`, `data-layer.ts`
Incorreto: `jobProfile.ts`, `VacancyForm.tsx`, `data_layer.ts`

## Commits

- Mensagens sempre em **pt-BR**.
- Formato **Conventional Commits**: `tipo: assunto conciso` (assunto até ~72 caracteres).
- Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `chore`.
- A mensagem inteira deve usar **presente do indicativo na terceira pessoa do singular**, descrevendo o que o commit faz: `adiciona`, `corrige`, `atualiza`, `remove`, `refatora`, `documenta`.
- Não use imperativo na mensagem: evite `adicione`, `corrija`, `atualize`, `remova`, `refatore`, `documente`.
- Corpo obrigatório, com um parágrafo curto resumindo o objetivo da mudança e uma lista de bullets descrevendo as mudanças realizadas.
- Antes de executar `commit` ou `commit + push`, apresente a mensagem proposta e aguarde aprovação explícita do operador.
- Use arquivos explícitos no `git add`; não use staging amplo como `git add .`.
- **`git push` exige `dangerouslyDisableSandbox: true` na chamada da ferramenta Bash.** O sandbox padrão bloqueia conexões de rede — o push falhará silenciosamente se você não ativar esse parâmetro. Nunca delegue o push ao operador por falha de sandbox; ajuste o parâmetro e execute você mesmo.

## Versionamento

Ao criar ou atualizar artefatos de planning, respeite a convenção de versionamento: milestones usam `vMAJOR.MINOR` e a versão da aplicação usa SemVer completo `MAJOR.MINOR.PATCH`.

O fluxo operacional de release está documentado na skill `/fechar-versao`.
