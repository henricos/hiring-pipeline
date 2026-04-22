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

- DATA_PATH environment variable set and pointing to the data repository directory
- At least one job profile exists in DATA_PATH/profiles/*.json
- DATA_PATH/settings.json exists (recomendado — sem ele as sugestões não terão contexto P&D)

## Execution Flow

### Step 1: Listar Perfis Disponíveis

```bash
ls $DATA_PATH/profiles/
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
cat $DATA_PATH/profiles/{profile-id}.json
cat $DATA_PATH/settings.json
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
node -e "
const fs = require('fs');
const path = require('path');
const researchDir = path.join(process.env.DATA_PATH || './data', 'research');
try {
  const files = fs.readdirSync(researchDir)
    .filter(f => f.endsWith('-resumo.json'))
    .sort().reverse();
  if (files.length === 0) {
    console.log('(Nenhuma pesquisa de mercado disponível — execute /pesquisar-mercado para criar uma)');
  } else {
    console.log('Pesquisas de mercado disponíveis:');
    const today = new Date().toISOString().split('T')[0];
    files.forEach((f, i) => {
      const match = f.match(/(\d{4}-\d{2}-\d{2})/);
      const fileDate = match ? match[1] : null;
      let label = fileDate || f;
      if (fileDate) {
        const diff = Math.floor((new Date(today) - new Date(fileDate)) / (1000 * 60 * 60 * 24));
        if (diff === 0) label = 'hoje';
        else if (diff === 1) label = 'ontem';
        else label = diff + ' dias atrás';
      }
      console.log((i + 1) + '. ' + f + ' — ' + label);
    });
  }
} catch (e) {
  console.log('(Nenhuma pesquisa de mercado disponível — execute /pesquisar-mercado para criar uma)');
}
"
```

Se houver arquivos `-resumo.json`, exibir:
```
Pesquisas de mercado disponíveis:
1. senior-pd-java-python-ts-sp-2026-04-22-resumo.json — hoje
2. senior-pd-java-python-ts-sp-2026-04-21-resumo.json — ontem
3. dev-java-pleno-sp-2026-04-18-resumo.json — 4 dias atrás

Carregar pesquisa como contexto? (número ou Enter para pular)
```

Se o gestor escolher um número:
- Carregar APENAS o arquivo `-resumo.json` correspondente (NÃO carregar o `-vagas.json` — é arquivo de auditoria/histórico)
- Registrar o conteúdo do resumo como `marketResearch` em memória para uso nos Steps 3-4 e Step 5 holístico

```bash
node -e "
const fs = require('fs');
const path = require('path');
const researchDir = path.join(process.env.DATA_PATH || './data', 'research');
// {selectedFile} é o nome do arquivo selecionado pelo gestor
const filePath = path.resolve(researchDir, '{selectedFile}');
if (!filePath.startsWith(researchDir)) {
  console.error('Path inválido — abortando');
  process.exit(1);
}
console.log(fs.readFileSync(filePath, 'utf8'));
"
```

Se o gestor pular (Enter sem número):
- `marketResearch = null`
- Fluxo continua exatamente como antes (retrocompatível)

Se não houver arquivos `-resumo.json`:
- Exibir: `(Nenhuma pesquisa de mercado disponível — execute /pesquisar-mercado para criar uma)`
- `marketResearch = null`
- Fluxo continua normalmente

Exibir resumo ao final do Step 2:
```
Perfil carregado: {title}
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
- System prompt 1 (fixo): `"Você é um especialista em recrutamento para {title}. {aiProfileInstructions}"`
- System prompt 2 (variável): `"Pesquisa de mercado atual para este cargo:\n{JSON.stringify(marketResearch.profileHints, null, 2)}\n\nTendências observadas: {marketResearch.summary.trends.join('; ')}"`
- System prompt 3: o perfil atual sendo refinado (campo por campo)
- Instrução de priorização: `"Priorize os dados da pesquisa de mercado ao sugerir melhorias. Quando a pesquisa indicar tendências de stack ou arquétipo, expresse essa riqueza dentro dos 4 campos descritivos do perfil (responsibilities, qualifications, behaviors, challenges) — NÃO invente novos campos."`

**Quando `marketResearch` é null (sem pesquisa — comportamento original):**
- Usar apenas System prompt 1 (comportamento retrocompatível)

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

**Tipo 3 — Descalibração título × conteúdo:**
O `title` diz "Sênior" mas as responsabilidades parecem de Pleno, ou o `experienceLevel` está desalinhado com o nível de complexidade das responsabilidades.

**Tipo 4 — Lacunas comportamentais:**
As responsabilidades exigem liderança, mentoria ou comunicação com stakeholders, mas nenhum `behavior` correspondente existe no perfil.

**Prompt para a IA (executar com perfil completo como contexto):**
- System: "Você é um especialista em coerência de perfis de vaga. Analise o perfil abaixo e identifique inconsistências internas nos seguintes tipos: (1) responsabilidades sem qualificação correspondente, (2) redundâncias entre campos, (3) desalinhamento título/experiência vs. conteúdo, (4) responsabilidades de liderança sem competência comportamental correspondente."
- Pedido: "Retorne cada finding numerado, descrevendo o problema e sugerindo uma correção específica. Sem limite de findings — liste todas as incoerências encontradas."

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

- **aiProfileInstructions é o contexto principal:** Ler settings.json ANTES de gerar qualquer sugestão. Injetar o campo como contexto do sistema ("Você é um especialista em {aiProfileInstructions}..."). Se settings.json não existir ou o campo estiver vazio, avisar o gestor e prosseguir com contexto genérico.
- **IDs são da lista, nunca do gestor:** Sempre usar o ID obtido do `ls` na Step 1. Nunca aceitar um UUID digitado livremente pelo gestor — isso previne path traversal e sobrescrita de arquivo errado.
- **Tipos dos campos:** `responsibilities`, `behaviors`, `challenges` são `string[]`. `qualifications` é `ProfileItem[]` — array de `{ text: string, required: boolean }`. Ao exibir qualifications, mostrar `[Obrigatório]`/`[Diferencial]` por item. Ao gravar qualifications, usar o formato de objeto (ver Step 6). Os outros 3 campos gravam como string[] simples.
- **node -e em vez de heredoc:** O heredoc shell tem problemas com aspas simples e duplas em conteúdo. O node -e lê e grava JSON diretamente, preservando escape correto.
- **Aceitar/Rejeitar/Ajustar:** O gestor tem controle total. A IA sugere — o gestor decide. "Ajustar" permite iterar quantas vezes o gestor quiser antes de aceitar ou rejeitar.
- **Sem backup explícito (D-13):** DATA_PATH é um repositório git. O histórico de versões está disponível via `git log` no diretório de dados.
- **Refinar tudo (Modalidade 3):** Processa os 4 campos na sequência: responsibilities → qualifications → behaviors → challenges. Ao final, exibe resumo consolidado de todos os campos antes de gravar.
- **Pesquisa de mercado — carregamento apenas do -resumo.json:** Ao carregar pesquisa no Step 2, carregar APENAS o arquivo `-resumo.json` (NÃO o `-vagas.json`). O arquivo de vagas brutas é para auditoria/histórico; o resumo contém o `profileHints` já estruturado para injeção no prompt.
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
**Status:** Ready for Claude Code integration
