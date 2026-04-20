---
phase: 02-job-profile-library
plan: B
type: execute
wave: 2
depends_on:
  - 02-PLAN-A
files_modified:
  - src/app/actions/profile.ts
autonomous: true
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-04
  - PROF-05

must_haves:
  truths:
    - "Manager pode criar perfil: createProfile() persiste um arquivo JSON em DATA_PATH/profiles/{id}.json"
    - "Manager pode editar perfil: updateProfile() sobrescreve o arquivo JSON com dados atualizados"
    - "Manager pode excluir perfil: deleteProfile() remove o arquivo JSON do disco"
    - "Manager pode listar perfis: listProfiles() retorna todos os perfis do diretório profiles/"
    - "Manager pode buscar perfil por ID: getProfile() retorna o perfil ou null se não encontrar"
    - "Server actions redirecionam para /profiles após operação bem-sucedida"
    - "Erros de IO são capturados e retornados como { error: string } — sem vazamento de stack trace"
  artifacts:
    - path: "src/app/actions/profile.ts"
      provides: "CRUD server actions para perfis de vaga"
      exports:
        - createProfile
        - updateProfile
        - deleteProfile
        - listProfiles
        - getProfile
  key_links:
    - from: "src/app/actions/profile.ts"
      to: "DATA_PATH/profiles/"
      via: "ensureSubdir('profiles') + fs.writeFileSync"
      pattern: "ensureSubdir.*profiles"
    - from: "src/app/actions/profile.ts"
      to: "src/lib/profile.ts"
      via: "import type { JobProfile } from '@/lib/profile'"
      pattern: "import.*JobProfile.*@/lib/profile"
    - from: "src/app/actions/profile.ts"
      to: "/profiles"
      via: "redirect(withBasePath('/profiles'))"
      pattern: "redirect.*withBasePath.*profiles"
---

<objective>
Criar as server actions de CRUD para perfis de vaga: createProfile, updateProfile, deleteProfile,
listProfiles e getProfile. Toda persistência ocorre como arquivos JSON individuais em DATA_PATH/profiles/.

Purpose: Camada de serviço que desacopla a UI da persistência. Componentes de formulário e lista
consomem estas actions sem acessar o sistema de arquivos diretamente.

Output: src/app/actions/profile.ts com cinco funções exportadas, seguindo o padrão de error
handling estabelecido em src/app/actions/auth.ts.
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
@.planning/phases/02-job-profile-library/02-PATTERNS.md
@.planning/phases/02-job-profile-library/02-A-SUMMARY.md

<interfaces>
<!-- Contratos estabelecidos no PLAN-A que este plano consome -->

De src/lib/profile.ts (criado em PLAN-A):
```typescript
export interface JobProfile {
  id: string;
  title: string;
  suggestedTitle: string;
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

export function generateProfileId(): string; // "profile-{timestamp}-{random7chars}"
```

De src/lib/data-service.ts (Phase 1):
```typescript
export function ensureSubdir(subdir: string): string; // retorna path absoluto, cria se não existir
// Valida que subdir não contém ".." (path traversal protection já implementada)
```

De src/app/actions/auth.ts (padrão de server action):
```typescript
"use server";
// Funções async com _prevState como primeiro argumento
// Erros retornados como { error: string }, nunca relançados para o client
// redirect() chamado após sucesso — nunca dentro de try/catch
```

