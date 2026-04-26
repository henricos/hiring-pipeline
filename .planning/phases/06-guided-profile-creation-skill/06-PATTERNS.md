# Phase 6: Guided Profile Creation Skill - Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 1 (new file: `.agents/skills/criar-perfil/SKILL.md`)
**Analogs found:** 3 / 1 — three analogs for the single target file

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.agents/skills/criar-perfil/SKILL.md` | skill (CLI instruction document) | request-response + event-driven (WebSearch) | `.agents/skills/refinar-perfil/SKILL.md` | exact (same domain, same role, same data flow structure) |

**Secondary analogs (supplementary patterns):**

| Aspect | Analog File | Relevance |
|--------|-------------|-----------|
| WebSearch usage + node -e JSON write | `.agents/skills/pesquisar-mercado/SKILL.md` | Best source for WebSearch pattern and path traversal guard |
| UUID generation + confirmation preview + next-steps display | `.agents/skills/abrir-vaga/SKILL.md` | Best source for UUID step and finish step |

---

## Pattern Assignments

### `.agents/skills/criar-perfil/SKILL.md` (skill, request-response + WebSearch)

**Primary analog:** `.agents/skills/refinar-perfil/SKILL.md`
**Secondary analogs:** `.agents/skills/pesquisar-mercado/SKILL.md`, `.agents/skills/abrir-vaga/SKILL.md`

---

#### Frontmatter YAML pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 1-11

```yaml
---
name: refinar-perfil
description: |
  Abre um perfil de vaga existente e oferece sugestões de IA para melhorar
  requisitos, habilidades e descrições. Apresenta antes/depois por campo e
  permite aceitar, rejeitar ou ajustar cada sugestão. Realiza revisão holística
  de coerência interna antes do save final. Salva o JSON atualizado
  em DATA_PATH/profiles/. Use quando o gestor quiser enriquecer um perfil
  existente com sugestões contextualizadas para P&D/Lyceum.
command: /refinar-perfil
---
```

**Adapt for `/criar-perfil`:** Replace `name`, `description` (describe normalização + WebSearch + stub creation), and `command: /criar-perfil`. Keep `description` as multi-line block scalar (`|`). The `description` field is what the agent reads when deciding to invoke the skill — make it decision-oriented ("Use quando o gestor quiser criar um novo perfil de cargo").

---

#### Pre-Conditions section pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 20-24

```markdown
## Pre-Conditions

