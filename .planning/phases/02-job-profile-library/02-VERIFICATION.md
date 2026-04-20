---
phase: 02-job-profile-library
verified: 2026-04-20T12:00:00Z
status: gaps_found
score: 4/5 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Manager can list all profiles and search by title or keyword"
    status: failed
    reason: "A funcionalidade de busca/filtro por título ou palavra-chave não está implementada. A CONTEXT.md D-06 registrou a decisão de deferir busca para fase futura, mas o Roadmap SC3 exige explicitamente search. Nenhuma fase posterior cobre esse item."
    artifacts:
      - path: "src/components/profile/profile-list.tsx"
        issue: "Componente lista perfis corretamente mas não possui campo de busca, filtro por título ou keyword"
      - path: "src/app/(shell)/profiles/page.tsx"
        issue: "Página de lista não expõe mecanismo de busca/filtro"
    missing:
      - "Campo de input de busca na página /profiles"
      - "Lógica de filtro por título ou keyword no ProfileList (client-side ou via query param)"
      - "Opcional: action listProfiles com param de query, ou filtro client-side no componente"
human_verification:
  - test: "Verificação funcional completa — checkpoint D-4"
    expected: "Todos os 16 passos do checklist D-4 aprovados: seed visível, CRUD completo, campos condicionais funcionais, AlertDialog de exclusão, Vagas desabilitado"
    why_human: "Checkpoint D-4 ainda marcado como 'aguardando aprovação' no 02-D-SUMMARY.md. Envolve comportamento visual, fluxo de navegação e interatividade que não podem ser verificados programaticamente"
---

# Phase 2: Job Profile Library — Relatório de Verificação

**Phase Goal:** Manager can create, maintain, and search reusable job profile templates with full metadata
**Verificado:** 2026-04-20T12:00:00Z
**Status:** gaps_found
**Re-verificação:** Não — verificação inicial

---

## Alcance do Objetivo

### Verdades Observáveis (Success Criteria do Roadmap)

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | Manager pode criar perfil com título, descrição, responsabilidades e observações internas | VERIFICADO | `ProfileForm` com seções Identificação, Conteúdo Descritivo (5 textareas incl. `responsibilities`) e Observações Internas; `createProfile` persiste via `profileRepository.save()` |
| 2 | Manager pode definir requisitos obrigatórios/desejáveis, habilidades técnicas, competências comportamentais e critérios de avaliação | VERIFICADO (parcial — ver nota) | Campos `qualifications` (requisitos obrigatórios + diferenciais), `behaviors` (competências comportamentais); CONTEXT.md D-06 explicita que critérios de avaliação são texto livre incorporado nos campos existentes |
| 3 | Manager pode listar todos os perfis e buscar por título ou palavra-chave | FALHOU | Lista implementada e funcional; busca/filtro completamente ausente — sem campo de busca em `ProfileList`, `profiles/page.tsx` ou actions |
| 4 | Manager pode editar perfil existente e persistir alterações | VERIFICADO | `/profiles/[id]/edit` carrega perfil via `getProfile()`, exibe `ProfileForm` pré-preenchido, `updateProfile.bind(null, id)` persiste via `profileRepository.save()` |
| 5 | Perfil inclui texto descritivo externo para publicação (job description) | VERIFICADO | Campo `suggestedTitle` (cargo para anúncio/Gupy) + 5 textareas descritivos (responsibilities, qualifications, behaviors, challenges, additionalInfo) formam o conteúdo publicável; `internalNotes` marcado como não publicado |

**Score:** 4/5 verdades verificadas

**Nota sobre SC2:** PROF-03 ("critérios de avaliação") não possui campo dedicado na interface. A CONTEXT.md registra a decisão de incorporá-los como texto livre nos campos `qualifications` e `behaviors`. Esta é uma decisão de produto explicitamente documentada — a verificação aceita como implementado conforme o escopo definido. Porém, se o operador considerar que PROF-03 requer campo dedicado, esse item também deve ser incluído nos gaps.

---

### Artefatos Obrigatórios

