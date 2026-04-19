# Phase 1: Foundation & Authentication - Pattern Map

**Mapeado:** 2026-04-19
**Arquivos analisados:** 26 arquivos novos (0 modificações — codebase zero)
**Analogs encontrados:** 22 / 26 (4 novos sem analog direto)

---

## Classificação de Arquivos

| Arquivo (hiring-pipeline) | Role | Data Flow | Analog mais próximo (ai-pkm) | Qualidade |
|---------------------------|------|-----------|-------------------------------|-----------|
| `src/lib/auth.ts` | utility/config | request-response | `src/lib/auth.ts` | exact |
| `src/lib/env.ts` | utility/config | batch (startup) | `src/lib/env.ts` | exact |
| `src/lib/base-path.ts` | utility | transform | `src/lib/base-path.ts` | exact |
| `src/lib/utils.ts` | utility | transform | `src/lib/utils.ts` | exact |
| `src/lib/app-brand.ts` | config | — | `src/lib/app-brand.ts` | exact |
| `src/lib/data-service.ts` | service | file-I/O | — | sem analog |
| `src/app/layout.tsx` | component | request-response | `src/app/layout.tsx` | role-match |
| `src/app/globals.css` | config | — | `src/app/globals.css` | exact |
| `src/app/(auth)/login/page.tsx` | component | request-response | `src/app/(auth)/login/page.tsx` | exact |
| `src/app/(shell)/layout.tsx` | middleware/component | request-response | `src/app/(shell)/layout.tsx` | role-match |
| `src/app/(shell)/page.tsx` | component | — | `src/app/(shell)/page.tsx` | role-match |
| `src/app/actions/auth.ts` | service | request-response | `src/app/actions/auth.ts` | exact |
| `src/app/api/auth/[...nextauth]/route.ts` | route | request-response | `src/app/api/auth/[...nextauth]/route.ts` | exact |
| `src/components/login-form.tsx` | component | request-response | `src/components/login-form.tsx` | exact |
| `src/components/shell/app-shell.tsx` | component | event-driven | `src/components/shell/app-shell.tsx` | role-match |
| `src/components/shell/left-rail.tsx` | component | event-driven | `src/components/shell/left-rail.tsx` | role-match |
| `src/components/ui/button.tsx` | component | — | `src/components/ui/button.tsx` | exact |
| `src/components/ui/input.tsx` | component | — | `src/components/ui/input.tsx` | exact |
| `src/components/ui/label.tsx` | component | — | `src/components/ui/label.tsx` | exact |
| `next.config.ts` | config | — | `next.config.ts` | exact |
| `tsconfig.json` | config | — | `tsconfig.json` | exact |
| `components.json` | config | — | `components.json` | exact |
| `vitest.config.ts` | config | — | `vitest.config.ts` | exact |
| `Dockerfile` | config | — | `Dockerfile` | role-match |
| `compose.yaml` | config | — | `compose.yaml` | role-match |
| `package.json` | config | — | `package.json` | role-match |
| `src/__tests__/auth.test.ts` | test | — | `src/__tests__/auth.test.ts` | role-match |
| `src/__tests__/base-path.test.ts` | test | — | `src/__tests__/with-base-path.test.ts` | exact |
| `src/__tests__/env.test.ts` | test | — | `src/__tests__/env.test.ts` | role-match |
| `src/__tests__/data-service.test.ts` | test | — | — | sem analog |
| `src/__tests__/container-packaging.test.ts` | test | — | `src/__tests__/container-packaging.test.ts` | role-match |

---

## Atribuições de Padrão

---

### `src/lib/auth.ts` (utility/config, request-response)

**Acao:** Copiar integralmente. Zero alterações de lógica.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/lib/auth.ts`

**Arquivo completo (linhas 1-36):**
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  logger: {
    error: (error) => console.error(`[auth] ${error.name}: ${error.message}`),
  },
  // O runtime empacotado roda atras de proxy/container e precisa aceitar o Host
  // encaminhado para que sessao e callbacks funcionem em localhost e no deploy real.
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        // Comparação de string simples — aceitável para single-user local.
        // AVISO DE SEGURANÇA: para exposição pública, substituir por
        // crypto.timingSafeEqual() ou hashing com bcrypt (ver RESEARCH.md Security Domain)
        if (
          username === env.AUTH_USERNAME &&
          password === env.AUTH_PASSWORD
        ) {
          return { id: "1", name: username };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
```

---

### `src/lib/env.ts` (utility/config, batch startup)

**Acao:** Portar com adaptações. Substituir `PKM_PATH`/`INDEX_PATH` por `DATA_PATH`. Remover a regra `superRefine` de produção que exige `INDEX_PATH`. Manter toda a lógica restante intacta.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/lib/env.ts`

**Imports e schema base (linhas 1-35):**
```typescript
import path from "path";
import { z } from "zod";
import { normalizeBasePath } from "./base-path";

