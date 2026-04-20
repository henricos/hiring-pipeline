---
phase: 02-job-profile-library
plan: C
type: execute
wave: 3
depends_on:
  - 02-PLAN-A
  - 02-PLAN-B
files_modified:
  - src/components/profile/profile-list.tsx
  - src/components/profile/profile-form.tsx
autonomous: true
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-04
  - PROF-05

must_haves:
  truths:
    - "ProfileList renderiza lista de perfis ordenada por updatedAt decrescente (D-05)"
    - "ProfileList exibe empty state com cópia exata do UI-SPEC quando profiles.length === 0"
    - "ProfileList tem botão de excluir com AlertDialog de confirmação antes de deletar (D-10)"
    - "ProfileForm renderiza todos os campos mapeados no formulário GH em 5 seções"
    - "ProfileForm exibe campos condicionais: educationCourse quando educationLevel !== 'Ensino médio'"
    - "ProfileForm exibe campos condicionais: postGraduateCourse quando postGraduateLevel !== 'Não exigido'"
    - "ProfileForm exibe campo certificationsWhich quando certifications !== 'Não'"
    - "ProfileForm exibe campos otherLanguage + otherLanguageLevel quando gestor preenche 'Outro idioma'"
    - "ProfileForm em modo edição pré-preenche todos os campos com dados do perfil existente"
    - "Botão Salvar perfil exibe 'Salvando…' durante isPending e está desabilitado"
    - "Erros de server action exibidos inline abaixo do formulário (padrão do login-form)"
  artifacts:
    - path: "src/components/profile/profile-list.tsx"
      provides: "Componente de lista de perfis com empty state e delete dialog"
      exports:
        - ProfileList
    - path: "src/components/profile/profile-form.tsx"
      provides: "Componente de formulário com todos os campos, campos condicionais, e integração com server actions"
      exports:
        - ProfileForm
  key_links:
    - from: "src/components/profile/profile-list.tsx"
      to: "src/app/actions/profile.ts"
      via: "deleteProfile(profileId)"
      pattern: "deleteProfile"
    - from: "src/components/profile/profile-form.tsx"
      to: "src/app/actions/profile.ts"
      via: "useActionState(onSubmitAction, null)"
      pattern: "useActionState"
    - from: "src/components/profile/profile-list.tsx"
      to: "/profiles/[id]/edit"
      via: "Link href=/profiles/{id}/edit ou router.push"
      pattern: "profiles.*edit"
---

<objective>
Criar os dois componentes React de perfil: ProfileList (lista com empty state e delete dialog) e
ProfileForm (formulário completo com seções, campos condicionais, e integração com server actions).

Purpose: Componentes reutilizáveis que as páginas de profiles/ consomem. ProfileForm serve tanto
criação (/profiles/new) quanto edição (/profiles/[id]/edit) via prop profile opcional.

Output: Dois arquivos em src/components/profile/ prontos para uso nas páginas (PLAN-D).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-job-profile-library/02-CONTEXT.md
@.planning/phases/02-job-profile-library/02-UI-SPEC.md
@.planning/phases/02-job-profile-library/02-PATTERNS.md
@.planning/phases/02-job-profile-library/02-A-SUMMARY.md
@.planning/phases/02-job-profile-library/02-B-SUMMARY.md

<interfaces>
<!-- Contratos dos planos A e B que este plano consome -->

