---
phase: 01-foundation-authentication
plan: D
type: execute
wave: 1
depends_on:
  - 01-PLAN-A
  - 01-PLAN-B
files_modified:
  - src/lib/data-service.ts
  - .gitignore
  - .env.local.example
autonomous: true
requirements:
  - APP-01

must_haves:
  truths:
    - "npm test -- data-service passa GREEN: validateDataPath encerra com exit(1) se DATA_PATH não existe"
    - "npm test -- data-service passa GREEN: ensureSubdir cria subpastas automaticamente e é idempotente"
    - "data-service.ts NUNCA cria a raiz de DATA_PATH — apenas valida que existe (D-14)"
    - ".env.local.example documenta todos os 6 env vars com exemplos válidos"
    - "data-local/ está no .gitignore"
  artifacts:
    - path: "src/lib/data-service.ts"
      provides: "validateDataPath() e ensureSubdir() para persistência JSON"
      exports: ["validateDataPath", "ensureSubdir"]
      contains: "process.exit(1)"
    - path: ".env.local.example"
      provides: "Documentação de todos os env vars da Phase 1"
      contains: "DATA_PATH"
    - path: ".gitignore"
      provides: "Exclusão de .env.local e data-local/"
      contains: "data-local"
  key_links:
    - from: "src/lib/data-service.ts"
      to: "src/lib/env.ts"
      via: "import { env } — acesso a env.DATA_PATH"
      pattern: "env.DATA_PATH"
    - from: "src/lib/data-service.ts"
      to: "node:fs"
      via: "fs.existsSync e fs.mkdirSync"
      pattern: "fs.mkdirSync.*recursive: true"
---

<objective>
Implementar a camada de persistência JSON da Phase 1: data-service.ts com validateDataPath() e ensureSubdir(), mais o scaffolding de ambiente (.gitignore e .env.local.example).

Purpose: Satisfazer D-13, D-14 e D-15 — DATA_PATH configurável, raiz deve existir no startup (fail-fast), subpastas criadas automaticamente no primeiro acesso. Este módulo é a base de toda a persistência das Phases 2-4.

Output: data-service.ts testado e verde + arquivos de ambiente configurados.
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
<!-- Contrato exportado por este plano, consumido pelas Phases 2-4 -->

src/lib/data-service.ts:
```typescript
import fs from "fs";
import path from "path";
import { env } from "@/lib/env";

/**
 * D-14: Valida que DATA_PATH existe. Encerra processo com exit(1) se não encontrar.
 * Chamar no startup da aplicação. Nunca cria a raiz — apenas valida.
 */
export function validateDataPath(): void

/**
 * D-15: Garante que subdir existe em DATA_PATH. Cria se não existir (recursive, idempotente).
 * Chamar nos service layers das Phases 2-4 antes do primeiro acesso.
 * @returns Caminho absoluto para a subpasta
 */
export function ensureSubdir(subdir: string): string
```

Env var DATA_PATH (de src/lib/env.ts, criado em PLAN-C):
```typescript
env.DATA_PATH: string  // caminho absoluto validado pelo Zod schema
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Tarefa D-1: Implementar data-service.ts</name>
  <files>src/lib/data-service.ts</files>
  <read_first>
    - src/__tests__/data-service.test.ts (testes que devem ficar GREEN — criados em PLAN-A)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seção data-service.ts — implementação completa)
    - src/lib/env.ts (verificar que DATA_PATH está exportado — criado em PLAN-C)
  </read_first>
  <behavior>
    - Test DS-01: validateDataPath() chama process.exit(1) quando DATA_PATH não existe no filesystem
    - Test DS-01: validateDataPath() imprime mensagem de erro contendo "DATA_PATH" no console.error
    - Test DS-02: ensureSubdir("profiles") cria /tmp/test-data-service/profiles e retorna o caminho absoluto
    - Test DS-03: ensureSubdir("vacancies") não lança quando vacancies já existe (idempotente)
    - INVARIANTE: validateDataPath() NUNCA cria a raiz DATA_PATH — apenas verifica existência (D-14)
  </behavior>
  <action>
Criar `src/lib/data-service.ts` exatamente conforme o PATTERNS.md (seção data-service.ts):

```typescript
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

REGRAS CRÍTICAS:
1. `validateDataPath()` usa `fs.existsSync()` — não `fs.accessSync()` (que lançaria exceção em vez de retornar boolean)
2. `validateDataPath()` NÃO chama `fs.mkdirSync()` para a raiz — apenas verifica e encerra (D-14)
3. `ensureSubdir()` usa `{ recursive: true }` — idempotente mesmo se o dir já existir
4. `path.join(env.DATA_PATH, subdir)` — nunca concatenar strings de path manualmente
  </action>
  <verify>
    <automated>npm test -- data-service</automated>
  </verify>
  <acceptance_criteria>
    - `npm test -- data-service` reporta todos os 3 testes GREEN
    - src/lib/data-service.ts contém `fs.existsSync(env.DATA_PATH)` em validateDataPath
    - src/lib/data-service.ts contém `process.exit(1)` em validateDataPath
    - src/lib/data-service.ts contém `fs.mkdirSync(dirPath, { recursive: true })` em ensureSubdir
    - src/lib/data-service.ts NÃO chama `fs.mkdirSync` dentro de validateDataPath (não cria raiz)
    - src/lib/data-service.ts usa `path.join(env.DATA_PATH, subdir)` (não concatenação de string)
  </acceptance_criteria>
  <done>data-service.ts implementado com todos os testes DS-01, DS-02, DS-03 GREEN</done>
</task>

