---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/api/vacancies/[id]/form/route.ts
  - src/app/(shell)/vacancies/[id]/edit/page.tsx
autonomous: true
requirements: []
context_items: [item-2]
decisions_addressed: [D-04, D-05, D-06, D-07, D-08]

must_haves:
  truths:
    - "GET /api/vacancies/[id]/form regenera o xlsx em todo request (sem cache em DATA_PATH)"
    - "O arquivo xlsx é gravado em os.tmpdir() com nome único por request, não em DATA_PATH/forms/"
    - "A query string ?regen=1 deixa de ser necessária (no-op silencioso)"
    - "A página /vacancies/[id]/edit chama a rota sem ?regen=1"
    - "O download funciona em ambiente onde DATA_PATH é read-only (não escreve nada em DATA_PATH)"
  artifacts:
    - path: "src/app/api/vacancies/[id]/form/route.ts"
      provides: "GET handler que escreve em os.tmpdir(), nome único por request, faz cleanup pós-stream"
    - path: "src/app/(shell)/vacancies/[id]/edit/page.tsx"
      provides: "Botão 'Gerar formulário GH' apontando para /api/vacancies/{id}/form (sem ?regen=1)"
  key_links:
    - from: "src/app/api/vacancies/[id]/form/route.ts"
      to: "node:os.tmpdir()"
      via: "import os from \"node:os\""
      pattern: "os\\.tmpdir\\(\\)"
---

<objective>
Corrigir o Item 2 do CONTEXT.md de Phase 9: a rota `GET /api/vacancies/[id]/form` falha em produção
porque tenta escrever o xlsx gerado em `DATA_PATH/forms/{id}-requisicao.xlsx` — diretório read-only
no container deployado. Eliminar o cache de xlsx, redirecionar a saída para `os.tmpdir()` (resolvido
nativamente pelo Node — `/tmp` em Linux/container, `/var/folders/...` em macOS dev), e remover a
dependência da query `?regen=1` no único caller atual (`/vacancies/[id]/edit`).

Não introduz nova env var nem segundo volume RW — D-06 explícito.
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
@src/app/api/vacancies/[id]/form/route.ts
@src/app/(shell)/vacancies/[id]/edit/page.tsx
@src/lib/data-service.ts
</context>

<interfaces>
<!-- Estado atual relevante -->

```ts
// src/app/api/vacancies/[id]/form/route.ts (estado atual relevante):

import { ensureSubdir } from "@/lib/data-service";
// ...
const formsDir = ensureSubdir("forms");                  // <-- escreve em DATA_PATH (read-only em prod)
const outputPath = path.join(formsDir, `${id}-requisicao.xlsx`);
// ...
const url = new URL(req.url);
const forceRegen = url.searchParams.get("regen") === "1"; // <-- D-07: deixa de ser necessário
// ...
if (!fs.existsSync(outputPath) || forceRegen) {           // <-- D-04: regenerar SEMPRE
  generateVacancyForm(templatePath, outputPath, vacancy, profile, settings);
}
// ...
const buffer = fs.readFileSync(outputPath);               // <-- ok; mas outputPath agora é tmp
```

