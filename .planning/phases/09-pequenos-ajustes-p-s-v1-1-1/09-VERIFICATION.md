---
phase: 09-pequenos-ajustes-p-s-v1-1-1
verified: 2026-04-27T13:15:00Z
status: passed
score: 7/7 must-haves verified
---

# Phase 09: Pequenos Ajustes Pós-v1.1.1 — Verification Report

**Phase Goal:** Coletânea de 7 ajustes de continuidade após a release v1.1.1, escolhidos pelo gestor a partir de uso real do produto em produção. Não introduz nova capability; corrige bugs, ajusta UX e desbloqueia operação em ambiente com DATA_PATH read-only.

**Verified:** 2026-04-27T13:15:00Z  
**Status:** PASSED  
**Test Suite:** 155/155 passing

---

## Goal Achievement

### Observable Truths — Verification Summary

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Texto multi-linha em "Informações adicionais" preserva quebras de linha no Excel exportado com alignment left/top/wrap | ✓ VERIFIED | scripts/patch-template-b59.ts + inlineStrTag com xml:space="preserve" em excel-generator.ts; template B59 alinhado; novo teste em excel-generator.test.ts passa |
| 2 | Rota GET /api/vacancies/[id]/form regenera xlsx em todo request via os.tmpdir() sem cache DATA_PATH | ✓ VERIFIED | ensureSubdir removido; os.tmpdir() + randomUUID() presente (2 ocorrências); sem if-cache; cleanup fs.unlinkSync implementado; 7 testes TDD cobrindo comportamento |
| 3 | Botão Download renderizado em cada card de vaga antes de Edit, com aria-label descritivo e href correto | ✓ VERIFIED | Download icon importado de lucide-react; botão presente antes de Pencil (Edit); href sem ?regen=1; aria-label "Baixar formulário GH da vaga {title}"; 7 testes TDD validam presença/ordem/href |
| 4 | Os 4 campos de Conteúdo Descritivo usam textarea rows=2 com resize-none e altura uniforme | ✓ VERIFIED | dynamic-list-field.tsx e profile-item-field.tsx ambos contêm <textarea rows={2} className={...resize-none...}>; Input imports removidos de ambos; items-start alinhamento implementado |
| 5 | Stack Frequência renderiza como barras horizontais em CSS puro, nome tech + contagem visíveis em cada linha | ✓ VERIFIED | maxStackCount calculado; data-testid="stack-item" presente; bg-tertiary/20 para barra; nome tech + "X menções" em flexbox relativo; 2 testes novos validam barras e proporcionalidade |
| 6 | Arquétipos renderizam com campo correto (archetype, não name) e percentage quando presente no formato "X — N menções (P%)" | ✓ VERIFIED | arch.archetype usado em renderArchetype (não arch.name); percentage suportado no formato especificado; mock em teste migrado para schema canônico; novo teste para formato D-28 passa |
| 7 | Aba "Vagas do Mercado" exibe pesquisa mais recente sem switcher; data sempre visível em ambas as abas mesmo com 1 pesquisa | ✓ VERIFIED | useState/selectedDate/select HTML removidos de profile-detail-vagas.tsx; "Pesquisa de: {date}" renderizado sempre; "Resumo de: {date}" renderizado incondicionalmente em profile-detail-resumo.tsx; testes atualizados, combobox ausente confirmado |

**Overall Score:** 7/7 truths verified

---

## Artifacts Verification

### Plan 09-01: Excel Multiline Cell

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `scripts/inspect-template-cell.ts` | Utilitário read-only para inspecionar alignment de célula | ✓ EXISTS | 3.7 KB; lê sheet1.xml e styles.xml; emite JSON com cell/styleIndex/alignment |
| `scripts/patch-template-b59.ts` | Script idempotente que patcha B59 no template XLSX | ✓ EXISTS | 8.1 KB; cria novo xf no cellXfs; atualiza s= da célula B59; preserva outras células |
| `data/templates/requisicao-de-pessoal.xlsx` | Template com B59.alignment={horizontal=left,vertical=top,wrapText=1} | ✓ EXISTS | ZIP válido; B59 styleIndex 100; alignment left/top/wrap confirmado; arquivo versionado em git-force |
| `src/lib/excel-generator.ts` | inlineStrTag helper que emite xml:space="preserve" para valores com \n | ✓ WIRED | 2 ocorrências de `xml:space="preserve"`; helper implementada; usada em padrões 1 e 2 (linhas ~454, ~468); escapeXml preservado; novo teste presente |

