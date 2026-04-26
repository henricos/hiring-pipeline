---
name: pesquisar-mercado
description: |
  Seleciona um perfil existente de DATA_PATH/profiles/ e ancora toda a pesquisa ao seu ID.
  Coleta dados de vagas reais em portais BR (WebSearch + WebFetch + Playwright MCP), pesquisa
  faixas salariais em guias curados (Robert Half, Glassdoor BR, Catho, Revelo) e gera dois
  arquivos: DATA_PATH/research/{profileId}/{date}-vagas.json e
  DATA_PATH/research/{profileId}/{date}-resumo.json (com salaryRange das vagas + salaryGuide
  dos guias + profileHints para /refinar-perfil). Pesquisas acumulam por data sem sobrescrever.
command: /pesquisar-mercado
---

# SKILL: Pesquisar Mercado

Coleta sistemática de dados de vagas em portais BR. Combina WebSearch + WebFetch (LinkedIn,
vagas.com.br, InfoJobs) com Playwright MCP (Gupy, Catho) para cobrir o mercado nacional.
Filtra por porte de empresa, extrai estrutura por vaga e gera dois arquivos persistentes
por execução: vagas brutas e resumo executivo com profileHints prontos para o /refinar-perfil.

## Pre-Conditions

- DATA_PATH disponível no ambiente ou em `.env.local` na raiz do projeto (carregado automaticamente no Step 0)
- Acesso a WebSearch e WebFetch (para LinkedIn, vagas.com.br, InfoJobs)
- Playwright MCP disponível (`mcp__plugin_playwright_playwright__*`) para Gupy e Catho
  - **Configuração necessária para headless:** o plugin abre janela de browser visível por padrão. Para evitar que o usuário feche acidentalmente a janela e destrua o contexto, configurar headless editando `~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json`: adicionar `"--headless"` nos args e reiniciar o Claude Code (configuração única por máquina — ver Notes)
- (Opcional) Sessão autenticada disponível em `$DATA_PATH/sessions/{portal}-session.json`
- Ao menos um perfil cadastrado em DATA_PATH/profiles/ (criado via web app ou /criar-perfil)

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

### Step 1: Selecionar Perfil

Listar os perfis disponíveis em DATA_PATH/profiles/:

```bash
node -e '
const fs = require("fs");
const path = require("path");
const profilesDir = path.join(process.env.DATA_PATH || "./data", "profiles");
let files;
try { files = fs.readdirSync(profilesDir).filter(f => f.endsWith(".json")); }
catch (e) { console.error("Diretorio de perfis nao encontrado:", profilesDir); process.exit(1); }
if (files.length === 0) {
  console.log("Nenhum perfil cadastrado. Execute /criar-perfil para criar um.");
  process.exit(0);
}
console.log("Perfis disponiveis:");
files.forEach((f, i) => {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(profilesDir, f), "utf8"));
    const shortId = (p.id || "").substring(0, 8);
    console.log((i + 1) + ". " + shortId + " | " + (p.title || "sem titulo") + " | " + (p.experienceLevel || "sem nivel"));
  } catch (e) { console.log((i + 1) + ". " + f + " (erro ao ler)"); }
});
'
```

Exibir ao gestor:
```
Perfis disponiveis:
1. a1b2c3d4 | Engenheiro Senior de Software | 5-10 anos
2. e5f6g7h8 | Cientista de Dados Pleno | 3-5 anos

Qual perfil voce quer pesquisar? (numero)
```

Registrar o ID do perfil selecionado a partir da lista (NAO aceitar ID digitado diretamente
pelo gestor — usar somente IDs listados pelo comando acima).

Apos a selecao, validar que o `id` do JSON e um UUID v4 valido:

```bash
node -e '
const profileId = "{profileId}";
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(profileId)) {
  console.error("profileId invalido — nao e UUID v4. Abortando.");
  process.exit(1);
}
console.log("UUID valido:", profileId);
'
```

Coletar escopo adicional apos a selecao do perfil:

- **Profundidade da pesquisa:**
  - `enxuta` — 5-10 vagas, ~5 min
  - `media` — 15-25 vagas, ~15 min (padrao recomendado)
  - `profunda` — 30-50 vagas, ~30 min+
- **Porte de empresa** (default: `medias+`):
  - `todas` — incluir startups e pequenas empresas
  - `medias+` — filtrar para medias e grandes (default recomendado)
  - `grandes+` — apenas empresas de grande porte
