---
phase: 3
slug: vacancy-gh-form
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + @testing-library/react 16.3.0 |
| **Config file** | `vitest.config.ts` (raiz do projeto) |
| **Quick run command** | `npx vitest run src/__tests__/vacancy.test.ts src/__tests__/excel-generator.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/vacancy.test.ts src/__tests__/excel-generator.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 3-types | W0 | 0 | VAG-01 | N/A | unit | `npx vitest run src/__tests__/vacancy.test.ts` | ❌ W0 | ⬜ pending |
| 3-vacancy-id | W0 | 0 | VAG-01 | N/A | unit | `npx vitest run src/__tests__/vacancy.test.ts` | ❌ W0 | ⬜ pending |
| 3-vacancy-repo | W0 | 0 | VAG-01, VAG-04 | Path traversal mitigado no ID | unit | `npx vitest run src/__tests__/vacancy-repository.test.ts` | ❌ W0 | ⬜ pending |
| 3-settings | W0 | 0 | VAG-01 | N/A | unit | `npx vitest run src/__tests__/settings.test.ts` | ❌ W0 | ⬜ pending |
| 3-escape-xml | W0 | 0 | VAG-03 | XML injection bloqueado | unit | `npx vitest run src/__tests__/excel-generator.test.ts` | ❌ W0 | ⬜ pending |
| 3-xlsx-zip | W0 | 0 | VAG-03 | N/A | unit (I/O) | `npx vitest run src/__tests__/excel-generator.test.ts` | ❌ W0 | ⬜ pending |
| 3-xlsx-value | W0 | 0 | VAG-03 | N/A | unit (I/O) | `npx vitest run src/__tests__/excel-generator.test.ts` | ❌ W0 | ⬜ pending |
| 3-vacancy-list | — | — | VAG-04 | N/A | unit | `npx vitest run src/__tests__/vacancy-repository.test.ts` | ❌ W0 | ⬜ pending |
| 3-skill-vag02 | — | — | VAG-02 | N/A | manual | — | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/vacancy.test.ts` — tipos union (VacancyStatus, RequestType, WorkMode, WorkSchedule), generateVacancyId (VAG-01)
- [ ] `src/__tests__/vacancy-repository.test.ts` — save, findById, list ordenada por data, path traversal check (VAG-01, VAG-04)
- [ ] `src/__tests__/settings.test.ts` — AreaSettings defaults, SettingsRepository leitura/escrita (VAG-01)
- [ ] `src/__tests__/excel-generator.test.ts` — escapeXml (VAG-03, segurança: XML injection), generateVacancyForm preserva membros ZIP, escreve valor em célula alvo (VAG-03)
- [ ] `npm install adm-zip && npm install --save-dev @types/adm-zip`
- [ ] `npx shadcn@latest add badge`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skill VAG-02 coleta dados em linguagem natural e grava JSON | VAG-02 | Skill externa — não é código da web app; executa no terminal do gestor | Executar skill `abrir-vaga` no Claude Code, fornecer dados, verificar JSON gerado em DATA_PATH/vacancies/ |
| Download do Excel gera arquivo válido abrível no Excel/Sheets | VAG-03 | Validação visual de formatação e checkboxes VML | Clicar "Gerar formulário GH" na tela da vaga, abrir o .xlsx baixado e confirmar checkboxes e formatação preservados |
| Ciclo de vida avança corretamente nos 3 estados | VAG-01, VAG-04 | UI flow que envolve múltiplas telas | Criar vaga → status "Aberta"; avançar → "Em andamento"; avançar → "Encerrada"; verificar badge e data_encerramento |
