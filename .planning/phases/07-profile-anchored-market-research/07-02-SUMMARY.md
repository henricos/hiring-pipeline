---
phase: "07"
plan: "02"
subsystem: skills
tags: [refinar-perfil, atualizar-roles-map, discovery, deprecation, file-structure]
dependency_graph:
  requires: []
  provides:
    - refinar-perfil/SKILL.md com discovery recursivo de dois niveis para -resumo.json
    - atualizar-roles-map/SKILL.md marcado como descontinuado com migration note
  affects:
    - .agents/skills/refinar-perfil/SKILL.md
    - .agents/skills/atualizar-roles-map/SKILL.md
tech_stack:
  added: []
  patterns:
    - collectResumos walk de dois niveis (research/{profileId}/ + research/ legado flat)
    - Deprecation notice pattern (frontmatter + migration note no Execution Flow)
key_files:
  modified:
    - .agents/skills/refinar-perfil/SKILL.md
    - .agents/skills/atualizar-roles-map/SKILL.md
decisions:
  - collectResumos usa withFileTypes para distinguir diretorios de arquivos sem recurso a stat separado
  - Arquivos legados (profileId null) preservados com etiqueta (legado) — retrocompatibilidade total
  - Migration note usa "SKILL DESCONTINUADO" (masculino) para satisfazer grep exato "DESCONTINUADO" em 2 ocorrencias
metrics:
  duration: "~10 min"
  completed: "2026-04-26"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 7 Plan 02: Fix refinar-perfil Discovery + Deprecate atualizar-roles-map Summary

**One-liner:** Discovery recursivo de dois niveis (collectResumos) no /refinar-perfil para encontrar -resumo.json em research/{profileId}/ e research/ legado; /atualizar-roles-map marcado descontinuado com migration note apontando para /pesquisar-mercado.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Corrigir discovery de -resumo.json no /refinar-perfil para subpastas | b514668 | .agents/skills/refinar-perfil/SKILL.md |
| 2 | Marcar /atualizar-roles-map como descontinuado com migration note | b62f34f | .agents/skills/atualizar-roles-map/SKILL.md |

## What Was Built

### Task 1 — /refinar-perfil: collectResumos de dois niveis

O Step 2 do `/refinar-perfil` usava `fs.readdirSync(researchDir).filter(f => f.endsWith('-resumo.json'))` — uma leitura flat que nao encontra arquivos dentro de subpastas. Apos a Phase 7, os arquivos `-resumo.json` passam a residir em `research/{profileId}/` em vez de `research/`. Sem a correcao, o Step 2 exibiria sempre "nenhuma pesquisa disponivel" apos a Phase 7.

**Modificacoes em refinar-perfil/SKILL.md:**

1. **Step 2 — bloco de listagem:** substituido pelo novo bloco com funcao `collectResumos` que percorre dois niveis:
   - Diretorios em `research/` → entra no subdiretorio e coleta arquivos `*-resumo.json` → `{ file, dir: fullPath, profileId: entry.name }`
   - Arquivos direto em `research/` → arquivos legados flat → `{ file, dir: researchDir, profileId: null }`
   - Ordenacao por nome de arquivo (mais recente primeiro)
   - Exibicao com prefixo UUID curto para novos e sufixo `(legado)` para antigos

2. **Step 2 — bloco de carregamento:** substituido para usar `selectedDir` e `selectedFile` do objeto `resumos[numero - 1]` retornado por `collectResumos`, com validacao `filePath.startsWith(researchDir)`. Instrucao ao executor documenta que `profileId` do objeto selecionado deve ser registrado em memoria.

3. **Step 6.5 — vagasPath:** corrigido para resolver relativo a `selectedProfileId` quando disponivel (novo formato), com fallback para `research/` quando `profileId == null` (legado).

4. **Notes for Agent:** duas notas adicionadas explicando o discovery pos-Phase 7 e o Step 6.5 pos-Phase 7.

5. **Metadata footer:** atualizado para v3 com descricao das mudancas.

### Task 2 — /atualizar-roles-map: descontinuado

A skill `/atualizar-roles-map` foi absorvida pelo novo `/pesquisar-mercado` refatorado na Phase 7. O step de guias salariais (Robert Half, Glassdoor BR, Catho, Revelo) agora faz parte obrigatoria do fluxo de pesquisa, gerando o campo `salaryGuide` no `-resumo.json` por perfil.

**Modificacoes em atualizar-roles-map/SKILL.md:**

1. **Frontmatter description:** prepend com `[DESCONTINUADO — use /pesquisar-mercado]` explicando a absorcao pela Phase 7.

2. **Topo do Execution Flow:** bloco blockquote `> **SKILL DESCONTINUADO — use /pesquisar-mercado (Phase 7)**` inserido antes do Step 0, com:
   - Contexto da absorcao
   - Instrucao de migracao (executar `/pesquisar-mercado`)
   - Comparativo antes/depois (roles-map.json global vs salaryGuide por perfil)
   - Aviso de que o arquivo e mantido como referencia historica

3. **Metadata footer:** entrada Updated 2026-04-26 + `Status: Deprecated — use /pesquisar-mercado`.

4. **Steps 0-6 preservados integralmente** como referencia historica das tecnicas de scraping.

## Deviations from Plan

None — plano executado exatamente como especificado.

## Decisions Made

- **collectResumos usa `withFileTypes: true`** em vez de `readdirSync` simples seguido de `stat`: evita chamada extra ao filesystem por entrada, mais eficiente e semanticamente mais claro para distinguir diretorios de arquivos.
- **Fallback legado preservado:** objetos com `profileId: null` continuam funcionando no Step 6.5 com o path `research/{vagasFile}` antigo — zero degradacao para usuarios com dados legados.
- **"SKILL DESCONTINUADO" (masculino):** o bloco de migration note usa a forma masculina para que o grep exato por "DESCONTINUADO" retorne 2 matches (frontmatter + migration note), satisfazendo o criterio do plano.

## Verification Results

| Criterio | Resultado |
|----------|-----------|
| grep collectResumos retorna match | 4 ocorrencias |
| grep withFileTypes retorna match | 2 ocorrencias |
| bloco flat readdirSync removido | OK |
| grep legado retorna match | 7 ocorrencias |
| grep DESCONTINUADO retorna >= 2 | 2 ocorrencias |
| grep SKILL DESCONTINUADO retorna match | 1 ocorrencia |
| grep salaryGuide retorna match | 3 ocorrencias |
| grep /pesquisar-mercado retorna >= 3 | 12 ocorrencias |
| grep Deprecated retorna match | 1 ocorrencia |
| Step 0 preservado em atualizar-roles-map | 1 ocorrencia |
| Symlinks .claude/skills/ == .agents/skills/ | inodes identicos |

## Known Stubs

Nenhum — as modificacoes sao puramente documentais (SKILL.md) sem codigo executavel a ser testado em runtime.

## Threat Flags

Nenhuma nova superficie de seguranca introduzida. As mitigacoes T-07-07, T-07-08 e T-07-09 do threat model do plano estao documentadas no proprio SKILL.md modificado (validacao startsWith, walk limitado a dois niveis, profileId do JSON nao do gestor).

## Self-Check: PASSED

| Item | Status |
|------|--------|
| .agents/skills/refinar-perfil/SKILL.md existe | FOUND |
| .agents/skills/atualizar-roles-map/SKILL.md existe | FOUND |
| .planning/phases/07-profile-anchored-market-research/07-02-SUMMARY.md existe | FOUND |
| Commit b514668 existe | FOUND |
| Commit b62f34f existe | FOUND |