- **Localizacao** (default: pesquisa nacional — sem restricao geografica)

O cargo e a senioridade sao obtidos do perfil selecionado (`title` e `experienceLevel`) —
NAO perguntar ao gestor. A stack NAO e input; e output da pesquisa.

Exibir resumo e aguardar confirmacao:
```
Perfil selecionado: {title} ({experienceLevel}) — ID: {8 chars do profileId}
Profundidade: {depth}
Porte: {companySize}
Local: {location ou "Nacional"}

Confirmar e iniciar pesquisa? (S/N)
```

### Step 2: Detectar Sessões Autenticadas e Executar Queries WebSearch

**2.1 — Verificar sessões disponíveis:**

```bash
ls $DATA_PATH/sessions/ 2>/dev/null
```

Para cada arquivo `{portal}-session.json` encontrado, registrar que sessão está disponível.
NÃO logar o conteúdo do arquivo — apenas confirmar existência via `ls`.

Exibir:
```
Sessões autenticadas detectadas: {lista de portais com sessão} (ou "nenhuma")
```

**2.2 — Estratégia por portal (dois passos: listar → descrever)**

Cada portal tem dois momentos distintos: (1) descobrir a lista de vagas e (2) buscar a descrição individual. A estratégia de cada passo varia por portal.

**Queries base por senioridade** (usar apenas cargo — sem stack):

| Senioridade | Query PT | Query EN |
|-------------|---------|---------|
| Pleno | `"{cargo} pleno"` | `"mid-level {cargo-en} brazil"` |
| Sênior | `"{cargo} sênior"` | `"senior {cargo-en} brazil"` |
| Staff/Principal | `"staff {cargo-en} brazil"` | `"principal {cargo-en} brasil"` |
| Arquiteto | `"arquiteto de soluções"` | `"solutions architect brazil"` |

Se o gestor informou stacks como contexto adicional (opcional), adicionar como segundo termo na query EN: `"senior data scientist python brazil"`. Nunca usar stack como qualificador exclusivo.

---

**Portal 1 — Gupy** (prioridade alta)

*Listar:*
- Playwright MCP: `browser_navigate → https://portal.gupy.io/job-search/term={cargo-generico}`
  - Usar apenas o cargo genérico (ex: `"cientista de dados"`) — termos compostos com stack retornam 0 resultados
  - Para SP: adicionar `&state=S%C3%A3o%20Paulo`
  - `browser_snapshot` retorna lista estruturada com título, empresa, localização e URL
- Complemento WebSearch: `"{cargo} site:gupy.io"` — captura vagas indexadas pelo Google que podem não aparecer na busca interna

*Descrever:*
- WebFetch na URL individual `{empresa}.gupy.io/job/{base64_id}` — HTML estático completo, sem bloqueio

---

**Portal 2 — LinkedIn** (prioridade alta)

*Listar:*
- WebFetch com Googlebot UA: `https://www.linkedin.com/jobs/search/?keywords={cargo}&location=Brazil&f_E={nivel}`
  - `f_E=3` = Pleno/Associado | `f_E=4` = Sênior | `f_E=5` = Diretor
  - Sem `f_E` retorna mix de todos os níveis — sempre usar o filtro
  - User-Agent: `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`
- Complemento WebSearch: `"{cargo} pleno site:linkedin.com/jobs brasil"` — cobre vagas não retornadas pelo WebFetch

*Descrever:*
- WebFetch com Googlebot UA na URL individual `https://www.linkedin.com/jobs/view/{id}`

---

**Portal 3 — InfoJobs BR** (prioridade média)

*Listar:*
- WebFetch com Chrome UA: `https://www.infojobs.com.br/vagas-de-emprego-{cargo-slug}.aspx`
  - **Não usar** o padrão `/empregos-en-{cargo-slug},{estado}.aspx` — retorna resultados completamente irrelevantes
  - User-Agent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`

*Descrever:*
- WebFetch com Chrome UA na URL individual `https://www.infojobs.com.br/vaga-de-{slug}.aspx`

---

**Portal 4 — Glassdoor BR** (opcional — bom complemento)

