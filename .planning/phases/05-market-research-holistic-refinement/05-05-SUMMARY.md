---
phase: 05-market-research-holistic-refinement
plan: "05"
subsystem: settings
status: complete
tags: [aiProfileInstructions, socratic-discussion, pd-lyceum, settings]

# Dependency graph
requires:
  - phase: 05-03
    provides: "skill /pesquisar-mercado disponível — contexto de como profileHints serão usados"

provides:
  - "aiProfileInstructions da área P&D/Lyceum persistido em settings.json (7 parágrafos, ~400 palavras)"
  - "Template de perguntas socrático reutilizável para outras áreas"
  - "Decisões sobre vetores do perfil P&D: autonomia, POC, early adopter, open source, multiplicador"

affects:
  - refinar-perfil (aiProfileInstructions é injetado em todos os prompts dos Steps 3-4)
  - 05-06 (piloto usará o valor persistido para validar qualidade das sugestões)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "aiProfileInstructions como 'alma do perfil' — não descritivo de cargo, mas traços comportamentais e técnicos"
    - "Discussão socrática em 4 blocos como processo de elicitação de conhecimento tácito"

key-files:
  created: []
  modified:
    - "data/settings.json (repositório de dados hiring-pipeline-data)"

key-decisions:
  - "aiProfileInstructions descreve 'quem prospera em P&D', não um cargo — foco em traços, não atribuições"
  - "Early adopter / beta tester adicionado como traço central — não pode ficar parado no tempo"
  - "Colaboração open source incluída como sinal do traço multiplicador, não como obrigação"
  - "LLMs para Sênior+ é praticamente eliminatório — não apenas diferencial"
  - "TypeScript é extra dispensável para backend clássico — Java é mandatório, Python é secundário"

requirements-completed:
  - IA-03

# Metrics
duration: 25min
completed: "2026-04-22"
---

# Phase 05, Plan 05: aiProfileInstructions P&D/Lyceum — Summary

**Discussão socrática em 4 blocos com o gestor resultou no aiProfileInstructions da área P&D/Lyceum — 7 parágrafos descrevendo a "alma" de quem prospera na equipe, persistido via /settings da web app**

## Performance

- **Duration:** ~25 min (discussão socrática + iteração + persistência)
- **Tasks:** 2/2 (Task 1: discussão socrática aprovada; Task 2: persistido via /settings)
- **Files modified:** 1 (data/settings.json — repositório de dados)

## Valor Final: aiProfileInstructions

```
O perfil de P&D não é um cargo fixo — é um conjunto de características que define quem prospera numa equipe pequena de alta autonomia, voltada a exploração, experimentação e transferência de conhecimento.

O profissional de P&D é antes de tudo um problem-solver autônomo: recebe uma missão, vai atrás do que falta, monta hipóteses quando as informações não estão disponíveis e entrega sem esperar spec completa ou direção externa. Travar no primeiro imprevisto e aguardar que a solução venha de outro lugar é sinal eliminatório — avançar sob ambiguidade é central ao papel.

O ritmo real é ~50% POC (que envolve codar), ~30% arquitetura e ~20% consultoria a outros times. A pessoa pensa e executa no mesmo movimento: não é arquiteto que delega implementação nem executor que aguarda design. Construir múltiplas POCs, apresentar, absorver feedback, validar regras de negócio com stakeholders ao longo do processo e iterar até MVP é mais valorizado do que ter participado de grandes projetos como executor.

Stack: base sólida em Java é mandatória. Python no nível "sabe usar" é esperado. TypeScript é extra — relevante para fullstack moderno, dispensável para backend clássico. Para cargos Sênior+, uso de IA generativa no nível "instrumento repositórios para viabilizar uso de IA pelas equipes, sei construir com LLMs e agentes" é praticamente mandatório. Candidato Sênior sem exposição real a LLMs é praticamente eliminatório.

O perfil exige curiosidade genuína e rigor conceitual — entender "como funciona" de verdade, não só "como usar". Esse traço vem acompanhado de uma postura de early adopter natural: acompanha novidades, testa ferramentas em beta, experimenta antes de todo mundo. Não fica parado no tempo — mantém antena ligada ao ecossistema e traz o que é relevante para o time.

Multiplicador e colaborador: não é ilha de sabedoria. Explica, documenta, treina e eleva o nível técnico dos outros times ativamente — é fonte de aculturamento, não apenas de entrega. Esse perfil também contribui naturalmente para o ecossistema aberto: quando usa uma ferramenta, vê potencial de melhoria e contribui para a comunidade sem esperar retorno direto. Colaboração com open source não é obrigação, é sinal do traço.

Red flags claros: seniority apenas por anos de estrada ou portfólio de grandes projetos como executor; congelamento no primeiro imprevisto; dependência de outros para resolver bloqueios; foco exclusivo em uma linguagem sem abertura ao stack tri-linguagem; ausência de interesse em IA generativa para Sênior+; postura de consumidor passivo de tecnologia sem nunca contribuir de volta ou se atualizar.
```

