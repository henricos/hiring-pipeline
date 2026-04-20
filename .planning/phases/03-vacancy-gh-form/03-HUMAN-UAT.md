---
status: partial
phase: 03-vacancy-gh-form
source: [03-VERIFICATION.md]
started: 2026-04-23T00:00:00Z
updated: 2026-04-23T00:00:00Z
---

## Current Test

[aguardando teste humano]

## Tests

### 1. Download do formulário Excel GH
expected: GET /api/vacancies/[id]/form retorna arquivo .xlsx com dados da vaga preenchidos, checkboxes VML preservados e formatação original do template intacta
result: [pending]

### 2. Criação de vaga end-to-end no browser
expected: Manager cria nova vaga em /vacancies/new, formulário salva com sucesso, redireciona para /vacancies, vaga aparece na lista com badge "Aberta"
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