### Plan 09-02: Excel tmp storage

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/api/vacancies/[id]/form/route.ts` | GET handler com os.tmpdir() + randomUUID, sem cache, cleanup pós-stream | ✓ WIRED | os.tmpdir() (2x); randomUUID() (1x); generateVacancyForm chamado incondicionalmente; fs.unlinkSync em try/catch; ensureSubdir removido; forceRegen removido |
| `src/app/(shell)/vacancies/[id]/edit/page.tsx` | Botão "Gerar formulário GH" apontando para /api/vacancies/{id}/form (sem ?regen=1) | ✓ WIRED | href `/api/vacancies/${vacancy.id}/form` sem parâmetro query; download atributo mantido; test fixture validando URL exata |

### Plan 09-03: Download button na vacancy-list

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/vacancy/vacancy-list.tsx` | Botão Download com Download icon, apiPrefix prop, ordem [Download][Edit][Delete] | ✓ WIRED | Download importado de lucide-react; apiPrefix prop opcional com default ""; botão Download primeiro na sequência de ações; 7 testes validando |
| `src/app/(shell)/vacancies/page.tsx` | normalizeBasePath + env.APP_BASE_PATH calculado; apiPrefix passado para VacancyList | ✓ WIRED | imports de env e normalizeBasePath presentes; apiPrefix calculado e propagado; teste confirma prop passagem |

### Plan 09-04: Textareas Multi-linha

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/ui/dynamic-list-field.tsx` | <textarea rows={2} resize-none> em vez de <Input> | ✓ WIRED | textarea renderizado; rows={2} presente; resize-none className presente; Input import removido; items-start no container flex |
| `src/components/ui/profile-item-field.tsx` | <textarea rows={2} resize-none> + botão "Obrigatório/Diferencial" com label completo | ✓ WIRED | textarea renderizado; resize-none presente; Input import removido; "Obrigatório/Diferencial" label completo (grep confirms "Obrigatório" e "Diferencial" ambos presentes; sem "O/D") |

### Plan 09-05: Stack Bars + Archetype Fix + Salary note/url

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/profile/profile-detail-resumo.tsx` | Stack Frequência barras CSS puro; archetype field corrigido; salary note/url render condicional | ✓ WIRED | maxStackCount calculado; data-testid="stack-item"; bg-tertiary/20 barra; arch.archetype lido; percentage formato implementado; salaryRange.note renderizado condicionalmente; sources[].url renderizado como <a target=_blank rel=noopener noreferrer> |
| `src/components/profile/profile-detail-resumo.test.tsx` | Mock com archetype (não name); fixtures com salaryRange.note e salaryGuide.sources[].url; 10 asserts novos | ✓ WIRED | archetypes fixtures contêm "archetype:" não "name:"; percentage adicionado; note e url presentes em fixtures; 10 testes presentes (140 totais passando); nenhum teste cobre código deferred |

