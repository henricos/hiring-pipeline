---
phase: 08-market-research-frontend
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/app/actions/research.ts
  - src/app/(shell)/profiles/[id]/page.test.tsx
  - src/app/(shell)/profiles/[id]/page.tsx
  - src/components/profile/profile-detail-perfil.test.tsx
  - src/components/profile/profile-detail-perfil.tsx
  - src/components/profile/profile-detail-resumo.test.tsx
  - src/components/profile/profile-detail-resumo.tsx
  - src/components/profile/profile-detail-tabs.test.tsx
  - src/components/profile/profile-detail-tabs.tsx
  - src/components/profile/profile-detail-vagas.test.tsx
  - src/components/profile/profile-detail-vagas.tsx
  - src/components/profile/profile-list.tsx
  - src/components/ui/accordion.tsx
  - src/components/ui/tabs.tsx
  - src/lib/repositories/research-repository.test.ts
  - src/lib/repositories/research-repository.ts
  - src/test-setup.ts
  - vitest.config.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

A Phase 8 implementou o frontend de pesquisa de mercado: página de detalhe de perfil com abas (Perfil / Vagas / Resumo de Mercado), repositório JSON para pesquisas e server actions. O código é estruturalmente sólido, segue os padrões do projeto e cobre os casos básicos com testes unitários.

Foram encontrados: um problema de segurança (path traversal no parâmetro `date` das server actions), um bug funcional significativo (o Resumo de Mercado e as Vagas ficam sempre em branco em produção por ausência de prefetch de dados), um bug lógico no repositório (colisão de data usa `baseName` errado no getVagas), um problema de missing await em server action dentro de transição, e três itens de qualidade (baseName nunca populado, teste com asserção acidental, campo não persistido).

---

## Critical Issues

### CR-01: Path traversal no parâmetro `date` em `getVagas` e `getResumo`

**File:** `src/app/actions/research.ts:20-36` / `src/lib/repositories/research-repository.ts:106-131`

**Issue:** O parâmetro `date` recebido pelas server actions `getVagasForDate` e `getResumoForDate` é repassado diretamente para o repositório sem nenhuma validação. Dentro de `getVagas` e `getResumo`, o valor é inserido diretamente em `path.join(dir, \`${date}-vagas.json\`)`. Um `date` malicioso como `"../../../../../../../../etc/shadow"` resulta em tentativa de leitura de `/etc/shadow-vagas.json` (o sufixo `-vagas.json` mitiga o acesso a arquivos sem extensão, mas não elimina o risco). Next.js server actions podem ser invocadas via HTTP POST diretamente, tornando o `date` controlável por um atacante.

A validação de `profileId` contra path traversal (linhas 34-38 do repositório) existe e é correta, mas o parâmetro `date` não tem proteção equivalente.

**Fix:**
```typescript
// Em research-repository.ts — adicionar validação em getVagas e getResumo:
private validateDate(date: string): void {
  if (!date || !/^\d{4}-\d{2}-\d{2}(?:-\d+)?$/.test(date)) {
    throw new Error(`Data inválida: "${date}"`);
  }
}

async getVagas(profileId: string, date: string): Promise<any | null> {
  try {
    this.validateDate(date); // <- adicionar
    const dir = this.researchPath(profileId);
    ...
  }
}

async getResumo(profileId: string, date: string): Promise<any | null> {
  try {
    this.validateDate(date); // <- adicionar
    const dir = this.researchPath(profileId);
    ...
  }
}
```

---

## Warnings

### WR-01: Resumo de Mercado e Vagas sempre em branco em produção (dados nunca prefetchados)

**File:** `src/app/(shell)/profiles/[id]/page.tsx:1-30` / `src/components/profile/profile-detail-tabs.tsx:27-33`

**Issue:** `page.tsx` passa `researches` (lista de `Research[]`) para `ProfileDetailTabs`, mas nunca busca os dados de vagas (`getVagasForDate`) nem de resumo (`getResumoForDate`). Como resultado:

