# Phase 4: AI-Assisted Profile Refinement - Research

**Researched:** 2026-04-21
**Domain:** TypeScript schema migration, React list component, CLI skill authoring, string[] serialization para Excel
**Confidence:** HIGH

---

## Summary

A Phase 4 tem três entregáveis encadeados: (1) migrar 4 campos do `JobProfile` de `string` para `string[]`, zerar a base dev e atualizar toda a cadeia que consome esses campos (schema, actions, formulário, Excel generator); (2) criar a skill `/refinar-perfil` — um fluxo conversacional CLI que lê perfis existentes, sugere melhorias por modalidade e grava JSON atualizado; (3) revisar `/abrir-vaga` contra os schemas pós-Phase 3.

O código base está em excelente estado: 87 testes passando, padrão de repositório JSON claro, componentes shadcn/ui instalados, `excel-generator.ts` com injeção cirúrgica de células bem delimitada. A migração de schema é o risco mais alto porque afeta 5 pontos distintos (`profile.ts`, `actions/profile.ts`, `ProfileForm`, `excel-generator.ts`, testes de perfil) em cascata — é preciso fazer tudo numa única wave para não deixar a base quebrando.

A skill `/refinar-perfil` não tem dependências externas além do `DATA_PATH` e do agente de IA (Claude Code / Cursor). Segue o mesmo padrão da `/abrir-vaga` existente: frontmatter YAML + fluxo em markdown. O novo campo `aiProfileInstructions` em `AreaSettings` é simples — um campo `string` opcional adicionado ao schema e ao formulário de configurações.

**Recomendação principal:** Executar em 3 waves bem sequenciadas. Wave 0 atualiza testes de schema. Wave 1 faz a migração completa de string→string[] (schema + actions + UI + Excel). Wave 2 cria `/refinar-perfil` e revisa `/abrir-vaga`. Não intercalar as waves — dependências são lineares.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Wave 0 — Refatoração de Schema

- **D-01:** Os campos `responsibilities`, `qualifications`, `behaviors`, `challenges` em `JobProfile` migram de `string` para `string[]`. Cada linha de texto (bullet) vira um item do array.
- **D-02:** Estratégia de dados: zerar a base de desenvolvimento (remover profiles/, vacancies/, settings.json existentes) e recriar a partir dos arquivos em `data/examples/` (3 XLSXs de exemplo reais). Não converter JSONs antigos.
- **D-03:** O planejamento deve começar por esta refatoração antes de implementar qualquer skill de IA.
- **D-04:** A UI dos campos descritivos muda de `<Textarea>` para um componente de lista dinâmica. Claude decide a implementação seguindo padrões shadcn/ui existentes.
- **D-05:** O Excel generator serializa `string[]` → texto com bullets. Formato: `- item1\n- item2\n...`

#### Escopo das Skills

- **D-06:** Skill única `/refinar-perfil` — um comando com menu interno de modalidades.
- **D-07:** Seleção de perfil: agente lista os perfis disponíveis e o gestor escolhe.
- **D-08:** Menu de modalidades: 1. Sugerir requisitos/habilidades (IA-01) / 2. Melhorar descrição (IA-02) / 3. Refinar tudo (IA-01 + IA-02 em sequência).

#### Fluxo de Sugestão e Aceitação

- **D-09:** Apresentação antes/depois por campo — exibe conteúdo atual vs. sugerido, um campo por vez.
- **D-10:** Por campo: Aceitar / Rejeitar / Pedir ajuste (iteração até resolução).
- **D-11:** Em IA-01: o agente pode sugerir substituição completa do campo (não apenas adições).
- **D-12:** Após resolução, grava JSON atualizado diretamente em `DATA_PATH/profiles/{id}.json`.
- **D-13:** Sem backup explícito — repositório de dados é git.

#### Contexto P&D/Lyceum para IA

- **D-14:** Campo novo em `settings.json` e `/settings` web: "Instruções para IA montar perfil" (`aiProfileInstructions: string`).
- **D-15:** Aparece na página `/settings` como novo textarea.
- **D-16:** A skill `/refinar-perfil` lê `DATA_PATH/settings.json` e injeta o campo como contexto no prompt da IA.

#### Revisão da `/abrir-vaga`

- **D-17:** `/abrir-vaga` revisada e validada na Phase 4, após o `/refinar-perfil` estar funcionando.
- **D-18:** Escopo: auditar SKILL.md contra schemas atuais (Vacancy + AreaSettings). Corrigir discrepâncias. Executar em cenário real.

### Claude's Discretion

