# Phase 3: Vacancy Opening & GH Form Generation - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Gestor pode abrir vagas a partir de perfis existentes, complementando com dados específicos
da vaga e dados comuns da área, e gerar o formulário GH (Requisição de Pessoal) em Excel
(.xlsx) pronto para envio ao GH/Werecruiter. O preenchimento via linguagem natural (VAG-02)
é uma skill externa do Claude Code — a web app foca no formulário estruturado, visualização
e download do arquivo gerado.

**Em escopo:** criar vaga a partir de perfil, página de configurações com dados comuns,
batimento 1-a-1 dos campos GH nos 3 grupos (perfil / vaga / comum), gerar .xlsx copiando
o template, download via botão na tela da vaga, lista de vagas em /vagas, ciclo de vida
com 3 estados, skill conversacional externa (VAG-02).

**Fora de escopo:** shortlist de candidatos (v2), integração direta com Gupy, chat nativo
na web app.

</domain>

<decisions>
## Implementation Decisions

### VAG-02 — Agente Conversacional

- **D-01:** VAG-02 é implementado como skill externa do Claude Code — não há interface de
  chat dentro da web app. A skill coleta dados em linguagem natural, grava o JSON da vaga
  e encerra. O gestor abre a web app para visualizar o resultado e gerar o Excel.
- **D-02:** A skill faz apenas coleta + gravação de JSON. A geração do Excel é responsabilidade
  da web app (botão na tela da vaga). Separação limpa entre os dois canais.

### Campos da Vaga — 3 Grupos

- **D-03:** Os ~20 campos do formulário GH são classificados em 3 grupos pelo planejador
  (com base em `excel-form-fields.md`):
  1. **Dados do perfil** — herdados do perfil selecionado (Phase 2): cargo, cargo para anúncio,
     requisitos de candidato, 5 textareas descritivas, infraestrutura, sistemas.
  2. **Dados específicos da vaga** — preenchidos em cada abertura: tipo de requisição,
     quantidade, data da requisição, centro de custo, faixa salarial, vaga confidencial,
     vaga orçada, aumento de quadro (+ nome do substituído se Não), horário, disponibilidade
     para viagens, modalidade, data prevista de contratação, composição da equipe.
  3. **Dados comuns da área** — preenchidos uma vez na página de configurações e reutilizados
     em todas as vagas: nome do gestor (solicitante), nome do padrinho, reporte imediato,
     reporte mediato, e quaisquer textos fixos de contexto da área.
- **D-04:** O batimento 1-a-1 definitivo (qual campo cai em qual grupo) é uma tarefa
  explícita do planejador, que deve ler `excel-form-fields.md` e propor a classificação
  para aprovação do gestor no PLAN.md antes de implementar.

### Dados Comuns (nova seção)

- **D-05:** Uma página de configurações — item de menu "Configurações" ou "Dados da Área"
  no left rail — permite que o gestor preencha uma vez os dados comuns a todas as vagas.
  Salvo em `config.json` (ou equivalente) em DATA_PATH. Herdado automaticamente em toda
  nova vaga.
- **D-06:** Campos candidatos para dados comuns: nome do gestor (solicitante), nome do
  padrinho, reporte imediato, reporte mediato, composição da equipe (texto padrão), e
  qualquer texto de benefícios ou contexto da área que o gestor repete igual em todas as
  vagas. Lista final definida no batimento do planejador.

### Geração do Excel (.xlsx)

- **D-07:** O template `requisicao-de-pessoal.xlsx` está em `DATA_PATH/templates/` (repo
  de dados, não no repo de código). A geração cria uma cópia do template vazio e preenche
  as células mapeadas com os dados da vaga. Preserva formatação, células mescladas e visual
  original do formulário GH.
- **D-08:** O Excel gerado é salvo em `DATA_PATH/forms/` (criar subpasta automaticamente
  se não existir, padrão `ensureSubdir`). Nome do arquivo: algo como
  `{vacancy-id}-requisicao.xlsx`. O gestor persiste os arquivos no repositório de dados.
- **D-09:** Se o gestor solicitar, o arquivo pode ser regerado (sobrescreve o existente).
- **D-10:** O gestor baixa o Excel via botão "Gerar formulário GH" na tela de detalhes/edição
  da vaga. Implementado como route handler GET `/api/vacancies/[id]/form` que serve o arquivo.
  Se já gerado, baixa o existente; botão secundário "Regenerar" força recriação.
- **D-11:** Biblioteca Excel a ser avaliada pelo pesquisador: `xlsx` (SheetJS) ou `exceljs`.
  Critério: capacidade de copiar template existente e escrever em células específicas sem
  quebrar formatação. Pesquisador deve verificar compatibilidade com Next.js 16 + Node.js 22.

### Ciclo de Vida da Vaga

- **D-12:** 3 estados: `Aberta` → `Em andamento` → `Encerrada`. O gestor avança manualmente.
  "Em andamento" indica que a Werecruiter já está buscando candidatos.
- **D-13:** Campos de data: `data_abertura` (automática na criação), `data_prevista_contratacao`
  (campo do formulário GH), `data_encerramento` (preenchida ao encerrar).

### Lista de Vagas (VAG-04)

- **D-14:** Rota `/vagas` com item "Vagas" habilitado no left rail (hoje desabilitado).
- **D-15:** Lista exibe por vaga: cargo (do perfil), perfil de origem, quantidade, status
  (badge), data de abertura. Ordenação: mais recente primeiro.
- **D-16:** Sem busca/filtro por ora — entra quando o volume justificar (mesma decisão dos
  perfis).

### Claude's Discretion

- Nome exato do item de menu de configurações ("Configurações" vs. "Dados da Área" vs.
  outro).
