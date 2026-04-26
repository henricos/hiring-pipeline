---
name: atualizar-roles-map
description: |
  [DESCONTINUADO — use /pesquisar-mercado] Esta skill foi absorvida pelo /pesquisar-mercado
  a partir da Phase 7. O step de pesquisa em guias salariais (Robert Half, Glassdoor BR,
  Catho, Revelo) agora faz parte do fluxo de /pesquisar-mercado, ancorado ao perfil
  selecionado, e gera o campo salaryGuide no -resumo.json. Ver migration note abaixo.
command: /atualizar-roles-map
---

# SKILL: Atualizar Roles Map

Pesquisa de mercado focada em títulos de cargo e faixas salariais BR. Consulta guias
salariais públicos de múltiplas fontes, consolida os dados no schema D-24 e atualiza
`data/research/roles-map.json` — arquivo de referência persistente usado pelo
`/pesquisar-mercado` para ancorar `profileHints.salaryRange` e `suggestedTitle`.

## Pre-Conditions

- DATA_PATH disponível no ambiente ou em `.env.local` na raiz do projeto (carregado automaticamente no Step 0)
- Acesso a WebSearch e WebFetch (obrigatórios)
- Playwright MCP `playwright@claude-plugins-official` disponível (opcional — fallback quando snippets insuficientes; ver Notes sobre uso correto)
  - **Configuração necessária para headless:** o plugin abre janela de browser visível por padrão. Para evitar que o usuário feche acidentalmente a janela e destrua o contexto, configurar headless editando `~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json`: adicionar `"--headless"` nos args e reiniciar o Claude Code (configuração única por máquina — ver Notes)
- `data/research/roles-map.json` pode ou não existir (a skill cria se não existir)

## Execution Flow

> **SKILL DESCONTINUADO — use /pesquisar-mercado (Phase 7)**
>
> Esta skill foi absorvida por `/pesquisar-mercado` a partir da Phase 7 do milestone v1.1.
> O step de pesquisa em guias salariais (Robert Half, Glassdoor BR, Catho, Revelo)
> agora e um step OBRIGATORIO do `/pesquisar-mercado`, ancorado ao perfil selecionado.
>
> **Migracao:** Execute `/pesquisar-mercado` — o step de guias salariais roda automaticamente
> apos a coleta de vagas. O campo `salaryGuide` no `-resumo.json` por perfil substitui o
> `data/research/roles-map.json` como repositorio de faixas salariais curadas.
>
> **O que muda:**
> - Antes: `/atualizar-roles-map` atualiza `data/research/roles-map.json` (arquivo global)
> - Agora: `/pesquisar-mercado` gera `data/research/{profileId}/{date}-resumo.json` com
>   campo `salaryGuide` (ancorado ao perfil, acumulado por data)
>
> Este arquivo e mantido como referencia historica das tecnicas de scraping de guias salariais.
> Nao executar esta skill para novos levantamentos salariais.

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

### Step 1: Coletar Escopo

Perguntar ao gestor:

```
O que você quer atualizar no roles-map?

1. Adicionar cargos novos
2. Atualizar faixas salariais de cargos existentes
3. Ambos

Escolha (1, 2 ou 3):
```

**Se opção 1 ou 3 — cargos novos:**

Perguntar: "Liste os cargos a adicionar (um por linha ou separados por vírgula):"

Se o gestor não souber quais cargos listar ou pedir para verificar o que já existe, carregar os perfis disponíveis em `data/profiles/` e os cargos já mapeados no roles-map, e exibir:

```
Perfis cadastrados em data/profiles/:
  • {título} — {nível de experiência}
  ...

Cargos já no roles-map:
  • {canonicalTitle} ({seniority})
  ...

Quais cargos quer adicionar com base nesses perfis?
```

**Se opção 2 — atualizar existentes:**
- Carregar roles-map.json e listar cargos disponíveis
- Perguntar: "Atualizar todos ou apenas alguns? (todos / números)"

