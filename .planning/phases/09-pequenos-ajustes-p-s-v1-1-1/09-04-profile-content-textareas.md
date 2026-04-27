---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 04
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/dynamic-list-field.tsx
  - src/components/ui/profile-item-field.tsx
autonomous: true
requirements: []
context_items: [item-4]
decisions_addressed: [D-14, D-15, D-16, D-17, D-18, D-19]

must_haves:
  truths:
    - "Os 4 campos de Conteúdo Descritivo (Responsabilidades, Requisitos, Comportamentais, Desafios) usam textarea de 2 linhas com altura uniforme"
    - "O usuário pode digitar Enter dentro do campo sem submeter o form (textarea quebra linha por padrão)"
    - "O botão Obrigatório/Diferencial mantém label completo (não abreviado)"
    - "Cards têm altura fixa idêntica entre si (resize-none, sem auto-grow, sem resize manual)"
    - "Submit do form continua via botão 'Salvar'"
  artifacts:
    - path: "src/components/ui/dynamic-list-field.tsx"
      provides: "Componente com <textarea rows={2} className=resize-none ...> em vez de <Input>"
    - path: "src/components/ui/profile-item-field.tsx"
      provides: "Mesmo componente com <textarea>; alinhamento dos botões ajustado para items-start (Claude Discretion sob D-19)"
  key_links:
    - from: "src/components/profile/profile-form.tsx"
      to: "src/components/ui/dynamic-list-field.tsx"
      via: "DynamicListField (responsibilities, behaviors, challenges)"
      pattern: "DynamicListField"
    - from: "src/components/profile/profile-form.tsx"
      to: "src/components/ui/profile-item-field.tsx"
      via: "ProfileItemField (qualifications)"
      pattern: "ProfileItemField"
---

<objective>
Implementar Item 4 do CONTEXT.md de Phase 9: trocar `<Input>` por `<textarea rows={2} resize-none>`
nos componentes `dynamic-list-field.tsx` e `profile-item-field.tsx`. Esses dois componentes são
usados nas 4 sub-seções de "Conteúdo Descritivo" do `ProfileForm` (Responsabilidades, Requisitos,
Comportamentais, Desafios) — D-16.

Hard requirements do gestor:
- D-15: `resize-none` (caixas com altura uniforme — não auto-grow, não resize manual)
- D-17: botão "Obrigatório/Diferencial" mantém label completo
- D-18: Enter quebra linha por padrão; submit continua via botão "Salvar" (default do textarea)

Trade-offs descartados (D-19): auto-grow, resize-y, abreviação O/D.
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
@src/components/ui/dynamic-list-field.tsx
@src/components/ui/profile-item-field.tsx
@src/components/profile/profile-form.tsx
</context>

<interfaces>
<!-- Estado atual (linhas-chave) -->

```tsx
// dynamic-list-field.tsx (linhas 13-24, 60-66)
import { Input } from "@/components/ui/input";

interface Item { id: string; value: string; }

// linha 60-66 — bloco a substituir:
<input type="hidden" name={name} value={item.value} />
<Input
  value={item.value}
  onChange={e => update(item.id, e.target.value)}
  required={required && index === 0}
  className={`flex-1 ${INPUT_CLASS}`}
/>
```

```tsx
// profile-item-field.tsx (linhas 4-7, 70-74)
import { Input } from "@/components/ui/input";

// linha 70-74 — bloco a substituir:
<Input
  value={item.text}
  onChange={e => update(item.id, e.target.value)}
  className={`flex-1 ${INPUT_CLASS}`}
/>
```

