---
phase: 04-ai-assisted-profile-refinement
depth: standard
reviewed_at: 2026-04-21
---

# Code Review — Phase 04: AI-Assisted Profile Refinement

## Summary

A implementação da Phase 4 está sólida na maior parte: a migração de `string` para `string[]` nos 4 campos descritivos foi executada de forma consistente do tipo até a UI e a server action. Foram identificados dois bugs funcionais (um no componente `DynamicListField` que causa perda silenciosa de dados ao salvar campos opcionais vazios, e um potencial injection de conteúdo no script node da skill), além de lacunas de cobertura de testes para os novos comportamentos centrais da fase.

## Findings

| ID | Severity | File | Line | Finding | Recommendation |
|----|----------|------|------|---------|----------------|
| F-01 | HIGH | `src/components/ui/dynamic-list-field.tsx` | 54 | Hidden input sempre presente mesmo quando vazio — campos opcionais sem conteúdo enviam `[""]` filtrado para `[]` pela action, mas o comportamento depende de `filter(Boolean)` invisível ao componente | Filtrar no próprio hidden input ou documentar o contrato explicitamente |
| F-02 | HIGH | `.agents/skills/refinar-perfil/SKILL.md` | 151–161 | Injeção de conteúdo no `node -e`: o script shell interpola `$DATA_PATH` e `{id}` (string de arquivo) diretamente no código JS executado — um ID com caracteres especiais pode quebrar o script ou executar código arbitrário | Usar `node` com arquivo temporário em vez de `-e`, ou validar rigorosamente o ID antes da interpolação |
| F-03 | MEDIUM | `src/app/actions/profile.ts` | 24–31 | Campos obrigatórios de enum (`experienceLevel`, `educationLevel`, `postGraduateLevel`, `certifications`) são lidos com `as` sem qualquer validação — valores inesperados (string vazia, valor fora do union) são aceitos silenciosamente e gravados no JSON | Adicionar validação de enum antes de construir o objeto |
| F-04 | MEDIUM | `src/components/ui/dynamic-list-field.tsx` | 48 | Uso de `index` como `key` em lista com remoção — ao remover um item do meio, React reutiliza chaves erradas, causando mismatch de estado nos inputs controlados | Usar IDs estáveis (ex: `useId` ou `crypto.randomUUID()` na inicialização de cada item) |
| F-05 | MEDIUM | `src/__tests__/excel-generator.test.ts` | 125–130 | O teste com template real não verifica se `serializeStringArray` é aplicado corretamente nas células B44–B56 — apenas verifica que o arquivo foi gerado e que a string original aparece no XML (sem o prefixo `"- "`) | Adicionar assertion explícita: `expect(xml).toContain("- Desenvolver features do produto")` |
| F-06 | MEDIUM | `src/__tests__/profile.test.ts` | 154–177 | O teste de instanciação de `JobProfile` ainda usa `englishLevel`, `spanishLevel`, `additionalInfo` como campos do perfil (linhas 163–169) — campos que foram migrados para `AreaSettings` na Phase 3. TypeScript aceita por serem `optional`, mas o teste valida uma estrutura desatualizada | Remover esses campos do fixture de teste para refletir o contrato atual |
| F-07 | LOW | `src/lib/excel-generator.ts` | 37–43 | `serializeStringArray` recebe `string[]` mas sua guarda inicial é `if (!items || items.length === 0)` — o `!items` só é necessário se o tipo for `string[] | null | undefined`. Com tipagem estrita, o `!items` é morto. A assinatura deveria ser `string[] | null | undefined` ou a guarda simplificada | Ajustar assinatura para `items: string[] | null | undefined` para ser coerente com a guarda defensiva |
| F-08 | LOW | `.agents/skills/abrir-vaga/SKILL.md` | 127–144 | O heredoc `cat > ... << 'EOF'` é usado no Step 5 para gravar o JSON da vaga — a própria skill `/refinar-perfil` (linha 147) documenta explicitamente que heredoc deve ser evitado por problemas com aspas e newlines em conteúdo. Há inconsistência entre as duas skills | Migrar Step 5 de `/abrir-vaga` para `node -e` ou arquivo temporário, alinhando com a abordagem de `/refinar-perfil` |
| F-09 | LOW | `src/__tests__/settings.test.ts` | 46–57 | O teste `save() e get() persistem dados corretamente` não inclui o campo `aiProfileInstructions` no objeto salvo — a cobertura do novo campo da Phase 4 é feita apenas em suite separada com fixture TypeScript, sem round-trip via repository | Adicionar `aiProfileInstructions` ao fixture do teste de persistência |

