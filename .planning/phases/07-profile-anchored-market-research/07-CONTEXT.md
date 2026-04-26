# Phase 7: Profile-Anchored Market Research - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Refatoração de `/pesquisar-mercado` para: (1) ancorar toda pesquisa ao ID de um perfil existente, (2) acumular pesquisas por data em pasta dedicada ao perfil, (3) absorver o step de faixas salariais em guias curados (que vivia no `/atualizar-roles-map`) e as técnicas de scraping mais robustas daquela skill. `/atualizar-roles-map` é descontinuada após a migração.

**Em escopo:**
- Refatoração da skill `/pesquisar-mercado`: seleção de perfil, nova estrutura de pastas, step de guias salariais obrigatório, absorção das melhores técnicas de scraping do `/atualizar-roles-map`
- Novo campo `salaryGuide` no schema do `-resumo.json`
- Deprecação da skill `/atualizar-roles-map` (SKILL.md atualizado com migration note)
- Atividade pontual de migração dos arquivos legados `{slug}-{date}-*.json` para a nova estrutura de pastas

**Fora de escopo:**
- UI web de pesquisas (Phase 8)
- Qualquer alteração no schema `JobProfile` em `src/lib/profile.ts`
- Refresh periódico automático de pesquisas (cron)
- Comparação longitudinal entre pesquisas
- Migração automática de legados pela própria skill (migração é manual, pontual)

</domain>

<decisions>
## Implementation Decisions

### Como a skill recebe o perfil

- **D-01:** A skill **sempre exige um perfil** — não existe modo exploratório sem ancorar. Fluxo exploratório é: `/criar-perfil` (cria stub) → `/pesquisar-mercado` (ancora ao stub criado).
- **D-02:** No Step 1, a skill lê `DATA_PATH/profiles/*.json` e exibe uma **lista numerada** dos perfis disponíveis. Cada entrada exibe: `{8 primeiros chars do UUID} | {título} | {experienceLevel}`. O gestor escolhe pelo número — não digita UUID manualmente.

### Estrutura de armazenamento

- **D-03:** Arquivos salvos em **sub-pasta por perfil**: `DATA_PATH/research/{profileId}/{date}-vagas.json` e `DATA_PATH/research/{profileId}/{date}-resumo.json`. O `{date}` é `YYYY-MM-DD`.
- **D-04:** Colisão no mesmo dia → sufixo `-2`, `-3` inserido antes de `-vagas`/`-resumo` (igual ao comportamento atual).
- **D-05:** A skill opera **100% no novo padrão** (sub-pastas). Não há fallback para o padrão antigo de slug. Arquivos legados `{slug}-{date}-*.json` em `DATA_PATH/research/` são **ignorados** pela skill — a migração manual é uma atividade pontual, não responsabilidade da skill.

### Faixas salariais — unificação

- **D-06:** O step de pesquisa em **guias salariais** (Robert Half Guia Salarial TI, Glassdoor BR, Catho/Revelo) é **obrigatório** no fluxo — sempre roda após a coleta de vagas, independente da profundidade escolhida. Latência adicional estimada: +10-15 min.
- **D-07:** As **técnicas de scraping do `/atualizar-roles-map`** são absorvidas para a skill refatorada. O planner deve comparar os dois SKILL.md e preservar o melhor de cada um (ex: se a abordagem do atualizar-roles-map para Glassdoor BR ou Catho era mais robusta, essa técnica prevalece na skill nova).
- **D-08:** O `-resumo.json` passa a ter **dois campos separados** de salary:
  - `salaryRange` — extraído das vagas brutas coletadas (0-N vagas com faixa visível). `null` se nenhuma vaga exibiu faixa. Comportamento atual preservado.
  - `salaryGuide` — faixas curadas de guias salariais. Estrutura: `{ min, max, currency, location, sources: [{ portal, year, url }] }`. `null` se nenhum guia retornou dado confiável.

### Deprecação do `/atualizar-roles-map`

- **D-09:** O SKILL.md do `/atualizar-roles-map` é atualizado para indicar **legado/descontinuado** com migration note apontando para `/pesquisar-mercado`. O arquivo não é deletado — fica como referência histórica.
- **D-10:** O `data/research/roles-map.json` também fica obsoleto (a skill nova não o consome). O pesquisador deve verificar se a skill atual ainda referencia esse arquivo e remover a dependência.

### Claude's Discretion

