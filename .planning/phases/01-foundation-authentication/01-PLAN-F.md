---
phase: 01-foundation-authentication
plan: F
type: execute
wave: 2
depends_on:
  - 01-PLAN-B
files_modified:
  - Dockerfile
  - compose.yaml
  - .dockerignore
  - DESIGN.md
  - references/ui/screens/01-login/code.html
  - references/ui/screens/01-login/screen.png
autonomous: true
requirements:
  - APP-01
  - APP-02

must_haves:
  truths:
    - "npm test -- container passa GREEN: Dockerfile tem USER nextjs, EXPOSE 3000, standalone output, DATA_PATH, AGENTS.md"
    - "npm test -- container passa GREEN: .dockerignore contém .git, node_modules, .next, .env, data-local"
    - "Dockerfile é multi-stage: base → deps → builder → runner com node:22-alpine (D-18)"
    - "compose.yaml tem volume bind mount para DATA_PATH em /data (D-17)"
    - "DESIGN.md na raiz do projeto com referências 'PKM' substituídas por 'Hiring Pipeline' (D-09, D-10)"
    - "references/ui/screens/01-login/ tem code.html e screen.png copiados do ai-pkm (D-12)"
  artifacts:
    - path: "Dockerfile"
      provides: "Build multi-stage node:22-alpine com non-root user (nextjs) e output standalone"
      contains: "USER nextjs"
    - path: "compose.yaml"
      provides: "Compose com bind mount DATA_PATH → /data e 6 env vars declaradas"
      contains: "DATA_PATH: /data"
    - path: ".dockerignore"
      provides: "Exclusão de arquivos de build do contexto Docker"
      contains: "data-local"
    - path: "DESIGN.md"
      provides: "Especificação visual canônica adaptada do ai-pkm"
      contains: "Hiring Pipeline"
    - path: "references/ui/screens/01-login/code.html"
      provides: "Referência HTML da tela de login para agentes de UI"
    - path: "references/ui/screens/01-login/screen.png"
      provides: "Screenshot de referência da tela de login"
  key_links:
    - from: "Dockerfile builder stage"
      to: "DATA_PATH=/tmp/build/data"
      via: "ENV DATA_PATH no stage builder"
      pattern: "DATA_PATH=/tmp/build/data"
    - from: "compose.yaml volumes"
      to: "${DATA_HOST_PATH}:/data"
      via: "bind mount"
      pattern: "source.*DATA_HOST_PATH"
---

<objective>
Implementar a infraestrutura de deploy: Dockerfile multi-stage, compose.yaml com bind mount de dados, .dockerignore, e os assets de design (DESIGN.md adaptado + referências de UI do login).

Purpose: Satisfazer o critério #4 da Phase 1 (Docker build completo com imagem de produção) e D-09/D-10/D-12 (design system documentado com referências de UI para agentes futuros). Este plano pode rodar em paralelo com PLAN-E pois modifica arquivos distintos.

Output: Dockerfile funcional, compose.yaml configurado, DESIGN.md adaptado e referências de UI copiadas do ai-pkm.
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
- package.json com scripts build/start corretos
- next.config.ts com output: "standalone"

Env vars declaradas no compose.yaml (de PLAN-D — env.ts):
- DATA_PATH, AUTH_USERNAME, AUTH_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, APP_BASE_PATH

Estrutura do Dockerfile (analog exato em PATTERNS.md seção Dockerfile):
- Stage base: node:22-alpine
- Stage deps: npm ci
- Stage builder: npm run build (com DATA_PATH=/tmp/build/data placeholder)
- Stage runner: nextjs user UID 1001, EXPOSE 3000, CMD node server.js
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Tarefa F-1: Criar Dockerfile, .dockerignore e compose.yaml</name>
  <files>
    Dockerfile,
    .dockerignore,
    compose.yaml
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/Dockerfile (analog — adaptar DATA_PATH, remover models/reference)
    - /home/henrico/github/henricos/ai-pkm/compose.yaml (analog — adaptar volumes e env vars)
    - .planning/phases/01-foundation-authentication/01-PATTERNS.md (seções Dockerfile, compose.yaml — versões hiring-pipeline completas)
    - src/__tests__/container-packaging.test.ts (testes que devem ficar GREEN — criados em PLAN-A)
  </read_first>
  <behavior>
    - Test DOCKER-01: Dockerfile contém FROM node: + AS builder + AS runner + USER nextjs + EXPOSE 3000
    - Test DOCKER-01: Dockerfile contém .next/standalone e .next/static (output standalone)
    - Test DOCKER-01: Dockerfile contém AGENTS.md e .agents/skills
    - Test DOCKER-01: Dockerfile contém DATA_PATH (não PKM_PATH)
    - Test DOCKER-01: Dockerfile NÃO copia dados da aplicação (COPY data)
    - Test DOCKER-02: .dockerignore contém .git, node_modules, .next, .env, data-local
  </behavior>
  <action>
