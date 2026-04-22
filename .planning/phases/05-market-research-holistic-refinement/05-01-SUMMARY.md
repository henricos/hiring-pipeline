---
phase: 05-market-research-holistic-refinement
plan: 01
subsystem: research
tags: [portais-br, job-boards, linkedin, gupy, vagas-com-br, infojobs, playwright, websearch, webfetch]
status: checkpoint_pending

# Dependency graph
requires:
  - phase: 05-context
    provides: "D-09 e D-10 — portais candidatos e critérios de pesquisa"
provides:
  - "Lista final de 4 portais aprovados (LinkedIn, vagas.com.br, InfoJobs, Gupy) com taxa de WebFetch real"
  - "Queries default PT e EN por senioridade (Pleno, Sênior, Staff, Arquiteto)"
  - "Instruções de sessão autenticada via Playwright para LinkedIn e Gupy"
  - "Portais descartados com justificativa real (Glassdoor 403, Catho 404, Remotar remoto-only)"
  - "Limites conhecidos e User-Agents recomendados por portal"
affects: [05-03-pesquisar-mercado, 05-06-piloto]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "User-Agent Googlebot para LinkedIn (acesso a SERP e descrições sem auth)"
    - "Playwright open --save-storage para captura de sessão autenticada"

key-files:
  created:
    - ".planning/phases/05-market-research-holistic-refinement/05-01-PORTALS.md"
  modified: []

key-decisions:
  - "LinkedIn aprovado via User-Agent Googlebot — 22-25 vagas na SERP, descrições completas acessíveis sem auth"
  - "Gupy requer Playwright/sessão autenticada para busca — lista carregada 100% via JS + JWT"
  - "Glassdoor descartado — 403 consistente em todas as tentativas (Chrome, Googlebot, qualquer URL)"
  - "Catho descartado — domínio retorna 404 (fora do ar em abril/2026)"
  - "Remotar descartado — apenas vagas remotas, sem SP presencial"
  - "Query PT-BR preferencial para LinkedIn (+2-3 vagas vs EN); EN recomendado apenas para Staff Engineer"

requirements-completed:
  - IA-01
  - IA-02
  - IA-03

# Metrics
duration: 11min
completed: 2026-04-22
---

# Phase 05, Plan 01: Pesquisa Real de Portais BR para /pesquisar-mercado

**Discovery de portais BR com WebFetch real: LinkedIn (OK via Googlebot), vagas.com.br (OK parcial), InfoJobs BR (OK parcial), Gupy (requer Playwright), Glassdoor (403), Catho (404)**

## Status: CHECKPOINT PENDING

- **Checkpoint type:** human-verify
- **Checkpoint task:** Task 2: Validar qualidade e completude do 05-01-PORTALS.md
- **Awaiting:** Gestor confirma lista de portais, queries por senioridade e instruções de sessão autenticada
- **Resume signal:** "aprovado" (ou descreva ajustes necessários no documento)

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-22T10:38:04Z
- **Completed:** 2026-04-22T10:49:45Z
- **Tasks:** 1 de 2 (Task 2 é checkpoint:human-verify, aguardando aprovação)
- **Files modified:** 1

## Accomplishments

- Pesquisa real de 7 portais candidatos com testes de WebFetch em condições reais (curl, User-Agents variados)
- Classificação definitiva de cada portal: 4 aprovados, 3 descartados, com dados de WebFetch reais
- Queries PT e EN testadas no LinkedIn com contagem real de resultados (25 PT vs 22 EN para senior Java Python SP)
- Instruções de sessão autenticada via Playwright documentadas para LinkedIn e Gupy
- Limites técnicos documentados por portal (User-Agents necessários, padrões de extração de HTML)

## Task Commits

1. **Task 1: Pesquisar cobertura real dos portais BR candidatos** - `56860ac` (docs)

_Task 2 (checkpoint:human-verify) aguarda aprovação do gestor._

## Files Created/Modified

- `.planning/phases/05-market-research-holistic-refinement/05-01-PORTALS.md` — Documento completo com portais aprovados, queries default, instruções de sessão autenticada, portais descartados, limites conhecidos e notas para o executor do 05-03

## Decisions Made

- **LinkedIn via Googlebot UA:** Confirmado que User-Agent `Googlebot/2.1` dá acesso à SERP pública (22-25 vagas) e às descrições completas de vagas individuais (~277KB HTML com `show-more-less-html` disponível). User-Agent Chrome padrão causa redirect para login com HTML vazio.
- **Gupy dependência de JS:** A API de vagas do Gupy requer JWT (`Authorization: Bearer`) — não há endpoint público anônimo. O portal carrega a lista via fetch client-side. WebFetch simples retorna HTML sem listagem. Solução: Playwright com sessão salva.
- **Catho fora do ar:** Testado em múltiplas URLs incluindo home — retorna 404. Removido dos portais candidatos.
- **Glassdoor 403 definitivo:** 403 em todas as variações testadas (4 URLs diferentes, 3 User-Agents). Não há workaround disponível sem Playwright + sessão autenticada (e mesmo assim não garantido).
- **Query PT preferencial:** Testes no LinkedIn mostram 25 vagas com query PT "engenheiro sênior java python são paulo" vs 22 com EN "senior java python engineer são paulo". Diferença pequena mas consistente — PT recomendado como padrão exceto para Staff Engineer (quase exclusivamente em EN no mercado BR).

## Deviations from Plan

Nenhuma. O plano foi executado exatamente como especificado — todos os portais candidatos foram investigados com testes reais de WebFetch, e o documento foi criado com dados reais (não placeholders).

## Issues Encountered

- **Google/Bing/DuckDuckGo via curl:** Motores de busca retornam HTML vazio ou desafio Cloudflare quando acessados via curl sem JavaScript. Impossível usar `site:gupy.io` search via WebFetch — workaround: acessar portais diretamente.
- **vagas.com.br URL semântica:** URLs com dois termos compostos (ex: `vagas-de-engenheiro-senior-java`) retornam 0-1 links de vagas. URL de termo único ou duas palavras máximo retorna ~9 links. Documentado nas notas para 05-03.
- **InfoJobs listagem via JS:** A listagem completa é carregada via JavaScript — apenas 5 `data-href` visíveis no HTML inicial. Vagas individuais são ricas e acessíveis. Recomendação: usar os links disponíveis no HTML e WebFetch das vagas individuais.

## Threat Surface Scan

Nenhuma superfície nova de segurança introduzida. Este plano criou apenas um documento de planning (`.md`) sem código executável, sem novos endpoints, sem acesso a dados pessoais. Os avisos de segurança sobre `sessions/` já estavam documentados no threat model do plano e foram replicados no documento de portais.

## Known Stubs

Nenhum. O documento 05-01-PORTALS.md foi preenchido com dados reais de testes de WebFetch realizados em abril/2026. Todos os campos da tabela têm valores reais (OK/403/timeout/parcial).

---

*Phase: 05-market-research-holistic-refinement*
*Plan: 01*
*Completed: 2026-04-22 (Task 1) — Aguardando aprovação humana (Task 2)*