- DATA_PATH disponível no ambiente ou em `.env.local` na raiz do projeto (carregado automaticamente no Step 0)
- At least one job profile exists in DATA_PATH/profiles/*.json
- DATA_PATH/settings.json exists (recomendado — sem ele as sugestões não terão contexto P&D)
```

**Adapt for `/criar-perfil`:** Remove "at least one profile" requirement (this skill creates the first one). Keep the DATA_PATH condition. Add WebSearch availability condition (needed for Step 2).

---

#### Step 0 — Load DATA_PATH pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 28-45

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

Critical note (source: refinar-perfil lines 43-45):
```
> **Nota de ambiente:** A ferramenta Bash não persiste estado de shell entre chamadas —
> cada invocação é um processo novo. Por isso, **todo comando Bash nesta skill deve
> começar com `source .env.local &&`** para que `DATA_PATH` esteja disponível.
```

**Copy verbatim** — this exact Step 0 block is identical in all three analog skills. Do not modify.

---

#### WebSearch pattern for market analysis

Source: `.agents/skills/pesquisar-mercado/SKILL.md` lines 82-115 (Step 2 — query strategy)

The WebSearch steps in `pesquisar-mercado` use a "two-pass" approach (list + describe). For `/criar-perfil` the pattern is simpler — 1-2 direct WebSearch calls for force estimation. The relevant pattern from `pesquisar-mercado`:

```markdown
### Step 2: ... Executar Queries WebSearch

**Queries base por senioridade** (usar apenas cargo — sem stack):

| Senioridade | Query PT | Query EN |
|-------------|---------|---------|
| Pleno | `"{cargo} pleno"` | ... |
| Sênior | `"{cargo} sênior"` | ... |
```

**Adapt for `/criar-perfil`:** Simplify to 1-2 queries targeting demand estimation, not deep collection. Pattern of what the result signals (many results = forte, few = fraco) is Claude's Discretion per D-08. The key structural note from `pesquisar-mercado` line 441 applies directly:

```
# node -e para salvar JSON: usar sempre aspas simples no shell (node -e '...'):
# aspas duplas fazem o bash interpretar $ como variável de ambiente vazia —
# R$7k vira R.7k silenciosamente.
```

---

#### UUID generation pattern

Source: `.agents/skills/abrir-vaga/SKILL.md` lines 135-139

```bash
node -e "console.log(require('crypto').randomUUID())"
```

Also referenced in `pesquisar-mercado` and `refinar-perfil` — this is the canonical UUID generation method for the project.

**Copy verbatim** — no adaptation needed.

---

#### JSON write via `node -e` + path traversal guard pattern

Source: `.agents/skills/pesquisar-mercado/SKILL.md` lines 273-291 (Step 5.3)

```bash
node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const fileName = "{slug}-{date}-vagas.json";
const filePath = path.resolve(dataPath, "research", fileName);
// Validar path traversal antes de escrever
const researchDir = path.resolve(dataPath, "research");
if (!filePath.startsWith(researchDir)) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
const vagasData = {/* objeto completo conforme schema abaixo */};
fs.writeFileSync(filePath, JSON.stringify(vagasData, null, 2));
console.log("Vagas salvas em:", filePath);
'
```

**Adapt for `/criar-perfil`:**
- Change target directory from `research` to `profiles`
- Change `fileName` to `{uuid}.json`
- Replace `vagasData` with the JobProfile stub object (see schema section below)
- Keep `path.resolve()` + `startsWith()` guard — mandatory
- Keep `fs.mkdirSync(profilesDir, { recursive: true })` before write
- Keep single quotes on `node -e '...'` — never double quotes

Each subsequent Bash call that uses `DATA_PATH` must prefix with `source .env.local &&`:

```bash
source .env.local && node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const profilesDir = path.resolve(dataPath, "profiles");
const filePath = path.resolve(profilesDir, "{uuid}.json");
if (!filePath.startsWith(profilesDir + path.sep) && filePath !== profilesDir) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
fs.mkdirSync(profilesDir, { recursive: true });
// ... write profile stub ...
'
```

---

#### Confirmation preview + finish step pattern

Source: `.agents/skills/abrir-vaga/SKILL.md` lines 169-184 (Step 6)

```markdown
### Step 6: Confirm and Finish

Display:
```
Vaga criada com sucesso!
ID: {uuid}
Perfil: {profile-title}
Tipo: {requestType}
Quantidade: {quantity}

Próximas ações:
1. Abra http://localhost:3000/hiring-pipeline/vacancies/{uuid}/edit na web
2. Clique em "Gerar formulário GH"
3. Envie o Excel para o GH/Werecruiter

Vaga salva em: $DATA_PATH/vacancies/{uuid}.json
```
```

**Adapt for `/criar-perfil`:**
- The finish step (D-13) shows: ID created + file path + next steps (`/pesquisar-mercado` → `/refinar-perfil`)
- Per D-11, the preview step shown BEFORE saving must show only: título normalizado + nível + força de mercado + alternativas if fraco. Do NOT include descriptive placeholder fields in the preview.

Preview template for `/criar-perfil` (pre-save confirmation):
```
Perfil a ser criado:
  Título: {tituloNormalizado}
  Nível:  {experienceLevel}
  Força de mercado: {forte | médio | fraco | nicho}
  {[Se fraco/nicho] Títulos alternativos sugeridos: {alt1}, {alt2}}

Confirmar criação? (S/N/ajustar)
```

Finish template (post-save):
```
Perfil criado com sucesso!
ID: {uuid}
Arquivo: $DATA_PATH/profiles/{uuid}.json

