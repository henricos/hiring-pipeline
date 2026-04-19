---
phase: 01-foundation-authentication
plan: B
type: execute
wave: 1
depends_on:
  - 01-PLAN-A
files_modified:
  - package.json
  - tsconfig.json
  - components.json
  - postcss.config.mjs
  - next.config.ts
  - src/app/globals.css
  - src/app/fonts/inter-latin-400-normal.woff2
  - src/app/fonts/inter-latin-500-normal.woff2
  - src/app/fonts/inter-latin-600-normal.woff2
  - src/app/fonts/inter-latin-700-normal.woff2
  - src/app/layout.tsx
  - src/lib/utils.ts
  - src/lib/app-brand.ts
  - src/lib/base-path.ts
autonomous: true
requirements:
  - APP-01
  - APP-02

must_haves:
  truths:
    - "npm install executa sem erros e node_modules existe"
    - "npm run typecheck passa sem erros de tipo"
    - "npm test -- base-path passa (GREEN após implementar base-path.ts)"
    - "Inter carrega via localFont de arquivos .woff2 locais (sem dependência de Google Fonts)"
    - "Base path configurável via APP_BASE_PATH lido em next.config.ts"
  artifacts:
    - path: "package.json"
      provides: "Dependências do projeto com versões exatas do ai-pkm"
      contains: "next-auth"
    - path: "next.config.ts"
      provides: "Configuração Next.js com basePath configurável e output standalone"
      contains: "output: \"standalone\""
    - path: "src/lib/base-path.ts"
      provides: "normalizeBasePath, withBasePath, getConfiguredBasePath"
      exports: ["normalizeBasePath", "withBasePath", "getConfiguredBasePath"]
    - path: "src/app/globals.css"
      provides: "Design tokens Tailwind 4 via @theme{}"
      contains: "--color-tertiary: #0055d7"
    - path: "src/lib/app-brand.ts"
      provides: "appBrand com appId=hiring-pipeline, appName=Hiring Pipeline"
      contains: "hiring-pipeline"
  key_links:
    - from: "next.config.ts"
      to: "src/lib/base-path.ts"
      via: "import normalizeBasePath"
      pattern: "normalizeBasePath.*APP_BASE_PATH"
    - from: "src/app/layout.tsx"
      to: "src/app/fonts/"
      via: "localFont src array"
      pattern: "inter-latin-.*-normal.woff2"
---

<objective>
Criar o scaffolding completo do projeto: package.json com dependências, configuração TypeScript, Next.js, Tailwind 4, shadcn/ui, design system (globals.css), fontes Inter locais, e os utilitários lib/ fundamentais (base-path, utils, app-brand).

Purpose: Estabelecer a base sobre a qual auth (PLAN-C), data service (PLAN-D) e UI (PLAN-E/F) serão construídos. Todos os arquivos desta Wave 1 são pre-requisitos para os demais planos.

Output: Projeto Next.js instalável com npm install, com design system funcional e utilitários core implementados.
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
<!-- Interfaces e contratos criados neste plano que PLAN-C, D, E, F consumirão -->

src/lib/base-path.ts (copiar exato do PATTERNS.md):
```typescript
export function normalizeBasePath(input: string): string
export function getConfiguredBasePath(rawBasePath?: string): string
export function withBasePath(pathname: string, basePath?: string): string
```

src/lib/utils.ts:
```typescript
export function cn(...inputs: ClassValue[]): string
```

src/lib/app-brand.ts:
```typescript
export const appBrand: {
  readonly appId: "hiring-pipeline";
  readonly appName: "Hiring Pipeline";
  readonly appDescription: "Plataforma de gestão do processo seletivo assistida por IA.";
}
```

next.config.ts exporta: NextConfig com basePath = normalizeBasePath(APP_BASE_PATH), output = "standalone"
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Tarefa B-1: Criar package.json, tsconfig.json, components.json e postcss.config.mjs</name>
  <files>
    package.json,
    tsconfig.json,
    components.json,
    postcss.config.mjs
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/package.json (analog — remover deps PKM-específicas)
    - /home/henrico/github/henricos/ai-pkm/tsconfig.json (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/components.json (copiar exato)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções package.json, tsconfig.json, components.json)
  </read_first>
  <action>
Criar os 4 arquivos de configuração base.

**`package.json`**
Criar baseado no PATTERNS.md (seção package.json). Remover as dependências PKM-específicas do ai-pkm:
- REMOVER: `@radix-ui/react-collapsible`, `@radix-ui/react-scroll-area`, `@radix-ui/react-tooltip`
- REMOVER: `@shikijs/rehype`, `shiki`, `fuse.js`, `gray-matter`
- REMOVER: `react-markdown`, `rehype-katex`, `remark-gfm`, `remark-math`
- MANTER: todas as deps listadas no PATTERNS.md seção package.json

