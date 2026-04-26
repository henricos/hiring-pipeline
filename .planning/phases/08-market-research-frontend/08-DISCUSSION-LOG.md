# Phase 8: Market Research Frontend - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 08-market-research-frontend
**Areas discussed:** Navegação ao detalhe, Detalhes de uma pesquisa (VIZ-03), Profundidade do Resumo de Mercado, Aba Perfil

---

## Navegação ao detalhe

| Option | Description | Selected |
|--------|-------------|----------|
| Click no card abre detalhe | Click no card navega para /profiles/[id]; botões editar/deletar permanecem no card | ✓ |
| Nova rota /profiles/[id]/view | Rota irmã separada; lista mantém fluxo atual com botão "ver detalhes" | |

**User's choice:** Click no card abre detalhe  
**Notes:** Botões de editar e deletar permanecem visíveis no card da lista. /profiles/[id]/edit mantido sem alteração.

---

## Detalhes de uma pesquisa (VIZ-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Expansão inline | Linha expande abaixo mostrando vagas brutas; sem sair da página | ✓ |
| Modal / drawer | Painel lateral (sheet) com vagas do arquivo selecionado | |
| Subpágina /research/[date] | Navega para página separada com visualização completa | |

**User's choice:** Expansão inline  
**Notes:** Cada linha da lista de pesquisas expande inline ao clicar, revelando vagas brutas (título, empresa, porte, stack, snippet).

---

## Profundidade do Resumo de Mercado

| Option | Description | Selected |
|--------|-------------|----------|
| Curado — campos essenciais | Faixa salarial, stackFrequency top 10, emergingStack, profileHints, archetypes | |
| Completo — todos os campos | commonTitles, titleAliases, stackFrequency completo, behaviors, challenges, archetypes, emergingStack, profileHints, salaryRange, salaryGuide | ✓ |

**User's choice:** Completo — todos os campos  
**Notes:** Exibir todos os campos do -resumo.json. stackFrequency como lista ranqueada (sem gráfico).

---

## Aba Perfil — leitura ou edição

| Option | Description | Selected |
|--------|-------------|----------|
| Visão leitura + botão editar | Campos do perfil em modo leitura por seções; botão "Editar" navega para /edit | ✓ |
| Apenas link para editar | Aba minimal com título e botão proeminente "Editar perfil" | |

**User's choice:** Visão leitura + botão editar  
**Notes:** Renderizar seções (Responsabilidades, Qualificações com badges obrigatório/desejável, Competências, Desafios). Seções vazias omitidas.

---

## Claude's Discretion

- Instalação do componente tabs via shadcn CLI
- Accordion único ou múltiplo na aba Vagas
- Seletor de data na aba Resumo (select simples ou botões)
- Estrutura do Server Action / repositório de pesquisas

## Deferred Ideas

- Comparação longitudinal de pesquisas (tendência ao longo do tempo)
- Re-execução de /pesquisar-mercado via UI
- Exportação do Resumo de Mercado (PDF/texto)
