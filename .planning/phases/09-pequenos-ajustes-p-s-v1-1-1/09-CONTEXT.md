# Phase 9: Pequenos ajustes pós-v1.1.1 - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Coletânea de 7 ajustes de continuidade após a release v1.1.1, escolhidos pelo gestor a partir de uso real do produto em produção. Não introduz nova capability; corrige bugs, ajusta UX e desbloqueia operação em ambiente com `DATA_PATH` read-only.

Itens em escopo:
1. Excel: campo "informações adicionais" não respeita quebras de linha e fica centralizado
2. Excel: rota de download falha em prod (DATA_PATH read-only)
3. UI: botão de download do xlsx no card da lista de vagas
4. UI: textareas multi-linha em "Conteúdo Descritivo" do perfil
5. UI: gráfico de barras horizontais em "Stack Frequência" do Resumo de Mercado
6. Bug: arquétipos renderizam como "undefined (X menções)" — schema mismatch
7. UX: simplificar comportamento multi-pesquisa (default = mais recente, sem switcher)

Fora de escopo: novos requirements, nova capability, qualquer item não listado acima.

</domain>

<decisions>
## Implementation Decisions

### Item 1 — Excel: campo "informações adicionais" sem quebra de linha

- **D-01:** Célula `B59` do template `data/templates/requisicao-de-pessoal.xlsx` precisa ter `alignment` com `horizontal="left"`, `vertical="top"` e `wrapText="1"`. Hoje provavelmente está centralizada e sem wrap.
- **D-02:** No gerador `src/lib/excel-generator.ts`, garantir que o `<t>` do `inlineStr` preserve whitespace (`xml:space="preserve"`) ao escrever valores com `\n`. Sem isso, o XML pode normalizar/colapsar quebras antes do Excel renderizar.
- **D-03:** Comportamento esperado após o fix: texto multi-linha digitado em "Configurações da Área → Informações adicionais" aparece no Excel exportado com quebras respeitadas, alinhado à esquerda/topo, com wrap.

### Item 2 — Excel output em produção (DATA_PATH read-only)

- **D-04:** Eliminar o cache de xlsx em `src/app/api/vacancies/[id]/form/route.ts`. Hoje (linha 59) só regenera se arquivo não existe ou `?regen=1`. Passa a regenerar a cada request.
- **D-05:** Saída do xlsx vai para `os.tmpdir()` (resolve `/tmp` em container Linux, `/var/folders/...` em macOS dev — Node nativo, zero hardcode). Nome do arquivo deve ser único por request (ex: incluir timestamp/uuid) ou usar o utilitário de tempfile do Node.
- **D-06:** Sem nova env var. Sem segundo volume RW. Compose/k8s não muda.
- **D-07:** A query `?regen=1` deixa de ser necessária (cache não existe mais). Pode ser removida ou tornar-se no-op silencioso. Caller atual: botão de download na página de edit (`src/app/(shell)/vacancies/[id]/edit/page.tsx:73`).
- **D-08:** Trade-off considerado e descartado: segundo volume RW montado pra persistir xlsx (rejeitado pelo gestor: "não faço questão de guardar o xlsx" — persistência não é requisito).
- **Claude's Discretion:** Apagar o arquivo após streaming vs. deixar `/tmp` acumular até restart do container. Single-user, baixo tráfego — qualquer abordagem aceitável.

### Item 3 — Botão de download na lista de vagas

- **D-09:** Adicionar botão de download do xlsx no card da `/vacancies`, ao lado dos botões existentes (Pencil = editar, Trash2 = excluir).
- **D-10:** Mesma rota `GET /api/vacancies/[id]/form` que já existe (sem `?regen=1` — vide D-07).
- **D-11:** Ordem dos botões aprovada: `[Download] [Edit] [Delete]` (ações destrutivas por último).
- **D-12:** Padrão visual: `Button variant="ghost" size="icon"` + ícone `Download` de `lucide-react` + `min-h-[40px] min-w-[40px]` + `aria-label` apropriado — idêntico ao padrão dos outros dois ícones do card.
- **D-13:** Trigger de download via `<a href={...} download>` (precisa de `<a>` cru, não `<Link>` do Next, pra browser disparar download de attachment).

