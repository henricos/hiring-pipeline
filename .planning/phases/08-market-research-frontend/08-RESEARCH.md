# Phase 8: Market Research Frontend - Research

**Researched:** 2026-04-26  
**Domain:** Market research data visualization with tabs in Next.js 16 + React 19 + shadcn/ui  
**Confidence:** HIGH

## Summary

Phase 8 implementa uma tela de detalhe de perfil (`/profiles/[id]`) com abas para visualizar dados de pesquisa de mercado ancorados ao perfil. A tela é completamente nova — atualmente existe apenas `/profiles/[id]/edit`. Três abas exibem: perfil em modo leitura (Aba Perfil), lista de pesquisas com expansão inline (Aba Vagas), e resumo mais recente com dados de mercado completos (Aba Resumo de Mercado).

A arquitetura é simples: um Server Component com `async params` lê dados via repositório (novo — padrão igual ao `ProfileRepository`), passa para componente Client com estado local para tabs. Nenhuma alteração no schema `JobProfile` (imutável por decisão da Phase 5). Componente tabs vem via shadcn/radix-ui (já no `package.json` como `radix-ui@^1.4.3`, instalar via `npx shadcn@latest add tabs`).

**Primary recommendation:** Construir o repositório de pesquisas seguindo o padrão idêntico ao `ProfileRepository` (interface genérica + implementação JSON), criar a página `/profiles/[id]/page.tsx` com Server Component async, usar shadcn Tabs + Accordion para expansão inline na aba Vagas, passar `profileId` para componentes Client que gerenciam estado de abas e expansões.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01 — Navegação:** Click no card da lista `/profiles` navega para `/profiles/[id]` (nova tela de detalhe). Botões "Editar" e "Deletar" continuam visíveis no card — comportamento do click no body muda para abrir detalhe.

**D-02 — Edição:** Na tela de detalhe, botão "Editar" no cabeçalho navega para `/profiles/[id]/edit` (rota existente, sem alteração).

**D-03 — Aba Perfil leitura:** Renderiza campos do perfil em modo leitura — texto limpo por seções, sem form inputs. Campos opcionais vazios são omitidos.

**D-05 a D-07 — Aba Vagas:** Lista pesquisas em ordem cronológica reversa (mais recente primeiro). Cada linha exibe: data, título do cargo (profileTitle), contagem de vagas. Click expande inline mostrando vagas brutas (título, empresa, porte, stack, snippet). Uma pesquisa por vez expande (ou múltiplas — discretion área).

**D-08 a D-12 — Aba Resumo:** Exibe `-resumo.json` mais recente. Se múltiplas, exibir qual data. Todos os campos: commonTitles, titleAliases, stackFrequency (ranqueado, não gráfico), salaryRange, salaryGuide com atribuição de fontes, emergingStack, commonBehaviors, commonChallenges, archetypes, profileHints.

### Claude's Discretion

- Instalação do componente tabs via `npx shadcn@latest add tabs` (radix-ui já está no package.json)
- Accordion único ou múltiplo para expansão de pesquisas na aba Vagas
- Estrutura do seletor de data na aba Resumo (select simples ou botões)

### Deferred Ideas (OUT OF SCOPE)

