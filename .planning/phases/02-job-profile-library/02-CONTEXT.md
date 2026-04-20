# Phase 2: Job Profile Library - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Manager pode criar, manter e consultar perfis-base de vaga reutilizáveis com metadados
completos — título, campos estruturados de candidato, 5 textareas de conteúdo descritivo,
e observações internas. Ao final desta fase: CRUD completo de perfis acessível em /profiles,
integrado ao shell da Phase 1.

**Em escopo:** criar perfil, editar perfil, listar perfis, excluir perfil, todos os campos
mapeados no formulário GH (ver canonical refs), persistência JSON em DATA_PATH/profiles/.

**Fora de escopo:** busca/filtro de perfis (fase futura), sugestões de IA (Phase 3),
abertura de vagas a partir de perfis (Phase 4), geração do Excel (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Formulário de Criação/Edição

- **D-01:** Página única com seções — todos os campos em uma página longa, separados
  por seções com delimitação visual clara. Sem abas nem wizard.
- **D-02:** Botão "Salvar" explícito — sem auto-save. Previsível e simples de implementar.
- **D-03:** Delimitação visual das seções: Claude decide entre card (surface-container-low)
  ou heading com espaçamento — o que ficar mais claro seguindo o No-Line Rule do DESIGN.md.

### Campos do Perfil

**Campos estruturados de candidato:**
- Título do cargo (texto — título interno)
- Cargo sugerido para anúncio (texto — título para publicação externa/Gupy)
- Tempo de experiência (seleção: < 1 ano / 1-3 anos / 3-5 anos / 5-10 anos / > 10 anos)
- Nível de escolaridade (seleção: Ensino médio / Superior cursando / Superior completo + campo "Curso")
- Pós-graduação (seleção: Não exigido / Desejável / Necessário + campo "Curso")
- Certificações (seleção: Não / Desejável / Sim + campo "Quais")
- Inglês / Espanhol / Outro idioma (seleção de nível por idioma)

**5 textareas de conteúdo descritivo (núcleo do perfil — TODOS obrigatórios para preencher o formulário GH):**
- Responsabilidades e atribuições
- Requisitos e qualificações (obrigatórios + diferenciais no mesmo campo)
- Características e competências comportamentais
- Principais desafios
- Informações complementares

**Campos de infraestrutura (opcionais, dependem do cargo):**
- Sistemas necessários (texto livre)
- Pastas de rede (texto livre)

**Metadados internos:**
- Observações internas (texto longo — não publicado externamente)

**Campos de listas:** todos os campos de lista são textareas simples (um item por linha).
Dois textareas separados para requisitos obrigatórios vs. diferenciais NÃO se aplicam —
o gestor escreve obrigatórios e opcionais no mesmo campo "Requisitos e qualificações",
separando por linguagem natural. Critérios de avaliação são apenas texto, sem peso numérico.

### Lista de Perfis

- **D-04:** Lista simples — cada perfil em uma linha: título + cargo sugerido + data de
  atualização + ações (editar / excluir).
- **D-05:** Ordenação por última atualização (mais recente primeiro).
- **D-06:** Sem busca/filtro por ora — entra numa fase futura quando o volume justificar.
- **D-07:** Home permanece página separada (/). Perfis ficam em /profiles como seção
  própria. Left rail habilita o item "Perfis" nesta fase.

### Visualização e Edição

- **D-08:** Clicar em um perfil na lista abre direto em modo edição (/profiles/[id]/edit).
  Sem tela de visualização read-only separada.
- **D-09:** Criar novo perfil: botão "Novo perfil" na tela /profiles, leva para
  /profiles/new.
- **D-10:** Excluir perfil: AlertDialog de confirmação antes de deletar
  ("Excluir perfil X? Esta ação não pode ser desfeita."). Shadcn AlertDialog disponível.

### Claude's Discretion

- Delimitação visual das seções do formulário (card vs. heading) — seguir o que ficar
  mais legível respeitando o No-Line Rule do DESIGN.md.
- Estrutura exata de pastas e arquivos em src/ para os componentes de perfil.
- Formato do ID do perfil — **resolvido pós-phase:** UUID v4 via `crypto.randomUUID()`; nome do arquivo JSON = UUID puro (sem prefixo).
- Conteúdo da home page (/) — empty state simples ou placeholder enquanto não há dashboard.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Mapeamento de Campos — Leitura obrigatória antes de criar schema, formulário ou telas

- `.planning/references/excel-form-fields.md` — Todos os campos do formulário GH
  (Requisição de Pessoal), agrupados por perfil vs. vaga. Inclui instruções originais de
  cada textarea e mapeamento para código. **Garantia de cobertura completa dos campos.**
- `.planning/references/gupy-fields.md` — Campos da Gupy com origem no perfil, o que é
  responsabilidade do GH, e fluxo de publicação. Referência para não criar campos
  desnecessários nem deixar lacunas.

### Design System
- `DESIGN.md` — Especificação visual do projeto (No-Line Rule, surface hierarchy, 8px grid).
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md` — Decisões de design e
  padrões estabelecidos na Phase 1 que esta fase deve seguir.

### Componentes existentes (Phase 1)
- `src/components/shell/left-rail.tsx` — Item "Perfis" desabilitado aguardando esta fase.
  Habilitar e apontar para /profiles.
- `src/lib/data-service.ts` — `ensureSubdir("profiles")` cria automaticamente a subpasta
  de dados. Usar como base para a camada de persistência de perfis.
- `src/components/ui/` — Button, Input, Label disponíveis. AlertDialog do shadcn para
  confirmação de exclusão.

### Requirements
- `.planning/REQUIREMENTS.md` — PROF-01, PROF-02, PROF-03, PROF-04, PROF-05.
- `.planning/PROJECT.md` — Constraints de stack e decisões de produto.

### Template do Formulário GH
- `templates/requisicao-de-pessoal.xlsx` — Fonte primária dos campos. Consultar em caso
  de dúvida sobre um campo específico.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/data-service.ts` — `ensureSubdir(subdir)` + leitura/escrita JSON já implementados.
  A camada de persistência de perfis (listAll, findById, save, delete) deve ser construída
  sobre essa base.
- `src/components/shell/left-rail.tsx` — Item "Perfis" já existe como `disabled: true`.
  Habilitar nesta fase (remover `disabled`, apontar href para /profiles).
- `src/components/ui/` — Button, Input, Label do shadcn disponíveis.
  AlertDialog precisará ser adicionado via shadcn CLI.
- `src/app/(shell)/layout.tsx` — Shell layout já envolve rotas autenticadas.
  Novas rotas de perfil herdam autenticação automaticamente.

### Established Patterns
- **No-Line Rule:** separação por tonalidade de superfície, nunca border-1px.
- **Surface hierarchy:** surface → surface-container-low (rail, cards) → surface-container-lowest (workspace).
- **Kebab-case:** todos os arquivos e pastas seguem kebab-case (profile-form.tsx, profile-list.tsx).
- **Data layer:** acesso a dados exclusivamente via camada de serviço — nunca direto em componentes.
- **Server Actions:** auth usa server actions (src/app/actions/auth.ts). Seguir o mesmo
  padrão para create/update/delete de perfis.

### Integration Points
- `/profiles` → nova rota dentro de `src/app/(shell)/` — herda auth e shell automaticamente.
- `DATA_PATH/profiles/` → subpasta criada via `ensureSubdir("profiles")` no primeiro acesso.
- Left rail: habilitar item "Perfis" e manter "Vagas" desabilitado (Phase 4).

</code_context>

<specifics>
## Specific Ideas

- O gestor escreve obrigatórios e diferenciais no mesmo textarea "Requisitos e qualificações"
  usando linguagem natural para distinguir. Na publicação da Gupy, separa manualmente nas
  sub-áreas. Não forçar estrutura no v1.
- "Principais desafios" é um campo genérico — o gestor costuma escrever algo sobre como
  o candidato pode contribuir para o crescimento da área. Não tem equivalente na Gupy.
- Descrição da vaga para a Gupy (intro empresa/área) é responsabilidade do GH ao cadastrar
  na Gupy — fora do escopo do sistema.
- Home (/) permanece placeholder/empty state por ora. Phase 4 pode introduzir dashboard
  com vagas abertas se fizer sentido.

</specifics>

<deferred>
## Deferred Ideas

- Busca/filtro de perfis por título — entra quando o volume justificar (fase futura).
- Duplicar/clonar um perfil existente como base para um novo — útil mas não bloqueante para v1.
- Tela de visualização read-only separada (/profiles/[id]) — não necessária agora, pode entrar se Phase 3 (IA) precisar de uma view limpa para sugestões.
- Campo "Descrição da vaga" (intro Gupy) no perfil — discutido e descartado; responsabilidade do GH.

</deferred>

---

*Phase: 02-job-profile-library*
*Context gathered: 2026-04-19*