### Item 4 — Conteúdo Descritivo: textareas multi-linha

- **D-14:** Trocar `<Input>` por `<textarea rows={2}>` nos componentes `src/components/ui/dynamic-list-field.tsx` e `src/components/ui/profile-item-field.tsx`.
- **D-15:** Aplicar `resize-none` no Tailwind — caixas com altura **uniforme** (gestor pediu explicitamente). Texto que não couber em 2 linhas usa scroll interno do próprio textarea.
- **D-16:** Aplica nas 4 sub-seções de "Conteúdo Descritivo" do `ProfileForm`: Responsabilidades, Requisitos, Comportamentais, Desafios.
- **D-17:** Manter botão "Obrigatório/Diferencial" com **label completo** (não abreviar pra "O/D"). Avaliar legibilidade depois do textarea — se ficar apertado, item separado.
- **D-18:** Comportamento de Enter: textarea quebra linha por padrão (esperado). Submit do form continua via botão "Salvar".
- **D-19:** Trade-offs considerados e descartados: auto-grow textarea (cria cards de altura variável — rejeitado pelo gestor); `resize-y` manual (assimetria visual entre items — rejeitado pelo gestor); abreviação O/D agora (rejeitado: testar primeiro com label completo).
- **Claude's Discretion:** alinhamento vertical do botão `Obrigatório/Diferencial` e do botão `[×]` quando o textarea tem 2 linhas — provavelmente trocar `items-center` por `items-start` na flex row do `ProfileItemField`.

### Item 5 — Stack Frequência: gráfico de barras

- **D-20:** Renderizar a seção "Stack Frequência" do `src/components/profile/profile-detail-resumo.tsx` (linhas 219-238) como barras horizontais.
- **D-21:** Implementação em **CSS puro**, sem chart library (sem Recharts, Chart.js, Visx). Trade-off rejeitado: +50-150kb de bundle pra 1 gráfico simples.
- **D-22:** Largura da barra computada como `(count / maxCount) * 100%`. `maxCount` derivado do primeiro item já ordenado.
- **D-23:** Manter visíveis em cada linha: nome da tech + quantidade ("X menções") — requisito hard do gestor ("não pode perder informacoes").
- **D-24:** Preservar sort desc por count (já existe na linha 99-100 — não mexer na ordenação).
- **D-25:** Não aplicar a "Stack Emergente" (linhas 255+ do mesmo arquivo) — hoje é lista de strings sem `count`, não há dado quantitativo pra barra.
- **Claude's Discretion:** cor exata da barra (sugestão: tonal `bg-tertiary/30` ou `bg-primary/20`, alinhar com tema do design system); largura mínima de barra para o menor item (evitar invisibilidade); responsivo mobile.

### Item 6 — Bug: arquétipos renderizam "undefined"

- **D-26:** Causa raiz confirmada: schema mismatch entre canônico e código. Skill `.agents/skills/pesquisar-mercado/SKILL.md` (linha 283) e dados reais (`data/research/.../resumo.json`) usam o campo `archetype`. Componente `src/components/profile/profile-detail-resumo.tsx` (linhas 17 e 55-59) lê `arch.name`, que é undefined.
- **D-27:** Fix de código: atualizar o tipo `archetypes?: Array<{ archetype: string; count?: number; percentage?: number } | string>` e a função `renderArchetype` para ler `arch.archetype`.
- **D-28:** Aproveitar para incluir `percentage` na renderização (existe nos dados reais e é mais informativo que `count` puro). Ex: `"arquiteto técnico — 12 menções (57%)"`.
- **D-29:** Fix de teste: o mock em `src/components/profile/profile-detail-resumo.test.tsx` (linhas ~50) usa `name` — passou enganado, não detectou o bug. Atualizar para `archetype` (alinhar com schema canônico).
- **D-30:** Auditoria colateral: comparar **todos** os campos do `summary` que o componente consome (`stackFrequency`, `archetypes`, `salaryRange`, `salarySource`, `trends`, `redFlags`, `commonChallenges`, etc.) contra o schema declarado na `SKILL.md`. Schema mismatch silencioso pode existir em outros lugares — corrigir o que encontrar.
- **D-31:** Princípio reforçado: mocks de teste **nunca devem inventar campos** — devem refletir o schema canônico (SKILL.md ou tipo TS importado).

