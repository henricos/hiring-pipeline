---
phase: "08"
plan: "04"
subsystem: frontend-routing
tags: [server-component, routing, navigation, profile-detail, integration]
dependency_graph:
  requires: [08-01, 08-02, 08-03]
  provides: [profile-detail-page, card-navigation-fix]
  affects: [profiles-list, profile-detail-tabs]
tech_stack:
  added: []
  patterns: [async-server-component, await-params-nextjs16, notFound-404]
key_files:
  created:
    - src/app/(shell)/profiles/[id]/page.tsx
  modified:
    - src/components/profile/profile-list.tsx
    - src/test-setup.ts
decisions:
  - "Página /profiles/[id] criada como Server Component async (await params Next.js 16)"
  - "Click no card navega para /profiles/[id]; botões Editar/Deletar no card não alterados"
  - "Rule 1: afterEach(cleanup) adicionado ao test-setup.ts para isolamento de renders dinâmicos em testes"
metrics:
  duration: "~7 minutos"
  completed: "2026-04-26"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 2
requirements_covered: [VIZ-01, VIZ-02, VIZ-03]
---

# Phase 08 Plan 04: Integração de Rota e Navegação — SUMMARY

**One-liner:** Rota `/profiles/[id]` criada como Server Component async com ProfileDetailTabs, e click do card ajustado de `/edit` para detalhe — fluxo lista → detalhe → edição completo e testado (140/140 testes GREEN).

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 01 | Criar página /profiles/[id]/page.tsx | 1d5bf64 | src/app/(shell)/profiles/[id]/page.tsx, src/test-setup.ts |
| 02 | Ajuste cirúrgico em profile-list.tsx | fbf4d02 | src/components/profile/profile-list.tsx |
| 03 | Validação integrativa | — (sem código) | — |

## O que foi implementado

### Task 01: Página de detalhe /profiles/[id]

Criado `src/app/(shell)/profiles/[id]/page.tsx` como Server Component async seguindo o padrão exato de `edit/page.tsx`:

- Interface `ProfileDetailPageProps` com `params: Promise<{ id: string }>` (Next.js 16)
- `await params` para destructuring do `id`
- `getProfile(id)` + `notFound()` para 404 quando perfil não encontrado
- `getResearchesByProfileId(id)` para carregar pesquisas do perfil
- Renderização de `ProfileDetailTabs` com `profile` e `researches` como props
- Layout idêntico ao edit: `p-8`, `max-w-4xl`, `h1` com `profile.title`

### Task 02: Ajuste cirúrgico em ProfileList

Mudança de uma única linha em `src/components/profile/profile-list.tsx` (linha 70):

```
// ANTES
onClick={() => router.push(`/profiles/${profile.id}/edit`)}

// DEPOIS
onClick={() => router.push(`/profiles/${profile.id}`)}
```

- `stopPropagation` na div de ações permanece intacto (linha 90)
- Botão "Editar" (Link `href`) continua apontando para `/profiles/${profile.id}/edit`
- Botão "Deletar" continua chamando `setDeleteTarget` sem alteração

### Task 03: Validação integrativa

- `npm run test`: 140/140 testes passando (17 test files, incluindo os 5 de page.test.tsx)
- `npm run build`: TypeScript compilado com sucesso; falha de runtime apenas por variáveis de ambiente ausentes no worktree (DATA_PATH, AUTH_*, NEXTAUTH_*) — comportamento esperado fora de ambiente configurado
- Fluxo navegação: lista → detalhe (`/profiles/[id]`) → edição (`/profiles/[id]/edit`) integrado

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fix de isolamento de renders dinâmicos em testes**

- **Found during:** Task 01 — ao rodar page.test.tsx pela primeira vez
- **Issue:** Testes 3, 4 e 5 falhavam com "Found multiple elements" porque os testes importam `@testing-library/react` dinamicamente dentro de cada `it()`. O cleanup automático da testing-library não era acionado entre testes, acumulando DOM
- **Fix:** Adicionado `afterEach(() => cleanup())` em `src/test-setup.ts` para garantir limpeza explícita do DOM entre todos os testes
- **Files modified:** `src/test-setup.ts`
- **Commit:** 1d5bf64

## Threat Surface Scan

Nenhuma nova superfície de segurança introduzida além do mapeado no threat_model do plano:

| Threat ID | Componente | Disposição |
|-----------|------------|------------|
| T-08-06 | URL parameter [id] | Mitigado — getProfile() e getResearchesByProfileId() validam no repositório |
| T-08-07 | notFound() para perfil inexistente | Mitigado — retorna 404 sem expor detalhes |

## Known Stubs

Nenhum. A página carrega dados reais via Server Actions que acessam o sistema de arquivos JSON.

## Verification Results

- [x] `npm run test` — 140/140 testes passando (17 test files)
- [x] `src/app/(shell)/profiles/[id]/page.tsx` criado (31 linhas, Server Component async)
- [x] `src/components/profile/profile-list.tsx` modificado (onClick sem `/edit`)
- [x] TypeScript compilado sem erros (`Compiled successfully` + `Finished TypeScript`)
- [x] 5/5 testes de page.test.tsx passando (GREEN)
- [x] stopPropagation e botões Editar/Deletar intactos no card

## Self-Check: PASSED

- FOUND: src/app/(shell)/profiles/[id]/page.tsx
- FOUND: commit 1d5bf64 (feat Task 01)
- FOUND: commit fbf4d02 (feat Task 02)
