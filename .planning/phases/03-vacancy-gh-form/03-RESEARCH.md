# Phase 3: Vacancy Opening & GH Form Generation - Research

**Researched:** 2026-04-20
**Domain:** Vacancy management, Excel template generation, JSON persistence, Next.js route handlers, external CLI skills
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** VAG-02 é skill externa do Claude Code — sem chat na web app. A skill coleta dados, grava JSON, encerra.
- **D-02:** Skill faz apenas coleta + gravação de JSON. Geração do Excel é responsabilidade da web app (botão na tela).
- **D-03:** ~20 campos do formulário GH classificados em 3 grupos: (1) dados do perfil, (2) dados específicos da vaga, (3) dados comuns da área.
- **D-04:** Batimento 1-a-1 dos campos é tarefa explícita do planejador (lendo `excel-form-fields.md`).
- **D-05:** Página de configurações para dados comuns, salvo em `DATA_PATH/settings.json` (ou equivalente).
- **D-06:** Candidatos a dados comuns: gestor, padrinho, reporte imediato/mediato, composição da equipe, textos fixos da área.
- **D-07:** Geração do Excel por cópia do template em `DATA_PATH/templates/` e preenchimento das células mapeadas.
- **D-08:** Excels gerados em `DATA_PATH/forms/`, nome `{vacancy-id}-requisicao.xlsx`. Usa `ensureSubdir`.
- **D-09:** Regeneração sobrescreve o arquivo existente.
- **D-10:** Download via GET `/api/vacancies/[id]/form`. Botão "Gerar formulário GH" e botão "Regenerar".
- **D-11:** Biblioteca Excel avaliada pelo pesquisador (xlsx vs. exceljs) — ver seção crítica abaixo.
- **D-12:** Ciclo de vida: 3 estados `Aberta` → `Em andamento` → `Encerrada`, avanço manual.
- **D-13:** Datas: `data_abertura` (automática), `data_prevista_contratacao` (campo GH), `data_encerramento` (ao encerrar).
- **D-14:** Rota `/vagas` com item "Vagas" habilitado no left rail.
- **D-15:** Lista exibe: cargo, perfil de origem, quantidade, status (badge), data de abertura. Ordem: mais recente primeiro.
- **D-16:** Sem busca/filtro por ora.

### Claude's Discretion

- Nome exato do item de menu de configurações ("Configurações" vs. "Dados da Área" vs. outro).
- Estrutura de arquivos em `src/` para os componentes de vaga e configurações.
- Formato do ID da vaga — seguir UUID v4 do Phase 2.
- Biblioteca Excel específica (xlsx vs. exceljs) — pesquisador avalia e recomenda.

### Deferred Ideas (OUT OF SCOPE)

- Busca/filtro de vagas por status, cargo ou data.
- Tela de detalhes read-only da vaga.
- Histórico de versões do formulário GH por vaga.
- Notificação ou integração por email com a Werecruiter.
- Dashboard na home com vagas abertas.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VAG-01 | Gestor pode abrir vaga selecionando perfil existente e complementando com dados específicos | Schema Vacancy, VacancyRepository, form /vagas/new, server action createVacancy |
| VAG-02 | Gestor pode fornecer dados complementares via linguagem natural (skill externa) | Skill design: lê perfis + settings, coleta dados, grava JSON em DATA_PATH/vacancies/ |
| VAG-03 | Sistema gera formulário GH preenchido em .xlsx | Abordagem cirúrgica via zipfile Python ou Node; route handler GET /api/vacancies/[id]/form |
| VAG-04 | Gestor pode listar e acompanhar vagas abertas com status atual | Rota /vagas, VacancyRepository.list(), badge de status, ordenação por data |
</phase_requirements>

---

## Summary

Esta fase adiciona o ciclo completo de abertura de vaga ao hiring pipeline: criação de vaga a partir de um perfil existente, preenchimento de dados específicos, configuração de dados comuns da área, geração do formulário GH em Excel e listagem com ciclo de vida.

A descoberta mais crítica desta pesquisa diz respeito à **geração do arquivo Excel**. O template `requisicao-de-pessoal.xlsx` contém 70 `ctrlProps` (controles de formulário OLE/VML legacy — checkboxes posicionados como objetos flutuantes), um arquivo VML (`vmlDrawing1.vml`), tabelas, external links, rich data e printer settings binários. Tanto ExcelJS quanto SheetJS (xlsx) **descartam VML e ctrlProps** ao ler e regravar o arquivo. openpyxl também perde shapes ao salvar. Nenhuma das abordagens de alto nível (JavaScript ou Python) preserva os controles visuais de forma confiável.

A abordagem recomendada é **cirúrgica via zipfile**: copiar o template byte a byte, abrir como ZIP em memória, modificar apenas o XML das células de dados (`xl/worksheets/sheet1.xml` e `xl/sharedStrings.xml`), e regravar o arquivo mantendo todos os outros membros do ZIP intocados (VML, ctrlProps, imagens, estilos, etc). Esta abordagem foi verificada em runtime nesta sessão: todos os 121 arquivos do template são preservados, VML incluído. O executor pode ser um módulo Node.js nativo (`adm-zip` ou `archiver`) ou um script Python invocado como processo filho — ambos viáveis.

A skill VAG-02 (coleta de dados em linguagem natural) segue o padrão da skill `fechar-versao` do projeto: um arquivo `SKILL.md` em `.agents/skills/abrir-vaga/` com instruções passo a passo para o agente Claude Code. A skill lê os perfis e settings existentes, conduz coleta conversacional, e grava o JSON da vaga em `DATA_PATH/vacancies/`.