De src/lib/base-path.ts:
```typescript
export function withBasePath(path: string): string; // prefixa com APP_BASE_PATH
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task B-1: Criar server actions CRUD para perfis</name>
  <files>
    src/app/actions/profile.ts
  </files>
  <read_first>
    - src/app/actions/auth.ts (OBRIGATÓRIO — padrão exato de "use server", error handling, redirect)
    - src/lib/data-service.ts (OBRIGATÓRIO — ensureSubdir, validações de path traversal existentes)
    - src/lib/base-path.ts (withBasePath para redirect correto)
    - src/lib/env.ts (env.DATA_PATH usado indiretamente via data-service)
    - .planning/phases/02-job-profile-library/02-CONTEXT.md (campos obrigatórios validados no server)
    - .planning/phases/02-job-profile-library/02-PATTERNS.md (seção src/app/actions/profile.ts — assinaturas exatas)
  </read_first>
  <behavior>
    - createProfile() com title="" retorna { error: "Título é obrigatório" }
    - createProfile() com title e suggestedTitle válidos persiste arquivo e redireciona para /profiles
    - createProfile() persiste arquivo em {DATA_PATH}/profiles/{id}.json onde id começa com "profile-"
    - updateProfile(id) com title="" retorna { error: "Título é obrigatório" }
    - updateProfile(id) com dados válidos sobrescreve o arquivo existente preservando createdAt
    - updateProfile("id-inexistente") retorna { error: "Perfil não encontrado" }
    - deleteProfile(id) remove o arquivo {DATA_PATH}/profiles/{id}.json
    - deleteProfile("id-inexistente") não lança exceção (idempotente)
    - listProfiles() retorna array vazio quando pasta profiles/ está vazia
    - listProfiles() retorna array com todos os perfis (um por arquivo .json)
    - getProfile(id) retorna null quando arquivo não existe
    - getProfile(id) retorna JobProfile quando arquivo existe
  </behavior>
  <action>
    Criar src/app/actions/profile.ts seguindo o padrão exato de src/app/actions/auth.ts.

    Estrutura do arquivo:

    ```typescript
    "use server";

    import fs from "fs";
    import path from "path";
    import { redirect } from "next/navigation";
    import { withBasePath } from "@/lib/base-path";
    import { ensureSubdir } from "@/lib/data-service";
    import type { JobProfile } from "@/lib/profile";
    import { generateProfileId } from "@/lib/profile";

    // Helper interno — não exportado
    function getProfilePath(profileId: string): string {
      const profilesDir = ensureSubdir("profiles");
      // Validação extra de path traversal no ID
      if (!profileId || profileId.includes("..") || profileId.includes("/") || profileId.includes("\\")) {
        throw new Error(`ID de perfil inválido: "${profileId}"`);
      }
      return path.join(profilesDir, `${profileId}.json`);
    }

    // Helper interno para extrair campos do FormData
    function extractProfileData(formData: FormData): Omit<JobProfile, "id" | "createdAt" | "updatedAt"> | { error: string } {
      const title = (formData.get("title") as string | null)?.trim() ?? "";
      if (!title) return { error: "Título é obrigatório" };

      const suggestedTitle = (formData.get("suggestedTitle") as string | null)?.trim() ?? "";
      if (!suggestedTitle) return { error: "Cargo sugerido para anúncio é obrigatório" };

      return {
        title,
        suggestedTitle,
        experienceLevel: formData.get("experienceLevel") as JobProfile["experienceLevel"],
        educationLevel: formData.get("educationLevel") as JobProfile["educationLevel"],
        educationCourse: (formData.get("educationCourse") as string | null)?.trim() || undefined,
        postGraduateLevel: formData.get("postGraduateLevel") as JobProfile["postGraduateLevel"],
        postGraduateCourse: (formData.get("postGraduateCourse") as string | null)?.trim() || undefined,
        certifications: formData.get("certifications") as JobProfile["certifications"],
        certificationsWhich: (formData.get("certificationsWhich") as string | null)?.trim() || undefined,
        englishLevel: formData.get("englishLevel") as JobProfile["englishLevel"],
        spanishLevel: formData.get("spanishLevel") as JobProfile["spanishLevel"],
        otherLanguage: (formData.get("otherLanguage") as string | null)?.trim() || undefined,
        otherLanguageLevel: (formData.get("otherLanguageLevel") as string | null) as JobProfile["otherLanguageLevel"] || undefined,
        responsibilities: (formData.get("responsibilities") as string | null)?.trim() ?? "",
        qualifications: (formData.get("qualifications") as string | null)?.trim() ?? "",
        behaviors: (formData.get("behaviors") as string | null)?.trim() ?? "",
        challenges: (formData.get("challenges") as string | null)?.trim() ?? "",
        additionalInfo: (formData.get("additionalInfo") as string | null)?.trim() ?? "",
        systemsRequired: (formData.get("systemsRequired") as string | null)?.trim() || undefined,
        networkFolders: (formData.get("networkFolders") as string | null)?.trim() || undefined,
        internalNotes: (formData.get("internalNotes") as string | null)?.trim() || undefined,
      };
    }

    export async function createProfile(
      _prevState: { error?: string } | null,
      formData: FormData
    ): Promise<{ error?: string } | void> {
      const data = extractProfileData(formData);
      if ("error" in data) return data;

      const now = Date.now();
      const profile: JobProfile = {
        id: generateProfileId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      try {
        const filePath = getProfilePath(profile.id);
        fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), "utf-8");
      } catch (error) {
        return { error: "Não foi possível salvar o perfil. Tente novamente." };
      }

      redirect(withBasePath("/profiles"));
    }

    export async function updateProfile(
      profileId: string,
      _prevState: { error?: string } | null,
      formData: FormData
    ): Promise<{ error?: string } | void> {
      const data = extractProfileData(formData);
      if ("error" in data) return data;

      let existing: JobProfile;
      try {
        const filePath = getProfilePath(profileId);
        if (!fs.existsSync(filePath)) {
          return { error: "Perfil não encontrado" };
        }
        existing = JSON.parse(fs.readFileSync(filePath, "utf-8")) as JobProfile;
      } catch {
        return { error: "Não foi possível carregar o perfil. Tente novamente." };
      }

      const updated: JobProfile = {
        ...existing,
        ...data,
        id: profileId,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      };

      try {
        const filePath = getProfilePath(profileId);
        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
      } catch {
        return { error: "Não foi possível salvar o perfil. Tente novamente." };
      }

      redirect(withBasePath("/profiles"));
    }

    export async function deleteProfile(profileId: string): Promise<void> {
      try {
        const filePath = getProfilePath(profileId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Silencioso se o arquivo não existe — idempotente
      }
      redirect(withBasePath("/profiles"));
    }

    export async function listProfiles(): Promise<JobProfile[]> {
      try {
        const profilesDir = ensureSubdir("profiles");
        const files = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".json"));
        const profiles = files
          .map((file) => {
            try {
              const content = fs.readFileSync(path.join(profilesDir, file), "utf-8");
              return JSON.parse(content) as JobProfile;
            } catch {
              return null;
            }
          })
          .filter((p): p is JobProfile => p !== null);
        return profiles;
      } catch {
        return [];
      }
    }

    export async function getProfile(profileId: string): Promise<JobProfile | null> {
      try {
        const filePath = getProfilePath(profileId);
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as JobProfile;
      } catch {
        return null;
      }
    }
    ```

    IMPORTANTE: redirect() deve ser chamado FORA de try/catch (Next.js lança NEXT_REDIRECT
    como exceção interna — capturá-lo quebraria o redirect). Verificar o padrão de auth.ts
    onde o redirect também está fora do catch.

    Após criar o arquivo, verificar que compila: `npx tsc --noEmit`
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - src/app/actions/profile.ts existe com "use server" na primeira linha
    - Exporta: createProfile, updateProfile, deleteProfile, listProfiles, getProfile
    - npx tsc --noEmit sai com código 0
    - grep "use server" src/app/actions/profile.ts retorna a diretiva
    - grep "export async function createProfile" src/app/actions/profile.ts retorna a função
    - grep "export async function listProfiles" src/app/actions/profile.ts retorna a função
    - grep "redirect(withBasePath" src/app/actions/profile.ts retorna ao menos uma linha
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| FormData → server action | Input não confiável do cliente chega via FormData; deve ser validado antes de persistir |
| profileId parameter → file system | IDs passados como parâmetro podem conter path traversal sequences |
| DATA_PATH/profiles/ → JSON files | Arquivos JSON lidos do disco podem estar corrompidos |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02B-01 | Tampering | getProfilePath() | mitigate | Validar que profileId não contém "..", "/", "\\" antes de construir o path; ensureSubdir() em data-service.ts já valida o subdir |
| T-02B-02 | Tampering | extractProfileData() | mitigate | Extrair campos via formData.get() com trim(); campos obrigatórios validados antes de persistir |
| T-02B-03 | Elevation of Privilege | createProfile / updateProfile | accept | Aplicação protegida por auth (Phase 1 middleware); todas as rotas exigem sessão válida |
| T-02B-04 | Information Disclosure | listProfiles() / getProfile() | accept | Dados de hiring são internos ao gestor; single-user sem necessidade de ACL por perfil |
| T-02B-05 | Denial of Service | fs.readdirSync em listProfiles() | accept | Volume de perfis em single-user é baixo (dezenas); sem risco de DoS em ambiente local |
| T-02B-06 | Tampering | JSON.parse em getProfile/listProfiles | mitigate | Capturar exceção de JSON malformado; retornar null/skip ao invés de propagar erro |
</threat_model>

<verification>
Após execução deste plano:

1. `grep -n "use server" src/app/actions/profile.ts | head -1`
   — retorna "1:\"use server\""

2. `grep "export async function" src/app/actions/profile.ts`
   — retorna 5 linhas: createProfile, updateProfile, deleteProfile, listProfiles, getProfile

3. `grep "ensureSubdir" src/app/actions/profile.ts`
   — retorna ao menos uma linha (uso da camada de persistência)

4. `grep "redirect(withBasePath" src/app/actions/profile.ts`
   — retorna ao menos uma linha (redirect após operações de mutação)

5. `npx tsc --noEmit`
   — sai com código 0
</verification>

<success_criteria>
- src/app/actions/profile.ts criado com as 5 funções exportadas
- Path traversal bloqueado no nível do profileId parameter
- redirect() fora de try/catch em createProfile, updateProfile e deleteProfile
- Erros de IO retornam { error: string } — sem stack trace exposto
- npx tsc --noEmit passa sem erros
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-job-profile-library/02-B-SUMMARY.md`
</output>
