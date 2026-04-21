# Phase 5: Market Research & Holistic Profile Refinement - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning
**Origin:** v1.0 leftover descoberta após Phase 4 (antes do bump SemVer). Não é v1.1 — é sobra da v1.0. Plano original discutido em sessão de plan mode cujo arquivo de origem (handoff externo) está em `/home/henrico/.claude/plans/eu-preciso-criar-um-calm-church.md`; todo o conteúdo relevante está materializado neste CONTEXT.md para não depender daquele path.

<domain>
## Phase Boundary

Cinco entregáveis, em ordem de dependência:

1. **Research e decisão de portais + queries default** (sub-plan 05-01): investigar o estado atual do mercado BR de job boards (abril/2026) para cargos senior de engenharia em São Paulo — quais portais realmente têm cobertura, qualidade de snippet vs. descrição completa via WebFetch, presença de faixa salarial. Output: lista final de 3-7 portais + queries default por senioridade + limites conhecidos documentados. **Bloqueia 05-02**.

2. **Skill `/pesquisar-mercado`** (sub-plan 05-02): skill CLI standalone e reutilizável que coleta dados de vagas em portais públicos via WebSearch + WebFetch, extrai/estrutura, gera sumário executivo e `profileHints` (bloco "tradutor" pré-mastigado para os 4 campos fixos do JobProfile), e persiste em `DATA_PATH/research/{slug}-{YYYY-MM-DD}.json`.

3. **Evolução `/refinar-perfil`** (sub-plan 05-03): Step 2 ganha pergunta opcional "carregar pesquisa de mercado como contexto?"; prompts passam a receber três contextos empilhados (`aiProfileInstructions` fixo da área + pesquisa variável + perfil atual); novo Step 5 de revisão holística inserido antes do save final — IA aponta inconsistências entre responsabilidades × qualificações × comportamentos × desafios e gestor decide por item.

4. **Definir `aiProfileInstructions` da área P&D/Lyceum** (sub-plan 05-04): discussão socrática com o gestor para articular visão da área, tipos de produto (Lyceum, ensino superior), stack prevalente vs. emergente (IA), valores culturais, critérios de sucesso, red flags, arquétipos valorizados. Entrega: valor final persistido via `/settings` na web app + documentação do processo como template repetível para outras áreas no futuro. Pode consumir output de 05-02 como insumo.

5. **Execução piloto** (sub-plan 05-05): rodar o fluxo completo (`/pesquisar-mercado` → `/refinar-perfil` com pesquisa + aiProfileInstructions novo → `/abrir-vaga`) para gerar o perfil Senior P&D Java+Python+TS que motivou a phase. Vira documentação viva + primeira pesquisa e primeiro refino holístico reais.

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
- **D-03:** Coleta via **WebSearch + WebFetch** em portais BR públicos. NÃO usa Playwright MCP (fora de escopo), NÃO depende de colagem manual do gestor. Se WebFetch falhar em um portal (403/429/timeout), registra como `"unavailable"` e prossegue — sem retentativa agressiva.
- **D-04:** Profundidade **configurável por execução**: enxuta (5-10 vagas, ~5min) / média (15-25 vagas, ~15min) / profunda (30-50 vagas, ~30min+). Skill pergunta no Step 1.
- **D-05:** Nomenclatura do arquivo: **`{slug}-{YYYY-MM-DD}.json`** (ex: `senior-pd-hibrido-java-python-ts-sp-2026-04-21.json`). Divergência consciente do padrão UUID usado em `profiles/` e `vacancies/` — pesquisa é semanticamente identificável (cargo + local + data) e precisa ser reconhecível no `ls` pelo gestor quando a `/refinar-perfil` listar pesquisas disponíveis. Colisão no mesmo dia → sufixo `-2`, `-3`. Sanitização obrigatória: `[a-z0-9-]+` apenas.
- **D-06:** Fluxo de 6 steps (mesmo formato das skills existentes):
  1. Coletar escopo conversacional (cargo, localização default São Paulo, senioridade, stacks-chave, indústria, profundidade)
  2. Gerar slug + executar queries WebSearch nos portais definidos por 05-01
  3. WebFetch das descrições mais relevantes conforme profundidade
  4. Extrair/estruturar por vaga: título, empresa, stacks (core vs. exposição), senioridade declarada, faixa salarial se visível, comportamentos, arquétipo detectado
  5. Gerar `summary` executivo + bloco `profileHints` (tradutor pré-mastigado para os 4 campos fixos do JobProfile)
  6. Salvar em `$DATA_PATH/research/{slug}.json`, mostrar paths e sugerir próxima ação (`/refinar-perfil`)