- Comparação longitudinal de pesquisas (tendência stack/salário)
- Re-execução de `/pesquisar-mercado` via UI
- Exportação do Resumo de Mercado

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIZ-01 | Tela do perfil exibe aba "Vagas" com lista das pesquisas vinculadas ao perfil (data, cargo, contagem) | Pesquisa de estrutura de dados, padrão de repositório, Server Component async com params |
| VIZ-02 | Tela do perfil exibe aba "Resumo" com conteúdo do `-resumo.json` mais recente (faixas salariais, análise, profileHints) | Estrutura do `-resumo.json`, campos a renderizar, padrão de leitura de JSON |
| VIZ-03 | Gestor pode selecionar uma pesquisa anterior na aba Vagas e visualizar seus dados | Padrão de seleção com dropdown ou botões, estado local de Client Component, carregamento de `-vagas.json` específico |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Leitura de perfil e metadados | API / Backend (Server Component) | — | Server Component lê dados do filesystem e renderiza HTML estático por seção |
| Listagem de pesquisas por perfil | API / Backend (Server Component) | — | Server Component descobre arquivos em `DATA_PATH/research/{profileId}/` |
| Seleção de abas | Frontend (Client Component) | — | Estado local de qual aba está ativa — tipicamente controlado via React state |
| Expansão inline de vagas | Frontend (Client Component) | — | Estado local de qual vaga está expandida — Accordion com índice ou ID de vaga |
| Seleção de pesquisa anterior (Resumo) | Frontend (Client Component) | — | Dropdown/botões para trocar data — carregamento via Server Action ou fetch de URL de resumo |
| Renderização de dados estruturados | Frontend (Client Component) | — | Exibição de listas, tabelas, badges — pure presentation |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | Framework SSR + Server Components | Projeto já usa; Server Components obrigatórios para data fetching |
| React | 19.2.4 | UI components + hooks (useState, useTransition) | Padrão do projeto |
| TypeScript | 5.9.3 | Type safety para data structures | Padrão do projeto |
| radix-ui | ^1.4.3 | Headless UI primitives para Tabs, Accordion, Select | Já instalado; shadcn utiliza |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui (Tabs) | ^4.3.0 | Componente Tabs estilizado com Tailwind | Instalar via `npx shadcn@latest add tabs` |
| shadcn/ui (Accordion) | via shadcn/cli | Componente Accordion estilizado | Opcional — se elegido para expansão de vagas |
| lucide-react | ^1.8.0 | Icons para botões, ações | Já em uso; ícones para expandir/colapsar vaga |
| Tailwind CSS | 4.2.2 | Styling com design tokens do projeto | Padrão; escala de tipografia e cores em globals.css |
| zod | 4.3.6 | Validação de estruturas de dados lidas | Opcional — validar JSON de resumo/vagas é defensivo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Tabs | DIY tab state + CSS | Ganho zero — radix-ui/tabs + shadcn já estão; DIY acrescenta código mantível |
| Accordion (shadcn) | simples state local (expanded vaga index) | Ambos válidos; Accordion oferece a11y e animações; state local é mais leve para 1-N vagas |
| Dropdown (Select) para data na aba Resumo | Botões discretos (anterior/próximo) | Select é mais escalável (muitas datas); botões mais minimalistas (poucas datas) — D-08 deixa discretion |

**Installation:**
```bash
# Tabs já está em package.json (radix-ui); instalar via shadcn
npx shadcn@latest add tabs

# Accordion (se escolhido)
npx shadcn@latest add accordion

# Select (se escolhido para seletor de data)
npx shadcn@latest add select
```

**Version verification:** [VERIFIED: package.json]
- radix-ui@^1.4.3 — instalado
- shadcn@^4.3.0 — instalado; fornece CLI para adicionar componentes

## Architecture Patterns

### System Architecture Diagram

```
User → ProfileList (Client Component)
         ↓ click on card body (não nos botões Editar/Deletar)
         ↓ router.push(/profiles/[id])
         ↓
    ProfileDetailPage (Server Component, async)
         ├─ params → {id: string}
         ├─ ResearchRepository.findProfile(id) → JobProfile
         ├─ ResearchRepository.listResearches(id) → { date, vagas[], resumo }[]
         │
         └─ render ProfileDetailTabs (Client Component)
            ├─ Aba "Perfil"
            │  ├─ lê profile (prop passado Server → Client)
            │  └─ renderiza sections (Responsabilidades, Qualificações, Comportamentos, Desafios)
            │
            ├─ Aba "Vagas"
            │  ├─ state: selectedResearch (qual data está selecionada)
            │  ├─ state: expandedJobIndex (qual vaga está expandida, null ou índice)
            │  ├─ lista pesquisas com datas, títulos, contagens
            │  ├─ click em line → setExpandedJobIndex(index)
            │  └─ renderiza vagas do selectedResearch[-vagas.json]
            │
            └─ Aba "Resumo"
               ├─ state: selectedDate (qual resumo está sendo exibido)
               ├─ select/botões para trocar data
               └─ renderiza campos do [-resumo.json] mais recente ou selecionado

 Legend:
 Server Component — lê filesystem, renderiza HTML
 Client Component — gerencia state local, interações
```

### Recommended Project Structure

