---
status: complete
phase: 03-vacancy-gh-form
source: [03-VERIFICATION.md]
started: 2026-04-23T00:00:00Z
updated: 2026-04-21T00:00:00Z
---

## Current Test

Quinta rodada de validação — após fechamento de GAP-18..21 (mapeamento correto de ctrlProps de idiomas).

## Tests

### 1. Download do formulário Excel GH
expected: Arquivo requisicao-{slug}.xlsx baixado com: (a) todos os checkboxes com exatamente 1 opção marcada por grupo incluindo inglês/espanhol/outro idioma, (b) datas AH4 e K24 no formato DD/MM/YYYY, (c) campos migrados (inglês, modalidade, cc) preenchidos a partir de AreaSettings, (d) nome do arquivo usa slug do título do perfil
result: passed — GAP-18..21 corrigidos (ctrlProp mapping idiomas + CTRL_PROP_VML_INDEX + otherLanguage D41 + slug download)

### 2. Criação de vaga end-to-end no browser
expected: Manager cria nova vaga em /vacancies/new, formulário salva com sucesso, redireciona para /vacancies, vaga aparece na lista com badge "Aberta"
result: passed

### 3. Controle de status na lista de vagas
expected: Lista /vacancies exibe apenas botões Editar e Excluir — sem botão de avanço de status
result: passed — GAP-01 resolvido em 03-06

### 4. Select de status na página de edição
expected: Página de edição exibe VacancyStatusSelect sempre visível com os 3 estados
result: passed — GAP-02 resolvido em 03-06

### 5. Botão único de formulário GH
expected: Página de edição exibe apenas um botão "Gerar formulário GH" usando ?regen=1
result: passed — GAP-03 resolvido em 03-06

### 6. Novas seções de Configurações
expected: /settings exibe seções Idiomas, Infraestrutura e Dados Fixos da Vaga; salvar persiste os valores; Excel reflete os valores salvos
result: passed — validado pelo operador em 2026-04-21

### 7. Ausência de campos migrados nos formulários
expected: Formulário de vaga (/vacancies/new, /vacancies/[id]/edit) NÃO exibe: centro de custo, modalidade, horário, disponibilidade para viagens; Formulário de perfil NÃO exibe: inglês, espanhol, outro idioma, infra, informações complementares
result: passed — validado pelo operador em 2026-04-21

### 8. Layout side by side das ações
expected: Na página de edição, Status e Formulário GH aparecem lado a lado dentro de um container com fundo sutil; responsivo em mobile
result: passed — validado pelo operador em 2026-04-21

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

### GAP-01 — Remover botão de avanço de status da lista de vagas
status: resolved
severity: minor
description: Botão ChevronRight que avança status diretamente na página /vacancies deve ser removido.
fix: Removido em 03-06.

### GAP-02 — Refatorar controle de status na página de edição
status: resolved
severity: minor
description: Substituir botão "← Voltar" por Select de status completo na edição.
fix: VacancyStatusSelect implementado em 03-06.

### GAP-03 — Simplificar botões de geração do formulário GH
status: resolved
severity: minor
description: Dois botões confusos → um único "Gerar formulário GH" com ?regen=1.
fix: Consolidado em 03-06.

### GAP-04 — Mapeamento de campos do Excel incorreto (crítico)
status: resolved
severity: critical
description: CELL_MAPPING corrigido com endereços reais inspecionados via AdmZip.
fix: Endereços corrigidos em 03-07. Checkboxes e datas corrigidos em 03-08..10.

### GAP-05 — Horário de trabalho: estrutura de dados inadequada para checkboxes
status: resolved
severity: major
description: workSchedule precisa de enum + campo workScheduleOther para suportar checkboxes e texto livre.
fix: Implementado em 03-10 — enum WorkSchedule, campo optional workScheduleOther, CHECKBOX_GROUPS.workSchedule.

### GAP-06 — Data de abertura da vaga não preenchida no Excel
status: resolved
severity: minor
description: Campo AH4 não era preenchido com data de abertura.
fix: CELL_MAPPING.openedAt = "AH4" + toExcelDate() implementados em 03-08.

### GAP-07 — Modalidade de trabalho: checkboxes invertidos no Excel
status: resolved
severity: major
description: Checkboxes VML com estado residual do template causavam múltiplas marcações.
fix: applyCheckboxGroups() com reset total do allGroup implementado em 03-09.

### GAP-08 — Datas em formato ISO em vez de DD/MM/YYYY
status: resolved
severity: minor
description: Datas em ISO → Excel; esperado DD/MM/YYYY.
fix: toExcelDate() implementada e usada em expectedHireDate e openedAt (03-08).

### GAP-09 — Tempo de experiência: múltiplos checkboxes marcados simultaneamente
status: resolved
severity: major
description: Resíduos do template causavam múltiplas marcações em experienceLevel.
fix: CHECKBOX_GROUPS.experienceLevel com allGroup completo + reset em 03-09.