*Listar:*
- WebSearch (WebFetch retorna 403 — nunca tentar WebFetch direto): `"site:glassdoor.com.br vagas {cargo} brasil"`
- Playwright como fallback quando snippets insuficientes: `browser_navigate → https://www.glassdoor.com.br/Vagas/{cargo-slug}-vagas-SRCH_KO0,{n}.htm` + `browser_snapshot`
  - Reutilizar o mesmo browser context da sessão — não abrir nova aba

*Descrever:*
- Playwright `browser_navigate` + `browser_snapshot` na URL individual (WebFetch bloqueado com 403)

---

**Portal 5 — vagas.com.br** (fallback — baixa cobertura tech)

*Listar:*
- WebFetch com Chrome UA: `https://www.vagas.com.br/vagas-de-{cargo-slug}`
  - Retorna ~3-9 vagas para cargos tech — usar apenas se os portais prioritários ficaram abaixo da profundidade alvo

*Descrever:*
- WebFetch na URL individual — HTML estático completo

---

**Portal 6 — Catho** (requer sessão)

*Listar:*
- Playwright MCP: `browser_navigate → https://www.catho.com.br/vagas/{cargo-slug}/` + `browser_snapshot`

*Descrever:*
- Requer sessão autenticada para acessar URL individual; sem sessão, registrar `fetchedFull: false` e não tentar clicar nas vagas — o portal bloqueia a navegação sem login

**Sessão autenticada (quando disponível):**
- Se `$DATA_PATH/sessions/{portal}-session.json` existir → passar como `storageState` para o Playwright MCP daquele portal.
- Se não existir → usar fallback anônimo sem bloquear a execução.

Registrar cada query em `sources[]`:
```json
{ "portal": "gupy", "query": "engenheiro senior", "url": "https://...", "status": "OK" }
```

### Step 3: WebFetch das Descrições Mais Relevantes

**3.1 — Selecionar URLs para WebFetch** conforme profundidade escolhida:
- `enxuta`: top 5-10 resultados por portal
- `média`: top 15-25 resultados no total
- `profunda`: top 30-50 resultados no total

**3.2 — Priorização** quando há mais candidatos do que a profundidade permite:
- Priorizar portais com WebFetch OK (evitar portais que retornaram erros na Step 2)
- Priorizar vagas com snippets mais ricos (mais texto sobre requisitos e stack)
- Quando filtro é `médias+` ou `grandes+`: priorizar vagas de empresas que parecem médias/grandes pelo nome ou contexto

**3.3 — Executar fetch das descrições individuais (conforme estratégia do portal):**
- **Gupy:** URLs no formato `{empresa}.gupy.io/job/{base64_id}` — WebFetch direto, HTML estático completo.
- **LinkedIn:** WebFetch com Googlebot UA em `linkedin.com/jobs/view/{id}`. Extrair títulos/empresas da SERP do Step 2.
- **InfoJobs:** vagas individuais em `infojobs.com.br/vaga-de-{slug}.aspx` — WebFetch com Chrome UA (~100KB por vaga).
- **Glassdoor:** WebFetch retorna 403 — usar Playwright `browser_navigate` + `browser_snapshot` na URL individual. Reutilizar o mesmo browser context.
- **vagas.com.br:** listagem retorna ~3-9 links; vagas individuais acessíveis via WebFetch com HTML estático.
- **Catho:** sem sessão autenticada, não tentar descrição individual — registrar `fetchedFull: false`.

**3.4 — Tratar falhas:**
- WebFetch que retorna 403, 404 ou timeout → registrar como `status: "unavailable"` em `sources[]` e prosseguir.
- Sem retry agressivo — falha pontual não interrompe a pesquisa.

### Step 4: Extrair, Estruturar e Aplicar Filtro de Porte

**4.1 — Para cada vaga com fetch bem-sucedido, extrair:**

- `title` — título exato da vaga
- `company` — nome da empresa
- `companySize` — estimativa de porte (heurística best-effort):
  - Multinacional conhecida / grande empresa BR conhecida → `"grande"`
  - Empresa com produto estabelecido, sem sinais de startup → `"média"`
  - Startup, sem histórico visível, poucos funcionários mencionados → `"pequena"`
  - Não identificável pelo nome ou contexto → `"desconhecido"`
