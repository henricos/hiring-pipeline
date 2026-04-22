# Portais BR para /pesquisar-mercado — Pesquisa Abril/2026

**Data:** 2026-04-22 (atualizado após pesquisa complementar de MCPs e scrapers)
**Escopo testado:** Engenheiro Sênior de Software — Java + Python + TypeScript — São Paulo
**Metodologia:** Duas fases:
1. WebFetch direto (curl) com User-Agents variados — LinkedIn, vagas.com.br, InfoJobs, Glassdoor, Catho, Remotar
2. Playwright MCP (`mcp__plugin_playwright_playwright__*`) — teste real na Gupy confirmou 23 resultados sem autenticação; pesquisa complementar de scrapers e MCPs disponíveis

---

## Mecanismos de Acesso Disponíveis

A skill `/pesquisar-mercado` roda dentro de uma sessão Claude Code, o que dá acesso a dois mecanismos complementares:

| Mecanismo | Quando usar | Portais |
|-----------|-------------|---------|
| **WebFetch** (com User-Agent correto) | Portais com HTML estático ou SERP pública | LinkedIn (Googlebot UA), vagas.com.br, InfoJobs (vagas individuais) |
| **Playwright MCP** (`mcp__plugin_playwright_playwright__*`) | Portais JS-heavy que retornam lista vazia via curl | Gupy, vagas.com.br (lista completa), InfoJobs (lista completa) |

**Regra de uso do Playwright:** sempre headless (padrão do MCP — não abre janela de browser). A única exceção é o fluxo de captura de sessão autenticada, que deve ser um passo manual separado e explícito (ver seção "Sessão Autenticada").

**Playwright MCP disponível:** plugin `playwright@claude-plugins-official` instalado no ambiente do usuário — tools `mcp__plugin_playwright_playwright__browser_navigate`, `__browser_snapshot`, `__browser_click`, etc.

---

## Portais Aprovados

Lista final de portais aprovados para uso na skill `/pesquisar-mercado` (em ordem de prioridade):

| # | Portal | Mecanismo primário | Cobertura (sem auth) | Snippet qualidade | Salário visível | Sessão autenticada agrega? |
|---|--------|-------------------|----------------------|------------------|-----------------|---------------------------|
| 1 | Gupy (`portal.gupy.io`) | Playwright MCP | **23+ vagas** SP confirmadas (teste real) | Alta | Não | Sim (vagas internas de empresas) |
| 2 | LinkedIn (`linkedin.com/jobs`) | WebFetch Googlebot UA | 22-25 vagas na SERP | Alta | Não | Sim (vagas promoted, mais cobertura) |
| 3 | vagas.com.br | WebFetch Chrome UA (vagas individuais) | ~9 links na listagem HTML inicial | Média | Parcial ("a combinar") | Não |
| 4 | InfoJobs BR (`infojobs.com.br`) | WebFetch Chrome UA (vagas individuais) | ~5 links via `data-href` no HTML inicial | Média | Sim (benefícios detalhados) | Não |

**Observações de cobertura:**

- **Gupy** é o ATS mais usado por empresas BR de médio/grande porte (Itaú, Americanas, Magazine Luiza, FCamara, ClickBus, Comgás, etc.). Teste real com Playwright MCP retornou 23 resultados para "engenheiro senior" em SP **sem autenticação** — lista completa acessível via JS. Sobe para prioridade 1. URL de busca: `https://portal.gupy.io/job-search/term={termo}&state=S%C3%A3o%20Paulo`
- **LinkedIn** retornou as vagas mais relevantes para o escopo (senior software engineer SP): empresas como Lastro, Brex, PicPay, Itaú, Tembici, Banco PAN. Query PT retornou 25 vagas; EN retornou 22.
- **vagas.com.br** retornou vagas tech genéricas (frontend, Python, Node.js, arquiteto de soluções). URL semântica de um termo (ex: `vagas-de-desenvolvedor-senior`) retorna ~9 links; dois termos compostos (ex: `engenheiro-senior-java`) tende a retornar 0-1. Vagas individuais têm HTML estático completo.
- **InfoJobs** tem vagas tech com conteúdo rico (responsabilidades, stack, benefícios). Listagem carregada via JS — apenas 5 `data-href` no HTML inicial. Vagas individuais (~100KB) são plenamente acessíveis via WebFetch.

---

## Queries Default por Senioridade

**Idioma recomendado:** PT-BR com fallback EN — testes mostraram que queries em PT retornam ligeiramente mais resultados no LinkedIn (25 vs 22) e mais vagas contextualmente corretas no vagas.com.br. Recomendação: tentar PT primeiro, EN como complemento.

