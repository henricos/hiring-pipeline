# Phase 1: Foundation & Authentication - Research

**Researched:** 2026-04-19
**Domain:** Next.js 16 App Router · next-auth v5 Credentials · Tailwind CSS 4 · shadcn/ui · Docker multi-stage · JSON persistence
**Confidence:** HIGH (todas as evidências provêm de leitura direta do código de referência ai-pkm + npm registry)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Sidebar lateral colapsável (left rail) — alterna entre expandida (label + ícone) e recolhida (só ícones). Mesmo comportamento do ai-pkm (`AppShell` + `LeftRail`).
- **D-02:** Separação tonal de superfícies — sem bordas 1px (No-Line Rule do DESIGN.md). Rail em `bg-surface-container-low`, workspace em `bg-surface-container-lowest`.
- **D-03:** Phase 1 provisiona o shell com placeholder no slot de conteúdo.
- **D-04:** Nome da aplicação: **"Hiring Pipeline"** — no card de login e no header da sidebar.
- **D-05:** Tela de login: card centralizado sobre `bg-surface`, mesmo layout do ai-pkm. Adaptar apenas nome e subtítulo.
- **D-06:** Pós-login redireciona para `"/"` — página placeholder/dashboard vazio.
- **D-07:** Mensagem de erro genérica no login (não revela qual campo está errado).
- **D-08:** Footer discreto na tela de login com versão + git hash.
- **D-09:** Design system idêntico ao ai-pkm (adaptar referências textuais "PKM" → "Hiring Pipeline").
- **D-10:** DESIGN.md copiado/adaptado para a raiz deste projeto.
- **D-11:** Tipografia Inter exclusivamente. Tokens de cor idênticos ao ai-pkm.
- **D-12:** Pasta `references/ui/screens/` criada com tela de login reaproveitada do ai-pkm.
- **D-13:** `DATA_PATH` configurável via variável de ambiente.
- **D-14:** Raiz de `DATA_PATH` deve existir no startup — aplicação valida e recusa subir se não encontrar.
- **D-15:** Subpastas de domínio criadas automaticamente no primeiro acesso.
- **D-16:** Um arquivo JSON por entidade: `{DATA_PATH}/profiles/{id}.json`, `{DATA_PATH}/vacancies/{id}.json`.
- **D-17:** Repo de dados separado, montado via bind mount no Compose.
- **D-18:** Dockerfile multi-stage `base → deps → builder → runner`, `node:22-alpine`, output `standalone`.
- **D-19:** `.env.local` em dev (gitignored); produção via env vars declaradas no `compose.yaml`.
- **D-20:** Env vars Phase 1: `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `APP_BASE_PATH`, `DATA_PATH`.
- **D-21:** next-auth Credentials provider, estratégia JWT, `trustHost: true`. Comparação simples de string.
- **D-22:** Rota de login em `/login`. Middleware de auth protege todas as rotas exceto `/login` e assets.

### Claude's Discretion

- Estrutura exata de pastas no `src/` — seguir convenções do ai-pkm como referência.
- Nome do app brand token (`app-brand.ts`) e símbolo visual na tela de login.
- Conteúdo exato da página placeholder pós-login.

### Deferred Ideas (OUT OF SCOPE)

- Pasta `references/ui/screens/` com mais telas além do login — será preenchida nas Phases 2-4.
- Sidebar com itens desabilitados mostrando "em breve" — decisão de apresentação exata fica para Phase 2.
- Qualquer feature de negócio (perfis, vagas, IA).

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APP-01 | Aplicação protegida por autenticação single-user via next-auth (credenciais em variáveis de ambiente) | `lib/auth.ts` (portado do ai-pkm) + `lib/env.ts` com validação Zod + server action `authenticate` + layout guard em `(shell)/layout.tsx` |
| APP-02 | Aplicação acessível via base path configurável (padrão `/hiring-pipeline`) | `lib/base-path.ts` (portado integralmente do ai-pkm) + `next.config.ts` com `normalizeBasePath` + env var `APP_BASE_PATH` |

</phase_requirements>

---

## Summary

Esta fase é fundamentalmente um exercício de **porting fiel** do projeto ai-pkm, com adaptações mínimas de nomenclatura. Todo o padrão arquitetural, design system, configuração Docker e lógica de autenticação já existem e estão validados em produção no ai-pkm. O risco técnico é baixo; o risco de desvio desnecessário do padrão de referência é o maior cuidado a ter.

A diferença principal entre ai-pkm e hiring-pipeline nesta fase é: (1) ausência de `PKM_PATH`/`INDEX_PATH` — substituídos por `DATA_PATH` único para JSON; (2) o `LeftRail` precisa de um menu de seções simples (Perfis, Vagas) ao invés da árvore de navegação PKM complexa; (3) o Dockerfile não precisa copiar `models/` nem `reference/` do PKM.

O stack é idêntico ao ai-pkm: Next.js `^16.2.3`, React `19.2.4`, next-auth `5.0.0-beta.30`, Tailwind CSS `4.2.2`, shadcn/ui (estilo `radix-nova`), Vitest `3.2.4`, TypeScript `5.9.3`.

**Primary recommendation:** Portar arquivos do ai-pkm na ordem: 1) infra (`package.json`, `tsconfig.json`, `next.config.ts`, `Dockerfile`, `compose.yaml`), 2) design system (`globals.css`, tokens Inter), 3) auth (`lib/env.ts`, `lib/auth.ts`, `lib/base-path.ts`), 4) shell (`AppShell`, `LeftRail` simplificado), 5) login (`login/page.tsx`, `login-form.tsx`, `actions/auth.ts`), 6) dados (`lib/data-path.ts` novo), 7) placeholder home.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Autenticação / sessão JWT | API / Backend (next-auth handlers) | Frontend Server (layout guard) | next-auth gerencia tokens server-side; layout faz dupla proteção antes de renderizar a shell |
| Validação de env vars no startup | API / Backend (Node.js process startup) | — | `lib/env.ts` com Zod roda no process ao importar — falha antes de servir qualquer requisição |
| Tela de login | Frontend Server (RSC page) | Browser (Client Component form) | `login/page.tsx` é RSC; `LoginForm` é Client Component por precisar de `useActionState`/`useSearchParams` |
| Shell / sidebar colapsável | Browser / Client | — | `AppShell` é "use client" — estado de toggle é local; não precisa de SSR |
| Base path configuração | API / Backend (next.config.ts) | — | `basePath` é configurado em build-time no Next.js config; `withBasePath` é usado server-side em redirects |
| Persistência JSON (DATA_PATH) | API / Backend (service layer) | — | Acesso a sistema de arquivos é exclusivamente server-side; componentes nunca tocam o FS diretamente |
| Docker / Compose | CDN / Static (infraestrutura) | — | Build e runtime containerizados; dados montados via bind mount externo |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | `^16.2.4` | Framework web full-stack com App Router | Stack mandatório do projeto (réplica ai-pkm) [VERIFIED: npm registry] |
| react / react-dom | `19.2.4` | UI runtime | Par obrigatório com Next.js 16 [VERIFIED: ai-pkm package.json] |
| next-auth | `5.0.0-beta.30` | Autenticação Credentials + JWT | Única versão v5 que o ai-pkm usa; v4 usa API diferente [VERIFIED: ai-pkm package.json + npm registry] |
| typescript | `5.9.3` | Tipagem estática | Devdep mandatório [VERIFIED: ai-pkm package.json] |
| tailwindcss | `4.2.2` | CSS utility-first | Tailwind 4 — configuração via CSS (`@theme`) sem `tailwind.config.js` [VERIFIED: ai-pkm package.json] |
| shadcn (CLI) | `^4.3.0` | Gerador de componentes UI | shadcn v4 compatível com Tailwind 4 + estilo `radix-nova` [VERIFIED: npm registry] |
| zod | `4.3.6` | Validação de env vars (schema) | Mesmo padrão do `lib/env.ts` do ai-pkm [VERIFIED: ai-pkm package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | `^2.1.1` | Composição de classNames condicionais | Usado em todos os componentes via `cn()` do utils.ts |
| tailwind-merge | `^3.5.0` | Resolução de conflitos Tailwind | Parte do `cn()` helper |
| class-variance-authority | `^0.7.1` | Variantes de componentes shadcn | Gerado automaticamente com componentes shadcn |
| lucide-react | `^1.8.0` | Ícones para o LeftRail (Perfis, Vagas, etc.) | iconLibrary do components.json é "lucide" |
| tw-animate-css | `^1.4.0` | Utilitários de animação Tailwind | Importado em globals.css no ai-pkm |

### Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| vitest | `3.2.4` | Framework de testes unitários |
| @vitejs/plugin-react | `4.5.0` | Plugin React para Vitest |
| @testing-library/react | `16.3.0` | Render de componentes em teste |
| @testing-library/jest-dom | `6.6.3` | Matchers DOM para Vitest |
| jsdom | `26.1.0` | Ambiente DOM simulado para Vitest |
| @tailwindcss/postcss | `4.2.2` | Integração PostCSS para Tailwind 4 |
| eslint-config-next | `16.2.2` | Regras ESLint do Next.js |

### Alternativas Consideradas

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-auth v5 beta | next-auth v4 estável | v4 usa API diferente (`getServerSession`, providers em objeto separado) — incompatível com padrão do ai-pkm; v5 já validado em produção no ai-pkm |
| JSON flat files | SQLite/Prisma | SQLite não é diffável via git; JSON é portável e simples para v1 |
| Vitest | Jest | Vitest é mais rápido e integra melhor com Vite/Next.js; padrão do ai-pkm |

**Installation:**
```bash
npm install next@^16.2.4 react@19.2.4 react-dom@19.2.4 next-auth@5.0.0-beta.30 zod@4.3.6 clsx@^2.1.1 tailwind-merge@^3.5.0 class-variance-authority@^0.7.1 lucide-react@^1.8.0 tw-animate-css@^1.4.0 shadcn@^4.3.0