### Item 7 — Comportamento multi-pesquisa: simplificar UI

- **D-32:** Default em ambas as abas (Vagas de Mercado e Resumo de Mercado) = pesquisa **mais recente**. Já é o comportamento atual em ambas — manter.
- **D-33:** Sempre exibir a data da pesquisa nas duas abas, **incondicionalmente** (não apenas quando há mais de uma). Hoje:
  - Resumo (`profile-detail-resumo.tsx` linha 119): só mostra "Resumo de: {date}" quando `researches.length > 1` — corrigir pra mostrar sempre.
  - Vagas (`profile-detail-vagas.tsx` linha 84): mostra "— {date}" quando há 1 pesquisa, e via `<select>` quando >1 — após D-34 a exibição passa a ser uniforme.
- **D-34:** **Remover** o switcher de pesquisa (`<select>` + estado `selectedDate`) de `profile-detail-vagas.tsx`. UI passa a ser read-only da mais recente.
- **D-35:** Pesquisas históricas continuam sendo persistidas no **repo separado montado em `/data`** (versionamento próprio fora deste repo de aplicação). Esse repo já é onde tudo de DATA_PATH é guardado. Zero limpeza automática.
- **D-36:** Trade-off considerado e rejeitado pelo gestor: manter switcher (caso de uso de comparação ad-hoc tela-por-tela não compensa complexidade de UI; análise temporal cross-pesquisa será feita offline / em fase futura sobre os arquivos versionados no repo de `/data`).
- **D-37:** Limpeza colateral obrigatória: testes que cobrem o switcher de Vagas (`src/components/profile/profile-detail-vagas.test.tsx`) precisam ser atualizados/removidos. Não deixar testes RED nem testes que cobrem código removido.

### Claude's Discretion (consolidado)

- Item 2: cleanup do xlsx pós-stream (deletar vs deixar `/tmp` acumular)
- Item 3: aria-labels precisos pros 3 botões do card de vaga
- Item 4: alinhamento vertical do botão "Obrigatório/Diferencial" e botão `[×]` em relação ao textarea de 2 linhas
- Item 5: cor exata da barra do gráfico, largura mínima, comportamento responsivo
- Item 6: formato de string ao incluir `percentage` (ex: `"X — N menções (P%)"` ou outra variação legível)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level
- `.planning/PROJECT.md` — visão, princípios, não-negociáveis
- `.planning/REQUIREMENTS.md` — catálogo de requirements
- `.planning/STATE.md` — estado corrente do milestone v1.1 estendido
- `.planning/ROADMAP.md` — onde Phase 9 está formalizada

### Schema canônico (relevante para Item 6 — auditoria de schema)
- `.agents/skills/pesquisar-mercado/SKILL.md` §Estrutura do `-resumo.json` — schema autoritativo de `summary.archetypes[]` (campo `archetype`, não `name`), `stackFrequency`, `salaryRange`, etc. Toda renderização e todo mock de teste deve refletir esse schema.

### Decisões de UX já tomadas em fases anteriores que valem para Phase 9
- `.planning/STATE.md` §"Decision Log → Phase 8 — Correção de UX pós-release (v1.1.1, 2026-04-27)" — fluxo canônico `/profiles → lápis → /profiles/[id]` (3 abas: Perfil/Vagas do Mercado/Resumo) + decisões de não-reverter (rota `/edit` removida, `ProfileDetailPerfil` removido, click no row removido).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — shadcn Button já usado consistentemente (`variant="ghost"`, `size="icon"`); reutilizar pra Item 3 (download button).
- `src/components/ui/input.tsx` e textarea (instalada via shadcn) — checar se `Textarea` shadcn já está no projeto pra Item 4; se não, instalar via `npx shadcn add textarea`.
- `lucide-react` — pacote de ícones já em uso (`Pencil`, `Trash2`); usar `Download` pro Item 3.
- `src/lib/excel-generator.ts` — gerador cirúrgico via adm-zip preserva `s=` (estilo) da célula do template (linha 467). Item 1 → fix está no template + possivelmente no `<t>` (whitespace preserve), não no mapeamento de células.
- `src/app/api/vacancies/[id]/form/route.ts` — rota de download já existe e já serve attachment com filename slug. Item 3 só pluga novo botão nessa rota; Item 2 reescreve o storage interno dela.