// Zod 4: usa a função `error` para definir mensagens em pt-BR para campos ausentes (invalid_type)
const envSchema = z.object({
  // ADAPTAR: substituir PKM_PATH por DATA_PATH
  DATA_PATH: z
    .string({ error: (iss) => (iss.input === undefined ? "DATA_PATH é obrigatório" : undefined) })
    .min(1, "DATA_PATH é obrigatório")
    .refine(path.isAbsolute, "DATA_PATH deve ser um caminho absoluto"),
  // MANTER idêntico ao ai-pkm:
  APP_ROOT_PATH: z
    .string()
    .min(1, "APP_ROOT_PATH não pode ser vazio")
    .refine(path.isAbsolute, "APP_ROOT_PATH deve ser um caminho absoluto")
    .optional(),
  APP_BASE_PATH: z
    .string({ error: (iss) => (iss.input === undefined ? "APP_BASE_PATH é obrigatório" : undefined) })
    .min(1, "APP_BASE_PATH é obrigatório"),
  AUTH_USERNAME: z
    .string({ error: (iss) => (iss.input === undefined ? "AUTH_USERNAME é obrigatório" : undefined) })
    .min(1, "AUTH_USERNAME é obrigatório"),
  AUTH_PASSWORD: z
    .string({ error: (iss) => (iss.input === undefined ? "AUTH_PASSWORD é obrigatório" : undefined) })
    .min(8, "AUTH_PASSWORD deve ter pelo menos 8 caracteres"),
  NEXTAUTH_SECRET: z
    .string({ error: (iss) => (iss.input === undefined ? "NEXTAUTH_SECRET é obrigatório" : undefined) })
    .min(32, "NEXTAUTH_SECRET deve ter pelo menos 32 caracteres"),
  NEXTAUTH_URL: z
    .string({ error: (iss) => (iss.input === undefined ? "NEXTAUTH_URL é obrigatório" : undefined) })
    .url("NEXTAUTH_URL deve ser uma URL válida"),
})
```

**superRefine — manter validação cruzada NEXTAUTH_URL vs APP_BASE_PATH (linhas 36-86), remover apenas o bloco INDEX_PATH:**
```typescript
.superRefine((data, ctx) => {
  let normalizedBasePath: string | null = null;

  try {
    normalizedBasePath = normalizeBasePath(data.APP_BASE_PATH);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["APP_BASE_PATH"],
      message: error instanceof Error ? error.message : "APP_BASE_PATH inválido",
    });
  }

  // REMOVER o bloco INDEX_PATH (não existe no hiring-pipeline)

  if (!normalizedBasePath) {
    return;
  }

  try {
    const normalizedNextAuthPath = normalizeBasePath(new URL(data.NEXTAUTH_URL).pathname);

    if (normalizedNextAuthPath !== normalizedBasePath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXTAUTH_URL"],
        message:
          `NEXTAUTH_URL deve usar o mesmo pathname de APP_BASE_PATH. ` +
          `Exemplo correto: APP_BASE_PATH=/hiring-pipeline com NEXTAUTH_URL=https://host/hiring-pipeline.`,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("APP_BASE_PATH inválido:")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXTAUTH_URL"],
        message:
          `O pathname de NEXTAUTH_URL é inválido para o contrato do app: ${error.message.replace(
            "APP_BASE_PATH inválido:",
            "",
          ).trim()}`,
      });
    }
  }
});
```

**parseEnv e export — copiar integralmente (linhas 88-102):**
```typescript
function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n❌ Variáveis de ambiente inválidas ou ausentes:\n\n${issues}\n`
    );
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
```

**Landmine critico:** Zod 4 usa `error: (iss) => ...` (função), não `required_error:` do Zod 3. O padrão acima deve ser copiado literalmente para todos os campos obrigatórios.

---

### `src/lib/base-path.ts` (utility, transform)

**Acao:** Copiar integralmente. Zero alterações.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/lib/base-path.ts`

**Arquivo completo (linhas 1-72):**
```typescript
const BASE_PATH_ERROR_PREFIX = "APP_BASE_PATH inválido:";

function assertNonEmptyString(input: unknown): asserts input is string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} informe um path absoluto, como "/pkm".`);
  }
}

export function normalizeBasePath(input: string): string {
  assertNonEmptyString(input);

  if (input !== input.trim()) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} não use espaços antes ou depois do valor.`);
  }

  if (!input.startsWith("/")) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} o valor deve começar com "/". Exemplo: "/pkm".`);
  }

  if (input.includes("//")) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} não use barras duplicadas.`);
  }

  if (input.length > 1 && input.endsWith("/")) {
    return input.slice(0, -1);
  }

  return input;
}

export function getConfiguredBasePath(rawBasePath = process.env.APP_BASE_PATH ?? "/"): string {
  return normalizeBasePath(rawBasePath);
}