**Recomendação primária:** Usar abordagem cirúrgica via zipfile nativo do Node.js para geração do Excel, sem bibliotecas de alto nível para xlsx. Criar skill VAG-02 como arquivo SKILL.md seguindo o padrão estabelecido no projeto.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Listagem de vagas (/vagas) | Frontend Server (SSR) | — | Leitura de arquivos JSON no servidor; dados não mudam em tempo real |
| Criar vaga (form /vagas/new) | Frontend Server (SSR) | API (Server Action) | Form em Server Component; salvar via Server Action |
| Editar vaga (/vagas/[id]/edit) | Frontend Server (SSR) | API (Server Action) | Mesmo padrão de /profiles/[id]/edit |
| Avançar ciclo de vida | API (Server Action) | — | Ação simples de atualizar campo status no JSON |
| Configurações da área (/configuracoes) | Frontend Server (SSR) | API (Server Action) | Leitura/escrita de settings.json |
| Geração do Excel (.xlsx) | API (Node.js Server) | — | Operação de filesystem (cópia + zipfile edit); deve rodar server-side |
| Download do Excel | API Route Handler | — | GET /api/vacancies/[id]/form serve arquivo binário com headers corretos |
| Skill VAG-02 (coleta NL) | External CLI (Claude Code) | — | Fora da web app por decisão D-01; executa em terminal local do gestor |
| Persistência de vagas | Database/Storage (JSON files) | — | DATA_PATH/vacancies/{id}.json — mesmo padrão de profiles/ |
| Persistência de settings | Database/Storage (JSON files) | — | DATA_PATH/settings.json — arquivo único (não coleção) |
| Persistência de forms gerados | Database/Storage (xlsx files) | — | DATA_PATH/forms/{id}-requisicao.xlsx |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | SSR + Server Actions + Route Handlers | Já instalado — padrão do projeto [VERIFIED: package.json] |
| React | 19.2.4 | UI | Já instalado [VERIFIED: package.json] |
| TypeScript | 5.9.3 | Tipagem | Já instalado [VERIFIED: package.json] |
| Tailwind | 4.2.2 | Estilo | Já instalado [VERIFIED: package.json] |
| shadcn/ui | 4.3.0 | Componentes | Já instalado [VERIFIED: package.json] |
| Zod | 4.3.6 | Validação de schema | Já instalado [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| adm-zip | 0.5.x | Leitura/escrita de ZIP in-memory (para edição cirúrgica do xlsx) | Geração do Excel no servidor |
| lucide-react | 1.8.0 | Ícone Settings para o item de menu | Já instalado — usar ícone `Settings` ou `SlidersHorizontal` [VERIFIED: package.json] |

> **Nota importante sobre geração de Excel:** Não instalar `exceljs` nem `xlsx` (SheetJS) para esta fase. Ver seção `## Decisão Crítica: Geração do Excel` abaixo.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| adm-zip (zipfile cirúrgico) | exceljs | exceljs descarta VML/ctrlProps — template corrompido visualmente |
| adm-zip (zipfile cirúrgico) | xlsx (SheetJS) | xlsx community edition foca em dados, não preserva VML [CITED: github.com/SheetJS/sheetjs/issues/2208] |
| adm-zip (zipfile cirúrgico) | openpyxl (Python) | openpyxl perde shapes/VML ao salvar [CITED: openpyxl.readthedocs.io — "shapes will be lost"] |
| adm-zip (zipfile cirúrgico) | Python script via child_process | Viável como fallback se adm-zip travar; Python 3.12 disponível no host [VERIFIED: python3 --version] |

**Installation:**

```bash
npm install adm-zip
npm install --save-dev @types/adm-zip
```

**Version verification:**

```bash
npm view adm-zip version
# Badge component: npx shadcn@latest add badge
```

---

## Decisão Crítica: Geração do Excel

> Esta seção documenta a decisão de biblioteca solicitada em D-11 e a justificativa técnica.

### Contexto do Template

O arquivo `requisicao-de-pessoal.xlsx` é complexo [VERIFIED: inspeção direta via zipfile + XML]:

- **121 arquivos internos**, incluindo:
  - `xl/drawings/vmlDrawing1.vml` (55 KB) — 70+ checkboxes como objetos VML legacy
  - `xl/ctrlProps/ctrlProp1.xml` … `ctrlProp70.xml` — propriedades de cada checkbox
  - `xl/media/image1.png` — logo da empresa
  - `xl/externalLinks/` — link externo
  - `xl/richData/` — rich data structures
  - `xl/printerSettings/printerSettings1.bin` — configuração de impressão binária
  - 6 worksheets (2 visíveis, 4 ocultas de suporte)
- Os **checkboxes são controles VML legacy** (não células Excel modernas) — posicionados com coordenadas absolutas em pontos

### Avaliação das Abordagens

#### Abordagem 1: ExcelJS 4.4.0

- Versão atual: 4.4.0 (publicada 2023-10-19) [VERIFIED: npm view exceljs]
- **Resultado:** ExcelJS descarta VML ao ler e regravar o arquivo. Issue aberta desde 2017, sem resolução confirmada [CITED: github.com/exceljs/exceljs/issues/392]. Ao salvar, o arquivo perde os checkboxes visualmente — o gestor recebe um formulário sem os controles de marcação.
- **Veredicto: DESCARTADO.** Corromperia o template.

#### Abordagem 2: SheetJS (xlsx) 0.18.5

- Versão atual: 0.18.5 [VERIFIED: npm view xlsx]
- A Community Edition foca em dados; VML/ctrlProps não são parte do modelo de dados [CITED: git.sheetjs.com/sheetjs/sheetjs/issues/2826]. A versão Pro preserva mais features, mas não está no escopo do projeto.
- **Veredicto: DESCARTADO.** Mesma limitação que ExcelJS para VML legacy.

#### Abordagem 3: Script Python com openpyxl

- Python 3.12 disponível no host [VERIFIED: python3 --version]
- openpyxl também perde shapes ao salvar: "shapes will be lost from existing files if they are opened and saved with the same name" [CITED: openpyxl.readthedocs.io/en/stable]
- **Veredicto: DESCARTADO** como abordagem de alto nível. Válido apenas como "invólucro" para a abordagem cirúrgica.

#### Abordagem 4: Zipfile Cirúrgico (RECOMENDADA)

**Princípio:** xlsx é um ZIP. A abordagem lê o template, extrai apenas o XML das worksheets, faz substituições cirúrgicas de valores em células específicas, e regrava o ZIP mantendo todos os outros membros intocados.

**Verificação em runtime nesta sessão [VERIFIED]:**

```python
# Prova de conceito executada com sucesso:
# Output has 121 files vs input 121 files  ← todos os arquivos preservados
# VML preserved: True                       ← checkboxes intactos
# ctrlProp1 preserved: True                 ← propriedades dos controles intactos
# Value written: True                       ← valor gravado na célula correta
```

**Implementação Node.js com adm-zip:**

```typescript
// Source: padrão verificado via inspeção direta do template
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export function generateVacancyForm(
  templatePath: string,
  outputPath: string,
  cellValues: Record<string, string> // ex: { "D5": "Recrutamento externo", "D7": "João Silva" }
): void {
  const zip = new AdmZip(templatePath);

  // Modificar apenas sheet1.xml (aba "Perfil Vaga")
  const entry = zip.getEntry("xl/worksheets/sheet1.xml");
  if (!entry) throw new Error("sheet1.xml não encontrado no template");

  let sheet1 = entry.getData().toString("utf-8");

  for (const [cellAddr, value] of Object.entries(cellValues)) {
    const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Substituir célula vazia existente por inline string
    // Padrão das células de input: <c r="D5" s="59"/>
    const emptyCell = new RegExp(`<c r="${cellAddr}" s="(\\d+)"/>`);
    sheet1 = sheet1.replace(
      emptyCell,
      `<c r="${cellAddr}" s="$1" t="inlineStr"><is><t>${escaped}</t></is></c>`
    );
  }

  zip.updateFile("xl/worksheets/sheet1.xml", Buffer.from(sheet1, "utf-8"));
  zip.writeZip(outputPath);
}
```

**Limitações conhecidas da abordagem cirúrgica:**
1. Os checkboxes VML são controles visuais independentes — eles não têm link de célula (`FmlaLink`) no template atual. Portanto, não é possível marcar/desmarcar checkboxes programaticamente via XML. O gestor marca manualmente após download se necessário. Os campos de texto são totalmente automatizáveis.
2. Para campos com seleção (Tipo de requisição, Modalidade, etc.), o texto é gravado na célula adjacente ao label. O checklist visual permanece cosmético no template.

**Estratégia para checkboxes:** Gravar o texto da opção selecionada na célula de valor correspondente. Os checkboxes visuais do template permanecem como decoração — o gestor ajusta manualmente se necessário para a reunião de alinhamento. Isso é aceitável dado que o formulário é enviado por email (não processado por sistema).

---

## Mapeamento 1-a-1: Campos GH → 3 Grupos → Células do Template

> Esta é a proposta do pesquisador para os 3 grupos. O planejador deve confirmar no PLAN.md antes de implementar.

### Grupo 1: Dados do Perfil (herdados de `JobProfile`)

| Campo GH (excel-form-fields.md) | JobProfile field | Células aprox. (sheet1) |
|----------------------------------|-----------------|-------------------------|
| Cargo (título interno) | `title` | D6 (linha do label "Cargo:") |
| Cargo sugerido para anúncio | `suggestedTitle` | linha label "Cargo sugerido para anúncio:" |
| Tempo de experiência | `experienceLevel` | linha label "Tempo de experiência:" |
| Nível de escolaridade | `educationLevel` | linha label "Nível de escolaridade:" |
| Curso (escolaridade) | `educationCourse` | campo "Curso:" adjacente |
| Pós-graduação | `postGraduateLevel` | linha label "Pós-graduação:" |
| Certificações | `certifications` | linha label "Certificações:" |
| Inglês | `englishLevel` | linha label "Inglês" |
| Espanhol | `spanishLevel` | linha label "Espanhol" |
| Responsabilidades e atribuições | `responsibilities` | rows 43-46 |
| Requisitos e qualificações | `qualifications` | rows 47-49 |
| Competências comportamentais | `behaviors` | rows 50-53 |
| Principais desafios | `challenges` | rows 54-57 |
| Informações complementares | `additionalInfo` | row 58 |
| Sistemas necessários | `systemsRequired` | rows 61-66 (como texto) |
| Pastas de rede | `networkFolders` | row 68 |

### Grupo 2: Dados Específicos da Vaga (campo por vaga)

| Campo GH | Vacancy field sugerido | Tipo |
|----------|----------------------|------|
| Tipo de requisição | `requestType` | `"Recrutamento interno" \| "Recrutamento externo"` |
| Quantidade de vagas | `quantity` | `number` |
| Data da requisição | `requestDate` | ISO 8601 (= createdAt) |
| Vaga solicitada por | via settings.managerName | herdado de settings |
| Nome do padrinho | via settings.godfather | herdado de settings |
| Centro de custo | `costCenter` | `string` |
| Faixa salarial | `salaryRange` | `string` |
| Vaga confidencial | `confidential` | `boolean` |
| Vaga orçada | `budgeted` | `boolean` |
| Aumento de quadro | `headcountIncrease` | `boolean` |
| Nome do substituído | `replacedPerson?` | `string \| undefined` |
| Horário de trabalho | `workSchedule` | `"Das 08h às 17h" \| "Das 09h às 18h" \| "Outro"` |
| Disponibilidade para viagens | `travelRequired` | `boolean` |
| Reporte imediato | via settings.immediateReport | herdado de settings |
| Reporte mediato | via settings.mediateReport | herdado de settings |
| Modalidade de trabalho | `workMode` | `"Presencial" \| "Remoto" \| "Híbrido"` |
| Data prevista de contratação | `expectedHireDate` | ISO 8601 |
| Composição da equipe | via settings.teamComposition | herdado de settings, editável por vaga |

### Grupo 3: Dados Comuns da Área (settings.json)

| Campo | Settings field sugerido |
|-------|------------------------|
| Vaga solicitada por (nome do gestor) | `managerName` |
| Nome do padrinho | `godfather` |
| Reporte imediato | `immediateReport` |
| Reporte mediato | `mediateReport` |
| Composição da equipe (texto padrão) | `teamComposition` |

> **Nota do pesquisador:** "Vaga solicitada por", "Nome do padrinho", "Reporte imediato" e "Reporte mediato" aparecem no `excel-form-fields.md` como campos da vaga, mas são candidatos fortes a dados comuns (D-06). O planejador deve confirmar a classificação final no PLAN.md.

---

## Architecture Patterns

### System Architecture Diagram

```
Gestor (browser)
     |
     |  GET /vagas
     ├──────────────→ [ /vagas page (SSR) ] ──→ VacancyRepository.list() ──→ DATA_PATH/vacancies/*.json
     |
     |  GET /vagas/new
     ├──────────────→ [ /vagas/new page (SSR) ] ──→ ProfileRepository.list() (select perfil)
     |                          |
     |  POST (Server Action)    │
     ├──────────────────────────→ createVacancy() ──→ VacancyRepository.save() ──→ DATA_PATH/vacancies/{id}.json
     |                                                      redirect → /vagas
     |
     |  GET /vagas/[id]/edit
     ├──────────────→ [ /vagas/[id]/edit page (SSR) ] ──→ VacancyRepository.findById()
     |                          |
     |  POST (Server Action)    │
     ├──────────────────────────→ updateVacancy() ──→ VacancyRepository.save()
     |
     |  POST (Server Action: advanceStatus)
     ├──────────────────────────→ Aberta → Em andamento → Encerrada
     |
     |  GET /api/vacancies/[id]/form  ←── "Gerar formulário GH" button
     ├──────────────→ [ Route Handler ]
     |                   ├── VacancyRepository.findById(id)
     |                   ├── ProfileRepository.findById(vacancy.profileId)
     |                   ├── SettingsRepository.get()
     |                   ├── Se forms/{id}-requisicao.xlsx existe → serve arquivo
     |                   └── Senão → generateVacancyForm(template, output, cellValues)
     |                              └── AdmZip: copy + surgical XML edit → DATA_PATH/forms/
     |                              └── Response(buffer, { Content-Disposition: attachment })
     |
     |  GET /configuracoes
     ├──────────────→ [ /configuracoes page (SSR) ] ──→ SettingsRepository.get()
     |                          |
     |  POST (Server Action)    │
     └──────────────────────────→ updateSettings() ──→ SettingsRepository.save() → DATA_PATH/settings.json

Claude Code CLI (terminal do gestor)
     |
     |  /abrir-vaga (skill externa — VAG-02)
     └──→ SKILL.md ──→ lê profiles/ + settings.json
                   ──→ coleta dados em linguagem natural
                   ──→ grava DATA_PATH/vacancies/{uuid}.json
                   ──→ encerra (gestor abre web app para visualizar)
```

### Recommended Project Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── profile.ts          # existente
│   │   ├── vacancy.ts          # novo — createVacancy, updateVacancy, deleteVacancy, advanceStatus
│   │   └── settings.ts         # novo — updateSettings
│   ├── api/
│   │   └── vacancies/
│   │       └── [id]/
│   │           └── form/
│   │               └── route.ts    # GET handler — gera/serve .xlsx
│   └── (shell)/
│       ├── profiles/           # existente
│       ├── vacancies/          # novo — espelha estrutura de profiles/
│       │   ├── page.tsx        # lista /vagas
│       │   ├── new/
│       │   │   └── page.tsx    # criar vaga
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx    # editar vaga + botão download
│       └── settings/           # novo (ou /configuracoes — a critério do Claude)
│           └── page.tsx
├── components/
│   ├── profile/                # existente
│   ├── vacancy/                # novo
│   │   ├── vacancy-form.tsx    # form criar/editar vaga
│   │   └── vacancy-list.tsx    # lista de vagas
│   ├── settings/               # novo
│   │   └── settings-form.tsx
│   └── shell/
│       └── left-rail.tsx       # habilitar "Vagas" + adicionar "Configurações"
├── lib/
│   ├── repositories/
│   │   ├── profile-repository.ts   # existente
│   │   ├── vacancy-repository.ts   # novo — mesmo padrão
│   │   └── settings-repository.ts  # novo — arquivo único (get/save, sem list/delete)
│   ├── vacancy.ts              # novo — interface Vacancy, tipos union, generateVacancyId
│   ├── settings.ts             # novo — interface AreaSettings
│   └── excel-generator.ts      # novo — generateVacancyForm() via adm-zip
└── __tests__/
    ├── vacancy.test.ts         # tipos union e generateVacancyId
    ├── settings.test.ts        # AreaSettings schema
    └── excel-generator.test.ts # geração cirúrgica do xlsx
```

### Pattern 1: Repository JSON — Vacancy

Mesmo padrão de `profile-repository.ts` [VERIFIED: leitura do código]:

```typescript
// src/lib/repositories/vacancy-repository.ts
import fs from "fs";
import path from "path";
import { ensureSubdir } from "@/lib/data-service";
import type { Vacancy } from "@/lib/vacancy";

export interface VacancyRepository {
  list(): Promise<Vacancy[]>;
  findById(id: string): Promise<Vacancy | null>;
  save(vacancy: Vacancy): Promise<void>;
  delete(id: string): Promise<void>;
}

export class JsonVacancyRepository implements VacancyRepository {
  private vacancyPath(id: string): string {
    if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
      throw new Error(`ID de vaga inválido: "${id}"`);
    }
    const dir = ensureSubdir("vacancies");
    return path.join(dir, `${id}.json`);
  }
  // ... list, findById, save, delete — idênticos ao ProfileRepository
}

