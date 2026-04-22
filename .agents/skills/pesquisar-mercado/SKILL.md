---
name: pesquisar-mercado
description: |
  Coleta dados de vagas reais em portais BR via WebSearch + WebFetch, extrai stack,
  senioridade, comportamentos e arquétipo por vaga, e gera dois arquivos em
  DATA_PATH/research/: {slug}-{date}-vagas.json (vagas brutas) e
  {slug}-{date}-resumo.json (summary executivo + profileHints para uso no /refinar-perfil).
  Use quando quiser contextualizar um perfil com dados reais do mercado antes de refinar.
command: /pesquisar-mercado
---

# SKILL: Pesquisar Mercado

Coleta sistemática de dados de vagas em portais BR. Combina WebSearch + WebFetch (LinkedIn,
vagas.com.br, InfoJobs) com Playwright MCP (Gupy, Catho) para cobrir o mercado nacional.
Filtra por porte de empresa, extrai estrutura por vaga e gera dois arquivos persistentes
por execução: vagas brutas e resumo executivo com profileHints prontos para o /refinar-perfil.

## Pre-Conditions

- DATA_PATH environment variable set e apontando para o repositório de dados
- Acesso a WebSearch e WebFetch (para LinkedIn, vagas.com.br, InfoJobs)
- Playwright MCP disponível (`mcp__plugin_playwright_playwright__*`) para Gupy e Catho
- (Opcional) Sessão autenticada disponível em `$DATA_PATH/sessions/{portal}-session.json`

## Execution Flow

### Step 1: Coletar Escopo Conversacional

Perguntar ao gestor em conversa natural (não formulário rígido):

- **Cargo/função** a pesquisar (ex: "Engenheiro Sênior de Software", "Staff Engineer")
- **Localização** (default: pesquisa nacional — sem restrição geográfica nas queries; mencionar que âncora salarial é Sudeste/Sul via `data/research/roles-map.json`)
- **Senioridade** (Pleno / Sênior / Staff / Principal / Arquiteto)
- **Stacks-chave** de interesse (ex: Java + Python + TypeScript)
- **Indústria/setor** (default: Tecnologia)
- **Profundidade da pesquisa** (apresentar as 3 opções):
  - `enxuta` — 5-10 vagas, ~5 min
  - `média` — 15-25 vagas, ~15 min (padrão recomendado)
  - `profunda` — 30-50 vagas, ~30 min+
- **Porte de empresa** (default: `médias+`):
  - `todas` — incluir startups e pequenas empresas
  - `médias+` — filtrar para médias e grandes (default recomendado)
  - `grandes+` — apenas empresas de grande porte

**Gerar slug sanitizado** a partir de cargo + data:
- Converter para kebab-case em minúsculas
- Aceitar APENAS caracteres `[a-z0-9-]`
- REJEITAR slugs com `..`, `/`, `\`, espaços ou caracteres especiais — gerar slug automaticamente
- Exemplos válidos: `senior-pd-java-python-ts-sp`, `staff-engineer-sp`, `arquiteto-solucoes-java`

Após coletar, exibir resumo e aguardar confirmação:

```
Escopo definido:
  Cargo: {role} ({seniority})
  Local: {location ou "Nacional"}
  Stacks: {stack[].join(', ')}
  Profundidade: {depth}
  Porte: {companySize}
  Slug: {slug}-{YYYY-MM-DD}

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

**2.2 — Executar queries WebSearch nos portais aprovados:**

Portais aprovados (em ordem de prioridade — conforme `05-01-PORTALS.md`):

| # | Portal | Mecanismo | User-Agent |
|---|--------|-----------|-----------|
| 1 | Gupy (`portal.gupy.io`) | Playwright MCP | N/A (headless) |
| 2 | LinkedIn (`linkedin.com/jobs`) | WebFetch | Googlebot UA |
| 3 | vagas.com.br | WebFetch | Chrome UA |
| 4 | InfoJobs BR (`infojobs.com.br`) | WebFetch | Chrome UA |
| 5 | Catho (`catho.com.br`) | Playwright MCP | N/A (headless) |

**Queries default por senioridade** (PT-BR preferencial, EN como complemento):

| Senioridade | Query PT | Query EN |
|-------------|---------|---------|
| Pleno | `"desenvolvedor pleno {stack-principal}"` | `"mid-level {stack-principal} developer brazil"` |
| Sênior | `"engenheiro sênior {stack-principal}"` | `"senior {stack-principal} engineer brazil"` |
| Staff/Principal | `"staff engineer brazil"` | `"principal engineer brasil"` |
| Arquiteto | `"arquiteto de soluções {stack-principal}"` | `"solutions architect {stack-principal} brazil"` |

