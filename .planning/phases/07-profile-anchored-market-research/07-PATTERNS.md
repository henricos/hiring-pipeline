# Phase 7: Profile-Anchored Market Research - Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 3 modified SKILL.md files
**Analogs found:** 3 / 3

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.agents/skills/pesquisar-mercado/SKILL.md` | skill (orchestrator) | request-response + file-I/O | `.agents/skills/criar-perfil/SKILL.md` + self (current version) | exact (self) + role-match (criar-perfil) |
| `.agents/skills/atualizar-roles-map/SKILL.md` | skill (deprecated) | N/A (deprecation notice) | `.agents/skills/pesquisar-mercado/SKILL.md` (header pattern) | role-match |
| `.agents/skills/refinar-perfil/SKILL.md` | skill (consumer) | file-I/O + request-response | `.agents/skills/criar-perfil/SKILL.md` (listing pattern) | role-match |

---

## Pattern Assignments

### `.agents/skills/pesquisar-mercado/SKILL.md` (skill, request-response + file-I/O)

**Primary analog:** Self (current `.agents/skills/pesquisar-mercado/SKILL.md`)
**Secondary analog:** `.agents/skills/criar-perfil/SKILL.md` (for profile listing and UUID validation patterns)
**Tertiary analog:** `.agents/skills/atualizar-roles-map/SKILL.md` (for salary guide scraping techniques to absorb)

---

#### Pattern 1 — SKILL.md frontmatter and header (copy from current pesquisar-mercado, lines 1-17)

```yaml
---
name: pesquisar-mercado
description: |
  [updated description reflecting profile-anchored behavior]
command: /pesquisar-mercado
---

# SKILL: Pesquisar Mercado

[updated intro paragraph]

## Pre-Conditions
```

The frontmatter `name`/`description`/`command` block and `## Pre-Conditions` section must be preserved in all skill files.

---

#### Pattern 2 — Step 0: Carregar Variáveis de Ambiente (identical across ALL skills)

**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` lines 29-44 (also identical in criar-perfil lines 32-52 and refinar-perfil lines 29-45)

```bash
if [ -z "$DATA_PATH" ]; then
  set -a && source .env.local && set +a
fi
```

Error message if still undefined:
```
Erro: DATA_PATH não encontrado em .env.local nem no ambiente.
Configure a variável e tente novamente.
```

**Apply to:** All three modified SKILL.md files. This block is immutable — copy verbatim.

---

#### Pattern 3 — Step 1 NEW: Listar perfis de DATA_PATH/profiles/*.json e exibir lista numerada

**Source:** `.agents/skills/criar-perfil/SKILL.md` (Step structure reference) + `.agents/skills/refinar-perfil/SKILL.md` lines 49-66 (listing pattern to adapt)

The new Step 1 replaces the current free-text scope collection with profile selection first, then scope collection. Copy the listing shell command from refinar-perfil Step 1:

```bash
source .env.local && ls "$DATA_PATH/profiles/"
```

Adapt the display format per D-02 (short UUID + title + experienceLevel):

```
Perfis disponíveis:
1. a1b2c3d4 | Engenheiro Sênior de Software | 5-10 anos
2. e5f6g7h8 | Cientista de Dados Pleno | 3-5 anos
3. i9j0k1l2 | Analista de Dados Sênior | 5-10 anos