- Componente de lista dinâmica para os 4 campos descritivos na UI — implementar usando padrões shadcn/ui existentes.
- Estrutura do system prompt da `/refinar-perfil` — como injetar contexto P&D e perfil atual.
- Fluxo exato de como "Refinar tudo" sequencia entre IA-01 e IA-02.
- Ordem de apresentação dos campos quando o agente refina vários de uma vez.

### Deferred Ideas (OUT OF SCOPE)

- Integração nativa de LLM na web app (sugestões em tempo real no formulário) — IA v2.
- Sugestões automáticas ao criar perfil novo sem invocar skill — IA v2.
- `/abrir-vaga` com IA para sugerir/validar dados durante entrevista — avaliar pós-Phase 4.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IA-01 | Agente de IA pode sugerir requisitos e habilidades com base no título e contexto da vaga | Skill `/refinar-perfil` modalidade 1; campos `qualifications`, `responsibilities` migrados para string[] permitem sugestão item a item |
| IA-02 | Agente de IA pode melhorar a redação da descrição da vaga | Skill `/refinar-perfil` modalidade 2; fluxo antes/depois por campo descritivo |
| IA-03 | Agente de IA adapta textos para o contexto da área de P&D/Lyceum | Campo `aiProfileInstructions` em settings injetado no prompt da skill; lido antes de gerar qualquer sugestão |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schema migration (string→string[]) | TypeScript (src/lib) | — | `profile.ts` é a fonte de verdade; todos os outros arquivos dependem desse tipo |
| Formulário de lista dinâmica | Frontend (React component) | Server action (FormData parsing) | A UI coleta os items; a action serializa o array |
| Serialização string[] → bullets no Excel | Backend (excel-generator.ts) | — | Transformação pura antes de injetar na célula; sem estado de UI |
| Skill `/refinar-perfil` | CLI / arquivo SKILL.md | DATA_PATH (sistema de arquivos) | Skill é executada pelo agente de IA no terminal; persiste JSON no volume de dados |
| Campo `aiProfileInstructions` | settings.ts (schema) + SettingsForm (UI) | SettingsRepository (persistência) | Segue o mesmo padrão dos outros campos de AreaSettings |
| Revisão `/abrir-vaga` | SKILL.md (documentação de skill) | — | Atualização de texto/fluxo; sem impacto em código TypeScript |
| Zeragem da base dev | Dados (data/) | — | Remoção manual de arquivos JSON antigos; não é código |

---

## Standard Stack

### Core (verificado no codebase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | Detectado em tsconfig | Tipagem estática | Toda a base usa TypeScript; schema é interface TypeScript |
| React 19 | package.json | UI dinâmica | Stack do projeto (`"react": "^19"`) |
| Next.js (App Router) | 15+ | Server actions, rotas | Padrão estabelecido em todas as fases anteriores |
| shadcn/ui | Componentes em src/components/ui/ | Componentes UI | Input, Label, Button, Textarea já instalados e usados |
| Vitest 3.2.4 | Detectado no output de testes | Testes unitários | Configurado em `vitest.config.ts`; 87 testes passando |

[VERIFIED: codebase grep + npm test output]

### Componentes shadcn/ui disponíveis (sem instalação adicional)

| Componente | Arquivo | Uso na Phase 4 |
|------------|---------|----------------|
| `Input` | `src/components/ui/input.tsx` | Input de cada item da lista dinâmica |
| `Button` | `src/components/ui/button.tsx` | Botões "+" adicionar e "×" remover na lista |
| `Label` | `src/components/ui/label.tsx` | Label do campo de lista |
| `Textarea` | `src/components/ui/textarea.tsx` | Novo campo `aiProfileInstructions` em SettingsForm |

[VERIFIED: codebase - src/components/ui/]

### Dependências externas — nenhuma nova

Esta fase não requer instalação de novos pacotes npm. Toda a funcionalidade usa bibliotecas já presentes no projeto.

[VERIFIED: análise do escopo da fase]

---

## Architecture Patterns

### System Architecture Diagram

```
WAVE 0: Testes
  profile.test.ts (atualizar tipos string[])
  excel-generator.test.ts (atualizar serialização)
         ↓
WAVE 1: Migração de Schema
  src/lib/profile.ts
    ↓ (tipo string[])
  src/app/actions/profile.ts
    ↓ (FormData → string[] parsing)       ↓ (string[] → bullets)
  src/components/profile/profile-form.tsx  src/lib/excel-generator.ts
    (DynamicListField × 4)                  (serializeStringArray helper)
         ↓
  DATA_PATH/profiles/*.json (zeragem manual + recriação)
  src/lib/settings.ts + SettingsForm + actions/settings.ts
    (adicionar aiProfileInstructions)
         ↓
WAVE 2: Skills CLI
  .agents/skills/refinar-perfil/SKILL.md (novo)
    lê → DATA_PATH/profiles/*.json
    lê → DATA_PATH/settings.json (aiProfileInstructions)
    sugere → fluxo antes/depois por campo
    grava → DATA_PATH/profiles/{id}.json

  .agents/skills/abrir-vaga/SKILL.md (revisão)
    audit → src/lib/vacancy.ts + src/lib/settings.ts
    corrigir → campos migrados para AreaSettings (GAP-12)
    validar → cenário real de abertura de vaga
```