## Finding Details

### F-01 — DynamicListField: campos opcionais sempre enviam ao menos um hidden input

**File:** `src/components/ui/dynamic-list-field.tsx:29-54`

O componente inicializa com `[""]` quando `initialItems` está vazio (linha 29-31). Para campos opcionais (`qualifications`, `behaviors`, `challenges`), isso significa que ao carregar o formulário de criação sem dados iniciais, o FormData sempre conterá `name=` (string vazia). A server action filtra com `filter(Boolean)` (linha 37-40 de `profile.ts`), então o resultado final é `[]` — correto. O problema é que esse contrato é implícito e frágil: se qualquer chamador no futuro omitir o `filter(Boolean)`, receberá `[""]` em vez de `[]`. Adicionalmente, o hidden input com value vazio é submetido ao servidor a cada requisição.

**Comportamento atual (funciona mas fragilmente):**
```tsx
// dynamic-list-field.tsx linha 54
<input type="hidden" name={name} value={item} />
// item pode ser "" — enviado ao servidor
```

**Recomendação:** Condicionar a renderização do hidden input ou documentar o contrato no JSDoc:
```tsx
// Opção A: não renderizar hidden input se o item for vazio
{item && <input type="hidden" name={name} value={item} />}

// Opção B: documentar o contrato na server action
// CONTRATO: getAll(name) SEMPRE requer .filter(Boolean) — DynamicListField pode enviar strings vazias
```

---

### F-02 — refinar-perfil SKILL: interpolação de PATH e ID em node -e (injection potencial)

**File:** `.agents/skills/refinar-perfil/SKILL.md:151-161`

O script de gravação interpola `$DATA_PATH` e `{id}` diretamente no código JavaScript passado via `-e`:

```bash
node -e "
const fs = require('fs');
const filePath = '$DATA_PATH/profiles/{id}.json';
...
"
```

Se `DATA_PATH` contiver aspas, backticks ou `$(...)`, o shell expandirá antes de passar para node. O ID é obtido da lista do `ls` (mitigação parcial conforme nota da skill), mas `$DATA_PATH` é uma variável de ambiente não validada. Um `DATA_PATH` contendo `"` encerraria a string JS prematuramente.

**Recomendação:** Passar o path como argumento em vez de interpolá-lo:
```bash
node -e "
const fs = require('fs');
const filePath = process.argv[1];
const profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
// ...
fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
" -- "$DATA_PATH/profiles/{id}.json"
```

---

### F-03 — profile.ts action: enum fields sem validação de runtime

**File:** `src/app/actions/profile.ts:24-31`

Quatro campos de enum obrigatórios são lidos do FormData com `as` sem validação:

```ts
experienceLevel: formData.get("experienceLevel") as JobProfile["experienceLevel"],
educationLevel: formData.get("educationLevel") as JobProfile["educationLevel"],
postGraduateLevel: formData.get("postGraduateLevel") as JobProfile["postGraduateLevel"],
certifications: formData.get("certifications") as JobProfile["certifications"],
```

Se o FormData chegar com valor vazio (ex: usuário remove o hidden input via DevTools, ou JavaScript client-side não inicializou o estado do Select), o valor é `null | ""`, que é gravado como string inválida no JSON. Dado que este é um sistema single-user, o risco é baixo, mas a integridade dos dados do JSON pode ser comprometida.