- `url` — URL da vaga individual
- `snippet` — trecho descritivo da vaga (requisitos, responsabilidades)
- `portal` — portal de origem
- `fetchedFull` — `true` se WebFetch da página individual foi bem-sucedido; `false` se apenas snippet da SERP
- `authenticated` — `true` se sessão autenticada foi usada para este fetch
- `stack[]` — tecnologias mencionadas (core e exposição)
- `seniority` — senioridade declarada na vaga
- `salaryRange` — faixa salarial se visível; `null` se ausente (NÃO inventar valores)
- `behaviors[]` — competências comportamentais citadas (ex: "liderança técnica", "comunicação clara")
- `archetype` — arquétipo detectado: `"arquiteto técnico"` / `"evangelizador de IA"` / `"engenheiro de produto"` / `"generalista"` / `"especialista"` / `"não identificado"`

**4.2 — Aplicar filtro de porte (D-26):**

| Filtro | Regra |
|--------|-------|
| `médias+` | Excluir vagas com `companySize: "pequena"` do array `jobs[]` |
| `grandes+` | Incluir apenas vagas com `companySize: "grande"` |
| `todas` | Incluir todas as vagas independente do porte |

**Nota:** Vagas com `companySize: "desconhecido"` são SEMPRE incluídas, mesmo em filtros restritivos (benefício da dúvida). A classificação de porte é estimativa best-effort — heurística pode errar; isso é esperado e documentado.

Registrar no log: quantas vagas foram coletadas no total e quantas foram filtradas por porte.

### Step 5: Salvar {date}-vagas.json na Subpasta do Perfil

**5.1 — Calcular nome final (com detecção de colisão):**

```bash
node -e '
const fs = require("fs");
const path = require("path");
const profileId = "{profileId}";
const date = new Date().toISOString().split("T")[0];
const profileDir = path.resolve(process.env.DATA_PATH || "./data", "research", profileId);
let suffix = "";
let counter = 2;
let vagasPath = path.resolve(profileDir, date + "-vagas.json");
while (fs.existsSync(vagasPath)) {
  suffix = "-" + counter;
  vagasPath = path.resolve(profileDir, date + suffix + "-vagas.json");
  counter++;
}
const finalBaseName = date + suffix;
console.log(finalBaseName);
'
```

Registrar `finalBaseName` em memória (ex: `2026-04-26` ou `2026-04-26-2`).

**5.2 — Criar subpasta do perfil:**

```bash
node -e '
const fs = require("fs");
const path = require("path");
const profileDir = path.resolve(process.env.DATA_PATH || "./data", "research", "{profileId}");
fs.mkdirSync(profileDir, { recursive: true });
console.log("Diretorio pronto:", profileDir);
'
```

**5.3 — Salvar vagas brutas com validação de path traversal:**

```bash
node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const profileId = "{profileId}";
const baseName = "{finalBaseName}";
const profileDir = path.resolve(dataPath, "research", profileId);
const filePath = path.resolve(profileDir, baseName + "-vagas.json");
if (!filePath.startsWith(profileDir + path.sep)) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
const vagasData = {
  profileId: "{profileId}",
  profileTitle: "{title}",
  profileExperienceLevel: "{experienceLevel}",
  baseName: "{finalBaseName}",
  createdAt: new Date().toISOString(),
  depth: "{depth}",
  scope: {
    role: "{title}",
    location: "{location}",
    seniority: "{experienceLevel}",
    stack: [],
    companySize: "{companySize}"
  },
  sessions: [/* sessoes detectadas */],
  sources: [/* queries executadas */],
  jobs: [/* vagas extraidas */]
};
fs.writeFileSync(filePath, JSON.stringify(vagasData, null, 2));
console.log("Vagas salvas em:", filePath);
'
```

Exibir: `Vagas brutas salvas: {N} vagas em {DATA_PATH}/research/{profileId}/{finalBaseName}-vagas.json`

### Step 6: Gerar Summary + profileHints + salaryGuide e Salvar {date}-resumo.json

**6.1 — Gerar o bloco `summary` com base nas vagas coletadas:**

- `commonTitles[]` — títulos de cargo mais frequentes nas vagas coletadas
- `titleAliases[]` — variações do mesmo papel encontradas nos portais
- `stackFrequency{}` — objeto `{ tecnologia: contagem }` para todas as tecnologias mencionadas
- `emergingStack[]` — tecnologias presentes em menos de 30% das vagas mas em crescimento notável
- `salaryRange` — faixa agregada das vagas que exibiram salário; `null` se nenhuma teve faixa visível
- `salarySource` — descrição da origem (ex: `"6 de 20 vagas com faixa salarial visível"`)
- `commonBehaviors[]` — competências comportamentais mais frequentes
- `commonChallenges[]` — desafios mais citados
- `archetypes[]` — arquétipos detectados com frequência
- `trends[]` — tendências observadas no conjunto
- `redFlags[]` — padrões preocupantes detectados

