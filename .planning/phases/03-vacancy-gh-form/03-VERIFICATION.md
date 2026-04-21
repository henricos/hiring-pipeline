---
phase: 03-vacancy-gh-form
verified: 2026-04-21T12:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5
  gaps_closed:
    - "GAP-05: workSchedule checkbox (ctrlProp3/4) e campo condicional workScheduleOther implementados"
    - "GAP-06: campo openedAt → AH4 adicionado ao CELL_MAPPING com toExcelDate()"
    - "GAP-07: checkboxes VML workMode resetados antes de marcar via CHECKBOX_GROUPS"
    - "GAP-08: toExcelDate() exportada, todas as datas em DD/MM/YYYY"
    - "GAP-09: checkboxes VML experienceLevel resetados via allGroup antes de marcar"
    - "GAP-10: checkboxes VML englishLevel/spanishLevel resetados (inclui duplicados ctrlProp36/38/40)"
    - "GAP-11: layout side by side em edit/page.tsx (grid md:grid-cols-2), wrapper bg-surface-container-low em new/page.tsx"
    - "GAP-12: campos fixos migrados para AreaSettings; formulários de perfil e vaga removeram campos migrados; gerador lê de settings"
  gaps_remaining: []
  regressions:
    - "profile-list.tsx linha 30: b.updatedAt - a.updatedAt causa TS2362/2363 (string aritmética) — erro pré-existente não relacionado aos GAPs 05-12"
human_verification:
  - test: "Baixar formulário Excel de uma vaga existente após configurar settings"
    expected: "Arquivo requisicao-{id}.xlsx baixado, campos de texto preenchidos, checkboxes VML preservados com exatamente 1 opção marcada por grupo (workMode/workSchedule/requestType/experienceLevel/englishLevel/spanishLevel), datas em DD/MM/YYYY nas células K24 e AH4"
    why_human: "Requer template requisicao-de-pessoal.xlsx em DATA_PATH/templates/, sessão autenticada no browser, e inspeção manual do arquivo .xlsx gerado para confirmar VML, checkboxes e formatação de datas"
  - test: "Verificar formulário de settings com novos campos (GAP-12)"
    expected: "Página /settings exibe seções Idiomas, Infraestrutura e Dados Fixos da Vaga; ao salvar com inglês=Avançado + modalidade=Remoto, o Excel gerado marca checkbox Avançado/Remoto"
    why_human: "Comportamento de persistência + geração do Excel end-to-end requer browser com Next.js rodando e template disponível"
  - test: "Verificar que formulário de vaga não exibe mais campos migrados"
    expected: "Páginas /vacancies/new e /vacancies/{id}/edit não têm campos Centro de Custo, Horário de Trabalho, Modalidade, Disponibilidade para Viagens"
    why_human: "Verificação visual de formulário requer browser com Next.js rodando"
  - test: "Criar vaga via formulário web e verificar persistência"
    expected: "Vaga aparece na lista /vacancies após submissão com status Aberta, título do perfil, data de abertura e badge azul"
    why_human: "Comportamento end-to-end de formulário + redirecionamento + renderização da lista requer browser"
---

# Phase 03: Vacancy Opening & GH Form Generation — Verification Report (Re-verificação)

**Phase Goal:** Manager pode criar vagas, associar a perfis, e gerar o formulário GH pré-preenchido (.xlsx) para envio ao RH. Suporte a abertura via formulário web (VAG-01) ou agente conversacional (VAG-02).
**Verified:** 2026-04-21
**Status:** human_needed
**Re-verification:** Sim — após gap closure dos planos 03-08 a 03-12

---

## Contexto da Re-verificação

Esta re-verificação cobre os GAPs 05 a 12, todos fechados pelos planos 03-08 a 03-12:

- **GAP-05** (plano 03-10): workSchedule checkbox + campo Outro
- **GAP-06** (plano 03-08): campo Data AH4 com data de abertura
- **GAP-07** (plano 03-09): limpeza de resíduos VML em workMode
- **GAP-08** (plano 03-08): formatação DD/MM/YYYY em todas as datas
- **GAP-09** (plano 03-09): limpeza de resíduos VML em experienceLevel
- **GAP-10** (plano 03-09): limpeza de resíduos VML em englishLevel/spanishLevel
- **GAP-11** (plano 03-11): layout side by side nas páginas de vaga
- **GAP-12** (plano 03-12): migração de campos fixos para AreaSettings

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Manager pode criar vaga selecionando perfil e preenchendo dados específicos | VERIFIED | `new/page.tsx` carrega perfis; `VacancyForm` com ação `createVacancy`; campos migrados (costCenter, workMode, workSchedule, travelRequired) corretamente removidos do formulário de vaga |
| 2 | Manager pode fornecer dados via agente conversacional (`/abrir-vaga`) | VERIFIED | `.agents/skills/abrir-vaga/SKILL.md` (218 linhas) com fluxo de 6 passos; coleta dados Group 2; gera JSON em DATA_PATH/vacancies/ |
| 3 | Sistema gera formulário GH (.xlsx) com dados preenchidos e checkboxes corretos | VERIFIED (wiring + lógica verificados; runtime requer teste humano) | `excel-generator.ts`: `toExcelDate()` formatando DD/MM/YYYY; `openedAt → AH4`; `CHECKBOX_GROUPS` para 6 grupos (workSchedule/workMode/requestType/experienceLevel/englishLevel/spanishLevel); `applyCheckboxGroups()` reset total + mark correto; campos migrados lidos de `settings.*` |
| 4 | Manager pode listar vagas abertas com status atual | VERIFIED | `/vacancies` page + `VacancyList` com Badge por status; `vacancyRepository.list()` com dados reais |
| 5 | Manager pode acompanhar progressão de status das vagas | VERIFIED | `advanceVacancyStatus()` + `changeVacancyStatus()` em `actions/vacancy.ts`; `VacancyStatusSelect` na página de edição |

**Score:** 5/5 truths verified (programaticamente). Status human_needed para validação end-to-end de download + formulários.

---

## Gap Closure Verification (GAPs 05–12)

### GAP-05: workSchedule checkbox + campo Outro

| Item | Status | Evidence |
|------|--------|----------|
| `CHECKBOX_GROUPS.workSchedule` com ctrlProp3/ctrlProp4 | VERIFIED | `excel-generator.ts` linhas 92-99: grupo workSchedule definido, `allGroup: ["ctrlProp3", "ctrlProp4"]`, `"Outro": null` |
| `CELL_MAPPING.workScheduleOther = "Z18"` | VERIFIED | Linha 61: `workScheduleOther: "Z18"` com comentário GAP-05 |
| Z18 preenchida apenas quando `workSchedule === "Outro"` | VERIFIED | Linhas 316-318: `settings.workSchedule === "Outro" ? (settings.workScheduleOther ?? "") : ""` |
| Campo condicional no `settings-form.tsx` | VERIFIED | Linhas 332-347: `{workSchedule === "Outro" && (...)}`  com Input `name="workScheduleOther"` |
| `updateSettings` extrai workScheduleOther condicionalmente | VERIFIED | `actions/settings.ts` linhas 51-54: extração condicional |

### GAP-06: Campo Data (AH4) preenchido com data de abertura

| Item | Status | Evidence |
|------|--------|----------|
| `CELL_MAPPING.openedAt = "AH4"` | VERIFIED | `excel-generator.ts` linha 65: `openedAt: "AH4"` com comentário GAP-06 |
| `cellValues[CELL_MAPPING.openedAt] = toExcelDate(vacancy.openedAt)` | VERIFIED | Linha 298: `[CELL_MAPPING.openedAt]: toExcelDate(vacancy.openedAt)` |
| `openedAt` preenchido na criação da vaga | VERIFIED | `actions/vacancy.ts` linha 67: `openedAt: new Date().toISOString()` |