- **D-07:** **Schema do JSON é documentado apenas no SKILL.md** — não vira tipo TypeScript no app (`src/`), porque o app web não lê pesquisas. Estrutura canônica:
  ```
  {
    slug, createdAt, depth, scope: { role, location, seniority, stack[], industry },
    sources: [{ portal, query, url, status }],
    jobs:    [{ title, company, url, snippet, portal, fetchedFull, stack[], seniority, salaryRange, behaviors[] }],
    summary: { commonTitles[], titleAliases[], stackFrequency{}, emergingStack[],
               salaryRange, salarySource, commonBehaviors[], commonChallenges[],
               archetypes[], trends[], redFlags[] },
    profileHints: { responsibilities[], qualifications[] (com required:bool),
                    behaviors[], challenges[], suggestedTitle, suggestedExperienceLevel }
  }
  ```
- **D-08:** **Guardrails documentados no SKILL.md:** sem scraping agressivo (respeitar rate limits implícitos); LinkedIn declarado como "cobertura parcial via Google" (sem login); `salaryRange: null` se ausente em todas as vagas; nunca persistir dados pessoais de candidatos.

### Research de portais (05-01 — bloqueia 05-02)

- **D-09:** **A lista de portais NÃO é congelada neste CONTEXT.md.** Ela é output do sub-plan 05-01, que deve investigar o estado atual (abril/2026) via WebSearch: cobertura real, qualidade de snippet, taxa de sucesso de WebFetch em cada um, presença de faixa salarial. Sem essa discovery, a skill nasce com premissas ruins.
- **D-10:** Candidatos iniciais a validar em 05-01: Gupy (via Google), vagas.com.br, Glassdoor BR, Catho, `site:linkedin.com/jobs`, InfoJobs, Remotar. Lista final pode adicionar ou remover. Output documenta também queries default por senioridade (ex: "senior java architect são paulo", "staff engineer brasil", "arquiteto de soluções java python").

### Evolução `/refinar-perfil` (05-03)

- **D-11:** Step 2 atual (carregar perfil + settings) ganha **pergunta adicional opcional**: "Carregar pesquisa de mercado como contexto?". A skill lista `$DATA_PATH/research/*.json` ordenados por data desc; gestor escolhe por número ou pula. Retrocompatível — quem pular continua no fluxo atual.
- **D-12:** Prompts de sugestão passam a receber **três contextos empilhados**:
  1. `aiProfileInstructions` da área (fixo, carregado de `settings.json` — já é o comportamento atual)
  2. Pesquisa carregada (variável por sessão, opcional)
  3. Perfil atual sendo refinado
- **D-13:** O system prompt **orienta a IA a priorizar a pesquisa quando presente** E a sempre respeitar os 4 campos fixos do JobProfile (D-01). A riqueza extra que a pesquisa traz (stack híbrido, arquétipo) tem que ser expressada dentro de `responsibilities` / `qualifications` / `behaviors` / `challenges` — não inventa campo novo, não injeta texto fora-do-schema.
- **D-14:** **Novo Step 5 — revisão holística** (inserido entre o ciclo A/R/J e o save final):
  - IA lê o perfil pós-edição completo e aponta: inconsistências entre responsabilidades × qualificações, lacunas (ex: responsabilidade cita arquitetura mas não há qualification correspondente), redundâncias, descalibração `title` × `experienceLevel` × conteúdo.
  - Apresenta findings em lista numerada → por item, gestor escolhe **[A]plicar sugestão**, **[I]gnorar**, **[J]ustar** (itera em linguagem natural).
  - Ao final, confirma salvamento (como hoje, step 6 existente).

### `aiProfileInstructions` da área P&D/Lyceum (05-04)

- **D-15:** Construir um `aiProfileInstructions` robusto merece **sub-plan dedicado** — não é tarefa lateral. Hoje esse campo é o contexto fixo da área injetado em todos os prompts da `/refinar-perfil`; valor pobre degrada toda a qualidade downstream. Abordagem: **discussão socrática** com o gestor para articular visão da área, tipos de produto (Lyceum, ensino superior), stack prevalente vs. emergente (IA), valores culturais, critérios de sucesso de contratação, red flags, arquétipos valorizados.
- **D-16:** 05-04 pode e deve **consumir output de 05-02 como insumo** — roteiro da discussão socrática inclui passos do tipo "o mercado diz X sobre esse cargo, nós somos/queremos Y diferente porque…" ancorando auto-reflexão em evidência externa.
- **D-17:** Entrega de 05-04: valor final persistido via formulário `/settings` na web app (campo já existente, ver `src/components/settings/settings-form.tsx`) + documentação do processo/template de perguntas para reuso em outras áreas no futuro.

### Dados e persistência

- **D-18:** Pasta `data/research/` é criada **pela skill no primeiro uso** via `mkdir -p` — mesmo padrão do `ensureSubdir()` em `src/lib/data-service.ts`. **Não é lida pelo app web** (sem repositório TS, sem API route, sem UI). Apenas skills CLI escrevem e leem. Versionada via git no repo de dados separado (`hiring-pipeline-data`, symlink em `data/`).
- **D-19:** **Nenhuma mudança em `src/*`.** Escopo protegido: `src/lib/profile.ts`, `src/lib/vacancy.ts`, `src/lib/settings.ts`, `src/components/settings/settings-form.tsx`, `src/lib/excel-generator.ts` — todos ficam intactos. `aiProfileInstructions` continua como o contexto FIXO da área; pesquisa é o contexto VARIÁVEL por refino.