<!-- INPUT_CLASS já existente em ambos:
"rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
-->
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Trocar Input por textarea em dynamic-list-field.tsx</name>
  <files>src/components/ui/dynamic-list-field.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-14..D-19)
    - src/components/ui/dynamic-list-field.tsx (estado atual completo)
    - src/components/profile/profile-form.tsx (linhas 280-308 — sites de uso: responsibilities, behaviors, challenges)
  </read_first>
  <action>
    Em `src/components/ui/dynamic-list-field.tsx`:

    1) Remover o import `import { Input } from "@/components/ui/input";` (linha 4) — não será mais usado.

    2) Substituir o bloco JSX que renderiza o `<Input>` (linhas ~61-66) por um `<textarea>`:
       ```tsx
       <textarea
         value={item.value}
         onChange={e => update(item.id, e.target.value)}
         required={required && index === 0}
         rows={2}
         className={`flex-1 resize-none px-3 py-2 text-body-md text-on-surface border border-input rounded-sm ${INPUT_CLASS}`}
       />
       ```
       Notas:
       - `rows={2}` (D-14).
       - `resize-none` (D-15) — desabilita o handle de resize manual do navegador.
       - Classes adicionais (`px-3 py-2 text-body-md text-on-surface border border-input`) replicam o look-and-feel do shadcn `<Input>` para manter coerência visual com o resto do form. (Olhar `src/components/ui/input.tsx` se necessário para confirmar tokens; ajustar para corresponder.)
       - `focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary` já vem em `INPUT_CLASS` — preservado.
       - O `<input type="hidden" name={name} value={item.value} />` na linha 60 fica intacto (continua sendo o veículo do FormData — D-18 não afeta isso).

    3) Atualizar o `<div key={item.id} className="flex gap-2">` (linha 54) para alinhar verticalmente o topo do textarea com o botão de remover, evitando que o `[×]` fique no centro vertical de uma caixa de 2 linhas:
       Trocar `className="flex gap-2"` por `className="flex gap-2 items-start"`.

    4) Não mexer no `<Button> + Adicionar item`, no `aria-label`, no `onClick`, nem no fluxo de `update`/`add`/`remove`.

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test`
  </action>
  <verify>
    <automated>bash -c 'grep -cE "<textarea" src/components/ui/dynamic-list-field.tsx'; bash -c 'grep -cE "rows=\{2\}" src/components/ui/dynamic-list-field.tsx'; bash -c 'grep -c "resize-none" src/components/ui/dynamic-list-field.tsx'; bash -c 'grep -c "items-start" src/components/ui/dynamic-list-field.tsx'; bash -c 'if grep -qE "from .@/components/ui/input." src/components/ui/dynamic-list-field.tsx; then exit 1; fi'; npm run typecheck; npm run lint; npm test -- --run</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '<textarea' src/components/ui/dynamic-list-field.tsx` retorna >= 1.
    - `grep -c 'rows={2}' src/components/ui/dynamic-list-field.tsx` retorna >= 1.
    - `grep -c 'resize-none' src/components/ui/dynamic-list-field.tsx` retorna >= 1.
    - `grep -c 'items-start' src/components/ui/dynamic-list-field.tsx` retorna >= 1.
    - `grep 'from "@/components/ui/input"' src/components/ui/dynamic-list-field.tsx` NÃO retorna nada (import removido).
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - `npm test` passa (sem regressões).
  </acceptance_criteria>
  <done>
    `DynamicListField` usa textarea com 2 linhas, sem resize, alinhamento dos botões corrigido.
  </done>
</task>