### GAP-07 + GAP-09 + GAP-10: Checkboxes VML com resíduos do template

| Grupo | allGroup (reset) | Status | Evidence |
|-------|-----------------|--------|----------|
| workMode | ctrlProp68/69/70 (Remoto+Híbrido eram CHECKED) | VERIFIED | `excel-generator.ts` linhas 196-204: reset total + mark de `settings.workMode` |
| workSchedule | ctrlProp3/4 (ctrlProp4 era CHECKED) | VERIFIED | Linhas 185-194: reset total + mark de `settings.workSchedule` |
| experienceLevel | ctrlProp13..17 (ctrlProp15+16 eram CHECKED) | VERIFIED | Linhas 213-219: reset total + mark de `profile.experienceLevel` |
| englishLevel | ctrlProp24..27 (ctrlProp25+26 eram CHECKED) | VERIFIED | Linhas 221-231: reset total + mark de `settings.englishLevel` |
| spanishLevel | ctrlProp28..31 + 36/38/40 (extras duplicados) | VERIFIED | Linhas 233-243: reset total (7 ctrlProps) + mark de `settings.spanishLevel` |
| requestType | ctrlProp5/6 | VERIFIED | Linhas 206-212: reset total + mark de `vacancy.requestType` (não migrado) |

### GAP-08: Formatação de datas DD/MM/YYYY

| Item | Status | Evidence |
|------|--------|----------|
| `toExcelDate()` exportada | VERIFIED | Linha 23: `export function toExcelDate(isoStr: string \| undefined \| null): string` |
| `expectedHireDate` usa `toExcelDate()` | VERIFIED | Linha 297: `toExcelDate(vacancy.expectedHireDate)` |
| `openedAt` usa `toExcelDate()` | VERIFIED | Linha 298: `toExcelDate(vacancy.openedAt)` |
| Lida com component de hora (T) | VERIFIED | Linhas 27-28: `isoStr.split("T")[0]` antes de partir por "-" |

### GAP-11: Layout side by side nas páginas de vaga

| Item | Status | Evidence |
|------|--------|----------|
| `edit/page.tsx` tem grid 2 colunas responsivo | VERIFIED | Linha 50: `grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/20` |
| Container com fundo sutil em `edit/page.tsx` | VERIFIED | Linha 41: `bg-surface-container-low rounded-md p-0` |
| `new/page.tsx` tem wrapper com fundo sutil | VERIFIED | Linha 19: `bg-surface-container-low rounded-md` |
| Sections antigas removidas de `edit/page.tsx` | VERIFIED | Grep por `<section` retorna 0 resultados — seções removidas |
| `VacancyStatusSelect` e botão GH no mesmo container | VERIFIED | Ambos dentro do `<div className="px-8 pb-8 pt-2">` após `<VacancyForm>` |

### GAP-12: Migração de campos fixos para AreaSettings

