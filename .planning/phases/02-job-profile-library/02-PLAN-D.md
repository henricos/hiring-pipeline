---
phase: 02-job-profile-library
plan: D
type: execute
wave: 4
depends_on:
  - 02-PLAN-C
files_modified:
  - src/app/(shell)/profiles/page.tsx
  - src/app/(shell)/profiles/new/page.tsx
  - src/app/(shell)/profiles/[id]/edit/page.tsx
  - src/components/shell/left-rail.tsx
  - src/app/(shell)/page.tsx
autonomous: false
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-04
  - PROF-05

must_haves:
  truths:
    - "Acessar /profiles exibe a lista de perfis (ou empty state) — rota existe e não retorna 404"
    - "Acessar /profiles/new exibe o formulário de criação em branco"
    - "Acessar /profiles/{id}/edit com ID válido exibe o formulário pré-preenchido com dados do perfil"
    - "Acessar /profiles/{id}/edit com ID inválido retorna 404 (notFound())"
    - "Item 'Perfis' no left rail está habilitado e navega para /profiles (D-07)"
    - "Item 'Vagas' no left rail permanece disabled (Phase 4 não chegou)"
    - "Todas as rotas de perfil herdam autenticação da shell (sem página extra de login)"
    - "Home (/) continua funcionando — não foi quebrada pela adição de novas rotas"
  artifacts:
    - path: "src/app/(shell)/profiles/page.tsx"
      provides: "Página de lista de perfis em /profiles"
      contains: "ProfileList"
    - path: "src/app/(shell)/profiles/new/page.tsx"
      provides: "Página de criação de perfil em /profiles/new"
      contains: "ProfileForm"
    - path: "src/app/(shell)/profiles/[id]/edit/page.tsx"
      provides: "Página de edição de perfil em /profiles/[id]/edit"
      contains: "ProfileForm"
    - path: "src/components/shell/left-rail.tsx"
      provides: "Left rail com Perfis habilitado"
      contains: "disabled: false"
  key_links:
    - from: "src/app/(shell)/profiles/page.tsx"
      to: "src/components/profile/profile-list.tsx"
      via: "import { ProfileList } from '@/components/profile/profile-list'"
      pattern: "ProfileList"
    - from: "src/app/(shell)/profiles/[id]/edit/page.tsx"
      to: "src/app/actions/profile.ts"
      via: "getProfile(id) — fetch server-side"
      pattern: "getProfile"
    - from: "src/components/shell/left-rail.tsx"
      to: "/profiles"
      via: "NAV_ITEMS disabled: false"
      pattern: "disabled.*false"
---

<objective>
Criar as três rotas de páginas para profiles/ e habilitar o item "Perfis" no left rail.
Conectar tudo para que o gestor possa navegar para /profiles, criar e editar perfis.

Purpose: Último plano da Phase 2 — faz o CRUD de perfis funcionar de ponta a ponta no browser.
Sem este plano, os componentes e server actions existem mas não são acessíveis via navegação.

Output: Três arquivos de página em src/app/(shell)/profiles/, left rail com Perfis habilitado,
e checkpoint de verificação funcional pelo gestor.
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
@.planning/phases/02-job-profile-library/02-C-SUMMARY.md

<interfaces>
<!-- Contratos dos planos anteriores que este plano consome -->

De src/components/profile/profile-list.tsx (PLAN-C):
```typescript
export function ProfileList({ profiles }: { profiles: JobProfile[] }): JSX.Element
```

De src/components/profile/profile-form.tsx (PLAN-C):
```typescript
export function ProfileForm({
  profile,
  onSubmitAction
}: {
  profile?: JobProfile;
  onSubmitAction: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | void>;
}): JSX.Element
```

De src/app/actions/profile.ts (PLAN-B):
```typescript
export async function listProfiles(): Promise<JobProfile[]>
export async function getProfile(profileId: string): Promise<JobProfile | null>
export async function createProfile(_prevState, formData): Promise<{ error?: string } | void>
export async function updateProfile(profileId, _prevState, formData): Promise<{ error?: string } | void>
```

De src/app/(shell)/page.tsx (Phase 1 — padrão de página shell):
```typescript
// Server component, sem "use client"
// Exporta default function
// Layout herdado da shell automaticamente via src/app/(shell)/layout.tsx
```

