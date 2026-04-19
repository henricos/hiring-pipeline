# Phase 1: Foundation & Authentication - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold completo do projeto, autenticação single-user funcional, estrutura Docker de produção, e base path configurável. Ao final desta fase a aplicação sobe, exige login, e tem a shell visual (sidebar) pronta para receber features das fases seguintes.

**Em escopo:** scaffolding Next.js, next-auth Credentials, sidebar colapsável, tela de login, Dockerfile multi-stage, Compose, configuração de env vars, camada de persistência JSON (leitura/escrita com inicialização automática de subpastas).

**Fora de escopo:** qualquer feature de negócio (perfis, vagas, IA) — essas entram nas Phases 2-4.

</domain>

<decisions>
## Implementation Decisions

### Navegação & Shell

- **D-01:** Sidebar lateral colapsável (left rail) — alterna entre expandida (label + ícone) e recolhida (só ícones). Mesmo comportamento do ai-pkm (`AppShell` + `LeftRail`).
- **D-02:** Separação tonal de superfícies para delimitação do rail — sem bordas 1px (No-Line Rule do DESIGN.md). Rail em `bg-surface-container-low`, workspace em `bg-surface-container-lowest`.
- **D-03:** Phase 1 provisiona o shell com placeholder no slot de conteúdo. Fases seguintes substituem o conteúdo sem reescrever a shell.

### Login UX

- **D-04:** Nome da aplicação exibido: **"Hiring Pipeline"** — aparece no card de login e no header da sidebar.
- **D-05:** Tela de login: card centralizado sobre `bg-surface`, mesmo layout do ai-pkm (`(auth)/login/page.tsx`). Adaptar apenas nome e subtítulo; design tokens idênticos.
- **D-06:** Pós-login redireciona para `"/"` — página placeholder/dashboard vazio. Phase 2 substituirá com a library de perfis.
- **D-07:** Mensagem de erro genérica no login (não revela qual campo está errado) — mesmo padrão de segurança do ai-pkm.
- **D-08:** Footer discreto na tela de login com versão + git hash (mesmo padrão do ai-pkm).

### Design System

