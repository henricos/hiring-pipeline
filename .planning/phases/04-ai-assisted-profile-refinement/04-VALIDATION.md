---
phase: 4
slug: ai-assisted-profile-refinement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run typecheck` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green + manual skill validation
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-W0-01 | Wave 0 | 0 | D-01 | — | string[] types accepted | unit | `npm test -- profile.test.ts` | ✅ (update) | ⬜ pending |
| 04-W0-02 | Wave 0 | 0 | D-05 | — | serializeStringArray returns bullets | unit | `npm test -- excel-generator.test.ts` | ✅ (update) | ⬜ pending |
| 04-W0-03 | Wave 0 | 0 | D-14 | — | aiProfileInstructions field accepted | unit | `npm test -- settings.test.ts` | ✅ (update) | ⬜ pending |
| 04-W1-01 | Wave 1 | 1 | D-01 | — | profile.ts uses string[] | unit | `npm test && npm run typecheck` | ✅ | ⬜ pending |
| 04-W1-02 | Wave 1 | 1 | D-05 | — | Excel serializes string[] as bullets | unit | `npm test -- excel-generator.test.ts` | ✅ | ⬜ pending |
| 04-W1-03 | Wave 1 | 1 | D-04 | — | DynamicListField renders without errors | unit | `npm test && npm run typecheck` | ❌ W0 | ⬜ pending |
| 04-W1-04 | Wave 1 | 1 | D-14 | — | settings.ts has aiProfileInstructions | unit | `npm test -- settings.test.ts` | ✅ | ⬜ pending |
| 04-W2-01 | Wave 2 | 2 | IA-01, IA-02, IA-03 | — | skill lists profiles and suggests improvements | manual-only | — | N/A | ⬜ pending |
| 04-W2-02 | Wave 2 | 2 | D-18 | — | /abrir-vaga SKILL.md audited against schemas | manual-only | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/profile.test.ts` — update: 4 descriptive fields as `string[]` (responsibilities, qualifications, behaviors, challenges)
- [ ] `src/__tests__/excel-generator.test.ts` — add case: `serializeStringArray(["a","b"])` returns `"- a\n- b"`
- [ ] `src/__tests__/settings.test.ts` — add case: `AreaSettings` accepts `aiProfileInstructions?: string`

*Existing infrastructure covers all automated test requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/refinar-perfil` lists profiles, offers modality menu, generates AI suggestions | IA-01, IA-02 | CLI conversational skill — no automated test harness | Run `/refinar-perfil`, select a profile, choose modality 1, verify before/after is shown, accept one suggestion, confirm JSON is updated at `DATA_PATH/profiles/{id}.json` |
| AI suggestions use aiProfileInstructions context | IA-03 | Requires live AI agent execution | Set `aiProfileInstructions` in /settings, run `/refinar-perfil`, verify suggestions reflect the P&D/Lyceum context |
| `/abrir-vaga` runs real scenario end-to-end | D-18 | CLI skill requiring user interaction | Run `/abrir-vaga`, complete a full vacancy with a real profile, verify generated JSON at `DATA_PATH/vacancies/{id}.json` matches current Vacancy schema |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
