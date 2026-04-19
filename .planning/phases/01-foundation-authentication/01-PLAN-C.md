---
phase: 01-foundation-authentication
plan: C
type: execute
wave: 1
depends_on:
  - 01-PLAN-A
  - 01-PLAN-B
files_modified:
  - src/lib/env.ts
  - src/lib/auth.ts
  - src/app/actions/auth.ts
  - src/app/api/auth/[...nextauth]/route.ts
autonomous: true
requirements:
  - APP-01

must_haves:
  truths:
    - "npm test -- auth passa GREEN: credenciais corretas autenticam, incorretas rejeitam"
    - "npm test -- env passa GREEN: env vars ausentes encerram o processo com mensagem em pt-BR"
    - "Aplicação encerra com processo.exit(1) e mensagem clara se AUTH_USERNAME ausente"
    - "next-auth usa strategy JWT e trustHost: true"
    - "Server Action authenticate() usa withBasePath no redirectTo"
  artifacts:
    - path: "src/lib/env.ts"
      provides: "Validação Zod 4 de todas as 6 env vars da Phase 1"
      exports: ["env"]
      contains: "DATA_PATH"
    - path: "src/lib/auth.ts"
      provides: "next-auth config com Credentials provider + JWT + trustHost"
      exports: ["handlers", "auth", "signIn", "signOut"]
      contains: "strategy: \"jwt\""
    - path: "src/app/actions/auth.ts"
      provides: "Server Action authenticate() com proteção open redirect"
      exports: ["authenticate"]
      contains: "withBasePath"
    - path: "src/app/api/auth/[...nextauth]/route.ts"
      provides: "Handlers GET e POST do next-auth"
      exports: ["GET", "POST"]
  key_links:
    - from: "src/lib/auth.ts"
      to: "src/lib/env.ts"
      via: "import { env }"
      pattern: "env.AUTH_USERNAME.*env.AUTH_PASSWORD"
    - from: "src/app/actions/auth.ts"
      to: "src/lib/base-path.ts"
      via: "import { withBasePath }"
      pattern: "withBasePath.*callbackUrl"
    - from: "src/app/api/auth/[...nextauth]/route.ts"
      to: "src/lib/auth.ts"
      via: "import { handlers }"
      pattern: "export const \\{ GET, POST \\} = handlers"
---

<objective>
Implementar a camada de autenticação completa: validação de env vars (env.ts com Zod 4), configuração next-auth (auth.ts), server action de login (actions/auth.ts) e route handler do next-auth.

Purpose: Satisfazer APP-01 — aplicação protegida por autenticação single-user via next-auth com credenciais em variáveis de ambiente. Esta é a camada mais crítica de segurança da Phase 1.

Output: 4 arquivos que juntos implementam o ciclo completo: env vars validados → next-auth configurado → login processado via server action → JWT criado.
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
<!-- Contratos que este plano consome (de PLAN-B) e cria (para PLAN-E) -->

De PLAN-B (já criado):
```typescript
// src/lib/base-path.ts
export function withBasePath(pathname: string, basePath?: string): string
```

