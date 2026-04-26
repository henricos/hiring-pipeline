# Phase 6: Guided Profile Creation Skill - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Skill `/criar-perfil`: o gestor informa um título de cargo → a skill normaliza o título, propõe nível de senioridade inferido, executa análise rápida de força de mercado via WebSearch, exibe o resultado para confirmação e, após confirmação, persiste um perfil mínimo (stub) em `DATA_PATH/profiles/`. O perfil criado é estruturalmente válido e fica pronto para enriquecimento via `/pesquisar-mercado` + `/refinar-perfil`.

**Em escopo:** skill `/criar-perfil` — normalização de título, inferência de nível, análise de força via WebSearch, confirmação, persistência de stub.

**Fora de escopo:**
- Geração de conteúdo descritivo via LLM (vem via `/refinar-perfil`)
- Busca de mercado ao vivo profunda (responsabilidade de `/pesquisar-mercado`)
- Qualquer alteração no schema `JobProfile` em `src/lib/profile.ts` (D-01 — imutável)
- UI web para criar perfis (já existe em `/profiles/new`)
- Dependência do `roles-map.json` (será descontinuado na Phase 7)

</domain>

<decisions>
## Implementation Decisions

### Valores-base e stub

- **D-01:** O perfil criado é um **stub** — criação é rápida (segundos, zero LLM). `title` e `experienceLevel` recebem valores reais derivados da normalização. Todos os campos descritivos (`responsibilities[]`, `qualifications[]`, `behaviors[]`, `challenges[]`) recebem um **placeholder uniforme** indicando que ainda não foram preenchidos.
- **D-02:** Texto sugerido para o placeholder: `"[A ser definido via /pesquisar-mercado e /refinar-perfil]"` (ou equivalente que a IA achar mais natural no momento da implementação — Claude's Discretion no wording exato). Para `qualifications[]`, o item placeholder deve ter `required: false`.
- **D-03:** Sem chamada LLM para popular campos descritivos na criação. O custo zero de LLM é uma propriedade desejável da skill — o enriquecimento real acontece nas skills subsequentes.

### Normalização do título e nível

- **D-04:** A skill recebe um título livre ("dev backend pleno", "engenheiro de dados sênior") e propõe um **título normalizado de mercado** ("Desenvolvedor Backend Pleno", "Engenheiro de Dados Sênior"). A normalização usa LLM com o título como input (não precisa de contexto externo).
- **D-05:** O **nível de senioridade** (`experienceLevel`) é **inferido automaticamente do título** e exibido junto com o título normalizado numa única tela de confirmação: ex: `"Título: Desenvolvedor Backend Pleno | Nível: mid"`. Gestor confirma ambos de uma vez ou ajusta qualquer um.
- **D-06:** O perfil só é criado com o **título confirmado** pelo gestor. Não há criação silenciosa com título não revisado.

### Análise de força de mercado (CRIA-02)

- **D-07:** A análise usa **1-2 queries WebSearch** (Google/LinkedIn, sem Playwright) para estimar a demanda pelo título normalizado no mercado BR. Latência esperada: ~30 segundos.
- **D-08:** A IA classifica a força do título em uma das categorias: **forte** (muitas vagas, título reconhecido), **médio** (vagas existem mas título é menos padronizado), **fraco** (poucas vagas com esse título exato), **nicho** (título muito específico — pode ser correto, mas mercado menor).
- **D-09:** Se o título for classificado como **fraco ou não reconhecido**, a análise deve sugerir **títulos alternativos** mais comuns para o mesmo papel (ex: "Staff Engineer" → poucos resultados em PT; sugestão: "Engenheiro de Software Staff" ou "Principal Engineer"). O gestor pode adotar a sugestão ou manter o título original.
- **D-10:** Sem dependência do `roles-map.json` — ele será descontinuado na Phase 7 e esta skill não deve criar acoplamento com ele.

### Confirmação e persistência

- **D-11:** Antes de salvar, o gestor vê um **preview enxuto**: título normalizado + nível + resultado da análise de força (classificação + alternativas se fraco). Campos descritivos placeholder não são exibidos no preview — o gestor já sabe que estarão em branco.
- **D-12:** Após confirmação, a skill persiste o perfil em `DATA_PATH/profiles/{uuid}.json` seguindo o schema existente de `JobProfile` (sem criar novos campos). ID gerado como UUID v4, igual ao padrão das outras skills.
- **D-13:** Após salvar, a skill exibe o ID do perfil criado e sugere próximos passos: `/pesquisar-mercado` (para enriquecer com dados reais) → `/refinar-perfil` (para iterar com IA).

### Claude's Discretion

- Wording exato do texto placeholder nos campos descritivos.
- Número exato de queries WebSearch (1 ou 2) e queries específicas para a análise de força.
- Formato visual da tela de confirmação (compacto vs. estruturado).
- Critério exato de classificação de força (thresholds de contagem de vagas para forte/médio/fraco/nicho).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema imutável (D-01)

- `src/lib/profile.ts` — schema de `JobProfile`. **Não alterar nesta phase.** Planner deve ler para saber quais campos existem e seus tipos (`responsibilities: string[]`, `qualifications: ProfileItem[]` com `{ text: string, required: boolean }`, `behaviors: string[]`, `challenges: string[]`, `title: string`, `experienceLevel: string`).

### Padrão de skills existentes

- `.agents/skills/refinar-perfil/SKILL.md` — skill mais similar em domínio. Referência para: padrão de carregamento de `DATA_PATH` via `source .env.local`, pattern de Step 0, estrutura de fluxo multi-step.
- `.agents/skills/pesquisar-mercado/SKILL.md` — referência para: como WebSearch é usada na skill, como arquivos são salvos em `DATA_PATH/research/`, guardrails de privacidade e sanitização de path.
- `.agents/skills/abrir-vaga/SKILL.md` — referência de estilo de confirmação e persist via UUID.

### Settings e persistência

- `src/lib/settings.ts` — schema de `AreaSettings`. Campo `aiProfileInstructions` carregado via `DATA_PATH/settings.json` (usado pelo `/refinar-perfil`; `/criar-perfil` não precisa injetar no contexto de criação, mas o planner deve confirmar se há valor a passar na sugestão de próximo passo).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/lib/profile.ts` — `JobProfile` type + `createProfile` server action: o planner pode verificar se a action pode ser chamada diretamente da skill via `curl` / `fetch` ou se a skill escreve diretamente no JSON (padrão atual das skills é escrita direta via `DATA_PATH`).
- `src/lib/repositories/` — `JsonProfileRepository` com `ensureSubdir()` pattern: a skill pode replicar o mesmo padrão de escrita direta em `DATA_PATH/profiles/` sem passar pela web app.

### Established Patterns

- **Step 0:** Toda skill começa com `source .env.local` e valida `DATA_PATH`.
- **UUID v4:** IDs de perfil são `crypto.randomUUID()` ou equivalente no Node — a skill deve replicar.
- **Escrita direta:** Skills escrevem JSON diretamente em `DATA_PATH/`; não chamam server actions da web app.

### Integration Points

- `DATA_PATH/profiles/` — destino dos arquivos criados
- `DATA_PATH/settings.json` — fonte do `aiProfileInstructions` (para a sugestão de próximos passos contextualizada, se necessário)

</code_context>

<specifics>
## Specific Ideas

- Gestor vê a análise de força **antes** de confirmar o título — se o título for fraco, pode corrigir antes de criar o perfil (evita retrabalho de renomear depois).
- A skill é a porta de entrada do fluxo completo `criar → pesquisar → refinar` do milestone v1.1.
- Criação rápida como stub é intencional: o valor está na análise de força e no ID do perfil gerado, não no conteúdo descritivo inicial.

</specifics>

<deferred>
## Deferred Ideas

- **Sugestão de pesquisa pré-carregada:** Ao criar o perfil, oferecer já no mesmo step "Quer rodar `/pesquisar-mercado` agora?" — isso seria uma integração entre skills que vai além do escopo desta phase.
- **Análise de força com faixas salariais:** Quando o `roles-map.json` for descontinuado (Phase 7) e os `-resumo.json` por perfil estiverem disponíveis, a análise de força pode incluir faixas salariais reais. Revisar após Phase 7.

</deferred>

---

*Phase: 06-guided-profile-creation-skill*
*Context gathered: 2026-04-25*
