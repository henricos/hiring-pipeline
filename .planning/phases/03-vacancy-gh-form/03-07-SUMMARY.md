---
plan: 03-07
phase: 03-vacancy-gh-form
status: partial
gap_closure: true
gaps_closed: [GAP-04]
tasks_completed: 2
tasks_total: 3
checkpoint_pending: human-verify
---

## O que foi construído

Fechamento do GAP-04 (crítico): CELL_MAPPING em `excel-generator.ts` corrigido com endereços de célula validados por inspeção via AdmZip dos exemplos preenchidos manualmente em `data/examples/`.

## Mudanças

### Arquivos modificados

- **`src/lib/excel-generator.ts`** — CELL_MAPPING atualizado com 29 endereços confirmados (fonte: `data/examples/*.xlsx` inspecionados em 2026-04-21). Removidos `requestType` e `experienceLevel` do mapeamento (são radio buttons visuais sem célula de input livre no template).
- **`src/__tests__/excel-generator.test.ts`** — Adicionado describe `validateCellMapping` com 5 testes que verificam escrita nas células-chave: `D6` (title), `H10` (managerName), `AD4` (quantity), `B44` (responsibilities), `B27` (teamComposition).
- **`.planning/references/excel-form-fields.md`** — Seção "Mapeamento Confirmado por Inspeção dos Exemplos" adicionada com tabela completa dos 29 campos mapeados.

### Principais correções de endereço

| Campo | Antes (estimado) | Depois (confirmado) |
|---|---|---|
| suggestedTitle | D8 | K8 |
| responsibilities | B43 | B44 |
| qualifications | B47 | B48 |
| behaviors | B50 | B52 |
| challenges | B54 | B56 |
| managerName | D22 | H10 |
| godfather | D23 | AD6 |
| quantity | D27 | AD4 |
| teamComposition | B59 | B27 |
| educationLevel | D12 | I31 |

## Testes

- 14/14 passando (`npx vitest run src/__tests__/excel-generator.test.ts`)
- 5 novos testes de validação de célula — todos passaram com template real disponível

## Checkpoint pendente

A Task 3 (verificação humana do formulário gerado) ainda aguarda execução manual:

1. Inicie o servidor: `npm run dev`
2. Acesse uma vaga existente → página de edição → clique em "Gerar formulário GH"
3. Abra o .xlsx baixado e verifique que os campos estão nas células corretas
4. Responda "aprovado" para concluir o plano, ou descreva os campos ainda errados

## Commits

- `fix(03-07): corrigir CELL_MAPPING com endereços confirmados via inspeção dos exemplos reais (GAP-04)`