### Estrutura de arquivos nova/modificada

```
src/
├── lib/
│   ├── profile.ts                  # MODIFICAR: string → string[] em 4 campos
│   ├── settings.ts                 # MODIFICAR: + aiProfileInstructions?: string
│   └── excel-generator.ts          # MODIFICAR: serializeStringArray() helper
├── app/actions/
│   └── profile.ts                  # MODIFICAR: FormData.getAll() para arrays
├── components/
│   ├── profile/
│   │   └── profile-form.tsx        # MODIFICAR: 4 Textarea → DynamicListField
│   ├── settings/
│   │   └── settings-form.tsx       # MODIFICAR: + novo textarea aiProfileInstructions
│   └── ui/
│       └── dynamic-list-field.tsx  # NOVO: componente de lista dinâmica
.agents/skills/
├── abrir-vaga/
│   └── SKILL.md                    # REVISAR: auditar contra schemas atuais
└── refinar-perfil/
    └── SKILL.md                    # NOVO: skill de IA
```

### Padrão 1: Componente de lista dinâmica (DynamicListField)

**O que é:** Componente React cliente que renderiza uma lista de inputs, um por item de `string[]`, com botões para adicionar e remover itens. Persiste via `input[type=hidden]` com o mesmo `name` (FormData aceita múltiplos valores com o mesmo `name` — `formData.getAll(name)` retorna `string[]`).

**Quando usar:** Campos `responsibilities`, `qualifications`, `behaviors`, `challenges` no `ProfileForm`.

**Implementação recomendada:**

```typescript
// src/components/ui/dynamic-list-field.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DynamicListFieldProps {
  name: string;        // nome do campo para FormData
  label: string;
  initialItems?: string[];
  required?: boolean;
  labelClassName?: string;
}

export function DynamicListField({
  name, label, initialItems = [""], required, labelClassName,
}: DynamicListFieldProps) {
  const [items, setItems] = useState<string[]>(
    initialItems.length > 0 ? initialItems : [""]
  );

  const update = (index: number, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? value : item));
  };
  const add = () => setItems(prev => [...prev, ""]);
  const remove = (index: number) => {
    if (items.length === 1) return; // manter ao menos 1 item
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <Label className={labelClassName}>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            {/* hidden input envia o valor via FormData com name repetido */}
            <input type="hidden" name={name} value={item} />
            <Input
              value={item}
              onChange={e => update(index, e.target.value)}
              required={required && index === 0}
              className="flex-1 rounded-sm bg-surface-container-low
                         focus-visible:bg-surface-container-lowest
                         focus-visible:border-b-2 focus-visible:border-b-tertiary"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              disabled={items.length === 1}
              className="rounded-sm shrink-0"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="rounded-sm text-[0.75rem] h-8 px-3"
        >
          + Adicionar item
        </Button>
      </div>
    </div>
  );
}
```

[ASSUMED — padrão derivado dos componentes existentes; nenhuma API externa]

### Padrão 2: Parsing de string[] via FormData

**O que é:** A server action usa `formData.getAll(fieldName)` (retorna `string[]`) em vez de `formData.get()` (retorna `string | null`).

```typescript
// src/app/actions/profile.ts (trecho relevante)
responsibilities: (formData.getAll("responsibilities") as string[])
  .map(s => s.trim())
  .filter(Boolean),
qualifications: (formData.getAll("qualifications") as string[])
  .map(s => s.trim())
  .filter(Boolean),
behaviors: (formData.getAll("behaviors") as string[])
  .map(s => s.trim())
  .filter(Boolean),
challenges: (formData.getAll("challenges") as string[])
  .map(s => s.trim())
  .filter(Boolean),
```

[VERIFIED: comportamento padrão da Web FormData API — `getAll()` retorna array de todos os valores com o mesmo name]

### Padrão 3: Serialização string[] → bullets no Excel

**O que é:** Helper puro adicionado ao `excel-generator.ts` que converte `string[]` para o formato de texto com bullets que vai na célula do Excel.

```typescript
// src/lib/excel-generator.ts
export function serializeStringArray(items: string[]): string {
  if (!items || items.length === 0) return "";
  return items.map(item => `- ${item}`).join("\n");
}
```

