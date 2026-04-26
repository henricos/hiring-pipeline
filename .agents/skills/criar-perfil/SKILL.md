---
name: criar-perfil
description: |
  Cria um perfil mínimo de vaga (stub) a partir de um título de cargo fornecido
  pelo gestor. Normaliza o título via LLM, infere o nível de senioridade,
  executa análise de força do título no mercado BR via WebSearch (1-2 queries),
  exibe preview de confirmação e persiste um JobProfile stub em
  DATA_PATH/profiles/{uuid}.json com placeholders nos campos descritivos —
  pronto para enriquecimento via /pesquisar-mercado e /refinar-perfil.
  Use quando o gestor quiser criar um novo perfil de cargo com validação de
  mercado antes de detalhar os requisitos.
command: /criar-perfil
---

# SKILL: Criar Perfil

Criação guiada de perfil de vaga com análise de força de mercado. O gestor
informa um título livre, a skill normaliza, analisa a demanda via WebSearch e
persiste um stub JSON válido em DATA_PATH/profiles/. O perfil criado é
estruturalmente completo e imediatamente utilizável via /refinar-perfil.

## Pre-Conditions

- DATA_PATH disponível no ambiente ou em `.env.local` na raiz do projeto
  (carregado automaticamente no Step 0)
- Ferramenta WebSearch disponível no agente (necessária para Step 2)

## Execution Flow

### Step 0: Carregar Variáveis de Ambiente

Se `DATA_PATH` não estiver definido no ambiente, carregar do `.env.local` na
raiz do projeto:

```bash
if [ -z "$DATA_PATH" ]; then
  set -a && source .env.local && set +a
fi
```

Se `DATA_PATH` ainda não estiver definido após o carregamento, exibir erro
e encerrar:

```
Erro: DATA_PATH não encontrado em .env.local nem no ambiente.
Configure a variável e tente novamente.
```

> **Nota de ambiente:** A ferramenta Bash não persiste estado de shell entre
> chamadas — cada invocação é um processo novo. Por isso, **todo comando Bash
> nesta skill deve começar com `source .env.local &&`** para que `DATA_PATH`
> esteja disponível. O Step 0 valida a existência da variável, mas não elimina
> a necessidade do re-source nas chamadas seguintes.

### Step 1: Normalizar Título e Inferir Nível

Pedir ao gestor que informe o título do cargo:

```
Qual é o título do cargo? (ex: "dev backend pleno", "engenheiro de dados sênior")
```

Com o título informado, usar o LLM (raciocínio interno — sem ferramenta externa)
para:

1. **Normalizar o título:** converter para a forma de mercado capitalizada
   (ex: "dev backend pleno" → "Desenvolvedor Backend Pleno")
2. **Inferir o nível de senioridade** usando a tabela abaixo e mapear para um
   dos 5 valores válidos de `experienceLevel`:

| Título contém                          | experienceLevel   |
|----------------------------------------|-------------------|
| Estagiário, Estágio                    | "< 1 ano"         |
| Júnior, Jr, Junior, I                  | "1-3 anos"        |
| Pleno, II, Mid                         | "3-5 anos"        |
| Sênior, Sr, Senior, III                | "5-10 anos"       |
| Staff, Principal, Lead, Expert, IV     | "> 10 anos"       |
| Sem nível explícito                    | "3-5 anos" (default — exibir para confirmação) |

Exibir proposta para confirmação:

```
Título normalizado: Desenvolvedor Backend Pleno
Nível:              3-5 anos

Confirmar? (Enter para aceitar / digitar correção)
```

Aguardar a resposta do gestor:
- Enter (sem texto) → aceitar proposta como está
- Texto livre → tratar como correção; normalizar novamente e exibir nova proposta
- "abortar" → encerrar sem criar perfil

Registrar `tituloConfirmado` e `nivelConfirmado` em memória.

### Step 2: Análise de Força de Mercado

Executar 2 queries WebSearch para estimar a demanda pelo título confirmado no
mercado BR. As queries devem usar o título confirmado exatamente como normalizado:

- Query 1: `"{tituloConfirmado}" vaga emprego brasil`
- Query 2: `"{tituloConfirmado}" site:linkedin.com/jobs brasil`

**IMPORTANTE:** A classificação deve ser baseada nos resultados das queries
executadas neste step — nunca em conhecimento de treinamento.