npm install -D typescript@5.9.3 tailwindcss@4.2.2 @tailwindcss/postcss@4.2.2 vitest@3.2.4 @vitejs/plugin-react@4.5.0 @testing-library/react@16.3.0 @testing-library/jest-dom@6.6.3 jsdom@26.1.0 eslint eslint-config-next@16.2.2 @types/node @types/react @types/react-dom
```

**Componentes shadcn a instalar:**
```bash
npx shadcn@latest add button input label
```

---

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  │  GET /<base-path>/*
  ▼
Next.js App Router (server)
  │
  ├─ src/app/layout.tsx          ← RootLayout (Inter font, html lang="pt-BR")
  │
  ├─ src/app/(auth)/login/       ← LoginPage [RSC]
  │    └─ Verifica session → se autenticado, redirect "/"
  │    └─ LoginForm [Client]
  │         └─ useActionState → src/app/actions/auth.ts [Server Action]
  │              └─ signIn("credentials") → next-auth
  │                   └─ lib/auth.ts: authorize() → compara AUTH_USERNAME/AUTH_PASSWORD
  │                        └─ success: JWT cookie httpOnly
  │                        └─ failure: return "Credenciais inválidas..."
  │
  ├─ src/app/(shell)/layout.tsx  ← ShellLayout [RSC, auth guard]
  │    └─ auth() → se sem sessão, redirect "/login"
  │    └─ <AppShell> [Client]
  │         └─ <LeftRail> [Client] — menu: Perfis (disabled), Vagas (disabled)
  │         └─ {children} — workspace área
  │
  ├─ src/app/(shell)/page.tsx    ← placeholder home (empty state)
  │
  ├─ src/app/api/auth/[...nextauth]/route.ts ← next-auth handlers
  │
  └─ lib/env.ts                  ← Zod schema: valida env vars no startup
       lib/auth.ts               ← next-auth config (trustHost, JWT, Credentials)
       lib/base-path.ts          ← normalizeBasePath / withBasePath
       lib/data-service.ts       ← valida DATA_PATH existe + cria subpastas
```

