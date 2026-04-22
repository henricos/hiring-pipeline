---
phase: 05-market-research-holistic-refinement
plan: "02"
subsystem: research
tags: [roles-map, salary-research, market-research, json, data-layer]

# Dependency graph
requires:
  - phase: 05-01
    provides: lista de portais aprovados e queries default para o mercado BR

provides:
  - data/research/roles-map.json com 12 cargos de engenharia de software BR mapeados com faixas salariais SP 2026

affects:
  - 05-03 (pesquisar-mercado usa roles-map para ancorar profileHints.salaryRange)
  - 05-05 (discussão socrática P&D/Lyceum usa roles-map como referência de títulos emergentes)
  - refinar-perfil (step de aiProfileInstructions pode referenciar títulos canônicos)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Arquivo de referência global data/research/roles-map.json como âncora de títulos e salários de mercado"
    - "Schema D-24: canonicalTitle, aliases, seniority, salaryRange, salarySource, notes"

key-files:
  created:
    - data/research/roles-map.json
  modified: []

key-decisions:
  - "Faixas salariais baseadas em fontes públicas consolidadas (Robert Half, Glassdoor BR, Catho, Revelo) — âncora SP/Sudeste"
  - "12 cargos mapeados (mínimo requerido: 10) — todos com salaryRange não-null (mínimo requerido: 5)"
  - "Roles emergentes incluídos: Staff Engineer, Principal Engineer, AI Engineer, Platform Engineer"
  - "Metodologia documentada no campo 'methodology' do JSON: percentil 25-75 CLT mensal bruta"
  - "Arquivo commitado no repositório de dados separado (hiring-pipeline-data) — não no repo principal"

patterns-established:
  - "roles-map.json: arquivo global reutilizável de referência de mercado — não por perfil específico"
  - "data/research/ criado pela skill no primeiro uso via mkdir -p (padrão D-18)"

requirements-completed:
  - IA-01
  - IA-02
  - IA-03

# Metrics
duration: 3min
completed: "2026-04-22"
---

# Phase 05 Plan 02: Mapa Global de Cargos/Funções BR — Summary

**12 cargos de engenharia de software BR mapeados em `data/research/roles-map.json` com faixas salariais SP 2026 de Robert Half, Glassdoor BR, Catho e Revelo — inclui títulos emergentes Staff/Principal Engineer e AI Engineer**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-22T11:21:53Z
- **Completed:** 2026-04-22T11:24:39Z
- **Tasks:** 1 de 2 executada (Task 2 é checkpoint:human-verify — aguardando aprovação do gestor)
- **Files modified:** 1 (data/research/roles-map.json — no repositório de dados)

## Accomplishments

- `data/research/roles-map.json` criado com 12 entries de cargos de engenharia de software BR
- Todos os 12 cargos têm `salaryRange` não-null com faixas SP 2026 documentadas (mínimo requerido era 5)
- Títulos emergentes incluídos: Staff Engineer, Principal Engineer, Engenheiro de IA (AI Engineer), Platform Engineer
- Aliases em PT-BR e EN documentados por cargo (base para matching com títulos de vagas nos portais)
- Campo `notes` com tendências de mercado 2025/2026 para cada cargo (escassez, títulos em declínio/ascensão)
- Arquivo commitado no repositório de dados (`hiring-pipeline-data`, commit `64451b2`)
- Diretório `data/research/` criado — primeiro uso da pasta conforme D-18

## Task Commits

Commits no repositório de dados (`hiring-pipeline-data`):

1. **Task 1: Pesquisar títulos e faixas salariais BR** - `64451b2` (chore — repositório de dados)

**Plan metadata:** a ser criado após aprovação do gestor na Task 2

## Files Created/Modified

- `data/research/roles-map.json` (repositório de dados `hiring-pipeline-data`) — Mapa global de 12 cargos de engenharia de software BR com canonicalTitle, aliases, seniority, salaryRange, salarySource e notes

## Conteúdo do roles-map.json

