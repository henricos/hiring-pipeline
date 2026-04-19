---
phase: 01-foundation-authentication
plan: E
type: execute
wave: 2
depends_on:
  - 01-PLAN-B
  - 01-PLAN-C
  - 01-PLAN-D
files_modified:
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/components/shell/app-shell.tsx
  - src/components/shell/left-rail.tsx
  - src/components/login-form.tsx
  - src/app/(auth)/login/page.tsx
  - src/app/(shell)/layout.tsx
  - src/app/(shell)/page.tsx
autonomous: true
requirements:
  - APP-01
  - APP-02

must_haves:
  truths:
    - "Rota /login renderiza card centralizado com appName 'Hiring Pipeline' e subtítulo 'Acesso restrito ao gestor da área.'"
    - "Rota protegida sem sessão redireciona para /login"
    - "Login com credenciais corretas redireciona para /"
    - "Login com credenciais erradas exibe mensagem genérica sem revelar qual campo está errado (D-07)"
    - "LeftRail alterna entre expandido (label + ícone) e recolhido (só ícones) (D-01)"
    - "Rail em bg-surface-container-low, workspace em bg-surface-container-lowest (D-02)"
    - "Footer do login exibe versão e git hash (D-08)"
  artifacts:
    - path: "src/app/(auth)/login/page.tsx"
      provides: "Página de login RSC com card centralizado, footer versão, proteção de session"
      contains: "Acesso restrito ao gestor da área"
    - path: "src/app/(shell)/layout.tsx"
      provides: "Shell layout RSC com auth guard: auth() → redirect /login se sem sessão"
      contains: "redirect(\"/login\")"
    - path: "src/components/shell/app-shell.tsx"
      provides: "AppShell Client Component com toggle rail e superfícies tonais"
      contains: "railOpen"
    - path: "src/components/shell/left-rail.tsx"
      provides: "Menu estático de seções (Perfis, Vagas) com itens disabled"
      contains: "disabled"
    - path: "src/components/login-form.tsx"
      provides: "LoginForm Client Component com proteção open redirect e useActionState"
      contains: "isValidCallback"
  key_links:
    - from: "src/app/(shell)/layout.tsx"
      to: "src/lib/auth.ts"
      via: "import { auth } → auth() server-side"
      pattern: "auth().*redirect.*login"
    - from: "src/components/login-form.tsx"
      to: "src/app/actions/auth.ts"
      via: "import { authenticate } → useActionState"
      pattern: "useActionState.*authenticate"
    - from: "src/components/shell/app-shell.tsx"
      to: "src/components/shell/left-rail.tsx"
      via: "import LeftRail → renderizado dentro do aside"
      pattern: "<LeftRail"
---

<objective>
Implementar a camada de UI completa: componentes shadcn/ui, shell colapsável (AppShell + LeftRail), tela de login (LoginPage + LoginForm) e layout autenticado (ShellLayout com auth guard).

Purpose: Completar os critérios de sucesso visuais e interativos da Phase 1. Após esta Wave, a aplicação tem UI funcional: login exige autenticação, shell colapsa/expande, placeholder home está acessível após login.

Output: Aplicação Next.js navegável com login funcional, shell colapsável e proteção de rotas via layout guard.
</objective>

<execution_context>
@/home/henrico/.claude/get-shit-done/workflows/execute-plan.md
@/home/henrico/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-authentication/01-CONTEXT.md
@.planning/phases/01-foundation-authentication/01-RESEARCH.md
@.planning/phases/01-foundation-authentication/01-PATTERNS.md

<interfaces>
<!-- Contratos consumidos de planos anteriores -->

De PLAN-B (já criado):
```typescript
// src/lib/app-brand.ts
export const appBrand: { appId: "hiring-pipeline"; appName: "Hiring Pipeline"; appDescription: string }

// src/lib/utils.ts
export function cn(...inputs: ClassValue[]): string
```

De PLAN-C (já criado):
```typescript
// src/lib/auth.ts
export const { auth, signIn, signOut }: ...
// auth() — server-side, retorna Session | null

// src/app/actions/auth.ts
export async function authenticate(_prevState: string | null, formData: FormData): Promise<string | null>
```