- Estrutura de arquivos em `src/` para os componentes de vaga e configurações.
- Formato do ID da vaga — seguir o padrão de UUID v4 estabelecido na Phase 2.
- Biblioteca Excel específica (xlsx vs. exceljs) — pesquisador avalia e recomenda.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Mapeamento de Campos — Leitura obrigatória antes de criar schema, formulário ou gerar Excel

- `.planning/references/excel-form-fields.md` — Todos os campos do formulário GH agrupados
  por perfil vs. vaga. **O planejador deve usar este arquivo para o batimento 1-a-1 dos
  campos nos 3 grupos (perfil / vaga específica / dados comuns).** Leitura obrigatória.
- `.planning/references/gupy-fields.md` — Campos da Gupy com origem no perfil, para não
  criar campos desnecessários nem deixar lacunas.

### Template Excel

- `DATA_PATH/templates/requisicao-de-pessoal.xlsx` — Template original do formulário GH.
  O gerador copia este arquivo e preenche as células. Caminho em runtime via `env.DATA_PATH`.

### Design System e Padrões Estabelecidos

- `DESIGN.md` — Especificação visual (No-Line Rule, surface hierarchy, 8px grid).
- `.planning/phases/02-job-profile-library/02-CONTEXT.md` — Decisões de formulário, lista,
  UX e padrões de código estabelecidos na Phase 2 que esta fase deve seguir.
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md` — Padrões base do projeto.

### Componentes e Código Existente

- `src/components/shell/left-rail.tsx` — Item "Vagas" desabilitado aguardando esta fase.
  Habilitar e apontar para /vagas. Adicionar "Configurações" como novo item.
- `src/lib/data-service.ts` — `ensureSubdir()` para criar subpastas (`forms/`, etc.)
  automaticamente.
- `src/lib/repositories/profile-repository.ts` — Padrão de repositório JSON a seguir para
  criar `vacancy-repository.ts` e `settings-repository.ts`.

### Requirements

- `.planning/REQUIREMENTS.md` — VAG-01, VAG-02, VAG-03, VAG-04.
- `.planning/PROJECT.md` — Constraints de stack e decisões de produto. Especialmente:
  IA v1 via CLI externo, persistência JSON em DATA_PATH.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/lib/data-service.ts` — `ensureSubdir(subdir)` cria subpastas automaticamente.
  Usar para criar `DATA_PATH/forms/` no primeiro acesso.
- `src/lib/repositories/profile-repository.ts` — Padrão de repositório JSON (listAll,
  findById, save, delete). Criar `vacancy-repository.ts` e `settings-repository.ts`
  seguindo o mesmo padrão.
- `src/app/(shell)/layout.tsx` — Shell layout envolve rotas autenticadas. `/vagas` e
  `/configuracoes` (ou `/settings`) herdam autenticação automaticamente.
- `src/components/ui/` — Componentes shadcn instalados: Button, Input, Label, AlertDialog,
  Select, Textarea. Verificar se Badge está disponível para exibir status da vaga.

### Established Patterns

- **Formulário em página única:** seções com delimitação visual, sem abas ou wizard (D-01 da Phase 2).
- **Salvar explícito:** botão "Salvar", sem auto-save.
- **Server Actions:** criar/editar/excluir via server actions (src/app/actions/).
- **No-Line Rule:** separação por tonalidade de superfície, nunca border-1px.
- **Kebab-case:** todos os arquivos e pastas em kebab-case.
- **UUID v4:** IDs gerados via `crypto.randomUUID()`.

### Integration Points

- `/vagas` → nova rota dentro de `src/app/(shell)/` — herda auth e shell automaticamente.
- `/configuracoes` (ou `/settings`) → nova rota para dados comuns da área.
- `DATA_PATH/vacancies/` → subpasta para JSONs de vagas (via `ensureSubdir`).
- `DATA_PATH/forms/` → subpasta para Excels gerados (via `ensureSubdir`).
- `DATA_PATH/templates/` → onde está o template GH (pré-existente no repo de dados).
- `DATA_PATH/settings.json` (ou equivalente) → arquivo de dados comuns da área.
- Left rail: habilitar "Vagas" → /vagas. Adicionar "Configurações" como novo item.
- Route handler: `src/app/api/vacancies/[id]/form/route.ts` → serve o .xlsx gerado.

</code_context>

<specifics>
## Specific Ideas

- O template Excel está em `DATA_PATH/templates/` (repo de dados), não no repo de código.
  O gerador faz cópia do template vazio e preenche a cópia — preserva formatação original.
- Excels gerados ficam em `DATA_PATH/forms/` — o gestor persiste no repositório de dados
  via git, da mesma forma que os JSONs.
- Se o Excel já existe para uma vaga, o botão "Gerar formulário GH" baixa o existente.
  Botão "Regenerar" força recriação (sobrescreve).
- Composição da equipe ("Estrutura da área e quantidade de pessoas por cargo") é candidata
  a dado comum — o gestor costuma usar o mesmo texto em todas as vagas da mesma área.
- O nome do padrinho e reporte imediato/mediato também são candidatos a dados comuns,
  pois raramente mudam entre vagas da mesma área.

</specifics>

<deferred>
## Deferred Ideas

- Busca/filtro de vagas por status, cargo ou data — entra quando o volume justificar.
- Tela de detalhes read-only da vaga (sem edição) — não necessária agora.
- Histórico de versões do formulário GH por vaga — v2.
- Notificação ou integração por email com a Werecruiter — fora de escopo no v1.
- Dashboard na home com vagas abertas — pode entrar em fase futura se fizer sentido.

</deferred>

---

*Phase: 03-vacancy-gh-form*
*Context gathered: 2026-04-20*
