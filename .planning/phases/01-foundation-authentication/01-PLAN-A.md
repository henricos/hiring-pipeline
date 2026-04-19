---
phase: 01-foundation-authentication
plan: A
type: execute
wave: 0
depends_on: []
files_modified:
  - vitest.config.ts
  - src/__tests__/auth.test.ts
  - src/__tests__/base-path.test.ts
  - src/__tests__/env.test.ts
  - src/__tests__/data-service.test.ts
  - src/__tests__/next-config.test.ts
  - src/__tests__/container-packaging.test.ts
autonomous: true
requirements:
  - APP-01
  - APP-02

must_haves:
  truths:
    - "npm test executa sem erros de configuração do Vitest"
    - "Todos os 7 arquivos de teste existem com stubs que falham de forma esperada (RED)"
    - "Os stubs importam os módulos corretos e testam os contratos certos"
  artifacts:
    - path: "vitest.config.ts"
      provides: "Configuração Vitest com jsdom, alias @/, include pattern"
      contains: "src/__tests__/**/*.test.ts"
    - path: "src/__tests__/auth.test.ts"
      provides: "Testes de autenticação: credenciais, matcher de rotas, JWT"
      exports: []
    - path: "src/__tests__/base-path.test.ts"
      provides: "Testes de normalizeBasePath e withBasePath"
      exports: []
    - path: "src/__tests__/env.test.ts"
      provides: "Testes de validação de env vars com Zod 4"
      exports: []
    - path: "src/__tests__/data-service.test.ts"
      provides: "Testes de validateDataPath e ensureSubdir"
      exports: []
    - path: "src/__tests__/next-config.test.ts"
      provides: "Testes do next.config.ts: basePath, output standalone"
      exports: []
    - path: "src/__tests__/container-packaging.test.ts"
      provides: "Testes de contrato do Dockerfile e .dockerignore"
      exports: []
  key_links:
    - from: "vitest.config.ts"
      to: "src/__tests__/**/*.test.ts"
      via: "include pattern"
      pattern: "src/__tests__/\\*\\*/\\*.test.ts"
    - from: "src/__tests__/auth.test.ts"
      to: "src/lib/auth.ts"
      via: "import dinâmico com vi.mock"
      pattern: "import.*lib/auth"
---

<objective>
Criar a infraestrutura de testes (Wave 0) que habilita feedback automatizado durante a execução das Waves 1 e 2. Todos os arquivos de teste são stubs que falham de forma determinística até o código de produção ser implementado.

Purpose: Garantir que cada tarefa das Waves seguintes tenha um comando `npm test -- <filtro>` que valida o comportamento esperado. Sem Wave 0, as Waves 1-2 seriam executadas sem feedback automatizado.

Output: `vitest.config.ts` + 6 arquivos de stub em `src/__tests__/`, todos executando sem crash do framework de testes (RED esperado — os testes falharão porque o código de produção ainda não existe).
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
@.planning/phases/01-foundation-authentication/01-VALIDATION.md

<interfaces>
<!-- Módulos a serem importados nos stubs. Ainda não existem — imports são placeholder para RED. -->

Módulos que os stubs referenciam (serão criados nas Waves 1-2):
- src/lib/auth.ts → exporta { handlers, auth, signIn, signOut }
- src/lib/base-path.ts → exporta { normalizeBasePath, withBasePath, getConfiguredBasePath }
- src/lib/env.ts → exporta { env }
- src/lib/data-service.ts → exporta { validateDataPath, ensureSubdir }

Analog completo de vitest.config.ts (copiar exato do PATTERNS.md):
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
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Tarefa A-1: Criar vitest.config.ts</name>
  <files>vitest.config.ts</files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/vitest.config.ts (analog exato — copiar integralmente)
  </read_first>
  <action>