**Data flow — login:**
Usuário submete form → Server Action `authenticate` → `signIn("credentials")` → `auth.ts authorize()` → JWT cookie → redirect para `/`

**Data flow — rota protegida:**
Request chega → `ShellLayout` chama `auth()` → sem sessão → redirect `/login`; com sessão → renderiza `AppShell` com children

### Recommended Project Structure

```
hiring-pipeline/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx            # LoginPage [RSC]
│   │   ├── (shell)/
│   │   │   ├── layout.tsx             # ShellLayout com auth guard
│   │   │   └── page.tsx               # Placeholder home (empty state)
│   │   ├── actions/
│   │   │   └── auth.ts                # Server action: authenticate()
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts       # next-auth GET/POST handlers
│   │   ├── fonts/                     # Inter woff2 (copiar do ai-pkm)
│   │   ├── globals.css               # Tailwind 4 + design tokens
│   │   └── layout.tsx                # RootLayout (html, font, metadata)
│   ├── components/
│   │   ├── login-form.tsx             # LoginForm [Client Component]
│   │   ├── shell/
│   │   │   ├── app-shell.tsx          # AppShell [Client] — toggle rail
│   │   │   ├── left-rail.tsx          # LeftRail simplificado para hiring
│   │   │   └── placeholder-home.tsx   # Empty state da rota /
│   │   └── ui/                        # shadcn components (button, input, label)
│   ├── lib/
│   │   ├── auth.ts                    # next-auth config
│   │   ├── app-brand.ts              # { appId, appName, appDescription }
│   │   ├── base-path.ts              # normalizeBasePath / withBasePath
│   │   ├── data-service.ts           # DATA_PATH validation + mkdir automático
│   │   ├── env.ts                    # Zod schema env vars
│   │   └── utils.ts                  # cn() helper
│   └── __tests__/                    # Vitest tests
│       ├── auth.test.ts
│       ├── base-path.test.ts
│       ├── env.test.ts
│       └── data-service.test.ts
├── next.config.ts
├── tsconfig.json
├── components.json
├── vitest.config.ts
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .env.local.example               # Exemplo com todos os env vars
├── DESIGN.md                        # Cópia adaptada do ai-pkm/DESIGN.md
└── references/
    └── ui/
        └── screens/
            └── 01-login/
                ├── code.html          # Referência HTML do ai-pkm
                └── screen.png         # Screenshot de referência
```

### Pattern 1: next-auth Credentials com trustHost

**What:** Autenticação single-user via comparação direta de strings com env vars. JWT strategy, trustHost habilitado para funcionar atrás de proxy/container.

**When to use:** Sempre — é a única estratégia de auth desta fase.

**Example (portar diretamente do ai-pkm, mudar apenas `PKM_PATH` → `DATA_PATH` no env.ts):**

```typescript
// src/lib/auth.ts — copiar integralmente do ai-pkm, sem alterações
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  logger: { error: (error) => console.error(`[auth] ${error.name}: ${error.message}`) },
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as { username: string; password: string };
        if (username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD) {
          return { id: "1", name: username };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});
// Source: /home/henrico/github/henricos/ai-pkm/src/lib/auth.ts [VERIFIED: leitura direta]
```

### Pattern 2: Env Validation com Zod 4

**What:** Schema Zod valida todas as env vars no startup — processo encerra com mensagem clara se qualquer var estiver ausente ou inválida.

**Adaptação para hiring-pipeline (substituir PKM_PATH/INDEX_PATH por DATA_PATH):**

```typescript
// src/lib/env.ts — adaptar do ai-pkm
const envSchema = z.object({
  DATA_PATH: z
    .string({ error: (iss) => (iss.input === undefined ? "DATA_PATH é obrigatório" : undefined) })
    .min(1, "DATA_PATH é obrigatório")
    .refine(path.isAbsolute, "DATA_PATH deve ser um caminho absoluto"),
  APP_BASE_PATH: z.string().min(1, "APP_BASE_PATH é obrigatório"),
  AUTH_USERNAME: z.string().min(1, "AUTH_USERNAME é obrigatório"),
  AUTH_PASSWORD: z.string().min(8, "AUTH_PASSWORD deve ter pelo menos 8 caracteres"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET deve ter pelo menos 32 caracteres"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL deve ser uma URL válida"),
  APP_ROOT_PATH: z.string().optional(),
  // superRefine: validar que NEXTAUTH_URL pathname == APP_BASE_PATH (copiar do ai-pkm)
});
// Source: /home/henrico/github/henricos/ai-pkm/src/lib/env.ts [VERIFIED: leitura direta]
```

**Landmine crítico:** Zod 4 usa `error:` (função) para mensagens de campos ausentes (`invalid_type`), não `required_error:` do Zod 3. O ai-pkm já usa Zod 4 — copiar o padrão exato.

### Pattern 3: Base Path — normalizeBasePath + withBasePath

**What:** Utilitário puro que valida e normaliza `APP_BASE_PATH`. Usado em `next.config.ts`, em `actions/auth.ts` (redirectTo), e em qualquer redirect server-side que precise do prefixo.

**Copiar integralmente — sem alterações:**

```typescript
// src/lib/base-path.ts — copiar integralmente do ai-pkm
export function normalizeBasePath(input: string): string { /* ... */ }
export function getConfiguredBasePath(rawBasePath = process.env.APP_BASE_PATH ?? "/"): string { /* ... */ }
export function withBasePath(pathname: string, basePath = getConfiguredBasePath()): string { /* ... */ }
// Source: /home/henrico/github/henricos/ai-pkm/src/lib/base-path.ts [VERIFIED: leitura direta]
```

