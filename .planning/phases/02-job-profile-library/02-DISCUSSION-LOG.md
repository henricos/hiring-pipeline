# Phase 2: Job Profile Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 02-job-profile-library
**Areas discussed:** Estrutura do formulário, Campos de listas, Lista e busca de perfis, Modo visualização/edição

---

## Estrutura do Formulário

| Option | Description | Selected |
|--------|-------------|----------|
| Página única com seções | Todos os campos em uma página longa, separados por cabeçalhos de seção | ✓ |
| Abas (tabs) no topo | Ex: 'Geral / Requisitos / Publicação' | |
| Wizard multi-step | Passo a passo guiado | |

**User's choice:** Página única com seções

| Option | Description | Selected |
|--------|-------------|----------|
| Botão Salvar explícito | Usuário clica 'Salvar' quando terminar | ✓ |
| Auto-save com debounce | Salva automaticamente enquanto edita | |

**User's choice:** Botão Salvar explícito

| Option | Description | Selected |
|--------|-------------|----------|
| Card por seção | Cada seção é um card com background surface-container-low | |
| Divisões por heading | Seções separadas apenas por título e espaçamento | |
| Você decide | Claude escolhe a abordagem mais adequada | ✓ |

**User's choice:** Claude decide — "pode ser card mas precisa ficar claro o que é cada uma"

---

## Campos de Listas / Mapeamento de Campos

Discussão aprofundada sobre os campos do formulário GH (Excel) e da Gupy.

| Option | Description | Selected |
|--------|-------------|----------|
| Tag/chip input | Campo de texto + Enter adiciona chip | |
| Lista com linhas add/remove | Cada item é uma linha com campo + botão remover | |
| Textarea livre por seção | Um textarea por categoria, um item por linha | ✓ |

**User's choice:** Textarea livre por seção (um item por linha para parseabilidade futura)

**Levantamento de campos realizado durante a discussão:**

- Leitura do `templates/requisicao-de-pessoal.xlsx` para mapear todos os campos do formulário GH
- Usuário forneceu os campos da Gupy: Descrição da vaga, Responsabilidades, Requisitos e qualificações (Qualificações/Requisitos/Diferenciais), Informações adicionais
- Alinhamento: Excel tem 4 seções principais de conteúdo (não 5+2 como identificado inicialmente)
- "Comportamentais" e "Competências comportamentais" são um único campo no Excel (erro inicial corrigido)
- "Principais desafios" é um campo separado no Excel sem equivalente na Gupy — campo genérico de contribuição/crescimento
- "Descrição da vaga" (intro Gupy) é responsabilidade do GH — fora do sistema
- Diferenciais ficam no mesmo campo que Requisitos — gestor separa por linguagem natural
- Critérios de avaliação: apenas texto, sem peso numérico

**Dois documentos de referência criados:**
- `.planning/references/excel-form-fields.md`
- `.planning/references/gupy-fields.md`

---

## Lista e Busca de Perfis

| Option | Description | Selected |
|--------|-------------|----------|
| Lista simples | Título + cargo sugerido + data atualização + ações | ✓ |
| Cards em grid | Mais informações visíveis por perfil | |
| Tabela com colunas | Formato tabular ordenável | |

**User's choice:** Lista simples

| Option | Description | Selected |
|--------|-------------|----------|
| Campo de busca no topo | Filtra em tempo real por título | |
| Sem busca por ora | Lista ordenada por última atualização | ✓ |

**User's choice:** Sem busca — entra quando o volume justificar

| Option | Description | Selected |
|--------|-------------|----------|
| Lista é a home | / redireciona direto para /profiles | |
| Home separada, /profiles é seção | Home permanece página própria | ✓ |

**User's choice:** Home separada — /profiles é seção própria no left rail

---

## Modo Visualização/Edição

| Option | Description | Selected |
|--------|-------------|----------|
| Abre direto em modo edição | Vai para /profiles/[id]/edit | ✓ |
| Abre em visualização, editar é ação explícita | Tela read-only + botão Editar | |

**User's choice:** Direto em edição — sem tela read-only separada

| Option | Description | Selected |
|--------|-------------|----------|
| Dialog de confirmação | AlertDialog antes de excluir | ✓ |
| Excluir direto | Clicou, deletou | |

**User's choice:** Dialog de confirmação (AlertDialog do shadcn)

---

## Claude's Discretion

- Delimitação visual das seções do formulário (card vs. heading)
- Estrutura de pastas/arquivos em src/ para componentes de perfil
- Formato do ID do perfil
- Conteúdo da home page (/)

## Deferred Ideas

- Busca/filtro de perfis por título
- Duplicar/clonar perfil existente
- Tela de visualização read-only separada
- Campo "Descrição da vaga" (intro Gupy) no perfil