Uso no mapa de células:
```typescript
[CELL_MAPPING.responsibilities]: serializeStringArray(profile.responsibilities),
[CELL_MAPPING.qualifications]:   serializeStringArray(profile.qualifications),
[CELL_MAPPING.behaviors]:        serializeStringArray(profile.behaviors),
[CELL_MAPPING.challenges]:       serializeStringArray(profile.challenges),
```

[VERIFIED: D-05 do CONTEXT.md define formato `- item1\n- item2\n...`]

### Padrão 4: Estrutura da skill `/refinar-perfil`

**O que é:** Arquivo SKILL.md com frontmatter YAML e fluxo em markdown. Segue o padrão da `/abrir-vaga` existente.

**Estrutura de fluxo:**

```
Step 1: Listar perfis disponíveis
  ls $DATA_PATH/profiles/*.json → exibir títulos numerados
  → gestor escolhe um número

Step 2: Carregar perfil + settings
  cat $DATA_PATH/profiles/{id}.json
  cat $DATA_PATH/settings.json  (extrair aiProfileInstructions)

Step 3: Menu de modalidades
  1. Sugerir requisitos/habilidades (IA-01) → campos: responsibilities, qualifications
  2. Melhorar descrição (IA-02) → campos: behaviors, challenges
  3. Refinar tudo → modalidade 1 seguida de modalidade 2

Step 4: Loop por campo selecionado
  Para cada campo:
    a. Exibir ANTES (conteúdo atual como lista de bullets)
    b. Gerar sugestão de IA (usando aiProfileInstructions + título + contexto)
    c. Exibir DEPOIS (sugestão como lista de bullets)
    d. Menu: [A]ceitar / [R]ejeitar / [J]ustar (iterar c-d até resolução)
    e. Aplicar decisão ao objeto de perfil em memória

Step 5: Gravar JSON atualizado
  node -e "..." → escrever {id}.json atualizado em DATA_PATH/profiles/

Step 6: Confirmar
  Exibir resumo dos campos alterados
```

[ASSUMED — estrutura derivada do padrão `/abrir-vaga` e das decisões D-06 a D-13]

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez disso | Por quê |
|----------|--------------|-------------------|---------|
| Parsing de múltiplos valores de form | Loop manual sobre FormData | `formData.getAll(name)` | Comportamento padrão da Web API; já funciona com `<input name="x" />` repetidos |
| Gerar UUID para perfil | `Math.random()` | `crypto.randomUUID()` (já em uso) | Já existe `generateProfileId()` em `profile.ts` |
| Persistência JSON | `fs.writeFileSync` direto em actions | `profileRepository.save()` | Padrão de repositório estabelecido — actions nunca chamam `fs.*` diretamente |
| Leitura de settings na skill | JSON.parse manual | `cat $DATA_PATH/settings.json` + parsing inline do agente | Skill é CLI; não tem acesso ao repositório TypeScript |
| Backup antes de editar | Arquivo .bak manual | git (D-13) | DATA_PATH é repositório git; `git log` tem histórico completo |

---

## Runtime State Inventory

> Esta fase inclui zeragem da base de desenvolvimento (D-02) — inventário completo obrigatório.

| Categoria | Itens encontrados | Ação necessária |
|-----------|------------------|-----------------|
| Stored data (profiles) | 2 perfis em `data/profiles/` (UUIDs: 21707edc, 6b3bbc18) — dados de teste fictícios | Remoção manual de ambos os arquivos .json antes de recriar com os 3 XLSXs reais |
| Stored data (vacancies) | 1 vaga em `data/vacancies/` (UUID: 5adcb093) — referencia profile 21707edc | Remoção manual; a vaga ficará órfã após zeragem do perfil |
| Stored data (settings) | `data/settings.json` existente — dados de teste; campo `aiProfileInstructions` ainda não existe | Remoção manual (será recriado com valores reais na configuração inicial) |
| Live service config | Nenhum serviço externo com estado runtime | Não aplicável |
| OS-registered state | Nenhum (sem Task Scheduler, pm2, systemd) | Não aplicável |
| Secrets/env vars | `DATA_PATH` aponta para `data/` (symlink dev) — o caminho muda, não o nome da variável | Nenhuma ação — após zeragem, basta recriar arquivos no mesmo path |
| Build artifacts | Nenhum egg-info, binário compilado ou pacote instalado com nome do perfil | Nenhuma ação |

**Sequência correta de zeragem (D-02):**