### Escopo e versão

- **D-20:** Isto **NÃO é v1.1 nem v2.0**. É sobra da v1.0 descoberta após a phase 4 ser marcada como "Complete" no GSD — o bump SemVer (`npm version`) não foi executado ainda, então v1.0 continua aberta na prática. `/fechar-versao` só roda depois que a phase 5 for validada.
- **D-21:** Verificação end-to-end acontece **no sub-plan 05-05** (piloto), não em sub-plan de verificação separado. O piloto é a verificação.

### Claude's Discretion

- Estrutura exata do system prompt da `/pesquisar-mercado` (como pedir para a IA extrair stack/arquétipo de snippets irregulares).
- Heurística de priorização quando há mais jobs candidatos a WebFetch do que a profundidade escolhida permite.
- Formato exato da apresentação dos findings no Step 5 holístico.
- Roteiro detalhado da discussão socrática em 05-04 (perguntas, ordem, critérios de parada).

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

### A criar (nova skill — padrão agnóstico do projeto)

Seguindo o contrato do `AGENTS.md`, toda nova skill tem uma **fonte de verdade** em `.agents/skills/` e **dois apontamentos** (um por ferramenta de IA). Ver padrão existente em `.claude/skills/refinar-perfil/` e `.cursor/skills/refinar-perfil/`.

- `.agents/skills/pesquisar-mercado/SKILL.md` — **fonte de verdade** da nova skill (conteúdo completo)
- `.claude/skills/pesquisar-mercado/SKILL.md` — apontamento para a fonte de verdade (conteúdo curto que referencia o `.agents/`)
- `.cursor/skills/pesquisar-mercado/SKILL.md` — apontamento idem
- `data/research/` — subpasta criada pela própria skill no primeiro uso (via `mkdir -p`, ver D-18)

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

Estrutura sequencial com uma dependência dura (05-02 depende de 05-01) e paralelismo permitido em outros pontos:

- **05-01 — Research e decisão de portais + queries default.** Entregável: lista final de portais BR (3-7) + queries default por senioridade + limites conhecidos documentados. **Bloqueia 05-02.**
- **05-02 — Skill `/pesquisar-mercado` + pasta `data/research/`.** Implementa a skill conforme D-02 a D-08 usando a lista de 05-01.
- **05-03 — Evolução `/refinar-perfil`** (D-11 a D-14). Independente de 05-02 na teoria (pode ser planejado em paralelo), mas melhor executado depois que há pelo menos uma pesquisa real para testar o Step 2 evoluído.
- **05-04 — Definir `aiProfileInstructions` da área P&D/Lyceum** (D-15 a D-17). Pode rodar em paralelo com 05-02/05-03; ganha qualidade se puder consumir output de 05-02.
- **05-05 — Execução piloto** (D-21). Fecha a phase. Depende de 05-02, 05-03 e 05-04 estarem implementados.

</subplans>

<verification>
## Verification End-to-End (executada no sub-plan 05-05)

0. Concluir 05-04 — `aiProfileInstructions` da área P&D/Lyceum preenchido em `/settings` com conteúdo robusto.
1. Rodar `/pesquisar-mercado` com escopo: *"Senior P&D, Java + Python + TS, São Paulo, profundidade média"*.
2. Conferir que `data/research/senior-pd-java-python-ts-sp-2026-04-21.json` existe e tem `jobs[]` não-vazio + `summary` + `profileHints`, usando a lista de portais decidida em 05-01.
3. Rodar `/refinar-perfil` escolhendo um perfil Java existente (ex: `dev-java-pleno`), carregando a pesquisa do passo 2.
4. Verificar que as sugestões de IA **citam explicitamente** stack híbrido e arquétipo de evangelizador, e que o `aiProfileInstructions` da área se reflete no tom — tudo cabendo nos 4 campos do JobProfile (D-01).
5. Completar o ciclo A/R/J, chegar ao **novo Step 5 holístico**, ver findings, aceitar/ignorar/ajustar por item.
6. Confirmar que o JSON salvo em `data/profiles/{id}.json` respeita o schema original e está internamente consistente (título × nível × responsabilidades × qualificações alinhados).
7. Abrir perfil em `/profiles/{id}` na web app — deve renderizar normalmente, sem erros de tipo.
8. Rodar `/abrir-vaga` usando o perfil refinado — confirma downstream OK.
9. Gerar Excel pela web — rótulos configuráveis e estrutura da planilha GH continuam válidos.
10. Rerodar `/pesquisar-mercado` no mesmo escopo no mesmo dia → confirmar que o arquivo sai como `...-2026-04-21-2.json` (D-05).

</verification>