| Artefato | Propósito | Status | Detalhes |
|----------|-----------|--------|----------|
| `src/lib/profile.ts` | Schema de tipos e constantes | VERIFICADO | Interface `JobProfile` completa; 5 tipos union; 5 constantes de array; `generateProfileId()` exportada |
| `src/components/ui/select.tsx` | Componente Select shadcn | VERIFICADO | Instalado via shadcn CLI; commit a3cd86b |
| `src/components/ui/textarea.tsx` | Componente Textarea shadcn | VERIFICADO | Instalado via shadcn CLI; commit a3cd86b |
| `src/components/ui/alert-dialog.tsx` | Componente AlertDialog shadcn | VERIFICADO | Instalado via shadcn CLI; commit a3cd86b |
| `src/lib/repositories/profile-repository.ts` | Interface + implementação JSON + singleton | VERIFICADO | `ProfileRepository` interface; `JsonProfileRepository` com path traversal bloqueado; singleton `profileRepository` exportado |
| `src/app/actions/profile.ts` | 5 server actions CRUD | VERIFICADO | `createProfile`, `updateProfile`, `deleteProfile`, `listProfiles`, `getProfile`; zero chamadas a `fs.*`; redirect fora de try/catch |
| `src/components/profile/profile-list.tsx` | Lista de perfis com empty state e delete dialog | VERIFICADO | Ordenação por `updatedAt` desc; empty state com cópia exata do UI-SPEC; `AlertDialog` com "Excluir perfil?" / "Manter perfil" |
| `src/components/profile/profile-form.tsx` | Formulário com 5 seções e campos condicionais | VERIFICADO | 5 seções completas; condicionais `educationCourse`, `postGraduateCourse`, `certificationsWhich`; `useActionState`; botão "Salvando…" |
| `src/app/(shell)/profiles/page.tsx` | Página /profiles | VERIFICADO | Importa `ProfileList` + `listProfiles`; `Suspense` boundary |
| `src/app/(shell)/profiles/new/page.tsx` | Página /profiles/new | VERIFICADO | Importa `ProfileForm` + `createProfile`; formulário em branco |
| `src/app/(shell)/profiles/[id]/edit/page.tsx` | Página /profiles/[id]/edit | VERIFICADO | `getProfile(id)` + `notFound()` guard; `updateProfile.bind(null, id)`; formulário pré-preenchido |
| `src/components/shell/left-rail.tsx` | Left rail com Perfis habilitado | VERIFICADO | `disabled: false` no item Perfis; Vagas permanece `disabled: true` |
| `data/profiles/profile-seed.json` | Perfil de exemplo para dev | VERIFICADO | JSON válido; id `profile-seed-engenheiro-software-01`; timestamps fixos determinísticos |

---

### Verificação de Key Links

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `src/lib/profile.ts` | `src/app/actions/profile.ts` | `import type { JobProfile }` | WIRED | Linha 6 em profile.ts |
| `src/lib/profile.ts` | `src/components/profile/profile-form.tsx` | `import { EXPERIENCE_LEVELS, ... }` | WIRED | Linhas 17-23 em profile-form.tsx |
| `src/app/actions/profile.ts` | `src/lib/repositories/profile-repository.ts` | `import { profileRepository }` | WIRED | Linha 5 em profile.ts |
| `src/lib/repositories/profile-repository.ts` | `src/lib/data-service.ts` | `ensureSubdir` | WIRED | Linha 3; usado em `profilePath()` e `list()` |
| `src/app/(shell)/profiles/page.tsx` | `src/components/profile/profile-list.tsx` | `import { ProfileList }` | WIRED | Linha 4 em profiles/page.tsx |
| `src/app/(shell)/profiles/[id]/edit/page.tsx` | `src/app/actions/profile.ts` | `getProfile(id)` + `updateProfile.bind` | WIRED | Linhas 3, 11, 15 |
| `src/components/shell/left-rail.tsx` | `/profiles` | `NAV_ITEMS disabled: false` | WIRED | Linha 16 — `{ label: "Perfis", href: "/profiles", icon: Users, disabled: false }` |
| `src/components/profile/profile-list.tsx` | `src/app/actions/profile.ts` | `deleteProfile` | WIRED | Linha 17 em profile-list.tsx; chamado em `handleConfirmDelete` |

---

### Rastreamento de Data Flow (Nível 4)

| Artefato | Variável de dados | Fonte | Produz dados reais | Status |
|----------|------------------|-------|--------------------|--------|
| `src/app/(shell)/profiles/page.tsx` | `profiles` (via `ProfilesContent`) | `listProfiles()` → `profileRepository.list()` → `fs.readdirSync(dir)` | Sim — lê arquivos JSON do `DATA_PATH/profiles/` | FLOWING |
| `src/app/(shell)/profiles/[id]/edit/page.tsx` | `profile` | `getProfile(id)` → `profileRepository.findById()` → `fs.readFileSync` | Sim — lê arquivo JSON individual | FLOWING |
| `src/components/profile/profile-form.tsx` | Props `profile` | Passado pela página edit | Sim — dados reais do repositório | FLOWING |
| `src/components/profile/profile-list.tsx` | Props `profiles` | Passado por `ProfilesContent` | Sim — dados reais do repositório | FLOWING |

---

### Verificação de Requisitos

| Requisito | Planos | Descrição | Status | Evidência |
|-----------|--------|-----------|--------|-----------|
| PROF-01 | A, B, C, D | Criar perfil com título, descrição, responsabilidades e observações internas | SATISFEITO | `ProfileForm` cobre todos os campos; `createProfile` persiste via repositório |
| PROF-02 | A, B, C, D | Definir requisitos obrigatórios/desejáveis, habilidades técnicas e competências comportamentais | SATISFEITO | Campos `qualifications` e `behaviors` cobrem esses conteúdos conforme CONTEXT.md |
| PROF-03 | A, B, C, D | Definir critérios de avaliação associados ao perfil | SATISFEITO (por texto livre) | CONTEXT.md explicita que critérios são texto sem estrutura numérica, incorporados nos textareas descritivos |
| PROF-04 | A, B, C, D | Listar, buscar e editar perfis existentes | PARCIAL | Lista e edição implementadas; busca por título ou keyword **não implementada** |
| PROF-05 | A, B, C, D | Texto descritivo da vaga para publicação externa | SATISFEITO | `suggestedTitle` + 5 textareas de conteúdo descritivo constituem o texto publicável |