```
src/
├── app/(shell)/
│   └── profiles/
│       ├── page.tsx                    # Listagem (existente)
│       ├── new/page.tsx                # Criar (existente)
│       ├── [id]/
│       │   ├── page.tsx                # ← NOVO: detalhe com abas
│       │   └── edit/page.tsx           # Edição (existente)
│       └── [id]/research/              # Rota opcional para Server Action (load research)
│           └── route.ts                # GET /{profileId}/research/[date] → JSON
│
├── lib/
│   ├── profile.ts                      # Schema JobProfile (imutável)
│   ├── repositories/
│   │   ├── profile-repository.ts       # Implementação existente
│   │   └── research-repository.ts      # ← NOVO: análogo para pesquisas
│   ├── data-service.ts                 # Padrão de acesso DATA_PATH (existente)
│   └── env.ts                          # Env vars (existente)
│
├── components/
│   ├── profile/
│   │   ├── profile-list.tsx            # Listagem (ajustar click) ← MODIFICAR
│   │   ├── profile-detail-tabs.tsx     # ← NOVO: Client component com abas
│   │   ├── profile-detail-perfil.tsx   # ← NOVO: aba Perfil (subcomponente)
│   │   ├── profile-detail-vagas.tsx    # ← NOVO: aba Vagas (subcomponente)
│   │   └── profile-detail-resumo.tsx   # ← NOVO: aba Resumo (subcomponente)
│   └── ui/
│       ├── tabs.tsx                    # ← INSTALAR via shadcn
│       ├── accordion.tsx               # ← OPCIONAL (se escolhido para vagas)
│       └── select.tsx                  # ← OPCIONAL (se escolhido para datas)
│
└── app/actions/
    └── research.ts                     # ← NOVO: Server Actions para listar/ler pesquisas
```

### Pattern 1: Server Component async com Data Fetching

**What:** Pages em Next.js 16 usam `async function Page({ params })` com `await params` para resolver parâmetros de rota de forma assíncrona (não bloqueante no build-time).

**When to use:** Sempre que page precisa ler dados do filesystem ou banco antes de renderizar — evita waterfalls via Suspense.

**Example:**
```typescript
// Source: CONTEXT.md + /app/(shell)/profiles/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { ProfileDetailTabs } from "@/components/profile/profile-detail-tabs";
import { researchRepository } from "@/lib/repositories/research-repository";

interface ProfileDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const { id } = await params;

  // Fetch profile
  const profile = await getProfile(id);
  if (!profile) notFound();

  // Fetch researches for this profile
  const researches = await researchRepository.listByProfileId(id);

  return (
    <div className="p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          {profile.title}
        </h1>
        <ProfileDetailTabs profile={profile} researches={researches} />
      </div>
    </div>
  );
}
```

### Pattern 2: Client Component com useState para Aba Ativa + Expandida

**What:** Componente Client gerencia qual aba está selecionada e (na aba Vagas) qual vaga está expandida usando `useState`.

**When to use:** Estado local que não precisa persistir — interações rápidas do usuário.

**Example:**
```typescript
// Source: padrão shadcn + projeto
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDetailPerfil } from "./profile-detail-perfil";
import { ProfileDetailVagas } from "./profile-detail-vagas";
import { ProfileDetailResumo } from "./profile-detail-resumo";
import type { JobProfile } from "@/lib/profile";
import type { Research } from "@/lib/repositories/research-repository";

interface ProfileDetailTabsProps {
  profile: JobProfile;
  researches: Research[];
}

export function ProfileDetailTabs({ profile, researches }: ProfileDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="perfil">Perfil</TabsTrigger>
        <TabsTrigger value="vagas">Vagas</TabsTrigger>
        <TabsTrigger value="resumo">Resumo de Mercado</TabsTrigger>
      </TabsList>

      <TabsContent value="perfil">
        <ProfileDetailPerfil profile={profile} />
      </TabsContent>

      <TabsContent value="vagas">
        <ProfileDetailVagas researches={researches} />
      </TabsContent>

      <TabsContent value="resumo">
        <ProfileDetailResumo researches={researches} />
      </TabsContent>
    </Tabs>
  );
}
```

### Pattern 3: Repositório para Pesquisas (análogo a ProfileRepository)

**What:** Interface genérica `ResearchRepository` com implementação JSON — padrão idêntico ao `ProfileRepository`. Permite migrar para BD sem tocar em Server Actions ou componentes.

**When to use:** Sempre que abstração de persistência é benéfica (quer agora, quer no futuro).

