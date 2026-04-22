# Phase 5: Market Research & Holistic Profile Refinement - Context

**Gathered:** 2026-04-21 (atualizado 2026-04-22 — revisão estrutural da pesquisa)
**Status:** Ready for planning
**Origin:** v1.0 leftover descoberta após Phase 4 (antes do bump SemVer). Não é v1.1 — é sobra da v1.0. Plano original discutido em sessão de plan mode cujo arquivo de origem (handoff externo) está em `/home/henrico/.claude/plans/eu-preciso-criar-um-calm-church.md`; todo o conteúdo relevante está materializado neste CONTEXT.md para não depender daquele path.

<domain>
## Phase Boundary

Cinco entregáveis, em ordem de dependência:

1. **Research e decisão de portais + queries default + instruções de sessão autenticada** (sub-plan 05-01): investigar o estado atual do mercado BR de job boards (abril/2026) para cargos senior de engenharia em São Paulo — quais portais realmente têm cobertura, qualidade de snippet vs. descrição completa via WebFetch, presença de faixa salarial, quais valem sessão autenticada. Output: lista final de 3-7 portais + queries default + instruções de login via Playwright. **Bloqueia 05-03**.

2. **Mapa global de cargos/funções** (sub-plan 05-02): pesquisa em Robert Half, Glassdoor BR, Catho e similares para montar `data/research/roles-map.json` com títulos de mercado, aliases e faixas salariais SP/Brasil por senioridade. Independente de 05-01, reutilizável.

3. **Skill `/pesquisar-mercado`** (sub-plan 05-03): skill CLI standalone e reutilizável que coleta dados de vagas via WebSearch + WebFetch (+ sessão autenticada quando disponível), filtra por porte de empresa, e persiste **dois arquivos** por execução: `{slug}-{date}-vagas.json` (vagas brutas) e `{slug}-{date}-resumo.json` (summary + profileHints). Depende de 05-01.

4. **Evolução `/refinar-perfil`** (sub-plan 05-04): Step 2 ganha pergunta opcional "carregar pesquisa de mercado como contexto?" (lista apenas `-resumo.json`, carrega só o resumo); prompts passam a receber três contextos empilhados; novo Step 5 de revisão holística inserido antes do save final.

5. **Definir `aiProfileInstructions` da área P&D/Lyceum** (sub-plan 05-05): discussão socrática com o gestor para articular visão da área, stack tri-linguagem, valores culturais, red flags, arquétipos. Entrega: valor final persistido via `/settings` + template repetível para outras áreas. Pode consumir output de 05-03 como insumo.

6. **Execução piloto** (sub-plan 05-06): rodar o fluxo completo (`/pesquisar-mercado` → `/refinar-perfil` com pesquisa + aiProfileInstructions novo → `/abrir-vaga`) para gerar o perfil Senior P&D Java+Python+TS que motivou a phase. Vira documentação viva + primeira pesquisa e primeiro refino holístico reais.

**Em escopo:** skill nova `/pesquisar-mercado`, pasta `data/research/`, evolução da `/refinar-perfil` (contexto de pesquisa + Step 5 holístico), construção colaborativa do `aiProfileInstructions` de P&D/Lyceum, piloto end-to-end gerando perfil real.

**Fora de escopo:**
- Mudanças no schema TypeScript de `JobProfile` (ver D-01 — restrição dura)
- UI web para gestão de pesquisas (listar, comparar, expirar)
- Refresh periódico automático de pesquisas (cron)
- Comparação longitudinal entre pesquisas (tendência ao longo do tempo)
- LinkedIn autenticado via MCP Playwright (só cobertura parcial via Google)
- Extração detalhada de faixas salariais via Glassdoor/Salary.com (best-effort apenas)
- Skill `/revisar-coerencia` standalone — a holística vive dentro do refino por enquanto
- Bump SemVer via `/fechar-versao` — fica com o gestor após validar a phase 5

</domain>

<decisions>
## Implementation Decisions

### Restrição fundamental