Criados neste plano (consumidos por PLAN-E — shell layout):
```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut }: ReturnType<typeof NextAuth>

// src/lib/env.ts
export const env: {
  DATA_PATH: string;         // caminho absoluto
  APP_ROOT_PATH?: string;    // opcional
  APP_BASE_PATH: string;
  AUTH_USERNAME: string;
  AUTH_PASSWORD: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

// src/app/actions/auth.ts
export async function authenticate(
  _prevState: string | null,
  formData: FormData
): Promise<string | null>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Tarefa C-1: Implementar env.ts (Zod 4) e auth.ts (next-auth Credentials)</name>
  <files>
    src/lib/env.ts,
    src/lib/auth.ts
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/src/lib/env.ts (analog completo — adaptar DATA_PATH)
    - /home/henrico/github/henricos/ai-pkm/src/lib/auth.ts (copiar exato)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções env.ts e auth.ts — conteúdo completo)
    - src/__tests__/env.test.ts (testes que devem ficar GREEN)
    - src/__tests__/auth.test.ts (testes que devem ficar GREEN)
  </read_first>
  <behavior>
    - Test ENV-01: env com todos os campos válidos → parseEnv() retorna objeto tipado sem lançar
    - Test ENV-02: DATA_PATH ausente → process.exit(1) com mensagem contendo "DATA_PATH"
    - Test ENV-03: NEXTAUTH_URL com pathname divergente de APP_BASE_PATH → process.exit(1) com mensagem sugerindo o formato correto
    - Test RUN-01: process.exit chamado com código 1 (não 0) em qualquer falha de validação
    - Test ACC-01: credenciais corretas → authorize() retorna { id: "1", name: username }
    - Test ACC-02: credenciais erradas → authorize() retorna null
    - Test ACC-03: matcher de rotas protege rotas comuns e exclui /login e assets (_next, favicon.ico)
  </behavior>
  <action>
**`src/lib/env.ts`**
Portar do analog ai-pkm com adaptações conforme PATTERNS.md (conteúdo completo na seção env.ts):

1. Manter imports: `path from "path"`, `{ z } from "zod"`, `{ normalizeBasePath } from "./base-path"`
2. Schema Zod 4 — campos obrigatórios:
   - `DATA_PATH`: `z.string({ error: (iss) => (iss.input === undefined ? "DATA_PATH é obrigatório" : undefined) }).min(1, ...).refine(path.isAbsolute, "DATA_PATH deve ser um caminho absoluto")`
   - `APP_ROOT_PATH`: opcional, mesmo padrão do ai-pkm
   - `APP_BASE_PATH`: obrigatório com error function
   - `AUTH_USERNAME`: obrigatório com error function
   - `AUTH_PASSWORD`: min(8, ...) com error function
   - `NEXTAUTH_SECRET`: min(32, ...) com error function
   - `NEXTAUTH_URL`: `.url(...)` com error function
3. superRefine: manter validação cruzada NEXTAUTH_URL.pathname === APP_BASE_PATH (copiar integralmente do analog)
   REMOVER: bloco de validação INDEX_PATH (PKM-específico)
4. parseEnv() e `export const env = parseEnv()`: copiar exato do analog

LANDMINE CRÍTICO: Zod 4 usa `error: (iss) => ...` (função), NÃO `required_error:` do Zod 3. Copiar o padrão exato do PATTERNS.md para cada campo.

**`src/lib/auth.ts`**
Copiar exato do analog (conteúdo completo em PATTERNS.md seção auth.ts). Zero alterações. O arquivo tem:
- `import NextAuth from "next-auth"`
- `import Credentials from "next-auth/providers/credentials"`
- `import { env } from "@/lib/env"`
- `trustHost: true` (obrigatório para container/proxy)
- `strategy: "jwt"` na session
- `pages: { signIn: "/login" }`
- Comparação direta de string: `username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD`
- Comentário de aviso de segurança (manter do analog)
  </action>
  <verify>
    <automated>npm test -- env && npm test -- auth</automated>
  </verify>
  <acceptance_criteria>
    - `npm test -- env` reporta todos os testes GREEN (ENV-01, ENV-02, ENV-03, RUN-01)
    - `npm test -- auth` reporta todos os testes GREEN (ACC-01, ACC-02, ACC-03)
    - src/lib/env.ts contém `DATA_PATH` (não `PKM_PATH` ou `INDEX_PATH`)
    - src/lib/env.ts contém `process.exit(1)` na função parseEnv
    - src/lib/auth.ts contém `trustHost: true`
    - src/lib/auth.ts contém `strategy: "jwt"`
    - src/lib/auth.ts contém `pages: { signIn: "/login" }`
    - src/lib/auth.ts NÃO contém `PKM_PATH` nem `INDEX_PATH`
  </acceptance_criteria>
  <done>env.ts e auth.ts implementados com todos os testes passando GREEN</done>
</task>

<task type="auto">
  <name>Tarefa C-2: Implementar actions/auth.ts e route handler do next-auth</name>
  <files>
    src/app/actions/auth.ts,
    src/app/api/auth/[...nextauth]/route.ts
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/src/app/actions/auth.ts (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/src/app/api/auth/[...nextauth]/route.ts (copiar exato)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções actions/auth.ts e route.ts)
    - src/lib/base-path.ts (verificar que withBasePath está exportado — criado em PLAN-B)
  </read_first>
  <action>
**`src/app/actions/auth.ts`**
Copiar exato do analog. O arquivo é uma Server Action ("use server") que:
1. Importa `signIn` de `@/lib/auth` e `AuthError` de `next-auth`
2. Importa `withBasePath` de `@/lib/base-path`
3. Função `authenticate(_prevState: string | null, formData: FormData): Promise<string | null>`
4. Lê `callbackUrl` do formData (default "/")
5. Chama `signIn("credentials", { username, password, redirectTo: withBasePath(callbackUrl) })`
6. Captura `AuthError` e retorna `"Credenciais inválidas. Verifique usuário e senha."`
7. Relança qualquer outro erro (não captura erros de rede, etc.)

PITFALL CRÍTICO: `withBasePath(callbackUrl)` é obrigatório no redirectTo. Sem isso, o login bem-sucedido resulta em 404 porque o next-auth redireciona para a raiz sem o base path.

**`src/app/api/auth/[...nextauth]/route.ts`**
Copiar exato do analog. São apenas 2 linhas:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

Criar o diretório `src/app/api/auth/[...nextauth]/` antes de criar o arquivo.
  </action>
  <verify>
    <automated>grep "withBasePath" src/app/actions/auth.ts && grep "redirectTo" src/app/actions/auth.ts && grep "AuthError" src/app/actions/auth.ts && grep "use server" src/app/actions/auth.ts && grep "export const { GET, POST } = handlers" src/app/api/auth/\[...nextauth\]/route.ts</automated>
  </verify>
  <acceptance_criteria>
    - src/app/actions/auth.ts contém `"use server"` na primeira linha
    - src/app/actions/auth.ts contém `withBasePath(callbackUrl)` no redirectTo
    - src/app/actions/auth.ts captura `AuthError` e retorna mensagem em pt-BR
    - src/app/actions/auth.ts relança erros que NÃO são AuthError (throw error no catch)
    - src/app/api/auth/[...nextauth]/route.ts contém `export const { GET, POST } = handlers`
    - src/app/api/auth/[...nextauth]/route.ts tem apenas 2 linhas (import + export)
  </acceptance_criteria>
  <done>Server action e route handler implementados — ciclo completo de autenticação funcional</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| FormData → Server Action | Campos username e password chegam do cliente — tratados como entrada não confiável |
| callbackUrl → redirectTo | Parâmetro de redirect pode ser manipulado para open redirect |
| process.env → env.ts | Env vars lidas no startup — validadas com Zod antes de qualquer uso |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-01 | Spoofing | src/lib/auth.ts authorize() | accept | Comparação direta de string é aceitável para single-user local interno (D-21). Comentário de aviso presente no código para exposição pública. Mitigação futura: crypto.timingSafeEqual() |
| T-1-02 | Spoofing | src/app/actions/auth.ts callbackUrl | mitigate | isValidCallback() em LoginForm (PLAN-E) rejeita URLs absolutas com "://". Server action não processa o callbackUrl — recebe o valor já sanitizado do form |
| T-1-03 | Elevation of Privilege | next-auth session fixation | accept | next-auth v5 gera novo JWT a cada login por design — protege contra session fixation automaticamente |
| T-1-05 | Information Disclosure | src/lib/env.ts | mitigate | env.ts nunca importado em Client Components (linting deve barrar); NEXT_PUBLIC_ vars são apenas versão e git hash (sem secrets) |
| T-1-09 | Spoofing | AUTH_PASSWORD min(8) | mitigate | Zod schema impõe mínimo de 8 chars; NEXTAUTH_SECRET mínimo de 32 chars — previne secrets triviais |
</threat_model>

<verification>
```bash
# Testes unitários de auth e env (devem ser GREEN após esta Wave)
npm test -- auth
npm test -- env

# Verificação de tipos
npm run typecheck 2>&1 | grep -v "TS2307" | head -20
# (TS2307 = módulo não encontrado — aceitável se next-auth não estiver configurado ainda)
```

Resultado esperado: todos os testes de auth e env GREEN. typecheck pode ter warnings de shadcn/ui não instalado ainda.
</verification>

<success_criteria>
- npm test -- auth: GREEN (ACC-01, ACC-02, ACC-03)
- npm test -- env: GREEN (ENV-01, ENV-02, ENV-03, RUN-01)
- env.ts usa Zod 4 com error functions (não required_error)
- auth.ts tem trustHost: true e strategy: "jwt"
- actions/auth.ts usa withBasePath no redirectTo
- route.ts tem apenas 2 linhas
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/01-foundation-authentication/01-C-SUMMARY.md` com:
- Resultado de npm test -- auth e npm test -- env
- Desvios do analog ai-pkm documentados
- Status da validação Zod 4 (confirmar que error functions estão corretas)
</output>