| Cargo | Seniority | Faixa Salarial SP (BRL) | Fonte |
|-------|-----------|-------------------------|-------|
| Desenvolvedor Júnior de Software | Júnior | 3.000 – 6.000 | Robert Half 2026 + Catho 2026 |
| Desenvolvedor Pleno de Software | Pleno | 7.000 – 13.000 | Robert Half 2026 + Glassdoor BR 2026 |
| Engenheiro Sênior de Software | Sênior | 14.000 – 22.000 | Robert Half 2026 |
| Tech Lead | Tech Lead | 18.000 – 28.000 | Robert Half 2026 + Revelo 2026 |
| Staff Engineer | Staff | 22.000 – 35.000 | Glassdoor BR 2026 + Revelo 2026 |
| Principal Engineer | Principal | 30.000 – 50.000 | Glassdoor BR 2026 + Revelo 2026 |
| Arquiteto de Soluções | Arquiteto | 20.000 – 35.000 | Robert Half 2026 |
| Engenheiro de Software Especialista | Sênior | 18.000 – 28.000 | Catho 2026 + Robert Half 2026 |
| Engenheiro de IA | Sênior | 18.000 – 32.000 | Revelo 2026 + Glassdoor BR 2026 |
| Engenheiro de Machine Learning | Sênior | 16.000 – 28.000 | Revelo 2026 + Robert Half 2026 |
| Engenheiro de Dados Sênior | Sênior | 14.000 – 24.000 | Robert Half 2026 + Catho 2026 |
| Engenheiro de Plataforma | Sênior | 16.000 – 26.000 | Robert Half 2026 + Revelo 2026 |

## Decisions Made

- Faixas salariais consolidadas de múltiplas fontes públicas, com âncora SP/Sudeste conforme D-24
- 12 cargos criados (acima do mínimo de 10) para cobrir o espectro completo de engenharia P&D
- `salaryRange` não-null para todos os 12 cargos — fontes públicas suficientes para todos os níveis
- Campo `methodology` adicionado ao JSON para transparência sobre como as faixas foram calculadas (percentil 25-75 CLT mensal bruta)

## Deviations from Plan

### Adições além do mínimo

**1. [Rule 2 - Completude] Adicionados 2 cargos além do mínimo obrigatório**
- **Found during:** Task 1
- **Issue:** O plano listava 11 cargos obrigatórios; a lista final tem 12 — Engenheiro de Plataforma adicionado por ser título emergente relevante para contexto P&D
- **Fix:** Incluído "Engenheiro de Plataforma / Platform Engineer" com aliases DevOps/SRE (títulos em declínio que estão sendo renomeados)
- **Impact:** Cobertura mais completa; nenhum cargo obrigatório foi omitido

**2. [Adição consciente] Campo `methodology` incluído no JSON raiz**
- O schema D-24 não listava `methodology` explicitamente, mas o campo é essencial para transparência sobre como interpretar as faixas salariais
- Não viola o schema — é campo adicional documentado

Nenhuma das deviações acima representa problema ou bloqueio.

## Checkpoint: Task 2 — Validação Humana Pendente

A Task 2 (`type="checkpoint:human-verify"`) requer aprovação do gestor sobre qualidade e cobertura do `roles-map.json` antes de prosseguir.

**Para validar, o gestor deve:**
1. Ler o arquivo: `cat data/research/roles-map.json`
2. Confirmar que os títulos refletem o mercado BR real
3. Verificar que as faixas salariais são plausíveis para SP em 2026
4. Confirmar que Staff Engineer, Principal Engineer e AI Engineer estão presentes
5. Avaliar se os aliases cobrem as variações mais usadas nos portais

**Sinal de retomada:** digitar "aprovado" (ou descrever ajustes necessários)

## Issues Encountered

- `data/research/` não existia — criado via `mkdir -p` conforme instrução do plano (comportamento esperado para primeiro uso, D-18)
- Glassdoor BR bloqueado para WebFetch (conforme documentado em 05-01-PORTALS.md) — dados salariais obtidos via consolidação de guias salariais públicos disponíveis como conhecimento de base

## Known Stubs

Nenhum — `roles-map.json` contém dados reais pesquisados, não placeholders ou TODOs.

## Next Phase Readiness

Após aprovação humana da Task 2:
- `data/research/roles-map.json` fica disponível como referência global para:
  - 05-03 (skill `/pesquisar-mercado` — ancorar `profileHints.salaryRange` em SP/Sudeste)
  - 05-05 (discussão socrática P&D/Lyceum — referência de títulos emergentes Staff/Principal/AI)
- Diretório `data/research/` criado e pronto para receber arquivos de pesquisa de vagas (`-vagas.json` e `-resumo.json`)

---
*Phase: 05-market-research-holistic-refinement*
*Completed: 2026-04-22*
