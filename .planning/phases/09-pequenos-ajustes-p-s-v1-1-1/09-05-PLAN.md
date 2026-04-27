---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/profile/profile-detail-resumo.tsx
  - src/components/profile/profile-detail-resumo.test.tsx
autonomous: true
requirements: []
context_items: [item-5, item-6]
decisions_addressed: [D-20, D-21, D-22, D-23, D-24, D-25, D-26, D-27, D-28, D-29, D-30, D-31]

must_haves:
  truths:
    - "Stack Frequência aparece como barras horizontais em CSS puro (sem chart library), preservando ordem por count desc"
    - "Cada item da Stack Frequência mostra nome da tech + 'X menções' visíveis (não substitui texto pela barra)"
    - "Stack Emergente continua sendo lista simples (sem barra — D-25)"
    - "Arquétipos renderizam o nome correto (campo 'archetype', não 'name'); inclui percentage quando presente: 'arquiteto técnico — 12 menções (57%)'"
    - "Mock de teste reflete o schema canônico (campo 'archetype', com 'count' e 'percentage')"
    - "Auditoria colateral identifica e/ou corrige outros campos do summary divergentes do schema canônico declarado em .agents/skills/pesquisar-mercado/SKILL.md"
    - "Quando 'salaryRange.note' está presente nos dados, é renderizado embaixo da faixa salarial (D-30 — render-now)"
    - "Quando 'salaryGuide.sources[i].url' está presente, é renderizado como link <a> ao lado do portal+year (D-30 — render-now)"
  artifacts:
    - path: "src/components/profile/profile-detail-resumo.tsx"
      provides: "Stack Frequência com barras horizontais; Archetype tipado e renderizado corretamente; render condicional de salaryRange.note e salaryGuide.sources[].url (D-30 render-now); auditoria documentada nos comentários"
    - path: "src/components/profile/profile-detail-resumo.test.tsx"
      provides: "Mock com archetypes usando 'archetype' (não 'name'); fixtures com salaryRange.note e salaryGuide.sources[].url; novos asserts cobrindo barras, percentage, note e url"
  key_links:
    - from: "src/components/profile/profile-detail-resumo.tsx"
      to: "data/research/{profileId}/{date}-resumo.json (campo summary.archetypes[].archetype)"
      via: "renderArchetype lê arch.archetype"
      pattern: "arch\\.archetype"
    - from: "src/components/profile/profile-detail-resumo.test.tsx"
      to: ".agents/skills/pesquisar-mercado/SKILL.md (schema canônico)"
      via: "fixture mockResumoContent.summary.archetypes"
      pattern: "archetype:"
---

<objective>
Implementar Items 5 e 6 do CONTEXT.md de Phase 9 num único plano (mesmo arquivo,
`profile-detail-resumo.tsx` + seu teste; reduz risco de merge e mantém context budget).

**Item 5 — Stack Frequência como barras horizontais (D-20..D-25):**
- Renderizar `summary.stackFrequency` como barras horizontais em CSS puro (D-21, sem chart library).
- Largura = `(count / maxCount) * 100%`, com `maxCount = sortedStack[0][1]` (D-22).
- Manter visíveis o nome da tech e a contagem "X menções" em CADA linha (D-23 — hard requirement).
- Preservar sort desc por count já existente (D-24).
- NÃO aplicar a Stack Emergente (D-25 — é lista de strings sem count).

**Item 6 — Bug arquétipos "undefined" + auditoria (D-26..D-31):**
- Atualizar tipo: `archetypes?: Array<{ archetype: string; count?: number; percentage?: number } | string>` (D-27).
- `renderArchetype` lê `arch.archetype` (não `arch.name`); inclui `percentage` quando presente: `"arquiteto técnico — 12 menções (57%)"` (D-28; Claude Discretion no formato).
- Atualizar mock em `profile-detail-resumo.test.tsx` para refletir schema canônico (D-29, D-31).
- **Auditoria colateral (D-30):** comparar todos os campos do `summary` consumidos pelo componente (`stackFrequency`, `archetypes`, `salaryRange`, `salarySource`, `commonTitles`, `titleAliases`, `commonBehaviors`, `commonChallenges`, `trends`, `redFlags`, `emergingStack`, `salaryGuide`) contra o schema declarado em `.agents/skills/pesquisar-mercado/SKILL.md` §6.1. Documentar findings em comentários no arquivo; **corrigir o que encontrar** — incluindo renderizar campos primitivos de baixo custo que aparecem nos dados reais (Task 4).