**Confirmação única antes de pesquisar** (não pedir confirmação separada depois):
```
Escopo definido:
  Ação: {adicionar / atualizar / ambos}
  Cargos: {lista}
  Fontes: Robert Half TI {ano}, Glassdoor BR, State of Data Brazil, Catho, Revelo

Iniciar pesquisa? (S/N)
```

### Step 2: Carregar Roles-Map Existente

```bash
node -e '
const fs = require("fs");
const path = require("path");
const filePath = path.join(process.env.DATA_PATH || "./data", "research", "roles-map.json");
if (fs.existsSync(filePath)) {
  const d = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log("cargos existentes:", d.roles.length);
  d.roles.forEach(r => console.log(" -", r.canonicalTitle, "(" + r.seniority + ")"));
} else {
  console.log("roles-map.json nao existe — sera criado");
}
'
```

Registrar os `canonicalTitle` existentes em memória para evitar duplicação.

### Step 3: Pesquisar Cada Cargo

**Estratégia geral — batch primeiro, gaps depois:**

Não pesquisar cargo por cargo sequencialmente. Fazer primeiro uma rodada de buscas amplas cobrindo todos os cargos do escopo ao mesmo tempo, depois fazer buscas ou navegações direcionadas apenas para cargos que ficaram sem dados suficientes.

---

#### Fonte 1 — Robert Half Guia Salarial TI (âncora primária)

O Robert Half é a fonte de maior rigor metodológico para o mercado BR. Os dados reais **não ficam expostos no corpo das páginas públicas** do site deles — são exibidos via JavaScript e calculadora interativa. Seguir a cadeia de acesso abaixo:

**1a. Tentar baixar o PDF do guia:**
```
WebSearch: "robert half guia salarial TI {ano} download PDF filetype:pdf"
WebSearch: "site:roberthalf.com.br guia salarial {ano} download"
```
Se encontrar URL de PDF direto, fazer `WebFetch` nela. O PDF completo contém tabelas por cargo e percentil — é a fonte mais rica.

**1b. Se PDF não disponível — usar Playwright MCP na calculadora:**

Verificar disponibilidade antes de acionar: as ferramentas `mcp__plugin_playwright_playwright__*` precisam estar acessíveis no contexto. Se não estiverem (ou retornarem erro "browser closed"), ir direto para 1c — ver Troubleshooting.

```
browser_navigate → https://www.roberthalf.com/br/pt/insights/guia-salarial/calculadora
```
Para cada cargo do escopo:
- Selecionar área "Tecnologia"
- Digitar o cargo ou o equivalente Robert Half (ver mapeamento em Notes)
- Selecionar cidade "São Paulo"
- Capturar os percentis P25, P50, P75 via `browser_snapshot`

**⚠️ Não chamar `browser_close` ao terminar** — deixar o browser aberto para reuso na Fonte 2.

**1c. Se calculadora não retornar o cargo — buscar cobertura jornalística:**
```
WebSearch: "robert half guia salarial TI {ano} {canonicalTitle} faixa salarial"
WebSearch: "robert half salary guide {ano} site:canaltech.com.br OR site:opiniaorh.com OR site:segs.com.br"
```
Artigos de mídia especializada (Canaltech, OpiníaoRH, SEGS) costumam publicar as tabelas do guia com percentis. Extrair P25/P50/P75 para os cargos do escopo.

**Mapeamento de títulos Robert Half → mercado (ver detalhes em Notes):**
- "Analista de Dados" → RH usa "Analista de BI"
- "Cientista de Dados Sênior" → RH usa "Especialista/Cientista de Dados"
- "Engenheiro de Dados" → **não listado no RH** — pular para Fonte 2

---

#### Fonte 2 — Glassdoor BR (mediana e spot-check de mercado)

O Glassdoor bloqueia `WebFetch` com 403. Usar **apenas WebSearch** para obter os snippets de resultados, e Playwright MCP como fallback para cargos com dados insuficientes.

**Pesquisa em batch (todos os cargos de uma vez):**
```
WebSearch: "glassdoor salario {cargo1} {cargo2} {cargo3} são paulo {ano}"
WebSearch: "site:glassdoor.com.br salário {cargo1} pleno sênior são paulo {ano}"
```

