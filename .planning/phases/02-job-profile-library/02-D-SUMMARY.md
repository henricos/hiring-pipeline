---
phase: 02-job-profile-library
plan: D
subsystem: profile-pages
tags: [next.js, routing, app-router, server-component, seed-data, navigation]
dependency_graph:
  requires:
    - src/components/profile/profile-list.tsx (Plan C — ProfileList)
    - src/components/profile/profile-form.tsx (Plan C — ProfileForm)
    - src/app/actions/profile.ts (Plan B — listProfiles, getProfile, createProfile, updateProfile)
    - src/app/(shell)/layout.tsx (Phase 1 — shell com auth automático)
    - src/components/shell/left-rail.tsx (Phase 1 — item "Perfis" aguardando habilitação)
  provides:
    - src/app/(shell)/profiles/page.tsx — Página de lista de perfis em /profiles
    - src/app/(shell)/profiles/new/page.tsx — Página de criação de perfil em /profiles/new
    - src/app/(shell)/profiles/[id]/edit/page.tsx — Página de edição de perfil em /profiles/[id]/edit
    - src/components/shell/left-rail.tsx — Left rail com "Perfis" habilitado
    - data/profiles/profile-seed.json — Perfil de exemplo para testes em dev
  affects:
    - Navegação geral — item "Perfis" no left rail agora é clicável
    - data/ repo separado — pasta profiles/ criada com seed
tech_stack:
  added: []
  patterns:
    - Server components async em src/app/(shell)/ — herdam auth e shell via layout.tsx
    - Suspense boundary para carregamento assíncrono de lista de perfis
    - updateProfile.bind(null, id) — passa parâmetros extras a server action sem wrapper
    - notFound() do next/navigation para IDs inválidos (404 automático)
    - Seed data JSON determinístico (timestamps fixos) em repo de dados separado
key_files:
  created:
    - src/app/(shell)/profiles/page.tsx
    - src/app/(shell)/profiles/new/page.tsx
    - src/app/(shell)/profiles/[id]/edit/page.tsx
    - data/profiles/profile-seed.json (repo de dados separado — não commitado no repo principal)
  modified:
    - src/components/shell/left-rail.tsx (disabled: true → false no item "Perfis")
decisions:
  - "Seed data em data/profiles/profile-seed.json com timestamps fixos (1745000000000) — determinístico, sem diff a cada execução"
  - "updateProfile.bind(null, id) na página de edição — padrão idiomático Next.js para injetar parâmetros em server actions sem wrapper adicional"
  - "Suspense boundary em ProfilesContent — permite que a shell renderize o layout enquanto carrega a lista"
  - "params: Promise<{ id: string }> na página de edição — sintaxe Next.js 16 App Router para params dinâmicos"
metrics:
  duration: "~15 minutos"
  completed: "2026-04-20"
  tasks_completed: 3
  files_created: 4
  files_modified: 1
requirements:
  - PROF-01
  - PROF-02
  - PROF-03
  - PROF-04
  - PROF-05
---

# Phase 02 Plan D: Rotas de Perfis, Left Rail e Seed Data — Summary

**One-liner:** Três server components async conectando ProfileList/ProfileForm às rotas /profiles, com left rail habilitado e seed data determinístico em data/profiles/ para testes em dev.

## O Que Foi Feito

Último plano da Phase 2 — conecta todos os artefatos anteriores para o CRUD de ponta a ponta. Criação das três páginas de rota dentro da shell autenticada (`/profiles`, `/profiles/new`, `/profiles/[id]/edit`), habilitação do item "Perfis" no left rail (disabled: false), e criação do perfil de seed em `data/profiles/profile-seed.json` no repositório de dados separado.

## Tarefas Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|---------|
| D-1 | Criar seed data em data/profiles/ | — (repo de dados separado) | data/profiles/profile-seed.json |
| D-2 | Criar rotas /profiles, /profiles/new, /profiles/[id]/edit | d19a085 | profiles/page.tsx, new/page.tsx, [id]/edit/page.tsx |
| D-3 | Habilitar item Perfis no left rail | 6c8a0b5 | left-rail.tsx |
| D-4 | Verificação funcional (checkpoint) | — (aguardando aprovação) | — |

## Critérios de Sucesso

- [x] data/profiles/profile-seed.json existe com perfil realista e JSON válido
- [x] /profiles renderiza lista de perfis via listProfiles() com botão "Novo perfil"
- [x] /profiles/new renderiza formulário em branco com createProfile action
- [x] /profiles/[id]/edit renderiza formulário pré-preenchido com updateProfile.bind + notFound() guard
- [x] Left rail com item "Perfis" habilitado (disabled: false)
- [x] Item "Vagas" permanece desabilitado (disabled: true)
- [x] npx tsc --noEmit passa sem erros
- [x] npm run build completa sem erros (rotas /profiles, /profiles/[id]/edit, /profiles/new visíveis no output)
- [ ] Gestor verifica e aprova fluxo completo no checkpoint D-4 (aguardando)

## Desvios do Plano

Nenhum — plano executado exatamente conforme especificado.

## Stubs Conhecidos

Nenhum. Todas as rotas estão conectadas a server actions reais via ProfileRepository.

## Threat Flags

Nenhuma superfície nova além do threat model do plano.

- T-02D-01 (Elevation of Privilege): Rotas /profiles/* protegidas automaticamente pelo middleware de auth via shell layout.
- T-02D-02 (Tampering): getProfile() valida path traversal via JsonProfileRepository.profilePath().
- T-02D-03 (Information Disclosure): Seed data é não-sensível; gerenciado no repo de dados separado.
- T-02D-04 (Spoofing): updateProfile.bind(null, id) — id vem de params; server action re-valida existência antes de sobrescrever.

## Self-Check: PASSED

Arquivos verificados:
- `/home/henrico/github/henricos/hiring-pipeline/src/app/(shell)/profiles/page.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/app/(shell)/profiles/new/page.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/app/(shell)/profiles/[id]/edit/page.tsx` — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/src/components/shell/left-rail.tsx` (modificado) — FOUND
- `/home/henrico/github/henricos/hiring-pipeline/data/profiles/profile-seed.json` — FOUND

Commits verificados:
- `d19a085` feat(02-D): criar rotas /profiles, /profiles/new e /profiles/[id]/edit — FOUND
- `6c8a0b5` feat(02-D): habilitar item Perfis no left rail — FOUND