**Recomendação:**
```ts
const VALID_EXPERIENCE: JobProfile["experienceLevel"][] = ["< 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "> 10 anos"];
const experienceLevelRaw = formData.get("experienceLevel") as string;
if (!VALID_EXPERIENCE.includes(experienceLevelRaw as JobProfile["experienceLevel"])) {
  return { error: "Nível de experiência inválido" };
}
const experienceLevel = experienceLevelRaw as JobProfile["experienceLevel"];
```

Alternativamente, importar as constantes existentes (`EXPERIENCE_LEVELS` etc.) para a validação.

---

### F-04 — DynamicListField: key instável causa mismatch de estado em remoção

**File:** `src/components/ui/dynamic-list-field.tsx:47-48`

```tsx
{items.map((item, index) => (
  <div key={index} className="flex gap-2">
```

Com `key={index}`, ao remover o item do índice 1 de uma lista `["A", "B", "C"]`, React reconcilia `key=1` como "B" transformado em "C" — o input visível pode mostrar valor errado momentaneamente. Em testes manuais com listas longas, isso pode causar conteúdo incorreto no input visível (embora o hidden input sincronize via `value={item}`).

**Recomendação:**
```tsx
const [items, setItems] = useState<{ id: string; value: string }[]>(
  (initialItems && initialItems.length > 0 ? initialItems : [""]).map(v => ({
    id: crypto.randomUUID(),
    value: v,
  }))
);
// ...
{items.map(({ id, value }) => (
  <div key={id} className="flex gap-2">
    <input type="hidden" name={name} value={value} />
    <Input value={value} onChange={e => update(id, e.target.value)} ... />
```

---

### F-05 — excel-generator.test.ts: sem assertion do formato bullet em células

**File:** `src/__tests__/excel-generator.test.ts:219-224`

```ts
it("escreve responsibilities na célula B44", async () => {
  const xml = await generateAndReadSheet();
  if (!xml) return;
  expect(xml).toContain('r="B44"');
  expect(xml).toContain("RESP_UNICA");  // verifica texto mas NÃO o prefixo "- "
});
```

O test verifica que o texto está presente, mas não verifica que `serializeStringArray` foi aplicado — ou seja, não garante que o formato `"- RESP_UNICA"` está no XML. Um eventual regression que grave o array diretamente (sem bullet) passaria neste teste.

**Recomendação:** Adicionar:
```ts
expect(xml).toContain("- RESP_UNICA");
```

---

### F-06 — profile.test.ts: fixture usa campos migrados para AreaSettings

**File:** `src/__tests__/profile.test.ts:163-169`

```ts
const profile: JobProfile = {
  // ...
  englishLevel: "Intermediário",   // migrado para AreaSettings (GAP-12)
  spanishLevel: "Não exigido",     // migrado para AreaSettings (GAP-12)
  // ...
  additionalInfo: "Nenhuma",       // migrado para AreaSettings (GAP-12)
```

Esses campos ainda existem como `optional` no tipo `JobProfile` (marcados com comentário "migrado para AreaSettings — GAP-12"), então o TypeScript compila sem erro. No entanto, o teste de "pode ser instanciada com todos os campos obrigatórios" está testando uma estrutura diferente do contrato esperado, sinalizando incorretamente que esses campos pertencem ao perfil.

**Recomendação:** Remover `englishLevel`, `spanishLevel`, e `additionalInfo` do fixture de teste. Se necessário manter cobertura dos campos opcionais legados, isolá-los em um teste separado com comentário explicativo.

---

### F-07 — serializeStringArray: guarda defensiva inconsistente com a assinatura

**File:** `src/lib/excel-generator.ts:37-43`

```ts
export function serializeStringArray(items: string[]): string {
  if (!items || items.length === 0) return "";
```

A assinatura declara `string[]` (não nullable), mas a guarda `!items` protege contra `null`/`undefined`. Isso é código morto do ponto de vista do tipo, mas indica que o autor pretendia aceitar valores nulos. Em TypeScript strict mode, chamar com `null` seria erro de compilação, tornando a guarda inerte em runtime seguro.