export const vacancyRepository: VacancyRepository = new JsonVacancyRepository();
```

### Pattern 2: Settings Repository (arquivo único)

```typescript
// src/lib/repositories/settings-repository.ts
import fs from "fs";
import path from "path";
import { env } from "@/lib/env";
import type { AreaSettings } from "@/lib/settings";

const SETTINGS_FILE = "settings.json";

export interface SettingsRepository {
  get(): Promise<AreaSettings>;
  save(settings: AreaSettings): Promise<void>;
}

export class JsonSettingsRepository implements SettingsRepository {
  private get settingsPath(): string {
    return path.join(env.DATA_PATH, SETTINGS_FILE);
  }

  async get(): Promise<AreaSettings> {
    if (!fs.existsSync(this.settingsPath)) return defaultSettings();
    return JSON.parse(fs.readFileSync(this.settingsPath, "utf-8")) as AreaSettings;
  }

  async save(settings: AreaSettings): Promise<void> {
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), "utf-8");
  }
}

export const settingsRepository: SettingsRepository = new JsonSettingsRepository();
```

### Pattern 3: Route Handler para Download de Arquivo Binário

```typescript
// src/app/api/vacancies/[id]/form/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { ensureSubdir } from "@/lib/data-service";
import { env } from "@/lib/env";
import { vacancyRepository } from "@/lib/repositories/vacancy-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { generateVacancyForm } from "@/lib/excel-generator";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const vacancy = await vacancyRepository.findById(id);
  if (!vacancy) return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });

  const formsDir = ensureSubdir("forms");
  const outputPath = path.join(formsDir, `${id}-requisicao.xlsx`);
  const templatePath = path.join(env.DATA_PATH, "templates", "requisicao-de-pessoal.xlsx");

  // Regenerar se não existe ou se ?regen=1
  const url = new URL(_req.url);
  const forceRegen = url.searchParams.get("regen") === "1";

  if (!fs.existsSync(outputPath) || forceRegen) {
    const profile = await profileRepository.findById(vacancy.profileId);
    const settings = await settingsRepository.get();
    generateVacancyForm(templatePath, outputPath, vacancy, profile, settings);
  }

  const buffer = fs.readFileSync(outputPath);
  const filename = `requisicao-${vacancy.id}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
```

