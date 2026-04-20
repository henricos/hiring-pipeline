---
phase: 02-job-profile-library
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/lib/profile.ts
  - src/lib/repositories/profile-repository.ts
  - src/app/actions/profile.ts
  - src/components/profile/profile-list.tsx
  - src/components/profile/profile-form.tsx
  - src/app/(shell)/profiles/page.tsx
  - src/app/(shell)/profiles/new/page.tsx
  - src/app/(shell)/profiles/[id]/edit/page.tsx
  - src/components/shell/left-rail.tsx
  - src/__tests__/profile.test.ts
  - src/components/ui/select.tsx
  - src/components/ui/textarea.tsx
  - src/components/ui/alert-dialog.tsx
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-20T00:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Esta fase implementa a biblioteca de perfis de vaga (Job Profile Library): tipos, repositório JSON, server actions e UI (lista, formulário, navegação). O design geral é sólido — separação de responsabilidades clara, interface de repositório intercambiável, path traversal bloqueado no repositório e na camada de dados.

Não foram encontradas vulnerabilidades de segurança críticas. Os problemas identificados concentram-se em quatro áreas: (1) deleção silenciosa sem feedback de erro ao usuário, (2) estado de formulário perdido em navegação condicional, (3) ausência de validação de enum no servidor (cast cego de FormData), e (4) ausência de cobertura de teste para os paths de persistência do repositório. Os itens de informação são menores e não afetam corretude.

---

## Warnings

### WR-01: Deleção silenciosa — erros engolidos sem feedback ao usuário

**File:** `src/app/actions/profile.ts:117-124`

**Issue:** `deleteProfile` captura todas as exceções com `catch` vazio e redireciona incondicionalmente. Se a chamada ao repositório falhar por qualquer motivo (permissões, disco cheio), o usuário é redirecionado para `/profiles` sem nenhuma indicação de que a deleção não ocorreu. O perfil ainda aparece na lista.

**Fix:**
```typescript
export async function deleteProfile(profileId: string): Promise<{ error?: string } | void> {
  try {
    await profileRepository.delete(profileId);
  } catch {
    return { error: "Não foi possível excluir o perfil. Tente novamente." };
  }
  redirect(withBasePath("/profiles"));
}
```
O componente `ProfileList` precisaria checar o retorno e exibir o erro, de forma similar ao padrão já adotado em `createProfile` e `updateProfile`.

---

### WR-02: Campos condicionais perdem valor ao alternar e reverter seleção

**File:** `src/components/profile/profile-form.tsx:166-178, 211-223, 253-265`

**Issue:** Os campos condicionais (`educationCourse`, `postGraduateCourse`, `certificationsWhich`) usam `defaultValue` fixo do `profile` prop e não mantêm estado local. Se o usuário (a) já tem um valor salvo, (b) muda o select pai para uma opção que oculta o campo, e (c) reverte para a opção original, o campo reaparece mas o valor digitado na sessão atual é perdido — o `defaultValue` volta ao valor original do banco. Em formulários longos isso gera confusão.

**Fix:** Controlar os valores condicionais com `useState`, inicializado com `profile?.educationCourse ?? ""` etc., e usar `value`/`onChange` em vez de `defaultValue`:
```tsx
const [educationCourse, setEducationCourse] = useState(profile?.educationCourse ?? "");

// No JSX:
{showEducationCourse && (
  <Input
    id="educationCourse"
    name="educationCourse"
    value={educationCourse}
    onChange={(e) => setEducationCourse(e.target.value)}
    className={INPUT_CLASS}
  />
)}
```

---

### WR-03: Enums de FormData não são validados no servidor — cast cego

**File:** `src/app/actions/profile.ts:25-41`

**Issue:** Campos de select como `experienceLevel`, `educationLevel`, `postGraduateLevel`, etc. são extraídos de `FormData` com cast direto (`as JobProfile["experienceLevel"]`), sem verificar se o valor corresponde a um dos valores válidos do union. Um cliente que manipule o formulário pode submeter qualquer string arbitrária, que será persistida no JSON sem rejeição.

Embora o app seja single-user e não exponha dados sensíveis, o padrão cria inconsistência nos dados persistidos e quebraria qualquer lógica futura que dependa da exhaustividade dos unions.

