---
phase: 03-vacancy-gh-form
plan: "03"
subsystem: vacancy-ui
tags: [ui, components, forms, routes, vacancy, settings]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: ["vacancy-ui-layer"]
  affects: ["03-04"]
tech_stack:
  added: []
  patterns:
    - useActionState com adaptador de assinatura (mesma abordagem do profile-form.tsx)
    - Selects controlados com hidden inputs para envio via FormData
    - updateVacancy.bind(null, id) para injeção de ID no edit page
    - Suspense em todas as páginas com fallback de texto simples
key_files:
  created:
    - src/components/vacancy/vacancy-form.tsx
    - src/components/vacancy/vacancy-list.tsx
    - src/components/settings/settings-form.tsx
    - src/app/(shell)/vacancies/page.tsx
    - src/app/(shell)/vacancies/new/page.tsx
    - src/app/(shell)/vacancies/[id]/edit/page.tsx
    - src/app/(shell)/settings/page.tsx
  modified: []
decisions:
  - "Seguido padrão exato de profile-form.tsx: estados controlados com cast `as RequestType` para compatibilidade TypeScript nos selects com onValueChange"
  - "updateVacancy.bind(null, id) em lugar de wrapper function — mais limpo e alinhado com o padrão do projeto (profile/[id]/edit)"
  - "profileRepository.list() usado em vez de listAll() — o repositório de perfis expõe apenas list()"
  - "Erro de server action exibido no final do formulário (padrão profile-form.tsx) e não no topo como sugerido no plano — consistência com Phase 2"
  - "Página de edição (/vacancies/[id]/edit) serve como detail+edit combinado — tela read-only deferida conforme CONTEXT.md"
metrics:
  duration: "~25 minutos"
  completed_date: "2026-04-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 7
  files_modified: 0
---

# Phase 03 Plan 03: Componentes UI e Rotas de Vagas e Configurações

Criação da camada de UI para gestão de vagas: formulários, lista com badges de status e 4 rotas de página. Implementa formulário estruturado de requisição (VacancyForm com todos os campos do Grupo 2 — D-03), lista de vagas com ciclo de vida visual (D-15), e página de configurações da área (D-05).

## Tasks Executadas

### Task 1 — Formulários VacancyForm e SettingsForm

**Commits:** `08dc94a`

Criados dois componentes de formulário seguindo o padrão exato da Phase 2:

**`src/components/vacancy/vacancy-form.tsx`**
- Props: `profiles: JobProfile[]`, `vacancy?: Vacancy`, `onSubmitAction`
- Seção 1: Seleção de perfil (select controlado com hidden input)
- Seção 2: Todos os campos do Grupo 2 (D-03): tipo de requisição, quantidade, centro de custo, faixa salarial, confidencial, orçada, aumento de quadro, horário, modalidade, viagens, data de contratação
- Campo condicional `replacedPerson`: visível quando `headcountIncrease = false`
- Botões Cancelar (router.back()) + Salvar com estado isPending

**`src/components/settings/settings-form.tsx`**
- Props: `initialSettings: AreaSettings`, `onSubmitAction`
- 5 campos de dados comuns (D-05, D-06): gestor, padrinho, reporte imediato, reporte mediato, composição da equipe
- Textarea com placeholder descritivo para composição da equipe

Ambos seguem o padrão Phase 2: `useActionState` com adaptador de assinatura, selects controlados com hidden inputs, erro exibido no final, botão salvar com No-Line Rule.

### Task 2 — VacancyList com badges de status

**Commit:** `7dc11d4`

**`src/components/vacancy/vacancy-list.tsx`**
- Props: `vacancies: Vacancy[]`, `profiles: Map<string, JobProfile>`
- Estado vazio com CTA para primeira vaga
- Lista ordenada por `openedAt` decrescente (D-15)
- Badge de status por linha: `Aberta=default`, `Em andamento=secondary`, `Encerrada=destructive`
- Botão `ChevronRight` para avançar status (oculto quando status=Encerrada — D-12)
- Botão editar (link para `/vacancies/[id]/edit`)
- Botão excluir com AlertDialog de confirmação
- Padrão idêntico ao `profile-list.tsx`: useTransition, router.refresh() após ações

### Task 3 — Rotas de página

**Commit:** `855d0a8`

4 rotas criadas dentro de `src/app/(shell)/`:

| Rota | Componente | Dados carregados |
|------|-----------|-----------------|
| `/vacancies` | VacancyList | vacancyRepository.list() + profileRepository.list() |
| `/vacancies/new` | VacancyForm | profileRepository.list() |
| `/vacancies/[id]/edit` | VacancyForm | vacancyRepository.findById(id) + profileRepository.list() |
| `/settings` | SettingsForm | settingsRepository.get() |

Todas com Suspense + fallback, max-w-3xl, p-8, heading tipográfico alinhado ao padrão de profiles.

A rota `/vacancies/[id]/edit` usa `notFound()` se a vaga não existir e injeta o ID via `updateVacancy.bind(null, id)`.

## Desvios do Plano

### Auto-ajustes aplicados (sem desvio arquitetural)

**1. [Rule 1 - Bug] Tipos union incompatíveis com onValueChange do Select**
- **Encontrado durante:** Task 1 — verificação TypeScript
- **Problema:** useState inferido como tipo union específico (`RequestType`, `WorkSchedule`, `WorkMode`) é incompatível com o `(value: string) => void` esperado pelo `onValueChange` do Select
- **Correção:** Anotação explícita do tipo no useState + cast `as RequestType` / `as WorkSchedule` / `as WorkMode` nas arrow functions dos handlers
- **Arquivos:** `src/components/vacancy/vacancy-form.tsx`
- **Commit:** `08dc94a`

**2. [Desvio de estilo] Posição do bloco de erro**
- O plano sugeria o bloco de erro no topo do formulário (antes das seções). O padrão `profile-form.tsx` posiciona o erro no final (após as seções, antes do botão salvar).
- Seguido o padrão existente para consistência visual na aplicação.

**3. [Rule 3 - Desvio de nome de método] `profileRepository.list()` vs `listAll()`**
- O plano referenciava `profileRepository.listAll()` mas a interface real expõe apenas `list()`. Corrigido nas páginas de rota sem impacto funcional.

## Known Stubs

Nenhum stub identificado. Todos os campos renderizam dados reais das props recebidas.

## Threat Flags

Nenhuma superfície nova além do mapeado no `<threat_model>` do plano:
- T-03-09: FormData validado em server actions (Wave 2) — UI não confia em valores do cliente
- T-03-10: notFound() implementado em `/vacancies/[id]/edit`

## Self-Check: PASSED

Todos os 7 arquivos criados verificados como existentes no filesystem.
Todos os 3 commits de task verificados no git log: `08dc94a`, `7dc11d4`, `855d0a8`.