**Regra de uso:** `withBasePath` é necessário APENAS em `redirect()` e `redirectTo` de Server Actions. `<Link href="...">` não precisa — Next.js auto-prefixa com `basePath`.

### Pattern 4: Shell Layout Guard (dupla proteção)

**What:** `(shell)/layout.tsx` é RSC que chama `auth()` antes de renderizar qualquer filho. Redireciona para `/login` se não houver sessão.

**Adaptação para hiring-pipeline (remover getNavigationSnapshot e warmMarkdownPipeline):**

```typescript
// src/app/(shell)/layout.tsx
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
// Source: /home/henrico/github/henricos/ai-pkm/src/app/(shell)/layout.tsx [VERIFIED: leitura direta]
```

**Diferença do ai-pkm:** `AppShell` do hiring-pipeline não recebe `snapshot` de navegação complexo — o LeftRail é um menu estático simples de Phase 1.

### Pattern 5: AppShell Simplificado

O `AppShell` do ai-pkm recebe `NavigationSnapshot` (estrutura de árvore PKM) que não existe no hiring-pipeline Phase 1. O shell desta fase deve ser uma versão simplificada:

- **Remover:** `snapshot`, `NavigationSnapshot`, prop `activeHref` derivada de usePathname
- **Manter:** estado `railOpen`, toggle button, superfícies tonais, `workspacePending` loading bar
- **LeftRail simplificado:** lista estática de itens de menu (Perfis, Vagas) com `href` para futuras fases

```tsx
// src/components/shell/left-rail.tsx — NOVO (não copiar do ai-pkm diretamente)
// Estrutura simples: lista de NavItem com { label, href, icon, disabled? }
// Sem TreeFilterInput, InboxLane, NavigationTree — esses são PKM-específicos
// [ASSUMED: estrutura do menu simplificado; Claude's Discretion por D-03]
```

### Pattern 6: DATA_PATH — Serviço de Persistência JSON

**What:** Novo módulo inexistente no ai-pkm. Valida `DATA_PATH` no startup e cria subpastas automaticamente.

```typescript
// src/lib/data-service.ts — NOVO (não existe no ai-pkm)
import fs from "fs";
import path from "path";
import { env } from "@/lib/env";

export function validateDataPath(): void {
  if (!fs.existsSync(env.DATA_PATH)) {
    console.error(`\n❌ DATA_PATH não encontrado: ${env.DATA_PATH}\n`
      + `  Crie o diretório ou monte o volume antes de iniciar a aplicação.\n`);
    process.exit(1);
  }
}

export function ensureSubdir(subdir: string): string {
  const dirPath = path.join(env.DATA_PATH, subdir);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}
// [ASSUMED: implementação baseada em D-14/D-15 do CONTEXT.md]
```

**Validação D-14:** A raiz de `DATA_PATH` DEVE existir — a aplicação não cria a raiz, só as subpastas. Isso exige que o operador garanta que o diretório de dados esteja montado antes do `docker run`.

### Anti-Patterns to Avoid

- **Middleware.ts para auth:** O ai-pkm NÃO usa `middleware.ts` — usa layout guard. Não adicionar middleware desnecessário que duplicaria proteção.
- **`withBasePath` em `<Link href>`:** Next.js já prefixa automaticamente com `basePath`. Usar `withBasePath` só em `redirect()` e `redirectTo`.
- **Hardcodar `/hiring-pipeline`:** Toda referência ao base path deve ler de `APP_BASE_PATH`; nunca hardcodar o valor padrão no código.
- **Importar `env` em Client Components:** `lib/env.ts` lê `process.env` server-side com Zod e chama `process.exit(1)` em falha — nunca importar em código client.
- **Criar `DATA_PATH` raiz automaticamente:** D-14 diz explicitamente que a raiz DEVE existir — a app valida mas não cria. Apenas subpastas de domínio são criadas automaticamente (D-15).
- **Copiar `LeftRail` do ai-pkm integralmente:** O LeftRail PKM tem `TreeFilterInput`, `InboxLane`, `NavigationTree` — PKM-específicos. A Phase 1 precisa de um menu de seções simples.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Autenticação / JWT / cookies | Sistema próprio de sessão | next-auth v5 | Gerencia httpOnly cookies, CSRF, rotação de tokens, redirects seguros |
| Validação de env vars | `if (!process.env.X)` manual | Zod schema em `lib/env.ts` | Zod falha fast com mensagens claras; validação cross-field (NEXTAUTH_URL vs APP_BASE_PATH) |
| Composição de classNames | concatenação de strings | `cn()` = clsx + tailwind-merge | Resolve conflitos de utilitários Tailwind (ex: `bg-red-500 bg-blue-500` → último vence) |
| Normalização de paths | `trim().replace()` manual | `normalizeBasePath()` | Trata edge cases: trailing slash, double slash, espaços, path relativo |
| Mkdir recursivo com verificação | loop manual | `fs.mkdirSync(path, { recursive: true })` | Node built-in, idempotente, não falha se já existe |
| Componentes de formulário (input, label, button) | HTML puro estilizado | shadcn/ui (gerado via CLI) | Acessibilidade ARIA, estados focus/disabled, integração com design tokens |

**Key insight:** No ai-pkm, NENHUMA das funcionalidades centrais (auth, paths, env) foi reinventada — tudo usa libraries estabelecidas com wrappers finos de validação/adaptação. Replicar essa filosofia aqui.

---

## Common Pitfalls

### Pitfall 1: Zod 4 vs Zod 3 — API de mensagens de erro

