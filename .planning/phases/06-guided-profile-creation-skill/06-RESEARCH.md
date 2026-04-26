# Phase 6: Guided Profile Creation Skill - Research

**Researched:** 2026-04-25
**Domain:** CLI skill authoring — fluxo conversacional com WebSearch, LLM, e persistência JSON
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Perfil criado é um stub. `title` e `experienceLevel` recebem valores reais. Todos os campos descritivos recebem um placeholder uniforme indicando que ainda não foram preenchidos.
- **D-02:** Texto sugerido para placeholder: `"[A ser definido via /pesquisar-mercado e /refinar-perfil]"` (wording exato é Claude's Discretion). Para `qualifications[]`, o item placeholder deve ter `required: false`.
- **D-03:** Sem chamada LLM para popular campos descritivos na criação. Custo-zero de LLM é propriedade desejável.
- **D-04:** A skill recebe título livre e propõe título normalizado de mercado via LLM com o título como input.
- **D-05:** Nível de senioridade (`experienceLevel`) é inferido automaticamente do título e exibido junto com o título normalizado numa única tela de confirmação. Gestor confirma ambos ou ajusta.
- **D-06:** Perfil só é criado com o título confirmado pelo gestor. Sem criação silenciosa.
- **D-07:** Análise usa 1-2 queries WebSearch (Google/LinkedIn, sem Playwright) para estimar demanda no mercado BR. Latência esperada: ~30 segundos.
- **D-08:** IA classifica força do título em: forte / médio / fraco / nicho.
- **D-09:** Se título for fraco ou não reconhecido, análise sugere títulos alternativos mais comuns. Gestor pode adotar ou manter original.
- **D-10:** Sem dependência do `roles-map.json`.
- **D-11:** Preview enxuto antes de salvar: título normalizado + nível + resultado da análise de força. Campos descritivos placeholder não exibidos no preview.
- **D-12:** Após confirmação, persistir em `DATA_PATH/profiles/{uuid}.json` seguindo schema existente. ID gerado como UUID v4.
- **D-13:** Após salvar, exibir ID e sugerir próximos passos: `/pesquisar-mercado` → `/refinar-perfil`.

### Claude's Discretion

- Wording exato do texto placeholder nos campos descritivos.
- Número exato de queries WebSearch (1 ou 2) e queries específicas para análise de força.
- Formato visual da tela de confirmação (compacto vs. estruturado).
- Critério exato de classificação de força (thresholds de contagem de vagas para forte/médio/fraco/nicho).

### Deferred Ideas (OUT OF SCOPE)

- Sugestão de pesquisa pré-carregada ao criar o perfil (integração entre skills além do escopo desta phase).
- Análise de força com faixas salariais (depende da Phase 7 — roles-map descontinuado).

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRIA-01 | Gestor pode criar um perfil mínimo a partir de apenas um título/nome de cargo via skill `/criar-perfil` | Padrão SKILL.md identificado; fluxo Step 0 → normalização LLM → confirmação → persistência JSON documentado |
| CRIA-02 | Skill `/criar-perfil` apresenta análise de força do título no mercado antes de confirmar a criação | WebSearch dentro de skills verificado via `/pesquisar-mercado`; padrão de query e output de classificação documentado |
| CRIA-03 | Perfil criado contém campos preenchidos com valores-base de mercado, pronto para refinamento via `/refinar-perfil` | JobProfile schema imutável lido; campos obrigatórios e opcionais documentados; padrão de stub com placeholder confirmado |

</phase_requirements>

---

## Summary

A Phase 6 entrega exclusivamente a skill `/criar-perfil` — um arquivo SKILL.md em `.agents/skills/criar-perfil/`. Nenhum código TypeScript é criado, nenhuma rota web é adicionada. A skill é um conjunto de instruções que a IA segue ao receber o comando, combinando: (1) LLM para normalizar o título e inferir `experienceLevel`, (2) 1-2 queries WebSearch para avaliar força de mercado, (3) um preview de confirmação, e (4) escrita direta de JSON em `DATA_PATH/profiles/{uuid}.json`.

O projeto já possui quatro skills operacionais que definem os padrões exatos a seguir. O formato SKILL.md — frontmatter YAML com `name`, `description` e `command`, seguido de seções `Pre-Conditions`, `Execution Flow` (Steps numerados), `Notes for Agent`, `Troubleshooting` e `Related Skills` — está consolidado e verificado. A discovery mais importante desta pesquisa é que `.agents/skills/`, `.claude/skills/` e `.cursor/skills/` compartilham o **mesmo inode por arquivo** (hard links de diretório), confirmado via `ls -lai`. Criar o arquivo uma vez em `.agents/skills/criar-perfil/SKILL.md` o torna imediatamente disponível nos três caminhos sem duplicação.

O schema `JobProfile` em `src/lib/profile.ts` é imutável para esta phase (D-01). Todos os campos foram lidos diretamente do arquivo. Os campos descritivos (`responsibilities: string[]`, `qualifications: ProfileItem[]`, `behaviors: string[]`, `challenges: string[]`) recebem placeholders; os campos de identificação (`title`, `suggestedTitle`, `experienceLevel`) recebem valores reais derivados da normalização; os campos de selects obrigatórios (`educationLevel`, `postGraduateLevel`, `certifications`) recebem defaults conservadores sem precisar de input do gestor.

**Primary recommendation:** Criar apenas `.agents/skills/criar-perfil/SKILL.md` — um único arquivo com 5-6 steps, seguindo o padrão `refinar-perfil`/`pesquisar-mercado`. Nenhuma outra mudança de código é necessária nesta phase.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Normalização de título | CLI skill (LLM) | — | A skill invoca o LLM internamente; sem chamada a servidor |
| Análise de força de mercado | CLI skill (WebSearch) | — | WebSearch é executado dentro da skill via ferramenta do agente |
| Confirmação interativa | CLI skill (conversação) | — | Fluxo multi-turn na interface do agente (Claude Code / Cursor) |
| Persistência do perfil | CLI skill (Node.js fs) | — | Escrita direta via `node -e` em `DATA_PATH/profiles/`; não passa pela web app |
| Exibição / edição do perfil criado | Frontend (Next.js) | — | O perfil criado aparece automaticamente em `/profiles` — zero mudança necessária |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-in `crypto` | 22.x (runtime do projeto) | Geração de UUID v4 via `crypto.randomUUID()` | Já usado em `src/lib/profile.ts`; sem dependência externa necessária [VERIFIED: src/lib/profile.ts:100] |
| Node.js built-in `fs` | 22.x | Escrita de JSON em `DATA_PATH/profiles/` | Mesmo padrão do `JsonProfileRepository`; `node -e` evita problemas de escape de heredoc [VERIFIED: .agents/skills/refinar-perfil/SKILL.md Step 6] |
| Node.js built-in `path` | 22.x | `path.resolve()` para validação de path traversal | Padrão de segurança já documentado em `pesquisar-mercado` e no `JsonProfileRepository` [VERIFIED: src/lib/repositories/profile-repository.ts:21] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| WebSearch (ferramenta do agente) | — | Queries para análise de força de mercado | Steps 2-3 da skill — D-07 exige 1-2 queries sem Playwright [VERIFIED: .agents/skills/pesquisar-mercado/SKILL.md] |
| LLM (agente em execução) | — | Normalização de título e inferência de `experienceLevel` | Step 1 da skill — D-04, D-05; sem custo extra, é o próprio agente raciocinar |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `node -e` para escrever JSON | heredoc `cat > file << 'EOF'` | heredoc falha com aspas simples/duplas no conteúdo — já documentado em pesquisar-mercado e refinar-perfil como anti-padrão [VERIFIED: .agents/skills/pesquisar-mercado/SKILL.md Notes] |
| Escrita direta em `DATA_PATH/profiles/` | Chamar server action via `curl` | Skills escrevem direto no JSON — padrão estabelecido; server actions dependem da web app estar rodando [VERIFIED: 06-CONTEXT.md code_context] |

**Installation:** Nenhuma instalação necessária — apenas Node.js já presente no ambiente.

---

## Architecture Patterns

### System Architecture Diagram

```
Gestor digita título livre
         │
         ▼
[Step 0] Carregar DATA_PATH
  source .env.local
         │
         ▼
[Step 1] LLM normaliza título + infere experienceLevel
  Input: título livre
  Output: título normalizado + nível proposto
         │
         ▼
[Step 2] WebSearch — análise de força de mercado
  1-2 queries: "{título normalizado} vagas brasil site:linkedin.com"
               "{título normalizado} vaga emprego"
  Output: classificação força (forte/médio/fraco/nicho) + alternativas se fraco
         │
         ▼
[Step 3] Preview de confirmação
  Título normalizado | Nível | Força de mercado | (alternativas se fraco)
  Gestor: confirmar / ajustar / abortar
         │
    ┌────┴────┐
    │ abortar │ → encerrar sem criar perfil
    └─────────┘
         │ confirmar
         ▼
[Step 4] Gerar UUID + montar objeto JobProfile stub
  crypto.randomUUID() via node -e
  Campos descritivos = placeholder string
  Campos de select = defaults conservadores
         │
         ▼
[Step 5] Persistir em DATA_PATH/profiles/{uuid}.json
  node -e com path.resolve() + validação de path traversal
         │
         ▼
[Step 6] Exibir confirmação + sugerir próximos passos
  ID gerado | /pesquisar-mercado → /refinar-perfil
```

### Recommended Project Structure

```
.agents/skills/
└── criar-perfil/
    └── SKILL.md        # fonte de verdade — automaticamente disponível em .claude/ e .cursor/ via hard links
```

O diretório pai `.agents/skills/criar-perfil/` e seus equivalentes em `.claude/skills/criar-perfil/` e `.cursor/skills/criar-perfil/` serão criados como parte do plano. A criação em **um único local** (`.agents/skills/`) e hard-linking dos diretórios é o padrão já estabelecido — inode verificado em `ls -lai`.

### Pattern 1: Frontmatter YAML de SKILL.md

**What:** Todo SKILL.md começa com frontmatter YAML delimitado por `---` contendo `name`, `description` (bloco multi-linha) e `command`.

**When to use:** Sempre — é o padrão obrigatório do projeto.

**Example:**
```yaml
# Source: .agents/skills/refinar-perfil/SKILL.md (linhas 1-11)
---
name: criar-perfil
description: |
  Cria um perfil mínimo de vaga a partir de um título de cargo fornecido pelo gestor.
  Normaliza o título via LLM, infere o nível de senioridade, executa análise de força
  do título no mercado BR via WebSearch e persiste um perfil stub em DATA_PATH/profiles/
  com placeholders nos campos descritivos — pronto para enriquecimento via
  /pesquisar-mercado e /refinar-perfil. Use quando o gestor quiser criar um novo
  perfil de cargo com validação de mercado antes de detalhar os requisitos.
command: /criar-perfil
---
```

### Pattern 2: Step 0 — Carregar DATA_PATH

**What:** Todo SKILL.md começa com Step 0 que carrega `.env.local` se `DATA_PATH` não estiver definido no ambiente.

**When to use:** Obrigatório em qualquer skill que usa `DATA_PATH`.

**Example:**
```bash
# Source: .agents/skills/refinar-perfil/SKILL.md (Step 0)
if [ -z "$DATA_PATH" ]; then
  set -a && source .env.local && set +a
fi
```

Nota crítica: Bash não persiste estado entre chamadas de ferramenta. Todo comando Bash subsequente deve incluir `source .env.local &&` no início.

### Pattern 3: UUID via `node -e`

**What:** IDs de registro são gerados via `crypto.randomUUID()` em Node.js.

**When to use:** Sempre que a skill precisar criar um novo registro com ID.

**Example:**
```bash
# Source: .agents/skills/abrir-vaga/SKILL.md (Step 5)
node -e "console.log(require('crypto').randomUUID())"
```

### Pattern 4: Escrita JSON via `node -e` (não heredoc)

**What:** Persistência de JSON usando `node -e` com `fs.writeFileSync` e validação de path traversal via `path.resolve()`.

**When to use:** Sempre que a skill precisa criar ou atualizar um arquivo JSON.

**Example:**
```bash
# Source: .agents/skills/pesquisar-mercado/SKILL.md (Step 5)
node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const fileName = "{uuid}.json";
const profilesDir = path.resolve(dataPath, "profiles");
const filePath = path.resolve(profilesDir, fileName);
// Validar path traversal
if (!filePath.startsWith(profilesDir)) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
fs.mkdirSync(profilesDir, { recursive: true });
const profile = { /* objeto */ };
fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
console.log("Perfil criado em:", filePath);
'
```

**Regra de aspas:** Usar **aspas simples** no shell (`node -e '...'`). Aspas duplas fazem o bash interpretar `$` como variável de ambiente — verificado em nota do pesquisar-mercado.

### Pattern 5: Guardrail de ID — não aceitar input do gestor

**What:** IDs de arquivos existentes nunca são digitados livremente pelo gestor — sempre obtidos via `ls` + seleção numerada.

**When to use:** Em toda listagem de perfis/vagas existentes.

**Example:**
```bash
# Source: .agents/skills/refinar-perfil/SKILL.md (Step 1 — nota)
# "Registrar o ID do perfil selecionado a partir da lista
# (NÃO aceitar ID digitado diretamente pelo gestor — usar somente IDs listados pelo ls)"
```

Nota: na `/criar-perfil` esta regra se aplica apenas se a skill exibir perfis existentes. No fluxo principal (criação pura), o ID é gerado internamente — sem input do gestor.

### Anti-Patterns to Avoid

- **Heredoc para escrever JSON:** `cat > file << 'EOF'` falha com aspas no conteúdo. Usar sempre `node -e '...'` com `fs.writeFileSync`. [VERIFIED: pesquisar-mercado Notes]
- **`browser_close` no Playwright:** encerra o browser permanentemente. Não aplicável aqui (skill não usa Playwright), mas registrado como anti-padrão do ecossistema.
- **Criar stub com campos descritivos vazios (`[]`):** O CRIA-03 exige campos "preenchidos com valores-base", não vazios. O placeholder é uma string em um array de 1 item — não um array vazio.
- **Aceitar `experienceLevel` livre do gestor sem mapear para o union type:** O campo aceita apenas os 5 valores do `ExperienceLevel` union. A skill deve mapear a inferência para um desses valores antes de gravar.
- **Chamar server action via curl:** Skills escrevem diretamente no DATA_PATH — dependência da web app estar rodando seria frágil.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID v4 | Gerador próprio de ID aleatório | `node -e "console.log(require('crypto').randomUUID())"` | Padrão do projeto; `crypto.randomUUID()` já em `src/lib/profile.ts` |
| Validação de path traversal | Regex manual | `path.resolve()` + `startsWith(baseDir)` | Padrão já em `JsonProfileRepository` e em `pesquisar-mercado`; cobre casos edge de `../` |
| Garantir `DATA_PATH/profiles/` existe | `if [ ! -d ]` + `mkdir` | `fs.mkdirSync(dir, { recursive: true })` | Padrão `ensureSubdir` do `data-service.ts`; idempotente |
| Sanitizar slug | Regex manual | Seguir padrão de `pesquisar-mercado` (`[a-z0-9-]` apenas) | Já documentado com edge cases de `..`, `/`, `\` |
| Queries WebSearch para análise de força | Scraping de portais | WebSearch tool (ferramenta nativa do agente) | D-07 proíbe Playwright aqui; latência ~30s é aceitável |

---

## JobProfile Schema — Campos Completos

Lido diretamente de `src/lib/profile.ts`. Imutável para esta phase (D-01 CONTEXT.md).

### Campos obrigatórios no stub (sem default óbvio — precisam de valor real)

| Campo | Tipo | Como preencher no stub |
|-------|------|------------------------|
| `id` | `string` (UUID v4) | `crypto.randomUUID()` via `node -e` |
| `title` | `string` | Título normalizado confirmado pelo gestor |
| `suggestedTitle` | `string` | Mesmo valor que `title` inicialmente (gestor pode ajustar via `/refinar-perfil`) |
| `experienceLevel` | `ExperienceLevel` | Inferido do título; um de: `"< 1 ano"` \| `"1-3 anos"` \| `"3-5 anos"` \| `"5-10 anos"` \| `"> 10 anos"` |
| `createdAt` | `string` (ISO 8601) | `new Date().toISOString()` |
| `updatedAt` | `string` (ISO 8601) | Mesmo valor que `createdAt` na criação |

### Campos obrigatórios com default conservador (não precisam de input)

| Campo | Tipo | Default conservador para stub |
|-------|------|-------------------------------|
| `educationLevel` | `EducationLevel` | `"Superior completo"` |
| `postGraduateLevel` | `PostGraduateLevel` | `"Não exigido"` |
| `certifications` | `CertificationLevel` | `"Não"` |

### Campos descritivos — recebem placeholder (D-01, D-02)

| Campo | Tipo | Placeholder |
|-------|------|-------------|
| `responsibilities` | `string[]` | `["[A ser definido via /pesquisar-mercado e /refinar-perfil]"]` |
| `qualifications` | `ProfileItem[]` | `[{ "text": "[A ser definido via /pesquisar-mercado e /refinar-perfil]", "required": false }]` |
| `behaviors` | `string[]` | `["[A ser definido via /pesquisar-mercado e /refinar-perfil]"]` |
| `challenges` | `string[]` | `["[A ser definido via /pesquisar-mercado e /refinar-perfil]"]` |

### Campos opcionais — omitir no stub

`educationCourse`, `postGraduateCourse`, `certificationsWhich`, `englishLevel`, `spanishLevel`, `otherLanguage`, `otherLanguageLevel`, `additionalInfo`, `systemsRequired`, `networkFolders`, `internalNotes` — todos opcionais (`?`). Omitir no stub é válido.

---

## File Creation Pattern

A Phase 5 estabeleceu que `.claude/skills/`, `.cursor/skills/` e `.agents/skills/` compartilham o **mesmo inode** por arquivo (hard links de diretório). Verificado via `ls -lai`:

```
inode 3572717: /home/henrico/.../agents/skills/abrir-vaga/SKILL.md  (idêntico)
inode 3572717: /home/henrico/.../claude/skills/abrir-vaga/SKILL.md  (idêntico)
inode 3572717: /home/henrico/.../cursor/skills/abrir-vaga/SKILL.md  (idêntico)
```

**Conclusão:** Criar o diretório `.agents/skills/criar-perfil/` e o arquivo `SKILL.md` dentro dele. Os diretórios equivalentes em `.claude/` e `.cursor/` já são o mesmo inode — qualquer arquivo criado em `.agents/skills/criar-perfil/` fica automaticamente acessível nos três caminhos.

**Os três "caminhos" para criar o arquivo são o mesmo arquivo físico.** O plano deve criar apenas em `.agents/skills/criar-perfil/SKILL.md` — não duplicar.

---

## Common Pitfalls

### Pitfall 1: Bash não persiste estado entre chamadas de ferramenta
**What goes wrong:** A IA chama `source .env.local` no Step 0, mas no Step 4 ao chamar `node -e`, `DATA_PATH` está vazio — o processo Bash anterior já encerrou.
**Why it happens:** Cada invocação da ferramenta Bash é um processo filho novo; variáveis de ambiente não persistem.
**How to avoid:** Todo comando Bash que usa `DATA_PATH` deve incluir `source .env.local &&` no início. Documentar como nota no SKILL.md.
**Warning signs:** `DATA_PATH` vazio em comandos posteriores ao Step 0. [VERIFIED: .agents/skills/refinar-perfil/SKILL.md Notes]

### Pitfall 2: `experienceLevel` com valor fora do union type
**What goes wrong:** A IA infere "Sênior" ou "5 anos" e grava diretamente, quebrando o schema.
**Why it happens:** O campo aceita apenas os 5 valores exatos do `ExperienceLevel` union.
**How to avoid:** O SKILL.md deve incluir tabela de mapeamento explícita: Junior → `"3-5 anos"`, Pleno → `"3-5 anos"`, Sênior → `"5-10 anos"`, etc.
**Warning signs:** Web app não carrega o perfil; JSON.parse falha silenciosamente. [VERIFIED: src/lib/profile.ts:8-13]

### Pitfall 3: Aspas duplas no `node -e` com conteúdo dinâmico
**What goes wrong:** `node -e "... ${variavel} ..."` — o bash expande `$` e pode truncar conteúdo (ex: `R$7k` → `R.7k`).
**Why it happens:** Aspas duplas no shell permitem expansão de variáveis de ambiente.
**How to avoid:** Usar sempre aspas simples: `node -e '...'`. Injetar variáveis via `process.env.DATA_PATH`. [VERIFIED: .agents/skills/pesquisar-mercado/SKILL.md Notes]

### Pitfall 4: Array vazio em vez de placeholder
**What goes wrong:** Criar `responsibilities: []` em vez de `responsibilities: ["[A ser definido...]"]`.
**Why it happens:** Array vazio é mais "limpo", mas viola CRIA-03 (campos preenchidos com valores-base).
**How to avoid:** Placeholder explícito em todos os 4 campos descritivos. A web app em `/profiles/[id]/edit` exibirá o placeholder como conteúdo editável — não como campo vazio. [VERIFIED: 06-CONTEXT.md D-01, D-02]

### Pitfall 5: Classificação de força sem basear nas queries reais
**What goes wrong:** A IA classifica "forte" com base em conhecimento de treinamento, sem executar WebSearch.
**Why it happens:** A IA pode "achar" que sabe — mas D-07 exige WebSearch ativo.
**How to avoid:** O SKILL.md deve exigir explicitamente que a classificação seja baseada nos resultados das queries executadas no step, não em knowledge prévio.
**Warning signs:** Análise instantânea (< 5s) sem chamadas WebSearch visíveis no trace. [VERIFIED: 06-CONTEXT.md D-07, D-08]

### Pitfall 6: Preview com campos placeholder exibidos
**What goes wrong:** A tela de confirmação exibe todos os campos do stub, incluindo os placeholders.
**Why it happens:** A IA serializa o objeto completo sem filtragem.
**How to avoid:** D-11 é explícito: campos descritivos placeholder NÃO devem aparecer no preview. O preview deve mostrar apenas: título normalizado + nível + força de mercado + alternativas (se fraco). [VERIFIED: 06-CONTEXT.md D-11]

---

## Code Examples

### Objeto stub completo para `/criar-perfil`

```javascript
// Source: inferido do schema em src/lib/profile.ts + decisões D-01, D-02
// Executado via node -e '...' no step de persistência

const PLACEHOLDER = "[A ser definido via /pesquisar-mercado e /refinar-perfil]";
const now = new Date().toISOString();
const uuid = require("crypto").randomUUID();

const stub = {
  id: uuid,
  title: "{tituloNormalizado}",        // confirmado pelo gestor
  suggestedTitle: "{tituloNormalizado}", // mesmo valor inicial
  experienceLevel: "{nivelMapeado}",    // um dos 5 valores válidos do union
  educationLevel: "Superior completo",  // default conservador
  postGraduateLevel: "Não exigido",     // default conservador
  certifications: "Não",               // default conservador
  responsibilities: [PLACEHOLDER],
  qualifications: [{ text: PLACEHOLDER, required: false }],
  behaviors: [PLACEHOLDER],
  challenges: [PLACEHOLDER],
  createdAt: now,
  updatedAt: now
};
```

### Mapeamento título → `experienceLevel`

```
# Source: inferido do ExperienceLevel union em src/lib/profile.ts + convenções do projeto
# O SKILL.md deve incluir esta tabela explicitamente:

Estagiário, Júnior, Jr, I          → "1-3 anos"
Pleno, II, Mid                     → "3-5 anos"
Sênior, Sr, III, Senior            → "5-10 anos"
Staff, Principal, Lead, IV, Expert → "> 10 anos"
Sem nível explícito                → "3-5 anos" (default médio — exibir para confirmação)
```

### Queries WebSearch para análise de força (exemplos orientativos)

```
# Source: inferido de D-07, D-08, D-09 do CONTEXT.md + padrão do pesquisar-mercado
# Número exato (1 ou 2) e queries específicas = Claude's Discretion

Query 1: "{titulo-normalizado} vaga emprego brasil"
Query 2: "{titulo-normalizado} site:linkedin.com/jobs brasil"

# Sinais de força:
# forte  → múltiplos resultados diretos, snippets com esse título exato, muitas vagas abertas
# médio  → resultados existem mas título aparece misturado com variações
# fraco  → poucos resultados diretos, título raramente aparece nos snippets
# nicho  → poucos resultados mas alta especificidade (ex: "Engenheiro de Foguetes SR")
```

### Validação de path traversal para DATA_PATH/profiles/

```javascript
// Source: src/lib/repositories/profile-repository.ts:21-24
// + .agents/skills/pesquisar-mercado/SKILL.md Step 5

const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const profilesDir = path.resolve(dataPath, "profiles");
const filePath = path.resolve(profilesDir, uuid + ".json");
if (!filePath.startsWith(profilesDir + path.sep) && filePath !== profilesDir) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
fs.mkdirSync(profilesDir, { recursive: true });
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Skills em três arquivos físicos separados | Um único arquivo físico com hard links de diretório | Phase 5 (2026-04-22) | Criar só em `.agents/skills/` — não duplicar |
| Escrita JSON via heredoc | Escrita via `node -e` com `fs.writeFileSync` | Phase 5 (2026-04-22) | Evita problemas de escape de aspas |
| `source .env.local` uma vez no Step 0 | `source .env.local &&` em CADA comando Bash | Phase 5 (2026-04-22) | Necessário porque Bash não persiste estado entre tool calls |

**Deprecated:**
- `cat > file << 'EOF'` para JSON: não usar — falha com aspas no conteúdo de campos. [VERIFIED: pesquisar-mercado Notes]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Wording exato do placeholder: `"[A ser definido via /pesquisar-mercado e /refinar-perfil]"` | Code Examples | Baixo — D-02 deixa wording como Claude's Discretion; qualquer texto claro serve |
| A2 | `suggestedTitle` inicialmente igual a `title` no stub | Code Examples | Baixo — campo existe no schema; inicializar com mesmo valor é o default mais sensato sem input adicional do gestor |
| A3 | Mapeamento de nível para ExperienceLevel (tabela orientativa) | Code Examples | Médio — a IA pode interpretar "Staff" de formas diferentes; o SKILL.md deve exibir o nível inferido e pedir confirmação explícita |
| A4 | Número de steps = 5-6 (baseado na complexidade similar ao /abrir-vaga e /refinar-perfil) | Architecture Patterns | Baixo — número de steps é flexível; o planner decide a granularidade |

---

## Open Questions

1. **`suggestedTitle` deve ser igual a `title` ou pedir separadamente?**
   - O que sabemos: ambos existem no schema; o `/refinar-perfil` não pede os dois separadamente; a web app exibe ambos no formulário.
   - O que é incerto: se o gestor quiser título interno diferente do externo já na criação.
   - Recomendação: inicializar com o mesmo valor normalizado; gestor pode diferenciar depois via web app ou `/refinar-perfil`.

2. **Threshold exato para classificação forte/médio/fraco/nicho**
   - O que sabemos: D-08 define as 4 categorias; D-09 exige alternativas se fraco. Número exato de resultados é Claude's Discretion.
   - O que é incerto: thresholds numéricos — quantas vagas = "forte"?
   - Recomendação: planner delega ao agente em execução; o SKILL.md documenta critérios qualitativos (muitos / alguns / poucos / muito específico) sem fixar números.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | UUID + escrita JSON | ✓ | v22.x (verificado: `node -e "console.log(require('crypto').randomUUID())"` executa sem erro) | — |
| WebSearch tool | Análise de força de mercado | ✓ | — (ferramenta nativa do agente) | Se indisponível, classificar como "não verificado" e avisar o gestor |
| `.env.local` com `DATA_PATH` | Persistência do perfil | ✓ (ambiente dev) | — | Erro informativo no Step 0 |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (verificado: `vitest.config.ts` em raiz do projeto) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/__tests__/profile.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRIA-01 | `generateProfileId()` retorna UUID v4 válido | unit | `npx vitest run src/__tests__/profile.test.ts` | ✅ (já cobre `generateProfileId`) |
| CRIA-02 | WebSearch executado com título normalizado (verificação comportamental da skill) | manual | N/A — skill é instrução para IA, não código testável automaticamente | N/A |
| CRIA-03 | Objeto stub criado com campos de `ExperienceLevel` válidos e placeholders nos descritivos | unit | `npx vitest run src/__tests__/profile.test.ts` | ✅ (cobre types e schema) |

### Sampling Rate

- **Per task commit:** `npx vitest run src/__tests__/profile.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green antes do `/gsd-verify-work`

### Wave 0 Gaps

Nenhuma — infraestrutura de testes existente cobre os tipos e schema do `JobProfile`. A skill em si é um arquivo de instruções (SKILL.md), não código TypeScript — não há testes automatizáveis para o fluxo da skill. Verificação de CRIA-02 é manual (piloto de execução).

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | não | Skill é CLI — sem autenticação de usuário |
| V3 Session Management | não | CLI stateless |
| V4 Access Control | não | Single-user; `DATA_PATH` é local do gestor |
| V5 Input Validation | sim | Título livre do gestor — não usado em path; path traversal validado via `path.resolve()` |
| V6 Cryptography | não | UUID não é criptográfico; `crypto.randomUUID()` é adequado para IDs |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via título de cargo com `../` | Tampering | `path.resolve()` + `startsWith(profilesDir)` — padrão já em `JsonProfileRepository` e `pesquisar-mercado` [VERIFIED] |
| Título com caracteres especiais quebra JSON | Tampering | `JSON.stringify()` via `node -e` escapa automaticamente |
| Dados pessoais de candidatos no stub | Information Disclosure | Não aplicável — stub contém apenas dados do cargo, não de candidatos |

---

## Sources

### Primary (HIGH confidence)

- `src/lib/profile.ts` — schema completo de `JobProfile`, `ProfileItem`, `ExperienceLevel` e todos os union types; `generateProfileId()` via `crypto.randomUUID()` [VERIFIED: lido diretamente]
- `.agents/skills/refinar-perfil/SKILL.md` — padrão SKILL.md completo: frontmatter, Step 0, `source .env.local`, `node -e`, estrutura de seções [VERIFIED: lido diretamente]
- `.agents/skills/pesquisar-mercado/SKILL.md` — WebSearch dentro de skills, `node -e` com aspas simples, validação de path traversal, guardrail de slug [VERIFIED: lido diretamente]
- `.agents/skills/abrir-vaga/SKILL.md` — confirmação com preview, UUID via `node -e`, `cat > heredoc` (anti-padrão obsoleto) [VERIFIED: lido diretamente]
- `src/lib/repositories/profile-repository.ts` — `path.resolve()` + `startsWith()` para path traversal; `ensureSubdir`; `fs.writeFileSync` com `JSON.stringify(profile, null, 2)` [VERIFIED: lido diretamente]
- `src/lib/data-service.ts` — `ensureSubdir()` pattern com `mkdirSync({ recursive: true })` [VERIFIED: lido diretamente]
- `.planning/phases/06-guided-profile-creation-skill/06-CONTEXT.md` — todas as decisões D-01 a D-13 [VERIFIED: lido diretamente]
- `ls -lai .agents/skills/abrir-vaga/SKILL.md .claude/skills/abrir-vaga/SKILL.md .cursor/skills/abrir-vaga/SKILL.md` — inode 3572717 idêntico nos três paths [VERIFIED: executado]

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — histórico de Phase 5 confirmando que `.claude/skills` e `.cursor/skills` são hard links de diretório para `.agents/skills`; padrão de escrita `node -e` estabelecido na Phase 5 [VERIFIED: lido diretamente]

### Tertiary (LOW confidence)

Nenhuma fonte de baixa confiança utilizada — todos os claims críticos foram verificados diretamente no codebase.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — lido diretamente de código fonte e skills existentes
- Architecture: HIGH — padrão SKILL.md com 4+ exemplos no projeto; fluxo derivado das decisões D-01 a D-13
- Pitfalls: HIGH — identificados de notas explícitas nas skills existentes e do schema TypeScript
- JobProfile schema: HIGH — lido diretamente de `src/lib/profile.ts` sem suposições

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (schema é imutável para esta phase; skills são estáveis)