Conteúdo scripts obrigatório:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc --noEmit"
}
```

Versões exatas a usar (do RESEARCH.md Standard Stack):
- next: `^16.2.4`, react/react-dom: `19.2.4`, next-auth: `5.0.0-beta.30`
- zod: `4.3.6`, tailwindcss: `4.2.2`, vitest: `3.2.4`
- lucide-react: `^1.8.0`, clsx: `^2.1.1`, tailwind-merge: `^3.5.0`
- class-variance-authority: `^0.7.1`, tw-animate-css: `^1.4.0`

**`tsconfig.json`**
Copiar exato do analog (conteúdo completo em PATTERNS.md seção tsconfig.json). Zero alterações.

**`components.json`**
Copiar exato do analog (conteúdo completo em PATTERNS.md seção components.json). Zero alterações. Inclui `"style": "radix-nova"`, `"iconLibrary": "lucide"`, `"css": "src/app/globals.css"`.

**`postcss.config.mjs`**
Criar o arquivo de configuração PostCSS para Tailwind 4 (não existe como template no PATTERNS.md mas é obrigatório):
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```
  </action>
  <verify>
    <automated>grep '"name": "hiring-pipeline"' package.json && grep '"next": "\^16' package.json && grep '"next-auth": "5.0.0-beta.30"' package.json && grep '"vitest run"' package.json && grep '"typecheck"' package.json && grep '"radix-nova"' components.json && grep '"@tailwindcss/postcss"' postcss.config.mjs</automated>
  </verify>
  <acceptance_criteria>
    - package.json contém `"name": "hiring-pipeline"`
    - package.json contém `"next": "^16.2.4"` (ou versão compatível do RESEARCH.md)
    - package.json contém `"next-auth": "5.0.0-beta.30"`
    - package.json contém `"vitest run"` no script test
    - package.json contém script `"typecheck": "tsc --noEmit"`
    - package.json NÃO contém `shiki`, `gray-matter`, `react-markdown`, `fuse.js`
    - tsconfig.json contém `"paths": { "@/*": ["./src/*"] }`
    - components.json contém `"style": "radix-nova"`
    - postcss.config.mjs contém `"@tailwindcss/postcss"`
  </acceptance_criteria>
  <done>4 arquivos de configuração base criados com versões exatas e sem deps PKM-específicas</done>
</task>