<task type="auto">
  <name>Task 2: Trocar Input por textarea em profile-item-field.tsx (mantendo botão Obrigatório/Diferencial com label completo)</name>
  <files>src/components/ui/profile-item-field.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-14..D-19, especialmente D-17: NÃO abreviar para "O/D")
    - src/components/ui/profile-item-field.tsx (estado atual completo)
    - src/components/ui/dynamic-list-field.tsx (após task 1 — usar como referência de estilo do textarea)
    - src/components/profile/profile-form.tsx (linha 288 — uso em qualifications)
  </read_first>
  <action>
    Em `src/components/ui/profile-item-field.tsx`:

    1) Remover o import `import { Input } from "@/components/ui/input";` (linha 4).

    2) Substituir o bloco `<Input>` (linhas ~70-74) por:
       ```tsx
       <textarea
         value={item.text}
         onChange={e => update(item.id, e.target.value)}
         rows={2}
         className={`flex-1 resize-none px-3 py-2 text-body-md text-on-surface border border-input rounded-sm ${INPUT_CLASS}`}
       />
       ```
       (Mesmas decisões de estilo da Task 1, para que os 4 campos fiquem visualmente iguais.)

    3) No `<div key={item.id} className="flex gap-2 items-center">` (linha 62), trocar `items-center` por `items-start` (Claude Discretion sob D-19) — isso alinha o topo do textarea com o topo do botão `Obrigatório/Diferencial` e do `[×]` quando o textarea tem 2 linhas.

    4) **MANTER** o botão `Obrigatório/Diferencial` com o label completo (D-17). Não trocar para `O/D`. Não alterar o `className` do botão Obrigatório/Diferencial, exceto possivelmente adicionar `mt-1` para nudge fino se necessário (a critério, manter mudança mínima — preferir só `items-start` no container).

    5) Não mexer em `<input type="hidden" name={name} ...>` nem em `<input type="hidden" name="${name}_required" ...>` (estes preservam o contrato do FormData para a server action).

    6) Não mexer no `<Button> + Adicionar item`, no `aria-label="Remover item"`, no `toggleRequired` ou demais comportamentos.

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test`
  </action>
  <verify>
    <automated>bash -c 'grep -cE "<textarea" src/components/ui/profile-item-field.tsx'; bash -c 'grep -cE "rows=\{2\}" src/components/ui/profile-item-field.tsx'; bash -c 'grep -c "resize-none" src/components/ui/profile-item-field.tsx'; bash -c 'grep -c "items-start" src/components/ui/profile-item-field.tsx'; bash -c 'grep -c "Obrigatório" src/components/ui/profile-item-field.tsx'; bash -c 'grep -c "Diferencial" src/components/ui/profile-item-field.tsx'; bash -c 'if grep -qE ">O/D<|>O/D " src/components/ui/profile-item-field.tsx; then echo "ERROR: D-17 violated — O/D abbreviation found"; exit 1; fi'; bash -c 'if grep -qE "from .@/components/ui/input." src/components/ui/profile-item-field.tsx; then exit 1; fi'; npm run typecheck; npm run lint; npm test -- --run</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '<textarea' src/components/ui/profile-item-field.tsx` retorna >= 1.
    - `grep -c 'rows={2}' src/components/ui/profile-item-field.tsx` retorna >= 1.
    - `grep -c 'resize-none' src/components/ui/profile-item-field.tsx` retorna >= 1.
    - `grep -c 'items-start' src/components/ui/profile-item-field.tsx` retorna >= 1.
    - `grep -c 'Obrigatório' src/components/ui/profile-item-field.tsx` retorna >= 1 (label completo preservado — D-17).
    - `grep -c 'Diferencial' src/components/ui/profile-item-field.tsx` retorna >= 1.
    - `grep -E ">O/D<|>O/D " src/components/ui/profile-item-field.tsx` NÃO retorna nada (D-17 — abreviação proibida).
    - `grep 'from "@/components/ui/input"' src/components/ui/profile-item-field.tsx` NÃO retorna nada.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - `npm test` passa.
  </acceptance_criteria>
  <done>
    `ProfileItemField` usa textarea de 2 linhas, label completo do botão preservado, alinhamento ajustado para `items-start`.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user input → form | Texto digitado em textarea segue para FormData |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09-04-01 | XSS | dynamic-list-field, profile-item-field | accept | Texto vai para FormData; renderização downstream usa React (escape automático). Sem `dangerouslySetInnerHTML` nesses fluxos. |
| T-09-04-02 | Tampering | hidden inputs paralelos | accept | Estrutura de hidden inputs paralelos (`name` e `${name}_required`) preservada; server action segue o contrato existente. |
</threat_model>

<verification>
- `npm run typecheck` verde.
- `npm run lint` verde.
- `npm test` verde.
- Manual: editar perfil → seção "Conteúdo Descritivo" → 4 campos têm caixas com 2 linhas, altura uniforme, sem handle de resize, label completo no botão Obrigatório/Diferencial.
</verification>

<success_criteria>
1. Os dois componentes usam `<textarea rows={2}>` com `resize-none`.
2. Imports de `Input` removidos dos dois arquivos.
3. Container flex usa `items-start` em ambos.
4. Label "Obrigatório/Diferencial" preservado em `profile-item-field.tsx`.
5. Sem regressões em testes/typecheck/lint.
</success_criteria>

<output>
After completion, create `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-04-SUMMARY.md`
</output>
