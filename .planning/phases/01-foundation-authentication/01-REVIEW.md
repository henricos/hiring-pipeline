---
phase: 01-foundation-authentication
reviewed: 2026-04-19T21:19:17Z
depth: standard
files_reviewed: 30
files_reviewed_list:
  - src/lib/env.ts
  - src/lib/auth.ts
  - src/lib/data-service.ts
  - src/lib/base-path.ts
  - src/lib/utils.ts
  - src/lib/app-brand.ts
  - src/app/actions/auth.ts
  - src/app/api/auth/[...nextauth]/route.ts
  - src/app/(auth)/login/page.tsx
  - src/app/(shell)/layout.tsx
  - src/app/(shell)/page.tsx
  - src/app/layout.tsx
  - src/app/globals.css
  - src/components/login-form.tsx
  - src/components/shell/app-shell.tsx
  - src/components/shell/left-rail.tsx
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/__tests__/auth.test.ts
  - src/__tests__/data-service.test.ts
  - src/__tests__/env.test.ts
  - src/__tests__/base-path.test.ts
  - src/__tests__/next-config.test.ts
  - src/__tests__/container-packaging.test.ts
  - next.config.ts
  - Dockerfile
  - compose.yaml
  - .dockerignore
  - vitest.config.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-19T21:19:17Z
**Depth:** standard
**Files Reviewed:** 30
**Status:** issues_found

## Summary

Revisão da fundação de autenticação da Phase 1. O código demonstra boa qualidade geral: validação de ambiente com Zod 4, estratégia JWT via next-auth v5, proteção contra open redirect no callback URL, e cobertura de testes adequada.

Foram encontrados **1 issue crítico** (timing attack na comparação de credenciais), **4 warnings** (path traversal potencial no `ensureSubdir`, callbackUrl sem validação de profundidade no servidor, NEXTAUTH_URL construída com interpolação de ARG sem validação no Dockerfile, e `handleNavigationStart` registrado como listener mas nunca desregistrado), e **3 itens informativos** menores.

---

## Critical Issues

### CR-01: Comparação de credenciais vulnerável a timing attack

**File:** `src/lib/auth.ts:22-25`
**Issue:** A comparação `username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD` usa igualdade de string JavaScript, que interrompe a comparação no primeiro caractere diferente. Isso expõe o sistema a timing attacks: um atacante pode medir diferenças de tempo para inferir o comprimento/prefixo correto da senha. O próprio código inclui um comentário alertando para esse risco, mas o issue permanece aberto. Embora o projeto seja single-user e local, o comentário menciona que a app pode ser exposta publicamente via proxy.

**Fix:**
```typescript
import { timingSafeEqual, createHash } from "crypto";

async authorize(credentials) {
  const { username, password } = credentials as {
    username: string;
    password: string;
  };

  // Padding garante que ambas comparações sempre rodam em tempo constante
  const usernameMatch = timingSafeEqual(
    Buffer.from(username.padEnd(256)),
    Buffer.from(env.AUTH_USERNAME.padEnd(256))
  );
  const passwordMatch = timingSafeEqual(
    Buffer.from(password.padEnd(256)),
    Buffer.from(env.AUTH_PASSWORD.padEnd(256))
  );

  if (usernameMatch && passwordMatch) {
    return { id: "1", name: username };
  }
  return null;
}
```

---

## Warnings

### WR-01: Path traversal potencial em `ensureSubdir`

**File:** `src/lib/data-service.ts:26-30`
**Issue:** A função `ensureSubdir(subdir: string)` aceita qualquer string como `subdir` e faz `path.join(env.DATA_PATH, subdir)` sem sanitizar o input. Um chamador pode passar `"../../etc"` ou `"../other-dir"` e criar diretórios fora de `DATA_PATH`. Hoje não há chamadores externos — mas como esta função será usada nas phases seguintes por handlers que processam dados de usuário, o risco se materializará quando a Phase 2 adicionar endpoints.

**Fix:**
```typescript
export function ensureSubdir(subdir: string): string {
  // Rejeitar qualquer componente de path relativo
  if (!subdir || subdir.includes("..") || path.isAbsolute(subdir)) {
    throw new Error(`ensureSubdir: subdir inválido: "${subdir}"`);
  }
  const dirPath = path.join(env.DATA_PATH, subdir);
  // Confirmar que o resultado ainda está dentro de DATA_PATH
  if (!dirPath.startsWith(env.DATA_PATH + path.sep)) {
    throw new Error(`ensureSubdir: traversal detectado para "${subdir}"`);
  }
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}
```

### WR-02: `callbackUrl` não é revalidado no servidor antes do redirect

**File:** `src/app/actions/auth.ts:10-17`
**Issue:** A Server Action `authenticate` recebe `callbackUrl` do `formData` e passa diretamente para `withBasePath(callbackUrl)` sem revalidar o valor no servidor. A validação `isValidCallback` existe apenas no cliente (`login-form.tsx:10-15`). Um atacante pode forjar um POST direto para a action ignorando o formulário e passar um `callbackUrl` arbitrário — por exemplo `"//evil.com"` (double-slash, sem `://`, passa na checagem do cliente mas é tratado como URL absoluta pelo browser). `withBasePath` adicionaria o prefixo mas o resultado final dependeria do comportamento do next-auth.