**6.2 — Gerar o bloco `profileHints` (pré-mastigado para uso no /refinar-perfil):**

Usar APENAS os 4 campos descritivos do JobProfile — não inventar campos novos (D-01):

- `responsibilities[]` — sugestões de responsabilidades derivadas do padrão de vagas
- `qualifications[]` — array de `{ text: string, required: boolean }` (ProfileItem[])
- `behaviors[]` — competências comportamentais sugeridas
- `challenges[]` — desafios sugeridos para o cargo
- `suggestedTitle` — título mais adequado baseado em `commonTitles`
- `suggestedExperienceLevel` — um dos valores válidos: `"< 1 ano"` | `"1-3 anos"` | `"3-5 anos"` | `"5-10 anos"` | `"> 10 anos"`

**6.3 — Pesquisar guias salariais e gerar `salaryGuide` (OBRIGATORIO — sempre roda):**

Consultar as seguintes fontes para o cargo `{title}`, âncora geográfica SP/Sudeste:

**Robert Half Guia Salarial TI (âncora primária) — cadeia de três níveis:**

Nível 1 — tentar PDF:
```
WebSearch: "robert half guia salarial TI {ano} download PDF filetype:pdf"
WebSearch: "site:roberthalf.com.br guia salarial {ano} download"
```
Se encontrar URL de PDF direto, fazer WebFetch. PDF contém tabelas por cargo e percentil.

Nível 2 — se PDF indisponível, usar Playwright MCP na calculadora:
```
browser_navigate -> https://www.roberthalf.com/br/pt/insights/guia-salarial/calculadora
```
Selecionar área "Tecnologia", digitar o cargo (ver mapeamento abaixo), selecionar cidade "São Paulo".
Capturar P25, P50, P75 via browser_snapshot.
NAO chamar browser_close após uso — reutilizar o mesmo contexto de browser.

Mapeamento de títulos Robert Half:
- "Analista de Dados" -> RH usa "Analista de BI"
- "Cientista de Dados Sênior" -> RH usa "Especialista/Cientista de Dados"
- "Engenheiro de Dados" -> não listado no RH — usar Glassdoor como âncora primária

Nível 3 — se calculadora não retornar o cargo, buscar cobertura jornalística:
```
WebSearch: "robert half guia salarial TI {ano} {title} faixa salarial"
WebSearch: "robert half salary guide {ano} site:canaltech.com.br OR site:opiniaorh.com OR site:segs.com.br"
```

**Glassdoor BR (mediana e spot-check) — WebSearch apenas:**

Glassdoor bloqueia WebFetch com 403 — NUNCA tentar WebFetch.
```
WebSearch: "site:glassdoor.com.br salario {title} pleno senior sao paulo {ano}"
```
Playwright como fallback se snippets insuficientes:
```
browser_navigate -> https://www.glassdoor.com.br/Salarios/{cargo-slug}-salario-SRCH_KO0,{n}.htm
browser_snapshot -> extrair "faixa de salario base medio (R$Xk-R$Yk/mes)"
```
Atenção: snippets podem rotular mensais como "por ano" — usar o campo "R$Xk–R$Yk/mes" como verdade.
Glassdoor BR reporta salários CLT mensais brutos — não anuais.

**Catho (validação cruzada — sem split de senioridade):**
```
WebSearch: "catho pesquisa salarial {ano} {title}"
```
Dados são nacionais agregados sem split Pleno/Senior — usar só como validação de ordem de magnitude.

**Revelo (baixa confiabilidade):**
```
WebSearch: "revelo salary report {ano} {aliasEN} brazil"
```
Se não retornar relatório específico, ignorar esta fonte.

**Fontes a NUNCA usar como âncora de salaryGuide:**
- `salario.com.br` — inclui verbas rescisórias, infla salário base
- `meutudo.com.br` — sem metodologia publicada

