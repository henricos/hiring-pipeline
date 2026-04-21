# Phase 4: AI-Assisted Profile Refinement — Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 9
**Analogs found:** 8 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/profile.ts` | model | transform | `src/lib/settings.ts` | exact (mesmo arquivo de schema TypeScript com interface + defaultFn) |
| `src/lib/settings.ts` | model | CRUD | próprio arquivo (adição de campo) | exact |
| `src/lib/excel-generator.ts` | utility | transform | próprio arquivo (adição de helper puro) | exact |
| `src/app/actions/profile.ts` | service | request-response | próprio arquivo (ajuste de parsing) | exact |
| `src/components/profile/profile-form.tsx` | component | request-response | próprio arquivo (troca de Textarea→DynamicListField) | exact |
| `src/components/settings/settings-form.tsx` | component | request-response | próprio arquivo (adição de textarea) | exact |
| `src/components/ui/dynamic-list-field.tsx` | component | event-driven | `src/components/ui/input.tsx` + `src/components/ui/button.tsx` | role-match (componentes shadcn existentes como base) |
| `.agents/skills/refinar-perfil/SKILL.md` | utility | event-driven | `.agents/skills/abrir-vaga/SKILL.md` | exact (mesmo padrão de skill CLI) |
| `.agents/skills/abrir-vaga/SKILL.md` | utility | event-driven | próprio arquivo (revisão/auditoria) | exact |

---

## Pattern Assignments

### `src/lib/profile.ts` (model, transform)

**Analog:** `src/lib/settings.ts` e o próprio arquivo

**Padrão de campo migrado** (ver `src/lib/profile.ts` linhas 43-48 — ESTADO ATUAL a ser alterado):
```typescript
// ANTES (linhas 44-47 do arquivo atual):
responsibilities: string; // Responsabilidades e atribuições
qualifications: string;   // Requisitos e qualificações (obrigatórios + diferenciais)
behaviors: string;        // Características e competências comportamentais
challenges: string;       // Principais desafios

// DEPOIS (D-01):
responsibilities: string[]; // Responsabilidades e atribuições
qualifications: string[];   // Requisitos e qualificações (obrigatórios + diferenciais)
behaviors: string[];        // Características e competências comportamentais
challenges: string[];       // Principais desafios
```

**Referência de comentário de migração** (padrão já usado no mesmo arquivo, linhas 39-42):
```typescript
englishLevel?: LanguageLevel; // opcional — migrado para AreaSettings (GAP-12)
spanishLevel?: LanguageLevel; // opcional — migrado para AreaSettings (GAP-12)
```
Usar comentário análogo para documentar a mudança de tipo: `// string[] desde Phase 4 (D-01)`.

**Impacto em testes** — `src/__tests__/profile.test.ts` linhas 165-168 e 195-199 têm valores `string` para esses campos; precisam virar `string[]`:
```typescript
// profile.test.ts linha 165 — ANTES:
responsibilities: "Desenvolver APIs REST",
// DEPOIS:
responsibilities: ["Desenvolver APIs REST"],
```

---

### `src/lib/settings.ts` (model, CRUD)

**Analog:** próprio arquivo

**Padrão de adição de campo opcional** (linhas 1-57, padrão de comentário em bloco):
```typescript
// ── Dados da Área (existentes) ────────────────────────────────
// (campos existentes)

// ── [Nova categoria] ──────────────────────────────────────────
aiProfileInstructions?: string;  // NOVO — instruções para IA montar perfil
```

**Padrão de defaultSettings()** (linhas 37-57 — ADICIONAR ao final antes do `}`):
```typescript
export function defaultSettings(): AreaSettings {
  return {
    // ... campos existentes preservados ...
    aiProfileInstructions: "",  // NOVO — default vazio
  };
}
```

**Cabeçalho de bloco** (linha 21-34 — padrão exato de separação visual com `// ── Texto ───`):
```typescript
// ── Instruções para IA (Phase 4) ─────────────────────────────
aiProfileInstructions?: string;
```

---

### `src/lib/excel-generator.ts` (utility, transform)

**Analog:** próprio arquivo

