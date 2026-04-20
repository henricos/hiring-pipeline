# Phase 2: Job Profile Library - Pattern Map

**Mapeado:** 2026-04-20
**Arquivos analisados:** 11 arquivos novos + 1 modificação (left-rail enablement)
**Analogs encontrados:** 10 / 11 (1 novo sem analog direto)

---

## Classificação de Arquivos

| Arquivo Novo/Modificado | Role | Data Flow | Analog mais próximo | Qualidade |
|-------------------------|------|-----------|---------------------|-----------|
| `src/lib/profile.ts` | utility/schema | — | `src/lib/auth.ts` | role-match (constants + types) |
| `src/app/actions/profile.ts` | service | CRUD | `src/app/actions/auth.ts` | exact (server actions + error handling) |
| `src/components/profile/profile-list.tsx` | component | request-response | `src/components/login-form.tsx` | role-match (form layout + styling) |
| `src/components/profile/profile-form.tsx` | component | request-response | `src/components/login-form.tsx` | exact (form with validation + state) |
| `src/app/(shell)/profiles/page.tsx` | component | request-response | `src/app/(shell)/page.tsx` | role-match (page with server-side layout) |
| `src/app/(shell)/profiles/new/page.tsx` | component | request-response | `src/app/(shell)/page.tsx` | role-match (page wrapper for form) |
| `src/app/(shell)/profiles/[id]/edit/page.tsx` | component | request-response | `src/app/(shell)/page.tsx` | role-match (page wrapper for form) |
| `src/components/ui/select.tsx` | component | — | `src/components/ui/button.tsx` | role-match (shadcn UI component) |
| `src/components/ui/textarea.tsx` | component | — | `src/components/ui/input.tsx` | exact (shadcn text input variant) |
| `src/components/ui/alert-dialog.tsx` | component | — | `src/components/ui/button.tsx` | role-match (shadcn UI component) |
| `src/components/shell/left-rail.tsx` | component (modificação) | event-driven | Existing file | exact (enable "Perfis" item) |

---

## Atribuições de Padrão

---

### `src/lib/profile.ts` (utility/schema, —)

**Ação:** Criar do zero. Definir types TypeScript e constantes de profile.

**Analog estrutural:** `/home/henrico/github/henricos/hiring-pipeline/src/lib/auth.ts` (linhas 1-8 — imports e uso de enums)

**Padrão de imports a usar:**
```typescript
// Não necesariamente importar types de bibliotecas externas
// Usar tipos nativos do TypeScript para constantes e enums
```

**Estrutura esperada do arquivo — tipos e constantes (nenhum código, apenas data):**
```typescript
// Tipos para o formulário (campos estruturados)
export type ExperienceLevel = "< 1 ano" | "1-3 anos" | "3-5 anos" | "5-10 anos" | "> 10 anos";
export type EducationLevel = "Ensino médio" | "Superior cursando" | "Superior completo";
export type PostGraduateLevel = "Não exigido" | "Desejável" | "Necessário";
export type CertificationLevel = "Não" | "Desejável" | "Sim";
export type LanguageLevel = "Não exigido" | "Básico" | "Intermediário" | "Avançado" | "Fluente";

// Tipo agregador principal do perfil
export interface JobProfile {
  id: string;
  // Identificação
  title: string;                    // título do cargo (interno)
  suggestedTitle: string;           // cargo sugerido para Gupy
  // Requisitos do candidato
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  educationCourse?: string;
  postGraduateLevel: PostGraduateLevel;
  postGraduateCourse?: string;
  certifications: CertificationLevel;
  certificationsWhich?: string;
  englishLevel: LanguageLevel;
  spanishLevel: LanguageLevel;
  otherLanguage?: string;
  otherLanguageLevel?: LanguageLevel;
  // Conteúdo descritivo (5 obrigatórios)
  responsibilities: string;
  qualifications: string;
  behaviors: string;
  challenges: string;
  additionalInfo: string;
  // Infraestrutura (opcional)
  systemsRequired?: string;
  networkFolders?: string;
  // Observações internas
  internalNotes?: string;
  // Metadados
  createdAt: number;  // timestamp
  updatedAt: number;  // timestamp
}

// Constantes para select options
export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "< 1 ano",
  "1-3 anos",
  "3-5 anos",
  "5-10 anos",
  "> 10 anos",
];

export const EDUCATION_LEVELS: EducationLevel[] = [
  "Ensino médio",
  "Superior cursando",
  "Superior completo",
];

export const POST_GRADUATE_LEVELS: PostGraduateLevel[] = [
  "Não exigido",
  "Desejável",
  "Necessário",
];

export const CERTIFICATION_LEVELS: CertificationLevel[] = [
  "Não",
  "Desejável",
  "Sim",
];

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  "Não exigido",
  "Básico",
  "Intermediário",
  "Avançado",
  "Fluente",
];

// Função utilitária para gerar ID
export function generateProfileId(): string {
  // Usar nanoid ou similar — Claude's Discretion
  // Padrão simples: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
```

