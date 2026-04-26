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

# SKILL: Refinar Perfil

Refinamento de perfil de vaga via sugestões de IA contextualizadas. O agente lê
o perfil existente, carrega as instruções de contexto da área e conduz sessão
conversacional de antes/depois por campo. Inclui revisão holística de coerência
interna antes do save final.

## Pre-Conditions

- DATA_PATH disponível no ambiente ou em `.env.local` na raiz do projeto (carregado automaticamente no Step 0)
- At least one job profile exists in DATA_PATH/profiles/*.json
- DATA_PATH/settings.json exists (recomendado — sem ele as sugestões não terão contexto P&D)

## Execution Flow

### Step 0: Carregar Variáveis de Ambiente

Se `DATA_PATH` não estiver definido no ambiente, carregar do `.env.local` na raiz do projeto:

```bash
if [ -z "$DATA_PATH" ]; then
  set -a && source .env.local && set +a
fi
```

Se `DATA_PATH` ainda não estiver definido após o carregamento, exibir erro e encerrar:

```
Erro: DATA_PATH não encontrado em .env.local nem no ambiente.
Configure a variável e tente novamente.
```

> **Nota de ambiente:** A ferramenta Bash não persiste estado de shell entre chamadas — cada invocação é um processo novo. Por isso, **todo comando Bash nesta skill deve começar com `source .env.local &&`** para que `DATA_PATH` esteja disponível. O Step 0 valida a existência da variável, mas não elimina a necessidade do re-source nas chamadas seguintes.

### Step 1: Listar Perfis Disponíveis

```bash
source .env.local && ls "$DATA_PATH/profiles/"
```

Ler cada arquivo .json e extrair o campo `title`. Exibir lista numerada:

```
Perfis disponíveis:
1. Cientista de Dados (id: abc123...)
2. Desenvolvedor Frontend Pleno (id: def456...)
3. Desenvolvedor Java Pleno (id: ghi789...)

Qual perfil você quer refinar? (número)
```

Aguardar a seleção do gestor. Registrar o ID do perfil selecionado a partir da lista
(NÃO aceitar ID digitado diretamente pelo gestor — usar somente IDs listados pelo `ls`).

### Step 2: Carregar Perfil, Contexto de Área e Pesquisa de Mercado

```bash
source .env.local && cat "$DATA_PATH/profiles/{profile-id}.json"
source .env.local && cat "$DATA_PATH/settings.json"
```

Extrair do perfil:
- `title` — título do cargo (usar no prompt da IA como contexto)
- `responsibilities[]` — array de strings
- `qualifications[]` — array de `{ text: string, required: boolean }` (obrigatórios e diferenciais)
- `behaviors[]` — array de strings
- `challenges[]` — array de strings

Extrair de settings.json (se existir):
- `aiProfileInstructions` — injetar como contexto do sistema em TODAS as sugestões geradas

**Pergunta sobre pesquisa de mercado (opcional):**

Listar pesquisas disponíveis com data legível:

```bash
node -e '
const fs = require("fs");
const path = require("path");
const researchDir = path.join(process.env.DATA_PATH || "./data", "research");

function collectResumos(dir) {
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return results; }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      let subEntries;
      try { subEntries = fs.readdirSync(fullPath, { withFileTypes: true }); }
      catch (e) { continue; }
      for (const subEntry of subEntries) {
        if (subEntry.isFile() && subEntry.name.endsWith("-resumo.json")) {
          results.push({ file: subEntry.name, dir: fullPath, profileId: entry.name });
        }
      }
    } else if (entry.isFile() && entry.name.endsWith("-resumo.json")) {
      results.push({ file: entry.name, dir: dir, profileId: null });
    }
  }
  return results.sort((a, b) => b.file.localeCompare(a.file));
}

const resumos = collectResumos(researchDir);
if (resumos.length === 0) {
  console.log("(Nenhuma pesquisa de mercado disponivel — execute /pesquisar-mercado para criar uma)");
} else {
  console.log("Pesquisas de mercado disponiveis:");
  const today = new Date().toISOString().split("T")[0];
  resumos.forEach((r, i) => {
    const match = r.file.match(/(\d{4}-\d{2}-\d{2})/);
    const fileDate = match ? match[1] : null;
    let ageLabel = fileDate || r.file;
    if (fileDate) {
      const diff = Math.floor((new Date(today) - new Date(fileDate)) / (1000 * 60 * 60 * 24));
      if (diff === 0) ageLabel = "hoje";
      else if (diff === 1) ageLabel = "ontem";
      else ageLabel = diff + " dias atras";
    }
    const prefix = r.profileId ? r.profileId.substring(0, 8) + " / " : "";
    const legadoSuffix = r.profileId ? "" : " (legado)";
    console.log((i + 1) + ". " + prefix + r.file + " — " + ageLabel + legadoSuffix);
  });
}
'
```

Se houver arquivos `-resumo.json`, exibir:
```
Pesquisas de mercado disponiveis:
1. a1b2c3d4 / 2026-04-26-resumo.json — hoje
2. a1b2c3d4 / 2026-04-22-resumo.json — 4 dias atras
3. senior-pd-java-2026-04-18-resumo.json — 8 dias atras (legado)

Carregar pesquisa como contexto? (numero ou Enter para pular)
```

Se o gestor escolher um número:
- Carregar APENAS o arquivo `-resumo.json` correspondente (NÃO carregar o `-vagas.json` — é arquivo de auditoria/histórico)
- Registrar o conteúdo do resumo como `marketResearch` em memória para uso nos Steps 3-4 e Step 5 holístico

```bash
node -e '
const fs = require("fs");
const path = require("path");
const researchDir = path.join(process.env.DATA_PATH || "./data", "research");
const selectedDir = "{selectedDir}";   // entry.dir do objeto selecionado
const selectedFile = "{selectedFile}"; // entry.file do objeto selecionado
const filePath = path.resolve(selectedDir, selectedFile);
if (!filePath.startsWith(researchDir)) {
  console.error("Path invalido — abortando");
  process.exit(1);
}
console.log(fs.readFileSync(filePath, "utf8"));
'
```

Instrucao ao executor: `{selectedDir}` e `{selectedFile}` sao os campos `dir` e `file` do objeto `resumos[numero - 1]` obtido pela funcao `collectResumos`. O `profileId` do objeto selecionado deve ser registrado em memoria junto com `marketResearch` para uso no Step 6.5.

Se o gestor pular (Enter sem número):
- `marketResearch = null`
- Fluxo continua exatamente como antes (retrocompatível)

Se não houver arquivos `-resumo.json`:
- Exibir: `(Nenhuma pesquisa de mercado disponível — execute /pesquisar-mercado para criar uma)`
- `marketResearch = null`
- Fluxo continua normalmente

**Confirmar nível alvo:**

Inferir o nível a partir do campo `experienceLevel` do perfil:
- `"0-2 anos"` → **Junior**
- `"3-5 anos"` → **Pleno**
- `"5-10 anos"` → **Sênior**
- `"10+ anos"` ou valor ausente → **Especialista / Sênior+**

Exibir ao gestor:
```
Nível alvo inferido: {Pleno} (baseado em experienceLevel: "{3-5 anos}")
Confirmar? (Enter para aceitar / digitar outro nível)
```

Registrar a resposta como `targetLevel` em memória. Este valor é a lente de calibração usada em todo o fluxo — Steps 4 (linguagem das sugestões) e Step 5 (holística de nível).

Exibir resumo ao final do Step 2:
```
Perfil carregado: {title}
Nível alvo: {targetLevel}
Responsabilidades: {N} itens
Qualificações: {N} itens
Competências: {N} itens
Desafios: {N} itens

Contexto de área: {aiProfileInstructions ?? "(não configurado — acesse /settings para adicionar)"}
Pesquisa de mercado: {nome-do-arquivo-resumo.json ou "(não carregada)"}
```

### Step 3: Menu de Modalidades

Exibir menu:

```
O que você quer refinar?

1. Sugerir requisitos e habilidades
   (Responsabilidades e Qualificações — IA-01)

2. Melhorar descrições
   (Competências comportamentais e Desafios — IA-02)

3. Refinar tudo
   (Modalidades 1 e 2 em sequência)

Escolha (1, 2 ou 3):
```

Aguardar seleção. Prosseguir conforme escolha:
- `1` → processar: responsibilities, qualifications
- `2` → processar: behaviors, challenges
- `3` → processar todos os 4 campos em sequência (na ordem: responsibilities, qualifications, behaviors, challenges)

### Step 4: Fluxo Antes/Depois por Campo

Para CADA campo da modalidade selecionada, executar o seguinte ciclo:

**4.1 — Exibir ANTES (conteúdo atual):**

Para `responsibilities`, `behaviors`, `challenges` (string[]):
```
── {nome do campo} ────────────────────────────────
ANTES (conteúdo atual):
  1. {item1}
  2. {item2}
  ...
```

Para `qualifications` (ProfileItem[] com required):
```
── Requisitos e qualificações ─────────────────────
ANTES (conteúdo atual):
  1. [Obrigatório] TypeScript avançado
  2. [Obrigatório] Git
  3. [Diferencial] Docker
  ...
```

**4.2 — Gerar sugestão de IA (três contextos empilhados):**

Os prompts dos Steps 3-4 recebem três contextos empilhados quando `marketResearch` está carregado:

**Quando `marketResearch` não é null (pesquisa carregada):**
- System prompt 1 (fixo): `"Você é um especialista em recrutamento para {title} de nível {targetLevel}. {aiProfileInstructions}"`
- System prompt 2 (variável): `"Pesquisa de mercado atual para este cargo:\n{JSON.stringify(marketResearch.profileHints, null, 2)}\n\nTendências observadas: {marketResearch.summary.trends.join('; ')}"`
- System prompt 3: o perfil atual sendo refinado (campo por campo)
- Instrução de priorização: `"Priorize os dados da pesquisa de mercado ao sugerir melhorias. Calibre a linguagem, a autonomia esperada e a profundidade técnica para o nível {targetLevel}: Junior usa 'executa/aprende', Pleno usa 'aplica/contribui/participa', Sênior usa 'implanta/estabelece/lidera/referência'. Expresse a riqueza do mercado dentro dos 4 campos descritivos — NÃO invente novos campos."`

**Quando `marketResearch` é null (sem pesquisa — comportamento original):**
- System prompt 1 (fixo): `"Você é um especialista em recrutamento para {title} de nível {targetLevel}. {aiProfileInstructions}"`
- Instrução de calibração: `"Calibre a linguagem para o nível {targetLevel}: Junior usa 'executa/aprende', Pleno usa 'aplica/contribui/participa', Sênior usa 'implanta/estabelece/lidera/referência'."`

Para `responsibilities`, `behaviors`, `challenges`:
- System: conforme modelo acima (1 contexto ou três contextos empilhados)
- Pedido: "Analise e melhore a lista de {nome do campo} para este cargo. Retorne apenas a lista revisada, um item por linha, sem numeração."

Para `qualifications`:
- System: conforme modelo acima (1 contexto ou três contextos empilhados)
- Pedido: "Analise e melhore a lista de requisitos e qualificações para este cargo. Para cada item, indique se é Obrigatório ou Diferencial. Retorne no formato: '[Obrigatório] texto' ou '[Diferencial] texto', um por linha, sem numeração."

**4.3 — Exibir DEPOIS (sugestão):**
```
DEPOIS (sugestão da IA):
  1. {sugestão1}
  2. {sugestão2}
  ...

[A]ceitar / [R]ejeitar / [J]ustar
```

**4.4 — Processar decisão do gestor:**
- `A` (aceitar) → substituir o campo no objeto de perfil em memória pela sugestão
- `R` (rejeitar) → manter o conteúdo original; prosseguir para o próximo campo
- `J` (ajustar) → pedir ao gestor que descreva o ajuste desejado; gerar nova sugestão; repetir 4.3-4.4

Repetir o ciclo até o gestor resolver todos os campos da modalidade.

### Step 5: Revisão Holística

Com o perfil completo pós-ciclo A/R/J em memória, solicitar à IA que detecte incoerências internas. A IA lê o perfil na íntegra e identifica os seguintes tipos de incoerência:

**Tipo 1 — Lacunas responsabilidades × qualificações:**
Responsabilidade cita habilidade/área (ex: "arquitetar soluções de IA generativa", "liderar time técnico") mas nenhuma qualificação correspondente existe.

**Tipo 2 — Redundâncias entre campos:**
Mesmo ponto dito de formas ligeiramente diferentes em responsibilities E qualifications, ou em behaviors E challenges.

**Tipo 3 — Descalibração de nível (`targetLevel` × linguagem do conteúdo):**
Responsabilidades, qualificações obrigatórias ou desafios usam linguagem de nível superior ao `targetLevel` confirmado pelo gestor. Usar a matriz abaixo como referência:

| Nível | Verbos e traços típicos | Sinais de nível superior |
|---|---|---|
| **Junior** | executa, aprende, implementa sob orientação, autonomia limitada | ownership de projeto, definir padrões, referenciar outros times |
| **Pleno** | aplica, contribui, participa do ciclo, resolve com apoio eventual | implantar práticas do zero, ser referência cross-team, ownership end-to-end |
| **Sênior** | implanta, estabelece, lidera, define arquitetura, referência cross-team | gestão de pessoas, P&L, decisões estratégicas de produto |

Identificar itens que usam linguagem de nível superior ao `targetLevel` e sugerir reformulação calibrada.

**Tipo 4 — Lacunas comportamentais:**
As responsabilidades exigem liderança, mentoria ou comunicação com stakeholders, mas nenhum `behavior` correspondente existe no perfil.

**Prompt para a IA (executar com perfil completo como contexto):**
- System: "Você é um especialista em coerência de perfis de vaga. O nível alvo deste perfil é {targetLevel}. Analise o perfil abaixo e identifique inconsistências internas nos seguintes tipos: (1) responsabilidades sem qualificação correspondente, (2) redundâncias entre campos, (3) linguagem de nível superior ao targetLevel — use a matriz: Junior=executa/aprende, Pleno=aplica/contribui/participa, Sênior=implanta/estabelece/lidera/referência cross-team, (4) responsabilidades de liderança sem competência comportamental correspondente."
- Pedido: "Retorne cada finding numerado, descrevendo o problema e sugerindo uma correção específica calibrada para o nível {targetLevel}. Sem limite de findings — liste todas as incoerências encontradas."

**Exibição dos findings:**

```
── Revisão Holística ────────────────────────────────
Analisando coerência interna do perfil "{title}"...

Incoerências encontradas:

1. [Lacuna R×Q] Responsabilidade cita "integração com LLMs" mas nenhuma qualificação
   de experiência com APIs de IA está presente.
   Sugestão: adicionar qualificação "[Obrigatório] Experiência com LLMs e APIs de IA generativa"

2. [Redundância] "Comunicação clara com stakeholders" aparece em behaviors e como
   responsabilidade descrita de forma idêntica.
   Sugestão: remover da responsabilidade (manter em behaviors, que é mais adequado).

3. [Descalibração] Title é "Engenheiro Sênior" mas experienceLevel é "1-3 anos".
   Sugestão: ajustar experienceLevel para "5-10 anos" ou revisar o title.

Por item, escolha:
  [A]plicar sugestão  [I]gnorar  [J]ustar (descrever ajuste)
```

**Processar decisão por item:**
- `A` → aplicar a sugestão da IA diretamente ao perfil em memória
- `I` → ignorar; prosseguir para o próximo finding
- `J` → pedir ao gestor que descreva o ajuste; aplicar o ajuste informado; perguntar: "[A]ceitar ajuste? (S/N)"

**Sem limite de findings:** A IA lista TODAS as incoerências encontradas. Gestor decide por item.

Se a IA não encontrar incoerências:
```
Nenhuma incoerência detectada. Perfil coerente para gravação.
```

Ao final dos findings, exibir resumo:
```
Holística concluída.
Findings aplicados: {N}  |  Ignorados: {M}  |  Ajustados: {P}
```

Prosseguir para Step 6 (gravação).

### Step 6: Confirmar e Gravar

Antes de gravar, exibir resumo das alterações:

```
── Resumo das alterações ─────────────────────────
Campos aceitos:   responsibilities, qualifications
Campos rejeitados: behaviors
Campos sem mudança: challenges

Confirmar gravação? (S/N)
```

Se confirmado, gravar usando node (NÃO heredoc — evita problemas de escape com aspas e newlines):

```bash
node -e "
const fs = require('fs');
const filePath = '$DATA_PATH/profiles/{id}.json';
const profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
profile.responsibilities = {json_array_responsibilities};
profile.qualifications = {json_array_qualifications};
profile.behaviors = {json_array_behaviors};
profile.challenges = {json_array_challenges};
profile.updatedAt = new Date().toISOString();
fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
console.log('Perfil atualizado com sucesso.');
"
```

Substituir `{json_array_*}` pelo JSON.stringify() de cada array (apenas os campos alterados).
Campos rejeitados mantêm o valor original — não sobrescrever.

**Formato correto para qualifications** (ProfileItem[] — NÃO string[]):
```json
[
  { "text": "TypeScript avançado", "required": true },
  { "text": "Docker", "required": false }
]
```

Para converter a resposta da IA (formato `[Obrigatório] texto` / `[Diferencial] texto`) em ProfileItem[]:
- Linha começa com `[Obrigatório]` → `{ text: "...", required: true }`
- Linha começa com `[Diferencial]` → `{ text: "...", required: false }`
- Linha sem prefixo → `{ text: "...", required: true }` (padrão conservador)

### Step 6.5: Confronto com Pesquisa de Mercado (opcional)

Executar somente se `marketResearch != null`. Ocorre após a gravação confirmada no Step 6.

Comparar o perfil final (estado em memória) com `marketResearch.summary` e `marketResearch.profileHints`:

**6.5.1 — Stack do mercado × qualificações do perfil:**

Para cada tecnologia no top 5 de `marketResearch.summary.stackFrequency`, verificar cobertura nas qualificações:
- `✓ coberto (Obrigatório)` — item está em qualifications com required: true
- `~ coberto (Diferencial)` — item está em qualifications com required: false
- `✗ ausente` — nenhuma qualificação menciona a tecnologia

**6.5.2 — Responsabilidades do mercado não cobertas:**

Comparar `marketResearch.profileHints.responsibilities` com as responsabilidades finais. Listar as do mercado sem cobertura equivalente no perfil.

**6.5.3 — Avaliação geral:**
- **Alinhado:** cobertura ≥ 80% do top 5 de stack + responsabilidades essenciais presentes
- **Parcialmente alinhado:** cobertura 50–79%
- **Divergente:** cobertura < 50%

**Exibição:**
```
── Confronto com Pesquisa de Mercado ──────────────────
Stack do mercado (top 5) × qualificações do perfil:
  ✓ Python           — coberto (Obrigatório)
  ✓ SQL              — coberto (Obrigatório)
  ✓ Machine Learning — coberto (Obrigatório)
  ~ Cloud            — coberto (Obrigatório)
  ~ LLM/IA Generativa — coberto (Diferencial) — mercado: 47% das vagas

Responsabilidades do mercado não cobertas:
  (nenhuma lacuna identificada)

Avaliação geral: alinhado com o mercado para nível {targetLevel}.

Ver amostra de 3 vagas de referência da pesquisa? (S/N)
```

Se o gestor responder S:
- Carregar o arquivo `-vagas.json` referenciado em `marketResearch.vagasFile` (apenas para leitura):
```bash
source .env.local && DATA_PATH="$DATA_PATH" node -e '
const fs = require("fs"), path = require("path");
// Se a pesquisa selecionada e do novo formato (tem profileId), usar subpasta
const selectedProfileId = "{profileId do resumo selecionado ou null}";
const vagasPath = selectedProfileId
  ? path.join(process.env.DATA_PATH, "research", selectedProfileId, "{vagasFile}")
  : path.join(process.env.DATA_PATH, "research", "{vagasFile}"); // fallback legado
const vagas = JSON.parse(fs.readFileSync(vagasPath, "utf8"));
const sample = vagas.sort(() => Math.random() - 0.5).slice(0, 3);
sample.forEach((v, i) => {
  console.log((i+1) + ". " + v.title + " — " + (v.company || "empresa nao informada"));
  const reqs = (v.requirements || []).slice(0, 3);
  reqs.forEach(r => console.log("   · " + r));
  console.log("");
});
'
```

O `profileId` aqui e o campo `profileId` do objeto selecionado em memoria (registrado no Step 2). Para resumos no novo formato, o campo `profileId` do JSON tambem esta disponivel — pode ser obtido de `marketResearch.profileId` apos o carregamento.
- Exibir título, empresa e os 3 primeiros requisitos de cada vaga amostrada
- Não abre novo ciclo A/R/J — é apenas referência visual para o gestor

Se o gestor responder N ou se `vagasFile` não existir:
- Prosseguir para Step 7

### Step 7: Confirmar Conclusão

```
Perfil atualizado com sucesso!
Arquivo: $DATA_PATH/profiles/{id}.json
Campos alterados: {lista dos campos aceitos}

Próximas ações:
- Abra /profiles/{id}/edit na web app para revisar o resultado
- Execute /abrir-vaga para criar uma vaga com este perfil refinado
```

## Notes for Agent

- **Bash não persiste estado entre chamadas:** Cada invocação da ferramenta Bash é um processo novo. Incluir `source .env.local &&` no início de TODO comando que use `DATA_PATH`. O Step 0 valida a variável, mas não elimina a necessidade do re-source nas chamadas subsequentes.
- **targetLevel é confirmado no Step 2, usado em todo o fluxo:** Inferir do `experienceLevel` do perfil e confirmar com o gestor antes do menu. Injetar no system prompt do Step 4 e no prompt da holística do Step 5. Nunca usar `experienceLevel` bruto como targetLevel sem confirmação — o gestor pode corrigir o nível.
- **aiProfileInstructions é o contexto principal:** Ler settings.json ANTES de gerar qualquer sugestão. Injetar o campo como contexto do sistema ("Você é um especialista em {aiProfileInstructions}..."). Se settings.json não existir ou o campo estiver vazio, avisar o gestor e prosseguir com contexto genérico.
- **IDs são da lista, nunca do gestor:** Sempre usar o ID obtido do `ls` na Step 1. Nunca aceitar um UUID digitado livremente pelo gestor — isso previne path traversal e sobrescrita de arquivo errado.
- **Tipos dos campos:** `responsibilities`, `behaviors`, `challenges` são `string[]`. `qualifications` é `ProfileItem[]` — array de `{ text: string, required: boolean }`. Ao exibir qualifications, mostrar `[Obrigatório]`/`[Diferencial]` por item. Ao gravar qualifications, usar o formato de objeto (ver Step 6). Os outros 3 campos gravam como string[] simples.
- **node -e em vez de heredoc:** O heredoc shell tem problemas com aspas simples e duplas em conteúdo. O node -e lê e grava JSON diretamente, preservando escape correto.
- **Aceitar/Rejeitar/Ajustar:** O gestor tem controle total. A IA sugere — o gestor decide. "Ajustar" permite iterar quantas vezes o gestor quiser antes de aceitar ou rejeitar.
- **Sem backup explícito (D-13):** DATA_PATH é um repositório git. O histórico de versões está disponível via `git log` no diretório de dados.
- **Refinar tudo (Modalidade 3):** Processa os 4 campos na sequência: responsibilities → qualifications → behaviors → challenges. Ao final, exibe resumo consolidado de todos os campos antes de gravar.
- **Pesquisa de mercado — carregamento apenas do -resumo.json:** Ao carregar pesquisa no Step 2, carregar APENAS o arquivo `-resumo.json` (NÃO o `-vagas.json`). O arquivo de vagas brutas é para auditoria/histórico; o resumo contém o `profileHints` já estruturado para injeção no prompt.
- **Discovery de -resumo.json pos-Phase 7:** A funcao `collectResumos` percorre dois niveis: (1) arquivos -resumo.json diretamente em `research/` (legado flat — exibidos com "(legado)"); (2) arquivos -resumo.json em `research/{profileId}/` (novo formato — exibidos com UUID curto como prefixo). O path de leitura usa `entry.dir` do objeto retornado, nao concatenacao manual de researchDir + filename.
- **Step 6.5 pos-Phase 7:** O vagasFile de resumos no novo formato esta em `research/{profileId}/`, nao em `research/`. Usar `marketResearch.profileId` (ou o `profileId` registrado no Step 2) para montar o path correto. Resumos legados (profileId null) continuam no path antigo — fallback preservado.
- **Pesquisa de mercado — fallback quando não selecionada:** Se `marketResearch = null`, o fluxo continua exatamente como o comportamento original — apenas o System prompt 1 (`aiProfileInstructions`) é usado nos Steps 3-4. Retrocompatível sem qualquer degradação.
- **Três contextos empilhados — priorização da pesquisa:** Quando pesquisa está carregada, o System prompt 2 injeta `marketResearch.profileHints` + `summary.trends`. A instrução de priorização orienta a IA a expressar a riqueza do mercado (stack híbrido, arquétipo) dentro dos 4 campos do JobProfile — NÃO inventar novos campos (D-01 imutável).
- **Step 5 holístico analisa o perfil APÓS o ciclo A/R/J:** A revisão holística opera sobre o perfil já refinado em memória, não sobre o perfil original do arquivo. A gravação real acontece no Step 6, após o gestor confirmar.
- **[A/I/J] no Step 5 é o mesmo padrão do Step 4:** O gestor já está familiarizado com o ciclo — [A]plicar, [I]gnorar, [J]ustar são as mesmas ações. Sem limite de findings — a IA lista todas as incoerências.
- **Applying [A] no Step 5 modifica o perfil em memória:** Cada [A] aplica a sugestão da holística no objeto de perfil em memória. A gravação real acontece somente no Step 6, após confirmação explícita do gestor.
- **IA usa apenas os 4 campos descritivos do JobProfile ao aplicar sugestões do holístico:** Nunca inventar campos novos. As sugestões de correção do Step 5 devem sempre apontar para `responsibilities`, `qualifications`, `behaviors` ou `challenges` — não campos inexistentes no schema.

## Troubleshooting

**"DATA_PATH não está definido"**
→ Configurar a variável de ambiente:
```bash
export DATA_PATH=/caminho/para/repo-de-dados
```

**"Nenhum perfil encontrado"**
→ Verificar que existe ao menos um .json em $DATA_PATH/profiles/. Se a base foi zerada, criar perfis via web app em /profiles/new.

**"settings.json não encontrado"**
→ Acessar /settings na web app e salvar as configurações da área. O campo "Instruções para IA montar perfil" é especialmente importante para sugestões contextualizadas.

**"Erro ao gravar o perfil"**
→ Verificar permissões em $DATA_PATH/profiles/. Confirmar que o arquivo {id}.json existe e não está corrompido: `cat $DATA_PATH/profiles/{id}.json | python3 -m json.tool`

**"A sugestão da IA não faz sentido para o nosso contexto"**
→ Preencher o campo "Instruções para IA montar perfil" em /settings com mais detalhes sobre a área P&D/Lyceum: produtos, linguagem, perfil de candidato ideal, jargões internos.

**"IA lista findings irrelevantes na holística"**
→ Usar [I] para ignorar os findings irrelevantes. Se os findings estiverem sistematicamente fora do contexto da área, considerar ajustar o campo `aiProfileInstructions` em /settings — ele orienta o Step 4 e influencia indiretamente a qualidade da holística.

## Related Skills

- `/abrir-vaga` — criar vaga conversacionalmente a partir de um perfil refinado
- `/pesquisar-mercado` — coletar dados de vagas reais em portais BR para alimentar o Step 2 desta skill
- `/fechar-versao` — referência de estrutura e boas práticas de skill

---

**Skill created:** 2026-04-21
**Updated:** 2026-04-22 — Step 2 evoluído com pesquisa de mercado opcional; Steps 3-4 com três contextos empilhados; Step 5 holístico inserido (4 tipos de incoerência, padrão [A/I/J]); Steps 5→6, 6→7 renumerados
**Updated:** 2026-04-22 (v2) — 4 melhorias pós-primeira-execução: (1) nota de Bash state persistence + `source .env.local` em todos os templates de comando; (2) confirmação de `targetLevel` no Step 2 antes do menu, injetado no system prompt dos Steps 4 e 5; (3) Tipo 3 da holística expandido com matriz de verbos por nível (Junior/Pleno/Sênior); (4) Step 6.5 — confronto pós-gravação do perfil final com pesquisa de mercado (top 5 stack, cobertura de responsabilidades, avaliação geral, amostra opcional de vagas)
**Updated:** 2026-04-26 (v3) — Phase 7: Step 2 atualizado com discovery recursivo de dois niveis (research/{profileId}/ e research/ legado); Step 6.5 com path de vagasFile corrigido para subpastas; Notes expandidas com guardrails do novo discovery
**Status:** Ready for Claude Code integration
