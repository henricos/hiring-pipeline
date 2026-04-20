---
phase: 03-vacancy-gh-form
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - .agents/skills/abrir-vaga/SKILL.md
  - package.json
  - src/app/actions/settings.ts
  - src/app/actions/vacancy.ts
  - src/app/api/vacancies/[id]/form/route.ts
  - src/app/(shell)/settings/page.tsx
  - src/app/(shell)/vacancies/[id]/edit/page.tsx
  - src/app/(shell)/vacancies/new/page.tsx
  - src/app/(shell)/vacancies/page.tsx
  - src/components/settings/settings-form.tsx
  - src/components/shell/left-rail.tsx
  - src/components/ui/badge.tsx
  - src/components/vacancy/vacancy-form.tsx
  - src/components/vacancy/vacancy-list.tsx
  - src/lib/excel-generator.ts
  - src/lib/repositories/settings-repository.ts
  - src/lib/repositories/vacancy-repository.ts
  - src/lib/settings.ts
  - src/lib/vacancy.ts
  - src/__tests__/excel-generator.test.ts
  - src/__tests__/settings.test.ts
  - src/__tests__/vacancy-repository.test.ts
  - src/__tests__/vacancy.test.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-20
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

Esta revisão cobre a fase 03 completa: abertura de vagas via formulário web, geração de formulário Excel (xlsx), ações de servidor, repositórios JSON e skill `/abrir-vaga`. O código está bem estruturado, com separação clara entre perfil, vaga e configurações da área, e proteções explícitas contra path traversal nos repositórios.

O problema mais relevante encontrado é uma inconsistência na lógica de leitura do checkbox "Vaga orçada": enquanto os outros checkboxes (`confidential`, `headcountIncrease`) usam `=== "true"`, `budgeted` usa `!== "false"` — o que faz ele sempre salvar `true`, mesmo quando o usuário desmarcar o campo. Os demais achados são menores.

---

## Warnings

### WR-01: Checkbox `budgeted` sempre salva `true` (lógica invertida)

**File:** `src/app/actions/vacancy.ts:43` e `src/app/actions/vacancy.ts:102`

**Issue:** O checkbox `budgeted` no formulário tem `value="true"` e, quando desmarcado, não é incluído no FormData (o comportamento padrão de checkboxes HTML). A lógica atual usa:

```ts
const budgeted = formData.get("budgeted") !== "false";
```

Quando o campo está ausente (desmarcado), `formData.get("budgeted")` retorna `null`. Como `null !== "false"` é `true`, `budgeted` sempre recebe o valor `true`, independentemente da ação do usuário. Isso ocorre tanto em `createVacancy` (linha 43) quanto em `updateVacancy` (linha 102).

**Fix:** Usar o mesmo padrão adotado pelos outros checkboxes:

```ts
// Antes (bugado):
const budgeted = formData.get("budgeted") !== "false";

// Depois (correto):
const budgeted = formData.get("budgeted") === "true";
```

---

### WR-02: `settings-repository.get()` não captura erro de JSON malformado

**File:** `src/lib/repositories/settings-repository.ts:29`

**Issue:** O método `get()` faz `JSON.parse(content)` sem nenhum tratamento de erro. Se o arquivo `settings.json` estiver corrompido (escrita interrompida, edição manual incorreta), a exceção propaga sem controle e derruba a requisição com um 500 não tratado. O `vacancy-repository` tem comportamento análogo em `findById` (linha 58), mas ali o `try/catch` externo captura e retorna `null`.

```ts
// Linha 29 — sem proteção:
return JSON.parse(content) as AreaSettings;
```

**Fix:** Envolver o parse em try/catch e retornar o padrão em caso de falha:

```ts
async get(): Promise<AreaSettings> {
  if (!fs.existsSync(this.settingsPath)) {
    return defaultSettings();
  }
  try {
    const content = fs.readFileSync(this.settingsPath, "utf-8");
    return JSON.parse(content) as AreaSettings;
  } catch {
    return defaultSettings();
  }
}
```

---

### WR-03: Navegação ativa no `LeftRail` usa comparação exata, não prefixo

**File:** `src/components/shell/left-rail.tsx:32`

**Issue:** A detecção de item ativo usa `pathname === item.href` (igualdade exata). Para a rota `/vacancies`, isso funciona na listagem, mas qualquer sub-rota (`/vacancies/new`, `/vacancies/[id]/edit`) deixa o item "Vagas" sem destaque visual, o que prejudica a orientação do usuário na navegação.

```ts
const isActive = pathname === item.href;
```

**Fix:** Usar comparação por prefixo para que itens-pai fiquem ativos nas sub-rotas:

```ts
const isActive =
  item.href === "/"
    ? pathname === "/"
    : pathname === item.href || pathname.startsWith(item.href + "/");
```

---

## Info

### IN-01: Hardcoded developer path em teste de integração

**File:** `src/__tests__/excel-generator.test.ts:96`

**Issue:** O caminho `/home/henrico/github/henricos/hiring-pipeline-data` está codificado diretamente no array de tentativas de localização do template. Em qualquer outra máquina (CI, outros colaboradores) este path não existirá, causando skip silencioso do único teste de integração real do gerador de Excel.

```ts
"/home/henrico/github/henricos/hiring-pipeline-data",
```

**Fix:** Remover o caminho absoluto hardcoded. O fallback para `process.env.DATA_PATH` e `/data` já cobrem os casos de dev e produção:

```ts
const dataPaths = [
  process.env.DATA_PATH,
  "/data",
].filter(Boolean) as string[];
```

---

### IN-02: `console.error` em server actions silencia erros operacionais de delete/status

**File:** `src/app/actions/vacancy.ts:129` e `src/app/actions/vacancy.ts:154`

**Issue:** `deleteVacancy` e `advanceVacancyStatus` capturam exceções e apenas chamam `console.error`, sem retornar erro ao cliente. Se a operação falhar (ex.: permissão negada no disco), o componente `VacancyList` chama `router.refresh()` como se tudo tivesse ocorrido com sucesso. O usuário não recebe feedback de falha.

**Fix:** Retornar um objeto `{ error: string }` e tratar no lado do cliente, ou pelo menos relançar para que o framework capture:

```ts
export async function deleteVacancy(vacancyId: string): Promise<{ error?: string } | void> {
  try {
    await vacancyRepository.delete(vacancyId);
  } catch (error) {
    return { error: formatError(error) };
  }
}
```

---

### IN-03: Ordenação de vagas duplicada no repositório e no componente

**File:** `src/lib/repositories/vacancy-repository.ts:44-46` e `src/components/vacancy/vacancy-list.tsx:42-44`

**Issue:** `VacancyRepository.list()` já retorna vagas ordenadas por `openedAt` descendente. O componente `VacancyList` realiza a mesma ordenação novamente ao receber os dados. A lógica duplicada não causa um bug, mas cria acoplamento implícito e pode causar confusão se a ordenação do repositório for alterada futuramente.

**Fix:** Remover a ordenação redundante do componente e confiar na ordenação do repositório, ou tornar a responsabilidade explícita em apenas um dos dois lugares (preferencialmente no repositório, já que é o contrato público).

---

_Reviewed: 2026-04-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