**`Dockerfile`**
Criar conforme a versão hiring-pipeline do PATTERNS.md (seção Dockerfile — versão completa):

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
ENV DATA_PATH=/tmp/build/data
ENV AUTH_USERNAME=build-user
ENV AUTH_PASSWORD=build-password
ENV NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234
ENV NEXTAUTH_URL=http://127.0.0.1:3000${APP_BASE_PATH}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
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
COPY --from=builder /app/.agents/skills ./.agents/skills
COPY --from=builder /app/AGENTS.md ./AGENTS.md
COPY --from=builder /app/references ./references

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

ADAPTAÇÕES CRÍTICAS vs ai-pkm:
- SUBSTITUIR: `ENV PKM_PATH=...` e `ENV INDEX_PATH=...` → `ENV DATA_PATH=/tmp/build/data`
- SUBSTITUIR: `RUN mkdir -p /tmp/build/pkm /tmp/build/index` → `RUN mkdir -p /tmp/build/data`
- REMOVER: `COPY --from=builder /app/models ./models`
- REMOVER: `COPY --from=builder /app/reference ./reference` (ai-pkm específico)
- MANTER: `COPY --from=builder /app/.agents/skills ./.agents/skills`
- MANTER: `COPY --from=builder /app/AGENTS.md ./AGENTS.md`
- ADICIONAR: `COPY --from=builder /app/references ./references` (referências de UI)

**`.dockerignore`**
```
.git
.gitignore
node_modules
.next
out
build
dist
.env
.env.local
.env*.local
data-local
*.log
.DS_Store
Thumbs.db
README.md
```

**`compose.yaml`**
Criar conforme a versão hiring-pipeline do PATTERNS.md (seção compose.yaml):
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
```

NOTA: Volume NÃO usa `read_only: true` porque `ensureSubdir()` precisa criar subpastas (D-15).
  </action>
  <verify>
    <automated>npm test -- container</automated>
  </verify>
  <acceptance_criteria>
    - `npm test -- container` reporta todos os testes GREEN
    - Dockerfile contém `FROM node:22-alpine AS base`
    - Dockerfile contém `AS builder` e `AS runner`
    - Dockerfile contém `USER nextjs`
    - Dockerfile contém `EXPOSE 3000`
    - Dockerfile contém `ENV DATA_PATH=/tmp/build/data` (não PKM_PATH)
    - Dockerfile contém `COPY --from=builder /app/.next/standalone ./`
    - Dockerfile contém `COPY --from=builder /app/.agents/skills`
    - Dockerfile contém `COPY --from=builder /app/AGENTS.md`
    - Dockerfile NÃO contém `COPY.*\bmodels\b` nem `COPY.*\bindex\b` (sem dados PKM)
    - .dockerignore contém `.git`, `node_modules`, `.next`, `.env`, `data-local`
    - compose.yaml contém `DATA_PATH: /data`
    - compose.yaml contém `source: ${DATA_HOST_PATH}` no volume bind mount
    - compose.yaml NÃO tem `read_only: true` no volume (ensureSubdir precisa escrever)
  </acceptance_criteria>
  <done>Dockerfile, .dockerignore e compose.yaml criados com testes container GREEN</done>
</task>

<task type="auto">
  <name>Tarefa F-2: Criar DESIGN.md adaptado e referências de UI do login</name>
  <files>
    DESIGN.md,
    references/ui/screens/01-login/code.html,
    references/ui/screens/01-login/screen.png
  </files>
  <read_first>
    - /home/henrico/github/henricos/ai-pkm/DESIGN.md (fonte — adaptar PKM → Hiring Pipeline)
    - /home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/code.html (copiar exato)
    - /home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/screen.png (copiar exato)
    - .planning/phases/01-foundation-authentication/01-CONTEXT.md (D-09, D-10, D-12 — regras de adaptação)
  </read_first>
  <action>
**`DESIGN.md`**
Ler o arquivo completo em `/home/henrico/github/henricos/ai-pkm/DESIGN.md`. Aplicar as seguintes substituições de texto (D-09, D-10):

Substituições globais:
- "AI PKM" → "Hiring Pipeline"
- "ai-pkm" → "hiring-pipeline"
- "Digital Curator" — MANTER como norte criativo (D-09 explicitamente permite)
- "PKM" isolado (como conceito) → "Hiring Pipeline"
- Referências a "curador" ou "curator" → "gestor"
- Referências a funcionalidades PKM-específicas (árvore de notas, markdown, Zettelkasten, etc.) → substituir pela analogia mais próxima no domínio de hiring (perfis de vaga, vagas, processo seletivo)

Manter integralmente:
- Todos os tokens de cor e suas definições hexadecimais
- Tipografia Inter e sua escala
- Regras de elevação (ambient shadows)
- No-Line Rule
- Tonal layering (surface hierarchy)
- 8px grid
- Glassmorphism e utilitários CSS

O arquivo deve começar com:
```markdown
# Hiring Pipeline — Design System