- `ProfileDetailTabs` passa `allVagas={}` (padrão) para `ProfileDetailVagas`. Ao clicar em uma pesquisa, `allVagas[date]` é `undefined`, então `jobsList = []` e a condição `allVagas[selectedDate] !== undefined` é falsa — nenhum conteúdo e nenhuma mensagem de "nenhuma vaga" é exibida. Silêncio total.
- `ProfileDetailResumo` recebe `researches` do tipo `Research[]`, sem o campo `resumoContent`. A verificação `resumoContent?.summary` resulta em `undefined` para todas as seções — o tab fica em branco (não mostra empty state porque `researches.length > 0`, mas também não mostra dados).

Este é o bug funcional mais impactante da fase: as duas abas novas ficam inutilizáveis em produção.

**Fix:** Prefetch dos dados no Server Component, ou implementar busca lazy no client:

```typescript
// Opção 1 (Server Component prefetch em page.tsx):
const researches = await getResearchesByProfileId(id);

// Pré-carregar vagas e resumos
const allVagas: Record<string, any> = {};
const researchesWithResumo = await Promise.all(
  researches.map(async (r) => {
    const vagas = await getVagasForDate(id, r.date);
    if (vagas?.jobs) allVagas[r.date] = vagas.jobs;
    const resumoContent = await getResumoForDate(id, r.date);
    return { ...r, resumoContent };
  })
);

// Passar para ProfileDetailTabs:
<ProfileDetailTabs profile={profile} researches={researchesWithResumo} allVagas={allVagas} />
```

### WR-02: `deleteProfile` não é `await`-ado dentro de `startTransition`

**File:** `src/components/profile/profile-list.tsx:34-36`

**Issue:** A função `handleConfirmDelete` chama `startTransition(() => { deleteProfile(deleteTarget.id); })`. `deleteProfile` é uma server action assíncrona que retorna `Promise<void>`. Dentro do callback síncrono de `startTransition`, a promise é disparada mas não aguardada — erros da server action são silenciosamente descartados e o estado pendente (`isPending`) pode não refletir o ciclo completo da operação.

```typescript
// Código atual — promise não aguardada:
startTransition(() => {
  deleteProfile(deleteTarget.id); // retorno Promise ignorado
});
```

**Fix:**
```typescript
// Usar async callback dentro de startTransition (suportado no React 19):
startTransition(async () => {
  await deleteProfile(deleteTarget.id);
});
```

### WR-03: `baseName` nunca é populado em `listByProfileId` — campo sempre vazio

**File:** `src/lib/repositories/research-repository.ts:75-91`

**Issue:** O objeto `Research` tem um campo `baseName` documentado como `"data ou data-2 (sufixo opcional)"`. Em `listByProfileId`, o objeto é criado com `baseName: ""` (linha 79) e nunca atualizado. O `baseName` correto poderia ser derivado do nome do arquivo sem a extensão e o tipo (`vagas`/`resumo`), por exemplo `"2026-04-24"` ou `"2026-04-24-2"`. Código consumidor que depender de `baseName` não terá o valor esperado.

Adicionalmente, quando há colisão de data (ex: `2026-04-24-vagas.json` e `2026-04-24-2-vagas.json`), a iteração sobrescreve `vagasFile` com o último arquivo encontrado (`2026-04-24-2-vagas.json`), mas `getVagas` ignora o `vagasFile` e sempre constrói o path como `${date}-vagas.json` (sem sufixo) — descasando com o arquivo real quando há colisão.

**Fix:**
```typescript
// Em listByProfileId, extrair baseName do arquivo:
const match = FILE_REGEX.exec(file as string);
if (!match) continue;

const date = match[1];
// baseName = tudo antes de "-vagas.json" ou "-resumo.json"
const baseName = file.replace(/-(vagas|resumo)\.json$/, "");

if (!map.has(date)) {
  map.set(date, {
    profileId,
    date,
    baseName,          // <- preencher corretamente
    vagasFile: "",
    resumoFile: "",
  });
}

// Em getVagas/getResumo, usar baseName do Research ao invés de reconstruir o path:
// Ou adicionar uma assinatura alternativa que aceite baseName.
```

### WR-04: Teste `profile-detail-vagas.test.tsx` — asserção acidental em "clicar em linha de pesquisa"