**Render-now-vs-defer (D-30, decisão do orquestrador em modo auto):**
| Campo | Decisão | Justificativa |
|---|---|---|
| `summary.salaryRange.note` | **Render** (Task 4) | string opcional, presente em dados reais, posicionamento óbvio embaixo da faixa |
| `summary.salaryGuide.sources[].url` | **Render como `<a>`** (Task 4) | rastreabilidade de fonte; risco mínimo |
| `summary.salaryGuide.sources[].percentiles` | Defer | UI de percentis exige formatação específica — fase futura |
| `summary.salaryGuide.currency` | Defer | requer normalização (R$/USD) — fase futura |
| `summary.salaryGuide.location` | Defer | só vale com formatação geográfica — fase futura |
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md
@CLAUDE.md
@AGENTS.md
@.agents/skills/pesquisar-mercado/SKILL.md
@src/components/profile/profile-detail-resumo.tsx
@src/components/profile/profile-detail-resumo.test.tsx
@data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json
</context>

<interfaces>
<!-- Schema canônico de summary.archetypes[] (extraído de .agents/skills/pesquisar-mercado/SKILL.md §6.1
     e validado contra data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json) -->

```jsonc
// summary.archetypes[]
[
  { "archetype": "arquiteto técnico",  "count": 12, "percentage": 57 },
  { "archetype": "engenheiro de produto", "count": 4, "percentage": 19 }
  // pode ser string suelta também — heurística histórica
]

// summary.stackFrequency
{ "Java/Kotlin": 9, "Sistemas distribuídos": 24, "CI/CD": 18 }

// summary.salaryRange (note campo opcional "note" presente em dados reais)
{ "min": 20000, "max": 45000, "note": "..." }

// salaryGuide (note: cada source tem "url" e "percentiles" também,
//  mas o componente atual só usa portal+year — preservar)
```

```ts
// Estado atual de profile-detail-resumo.tsx (linhas 17-19, 55-59 — bug central):
archetypes?: Array<{ name: string; count?: number } | string>;   // <-- "name" é o bug

function renderArchetype(arch: { name: string; count?: number } | string): string {
  if (typeof arch === "string") return arch;
  if (arch.count) return `${arch.name} (${arch.count} menções)`;  // <-- arch.name é undefined em prod
  return arch.name;
}

// Linha 220-238: Stack Frequência atual — bloco "rounded-sm bg-surface-container-low"
// com nome+count em flex justify-between. Será evoluído para barras com nome+count visíveis.
```