### GAP-10 — Idiomas: múltiplos checkboxes marcados simultaneamente
status: resolved
severity: major
description: englishLevel/spanishLevel com múltiplos checkboxes marcados.
fix: CHECKBOX_GROUPS.englishLevel/spanishLevel + reset em 03-09. Migração para settings em 03-12.

### GAP-11 — UI da página de vaga: alinhamento das seções Status e Formulário GH
status: resolved
severity: minor
description: Status e Formulário GH desalinhados na página de edição.
fix: Grid md:grid-cols-2 + bg-surface-container-low em 03-11.

### GAP-12 — Mover campos de perfil e vaga para configurações de área
status: resolved
severity: major
description: Campos fixos por área devem sair de Vacancy/JobProfile e ir para AreaSettings.
fix: AreaSettings expandida, formulários atualizados, excel-generator lê de settings (03-12).

### GAP-13 — Layout das seções de configurações incorreto
status: resolved
severity: minor
description: additionalInfo (informações complementares) estava na seção Infraestrutura; costCenter (centro de custo) estava em Dados Fixos da Vaga.
fix: costCenter movido para Dados da Área; additionalInfo movido para o final de Dados Fixos da Vaga em settings-form.tsx.

### GAP-14 — workSchedule: ctrlProps trocados no mapeamento de checkboxes
status: resolved
severity: major
description: Escolher "Das 08h às 17h" marcava o checkbox "09h às 18h" no Excel.
fix: Causa raiz era o VML não ser atualizado. setCtrlPropChecked agora chama setVmlChecked sincronizando xl/drawings/vmlDrawing1.vml (shape N = ctrlPropN).

### GAP-15 — workMode: ctrlProps errados — Presencial marca Remoto+Híbrido
status: resolved
severity: major
description: Escolher "Presencial" resultava em Remoto e Híbrido marcados no Excel.
fix: Mesma causa raiz do GAP-14 — VML não era atualizado. Corrigido via setVmlChecked.

### GAP-16 — travelRequired: lógica de preenchimento invertida
status: resolved
severity: minor
description: Campo não selecionado gerava checkbox marcado no Excel.
fix: travelRequired adicionado a applyCheckboxGroups como checkbox único (ctrlProp11 = shape 11, row 20). VML e ctrlProp agora sincronizados.

### GAP-17 — englishLevel e spanishLevel: múltiplos checkboxes marcados (residuais persistem)
status: resolved
severity: major
description: Após migração para AreaSettings, grupos de idioma continuavam marcando múltiplos checkboxes.
fix: Causa raiz era o VML não ser atualizado. setVmlChecked limpa/seta <x:Checked> em cada shape do allGroup antes de marcar o alvo.

### GAP-18 — englishLevel/spanishLevel: ctrlProps apontavam para linhas erradas do template
status: resolved
severity: critical
description: ctrlProp18/42/43 (englishLevel) eram checkboxes da linha 31 (escolaridade), não da linha 37 (Inglês). ctrlProp19/20 (spanishLevel) eram da linha 33 (pós-graduação), não da linha 39 (Espanhol). Resultado: nenhum checkbox de idioma era marcado corretamente e checkboxes de escolaridade eram zerados indevidamente.
fix: Remapeamento completo via inspeção do template com AdmZip: englishLevel → ctrlProp24-27 (linha 37), spanishLevel → ctrlProp28-31+36/38/40 (linha 39), otherLanguageLevel → ctrlProp32-35+37/39/41 (linha 41). Todos os 4 níveis (Básico/Inter/Avançado/Fluente) agora mapeados.

### GAP-19 — VML shape index ≠ ctrlPropN para índices 24-39
status: resolved
severity: major
description: O código assumia shape N = ctrlPropN para sincronizar o VML, mas para ctrlProp 24-39 o índice real no split do VML difere devido ao histórico de edição do template (16 divergências).
fix: Adicionada tabela CTRL_PROP_VML_INDEX com os 16 mapeamentos corretos. setCtrlPropChecked usa o lookup em vez de assumir N=N.

### GAP-20 — otherLanguage (nome do idioma adicional) não era preenchido no Excel
status: resolved
severity: minor
description: O campo "Outro:" na linha 41 do template tem uma célula de entrada (D41) para o nome do idioma, que não estava mapeada nem preenchida.
fix: CELL_MAPPING.otherLanguage = "D41" adicionado; cellValues inclui settings.otherLanguage.

### GAP-21 — Nome do arquivo de download usava UUID da vaga
status: resolved
severity: minor
description: O arquivo gerado tinha nome requisicao-{uuid}.xlsx, pouco legível para o usuário.
fix: route.ts gera slug do profile.title (ex: requisicao-porteiro-master-blaster.xlsx) para o Content-Disposition. O arquivo em cache mantém o UUID internamente.
