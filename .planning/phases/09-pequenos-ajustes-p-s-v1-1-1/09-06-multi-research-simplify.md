---
phase: 09-pequenos-ajustes-p-s-v1-1-1
plan: 06
type: execute
wave: 2
depends_on: [09-05-resumo-bars-and-archetype-fix]
files_modified:
  - src/components/profile/profile-detail-vagas.tsx
  - src/components/profile/profile-detail-vagas.test.tsx
  - src/components/profile/profile-detail-resumo.tsx
autonomous: true
requirements: []
context_items: [item-7]
decisions_addressed: [D-32, D-33, D-34, D-35, D-36, D-37]

must_haves:
  truths:
    - "Aba 'Vagas do Mercado' sempre exibe a pesquisa mais recente e a sua data, sem switcher (D-32, D-33, D-34)"
    - "Aba 'Resumo de Mercado' sempre exibe a data da pesquisa, mesmo quando há apenas uma (D-33)"
    - "Não existe <select> nem state selectedDate em profile-detail-vagas.tsx (D-34)"
    - "Testes que cobrem o switcher foram removidos ou atualizados; todos os testes continuam verdes (D-37)"
    - "Pesquisas históricas seguem persistidas no repo separado montado em /data; nenhuma limpeza/migração automática (D-35)"
  artifacts:
    - path: "src/components/profile/profile-detail-vagas.tsx"
      provides: "Componente sem useState/select; renderiza apenas a pesquisa mais recente, com data sempre visível"
    - path: "src/components/profile/profile-detail-vagas.test.tsx"
      provides: "Suite atualizada — sem teste de switcher; novo teste cobrindo data sempre visível"
    - path: "src/components/profile/profile-detail-resumo.tsx"
      provides: "Linha 'Resumo de: {date}' exibida incondicionalmente (não condicionada por researches.length > 1)"
  key_links:
    - from: "src/components/profile/profile-detail-vagas.tsx"
      to: "researches[0] (mais recente)"
      via: "leitura direta do índice 0 do array já ordenado desc"
      pattern: "researches\\[0\\]"
---

<objective>
Implementar Item 7 do CONTEXT.md de Phase 9: simplificar UX multi-pesquisa.

Estado atual:
- `profile-detail-resumo.tsx` (linha 119): só mostra `Resumo de: {date}` quando `researches.length > 1`.
- `profile-detail-vagas.tsx` (linhas 26, 50, 55-76, 83-84): tem `useState<selectedDate>`, `<select>` para escolher pesquisa anterior, e exibe a data inline apenas quando há 1 pesquisa.

Estado alvo (D-32..D-37):
- Default em ambas as abas = pesquisa mais recente (já é o comportamento; manter — D-32).
- Data da pesquisa exibida **sempre** em ambas as abas (D-33).
- `<select>` removido de `profile-detail-vagas.tsx` (D-34) — UI passa a ser read-only da mais recente.
- Pesquisas históricas continuam persistidas no repo separado montado em `/data` — ZERO limpeza automática (D-35).
- Testes do switcher atualizados/removidos para nada ficar RED (D-37).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md
@CLAUDE.md
@AGENTS.md
@src/components/profile/profile-detail-vagas.tsx
@src/components/profile/profile-detail-vagas.test.tsx
@src/components/profile/profile-detail-resumo.tsx
</context>

<interfaces>
<!-- Estado atual de profile-detail-vagas.tsx (componente cliente, com state e select) -->

```tsx
"use client";
import { useState } from "react";
// ...
export function ProfileDetailVagas({ researches, allVagas, defaultExpanded }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    defaultExpanded ?? researches[0]?.date ?? null
  );
  // ...
  const jobsList: Job[] = selectedDate ? (allVagas[selectedDate] ?? []) : [];
  // ...
  // Linha 55-76: <select> condicional researches.length > 1
  // Linha 83-84: header com data condicional `researches.length === 1 && selectedDate`
}
```

<!-- Estado atual de profile-detail-resumo.tsx, linha 119: -->

```tsx
{researches.length > 1 && (
  <p className="text-label-sm text-on-surface/60">
    Resumo de: {mostRecent.date}
  </p>
)}
```

