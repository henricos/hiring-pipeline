---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - data/templates/requisicao-de-pessoal.xlsx
  - src/lib/excel-generator.ts
  - scripts/patch-template-b59.ts
  - scripts/inspect-template-cell.ts
autonomous: true
requirements: []
context_items: [item-1]
decisions_addressed: [D-01, D-02, D-03]

must_haves:
  truths:
    - "Texto multi-linha em 'Informações adicionais' (settings) aparece no Excel exportado com as quebras de linha preservadas"
    - "Valor do campo aparece alinhado à esquerda e ao topo da célula B59 (não centralizado)"
    - "Linhas longas fazem wrap dentro da célula (wrapText=1)"
  artifacts:
    - path: "data/templates/requisicao-de-pessoal.xlsx"
      provides: "Template XLSX com B59.alignment={horizontal=left,vertical=top,wrapText=1}"
    - path: "src/lib/excel-generator.ts"
      provides: "InlineStr emitido com xml:space=\"preserve\" para a célula B59 (e demais quando o valor contém \\n)"
    - path: "scripts/inspect-template-cell.ts"
      provides: "Utilitário CLI para imprimir style+alignment de uma célula do template (verificação)"
    - path: "scripts/patch-template-b59.ts"
      provides: "Script idempotente que corrige a styles da célula B59 no template binário"
  key_links:
    - from: "src/lib/excel-generator.ts"
      to: "data/templates/requisicao-de-pessoal.xlsx"
      via: "AdmZip read+write"
      pattern: "additionalInfo.*B59"
---

<objective>
Corrigir o Item 1 do CONTEXT.md de Phase 9: o campo "Informações adicionais" (vindo de
`AreaSettings.additionalInfo`) é renderizado na célula `B59` do template
`data/templates/requisicao-de-pessoal.xlsx` sem quebra de linha e centralizado.

Após este plano:
1. O `style` apontado pela célula B59 no template tem `<alignment horizontal="left" vertical="top" wrapText="1"/>`.
2. O gerador `src/lib/excel-generator.ts` emite o `<t>` com `xml:space="preserve"` quando o valor contém `\n`, garantindo que o XML não normalize/colapse as quebras antes do Excel renderizar.
3. Existe um script utilitário (`scripts/inspect-template-cell.ts`) que permite verificar qualquer célula do template em CI/local sem abrir Excel.

Purpose: Desbloquear apresentação correta do conteúdo livre do gestor no formulário GH gerado.
Output: Template patchado + gerador robusto a multi-linhas + scripts de verificação.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md
@CLAUDE.md
@AGENTS.md
@src/lib/excel-generator.ts
@data/templates/requisicao-de-pessoal.xlsx
</context>

<interfaces>
<!-- Estado atual relevante extraído de src/lib/excel-generator.ts -->

```ts
// CELL_MAPPING (linha 86): "additionalInfo" → "B59"
// Linha 430: [CELL_MAPPING.additionalInfo]: settings.additionalInfo ?? "",

// Substituição XML hoje (linhas 454 e 468) — emite <t> SEM xml:space="preserve":
//   <c r="B59" s="$1" t="inlineStr"><is><t>${escapedValue}</t></is></c>

// O OOXML padrão pode normalizar whitespace de elementos <t> quando xml:space não é "preserve"
// (cf. https://www.w3.org/TR/xml/#sec-white-space). Excel costuma preservar mesmo assim,
// mas há registros de inputs com \n + estilo sem wrapText resultando em texto colapsado.
```

