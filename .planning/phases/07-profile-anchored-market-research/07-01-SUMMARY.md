---
phase: "07"
plan: "01"
subsystem: skills
tags: [pesquisar-mercado, market-research, profile-anchored, salary-guide, skill-refactor]
dependency_graph:
  requires:
    - "06-01: criar-perfil skill (profiles/*.json como fonte de seleção)"
  provides:
    - "research/{profileId}/{date}-vagas.json com profileId como campo raiz"
    - "research/{profileId}/{date}-resumo.json com salaryRange + salaryGuide separados"
  affects:
    - ".agents/skills/pesquisar-mercado/SKILL.md"
    - ".claude/skills/pesquisar-mercado/SKILL.md (symlink — mesmo inode)"
    - ".cursor/skills/pesquisar-mercado/SKILL.md (symlink — mesmo inode)"
tech_stack:
  added: []
  patterns:
    - "Lista numerada com shortId|título|nível para seleção de perfil (pattern de criar-perfil adaptado)"
    - "UUID v4 regex validation antes de criar subdiretório"
    - "path.resolve + startsWith(profileDir + path.sep) para path traversal guard"
    - "finalBaseName com detecção de colisão de mesmo dia (-2, -3)"
    - "Cadeia de três níveis para Robert Half: PDF → calculadora Playwright → cobertura jornalística"
key_files:
  modified:
    - ".agents/skills/pesquisar-mercado/SKILL.md"
decisions:
  - "D-01 honrado: profileHints usa apenas os 4 campos descritivos do JobProfile"
  - "D-02 implementado: lista numerada com 8 chars UUID | título | experienceLevel"
  - "D-03 implementado: subpastas research/{profileId}/ para todos os arquivos gerados"
  - "D-04 implementado: colisão com finalBaseName (-2, -3 antes de -vagas/-resumo)"
  - "D-06 implementado: step de guias salariais obrigatório em toda execução"
  - "D-07 implementado: técnicas do /atualizar-roles-map absorvidas (RH 3 níveis, Glassdoor 403, outlier detection)"
  - "D-08 implementado: salaryRange (das vagas) e salaryGuide (dos guias) como campos separados"
  - "D-10 implementado: skill não referencia roles-map.json em nenhum ponto"
metrics:
  duration: "~25min"
  completed_date: "2026-04-26"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 07 Plan 01: Refatoração da Skill /pesquisar-mercado Summary

**One-liner:** Skill `/pesquisar-mercado` refatorada com ancoragem a perfil via lista numerada (Step 1 novo), subpastas `research/{profileId}/`, step obrigatório de guias salariais gerando `salaryGuide` separado de `salaryRange`, e técnicas de scraping do `/atualizar-roles-map` absorvidas.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Reescrever Step 1 — seleção de perfil por lista numerada | cd4d452 | .agents/skills/pesquisar-mercado/SKILL.md |
| 2 | Reescrever Steps 5 e 6 — subpastas por profileId e salaryGuide obrigatório | bbfdc2a | .agents/skills/pesquisar-mercado/SKILL.md |

## What Was Built

### Task 1 — Step 1 novo: seleção de perfil por lista numerada

O "Step 1: Coletar Escopo Conversacional" foi substituído pelo "Step 1: Selecionar Perfil". O novo fluxo:

1. Lê `DATA_PATH/profiles/*.json` via `node -e` com `readdirSync`
2. Exibe lista numerada: `{8 chars UUID} | {title} | {experienceLevel}`
3. Gestor seleciona por número — ID nunca digitado diretamente
4. Valida UUID v4 com regex antes de qualquer operação subsequente
5. Coleta escopo adicional (profundidade, porte, localização) — cargo e senioridade extraídos do perfil

Também atualizado:
- Frontmatter `description` reflete comportamento ancorado ao perfil
- Pre-Conditions: adicionada exigência de ao menos um perfil em `DATA_PATH/profiles/`
- Removidas todas as referências a `roles-map.json`

### Task 2 — Steps 5, 6, 7 e seções complementares reescritos