---

### `src/app/actions/profile.ts` (service, CRUD)

**Ação:** Criar novo arquivo de server actions para CRUD de perfis. Copiar estrutura e padrão de erro do `auth.ts`.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/app/actions/auth.ts` (linhas 1-28)

**Imports pattern (linhas 1-6):**
```typescript
"use server";

import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/base-path";
import { ensureSubdir } from "@/lib/data-service";
import type { JobProfile } from "@/lib/profile";
import { generateProfileId } from "@/lib/profile";
```

**Error handling pattern (copiar de auth.ts linhas 21-27, adaptar):**
```typescript
// Padrão de tratamento de erro — retornar string de erro para client components
// Relançar erros não esperados
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro desconhecido. Tente novamente.";
}
```

**Assinatura de funções esperadas:**
```typescript
// Criar novo perfil
export async function createProfile(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void>

// Atualizar perfil existente
export async function updateProfile(
  profileId: string,
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void>

// Deletar perfil
export async function deleteProfile(profileId: string): Promise<void>

// Listar todos os perfis (fetch-only, sem mutation)
export async function listProfiles(): Promise<JobProfile[]>

// Buscar um perfil pelo ID
export async function getProfile(profileId: string): Promise<JobProfile | null>
```

**Padrão de camada de persistência (usar data-service.ts):**
```typescript
const profilesDir = ensureSubdir("profiles");
const profilePath = path.join(profilesDir, `${profileId}.json`);
fs.writeFileSync(profilePath, JSON.stringify(profile), "utf-8");
```

---

### `src/components/profile/profile-form.tsx` (component, request-response)

**Ação:** Criar novo componente de formulário de criação/edição. Copiar estrutura de `login-form.tsx` e aplicar padrão de controle de estado, integração com server actions, e layout de form.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/components/login-form.tsx` (linhas 1-80)

**Imports pattern (linhas 1-10):**
```typescript
"use client";

import React, { useState, useCallback } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JobProfile } from "@/lib/profile";
import { EXPERIENCE_LEVELS, LANGUAGE_LEVELS, ... } from "@/lib/profile";
```

**Props interface (novo padrão):**
```typescript
interface ProfileFormProps {
  profile?: JobProfile;  // undefined para create, JobProfile para edit
  onSubmitAction: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | void>;
}
```

**Estado do formulário (novo padrão):**
```typescript
const [error, submitAction, isPending] = useActionState(
  (prevState, formData) => onSubmitAction(prevState, formData),
  null
);
```

**Padrão de field com conditional sub-fields (D-03 do UI-SPEC):**
```typescript
// Exemplo: educationLevel com campo "curso" condicional
const [educationLevel, setEducationLevel] = useState(profile?.educationLevel ?? "");
const [showEducationCourse, setShowEducationCourse] = useState(
  profile?.educationLevel === "Superior completo" || profile?.educationLevel === "Superior cursando"
);

const handleEducationLevelChange = (value) => {
  setEducationLevel(value);
  setShowEducationCourse(value === "Superior completo" || value === "Superior cursando");
};

// Render:
<Select value={educationLevel} onValueChange={handleEducationLevelChange}>...</Select>
{showEducationCourse && <Input name="educationCourse" ... />}
```

**Padrão de layout (5 seções, sem cards — apenas headings + whitespace):**
```typescript
// Layout estrutura (seções):
1. Identificação — title, suggestedTitle
2. Requisitos do Candidato — experience, education, postgraduate, certifications, languages
3. Conteúdo Descritivo — 5 textareas
4. Infraestrutura — systemsRequired, networkFolders (optional)
5. Observações Internas — internalNotes (optional)

// CSS classes por seção:
<section className="mt-8 mb-4">
  <h2 className="text-title-md font-medium text-on-surface mb-4">Identificação</h2>
  {/* campos */}
</section>
```

**Error display pattern (copiar de login-form.tsx linhas 64-69):**
```typescript
{error && (
  <div className="flex items-center gap-3 p-3 bg-destructive/8 rounded-sm border border-destructive/25">
    <p className="text-[0.75rem] font-medium text-destructive">{error}</p>
  </div>
)}
```

**Save button pattern (copiar estilo de login-form.tsx linhas 71-77, adaptar label):**
```typescript
<Button
  type="submit"
  disabled={isPending}
  className="w-full gradient-cta text-on-tertiary py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
>
  {isPending ? "Salvando…" : "Salvar perfil"}
</Button>
```

---

### `src/components/profile/profile-list.tsx` (component, request-response)

**Ação:** Criar novo componente de lista de perfis. Copiar padrão de layout de página e estilo de lista do `login-form.tsx` (cards, spacing, buttons).

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/components/login-form.tsx` (padrão de composição: wrapper + espaçamento)

**Props interface:**
```typescript
interface ProfileListProps {
  profiles: JobProfile[];
  onDeleteStart?: (profileId: string) => void;
}
```

**Padrão de row (D-04 do CONTEXT):**
```typescript
// Cada linha contém:
// - Título (body-md, weight 500)
// - Cargo sugerido (body-md, weight 400, text-on-surface/70)
// - Última atualização (label-sm, all-caps, right-aligned)
// - Ações: edit + delete (icon buttons, 40px min height, lucide Pencil + Trash2)

<div className="flex items-center justify-between py-4 px-4 gap-4">
  <div className="flex-1 min-w-0">
    <p className="text-body-md font-medium text-on-surface truncate">{profile.title}</p>
    <p className="text-body-md text-on-surface/70">{profile.suggestedTitle}</p>
  </div>
  <div className="text-label-sm uppercase text-on-surface/70">
    {new Date(profile.updatedAt).toLocaleDateString("pt-BR")}
  </div>
  <div className="flex gap-2">
    <Button size="icon" variant="ghost" ... />  {/* edit */}
    <Button size="icon" variant="ghost" ... />  {/* delete */}
  </div>
</div>
```

**Empty state (E-01 do UI-SPEC, linhas 191-192):**
```typescript
{profiles.length === 0 && (
  <div className="text-center py-12">
    <h3 className="text-title-md font-medium text-on-surface mb-2">
      Nenhum perfil criado ainda
    </h3>
    <p className="text-body-md text-on-surface/60 mb-6">
      Crie um perfil-base para reutilizar ao abrir vagas. Cada perfil guarda requisitos, responsabilidades e qualificações.
    </p>
    <Link href="/profiles/new">
      <Button>Criar primeiro perfil</Button>
    </Link>
  </div>
)}
```

**Sorting (D-05: ordem por atualização, recente primeiro):**
```typescript
// Antes de render, ordenar:
const sortedProfiles = [...profiles].sort((a, b) => b.updatedAt - a.updatedAt);
```

---

### `src/app/(shell)/profiles/page.tsx` (component, request-response)

**Ação:** Criar nova página raiz de perfis. Copiar estrutura de `src/app/(shell)/page.tsx`.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/app/(shell)/page.tsx` (linhas 1-20)

**Padrão de estrutura esperada:**
```typescript
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileList } from "@/components/profile/profile-list";
import { listProfiles } from "@/app/actions/profile";

async function ProfilesContent() {
  const profiles = await listProfiles();
  return <ProfileList profiles={profiles} />;
}

export default function ProfilesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-sm font-medium text-on-surface">
          Perfis de Vaga
        </h1>
        <Link href="/profiles/new">
          <Button>Novo perfil</Button>
        </Link>
      </div>
      <Suspense fallback={<div>Carregando...</div>}>
        <ProfilesContent />
      </Suspense>
    </div>
  );
}
```

---

### `src/app/(shell)/profiles/new/page.tsx` (component, request-response)

**Ação:** Criar nova página para criar perfil. Wrapper simples do ProfileForm.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/app/(shell)/page.tsx` (padrão de page como wrapper)

**Estrutura esperada:**
```typescript
import { ProfileForm } from "@/components/profile/profile-form";
import { createProfile } from "@/app/actions/profile";

export default function NewProfilePage() {
  return (
    <div className="flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-headline-sm font-medium text-on-surface mb-8">
          Novo perfil
        </h1>
        <ProfileForm onSubmitAction={createProfile} />
      </div>
    </div>
  );
}
```

---

### `src/app/(shell)/profiles/[id]/edit/page.tsx` (component, request-response)

**Ação:** Criar nova página para editar perfil. Wrapper do ProfileForm com fetch de dados.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/app/(shell)/page.tsx`

**Estrutura esperada:**
```typescript
import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile, updateProfile } from "@/app/actions/profile";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile) {
    notFound();
  }

  // Criar função wrapper que injeta o ID
  const submitWithId = (prevState, formData) => updateProfile(id, prevState, formData);

  return (
    <div className="flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-headline-sm font-medium text-on-surface mb-8">
          Editar perfil
        </h1>
        <ProfileForm profile={profile} onSubmitAction={submitWithId} />
      </div>
    </div>
  );
}
```

---

### `src/components/ui/select.tsx` (component, —)

**Ação:** Instalar via shadcn CLI (`npx shadcn add select`). Zero customizações.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/components/ui/button.tsx` (padrão shadcn: usar como-is, sem modificações)

Nenhum código customizado — shadow/mirror do shadcn registry.

---

### `src/components/ui/textarea.tsx` (component, —)

**Ação:** Instalar via shadcn CLI (`npx shadcn add textarea`). Zero customizações.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/components/ui/input.tsx` (padrão shadcn input)

**Nota especial (D-03 do UI-SPEC, linhas 165):** Textarea mínima de 120px (3 linhas), resize vertical apenas.

Nenhum código customizado — usar como-is do shadcn.

---

### `src/components/ui/alert-dialog.tsx` (component, —)

**Ação:** Instalar via shadcn CLI (`npx shadcn add alert-dialog`). Zero customizações.

**Analog:** `/home/henrico/github/henricos/hiring-pipeline/src/components/ui/button.tsx` (padrão shadcn)

**Uso esperado (D-10 do CONTEXT):**
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Em profile-list.tsx, no handler do botão delete:
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir perfil?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. O perfil '{profile.title}' será removido permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="flex gap-3 justify-end">
      <AlertDialogCancel>Manter perfil</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleConfirmDelete}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Excluir
      </AlertDialogAction>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

Nenhum código customizado — usar como-is do shadcn.

---

### `src/components/shell/left-rail.tsx` (MODIFICAÇÃO: enable "Perfis")

**Ação:** Modificar arquivo existente. Remover `disabled: true` do item "Perfis" (linha 16).

**Analog:** Existing file, linhas 14-18

**Mudança esperada:**
```typescript
// ANTES (linha 16):
{ label: "Perfis", href: "/profiles", icon: Users, disabled: true },

// DEPOIS:
{ label: "Perfis", href: "/profiles", icon: Users, disabled: false },
```

Nenhuma outra mudança necessária. O componente já checa `disabled` em tempo de render.

---

## Padrões Compartilhados

### Server Actions para CRUD

**Fonte:** `src/app/actions/auth.ts`
**Aplicar em:** `profile.ts` e qualquer ação de mutação

```typescript
"use server";

// Padrão: função async com prevState como primeiro argumento
export async function actionName(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {
  try {
    // Lógica da ação
  } catch (error) {
    return { error: formatError(error) };
  }
  // Sucesso: redirect ou return vazio
  redirect(withBasePath("/profiles"));
}
```

### Validação e Extração de FormData

**Fonte:** `src/app/actions/auth.ts` (linhas 15-17)
**Aplicar em:** `profile.ts`

```typescript
// Padrão de extração tipada:
const username = (formData.get("username") as string | null) ?? "";
// ou
const title = formData.get("title") as string;
if (!title) {
  return { error: "Título é obrigatório" };
}
```

### Componentes com useActionState

**Fonte:** `src/components/login-form.tsx` (linhas 21)
**Aplicar em:** `profile-form.tsx`

```typescript
const [error, action, isPending] = useActionState(
  (prevState, formData) => submitAction(prevState, formData),
  null
);

// Render no form:
<form action={action} className="space-y-6">
  {error && <ErrorDisplay error={error} />}
  <Button disabled={isPending} type="submit">
    {isPending ? "Salvando…" : "Salvar"}
  </Button>
</form>
```

### Classes de Tipografia e Espaçamento

**Fonte:** `src/components/login-form.tsx` + `globals.css`
**Aplicar em:** Todos os componentes de Phase 2

| Token | Classe Tailwind | Uso |
|-------|---|---|
| Headline | `text-headline-sm font-medium` | Títulos de página |
| Title | `text-title-md font-medium` | Títulos de seção |
| Body | `text-body-md` | Textos, labels, inputs |
| Label | `text-label-sm font-semibold uppercase tracking-[0.05em]` | Hints, metadados |

| Espaçamento | Classe | Uso |
|---|---|---|
| xs | `gap-1` | Icon gaps |
| sm | `gap-2` | Inline small gaps |
| md | `gap-4` ou `space-y-4` | Form field gaps |
| lg | `gap-6` ou `p-6` | Card padding |
| xl | `mt-8 mb-4` | Section top margin |

### No-Line Rule (surface hierarchy, sem borders)

**Fonte:** DESIGN.md + `globals.css`
**Aplicar em:** Todas as divisões visuais

Nunca usar `border`, `border-b`, `border-t`. Separação apenas por tonalidade e whitespace:

```
surface (#f8f9fa) — fundo de página
  ↓ (whitespace)
surface-container-lowest (#ffffff) — form/card
  ↓ (whitespace xl = mt-8)
título de seção (text-title-md)
```

### Ícones e Componentes de UI

**Fonte:** `src/components/shell/left-rail.tsx` (linhas 5, 30-31)
**Usar em:** Todos os novos componentes

```typescript
import { Pencil, Trash2 } from "lucide-react";
// Render:
<Pencil className="w-4 h-4" />
<Trash2 className="w-4 h-4" />
```

---

## Sem Analog Encontrado

| Arquivo | Role | Data Flow | Motivo |
|---------|------|-----------|--------|
| `src/lib/profile.ts` | utility/schema | — | Schema de tipos novo (não existe em Phase 1) — mas padrão estrutural segue `app-brand.ts` |

---

## Pre-requisitos de Instalação (shadcn CLI)

Antes de implementar os componentes, executar:

```bash
npx shadcn add select
npx shadcn add textarea
npx shadcn add alert-dialog
```

Esses comandos instalam os componentes em `src/components/ui/` — nenhuma customização necessária além de usar como-is.

---

## Metadata

**Escopo de busca:** `src/` (Phase 1 codebase)
**Arquivos lidos:** 8 arquivos Phase 1
**Data de extração:** 2026-04-20
**Validade:** Até 2026-05-20 (patterns estáveis; UI-SPEC final)

---

## Notas Importantes

1. **Kebab-case:** Todos os nomes de arquivo seguem kebab-case: `profile-form.tsx`, `profile-list.tsx`, não `ProfileForm.tsx`.

2. **Server Actions + useActionState:** Phase 2 usa padrão estabelecido em Phase 1. `useActionState` é o hook que conecta client components a server actions com estado.

3. **Persistência JSON:** `ensureSubdir("profiles")` é chamado automaticamente em `profile.ts` no primeiro acesso. Não chamar em componentes — apenas em server actions.

4. **Conditional fields:** Estados internos do form gerenciam visibilidade de "Curso" após selecionar educação, "Quais" após selecionar certificações. Usar `useState` + onChange handlers (ver padrão em `profile-form.tsx`).

5. **Left-rail update:** Simples `disabled: false` no NAV_ITEMS — nenhuma refatoração.

6. **Error handling unificado:** String de erro retornada de server action é exibida no client via `useActionState`. Padrão idêntico ao `login-form.tsx`.