**Padrão de helper puro exportado** (linhas 10-17 e 23-30 — `escapeXml` e `toExcelDate` são o padrão):
```typescript
// src/lib/excel-generator.ts linhas 10-17 — padrão de helper puro:
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    // ...
}

// NOVO helper a adicionar após toExcelDate (linha 30):
export function serializeStringArray(items: string[]): string {
  if (!items || items.length === 0) return "";
  return items
    .filter(Boolean)
    .map(item => `- ${item}`)
    .join("\n");
}
```

**Padrão de uso no mapa de células** (linhas 362-365 — onde os 4 campos são atribuídos):
```typescript
// src/lib/excel-generator.ts linhas 362-365 — ANTES:
[CELL_MAPPING.responsibilities]: profile.responsibilities ?? "",
[CELL_MAPPING.qualifications]:   profile.qualifications ?? "",
[CELL_MAPPING.behaviors]:        profile.behaviors ?? "",
[CELL_MAPPING.challenges]:       profile.challenges ?? "",

// DEPOIS:
[CELL_MAPPING.responsibilities]: serializeStringArray(profile.responsibilities),
[CELL_MAPPING.qualifications]:   serializeStringArray(profile.qualifications),
[CELL_MAPPING.behaviors]:        serializeStringArray(profile.behaviors),
[CELL_MAPPING.challenges]:       serializeStringArray(profile.challenges),
```

**Padrão de teste do helper** (ver `src/__tests__/excel-generator.test.ts` linhas 16-42 — padrão `describe`/`it` existente para `escapeXml`):
```typescript
describe("serializeStringArray", () => {
  it('retorna "- a\\n- b" para ["a", "b"]', () => {
    expect(serializeStringArray(["a", "b"])).toBe("- a\n- b");
  });
  it("filtra itens vazios", () => {
    expect(serializeStringArray(["a", "", "b"])).toBe("- a\n- b");
  });
  it("retorna string vazia para array vazio", () => {
    expect(serializeStringArray([])).toBe("");
  });
});
```

---

### `src/app/actions/profile.ts` (service, request-response)

**Analog:** próprio arquivo

**Padrão de parsing atual** (linhas 36-44 — `formData.get()` → `string`):
```typescript
// src/app/actions/profile.ts linhas 36-44 — ANTES:
responsibilities:
  (formData.get("responsibilities") as string | null)?.trim() ?? "",
qualifications:
  (formData.get("qualifications") as string | null)?.trim() ?? "",
behaviors: (formData.get("behaviors") as string | null)?.trim() ?? "",
challenges: (formData.get("challenges") as string | null)?.trim() ?? "",
```

**Padrão a adotar** (D-03 do RESEARCH.md — `formData.getAll()` → `string[]`):
```typescript
// DEPOIS — usa getAll() + trim + filter:
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

**Padrão de error handling** (linhas 49-71 — try/catch com `{ error: string }` no return):
```typescript
try {
  await profileRepository.save(profile);
} catch {
  return { error: "Não foi possível salvar o perfil. Tente novamente." };
}
redirect("/profiles");
```

---

### `src/components/profile/profile-form.tsx` (component, request-response)

**Analog:** próprio arquivo

**Padrão de Textarea atual nos 4 campos** (linhas 278-328 — a substituir):
```typescript
// src/components/profile/profile-form.tsx linhas 278-289 — padrão ANTES:
<div className="space-y-1.5">
  <Label htmlFor="responsibilities" className={LABEL_CLASS}>
    Responsabilidades e atribuições
  </Label>
  <Textarea
    id="responsibilities"
    name="responsibilities"
    required
    defaultValue={profile?.responsibilities ?? ""}
    className={`${INPUT_CLASS} min-h-[120px] resize-y`}
  />
</div>
```

**Padrão DynamicListField a usar** (referência no RESEARCH.md — substituição direta):
```typescript
// DEPOIS — importar DynamicListField e usar:
import { DynamicListField } from "@/components/ui/dynamic-list-field";

// No lugar de cada Textarea:
<DynamicListField
  name="responsibilities"
  label="Responsabilidades e atribuições"
  initialItems={profile?.responsibilities ?? []}
  required
  labelClassName={LABEL_CLASS}