**Example:**
```typescript
// Source: padrão do projeto (ProfileRepository)
import fs from "fs";
import path from "path";
import { ensureSubdir } from "@/lib/data-service";

export interface Research {
  profileId: string;
  date: string; // YYYY-MM-DD
  baseName: string; // {date} ou {date}-2
  vagasFile: string; // {date}-vagas.json
  resumoFile: string; // {date}-resumo.json
}

export interface ResearchRepository {
  listByProfileId(profileId: string): Promise<Research[]>;
  getVagas(profileId: string, date: string): Promise<any | null>;
  getResumo(profileId: string, date: string): Promise<any | null>;
}

export class JsonResearchRepository implements ResearchRepository {
  private researchPath(profileId: string): string {
    const dir = ensureSubdir(`research/${profileId}`);
    // path traversal guard (igual ao ProfileRepository)
    if (!profileId || profileId.includes("..") || profileId.includes("/")) {
      throw new Error(`Invalid profileId: "${profileId}"`);
    }
    return dir;
  }

  async listByProfileId(profileId: string): Promise<Research[]> {
    try {
      const dir = this.researchPath(profileId);
      const files = fs.readdirSync(dir);
      
      // Agrupar por data (uma data pode ter -vagas.json e -resumo.json)
      const byDate = new Map<string, Research>();
      files.forEach((file) => {
        const match = file.match(/^(\d{4}-\d{2}-\d{2})(?:-\d)?-(vagas|resumo)\.json$/);
        if (!match) return;
        const [, date, type] = match;
        
        if (!byDate.has(date)) {
          byDate.set(date, {
            profileId,
            date,
            baseName: date,
            vagasFile: "",
            resumoFile: "",
          });
        }
        
        const research = byDate.get(date)!;
        if (type === "vagas") research.vagasFile = file;
        if (type === "resumo") research.resumoFile = file;
      });

      // Retornar ordenado por data decrescente
      return Array.from(byDate.values()).sort((a, b) =>
        b.date.localeCompare(a.date)
      );
    } catch {
      return [];
    }
  }

  async getVagas(profileId: string, date: string): Promise<any | null> {
    try {
      const dir = this.researchPath(profileId);
      const file = `${date}-vagas.json`;
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  async getResumo(profileId: string, date: string): Promise<any | null> {
    try {
      const dir = this.researchPath(profileId);
      const file = `${date}-resumo.json`;
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }
}

export const researchRepository = new JsonResearchRepository();
```

### Anti-Patterns to Avoid

- **Fetching de pesquisas no componente Client:** Dados lidos do filesystem devem estar no Server Component ou Server Action — nunca em `useEffect` de Client sem suspense/fallback.
- **Pasar `children` via string em lugar de componentes:** Aba Resumo com campos complexos (stackFrequency como tabela, salaryGuide com múltiplas fontes) deve ser componente estruturado, não string.
- **State de "qual aba" acoplado com "qual pesquisa selecionada":** Manter separado — mudança de aba não deve resetar a vaga expandida na aba Vagas.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Componente de abas (tabs) | DIY tab state + manual CSS | shadcn/ui Tabs (radix-ui) | Acessibilidade (ARIA), focus management, keyboard navigation (setas, Home/End) |
| Accordion/expansão de lista | DIY setTimeout/CSS transitions | shadcn/ui Accordion ou simples state local | Animações suaves, a11y, sincronismo com state |
| Select/dropdown de data | DIY `<select>` HTML bruto | shadcn/ui Select ou `<select>` estilizado com Tailwind | Consistência visual com design system, UX esperada |
| Renderização de stackFrequency (objeto key→count) | Loop manual com `Object.entries()` | `Object.entries().sort().map()` ou componente estruturado `<StackFrequencyTable>` | Legibilidade, reutilização se renderizado em múltiplos lugares |
| Path traversal de profileId | Concatenação string direta | ensureSubdir + pattern validation (path.resolve + startsWith) | Segurança — bloqueia `../` attacks |

**Key insight:** Este projeto já tem abstrações sólidas (repositórios, data-service, ensureSubdir). Expandir essas abstrações (novo repositório de pesquisas) é menor custo que DIY — e habilita migração para BD no futuro sem tocar em componentes.

## Common Pitfalls

### Pitfall 1: Confundir `{date}-vagas.json` com arquivo único por date

**What goes wrong:** Assumir que não há sufixo `-2`, `-3` quando ocorre colisão no mesmo dia. Código tenta ler `2026-04-24-vagas.json` e falha, não encontra `2026-04-24-2-vagas.json`.

**Why it happens:** Documentação da Phase 7 menciona sufixo `-2`, `-3` mas exemplo canônico no `data/research/` não mostra colisão.

**How to avoid:** Usar padrão regex `(\d{4}-\d{2}-\d{2})(?:-\d)?-(vagas|resumo)` — captura date + sufixo opcional. Testar com `ls` no repositório de pesquisas do dev.

**Warning signs:** Aba Vagas exibe pesquisa mais recente mas não mostra 2ª/3ª pesquisa do mesmo dia quando existem.

### Pitfall 2: Passar estrutura de `-vagas.json` inteira para componente Client

**What goes wrong:** `-vagas.json` contém `jobs[]` com 15+ campos (title, stack[], behaviors, archetype, salaryRange, etc.). Componente tenta renderizar tudo — UI fica poluída.

**Why it happens:** D-05 diz "mostra vagas brutas" mas não especifica *quais campos* do job.

**How to avoid:** Definir um subset: `{ title, company, companySize, stack[], snippet, salaryRange?, behaviors? }`. Criar type `JobCard` ou similar — constrain a estrutura.