**Se snippets insuficientes para algum cargo — usar Playwright MCP:**

Verificar disponibilidade (mesmo check da Fonte 1b). Se disponível:
```
browser_navigate → https://www.glassdoor.com.br/Salários/{slug-do-cargo}-salário-SRCH_KO0,{n}.htm
browser_snapshot → extrair "faixa de salário base médio (R$Xk–R$Yk/mês)"
```
Reutilizar o mesmo browser context — não abrir nova aba desnecessariamente, e **não chamar `browser_close`** entre navegações.

**⚠️ Atenção — ambiguidade "por mês" vs "por ano" nos snippets do Glassdoor:**
Os snippets de busca às vezes rotulam valores mensais como "por ano" (ex: "R$ 14.125 por ano" quando o correto é por mês). Para identificar a unidade correta:
- O campo "faixa de salário base médio" sempre mostra no formato "R$Xk–R$Yk/mês" — esse é o valor confiável
- Se o "valor médio" parece irreal para o cargo (< R$3k ou > R$50k mensais), é erro de rótulo — ler pelo campo de faixa
- Glassdoor BR reporta salários CLT mensais brutos — não anuais

---

#### Fonte 3 — State of Data Brazil (contexto de mercado para cargos de dados)

Pesquisa anual realizada por Data Hackers + Bain & Company, com milhares de respostas de profissionais brasileiros de dados.

```
WebSearch: "state of data brazil {ano} salario analista engenheiro cientista dados pleno senior"
WebSearch: "data hackers state of data {ano} faixa salarial brasil"
```

**⚠️ Limitação conhecida:** os dados detalhados por cargo e nível estão atrás de um formulário de download — WebSearch retorna apenas estatísticas macro (crescimento médio, percentual acima de determinado salário, tendências de contratação). Usar como **contexto e tendências**, não como âncora de P25/P75. Para âncora de Engenheiro de Dados, usar Glassdoor SP como fonte primária.

---

#### Fonte 4 — Catho Pesquisa Salarial

**⚠️ Limitação conhecida:** os dados detalhados por senioridade na Catho requerem plano pago. A pesquisa pública retorna apenas médias nacionais agregadas, sem split Pleno/Sênior.

Usar como validação cruzada de ordem de magnitude — não como âncora de faixa:
```
WebSearch: "catho pesquisa salarial {ano} {canonicalTitle}"
```
Se retornar apenas valores sem senioridade, registrar em `salarySource` como "Catho {ano} (nacional agregado)" e não usar como determinante da faixa.

---

#### Fonte 5 — Revelo Salary Report

**⚠️ Limitação conhecida:** O Revelo não publica mais um salary report público facilmente indexável. Buscas por "Revelo Salary Report" tendem a retornar páginas do Glassdoor *sobre a empresa Revelo*, não dados de mercado. Tentar, mas não depender:

```
WebSearch: "revelo salary report {ano} {aliasEN} brazil"
```
Se não retornar relatório específico, ignorar essa fonte e usar as demais.

---

#### Pesquisa de aliases nos portais BR

Para enriquecer `aliases[]` de cada cargo:
```
WebSearch: "'{canonicalTitle}' OR '{aliasEN}' site:linkedin.com/jobs brasil"
WebSearch: "'{canonicalTitle}' site:gupy.io"
```
Extrair variações de título encontradas nas vagas (ex: "Data Analyst Sr.", "Analytics Engineer Senior").

---

#### Consolidação por cargo

- **Âncora primária:** Robert Half quando disponível (P25–P75)
- **Âncora para Eng de Dados:** Glassdoor SP (RH não cobre este cargo)
- **State of Data Brazil:** usar para contexto de tendências e mercado CLT, não como âncora de faixa
- `salaryRange`: percentil 25–75 de CLT mensal bruta, âncora SP/Sudeste
- `salaryRange: null` quando nenhuma fonte retorna dado confiável — NUNCA inventar valores
- `salarySource`: listar fontes com ano **e percentis usados** (ex: "Robert Half TI 2026 (P25=R$10.9k, P75=R$18.2k) + Glassdoor SP abr/2026")

