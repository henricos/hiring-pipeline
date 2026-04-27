---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 03
type: execute
wave: 2
depends_on: [09-02-excel-tmp-storage]
files_modified:
  - src/components/vacancy/vacancy-list.tsx
autonomous: true
requirements: []
context_items: [item-3]
decisions_addressed: [D-09, D-10, D-11, D-12, D-13]

must_haves:
  truths:
    - "Cada card de vaga em /vacancies tem 3 botões de ação: Download, Edit, Delete (nessa ordem)"
    - "Clicar em Download dispara o download do xlsx via GET /api/vacancies/{id}/form (sem ?regen=1)"
    - "O botão Download segue o padrão visual dos outros: ghost icon, 40x40, aria-label apropriado, ícone lucide"
  artifacts:
    - path: "src/components/vacancy/vacancy-list.tsx"
      provides: "Botão Download como <a href={apiPrefix}/api/vacancies/{id}/form download> envolto em Button asChild"
  key_links:
    - from: "src/components/vacancy/vacancy-list.tsx"
      to: "/api/vacancies/[id]/form"
      via: "<a href={...} download>"
      pattern: "api/vacancies/.*/form"
    - from: "src/components/vacancy/vacancy-list.tsx"
      to: "lucide-react Download icon"
      via: "import { Download, Pencil, Trash2 } from \"lucide-react\""
      pattern: "import.*Download.*lucide-react"
---

<objective>
Implementar Item 3 do CONTEXT.md de Phase 9: adicionar botão de download do xlsx em cada card da
lista `/vacancies`, ao lado dos botões existentes (Editar=Pencil, Excluir=Trash2). Ordem aprovada
pelo gestor (D-11): `[Download] [Edit] [Delete]` — ações destrutivas por último.

Reutiliza a rota `GET /api/vacancies/[id]/form` que foi reescrita em 09-02 — chamada **sem**
`?regen=1` (D-10). Trigger via `<a href={...} download>` envolvido em `<Button asChild>` (D-13).

**Nota sobre dependência (W4):** O `depends_on: [09-02-excel-tmp-storage]` é **comportamental**, não de arquivos. Este plano não toca nos arquivos do 09-02 (`route.ts`, `edit/page.tsx`); ele apenas requer que a rota esteja funcional sem `?regen=1` em prod (caso contrário o download dos botões novos falharia). Resultado prático: 09-03 só pode rodar depois de 09-02 ter sido aplicado em código (mesmo branch).
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
@src/components/vacancy/vacancy-list.tsx
@src/app/(shell)/vacancies/[id]/edit/page.tsx
@src/app/(shell)/vacancies/page.tsx
@src/lib/base-path.ts
</context>

<interfaces>
<!-- Padrão visual existente nos botões Edit e Delete (vacancy-list.tsx, linhas 110-138) -->

```tsx
<div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
  <Button
    size="icon"
    variant="ghost"
    asChild
    className="min-h-[40px] min-w-[40px]"
    aria-label={`Editar vaga ${vacancyTitle}`}
  >
    <Link href={`/vacancies/${vacancy.id}/edit`}>
      <Pencil className="w-4 h-4" />
    </Link>
  </Button>

  <Button
    size="icon"
    variant="ghost"
    className="min-h-[40px] min-w-[40px] text-on-surface/50 hover:text-destructive"
    aria-label={`Excluir vaga ${vacancyTitle}`}
    onClick={() => setDeleteTarget(vacancy)}
    disabled={isPending}
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
```

<!-- Padrão de uso do basePath (já estabelecido em vacancies/[id]/edit/page.tsx) -->

```ts
import { env } from "@/lib/env";
import { normalizeBasePath } from "@/lib/base-path";

const basePath = normalizeBasePath(env.APP_BASE_PATH);
const apiPrefix = basePath === "/" ? "" : basePath;
// uso: `${apiPrefix}/api/vacancies/${vacancy.id}/form`
```