| Senioridade | Query PT | Query EN | Observação |
|-------------|---------|---------|------------|
| Pleno | "desenvolvedor pleno java python são paulo" | "mid-level java python developer são paulo" | PT retorna mais resultados no LinkedIn; EN útil para empresas com nome em inglês |
| Sênior | "engenheiro sênior java python são paulo" | "senior java python engineer são paulo" | Ambas funcionam; PT captura títulos como "Engenheiro de Software Sênior" e "Desenvolvedor Sênior"; EN captura "Senior Software Engineer" de empresas globais |
| Staff/Principal | "staff engineer são paulo" | "staff engineer brazil" | Staff Engineer quase sempre em EN no mercado BR — usar EN preferencialmente; PT raramente aparece |
| Arquiteto | "arquiteto de soluções java python são paulo" | "solutions architect java python são paulo" | PT captura vagas de consultorias BR; EN captura multinacionais; misto recomendado |

**Nota sobre TypeScript:** TypeScript não é eficaz como termo de busca isolado — adicionar "typescript" às queries de senior e staff retorna ruído (muitas vagas de front-end puro). Preferir "backend" ou "java python" como qualificadores de stack, e avaliar TypeScript no conteúdo das vagas coletadas.

---

## Sessão Autenticada (opcional, melhora cobertura)

Sessão autenticada é **opcional** e nunca bloqueia a execução — a skill funciona sem ela usando os mecanismos anônimos acima. Quando presente, expande cobertura nos portais que a suportam.

**Regra de captura:** a captura de sessão é sempre um **passo manual separado e explícito** do gestor, fora do fluxo da skill. Nunca abrir browser com login interativo durante uma execução normal de `/pesquisar-mercado` — isso quebraria o modo headless. Se a sessão não existir ou tiver expirado, registrar fallback e prosseguir.

### LinkedIn (sessão agrega cobertura)

**O que muda com sessão:** cobertura consideravelmente maior (vagas "promoted", vagas que não aparecem na SERP pública), acesso a informações de candidatura. Sem sessão, SERP pública via Googlebot UA já retorna 22-25 vagas funcionais.

**Como capturar sessão (passo manual, fora da skill):**
```bash
# Instalar Playwright se não tiver:
npx playwright install chromium

# Abrir browser com salvamento de sessão (modo com UI — única exceção ao headless):
npx playwright open --save-storage=$DATA_PATH/sessions/linkedin-session.json https://www.linkedin.com/login

# Fazer login manualmente no browser que abrir
# Fechar o browser quando o login for concluído
# A sessão será salva automaticamente no path especificado
```

**Validade estimada:** 7-30 dias
**Arquivo esperado:** `$DATA_PATH/sessions/linkedin-session.json`
**Fallback:** Googlebot UA para busca — funcional mas cobertura parcial.

### Gupy (sessão agrega vagas internas)

**O que muda com sessão:** Gupy já funciona sem autenticação via Playwright MCP (teste real: 23 resultados). Sessão adiciona vagas internas e de empresas que não publicam no portal público.

**Como capturar sessão (passo manual, fora da skill):**
```bash
npx playwright install chromium

# Abrir browser com salvamento de sessão (modo com UI):
npx playwright open --save-storage=$DATA_PATH/sessions/gupy-session.json https://portal.gupy.io/auth/sign-in

# Fazer login manualmente
# Fechar o browser quando concluído
```

**Validade estimada:** 7-14 dias
**Arquivo esperado:** `$DATA_PATH/sessions/gupy-session.json`
**Fallback:** Playwright MCP sem sessão — já retorna resultados públicos normalmente.

**AVISO DE SEGURANÇA (ambos os portais):** Arquivos de sessão contêm credenciais. Nunca logar o conteúdo, nunca incluir no output exibido ao gestor, nunca versionar no git. O diretório `$DATA_PATH/sessions/` deve estar no `.gitignore` do repositório de dados.

---

## Portais Descartados

| Portal | Motivo do descarte |
|--------|-------------------|
| Glassdoor BR (`glassdoor.com.br`) | 403 consistente em 100% das tentativas (Chrome UA, Googlebot UA, qualquer URL). Útil apenas para pesquisa manual de faixas salariais via navegador — fora do escopo da skill automatizada. |
| Catho (`catho.com.br`) | Domínio retorna 404 em qualquer URL, incluindo a home. Fora do ar em abril/2026. |
| Remotar (`remotar.com.br`) | Especializado em vagas 100% remotas. Sem vagas presenciais/híbridas em São Paulo. |

