# Portais BR para /pesquisar-mercado — Pesquisa Abril/2026

**Data:** 2026-04-22
**Escopo testado:** Engenheiro Sênior de Software — Java + Python + TypeScript — São Paulo
**Metodologia:** WebFetch direto (curl) com User-Agents: Chrome padrão, Googlebot/2.1, Windows Chrome 121. Cada portal testado com query PT e EN. Vagas individuais testadas sempre que a busca retornou links.

---

## Portais Aprovados

Lista final de portais aprovados para uso na skill `/pesquisar-mercado` (em ordem de prioridade):

| # | Portal | Método de acesso | WebFetch busca | WebFetch vaga individual | Snippet qualidade | Salário visível | Sessão autenticada recomendada |
|---|--------|-----------------|----------------|--------------------------|------------------|-----------------|-------------------------------|
| 1 | LinkedIn (`linkedin.com/jobs`) | User-Agent Googlebot | OK (22-25 vagas na SERP) | OK (descrição completa, ~277KB) | Alta | Não | Sim (mais vagas e detalhes) |
| 2 | vagas.com.br | Direto (Chrome UA) | OK parcial (9 links via Cloudflare CDN) | OK (descrição completa, ~55KB, HTML estático) | Média | Parcial (campo existe, frequentemente "a combinar") | Não |
| 3 | InfoJobs BR (`infojobs.com.br`) | Direto (Chrome UA) | OK parcial (5 data-href visíveis; lista via JS) | OK (conteúdo completo, ~100KB, sem Cloudflare) | Média | Sim ("salário a combinar" + benefícios detalhados) | Não |
| 4 | Gupy portal (`portal.gupy.io`) | User-Agent Chrome + Playwright | Requer JS (lista carregada via fetch JWT) | Depende (subdomínios empresa.gupy.io inacessíveis sem JS) | Alta (quando acessível) | Não | Sim (necessária para listar vagas) |

**Observações de cobertura:**

- **LinkedIn** retornou as vagas mais relevantes para o escopo (senior software engineer SP): empresas como Lastro, Brex, Mindrift, Segura, PicPay, Itaú, Tembici, Banco PAN. Query EN retornou 22 vagas; query PT retornou 25 vagas (ligeiramente melhor em PT para este escopo).
- **vagas.com.br** retornou vagas de perfil tecnológico (frontend, Python, Node.js, arquiteto de soluções) quando query é genérica; URL semântica composta (dois termos como "engenheiro-senior-java") tende a retornar 0-1 link. Melhor usar query de um termo.
- **InfoJobs** tem vagas tech (ex: Engenheiro Software Backend Sênior Python/Django confirmado com descrição completa e stack detalhada), mas listagem paginada é carregada via JavaScript — apenas 5 vagas visíveis no HTML inicial via WebFetch.
- **Gupy** é o ATS mais usado por empresas brasileiras de médio/grande porte (Itaú, Magazine Luiza, etc.), mas o portal de busca carrega vagas 100% via JavaScript com fetch autenticado. Sem autenticação/Playwright, a busca retorna HTML sem listagem.

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

## Portais com Sessão Autenticada Recomendada

### LinkedIn

**Motivo:** Sem autenticação, a busca via Googlebot UA retorna listagem da SERP pública (22-25 vagas), mas vagas individuais ficam incompletas — sem dados de email de contato, sem informações de candidatura, sem vagas "promoted" que só aparecem para usuários logados. Com sessão autenticada: cobertura consideravelmente maior, acesso a vagas que não aparecem na SERP pública, e snippets com stack mais detalhada.

**Como salvar sessão:**
```bash
# Instalar Playwright se não tiver:
npx playwright install chromium

# Abrir browser com salvamento de sessão:
npx playwright open --save-storage=$DATA_PATH/sessions/linkedin-session.json https://www.linkedin.com/login

# Fazer login manualmente no browser que abrir
# Fechar o browser quando o login for concluído
# A sessão será salva automaticamente no path especificado
```

**Validade estimada:** 7-30 dias (LinkedIn expira sessões por inatividade)
**Arquivo esperado:** `$DATA_PATH/sessions/linkedin-session.json`
**Fallback:** Se sessão ausente ou expirada, usar User-Agent Googlebot para busca — funcional mas cobertura parcial.

**AVISO DE SEGURANÇA:** O arquivo `linkedin-session.json` contém credenciais de sessão. Nunca logar o conteúdo deste arquivo, nunca incluir no output exibido ao gestor, nunca versionar no repositório git. O diretório `$DATA_PATH/sessions/` deve estar no `.gitignore` do repositório de dados.

### Gupy (portal.gupy.io)

**Motivo:** O portal de busca da Gupy carrega a listagem de vagas 100% via JavaScript com fetch autenticado (JWT). Sem autenticação/Playwright, a busca retorna HTML sem listagem de vagas. Com sessão autenticada via Playwright, é possível obter a lista completa de vagas — que é substancial para empresas BR de médio/grande porte.