De src/lib/profile.ts (PLAN-A):
```typescript
export interface JobProfile {
  id: string;
  title: string;
  suggestedTitle: string;
  experienceLevel: ExperienceLevel; // "< 1 ano" | "1-3 anos" | "3-5 anos" | "5-10 anos" | "> 10 anos"
  educationLevel: EducationLevel;   // "Ensino médio" | "Superior cursando" | "Superior completo"
  educationCourse?: string;
  postGraduateLevel: PostGraduateLevel; // "Não exigido" | "Desejável" | "Necessário"
  postGraduateCourse?: string;
  certifications: CertificationLevel;  // "Não" | "Desejável" | "Sim"
  certificationsWhich?: string;
  englishLevel: LanguageLevel;
  spanishLevel: LanguageLevel;
  otherLanguage?: string;
  otherLanguageLevel?: LanguageLevel;
  responsibilities: string;
  qualifications: string;
  behaviors: string;
  challenges: string;
  additionalInfo: string;
  systemsRequired?: string;
  networkFolders?: string;
  internalNotes?: string;
  createdAt: number;
  updatedAt: number;
}
export const EXPERIENCE_LEVELS: ExperienceLevel[];
export const EDUCATION_LEVELS: EducationLevel[];
export const POST_GRADUATE_LEVELS: PostGraduateLevel[];
export const CERTIFICATION_LEVELS: CertificationLevel[];
export const LANGUAGE_LEVELS: LanguageLevel[];
```

De src/app/actions/profile.ts (PLAN-B):
```typescript
export async function createProfile(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void>

export async function updateProfile(
  profileId: string,
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void>

export async function deleteProfile(profileId: string): Promise<void>
```

De src/components/login-form.tsx (padrão de useActionState):
```typescript
"use client";
const [error, action, isPending] = useActionState(authenticate, null);
// form action={action}
// Button disabled={isPending}
// Error display: bg-destructive/8 rounded-sm border border-destructive/25
```

Componentes shadcn disponíveis (instalados em PLAN-A):
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task C-1: Criar ProfileList com empty state e delete dialog</name>
  <files>
    src/components/profile/profile-list.tsx
  </files>
  <read_first>
    - src/components/login-form.tsx (padrão "use client", useActionState, error display)
    - src/components/shell/left-rail.tsx (padrão lucide icons, cn(), classes tailwind do design system)
    - src/components/ui/button.tsx (variante ghost para ações de linha)
    - src/components/ui/alert-dialog.tsx (estrutura do componente instalado em PLAN-A)
    - .planning/phases/02-job-profile-library/02-UI-SPEC.md (seção "List Page" e "Copywriting Contract")
    - .planning/phases/02-job-profile-library/02-PATTERNS.md (seção profile-list.tsx — padrão de row e empty state)
  </read_first>
  <action>
    Criar src/components/profile/profile-list.tsx (criar pasta src/components/profile/ se não existir).

    Props interface:
    ```typescript
    interface ProfileListProps {
      profiles: JobProfile[];
    }
    ```

    Comportamento:
    1. Ordenar perfis por updatedAt decrescente antes de renderizar:
       `const sorted = [...profiles].sort((a, b) => b.updatedAt - a.updatedAt);`

    2. Empty state quando profiles.length === 0:
       - Heading: "Nenhum perfil criado ainda" (text-title-md font-medium text-on-surface)
       - Body: "Crie um perfil-base para reutilizar ao abrir vagas. Cada perfil guarda requisitos, responsabilidades e qualificações." (text-body-md text-on-surface/60)
       - Link button: "Criar primeiro perfil" → href="/profiles/new"

    3. Cada linha de perfil (div com flex justify-between items-center py-4):
       - Coluna esquerda (flex-1): título em body-md font-medium + cargo sugerido em body-md text-on-surface/70
       - Coluna central/direita: data de atualização formatada em pt-BR (label-sm uppercase tracking-[0.05em] text-on-surface/70)
       - Coluna ações: Button size="icon" variant="ghost" com Pencil (edit) e Trash2 (delete)
       - ARIA: aria-label="Editar perfil [title]" e aria-label="Excluir perfil [title]"
       - Clicar em qualquer área da linha (exceto botões) → navegar para /profiles/{id}/edit
       - Tocar nos ícones Pencil → Link para /profiles/{id}/edit
       - Touch target mínimo: 40px (min-h-[40px] nos botões de ação)

    4. AlertDialog de confirmação antes de excluir (D-10):
       - Estado local: `const [deleteTarget, setDeleteTarget] = useState<JobProfile | null>(null)`
       - Botão Trash2 define `deleteTarget` e abre dialog
       - Título: "Excluir perfil?"
       - Corpo: `Esta ação não pode ser desfeita. O perfil '[deleteTarget.title]' será removido permanentemente.`
       - CTA destrutivo: "Excluir" — onClick chama `deleteProfile(deleteTarget.id)` via useTransition
       - CTA secundário: "Manter perfil" — fecha dialog sem ação
       - Usar useTransition para wrapping do deleteProfile (server action retorna void)

    5. Classes de separação entre linhas: py-4 na linha, gap via espaçamento (No-Line Rule — sem border-b)

    Formatação de data:
    ```typescript
    new Date(profile.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    ```

    Estrutura de imports:
    ```typescript
    "use client";
    import { useState, useTransition } from "react";
    import Link from "next/link";
    import { Pencil, Trash2 } from "lucide-react";
    import { Button } from "@/components/ui/button";
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
    import { deleteProfile } from "@/app/actions/profile";
    import type { JobProfile } from "@/lib/profile";
    ```
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - src/components/profile/profile-list.tsx existe e exporta ProfileList
    - grep "Nenhum perfil criado ainda" src/components/profile/profile-list.tsx retorna a cópia correta
    - grep "Excluir perfil?" src/components/profile/profile-list.tsx retorna a cópia do AlertDialog
    - grep "Manter perfil" src/components/profile/profile-list.tsx retorna o botão cancelar
    - npx tsc --noEmit passa sem erros
  </done>