**Detecção de outlier:** se uma fonte retornar valores >50% acima das demais, verificar se cita
total compensation (equity + bonus) em vez de CLT base — descartar se sim.

Consolidar em `salaryGuide`:
- `min` / `max`: percentil P25-P75 de CLT mensal bruta, âncora SP/Sudeste, valores inteiros em BRL
- `currency`: "BRL"
- `location`: "Sao Paulo / Sudeste"
- `sources[]`: cada fonte consultada — incluir mesmo as que retornaram null para rastreabilidade
  Cada entrada: `{ "portal": "...", "year": 2026, "url": "...", "percentiles": "P25=..., P75=..." }`
- `salaryGuide: null` apenas se nenhuma fonte retornou dado confiável

**6.4 — Salvar resumo com validação de path traversal:**

```bash
node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const profileId = "{profileId}";
const baseName = "{finalBaseName}";
const profileDir = path.resolve(dataPath, "research", profileId);
const filePath = path.resolve(profileDir, baseName + "-resumo.json");
if (!filePath.startsWith(profileDir + path.sep)) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}
const resumoData = {
  profileId: "{profileId}",
  profileTitle: "{title}",
  profileExperienceLevel: "{experienceLevel}",
  baseName: "{finalBaseName}",
  vagasFile: "{finalBaseName}-vagas.json",
  createdAt: new Date().toISOString(),
  summary: {
    commonTitles: [],
    titleAliases: [],
    stackFrequency: {},
    emergingStack: [],
    salaryRange: null,
    salarySource: "",
    commonBehaviors: [],
    commonChallenges: [],
    archetypes: [],
    trends: [],
    redFlags: []
  },
  salaryGuide: null,
  profileHints: {
    responsibilities: [],
    qualifications: [],
    behaviors: [],
    challenges: [],
    suggestedTitle: "",
    suggestedExperienceLevel: ""
  }
};
fs.writeFileSync(filePath, JSON.stringify(resumoData, null, 2));
console.log("Resumo salvo em:", filePath);
'
```

Exibir: `Resumo executivo salvo: {DATA_PATH}/research/{profileId}/{finalBaseName}-resumo.json`

### Step 7: Exibir Resultado e Sugerir Próxima Ação

```
Pesquisa concluída!

Perfil pesquisado: {title} ({experienceLevel}) — ID: {profileId}
Vagas coletadas: {N} ({M} filtradas por porte — {F} vagas excluídas)
Portais usados: {lista de portais com status OK}
Sessões autenticadas: {lista ou "nenhuma"}

Arquivos gerados:
  {DATA_PATH}/research/{profileId}/{finalBaseName}-vagas.json
  {DATA_PATH}/research/{profileId}/{finalBaseName}-resumo.json

Stack mais frequente: {top 3 do stackFrequency}
Faixa salarial (vagas): {salaryRange.min}–{salaryRange.max} BRL (ou "não disponível — nenhuma vaga exibiu faixa")
Faixa salarial (guias): {salaryGuide.min}–{salaryGuide.max} BRL [{fontes}] (ou "não disponível")
Arquétipos detectados: {archetypes[].join(", ")}

Próxima ação sugerida:
  Execute /refinar-perfil e selecione a pesquisa acima quando solicitado
```

## Notes for Agent

- **Sessões autenticadas — privacidade:** NUNCA logar, exibir ou incluir no output o conteúdo de arquivos de sessão (`$DATA_PATH/sessions/{portal}-session.json`). Apenas verificar existência via `ls`. Esses arquivos contêm credenciais.

- **salaryRange nulo é correto:** quando nenhuma vaga coletada exibiu faixa salarial,
  `salaryRange: null` é o valor correto no bloco `summary`. NAO inventar valores.

- **salaryGuide nulo é correto:** quando nenhum guia retornou dado confiável, `salaryGuide: null`
  é o valor correto no -resumo.json. O step de guias é OBRIGATORIO como esforço de pesquisa —
  mas o campo pode ser null se as fontes não retornarem dados para o cargo específico.

- **salaryGuide — fontes proibidas como âncora:** `salario.com.br` (inclui verbas rescisórias,
  infla salário base) e `meutudo.com.br` (sem metodologia publicada). Registrar em `sources[]`
  se consultadas, mas NAO usar para definir min/max.

- **Outlier em guias:** se fonte retornar >50% acima das demais, verificar se cita total
  compensation (equity+bonus) em vez de CLT base. Descartar outliers — não fazer média com eles.

