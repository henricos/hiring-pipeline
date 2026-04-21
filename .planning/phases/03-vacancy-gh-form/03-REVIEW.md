---
phase: 03-vacancy-gh-form
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/lib/excel-generator.ts
  - src/lib/settings.ts
  - src/lib/vacancy.ts
  - src/lib/profile.ts
  - src/app/actions/settings.ts
  - src/app/actions/vacancy.ts
  - src/app/actions/profile.ts
  - src/app/(shell)/vacancies/[id]/edit/page.tsx
  - src/app/(shell)/vacancies/new/page.tsx
  - src/components/settings/settings-form.tsx
  - src/components/vacancy/vacancy-form.tsx
  - src/components/profile/profile-form.tsx
  - src/__tests__/excel-generator.test.ts
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Fase 03: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Resumo

Revisão cobre o gerador de formulário GH em `.xlsx` (`excel-generator.ts`), a migração de campos de `Vacancy`/`JobProfile` para `AreaSettings` (GAP-12), e as actions/componentes correspondentes.

O código está funcionalmente correto para o caminho feliz. Os problemas encontrados são: substituição dupla de células no gerador (bug latente de lógica), falha silenciosa no `setCtrlPropChecked` quando `lockText` está ausente no XML, casts de enum sem validação nas server actions, e dados de teste desatualizados após GAP-12.

Não foram encontrados problemas de segurança críticos.

---

## Warnings

### WR-01: Substituição dupla de célula em `generateVacancyForm`

**File:** `src/lib/excel-generator.ts:322-348`

**Issue:** O loop de edição cirúrgica aplica dois regexes sequencialmente sobre o mesmo `cellAddr`. O Padrão 1 (`emptyCellRe`) transforma `<c r="D6" s="1"/>` em `<c r="D6" s="1" t="inlineStr"><is><t>VALOR</t></is></c>`. Em seguida, o Padrão 2 (`existingCellRe`) casa com esse resultado expandido e o substitui novamente com o mesmo `escapedValue`. A substituição dupla é atualmente idempotente, mas é um bug latente: se a extração do atributo `s=` pelo Padrão 2 falhar ao processar o resultado do Padrão 1 (que agora contém `t="inlineStr"` entre outros atributos), o estilo pode ser perdido. Além disso, a iteração redundante torna o fluxo mais difícil de raciocinar.

**Fix:** Tornar as passagens mutuamente exclusivas usando detecção de substituição:

```typescript
// Tenta padrão de célula vazia; só aplica Padrão 2 se nada foi substituído
const before = sheetXml;
sheetXml = sheetXml.replace(
  emptyCellRe,
  `<c r="${cellAddr}" s="$1" t="inlineStr"><is><t>${escapedValue}</t></is></c>`
);
if (sheetXml === before) {
  // Célula vazia não encontrada — tenta célula com conteúdo existente
  sheetXml = sheetXml.replace(existingCellRe, (_match, attrs) => {
    const styleMatch = /s="(\d+)"/.exec(attrs);
    const styleAttr = styleMatch ? ` s="${styleMatch[1]}"` : "";
    return `<c r="${cellAddr}"${styleAttr} t="inlineStr"><is><t>${escapedValue}</t></is></c>`;
  });
}
```

---

### WR-02: Falha silenciosa em `setCtrlPropChecked` quando `lockText` está ausente

**File:** `src/lib/excel-generator.ts:166-168`

**Issue:** A inserção de `checked="Checked"` depende de `lockText="1"` estar presente no XML do ctrlProp:

```typescript
xml = xml.replace(/(\s+lockText=)/, ' checked="Checked"$1');
```

Se um arquivo `ctrlPropN.xml` não contiver `lockText` (template de versão diferente ou gerado por outra ferramenta), a substituição não encontra o padrão, o checkbox permanece desmarcado e nenhum aviso é emitido. O `if (!entry) return;` na linha 158 cobre entradas ausentes no ZIP, mas não cobre a ausência do atributo dentro de uma entrada existente.