**Identificar e descartar outliers:**
Se uma fonte retornar valores discrepantes em mais de 50% em relação às demais, verificar a metodologia. Blogs sem metodologia clara ou que citam "total compensation" (inclui equity, bônus) em vez de CLT base tendem a inflar os números. Descartar e não fazer média com outliers — registrar a divergência em `notes` se relevante.

### Step 4: Montar Entries no Schema D-24

Para cada cargo pesquisado, construir o objeto completo:

```json
{
  "canonicalTitle": "Analista de Dados Sênior",
  "aliases": [
    "Senior Data Analyst",
    "Data Analyst Sr.",
    "Analista de BI Sênior",
    "Senior Analytics Analyst"
  ],
  "seniority": "Sênior",
  "salaryRange": {
    "min": 10900,
    "max": 18200,
    "currency": "BRL",
    "location": "São Paulo"
  },
  "salarySource": "Robert Half Guia Salarial TI 2026 (P25=R$10.9k, P75=R$18.2k) + Glassdoor SP abr/2026",
  "notes": "Perfil responsável por arquitetura analítica e mentoria técnica. Diferenciais: dbt, Airflow, Python avançado. RH e Glassdoor convergentes no P25 (~R$10.9k); teto RH R$18.2k alinhado ao P90 Glassdoor R$17.6k."
}
```

**Valores válidos para `seniority`:**
`"Júnior"` | `"Pleno"` | `"Sênior"` | `"Staff"` | `"Principal"` | `"Arquiteto"` | `"Tech Lead"`

**Regras:**
- `canonicalTitle` em PT-BR (título preferencial do mercado BR)
- `aliases[]` inclui variações PT e EN encontradas nos portais; usar apenas títulos reais encontrados em vagas — não inventar
- `salaryRange.min/max`: valores inteiros, CLT mensal bruta, âncora SP
- `salaryRange: null` quando sem dados confiáveis — não estimar
- `salarySource`: incluir os percentis P25/P75 usados para rastreabilidade entre execuções
- `notes` com tendência de mercado e stack relevante (1-3 frases); **não usar cifrão R$ diretamente no texto** — escrever por extenso ("R 10k" ou "10.000 BRL") para evitar corrupção no salvamento

### Step 5: Exibir Diff para Aprovação

Antes de salvar, mostrar o que vai mudar:

**Para cargos NOVOS:**
```
── Novos cargos a adicionar ──────────────────────

1. Analista de Dados Sênior (Sênior)
   Faixa: R$ 10.900 – 18.200 (SP) | Fonte: Robert Half 2026 + Glassdoor SP
   Aliases: Senior Data Analyst, Data Analyst Sr., Analista de BI Sênior
   Nota: Perfil responsável por arquitetura analítica...
```

**Para cargos ATUALIZADOS:**
```
── Cargos a atualizar ───────────────────────────

1. Engenheiro de Dados Sênior
   ANTES: R$ 13.000 – 19.000 | Fonte: Glassdoor BR 2025
   DEPOIS: R$ 11.000 – 18.000 | Fonte: Glassdoor SP mar/2026 (P25=R$11k, P75=R$18k)
   Nota atualizada: Analytics Engineer como título alternativo crescente...
```

Perguntar:
```
Confirmar gravação? (S para salvar / N para cancelar / número para ajustar item)
```

Se gestor digitar um número: pedir o ajuste específico para aquele item e regenerar antes de exibir novamente.

### Step 6: Salvar roles-map.json

Gravar via `node -e` com **aspas simples** no shell (evita interpolação de `$` pelo bash e problemas com heredoc):