**Step 5 (novo):** "Salvar {date}-vagas.json na Subpasta do Perfil"
- 5.1: Calcula `finalBaseName` com detecção de colisão (loop `while fs.existsSync` → sufixo `-2`, `-3`)
- 5.2: Cria `DATA_PATH/research/{profileId}/` com `mkdirSync({ recursive: true })`
- 5.3: Salva vagas com validação `startsWith(profileDir + path.sep)` e `profileId` como campo raiz

**Step 6 (novo):** "Gerar Summary + profileHints + salaryGuide e Salvar {date}-resumo.json"
- 6.1–6.2: Geração de `summary` e `profileHints` (inalterados em essência)
- 6.3 (novo): Step obrigatório de guias salariais — cadeia completa:
  - Robert Half: PDF → Playwright calculadora → cobertura jornalística (Canaltech, OpiníaoRH, SEGS)
  - Glassdoor BR: WebSearch apenas (403 no WebFetch), Playwright como fallback
  - Catho: WebSearch — validação cruzada de ordem de magnitude
  - Revelo: WebSearch — pular se sem relatório específico
  - Fontes proibidas como âncora: `salario.com.br`, `meutudo.com.br`
  - Outlier detection: >50% acima das demais → verificar total comp vs CLT base
- 6.4: Salva resumo com `profileId`, `vagasFile`, `salaryGuide` e `salaryRange` como campos distintos

**Step 7 (novo):** Exibe `profileId`, caminhos com subpasta, e ambas as faixas salariais

**Notes atualizadas:** salaryRange null, salaryGuide null, fontes proibidas, outlier, Playwright reutilizado, profileId da lista nunca do gestor, subpasta automática, sem dependência de arquivo legado de roles

**Troubleshooting expandido:** "Nenhum perfil encontrado no Step 1", "Guias salariais não retornam dados"

**Related Skills atualizado:** adicionado `/criar-perfil` como prerequisito

## Decisions Made

- `finalBaseName` como variável em memória reutilizada nos Steps 5 e 6 (evita inconsistência entre os dois arquivos em caso de colisão)
- Path traversal guard usa `profileDir + path.sep` (não apenas `profileDir`) para evitar falsos positivos em diretórios com prefixo igual
- Mapeamento Robert Half preservado integralmente do `/atualizar-roles-map`: "Analista de Dados" → "Analista de BI", "Engenheiro de Dados" → não listado (Glassdoor como âncora primária)
- `salaryGuide: null` é valor válido quando nenhuma fonte retorna dado confiável — step é obrigatório como esforço de pesquisa, não como garantia de resultado

## Deviations from Plan

Nenhum — plano executado exatamente como escrito.

As notas de "Sem referência a roles-map.json" e do footer de metadata inicialmente continham o nome do arquivo legado como texto descritivo/changelog. Foram reescritas para não conter a string literal `roles-map.json`, mantendo o critério de verificação (`grep roles-map.json retorna vazio`) satisfeito.

## Known Stubs

Nenhum stub introduzido. O SKILL.md é documentação operacional — não há dados hardcoded fluindo para UI.

## Threat Flags

Nenhuma superfície nova além do que está no threat model do plano (T-07-01 a T-07-06), todos mitigados nas implementações:
- T-07-01: ID obtido da lista interna, nunca do input do gestor
- T-07-02: `startsWith(profileDir + path.sep)` antes de qualquer `writeFileSync`
- T-07-03: UUID v4 regex validado antes de `mkdirSync`
- T-07-06: instrução explícita de nunca chamar `browser_close`

## Self-Check: PASSED

- `.agents/skills/pesquisar-mercado/SKILL.md` existe e contém todas as mudanças esperadas
- Commit cd4d452 (Task 1): verificado em `git log`
- Commit bbfdc2a (Task 2): verificado em `git log`
- Symlinks `.claude/skills/pesquisar-mercado/SKILL.md` e `.cursor/skills/pesquisar-mercado/SKILL.md` apontam para o mesmo inode (3579172) — arquivo modificado propagado automaticamente