**Fix:** Detectar a falha de substituição e logar um aviso:

```typescript
if (checked) {
  const updated = xml.replace(/(\s+lockText=)/, ' checked="Checked"$1');
  if (updated === xml) {
    console.warn(
      `[excel-generator] setCtrlPropChecked: lockText não encontrado em ${ctrlPropName}. Checkbox pode não ser marcado.`
    );
  }
  xml = updated;
}
```

---

### WR-03: Cast de enum sem validação em `updateSettings` (englishLevel, spanishLevel, workMode, workSchedule)

**File:** `src/app/actions/settings.ts:32-33, 50, 56`

**Issue:** Os valores lidos do FormData são castados diretamente para os tipos de enum sem verificar se estão no conjunto válido:

```typescript
const englishLevel = ((formData.get("englishLevel") as string) || "Não exigido") as AreaSettings["englishLevel"];
const workMode = ((formData.get("workMode") as string) || "Presencial") as AreaSettings["workMode"];
```

Um valor arbitrário enviado diretamente no corpo da requisição (ex.: via `curl` ou extensão de browser) seria persistido no `settings.json`. Consequência: o lookup em `CHECKBOX_GROUPS` retornaria `undefined` para o valor inválido, nenhum checkbox seria marcado, e a célula de texto receberia o valor corrompido.

**Fix:** Validar contra os arrays de constantes antes de usar:

```typescript
import { LANGUAGE_LEVELS } from "@/lib/profile";
import { WORK_MODES, WORK_SCHEDULES } from "@/lib/vacancy";

const englishLevelRaw = (formData.get("englishLevel") as string) || "Não exigido";
const englishLevel = (LANGUAGE_LEVELS as readonly string[]).includes(englishLevelRaw)
  ? (englishLevelRaw as AreaSettings["englishLevel"])
  : ("Não exigido" as const);

const workModeRaw = (formData.get("workMode") as string) || "Presencial";
const workMode = (WORK_MODES as readonly string[]).includes(workModeRaw)
  ? (workModeRaw as AreaSettings["workMode"])
  : ("Presencial" as const);

// Idem para spanishLevel e workSchedule
```

---

### WR-04: Cast de enum sem validação e mutação antes de validação em `updateVacancy` (requestType)

**File:** `src/app/actions/vacancy.ts:91, 102`

**Issue:** Em `updateVacancy`, `requestType` é atribuído diretamente sem fallback e sem validação:

```typescript
vacancy.requestType = (formData.get("requestType") as string) as Vacancy["requestType"];
```

Se `formData.get("requestType")` retornar `null` (campo ausente), `vacancy.requestType` recebe `null as any`. O guard na linha 102 captura isso, mas o objeto já está mutado em memória no caminho de erro. Em `createVacancy` (linha 39) há um fallback `|| "Recrutamento externo"`, o que é mais seguro. A inconsistência entre os dois handlers é um risco de manutenção.

**Fix:** Alinhar com o padrão de `createVacancy` e validar contra `REQUEST_TYPES`:

```typescript
import { REQUEST_TYPES } from "@/lib/vacancy";

const requestTypeRaw = (formData.get("requestType") as string) || "Recrutamento externo";
vacancy.requestType = (REQUEST_TYPES as readonly string[]).includes(requestTypeRaw)
  ? (requestTypeRaw as Vacancy["requestType"])
  : "Recrutamento externo";
```

---

### WR-05: Dados de teste em `validateCellMapping` desatualizados após GAP-12

**File:** `src/__tests__/excel-generator.test.ts:169-191`

**Issue:** O objeto `profile` passado em `generateAndReadSheet` inclui campos que foram migrados para `AreaSettings` no GAP-12: `englishLevel`, `spanishLevel`, `additionalInfo`, `systemsRequired`, `networkFolders`. O gerador agora lê esses valores de `settings`, não de `profile`. O objeto `settings` passado no teste (linhas 185-191) não define nenhum desses campos, portanto todas as células correspondentes (`U37`, `U39`, `G66`, `G68`, etc.) serão preenchidas com string vazia. Os testes de célula passam porque apenas verificam a presença do endereço no XML, não o valor, mas a cobertura real do mapeamento pós-GAP-12 é menor do que parece.