Componentes shadcn/ui a instalar via CLI:
- button, input, label
Ou copiar diretamente de /home/henrico/github/henricos/ai-pkm/src/components/ui/
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Tarefa E-1: Instalar componentes shadcn/ui e criar AppShell + LeftRail</name>
  <files>
    src/components/ui/button.tsx,
    src/components/ui/input.tsx,
    src/components/ui/label.tsx,
    src/components/shell/app-shell.tsx,
    src/components/shell/left-rail.tsx
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/src/components/ui/button.tsx (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/src/components/ui/input.tsx (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/src/components/ui/label.tsx (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/src/components/shell/app-shell.tsx (portar com simplificação)
    - /home/henrico/github/henricos/ai-pkm/src/components/shell/left-rail.tsx (NÃO copiar — criar novo)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções app-shell.tsx e left-rail.tsx — conteúdo completo)
  </read_first>
  <action>
**Componentes shadcn/ui**
Copiar os 3 arquivos de componentes UI diretamente do ai-pkm (são gerados por shadcn CLI, sem alterações):
```bash
mkdir -p src/components/ui
cp /home/henrico/github/henricos/ai-pkm/src/components/ui/button.tsx src/components/ui/
cp /home/henrico/github/henricos/ai-pkm/src/components/ui/input.tsx src/components/ui/
cp /home/henrico/github/henricos/ai-pkm/src/components/ui/label.tsx src/components/ui/
```

**`src/components/shell/app-shell.tsx`**
Portar do analog com simplificação de props (conteúdo completo em PATTERNS.md seção app-shell.tsx):

Interface simplificada:
```typescript
interface AppShellProps {
  children: React.ReactNode;
  // REMOVER: snapshot: NavigationSnapshot (PKM-específico)
}
```

Implementar com:
- `"use client"` na primeira linha
- Estado `railOpen` e `workspacePending` com useState
- `toggleRail` com useCallback
- `handleNavigationStart` que seta workspacePending=true
- useEffect que seta workspacePending=false quando pathname muda
- Aside com classes: `bg-surface-container-low`, `w-72` (aberto) ou `w-12` (fechado), `transition-all duration-200`
- Main com `bg-surface-container-lowest`
- LeftRail renderizado apenas quando `railOpen` é true
- Toggle button com SVG de setas (conteúdo exato em PATTERNS.md)
- Loading bar condicional com classe `.workspace-loading-bar`
- Atributos ARIA: `aria-label`, `aria-expanded`, `aria-controls`, `data-testid="navigation-rail"`

**`src/components/shell/left-rail.tsx`**
Criar do zero — NÃO copiar do analog ai-pkm (que tem TreeFilterInput, InboxLane, NavigationTree PKM-específicos).

Implementar conforme PATTERNS.md seção left-rail.tsx (conteúdo completo disponível):
- `"use client"` na primeira linha
- NAV_ITEMS array com: `{ label: "Perfis", href: "/profiles", icon: Users, disabled: true }` e `{ label: "Vagas", href: "/vacancies", icon: Briefcase, disabled: true }`
- Items disabled renderizados como `<span>` (não `<Link>`) com `cursor-not-allowed` e `text-on-surface/30`
- Items ativos: `<Link>` com `cn(...)` para estado ativo/hover
- `interface LeftRailProps { onNavigationStart?: () => void }`
- Imports: `Link from "next/link"`, `usePathname from "next/navigation"`, `{ Users, Briefcase } from "lucide-react"`, `{ cn } from "@/lib/utils"`
  </action>
  <verify>
    <automated>ls src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/label.tsx && grep "railOpen" src/components/shell/app-shell.tsx && grep "bg-surface-container-low" src/components/shell/app-shell.tsx && grep "disabled" src/components/shell/left-rail.tsx && grep "Users.*Briefcase\|Briefcase.*Users" src/components/shell/left-rail.tsx && grep "use client" src/components/shell/app-shell.tsx && grep "use client" src/components/shell/left-rail.tsx</automated>
  </verify>
  <acceptance_criteria>
    - src/components/ui/button.tsx, input.tsx, label.tsx existem
    - src/components/shell/app-shell.tsx contém `"use client"`
    - src/components/shell/app-shell.tsx contém `railOpen` e `workspacePending` como estados
    - src/components/shell/app-shell.tsx contém `bg-surface-container-low` no aside
    - src/components/shell/app-shell.tsx contém `bg-surface-container-lowest` no main
    - src/components/shell/app-shell.tsx contém `data-testid="navigation-rail"`
    - src/components/shell/app-shell.tsx NÃO contém `NavigationSnapshot` nem `snapshot`
    - src/components/shell/left-rail.tsx contém `"use client"`
    - src/components/shell/left-rail.tsx contém `disabled: true` nos NAV_ITEMS
    - src/components/shell/left-rail.tsx contém `Users` e `Briefcase` de lucide-react
    - src/components/shell/left-rail.tsx itens disabled usam `<span>` não `<Link>`
  </acceptance_criteria>
  <done>shadcn/ui components copiados + AppShell simplificado + LeftRail novo criados</done>
</task>

<task type="auto">
  <name>Tarefa E-2: Criar LoginPage, LoginForm, ShellLayout e página placeholder home</name>
  <files>
    src/components/login-form.tsx,
    src/app/(auth)/login/page.tsx,
    src/app/(shell)/layout.tsx,
    src/app/(shell)/page.tsx
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/src/components/login-form.tsx (portar — mudar placeholder username)
    - /home/henrico/github/henricos/ai-pkm/src/app/(auth)/login/page.tsx (portar — mudar subtítulo)
    - /home/henrico/github/henricos/ai-pkm/src/app/(shell)/layout.tsx (adaptar — remover snapshot)
    - /home/henrico/github/henricos/ai-pkm/src/app/(shell)/page.tsx (referência estrutural)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções completas de cada arquivo)
  </read_first>
  <action>
**`src/components/login-form.tsx`**
Portar do analog com uma única adaptação (conteúdo completo em PATTERNS.md seção login-form.tsx):
- `"use client"` na primeira linha
- `isValidCallback(url, baseFallback)`: rejeita URLs com "://" (open redirect), aceita apenas paths com o fallbackUrl prefix
- `useSearchParams()` para ler `callbackUrl` da query string
- `useActionState(authenticate, null)` para estado do form
- Campo username: `placeholder="gestor"` (era "curator_id" no ai-pkm — D-07 discretion)
- Campo password: `placeholder="••••••••"`
- Hidden input `callbackUrl` com valor sanitizado
- Botão "Entrar" com `gradient-cta text-on-tertiary` e estado de loading ("Aguarde...")
- Mensagem de erro genérica (D-07): renderiza `{error}` sem especificar qual campo está errado

**`src/app/(auth)/login/page.tsx`**
Portar com adaptação de subtítulo (conteúdo completo em PATTERNS.md seção login/page.tsx):
- Server Component (sem "use client")
- Lê `NEXT_PUBLIC_APP_VERSION` e `NEXT_PUBLIC_GIT_HASH` de process.env
- `auth()` → se sessão existe, `redirect("/")`  (D-06)
- Layout: `min-h-screen bg-surface flex items-center justify-center`
- Card: `bg-surface-container-lowest p-8 rounded-sm shadow-ambient` com `max-w-[400px]`
- Símbolo ◈ em `text-tertiary font-mono` (D-05 — manter do ai-pkm)
- `{appBrand.appName}` como nome (resulta em "Hiring Pipeline" — D-04)
- Título: "Acesso ao Sistema"
- Subtítulo: "Acesso restrito ao gestor da área." (D-05 — único texto alterado vs ai-pkm)
- `<Suspense>` envolvendo `<LoginForm fallbackUrl="/" />`
- Footer com versão + git hash em `text-on-surface/30 text-[0.6875rem]` (D-08)

**`src/app/(shell)/layout.tsx`**
Portar com simplificação (conteúdo em PATTERNS.md seção shell/layout.tsx):
- Server Component (sem "use client")
- `import { redirect } from "next/navigation"`
- `import { auth } from "@/lib/auth"`
- `import { AppShell } from "@/components/shell/app-shell"`
- `const session = await auth()` → `if (!session) { redirect("/login") }`
- `return <AppShell>{children}</AppShell>` (sem props snapshot — D-03)
- REMOVER: getNavigationSnapshot, warmMarkdownPipeline (PKM-específicos)

**`src/app/(shell)/page.tsx`**
Criar placeholder simples (conteúdo em PATTERNS.md seção shell/page.tsx):
- Server Component (sem "use client")
- Empty state com símbolo ◈, título "Hiring Pipeline", descrição das fases futuras
- Usar tokens de design: `text-tertiary`, `text-on-surface`, `text-on-surface/50`
- D-06: Phase 2 substituirá este conteúdo — comentário no código
  </action>
  <verify>
    <automated>grep "Acesso restrito ao gestor da área" src/app/\(auth\)/login/page.tsx && grep "isValidCallback" src/components/login-form.tsx && grep "gestor" src/components/login-form.tsx && grep "redirect.*login" src/app/\(shell\)/layout.tsx && grep "auth()" src/app/\(shell\)/layout.tsx && grep "AppShell" src/app/\(shell\)/layout.tsx && grep "Suspense" src/app/\(auth\)/login/page.tsx</automated>
  </verify>
  <acceptance_criteria>
    - src/app/(auth)/login/page.tsx contém `"Acesso restrito ao gestor da área."`
    - src/app/(auth)/login/page.tsx contém `appBrand.appName` (não string hardcoded "Hiring Pipeline")
    - src/app/(auth)/login/page.tsx contém `<Suspense>` envolvendo LoginForm
    - src/app/(auth)/login/page.tsx contém `NEXT_PUBLIC_GIT_HASH` (D-08 — footer com git hash)
    - src/components/login-form.tsx contém `isValidCallback` com verificação de `"://"`
    - src/components/login-form.tsx contém `placeholder="gestor"` (não "curator_id")
    - src/components/login-form.tsx contém `useActionState(authenticate, null)`
    - src/app/(shell)/layout.tsx contém `redirect("/login")` quando sem sessão
    - src/app/(shell)/layout.tsx NÃO contém `getNavigationSnapshot` nem `snapshot`
    - src/app/(shell)/layout.tsx NÃO contém `warmMarkdownPipeline`
    - src/app/(shell)/layout.tsx retorna `<AppShell>{children}</AppShell>` (sem props extras)
    - src/app/(shell)/page.tsx existe com conteúdo placeholder
  </acceptance_criteria>
  <done>LoginPage, LoginForm, ShellLayout e página placeholder implementados</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → LoginForm | callbackUrl vem da query string — pode ser manipulado pelo usuário |
| LoginForm → Server Action | FormData enviado do cliente via form action |
| Request → ShellLayout | Qualquer request a rota (shell) passa pelo auth guard |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-01 | Spoofing | src/components/login-form.tsx callbackUrl | mitigate | `isValidCallback()` rejeita URLs com "://" — previne open redirect. Aceita apenas paths com o fallbackUrl como prefix. Copiado exato do ai-pkm validado em produção |
| T-1-06 | Information Disclosure | Login error message | mitigate | Mensagem genérica "Credenciais inválidas. Verifique usuário e senha." — não revela qual campo está errado (D-07). Mesmo padrão do ai-pkm |
| T-1-03 | Elevation of Privilege | src/app/(shell)/layout.tsx auth guard | mitigate | `auth()` server-side antes de qualquer render — sem sessão → redirect imediato para /login. Dupla proteção: layout guard + next-auth session |
| T-1-07 | Information Disclosure | Login page footer git hash | accept | NEXT_PUBLIC_GIT_HASH é informação de desenvolvimento — aceitável para ferramenta interna. Idêntico ao padrão ai-pkm |
</threat_model>

<verification>
```bash
# Typecheck completo
npm run typecheck

# Iniciar dev server e verificar manualmente:
npm run dev
# 1. Acessar http://localhost:3000/hiring-pipeline → deve redirecionar para /login
# 2. Login com credenciais erradas → mensagem genérica sem revelar campo
# 3. Login com credenciais corretas → redireciona para /
# 4. Toggle do rail → colapsa/expande (só ícones vs ícone + label)
```

Resultado esperado: typecheck sem erros. UI navegável com todos os comportamentos do CONTEXT.md.
</verification>

<success_criteria>
- Login page exibe "Hiring Pipeline" e subtítulo "Acesso restrito ao gestor da área."
- Login page exibe footer com versão e git hash (D-08)
- LoginForm tem proteção open redirect via isValidCallback (D-05, D-07)
- ShellLayout redireciona para /login sem sessão (D-22)
- AppShell alterna entre railOpen e fechado com superfícies tonais corretas (D-01, D-02)
- LeftRail tem itens Perfis e Vagas desabilitados (disabled: true)
- npm run typecheck sem erros
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/01-foundation-authentication/01-E-SUMMARY.md` com:
- Resultado de npm run typecheck
- Confirmação dos comportamentos visuais (login, shell, redirect)
- Desvios do analog ai-pkm documentados
</output>
