---
phase: 02-job-profile-library
plan: B
type: execute
wave: 2
depends_on:
  - 02-PLAN-A
files_modified:
  - src/lib/repositories/profile-repository.ts
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
    - "ProfileRepository interface exportada em src/lib/repositories/profile-repository.ts com métodos list, findById, save, delete"
    - "JsonProfileRepository implementa ProfileRepository persistindo em DATA_PATH/profiles/{id}.json"
    - "profileRepository (singleton) exportado e pronto para uso pelas server actions"
    - "Manager pode criar perfil: createProfile() delega para profileRepository.save() e redireciona para /profiles"
    - "Manager pode editar perfil: updateProfile() carrega via findById, mescla campos, salva via save()"
    - "Manager pode excluir perfil: deleteProfile() delega para profileRepository.delete()"
    - "Manager pode listar perfis: listProfiles() delega para profileRepository.list()"
    - "Manager pode buscar perfil por ID: getProfile() delega para profileRepository.findById()"
    - "Erros de IO capturados e retornados como { error: string } nas actions — sem stack trace exposto"
    - "Nenhuma chamada a fs.* dentro de src/app/actions/profile.ts — toda I/O passa pelo repository"
  artifacts:
    - path: "src/lib/repositories/profile-repository.ts"
      provides: "Interface ProfileRepository + implementação JsonProfileRepository + singleton profileRepository"
      exports:
        - ProfileRepository
        - JsonProfileRepository
        - profileRepository
    - path: "src/app/actions/profile.ts"
      provides: "Server actions CRUD que delegam ao repository"
      exports:
        - createProfile
        - updateProfile
        - deleteProfile
        - listProfiles
        - getProfile
  key_links:
    - from: "src/app/actions/profile.ts"
      to: "src/lib/repositories/profile-repository.ts"
      via: "import { profileRepository } from '@/lib/repositories/profile-repository'"
      pattern: "import.*profileRepository.*repositories/profile-repository"
    - from: "src/lib/repositories/profile-repository.ts"
      to: "src/lib/data-service.ts"
      via: "import { ensureSubdir } from '@/lib/data-service'"
      pattern: "ensureSubdir"
    - from: "src/app/actions/profile.ts"
      to: "/profiles"
      via: "redirect(withBasePath('/profiles'))"
      pattern: "redirect.*withBasePath.*profiles"
---

<objective>
Criar a camada de repositório para perfis (ProfileRepository interface + JsonProfileRepository)
e as server actions que delegam exclusivamente ao repositório — sem acesso direto ao fs.

Purpose: Separação de concerns que permite trocar JSON por banco de dados no futuro sem tocar
nas server actions nem nos componentes. A interface ProfileRepository é o contrato; a
implementação Json é apenas a estratégia atual.

Output: src/lib/repositories/profile-repository.ts com interface + implementação + singleton;
src/app/actions/profile.ts com 5 funções que usam o repositório.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/02-job-profile-library/02-CONTEXT.md
@.planning/phases/02-job-profile-library/02-PATTERNS.md
@.planning/phases/02-job-profile-library/02-A-SUMMARY.md

<interfaces>
De src/lib/profile.ts (criado em PLAN-A):
```typescript
export interface JobProfile {
  id: string; title: string; suggestedTitle: string;
  experienceLevel: ExperienceLevel; educationLevel: EducationLevel;
  educationCourse?: string; postGraduateLevel: PostGraduateLevel;
  postGraduateCourse?: string; certifications: CertificationLevel;
  certificationsWhich?: string; englishLevel: LanguageLevel;
  spanishLevel: LanguageLevel; otherLanguage?: string;
  otherLanguageLevel?: LanguageLevel; responsibilities: string;
  qualifications: string; behaviors: string; challenges: string;
  additionalInfo: string; systemsRequired?: string;
  networkFolders?: string; internalNotes?: string;
  createdAt: number; updatedAt: number;
}
export function generateProfileId(): string;
```

De src/lib/data-service.ts (Phase 1):
```typescript
export function ensureSubdir(subdir: string): string;
// Valida path traversal, retorna path absoluto, cria pasta se não existir
```

De src/app/actions/auth.ts (padrão de server action):
```typescript
"use server";
// redirect() FORA de try/catch — NEXT_REDIRECT é exceção interna do Next.js
// Erros retornados como { error: string }, nunca relançados
```