- **D-01:** **O schema TypeScript do `JobProfile` é imutável nesta phase.** Ele está atrelado ao template Excel/GH (planilha de requisição de pessoal) e alterá-lo quebra downstream (serialização, ExcelGenerator, ProfileForm). Toda a riqueza nova (stack múltiplo Java+Python+TS, arquétipo evangelizador/POC-driver/arquiteto, nível de mercado Staff/Principal) **tem que caber nos campos existentes** via inteligência de prompt — não via novos campos. Os 4 campos descritivos (`responsibilities[]`, `qualifications[]` com `required:boolean`, `behaviors[]`, `challenges[]`) + identificação (`title`, `experienceLevel`) são o universo disponível.

### Skill `/pesquisar-mercado` (05-02)

- **D-02:** Skill é **standalone e reutilizável** — roda em qualquer momento, output persiste, pode alimentar vários refinos. Não é prelude obrigatório do `/refinar-perfil`.
- **D-03:** Coleta primária via **WebSearch + WebFetch** anônimo em portais BR públicos. Coleta complementar via **sessão autenticada** quando `DATA_PATH/sessions/{portal}-session.json` existir — a skill detecta automaticamente e usa sem perguntar; se não existir, fallback para anônimo. Se WebFetch falhar em qualquer modalidade (403/429/timeout), registra como `"unavailable"` e prossegue — sem retentativa agressiva.
- **D-04:** Profundidade **configurável por execução**: enxuta (5-10 vagas, ~5min) / média (15-25 vagas, ~15min) / profunda (30-50 vagas, ~30min+). Skill pergunta no Step 1.
- **D-05:** Nomenclatura dos arquivos de pesquisa por perfil: **dois arquivos por execução**, ambos com o mesmo slug-data de base:
  - **`{slug}-{YYYY-MM-DD}-vagas.json`** — vagas brutas coletadas (fonte primária de evidência)
  - **`{slug}-{YYYY-MM-DD}-resumo.json`** — summary executivo + profileHints derivados das vagas (o que o `/refinar-perfil` consome)
  - Exemplo: `senior-pd-java-python-ts-sp-2026-04-22-vagas.json` + `senior-pd-java-python-ts-sp-2026-04-22-resumo.json`
  - Colisão no mesmo dia → sufixo `-2`, `-3` antes do `-vagas`/`-resumo`. Sanitização obrigatória: `[a-z0-9-]+` apenas.
  - Divergência consciente do padrão UUID de `profiles/` e `vacancies/` — pesquisa é semanticamente identificável por cargo + local + data.
- **D-06:** Fluxo de 7 steps (mesmo formato das skills existentes):
  1. Coletar escopo conversacional (cargo, localização default São Paulo, senioridade, stacks-chave, indústria, profundidade, porte de empresa — default: médias+)
  2. Gerar slug + executar queries WebSearch nos portais definidos por 05-01; detectar sessões autenticadas disponíveis em `DATA_PATH/sessions/`
  3. WebFetch das descrições mais relevantes conforme profundidade; usar sessão autenticada quando disponível para o portal
  4. Extrair/estruturar por vaga: título, empresa, porte estimado, stacks (core vs. exposição), senioridade declarada, faixa salarial se visível, comportamentos, arquétipo detectado; aplicar filtro de porte (D-26)
  5. Salvar `{slug}-{date}-vagas.json` com todas as vagas brutas filtradas
  6. Gerar `summary` executivo + bloco `profileHints`; salvar `{slug}-{date}-resumo.json`
  7. Mostrar paths dos dois arquivos e sugerir próxima ação (`/refinar-perfil`)
- **D-07:** **Schemas documentados apenas no SKILL.md** — não viram tipos TypeScript no app (`src/`). Dois arquivos por execução:

  **`{slug}-{date}-vagas.json`** — vagas brutas:
  ```
  {
    slug, createdAt, depth,
    scope: { role, location, seniority, stack[], industry, companySize },
    sessions: [{ portal, authenticated: bool }],
    sources: [{ portal, query, url, status }],
    jobs: [{ title, company, companySize, url, snippet, portal,
             fetchedFull, authenticated, stack[], seniority,
             salaryRange, behaviors[], archetype }]
  }
  ```

  **`{slug}-{date}-resumo.json`** — summary + profileHints derivados das vagas:
  ```
  {
    slug, createdAt, vagasFile,
    summary: { commonTitles[], titleAliases[], stackFrequency{}, emergingStack[],
               salaryRange, salarySource, commonBehaviors[], commonChallenges[],
               archetypes[], trends[], redFlags[] },
    profileHints: { responsibilities[], qualifications[] (com required:bool),
                    behaviors[], challenges[], suggestedTitle, suggestedExperienceLevel }
  }
  ```
  O campo `vagasFile` no resumo referencia o arquivo de vagas correspondente.
