# Phase 8: Market Research Frontend - Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 9 (3 modificar/instalar, 6 criar)
**Analogs found:** 8/9 matches

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/(shell)/profiles/[id]/page.tsx` | page (server component) | request-response | `src/app/(shell)/profiles/[id]/edit/page.tsx` | exact |
| `src/lib/repositories/research-repository.ts` | repository | CRUD (read-only) | `src/lib/repositories/profile-repository.ts` | exact |
| `src/app/actions/research.ts` | server action | CRUD (read-only) | `src/app/actions/profile.ts` | role-match |
| `src/components/profile/profile-detail-tabs.tsx` | client component | state-management | `src/components/profile/profile-form.tsx` | role-match |
| `src/components/profile/profile-detail-perfil.tsx` | client component | presentation | `src/components/profile/profile-form.tsx` (seções) | role-match |
| `src/components/profile/profile-detail-vagas.tsx` | client component | presentation + state | `src/components/profile/profile-list.tsx` | role-match |
| `src/components/profile/profile-detail-resumo.tsx` | client component | presentation | `src/components/profile/profile-form.tsx` (seções) | role-match |
| `src/components/ui/tabs.tsx` | UI primitive | presentation | `src/components/ui/badge.tsx` (padrão shadcn) | exact |
| `src/components/profile/profile-list.tsx` | client component | presentation + navigation | (existente — modificar click) | MODIFY |

---

## Pattern Assignments

### `src/app/(shell)/profiles/[id]/page.tsx` (page, request-response)

**Analog:** `src/app/(shell)/profiles/[id]/edit/page.tsx`

**Pattern: Server Component com async params**
(Lines 1-27 from edit/page.tsx)

```typescript
import { notFound } from "next/navigation";
import { getProfile, updateProfile } from "@/app/actions/profile";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile) notFound();

  // ... render component
}
```

**New page structure for detail view:**
- Importar `getProfile()` para carregar perfil (reutilizar de `profile.ts`)
- Criar Server Action nova `getResearchesByProfileId(id)` em `research.ts` para listar pesquisas
- Passar `profile` e `researches[]` para Client Component `ProfileDetailTabs`
- Manter layout idêntico ao edit page: `<div className="p-8"><div className="w-full max-w-4xl">...`

---

### `src/lib/repositories/research-repository.ts` (repository, CRUD read-only)

**Analog:** `src/lib/repositories/profile-repository.ts` (lines 1-77)

**Pattern 1: Interface genérica + implementação JSON**

```typescript
// Interface definition (similar ao ProfileRepository)
export interface Research {
  profileId: string;
  date: string; // YYYY-MM-DD
  baseName: string;
  vagasFile: string;
  resumoFile: string;
}

export interface ResearchRepository {
  listByProfileId(profileId: string): Promise<Research[]>;
  getVagas(profileId: string, date: string): Promise<any | null>;
  getResumo(profileId: string, date: string): Promise<any | null>;
}
```

**Pattern 2: Path traversal guard (from profile-repository.ts lines 20-26)**

```typescript
private researchPath(profileId: string): string {
  if (!profileId || profileId.includes("..") || profileId.includes("/") || profileId.includes("\\")) {
    throw new Error(`ID de perfil inválido: "${profileId}"`);
  }
  const dir = ensureSubdir("research");
  return path.join(dir, profileId);
}
```

**Pattern 3: Try/catch with null fallback (from profile-repository.ts lines 48-56)**

```typescript
async findById(id: string): Promise<JobProfile | null> {
  try {
    const filePath = this.profilePath(id);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as JobProfile;
  } catch {
    return null;
  }
}
```

**Implementation-specific advice for Research:**
- Use regex `^(\d{4}-\d{2}-\d{2})(?:-\d)?-(vagas|resumo)\.json$` to match files with optional suffix (-2, -3)
- Group by date (one date may have both -vagas.json and -resumo.json files)
- Sort results by date descending (most recent first)
- Singleton export like ProfileRepository: `export const researchRepository = new JsonResearchRepository()`

---

### `src/app/actions/research.ts` (server action, CRUD read-only)

**Analog:** `src/app/actions/profile.ts`

**Pattern: Server Action with "use server" directive**
(Lines 1-2, 119-127)

```typescript
"use server";

export async function getProfile(
  profileId: string
): Promise<JobProfile | null> {
  return profileRepository.findById(profileId);
}
```

**For research actions, create two new functions:**
```typescript
"use server";

import { researchRepository } from "@/lib/repositories/research-repository";
import type { Research } from "@/lib/repositories/research-repository";

// Listar todas as pesquisas de um perfil (usado em page.tsx)
export async function getResearchesByProfileId(
  profileId: string
): Promise<Research[]> {
  return researchRepository.listByProfileId(profileId);
}