Com base nos resultados obtidos, classificar a força em uma das 4 categorias:

| Classificação | Sinal dos resultados |
|---------------|----------------------|
| **forte**     | Múltiplos resultados diretos, título exato aparece frequentemente nos snippets, muitas vagas abertas listadas |
| **médio**     | Resultados existem mas o título aparece misturado com variações; volume moderado de vagas |
| **fraco**     | Poucos resultados diretos; título raramente aparece nos snippets; volume baixo de vagas |
| **nicho**     | Poucos resultados mas alta especificidade (título muito técnico ou organizacional); pode ser correto, mas mercado menor |

Se a classificação for **fraco** ou **nicho**, identificar 2-3 títulos alternativos
mais comuns no mercado BR para o mesmo papel.

### Step 3: Preview de Confirmação

Exibir o preview enxuto (D-11 — NÃO incluir os campos descritivos placeholder):

```
─────────────────────────────────────────────────────
Perfil a ser criado:
  Título:             {tituloConfirmado}
  Nível:              {nivelConfirmado}
  Força de mercado:   {forte | médio | fraco | nicho}
  {[Se fraco ou nicho] Títulos alternativos sugeridos:
    · {alternativa1}
    · {alternativa2}}
─────────────────────────────────────────────────────

Confirmar criação? (S / N / ajustar título)
```

Processar resposta:
- `S` ou `s` → prosseguir para Step 4
- `N` ou `n` → encerrar sem criar perfil; exibir "Criação cancelada."
- Texto de ajuste → tratar como novo título; voltar ao Step 1 com o novo título
  (sem perguntar novamente — normalizar diretamente e exibir novo preview)

### Step 4: Gerar UUID e Montar Stub

Gerar UUID v4 via Node.js:

```bash
source .env.local && node -e "console.log(require('crypto').randomUUID())"
```

Registrar o UUID como `profileId` em memória.

Montar o objeto stub em memória com os seguintes valores:

```javascript
const PLACEHOLDER = "[A ser definido via /pesquisar-mercado e /refinar-perfil]";
const now = new Date().toISOString();

const stub = {
  id: profileId,                          // UUID gerado acima
  title: tituloConfirmado,               // título confirmado pelo gestor
  suggestedTitle: tituloConfirmado,      // mesmo valor inicial
  experienceLevel: nivelConfirmado,      // um dos 5 valores válidos do union
  educationLevel: "Superior completo",   // default conservador
  postGraduateLevel: "Não exigido",      // default conservador
  certifications: "Não",                 // default conservador
  responsibilities: [PLACEHOLDER],
  qualifications: [{ text: PLACEHOLDER, required: false }],
  behaviors: [PLACEHOLDER],
  challenges: [PLACEHOLDER],
  createdAt: now,
  updatedAt: now
};
```

### Step 5: Persistir em DATA_PATH/profiles/

Gravar o stub JSON usando `node -e` com validação de path traversal.
Substituir `{profileId}` pelo UUID gerado no Step 4 e `{stubJson}` pelo
JSON.stringify() do objeto stub montado no Step 4:

```bash
source .env.local && node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const profilesDir = path.resolve(dataPath, "profiles");
const filePath = path.resolve(profilesDir, "{profileId}.json");
if (!filePath.startsWith(profilesDir + path.sep) && filePath !== profilesDir) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
fs.mkdirSync(profilesDir, { recursive: true });
const PLACEHOLDER = "[A ser definido via /pesquisar-mercado e /refinar-perfil]";
const now = new Date().toISOString();
const stub = {
  id: "{profileId}",
  title: "{tituloConfirmado}",
  suggestedTitle: "{tituloConfirmado}",
  experienceLevel: "{nivelConfirmado}",
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
fs.writeFileSync(filePath, JSON.stringify(stub, null, 2));
console.log("Perfil criado em:", filePath);
'
```

Se o comando retornar erro, exibir a mensagem de erro e encerrar sem perfil criado.

### Step 6: Exibir Resultado e Próximos Passos

```
─────────────────────────────────────────────────────
Perfil criado com sucesso!
ID:      {profileId}
Título:  {tituloConfirmado}
Nível:   {nivelConfirmado}
Arquivo: $DATA_PATH/profiles/{profileId}.json

Próximas ações:
  1. /pesquisar-mercado — enriquecer com dados reais do mercado BR
  2. /refinar-perfil — iterar os campos descritivos com IA
─────────────────────────────────────────────────────
```