## Template de Perguntas Socrático (reutilizável para outras áreas)

### Bloco 1 — Tipo de trabalho e ritmo
1. "O engenheiro desta área em um dia típico está mais codando features, explorando POCs ou arquitetando sistemas? Como é a proporção real?"
2. "Quando a sprint começa sem spec completa — o que você espera que a pessoa faça? Paralisa, vai atrás de clareza, avança com hipótese?"
3. "Me conta de um projeto recente em que a pessoa fez algo que te surpreendeu positivamente. O que ela fez de diferente?"

### Bloco 2 — Stack e IA
4. "Quais linguagens/tecnologias são mandatórias vs. opcionais nesta área?"
5. "Para alguém Sênior hoje, experiência com IA generativa significa o quê na prática para esta área?"
6. "Candidato Sênior forte tecnicamente mas sem exposição a LLMs — eliminatório ou ajustável?"

### Bloco 3 — Cultura e red flags
7. "Último candidato ou contratado que não funcionou. O que faltou?"
8. "Qual o sinal mais claro de que alguém não vai prosperar aqui?"
9. "O que diferencia alguém desta área de um Sênior de produto mainstream?"

### Bloco 4 — Validação do draft
10. Rascunhar aiProfileInstructions com base nos Blocos 1-3
11. Mostrar ao gestor: "Este texto reflete a área? O que está faltando ou impreciso?"
12. Iterar até aprovação

**Critérios de qualidade do valor final:**
- Descreve traços e comportamentos, não atribuições de cargo
- Menciona explicitamente: stack esperado, postura frente a ambiguidade, relação com IA
- Inclui pelo menos 1 red flag claro
- Não foca no domínio do produto — foca no tipo de pessoa
- Mínimo 200 palavras (densidade suficiente para orientar a IA)

## Decisões da Discussão

| Vetor | Decisão | Origem |
|-------|---------|--------|
| Proporção de trabalho | 50% POC, 30% arquitetura, 20% consultoria | Resposta direta do gestor |
| Autonomia | "Ninja" — missão individual, sem dependência de outros | Bloco 1, pergunta 2 |
| Early adopter | Traço central — não pode ficar parado no tempo | Adicionado no refinamento |
| Open source | Sinal do traço multiplicador, não obrigação | Adicionado no refinamento |
| TypeScript | Extra — dispensável para backend clássico | Bloco 2, pergunta 4 |
| LLMs para Sênior+ | Praticamente eliminatório | Bloco 2, pergunta 6 |
| Anti-perfil central | Executor que trava no imprevisto e aguarda solução externa | Bloco 3 |

## Issues Encountered

Nenhum. A discussão socrática foi conduzida fluidamente — o gestor respondeu os 3 blocos de forma direta e forneceu adições espontâneas (early adopter, open source) que enriqueceram o draft sem contradizer os vetores do D-23.

---
*Phase: 05-market-research-holistic-refinement*
*Completed: 2026-04-22*
