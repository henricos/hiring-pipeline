---
phase: 03-vacancy-gh-form
plan: "05"
subsystem: excel-generator
tags: [excel, adm-zip, zipfile, xml, tdd, vag-03]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: [generateVacancyForm, escapeXml, AreaSettings]
  affects: []
tech_stack:
  added: [adm-zip@0.5.17, "@types/adm-zip@0.5.8"]
  patterns: [surgical-zipfile-edit, xml-escape, inlineStr-cell]
key_files:
  created:
    - src/lib/excel-generator.ts
    - src/lib/settings.ts
    - src/__tests__/excel-generator.test.ts
  modified: []
decisions:
  - "Abordagem cirúrgica via adm-zip: sheet1.xml modificado cirurgicamente, todos os outros membros do ZIP preservados (VML, ctrlProps, imagens)"
  - "Regex com flag 's' (dotAll) para tratar células com valor multi-linha existente (Pitfall 2 do RESEARCH.md)"
  - "settings.ts criado neste plan para permitir compilação TypeScript; idêntico ao do Plan 02 (merge sem conflito)"
metrics:
  duration: "~10 min"
  completed_date: "2026-04-20"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
  tests_added: 9
---

# Phase 03 Plan 05: Excel Generator (adm-zip) Summary

Gerador de formulário GH em Excel via edição cirúrgica de zipfile usando adm-zip. Implementa VAG-03 (geração de formulário .xlsx preenchido) sem usar exceljs ou SheetJS, preservando todos os controles VML/ctrlProps do template.

## What Was Built

### src/lib/excel-generator.ts

Módulo central do plano. Exporta duas funções:

- **`escapeXml(value: string): string`** — escapa os 5 caracteres especiais XML (`& < > " '`) para evitar corrupção do XML do sheet (T-03-05).
- **`generateVacancyForm(templatePath, outputPath, vacancy, profile, settings): void`** — lê o template como ZIP, extrai `xl/worksheets/sheet1.xml`, aplica substituições cirúrgicas de células para os 3 grupos de dados (perfil, vaga, configurações da área), e regrava o ZIP preservando todos os demais membros.

Implementação cobre dois padrões de célula do template:
- Padrão 1: célula vazia `<c r="D6" s="59"/>` → `<c r="D6" s="59" t="inlineStr"><is><t>valor</t></is></c>`
- Padrão 2: célula com valor existente `<c r="D6" s="59" t="s"><v>8</v></c>` → inline string com novo valor (trata shared strings pré-existentes no template, como "SDR" em D6)

### src/lib/settings.ts

Interface `AreaSettings` com campos comuns da área (managerName, godfather, immediateReport, mediateReport, teamComposition) e função `defaultSettings()`. Idêntico ao criado pelo Plan 02 — criado aqui para permitir compilação TypeScript no worktree isolado.

### src/__tests__/excel-generator.test.ts

9 testes unitários cobrindo:
- `escapeXml`: &, <>, aspas duplas, aspas simples, texto normal, múltiplos especiais
- `generateVacancyForm`: erro para template ausente, erro para ZIP sem sheet1.xml, geração com template real (skip gracioso se indisponível)

## Test Results

```
✓ escapeXml > escapa ampersand
✓ escapeXml > escapa less-than e greater-than
✓ escapeXml > escapa aspas duplas
✓ escapeXml > escapa aspas simples
✓ escapeXml > preserva texto normal sem alteração
✓ escapeXml > escapa múltiplos caracteres especiais
✓ generateVacancyForm > lança erro se template não existir
✓ generateVacancyForm > lança erro se sheet1.xml não estiver no ZIP
✓ generateVacancyForm > gera arquivo de saída se template existir

Test Files: 1 passed | Tests: 9 passed (9)
```

## Decisions Made

1. **adm-zip exclusivo para geração de Excel** — per D-11 e RESEARCH.md. exceljs e xlsx descartam VML/ctrlProps; abordagem cirúrgica preserva 121 arquivos do template intactos.
2. **Regex com flag `s` (dotAll)** — necessária para capturar células com valores multi-linha no XML (Padrão 2). Garante substituição correta de células com shared strings pré-existentes (Pitfall 2: "SDR" em D6).
3. **`t="inlineStr"` no atributo da célula** — forma correta no OOXML para células com string inline (verificado em runtime no RESEARCH.md). O plano sugeria apenas `<is><t>`, mas o padrão OOXML exige o atributo `t="inlineStr"` na tag `<c>`.
4. **settings.ts criado no worktree** — Plan 02 (Wave 2, paralelo) cria o mesmo arquivo. Criado aqui para evitar erros de compilação TypeScript no worktree isolado. Conteúdo idêntico ao do Plan 02 — merge sem conflito esperado.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] node_modules ausente no worktree**
- **Encontrado durante:** Task 1 (verificação TypeScript)
- **Problema:** Worktree não tinha `node_modules`; `tsc --noEmit` falhava com "Cannot find module 'adm-zip'"
- **Correção:** `npm install --prefer-offline` no diretório do worktree
- **Impacto:** Sem impacto em produção; worktrees precisam de instalação local

**2. [Rule 1 - Bug] `await` em callback síncrono do `it`**
- **Encontrado durante:** Task 2 (execução dos testes)
- **Problema:** `it("...", () => { await import(...) })` — esbuild rejeita `await` em função não-async
- **Correção:** Tornar o callback `async`
- **Commit:** 9b493b8

### Deferred Items (fora do escopo desta task)

**src/components/profile/profile-list.tsx (linha 30)** — erro de tipo TypeScript pré-existente (`TS2362`/`TS2363`: aritmética com tipo não-numérico). Presente no baseline antes desta task; não relacionado ao excel-generator.

## Known Stubs

Nenhum. O `CELL_MAPPING` usa endereços de célula propostos pelo RESEARCH.md (A2 da Assumptions Log). Conforme documentado na pesquisa, o mapeamento exato requer validação com o template real via script de diagnóstico. A implementação está correta dado o mapeamento; os valores serão escritos nas células corretas uma vez que o mapeamento seja confirmado.

## Threat Flags

Nenhum novo vetor de ataque identificado além do threat model do plano. As mitigações T-03-05 (escapeXml) e T-03-08 (validação de existência do template + erro claro) estão implementadas.

## Self-Check

- [x] `src/lib/excel-generator.ts` existe e exporta `escapeXml` e `generateVacancyForm`
- [x] `src/lib/settings.ts` existe e exporta `AreaSettings`
- [x] `src/__tests__/excel-generator.test.ts` existe com 9 testes passando
- [x] adm-zip@0.5.17 instalado
- [x] Nenhum import de exceljs ou xlsx no codebase
- [x] Sem erros TypeScript em `excel-generator.ts`
- [x] Commits: baa5c76 (feat), 9b493b8 (test)

## Self-Check: PASSED
