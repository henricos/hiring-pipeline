# Phase 8: Market Research Frontend - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Criação da tela de detalhe de perfil (`/profiles/[id]`) com três abas — Perfil, Vagas, Resumo de Mercado — exibindo dados de pesquisa de mercado ancorados ao `profileId`. A tela é nova: atualmente `/profiles/[id]` não existe como página (só o sub-path `/profiles/[id]/edit`).

**Em escopo:**
- Nova rota `/profiles/[id]` (page.tsx) com layout de abas (Perfil / Vagas / Resumo de Mercado)
- Ajuste no `profile-list.tsx`: click no card navega para `/profiles/[id]` em vez de `/profiles/[id]/edit`; botões de editar e deletar permanecem no card
- Aba **Perfil**: visão leitura dos campos do perfil (sem inputs), organizada por seções; botão "Editar" no topo navega para `/profiles/[id]/edit`
- Aba **Vagas**: lista de pesquisas em ordem cronológica reversa (data, cargo, contagem de vagas); cada linha expande inline ao clicar, mostrando vagas brutas do `-vagas.json` (título, empresa, porte, stack, snippet)
- Aba **Resumo de Mercado**: exibe todos os campos do `-resumo.json` mais recente — commonTitles, titleAliases, stackFrequency completo, salaryRange, salaryGuide, emergingStack, commonBehaviors, commonChallenges, archetypes, profileHints
- Server action / repositório para listar arquivos em `DATA_PATH/research/{profileId}/` e ler seus JSONs
- Instalação do componente tabs (shadcn/radix-ui) se necessário

**Fora de escopo:**
- Qualquer alteração no schema `JobProfile` em `src/lib/profile.ts`
- Edição de pesquisas ou re-execução de `/pesquisar-mercado` a partir da UI
- Comparação entre pesquisas (longitudinal / tendência)
- Exportação ou compartilhamento de dados de pesquisa

</domain>

<decisions>
## Implementation Decisions

### Navegação

- **D-01:** O click no card da lista `/profiles` navega para `/profiles/[id]` (nova tela de detalhe). Os botões "Editar" e "Deletar" continuam visíveis no card da lista — comportamento de click no body do card muda para abrir detalhe.
- **D-02:** Na tela de detalhe, um botão "Editar" no cabeçalho navega para `/profiles/[id]/edit` (rota existente, sem alteração).

### Aba Perfil

- **D-03:** A aba "Perfil" renderiza os campos do perfil em **modo leitura** — texto limpo por seções (Responsabilidades, Qualificações com badge obrigatório/desejável, Competências Comportamentais, Desafios). Sem form inputs.
- **D-04:** Campos opcionais vazios (internalNotes, educationCourse, etc.) são omitidos da visão leitura — não exibir seções vazias.

### Aba Vagas (VIZ-01 + VIZ-03)