- **D-08:** **Guardrails documentados no SKILL.md:** sem scraping agressivo (respeitar rate limits implícitos); LinkedIn declarado como "cobertura parcial via Google" (sem login, exceto se sessão disponível); `salaryRange: null` se ausente em todas as vagas; nunca persistir dados pessoais de candidatos; arquivos de sessão (`DATA_PATH/sessions/`) contêm credenciais — não logar conteúdo, não incluir no output exibido ao gestor.

### Research de portais (05-01 — bloqueia 05-02)

- **D-09:** **A lista de portais NÃO é congelada neste CONTEXT.md.** Ela é output do sub-plan 05-01, que deve investigar o estado atual (abril/2026) via WebSearch: cobertura real, qualidade de snippet, taxa de sucesso de WebFetch em cada um, presença de faixa salarial. Sem essa discovery, a skill nasce com premissas ruins.
- **D-10:** Candidatos iniciais a validar em 05-01: Gupy (via Google), vagas.com.br, Glassdoor BR, Catho, `site:linkedin.com/jobs`, InfoJobs, Remotar. Lista final pode adicionar ou remover. Output documenta também queries default por senioridade (ex: "senior java architect são paulo", "staff engineer brasil", "arquiteto de soluções java python").
  - **Prioridade alta (definida em discuss):** Gupy (`site:gupy.io` via Google), LinkedIn (`site:linkedin.com/jobs` via Google), vagas.com.br, InfoJobs BR — investigar estes primeiro no 05-01.
  - **Best-effort:** Glassdoor BR (útil para faixas salariais, mas WebFetch frequentemente 403).
  - **Queries:** 05-01 deve testar **misto PT+EN** e documentar qual idioma retorna mais cobertura para cargos de engenharia P&D em SP. Exemplo PT: "engenheiro sênior java python são paulo"; Exemplo EN: "senior java architect são paulo".

### Evolução `/refinar-perfil` (05-03)

- **D-11:** Step 2 atual (carregar perfil + settings) ganha **pergunta adicional opcional**: "Carregar pesquisa de mercado como contexto?". A skill lista `$DATA_PATH/research/*-resumo.json` ordenados por data desc com data legível (ex: `senior-pd-java-python-ts-sp-2026-04-22-resumo.json — hoje`); gestor escolhe por número ou pula. Ao escolher, **somente o arquivo `-resumo.json` é carregado** no contexto — o `-vagas.json` é arquivo de auditoria/histórico, não injetado no prompt. Retrocompatível — quem pular continua no fluxo atual.
- **D-12:** Prompts de sugestão passam a receber **três contextos empilhados**:
  1. `aiProfileInstructions` da área (fixo, carregado de `settings.json` — já é o comportamento atual)
  2. Pesquisa carregada (variável por sessão, opcional)
  3. Perfil atual sendo refinado
- **D-13:** O system prompt **orienta a IA a priorizar a pesquisa quando presente** E a sempre respeitar os 4 campos fixos do JobProfile (D-01). A riqueza extra que a pesquisa traz (stack híbrido, arquétipo) tem que ser expressada dentro de `responsibilities` / `qualifications` / `behaviors` / `challenges` — não inventa campo novo, não injeta texto fora-do-schema.
- **D-14:** **Novo Step 5 — revisão holística** (inserido entre o ciclo A/R/J e o save final):
  - IA lê o perfil pós-edição completo e detecta os seguintes tipos de incoerência (todos decididos em discuss):
    1. **Lacunas responsabilidades × qualificações** — responsabilidade cita arquitetura/IA/liderança mas nenhuma qualificação correspondente existe
    2. **Redundâncias entre campos** — mesmo ponto dito de formas diferentes em responsibilities E qualifications, ou behaviors E challenges
    3. **Descalibração título × conteúdo** — título diz "Sênior" mas responsabilidades parecem de Pleno, ou vice-versa; `title` × `experienceLevel` desalinhados
    4. **Lacunas comportamentais** — cargo exige liderança/mentoria nas responsabilidades mas nenhum behavior correspondente aparece
  - Apresenta findings em **lista numerada** → por item, gestor escolhe **[A]plicar sugestão**, **[I]gnorar**, **[J]ustar** (itera em linguagem natural). Mesmo padrão [A/I/J] já familiar do Step 4.
  - **Sem limite de findings** — IA lista todas as incoerências encontradas; gestor decide o que resolver.
  - Ao final, confirma salvamento (step 6 existente — renumerado de 5 para 6 com a inserção do holístico).