De src/components/shell/left-rail.tsx (Phase 1 — modificar esta linha):
// NAV_ITEMS linha: { label: "Perfis", href: "/profiles", icon: Users, disabled: true }
// DEPOIS:         { label: "Perfis", href: "/profiles", icon: Users, disabled: false }
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task D-1: Criar rotas de páginas /profiles, /profiles/new, /profiles/[id]/edit</name>
  <files>
    src/app/(shell)/profiles/page.tsx
    src/app/(shell)/profiles/new/page.tsx
    src/app/(shell)/profiles/[id]/edit/page.tsx
  </files>
  <read_first>
    - src/app/(shell)/page.tsx (OBRIGATÓRIO — padrão de server component na shell)
    - src/app/(shell)/layout.tsx (confirmar que shell layout envolve automaticamente)
    - .planning/phases/02-job-profile-library/02-PATTERNS.md (seções das 3 páginas — estrutura exata)
    - .planning/phases/02-job-profile-library/02-UI-SPEC.md (Form Layout Contract — container classes e headings)
  </read_first>
  <action>
    Criar os três arquivos de página. Todos são server components (sem "use client").

    **1. src/app/(shell)/profiles/page.tsx** — Lista de perfis:
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
            <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface">
              Perfis de Vaga
            </h1>
            <Link href="/profiles/new">
              <Button className="gradient-cta text-on-tertiary font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all">
                Novo perfil
              </Button>
            </Link>
          </div>
          <Suspense fallback={<div className="text-body-md text-on-surface/50">Carregando...</div>}>
            <ProfilesContent />
          </Suspense>
        </div>
      );
    }
    ```

    **2. src/app/(shell)/profiles/new/page.tsx** — Criar perfil:
    ```typescript
    import { ProfileForm } from "@/components/profile/profile-form";
    import { createProfile } from "@/app/actions/profile";

    export default function NewProfilePage() {
      return (
        <div className="flex flex-col items-start p-8">
          <div className="w-full max-w-3xl">
            <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
              Novo perfil
            </h1>
            <ProfileForm onSubmitAction={createProfile} />
          </div>
        </div>
      );
    }
    ```

    **3. src/app/(shell)/profiles/[id]/edit/page.tsx** — Editar perfil:
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

      const submitWithId = updateProfile.bind(null, id);

      return (
        <div className="flex flex-col items-start p-8">
          <div className="w-full max-w-3xl">
            <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
              Editar perfil
            </h1>
            <ProfileForm profile={profile} onSubmitAction={submitWithId} />
          </div>
        </div>
      );
    }
    ```

    NOTA IMPORTANTE sobre updateProfile.bind:
    updateProfile tem assinatura: (profileId, _prevState, formData)
    Usar .bind(null, id) cria uma função com assinatura: (_prevState, formData)
    que corresponde exatamente ao que ProfileForm espera em onSubmitAction.
    Esta é a forma idiomática em Next.js Server Actions para passar parâmetros extras.

    Verificar compilação após criar os três arquivos.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - Os três arquivos existem nos diretórios corretos
    - grep "ProfileList" "src/app/(shell)/profiles/page.tsx" retorna a importação
    - grep "createProfile" "src/app/(shell)/profiles/new/page.tsx" retorna o uso
    - grep "notFound" "src/app/(shell)/profiles/[id]/edit/page.tsx" retorna o guard
    - grep "updateProfile.bind" "src/app/(shell)/profiles/[id]/edit/page.tsx" retorna a linha
    - npx tsc --noEmit passa sem erros
  </done>
</task>

