# Phase 1: Foundation & Authentication - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 01-foundation-authentication
**Areas discussed:** Navegação, Login UX, Repositório de Dados, Docker/Env

---

## Navegação & Shell

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar lateral colapsável | Painel fixo à esquerda, alterna entre expandida e ícones. Padrão em apps de gestão. | ✓ |
| Top nav | Barra horizontal no topo. Mais simples, menos espaço para muitos itens. | |
| Sem nav por enquanto | Adiar navegação para Phase 2. | |

**User's choice:** Sidebar lateral colapsável
**Notes:** Usuário pediu para investigar o ai-pkm em `/home/henrico/github/henricos/ai-pkm` e seguir o mesmo visual e estilo. Quer tratar o hiring pipeline como outro módulo do mesmo produto. O ai-pkm já tem sidebar colapsável (`AppShell` + `LeftRail`), DESIGN.md e pasta `reference/ui/screens/` com referências HTML/PNG. Tudo isso deve ser portado/adaptado.

---

## Login UX

| Option | Description | Selected |
|--------|-------------|----------|
| "Hiring Pipeline" | Nome técnico direto, consistente com o repo. | ✓ |
| "HP \| Techne" | Nome contextualizado para a empresa. | |

**User's choice:** "Hiring Pipeline"
**Notes:** Mesmo estilo visual do ai-pkm. Adaptar apenas textos.

| Option | Description | Selected |
|--------|-------------|----------|
| Página placeholder / dashboard vazio | Redireciona para "/" com tela simples. Phase 2 substitui. | ✓ |
| Já vai para /profiles | Phase 1 define rota, Phase 2 implementa. | |
| Você decide | Claude escolhe. | |

**User's choice:** Página placeholder / dashboard vazio

---

## Repositório de Dados

| Option | Description | Selected |
|--------|-------------|----------|
| Repo git separado | Mesmo padrão do ai-pkm. Dados JSON versionados, sync via git. | ✓ |
| Volume Docker local apenas | Mais simples, sem sync automático. | |
| Ainda não decidi | Claude decide. | |

**User's choice:** Repo git separado

| Option | Description | Selected |
|--------|-------------|----------|
| Um arquivo por entidade | /data/profiles/{id}.json — fácil de versionar. | ✓ |
| Um arquivo por tipo (lista) | /data/profiles.json (array) — mais simples, conflitos de merge. | |

**User's choice:** Um arquivo por entidade

**Inicialização do diretório de dados:**
**User's choice:** (freeform) DATA_PATH é configurável via env var. A raiz deve existir no startup (app valida e recusa subir se não encontrar). Subpastas são criadas automaticamente pela app no primeiro acesso se não existirem. Em dev usa caminho local; em prod Docker usa `/data`.

---

## Docker / Env

| Option | Description | Selected |
|--------|-------------|----------|
| Arquivo .env.local | Mesmo padrão do ai-pkm. | ✓ |
| Variáveis no ambiente do host | Menos rastreável. | |
| Você decide | Claude segue ai-pkm. | |

**User's choice:** (freeform) Exatamente o mesmo padrão do ai-pkm: `.env.local` para dev, vars no compose para prod.

**Env vars selecionadas:**
- AUTH_USERNAME / AUTH_PASSWORD ✓
- NEXTAUTH_SECRET / NEXTAUTH_URL ✓
- APP_BASE_PATH ✓
- DATA_PATH ✓

---

## Claude's Discretion

- Estrutura exata de pastas em `src/`
- Nome do símbolo visual na tela de login (adaptar de "◈" ou usar outro)
- Conteúdo exato da página placeholder pós-login

## Deferred Ideas

- Telas de referência adicionais além do login — a cada fase futura
- Sidebar com itens "em breve" desabilitados — decisão visual para Phase 2