> "The Digital Curator aesthetic applied to the hiring pipeline."
```

**Referências de UI**
Copiar os 2 arquivos do ai-pkm para o hiring-pipeline:
```bash
mkdir -p references/ui/screens/01-login
cp /home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/code.html references/ui/screens/01-login/
cp /home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/screen.png references/ui/screens/01-login/
```

Adicionar `references/ui/screens/01-login/README.md` com 3 linhas explicando o contexto:
```markdown
# Referência: Tela de Login

Screenshot e HTML de referência da tela de login portada do ai-pkm.
Agentes de UI devem ler este arquivo antes de implementar qualquer modificação na tela de login.
```
  </action>
  <verify>
    <automated>grep "Hiring Pipeline" DESIGN.md && grep "\-\-color-tertiary: #0055d7" DESIGN.md && ls references/ui/screens/01-login/code.html references/ui/screens/01-login/screen.png && grep -v "AI PKM" DESIGN.md | head -5 || true</automated>
  </verify>
  <acceptance_criteria>
    - DESIGN.md existe na raiz do projeto
    - DESIGN.md contém "Hiring Pipeline" (título e referências adaptadas)
    - DESIGN.md contém `--color-tertiary: #0055d7` (tokens preservados)
    - DESIGN.md contém "Digital Curator" (mantido como norte criativo, per D-09)
    - DESIGN.md NÃO contém "AI PKM" como nome do produto
    - references/ui/screens/01-login/code.html existe
    - references/ui/screens/01-login/screen.png existe
    - references/ui/screens/01-login/README.md existe com explicação de contexto
  </acceptance_criteria>
  <done>DESIGN.md adaptado e referências de UI do login copiadas para o projeto</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Container → Host filesystem | DATA_HOST_PATH bind mount — dados mutáveis acessíveis pelo container |
| Build context → Docker daemon | .dockerignore define o que entra no contexto — sem .env e data |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-06 | Elevation of Privilege | Dockerfile runner stage | mitigate | `USER nextjs` (UID 1001, não root). `addgroup -S` e `adduser -S` criam usuário de sistema sem shell. chown antes de USER. Exato padrão do ai-pkm validado em produção |
| T-1-07 | Information Disclosure | Dockerfile builder stage ENV | accept | ENV vars no stage builder (AUTH_USERNAME, NEXTAUTH_SECRET) são apenas para o build — não persistem na imagem runner. Valores são placeholders fictícios para o build |
| T-1-08 | Tampering | compose.yaml DATA_PATH bind mount | accept | Volume sem read_only porque ensureSubdir precisa criar subpastas (D-15). DATA_HOST_PATH é definido pelo operador — ferramenta interna sem acesso externo |
| T-1-09 | Information Disclosure | .dockerignore | mitigate | Exclui .env, .env.local, data-local — secrets e dados locais nunca entram no contexto Docker |
</threat_model>

<verification>
```bash
# Testes de contrato do Dockerfile (devem ser GREEN)
npm test -- container

# Verificação manual do Docker build (se Docker disponível)
docker build -t hiring-pipeline:local . 2>&1 | tail -10
# Resultado esperado: Successfully built <hash>

# Se Docker não disponível no ambiente:
echo "Docker build deve ser executado manualmente quando Docker estiver disponível."
echo "O teste de contrato (container-packaging.test.ts) já valida a estrutura do Dockerfile sem Docker."
```
</verification>

<success_criteria>
- npm test -- container: GREEN (DOCKER-01, DOCKER-02)
- Dockerfile é multi-stage com base/deps/builder/runner e node:22-alpine
- Dockerfile usa USER nextjs (UID 1001, não root)
- Dockerfile tem DATA_PATH (não PKM_PATH) e não copia dados da aplicação
- compose.yaml tem bind mount DATA_HOST_PATH → /data sem read_only
- .dockerignore exclui .env, node_modules, .next, data-local
- DESIGN.md adaptado na raiz com tokens corretos e sem "AI PKM"
- references/ui/screens/01-login/ com code.html, screen.png e README.md
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/01-foundation-authentication/01-F-SUMMARY.md` com:
- Resultado de npm test -- container
- Status do Docker build (se Docker disponível) ou nota de pendência manual
- Confirmação de que DATA_PATH foi substituído corretamente no Dockerfile
- Lista de substituições aplicadas no DESIGN.md
</output>