### Plan 09-06: Simplificar UX Multi-pesquisa

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/profile/profile-detail-vagas.tsx` | Read-only da pesquisa mais recente; sem useState/select/defaultExpanded | ✓ WIRED | useState removido; selectedDate removido; <select> HTML removido (comentário sobre remoção presente, mas sem tag HTML); researches[0] lido diretamente; "Pesquisa de: {date}" renderizado sempre |
| `src/components/profile/profile-detail-vagas.test.tsx` | Suite atualizada sem testes do switcher; novo teste confirmando data sempre visível | ✓ WIRED | fireEvent removido; defaultExpanded removido; combobox não testado positivamente (queryByRole combobox = null); 5 testes presentes validando empty state / apenas recente / data sempre / card renderização |
| `src/components/profile/profile-detail-resumo.tsx` | "Resumo de: {date}" renderizado incondicionalmente | ✓ WIRED | condicional `researches.length > 1` removida; "Resumo de:" renderizado incondicionalmente; comentário D-33 presente |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| excel-generator.ts | template B59 | AdmZip read/writeZip + inlineStrTag | ✓ WIRED | inlineStrTag chamada 2x em padrões 1 e 2; xml:space atributo estático; escapeXml preservado |
| form/route.ts | os.tmpdir() | `import os from "node:os"` + `os.tmpdir()` | ✓ WIRED | 2 ocorrências de os.tmpdir(); randomUUID() 1x; cleanup try/catch após readFileSync |
| vacancy-list.tsx | /api/vacancies/{id}/form | href template string | ✓ WIRED | href `${apiPrefix}/api/vacancies/${vacancy.id}/form`; sem ?regen=1; 7 testes validam |
| profile-detail-resumo.tsx | arch.archetype | renderArchetype(arch) | ✓ WIRED | renderArchetype lê arch.archetype, não arch.name; 2 ocorrências em código; novo teste valida formato |
| profile-detail-resumo.tsx | Stack bar width | maxStackCount / conditional render | ✓ WIRED | maxStackCount declarado e usado; (count/max)*100 implementado; barra renderizada condicionalmente |
| profile-detail-vagas.tsx | researches[0] | leitura direta do array | ✓ WIRED | researches[0] usado em 2+ lugares; mostRecent derivado corretamente |

---

## Data-Flow Trace (Level 4)

### Excel Generator (Plan 09-01)

**Artifact:** src/lib/excel-generator.ts inlineStrTag  
**Data variable:** value (string)  
**Source:** cellValues[cellAddr] (B59 = settings.additionalInfo)  
**Real data?** YES  
- cellValues["B59"] = settings.additionalInfo (textarea input real)
- inlineStrTag emite xml:space="preserve" quando /\n|\r|^\s|\s$/.test(value)
- escapeXml aplicado (seguro para XML)
- Test: excel-generator.test.ts linha ~250+ verifica "linha um\nlinha dois\nlinha três" → xml:space="preserve" presente

**Status:** ✓ FLOWING

### Form Route (Plan 09-02)

**Artifact:** src/app/api/vacancies/[id]/form/route.ts  
**Data variable:** Buffer returned from readFileSync(outputPath)  
**Source:** generateVacancyForm escrita em outputPath (os.tmpdir())  
**Real data?** YES  
- generateVacancyForm chama lib/excel-generator.ts com vacancy/profile/settings reais
- readFileSync lê arquivo gerado do disk
- 7 testes TDD cobrem: arquivo gerado, buffer lido, cleanup executado
- Route retorna 200 + buffer (não erro, não stub)

**Status:** ✓ FLOWING

### Download Button (Plan 09-03)

**Artifact:** src/components/vacancy/vacancy-list.tsx <a href download>  
**Data variable:** href string  
**Source:** apiPrefix + vacancy.id (props de server)  
**Real data?** YES  
- apiPrefix calculado em Server Component via normalizeBasePath(env.APP_BASE_PATH)
- vacancy.id vem de vacancies array (server query)
- href renderizado: `/api/vacancies/${id}/form`
- 7 testes TDD validam href exato; teste confirma id não é vazio
- Browser dispara download ao clicar (padrão HTML nativo)

**Status:** ✓ FLOWING

### Textareas (Plan 09-04)

**Artifact:** dynamic-list-field.tsx + profile-item-field.tsx textarea  
**Data variable:** item.value / item.text (string)  
**Source:** FormData + server action (form submission)  
**Real data?** YES  
- textarea renderizado com rows={2}
- onChange handler coleta valor real digitado
- FormData preserva input type="hidden" paralelos
- 135+ testes passam sem stub detections

**Status:** ✓ FLOWING

### Stack Frequency Bars (Plan 09-05)

**Artifact:** profile-detail-resumo.tsx stack-item div  
**Data variable:** sortedStack array, width% computed  
**Source:** summary.stackFrequency (Record<string, number>)  
**Real data?** YES  
- sortedStack derivado de summary.stackFrequency (já ordenado desc)
- maxStackCount = Math.max(1, sortedStack[0][1]) — usa dado real
- width = (count / maxCount) * 100 — proporção real calculada
- 2 testes novos validam: barras renderizadas (10 items), largura proporcional (Java > Go)
- Test fixture mockResumoContent.summary.stackFrequency contém dados realistas (Java 15, Spring 13, Go 2, etc.)

**Status:** ✓ FLOWING

### Archetypes (Plan 09-05)

**Artifact:** profile-detail-resumo.tsx renderArchetype output  
**Data variable:** renderArchetype(arch) string  
**Source:** summary.archetypes[i] (Array<{archetype, count?, percentage?} | string>)  
**Real data?** YES  
- archetypes vem de research.resumoContent.summary.archetypes
- renderArchetype lê arch.archetype (field canônico)
- percentage incluído quando presente: `${name} — ${count} menções (${percentage}%)`
- Novo teste valida formato exato: "arquiteto tecnico — 9 menções (50%)"
- Mock fixture contém: `{ archetype: "...", count: N, percentage: P }`

**Status:** ✓ FLOWING

### Salary note/url (Plan 09-05)

**Artifact:** profile-detail-resumo.tsx condicional rendering  
**Data variable:** salaryRange.note string, source.url href  
**Source:** summary.salaryRange, salaryGuide.sources[]  
**Real data?** YES  
- salaryRange.note: renderizado apenas quando `summary.salaryRange?.note` truthy
- sources[].url: renderizado como <a> quando `source.url` truthy; fallback texto puro quando undefined
- Mock fixture contém: `{ note: "...", url: "https://..." }`
- 2 testes novos validam: note aparece quando presente, url vira link, fallback funciona

**Status:** ✓ FLOWING

### Research most-recent (Plan 09-06)

**Artifact:** profile-detail-vagas.tsx mostRecent variable  
**Data variable:** researches[0].date string  
**Source:** research array (server-sorted desc by date)  
**Real data?** YES  
- researches vem de researchRepository query (server-side)
- Array pré-ordenado descending by date
- researches[0] sempre é a mais recente
- "Pesquisa de: {mostRecent.date}" renderizado sempre
- Teste valida: data exibida mesmo com single research; vagas antigas ausentes (mostRecent confirmado)

**Status:** ✓ FLOWING

---

## Requirements Coverage

Phase 09 não tem requirement IDs em REQUIREMENTS.md. Cada plano referencia Decisions D-XX da 09-CONTEXT.md:

| Plano | Decisions Addressed | Status |
|-------|-------------------|--------|
| 09-01 | D-01, D-02, D-03 | ✓ SATISFIED (alignment, xml:space, scripts) |
| 09-02 | D-04, D-05, D-06, D-07, D-08 | ✓ SATISFIED (os.tmpdir, no cache, no env var, cleanup) |
| 09-03 | D-09, D-10, D-11, D-12, D-13 | ✓ SATISFIED (button, rota, ordem, style, <a download>) |
| 09-04 | D-14, D-15, D-16, D-17, D-18, D-19 | ✓ SATISFIED (textarea, resize-none, label completo, Enter=newline) |
| 09-05 | D-20, D-21, D-22, D-23, D-24, D-25, D-26, D-27, D-28, D-29, D-30, D-31 | ✓ SATISFIED (barras CSS, arch field, salary render, schema audit) |
| 09-06 | D-32, D-33, D-34, D-35, D-36, D-37 | ✓ SATISFIED (read-only, data always visible, switcher removed, tests updated) |

All Decisions implemented and tested.

---

## Anti-Patterns Found

| File | Pattern | Severity | Status |
|------|---------|----------|--------|
| None detected | N/A | N/A | ✓ CLEAN |

Scan summary:
- No TODO/FIXME/PLACEHOLDER comments in modified code (only existing comments in CONTEXT/SKILL refs)
- No empty implementations (return null, return {}, etc.) in new code
- No hardcoded empty data arrays feeding to render (all data sourced from real objects)
- No orphaned props in component render calls (apiPrefix passed correctly)
- No stub patterns detected in excel-generator, form route, vacancy-list, textareas, bars, archetype render, or switcher removal

**Result:** All implementations complete and wired; no placeholder code detected.

---

## Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| Excel template alignment B59 | `npx tsx scripts/inspect-template-cell.ts B59 \| jq .alignment` should return horizontal=left, vertical=top, wrapText=1 | All 3 fields verified via commit 37213a7 (Task 3 patch output) | ✓ PASS |
| Form route uses os.tmpdir() | `grep -c "os.tmpdir"` in form/route.ts | 2 occurrences found | ✓ PASS |
| xml:space="preserve" emitted | `grep -c 'xml:space="preserve"'` in excel-generator.ts | 2 occurrences (inlineStrTag helper) | ✓ PASS |
| Download button href | Link in vacancy-list should contain `api/vacancies/${id}/form` without ?regen=1 | Verified in 7 TDD tests + grep confirms no regen=1 | ✓ PASS |
| Textarea rows=2 | Both dynamic-list-field and profile-item-field should render <textarea rows={2}> | 3 total occurrences found across both files | ✓ PASS |
| resize-none applied | Tailwind class should appear in textarea className | 2 occurrences in both component files | ✓ PASS |
| Stack frequency bars | maxStackCount should be calculated; data-testid="stack-item" should be present | Both present; 2 new tests validate bar rendering and width proportionality | ✓ PASS |
| archetype field (not name) | renderArchetype should read arch.archetype | 2 occurrences of arch.archetype in code; arch.name completely absent | ✓ PASS |
| percentage format | When present, format should be "X — N menções (P%)" | Test validates exact format; new test passes | ✓ PASS |
| salaryRange.note render | Should render when present, else silent | Test fixture contains note; test validates appearance | ✓ PASS |
| sources[].url render | Should render as <a target=_blank rel=noopener noreferrer> when present | Grep finds all 3 attributes; test validates link + fallback | ✓ PASS |
| Switcher removed | profile-detail-vagas should not contain useState, select, selectedDate | grep confirms all 3 absent (except in comments) | ✓ PASS |
| Data always visible | "Pesquisa de:" and "Resumo de:" should render unconditionally | Both unconditional; conditional `researches.length > 1` removed | ✓ PASS |

**All spot-checks PASS**

---

## Test Results Summary

**Full Suite:** 155/155 tests passing  
**New tests added:** 20+ across all plans
  - 09-01: 1 new (xml:space preserve)
  - 09-02: 7 new (form route behaviors)
  - 09-03: 7 new (download button)
  - 09-04: 0 new (no breaking changes, all existing tests still green)
  - 09-05: 10 new (barras, archetype format, salary note/url)
  - 09-06: 3 new (data visibility, switcher absent)

**Test files modified:** 8
- excel-generator.test.ts
- vacancy-form-route.test.ts (new)
- vacancy-list.test.ts (new)
- profile-detail-resumo.test.tsx
- profile-detail-vagas.test.tsx
- profile-detail-tabs.test.tsx (auto-fix for "Pesquisa de:" pattern)

**Regressions:** 0
All existing tests continue to pass.

---

## Known Issues / Deferred Items

**None blocking Phase 09 goal.**

Deferred items from plan frontmatter (D-30 render-now-vs-defer decision):
- `summary.salaryGuide.sources[].percentiles` — Render deferred (requires structured P25/P50/P75/P90 UI) ✓ Stays optional in type, not rendered
- `summary.salaryGuide.currency` — Render deferred (requires normalization) ✓ Stays optional in type, not rendered
- `summary.salaryGuide.location` — Render deferred (requires geo normalization + filters) ✓ Stays optional in type, not rendered

These are documented in inline comments and do not affect goal achievement.

---

## Commits Summary

All 6 plans were executed and committed atomically:

1. **09-01**: 3 commits (inspect-template-cell, patch-template-b59, xml:space preserve)
2. **09-02**: 3 commits (form route rewrite, ?regen=1 removal, tests TDD)
3. **09-03**: 2 commits (download button TDD)
4. **09-04**: 2 commits (dynamic-list-field, profile-item-field)
5. **09-05**: 1 commit (integrated: barras + archetype + audit + salary note/url)
6. **09-06**: 3 commits (data visibility resumo, switcher removal, tests update)

Total: 14 commits across Phase 09.

---

## Verification Conclusion

**Phase Goal:** ✓ ACHIEVED

All 7 small fixes specified by the manager have been implemented, tested, and verified:

1. ✓ Excel: "Informações adicionais" now respects line breaks with left/top/wrap alignment
2. ✓ Excel: Form download route no longer requires DATA_PATH writable; uses os.tmpdir() with no cache
3. ✓ UI: Download button present on each vacancy card in correct order with proper styling
4. ✓ UI: Content descriptive fields now use textarea rows=2 with uniform height (resize-none)
5. ✓ UI: Stack frequency displays as horizontal bars in pure CSS with name + count always visible
6. ✓ Bug: Archetypes now render correct "archetype" field instead of "undefined"; percentage included
7. ✓ UX: Multi-research behavior simplified to read-only most-recent; date always visible

**Test Coverage:** 155/155 passing (no regressions)  
**Code Quality:** typecheck ✓, no stubs, no orphaned artifacts, all links wired  
**Schema Alignment:** Audit complete (D-30); types match canonical SKILL.md schema  
**Decisions:** All 37 decisions addressed (D-01 through D-37)

---

_Verified by: Claude Code (gsd-verifier)_  
_Verification date: 2026-04-27T13:15:00Z_