```bash
node -e '
const fs = require("fs");
const path = require("path");
const dataPath = process.env.DATA_PATH || "./data";
const filePath = path.join(dataPath, "research", "roles-map.json");

if (!path.resolve(filePath).startsWith(path.resolve(dataPath))) {
  console.error("Path traversal detectado — abortando");
  process.exit(1);
}

fs.mkdirSync(path.join(dataPath, "research"), { recursive: true });

let rolesMap;
if (fs.existsSync(filePath)) {
  rolesMap = JSON.parse(fs.readFileSync(filePath, "utf8"));
} else {
  rolesMap = {
    updatedAt: new Date().toISOString(),
    source: "",
    methodology: "Dados coletados de publicações públicas de guias salariais e relatórios de mercado. Faixas representam percentil 25-75 de remuneração CLT mensal bruta para profissionais com experiência correspondente ao nível em empresas de médio/grande porte no Sudeste. Valores em BRL.",
    roles: []
  };
}

rolesMap.updatedAt = new Date().toISOString();
rolesMap.source = "Pesquisa manual consolidada de: Robert Half Guia Salarial TI {ano}, Glassdoor BR, State of Data Brazil, Catho Pesquisa Salarial. Âncora geográfica: São Paulo / Sudeste.";

const newRoles = [/* array com as entries aprovadas */];
newRoles.forEach(newRole => {
  const idx = rolesMap.roles.findIndex(r =>
    r.canonicalTitle.toLowerCase() === newRole.canonicalTitle.toLowerCase()
  );
  if (idx >= 0) {
    rolesMap.roles[idx] = newRole;
  } else {
    rolesMap.roles.push(newRole);
  }
});

fs.writeFileSync(filePath, JSON.stringify(rolesMap, null, 2));
console.log("roles-map.json atualizado:", rolesMap.roles.length, "cargos");
'
```

Exibir confirmação:
```
roles-map.json atualizado com sucesso!
Arquivo: {DATA_PATH}/research/roles-map.json
Total de cargos: {N}
Adicionados: {M} | Atualizados: {P}
```

## Notes for Agent

- **Estratégia de pesquisa em batch:** não pesquisar cargo por cargo. Fazer buscas abrangentes cobrindo todos os cargos do escopo de uma vez. Só fazer buscas direcionadas para cargos com lacunas.

- **Robert Half — acesso em camadas:** PDF direto → Playwright MCP na calculadora → cobertura jornalística. O site do RH não expõe valores no HTML estático; a calculadora é interativa (JavaScript). Se PDF não estiver disponível, Playwright é o caminho mais confiável para dados direto na fonte.

- **Playwright MCP — como usar corretamente:**
  - O plugin `playwright@claude-plugins-official` é iniciado automaticamente pelo Claude Code — **não instalar nem iniciar manualmente**
  - Verificar disponibilidade tentando a primeira ferramenta (`browser_navigate`); se retornar "Tool not found" ou "browser closed", seguir o fallback de cobertura jornalística (1c)
  - **Nunca chamar `browser_close`** durante a execução da skill — fecha o browser permanentemente para a sessão sem possibilidade de reabertura automática
  - O browser fica aberto entre navegações: usar o mesmo contexto para todas as fontes que precisarem de Playwright (RH calculadora → Glassdoor gaps)
  - Se o erro "Target page, context or browser has been closed" aparecer logo na primeira chamada, o browser foi fechado em uma sessão anterior — ver Troubleshooting
  - **Configuração headless (recomendada):** o plugin abre janela de browser visível por padrão. Configurar headless editando o arquivo abaixo e reiniciando o Claude Code:
    ```
    ~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json
    ```
    Conteúdo correto com headless:
    ```json
    {"playwright": {"command": "npx", "args": ["@playwright/mcp@latest", "--headless"]}}
    ```
    Esta é uma configuração única por máquina. Sem ela, fechar a janela do browser durante a execução destrói o contexto permanentemente.

- **Mapeamento de títulos Robert Half para cargos de dados:**
  - "Analista de Dados" → RH categoriza como **"Analista de BI"** (Júnior/Pleno/Sênior)
  - "Cientista de Dados" → RH lista como **"Especialista/Cientista de Dados"** — implicitamente Sênior; não há split Pleno/Sênior explícito
  - "Engenheiro de Dados" → **ausente no guia RH** — usar Glassdoor SP como âncora primária para este cargo

