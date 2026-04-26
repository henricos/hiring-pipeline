---
phase: 07-profile-anchored-market-research
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - .agents/skills/pesquisar-mercado/SKILL.md
  - .agents/skills/refinar-perfil/SKILL.md
  - .agents/skills/atualizar-roles-map/SKILL.md
findings:
  critical: 1
  warning: 5
  info: 3
  total: 9
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Revisados três skills de agente de IA: `pesquisar-mercado` (novo, ativo), `refinar-perfil` (atualizado,
ativo) e `atualizar-roles-map` (descontinuado, mantido como referência histórica).

As skills apresentam boa estrutura geral: UUID v4 validation no Step 1, path traversal guards nos saves,
colisão de nome de arquivo tratada com sufixo numérico, e separação clara entre audit file (vagas.json)
e arquivo de trabalho (resumo.json). A deprecação do `/atualizar-roles-map` está corretamente documentada
com migration note.

Encontrado um bug de campo crítico no Step 6.5 do `/refinar-perfil` (acessa campo inexistente no schema),
um problema de escaping de shell que impede a gravação no Step 6, e um guard de path traversal
insuficiente no loader de pesquisa de mercado. Os demais achados são de qualidade/operação.

---

## Critical Issues

### CR-01: Field name mismatch — `v.requirements` sempre retorna array vazio no Step 6.5

**File:** `.agents/skills/refinar-perfil/SKILL.md:469`

**Issue:** O Step 6.5 lê vagas brutas e acessa `v.requirements` para exibir a amostra de requisitos ao
gestor. Porém, o schema do `/pesquisar-mercado` (Step 4.1) persiste as informações descritivas da vaga
no campo `snippet`, não `requirements`. `v.requirements` será sempre `undefined` para qualquer vaga
gerada pelo skill atual — o fallback `|| []` garante que nenhum erro é lançado, mas a feature de amostra
de vagas sempre exibe listas vazias, tornando-a inútil silenciosamente.

**Fix:**
```javascript
// Substituir em Step 6.5:
// ANTES:
const reqs = (v.requirements || []).slice(0, 3);
reqs.forEach(r => console.log("   · " + r));

// DEPOIS — usar snippet (campo real do schema):
if (v.snippet) {
  console.log("   · " + v.snippet.substring(0, 120) + (v.snippet.length > 120 ? "..." : ""));
}
// Ou, se a intenção for listar requisitos individuais, o campo correto no schema é stack[]:
const stack = (v.stack || []).slice(0, 3);
stack.forEach(s => console.log("   · " + s));
```

---

## Warnings

### WR-01: `node -e` com aspas duplas no Step 6 impede expansão de DATA_PATH

**File:** `.agents/skills/refinar-perfil/SKILL.md:386-397`

**Issue:** O Step 6 usa `node -e "..."` (aspas duplas) com `'$DATA_PATH/profiles/{id}.json'` embutido
entre aspas simples internas. Em bash, aspas simples dentro de uma string de aspas duplas são tratadas
literalmente — `$DATA_PATH` NÃO é expandido. O `filePath` recebido pelo Node será a string literal
`$DATA_PATH/profiles/{id}.json`, causando `ENOENT` ou gravação em caminho errado.

Ironicamente, as Notes do próprio skill (e das outras duas skills) alertam explicitamente para usar
aspas simples no `node -e` — mas o template do Step 6 contradiz essa orientação.

**Fix:**
```bash
# Substituir aspas duplas externas por aspas simples,
# e referenciar DATA_PATH via process.env dentro do script Node:
node -e '
const fs = require("fs");
const filePath = process.env.DATA_PATH + "/profiles/{id}.json";
const profile = JSON.parse(fs.readFileSync(filePath, "utf8"));
profile.responsibilities = {json_array_responsibilities};
profile.qualifications   = {json_array_qualifications};
profile.behaviors        = {json_array_behaviors};
profile.challenges       = {json_array_challenges};
profile.updatedAt        = new Date().toISOString();
fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
console.log("Perfil atualizado com sucesso.");
'
```

---

### WR-02: Guard de path traversal insuficiente no loader de pesquisa (sem `path.sep`)

**File:** `.agents/skills/refinar-perfil/SKILL.md:163`

**Issue:** O guard no Step 2 usa `filePath.startsWith(researchDir)`. Sem `path.sep` como sufixo do
prefixo, o guard não protege adequadamente: se `researchDir` for `/data/research`, um caminho resolvido
como `/data/research-evil/arquivo.json` passa na verificação porque a string começa com `/data/research`.
O `/pesquisar-mercado` resolve isso corretamente adicionando `path.sep` ao guard.

**Fix:**
```javascript
// ANTES:
if (!filePath.startsWith(researchDir)) {

// DEPOIS:
if (!filePath.startsWith(researchDir + path.sep) && filePath !== researchDir) {
```

---

### WR-03: `mkdirSync` executado antes do guard de path traversal (Step 5.2 antes de Step 5.3)

**File:** `.agents/skills/pesquisar-mercado/SKILL.md:326-332`