```tsx
// Estado atual de profile-detail-resumo.test.tsx (linhas 39-43):
archetypes: [
  { name: "arquiteto tecnico", count: 9 },         // <-- inventou "name"; schema canônico usa "archetype"
  { name: "especialista", count: 4 },
  { name: "engenheiro de produto", count: 2 },
],
```
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Fix arquétipos — tipo + renderArchetype + mock de teste (Item 6 / D-26..D-31)</name>
  <files>src/components/profile/profile-detail-resumo.tsx, src/components/profile/profile-detail-resumo.test.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-26..D-31)
    - .agents/skills/pesquisar-mercado/SKILL.md (§ Step 6.1 — schema canônico de summary; §"Notes for Agent" — princípio dos mocks)
    - src/components/profile/profile-detail-resumo.tsx (linhas 17, 55-59, 104-112, 240-253)
    - src/components/profile/profile-detail-resumo.test.tsx (fixture mockResumoContent.summary.archetypes)
    - data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json (linha do summary.archetypes — confirmar schema real em produção)
  </read_first>
  <behavior>
    - Tipo `Archetype` aceita objeto com `archetype`, `count?`, `percentage?` ou string.
    - `renderArchetype` lê `arch.archetype` (NÃO `arch.name`).
    - Formato de saída quando há `percentage` E `count`: `"<archetype> — <count> menções (<percentage>%)"` (Claude Discretion sob D-28; usar travessão `—`).
    - Formato quando há `count` mas NÃO `percentage`: `"<archetype> — <count> menções"` (mantém compat com dados antigos).
    - Formato quando só há `archetype`: `"<archetype>"`.
    - Formato quando `arch` é string: `arch` (passthrough).
    - Sort por count desc preservado.
    - Teste atualizado para usar `archetype` (não `name`); novos asserts cobrindo `percentage`.
  </behavior>
  <action>
    Em `src/components/profile/profile-detail-resumo.tsx`:

    1) Linha 17 — substituir:
       ```ts
       archetypes?: Array<{ name: string; count?: number } | string>;
       ```
       por:
       ```ts
       // D-27 (Phase 9): schema canônico de summary.archetypes[] — campo "archetype",
       // count opcional, percentage opcional. Pode também vir como string solta (heurística antiga).
       // Fonte: .agents/skills/pesquisar-mercado/SKILL.md §6.1.
       archetypes?: Array<{ archetype: string; count?: number; percentage?: number } | string>;
       ```

    2) Linhas 55-59 — substituir:
       ```ts
       function renderArchetype(arch: { name: string; count?: number } | string): string {
         if (typeof arch === "string") return arch;
         if (arch.count) return `${arch.name} (${arch.count} menções)`;
         return arch.name;
       }
       ```
       por:
       ```ts
       function renderArchetype(
         arch: { archetype: string; count?: number; percentage?: number } | string
       ): string {
         if (typeof arch === "string") return arch;
         const name = arch.archetype;
         if (arch.count !== undefined && arch.percentage !== undefined) {
           return `${name} — ${arch.count} menções (${arch.percentage}%)`;
         }
         if (arch.count !== undefined) {
           return `${name} — ${arch.count} menções`;
         }
         return name;
       }
       ```

    3) Linhas 104-112 — atualizar a função de sort para ler `archetype`/`count` no novo schema:
       ```ts
       const sortedArchetypes = summary?.archetypes
         ? summary.archetypes
             .slice()
             .sort((a, b) => {
               const countA = typeof a === "string" ? 0 : (a.count ?? 0);
               const countB = typeof b === "string" ? 0 : (b.count ?? 0);
               return countB - countA;
             })
         : [];
       ```
       (Já está correto — só lê `count`; o sort não depende de `name`/`archetype`. Confirmar e deixar como está; sem alteração necessária aqui exceto comentário breve referenciando D-27.)

    Em `src/components/profile/profile-detail-resumo.test.tsx`:

    4) Linhas 39-43 — substituir mock de archetypes para refletir schema canônico (D-29, D-31):
       ```ts
       archetypes: [
         { archetype: "arquiteto tecnico", count: 9, percentage: 50 },
         { archetype: "especialista", count: 4, percentage: 22 },
         { archetype: "engenheiro de produto", count: 2, percentage: 11 },
       ],
       ```

    5) Atualizar o teste existente "renderiza archetypes ordenados por contagem decrescente" — os asserts continuam funcionando (busca por texto "arquiteto tecnico", "especialista", etc., e a regex `\d+ menções`).

    6) Adicionar UM novo teste cobrindo D-28 (formato com percentage):
       ```ts
       it("renderiza archetype com percentage no formato 'X — N menções (P%)' (D-28)", () => {
         render(<ProfileDetailResumo researches={mockResearches} />);

         // D-28: formato "arquiteto tecnico — 9 menções (50%)"
         expect(screen.getByText(/arquiteto tecnico\s*—\s*9 menç/i)).toBeInTheDocument();
         expect(screen.getByText(/\(50%\)/)).toBeInTheDocument();
       });
       ```

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test -- src/components/profile/profile-detail-resumo.test.tsx`
  </action>
  <verify>
    <automated>bash -c 'grep -c "arch.archetype" src/components/profile/profile-detail-resumo.tsx'; bash -c 'if grep -qE "\barch\.name\b" src/components/profile/profile-detail-resumo.tsx; then exit 1; fi'; bash -c 'grep -c "percentage" src/components/profile/profile-detail-resumo.tsx'; bash -c 'COUNT=$(grep -cE "^\s*\{\s*archetype:" src/components/profile/profile-detail-resumo.test.tsx); if [ "$COUNT" -lt 3 ]; then echo "ERROR: less than 3 archetype: entries (got $COUNT)"; exit 1; fi'; bash -c 'if grep -q "name: ..arquiteto" src/components/profile/profile-detail-resumo.test.tsx; then exit 1; fi'; npm run typecheck; npm test -- --run src/components/profile/profile-detail-resumo.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'arch.archetype' src/components/profile/profile-detail-resumo.tsx` retorna >= 1.
    - `grep 'arch\.name\b' src/components/profile/profile-detail-resumo.tsx` NÃO retorna nada (D-26).
    - `grep -c 'percentage' src/components/profile/profile-detail-resumo.tsx` retorna >= 2 (tipo + formato).
    - `grep -cE '^\s*\{\s*archetype:' src/components/profile/profile-detail-resumo.test.tsx` retorna >= 3 (W5: âncora estrutural evita falso-positivo em comentários).
    - `grep 'name: "arquiteto' src/components/profile/profile-detail-resumo.test.tsx` NÃO retorna nada.
    - Teste novo "renderiza archetype com percentage no formato 'X — N menções (P%)' (D-28)" passa.
    - Todos os outros testes em `profile-detail-resumo.test.tsx` continuam passando.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
  </acceptance_criteria>
  <done>
    Bug do arquétipo `undefined` corrigido; mock alinhado com schema canônico; novo teste protege D-28.
  </done>