```bash
# 1. Remover dados de teste
rm data/profiles/21707edc-ced6-464c-9126-c7bfbc848f27.json
rm data/profiles/6b3bbc18-8a5f-4eb4-a918-8d7e4190173a.json
rm data/vacancies/5adcb093-e148-45c9-9157-a17116f9f0ca.json
rm data/settings.json

# 2. Recriar profiles usando os 3 XLSXs de data/examples/ via web app ou skill
# 3. Recriar settings.json com valores reais via /settings na web app
```

**Nota:** O campo `aiProfileInstructions` não existe ainda no settings.json atual. O campo é novo e será adicionado via atualização do schema + formulário web. O settings.json atual será removido na zeragem e recriado com o campo disponível.

---

## Common Pitfalls

### Pitfall 1: Quebrar o ProfileForm com hidden inputs duplicados

**O que acontece:** O `DynamicListField` precisa de `<input type="hidden" name={field} value={item} />` para cada item do array. Se o componente também renderizar um `<Input>` com `name={field}` (em vez de só `value` controlado), o FormData vai capturar tanto os hidden inputs quanto os inputs visíveis, duplicando cada item.

**Por que acontece:** O `Input` visível é controlado — não deve ter `name`; o `name` só vai no hidden input.

**Como evitar:** O `Input` visível usa apenas `value` + `onChange` (sem `name`). Somente o `<input type="hidden" name={name} value={item} />` é nomeado.

**Sinais de alerta:** Action recebe array com o dobro dos itens; testes de snapshot do formulário.

### Pitfall 2: profile.test.ts vai quebrar com a mudança de tipo

**O que acontece:** O teste `"Interface JobProfile — pode ser instanciada com todos os campos obrigatórios"` atualmente define `responsibilities: "Desenvolver APIs REST"` (string). Após a migração, o tipo esperado é `string[]` e o TypeScript vai rejeitar.

**Por que acontece:** Os testes foram escritos antes da migração de schema.

**Como evitar:** Wave 0 atualiza os testes ANTES de mudar o schema — assim a falha de compilação é intencional e guiada.

**Sinais de alerta:** `npm test` falha com erro de tipo após mudança de schema sem atualização dos testes.

### Pitfall 3: excel-generator.ts usa `profile.responsibilities` diretamente como string

**O que acontece:** O `excel-generator.ts` atual tem `[CELL_MAPPING.responsibilities]: profile.responsibilities ?? ""`. Após a migração, `profile.responsibilities` é `string[]` — o TypeScript vai aceitar (sem erro imediato), mas o Excel vai receber `"- item1,- item2"` (toString implícito do array), não o formato de bullet correto.

**Por que acontece:** O JavaScript converte `string[]` para string com vírgula quando interpolado em string context.

**Como evitar:** Adicionar o helper `serializeStringArray()` e usar em todos os 4 campos descritivos. Wave 1 inclui obrigatoriamente a atualização do excel-generator junto com o schema.

**Sinais de alerta:** Excel gerado com vírgulas em vez de quebras de linha nos campos descritivos.

### Pitfall 4: /abrir-vaga SKILL.md ainda menciona campos migrados para AreaSettings

**O que acontece:** O SKILL.md atual do `/abrir-vaga` tem Steps 3 e 4 coletando `costCenter`, `workSchedule`, `workMode`, `travelRequired` como campos da vaga — mas esses campos foram migrados para `AreaSettings` na Phase 3 (GAP-12). A skill escreve esses campos no JSON da vaga, criando inconsistência.

**Por que acontece:** A skill foi escrita antes da migração GAP-12 da Phase 3.

**Como evitar:** Wave 2 audita explicitamente o SKILL.md linha a linha contra `vacancy.ts` e `settings.ts` atuais. Campos em `Vacancy` mas não mais coletados: `costCenter`, `workSchedule`, `workScheduleOther`, `travelRequired`, `workMode` — todos devem ser removidos do fluxo de coleta e substituídos por leitura de `settings.json`.

**Sinais de alerta:** Vaga criada pela skill tem `costCenter` no JSON mas o campo não é mais lido pelo formulário web.

### Pitfall 5: DynamicListField com initialItems vazio

**O que acontece:** Ao criar um perfil novo (sem dados existentes), `initialItems` é `undefined` ou `[]`. Se o componente inicializar com array vazio, o formulário renderiza sem nenhum input e o gestor não consegue digitar.

**Por que acontece:** O estado inicial `[""]` garante ao menos um input vazio para o gestor começar.

**Como evitar:** `const [items, setItems] = useState(initialItems?.length > 0 ? initialItems : [""])`. Sempre inicializar com ao menos um item vazio.

### Pitfall 6: serializeStringArray com items vazios no Excel