**What goes wrong:** Se o dev usa `required_error:` (Zod 3 API) em vez de `error: (iss) => ...` (Zod 4), variáveis ausentes não mostram mensagem customizada — exibem o erro genérico de type.

**Why it happens:** Zod 4 mudou a API de mensagens. O ai-pkm usa `error:` (função) em todos os campos obrigatórios do `env.ts`.

**How to avoid:** Copiar o padrão exato do `lib/env.ts` do ai-pkm:
```typescript
z.string({ error: (iss) => (iss.input === undefined ? "VAR é obrigatório" : undefined) })
```

**Warning signs:** Mensagem de erro genérica "Expected string, received undefined" em vez da mensagem em pt-BR customizada.

### Pitfall 2: NEXTAUTH_URL deve ter pathname == APP_BASE_PATH

**What goes wrong:** Se `NEXTAUTH_URL=http://host/` e `APP_BASE_PATH=/hiring-pipeline`, o next-auth falha em redirecionar corretamente após login.

**Why it happens:** next-auth usa `NEXTAUTH_URL` para construir URLs de callback. Se o pathname não bate com o basePath do Next.js, o callback vai para a URL errada.

**How to avoid:** O `superRefine` do `lib/env.ts` valida exatamente isso — copiar a validação cruzada do ai-pkm. Em prod: `NEXTAUTH_URL=https://host/hiring-pipeline`.

**Warning signs:** Após login bem-sucedido, redireciona para `https://host/` em vez de `https://host/hiring-pipeline`.

### Pitfall 3: Tailwind 4 — sem tailwind.config.js

**What goes wrong:** Tentativa de criar `tailwind.config.js` ou `tailwind.config.ts` com plugins, theme extension, etc. No Tailwind 4, a configuração é feita via `@theme {}` e `@plugin` em CSS.

**Why it happens:** Tailwind 4 mudou o paradigma de configuração completamente. Documentação do Tailwind 3 (muito mais comum em resultados de busca) induz ao padrão antigo.

**How to avoid:** Copiar `globals.css` do ai-pkm. Todo o design system está em `@theme {}` no CSS. `@tailwindcss/typography` é carregado via `@plugin`.

**Warning signs:** `tailwind.config.js` sendo criado; classes customizadas não funcionando.

### Pitfall 4: next-auth v5 — `withBasePath` em redirectTo é obrigatório

**What goes wrong:** `signIn("credentials", { redirectTo: "/", ... })` — sem `withBasePath`, o next-auth redireciona para a raiz sem o base path, resultando em 404.

**Why it happens:** next-auth v5 não aplica automaticamente o `basePath` do Next.js no `redirectTo` de Server Actions.

**How to avoid:** Sempre usar `withBasePath(callbackUrl)` no `redirectTo`. Ver `src/app/actions/auth.ts` do ai-pkm.

**Warning signs:** Login bem-sucedido → 404 em vez de landing na home.

### Pitfall 5: Open Redirect via callbackUrl

**What goes wrong:** `callbackUrl` passado via query string pode ser manipulado para redirecionar para domínio externo.

**Why it happens:** next-auth v5 com Credentials provider não sanitiza automaticamente o `callbackUrl` contra redirects externos em Server Actions customizadas.

**How to avoid:** Copiar a função `isValidCallback` do `login-form.tsx` do ai-pkm — rejeita qualquer URL com `://` e aceita apenas paths que comecem com o fallback path.

**Warning signs:** `callbackUrl=https://evil.com` sendo aceito.

### Pitfall 6: Inter via next/font/google vs localFont

**What goes wrong:** Usar `next/font/google` para carregar Inter em produção Docker gera dependência de rede externa no container — falha se não houver acesso à Google Fonts.

**Why it happens:** `next/font/google` baixa a fonte em build-time, mas em containers com rede restrita pode falhar.

**How to avoid:** O ai-pkm usa `localFont` com arquivos `.woff2` locais em `src/app/fonts/`. Copiar os 4 arquivos Inter (400, 500, 600, 700) e usar `localFont`.

**Warning signs:** Erro de rede em `npm run build` ou fontes carregadas de fonts.gstatic.com em produção.

### Pitfall 7: DATA_PATH no Dockerfile — não copiar dados no build

**What goes wrong:** `COPY data/ /data` no Dockerfile inclui dados de desenvolvimento na imagem.

**Why it happens:** Confusão entre assets estáticos (correto copiar) e dados mutáveis (jamais copiar).

**How to avoid:** DATA_PATH é sempre um bind mount no `compose.yaml`. O Dockerfile nunca COPY dados; o `builder` stage usa `/tmp/build/data` como placeholder para validar o env.

**Warning signs:** Imagem Docker com dados de perfis/vagas hardcodados.

---

## Code Examples

### next.config.ts — Base Path Configurable

```typescript
// Source: /home/henrico/github/henricos/ai-pkm/next.config.ts [VERIFIED: leitura direta]
import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";
import { normalizeBasePath } from "./src/lib/base-path";

const appVersion = process.env.APP_VERSION ?? packageJson.version;

let gitHash = "dev";
try {
  gitHash = process.env.NEXT_PUBLIC_GIT_HASH
    ?? execSync("git rev-parse --short HEAD").toString().trim();
} catch {
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

### app-brand.ts — Token de Marca

```typescript
// src/lib/app-brand.ts — adaptar do ai-pkm
export const appBrand = {
  appId: "hiring-pipeline",
  appName: "Hiring Pipeline",
  appDescription: "Plataforma de gestão do processo seletivo assistida por IA.",
} as const;
```

### Login Page — Adaptações Necessárias

```typescript
// src/app/(auth)/login/page.tsx — copiar do ai-pkm, alterar:
// 1. "Apenas curadores autorizados." → "Acesso restrito ao gestor da área."
// 2. Symbol ◈ pode ser mantido ou trocado por ícone lucide (Claude's Discretion)
// 3. appBrand.appName → "Hiring Pipeline" (via app-brand.ts)
// Source: /home/henrico/github/henricos/ai-pkm/src/app/(auth)/login/page.tsx [VERIFIED]
```

### LoginForm — Adaptações Necessárias

```typescript
// src/components/login-form.tsx — copiar do ai-pkm, alterar:
// 1. placeholder do campo username: "curator_id" → nome genérico (ex: "gestor")
// 2. Resto idêntico — isValidCallback, useActionState, Server Action authenticate
// Source: /home/henrico/github/henricos/ai-pkm/src/components/login-form.tsx [VERIFIED]
```

### Dockerfile — Adaptações para hiring-pipeline

```dockerfile
# Adaptar do ai-pkm/Dockerfile:
# builder stage: substituir ENV PKM_PATH/INDEX_PATH por DATA_PATH
# ENV DATA_PATH=/tmp/build/data
# RUN mkdir -p /tmp/build/data && npm run build