function normalizeInternalPath(pathname: string): string {
  assertNonEmptyString(pathname);

  if (pathname !== pathname.trim()) {
    throw new Error('pathname inválido: não use espaços antes ou depois do path.');
  }

  if (!pathname.startsWith("/")) {
    throw new Error('pathname inválido: o path interno deve começar com "/".');
  }

  if (pathname.includes("//")) {
    throw new Error("pathname inválido: não use barras duplicadas.");
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

// Use em redirect(), callback URLs e composição server-side onde o framework não auto-prefixa.
// Não use por padrão em next/link ou consumers já auto-prefixados pelo basePath do Next.js.
export function withBasePath(pathname: string, basePath = getConfiguredBasePath()): string {
  const normalizedBasePath = normalizeBasePath(basePath);
  const normalizedPathname = normalizeInternalPath(pathname);

  if (normalizedBasePath === "/") {
    return normalizedPathname;
  }

  if (normalizedPathname === "/") {
    return normalizedBasePath;
  }

  return `${normalizedBasePath}${normalizedPathname}`;
}
```

---

### `src/lib/utils.ts` (utility, transform)

**Acao:** Copiar integralmente.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/lib/utils.ts`

**Arquivo completo (linhas 1-6):**
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### `src/lib/app-brand.ts` (config)

**Acao:** Portar com adaptações de texto. Alterar `appId`, `appName`, `appDescription`.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/lib/app-brand.ts`

**Analog (linhas 1-5):**
```typescript
// ai-pkm original:
export const appBrand = {
  appId: "ai-pkm",
  appName: "AI PKM",
  appDescription: "Plataforma de conhecimento pessoal operada por IA.",
} as const;
```

**Versao hiring-pipeline (adaptar para):**
```typescript
export const appBrand = {
  appId: "hiring-pipeline",
  appName: "Hiring Pipeline",
  appDescription: "Plataforma de gestão do processo seletivo assistida por IA.",
} as const;
```

---

### `src/lib/data-service.ts` (service, file-I/O)

**Acao:** Criar do zero. Sem analog direto no ai-pkm. Implementar conforme D-14/D-15 do CONTEXT.md.

**Sem analog — implementar conforme especificação:**
```typescript
// src/lib/data-service.ts — NOVO (não existe no ai-pkm)
// Importa env server-side (nunca importar em Client Components)
import fs from "fs";
import path from "path";
import { env } from "@/lib/env";

/**
 * Valida que DATA_PATH existe no sistema de arquivos.
 * D-14: A raiz DEVE existir — a aplicação não cria a raiz.
 * Encerra o processo com mensagem clara se não encontrar.
 */
export function validateDataPath(): void {
  if (!fs.existsSync(env.DATA_PATH)) {
    console.error(
      `\n❌ DATA_PATH não encontrado: ${env.DATA_PATH}\n` +
      `  Crie o diretório ou monte o volume antes de iniciar a aplicação.\n`
    );
    process.exit(1);
  }
}

/**
 * Garante que uma subpasta de domínio existe em DATA_PATH.
 * D-15: Subpastas criadas automaticamente no primeiro acesso.
 * Idempotente — não falha se já existir.
 */
export function ensureSubdir(subdir: string): string {
  const dirPath = path.join(env.DATA_PATH, subdir);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}
```

**Regra de uso:** `validateDataPath()` deve ser chamado no startup da aplicação (ex: em `src/app/layout.tsx` server-side, ou em um import de módulo que roda no servidor antes de servir requisições). `ensureSubdir("profiles")`, `ensureSubdir("vacancies")` são chamados pelos services de domínio nas Phases 2-4.

---

### `src/app/layout.tsx` (component, request-response)

**Acao:** Portar com adaptações. Remover `excalifont`, `buildViewerThemeBootstrapScript`. Manter Inter com `localFont`.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/layout.tsx`

**Imports e fonte Inter (linhas 1-33):**
```typescript
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { appBrand } from "@/lib/app-brand";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "./fonts/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});
```

**Metadata e RootLayout — adaptar para hiring-pipeline (linhas 47-76):**
```typescript
export const metadata: Metadata = {
  title: {
    default: appBrand.appName,
    template: `${appBrand.appName} · %s`,
  },
  description: appBrand.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ADAPTAR: remover excalifont.variable (não existe no hiring-pipeline)
    // REMOVER: script dangerouslySetInnerHTML do buildViewerThemeBootstrapScript
    <html
      lang="pt-BR"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
```

**Arquivos de fonte:** Copiar os 4 arquivos `.woff2` de `/home/henrico/github/henricos/ai-pkm/src/app/fonts/` para `src/app/fonts/`:
- `inter-latin-400-normal.woff2`
- `inter-latin-500-normal.woff2`
- `inter-latin-600-normal.woff2`
- `inter-latin-700-normal.woff2`

---

### `src/app/globals.css` (config, design system)

**Acao:** Portar com adaptações. Copiar blocos `@theme`, reset base, utilitários (`.glass`, `.gradient-cta`, `.rail-scroll`, `.workspace-loading-bar`). Remover seções PKM-específicas: `.prose`, viewer presets, `@import "katex/dist/katex.min.css"`, `@plugin "@tailwindcss/typography"`.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/globals.css`

**Imports (linhas 1-3 — adaptar, remover katex e typography):**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
/* REMOVER: @import "katex/dist/katex.min.css"; */
/* REMOVER: @plugin "@tailwindcss/typography"; */
```

**Tokens de design — copiar integralmente (linhas 184-226):**
```css
@theme {
  /* === Cores — The Digital Curator (DESIGN.md §2) === */
  --color-surface: #f8f9fa;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f1f4f6;
  --color-surface-container: #eaeff1;
  --color-surface-bright: #ffffff;
  --color-on-surface: #2b3437;
  --color-tertiary: #0055d7;
  --color-tertiary-container: #0266ff;
  --color-on-tertiary: #ffffff;
  --color-primary-container: #dde5f5;
  --color-on-primary-container: #0a2456;
  --color-inverse-surface: #0c0f10;
  --color-inverse-on-surface: #f3f4f4;
  --color-outline-variant: #c8cfd1;
  --color-surface-container-high: #dee3e5;

  /* === Tipografia — Inter Grid Scale (DESIGN.md §3) === */
  --font-sans: "Inter", "Segoe UI", Arial, sans-serif;
  --text-display-lg: 3.5rem;
  --text-headline-sm: 1.5rem;
  --text-title-md: 1.125rem;
  --text-body-md: 0.875rem;
  --text-label-sm: 0.6875rem;

  /* === Elevation (DESIGN.md §4) === */
  --shadow-ambient: 0 12px 40px rgba(43, 52, 55, 0.06);
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
}

@custom-variant dark (&:is(.dark *));
```

**Utilitários — copiar integralmente (linhas 230-288):**
```css
body {
  font-family: var(--font-sans);
  background-color: var(--color-surface);
  color: var(--color-on-surface);
}

.glass {
  background-color: color-mix(in srgb, var(--color-surface) 70%, transparent);
  backdrop-filter: blur(12px);
}

.gradient-cta {
  background: linear-gradient(180deg, var(--color-tertiary), var(--color-tertiary-container));
}

.rail-scroll::-webkit-scrollbar { width: 7px; }
.rail-scroll::-webkit-scrollbar-track { background: var(--color-surface-container-low); }
.rail-scroll::-webkit-scrollbar-thumb { background: var(--color-outline-variant); border-radius: 2px; }
.rail-scroll::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--color-on-surface) 50%, transparent); }

@keyframes workspace-loading {
  0%   { transform: translateX(-140%); opacity: 0.2; }
  20%  { opacity: 0.7; }
  100% { transform: translateX(360%); opacity: 0.2; }
}

.workspace-loading-bar {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-on-surface) 8%, transparent),
    color-mix(in srgb, var(--color-on-surface) 28%, transparent),
    color-mix(in srgb, var(--color-on-surface) 14%, transparent)
  );
  box-shadow: 0 0 16px color-mix(in srgb, var(--color-on-surface) 10%, transparent);
  animation: workspace-loading 1s ease-in-out infinite;
}
```

**Manter também o bloco `@theme inline` do shadcn (linhas 290+):** copiar do ai-pkm sem alterações — shadcn o usa para suas variáveis CSS internas.

---

### `src/app/(auth)/login/page.tsx` (component, request-response)

**Acao:** Portar com adaptação de texto. Alterar subtítulo (linha 35). Manter estrutura, tokens, Suspense e footer intactos.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/(auth)/login/page.tsx`

**Arquivo completo (linhas 1-57), marcando a unica alteracao:**
```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
import { appBrand } from "@/lib/app-brand";

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? "1.0.0";
const gitHash = process.env.NEXT_PUBLIC_GIT_HASH;

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  const fallbackUrl = "/";

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-[400px] p-6">
        <div className="bg-surface-container-lowest p-8 rounded-sm shadow-ambient">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-tertiary font-mono text-lg font-bold leading-none">◈</span>
              <span className="text-[1.125rem] font-semibold tracking-tight text-on-surface">
                {appBrand.appName}
              </span>
            </div>
            <h1 className="text-[1.5rem] font-medium tracking-[-0.01em] text-on-surface">
              Acesso ao Sistema
            </h1>
            <p className="text-on-surface/60 text-[0.875rem] mt-1">
              {/* ADAPTAR esta linha: */}
              Acesso restrito ao gestor da área.
            </p>
          </div>

          <Suspense>
            <LoginForm fallbackUrl={fallbackUrl} />
          </Suspense>
        </div>

        <footer className="mt-8 text-center">
          <div className="text-on-surface/30 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">
            <span>
              v{appVersion}
              {gitHash ? ` · ${gitHash}` : ""}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
```

---

### `src/components/login-form.tsx` (component, request-response)

**Acao:** Portar com uma adaptacao. Alterar placeholder do campo username (linha 43): `"curator_id"` -> `"gestor"` (ou outro placeholder neutro — Claude's Discretion).

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/components/login-form.tsx`

**Arquivo completo (linhas 1-88), marcando a unica alteracao:**
```typescript
"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate } from "@/app/actions/auth";

function isValidCallback(url: string, baseFallback: string): boolean {
  // Rejeitar qualquer URL absoluta (contém "://") — previne open redirect
  if (url.includes("://")) return false;
  return url.startsWith(baseFallback);
}

export function LoginForm({ fallbackUrl }: { fallbackUrl: string }) {
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = rawCallback && isValidCallback(rawCallback, fallbackUrl)
    ? rawCallback
    : fallbackUrl;

  const [error, action, isPending] = useActionState(authenticate, null);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
          >
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="gestor"  {/* ADAPTAR: era "curator_id" */}
            required
            autoComplete="username"
            className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-destructive/8 rounded-sm border border-destructive/25">
          <p className="text-[0.75rem] font-medium text-destructive">
            {error}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gradient-cta text-on-tertiary py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {isPending ? "Aguarde..." : "Entrar"}
      </Button>
    </form>
  );
}
```

---

### `src/app/actions/auth.ts` (service, request-response)

**Acao:** Copiar integralmente. Zero alteracoes.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/actions/auth.ts`

**Arquivo completo (linhas 1-25):**
```typescript
"use server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { withBasePath } from "@/lib/base-path";

export async function authenticate(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const callbackUrl = (formData.get("callbackUrl") as string | null) ?? "/";
  try {
    await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      // next-auth não aplica basePath em redirectTo — withBasePath é necessário aqui
      redirectTo: withBasePath(callbackUrl),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Credenciais inválidas. Verifique usuário e senha.";
    }
    throw error;
  }
  return null;
}
```

---

### `src/app/api/auth/[...nextauth]/route.ts` (route, request-response)

**Acao:** Copiar integralmente.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/api/auth/[...nextauth]/route.ts`

**Arquivo completo (linhas 1-2):**
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

---

### `src/app/(shell)/layout.tsx` (middleware/component, request-response)

**Acao:** Portar com simplificacao. Remover `getNavigationSnapshot`, `warmMarkdownPipeline`. O `AppShell` do hiring-pipeline nao recebe `snapshot` — props simplificadas.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/(shell)/layout.tsx`

**Analog original (linhas 1-34) — para referência:**
```typescript
// ai-pkm original (NÃO copiar diretamente — ver versão adaptada abaixo)
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { warmMarkdownPipeline } from "@/lib/markdown/shiki";        // REMOVER
import { getNavigationSnapshot } from "@/lib/navigation/navigation-service"; // REMOVER
import { AppShell } from "@/components/shell/app-shell";

export default async function ShellLayout({ children }) {
  const session = await auth();
  if (!session) { redirect("/login"); }

  const snapshot = await getNavigationSnapshot(); // REMOVER
  warmMarkdownPipeline();                          // REMOVER

  return <AppShell snapshot={snapshot}>{children}</AppShell>; // SIMPLIFICAR
}
```

**Versao hiring-pipeline (implementar assim):**
```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
```

---

### `src/app/(shell)/page.tsx` (component, placeholder)

**Acao:** Criar conteudo customizado para hiring-pipeline. O ai-pkm usa `WorkspaceEmptyState` que e PKM-especifico — criar um empty state simples e direto.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/app/(shell)/page.tsx` (padrao de delegacao para componente)

**Padrao estrutural do analog:**
```typescript
// ai-pkm: delega para componente separado
import { WorkspaceEmptyState } from "@/components/shell/workspace-empty-state";
export default function ShellHomePage() {
  return <WorkspaceEmptyState />;
}
```

**Versao hiring-pipeline — pode ser inline (Phase 1 placeholder simples):**
```typescript
// src/app/(shell)/page.tsx — placeholder para Phase 1
// Phase 2 substituirá este conteúdo pela library de perfis
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 p-8">
      <span className="text-tertiary font-mono text-2xl font-bold">◈</span>
      <h1 className="text-[1.5rem] font-medium tracking-[-0.01em] text-on-surface">
        Hiring Pipeline
      </h1>
      <p className="text-on-surface/50 text-[0.875rem] text-center max-w-xs">
        Plataforma de gestão do processo seletivo. As features chegam nas próximas fases.
      </p>
    </div>
  );
}
```

---

### `src/components/shell/app-shell.tsx` (component, event-driven)

**Acao:** Portar com simplificacao de props. Remover `snapshot: NavigationSnapshot`, `activeHref` prop derivada. Manter `railOpen`, `toggleRail`, `workspacePending`, `usePathname`, superficies tonais e SVG do toggle.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/components/shell/app-shell.tsx`

**Interface simplificada para hiring-pipeline:**
```typescript
// ANTES (ai-pkm):
interface AppShellProps {
  snapshot: NavigationSnapshot;
  children: React.ReactNode;
  activeHref?: string;
}

// DEPOIS (hiring-pipeline):
interface AppShellProps {
  children: React.ReactNode;
}
```

**Imports — adaptar (linhas 1-8):**
```typescript
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { appBrand } from "@/lib/app-brand";
import { LeftRail } from "@/components/shell/left-rail";
// REMOVER: import type { NavigationSnapshot } from "@/lib/navigation/navigation-types";
```

**Corpo do componente — manter estrutura, remover snapshot (linhas 34-136):**
```typescript
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [railOpen, setRailOpen] = useState(true);
  const [workspacePending, setWorkspacePending] = useState(false);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => !prev);
  }, []);

  const handleNavigationStart = useCallback(() => {
    setWorkspacePending(true);
  }, []);

  useEffect(() => {
    setWorkspacePending(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside
        aria-label="Painel de navegação"
        data-testid="navigation-rail"
        className={[
          "flex flex-col h-full transition-all duration-200 ease-in-out overflow-hidden",
          "bg-surface-container-low",
          railOpen ? "w-72" : "w-12",
        ].join(" ")}
      >
        <div className="flex items-center h-12 px-3 shrink-0">
          {railOpen && (
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate">
              {appBrand.appName}
            </span>
          )}
        </div>

        <div id="rail-content" className="flex-1 overflow-hidden min-h-0" aria-hidden={!railOpen}>
          {/* ADAPTAR: LeftRail sem snapshot — menu estático de seções */}
          {railOpen && <LeftRail onNavigationStart={handleNavigationStart} />}
        </div>

        <div className="shrink-0 flex items-center justify-end px-2 py-2">
          <button
            onClick={toggleRail}
            aria-label={railOpen ? "Recolher painel" : "Expandir painel"}
            aria-expanded={railOpen}
            aria-controls="rail-content"
            className="flex items-center justify-center w-7 h-7 rounded-sm text-on-surface/35 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {railOpen ? (
                <>
                  <path d="M9 4L5 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 4L9 8L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <path d="M4 4L8 8L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </aside>

      <main
        className="relative flex-1 min-w-0 h-full overflow-y-auto bg-surface-container-lowest"
        aria-label="Área de conteúdo"
      >
        {workspacePending && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
            <div className="h-0.5 overflow-hidden bg-surface-container">
              <div className="workspace-loading-bar h-full w-1/3" />
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
```

---

### `src/components/shell/left-rail.tsx` (component, event-driven)

**Acao:** Criar do zero como menu estatico de secoes. NAO copiar o LeftRail do ai-pkm — ele tem `TreeFilterInput`, `InboxLane`, `NavigationTree` que sao PKM-especificos.

**Referencia estrutural (ai-pkm linha 27-33 — apenas a interface):**
```typescript
// ai-pkm LeftRail tem: snapshot, activeHref, onNavigationStart
// hiring-pipeline LeftRail usa: apenas onNavigationStart (menu estático)
```

**Implementar assim para Phase 1:**
```typescript
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Perfis", href: "/profiles", icon: Users, disabled: true },
  { label: "Vagas", href: "/vacancies", icon: Briefcase, disabled: true },
];

interface LeftRailProps {
  onNavigationStart?: () => void;
}

export function LeftRail({ onNavigationStart }: LeftRailProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do sistema" className="flex flex-col h-full min-h-0 px-2 py-2 gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = !item.disabled && pathname === item.href;
        const Icon = item.icon;

        if (item.disabled) {
          return (
            <span
              key={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-sm text-on-surface/30 cursor-not-allowed select-none"
              title="Disponível em breve"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[0.875rem] font-medium truncate">{item.label}</span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigationStart}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm transition-colors",
              "text-on-surface/70 hover:text-on-surface hover:bg-surface-container",
              isActive && "bg-surface-container text-on-surface font-medium"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-[0.875rem] truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

---

### `next.config.ts` (config)

**Acao:** Portar com adaptacoes minimas. Remover dependencias PKM (nenhuma no trecho relevante). Copiar logica de base path e git hash integralmente.

**Analog:** `/home/henrico/github/henricos/ai-pkm/next.config.ts`

**Arquivo completo (linhas 1-36):**
```typescript
import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";
import { normalizeBasePath } from "./src/lib/base-path";

const appVersion =
  process.env.APP_VERSION ?? process.env.npm_package_version ?? packageJson.version;

let gitHash = "dev";
try {
  gitHash =
    process.env.NEXT_PUBLIC_GIT_HASH ??
    execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  // sem git disponível (ex: build em container sem histórico)
  gitHash = process.env.NEXT_PUBLIC_GIT_HASH ?? "dev";
}

const configuredBasePath = process.env.APP_BASE_PATH
  ? normalizeBasePath(process.env.APP_BASE_PATH)
  : undefined;

const nextBasePath =
  configuredBasePath && configuredBasePath !== "/" ? configuredBasePath : undefined;

const nextConfig: NextConfig = {
  basePath: nextBasePath,
  devIndicators: false,
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
};

export default nextConfig;
```

---

### `tsconfig.json` (config)

**Acao:** Copiar integralmente.

**Analog:** `/home/henrico/github/henricos/ai-pkm/tsconfig.json`

**Arquivo completo:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

### `components.json` (config)

**Acao:** Copiar integralmente.

**Analog:** `/home/henrico/github/henricos/ai-pkm/components.json`

**Arquivo completo:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

---

### `vitest.config.ts` (config)

**Acao:** Copiar integralmente.

**Analog:** `/home/henrico/github/henricos/ai-pkm/vitest.config.ts`

**Arquivo completo:**
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

### `Dockerfile` (config, infra)

**Acao:** Portar com adaptacoes. Substituir `PKM_PATH`/`INDEX_PATH` por `DATA_PATH`. Remover `COPY models` e `COPY reference` (se nao necessario); manter `COPY .agents/skills` e `COPY AGENTS.md`. Adicionar `COPY references ./references` se houver assets de UI.

**Analog:** `/home/henrico/github/henricos/ai-pkm/Dockerfile`

**Versao hiring-pipeline:**
```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ARG APP_VERSION
ARG NEXT_PUBLIC_GIT_HASH
ARG APP_BASE_PATH
ENV APP_VERSION=${APP_VERSION}
ENV NEXT_PUBLIC_GIT_HASH=${NEXT_PUBLIC_GIT_HASH}
ENV APP_BASE_PATH=${APP_BASE_PATH}
# ADAPTAR: DATA_PATH com diretório temporário para o build
ENV DATA_PATH=/tmp/build/data
ENV AUTH_USERNAME=build-user
ENV AUTH_PASSWORD=build-password
ENV NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234
ENV NEXTAUTH_URL=http://127.0.0.1:3000${APP_BASE_PATH}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ADAPTAR: criar apenas /tmp/build/data (sem pkm/index)
RUN mkdir -p /tmp/build/data \
  && npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV APP_ROOT_PATH=/app

RUN addgroup -S -g 1001 nodejs \
  && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# REMOVER: COPY --from=builder /app/models ./models
# REMOVER: COPY --from=builder /app/reference ./reference (ai-pkm específico)
# MANTER:
COPY --from=builder /app/.agents/skills ./.agents/skills
COPY --from=builder /app/AGENTS.md ./AGENTS.md
# ADICIONAR se references/ui existir:
# COPY --from=builder /app/references ./references

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

---

### `compose.yaml` (config, infra)

**Acao:** Portar com adaptacoes. Substituir dois volumes PKM/Index por um unico volume DATA_PATH.

**Analog:** `/home/henrico/github/henricos/ai-pkm/compose.yaml`

**Versao hiring-pipeline:**
```yaml
services:
  web:
    image: hiring-pipeline:local
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      APP_ROOT_PATH: /app
      APP_BASE_PATH: /hiring-pipeline
      DATA_PATH: /data
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "${WEB_HOST_PORT:-3000}:3000"
    volumes:
      - type: bind
        source: ${DATA_HOST_PATH}
        target: /data
        # NÃO usar read_only — aplicação cria subpastas via ensureSubdir()
```

---

### `package.json` (config)

**Acao:** Criar baseado no ai-pkm. Remover deps PKM-especificas. Manter scripts e devdeps identicos.

**Analog:** `/home/henrico/github/henricos/ai-pkm/package.json`

**Deps a remover do ai-pkm (PKM-especificas):**
- `@radix-ui/react-collapsible`, `@radix-ui/react-scroll-area`, `@radix-ui/react-tooltip`
- `@shikijs/rehype`, `shiki`
- `fuse.js`, `gray-matter`
- `react-markdown`, `rehype-katex`, `remark-gfm`, `remark-math`

**Deps a manter/adaptar:**
```json
{
  "name": "hiring-pipeline",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.8.0",
    "next": "^16.2.4",
    "next-auth": "5.0.0-beta.30",
    "radix-ui": "^1.4.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "shadcn": "^4.3.0",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "zod": "4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.2.2",
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.3.0",
    "@types/node": "25.5.2",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "4.5.0",
    "@vitest/coverage-v8": "3.2.4",
    "eslint": "9.39.4",
    "eslint-config-next": "16.2.2",
    "jsdom": "26.1.0",
    "postcss": "8.5.9",
    "tailwindcss": "4.2.2",
    "typescript": "5.9.3",
    "vitest": "3.2.4"
  }
}
```

---

### Arquivos de teste

#### `src/__tests__/auth.test.ts` (test)

**Acao:** Portar com adaptacoes. Substituir `PKM_PATH` por `DATA_PATH` no mock do env. Manter toda a logica de teste (ACC-01, ACC-02, ACC-03).

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/__tests__/auth.test.ts`

**Mock do env — adaptar (linhas 8-16):**
```typescript
vi.mock("../lib/env", () => ({
  env: {
    DATA_PATH: "/home/user/data",  // ADAPTAR: era PKM_PATH
    AUTH_USERNAME: "testuser",
    AUTH_PASSWORD: "testpassword123",
    NEXTAUTH_SECRET: "12345678901234567890123456789012",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));
```

**Resto do arquivo:** copiar integralmente (regex do matcher, testes ACC-02, ACC-03).

---

#### `src/__tests__/base-path.test.ts` (test)

**Acao:** Portar com renomeacao de IDs de teste. Substituir `/pkm` por `/hiring-pipeline` nos valores de exemplo.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/__tests__/with-base-path.test.ts`

**Adaptar (todas as ocorrencias de `/pkm`):**
```typescript
// ANTES: normalizeBasePath("/pkm")
// DEPOIS: normalizeBasePath("/hiring-pipeline")
// ANTES: withBasePath("/", "/pkm")
// DEPOIS: withBasePath("/", "/hiring-pipeline")
// ANTES: expect().toThrow('... Exemplo: "/pkm".')
// DEPOIS: expect().toThrow('... Exemplo: "/pkm".') // manter a mensagem do código-fonte
```

Nota: a mensagem de erro do `normalizeBasePath` usa `"/pkm"` como exemplo no código-fonte — copiar essa mensagem literalmente dos testes (o texto do erro vem do `base-path.ts` que foi copiado sem alteracao).

---

#### `src/__tests__/env.test.ts` (test)

**Acao:** Portar com adaptacoes. Substituir `PKM_PATH` por `DATA_PATH`. Remover testes de `INDEX_PATH` (PKM-especifico). Manter testes ENV-01, ENV-02, ENV-03, RUN-01.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/__tests__/env.test.ts`

**Funcao helper — adaptar (linhas 11-19):**
```typescript
function setRequiredEnv(overrides: Partial<NodeJS.ProcessEnv> = {}) {
  process.env.DATA_PATH = "/home/user/data";         // ADAPTAR: era PKM_PATH
  process.env.APP_BASE_PATH = "/hiring-pipeline";    // ADAPTAR: era "/pkm"
  process.env.AUTH_USERNAME = "testuser";
  process.env.AUTH_PASSWORD = "testpassword123";
  process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
  process.env.NEXTAUTH_URL = "https://host/hiring-pipeline"; // ADAPTAR pathname

  Object.assign(process.env, overrides);
}
```

**Teste RUN-01 — adaptar nome da variavel:**
```typescript
test("RUN-01: chama process.exit(1) com mensagem clara quando DATA_PATH está ausente", async () => {
  setRequiredEnv();
  delete process.env.DATA_PATH;  // ADAPTAR: era PKM_PATH
  // ... resto identico
  expect(errorSpy.mock.calls.join()).toContain("DATA_PATH"); // ADAPTAR
});
```

**Remover** testes `PKG-02` (INDEX_PATH) integralmente.

**Teste ENV-03 — adaptar strings esperadas:**
```typescript
test("ENV-03: falha cedo quando NEXTAUTH_URL diverge do APP_BASE_PATH", async () => {
  setRequiredEnv({ NEXTAUTH_URL: "https://host/outro-path" });
  // ...
  expect(errorSpy.mock.calls.join()).toContain("APP_BASE_PATH=/hiring-pipeline");
  expect(errorSpy.mock.calls.join()).toContain("https://host/hiring-pipeline");
});
```

---

#### `src/__tests__/data-service.test.ts` (test)

**Acao:** Criar do zero. Sem analog direto.

**Padrao de teste a seguir (estrutura do env.test.ts do ai-pkm):**
```typescript
import fs from "fs";
import path from "path";
import { describe, test, expect, vi, afterEach } from "vitest";

vi.mock("../lib/env", () => ({
  env: { DATA_PATH: "/tmp/test-data-service" },
}));

describe("data-service", () => {
  afterEach(() => {
    vi.resetModules();
    // limpar dir temporário se criado
    if (fs.existsSync("/tmp/test-data-service")) {
      fs.rmSync("/tmp/test-data-service", { recursive: true });
    }
  });

  test("validateDataPath: encerra processo quando DATA_PATH não existe", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { validateDataPath } = await import("../lib/data-service");
    expect(() => validateDataPath()).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("DATA_PATH");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("ensureSubdir: cria subpasta automaticamente se não existir", async () => {
    fs.mkdirSync("/tmp/test-data-service", { recursive: true });
    const { ensureSubdir } = await import("../lib/data-service");

    const result = ensureSubdir("profiles");
    expect(result).toBe("/tmp/test-data-service/profiles");
    expect(fs.existsSync("/tmp/test-data-service/profiles")).toBe(true);
  });

  test("ensureSubdir: idempotente — não falha se subpasta já existe", async () => {
    fs.mkdirSync("/tmp/test-data-service/vacancies", { recursive: true });
    const { ensureSubdir } = await import("../lib/data-service");

    expect(() => ensureSubdir("vacancies")).not.toThrow();
  });
});
```

---

#### `src/__tests__/container-packaging.test.ts` (test)

**Acao:** Portar com adaptacoes. Substituir verificacoes de `models`, `reference`, `pkm`, `index` pelas expectativas do hiring-pipeline.

**Analog:** `/home/henrico/github/henricos/ai-pkm/src/__tests__/container-packaging.test.ts`

**Teste de Dockerfile — adaptar (linhas 17-33):**
```typescript
it("builds a non-root standalone runtime image without dynamic data", () => {
  const dockerfile = readRepoFile("Dockerfile");

  expect(dockerfile).toContain("FROM node:");
  expect(dockerfile).toContain("AS builder");
  expect(dockerfile).toContain("AS runner");
  expect(dockerfile).toContain("USER nextjs");
  expect(dockerfile).toContain("EXPOSE 3000");
  expect(dockerfile).toContain(".next/standalone");
  expect(dockerfile).toContain(".next/static");
  expect(dockerfile).toContain("AGENTS.md");
  expect(dockerfile).toContain(".agents/skills");
  // ADAPTAR: verificar DATA_PATH em vez de PKM_PATH
  expect(dockerfile).toContain("DATA_PATH");
  // ADAPTAR: garantir que dados não são copiados na imagem
  expect(dockerfile).not.toMatch(/COPY\s+.*\bdata\b(?!-service)/i);
});
```

**Teste de .dockerignore — adaptar (linhas 35-44):**
```typescript
it("excludes dynamic and local-only files from the docker build context", () => {
  const dockerignore = readRepoFile(".dockerignore");

  expect(dockerignore).toContain(".git");
  expect(dockerignore).toContain("node_modules");
  expect(dockerignore).toContain(".next");
  expect(dockerignore).toContain(".env");
  expect(dockerignore).toContain("data-local");  // ADAPTAR: era "pkm"/"index"
});
```

---

## Padroes Compartilhados

### Autenticacao e Protecao de Rotas

**Fonte:** `src/lib/auth.ts` + `src/app/(shell)/layout.tsx`
**Aplicar em:** `(shell)/layout.tsx`, `(auth)/login/page.tsx`, `app/actions/auth.ts`, `api/auth/[...nextauth]/route.ts`

```typescript
// Padrao de verificacao de sessao (server-side)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const session = await auth();
if (!session) redirect("/login");
```

### Tratamento de Erros de Auth

**Fonte:** `src/app/actions/auth.ts` (linhas 18-23)
**Aplicar em:** qualquer server action de autenticacao

```typescript
// Padrao: relanca erros que NAO sao AuthError (ex: erros de rede)
// Retorna string de erro apenas para AuthError (credenciais invalidas)
try {
  await signIn(...)
} catch (error) {
  if (error instanceof AuthError) {
    return "Credenciais inválidas. Verifique usuário e senha.";
  }
  throw error; // outros erros sobem para o error boundary
}
```

### Composicao de classNames

**Fonte:** `src/lib/utils.ts`
**Aplicar em:** todos os componentes

```typescript
import { cn } from "@/lib/utils";
// Uso: cn("base-class", condition && "conditional-class", variableClass)
```

### Tokens de Design (constantes)

**Fonte:** `src/app/globals.css` (linhas 184-226)
**Aplicar em:** todos os componentes

| Token | Valor | Uso |
|-------|-------|-----|
| `bg-surface` | `#f8f9fa` | Fundo de paginas (login, layout raiz) |
| `bg-surface-container-lowest` | `#ffffff` | Cards, workspace, conteudo principal |
| `bg-surface-container-low` | `#f1f4f6` | Rail, inputs em repouso |
| `bg-surface-container` | `#eaeff1` | Item ativo no rail, hover states |
| `text-on-surface` | `#2b3437` | Texto principal |
| `text-tertiary` | `#0055d7` | Accent, links, simbolos de marca |
| `shadow-ambient` | `0 12px 40px rgba(43,52,55,0.06)` | Cards flutuantes |
| `gradient-cta` | `linear-gradient(180deg, #0055d7, #0266ff)` | Botao primario |
| `rounded-sm` | `0.125rem` | Border radius padrao (nunca xl) |

### No-Line Rule

**Fonte:** DESIGN.md do ai-pkm / CONTEXT.md D-02
**Aplicar em:** qualquer separacao visual entre secoes

```
Rail (#f1f4f6) | Workspace (#ffffff)
Separacao por tonalidade — NUNCA por border-1px
```

### withBasePath em Server Redirects

**Fonte:** `src/app/actions/auth.ts` linha 16
**Aplicar em:** qualquer `redirect()` ou `redirectTo` server-side

```typescript
import { withBasePath } from "@/lib/base-path";
// CORRETO: redirect(withBasePath("/alguma-rota"))
// ERRADO:  redirect("/alguma-rota") — sem basePath em server actions
// ERRADO:  <Link href={withBasePath("...")}> — Next.js auto-prefixa em Links
```

---

## Sem Analog Encontrado

| Arquivo | Role | Data Flow | Motivo |
|---------|------|-----------|--------|
| `src/lib/data-service.ts` | service | file-I/O | ai-pkm usa filesystem readonly (PKM_PATH) sem criacao de subdirs automatica — estrutura de dirs e criada manualmente antes do deploy |
| `src/__tests__/data-service.test.ts` | test | — | Testa modulo novo sem precedente no ai-pkm |
| `.env.local.example` | config | — | Arquivo de documentacao simples; sem analog no ai-pkm |
| `.dockerignore` | config | — | ai-pkm tem `.dockerignore` mas o conteudo precisa de adaptacao (data-local em vez de pkm/index) |

---

## Metadata

**Escopo de busca de analogs:** `/home/henrico/github/henricos/ai-pkm/src/`
**Arquivos lidos:** 22 arquivos do ai-pkm
**Data de extracao de padroes:** 2026-04-19
**Validade:** ate 2026-05-19 (stack estavel; next-auth v5 em beta — verificar changelogs se passar 30 dias)