### `aiProfileInstructions` da área P&D/Lyceum (05-04)

- **D-15:** Construir um `aiProfileInstructions` robusto merece **sub-plan dedicado** — não é tarefa lateral. Hoje esse campo é o contexto fixo da área injetado em todos os prompts da `/refinar-perfil`; valor pobre degrada toda a qualidade downstream. Abordagem: **discussão socrática** com o gestor para articular visão da área, tipos de produto (Lyceum, ensino superior), stack prevalente vs. emergente (IA), valores culturais, critérios de sucesso de contratação, red flags, arquétipos valorizados.
- **D-16:** 05-05 pode e deve **consumir output de 05-03 como insumo** — roteiro da discussão socrática inclui passos do tipo "o mercado diz X sobre esse cargo, nós somos/queremos Y diferente porque…" ancorando auto-reflexão em evidência externa.
- **D-17:** Entrega de 05-04: valor final persistido via formulário `/settings` na web app (campo já existente, ver `src/components/settings/settings-form.tsx`) + documentação do processo/template de perguntas para reuso em outras áreas no futuro.

### Dados e persistência

- **D-18:** Pasta `data/research/` é criada **pela skill no primeiro uso** via `mkdir -p` — mesmo padrão do `ensureSubdir()` em `src/lib/data-service.ts`. **Não é lida pelo app web** (sem repositório TS, sem API route, sem UI). Apenas skills CLI escrevem e leem. Versionada via git no repo de dados separado (`hiring-pipeline-data`, symlink em `data/`).
- **D-19:** **Nenhuma mudança em `src/*`.** Escopo protegido: `src/lib/profile.ts`, `src/lib/vacancy.ts`, `src/lib/settings.ts`, `src/components/settings/settings-form.tsx`, `src/lib/excel-generator.ts` — todos ficam intactos. `aiProfileInstructions` continua como o contexto FIXO da área; pesquisa é o contexto VARIÁVEL por refino.

### Escopo e versão

- **D-20:** Isto **NÃO é v1.1 nem v2.0**. É sobra da v1.0 descoberta após a phase 4 ser marcada como "Complete" no GSD — o bump SemVer (`npm version`) não foi executado ainda, então v1.0 continua aberta na prática. `/fechar-versao` só roda depois que a phase 5 for validada.
- **D-21:** Verificação end-to-end acontece **no sub-plan 05-06** (piloto), não em sub-plan de verificação separado. O piloto é a verificação.

### Validade e listagem de pesquisas (05-03)

- **D-22:** Quando `/refinar-perfil` listar pesquisas disponíveis no Step 2, exibir **data legível** ao lado de cada arquivo (ex: `senior-pd-java-python-ts-sp-2026-04-21.json — 3 dias atrás`). Sem bloqueio por idade — gestor decide se usa pesquisa antiga. Sem threshold configurável no v1.

### Seed para aiProfileInstructions P&D/Lyceum (05-04)

- **D-23:** O sub-plan 05-04 parte com os seguintes vetores já validados pelo gestor como input para a discussão socrática:
  - **Arquétipo:** Misto dos 3 perfis (evangelizador/POC-driver, arquiteto técnico, engenheiro de produto) — proporção varia por seniority e papel específico. Não existe "arquétipo único" da área.
  - **Domínio prioritário para o aiProfileInstructions:**
    - IA generativa aplicada (LLMs, APIs de IA) — os engenheiros de P&D usam e produzem IA como parte do produto
    - Cultura de experimentação/POC — prosperar em ambiguidade; não exigir spec 100% antes de codar
    - Stack tri-linguagem (Java + Python + TypeScript) — "fullstack" na área significa essa combinação específica
    - **EdTech/ensino superior NÃO é foco** do aiProfileInstructions — o contexto de produto é implícito; o valor do campo está em orientar a IA sobre o tipo de engenheiro, não sobre o domínio do produto.
  - **Red flags a sinalizar nas qualificações geradas:**
    - Foco exclusivo em uma única linguagem/stack (rigidez incompatível com P&D)
    - Ausência de experiência com LLMs/APIs de IA (para cargos Sênior+, relevante a partir de 2025/2026)
  - Estes vetores orientam o roteiro socrático de 05-04 (quais perguntas fazer, em que ordem, o que já está semi-decidido vs. a explorar).