<task type="auto">
  <name>Tarefa B-2: Criar next.config.ts, globals.css, fontes Inter e lib/ utilitários</name>
  <files>
    next.config.ts,
    src/app/globals.css,
    src/app/fonts/inter-latin-400-normal.woff2,
    src/app/fonts/inter-latin-500-normal.woff2,
    src/app/fonts/inter-latin-600-normal.woff2,
    src/app/fonts/inter-latin-700-normal.woff2,
    src/app/layout.tsx,
    src/lib/utils.ts,
    src/lib/app-brand.ts,
    src/lib/base-path.ts
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/next.config.ts (analog — copiar lógica de basePath e gitHash)
    - /home/henrico/github/henricos/ai-pkm/src/app/globals.css (analog — copiar tokens, remover PKM-específicos)
    - /home/henrico/github/henricos/ai-pkm/src/lib/base-path.ts (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/src/lib/utils.ts (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/src/lib/app-brand.ts (adaptar texto)
    - /home/henrico/github/henricos/ai-pkm/src/app/layout.tsx (adaptar — remover excalifont e script viewer)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções completas de cada arquivo)
  </read_first>
  <action>
Criar os arquivos de configuração do framework e utilitários lib/.

**`next.config.ts`**
Copiar lógica do analog (conteúdo completo em PATTERNS.md seção next.config.ts). O arquivo lê `APP_BASE_PATH` via `process.env`, chama `normalizeBasePath()`, define `basePath`, `output: "standalone"`, e injeta `NEXT_PUBLIC_APP_VERSION` + `NEXT_PUBLIC_GIT_HASH`. Sem dependências PKM no arquivo.

**`src/app/globals.css`**
Copiar do analog. Manter:
- `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`
- Bloco `@theme {}` completo com todos os tokens de cor e tipografia (copiado exato do PATTERNS.md seção globals.css)
- `@custom-variant dark`
- Utilitários: `.glass`, `.gradient-cta`, `.rail-scroll`, `.workspace-loading-bar`, `body` base style
- Bloco `@theme inline` do shadcn (copiar do analog sem alterações)

REMOVER do analog:
- `@import "katex/dist/katex.min.css"`
- `@plugin "@tailwindcss/typography"`
- Seções de viewer presets (chatgpt, github, excalidraw themes)
- Classes `.prose`, `.prose-*`

**Fontes Inter**
Copiar os 4 arquivos `.woff2` do ai-pkm para `src/app/fonts/`:
```bash
cp /home/henrico/github/henricos/ai-pkm/src/app/fonts/inter-latin-400-normal.woff2 src/app/fonts/
cp /home/henrico/github/henricos/ai-pkm/src/app/fonts/inter-latin-500-normal.woff2 src/app/fonts/
cp /home/henrico/github/henricos/ai-pkm/src/app/fonts/inter-latin-600-normal.woff2 src/app/fonts/
cp /home/henrico/github/henricos/ai-pkm/src/app/fonts/inter-latin-700-normal.woff2 src/app/fonts/
```

**`src/app/layout.tsx`**
Portar com adaptações (conteúdo em PATTERNS.md seção layout.tsx):
- Manter: `localFont` com os 4 pesos de Inter, `lang="pt-BR"`, `metadata` com `appBrand.appName`
- REMOVER: `excalifont` e sua declaração `localFont`
- REMOVER: `buildViewerThemeBootstrapScript` e o `<script dangerouslySetInnerHTML>`
- O `className` do `<html>` deve ser apenas `cn("font-sans", inter.variable)` (sem excalifont.variable)

**`src/lib/utils.ts`**
Copiar exato do analog (conteúdo em PATTERNS.md). 6 linhas, sem alterações.

**`src/lib/app-brand.ts`**
Portar com adaptações de texto (conteúdo em PATTERNS.md seção app-brand.ts):
```typescript
export const appBrand = {
  appId: "hiring-pipeline",
  appName: "Hiring Pipeline",
  appDescription: "Plataforma de gestão do processo seletivo assistida por IA.",
} as const;
```

**`src/lib/base-path.ts`**
Copiar exato do analog (conteúdo completo em PATTERNS.md seção base-path.ts). Zero alterações. 72 linhas incluindo todas as funções: `normalizeBasePath`, `getConfiguredBasePath`, `normalizeInternalPath` (privada), `withBasePath`.
  </action>
  <verify>
    <automated>grep "output.*standalone" next.config.ts && grep "normalizeBasePath" next.config.ts && grep "color-tertiary: #0055d7" src/app/globals.css && grep "hiring-pipeline" src/lib/app-brand.ts && grep "export function normalizeBasePath" src/lib/base-path.ts && grep "export function withBasePath" src/lib/base-path.ts && ls src/app/fonts/inter-latin-400-normal.woff2</automated>
  </verify>
  <acceptance_criteria>
    - next.config.ts contém `output: "standalone"`
    - next.config.ts importa `normalizeBasePath` de `./src/lib/base-path`
    - src/app/globals.css contém `--color-tertiary: #0055d7`
    - src/app/globals.css contém `.glass {` e `.gradient-cta {`
    - src/app/globals.css NÃO contém `katex` nem `@tailwindcss/typography`
    - src/lib/app-brand.ts contém `"hiring-pipeline"` e `"Hiring Pipeline"`
    - src/lib/base-path.ts contém `export function normalizeBasePath`
    - src/lib/base-path.ts contém `export function withBasePath`
    - src/app/layout.tsx contém `lang="pt-BR"`
    - src/app/layout.tsx NÃO contém `excalifont` nem `buildViewerThemeBootstrapScript`
    - src/app/fonts/ contém os 4 arquivos .woff2 Inter
  </acceptance_criteria>
  <done>next.config.ts, globals.css, fontes, layout.tsx e utilitários lib/ criados</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| process.env → next.config.ts | APP_BASE_PATH lido como string crua — normalizeBasePath sanitiza antes de usar |
| Git process → next.config.ts | execSync("git rev-parse") pode falhar — bloco try/catch com fallback "dev" |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-02 | Spoofing | next.config.ts APP_BASE_PATH | mitigate | `normalizeBasePath()` valida: deve começar com "/", sem espaços, sem barras duplas — rejeita valores malformados em build-time |
| T-1-07 | Information Disclosure | NEXT_PUBLIC_GIT_HASH | accept | Hash Git é informação pública de repositório; risco baixo para ferramenta interna |
| T-1-08 | Tampering | src/app/globals.css @theme | accept | CSS não é vetor de ataque — apenas afeta apresentação visual |
</threat_model>

<verification>
Após instalação de dependências (`npm install`) e criação dos arquivos:

```bash
# Verificar que npm install funciona
npm install

# Verificar que testes de base-path passam (GREEN após base-path.ts criado)
npm test -- base-path

# Verificar typecheck
npm run typecheck 2>&1 | head -30
```

Resultado esperado:
- `npm install` conclui sem erros
- `npm test -- base-path` reporta todos os testes GREEN
- `npm run typecheck` sem erros de tipo (pode ter erros de módulo não encontrado para next-auth se o env não estiver configurado — aceitável neste ponto)
</verification>

<success_criteria>
- package.json instalável via npm install com versões exatas do RESEARCH.md
- next.config.ts lê APP_BASE_PATH e configura basePath via normalizeBasePath
- next.config.ts configura output: "standalone" (obrigatório para Docker)
- globals.css tem todos os design tokens do DESIGN.md sem importações PKM-específicas
- base-path.ts é cópia exata do ai-pkm (testes passam GREEN)
- app-brand.ts usa "hiring-pipeline" e "Hiring Pipeline"
- Fontes Inter locais nos 4 pesos (.woff2)
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/01-foundation-authentication/01-B-SUMMARY.md` com:
- Lista de arquivos criados e suas origens (ai-pkm exact / adapted / new)
- Resultado de `npm install` e `npm test -- base-path`
- Desvios do analog ai-pkm documentados
</output>
