---
plan: "07-03"
phase: "07-profile-anchored-market-research"
status: complete
type: checkpoint
completed_at: "2026-04-26"
---

# Summary: 07-03 — Migração de Arquivos Legados de Pesquisa

## O que foi feito

Checkpoint de migração pontual executado pelo operador (assistido pelo agente). Todos os 4 pares de arquivos legados em `DATA_PATH/research/` foram movidos para as subpastas de perfil correspondentes.

## Arquivos migrados

| Arquivo legado (origem) | Perfil | Destino |
|---|---|---|
| `analista-dados-senior-2026-04-24-*.json` | Analista de Dados Sênior (`d7ca8373`) | `research/d7ca8373-.../2026-04-24-*.json` |
| `cientista-de-dados-2026-04-22-*.json` | Cientista de Dados (`7ceddc1d`) | `research/7ceddc1d-.../2026-04-22-*.json` |
| `desenvolvedor-java-senior-2026-04-24-*.json` | Desenvolvedor Java Sênior (`2386bf16`) | `research/2386bf16-.../2026-04-24-*.json` |
| `dev-frontend-senior-2026-04-25-*.json` | Desenvolvedor Frontend Sênior (`f12a81a0`) | `research/f12a81a0-.../2026-04-25-*.json` |

**Total migrado:** 4 pares (8 arquivos) — 100% dos arquivos legados

## Arquivos mantidos em research/ root

- `roles-map.json` — arquivo global de faixas salariais legado; mantido como referência histórica. Não será mais atualizado (substituído pelo campo `salaryGuide` nos `-resumo.json` por perfil).

## Arquivos sem migração necessária

Nenhum — todos os arquivos legados tinham perfil correspondente identificável.

## Estrutura final de DATA_PATH/research/

```
research/
├── 2386bf16-4519-409c-9188-45068255df75/   ← Desenvolvedor Java Sênior
│   ├── 2026-04-24-resumo.json
│   └── 2026-04-24-vagas.json
├── 7ceddc1d-ba42-46ea-9cbd-450ef1b61056/   ← Cientista de Dados
│   ├── 2026-04-22-resumo.json
│   └── 2026-04-22-vagas.json
├── d7ca8373-e960-49b5-af75-a915b5e467b3/   ← Analista de Dados Sênior
│   ├── 2026-04-24-resumo.json
│   └── 2026-04-24-vagas.json
├── f12a81a0-f546-41fe-950c-759eb64235f7/   ← Desenvolvedor Frontend Sênior
│   ├── 2026-04-25-resumo.json
│   └── 2026-04-25-vagas.json
└── roles-map.json                           ← legado, mantido como referência
```

## Observações

- Os resumos migrados não têm o campo `profileId` no JSON (foram criados antes da Phase 7) — comportamento esperado e aceito conforme D-05 do CONTEXT.md
- O `/refinar-perfil` (pós-Phase 7) exibirá esses arquivos com o prefixo UUID curto do perfil, sem a etiqueta `(legado)`, pois agora estão nas subpastas corretas
- O ambiente está pronto para as primeiras execuções do `/pesquisar-mercado` pós-Phase 7

## Self-Check: PASSED

- [x] Todos os pares de arquivos legados inventariados
- [x] 4/4 pares migrados para `research/{profileId}/`
- [x] Nenhum arquivo de vagas órfão (sem resumo correspondente)
- [x] Estrutura verificada com `find $DATA_PATH/research -name "*.json" | sort`