**Como salvar sessão:**
```bash
# Instalar Playwright se não tiver:
npx playwright install chromium

# Abrir browser com salvamento de sessão:
npx playwright open --save-storage=$DATA_PATH/sessions/gupy-session.json https://portal.gupy.io/auth/sign-in

# Fazer login manualmente no browser que abrir (email + senha)
# Fechar o browser quando o login for concluído
# A sessão será salva automaticamente no path especificado
```

**Validade estimada:** 7-14 dias
**Arquivo esperado:** `$DATA_PATH/sessions/gupy-session.json`
**Fallback:** Sem sessão, a Gupy fica indisponível para busca — registrar como `"unavailable"` na execução e prosseguir com LinkedIn + vagas.com.br.

**AVISO DE SEGURANÇA:** Mesmas regras do LinkedIn — não logar, não versionar, não exibir conteúdo do arquivo de sessão.

---

## Portais Descartados

| Portal | Motivo do descarte |
|--------|-------------------|
| Glassdoor BR (`glassdoor.com.br`) | 403 consistente em 100% das tentativas: Chrome UA, Googlebot UA, qualquer URL (home, listagem, busca). Sem possibilidade de WebFetch viável. Útil apenas para pesquisa manual de faixas salariais via navegador — fora do escopo da skill automatizada. |
| Catho (`catho.com.br`) | Domínio retorna 404 em qualquer URL, incluindo a home. Status: fora do ar em abril/2026 (domínio registrado mas sem servidor respondendo corretamente). |
| Remotar (`remotar.com.br`) | Especializado em vagas 100% remotas. Não possui vagas presenciais ou híbridas em São Paulo. Fora do escopo da pesquisa de mercado que tem SP como localidade base. |

---

## Limites Conhecidos

- **LinkedIn sem autenticação:** Cobertura parcial via Googlebot UA — a SERP pública retorna 22-25 vagas por busca, sem vagas "promoted" e sem email de contato. User-Agent Chrome padrão causa redirect para login (HTTP 200 mas HTML vazio sem JS). Usar sempre Googlebot UA para acesso anônimo.
- **vagas.com.br — listagem:** A página de busca usa Cloudflare CDN e retorna apenas os links visíveis no HTML inicial (~9 links). A lista completa de vagas é carregada via JS (fetch pós-render). Para lista completa, usar Playwright. Para WebFetch simples, usar os links disponíveis no HTML e fazer WebFetch nas vagas individuais (que funcionam perfeitamente via HTML estático).
- **InfoJobs — listagem:** Apenas 5 vagas ficam visíveis via `data-href` no HTML inicial. A lista completa é carregada via JavaScript. Vagas individuais são plenamente acessíveis e têm conteúdo rico (responsabilidades, stack, benefícios). Estratégia recomendada: usar os links data-href disponíveis e fazer WebFetch das vagas individuais.
- **Gupy — dependência de JS:** Sem autenticação/Playwright, é impossível obter lista de vagas. Com sessão salva, a skill deve usar Playwright para navegar e extrair vagas. Sem sessão, registrar como `"unavailable"` e prosseguir.
- **Glassdoor — salários:** A fonte mais confiável de faixas salariais no mercado BR estava completamente bloqueada (403). Dados salariais precisarão ser obtidos via pesquisa manual ou fontes alternativas (Robert Half Salary Guide, pesquisas do LinkedIn — via sessão autenticada).
- **Catho — fora do ar:** Portal que era referência antes de 2024 agora retorna 404. Não disponível para uso.
- **Engines de busca (Google, Bing, DuckDuckGo):** Não foi possível usar buscas tipo `site:gupy.io` via WebFetch — todas retornam HTML vazio ou sem resultados (mecanismos de busca bloqueiam scrapers sem JS). A alternativa é acessar os portais diretamente.

---

## Notas para o Executor do 05-03

- **Portais aprovados** devem aparecer no Step 2 da skill como lista hardcoded baseada neste documento: LinkedIn, vagas.com.br, InfoJobs, Gupy (com fallback para anônimo quando sessão ausente).
- **Sessão autenticada é opcional e detectada automaticamente** — não bloquear execução se ausente. Fallback para anônimo (Googlebot UA para LinkedIn, Chrome UA para vagas.com.br/InfoJobs).
- **Gupy sem sessão** = portal indisponível para busca = registrar `{portal: "gupy", status: "unavailable"}` e prosseguir. Não tentar workaround de JS — documentar limite.
- **User-Agents recomendados por portal:**
  - LinkedIn: `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` (sem autenticação)
  - vagas.com.br: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
  - InfoJobs: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
  - Gupy (com sessão): usar Playwright (User-Agent do Chromium gerenciado pelo Playwright)
- **Extraindo vagas do vagas.com.br:** URL semântica de dois termos (ex: `vagas-de-engenheiro-senior-java`) retorna 0-1 link. URL de termo único (ex: `vagas-de-desenvolvedor-senior`) retorna ~9 links. Preferir query de termo único ou dois termos máximo.
- **Extraindo vagas do LinkedIn:** A SERP via Googlebot retorna vagas em `<h3 class="base-search-card__title">` — usar esse seletor para extrair títulos e empresas.
- **Arquivos de sessão:** Registrar no campo `sessions[]` do `-vagas.json` qual portal usou autenticação e qual foi anônimo, mas **nunca** incluir o conteúdo do arquivo de sessão no output.