# runner stage: REMOVER linhas:
# COPY --from=builder /app/models ./models
# COPY --from=builder /app/reference ./reference  (manter só references/ui se presente)
# COPY --from=builder /app/index ./index (não existe)

# Manter:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/.agents/skills ./.agents/skills
# COPY --from=builder /app/AGENTS.md ./AGENTS.md
# Source: /home/henrico/github/henricos/ai-pkm/Dockerfile [VERIFIED: leitura direta]
```

### compose.yaml — Adaptações para hiring-pipeline

```yaml
# Adaptar do ai-pkm/compose.yaml:
# Substituir PKM_PATH/INDEX_PATH por DATA_PATH
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
        source: ${DATA_HOST_PATH}   # ex: /home/henrico/data/hiring-pipeline
        target: /data
# Source: /home/henrico/github/henricos/ai-pkm/compose.yaml [VERIFIED: leitura direta, adaptado]
```

### globals.css — Copiar integralmente do ai-pkm

O `globals.css` do ai-pkm contém os tokens de design completos (cores, tipografia, elevation, utilitários). Para Phase 1, copiar tudo EXCETO as seções específicas de PKM que não existem ainda:
- Manter: `@theme {}`, reset base, `.glass`, `.gradient-cta`, `.rail-scroll`, `.workspace-loading-bar`
- Remover/ignorar: viewer theme presets (chatgpt, github, excalidraw), `.prose` — adicionar em fases futuras se necessário

---

## Environment Availability

> Phase 1 depende de Node.js, npm e Docker. Docker não foi encontrado no ambiente de pesquisa.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime de desenvolvimento | ✓ | 24.14.1 | — |
| npm | Gerenciamento de pacotes | ✓ | 11.11.0 | — |
| Docker | Build da imagem de produção | ✗ (não encontrado no shell) | — | Docker pode estar disponível via outro caminho; `npm run dev` funciona sem Docker |
| Git | `execSync("git rev-parse")` em next.config.ts | ✓ (repositório git ativo) | — | Fallback hardcoded: `NEXT_PUBLIC_GIT_HASH=dev` |

**Missing dependencies com fallback:**
- **Docker:** `npm run dev` funciona sem Docker para desenvolvimento. O planner deve incluir uma task de verificação de Docker antes da task de build de imagem. Se Docker não estiver disponível no ambiente de execução, a task de Docker build deve ser documentada como "executar manualmente quando Docker disponível".

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` com `theme.extend` | `@theme {}` em CSS (`globals.css`) | Tailwind 4 (2025) | Sem arquivo de config JS; toda customização em CSS |
| `@tailwindcss/postcss` implícito | `postcss.config.mjs` explícito com `@tailwindcss/postcss` | Tailwind 4 | Requer devDependency separada |
| next-auth v4: `getServerSession()`, `authOptions` | next-auth v5: `auth()` exportado diretamente, `NextAuth({...})` | next-auth 5 beta (2024) | API mais simples; `auth()` é o único ponto de entrada |
| `next-auth` com `NEXTAUTH_URL` automático | `trustHost: true` necessário em container | next-auth v5 beta | Sem `trustHost`, sessões falham atrás de proxy |
| Fonts via CDN Google Fonts | `localFont` com woff2 bundled | next/font best practice | Sem dependência de rede em produção |

**Deprecated/outdated:**
- `getServerSession(authOptions)`: API do next-auth v4 — não usar. Usar `auth()` do next-auth v5.
- `tailwind.config.js`: Não criar. Tailwind 4 não usa arquivo de config JS por padrão.
- `pages/_app.tsx`: App Router não usa `pages/` — tudo em `app/`.

---

## Reference Codebase Audit — O que portar vs. adaptar

### Portar integralmente (sem alterações)

| Arquivo ai-pkm | Destino hiring-pipeline | Notas |
|----------------|------------------------|-------|
| `src/lib/base-path.ts` | `src/lib/base-path.ts` | Cópia exata — lógica é idêntica |
| `src/lib/utils.ts` | `src/lib/utils.ts` | `cn()` helper universal |
| `src/components/ui/button.tsx` | `src/components/ui/button.tsx` | Gerado por shadcn; copiar |
| `src/components/ui/input.tsx` | `src/components/ui/input.tsx` | Idem |
| `src/components/ui/label.tsx` | `src/components/ui/label.tsx` | Idem |
| `src/app/fonts/*.woff2` (4 arquivos Inter) | `src/app/fonts/*.woff2` | 4 pesos: 400/500/600/700 |
| `vitest.config.ts` | `vitest.config.ts` | Copiar exato |
| `tsconfig.json` | `tsconfig.json` | Copiar exato |
| `src/__tests__/with-base-path.test.ts` | `src/__tests__/base-path.test.ts` | Adaptar nomes de IDs de teste |

### Portar com adaptações menores (renomear, trocar texto)