/>
```

**Padrão de import block** (linhas 1-23 — adicionar DynamicListField; remover Textarea se não usado em outro lugar):
```typescript
// Linha 16 atual:
import { Textarea } from "@/components/ui/textarea";
// Substituir por (ou adicionar):
import { DynamicListField } from "@/components/ui/dynamic-list-field";
// Atenção: Textarea ainda é usada em internalNotes (linha 343) — manter o import
```

---

### `src/components/settings/settings-form.tsx` (component, request-response)

**Analog:** próprio arquivo

**Padrão de textarea existente no formulário** (linhas 147-154 — `teamComposition`):
```typescript
// src/components/settings/settings-form.tsx linhas 147-154 — padrão de textarea com hint:
<div className="space-y-1.5">
  <Label htmlFor="teamComposition" className={LABEL_CLASS}>
    Composição da equipe
  </Label>
  <p className="text-[0.6875rem] text-on-surface/50">
    Estrutura da área e quantidade de pessoas por cargo.
  </p>
  <Textarea
    id="teamComposition"
    name="teamComposition"
    defaultValue={initialSettings.teamComposition}
    placeholder="Ex: 5 desenvolvedores, 1 QA, 1 product manager"
    className={`${INPUT_CLASS} min-h-[100px] resize-y`}
  />
</div>
```

**Novo campo a adicionar** — copiar padrão acima com ajustes para `aiProfileInstructions`:
```typescript
// Adicionar como última seção antes do bloco de Feedback (linha 376):
{/* ── Seção 5: Instruções para IA ──────────────────────────── */}
<h2 className={SECTION_HEADING_CLASS}>Instruções para IA</h2>
<div className="space-y-4">
  <div className="space-y-1.5">
    <Label htmlFor="aiProfileInstructions" className={LABEL_CLASS}>
      Instruções para IA montar perfil
    </Label>
    <p className="text-[0.6875rem] text-on-surface/50">
      Descreva o contexto da área, produtos, linguagem preferida e o que
      priorizar em candidatos. A IA usará estas instruções ao sugerir perfis.
    </p>
    <Textarea
      id="aiProfileInstructions"
      name="aiProfileInstructions"
      defaultValue={initialSettings.aiProfileInstructions ?? ""}
      className={`${INPUT_CLASS} min-h-[120px] resize-y`}
    />
  </div>
</div>
```

**Padrão de heading de seção** (linha 29 — constante `SECTION_HEADING_CLASS`):
```typescript
const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";
```

---

### `src/components/ui/dynamic-list-field.tsx` (component, event-driven)

**Sem analog exato** — componente novo. Construído a partir de primitivos existentes.

**Base: `src/components/ui/input.tsx`** (padrão de component shadcn — linhas 1-19):
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input ...",
        className
      )}
      {...props}
    />
  )
}
export { Input }
```

**Padrão de classes visuais** (extraído de `profile-form.tsx` linhas 37-39):
```typescript
const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";
```

**Padrão de `"use client"` + useState** (ver `profile-form.tsx` linhas 1-4):
```typescript
"use client";
import { useState } from "react";
```

**Padrão de hidden input para FormData** (ver `profile-form.tsx` linhas 129, 152, 191 — padrão de Select com hidden input):
```typescript
// profile-form.tsx linha 129 — padrão para passar valor controlado via FormData:
<input type="hidden" name="experienceLevel" value={experienceLevel} />
```

**Estrutura completa do componente a criar** (derivada do RESEARCH.md e dos padrões extraídos acima):
```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";

interface DynamicListFieldProps {
  name: string;
  label: string;
  initialItems?: string[];
  required?: boolean;
  labelClassName?: string;
}

export function DynamicListField({
  name,
  label,
  initialItems,
  required,
  labelClassName,
}: DynamicListFieldProps) {
  const [items, setItems] = useState<string[]>(
    initialItems && initialItems.length > 0 ? initialItems : [""]
  );

  const update = (index: number, value: string) =>
    setItems(prev => prev.map((item, i) => (i === index ? value : item)));
  const add = () => setItems(prev => [...prev, ""]);
  const remove = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <Label className={labelClassName ?? LABEL_CLASS}>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            {/* hidden input envia o valor via FormData — sem name no Input visível */}
            <input type="hidden" name={name} value={item} />
            <Input
              value={item}
              onChange={e => update(index, e.target.value)}
              required={required && index === 0}
              className={`flex-1 ${INPUT_CLASS}`}
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

**Pitfall crítico** (RESEARCH.md Pitfall 1): o `<Input>` visível NÃO deve ter `name`. Somente o `<input type="hidden">` recebe `name`. Se ambos tiverem o mesmo `name`, o FormData duplica os itens.

---

### `.agents/skills/refinar-perfil/SKILL.md` (utility, event-driven)

**Analog:** `.agents/skills/abrir-vaga/SKILL.md`

**Padrão de frontmatter YAML** (linhas 1-9 do analog):
```yaml
---
name: refinar-perfil
description: |
  Abre um perfil de vaga existente e oferece sugestões de IA para melhorar
  requisitos, habilidades e descrições. Salva o JSON atualizado em
  DATA_PATH/profiles/. Use quando o gestor quiser enriquecer um perfil
  existente com sugestões contextualizadas para P&D/Lyceum.