**Fix:** Adicionar um helper de validação de enum usando as constantes já exportadas:
```typescript
import { EXPERIENCE_LEVELS, EDUCATION_LEVELS, /* ... */ } from "@/lib/profile";

function assertOneOf<T extends string>(value: string, allowed: readonly T[], label: string): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`${label}: valor inválido "${value}"`);
  }
  return value as T;
}

// Em extractProfileData:
experienceLevel: assertOneOf(
  formData.get("experienceLevel") as string ?? "",
  EXPERIENCE_LEVELS,
  "Tempo de experiência"
),
```
Se qualquer assertiva falhar, envolver em try/catch e retornar `{ error: "Dados inválidos no formulário." }`.

---

### WR-04: `handleConfirmDelete` não aguarda a promise — erro de deleção silenciado na UI

**File:** `src/components/profile/profile-list.tsx:30-36`

**Issue:** Dentro de `startTransition`, `deleteProfile(deleteTarget.id)` é chamado sem `await`. `startTransition` aceita uma função síncrona como callback; promises não awaited dentro dele não são rastreadas pelo React Transition. Se a server action retornar um erro (ou quando WR-01 for corrigido para retornar `{ error }`) o resultado é completamente descartado.

```typescript
// Atual — promise descartada:
startTransition(() => {
  deleteProfile(deleteTarget.id);  // ← não awaited
});
```

**Fix:** Usar `useTransition` com callback assíncrono (suportado no React 19 / Next.js 15):
```typescript
startTransition(async () => {
  const result = await deleteProfile(deleteTarget.id);
  if (result?.error) {
    // exibir toast ou estado de erro
    setDeleteError(result.error);
  }
});
```
Isso também requer que `deleteProfile` seja ajustada conforme WR-01.

---

## Info

### IN-01: Navegação via `window.location.href` em vez de `router.push`

**File:** `src/components/profile/profile-list.tsx:69`

**Issue:** O click handler da linha usa `window.location.href = \`/profiles/${profile.id}/edit\`` para navegação, o que causa reload completo da página e ignora o basePath configurado. O botão de edição ao lado usa `<Link>` corretamente.

**Fix:** Remover o `onClick` da div container ou usar `useRouter`:
```typescript
import { useRouter } from "next/navigation";
const router = useRouter();

// No handler:
onClick={() => router.push(`/profiles/${profile.id}/edit`)}
```
Ou, mais simples, envolver toda a linha num `<Link>` e posicionar os botões de ação com `position: relative` / `z-index`.

---

### IN-02: Cobertura de testes ausente para `JsonProfileRepository`

**File:** `src/__tests__/profile.test.ts`

**Issue:** Os testes cobrem apenas os tipos union e `generateProfileId` de `src/lib/profile.ts`. Não há testes para `JsonProfileRepository` — os paths de `list()`, `findById()`, `save()` e `delete()` (incluindo validação de ID e comportamento idempotente) não são verificados.

**Fix:** Adicionar testes de integração leves para o repositório usando um diretório temporário (`fs.mkdtempSync`) ou mock de `fs`. Casos de interesse: ID com `..` lança erro, `findById` de ID inexistente retorna `null`, `delete` de ID inexistente não lança.

---

### IN-03: `isActive` no left rail usa igualdade exata — subrotas não ficam ativas

**File:** `src/components/shell/left-rail.tsx:31`

**Issue:** `const isActive = pathname === item.href` usa igualdade exata. Ao navegar para `/profiles/new` ou `/profiles/abc/edit`, o item "Perfis" no left rail não fica ativo, pois `pathname !== "/profiles"`.

**Fix:**
```typescript
const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
```

---

### IN-04: `align` prop não é um atributo válido de `SelectPrimitive.Content`

**File:** `src/components/ui/select.tsx:64-72`

**Issue:** `SelectContent` aceita e repassa um prop `align = "center"` para `SelectPrimitive.Content`. A API do Radix UI para `SelectContent` não possui prop `align` — o alinhamento é controlado pelo `position` (`"item-aligned"` ou `"popper"`). O prop é passado para o DOM element e provavelmente gera warning no console em runtime.

**Fix:** Remover `align` da assinatura e do spread de props de `SelectContent`, ou verificar na documentação da versão do Radix em uso se o prop foi adicionado recentemente.

---

_Reviewed: 2026-04-20T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
