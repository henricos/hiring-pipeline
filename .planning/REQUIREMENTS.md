# Requirements: Hiring Pipeline

**Defined:** 2026-04-19
**Core Value:** Transformar o processo fragmentado em fluxo assistido, reaproveitável e rastreável — abrindo vagas mais rápido e triando candidatos com mais consistência.

## v1 Requirements

### Perfis de Vaga

- [x] **PROF-01**: Gestor pode criar um perfil-base de vaga com título, descrição, responsabilidades e observações internas ✓ Phase 2
- [x] **PROF-02**: Gestor pode definir requisitos obrigatórios, desejáveis, habilidades técnicas e competências comportamentais no perfil ✓ Phase 2
- [x] **PROF-03**: Gestor pode definir critérios de avaliação associados ao perfil ✓ Phase 2
- [x] **PROF-04**: Gestor pode listar e editar perfis existentes ✓ Phase 2 (busca deferida — D-06)
- [x] **PROF-05**: Gestor pode definir texto descritivo da vaga (para publicação externa) no perfil ✓ Phase 2

### IA — Criação de Perfis

- [x] **IA-01**: Agente de IA pode sugerir requisitos e habilidades com base no título e contexto da vaga
- [x] **IA-02**: Agente de IA pode melhorar a redação da descrição da vaga
- [x] **IA-03**: Agente de IA adapta textos para o contexto da área de P&D/Lyceum

### Abertura de Vagas

- [ ] **VAG-01**: Gestor pode abrir uma vaga selecionando um perfil existente e complementando com dados específicos (quantidade, salário, centro de custo, urgência, projeto)
- [ ] **VAG-02**: Gestor pode fornecer dados complementares da vaga em linguagem natural via agente conversacional
- [ ] **VAG-03**: Sistema gera formulário GH preenchido em .xlsx a partir dos dados da vaga
- [ ] **VAG-04**: Gestor pode listar e acompanhar vagas abertas com status atual

### Infraestrutura e Aplicação

- [ ] **APP-01**: Aplicação protegida por autenticação single-user via next-auth (credenciais em variáveis de ambiente)
- [ ] **APP-02**: Aplicação acessível via base path configurável (padrão `/hiring-pipeline`)

## v2 Requirements

### Gestão de Candidatos

- **CAND-01**: Gestor pode registrar shortlists de candidatos por vaga
- **CAND-02**: Gestor pode associar currículo (arquivo ou link) a cada candidato
- **CAND-03**: IA apoia triagem de candidatos com base nos critérios da vaga
- **CAND-04**: Gestor pode registrar decisão (avançar/recusar) e justificativa por candidato
- **CAND-05**: IA sugere justificativa de recusa para candidatos não aderentes ao perfil

### Entrevistas e Decisão Final

- **ENT-01**: Gestor pode registrar entrevista com data, entrevistadores e percepções via agente conversacional
- **ENT-02**: Gestor pode registrar pontos fortes, fracos, riscos e nota por candidato
- **ENT-03**: Interface web exibe comparação estruturada entre candidatos entrevistados
- **ENT-04**: Gestor pode registrar recomendação e decisão final

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gestão contínua de equipe | Fora do foco de recrutamento do v1 — expansão futura mapeada |
| Integração direta com Gupy/ATS | Export manual do Excel é suficiente para v1 |
| App mobile | Web-first; mobile como evolução futura |
| Multi-usuário | Ferramenta pessoal do gestor; auth single-user cobre o caso |
| Chat em tempo real com consultoria | Email permanece para comunicação externa no v1 |
| LLM integrado nativamente na web app | v1 usa agentes CLI externos; integração nativa na segunda onda |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| APP-01 | Phase 1 | Pending |
| APP-02 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Complete ✓ 2026-04-20 |
| PROF-02 | Phase 2 | Complete ✓ 2026-04-20 |
| PROF-03 | Phase 2 | Complete ✓ 2026-04-20 |
| PROF-04 | Phase 2 | Complete ✓ 2026-04-20 (busca deferida D-06) |
| PROF-05 | Phase 2 | Complete ✓ 2026-04-20 |
| IA-01 | Phase 3 | Complete |
| IA-02 | Phase 3 | Complete |
| IA-03 | Phase 3 | Complete |
| VAG-01 | Phase 4 | Pending |
| VAG-02 | Phase 4 | Pending |
| VAG-03 | Phase 4 | Pending |
| VAG-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 after initial definition*