Criar `vitest.config.ts` na raiz do projeto. Copiar integralmente do analog ai-pkm (conteúdo está em PATTERNS.md, seção vitest.config.ts). Não modificar nada — o arquivo é idêntico.

Conteúdo exato a criar:
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

Não criar `src/__tests__/` ainda — isso vem nas subtarefas seguintes.
  </action>
  <verify>
    <automated>grep -r "src/__tests__/\*\*\/\*\.test\.ts" vitest.config.ts && grep "jsdom" vitest.config.ts && grep "@.*path.resolve" vitest.config.ts</automated>
  </verify>
  <acceptance_criteria>
    - vitest.config.ts existe na raiz do projeto
    - Contém `environment: "jsdom"`
    - Contém `include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"]`
    - Contém `alias: { "@": path.resolve(__dirname, "./src") }`
  </acceptance_criteria>
  <done>vitest.config.ts criado e validado via grep</done>
</task>

<task type="auto">
  <name>Tarefa A-2: Criar stubs de teste para auth, base-path e env</name>
  <files>
    src/__tests__/auth.test.ts,
    src/__tests__/base-path.test.ts,
    src/__tests__/env.test.ts
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/src/__tests__/auth.test.ts (analog — adaptar DATA_PATH)
    - /home/henrico/github/henricos/ai-pkm/src/__tests__/with-base-path.test.ts (analog base-path)
    - /home/henrico/github/henricos/ai-pkm/src/__tests__/env.test.ts (analog — adaptar DATA_PATH, remover INDEX_PATH)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções auth.test.ts, base-path.test.ts, env.test.ts)
  </read_first>
  <action>
Criar `src/__tests__/` e os 3 arquivos de teste seguindo o PATTERNS.md.

**`src/__tests__/auth.test.ts`**
Copiar do analog ai-pkm. Única adaptação: no mock do env, substituir `PKM_PATH: "/home/user/pkm"` por `DATA_PATH: "/home/user/data"`. Manter os testes ACC-01 (credenciais válidas), ACC-02 (credenciais inválidas), ACC-03 (matcher de rotas protege tudo exceto /login e assets estáticos como _next, favicon.ico).

Mock do env:
```typescript
vi.mock("../lib/env", () => ({
  env: {
    DATA_PATH: "/home/user/data",
    AUTH_USERNAME: "testuser",
    AUTH_PASSWORD: "testpassword123",
    NEXTAUTH_SECRET: "12345678901234567890123456789012",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));
```

**`src/__tests__/base-path.test.ts`**
Copiar do analog ai-pkm (`with-base-path.test.ts`). Substituir nos valores de exemplo `/pkm` por `/hiring-pipeline` onde forem valores de teste (não onde estão nas mensagens de erro do código — essas são copiadas literalmente). Manter todos os casos edge: trailing slash, double slash, espaço, path relativo, path raiz.

**`src/__tests__/env.test.ts`**
Copiar do analog ai-pkm. Adaptações:
1. Na função `setRequiredEnv`: `DATA_PATH = "/home/user/data"` (era `PKM_PATH`), `APP_BASE_PATH = "/hiring-pipeline"` (era `/pkm`), `NEXTAUTH_URL = "https://host/hiring-pipeline"` (era `https://host/pkm`)
2. No teste RUN-01: `delete process.env.DATA_PATH` (era `PKM_PATH`), `expect(errorSpy...).toContain("DATA_PATH")`
3. No teste ENV-03: adaptar strings esperadas para `/hiring-pipeline`
4. Remover integralmente o bloco de testes `PKG-02` (INDEX_PATH — PKM-específico)
5. Manter ENV-01 (env válido), ENV-02 (campo ausente falha), ENV-03 (NEXTAUTH_URL vs APP_BASE_PATH), RUN-01 (process.exit com mensagem)