**Warning signs:** Aba Vagas mostra +5 linhas por vaga quando deveria ser ~3.

### Pitfall 3: Resumo de Mercado renderiza `stackFrequency` como objeto literal

**What goes wrong:** `"stackFrequency": { "Java": 15, "Spring Boot": 13, ... }` renderizado como `Java: 15 Spring Boot: 13` — não ranqueado, ordem arbitrária.

**Why it happens:** D-10 diz "lista ranqueada" mas implementação default é `Object.keys()` que não ordena numericamente.

**How to avoid:** `Object.entries(stackFrequency).sort((a, b) => b[1] - a[1]).map(([tech, count]) => ...)`. Ou extrair em componente `<StackFrequencyList>`.

**Warning signs:** Aba Resumo exibe stack em ordem alfabética em vez de por frequência.

### Pitfall 4: Esqueceu de atualizar click handler em `profile-list.tsx`

**What goes wrong:** Card ainda navega para `/profiles/{id}/edit` em vez de `/profiles/{id}`. Usuário clica e vai direto para edição, não vê a tela de detalhe nova.

**Why it happens:** D-01 é mudança cirúrgica em linha 70: `onClick={() => router.push(...)}`. Fácil deixar passar.

**How to avoid:** Test checklist: clicar corpo do card → `/profiles/[id]`, clicar botão Editar no card → `/profiles/[id]/edit`, clicar botão Deletar → confirma e remove.

**Warning signs:** Click no card abre edit page em vez de detail page.

### Pitfall 5: Componente ProfileDetailTabs recebe `researches[]` vazio (nenhuma pesquisa para o perfil)

**What goes wrong:** Aba Vagas e Resumo não renderizam nada — UI branca, sem empty state mensagem clara.

**Why it happens:** D-07 e D-12 mencionam empty state mas não especificam placement/mensagem.

**How to avoid:** Cada aba (Vagas, Resumo) verifica `if (researches.length === 0)` e renderiza `<div className="text-center py-12">Nenhuma pesquisa. Execute /pesquisar-mercado.</div>`.

**Warning signs:** Aba Vagas/Resumo em branco quando perfil foi criado mas não pesquisado ainda.

## Code Examples

Verified patterns from official sources and project codebase:

### Aba Perfil — renderizar seção condicional com omissão de campos vazios

```typescript
// Source: padrão do projeto (profile-form.tsx) + CONTEXT.md D-04
"use client";

import { Badge } from "@/components/ui/badge";
import type { JobProfile } from "@/lib/profile";

interface ProfileDetailPerfilProps {
  profile: JobProfile;
}

export function ProfileDetailPerfil({ profile }: ProfileDetailPerfilProps) {
  const handleEditClick = () => {
    window.location.href = `/profiles/${profile.id}/edit`;
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho com botão Editar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title-md font-medium text-on-surface">
            {profile.title}
          </h2>
          <p className="text-body-md text-on-surface/70 mt-1">
            {profile.suggestedTitle}
          </p>
        </div>
        <button
          onClick={handleEditClick}
          className="text-body-md font-medium text-tertiary hover:underline"
        >
          Editar
        </button>
      </div>

      {/* Responsabilidades */}
      {profile.responsibilities.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Responsabilidades
          </h3>
          <ul className="space-y-2">
            {profile.responsibilities.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Qualificações — com badges */}
      {profile.qualifications.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Qualificações
          </h3>
          <div className="space-y-2">
            {profile.qualifications.map((qual, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge
                  variant={qual.required ? "default" : "outline"}
                  className="shrink-0 mt-0.5"
                >
                  {qual.required ? "Obrigatório" : "Desejável"}
                </Badge>
                <span className="text-body-md text-on-surface">{qual.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências Comportamentais */}
      {profile.behaviors.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Competências Comportamentais
          </h3>
          <ul className="space-y-2">
            {profile.behaviors.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desafios */}
      {profile.challenges.length > 0 && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Desafios
          </h3>
          <ul className="space-y-2">
            {profile.challenges.map((item, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

### Aba Vagas — accordion com expansão inline de vaga

```typescript
// Source: padrão shadcn Accordion + CONTEXT.md D-06
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Research } from "@/lib/repositories/research-repository";

interface ProfileDetailVagasProps {
  researches: Research[];
  initialVagas?: any[];
}

