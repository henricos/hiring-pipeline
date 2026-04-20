---
phase: 03-vacancy-gh-form
plan: "01"
subsystem: data-layer
tags: [vacancy, repository, types, adm-zip, badge, tdd]
dependency_graph:
  requires: []
  provides:
    - src/lib/vacancy.ts
    - src/lib/repositories/vacancy-repository.ts
    - src/components/ui/badge.tsx
  affects:
    - src/__tests__/vacancy.test.ts
    - src/__tests__/vacancy-repository.test.ts
tech_stack:
  added:
    - adm-zip@0.5.17
    - "@types/adm-zip@0.5.8"
    - Badge component (shadcn/ui)
  patterns:
    - Repository pattern (espelho de ProfileRepository)
    - vi.mock("@/lib/env") para testes de repositório
key_files:
  created:
    - src/lib/vacancy.ts
    - src/lib/repositories/vacancy-repository.ts
    - src/__tests__/vacancy.test.ts
    - src/__tests__/vacancy-repository.test.ts
    - src/components/ui/badge.tsx
  modified:
    - package.json
    - package-lock.json
decisions:
  - "adm-zip como única biblioteca para Excel — exceljs/xlsx excluídos por corromperem VML controls do template"
  - "findById propaga erro de vacancyPath() fora do try/catch para não suprimir proteção contra path traversal"
  - "vi.mock('@/lib/env') segue padrão estabelecido em data-service.test.ts"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-20"
  tasks_completed: 4
  files_created: 5
  files_modified: 2
  tests_added: 21
---

# Phase 03 Plan 01: Vacancy Data Layer — Schema, Repository e Dependências

**One-liner:** Camada de dados para vagas com 4 tipos union, interface Vacancy, JsonVacancyRepository (espelho do ProfileRepository) e instalação de adm-zip + Badge component.

---

## O Que Foi Construído

Fundação da fase 3: tipos TypeScript imutáveis para vagas, repositório JSON com proteção de path traversal, 21 testes passando, e dependências instaladas para as waves 2 e 3.

### Tipos criados (4 unions)

| Tipo | Valores |
|------|---------|
| `VacancyStatus` | "Aberta" \| "Em andamento" \| "Encerrada" |
| `RequestType` | "Recrutamento interno" \| "Recrutamento externo" |
| `WorkSchedule` | "Das 08h às 17h" \| "Das 09h às 18h" \| "Outro" |
| `WorkMode` | "Presencial" \| "Remoto" \| "Híbrido" |

### Métodos do repositório (4)

| Método | Comportamento |
|--------|--------------|
| `list()` | Retorna todas as vagas ordenadas por `openedAt` DESC |
| `findById(id)` | Retorna vaga ou `null` (propaga erro de ID inválido) |
| `save(vacancy)` | Persiste JSON com 2 espaços de indentação |
| `delete(id)` | Remove arquivo; idempotente se inexistente |

### Dependências instaladas

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| adm-zip | 0.5.17 | Geração do Excel GH (Wave 2 / Plano 03-02) |
| @types/adm-zip | 0.5.8 | Tipagem TypeScript para adm-zip |
| Badge (shadcn) | — | Exibição de status de vaga na UI (Wave 3) |

---

## Cobertura de Testes

**21 testes passando, 0 falhando, 0 pulados.**

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| vacancy.test.ts | 14 | generateVacancyId, createDefaultVacancy, 4 constantes |
| vacancy-repository.test.ts | 7 | save/findById, list ordenado, delete idempotente, path traversal |

---

## Desvios do Plano

### Problemas Auto-corrigidos

**1. [Rule 1 - Bug] findById suprimia erro de validação de ID inválido**
- **Encontrado em:** Tarefa 4 (execução dos testes)
- **Problema:** `findById` envolvia toda a lógica em try/catch genérico, capturando e silenciando o erro de path traversal lançado por `vacancyPath()`. O teste `vacancyPath lança erro se o ID contém '..'` falhou com "promise resolved null instead of rejecting".
- **Correção:** Movida a chamada `this.vacancyPath(id)` para fora do bloco try/catch, garantindo que erros de validação de ID propaguem normalmente enquanto apenas erros de I/O retornam null.
- **Arquivos modificados:** `src/lib/repositories/vacancy-repository.ts`
- **Commit:** 1dcd0f7 (incluído junto com os testes)

**2. [Rule 2 - Funcionalidade crítica] Mock de env para testes de repositório**
- **Encontrado em:** Tarefa 4 (execução inicial dos testes)
- **Problema:** `vacancy-repository.test.ts` falhava com `process.exit(1)` porque `@/lib/env` valida variáveis de ambiente na importação.
- **Correção:** Adicionado `vi.mock("@/lib/env", () => ({ env: { DATA_PATH: "/tmp/test-vacancy-repository" } }))` seguindo o padrão estabelecido em `data-service.test.ts`.
- **Arquivos modificados:** `src/__tests__/vacancy-repository.test.ts`
- **Commit:** 1dcd0f7

---

## Threat Surface Scan

Nenhuma superfície de segurança nova além do que já está na threat_model do plano.

A proteção T-03-01 (path traversal via ID de vaga) foi implementada em `vacancyPath()` conforme especificado e validada por teste unitário dedicado.

---

## Commits do Plano

| Task | Commit | Mensagem |
|------|--------|---------|
| 1 | 4b74e74 | chore(03-01): instalar adm-zip, @types/adm-zip e Badge component |
| 2 | 9a73b29 | feat(03-01): definir schema Vacancy e tipos union |
| 3 | 020d330 | feat(03-01): implementar VacancyRepository pattern |
| 4 | 1dcd0f7 | test(03-01): adicionar testes unitários para Vacancy schema e repository |

---

## Self-Check: PASSED

- [x] src/lib/vacancy.ts — criado e exporta 4 unions + interface + funções + constantes
- [x] src/lib/repositories/vacancy-repository.ts — criado com 4 métodos + singleton
- [x] src/__tests__/vacancy.test.ts — criado, 14 testes passando
- [x] src/__tests__/vacancy-repository.test.ts — criado, 7 testes passando
- [x] src/components/ui/badge.tsx — criado via shadcn
- [x] package.json — adm-zip@0.5.17 e @types/adm-zip@0.5.8 presentes
- [x] Commits 4b74e74, 9a73b29, 020d330, 1dcd0f7 existem no log
- [x] 21 testes passando, 0 falhando
- [x] exceljs e xlsx ausentes do package.json