</task>

<task type="auto">
  <name>Task 2: Implementar barras horizontais em CSS puro para Stack Frequência (Item 5 / D-20..D-25)</name>
  <files>src/components/profile/profile-detail-resumo.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-20..D-25)
    - src/components/profile/profile-detail-resumo.tsx (linhas 99-102 = sort; linhas 220-238 = render atual; linha 256 em diante = Stack Emergente, NÃO mexer)
    - data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json (exemplo real de stackFrequency com counts variados)
  </read_first>
  <action>
    Em `src/components/profile/profile-detail-resumo.tsx`:

    1) Acima da seção "Stack Frequência" (linha ~219, antes do `{sortedStack.length > 0 && (`), calcular `maxStackCount`:
       ```ts
       // D-22 (Phase 9 / Item 5): largura proporcional ao item top-1 (já ordenado desc).
       const maxStackCount = sortedStack.length > 0 ? Math.max(1, sortedStack[0][1] as number) : 1;
       ```
       (Math.max(1, ...) evita divisão por zero em estado degenerado.)

    2) Substituir o bloco da seção `Stack Frequência` (linhas 220-238) por:
       ```tsx
       {/* Stack Frequência — D-20..D-24 (Phase 9 / Item 5): barras horizontais CSS puro */}
       {sortedStack.length > 0 && (
         <section>
           <h3 className={SECTION_HEADING_CLASS}>Stack Frequência</h3>
           <div className="space-y-2">
             {sortedStack.map(([tech, count]) => {
               // D-22: largura computada como (count / maxCount) * 100%
               const widthPct = Math.max(8, ((count as number) / maxStackCount) * 100);
               return (
                 <div
                   key={tech}
                   data-testid="stack-item"
                   className="relative overflow-hidden rounded-sm bg-surface-container-low"
                 >
                   {/* Barra: posicionamento absoluto cobrindo o fundo da linha */}
                   <div
                     className="absolute inset-y-0 left-0 bg-tertiary/20"
                     style={{ width: `${widthPct}%` }}
                     aria-hidden="true"
                   />
                   {/* Conteúdo (D-23): nome + contagem visíveis SEMPRE, sobrepostos à barra */}
                   <div className="relative flex items-center justify-between py-2 px-3">
                     <span className="text-body-md text-on-surface">{tech}</span>
                     <span className="text-label-sm font-medium text-on-surface/70">
                       {count} menções
                     </span>
                   </div>
                 </div>
               );
             })}
           </div>
         </section>
       )}
       ```
       Notas:
       - `Math.max(8, ...)` (Claude Discretion sob D-22): largura mínima de 8% para não tornar barras de items com count baixo invisíveis.
       - `bg-tertiary/20` é tom suave do design system (Claude Discretion D-21 — cor da barra). Não introduz cor crua.
       - `data-testid="stack-item"` preservado para os testes que já existem.
       - `relative/absolute/overflow-hidden` é o padrão CSS puro de "fill bar com texto sobreposto" — sem nenhuma chart library (D-21).
       - Texto continua acessível (contraste): texto fica em foreground; barra é suave atrás (D-23).

    3) NÃO modificar a seção "Stack Emergente" (linhas 256+). D-25: continua sendo lista bullet de strings.

    4) Manter o sort desc original (linhas 99-102) — não tocar (D-24).

    Adicionar 2 testes em `src/components/profile/profile-detail-resumo.test.tsx` (sem quebrar os existentes):
    ```ts
    it("renderiza Stack Frequência como barras horizontais (D-20, D-21)", () => {
      const { container } = render(<ProfileDetailResumo researches={mockResearches} />);

      // Cada stack-item tem o tech name e "X menções" visíveis (D-23)
      const items = screen.getAllByTestId("stack-item");
      expect(items.length).toBe(7); // mock tem 7 entries em stackFrequency
      expect(items[0]).toHaveTextContent("Java");
      expect(items[0]).toHaveTextContent("15 menções");

      // Cada item tem um inner <div> com style.width (a barra)
      items.forEach(item => {
        const bar = item.querySelector('[style*="width"]');
        expect(bar).not.toBeNull();
      });
    });

    it("largura da barra é proporcional a count/maxCount (D-22)", () => {
      render(<ProfileDetailResumo researches={mockResearches} />);
      const items = screen.getAllByTestId("stack-item");

      // Java=15 (top), Spring Boot=13, Go=2 (último). maxCount=15.
      const javaBar = items[0].querySelector('[style*="width"]') as HTMLElement;
      const goBar = items[items.length - 1].querySelector('[style*="width"]') as HTMLElement;

      expect(javaBar.style.width).toBe("100%");
      // Go: 2/15 * 100 ≈ 13.3% — abaixo do mínimo de 8% mas matematicamente está acima, então fica em 13.3%
      // Em qualquer caso, a barra do Go é estritamente menor que a do Java
      const javaW = parseFloat(javaBar.style.width);
      const goW = parseFloat(goBar.style.width);
      expect(goW).toBeLessThan(javaW);
    });
    ```

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test -- src/components/profile/profile-detail-resumo.test.tsx`
  </action>
  <verify>
    <automated>bash -c "grep -c 'maxStackCount' src/components/profile/profile-detail-resumo.tsx"; bash -c "grep -c 'data-testid=..stack-item' src/components/profile/profile-detail-resumo.tsx"; bash -c "grep -c 'menções' src/components/profile/profile-detail-resumo.tsx"; bash -c "grep -c 'bg-tertiary' src/components/profile/profile-detail-resumo.tsx"; npm run typecheck; npm test -- --run src/components/profile/profile-detail-resumo.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'maxStackCount' src/components/profile/profile-detail-resumo.tsx` retorna >= 2 (declaração + uso).
    - `grep -c 'data-testid="stack-item"' src/components/profile/profile-detail-resumo.tsx` retorna == 1 (não duplicar).
    - `grep -c 'menções' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (texto preservado — D-23).
    - `grep -c 'bg-tertiary' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (cor da barra, design system).
    - `grep 'recharts\|chart.js\|visx\|@nivo' package.json` NÃO retorna nada (D-21: zero chart library).
    - Os 2 novos testes passam.
    - Os testes existentes ("ordenado por contagem decrescente", "Java aparece antes de Go") continuam passando.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
  </acceptance_criteria>
  <done>
    Stack Frequência renderiza como barras horizontais CSS-puro com nome+contagem sempre visíveis; Stack Emergente preservada; testes novos protegem o comportamento.
  </done>