Qual perfil você quer pesquisar? (número)
```

**Fields to extract from each profile JSON:** `id` (first 8 chars), `title`, `experienceLevel`.

**ID selection guard** — copy from refinar-perfil Step 1 (lines 64-65):
> Registrar o ID do perfil selecionado a partir da lista (NÃO aceitar ID digitado diretamente pelo gestor — usar somente IDs listados pelo `ls`).

---

#### Pattern 4 — UUID v4 validation before creating subdirectory

**Source:** `.agents/skills/criar-perfil/SKILL.md` Step 4 (lines 145-151) — UUID is generated there with `crypto.randomUUID()`. For pesquisar-mercado, the UUID comes from a profile file, so it must be validated before use as a directory name.

Validation pattern using Node.js (inline, no external dependency):

```bash
node -e '
const profileId = "{profileId}";
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(profileId)) {
  console.error("profileId inválido — não é UUID v4. Abortando.");
  process.exit(1);
}
console.log("UUID válido:", profileId);
'
```

Run this validation immediately after the user selects a profile, before any directory creation or file write.

---

#### Pattern 5 — Path traversal validation and directory creation (adapted for new subdirectory structure)

**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` Step 5, lines 259-292 (current pattern) + `.agents/skills/atualizar-roles-map/SKILL.md` Step 6, lines 316-329

Current pattern uses `DATA_PATH/research/{slug}-{date}-vagas.json`. New pattern uses `DATA_PATH/research/{profileId}/{date}-vagas.json`.

Adapt the path traversal check from the current pesquisar-mercado Step 5 (lines 282-287):

```bash
node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const profileId = "{profileId}";  // validated UUID v4
const date = "{YYYY-MM-DD}";
const fileName = date + "-vagas.json";
const profileDir = path.resolve(dataPath, "research", profileId);
const filePath = path.resolve(profileDir, fileName);

// Path traversal guard — must be inside research/{profileId}/
if (!filePath.startsWith(profileDir + path.sep)) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}

fs.mkdirSync(profileDir, { recursive: true });
// ... write file
console.log("Vagas salvas em:", filePath);
'
```

**Key change from current pattern:** `researchDir` becomes `profileDir = path.resolve(dataPath, "research", profileId)`. The UUID validation (Pattern 4) must run before this block.

---

#### Pattern 6 — File collision detection (same-day suffix -2, -3)

**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` Step 5 lines 257-263 and Notes lines 440-441

Current pattern description (copy to new Step):

```bash
# Check for collision — adapt path to new subdirectory structure
ls $DATA_PATH/research/{profileId}/{date}-vagas.json 2>/dev/null
```

If exists: use suffix `-2`, `-3`, etc. inserted BEFORE `-vagas.json` and `-resumo.json`.

Example (new format): `2026-04-26-2-vagas.json` and `2026-04-26-2-resumo.json`

The logic to determine the suffix in Node.js:

```javascript
let suffix = '';
let counter = 2;
let vagasPath = path.resolve(profileDir, date + '-vagas.json');
while (fs.existsSync(vagasPath)) {
  suffix = '-' + counter;
  vagasPath = path.resolve(profileDir, date + suffix + '-vagas.json');
  counter++;
}
const finalBaseName = date + suffix;
// Results in: {date}-vagas.json or {date}-2-vagas.json, etc.
```

---

#### Pattern 7 — node -e with single quotes for JSON save (universal rule)

**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` Notes lines 441-442 + `.agents/skills/atualizar-roles-map/SKILL.md` Notes lines 408-410 + `.agents/skills/criar-perfil/SKILL.md` Notes lines 263-266

All three existing skills share the same rule — copy verbatim to new pesquisar-mercado Notes:

> **node -e com aspas simples:** sempre usar aspas simples no shell ao invocar `node -e '...'`. Com aspas duplas, o bash interpreta `$` seguido de dígitos ou letras como variável de ambiente — `R$7k` vira `R.7k` silenciosamente, corrompendo os campos de notes e source.

---

#### Pattern 8 — Salary guide scraping techniques (absorbed from atualizar-roles-map)

**Source:** `.agents/skills/atualizar-roles-map/SKILL.md` Step 3, lines 112-243

The new salary guide step in pesquisar-mercado must absorb and preserve these techniques from atualizar-roles-map:

**Robert Half — three-tier access chain** (atualizar-roles-map Step 3, Fonte 1, lines 119-155):
1. `WebSearch: "robert half guia salarial TI {ano} download PDF filetype:pdf"` → `WebFetch` PDF if found
2. Playwright MCP at `https://www.roberthalf.com/br/pt/insights/guia-salarial/calculadora` → P25/P50/P75 per role
3. Fallback: `WebSearch: "robert half guia salarial TI {ano} {canonicalTitle} faixa salarial"` + journalism sites (Canaltech, OpiníaoRH, SEGS)

