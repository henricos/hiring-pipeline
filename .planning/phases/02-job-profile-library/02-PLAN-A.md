---
phase: 02-job-profile-library
plan: A
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/select.tsx
  - src/components/ui/textarea.tsx
  - src/components/ui/alert-dialog.tsx
  - src/lib/profile.ts
autonomous: true
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-05

must_haves:
  truths:
    - "src/lib/profile.ts existe com interface JobProfile e todos os campos mapeados do formulário GH"
    - "Tipos union para ExperienceLevel, EducationLevel, PostGraduateLevel, CertificationLevel, LanguageLevel estão exportados"
    - "Constantes EXPERIENCE_LEVELS, EDUCATION_LEVELS, etc. estão exportadas para uso nos selects"
    - "Função generateProfileId() está exportada e gera IDs únicos"
    - "select.tsx, textarea.tsx e alert-dialog.tsx existem em src/components/ui/"
  artifacts:
    - path: "src/lib/profile.ts"
      provides: "Schema de tipos e constantes para perfis de vaga"
      exports:
        - JobProfile
        - ExperienceLevel
        - EducationLevel
        - PostGraduateLevel
        - CertificationLevel
        - LanguageLevel
        - EXPERIENCE_LEVELS
        - EDUCATION_LEVELS
        - POST_GRADUATE_LEVELS
        - CERTIFICATION_LEVELS
        - LANGUAGE_LEVELS
        - generateProfileId
    - path: "src/components/ui/select.tsx"
      provides: "Componente Select shadcn instalado"
    - path: "src/components/ui/textarea.tsx"
      provides: "Componente Textarea shadcn instalado"
    - path: "src/components/ui/alert-dialog.tsx"
      provides: "Componente AlertDialog shadcn instalado"
  key_links:
    - from: "src/lib/profile.ts"
      to: "src/app/actions/profile.ts"
      via: "import type { JobProfile } from '@/lib/profile'"
      pattern: "import.*JobProfile.*from.*@/lib/profile"
    - from: "src/lib/profile.ts"
      to: "src/components/profile/profile-form.tsx"
      via: "import { EXPERIENCE_LEVELS, ... } from '@/lib/profile'"
      pattern: "import.*EXPERIENCE_LEVELS.*from.*@/lib/profile"
---

<objective>
Instalar componentes shadcn ausentes (Select, Textarea, AlertDialog) e criar o schema de tipos
TypeScript completo para perfis de vaga.

Purpose: Estabelecer os contratos de dados e componentes de UI que todos os planos subsequentes
dependem. Sem este plano, nenhum servidor de ação nem componente de formulário pode ser compilado.

Output: src/lib/profile.ts com todos os tipos e constantes; três novos componentes shadcn em
src/components/ui/.
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
@.planning/references/excel-form-fields.md

<interfaces>
<!-- Padrões estabelecidos na Phase 1 que este plano deve seguir -->

De src/lib/auth.ts (padrão de estrutura de arquivo lib):
```typescript
// Arquivo utilitário: apenas tipos, constantes, funções puras
// Sem "use server" — este arquivo é importado por client e server
```

De src/lib/data-service.ts (padrão de validação):
```typescript
export function ensureSubdir(subdir: string): string // retorna path absoluto
```