// Carregar vagas de uma pesquisa específica (usado em ProfileDetailVagas component)
export async function getVagasForDate(
  profileId: string,
  date: string
): Promise<any | null> {
  return researchRepository.getVagas(profileId, date);
}

// Carregar resumo de uma pesquisa específica (usado em ProfileDetailResumo component)
export async function getResumoForDate(
  profileId: string,
  date: string
): Promise<any | null> {
  return researchRepository.getResumo(profileId, date);
}
```

**Error handling pattern** (from profile.ts lines 69-73):
```typescript
try {
  await profileRepository.save(profile);
} catch {
  return { error: "Não foi possível salvar o perfil. Tente novamente." };
}
```

---

### `src/components/profile/profile-detail-tabs.tsx` (client component, state-management)

**Analog:** `src/components/profile/profile-form.tsx` (lines 1-50, state pattern)

**Pattern 1: Client directive + state initialization**

```typescript
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileDetailTabsProps {
  profile: JobProfile;
  researches: Research[];
}

export function ProfileDetailTabs({ profile, researches }: ProfileDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="perfil">Perfil</TabsTrigger>
        <TabsTrigger value="vagas">Vagas</TabsTrigger>
        <TabsTrigger value="resumo">Resumo de Mercado</TabsTrigger>
      </TabsList>

      <TabsContent value="perfil">
        <ProfileDetailPerfil profile={profile} />
      </TabsContent>

      <TabsContent value="vagas">
        <ProfileDetailVagas researches={researches} />
      </TabsContent>

      <TabsContent value="resumo">
        <ProfileDetailResumo researches={researches} />
      </TabsContent>
    </Tabs>
  );
}
```

---

### `src/components/profile/profile-detail-perfil.tsx` (client component, presentation)

**Analog:** `src/components/profile/profile-form.tsx` (sections pattern, lines 38-44, 94-122)

**Pattern: Conditional sections with "use client" + empty state handling**

```typescript
"use client";

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";

interface ProfileDetailPerfilProps {
  profile: JobProfile;
}