- **D-05:** Lista as pesquisas em **ordem cronológica reversa** (mais recente primeiro). Cada linha exibe: data formatada (YYYY-MM-DD), título do cargo da pesquisa (`profileTitle`), contagem de vagas brutas.
- **D-06:** Click em uma linha da lista **expande inline** (accordion), revelando as vagas do `-vagas.json` correspondente. Cada vaga mostra: título, empresa, porte estimado, stacks (array), snippet/descrição se disponível. Apenas uma pesquisa pode estar expandida por vez (ou múltiplas — Claude's Discretion).
- **D-07:** Se não houver nenhuma pesquisa para o perfil, exibir empty state informativo com instrução para rodar `/pesquisar-mercado` via skill.

### Aba Resumo de Mercado (VIZ-02)

- **D-08:** Exibe o `-resumo.json` **mais recente** (maior data). Se houver múltiplas pesquisas, mostra qual data está sendo exibida com opção simples de trocar (select ou botões de data — Claude's Discretion).
- **D-09:** Exibe **todos os campos** do resumo: commonTitles, titleAliases, stackFrequency completo (ordenado por frequência decrescente), salaryRange, salaryGuide (com atribuição de fontes), emergingStack, commonBehaviors, commonChallenges, archetypes, profileHints.
- **D-10:** `stackFrequency` exibido como lista ranqueada (nome + contagem), não como gráfico — mantém consistência com o design system atual (sem biblioteca de charts).
- **D-11:** Se `salaryGuide` tiver `sources[]`, exibir com atribuição: "Segundo Robert Half 2025: R$ X–Y".
- **D-12:** Empty state se não houver nenhum `-resumo.json` para o perfil.

### Claude's Discretion

- Instalação do componente tabs via `npx shadcn@latest add tabs` (radix-ui já está no package.json — deve funcionar).
- Accordion único ou múltiplo para expansão de pesquisas na aba Vagas.
- Se/como exibir seletor de data na aba Resumo (pode ser um `<select>` simples ou botões de data).
- Estrutura interna do Server Action para listar e ler arquivos de `DATA_PATH/research/{profileId}/`.
- Ordenação dos archetypes (por contagem decrescente, provavelmente já vem ordenado do JSON).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Estrutura de dados de pesquisa

- `data/research/2386bf16-4519-409c-9188-45068255df75/2026-04-24-resumo.json` — exemplo real de `-resumo.json` com todos os campos: commonTitles, titleAliases, stackFrequency, salaryRange, salaryGuide, emergingStack, commonBehaviors, commonChallenges, archetypes, profileHints. Planner lê para entender os tipos TypeScript a derivar.
- `data/research/2386bf16-4519-409c-9188-45068255df75/2026-04-24-vagas.json` — exemplo real de `-vagas.json` com o array `jobs[]` (título, empresa, companySize, stack[], snippet, salaryRange, behaviors, archetype). Planner lê para definir o subset a exibir na expansão inline.

### Contexto da Phase 7 (estrutura de pastas)

- `.planning/phases/07-profile-anchored-market-research/07-CONTEXT.md` — decisões D-03 a D-05: estrutura `DATA_PATH/research/{profileId}/{date}-vagas.json` e `{date}-resumo.json`; nenhuma quebra retroativa esperada.

### Schema de perfil (imutável)

- `src/lib/profile.ts` — schema completo de `JobProfile` com todos os campos a renderizar na aba Perfil (modo leitura).

### Padrões de UI existentes

- `src/app/(shell)/profiles/page.tsx` — padrão de página de listagem (layout, heading, Suspense pattern).
- `src/app/(shell)/profiles/[id]/edit/page.tsx` — padrão de página de detalhe de perfil (params assíncrono, notFound, layout).
- `src/components/profile/profile-list.tsx` — componente a ajustar para mudar click do card para `/profiles/[id]`.
- `src/app/globals.css` — design tokens: cores surface, on-surface, tertiary, outline-variant; escala tipográfica; gradient-cta.

### Repositório de perfis (padrão de acesso a dados)

- `src/lib/repositories/profile-repository.ts` — padrão para criar repositório análogo de pesquisas (listar arquivos, ler JSON por profileId).

### Components shadcn disponíveis

- `src/components/ui/badge.tsx` — para badges "obrigatório"/"desejável" na aba Perfil.
- `src/components/ui/button.tsx` — para botão "Editar" e ações.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`profile-list.tsx`** — componente Client existente com cards de perfil; ajuste cirúrgico para mudar o alvo do click do card de `href="/profiles/${profile.id}/edit"` para `href="/profiles/${profile.id}"`.
- **`Badge`** (`src/components/ui/badge.tsx`) — reutilizar para marcar qualificações como "Obrigatório" / "Desejável" na aba Perfil leitura.
- **`Button`** — botão "Editar" no cabeçalho da tela de detalhe.
- **`data-service.ts`** — `ensureSubdir()` e pattern de acesso ao `DATA_PATH` via `env.DATA_PATH`; novo repositório de pesquisas segue o mesmo padrão.

### Established Patterns

- **Server Components async** — páginas usam `async function Page({ params })` com `await params` (Next.js 16 pattern já estabelecido no projeto).
- **Suspense + fallback** — pages envolvem o conteúdo assíncrono em `<Suspense>` com fallback de texto simples.
- **`notFound()`** — retorno padrão quando recurso não encontrado (ver `edit/page.tsx`).
- **fs + path** — acesso a arquivos JSON via `fs.readFileSync` / `fs.readdirSync` dentro de Server Actions ou repositórios; sem fetch HTTP interno.
- **`"use server"` / `"use client"` explícito** — Server Actions marcadas com `"use server"`, componentes interativos com `"use client"`.

### Integration Points

- **`/profiles/[id]/page.tsx`** (nova) — rota nova que não existe; criar `src/app/(shell)/profiles/[id]/page.tsx`.
- **`profile-list.tsx`** — único arquivo a ajustar na listagem existente (mudança de link do card).
- **`DATA_PATH/research/{profileId}/`** — novo sub-path de dados lido pelo novo repositório de pesquisas.
- **Tabs component** — nenhum componente de tabs existe no projeto; instalar via `npx shadcn@latest add tabs` antes de implementar.

</code_context>

<specifics>
## Specific Ideas

- O design da visão leitura da aba Perfil deve respeitar o vocabulário visual do design system: seções com heading `text-title-md`, listas com bullet `•`, badges para qualificações. Nada de inputs ou formulário.
- A expansão inline de pesquisas na aba Vagas pode usar o componente Accordion do shadcn (se disponível) ou implementação simples com estado local.
- `salaryGuide.sources[]` deve aparecer como atribuição explícita por fonte, por exemplo: "Robert Half Guia TI 2025: R$ 10.000 – R$ 18.000".
- O seletor de data na aba Resumo (quando há múltiplas pesquisas) deve ser minimalista — um `<select>` simples com as datas disponíveis é suficiente.

</specifics>

<deferred>
## Deferred Ideas

- **Comparação longitudinal de pesquisas** — tendência de stack e salário ao longo do tempo para um mesmo perfil. Estrutura de pastas desta phase já habilita isso; feature para v1.2.
- **Re-execução de `/pesquisar-mercado` via UI** — botão "Nova pesquisa" que acione a skill a partir do frontend. Fora do escopo do v1 (skills são CLI-only).
- **Exportação do Resumo de Mercado** — PDF ou texto formatado para compartilhamento. Deferred.

</deferred>

---

*Phase: 08-market-research-frontend*
*Context gathered: 2026-04-26*