## Notes for Agent

- **Bash não persiste estado entre chamadas:** Cada invocação da ferramenta
  Bash é um processo novo. Incluir `source .env.local &&` no início de TODO
  comando que use `DATA_PATH`. O Step 0 valida a variável, mas não elimina
  a necessidade do re-source nas chamadas subsequentes.

- **`experienceLevel` deve ser exatamente um dos 5 valores do union type:**
  Os valores válidos são: `"< 1 ano"`, `"1-3 anos"`, `"3-5 anos"`,
  `"5-10 anos"`, `"> 10 anos"`. Não gravar variações como "Sênior", "5 anos"
  ou "senior" — a web app não carregará o perfil e o JSON.parse pode falhar
  silenciosamente.

- **Classificação de força DEVE ser baseada em WebSearch executado:**
  Nunca classificar com base em conhecimento de treinamento. O Step 2 exige
  execução real das queries WebSearch. Um sinal de problema: classificação
  imediata (< 5s) sem chamadas WebSearch visíveis no trace.

- **Preview (Step 3) NÃO deve exibir os campos placeholder:** A tela de
  confirmação mostra apenas título + nível + força de mercado (+ alternativas
  se fraco/nicho). Os campos descritivos com placeholder não devem aparecer —
  o gestor já sabe que estarão em branco.

- **Campos descritivos devem ter placeholder, não arrays vazios:** As
  `responsibilities`, `behaviors` e `challenges` devem ser
  `["[A ser definido via /pesquisar-mercado e /refinar-perfil]"]` (1 item).
  `qualifications` deve ser `[{ text: "...", required: false }]` (1 item com
  required: false). Arrays vazios `[]` violam CRIA-03.

- **`node -e` com aspas simples para escrever JSON:** Usar sempre
  `node -e '...'` (aspas simples no shell). Aspas duplas fazem o bash
  interpretar `$` como variável de ambiente — `R$7k` vira `R.7k`
  silenciosamente. Verificado em pesquisar-mercado Notes.

- **IDs são gerados internamente:** Diferente de /refinar-perfil (que lista
  perfis existentes), o ID da /criar-perfil é sempre gerado por
  `crypto.randomUUID()`. Nunca aceitar UUID digitado pelo gestor.

- **`suggestedTitle` igual a `title` no stub:** O campo existe no schema para
  diferenciar título interno do título de publicação externa. Na criação, ambos
  recebem o título normalizado — o gestor diferencia depois via web app ou
  /refinar-perfil.

- **WebSearch indisponível:** Se a ferramenta WebSearch não estiver disponível,
  classificar a força como "não verificado", avisar o gestor e perguntar se
  deseja prosseguir mesmo assim. Não abortar silenciosamente.

## Troubleshooting

**"DATA_PATH não está definido"**
→ Configurar a variável de ambiente:
```bash
export DATA_PATH=/caminho/para/repo-de-dados
```
Ou verificar que `.env.local` existe na raiz do projeto com a linha
`DATA_PATH=/caminho/para/repo-de-dados`.

**"WebSearch indisponível"**
→ Classificar força como "não verificado" e informar o gestor. Perguntar:
"WebSearch indisponível. Deseja criar o perfil sem análise de força? (S/N)"
Se S: prosseguir para Step 3 com força = "não verificado".
Se N: encerrar.

**"Erro ao gravar o perfil"**
→ Verificar permissões em $DATA_PATH/profiles/:
```bash
source .env.local && ls -la "$DATA_PATH/profiles/"
```
Confirmar que o diretório existe e é gravável. Se o erro persistir, verificar
que o JSON gerado é válido.

**"Perfil não aparece em /profiles na web app"**
→ O arquivo foi criado em DATA_PATH/profiles/{uuid}.json mas a web app serve
do mesmo volume/symlink. Verificar:
```bash
source .env.local && cat "$DATA_PATH/profiles/{uuid}.json" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>JSON.parse(d)&&console.log('JSON válido'))"
```

## Related Skills

- `/pesquisar-mercado` — enriquecer o perfil criado com dados reais do mercado BR
- `/refinar-perfil` — iterar campos descritivos do perfil com sugestões de IA
- `/abrir-vaga` — criar vaga a partir de um perfil pronto

---

**Skill created:** 2026-04-26
**Status:** Ready for Claude Code integration