**O que acontece:** Se o gestor deixar um input de item em branco no DynamicListField e a action não filtrar, o array vai conter strings vazias. O Excel vai receber `"- \n- item2"`, com bullet vazio.

**Por que acontece:** `formData.getAll()` retorna todos os valores incluindo vazios.

**Como evitar:** Na action: `.filter(Boolean)`. No helper de serialização: também filtrar antes de mapear para bullets.

---

## Code Examples

### Schema atualizado (perfil)

```typescript
// src/lib/profile.ts — campos descritivos migrados
export interface JobProfile {
  // ... campos anteriores preservados ...
  responsibilities: string[];   // era: string
  qualifications: string[];     // era: string
  behaviors: string[];          // era: string
  challenges: string[];         // era: string
  // internalNotes permanece string (campo de texto livre, não lista)
  internalNotes?: string;
}
```

### Settings com novo campo

```typescript
// src/lib/settings.ts — adicionar campo
export interface AreaSettings {
  // ... campos existentes preservados ...
  aiProfileInstructions?: string; // NOVO — instruções para IA montar perfil
}

// defaultSettings() — adicionar default:
export function defaultSettings(): AreaSettings {
  return {
    // ... existentes ...
    aiProfileInstructions: "",   // NOVO
  };
}
```

### Trecho de SKILL.md para /refinar-perfil

```markdown
---
name: refinar-perfil
description: |
  Abre um perfil de vaga existente e oferece sugestões de IA para melhorar
  requisitos, habilidades e descrições. Salva o JSON atualizado em
  DATA_PATH/profiles/. Use quando o gestor quiser enriquecer um perfil
  existente com sugestões contextualizadas para P&D/Lyceum.
command: /refinar-perfil
---

## Pre-Conditions

- DATA_PATH environment variable set
- At least one job profile in DATA_PATH/profiles/*.json
- DATA_PATH/settings.json exists with aiProfileInstructions (opcional)

## Step 1: Listar perfis disponíveis

...

## Step 2: Carregar perfil e contexto

cat $DATA_PATH/profiles/{id}.json
cat $DATA_PATH/settings.json

Extrair:
- aiProfileInstructions (contexto P&D para injetar no prompt)
- Todos os campos do perfil (responsibilities[], qualifications[], etc.)

## Step 3: Menu de modalidades

Exibir:
  1. Sugerir requisitos e habilidades
  2. Melhorar descrições (responsabilidades, desafios, competências)
  3. Refinar tudo (1 → 2 em sequência)

## Step 4: Fluxo antes/depois por campo

Para cada campo relevante à modalidade escolhida:
  ANTES: exibir array atual como lista numerada
  [geração IA com aiProfileInstructions + título do cargo + contexto]
  DEPOIS: exibir sugestão como lista numerada
  Opções: [A]ceitar / [R]ejeitar / [J]ustar

## Step 5: Gravar resultado

node -e "
const fs = require('fs');
const p = require('$DATA_PATH/profiles/{id}.json');
p.responsibilities = {array_final};
p.updatedAt = new Date().toISOString();
fs.writeFileSync('$DATA_PATH/profiles/{id}.json', JSON.stringify(p, null, 2));
"
```

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|----------------|-------------|---------|
| `responsibilities: string` (textarea livre) | `responsibilities: string[]` (lista de bullets) | Phase 4 | UI mais estruturada; Excel com bullets; skill de IA pode sugerir/rejeitar item a item |
| Sem campo de instruções para IA | `aiProfileInstructions` em AreaSettings | Phase 4 | Permite contextualização por área sem hardcode no prompt |
| `/abrir-vaga` coleta workSchedule, costCenter da vaga | Esses campos vêm de settings.json (GAP-12) | Phase 3 (GAP-12) | SKILL.md precisa ser atualizado para refletir essa migração |

---

## Open Questions

1. **Inicialização dos perfis de dev com os XLSXs de exemplo**
   - O que sabemos: há 3 XLSXs em `data/examples/` (cientista-dados, dev-frontend-pleno, dev-java-pleno)
   - O que está incerto: esses XLSXs são lidos pelo sistema? O Excel generator lê o template, não cria perfis a partir de XLSXs.
   - Recomendação: A "recriação a partir de data/examples/" mencionada no CONTEXT.md significa criar os perfis manualmente no formulário web usando esses XLSXs como referência de conteúdo — não importação automática. O plano deve incluir uma task de operador para essa criação manual pós-zeragem.

