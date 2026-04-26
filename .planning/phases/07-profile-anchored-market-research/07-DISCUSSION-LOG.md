# Phase 7: Profile-Anchored Market Research - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 07-profile-anchored-market-research
**Areas discussed:** Como a skill recebe o perfil, Estrutura de arquivos, Pesquisa sem perfil (modo livre), Unificação das faixas salariais

---

## Como a skill recebe o perfil

| Option | Description | Selected |
|--------|-------------|----------|
| Skill lista profiles e o gestor escolhe | No Step 1, a skill lê DATA_PATH/profiles/*.json, exibe lista numerada (ID + título) e o gestor escolhe | ✓ |
| Gestor informa o profileId manualmente | A skill pede o profileId diretamente. Exige UUID disponível. | |
| Skill aceita título ou profileId | Match fuzzy nos profiles — mais flexível, mais complexo. | |

**User's choice:** Skill lista profiles e o gestor escolhe

---

### O que exibir na lista de perfis?

| Option | Description | Selected |
|--------|-------------|----------|
| ID (curto) + título + experienceLevel | 8 primeiros chars do UUID + título + nível. Ex: 'abc12345 \| Engenheiro Sênior \| 5-10 anos' | ✓ |
| Só título + experienceLevel | Mais limpo, mas pode ter títulos duplicados sem referência de ID | |

**User's choice:** ID curto + título + experienceLevel

---

## Estrutura de arquivos

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-pasta por perfil | DATA_PATH/research/{profileId}/{date}-vagas.json | ✓ |
| profileId no nome do arquivo | DATA_PATH/research/{profileId}-{date}-vagas.json (flat) | |

**User's choice:** Sub-pasta por perfil

---

### Arquivos legados (slug-based da Phase 5)

| Option | Description | Selected |
|--------|-------------|----------|
| Deixar como estão (sem migração) | Arquivos antigos ficam no lugar, skill nova ignora | |
| Migrar manualmente sob orientação da skill | Skill detecta legados e sugere ou executa mv | |
| Migração pontual manual sem envolvimento da skill | A skill opera 100% no padrão novo; migração é atividade avulsa | ✓ |

**User's choice:** Migração pontual manual (clarificação via "Other") — a skill não tem responsabilidade contínua de detectar/migrar legados; isso é feito uma única vez pelo gestor.

---

## Pesquisa sem perfil (modo livre)

| Option | Description | Selected |
|--------|-------------|----------|
| Não — sempre exige perfil | Sem perfil, a skill não roda. Fluxo exploratório: /criar-perfil → /pesquisar-mercado | ✓ |
| Sim — perfil é opcional | Perfil opcional com fallback para padrão slug antigo | |

**User's choice:** Não — sempre exige perfil

---

## Unificação das faixas salariais

| Option | Description | Selected |
|--------|-------------|----------|
| Salary das vagas é suficiente | Mantém salaryRange das vagas. salaryRange: null quando não encontrado. | |
| Absorver pesquisa de guias salariais | Adiciona step de Robert Half/Glassdoor/etc. Mais rico, mais lento. | ✓ |

**User's choice:** Absorver guias salariais — e também absorver as técnicas de scraping mais robustas do /atualizar-roles-map para a coleta de vagas. "Sobrevive o melhor dos dois."

---

### Step de guias salariais: obrigatório ou opcional?

| Option | Description | Selected |
|--------|-------------|----------|
| Opcional — gestor decide no Step 1 | Pergunta no escopo inicial, padrão: sim | |
| Sempre inclui (obrigatório no fluxo) | Roda sempre, mesmo em modo enxuto | ✓ |

**User's choice:** Sempre inclui — obrigatório

---

### Representação das duas fontes de salary no -resumo.json

| Option | Description | Selected |
|--------|-------------|----------|
| Campos separados | salaryRange (vagas) + salaryGuide (guias curados) com sources[] | ✓ |
| Campo unificado salaryRange | Merge das duas fontes, perde proveniência | |

**User's choice:** Campos separados para preservar atribuição de fonte

---

## Claude's Discretion

- Ordenação da lista de perfis no Step 1
- Número exato de queries por guia salarial
- Estrutura exata do array `sources` em `salaryGuide`
- Formatação do Step 1 (tabela vs. lista numerada simples)

## Deferred Ideas

- Atualização do `/refinar-perfil` para descobrir `-resumo.json` na nova estrutura de sub-pastas (pode ser um plano separado dentro da phase)
- Comparação longitudinal de pesquisas — habilitada pela estrutura de sub-pastas, mas fora de escopo agora
- Análise de força com salaryGuide no `/criar-perfil` (Phase 6 deferred) — revisar após Phase 7