**File:** `src/components/profile/profile-detail-vagas.test.tsx:67-77`

**Issue:** O teste "clicar em uma linha de pesquisa expande as vagas inline" usa `mockResearches` com 2 itens. Com `researches.length > 1`, o componente renderiza um `<select>` — não linhas clicáveis com `div`. O `fireEvent.click(screen.getByText("2026-04-24"))` encontra o texto dentro de um `<option>` e o evento de clique não dispara o `onChange` do select.

O teste passa apenas porque `selectedDate` é inicializado com `researches[0]?.date = "2026-04-24"` e `allVagas["2026-04-24"]` já está populado — as vagas estavam visíveis antes mesmo do clique. O teste não valida o comportamento que descreve.

**Fix:**
```typescript
// Usar mockResearches com apenas 1 elemento para forçar o caminho de linhas clicáveis:
it("clicar em uma linha de pesquisa expande as vagas inline (D-06, VIZ-01)", () => {
  const singleResearch = [mockResearches[0]]; // <- apenas 1 pesquisa
  const allVagas = { "2026-04-24": mockVagasDia24 };

  // Garantir que não está expandido por padrão:
  render(<ProfileDetailVagas researches={singleResearch} allVagas={allVagas} />);

  // As vagas NÃO devem estar visíveis antes do clique (selectedDate = "2026-04-24" by default)
  // Para testar o click, usar defaultExpanded={undefined} e selectedDate=null inicial
  // Ou mockar o estado inicial como null:
  // ...
  fireEvent.click(screen.getByText("2026-04-24"));
  expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
});
```

Nota: a lógica de `selectedDate` inicial (`defaultExpanded ?? researches[0]?.date`) auto-seleciona a primeira pesquisa, então para testar o comportamento de "expandir ao clicar" de verdade, o componente precisaria de uma prop `initialExpanded={null}` ou o teste precisaria verificar o estado antes do clique.

---

## Info

### IN-01: `any` como retorno em `getVagas`, `getResumo` e server actions

**File:** `src/lib/repositories/research-repository.ts:21-22` / `src/app/actions/research.ts:23-36`

**Issue:** A interface `ResearchRepository` e as server actions usam `Promise<any | null>` para vagas e resumo. Os tipos concretos já existem em `profile-detail-resumo.tsx` (`ResumoContent`, `SalaryGuide`, etc.). Exportar e reutilizar esses tipos eliminaria `as any` no código consumidor e protegeria contra divergências de contrato.

**Fix:** Mover as interfaces `ResumoContent` e `VagasContent` para `research-repository.ts` ou um arquivo de tipos dedicado e tipar os retornos corretamente.

### IN-02: `src/components/ui/tabs.tsx` e `src/components/ui/accordion.tsx` não são usados

**File:** `src/components/ui/tabs.tsx` / `src/components/ui/accordion.tsx`

**Issue:** Nenhum arquivo fora dos primitivos de UI importa `tabs.tsx` ou `accordion.tsx`. O `ProfileDetailTabs` implementa sua própria lógica de abas com `useState`, sem usar o primitivo `Tabs`. Esses arquivos existem como primitivos de componente (shadcn-style) e podem ser mantidos para uso futuro, mas vale registrar que estão presentes sem consumo atual.

**Fix:** Nenhuma ação imediata necessária se a intenção for manter como biblioteca de primitivos. Considerar usar o primitivo `Tabs` de `ui/tabs.tsx` em `profile-detail-tabs.tsx` para consistência.

### IN-03: `window.location` mock em `test-setup.ts` não é resetado entre testes

**File:** `src/test-setup.ts:13-31`

**Issue:** O mock de `window.location` define `href` como `"http://localhost:3000/"` uma única vez na inicialização. O teste em `profile-detail-perfil.test.tsx:75-86` salva `originalHref` mas não o restaura no `afterEach`. Se o valor de `href` for alterado por um teste, os testes subsequentes que dependem do `href` inicial podem ver o valor modificado pelo teste anterior dependendo da ordem de execução.

**Fix:**
```typescript
// Em test-setup.ts, resetar o href entre testes:
beforeEach(() => {
  _location.href = "http://localhost:3000/";
});
```

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