**Recomendação:** Alinhar intenção com declaração:
```ts
// Se aceitar nullable (mais defensivo — recomendado para funções chamadas com dados de disco):
export function serializeStringArray(items: string[] | null | undefined): string {

// Ou remover a guarda e manter string[] puro:
export function serializeStringArray(items: string[]): string {
  if (items.length === 0) return "";
```

---

### F-08 — abrir-vaga SKILL: heredoc para gravar JSON (inconsistência com refinar-perfil)

**File:** `.agents/skills/abrir-vaga/SKILL.md:127-144`

```bash
cat > $DATA_PATH/vacancies/{uuid}.json << 'EOF'
{
  "id": "{uuid}",
  ...
  "replacedPerson": "{replacedPerson or null}",
```

A própria nota da skill `/refinar-perfil` (linha 147) documenta: "NÃO heredoc — evita problemas de escape com aspas e newlines". O `replacedPerson` especificamente pode conter aspas (ex: nome com apóstrofo). Com heredoc, `'EOF'` (aspas simples) previne expansão de shell, mas o conteúdo ainda é inserido literalmente, podendo gerar JSON inválido se o nome contiver `"`.

**Recomendação:** Migrar Step 5 para `node -e` seguindo o padrão de `/refinar-perfil`:
```bash
node -e "
const fs = require('fs');
const vacancy = {
  id: process.argv[1],
  profileId: process.argv[2],
  // ...
};
fs.writeFileSync(process.argv[3], JSON.stringify(vacancy, null, 2));
" -- "{uuid}" "{profileId}" "$DATA_PATH/vacancies/{uuid}.json"
```

---

### F-09 — settings.test.ts: round-trip de persistência não cobre aiProfileInstructions

**File:** `src/__tests__/settings.test.ts:46-57`

```ts
it("SettingsRepository.save() e get() persistem os dados corretamente", async () => {
  const saved = {
    managerName: "João Silva",
    // ... outros campos
    // aiProfileInstructions AUSENTE
  };
  await settingsRepository.save(saved);
  const loaded = await settingsRepository.get();
  expect(loaded).toEqual(saved);
});
```

O novo campo `aiProfileInstructions` (entregável D-14 da Phase 4) não tem cobertura de round-trip via repository. A suite `AreaSettings — campo aiProfileInstructions` testa apenas instanciação de tipo e `defaultSettings()`, mas não save/get.

**Recomendação:**
```ts
it("SettingsRepository.save() e get() persistem aiProfileInstructions", async () => {
  const saved = {
    managerName: "João",
    godfather: "", immediateReport: "", mediateReport: "", teamComposition: "",
    aiProfileInstructions: "Contexto de área: P&D/Lyceum.",
  };
  await settingsRepository.save(saved);
  const loaded = await settingsRepository.get();
  expect(loaded.aiProfileInstructions).toBe("Contexto de área: P&D/Lyceum.");
});
```

---

## Verdict

**PASS WITH NOTES**

Nenhum bug crítico de segurança ou perda de dados em produção foi identificado. A implementação central da migração `string[]` está correta e consistente em todos os camadas (tipo, form, action, excel generator). Os dois findings HIGH são bugs reais mas com impacto limitado no contexto single-user:

- **F-01** é mitigado pelo `filter(Boolean)` já presente na action — funciona corretamente hoje, mas o contrato implícito é frágil para manutenção futura.
- **F-02** é um risco teórico de injection em ambiente CLI — mitigado pelo fato de o ID ser obtido de `ls` e não do usuário, mas `$DATA_PATH` não é validado.

**Recomendado antes do próximo milestone:**
1. Resolver F-04 (key instável) — pode causar bugs visuais em edição de listas com múltiplos itens
2. Adicionar assertions de formato bullet nos testes (F-05) — garante que `serializeStringArray` não regride silenciosamente

**Pode ser resolvido como tech debt:**
3. F-01, F-03, F-06, F-07, F-08, F-09 — não bloqueiam funcionalidade atual