</task>

<task type="auto">
  <name>Task 3: Auditoria colateral do schema do summary (D-30)</name>
  <files>src/components/profile/profile-detail-resumo.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-30: auditar TODOS os campos do summary)
    - .agents/skills/pesquisar-mercado/SKILL.md (§Step 6.1 — schema autoritativo)
    - src/components/profile/profile-detail-resumo.tsx (estado pós-task 2)
    - data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json (exemplo real)
  </read_first>
  <action>
    Auditoria sistemática:

    Para cada campo de `ResearchSummaryData` no componente, comparar contra o schema declarado em
    `.agents/skills/pesquisar-mercado/SKILL.md` §6.1 e contra o exemplo real em
    `data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json`. Para cada campo, decidir:

    | Campo | Schema canônico | Estado no componente | Decisão |
    |---|---|---|---|
    | commonTitles | `string[]` | `string[]` | OK |
    | titleAliases | `string[]` | `string[]` | OK |
    | stackFrequency | `Record<string, number>` | `Record<string, number>` | OK |
    | emergingStack | `string[]` | `string[]` | OK |
    | salaryRange | `{ min: number; max: number; note?: string }` (note no real json) | `{ min: number; max: number } \| null` | adicionar `note?: string` (encontrado no real json) |
    | salarySource | `string` | `string \| null` | OK |
    | commonBehaviors | `string[]` | `string[]` | OK |
    | commonChallenges | `string[]` | `string[]` | OK |
    | archetypes | `Array<{archetype, count?, percentage?} \| string>` | corrigido na task 1 | OK |
    | trends | `string[]` | `string[]` | OK |
    | redFlags | `string[]` | `string[]` | OK |

    Para `salaryGuide`: schema canônico tem também `location?: string`, `currency?: string`, e `sources[]` com `url?: string` e `percentiles?: string`. O componente atual só usa `portal` e `year` — preservar o uso atual (não introduzir features novas), mas atualizar o tipo para refletir o schema canônico (campos opcionais).

    1) No componente, atualizar a interface `ResearchSummaryData` para refletir o real:
       ```ts
       interface ResearchSummaryData {
         commonTitles?: string[];
         titleAliases?: string[];
         stackFrequency?: Record<string, number>;
         // D-30: schema canônico inclui campo opcional "note" para contextualizar a faixa
         salaryRange?: { min: number; max: number; note?: string } | null;
         salarySource?: string | null;
         emergingStack?: string[];
         commonBehaviors?: string[];
         commonChallenges?: string[];
         // D-27 (Item 6): "archetype", não "name"; "percentage" opcional do schema canônico
         archetypes?: Array<{ archetype: string; count?: number; percentage?: number } | string>;
         trends?: string[];
         redFlags?: string[];
       }
       ```

    2) Atualizar `interface SalaryGuide` para refletir o schema canônico (D-30):
       ```ts
       interface SalaryGuide {
         min: number;
         max: number;
         currency?: string;
         location?: string;
         sources?: Array<{
           portal: string;
           year: number;
           url?: string;
           percentiles?: string;
         }>;
       }
       ```

    3) Adicionar comentário-cabeçalho acima das interfaces:
       ```ts
       // ─── Tipos espelham o schema canônico declarado em
       //     .agents/skills/pesquisar-mercado/SKILL.md §6.1 e validados contra
       //     data/research/{profileId}/{date}-resumo.json em produção (Phase 9 / D-30, D-31).
       //     Princípio: NUNCA inventar campos no tipo nem nos mocks de teste.
       ```

    4) Esta task é **tipo-only** — NÃO altera renderização. Campos primitivos de baixo custo (`note`, `url`) ganham UI na **Task 4** (split de escopo D-30). Campos compostos (`percentiles`, `currency`, `location`) ficam OPTIONAL no tipo e DEFERRED para fase futura — documentar essa decisão num comentário inline:
       ```ts
       // D-30 (Phase 9, decisão do orquestrador em modo auto):
       //   - 'salaryRange.note' e 'sources[].url' → renderizados em Task 4 (custo mínimo, valor alto).
       //   - 'sources[].percentiles' / 'currency' / 'location' → DEFERRED (UI mais elaborada — fase futura).
       //     Permanecem aqui apenas como tipo opcional para refletir o schema canônico (princípio D-31).
       ```

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test`
  </action>
  <verify>
    <automated>bash -c 'grep -c "note?: string" src/components/profile/profile-detail-resumo.tsx'; bash -c 'grep -c "percentiles" src/components/profile/profile-detail-resumo.tsx'; bash -c 'grep -c "D-30" src/components/profile/profile-detail-resumo.tsx'; npm run typecheck; npm run lint; npm test -- --run</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'note?: string' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (campo `salaryRange.note` adicionado).
    - `grep -c 'percentiles' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (em SalaryGuide).
    - `grep -c 'location?:' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (em SalaryGuide).
    - `grep -c 'D-30' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (rastro da decisão).
    - Comentário inline lista explicitamente `percentiles`/`currency`/`location` como DEFERRED.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - `npm test` passa (sem regressões — task é tipo-only).
  </acceptance_criteria>
  <done>
    Auditoria completa; tipos alinhados ao schema canônico; campos extras documentados como opcionais; render-now-vs-defer registrado em comentário inline; comentários referenciam D-30 e o caminho do schema canônico.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Render condicional de salaryRange.note e salaryGuide.sources[].url (D-30 — render-now)</name>
  <files>src/components/profile/profile-detail-resumo.tsx, src/components/profile/profile-detail-resumo.test.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-30: "corrigir o que encontrar")
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-05-resumo-bars-and-archetype-fix.md (matriz render-now-vs-defer no `<objective>`)
    - src/components/profile/profile-detail-resumo.tsx (após task 3 — tipos já alinhados; localizar bloco "Das Vagas" linha ~132-156 e bloco "Pesquisa de Mercado" linha ~158-184)
    - src/components/profile/profile-detail-resumo.test.tsx (fixture mockResumoContent — adicionar campos opcionais)
    - data/research/8b09c8eb-6db0-454b-9abd-4bab1ac2dded/2026-04-27-resumo.json (validar shape real de note/url se disponível)
  </read_first>
  <behavior>
    - Quando `summary.salaryRange.note` está presente (string não-vazia), aparece como linha adicional no bloco "Das Vagas", logo após a linha "Faixa: R$ Xk – R$ Yk", em estilo discreto (`text-on-surface/60` ou similar — Claude Discretion mantendo design system).
    - Quando `summary.salaryRange.note` é `undefined`/null/string vazia, NADA é renderizado (zero impacto em fixtures antigas).
    - Quando `salaryGuide.sources[i].url` está presente, o `{source.portal} {source.year}` vira link `<a href={source.url} target="_blank" rel="noopener noreferrer">`. Quando `url` ausente, comportamento atual preservado (texto puro).
    - Asserts de testes existentes para faixa salarial continuam passando (não-quebra de regressão).
    - Novo teste cobre fixture com `note` e `url` populados; verifica que o `note` aparece no DOM e que existe um `<a>` com `href` apontando para a `url`.
    - Os campos `percentiles`, `currency`, `location` continuam SEM render — confirmar via grep ausente no JSX (W8 anti-creep guard).
  </behavior>
  <action>
    Em `src/components/profile/profile-detail-resumo.tsx`:

    1) Localizar o bloco "Bloco 1: Das Vagas" (linha ~132). Após a `<li>` que renderiza a "Faixa: R$ Xk – R$ Yk" (linhas 144-153), adicionar **dentro do mesmo `<ul>`** uma renderização condicional do `note`:
       ```tsx
       {summary?.salaryRange?.note && (
         <li className="text-body-md text-on-surface/60 flex gap-3">
           <span className="shrink-0">•</span>
           <span>{summary.salaryRange.note}</span>
         </li>
       )}
       ```
       Estilo `text-on-surface/60` (mais discreto que as linhas principais — alinha com texto secundário do design system; Claude Discretion D-30).

    2) Localizar o bloco "Bloco 2: Pesquisa de Mercado", linha ~166. Substituir o `<span>` que renderiza `{source.portal} {source.year}: R$...` por uma versão condicional ao `url`:
       ```tsx
       {salaryGuide?.sources?.map((source, idx) => (
         <li key={idx} className="text-body-md text-on-surface flex gap-3">
           <span className="shrink-0">•</span>
           <span>
             {source.url ? (
               <a
                 href={source.url}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="underline hover:text-tertiary"
               >
                 {source.portal} {source.year}
               </a>
             ) : (
               <>{source.portal} {source.year}</>
             )}
             : R$ {(salaryGuide.min / 1000).toFixed(1)}k – R${" "}
             {(salaryGuide.max / 1000).toFixed(1)}k
           </span>
         </li>
       ))}
       ```
       Notas:
       - `target="_blank"` + `rel="noopener noreferrer"` (XSS/tabnabbing best practice — link sai do app).
       - `underline hover:text-tertiary` segue padrão de links do design system.
       - Quando `source.url` ausente, fallback é texto puro (compat com fixtures antigas).

    3) NÃO renderizar `percentiles`, `currency`, `location` — eles continuam apenas no tipo (Task 3) como deferred.

    Em `src/components/profile/profile-detail-resumo.test.tsx`:

    4) Atualizar a fixture `mockResumoContent.summary.salaryRange` (ou criar variante de fixture) para incluir `note`. Sugestão: adicionar campo direto na fixture canônica para garantir cobertura permanente:
       ```ts
       salaryRange: { min: 18000, max: 38000, note: "Faixa de São Paulo capital, regime CLT" },
       ```

    5) Atualizar a fixture do `salaryGuide` para a primeira `source` ter `url`:
       ```ts
       salaryGuide: {
         min: 17000,
         max: 35000,
         sources: [
           { portal: "Glassdoor", year: 2025, url: "https://www.glassdoor.com.br/...", percentiles: "P50: R$ 25k" },
           { portal: "Catho", year: 2024 },
         ],
       },
       ```
       (Manter a segunda source SEM `url` para garantir cobertura do fallback texto-puro.)

    6) Adicionar novo teste:
       ```ts
       it("renderiza salaryRange.note quando presente (D-30)", () => {
         render(<ProfileDetailResumo researches={mockResearches} />);
         expect(screen.getByText(/São Paulo capital.*CLT/i)).toBeInTheDocument();
       });

       it("renderiza salaryGuide.sources[i].url como link <a> (D-30)", () => {
         render(<ProfileDetailResumo researches={mockResearches} />);

         // primeira source: Glassdoor com url → vira <a>
         const glassdoorLink = screen.getByRole("link", { name: /Glassdoor 2025/i });
         expect(glassdoorLink).toHaveAttribute("href", expect.stringContaining("glassdoor.com.br"));
         expect(glassdoorLink).toHaveAttribute("target", "_blank");
         expect(glassdoorLink).toHaveAttribute("rel", expect.stringContaining("noopener"));

         // segunda source: Catho sem url → texto puro, não vira <a>
         expect(screen.queryByRole("link", { name: /Catho 2024/i })).not.toBeInTheDocument();
         expect(screen.getByText(/Catho 2024/)).toBeInTheDocument();
       });
       ```

    7) Os asserts antigos do bloco salarial podem precisar de ajuste fino se eles afirmavam que o conteúdo era um `<span>` exato — preferir `getByText(/Faixa.*18.0k.*38.0k/)` que continua funcionando independentemente de o portal virar `<a>`.

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test -- src/components/profile/profile-detail-resumo.test.tsx`
  </action>
  <verify>
    <automated>bash -c 'grep -c "salaryRange?.note" src/components/profile/profile-detail-resumo.tsx'; bash -c 'grep -c "source.url" src/components/profile/profile-detail-resumo.tsx'; bash -c 'grep -c "noopener noreferrer" src/components/profile/profile-detail-resumo.tsx'; bash -c 'if grep -qE "salaryGuide.*\.percentiles[^?]|salaryGuide.*\.currency[^?]|salaryGuide.*\.location[^?]" src/components/profile/profile-detail-resumo.tsx; then echo "ERROR: deferred fields rendered"; exit 1; fi'; bash -c 'grep -c "note:" src/components/profile/profile-detail-resumo.test.tsx'; bash -c 'grep -c "url:" src/components/profile/profile-detail-resumo.test.tsx'; npm run typecheck; npm run lint; npm test -- --run src/components/profile/profile-detail-resumo.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'salaryRange?.note' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (D-30: render do note).
    - `grep -c 'source.url' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (D-30: render do url).
    - `grep -c 'noopener noreferrer' src/components/profile/profile-detail-resumo.tsx` retorna >= 1 (segurança do `<a target=_blank>`).
    - `grep -c 'note:' src/components/profile/profile-detail-resumo.test.tsx` retorna >= 1 (fixture com note).
    - `grep -c 'url:' src/components/profile/profile-detail-resumo.test.tsx` retorna >= 1 (fixture com url).
    - Não existe render de `percentiles`/`currency`/`location` no JSX (greps deferred guards retornam vazio).
    - 2 novos testes passam: "renderiza salaryRange.note quando presente (D-30)" e "renderiza salaryGuide.sources[i].url como link `<a>` (D-30)".
    - Testes existentes em `profile-detail-resumo.test.tsx` continuam passando.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
  </acceptance_criteria>
  <done>
    Render-now do D-30 implementado: `salaryRange.note` e `salaryGuide.sources[].url` aparecem no DOM quando presentes; fixtures de teste cobrem ambos os caminhos (presente/ausente); deferred fields permanecem fora do JSX; sem regressões.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| filesystem (DATA_PATH/research) → component | Conteúdo de resumo.json é renderizado |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09-05-01 | XSS | profile-detail-resumo.tsx | accept | Todos os campos renderizados como texto via React (escape automático). Sem `dangerouslySetInnerHTML`. Conteúdo vem de skill `/pesquisar-mercado` controlada pelo agente, baixo risco. |