### Mapa global de cargos/funções (05-02)

- **D-24:** Arquivo **`data/research/roles-map.json`** — mapa persistente e reutilizável de cargos/funções do mercado BR. Não é por perfil específico; é referência global da área de engenharia. Pesquisado em fontes como Robert Half, Glassdoor BR, Catho e sites especializados em remuneração. Conteúdo:
  - Lista de títulos/funções usados no mercado (ex: "Engenheiro Sênior de Software", "Staff Engineer", "Arquiteto de Soluções", "Tech Lead")
  - Faixas salariais para São Paulo / Brasil por nível de senioridade (quando disponíveis publicamente)
  - Aliases e variações de título para o mesmo papel
  - Tendências emergentes (títulos que estão surgindo vs. se tornando obsoletos)
  - O arquivo é substituído/atualizado a cada execução do plano 05-02, com campo `updatedAt`.

### Sessões autenticadas (05-03)

- **D-25:** Mecanismo de **sessão autenticada** para portais que requerem login. O gestor faz login manualmente via Playwright e salva o estado da sessão em `DATA_PATH/sessions/{portal}-session.json` (ex: `linkedin-session.json`, `glassdoor-session.json`). A skill `/pesquisar-mercado` detecta automaticamente: se `DATA_PATH/sessions/{portal}-session.json` existe e não está expirada → usa para navegação/WebFetch; caso contrário → fallback para acesso anônimo. O sub-plan 05-01 deve documentar quais portais são conhecidamente melhores com autenticação e instruções de como salvar sessão via Playwright CLI (`playwright open --save-storage=...`).

### Filtro de porte de empresa (05-03)

- **D-26:** Parâmetro **porte de empresa** coletado no Step 1 da skill `/pesquisar-mercado`:
  - Opções: `todas` / `médias+` (padrão) / `grandes+`
  - Aplicado no Step 4 na priorização e filtragem de vagas: vagas de startups/pequenas empresas são marcadas mas depriorizadas no resumo quando o filtro é médias+ ou grandes+.
  - Critério de classificação de porte: heurística baseada no nome da empresa + contexto do snippet (multinacional conhecida = grande; startup sem funcionários visíveis = pequena). Sem API de dados de empresa — estimativa best-effort documentada no SKILL.md.

### Claude's Discretion

- Estrutura exata do system prompt da `/pesquisar-mercado` (como pedir para a IA extrair stack/arquétipo de snippets irregulares).
- Heurística de priorização quando há mais jobs candidatos a WebFetch do que a profundidade escolhida permite.
- Critério exato de classificação de porte de empresa (D-26) — heurística best-effort.
- Roteiro detalhado da discussão socrática em 05-05 (perguntas, ordem, critérios de parada) — guiado pelos vetores de D-23.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skills existentes (referência de padrão)

- `.agents/skills/refinar-perfil/SKILL.md` — skill a evoluir em 05-03. Ler antes de planejar: o Step 2 atual (carregamento de perfil + settings) e o fluxo A/R/J dos steps 3-4 precisam ser preservados; mudanças são adicionais e holísticas.
- `.agents/skills/abrir-vaga/SKILL.md` — skill vizinha com padrão de fluxo de 6 steps e conversação. Referência de estilo e estrutura para a nova `/pesquisar-mercado`.
- `.agents/skills/fechar-versao/SKILL.md` — padrão de segurança operacional (validações, exit codes), referência para guardrails.

### Schema imutável (D-01)

- `src/lib/profile.ts` — schema de `JobProfile`. **Não alterar nesta phase.** Usar para validar que `profileHints` em pesquisas só populem campos que existem aqui.
- `src/lib/settings.ts` — schema de `AreaSettings`. Campo `aiProfileInstructions?: string` já existe (criado na Phase 4). 05-04 só preenche valor, não altera schema.
- `src/lib/vacancy.ts` — schema de `Vacancy`. Referência para validar que `/abrir-vaga` continua compatível após piloto.