Próximas ações:
  1. /pesquisar-mercado — enriquecer com dados reais do mercado BR
  2. /refinar-perfil — iterar os campos descritivos com IA
```

---

#### Notes for Agent section pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 467-484

The Notes section in existing skills lists:
1. One note per cross-cutting concern
2. Bold heading + colon + explanation
3. Concrete examples when applicable

**Copy the following notes verbatim into `/criar-perfil`'s Notes section (they apply directly):**

- Bash state persistence note (refinar-perfil line 469): "Cada invocação da ferramenta Bash é um processo novo. Incluir `source .env.local &&` no início de TODO comando que use `DATA_PATH`."
- node -e vs heredoc (refinar-perfil line 474): "O heredoc shell tem problemas com aspas simples e duplas em conteúdo. O node -e lê e grava JSON diretamente, preservando escape correto."
- IDs from list, never from user (refinar-perfil line 472): Applies only to any profile listing step if `/criar-perfil` adds one; not applicable to the new UUID (generated internally).

**Add these notes specific to `/criar-perfil`:**
- `experienceLevel` must be one of the 5 exact union values (from pitfall 2 in RESEARCH.md)
- Classification must be based on actual WebSearch results executed in the step, not on training knowledge (from pitfall 5 in RESEARCH.md)
- Preview must NOT include placeholder fields (D-11 — from pitfall 6)

---

#### Troubleshooting section pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 486-507

Format: bold quoted error string as heading, arrow + action as body. Keep the same format.

Entries relevant for `/criar-perfil`:
- "DATA_PATH não está definido" (copy verbatim from refinar-perfil)
- "WebSearch indisponível" — classify force as "não verificado" and warn the manager (from environment availability in RESEARCH.md)
- "Erro ao gravar o perfil" (adapt from refinar-perfil)

---

#### Related Skills section pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 509-512

```markdown
## Related Skills

- `/abrir-vaga` — criar vaga conversacionalmente a partir de um perfil refinado
- `/pesquisar-mercado` — coletar dados de vagas reais em portais BR para alimentar o Step 2 desta skill
- `/fechar-versao` — referência de estrutura e boas práticas de skill
```

**Adapt for `/criar-perfil`:**
```markdown
## Related Skills

- `/pesquisar-mercado` — enriquecer o perfil criado com dados reais do mercado BR
- `/refinar-perfil` — iterar campos descritivos do perfil com sugestões de IA
- `/abrir-vaga` — criar vaga a partir de um perfil pronto
```

---

#### Skill footer pattern

Source: `.agents/skills/refinar-perfil/SKILL.md` lines 515-521

```markdown
---

**Skill created:** 2026-04-21
**Updated:** ...
**Status:** Ready for Claude Code integration
```

**Copy format, use today's date (2026-04-25) for `Skill created`, omit `Updated` on first version.**

---

## Shared Patterns (Cross-Cutting)

### DATA_PATH loading + re-source rule
**Source:** `.agents/skills/refinar-perfil/SKILL.md` lines 28-45 (Step 0)
**Apply to:** Every Bash command block in the skill
```bash
# Step 0 validation (once):
if [ -z "$DATA_PATH" ]; then
  set -a && source .env.local && set +a
fi

# Every subsequent Bash call must prefix:
source .env.local && <command>
```

### node -e with single quotes for JSON writes
**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` line 441 (Notes)
**Apply to:** All JSON write steps
```bash
# CORRECT — single quotes prevent $ expansion:
node -e '...'

# WRONG — double quotes expand $7k → .7k silently:
node -e "..."
```