**Glassdoor BR — WebSearch only, Playwright as fallback** (atualizar-roles-map Step 3, Fonte 2, lines 157-185):
- Never `WebFetch` Glassdoor (returns 403)
- Primary: `WebSearch: "site:glassdoor.com.br salário {cargo} pleno sênior são paulo {ano}"`
- Fallback Playwright: `browser_navigate → https://www.glassdoor.com.br/Salários/{slug-do-cargo}-salário-SRCH_KO0,{n}.htm`
- Warning: snippets may label monthly salaries as "por ano" — trust "R$Xk–R$Yk/mês" field only

**Catho — WebSearch only, aggregated data** (atualizar-roles-map Step 3, Fonte 4, lines 199-208):
- `WebSearch: "catho pesquisa salarial {ano} {canonicalTitle}"`
- Data is national aggregate without seniority split — use as cross-validation only

**Revelo — low-confidence source** (atualizar-roles-map Step 3, Fonte 5, lines 211-219):
- `WebSearch: "revelo salary report {ano} {aliasEN} brazil"`
- Often returns Glassdoor pages about Revelo as a company, not salary data — skip if no report found

**Sources to avoid as salary anchors** (atualizar-roles-map Notes lines 403-406):
- `salario.com.br` — includes severance pay, inflates base salary
- `meutudo.com.br` — no published methodology, inconsistent values

**Outlier detection rule** (atualizar-roles-map Step 3, consolidation, lines 235-244):
- If one source returns values >50% above others, check if it cites total compensation (equity + bonus) instead of CLT base — discard if so

---

#### Pattern 9 — New salaryGuide field schema in -resumo.json

**Source:** CONTEXT.md D-08 — no existing analog in codebase (new field). Design from atualizar-roles-map schema (Step 4, lines 248-267).

```json
"salaryGuide": {
  "min": 10900,
  "max": 18200,
  "currency": "BRL",
  "location": "São Paulo / Sudeste",
  "sources": [
    {
      "portal": "Robert Half Guia Salarial TI",
      "year": 2026,
      "url": "https://www.roberthalf.com/br/pt/insights/guia-salarial",
      "percentiles": "P25=R$10.9k, P75=R$18.2k"
    },
    {
      "portal": "Glassdoor BR",
      "year": 2026,
      "url": "https://www.glassdoor.com.br/Salários/...",
      "percentiles": null
    }
  ]
}
```

`salaryGuide: null` when no guide returned reliable data. The existing `salaryRange` field (from job postings) is preserved unchanged alongside this new field.

---

#### Pattern 10 — Step 7 output display (adapt from current Step 7, lines 413-431)

The result display at the end must update file paths from `{slug}-{date}-*.json` to `{profileId}/{date}-*.json` and add salary guide summary. Copy the current structure and adapt:

```
Pesquisa concluída!

Perfil pesquisado: {title} ({experienceLevel}) — ID: {profileId}
Vagas coletadas: {N} ({M} filtradas por porte)
Portais usados: {lista}

Arquivos gerados:
  {DATA_PATH}/research/{profileId}/{date}-vagas.json
  {DATA_PATH}/research/{profileId}/{date}-resumo.json

Stack mais frequente: {top 3 do stackFrequency}
Faixa salarial (vagas): {salaryRange ou "não disponível"}
Faixa salarial (guias): {salaryGuide.min}–{salaryGuide.max} BRL [{fontes}] (ou "não disponível")
Arquétipos detectados: {archetypes[]}

Próxima ação sugerida:
  Execute /refinar-perfil e selecione a pesquisa acima quando solicitado
```

---

### `.agents/skills/atualizar-roles-map/SKILL.md` (deprecation notice)

**Analog:** Header/frontmatter pattern from any skill that references another — no direct analog exists. Use description field and top of file.