export function ProfileDetailVagas({
  researches,
  initialVagas = [],
}: ProfileDetailVagasProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    researches[0]?.date ?? null
  );

  if (researches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body-md text-on-surface/60 mb-4">
          Nenhuma pesquisa de mercado realizada para este perfil.
        </p>
        <p className="text-body-md text-on-surface/60">
          Execute a skill <code className="bg-surface-container px-2 py-1 rounded-sm">/pesquisar-mercado</code> para gerar dados.
        </p>
      </div>
    );
  }

  const selectedResearch = researches.find((r) => r.date === selectedDate);
  const vagas = initialVagas; // Carregado via Server Action ou prop

  return (
    <div className="space-y-6">
      {/* Selector de data (se múltiplas pesquisas) */}
      {researches.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-label-sm uppercase text-on-surface/60">
            Pesquisa:
          </label>
          <select
            value={selectedDate ?? ""}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-sm bg-surface-container px-3 py-2 text-body-md border border-outline-variant"
          >
            {researches.map((r) => (
              <option key={r.date} value={r.date}>
                {r.date} — {r.baseName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de pesquisas com datas */}
      <div className="space-y-2">
        {researches.map((research) => (
          <div
            key={research.date}
            className="flex items-center justify-between py-3 px-4 rounded-sm bg-surface-container-low hover:bg-surface-container cursor-pointer"
            onClick={() => setSelectedDate(research.date)}
          >
            <div className="flex-1">
              <p className="text-body-md font-medium text-on-surface">
                {research.date}
              </p>
              <p className="text-label-sm text-on-surface/70">
                {/* profileTitle e job count aqui */}
              </p>
            </div>
            <span className="text-label-sm text-on-surface/60">
              {/* job count badge */}
            </span>
          </div>
        ))}
      </div>

      {/* Accordion de vagas para pesquisa selecionada */}
      {selectedResearch && vagas.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-title-md font-medium text-on-surface">
            Vagas encontradas
          </h4>
          <Accordion type="single" collapsible>
            {vagas.map((job, idx) => (
              <AccordionItem key={idx} value={`job-${idx}`}>
                <AccordionTrigger className="text-body-md">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{job.title}</span>
                    <span className="text-on-surface/60">{job.company}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-4">
                    <p className="text-body-md">
                      <strong>Empresa:</strong> {job.company} ({job.companySize})
                    </p>
                    {job.stack && job.stack.length > 0 && (
                      <div>
                        <p className="text-body-md font-medium mb-2">
                          Stack:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.stack.map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-sm bg-surface-container text-label-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.snippet && (
                      <p className="text-body-md text-on-surface/80">
                        {job.snippet}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
```

### Aba Resumo — renderização de stackFrequency ranqueado

```typescript
// Source: CONTEXT.md D-10 + estrutura de resumo.json
"use client";

import type { Research } from "@/lib/repositories/research-repository";

interface ProfileDetailResumoProps {
  researches: Research[];
  initialResumo?: any;
}

export function ProfileDetailResumo({
  researches,
  initialResumo = null,
}: ProfileDetailResumoProps) {
  if (researches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body-md text-on-surface/60">
          Nenhum resumo de mercado disponível.
        </p>
      </div>
    );
  }

  const resumo = initialResumo || researches[0]; // Mais recente por padrão

  return (
    <div className="space-y-8">
      {/* Data do resumo (se múltiplas pesquisas) */}
      {researches.length > 1 && (
        <p className="text-label-sm text-on-surface/60">
          Resumo de: {resumo.date || resumo.baseName}
        </p>
      )}

      {/* Stack Frequency — ranqueado */}
      {resumo.summary?.stackFrequency && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Stack Frequência
          </h3>
          <div className="space-y-2">
            {Object.entries(resumo.summary.stackFrequency)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([tech, count]) => (
                <div
                  key={tech}
                  className="flex items-center justify-between py-2 px-3 rounded-sm bg-surface-container-low"
                >
                  <span className="text-body-md text-on-surface">{tech}</span>
                  <span className="text-label-sm font-medium text-on-surface/70">
                    {count} menções
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Faixa Salarial */}
      {(resumo.salaryRange || resumo.salaryGuide) && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Faixa Salarial
          </h3>
          {resumo.salaryGuide && (
            <div className="space-y-2">
              {resumo.salaryGuide.sources?.map((source, idx) => (
                <p key={idx} className="text-body-md text-on-surface">
                  <strong>{source.portal} {source.year}:</strong> R$
                  {(resumo.salaryGuide.min / 1000).toFixed(1)}k – R$
                  {(resumo.salaryGuide.max / 1000).toFixed(1)}k
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Common Titles */}
      {resumo.summary?.commonTitles && (
        <section>
          <h3 className="text-title-md font-medium text-on-surface mb-4">
            Títulos Comuns no Mercado
          </h3>
          <ul className="space-y-1">
            {resumo.summary.commonTitles.map((title, idx) => (
              <li key={idx} className="text-body-md text-on-surface flex gap-3">
                <span className="shrink-0">•</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Behaviors, Challenges, etc. — padrão similar */}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rotas dinâmicas sem Server Components | Server Components async com `await params` | Next.js 13+ | Eliminado loading states manuais; data fetching direto em page component |
| Tabs DIY com CSS tabs + manual state | radix-ui/Tabs (shadcn) | ecossistema shadcn | a11y automática, keyboard navigation, ARIA labels |
| Accordion DIY com `display: none` | shadcn/Accordion (radix-ui Collapsible) | shadcn adoption | Animações suaves, sincronismo com state, a11y |

**Deprecated/outdated:**
- DIY tab implementations — radix-ui oferece primitivo sólido que shadcn empacota
- Manual `<select>` sem estilo — shadcn Select ou styled `<select>` com Tailwind é padrão moderno

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `radix-ui@^1.4.3` está instalado e `shadcn@^4.3.0` oferece CLI para `add tabs` | Standard Stack | Instalação falha; script de setup quebra |
| A2 | Estrutura de data em `research/{profileId}/{date}-vagas.json` + `{date}-resumo.json` é consistente em todos os 4 profiles de exemplo | Architecture Patterns | Alguns profiles usam sufixo `-2`, `-3`; código não descobre variações |
| A3 | `-resumo.json` sempre contém os campos `summary.stackFrequency`, `salaryGuide`, `profileHints` | Code Examples | Campo ausente; componente renderiza undefined ou falha |
| A4 | `-vagas.json` contém array `jobs[]` com campos title, company, companySize, stack, snippet | Code Examples | Estrutura é diferente; subset de campos muda |
| A5 | Componente `ProfileList` click handler em linha ~70 pode ser mudado de `/profiles/{id}/edit` para `/profiles/{id}` sem impacto em outras funcionalidades | Architecture Patterns | Botão Editar ou Deletar acaba quebrado por falta de `e.stopPropagation()` |

**If this table is empty:** Todas as claims foram verificadas ou citadas — nenhuma confirmação do usuário necessária antes de execução.

## Open Questions

1. **Seletor de data na aba Resumo — UI design**
   - What we know: D-08 deixa discretion; múltiplas pesquisas podem existir (vimos 4 profiles com 1 pesquisa cada, mas nada impede 2+ datas).
   - What's unclear: Select element (padrão) vs. botões discretos (anterior/próximo) vs. dropdown de data em inline com resumo mostrado?
   - Recommendation: Usar `<select>` simples estilizado com Tailwind — escalável para N datas, minimalista, sem dependência extra de componente.

2. **Accordion para vagas — single vs. multiple expand**
   - What we know: D-06 deixa discretion ("apenas uma pesquisa pode estar expandida por vez OU múltiplas").
   - What's unclear: Qual UX é esperada? Single (radio) ou multiple (checkbox)?
   - Recommendation: Single expand por padrão (mais comum em listas); fácil mudar em `<Accordion type="single" collapsible>` para `type="multiple"` se feedback pedir.

3. **Loading de vagas.json na aba Vagas — quando carregar?**
   - What we know: `-resumo.json` carregado no Server Component (enumeração de pesquisas); dados renderizados em Client.
   - What's unclear: Quando `-vagas.json` é carregado? No mount do tab (Client)? Via Server Action ao clicar em linha?
   - Recommendation: Carregar todas as datas de `-vagas.json` no Server Component (uma pass ao `listByProfileId`), passar para Client — evita waterfall de requests.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| fs (Node.js) | ResearchRepository | ✓ | Built-in | — |
| path (Node.js) | ResearchRepository + data-service | ✓ | Built-in | — |
| Next.js 16 | Server Components async | ✓ | 16.2.3 | — |
| React 19 | Hooks (useState, useTransition) | ✓ | 19.2.4 | — |
| radix-ui | Tabs primitive | ✓ | 1.4.3 | — |
| shadcn/cli | Instalar componentes | ✓ | 4.3.0 | — |
| Tailwind CSS 4 | Styling | ✓ | 4.2.2 | — |

**Missing dependencies with no fallback:** None — stack está completo.

**Missing dependencies with fallback:** Nenhuma.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 + @testing-library/react 16.3.0 |
| Config file | vitest.config.ts (existente) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test:watch` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIZ-01 | Aba Vagas lista pesquisas com data, título, contagem | unit | `npm run test -- src/components/profile/profile-detail-vagas.test.tsx` | ❌ Wave 0 |
| VIZ-02 | Aba Resumo renderiza stackFrequency ranqueado e salaryGuide | unit | `npm run test -- src/components/profile/profile-detail-resumo.test.tsx` | ❌ Wave 0 |
| VIZ-03 | Gestor seleciona pesquisa anterior; `-vagas.json` da data é carregado e exibido | integration | `npm run test -- src/components/profile/profile-detail-vagas.test.tsx -t "select previous research"` | ❌ Wave 0 |
| VIZ-01 | Page `/profiles/[id]` renderiza sem erro com profile válido | unit | `npm run test -- src/app/\(shell\)/profiles/\[id\]/page.test.tsx` | ❌ Wave 0 |
| VIZ-02 | ResearchRepository lista pesquisas por profileId corretamente | unit | `npm run test -- src/lib/repositories/research-repository.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test` (todos os testes rápidos)
- **Per wave merge:** `npm run test:watch` (full suite com coverage)
- **Phase gate:** Full suite green antes de `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/profile/profile-detail-tabs.test.tsx` — covering VIZ-01, VIZ-02, VIZ-03 (tab navigation, data rendering)
- [ ] `src/components/profile/profile-detail-perfil.test.tsx` — covering profile read-only rendering
- [ ] `src/components/profile/profile-detail-vagas.test.tsx` — covering aba Vagas (list, expand, select date)
- [ ] `src/components/profile/profile-detail-resumo.test.tsx` — covering aba Resumo (stackFrequency sorting, salaryGuide render)
- [ ] `src/lib/repositories/research-repository.test.ts` — covering listByProfileId, getVagas, getResumo
- [ ] `src/app/(shell)/profiles/[id]/page.test.tsx` — covering Server Component rendering, notFound(), params resolution
- [ ] `src/app/actions/research.ts` — Server Actions (getResearchesByProfileId, getVagasByProfileIdDate)
- [ ] `conftest.ts` ou `setup.ts` — shared fixtures: mock filesystem, sample research data

*(If gaps exist, planner must address. If none: "Existing test infrastructure covers all requirements")*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | App auth já covered em Phase 1 |
| V3 Session Management | no | next-auth já configured |
| V4 Access Control | no | Single-user app; sem RBAC |
| V5 Input Validation | yes | Path validation em ResearchRepository (path traversal guard) |
| V6 Cryptography | no | Nenhuma criptografia específica desta phase |
| V14 Configuration | yes | DATA_PATH validation em data-service.ts |

### Known Threat Patterns for {Node.js + Next.js + filesystem}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal (`../`) em profileId/date | Tampering | path.resolve() + startsWith(dataPath + sep) — implemented in data-service.ensureSubdir() |
| LFI (Local File Inclusion) via malformed filename | Tampering | Regex validation de date format (YYYY-MM-DD) e profileId (UUID) |
| Directory listing exposure | Disclosure | fs.readdirSync() é privado (não exposto via HTTP routes sem validação) |
| JSON parsing errors (malformed -resumo.json) | Denial of Service | try/catch em repository; null fallback se parse falhar |

## Sources

### Primary (HIGH confidence)
- [CONTEXT.md Phase 8] — Decisões D-01 a D-12, canonical refs, padrões de rota existentes
- [ProfileRepository padrão] `/src/lib/repositories/profile-repository.ts` — interface genérica, validação path traversal
- [data-service.ts] `/src/lib/data-service.ts` — `ensureSubdir()`, validação DATA_PATH
- [package.json] — radix-ui@^1.4.3, shadcn@^4.3.0 confirmados instalados
- [data/research/ estrutura] — 4 profiles, cada um com `{date}-vagas.json` + `{date}-resumo.json`
- [exemplo resumo.json] `/data/research/2386bf16-4519-409c-9188-45068255df75/2026-04-24-resumo.json` — todos os campos verificados

### Secondary (MEDIUM confidence)
- [profile-list.tsx padrão de navegação] — verificado linhas 70 e 89-101 (click handler + stopPropagation)
- [ProfileForm padrão de componente] — LABEL_CLASS, INPUT_CLASS, seções condicionais
- [Badge component] — uso para marcação required/optional verificado

### Tertiary (LOW confidence) — Marked for Validation
- (None — todas as claims foram verificadas no código ou CONTEXT.md)

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — radix-ui + shadcn + Next.js 16 verificados em package.json e imports existentes
- Architecture: HIGH — padrão Server Component + Client Component + repositório está documentado em ProfileRepository; estrutura data/research confirmada em filesystem
- Pitfalls: MEDIUM — baseado em padrões de projeto + conhecimento geral de Next.js; sem específico desta codebase

**Research date:** 2026-04-26  
**Valid until:** 2026-05-26 (arquitetura estável; validar versões de deps a cada 30 dias)

---

*Research phase complete — ready for planning*