De src/lib/base-path.ts:
```typescript
export function withBasePath(path: string): string;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task B-1: Criar ProfileRepository interface e JsonProfileRepository</name>
  <files>
    src/lib/repositories/profile-repository.ts
  </files>
  <read_first>
    - src/lib/data-service.ts (OBRIGATÓRIO — ensureSubdir, validações existentes de path traversal)
    - src/lib/profile.ts (interface JobProfile e generateProfileId)
    - src/lib/auth.ts (padrão de arquivo lib — sem "use server")
  </read_first>
  <action>
    Criar pasta src/lib/repositories/ e o arquivo profile-repository.ts.

    Este arquivo NÃO usa "use server" — é um módulo de biblioteca puro importado por server code.

    Conteúdo exato:

    ```typescript
    import fs from "fs";
    import path from "path";
    import { ensureSubdir } from "@/lib/data-service";
    import type { JobProfile } from "@/lib/profile";

    // ─── Interface pública ───────────────────────────────────────────────────────
    // Trocar de JSON para banco de dados = nova implementação desta interface.
    // Server actions e componentes não precisam mudar.

    export interface ProfileRepository {
      list(): Promise<JobProfile[]>;
      findById(id: string): Promise<JobProfile | null>;
      save(profile: JobProfile): Promise<void>;   // cria ou sobrescreve
      delete(id: string): Promise<void>;          // idempotente
    }

    // ─── Implementação JSON ──────────────────────────────────────────────────────

    export class JsonProfileRepository implements ProfileRepository {
      private profilePath(id: string): string {
        if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
          throw new Error(`ID de perfil inválido: "${id}"`);
        }
        const dir = ensureSubdir("profiles");
        return path.join(dir, `${id}.json`);
      }

      async list(): Promise<JobProfile[]> {
        try {
          const dir = ensureSubdir("profiles");
          const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
          return files
            .map((file) => {
              try {
                return JSON.parse(
                  fs.readFileSync(path.join(dir, file), "utf-8")
                ) as JobProfile;
              } catch {
                return null;
              }
            })
            .filter((p): p is JobProfile => p !== null);
        } catch {
          return [];
        }
      }

      async findById(id: string): Promise<JobProfile | null> {
        try {
          const filePath = this.profilePath(id);
          if (!fs.existsSync(filePath)) return null;
          return JSON.parse(fs.readFileSync(filePath, "utf-8")) as JobProfile;
        } catch {
          return null;
        }
      }

      async save(profile: JobProfile): Promise<void> {
        const filePath = this.profilePath(profile.id);
        fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), "utf-8");
      }

      async delete(id: string): Promise<void> {
        try {
          const filePath = this.profilePath(id);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch {
          // idempotente — silencioso se não existir
        }
      }
    }

    // ─── Singleton ───────────────────────────────────────────────────────────────
    // Trocar implementação aqui quando migrar para banco de dados.
    // Nenhum outro arquivo precisa mudar.

    export const profileRepository: ProfileRepository = new JsonProfileRepository();
    ```
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - src/lib/repositories/profile-repository.ts existe
    - grep "export interface ProfileRepository" src/lib/repositories/profile-repository.ts retorna a interface
    - grep "export class JsonProfileRepository" src/lib/repositories/profile-repository.ts retorna a classe
    - grep "export const profileRepository" src/lib/repositories/profile-repository.ts retorna o singleton
    - npx tsc --noEmit sai com código 0
  </done>
</task>

<task type="auto">
  <name>Task B-2: Criar server actions CRUD delegando ao repository</name>
  <files>
    src/app/actions/profile.ts
  </files>
  <read_first>
    - src/app/actions/auth.ts (OBRIGATÓRIO — padrão redirect fora de try/catch, error handling)
    - src/lib/repositories/profile-repository.ts (criado em B-1 — métodos do singleton)
    - src/lib/base-path.ts (withBasePath)
    - .planning/phases/02-job-profile-library/02-CONTEXT.md (campos obrigatórios a validar)
  </read_first>
  <action>
    Criar src/app/actions/profile.ts. Nenhuma chamada a fs.* neste arquivo — toda I/O passa
    pelo profileRepository.

    Conteúdo exato:

    ```typescript
    "use server";

    import { redirect } from "next/navigation";
    import { withBasePath } from "@/lib/base-path";
    import { profileRepository } from "@/lib/repositories/profile-repository";
    import type { JobProfile } from "@/lib/profile";
    import { generateProfileId } from "@/lib/profile";

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    function extractProfileData(
      formData: FormData
    ): Omit<JobProfile, "id" | "createdAt" | "updatedAt"> | { error: string } {
      const title = (formData.get("title") as string | null)?.trim() ?? "";
      if (!title) return { error: "Título é obrigatório" };

      const suggestedTitle =
        (formData.get("suggestedTitle") as string | null)?.trim() ?? "";
      if (!suggestedTitle)
        return { error: "Cargo sugerido para anúncio é obrigatório" };

      return {
        title,
        suggestedTitle,
        experienceLevel: formData.get("experienceLevel") as JobProfile["experienceLevel"],
        educationLevel: formData.get("educationLevel") as JobProfile["educationLevel"],
        educationCourse:
          (formData.get("educationCourse") as string | null)?.trim() || undefined,
        postGraduateLevel: formData.get("postGraduateLevel") as JobProfile["postGraduateLevel"],
        postGraduateCourse:
          (formData.get("postGraduateCourse") as string | null)?.trim() || undefined,
        certifications: formData.get("certifications") as JobProfile["certifications"],
        certificationsWhich:
          (formData.get("certificationsWhich") as string | null)?.trim() || undefined,
        englishLevel: formData.get("englishLevel") as JobProfile["englishLevel"],
        spanishLevel: formData.get("spanishLevel") as JobProfile["spanishLevel"],
        otherLanguage:
          (formData.get("otherLanguage") as string | null)?.trim() || undefined,
        otherLanguageLevel:
          ((formData.get("otherLanguageLevel") as string | null) as JobProfile["otherLanguageLevel"]) ||
          undefined,
        responsibilities:
          (formData.get("responsibilities") as string | null)?.trim() ?? "",
        qualifications:
          (formData.get("qualifications") as string | null)?.trim() ?? "",
        behaviors: (formData.get("behaviors") as string | null)?.trim() ?? "",
        challenges: (formData.get("challenges") as string | null)?.trim() ?? "",
        additionalInfo:
          (formData.get("additionalInfo") as string | null)?.trim() ?? "",
        systemsRequired:
          (formData.get("systemsRequired") as string | null)?.trim() || undefined,
        networkFolders:
          (formData.get("networkFolders") as string | null)?.trim() || undefined,
        internalNotes:
          (formData.get("internalNotes") as string | null)?.trim() || undefined,
      };
    }

    // ─── Actions ─────────────────────────────────────────────────────────────────

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
        await profileRepository.save(profile);
      } catch {
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

      let existing: JobProfile | null;
      try {
        existing = await profileRepository.findById(profileId);
      } catch {
        return { error: "Não foi possível carregar o perfil. Tente novamente." };
      }

      if (!existing) return { error: "Perfil não encontrado" };

      try {
        await profileRepository.save({
          ...existing,
          ...data,
          id: profileId,
          createdAt: existing.createdAt,
          updatedAt: Date.now(),
        });
      } catch {
        return { error: "Não foi possível salvar o perfil. Tente novamente." };
      }

      redirect(withBasePath("/profiles"));
    }

    export async function deleteProfile(profileId: string): Promise<void> {
      try {
        await profileRepository.delete(profileId);
      } catch {
        // idempotente
      }
      redirect(withBasePath("/profiles"));
    }

    export async function listProfiles(): Promise<JobProfile[]> {
      return profileRepository.list();
    }

    export async function getProfile(
      profileId: string
    ): Promise<JobProfile | null> {
      return profileRepository.findById(profileId);
    }
    ```

    Verificar compilação após criar.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - src/app/actions/profile.ts existe com "use server" na primeira linha
    - grep "use server" src/app/actions/profile.ts retorna linha 1
    - grep "profileRepository" src/app/actions/profile.ts retorna ao menos 5 linhas (uma por action)
    - grep "fs\." src/app/actions/profile.ts retorna vazio (sem chamadas diretas ao fs)
    - grep "export async function" src/app/actions/profile.ts retorna 5 linhas
    - npx tsc --noEmit sai com código 0
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| FormData → extractProfileData | Input não confiável do cliente; validado antes de persistir |
| profileId → JsonProfileRepository.profilePath | IDs passados como parâmetro podem conter path traversal |
| JSON files → JSON.parse | Arquivos podem estar corrompidos ou adulterados |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02B-01 | Tampering | JsonProfileRepository.profilePath | mitigate | Valida que id não contém "..", "/", "\\" antes de construir path |
| T-02B-02 | Tampering | extractProfileData | mitigate | Campos obrigatórios validados; trim() em todos os strings |
| T-02B-03 | Elevation of Privilege | server actions | accept | Middleware de auth (Phase 1) protege todas as rotas; sem acesso sem sessão |
| T-02B-04 | Information Disclosure | listProfiles / findById | accept | Dados internos do gestor; single-user sem multi-tenancy |
| T-02B-05 | Tampering | JSON.parse em list/findById | mitigate | Try/catch em torno de JSON.parse; retorna null/skip em caso de erro |
</threat_model>

<verification>
1. `grep "export interface ProfileRepository" src/lib/repositories/profile-repository.ts`
   — retorna a declaração da interface

2. `grep "export const profileRepository" src/lib/repositories/profile-repository.ts`
   — retorna o singleton

3. `grep "use server" src/app/actions/profile.ts | head -1`
   — retorna "1:\"use server\""

4. `grep "fs\." src/app/actions/profile.ts`
   — retorna vazio (nenhuma chamada direta ao fs nas actions)

5. `grep "profileRepository\." src/app/actions/profile.ts | wc -l`
   — retorna ao menos 5 (uma chamada por action)

6. `npx tsc --noEmit`
   — sai com código 0
</verification>

<success_criteria>
- ProfileRepository interface define contrato de substituição futura por banco de dados
- JsonProfileRepository encapsula toda I/O de arquivo — nenhum fs.* nas actions
- Singleton profileRepository é o único ponto de troca de implementação
- redirect() fora de try/catch em createProfile, updateProfile, deleteProfile
- npx tsc --noEmit passa sem erros
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-job-profile-library/02-B-SUMMARY.md`
</output>