**Notas de acesso:**
- **Gupy via Playwright MCP:** URL nacional sem restrição de estado: `https://portal.gupy.io/job-search/term={cargo-generico}`. Usar termo genérico (ex: "engenheiro senior") — termos compostos com stack retornam 0 resultados. Para SP: adicionar `&state=S%C3%A3o%20Paulo`.
- **LinkedIn via WebFetch Googlebot:** usar `User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`. URL: `https://www.linkedin.com/jobs/search/?keywords={query}&location=Brazil`.
- **vagas.com.br via WebFetch:** usar `User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`. URL semântica: `https://www.vagas.com.br/vagas-de-{cargo-slug}`.
- **InfoJobs via WebFetch:** mesmo Chrome UA acima. URL: `https://www.infojobs.com.br/empregos-en-{cargo-slug},{estado}.aspx`.
- **Catho via Playwright MCP:** curl retorna 404 do Akamai CDN (falso negativo de bloqueio de bot). Usar Playwright headless.

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

**3.3 — Executar WebFetch:**
- LinkedIn: extrair títulos e empresas de `<h3 class="base-search-card__title">` na SERP; fazer WebFetch de vagas individuais para descrição completa.
- Gupy: snapshot do Playwright retorna lista estruturada (título, empresa, localização, URL da vaga). URLs individuais no formato `{empresa}.gupy.io/job/{base64_id}` — acessar via WebFetch ou Playwright para descrição.
- vagas.com.br: listagem retorna ~9 links no HTML inicial; vagas individuais têm HTML estático completo.
- InfoJobs: listagem retorna ~5 `data-href` visíveis; vagas individuais (~100KB) acessíveis via WebFetch.

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

### Step 5: Salvar {slug}-{date}-vagas.json

**5.1 — Verificar colisão de nome no mesmo dia:**

```bash
ls $DATA_PATH/research/{slug}-{date}-vagas.json 2>/dev/null
```

Se existir: usar sufixo `-2`, `-3`, etc. inserido ANTES de `-vagas.json` e `-resumo.json`.
Exemplo: `senior-pd-java-python-ts-sp-2026-04-22-2-vagas.json`

**5.2 — Criar diretório se necessário:**

```bash
node -e "require('fs').mkdirSync(require('path').join(process.env.DATA_PATH || './data', 'research'), { recursive: true })"
```

**5.3 — Salvar vagas brutas via node -e (NÃO heredoc — evita problemas com aspas e newlines):**

```bash
node -e "
const fs = require('fs');
const path = require('path');
const dataPath = process.env.DATA_PATH || './data';
const fileName = '{slug}-{date}-vagas.json';
const filePath = path.resolve(dataPath, 'research', fileName);
// Validar path traversal antes de escrever
const researchDir = path.resolve(dataPath, 'research');
if (!filePath.startsWith(researchDir)) {
  console.error('Path traversal detectado — abortando');
  process.exit(1);
}
const vagasData = {/* objeto completo conforme schema abaixo */};
fs.writeFileSync(filePath, JSON.stringify(vagasData, null, 2));
console.log('Vagas salvas em:', filePath);
"
```

**Schema completo de {slug}-{date}-vagas.json:**

```json
{
  "slug": "senior-pd-java-python-ts-sp-2026-04-22",
  "createdAt": "2026-04-22T10:30:00.000Z",
  "depth": "média",
  "scope": {
    "role": "Engenheiro Sênior de Software",
    "location": "Nacional",
    "seniority": "Sênior",
    "stack": ["Java", "Python", "TypeScript"],
    "industry": "Tecnologia",
    "companySize": "médias+"
  },
  "sessions": [
    { "portal": "linkedin", "authenticated": true },
    { "portal": "gupy", "authenticated": false }
  ],
  "sources": [
    { "portal": "gupy", "query": "engenheiro senior", "url": "https://portal.gupy.io/...", "status": "OK" },
    { "portal": "linkedin", "query": "engenheiro sênior java python", "url": "https://linkedin.com/jobs/...", "status": "OK" }
  ],
  "jobs": [
    {
      "title": "Engenheiro Sênior de Software",
      "company": "TechCorp",
      "companySize": "grande",
      "url": "https://techcorp.gupy.io/job/abc123",
      "snippet": "Buscamos engenheiro sênior com experiência em Java e Python...",
      "portal": "gupy",
      "fetchedFull": true,
      "authenticated": false,
      "stack": ["Java", "Python", "Spring Boot", "Kafka"],
      "seniority": "Sênior",
      "salaryRange": { "min": 15000, "max": 22000, "currency": "BRL" },
      "behaviors": ["comunicação técnica clara", "mentoria de desenvolvedores juniores"],
      "archetype": "arquiteto técnico"
    }
  ]
}
```

Exibir: `Vagas brutas salvas: {N} vagas em {filePath}`