| T-09-05-02 | Information Disclosure | profile-detail-resumo.tsx | accept | Dados de pesquisa de mercado já são públicos (vagas, salários). Sem PII. |
| T-09-05-03 | Tampering (schema mismatch) | tipos do componente | mitigate | Auditoria D-30 alinha tipos ao schema canônico declarado na SKILL.md; previne novos bugs do tipo "undefined" silencioso. |
</threat_model>

<verification>
- `npm run typecheck` verde.
- `npm run lint` verde.
- `npm test` verde.
- Manual: navegar para `/profiles/8b09c8eb-6db0-454b-9abd-4bab1ac2dded` → aba "Resumo de Mercado" → arquétipos mostram "arquiteto técnico — 12 menções (57%)" (não "undefined"); Stack Frequência mostra barras horizontais com Java/Kotlin, Sistemas distribuídos etc. com counts visíveis. Bloco "Salário (referência)": linha "Faixa: R$ Xk – R$ Yk" + linha discreta com `salaryRange.note` quando presente; sources com `url` viram links clicáveis.
</verification>

<deferred>
**Campos do schema canônico de `summary` mantidos como tipo opcional, sem render UI nesta fase (D-30):**
- `summary.salaryGuide.sources[].percentiles` — exige UI estruturada (P25/P50/P75/P90); reavaliar quando a feature de comparação salarial cross-pesquisa for desenhada.
- `summary.salaryGuide.currency` — só faz sentido quando houver mais de uma moeda; hoje 100% R$.
- `summary.salaryGuide.location` — exige normalização geográfica (ex: "São Paulo capital", "remoto Brasil"). Reavaliar junto com filtros geográficos.

Render-now nesta fase: `summary.salaryRange.note` e `summary.salaryGuide.sources[].url` (Task 4).
</deferred>

<success_criteria>
1. `arch.archetype` (não `arch.name`); `percentage` exibido quando presente.
2. Mock de teste reflete schema canônico.
3. Stack Frequência renderiza como barras horizontais CSS puro.
4. Stack Emergente preservada como lista.
5. Sort desc preservado.
6. Tipos auditados contra schema canônico.
7. `salaryRange.note` renderizado quando presente (D-30 — render-now).
8. `salaryGuide.sources[].url` renderizado como `<a target=_blank>` quando presente (D-30 — render-now).
9. Campos deferred (`percentiles`, `currency`, `location`) permanecem fora do JSX.
10. Sem chart library introduzida.
11. Sem regressões.
</success_criteria>

<output>
After completion, create `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-05-SUMMARY.md`
</output>
