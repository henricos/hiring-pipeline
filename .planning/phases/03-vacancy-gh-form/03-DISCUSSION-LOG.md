# Phase 3: Vacancy Opening & GH Form Generation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 03-vacancy-gh-form
**Areas discussed:** Fluxo de VAG-02, Campos do formulário de vaga, Geração do Excel (.xlsx), Ciclo de vida + lista de vagas

---

## Fluxo de VAG-02

| Option | Description | Selected |
|--------|-------------|----------|
| Skill externa | Skill do Claude Code que faz perguntas em linguagem natural, grava o JSON. A web app exibe o resultado. | ✓ |
| Campo freeform na web app | Campo de texto livre no formulário web salvo como "notas de abertura". | |
| Ambos separados | Formulário estruturado na web + skill alternativa via CLI usando o mesmo JSON. | |

**User's choice:** Skill externa
**Notes:** Consistente com a constraint de IA v1 via CLI externo.

---

## Skill VAG-02 — Escopo da geração

| Option | Description | Selected |
|--------|-------------|----------|
| Só coleta e grava | Skill grava JSON. Gestor abre a web app para gerar o Excel com um clique. | ✓ |
| Coleta + gera o Excel | Skill faz tudo: coleta, grava JSON e gera o .xlsx diretamente. | |
| Você decide | Sem preferência. | |

**User's choice:** Só coleta e grava
**Notes:** Separação limpa entre preenchimento (CLI) e geração (web app).

---

## Campos do Formulário de Vaga

| Option | Description | Selected |
|--------|-------------|----------|
| Núcleo + dados admin | Obrigatórios: tipo de requisição, quantidade, centro de custo, faixa salarial, modalidade, data prevista. Demais opcionais. | ✓ (adaptado) |
| Todos obrigatórios | Todos os ~20 campos obrigatórios. | |
| Mínimo viável | Apenas perfil + quantidade + centro de custo obrigatórios. | |

**User's choice:** Núcleo + dados administrativos, com uma decisão adicional importante.
**Notes:** O gestor quer um batimento 1-a-1 explícito de todos os campos do formulário GH,
classificando cada um em 3 grupos: (1) dados do perfil, (2) dados específicos da vaga,
(3) dados comuns a todas as vagas. Os dados comuns exigem uma nova página de configurações
("Dados da Área") no left rail — gestor preenche uma vez e é herdado por todas as vagas.
Exemplos de dados comuns: nome do gestor, padrinho, reporte imediato/mediato, composição
da equipe, textos fixos de benefícios/contexto da área.

## Batimento 1-a-1 dos Campos

| Option | Description | Selected |
|--------|-------------|----------|
| Tarefa do planejador | Agente lê excel-form-fields.md e classifica os ~20 campos nos 3 grupos. Gestor revisa no PLAN.md. | ✓ |
| Fazer agora na discussão | Percorrer os campos aqui e classificar cada um ao vivo. | |

**User's choice:** Tarefa do planejador
**Notes:** Mais ágil agora; deixa espaço para ajuste fino na revisão do PLAN.md.

---

## Dados Comuns da Área

| Option | Description | Selected |
|--------|-------------|----------|
| Página de configurações | Item de menu próprio. Gestor preenche uma vez. Salvo em config.json em DATA_PATH. | ✓ |
| Dados comuns embutidos no perfil | Cada perfil carrega seus próprios valores padrão. | |
| Você decide a estrutura | Sem preferência sobre onde armazenar. | |

**User's choice:** Página de configurações
**Notes:** Item de menu "Configurações" ou "Dados da Área" no left rail.

---

## Geração do Excel (.xlsx)

| Option | Description | Selected |
|--------|-------------|----------|
| Preencher template existente | Copiar template vazio e preencher células. Preserva formatação original. | ✓ |
| Gerar do zero | Criar .xlsx programático do zero. | |
| Você decide | Sem preferência. | |

**User's choice:** Preencher template existente
**Notes:** Deve ser feita uma cópia do template vazio para preservar formatação, células
mescladas etc.

## Localização do Template e dos Arquivos Gerados

**User's notes:** O template `requisicao-de-pessoal.xlsx` foi movido para dentro da pasta
`data` por ser dado sensível. Está em `DATA_PATH/templates/`. Os Excels gerados devem ser
salvos em `DATA_PATH/forms/` (criar subpasta automaticamente se não existir, padrão
`ensureSubdir`). O gestor persiste os arquivos no repositório de dados via git.

## Download do Excel

| Option | Description | Selected |
|--------|-------------|----------|
| Botão de download na página da vaga | Botão "Gerar formulário GH" na tela da vaga. Se já gerado, baixa existente; "Regenerar" força recriação. | ✓ |
| Download automático ao criar | Dispara automaticamente ao finalizar o preenchimento. | |
| Link na lista de vagas | Ícone de download direto na lista. | |

**User's choice:** Botão de download na página da vaga
**Notes:** Route handler GET `/api/vacancies/[id]/form`.

---

## Ciclo de Vida da Vaga

| Option | Description | Selected |
|--------|-------------|----------|
| Simples — 3 estados | Aberta → Em andamento → Encerrada. Gestor avança manualmente. | ✓ |
| Detalhado — 5 estados | Rascunho → Aberta → Em triagem → Em entrevista → Encerrada. | |
| Apenas 2 estados | Aberta → Encerrada. | |

**User's choice:** Simples — 3 estados
**Notes:** "Em andamento" indica que a Werecruiter já está buscando candidatos.

---

## Lista de Vagas (VAG-04)

| Option | Description | Selected |
|--------|-------------|----------|
| /vagas com item no left rail | Rota própria. Lista: cargo, perfil de origem, quantidade, status, data. | ✓ |
| Integrada na home / | Home exibe vagas como dashboard principal. | |
| Você decide | Sem preferência. | |

**User's choice:** /vagas com item no left rail
**Notes:** Item "Vagas" no left rail (hoje desabilitado) habilitado nesta fase.

---

## Claude's Discretion

- Nome exato do item de menu de configurações.
- Estrutura de arquivos em `src/` para componentes de vaga e configurações.
- Formato do ID da vaga (UUID v4, seguindo Phase 2).
- Biblioteca Excel específica (xlsx vs. exceljs) — pesquisador avalia.

## Deferred Ideas

- Busca/filtro de vagas por status, cargo ou data.
- Tela de detalhes read-only da vaga.
- Histórico de versões do formulário GH.
- Notificação por email com a Werecruiter.
- Dashboard na home com vagas abertas.