<task type="auto">
  <name>Tarefa D-2: Criar .gitignore e .env.local.example</name>
  <files>
    .gitignore,
    .env.local.example
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/.gitignore (analog — adaptar data-local)
    - .planning/phases/01-foundation-authentication/01-CONTEXT.md (D-13, D-19, D-20 para env vars)
    - .planning/phases/01-foundation-authentication/01-RESEARCH.md (seção Open Questions #2 sobre volumes de dados em dev)
  </read_first>
  <action>
**`.gitignore`**
Copiar do analog ai-pkm. Adaptar:
- SUBSTITUIR: linhas de exclusão PKM-específicas (ex: `/pkm`, `/index`) por `data-local/`
- MANTER: `.next/`, `node_modules/`, `.env.local`, `.env*.local`, `*.woff2` (se presente), `out/`
- ADICIONAR: `data-local/` (diretório de dados local de desenvolvimento — D-13/D-17)

Seções obrigatórias no .gitignore:
```
# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/

# production build
build/
dist/

# environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# data directory (local dev — use bind mount in production)
data-local/

# OS
.DS_Store
Thumbs.db
```

**`.env.local.example`**
Criar documentação de todas as 6 env vars da Phase 1 (D-20) com exemplos válidos para desenvolvimento local:

```
# Copia para .env.local e preencha os valores reais
# NUNCA commitar o .env.local

# Credenciais do usuário único
AUTH_USERNAME=gestor
AUTH_PASSWORD=senha-segura-minimo-8-chars

# Secret JWT do next-auth (mínimo 32 caracteres)
# Gerar com: openssl rand -base64 32
NEXTAUTH_SECRET=substitua-por-secret-gerado-com-openssl-rand

# URL base da aplicação (deve incluir o base path)
NEXTAUTH_URL=http://localhost:3000/hiring-pipeline

# Base path configurável (padrão /hiring-pipeline)
APP_BASE_PATH=/hiring-pipeline

# Diretório de dados JSON (em dev, use caminho relativo ou absoluto local)
# Em produção Docker, use bind mount — ver compose.yaml
DATA_PATH=/caminho/absoluto/para/data-local
```

Incluir comentário explicando que DATA_PATH deve ser caminho absoluto (validado pelo Zod schema).
  </action>
  <verify>
    <automated>grep "data-local" .gitignore && grep ".env.local" .gitignore && grep "node_modules" .gitignore && grep "AUTH_USERNAME" .env.local.example && grep "DATA_PATH" .env.local.example && grep "NEXTAUTH_SECRET" .env.local.example && grep "APP_BASE_PATH" .env.local.example</automated>
  </verify>
  <acceptance_criteria>
    - .gitignore contém `data-local/`
    - .gitignore contém `.env.local`
    - .gitignore contém `node_modules/`
    - .gitignore contém `.next/`
    - .gitignore NÃO contém `/pkm` ou `/index` (padrões PKM)
    - .env.local.example contém todos os 6 env vars: AUTH_USERNAME, AUTH_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, APP_BASE_PATH, DATA_PATH
    - .env.local.example contém comentário sobre openssl rand para gerar NEXTAUTH_SECRET
    - .env.local.example contém nota sobre DATA_PATH precisar ser caminho absoluto
  </acceptance_criteria>
  <done>.gitignore e .env.local.example criados com todos os env vars documentados</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| env.DATA_PATH → fs.existsSync | DATA_PATH foi validado como caminho absoluto pelo Zod schema — path traversal mitigado na origem |
| subdir param → path.join | subdir é fornecido pelo código da aplicação (não pelo usuário) nas Phases 2-4 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-04 | Tampering | src/lib/data-service.ts ensureSubdir | mitigate | DATA_PATH validado como caminho absoluto no Zod schema (env.ts). path.join() impede traversal simples. subdir vem do código da aplicação, nunca de input do usuário na Phase 1 |
| T-1-10 | Information Disclosure | .env.local.example | accept | Arquivo de exemplo com valores fictícios — não contém secrets reais. Propositalmente commitado para documentação |
| T-1-11 | Elevation of Privilege | DATA_PATH raiz não criada pela app | accept | D-14 exige que o operador crie a raiz manualmente ou via bind mount — reduz risco de criação acidental de diretórios em locais não intencionais |
</threat_model>

<verification>
```bash
# Testes do data-service (devem ser GREEN após implementação)
npm test -- data-service

# Verificar .gitignore exclui data-local
git check-ignore data-local/test.json && echo "data-local ignorado corretamente"

# Verificar que todos os env vars estão no exemplo
grep -E "AUTH_USERNAME|AUTH_PASSWORD|NEXTAUTH_SECRET|NEXTAUTH_URL|APP_BASE_PATH|DATA_PATH" .env.local.example | wc -l
# Deve ser >= 6
```
</verification>

<success_criteria>
- npm test -- data-service: GREEN (DS-01 validateDataPath, DS-02 ensureSubdir cria dir, DS-03 idempotente)
- validateDataPath() usa fs.existsSync + process.exit(1) + mensagem contendo "DATA_PATH"
- ensureSubdir() usa path.join + fs.mkdirSync com recursive:true
- data-service.ts nunca chama mkdirSync para a raiz DATA_PATH
- .gitignore inclui data-local/ e .env.local
- .env.local.example documenta todos os 6 env vars da Phase 1
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/01-foundation-authentication/01-D-SUMMARY.md` com:
- Resultado de npm test -- data-service
- Confirmação de que validateDataPath não cria a raiz (D-14 respeitado)
- Lista dos 6 env vars documentados no .env.local.example
</output>