### Established Patterns
- **Server Actions** para mutações; **Route Handlers** para downloads/streams binários (já usado pra xlsx).
- **Repository pattern** (`profileRepository`, `vacancyRepository`, `settingsRepository`, `researchRepository`) — Items 1, 2, 3 não tocam no data layer; Items 5, 6, 7 só consomem `researchRepository`.
- **Tabs canonical pattern** em `src/components/profile/profile-detail-tabs.tsx` — Items 5, 6, 7 vivem dentro do `ProfileDetailResumo`/`ProfileDetailVagas` montados nessa estrutura.
- **Tailwind tokens** do design system: `bg-surface-container-low`, `text-on-surface/60`, `text-tertiary`, etc. Item 5 (cor da barra) deve usar esses tokens, não cores cruas.
- **Item 6 lesson:** mocks de teste passaram com schema errado — testes passavam, bug ia pra prod. Princípio: mock de teste sempre espelha schema canônico declarado em `.agents/skills/.../SKILL.md` ou tipo TS importado.

### Integration Points
- `src/lib/env.ts` — schema Zod do env. Phase 9 **não adiciona** env var nova (vide D-06).
- `compose.yaml` / `Dockerfile` — Phase 9 **não muda** infra de deploy (vide D-06).
- `data/templates/requisicao-de-pessoal.xlsx` — arquivo binário do template; Item 1 exige edição direta de estilo da célula B59 (via Excel ou ferramenta de edição XLSX) **ou** patch programático no gerador.

</code_context>

<specifics>
## Specific Ideas

- Item 1: gestor verificou empiricamente que o textarea em `/settings → Informações adicionais` aceita `\n` corretamente — quebras estão preservadas no JSON do `AreaSettings`. Bug é puramente downstream (template + serialização XLSX).
- Item 2: gestor explicitou "não faço questão de guardar o xlsx" — descarta cache, descarta segundo volume.
- Item 3: gestor aprovou explicitamente a ordem `[Download] [Edit] [Delete]`.
- Item 4: gestor pediu **caixas iguais** ("para não ter caixas de tamanho diferente") — descarta auto-grow e resize manual; força `resize-none`.
- Item 5: gestor aprovou explicitamente a sugestão "barras horizontais em CSS puro, sem library". Hard requirement: nome da tech + quantidade visíveis ("não pode perder informacoes").
- Item 6: profile concreto onde o bug se manifesta: `8b09c8eb-6db0-454b-9abd-4bab1ac2dded` (Staff Engineer pelos dados de `archetypes`). Resumo file: `data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json`.
- Item 7: gestor esclareceu que `/data` neste repo é gitignored, mas existe um **outro repo** versionado montado em `/data` onde o histórico é guardado. Decisão de remover o switcher é informada por essa garantia de persistência externa, não por descartar o histórico.

</specifics>

<deferred>
## Deferred Ideas

- **Dashboard comparativo cross-pesquisa** (evolução temporal de stack/salário/arquétipos): mencionado durante discussão do Item 7. Opera sobre o repo versionado em `/data` diretamente. **Fase futura**, não Phase 9.
- **Abreviação dos labels "Obrigatório/Diferencial"** para "O/D": considerado e adiado (Item 4 — D-17). Reavaliar **após** o ajuste pro textarea, se a UI ficar apertada.
- **Auditoria de uso real de `?regen=1`** depois de remover o cache (Item 2): se ninguém mais depender do parâmetro, removê-lo silenciosamente; caso contrário, manter como no-op com log. Decisão dentro da execução.

</deferred>

---

*Phase: 09-pequenos-ajustes-p-s-v1-1-1*
*Context gathered: 2026-04-27*