### Integração com o app

- `src/lib/data-service.ts` — padrão `ensureSubdir()` e validação de path. Replicar lógica mentalmente no sanitizer de slug de pesquisa.
- `src/app/(shell)/settings/page.tsx` + `src/components/settings/settings-form.tsx` — UI onde `aiProfileInstructions` é persistido. 05-04 usa esta UI para salvar o valor final (não mexe no código, apenas usa).
- `src/lib/repositories/` — padrão de validação de ID contra path traversal. Não há repositório de pesquisa, mas a skill deve aplicar a mesma lógica defensiva ao montar paths.

### Políticas do projeto

- `AGENTS.md` — política de idioma (código/nomes em inglês, conteúdo em pt-BR), estratégia agnóstica (`.agents/skills/` é fonte de verdade, `.claude/` e `.cursor/` são apontamentos), kebab-case em arquivos.
- `CLAUDE.md` — apontamento para AGENTS.md, não duplicar conteúdo.

### Estado GSD

- `.planning/ROADMAP.md` — roadmap atualizado com Phase 5. Progresso geral em 80%.
- `.planning/STATE.md` — milestone v1.0 "In Progress" (voltou de "Complete" quando phase 5 foi adicionada). Roadmap Evolution registrado.
- `.planning/phases/04-ai-assisted-profile-refinement/04-CONTEXT.md` — phase predecessora. D-14 a D-16 lá definem como `aiProfileInstructions` foi introduzido; este CONTEXT.md reutiliza esse contrato sem modificá-lo.

### Handoff externo (origem desta phase)

- `/home/henrico/.claude/plans/eu-preciso-criar-um-calm-church.md` — arquivo de plan mode da sessão original de descoberta. Todo o conteúdo relevante foi transcrito para este CONTEXT.md; o path externo é mantido apenas como rastro de origem. **Não é fonte de verdade** — se este CONTEXT.md divergir do plano externo, este CONTEXT.md ganha.

</canonical_refs>

<files>
## Files to create / modify / protect

### A criar (nova skill + artefatos de dados — padrão agnóstico do projeto)

Seguindo o contrato do `AGENTS.md`, toda nova skill tem uma **fonte de verdade** em `.agents/skills/` e **dois apontamentos** (um por ferramenta de IA). Ver padrão existente em `.claude/skills/refinar-perfil/` e `.cursor/skills/refinar-perfil/`.

- `.agents/skills/pesquisar-mercado/SKILL.md` — **fonte de verdade** da nova skill (conteúdo completo)
- `.claude/skills/pesquisar-mercado/SKILL.md` — apontamento para a fonte de verdade (conteúdo curto que referencia o `.agents/`)
- `.cursor/skills/pesquisar-mercado/SKILL.md` — apontamento idem
- `data/research/` — subpasta criada pela própria skill no primeiro uso (via `mkdir -p`, ver D-18)
- `data/research/roles-map.json` — mapa global de cargos/funções + faixas salariais (criado pelo plano 05-02, atualizado por re-execução)
- `data/sessions/` — diretório para arquivos de sessão autenticada (criado manualmente pelo gestor; **não versionado no git** — adicionar ao `.gitignore` do repo de dados)

### A modificar

- `.agents/skills/refinar-perfil/SKILL.md` — edição do Step 2 (D-11) + inserção do novo Step 5 holístico (D-14). Os apontamentos em `.claude/skills/` e `.cursor/skills/` não mudam; eles já apontam para a fonte de verdade.

### A NÃO modificar (escopo protegido — ver D-01 e D-19)

- `src/lib/profile.ts`
- `src/lib/vacancy.ts`
- `src/lib/settings.ts`
- `src/components/settings/settings-form.tsx`
- `src/lib/excel-generator.ts`

### Utilitários e padrões a reusar (não criar do zero)