### Step 6: Gerar Summary Executivo + profileHints e Salvar {slug}-{date}-resumo.json

**6.1 — Com base nas vagas coletadas, gerar o bloco `summary`:**

- `commonTitles[]` — títulos de cargo mais frequentes nas vagas coletadas
- `titleAliases[]` — variações do mesmo papel (ex: "Dev Sênior Backend", "Engenheiro Backend Sênior")
- `stackFrequency{}` — objeto `{ tecnologia: contagem }` para todas as tecnologias mencionadas
- `emergingStack[]` — tecnologias presentes em menos de 30% das vagas mas em crescimento notável
- `salaryRange` — faixa agregada das vagas que exibiram salário; `null` se nenhuma teve faixa visível
- `salarySource` — descrição da origem (ex: `"6 de 20 vagas com faixa salarial visível"`)
- `commonBehaviors[]` — competências comportamentais mais frequentes
- `commonChallenges[]` — desafios mais citados nas descrições
- `archetypes[]` — arquétipos detectados com frequência
- `trends[]` — tendências observadas no conjunto (ex: "crescimento de IA generativa nos requisitos")
- `redFlags[]` — padrões preocupantes (ex: "exige 10+ linguagens diferentes sem foco claro")

**6.2 — Gerar o bloco `profileHints`** (pré-mastigado para uso no /refinar-perfil):

Usar APENAS os 4 campos descritivos do JobProfile + identificação — não inventar campos novos (D-01):

- `responsibilities[]` — sugestões de responsabilidades derivadas do padrão de vagas
- `qualifications[]` — array de `{ text: string, required: boolean }` — format ProfileItem[] do `src/lib/profile.ts`
- `behaviors[]` — competências comportamentais sugeridas
- `challenges[]` — desafios sugeridos para o cargo
- `suggestedTitle` — título mais adequado para o perfil (baseado em `commonTitles`)
- `suggestedExperienceLevel` — um dos valores válidos: `"< 1 ano"` | `"1-3 anos"` | `"3-5 anos"` | `"5-10 anos"` | `"> 10 anos"`

**6.3 — Salvar via node -e com a mesma validação de path traversal do Step 5:**

**Schema completo de {slug}-{date}-resumo.json:**

```json
{
  "slug": "senior-pd-java-python-ts-sp-2026-04-22",
  "createdAt": "2026-04-22T10:35:00.000Z",
  "vagasFile": "senior-pd-java-python-ts-sp-2026-04-22-vagas.json",
  "summary": {
    "commonTitles": ["Engenheiro Sênior de Software", "Senior Software Engineer"],
    "titleAliases": ["Dev Sênior Backend", "Engenheiro Backend Sênior"],
    "stackFrequency": { "Java": 18, "Python": 12, "TypeScript": 8, "Spring Boot": 14, "Kafka": 7 },
    "emergingStack": ["LangChain", "FastAPI", "Kafka Streams"],
    "salaryRange": { "min": 12000, "max": 22000, "currency": "BRL", "location": "Sudeste/Sul" },
    "salarySource": "6 de 20 vagas com faixa salarial visível",
    "commonBehaviors": ["liderança técnica", "mentoria de juniores", "comunicação com stakeholders"],
    "commonChallenges": ["escalar sistemas legados", "adoção de IA generativa em produtos"],
    "archetypes": ["arquiteto técnico", "evangelizador de IA"],
    "trends": ["crescimento de IA generativa nos requisitos", "stack tri-linguagem valorizada"],
    "redFlags": ["exigência de 10+ linguagens diferentes sem foco claro"]
  },
  "profileHints": {
    "responsibilities": [
      "Projetar e implementar soluções escaláveis em Java e Python",
      "Liderar decisões técnicas de arquitetura em colaboração com o time"
    ],
    "qualifications": [
      { "text": "5+ anos de experiência com Java e ecossistema Spring", "required": true },
      { "text": "Experiência com Python para serviços de dados ou IA", "required": true },
      { "text": "Experiência com LLMs e APIs de IA generativa", "required": false }
    ],
    "behaviors": [
      "Comunicação técnica clara para stakeholders não-técnicos",
      "Capacidade de mentoria e desenvolvimento de engenheiros juniores"
    ],
    "challenges": [
      "Modernizar sistemas legados mantendo continuidade operacional",
      "Integrar soluções de IA generativa em produtos existentes"
    ],
    "suggestedTitle": "Engenheiro Sênior de Software",
    "suggestedExperienceLevel": "5-10 anos"
  }
}
```

Exibir: `Resumo executivo salvo: {filePath}`

### Step 7: Exibir Resultado e Sugerir Próxima Ação