- **Glassdoor — somente WebSearch (WebFetch retorna 403):** nunca tentar WebFetch em pages do glassdoor.com.br. Usar snippets de WebSearch como fonte primária; Playwright MCP como fallback quando os snippets são insuficientes.

- **Glassdoor — per month vs per year:** os snippets de busca às vezes rotulam salários mensais como "por ano". O campo "faixa de salário base médio (R$Xk–R$Yk/mês)" é sempre confiável para identificar a unidade correta. Glassdoor BR reporta CLT mensais brutos.

- **State of Data Brazil — contexto, não âncora:** a pesquisa Data Hackers + Bain é referência de alta qualidade para tendências do mercado de dados BR (crescimento salarial, queda de contratações CLT, tecnologias emergentes). Porém, os dados detalhados por cargo/nível (P25/P75) estão atrás de formulário de download e não são acessíveis via WebSearch. Usar para enriquecer `notes`, não para definir `salaryRange`.

- **Fontes a evitar como âncora de salaryRange:**
  - `salario.com.br` — usa dados CAGED (registros CLT formais) que incluem verbas rescisórias e inflam a faixa de salário base mensal; usar só como validação de ordem de magnitude
  - `meutudo.com.br` — agregador sem metodologia publicada; valores inconsistentes entre cargos

- **salarySource com percentis:** incluir os valores P25/P75 usados diretamente no campo `salarySource` para rastreabilidade entre execuções futuras. Exemplo: `"Robert Half TI 2026 (P25=R$10.9k, P75=R$18.2k) + Glassdoor SP abr/2026"`. Isso permite identificar se uma atualização futura representa variação real ou ruído de metodologia.

- **node -e com aspas simples:** sempre usar aspas simples no shell ao invocar `node -e '...'`. Com aspas duplas, o bash interpreta `$` seguido de dígitos ou letras como variável de ambiente — `R$7k` vira `R.7k` silenciosamente, corrompendo os campos de notes e source.

- **Catho/Revelo — expectativas baixas:** Catho requer plano pago para dados por senioridade. Revelo não mantém salary report público indexável. Usar como validação de ordem de magnitude quando retornarem dados, mas não como âncora.

- **salaryRange: null quando sem dados:** NUNCA estimar ou interpolar faixas. Gravar `null` e documentar em `notes` qual fonte não cobriu o cargo.

- **Outliers:** se uma fonte retornar valores discrepantes em mais de 50% das demais, verificar metodologia. Blogs que citam total compensation (equity + bônus) em vez de CLT base tendem a inflar. Descartar outliers sem metodologia clara — não fazer média com eles.

- **Âncora geográfica SP/Sudeste:** faixas são CLT mensal bruta para São Paulo. Se encontrar dado nacional, registrar em `notes` (ex: "SP ~15% acima da média nacional").

- **Aliases dos portais BR:** pesquisar ativamente LinkedIn e Gupy para enriquecer `aliases[]`. Usar apenas títulos reais encontrados em vagas — não inventar. Aliases ricos melhoram o matching em `/pesquisar-mercado`. Evitar sufixos artificiais como "Mid" (não usado no Brasil) — usar "Pleno".

- **Canonicalização PT-BR:** `canonicalTitle` usa o nome preferencial do mercado BR. Os aliases cobrem as variações EN.

- **Sem duplicação:** verificar `canonicalTitle` existentes (case-insensitive) antes de adicionar. Se existir, é atualização.

- **O arquivo fica no data repo:** `data/research/roles-map.json` está no repositório separado (`hiring-pipeline-data`). Lembrar o gestor de commitar via `/commit-push` no data repo após salvar.

## Troubleshooting

**"Robert Half não retorna o cargo buscado"**
→ Verificar mapeamento de títulos em Notes. RH usa "Analista de BI" (não "Analista de Dados") e não lista "Engenheiro de Dados". Para Eng Dados, usar Glassdoor SP como âncora primária.