**Adição obrigatória em `src/__tests__/auth.test.ts` — bloco `isValidCallback`:**
Ao criar o stub `auth.test.ts`, adicionar o seguinte bloco `describe` ao final do arquivo (após os blocos ACC-01, ACC-02, ACC-03). A função `isValidCallback` será importada de `@/components/login-form` quando implementada na Wave 2 (PLAN-E); por ora o import pode ser declarado mas o teste ficará RED até a implementação:

```typescript
// Importar quando LoginForm for implementado (PLAN-E — Wave 2)
// import { isValidCallback } from "@/components/login-form";

describe("isValidCallback", () => {
  // Stub — ficará RED até isValidCallback ser implementado em PLAN-E
  const isValidCallback = (_url: string): boolean => {
    throw new Error("isValidCallback not implemented yet");
  };

  test("rejeita URLs absolutas com ://", () => {
    expect(isValidCallback("://malicious.com")).toBe(false);
  });

  test("rejeita URLs com protocolo http://", () => {
    expect(isValidCallback("http://external.com")).toBe(false);
  });

  test("aceita path relativo com prefix correto", () => {
    expect(isValidCallback("/hiring-pipeline/dashboard")).toBe(true);
  });

  test("aceita path raiz do hiring-pipeline", () => {
    expect(isValidCallback("/hiring-pipeline")).toBe(true);
  });
});
```

Nota: o stub lança exceção para garantir RED determinístico. Quando PLAN-E implementar `isValidCallback`, o import real deve substituir o stub inline.
  <verify>
    <automated>ls src/__tests__/auth.test.ts src/__tests__/base-path.test.ts src/__tests__/env.test.ts && grep "DATA_PATH" src/__tests__/auth.test.ts && grep "DATA_PATH" src/__tests__/env.test.ts && grep "hiring-pipeline" src/__tests__/env.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - src/__tests__/auth.test.ts existe e contém `DATA_PATH: "/home/user/data"` no mock do env
    - src/__tests__/auth.test.ts NÃO contém `PKM_PATH`
    - src/__tests__/base-path.test.ts existe e contém `normalizeBasePath` e `withBasePath`
    - src/__tests__/env.test.ts existe e contém `DATA_PATH` (não `PKM_PATH`)
    - src/__tests__/env.test.ts NÃO contém `INDEX_PATH`
    - src/__tests__/env.test.ts contém `hiring-pipeline` nos valores esperados do ENV-03
  </acceptance_criteria>
  <done>3 arquivos de teste existem com adaptações corretas do ai-pkm para hiring-pipeline</done>
</task>

<task type="auto">
  <name>Tarefa A-3: Criar stubs de teste para data-service, next-config e container-packaging</name>
  <files>
    src/__tests__/data-service.test.ts,
    src/__tests__/next-config.test.ts,
    src/__tests__/container-packaging.test.ts
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/src/__tests__/next-config.test.ts (analog next-config)
    - /home/henrico/github/henricos/ai-pkm/src/__tests__/container-packaging.test.ts (analog container)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções data-service.test.ts, container-packaging.test.ts)
  </read_first>
  <action>
Criar os 3 arquivos restantes.

**`src/__tests__/data-service.test.ts`**
Criar do zero — sem analog direto no ai-pkm. Implementar conforme o padrão completo do PATTERNS.md (seção data-service.test.ts):