| Item | Status | Evidence |
|------|--------|----------|
| `AreaSettings` expandida com 10+ campos | VERIFIED | `settings.ts`: englishLevel, spanishLevel, otherLanguage, otherLanguageLevel, additionalInfo, systemsRequired, networkFolders, costCenter, workSchedule, workScheduleOther, travelRequired, workMode |
| Campos em `JobProfile` tornados opcionais | VERIFIED | `profile.ts` linhas 39-51: todos os 7 campos com `?` e comentário GAP-12 |
| Campos em `Vacancy` tornados opcionais | VERIFIED | `vacancy.ts` linhas 19-28: costCenter, workSchedule, workScheduleOther, travelRequired, workMode com `?` e comentário GAP-12 |
| `settings-form.tsx` tem novas seções | VERIFIED | 4 seções: Dados da Área, Idiomas, Infraestrutura, Dados Fixos da Vaga — todos os campos presentes |
| `vacancy-form.tsx` removeu campos migrados | VERIFIED | Apenas comentários residuais (ex: "costCenter migrado para Configurações da Área (GAP-12)") — nenhum campo JSX dos campos migrados |
| `profile-form.tsx` removeu campos migrados | VERIFIED | Grep retorna apenas comentários explicativos ("migrados para Configurações da Área (GAP-12)") |
| `excel-generator.ts` lê de `settings.*` | VERIFIED | Linhas 307-317: `settings.englishLevel`, `settings.spanishLevel`, `settings.costCenter`, `settings.travelRequired`, `settings.workMode`, `settings.workScheduleOther` |
| `actions/vacancy.ts` não extrai campos migrados | VERIFIED | Linhas 38+90: apenas comentários "migrado para AreaSettings (GAP-12)" — sem extração de FormData |
| `actions/profile.ts` não extrai campos migrados | VERIFIED | Linha 34: comentário "migrados para AreaSettings (GAP-12)" — campos não extraídos |
| `defaultSettings()` inclui valores padrão | VERIFIED | `settings.ts` linhas 37-57: englishLevel="Não exigido", workSchedule="Das 08h às 17h", workMode="Presencial", travelRequired=false, etc. |

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/vacancy.ts` | Interface Vacancy + tipos + funções | VERIFIED | 77 linhas, campos migrados marcados `?` com comentário GAP-12 |
| `src/lib/settings.ts` | AreaSettings expandida (15 campos) | VERIFIED | 57 linhas, 5 campos originais + 10 migrados (GAP-12), defaultSettings() com todos os novos |
| `src/lib/profile.ts` | JobProfile com campos migrados opcionais | VERIFIED | 97 linhas, 7 campos com `?` e comentário GAP-12 |
| `src/lib/excel-generator.ts` | toExcelDate + CHECKBOX_GROUPS 6 grupos + applyCheckboxGroups(settings) | VERIFIED | 369 linhas, todos os componentes do gap closure implementados |
| `src/app/actions/settings.ts` | updateSettings com todos os campos migrados | VERIFIED | 83 linhas, extrai 16 campos do FormData incluindo todos os migrados |
| `src/app/actions/vacancy.ts` | createVacancy/updateVacancy sem campos migrados | VERIFIED | campos migrados removidos das actions |
| `src/components/settings/settings-form.tsx` | 4 seções com campos migrados | VERIFIED | 386 linhas, seções Idiomas, Infraestrutura, Dados Fixos da Vaga |
| `src/components/vacancy/vacancy-form.tsx` | Formulário sem campos migrados | VERIFIED | 255 linhas, apenas comentários dos campos removidos |
| `src/app/(shell)/vacancies/[id]/edit/page.tsx` | Layout side by side (GAP-11) | VERIFIED | grid md:grid-cols-2 + bg-surface-container-low |
| `src/app/(shell)/vacancies/new/page.tsx` | Wrapper bg-surface-container-low | VERIFIED | Linha 19 confirmada |
| `.agents/skills/abrir-vaga/SKILL.md` | Skill VAG-02 | VERIFIED (inalterada) | 218 linhas, fluxo 6 passos |

---

## Key Link Verification (itens novos dos GAPs 05–12)

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `excel-generator.ts:applyCheckboxGroups` | `xl/ctrlProps/ctrlPropN.xml` | `setCtrlPropChecked(zip, cp, false)` para allGroup | WIRED | Todos os 6 grupos fazem reset total antes de marcar |
| `settings.workSchedule` | `ctrlProp3` ou `ctrlProp4` | `CHECKBOX_GROUPS.workSchedule.options` | WIRED | Linha 190: `target = group.options[settings.workSchedule]` |
| `settings.workSchedule === "Outro"` | `Z18` (CELL_MAPPING.workScheduleOther) | `settings.workScheduleOther ?? ""` | WIRED | Linhas 316-318: preenchimento condicional |
| `vacancy.openedAt` | `AH4` | `toExcelDate(vacancy.openedAt)` | WIRED | Linhas 65 + 298: CELL_MAPPING + cellValues |
| `settings.englishLevel` | `ctrlProp24..27` + `U37` | `CHECKBOX_GROUPS.englishLevel` + `CELL_MAPPING.englishLevel` | WIRED | Duplo: checkbox via applyCheckboxGroups + texto via cellValues |
| `settings.spanishLevel` | `ctrlProp28..31+36+38+40` + `U39` | `CHECKBOX_GROUPS.spanishLevel` + `CELL_MAPPING.spanishLevel` | WIRED | Duplo: 7 ctrlProps limpos + texto via cellValues |
| `settings-form.tsx` | `updateSettings` | `useActionState(onSubmitAction)` + `workSchedule === "Outro"` | WIRED | Estado controlado + campo condicional workScheduleOther |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `excel-generator.ts:generateVacancyForm` | `settings` | `settingsRepository.get()` → `DATA_PATH/settings.json` | Sim — lê arquivo JSON ou defaultSettings() | FLOWING |
| `settings-form.tsx` | `initialSettings` | `settingsRepository.get()` em server component `/settings/page.tsx` | Sim — lê `DATA_PATH/settings.json` ou defaults | FLOWING |
| `excel-generator.ts` (datas) | `toExcelDate(vacancy.openedAt)` | `vacancy.openedAt` (ISO 8601 persistido na criação) | Sim — openedAt definido em createVacancy como `new Date().toISOString()` | FLOWING |

---

## Behavioral Spot-Checks

Step 7b: Parcialmente verificável sem servidor.

| Behavior | Evidence | Status |
|----------|----------|--------|
| `toExcelDate("2026-04-21T10:30:00.000Z")` → "21/04/2026" | Lógica: split("T")[0] = "2026-04-21", split("-") = [2026,04,21], retorna `${day}/${month}/${year}` | PASS (estrutural) |
| `toExcelDate("2026-05-30")` → "30/05/2026" | Mesma lógica sem componente T | PASS (estrutural) |
| `toExcelDate(undefined)` → "" | Linha 25: `if (!isoStr) return ""` | PASS (estrutural) |
| workSchedule="Das 08h às 17h" → ctrlProp3 checked, ctrlProp4 unchecked, Z18="" | allGroup reset + options["Das 08h às 17h"]="ctrlProp3" + workScheduleOther condicional | PASS (estrutural) |
| workSchedule="Outro" + workScheduleOther="Das 07h30" → ctrlProp3+4 unchecked, Z18="Das 07h30" | options["Outro"]=null → nenhum mark; `workSchedule === "Outro" ? workScheduleOther : ""` | PASS (estrutural) |
| Campos migrados ausentes de VacancyForm | Grep retorna apenas comentários, sem campos JSX | PASS |
| Campos migrados presentes em SettingsForm | Grep retorna estados controlados + campos de formulário | PASS |
| TypeScript compila sem erros novos | `npx tsc --noEmit` mostra apenas 2 erros pré-existentes em `profile-list.tsx:30` (aritmética em string — não relacionado aos GAPs 05-12) | PASS (sem regressão nos GAPs) |

---

## Requirements Coverage

| Requirement | Source Plan | Descrição | Status | Evidence |
|-------------|------------|-----------|--------|----------|
| VAG-01 | 03-01, 03-02, 03-03, 03-10, 03-11, 03-12 | Gestor pode abrir vaga selecionando perfil com dados específicos | SATISFIED | VacancyForm com campos corretos (sem migrados); createVacancy/updateVacancy persistem sem campos migrados; ação funcional |
| VAG-02 | 03-04 | Gestor pode fornecer dados em linguagem natural via agente | SATISFIED | `.agents/skills/abrir-vaga/SKILL.md` inalterada e funcional |
| VAG-03 | 03-05, 03-08, 03-09, 03-10, 03-12 | Sistema gera formulário GH preenchido em .xlsx | SATISFIED (verificação funcional requer teste humano) | excel-generator.ts completo: datas DD/MM/YYYY, checkboxes VML sem resíduos, campos de settings, adm-zip cirúrgico |
| VAG-04 | 03-03 | Gestor pode listar e acompanhar vagas com status atual | SATISFIED | /vacancies page + Badge + advanceVacancyStatus + changeVacancyStatus |

**Nota:** REQUIREMENTS.md (traceability table) ainda lista VAG-01..04 como "Phase 4 | Pending" — inconsistência de documentação pré-existente, não é gap funcional.

---

## Anti-Patterns Found

| File | Padrão | Severidade | Impacto |
|------|--------|------------|---------|
| `src/components/profile/profile-list.tsx:30` | `b.updatedAt - a.updatedAt` — aritmética em string (updatedAt é string ISO) | Aviso | Causa erros TypeScript TS2362/TS2363; sort produz NaN em vez de ordem correta — bug pré-existente não relacionado aos GAPs 05-12 |

Nenhum stub novo encontrado nos arquivos dos GAPs 05-12. Todos os campos migrados têm implementação substantiva.

---

## Human Verification Required

### 1. Download do Formulário Excel GH com Checkboxes Corretos

**Test:** Configurar /settings com inglês=Avançado, modalidade=Remoto, horário=Das 09h às 18h. Abrir /vacancies/{id}/edit em vaga com requestType=Recrutamento interno e perfil com experienceLevel=3-5 anos → clicar em "Gerar formulário GH" → inspecionar .xlsx
**Expected:** 
- Célula AH4: data de abertura em DD/MM/YYYY
- Célula K24: data prevista em DD/MM/YYYY  
- ctrlProp24 (Avançado) checked; ctrlProp25/26/27 unchecked
- ctrlProp69 (Remoto) checked; ctrlProp68/70 unchecked
- ctrlProp4 (09h às 18h) checked; ctrlProp3 unchecked
- ctrlProp5 (Recrutamento interno) checked; ctrlProp6 unchecked
- ctrlProp15 (3-5 anos) checked; ctrlProp13/14/16/17 unchecked
**Why human:** Requer template real em DATA_PATH/templates/, servidor rodando, sessão autenticada, e inspeção manual do arquivo gerado para confirmar VML/ctrlProps

### 2. Verificação das Novas Seções de Settings (GAP-12)

**Test:** Acessar /settings → confirmar presença das seções Idiomas, Infraestrutura e Dados Fixos da Vaga → preencher campos → salvar → verificar que Excel gerado usa os valores salvos
**Expected:** Seções visíveis, campos salvos corretamente em settings.json, Excel reflete os valores
**Why human:** Comportamento end-to-end de formulário + persistência + geração Excel requer browser

### 3. Verificação da Ausência de Campos Migrados nos Formulários de Vaga e Perfil

**Test:** Acessar /vacancies/new e /profiles/new → confirmar que não há campos de Centro de Custo, Horário, Modalidade, Disponibilidade para Viagens (vaga) nem campos de Inglês, Espanhol, Infraestrutura (perfil)
**Expected:** Formulários simplificados sem os campos migrados
**Why human:** Verificação visual requer browser

### 4. Criação de Vaga via Formulário Web (end-to-end)

**Test:** Navegar para /vacancies/new → selecionar perfil → preencher campos → salvar → confirmar vaga na lista
**Expected:** Vaga aparece em /vacancies com status "Aberta", badge azul, data de abertura correta
**Why human:** Comportamento de redirecionamento + renderização requer browser com Next.js rodando

---

## Gaps Summary

Nenhum gap funcional identificado nos GAPs 05-12. Todas as implementações existem, são substantivas e estão corretamente conectadas.

**Regressão identificada (pré-existente):** `profile-list.tsx:30` — aritmética em string para sort. Este erro existia antes dos GAPs 05-12 e não é introduzido por eles. Requer correção separada (substituir por `b.updatedAt.localeCompare(a.updatedAt)`).

---

_Verified: 2026-04-21_
_Verifier: Claude (gsd-verifier)_
