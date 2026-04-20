# Hiring Pipeline

## What This Is

Ferramenta web interna de contratação para apoiar o processo seletivo da área de Pesquisa e Desenvolvimento do produto Lyceum (Techne). Cobre todo o ciclo: da abertura de vagas à decisão final sobre candidatos, com apoio de IA via agentes CLI. Uso pessoal do gestor da área, hospedado em infraestrutura própria.

## Core Value

Transformar um processo fragmentado em email e planilhas em um fluxo assistido, reaproveitável e rastreável — abrindo vagas mais rápido, triando candidatos com mais consistência e decidindo com mais confiança.

## Requirements

### Validated

- [x] Gestor pode cadastrar e manter perfis-base de vaga reutilizáveis — Validado em Phase 2 (2026-04-20)

### Active
- [ ] IA apoia criação e refinamento de perfis com sugestões de requisitos e descrições
- [ ] Gestor pode abrir uma vaga a partir de um perfil existente com dados complementares
- [ ] Sistema gera formulário preenchido da GH em Excel a partir da abertura de vaga
- [ ] Gestor pode registrar shortlists de candidatos recebidas da consultoria
- [ ] IA apoia triagem de candidatos com base nos critérios da vaga
- [ ] Gestor pode registrar entrevistas com anotações estruturadas via agente conversacional
- [ ] Gestor pode comparar candidatos e registrar decisão final

### Out of Scope

- Gestão contínua da equipe (avaliações, desempenho, carreira) — foco inicial é recrutamento
- Integração direta com Gupy ou outros ATS — export manual é suficiente para v1
- App mobile — web-first
- Multi-usuário — ferramenta pessoal do gestor
- Chat em tempo real com consultoria — email permanece para v1

## Context

O processo atual começa com o preenchimento de uma planilha Excel da área de Gestão Humana (GH) com campos administrativos e questionário reflexivo. Após envio por email à responsável pelo recrutamento (Werecruiter), há reunião de alinhamento, cadastro na Gupy e início da busca. Shortlists chegam por email em lotes de 4-6 currículos. O gestor analisa, decide quem avança e justifica recusas. Após entrevistas, registra percepções para comparação final.

Principais dores identificadas: retrabalho no preenchimento, questionário genérico para P&D, trocas por email não estruturadas, esforço na comparação de candidatos, ausência de biblioteca reutilizável de perfis.

O template Excel do formulário GH está disponível em `templates/requisicao-de-pessoal.xlsx`.

## Constraints

- **Tech Stack**: Next.js 16 + React 19 + TypeScript 5 + Tailwind 4 + shadcn/ui — replicado do projeto ai-pkm
- **Auth**: Single user via next-auth (usuário/senha em variáveis de ambiente)
- **Persistência**: JSON em repositório/volume separado montado em `/data`; sem banco relacional no v1
- **Deployment**: Docker multi-stage (node:22-alpine) + Compose; self-hosted em infraestrutura própria
- **Base path**: Configurável via `APP_BASE_PATH`, padrão `/hiring-pipeline`
- **IA v1**: Agentes CLI externos (Claude Code, Cursor, Codex CLI) via skills; sem integração nativa de LLM no v1
- **IA v2**: Agent SDK da Anthropic integrado nativamente (segunda onda)
- **Portabilidade**: Dados em JSON versionados no repo de dados — sincronização entre máquinas via git

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JSON files como persistência v1 | Portabilidade entre máquinas via git; SQLite seria binário não-diffável | — Pending |
| next-auth single-user por env | Proteção básica sem complexidade de multi-tenant; igual ao ai-pkm | — Pending |
| IA via CLI externo no v1 | Valida fluxos rapidamente sem complexidade de integração nativa | — Pending |
| Priorizar abertura de vagas e triagem | Maior dor operacional identificada; retorno mais rápido | — Pending |
| Stack replicado do ai-pkm | Reutiliza conhecimento e padrões já validados; acelera setup | — Pending |

## Evolution

Este documento evolui a cada transição de fase e marco de milestone.

**Após cada transição de fase** (via `/gsd-transition`):
1. Requirements invalidados? → Mover para Out of Scope com motivo
2. Requirements validados? → Mover para Validated com referência de fase
3. Novos requirements emergiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se houve deriva

**Após cada milestone** (via `/gsd-complete-milestone`):
1. Revisão completa de todas as seções
2. Core Value check — ainda é a prioridade certa?
3. Auditoria de Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual

---
*Last updated: 2026-04-20 after Phase 2 completion*