**Requisito sem plano declarado:** Nenhum. Todos os PROF-01..PROF-05 foram declarados nos planos A, B, C e D.

---

### Anti-Patterns Detectados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `src/components/profile/profile-list.tsx` | 69 | `window.location.href` em vez de `router.push` / `<Link>` | Aviso | Navegação por linha de perfil ignora `basePath`; causa reload completo (documentado em IN-01 do 02-REVIEW.md) |
| `src/app/actions/profile.ts` | 117-124 | `deleteProfile` engole erro silenciosamente | Aviso | Falhas de I/O não são reportadas ao usuário (documentado em WR-01 do 02-REVIEW.md) |
| `src/components/profile/profile-list.tsx` | 32 | `startTransition` sem `await` no callback de deleteProfile | Aviso | Promise descartada, erro futuro seria silenciado (documentado em WR-04 do 02-REVIEW.md) |

Nenhum anti-pattern bloqueador encontrado. Os 3 avisos estão documentados no 02-REVIEW.md e não impedem o funcionamento do CRUD.

---

### Verificações Comportamentais (Nível 7b)

| Comportamento | Verificação | Resultado | Status |
|---------------|-------------|-----------|--------|
| `npx tsc --noEmit` sem erros | Executado | Saiu com código 0 — sem erros de tipo | PASS |
| Commits documentados existem | `git show --stat` nos 8 hashes | Todos encontrados no repositório | PASS |
| `data/profiles/profile-seed.json` é JSON válido | `node -e JSON.parse(...)` | JSON válido; id e title corretos | PASS |
| Nenhuma chamada `fs.*` em actions | `grep fs\. actions/profile.ts` | 0 ocorrências | PASS |
| 5 functions exportadas em actions | `grep -c "export async function"` | Retornou 5 | PASS |
| Busca por título ou keyword | Inspeção de código | Campo de busca ausente em todos os arquivos da feature | FAIL |

---

### Verificação Humana Necessária

#### 1. Checkpoint D-4 — Verificação Funcional Completa

**Teste:** Seguir os 16 passos do checklist definido em 02-PLAN-D.md, Task D-4:
1. Certificar que `DATA_PATH` aponta para `data/` local via `.env.local`
2. `npm run dev` e login em http://localhost:3000/hiring-pipeline
3. Verificar item "Perfis" no left rail habilitado e clicável
4. `/profiles` exibe perfil seed "Engenheiro(a) de Software Pleno"
5. Clicar no perfil → `/profiles/{id}/edit` com campos pré-preenchidos
6. Alterar título e salvar → lista atualizada
7. Criar novo perfil via `/profiles/new`
8. Testar campos condicionais (educationLevel, postGraduateLevel, certifications)
9. Testar AlertDialog de exclusão (Excluir + Manter perfil)
10. Verificar que "Vagas" permanece desabilitado

**Esperado:** Todos os 16 passos passam sem erros

**Por que humano:** Fluxo completo de navegação, comportamento visual dos campos condicionais, estado do AlertDialog e resposta da UI durante persistência não podem ser verificados programaticamente

---

## Resumo dos Gaps

### Gap 1: Busca por título ou keyword não implementada (SC3 / PROF-04 parcial)

O Roadmap define como Success Criterion 3: "Manager can list all profiles and search by title or keyword". A funcionalidade de listar perfis está completamente implementada e funcional. Porém, a busca por título ou keyword está **ausente** de todos os artefatos da fase.

A CONTEXT.md registrou a decisão D-06 ("Sem busca/filtro por ora — entra quando o volume justificar") como deferimento explícito do planner. Entretanto, nenhuma fase posterior no ROADMAP cobre este item — o Roadmap SC3 permanece sem fechamento.

**Impacto:** Gestor consegue listar todos os perfis mas não pode encontrar um perfil específico por texto. Com poucos perfis (estado atual) o impacto é baixo. A medida que a biblioteca crescer, a ausência se torna bloqueadora para PROF-04.

**Resolução sugerida:** O operador deve decidir se:
- **Aceita o deferimento** (baixo volume atual) e adiciona override ou agenda para fase futura; ou
- **Fecha o gap** com filtro client-side simples em `ProfileList` (input + `.filter()` sobre o array `profiles`)

---

## Itens Fora de Escopo (Confirmados)

Os seguintes itens foram explicitamente declarados fora do escopo da Phase 2 pela CONTEXT.md e não são gaps:

- Busca/filtro de perfis (D-06 — "fase futura") — **exceto que o ROADMAP SC3 exige; por isso este item é gap e não deferimento**
- Tela de visualização read-only
- Duplicar/clonar perfil
- Campo "Descrição da vaga" intro Gupy (responsabilidade do GH)
- Sugestões de IA (Phase 3)
- Abertura de vagas (Phase 4)

---

_Verificado: 2026-04-20T12:00:00Z_
_Verificador: Claude (gsd-verifier)_