- **Playwright — guias salariais:** reutilizar o mesmo browser context do step de vagas.
  NAO chamar browser_close entre portais de vagas e portais de guias.

- **Colisão de nome no mesmo dia:** sufixo `-2`, `-3` inserido ANTES de `-vagas` e `-resumo`.
  Exemplo: `2026-04-26-2-vagas.json` e `2026-04-26-2-resumo.json`. O `finalBaseName` calculado
  no Step 5.1 é reusado no Step 6 para ambos os arquivos.

- **profileId vem da lista, nunca do gestor:** ID sempre obtido do JSON do perfil selecionado
  no Step 1. NAO aceitar UUID digitado diretamente. Validar com regex UUID v4.

- **Subpasta criada automaticamente:** `DATA_PATH/research/{profileId}/` criada com
  `mkdirSync({ recursive: true })` no Step 5.2. Não depende de criação manual prévia.

- **Sem dependência de arquivo legado de roles:** a skill não lê nem escreve o arquivo legado de mapeamento de cargos. O campo `salaryGuide` no -resumo.json substitui integralmente essa função.

- **profileHints usa apenas os campos do JobProfile (D-01):** `responsibilities[]`, `qualifications[]` (com `required:boolean`), `behaviors[]`, `challenges[]`, `suggestedTitle`, `suggestedExperienceLevel`. Não inventar campos novos. `qualifications` é `ProfileItem[]` com `{ text: string, required: boolean }` — não `string[]`.

- **node -e para salvar JSON:** não usar heredoc — evita problemas com aspas e newlines no conteúdo das vagas. Usar sempre **aspas simples** no shell (`node -e '...'`): aspas duplas fazem o bash interpretar `$` seguido de dígitos como variável de ambiente vazia — `R$7k` vira `R.7k` silenciosamente.

- **Playwright MCP — nunca chamar `browser_close`:** chamar `browser_close` encerra o browser permanentemente para toda a sessão — sem possibilidade de reabrir automaticamente. Deixar o browser aberto entre todas as navegações. O contexto é compartilhado: usar o mesmo browser para Gupy, Catho e portais de guias salariais, sem fechar entre portais.

- **Playwright MCP — verificar disponibilidade antes de usar:** tentar `browser_navigate` como primeiro passo; se retornar "Tool not found" ou "browser closed", prosseguir somente com WebFetch/WebSearch para os portais Playwright e registrar como `"unavailable"` em `sources[]`.

- **Playwright MCP — configuração headless:** o plugin `playwright@claude-plugins-official` abre janela de browser visível por padrão. Para rodar headless, editar `~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json`:
  ```json
  {"playwright": {"command": "npx", "args": ["@playwright/mcp@latest", "--headless"]}}
  ```
  Reiniciar o Claude Code após a mudança (configuração única por máquina). Sem isso, fechar a janela durante a execução destrói o contexto permanentemente para a sessão.

- **WebFetch que falha:** registrar como `"unavailable"` em `sources[]` e continuar. Sem retry agressivo.

- **Filtro de porte é heurística best-effort:** a classificação de porte por nome da empresa pode errar. Vagas com `companySize: "desconhecido"` são incluídas mesmo em filtros restritivos. Documentar no output quantas vagas tiveram porte estimado vs. desconhecido.

- **Gupy sem sessão é funcional:** 23+ vagas retornadas via Playwright MCP sem autenticação. Não classificar Gupy como "unavailable" por ausência de sessão.

- **Busca nacional por padrão:** não fixar localização nas queries de WebSearch/Playwright. O filtro de porte é a âncora de qualidade — não a localização. Gestor pode restringir no Step 1 se desejar.

- **TypeScript nas queries:** adicionar "typescript" como termo de busca gera ruído (vagas de front-end puro). Preferir "backend" ou o stack principal como qualificador; avaliar TypeScript no conteúdo das vagas coletadas.

- **Dados pessoais de candidatos:** apenas dados de vagas públicas (empresa, cargo, requisitos). Nunca persistir PII de candidatos (nome, email, telefone) — vagas são informações públicas de empregadores, não de candidatos.

## Troubleshooting

**"DATA_PATH não está definido"**
→ Configurar a variável de ambiente:
```bash
export DATA_PATH=/caminho/para/repo-de-dados
```