</task>

<task type="auto">
  <name>Task C-2: Criar ProfileForm com todos os campos e condicionais</name>
  <files>
    src/components/profile/profile-form.tsx
  </files>
  <read_first>
    - src/components/login-form.tsx (OBRIGATÓRIO — padrão exato de useActionState, form action, error display, button)
    - src/components/ui/select.tsx (estrutura do componente Select shadcn)
    - src/components/ui/textarea.tsx (estrutura do componente Textarea shadcn)
    - src/components/ui/input.tsx (padrão de className para inputs)
    - .planning/phases/02-job-profile-library/02-UI-SPEC.md (OBRIGATÓRIO — Form Layout Contract, Select Field Values, Input Component Contracts, Interaction Contracts, Copywriting Contract)
    - .planning/phases/02-job-profile-library/02-PATTERNS.md (seção profile-form.tsx — padrão de conditional fields e seções)
    - .planning/references/excel-form-fields.md (cobertura completa dos campos)
  </read_first>
  <action>
    Criar src/components/profile/profile-form.tsx com as 5 seções do formulário.

    Props interface:
    ```typescript
    interface ProfileFormProps {
      profile?: JobProfile; // undefined = criação, JobProfile = edição
      onSubmitAction: (
        prevState: { error?: string } | null,
        formData: FormData
      ) => Promise<{ error?: string } | void>;
    }
    ```

    Integração com server action:
    ```typescript
    const [state, submitAction, isPending] = useActionState(
      (prevState: { error?: string } | null, formData: FormData) =>
        onSubmitAction(prevState, formData),
      null
    );
    ```

    ESTRUTURA DAS 5 SEÇÕES (em ordem conforme UI-SPEC):

    **Seção 1 — Identificação** (mt-8 mb-4 para a seção, space-y-4 para campos):
    - title: Input name="title" required, Label "Título do cargo"
    - suggestedTitle: Input name="suggestedTitle" required, Label "Cargo sugerido para anúncio"

    **Seção 2 — Requisitos do Candidato**:
    - experienceLevel: Select name="experienceLevel", opções de EXPERIENCE_LEVELS
    - educationLevel: Select name="educationLevel", opções de EDUCATION_LEVELS
      - Campo condicional: educationCourse (Input name="educationCourse") aparece quando
        educationLevel === "Superior cursando" || educationLevel === "Superior completo"
      - Animar com className="transition-all duration-150"
    - postGraduateLevel: Select name="postGraduateLevel", opções de POST_GRADUATE_LEVELS
      - Campo condicional: postGraduateCourse (Input name="postGraduateCourse") aparece quando
        postGraduateLevel === "Desejável" || postGraduateLevel === "Necessário"
    - certifications: Select name="certifications", opções de CERTIFICATION_LEVELS
      - Campo condicional: certificationsWhich (Input name="certificationsWhich") aparece quando
        certifications === "Desejável" || certifications === "Sim"
    - englishLevel: Select name="englishLevel", opções de LANGUAGE_LEVELS, Label "Inglês"
    - spanishLevel: Select name="spanishLevel", opções de LANGUAGE_LEVELS, Label "Espanhol"
    - Outro idioma: dois campos inline (flex gap-2):
      - otherLanguage: Input name="otherLanguage", placeholder="Nome do idioma"
      - otherLanguageLevel: Select name="otherLanguageLevel", opções de LANGUAGE_LEVELS
      - Aparece sempre (campos opcionais sem condicional)

    **Seção 3 — Conteúdo Descritivo** (5 textareas obrigatórios):
    - responsibilities: Textarea name="responsibilities", min-h-[120px] resize-y, Label "Responsabilidades e atribuições"
    - qualifications: Textarea name="qualifications", min-h-[120px] resize-y, Label "Requisitos e qualificações"
    - behaviors: Textarea name="behaviors", min-h-[120px] resize-y, Label "Características e competências comportamentais"
    - challenges: Textarea name="challenges", min-h-[120px] resize-y, Label "Principais desafios"
    - additionalInfo: Textarea name="additionalInfo", min-h-[120px] resize-y, Label "Informações complementares"

    **Seção 4 — Infraestrutura** (campos opcionais):
    - systemsRequired: Textarea name="systemsRequired", min-h-[80px] resize-y, Label "Sistemas necessários"
    - networkFolders: Textarea name="networkFolders", min-h-[80px] resize-y, Label "Pastas de rede"

    **Seção 5 — Observações Internas**:
    - internalNotes: Textarea name="internalNotes", min-h-[120px] resize-y, Label "Observações internas"
    - Hint abaixo do label: "Anotações internas — não publicadas externamente."
      (text-[0.6875rem] text-on-surface/50)

    CAMPOS CONDICIONAIS — implementar com useState:
    ```typescript
    const [educationLevel, setEducationLevel] = useState(profile?.educationLevel ?? "");
    const showEducationCourse =
      educationLevel === "Superior cursando" || educationLevel === "Superior completo";

    const [postGraduateLevel, setPostGraduateLevel] = useState(profile?.postGraduateLevel ?? "");
    const showPostGraduateCourse =
      postGraduateLevel === "Desejável" || postGraduateLevel === "Necessário";

    const [certifications, setCertifications] = useState(profile?.certifications ?? "");
    const showCertificationsWhich =
      certifications === "Desejável" || certifications === "Sim";
    ```

    CLASSES DE INPUT (padrão login-form.tsx):
    ```
    className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
    ```
    Aplicar mesma classe em Inputs e Textareas.

    CLASSES DE LABEL (padrão login-form.tsx):
    ```
    className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
    ```

    BOTÃO SALVAR (direita, fundo do form):
    ```typescript
    <div className="flex justify-end mt-8">
      <Button
        type="submit"
        disabled={isPending}
        className="gradient-cta text-on-tertiary px-6 py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {isPending ? "Salvando…" : "Salvar perfil"}
      </Button>
    </div>
    ```

    DISPLAY DE ERRO (padrão login-form.tsx, após useActionState):
    ```typescript
    {state?.error && (
      <div className="flex items-center gap-3 p-3 bg-destructive/8 rounded-sm border border-destructive/25">
        <p className="text-[0.75rem] font-medium text-destructive">{state.error}</p>
      </div>
    )}
    ```

    MODO EDIÇÃO — pré-preencher campos:
    - Inputs: defaultValue={profile?.fieldName ?? ""}
    - Textareas: defaultValue={profile?.fieldName ?? ""}
    - Selects: value controlado via useState inicializado com profile?.fieldName ?? ""

    Select values controlados (para condicionais), outros Selects podem usar defaultValue diretamente
    em SelectTrigger se não tiverem campo condicional.

    Para Selects SEM condicional vinculado, usar hidden input para passar o valor ao FormData:
    ```typescript
    // Alternativa limpa: usar Select com onValueChange + hidden input
    const [englishLevel, setEnglishLevel] = useState(profile?.englishLevel ?? "Não exigido");
    // ...
    <input type="hidden" name="englishLevel" value={englishLevel} />
    <Select value={englishLevel} onValueChange={setEnglishLevel}>
    ```

    Aplicar este padrão para todos os Select fields: englishLevel, spanishLevel, otherLanguageLevel.

    HEADING DE SEÇÃO:
    ```typescript
    <h2 className="text-[1.125rem] font-medium text-on-surface mt-8 mb-4">
      {sectionTitle}
    </h2>
    ```

    Container do form:
    ```typescript
    <div className="bg-white rounded-md px-8 py-8 max-w-3xl">
      <form action={submitAction} className="space-y-0">
        ...
      </form>
    </div>
    ```
    (Nota: bg-white = surface-container-lowest conforme design system)
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - src/components/profile/profile-form.tsx existe e exporta ProfileForm
    - grep "Salvar perfil" src/components/profile/profile-form.tsx retorna o texto do botão
    - grep "Salvando" src/components/profile/profile-form.tsx retorna o estado de loading
    - grep "Observações internas" src/components/profile/profile-form.tsx retorna a seção 5
    - grep "responsibilities" src/components/profile/profile-form.tsx retorna o field name
    - grep "Anotações internas" src/components/profile/profile-form.tsx retorna o hint text
    - npx tsc --noEmit passa sem erros
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| User input → FormData | Usuário preenche campos; FormData enviada ao server action via form action |
| profile prop → defaultValue | Dados lidos do disco são exibidos em inputs — não devem ser interpretados como HTML |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02C-01 | Tampering | ProfileForm inputs | accept | React sanitiza valores em defaultValue/value automaticamente; sem dangerouslySetInnerHTML |
| T-02C-02 | Information Disclosure | ProfileList | accept | Dados exibidos são do próprio gestor; single-user sem risco de exposição a terceiros |
| T-02C-03 | Elevation of Privilege | deleteProfile no client | mitigate | deleteProfile é server action protegida pelo middleware de auth (Phase 1); client apenas invoca |
| T-02C-04 | Denial of Service | AlertDialog state | accept | Estado local, sem side effects; componente Radix tem foco trapping para acessibilidade |
</threat_model>