command: /refinar-perfil
---
```

**Padrão de Pre-Conditions** (linhas 11-15 do analog):
```markdown
## Pre-Conditions

- DATA_PATH environment variable set and pointing to the data repository directory
- At least one job profile exists in DATA_PATH/profiles/*.json
- DATA_PATH/settings.json exists with aiProfileInstructions (opcional)
```

**Padrão de listagem de perfis** (linhas 24-40 do analog — Step 1 de `/abrir-vaga`):
```bash
ls -la $DATA_PATH/profiles/
# Ler cada .json, extrair campo `title`, exibir lista numerada
```

**Padrão de leitura de settings** (linhas 47-55 do analog — Step 2):
```bash
cat $DATA_PATH/profiles/{profile-id}.json
cat $DATA_PATH/settings.json  # Pode não existir ainda
```

**Padrão de geração de UUID** (linha 131 do analog):
```bash
node -e "console.log(require('crypto').randomUUID())"
```

**Padrão de gravação JSON via node** (linhas 138-160 do analog — cat heredoc para arquivo):
```bash
# /abrir-vaga usa cat heredoc. /refinar-perfil deve usar node -e para
# evitar problemas de escape com conteúdo complexo (aspas, newlines):
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('$DATA_PATH/profiles/{id}.json', 'utf8'));
p.responsibilities = {array_final_como_json};
p.updatedAt = new Date().toISOString();
fs.writeFileSync('$DATA_PATH/profiles/{id}.json', JSON.stringify(p, null, 2));
"
```

**Padrão de Notes for Agent** (linhas 186-193 do analog):
```markdown
## Notes for Agent

- **Conversational tone:** Coletar dados em linguagem natural, não checklist rígida.
- **aiProfileInstructions:** Ler settings.json antes de gerar qualquer sugestão. Injetar o campo como contexto do sistema no prompt.
- **Formato string[]:** Os campos responsibilities, qualifications, behaviors, challenges são arrays — exibir como lista numerada no fluxo antes/depois.
```

**Padrão de seção Troubleshooting** (linhas 196-208 do analog — bloco com cenários comuns).

**Padrão de metadados finais** (linhas 214-218 do analog):
```markdown
---

**Skill created:** 2026-04-21
**Updated:** —
**Status:** Ready for Claude Code integration
```

---

### `.agents/skills/abrir-vaga/SKILL.md` (utility, event-driven — REVISÃO)

**Analog:** próprio arquivo (auditoria e correção)

**Discrepâncias identificadas contra schemas atuais** (RESEARCH.md Pitfall 4):

Step 3 atual (linhas 62-105) coleta campos que foram migrados para `AreaSettings` na Phase 3 (GAP-12):

| Campo coletado no Step 3 atual | Status real |
|---|---|
| `costCenter` (linha 81) | Migrado para `AreaSettings` — remover do Step 3 |
| `workSchedule` (linhas 92-97) | Migrado para `AreaSettings` — remover do Step 3 |
| `travelRequired` (linha 107) | Migrado para `AreaSettings` — remover do Step 3 |
| `workMode` (linhas 99-105) | Migrado para `AreaSettings` — remover do Step 3 |

Step 4 atual (linhas 112-126) pré-carrega de settings — correto para `managerName`, `godfather`, `immediateReport`, `mediateReport`, `teamComposition`. Adicionar menção a `costCenter`, `workSchedule`, `workMode`, `travelRequired` que agora também vêm de settings.

**JSON gerado no Step 5** (linhas 138-160) inclui `costCenter`, `workSchedule`, `travelRequired`, `workMode` como campos da vaga — verificar contra `src/lib/vacancy.ts` e remover os que não existem mais no schema `Vacancy`.

---

## Shared Patterns

### Constantes de classe visual (No-Line Rule)

**Fonte:** `src/components/profile/profile-form.tsx` linhas 36-39 e `src/components/settings/settings-form.tsx` linhas 25-29

**Aplicar em:** `dynamic-list-field.tsx` e qualquer novo componente de formulário

```typescript
const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";
const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";
```

### Feedback de erro/sucesso em formulários

**Fonte:** `src/components/settings/settings-form.tsx` linhas 376-391

**Aplicar em:** qualquer novo formulário

```typescript
{state?.error && (
  <div className="flex items-center gap-3 p-3 mt-6 bg-destructive/8 rounded-sm border border-destructive/25">
    <p className="text-[0.75rem] font-medium text-destructive">
      {state.error}
    </p>
  </div>
)}
{showSuccess && (
  <div className="p-3 mt-6 rounded-sm border border-emerald-200 bg-emerald-50">
    <p className="text-[0.75rem] font-medium text-emerald-700">
      Configurações salvas com sucesso.
    </p>
  </div>
)}
```

### useActionState + showSuccess com timer

**Fonte:** `src/components/settings/settings-form.tsx` linhas 43-59 (idêntico em `profile-form.tsx` linhas 44-60)

**Aplicar em:** qualquer novo componente de formulário cliente

```typescript
const [state, submitAction, isPending] = useActionState(
  (prevState: ActionState | void, formData: FormData) =>
    onSubmitAction((prevState ?? null) as ActionState, formData),
  null
);

const [showSuccess, setShowSuccess] = useState(false);
const prevStateRef = useRef<ActionState>(null);
useEffect(() => {
  if (state !== prevStateRef.current && state?.success) {
    setShowSuccess(true);
    const timer = setTimeout(() => setShowSuccess(false), 3000);
    prevStateRef.current = state;
    return () => clearTimeout(timer);
  }
  prevStateRef.current = state ?? null;
}, [state]);
```

### Padrão de repositório (nunca fs.* direto em actions)

**Fonte:** `src/app/actions/profile.ts` linhas 64-70

**Aplicar em:** qualquer server action que persista dados

```typescript
try {
  await profileRepository.save(profile);
} catch {
  return { error: "Não foi possível salvar o perfil. Tente novamente." };
}
```

### Padrão de teste de schema (Vitest)

**Fonte:** `src/__tests__/profile.test.ts` linhas 153-177 e `src/__tests__/settings.test.ts` linhas 27-35

**Aplicar em:** Wave 0 — atualização dos testes de tipo antes de alterar o schema

```typescript
import { describe, it, expect } from "vitest";
import type { JobProfile } from "@/lib/profile";

describe("Interface JobProfile", () => {
  it("responsibilities é string[]", () => {
    const profile: JobProfile = {
      // ...
      responsibilities: ["item 1", "item 2"],  // string[] — D-01
      // ...
    };
    expect(Array.isArray(profile.responsibilities)).toBe(true);
  });
});
```

### Padrão de bloco de comentário de seção em TypeScript

**Fonte:** `src/lib/settings.ts` linhas 8-33 (blocos `// ── Texto ─────`)

**Aplicar em:** qualquer adição de campos a interfaces existentes

```typescript
// ── [Nome da categoria] (justificativa — ex: Phase 4) ────────
novoCampo?: string;
```

---

## No Analog Found

Nenhum arquivo desta fase ficou sem analog — o único componente verdadeiramente novo (`dynamic-list-field.tsx`) é construído exclusivamente a partir de primitivos shadcn/ui já instalados (`Input`, `Button`, `Label`) cujos padrões foram extraídos acima.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/app/actions/`, `src/components/`, `src/__tests__/`, `.agents/skills/`
**Files scanned:** 11 arquivos lidos diretamente
**Pattern extraction date:** 2026-04-21