**"Nenhum perfil encontrado no Step 1"**
→ Verificar que existe ao menos um arquivo .json em $DATA_PATH/profiles/. Se a base está vazia,
criar via web app em /profiles/new ou via skill /criar-perfil.

**"WebFetch retorna 403 consistentemente em um portal"**
→ Registrar aquele portal como `"unavailable"` em `sources[]` e continuar com os demais. Não tentar novamente na mesma execução. Se o portal é prioritário (ex: LinkedIn), verificar o User-Agent — para LinkedIn usar Googlebot UA, não Chrome UA.

**"Sessão expirada ou não funciona"**
→ Fallback automático para acesso anônimo. Avisar o gestor ao final: "Sessão {portal} parece expirada — resultado coletado em modo anônimo." Para renovar a sessão:
```bash
npx playwright open --save-storage=$DATA_PATH/sessions/{portal}-session.json https://{portal-url}/login
```

**"Nenhuma vaga retornada"**
→ Verificar queries — tentar idioma alternativo (PT ↔ EN). Para Gupy, usar apenas o cargo genérico sem stack (ex: "engenheiro senior" em vez de "engenheiro senior java python typescript").

**"Gupy via Playwright retorna lista vazia"**
→ Verificar URL de busca: `https://portal.gupy.io/job-search/term={cargo-sem-stack}`. Queries com múltiplos termos técnicos retornam 0 resultados no Gupy — usar termo genérico de cargo.

**"Arquivo já existe com o mesmo nome"**
→ Comportamento esperado ao rodar duas pesquisas no mesmo dia para o mesmo perfil. O Step 5.1 detecta colisão automaticamente e usa sufixo `-2`, `-3`, etc. via `finalBaseName`.

**"Guias salariais não retornam dados para o cargo pesquisado"**
→ Gravar `salaryGuide: null`. Verificar mapeamento de títulos Robert Half em Notes.
Para "Engenheiro de Dados", usar Glassdoor SP como âncora primária (RH não cobre este cargo).
O campo null é válido — a pesquisa continua útil com salaryRange das vagas.

**"Browser abriu uma janela de browser visível / foi fechado acidentalmente"**
→ O plugin `@playwright/mcp` roda em modo headed por padrão — abre uma janela real do Chromium. Fechar essa janela destrói o contexto permanentemente para a sessão (sem reabertura automática). Para evitar: configurar headless editando `~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json` e adicionar `"--headless"` nos args (ver Notes). Reiniciar o Claude Code após salvar. Se a janela já foi fechada, reiniciar o Claude Code para recuperar o MCP.

**"Playwright retorna 'Target page, context or browser has been closed' na primeira chamada"**
→ O browser foi fechado em uma sessão anterior (por `browser_close` ou pelo usuário fechando a janela). O playwright-mcp não relança o browser automaticamente. Único caminho: reiniciar o Claude Code — isso relança o processo MCP com browser limpo. Enquanto isso, prosseguir só com WebFetch/WebSearch para todos os portais e registrar Gupy e Catho como `"unavailable"` em `sources[]`.

**"Erro de path traversal detectado"**
→ O UUID do perfil falhou na validação de path. Verificar que o arquivo do perfil contém um `id` UUID v4 válido.

## Related Skills

- `/criar-perfil` — criar o perfil que será selecionado no Step 1 desta skill
- `/refinar-perfil` — refinamento de perfil usando o `-resumo.json` gerado por esta skill como contexto
- `/abrir-vaga` — criar vaga a partir de um perfil refinado com dados de mercado
- `/fechar-versao` — referência de guardrails de segurança operacional

---

**Skill created:** 2026-04-22
**Updated:** 2026-04-22 — ajustes pós-primeira execução: stacks removidas do input (são output), indústria default Livre, queries sem stack-principal, URL InfoJobs corrigida, LinkedIn com filtro f_E por nível, Catho documentada como unavailable sem sessão, vagas.com.br rebaixada para fallback
**Updated:** 2026-04-26 — Phase 7: seleção de perfil por lista (Step 1 novo), subpastas research/{profileId}/ (Steps 5-6 reescritos), step de guias salariais obrigatório (salaryGuide), campo salaryRange preservado, arquivo legado de roles removido da skill, técnicas de scraping do /atualizar-roles-map absorvidas
**Status:** Ready for Claude Code integration
