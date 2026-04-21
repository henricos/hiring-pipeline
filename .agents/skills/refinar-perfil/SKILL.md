---
name: refinar-perfil
description: |
  Abre um perfil de vaga existente e oferece sugestões de IA para melhorar
  requisitos, habilidades e descrições. Apresenta antes/depois por campo e
  permite aceitar, rejeitar ou ajustar cada sugestão. Salva o JSON atualizado
  em DATA_PATH/profiles/. Use quando o gestor quiser enriquecer um perfil
  existente com sugestões contextualizadas para P&D/Lyceum.
command: /refinar-perfil
---

# SKILL: Refinar Perfil

Refinamento de perfil de vaga via sugestões de IA contextualizadas. O agente lê
o perfil existente, carrega as instruções de contexto da área e conduz sessão
conversacional de antes/depois por campo.

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

### Step 2: Carregar Perfil e Contexto de Área

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

Exibir resumo:
```
Perfil carregado: {title}
Responsabilidades: {N} itens
Qualificações: {N} itens
Competências: {N} itens
Desafios: {N} itens

Contexto de área: {aiProfileInstructions ?? "(não configurado — acesse /settings para adicionar)"}
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

**4.2 — Gerar sugestão de IA:**

Para `responsibilities`, `behaviors`, `challenges`:
- System: "Você é um especialista em recrutamento para {title}. {aiProfileInstructions}"
- Pedido: "Analise e melhore a lista de {nome do campo} para este cargo. Retorne apenas a lista revisada, um item por linha, sem numeração."

Para `qualifications`:
- System: "Você é um especialista em recrutamento para {title}. {aiProfileInstructions}"
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

### Step 5: Confirmar e Gravar

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

### Step 6: Confirmar Conclusão

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
- **Tipos dos campos:** `responsibilities`, `behaviors`, `challenges` são `string[]`. `qualifications` é `ProfileItem[]` — array de `{ text: string, required: boolean }`. Ao exibir qualifications, mostrar `[Obrigatório]`/`[Diferencial]` por item. Ao gravar qualifications, usar o formato de objeto (ver Step 5). Os outros 3 campos gravam como string[] simples.
- **node -e em vez de heredoc:** O heredoc shell tem problemas com aspas simples e duplas em conteúdo. O node -e lê e grava JSON diretamente, preservando escape correto.
- **Aceitar/Rejeitar/Ajustar:** O gestor tem controle total. A IA sugere — o gestor decide. "Ajustar" permite iterar quantas vezes o gestor quiser antes de aceitar ou rejeitar.
- **Sem backup explícito (D-13):** DATA_PATH é um repositório git. O histórico de versões está disponível via `git log` no diretório de dados.
- **Refinar tudo (Modalidade 3):** Processa os 4 campos na sequência: responsibilities → qualifications → behaviors → challenges. Ao final, exibe resumo consolidado de todos os campos antes de gravar.

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

## Related Skills

- `/abrir-vaga` — criar vaga conversacionalmente a partir de um perfil refinado
- `/fechar-versao` — referência de estrutura e boas práticas de skill

---

**Skill created:** 2026-04-21
**Updated:** —
**Status:** Ready for Claude Code integration