```
Pesquisa concluída!

Vagas coletadas: {N} ({M} filtradas por porte — {F} vagas excluídas)
Portais usados: {lista de portais com status OK}
Sessões autenticadas: {lista ou "nenhuma"}

Arquivos gerados:
  {DATA_PATH}/research/{slug}-{date}-vagas.json
  {DATA_PATH}/research/{slug}-{date}-resumo.json

Stack mais frequente: {top 3 do stackFrequency}
Faixa salarial agregada: {salaryRange.min}–{salaryRange.max} BRL (ou "não disponível — nenhuma vaga exibiu faixa")
Arquétipos detectados: {archetypes[].join(', ')}

Próxima ação sugerida:
  Execute /refinar-perfil e selecione a pesquisa acima quando solicitado
```

## Notes for Agent

- **Sessões autenticadas — privacidade:** NUNCA logar, exibir ou incluir no output o conteúdo de arquivos de sessão (`$DATA_PATH/sessions/{portal}-session.json`). Apenas verificar existência via `ls`. Esses arquivos contêm credenciais.
- **Sanitização de slug:** aceitar APENAS `[a-z0-9-]`. Rejeitar slugs com `..`, `/`, `\`, espaços ou qualquer outro caractere especial. Gerar slug automaticamente a partir do cargo + data — nunca aceitar slug digitado diretamente pelo gestor.
- **Validação de path traversal no Step 5 e 6:** construir o path com `path.resolve()` e verificar que começa com o diretório `research` antes de escrever. Abortar com erro se `filePath` não começar dentro de `$DATA_PATH/research/`.
- **salaryRange nulo é correto:** quando nenhuma vaga coletada exibiu faixa salarial, `salaryRange: null` é o valor correto em `summary`. NÃO inventar valores ou usar ranges do `roles-map.json` como substituto para dados ausentes nas vagas coletadas.
- **profileHints usa apenas os campos do JobProfile (D-01):** `responsibilities[]`, `qualifications[]` (com `required:boolean`), `behaviors[]`, `challenges[]`, `suggestedTitle`, `suggestedExperienceLevel`. Não inventar campos novos. `qualifications` é `ProfileItem[]` com `{ text: string, required: boolean }` — não `string[]`.
- **Colisão de nome no mesmo dia:** sufixo `-2`, `-3` inserido ANTES de `-vagas` e `-resumo`. Exemplo: `...sp-2026-04-22-2-vagas.json` e `...sp-2026-04-22-2-resumo.json`.
- **node -e para salvar JSON:** não usar heredoc — evita problemas com aspas e newlines no conteúdo das vagas.
- **WebFetch que falha:** registrar como `"unavailable"` em `sources[]` e continuar. Sem retry agressivo.
- **Filtro de porte é heurística best-effort:** a classificação de porte por nome da empresa pode errar. Vagas com `companySize: "desconhecido"` são incluídas mesmo em filtros restritivos. Documentar no output quantas vagas tiveram porte estimado vs. desconhecido.
- **Gupy sem sessão é funcional:** 23+ vagas retornadas via Playwright MCP sem autenticação. Não classificar Gupy como "unavailable" por ausência de sessão.
- **Busca nacional por padrão:** não fixar localização nas queries de WebSearch/Playwright. O filtro de porte (D-26) é a âncora de qualidade — não a localização. Gestor pode restringir no Step 1 se desejar.
- **TypeScript nas queries:** adicionar "typescript" como termo de busca gera ruído (vagas de front-end puro). Preferir "backend" ou o stack principal como qualificador; avaliar TypeScript no conteúdo das vagas coletadas.
- **Dados pessoais de candidatos:** apenas dados de vagas públicas (empresa, cargo, requisitos). Nunca persistir PII de candidatos (nome, email, telefone) — vagas são informações públicas de empregadores, não de candidatos.

## Troubleshooting

**"DATA_PATH não está definido"**
→ Configurar a variável de ambiente:
```bash
export DATA_PATH=/caminho/para/repo-de-dados
```

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
→ Comportamento esperado ao rodar duas pesquisas com mesmo escopo no mesmo dia. O Step 5 detecta colisão automaticamente e usa sufixo `-2`, `-3`, etc.

**"Erro de path traversal detectado"**
→ O slug gerado contém caracteres inválidos. A skill sanitiza automaticamente — se ocorreu mesmo assim, reportar o cargo/escopo fornecido ao gestor para diagnóstico.

## Related Skills

- `/refinar-perfil` — refinamento de perfil usando o `-resumo.json` gerado por esta skill como contexto
- `/abrir-vaga` — criar vaga a partir de um perfil refinado com dados de mercado
- `/fechar-versao` — referência de guardrails de segurança operacional

---

**Skill created:** 2026-04-22
**Updated:** —
**Status:** Ready for Claude Code integration