<verification>
Após execução deste plano:

1. `ls src/components/profile/`
   — retorna profile-list.tsx e profile-form.tsx

2. `grep "export.*ProfileList" src/components/profile/profile-list.tsx`
   — retorna a declaração de export

3. `grep "export.*ProfileForm" src/components/profile/profile-form.tsx`
   — retorna a declaração de export

4. `grep "Nenhum perfil criado ainda" src/components/profile/profile-list.tsx`
   — retorna a cópia exata do UI-SPEC

5. `grep "responsibilities" src/components/profile/profile-form.tsx`
   — retorna ao menos 2 linhas (name e label)

6. `npx tsc --noEmit`
   — sai com código 0
</verification>

<success_criteria>
- ProfileList exibe empty state com cópia exata conforme UI-SPEC Copywriting Contract
- ProfileList tem AlertDialog de confirmação com título "Excluir perfil?" e botão "Manter perfil"
- ProfileForm cobre todos os campos do formulário GH (PROF-01, PROF-02, PROF-03, PROF-05)
- Campos condicionais (educationCourse, postGraduateCourse, certificationsWhich) aparecem/somem via useState
- Botão Salvar exibe "Salvando…" durante isPending
- npx tsc --noEmit passa sem erros
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-job-profile-library/02-C-SUMMARY.md`
</output>