export function ProfileDetailPerfil({ profile }: ProfileDetailPerfilProps) {
  const handleEditClick = () => {
    window.location.href = `/profiles/${profile.id}/edit`;
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho com botão Editar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title-md font-medium text-on-surface">
            {profile.title}
          </h2>
        </div>
        <button
          onClick={handleEditClick}
          className="text-body-md font-medium text-tertiary hover:underline"
        >
          Editar
        </button>
      </div>

      {/* Responsabilidades — renderizado apenas se não vazio */}
      {profile.responsibilities.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Responsabilidades</h3>
          <ul className="space-y-2">
            {profile.responsibilities.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Qualificações — com badges obrigatório/desejável */}
      {profile.qualifications.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Qualificações</h3>
          <div className="space-y-2">
            {profile.qualifications.map((qual, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge
                  variant={qual.required ? "default" : "outline"}
                  className="shrink-0 mt-0.5"
                >
                  {qual.required ? "Obrigatório" : "Desejável"}
                </Badge>
                <span className="text-body-md text-on-surface">{qual.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comportamentos */}
      {profile.behaviors.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Competências Comportamentais</h3>
          <ul className="space-y-2">
            {profile.behaviors.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desafios */}
      {profile.challenges.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Desafios</h3>
          <ul className="space-y-2">
            {profile.challenges.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

---

### `src/components/profile/profile-detail-vagas.tsx` (client component, presentation + state)

**Analog:** `src/components/profile/profile-list.tsx` (lines 25-55, state pattern + conditional rendering)

**Pattern: State management for selection + conditional rendering for empty state**

```typescript
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Research } from "@/lib/repositories/research-repository";

interface ProfileDetailVagasProps {
  researches: Research[];
}

export function ProfileDetailVagas({ researches }: ProfileDetailVagasProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    researches[0]?.date ?? null
  );

  // Empty state (from profile-list.tsx lines 40-55)
  if (researches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-title-md font-medium text-on-surface mb-2">
          Nenhuma pesquisa de mercado
        </h3>
        <p className="text-body-md text-on-surface/60 mb-4">
          Nenhuma pesquisa foi realizada para este perfil.
        </p>
        <p className="text-body-md text-on-surface/60">
          Execute a skill <code className="bg-surface-container px-2 py-1 rounded-sm">/pesquisar-mercado</code> para gerar dados.
        </p>
      </div>
    );
  }

  const selectedResearch = researches.find((r) => r.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Seletor de data (múltiplas pesquisas) */}
      {researches.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-label-sm uppercase text-on-surface/60">
            Pesquisa:
          </label>
          <select
            value={selectedDate ?? ""}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-sm bg-surface-container px-3 py-2 text-body-md border border-outline-variant"
          >
            {researches.map((r) => (
              <option key={r.date} value={r.date}>
                {r.date}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de pesquisas */}
      <div className="space-y-2">
        {researches.map((research) => (
          <div
            key={research.date}
            className="flex items-center justify-between py-3 px-4 rounded-sm bg-surface-container-low hover:bg-surface-container cursor-pointer"
            onClick={() => setSelectedDate(research.date)}
          >
            <div className="flex-1">
              <p className="text-body-md font-medium text-on-surface">
                {research.date}
              </p>
            </div>
            <span className="text-label-sm text-on-surface/60">
              Pesquisa disponível
            </span>
          </div>
        ))}
      </div>

      {/* Accordion de vagas para pesquisa selecionada — carregado via Client useEffect ou prop */}
      {selectedResearch && (
        <div className="space-y-4">
          <h4 className="text-title-md font-medium text-on-surface">
            Vagas encontradas
          </h4>
          <Accordion type="single" collapsible>
            {/* Jobs renderizados aqui — necessário carregar -vagas.json via Server Action */}
          </Accordion>
        </div>
      )}
    </div>
  );
}
```

---

### `src/components/profile/profile-detail-resumo.tsx` (client component, presentation)

**Analog:** `src/components/profile/profile-form.tsx` (sections pattern, lines 38-44, 123-150)

**Pattern: Conditional rendering with section structure**

```typescript
"use client";

import type { Research } from "@/lib/repositories/research-repository";

interface ProfileDetailResumoProps {
  researches: Research[];
}

export function ProfileDetailResumo({ researches }: ProfileDetailResumoProps) {
  // Empty state
  if (researches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body-md text-on-surface/60 mb-4">
          Nenhum resumo de mercado disponível.
        </p>
        <p className="text-body-md text-on-surface/60">
          Execute <code className="bg-surface-container px-2 py-1 rounded-sm">/pesquisar-mercado</code> para gerar dados.
        </p>
      </div>
    );
  }

  // Usar pesquisa mais recente (primeiro elemento já que listByProfileId ordena decrescente)
  const resumo = researches[0];

  return (
    <div className="space-y-8">
      {/* Data do resumo (se múltiplas pesquisas) */}
      {researches.length > 1 && (
        <p className="text-label-sm text-on-surface/60">
          Resumo de: {resumo.date}
        </p>
      )}

      {/* Stack Frequency — ranqueado decrescente */}
      {resumo.stackFrequency && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Stack Frequência
          </h3>
          <div className="space-y-2">
            {Object.entries(resumo.stackFrequency)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([tech, count]) => (
                <div
                  key={tech}
                  className="flex items-center justify-between py-2 px-3 rounded-sm bg-surface-container-low"
                >
                  <span className="text-body-md text-on-surface">{tech}</span>
                  <span className="text-label-sm font-medium text-on-surface/70">
                    {count} menções
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Faixa Salarial com atribuição de fontes */}
      {resumo.salaryGuide && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Faixa Salarial
          </h3>
          <div className="space-y-2">
            {resumo.salaryGuide.sources?.map((source, idx) => (
              <p key={idx} className="text-body-md text-on-surface">
                <strong>{source.portal} {source.year}:</strong> R$
                {(resumo.salaryGuide.min / 1000).toFixed(1)}k – R$
                {(resumo.salaryGuide.max / 1000).toFixed(1)}k
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Common Titles */}
      {resumo.commonTitles && resumo.commonTitles.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Títulos Comuns no Mercado
          </h3>
          <ul className="space-y-1">
            {resumo.commonTitles.map((title, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Comportamentos Comuns */}
      {resumo.commonBehaviors && resumo.commonBehaviors.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Comportamentos Comuns
          </h3>
          <ul className="space-y-1">
            {resumo.commonBehaviors.map((behavior, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{behavior}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desafios Comuns */}
      {resumo.commonChallenges && resumo.commonChallenges.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Desafios Comuns
          </h3>
          <ul className="space-y-1">
            {resumo.commonChallenges.map((challenge, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Archetypes — ranqueado por contagem */}
      {resumo.archetypes && resumo.archetypes.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Arquétipos
          </h3>
          <ul className="space-y-1">
            {resumo.archetypes
              .sort((a, b) => (b.count || 0) - (a.count || 0))
              .map((arch, idx) => (
                <li key={idx} className="text-body-md text-on-surface flex gap-3">
                  <span className="shrink-0">•</span>
                  <span>{arch.name} ({arch.count} menções)</span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

---

### `src/components/ui/tabs.tsx` (UI primitive, presentation)

**Analog:** `src/components/ui/badge.tsx` (lines 1-49, shadcn component pattern)

**Installation:**
```bash
npx shadcn@latest add tabs
```

**Expected structure after installation** (from shadcn/radix-ui pattern):
- Importa `@radix-ui/react-tabs`
- Usa CVA (class-variance-authority) para styling
- Exporta `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Segue padrão de cn() utility para class merging

**No custom code needed** — o componente é gerado automaticamente pelo shadcn CLI.

---

### `src/components/profile/profile-list.tsx` (MODIFY — client component)

**Analog:** Próprio arquivo (lines 66-71)

**Mudança cirúrgica — ANTES:**
```typescript
onClick={() => router.push(`/profiles/${profile.id}/edit`)}
```

**DEPOIS:**
```typescript
onClick={() => router.push(`/profiles/${profile.id}`)}
```

**Contexto completo do card (lines 66-90):**
```typescript
return (
  <div
    key={profile.id}
    className="flex items-center justify-between py-4 gap-4 cursor-pointer"
    onClick={() => router.push(`/profiles/${profile.id}`)}  // ← MUDA AQUI
  >
    {/* Coluna esquerda: título e cargo sugerido */}
    <div className="flex-1 min-w-0">
      <p className="text-body-md font-medium text-on-surface truncate">
        {profile.title}
      </p>
      <p className="text-body-md text-on-surface/70">
        {profile.suggestedTitle}
      </p>
    </div>

    {/* Data de atualização */}
    <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/70 shrink-0">
      {updatedDate}
    </div>

    {/* Ações (NOT MODIFIED) */}
    <div
      className="flex gap-1 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botão Editar e Deletar mantêm `/profiles/${profile.id}/edit` */}
    </div>
  </div>
);
```

---

## Shared Patterns

### Imports Pattern (all new components)

**Source:** `src/components/profile/profile-form.tsx` (lines 1-25) + `src/app/(shell)/profiles/[id]/edit/page.tsx` (lines 1-3)

**Apply to:** All component files
```typescript
// Client components
"use client";
import { useState } from "react";
import type { JobProfile } from "@/lib/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Server components (pages)
import { notFound } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
```

### Error Handling Pattern (repositories)

**Source:** `src/lib/repositories/profile-repository.ts` (lines 28-46, 48-56)

**Apply to:** `research-repository.ts` all methods
```typescript
async listByProfileId(profileId: string): Promise<Research[]> {
  try {
    const dir = this.researchPath(profileId);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    // ... process files
    return results;
  } catch {
    return []; // Silent fallback
  }
}

async getVagas(profileId: string, date: string): Promise<any | null> {
  try {
    const filePath = path.join(this.researchPath(profileId), `${date}-vagas.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
```

### Conditional Section Rendering (all detail components)

**Source:** `src/components/profile/profile-form.tsx` (lines 482-495 responsabilities example)

**Apply to:** `profile-detail-perfil.tsx`, `profile-detail-resumo.tsx`
```typescript
{profile.responsibilities.length > 0 && (
  <section>
    <h3 className={SECTION_HEADING_CLASS}>Responsabilidades</h3>
    <ul className="space-y-2">
      {profile.responsibilities.map((item, idx) => (
        <li key={idx} className="text-body-md text-on-surface flex gap-3">
          <span className="shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
)}
```

### Empty State Pattern (read-only pages)

**Source:** `src/components/profile/profile-list.tsx` (lines 40-55)

**Apply to:** `profile-detail-vagas.tsx`, `profile-detail-resumo.tsx`
```typescript
if (researches.length === 0) {
  return (
    <div className="text-center py-12">
      <h3 className="text-title-md font-medium text-on-surface mb-2">
        Nenhuma pesquisa de mercado
      </h3>
      <p className="text-body-md text-on-surface/60">
        Execute a skill <code className="bg-surface-container px-2 py-1 rounded-sm">/pesquisar-mercado</code>.
      </p>
    </div>
  );
}
```

### Stop Propagation Pattern (action buttons)

**Source:** `src/components/profile/profile-list.tsx` (lines 88-91)

**Apply to:** `profile-list.tsx` (já existe, não modificar)
```typescript
<div
  className="flex gap-1 shrink-0"
  onClick={(e) => e.stopPropagation()}
>
  {/* Buttons for Edit/Delete */}
</div>
```

---

## No Analog Found

Files without close match (use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | — | — | Todos os arquivos possuem análogo direto ou padrão conhecido no projeto |

---

## Metadata

**Analog search scope:**
- `/src/app/(shell)/profiles/` — páginas e rotas
- `/src/lib/repositories/` — padrão de persistência
- `/src/app/actions/` — server actions
- `/src/components/profile/` — componentes de perfil
- `/src/components/ui/` — primitivos shadcn

**Files scanned:** 8 analogs + 1 file to install (tabs.tsx)

**Pattern extraction date:** 2026-04-26

---

*Pattern mapping complete — ready for planning*