| Arquivo ai-pkm | Destino hiring-pipeline | Adaptações |
|----------------|------------------------|------------|
| `src/lib/auth.ts` | `src/lib/auth.ts` | Sem alterações de lógica |
| `src/lib/env.ts` | `src/lib/env.ts` | Substituir `PKM_PATH`/`INDEX_PATH` por `DATA_PATH`; remover validação de `INDEX_PATH` em produção |
| `src/lib/app-brand.ts` | `src/lib/app-brand.ts` | `appId: "hiring-pipeline"`, `appName: "Hiring Pipeline"` |
| `src/app/(auth)/login/page.tsx` | `src/app/(auth)/login/page.tsx` | Mudar subtítulo da tela |
| `src/components/login-form.tsx` | `src/components/login-form.tsx` | Mudar placeholder do username |
| `src/app/actions/auth.ts` | `src/app/actions/auth.ts` | Cópia exata |
| `src/app/api/auth/[...nextauth]/route.ts` | `src/app/api/auth/[...nextauth]/route.ts` | Cópia exata |
| `src/app/layout.tsx` | `src/app/layout.tsx` | Remover `excalifont`; manter Inter; remover `buildViewerThemeBootstrapScript` |
| `src/app/(shell)/layout.tsx` | `src/app/(shell)/layout.tsx` | Remover `getNavigationSnapshot`/`warmMarkdownPipeline`; simplificar |
| `src/app/(shell)/page.tsx` | `src/app/(shell)/page.tsx` | Placeholder customizado para Hiring Pipeline |
| `next.config.ts` | `next.config.ts` | Remover dependências PKM; copiar lógica base-path e git hash |
| `Dockerfile` | `Dockerfile` | Substituir PKM_PATH/INDEX_PATH por DATA_PATH; remover COPY models/index |
| `compose.yaml` | `compose.yaml` | Substituir volumes PKM por DATA_PATH único |
| `components.json` | `components.json` | Copiar exato (estilo `radix-nova`) |
| `src/app/globals.css` | `src/app/globals.css` | Copiar tokens + utilitários; remover viewer presets e `.prose` |

### Criar do zero (não existe no ai-pkm)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/data-service.ts` | Validar existência de `DATA_PATH` + criar subpastas automaticamente |
| `src/components/shell/left-rail.tsx` | Menu de seções simples (Perfis, Vagas) — sem NavigationTree |
| `.env.local.example` | Exemplo com todos os 6 env vars da Phase 1 |
| `DESIGN.md` | Cópia adaptada do ai-pkm/DESIGN.md (PKM → Hiring Pipeline) |
| `references/ui/screens/01-login/` | Referências de UI copiadas do ai-pkm |
| `.dockerignore` | Excluir `.git`, `node_modules`, `.next`, `.env*`, `data-local/` |

---

## Validation Architecture

> `nyquist_validation: true` — seção incluída.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` (copiar do ai-pkm) |
| Quick run command | `npm test` (`vitest run`) |
| Full suite command | `npm test` |
| Typecheck command | `npm run typecheck` (`tsc --noEmit`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| APP-01 | Credenciais validadas contra AUTH_USERNAME/AUTH_PASSWORD | unit | `npm test -- auth` | ❌ Wave 0 |
| APP-01 | Matcher do middleware cobre rotas protegidas e exclui assets | unit | `npm test -- auth` | ❌ Wave 0 |
| APP-01 | Login bem-sucedido cria sessão JWT (contract test) | unit | `npm test -- auth` | ❌ Wave 0 |
| APP-02 | `normalizeBasePath` normaliza corretamente `/hiring-pipeline` | unit | `npm test -- base-path` | ❌ Wave 0 |
| APP-02 | `withBasePath` compõe paths com prefixo correto | unit | `npm test -- base-path` | ❌ Wave 0 |
| APP-02 | `next.config.ts` usa APP_BASE_PATH como basePath | unit | `npm test -- next-config` | ❌ Wave 0 |
| APP-01 | Env vars ausentes: processo encerra com mensagem clara | unit | `npm test -- env` | ❌ Wave 0 |
| APP-01 | DATA_PATH inexistente: `validateDataPath()` lança erro | unit | `npm test -- data-service` | ❌ Wave 0 |
| APP-01 | `ensureSubdir` cria subpastas automaticamente | unit | `npm test -- data-service` | ❌ Wave 0 |
| - | Dockerfile tem output standalone + USER nextjs + EXPOSE 3000 | unit (file contract) | `npm test -- container` | ❌ Wave 0 |

**Testes manuais (não automatizáveis em < 30 segundos):**
- Docker build completa sem erros (requer Docker disponível)
- Login na UI com credenciais corretas redireciona para home
- Login com credenciais erradas exibe mensagem genérica
- Rail colapsa/expande corretamente
- Base path `/hiring-pipeline` retorna 200 em vez de 404

### Sampling Rate

- **Por commit:** `npm test`
- **Por wave merge:** `npm test && npm run typecheck`
- **Phase gate:** Suite completa green antes de `/gsd-verify-work`

### Wave 0 Gaps (arquivos a criar antes da implementação)

- [ ] `vitest.config.ts` — copiar do ai-pkm
- [ ] `src/__tests__/auth.test.ts` — adaptar de `ai-pkm/src/__tests__/auth.test.ts`
- [ ] `src/__tests__/base-path.test.ts` — adaptar de `ai-pkm/src/__tests__/with-base-path.test.ts`
- [ ] `src/__tests__/env.test.ts` — adaptar de `ai-pkm/src/__tests__/env.test.ts`
- [ ] `src/__tests__/data-service.test.ts` — novo (testar `validateDataPath` e `ensureSubdir`)
- [ ] `src/__tests__/next-config.test.ts` — adaptar de `ai-pkm/src/__tests__/next-config.test.ts`
- [ ] `src/__tests__/container-packaging.test.ts` — adaptar de `ai-pkm/src/__tests__/container-packaging.test.ts`

---

## Security Domain

> `security_enforcement` não definido em config.json → tratado como habilitado.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | next-auth v5 Credentials + JWT strategy |
| V3 Session Management | yes | next-auth JWT httpOnly cookie; `session: { strategy: "jwt" }` |
| V4 Access Control | yes | Layout guard em `(shell)/layout.tsx`: `auth()` antes de qualquer render |
| V5 Input Validation | yes | Zod 4 em `lib/env.ts`; `isValidCallback` em `LoginForm` contra open redirect |
| V6 Cryptography | parcial | `NEXTAUTH_SECRET` (mín. 32 chars) — next-auth assina/verifica JWT; sem criptografia custom |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via callbackUrl | Spoofing | `isValidCallback()` em LoginForm: rejeita `://`, aceita apenas paths com o fallback prefix |
| Timing attack em comparação de credenciais | Spoofing | Aceitável para single-user local (D-07); para exposição pública usar `crypto.timingSafeEqual()` |
| Session fixation | Elevation of Privilege | next-auth gera novo token JWT a cada login — protege por design |
| Data path traversal | Tampering | `DATA_PATH` validado como caminho absoluto no Zod schema; subpastas usam `path.join()` |
| Env vars expostos ao client | Information Disclosure | `lib/env.ts` nunca importado em Client Components; `NEXT_PUBLIC_*` apenas para versão/git hash |
| Container rodando como root | Elevation of Privilege | Dockerfile cria usuário `nextjs` (UID 1001) e usa `USER nextjs` |