- **Leitura de `settings.json` em skill CLI:** `cat $DATA_PATH/settings.json` (mesmo padrão do Step 2 atual da `/refinar-perfil`). Parsing via `node -e` ou jq no próprio shell da skill.
- **Validação de path contra path traversal:** replicar lógica de `src/lib/repositories/` (rejeitar `..`, `/`, `\`) no sanitizer de slug da nova skill.
- **Criação de subdir sob `DATA_PATH`:** espelhar o padrão `ensureSubdir()` em `src/lib/data-service.ts` — `mkdir -p` idempotente na primeira escrita.
- **Formato canônico de SKILL.md** (mandatório para as 2 skills afetadas): seções **Contexto**, **Pré-condições**, **Steps** (numerados, conversacionais), **Notas**. Referência viva: `.agents/skills/refinar-perfil/SKILL.md` e `.agents/skills/abrir-vaga/SKILL.md`.

</files>

<subplans>
## Sub-plans

Estrutura com 6 planos; dependência dura: 05-01 bloqueia 05-03; 05-02 é independente:

- **05-01 — Research de portais + queries default + instruções de sessão autenticada.** Entregável: lista final de portais BR (3-7) + queries default por senioridade + limites conhecidos + documentação de quais portais valem sessão autenticada e como salvar via Playwright CLI. **Bloqueia 05-03.**
- **05-02 — Mapa global de cargos/funções (`roles-map.json`).** Pesquisa em Robert Half, Glassdoor BR, Catho e similares; entrega `data/research/roles-map.json` com títulos do mercado, aliases e faixas salariais SP/Brasil por senioridade. Independente, reutilizável.
- **05-03 — Skill `/pesquisar-mercado` + pasta `data/research/`.** Implementa skill com 7 steps, output dual (`-vagas.json` + `-resumo.json`), filtro de porte (D-26), sessões autenticadas (D-25). Depende de 05-01.
- **05-04 — Evolução `/refinar-perfil`** (D-11 a D-14). Lista apenas `*-resumo.json`, carrega só o resumo. Melhor executado depois que há ao menos uma pesquisa real para testar o Step 2 evoluído.
- **05-05 — Definir `aiProfileInstructions` da área P&D/Lyceum** (D-15 a D-17). Pode rodar em paralelo com 05-03/05-04; ganha qualidade consumindo output de 05-03.
- **05-06 — Execução piloto** (D-21). Fecha a phase. Depende de 05-03, 05-04 e 05-05 implementados.

</subplans>

<verification>
## Verification End-to-End (executada no sub-plan 05-06)

0. Concluir 05-05 — `aiProfileInstructions` da área P&D/Lyceum preenchido em `/settings` com conteúdo robusto.
0b. Verificar que `data/research/roles-map.json` existe e tem títulos de mercado + faixas salariais (output de 05-02).
1. Rodar `/pesquisar-mercado` com escopo: *"Senior P&D, Java + Python + TS, São Paulo, profundidade média, médias+"*.
2. Conferir que AMBOS os arquivos existem: `data/research/senior-pd-java-python-ts-sp-2026-04-22-vagas.json` (com `jobs[]` não-vazio) e `senior-pd-java-python-ts-sp-2026-04-22-resumo.json` (com `summary` + `profileHints`), usando portais de 05-01.
3. Rodar `/refinar-perfil` escolhendo um perfil Java existente (ex: `dev-java-pleno`), carregando a pesquisa do passo 2 (o arquivo `-resumo.json` deve aparecer na listagem).
4. Verificar que as sugestões de IA **citam explicitamente** stack híbrido e arquétipo de evangelizador, e que o `aiProfileInstructions` da área se reflete no tom — tudo cabendo nos 4 campos do JobProfile (D-01).
5. Completar o ciclo A/R/J, chegar ao **novo Step 5 holístico**, ver findings, aceitar/ignorar/ajustar por item.
6. Confirmar que o JSON salvo em `data/profiles/{id}.json` respeita o schema original e está internamente consistente (título × nível × responsabilidades × qualificações alinhados).
7. Abrir perfil em `/profiles/{id}` na web app — deve renderizar normalmente, sem erros de tipo.
8. Rodar `/abrir-vaga` usando o perfil refinado — confirma downstream OK.
9. Gerar Excel pela web — rótulos configuráveis e estrutura da planilha GH continuam válidos.
10. Rerodar `/pesquisar-mercado` no mesmo escopo no mesmo dia → confirmar que os arquivos saem como `...-2026-04-22-2-vagas.json` e `...-2026-04-22-2-resumo.json` (D-05).

</verification>