<!-- O componente atual é "use client" (vacancy-list.tsx linha 1) — não pode importar `env` diretamente.
     Estratégia: receber `apiPrefix` via prop a partir do Server Component pai (page.tsx). -->
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Adicionar botão Download no vacancy-list e propagar apiPrefix via prop</name>
  <files>src/components/vacancy/vacancy-list.tsx, src/app/(shell)/vacancies/page.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-09..D-13)
    - src/components/vacancy/vacancy-list.tsx (estado atual completo — entender o padrão dos 2 botões existentes)
    - src/app/(shell)/vacancies/page.tsx (Server Component pai — onde injetaremos o `apiPrefix`)
    - src/app/(shell)/vacancies/[id]/edit/page.tsx (referência canônica do padrão `apiPrefix`)
    - src/lib/base-path.ts (função `normalizeBasePath`)
  </read_first>
  <behavior>
    - `vacancy-list.tsx` aceita uma nova prop opcional: `apiPrefix?: string` (default `""` quando ausente, para retrocompatibilidade em testes que ainda não passem).
    - Para cada card, dentro da `<div>` de ações, adicionar um terceiro botão ANTES do botão Edit:
      - `<Button size="icon" variant="ghost" asChild className="min-h-[40px] min-w-[40px]" aria-label={`Baixar formulário GH da vaga ${vacancyTitle}`}>`
      - Filho: `<a href={`${apiPrefix}/api/vacancies/${vacancy.id}/form`} download><Download className="w-4 h-4" /></a>`
      - Usa `<a>` cru, NÃO `<Link>` do Next (D-13).
    - Ordem final: Download, Edit, Delete (D-11).
    - O ícone `Download` é importado de `lucide-react` (já em uso no projeto).
    - A página `src/app/(shell)/vacancies/page.tsx` calcula `apiPrefix` no Server Component e passa para `<VacancyList apiPrefix={apiPrefix} ... />`.
  </behavior>
  <action>
    1) Em `src/components/vacancy/vacancy-list.tsx`:
       - No bloco `import { Pencil, Trash2 } from "lucide-react";` (linha 6), adicionar `Download`:
         `import { Download, Pencil, Trash2 } from "lucide-react";`
       - Em `interface VacancyListProps` (linha 23), adicionar:
         `apiPrefix?: string;`
       - Na assinatura `export function VacancyList({ vacancies, profiles }: VacancyListProps)` (linha 36), incluir `apiPrefix = ""`:
         `export function VacancyList({ vacancies, profiles, apiPrefix = "" }: VacancyListProps) {`
       - Dentro do `<div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>` (linha 110), inserir como PRIMEIRO filho (antes do Button de Edit):
         ```tsx
         {/* Phase 9 / Item 3 / D-09..D-13: Download do xlsx via rota /api/vacancies/[id]/form */}
         <Button
           size="icon"
           variant="ghost"
           asChild
           className="min-h-[40px] min-w-[40px]"
           aria-label={`Baixar formulário GH da vaga ${vacancyTitle}`}
         >
           <a
             href={`${apiPrefix}/api/vacancies/${vacancy.id}/form`}
             download
           >
             <Download className="w-4 h-4" />
           </a>
         </Button>
         ```
       - Não tocar nos outros 2 botões. Não tocar no `AlertDialog`. Manter o `<Link>` do Next no botão de Edit (continua sendo navegação interna, não download).

    2) Em `src/app/(shell)/vacancies/page.tsx`:
       - Adicionar imports no topo:
         ```ts
         import { env } from "@/lib/env";
         import { normalizeBasePath } from "@/lib/base-path";
         ```
       - Dentro de `VacanciesContent`, antes do `return`, calcular `apiPrefix`:
         ```ts
         const basePath = normalizeBasePath(env.APP_BASE_PATH);
         const apiPrefix = basePath === "/" ? "" : basePath;
         ```
       - Atualizar o return:
         `return <VacancyList vacancies={vacancies} profiles={profileMap} apiPrefix={apiPrefix} />;`

    3) Não criar novos arquivos. Não mexer em testes existentes.

    4) Rodar:
       `npm run typecheck` ; `npm run lint` ; `npm test`
  </action>
  <verify>
    <automated>bash -c "grep -c 'Download' src/components/vacancy/vacancy-list.tsx | awk '{exit ($1 < 2)}'"; bash -c "grep -c 'aria-label=..Baixar' src/components/vacancy/vacancy-list.tsx"; bash -c "grep -E 'apiPrefix.*api/vacancies.*form' src/components/vacancy/vacancy-list.tsx"; bash -c "if grep -q 'regen=1' src/components/vacancy/vacancy-list.tsx; then exit 1; fi"; npm run typecheck; npm run lint; npm test -- --run</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'Download' src/components/vacancy/vacancy-list.tsx` retorna >= 2 (import + uso).
    - `grep -c 'aria-label="Baixar' src/components/vacancy/vacancy-list.tsx` retorna >= 1.
    - `grep -E 'apiPrefix.*/api/vacancies/.*/form' src/components/vacancy/vacancy-list.tsx` retorna match.
    - `grep 'regen=1' src/components/vacancy/vacancy-list.tsx` NÃO retorna nada (D-10).
    - `grep -c 'apiPrefix' src/app/(shell)/vacancies/page.tsx` retorna >= 1 (prop sendo passada).
    - `grep -c 'normalizeBasePath' src/app/(shell)/vacancies/page.tsx` retorna >= 1.
    - Ordem dos botões: regex `<Download[\\s\\S]*?<Pencil[\\s\\S]*?<Trash2` retorna match em `vacancy-list.tsx` (D-11).
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - `npm test` passa (sem regressões).
  </acceptance_criteria>
  <done>
    Botão Download presente, na ordem correta, apontando para a rota nova (sem `?regen=1`), com aria-label descritivo. Padrão visual idêntico aos outros 2 botões.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client → API | Botão Download dispara GET autenticado para rota já existente |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09-03-01 | Information Disclosure | vacancy-list.tsx | accept | A rota já requer auth (single-user); listar IDs em href é OK — esta página inteira é só visível pós-login. |
| T-09-03-02 | XSS | vacancy-list.tsx | accept | `vacancy.id` é UUID; `apiPrefix` vem de env validado; não há renderização de HTML cru. |
</threat_model>

<verification>
- `npm run typecheck` verde.
- `npm run lint` verde.
- `npm test` verde.
- Manual: abrir `/vacancies` → cada card mostra 3 ícones (Download, Lápis, Lixeira); clicar no Download → browser baixa `requisicao-{slug}.xlsx`.
</verification>

<success_criteria>
1. Botão Download presente em cada card de `/vacancies`.
2. Ordem `[Download] [Edit] [Delete]` (D-11).
3. Mesma classe visual e dimensões dos outros dois botões (`min-h-[40px] min-w-[40px]`).
4. Trigger via `<a href download>`, não `<Link>` (D-13).
5. URL sem `?regen=1` (D-10).
6. `aria-label` específico ("Baixar formulário GH da vaga {title}").
7. Sem regressões.
</success_criteria>

<output>
After completion, create `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-03-SUMMARY.md`
</output>