### path.resolve() + startsWith() path traversal guard
**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` lines 280-286 (Step 5.3)
**Apply to:** The profile persistence step (Step 5 of `/criar-perfil`)
```javascript
const profilesDir = path.resolve(dataPath, "profiles");
const filePath = path.resolve(profilesDir, uuid + ".json");
if (!filePath.startsWith(profilesDir + path.sep) && filePath !== profilesDir) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
```

### UUID generation
**Source:** `.agents/skills/abrir-vaga/SKILL.md` line 138
**Apply to:** The ID generation step
```bash
node -e "console.log(require('crypto').randomUUID())"
```

### mkdirSync with recursive: true
**Source:** `.agents/skills/pesquisar-mercado/SKILL.md` line 269 (Step 5.2)
**Apply to:** Before any write to DATA_PATH subdirectory
```javascript
fs.mkdirSync(profilesDir, { recursive: true });
```

---

## JobProfile Stub Schema (for the persistence step)

Source: `src/lib/profile.ts` lines 1-63 + RESEARCH.md Code Examples

```javascript
// All values resolved at write time via node -e '...'
const PLACEHOLDER = "[A ser definido via /pesquisar-mercado e /refinar-perfil]";
const now = new Date().toISOString();
const uuid = require("crypto").randomUUID();

const stub = {
  id: uuid,
  title: "{tituloNormalizadoConfirmado}",
  suggestedTitle: "{tituloNormalizadoConfirmado}",  // same value initially
  experienceLevel: "{nivelMapeado}",  // MUST be one of: "< 1 ano"|"1-3 anos"|"3-5 anos"|"5-10 anos"|"> 10 anos"
  educationLevel: "Superior completo",
  postGraduateLevel: "Não exigido",
  certifications: "Não",
  responsibilities: [PLACEHOLDER],
  qualifications: [{ text: PLACEHOLDER, required: false }],
  behaviors: [PLACEHOLDER],
  challenges: [PLACEHOLDER],
  createdAt: now,
  updatedAt: now
};
```

**ExperienceLevel mapping table** (must be included in SKILL.md notes or as an inline table in the normalization step):

| Título contém | `experienceLevel` |
|--------------|-------------------|
| Estagiário, Estágio | `"< 1 ano"` |
| Júnior, Jr, Junior, I | `"1-3 anos"` |
| Pleno, II, Mid | `"3-5 anos"` |
| Sênior, Sr, Senior, III | `"5-10 anos"` |
| Staff, Principal, Lead, Expert, IV | `"> 10 anos"` |
| Sem nível explícito | `"3-5 anos"` (default — exibir para confirmação) |

---

## File Creation Note

Source: `06-RESEARCH.md` File Creation Pattern section + verified via `ls -lai`

The directories `.agents/skills/`, `.claude/skills/`, and `.cursor/skills/` share the **same inode per file** (hard links). Verified: inode `3574121` is identical across all three paths for `refinar-perfil/SKILL.md`.

**The planner must create only one file:** `.agents/skills/criar-perfil/SKILL.md`

This makes it immediately available at:
- `/home/henrico/github/henricos/hiring-pipeline/.agents/skills/criar-perfil/SKILL.md`
- `/home/henrico/github/henricos/hiring-pipeline/.claude/skills/criar-perfil/SKILL.md`
- `/home/henrico/github/henricos/hiring-pipeline/.cursor/skills/criar-perfil/SKILL.md`

However, the hard link relationship is at the **directory** level. Confirm with the planner: if only `.agents/skills/criar-perfil/` directory is created and the hard link directories already exist for the new subdirectory, creating the file in `.agents/skills/criar-perfil/SKILL.md` will appear in all three paths. If the subdirectory `criar-perfil/` doesn't exist yet in `.claude/skills/` and `.cursor/skills/`, the planner may need to create the directory in all three locations before writing the single file — or confirm that the directory hard link covers subdirectories created after the link. The RESEARCH.md states this was "verified" for Phase 5; the planner should run `ls -lai .claude/skills/ .cursor/skills/` to confirm the parent `skills/` directory inode is shared.

---

## No Analog Found

No files fall in this category — the single file to be created has strong analogs from three existing skills in the project.

---

## Metadata

**Analog search scope:** `.agents/skills/` (all 5 existing skills read)
**Source files scanned:** `refinar-perfil/SKILL.md`, `pesquisar-mercado/SKILL.md`, `abrir-vaga/SKILL.md`, `src/lib/profile.ts`
**Pattern extraction date:** 2026-04-25