**Fix:** Mover os campos migrados do objeto `profile` para o objeto `settings` no setup do teste:

```typescript
const settings = {
  managerName: "GESTOR_UNICO",
  godfather: "PADRINHO_UNICO",
  immediateReport: "IMEDIATO_UNICO",
  mediateReport: "MEDIATO_UNICO",
  teamComposition: "EQUIPE_UNICA",
  // Campos migrados de profile via GAP-12:
  englishLevel: "Avançado",
  spanishLevel: "Não exigido",
  additionalInfo: "INFO_UNICA",
  systemsRequired: "SISTEMAS_UNICOS",
  networkFolders: "PASTAS_UNICAS",
} as any;

const profile = {
  title: "TITULO_TESTE_UNICO",
  suggestedTitle: "SUG_TITULO_UNICO",
  experienceLevel: "5-10 anos",
  educationLevel: "Superior completo",
  educationCourse: "Engenharia",
  postGraduateLevel: "Não exigido",
  certifications: "Não",
  responsibilities: "RESP_UNICA",
  qualifications: "QUAL_UNICA",
  behaviors: "COMP_UNICA",
  challenges: "DESAFIO_UNICO",
} as any;
```

---

## Info

### IN-01: Escrita de `workMode` como texto e como checkbox sem documentação da intencionalidade

**File:** `src/lib/excel-generator.ts:315`

**Issue:** `workMode` é escrito tanto como string na célula `P23` (via `cellValues`) quanto como checkbox VML nos ctrlProps 68/69/70 (via `applyCheckboxGroups`). Se o template não usa a célula `P23` para texto (apenas checkboxes visuais), a escrita na célula é inócua mas gera ruído. Se `P23` for de outro campo no template, haveria sobrescrita incorreta. O comentário no código não esclarece a intenção.

**Fix:** Adicionar comentário inline explicando que a célula `P23` é intencional (ex.: campo de texto auxiliar ao lado do checkbox) ou remover a entrada de `workMode` do `cellValues` se confirmado que o template usa apenas checkboxes para esse campo.

---

### IN-02: Regex de remoção de `checked="Checked"` usa `\s+` em vez de `\s*`

**File:** `src/lib/excel-generator.ts:163`

**Issue:** O padrão de remoção `/\s+checked="Checked"/` exige pelo menos um espaço antes do atributo. Se o XML produzido por uma versão futura da ferramenta gerar `...foo="bar"checked="Checked"...` sem espaço (inválido em XML mas tolerado por parsers lenientes), a remoção falharia silenciosamente e o checkbox ficaria permanentemente marcado.

**Fix:**

```typescript
xml = xml.replace(/\s*checked="Checked"/, "");
```

---

### IN-03: `deleteVacancy`, `advanceVacancyStatus` e `revertVacancyStatus` engolam erros silenciosamente

**File:** `src/app/actions/vacancy.ts:114-120, 123-146, 148-168`

**Issue:** As três funções capturam exceções com `console.error` e retornam sem propagar o erro ao chamador. Se a operação falhar (ex.: permissão negada no disco, repositório corrompido), o componente chamador recebe uma resposta de sucesso implícita e chama `router.refresh()` como se tudo tivesse ocorrido corretamente. O usuário não recebe nenhum feedback de falha.

**Fix:** Retornar um objeto de resultado que permita ao componente exibir feedback:

```typescript
export async function deleteVacancy(vacancyId: string): Promise<{ error?: string }> {
  try {
    await vacancyRepository.delete(vacancyId);
    return {};
  } catch (error) {
    console.error("Falha ao excluir vaga:", error);
    return { error: formatError(error) };
  }
}
```

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