### Pattern 4: Schema Vacancy

```typescript
// src/lib/vacancy.ts
export type VacancyStatus = "Aberta" | "Em andamento" | "Encerrada";
export type RequestType = "Recrutamento interno" | "Recrutamento externo";
export type WorkSchedule = "Das 08h às 17h" | "Das 09h às 18h" | "Outro";
export type WorkMode = "Presencial" | "Remoto" | "Híbrido";

export interface Vacancy {
  id: string;
  profileId: string;          // FK para JobProfile
  status: VacancyStatus;
  // Dados específicos da vaga
  requestType: RequestType;
  quantity: number;
  costCenter: string;
  salaryRange: string;
  confidential: boolean;
  budgeted: boolean;
  headcountIncrease: boolean;
  replacedPerson?: string;    // quando headcountIncrease === false
  workSchedule: WorkSchedule;
  travelRequired: boolean;
  workMode: WorkMode;
  expectedHireDate: string;   // ISO 8601
  // Datas do ciclo de vida
  openedAt: string;           // ISO 8601 — automático na criação
  closedAt?: string;          // ISO 8601 — preenchido ao encerrar
}
```

### Pattern 5: Skill VAG-02 (SKILL.md)

Seguindo o padrão da skill `fechar-versao` [VERIFIED: leitura de `.agents/skills/fechar-versao/SKILL.md`]:

```
.agents/skills/abrir-vaga/
└── SKILL.md
```

Conteúdo mínimo do SKILL.md:

```markdown
---
name: abrir-vaga
description: Coleta dados de uma nova vaga em linguagem natural e grava o JSON em DATA_PATH/vacancies/. Use quando o gestor quiser abrir uma vaga conversacionalmente sem preencher o formulário web.
command: /abrir-vaga
---

# SKILL: Abrir Vaga

## Pré-condições
- DATA_PATH definido e apontando para o repositório de dados
- Pelo menos um perfil existente em DATA_PATH/profiles/

## Passo 1: Listar perfis disponíveis
...
## Passo 2: Coletar dados específicos da vaga
...
## Passo 3: Pré-preencher com settings.json (dados comuns)
...
## Passo 4: Confirmar e gravar JSON
...
```

### Anti-Patterns to Avoid

- **Usar exceljs ou xlsx para ler+regravar o template:** Descartam VML e ctrlProps — os checkboxes visuais desaparecem. Usar apenas a abordagem cirúrgica zipfile.
- **Criar rota `/vacancies` em vez de `/vagas`:** O left-rail aponta para `/vacancies` (href existente em `left-rail.tsx`). Verificar e padronizar para `/vacancies` — a UI usa em inglês, consistente com `/profiles`. [VERIFIED: leitura de left-rail.tsx — href="/vacancies"]
- **Tentar marcar checkboxes VML programaticamente:** Os controles não têm `FmlaLink` no template. Gravar o texto da opção na célula adjacente é suficiente para o receptor humano.
- **Criar Settings como coleção JSON:** Settings é um arquivo único `settings.json`, não uma coleção `settings/*.json`. O repositório expõe `get()` e `save()`, sem `list()` ou `delete()`.
- **Auto-save em formulários:** Padrão estabelecido na Phase 2 é salvar explícito com botão "Salvar".
- **Borders explícitas:** No-Line Rule — usar tonalidade de superfície para delimitar seções (DESIGN.md).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Leitura/escrita de ZIP | Parser ZIP manual | `adm-zip` | Lida com compressão, encoding, entradas binárias |
| Escaping XML em valores de células | Regex manual ad hoc | Função `escapeXml()` simples (5 linhas: `& < > ' "`) | Risco de XSS/malformação do XML do xlsx se valores contiverem `<` ou `&` |
| Download de arquivo no browser | Link `<a>` com data URL | Route Handler com `Content-Disposition: attachment` | Data URLs não funcionam para binários grandes; route handler é o padrão Next.js |
| ID de vaga | Contador sequencial ou timestamp | `crypto.randomUUID()` | Padrão estabelecido na Phase 2 — `generateProfileId()` usa `crypto.randomUUID()` |
| Badge de status | Span com className condicional | `npx shadcn@latest add badge` | Componente shadcn padronizado; Badge não está instalado ainda [VERIFIED: ls src/components/ui/] |