```typescript
import fs from "fs";
import { describe, test, expect, vi, afterEach } from "vitest";

vi.mock("../lib/env", () => ({
  env: { DATA_PATH: "/tmp/test-data-service" },
}));

describe("data-service", () => {
  afterEach(() => {
    vi.resetModules();
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

**`src/__tests__/next-config.test.ts`**
Copiar do analog ai-pkm. Adaptar: verificar que `basePath` usa `APP_BASE_PATH`, que `output` é `"standalone"`, que `NEXT_PUBLIC_APP_VERSION` e `NEXT_PUBLIC_GIT_HASH` estão em `env`. Remover verificações PKM-específicas (se houver).

**`src/__tests__/container-packaging.test.ts`**
Copiar do analog ai-pkm. Adaptações conforme PATTERNS.md:
- Manter: `USER nextjs`, `EXPOSE 3000`, `.next/standalone`, `.next/static`, `AGENTS.md`, `.agents/skills`
- Adaptar: `expect(dockerfile).toContain("DATA_PATH")` (não PKM_PATH)
- Adaptar: `expect(dockerfile).not.toMatch(/COPY\s+.*\bdata\b(?!-service)/i)` (dados não copiados)
- Adaptar no .dockerignore: `expect(dockerignore).toContain("data-local")` (era "pkm"/"index")
  </action>
  <verify>
    <automated>ls src/__tests__/data-service.test.ts src/__tests__/next-config.test.ts src/__tests__/container-packaging.test.ts && grep "validateDataPath" src/__tests__/data-service.test.ts && grep "ensureSubdir" src/__tests__/data-service.test.ts && grep "USER nextjs" src/__tests__/container-packaging.test.ts && grep "DATA_PATH" src/__tests__/container-packaging.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - src/__tests__/data-service.test.ts existe e contém `validateDataPath` e `ensureSubdir`
    - src/__tests__/data-service.test.ts contém mock `DATA_PATH: "/tmp/test-data-service"`
    - src/__tests__/next-config.test.ts existe
    - src/__tests__/container-packaging.test.ts existe e contém `USER nextjs` e `DATA_PATH`
    - src/__tests__/container-packaging.test.ts contém `data-local` (não "pkm" ou "index") na verificação de .dockerignore
    - src/__tests__/container-packaging.test.ts NÃO contém `PKM_PATH`
  </acceptance_criteria>
  <done>3 arquivos de teste adicionais criados e validados via grep</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| test env → production code | Stubs importam módulos que ainda não existem — falha de módulo não encontrado é esperada (RED) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-W0-01 | Tampering | src/__tests__/env.test.ts | mitigate | Verificar que o mock usa DATA_PATH (não PKM_PATH) — mock incorreto faria o teste passar com variáveis erradas |
| T-1-W0-02 | Information Disclosure | src/__tests__/auth.test.ts | accept | Mock de env em teste usa credenciais fictícias ("testuser", "testpassword123") — não há PII nem credenciais reais |
</threat_model>

<verification>
Após criar todos os 7 arquivos, executar:
```bash
# Verifica que o framework Vitest inicializa sem crash
# Os testes devem FALHAR (RED) porque os módulos de produção não existem ainda
# Isso é o comportamento esperado para Wave 0
npm test 2>&1 | head -50
```

Resultado esperado: Vitest inicializa, tenta importar módulos inexistentes, reporta falhas de módulo não encontrado. NÃO deve haver "Cannot find module vitest" ou erros de configuração do próprio Vitest.

Se `npm test` crashar com erro de dependência npm (não de módulo não encontrado), isso indica que `package.json` não foi criado ainda — nesse caso, as dependências de dev ainda não estão instaladas. O Wave 0 é independente — o framework de testes só pode ser validado após o Wave 1 instalar as dependências.
</verification>

<success_criteria>
- vitest.config.ts existe com configuração jsdom + alias @ + include pattern correto
- 6 arquivos de stub em src/__tests__/ existem com conteúdo funcional (não vazios)
- Nenhum arquivo de teste contém referências a PKM_PATH, INDEX_PATH, ou padrões PKM-específicos
- data-service.test.ts testa validateDataPath e ensureSubdir com mocks corretos
- container-packaging.test.ts verifica DATA_PATH (não PKM_PATH) e data-local (não pkm) no .dockerignore
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/01-foundation-authentication/01-A-SUMMARY.md` com:
- Arquivos criados e seus propósitos
- Status da execução npm test (esperado: falha por módulos não encontrados)
- Qualquer desvio do padrão do PATTERNS.md
</output>