```tsx
// src/app/(shell)/vacancies/[id]/edit/page.tsx linha 73 (estado atual):
<a href={`${apiPrefix}/api/vacancies/${vacancy.id}/form?regen=1`} download>
  Gerar formulário GH
</a>
```
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Reescrever rota GET para escrever em os.tmpdir() sem cache</name>
  <files>src/app/api/vacancies/[id]/form/route.ts</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-04..D-08)
    - src/app/api/vacancies/[id]/form/route.ts (estado atual completo)
    - src/lib/data-service.ts (`ensureSubdir` deixa de ser chamado aqui — manter a função intacta para outros consumidores)
  </read_first>
  <behavior>
    - O handler NAO chama `ensureSubdir("forms")` — `ensureSubdir` deixa de aparecer no arquivo.
    - O handler NAO le nem checa `?regen` na URL — `forceRegen` deixa de existir.
    - O xlsx e escrito em `path.join(os.tmpdir(), 'vacancy-' + id + '-' + randomUUID() + '.xlsx')` a cada request.
    - `generateVacancyForm` e chamado incondicionalmente (sem `if (!fs.existsSync(...))`).
    - Apos `fs.readFileSync(outputPath)`, o arquivo e deletado via `fs.unlinkSync` num try/catch (cleanup best-effort — Claude Discretion sob D-08).
    - Response body continua sendo o `Buffer`. Headers `Content-Disposition` e `Content-Type` permanecem inalterados.
    - Status codes de erro (401, 404, 500) permanecem identicos.
  </behavior>
  <action>
    Reescrever o arquivo `src/app/api/vacancies/[id]/form/route.ts` com as seguintes mudancas pontuais:

    1) Imports
       - REMOVER: `import { ensureSubdir } from "@/lib/data-service";`
       - ADICIONAR (apos o import de `path`):
         `import os from "node:os";`
         `import { randomUUID } from "node:crypto";`

    2) Bloco "5. Montar caminhos" — substituir:
       ```ts
       const formsDir = ensureSubdir("forms");
       const outputPath = path.join(formsDir, `${id}-requisicao.xlsx`);
       ```
       por (Phase 9 / D-05):
       ```ts
       // Phase 9 / D-05: xlsx em os.tmpdir() (read-write em qualquer ambiente).
       // DATA_PATH e read-only em producao — sem env var nova, sem segundo volume.
       const outputPath = path.join(
         os.tmpdir(),
         `vacancy-${id}-${randomUUID()}.xlsx`
       );
       ```

    3) Bloco "6. Verificar regeneracao forcada" — REMOVER por inteiro:
       ```ts
       const url = new URL(req.url);
       const forceRegen = url.searchParams.get("regen") === "1";
       ```

    4) Bloco "7. Gerar Excel..." — substituir:
       ```ts
       if (!fs.existsSync(outputPath) || forceRegen) {
         generateVacancyForm(templatePath, outputPath, vacancy, profile, settings);
       }
       ```
       por (Phase 9 / D-04: regenerar sempre):
       ```ts
       // Phase 9 / D-04: cache eliminado — regerar a cada request.
       generateVacancyForm(templatePath, outputPath, vacancy, profile, settings);
       ```

    5) Apos `const buffer = fs.readFileSync(outputPath);`, adicionar (Claude Discretion sob D-08):
       ```ts
       // Cleanup pos-stream: arquivo ja esta em memoria, removemos do tmp.
       try { fs.unlinkSync(outputPath); } catch { /* best-effort */ }
       ```

    6) Se o parametro `req` ficar sem uso, renomear para `_req` para evitar warning de lint. NAO remover do tipo (signature de Route Handler do Next exige).

    Ao final, executar:
    `npm run typecheck` ; `npm run lint` ; `npm test`
  </action>
  <verify>
    <automated>npm run typecheck; npm run lint; npm test -- --run; bash -c "grep -c 'os.tmpdir' 'src/app/api/vacancies/[id]/form/route.ts'"; bash -c "if grep -q 'ensureSubdir' 'src/app/api/vacancies/[id]/form/route.ts'; then exit 1; fi"; bash -c "if grep -qE 'forceRegen|searchParams.get..regen' 'src/app/api/vacancies/[id]/form/route.ts'; then exit 1; fi"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'os.tmpdir' src/app/api/vacancies/[id]/form/route.ts` retorna >= 1.
    - `grep -c 'randomUUID' src/app/api/vacancies/[id]/form/route.ts` retorna >= 1.
    - `grep -c 'ensureSubdir' src/app/api/vacancies/[id]/form/route.ts` retorna 0.
    - `grep -E 'forceRegen|searchParams.get..regen' src/app/api/vacancies/[id]/form/route.ts` nao retorna nada.
    - `grep -c 'fs.unlinkSync' src/app/api/vacancies/[id]/form/route.ts` retorna >= 1.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - `npm test` passa (testes existentes continuam verdes).
  </acceptance_criteria>
  <done>
    Route handler reescrito; sem dependencia de DATA_PATH gravavel; sem cache; cleanup pos-stream; testes/typecheck/lint OK.
  </done>
</task>

<task type="auto">
  <name>Task 2: Remover ?regen=1 do botão "Gerar formulário GH" na página de edit</name>
  <files>src/app/(shell)/vacancies/[id]/edit/page.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-07: caller deve deixar de passar ?regen=1)
    - src/app/(shell)/vacancies/[id]/edit/page.tsx (linha 73 — `<a>` com query string)
  </read_first>
  <action>
    No arquivo `src/app/(shell)/vacancies/[id]/edit/page.tsx`, localizar a linha:
    ```tsx
    href={`${apiPrefix}/api/vacancies/${vacancy.id}/form?regen=1`}
    ```
    Substituir por:
    ```tsx
    href={`${apiPrefix}/api/vacancies/${vacancy.id}/form`}
    ```
    Manter `download` no atributo do `<a>` (necessario para o browser disparar attachment — D-13 do Item 3 segue a mesma logica).

    NAO mudar mais nada no arquivo. Manter `apiPrefix`, container, demais elementos.
  </action>
  <verify>
    <automated>bash -c "if grep -q 'regen=1' 'src/app/(shell)/vacancies/[id]/edit/page.tsx'; then exit 1; fi"; npm run typecheck; npm run lint</automated>
  </verify>
  <acceptance_criteria>
    - `grep 'regen=1' src/app/(shell)/vacancies/[id]/edit/page.tsx` nao retorna nada.
    - `grep -c 'api/vacancies/.*/form' src/app/(shell)/vacancies/[id]/edit/page.tsx` retorna >= 1 (link continua presente, sem query string).
    - `grep -c 'download' src/app/(shell)/vacancies/[id]/edit/page.tsx` retorna >= 1 (atributo download mantido).
    - `npm run typecheck` passa.
    - `npm run lint` passa.
  </acceptance_criteria>
  <done>
    Caller atualizado para a nova semantica da rota; nenhum lugar do codebase ainda usa `?regen=1`.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client → API | Request autenticado faz GET na rota; user controla `id` (ja validado pelo repository.findById) |
| API → filesystem (tmp) | Rota escreve em os.tmpdir() com nome contendo `id` e `randomUUID()` |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09-02-01 | Tampering | route.ts | mitigate | `id` vem dos params do Next (ja sanitizado pelo router); usado apenas como prefixo do nome do arquivo, nao como path. `path.join` com `os.tmpdir()` garante que o arquivo cai em /tmp. |
| T-09-02-02 | Information Disclosure | route.ts | mitigate | Cleanup `fs.unlinkSync` apos ler buffer remove o arquivo do disco antes do response. Janela < 1ms tipica. Single-user app, baixo trafego. |
| T-09-02-03 | DoS | route.ts | accept | Sem rate-limit hoje (state-of-art do app). Single user; tmpfile pequeno (~50KB); risco baixo. |
| T-09-02-04 | Path Traversal | route.ts | mitigate | `randomUUID()` garante nome unico nao-controlado pelo cliente; `path.join` com `os.tmpdir()` previne `../`. `id` e usado como prefixo apos sanitizacao implicita do Next router. |
</threat_model>

<verification>
- `npm run typecheck` verde.
- `npm run lint` verde.
- `npm test` verde (sem regressoes).
- Manual: rodar `npm run dev`, abrir `/vacancies/<id>/edit`, clicar "Gerar formulario GH" → download do xlsx funciona; rede mostra GET `/api/vacancies/{id}/form` (sem `?regen=1`).
- Em ambiente com DATA_PATH read-only: nenhuma escrita em DATA_PATH/forms/.
</verification>

<success_criteria>
1. Route handler usa `os.tmpdir()` + `randomUUID()` para o output path.
2. Cache (`if (!fs.existsSync(outputPath) || forceRegen)`) eliminado.
3. `?regen=1` removido do unico caller atual.
4. Cleanup pos-stream com `fs.unlinkSync` em try/catch best-effort.
5. Sem novas env vars; `compose.yaml` e `Dockerfile` nao precisam mudar.
6. Sem regressoes (typecheck/lint/test verdes).
</success_criteria>

<output>
After completion, create `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-02-SUMMARY.md`
</output>