**Nota sobre comparação de credenciais (D-21):** O padrão do ai-pkm usa comparação direta de strings — aceitável para ferramenta interna single-user sem exposição externa. O comentário de aviso já está presente no `lib/auth.ts`. Manter o aviso no código portado.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `LeftRail` do hiring-pipeline será um menu estático simples de seções (sem TreeFilterInput, InboxLane, NavigationTree) | Architecture Patterns, Pattern 5 | Se a Phase 2 precisar do padrão de árvore, o LeftRail precisaria ser reescrito — mas D-03 confirma que Phase 1 usa placeholder |
| A2 | `data-service.ts` com `validateDataPath()` + `ensureSubdir()` é o padrão correto para D-14/D-15 | Pattern 6, Code Examples | Implementação é nova — se a interface precisar de mais funcionalidade (ex: leitura/escrita de entidades), precisará de expansão |
| A3 | Docker está disponível no ambiente de produção/deploy, apesar de não detectado no shell atual | Environment Availability | Se Docker não estiver disponível, o critério de sucesso #4 da Phase 1 não pode ser validado |

**Se esta tabela indica risco A3:** O planner deve incluir uma task de validação de Docker separada, com instrução para o operador executar manualmente se Docker não estiver no PATH do ambiente de CI.

---

## Open Questions

1. **Docker disponível no ambiente de execução?**
   - O que sabemos: Docker não foi encontrado no shell de pesquisa.
   - O que é incerto: se Docker está instalado via Docker Desktop (daemon separado), via rootless Docker, ou se simplesmente não está instalado.
   - Recomendação: O planner deve criar task de verificação de Docker como pré-requisito para a task de build de imagem. Se `docker --version` falhar, a task de Docker deve ser marcada como "executar manualmente" com instruções.

2. **Volumes de dados em desenvolvimento**
   - O que sabemos: Em prod, `DATA_HOST_PATH` é um bind mount. Em dev, `DATA_PATH=./data-local` (D-13).
   - O que é incerto: se `.gitignore` do repo de dados deve incluir o diretório `data-local/` local, e se um arquivo `.env.local.example` deixa isso claro.
   - Recomendação: Incluir no `.gitignore` do hiring-pipeline `data-local/` e criar `.env.local.example` com `DATA_PATH=./data-local` como valor de dev.

---

## Sources

### Primary (HIGH confidence)
- `/home/henrico/github/henricos/ai-pkm/src/lib/auth.ts` — configuração next-auth Credentials completa [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/lib/base-path.ts` — utilitários de base path [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/lib/env.ts` — schema Zod 4 de env vars [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/app/(auth)/login/page.tsx` — página de login [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/components/login-form.tsx` — formulário com proteção open redirect [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/components/shell/app-shell.tsx` — shell colapsável [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/components/shell/left-rail.tsx` — left rail PKM (referência para simplificar) [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/next.config.ts` — configuração Next.js com base path [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/Dockerfile` — multi-stage Dockerfile [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/compose.yaml` — estrutura Compose [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/app/globals.css` — design tokens completos [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/package.json` — versões exatas de todas as deps [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/DESIGN.md` — especificação do design system [VERIFIED: leitura direta]
- npm registry: versões de `next`, `next-auth`, `react`, `zod`, `tailwindcss`, `shadcn`, `vitest`, `lucide-react` [VERIFIED: npm view]

### Secondary (MEDIUM confidence)
- `/home/henrico/github/henricos/ai-pkm/src/__tests__/auth.test.ts` — padrões de teste para auth [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/__tests__/container-packaging.test.ts` — contrato do Dockerfile [VERIFIED: leitura direta]
- `/home/henrico/github/henricos/ai-pkm/src/__tests__/with-base-path.test.ts` — testes de base path [VERIFIED: leitura direta]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versões verificadas via npm registry + package.json do ai-pkm
- Architecture: HIGH — padrões lidos diretamente do código de referência em produção
- Pitfalls: HIGH — derivados de comentários de código e padrões de segurança no código-fonte
- Data service: MEDIUM — módulo novo sem referência direta; baseado nos requisitos D-14/D-15

**Research date:** 2026-04-19
**Valid until:** 2026-05-19 (stack estável; next-auth v5 ainda em beta, verificar changelogs se passar de 30 dias)

---

## RESEARCH COMPLETE
