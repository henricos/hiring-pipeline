---
plan: 01-E
phase: 01-foundation-authentication
status: complete
completed: 2026-04-19
executor: orchestrator-inline (sub-agent bloqueado por permissão Bash)
---

# PLAN-E — Shell UI: AppShell, LeftRail, LoginPage, LoginForm

## O que foi construído

Camada de UI completa da Phase 1: shell colapsável, tela de login e layout autenticado.

## Arquivos criados

| Arquivo | Propósito |
|---------|-----------|
| `src/components/ui/button.tsx` | Componente shadcn/ui (copiado do ai-pkm) |
| `src/components/ui/input.tsx` | Componente shadcn/ui (copiado do ai-pkm) |
| `src/components/ui/label.tsx` | Componente shadcn/ui (copiado do ai-pkm) |
| `src/components/shell/app-shell.tsx` | Shell colapsável com left rail e tonal layering |
| `src/components/shell/left-rail.tsx` | Nav lateral com Perfis e Vagas (disabled para Phase 2) |
| `src/components/login-form.tsx` | Form com `isValidCallback` exportado e proteção open redirect |
| `src/app/(auth)/login/page.tsx` | Página de login com card centralizado e footer versão/git hash |
| `src/app/(shell)/layout.tsx` | Layout protegido: `auth()` → `redirect("/login")` se sem sessão |
| `src/app/(shell)/page.tsx` | Placeholder dashboard (substituído na Phase 2) |

## Verificações

- `npm run typecheck`: 0 erros
- `npm test -- auth`: 7/7 GREEN (inclui isValidCallback — ACC-01, ACC-02, ACC-03 + 4 isValidCallback)
- `npm test` (suite completa): 28/28 GREEN

## Desvios do ai-pkm

- `AppShell`: removidas props `snapshot: NavigationSnapshot` e `activeHref` (PKM-específicas)
- `LeftRail`: criado do zero (analog ai-pkm tem NavigationTree, InboxLane — incompatíveis)
- `login-form.tsx`: `placeholder="gestor"` (era "curator_id"); `isValidCallback` exportado (era privado)
- `auth.test.ts`: mock de `@/app/actions/auth` e `next/navigation` adicionados para isolar isValidCallback

## Self-Check: PASSED