**Key insight:** O principal risco desta fase é a geração do Excel. A abordagem cirúrgica zipfile parece "artesanal" mas é a única que preserva 100% do template original — verificado em runtime.

---

## Common Pitfalls

### Pitfall 1: Rota em Inglês vs. Português

**What goes wrong:** Left rail aponta para `/vacancies` (inglês, padrão do projeto para URLs). Se o planejador criar `/vagas`, o link fica quebrado.
**Why it happens:** D-14 menciona "rota /vagas" mas o left-rail.tsx já tem `href: "/vacancies"` [VERIFIED].
**How to avoid:** Usar `/vacancies` como rota (consistente com `/profiles`). A label exibida pode ser "Vagas" em português. Atualizar só o `disabled: true → false` no left-rail.
**Warning signs:** 404 ao clicar em "Vagas" no menu.

### Pitfall 2: Célula Ocupada vs. Célula Vazia no Template

**What goes wrong:** A abordagem cirúrgica tenta substituir `<c r="D5" s="59"/>` (célula vazia) por uma célula com valor. Se a célula já contiver um valor (de exemplo no template), a regex não casa.
**Why it happens:** O template tem "SDR" em D6 (shared string index 8) como exemplo de cargo [VERIFIED: shared strings index 8 = 'SDR'].
**How to avoid:** O mapeador de células deve verificar se a célula é vazia ou tem valor existente, e usar o padrão correto de substituição para cada caso. Para células com valor existente (tipo `t="s"`), substituir o nó completo.
**Warning signs:** O valor não aparece no arquivo gerado.

### Pitfall 3: Geração do Excel em Route Handler vs. Server Action

**What goes wrong:** Tentar gerar o Excel via Server Action e redirecionar o browser para baixar.
**Why it happens:** Server Actions não podem retornar responses binárias — elas retornam JSON ou redirect.
**How to avoid:** A geração e o download DEVEM estar no Route Handler GET `/api/vacancies/[id]/form`. O botão na UI faz uma navegação normal (`window.location.href = ...` ou `<a href="...">`) — não um fetch com Server Action.
**Warning signs:** Arquivo não baixa ou baixa corrompido.

### Pitfall 4: Escape XML em Valores de Células

**What goes wrong:** Um valor como `"P&D / Lyceum"` escrito diretamente em `<t>P&D / Lyceum</t>` corrompe o XML do sheet.
**Why it happens:** `&` no XML precisa ser `&amp;`.
**How to avoid:** Sempre escapar 5 chars em valores antes de inserir no XML: `& → &amp;`, `< → &lt;`, `> → &gt;`, `' → &apos;`, `" → &quot;`.
**Warning signs:** Excel reporta "arquivo corrompido" ao abrir; ou o valor não aparece.

### Pitfall 5: adm-zip e Compressão

**What goes wrong:** adm-zip regrava alguns arquivos com compressão diferente do original, causando advertência de "reparo necessário" no Excel.
**Why it happens:** xlsx usa ZIP_DEFLATED para a maioria dos arquivos, mas alguns membros podem estar stored sem compressão.
**How to avoid:** Ao iterar sobre os membros do ZIP original, usar as mesmas flags de compressão da entrada original (`entry.method`). Testar o arquivo gerado abrindo no LibreOffice ou Excel antes de entregar.
**Warning signs:** Excel abre e pergunta "Deseja reparar o arquivo?"

### Pitfall 6: settings.json Não Existe Ainda

**What goes wrong:** Na primeira execução, `DATA_PATH/settings.json` não existe. SettingsRepository.get() deve retornar defaults silenciosamente, não lançar erro.
**Why it happens:** O gestor ainda não configurou os dados da área.
**How to avoid:** `get()` retorna um objeto `AreaSettings` com campos vazios (strings vazias) se o arquivo não existir. A geração do Excel trata strings vazias como células em branco.
**Warning signs:** 500 na primeira geração de formulário.

---

## Code Examples

### Leitura de Arquivo como Download no Next.js App Router

```typescript
// Source: padrão verificado — davegray.codes/posts/how-to-download-xlsx-files-from-a-nextjs-route-handler
// e verificação direta da estrutura do Next.js 16 (Route Handlers)
export async function GET(_req: Request) {
  const buffer = fs.readFileSync("/path/to/file.xlsx");
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="requisicao.xlsx"',
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
```

### Escape de XML para Células

```typescript
// Fonte: padrão XML W3C — obrigatório para qualquer valor inserido em XML
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
```

### Avançar Status da Vaga (Server Action)

