---
phase: 02-job-profile-library
plan: C
subsystem: profile-components
tags: [react, components, useActionState, shadcn, alert-dialog]
dependency_graph:
  requires:
    - src/lib/profile.ts (Plan A — tipos JobProfile e constantes de select)
    - src/app/actions/profile.ts (Plan B — createProfile, updateProfile, deleteProfile)
    - src/components/ui/select.tsx (Plan A — Select shadcn)
    - src/components/ui/textarea.tsx (Plan A — Textarea shadcn)
    - src/components/ui/alert-dialog.tsx (Plan A — AlertDialog shadcn)
  provides:
    - src/components/profile/profile-list.tsx — lista de perfis com empty state e AlertDialog de exclusão
    - src/components/profile/profile-form.tsx — formulário completo com 5 seções, campos condicionais e useActionState
  affects:
    - src/app/(shell)/profiles/page.tsx (Plan D — importa ProfileList)
    - src/app/(shell)/profiles/new/page.tsx (Plan D — importa ProfileForm + createProfile)
    - src/app/(shell)/profiles/[id]/edit/page.tsx (Plan D — importa ProfileForm + updateProfile + getProfile)
tech_stack:
  added: []
  patterns:
    - useActionState para integração client-component ↔ server action com estado de erro
    - useState para campos condicionais (educationCourse, postGraduateCourse, certificationsWhich)
    - hidden inputs para passar valores de Select ao FormData
    - useTransition para wrapping de deleteProfile (server action void)
    - AlertDialog com estado local deleteTarget (JobProfile | null)
key_files:
  created:
    - src/components/profile/profile-list.tsx
    - src/components/profile/profile-form.tsx
  modified: []
decisions:
  - "ProfileForm recebe onSubmitAction como prop — permite reutilização em /profiles/new (createProfile) e /profiles/[id]/edit (updateProfile com id injetado)"
  - "useTransition em vez de useActionState para deleteProfile — action retorna void, sem estado de erro na lista"
  - "Tipo ActionState = { error?: string } | null declarado localmente em profile-form.tsx para resolver incompatibilidade de tipos com useActionState do React 19"
  - "Row de perfil usa onClick na div + stopPropagation nos botões de ação — mantém área clicável grande sem conflitar com ações"
metrics:
  duration: "~10 minutos"
  completed: "2026-04-20T11:38:20Z"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-04
  - PROF-05
---

# Phase 02 Plan C: Componentes ProfileList e ProfileForm — Summary

**One-liner:** Dois client components React — ProfileList com empty state e AlertDialog de confirmação de exclusão, e ProfileForm com 5 seções, campos condicionais via useState e integração com server actions via useActionState.

## O Que Foi Feito

Criação dos dois componentes reutilizáveis que as páginas de `/profiles` consumirão no Plan D. O `ProfileList` renderiza a lista ordenada por `updatedAt` decrescente, exibe empty state com cópia exata do UI-SPEC, e usa `AlertDialog` para confirmação antes de excluir. O `ProfileForm` cobre todos os campos do formulário GH em 5 seções, gerencia campos condicionais com `useState`, e integra com server actions via `useActionState`.

## Tarefas Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|---------|
| C-1 | Criar ProfileList com empty state e delete dialog | f0f86e3 | profile-list.tsx |
| C-2 | Criar ProfileForm com todos os campos e condicionais | 8c1a865 | profile-form.tsx |

## Critérios de Sucesso

- [x] `ProfileList` renderiza lista ordenada por `updatedAt` decrescente (D-05)
- [x] `ProfileList` exibe empty state com cópia exata do UI-SPEC quando `profiles.length === 0`
- [x] `ProfileList` tem botão de excluir com AlertDialog de confirmação antes de deletar (D-10)
- [x] AlertDialog tem título "Excluir perfil?" e botão "Manter perfil"
- [x] `ProfileForm` renderiza todos os campos mapeados em 5 seções
- [x] `ProfileForm` exibe `educationCourse` quando `educationLevel !== "Ensino médio"`
- [x] `ProfileForm` exibe `postGraduateCourse` quando `postGraduateLevel !== "Não exigido"`
- [x] `ProfileForm` exibe `certificationsWhich` quando `certifications !== "Não"`
- [x] `ProfileForm` em modo edição pré-preenche todos os campos com dados do perfil
- [x] Botão Salvar exibe "Salvando…" durante isPending e fica desabilitado
- [x] Erros de server action exibidos inline abaixo do formulário
- [x] `npx tsc --noEmit` passa sem erros

## Desvios do Plano

### Auto-fixed Issues

**1. [Rule 1 - Bug] Incompatibilidade de tipos no useActionState com React 19**

- **Encontrado durante:** Task C-2
- **Problema:** O tipo do `prevState` no callback do `useActionState` do React 19 inclui `void` na union (`{ error?: string } | null | void`), mas a assinatura de `onSubmitAction` esperava apenas `{ error?: string } | null`. TypeScript rejeitou a atribuição.
- **Correção:** Declarado tipo local `ActionState = { error?: string } | null` e o callback interno faz cast `(prevState ?? null) as ActionState` para resolver a incompatibilidade sem alterar a assinatura pública da prop.
- **Arquivos modificados:** `src/components/profile/profile-form.tsx`
- **Commit:** 8c1a865

## Stubs Conhecidos

Nenhum. Ambos os componentes são funcionais e integrados com as server actions do Plan B.

## Threat Flags

Nenhuma superfície nova além do que está no threat model do plano.

- T-02C-01 (Tampering): React sanitiza valores em `defaultValue`/`value` automaticamente — sem `dangerouslySetInnerHTML`.
- T-02C-03 (Elevation of Privilege): `deleteProfile` é server action protegida pelo middleware de auth (Phase 1); o client apenas a invoca via `useTransition`.

## Self-Check: PASSED

Arquivos criados verificados:
- `/home/henrico/github/henricos/hiring-pipeline/src/components/profile/profile-list.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/components/profile/profile-form.tsx` — FOUND

Commits verificados:
- `f0f86e3` feat(02-C): criar ProfileList com empty state e delete dialog — FOUND
- `8c1a865` feat(02-C): criar ProfileForm com 5 seções, campos condicionais e useActionState — FOUND
