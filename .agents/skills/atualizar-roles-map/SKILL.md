---
name: atualizar-roles-map
description: |
  Pesquisa fontes públicas de salário BR (Robert Half Guia Salarial TI, Glassdoor BR,
  Catho Pesquisa Salarial, Revelo Salary Report) e adiciona ou atualiza entradas em
  data/research/roles-map.json. Use quando precisar mapear um cargo novo (ex: "Analista
  de Dados Sênior") ou atualizar faixas salariais de cargos existentes com dados do
  ano corrente.
command: /atualizar-roles-map
---

# SKILL: Atualizar Roles Map

Pesquisa de mercado focada em títulos de cargo e faixas salariais BR. Consulta guias
salariais públicos de múltiplas fontes, consolida os dados no schema D-24 e atualiza
`data/research/roles-map.json` — arquivo de referência persistente usado pelo
`/pesquisar-mercado` para ancorar `profileHints.salaryRange` e `suggestedTitle`.

## Pre-Conditions

- DATA_PATH environment variable set e apontando para o repositório de dados
- Acesso a WebSearch e WebFetch
- `data/research/roles-map.json` pode ou não existir (a skill cria se não existir)

## Execution Flow

### Step 1: Coletar Escopo

Perguntar ao gestor:

```
O que você quer atualizar no roles-map?

1. Adicionar cargos novos
   (ex: "Analista de Dados Sênior, Cientista de Dados")

2. Atualizar faixas salariais de cargos existentes
   (ex: "atualizar tudo com dados 2027")

3. Ambos

Escolha (1, 2 ou 3) e liste os cargos se aplicável:
```

**Se opção 1 ou 3 — cargos novos:**
- Perguntar: "Liste os cargos a adicionar (um por linha ou separados por vírgula):"
- Para cada cargo informado, gerar um `canonicalTitle` em PT-BR e o alias principal em EN
- Exemplos de canonicalTitle: "Analista de Dados Sênior", "Cientista de Dados", "Engenheiro de Segurança"

**Se opção 2 — atualizar existentes:**
- Carregar roles-map.json e listar cargos disponíveis
- Perguntar: "Atualizar todos ou apenas alguns? (todos / números)"

**Confirmação antes de pesquisar:**
```
Escopo definido:
  Ação: {adicionar / atualizar / ambos}
  Cargos: {lista}
  Fontes a consultar: Robert Half TI {ano}, Glassdoor BR, Catho, Revelo

Iniciar pesquisa? (S/N)
```

### Step 2: Carregar Roles-Map Existente

```bash
node -e "
const fs = require('fs');
const path = require('path');
const filePath = path.join(process.env.DATA_PATH || './data', 'research', 'roles-map.json');
if (fs.existsSync(filePath)) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('cargos existentes:', d.roles.length);
  d.roles.forEach(r => console.log(' -', r.canonicalTitle, '(' + r.seniority + ')'));
} else {
  console.log('roles-map.json nao existe — sera criado');
}
"
```

Registrar os `canonicalTitle` existentes em memória para evitar duplicação.

### Step 3: Pesquisar Cada Cargo

Para cada cargo do escopo, consultar as 4 fontes na sequência abaixo.

**Fontes e queries (repetir o padrão que funcionou — pesquisa de 05-02):**

**Fonte 1 — Robert Half Guia Salarial TI (alta confiabilidade, faixas por nível):**
```
WebSearch: "robert half guia salarial {ano} TI {canonicalTitle}"
WebSearch: "robert half salary guide {ano} {aliasEN} brazil"
```
Extrair: faixa min/max para SP, nível de senioridade, notas de mercado.

**Fonte 2 — Glassdoor BR (mediana e tendências):**
```
WebSearch: "glassdoor salario {canonicalTitle} são paulo {ano}"
WebSearch: "glassdoor {aliasEN} salary brazil {ano}"
```
Extrair: mediana salarial, tendência (alta/estável/baixa), demanda.

**Fonte 3 — Catho Pesquisa Salarial (mercado nacional, dados CLT):**
```
WebSearch: "catho pesquisa salarial {ano} {canonicalTitle}"
WebSearch: "catho.com.br pesquisa salarial {aliasEN}"
```
Extrair: faixa nacional vs. SP, percentual de vagas CLT.

**Fonte 4 — Revelo Salary Report (startups e scale-ups):**
```
WebSearch: "revelo salary report {ano} {aliasEN} brazil"
WebSearch: "revelo salario {canonicalTitle} brasil {ano}"
```
Extrair: faixa em empresas de produto/tech, diferencial para IA/dados.

**Consolidação por cargo:**
- Usar Robert Half como âncora primária quando disponível (maior rigor metodológico)
- Complementar com Glassdoor para mediana real de mercado
- Usar Catho/Revelo para validação cruzada e cargos emergentes
- `salaryRange`: percentil 25-75 de CLT mensal bruta, âncora SP/Sudeste
- `salaryRange: null` quando nenhuma fonte retorna dado confiável — NUNCA inventar valores
- `salarySource`: listar as fontes usadas (ex: "Robert Half TI 2026 + Glassdoor BR 2026")

**Para cada cargo, também pesquisar:**
- Aliases comuns nos portais BR (para melhorar matching em `/pesquisar-mercado`):
  ```
  WebSearch: "'{canonicalTitle}' OR '{aliasEN}' site:linkedin.com/jobs brazil"
  WebSearch: "'{canonicalTitle}' site:gupy.io"
  ```
  Extrair: variações de título encontradas nas vagas (ex: "Data Analyst Sr.", "Analista de BI Sênior")

- Tendências e notas de mercado:
  - Cargo em alta demanda? Emergente ou consolidado?
  - Substituindo algum título anterior?
  - Algum requisito técnico se tornando mandatório (ex: LLMs para Engenheiro de IA)?

### Step 4: Montar Entries no Schema D-24

Para cada cargo pesquisado, construir o objeto completo:

```json
{
  "canonicalTitle": "Analista de Dados Sênior",
  "aliases": [
    "Senior Data Analyst",
    "Data Analyst Sr.",
    "Analista de BI Sênior",
    "Senior BI Analyst"
  ],
  "seniority": "Sênior",
  "salaryRange": {
    "min": 10000,
    "max": 18000,
    "currency": "BRL",
    "location": "São Paulo"
  },
  "salarySource": "Robert Half Guia Salarial TI 2026 + Glassdoor BR 2026",
  "notes": "Cargo consolidado com alta demanda em fintechs e e-commerce. Stack moderna: dbt, Airflow, BigQuery/Snowflake, Python. Diferencial crescente: experiência com LLMs para análise de texto e geração de relatórios automatizados."
}
```

**Valores válidos para `seniority`:**
`"Júnior"` | `"Pleno"` | `"Sênior"` | `"Staff"` | `"Principal"` | `"Arquiteto"` | `"Tech Lead"`

**Regras:**
- `canonicalTitle` em PT-BR (título preferencial do mercado BR)
- `aliases[]` inclui variações PT e EN encontradas nos portais
- `salaryRange.min/max`: valores inteiros, CLT mensal bruta, âncora SP
- `salaryRange: null` quando sem dados confiáveis — não estimar
- `notes` com tendência de mercado e stack relevante (1-3 frases)

### Step 5: Exibir Diff para Aprovação

Antes de salvar, mostrar o que vai mudar:

**Para cargos NOVOS:**
```
── Novos cargos a adicionar ──────────────────────

1. Analista de Dados Sênior (Sênior)
   Faixa: R$ 10.000 – 18.000 (SP) | Fonte: Robert Half 2026 + Glassdoor BR
   Aliases: Senior Data Analyst, Data Analyst Sr., Analista de BI Sênior
   Nota: Cargo consolidado — alta demanda em fintechs...

2. Cientista de Dados (Sênior)
   Faixa: R$ 14.000 – 24.000 (SP) | Fonte: Robert Half 2026 + Revelo 2026
   Aliases: Data Scientist, Senior Data Scientist
   Nota: Fronteira com AI Engineer em dissolução...
```

**Para cargos ATUALIZADOS:**
```
── Cargos a atualizar ───────────────────────────

1. Engenheiro Sênior de Software
   ANTES: R$ 14.000 – 22.000 | Fonte: Robert Half 2025
   DEPOIS: R$ 16.000 – 25.000 | Fonte: Robert Half 2026 + Glassdoor BR 2026
   Nota atualizada: Demanda por LLMs agora explícita em 60%+ das vagas Sênior...
```

Perguntar:
```
Confirmar gravação? (S para salvar / N para cancelar / número para ajustar item)
```

Se gestor digitar um número: pedir o ajuste específico para aquele item e regenerar antes de exibir novamente.

### Step 6: Salvar roles-map.json

Gravar via `node -e` (NÃO heredoc — evita problemas com aspas e newlines no JSON):

```bash
node -e "
const fs = require('fs');
const path = require('path');
const dataPath = process.env.DATA_PATH || './data';
const filePath = path.join(dataPath, 'research', 'roles-map.json');

// Validar path traversal
if (!path.resolve(filePath).startsWith(path.resolve(dataPath))) {
  console.error('Path traversal detectado — abortando');
  process.exit(1);
}

// Criar diretório se não existir
fs.mkdirSync(path.join(dataPath, 'research'), { recursive: true });

// Carregar existente ou criar novo
let rolesMap;
if (fs.existsSync(filePath)) {
  rolesMap = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} else {
  rolesMap = {
    updatedAt: new Date().toISOString(),
    source: '',
    methodology: 'Dados coletados de publicações públicas de guias salariais e relatórios de mercado. Faixas representam percentil 25-75 de remuneração CLT mensal bruta para profissionais com experiência correspondente ao nível em empresas de médio/grande porte no Sudeste. Valores em BRL.',
    roles: []
  };
}

// Atualizar timestamp e source
rolesMap.updatedAt = new Date().toISOString();
rolesMap.source = 'Pesquisa manual consolidada de: Robert Half Guia Salarial TI {ano}, Glassdoor BR, Catho Pesquisa Salarial, Revelo Salary Report. Âncora geográfica: São Paulo / Sudeste.';

// Aplicar mudanças: adicionar novos, atualizar existentes
const newRoles = {/* array com as entries aprovadas */};
newRoles.forEach(newRole => {
  const idx = rolesMap.roles.findIndex(r => r.canonicalTitle === newRole.canonicalTitle);
  if (idx >= 0) {
    rolesMap.roles[idx] = newRole; // atualizar
  } else {
    rolesMap.roles.push(newRole);  // adicionar
  }
});

fs.writeFileSync(filePath, JSON.stringify(rolesMap, null, 2));
console.log('roles-map.json atualizado:', rolesMap.roles.length, 'cargos');
"
```

Exibir confirmação:
```
roles-map.json atualizado com sucesso!
Arquivo: {DATA_PATH}/research/roles-map.json
Total de cargos: {N}
Adicionados: {M} | Atualizados: {P}
```

## Notes for Agent

- **Fonte primária é Robert Half:** maior rigor metodológico e cobertura de TI BR. Priorizar sobre Glassdoor e Catho quando houver conflito. Revelo complementa para cargos em startups/scale-ups.
- **Ano corrente nas queries:** sempre usar o ano atual nas queries de WebSearch para evitar dados desatualizados. Ex: "robert half guia salarial 2026" (não genérico).
- **salaryRange: null quando sem dados:** NUNCA estimar ou interpolar faixas. Se as fontes não retornarem dado confiável para um cargo, gravar `null` e documentar em `notes` qual fonte não cobriu o cargo.
- **Âncora geográfica: SP/Sudeste:** as faixas são CLT mensal bruta para São Paulo. Se encontrar dado nacional, registrar em `notes` a diferença regional (ex: "SP ~15% acima da média nacional").
- **Aliases dos portais BR:** pesquisar ativamente nos portais (LinkedIn, Gupy) as variações de título para enriquecer `aliases[]`. Aliases ricos melhoram o matching em `/pesquisar-mercado`.
- **Canonicalização PT-BR:** o `canonicalTitle` usa o nome preferencial do mercado BR (ex: "Analista de Dados Sênior", não "Senior Data Analyst"). Os aliases cobrem as variações EN.
- **Sem duplicação:** Step 2 carrega os títulos existentes. Antes de adicionar, verificar se o título já existe em `roles` pelo `canonicalTitle` (case-insensitive). Se existir, é uma atualização, não inserção.
- **node -e para salvar:** nunca usar heredoc para JSON. O `node -e` lida corretamente com aspas, acentos e newlines no conteúdo das strings.
- **O arquivo fica no data repo:** `data/research/roles-map.json` está no repositório de dados separado (`hiring-pipeline-data`). Após salvar, lembrar o gestor de commitar no data repo se necessário.

## Troubleshooting

**"Fontes retornam dados divergentes"**
→ Priorizar Robert Half como âncora. Usar Glassdoor para mediana spot-check. Se divergência > 30%, registrar ambas as faixas em `notes` e usar a média aritmética como `salaryRange`.

**"Cargo muito novo — sem dados públicos"**
→ Gravar `salaryRange: null`. Em `notes`, registrar "dados salariais públicos ainda escassos para este cargo em {ano}" e indicar fontes consultadas. O campo será preenchido em atualização futura.

**"Cargo emergente sem nome consolidado em PT-BR"**
→ Usar o nome EN como `canonicalTitle` temporariamente (ex: "AI Engineer") e registrar em `notes` que não há nome PT-BR consolidado ainda. Ex: Staff Engineer, Platform Engineer.

**"WebSearch retorna dados de anos anteriores"**
→ Adicionar o ano atual na query (ex: "site:roberthalf.com.br 2026"). Se mesmo assim só houver dados antigos, registrar o ano dos dados em `salarySource` (ex: "Robert Half TI 2025 — dado mais recente disponível").

## Related Skills

- `/pesquisar-mercado` — usa roles-map como âncora de `salaryRange` no profileHints
- `/refinar-perfil` — usa roles-map indiretamente via profileHints do resumo de pesquisa

---

**Skill created:** 2026-04-22
**Status:** Ready for Claude Code integration