```typescript
// src/app/actions/vacancy.ts
export async function advanceVacancyStatus(vacancyId: string): Promise<void> {
  const vacancy = await vacancyRepository.findById(vacancyId);
  if (!vacancy) return;

  const transitions: Record<VacancyStatus, VacancyStatus | null> = {
    "Aberta": "Em andamento",
    "Em andamento": "Encerrada",
    "Encerrada": null,
  };

  const next = transitions[vacancy.status];
  if (!next) return;

  await vacancyRepository.save({
    ...vacancy,
    status: next,
    ...(next === "Encerrada" ? { closedAt: new Date().toISOString() } : {}),
  });
}
```

### Badge de Status

```typescript
// shadcn Badge com variante por status — após npx shadcn@latest add badge
const STATUS_VARIANTS: Record<VacancyStatus, "default" | "secondary" | "destructive"> = {
  "Aberta": "default",        // azul
  "Em andamento": "secondary", // neutro
  "Encerrada": "destructive",  // vermelho/cinza
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API routes | App Router Route Handlers (`route.ts`) | Next.js 13 | Usar `export async function GET()` com Response nativa |
| `res.setHeader` + `res.send` | `new Response(buffer, { headers })` | Next.js 13 App Router | API Web padrão, sem imports do next |
| `useFormState` (React 18) | `useActionState` (React 19) | React 19 | Já usado em Profile Form — seguir mesmo padrão |

**Deprecated/outdated:**
- `next/server` `NextResponse.json()` para binários: usar `new Response()` nativa para servir arquivos binários — mais limpo e padrão.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | adm-zip, fs operations | ✓ | node:22-alpine (Docker) | — |
| Python 3 | Fallback para geração xlsx | ✓ | 3.12.3 (host) | — |
| DATA_PATH/templates/requisicao-de-pessoal.xlsx | Excel generator | ✓ | verificado em runtime | Erro claro: "template não encontrado" |
| shadcn Badge | Status badge na lista | ✗ | — | `npx shadcn@latest add badge` — Wave 0 |
| adm-zip | Excel generator | ✗ | — | `npm install adm-zip` — Wave 0 |

**Missing dependencies with no fallback:**
- Template xlsx em DATA_PATH — se ausente, geração falha com mensagem clara. O template já está no data repo [VERIFIED].

**Missing dependencies with fallback:**
- adm-zip — instalar em Wave 0
- Badge — instalar em Wave 0

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16.3.0 |
| Config file | `vitest.config.ts` (raiz do projeto) |
| Quick run command | `npx vitest run src/__tests__/vacancy.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VAG-01 | Tipos union de VacancyStatus, RequestType, WorkMode, WorkSchedule | unit | `npx vitest run src/__tests__/vacancy.test.ts` | ❌ Wave 0 |
| VAG-01 | generateVacancyId retorna UUID v4 | unit | `npx vitest run src/__tests__/vacancy.test.ts` | ❌ Wave 0 |
| VAG-01 | VacancyRepository.save e findById | unit | `npx vitest run src/__tests__/vacancy-repository.test.ts` | ❌ Wave 0 |
| VAG-01 | AreaSettings interface e defaults | unit | `npx vitest run src/__tests__/settings.test.ts` | ❌ Wave 0 |
| VAG-03 | escapeXml não deixa passar `&` ou `<` | unit | `npx vitest run src/__tests__/excel-generator.test.ts` | ❌ Wave 0 |
| VAG-03 | generateVacancyForm preserva todos os membros do ZIP | unit (I/O) | `npx vitest run src/__tests__/excel-generator.test.ts` | ❌ Wave 0 |
| VAG-03 | generateVacancyForm escreve valor em célula alvo | unit (I/O) | `npx vitest run src/__tests__/excel-generator.test.ts` | ❌ Wave 0 |
| VAG-04 | VacancyRepository.list retorna lista ordenada | unit | `npx vitest run src/__tests__/vacancy-repository.test.ts` | ❌ Wave 0 |
| VAG-02 | SKILL.md existe e contém pré-condições e passos | manual | — | ❌ Wave 0 |

### Sampling Rate

- **Por task commit:** `npx vitest run src/__tests__/vacancy.test.ts src/__tests__/excel-generator.test.ts`
- **Por wave merge:** `npx vitest run`
- **Phase gate:** Suite completa verde antes de `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/vacancy.test.ts` — cobre tipos union, generateVacancyId (VAG-01)
- [ ] `src/__tests__/vacancy-repository.test.ts` — cobre save, findById, list (VAG-01, VAG-04)
- [ ] `src/__tests__/settings.test.ts` — cobre AreaSettings defaults, SettingsRepository (VAG-01)
- [ ] `src/__tests__/excel-generator.test.ts` — cobre escapeXml, generateVacancyForm com fixture do template real (VAG-03)
- [ ] Framework install: `npm install adm-zip && npm install --save-dev @types/adm-zip`
- [ ] Badge component: `npx shadcn@latest add badge`

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | next-auth — já implementado na Phase 1; route handler verifica session |
| V3 Session Management | no | Single-user; gerenciado pelo next-auth |
| V4 Access Control | yes (minimal) | Session check no route handler GET /api/vacancies/[id]/form |
| V5 Input Validation | yes | Zod — validar campos da Vacancy antes de salvar; IDs sanitizados no repository (path traversal check já no padrão) |
| V6 Cryptography | no | Não há criptografia nesta fase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal em vacancy ID | Tampering | Já mitigado no padrão do repository — validação de ID com `includes("..")` |
| XML injection em valores de células | Tampering | `escapeXml()` obrigatório em todos os valores antes de inserir no sheet XML |
| Download não autenticado de formulários | Information Disclosure | Session check no início do Route Handler — já no pattern acima |
| Template xlsx substituído por arquivo malicioso | Tampering | Template lido de DATA_PATH controlado pelo gestor — risco de ambiente, não código |

