---
status: diagnosed
phase: 03-vacancy-gh-form
source: [03-VERIFICATION.md]
started: 2026-04-23T00:00:00Z
updated: 2026-04-23T00:00:00Z
---

## Current Test

Validação ponta a ponta realizada pelo operador em 2026-04-23.

## Tests

### 1. Download do formulário Excel GH
expected: GET /api/vacancies/[id]/form retorna arquivo .xlsx com dados da vaga preenchidos, checkboxes VML preservados e formatação original do template intacta
result: failed — preenchimento incorreto (muitos campos vazios ou em células erradas); basePath 404 corrigido mas conteúdo precisa de revisão completa

### 2. Criação de vaga end-to-end no browser
expected: Manager cria nova vaga em /vacancies/new, formulário salva com sucesso, redireciona para /vacancies, vaga aparece na lista com badge "Aberta"
result: passed

## Summary

total: 2
passed: 1
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

### GAP-01 — Remover botão de avanço de status da lista de vagas
status: failed
severity: minor
description: Botão ChevronRight que avança status diretamente na página /vacancies deve ser removido. Progressão de status deve acontecer somente na página de edição da vaga.
fix: Remover o bloco `{vacancy.status !== "Encerrada" && (<Button...advanceVacancyStatus...>)}` de vacancy-list.tsx e a importação de advanceVacancyStatus.

### GAP-02 — Refatorar controle de status na página de edição
status: failed
severity: minor
description: O botão "← Voltar" de status não dá feedback nem faz refresh. Preferência do operador: substituir por um dropdown de status (select com os 3 estados) no topo da página de edição, antes dos campos do formulário. A seção deve ser sempre visível (não condicional ao status atual).
fix: Adicionar um Select controlado com VacancyStatus no topo de edit/page.tsx (ou como componente Client separado) que chama uma action changeVacancyStatus(id, newStatus). Remover botão "← Voltar" atual.

### GAP-03 — Simplificar botões de geração do formulário GH
status: failed
severity: minor
description: Dois botões (Gerar / Regenerar) confusos. Preferência do operador: um único botão que internamente verifica se já existe cache e decide gerar ou regenerar. Label do botão: "Gerar formulário GH" (o usuário entende que receberá um download).
fix: Manter apenas um botão "Gerar formulário GH" que sempre chama `/api/vacancies/[id]/form?regen=1` (ou a rota inteligente). Remover botão "Regenerar" separado.

### GAP-04 — Mapeamento de campos do Excel incorreto (crítico)
status: failed
severity: critical
description: Muitos campos da vaga não foram preenchidos ou foram inseridos em células erradas no template .xlsx gerado. O mapeamento em excel-generator.ts precisa ser revisado completamente com referência a exemplos preenchidos manualmente.
fix: Criar atividade focada de revisão do mapeamento de campos: (1) ler arquivos em /data/examples/ como referência de posicionamento correto dos campos no template, (2) mapear cada campo da interface Vacancy para a célula/elemento XML correto no template requisicao-de-pessoal.xlsx, (3) atualizar excel-generator.ts e /planning/references/excel-form-fields.md com o mapeamento correto, (4) validar com geração real e inspeção humana do arquivo.
