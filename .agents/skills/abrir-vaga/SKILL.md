---
name: abrir-vaga
description: |
  Coleta dados de uma nova vaga em linguagem natural via conversa com o gestor.
  Salva um arquivo JSON de vaga em DATA_PATH/vacancies/ pronto para visualização
  e geração de Excel na web app. Use este comando quando o gestor preferir descrever
  a vaga em prosa em vez de preencher o formulário web.
command: /abrir-vaga
---

# SKILL: Abrir Vaga

Conversational vacancy opening via natural language. Manager describes vacancy needs;
agent collects structured data and persists JSON.

## Pre-Conditions

- DATA_PATH disponível no ambiente ou em `.env.local` na raiz do projeto (carregado automaticamente no Step 0)
- At least one job profile exists in DATA_PATH/profiles/*.json
- Node.js available to run scripts for listing profiles and generating UUIDs

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

### Step 1: List Available Profiles

```bash
ls -la $DATA_PATH/profiles/
```

Read each profile.json file and extract the `title` field. Display list to manager:

Example output:
```
Perfis disponíveis:
1. Software Engineer (Senior)
2. Product Manager
3. UX Designer
```

Ask: **"Qual perfil você quer usar como base para esta vaga?"**

Wait for manager to select a profile number or name.

### Step 2: Load Selected Profile + Settings

Once profile selected:

```bash
cat $DATA_PATH/profiles/{profile-id}.json
cat $DATA_PATH/settings.json  # Pode não existir ainda
```

Extract from profile.json:
- `title`, `suggestedTitle` — inherit to vacancy
- `experienceLevel`, `educationLevel`, `postGraduateLevel`, etc. — already set, show as reference

Load settings.json (if exists):
- `managerName` (solicitante)
- `godfather` (padrinho)
- `immediateReport` (reporte imediato)
- `mediateReport` (reporte mediato)
- These will auto-populate in the generated Excel.

### Step 3: Collect Vacancy-Specific Data (Group 2)

Per the vacancy schema, collect:

**Tipo e Quantidade:**
```
Tipo de requisição:
  1. Recrutamento interno
  2. Recrutamento externo
Escolha (1 ou 2): ?
```

**Quantidade de vagas:** "Quantas vagas abre?"

**Dados Financeiros:**
```
Faixa salarial (ex: R$ 8k - 12k): ?
```

**Flags Booleanas:**
```
Vaga confidencial? (Sim/Não)
Vaga orçada? (Sim/Não)
Aumento de quadro? (Sim/Não)
  Se Não: Nome da pessoa substituída: ?
```

**Data de Contratação:**
```
Data prevista de contratação (YYYY-MM-DD): ?
```

### Step 4: Pre-Fill with Settings (Group 3)

Display pre-filled values from settings.json (if exists):
```
Gestor/solicitante (via settings): [managerName]
Padrinho (via settings): [godfather]
Reporte imediato (via settings): [immediateReport]
Reporte mediato (via settings): [mediateReport]
Composição da equipe (via settings): [teamComposition]
Centro de custo (via settings): [costCenter]
Horário de trabalho (via settings): [workSchedule]
Modalidade (via settings): [workMode]
Viagens necessárias (via settings): [travelRequired]

Estes dados foram preenchidos automaticamente a partir das configurações da área.
Quer alterar algum? (Sim/Não)
```

If Sim, allow editing. If Não, prosseguir.

### Step 5: Generate Vacancy JSON

Generate a UUID for the new vacancy:

```bash
node -e "console.log(require('crypto').randomUUID())"
```

Create the vacancy file with the generated UUID:

```bash
cat > $DATA_PATH/vacancies/{uuid}.json << 'EOF'
{
  "id": "{uuid}",
  "profileId": "{selected-profile-id}",
  "status": "Aberta",
  "requestType": "{requestType}",
  "quantity": {quantity},
  "salaryRange": "{salaryRange}",
  "confidential": {confidential},
  "budgeted": {budgeted},
  "headcountIncrease": {headcountIncrease},
  "replacedPerson": "{replacedPerson or null}",
  "expectedHireDate": "{expectedHireDate}",
  "openedAt": "{ISO8601-now}",
  "closedAt": null
}
EOF
```

Get current timestamp via:
```bash
node -e "console.log(new Date().toISOString())"
```

### Step 6: Confirm and Finish

Display:
```
Vaga criada com sucesso!
ID: {uuid}
Perfil: {profile-title}
Tipo: {requestType}
Quantidade: {quantity}

Próximas ações:
1. Abra http://localhost:3000/hiring-pipeline/vacancies/{uuid}/edit na web
2. Clique em "Gerar formulário GH"
3. Envie o Excel para o GH/Werecruiter

Vaga salva em: $DATA_PATH/vacancies/{uuid}.json
```

## Notes for Agent

- **No web integration:** This skill runs entirely via CLI. The manager then opens the web app to see the vacancy and generate Excel.
- **Conversational tone:** Collect data in natural language, not a rigid checklist. Be friendly and offer guidance ("ex: " examples).
- **Settings auto-populate:** The first 4 settings fields (gestor, padrinho, reporte) come from settings.json and should be shown to the manager for confirmation, not re-entered.
- **D-01 context:** VAG-02 is an external skill (not web app integration). The web app displays the saved vacancy and generates Excel from it.
- **D-02 context:** Skill collects data in natural language, saves JSON to DATA_PATH/vacancies/, then exits. The web app reads the JSON on first access.
- **Error handling:** If profile not found or JSON write fails, explain the issue clearly and suggest next steps (e.g., "Crie o perfil primeiro na web app").
- **Dates:** Always ask for dates in YYYY-MM-DD format (ISO 8601). Current date = `node -e "console.log(new Date().toISOString().split('T')[0])"`
- **Campos de AreaSettings:** costCenter, workSchedule, workMode, travelRequired vêm de settings.json (migrados na Phase 3 — GAP-12). Não coletar do gestor — pré-carregar de settings no Step 4. Não incluir no JSON da vaga (Step 5).

## Troubleshooting

**"Perfil não encontrado"**
→ Ensure DATA_PATH/profiles/ has at least one valid .json file.

**"Não consigo criar arquivo em DATA_PATH/vacancies"**
→ Ensure $DATA_PATH is set: `echo $DATA_PATH`. If empty, set it:
```bash
export DATA_PATH=/path/to/data-repo
```

**"Manager quer mudar dados depois"**
→ Direct to web app: "Abra a vaga em /vacancies/[id]/edit na web app para editar."

## Related Skills

- `/abrir-vaga` — este arquivo (conversational vacancy opening)
- `fechar-versao` — reference for skill structure and error handling

---

**Skill created:** 2026-04-20
**Updated:** 2026-04-21 (Phase 4 — D-18: auditoria contra schemas pós-GAP-12)
**Status:** Ready for Claude Code integration