**Issue:** Step 5.2 executa `fs.mkdirSync(profileDir, { recursive: true })` em um `node -e` separado,
*antes* do guard de path traversal que existe no Step 5.3. O UUID é validado no Step 1 (com regex v4),
mas os snippets de Step 5.2 e 5.3 recebem `{profileId}` como substituição de template sem re-validar
internamente. Se o fluxo de substituição de template do agente for falho, um profileId malformado pode
criar diretórios arbitrários antes do guard de escrita disparar.

**Fix:** Mover a criação de diretório para *dentro* do snippet do Step 5.3, após o guard:
```javascript
// Dentro do node -e do Step 5.3, após a verificação de path traversal:
if (!filePath.startsWith(profileDir + path.sep)) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
fs.mkdirSync(profileDir, { recursive: true }); // mover para cá
fs.writeFileSync(filePath, JSON.stringify(vagasData, null, 2));
```

---

### WR-04: Colisão de nome só verifica `-vagas.json`, ignorando `-resumo.json` existente

**File:** `.agents/skills/pesquisar-mercado/SKILL.md:307-320`

**Issue:** O algoritmo de colisão no Step 5.1 incrementa o sufixo enquanto `{date}-vagas.json` já
existir. Porém, se um arquivo `{date}-resumo.json` existir sem o `-vagas.json` correspondente (ex:
vagas.json foi deletado para economizar espaço), o Step 5.1 calculará `finalBaseName = date` (sem
sufixo) e o Step 6.4 sobrescreverá silenciosamente o resumo.json existente.

**Fix:**
```javascript
// Verificar colisão em ambos os arquivos:
while (fs.existsSync(vagasPath) || fs.existsSync(path.resolve(profileDir, date + suffix + "-resumo.json"))) {
  suffix = "-" + counter;
  vagasPath = path.resolve(profileDir, date + suffix + "-vagas.json");
  counter++;
}
```

---

### WR-05: `DATA_PATH` pode ser indefinido em subprocessos Node (sem re-source por step)

**File:** `.agents/skills/pesquisar-mercado/SKILL.md:33-38`

**Issue:** O Step 0 carrega `DATA_PATH` via `set -a && source .env.local && set +a` em uma chamada
Bash. Como o shell não persiste estado entre invocações do Bash tool, cada `node -e` subsequente em
uma nova chamada Bash terá `process.env.DATA_PATH` indefinido — causando fallback para `"./data"` nos
snippets que usam `process.env.DATA_PATH || "./data"`. O `/refinar-perfil` documenta este problema
explicitamente em suas Notes e exige `source .env.local &&` no início de cada chamada Bash. O
`/pesquisar-mercado` não possui essa nota de alerta nem o `source .env.local` prefixado nos templates
de comandos Node.

**Fix:** Adicionar à seção Notes for Agent:

```
- **Bash não persiste estado entre chamadas:** Cada invocação da ferramenta Bash é um processo novo.
  Todo comando Bash que use `node -e` com `process.env.DATA_PATH` deve ser precedido de
  `source .env.local &&` para garantir que DATA_PATH está disponível no subprocesso Node.
```

E prefixar os templates de `node -e` do Step 5 e Step 6:
```bash
source .env.local && node -e '...'
```

---

## Info

### IN-01: `sessions` array no schema de vagas.json é placeholder sem estrutura definida

**File:** `.agents/skills/pesquisar-mercado/SKILL.md:367`

**Issue:** O campo `sessions: [/* sessoes detectadas */]` no template de gravação do Step 5.3 é um
comentário placeholder. Nenhuma instrução no skill descreve como popular este array — o Step 2.1
apenas lista quais portais têm sessão disponível, mas não define o formato de cada entrada. Contrasta
com `sources[]` que tem formato explícito definido (linha 236).

**Fix:** Documentar o formato esperado ou remover o campo se não for consumido downstream:
```json
"sessions": [
  { "portal": "catho", "path": "catho-session.json", "authenticated": true }
]
```

---

### IN-02: Guard de path traversal no `/atualizar-roles-map` sem `path.sep` (skill descontinuado)

**File:** `.agents/skills/atualizar-roles-map/SKILL.md:340`

**Issue:** O guard no Step 6 usa `path.resolve(filePath).startsWith(path.resolve(dataPath))` sem
sufixo `path.sep` — mesma vulnerabilidade do WR-02. Como a skill está descontinuada e não deve ser
executada para novos levantamentos, o impacto é baixo. Registrado para referência histórica.

**Fix:** Adicionar `+ path.sep` ao prefixo verificado (mesma correção do WR-02).

---

### IN-03: Shuffle não-uniforme ao amostrar vagas no Step 6.5

**File:** `.agents/skills/refinar-perfil/SKILL.md:467`

**Issue:** `.sort(() => Math.random() - 0.5)` é um shuffle não-uniforme conhecido (o resultado favorece
certos elementos com probabilidade ligeiramente maior). Para uma amostra de 3 itens dentre dezenas de
vagas isso é irrelevante na prática, mas vale corrigir para evitar que o mesmo padrão seja copiado para
contextos onde a uniformidade importa.

**Fix:**
```javascript
// Fisher-Yates correto:
function sampleN(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
const sample = sampleN(vagas.jobs || vagas, 3);
```

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