---

## Ferramentas Externas Pesquisadas (não adotadas)

| Ferramenta | O que é | Por que não adotar |
|------------|---------|-------------------|
| `jobspy-mcp-server` (PyPI) | MCP para scraping de LinkedIn, Indeed, Glassdoor, Google Jobs com filtro de localização e país | Cobre portais US/global — não tem suporte nativo a Gupy, vagas.com.br ou InfoJobs BR. Com Playwright MCP disponível localmente, não agrega. |
| `python-jobspy` | Biblioteca Python base do MCP acima | Mesma limitação — portais BR não cobertos. |
| Apify `brazil-jobs-scraper` | Actor que cobre LinkedIn + vagas.com.br + Gupy | Requer conta Apify com créditos pagos. Desnecessário com Playwright MCP disponível. |
| Gupy API oficial (`api.gupy.io`) | API REST para empregadores gerenciarem vagas | Requer Bearer token de empregador (Premium/Enterprise). Não é API pública de busca. |

---

## Limites Conhecidos

- **LinkedIn sem autenticação:** SERP pública retorna 22-25 vagas via Googlebot UA — funcional. User-Agent Chrome padrão causa redirect para login com HTML vazio sem JS. Usar sempre Googlebot UA para acesso anônimo.
- **vagas.com.br — listagem:** Cloudflare CDN retorna ~9 links no HTML inicial. Lista completa carregada via JS — usar Playwright MCP se precisar de mais vagas. Vagas individuais têm HTML estático e funcionam perfeitamente via WebFetch.
- **InfoJobs — listagem:** Apenas 5 `data-href` visíveis no HTML inicial via WebFetch. Lista completa via JS. Estratégia recomendada: usar os links disponíveis e WebFetch das vagas individuais (conteúdo rico, ~100KB).
- **Gupy — URL de busca:** Formato correto: `https://portal.gupy.io/job-search/term={termo}&state=S%C3%A3o%20Paulo`. Queries com múltiplos termos técnicos (ex: "engenheiro senior java python") retornam 0 resultados — usar termo genérico de cargo (ex: "engenheiro senior") e filtrar stack no conteúdo das vagas.
- **Glassdoor — salários:** Bloqueado (403). Dados salariais obtidos via Robert Half Salary Guide e pesquisas manuais — ver `data/research/roles-map.json`.
- **Engines de busca direto:** Google/Bing/DuckDuckGo via curl retornam HTML vazio ou Cloudflare challenge. Não usar `site:gupy.io` via WebFetch — acessar os portais diretamente.
- **Playwright headless:** O Playwright MCP sempre roda headless (sem janela visível). A única exceção permitida é a captura manual de sessão autenticada, que deve ser um passo separado e explícito fora do fluxo da skill (ver seção "Sessão Autenticada").

---

## Notas para o Executor do 05-03

- **Prioridade de portais:** Gupy (Playwright MCP) → LinkedIn (WebFetch Googlebot) → vagas.com.br (WebFetch) → InfoJobs (WebFetch vagas individuais)
- **Gupy sem sessão:** funciona normalmente via Playwright MCP — 23+ vagas acessíveis. Não classificar como "unavailable" sem sessão.
- **Playwright MCP:** usar `mcp__plugin_playwright_playwright__browser_navigate` + `__browser_snapshot` para Gupy. Sempre headless — não passar parâmetros que abram UI. Paginação via `__browser_click` no botão "Próxima página".
- **User-Agents para WebFetch:**
  - LinkedIn: `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`
  - vagas.com.br: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
  - InfoJobs: mesmo Chrome UA acima
- **Sessão autenticada:** detectar automaticamente por `$DATA_PATH/sessions/{portal}-session.json`. Se existir, passar como `storageState` para o Playwright MCP. Se não existir, usar fallback anônimo sem bloquear.
- **Extraindo vagas da Gupy:** acessibilidade snapshot retorna lista estruturada com título, empresa, localização, modelo de trabalho e URL da vaga individual (formato `{empresa}.gupy.io/job/{base64_id}`). URLs de vagas individuais são acessíveis via WebFetch ou Playwright para descrição completa.
- **Extraindo vagas do LinkedIn:** SERP via Googlebot retorna vagas em `<h3 class="base-search-card__title">` — usar esse seletor para extrair títulos e empresas.
- **Arquivos de sessão:** registrar no campo `sessions[]` do `-vagas.json` qual portal usou autenticação e qual foi anônimo. Nunca incluir o conteúdo do arquivo de sessão no output.
