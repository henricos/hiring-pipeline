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
  - data/profiles/profile-seed.json
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
    - "data/profiles/profile-seed.json existe com perfil de exemplo para testes em dev"
    - "Home (/) continua funcionando — não foi quebrada pela adição de novas rotas"
  artifacts:
    - path: "src/app/(shell)/profiles/page.tsx"
      provides: "Página de lista de perfis em /profiles"
    - path: "src/app/(shell)/profiles/new/page.tsx"
      provides: "Página de criação de perfil em /profiles/new"
    - path: "src/app/(shell)/profiles/[id]/edit/page.tsx"
      provides: "Página de edição de perfil em /profiles/[id]/edit"
    - path: "src/components/shell/left-rail.tsx"
      provides: "Left rail com Perfis habilitado"
    - path: "data/profiles/profile-seed.json"
      provides: "Perfil de exemplo para testes em ambiente dev"
  key_links:
    - from: "src/app/(shell)/profiles/page.tsx"
      to: "src/components/profile/profile-list.tsx"
      via: "import { ProfileList } from '@/components/profile/profile-list'"
      pattern: "ProfileList"
    - from: "src/app/(shell)/profiles/[id]/edit/page.tsx"
      to: "src/app/actions/profile.ts"
      via: "getProfile(id) + updateProfile.bind(null, id)"
      pattern: "getProfile"
    - from: "src/components/shell/left-rail.tsx"
      to: "/profiles"
      via: "NAV_ITEMS disabled: false"
      pattern: "disabled.*false"
---

<objective>
Criar as três rotas de páginas para profiles/, habilitar o item "Perfis" no left rail,
e criar um perfil de exemplo em data/profiles/ para uso em dev e testes.

Purpose: Último plano da Phase 2 — conecta tudo para que o gestor possa navegar e usar
o CRUD de ponta a ponta. O seed data garante que a aplicação tem estado inicial útil
para desenvolvimento sem precisar criar perfis manualmente a cada restart.

Output: Três páginas em src/app/(shell)/profiles/, left rail com Perfis habilitado,
data/profiles/profile-seed.json, e checkpoint de verificação funcional.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/02-job-profile-library/02-CONTEXT.md
@.planning/phases/02-job-profile-library/02-UI-SPEC.md
@.planning/phases/02-job-profile-library/02-PATTERNS.md
@.planning/phases/02-job-profile-library/02-C-SUMMARY.md

<interfaces>
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

De src/app/(shell)/page.tsx (Phase 1 — padrão de página server component na shell):
```typescript
// Server component async, sem "use client"
// Shell e auth herdados via src/app/(shell)/layout.tsx
```

De src/components/shell/left-rail.tsx (Phase 1 — modificar):
// { label: "Perfis", href: "/profiles", icon: Users, disabled: true }
// → disabled: false
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task D-1: Criar seed data em data/profiles/</name>
  <files>
    data/profiles/profile-seed.json
  </files>
  <read_first>
    - src/lib/profile.ts (interface JobProfile — garantir que todos os campos obrigatórios estão presentes)
    - .planning/phases/02-job-profile-library/02-CONTEXT.md (campos definidos, valores válidos para selects)
  </read_first>
  <action>
    Criar a pasta data/profiles/ e o arquivo data/profiles/profile-seed.json com um perfil
    realista de exemplo. O perfil deve preencher todos os campos obrigatórios e representar
    um cargo típico da área de P&D/Lyceum para que os testes sejam significativos.

    Conteúdo exato:

    ```json
    {
      "id": "profile-seed-engenheiro-software-01",
      "title": "Engenheiro(a) de Software Pleno",
      "suggestedTitle": "Engenheiro(a) de Software Pleno — P&D",
      "experienceLevel": "3-5 anos",
      "educationLevel": "Superior completo",
      "educationCourse": "Ciência da Computação, Engenharia de Software ou áreas correlatas",
      "postGraduateLevel": "Não exigido",
      "certifications": "Não",
      "englishLevel": "Intermediário",
      "spanishLevel": "Não exigido",
      "responsibilities": "Desenvolver e manter features do produto em ciclos ágeis de duas semanas.\nParticipar de code reviews garantindo qualidade e aderência aos padrões do time.\nColaborar com design e produto na definição técnica de novas funcionalidades.\nEscrever testes automatizados (unitários e de integração) para o código produzido.\nDocumentar decisões técnicas relevantes no repositório do projeto.",
      "qualifications": "Obrigatórios:\n- Experiência com TypeScript e React (mínimo 2 anos em projetos reais)\n- Conhecimento de Node.js e APIs REST\n- Familiaridade com Git e fluxos de pull request\n- Capacidade de trabalhar de forma assíncrona e documentar decisões\n\nDiferenciais:\n- Experiência com Next.js (App Router)\n- Conhecimento de Docker e containerização\n- Vivência com metodologias ágeis (Scrum ou Kanban)",
      "behaviors": "Comunicação clara e proativa — compartilha bloqueios antes que virem problemas.\nCuriosidade técnica — busca entender o porquê das decisões, não apenas implementar.\nOrganização — mantém o backlog de tasks atualizado e cumpre prazos combinados.\nColaboração — contribui com o crescimento técnico do time via reviews e pair programming.\nFoco em qualidade — prefere entregar menos com mais qualidade do que o contrário.",
      "challenges": "O principal desafio é equilibrar entrega de novas features com redução de débito técnico em uma base de código em crescimento acelerado. O candidato ideal será capaz de identificar oportunidades de melhoria incremental sem frear o ritmo do time.\n\nOutro desafio relevante é a comunicação com stakeholders não-técnicos: traduzir complexidade técnica em linguagem de negócio e alinhar expectativas de prazo com realidade de implementação.",
      "additionalInfo": "Posição remota com encontros presenciais mensais em São Paulo (SP).\nO time usa reuniões assíncronas como padrão — presença em calls é opt-in, não obrigatória.\nBenefícios: VR, VT, plano de saúde Bradesco, acesso a cursos e certificações pela empresa.",
      "systemsRequired": "GitHub, Linear, Figma, Notion, Slack",
      "internalNotes": "Perfil criado como exemplo de seed data para desenvolvimento. Baseado em cargo recorrente da área de P&D. Salário de referência: R$ 8.000–12.000 (CLT) dependendo de senioridade confirmada na entrevista técnica.",
      "createdAt": 1745000000000,
      "updatedAt": 1745000000000
    }
    ```

    Nota: os valores de createdAt/updatedAt são timestamps fixos (não Date.now()) para que
    o seed seja determinístico e não gere diff no git a cada execução.
  </action>
  <verify>
    <automated>ls data/profiles/profile-seed.json</automated>
  </verify>
  <done>
    - data/profiles/profile-seed.json existe
    - grep "profile-seed-engenheiro" data/profiles/profile-seed.json retorna o campo id
    - O arquivo é JSON válido (node -e "JSON.parse(require('fs').readFileSync('data/profiles/profile-seed.json','utf-8'))" sai com código 0)
  </done>
