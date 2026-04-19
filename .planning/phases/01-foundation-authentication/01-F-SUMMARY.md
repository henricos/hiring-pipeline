---
plan: 01-F
phase: 01-foundation-authentication
status: complete
completed: 2026-04-19
executor: orchestrator-inline (sub-agent bloqueado por permissão Bash)
---

# PLAN-F — Docker + Design Assets

## O que foi construído

Infraestrutura de deploy e assets de design para a Phase 1.

## Arquivos criados

| Arquivo | Propósito |
|---------|-----------|
| `Dockerfile` | Build multi-stage: base→deps→builder→runner, node:22-alpine, USER nextjs |
| `compose.yaml` | Compose dev com bind mount `DATA_HOST_PATH → /data` e 6 env vars |
| `.dockerignore` | Exclui .env, node_modules, .next, data-local do contexto Docker |
| `DESIGN.md` | Design system adaptado do ai-pkm (PKM → Hiring Pipeline) |
| `references/ui/screens/01-login/code.html` | Referência HTML da tela de login |
| `references/ui/screens/01-login/screen.png` | Screenshot de referência do login |
| `references/ui/screens/01-login/README.md` | Contexto para agentes de UI |

## Verificações

- `npm test -- container`: 3/3 GREEN (DOCKER-01, DOCKER-02)
- `npm test` (suite completa): 28/28 GREEN
- Dockerfile: USER nextjs ✓, EXPOSE 3000 ✓, standalone ✓, DATA_PATH ✓, AGENTS.md ✓
- .dockerignore: data-local ✓ (não pkm/index)
- DESIGN.md: sem "AI PKM" ✓, tokens de cor preservados ✓, Digital Curator mantido ✓

## Desvios do ai-pkm

- `Dockerfile`: removidas `ENV PKM_PATH` e `ENV INDEX_PATH` → `ENV DATA_PATH=/tmp/build/data`
- `Dockerfile`: removidos `COPY models` e `COPY reference` (PKM-específicos)
- `Dockerfile`: adicionado `COPY references` (referências UI do hiring-pipeline)
- `DESIGN.md`: substituições globais PKM → hiring; Cards PKM → Profile Panels

## Self-Check: PASSED