---

#### Pattern 11 — Deprecation notice structure

**Source:** No existing analog in codebase. Design based on frontmatter pattern from `.agents/skills/pesquisar-mercado/SKILL.md` lines 1-17.

The deprecation must be added in two places:

**1. Frontmatter `description` field** — prepend a deprecation line:

```yaml
---
name: atualizar-roles-map
description: |
  [DESCONTINUADO — use /pesquisar-mercado] Esta skill foi absorvida pelo
  /pesquisar-mercado (Phase 7). O step de guias salariais agora faz parte
  do fluxo de pesquisa de mercado, ancorado ao perfil selecionado.
  Ver migration note abaixo.
command: /atualizar-roles-map
---
```

**2. Top of `## Execution Flow` section** — add a migration block before Step 0:

```markdown
> **SKILL DESCONTINUADA (Phase 7)**
>
> Esta skill foi absorvida por `/pesquisar-mercado` a partir da Phase 7.
> O step de pesquisa em guias salariais (Robert Half, Glassdoor BR, Catho, Revelo)
> agora é um step obrigatório do `/pesquisar-mercado`, ancorado ao perfil selecionado.
>
> **Migração:** Execute `/pesquisar-mercado` — o step de guias salariais roda
> automaticamente após a coleta de vagas. O campo `salaryGuide` no `-resumo.json`
> substitui o `roles-map.json`.
>
> Este arquivo é mantido como referência histórica. Não executar esta skill
> para novos levantamentos.
```

---

### `.agents/skills/refinar-perfil/SKILL.md` (fix recursive file discovery)

**Analog:** Self (current refinar-perfil Step 2), lines 86-118

---

#### Pattern 12 — Current file discovery pattern (to be fixed)

**Source:** `.agents/skills/refinar-perfil/SKILL.md` Step 2, lines 88-118

The current Node.js block reads `research/` flat directory:

```javascript
const researchDir = path.join(process.env.DATA_PATH || './data', 'research');
const files = fs.readdirSync(researchDir)
  .filter(f => f.endsWith('-resumo.json'))
  .sort().reverse();
```

**Problem:** After Phase 7, `-resumo.json` files live in `research/{profileId}/` subdirectories, not at the root of `research/`. `readdirSync` is not recursive — it returns only entries at one level. Flat files named `{slug}-{date}-resumo.json` (legacy) at `research/` root still exist but new files are at `research/{uuid}/`.

---

#### Pattern 13 — Fixed recursive discovery pattern (replace lines 88-118 in refinar-perfil Step 2)

Replace the `files` construction block with a recursive walk that collects both legacy flat files and new subdirectory files, then displays them with enough context for the gestor to identify which profile each belongs to:

```javascript
const fs = require('fs');
const path = require('path');
const researchDir = path.join(process.env.DATA_PATH || './data', 'research');

function collectResumos(dir) {
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return results; }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Subdirectory — recurse one level (profile subdirs are UUID-named, depth 1)
      const sub = fs.readdirSync(fullPath, { withFileTypes: true }).catch?.() || [];
      let subEntries;
      try { subEntries = fs.readdirSync(fullPath, { withFileTypes: true }); }
      catch (e) { continue; }
      for (const subEntry of subEntries) {
        if (subEntry.isFile() && subEntry.name.endsWith('-resumo.json')) {
          results.push({ file: subEntry.name, dir: fullPath, profileId: entry.name });
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('-resumo.json')) {
      // Legacy flat file at research/ root
      results.push({ file: entry.name, dir: dir, profileId: null });
    }
  }
  return results.sort((a, b) => b.file.localeCompare(a.file)); // newest first
}

const resumos = collectResumos(researchDir);
```

Display format (using profileId prefix to disambiguate):

```
Pesquisas de mercado disponíveis:
1. a1b2c3d4 / 2026-04-26-resumo.json — hoje
2. a1b2c3d4 / 2026-04-22-resumo.json — 4 dias atrás
3. senior-pd-java-sp-2026-04-18-resumo.json — 8 dias atrás (legado)

Carregar pesquisa como contexto? (número ou Enter para pular)
```