2. **Compatibilidade backward dos JSONs antigos após migração de schema**
   - O que sabemos: D-02 decide zerar a base dev (não converter). Mas em prod o volume terá JSONs antigos com `responsibilities: string`.
   - O que está incerto: não há ambiente de produção ativo ainda (v1 ainda não foi lançado). A zeragem cobre o único ambiente existente.
   - Recomendação: Documentar no PLAN que a zeragem é suficiente para o momento. Se em algum ponto houver necessidade de migração de dados, implementar uma função de migração simples (`s.split("\n").filter(Boolean)`) — mas não é necessário agora.

3. **Como o DynamicListField hydrata dados do perfil existente**
   - O que sabemos: `ProfileForm` recebe `profile?: JobProfile` como prop. Após a migração, `profile.responsibilities` será `string[]`.
   - O que está incerto: `defaultValue` do Textarea atual precisa virar `initialItems` do DynamicListField.
   - Recomendação: `<DynamicListField name="responsibilities" initialItems={profile?.responsibilities ?? []} />` — direto e sem conversão.

---

## Environment Availability

| Dependência | Requerida por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| Node.js | Skill scripts (`node -e "..."`) | ✓ | Detectado no ambiente | — |
| DATA_PATH | Skill `/refinar-perfil` + `/abrir-vaga` | ✓ | Symlink para `data/` em dev | — |
| data/examples/*.xlsx | Recriação dos perfis dev | ✓ | 3 arquivos presentes | — |
| git (repositório de dados) | Backup implícito (D-13) | ✓ | — | — |
| Agente de IA (Claude Code / Cursor) | Execução da skill em si | ✓ | — | Operador executa manualmente |

[VERIFIED: ls data/examples/ + npm test output]

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run | `npm test` |
| Full suite | `npm test` (todos os 87 testes em ~4.5s) |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo | Comando automatizado | Arquivo existe? |
|--------|--------------|------|---------------------|-----------------|
| IA-01 | Skill lista perfis e oferece modalidade 1 | manual-only | — (skill é CLI conversacional) | N/A |
| IA-02 | Skill apresenta before/after por campo | manual-only | — (skill é CLI conversacional) | N/A |
| IA-03 | Skill injeta aiProfileInstructions no prompt | manual-only | — (skill é CLI conversacional) | N/A |
| D-01 (schema) | `responsibilities` é `string[]` no tipo `JobProfile` | unit | `npm test -- src/__tests__/profile.test.ts` | ✅ existe (precisa atualização) |
| D-01 (action) | `createProfile` parseia array via `getAll()` | unit | novo test | ❌ Wave 0 |
| D-05 (excel) | `serializeStringArray(["a","b"])` retorna `"- a\n- b"` | unit | `npm test -- src/__tests__/excel-generator.test.ts` | ✅ existe (precisa caso novo) |
| D-14 (settings) | `AreaSettings.aiProfileInstructions` aceita string | unit | `npm test -- src/__tests__/settings.test.ts` | ✅ existe (precisa atualização) |

**Nota sobre skills CLI:** As skills IA-01, IA-02, IA-03 são conversacionais e só podem ser validadas manualmente. O critério de aceitação é: executar `/refinar-perfil` num perfil real, aceitar ao menos uma sugestão, confirmar que o JSON foi atualizado corretamente em `DATA_PATH/profiles/{id}.json`.

### Sampling Rate

- **Por commit de task:** `npm test` (full suite — 4.5s, rápido o suficiente)
- **Por wave merge:** `npm test && npm run typecheck`
- **Phase gate:** Suite green + validação manual da skill antes de `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/profile.test.ts` — atualizar: tipos `string[]` nos 4 campos descritivos, remover testes de campos migrados para AreaSettings (`englishLevel`, `additionalInfo`, etc.)
- [ ] `src/__tests__/excel-generator.test.ts` — adicionar caso: `serializeStringArray` retorna bullets corretos
- [ ] `src/__tests__/settings.test.ts` — adicionar caso: `AreaSettings` aceita campo `aiProfileInstructions`

---

## Security Domain

> `security_enforcement` não configurado explicitamente em config.json — tratado como habilitado.

### Applicable ASVS Categories

| ASVS Category | Aplica | Controle padrão |
|---------------|--------|----------------|
| V2 Authentication | Não (nenhuma mudança de auth nesta fase) | next-auth (existente) |
| V3 Session Management | Não | next-auth (existente) |
| V4 Access Control | Não | Single-user, sem mudança |
| V5 Input Validation | Sim | `formData.getAll().map(s => s.trim()).filter(Boolean)` na action |
| V6 Cryptography | Não | Sem novas operações criptográficas |

### Known Threat Patterns for this stack

| Padrão | STRIDE | Mitigação padrão |
|--------|--------|----------------|
| Path traversal via profile ID na skill | Tampering | `JsonProfileRepository.profilePath()` já valida ID (bloqueia `..`, `/`, `\`) — skill deve usar somente IDs listados pelo `ls` |
| Injeção via `aiProfileInstructions` no prompt | Tampering | Conteúdo é dados do usuário único (single-user app); risco baixo. Campo é texto livre injetado no prompt do agente — sem avaliação de código |
| Sobrescrita de arquivo JSON na skill via ID manipulado | Tampering | Skill deve validar que o ID escolhido existe na lista antes de gravar |

---

## Project Constraints (from CLAUDE.md)

- **Idioma:** Conteúdo escrito em pt-BR; nomes de arquivos e código em inglês
- **Kebab-case:** Todos os arquivos e pastas (ex: `dynamic-list-field.tsx`)
- **Commits:** Nunca automáticos — sempre via `/commit-push` com aprovação do operador
- **Skill pattern:** Frontmatter YAML + fluxo em markdown em `.agents/skills/{name}/SKILL.md`
- **Repository pattern:** Actions nunca chamam `fs.*` diretamente — sempre via repositório
- **No-Line Rule:** Separação por tonalidade de superfície, não por bordas
- **8px grid:** Espaçamentos múltiplos de 8px (ou 4px para micro-ajustes)

---

## Assumptions Log

| # | Afirmação | Seção | Risco se errado |
|---|-----------|-------|----------------|
| A1 | `DynamicListField` usando `<input type="hidden">` com `name` repetido é compatível com Next.js Server Actions + `useActionState` | Architecture Patterns | Se não funcionar, precisaria de abordagem alternativa (JSON serializado num campo único, ou hook customizado de formulário) — alto impacto na Wave 1 |
| A2 | Os 3 XLSXs de `data/examples/` servem como referência de conteúdo para preencher os perfis manualmente (não são importados automaticamente) | Open Questions | Se houver importação automatizada esperada, o plano precisaria incluir uma task de parsing dos XLSXs |
| A3 | A skill `/refinar-perfil` usa `node -e "..."` para gravar o JSON sem problemas de escape de caracteres em conteúdo com aspas, newlines, etc. | Architecture Patterns | Em conteúdo complexo, o heredoc shell pode ter problemas de escape. Alternativa: gerar um arquivo .js temporário e executá-lo |
| A4 | A remoção de `data/settings.json` na zeragem não quebra nenhum teste existente | Runtime State Inventory | `settings.test.ts` usa `DATA_PATH` mockado em tmpdir — não afetado. Risco baixo. |

**Nota sobre A1:** `FormData.getAll()` é comportamento padrão da Web API e Next.js App Router. A API está documentada e amplamente usada. A implementação proposta é idiomática. [CITED: MDN Web Docs FormData.getAll()]

---

## Sources

### Primary (HIGH confidence)

- Codebase — `src/lib/profile.ts` — tipos atuais de JobProfile (todos os 4 campos confirmados como `string`)
- Codebase — `src/lib/settings.ts` — estrutura atual de AreaSettings (campo `aiProfileInstructions` ainda não existe)
- Codebase — `src/lib/excel-generator.ts` — mapa de células e lógica de injeção atual
- Codebase — `src/app/actions/profile.ts` — pattern de `extractProfileData` com `formData.get()`
- Codebase — `src/components/profile/profile-form.tsx` — 4 `<Textarea>` atuais nos campos descritivos
- Codebase — `src/components/settings/settings-form.tsx` — estrutura de seções do formulário de settings
- Codebase — `.agents/skills/abrir-vaga/SKILL.md` — padrão de skill e discrepâncias com schemas atuais
- npm test output — 87 testes passando em Vitest 3.2.4

### Secondary (MEDIUM confidence)

- MDN Web Docs — `FormData.getAll()` retorna `string[]` para múltiplos inputs com mesmo name [CITED]
- CONTEXT.md Phase 4 — decisões D-01 a D-18 definidas pelo operador

### Tertiary (LOW confidence)

- Nenhum item de confiança baixa — todas as afirmações verificadas no codebase ou nas decisões do CONTEXT.md

---

## Metadata

**Confidence breakdown:**

- Schema migration: HIGH — código existente lido diretamente; mudança de tipo é cirúrgica e bem delimitada
- Architecture patterns: HIGH — padrão derivado de código existente verificado; `formData.getAll()` é Web API padrão
- DynamicListField implementation: MEDIUM — padrão é idiomático mas não testado no projeto específico
- Skill `/refinar-perfil`: MEDIUM — estrutura derivada da skill existente `/abrir-vaga`; conteúdo do prompt depende do agente
- Pitfalls: HIGH — identificados a partir de análise direta do código atual

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stack estável; sem dependências externas a mudar)