De src/components/ui/button.tsx (padrão shadcn — usar como-is após instalação):
// Componentes shadcn não recebem customizações — instalados e usados diretamente
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task A-1: Instalar componentes shadcn ausentes</name>
  <files>
    src/components/ui/select.tsx
    src/components/ui/textarea.tsx
    src/components/ui/alert-dialog.tsx
  </files>
  <read_first>
    - src/components/ui/button.tsx (padrão shadcn existente — confirmar que instalação segue mesmo padrão)
    - src/components/ui/input.tsx (confirmar que componentes shadcn estão sem modificações)
    - components.json (confirmar preset radix-nova e configurações corretas antes de instalar)
  </read_first>
  <action>
    Executar os três comandos shadcn CLI para instalar os componentes faltantes:

    ```bash
    npx shadcn add select
    npx shadcn add textarea
    npx shadcn add alert-dialog
    ```

    Executar um por vez. Se algum perguntar confirmação, responder "yes".
    Não modificar os arquivos gerados — usar como-is do registry oficial.

    Após instalação, NÃO customizar os arquivos. Os componentes devem permanecer
    exatamente como instalados pelo shadcn CLI.
  </action>
  <verify>
    <automated>ls src/components/ui/select.tsx src/components/ui/textarea.tsx src/components/ui/alert-dialog.tsx</automated>
  </verify>
  <done>
    Os três arquivos existem em src/components/ui/ e contêm o código gerado pelo shadcn CLI.
    Nenhuma linha customizada adicionada além do gerado.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task A-2: Criar schema de tipos e constantes para perfis</name>
  <files>
    src/lib/profile.ts
  </files>
  <read_first>
    - .planning/references/excel-form-fields.md (OBRIGATÓRIO — fonte canônica dos campos do formulário GH)
    - .planning/phases/02-job-profile-library/02-CONTEXT.md (campos definidos nas decisões D-01..D-10)
    - .planning/phases/02-job-profile-library/02-PATTERNS.md (estrutura exata do arquivo — seção src/lib/profile.ts)
    - src/lib/auth.ts (padrão de arquivo lib — sem "use server", apenas exports puros)
  </read_first>
  <behavior>
    - JobProfile.id deve ser string não vazia gerada por generateProfileId()
    - ExperienceLevel aceita exatamente: "< 1 ano" | "1-3 anos" | "3-5 anos" | "5-10 anos" | "> 10 anos"
    - EducationLevel aceita exatamente: "Ensino médio" | "Superior cursando" | "Superior completo"
    - PostGraduateLevel aceita exatamente: "Não exigido" | "Desejável" | "Necessário"
    - CertificationLevel aceita exatamente: "Não" | "Desejável" | "Sim"
    - LanguageLevel aceita exatamente: "Não exigido" | "Básico" | "Intermediário" | "Avançado" | "Fluente"
    - generateProfileId() retorna string que começa com "profile-" e tem pelo menos 20 caracteres
    - generateProfileId() chamado duas vezes em sequência gera IDs diferentes (colisão-seguro)
    - EXPERIENCE_LEVELS.length === 5
    - EDUCATION_LEVELS.length === 3
    - POST_GRADUATE_LEVELS.length === 3
    - CERTIFICATION_LEVELS.length === 3
    - LANGUAGE_LEVELS.length === 5
  </behavior>
  <action>
    Criar src/lib/profile.ts com os tipos, interface e constantes completos.
    Este arquivo NÃO usa "use server" — é importado tanto por client quanto server components.

    Conteúdo exato:

    ```typescript
    // Types union para campos de seleção
    export type ExperienceLevel =
      | "< 1 ano"
      | "1-3 anos"
      | "3-5 anos"
      | "5-10 anos"
      | "> 10 anos";

    export type EducationLevel =
      | "Ensino médio"
      | "Superior cursando"
      | "Superior completo";

    export type PostGraduateLevel = "Não exigido" | "Desejável" | "Necessário";

    export type CertificationLevel = "Não" | "Desejável" | "Sim";

    export type LanguageLevel =
      | "Não exigido"
      | "Básico"
      | "Intermediário"
      | "Avançado"
      | "Fluente";

    // Interface principal do perfil de vaga
    export interface JobProfile {
      id: string;
      // Identificação
      title: string; // título do cargo (interno)
      suggestedTitle: string; // cargo sugerido para anúncio/Gupy
      // Requisitos do candidato
      experienceLevel: ExperienceLevel;
      educationLevel: EducationLevel;
      educationCourse?: string; // obrigatório quando educationLevel !== "Ensino médio"
      postGraduateLevel: PostGraduateLevel;
      postGraduateCourse?: string; // quando postGraduateLevel === "Desejável" | "Necessário"
      certifications: CertificationLevel;
      certificationsWhich?: string; // quando certifications === "Desejável" | "Sim"
      englishLevel: LanguageLevel;
      spanishLevel: LanguageLevel;
      otherLanguage?: string; // nome do idioma
      otherLanguageLevel?: LanguageLevel;
      // Conteúdo descritivo (5 textareas — núcleo do perfil)
      responsibilities: string; // Responsabilidades e atribuições
      qualifications: string; // Requisitos e qualificações (obrigatórios + diferenciais)
      behaviors: string; // Características e competências comportamentais
      challenges: string; // Principais desafios
      additionalInfo: string; // Informações complementares
      // Infraestrutura (opcional)
      systemsRequired?: string;
      networkFolders?: string;
      // Observações internas (não publicadas externamente)
      internalNotes?: string;
      // Metadados
      createdAt: number; // Unix timestamp em ms
      updatedAt: number; // Unix timestamp em ms
    }

    // Constantes para opções dos selects
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

    /**
     * Gera um ID único para um perfil de vaga.
     * Formato: profile-{timestamp}-{random7chars}
     * Colisão-seguro para uso em ambiente single-user.
     */
    export function generateProfileId(): string {
      return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    ```

    Verificar que o arquivo compila sem erros antes de finalizar.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - src/lib/profile.ts existe e exporta: JobProfile, ExperienceLevel, EducationLevel,
      PostGraduateLevel, CertificationLevel, LanguageLevel, EXPERIENCE_LEVELS, EDUCATION_LEVELS,
      POST_GRADUATE_LEVELS, CERTIFICATION_LEVELS, LANGUAGE_LEVELS, generateProfileId
    - npx tsc --noEmit sai com código 0 (sem erros de tipo)
    - grep "export interface JobProfile" src/lib/profile.ts retorna a linha da interface
    - grep "export function generateProfileId" src/lib/profile.ts retorna a linha da função
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Schema → actions | Tipos definidos aqui são consumidos pelas server actions — qualquer mudança nos tipos quebra o contrato |
| shadcn registry → codebase | Componentes instalados do registry externo; sem customizações adicionais para reduzir superfície de ataque |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02A-01 | Tampering | src/lib/profile.ts | mitigate | Tipos union restringem valores inválidos em compile-time; server actions validam em runtime |
| T-02A-02 | Information Disclosure | generateProfileId() | accept | IDs baseados em timestamp + random são previsíveis em ambiente single-user local; risco de exposição é baixo |
| T-02A-03 | Tampering | shadcn registry | accept | Registry oficial shadcn; sem third-party registries declarados no UI-SPEC |
</threat_model>

<verification>
Após execução deste plano:

1. `ls src/components/ui/select.tsx src/components/ui/textarea.tsx src/components/ui/alert-dialog.tsx`
   — todos os três arquivos existem

2. `grep "export interface JobProfile" src/lib/profile.ts`
   — retorna uma linha com a declaração da interface

3. `grep "export function generateProfileId" src/lib/profile.ts`
   — retorna uma linha com a declaração da função

4. `grep "export const EXPERIENCE_LEVELS" src/lib/profile.ts`
   — retorna uma linha com a constante

5. `npx tsc --noEmit`
   — sai com código 0 (sem erros de tipo)
</verification>

<success_criteria>
- Três componentes shadcn instalados e funcionais em src/components/ui/
- src/lib/profile.ts exporta interface JobProfile com todos os campos mapeados do formulário GH
- Tipos union cobrem todos os valores dos selects conforme UI-SPEC (seção "Select Field Values")
- generateProfileId() exportada e funcional
- `npx tsc --noEmit` passa sem erros
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-job-profile-library/02-A-SUMMARY.md`
</output>
