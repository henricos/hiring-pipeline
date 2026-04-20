---
created: 2026-04-20T12:23:31.799Z
title: Corrigir basePath duplicado no redirect pós-login
area: auth
files:
  - next.config.ts
  - src/lib/auth.ts
  - src/lib/env.ts
---

## Problem

Após login em dev, o redirect duplica o basePath na URL (ex: `/hiring-pipeline/hiring-pipeline`).
O `loadEnvConfig` foi adicionado ao `next.config.ts` para que `APP_BASE_PATH` seja lido corretamente
na fase de config — mas o redirect do NextAuth pós-autenticação ainda não está correto.
Investigar interação entre `NEXTAUTH_URL`, `pages.signIn` em `auth.ts` e o `basePath` do Next.js.

## Solution

TBD — provavelmente ajustar `pages.signIn` para path relativo ao basePath, ou configurar
`basePath` no NextAuth (`auth.ts`) explicitamente. Verificar como ai-pkm trata isso.
