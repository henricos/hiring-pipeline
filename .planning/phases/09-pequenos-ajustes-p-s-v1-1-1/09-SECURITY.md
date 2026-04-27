---
phase: 09
slug: pequenos-ajustes-p-s-v1-1-1
status: verified
threats_open: 0
asvs_level: 2
created: 2026-04-27
---

# Phase 09 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| filesystem (template) | scripts/patch-template-b59.ts muta arquivo XLSX binário versionado | XML de estilos (styles.xml) — sem PII |
| stdin/argv (scripts) | scripts/inspect-template-cell.ts aceita argv[2] como endereço de célula | endereço de célula (ex: "B59") — sem dado sensível |
| client → API | GET /api/vacancies/[id]/form — request autenticado; user controla `id` | `id` de vaga (UUID sanitizado pelo router Next) |
| API → filesystem (tmp) | route.ts escreve xlsx em os.tmpdir() com nome = id + randomUUID() | conteúdo do formulário (~50 KB) em /tmp |
| client → API (download button) | vacancy-list.tsx dispara GET autenticado para rota existente | href com UUID de vaga visível no HTML |
| user input → form | textarea em dynamic-list-field / profile-item-field envia texto para FormData | texto livre do usuário; escape automático React downstream |
| filesystem (DATA_PATH/research) → component | profile-detail-resumo.tsx renderiza conteúdo de resumo.json | dados de pesquisa de mercado (salários, stack — públicos) |
| filesystem (DATA_PATH/research) → component | profile-detail-vagas.tsx renderiza conteúdo de vagas.json | dados de vagas do mercado (títulos, empresas — públicos) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-09-01-01 | Tampering | scripts/patch-template-b59.ts | mitigate | `isAlreadyPatched()` verifica estado atual antes de modificar; patch é idempotente (ln 81-88, 183-188); abordagem (b) usa APPEND ao cellXfs sem destruir entradas existentes; B59 é o único `s=` atualizado via regex não-global. | closed |
| T-09-01-02 | Information Disclosure | scripts/inspect-template-cell.ts | accept | Script lê apenas styles.xml e sheet1.xml; sem dados sensíveis; sem output de credenciais ou conteúdo de células de negócio. | closed |
| T-09-01-03 | DoS | scripts/inspect-template-cell.ts | accept | argv não validado contra regex; risco baixo — script utilitário executado manualmente em dev, sem exposição a input externo. | closed |
| T-09-01-04 | Injection | src/lib/excel-generator.ts | mitigate | `escapeXml` aplicado em todo `value` dentro de `inlineStrTag` (ln 447-450); `xml:space="preserve"` é atributo estático derivado de regex sobre o value, não inserido a partir do input; ambos os padrões de substituição (ln 461-463, 473-477) usam a helper. | closed |
| T-09-02-01 | Tampering | src/app/api/vacancies/[id]/form/route.ts | mitigate | `id` vem de `params` do Next router (sanitizado implicitamente); usado apenas como prefixo alfanumérico do nome do arquivo temporário, não como path de diretório. `path.join(os.tmpdir(), ...)` garante que o arquivo caia em /tmp. | closed |
| T-09-02-02 | Information Disclosure | src/app/api/vacancies/[id]/form/route.ts | mitigate | `fs.unlinkSync(outputPath)` em try/catch logo após `readFileSync` (ln 73) remove o arquivo do disco antes do response; janela < 1 ms típica; app single-user com baixo tráfego. | closed |
| T-09-02-03 | DoS | src/app/api/vacancies/[id]/form/route.ts | accept | Sem rate-limit implementado; app single-user; tmpfile pequeno (~50 KB); risco baixo e proporcional ao contexto. | closed |
| T-09-02-04 | Path Traversal | src/app/api/vacancies/[id]/form/route.ts | mitigate | `randomUUID()` garante nome único não-controlado pelo cliente (ln 51); `path.join(os.tmpdir(), ...)` previne `../` traversal; `id` é UUID sanitizado pelo Next router antes de chegar ao handler. | closed |
| T-09-03-01 | Information Disclosure | src/components/vacancy/vacancy-list.tsx | accept | Rota de download já requer autenticação (single-user); listar IDs de vaga em href é aceitável — a página /vacancies inteira é visível apenas pós-login. | closed |
| T-09-03-02 | XSS | src/components/vacancy/vacancy-list.tsx | accept | `vacancy.id` é UUID; `apiPrefix` vem de env validado em build time; não há renderização de HTML cru; React faz escape automático de atributos de template string. | closed |
| T-09-04-01 | XSS | src/components/ui/dynamic-list-field.tsx, profile-item-field.tsx | accept | Texto do textarea vai para FormData; renderização downstream usa React (escape automático); sem `dangerouslySetInnerHTML` nesses fluxos. | closed |
| T-09-04-02 | Tampering | hidden inputs paralelos (dynamic-list-field, profile-item-field) | accept | Estrutura de hidden inputs paralelos (`name` e `${name}_required`) preservada sem alteração; server action continua com o contrato existente. | closed |
| T-09-05-01 | XSS | src/components/profile/profile-detail-resumo.tsx | accept | Todos os campos renderizados como texto via React (escape automático); sem `dangerouslySetInnerHTML`; conteúdo gerado pela skill `/pesquisar-mercado` controlada pelo agente. | closed |
| T-09-05-02 | Information Disclosure | src/components/profile/profile-detail-resumo.tsx | accept | Dados de pesquisa de mercado (vagas, salários) são informações públicas; sem PII; sem dados de autenticação. | closed |
| T-09-05-03 | Tampering (schema mismatch) | tipos de profile-detail-resumo.tsx | mitigate | Auditoria D-30 alinha interface `ResearchSummaryData` e `SalaryGuide` ao schema canônico da SKILL.md; campo `archetype` corrigido (era `name`); `percentage` adicionado; comentário inline referencia o schema autoritativo, prevenindo bugs silenciosos tipo "undefined" (ln 9-11, 23-26). | closed |
| T-09-06-01 | XSS | src/components/profile/profile-detail-vagas.tsx | accept | Strings (`title`, `company`, `snippet`, `stack[]`) renderizadas via React (escape automático); sem `dangerouslySetInnerHTML`. | closed |
| T-09-06-02 | Information Disclosure | src/components/profile/profile-detail-vagas.tsx | accept | Pesquisas históricas continuam persistidas no repo separado em /data (D-35); a UI exibe apenas a mais recente, mas o dado não é apagado — risco de acesso histórico via filesystem permanece documentado e aceito (contexto single-user local). | closed |
| T-09-06-03 | Tampering | src/components/profile/profile-detail-vagas.test.tsx | mitigate | Testes do switcher substituídos por testes que afirmam a AUSÊNCIA do switcher: `expect(screen.queryByRole("combobox")).not.toBeInTheDocument()` (ln 72) e `expect(screen.queryByText("Engenheiro de Software Java SR")).not.toBeInTheDocument()` (ln 69); protege regressão na direção oposta. | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-09-01 | T-09-01-02 | Script utilitário de inspeção de template; lê apenas metadados de estilo XML; sem credenciais ou dados de negócio expostos; execução somente local/dev por humano. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-02 | T-09-01-03 | DoS via argv malformado é risco aceitável em script de uso manual em dev; sem exposição a input externo não-confiável. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-03 | T-09-02-03 | Sem rate-limit na rota de geração de xlsx; contexto single-user; arquivo temporário pequeno (~50 KB); sem impacto de disponibilidade realístico. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-04 | T-09-03-01 | IDs de vaga (UUIDs) expostos em href do botão Download; toda a página já exige autenticação; sem valor de ataque incremental. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-05 | T-09-03-02 | XSS via vacancy.id/apiPrefix em template string de atributo href; vacancy.id é UUID, apiPrefix é variável de ambiente; React escapa atributos; risco residual negligível. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-06 | T-09-04-01 | XSS via textarea; todo input vai para FormData e é renderizado via React (escape automático); sem dangerouslySetInnerHTML no fluxo. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-07 | T-09-04-02 | Tampering de hidden inputs paralelos; server action preserva contrato existente sem mudança; risco aceito por continuidade de design pré-existente. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-08 | T-09-05-01 | XSS em profile-detail-resumo; renderização via React sem dangerouslySetInnerHTML; conteúdo da skill controlado pelo agente; risco negligível. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-09 | T-09-05-02 | Dados de pesquisa de mercado (salários, stack, vagas) são informações públicas coletadas de portais abertos; sem PII. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-10 | T-09-06-01 | XSS em profile-detail-vagas; renderização via React; sem dangerouslySetInnerHTML; risco negligível. | henrico.scaranello@techne.com.br | 2026-04-27 |
| AR-09-11 | T-09-06-02 | Pesquisas históricas acessíveis via filesystem; acesso requer login local; contexto single-user sem exposição de rede adicional. | henrico.scaranello@techne.com.br | 2026-04-27 |

---

## Unregistered Flags

Nenhum. SUMMARY.md das 6 plans não registrou threat flags adicionais além do threat register declarado nos PLANs.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-27 | 18 | 18 | 0 | gsd-secure-phase (claude-sonnet-4-6) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-27