```xml
<!-- Estrutura típica do template em xl/styles.xml: cellXfs -> xf applyAlignment="1" alignment="..." -->
<!-- O cell B59 hoje provavelmente aponta para um xf com alignment horizontal="center" e wrapText="0" -->
<!-- Precisamos garantir que o xf usado por B59 tenha: -->
<alignment horizontal="left" vertical="top" wrapText="1"/>
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Criar utilitário de inspeção de célula do template</name>
  <files>scripts/inspect-template-cell.ts</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (decisões D-01..D-03)
    - src/lib/excel-generator.ts (referência ao uso de AdmZip e CELL_MAPPING)
    - data/templates/requisicao-de-pessoal.xlsx (alvo da inspeção)
    - package.json (confirmar que `tsx` ou `ts-node` está disponível; se não, usar node + tsc on-the-fly via `npx tsx`)
  </read_first>
  <action>
    Criar `scripts/inspect-template-cell.ts` (kebab-case, idioma estrutura inglês — comentários pt-BR).

    Comportamento exato:
    1. Aceitar como argv[2] um endereço de célula (ex: `B59`). Se ausente, exibir uso e exit 1.
    2. Ler `data/templates/requisicao-de-pessoal.xlsx` via `AdmZip` (já é dependência — `package.json`).
    3. Extrair `xl/worksheets/sheet1.xml` e `xl/styles.xml` como strings utf-8.
    4. Localizar a tag `<c r="{addr}" ...>` no sheet (regex: `<c\\s+r="${addr}"[^>]*>`). Capturar o atributo `s="(\\d+)"` (índice do styleXf na lista cellXfs do styles.xml).
    5. Em `styles.xml`, localizar o N-ésimo `<xf ...>` dentro de `<cellXfs>`. Imprimir `applyAlignment`, e o conteúdo da tag `<alignment .../>` filha (se existir).
    6. Imprimir resultado estruturado em stdout no formato JSON (uma linha):
       `{"cell":"B59","styleIndex":NN,"alignment":{"horizontal":"...","vertical":"...","wrapText":"..."}}`
       Usar string vazia para atributos ausentes.
    7. Não modificar nada — script é read-only.

    Implementação direta com `adm-zip` + regex sobre XML. NÃO usar `xlsx`/`exceljs` (manter dependências enxutas — já estabelecido em D-08 da Phase 3 RESEARCH).

    Cabeçalho do arquivo: comentário em pt-BR explicando finalidade ("Utilitário de leitura de styles/alignment de uma célula do template — usado em verificações de Phase 9 Item 1 e em troubleshooting futuro").

    Após criar, rodar:
    ```bash
    npx tsx scripts/inspect-template-cell.ts B59
    ```
    Capturar a saída para usar como baseline na próxima task.
  </action>
  <verify>
    <automated>npx tsx scripts/inspect-template-cell.ts B59 | grep -E '"cell":"B59"' && npx tsc --noEmit scripts/inspect-template-cell.ts</automated>
  </verify>
  <acceptance_criteria>
    - Arquivo `scripts/inspect-template-cell.ts` existe.
    - `npx tsx scripts/inspect-template-cell.ts B59` retorna JSON contendo `"cell":"B59"` e um campo `"styleIndex"` numérico.
    - `npx tsc --noEmit scripts/inspect-template-cell.ts` passa sem erros.
    - Sem alterações em `data/templates/requisicao-de-pessoal.xlsx` após rodar (script read-only).
  </acceptance_criteria>
  <done>
    Utilitário CLI funcional, registrado no repo, capaz de imprimir styleIndex+alignment de qualquer célula do template para uso em verificação e troubleshooting.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Patchar styles.xml do template para B59 ter alignment left/top + wrapText</name>
  <files>scripts/patch-template-b59.ts, data/templates/requisicao-de-pessoal.xlsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-01: alignment requerido)
    - scripts/inspect-template-cell.ts (recém-criado — usar para verificar antes/depois)
    - data/templates/requisicao-de-pessoal.xlsx (alvo do patch — baseline atual)
    - src/lib/excel-generator.ts (não modificar nesta task; entender qual é o style index referenciado)
  </read_first>
  <behavior>
    - Antes do patch: `inspect-template-cell.ts B59` retorna alignment com `horizontal != "left"` OU `wrapText != "1"` (estado bug atual).
    - Após o patch: `inspect-template-cell.ts B59` retorna alignment com `horizontal="left"`, `vertical="top"`, `wrapText="1"`.
    - Patch é idempotente: rodar duas vezes consecutivas produz o mesmo resultado (não duplica atributos).
    - Patch NÃO altera estilos de outras células (ex: B44, B48, B52, B56 que têm o mesmo tipo de conteúdo bullet — `responsibilities`, `qualifications`, `behaviors`, `challenges` no CELL_MAPPING).
    - Demais membros do ZIP (sheet1.xml fora da definição de styles, ctrlProps, vmlDrawing1, imagens) permanecem byte-idênticos antes/depois.
  </behavior>
  <action>
    Criar `scripts/patch-template-b59.ts` (idempotente, kebab-case, estrutura inglês).

    Estratégia:

    1. Abrir `data/templates/requisicao-de-pessoal.xlsx` com AdmZip.
    2. Ler `xl/worksheets/sheet1.xml` e localizar a célula B59:
       - `const m = sheet.match(/<c\\s+r="B59"[^>]*\\s+s="(\\d+)"/);`
       - Capturar `currentStyleIndex` = `parseInt(m[1])`.
    3. Ler `xl/styles.xml`. Localizar o `<cellXfs ...>...</cellXfs>` block.
    4. Decidir entre 2 abordagens — usar a (a) sempre que possível:
       - **(a) Mutar o xf existente in-place** se ele NÃO for compartilhado por outras células.
         Para checar se é compartilhado: contar no `sheet1.xml` quantas células têm `s="${currentStyleIndex}"`.
         Se contagem == 1 (só B59), modificar diretamente a Nth tag `<xf ...>` dentro de `<cellXfs>`:
         - Garantir `applyAlignment="1"` no xf.
         - Substituir/inserir o filho `<alignment horizontal="left" vertical="top" wrapText="1"/>` (se já houver `<alignment .../>`, substituir por inteiro com os 3 atributos).
       - **(b) Criar novo xf** se contagem > 1:
         - Clonar o xf atual, adicionar/forçar `applyAlignment="1"` e o filho `<alignment horizontal="left" vertical="top" wrapText="1"/>`.
         - Inserir o novo xf no FINAL do `<cellXfs>` e atualizar o atributo `count="..."` desse bloco para refletir o novo total.
         - O novo `styleIndex` é `count-old` (0-based). Substituir em `sheet1.xml` apenas a célula B59: `<c r="B59" s="${currentStyleIndex}"...` → `<c r="B59" s="${newIndex}"...`. NÃO usar regex global (afeta outras células com mesmo s).
    5. Idempotência: antes de patchar, verificar se o estado já é o desejado via leitura. Se sim, exit 0 com log "B59 já está com left/top/wrap — nada a fazer".
    6. Salvar o ZIP de volta com `zip.writeZip(templatePath)`.
    7. Imprimir antes/depois em JSON: `{"before":{...},"after":{...}}`.

    Observações importantes:
    - NÃO refazer o XML do zero — apenas patchar in-place no styles.xml e (se necessário) trocar o `s=""` da célula B59 no sheet.
    - Preservar declaração XML inicial e namespaces.
    - Não tocar em ctrlProps, vmlDrawing1, imagens — usar `zip.updateFile("xl/styles.xml", ...)` e (se necessário) `zip.updateFile("xl/worksheets/sheet1.xml", ...)` apenas.

    Executar o patch ao final da task:
    ```bash
    npx tsx scripts/patch-template-b59.ts
    npx tsx scripts/inspect-template-cell.ts B59
    npx tsx scripts/patch-template-b59.ts   # rodar segunda vez — deve dizer "nada a fazer"
    ```
  </action>
  <verify>
    <automated>npx tsx scripts/patch-template-b59.ts &amp;&amp; npx tsx scripts/inspect-template-cell.ts B59 | grep -E '"horizontal":"left".*"vertical":"top".*"wrapText":"1"|"wrapText":"1".*"vertical":"top".*"horizontal":"left"'</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/patch-template-b59.ts` existe e é executável via `npx tsx`.
    - Após executar uma vez, `inspect-template-cell.ts B59` retorna `horizontal="left"`, `vertical="top"`, `wrapText="1"`.
    - Executar uma segunda vez é no-op (mensagem "nada a fazer" no stdout) — idempotência.
    - `inspect-template-cell.ts B44` (responsibilities) continua retornando o alignment original — outras células não foram afetadas. Repetir para B48, B52, B56.
    - `npm run typecheck` passa.
    - `npm test` passa (testes existentes não regridem — `excel-generator.test.ts` não muda comportamento).
    - `data/templates/requisicao-de-pessoal.xlsx` continua sendo um ZIP válido (`unzip -t data/templates/requisicao-de-pessoal.xlsx` retorna 0 e "No errors detected").
  </acceptance_criteria>
  <done>
    Template patchado em commit, idempotência demonstrada, células vizinhas preservadas, ZIP válido.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Garantir xml:space="preserve" no &lt;t&gt; do inlineStr quando valor contém quebras de linha</name>
  <files>src/lib/excel-generator.ts, src/lib/excel-generator.test.ts</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-02)
    - src/lib/excel-generator.ts (linhas 442-470 — bloco de substituição XML)
    - src/lib/excel-generator.test.ts (testes existentes — preservar todos verdes)
  </read_first>
  <behavior>
    - Para um valor com `\n` (ex: `"linha 1\nlinha 2\nlinha 3"`), o XML produzido para a célula correspondente contém `<t xml:space="preserve">linha 1\nlinha 2\nlinha 3</t>` (com newlines literais preservadas, sem ser convertidas em espaços).
    - Para valores sem `\n` (ex: `"foo"`), o `<t>` pode permanecer sem `xml:space="preserve"` — comportamento atual preservado para minimizar diff.
    - Caracteres XML especiais continuam sendo escapados (`escapeXml` ainda é chamado).
    - Test new: `it("preserva quebras de linha em campo additionalInfo via xml:space=preserve")` — gera Excel a partir de settings com `additionalInfo: "a\nb\nc"`, abre o ZIP gerado, lê `xl/worksheets/sheet1.xml` e verifica que aparece `<t xml:space="preserve">a\nb\nc</t>` (ou `<t xml:space="preserve">a&#10;b&#10;c</t>` se a XML lib normalizar) na célula B59.
  </behavior>
  <action>
    Em `src/lib/excel-generator.ts`:

    1. Logo antes do loop `for (const [cellAddr, value] of Object.entries(cellValues))` (linha ~442), adicionar uma helper local:
       ```ts
       const inlineStrTag = (value: string): string => {
         const escaped = escapeXml(value);
         const needsPreserve = /\n|\r|^\s|\s$/.test(value);
         const tAttr = needsPreserve ? ' xml:space="preserve"' : '';
         return `<is><t${tAttr}>${escaped}</t></is>`;
       };
       ```
    2. Substituir as DUAS ocorrências de `<is><t>${escapedValue}</t></is>` (linhas 454 e 468) por `${inlineStrTag(value)}`. Remover a chamada `const escapedValue = escapeXml(value);` (já incorporada na helper).
    3. NÃO alterar comportamento para valores que não contêm `\n` — as células que recebem `responsibilities`, `qualifications`, `behaviors`, `challenges` já contêm `\n` (do `serializeStringArray` / `serializeProfileItems`) e passarão a emitir `xml:space="preserve"` também, o que é correto e desejado.

    Em `src/lib/excel-generator.test.ts`, adicionar teste:
    ```ts
    it("preserva quebras de linha em additionalInfo via xml:space=preserve", () => {
      const settings: AreaSettings = { /* fixture mínima válida */ additionalInfo: "linha um\nlinha dois\nlinha três" };
      const out = path.join(os.tmpdir(), "test-additional-info.xlsx");
      generateVacancyForm(TEMPLATE_PATH, out, MOCK_VACANCY, MOCK_PROFILE, settings);
      const zip = new AdmZip(out);
      const sheet = zip.getEntry("xl/worksheets/sheet1.xml")!.getData().toString("utf-8");
      // B59 deve ter <t xml:space="preserve"> com as três linhas
      const cellB59 = sheet.match(/<c\s+r="B59"[^>]*>.*?<\/c>/s);
      expect(cellB59).not.toBeNull();
      expect(cellB59![0]).toMatch(/<t\s+xml:space="preserve"\s*>linha um\nlinha dois\nlinha três<\/t>/);
    });
    ```
    Reusar fixtures existentes (MOCK_VACANCY, MOCK_PROFILE) do arquivo de teste — não inventar novas estruturas.

    Rodar:
    ```bash
    npm test -- src/lib/excel-generator.test.ts
    npm run typecheck
    npm run lint
    ```
  </action>
  <verify>
    <automated>npm test -- src/lib/excel-generator.test.ts &amp;&amp; npm run typecheck &amp;&amp; grep -c 'xml:space="preserve"' src/lib/excel-generator.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'xml:space="preserve"' src/lib/excel-generator.ts` retorna >= 1 (helper inserida).
    - `grep -c 'inlineStrTag' src/lib/excel-generator.ts` retorna >= 3 (definição + 2 usos).
    - Novo teste `preserva quebras de linha em additionalInfo via xml:space=preserve` passa em `src/lib/excel-generator.test.ts`.
    - Todos os testes existentes em `excel-generator.test.ts` continuam passando.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - `escapeXml` continua sendo aplicada (não foi removida).
  </acceptance_criteria>
  <done>
    Gerador robusto a multi-linhas; teste de regressão protege D-02; demais testes verdes; typecheck/lint OK.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| filesystem (template) | Patch programático muta um arquivo binário versionado |
| stdin/argv (scripts) | `inspect-template-cell.ts` aceita argv[2] (endereço de célula) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09-01-01 | Tampering | scripts/patch-template-b59.ts | mitigate | Patch idempotente; checa estado atual antes de modificar; só altera B59 e (no caminho b) só APPEND ao cellXfs sem destruir entradas existentes. |
| T-09-01-02 | Information Disclosure | scripts/inspect-template-cell.ts | accept | Lê apenas styles.xml e sheet1.xml; nenhum dado sensível. Não há output de credenciais/conteúdo de células. |
| T-09-01-03 | DoS | scripts/inspect-template-cell.ts | accept | Argv não validado contra regex. Risco baixo: rodado manualmente em dev por humano. |
| T-09-01-04 | Injection | src/lib/excel-generator.ts | mitigate | `escapeXml` continua aplicado a todo `value`; `xml:space="preserve"` é atributo estático, não derivado de input. |
</threat_model>

<verification>
- `npx tsx scripts/inspect-template-cell.ts B59` retorna alignment esperado pós-patch.
- `npm test` verde.
- `npm run typecheck` verde.
- `npm run lint` verde.
- `unzip -t data/templates/requisicao-de-pessoal.xlsx` retorna sem erro.
</verification>

<success_criteria>
1. `data/templates/requisicao-de-pessoal.xlsx` é ZIP válido com B59.alignment={horizontal=left, vertical=top, wrapText=1}.
2. `src/lib/excel-generator.ts` emite `<t xml:space="preserve">` para valores com `\n`.
3. Existe utilitário CLI (`scripts/inspect-template-cell.ts`) para verificação automatizada.
4. Existe utilitário CLI (`scripts/patch-template-b59.ts`) idempotente e auditável.
5. Teste de regressão protege contra perda de `xml:space="preserve"`.
6. Sem regressões em testes existentes; typecheck/lint OK.
</success_criteria>

<output>
After completion, create `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-01-SUMMARY.md`
</output>