- **D-09:** Hiring pipeline é tratado como **módulo do mesmo produto** que o ai-pkm. Reutilizar DESIGN.md integralmente (adaptar apenas referências textuais de "PKM" para "Hiring Pipeline").
- **D-10:** DESIGN.md copiado/adaptado para a raiz deste projeto como referência gráfica canônica.
- **D-11:** Tipografia: Inter exclusivamente. Tokens de cor idênticos ao ai-pkm (`tertiary` #0055d7, `surface`, `surface-container-*`, `on-surface`).
- **D-12:** Pasta `references/ui/screens/` criada com ao menos tela de login reaproveitada do ai-pkm como referência HTML/PNG para agentes de UI.

### Persistência JSON

- **D-13:** Caminho para diretório de dados configurável via variável de ambiente `DATA_PATH` (ex: `./data-local` em dev, `/data` em prod Docker).
- **D-14:** A raiz de `DATA_PATH` **deve existir** no startup — a aplicação valida e recusa subir se não encontrar. Mensagem de erro clara no log.
- **D-15:** Subpastas de domínio (`profiles/`, `vacancies/`, etc.) são criadas automaticamente pela aplicação no primeiro acesso, se não existirem.
- **D-16:** Um arquivo JSON por entidade: `{DATA_PATH}/profiles/{id}.json`, `{DATA_PATH}/vacancies/{id}.json`. Facilita versionamento sem conflitos de merge.
- **D-17:** Repo de dados separado (git próprio), montado via bind mount no Compose. Sincronização entre máquinas via git.

### Docker & Ambiente

- **D-18:** Mesmo Dockerfile multi-stage do ai-pkm: `base → deps → builder → runner`, `node:22-alpine`, output `standalone`.
- **D-19:** Configuração local via `.env.local` (gitignored); produção via env vars declaradas no `compose.yaml` — mesmo padrão do ai-pkm.
- **D-20:** Variáveis de ambiente da Phase 1:
  - `AUTH_USERNAME` / `AUTH_PASSWORD` — credenciais do single-user
  - `NEXTAUTH_SECRET` — secret do JWT da sessão
  - `NEXTAUTH_URL` — URL base para callbacks do next-auth
  - `APP_BASE_PATH` — base path configurável (padrão: `/hiring-pipeline`)
  - `DATA_PATH` — caminho para o diretório de dados JSON

### Auth

- **D-21:** next-auth Credentials provider, estratégia JWT, `trustHost: true` (proxy/container). Comparação simples de string para single-user local — mesmo padrão do ai-pkm (`lib/auth.ts`).
- **D-22:** Rota de login em `/login`. Middleware de auth protege todas as rotas exceto `/login` e assets.

### Claude's Discretion

- Estrutura exata de pastas no `src/` (ex: `app/`, `components/`, `lib/`) — seguir convenções do ai-pkm como referência.
- Nome do app brand token (`app-brand.ts`) e símbolo visual na tela de login — Claude escolhe algo adequado a "Hiring Pipeline".
- Conteúdo exato da página placeholder pós-login — pode ser um empty state simples com o nome da app e link para "Perfis" (Phase 2).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `/home/henrico/github/henricos/ai-pkm/DESIGN.md` — Especificação visual completa ("Digital Curator"). Hiring Pipeline segue este design; adaptar apenas referências textuais de PKM.

### UI Screen References
- `/home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/code.html` — HTML de referência da tela de login do ai-pkm. Base para a tela de login do hiring pipeline.
- `/home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/screen.png` — Screenshot de referência do login.

### Componentes de Referência (ai-pkm)
- `/home/henrico/github/henricos/ai-pkm/src/components/login-form.tsx` — Formulário de login com validação de callback, estados de erro e estilos.
- `/home/henrico/github/henricos/ai-pkm/src/app/(auth)/login/page.tsx` — Página de login completa com layout e footer.
- `/home/henrico/github/henricos/ai-pkm/src/components/shell/app-shell.tsx` — Shell com sidebar colapsável, lógica de toggle e surface hierarchy.
- `/home/henrico/github/henricos/ai-pkm/src/components/shell/left-rail.tsx` — Rail esquerdo com filtro e árvore de navegação (adaptar para menu de seções do hiring pipeline).
- `/home/henrico/github/henricos/ai-pkm/src/lib/auth.ts` — Configuração next-auth Credentials (copiar e adaptar).
- `/home/henrico/github/henricos/ai-pkm/src/lib/base-path.ts` — Utilitário `normalizeBasePath` / `withBasePath` (copiar integralmente).
- `/home/henrico/github/henricos/ai-pkm/src/lib/app-brand.ts` — Padrão de token de marca (adaptar para Hiring Pipeline).

### Infraestrutura de Referência (ai-pkm)
- `/home/henrico/github/henricos/ai-pkm/next.config.ts` — Configuração Next.js com base path, standalone output, env vars de build.
- `/home/henrico/github/henricos/ai-pkm/Dockerfile` — Dockerfile multi-stage (base→deps→builder→runner). Adaptar volumes e env vars.
- `/home/henrico/github/henricos/ai-pkm/compose.yaml` — Estrutura do Compose com bind mounts e env vars. Adaptar para DATA_PATH.

### Requirements deste projeto
- `.planning/REQUIREMENTS.md` — APP-01, APP-02 (requirements desta fase).
- `.planning/PROJECT.md` — Constraints de stack, decisões de produto.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
Nenhum código existe ainda neste repo — projeto em fase zero de implementação.

Os ativos reutilizáveis estão no ai-pkm e devem ser portados/adaptados:
- `LoginForm` → copiar e adaptar placeholder de `curator_id` para campo username genérico
- `AppShell` + `LeftRail` → copiar estrutura, substituir `NavigationSnapshot` por menu simples de seções do hiring pipeline (Perfis, Vagas — itens desabilitados até Phase 2/4)
- `normalizeBasePath` / `withBasePath` → copiar integralmente (lógica é idêntica)
- `lib/auth.ts` → copiar e ajustar apenas nomes/mensagens
- `next.config.ts` → copiar e adaptar (remover dependências PKM-específicas)
- `globals.css` → copiar tokens de design (mesmos do DESIGN.md)
- `components.json` (shadcn/ui config) → copiar e ajustar `appDir` se necessário

### Established Patterns (do ai-pkm, a seguir aqui)
- **No-Line Rule:** separação por tonalidade de superfície, nunca por `border-1px`
- **Tonal layering:** `surface` → `surface-container-low` (rail) → `surface-container-lowest` (workspace/cards)
- **8px grid:** margens e paddings em múltiplos de 0.5rem
- **Glassmorphism:** nav bar com `blur(12px)` e opacidade parcial
- **Ambient shadows:** `box-shadow: 0 12px 40px rgba(43,52,55,0.06)` em elementos flutuantes
- **Inter exclusivo:** via `next/font/google`

### Integration Points
- Auth middleware protege todas as rotas (exceto `/login` e assets estáticos)
- `APP_BASE_PATH` prefixado em `next.config.ts` via `basePath`
- `DATA_PATH` acessado exclusivamente via camada de serviço (nunca hard-coded em componentes)
- Shell (`AppShell`) envolve todas as rotas autenticadas via `(shell)/layout.tsx`

</code_context>

<specifics>
## Specific Ideas

- **"Módulo do mesmo produto":** o usuário quer que qualquer pessoa familiarizada com o ai-pkm reconheça imediatamente o estilo. Não reinventar a roda visual — portar fiel e adaptar só o necessário.
- **Referências de tela:** usar `/home/henrico/github/henricos/ai-pkm/reference/ui/screens/01-login/` como base para criar `references/ui/screens/01-login/` neste projeto.
- **DESIGN.md:** criar `DESIGN.md` na raiz com o conteúdo do ai-pkm adaptado (substituir "PKM" por "Hiring Pipeline", "Digital Curator" pode permanecer como norte criativo).

</specifics>

<deferred>
## Deferred Ideas

- Pasta `references/ui/screens/` com mais telas além do login — será preenchida progressivamente nas Phases 2-4 quando as features forem desenhadas.
- Sidebar com itens desabilitados mostrando quais fases estão "em breve" — interessante, mas a decisão de apresentação exata fica para Phase 2.

</deferred>

---

*Phase: 01-foundation-authentication*
*Context gathered: 2026-04-19*