**"Playwright retorna 'Target page, context or browser has been closed' na primeira chamada"**
→ O browser foi fechado em uma sessão anterior (tipicamente por um `browser_close` explícito ou pelo usuário fechando a janela). O playwright-mcp não relança o browser automaticamente. Único caminho: reiniciar o Claude Code — isso relança o processo MCP com browser limpo. Enquanto isso, prosseguir com a cadeia de fallback: cobertura jornalística (1c) para RH e snippets de WebSearch para Glassdoor. A skill produz resultados de qualidade mesmo sem Playwright.

**"Browser abriu uma janela de browser visível durante a execução"**
→ O plugin `@playwright/mcp` roda em modo headed por padrão — abre uma janela real do Chromium. Para rodar headless e evitar esse problema permanentemente, editar `~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json` e adicionar `"--headless"` nos args:
```json
{"playwright": {"command": "npx", "args": ["@playwright/mcp@latest", "--headless"]}}
```
Reiniciar o Claude Code após salvar. Enquanto não configurado, **não fechar** a janela — fechar destrói o contexto permanentemente para a sessão.

**"Ferramentas mcp__plugin_playwright_playwright__* não aparecem no contexto"**
→ O plugin `playwright@claude-plugins-official` não está habilitado ou o processo MCP morreu. Verificar `enabledPlugins` no `settings.json`. Se o processo foi morto manualmente (kill), as ferramentas ficam indisponíveis até reiniciar o Claude Code — reiniciar resolve.

**"Glassdoor retorna 403 no WebFetch"**
→ Esperado — Glassdoor bloqueia WebFetch. Usar snippets de WebSearch. Se insuficiente, usar Playwright MCP: `browser_navigate` → URL da página de salários → `browser_snapshot` para extrair os dados.

**"Snippets do Glassdoor mostram valores 'por ano' suspeitos"**
→ Provavelmente são mensais com rótulo errado. Confirmar pela "faixa de salário base médio (R$Xk–R$Yk/mês)" que sempre aparece nos resultados. Usar esse campo como verdade.

**"Valores em notes ficaram com 'R.6k' no lugar de 'R$7.6k' após salvar"**
→ O comando foi executado com aspas duplas no shell (`node -e "..."`). O bash interpretou `$7` como variável vazia, removendo o cifrão. Corrigir: sempre usar aspas simples (`node -e '...'`). Para corrigir um arquivo já salvo, abrir manualmente e substituir os valores corrompidos.

**"Uma fonte retorna valores muito fora do padrão"**
→ Verificar se a fonte cita metodologia CLT base ou total compensation. Blogs sem metodologia publicada que citam valores 50%+ acima das demais fontes devem ser descartados — não fazer média. Registrar a divergência em `notes` se o cargo for emergente e houver incerteza legítima.

**"Fontes tradicionais retornam dados divergentes"**
→ Priorizar Robert Half como âncora quando disponível. Usar Glassdoor para mediana spot-check. Se divergência > 30% entre fontes metodologicamente sólidas, registrar ambas as faixas em `notes` e usar a média aritmética como `salaryRange`.

**"Cargo muito novo — sem dados públicos"**
→ Gravar `salaryRange: null`. Em `notes`, registrar "dados salariais públicos ainda escassos para este cargo em {ano}" e indicar fontes consultadas.

**"Cargo emergente sem nome consolidado em PT-BR"**
→ Usar o nome EN como `canonicalTitle` temporariamente (ex: "AI Engineer") e registrar em `notes`. Ex: Staff Engineer, Platform Engineer.

**"WebSearch retorna dados de anos anteriores"**
→ Adicionar o ano atual explicitamente nas queries. Se só houver dados antigos, registrar o ano em `salarySource` (ex: "Robert Half TI 2025 — dado mais recente disponível").

## Related Skills

- `/pesquisar-mercado` — usa roles-map como âncora de `salaryRange` no profileHints
- `/refinar-perfil` — usa roles-map indiretamente via profileHints do resumo de pesquisa

---

**Skill created:** 2026-04-22
**Last updated:** 2026-04-22
**Updated:** 2026-04-26 — Phase 7: skill descontinuada. Tecnicas de scraping absorvidas pelo /pesquisar-mercado. Ver migration note acima.
**Status:** Deprecated — use /pesquisar-mercado