---

## Project Constraints (from CLAUDE.md)

- **Kebab-case** para todos os arquivos e pastas: `vacancy-repository.ts`, `vacancy-form.tsx`, `excel-generator.ts`
- **Commits nunca automáticos** — sempre via skill `/commit-push` com aprovação explícita
- **Idioma híbrido:** nomes de arquivo em inglês; textos, commits e comunicação em pt-BR
- **Sem banco de dados no v1:** persistência JSON em DATA_PATH
- **IA v1 via CLI externo:** skill VAG-02 é arquivo SKILL.md em `.agents/skills/abrir-vaga/`
- **Sem chat nativo na web app:** VAG-02 é external — a web app não implementa chat
- **Stack obrigatório:** Next.js 16 + React 19 + TypeScript 5 + Tailwind 4 + shadcn/ui
- **UUID v4 para IDs:** `crypto.randomUUID()` — padrão Phase 2

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Os checkboxes VML do template não têm `FmlaLink` e são puramente visuais (não mapeados a células) | Decisão Crítica: Excel | Se tiverem FmlaLink, seria possível marcá-los programaticamente via célula vinculada — a abordagem continua funcionando, só deixaríamos de aproveitar uma feature extra |
| A2 | As células de input estão nas linhas ímpares (5, 7, 9...) imediatamente abaixo dos labels nas linhas pares | Mapeamento 1-a-1 | Se o mapeamento exato de células for diferente, o gerador escreve no lugar errado — o planejador DEVE mapear célula por célula antes de implementar o gerador |
| A3 | adm-zip preserva a compressão original de cada entrada do ZIP sem configuração especial | Environment / Pitfalls | Se adm-zip alterar a compressão e o Excel reclamar, precisar usar `fflate` ou abordagem manual com a API `zipfile` do Python |
| A4 | `/vacancies` (inglês) é a rota correta, pois o left-rail.tsx já tem `href: "/vacancies"` | Architecture | Se o product owner preferir `/vagas`, é só atualizar o href — sem impacto funcional |

**Claim A2 é o único que requer ação concreta do planejador:** mapear o endereço exato de cada célula de input antes de implementar `excel-generator.ts`. A pesquisa identificou que linhas de label (labels GH) ficam em linhas pares e linhas de input ficam em linhas ímpares, mas o mapeamento completo requer inspecionar o arquivo com uma ferramenta de planilha ou script de diagnóstico.

---

## Open Questions

1. **Mapeamento exato célula → campo GH**
   - O que sabemos: identificamos que o template tem 71 linhas, labels nas linhas pares, inputs nas ímpares; shared strings mapeiam todos os labels. Confirmamos D6 = "SDR" (exemplo de cargo).
   - O que está incerto: o endereço exato de cada célula de input para cada um dos ~20 campos. A tabela acima é uma proposta baseada na sequência lógica do template.
   - Recomendação: O planejador deve incluir uma task de diagnóstico em Wave 0 — um script Node.js que imprime todos os pares (linha, coluna, valor) do template, para confirmar o mapeamento antes de implementar o gerador.

2. **Badge component status**
   - O que sabemos: Badge não está em `src/components/ui/` [VERIFIED].
   - O que está incerto: se o projeto usa shadcn com `components.json` configurado para instalar automaticamente.
   - Recomendação: `npx shadcn@latest add badge` em Wave 0 como primeiro passo.

3. **Nome da rota de configurações**
   - O que sabemos: D-05 diz "Configurações" ou "Dados da Área"; a decisão está em Claude's Discretion.
   - Recomendação do pesquisador: usar `/settings` como rota (consistente com padrão inglês de URLs no projeto) e "Configurações" como label no left-rail.

---

## Sources

### Primary (HIGH confidence)

- Inspeção direta de `/home/henrico/github/henricos/hiring-pipeline-data/templates/requisicao-de-pessoal.xlsx` via Python zipfile — estrutura interna verificada
- Verificação runtime da abordagem cirúrgica zipfile — output confirmado com 121 arquivos, VML e ctrlProps preservados
- `src/lib/repositories/profile-repository.ts` — padrão de repositório verificado
- `src/components/shell/left-rail.tsx` — href `/vacancies` confirmado
- `src/lib/data-service.ts` — `ensureSubdir` verificado
- `vitest.config.ts` + `src/__tests__/` — infraestrutura de testes verificada
- `package.json` — todas as versões verificadas

### Secondary (MEDIUM confidence)

- ExcelJS GitHub issue #392 [CITED: github.com/exceljs/exceljs/issues/392] — VML form controls not preserved
- openpyxl docs — "shapes will be lost from existing files if opened and saved" [CITED: openpyxl.readthedocs.io/en/stable]
- Next.js download pattern [CITED: davegray.codes/posts/how-to-download-xlsx-files-from-a-nextjs-route-handler]

### Tertiary (LOW confidence)

- SheetJS community edition VML/ctrlProps limitation [WebSearch — não acessamos docs oficiais, mas consistente com múltiplas fontes]

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — todas as versões verificadas via package.json e npm view
- Architecture: HIGH — padrões existentes verificados no codebase; route handler pattern verificado em fontes oficiais
- Excel generation (abordagem cirúrgica): HIGH — verificado em runtime com o template real
- Excel generation (ExcelJS/SheetJS limitação): MEDIUM — baseado em issue rastreável + comportamento verificado indiretamente
- Pitfalls: MEDIUM — baseados em análise do template real + padrões conhecidos de XML/ZIP
- Field mapping (células exatas): LOW — proposta lógica baseada na estrutura do template; requer confirmação por script de diagnóstico

**Research date:** 2026-04-20
**Valid until:** 2026-06-01 (stack estável; Excel template não deve mudar)
