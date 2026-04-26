---
phase: "08"
plan: "01"
subsystem: market-research-frontend
tags: [tdd, red-phase, testing, research-repository, profile-detail]
dependency_graph:
  requires: []
  provides:
    - research-repository.test.ts (contrato RED para ResearchRepository)
    - profile-detail-tabs.test.tsx (contrato RED para componente de abas)
    - profile-detail-perfil.test.tsx (contrato RED para aba Perfil)
    - profile-detail-vagas.test.tsx (contrato RED para aba Vagas — VIZ-01, VIZ-03)
    - profile-detail-resumo.test.tsx (contrato RED para aba Resumo — VIZ-02)
    - page.test.tsx profiles/[id] (contrato RED para Server Component)
  affects:
    - vitest.config.ts (expandido para incluir src/**/*.test.tsx fora de src/__tests__/)
tech_stack:
  added: []
  patterns:
    - "Stubs RED com import direto de módulos inexistentes (falha em resolucao de import)"
    - "Mocks vitest para fs, next/navigation, server actions"
    - "Dynamic import apos mock setup para repositorios com dependencias"
key_files:
  created:
    - src/lib/repositories/research-repository.test.ts
    - src/components/profile/profile-detail-tabs.test.tsx
    - src/components/profile/profile-detail-perfil.test.tsx
    - src/components/profile/profile-detail-vagas.test.tsx
    - src/components/profile/profile-detail-resumo.test.tsx
    - src/app/(shell)/profiles/[id]/page.test.tsx
  modified:
    - vitest.config.ts
decisions:
  - "Usar import direto dos modulos inexistentes para RED genuino (import falha na resolucao)"
  - "Atualizar vitest.config.ts para incluir src/**/*.test.tsx alem de src/__tests__/"
  - "Mocks de fs via vi.mock('fs') para testes de repositorio sem tocar o filesystem"
metrics:
  duration: "~10 minutos"
  completed: "2026-04-26T18:53:49Z"
  tasks_completed: 3
  files_created: 6
  files_modified: 1
---

# Phase 8 Plan 01: RED Test Stubs para Market Research Frontend — Summary

**One-liner:** Stubs de teste em RED state para ResearchRepository e componentes de detalhe de perfil com abas (Vagas/Resumo/Perfil), cobrindo VIZ-01, VIZ-02 e VIZ-03 via importacao direta de modulos inexistentes.

## O que foi executado

Plano Wave 0 de Phase 8 — criacao de 6 arquivos de teste em RED state como contrato Nyquist antes de qualquer implementacao. Todos os testes falham porque os modulos que importam ainda nao existem.

## Tasks Executadas

| Task | Nome | Commit | Status |
|------|------|--------|--------|
| 01 | Stubs RED para ResearchRepository | 5f7f90a | Completo |
| 02 | Stubs RED para componentes ProfileDetail (4 arquivos) | b7b42cd | Completo |
| 03 | Stub RED para pagina /profiles/[id] (Server Component) | 563bffe | Completo |

## Arquivos Criados

### src/lib/repositories/research-repository.test.ts (206 linhas)

7 casos de teste cobrindo:
- `listByProfileId`: retorna pesquisas ordenadas por data DESC
- `listByProfileId`: consolida arquivos com sufixo -2 no mesmo dia
- `listByProfileId`: retorna [] quando diretorio nao existe (ENOENT)
- `listByProfileId`: rejeita profileId com path traversal "../" (T-08-01)
- `getVagas`: retorna JSON parseado do arquivo de vagas
- `getVagas`: retorna null quando arquivo nao existe
- `getResumo`: retorna JSON com todos os campos + null se nao existe (T-08-03)

### src/components/profile/profile-detail-tabs.test.tsx (75 linhas)

3 casos de teste:
- Renderiza 3 abas (Perfil, Vagas, Resumo de Mercado)
- Clicar em aba Vagas exibe conteudo de vagas
- Profile passado para ProfileDetailPerfil na aba Perfil

### src/components/profile/profile-detail-perfil.test.tsx (87 linhas)

5 casos de teste:
- Renderiza title e suggestedTitle
- Renderiza secao Responsabilidades quando nao vazia
- Omite secao Responsabilidades quando array vazio (D-04)
- Renderiza badges Obrigatorio/Desejavel para qualificacoes
- Botao Editar navega para /profiles/{id}/edit (D-02)

### src/components/profile/profile-detail-vagas.test.tsx (111 linhas)

5 casos de teste (VIZ-01, VIZ-03):
- Empty state quando researches[] vazio (D-07)
- Lista em ordem cronologica reversa (D-05)
- Click expande vagas inline (D-06)
- Selecionar data diferente via dropdown atualiza vagas (VIZ-03)
- Card de vaga exibe title, company, stack, snippet

### src/components/profile/profile-detail-resumo.test.tsx (139 linhas)

5 casos de teste (VIZ-02):
- Empty state quando researches[] vazio (D-12)
- stackFrequency ordenado por contagem decrescente (D-10)
- salaryGuide com atribuicao de fonte "Robert Half 2025" (D-11)
- Secoes commonTitles, commonBehaviors, commonChallenges (D-09)
- Archetypes ordenados por contagem decrescente (D-09)

### src/app/(shell)/profiles/[id]/page.test.tsx (147 linhas)

5 casos de teste:
- Renderiza com profile valido e researches
- Chama notFound() quando profile null
- Exibe profile.title como h1
- Renderiza sem erro com researches=[]
- Await params assincrono correto (Next.js 16 pattern)

## Deviations from Plan

### Desvio 1: vitest.config.ts atualizado para incluir testes fora de src/__tests__/

**Encontrado durante:** Task 01

**Problema:** O plano especificava paths como `src/lib/repositories/research-repository.test.ts` e `src/components/profile/*.test.tsx`, mas o `vitest.config.ts` original incluia apenas `src/__tests__/**`. Os arquivos seriam criados mas nao detectados pelo test runner.

**Correcao (Rule 3 — blocking issue):** Adicionado `src/**/*.test.ts` e `src/**/*.test.tsx` ao `include` do vitest.config.ts. A suite existente continua passando (109 testes, 11 arquivos em PASS).

**Arquivos modificados:** `vitest.config.ts`

**Commit:** 5f7f90a

## Verificacao final

```
Test Files  6 failed | 11 passed (17)
     Tests  109 passed (109)
```

- 6 arquivos novos em FAIL (RED state — modulos nao existem)
- 11 arquivos existentes em PASS (sem regressions)
- 109 testes existentes continuam passando

## Stubs Conhecidos

Nenhum stub de dados em producao — todos os arquivos sao exclusivamente de teste.

## Self-Check: PASSED

### Arquivos criados

- FOUND: src/lib/repositories/research-repository.test.ts
- FOUND: src/components/profile/profile-detail-tabs.test.tsx
- FOUND: src/components/profile/profile-detail-perfil.test.tsx
- FOUND: src/components/profile/profile-detail-vagas.test.tsx
- FOUND: src/components/profile/profile-detail-resumo.test.tsx
- FOUND: src/app/(shell)/profiles/[id]/page.test.tsx

### Commits verificados

- 5f7f90a — test(08-01): adicionar stubs RED para ResearchRepository
- b7b42cd — test(08-01): adicionar stubs RED para componentes ProfileDetail
- 563bffe — test(08-01): adicionar stubs RED para pagina /profiles/[id]
