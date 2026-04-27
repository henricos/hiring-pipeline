---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: "01"
subsystem: excel-generator
tags:
  - excel
  - template
  - alignment
  - xml
  - bug-fix
  - scripts

dependency_graph:
  requires: []
  provides:
    - scripts/inspect-template-cell.ts
    - scripts/patch-template-b59.ts
    - data/templates/requisicao-de-pessoal.xlsx (B59 alignment corrigido)
    - src/lib/excel-generator.ts (inlineStrTag com xml:space=preserve)
  affects:
    - src/__tests__/excel-generator.test.ts

tech_stack:
  added: []
  patterns:
    - adm-zip para leitura/escrita cirúrgica de XLSX sem recriar o ZIP
    - xml:space="preserve" em inlineStr para preservar quebras de linha no Excel
    - TDD: RED (teste de xml:space) → GREEN (helper inlineStrTag) → REFACTOR (limpeza de logs)
    - Patch idempotente de estilos XLSX via criação de novo xf no cellXfs

key_files:
  created:
    - scripts/inspect-template-cell.ts
    - scripts/patch-template-b59.ts
  modified:
    - data/templates/requisicao-de-pessoal.xlsx
    - src/lib/excel-generator.ts
    - src/__tests__/excel-generator.test.ts
    - src/test-setup.ts

decisions:
  - "D-01 implementado: B59 agora tem alignment horizontal=left, vertical=top, wrapText=1 no template"
  - "D-02 implementado: inlineStrTag emite xml:space=preserve quando valor contém \\n"
  - "Estratégia (b) no patch: styleIndex 53 era compartilhado por 35 células — novo xf (índice 100) criado apenas para B59"
  - "@vitest-environment node adicionado a excel-generator.test.ts: jsdom corrompe ZIP via Buffer polyfill"
  - "test-setup.ts tornado defensivo quanto ao window para compatibilidade com ambientes node e jsdom"

metrics:
  duration_seconds: 686
  completed_date: "2026-04-27"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 4
---

# Phase 09 Plan 01: Excel Multiline Cell — Summary

Correção do bug de multi-linha no campo "Informações adicionais" (B59): patch idempotente de alignment no template XLSX + helper `inlineStrTag` com `xml:space="preserve"` no gerador.

## O que foi feito

### Task 1 — Utilitário inspect-template-cell

Criado `scripts/inspect-template-cell.ts`: script read-only que abre o template via AdmZip, localiza a tag `<c r="ADDR">` em `sheet1.xml`, extrai o `styleIndex` via atributo `s=`, e imprime o `<alignment>` correspondente de `styles.xml` como JSON.

Baseline capturado antes do patch:
```json
{"cell":"B59","styleIndex":53,"alignment":{"horizontal":"center","vertical":"center","wrapText":""},"applyAlignment":"1"}
```

### Task 2 — Patch do template B59

Criado `scripts/patch-template-b59.ts`: script idempotente que corrige o estilo da célula B59.

Estratégia aplicada: o `styleIndex 53` era compartilhado por 35 células — não era possível mutá-lo in-place sem afetar outras células. Criado novo `xf` (índice 100) no final do `<cellXfs>` com `alignment horizontal="left" vertical="top" wrapText="1"`, e o atributo `s=` da célula B59 em `sheet1.xml` foi atualizado de `53` para `100`.

Estado final:
```json
{"cell":"B59","styleIndex":100,"alignment":{"horizontal":"left","vertical":"top","wrapText":"1"},"applyAlignment":"1"}
```

### Task 3 — xml:space="preserve" no gerador

Implementada a helper `inlineStrTag()` em `excel-generator.ts`:

```ts
const inlineStrTag = (val: string): string => {
  const escaped = escapeXml(val);
  const needsPreserve = /\n|\r|^\s|\s$/.test(val);
  const tAttr = needsPreserve ? ' xml:space="preserve"' : "";
  return `<is><t${tAttr}>${escaped}</t></is>`;
};
```

As duas ocorrências de `<is><t>${escapedValue}</t></is>` nos padrões 1 e 2 foram substituídas por `${inlineStrTag(value)}`. Campos com `\n` (responsibilities, qualifications, behaviors, challenges, additionalInfo) passam a emitir `xml:space="preserve"`, preservando quebras de linha no Excel.

Novo teste TDD adicionado a `excel-generator.test.ts` — gera XLSX com `additionalInfo: "linha um\nlinha dois\nlinha três"` e verifica que a célula B59 contém `<t xml:space="preserve">`.

## Deviações do Plano

### Auto-resolvidas

**1. [Regra 3 - Bloqueio] Ambiente jsdom do vitest corrompe arquivo ZIP**
- **Encontrado durante:** Task 3 (fase RED/GREEN do TDD)
- **Problema:** O vitest usa jsdom por padrão; o `jsdom` polyfill de `Buffer` interfere no `zip.writeZip()` do adm-zip, gerando arquivo ZIP com CRC32 inválido. O arquivo de saída tinha 15KB em vez de 189KB e o XML do sheet não podia ser lido.
- **Fix:** Adicionado `// @vitest-environment node` no início de `excel-generator.test.ts`. O arquivo `src/test-setup.ts` foi tornado defensivo com `if (typeof window !== "undefined")` para funcionar em ambos os ambientes.
- **Arquivos modificados:** `src/__tests__/excel-generator.test.ts`, `src/test-setup.ts`
- **Commits:** 37213a7

**2. [Regra 1 - Bug] data/ está no .gitignore da worktree**
- **Encontrado durante:** Task 2 (commit do template patchado)
- **Problema:** O `.gitignore` da worktree ignora `/data` (diretório de dados montado em produção), mas o template é um arquivo versionado.
- **Fix:** `git add -f data/templates/requisicao-de-pessoal.xlsx` para forçar inclusão do arquivo versionado.
- **Commits:** a2e6c55

## Verificação Final

| Critério | Status |
|---------|--------|
| `inspect-template-cell.ts B59` retorna alignment left/top/wrap | PASS |
| `patch-template-b59.ts` é idempotente (2ª execução: "nada a fazer") | PASS |
| Células B44, B48, B52, B56 não afetadas | PASS |
| `unzip -t` retorna "No errors detected" | PASS |
| `grep -c 'xml:space="preserve"' excel-generator.ts` >= 1 | PASS (2) |
| `grep -c 'inlineStrTag' excel-generator.ts` >= 3 | PASS (3) |
| Novo teste `preserva quebras de linha via xml:space=preserve` | PASS |
| Todos os testes existentes verdes | PASS (136/136) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

## Commits

| Hash | Mensagem |
|------|----------|
| 3126855 | feat(09-01): criar utilitário inspect-template-cell para verificar alignment de célula no template |
| a2e6c55 | feat(09-01): patchar styles.xml do template para B59 ter alignment left/top + wrapText |
| 37213a7 | feat(09-01): emitir xml:space=preserve no inlineStr para valores com quebras de linha |

## Known Stubs

Nenhum. Todos os campos implementados estão totalmente conectados.

## Threat Flags

Nenhuma superfície nova além do descrito no threat model do plano.

## Self-Check: PASSED