**Fix:**
```typescript
// src/app/actions/auth.ts
import { isValidCallback } from "@/components/login-form";

export async function authenticate(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const rawCallback = (formData.get("callbackUrl") as string | null) ?? "/";
  // Revalidar server-side; fallback para "/" se inválido
  const fallbackUrl = "/";
  const callbackUrl =
    rawCallback && isValidCallback(rawCallback, fallbackUrl)
      ? rawCallback
      : fallbackUrl;
  // ...
}
```

Ou mover `isValidCallback` para `src/lib/auth-utils.ts` para evitar dependência cruzada de server action em componente client.

### WR-03: `NEXTAUTH_URL` construída via interpolação de ARG não validada no Dockerfile

**File:** `Dockerfile:20`
**Issue:** A linha `ENV NEXTAUTH_URL=http://127.0.0.1:3000${APP_BASE_PATH}` interpola o ARG `APP_BASE_PATH` diretamente. Se `APP_BASE_PATH` for vazio (não passado no `docker build`), a URL resultante será `http://127.0.0.1:3000` — sem pathname — o que conflitaria com a validação `superRefine` do `envSchema` em `env.ts` que exige que o pathname de `NEXTAUTH_URL` bata com `APP_BASE_PATH`. Isso causaria `process.exit(1)` no início do servidor com mensagem de erro confusa, pois o valor de `APP_BASE_PATH` dentro da imagem seria uma string vazia.

**Fix:**
```dockerfile
# Tornar APP_BASE_PATH obrigatório durante o build
ARG APP_BASE_PATH
RUN test -n "${APP_BASE_PATH}" || (echo "APP_BASE_PATH é obrigatório no build" && exit 1)
ENV APP_BASE_PATH=${APP_BASE_PATH}
ENV NEXTAUTH_URL=http://127.0.0.1:3000${APP_BASE_PATH}
```

### WR-04: `handleNavigationStart` passado como prop mas nunca remove o estado de pending em caso de erro de navegação

**File:** `src/components/shell/app-shell.tsx:21-27`
**Issue:** `workspacePending` é setado para `true` via `handleNavigationStart` e resetado via `useEffect` quando `pathname` muda. Se uma navegação falhar (erro 404, erro de rede, componente de destino lança exceção antes de montar) o `pathname` nunca muda, e `workspacePending` fica `true` indefinidamente — a barra de loading animada permanece visível para sempre. O `handleNavigationStart` é passado como `onNavigationStart` ao `LeftRail` mas os itens de navegação no `LeftRail` estão todos `disabled: true` nesta phase, então o bug não se manifesta ainda. Ele se manifestará quando a Phase 2 habilitar os links.

**Fix:**
```typescript
// Adicionar timeout de segurança para resetar o estado de pending
useEffect(() => {
  if (!workspacePending) return;
  const timeout = setTimeout(() => setWorkspacePending(false), 5000);
  return () => clearTimeout(timeout);
}, [workspacePending]);
```

---

## Info

### IN-01: `APP_ROOT_PATH` opcional não tem efeito documentado no código

**File:** `src/lib/env.ts:12-16`
**Issue:** A variável `APP_ROOT_PATH` é validada no schema Zod (deve ser caminho absoluto quando presente) mas não é usada em nenhum lugar do código revisado. O Dockerfile define `ENV APP_ROOT_PATH=/app` no runner stage, sugerindo que será usada futuramente. A ausência de uso pode causar confusão sobre o propósito da variável.

**Fix:** Adicionar um comentário no schema explicando para que `APP_ROOT_PATH` será usada (ex: resolução de paths de assets em produção), ou remover do schema até que o uso seja implementado.

### IN-02: `isValidCallback` não rejeita `//` (double-slash sem protocolo)

**File:** `src/components/login-form.tsx:10-15`
**Issue:** A checagem `url.includes("://")` rejeita `http://evil.com` mas não rejeita `//evil.com`. Browsers tratam `//evil.com` como URL relativa ao protocolo atual (protocol-relative URL), o que pode resultar em redirect para domínio externo. O risco é mitigado pelo `startsWith(baseFallback)` que exige prefixo com `"/"` + o app name, mas a ausência de checagem explícita é uma fragilidade se o `fallbackUrl` alguma vez for `"/"`.

**Fix:**
```typescript
export function isValidCallback(url: string, baseFallback: string): boolean {
  // Rejeitar protocol-relative URLs (//evil.com) e URLs absolutas
  if (url.startsWith("//") || url.includes("://")) return false;
  return url.startsWith(baseFallback);
}
```

### IN-03: Credenciais de build expostas como `ENV` no Dockerfile (layer history)

**File:** `Dockerfile:18-20`
**Issue:** As linhas `ENV AUTH_USERNAME=build-user`, `ENV AUTH_PASSWORD=build-password` e `ENV NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234` ficam gravadas no histórico de layers da imagem Docker e são visíveis via `docker history --no-trunc` ou inspeção da imagem. Embora sejam valores fictícios usados apenas no build, a prática estabelece um padrão perigoso. O comentário no código não menciona isso.

**Fix:** Usar `--secret` do Docker BuildKit para passar variáveis sensíveis sem gravá-las nos layers:
```dockerfile
# No builder stage
RUN --mount=type=secret,id=auth_password \
    AUTH_PASSWORD=$(cat /run/secrets/auth_password) npm run build
```
Ou documentar explicitamente que esses valores de build são descartáveis e não têm relação com as credenciais de produção.

---

_Reviewed: 2026-04-19T21:19:17Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