- Número exato de queries por guia salarial no step de faixas.
- Estrutura exata do array `sources` em `salaryGuide`.
- Ordenação da lista de perfis no Step 1 (alfabética por título ou por data de criação).
- Formatação da exibição do Step 1 (tabela, lista numerada simples, etc.).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skill atual a refatorar

- `.agents/skills/pesquisar-mercado/SKILL.md` — skill base. Planner lê para entender o fluxo atual de 7 steps, o schema dos arquivos gerados e as técnicas de scraping existentes. A refatoração preserva e estende esse fluxo.

### Skill a absorver e deprecar

- `.agents/skills/atualizar-roles-map/SKILL.md` — planner lê para identificar as técnicas de scraping mais robustas de cada portal (especialmente guias salariais: Robert Half, Glassdoor BR, Catho, Revelo) e absorvê-las na skill refatorada.

### Schema imutável

- `src/lib/profile.ts` — schema de `JobProfile`. Imutável. Planner lê para confirmar campos disponíveis (especialmente `title`, `experienceLevel`, `id`) que são usados na lista de seleção do Step 1.

### Persistência e padrões existentes

- `.agents/skills/criar-perfil/SKILL.md` — referência para: como listar profiles de `DATA_PATH/profiles/*.json`, padrão UUID v4, Step 0 de carregamento do `.env.local`.
- `.agents/skills/refinar-perfil/SKILL.md` — referência para: como o `-resumo.json` é consumido (Step 2 do refinar-perfil usa o campo `profileHints`). A refatoração não deve quebrar essa integração.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `DATA_PATH/profiles/*.json` — fonte da lista de perfis para o Step 1. A skill lê diretamente os arquivos JSON, extrai `id`, `title`, `experienceLevel` para exibir a lista numerada.
- Step 0 padrão (source .env.local + validação de DATA_PATH) — replicar idêntico da skill atual.
- Lógica de sanitização de path traversal (Step 5/6 da skill atual) — adaptar para validar `DATA_PATH/research/{profileId}/` em vez de `DATA_PATH/research/`.

### Established Patterns

- **Step 0:** `source .env.local` + validação de `DATA_PATH` — padrão de todas as skills.
- **node -e para salvar JSON:** evitar heredoc por problemas com aspas — padrão da skill atual.
- **Validação de slug/path:** aceitar apenas `[a-z0-9-]` para slugs (preservar para nomes internos); `profileId` é UUID v4 e deve ser validado como tal antes de criar sub-pasta.
- **Playwright MCP:** nunca chamar `browser_close`; verificar disponibilidade antes de usar.

### Integration Points

- `DATA_PATH/research/{profileId}/` — novo destino dos arquivos (a skill cria a sub-pasta se não existir)
- `/refinar-perfil` Step 2 — lista `-resumo.json` para o gestor selecionar; a mudança de estrutura de pastas afeta como o refinar-perfil descobre os arquivos disponíveis. O planner deve verificar se o refinar-perfil precisa ser atualizado para listar recursivamente.

</code_context>

<specifics>
## Specific Ideas

- A lógica de exibição de perfis no Step 1 deve ser à prova de UUID: mesmo que o gestor tenha muitos perfis, a lista numerada com ID curto + título + nível resolve sem ambiguidade.
- O step de guias salariais deve produzir dados com atribuição de fonte explícita (`sources[]`) para que a Phase 8 possa exibir "Faixa salarial segundo Robert Half 2025: R$ X–Y".
- A absorção das técnicas do `/atualizar-roles-map` deve ser **merge consciente**, não substituição: se uma técnica de scraping for idêntica nos dois skills, manter uma versão; se forem complementares (ex: um tem fallback que o outro não tem), absorver ambas.

</specifics>

<deferred>
## Deferred Ideas

- **Atualização do `/refinar-perfil`** para descobrir `-resumo.json` na nova estrutura de sub-pastas: se o refinar-perfil listar arquivos via glob fixo em `DATA_PATH/research/*.json`, vai parar de encontrar os novos. O planner deve investigar e incluir a correção no escopo desta phase ou abrir um plano separado.
- **Comparação longitudinal de pesquisas** (tendência por perfil ao longo do tempo): fora de escopo, mas a estrutura de sub-pastas por perfil criada aqui habilita isso naturalmente.
- **Análise de força com faixas salariais no `/criar-perfil`** (apontada na Phase 6 como deferred): após Phase 7, o `-resumo.json` por perfil incluirá `salaryGuide` — revisar se faz sentido usar isso na análise de força do `/criar-perfil`.

</deferred>

---

*Phase: 07-profile-anchored-market-research*
*Context gathered: 2026-04-26*