When loading the selected file, the path must include the subdirectory:

```javascript
// filePath for new-format files:
const filePath = path.resolve(entry.dir, entry.file);
// Validate path is inside researchDir:
if (!filePath.startsWith(researchDir)) {
  console.error('Path inválido — abortando');
  process.exit(1);
}
console.log(fs.readFileSync(filePath, 'utf8'));
```

Similarly, when loading the vagas file in Step 6.5, `vagasFile` must be resolved relative to the same subdirectory (not `research/` root):

```bash
# Old pattern (Step 6.5, to be updated):
const vagasPath = path.join(process.env.DATA_PATH, 'research', '{vagasFile}');
# New pattern (Step 6.5, fixed):
const vagasPath = path.join(process.env.DATA_PATH, 'research', '{profileId}', '{vagasFile}');
```

The `profileId` for Step 6.5 comes from the `resumo.json` itself — the planner should verify if the new `resumo.json` schema includes a `profileId` field at the top level and if so, use it. If not, the planner should add it to the schema.

---

## Shared Patterns

### Step 0 — Carregar Variáveis de Ambiente
**Source:** All three existing skills (identical block)
**Apply to:** All three modified SKILL.md files — do not change this block
```bash
if [ -z "$DATA_PATH" ]; then
  set -a && source .env.local && set +a
fi
```

### node -e with single quotes
**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` Notes + `.agents/skills/atualizar-roles-map/SKILL.md` Notes + `.agents/skills/criar-perfil/SKILL.md` Notes
**Apply to:** All write operations in all skill files
**Rule:** Always `node -e '...'` (single quotes in shell). Double quotes cause `$` interpolation, corrupting monetary values silently.

### Path traversal validation
**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` Step 5, lines 282-287 (current)
**Apply to:** Every file write in pesquisar-mercado (vagas and resumo) and every file read in refinar-perfil
**Rule:** `path.resolve()` the final path and verify it `.startsWith(expectedBaseDir + path.sep)` before any `fs.writeFileSync` or `fs.readFileSync`.

### Playwright MCP — never call browser_close
**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` Notes lines 442-443 + `.agents/skills/atualizar-roles-map/SKILL.md` Notes lines 377-378
**Apply to:** New salary guide step in pesquisar-mercado (inherits Playwright usage)
**Rule:** Never call `browser_close` during skill execution. Reuse the same browser context across all portals.

### ID selection from list (not from user input)
**Source:** `.agents/skills/refinar-perfil/SKILL.md` Step 1 lines 64-65 + `.agents/skills/criar-perfil/SKILL.md` Notes
**Apply to:** New pesquisar-mercado Step 1 (profile selection)
**Rule:** Profile ID is always obtained from the `ls` output list, never accepted as free-text from the gestor.

### Skill section structure
**Source:** All existing skills
**Apply to:** All three SKILL.md files
**Mandatory sections (in order):** frontmatter → `# SKILL: Name` → `## Pre-Conditions` → `## Execution Flow` (Steps 0–N) → `## Notes for Agent` → `## Troubleshooting` → `## Related Skills` → metadata footer

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `salaryGuide` field in `-resumo.json` | schema field | N/A | New field — no existing analog. Design from atualizar-roles-map entry schema + CONTEXT.md D-08. See Pattern 9 above. |
| Deprecation notice block | documentation pattern | N/A | No skill has been deprecated before in this codebase. Pattern designed from scratch in Pattern 11. |

---

## Metadata

**Analog search scope:** `.agents/skills/` (all 6 skills), `src/lib/profile.ts`
**Files read:** 5 (pesquisar-mercado/SKILL.md, atualizar-roles-map/SKILL.md, criar-perfil/SKILL.md, refinar-perfil/SKILL.md, src/lib/profile.ts)
**Pattern extraction date:** 2026-04-26
