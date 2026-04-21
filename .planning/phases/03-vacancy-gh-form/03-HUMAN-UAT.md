---
status: diagnosed
phase: 03-vacancy-gh-form
source: [03-VERIFICATION.md]
started: 2026-04-23T00:00:00Z
updated: 2026-04-21T00:00:00Z
---

## Current Test

Segunda rodada de validação realizada pelo operador em 2026-04-21 após fechamento dos GAP-01..04.

## Tests

### 1. Download do formulário Excel GH
expected: GET /api/vacancies/[id]/form retorna arquivo .xlsx com dados da vaga preenchidos, checkboxes VML preservados e formatação original do template intacta
result: partial — preenchimento de campos de texto melhorou bastante após correção do CELL_MAPPING; checkboxes e datas ainda com problemas (ver GAP-05..10)

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

## Summary

total: 5
passed: 4
issues: 1
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
status: partial
severity: critical
description: Mapeamento CELL_MAPPING foi corrigido com endereços reais dos exemplos. Campos de texto melhoraram. Persistem problemas com checkboxes VML (não limpam seleções anteriores), datas em ISO e campos ausentes — ver GAP-05..10.
fix: Endereços corrigidos em 03-07. Problemas residuais registrados em GAP-05..10.

### GAP-05 — Horário de trabalho: estrutura de dados inadequada para checkboxes
status: failed
severity: major
description: O campo workSchedule armazena apenas texto livre (para a opção "Outros"), mas o template tem 2 checkboxes fixos ("08h-17h", "09h-18h") mais um campo de texto para "Outros". O JSON e a tela precisam representar os 3 estados: opção1, opção2 ou texto-livre. O gerador precisa saber qual checkbox marcar e qual célula de texto preencher.
fix: Revisar tipo de workSchedule no JSON (enum + campo opcional); ajustar tela de criação/edição de vaga; atualizar excel-generator.ts para marcar o checkbox correto via VML e preencher célula de texto somente quando "Outros".
area: json-schema + ui + excel-generator

### GAP-06 — Data de abertura da vaga não preenchida no Excel
status: failed
severity: minor
description: O template tem um campo "Data" (intervalo AH4:AK4) que representa a data de abertura da vaga. Esse campo não está sendo preenchido pelo gerador.
fix: Identificar se a data de abertura está em `Vacancy` (ou criar campo `openedAt`); adicionar AH4 ao CELL_MAPPING; formatar como DD/MM/YYYY.
area: excel-generator

### GAP-07 — Modalidade de trabalho: checkboxes invertidos no Excel
status: failed
severity: major
description: Ao escolher "Presencial", o checkbox de presencial ficou desmarcado e os outros 2 ficaram marcados. O gerador provavelmente está marcando células erradas ou usando lógica invertida para o VML dos checkboxes de modalidade.
fix: Mapear células VML corretas para cada opção de modalidade (Presencial / Remoto / Híbrido); garantir que o gerador desmarca as outras opções antes de marcar a escolhida.
area: excel-generator

### GAP-08 — Datas em formato ISO em vez de DD/MM/YYYY
status: failed
severity: minor
description: Campos de data (data prevista de contratação, data de abertura) estão sendo escritos no formato ISO (YYYY-MM-DD). O template espera DD/MM/YYYY. Aplica-se a todas as datas do formulário.
fix: Adicionar formatador de data em excel-generator.ts: `toExcelDate(isoStr: string): string` que converte para DD/MM/YYYY antes de inserir nas células.
area: excel-generator

### GAP-09 — Tempo de experiência: múltiplos checkboxes marcados simultaneamente
status: failed
severity: major
description: Ao marcar "5-10 anos" no perfil, o gerador também marcou "3-5 anos". Indica que o gerador não limpa as seleções anteriores do checkbox group antes de marcar a opção correta. Problema de resíduo do template.
fix: Investigar se os checkboxes VML têm estado inicial não-zero no template. O gerador precisa desmarcar todas as células do grupo antes de marcar a correta. Alternativa: garantir que o template original tem todos os checkboxes do grupo desmarcados.
area: excel-generator

### GAP-10 — Idiomas: múltiplos checkboxes marcados simultaneamente
status: failed
severity: major
description: Os campos de nível de idioma (inglês, espanhol) estão com mais de um checkbox marcado ao mesmo tempo. Mesmo problema do GAP-09 — o gerador não limpa o grupo antes de marcar a opção escolhida.
fix: Mesmo padrão do GAP-09: desmarcar todas as opções do grupo de idioma antes de marcar o nível correto. Mapear todas as células de checkbox de cada grupo de idioma.
area: excel-generator

### GAP-11 — UI da página de vaga: alinhamento das seções Status e Formulário GH
status: failed
severity: minor
description: Na página de edição (e possivelmente criação), as seções "Status da vaga" e "Formulário GH" ficam desalinhadas à esquerda em relação ao formulário principal porque parecem estar fora do card invisível que contém os campos. O operador quer: (1) unir essas 2 seções lado a lado numa seção única; (2) avaliar se o card do formulário deveria ter alguma cor fraca de fundo para evidenciar o container.
fix: Revisar layout de edit/page.tsx e new/page.tsx. Colocar as seções de Status e Formulário GH dentro do mesmo container visual do formulário. Criar seção "Ações" lado a lado (flex). Avaliar cor de fundo fraca para o card do formulário (ex: bg-surface-variant/10 ou similar).
area: ui

### GAP-12 — Mover campos de perfil e vaga para configurações de área
status: failed
severity: major
description: Vários campos que sempre têm valor fixo por área devem sair do perfil/vaga e ir para Configurações da Área, porque o gestor preenche uma vez e reutiliza. Da parte de Perfil: campos de idioma (inglês, espanhol, outros), informações complementares, toda a seção de Infraestrutura (sistemas necessários, pastas de rede). Da parte de Vaga: centro de custo, horário de trabalho, modalidade de trabalho, disponibilidade para viagens. O impacto é amplo: schema JSON, telas de perfil, telas de vaga, tela de configurações e lógica de geração do Excel.
fix: Planejamento dedicado: (1) mover campos para AreaSettings no schema; (2) remover dos formulários de perfil e vaga; (3) adicionar à tela de configurações; (4) ajustar geração do Excel para ler de settings em vez de profile/vacancy.
area: json-schema + ui + excel-generator