<task type="auto">
  <name>Task D-2: Habilitar item Perfis no left rail</name>
  <files>
    src/components/shell/left-rail.tsx
  </files>
  <read_first>
    - src/components/shell/left-rail.tsx (OBRIGATÓRIO — ler o arquivo atual antes de modificar)
  </read_first>
  <action>
    Modificar src/components/shell/left-rail.tsx: alterar disabled de true para false no item Perfis.

    Localizar a linha:
    ```typescript
    { label: "Perfis", href: "/profiles", icon: Users, disabled: true },
    ```

    Substituir por:
    ```typescript
    { label: "Perfis", href: "/profiles", icon: Users, disabled: false },
    ```

    Não alterar mais nada no arquivo. Item "Vagas" permanece com disabled: true (Phase 4).

    Verificar que o arquivo compila.
  </action>
  <verify>
    <automated>grep "Perfis.*disabled.*false" src/components/shell/left-rail.tsx</automated>
  </verify>
  <done>
    - grep "Perfis.*disabled.*false" src/components/shell/left-rail.tsx retorna uma linha
    - grep "Vagas.*disabled.*true" src/components/shell/left-rail.tsx retorna uma linha (Vagas ainda disabled)
    - npx tsc --noEmit passa sem erros
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task D-3: Verificação funcional pelo gestor</name>
  <what-built>
    CRUD completo de perfis de vaga:
    - /profiles — lista perfis, empty state com botão "Criar primeiro perfil"
    - /profiles/new — formulário com 5 seções, todos os campos, botão "Salvar perfil"
    - /profiles/[id]/edit — formulário pré-preenchido, botão "Salvar perfil"
    - Left rail com item "Perfis" habilitado e apontando para /profiles
  </what-built>
  <how-to-verify>
    1. Iniciar a aplicação: `npm run dev`
    2. Acessar http://localhost:3000/hiring-pipeline e fazer login
    3. Verificar que no left rail o item "Perfis" está habilitado (clicável, não acinzentado)
    4. Clicar em "Perfis" → deve navegar para /hiring-pipeline/profiles
    5. Verificar empty state: "Nenhum perfil criado ainda" com botão "Criar primeiro perfil"
    6. Clicar "Novo perfil" (ou "Criar primeiro perfil") → navegar para /profiles/new
    7. Preencher os campos obrigatórios: Título do cargo, Cargo sugerido, e os 5 textareas
    8. Clicar "Salvar perfil" → deve redirecionar para /profiles com o perfil na lista
    9. Clicar no título do perfil criado → navegar para /profiles/{id}/edit com campos preenchidos
    10. Alterar o Título do cargo e clicar "Salvar perfil" → lista atualizada com novo título
    11. Clicar no ícone Trash2 do perfil → AlertDialog abre com "Excluir perfil?"
    12. Clicar "Manter perfil" → dialog fecha, perfil não excluído
    13. Clicar Trash2 novamente → confirmar com "Excluir" → perfil removido, lista atualiza
    14. Verificar que "Vagas" no left rail continua desabilitado (acinzentado, não clicável)
  </how-to-verify>
  <resume-signal>
    Digite "aprovado" se todos os 14 passos passaram.
    Ou descreva o que falhou para que o executor corrija antes de prosseguir.
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL params → getProfile | O parâmetro [id] da URL é input não confiável passado para getProfile() |
| Shell layout → rotas de perfil | Autenticação herdada do layout — verificar que não há bypass possível |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02D-01 | Elevation of Privilege | /profiles/[id]/edit via URL | mitigate | Middleware de auth (Phase 1) protege todas as rotas da shell; sem acesso sem sessão válida |
| T-02D-02 | Tampering | params.id na URL | mitigate | getProfile() valida o ID via getProfilePath() em profile.ts (bloqueia path traversal); notFound() para IDs inexistentes |
| T-02D-03 | Information Disclosure | EditProfilePage exibe dados | accept | Single-user; gestor acessa apenas seus próprios perfis; sem multi-tenancy |
| T-02D-04 | Spoofing | updateProfile.bind(null, id) | accept | id vem de params (URL); server action re-valida existência do arquivo antes de sobrescrever |
</threat_model>

<verification>
Após execução deste plano (automatizado):

1. `ls "src/app/(shell)/profiles/page.tsx"`
   — arquivo existe

2. `ls "src/app/(shell)/profiles/new/page.tsx"`
   — arquivo existe

3. `ls "src/app/(shell)/profiles/[id]/edit/page.tsx"`
   — arquivo existe

4. `grep "disabled.*false" src/components/shell/left-rail.tsx | grep Perfis`
   — retorna a linha do item Perfis habilitado

5. `grep "disabled.*true" src/components/shell/left-rail.tsx | grep Vagas`
   — retorna a linha do item Vagas desabilitado

6. `npx tsc --noEmit`
   — sai com código 0

7. `npm run build 2>&1 | tail -20`
   — build de produção completa sem erros

Após verificação humana (checkpoint D-3):
- Gestor confirma CRUD funcional de ponta a ponta
</verification>

<success_criteria>
- Três rotas de páginas criadas e funcionais: /profiles, /profiles/new, /profiles/[id]/edit
- Left rail com "Perfis" habilitado (disabled: false) e "Vagas" ainda desabilitado
- /profiles/{id}/edit com ID inválido retorna 404 via notFound()
- npm run build completa sem erros (build de produção)
- Gestor verifica e aprova o fluxo completo de CRUD no checkpoint D-3
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-job-profile-library/02-D-SUMMARY.md`
</output>