</task>

<task type="auto">
  <name>Task D-2: Criar rotas de páginas /profiles, /profiles/new, /profiles/[id]/edit</name>
  <files>
    src/app/(shell)/profiles/page.tsx
    src/app/(shell)/profiles/new/page.tsx
    src/app/(shell)/profiles/[id]/edit/page.tsx
  </files>
  <read_first>
    - src/app/(shell)/page.tsx (OBRIGATÓRIO — padrão server component na shell)
    - src/app/(shell)/layout.tsx (confirmar que shell layout envolve automaticamente)
    - .planning/phases/02-job-profile-library/02-UI-SPEC.md (Form Layout Contract — container e headings)
    - .planning/phases/02-job-profile-library/02-PATTERNS.md (seções das 3 páginas — estrutura exata)
  </read_first>
  <action>
    Criar os três arquivos de página. Todos são server components (sem "use client").

    **1. src/app/(shell)/profiles/page.tsx**:
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
          <Suspense fallback={<div className="text-[0.875rem] text-on-surface/50">Carregando...</div>}>
            <ProfilesContent />
          </Suspense>
        </div>
      );
    }
    ```

    **2. src/app/(shell)/profiles/new/page.tsx**:
    ```typescript
    import { ProfileForm } from "@/components/profile/profile-form";
    import { createProfile } from "@/app/actions/profile";

    export default function NewProfilePage() {
      return (
        <div className="p-8">
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

    **3. src/app/(shell)/profiles/[id]/edit/page.tsx**:
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

      if (!profile) notFound();

      const submitWithId = updateProfile.bind(null, id);

      return (
        <div className="p-8">
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

    NOTA: updateProfile.bind(null, id) cria função com assinatura (_prevState, formData)
    que é exatamente o que ProfileForm espera — padrão idiomático do Next.js para passar
    parâmetros extras a server actions.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - Os três arquivos existem
    - grep "ProfileList" "src/app/(shell)/profiles/page.tsx" retorna a importação
    - grep "createProfile" "src/app/(shell)/profiles/new/page.tsx" retorna o uso
    - grep "notFound" "src/app/(shell)/profiles/[id]/edit/page.tsx" retorna o guard
    - grep "updateProfile.bind" "src/app/(shell)/profiles/[id]/edit/page.tsx" retorna a linha
    - npx tsc --noEmit sai com código 0
  </done>
</task>

<task type="auto">
  <name>Task D-3: Habilitar item Perfis no left rail</name>
  <files>
    src/components/shell/left-rail.tsx
  </files>
  <read_first>
    - src/components/shell/left-rail.tsx (OBRIGATÓRIO — ler antes de modificar)
  </read_first>
  <action>
    Modificar src/components/shell/left-rail.tsx: alterar disabled de true para false
    apenas no item Perfis. Item Vagas permanece disabled: true.

    Localizar:
    ```typescript
    { label: "Perfis", href: "/profiles", icon: Users, disabled: true },
    ```

    Substituir por:
    ```typescript
    { label: "Perfis", href: "/profiles", icon: Users, disabled: false },
    ```

    Não alterar mais nada no arquivo.
  </action>
  <verify>
    <automated>grep "Perfis.*disabled.*false" src/components/shell/left-rail.tsx</automated>
  </verify>
  <done>
    - grep "Perfis.*disabled.*false" src/components/shell/left-rail.tsx retorna uma linha
    - grep "Vagas.*disabled.*true" src/components/shell/left-rail.tsx retorna uma linha
    - npx tsc --noEmit sai com código 0
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task D-4: Verificação funcional pelo gestor</name>
  <what-built>
    CRUD completo de perfis + seed data:
    - data/profiles/profile-seed.json — perfil de exemplo visível ao subir a aplicação
    - /profiles — lista perfis ordenados por atualização
    - /profiles/new — formulário com 5 seções e todos os campos
    - /profiles/[id]/edit — formulário pré-preenchido
    - Left rail com item "Perfis" habilitado
  </what-built>
  <how-to-verify>
    1. Certificar que DATA_PATH aponta para o diretório data/ local (verificar .env.local)
    2. Iniciar a aplicação: `npm run dev`
    3. Acessar http://localhost:3000/hiring-pipeline e fazer login
    4. Verificar que item "Perfis" no left rail está habilitado (clicável)
    5. Clicar "Perfis" → /profiles deve exibir o perfil seed "Engenheiro(a) de Software Pleno"
    6. Clicar no perfil seed → /profiles/{id}/edit com todos os campos pré-preenchidos
    7. Alterar o título e clicar "Salvar perfil" → lista atualizada com novo título
    8. Clicar "Novo perfil" → /profiles/new com formulário em branco
    9. Preencher campos obrigatórios e salvar → novo perfil aparece na lista
    10. Testar campos condicionais: selecionar "Superior completo" → campo "Curso" aparece
    11. Selecionar "Desejável" em Pós-graduação → campo "Curso" aparece
    12. Selecionar "Sim" em Certificações → campo "Quais" aparece
    13. Clicar Trash2 em um perfil → AlertDialog "Excluir perfil?" aparece
    14. Clicar "Manter perfil" → dialog fecha sem excluir
    15. Clicar Trash2 novamente → confirmar "Excluir" → perfil removido
    16. Verificar que "Vagas" no left rail continua desabilitado
  </how-to-verify>
  <resume-signal>
    Digite "aprovado" se todos os 16 passos passaram.
    Ou descreva o que falhou para que o executor corrija antes de prosseguir.
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL params → getProfile | [id] da URL é input não confiável |
| data/profiles/ → seed file | Arquivo de seed é lido pela mesma rota que dados reais |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02D-01 | Elevation of Privilege | rotas /profiles/* | mitigate | Middleware de auth (Phase 1) protege shell; todas as rotas herdam automaticamente |
| T-02D-02 | Tampering | params.id via URL | mitigate | getProfile() → profileRepository.findById() → JsonProfileRepository.profilePath() valida path traversal |
| T-02D-03 | Information Disclosure | seed data | accept | Dados de exemplo são não-sensíveis; ambiente dev; sem exposição em produção via volume Docker |
| T-02D-04 | Spoofing | updateProfile.bind(null, id) | accept | id vem de params; server action re-valida existência antes de sobrescrever |
</threat_model>

<verification>
1. `ls data/profiles/profile-seed.json` — arquivo de seed existe

2. `node -e "JSON.parse(require('fs').readFileSync('data/profiles/profile-seed.json','utf-8'))"` — JSON válido

3. `ls "src/app/(shell)/profiles/page.tsx" "src/app/(shell)/profiles/new/page.tsx"` — páginas existem

4. `grep "disabled.*false" src/components/shell/left-rail.tsx | grep Perfis` — item habilitado

5. `grep "disabled.*true" src/components/shell/left-rail.tsx | grep Vagas` — Vagas ainda desabilitado

6. `npx tsc --noEmit` — código 0

7. `npm run build 2>&1 | tail -10` — build de produção sem erros

Após checkpoint D-4: gestor confirma CRUD funcional com seed data visível.
</verification>

<success_criteria>
- data/profiles/profile-seed.json com perfil realista visível ao subir a aplicação
- Três rotas funcionais: /profiles, /profiles/new, /profiles/[id]/edit
- Left rail com "Perfis" habilitado e "Vagas" ainda desabilitado
- /profiles/{id}/edit com ID inválido retorna 404
- npm run build completa sem erros
- Gestor verifica e aprova fluxo completo no checkpoint D-4
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-job-profile-library/02-D-SUMMARY.md`
</output>
