# Phase 5: Market Research & Holistic Profile Refinement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 05-market-research-holistic-refinement
**Mode:** discuss (--analyse)
**Areas discussed:** Validade das pesquisas, Step 5 holístico — formato, Portais prioritários para 05-01, aiProfileInstructions — conteúdo inicial

---

## Validade das pesquisas

| Opção | Descrição | Selecionada |
|-------|-----------|-------------|
| Aviso soft com data | Exibe lista com data legível (ex: "3 dias atrás"). Gestor decide se usa. Sem bloqueio. | ✓ |
| Sem indicação de idade | Lista simples por nome de arquivo. Gestor lê a data pelo nome do slug. | |
| Aviso > 60 dias | Pesquisas com mais de 60 dias recebem [DESATUALIZADA] no nome. | |

**Escolha do gestor:** Aviso soft com data legível
**Notes:** Ferramenta pessoal — bloquear seria paternalista. Gestor tem autonomia para usar pesquisa antiga se quiser.

---

## Step 5 holístico — formato

### Formato de apresentação

| Opção | Descrição | Selecionada |
|-------|-----------|-------------|
| Lista numerada + A/I/J por item | Mesmo padrão do Step 4. Item por item com aceitar/ignorar/ajustar. | ✓ |
| Bloco de diagnóstico + aceitar/pular tudo | IA emite parágrafo. Gestor aceita ou ignora globalmente. | |
| Diff por campo | Para cada campo com problema, mostra ANTES vs. DEPOIS sugerido. | |

**Escolha do gestor:** Lista numerada + A/I/J por item (preserva consistência com Step 4)

### Tipos de incoerência a detectar

| Tipo | Selecionado |
|------|-------------|
| Lacunas responsabilidades × qualificações | ✓ |
| Redundâncias entre campos | ✓ |
| Descalibração título × conteúdo | ✓ |
| Lacunas comportamentais | ✓ |

**Escolha do gestor:** Todos os 4 tipos

### Limite de findings

| Opção | Selecionada |
|-------|-------------|
| Máximo 5 findings | |
| Sem limite | ✓ |
| Máximo 3 findings | |

**Escolha do gestor:** Sem limite — IA lista tudo que encontrar; gestor decide o que resolver.

---

## Portais prioritários para 05-01

### Portais de prioridade alta

| Portal | Selecionado |
|--------|-------------|
| Gupy via Google (`site:gupy.io`) | ✓ |
| LinkedIn via Google (`site:linkedin.com/jobs`) | ✓ |
| vagas.com.br | ✓ |
| Glassdoor BR | |
| InfoJobs BR | ✓ (via nota livre) |

**Escolha do gestor:** Gupy + LinkedIn + vagas.com.br + InfoJobs BR como prioridade alta; Glassdoor como best-effort.

### Formato de queries

| Opção | Selecionada |
|-------|-------------|
| Português | |
| Inglês | |
| Misto (ambas) | ✓ |

**Escolha do gestor:** Misto PT+EN — 05-01 testa ambos e documenta qual retorna mais cobertura para cargos P&D em SP.

---

## aiProfileInstructions — conteúdo inicial

### Arquétipo principal para P&D/Lyceum

| Opção | Selecionada |
|-------|-------------|
| Evangelizador/POC-driver | |
| Arquiteto técnico | |
| Engenheiro de produto | |
| Misto dos três (depende do cargo) | ✓ |

**Escolha do gestor:** Misto — proporção varia por seniority e papel específico.

### Contexto de domínio a enfatizar

| Domínio | Selecionado |
|---------|-------------|
| EdTech / ensino superior | |
| IA generativa aplicada | ✓ |
| Stack específica (Java + Python + TS) | ✓ |
| Cultura de experimentação / POC | ✓ |

**Escolha do gestor:** IA generativa + POC + tri-stack. EdTech **não selecionado** — o contexto de produto é implícito; o valor do campo está em orientar o tipo de engenheiro.

### Red flags a sinalizar

| Red Flag | Selecionado |
|----------|-------------|
| Foco exclusivo em uma tech só | ✓ |
| Ausência de produtos próprios/open source | |
| Sem experiência com LLMs/APIs de IA | ✓ |
| Preferência por specs 100% antes de codar | |

**Escolha do gestor:** Mono-tech + ausência de experiência LLM (para Sênior+, relevante a partir de 2025/2026).

---

## Claude's Discretion

- Estrutura exata do system prompt da `/pesquisar-mercado`
- Heurística de priorização de WebFetch quando há mais candidatos do que profundidade permite
- Roteiro detalhado da discussão socrática em 05-04 (guiado pelos vetores de D-23)

---

*Discussion conducted: 2026-04-21*
*Mode: discuss --analyse (trade-off analysis por área)*