<!-- Estado atual de profile-detail-vagas.test.tsx (testes que cobrem o switcher):
     - it("renderiza lista de pesquisas em ordem cronologica reversa (D-05, VIZ-01)") — depende do select para enxergar 2 datas
     - it("selecionar pesquisa diferente via dropdown atualiza lista de vagas (VIZ-03)") — testa especificamente o switcher
     Ambos precisam ser ajustados ou removidos (D-37). -->
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Tornar data sempre visível em profile-detail-resumo.tsx (D-33)</name>
  <files>src/components/profile/profile-detail-resumo.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-33)
    - src/components/profile/profile-detail-resumo.tsx (linha 119 — bloco condicional `researches.length > 1`)
  </read_first>
  <action>
    Em `src/components/profile/profile-detail-resumo.tsx`, localizar o bloco (linha 119):
    ```tsx
    {researches.length > 1 && (
      <p className="text-label-sm text-on-surface/60">
        Resumo de: {mostRecent.date}
      </p>
    )}
    ```

    Substituir por (D-33: exibir incondicionalmente):
    ```tsx
    {/* D-33 (Phase 9 / Item 7): data exibida sempre, mesmo com 1 pesquisa */}
    <p className="text-label-sm text-on-surface/60">
      Resumo de: {mostRecent.date}
    </p>
    ```

    NÃO mexer em mais nada nesse arquivo nesta task.

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test -- src/components/profile/profile-detail-resumo.test.tsx`
  </action>
  <verify>
    <automated>bash -c 'if grep -E "researches.length\s*>\s*1" src/components/profile/profile-detail-resumo.tsx | grep -q "Resumo de"; then exit 1; fi'; bash -c 'grep -c "Resumo de:" src/components/profile/profile-detail-resumo.tsx'; bash -c 'grep -c "D-33" src/components/profile/profile-detail-resumo.tsx'; npm run typecheck; npm test -- --run src/components/profile/profile-detail-resumo.test.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `grep -E 'researches.length > 1' src/components/profile/profile-detail-resumo.tsx | grep 'Resumo de'` NÃO retorna nada (condicional removida).
    - `grep -c 'Resumo de:' src/components/profile/profile-detail-resumo.tsx` retorna >= 1.
    - `grep -c 'D-33' src/components/profile/profile-detail-resumo.tsx` retorna >= 1.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
    - Testes existentes em `profile-detail-resumo.test.tsx` continuam passando.
  </acceptance_criteria>
  <done>
    Linha "Resumo de: {date}" agora aparece sempre, alinhando com a aba Vagas (após task 2).
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Remover switcher de profile-detail-vagas.tsx — read-only da mais recente (D-32, D-33, D-34)</name>
  <files>src/components/profile/profile-detail-vagas.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-32, D-33, D-34, D-36)
    - src/components/profile/profile-detail-vagas.tsx (estado atual completo — useState, select, header condicional)
    - src/components/profile/profile-detail-resumo.tsx (após task 1 — referência do padrão "data sempre visível")
  </read_first>
  <behavior>
    - Componente é client (`"use client"`) MAS deixa de usar `useState`. Pode permanecer client ou ser convertido em server; a critério, manter `"use client"` para minimizar diff (sem custo).
    - Não há mais `<select>` nem `selectedDate` no JSX.
    - Renderiza diretamente a pesquisa de `researches[0]` (já vem ordenado desc do server).
    - O header de data é exibido SEMPRE (D-33), no mesmo padrão visual de `profile-detail-resumo.tsx` (`text-label-sm text-on-surface/60`).
    - A prop `defaultExpanded` deixa de fazer sentido — REMOVER da interface.
    - Empty state (researches.length === 0) preservado.
    - Estado "pesquisa existe mas allVagas[date] está vazio" preservado (texto "Nenhuma vaga encontrada para {date}.").
  </behavior>
  <action>
    Reescrever `src/components/profile/profile-detail-vagas.tsx` mantendo apenas o necessário. Versão alvo:

    ```tsx
    "use client";

    import type { Research } from "@/lib/repositories/research-repository";

    interface Job {
      title: string;
      company: string;
      companySize?: string;
      stack?: string[];
      snippet?: string;
      salaryRange?: { min: number; max: number } | null;
    }

    interface ProfileDetailVagasProps {
      researches: Research[];
      allVagas: Record<string, Job[]>;
    }

    /**
     * D-32..D-34 (Phase 9 / Item 7): UI read-only da pesquisa mais recente.
     * Switcher de pesquisa (estado selectedDate + <select>) removido.
     * Histórico permanece persistido no repo montado em /data (D-35).
     */
    export function ProfileDetailVagas({
      researches,
      allVagas,
    }: ProfileDetailVagasProps) {
      if (researches.length === 0) {
        return (
          <div className="text-center py-12">
            <h3 className="text-title-md font-medium text-on-surface mb-2">
              Nenhuma pesquisa de mercado
            </h3>
            <p className="text-body-md text-on-surface/60 mb-4">
              Nenhuma pesquisa foi realizada para este perfil.
            </p>
            <p className="text-body-md text-on-surface/60">
              Execute a skill{" "}
              <code className="bg-surface-container px-2 py-1 rounded-sm">
                /pesquisar-mercado
              </code>{" "}
              para gerar dados.
            </p>
          </div>
        );
      }

      const mostRecent = researches[0];
      const jobsList: Job[] = allVagas[mostRecent.date] ?? [];

      return (
        <div className="space-y-6">
          {/* D-33: data exibida sempre, mesmo com 1 pesquisa */}
          <p className="text-label-sm text-on-surface/60">
            Pesquisa de: {mostRecent.date}
          </p>

          {jobsList.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-title-md font-medium text-on-surface">
                {jobsList.length} vaga{jobsList.length !== 1 ? "s" : ""} encontrada
                {jobsList.length !== 1 ? "s" : ""}
              </h4>
              <div className="space-y-3">
                {jobsList.map((job, idx) => (
                  <div
                    key={idx}
                    className="rounded-sm bg-surface-container-low p-4 space-y-3"
                  >
                    <div>
                      <p className="text-body-md font-medium text-on-surface">
                        {job.title}
                      </p>
                      <p className="text-body-md text-on-surface/70">
                        <span>{job.company}</span>
                        {job.companySize && (
                          <span className="text-on-surface/50">
                            {" "}
                            ({job.companySize})
                          </span>
                        )}
                      </p>
                    </div>

                    {job.stack && job.stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.stack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-sm bg-surface-container text-label-sm text-on-surface/80"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {job.snippet && (
                      <p className="text-body-md text-on-surface/80">
                        {job.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-body-md text-on-surface/60 text-center py-8">
              Nenhuma vaga encontrada para {mostRecent.date}.
            </p>
          )}
        </div>
      );
    }
    ```

    Mudanças relativas ao estado atual:
    - REMOVIDO: `import { useState } from "react";`
    - REMOVIDO: `defaultExpanded` prop (não faz mais sentido).
    - REMOVIDO: `useState<selectedDate>` + `setSelectedDate`.
    - REMOVIDO: bloco do `<select>` (linhas 55-76).
    - ADICIONADO: header `<p>Pesquisa de: {mostRecent.date}</p>` sempre visível (D-33).
    - SIMPLIFICADO: header da contagem ("X vagas encontradas") — sem o sufixo condicional `— {date}` (a data já está no header acima).

    Caller chain: verificar se algum lugar passa `defaultExpanded` para `<ProfileDetailVagas>`. Buscar com `grep -rn "defaultExpanded" src/`. Se houver caller (provavelmente `profile-detail-tabs.tsx` ou `app/(shell)/profiles/[id]/page.tsx`), remover a prop daquele caller também (não é mais usada). Se aparecer só no teste, será resolvido na task 3.

    Rodar:
    `npm run typecheck` ; `npm run lint`
  </action>
  <verify>
    <automated>bash -c 'if grep -q "useState" src/components/profile/profile-detail-vagas.tsx; then exit 1; fi'; bash -c 'if grep -q "selectedDate" src/components/profile/profile-detail-vagas.tsx; then exit 1; fi'; bash -c 'if grep -qE "<select" src/components/profile/profile-detail-vagas.tsx; then exit 1; fi'; bash -c 'if grep -q "defaultExpanded" src/components/profile/profile-detail-vagas.tsx; then exit 1; fi'; bash -c 'grep -c "researches\[0\]" src/components/profile/profile-detail-vagas.tsx'; bash -c 'grep -c "Pesquisa de:" src/components/profile/profile-detail-vagas.tsx'; bash -c "if grep -rn defaultExpanded src/ --include='*.tsx' --include='*.ts' | grep -v '\.test\.'; then exit 1; fi"; npm run typecheck; npm run lint</automated>
  </verify>
  <acceptance_criteria>
    - `grep 'useState' src/components/profile/profile-detail-vagas.tsx` NÃO retorna nada (D-34).
    - `grep 'selectedDate' src/components/profile/profile-detail-vagas.tsx` NÃO retorna nada.
    - `grep '<select' src/components/profile/profile-detail-vagas.tsx` NÃO retorna nada.
    - `grep 'defaultExpanded' src/components/profile/profile-detail-vagas.tsx` NÃO retorna nada.
    - `grep -c 'researches\[0\]' src/components/profile/profile-detail-vagas.tsx` retorna >= 1.
    - `grep -c 'Pesquisa de:' src/components/profile/profile-detail-vagas.tsx` retorna >= 1 (D-33).
    - Nenhum caller em `src/` (excluindo `*.test.*`) passa `defaultExpanded`.
    - `npm run typecheck` passa.
    - `npm run lint` passa.
  </acceptance_criteria>
  <done>
    Switcher removido; UI read-only da mais recente; data sempre visível.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Atualizar testes de profile-detail-vagas removendo asserts do switcher (D-37)</name>
  <files>src/components/profile/profile-detail-vagas.test.tsx</files>
  <read_first>
    - .planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-CONTEXT.md (D-37: testes do switcher devem ser atualizados/removidos)
    - src/components/profile/profile-detail-vagas.test.tsx (5 testes atuais)
    - src/components/profile/profile-detail-vagas.tsx (após task 2)
  </read_first>
  <behavior>
    - Testes finais cobrem: empty state, ordem cronológica reversa do `researches` (sem depender de switcher), exibição direta das vagas da mais recente, card de vaga com title/company/stack/snippet, e (novo) data sempre visível.
    - Nenhum teste tenta interagir com `<select>` ou usar `fireEvent.change` em combobox.
    - `defaultExpanded` removido das chamadas.
  </behavior>
  <action>
    Reescrever `src/components/profile/profile-detail-vagas.test.tsx` para refletir a nova UI:

    1) Remover import de `fireEvent` (não usado mais).

    2) Manter a fixture `mockResearches` (2 entradas) — útil para testar que apenas a mais recente é exibida.

    3) Substituir os testes pelos seguintes (5 no total):

    ```ts
    describe("ProfileDetailVagas", () => {
      it("renderiza empty state quando researches e vazio (D-07)", () => {
        render(<ProfileDetailVagas researches={[]} allVagas={{}} />);
        expect(screen.getByText(/Nenhuma pesquisa de mercado/i)).toBeInTheDocument();
        expect(screen.getByText(/pesquisar-mercado/i)).toBeInTheDocument();
      });

      it("renderiza apenas a pesquisa mais recente (D-32, D-34)", () => {
        const allVagas = {
          "2026-04-24": mockVagasDia24,
          "2026-04-23": mockVagasDia23,
        };
        render(<ProfileDetailVagas researches={mockResearches} allVagas={allVagas} />);

        // Vagas da mais recente (24) visíveis
        expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
        // Vagas da anterior (23) NÃO visíveis (sem switcher — D-34)
        expect(screen.queryByText("Engenheiro de Software Java SR")).not.toBeInTheDocument();

        // Sem combobox — switcher foi removido (D-34)
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      });

      it("exibe a data da pesquisa sempre, mesmo com 1 unica pesquisa (D-33)", () => {
        const singleResearch = [mockResearches[0]];
        const allVagas = { "2026-04-24": mockVagasDia24 };
        render(<ProfileDetailVagas researches={singleResearch} allVagas={allVagas} />);

        // Data visivel mesmo com 1 pesquisa (D-33)
        expect(screen.getByText(/Pesquisa de:\s*2026-04-24/i)).toBeInTheDocument();
      });

      it("vagas da unica pesquisa sao exibidas diretamente (D-06, VIZ-01)", () => {
        const singleResearch = [mockResearches[0]];
        const allVagas = { "2026-04-24": mockVagasDia24 };
        render(<ProfileDetailVagas researches={singleResearch} allVagas={allVagas} />);

        expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
        expect(screen.getByText("Banco Bradesco")).toBeInTheDocument();
      });

      it("exibe card de vaga com title, company, stack e snippet (D-06)", () => {
        const allVagas = { "2026-04-24": mockVagasDia24 };
        render(
          <ProfileDetailVagas
            researches={[mockResearches[0]]}
            allVagas={allVagas}
          />
        );

        expect(screen.getByText("Pessoa Desenvolvedora Backend Java SR")).toBeInTheDocument();
        expect(screen.getByText("Banco Bradesco")).toBeInTheDocument();
        expect(screen.getByText("Java 21")).toBeInTheDocument();
        expect(screen.getByText(/Desenvolvimento e manutencao/i)).toBeInTheDocument();
      });
    });
    ```

    4) Removidos: o teste do switcher (`selecionar pesquisa diferente via dropdown atualiza lista de vagas (VIZ-03)`) — código que ele cobria foi removido (D-37).

    5) Removido: o teste antigo "renderiza lista de pesquisas em ordem cronologica reversa" — ele dependia das duas datas estarem visíveis no DOM via `<select>`. Substituído pelo teste novo "renderiza apenas a pesquisa mais recente" que verifica que vagas antigas NÃO aparecem. (Documentar isso no comentário de cabeçalho do arquivo.)

    Caller-side cleanup: rodar `grep -rn "defaultExpanded" src/`; remover qualquer caller restante (callers fora dos testes já tratados na task 2).

    Rodar:
    `npm run typecheck` ; `npm run lint` ; `npm test`
  </action>
  <verify>
    <automated>bash -c "if grep -q 'fireEvent' src/components/profile/profile-detail-vagas.test.tsx; then exit 1; fi"; bash -c "if grep -q 'defaultExpanded' src/components/profile/profile-detail-vagas.test.tsx; then exit 1; fi"; bash -c "if grep -q 'getByRole..combobox' src/components/profile/profile-detail-vagas.test.tsx; then exit 1; fi"; bash -c "grep -c 'D-32\\|D-33\\|D-34' src/components/profile/profile-detail-vagas.test.tsx"; npm run typecheck; npm run lint; npm test -- --run</automated>
  </verify>
  <acceptance_criteria>
    - `grep 'fireEvent' src/components/profile/profile-detail-vagas.test.tsx` NÃO retorna nada.
    - `grep 'defaultExpanded' src/components/profile/profile-detail-vagas.test.tsx` NÃO retorna nada.
    - Nenhum teste usa `getByRole("combobox")` (asserção positiva sobre presença do switcher).
    - Pelo menos um teste novo referencia D-32/D-33/D-34.
    - `npm test` passa (todos os testes verdes).
    - `npm run typecheck` passa.
    - `npm run lint` passa.
  </acceptance_criteria>
  <done>
    Suite de teste alinhada à nova UI; nenhum teste cobre código removido; D-37 atendido.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| filesystem (DATA_PATH/research) → component | Conteúdo de vagas.json e resumo.json é renderizado |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-09-06-01 | XSS | profile-detail-vagas.tsx | accept | Strings (`title`, `company`, `snippet`, `stack[]`) renderizadas via React (escape automático). Sem `dangerouslySetInnerHTML`. |
| T-09-06-02 | Information Disclosure | profile-detail-vagas.tsx | accept | Pesquisas históricas continuam acessíveis via filesystem (repo separado em /data — D-35); a UI deixa de expor o switcher mas o dado não é apagado. |
| T-09-06-03 | Tampering | testes removidos | mitigate | Substituímos testes do switcher por testes que afirmam a AUSÊNCIA do switcher (`queryByRole("combobox")` retorna null) — protege regressão na direção oposta. |
</threat_model>

<verification>
- `npm run typecheck` verde.
- `npm run lint` verde.
- `npm test` verde.
- Manual: navegar para `/profiles/{id}` com 2+ pesquisas → aba "Vagas do Mercado" mostra "Pesquisa de: {date_mais_recente}" + vagas só da mais recente, sem `<select>`. Aba "Resumo de Mercado" mostra "Resumo de: {date}" mesmo se houver só 1 pesquisa.
- Manual: confirmar que arquivos antigos em `data/research/{profileId}/` NÃO foram tocados (D-35).
</verification>

<success_criteria>
1. Data sempre visível na aba Resumo de Mercado.
2. Switcher (`<select>`) removido da aba Vagas do Mercado.
3. UI da aba Vagas é read-only da pesquisa mais recente.
4. Testes atualizados — nenhum teste cobre código removido; novos testes protegem D-32/D-33/D-34.
5. Nenhuma alteração em `data/research/`.
6. Sem regressões em outros testes.
</success_criteria>

<output>
After completion, create `.planning/phases/09-pequenos-ajustes-p-s-v1-1-1/09-06-SUMMARY.md`
</output>
